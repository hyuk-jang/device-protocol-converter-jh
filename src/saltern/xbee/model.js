

const deviceModel = {
  /**
   * @type {string} 수문
   */
  WATER_DOOR: 'waterDoor',
  /**
   * @type {string} 밸브
   */
  VALVE: 'valve',
  /**
   * @type {string} 펌프
   */
  PUMP: 'pump',
  /**
   * @type {string} 수위
   */
  WATER_LEVEL: 'waterLevel',
  /**
   * @type {string} 염도
   */
  SALINITY: 'salinity',
  /**
   * @type {string} 수중 온도
   */
  WATER_TEMPERATURE: 'WATER_TEMPERATURE',
  /**
   * @type {string} 모듈 전면 온도
   */
  MODULE_FRONT_TEMPERATURE: 'MODULE_FRONT_TEMPERATURE',
  /**
   * @type {string} 모듈 뒷면 온도
   */
  MODULE_REAR_TEMPERATURE: 'MODULE_REAR_TEMPERATURE',

};
exports.deviceModel = deviceModel;



const deviceStatus = {
  /** @type {Object} 수문 상태*/
  WATER_DOOR: {
    /** @type {number} 정지 */
    STOPPED: 0,
    /** @type {number} 열림 */
    OPENED: 2,
    /** @type {number} 여는 중 */
    OPENING: 3,
    /** @type {number} 닫힘 */
    CLOSED: 4,
    /** @type {number} 닫는 중 */
    CLOSING: 5,
  },
  /** @type {Object} 수위 */
  WATER_LEVEL: {
    /** @type {number} 0 단계 (수위없음) */
    ZERO: 0,
    /** @type {number} 1 단계 (최저) */
    ONE: 1,
    /** @type {number} 2 단계 */
    TWO: 3,
    /** @type {number} 3 단계 (최대) */
    THREE: 7,
  },
  /** @type {Object} 밸브 */
  VALVE: {
    /** @type {number} 미확인 */
    UNDEF: 0,
    /** @type {number} 닫힘 */
    CLOSED: 1,
    /** @type {number} 열림 */
    OPENED: 2,
    /** @type {number} 작업 상태 */
    BUSY: 3,
    /** @type {number} 닫는 중 */
    CLOSING: 4,
    /** @type {number} 여는 중 */
    OPENING: 5,
  },
  /** @type {Object} 펌프 */
  PUMP: {
    /** @type {number} 켜짐 */
    ON: 0,
    /** @type {number} 꺼짐 */
    OFF: 1,
  }

};
exports.deviceStatus = deviceStatus;