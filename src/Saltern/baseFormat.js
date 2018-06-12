

/**
 * @module baseFormat 스마트 염전 장치 데이터 가이드라인
 */
module.exports = {
  /**
   * 수문(Water Door)
   * @description WD
   * @type {string=}
   * @example
   * STOP, OPEN, OPENING, CLOSE, CLOSING
   */
  waterDoor: null,
  /**
   * 수위(Water Level)
   * @description WL
   * @type {number=}
   * @example
   * ZERO, ONE, TWO, THREE
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
  /**
   * 배터리(Battery), 단위[V]
   * @type {number=}
   */
  battery: null,  
  /**
   * 수온, 단위[℃]
   * @type {number=}
   */
  waterTemperature: null,  
  /**
   * 모듈 전면 온도, 단위[℃]
   * @type {number=}
   */
  moduleFrontTemperature: null,  
  /**
   * 모듈 뒷면 온도, 단위[℃]
   * @type {number=}
   */
  moduleRearTemperature: null,  


};