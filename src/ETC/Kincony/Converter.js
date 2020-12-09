const _ = require('lodash');
const { BU } = require('base-util-jh');

const Model = require('./Model');
const protocol = require('./protocol');

const AbstConverter = require('../../Default/AbstConverter');

class Converter extends AbstConverter {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super(protocolInfo);

    this.dataModel = Model.BASE_MODEL;

    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;
    /** BaseModel */
    this.model = new Model(protocolInfo);
  }

  /**
   * Switch (Relay) 개별 제어 결과 데이터 분석 요청
   * @param {string} dataBody 장치 상태 데이터 '(1~4),(0~1)'
   * @param {nodeInfo[]} nodeList 해당 데이터 로거에 딸린 node 목록
   * @param {Object} dataModel 반환할 데이터를 담을 Model
   */
  refineIndivisualControl(dataBody, nodeList, dataModel) {
    const [protocolId, ch, isOn] = dataBody.split(',');

    const { nd_target_id: ndId, data_logger_index: dlIndex = 0 } = _.find(nodeList, {
      data_index: Number(ch),
    });

    dataModel[ndId][dlIndex] = this.onDeviceOperationStatus[ndId][isOn];

    return dataModel;
  }

  /**
   * Switch (Relay) 계측 데이터 분석 요청
   * @param {string} dataBody 장치 상태 데이터 '(0~15)'
   * @param {nodeInfo[]} nodeList 해당 데이터 로거에 딸린 node 목록
   * @param {Object} dataModel 반환할 데이터를 담을 Model
   */
  refineMeasure(dataBody, nodeList, dataModel) {
    const [protocolId, data] = dataBody.split(',');

    const currRelayDataList = this.protocolConverter.convertDataToBitArray(data);

    currRelayDataList.forEach((isOn, ch) => {
      const nodeInfo = _.find(nodeList, {
        data_index: ch + 1,
      });

      if (nodeInfo) {
        const { nd_target_id: ndId, data_logger_index: dlIndex = 0 } = nodeInfo;
        // 데이터를 변환은 Node Define Id를 기준으로 수행하여 Data Logger Index와 일치하는 배열 인덱스에 정의
        dataModel[ndId][dlIndex] = this.onDeviceOperationStatus[ndId][isOn];
      }
    });

    return dataModel;
  }

  /**
   * 데이터 분석 요청
   * @param {string} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   * @param {nodeInfo[]} nodeList 데이터 로거에 물려있는 Node 목록
   */
  concreteParsingData(deviceData, currTransferCmd, nodeList) {
    deviceData = Buffer.isBuffer(deviceData) ? deviceData.toString() : deviceData;
    // BU.CLI(deviceData);

    const [stx, cmdCode, body] = deviceData.split('-');

    const dataModel = { ...this.dataModel };

    switch (cmdCode) {
      // 전체 제어
      case 'SET_ALL':
        break;
      // 개별 제어
      case 'SET':
        this.refineIndivisualControl(body, nodeList, dataModel);
        break;
      // 계측
      case 'STATE':
        this.refineMeasure(body, nodeList, dataModel);
        break;

      default:
        throw new Error(`cmdCode does not match. ${cmdCode}`);
    }

    return dataModel;
  }
}
module.exports = Converter;
