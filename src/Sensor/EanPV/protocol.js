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
  /** @type {decodingProtocolInfo} */
  const PV_AMP = {
    decodingDataList: [
      {
        key: Model.BASE_KEY.pvAmp,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const PV_VOL = {
    decodingDataList: [
      {
        key: Model.BASE_KEY.pvVol,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const PV_WATT = {
    decodingDataList: [
      {
        key: Model.BASE_KEY.pvWatt,
      },
    ],
  };

  return {
    PV_AMP,
    PV_VOL,
    PV_WATT,
  };
};
