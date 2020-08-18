const _ = require('lodash');
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
   * @param {generationInfo} generationInfo 각 Protocol Converter에 맞는 데이터
   * @return {commandInfo[]} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(generationInfo) {
    // BU.CLI(generationInfo);
    const cmdList = this.defaultGenCMD(generationInfo);
    // BU.CLI(cmdList);
    return this.makeDefaultCommandInfo(cmdList);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData) {
    // BU.CLI(deviceData.toString());

    let decodingTable = this.decodingTable.MAIN_SITE;

    if (_.get(this.protocolInfo, 'option.isNormal')) {
      decodingTable = this.decodingTable.MAIN_SITE;
    } else {
      decodingTable = this.decodingTable.PV_SITE;
    }

    const strData = deviceData.toString();

    const splitedStrData = _.split(strData, ' ');

    // 총 4센서 데이터 체크
    const validIndex = [3, 5, 7, 9];
    const sensorList = validIndex.map(index => _.toNumber(splitedStrData[index]));

    /** @type {BASE_MODEL} */
    const returnValue = this.automaticDecodingIndex(decodingTable, sensorList);
    // 계측 시간을 포함할 경우

    return returnValue;
  }

  /**
   *
   * @param {Buffer} deviceData
   */
  testParsingData(deviceData) {
    BU.CLI(deviceData.toString());
    const decodingTable = this.decodingTable.MAIN_SITE;
    const strData = deviceData.toString();

    const splitedStrData = _.split(strData, ' ');

    // 총 4센서 데이터 체크
    const validIndex = [3, 5, 7, 9];
    const sensorList = validIndex.map(index => _.toNumber(splitedStrData[index]));

    /** @type {BASE_MODEL} */
    const returnValue = this.automaticDecodingIndex(decodingTable, sensorList);
    // 계측 시간을 포함할 경우

    return returnValue;
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    mainCategory: 'Sensor',
    subCategory: 'EanEnv',
    protocolOptionInfo: {
      hasTrackingData: true,
    },
  });

  const genMsg = converter.generationCommand({
    key: converter.model.device.DEFAULT.KEY,
    value: 2,
  });

  BU.CLIN(genMsg);

  const dataList = [': 21 rtd0 24.4 rtd1 24.8 rtd2 24.9 rtd3 1000.0 '];

  dataList.forEach(data => {
    const result = converter.testParsingData(Buffer.from(data));
    BU.CLI(result);
  });

  // converter.testParsingData(Buffer.from(dataList, 'ascii'));
}
