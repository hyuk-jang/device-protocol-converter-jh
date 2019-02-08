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

    this.device.DEFAULT.COMMAND.STATUS = [
      {
        unitId: this.dialing,
        fnCode: 4,
        address: 0,
        dataLength: 12,
      },
    ];

    this.device.LUX.COMMAND.STATUS = [
      {
        unitId: this.dialing,
        fnCode: 4,
        address: 0,
        dataLength: 1,
      },
    ];

    this.device.SOIL_TEMPERATURE.COMMAND.STATUS = [
      {
        unitId: this.dialing,
        fnCode: 4,
        address: 2,
        dataLength: 1,
      },
    ];
  }
}

module.exports = Model;
