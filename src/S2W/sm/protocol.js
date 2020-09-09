const { BU } = require('base-util-jh');

const Model = require('./Model');
const { parsingMethod } = require('../../format/moduleDefine');

const { BASE_KEY: BK } = Model;

const {
  device: { SHUTTER, PUMP },
} = new Model();

const onDeviceOperationStatus = {
  /** @type {Object} 펌프 */
  [PUMP.KEY]: {
    /** @type {number} 꺼짐 */
    0: PUMP.STATUS.OFF,
    /** @type {number} 켜짐 */
    1: PUMP.STATUS.ON,
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
