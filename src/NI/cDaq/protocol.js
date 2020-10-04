const Model = require('./Model');

const { BASE_KEY: BK } = Model;

const onDeviceOperationStatus = {
  // VOLTAGE
  PXM309: (vol, toFixed) => {
    // 현재 Voltage가 장치 구간에서 위치하는
    return Model.cRangeRateToNum(Model.cNumToRangeRate(vol, 0, 10), 0.35, 20, toFixed);
  },
  // RELAY
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
