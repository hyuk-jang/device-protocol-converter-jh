const _ = require('lodash');
const crc = require('crc');

const { BU } = require('base-util-jh');

const { definedCommanderResponse } = require('../module').di.dccFlagModel;

class Converter {
  constructor() {
    this.resultMakeMsg2Buffer = [];
    this.definedCommanderResponse = definedCommanderResponse;
  }

  /**
   * Start of Heading
   * @return {Buffer}
   */
  get SOH() {
    return Buffer.from([0x01]);
  }

  /**
   * Start of Text
   * @return {Buffer}
   */
  get STX() {
    return Buffer.from([0x02]);
  }

  /**
   * End of Text
   * @return {Buffer}
   */
  get ETX() {
    return Buffer.from([0x03]);
  }

  /**
   * End of Transmission
   * @return {Buffer}
   */
  get EOT() {
    return Buffer.from([0x04]);
  }

  /**
   * Enquiry
   * @return {Buffer}
   */
  get ENQ() {
    return Buffer.from([0x05]);
  }

  /**
   * Acknowledge
   * @return {Buffer}
   */
  get ACK() {
    return Buffer.from([0x06]);
  }

  /**
   * Cancel
   * @return {Buffer}
   */
  get CAN() {
    return Buffer.from([0x18]);
  }

  /**
   * 기준이 되는 값(n)을 원하는 길이(width)에 맞춰 0을 앞부터 채워 반환
   * 만약 결과 값의 길이가 width를 초과한다면 앞에서부터 데이터 삭제
   * @param {string} n
   * @param {number} width
   * @return {string}
   */
  pad(n, width) {
    n += '';
    let returnValue =
      n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;

    if (width < returnValue.length) {
      const sliceLength = returnValue.length - width;
      returnValue = returnValue.slice(sliceLength);
    }

    return returnValue;
  }

  /**
   * '+12.12-12.12' >> [12.12, -12.12]
   * @param {string|Buffer} data 변화할려는 데이터
   * @param {number} sliceLength 자를려는 길이
   * @param {number=} toFixed
   */
  convertArrayNumber(data, sliceLength, toFixed) {
    // BU.CLIS(data, sliceLength, toFixed);
    if (Buffer.isBuffer(data)) {
      data = data.toString();
    }

    return data.match(new RegExp(`.{1,${sliceLength}}`, 'g')).map(strData => {
      return typeof toFixed === 'number' ? _.round(strData, toFixed) : Number(strData);
    });
  }

  /**
   * Buffer 시작값이 0인경우 없앰
   * @param {Buffer} buffer
   */
  filterZeroBuf(buffer) {
    let isFindPositive = false;
    return buffer.filter((num, index) => {
      // 0이 아닌 수가 나온다면 이후 값은 전부 반환
      if (num > 0) {
        isFindPositive = true;
      }

      return isFindPositive || index === buffer.length - 1;
    });
  }

