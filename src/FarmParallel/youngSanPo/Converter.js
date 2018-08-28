const _ = require('lodash');
const moment = require('moment');
const {BU} = require('base-util-jh');
const AbstConverter = require('../../Default/AbstConverter');
const protocol = require('./protocol');

const Model = require('./Model');
const {BASE_MODEL} = require('./Model');

class Converter extends AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super(protocolInfo);
    this.protocol_info = protocolInfo;
    this.decodingTable = protocol.decodingProtocolTable(protocolInfo);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;

    /** BaseModel */
    this.model = new Model(protocolInfo);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {Array.<Buffer>} cmdList 각 Protocol Converter에 맞는 데이터
   * @return {Array.<commandInfo>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(cmdList) {
    return this.makeDefaultCommandInfo(cmdList, 1000);
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  concreteParsingData(dcData) {
    try {
      // RTC 날짜 배열 길이
      const headerLength = 6;
      /**
       * 요청한 명령 추출
       * @type {{unitId: string, address: number, length: number}}
       */
      const requestData = this.getCurrTransferCmd(dcData);

      /** @type {number[]} */
      const resDataList = dcData.data;

      const decodingTable = this.decodingTable.SITE;
      // 요청 시작 주소를 가져옴
      const startAddr = requestData.address;
      const startBodyAddr = startAddr < headerLength ? 0 : startAddr - headerLength;
      // 실제 시작하는 주소 세팅
      decodingTable.address = startBodyAddr;
      // 종료 주소를 가져옴
      const endAddr = _.sum([startAddr, requestData.length]);

      BU.CLIS(startAddr, startBodyAddr, endAddr);

      // 실제 파싱 데이터 추출
      const dataBody = resDataList.slice(startBodyAddr, endAddr);

      BU.CLI(dataBody);
      /** @type {BASE_MODEL} */
      const returnValue = this.automaticDecoding(decodingTable, dataBody);
      // 계측 시간을 포함할 경우
      if (startAddr < headerLength) {
        const measureDate = moment();
        for (let index = startAddr; index > 0; index -= 1) {
          switch (index) {
            case 0:
              measureDate.year(_.nth(resDataList, index));
              break;
            case 1:
              measureDate.month(_.nth(resDataList, index));
              break;
            case 2:
              measureDate.day(_.nth(resDataList, index));
              break;
            case 3:
              measureDate.hour(_.nth(resDataList, index));
              break;
            case 4:
              measureDate.minute(_.nth(resDataList, index));
              break;
            case 5:
              measureDate.second(_.nth(resDataList, index));
              break;
            default:
              break;
          }
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
   * @param {number[]} resDataList
   */
  automaticDecoding(decodingTable, resDataList) {
    try {
      // BU.CLI(data);
      // 데이터를 집어넣을 기본 자료형을 가져옴
      const returnValue = BASE_MODEL;
      // BU.CLI(returnValue);
      // 도출된 자료가 2차 가공(ex: 0 -> Open, 1 -> Close )이 필요한 경우
      const operationKeys = _.keys(this.onDeviceOperationStatus);
      let startIndex = decodingTable.address;

      decodingTable.decodingDataList.forEach(decodingInfo => {
        // 조회할 데이터를 가져옴
        const thisData = _.nth(resDataList, startIndex);
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
        // 2차 가공 여부에 따라 변환
        let realValue = convertValue;

        // BU.CLI(decodingInfo.key, realValue);

        // decodingKey가 있다면 해당 key로. 기본값은 key로 변환 키 정의
        const decodingKey = _.get(decodingInfo, 'decodingKey')
          ? _.get(decodingInfo, 'decodingKey')
          : _.get(decodingInfo, 'key');
        // 변환키가 정의되어있는지 확인
        if (_.includes(operationKeys, decodingKey)) {
          BU.CLI(decodingKey);
          const operationStauts = this.onDeviceOperationStatus[decodingKey];
          BU.CLI(operationStauts);

          // 찾은 Decoding이 Function 이라면 값을 넘겨줌
          if (operationStauts instanceof Function) {
            const tempValue = operationStauts(convertValue);
            realValue = _.isNumber(tempValue) ? _.round(tempValue, decodingInfo.fixed) : tempValue;
          } else {
            // const key = _(operationStauts)
            //   .keys()
            //   .every(_.isNumber)
            //   ? Number(convertValue)
            //   : _.toString(convertValue);
            // BU.CLI(key)
            // realValue = _.get(operationStauts, key);
            realValue = _.get(operationStauts, convertValue);
          }
        }

        // 데이터 단위가 배열일 경우
        if (Array.isArray(returnValue[_.get(decodingInfo, 'key')])) {
          returnValue[_.get(decodingInfo, 'key')].push(realValue);
        } else {
          returnValue[_.get(decodingInfo, 'key')] = realValue;
        }

        // index 증가, 기본값은 1
        startIndex += decodingInfo.byte || 1;
      });
      return returnValue;
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
    subCategory: 'youngSanPo',
    protocolOptionInfo: {
      hasTrackingData: true,
    },
  });

  BU.CLIN(converter.model);
  const cmdInfo = converter.generationCommand(converter.model.device.DEFAULT.COMMAND.STATUS);
  BU.CLI(cmdInfo);
}
