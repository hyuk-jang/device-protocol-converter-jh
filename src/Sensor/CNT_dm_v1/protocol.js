const Model = require('./Model');

const { parsingMethod } = require('../../format/moduleDefine');

const onDeviceOperationStatus = {};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

/**
 *
 * @param {protocol_info} dialing
 */
exports.decodingProtocolTable = dialing => {
  /** @type {decodingProtocolInfo} */
  const PV = {
    dialing,
    decodingDataList: [
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        callMethod: parsingMethod.convertBufToHex,
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
    ],
  };
  return PV;
};
