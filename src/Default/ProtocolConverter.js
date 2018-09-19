// const EventEmitter = require('events');
const {BU} = require('base-util-jh');
const _ = require('lodash');

// const {definedCommanderResponse} =  require('default-intelligence').dccFlagModel;
const {definedCommanderResponse} = require('../../../../module/default-intelligence').dccFlagModel;

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
    let returnValue = n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;

    if (width < returnValue.length) {
      const sliceLength = returnValue.length - width;
      returnValue = returnValue.slice(sliceLength);
    }

    return returnValue;
  }

  // convertChrToHx

  /**
   *
   * @param {number} dec 10진수 number, Buffer로 바꿀 값
   * @param {number} byteLength Hex to Ascii Buffer 후 Byte Length. Buffer의 길이가 적을 경우 앞에서부터 0 채움
   * @return {Buffer}
   * @example
   * (Dec) 65 -> (Hex)'41' -> <Buffer 30 30 34 31>
   */
  convertNumToHexToBuf(dec, byteLength) {
    if (!_.isNumber(dec)) return Buffer.from('');
    let hex = dec.toString(16);
    hex = this.pad(hex, byteLength || 4);
    return Buffer.from(hex, 'ascii');
  }

  /**
   *
   * @param {number} dec 10진수 number, Buffer로 바꿀 값
   * @param {number} byteLength Hex to Ascii Buffer 후 Byte Length. Buffer의 길이가 적을 경우 앞에서부터 0 채움
   * @return {Buffer}
   * @example
   * (Dec) 41 ->  <Buffer 30 30 34 31>
   */
  convertNumToBuf(dec, byteLength) {
    if (!_.isNumber(dec)) return Buffer.from('');
    dec = this.pad(dec.toString(), byteLength || 4);
    return Buffer.from(dec, 'ascii');
  }

  /**
   * Buffer를 Ascii Char로 변환 후 해당 값을 Hex Number로 인식하고 Dec Number로 변환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @returns {number} Dec
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041' -> (Dec) 65
   */
  convertBufToHexToDec(buffer) {
    if (!Buffer.isBuffer(buffer)) return null;

    const str = buffer.toString('ascii');

    return Number(this.converter().hex2dec(str));
  }

  /**
   * Buffer를 Ascii Char로 변환 후 반환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @returns {string}
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041'
   */
  convertBufToHex(buffer) {
    if (!Buffer.isBuffer(buffer)) return '';
    return buffer.toString();
  }

  /**
   * Buffer를 Ascii Char로 변환 후 해당 값을 Hex Number로 인식하고 Dec Number로 변환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34>
   * @param {string} encoding
   * @returns {number} Dec
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041' -> (Dec) 41
   */
  convertBufToHexToNum(buffer, encoding) {
    if (!Buffer.isBuffer(buffer)) return null;
    const strValue = encoding ? buffer.toString(encoding) : buffer.toString();
    return _.isNaN(strValue) ? strValue : Number(strValue);
  }

  /**
   * Buffer Hx를 binaryLength * Count(Buffer Length) = Binary String 으로 치환하여 반환
   * @param {Buffer} buffer Buffer
   * @return {string}
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041' -> (string) '0000000001000001'
   */
  convertBufToHexToBin(buffer, binaryLength) {
    if (!Buffer.isBuffer(buffer)) return '';
    let returnValue = '';
    buffer.forEach(element => {
      const bin = this.converter().hex2bin(element);
      returnValue = returnValue.concat(this.pad(bin, binaryLength || 8));
    });

    return returnValue;
  }

  /**
   * Ascii Char String 을 binaryLength * Count(String) = Binary String 으로 치환하여 반환
   * @param {String} asciiString ascii char를 2진 바이너리로 변환하여 반환
   * @example
   * (Hex)'0041' -> (string) '0000000001000001'
   */
  convertHexToBin(asciiString, binaryLength) {
    if (!Buffer.isBuffer(asciiString)) return '';
    let returnValue = '';

    for (let index = 0; index < asciiString.length; index += 1) {
      const bin = this.converter().hex2bin(asciiString.charAt(index));
      returnValue = returnValue.concat(this.pad(bin, binaryLength || 4));
    }
    return returnValue;
  }

  /**
   * Buffer Hex 합산 값을 Byte 크기만큼 Hex로 재 변환
   * @param {Buffer} buffer Buffer
   * @param {Number} byteLength Buffer Size를 Byte로 환산할 값, Default: 4
   */
  getBufferCheckSum(buffer, byteLength) {
    let hx = 0;
    buffer.forEach(element => {
      hx += element;
    });
    return Buffer.from(this.pad(hx.toString(16), byteLength || 4));
  }

  /**
   * Buffer Element Hex 값 Sum
   * @param {Buffer} buffer 계산하고자 하는 Buffer
   * @param {Boolean} isReturnDec CheckSum을 Dec 로 받을지 여부. 기본값은 Hex
   */
  getSumBuffer(buffer, isReturnDec) {
    let decCheckSum = 0;
    buffer.forEach(element => (decCheckSum += element));
    // BU.CLI(decCheckSum)
    if (isReturnDec) {
      return decCheckSum;
    }
    const hexCheckSum = this.converter().dec2hex(decCheckSum);
    return hexCheckSum;
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
      const strDel = Buffer.isBuffer(del) ? del.toString() : this.makeMsg2Buffer(del).toString();
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
        } else if (arg.type === 'Buffer') {
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
      ? Number((parseFloat(value) * scale).toFixed(typeof toFixed === 'number' ? toFixed : 1))
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
    ConvertBase.bin2dec = num =>
      ConvertBase(num)
        .from(2)
        .to(10);

    // binary to hexadecimal
    ConvertBase.bin2hex = num =>
      ConvertBase(num)
        .from(2)
        .to(16);

    // decimal to binary
    ConvertBase.dec2bin = num =>
      ConvertBase(num)
        .from(10)
        .to(2);

    // decimal to hexadecimal
    ConvertBase.dec2hex = num =>
      ConvertBase(num)
        .from(10)
        .to(16);

    // hexadecimal to binary
    ConvertBase.hex2bin = num =>
      ConvertBase(num)
        .from(16)
        .to(2);

    // hexadecimal to decimal
    ConvertBase.hex2dec = num =>
      ConvertBase(num)
        .from(16)
        .to(10);
    return ConvertBase;
  }

  /**
   * dcData에서 현재 진행중인 명령 요청을 가져옴
   * @param {dcData} dcData
   */
  getCurrTransferCmd(dcData) {
    return _.get(_.nth(dcData.commandSet.cmdList, dcData.commandSet.currCmdIndex), 'data');
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
