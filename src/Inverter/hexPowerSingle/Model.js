const _ = require('lodash');

const { BU } = require('base-util-jh');

const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super();
    this.dialing = this.protocolConverter.makeMsg2Buffer(_.get(protocolInfo, 'deviceId'));

    this.ACK = this.protocolConverter.ACK;
    this.ENQ = this.protocolConverter.ENQ;
    this.EOT = this.protocolConverter.EOT;

    this.device.OPERATION_INFO.COMMAND.STATUS = [this.makeMsg('0004')];
    this.device.PV.COMMAND.STATUS = [this.makeMsg('0020')];
    this.device.GRID.COMMAND.STATUS = [this.makeMsg('0050')];
    this.device.POWER.COMMAND.STATUS = [this.makeMsg('0060')];
    this.device.SYSTEM.COMMAND.STATUS = [this.makeMsg('01e0')];
    this.device.DEFAULT.COMMAND.STATUS = _.flatten(
      _.concat([
        this.device.OPERATION_INFO.COMMAND.STATUS,
        this.device.PV.COMMAND.STATUS,
        this.device.GRID.COMMAND.STATUS,
        this.device.POWER.COMMAND.STATUS,
        this.device.SYSTEM.COMMAND.STATUS,
      ]),
    );
  }

  /**
   *
   * @param {String} addrAscii
   */
  makeDataLen(addrAscii) {
    let dataLen;
    switch (addrAscii) {
      case '0004':
        dataLen = Buffer.from('04');
        break;
      case '0020':
        dataLen = Buffer.from('02');
        break;
      case '0050':
        dataLen = Buffer.from('07');
        break;
      case '0060':
        dataLen = Buffer.from('08');
        break;
      case '01e0':
        dataLen = Buffer.from('03');
        break;
      default:
        break;
    }
    return dataLen;
  }

  /**
   * @return {Buffer}
   * @param {String} addrAscii
   */
  makeMsg(addrAscii) {
    const cmd = Buffer.from('R');
    const addr = Buffer.from(addrAscii);
    const dataLen = this.makeDataLen(addrAscii);
    const dataBody = Buffer.concat([this.dialing, cmd, addr, dataLen]);
    const checkSum = this.protocolConverter.getBufferChecksum(dataBody, 4);

    return Buffer.concat([
      this.ENQ,
      this.dialing,
      cmd,
      addr,
      dataLen,
      checkSum,
      this.EOT,
    ]);
  }

  /**
   * @param {Buffer} responseBuf 인버터에서 수신받은 데이터
   * @param {decodingProtocolInfo} decodingInfo 인버터에서 수신받은 데이터
   * @return {Buffer} Data Buffer만 리턴
   */
  getValidateData(responseBuf, decodingInfo) {
    // BU.CLI(responseBuf.toString(), decodingInfo);
    const ACK = Buffer.from([_.nth(responseBuf, 0)]);

    if (!_.isEqual(ACK, this.ACK)) {
      throw new Error(`Not Matching ACK\n expect: ${this.SOP}\t res: ${ACK}`);
    }

    // 실제 장치 데이터를 담은 Buffer 생성
    let dataBodyBuf = responseBuf.slice(8, responseBuf.length - 5);

    // 구분자 제거
    dataBodyBuf = this.protocolConverter.returnBufferExceptDelimiter(dataBodyBuf, ',');
    // BU.CLI(dataBodyBuf);

    return dataBodyBuf;
  }

  static get CALC_KEY() {
    return {
      SolarFaultAddress: 'SolarFaultAddress',
      InverterOperationFaultAddress: 'InverterOperationFaultAddress',
      LineFaultAddress: 'LineFaultAddress',
      InverterProductYear: 'InverterProductYear',
      InvKwhAdress: 'InvKwhAdress',
    };
  }
}

module.exports = Model;

// 검증
if (require !== undefined && require.main === module) {
  const model = new Model({
    mainCategory: 'Inverter',
    subCategory: 'hexPowerSingle',
    deviceId: '01',
  });

  const cmdList = model.device.DEFAULT.COMMAND.STATUS;

  BU.CLI(cmdList);

  model.makeMsg('');
}
