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
    return this.makeAutoGenerationCommand(cmdList);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
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
    let dataMap = this.automaticDecoding(this.decodingTable.DEFAULT.decodingDataList, dataBody);

    // 인버터에서 PV출력 및 GRID 출력을 주지 않으므로 계산하여 집어넣음
    // PV 전압
    const pvVol = _.chain(dataMap).get('pvVol').head().value();

    const pvVol2 = _.chain(dataMap).get('pvVol2').head().value();

    // PV 전류
    const pvAmp = _.chain(dataMap).get('pvAmp').head().value();

    // PV 전력
    if (_.isNumber(pvVol) && _.isNumber(pvAmp)) {
      let pvKw = pvVol * pvAmp * 0.001;
      // 1번째 전압과 2번째 전압의 수치가 같다면 DC 2 CH은 없는 것으로 판단함
      if (pvVol === pvVol2) {
        dataMap.pvKw.push(_.round(pvKw, 4));
      } else {
        pvKw += pvVol2 * pvAmp * 0.001;
        dataMap.pvKw.push(_.round(pvKw, 4));
      }
    }

    // GRID 전압
    const gridRsVol = _.chain(dataMap).get('gridRsVol').head().value();

    // GRID 전류
    const gridRAmp = _.chain(dataMap).get('gridRAmp').head().value();

    // GRID 전력
    if (_.isNumber(gridRsVol) && _.isNumber(gridRAmp)) {
      dataMap.powerGridKw.push(_.round(gridRsVol * gridRAmp * 0.001, 4));
    }

    // Trobule 목록을 하나로 합침
    dataMap.operTroubleList = [_.flatten(dataMap.operTroubleList)];

    // 만약 인버터가 운영중인 데이터가 아니라면 현재 데이터를 무시한다.
    if (_.eq(_.head(dataMap.operIsRun), 0)) {
      dataMap = this.model.BASE_MODEL;
    }

    return dataMap;
  }

  /**
   *
   * @param {Buffer} deviceData
   */
  testParsingData(deviceData) {
    BU.CLI(deviceData);
    const RES_DATA_START_POINT = 3;
    let returnValue = this.model.BASE_MODEL;
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
        if (_.eq(callMethod, 'convertBufToReadInt')) {
          const option = {
            isLE,
            isUnsigned,
          };
          convertValue = this.protocolConverter.convertBufToReadInt(thisBuf, option);
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

    // 만약 인버터가 운영중인 데이터가 아니라면 현재 데이터를 무시한다.
    if (_.eq(_.head(returnValue.operIsRun), 0)) {
      returnValue = this.model.BASE_MODEL;
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
}
