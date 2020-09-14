const _ = require('lodash');

const { BU } = require('base-util-jh');

const protocol = require('./protocol');
const Model = require('./Model');
const AbstConverter = require('../../Default/AbstConverter');

class Converter extends AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super(protocolInfo);
    this.decodingTable = protocol.decodingProtocolTable(protocolInfo.deviceId);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;

    this.model = new Model(protocolInfo);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {commandInfo[]} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    const cmdList = this.defaultGenCMD(generationInfo);
    return this.makeAutoGenerationCommand(cmdList);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    const RES_DATA_START_POINT = 9;

    const responseData = deviceData; // 응답 buffer
    const resId = deviceData.slice(2, 5).toString(); // 응답 접속반 ID

    const requestData = currTransferCmd; // 요청 buffer
    const reqId = requestData.slice(2, 5).toString(); // 요청 접속반 ID

    const indexETX = responseData.indexOf(0x03); // 응답 buffer의 ETX 위치 값
    const indexEOT = responseData.indexOf(0x04); // 응답 buffer의 EOT 위치 값
    const moduleCount = _.parseInt(responseData.slice(6, 8).toString()); // 응답 buffer 모듈 개수
    const resCrcCode = responseData.slice(indexETX + 1, indexEOT); // 응답 buffer의 crc코드

    // 응답, 요청 접속반 ID 비교
    if (!_.eq(reqId, resId)) {
      throw new Error(`Not Matching ReqId: ${reqId}, ResId: ${resId}`);
    }

    // 응답 데이터 CRC코드 계산 (구분자 포함)
    const calcCrcCode = this.model.makeCrcCode(
      responseData.slice(0, responseData.indexOf(0x03) + 1),
    );

    // 응답, 요청 CRC코드 비교
    if (!_.isEqual(calcCrcCode, resCrcCode)) {
      // throw new Error(
      //   `Not Matching calculated CrcCode: ${calcCrcCode}, responsed CrcCode: ${resCrcCode}`,
      // );
    }

    // 모듈 개수에 따라 decodingDataList 변경
    const { decodingTable } = this;
    switch (moduleCount) {
      case 1:
        decodingTable.decodingDataList = this.decodingTable.decodingDataList.slice(0, 8);
        break;
      case 2:
        decodingTable.decodingDataList = this.decodingTable.decodingDataList.slice(0, 16);
        break;
      case 3:
        decodingTable.decodingDataList = this.decodingTable.decodingDataList.slice(0, 32);
        break;
      case 4:
        decodingTable.decodingDataList = this.decodingTable.decodingDataList.slice(0, 48);
        break;
      default:
        throw new Error('Module Count Error');
    }

    // 헤더와 CRC코드, ETX를 제외한 데이터 계산, 구분점 제거
    const dataBody = this.protocolConverter.returnBufferExceptDelimiter(
      responseData.slice(RES_DATA_START_POINT, indexETX),
      ',',
    );
    const dataMap = this.automaticDecoding(decodingTable.decodingDataList, dataBody);

    return dataMap;
  }
}
module.exports = Converter;

// 테스트
if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: '001',
    mainCategory: 'Sensor',
    subCategory: 'CNT_dm_v1',
  });

  const data = Buffer.from(
    // 'R001,01,000000000000000000510020000000000176',
    'R001,02,00000000000000000051002000000000,000000000000000000510020000000000176',
  );

  const dataMap = converter.concreteParsingData(
    data,
    _.head(converter.generationCommand()).data,
  );
  BU.CLI('dataMap', dataMap);
}
