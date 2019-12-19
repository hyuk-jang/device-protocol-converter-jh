const _ = require('lodash');
const { BU } = require('base-util-jh');

const ProtocolConverter = require('./ProtocolConverter');
const AbstBaseModel = require('./AbstBaseModel');
const defaultWrapper = require('./defaultWrapper');

// const {definedCommanderResponse} =  require('default-intelligence').dccFlagModel;
const { dccFlagModel, dcmConfigModel } = require('../../../../module/default-intelligence');

const { definedCommanderResponse } = dccFlagModel;
const { reqDeviceControlType } = dcmConfigModel;

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
   * protocolInfo.wrapperCategory 에 따라 데이터를 frame 해제 후 반환
   * @param {*} data
   */
  peelFrame(data) {
    // BU.CLI(data)
    return defaultWrapper.peelFrameMsg(this.protocolInfo, data);
  }

  /**
   * 명령을 보낼 배열을 생성
   * @param {Array.<*>} cmdDataList 실제 수행할 명령
   * @param {number=} commandExecutionTimeoutMs 해당 전송 후 명령 완료 처리될때까지 대기 시간 (ms)
   * @param {number=} delayExecutionTimeoutMs 해당 명령을 수행하기 전 timeout 대기 시간(ms)
   * @return {Array.<commandInfo>}
   */
  makeDefaultCommandInfo(cmdDataList, commandExecutionTimeoutMs = 1000, delayExecutionTimeoutMs) {
    /** @type {Array.<commandInfo>} */
    const returnValue = [];

    // wrapCategory를 사용한다면 중계기를 거치므로 각 1초를 추가로 할애
    if (_.get(this.protocolInfo, 'wrapperCategory', '').length) {
      commandExecutionTimeoutMs += 1000;
    }

    cmdDataList = Array.isArray(cmdDataList) ? cmdDataList : [cmdDataList];

    cmdDataList.forEach(bufData => {
      /** @type {commandInfo} */
      const command = {
        data: this.coverFrame(bufData),
        commandExecutionTimeoutMs,
        delayExecutionTimeoutMs,
      };

      returnValue.push(command);
    });

    return returnValue;
  }

  /**
   * 명령을 보낼 배열을 생성. generationInfo 기반
   * @param {Array.<*>} cmdDataList 실제 수행할 명령
   */
  makeAutoGenerationCommand(cmdDataList) {
    const { cmdExecTimeoutMs = 1000, delayExecTimeoutMs } = this.protocolInfo;

    /** @type {commandInfo[]} */
    const returnValue = [];

    cmdDataList = Array.isArray(cmdDataList) ? cmdDataList : [cmdDataList];

    cmdDataList.forEach(bufData => {
      /** @type {commandInfo} */
      const command = {
        data: this.coverFrame(bufData),
        commandExecutionTimeoutMs: cmdExecTimeoutMs,
        delayExecutionTimeoutMs: delayExecTimeoutMs,
      };

      returnValue.push(command);
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
   * @desc MainConverter.generationCommand 메소드에서 value 정제 선행 완료
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   */
  defaultGenCMD(generationInfo = {}) {
    const { TRUE, FALSE, MEASURE, SET } = reqDeviceControlType;
    const { key = 'DEFAULT', value = MEASURE, setValue } = generationInfo;

    /** @type {baseModelDeviceStructure} */
    const foundIt = _.find(this.model.device, deviceModel =>
      _.isEqual(_.get(deviceModel, 'KEY'), key),
    );

    if (_.isEmpty(foundIt)) {
      throw new Error(`${key}는 존재하지 않습니다.`);
    }

    // BU.CLI(generationInfo);
    const commandInfo = _.get(foundIt, 'COMMAND', {});
    // BU.CLI(commandInfo);

    /** @type {Object[]} */
    let cmdList;

    // 컨트롤 밸류가 0이나 False라면 장치 작동을 Close, Off
    if (value === FALSE) {
      if (_.keys(commandInfo).includes('CLOSE')) {
        cmdList = commandInfo.CLOSE;
      } else if (_.keys(commandInfo).includes('OFF')) {
        cmdList = commandInfo.OFF;
      }
    } else if (value === TRUE) {
      if (_.keys(commandInfo).includes('OPEN')) {
        cmdList = commandInfo.OPEN;
      } else if (_.keys(commandInfo).includes('ON')) {
        cmdList = commandInfo.ON;
      }
    } else if (value === MEASURE) {
      if (_.keys(commandInfo).includes('STATUS')) {
        cmdList = commandInfo.STATUS;
      }
    } else if (value === SET) {
      // Set 은 메소드로 이루어져 있어야하며 set 값을 반영한 결과를 돌려줌
      if (_.keys(commandInfo).includes('SET')) {
        cmdList = commandInfo.SET(setValue);
      }
    } else {
      throw new Error(`singleControlType: ${value}는 유효한 값이 아닙니다.`);
    }
    if (cmdList === undefined || _.isEmpty(cmdList)) {
      throw new Error(`${key}에는 Value: ${value} 존재하지 않습니다.`);
    }
    return cmdList;
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  parsingUpdateData(dcData) {
    // BU.CLIN(dcData);
    const returnValue = {};
    const { DONE, ERROR, WAIT } = definedCommanderResponse;
    try {
      // 수신 데이터 추적을 하는 경우라면 dcData의 Data와 합산
      const hasTrackingData = _.get(this, 'protocolOptionInfo.hasTrackingData');
      const { wrapperCategory = '' } = this.protocolInfo;
      // 수신 데이터를 추적하거나 래핑타입을 사용할 경우 데이터 추적모드
      if (hasTrackingData === true || wrapperCategory.length) {
        this.trackingDataBuffer = Buffer.concat([this.trackingDataBuffer, dcData.data]);
        dcData.data = this.trackingDataBuffer;
        // BU.CLI(dcData.data.toString());
      }
      // protocolInfo.wrapperCategory 여부에 따라 frame 해제
      returnValue.data = this.concreteParsingData(
        this.peelFrame(dcData.data),
        this.peelFrame(this.getCurrTransferCmd(dcData)),
      );
      // BU.CLI('@@@@@@@@@@');
      returnValue.eventCode = DONE;

      // DONE 처리가 될 경우 Buffer 비움
      this.resetTrackingDataBuffer();

      return returnValue;
    } catch (error) {
      // Range Error가 발생하면 데이터가 충분하지 않아 그런것으로 판단
      if (error instanceof RangeError) {
        returnValue.eventCode = WAIT;
        return returnValue;
      }

      // 에러가 발생할 경우 추적 버퍼 리셋
      this.resetTrackingDataBuffer();

      returnValue.eventCode = ERROR;
      returnValue.data = error;
      return returnValue;
    }
  }

  /**
   * 실제 데이터 분석 요청
   * @param {*} deviceData 장치로 요청한 명령
   * @param {*} currTransferCmd 장치로 요청한 명령
   * @return {*}
   */
  concreteParsingData(deviceData, currTransferCmd) {}

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
        const { byte = 1, key } = decodingInfo;
        // 조회할 데이터를 가져옴
        const thisData = receiveData.slice(currIndex, currIndex + byte);
        // BU.CLI(key, thisData);
        this.automaticParsingData(decodingInfo, thisData, returnModelInfo);
        // index 증가
        currIndex += byte;
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
      const { address = 0, decodingDataList } = decodingTable;
      // 데이터를 집어넣을 기본 자료형을 가져옴
      const returnModelInfo = AbstBaseModel.GET_BASE_MODEL(this.protocolInfo);
      // 수신받은 데이터에서 현재 체크 중인 값을 가져올 인덱스
      let currIndex = 0;

      // 총 체크해야할 데이터 범위를 계산 (시작주소 + 수신 데이터 길이)
      const remainedDataListLength = _.sum([receiveData.length, address]);
      // 시작주소부터 체크 시작
      for (let index = address; index < remainedDataListLength; index += 1) {
        // 해당 디코딩 정보 추출
        // const decodingInfo = decodingDataList[index];
        /** @type {decodingInfo} */
        const decoding = decodingDataList[index];
        // BU.CLI(decoding);
        const { byte = 1 } = decoding;

        // BU.CLI(decodingInfo, receiveData);
        // 파싱 의뢰
        this.automaticParsingData(decoding, _.nth(receiveData, currIndex), returnModelInfo);
        currIndex += byte;
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
    // BU.CLI(parsingData, decodingInfo);
    let returnValue = null;
    if (!_.isEmpty(decodingInfo)) {
      const {
        callMethod,
        key,
        decodingKey = key,
        isLE = true,
        isUnsigned = true,
        fixed = 0,
        scale,
      } = decodingInfo;

      // 사용하는 메소드를 호출
      if (_.isNil(callMethod)) {
        returnValue = parsingData;
      } else if (_.eq(callMethod, 'convertReadBuf')) {
        const option = {
          isLE,
          isUnsigned,
        };
        returnValue = this.protocolConverter.convertReadBuf(parsingData, option);
      } else {
        returnValue = this.protocolConverter[callMethod](parsingData);
      }

      // 배율 및 소수점 처리를 사용한다면 적용
      if (_.isNumber(scale)) {
        returnValue = _.round(returnValue * scale, fixed);
      }

      // 변환키가 정의되어있는지 확인
      if (_.includes(_.keys(this.onDeviceOperationStatus), decodingKey)) {
        const operationStauts = this.onDeviceOperationStatus[decodingKey];
        // 찾은 Decoding이 Function 이라면 값을 넘겨줌
        if (operationStauts instanceof Function) {
          const tempValue = operationStauts(returnValue);
          returnValue = _.isNumber(tempValue) ? _.round(tempValue, fixed) : tempValue;
        } else {
          // BU.CLI(returnValue)
          returnValue = _.get(operationStauts, returnValue);
        }
      }

      // 데이터 단위가 배열일 경우
      if (Array.isArray(modelInfo[key])) {
        modelInfo[key].push(returnValue);
      } else if (_.isString(key)) {
        modelInfo[key] = returnValue;
      }
    }

    return modelInfo;
  }
}
module.exports = AbstConverter;
