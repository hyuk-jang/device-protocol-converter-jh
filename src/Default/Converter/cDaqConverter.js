const _ = require('lodash');
const { BU } = require('base-util-jh');

const AbstConverter = require('../AbstConverter');

const SLOT_TYPE = {
  VOLTAGE: 'voltage',
};

module.exports = class extends AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   * @param {AbstBaseModel} Model
   */
  constructor(protocolInfo, Model) {
    super(protocolInfo);

    // 국번은 Buffer로 변환하여 저장함.
    const {
      deviceId,
      subCategory,
      subDeviceId,
      option: {
        ni: { slotModelType },
      },
    } = this.protocolInfo;
    if (Buffer.isBuffer(deviceId)) {
      this.protocolInfo.deviceId = deviceId.toString();
    }
    /** BaseModel */
    this.model = new Model(protocolInfo);

    this.dataModel = Model.BASE_MODEL;

    // 추가적으로 장치 식별을 위한 정보를 subDeviceId로 정의함. subCategory와 연관성 없음
    // 여기서는 cDAQ 식별 Serial 정보
    this.cDaqSerial = subDeviceId.toString();
    // 슬롯 모델 Serial이 Data Logger 식별 정보이므로 Device Id로 책정
    this.cDaqSlotSerial = this.protocolInfo.deviceId;
    // 슬롯 모델 타입에 따라 Protocol 변환기가 세팅
    this.cDaqSlotType = slotModelType.toString();

    // 각 슬롯 모델별 취급 데이터 분류
    this.modelTypeInfo = {
      voltage: ['9201'],
      relay: ['9482'],
    };
    // 슬롯 타입에 따라 데이터 분류 Key 정의
    this.slotDataType = _.findKey(this.modelTypeInfo, slotTypeList => {
      return slotTypeList.includes(this.cDaqSlotType);
    });

    /** @type {number[]} 릴레이 데이터 4채널 0, 1 저장됨 */
    this.currRelayDataList = [];
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

    // 요청 명령 형식: STX(#[1]) + cDaqSerial(B[4])  modelType(A[4]) + slotSerial(B[4])
    // + FnCode(A[1]) + CMD(A[2]) + checksum(B[1]) + EOT(B[1])

    // 장치 모델 타입에 따라 명령 분기

    const returnBufferList = cmdList.map(reqCmdInfo => {
      const { fnCode, cmd } = reqCmdInfo;

      // BU.CLI(cmd.toString());

      const header = Buffer.from(
        `#${this.cDaqSerial}${this.cDaqSlotType}${this.cDaqSlotSerial}`,
      );

      const body = Buffer.from(`${fnCode}${cmd}`);

      // checksum 제외한 요청 데이터 Packet
      let command = Buffer.concat([header, body]);

      const checksum = this.protocolConverter.getSumBuffer(command);
      command = Buffer.concat([command, checksum, this.protocolConverter.EOT]);

      return command;
    });

    return this.makeAutoGenerationCommand(returnBufferList);
  }

  /**
   * Voltage 데이터 분석 요청
   * @param {Buffer} data 장치 상태 데이터
   * @param {nodeInfo[]} nodeList 해당 데이터 로거에 딸린 node 목록
   * @param {Object} dataModel 반환할 데이터를 담을 Model
   */
  refineVoltageData(data, nodeList, dataModel) {
    // BU.CLI(dataModel);
    // data: dataBody(8Ch * 6Length)
    // +0.123+0.333+0.666-0.999+2.222+3.333+11.11
    const splitLength = 6;
    const toFixed = 3;

    const currDataList = this.protocolConverter.convertArrayNumber(
      data,
      splitLength,
      toFixed,
    );

    // 데이터 목록을 순회하면서 채널(data_index)과 일치하는 Node를 찾고 Model에 데이터를 정제하여 정의
    currDataList.forEach((vol, ch) => {
      const nodeInfo = _.find(nodeList, {
        data_index: ch,
      });

      // 노드가 존재한다면 입력
      if (nodeInfo) {
        const {
          nd_target_id: ndId,
          data_logger_index: dlIndex = 0,
          node_type: nType,
        } = nodeInfo;
        // 데이터를 변환은 Node Define Id를 기준으로 수행하여 Data Logger Index와 일치하는 배열 인덱스에 정의
        dataModel[ndId][dlIndex] = this.onDeviceOperationStatus[nType](vol, toFixed);
      }
    });

    return dataModel;
  }

  /**
   * Switch (Relay) 데이터 분석 요청
   * @param {Buffer} data 장치 상태 데이터 '00' ~ '15'
   * @param {nodeInfo[]} nodeList 해당 데이터 로거에 딸린 node 목록
   * @param {Object} dataModel 반환할 데이터를 담을 Model
   */
  refineRelayData(data, nodeList, dataModel) {
    try {
      // if (this.cDaqSlotSerial === '01EE1869') {
      //   BU.CLI(data);
      // }
      // '12' >> [0, 0, 1, 1] 변환
      this.currRelayDataList = this.protocolConverter
        .converter()
        // '12' >> '1100'
        .dec2bin(Number(data.toString()))
        // 8이하의 수일 경우 4자리가 안되므로 앞자리부터 0 채움
        .padStart(4, '0')
        // '1100' >> [1, 1, 0, 0]
        .split('')
        // MSB >> LSB 변환, [1, 1, 0, 0] >> [0, 0, 1, 1]
        .reverse();

      // if (this.cDaqSlotSerial === '01EE1869') {
      //   BU.CLI(this.currRelayDataList);
      // }

      //   BU.CLIN(nodeList);
      // 릴레이 데이터 목록을 순회하면서 채널(data_index)과 일치하는 Node를 찾고 Model에 데이터를 정제하여 정의
      this.currRelayDataList.forEach((isOn, ch) => {
        const nodeInfo = _.find(nodeList, {
          data_index: ch,
        });

        if (nodeInfo) {
          const { nd_target_id: ndId, data_logger_index: dlIndex = 0 } = nodeInfo;
          //   BU.CLIN(nodeInfo);
          // 데이터를 변환은 Node Define Id를 기준으로 수행하여 Data Logger Index와 일치하는 배열 인덱스에 정의
          dataModel[ndId][dlIndex] = this.onDeviceOperationStatus[ndId][isOn];
        }
      });

      return dataModel;
    } catch (error) {
      this.currRelayDataList = [];
      throw error;
    }
  }

  /**
   * 데이터 분석 요청
   * @param {string} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   * @param {nodeInfo[]} nodeList 데이터 로거에 물려있는 Node 목록
   */
  concreteParsingData(deviceData, currTransferCmd, nodeList) {
    deviceData = Buffer.isBuffer(deviceData) ? deviceData.toString() : deviceData;

    // BU.log(deviceData.length);
    // deviceData: #(A) + cDaqSerial(A[8]) + modelType(A[4]) + slotSerial(A[8])
    // + CmdType(A[1]) + dataBody(A[1]) + checksum(B) + EOT(B)

    // 최소 길이 만족 여부 확인(Socket Parser의 Delimiter가 EOT이므로 만족 길이전에 자를 수 있음)
    const minFrameLength = 25;

    if (deviceData.length < minFrameLength) {
      throw new RangeError(
        `minFrameLength is ${minFrameLength} but deviceDatalength: ${deviceData.length}`,
      );
    }

    const stx = deviceData.slice(0, 1);
    const cDaqSerial = deviceData.slice(1, 9);
    const cDaqSlotType = deviceData.slice(9, 13);
    const cDaqSlotSerial = deviceData.slice(13, 21);
    const dataBody = deviceData.slice(0, deviceData.length - 2);
    const realData = deviceData.slice(21, deviceData.length - 2);
    const checksum = deviceData.slice(deviceData.length - 2, deviceData.length - 1);
    const eot = deviceData.slice(deviceData.length - 1);

    // BU.CLIS(
    //   stx,
    //   cDaqSerial,
    //   cDaqSlotType,
    //   cDaqSlotSerial,
    //   dataBody,
    //   realData,
    //   checksum,
    //   eot,
    // );

    const expectedChecksum = this.protocolConverter.getSumBuffer(Buffer.from(dataBody));
    // BU.CLI(expectedChecksum);

    // STX 일치 여부 확인
    if (stx !== '#') {
      throw new Error('STX가 일치하지 않습니다.');
    }
    // EOT 일치 여부 확인
    if (eot !== '') {
      throw new Error('EOT가 일치하지 않습니다.');
    }

    // checksum 일치 여부 확인
    if (checksum !== expectedChecksum.toString()) {
      throw new Error(
        `checksum does not match. expect: ${expectedChecksum.toString()}, receive: ${checksum}`,
      );
    }

    // 본체 시리얼이 맞지 않을 경우
    if (cDaqSerial !== this.cDaqSerial) {
      throw new Error(
        `cDaqSerial does not match. expect: ${this.cDaqSerial}, receive: ${cDaqSerial}`,
      );
    }

    // 슬롯 모델타입이 맞지 않을 경우
    if (cDaqSlotType !== this.cDaqSlotType) {
      throw new Error(
        `modelType does not match. expect: ${this.modelType}, receive: ${cDaqSlotType}`,
      );
    }

    // 슬롯 시리얼이 맞지 않을 경우
    if (cDaqSlotSerial !== this.cDaqSlotSerial) {
      throw new Error(
        `slotSerial does not match. expect: ${this.cDaqSlotSerial}, receive: ${cDaqSlotSerial}`,
      );
    }

    const dataModel = { ...this.dataModel };
    // 슬롯 모델 타입에 따라 처리 로직 분리
    // BU.CLI(this.dataModel);
    switch (this.slotDataType) {
      case 'voltage':
        this.refineVoltageData(realData, nodeList, dataModel);
        break;
      case 'relay':
        this.refineRelayData(realData, nodeList, dataModel);
        break;
      default:
        break;
    }

    return dataModel;
  }
};
