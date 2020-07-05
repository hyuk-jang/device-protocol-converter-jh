const Model = require('./Model');

const onDeviceOperationStatus = {
  [Model.CALC_KEY.pvAmp]: amp => {
    return amp > 100 ? 0 : amp;
  },
};
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
        byte: 1,
      },
      {
        byte: 1,
      },
      {
        byte: 1,
      },
      {
        byte: 1,
      },
      {
        byte: 1,
      },
      {
        byte: 1,
      },
      {
        byte: 1,
      },
      {
        byte: 1,
      },
      // {
      //   byte: 1,
      // },
      {
        key: Model.BASE_KEY.ampCh1,
        scale: 0.01,
        fixed: 2,
        decodingKey: Model.CALC_KEY.pvAmp,
      },
      {
        key: Model.BASE_KEY.volCh1,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.ampCh2,
        scale: 0.01,
        fixed: 2,
        decodingKey: Model.CALC_KEY.pvAmp,
      },
      {
        key: Model.BASE_KEY.volCh2,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.ampCh3,
        scale: 0.01,
        fixed: 2,
        decodingKey: Model.CALC_KEY.pvAmp,
      },
      {
        key: Model.BASE_KEY.volCh3,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.ampCh4,
        scale: 0.01,
        fixed: 2,
        decodingKey: Model.CALC_KEY.pvAmp,
      },
      {
        key: Model.BASE_KEY.volCh4,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.ampCh5,
        scale: 0.01,
        fixed: 2,
        decodingKey: Model.CALC_KEY.pvAmp,
      },
      {
        key: Model.BASE_KEY.volCh5,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.ampCh6,
        scale: 0.01,
        fixed: 2,
        decodingKey: Model.CALC_KEY.pvAmp,
      },
      {
        key: Model.BASE_KEY.volCh6,
        scale: 0.1,
        fixed: 1,
      },
    ],
  };
  return PV;
};
