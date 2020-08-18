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

    const returnBufferList = cmdList.map(cmdInfo => {
      const { fnCode } = cmdInfo;

      switch (fnCode) {
        case 4:
          return this.getReadInputRegesterCmd(cmdInfo);
        default:
          return [];
      }
    });

    return this.makeAutoGenerationCommand(returnBufferList);
  }

  /**
   * FnCode 04, ReadInputRegister
   * @param {modbusReadFormat} readFormat
   */
  getReadInputRegesterCmd(readFormat) {
    const { unitId, fnCode, address = 0, dataLength } = readFormat;
    return Buffer.concat([
      this.protocolConverter.convertNumToWriteInt(unitId),
      this.protocolConverter.convertNumToWriteInt(fnCode),
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
    /**
     * 요청한 명령 추출
     * @type {Buffer}
     */
    const reqBuffer = currTransferCmd;
    const slaveAddr = reqBuffer.readIntBE(0, 1);
    const fnCode = reqBuffer.readIntBE(1, 1);

    /** @type {Buffer} */
    const resBuffer = deviceData;

    // 수신받은 데이터 2 Byte Hi-Lo 형식으로 파싱
    const resSlaveAddr = resBuffer.readIntBE(0, 1);
    const resFnCode = resBuffer.readIntBE(1, 1);

    // 같은 slaveId가 아닐 경우
    if (!_.isEqual(slaveAddr, resSlaveAddr)) {
      throw new Error(`The expected slaveId: ${slaveAddr}. but received slaveId: ${resSlaveAddr} `);
    }

    // 수신받은 Function Code가 다를 경우
    if (!_.isEqual(fnCode, resFnCode)) {
      throw new Error(`The expected fnCode: ${fnCode}. but received fnCode: ${resFnCode}`);
    }

    let result;
    // 해당 프로토콜에서 생성된 명령인지 체크
    switch (fnCode) {
      case 4:
        result = this.refineReadInputRegister(resBuffer, reqBuffer);
        break;
      default:
        throw new Error(`Not Matching FnCode ${fnCode}`);
    }
    return result;
  }

  /**
   * FnCode 04, Read Input Register
   * @param {Buffer} resBuffer Read Input Register
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
