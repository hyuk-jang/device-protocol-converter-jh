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
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {commandInfo[]} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    // 요청 명령 형식: Control(1[On], 2[Off]) + CH(1 ~ 8)
    const cmdList = this.defaultGenCMD(generationInfo);

    return this.makeAutoGenerationCommand(cmdList);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
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
