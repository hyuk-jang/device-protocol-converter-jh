const { parsingMethod } = require('../../format/moduleDefine');

const Model = require('./Model');

const onDeviceOperationStatus = {};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

/**
 *
 * @param {protocol_info} dialing
 */
exports.decodingProtocolTable = dialing => {
  /** @type {decodingProtocolInfo} */
  const DEFAULT = {
    dialing,
    decodingDataList: [
      // 선간전압 V12, V23, V31
      {
        byte: 1,
      },
      {
        byte: 1,
      },
      {
        byte: 1,
      },
      // 상전압 V1, V2, V3
      {
        key: Model.BASE_KEY.gridRsVol,
        callMethod: parsingMethod.convertReadBuf,
      },
      {
        byte: 1,
      },
      {
        byte: 1,
      },
      // 전류 A1, A2, A3
      {
        key: Model.BASE_KEY.gridRAmp,
        callMethod: parsingMethod.convertReadBuf,
      },
      {
        byte: 1,
      },
      {
        byte: 1,
      },
      // 유효전력 W1, W2, W3, Total W
      {
        key: Model.BASE_KEY.powerGridKw,
        callMethod: parsingMethod.convertReadBuf,
        scale: 0.001,
        fixed: 4,
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
      // 무효전력 var1, var2, var3, Total var
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
      // 피상전력 VA1, VA2, VA3, Total VA
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
      // 역률 PF1, PF2, PF3, Total PF
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
        key: Model.BASE_KEY.powerPf,
        callMethod: parsingMethod.convertReadBuf,
      },
      // 주파수
      {
        key: Model.BASE_KEY.gridLf,
        callMethod: parsingMethod.convertReadBuf,
      },
      // 전체 유효전력량 + Wh (2 Address),  - Wh (2 Address)
      {
        key: Model.BASE_KEY.powerCpKwh,
        callMethod: parsingMethod.convertReadBuf,
        byte: 2,
        scale: 0.001,
        fixed: 3,
      },
      {
        byte: 1,
      },
      {
        byte: 1,
      },
    ],
  };

  return DEFAULT;
};
