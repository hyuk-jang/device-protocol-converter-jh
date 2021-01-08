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
        // 발생기 밸브 피드백
        startIndex: 10,
        key: BK.fdValveSg,
        byte: 2,
      },
      // 집열기밸브 피드백
      {
        startIndex: 11,
        key: BK.fdValvePtc,
        byte: 2,
      },
      // 1호 오일탱크 밸브 피드백
      {
        startIndex: 12,
        key: BK.fdValveOt,
        byte: 2,
      },
      // 2호 오일탱크 밸브 피드백
      {
        startIndex: 13,
        key: BK.fdValveOt,
        byte: 2,
      },
      // 2# 오일 펌프 전류
      {
        startIndex: 14,
        key: BK.ampOp,
        byte: 4,
      },
      // 1# 오일 펌프 전류
      {
        startIndex: 16,
        key: BK.ampOp,
        byte: 4,
      },
      // 증기발생기 압력
      {
        startIndex: 18,
        key: BK.pressureGaugeSg,
        byte: 4,
      },
      // 현재 방사조도
      {
        startIndex: 20,
        key: BK.irradianceEnv,
        byte: 4,
      },
      // 집열기 오일진입 온도
      {
        startIndex: 22,
        key: BK.tempOil,
        byte: 4,
      },
      // 집열기 오일배출 온도
      {
        startIndex: 24,
        key: BK.tempOil,
        byte: 4,
      },
      // 1#오일탱크 온도
      {
        startIndex: 26,
        key: BK.tempOil,
        byte: 4,
      },
      // 2#오일탱크 온도
      {
        startIndex: 28,
        key: BK.tempOil,
        byte: 4,
      },
      // 현재 환경온도
      {
        startIndex: 30,
        key: BK.tempEnv,
        byte: 4,
      },
      // 발생기 입구온도
      {
        startIndex: 32,
        key: BK.tempOil,
        byte: 4,
      },
      // 증기발생기 온도
      {
        startIndex: 34,
        key: BK.tempOil,
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
      // 증기 누계 유량
      {
        startIndex: 100,
        key: BK.frCumSg,
        byte: 4,
      },
      // 증기 순시 유량
      {
        startIndex: 102,
        key: BK.frInsSg,
        byte: 4,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const SOLAR = {
    dialing,
    // address: 500,
    bodyLength: 16,
    decodingDataList: [
      {
        startIndex: 500,
        key: BK.solarEnv,
        byte: 4,
      },
      {
        startIndex: 502,
        key: BK.solarEnv,
        byte: 4,
      },
    ],
  };

  /** @type {decodingProtocolInfo} */
  const ADD_SG_FLOW = {
    dialing,
    // address: 600,
    bodyLength: 16,
    decodingDataList: [
      // 스팀 유량
      {
        startIndex: 600,
        key: BK.frInsPipe,
        byte: 4,
      },
      // 흐름작동위치
      {
        startIndex: 602,
        key: BK.frInsPipeOper,
        byte: 4,
      },
      // 유량 누계
      {
        startIndex: 604,
        key: BK.frCumPipe,
        byte: 4,
      },
      {
        byte: 4,
      },
      {
        startIndex: 608,
        key: BK.tempSteam,
        byte: 4,
      },
      // 압력
      {
        startIndex: 610,
        key: BK.pressureGaugePipe,
        byte: 4,
      },
      // 주파수
      {
        startIndex: 612,
        key: BK.frequencyPipe,
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
      // 0: 로컬모드 운행중, 1: 타이머모드 운행중, 2: 원격모드 운행중
      {
        startIndex: 2330,
        key: BK.infoSysMode,
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
      // 1# 오일 펌프 동작 유무
      {
        startIndex: 70,
        key: BK.pumpOil,
      },
      // 2# 오일 펌프 동작 유무
      {
        startIndex: 71,
        key: BK.pumpOil,
      },
      // 시스템 ON, 시스템OFF,
      {
        startIndex: 72,
        key: BK.infoSysOper,
      },
      // PTC 집광기 동작 유무
      {
        startIndex: 73,
        key: BK.ptc,
      },
      // 보충 펌프 동작 유무
      {
        startIndex: 74,
        key: BK.pumpSw,
      },
      // 흐린 날씨, 맑은 날씨
      {
        startIndex: 75,
        key: BK.infoSky,
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
    // address: 116,
    bodyLength: 11,
    decodingDataList: [
      {
        startIndex: 116,
        key: BK.modeOt,
      },
      {
        startIndex: 117,
        key: BK.modeOt,
      },
      {
        startIndex: 118,
        key: BK.modeOt,
      },
      {
        startIndex: 119,
        key: BK.modeOt,
      },
      {},
      {},
      {
        startIndex: 122,
        key: BK.infoUseOp,
      },
      {
        startIndex: 123,
        key: BK.modeSteam,
      },
      {
        startIndex: 124,
        key: BK.modeSteam,
      },
      {
        startIndex: 125,
        key: BK.modeSteam,
      },
      {
        startIndex: 126,
        key: BK.modeSteam,
      },
    ],
  };

  // byte는 명시되지 않을 경우 기본 2byte로함, 기본 파서는 convertBufToReadInt
  [BASE, FLOW, SOLAR, ADD_SG_FLOW, OPER_MODE, OPERATION, MODE].forEach(decodingTable => {
    decodingTable.decodingDataList.forEach(decodingInfo => {
      const { byte, callMethod } = decodingInfo;
      if (byte === undefined) {
        decodingInfo.byte = 1;
      }

      if (byte === 2) {
        decodingInfo.callMethod = parsingMethod.convertBufToReadInt;
        decodingInfo.isUnsigned = false;
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
    SOLAR,
    ADD_SG_FLOW,
    OPER_MODE,
    OPERATION,
    MODE,
  };
};

const onDeviceOperationStatus = {};
exports.onDeviceOperationStatus = onDeviceOperationStatus;
