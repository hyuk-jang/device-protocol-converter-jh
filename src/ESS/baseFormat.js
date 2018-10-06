/**
 * @module baseFormat Module 인버터 데이터 가이드라인
 */
module.exports = {
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number=}
   */
  pvAmp: null,
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number=}
   */
  pvVol: null,
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number=}
   */
  pvKw: null,
  /**
   * 태양 전지 현재 전력, 단위[kW]
   * @description Power
   * @type {number=}
   */
  pvKwh: null,
  /**
   * 태양 전지 총 발전량, 단위[kWh]
   * @description Power
   * @type {number=}
   */
  powerPvKw: null,
  /**
   * 인버터 현재 전력, 단위[kW]
   * @description Power
   * @type {number=}
   */
  powerGridKw: null,
  /**
   * 하루 발전량, 단위[kWh]
   * @description Power
   * @type {number=}
   */
  powerDailyKwh: null,
  /**
   * 인버터 누적 발전량, 단위[kWh] Cumulative Power Generation
   * @description Power
   * @type {number=}
   */
  powerTotalKwh: null,
  /**
   * 역률, 단위[%]
   * @description Power
   * @type {number=}
   */
  powerPf: null,
  /**
   * RS 선간 전압, 단위[V]
   * @description Grid
   * @type {number=}
   */
  gridRsVol: null,
  /**
   * ST 선간 전압, 단위[V]
   * @description Grid
   * @type {number=}
   */
  gridStVol: null,
  /**
   * TR 선간 전압, 단위[V]
   * @description Grid
   * @type {number=}
   */
  gridTrVol: null,
  /**
   * R상 전류, 단위[A]
   * @description Grid
   * @type {number=}
   */
  gridRAmp: null,
  /**
   * S상 전류, 단위[A]
   * @description Grid
   * @type {number=}
   */
  gridSAmp: null,
  /**
   * T상 전류, 단위[A]
   * @description Grid
   * @type {number=}
   */
  gridTAmp: null,
  /**
   * 라인 주파수 Line Frequency, 단위[Hz]
   * @description Grid
   * @type {number=}
   */
  gridLf: null,
  /**
   * 단상 or 삼상, 단위[0 or 1]
   * @description System
   * @type {number=}
   */
  sysIsSingle: null,
  /**
   * 인버터 용량, 단위[kW] Capacity
   * @description System
   * @type {number=}
   */
  sysCapaKw: null,
  /**
   * 인버터 계통 전압, 단위[V] Line Volatage
   * @description System
   * @type {number=}
   */
  sysLineVoltage: null,
  /**
   * 제작년도 월 일 yyyymmdd, 단위[yyyymmdd]
   * @description System
   * @type {string=}
   */
  sysProductYear: null,
  /**
   * Serial Number, 단위[String]
   * @description System
   * @type {string=}
   */
  sysSn: null,
  /**
   * 인버터 동작 유무, 단위[0 or 1]
   * @description Operation
   * @type {number=}
   */
  operIsRun: null,
  /**
   * 계통 전압 유무, 단위[0 or 1]
   * @description Operation
   * @type {number=}
   */
  operIsError: null,
  /**
   * 동작 모드 종류, 단위[number]
   * @description Operation
   * @type {number=}
   */
  operMode: null,
  /**
   * 동작 상태, 단위[string]
   * @description Operation
   * @type {string|number=}
   */
  operStatus: null,
  /**
   * 인버터 온도, 단위[°C]
   * @description Operation
   * @type {number=}
   */
  operTemperature: null,
  /**
   * 에러 리스트, 단위[Array.<{}>]
   * @description Operation
   * @type {Array.<Object>=}
   */
  operErrorList: null,
  /**
   * 경고 리스트, 단위[Array.<{}>]
   * @description warningList
   * @type {Array.<Object>=}
   */
  operWarningList: null,
  /**
   * 경고 리스트, 단위[Array.<{}>]
   * @description troubleList
   * @type {Array.<Object>=}
   */
  operTroubleList: null,
  /**
   * 배터리 전압, 단위[V]
   * @description Battery
   * @type {number=}
   */
  batteryVol: null,
  /**
   * 배터리 전류, 단위[A]
   * @description Battery
   * @type {number=}
   */
  batteryAmp: null,
  /**
   * 배터리 충전 전력, 단위[kW]
   * @description Battery
   * @type {number=}
   */
  batteryChargingKw: null,
  /**
   * 배터리 방전 전력, 단위[kW]
   * @description Battery
   * @type {number=}
   */
  batteryDischargingKw: null,
  /**
   * 배터리 누적 충전 전력, 단위[kWh]
   * @description Battery
   * @type {number=}
   */
  batteryTotalChargingKw: null,
  /**
   * 누적 태양광발전 전력, 단위[kWh]
   * @description Battery
   * @type {number=}
   */
  totalPVGeneratingPowerKwh: null,
  /**
   * LED DC 전압, 단위[V]
   * @description LED
   * @type {number=}
   */
  ledDcVol: null,
  /**
   * LED DC 전류, 단위[A]
   * @description LED
   * @type {number=}
   */
  ledDcAmp: null,
  /**
   * LED 사용 전력, 단위[kW]
   * @description LED
   * @type {number=}
   */
  ledUsingKw: null,
  /**
   * LED 총 사용 전력, 단위[kWh]
   * @description LED
   * @type {number=}
   */
  ledTotalUsingKwh: null,
  /**
   * 계통 출력, 단위[kW]
   * @description Input
   * @type {number=}
   */
  inputLineKw: null,
  /**
   * 계통 충전 전체 누적, 단위[kWh]
   * @description Input
   * @type {number=}
   */
  inputLineTotalKwh: null,
};
