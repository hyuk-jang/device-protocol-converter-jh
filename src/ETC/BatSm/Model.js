const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  constructor() {
    super();

    this.device.DEFAULT.COMMAND.STATUS = [
      Buffer.concat([
        Buffer.from('02', 'hex'),
        Buffer.from('M'),
        Buffer.from('03', 'hex'),
      ]),
    ];
  }
}

module.exports = Model;
