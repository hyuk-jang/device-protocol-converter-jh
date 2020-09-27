const Model = require('./Model');

const { BASE_KEY: BK } = Model;

const onDeviceOperationStatus = {
  [BK.valve]: {
    0: 'CLOSE',
    1: 'OPEN',
  },
  [BK.compressor]: {
    0: 'OFF',
    1: 'ON',
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;
