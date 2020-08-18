const _ = require('lodash');
const { BU } = require('base-util-jh');

const XbeeConverter = require('../../Default/Converter/XbeeConverter');
const Model = require('./Model');
const protocol = require('./protocol');
const { protocolConverter } = require('../../Default/DefaultModel');

class Converter extends XbeeConverter {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super(protocolInfo);

    this.decodingTable = protocol.decodingProtocolTable(protocolInfo.deviceId);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;
    /** BaseModel */
    this.model = new Model(protocolInfo);
  }

  /**
   * Zigbee Receive Packet
   * @param {Buffer} zigbeeReceivePacket Zigbee Receive Packet 프로토콜에 맞는 데이터
   */
  refineZigbeeReceivePacket(zigbeeReceivePacket) {
    const specData = super.refineZigbeeReceivePacket(zigbeeReceivePacket);

    // STX 체크 (# 문자 동일 체크)
    const STX = _.nth(specData, 0);
    if (STX !== 0x23) {
      throw new Error('STX가 일치하지 않습니다.');
    }

    const productType = specData.slice(5, 9).toString();
    const dataBody = specData.slice(9);

    let decodingDataList;
    switch (productType) {
      case '0011':
        decodingDataList = this.decodingTable.pump;
        break;
      case '0012':
        decodingDataList = this.decodingTable.shutter;
        break;
      default:
        throw new Error(`productType: ${productType}은 Parsing 대상이 아닙니다.`);
    }

    // 디코딩 테이블의 파싱 데이터 길이를 합산
    const resultAutomaticDecoding = this.automaticDecoding(
      decodingDataList.decodingDataList,
      dataBody,
    );

    return resultAutomaticDecoding;
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const deviceId = '0013A2004190EC54';
  const converter = new Converter({
    // deviceId: '0013A20012345678',
    deviceId,
    mainCategory: 'S2W',
    subCategory: 'sm',
    protocolOptionInfo: {
      hasTrackingData: true,
    },
  });

  const cmdInfo = converter.generationCommand({
    key: 'shutter',
    value: 0,
    nodeInfo: {
      data_logger_index: 4,
    },
  });

  BU.CLI(cmdInfo);

  const dataList = [
    `
    #0001
    0012
    00.0
    M
    01000000
    11111111
    `,
  ].map(specData => {
    const realSpecData = protocolConverter.convertToHex(
      BU.replaceAll(specData, '\n', '').replace(/ /g, ''),
    );

    BU.CLI(realSpecData.length, realSpecData);

    return `
    7e
    00${_.padStart((realSpecData.length / 2).toString(16), 2, '0')}

    90

    ${deviceId}

    FFFE

    01
    ${realSpecData}
    `;
  });

  dataList.forEach(d => {
    const buffer = Buffer.from(BU.replaceAll(d, '\n', '').replace(/ /g, ''), 'hex');
    const realBuffer = Buffer.concat([
      buffer,
      converter.protocolConverter.getDigiChecksum(buffer.slice(4)),
    ]);

    BU.CLI(realBuffer);
    // const result = converter.testParsingData(realBuffer);
    // BU.CLI(result);
    const dataMap = converter.concreteParsingData(realBuffer);
    // const dataMap = converter.refineZigbeeReceivePacket(d);
    BU.CLI(dataMap);
  });

  // converter.testParsingData(Buffer.from(dataList, 'ascii'));
}
