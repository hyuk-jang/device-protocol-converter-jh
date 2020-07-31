/**
 * @module baseFormat Module 인버터 데이터 가이드라인
 */
module.exports = {
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number[]=}
   */
  pvAmp: [],
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number[]=}
   */
  pvVol: [],
  /**
   * 전력(power), 단위[kW]
   * @description PV
   * @type {number[]=}
   */
  pvKw: [],
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number[]=}
   */
  pvAmp1: [],
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number[]=}
   */
  pvVol1: [],
  /**
   * 전력(power), 단위[kW]
   * @description PV
   * @type {number[]=}
   */
  pvKw1: [],
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number[]=}
   */
  pvAmp2: [],
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number[]=}
   */
  pvVol2: [],
  /**
   * 전력(power), 단위[kW]
   * @description PV
   * @type {number[]=}
   */
  pvKw2: [],
  /**
   * 태양 전지 현재 전력, 단위[kW]
   * @description Power
   * @type {number[]=}
   */
  powerPvKw: [],
  /**
   * 인버터 현재 전력, 단위[kW]
   * @description Power
   * @type {number[]=}
   */
  powerGridKw: [],
  /**
   * 하루 발전량, 단위[kWh]
   * @description Power
   * @type {number[]=}
   */
  powerDailyKwh: [],
  /**
   * 인버터 누적 발전량, 단위[kWh] Cumulative Power Generation
   * @description Power
   * @type {number[]=}
   */
  powerCpKwh: [],
  /**
   * 역률, 단위[%]
   * @description Power
   * @type {number[]=}
   */
  powerPf: [],
  /**
   * 인버터 최대 출력, 단위[kW]
   * @description Power
   * @type {number[]=}
   */
  powerMaxKw: [],
  /**
   * RS 선간 전압, 단위[V]
   * @description Grid
   * @type {number[]=}
   */
  gridRsVol: [],
  /**
   * ST 선간 전압, 단위[V]
   * @description Grid
   * @type {number[]=}
   */
  gridStVol: [],
  /**
   * TR 선간 전압, 단위[V]
   * @description Grid
   * @type {number[]=}
   */
  gridTrVol: [],
  /**
   * R상 전류, 단위[A]
   * @description Grid
   * @type {number[]=}
   */
  gridRAmp: [],
  /**
   * S상 전류, 단위[A]
   * @description Grid
   * @type {number[]=}
   */
  gridSAmp: [],
  /**
   * T상 전류, 단위[A]
   * @description Grid
   * @type {number[]=}
   */
  gridTAmp: [],
  /**
   * 라인 주파수 Line Frequency, 단위[Hz]
   * @description Grid
   * @type {number[]=}
   */
  gridLf: [],
  /**
   * 단상 or 삼상, 단위[0 or 1]
   * @description System
   * @type {number[]=}
   */
  sysIsSingle: [],
  /**
   * 인버터 용량, 단위[kW] Capacity
   * @description System
   * @type {number[]=}
   */
  sysCapaKw: [],
  /**
   * 인버터 계통 전압, 단위[V] Line Volatage
   * @description System
   * @type {number[]=}
   */
  sysLineVoltage: [],
  /**
   * 제작년도 월 일 yyyymmdd, 단위[yyyymmdd]
   * @description System
   * @type {string[]=}
   */
  sysProductYear: [],
  /**
   * Serial Number, 단위[String]
   * @description System
   * @type {string[]=}
   */
  sysSn: [],
  /**
   * 인버터 동작 유무, 단위[0 or 1]
   * @description Operation
   * @type {number[]=}
   */
  operIsRun: [],
  /**
   * 인버터 에러 발생 유무, 단위[0 or 1]
   * @description Operation
   * @type {number[]=}
   */
  operIsError: [],
  /**
   * 인버터 온도, 단위[°C]
   * @description Operation
   * @type {number[]=}
   */
  operTemperature: [],
  /**
   * 측정 시간
   * @description Measure Time
   * @type {number[]=}
   */
  operTime: [],
  /**
   * 경사면 일사량, 단위[W/㎡]
   * @description Measure Time
   * @type {number[]=}
   */
  envInclinedSolar: [],
  /**
   * 수평면 일사량, 단위[W/㎡]
   * @description Measure Time
   * @type {number[]=}
   */
  envHorizontalSolar: [],
  /**
   * 외부 주위 온도, 단위[°C]
   * @description Measure Time
   * @type {number[]=}
   */
  envOutSideAirTemp: [],
  /**
   * 태양 전지 모듈 온도, 단위[°C]
   * @description Measure Time
   * @type {number[]=}
   */
  envModuleTemp: [],
  /**
   * 경고 리스트
   * @description troubleList
   * @type {{code: string, msg: string, isError: number}[][]=}
   */
  operTroubleList: [],
};
