const _ = require('lodash');
const xbee_api = require('xbee-api');

const {
  BU
} = require('base-util-jh');
const ProtocolConverter = require('../../default/ProtocolConverter');
const protocol = require('./protocol');


require('../../format/defaultDefine');
require('./define');
const baseFormat = require('../baseFormat');

// const Model = require('./Model');
// const model = new Model();

class Converter extends ProtocolConverter {
  /** @param {protocol_info} config */
  constructor(config) {
    super();
    this.config = config;
    this.decodingTable = protocol.decodingProtocolTable(this.config.deviceId);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;
    this.xbeeAPI = new xbee_api.XBeeAPI();
    this.frameIdList = [];

    /** baseFormat Guide Line */
    this.baseFormat = baseFormat;
    // BU.CLI(this.baseFormat);
  }

  /**
   * 스마트 염전 데이터 기본 가이드
   */
  getDefaultValue() {
    return _.cloneDeep(this.baseFormat);
  }


  /**
   * 장치를 조회 및 제어하기 위한 명령 생성. 
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {{cmd: string, cmdList: Array.<{cmd: string, timeout: number=}>}} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {Array.<commandInfo>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    // BU.CLI(generationInfo);
    /** @type {Array.<commandInfo>} */
    const returnValue = [];
    if (_.isArray(generationInfo.cmdList)) {
      generationInfo.cmdList.forEach(cmdInfo => {
        /** @type {commandInfo} */
        const commandObj = {};
        const frameId = this.xbeeAPI.nextFrameId();
        /** @type {xbeeApi_0x10} */
        let frameObj = {
          type: 0x10,
          id: frameId,
          destination64: this.config.deviceId,
          data: cmdInfo.cmd,
        };
        commandObj.data = frameObj;
        commandObj.commandExecutionTimeoutMs = 1000;
        commandObj.delayExecutionTimeoutMs = _.isNumber(cmdInfo.timeout) && cmdInfo.timeout;
        returnValue.push(commandObj);
      });
    } else {
      /** @type {commandInfo} */
      const commandObj = {};
      const frameId = this.xbeeAPI.nextFrameId();
      /** @type {xbeeApi_0x10} */
      let frameObj = {
        type: 0x10,
        id: frameId,
        destination64: this.config.deviceId,
        data: generationInfo.cmd,
      };
      commandObj.data = frameObj;
      commandObj.commandExecutionTimeoutMs = 1000;
      returnValue.push(commandObj);
    }

    return returnValue;
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  parsingUpdateData(dcData) {
    const returnValue = {};
    try {
      /** @type {parsingResultFormat} */
      /** @type {xbeeApi_0x8B|xbeeApi_0x90} */
      let responseData = dcData.data;
      // 해당 프로토콜에서 생성된 명령인지 체크
      switch (responseData.type) {
      case 0x88:
        return this.processDataResponseAT();
      case 0x90:
        returnValue.data = this.processDataReceivePacketZigBee(dcData.data);
        break;
      default:
        return returnValue;
      }
      returnValue.eventCode = this.definedCommanderResponse.DONE;
      return returnValue;
    } catch (error) {
      returnValue.eventCode = this.definedCommanderResponse.ERROR;
      returnValue.data = error;
      return returnValue;
    }
  }


  /**
   * 
   * @param {xbeeApi_0x88} xbeeApi_0x88 
   */
  processDataResponseAT(xbeeApi_0x88) {

  }

  /**
   * 
   * @param {xbeeApi_0x90} xbeeApi_0x90 
   */
  processDataReceivePacketZigBee(xbeeApi_0x90) {
    // BU.CLI(xbeeApi_0x90);
    const data = xbeeApi_0x90.data;

    let STX = _.nth(data, 0);
    // STX 체크 (# 문자 동일 체크)
    if (_.isEqual(STX, 0x23)) {
      // let boardId = data.slice(1, 5);
      let productType = data.slice(5, 9);
      let dataBody = data.slice(9);

      let decodingDataList;
      if (_.isBuffer(productType)) {
        productType = this.convertBufToHexToDec(productType);

        switch (productType) {
        case 1:
          decodingDataList = this.decodingTable.gateLevelSalinity;
          break;
        case 2:
          decodingDataList = this.decodingTable.valve;
          break;
        case 3:
          decodingDataList = this.decodingTable.pump;
          break;
        default:
          throw new Error(`productType: ${productType}은 Parsing 대상이 아닙니다.`);
        }

        BU.CLI(decodingDataList.decodingDataList);
        const hasValid = _.chain(decodingDataList.decodingDataList).map('byte').sum().isEqual(dataBody.length).value();
        if (!hasValid) {
          throw new Error(`데이터의 길이(${dataBody.length})가 맞지 않습니다.`);
        }
        try {
          return this.automaticDecoding(decodingDataList.decodingDataList, dataBody);
        } catch (error) {
          throw error;
        }
      } else {
        throw new Error(`productType: ${productType}이 이상합니다.`);
      }
    } else {
      throw new Error('STX가 일치하지 않습니다.');
    }
  }

  /**
   * decondigInfo 리스트 만큼 Data 파싱을 진행
   * @param {Array.<decondigInfo>} decodingTable 
   * @param {Buffer} data 
   */
  automaticDecoding(decodingTable, data) {
    try {
      // 데이터를 집어넣을 기본 자료형을 가져옴
      let returnValue = this.getDefaultValue();
      // 도출된 자료가 2차 가공(ex: 0 -> Open, 1 -> Close )이 필요한 경우
      const operationKeys = _.keys(this.onDeviceOperationStatus);
      let startIndex = 0;
      decodingTable.forEach(decodingInfo => {
        // 조회할 데이터를 가져옴
        let thisBuf = data.slice(startIndex, startIndex + decodingInfo.byte);
        // 사용하는 메소드를 호출
        let convertValue = this[decodingInfo.callMethod](thisBuf);
        // 2차 가공 여부에 따라 변환
        if (_.includes(operationKeys, decodingInfo.key)) {
          const operationStauts = this.onDeviceOperationStatus[decodingInfo.key];
          returnValue[decodingInfo.key] = operationStauts[convertValue];
        } else {
          returnValue[decodingInfo.key] = convertValue;
        }
        // index 증가
        startIndex += decodingInfo.byte;
      });
      return returnValue;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = Converter;