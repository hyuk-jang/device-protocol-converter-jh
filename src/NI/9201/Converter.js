const _ = require('lodash');
const { BU } = require('base-util-jh');

const Model = require('./Model');
const protocol = require('./protocol');

const cDaqConverter = require('../../Default/Converter/cDaqConverter');

const baseFormat = require('../baseFormat');

/**
 * 전압 슬롯
 * 저장할 데이터 변수 ndId 지정 유의
 * nodeInfo >> nodeType, dlIndex 필수
 */
class Converter extends cDaqConverter {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super(protocolInfo, Model);

    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;
    /** BaseModel */
    this.model = new Model(protocolInfo, this);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   * @param {Buffer} currTransferCmd 현재 요청한 명령
   * @param {nodeInfo[]} nodeList 장치로 요청한 명령
   */
  concreteParsingData(deviceData, currTransferCmd, nodeList) {
    // sendFrame: #(A) + cDaqSerial(B[4]) + modelType(A) + slotSerial(B[4]) + dataBody(B) + checksum(B) + EOT(B)
    try {
      // +0.123+0.333+0.666-0.999+2.222+3.333+11.11
      const data = super.concreteParsingData(deviceData, currTransferCmd, nodeList);

      const splitLength = 6;
      const toFixed = 3;

      const currDataList = this.protocolConverter.convertArrayNumber(
        data,
        splitLength,
        toFixed,
      );

      // 데이터를 저장할 모델 생성(얕은 복사)
      const dataModel = { ...baseFormat };
      // 데이터 목록을 순회하면서 채널(data_index)과 일치하는 Node를 찾고 Model에 데이터를 정제하여 정의
      currDataList.forEach((vol, ch) => {
        const {
          nd_target_id: ndId,
          data_logger_index: dlIndex = 0,
          node_type: nType,
        } = _.find(nodeList, {
          data_index: ch,
        });
        // 데이터를 변환은 Node Define Id를 기준으로 수행하여 Data Logger Index와 일치하는 배열 인덱스에 정의
        dataModel[ndId][dlIndex] = this.onDeviceOperationStatus[nType](vol, toFixed);
      });

      return dataModel;
    } catch (error) {
      this.currDataList = [];
      throw error;
    }
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  // const deviceId = '0013A2004190ED67';
  const deviceId = '01EE8DE7';
  const slotId = '01EED6EF';
  const converter = new Converter({
    mainCategory: 'NI',
    subCategory: '9201',
    deviceId,
    option: {
      ni: { slotId },
    },
  });

  const cmdInfo = converter.generationCommand({
    // key: 'relay',
    value: 2,
    nodeInfo: {
      // 장치 슬롯 위치 (0~3) 4채널
      data_index: 3,
    },
  });

  /** @type {nodeInfo[]} */
  const nodeList = [
    {
      node_id: 'p_001',
      nd_target_id: 'absPressure',
      data_index: 0,
      data_logger_index: 0,
      node_type: 'PXM309',
    },
    {
      node_id: 'p_002',
      nd_target_id: 'absPressure',
      data_index: 1,
      data_logger_index: 1,
      node_type: 'PXM309',
    },
    {
      node_id: 'p_003',
      nd_target_id: 'absPressure',
      data_index: 2,
      data_logger_index: 2,
      node_type: 'PXM309',
    },
    {
      node_id: 'p_004',
      nd_target_id: 'absPressure',
      data_index: 3,
      data_logger_index: 3,
      node_type: 'PXM309',
    },
    {
      node_id: 'p_005',
      nd_target_id: 'absPressure',
      data_index: 4,
      data_logger_index: 4,
      node_type: 'PXM309',
    },
    {
      node_id: 'p_006',
      nd_target_id: 'absPressure',
      data_index: 5,
      data_logger_index: 5,
      node_type: 'PXM309',
    },
    {
      node_id: 'p_007',
      nd_target_id: 'absPressure',
      data_index: 6,
      data_logger_index: 6,
      node_type: 'PXM309',
    },
  ];

  console.log(cmdInfo);

  const testReqMsg = '02497e001210010013a2004190ed67fffe0000407374737d03';
  // const realTestReqMsg = Buffer.from(testReqMsg.slice(4, testReqMsg.length - 2), 'hex');

  const onDataList = [
    // sendFrame: #(A) + cDaqSerial(B[4]) + modelType(A) + slotSerial(B[4]) + dataBody(B) + checksum(B) + EOT(B)
    Buffer.concat([
      Buffer.from('#'),
      converter.cDaqSerial,
      converter.cDaqSlotType,
      converter.cDaqSlotSerial,
      Buffer.from('+0.123+0.333+0.666-0.999+2.222+3.333+11.11'),
      Buffer.from('0b', 'hex'),
      converter.protocolConverter.EOT,
    ]),
    // '02537e002a900013a2004190ed67fffe0123303030313030313231302e324131313131303131313131303131303031e203',
  ];

  onDataList.forEach(d => {
    // const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');
    // BU.CLI(realBuffer);

    const dataMap = converter.concreteParsingData(d, cmdInfo, nodeList);
    console.log(dataMap);
  });
}
