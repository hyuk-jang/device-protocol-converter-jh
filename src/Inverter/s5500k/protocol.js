const _ = require('lodash');
const { parsingMethod } = require('../../format/moduleDefine');

const Model = require('./Model');

const onDeviceOperationStatus = {
  /** @type {Object} 오류 */
  [Model.CALC_KEY.INV_Status]: {
    0: {},
    1: {
      code: 'EARTH FAULT',
      msg: '누설 전류 검출 (일종의 누전상태)',
      isError: 1,
    },
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

/**
 *
 * @param {protocol_info} protocol_info
 */
const decodingProtocolTable = protocol_info => {
  const returnValue = {
    DEFAULT: {
      dialing: _.get(protocol_info, 'deviceId'),
      length: 39, // 수신할 데이터 Byte,
      decodingDataList: [
        {
          key: null,
          byte: 2,
        },
        {
          key: Model.BASE_KEY.sysSn,
          byte: 1,
          callMethod: parsingMethod.convertBufToHexToDec,
        },
        {
          key: Model.BASE_KEY.pvVol,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.1,
          fixed: 1,
        },
        {
          key: Model.BASE_KEY.pvAmp,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.01,
          fixed: 2,
        },
        {
          key: Model.BASE_KEY.pvKw,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.001,
          fixed: 3,
        },
        {
          key: Model.BASE_KEY.pvVol2,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.1,
          fixed: 1,
        },
        {
          key: Model.BASE_KEY.pvAmp2,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.01,
          fixed: 2,
        },
        {
          key: Model.BASE_KEY.pvKw2,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.001,
          fixed: 3,
        },
        {
          key: Model.BASE_KEY.gridRsVol,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.1,
          fixed: 1,
        },
        {
          key: Model.BASE_KEY.gridRAmp,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.01,
          fixed: 2,
        },
        {
          key: Model.BASE_KEY.powerGridKw,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.001,
          fixed: 3,
        },
        {
          key: Model.BASE_KEY.gridLf,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.1,
          fixed: 1,
        },
        {
          key: Model.BASE_KEY.powerCpKwh,
          byte: 3,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
        },
        {
          key: Model.BASE_KEY.powerDailyKwh,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.01,
          fixed: 2,
        },
        {
          key: Model.BASE_KEY.operTemperature,
          byte: 2,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
          scale: 0.1,
          fixed: 1,
        },
        {
          key: null,
          byte: 1,
          callMethod: null,
        },
        {
          key: Model.BASE_KEY.operTime,
          byte: 3,
          calcParsingKey: Model.CALC_KEY.Time,
          callMethod: parsingMethod.convertBufToHexToDec,
          hasReverse: true,
        },
        {
          key: Model.BASE_KEY.operTroubleList,
          byte: 1,
          calcParsingKey: Model.CALC_KEY.INV_Status,
          callMethod: parsingMethod.convertBufToHexToBin,
        },
        {
          key: Model.BASE_KEY.operTroubleList,
          byte: 1,
          calcParsingKey: Model.CALC_KEY.Grid_Fault,
          callMethod: parsingMethod.convertBufToHexToBin,
        },
        {
          key: Model.BASE_KEY.operTroubleList,
          byte: 1,
          calcParsingKey: Model.CALC_KEY.Fault1,
          callMethod: parsingMethod.convertBufToHexToBin,
        },
        {
          key: Model.BASE_KEY.operTroubleList,
          byte: 1,
          calcParsingKey: Model.CALC_KEY.Fault2,
          callMethod: parsingMethod.convertBufToHexToBin,
        },
        {
          key: Model.BASE_KEY.operTroubleList,
          byte: 1,
          calcParsingKey: Model.CALC_KEY.Warring,
          callMethod: parsingMethod.convertBufToHexToBin,
        },
      ],
    },
  };
  return returnValue;
};
exports.decodingProtocolTable = decodingProtocolTable;
