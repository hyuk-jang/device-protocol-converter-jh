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
   *
   * @param {Buffer} zigbeeReceivePacket
   */
  refineZigbeeReceivePacket(zigbeeReceivePacket) {
    // 최소 Speccific Data 길이를 만족하는지 체크
    if (zigbeeReceivePacket.length < 16) {
      throw new Error(`Failure to meet minimum length: ${zigbeeReceivePacket.length}`);
    }

    const specData = zigbeeReceivePacket.slice(15, zigbeeReceivePacket.length - 1);

    const STX = _.nth(specData, 0);
    // STX 체크 (# 문자 동일 체크)
    if (_.isEqual(STX, 0x23)) {
      let productType = specData.slice(5, 9);
      const dataBody = specData.slice(9);

      let decodingDataList;
      if (_.isBuffer(productType)) {
        productType = this.protocolConverter.convertBufToStrToNum(productType);

        switch (productType) {
          case 11:
            decodingDataList = this.decodingTable.pump;
            break;
          case 12:
            decodingDataList = this.decodingTable.shutter;
            break;
          default:
            throw new Error(`productType: ${productType}은 Parsing 대상이 아닙니다.`);
        }

        const hasValid = _.chain(decodingDataList.decodingDataList)
          .map(row => _.get(row, 'byte', 1))
          .sum()
          .isEqual(dataBody.length)
          .value();
        if (!hasValid) {
          throw new Error(
            `The expected length(${decodingDataList.bodyLength}) 
              of the data body is different from the length(${dataBody.length}) received.`,
          );
        }

        const resultAutomaticDecoding = this.automaticDecoding(
          decodingDataList.decodingDataList,
          dataBody,
        );

        return resultAutomaticDecoding;
      }
      throw new Error(`productType: ${productType}이 이상합니다.`);
    } else {
      throw new Error('STX가 일치하지 않습니다.');
    }
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    // deviceId: '0013A20012345678',
    deviceId: '0013A2004190EC54',
    mainCategory: 'S2W',
    subCategory: 'sm',
    protocolOptionInfo: {
      hasTrackingData: true,
    },
  });

  const cmdInfo = converter.generationCommand({
    key: 'shutter',
    // value: 1,
  });

  BU.CLI(cmdInfo);

  // BU.CLIN(converter.model);

  const testReqMsg = '025301040000000c03';

  const addr = Buffer.from('0013A2004190EC54');

  BU.CLI(protocolConverter.convertToHex(addr));

  const dataList = [
    `
      0249
      
      7e
      0011

      90

      ${protocolConverter.convertToHex('0013A2004190EC70')}

      FFFE

      01
      ${protocolConverter.convertToHex('#00010005010000000000000009.7')}
      
      03
      `,
  ];

  BU.CLI(protocolConverter.convertToHex('#00010005010000000000000009.7'));

  dataList.forEach(d => {
    const realBuffer = Buffer.from(
      BU.replaceAll(d, '\n', '').replace(/ /g, '').slice(4, d.length),
      'hex',
    );
    BU.CLI(realBuffer.toString());
    // const result = converter.testParsingData(realBuffer);
    // BU.CLI(result);
    const dataMap = converter.concreteParsingData(realBuffer);
    // const dataMap = converter.refineZigbeeReceivePacket(d);
    BU.CLI(dataMap);
  });

  // converter.testParsingData(Buffer.from(dataList, 'ascii'));
}
