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

    this.device.DEFAULT.COMMAND.STATUS = ['RELAY-STATE-255'];
    // Open
    this.device.RELAY.COMMAND[reqDCT.TRUE] = nodeInfo => {
      return [`RELAY-SET-255,${nodeInfo.data_index},1`];
    };

    this.device.RELAY.COMMAND[reqDCT.FALSE] = nodeInfo => {
      return [`RELAY-SET-255,${nodeInfo.data_index},0`];
    };
  }
}

module.exports = Model;
