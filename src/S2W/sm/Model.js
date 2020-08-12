const _ = require('lodash');

const BaseModel = require('../BaseModel');

const mainSecTime = 10;

class Model extends BaseModel {
  constructor() {
    super();

    this.device.DEFAULT.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    this.device.SHUTTER.COMMAND.ON = nodeInfo => {
      return [
        {
          cmd: `@cro${this.convertNodeNumber(nodeInfo)}`,
        },
      ];
    };

    this.device.SHUTTER.COMMAND.OFF = nodeInfo => {
      return [
        {
          cmd: `@crc${this.convertNodeNumber(nodeInfo)}`,
        },
      ];
    };

    this.device.SHUTTER.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    this.device.PUMP.COMMAND.ON = nodeInfo => {
      return [
        {
          cmd: `@cro${this.convertNodeNumber(nodeInfo)}`,
        },
      ];
    };

    this.device.PUMP.COMMAND.OFF = nodeInfo => {
      return [
        {
          cmd: `@crc${this.convertNodeNumber(nodeInfo)}`,
        },
      ];
    };

    this.device.PUMP.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];
  }

  /**
   * 데이터로거 노드 인덱스에 1을 더한 후 2자리 string으로 변환
   * param {nodeInfo=} nodeInfo nodeInfo에서의 data_logger_index
   */
  convertNodeNumber(nodeInfo) {
    const { data_logger_index: dlNodeIdx = 0 } = nodeInfo;

    return _.padStart(dlNodeIdx + 1, 2, '0');
  }
}

module.exports = Model;
