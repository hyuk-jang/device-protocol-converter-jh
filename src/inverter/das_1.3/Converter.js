const _ = require('lodash');

const {
  BU
} = require('base-util-jh');
const ProtocolConverter = require('../../default/ProtocolConverter');
const protocol = require('./protocol');


require('../../format/defaultDefine');
// require('./define');
const BaseModel = require('../baseModel');

class Converter extends ProtocolConverter {
  /**
   * protocol_info.option --> true: 3.3kW, any: 600W
   * @param {protocol_info} protocol_info
   */
  constructor(protocol_info) {
    super();
    this.config = protocol_info;
    this.decodingTable = protocol.decodingProtocolTable(protocol_info);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;

    /** baseFormat Guide Line */
    this.model = new BaseModel(protocol_info);
    this.baseFormat = this.model.baseFormat;
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
   * @param {Array.<Buffer>} cmdList 각 Protocol Converter에 맞는 데이터
   * @return {Array.<commandInfo>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(cmdList) {
    // BU.CLI(generationInfo);
    /** @type {Array.<commandInfo>} */
    const returnValue = [];

    cmdList.forEach(bufData => {
      /** @type {commandInfo} */
      const commandObj = {
        data: bufData,
        commandExecutionTimeoutMs: 1000
      };
      returnValue.push(commandObj);
    });
    
    return returnValue;
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  parsingUpdateData(dcData) {
    /** @type {parsingResultFormat} */
    const returnValue = {};

    let requestData = this.getCurrTransferCmd(dcData);
    let responseData = dcData.data;

    let reqAddr = this.model.getRequestAddr(requestData);
    let resAddr = this.model.getResponseAddr(responseData);

    try {
      if(reqAddr !== resAddr){
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

      let dataBody = this.model.checkValidate(responseData, decodingTable);

      try {
        returnValue.eventCode = this.definedCommanderResponse.DONE;
        returnValue.data = this.automaticDecoding(decodingTable.decodingDataList, dataBody);
        // BU.CLI(returnValue);
        return returnValue;
      } catch (error) {
        throw error;
      }
    } catch (error) {
      returnValue.eventCode = this.definedCommanderResponse.ERROR;
      returnValue.data = error;
      return returnValue;
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
      // BU.CLI(returnValue);
      // 도출된 자료가 2차 가공(ex: 0 -> Run, 1 -> Stop )이 필요한 경우
      const operationKeys = _.keys(this.onDeviceOperationStatus);
      let startIndex = 0;
      decodingTable.forEach(decodingInfo => {
        // 조회할 데이터를 가져옴
        let thisBuf = data.slice(startIndex, startIndex + decodingInfo.byte);
        // 사용하는 메소드를 호출
        let convertValue = this[decodingInfo.callMethod](thisBuf);
        convertValue = _.isNumber(decodingInfo.scale) && _.isNumber(decodingInfo.fixed) ? _.round(convertValue * decodingInfo.scale, decodingInfo.fixed) : convertValue;
        // 2차 가공 여부에 따라 변환
        if (_.includes(operationKeys, decodingInfo.key)) {
          const operationStauts = this.onDeviceOperationStatus[decodingInfo.key];
          let parsingData = _.get(operationStauts, convertValue);
          if(decodingInfo.key === BaseModel.BASE_KEY.operTroubleList){
            parsingData = _.isEmpty(parsingData) ? [] : [parsingData];
          }
          returnValue[decodingInfo.key] = parsingData;
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