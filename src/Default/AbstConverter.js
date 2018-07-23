'use strict';
const {BU} = require('base-util-jh');
const _ = require('lodash');

const ProtocolConverter = require('./ProtocolConverter');
const AbstBaseModel = require('./AbstBaseModel');

// const {definedCommanderResponse} =  require('default-intelligence').dccFlagModel;
const {definedCommanderResponse} =  require('../../../../module/default-intelligence').dccFlagModel;

class AbstConverter {
  /**
   * @param {protocol_info} protocol_info
   */
  constructor(protocol_info) {
    this.protocol_info = protocol_info;

    this.protocolConverter = new ProtocolConverter();

    this.protocolOptionInfo = _.get(protocol_info, 'protocolOptionInfo');

    // 수신 받은 데이터 버퍼
    this.trackingDataBuffer = Buffer.from('');

    this.definedCommanderResponse = definedCommanderResponse;

    this.baseModel = new AbstBaseModel(protocol_info);
    // 자식 Converter에서 구현
    this.onDeviceOperationStatus = null;
    
  }

  /**
   * 명령을 보낼 배열을 생성
   * @param {Array.<*>} cmdDataList 실제 수행할 명령
   * @param {number=} commandExecutionTimeoutMs 해당 명령을 수행하기전 대기 시간(ms)
   * @param {number=} delayExecutionTimeoutMs 해당 명령을 수행할때까지의 timeout 유예시간(ms)
   * @return {Array.<commandInfo>} 
   */
  makeDefaultCommandInfo(cmdDataList, commandExecutionTimeoutMs, delayExecutionTimeoutMs){
    /** @type {Array.<commandInfo>} */
    const returnValue = [];

    cmdDataList = Array.isArray(cmdDataList) ? cmdDataList : [cmdDataList];

    cmdDataList.forEach(bufData => {
      /** @type {commandInfo} */
      const commandObj = {
        data: bufData,
        commandExecutionTimeoutMs: _.isNumber(commandExecutionTimeoutMs) ? commandExecutionTimeoutMs : 1000
      };
      if(_.isNumber(delayExecutionTimeoutMs)){
        commandObj.delayExecutionTimeoutMs = delayExecutionTimeoutMs;
      }

      returnValue.push(commandObj);
    });

    return returnValue;
  }

  /**
   * TrackingDataBuffer를 강제로 초기화 시키고자 할 경우
   * @return {void}
   */
  resetTrackingDataBuffer() {
    this.trackingDataBuffer = Buffer.from('');
  }


  
  /**
   * dcData에서 현재 요청한 명령을 가져옴
   * @param {dcData} dcData 
   */
  getCurrTransferCmd(dcData){
    return _.get(_.nth(dcData.commandSet.cmdList, dcData.commandSet.currCmdIndex), 'data'); 
  }


  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  parsingUpdateData(dcData) {
    const returnValue = {};
    try {
      // 수신 데이터 추적을 하는 경우라면 dcData의 Data와 합산
      if(_.get(this.protocolOptionInfo, 'hasTrackingData') === true){
        this.trackingDataBuffer = Buffer.concat([this.trackingDataBuffer, dcData.data]);  
        dcData.data = this.trackingDataBuffer;

        // BU.CLI(dcData.data.toString());
      }


      // BU.CLI('@@@@@@@@@@');
      try {
        returnValue.data = this.concreteParsingData(dcData);
      } catch (error) {
        throw error;        
      }
      // BU.CLI('@@@@@@@@@@');
      returnValue.eventCode = this.definedCommanderResponse.DONE;
      
      // DONE 처리가 될 경우 Buffer 비움
      this.resetTrackingDataBuffer();
      
      return returnValue;
    } catch (error) {
      returnValue.eventCode = this.definedCommanderResponse.ERROR;
      returnValue.data = error;
      return returnValue;
    }
  }

  /**
   * 실제 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {*}
   */  
  concreteParsingData(dcData) {

  }


  /**
   * decodingInfo 리스트 만큼 Data 파싱을 진행
   * @param {Array.<decodingInfo>} decodingTable 
   * @param {Buffer} data 
   */
  automaticDecoding(decodingTable, data) {
    try {
      // BU.CLI(data);
      // 데이터를 집어넣을 기본 자료형을 가져옴
      let returnValue = this.BaseModel.BASE_MODEL;
      // BU.CLI(returnValue);
      // 도출된 자료가 2차 가공(ex: 0 -> Open, 1 -> Close )이 필요한 경우
      const operationKeys = _.keys(this.onDeviceOperationStatus);
      let startIndex = 0;
      decodingTable.forEach(decodingInfo => {
        // 조회할 데이터를 가져옴
        let thisBuf = data.slice(startIndex, startIndex + decodingInfo.byte);
        // 사용하는 메소드를 호출
        let convertValue = this.protocolConverter[decodingInfo.callMethod](thisBuf);
        convertValue = _.isNumber(decodingInfo.scale) && _.isNumber(decodingInfo.fixed) ? _.round(convertValue * decodingInfo.scale, decodingInfo.fixed) : convertValue;
        // 2차 가공 여부에 따라 변환
        let realValue = convertValue;

        let decodingKey = _.get(decodingInfo, 'decodingKey') ? _.get(decodingInfo, 'decodingKey') : _.get(decodingInfo, 'key');
        if (_.includes(operationKeys, decodingKey)) {

          const operationStauts = this.onDeviceOperationStatus[decodingKey];

          // 찾은 Decoding이 Function 이라면 값을 넘겨줌
          if(operationStauts instanceof Function){
            realValue = operationStauts(convertValue);
          } else {
            realValue = _.get(operationStauts, convertValue);
          }
        } 

        // 데이터 단위가 배열일 경우
        if(Array.isArray(returnValue[_.get(decodingInfo, 'key')])){
          returnValue[_.get(decodingInfo, 'key')].push(realValue);
        } else {
          returnValue[_.get(decodingInfo, 'key')] = realValue;
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
module.exports = AbstConverter;