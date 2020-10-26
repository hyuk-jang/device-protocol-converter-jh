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
    // BU.CLI(deviceData);
    if (deviceData.length !== 8) {
      throw new Error('길이가 맞지 않습니다.');
    }

    // 디코딩 테이블의 파싱 데이터 길이를 합산
    const resultAutomaticDecoding = this.automaticDecoding(
      this.decodingTable.decodingDataList,
      deviceData,
    );

    return resultAutomaticDecoding;
  }
}
module.exports = Converter;
