/**
 * @module baseFormat 농업 병행 센서 데이터 가이드 라인
 */
module.exports = {
  /**
   * 측정 시간, 단위[Date]
   * @type {Date[]=} 측정 시간
   */
  writeDate: [],
  /**
   * 수중 온도, 단위[℃]
   * @description T_S
   * @type {number[]=} 섭씨: 1 atm에서의 물의 어는점을 0도, 끓는점을 100도로 정한 온도
   */
  waterTemperature: [],
  /**
   * 토양 온도, 단위[℃]
   * @description T_S
   * @type {number[]=} 섭씨: 1 atm에서의 물의 어는점을 0도, 끓는점을 100도로 정한 온도
   */
  soilTemperature: [],
  /**
   * 외기 온도, 단위[℃]
   * @description T_OA
   * @type {number[]=} 섭씨: 1 atm에서의 물의 어는점을 0도, 끓는점을 100도로 정한 온도
   */
  outsideAirTemperature: [],
  /**
   * 모듈 뒷면 온도, 단위[℃]
   * @description T_PR
   * @type {number[]=} 섭씨: 1 atm에서의 물의 어는점을 0도, 끓는점을 100도로 정한 온도
   */
  pvRearTemperature: [],
  /**
   * 토양 습도, 단위[%RH]
   * @description RH_S
   * @type {number[]=} 공기 중에 포함되어 있는 수증기의 양 또는 비율을 나타내는 단위
   */
  soilReh: [],
  /**
   * 외기 습도, 단위[%RH]
   * @description RH_OA
   * @type {number[]=} 공기 중에 포함되어 있는 수증기의 양 또는 비율을 나타내는 단위
   */
  outsideAirReh: [],
  /**
   * 풍속, 단위[m/s]
   * @description W_S
   * @type {number[]=} 초당 바람이 이동하는 거리(m)
   */
  windSpeed: [],
  /**
   * 풍향, 단위[°]
   * @description W_D
   * @type {number[]=} 바람이 불어오는 방향을 360 각도로 표현
   */
  windDirection: [],
  /**
   * 수평 일사량, 단위[W/m²]
   * @description S_H
   * @type {number[]=} 1평방 미터당 조사되는 일사에너지의 양이 1W
   */
  horizontalSolar: [],
  /**
   * 수평 일사량, 단위[W/m²]
   * @description S_I
   * @type {number[]=} 1평방 미터당 조사되는 일사에너지의 양이 1W
   */
  inclinedSolar: [],
  /**
   * 모듈 하부 일사량, 단위[W/m²]
   * @description S_PU
   * @type {number[]=} 1평방 미터당 조사되는 일사에너지의 양이 1W
   */
  pvUnderlyingSolar: [],
  /**
   * 시간당 강우량, 단위[mm/hr]
   * @description RF1
   * @type {number[]=} 시간당 일정한 곳에 내린 비의 분량. 단위는 mm
   */
  r1: [],
  /**
   * 강우 감지 여부
   * @description IR
   * @type {number[]=} 감지시 1, 미감지시 0
   */
  isRain: [],
  /**
   * 이산화탄소, 단위[ppm]
   * @description CO2
   * @type {number[]=} 백만분의 1. 이산화탄소 농도 395ppm = 395/1,000,000 * 100 = 0.0395 %
   */
  co2: [],
  /**
   * 조도, 단위[lx]
   * @description LX
   * @type {number[]=} 1㎡의 면적 위에 1m의 광속이 균일하게 비춰질 때
   */
  lux: [],
  /**
   * 토양 EC 값, 단위[%]
   * @description WV_S
   * @type {number[]=}
   */
  soilWaterValue: [],
  /** @@@@@@@@@@@@@@@@@ 인버터 관련 @@@@@@@@@@@@@@@@@@@@@@ */
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
   * @type {string=}
   */
  sysProductYear: [],
  /**
   * Serial Number, 단위[String]
   * @description System
   * @type {string=}
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
   * 에러 리스트, 단위[Array.<{}>]
   * @description Operation
   * @type {Object[]=}
   */
  operErrorList: [],
  /**
   * 경고 리스트, 단위[Array.<{}>]
   * @description warningList
   * @type {Object[]=}
   */
  operWarningList: [],
  /**
   * 경고 리스트, 단위[Array.<{}>]
   * @description troubleList
   * @type {Object[]=}
   */
  operTroubleList: [],
  /** @@@@@@@@@@@@@@@@@ 접속반 관련 @@@@@@@@@@@@@@@@@@@@@@ */
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number[]=}
   */
  ampCh1: [],
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number[]=}
   */
  ampCh2: [],
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number[]=}
   */
  ampCh3: [],
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number[]=}
   */
  ampCh4: [],
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number[]=}
   */
  ampCh5: [],
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number[]=}
   */
  ampCh6: [],
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number[]=}
   */
  ampCh7: [],
  /**
   * 전류(Ampere), 단위[A]
   * @description PV
   * @type {number[]=}
   */
  ampCh8: [],
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number[]=}
   */
  volCh1: [],
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number[]=}
   */
  volCh2: [],
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number[]=}
   */
  volCh3: [],
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number[]=}
   */
  volCh4: [],
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number[]=}
   */
  volCh5: [],
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number[]=}
   */
  volCh6: [],
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number[]=}
   */
  volCh7: [],
  /**
   * 전압(voltage), 단위[V]
   * @description PV
   * @type {number[]=}
   */
  volCh8: [],
};