  /**
   * Buffer API를 이용하여 숫자로 변환
   * option 에 따라 반환 Buffer Size, BE or LE , Int or UInt 형태 결정됨.
   * @default
   * BE, Unsign, Alloc Auto
   * @param {number} dec 변환할 수 (10진수)
   * @param {Object} option
   * @param {number=} option.allocSize default Auto
   * @param {number=} option.byteLength return Buffer Length
   * @param {number=} option.scale default 1
   * @param {boolean=} option.isLE default true
   * @param {boolean=} option.isUnsigned default true
   * @returns {Buffer} Dec
   * @example
   * (Dec) 65 -> <Buffer 34 31>
   */
  convertNumToWriteInt(dec, option = {}) {
    // 문자형 숫자라면 치환
    BU.isNumberic(dec) && (dec = Number(dec));

    // 숫자가 아니라면 즉시 빈 버퍼 반환
    if (!_.isNumber(dec)) return null;

    const { byteLength = 0, scale = 1, isLE = false, isUnsigned = true } = option;

    let { allocSize = 0 } = option;

    let isZeroFilter = 0;
    // allocSize가 0이라면 Buffer 4개 할당 후 ZeroFilter Flag: true
    if (allocSize === 0) {
      isZeroFilter = 1;
      allocSize = 4;
    }

    // 배율이 존재할 경우 곱셈
    dec = scale !== 1 ? _.round(_.multiply(dec, scale)) : _.round(dec);

    const returnBuffer = Buffer.alloc(allocSize);

    if (isLE && isUnsigned) {
      switch (allocSize) {
        case 1:
          returnBuffer.writeUIntLE(dec, 0, 1);
          break;
        case 2:
          returnBuffer.writeUInt16LE(dec);
          break;
        case 4:
          returnBuffer.writeUInt32LE(dec);
          break;
        default:
          break;
      }
    } else if (isLE && !isUnsigned) {
      switch (allocSize) {
        case 1:
          returnBuffer.writeIntLE(dec, 0, 1);
          break;
        case 2:
          returnBuffer.writeInt16LE(dec);
          break;
        case 4:
          returnBuffer.writeInt32LE(dec);
          break;
        default:
          break;
      }
    } else if (!isLE && isUnsigned) {
      switch (allocSize) {
        case 1:
          returnBuffer.writeUIntBE(dec, 0, 1);
          break;
        case 2:
          returnBuffer.writeUInt16BE(dec);
          break;
        case 4:
          returnBuffer.writeUInt32BE(dec);
          break;
        default:
          break;
      }
    } else if (!isLE && !isUnsigned) {
      switch (allocSize) {
        case 1:
          returnBuffer.writeIntBE(dec);
          break;
        case 2:
          returnBuffer.writeInt16BE(dec);
          break;
        case 4:
          returnBuffer.writeInt32BE(dec);
          break;
        default:
          break;
      }
    }

    // byteLength가 클 경우 Buffer 00 추가
    if (byteLength > returnBuffer.length) {
      const addBuffer = Buffer.alloc(byteLength - returnBuffer, 0);

      return Buffer.concat(addBuffer, returnBuffer);
    }

    // 앞에서부터 삭제하고 반환
    if (byteLength > 0 && byteLength < returnBuffer.length) {
      return returnBuffer.slice(returnBuffer.length - byteLength);
    }

    return isZeroFilter ? this.filterZeroBuf(returnBuffer) : returnBuffer;
  }

  /**
   * 10진수를 toString(Radix)로 변환한 후 각 자리수를 Buffer로 반환
   * @param {number} dec 10진수 number, Buffer로 바꿀 값
   * @param {convertNumOption} convertNumOption 변환 옵션
   * @return {Buffer}
   * @example
   * (Dec) 65 -> (Hex)'41' -> <Buffer 30 30 34 31>
   */
  convertNumToStrToBuf(dec, convertNumOption = {}) {
    const { byteLength = 4, toStringRadix = 16 } = convertNumOption;

    let hex = dec.toString(toStringRadix);
    hex = this.pad(hex, byteLength);
    return Buffer.from(hex);
  }

