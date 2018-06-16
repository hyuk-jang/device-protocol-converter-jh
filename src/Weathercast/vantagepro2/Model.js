
const BaseModel = require('../baseModel');

class Model extends BaseModel {
  constructor() {
    super();

    this.DEFAULT.COMMAND.WAKEUP = '\n';
    this.DEFAULT.COMMAND.LOOP = 'LOOP\n';
    this.DEFAULT.COMMAND.LOOP_INDEX = 'LOOP 4\n';
  }
}

module.exports = Model;