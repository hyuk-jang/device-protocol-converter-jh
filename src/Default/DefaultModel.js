const crc = require('crc');
const { BU } = require('base-util-jh');
const ProtocolConverter = require('./ProtocolConverter');

module.exports = {
  /**
   * 프로토콜 변환 모듈을 사용 가능
   */
  protocolConverter: new ProtocolConverter(),
  /**
   * 요청받은 데이터에 STX와 ETX로 프레임을 감싸 반환
   * STX + Buffer(msg) + ETX
   * @param {string} msg 전송 Body
   * @return {Buffer}
   */
  encodingSimpleMsg: msg => {
    const converter = new ProtocolConverter();

    if (msg == null) {
      return new SyntaxError();
    }
    const body = converter.makeMsg2Buffer(msg);

    const bufferStorage = Buffer.concat([converter.STX, body, converter.ETX]);

    return bufferStorage;
  },
  /**
   * STX + Buffer(msg) + ETX + CRC(4Byte) + EOT
   * @param {string} msg 전송 Body
   * @return {Buffer}
   */
  encodingMsg: msg => {
    const converter = new ProtocolConverter();
    if (msg == null) {
      return new SyntaxError();
    }
    const body = converter.makeMsg2Buffer(msg);

    const bufferStorage = Buffer.concat([converter.STX, body, converter.ETX]);

    const crcValue = crc.crc16xmodem(bufferStorage.toString());

    const returnValue = [
      bufferStorage,
      converter.convertNumToStrToBuf(crcValue, {
        toStringRadix: 10,
      }),
      converter.EOT,
    ];

    return Buffer.concat(returnValue);
  },
  /**
   * 첫 STX와 마지막 ETX를 기준으로 데이터를 짤라 반환
   * @param {Buffer|string} buf
   * @return {Buffer}
   * @example
   * Buffer[0x02, 0x30, 0x31, 0x03, 0x56, 0x03] --> Buffer[0x30, 0x31, 0x03, 0x56]
   */
  decodingSimpleMsg: buf => {
    buf = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);

    const indexSTX = buf.indexOf(0x02);
    const indexETX = buf.lastIndexOf(0x03);

    let bufBody;
    if (indexSTX > -1 && indexETX > -1) {
      bufBody = buf.slice(indexSTX + 1, indexETX);
    } else if (indexSTX > -1) {
      bufBody = buf.slice(indexSTX + 1);
    } else if (indexETX > -1) {
      bufBody = buf.slice(0, indexETX);
    }

    return bufBody;
  },
  /**
   * Buffer 분석하여 데이터 돌려줌
   * @param {Buffer|string} buf
   * @return {Buffer}
   */
  decodingMsg: buf => {
    const protocolConverter = new ProtocolConverter();
    buf = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);

    const indexSTX = buf.indexOf(0x02);
    const indexETX = buf.indexOf(0x03);
    const indexEOT = buf.indexOf(0x04);
    const crcValue = buf.slice(indexETX + 1, indexEOT);
    const bufBody = buf.slice(0, indexETX + 1);

    let baseCrcValue = crc.crc16xmodem(bufBody.toString());
    baseCrcValue = protocolConverter.pad(baseCrcValue, 4);

    if (crcValue.toString() === baseCrcValue.toString(16)) {
      return buf.slice(indexSTX + 1, indexETX);
    }
    BU.logFile(buf.toString());
    throw new Error('Crc Error');
  },
};
