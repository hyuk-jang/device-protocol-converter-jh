const BaseModel = require('../baseModel');



class Model extends BaseModel {
  constructor() {
    super();



    /** 수문 */
    this.WATER_DOOR.COMMAND.OPEN = {
      cmd: '@cgo',
      cmdList: [{
        cmd: '@cgo'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    };

    this.WATER_DOOR.COMMAND.CLOSE = {
      cmd: '@cgc',
      cmdList: [{
        cmd: '@cgc'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    };

    this.WATER_DOOR.COMMAND.STATUS = {
      cmd: '@sts'
    };




    /** 밸브 */
    this.VALVE.COMMAND.OPEN = {
      cmd: '@cvo',
      cmdList: [{
        cmd: '@cvo'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    };

    this.VALVE.COMMAND.CLOSE = {
      cmd: '@cvc',
      cmdList: [{
        cmd: '@cvc'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    };

    this.VALVE.COMMAND.STATUS = {
      cmd: '@sts'
    };




    /** 펌프 */
    this.PUMP.COMMAND.ON = {
      cmd: '@cpo',
      cmdList: [{
        cmd: '@cpo'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    };

    this.PUMP.COMMAND.OFF = {
      cmd: '@cpc',
      cmdList: [{
        cmd: '@cpc'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    };

    this.PUMP.COMMAND.STATUS = {
      cmd: '@sts'
    };




    /** 염도 */
    this.SALINITY.COMMAND.MEASURE = {
      cmd: '@cgm',
      cmdList: [{
        cmd: '@cgm'
      }, {
        timeout: 1000,
        cmd: '@sts'
      }]
    };

    this.SALINITY.COMMAND.STATUS = {
      cmd: '@sts'
    };

    


    /** 수온 */
    this.WATER_TEMPERATURE.COMMAND.STATUS = {
      cmd: '@sts'
    };



    /** 모듈 앞면 */
    this.MODULE_FRONT_TEMPERATURE.COMMAND.STATUS = {
      cmd: '@sts'
    };


    /** 모듈 뒷면 */
    this.MODULE_REAR_TEMPERATURE.COMMAND.STATUS = {
      cmd: '@sts'
    };
  }
}

module.exports = Model;