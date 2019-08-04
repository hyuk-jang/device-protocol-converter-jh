const Model = require('./Model');

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
        byte: 2,
      },
      {
        byte: 2,
      },
      {
        byte: 2,
      },
      {
        byte: 2,
      },
      {
        byte: 2,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        scale: 0.2,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.pvVol,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        scale: 0.2,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.pvVol,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        scale: 0.2,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.pvVol,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        scale: 0.2,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.pvVol,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        scale: 0.2,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.pvVol,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        scale: 0.2,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.pvVol,
        scale: 0.1,
        fixed: 1,
      },
    ],
  };
  return PV;
};
