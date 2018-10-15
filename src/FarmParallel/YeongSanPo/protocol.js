const _ = require('lodash');
const Model = require('./Model');

const onDeviceOperationStatus = {
  // /** @type {Object} 강수 여부 */
  // [Model.BASE_KEY.isRain]: {
  //   /** @type {number} 비 감지 Off */
  //   0: 'Off',
  //   /** @type {string} 비 감지 On */
  //   1: 'ON',
  // },
  [Model.BASE_KEY.windDirection]: wd => {
    // 360도를 8등분
    const anglePiece = 45;
    const divideValue = wd / 8;
    const remainValue = wd % 8;
    const lowerNumber = _.multiply(anglePiece, divideValue);
    const upperNumber = _.multiply(anglePiece, divideValue + 1);

    return _.clamp(remainValue, lowerNumber, upperNumber);
  },
  [Model.BASE_KEY.outsideAirTemperature]: temp => _.subtract(temp, 40),
  [Model.BASE_KEY.soilTemperature]: temp => _.subtract(temp, 40),
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
    bodyLength: 18,
    decodingDataList: [
      {},
      {},
      {},
      {},
      {},
      {},
      {
        key: Model.BASE_KEY.lux,
      },
      {
        key: Model.BASE_KEY.solar,
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
        key: Model.BASE_KEY.windDirection,
      },
      {
        key: Model.BASE_KEY.windSpeed,
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
