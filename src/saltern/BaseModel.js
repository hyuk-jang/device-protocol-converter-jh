'use strict';

const _ = require('lodash');

const baseFormat = require('./baseFormat');

require('../format/defaultDefine');
class BaseModel {
  /** @param {protocol_info} protocol_info */
  constructor(protocol_info) {
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
      NAME: '수문'
    };

    this.VALVE = {
      STATUS: {
        UNDEF: 'UNDEF',
        CLOSE: 'CLOSE',
        OPEN: 'OPEN',
        BUSY: 'BUSY',
        // CLOSING: 'CLOSING',
        // OPENING: 'OPENING',
      },
      COMMAND: {
        OPEN: {},
        CLOSE: {},
        STATUS: {}
      },
      /** @type {string} 밸브 */
      KEY: 'valve',
      NAME: '밸브'
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
      NAME: '펌프'
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
      /** @type {string} 수위 */
      KEY: 'waterLevel',
      NAME: '수위'
    };

    this.SALINITY = {
      STATUS: {},
      COMMAND: {
        MEASURE: {},
        STATUS: {}
      },
      /** @type {string} 염도 */
      KEY: 'salinity',
      NAME: '염도'
    };

    this.WATER_TEMPERATURE = {
      STATUS: {},
      COMMAND: {
        STATUS: {}
      },
      /** @type {string} 수중 온도 */
      KEY: 'waterTemperature',
      NAME: '수온'
    };

    this.MODULE_FRONT_TEMPERATURE = {
      STATUS: {},
      COMMAND: {
        STATUS: {}
      },
      /** @type {string} 모듈 앞면 온도 */
      KEY: 'moduleFrontTemperature',
      NAME: '모듈 온도'
    };

    this.MODULE_REAR_TEMPERATURE = {
      STATUS: {},
      COMMAND: {
        STATUS: {}
      },
      /** @type {string} 모듈 뒷면 온도 */
      KEY: 'moduleRearTemperature',
      NAME: '모듈 온도'
    };

    this.BATTERY = {
      STATUS: {},
      COMMAND: {
        STATUS: {}
      },
      /** @type {string} 배터리 전압 */
      KEY: 'battery',
      NAME: '배터리 전압'
    };
    

    if(_.get(protocol_info, 'subCategory')){
      const Model = require(`./${protocol_info.subCategory}/Model`);
      return new Model(this);
    }

  }

  static get BASE_KEY() {
    let baseKey = Object.assign({}, baseFormat);
    _.forEach(baseKey, (v, k) => baseKey[k] = k);
    return baseKey;
  }

}
module.exports = BaseModel;