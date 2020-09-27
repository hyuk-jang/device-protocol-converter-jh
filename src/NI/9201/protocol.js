const Model = require('./Model');

const onDeviceOperationStatus = {
  /** @param {number} vol   */
  PXM309: (vol, toFixed) => {
    // 현재 Voltage가 장치 구간에서 위치하는
    return Model.cRangeRateToNum(Model.cNumToRangeRate(vol, 0, 10), 0.35, 20, toFixed);
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;
