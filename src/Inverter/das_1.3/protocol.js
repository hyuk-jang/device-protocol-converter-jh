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
  [Model.BASE_KEY.operIsRun]: {
    /** @type {number} 동작중 */
    0: 1,
    /** @type {number} 정지 */
    1: 0,
  },
  /** @type {Object} 프로텍션 리스트 */
  [Model.BASE_KEY.operTroubleList]: faultNumber => {
    const faulInfo = {
      0: {},
      1: {
        code: 'EARTH FAULT',
        msg: '누설 전류 검출 (일종의 누전상태)',
        isError: 1,
      },
      2: {
        code: 'OVER HEAT',
        msg: '시스템 과열(단상 95도, 삼상 85도)',
        isError: 1,
      },
      3: {
        code: 'DC OVER VOLTAGE',
        msg: 'DC-LINK 과전압',
        isError: 1,
      },
      4: {
        code: 'MC ERROR',
        msg: '계통과 연결하는 MC 의 오작동',
        isError: 1,
      },
      5: {
        code: 'DC LINK ERROR',
        msg: 'DC-LINK 센싱 불량',
        isError: 1,
      },
      6: {
        code: 'AC OVER CURRENT',
        msg: 'AC 출력 과전류',
        isError: 1,
      },
      7: {
        code: 'PV ERROR',
        msg: 'PV 모듈 배선의 역결선',
        isError: 1,
      },
      8: {
        code: 'LINE CONNECTED',
        msg: 'STAND ALONE시 계통 연결',
        isError: 1,
      },
      9: {
        code: 'OVER CUR.2',
        msg: '출력 IGBT 과전류',
        isError: 1,
      },
      A: {
        code: 'OVER CUR.2(2)',
        msg: '출력 IGBT(2) 과전류',
        isError: 1,
      },
      B: {
        code: 'OVER CUR.2(3)',
        msg: '출력 IGBT(3) 과전류',
        isError: 1,
      },
      C: {
        code: 'OVER CUR.2(4)',
        msg: '출력 IGBT(4) 과전류',
        isError: 1,
      },
      D: {
        code: 'REVERSE PHASE',
        msg: '계통 배선의 역결선',
        isError: 1,
      },
      E: {
        code: 'DC UNBALANCE',
        msg: 'DC-LINK 불균형',
        isError: 1,
      },
      F: {
        code: 'UNDER VOLTAGE',
        msg: 'DC-LINK 저전압',
        isError: 1,
      },
      G: {
        code: 'PV OVER VOLTAGE',
        msg: 'PV 과전압',
        isError: 1,
      },
      H: {
        code: 'PV UNDER VOLTAGE',
        msg: 'PV 저전압',
        isError: 1,
      },
      I: {
        code: 'DC OVER CURRENT',
        msg: 'DC 과전류 Error',
        isError: 1,
      },
      J: {
        code: 'INTERNAL COMMUNICATION FAULT',
        msg: '내부통신 이상 Error',
        isError: 1,
      },
      K: {
        code: 'LINE OVER FREQUENCY',
        msg: '계통 과주파수',
        isError: 1,
      },
      L: {
        code: 'LINE UNDER FREQUENCY',
        msg: '계통 저주파수',
        isError: 1,
      },
      M: {
        code: 'LINE OVER VOLTAGE',
        msg: '계통 과전압',
        isError: 1,
      },
      N: {
        code: 'LINE UNDER VOLTAGE',
        msg: '계통 저전압',
        isError: 1,
      },
      O: {
        code: 'DC OFFSET FAULT',
        msg: 'DC OFFSET FAULT Error',
        isError: 1,
      },
      P: {
        code: 'AC CURRENT UNBALANCE',
        msg: 'AC 전류 불균형',
        isError: 1,
      },
      Q: {
        code: 'OVER CUR.2(5)',
        msg: '출력 IGBT(5) 과전류',
        isError: 1,
      },
      R: {
        code: 'OVER CUR.2(6)',
        msg: '출력 IGBT(6) 과전류',
        isError: 1,
      },
      S: {
        code: 'EMERGENCY STOP',
        msg: '긴급 정지',
        isError: 1,
      },
      T: {
        code: 'SPD FAULT',
        msg: 'SPD 이상',
        isError: 1,
      },
      U: {
        code: 'SMPS FAULT',
        msg: 'SMPS 이상',
        isError: 1,
      },
      V: {
        code: 'CURRENT LIMIT (DC & AC)',
        msg: '전류 제한 경고',
        isError: 0,
      },
      W: {
        code: 'TEMPERATURE DERATING',
        msg: '온도 제한 경고',
        isError: 0,
      },
      X: {
        code: 'FAN LOCKED',
        msg: 'FAN 동작 경고',
        isError: 0,
      },
      Y: {
        code: 'FAN LIFE',
        msg: 'FAN 수명 경고',
        isError: 0,
      },
      Z: {
        code: 'CAPACITOR LIFE',
        msg: '커패시터 수명',
        isError: 0,
      },
    };

    const fault = _.get(faulInfo, faultNumber, []);
    if (_.isEmpty(fault)) {
      return [];
    }
    return [fault];
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

exports.decodingProtocolTable = dialing => {
  /** @type {decodingProtocolInfo} */
  const SYSTEM = {
    dialing,
    address: 0,
    bodyLength: 17,
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
  };
  /** @type {decodingProtocolInfo} */
  const PV = {
    dialing,
    code: 'D',
    address: 1,
    bodyLength: 20, // 수신할 데이터 Byte,
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
        scale: _.get(dialing, 'option.isKwUnit', true) === true ? 0.1 : 0.001,
        fixed: _.get(dialing, 'option.isKwUnit', true) === true ? 1 : 3,
      },
    ],
  };
  /** @type {decodingProtocolInfo} */
  const GRID_VOL = {
    dialing,
    code: 'D',
    address: 2,
    bodyLength: 22, // 수신할 데이터 Byte,
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
  };
  /** @type {decodingProtocolInfo} */
  const GRID_AMP = {
    dialing,
    code: 'D',
    address: 3,
    bodyLength: 21, // 수신할 데이터 Byte,
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
  };
  /** @type {decodingProtocolInfo} */
  const POWER = {
    dialing,
    code: 'D',
    address: 4,
    bodyLength: 19, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.powerGridKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: _.get(dialing, 'option.isKwUnit', true) === true ? 0.1 : 0.001,
        fixed: _.get(dialing, 'option.isKwUnit', true) === true ? 1 : 3,
      },
      {
        key: Model.BASE_KEY.powerCpKwh,
        byte: 7,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
    ],
  };
  /** @type {decodingProtocolInfo} */
  const OPERATION = {
    dialing,
    code: 'D',
    address: 6,
    bodyLength: 12, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.operIsError,
        byte: 1,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.operIsRun,
        byte: 1,
        callMethod: parsingMethod.convertBufToStrToNum,
      },
      {
        key: Model.BASE_KEY.operTroubleList,
        byte: 1,
        callMethod: parsingMethod.convertBufToStr,
      },
    ],
  };

  return {
    SYSTEM,
    PV,
    GRID_VOL,
    GRID_AMP,
    POWER,
    OPERATION,
  };
};
