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
        address: 0,
        dataLength: 30,
      },
    ];
  }

  /**
   * STX ~ ETX 까지의 CRC코드 생성
   * @param {Buffer} buffer STX ~ ETX 까지의 buffer
   * @return {Buffer} UpperCase 적용 후 Buffer
   */
  makeCrcCode(buffer) {
    // const crcValue = crc.crc16xmodem(buffer);
    const crcValue = crc.crc16modbus(buffer);
    // const crcValue = crc.crc16(buffer);
    // const crcValue = crc.crc32(buffer);
    // console.log(crcValue);
    const lower = this.protocolConverter.convertNumToHexToBuf(crcValue, 4);
    // console.log(lower);

    return Buffer.from(lower.toString(), 'hex').reverse();
  }
}

module.exports = Model;