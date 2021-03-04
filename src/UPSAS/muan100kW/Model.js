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

    this.device.WATER_DOOR.COMMAND.OPEN = [
      {
        cmd: '@cto',
      },
      {
        cmd: '@sts',
        timeout: mainSecTime * 10,
      },
    ];

    this.device.WATER_DOOR.COMMAND.CLOSE = [
      {
        cmd: '@ctc',
      },
      {
        cmd: '@sts',
        timeout: mainSecTime * 10,
      },
    ];

    this.device.WATER_DOOR.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    /** 수문용 밸브 */
    this.device.GATE_VALVE.COMMAND.OPEN = nodeInfo => [
      {
        cmd: `@cto${this.convertNodeNumber(nodeInfo)}`,
      },
    ];

    this.device.GATE_VALVE.COMMAND.CLOSE = nodeInfo => [
      {
        cmd: `@ctc${this.convertNodeNumber(nodeInfo)}`,
      },
    ];

    this.device.GATE_VALVE.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    /** 밸브 */
    this.device.VALVE.COMMAND.OPEN = nodeInfo => [
      {
        cmd: `@cto${this.convertNodeNumber(nodeInfo)}`,
      },
    ];

    this.device.VALVE.COMMAND.CLOSE = nodeInfo => [
      {
        cmd: `@ctc${this.convertNodeNumber(nodeInfo)}`,
      },
    ];

    this.device.VALVE.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    /** 펌프 */
    this.device.PUMP.COMMAND.ON = nodeInfo => [
      {
        cmd: `@cto${this.convertNodeNumber(nodeInfo)}`,
      },
    ];

    this.device.PUMP.COMMAND.OFF = nodeInfo => [
      {
        cmd: `@ctc${this.convertNodeNumber(nodeInfo)}`,
      },
    ];

    this.device.PUMP.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    /** 염도 */
    this.device.SALINITY.COMMAND.MEASURE = [
      {
        cmd: '@sts',
      },
    ];

    this.device.SALINITY.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    this.device.WATER_LEVEL.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    /** 수온 */
    this.device.BRINE_TEMPERATURE.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    /** 모듈 앞면 */
    this.device.MODULE_FRONT_TEMPERATURE.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    /** 모듈 뒷면 */
    this.device.MODULE_REAR_TEMPERATURE.COMMAND.STATUS = [
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
    const { data_logger_index: dlNodeIdx = 0 } = nodeInfo;

    return _.padStart(dlNodeIdx + 1, 2, '0');
  }
}

module.exports = Model;
