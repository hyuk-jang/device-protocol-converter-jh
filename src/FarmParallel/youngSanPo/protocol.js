const _ = require('lodash');
const {parsingMethod} = require('../../format/moduleDefine');

const Model = require('./Model');

const onDeviceOperationStatus = {
  /** @type {Object} 강수 여부 */
  [Model.BASE_KEY.isRain]: {
    /** @type {number} 비 감지 Off */
    0: 'Off',
    /** @type {string} 비 감지 On */
    1: 'ON',
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

/**
 *
 * @param {protocol_info} protocolInfo
 */
exports.decodingProtocolTable = protocolInfo => {
  const dialing = _.get(protocolInfo, 'deviceId');
  /** @type {decodingProtocolInfo} */
  const SITE = {
    dialing,
    address: 0,
    length: 12,
    decodingDataList: [
      {
        key: Model.BASE_KEY.lux,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.solar,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.soilTemperature,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.soilReh,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.co2,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.soilWaterValue,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.outsideAirTemperature,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.outsideAirReh,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.windSpeed,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.windDirection,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.r1,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.isRain,
      },
    ],
  };

  return {
    SITE,
  };
};
