const _ = require('lodash');

const { BU } = require('base-util-jh');
const AbstConverter = require('../../Default/AbstConverter');
const protocol = require('./protocol');

const Model = require('./Model');

const { BASE_KEY } = Model;

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
    return this.makeAutoGenerationCommand(cmdList, generationInfo);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    try {
      // BU.CLI('currTransferCmd', currTransferCmd);
      // 0: Header1 1: Header2, 2: StationID
      const RES_DATA_START_POINT = 3;
      const resId = deviceData.readInt8(2);
      const reqId = currTransferCmd.readInt8(2);
      const resChkSum = deviceData.slice(deviceData.length - 1);

      // 전송 데이터 유효성 체크
      if (deviceData.length !== 32) {
        throw new Error(`The expected length(32) 
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
        // throw new Error(`Not Matching Check Sum: ${calcChkSum}, Res Check Sum: ${resChkSum}`);
      }

      // 헤더와 체크섬을 제외한 데이터 계산
      const dataBody = deviceData.slice(RES_DATA_START_POINT, deviceData.length - 1);
      // BU.CLI(dataBody);

      // 데이터 자동 산정
      /** @type {BASE_KEY} */
      const dataMap = this.automaticDecoding(this.decodingTable.DEFAULT.decodingDataList, dataBody);

      // 인버터에서 PV출력 및 GRID 출력을 주지 않으므로 계산하여 집어넣음
      // PV 전압
      const pvVol = _.chain(dataMap)
        .get('pvVol')
        .head()
        .value();

      // PV 전류
      const pvAmp = _.chain(dataMap)
        .get('pvAmp')
        .head()
        .value();

      // PV 전력
      if (_.isNumber(pvVol) && _.isNumber(pvAmp)) {
        dataMap.pvKw.push(_.round(pvVol * pvAmp * 0.001, 4));
      }

      // GRID 전압
      const gridRsVol = _.chain(dataMap)
        .get('gridRsVol')
        .head()
        .value();

      // GRID 전류
      const gridRAmp = _.chain(dataMap)
        .get('gridRAmp')
        .head()
        .value();

      // GRID 전력
      if (_.isNumber(gridRsVol) && _.isNumber(gridRAmp)) {
        dataMap.powerGridKw.push(_.round(gridRsVol * gridRAmp * 0.001, 4));
      }

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
    const RES_DATA_START_POINT = 3;
    const returnValue = this.model.BASE_MODEL;
    const decodingTable = this.decodingTable.DEFAULT;
    // BU.CLI(decodingTable);
    const { decodingDataList } = decodingTable;

    // 시작주소부터 체크 시작
    const dataList = [];
    let currIndex = RES_DATA_START_POINT;
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

      // BU.CLI(thisBuf);

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
    deviceId: '\u002e',
    mainCategory: 'Inverter',
    subCategory: 'ESP3K5',
  });

  const requestData = Buffer.from([0x0a, 0x96, 0x01, 0x54, 0x18, 0x05, 0x6d]);

  const data = Buffer.from([
    0xb1,
    0xb7,
    0x01,
    0x15,
    0x0e,
    0x05,
    0x01,
    0x01,
    0x0e,
    0x9a,
    0x08,
    0xc8,
    0x01,
    0x60,
    0x01,
    0xff,
    0x00,
    0x9f,
    0x86,
    0x01,
    0x01,
    0x00,
    0x00,
    0x00,
    0x01,
    0x59,
    0x02,
    0x01,
    0x01,
    0x63,
    0x6e,
    0x9c,
  ]);

  const requestMsg = converter.generationCommand({
    key: converter.model.device.DEFAULT.KEY,
  });

  const dataList = ['0249b1b72e22070001220701111100e10001000010001000000000000000006313b803'];

  dataList.forEach(d => {
    const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');

    // const result = converter.testParsingData(realBuffer);
    // BU.CLI(result);
    const dataMap = converter.concreteParsingData(
      realBuffer,
      _.head(converter.generationCommand()).data,
    );
    BU.CLI(dataMap);
  });

  // BU.CLIN(converter.model);

  // converter.testParsingData(Buffer.from(dataList, 'ascii'));
}
