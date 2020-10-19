const _ = require('lodash');
const { BU } = require('base-util-jh');

const Model = require('./Model');
const protocol = require('./protocol');

const AbstConverter = require('../../Default/AbstConverter');

const {
  di: {
    dcmConfigModel: { reqDeviceControlType },
  },
} = require('../../module');

class Converter extends AbstConverter {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super(protocolInfo);

    this.decodingTable = protocol.decodingProtocolTable(protocolInfo.deviceId);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;
    /** BaseModel */
    this.model = new Model(protocolInfo);

    /** @type {number[]} 릴레이 데이터 8채널 0, 1 저장됨 */
    this.currRelayDataList = [];
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {commandInfo[]} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    // 요청 명령 형식: Control(1[On], 2[Off]) + CH(1 ~ 8)

    const { value } = generationInfo;
    const { MEASURE } = reqDeviceControlType;

    // Measure는 없음
    if (value === MEASURE) {
      if (this.currRelayDataList.length) return [];

      return [
        // All Off
        {
          data: '00',
        },
      ];
    }
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
    if (deviceData.length !== 8) {
      throw new Error('길이가 맞지 않습니다.');
    }

    try {
      // 디코딩 테이블의 파싱 데이터 길이를 합산
      const resultAutomaticDecoding = this.automaticDecoding(
        this.decodingTable.decodingDataList,
        deviceData,
      );

      this.currRelayDataList = deviceData.toString().split('').map(Number);

      return resultAutomaticDecoding;
    } catch (error) {
      this.currRelayDataList = [];
      throw error;
    }
  }
}
module.exports = Converter;
