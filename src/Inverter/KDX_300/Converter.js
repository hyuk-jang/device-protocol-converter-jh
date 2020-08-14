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

    // FIXME: Function Code 04 기준으로만 작성됨.  필요시 수정
    const returnBufferList = cmdList.map(cmdInfo => {
      const { unitId, fnCode, address, dataLength } = cmdInfo;

      const bodyBufferList = [
        this.protocolConverter.convertNumToWriteInt(unitId),
        this.protocolConverter.convertNumToWriteInt(fnCode),
        this.protocolConverter.convertNumToWriteInt(address, { allocSize: 2 }),
        this.protocolConverter.convertNumToWriteInt(dataLength, { allocSize: 2 }),
      ];

      const bodyBuffer = Buffer.concat(bodyBufferList);

      const crcBuffer = this.model.makeCrcCode(bodyBuffer);

      const returnBuffer = Buffer.concat([bodyBuffer, crcBuffer]);
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

    BU.CLI(registerAddr);

    // 데이터 끝부분에 ff 들어오는 부분 제거 (dataLength * 2, mbap Header, ff(1byte))
    if (deviceData.length === _.sum([_.multiply(dataLength, 2), 5, 1])) {
      deviceData = deviceData.slice(0, deviceData.length - 1);
    }

    // BU.CLI(requestData);

    /** @type {Buffer} */
    const resBuffer = deviceData;

    BU.CLI(resBuffer);

    // 수신받은 데이터 2 Byte Hi-Lo 형식으로 파싱
    const recSlaveAddr = resBuffer.readIntBE(0, 1);
    const recFnCode = resBuffer.readIntBE(1, 1);
    const crcIndexOf = resBuffer.length - 2;
    const recDataLength = resBuffer.slice(RES_DATA_START_POINT, crcIndexOf).length;
    const recCrcCode = resBuffer.slice(crcIndexOf, resBuffer.length); // 응답 buffer의 crc코드
    const calcCrcCode = this.model.makeCrcCode(resBuffer.slice(0, crcIndexOf));
    // BU.CLI(resCrcCode);

    // BU.CLI(resBuffer);
    // BU.CLIS(dataLength, resDataLength);

    const realExpectDataLength = _.multiply(dataLength, 2);

    // FIXME: 수신받은 데이터의 길이가 다를 경우 (수신데이터는 2 * N 이므로 기대 값의 길이에 2를 곱함)
    // if (recDataLength !== realExpectDataLength) {
    //   const msg = `The expected dataLength: ${realExpectDataLength}. but received dataLength: ${recDataLength}`;
    //   // 데이터가 다 오지 않은 것으로 판단. DBS에 에러코드를 보내지 않고 데이터 기다림
    //   if (recDataLength < realExpectDataLength) {
    //     throw new RangeError(msg);
    //   }
    //   throw new Error(msg);
    // }

    // 같은 slaveId가 아닐 경우
    if (!_.isEqual(slaveAddr, recSlaveAddr)) {
      throw new Error(`The expected slaveId: ${slaveAddr}. but received slaveId: ${recSlaveAddr} `);
    }

    // 수신받은 Function Code가 다를 경우
    if (!_.isEqual(fnCode, recFnCode)) {
      throw new Error(`The expected fnCode: ${fnCode}. but received fnCode: ${recFnCode}`);
    }

    // 응답, 요청 CRC코드 비교
    if (!_.isEqual(calcCrcCode, recCrcCode)) {
      throw new TypeError(
        `Not Matching calculated CrcCode: ${calcCrcCode}, responsed CrcCode: ${recCrcCode}`,
      );
    }

    /** @type {decodingProtocolInfo} */
    let decodingTable;

    // 데이터 테이블 보정 계수 적용을 위한 데이터
    if (registerAddr === 45) {
      decodingTable = this.decodingTable.RESET_DATA_UNIT;
    } else {
      decodingTable = this.decodingTable.DEFAULT;
    }

    const sliceLength = decodingTable.decodingDataList.reduce((totalByte, decodingInfo) => {
      return totalByte + _.get(decodingInfo, 'byte', 1);
    }, 0);

    // 자릿수 단위
    const dataUnitStartIndex = 45;
    const dataUnitBuffer = resBuffer.slice(RES_DATA_START_POINT + dataUnitStartIndex);

    /** @type {BASE_MODEL} */
    const returnValue = this.automaticDecoding(
      decodingTable.decodingDataList,
      resBuffer.slice(RES_DATA_START_POINT, RES_DATA_START_POINT + sliceLength),
      // resBuffer.slice(RES_DATA_START_POINT, resBuffer.length - 2),
    );
    // 계측 시간을 포함할 경우

    BU.CLI(this.decodingTable.DEFAULT);

    return returnValue;
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

  console.log('requestMsg', requestMsg);
  const data = Buffer.from(
    '08040410203131b3ca',
    // '024908043c097b0000097c097c0000000002620000000005c30000000005c3009200000000009205ca0000000005ca03e20000000003e21772001bb22200000000bcf703',
    // '02490104041020212126c603',
    // '024901043c090e0000090e090e0000000003720000000000cb0000000000cb001900000000001900cc0000000000cc03e00000000003e017730000306300000001b09a03',
    'hex',
  );

  const dataMap = converter.concreteParsingData(data, _.head(converter.generationCommand()).data);
  // BU.CLI('dataMap', dataMap);
}

// 024901040000001e700203
// 024905040000001e718603
