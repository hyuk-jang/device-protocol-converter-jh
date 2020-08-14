const _ = require('lodash');

const Model = require('./Model');

const { parsingMethod } = require('../../format/moduleDefine');
const { makeTroubleList } = require('../../utils/troubleConverter');

const onDeviceOperationStatus = {
  /** @type {Object}  */
  [Model.CALC_KEY.SolarFaultAddress]: binary => {
    /** @type {troubleInfo[]} */
    const troubleStorage = {
      0: {
        code: 'Solar Cell OV fault',
        msg: '태양전지 과전압',
      },
      1: {
        code: 'Solar Cell OV limit fault',
        msg: '태양전지 과전압 제한초과',
      },
      2: {
        code: 'Solar cell UV fault',
        msg: '태양전지 저전압',
      },
      3: {
        code: 'Solar Cell UV limit fault',
        msg: '태양전지 저전압 제한초과',
      },
    };
    return makeTroubleList(binary, troubleStorage);
  },
  [Model.CALC_KEY.InverterOperationFaultAddress]: binary => {
    // 인버터가 동작 일 때는 binary의 데이터를 0으로 치환
    const binaryArr = [...binary];
    let transBinaryResult;
    _.nth(binaryArr, 1) === '1'
      ? (transBinaryResult = _.fill(binaryArr, '0', 0, 2).join(''))
      : (transBinaryResult = binary);

    /** @type {troubleInfo[]} */
    const troubleStorage = {
      0: {
        code: 'inverter over current fault',
        msg: '인버터 과 전류',
      },
      1: {
        code: 'inverter O.C. overtime fault',
        msg: '인버터 과 전류 시간 초과',
      },
      3: {
        code: 'inverter-Line async fault',
        msg: '계통-인버터 위상 이상',
      },
      5: {
        code: 'inverter fuse open',
        msg: '인버터 퓨즈 단선',
      },
      7: {
        code: 'inverter over temperature fault',
        msg: '인버터 과열',
      },
      8: {
        code: 'inverter MC fault',
        msg: '인버터 MC 이상',
      },
      14: {
        code: 'inverter run',
        msg: '인버터 동작',
      },
    };
    return makeTroubleList(transBinaryResult, troubleStorage);
  },
  [Model.CALC_KEY.LineFaultAddress]: binary => {
    /** @type {troubleInfo[]} */
    const trobleStorage = {
      0: {
        code: 'Line over voltage fault',
        msg: '계통 과 전압',
      },
      1: {
        code: 'Line under voltage fault',
        msg: '계통 저 전압',
      },
      3: {
        code: 'Line failure fault',
        msg: '계통 정전',
      },
      4: {
        code: 'Line over frequency fault',
        msg: '계통 과 주파수',
      },
      5: {
        code: 'Line under frequency fault',
        msg: '계통 저 주파수',
      },
    };
    return makeTroubleList(binary, trobleStorage);
  },
  [Model.CALC_KEY.InverterProductYear]: binary => {
    const inverterProductYear = `20${binary.slice(0, 2)}년`;
    const inverterProductMonth = `${binary.slice(2, 4)}월`;
    const inverterProductDate = `${inverterProductYear} ${inverterProductMonth}`;

    return inverterProductDate;
  },
  [Model.CALC_KEY.InvKwhAdress]: char => {
    const highKwh = parseInt(char.slice(0, 4), 16);
    const lowKwh = parseInt(char.slice(4, 8), 16);
    const powerCpKwh = (highKwh * 10000 + lowKwh) / 1000;

    return powerCpKwh;
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
        key: Model.BASE_KEY.pvVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.pvAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.1,
        fixed: 1,
      },
    ],
  };
  /** @type {decodingProtocolInfo} */
  const GRID_VOL = {
    dialing,
    decodingDataList: [
      {
        key: Model.BASE_KEY.gridRsVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
      },
      {
        key: null,
        byte: 4,
      },
      {
        key: null,
        byte: 4,
      },
      {
        key: Model.BASE_KEY.gridRAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: null,
        byte: 4,
      },
      {
        key: null,
        byte: 4,
      },
      {
        key: Model.BASE_KEY.gridLf,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.1,
        fixed: 1,
      },
    ],
  };
  /** @type {decodingProtocolInfo} */
  const POWER = {
    dialing,
    decodingDataList: [
      {
        key: Model.BASE_KEY.pvKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.001,
        fixed: 3,
      },
      {
        key: Model.BASE_KEY.powerCpKwh,
        byte: 8,
        callMethod: parsingMethod.convertBufToStr,
        decodingKey: Model.CALC_KEY.InvKwhAdress,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.powerGridKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.001,
        fixed: 3,
      },
      {
        key: Model.BASE_KEY.powerMaxKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.001,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.powerPf,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.1,
        fixed: 2,
      },
      {
        key: Model.BASE_KEY.powerDailyKwh,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.1,
        flex: 1,
      },
    ],
  };
  /** @type {decodingProtocolInfo} */
  const SYSTEM = {
    dialing,
    decodingDataList: [
      {
        key: null,
        byte: 1,
      },
      {
        key: Model.BASE_KEY.sysCapaKw,
        byte: 3,
        callMethod: parsingMethod.convertBufToStrToNum,
        scale: 0.1,
      },
      {
        key: Model.BASE_KEY.sysProductYear,
        byte: 4,
        callMethod: parsingMethod.convertBufToStr,
        decodingKey: Model.CALC_KEY.InverterProductYear,
      },
      {
        key: Model.BASE_KEY.sysSn,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
      },
    ],
  };
  /** @type {decodingProtocolInfo} */
  const OPERATION = {
    dialing,
    decodingDataList: [
      {
        key: Model.BASE_KEY.operTroubleList,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToBin,
        decodingKey: Model.CALC_KEY.SolarFaultAddress,
      },
      {
        key: Model.BASE_KEY.operTroubleList,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToBin,
        decodingKey: Model.CALC_KEY.InverterOperationFaultAddress,
      },
      {
        key: Model.BASE_KEY.operTroubleList,
        byte: 4,
        decodingKey: Model.CALC_KEY.LineFaultAddress,
        callMethod: parsingMethod.convertBufToStrToBin,
      },
      {
        key: null,
      },
    ],
  };
  return {
    OPERATION,
    PV,
    GRID_VOL,
    POWER,
    SYSTEM,
  };
};

// // 검증
if (require !== undefined && require.main === module) {
  const model = new Model({
    mainCategory: 'Inverter',
    subCategory: 'hexPower',
    deviceId: '01',
  });

  const cmdList = model.device.DEFAULT.COMMAND.STATUS;

  //   model.makeMsg('')
}
