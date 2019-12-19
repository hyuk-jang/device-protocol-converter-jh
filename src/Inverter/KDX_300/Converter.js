const _ = require('lodash');
const crc = require('crc');

const { BU } = require('base-util-jh');

const protocol = require('./protocol');
const Model = require('./Model');
const { BASE_MODEL } = require('./Model');
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
      BU.CLI(cmdInfo);

      const bodyBufferList = [
        this.protocolConverter.convertNumToHxToBuf(unitId, 1),
        this.protocolConverter.convertNumToHxToBuf(fnCode, 1),
        this.protocolConverter.convertNumToHxToBuf(address, 2),
        this.protocolConverter.convertNumToHxToBuf(dataLength, 2),
      ];
      // BU.CLI(bodyBufferList);

      const bodyBuffer = Buffer.concat(bodyBufferList);
      // BU.CLI(bodyBuffer);

      const crcBuffer = this.model.makeCrcCode(bodyBuffer);

      // BU.CLI(crcBuffer);

      const returnBuffer = Buffer.concat([bodyBuffer, crcBuffer]);
      return returnBuffer;
    });

    // BU.CLI(returnBufferList);

    return this.makeAutoGenerationCommand(returnBufferList);
  }

  /**
   * 데이터 분석 요청
   * @param {number[]} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    try {
      // BU.CLIS(deviceData, currTransferCmd);
      // 0: SlaveAddr 1: FunctionCode, 2: DataLength, 3: Res Data (N*2)
      const RES_DATA_START_POINT = 3;
      /**
       * 요청한 명령 추출
       * @type {Buffer}
       */
      const requestData = currTransferCmd;
      const slaveAddr = requestData.readIntBE(0, 1);
      const fnCode = requestData.readIntBE(1, 1);
      const registerAddr = requestData.readInt16BE(2);
      const dataLength = requestData.readInt16BE(4);

      // BU.CLI(requestData);

      /** @type {Buffer} */
      const resBuffer = deviceData;

      // 수신받은 데이터 2 Byte Hi-Lo 형식으로 파싱
      const resSlaveAddr = resBuffer.readIntBE(0, 1);
      const resFnCode = resBuffer.readIntBE(1, 1);
      const crcIndexOf = resBuffer.length - 2;
      const resDataLength = resBuffer.slice(RES_DATA_START_POINT, crcIndexOf).length;
      const resCrcCode = resBuffer.slice(crcIndexOf, resBuffer.length); // 응답 buffer의 crc코드
      const calcCrcCode = this.model.makeCrcCode(resBuffer.slice(0, crcIndexOf));
      // BU.CLI(resCrcCode);

      // BU.CLI(resBuffer);
      // BU.CLIS(dataLength, resDataLength);

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
          `The expected dataLength: ${_.multiply(
            dataLength,
            2,
          )}. but received dataLength: ${resDataLength}`,
        );
      }
      // 응답, 요청 CRC코드 비교
      if (!_.isEqual(calcCrcCode, resCrcCode)) {
        throw new Error(
          `Not Matching calculated CrcCode: ${calcCrcCode}, responsed CrcCode: ${resCrcCode}`,
        );
      }

      // BU.CLI(resBuffer);
      // BU.CLI(resBuffer.slice(RES_DATA_START_POINT, resBuffer.length - 2));
      /** @type {BASE_MODEL} */
      const returnValue = this.automaticDecoding(
        this.decodingTable.decodingDataList,
        resBuffer.slice(RES_DATA_START_POINT, resBuffer.length - 2),
      );
      // 계측 시간을 포함할 경우

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
    deviceId: 8,
    mainCategory: 'Inverter',
    subCategory: 'KDX_300',
  });

  const requestMsg = converter.generationCommand({
    key: converter.model.device.DEFAULT.KEY,
  });

  const data = Buffer.from(
    '08043c08eb000008eb08eb00000000001c00000000000100000000000100400000000000400040000000000040000f00000000000f17700000314800000000f1d5',
    // '024908043c08eb000008eb08eb00000000001c00000000000100000000000100400000000000400040000000000040000f00000000000f17700000314800000000f1d503',
    'hex',
  );

  const dataMap = converter.concreteParsingData(data, _.head(converter.generationCommand()).data);
  BU.CLI('dataMap', dataMap);
}
