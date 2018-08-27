const _ = require('lodash');
const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  constructor() {
    super();

    this.dialing = _.get(this, 'protocolInfo.deviceId');

    this.device.DEFAULT.COMMAND.STATUS = [
      {
        unitId: this.dialing,
        address: 0,
        length: 18,
      },
    ];
  }
}

module.exports = Model;