  /**
   * Buffer 본연의 API를 이용하여 데이터를 Int or UInt 형으로 읽음.
   * option 에 따라 BE or LE 읽을지 여부, Int or UInt 로 읽을지가 결정됨.
   * @default
   * BE, Unsign
   * @param {Buffer} bufData 변환할 Buffer ex <Buffer 30 30 34 34>
   * @param {Object} option
   * @param {boolean} option.isLE
   * @param {boolean} option.isUnsigned
   * @param {number} option.intBufLen 정수부 Buffer 길이
   * @returns {number} Dec
   * @example
   * <Buffer 30 30 34 31> -> (Dec) 65
   */
  convertBufToReadInt(bufData, option = {}) {
    const bufLen = bufData.length;
    const { isLE = false, isUnsigned = true, intBufLen = bufLen } = option;
    const decimalBufLen = bufLen - intBufLen;

    let returnInteger = 0;
    let returnDecimal = 0;

    if (isLE && isUnsigned) {
      returnInteger = bufData.readUIntLE(0, intBufLen);
      returnDecimal =
        intBufLen !== bufLen ? bufData.readUIntLE(intBufLen, decimalBufLen) : 0;
    } else if (isLE && !isUnsigned) {
      returnInteger = bufData.readIntLE(0, intBufLen);
      returnDecimal =
        intBufLen !== bufLen ? bufData.readIntLE(intBufLen, decimalBufLen) : 0;
    } else if (!isLE && isUnsigned) {
      returnInteger = bufData.readUIntBE(0, intBufLen);
      returnDecimal =
        intBufLen !== bufLen ? bufData.readUIntBE(intBufLen, decimalBufLen) : 0;
    } else if (!isLE && !isUnsigned) {
      returnInteger = bufData.readIntBE(0, intBufLen);
      returnDecimal =
        intBufLen !== bufLen ? bufData.readIntBE(intBufLen, decimalBufLen) : 0;
    }

    return returnDecimal === 0
      ? returnInteger
      : Number(`${returnInteger}.${returnDecimal}`);
  }

  /**
   * Buffer를 Ascii Char로 변환 후 반환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @returns {string}
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041'
   */
  convertBufToStr(buffer) {
    return buffer.toString();
  }

  /**
   * 지정된 오프셋의 buf에서 32 비트 빅 or 리틀 엔디안 부동 소수점을 읽습니다.
   * @param {Buffer} bufData
   * @param {Object} option
   * @param {boolean} option.isLE default false
   * @param {boolean} option.offset default false
   */
  convertBufToFloat(bufData, option = {}) {
    const { isLE = false, offset = 0 } = option;

    return isLE ? bufData.readFloatLE(offset) : bufData.readFloatBE(offset);
  }

  /**
   * Buffer를 Ascii Char로 변환 후 반환
   * @param {Buffer|string} bufStr 변환할 Buffer ex <Buffer 30 30 34 34>
   * @returns {string}
   * @example
   * <Buffer 30 30 34 31> -> (Char) --> '0041' --> (Hex)'30303431'
   * '0041' --> (Hex)'30303431'
   */
  convertToHex(bufStr) {
    if (_.isString(bufStr)) {
      bufStr = Buffer.from(bufStr);
    }
    if (!Buffer.isBuffer(bufStr)) {
      throw new Error(`${bufStr} is not Buffer type`);
    }
    let returnValue = '';
    bufStr.forEach(element => {
      returnValue = returnValue.concat(this.converter().dec2hex(element));
    });

    return returnValue;
  }

  /**
   * Buffer를 Ascii Char로 변환 후 해당 값을 Hex Number로 인식하고 Dec Number로 변환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @param {number=} parseFloatRadix default 10, 정수 변환 인코딩
   * @returns {number} Dec
   * @example
   * parseIntRadix 10 >> <Buffer 30 30 34 31> -> (Char)'0041' -> (10진수 변환) 41
   * parseIntRadix 16 >> <Buffer 30 30 34 31> -> (Char)'0041' -> (16진수 변환) 65
   */
  convertBufToStrToNum(buffer, parseFloatRadix = 10) {
    const strValue = buffer.toString();
    // BU.CLI(strValue);

    let returnNumber = Number(strValue);

    switch (parseFloatRadix) {
      // OCT, HEX
      case 8:
      case 16:
        returnNumber = parseInt(strValue, parseFloatRadix);
        break;
      // DEC
      case 10:
        returnNumber = parseFloat(strValue);
        break;
      default:
        break;
    }

    return returnNumber;
  }

