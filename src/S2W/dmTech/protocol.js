const _ = require('lodash');
const { BU } = require('base-util-jh');
const Model = require('./Model');

const onDeviceOperationStatus = {
  /** @type {number} ws 풍속(MPH)이므로 환산하여 반환 */
  [Model.BASE_KEY.windSpeed]: ws => _.round(_.divide(ws, 2.237), 1),
  [Model.BASE_KEY.windDirection]: wd => {
    // BU.CLI(wd);
    // 0 ~ 360 을 벗어나는 데이터는 임계치로 묶음
    wd = _.clamp(wd, 0, 360);
    // 360도를 8등분
    const anglePiece = 45;
    let divideValue = wd / anglePiece;
    const remainValue = wd % anglePiece;

    // 남은 각도가 다음 각도에 가깝다면 1을 더함
    divideValue += _.divide(anglePiece, 2) > remainValue ? 1 : 0;
    // index 8 --> 360도 각도라면 0으로 교체
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
  // 국번은 숫자
  const dialing = protocolInfo.deviceId;
  /** @type {decodingProtocolInfo} */
  const INSIDE_SITE = {
    dialing,
    address: 0,
    bodyLength: 19,
    decodingDataList: [
      {
        key: Model.BASE_KEY.lux,
      },
      {
        key: Model.BASE_KEY.pvUnderlyingSolar,
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

  /** @type {decodingProtocolInfo} */
  const OUTSIDE_SITE = {
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
    ],
  };

  return {
    INSIDE_SITE,
    OUTSIDE_SITE,
  };
};
