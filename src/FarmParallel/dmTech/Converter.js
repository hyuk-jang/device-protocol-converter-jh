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

    // SM Modbus 형식인지 여부, SM Converter라면 Req, Res CRC는 존재하지 않음
    this.isExistCrc = false;
  }

  /**
   * FnCode 04, Read Input Register. 순수 Spec Data 반환
   * @param {Buffer} resBuffer CRC 제거된 Read Input Register
   * @param {Buffer} reqBuffer 현재 요청한 명령
   */
  refineReadInputRegister(resBuffer, reqBuffer) {
    const { dataBody, registerAddr } = super.refineReadInputRegister(
      resBuffer,
      reqBuffer,
    );

    /** @type {decodingProtocolInfo} */
    let decodingTable;
    // NOTE: 모듈 후면 온도, 경사 일사량이 붙어 있는 로거
    const pvRearTempTableList = [1, 4];
    // NOTE: 모듈 하부 일사량이 붙어 있는 로거
    const inclinedSolarTableList = [3, 6];
    // NOTE: 모듈 하부 일사량이 붙어 있는 로거
    const pvUnderyingSolarTableList = [2, 5];
    // NOTE: 추가 일사량 4기 로거
    const fourSolarSiteList = [31, 32, 33, 34, 35, 36];
    // NOTE: 외기 환경 데이터 로거 번호
    const horizontalSiteList = [7, 9, 11, 12, 16];
    // 장치 addr
    const numDeviceId = this.protocolInfo.deviceId;

    if (_.includes(pvRearTempTableList, numDeviceId)) {
      decodingTable = this.decodingTable.PRT_SITE;
    } else if (_.includes(inclinedSolarTableList, numDeviceId)) {
      decodingTable = this.decodingTable.INCLINED_SITE;
    } else if (_.includes(horizontalSiteList, numDeviceId)) {
      decodingTable = this.decodingTable.HORIZONTAL_SITE;
    } else if (_.includes(fourSolarSiteList, numDeviceId)) {
      decodingTable = this.decodingTable.FOUR_SOLAR_SITE;
    } else {
      decodingTable = this.decodingTable.PUS_SITE;
    }

    // 요청 시작 주소를 가져옴 (실제 시작하는 주소 세팅)
    decodingTable.address = registerAddr;

    // FIXME: 실제 현장에서의 간헐적인 00000000000000 데이터 처리를 위함. 해당 데이터는 사용하지 않음
    if (_.every(dataBody, v => _.isEqual(v, Buffer.alloc(1, 0)))) {
      return BASE_MODEL;
    }

    /** @type {BASE_MODEL} */
    const returnValue = this.automaticDecodingIndex(decodingTable, dataBody);

    return returnValue;
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: 10,
    mainCategory: 'FarmParallel',
    subCategory: 'dmTech',
    protocolOptionInfo: {
      hasTrackingData: true,
    },
  });

  BU.CLI(converter.generationCommand());

  const testReqMsg = '025301040000000c03';
  const realTestReqMsg = Buffer.from(testReqMsg.slice(4, testReqMsg.length - 2), 'hex');

  const dataList = ['0253010418015c035002b601db01f201f002e40000000000000000000003'];

  dataList.forEach(d => {
    const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');

    const dataMap = converter.concreteParsingData(realBuffer, realTestReqMsg);
    console.log(dataMap);
  });
}
