const BaseModel = require('../BaseModel');

const mainSecTime = 1000;

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
        cmd: '@cgo',
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
    this.device.GATE_VALVE.COMMAND.OPEN = [
      {
        cmd: '@cto',
      },
      {
        cmd: '@sts',
        timeout: mainSecTime * 15,
      },
    ];

    this.device.GATE_VALVE.COMMAND.CLOSE = [
      {
        cmd: '@ctc',
      },
      {
        cmd: '@sts',
        timeout: mainSecTime * 15,
      },
    ];

    this.device.GATE_VALVE.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    /** 밸브 */
    this.device.VALVE.COMMAND.OPEN = [
      {
        cmd: '@cto',
      },
      {
        cmd: '@sts',
        timeout: mainSecTime * 15,
      },
    ];

    this.device.VALVE.COMMAND.CLOSE = [
      {
        cmd: '@ctc',
      },
      {
        cmd: '@sts',
        timeout: mainSecTime * 15,
      },
    ];

    this.device.VALVE.COMMAND.STATUS = [
      {
        cmd: '@sts',
      },
    ];

    /** 펌프 */
    this.device.PUMP.COMMAND.ON = [
      {
        // 펌프 킬때는 명령을 내리고 10초 후에 킴
        // timeout: mainSecTime * 10,
        cmd: '@cto',
      },
      {
        cmd: '@sts',
        timeout: mainSecTime * 5,
      },
    ];

    this.device.PUMP.COMMAND.OFF = [
      {
        cmd: '@ctc',
      },
      {
        cmd: '@sts',
        timeout: mainSecTime * 5,
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
}

module.exports = Model;
