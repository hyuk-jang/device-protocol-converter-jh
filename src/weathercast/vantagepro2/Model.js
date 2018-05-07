
const BaseModel = require('../baseModel');

class Model extends BaseModel {
  constructor() {
    super();

    this.DEFAULT.COMMAND.MEASURE = {
      cmd: 'LOOP'
    };
  }
}

module.exports = Model;