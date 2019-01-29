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
   * Buffer 본연의 API를 이용하여 데이터를 Int or UInt 형으로 읽음.
   * option 에 따라 BE or LE 읽을지 여부, Int or UInt 로 읽을지가 결정됨.
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @param {Object=} option
   * @param {boolean} option.isLE
   * @param {boolean} option.isUnsigned
   * @returns {number} Dec
   * @example
   * <Buffer 30 30 34 31> -> (Dec) 65
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
   * @desc 1 Byte Buffer -> Hex -> 8 Bit
   * Buffer Hx 각 단위를 BIN으로 변경
   * @param {Buffer} buffer Buffer
   * @param {number=} binaryLength binary 단위
   * @return {string}
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'3 0 3 0 3 4 3 1' -> (string) '‭0011 0000 0011 0000 0011 0100 0011 0001‬'
   */
  convertBufToHexToBin: 'convertBufToHexToBin',
  /**
   * @desc 1 Byte Buffer -> 4 Bit. Buffer DEC 값 범위: 0~F
   * Buffer 1 Byte의 DEC 값을 BIN 바꿈
   * @param {Buffer} buffer Buffer
   * @return {string}
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0 0 4 1' -> (string) '0000 0000 0100 0001'
   */
  convertBufToStrToBin: 'convertBufToStrToBin',
  /**
   * 각 String 값을 Hex로 보고 BIN 바꿈
   * @param {string} asciiString ascii char를 2진 바이너리로 변환하여 반환
   * @example
   * (Hex)'0 0 4 1' -> (string) '0000 0000 0100 0001'
   */
  convertStrToBin: 'convertStrToBin',
};
exports.parsingMethod = parsingMethod;