  /**
   * @desc 1 Byte Buffer -> Hex -> 8 Bit
   * Buffer Hx 각 단위를 BIN으로 변경
   * @param {Buffer} buffer Buffer
   * @param {number=} binaryLength binary 단위
   * @return {string}
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'30303431' -> (string) '‭0011 0000 0011 0000 0011 0100 0011 0001‬'
   */
  convertBufToHexToBin(buffer, binaryLength = 8) {
    let returnValue = '';
    buffer.forEach(element => {
      const hex = this.converter().dec2hex(element);
      const bin = this.converter().hex2bin(hex);
      returnValue = returnValue.concat(this.pad(bin, binaryLength));
    });

    return returnValue;
  }

  /**
   * @desc 1 Byte Buffer -> 4 Bit. Buffer DEC 값 범위: 0~F
   * Buffer를  String으로 변환 후 각 String 값을 Hex로 보고 BIN 바꿈
   * @param {Buffer} buffer Buffer
   * @return {string}
   * @example
   * <Buffer 30 30 34 31> -> (Char)'0041' -> (string) '0000 0000 0100 0001'
   */
  convertBufToStrToBin(buffer, binaryLength = 4) {
    return this.convertToBin(buffer.toString(), binaryLength);
  }

  /**
   * FIXME:
   * @desc 1 Byte Buffer -> 4 Bit. Buffer DEC 값 범위: 0~F
   * Buffer를  String으로 변환 후 각 String 값을 Hex로 보고 BIN  바꾼 후 0->1 , 1->0 으로 바꿈
   * @param {Buffer} buffer Buffer
   * @return {string}
   * @example
   * <Buffer 30 30 34 31> -> (Char)'0041' -> (string) '0000 0000 0100 0001' -> (string) '1111 1111 1011 1110'
   */
  convertBufToStrToBinConverse(buffer, binaryLength = 4) {
    return _.map(this.convertToBin(buffer, binaryLength), strSingleBinary =>
      _.eq(strSingleBinary, '0') ? '1' : '0',
    ).join('');
  }

  /**
   * 각 String 값을 Hex로 보고 BIN 바꿈
   * @param {string|Buffer} bufStr ascii char를 2진 바이너리로 변환하여 반환
   * @example
   * <Buffer 30 30 34 31> -> (Char)'0041' -> (string) '0000 0000 0100 0001'
   * (Char)'0 0 4 1' -> (string) '0000 0000 0100 0001'
   */
  convertToBin(bufStr, binaryLength = 4) {
    if (Buffer.isBuffer(bufStr)) {
      bufStr = bufStr.toString();
    }

    if (!_.isString(bufStr)) {
      throw new Error(`${bufStr} is not String type`);
    }

    let returnValue = '';

    for (let index = 0; index < bufStr.length; index += 1) {
      const bin = this.converter().hex2bin(bufStr.charAt(index));
      returnValue = returnValue.concat(this.pad(bin, binaryLength));
    }
    return returnValue;
  }

  /**
   * data -> bit -> arr -> reverse
   * @param {Buffer|string} data 변환하고자 하는 데이터
   * @param {number} bitLength (default: 4) data를 bit로 표현할 개수
   * @return {string[]}
   * @example
   * '12' > (dec2bin) '1100' > split('') [1, 1, 0, 0] > (reverse) [0, 0, 1, 1]
   */
  convertDataToBitArray(data, bitLength = 4) {
    return (
      this.converter()
        // '12' >> '1100'
        .dec2bin(Number(data.toString()))
        // 8이하의 수일 경우 4자리가 안되므로 앞자리부터 0 채움
        .padStart(bitLength, '0')
        // '1100' >> [1, 1, 0, 0]
        .split('')
        // MSB >> LSB 변환, [1, 1, 0, 0] >> [0, 0, 1, 1]
        .reverse()
    );
  }

