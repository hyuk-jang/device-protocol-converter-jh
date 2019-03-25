const { BU } = require('base-util-jh');
const _ = require('lodash');

const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  /**
   *
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super();
    this.dialing = this.protocolConverter.makeMsg2Buffer(_.get(protocolInfo, 'deviceId'));

    this.SOP = Buffer.from([0x0a, 0x96]);
    this.EOP = Buffer.from([0x54, 0x18]);

    this.device.DEFAULT.COMMAND.STATUS = this.makeMsg();
  }

  /**
   * @return {Buffer}
   */
  makeMsg() {
    const fixedData = Buffer.from([0x05]);
    const msgBodyBuffer = Buffer.concat([this.dialing, this.EOP]);

    const chkSum = this.protocolConverter.getSumBuffer(msgBodyBuffer);

    return Buffer.concat([this.SOP, this.dialing, this.EOP, fixedData, chkSum]);
  }

  /**
   * @param {Buffer} responseBuf 인버터에서 수신받은 데이터
   * @return {Buffer}
   */
  getBody() {}
}

module.exports = Model;
