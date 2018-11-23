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

    this.device.DEFAULT.COMMAND.STATUS = [Buffer.from('21 get rtd\r')];
  }
}

module.exports = Model;
