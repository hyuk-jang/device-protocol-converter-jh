const { BU } = require('base-util-jh');
const { parsingMethod } = require('../../format/moduleDefine');
const Model = require('./Model');

const model = new Model();
const {
  device: {
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
  // 센서 값 유효성 검증
  // checkWaterLevel: wl => (wl < 0 || wl > 200 ? null : wl),
  checkTemp: temp => (temp < -20 || temp > 80 ? null : temp),
  checkSalinity: salinity => (salinity < 0 || salinity > 50 ? null : salinity),

  // /** @type {Object} 수위 */
  // [WATER_LEVEL.KEY]: temp => {
  //   return this.onDeviceOperationStatus.checkWaterLevel(temp);
  // },
  /** @type {Object} 온도 */
  [BRINE_TEMPERATURE.KEY]: temp => this.onDeviceOperationStatus.checkTemp(temp),
  /** @type {Object} 온도 */
  [MODULE_FRONT_TEMPERATURE.KEY]: temp => this.onDeviceOperationStatus.checkTemp(temp),
  /** @type {Object} 온도 */
  [MODULE_REAR_TEMPERATURE.KEY]: temp => this.onDeviceOperationStatus.checkTemp(temp),
  /** @type {Object} 염도 */
  [SALINITY.KEY]: salinity => this.onDeviceOperationStatus.checkSalinity(salinity),
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
  const gsGateValve = {
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
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const valve = {
    dialing,
    address: '0002',
    decodingDataList: [
      {
        key: model.device.VALVE.KEY,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: model.device.WATER_LEVEL.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: model.device.SALINITY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: model.device.BRINE_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: model.device.MODULE_REAR_TEMPERATURE.KEY,
        byte: 6,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: model.device.BATTERY.KEY,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const gateValve = {
    dialing,
    address: '0004',
    bodyLength: 20,
    decodingDataList: [
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.gateValve,
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
  const pump = {
    dialing,
    address: '0005',
    bodyLength: 20,
    decodingDataList: [
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.pump,
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
  const env = {
    dialing,
    address: '0011',
    decodingDataList: [
      {
        key: BK.battery,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.salinity,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: BK.waterLevel,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: BK.brineTemperature,
        byte: 6,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
      },
      {
        key: BK.moduleRearTemperature,
        byte: 6,
        callMethod: parsingMethod.convertBufToStrToNum,
        fixed: 1,
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
    env,
  };
};
