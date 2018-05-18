
const _ = require('lodash');

const BaseModel = require('../baseModel');

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




    this.SYSTEM.COMMAND.STATUS = [
      this.makeMsg('MOD')
    ];

    this.PV.COMMAND.STATUS = [
      this.makeMsg('ST1'),
    ];

    this.GRID.COMMAND.STATUS = [
      this.makeMsg('ST2'),
      this.makeMsg('ST3')
    ];
    
    this.POWER.COMMAND.STATUS = [
      this.makeMsg('ST4'),
    ];

    this.OPERATION_INFO.COMMAND.STATUS = [
      this.makeMsg('ST6'),
    ];

    this.DEFAULT.COMMAND.STATUS = _.concat([
      this.SYSTEM.COMMAND.STATUS,
      this.PV.COMMAND.STATUS,
      this.GRID.COMMAND.STATUS,
      this.POWER.COMMAND.STATUS,
      this.OPERATION_INFO.COMMAND.STATUS
    ]);
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
    let SOP = _.nth(responseBuf, 0);
    if(SOP !== this.SOP){
      throw new Error(`Not Matching SOP\n expect: ${this.SOP}\t res: ${SOP}`);
    }
    // check Length
    // check Length (SOP, CODE, ADDRESS 제외)
    let lengtBodyBuf =  responseBuf.slice(_.sum([
      this.HEADER_INFO.BYTE.SOP,
      this.HEADER_INFO.BYTE.CODE,
      this.HEADER_INFO.BYTE.ADDR,
    ]));
    if(lengtBodyBuf.toString().length !== decodingInfo.length){
      throw new Error(`length가 맞지 않습니다\n expect: ${decodingInfo.length}\t res: ${lengtBodyBuf.toString().length}`);
    }

    // check CheckSum (SOP, CODE, CHECKSUM 제외)
    let checksumBodyBuf =  responseBuf.slice(_.sum([
      this.HEADER_INFO.BYTE.SOP,
      this.HEADER_INFO.BYTE.CODE,
    ]), _.subtract(responseBuf.length, this.HEADER_INFO.BYTE.CHECKSUM));
    let checksumBuf = responseBuf.slice(_.subtract(responseBuf.length, this.HEADER_INFO.BYTE.CHECKSUM - 1));
    let expectChecksum = _.toNumber(_.toString(checksumBuf));
    let calcChecksum = 0;
    checksumBodyBuf.forEach(buf => {
      // 구분자 ','  가 아니라면 합산
      if(!_.isEqual(buf, this.DELIMETER)){
        calcChecksum += _.toNumber(buf.toString()); 
      }
    });
    if(calcChecksum !== expectChecksum){
      throw new Error(`checksum이 맞지 않습니다\n expect: ${expectChecksum}\t res: ${calcChecksum}`);
    }

    let dataBodyBuf = responseBuf.slice();

    return lengtBodyBuf;
  }






  /**
   * @param {string} cmd 명령 CODE
   */
  makeMsg(cmd){
    let bufId = this.makeMsg2Buffer(this.dialing);

    return Buffer.from(`^P${bufId.toString()}${cmd}`);
  }
}

module.exports = Model;


// if __main process
if (require !== undefined && require.main === module) {
  const BaseModel = require('../baseModel');
  const model = new BaseModel({deviceId:Buffer.from([0x01, 0x02, 0x03]), subCategory: 'das_1.3'});

  console.log(model.PV.COMMAND.STATUS); 
  console.log(model.GRID.COMMAND.STATUS); 
  console.log(model.POWER.COMMAND.STATUS); 
  
  console.log(model.SYSTEM.COMMAND.STATUS); 
  console.log(model.OPERATION_INFO.COMMAND.STATUS); 
  console.log(model.DEFAULT.COMMAND.STATUS); 

}