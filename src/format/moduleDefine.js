const parsingMethod = {
  /**
   * 10진수를 toString(Radix)로 변환한 후 각 자리수를 Buffer로 반환
   * @param {number} dec 10진수 number, Buffer로 바꿀 값
   * @param {convertNumOption} convertNumOption 변환 옵션
   * @return {Buffer}
   * @example
   * Radix: 16 (Dec) 65 -> (Hex)'41' -> <Buffer 30 30 34 31>
   * Radix: 10 (Dec) 65 -> (Hex)'65' -> <Buffer 30 30 36 35>
   */
  convertNumToStrToBuf: 'convertNumToStrToBuf',
  /**
   * Buffer 본연의 API를 숫자를 Buffer로 변환
   * option 에 따라 반환 Buffer Size, BE or LE , Int or UInt 형태 결정됨.
   * @param {number} dec 변환할 수 (10진수)
   * @param {Object} option
   * @param {number} option.allocSize
   * @param {number=} option.scale
   * @param {boolean} option.isLE
   * @param {boolean} option.isUnsigned
   * @returns {Buffer} Dec
   * @example
   * (Dec) 65 -> <Buffer 34 31>
   */
  convertNumToWriteInt: 'convertNumToWriteInt',
  /**
   * Buffer 본연의 API를 이용하여 데이터를 Int or UInt 형으로 읽음.
   * option 에 따라 BE or LE 읽을지 여부, Int or UInt 로 읽을지가 결정됨.
   * @default
   * BE, Unsign
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @param {Object=} option
   * @param {boolean} option.isLE
   * @param {boolean} option.isUnsigned
   * @returns {number} Dec
   * @example
   * <Buffer 30 30 34 31> -> (Dec) 65
   */
  convertBufToReadInt: 'convertBufToReadInt',
  /**
   * Buffer를 Ascii Char로 변환 후 반환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @returns {string}
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041'
   */
  convertBufToStr: 'convertBufToStr',
  /**
   * 지정된 오프셋의 buf에서 32 비트 빅 or 리틀 엔디안 부동 소수점을 읽습니다.
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @param {Object} option
   * @param {boolean} option.isLE default false
   * @param {boolean} option.offset default false
   * @returns {number}
   * @example
   * <Buffer 41 a0 14 7b> -> 20.01
   */
  convertBufToFloat: 'convertBufToFloat',
  /**
   * Buffer를 Ascii Char로 변환 후 해당 값을 Hex Number로 인식하고 Dec Number로 변환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @param {string} encoding
   * @returns {number} Dec
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041' -> (Dec) 41
   */
  convertBufToStrToNum: 'convertBufToStrToNum',
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
   * @desc 1 Byte Buffer -> 4 Bit. Buffer DEC 값 범위: 0~F
   * Buffer를  String으로 변환 후 각 String 값을 Hex로 보고 BIN 바꾼 후 0->1 , 1->0 으로 바꿈
   * @param {Buffer} buffer Buffer
   * @return {string}
   * @example
   * <Buffer 30 30 34 31> -> (Ascii)'0041' -> (string) '0000 0000 0100 0001' -> (string) '1111 1111 1011 1110'
   */
  convertBufToStrToBinConverse: 'convertBufToStrToBinConverse',
  /**
   * 각 String 값을 Hex로 보고 BIN 바꿈
   * @param {string} asciiString ascii char를 2진 바이너리로 변환하여 반환
   * @example
   * (Hex)'0 0 4 1' -> (string) '0000 0000 0100 0001'
   */
  convertToBin: 'convertToBin',
};
exports.parsingMethod = parsingMethod;
