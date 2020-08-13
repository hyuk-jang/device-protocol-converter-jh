const _ = require('lodash');
const crc = require('crc');

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
        address: 8,
        dataLength: 12,
      },
    ];
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

  static get CALC_KEY() {
    return {
      pvAmp: 'pvAmp',
    };
  }
}

module.exports = Model;