  /**
   * hex -> split -> hex2bin -> reverse -> flatten
   * @param {Buffer|string} data Buffer or hex string
   * @return {number[]}
   * @example
   * '0x010e' > (split length) [01, 0e] > (hex2bin) '[0000 0001], [0000 1110]' >
   * > (reverse) [[1000 0000], [0111 0000]] > (flatten) [1000 0000 0111 0000]
   */
  convertHexToBitArray(data) {
    const hexData = Buffer.isBuffer(data) ? data.toString('hex') : data;
    console.log('hexData', hexData);
    // 길이로 짜름
    const chunkArr = hexData.match(new RegExp('.{1,2}', 'g'));

    return _.chain(chunkArr)
      .map(hex =>
        this.converter().hex2bin(hex).padStart(8, '0').split('').reverse().map(Number),
      )
      .flatten()
      .value();
  }

  /**
   * bitNum[] -> str -> split -> reverse -> Buffer
   * @param {string[]} data 변환하고자 하는 데이터
   * @param {number} bitLength (default: 4) data를 bit로 표현할 개수
   * @return {number[]}
   * @example
   * ['1', '1', '0', '1', '0', '0', '0', '1'] > (split length) [[1, 1, 0, 1], [0, 0, 0, 1]]
   * > (reverse) [1, 0, 1, 1],[1, 0, 0, 0] > parseInt(2) [13, 8]
   */
  convertBitArrayToData(data, bitLength = 4) {
    return _.chain(data)
      .join('')
      .thru(strNum => {
        // 문자 개수로 짜름
        const chunkArr = strNum.match(new RegExp(`.{1,${bitLength}}`, 'g'));

        const refineNumArr = chunkArr.map(chunkStr => {
          // 8자리로 맞춤
          const refineChunkStr = _.padEnd(chunkStr, bitLength, '0');
          // 문자 역순(LE)
          const binValue = refineChunkStr.split('').reverse().join('');
          return parseInt(binValue, 2);
        });

        return refineNumArr;
      })
      .value();
  }

  /**
   * Buffer Hex 합산 값을 Byte 크기만큼 Hex로 재 변환
   * @param {Buffer} buffer Buffer
   * @param {Number} byteLength Buffer Size를 Byte로 환산할 값, Default: 4
   */
  getBufferChecksum(buffer, byteLength) {
    return Buffer.from(this.pad(_.sum(buffer).toString(16), byteLength || 4));
  }

  /**
   * Xbee API 체크섬
   * @param {Buffer} buffer
   */
  getDigiChecksum(buffer) {
    const lower8Bit = this.convertNumToWriteInt(_.sum(buffer), { byteLength: 1 });
    //
    const crcNum = Buffer.from('ff', 'hex').readInt8() - lower8Bit.readInt8();

    return Buffer.from([crcNum]);
  }

  /**
   * Modbus API 체크섬
   * @param {Buffer} buffer
   */
  getModbusChecksum(buffer) {
    const crcValue = crc.crc16modbus(buffer);
    // 4 Length Buffer
    const lower = this.convertNumToStrToBuf(crcValue);

    return Buffer.from(lower.toString(), 'hex').reverse();
  }

  /**
   * Buffer Element Hex 값 Sum
   * @param {Buffer} buffer 계산하고자 하는 Buffer
   * @return {Buffer}
   */
  getSumBuffer(buffer) {
    buffer = _.isString(buffer) ? Buffer.from(buffer) : buffer;
    return Buffer.from([_.sum(buffer)]);
  }

  /**
   * Buffer Element Hex 값 Sum
   * @param {Buffer} buffer 계산하고자 하는 Buffer
   */
  getXorBuffer(buffer) {
    // eslint-disable-next-line no-bitwise
    return Buffer.from([buffer.reduce((prev, next) => prev ^ next)]);
  }

