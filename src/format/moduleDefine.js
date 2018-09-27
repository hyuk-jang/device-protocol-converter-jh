const parsingMethod = {
  /**
   * 10진수를 Hex로 변환한 후 Buffer로 반환
   * @param {number|number[]} dec 10진수 number, Hx로 바꿀 값
   * @param {number} byteLength Hex to Hex 후 Byte Length. Buffer의 길이가 적을 경우 앞에서부터 0x00 채움
   * @return {Buffer}
   * @example
   * (Dec) 555 -> (Hex)'02 2B' -> <Buffer 02 2B>
   */
  convertNumToHxToBuf: 'convertNumToHxToBuf',
  /**
   *
   * @param {number} dec 10진수 number, Buffer로 바꿀 값
   * @param {number} byteLength Hex to Ascii Buffer 후 Byte Length. Buffer의 길이가 적을 경우 앞에서부터 0 채움
   * @return {Buffer}
   * @example
   * (Dec) 65 -> (Hex)'41' -> <Buffer 30 30 34 31>
   */
  convertNumToHexToBuf: 'convertNumToHexToBuf',
  /**
   * Buffer를 Ascii Char로 변환 후 해당 값을 Hex Number로 인식하고 Dec Number로 변환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @returns {number} Dec
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041' -> (Dec) 65
   */
  convertBufToHexToDec: 'convertBufToHexToDec',
  /**
   * Buffer를 Ascii Char로 변환 후 반환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @returns {string}
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041'
   */
  convertBufToHex: 'convertBufToHex',
  /**
   * Buffer를 Ascii Char로 변환 후 해당 값을 Hex Number로 인식하고 Dec Number로 변환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @param {string} encoding
   * @returns {number} Dec
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041' -> (Dec) 41
   */
  convertBufToHexToNum: 'convertBufToHexToNum',
  /**
   * Buffer Hx를 binaryLength * Count(Buffer Length) = Binary String 으로 치환하여 반환
   * @param {Buffer} buffer Buffer
   * @return {string}
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041' -> (string) '0000000001000001'
   */
  convertBufToHexToBin: 'convertBufToHexToBin',
  /**
   * Ascii Char String 을 binaryLength * Count(String) = Binary String 으로 치환하여 반환
   * @param {String} asciiString ascii char를 2진 바이너리로 변환하여 반환
   * @example
   * (Hex)'0041' -> (string) '0000000001000001'
   */
  convertHexToBin: 'convertHexToBin',
};
exports.parsingMethod = parsingMethod;
