const _ = require('lodash');
const { BU } = require('base-util-jh');

const AbstConverter = require('../AbstConverter');

module.exports = class extends AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super(protocolInfo);

    // 국번은 Buffer로 변환하여 저장함.
    const { deviceId } = this.protocolInfo;
    if (Buffer.isBuffer(deviceId)) {
      this.protocolInfo.deviceId = deviceId;
    } else if (_.isNumber(deviceId)) {
      this.protocolInfo.deviceId = this.protocolConverter.convertNumToWriteInt(deviceId);
    } else if (_.isString(deviceId)) {
      this.protocolInfo.deviceId = Buffer.from(deviceId, 'hex');
    }
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {Array.<commandInfo>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    /** @type {Array.<commandInfoModel>} */
    const cmdList = this.defaultGenCMD(generationInfo);

    const returnBufferList = cmdList.map(cmdInfo => {
      const { cmd } = cmdInfo;

      const bufBody = Buffer.concat([
        // Frame Type
        Buffer.from('10', 'hex'),
        // Frame ID
        Buffer.from('01', 'hex'),
        // 64-bit Destination Address
        this.protocolInfo.deviceId,
        // 16-bit Destination Network Address(2byte),
        Buffer.from('FFFE', 'hex'),
        // Broadcast Radius
        Buffer.from('00', 'hex'),
        // Options
        Buffer.from('00', 'hex'),
        // RF Data
        Buffer.from(cmd),
      ]);

      const frameLength = Buffer.alloc(2, 0);
      frameLength.writeUInt16BE(bufBody.length);

      const bufHeader = Buffer.concat([
        // Start Delimiter
        Buffer.from('7E', 'hex'),
        // Length(2byte),
        frameLength,
      ]);

      const checkSum = this.protocolConverter.getDigiChecksum(bufBody);

      return Buffer.concat([bufHeader, bufBody, checkSum]);
    });

    return this.makeAutoGenerationCommand(returnBufferList);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {Array.<commandInfo>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCmdAT(generationInfo) {
    /** @type {Array.<commandInfoModel>} */
    const cmdList = this.defaultGenCMD(generationInfo);

    const returnBufferList = cmdList.map(cmdInfo => {
      const { cmd } = cmdInfo;

      const bufBody = Buffer.concat([
        // Frame Type
        Buffer.from('10', 'hex'),
        // Frame ID
        Buffer.from('01', 'hex'),
        // 64-bit Destination Address
        this.protocolInfo.deviceId,
        // 16-bit Destination Network Address(2byte),
        Buffer.from('FFFE', 'hex'),
        // Broadcast Radius
        Buffer.from('00', 'hex'),
        // Options
        Buffer.from('00', 'hex'),
        // RF Data
        Buffer.from(cmd),
      ]);

      const frameLength = Buffer.alloc(2, 0);
      frameLength.writeUInt16BE(bufBody.length);

      const bufHeader = Buffer.concat([
        // Start Delimiter
        Buffer.from('7E', 'hex'),
        // Length(2byte),
        frameLength,
      ]);

      const checkSum = this.protocolConverter.getDigiChecksum(bufBody);

      return Buffer.concat([bufHeader, bufBody, checkSum]);
    });

    return this.makeAutoGenerationCommand(returnBufferList);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 응답받은 데이터
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    // string 형식이 다를 수 있으므로 대문자로 모두 변환
    // Res Frame Type
    const RES_FRAME_TYPE_INDEX = 3;
    const RES_64BIT_ADDR = 4;
    const RES_LAST_INDEX = deviceData.length - 1;

    const resFrameType = deviceData.readUInt8(RES_FRAME_TYPE_INDEX);
    const resFrameSpecData = deviceData.slice(RES_FRAME_TYPE_INDEX, RES_LAST_INDEX);

    const resId = deviceData.slice(4, 12);

    // 지그비 64-bit Address 일치 확인
    if (!_.isEqual(resId, this.protocolInfo.deviceId)) {
      throw new Error(
        `Not Matching ReqAddr: ${this.protocolInfo.deviceId.toString()}, ResAddr: ${resId.toString()}`,
      );
    }

    // 체크섬 일치 확인
    const resCheckSum = deviceData.slice(RES_LAST_INDEX);

    const calcCheckSum = this.protocolConverter.getDigiChecksum(resFrameSpecData);

    if (!_.isEqual(calcCheckSum, resCheckSum)) {
      throw new Error(`Not Matching CheckSum Calc: ${calcCheckSum}, Res: ${resCheckSum}`);
    }

    let result;
    // 해당 프로토콜에서 생성된 명령인지 체크
    switch (resFrameType) {
      case 0x88:
        result = this.refineAtCmdResponse(deviceData);
        break;
      case 0x90:
        result = this.refineZigbeeReceivePacket(deviceData);
        break;
      default:
        throw new Error(`Not Matching Type ${resFrameType}`);
    }
    return result;
  }

  /**
   *
   * @param {xbeeApi_0x88} xbeeApi0x88
   */
  refineAtCmdResponse(xbeeApi0x88) {}

  /**
   * Zigbee Receive Packet
   * @param {Buffer} zigbeeReceivePacket Zigbee Receive Packet 프로토콜에 맞는 데이터
   */
  refineZigbeeReceivePacket(zigbeeReceivePacket) {
    // BU.CLI(zigbeeReceivePacket);
    const LENGTH_IDX = 1;
    const FRAME_TYPE_IDX = 3;
    const SPEC_DATA_IDX = 15;
    const CRC_IDX = zigbeeReceivePacket.length - 1;

    // 최소 Speccific Data 길이를 만족하는지 체크
    if (zigbeeReceivePacket.length < SPEC_DATA_IDX) {
      throw new Error(`Failure to meet minimum length: ${zigbeeReceivePacket.length}`);
    }

    // BU.CLI(zigbeeReceivePacket);

    // 프로토콜에 명시된 Length
    const recBodyLength = zigbeeReceivePacket.readUInt16BE(LENGTH_IDX);
    // 실제 데이터 길이
    const recRealBodyLength = zigbeeReceivePacket.slice(FRAME_TYPE_IDX, CRC_IDX).length;
    // 수신받은 데이터 길이와 실제 데이터 길이가 같은지 체크
    if (recBodyLength !== recRealBodyLength) {
      throw new Error(
        `expected data length(${recBodyLength}). but receive data length(${recRealBodyLength})`,
      );
    }
    // 실제 수신받은 데이터의 길이
    const specData = zigbeeReceivePacket.slice(SPEC_DATA_IDX, CRC_IDX);

    return specData;
  }
};
