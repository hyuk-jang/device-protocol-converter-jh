const { BASE_KEY: BK } = require('./Model');

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
        key: BK.ampCh1,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh2,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh3,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh4,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh1,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh2,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh3,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh4,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh1,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh2,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh3,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh4,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh1,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh2,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh3,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh4,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh1,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh2,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh3,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh4,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh1,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh2,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh3,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh4,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh1,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh2,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh3,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.ampCh4,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh1,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh2,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh3,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: BK.volCh4,
        byte: 4,
        callMethod: parsingMethod.convertBufToHex,
        scale: 0.1,
        fixed: 1,
      },
    ],
  };
  return PV;
};
