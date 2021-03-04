const _ = require('lodash');
const { BU } = require('base-util-jh');

const ProtocolConverter = require('./ProtocolConverter');
const AbstBaseModel = require('./AbstBaseModel');
const defaultWrapper = require('./defaultWrapper');

const { dccFlagModel, dcmConfigModel } = require('../module').di;

const { definedCommanderResponse } = dccFlagModel;
const { reqDeviceControlType } = dcmConfigModel;

class AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo = {}) {
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
   * @param {number=} executeTimeoutMs 해당 전송 후 명령 완료 처리될때까지 대기 시간 (ms)
   * @param {number=} delayTimeoutMs 해당 명령을 수행하기 전 timeout 대기 시간(ms)
   * @return {Array.<commandInfo>}
   */
  makeDefaultCommandInfo(cmdDataList, executeTimeoutMs = 1000, delayTimeoutMs) {
    /** @type {Array.<commandInfo>} */
    const returnValue = [];

    // wrapCategory를 사용한다면 중계기를 거치므로 각 1초를 추가로 할애
    if (_.get(this.protocolInfo, 'wrapperCategory', '').length) {
      executeTimeoutMs += 1000;
    }

    cmdDataList = Array.isArray(cmdDataList) ? cmdDataList : [cmdDataList];

    cmdDataList.forEach(bufData => {
      /** @type {commandInfo} */
      const command = {
        data: this.coverFrame(bufData),
        commandExecutionTimeoutMs: executeTimeoutMs,
        delayExecutionTimeoutMs: delayTimeoutMs,
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
  getCurrTransferCmd(dcData = {}) {
    const { commandSet: { cmdList = [], currCmdIndex = 0 } = {} } = dcData;
    return _.get(_.nth(cmdList, currCmdIndex), 'data');
  }

  /**
   * @desc MainConverter.generationCommand 메소드에서 value 정제 선행 완료
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   */
  defaultGenCMD(generationInfo = {}) {
    const { MEASURE } = reqDeviceControlType;
    const { key = 'DEFAULT', value = MEASURE, setValue, nodeInfo } = generationInfo;

    /** @type {baseModelDeviceStructure} device(Project Model) 에서 ndId와 일치하는 장치 모델을 가져옴   */
    const baseModel = _.find(this.model.device, deviceModel => {
      const nodeDefId = _.get(deviceModel, 'KEY');

      return Array.isArray(nodeDefId) ? _.includes(nodeDefId, key) : nodeDefId === key;
    });

    if (_.isEmpty(baseModel)) {
      throw new Error(`key:(${key})는 존재하지 않습니다.`);
    }
    // 해당 프로젝트 모델에서 제시하는 장치 별 명령 객체 정보를 가져옴
    const commandInfo = _.get(baseModel, 'COMMAND', {});

    // value가 MEASURE라면 STATUS 요청
    // SingleControlValue 값에 따라 명령 호출
    const command = value === MEASURE ? commandInfo.STATUS : commandInfo[value];

    if (command === undefined) {
      throw new Error(`singleControlType: ${value}는 유효한 값이 아닙니다.`);
    }
    // 명령식 Function 일 경우 parametor로 노드 정보와 설정 값을 넘겨줌
    const resultCommand =
      command instanceof Function ? command(nodeInfo, setValue) : command;

    // console.log(resultCommand);

    return resultCommand;
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {commandInfo[]} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    // BU.CLI(generationInfo);
    const cmdList = this.defaultGenCMD(generationInfo);
    // BU.CLI(cmdList);
    return this.makeAutoGenerationCommand(cmdList);
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @param {nodeInfo[]} nodeList 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  parsingUpdateData(dcData, nodeList) {
    const returnValue = {};
    const { DONE, ERROR, WAIT, RETRY } = definedCommanderResponse;
    try {
      // 수신 데이터 추적을 하는 경우라면 dcData의 Data와 합산
      const hasTrackingData = _.get(this, 'protocolOptionInfo.hasTrackingData');
      const { wrapperCategory = '' } = this.protocolInfo;
      // 수신 데이터를 추적하거나 래핑타입을 사용할 경우 데이터 추적모드
      if (hasTrackingData === true || wrapperCategory.length) {
        const dcBufData = Buffer.isBuffer(dcData.data)
          ? dcData.data
          : Buffer.from(dcData.data);
        this.trackingDataBuffer = Buffer.concat([this.trackingDataBuffer, dcBufData]);
        dcData.data = this.trackingDataBuffer;
      }
      // protocolInfo.wrapperCategory 여부에 따라 frame 해제
      returnValue.data = this.concreteParsingData(
        this.peelFrame(dcData.data),
        this.peelFrame(this.getCurrTransferCmd(dcData)),
        nodeList,
      );
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

      BU.error(error.message);
      // 에러가 발생할 경우 추적 버퍼 리셋
      this.resetTrackingDataBuffer();

      if (error instanceof TypeError) {
        returnValue.eventCode = RETRY;
        return returnValue;
      }

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
   * @param {Array.<decodingInfo>} decodingDataList
   * @param {Buffer} receiveData
   * @example
   * addr: 3, length 5 --> 수신받은 데이터 [x, x, x, x, x] 5개
   * decodingTable.decodingDataList --> 3번 index ~ 7번 인덱스(addr + length - 1) 반복 체크
   * currIndex는 반복에 의해 1씩 증가 --> 해당 currIndex로 수신받은 데이터 index 추출
   */
  automaticDecoding(decodingDataList, receiveData) {
    // 데이터를 집어넣을 기본 자료형을 가져옴
    const returnModelInfo = AbstBaseModel.GET_BASE_MODEL(this.protocolInfo);
    // 수신받은 데이터에서 현재 체크 중인 값을 가져올 인덱스
    let currIndex = 0;
    decodingDataList.forEach(decodingInfo => {
      const { byte = 1 } = decodingInfo;
      // 조회할 데이터를 가져옴
      const thisData = receiveData.slice(currIndex, currIndex + byte);

      // BU.CLI(thisData);

      this.automaticParsingData(decodingInfo, thisData, returnModelInfo);
      // index 증가
      currIndex += byte;
    });
    return returnModelInfo;
  }

  /**
   * 수신받은 데이터가 Array 형태 일 경우
   * @desc Modbus에서 수신받은 데이터 파싱할 때 사용
   * @param {decodingProtocolInfo} decodingTable
   * @param {Buffer|number[]} receiveData 수신 받은 데이터
   * @example
   * addr: 3, length 5 --> 수신받은 데이터 [x, x, x, x, x] 5개
   * decodingTable.decodingDataList --> 3번 index ~ 7번 인덱스(addr + length - 1) 반복 체크
   * currIndex는 반복에 의해 1씩 증가 --> 해당 currIndex로 수신받은 데이터 index 추출
   */
  automaticDecodingIndex(decodingTable, receiveData) {
    const { address = 0, decodingDataList } = decodingTable;
    // 데이터를 집어넣을 기본 자료형을 가져옴
    const returnModelInfo = AbstBaseModel.GET_BASE_MODEL(this.protocolInfo);
    // 수신받은 데이터에서 현재 체크 중인 값을 가져올 인덱스
    let dataStartIndex = 0;

    // 조회는 receiveData가 끝나거나 decodingTable이 끝날 때까지 순회
    decodingDataList.slice(address).forEach((decodingInfo, index) => {
      const { byte = 1 } = decodingInfo;

      const dataEndPoint = dataStartIndex + byte;

      // slice 만큼의 길이를 확보하지 못할 경우 decoding 취소
      // 배열이 10개일 경우 slice(start, 10) 2번째 파람이 10 이상일 경우에 완전한 데이터 추출 가능
      if (receiveData.length < dataEndPoint) {
        return false;
      }

      // receiveData는 decodingInfo에서 정의한 byte만큼 slice
      /** @type {Buffer|number} */
      let thisData;

      // Buffer 일 경우 slice
      if (Buffer.isBuffer(receiveData)) {
        thisData = receiveData.slice(dataStartIndex, dataEndPoint);
      } else {
        // number[] 일 경우 get
        thisData = receiveData[index];
      }
      // 다음 자를 위치 지정
      dataStartIndex = dataEndPoint;

      this.automaticParsingData(decodingInfo, thisData, returnModelInfo);
    });
    return returnModelInfo;
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
      const {
        callMethod,
        callMethodParam,
        key,
        decodingKey = key,
        isLE = false,
        isUnsigned = true,
        fixed = 0,
        scale,
      } = decodingInfo;

      // 사용하는 메소드를 호출
      if (_.isNil(callMethod)) {
        returnValue = parsingData;
      } else if (_.eq(callMethod, 'convertBufToReadInt')) {
        const option = {
          isLE,
          isUnsigned,
        };
        returnValue = this.protocolConverter.convertBufToReadInt(parsingData, option);
      } else {
        returnValue = this.protocolConverter[callMethod](parsingData, callMethodParam);
      }

      // BU.CLI(returnValue);
      // 배율 및 소수점 처리를 사용한다면 적용
      if (_.isNumber(returnValue)) {
        if (_.isNumber(scale)) {
          returnValue *= scale;
        }
        returnValue = _.round(returnValue, fixed);
      }

      // 변환키가 정의되어있는지 확인
      if (_.includes(_.keys(this.onDeviceOperationStatus), decodingKey)) {
        const operationStauts = this.onDeviceOperationStatus[decodingKey];
        // 찾은 Decoding이 Function 이라면 값을 넘겨줌
        if (operationStauts instanceof Function) {
          const tempValue = operationStauts(returnValue, callMethodParam);
          returnValue = _.isNumber(tempValue) ? _.round(tempValue, fixed) : tempValue;
        } else {
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
