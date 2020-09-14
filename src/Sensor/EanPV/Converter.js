const _ = require('lodash');
const moment = require('moment');
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
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {Buffer[]} cmdBufferList 각 Protocol Converter에 맞는 데이터
   * @return {commandInfo[]} 장치를 조회하기 위한 명령 리스트 반환
   */
  designationCommand(cmdBufferList) {
    return cmdBufferList.map(cmdBuffer => {
      /** @type {commandInfo} */
      const command = {
        data: cmdBuffer,
        commandExecutionTimeoutMs: 100,
      };
      return command;
    });
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
    const requestData = currTransferCmd;

    const receiveNumData = _.toNumber(_.toString(deviceData));

    // BU.CLIS(requestData, receiveNumData);

    const { STATUS_POWER, STATUS } = this.model.device.DEFAULT.COMMAND;

    const dataStorage = Model.BASE_MODEL;

    // 전력 계측 명령이었다면
    if (_.findIndex(STATUS, buf => _.isEqual(buf, requestData)) >= 0) {
      const foundIndex = _.findIndex(STATUS, buf => _.isEqual(buf, requestData));
      switch (foundIndex) {
        case 0:
          dataStorage.pvVol.push(receiveNumData);
          break;
        case 1:
          dataStorage.pvAmp.push(receiveNumData);
          break;
        case 2:
          dataStorage.pvW.push(receiveNumData);
          break;
        default:
          dataStorage.operIsRun.push(receiveNumData);
          break;
      }
    } else if (_.findIndex(STATUS_POWER, buf => _.isEqual(buf, requestData)) >= 0) {
      dataStorage.operIsRun.push(receiveNumData);
    }

    return dataStorage;
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  const converter = new Converter({
    mainCategory: 'Sensor',
    subCategory: 'EanPV',
  });

  const cmdStatusPower = converter.designationCommand(
    converter.model.device.DEFAULT.COMMAND.STATUS_POWER,
  );

  BU.CLI(cmdStatusPower.map(info => _.toString(info.data)));
  const cmdWakeUp = converter.designationCommand(
    converter.model.device.DEFAULT.COMMAND.WAKEUP,
  );
  BU.CLI(cmdWakeUp.map(info => _.toString(info.data)));
  const cmdStatus = converter.generationCommand({ key: 'DEFAULT', value: 2 });
  BU.CLI(cmdStatus);
  BU.CLI(cmdStatus.map(info => _.toString(info.data)));

  // BU.CLIN(converter.model);

  const statusPowerData = ['1'];
  const statusDataList = ['10.1', '3.7', '26.1'];

  // statusPowerData.forEach((data, index) => {
  //   const result = converter.concreteParsingData(
  //     data,
  //     converter.model.device.DEFAULT.COMMAND.STATUS_POWER[index],
  //   );
  //   BU.CLI(result);
  // });

  // statusDataList.forEach((data, index) => {
  //   const result = converter.concreteParsingData(
  //     data,
  //     converter.model.device.DEFAULT.COMMAND.STATUS[index],
  //   );
  //   BU.CLI(result);
  // });
}
