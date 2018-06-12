'use strict';

const BU = require('base-util-jh').baseUtil;

require('../format/defaultDefine');

class AbstConverter {
  /**
   * 프로토콜 컨버터를 사용하기 위한 옵션
   * @param {protocol_info} config 
   */
  constructor(config) {
    this.config = config;
    /** @type {AbstConverter} */
    // BU.CLI(this.config);
    this.protocolConverter = null;

  }

  /** protocolConverter 설정함 */
  setProtocolConverter(){
    const path = `../${this.config.mainCategory}/${this.config.subCategory}/Converter`;
    // BU.CLI(path);
    try {
      const DeviceProtocolConverter = require(path);
      // BU.CLIN(DeviceProtocolConverter, 4);
      this.protocolConverter = new DeviceProtocolConverter(this.config);
      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성. 
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {*=} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {Array} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo){
    // BU.CLI(generationInfo);
    if(!this.protocolConverter){
      throw new Error('protocolConverter가 설정되지 않았습니다.');
    }
    try {
      return this.protocolConverter.generationCommand(generationInfo);
    } catch (error) {
      throw error;      
    }
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  parsingUpdateData(dcData){
    // BU.CLIS(requestData, responseData);
    if(!this.protocolConverter){
      throw new Error('protocolConverter가 설정되지 않았습니다.');
    }

    try {
      return this.protocolConverter.parsingUpdateData(dcData);
    } catch (error) {
      throw error;      
    }
  }

  /**
   * TrackingDataBuffer를 강제로 초기화 시키고자 할 경우
   * @return {void}
   */
  resetTrackingDataBuffer() {
    this.protocolConverter.resetTrackingDataBuffer();
  }

}
module.exports = AbstConverter;