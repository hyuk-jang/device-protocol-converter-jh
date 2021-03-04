const { BU } = require('base-util-jh');
const { parsingMethod } = require('../../format/moduleDefine');
const Model = require('./Model');

const model = new Model();
const {
  device: { WATER_DOOR, VALVE, GATE_VALVE, PUMP },
} = model;
const { BASE_KEY: BK } = Model;

const onDeviceOperationStatus = {
  /** @type {Object} 수문 상태 */
  [WATER_DOOR.KEY]: {
    /** @type {string} 열림 */
    2: WATER_DOOR.STATUS.OPEN,
    /** @type {string} 닫는 중 */
    3: WATER_DOOR.STATUS.CLOSING,
    /** @type {string} 닫힘 */
    4: WATER_DOOR.STATUS.CLOSE,
    /** @type {string} 여는 중 */
    5: WATER_DOOR.STATUS.OPENING,
  },
  /** @type {Object} 게이트밸브 */
  [GATE_VALVE.KEY]: {
    /** @type {number} 닫힘 */
    0: VALVE.STATUS.CLOSE,
    /** @type {number} 열림 */
    1: VALVE.STATUS.OPEN,
  },
  /** @type {Object} 밸브 */
  [VALVE.KEY]: {
    /** @type {number} 닫힘 */
    1: VALVE.STATUS.CLOSE,
    /** @type {number} 열림 */
    2: VALVE.STATUS.OPEN,
  },
  /** @type {Object} 펌프 */
  [PUMP.KEY]: {
    /** @type {number} 꺼짐 */
    0: PUMP.STATUS.OFF,
    /** @type {number} 켜짐 */
    1: PUMP.STATUS.ON,
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

exports.decodingProtocolTable = dialing => {
  /** @type {decodingProtocolInfo} */
  const waterDoor = {
    dialing,
    address: '0001',
    bodyLength: 6,
    decodingDataList: [
      {
        key: BK.waterDoor,
        byte: 2,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const gateValve = {
    dialing,
    address: '0002',
    bodyLength: 6,
    decodingDataList: [
      {
        key: BK.gateValve,
        byte: 2,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const pump = {
    dialing,
    address: '0003',
    bodyLength: 6,
    decodingDataList: [
      {
        key: BK.pump,
        byte: 2,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
    ],
  };

  return {
    waterDoor,
    gateValve,
    pump,
  };
};
