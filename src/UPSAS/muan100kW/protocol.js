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
    /** @type {string} 여는 중 */
    3: WATER_DOOR.STATUS.CLOSING,
    /** @type {string} 닫힘 */
    4: WATER_DOOR.STATUS.CLOSE,
    /** @type {string} 닫는 중 */
    5: WATER_DOOR.STATUS.OPENING,
  },
  /** @type {Object} 게이트밸브 */
  [GATE_VALVE.KEY]: {
    /** @type {number} 닫힘 */
    1: VALVE.STATUS.CLOSE,
    /** @type {number} 열림 */
    2: VALVE.STATUS.OPEN,
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
    1: PUMP.STATUS.OFF,
    /** @type {number} 켜짐 */
    2: PUMP.STATUS.ON,
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

exports.decodingProtocolTable = dialing => {
  /** @type {decodingProtocolInfo} */
  const gsWaterDoor = {
    dialing,
    address: '0001',
    bodyLength: 6,
    decodingDataList: [
      {
        key: BK.waterDoor,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const gsGateValve = {
    dialing,
    address: '0002',
    bodyLength: 6,
    decodingDataList: [
      {
        key: BK.gateValve,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const gsPump = {
    dialing,
    address: '0003',
    bodyLength: 6,
    decodingDataList: [
      {
        key: BK.pump,
        byte: 2,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
    ],
  };

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
        byte: 4,
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
        byte: 4,
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
        byte: 4,
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
        byte: 4,
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
        byte: 4,
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
  const env = {
    dialing,
    decodingDataList: [
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: BK.salinity,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: BK.waterLevel,
        byte: 4,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: BK.brineTemperature,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
      {
        key: BK.moduleRearTemperature,
        byte: 6,
        callMethod: parsingMethod.convertBufToHexToNum,
      },
    ],
  };

  return {
    gsGateValve,
    gsPump,
    gsWaterDoor,
    waterDoor,
    valve,
    gateValve,
    pump,
    earthModule,
    connectorGroundRelay,
    sensor,
    env,
  };
};
