const _ = require('lodash');

const { BU } = require('base-util-jh');

const protocol = require('./protocol');
const Model = require('./Model');
const AbstConverter = require('../../Default/AbstConverter');

class Converter extends AbstConverter {
  /**
   * protocol_info.option --> true: 3.3kW, any: 600W
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super(protocolInfo);
    this.protocolInfo = protocolInfo;
    this.decodingTable = protocol.decodingProtocolTable(this.protocolInfo.deviceId);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;

    /** BaseModel */
    this.model = new Model(protocolInfo);
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
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    try {
      // BU.CLI(dcData);
      // 요청한 명령 추출
      const requestData = currTransferCmd;
      // 응답 받은 데이터 추출
      const responseData = deviceData;

      // BU.CLIS(deviceData, currTransferCmd);

      // 요청한 주소 추출
      const reqAddr = this.model.getRequestAddr(requestData);
      // 응답받은 주소 추출
      const resAddr = this.model.getResponseAddr(responseData);

      // BU.CLIS(reqAddr, resAddr);
      // 비교
      if (reqAddr !== resAddr) {
        throw new Error(`Not Matching ReqAddr: ${reqAddr}, ResAddr: ${resAddr}`);
      }

      let decodingTable;
      switch (resAddr) {
        case 0:
          decodingTable = this.decodingTable.SYSTEM;
          break;
        case 1:
          decodingTable = this.decodingTable.PV;
          break;
        case 2:
          decodingTable = this.decodingTable.GRID_VOL;
          break;
        case 3:
          decodingTable = this.decodingTable.GRID_AMP;
          break;
        case 4:
          decodingTable = this.decodingTable.POWER;
          break;
        case 6:
          decodingTable = this.decodingTable.OPERATION;
          break;
        default:
          throw new Error(`Can not find it Addr ${resAddr}`);
      }

      // 응답받은 데이터가 정상적인지 검증하고 유효하다면 데이터 바디 추출
      const dataBody = this.model.getValidateData(responseData, decodingTable);
      // BU.CLI(dataBody);
      return this.automaticDecoding(decodingTable.decodingDataList, dataBody);
    } catch (error) {
      throw error;
    }
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: '002',
    mainCategory: 'Inverter',
    subCategory: 'das_1.3',
  });

  // const requestData = Buffer.from([0x0a, 0x96, 0x01, 0x54, 0x18, 0x05, 0x6d]);

  const requestMsg = converter.generationCommand({
    key: converter.model.device.DEFAULT.KEY,
  });

  const testReqMsg = '02495e5030303253543603';
  const realTestReqMsg = Buffer.from(testReqMsg.slice(4, testReqMsg.length - 2), 'hex');

  const dataList = [
    '02495e443631323030322c302c312c4d2c333403',
    '02495e443631323030322c302c312c4d2c343103',
  ];

  dataList.forEach(d => {
    const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');

    // const result = converter.testParsingData(realBuffer);
    // BU.CLI(result);
    const dataMap = converter.concreteParsingData(realBuffer, realTestReqMsg);
    BU.CLI(dataMap);
  });

  // BU.CLIN(converter.model);

  // converter.testParsingData(Buffer.from(dataList, 'ascii'));
}
