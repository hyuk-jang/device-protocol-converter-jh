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
    // 요청한 명령 추출
    const reqBuffer = currTransferCmd;
    // 응답 받은 데이터 추출
    const resBuffer = deviceData;

    // 요청한 주소 추출
    const reqAddr = this.model.getRequestAddr(reqBuffer);
    // 응답받은 주소 추출
    const resAddr = this.model.getResponseAddr(resBuffer);

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
    const dataBody = this.model.getValidateData(resBuffer, decodingTable);
    // BU.CLI(dataBody);
    return this.automaticDecoding(decodingTable.decodingDataList, dataBody);
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: '002',
    mainCategory: 'Inverter',
    subCategory: 'das_1.3',
  });

  const requestMsg = converter.generationCommand({
    key: converter.model.device.DEFAULT.KEY,
  });

  // BU.CLI(requestMsg);

  const reqDataList = [
    '02495e5030303253543103',
    '02495e5030303253543203',
    '02495e5030303253543303',
    '02495e5030303253543403',
  ];

  const dataList = [
    '02495e443132303030322c3438302c303533382c303235362c343603',
    '02495e443232323030322c3430332c3430352c3430322c3630302c333603',
    '02495e443332313030322c303337302c303336332c303336342c343303',
    '02495e443431393030322c303235332c303033323936342c353003',
  ];

  dataList.forEach((d, idx) => {
    const reqBuffer = Buffer.from(
      reqDataList[idx].slice(4, reqDataList[idx].length - 2),
      'hex',
    );
    const resBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');

    const dataMap = converter.concreteParsingData(resBuffer, reqBuffer);
    console.log(dataMap);
  });
}
