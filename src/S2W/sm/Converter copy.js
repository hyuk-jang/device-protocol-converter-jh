const _ = require('lodash');
const { BU } = require('base-util-jh');

const Model = require('./Model');
const protocol = require('./protocol');

const AbstConverter = require('../../Default/AbstConverter');
const XbeeConverter = require('../../Default/Converter/XbeeConverter');
const { protocolConverter } = require('../../Default/DefaultModel');

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
  // const deviceId = '0013A2004190ED67';
  const deviceId = '0013A2004190EDB7';
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
    value: 2,
    nodeInfo: {
      data_logger_index: 4,
    },
  });

  console.log(cmdInfo);

  const dataList = [
    `
    #0001
    0012
    10.2
    M
    01001000
    11111111
    `,
  ].map(specData => {
    const realSpecData = protocolConverter.convertToHex(
      BU.replaceAll(specData, '\n', '').replace(/ /g, ''),
    );

    return `
    7e
    00${_.padStart((realSpecData.length / 2 + 12).toString(16), 2, '0')}

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
      converter.protocolConverter.getDigiChecksum(buffer.slice(3)),
    ]);

    // BU.CLI(realBuffer);
    const dataMap = converter.concreteParsingData(realBuffer);
    // console.log(dataMap);
  });

  const testReqMsg = '02497e001210010013a2004190ed67fffe0000407374737d03';
  const realTestReqMsg = Buffer.from(testReqMsg.slice(4, testReqMsg.length - 2), 'hex');

  const onDataList = [
    '024923303030313030313231322e304d3131313131313131313131313131313103',
    // '02537e002a900013a2004190ed67fffe0123303030313030313231302e324131313131303131313131303131303031e203',
  ];

  onDataList.forEach(d => {
    const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');
    // BU.CLI(realBuffer);

    converter.protocolInfo.deviceId = Buffer.from('0013a2004190ed67', 'hex');
    const dataMap = converter.concreteParsingData(realBuffer, realTestReqMsg);
    console.log(dataMap);
  });
}
