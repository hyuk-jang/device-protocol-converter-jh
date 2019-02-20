/**
 * @module baseFormat 스마트 염전 장치 데이터 가이드라인
 */
module.exports = {
  /**
   * 수문(Water Door)
   * @description WD
   * @type {number[]=}
   * @example
   * STOP, OPEN, OPENING, CLOSE, CLOSING
   */
  waterDoor: [],
  /**
   * 수위(Water Level)
   * @description WL
   * @type {number[]=}
   */
  waterLevel: [],
  /**
   * 염도(Salinity), 단위[%]
   * @description S
   * @type {number[]=}
   */
  salinity: [],
  /**
   * 수문용 밸브
   * @description GV
   * @type {number[]=}
   * @example
   * UNDEF, CLOSE, OPEN, CLOSING, OPENING
   */
  gateValve: [],
  /**
   * 밸브(Valve)
   * @description V
   * @type {number[]=}
   * @example
   * UNDEF, CLOSE, OPEN, CLOSING, OPENING
   */
  valve: [],
  /**
   * 펌프(Pump)
   * @description P
   * @type {string[]=}
   * @example
   * ON, OFF
   */
  pump: [],
  /**
   * 배터리(Battery), 단위[V]
   * @type {number[]=}
   */
  battery: [],
  /**
   * 수온, 단위[℃]
   * @type {number[]=}
   */
  brineTemperature: [],
  /**
   * 모듈 전면 온도, 단위[℃]
   * @type {number[]=}
   */
  moduleFrontTemperature: [],
  /**
   * 모듈 뒷면 온도, 단위[℃]
   * @type {number[]=}
   */
  moduleRearTemperature: [],
  /**
   * 접속반 지락 계전기, 지락 발생 1, 정상 0
   * @type {number[]=}
   */
  isConnectorGroundRelay: [],
};
