const _ = require('lodash');
const { BU } = require('base-util-jh');
const ModbusRtuConverter = require('../../Default/Converter/ModbusRtuConverter');
const protocol = require('./protocol');

const Model = require('./Model');
const { BASE_MODEL } = require('./Model');

class Converter extends ModbusRtuConverter {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    // 현 Converter에서 사용하는 protocol과 Model을 자동으로 정의할 수 있도록 생성자 요청
    super(protocolInfo, Model);

    this.decodingTable = protocol.decodingProtocolTable(protocolInfo);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;
  }

  /**
   * FnCode 01, Read Coil. 순수 Spec Data 반환
   * @param {Buffer} resBuffer CRC 제거된 Read Coil
   * @param {Buffer} reqBuffer 현재 요청한 명령
   */
  refineReadCoil(resBuffer, reqBuffer) {
    const { dataBody, registerAddr } = super.refineReadCoil(resBuffer, reqBuffer);

    /** @type {decodingProtocolInfo} */
    let decodingTable;

    // 장치 addr
    if (registerAddr === 70) {
      decodingTable = this.decodingTable.OPERATION;
    } else if (registerAddr === 116) {
      decodingTable = this.decodingTable.MODE;
    }

    /** @type {BASE_MODEL} */
    const returnValue = this.automaticDecodingIndex(decodingTable, dataBody);

    return returnValue;
  }

  /**
   * FnCode 03, Read Holding Register. 순수 Spec Data 반환
   * @param {Buffer} resBuffer CRC 제거된 Read Input Register
   * @param {Buffer} reqBuffer 현재 요청한 명령
   */
  refineReadHoldingRegister(resBuffer, reqBuffer) {
    const { dataBody, registerAddr } = super.refineReadHoldingRegister(
      resBuffer,
      reqBuffer,
    );

    /** @type {decodingProtocolInfo} */
    let decodingTable;

    // 장치 addr
    if (registerAddr === 10) {
      decodingTable = this.decodingTable.BASE;
    } else if (registerAddr === 100) {
      decodingTable = this.decodingTable.FLOW;
    } else if (registerAddr === 500) {
      decodingTable = this.decodingTable.SOLAR;
    } else if (registerAddr === 600) {
      decodingTable = this.decodingTable.ADD_SG_FLOW;
    } else if (registerAddr === 2330) {
      decodingTable = this.decodingTable.OPER_MODE;
    }

    /** @type {BASE_MODEL} */
    const returnValue = this.automaticDecodingIndex(decodingTable, dataBody);

    return returnValue;
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: 42,
    mainCategory: 'S2W',
    subCategory: 'dmTech',
    protocolOptionInfo: {
      hasTrackingData: true,
    },
  });

  BU.CLI(converter.generationCommand());

  const testReqMsg = '025329040000000c03';
  const realTestReqMsg = Buffer.from(testReqMsg.slice(4, testReqMsg.length - 2), 'hex');

  const dataList = ['02532904180000002c028d014f08a30000029401f3000000000000000003'];

  dataList.forEach(d => {
    const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');

    const dataMap = converter.concreteParsingData(realBuffer, realTestReqMsg);
    console.log(dataMap);
  });
}
