const _ = require('lodash');

const { BU } = require('base-util-jh');

const protocol = require('./protocol');
const Model = require('./Model');
const AbstConverter = require('../../Default/AbstConverter');

class Converter extends AbstConverter {
  /**
   * protocol_info.option --> true: 3.3kW, any: 600W
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super(protocolInfo);
    this.protocolInfo = protocolInfo;
    this.decodingTable = protocol.decodingProtocolTable(protocolInfo);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;

    /** BaseModel */
    this.model = new Model(protocolInfo);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {commandInfo[]} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    BU.CLI(generationInfo);
    const cmdList = this.defaultGenCMD(generationInfo);
    BU.CLI(cmdList);
    return this.makeDefaultCommandInfo(cmdList, 1000);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   * @return {parsingResultFormat}
   */
  concreteParsingData(deviceData, currTransferCmd) {
    try {
      // BU.CLI(dcData);
      // 요청한 명령 추출
      const requestData = currTransferCmd;
      // 응답 받은 데이터 추출
      const responseData = deviceData;

      // 요청한 주소 추출
      const reqAddr = this.model.getRequestAddr(requestData);
      // 응답받은 주소 추출
      const resAddr = this.model.getResponseAddr(responseData);

      // 비교
      if (reqAddr !== resAddr) {
        throw new Error(`Not Matching ReqAddr: ${reqAddr}, ResAddr: ${resAddr}`);
      }

      let decodingTable;
      switch (resAddr) {
        case 0:
          decodingTable = this.decodingTable.SYSTEM;
          break;
        case 1:
          decodingTable = this.decodingTable.PV;
          break;
        case 2:
          decodingTable = this.decodingTable.GRID_VOL;
          break;
        case 3:
          decodingTable = this.decodingTable.GRID_AMP;
          break;
        case 4:
          decodingTable = this.decodingTable.POWER;
          break;
        case 6:
          decodingTable = this.decodingTable.OPERATION;
          break;
        default:
          throw new Error(`Can not find it Addr ${resAddr}`);
      }

      // 응답받은 데이터가 정상적인지 검증하고 유효하다면 데이터 바디 추출
      const dataBody = this.model.getValidateData(responseData, decodingTable);
      return this.automaticDecoding(decodingTable.decodingDataList, dataBody);
    } catch (error) {
      throw error;
    }
  }

  // /**
  //  * @override
  //  * decodingInfo 리스트 만큼 Data 파싱을 진행
  //  * @param {decodingInfo[]} decodingTableList
  //  * @param {Buffer} data
  //  */
  // automaticDecoding(decodingTableList, data) {
  //   try {
  //     // 데이터를 집어넣을 기본 자료형을 가져옴
  //     const returnValue = Model.BASE_MODEL;
  //     // BU.CLI(returnValue);
  //     // 도출된 자료가 2차 가공(ex: 0 -> Run, 1 -> Stop )이 필요한 경우
  //     const operationKeys = _.keys(this.onDeviceOperationStatus);
  //     let startIndex = 0;
  //     decodingTableList.forEach(decodingInfo => {
  //       // 조회할 데이터를 가져옴
  //       const thisBuf = data.slice(startIndex, startIndex + decodingInfo.byte);
  //       // 사용하는 메소드를 호출 (parsing Method)
  //       let convertValue = this.protocolConverter[decodingInfo.callMethod](thisBuf);
  //       convertValue =
  //         _.isNumber(decodingInfo.scale) && _.isNumber(decodingInfo.fixed)
  //           ? _.round(convertValue * decodingInfo.scale, decodingInfo.fixed)
  //           : convertValue;
  //       // 2차 가공 여부에 따라 변환
  //       let realValue = convertValue;

  //       const decodingKey = _.get(decodingInfo, 'decodingKey')
  //         ? _.get(decodingInfo, 'decodingKey')
  //         : _.get(decodingInfo, 'key');

  //       // 2차 가공 여부에 따라 변환
  //       if (_.includes(operationKeys, decodingKey)) {
  //         const operationStauts = this.onDeviceOperationStatus[decodingKey];

  //         // 찾은 Decoding이 Function 이라면 값을 넘겨줌
  //         if (operationStauts instanceof Function) {
  //           const tempValue = operationStauts(convertValue);
  //           realValue = _.isNumber(tempValue) ? _.round(tempValue, decodingInfo.fixed) : tempValue;
  //         } else {
  //           realValue = _.get(operationStauts, convertValue);
  //         }
  //       }

  //       // 데이터 단위가 배열일 경우
  //       if (Array.isArray(returnValue[_.get(decodingInfo, 'key')])) {
  //         returnValue[_.get(decodingInfo, 'key')].push(realValue);
  //       } else {
  //         returnValue[_.get(decodingInfo, 'key')] = realValue;
  //       }

  //       // index 증가
  //       startIndex += decodingInfo.byte;
  //     });
  //     return returnValue;
  //   } catch (error) {
  //     throw error;
  //   }
  // }
}
module.exports = Converter;
