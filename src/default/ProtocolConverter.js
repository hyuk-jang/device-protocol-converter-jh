// const EventEmitter = require('events');
const {BU} = require('base-util-jh');
const _ = require('lodash');

const {definedCommanderResponse} = require('../format/moduleDefine');

class Converter {
  constructor() {

    this.resultMakeMsg2Buffer = [];

    this.definedCommanderResponse = definedCommanderResponse;
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
   * 기준이 되는 값(n)을 원하는 길이(width)에 맞춰 0을 앞부터 채워 반환
   * @param {string} n 
   * @param {number} width 
   * @return {string}
   */
  pad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
  }

  /**
   * 
   * @param {number} dec 10진수 number, Buffer로 바꿀 값
   * @param {number} byteLength Hex to Ascii Buffer 후 Byte Length. Buffer의 길이가 적을 경우 앞에서부터 0 채움
   * @return {Buffer}
   * @example
   * (Dec) 65 -> (Hex)'41' -> <Buffer 30 30 34 31>
   */
  convertNumToHexToBuf(dec, byteLength) {
    let hex = dec.toString(16);
    hex = this.pad(hex, byteLength || 4);
    return Buffer.from(hex, 'ascii');
  }

  /**
   * Buffer를 Ascii Char로 변환 후 해당 값을 Hex Number로 인식하고 Dec Number로 변환
   * @param {Buffer} buffer 변환할 Buffer ex <Buffer 30 30 34 34> 
   * @returns {number} Dec
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041' -> (Dec) 65
   */
  convertBufToHexToDec(buffer) {
    let str = buffer.toString();
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
    let strValue = encoding ? buffer.toString(encoding) : buffer.toString();
    return isNaN(strValue) ? strValue : Number(strValue);
  }


  /**
   * Buffer Hx를 binaryLength * Count(Buffer Length) = Binary String 으로 치환하여 반환
   * @param {Buffer} buffer Buffer
   * @return {string}
   * @example
   * <Buffer 30 30 34 31> -> (Hex)'0041' -> (string) '0000000001000001'
   */
  convertBufToHexToBin(buffer, binaryLength) {
    let returnValue = '';
    buffer.forEach(element => {
      let bin = this.converter().hex2bin(element);
      returnValue = returnValue.concat(this.pad(bin, binaryLength || 4));
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
    let returnValue = '';

    for (let index = 0; index < asciiString.length; index++) {
      let bin = this.converter().hex2bin(asciiString.charAt(index));
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
    buffer.forEach(element => decCheckSum += element);
    // BU.CLI(decCheckSum)
    if (isReturnDec) {
      return decCheckSum;
    } else {
      let hexCheckSum = this.converter().dec2hex(decCheckSum);
      return hexCheckSum;
    }
  }

  /**
   * Ascii Char To Ascii Hex
   */
  makeMsg2Buffer() {
    // BU.CLI(arguments)
    this.resultMakeMsg2Buffer = [];
    for (let index in arguments) {
      let arg = arguments[index];
      // BU.CLIS(typeof arg)
      if (Array.isArray(arg)) {
        this._convertArray2Buffer(arg);
      } else if (typeof arg === 'string') {
        this.resultMakeMsg2Buffer.push(Buffer.from(arg));
      } else if (typeof arg === 'number') {
        this.resultMakeMsg2Buffer.push(Buffer.from(this.converter().dec2hex(arg), 'hex'));
      } else if (typeof arg === 'object') {
        if (Buffer.isBuffer(arg)) {
          this.resultMakeMsg2Buffer.push(arg);
        } else if (arg.type === 'Buffer') {
          this.resultMakeMsg2Buffer.push(Buffer.from(arg));
        } else {
          let strMsg = JSON.stringify(arg);
          this.resultMakeMsg2Buffer.push(Buffer.from(strMsg));
        }
      } else {
        this.resultMakeMsg2Buffer.push(arg);
      }
    }
    // BU.CLI(this.resultMakeMsg2Buffer)
    return Buffer.concat(this.resultMakeMsg2Buffer);
  }

  /**
   * 배열을 Buffer로 변환하여 msgBuffer에 저장
   * @param {Array} arr Array<Buffer, String, Number, Array> 가능
   */
  _convertArray2Buffer(arr) {
    // BU.CLI(arr)
    if (Array.isArray(arr)) {
      arr.forEach(element => {
        if (Array.isArray(element)) {
          return this._convertArray2Buffer(element);
        } else if (typeof element === 'object') { // Buffer
          if (Buffer.isBuffer(element)) {
            return this.resultMakeMsg2Buffer.push(element);
          } else if (element.type === 'Buffer') {
            return this.resultMakeMsg2Buffer.push(Buffer.from(element));
          } else {
            let strMsg = JSON.stringify(element);
            this.resultMakeMsg2Buffer.push(Buffer.from(strMsg));
          }
        } else if (typeof element === 'number') { // Dec
          // BU.CLI(element)
          return this.resultMakeMsg2Buffer.push(Buffer.from([element]));
        } else if (typeof element === 'string') { // Ascii Chr
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
    return typeof value === 'number' ? Number((parseFloat(value) * scale).toFixed(typeof toFixed === 'number' ? toFixed : 1)) : value;
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
        from: baseFrom => {
          return {
            to: baseTo => parseInt(num, baseFrom).toString(baseTo)
          };
        }
      };
    }

    // binary to decimal
    ConvertBase.bin2dec = num => {
      return ConvertBase(num).from(2).to(10);
    };

    // binary to hexadecimal
    ConvertBase.bin2hex = num => {
      return ConvertBase(num).from(2).to(16);
    };

    // decimal to binary
    ConvertBase.dec2bin = num => {
      return ConvertBase(num).from(10).to(2);
    };

    // decimal to hexadecimal
    ConvertBase.dec2hex = num => {
      return ConvertBase(num).from(10).to(16);
    };

    // hexadecimal to binary
    ConvertBase.hex2bin = num => {
      return ConvertBase(num).from(16).to(2);
    };

    // hexadecimal to decimal
    ConvertBase.hex2dec = num => {
      return ConvertBase(num).from(16).to(10);
    };
    return ConvertBase;
  }


  /**
   * 
   * @param {dcData} dcData 
   */
  getCurrTransferCmd(dcData){
    return _.get(_.nth(dcData.commandSet.cmdList, dcData.commandSet.currCmdIndex), 'data'); 
  }


  /**
   * 
   * @param {Buffer} buffer 
   * @param {number|number[]} index 
   */
  pullAtBuffer(buffer, ...index){
    let returnBuffer = [];



  }

}
module.exports = Converter;