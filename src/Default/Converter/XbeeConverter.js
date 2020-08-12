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
      this.protocolInfo.deviceId = this.protocolConverter.convertNumToHxToBuf(deviceId);
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

    /** @type {Array.<commandInfo>} */
    cmdList.forEach(cmdInfo => {
      const { cmd } = cmdInfo;

      const bufHeader = Buffer.concat([
        // Start Delimiter
        Buffer.from('7E', 'hex'),
        // Length(2byte),
        Buffer.from('0010', 'hex'),
      ]);

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

      const checkSum = this.protocolConverter.getBufferCheckSum(bufBody, 1);

      cmdInfo.cmd = Buffer.concat([bufHeader, bufBody, checkSum]);

      return cmdInfo;
    });

    return cmdList;
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 응답받은 데이터
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    BU.CLIS(deviceData, currTransferCmd);
    // string 형식이 다를 수 있으므로 대문자로 모두 변환
    // Res Frame Type
    const REC_FRAME_TYPE_INDEX = 3;
    const REC_LAST_INDEX = deviceData.length - 1;

    const recFrameType = deviceData.readInt8(REC_FRAME_TYPE_INDEX);
    const recFrameSpecData = deviceData.slice(REC_FRAME_TYPE_INDEX, REC_LAST_INDEX);

    const resId = deviceData.slice(4, 8);

    // 지그비 64-bit Address 일치 확인
    if (!_.isEqual(resId, this.protocolInfo.deviceId)) {
      throw new Error(
        `Not Matching ReqAddr: ${this.protocolInfo.deviceId.toString()}, ResAddr: ${resId.toString()}`,
      );
    }

    // 체크섬 일치 확인
    const resCheckSum = deviceData.slice(REC_LAST_INDEX);

    const calcCheckSum = this.protocolConverter.getBufferCheckSum(recFrameSpecData, 1);

    if (!_.isEqual(calcCheckSum, resCheckSum)) {
      throw new Error(`Not Matching CheckSum Calc: ${calcCheckSum}, Res: ${resCheckSum}`);
    }

    let result;
    // 해당 프로토콜에서 생성된 명령인지 체크
    switch (recFrameType) {
      case 0x88:
        result = this.refineAtCmdResponse(deviceData);
        break;
      case 0x90:
        result = this.refineZigbeeReceivePacket(deviceData);
        break;
      default:
        throw new Error(`Not Matching Type ${recFrameType}`);
    }
    return result;
  }

  /**
   *
   * @param {xbeeApi_0x88} xbeeApi0x88
   */
  refineAtCmdResponse(xbeeApi0x88) {}

  /**
   *
   * @param {Buffer} zigbeeReceivePacket
   */
  refineZigbeeReceivePacket(zigbeeReceivePacket) {
    // 최소 Speccific Data 길이를 만족하는지 체크
    if (zigbeeReceivePacket.length < 16) {
      throw new Error(`Failure to meet minimum length: ${zigbeeReceivePacket.length}`);
    }

    const data = zigbeeReceivePacket.slice(15, zigbeeReceivePacket.length - 1);

    const STX = _.nth(data, 0);
    // STX 체크 (# 문자 동일 체크)
    if (_.isEqual(STX, 0x23)) {
      // let boardId = data.slice(1, 5);
      // BU.CLI(data.toString());
      let productType = data.slice(5, 9);
      const dataBody = data.slice(9);

      let decodingDataList;
      if (_.isBuffer(productType)) {
        productType = this.protocolConverter.convertBufToHexToNum(productType);

        switch (productType) {
          case 1:
            decodingDataList =
              dataBody.toString().length === 12
                ? this.decodingTable.gateLevelSalinity
                : this.decodingTable.newGateLevelSalinity;
            break;
          case 2:
            decodingDataList =
              dataBody.toString().length === 20
                ? this.decodingTable.valve
                : this.decodingTable.salternBlockValve;
            // BU.CLI(dataBody.toString().length, decodingDataList);
            // decodingDataList = this.decodingTable.valve;
            break;
          case 3:
            decodingDataList = this.decodingTable.pump;
            break;
          case 5:
            decodingDataList = this.decodingTable.earthModule;
            break;
          case 6:
            decodingDataList = this.decodingTable.connectorGroundRelay;
            break;
          case 12:
            decodingDataList = this.decodingTable.envModuleTemp;
            break;
          default:
            throw new Error(`productType: ${productType}은 Parsing 대상이 아닙니다.`);
        }
        // BU.CLI(decodingDataList);
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
        // if (productType === 6) {
        //   BU.CLI(dataBody);
        //   BU.CLI(resultAutomaticDecoding);
        // }
        return resultAutomaticDecoding;
      }
      throw new Error(`productType: ${productType}이 이상합니다.`);
    } else {
      throw new Error('STX가 일치하지 않습니다.');
    }
  }
};
