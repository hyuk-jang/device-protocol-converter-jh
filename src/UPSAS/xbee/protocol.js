const { BU } = require('base-util-jh');

const Model = require('./Model');
const { parsingMethod } = require('../../format/moduleDefine');

const { BASE_KEY: BK } = Model;

const {
  device: {
    CONNECTOR_GROUND_RELAY,
    WATER_DOOR,
    VALVE,
    GATE_VALVE,
    PUMP,
    WATER_LEVEL,
    BRINE_TEMPERATURE,
    MODULE_FRONT_TEMPERATURE,
    MODULE_REAR_TEMPERATURE,
    SALINITY,
  },
} = new Model();

const onDeviceOperationStatus = {
  /** @type {Object} 수문 상태 */
  [WATER_DOOR.KEY]: {
    /** @type {string} 정지 */
    0: WATER_DOOR.STATUS.STOP,
    /** @type {string} 열림 */
    2: WATER_DOOR.STATUS.OPEN,
    /** @type {string} 여는 중 */
    3: WATER_DOOR.STATUS.CLOSING,
    /** @type {string} 닫힘 */
    4: WATER_DOOR.STATUS.CLOSE,
    /** @type {string} 닫는 중 */
    5: WATER_DOOR.STATUS.OPENING,
  },
  /** @type {Object} 밸브 */
  [VALVE.KEY]: {
    /** @type {number} 미확인 */
    0: VALVE.STATUS.UNDEF,
    /** @type {number} 닫힘 */
    1: VALVE.STATUS.CLOSE,
    /** @type {number} 열림 */
    2: VALVE.STATUS.OPEN,
    /** @type {number} 작업 중 */
    3: VALVE.STATUS.BUSY,
    /** @type {number} 여는 중 */
    4: VALVE.STATUS.OPENING,
    /** @type {number} 닫는중 중 */
    5: VALVE.STATUS.CLOSING,
  },
  /** @type {Object} 펌프 */
  [PUMP.KEY]: {
    /** @type {number} 꺼짐 */
    0: PUMP.STATUS.OFF,
    /** @type {number} 켜짐 */
    1: PUMP.STATUS.ON,
  },

  // 센서 값 유효성 검증
  checkWaterLevel: wl => (wl < 0 || wl > 200 ? null : wl),
  checkTemp: temp => (temp < -20 || temp > 80 ? null : temp),
  checkSalinity: salinity => (salinity < 0 || salinity > 50 ? null : salinity),

  /** @type {Object} 수위 */
  [WATER_LEVEL.KEY]: waterLevel => {
    // 20cm에서 해당 수위(cm)를 뺌
    return this.onDeviceOperationStatus.checkWaterLevel(20 - waterLevel);
  },
  /** @type {Object} 온도 */
  [BRINE_TEMPERATURE.KEY]: temp => {
    return this.onDeviceOperationStatus.checkTemp(temp);
  },
  /** @type {Object} 온도 */
  [MODULE_FRONT_TEMPERATURE.KEY]: temp => {
    return this.onDeviceOperationStatus.checkTemp(temp);
  },
  /** @type {Object} 온도 */
  [MODULE_REAR_TEMPERATURE.KEY]: temp => {
    return this.onDeviceOperationStatus.checkTemp(temp);
  },
  /** @type {Object} 염도 */
  [SALINITY.KEY]: salinity => {
    return this.onDeviceOperationStatus.checkSalinity(salinity);
  },
  /** @type {Object} 접속반 지락 계전기 */
  [CONNECTOR_GROUND_RELAY.KEY]: {
    /** 지락 발생 */
    0: 1,
    /** 정상 */
    1: 0,
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

exports.decodingProtocolTable = dialing => {
  /** @type {decodingProtocolInfo} */
  const gateLevelSalinity = {
    dialing,
    address: '0001',
    bodyLength: 12, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: WATER_DOOR.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: WATER_LEVEL.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: SALINITY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const newGateLevelSalinity = {
    dialing,
    address: '0001',
    bodyLength: 13, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: WATER_DOOR.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: WATER_LEVEL.KEY,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: SALINITY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
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
        key: VALVE.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: WATER_LEVEL.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: BRINE_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: MODULE_REAR_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const salternBlockValve = {
    dialing,
    address: '0002',
    bodyLength: 21,
    decodingDataList: [
      {
        key: GATE_VALVE.KEY,
        decodingKey: VALVE.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: WATER_LEVEL.KEY,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BRINE_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: MODULE_REAR_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
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
        key: PUMP.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
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
        key: VALVE.KEY,
        byte: 2,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: WATER_LEVEL.KEY,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: MODULE_REAR_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: MODULE_REAR_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
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
        key: CONNECTOR_GROUND_RELAY.KEY,
        byte: 1,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: CONNECTOR_GROUND_RELAY.KEY,
        byte: 1,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const envModuleTemp = {
    dialing,
    address: '0012',
    bodyLength: 12,
    decodingDataList: [
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: BK.moduleRearTemperature,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: BK.moduleRearTemperature,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
    ],
  };

  return {
    gateLevelSalinity,
    newGateLevelSalinity,
    valve,
    salternBlockValve,
    pump,
    earthModule,
    connectorGroundRelay,
    envModuleTemp,
  };
};
