const _ = require('lodash');
const moment = require('moment');
const { BU } = require('base-util-jh');
const AbstConverter = require('../../Default/AbstConverter');
const protocol = require('./protocol');

const Model = require('./Model');
const { BASE_MODEL } = require('./Model');

class Converter extends AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super(protocolInfo);
    this.decodingTable = protocol.decodingProtocolTable(protocolInfo);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;

    /** BaseModel */
    this.model = new Model(protocolInfo);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @override
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {commandInfo[]} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    /** @type {modbusReadFormat[]} */
    const cmdList = this.defaultGenCMD(generationInfo);

    return this.makeDefaultCommandInfo(cmdList, 1000);
  }

  /**
   * 데이터 분석 요청
   * @param {number[]} deviceData 장치로 요청한 명령
   * @param {modbusReadFormat} currTransferCmd 현재 요청한 명령
   * @return {parsingResultFormat}
   */
  concreteParsingData(deviceData, currTransferCmd) {
    // BU.CLIS(deviceData, currTransferCmd);
    try {
      // RTC 날짜 배열 길이
      const headerLength = 6;
      /**
       * 요청한 명령 추출
       * FIXME: Function Code 04 기준으로만 작성됨.  필요시 수정
       * @type {modbusReadFormat}
       */
      const requestData = currTransferCmd;

      /** @type {number[]} */
      const resDataList = deviceData;

      const decodingTable = this.decodingTable.SITE;
      // 요청 시작 주소를 가져옴
      const registerAddr = requestData.address;
      // 실제 시작하는 주소 세팅
      decodingTable.address = registerAddr;

      // 수신받은 데이터의 길이가 다를 경우
      if (!_.isEqual(requestData.dataLength, resDataList.length)) {
        throw new Error(
          `The expected dataLength: ${requestData.dataLength}. but received dataLength: ${
            resDataList.length
          }`,
        );
      }

      // 실제 파싱 데이터 추출
      // BU.CLI(resDataList)
      // BU.CLI(requestData.dataLength);
      const dataBody = resDataList.slice(0, requestData.dataLength);
      // BU.CLI(dataBody)
      /** @type {BASE_MODEL} */
      const returnValue = this.automaticDecodingForArray(decodingTable, dataBody);
      // 계측 시간을 포함할 경우
      if (registerAddr < headerLength) {
        const measureDate = moment();
        let currIndex = 0;
        for (let index = registerAddr; index < headerLength; index += 1) {
          const indexValue = _.nth(resDataList, currIndex);
          switch (index) {
            case 0:
              // measureDate.year(_.sum([2000, indexValue]));
              measureDate.year(indexValue);
              break;
            case 1:
              measureDate.month(_.subtract(indexValue, 1));
              break;
            case 2:
              measureDate.date(indexValue);
              break;
            case 3:
              measureDate.hour(indexValue);
              break;
            case 4:
              measureDate.minute(indexValue);
              break;
            case 5:
              measureDate.second(indexValue);
              break;
            default:
              break;
          }
          currIndex += 1;
        }
        returnValue.writeDate.push(measureDate.toDate());
      }

      return returnValue;
    } catch (error) {
      throw error;
    }
  }

  /**
   * @override
   * decodingInfo 리스트 만큼 Data 파싱을 진행
   * @param {decodingProtocolInfo} decodingTable
   * @param {Buffer|number[]} receiveData
   * @example
   * addr: 3, length 5 --> 수신받은 데이터 [x, x, x, x, x] 5개
   * decodingTable.decodingDataList --> 3번 index ~ 7번 인덱스(addr + length - 1) 반복 체크
   * currIndex는 반복에 의해 1씩 증가 --> 해당 currIndex로 수신받은 데이터 index 추출
   */
  automaticDecodings(decodingTable, receiveData) {
    // BU.CLI(decodingTable);
    try {
      // 데이터를 집어넣을 기본 자료형을 가져옴
      const returnModelInfo = Model.BASE_MODEL;
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
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: '1',
    mainCategory: 'FarmParallel',
    subCategory: 'YeongSanPo',
    protocolOptionInfo: {
      hasTrackingData: true,
    },
  });

  BU.CLIN(converter.model);
  const cmdInfo = converter.generationCommand(converter.model.device.DEFAULT.COMMAND.STATUS);
  BU.CLI(cmdInfo);
}
