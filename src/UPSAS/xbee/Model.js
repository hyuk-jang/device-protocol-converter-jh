'use strict';

const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  constructor() {
    super();

    this.device.WATER_DOOR.COMMAND.OPEN = [{
      cmd: '@cgo'
    }, {
      cmd: '@sts',
      timeout: 1000 * 10,
    }];

    this.device.WATER_DOOR.COMMAND.CLOSE = [{
      cmd: '@cgc'
    }, {
      cmd: '@sts',
      timeout: 1000 * 10,
    }];

    this.device.WATER_DOOR.COMMAND.STATUS = [{
      cmd: '@sts'
    }];




    /** 밸브 */
    this.device.VALVE.COMMAND.OPEN = [{
      cmd: '@cvo'
    }, {
      cmd: '@sts',
      timeout: 1000 * 15,
    }];

    this.device.VALVE.COMMAND.CLOSE = [{
      cmd: '@cvc'
    }, {
      cmd: '@sts',
      timeout: 1000 * 15,
    }];

    this.device.VALVE.COMMAND.STATUS = [{
      cmd: '@sts'
    }];




    /** 펌프 */
    this.device.PUMP.COMMAND.ON = [{
      // 펌프 킬때는 명령을 내리고 10초 후에 킴
      timeout: 1000 * 10,
      cmd: '@cpo'
    }, {
      cmd: '@sts',
      timeout: 1000 * 5,
    }];

    this.device.PUMP.COMMAND.OFF = [{
      cmd: '@cpc'
    }, {
      cmd: '@sts',
      timeout: 1000 * 5,
    }];

    this.device.PUMP.COMMAND.STATUS = [{
      cmd: '@sts'
    }];




    /** 염도 */
    this.device.SALINITY.COMMAND.MEASURE = [{
      cmd: '@cgm'
    }, {
      cmd: '@sts',
      timeout: 1000,
    }];

    this.device.SALINITY.COMMAND.STATUS = [{
      cmd: '@sts'
    }];


    this.device.WATER_LEVEL.COMMAND.STATUS = [{
      cmd: '@sts'
    }];


    /** 수온 */
    this.device.WATER_TEMPERATURE.COMMAND.STATUS = [{
      cmd: '@sts'
    }];



    /** 모듈 앞면 */
    this.device.MODULE_FRONT_TEMPERATURE.COMMAND.STATUS = [{
      cmd: '@sts'
    }];


    /** 모듈 뒷면 */
    this.device.MODULE_REAR_TEMPERATURE.COMMAND.STATUS = [{
      cmd: '@sts'
    }];
  }
}

module.exports = Model;