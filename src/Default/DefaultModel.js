const _ = require('lodash');
const crc = require('crc');
const {BU} = require('base-util-jh');
const ProtocolConverter = require('./ProtocolConverter');

module.exports = {
  /**
   * STX + Buffer(msg) + ETX + CRC(4Byte) + EOT 
   * @param {string} msg 전송 Body
   * @return {Buffer} 
   */
  encodingDefaultRequestMsgForTransfer: (msg) => {
    const converter = new ProtocolConverter();
    try {
      if (msg == null) {
        return new SyntaxError;
      }
      let body = converter.makeMsg2Buffer(msg);

      let bufferStorage = Buffer.concat([
        converter.STX,
        body,
        converter.ETX
      ]);

      // BU.CLI(bufferStorage.toString());
      let crcValue = crc.crc16xmodem(bufferStorage.toString());

      let returnValue = [
        bufferStorage,
        converter.convertNumToBuf(crcValue, 4),
        converter.EOT
      ];

      return Buffer.concat(returnValue);
    } catch (error) {
      throw error;
    }
  },
  /**
   * Buffer 분석하여 데이터 돌려줌
   * @param {Buffer|string} buf
   * @return {Buffer}
   */
  decodingDefaultRequestMsgForTransfer: (buf) => {
    const protocolConverter = new ProtocolConverter();
    buf = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
    
    let indexSTX = buf.indexOf(0x02);
    let indexETX = buf.indexOf(0x03);
    let indexEOT = buf.indexOf(0x04);
    let crcValue = buf.slice(indexETX + 1, indexEOT);
    let bufBody = buf.slice(0, indexETX + 1);

    // BU.CLIS(indexSTX, indexETX, indexEOT);
    
    let baseCrcValue = crc.crc16xmodem(bufBody.toString());
    baseCrcValue = protocolConverter.pad(baseCrcValue, 4);

    // BU.CLIS(crcValue.toString() , baseCrcValue.toString(16) );

    if (crcValue.toString() === baseCrcValue.toString(16)) {
      return buf.slice(indexSTX + 1, indexETX);
    } else {
      BU.logFile(buf.toString());
      throw 'Crc Error';
    }
  }
};