const _ = require('lodash');
const { BU } = require('base-util-jh');

const dpcRouter = require('./dpcRouter');
const { reqDeviceControlType } = require('../module').di.dcmConfigModel;

class MainConverter {
  /**
   * 프로토콜 컨버터를 사용하기 위한 옵션
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    // BU.CLI(protocol_info);
    this.protocol_info = protocolInfo;
    /** @type {MainConverter} */
    this.deviceCommandConverter = null;
    this.reqDeviceControlType = reqDeviceControlType;
  }

  /** protocolConverter 설정함 */
  setProtocolConverter() {
    const { Converter } = dpcRouter(this.protocol_info);
    this.deviceCommandConverter = new Converter(this.protocol_info);
    return true;
  }

  /** 해당 Converter DeepClone Base Model */
  get BaseModel() {
    return _.get(this, 'deviceCommandConverter.model.BASE_MODEL', {});
  }

  /** 해당 Converter DeepClone Base Model */
  get BaseKey() {
    return _.get(this, 'deviceCommandConverter.model.BASE_KEY', {});
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {commandInfo[]} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    const { value = this.reqDeviceControlType.MEASURE } = generationInfo;
    if (!this.deviceCommandConverter) {
      throw new Error('protocolConverter가 설정되지 않았습니다.');
    }

    // singleControlType가 문자 일 경우 숫자로 변환
    BU.isNumberic(value) && _.set(generationInfo, 'value', Number(value));

    return this.deviceCommandConverter.generationCommand(generationInfo);
  }

  /**
   * 해당 Category에 존재하는 Model Command를 직접 호출하였을 경우 사용
   * @param {Buffer[]} commandBuffer
   */
  designationCommand(commandBuffer) {
    return this.deviceCommandConverter.designationCommand(commandBuffer);
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @param {nodeInfo[]} nodeList 데이터 로거가 보유한 nodeList
   * @return {parsingResultFormat}
   */
  parsingUpdateData(dcData, nodeList) {
    if (!this.deviceCommandConverter) {
      throw new Error('protocolConverter가 설정되지 않았습니다.');
    }

    return this.deviceCommandConverter.parsingUpdateData(dcData, nodeList);
  }

  /**
   * TrackingDataBuffer를 강제로 초기화 시키고자 할 경우
   * @return {void}
   */
  resetTrackingDataBuffer() {
    this.deviceCommandConverter.resetTrackingDataBuffer();
  }
}
module.exports = MainConverter;
