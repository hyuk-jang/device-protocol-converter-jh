const _ = require('lodash');
const { BU } = require('base-util-jh');

const Model = require('./Model');

const { parsingMethod } = require('../../format/moduleDefine');

const { makeTroubleList } = require('../../utils/troubleConverter');

const onDeviceOperationStatus = {
  /** @param {Buffer} buf -> LSB 로 비트 index 계산 */
  [Model.BASE_KEY.operTroubleList]: buf => {
    const hexBuf = buf.reverse().toString('hex');

    /** @type {troubleInfo[]} */
    const troubleStorage = {
      '00000001': {
        code: '태양전지과전류',
        msg: '-',
      },
      '00000002': {
        code: '태양전지과전압',
        msg: '-',
      },
      '00000004': {
        code: '태양전지저전압',
        msg: '-',
      },
      '00000008': {
        code: 'DCLink과전압',
        msg: '-',
      },
      '00000010': {
        code: 'DCLink저전압',
        msg: '-',
      },
      '00000020': {
        code: '인버터과전류',
        msg: '-',
      },
      '00000040': {
        code: '계통과전압',
        msg: '-',
      },
      '00000080': {
        code: '계통저전압',
        msg: '-',
      },
      '00000100': {
        code: '내부온도초과',
        msg: '-',
      },
      '00000200': {
        code: '계통과주파수',
        msg: '-',
      },
      '00000400': {
        code: '계통저주파수',
        msg: '-',
      },
      '00000800': {
        code: '태양전지과전력',
        msg: '-',
      },
      '00001000': {
        code: 'DC성분규정치초과',
        msg: '-',
      },
      '00002000': {
        code: 'DC배선누전',
        msg: '-',
      },
      '00010000': {
        code: '단독운전',
        msg: '-',
      },
      '00020000': {
        code: '인버터과전류HW',
        msg: '-',
      },
    };

    // BU.CLI(troubleStorage);

    // BU.CLI(hexBuf);
    return _.get(troubleStorage, hexBuf, []);
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

/**
 *
 * @param {} dialing
 */
const decodingProtocolTable = dialing => {
  /** @type {decodingProtocolInfo} */
  const DEFAULT = {
    dialing,
    length: 28, // 수신할 데이터 Byte,
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
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol2,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.1,
        fixed: 1,
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
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.operTemperature,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.powerDailyKwh,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.01,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.powerCpKwh,
        byte: 3,
        callMethod: parsingMethod.convertBufToReadInt,
      },
      {
        key: Model.BASE_KEY.operTroubleList,
        byte: 4,
      },
      {
        key: Model.BASE_KEY.operIsRun,
        byte: 1,
        callMethod: parsingMethod.convertBufToReadInt,
      },
      {
        key: Model.BASE_KEY.gridLf,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.operTime,
        byte: 2,
        callMethod: parsingMethod.convertBufToReadInt,
      },
      {
        key: Model.BASE_KEY.powerPf,
        byte: 1,
        callMethod: parsingMethod.convertBufToReadInt,
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
