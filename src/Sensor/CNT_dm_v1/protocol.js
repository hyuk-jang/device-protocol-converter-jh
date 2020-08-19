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
      },
      {
        key: BK.ampCh2,
      },
      {
        key: BK.ampCh3,
      },
      {
        key: BK.ampCh4,
      },
      {
        key: BK.volCh1,
      },
      {
        key: BK.volCh2,
      },
      {
        key: BK.volCh3,
      },
      {
        key: BK.volCh4,
      },
      {
        key: BK.ampCh1,
      },
      {
        key: BK.ampCh2,
      },
      {
        key: BK.ampCh3,
      },
      {
        key: BK.ampCh4,
      },
      {
        key: BK.volCh1,
      },
      {
        key: BK.volCh2,
      },
      {
        key: BK.volCh3,
      },
      {
        key: BK.volCh4,
      },
      {
        key: BK.ampCh1,
      },
      {
        key: BK.ampCh2,
      },
      {
        key: BK.ampCh3,
      },
      {
        key: BK.ampCh4,
      },
      {
        key: BK.volCh1,
      },
      {
        key: BK.volCh2,
      },
      {
        key: BK.volCh3,
      },
      {
        key: BK.volCh4,
      },
      {
        key: BK.ampCh1,
      },
      {
        key: BK.ampCh2,
      },
      {
        key: BK.ampCh3,
      },
      {
        key: BK.ampCh4,
      },
      {
        key: BK.volCh1,
      },
      {
        key: BK.volCh2,
      },
      {
        key: BK.volCh3,
      },
      {
        key: BK.volCh4,
      },
    ],
  };

  PV.decodingDataList.forEach(decodingInfo => {
    decodingInfo.byte = 4;
    decodingInfo.scale = 0.1;
    decodingInfo.fixed = 1;
    decodingInfo.callMethod = parsingMethod.convertBufToStrToNum;
  });

  return PV;
};
