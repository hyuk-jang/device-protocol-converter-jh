const _ = require('lodash');

const Model = require('./Model');

const { parsingMethod } = require('../../format/moduleDefine');
const { makeTroubleList } = require('../../utils/troubleConverter');

/**
 * 태양전지 환경 계측, 인버터에서 넘어오는 값을 실제 센서 값으로 변경해줘야함.
 * @param {number} sensorDataMinimum 센서 데이터 범위의 최소값
 * @param {number} sensorDataMaximum 센서 데이터 범위의 최대값
 * @param {number} inverterData 응답 받은 데이터 값
 */
function convertEnvSensor(sensorDataMinimum, sensorDataMaximum, inverterData) {
  const invRangeMinimum = 400; // 인버터 데이터 범위의 최소값
  const invRangeMaximum = 2000; // 인버터 데이터 범위의 최대값
  const invDataPercentage = _.floor(
    (inverterData - invRangeMinimum) / (invRangeMaximum - invRangeMinimum),
    3,
  ); // 인버터 데이터 범위 내 값의 퍼센트

  // 인버터 데이터 범위에서 구한 데이터의 위치 값(%)을 센서 데이터 범위에 대입
  return (sensorDataMaximum - sensorDataMinimum) * invDataPercentage + sensorDataMinimum;
}

const onDeviceOperationStatus = {
  /** @type {Object}  */
  [Model.CALC_KEY.SolarFault]: binary => {
    /** @type {troubleInfo[]} */
    const troubleStorage = {
      3: {
        code: 'Solar Cell OV limit fault',
        msg: '태양전지 과 전압 제한초과',
      },
      4: {
        code: 'Soalr Cell UV limit fault',
        msg: '태양전지 저 전압 제한초과',
      },
      11: {
        code: 'Utility line failure',
        msg: '계통 전압 이상(정전)',
      },
    };
    return makeTroubleList(binary, troubleStorage);
  },
  [Model.CALC_KEY.InverterFault]: binary => {
    /** @type {troubleInfo[]} */
    const troubleStorage = {
      11: {
        code: 'inverter over current fault',
        msg: '인버터 과 전류',
      },
    };
    return makeTroubleList(binary, troubleStorage);
  },
  [Model.CALC_KEY.InverterState]: binary => {
    /** @type {troubleInfo[]} */
    const troubleStorage = {
      0: {
        code: 'inverter contactor state',
        msg: '인버터 MC off',
      },
      2: {
        code: 'inverter fuse state',
        msg: '인버터 입력단 Fuse 단선',
      },
      7: {
        code: 'inverter over temperature',
        msg: '인버터 과온',
      },
    };
    return makeTroubleList(binary, troubleStorage);
  },
  [Model.CALC_KEY.InverterOperationFault]: binary => {
    /** @type {troubleInfo[]} */
    const troubleStorage = {
      0: {
        code: 'inverter MC fault',
        msg: '인버터 MC 이상',
      },
      2: {
        code: 'inverter output voltage fault',
        msg: '인버터 출력 전압 이상',
      },
      3: {
        code: 'inverter frequenct fault',
        msg: '인버터 주파수 이상',
      },
      4: {
        code: 'inverter-Line async fault',
        msg: '계통-인버터 위상 이상',
      },
      5: {
        code: 'Line phase sequency fault',
        msg: '계통 R, S, T상 역상',
      },
      6: {
        code: 'Line under voltage fault',
        msg: '계통 저 전압 이상',
      },
      7: {
        code: 'Line over voltage fault',
        msg: '계통 과 전압 이상',
      },
      8: {
        code: 'Line under frequency fault',
        msg: '계통 저 주파수 이상',
      },
      9: {
        code: 'Inverter O.C. overtime fault',
        msg: '인버터 과 전류 시간 초과',
      },
      10: {
        code: 'Line over frequency fault',
        msg: '계통 과 주파수 이상',
      },
    };
    return makeTroubleList(binary, troubleStorage);
  },
  [Model.CALC_KEY.InverterProductYear]: binary => {
    const inverterProductYear = `20${binary.slice(0, 2)}년`;
    const inverterProductMonth = `${binary.slice(2, 4)}월`;
    const inverterProductDate = `${inverterProductYear} ${inverterProductMonth}`;

    return inverterProductDate;
  },
  [Model.CALC_KEY.InvKwhAdress]: char => {
    const lowKwh = parseInt(char.slice(0, 4), 16);
    const highKwh = parseInt(char.slice(4, 8), 16);
    const powerCpKwh = highKwh * 65536 + lowKwh;

    return powerCpKwh;
  },
  [Model.CALC_KEY.EnvSolar]: dec => {
    return convertEnvSensor(0, 2000, dec);
  },
  [Model.CALC_KEY.EnvTemperature]: dec => {
    return convertEnvSensor(-20, 80, dec);
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
        key: Model.BASE_KEY.gridStVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
      },
      {
        key: Model.BASE_KEY.gridTrVol,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
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
        key: Model.BASE_KEY.gridSAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.gridTAmp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.1,
        fixed: 1,
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
        scale: 0.1,
        fixed: 1,
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
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.powerMaxKw,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.1,
        fixed: 1,
      },
      {
        key: Model.BASE_KEY.powerDailyKwh,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        flex: 1,
      },
      {
        key: null,
        byte: 4,
      },
      {
        key: Model.BASE_KEY.powerPf,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        scale: 0.1,
        fixed: 1,
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
        callMethod: parsingMethod.convertBufToStrToBinConverse,
        decodingKey: Model.CALC_KEY.SolarFault,
      },
      {
        key: Model.BASE_KEY.operTroubleList,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToBinConverse,
        decodingKey: Model.CALC_KEY.InverterFault,
      },
      {
        key: Model.BASE_KEY.operTroubleList,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToBin,
        decodingKey: Model.CALC_KEY.InverterState,
      },
      {
        key: Model.BASE_KEY.operTroubleList,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToBinConverse,
        decodingKey: Model.CALC_KEY.InverterOperationFault,
      },
    ],
  };
  /** @type {decodingProtocolInfo} */
  const ENV = {
    dialing,
    decodingDataList: [
      {
        key: Model.BASE_KEY.envInclinedSolar,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        decodingKey: Model.CALC_KEY.EnvSolar,
      },
      {
        key: Model.BASE_KEY.envHorizontalSolar,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        decodingKey: Model.CALC_KEY.EnvSolar,
      },
      {
        key: Model.BASE_KEY.envOutSideAirTemp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        decodingKey: Model.CALC_KEY.EnvTemperature,
      },
      {
        key: Model.BASE_KEY.envModuleTemp,
        byte: 4,
        callMethod: parsingMethod.convertBufToStrToNum,
        callMethodParam: 16,
        decodingKey: Model.CALC_KEY.EnvTemperature,
      },
    ],
  };
  return {
    OPERATION,
    PV,
    GRID_VOL,
    POWER,
    SYSTEM,
    ENV,
  };
};

// 검증
if (require !== undefined && require.main === module) {
  const model = new Model({
    mainCategory: 'Inverter',
    subCategory: 'hexPowerTriple',
    deviceId: '01',
  });

  const cmdList = model.device.DEFAULT.COMMAND.STATUS;
  console.log(cmdList);
  //   model.makeMsg('')
}
