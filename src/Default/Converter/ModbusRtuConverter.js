const _ = require('lodash');
const { BU } = require('base-util-jh');

const AbstConverter = require('../AbstConverter');

module.exports = class extends AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   * @param {AbstBaseModel} Model
   */
  constructor(protocolInfo, Model) {
    super(protocolInfo);

    // 국번은 숫자로 변환하여 저장함.
    const { deviceId } = protocolInfo;
    if (Buffer.isBuffer(deviceId)) {
      protocolInfo.deviceId = deviceId.readInt8();
    } else if (_.isNumber(deviceId)) {
      protocolInfo.deviceId = deviceId;
    } else if (_.isString(deviceId)) {
      protocolInfo.deviceId = Buffer.from(deviceId).readInt8();
    }

    // SM Modbus 형식인지 여부, SM Converter라면 Req, Res CRC는 존재하지 않음
    this.isExistCrc = true;

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
    /** @type {modbusReadFormat[]} */
    const cmdList = this.defaultGenCMD(generationInfo);

    const returnBufferList = cmdList.map(cmdInfo =>
      this.generationModbusCommand(cmdInfo),
    );

    return this.makeAutoGenerationCommand(returnBufferList);
  }

  /**
   *
   * @param {modbusReadFormat} cmdInfo
   */
  generationModbusCommand(cmdInfo) {
    const { unitId, fnCode } = cmdInfo;

    const header = Buffer.concat([
      this.protocolConverter.convertNumToWriteInt(unitId),
      this.protocolConverter.convertNumToWriteInt(fnCode),
    ]);

    let data = Buffer.alloc(0);

    switch (fnCode) {
      case 1:
      case 3:
      case 4:
        data = this.getReadInputRegesterCmd(cmdInfo);
        break;
      default:
        return [];
    }
    // CRC를 제외한 요청 데이터 Packet
    let command = Buffer.concat([header, data]);
    // CRC를 사용할 경우
    if (this.isExistCrc) {
      const crcBuf = this.protocolConverter.getModbusChecksum(command);
      command = Buffer.concat([command, crcBuf]);
    }

    return command;
  }

  /**
   * FnCode 04, ReadInputRegister
   * @param {modbusReadFormat} readFormat
   */
  getReadInputRegesterCmd(readFormat) {
    const { address = 0, dataLength } = readFormat;
    return Buffer.concat([
      this.protocolConverter.convertNumToWriteInt(address, { allocSize: 2 }),
      this.protocolConverter.convertNumToWriteInt(dataLength, { allocSize: 2 }),
    ]);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd) {
    // BU.CLIS(deviceData, currTransferCmd);
    /**
     * 요청한 명령 추출
     * @type {Buffer}
     */
    const reqBuffer = currTransferCmd;
    const slaveAddr = reqBuffer.readIntBE(0, 1);
    const fnCode = reqBuffer.readIntBE(1, 1);

    /** @type {Buffer} ModbusRTU Response Format, CRC는 제거하여 반환  */
    let resBuffer = deviceData;
    // 수신받은 데이터 2 Byte Hi-Lo 형식으로 파싱
    const resSlaveAddr = resBuffer.readIntBE(0, 1);
    const resFnCode = resBuffer.readIntBE(1, 1);

    // 같은 slaveId가 아닐 경우
    if (!_.isEqual(slaveAddr, resSlaveAddr)) {
      throw new Error(
        `The expected slaveId: ${slaveAddr}. but received slaveId: ${resSlaveAddr} `,
      );
    }

    // 수신받은 Function Code가 다를 경우
    if (!_.isEqual(fnCode, resFnCode)) {
      throw new Error(
        `The expected fnCode: ${fnCode}. but received fnCode: ${resFnCode}`,
      );
    }

    // CRC를 사용할 경우 직접 계산한 CRC 값과 수신받은 데이터에서 제시하는 CRC 값 비교
    if (this.isExistCrc) {
      // Last Buffer 쓰레기 FF 들어올 경우 삭제 (SM Modbus에서 해당 증상 발견)
      if (resBuffer.readUInt8(resBuffer.length - 1) === 0xff) {
        resBuffer = resBuffer.slice(0, resBuffer.length - 1);
      }

      // CRC를 계산하기 위한 값(맨 끝 2Byte)
      const crcIndexOf = resBuffer.length - 2;
      // 수신받은 데이터에 입력되어있는 CRC 값
      const resCrcCode = resBuffer.slice(crcIndexOf, resBuffer.length); // 응답 buffer의 crc코드
      // 수신받은 데이터의 CRC를 산출 공식에 대입하여 추출
      const calcCrcCode = this.protocolConverter.getModbusChecksum(
        resBuffer.slice(0, crcIndexOf),
      );
      // CRC를 제거하고 반환 (SM Modbus 프로토콜과의 병행을 고려하여 처리)
      resBuffer = resBuffer.slice(0, crcIndexOf);

      if (!_.isEqual(calcCrcCode, resCrcCode)) {
        throw new TypeError(
          `Not Matching calculated CrcCode: ${calcCrcCode}, responsed CrcCode: ${resCrcCode}`,
        );
      }
    }

    let result;
    // 해당 프로토콜에서 생성된 명령인지 체크
    switch (fnCode) {
      case 1:
        result = this.refineReadCoil(resBuffer, reqBuffer);
        break;
      case 3:
        result = this.refineReadHoldingRegister(resBuffer, reqBuffer);
        break;
      case 4:
        result = this.refineReadInputRegister(resBuffer, reqBuffer);
        break;
      default:
        throw new Error(`Not Matching FnCode ${fnCode}`);
    }
    return result;
  }

  /**
   * FnCode 01, Read Coil. 순수 Spec Data 반환
   * @param {Buffer} resBuffer CRC 제거된 Read Coil
   * @param {Buffer} reqBuffer 현재 요청한 명령
   */
  refineReadCoil(resBuffer, reqBuffer) {
    // 0: SlaveAddr 1: FunctionCode, 2: DataLength, 3: Res Data (N)
    const RES_DATA_START_POINT = 3;

    const registerAddr = reqBuffer.readInt16BE(2);
    // 요청한 읽을 비트 개수를 Byte로 환산. 올림 처리
    const dataLength = Math.ceil(reqBuffer.readInt16BE(4) / 8);

    // 수신받은 데이터 2 Byte Hi-Lo 형식으로 파싱
    const resDataLength = resBuffer.slice(RES_DATA_START_POINT).length;
    // Coil 데이터
    const dataBody = resBuffer.slice(RES_DATA_START_POINT);

    // 수신받은 데이터의 길이가 다를 경우
    if (!_.isEqual(dataLength, resDataLength)) {
      throw new Error(
        `The expected dataLength: ${dataLength}. but received dataLength: ${resDataLength}`,
      );
    }

    return {
      dataBody: this.protocolConverter.convertHexToBitArray(dataBody),
      registerAddr,
    };
  }

  /**
   * FnCode 03, Read Holding Register. 순수 Spec Data 반환
   * @param {Buffer} resBuffer CRC 제거된 Read Holding Register
   * @param {Buffer} reqBuffer 현재 요청한 명령
   */
  refineReadHoldingRegister(resBuffer, reqBuffer) {
    return this.refineReadInputRegister(resBuffer, reqBuffer);
  }

  /**
   * FnCode 04, Read Input Register. 순수 Spec Data 반환
   * @param {Buffer} resBuffer CRC 제거된 Read Input Register
   * @param {Buffer} reqBuffer 현재 요청한 명령
   */
  refineReadInputRegister(resBuffer, reqBuffer) {
    // 0: SlaveAddr 1: FunctionCode, 2: DataLength, 3: Res Data (N*2)
    const RES_DATA_START_POINT = 3;

    const registerAddr = reqBuffer.readInt16BE(2);
    const dataLength = reqBuffer.readInt16BE(4);

    // 수신받은 데이터 2 Byte Hi-Lo 형식으로 파싱
    const resDataLength = resBuffer.slice(RES_DATA_START_POINT).length;

    const dataBody = resBuffer.slice(RES_DATA_START_POINT);

    // 수신받은 데이터의 길이가 다를 경우 (수신데이터는 2 * N 이므로 기대 값의 길이에 2를 곱함)
    if (!_.isEqual(_.multiply(dataLength, 2), resDataLength)) {
      throw new Error(
        `The expected dataLength: ${dataLength}. but received dataLength: ${resDataLength}`,
      );
    }

    return {
      dataBody,
      registerAddr,
    };
  }
};
