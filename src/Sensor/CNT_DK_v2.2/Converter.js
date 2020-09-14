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

    // 국번은 숫자로 변환하여 저장함.
    const { deviceId } = this.protocolInfo;
    if (Buffer.isBuffer(deviceId)) {
      this.protocolInfo.deviceId = deviceId.readInt8();
    } else if (_.isNumber(deviceId)) {
      this.protocolInfo.deviceId = deviceId;
    } else if (_.isString(deviceId)) {
      this.protocolInfo.deviceId = Buffer.from(deviceId).readInt8();
    }

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
    /** @type {modbusReadFormat[]} */
    const cmdList = this.defaultGenCMD(generationInfo);

    return this.makeDefaultCommandInfo(cmdList, 1000);
  }

  /**
   * 데이터 분석 요청
   * @param {number} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    // 0: SlaveAddr 1: FunctionCode, 2: DataLength, 3: Res Data (N*2)
    /** @type {modbusReadFormat} */
    const requestData = currTransferCmd;

    const { address: registerAddr, dataLength } = requestData;

    // 요청 시작 주소를 가져옴
    const startAddr = registerAddr;
    // 실제 시작하는 주소 세팅
    this.decodingTable.address = startAddr;

    // 실제 파싱 데이터 추출
    const dataBody = deviceData.slice(0, dataLength);

    /** @type {BASE_MODEL} */
    const returnValue = this.automaticDecodingIndex(this.decodingTable, dataBody);

    return returnValue;
  }
}
module.exports = Converter;

// 테스트
if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: '001',
    mainCategory: 'Sensor',
    subCategory: 'CNT_DK_v2.2',
  });

  BU.CLI(converter.generationCommand());

  const data = [3, 450, 65534, 450, 65533, 450, 65530, 450, 65534, 450, 65535, 450];

  const dataMap = converter.concreteParsingData(
    data,
    _.head(converter.generationCommand()).data,
  );
  BU.CLI('dataMap', dataMap);
}
