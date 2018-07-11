'use strict';

const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  constructor() {
    super();

    /** 수문 */
    this.device.WATER_DOOR.COMMAND.OPEN = {
      cmd: '@cgo',
      cmdList: [{
        cmd: '@cgo'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    };

    this.device.WATER_DOOR.COMMAND.CLOSE = {
      cmd: '@cgc',
      cmdList: [{
        cmd: '@cgc'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    };

    this.device.WATER_DOOR.COMMAND.STATUS = {
      cmd: '@sts'
    };




    /** 밸브 */
    this.device.VALVE.COMMAND.OPEN = {
      cmd: '@cvo',
      cmdList: [{
        cmd: '@cvo'
      }, {
        timeout: 1000 * 15,
        cmd: '@sts'
      }]
    };

    this.device.VALVE.COMMAND.CLOSE = {
      cmd: '@cvc',
      cmdList: [{
        cmd: '@cvc'
      }, {
        timeout: 1000 * 15,
        cmd: '@sts'
      }]
    };

    this.device.VALVE.COMMAND.STATUS = {
      cmd: '@sts'
    };




    /** 펌프 */
    this.device.PUMP.COMMAND.ON = {
      cmd: '@cpo',
      // 펌프 킬때는 명령을 내리고 10초 후에 킴
      cmdList: [{
        timeout: 1000 * 10,
        cmd: '@cpo'
      }, {
        timeout: 1000 * 5,
        cmd: '@sts'
      }]
    };

    this.device.PUMP.COMMAND.OFF = {
      cmd: '@cpc',
      cmdList: [{
        cmd: '@cpc'
      }, {
        timeout: 1000 * 5,
        cmd: '@sts'
      }]
    };

    this.device.PUMP.COMMAND.STATUS = {
      cmd: '@sts'
    };




    /** 염도 */
    this.device.SALINITY.COMMAND.MEASURE = {
      cmd: '@cgm',
      cmdList: [{
        cmd: '@cgm'
      }, {
        timeout: 1000,
        cmd: '@sts'
      }]
    };

    this.device.SALINITY.COMMAND.STATUS = {
      cmd: '@sts'
    };

    


    /** 수온 */
    this.device.WATER_TEMPERATURE.COMMAND.STATUS = {
      cmd: '@sts'
    };



    /** 모듈 앞면 */
    this.device.MODULE_FRONT_TEMPERATURE.COMMAND.STATUS = {
      cmd: '@sts'
    };


    /** 모듈 뒷면 */
    this.device.MODULE_REAR_TEMPERATURE.COMMAND.STATUS = {
      cmd: '@sts'
    };
  }
}

module.exports = Model;