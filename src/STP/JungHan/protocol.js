const _ = require('lodash');
const { BU } = require('base-util-jh');

const Model = require('./Model');

const { BASE_KEY: BK } = Model;

const { parsingMethod } = require('../../format/moduleDefine');

/**
 *
 * @param {protocol_info} protocolInfo
 */
exports.decodingProtocolTable = (protocolInfo = {}) => {
  // 국번은 숫자
  const { deviceId: dialing } = protocolInfo;
  /** @type {decodingProtocolInfo} */
  const BASE = {
    dialing,
    // address: 10,
    bodyLength: 25,
    decodingDataList: [
      {
        startIndex: 10,
        key: BK.sgValveFd,
        byte: 2,
      },
      {
        startIndex: 11,
        key: BK.colValveFd,
        byte: 2,
      },
      {
        startIndex: 12,
        // key: BK.ot1ValveFd,
        key: BK.otValveFd,
        byte: 2,
      },
      {
        startIndex: 13,
        // key: BK.ot2ValveFd,
        key: BK.otValveFd,
        byte: 2,
      },
      {
        startIndex: 14,
        // key: BK.op2Amp,
        key: BK.opAmp,
        byte: 4,
      },
      {
        startIndex: 16,
        // key: BK.op1Amp,
        key: BK.opAmp,
        byte: 4,
      },
      {
        startIndex: 18,
        key: BK.sgPressure,
        byte: 4,
      },
      {
        startIndex: 20,
        key: BK.outsideIrradiance,
        byte: 4,
      },
      {
        startIndex: 22,
        key: BK.colOilInletTemp,
        byte: 4,
      },
      {
        startIndex: 24,
        key: BK.colOilOutletTemp,
        byte: 4,
      },
      {
        startIndex: 26,
        // key: BK.ot1Temp,
        key: BK.otTemp,
        byte: 4,
      },
      {
        startIndex: 28,
        // key: BK.ot2Temp,
        key: BK.otTemp,
        byte: 4,
      },
      {
        startIndex: 30,
        key: BK.outsideTemp,
        byte: 4,
      },
      {
        startIndex: 32,
        key: BK.sgInletTemp,
        byte: 4,
      },
      {
        startIndex: 34,
        key: BK.sgTemp,
        byte: 4,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const FLOW = {
    dialing,
    // address: 100,
    bodyLength: 6,
    decodingDataList: [
      {
        startIndex: 100,
        key: BK.sgCumulativeFlow,
        byte: 4,
      },
      {
        startIndex: 102,
        key: BK.sgInstantaneousFlow,
        byte: 2,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const ADD_SG_FLOW = {
    dialing,
    // address: 600,
    bodyLength: 16,
    decodingDataList: [
      {
        startIndex: 600,
        key: BK.sgOutletFlowRate,
        byte: 4,
      },
      {
        startIndex: 602,
        key: BK.sgOutletFlowRateOperSts,
        byte: 4,
      },
      {
        startIndex: 604,
        key: BK.sgOutletTotalFlowRate,
        byte: 4,
      },
      {},
      {
        startIndex: 608,
        key: BK.sgOutletTemp,
        byte: 4,
      },
      {
        startIndex: 610,
        key: BK.sgOutletPressure,
        byte: 4,
      },
      {
        startIndex: 612,
        key: BK.sgOutletFrequency,
        byte: 4,
      },
      // {
      //   startIndex: 614,
      //   key: BK.sgOutletUnit,
      //   byte: 4,
      // },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const OPER_MODE = {
    dialing,
    // address: 2330,
    bodyLength: 1,
    decodingDataList: [
      {
        startIndex: 2330,
        key: BK.operStsMode,
        byte: 2,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const OPERATION = {
    dialing,
    // address: 70,
    bodyLength: 6,
    decodingDataList: [
      {
        startIndex: 70,
        // key: BK.isRunOp1,
        key: BK.isRunOp,
      },
      {
        startIndex: 71,
        // key: BK.isRunOp2,
        key: BK.isRunOp,
      },
      {
        startIndex: 72,
        key: BK.isModeHeatRelease,
      },
      {
        startIndex: 73,
        key: BK.isRunCol,
      },
      {
        startIndex: 74,
        key: BK.isRunWaterPump,
      },
      {
        startIndex: 75,
        key: BK.isModeHeatSto,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const SYSTEM_ERR = {
    dialing,
    // address: 80,
    bodyLength: 42,
    decodingDataList: [],
  };

  /** @type {decodingProtocolInfo} */
  const MODE = {
    dialing,
    // address: 122,
    bodyLength: 5,
    decodingDataList: [
      {
        startIndex: 122,
        key: BK.isUseOp1,
      },
      {
        startIndex: 123,
        key: BK.isModeDirectStreamOper,
      },
      {
        startIndex: 124,
        key: BK.isModeHeatSto,
      },
      {
        startIndex: 125,
        key: BK.isModeHeatRelease,
      },
      {
        startIndex: 126,
        key: BK.isModeHeatReleaseFirst,
      },
    ],
  };

  // byte는 명시되지 않을 경우 기본 2byte로함, 기본 파서는 convertBufToReadInt
  [BASE, FLOW, ADD_SG_FLOW, OPER_MODE, OPERATION, MODE].forEach(decodingTable => {
    decodingTable.decodingDataList.forEach(decodingInfo => {
      const { byte, callMethod } = decodingInfo;
      if (byte === undefined) {
        decodingInfo.byte = 1;
      }

      if (byte === 2) {
        decodingInfo.callMethod = parsingMethod.convertBufToReadInt;
        // decodingInfo.fixed = 2;
      }

      if (byte === 4) {
        decodingInfo.callMethod = parsingMethod.convertBufToFloat;
        decodingInfo.fixed = 2;
      }
    });
  });

  return {
    BASE,
    FLOW,
    ADD_SG_FLOW,
    OPER_MODE,
    OPERATION,
    MODE,
  };
};

const onDeviceOperationStatus = {
  /** @type {number} ws 풍속(MPH)이므로 환산하여 반환 */
  [BK.windSpeed]: ws => _.round(_.divide(ws, 2.237), 1),
  [BK.windDirection]: wd => {
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
  [BK.outsideAirTemperature]: temp => _.subtract(temp, 40),
  [BK.soilTemperature]: temp => _.subtract(temp, 40),
  [BK.pvRearTemperature]: temp => _.subtract(temp, 40),
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;
