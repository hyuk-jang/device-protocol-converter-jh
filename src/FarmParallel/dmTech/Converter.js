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

    // 국번은 숫자로 변환하여 저장함.
    const { deviceId } = this.protocolInfo;
    if (Buffer.isBuffer(deviceId)) {
      this.protocolInfo.deviceId = deviceId.readInt8();
    } else if (_.isNumber(deviceId)) {
      this.protocolInfo.deviceId = deviceId;
    } else if (_.isString(deviceId)) {
      this.protocolInfo.deviceId = Buffer.from(deviceId).readInt8();
    }

    this.decodingTable = protocol.decodingProtocolTable(this.protocolInfo);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;

    /** BaseModel */
    this.model = new Model(this.protocolInfo);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @override
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
        this.protocolConverter.convertNumToWriteInt(unitId),
        this.protocolConverter.convertNumToWriteInt(fnCode),
        this.protocolConverter.convertNumToWriteInt(address, { allocSize: 2 }),
        this.protocolConverter.convertNumToWriteInt(dataLength, { allocSize: 2 }),
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
    const resDataLength = resBuffer.slice(RES_DATA_START_POINT).length;

    // BU.CLI(resBuffer);
    // BU.CLIS(dataLength, resDataLength);

    // 같은 slaveId가 아닐 경우
    if (!_.isEqual(slaveAddr, resSlaveAddr)) {
      throw new Error(`The expected slaveId: ${slaveAddr}. but received slaveId: ${resSlaveAddr} `);
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

    /** @type {decodingProtocolInfo} */
    let decodingTable;
    // NOTE: 모듈 후면 온도, 경사 일사량이 붙어 있는 로거
    const pvRearTempTableList = [1, 4];
    // NOTE: 모듈 하부 일사량이 붙어 있는 로거
    const inclinedSolarTableList = [3, 6];
    // NOTE: 모듈 하부 일사량이 붙어 있는 로거
    const pvUnderyingSolarTableList = [2, 5];
    // NOTE: 추가 일사량 4기 로거
    const fourSolarSiteList = [31, 32, 33, 34, 35, 36];
    // NOTE: 외기 환경 데이터 로거 번호
    const horizontalSiteList = [7, 9, 11, 13, 16];
    // 장치 addr
    const numDeviceId = this.protocolInfo.deviceId;

    if (_.includes(pvRearTempTableList, numDeviceId)) {
      decodingTable = this.decodingTable.PRT_SITE;
    } else if (_.includes(inclinedSolarTableList, numDeviceId)) {
      decodingTable = this.decodingTable.INCLINED_SITE;
    } else if (_.includes(horizontalSiteList, numDeviceId)) {
      decodingTable = this.decodingTable.HORIZONTAL_SITE;
    } else if (_.includes(fourSolarSiteList, numDeviceId)) {
      decodingTable = this.decodingTable.FOUR_SOLAR_SITE;
    } else {
      decodingTable = this.decodingTable.PUS_SITE;
    }
    // 요청 시작 주소를 가져옴
    const startAddr = registerAddr;
    // 실제 시작하는 주소 세팅
    decodingTable.address = startAddr;

    // 실제 파싱 데이터 추출
    const dataBody = resDataList.slice(0, requestData.dataLength);

    // FIXME: 실제 현장에서의 간헐적인 00000000000000 데이터 처리를 위함. 해당 데이터는 사용하지 않음
    if (dataBody.every(v => v === 0)) {
      return BASE_MODEL;
    }

    /** @type {BASE_MODEL} */
    const returnValue = this.automaticDecodingForArray(decodingTable, dataBody);
    // 계측 시간을 포함할 경우

    return returnValue;
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: 10,
    mainCategory: 'FarmParallel',
    subCategory: 'dmTech',
    protocolOptionInfo: {
      hasTrackingData: true,
    },
  });

  BU.CLI(converter.generationCommand());

  const testReqMsg = '025301040000000c03';
  const realTestReqMsg = Buffer.from(testReqMsg.slice(4, testReqMsg.length - 2), 'hex');

  const dataList = ['0253010418015c035002b601db01f201f002e40000000000000000000003'];

  dataList.forEach(d => {
    const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');

    // const result = converter.testParsingData(realBuffer);
    // BU.CLI(result);
    const dataMap = converter.concreteParsingData(realBuffer, realTestReqMsg);
    BU.CLI(dataMap);
  });

  // converter.testParsingData(Buffer.from(dataList, 'ascii'));
}
