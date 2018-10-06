/**
 * @module baseFormat 센서류 데이터 가이드라인
 */
module.exports = {
  /**
   * 기온(Temperature), 단위[℃]
   * @description TEMP
   */
  temp: null,
  /**
   * 습도(Humidity), 단위[%]
   * @description REH
   */
  reh: null,
  /**
   * 풍속(Wind Speed), 단위[m/s]
   * @description WS
   */
  ws: null,
  /**
   * 일사량(solar), 단위[W/m²]
   * @description SOLAR
   */
  solar: null,
  /**
   * 이산화탄소(CO 2), 단위[ppm]
   * @description CO2
   */
  co2: null,
  /**
   * 자외선(UV), 단위[mJ/c㎡]
   * @description UV
   */
  uv: null,
  /**
   * 조도(Lux), 단위[lx]
   * @description LUX
   */
  lux: null,
  /**
   * 전압(Voltage), 단위[V]
   * @description VOL
   */
  vol: null,

  /**
   * 전류(Ampare), 단위[A]
   * @description AMP
   */
  amp: null,

  /**
   * 수문(Water Door)
   * @description WD
   * @type {string=}
   * @example
   * STOP, OPEN, OPENING, CLOSE, CLOSING
   */
  waterDoor: null,
  /**
   * 수위(Water Level) 단위[cm]
   * @description WL
   * @type {number=}
   */
  waterLevel: null,
  /**
   * 염도(Salinity), 단위[%]
   * @description S
   * @type {number=}
   */
  salinity: null,
  /**
   * 밸브(Valve)
   * @description V
   * @type {string=}
   * @example
   * UNDEF, CLOSE, OPEN, CLOSING, OPENING
   */
  valve: null,
  /**
   * 펌프(Pump)
   * @description P
   * @type {string=}
   * @example
   * ON, OFF
   */
  pump: null,
};
