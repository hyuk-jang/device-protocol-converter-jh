const deviceModelStatus = {
  WATER_DOOR: {
    STOP: 'STOP',
    OPEN: 'OPEN',
    OPENING: 'OPENING',
    CLOSE: 'CLOSE',
    CLOSING: 'CLOSING',
  },
  VALVE: {
    UNDEF: 'UNDEF',
    CLOSE: 'CLOSE',
    OPEN: 'OPEN',
    CLOSING: 'CLOSING',
    OPENING: 'OPENING',
  },
  PUMP: {
    OFF: 'OFF',
    ON: 'ON'
  },
  WATER_LEVEL: {
    ZERO: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
  }
};
exports.deviceModelStatus = deviceModelStatus;

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
  WATER_TEMPERATURE: 'waterTemperature',
  /**
   * @type {string} 모듈 전면 온도
   */
  MODULE_FRONT_TEMPERATURE: 'moduleFrontTemperature',
  /**
   * @type {string} 모듈 뒷면 온도
   */
  MODULE_REAR_TEMPERATURE: 'moduleRearTemperature',
  /**
   * @type {string} 모듈 뒷면 온도
   */
  BATTERY: 'battery',  

};
exports.deviceModel = deviceModel;



