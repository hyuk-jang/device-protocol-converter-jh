const _ = require('lodash');
const xbee_api = require('xbee-api');

const {BU} = require('base-util-jh');
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
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성. 
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationCmdConfig} generationCmdConfig 각 Protocol Converter에 맞는 데이터
   * @return {Array.<generationCmdFormat>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationCmdConfig){
    let cmd = generationCmdConfig.cmdKey;
    let target = generationCmdConfig.target;
    /** @type {xbeeApi_0x10} */
    let returnValue = {
      type: 0x10,
      destination64: this.config.deviceId,
      data: _.chain(this.encodingTable[target]).find({requestCmd: cmd}).value()
    };


    return [returnValue];
  }

  /**
   * 데이터 분석 요청
   * @param {*} requestData 장치로 요청한 명령
   * @param {*} responseData 장치에서 수신한 데이터
   * @return {parsingResultFormat}
   */
  parsingUpdateData(requestData, responseData){
    /** @type {parsingResultFormat} */
    const returnvalue = {};


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