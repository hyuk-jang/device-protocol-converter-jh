const _ = require('lodash');
const { BU } = require('base-util-jh');

const { parsingMethod } = require('../../format/moduleDefine');

const Model = require('./Model');

/**
 *
 * @param {protocol_info} dialing
 */
const decodingProtocolTable = dialing => {
  /** @type {decodingProtocolInfo} */
  const DEFAULT = {
    dialing,
    address: 0,
    decodingDataList: [
      // 선간전압 V12, V23, V31
      {
        byte: 6,
      },
      // {
      //   byte: 1,
      // },
      // {
      //   byte: 1,
      // },
      // 상전압 V1, V2, V3
      {
        key: Model.BASE_KEY.gridRsVol,
        callMethod: parsingMethod.convertBufToReadInt,
        byte: 2,
        scale: 0.1,
        fixed: 1,
      },
      {
        byte: 4,
      },
      // {
      //   byte: 1,
      // },
      // 전류 A1, A2, A3
      {
        key: Model.BASE_KEY.gridRAmp,
        callMethod: parsingMethod.convertBufToReadInt,
        byte: 2,
        scale: 0.01,
        fixed: 2,
      },
      {
        byte: 4,
      },
      // {
      //   byte: 1,
      // },
      // 유효전력 W1, W2, W3, Total W
      {
        key: Model.BASE_KEY.powerGridKw,
        callMethod: parsingMethod.convertBufToReadInt,
        byte: 2,
        scale: 0.001,
        fixed: 4,
      },
      {
        byte: 6,
      },
      // 무효전력 var1, var2, var3, Total var
      {
        byte: 8,
      },
      // 피상전력 VA1, VA2, VA3, Total VA
      {
        byte: 8,
      },
      // 역률 PF1, PF2, PF3, Total PF
      {
        byte: 6,
      },
      {
        key: Model.BASE_KEY.powerPf,
        callMethod: parsingMethod.convertBufToReadInt,
        byte: 2,
        scale: 0.1,
        fixed: 1,
      },
      // 주파수
      {
        key: Model.BASE_KEY.gridLf,
        callMethod: parsingMethod.convertBufToReadInt,
        byte: 2,
        scale: 0.01,
        fixed: 2,
      },
      // 전체 유효전력량 + Wh (2 Address),  - Wh (2 Address)
      {
        key: Model.BASE_KEY.powerCpKwh,
        callMethod: parsingMethod.convertBufToReadInt,
        byte: 4,
        scale: 0.001,
        fixed: 3,
      },
      {
        byte: 4,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const RESET_DATA_UNIT = {
    dialing,
    address: 0,
    decodingDataList: [
      // 선간전압 V12, V23, V31
      {
        decodingKey: 'resetDataUnit',
        callMethodParam: DEFAULT.decodingDataList,
        byte: 4,
        scale: 0.1,
        fixed: 1,
      },
    ],
  };

  return { DEFAULT, RESET_DATA_UNIT };
};
exports.decodingProtocolTable = decodingProtocolTable;

const onDeviceOperationStatus = {
  /**
   * @param {Buffer} resetBuffer 4 Byte
   * @param {decodingInfo[]} decodingDataList
   */
  resetDataUnit: (resetBuffer, decodingDataList) => {
    // Buffer[10 20 21 21] --> '10202121'

    resetBuffer.forEach((num, index) => {
      const hex = num.toString(16);
      // 소수점 자리수
      let toFixed = 0;

      const dataUnit = hex.charAt(1);

      // 소수점
      switch (hex.charAt(0)) {
        case '1':
          toFixed = 1;
          break;
        case '2':
          toFixed = 2;
          break;
        case '3':
          toFixed = 3;
          break;
        default:
          break;
      }

      const volKeys = [Model.BASE_KEY.gridRsVol];

      const ampKeys = [Model.BASE_KEY.gridRAmp];

      const kwKeys = [Model.BASE_KEY.powerGridKw];

      const powerKeys = [Model.BASE_KEY.powerCpKwh];

      const resetKeyList = [volKeys, ampKeys, kwKeys, powerKeys];

      const baseScale = {
        // 전압 (V)
        0: 1,
        // 전류 (A)
        1: 1,
        // 출력 (kW)
        2: 0.001,
        // 전력 (kWh)
        3: 0.001,
      };

      const unitScaleTable = {
        // V, A, W, Wh
        0: 1,
        // KV, KA, KW, KWh
        1: 1000,
        // MV, MA, MW, MWh
        2: 10000000,
      };

      resetKeyList[index].forEach(resetKey => {
        const decodingInfo = _.find(decodingDataList, { key: resetKey });

        // 소수점 반영
        decodingInfo.scale = toFixed > 0 ? 1 / 10 ** toFixed : 1;

        // 데이터 단위에 따른 Scale, fixed 변경
        // 기존 Scale * 현재적용 중인 가중치 * 단위에 따른 가중치
        decodingInfo.scale *= baseScale[index] * unitScaleTable[dataUnit];

        decodingInfo.fixed =
          decodingInfo.scale < 1
            ? _.split(decodingInfo.scale, '.')[1].toString().length
            : 0;
      });
    });
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;
