const _ = require('lodash');
const crc = require('crc');

const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super();
    this.dialing = this.protocolConverter.makeMsg2Buffer(_.get(protocolInfo, 'deviceId'));
    this.STX = this.protocolConverter.STX;
    this.ETX = this.protocolConverter.ETX;
    this.EOT = this.protocolConverter.EOT;

    // this.device.PV.COMMAND.STATUS = [this.makeMsg()];
    // this.device.DEFAULT.COMMAND.STATUS = _.flatten([this.device.PV.COMMAND.STATUS]);
    this.device.DEFAULT.COMMAND.STATUS = _.flatten([this.makeMsg()]);
  }

  /**
   * 요청 명령 buffer 생성
   */
  makeMsg() {
    const cmd = Buffer.from('R');
    const crcCode = this.makeCrcCode(
      Buffer.concat([this.STX, cmd, this.dialing, this.ETX]),
    );

    return Buffer.concat([this.STX, cmd, this.dialing, this.ETX, crcCode, this.EOT]);
  }

  /**
   * STX ~ ETX 까지의 CRC코드 생성
   * @param {Buffer} buffer STX ~ ETX 까지의 buffer
   * @return {Buffer} UpperCase 적용 후 Buffer
   */
  makeCrcCode(buffer) {
    const crcValue = crc.crc16xmodem(buffer.toString());
    const lower = this.protocolConverter.convertNumToStrToBuf(crcValue);
    const strLower = lower.toString();
    const strUpper = strLower.toLocaleUpperCase();

    return Buffer.from(strUpper);
  }

  /**
   * FIXME: TDD에 사용
   * @param {Buffer} responseBuf 인버터에서 수신받은 데이터
   * @return {Buffer} Data Buffer만 리턴
   */
  getValidateData(responseBuf) {
    const STX = Buffer.from([_.nth(responseBuf, 0)]);

    if (!_.isEqual(STX, this.STX)) {
      throw new Error('Not Matching STX');
    }

    // 실제 장치 데이터를 담은 Buffer 생성
    let dataBodyBuf = responseBuf.slice(8, responseBuf.length - 5);

    // 구분자 제거
    dataBodyBuf = this.protocolConverter.returnBufferExceptDelimiter(dataBodyBuf, ',');
    //   BU.CLI(dataBodyBuf);

    return dataBodyBuf;
  }
}

module.exports = Model;
