'use strict';
const _ = require('lodash');
const xbee_api = require('xbee-api');
const {BU} = require('base-util-jh');

const AbstConverter = require('../../Default/AbstConverter');
const BaseModel = require('../BaseModel');
const Model = require('./Model');
const protocol = require('./protocol');

require('../../../../default-intelligence');

class Converter extends AbstConverter {
  /** @param {protocol_info} protocol_info */
  constructor(protocol_info) {
    super(protocol_info);
    this.protocol_info = protocol_info;

    this.decodingTable = protocol.decodingProtocolTable(this.protocol_info.deviceId);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;
    this.xbeeAPI = new xbee_api.XBeeAPI();
    this.frameIdList = [];

    /** BaseModel */
    // automaticDecoding Method 에서 사용됨
    this.BaseModel = BaseModel;
    this.model = new Model();
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성. 
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {{key: string, value: number}} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {Array.<commandInfo>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    // BU.CLI(generationInfo);


    /** @type {baseModelDeviceStructure} */
    let foundIt = _.find(this.model.device, deviceModel => {
      return _.isEqual(_.get(deviceModel, 'KEY'), generationInfo.key);
    });
    

    if(_.isEmpty(foundIt)){
      throw new Error(`${generationInfo.key}는 존재하지 않습니다.`);
    }

    let commandInfo = _.get(foundIt, 'COMMAND', {});
    // BU.CLI(commandInfo);

    /** @type {Array.<commandInfoModel>} */
    let cmdList;
    
    // 컨트롤 밸류가 0이나 False라면 장치 작동을 Close, Off
    if(generationInfo.value === 0 || generationInfo.value === false){
      if(_.keys(commandInfo).includes('CLOSE')){
        cmdList = commandInfo.CLOSE;
      } else if(_.keys(commandInfo).includes('OFF')){
        cmdList = commandInfo.OFF;
      } 
    } else if(generationInfo.value === 1 || generationInfo.value === true){
      if(_.keys(commandInfo).includes('OPEN')){
        cmdList = commandInfo.OPEN;
      } else if(_.keys(commandInfo).includes('ON')){
        cmdList = commandInfo.ON;
      } 
    } else if(generationInfo.value === undefined){
      if(_.keys(commandInfo).includes('STATUS')){
        cmdList = commandInfo.STATUS;
      } 
    } else {
      throw new Error(`controlValue: ${generationInfo.value}는 유효한 값이 아닙니다.`);
    }
    if(cmdList === undefined || _.isEmpty(cmdList)){
      throw new Error(`${generationInfo.key}에는 Value: ${generationInfo.value} 존재하지 않습니다.`);
    }
    
    /** @type {Array.<commandInfo>} */
    const returnValue = [];

    // BU.CLI(cmdList);
    cmdList.forEach(cmdInfo => {
      /** @type {commandInfo} */
      const commandObj = {};
      const frameId = this.xbeeAPI.nextFrameId();
      /** @type {xbeeApi_0x10} */
      let frameObj = {
        type: 0x10,
        id: frameId,
        destination64: this.protocol_info.deviceId,
        data: cmdInfo.cmd,
      };
      commandObj.data = frameObj;
      commandObj.commandExecutionTimeoutMs = 1000;
      commandObj.delayExecutionTimeoutMs = _.isNumber(cmdInfo.timeout) && cmdInfo.timeout;
      returnValue.push(commandObj);
    });
    return returnValue;
  }


  

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  concreteParsingData(dcData) {
    try {
      /** @type {parsingResultFormat} */
      /** @type {xbeeApi_0x8B|xbeeApi_0x90} */
      let responseData = dcData.data;
      let result;
      // 해당 프로토콜에서 생성된 명령인지 체크
      switch (responseData.type) {
      case 0x88:
        result = this.processDataResponseAT();
        break;
      case 0x90:
        result = this.processDataReceivePacketZigBee(dcData.data);
        break;
      default:
        throw new Error(`Not Matching Type ${responseData.type}`);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }


  /**
   * 
   * @param {xbeeApi_0x88} xbeeApi_0x88 
   */
  processDataResponseAT(xbeeApi_0x88) {}

  /**
   * 
   * @param {xbeeApi_0x90} xbeeApi_0x90 
   */
  processDataReceivePacketZigBee(xbeeApi_0x90) {
    // BU.CLI(xbeeApi_0x90);
    try {
      const data = xbeeApi_0x90.data;
  
      let STX = _.nth(data, 0);
      // STX 체크 (# 문자 동일 체크)
      if (_.isEqual(STX, 0x23)) {
        // let boardId = data.slice(1, 5);
        // BU.CLI(data.toString());
        let productType = data.slice(5, 9);
        let dataBody = data.slice(9);
  
        let decodingDataList;
        if (_.isBuffer(productType)) {
          productType = this.protocolConverter.convertBufToHexToNum(productType);
  
          switch (productType) {
          case 1:
            decodingDataList = this.decodingTable.gateLevelSalinity;
            break;
          case 2:
            decodingDataList = dataBody.toString().length === 20 ? this.decodingTable.valve : this.decodingTable.salternBlockValve;
            // BU.CLI(dataBody.toString().length, decodingDataList);
            // decodingDataList = this.decodingTable.valve;
            break;
          case 3:
            decodingDataList = this.decodingTable.pump;
            break;
          default:
            throw new Error(`productType: ${productType}은 Parsing 대상이 아닙니다.`);
          }
          
          // BU.CLI(decodingDataList.decodingDataList);
          const hasValid = _.chain(decodingDataList.decodingDataList).map('byte').sum().isEqual(dataBody.length).value();
          if (!hasValid) {
            throw new Error(`데이터의 길이(${dataBody.length})가 맞지 않습니다.`);
          }

          return this.automaticDecoding(decodingDataList.decodingDataList, dataBody);
        } else {
          throw new Error(`productType: ${productType}이 이상합니다.`);
        }
      } else {
        throw new Error('STX가 일치하지 않습니다.');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * decodingInfo 리스트 만큼 Data 파싱을 진행
   * @param {Array.<decodingInfo>} decodingTable 
   * @param {Buffer} data 
   */
  automaticDecoding(decodingTable, data) {
    return super.automaticDecoding(decodingTable, data);
  }
}
module.exports = Converter;