const _ = require('lodash');
const { BU } = require('base-util-jh');

const Model = require('./Model');
const protocol = require('./protocol');

const AbstConverter = require('../../Default/AbstConverter');
// const XbeeConverter = require('../../Default/Converter/XbeeConverter');
const { protocolConverter } = require('../../Default/DefaultModel');

const {
  di: {
    dcmConfigModel: { reqDeviceControlType },
  },
} = require('../../module');

class Converter extends AbstConverter {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super(protocolInfo);

    this.decodingTable = protocol.decodingProtocolTable(protocolInfo.deviceId);
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
    const { MEASURE } = reqDeviceControlType;
    const { key = 'DEFAULT', value = MEASURE } = generationInfo;
    const { deviceId } = this.protocolInfo;

    let cmdList;
    // 일반 계측일 경우
    if (key === 'DEFAULT' && value === MEASURE) {
      if (deviceId === '0013A2004190ED67') {
        cmdList = this.model.device.SHUTTER.COMMAND.STATUS;
      } else if (deviceId === '0013A2004190EDB7') {
        cmdList = this.model.device.PUMP.COMMAND.STATUS;
      }
    } else {
      cmdList = this.defaultGenCMD(generationInfo);
    }
    // BU.CLI(generationInfo);
    // BU.CLI(cmdList);
    return this.makeAutoGenerationCommand(cmdList);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    // STX 체크 (# 문자 동일 체크)
    // BU.CLI(deviceData);
    const STX = _.nth(deviceData, 0);
    // BU.CLI(STX);
    if (STX !== 0x23) {
      throw new Error('STX가 일치하지 않습니다.');
    }

    const productType = deviceData.slice(5, 9).toString();
    const dataBody = deviceData.slice(9);

    let decodingDataList;
    switch (productType) {
      case '0011':
        decodingDataList = this.decodingTable.pump;
        break;
      case '0012':
        decodingDataList = this.decodingTable.shutter;
        break;
      default:
        throw new Error(`productType: ${productType}은 Parsing 대상이 아닙니다.`);
    }

    // 디코딩 테이블의 파싱 데이터 길이를 합산
    const resultAutomaticDecoding = this.automaticDecoding(
      decodingDataList.decodingDataList,
      dataBody,
    );

    return resultAutomaticDecoding;
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  // const deviceId = '0013A2004190ED67';
  const deviceId = '0013A2004190EDB7';
  const converter = new Converter({
    // deviceId: '0013A20012345678',
    deviceId,
    mainCategory: 'S2W',
    subCategory: 'sm',
    protocolOptionInfo: {
      hasTrackingData: true,
    },
  });

  const cmdInfo = converter.generationCommand({
    // key: 'shutter',
    value: 2,
    nodeInfo: {
      data_logger_index: 4,
    },
  });

  console.log(cmdInfo);

  const testReqMsg = '02497e001210010013a2004190ed67fffe0000407374737d03';
  const realTestReqMsg = Buffer.from(testReqMsg.slice(4, testReqMsg.length - 2), 'hex');

  const onDataList = [
    '024923303030313030313231322e304d3030303030303030313131313131313103',
    // '02537e002a900013a2004190ed67fffe0123303030313030313231302e324131313131303131313131303131303031e203',
  ];

  onDataList.forEach(d => {
    const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');
    // BU.CLI(realBuffer);

    const dataMap = converter.concreteParsingData(realBuffer, realTestReqMsg);
    console.log(dataMap);
  });
}
