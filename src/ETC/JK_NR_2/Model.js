const _ = require('lodash');

const BaseModel = require('../BaseModel');

const {
  di: {
    dcmConfigModel: { reqDeviceControlType: reqDCT },
  },
} = require('../../module');

class Model extends BaseModel {
  constructor() {
    super();

    this.device.DEFAULT.COMMAND.STATUS = ['00'];
    // Open
    this.device.RELAY.COMMAND[reqDCT.TRUE] = nodeInfo => {
      return [`1${nodeInfo.data_index}`];
    };

    this.device.RELAY.COMMAND[reqDCT.FALSE] = nodeInfo => {
      return [`2${nodeInfo.data_index}`];
    };
  }
}

module.exports = Model;
