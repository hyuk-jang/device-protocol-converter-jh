/**
 * @module baseFormat 스마트 염전 장치 데이터 가이드라인
 */
module.exports = {
  /**
   * 수문(Water Door)
   * @description WD
   * @type {number=}
   * @example
   * GATE_STOPPED,   // 0
	 * GATE_CLOSED,    // 1
	 * GATE_OPENED     // 2
   */
  waterDoor: null,
  /**
   * 수위(Water Level)
   * @description WL
   * @type {number=}
   * @example
   * 1 ~ 4 Level,   // 1 ~ 4
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
   * @type {number=}
   * @example
   * VALVE_UNDEF,     //0
   * VALVE_CLOSE,     //1
   * VALVE_OPEN,      //2
   * VALVE_BUSY,      //3
   * VALVE_CLOSING,   //4
   * VALVE_OPENING,   //5
   */
  valve: null,
  /**
   * 펌프(Pump)
   * @description P
   * @type {number=}
   * @example
   * PUMP_OFF,     // 0
   * PUMP_ON,      // 1
   */
  pump: null,  
  /**
   * 배터리(Battery), 단위[V]
   * @type {number=}
   */
  battery: null,  


};