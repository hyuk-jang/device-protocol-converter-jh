const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  constructor() {
    super();

    this.device.DEFAULT.COMMAND.WAKEUP = '\n';
    this.device.DEFAULT.COMMAND.LOOP = 'LOOP\n';
    this.device.DEFAULT.COMMAND.LOOP_INDEX = 'LOOP 4\n';
  }
}

module.exports = Model;
