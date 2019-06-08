const { BU } = require('base-util-jh');
const { parsingMethod } = require('../../format/moduleDefine');
// require('default-intelligence');
// require('../../../../default-intelligence');
const Model = require('./Model');

const model = new Model();

const onDeviceOperationStatus = {
  /** @type {Object} 수문 상태 */
  [model.device.WATER_DOOR.KEY]: {
    /** @type {string} 정지 */
    0: model.device.WATER_DOOR.STATUS.STOP,
    /** @type {string} 열림 */
    2: model.device.WATER_DOOR.STATUS.OPEN,
    /** @type {string} 여는 중 */
    3: model.device.WATER_DOOR.STATUS.CLOSING,
    /** @type {string} 닫힘 */
    4: model.device.WATER_DOOR.STATUS.CLOSE,
    /** @type {string} 닫는 중 */
    5: model.device.WATER_DOOR.STATUS.OPENING,
  },
  /** @type {Object} 밸브 */
  [model.device.VALVE.KEY]: {
    /** @type {number} 미확인 */
    0: model.device.VALVE.STATUS.UNDEF,
    /** @type {number} 닫힘 */
    1: model.device.VALVE.STATUS.CLOSE,
    /** @type {number} 열림 */
    2: model.device.VALVE.STATUS.OPEN,
    /** @type {number} 작업 중 */
    3: model.device.VALVE.STATUS.BUSY,
    /** @type {number} 닫는 중 */
    4: model.device.VALVE.STATUS.OPENING,
    /** @type {number} 여는 중 */
    5: model.device.VALVE.STATUS.CLOSING,
  },
  /** @type {Object} 펌프 */
  [model.device.PUMP.KEY]: {
    /** @type {number} 꺼짐 */
    0: model.device.PUMP.STATUS.OFF,
    /** @type {number} 켜짐 */
    1: model.device.PUMP.STATUS.ON,
  },
  /** @type {Object} 수위 */
  [model.device.WATER_LEVEL.KEY]: waterLevel =>
    // BU.CLI(waterLevel)
    // 20cm에서 해당 수위(cm)를 뺌
    20 - waterLevel,
  /** @type {Object} 접속반 지락 계전기 */
  [model.device.CONNECTOR_GROUND_RELAY.KEY]: {
    /** 지락 발생 */
    0: 1,
    /** 정상 */
    1: 0,
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

exports.decodingProtocolTable = dialing => {
  /** @type {decodingProtocolInfo} */
  const waterDoor = {
    dialing,
    address: '0001',
    bodyLength: 13, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: model.device.WATER_DOOR.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.WATER_LEVEL.KEY,
        byte: 3,
        callMethod: parsingMethod.convertBufToHexToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: model.device.SALINITY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.BATTERY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const valve = {
    dialing,
    address: '0002',
    bodyLength: '6',
    decodingDataList: [
      {
        key: model.device.VALVE.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.WATER_LEVEL.KEY,
        byte: 3,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.SALINITY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.BRINE_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.MODULE_REAR_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.BATTERY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const gateValve = {
    dialing,
    address: '0002',
    bodyLength: 21,
    decodingDataList: [
      {
        key: model.device.GATE_VALVE.KEY,
        decodingKey: model.device.VALVE.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.WATER_LEVEL.KEY,
        byte: 3,
        callMethod: parsingMethod.convertBufToHexToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: model.device.SALINITY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.BRINE_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.MODULE_REAR_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.BATTERY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
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
        key: model.device.PUMP.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.BATTERY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const earthModule = {
    dialing,
    address: '0005',
    bodyLength: 21,
    decodingDataList: [
      {
        key: model.device.VALVE.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.WATER_LEVEL.KEY,
        byte: 3,
        callMethod: parsingMethod.convertBufToHexToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: model.device.MODULE_REAR_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.MODULE_REAR_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.BATTERY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
    ],
  };
  /** @type {decodingProtocolInfo} */
  const connectorGroundRelay = {
    dialing,
    address: '0006',
    bodyLength: 7,
    decodingDataList: [
      {
        byte: 1,
      },
      {
        key: model.device.CONNECTOR_GROUND_RELAY.KEY,
        byte: 1,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.CONNECTOR_GROUND_RELAY.KEY,
        byte: 1,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.BATTERY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const sensor = {
    dialing,
    address: '0007',
    bodyLength: 7,
    decodingDataList: [
      {
        key: model.device.WATER_LEVEL.KEY,
        byte: 3,
        callMethod: parsingMethod.convertBufToHexToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: model.device.SALINITY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.BRINE_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.MODULE_REAR_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: model.device.BATTERY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
    ],
  };

  return {
    waterDoor,
    valve,
    gateValve,
    pump,
    earthModule,
    connectorGroundRelay,
    sensor,
  };
};
