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
   * 일사량, 단위[W/m²]
   * @description SL
   * @type {number[]=} 1평방 미터당 조사되는 일사에너지의 양이 1W
   */
  solar: [],
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
   * 토양 수분 값, 단위[%]
   * @description WV_S
   * @type {number[]=}
   */
  soilWaterValue: [],
};