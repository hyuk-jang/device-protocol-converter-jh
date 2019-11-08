const _ = require('lodash');

const { BU } = require('base-util-jh');
const AbstConverter = require('../../Default/AbstConverter');
const protocol = require('./protocol');

const Model = require('./Model');

class Converter extends AbstConverter {
  /**
   * protocol_info.option --> true: 3.3kW, any: 600W
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super(protocolInfo);

    this.decodingTable = protocol.decodingProtocolTable(protocolInfo.deviceId);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;

    this.model = new Model(protocolInfo);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {commandInfo[]} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    // BU.CLI(generationInfo);
    const cmdList = this.defaultGenCMD(generationInfo);
    return this.makeAutoGenerationCommand(cmdList);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    try {
      // BU.CLI('currTransferCmd', deviceData);
      // 0: Header1 1: Header2, 2: StationID
      const RES_DATA_START_POINT = 3;
      const resId = deviceData.readInt8(2);
      const reqId = currTransferCmd.readInt8(2);
      const resChkSum = deviceData.slice(deviceData.length - 1);

      // 전송 데이터 유효성 체크
      if (deviceData.length !== 40) {
        throw new Error(`The expected length(40) 
        of the data body is different from the length(${deviceData.length}) received.`);
      }

      // 인버터 국번 비교
      if (!_.eq(reqId, resId)) {
        throw new Error(`Not Matching ReqAddr: ${reqId}, ResAddr: ${resId}`);
      }

      // 수신 받은 데이터 체크섬 계산
      const calcChkSum = this.protocolConverter.getXorBuffer(
        deviceData.slice(0, deviceData.length - 1),
      );

      // 체크섬 비교
      if (!_.isEqual(calcChkSum, resChkSum)) {
        throw new Error(`Not Matching Check Sum: ${calcChkSum}, Res Check Sum: ${resChkSum}`);
      }

      // 헤더와 체크섬을 제외한 데이터 계산
      const dataBody = deviceData.slice(RES_DATA_START_POINT, deviceData.length - 1);
      // BU.CLI(dataBody);

      // 데이터 자동 산정
      // /** @type {Model.BASE_KEY} */
      const dataMap = this.automaticDecoding(this.decodingTable.DEFAULT.decodingDataList, dataBody);

      // 동양 s5500k 누적 발전량 이상 문제 제거
      if (_.head(dataMap.powerCpKwh) === 0) {
        _.set(dataMap, 'powerCpKwh', [null]);
      }

      // PV 2가닥 데이터를 합산 처리
      _.set(dataMap, 'pvAmp', [_.sum(dataMap.pvAmp)]);
      _.set(dataMap, 'pvVol', [_.mean(dataMap.pvVol)]);
      _.set(dataMap, 'pvKw', [_.sum(dataMap.pvKw)]);

      // Trobule 목록을 하나로 합침
      dataMap.operTroubleList = [_.flatten(dataMap.operTroubleList)];

      return dataMap;
    } catch (error) {
      throw error;
    }
  }

  /**
   *
   * @param {Buffer} deviceData
   */
  testParsingData(deviceData) {
    BU.CLI(deviceData);

    const returnValue = this.model.BASE_MODEL;
    const decodingTable = this.decodingTable.DEFAULT;
    const { decodingDataList } = decodingTable;

    // 시작주소부터 체크 시작
    const dataList = [];
    let currIndex = 0;
    for (let index = 0; index < decodingDataList.length; index += 1) {
      // 해당 디코딩 정보 추출
      const decodingInfo = decodingDataList[index];
      const {
        byte = 1,
        key,
        decodingKey = key,
        callMethod,
        isLE = true,
        isUnsigned = true,
        fixed = 0,
        scale,
      } = decodingInfo;
      const thisBuf = deviceData.slice(currIndex, currIndex + byte);
      let convertValue;

      // 사용하는 메소드를 호출
      if (_.isString(callMethod)) {
        if (_.eq(callMethod, 'convertReadBuf')) {
          const option = {
            isLE,
            isUnsigned,
          };
          convertValue = this.protocolConverter.convertReadBuf(thisBuf, option);
        } else {
          convertValue = this.protocolConverter[callMethod](thisBuf);
        }

        if (_.isNumber(scale)) {
          convertValue = _.round(convertValue * scale, fixed);
        }

        // 변환키가 정의되어있는지 확인
        if (_.includes(_.keys(this.onDeviceOperationStatus), decodingKey)) {
          const operationStauts = this.onDeviceOperationStatus[decodingKey];
          // 찾은 Decoding이 Function 이라면 값을 넘겨줌
          if (operationStauts instanceof Function) {
            const tempValue = operationStauts(convertValue);
            convertValue = _.isNumber(tempValue) ? _.round(tempValue, fixed) : tempValue;
          } else {
            convertValue = _.get(operationStauts, convertValue);
          }
        }

        dataList.push(convertValue);
        returnValue[key].push(convertValue);
        // returnValue[key] = convertValue;
      }

      currIndex += byte;
    }

    // BU.CLI(dataList);
    BU.CLI(returnValue);
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: '\u000a',
    mainCategory: 'Inverter',
    subCategory: 's5500k',
  });

  // const testReqMsg = '02490a9640541805ac03';
  const testReqMsg = '02490a9641541805ad03';
  const realTestReqMsg = Buffer.from(testReqMsg.slice(4, testReqMsg.length - 2), 'hex');
  const dataList = [
    // '0249b1b540ed0a0b002100ec0a0d0025000000000000000000550e0000004601000000008000000000db03',
    '0249b1b5413c09a00236064709a80250067a09e504e20b5802e605002302910100ba430040000000009a03',
  ];

  dataList.forEach(d => {
    const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');

    // const result = converter.testParsingData(realBuffer);
    // BU.CLI(result);
    const dataMap = converter.concreteParsingData(realBuffer, realTestReqMsg);
    BU.CLI(dataMap);
  });

  // BU.CLIN(converter.model);

  // converter.testParsingData(Buffer.from(dataList, 'ascii'));
}
