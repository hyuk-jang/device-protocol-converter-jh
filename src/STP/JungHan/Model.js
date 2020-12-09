const _ = require('lodash');
const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super();
    // 프로토콜 정보가 있다면 세팅
    if (protocolInfo) {
      this.protocolInfo = protocolInfo;
    }

    // 국번은 숫자
    this.dialing = this.protocolInfo.deviceId;

    /** @type {modbusReadFormat} */
    this.device.DEFAULT.COMMAND.STATUS = [
      // Base (10 ~ 35)
      {
        type: 'BASE',
        unitId: this.dialing,
        fnCode: 3,
        address: 10,
        dataLength: 26,
      },
      // Flow (100 ~ 103)
      {
        unitId: this.dialing,
        fnCode: 3,
        address: 100,
        dataLength: 4,
      },
      // Add Steam Generator Sensor (600 ~ 615)
      {
        unitId: this.dialing,
        fnCode: 3,
        address: 600,
        dataLength: 16,
      },
      // Operation Status Mode (2330)
      {
        unitId: this.dialing,
        fnCode: 3,
        address: 2330,
        dataLength: 1,
      },
      // Feedback Err (64 ~ 69)
      {
        unitId: this.dialing,
        fnCode: 1,
        address: 64,
        dataLength: 6,
      },
      // Operation (70 ~ 75)
      {
        type: 'OPERATION',
        unitId: this.dialing,
        fnCode: 1,
        address: 70,
        dataLength: 6,
      },
      // System Err (80 ~ 121)
      {
        unitId: this.dialing,
        fnCode: 1,
        address: 80,
        dataLength: 42,
      },
      // Mode (122 ~ 126)
      {
        unitId: this.dialing,
        fnCode: 1,
        address: 122,
        dataLength: 5,
      },
      // Steam Generator Err (163)
      {
        unitId: this.dialing,
        fnCode: 1,
        address: 163,
        dataLength: 1,
      },
    ];
  }
}

module.exports = Model;
