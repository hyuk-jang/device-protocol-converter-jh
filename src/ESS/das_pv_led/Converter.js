const _ = require('lodash');
const { BU } = require('base-util-jh');
const AbstConverter = require('../../Default/AbstConverter');
const protocol = require('./protocol');

const BaseModel = require('../BaseModel');

class Converter extends AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super(protocolInfo);
    this.protocol_info = protocolInfo;
    this.decodingTable = protocol.decodingProtocolTable(protocolInfo);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;

    /** BaseModel */
    this.BaseModel = BaseModel;
    this.baseModel = new BaseModel(protocolInfo);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {Array.<Buffer>} cmdList 각 Protocol Converter에 맞는 데이터
   * @return {Array.<commandInfo>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(cmdList) {
    return this.makeDefaultCommandInfo(cmdList, 1000);
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   */
  concreteParsingData(dcData) {
    try {
      const requestData = this.getCurrTransferCmd(dcData);
      const responseData = dcData.data;

      const reqAddr = this.baseModel.getRequestAddr(requestData);
      const resAddr = this.baseModel.getResponseAddr(responseData);

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
        case 7:
          decodingTable = this.decodingTable.BATTERY;
          break;
        case 8:
          decodingTable = this.decodingTable.LED;
          break;
        case 9:
          decodingTable = this.decodingTable.INPUT;
          break;
        default:
          throw new Error(`Can not find it Addr ${resAddr}`);
      }

      const dataBody = this.baseModel.checkValidate(responseData, decodingTable);
      return this.automaticDecoding(decodingTable.decodingDataList, dataBody);
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
    try {
      // 데이터를 집어넣을 기본 자료형을 가져옴
      const returnValue = this.BaseModel.BASE_MODEL;
      // BU.CLI(returnValue);
      // 도출된 자료가 2차 가공(ex: 0 -> Run, 1 -> Stop )이 필요한 경우
      const operationKeys = _.keys(this.onDeviceOperationStatus);
      let startIndex = 0;
      decodingTable.forEach(decodingInfo => {
        // 조회할 데이터를 가져옴
        const thisBuf = data.slice(startIndex, startIndex + decodingInfo.byte);
        // 사용하는 메소드를 호출
        let convertValue = this.protocolConverter[decodingInfo.callMethod](thisBuf);
        convertValue =
          _.isNumber(decodingInfo.scale) && _.isNumber(decodingInfo.fixed)
            ? _.round(convertValue * decodingInfo.scale, decodingInfo.fixed)
            : convertValue;
        // 2차 가공 여부에 따라 변환
        if (_.includes(operationKeys, decodingInfo.key)) {
          const operationStauts = this.onDeviceOperationStatus[decodingInfo.key];
          let parsingData = _.get(operationStauts, convertValue);
          if (decodingInfo.key === this.BaseModel.BASE_KEY.operTroubleList) {
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
