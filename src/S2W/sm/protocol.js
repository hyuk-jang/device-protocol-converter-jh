const { BU } = require('base-util-jh');

const Model = require('./Model');
const { parsingMethod } = require('../../format/moduleDefine');

const { BASE_KEY: BK } = Model;

const {
  device: { SHUTTER, PUMP, VALVE },
} = new Model();

const onDeviceOperationStatus = {
  /** @type {Object} 펌프 */
  [PUMP.KEY]: {
    /** @type {number} 꺼짐 */
    0: PUMP.STATUS.OFF,
    /** @type {number} 켜짐 */
    1: PUMP.STATUS.ON,
  },
  /** @type {Object} 펌프 */
  VALVE: {
    /** @type {number} 꺼짐 */
    0: VALVE.STATUS.CLOSE,
    /** @type {number} 켜짐 */
    1: VALVE.STATUS.OPEN,
  },
  /** @type {Object} 개폐기 */
  [SHUTTER.KEY]: {
    /** @type {number} 닫힘 */
    0: SHUTTER.STATUS.CLOSE,
    /** @type {number} 펼침 */
    1: SHUTTER.STATUS.OPEN,
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

exports.decodingProtocolTable = dialing => {
  /** @type {decodingProtocolInfo} */
  const pump = {
    dialing,
    address: '0011',
    decodingDataList: [
      {
        key: BK.battery,
        byte: 4,
      },
      {
        key: BK.pumpControlType,
        callMethod: parsingMethod.convertBufToStr,
      },
      {
        key: BK.pump,
      },
      {
        key: BK.nutrientValve,
        decodingKey: 'VALVE',
      },
      {
        key: BK.nutrientValve,
        decodingKey: 'VALVE',
      },
      {
        key: BK.wateringValve,
        decodingKey: 'VALVE',
      },
      {
        key: BK.wateringValve,
        decodingKey: 'VALVE',
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const shutter = {
    dialing,
    address: '0012',
    decodingDataList: [
      {
        key: BK.battery,
        byte: 4,
      },
      {
        key: BK.shutterControlType,
        callMethod: parsingMethod.convertBufToStr,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
      {
        key: BK.shutter,
      },
    ],
  };

  return {
    pump,
    shutter,
  };
};
