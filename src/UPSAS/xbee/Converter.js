const _ = require('lodash');
const xbeeApi = require('xbee-api');
const { BU } = require('base-util-jh');

const AbstConverter = require('../../Default/AbstConverter');
const Model = require('./Model');
const protocol = require('./protocol');

class Converter extends AbstConverter {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super(protocolInfo);

    this.decodingTable = protocol.decodingProtocolTable(protocolInfo.deviceId);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;
    this.xbeeAPI = new xbeeApi.XBeeAPI();
    this.frameIdList = [];

    /** BaseModel */
    this.model = new Model(protocolInfo);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {Array.<commandInfo>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    /** @type {Array.<commandInfoModel>} */
    const cmdList = this.defaultGenCMD(generationInfo);
    /** @type {Array.<commandInfo>} */
    const returnValue = [];

    // BU.CLI(cmdList);
    cmdList.forEach(cmdInfo => {
      /** @type {commandInfo} */
      const commandObj = {};
      const frameId = this.xbeeAPI.nextFrameId();
      /** @type {xbeeApi_0x10} */
      const frameObj = {
        type: 0x10,
        id: frameId,
        destination64: this.protocolInfo.deviceId,
        data: cmdInfo.cmd,
      };
      commandObj.data = frameObj;
      commandObj.commandExecutionTimeoutMs = 1000 * 2;
      commandObj.delayExecutionTimeoutMs = _.isNumber(cmdInfo.timeout) && cmdInfo.timeout;
      returnValue.push(commandObj);
    });
    return returnValue;
  }

  /**
   * 데이터 분석 요청
   * @param {xbeeApi_0x8B|xbeeApi_0x90} deviceData 응답받은 데이터
   * @param {xbeeApi_0x10} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    // BU.CLIS(deviceData, currTransferCmd);
    // string 형식이 다를 수 있으므로 대문자로 모두 변환
    const reqId = _.toUpper(currTransferCmd.destination64);
    const resId = _.toUpper(deviceData.remote64);
    // 비교
    if (!_.eq(reqId, resId)) {
      throw new Error(`Not Matching ReqAddr: ${reqId}, ResAddr: ${resId}`);
    }

    let result;
    // 해당 프로토콜에서 생성된 명령인지 체크
    switch (deviceData.type) {
      case 0x88:
        result = this.processDataResponseAT();
        break;
      case 0x90:
        result = this.processDataReceivePacketZigBee(deviceData);
        break;
      default:
        throw new Error(`Not Matching Type ${deviceData.type}`);
    }
    return result;
  }

  /**
   *
   * @param {xbeeApi_0x88} xbeeApi0x88
   */
  processDataResponseAT(xbeeApi0x88) {}

  /**
   *
   * @param {xbeeApi_0x90} xbeeApi0x90
   */
  processDataReceivePacketZigBee(xbeeApi0x90) {
    // BU.CLI(xbeeApi0x90);
    const { data } = xbeeApi0x90;

    const STX = _.nth(data, 0);
    // STX 체크 (# 문자 동일 체크)
    if (!_.isEqual(STX, 0x23)) {
      throw new Error('STX가 일치하지 않습니다.');
    }
    // let boardId = data.slice(1, 5);
    // BU.CLI(data.toString());
    let productType = data.slice(5, 9);
    const dataBody = data.slice(9);

    let decodingDataList;
    if (!_.isBuffer(productType)) {
      throw new Error(`productType: ${productType}이 이상합니다.`);
    }
    productType = this.protocolConverter.convertBufToStrToNum(productType);

    switch (productType) {
      case 1:
        decodingDataList =
          dataBody.toString().length === 12
            ? this.decodingTable.gateLevelSalinity
            : this.decodingTable.newGateLevelSalinity;
        break;
      case 2:
        decodingDataList =
          dataBody.toString().length === 20
            ? this.decodingTable.valve
            : this.decodingTable.salternBlockValve;
        // BU.CLI(dataBody.toString().length, decodingDataList);
        // decodingDataList = this.decodingTable.valve;
        break;
      case 3:
        decodingDataList = this.decodingTable.pump;
        break;
      case 5:
        decodingDataList = this.decodingTable.earthModule;
        break;
      case 6:
        decodingDataList = this.decodingTable.connectorGroundRelay;
        break;
      case 12:
        decodingDataList = this.decodingTable.envModuleTemp;
        break;
      default:
        throw new Error(`productType: ${productType}은 Parsing 대상이 아닙니다.`);
    }

    const hasValid = _.chain(decodingDataList.decodingDataList)
      .map(row => _.get(row, 'byte', 1))
      .sum()
      .isEqual(dataBody.length)
      .value();

    if (!hasValid) {
      throw new Error(
        `The expected length(${decodingDataList.bodyLength}) 
              of the data body is different from the length(${dataBody.length}) received.`,
      );
    }

    const resultAutomaticDecoding = this.automaticDecoding(
      decodingDataList.decodingDataList,
      dataBody,
    );

    return resultAutomaticDecoding;
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: 10,
    subDeviceId: '11',
    mainCategory: 'UPSAS',
    subCategory: 'muan100kW',
    protocolOptionInfo: {
      hasTrackingData: true,
    },
  });

  const cmdInfo = converter.generationCommand({
    key: 'pump',
    value: 1,
    nodeInfo: {
      data_logger_index: 8,
    },
  });

  console.dir(cmdInfo);

  /** @type {xbeeApi_0x90[]} */
  const dataList = [
    // {
    //   data: Buffer.from('#0001001111.122.233.3+444.4-555.5'),
    // },
    // {
    //   data: Buffer.from('#00010002022351000.00999.909.6'),
    // },
    {
      data: Buffer.from('#00010012223111.029.9'),
    },
    // {
    //   data: Buffer.from('#000100030101010101010101'),
    // },
  ];

  dataList.forEach(d => {
    const dataMap = converter.processDataReceivePacketZigBee(d);
    console.log(dataMap);
  });

  // converter.testParsingData(Buffer.from(dataList, 'ascii'));
}
