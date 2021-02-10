const { parsingMethod } = require('../../format/moduleDefine');

const Model = require('./Model');

/**
 * 기본 Data Float 형
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
        byte: 12,
      },
      // 상전압 V1, V2, V3
      {
        key: Model.BASE_KEY.gridRsVol,
      },
      {
        key: Model.BASE_KEY.gridStVol,
      },
      {
        key: Model.BASE_KEY.gridTrVol,
      },
      // 전류 A1, A2, A3
      {
        key: Model.BASE_KEY.gridRAmp,
      },
      {
        key: Model.BASE_KEY.gridSAmp,
      },
      {
        key: Model.BASE_KEY.gridTAmp,
      },
      // 유효전력 W1, W2, W3, Total W
      {
        key: Model.BASE_KEY.powerGridKw,
      },
      {
        byte: 12,
      },
      // 무효전력 var1, var2, var3, Total var
      {
        byte: 16,
      },
      // 피상전력 VA1, VA2, VA3, Total VA
      {
        byte: 16,
      },
      // 역률 PF1, PF2, PF3, AVG PF
      {
        byte: 12,
      },
      {
        key: Model.BASE_KEY.powerPf,
      },
      // 주파수
      {
        key: Model.BASE_KEY.gridLf,
      },
      // 전체 유효전력량 + Wh (4 Address),  - Wh (4 Address)
      {
        key: Model.BASE_KEY.powerCpKwh,
        byte: 8,
        callMethod: parsingMethod.convertBufToFloat,
      },
    ],
  };

  // byte는 명시되지 않을 경우 기본 2byte로함, 기본 파서는 convertBufToReadInt
  [DEFAULT].forEach(decodingTable => {
    decodingTable.decodingDataList.forEach(decodingInfo => {
      const { byte, callMethod } = decodingInfo;
      if (byte === undefined) {
        decodingInfo.byte = 4;
        decodingInfo.callMethod = parsingMethod.convertBufToFloat;
      }
    });
  });

  return { DEFAULT };
};
exports.decodingProtocolTable = decodingProtocolTable;

const onDeviceOperationStatus = {};
exports.onDeviceOperationStatus = onDeviceOperationStatus;
