const _ = require('lodash');
const { BU } = require('base-util-jh');

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
    const path = `../${this.protocol_info.mainCategory}/${this.protocol_info.subCategory}/Converter`;
    // BU.CLI(path);
    try {
      const DeviceProtocolConverter = require(path);
      // BU.CLIN(DeviceProtocolConverter, 4);
      this.deviceCommandConverter = new DeviceProtocolConverter(this.protocol_info);
      return true;
    } catch (error) {
      throw error;
    }
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
    // BU.CLI(generationInfo);
    const { value = this.reqDeviceControlType.MEASURE } = generationInfo;
    if (!this.deviceCommandConverter) {
      throw new Error('protocolConverter가 설정되지 않았습니다.');
    }
    try {
      // singleControlType가 문자 일 경우 숫자로 변환
      BU.isNumberic(value) && _.set(generationInfo, 'value', Number(value));
      // BU.CLI(generationInfo);

      return this.deviceCommandConverter.generationCommand(generationInfo);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 해당 Category에 존재하는 Model Command를 직접 호출하였을 경우 사용
   * @param {Buffer[]} commandBuffer
   */
  designationCommand(commandBuffer) {
    try {
      return this.deviceCommandConverter.designationCommand(commandBuffer);
    } catch (error) {
      throw error;
    }
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  parsingUpdateData(dcData) {
    // BU.CLIS(requestData, responseData);
    if (!this.deviceCommandConverter) {
      throw new Error('protocolConverter가 설정되지 않았습니다.');
    }

    try {
      return this.deviceCommandConverter.parsingUpdateData(dcData);
    } catch (error) {
      throw error;
    }
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
