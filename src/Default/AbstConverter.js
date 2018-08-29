const {BU} = require('base-util-jh');
const _ = require('lodash');

const ProtocolConverter = require('./ProtocolConverter');
const AbstBaseModel = require('./AbstBaseModel');

// const {definedCommanderResponse} =  require('default-intelligence').dccFlagModel;
const {definedCommanderResponse} = require('../../../../module/default-intelligence').dccFlagModel;

class AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    this.protocol_info = protocolInfo;

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
        data: bufData,
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
    const returnValue = {};
    try {
      // 수신 데이터 추적을 하는 경우라면 dcData의 Data와 합산
      if (_.get(this.protocolOptionInfo, 'hasTrackingData') === true) {
        this.trackingDataBuffer = Buffer.concat([this.trackingDataBuffer, dcData.data]);
        dcData.data = this.trackingDataBuffer;

        // BU.CLI(dcData.data.toString());
      }

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
   * @param {Buffer|number[]} receiveData
   * @example
   * >>> number[] 일 경우
   * addr: 3, length 5 --> 수신받은 데이터 [x, x, x, x, x] 5개
   * decodingTable.decodingDataList --> 3번 index ~ 7번 인덱스(addr + length - 1) 반복 체크
   * currIndex는 반복에 의해 1씩 증가 --> 해당 currIndex로 수신받은 데이터 index 추출
   */
  automaticDecoding(decodingTable, receiveData) {
    // BU.CLI(decodingTable);
    try {
      // 데이터를 집어넣을 기본 자료형을 가져옴
      const returnModelInfo = AbstBaseModel.GET_BASE_MODEL(this.protocol_info);
      // 도출된 자료가 2차 가공(ex: 0 -> Open, 1 -> Close )이 필요한 경우
      const operationKeys = _.keys(this.onDeviceOperationStatus);
      // 수신받은 데이터에서 현재 체크 중인 값을 가져올 인덱스
      let currIndex = 0;

      // 총 체크해야할 데이터 범위를 계산 (시작주소 + 수신 데이터 길이)
      const remainedDataListLength = _.sum([receiveData.length, decodingTable.address]);
      // 시작주소부터 체크 시작
      for (let index = decodingTable.address; index < remainedDataListLength; index += 1) {
        // 해당 디코딩 정보 추출
        const decodingInfo = decodingTable.decodingDataList[index];

        // 디코딩 정보 여부 체크
        if (!_.isEmpty(decodingInfo)) {
          // 조회할 데이터를 가져옴
          const thisData = _.nth(receiveData, currIndex);
          let convertValue;
          // 사용하는 메소드를 호출
          if (_.isNil(decodingInfo.callMethod)) {
            convertValue = thisData;
          } else {
            convertValue = this.protocolConverter[decodingInfo.callMethod](thisData);
          }
          // 배율 및 소수점 처리를 사용한다면 적용
          convertValue =
            _.isNumber(decodingInfo.scale) && _.isNumber(decodingInfo.fixed)
              ? _.round(convertValue * decodingInfo.scale, decodingInfo.fixed)
              : convertValue;

          // decodingKey가 있다면 해당 key로. 기본값은 key로 변환 키 정의
          const decodingKey = _.get(decodingInfo, 'decodingKey')
            ? _.get(decodingInfo, 'decodingKey')
            : _.get(decodingInfo, 'key');
          // 변환키가 정의되어있는지 확인
          if (_.includes(operationKeys, decodingKey)) {
            const operationStauts = this.onDeviceOperationStatus[decodingKey];
            // 찾은 Decoding이 Function 이라면 값을 넘겨줌
            if (operationStauts instanceof Function) {
              const tempValue = operationStauts(convertValue);
              convertValue = _.isNumber(tempValue)
                ? _.round(tempValue, decodingInfo.fixed)
                : tempValue;
            } else {
              convertValue = _.get(operationStauts, convertValue);
            }
          }

          // 데이터 단위가 배열일 경우
          if (Array.isArray(returnModelInfo[_.get(decodingInfo, 'key')])) {
            returnModelInfo[_.get(decodingInfo, 'key')].push(convertValue);
          } else {
            returnModelInfo[_.get(decodingInfo, 'key')] = convertValue;
          }
        }
        currIndex += decodingInfo.byte || 1;
      }
      return returnModelInfo;
    } catch (error) {
      throw error;
    }

    // try {
    //   // BU.CLI(data);
    //   // 데이터를 집어넣을 기본 자료형을 가져옴
    //   const returnModelInfo = AbstBaseModel.GET_BASE_MODEL(this.protocol_info);
    //   // 도출된 자료가 2차 가공(ex: 0 -> Open, 1 -> Close )이 필요한 경우
    //   const operationKeys = _.keys(this.onDeviceOperationStatus);
    //   // 수신받은 데이터에서 현재 체크 중인 값을 가져올 인덱스
    //   let currIndex = 0;
    //   decodingTable.forEach(decodingInfo => {
    //     // 디코딩 정보 여부 체크
    //     if (_.isEmpty(decodingInfo)) {
    //       return false;
    //     }
    //     // 조회할 데이터를 가져옴
    //     const thisData = receiveData.slice(currIndex, currIndex + decodingInfo.byte);
    //     let convertValue;
    //     // 사용하는 메소드를 호출
    //     if (_.isNil(decodingInfo.callMethod)) {
    //       convertValue = thisData;
    //     } else {
    //       convertValue = this.protocolConverter[decodingInfo.callMethod](thisData);
    //     }
    //     // 배율 및 소수점 처리를 사용한다면 적용
    //     convertValue =
    //       _.isNumber(decodingInfo.scale) && _.isNumber(decodingInfo.fixed)
    //         ? _.round(convertValue * decodingInfo.scale, decodingInfo.fixed)
    //         : convertValue;

    //     // decodingKey가 있다면 해당 key로. 기본값은 key로 변환 키 정의
    //     const decodingKey = _.get(decodingInfo, 'decodingKey')
    //       ? _.get(decodingInfo, 'decodingKey')
    //       : _.get(decodingInfo, 'key');
    //     // 변환키가 정의되어있는지 확인
    //     if (_.includes(operationKeys, decodingKey)) {
    //       const operationStauts = this.onDeviceOperationStatus[decodingKey];

    //       // 찾은 Decoding이 Function 이라면 값을 넘겨줌
    //       if (operationStauts instanceof Function) {
    //         const tempValue = operationStauts(convertValue);
    //         convertValue = _.isNumber(tempValue)
    //           ? _.round(tempValue, decodingInfo.fixed)
    //           : tempValue;
    //       } else {
    //         convertValue = _.get(operationStauts, convertValue);
    //       }
    //     }

    //     // 데이터 단위가 배열일 경우
    //     if (Array.isArray(returnModelInfo[_.get(decodingInfo, 'key')])) {
    //       returnModelInfo[_.get(decodingInfo, 'key')].push(convertValue);
    //     } else {
    //       returnModelInfo[_.get(decodingInfo, 'key')] = convertValue;
    //     }

    //     // index 증가
    //     currIndex += decodingInfo.byte;
    //   });
    //   return returnModelInfo;
    // } catch (error) {
    //   throw error;
    // }
  }
}
module.exports = AbstConverter;
