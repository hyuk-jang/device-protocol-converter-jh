
const BaseModel = require('../baseModel');

class Model extends BaseModel {
  constructor() {
    super();

    this.BASE.DEFAULT.COMMAND.MEASURE = 'LOOP\n';
  }
}

module.exports = Model;