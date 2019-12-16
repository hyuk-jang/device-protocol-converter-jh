const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super();
    this.protocolInfo = protocolInfo;

    // 국번은 숫자
    this.dialing = this.protocolInfo.deviceId;

    this.device.DEFAULT.COMMAND.STATUS = [
      {
        unitId: this.dialing,
        fnCode: 4,
        address: 0,
        dataLength: 30,
      },
    ];
  }
}

module.exports = Model;
