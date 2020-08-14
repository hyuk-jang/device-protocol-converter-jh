const _ = require('lodash');
const { parsingMethod } = require('../../format/moduleDefine');

const { makeTroubleList } = require('../../utils/troubleConverter');

const Model = require('./Model');

const onDeviceOperationStatus = {
  /** @type {Object} MSB -> LSB 로 비트 index 계산 */
  [Model.CALC_KEY.Grid_Fault]: binary => {
    /** @type {troubleInfo[]} */
    const troubleStorage = {
      1: {
        code: '31:High AC Volt',
        msg: '출력 전압 상승',
      },
      2: {
        code: '18:Active AI',
        msg: '-',
      },
      3: {
        code: '17:Passive AI',
        msg: '-',
      },
      4: {
        code: '11:AC Under Freq',
        msg: '출력 저주파수',
      },
      5: {
        code: '10:AC Over Freq',
        msg: '출력 과주파수',
      },
      6: {
        code: '08:AC Under V',
        msg: '출력 전압 부족',
      },
      7: {
        code: '07:AC Over V',
        msg: '출력 과전압',
      },
    };

    return makeTroubleList(binary, troubleStorage);
  },
  /** @type {Object} MSB -> LSB 로 비트 index 계산 */
  [Model.CALC_KEY.Fault1]: binary => {
    /** @type {troubleInfo[]} */
    const troubleStorage = {
      0: {
        code: '09:INV Over Temp',
        msg: '인버터 내부 과열',
      },
      1: {
        code: '14:Ground Fault',
        msg: '누설 전류 검출',
      },
      2: {
        code: '13:OUT DC I',
        msg: '직류 성분 검출',
      },
      3: {
        code: '04:DC Link Over V',
        msg: '부스터 과전압',
      },
      4: {
        code: '06: INV Over I',
        msg: '출력 과전류',
      },
      5: {
        code: '출력 순시 과전압',
        msg: '출력 순시 과전압',
      },
      6: {
        code: '01:Solar Under V',
        msg: '입력 저전압',
      },
      7: {
        code: '02:Solar Over V',
        msg: '입력 과전압',
      },
    };

    return makeTroubleList(binary, troubleStorage);
  },
  /** @type {Object} MSB -> LSB 로 비트 index 계산 */
  [Model.CALC_KEY.Fault2]: binary => {
    /** @type {troubleInfo[]} */
    const troubleStorage = {
      5: {
        code: '12:Solar Over P',
        msg: '입력 과전력',
      },
    };

    return makeTroubleList(binary, troubleStorage);
  },
  /** @type {Object} MSB -> LSB 로 비트 index 계산 */
  [Model.CALC_KEY.Warring]: binary => {
    /** @type {troubleInfo[]} */
    const troubleStorage = {
      4: {
        code: '33:Curr Derating',
        msg: '전류 출력 제한',
        isError: 0,
      },
      5: {
        code: '31:Temp Derating',
        msg: '고온 출력 제한',
        isError: 0,
      },
      7: {
        code: '출력전력제한',
        msg: '출력 전력 제한',
        isError: 0,
      },
    };

    return makeTroubleList(binary, troubleStorage);
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

/**
 *
 * @param {protocol_info} dialing
 */
const decodingProtocolTable = dialing => {
  /** @type {decodingProtocolInfo} */
  const DEFAULT = {
    dialing,
    length: 36, // 수신할 데이터 Byte,
    decodingDataList: [
      {
        key: Model.BASE_KEY.pvVol,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.01,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.pvKw,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.001,
        fixed: 3,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.01,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.pvKw,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.001,
        fixed: 3,
      },
      {
        key: Model.BASE_KEY.gridRsVol,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.gridRAmp,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.01,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.powerGridKw,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.001,
        fixed: 3,
      },
      {
        key: Model.BASE_KEY.gridLf,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.powerCpKwh,
        byte: 3,
        callMethod: parsingMethod.convertBufToReadInt,
      },
      {
        key: Model.BASE_KEY.powerDailyKwh,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.01,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.operTemperature,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: null,
      },
      {
        key: null,
        byte: 3,
      },
      {
        key: null,
        decodingKey: Model.CALC_KEY.INV_Status,
      },
      {
        key: Model.BASE_KEY.operTroubleList,
        decodingKey: Model.CALC_KEY.Grid_Fault,
        callMethod: parsingMethod.convertBufToHexToBin,
      },
      {
        key: Model.BASE_KEY.operTroubleList,
        decodingKey: Model.CALC_KEY.Fault1,
        callMethod: parsingMethod.convertBufToHexToBin,
      },
      {
        key: Model.BASE_KEY.operTroubleList,
        decodingKey: Model.CALC_KEY.Fault2,
        callMethod: parsingMethod.convertBufToHexToBin,
      },
      {
        key: Model.BASE_KEY.operTroubleList,
        decodingKey: Model.CALC_KEY.Warring,
        callMethod: parsingMethod.convertBufToHexToBin,
      },
    ],
  };

  DEFAULT.decodingDataList.forEach(decodingInfo => {
    const { callMethod } = decodingInfo;
    if (callMethod === parsingMethod.convertBufToReadInt) {
      decodingInfo.isLE = true;
    }
  });

  return {
    DEFAULT,
  };
};
exports.decodingProtocolTable = decodingProtocolTable;