  /**
   * Buffer에서  옵션의 구분자를 제외하고 반환
   * @param {Buffer|string} buffer
   * @param {Buffer|string} delimiter
   */
  returnBufferExceptDelimiter(buffer, ...delimiter) {
    let strBuf = Buffer.isBuffer(buffer)
      ? buffer.toString()
      : this.makeMsg2Buffer(buffer).toString();

    delimiter.forEach(del => {
      const strDel = Buffer.isBuffer(del)
        ? del.toString()
        : this.makeMsg2Buffer(del).toString();
      const rep = new RegExp(strDel, 'g');
      strBuf = strBuf.replace(rep, '');
    });
    return this.makeMsg2Buffer(strBuf);
  }

  /**
   * Buffer를 String으로 변환 후 옵션의 구분자를 제외하고 합산 계산 후 반환
   * @param {Buffer|string} buffer
   * @param {string} delimiter
   */
  getSumAllNumberOfDigit(buffer, ...delimiter) {
    const realBuf = this.returnBufferExceptDelimiter(buffer, delimiter);

    const strBuf = realBuf.toString();
    let returnValue = 0;
    _.forEach(strBuf, strNum => {
      returnValue += _.toNumber(this.converter().hex2dec(strNum));
    });

    return returnValue;
  }

  /**
   * Ascii Char To Ascii Hex
   * @param {Buffer|string|string[]|number|number[]}
   */
  makeMsg2Buffer(...args) {
    // BU.CLI(args);
    if (Buffer.isBuffer(args)) {
      return args;
    }
    this.resultMakeMsg2Buffer = [];
    _.forEach(args, arg => {
      // let arg = args[index];
      // BU.CLIS(typeof arg)
      if (Array.isArray(arg)) {
        this.convertArray2Buffer(arg);
      } else if (typeof arg === 'string') {
        this.resultMakeMsg2Buffer.push(Buffer.from(arg));
      } else if (typeof arg === 'number') {
        this.resultMakeMsg2Buffer.push(Buffer.from(this.converter().dec2hex(arg), 'hex'));
      } else if (typeof arg === 'object') {
        if (Buffer.isBuffer(arg)) {
          this.resultMakeMsg2Buffer.push(arg);
        } else if (_.get(arg, 'type') === 'Buffer') {
          this.resultMakeMsg2Buffer.push(Buffer.from(arg.data));
        } else {
          const strMsg = JSON.stringify(arg);
          this.resultMakeMsg2Buffer.push(Buffer.from(strMsg));
        }
      } else if (arg === undefined) {
        this.resultMakeMsg2Buffer.push(Buffer.from(''));
      } else {
        this.resultMakeMsg2Buffer.push(arg);
      }
    });
    // BU.CLI(this.resultMakeMsg2Buffer)
    return Buffer.concat(this.resultMakeMsg2Buffer);
  }

  /**
   * 배열을 Buffer로 변환하여 msgBuffer에 저장
   * @param {Array} arr Array<Buffer, String, Number, Array> 가능
   */
  convertArray2Buffer(arr) {
    // BU.CLI(arr)
    if (Array.isArray(arr)) {
      arr.forEach(element => {
        if (Array.isArray(element)) {
          return this.convertArray2Buffer(element);
        }
        if (typeof element === 'object') {
          // Buffer
          if (Buffer.isBuffer(element)) {
            return this.resultMakeMsg2Buffer.push(element);
          }
          if (element.type === 'Buffer') {
            return this.resultMakeMsg2Buffer.push(Buffer.from(element));
          }
          const strMsg = JSON.stringify(element);
          this.resultMakeMsg2Buffer.push(Buffer.from(strMsg));
        } else if (typeof element === 'number') {
          // Dec
          // BU.CLI(element)
          return this.resultMakeMsg2Buffer.push(Buffer.from([element]));
        } else if (typeof element === 'string') {
          // Ascii Chr
          return this.resultMakeMsg2Buffer.push(Buffer.from(element));
        }
        // BU.CLI(this.resultMakeMsg2Buffer)
      });
    }
  }

