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
    // Open
    this.device.SHUTTER.COMMAND[1] = nodeInfo => {
      return [
        {
          cmd: `@cro${this.convertNodeNumber(nodeInfo)}`,
        },
      ];
    };
    // Close
    this.device.SHUTTER.COMMAND[0] = nodeInfo => {
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
    // On
    this.device.PUMP.COMMAND[1] = nodeInfo => {
      return [
        {
          cmd: `@cro${this.convertNodeNumber(nodeInfo)}`,
        },
      ];
    };
    // Off
    this.device.PUMP.COMMAND[0] = nodeInfo => {
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

    // Open
    this.device.VALVE.COMMAND[1] = nodeInfo => {
      return [
        {
          cmd: `@cro${this.convertNodeNumber(nodeInfo)}`,
        },
      ];
    };
    // Close
    this.device.VALVE.COMMAND[0] = nodeInfo => {
      return [
        {
          cmd: `@crc${this.convertNodeNumber(nodeInfo)}`,
        },
      ];
    };

    this.device.VALVE.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];
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
