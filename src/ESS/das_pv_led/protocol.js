const _ = require('lodash');
const { parsingMethod } = require('../../format/moduleDefine');

const Model = require('./Model');

const onDeviceOperationStatus = {
  /** @type {Object} 인버터 종류 */
  [Model.BASE_KEY.sysIsSingle]: {
    /** @type {number} 단상 */
    1: 1,
    /** @type {number} 삼상 */
    3: 0,
  },
  // /** @type {Object} 프로텍션 리스트 */
  // [Model.BASE_KEY.operStatus]: {
  //   0: 'Ready',
  //   1: 'PV over current',
  //   2: 'PV over voltage',
  //   3: 'PV Under voltage',
  //   4: 'DC Link over voltage',
  //   5: 'DC Link under voltage',
  //   6: 'Inverter over current',
  //   7: 'Line over voltage',
  //   8: 'Line under voltage',
  //   9: 'Inverter OverHeat1',
  //   'A': 'Line over frequency',
  //   'B': 'Line under frequency',
  //   'C': 'PV Waiting',
  //   'D': 'BAT OV( Over Voltage)',
  //   'E': 'BAT UV(Under Voltage)',
  //   'F': 'BAT OC(Over Current)',
  //   'H': 'DC48V IGBT Fault',
  //   'I': 'DC48V OC(Over Current)',
  //   'J': 'IGBT Boost fault',
  //   'K': 'IGBT inverter fault',
  //   'L': 'Inverter Leakage Current fault',
  //   'M': 'Over Heat ( over 95°C)',
  //   'N': 'Earth fault',
  //   'O': 'Anti islanding Passive',
  //   'P': 'Anti islanding Active',
  //   'S': 'DC48V OV(Over Voltage)',
  //   'U': 'Stand Alone시 계통연계',
  //   'V': 'Continuous fault',
  //   'X': 'Power Down (95%)',
  //   'Y': 'Power Down (90%)',
  // }
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

/**
 *
 * @param {protocol_info} protocolInfo
 */
exports.decodingProtocolTable = protocolInfo => ({
  SYSTEM: {
    dialing: _.get(protocolInfo, 'deviceId'),
    code: 'D',
    address: 0,
    length: 17, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.sysIsSingle,
        startIndex: 2,
        byte: 1,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.sysCapaKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 0,
      },
      {
        key: Model.BASE_KEY.sysLineVoltage,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
    ],
  },
  PV: {
    dialing: _.get(protocolInfo, 'deviceId'),
    code: 'D',
    address: 1,
    length: 20, // 수신할 데이터 Byte,
    // length: 28, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.pvVol,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: _.get(protocolInfo, 'option.isUseKw') === true ? 0.1 : 0.001,
        fixed: _.get(protocolInfo, 'option.isUseKw') === true ? 1 : 3,
      },
      // {
      //   key: Model.BASE_KEY.pvKwh,
      //   byte: 7,
      //   callMethod: parsingMethod.convertBufToStrToNum,
      // }
    ],
  },
  GRID_VOL: {
    dialing: _.get(protocolInfo, 'deviceId'),
    code: 'D',
    address: 2,
    length: 22, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.gridRsVol,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.gridStVol,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.gridTrVol,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.gridLf,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 1,
      },
    ],
  },
  GRID_AMP: {
    dialing: _.get(protocolInfo, 'deviceId'),
    code: 'D',
    address: 3,
    length: 21, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.gridRAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.gridSAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.gridTAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 1,
      },
    ],
  },
  POWER: {
    dialing: _.get(protocolInfo, 'deviceId'),
    code: 'D',
    address: 4,
    length: 19, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.powerGridKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: _.get(protocolInfo, 'option.isUseKw') === true ? 0.1 : 0.001,
        fixed: _.get(protocolInfo, 'option.isUseKw') === true ? 1 : 3,
      },
      {
        key: Model.BASE_KEY.powerTotalKwh,
        byte: 7,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
    ],
  },
  OPERATION: {
    dialing: _.get(protocolInfo, 'deviceId'),
    code: 'D',
    address: 6,
    length: 12, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.operIsError,
        byte: 1,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.operMode,
        byte: 1,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.operStatus,
        byte: 1,
        callMethod: parsingMethod.convertBufToStr,
      },
    ],
  },
  BATTERY: {
    dialing: _.get(protocolInfo, 'deviceId'),
    code: 'D',
    address: 7,
    length: 41, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.batteryVol,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.batteryAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.batteryChargingKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: _.get(protocolInfo, 'option.isUseKw') === true ? 0.1 : 0.001,
        fixed: _.get(protocolInfo, 'option.isUseKw') === true ? 1 : 3,
      },
      {
        key: Model.BASE_KEY.batteryDischargingKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: _.get(protocolInfo, 'option.isUseKw') === true ? 0.1 : 0.001,
        fixed: _.get(protocolInfo, 'option.isUseKw') === true ? 1 : 3,
      },
      {
        key: Model.BASE_KEY.batteryTotalChargingKw,
        byte: 7,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.totalPVGeneratingPowerKwh,
        byte: 7,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
    ],
  },
  LED: {
    dialing: _.get(protocolInfo, 'deviceId'),
    code: 'D',
    address: 8,
    length: 28, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.ledDcVol,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.ledDcAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.ledUsingKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: _.get(protocolInfo, 'option.isUseKw') === true ? 0.1 : 0.001,
        fixed: _.get(protocolInfo, 'option.isUseKw') === true ? 1 : 3,
      },
      {
        key: Model.BASE_KEY.ledTotalUsingKwh,
        byte: 7,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
    ],
  },
  INPUT: {
    dialing: _.get(protocolInfo, 'deviceId'),
    code: 'D',
    address: 9,
    length: 19, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.inputLineKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: _.get(protocolInfo, 'option.isUseKw') === true ? 0.1 : 0.001,
        fixed: _.get(protocolInfo, 'option.isUseKw') === true ? 1 : 3,
      },
      {
        key: Model.BASE_KEY.inputLineTotalKwh,
        byte: 7,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
    ],
  },
});