  /**
   * 단일 값 Sacle 적용. 소수점 절삭
   * @param {Number} value Scale을 적용할 Value
   * @param {Number} scale 배율. 계산한 후 소수점 절삭 1자리
   */
  applyValueCalculateScale(value, scale, toFixed) {
    return typeof value === 'number'
      ? Number(
          (parseFloat(value) * scale).toFixed(typeof toFixed === 'number' ? toFixed : 1),
        )
      : value;
  }

  /**
   * Object에 Sacle 적용. 소수점 절삭
   * @param {Object} obj Scale을 적용할 Object Data
   * @param {Number} scale 배율. 계산한 후 소수점 절삭 1자리
   */
  applyObjCalculateScale(obj, scale, toFixed) {
    _.forEach(obj, (value, key) => {
      obj[key] = this.applyValueCalculateScale(value, scale, toFixed);
    });
    return obj;
  }

  converter() {
    function ConvertBase(num) {
      return {
        from: baseFrom => ({
          to: baseTo => parseInt(num, baseFrom).toString(baseTo),
        }),
      };
    }

    // binary to decimal
    ConvertBase.bin2dec = num => ConvertBase(num).from(2).to(10);

    // binary to hexadecimal
    ConvertBase.bin2hex = num => ConvertBase(num).from(2).to(16);

    // decimal to binary
    ConvertBase.dec2bin = num => ConvertBase(num).from(10).to(2);

    // decimal to hexadecimal
    ConvertBase.dec2hex = num => ConvertBase(num).from(10).to(16);

    // hexadecimal to binary
    ConvertBase.hex2bin = num => ConvertBase(num).from(16).to(2);

    // hexadecimal to decimal
    ConvertBase.hex2dec = num => ConvertBase(num).from(16).to(10);
    return ConvertBase;
  }

  /**
   * dcData에서 현재 진행중인 명령 요청을 가져옴
   * @param {dcData} dcData
   */
  getCurrTransferCmd(dcData) {
    return _.get(
      _.nth(dcData.commandSet.cmdList, dcData.commandSet.currCmdIndex),
      'data',
    );
  }

  /**
   * dcData에서 현재 진행중인 명령 요청을 수정할 경우 호출
   * @param {dcData} dcData
   * @param {Buffer} currTransferCmd 설정할 요청 명령
   */
  setCurrTransferCmd(dcData, currTransferCmd) {
    return _.set(
      _.nth(dcData.commandSet.cmdList, dcData.commandSet.currCmdIndex),
      'data',
      currTransferCmd,
    );
  }
}
module.exports = Converter;

// const converter = new Converter();
// console.log('convertNumToStrToBuf', converter.convertNumToStrToBuf(0, 2));
// console.log('convertNumToWriteInt', converter.convertNumToWriteInt(20480));
// console.log(converter.convertBufToReadInt(Buffer.from('010a')));
// console.log(converter.convertBufToStrToNum(Buffer.from('0101')));
// console.log(converter.convertBufToStrToNum(Buffer.from('01.1')));
// console.log(converter.convertBufToStrToNum(Buffer.from('0101'), 16));
// console.log(converter.convertBufToStrToNum(Buffer.from('01.1'), 16));
// console.log(converter.convertBufToStrToNum(Buffer.from('0e05'), 16));
// console.log(converter.convertBufToStrToNum(Buffer.from('0e.e'), 16));
// console.log(
//   converter.convertBufToReadInt(Buffer.from('12345678', 'hex'), {
//     intBufLen: 3,
//   }),
// );

/**
 * 숫자를 Buffer로 변환하기 위한 옵션
 * @typedef {Object} convertNumOption
 * @property {number} byteLength default: 4, 반환 데이터 길이
 * @property {number=} toStringRadix default: 16, toString(radix)
 */

/**
 * Buffer를 변환하기 위한 옵션
 * @typedef {Object} convertBufToNumOption
 * @property {number} byteLength default: 4, 반환 데이터 길이
 * @property {number=} parseIntRadix default: 16, toString(radix)
 */
