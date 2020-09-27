const _ = require('lodash');

const BaseModel = require('../BaseModel');

const mainSecTime = 10;

class Model extends BaseModel {
  /**
   * @param {protocol_info} protocolInfo
   * @param {AbstConverter} converter
   */
  constructor(protocolInfo, converter) {
    super();

    this.converter = converter;

    this.device.RELAY.COMMAND.STATUS = [
      {
        fnCode: this.FN_CODE.MEASURE,
        cmd: '00',
      },
    ];
  }

  /**
   * 데이터로거 노드 인덱스에 1을 더한 후 2자리 string으로 변환
   * @param {nodeInfo=} nodeInfo nodeInfo에서의 data_logger_index
   */
  openRelay() {
    // 현재 릴레이의 상태를 가져옴
  }

  /**
   * 데이터로거 노드 인덱스에 1을 더한 후 2자리 string으로 변환
   * @param {nodeInfo=} nodeInfo nodeInfo에서의 data_logger_index
   */
  convertNodeNumber(nodeInfo) {
    const { data_index: dIndex = 0 } = nodeInfo;

    return _.padStart(dIndex, 2, '0');
  }
}

module.exports = Model;
