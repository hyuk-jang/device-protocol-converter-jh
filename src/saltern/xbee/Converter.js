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
    this.frameIdList = [];
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성. 
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationCmdConfig} generationCmdConfig 각 Protocol Converter에 맞는 데이터
   * @return {Array.<xbeeApi_0x10>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationCmdConfig){
    let cmd = generationCmdConfig.cmdKey;
    let target = generationCmdConfig.target;
    const frameId = this.xbeeAPI.nextFrameId();


    const returnValue = [];


    const cmdList = [];

    let foundIt = _.find(this.encodingTable[target], {requestCmd: cmd});
    cmdList.push(_.get(foundIt, 'responseCmd')); 
    // 장치 제어를 하는 경우라면 
    if(foundIt.hasAction){
      cmdList.push(_.chain(this.encodingTable[target]).find({requestCmd: 'status'}).get('responseCmd').value());
    }




    /** @type {xbeeApi_0x10} */
    let frameObj = {
      type: 0x10,
      id: frameId,
      destination64: this.config.deviceId,
      data: _.chain(this.encodingTable[target]).find({requestCmd: cmd}).get('responseCmd').value()
    };
    // frameId가 생성되었다면 관리
    _.isNumber(frameId) && this.frameIdList.push(frameId);

    return [returnValue];
  }

  /**
   * 데이터 분석 요청
   * @param {xbeeApi_0x88|xbeeApi_0x8B|xbeeApi_0x90} requestData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  parsingUpdateData(requestData){
    /** @type {parsingResultFormat} */
    const returnValue = {};
    // 해당 프로토콜에서 생성된 명령인지 체크
    let hasFrameId = _.has(this.frameIdList, requestData.id);
    if(hasFrameId){
      switch (requestData.type) {
      case 0x88:
        return this.processDataResponseAT();
      case 0x8B:
        return this.processDataTransmitStatusZigBee();
      case 0x90:
        return this.processDataReceivePacketZigBee();
      default:
        return returnValue;
      }

    } else {
      throw new Error('Protocol Converter FrameId Not Corrected.');
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
   * @param {xbeeApi_0x8B} xbeeApi_0x8B 
   */
  processDataTransmitStatusZigBee(xbeeApi_0x8B){
    // 데이터 전송 실패
    if(xbeeApi_0x8B.deliveryStatus){

    }

  }

  /**
   * 
   * @param {xbeeApi_0x90} xbeeApi_0x90 
   */
  processDataReceivePacketZigBee(xbeeApi_0x90){

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