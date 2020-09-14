const _ = require('lodash');

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
    this.device.ENV.COMMAND.STATUS = [this.makeMsg('0070')];
    this.device.DEFAULT.COMMAND.STATUS = _.flatten(
      _.concat([
        this.device.OPERATION_INFO.COMMAND.STATUS,
        this.device.PV.COMMAND.STATUS,
        this.device.GRID.COMMAND.STATUS,
        this.device.POWER.COMMAND.STATUS,
        // this.device.ENV.COMMAND.STATUS,
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
      case '0070':
        dataLen = Buffer.from('04');
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

  static get CALC_KEY() {
    return {
      SolarFault: 'SolarFault',
      InverterFault: 'InverterFault',
      InverterState: 'InverterState',
      InverterOperationFault: 'InverterOperationFault',
      InverterProductYear: 'InverterProductYear',
      InvKwhAdress: 'InvKwhAdress',
      EnvSolar: 'EnvSolar',
      EnvTemperature: 'EnvTemperature',
    };
  }
}

module.exports = Model;

// 검증
// if (require !== undefined && require.main === module) {
//   const model = new Model({
//     mainCategory: 'Inverter',
//     subCategory: 'hexPowerTriple',
//     deviceId: '01',
//   });

//   const cmdList = model.device.DEFAULT.COMMAND.STATUS;

//   BU.CLI(cmdList);

//   model.makeMsg('');
// }
