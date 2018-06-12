
const BaseModel = require('../baseModel');

class Model extends BaseModel {
  constructor() {
    super();

    this.DEFAULT.COMMAND.MEASURE = 'LOOP\n';
  }
}

module.exports = Model;