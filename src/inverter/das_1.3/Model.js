const {BU} = require('base-util-jh');
const _ = require('lodash');

const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  /**
   * 
   * @param {BaseModel} baseModel 
   */
  constructor(baseModel) {
    super();
    this.dialing = _.get(baseModel, 'protocol_info.deviceId'); 

    this.SOP = Buffer.from('^');
    this.DELIMETER = Buffer.from(',');
    this.REQ_CODE = Buffer.from('P');
    this.RES_CODE = Buffer.from('D');


    this.HEADER_INFO = {
      BYTE: {
        SOP: 1,
        CODE: 1,
        ADDR: 1,
        LENGTH: 2,
        ID: 3,
        CHECKSUM: 2
      }
    };

    this.BASE.SYSTEM.COMMAND.STATUS = [
      this.makeMsg('MOD')
    ];

    this.BASE.PV.COMMAND.STATUS = [
      this.makeMsg('ST1'),
    ];

    this.BASE.GRID.COMMAND.STATUS = [
      this.makeMsg('ST2'),
      this.makeMsg('ST3')
    ];
    
    this.BASE.POWER.COMMAND.STATUS = [
      this.makeMsg('ST4'),
    ];

    this.BASE.OPERATION_INFO.COMMAND.STATUS = [
      this.makeMsg('ST6'),
    ];

    this.BASE.DEFAULT.COMMAND.STATUS = _.flatten( _.concat([
      this.BASE.SYSTEM.COMMAND.STATUS,
      this.BASE.PV.COMMAND.STATUS,
      this.BASE.GRID.COMMAND.STATUS,
      this.BASE.POWER.COMMAND.STATUS,
      this.BASE.OPERATION_INFO.COMMAND.STATUS
    ]));
  }

  /**
   * @param {Buffer} requestBuf 인버터에 요청한 데이터
   * @return {number}
   */
  getRequestAddr(requestBuf){
    let cmd = _.toString(requestBuf.slice(5));
    let addr;
    switch (cmd) {
    case 'MOD':
      addr = 0;
      break;
    case 'ST1':
      addr = 1;
      break;
    case 'ST2':
      addr = 2;
      break;
    case 'ST3':
      addr = 3;
      break;
    case 'ST4':
      addr = 4;
      break;
    case 'ST6':
      addr = 6;
      break;
    default:
      break;
    }
    
    return addr;
  }

  /**
   * @param {Buffer} responseBuf 인버터에서 수신받은 데이터
   * @return {number}
   */
  getResponseAddr(responseBuf){
    return this.convertBufToHexToDec(responseBuf.slice(2, 3));
  }

  /**
   * @param {Buffer} responseBuf 인버터에서 수신받은 데이터
   * @return {Buffer}
   */
  getBody(){
    
  }

  /**
   * @param {Buffer} responseBuf 인버터에서 수신받은 데이터
   * @param {{dialing: Buffer, address: number, length: number, decodingDataList: Array.<{key: string, byte: number, callMethod: string}>}} decodingInfo 인버터에서 수신받은 데이터
   * @return {Buffer} Data Buffer만 리턴
   */
  checkValidate(responseBuf, decodingInfo){
    // BU.CLI(responseBuf);
    let SOP = Buffer.from([_.nth(responseBuf, 0)]) ;

    // SOP 일치 여부 체크
    if(!_.isEqual(SOP, this.SOP)){
      throw new Error(`Not Matching SOP\n expect: ${this.SOP}\t res: ${SOP}`);
    }
    // check Length
    // check Length (SOP, CODE, ADDRESS 제외)
    let lengtBodyBuf = responseBuf.slice(_.sum([
      this.HEADER_INFO.BYTE.SOP,
      this.HEADER_INFO.BYTE.CODE,
      this.HEADER_INFO.BYTE.ADDR,
      this.HEADER_INFO.BYTE.LENGTH,
    ]));
    if(lengtBodyBuf.toString().length !== decodingInfo.length){
      throw new Error(`length가 맞지 않습니다\n expect: ${decodingInfo.length}\t res: ${lengtBodyBuf.toString().length}`);
    }

    // check CheckSum (SOP, CODE, CHECKSUM 제외)
    let checksumBodyBuf =  responseBuf.slice(_.sum([
      this.HEADER_INFO.BYTE.SOP,
      this.HEADER_INFO.BYTE.CODE,
    ]), _.subtract(responseBuf.length, this.HEADER_INFO.BYTE.CHECKSUM));

    // 계산된 체크섬
    let strChecksum = this.returnBufferExceptDelimiter(checksumBodyBuf, ',').toString();

    let calcChecksum = 0;
    _.forEach(strChecksum, str => {
      let num =  _.toNumber(str);
      // 문자라면 A~Z --> 10~35로 변환
      num = isNaN(num) ?  _.head(Buffer.from(str)) - 55 : num;
      calcChecksum += num;
    });

    // 응답받은 체크섬 
    let checksumBuf = responseBuf.slice(_.subtract(responseBuf.length, this.HEADER_INFO.BYTE.CHECKSUM));
    let expectChecksum = this.convertBufToHexToNum(checksumBuf);

    // 체크섬이 다르다면 예외 처리
    if(calcChecksum !== expectChecksum){
      throw new Error(`checksum이 맞지 않습니다\n expect: ${expectChecksum}\t res: ${calcChecksum}`);
    }

    // 실제 장치 데이터를 담은 Buffer 생성
    let dataBodyBuf =  responseBuf.slice(_.sum([
      this.HEADER_INFO.BYTE.SOP,
      this.HEADER_INFO.BYTE.CODE,
      this.HEADER_INFO.BYTE.ADDR,
      this.HEADER_INFO.BYTE.LENGTH,
      this.HEADER_INFO.BYTE.ID
    ]), _.subtract(responseBuf.length, this.HEADER_INFO.BYTE.CHECKSUM));

    // 구분자 제거
    dataBodyBuf =  this.returnBufferExceptDelimiter(dataBodyBuf, ',');
    BU.CLI(dataBodyBuf);

    return dataBodyBuf;
  }






  /**
   * @param {string} cmd 명령 CODE
   */
  makeMsg(cmd){
    let bufId = this.makeMsg2Buffer(cmd);

    return Buffer.from(`^P${bufId.toString()}${cmd}`);
  }
}

module.exports = Model;