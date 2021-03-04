const _ = require('lodash');

const BaseModel = require('../BaseModel');

const mainSecTime = 10;

class Model extends BaseModel {
  constructor() {
    super();

    this.device.DEFAULT.COMMAND.STATUS = ['@sts'];
    // Open
    this.device.SHUTTER.COMMAND[1] = nodeInfo => [
      `@cro${this.convertNodeNumber(nodeInfo)}`,
    ];
    // Close
    this.device.SHUTTER.COMMAND[0] = nodeInfo => [
      `@crc${this.convertNodeNumber(nodeInfo)}`,
    ];

    this.device.SHUTTER.COMMAND.STATUS = ['@srs'];
    // On
    this.device.PUMP.COMMAND[1] = nodeInfo => [`@cpo${this.convertNodeNumber(nodeInfo)}`];
    // Off
    this.device.PUMP.COMMAND[0] = nodeInfo => [`@cpc${this.convertNodeNumber(nodeInfo)}`];

    this.device.PUMP.COMMAND.STATUS = ['@sts'];

    // Open
    this.device.VALVE.COMMAND[1] = nodeInfo => [
      `@cpo${this.convertNodeNumber(nodeInfo)}`,
    ];
    // Close
    this.device.VALVE.COMMAND[0] = nodeInfo => [
      `@cpc${this.convertNodeNumber(nodeInfo)}`,
    ];

    this.device.VALVE.COMMAND.STATUS = ['@sts'];
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
