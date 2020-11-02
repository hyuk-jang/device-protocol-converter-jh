const _ = require('lodash');
const { BU } = require('base-util-jh');

const Model = require('./Model');
const { parsingMethod } = require('../../format/moduleDefine');

const { BASE_KEY: BK } = Model;

const onDeviceOperationStatus = {
  [BK.percentBattery]: Number,
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

exports.decodingProtocolTable = () => {
  /** @type {decodingProtocolInfo} */
  const percentBattery = {
    decodingDataList: [
      {
        key: BK.percentBattery,
        byte: 5,
        callMethod: parsingMethod.convertBufToStr,
        fixed: 1,
      },
    ],
  };

  return percentBattery;
};
