const _ = require('lodash');
const { BU } = require('base-util-jh');

const AbstConverter = require('../AbstConverter');

module.exports = class extends AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   * @param {AbstBaseModel} Model
   */
  constructor(protocolInfo, Model) {
    super(protocolInfo);

    // 국번은 Buffer로 변환하여 저장함.
    const {
      deviceId,
      subCategory,
      option: {
        ni: { slotId },
      },
    } = this.protocolInfo;
    if (Buffer.isBuffer(deviceId)) {
      this.protocolInfo.deviceId = deviceId;
    } else if (_.isNumber(deviceId)) {
      this.protocolInfo.deviceId = this.protocolConverter.convertNumToWriteInt(deviceId);
    } else if (_.isString(deviceId)) {
      this.protocolInfo.deviceId = Buffer.from(deviceId, 'hex');
    }

    /** BaseModel */
    this.model = new Model(protocolInfo);

    this.cDaqSerial = this.protocolInfo.deviceId;
    this.cDaqSlotType = Buffer.from(subCategory);
    this.cDaqSlotSerial = Buffer.from(slotId, 'hex');

    this.modelTypeInfo = {
      voltageList: ['9201'],
      relay: ['9482'],
    };
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {Array.<commandInfo>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    /** @type {modbusReadFormat[]} */
    const cmdList = this.defaultGenCMD(generationInfo);

    // 요청 명령 형식: STX(#[1]) + cDaqSerial(B[4])  modelType(A[4]) + slotSerial(B[4])
    // + FnCode(A[1]) + CMD(A[2]) + checksum(B[1]) + EOT(B[1])

    // 장치 모델 타입에 따라 명령 분기

    const returnBufferList = cmdList.map(reqCmdInfo => {
      const { fnCode, cmd } = reqCmdInfo;

      // BU.CLI(cmd.toString());

      const header = Buffer.concat([
        Buffer.from('#'),
        this.cDaqSerial,
        this.cDaqSlotType,
        this.cDaqSlotSerial,
      ]);

      const body = Buffer.from(`${fnCode}${cmd}`);

      // checksum 제외한 요청 데이터 Packet
      let command = Buffer.concat([header, body]);

      const checksum = this.protocolConverter.getSumBuffer(command);
      command = Buffer.concat([command, checksum, this.protocolConverter.EOT]);

      return command;
    });

    return this.makeAutoGenerationCommand(returnBufferList);
  }

  genVoltageMeasureCmd() {}

  // Switch (Relay)
  genSwMeasureCmd() {}

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   * @param {nodeInfo[]} nodeList 장치로 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd, nodeList) {
    // BU.log(deviceData);
    // deviceData: #(A) + cDaqSerial(B[4]) + modelType(A) + slotSerial(B[4]) + dataBody(B) + checksum(B) + EOT(B)

    const stx = deviceData.slice(0, 1).toString();
    const cDaqSerial = deviceData.slice(1, 5);
    const cDaqSlotType = deviceData.slice(5, 9);
    const cDaqSlotSerial = deviceData.slice(9, 13);
    const dataBody = deviceData.slice(0, deviceData.length - 2);
    const realData = deviceData.slice(13, deviceData.length - 2);
    const checksum = deviceData.slice(deviceData.length - 2, deviceData.length - 1);
    const eot = deviceData.slice(deviceData.length - 1);

    // BU.CLIS(cDaqSerial, cDaqSlotType, cDaqSlotSerial, dataBody, realData, checksum);

    const expectedChecksum = this.protocolConverter.getSumBuffer(dataBody);
    // BU.CLI(expectedChecksum);

    // STX 일치 여부 확인
    if (stx !== '#') {
      throw new Error('STX가 일치하지 않습니다.');
    }

    // EOT 일치 여부 확인
    if (!eot.equals(this.protocolConverter.EOT)) {
      throw new Error('EOT가 일치하지 않습니다.');
    }

    // checksum 일치 여부 확인
    if (!checksum.equals(expectedChecksum)) {
      throw new Error(
        `checksum does not match. expect: ${expectedChecksum}, receive: ${checksum}`,
      );
    }

    // 본체 시리얼이 맞지 않을 경우
    if (!cDaqSerial.equals(this.cDaqSerial)) {
      throw new Error(
        `cDaqSerial does not match. expect: ${this.cDaqSerial.toString()}, receive: ${cDaqSerial.toString()}`,
      );
    }
    // 슬롯 모델타입이 맞지 않을 경우
    if (!cDaqSlotType.equals(this.cDaqSlotType)) {
      throw new Error(
        `modelType does not match. expect: ${this.modelType.toString()}, receive: ${cDaqSlotType.toString()}`,
      );
    }

    // 슬롯 시리얼이 맞지 않을 경우
    if (!cDaqSlotSerial.equals(this.cDaqSlotSerial)) {
      throw new Error(
        `slotSerial does not match. expect: ${this.slotSerial.toString()}, receive: ${cDaqSlotSerial.toString()}`,
      );
    }

    return realData;
  }
};
