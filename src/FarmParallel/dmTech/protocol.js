const _ = require('lodash');
const { BU } = require('base-util-jh');
const Model = require('./Model');

const onDeviceOperationStatus = {
  /** @type {Object} 강수 여부 */
  // [Model.BASE_KEY.isRain]: {
  //   /** @type {number} 비 감지 Off */
  //   0: 'Off',
  //   /** @type {string} 비 감지 On */
  //   1: 'ON',
  // },
  [Model.BASE_KEY.windDirection]: wd => {
    // BU.CLI(wd);
    // 360도를 8등분
    const anglePiece = 45;
    let divideValue = wd / anglePiece;
    const remainValue = wd % anglePiece;

    const addPiece = _.clamp(remainValue, 0, anglePiece);

    divideValue += addPiece === 0 ? 0 : 1;
    if (divideValue >= 8) {
      divideValue = 0;
    }

    return divideValue;
  },
  [Model.BASE_KEY.outsideAirTemperature]: temp => _.subtract(temp, 40),
  [Model.BASE_KEY.soilTemperature]: temp => _.subtract(temp, 40),
  [Model.BASE_KEY.pvRearTemperature]: temp => _.subtract(temp, 40),
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

/**
 *
 * @param {protocol_info} protocolInfo
 */
exports.decodingProtocolTable = protocolInfo => {
  const dialing = _.get(protocolInfo, 'deviceId');
  /** @type {decodingProtocolInfo} */
  const INCLINED_SITE = {
    dialing,
    address: 0,
    bodyLength: 19,
    decodingDataList: [
      {
        key: Model.BASE_KEY.lux,
      },
      {
        key: Model.BASE_KEY.inclinedSolar,
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
      // {
      //   key: Model.BASE_KEY.pvRearTemperature,
      //   scale: 0.1,
      //   fixed: 1,
      // },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const HORIZONTAL_SITE = {
    dialing,
    address: 0,
    bodyLength: 19,
    decodingDataList: [
      {
        key: Model.BASE_KEY.lux,
      },
      {
        key: Model.BASE_KEY.horizontalSolar,
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
      // {
      //   key: Model.BASE_KEY.pvRearTemperature,
      //   scale: 0.1,
      //   fixed: 1,
      // },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const PRT_SITE = {
    dialing,
    address: 0,
    bodyLength: 19,
    decodingDataList: [
      {
        key: Model.BASE_KEY.lux,
      },
      {
        key: Model.BASE_KEY.inclinedSolar,
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
        key: Model.BASE_KEY.pvRearTemperature,
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
    INCLINED_SITE,
    HORIZONTAL_SITE,
    PRT_SITE,
  };
};
