const _ = require('lodash');

const { BU } = require('base-util-jh');

const Model = require('./Model');
const protocol = require('./protocol');
const { checkTripleInv } = require('../errorChecker');
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
    //   BU.CLI('currTransferCmd', currTransferCmd);
    // 0: Header1 1: Header2, 2: StationID
    const RES_DATA_START_POINT = 8;
    const reqId = currTransferCmd.slice(1, 3).toString();
    const resId = deviceData.slice(1, 3).toString();
    const requestData = currTransferCmd; // 요청한 명령 추출
    const responseData = deviceData; // 응답 받은 데이터 추출
    const resChkSum = deviceData.slice(deviceData.length - 5, deviceData.length - 1);
    const reqAddr = requestData.slice(4, 8).toString(); // 요청한 주소 추출
    const resAddr = responseData.slice(4, 8).toString(); // 응답받은 주소 추출

    // 인버터 국번 비교
    if (!_.eq(reqId, resId)) {
      throw new Error(`Not Matching ReqAddr: ${reqId}, ResAddr: ${resId}`);
    }

    // 수신 받은 데이터 체크섬 계산
    const calcChkSum = this.protocolConverter.getBufferChecksum(
      deviceData.slice(1, deviceData.length - 5),
    );
    // BU.CLI('calcChkSum', calcChkSum);

    // 체크섬 비교
    if (!_.isEqual(calcChkSum, resChkSum)) {
      throw new Error(
        `Not Matching Check Sum: ${calcChkSum}, Res Check Sum: ${resChkSum}`,
      );
    }

    // 비교
    if (reqAddr !== resAddr) {
      throw new Error(`Not Matching ReqAddr: ${reqAddr}, ResAddr: ${resAddr}`);
    }

    // 헤더와 체크섬을 제외한 데이터 계산
    const dataBody = responseData.slice(RES_DATA_START_POINT, responseData.length - 5);

    // 데이터 자동 산정
    let decodingTable;
    switch (resAddr) {
      case '0004':
        decodingTable = this.decodingTable.OPERATION;
        break;
      case '0020':
        decodingTable = this.decodingTable.PV;
        break;
      case '0050':
        decodingTable = this.decodingTable.GRID_VOL;
        break;
      case '0060':
        decodingTable = this.decodingTable.POWER;
        break;
      case '01e0':
        decodingTable = this.decodingTable.SYSTEM;
        break;
      default:
        throw new Error(`Can not find it Addr ${resAddr}`);
    }

    // BU.CLI(dataBody);

    const dataMap = this.automaticDecoding(decodingTable.decodingDataList, dataBody);

    // Trobule 목록을 하나로 합침
    dataMap.operTroubleList = [_.flatten(dataMap.operTroubleList)];

    return checkTripleInv(dataMap);
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: '01',
    mainCategory: 'Inverter',
    subCategory: 'hexPowerTriple',
  });

  const requestList = [
    '053031523030323030323031643704',
    '053031523030353030373031646604',
    '053031523030363030383031653104',
    '053031523030303430343031646204',
    '053031523030323030323031643704',
  ];

  const dataList = [
    '063031523030323030316237303133323033333504',
    '0630315230303530303138643031386630313930303063663030643630306331303235383038323404',
    '063031523030363030303838353936393030303030303838303066333030333630313336303361623038363804',
    '0630315230303034666666666666666630303030666666663036666604',
    '063031523030323030316364303063643033633404',
  ];

  dataList.forEach((data, index) => {
    const dataMap = converter.concreteParsingData(
      Buffer.from(data, 'hex'),
      Buffer.from(_.nth(requestList, index), 'hex'),
    );
    console.log(dataMap);
  });
}
