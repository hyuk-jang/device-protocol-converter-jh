const {
  parsingMethod
} = require('../../format/moduleDefine');
const {
  deviceModel,
  deviceModelStatus
} = require('../baseModel');
require('../../format/defaultDefine');

const onDeviceOperationStatus = {
  /** @type {Object} 수문 상태*/
  [deviceModel.WATER_DOOR]: {
    /** @type {string} 정지 */
    0: deviceModelStatus.WATER_DOOR.STOP,
    /** @type {string} 열림 */
    2: deviceModelStatus.WATER_DOOR.OPEN,
    /** @type {string} 여는 중 */
    3: deviceModelStatus.WATER_DOOR.CLOSING,
    /** @type {string} 닫힘 */
    4: deviceModelStatus.WATER_DOOR.CLOSE,
    /** @type {string} 닫는 중 */
    5: deviceModelStatus.WATER_DOOR.OPENING,
  },
  /** @type {Object} 수위 */
  [deviceModel.WATER_LEVEL]: {
    /** @type {number} 0 단계 (수위없음) */
    0: deviceModelStatus.WATER_LEVEL.ZERO,
    /** @type {number} 1 단계 (최저) */
    1: deviceModelStatus.WATER_LEVEL.ONE,
    /** @type {number} 2 단계 */
    2: deviceModelStatus.WATER_LEVEL.TWO,
    3: deviceModelStatus.WATER_LEVEL.TWO,
    /** @type {number} 3 단계 (최대) */
    4: deviceModelStatus.WATER_LEVEL.THREE,
    5: deviceModelStatus.WATER_LEVEL.THREE,
    6: deviceModelStatus.WATER_LEVEL.THREE,
    7: deviceModelStatus.WATER_LEVEL.THREE,
    8: deviceModelStatus.WATER_LEVEL.THREE,
    9: deviceModelStatus.WATER_LEVEL.THREE,
  },
  /** @type {Object} 밸브 */
  [deviceModel.VALVE]: {
    /** @type {number} 미확인 */
    0: deviceModelStatus.VALVE.UNDEF,
    /** @type {number} 닫힘 */
    1: deviceModelStatus.VALVE.CLOSE,
    /** @type {number} 열림 */
    2: deviceModelStatus.VALVE.OPEN,
    /** @type {number} 닫는 중 */
    4: deviceModelStatus.VALVE.CLOSING,
    /** @type {number} 여는 중 */
    5: deviceModelStatus.VALVE.OPENING,
  },
  /** @type {Object} 펌프 */
  [deviceModel.PUMP]: {
    /** @type {number} 켜짐 */
    0: deviceModelStatus.PUMP.ON,
    /** @type {number} 꺼짐 */
    1: deviceModelStatus.PUMP.OFF,
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
        key: deviceModel.WATER_DOOR,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToDec,
      }, {
        key: deviceModel.WATER_LEVEL,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToDec,
      }, {
        key: deviceModel.SALINITY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      }, {
        key: deviceModel.BATTERY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      }]
    },
    valve: {
      dialing,
      address: '0002',
      length: '6',
      decodingDataList: [{
        key: deviceModel.VALVE,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToDec,
      }, {
        key: deviceModel.WATER_LEVEL,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToDec,
      },
      {
        key: deviceModel.WATER_TEMPERATURE,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: deviceModel.MODULE_REAR_TEMPERATURE,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      }, {
        key: deviceModel.BATTERY_VOLTAGE,
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
        key: deviceModel.PUMP,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToDec,
      }, {
        key: deviceModel.BATTERY_VOLTAGE,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      }]
    },
  };
};