const _ = require('lodash');
const { BU } = require('base-util-jh');

const Model = require('./Model');
const protocol = require('./protocol');

const AbstConverter = require('../../Default/AbstConverter');

class Converter extends AbstConverter {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super(protocolInfo);

    this.decodingTable = protocol.decodingProtocolTable(protocolInfo.deviceId);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;
    /** BaseModel */
    this.model = new Model(protocolInfo);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    deviceData = Buffer.isBuffer(deviceData) ? deviceData : Buffer.from(deviceData);
    // BU.CLI(deviceData);
    const STX = deviceData.slice(0, 1);
    const ETX = deviceData.slice(deviceData.length - 1, deviceData.length);
    const dataBody = deviceData.slice(1, deviceData.length - 1);

    if (!STX.equals(this.protocolConverter.STX)) {
      throw new Error('STX가 맞지 않습니다.');
    }

    if (!ETX.equals(this.protocolConverter.ETX)) {
      throw new Error('ETX가 맞지 않습니다.');
    }

    if (dataBody.length !== 5) {
      throw new Error(`데이터 길이가 맞지 않습니다.(Exp: 5, Rec:${dataBody.length}`);
    }

    // 디코딩 테이블의 파싱 데이터 길이를 합산
    const resultAutomaticDecoding = this.automaticDecoding(
      this.decodingTable.decodingDataList,
      dataBody,
    );

    return resultAutomaticDecoding;
  }
}
module.exports = Converter;
