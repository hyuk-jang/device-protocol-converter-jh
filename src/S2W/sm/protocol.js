const { BU } = require('base-util-jh');
const { parsingMethod } = require('../../format/moduleDefine');
const Model = require('./Model');

const model = new Model();
const {
  device: { SHUTTER, PUMP },
} = model;
const { BASE_KEY: BK } = Model;

const onDeviceOperationStatus = {
  /** @type {Object} 펌프 */
  [PUMP.KEY]: {
    /** @type {number} 꺼짐 */
    0: PUMP.STATUS.OFF,
    /** @type {number} 켜짐 */
    1: PUMP.STATUS.ON,
  },
  /** @type {Object} 펌프 */
  [SHUTTER.KEY]: {
    /** @type {number} 꺼짐 */
    0: SHUTTER.STATUS.OFF,
    /** @type {number} 켜짐 */
    1: SHUTTER.STATUS.ON,
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
        key: BK.controlType,
        callMethod: parsingMethod.convertBufToStr,
      },
      {
        key: BK.pump,
      },
      {
        key: BK.pump,
      },
      {
        key: BK.pump,
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
        key: BK.controlType,
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
