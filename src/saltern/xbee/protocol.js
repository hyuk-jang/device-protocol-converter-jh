const {
  parsingMethod
} = require('../../format/moduleDefine');

require('../../format/defaultDefine');

const Model = require('./Model');
const model = new Model();

const onDeviceOperationStatus = {
  /** @type {Object} 수문 상태*/
  [model.WATER_DOOR.KEY]: {
    /** @type {string} 정지 */
    0: model.WATER_DOOR.STATUS.STOP,
    /** @type {string} 열림 */
    2: model.WATER_DOOR.STATUS.OPEN,
    /** @type {string} 여는 중 */
    3: model.WATER_DOOR.STATUS.CLOSING,
    /** @type {string} 닫힘 */
    4: model.WATER_DOOR.STATUS.CLOSE,
    /** @type {string} 닫는 중 */
    5: model.WATER_DOOR.STATUS.OPENING,
  },
  /** @type {Object} 수위 */
  [model.WATER_LEVEL.KEY]: {
    /** @type {number} 0 단계 (수위없음) */
    0: model.WATER_LEVEL.STATUS.ZERO,
    /** @type {number} 1 단계 (최저) */
    1: model.WATER_LEVEL.STATUS.ONE,
    /** @type {number} 2 단계 */
    2: model.WATER_LEVEL.STATUS.TWO,
    3: model.WATER_LEVEL.STATUS.TWO,
    /** @type {number} 3 단계 (최대) */
    4: model.WATER_LEVEL.STATUS.THREE,
    5: model.WATER_LEVEL.STATUS.THREE,
    6: model.WATER_LEVEL.STATUS.THREE,
    7: model.WATER_LEVEL.STATUS.THREE,
    8: model.WATER_LEVEL.STATUS.THREE,
    9: model.WATER_LEVEL.STATUS.THREE,
  },
  /** @type {Object} 밸브 */
  [model.VALVE.KEY]: {
    /** @type {number} 미확인 */
    0: model.VALVE.STATUS.UNDEF,
    /** @type {number} 닫힘 */
    1: model.VALVE.STATUS.CLOSE,
    /** @type {number} 열림 */
    2: model.VALVE.STATUS.OPEN,
    /** @type {number} 작업 중 */
    3: model.VALVE.STATUS.BUSY,
    // /** @type {number} 닫는 중 */
    // 4: model.VALVE.STATUS.OPENING,
    // /** @type {number} 여는 중 */
    // 5: model.VALVE.STATUS.CLOSING,
  },
  /** @type {Object} 펌프 */
  [model.PUMP.KEY]: {
    /** @type {number} 꺼짐 */
    0: model.PUMP.STATUS.OFF,
    /** @type {number} 켜짐 */
    1: model.PUMP.STATUS.ON,
  }

};
exports.onDeviceOperationStatus = onDeviceOperationStatus;


exports.decodingProtocolTable = (dialing) => {
  /** @type {Array.<{}>} */
  return {
    gateLevelSalinity: {
      dialing,
      address: '0001',
      length: 12, // 수신할 데이터 Byte,
      decodingDataList: [{
        key: model.WATER_DOOR.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToDec,
      }, {
        key: model.WATER_LEVEL.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToDec,
      }, {
        key: model.SALINITY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      }, {
        key: model.BATTERY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      }]
    },
    valve: {
      dialing,
      address: '0002',
      length: '6',
      decodingDataList: [{
        key: model.VALVE.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToDec,
      }, {
        key: model.WATER_LEVEL.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToDec,
      },
      {
        key: model.WATER_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.MODULE_REAR_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      }, {
        key: model.BATTERY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      }
      ]
    },
    pump: {
      dialing,
      address: '0003',
      length: '6',
      decodingDataList: [{
        key: model.PUMP.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToDec,
      }, {
        key: model.BATTERY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      }]
    },
  };
};