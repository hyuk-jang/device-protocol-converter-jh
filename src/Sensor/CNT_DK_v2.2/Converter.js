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

    // BU.CLI(cmdList);
    // FIXME: Function Code 04 기준으로만 작성됨.  필요시 수정
    const returnBufferList = cmdList.map(cmdInfo => {
      const { unitId, fnCode, address, dataLength } = cmdInfo;
      const returnBuffer = Buffer.concat([
        this.protocolConverter.convertNumToHxToBuf(unitId, 1),
        this.protocolConverter.convertNumToHxToBuf(fnCode, 1),
        this.protocolConverter.convertNumToHxToBuf(address, 2),
        this.protocolConverter.convertNumToHxToBuf(dataLength, 2),
      ]);
      return returnBuffer;
    });

    return this.makeAutoGenerationCommand(returnBufferList);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    try {
      // 0: SlaveAddr 1: FunctionCode, 2: DataLength, 3: Res Data (N*2)
      const RES_DATA_START_POINT = 3;

      /** @type {Buffer} */
      const requestData = currTransferCmd;
      const slaveAddr = requestData.readIntBE(0, 1);
      const fnCode = requestData.readIntBE(1, 1);
      const registerAddr = requestData.readInt16BE(2);
      const dataLength = requestData.readInt16BE(4);

      /** @type {Buffer} */
      const resBuffer = deviceData;

      // 수신받은 데이터 2 Byte Hi-Lo 형식으로 파싱
      const resSlaveAddr = resBuffer.readIntBE(0, 1);
      const resFnCode = resBuffer.readIntBE(1, 1);
      const resDataLength = resBuffer.slice(RES_DATA_START_POINT).length;

      // 같은 slaveId가 아닐 경우
      if (!_.isEqual(slaveAddr, resSlaveAddr)) {
        throw new Error(
          `The expected slaveId: ${slaveAddr}. but received slaveId: ${resSlaveAddr} `,
        );
      }

      // 수신받은 Function Code가 다를 경우
      if (!_.isEqual(fnCode, resFnCode)) {
        throw new Error(`The expected fnCode: ${fnCode}. but received fnCode: ${resFnCode}`);
      }

      // 수신받은 데이터의 길이가 다를 경우 (수신데이터는 2 * N 이므로 기대 값의 길이에 2를 곱함)
      if (!_.isEqual(_.multiply(dataLength, 2), resDataLength)) {
        throw new Error(
          `The expected dataLength: ${dataLength}. but received dataLength: ${resDataLength}`,
        );
      }

      // 실제 장치 데이터 배열화
      const resDataList = [];
      for (let index = RES_DATA_START_POINT; index < resBuffer.length; index += 2) {
        // BU.CLI(resBuffer.readUInt16BE(index));
        resDataList.push(resBuffer.readUInt16BE(index));
      }

      // 요청 시작 주소를 가져옴
      const startAddr = registerAddr;
      // 실제 시작하는 주소 세팅
      this.decodingTable.address = startAddr;

      // 실제 파싱 데이터 추출
      const dataBody = resDataList.slice(0, requestData.dataLength);

      /** @type {BASE_MODEL} */
      const returnValue = this.automaticDecodingForArray(this.decodingTable, dataBody);

      return returnValue;
    } catch (error) {
      throw error;
    }
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

  const data = Buffer.from(
    'R001,01,000000000000000000510020000000000176',
    // 'R001,02,00000000000000000051002000000000,000000000000000000510020000000000176',
  );

  const dataMap = converter.concreteParsingData(data, _.head(converter.generationCommand()).data);
  BU.CLI('dataMap', dataMap);
}
