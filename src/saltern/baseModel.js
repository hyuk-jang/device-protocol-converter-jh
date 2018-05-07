
const baseFormat = require('./baseFormat');

class BaseModel {
  constructor(type) {
    this.baseFormat = baseFormat;


    this.DEFAULT = {
      STATUS: {
        UNDEF: 'UNDEF'
      }
    };
    
    
    this.WATER_DOOR = {
      STATUS: {
        STOP: 'STOP',
        OPEN: 'OPEN',
        OPENING: 'OPENING',
        CLOSE: 'CLOSE',
        CLOSING: 'CLOSING',
      },
      COMMAND: {
        OPEN: {},
        CLOSE: {},
        STATUS: {}
      },
      /** @type {string} 수문 */
      KEY: 'waterDoor',
    };

    this.VALVE = {
      STATUS: {
        UNDEF: 'UNDEF',
        CLOSE: 'CLOSE',
        OPEN: 'OPEN',
        CLOSING: 'CLOSING',
        OPENING: 'OPENING',
      },
      COMMAND: {
        OPEN: {},
        CLOSE: {},
        STATUS: {}
      },
      /** @type {string} 밸브 */
      KEY: 'valve',
    };

    this.PUMP = {
      STATUS: {
        OFF: 'OFF',
        ON: 'ON'
      },
      COMMAND: {
        ON: {},
        OFF: {},
        STATUS: {}
      },
      /** @type {string} 펌프 */
      KEY: 'pump',
    };

    this.WATER_LEVEL = {
      STATUS: {
        ZERO: 0,
        ONE: 1,
        TWO: 2,
        THREE: 3,
      },
      COMMAND: {
        STATUS: {}
      },
      /** @type {string} 수문 */
      KEY: 'waterLevel',
    };

    this.SALINITY = {
      STATUS: {},
      COMMAND: {
        MEASURE: {},
        STATUS: {}
      },
      /** @type {string} 염도 */
      KEY: 'salinity',
    };

    this.WATER_TEMPERATURE = {
      STATUS: {},
      COMMAND: {
        STATUS: {}
      },
      /** @type {string} 수중 온도 */
      KEY: 'waterTemperature',
    };

    this.MODULE_FRONT_TEMPERATURE = {
      STATUS: {},
      COMMAND: {
        STATUS: {}
      },
      /** @type {string} 모듈 앞면 온도 */
      KEY: 'moduleFrontTemperature',
    };

    this.MODULE_REAR_TEMPERATURE = {
      STATUS: {},
      COMMAND: {
        STATUS: {}
      },
      /** @type {string} 모듈 뒷면 온도 */
      KEY: 'moduleRearTemperature',
    };

    this.BATTERY = {
      STATUS: {},
      COMMAND: {
        STATUS: {}
      },
      /** @type {string} 배터리 전압 */
      KEY: 'battery',
    };
    
    if(type){
      const Model = require(`./${type}/Model`);
      return new Model(this);
    }

  }

}
module.exports = BaseModel;