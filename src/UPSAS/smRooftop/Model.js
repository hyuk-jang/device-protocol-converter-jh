const _ = require('lodash');

const BaseModel = require('../BaseModel');

const mainSecTime = 10;

const {
  di: {
    dcmConfigModel: { reqDeviceControlType: reqDCT },
  },
} = require('../../module');

class Model extends BaseModel {
  constructor() {
    super();

    /** @type {commandInfoModel[]} 상태 */
    const status = [
      {
        cmd: '@sts',
      },
    ];

    /** @type {commandInfoModel[]} 수문 폐쇄 */
    const waterDoorClose = [
      {
        cmd: '@ctc',
      },
      {
        cmd: '@sts',
        timeout: mainSecTime * 10,
      },
    ];

    /** @type {commandInfoModel[]} 수문 폐쇄 */
    const waterDoorOpen = [
      {
        cmd: '@cto',
      },
      {
        cmd: '@sts',
        timeout: mainSecTime * 10,
      },
    ];

    /** @type {commandInfoModel[]} 수문 폐쇄 */
    const gateValueClose = [
      {
        cmd: '@ctc',
      },
    ];

    /** @type {commandInfoModel[]} 수문 폐쇄 */
    const gateValueOpen = [
      {
        cmd: '@cto',
      },
    ];

    /** @type {commandInfoModel[]} 수문 폐쇄 */
    const pumpOff = [
      {
        cmd: '@ctc',
      },
    ];

    /** @type {commandInfoModel[]} 수문 폐쇄 */
    const pumpOn = [
      {
        cmd: '@cto',
      },
    ];

    // 일반 계측
    this.device.DEFAULT.COMMAND.STATUS = status;
    // this.device.DEFAULT.COMMAND[reqDCT.MEASURE] = status;

    // 수문 제어
    this.device.WATER_DOOR.COMMAND[reqDCT.FALSE] = waterDoorClose;
    this.device.WATER_DOOR.COMMAND[reqDCT.TRUE] = waterDoorOpen;
    // 게이트 밸브 제어
    this.device.GATE_VALVE.COMMAND[reqDCT.FALSE] = gateValueClose;
    this.device.GATE_VALVE.COMMAND[reqDCT.TRUE] = gateValueOpen;
    // 펌프 제어
    this.device.PUMP.COMMAND[reqDCT.FALSE] = pumpOff;
    this.device.PUMP.COMMAND[reqDCT.TRUE] = pumpOn;
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
