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
    this.dialing = _.get(this, 'protocolInfo.deviceId');

    this.device.DEFAULT.COMMAND.STATUS = [
      {
        unitId: this.dialing,
        fnCode: 4,
        address: 0,
        dataLength: 18,
      },
    ];

    this.device.LUX.COMMAND.STATUS = [
      {
        unitId: this.dialing,
        fnCode: 4,
        address: 6,
        dataLength: 1,
      },
    ];
  }
}

module.exports = Model;
