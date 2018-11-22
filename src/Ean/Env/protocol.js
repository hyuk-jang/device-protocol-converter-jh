const _ = require('lodash');
const { BU } = require('base-util-jh');
const Model = require('./Model');

const onDeviceOperationStatus = {
  // /** @type {number} ws 풍속(MPH)이므로 환산하여 반환 */
  // [Model.BASE_KEY.windSpeed]: ws => _.round(_.divide(ws, 2.237), 1),
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

/**
 *
 * @param {protocol_info} protocolInfo
 */
exports.decodingProtocolTable = protocolInfo => {
  const dialing = _.get(protocolInfo, 'deviceId');
  /** @type {decodingProtocolInfo} */
  const MAIN_SITE = {
    dialing,
    address: 0,
    bodyLength: 19,
    decodingDataList: [
      {
        key: Model.BASE_KEY.pvRearTemperature,
      },
      {
        key: Model.BASE_KEY.waterTemperature,
      },
      {
        key: Model.BASE_KEY.outsideAirTemperature,
      },
    ],
  };

  return {
    MAIN_SITE,
  };
};
