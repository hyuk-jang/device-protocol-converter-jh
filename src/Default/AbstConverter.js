const {BU} = require('base-util-jh');
const _ = require('lodash');

const ProtocolConverter = require('./ProtocolConverter');
const AbstBaseModel = require('./AbstBaseModel');
const defaultWrapper = require('./defaultWrapper');

// const {definedCommanderResponse} =  require('default-intelligence').dccFlagModel;
const {definedCommanderResponse} = require('../../../../module/default-intelligence').dccFlagModel;

class AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    this.protocolInfo = protocolInfo;

    this.protocolConverter = new ProtocolConverter();

    this.protocolOptionInfo = _.get(protocolInfo, 'protocolOptionInfo');

    // 수신 받은 데이터 버퍼
    this.trackingDataBuffer = Buffer.from('');

    this.definedCommanderResponse = definedCommanderResponse;

    this.model = new AbstBaseModel(protocolInfo);
    // 자식 Converter에서 구현
    this.onDeviceOperationStatus = null;
  }

  /**
   * protocolInfo.wrapperCategory 에 따라 데이터를 frame으로 감싼 후 반환
   * @param {*} data Cover를 씌울 원 데이터
   */
  coverFrame(data) {
    return defaultWrapper.wrapFrameMsg(this.protocolInfo, data);
  }

  /**
   * 수신받은 dcData에서 frame을 걷어내고, dcData에서 전송 명령 또한 frame을 걷어냄
   * @param {dcData} dcData
   */
  peelFrame(dcData) {
    defaultWrapper.decodingDcData(this.protocolInfo, dcData);
  }

  /**
   * 명령을 보낼 배열을 생성
   * @param {Array.<*>} cmdDataList 실제 수행할 명령
   * @param {number=} commandExecutionTimeoutMs 해당 명령을 수행하기전 대기 시간(ms)
   * @param {number=} delayExecutionTimeoutMs 해당 명령을 수행할때까지의 timeout 유예시간(ms)
   * @return {Array.<commandInfo>}
   */
  makeDefaultCommandInfo(cmdDataList, commandExecutionTimeoutMs, delayExecutionTimeoutMs) {
    /** @type {Array.<commandInfo>} */
    const returnValue = [];

    cmdDataList = Array.isArray(cmdDataList) ? cmdDataList : [cmdDataList];

    cmdDataList.forEach(bufData => {
      /** @type {commandInfo} */
      const commandObj = {
        data: this.coverFrame(bufData),
        commandExecutionTimeoutMs: _.isNumber(commandExecutionTimeoutMs)
          ? commandExecutionTimeoutMs
          : 1000,
      };
      if (_.isNumber(delayExecutionTimeoutMs)) {
        commandObj.delayExecutionTimeoutMs = delayExecutionTimeoutMs;
      }

      returnValue.push(commandObj);
    });

    return returnValue;
  }

  /**
   * TrackingDataBuffer를 강제로 초기화 시키고자 할 경우
   * @return {void}
   */
  resetTrackingDataBuffer() {
    this.trackingDataBuffer = Buffer.from('');
  }

  /**
   * dcData에서 현재 요청한 명령을 가져옴
   * @param {dcData} dcData
   */
  getCurrTransferCmd(dcData) {
    return _.get(
      _.nth(_.get(dcData, 'commandSet.cmdList'), _.get(dcData, 'commandSet.currCmdIndex')),
      'data',
    );
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  parsingUpdateData(dcData) {
    // BU.CLI(dcData);
    const returnValue = {};
    try {
      // 수신 데이터 추적을 하는 경우라면 dcData의 Data와 합산
      if (_.get(this, 'protocolOptionInfo.hasTrackingData') === true) {
        this.trackingDataBuffer = Buffer.concat([this.trackingDataBuffer, dcData.data]);
        dcData.data = this.trackingDataBuffer;

        // BU.CLI(dcData.data.toString());
      }

      // protocolInfo.wrapperCategory 여부에 따라 dcData.data 및 dcData.commandSet 수정
      this.peelFrame(dcData);
      // BU.CLI(dcData)

      // BU.CLI('@@@@@@@@@@');
      try {
        returnValue.data = this.concreteParsingData(dcData);
      } catch (error) {
        throw error;
      }
      // BU.CLI('@@@@@@@@@@');
      returnValue.eventCode = this.definedCommanderResponse.DONE;

      // DONE 처리가 될 경우 Buffer 비움
      this.resetTrackingDataBuffer();

      return returnValue;
    } catch (error) {
      returnValue.eventCode = this.definedCommanderResponse.ERROR;
      returnValue.data = error;
      return returnValue;
    }
  }

  /**
   * 실제 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {*}
   */

  concreteParsingData(dcData) {}

  /**
   * decodingInfo 리스트 만큼 Data 파싱을 진행
   * @param {Array.<decodingInfo>} decodingTable
   * @param {Buffer} receiveData
   * @example
   * addr: 3, length 5 --> 수신받은 데이터 [x, x, x, x, x] 5개
   * decodingTable.decodingDataList --> 3번 index ~ 7번 인덱스(addr + length - 1) 반복 체크
   * currIndex는 반복에 의해 1씩 증가 --> 해당 currIndex로 수신받은 데이터 index 추출
   */
  automaticDecoding(decodingTable, receiveData) {
    try {
      // BU.CLI(data);
      // 데이터를 집어넣을 기본 자료형을 가져옴
      const returnModelInfo = AbstBaseModel.GET_BASE_MODEL(this.protocolInfo);
      // 수신받은 데이터에서 현재 체크 중인 값을 가져올 인덱스
      let currIndex = 0;
      decodingTable.forEach(decodingInfo => {
        // 조회할 데이터를 가져옴
        const thisData = receiveData.slice(currIndex, currIndex + decodingInfo.byte);
        this.automaticParsingData(decodingInfo, thisData, returnModelInfo);
        // index 증가
        currIndex += decodingInfo.byte;
      });
      return returnModelInfo;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 수신받은 데이터가 Array 형태 일 경우
   * @desc Modbus에서 수신받은 데이터 파싱할 때 사용
   * @param {decodingProtocolInfo} decodingTable
   * @param {number[]} receiveData 수신 받은 배열 데이터
   * @example
   * addr: 3, length 5 --> 수신받은 데이터 [x, x, x, x, x] 5개
   * decodingTable.decodingDataList --> 3번 index ~ 7번 인덱스(addr + length - 1) 반복 체크
   * currIndex는 반복에 의해 1씩 증가 --> 해당 currIndex로 수신받은 데이터 index 추출
   */
  automaticDecodingForArray(decodingTable, receiveData) {
    try {
      // BU.CLI(receiveData);
      // BU.CLI(decodingTable);
      // 데이터를 집어넣을 기본 자료형을 가져옴
      const returnModelInfo = AbstBaseModel.GET_BASE_MODEL(this.protocolInfo);
      // 수신받은 데이터에서 현재 체크 중인 값을 가져올 인덱스
      let currIndex = 0;

      // 총 체크해야할 데이터 범위를 계산 (시작주소 + 수신 데이터 길이)
      const remainedDataListLength = _.sum([receiveData.length, decodingTable.address]);
      // 시작주소부터 체크 시작
      for (let index = decodingTable.address; index < remainedDataListLength; index += 1) {
        // 해당 디코딩 정보 추출
        const decodingInfo = decodingTable.decodingDataList[index];
        // BU.CLI(decodingInfo)
        // 파싱 의뢰
        this.automaticParsingData(decodingInfo, _.nth(receiveData, currIndex), returnModelInfo);
        currIndex += decodingInfo.byte || 1;
      }
      // BU.CLI(returnModelInfo);
      return returnModelInfo;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 데이터 자동 파싱 후 model에 삽입
   * @param {decodingInfo} decodingInfo
   * @param {*} parsingData
   * @param {Object} modelInfo
   */
  automaticParsingData(decodingInfo, parsingData, modelInfo) {
    let returnValue = null;
    if (!_.isEmpty(decodingInfo)) {
      // 사용하는 메소드를 호출
      if (_.isNil(decodingInfo.callMethod)) {
        returnValue = parsingData;
      } else {
        returnValue = this.protocolConverter[decodingInfo.callMethod](parsingData);
      }

      // 배율 및 소수점 처리를 사용한다면 적용
      returnValue =
        _.isNumber(decodingInfo.scale) && _.isNumber(decodingInfo.fixed)
          ? _.round(returnValue * decodingInfo.scale, decodingInfo.fixed)
          : returnValue;

      // decodingKey가 있다면 해당 key로. 기본값은 key로 변환 키 정의
      const decodingKey = _.get(decodingInfo, 'decodingKey')
        ? _.get(decodingInfo, 'decodingKey')
        : _.get(decodingInfo, 'key');
      // 변환키가 정의되어있는지 확인
      if (_.includes(_.keys(this.onDeviceOperationStatus), decodingKey)) {
        const operationStauts = this.onDeviceOperationStatus[decodingKey];
        // 찾은 Decoding이 Function 이라면 값을 넘겨줌
        if (operationStauts instanceof Function) {
          const tempValue = operationStauts(returnValue);
          returnValue = _.isNumber(tempValue) ? _.round(tempValue, decodingInfo.fixed) : tempValue;
        } else {
          returnValue = _.get(operationStauts, returnValue);
        }
      }

      // 데이터 단위가 배열일 경우
      if (Array.isArray(modelInfo[_.get(decodingInfo, 'key')])) {
        modelInfo[_.get(decodingInfo, 'key')].push(returnValue);
      } else {
        modelInfo[_.get(decodingInfo, 'key')] = returnValue;
      }
    }

    return modelInfo;
  }
}
module.exports = AbstConverter;
