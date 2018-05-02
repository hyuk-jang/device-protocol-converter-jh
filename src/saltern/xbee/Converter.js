const _ = require('lodash');
const xbee_api = require('xbee-api');

const {
  BU
} = require('base-util-jh');
const ProtocolConverter = require('../../default/ProtocolConverter');
const protocol = require('./protocol');


require('../../format/define');
require('./define');

class Converter extends ProtocolConverter {
  /** @param {protocolConstructorConfig} config */
  constructor(config) {
    super();
    this.config = config;
    this.encodingTable = protocol.encodingProtocolTable;
    this.decodingTable = protocol.decodingProtocolTable(this.config.deviceId);

    this.xbeeAPI = new xbee_api.XBeeAPI();
    this.frameIdList = [];

    /** baseFormat Guide Line */
    this.baseFormat = require('../baseFormat');
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
    BU.CLI(generationInfo);
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
  parsingUpdateData(dcData){
    let requestData = this.getCurrTransferCmd(dcData);
    /** @type {xbeeApi_0x8B|xbeeApi_0x90} */
    let responseData = dcData.data;
    /** @type {parsingResultFormat} */
    const returnValue = {};
    // 해당 프로토콜에서 생성된 명령인지 체크
    switch (responseData.type) {
    case 0x88:
      return this.processDataResponseAT();
    case 0x90:
      return this.processDataReceivePacketZigBee(dcData.data);
    default:
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
    BU.CLI(xbeeApi_0x90);
    const data = xbeeApi_0x90.data;

    let STX = _.head(data);

    // STX 체크 (# 문자 동일 체크)
    if(_.isEqual(STX, 0x23)){

    } else {
      throw new Error('STX가 일치하지 않습니다.');
    }





  }


  decodingWaterDoor(){

  }

  decodingValve(){

  }

  decodingPump(){

  }

  getProtocolValue(findKey) {
    let findObj = protocol.find((obj) => {
      return obj.key === findKey;
    });

    if (findObj === undefined || findObj == null) {
      findObj.value = '';
    } else {
      findObj.value;
    }
    return findObj;
  }


}
module.exports = Converter;