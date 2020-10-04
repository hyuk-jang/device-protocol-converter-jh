const _ = require('lodash');
const { BU } = require('base-util-jh');

const Model = require('./Model');
const protocol = require('./protocol');

const cDaqConverter = require('../../Default/Converter/cDaqConverter');

/**
 * 릴레이(스위치) 슬롯
 * 저장할 데이터 변수 ndId 지정 유의
 * nodeInfo >> nodeType, dlIndex, dIndex 필수
 */
class Converter extends cDaqConverter {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super(protocolInfo, Model);

    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;
    /** BaseModel */
    this.model = new Model(protocolInfo, this);

    // BU.CLIN(Model.BASE_MODEL);
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  // Slot Serial
  //   const deviceId = '01EE1809';
  const deviceId = '01EE1869';
  // const deviceId = '01EED6EF';
  //   cDaq Serial
  const subDeviceId = '01EE8DE7';
  const converter = new Converter({
    mainCategory: 'NI',
    subCategory: 'cDaq',
    deviceId,
    subDeviceId,
    option: {
      ni: {
        slotModelType: '9482',
      },
    },
  });

  converter.currRelayDataList = [0, 1, 1, 1];

  const cmdInfo = converter.generationCommand({
    // key: Model.BASE_KEY.compressor,
    value: 2,
    nodeInfo: {
      // 장치 슬롯 위치 (0~3) 4채널
      data_index: 3,
    },
  });

  // /** @type {nodeInfo[]} */
  // const nodeList = [
  //   {
  //     node_id: 'p_001',
  //     nd_target_id: 'absPressure',
  //     data_index: 0,
  //     data_logger_index: 0,
  //     node_type: 'PXM309',
  //   },
  //   {
  //     node_id: 'p_002',
  //     nd_target_id: 'absPressure',
  //     data_index: 1,
  //     data_logger_index: 1,
  //     node_type: 'PXM309',
  //   },
  //   {
  //     node_id: 'p_003',
  //     nd_target_id: 'absPressure',
  //     data_index: 2,
  //     data_logger_index: 2,
  //     node_type: 'PXM309',
  //   },
  //   {
  //     node_id: 'p_004',
  //     nd_target_id: 'absPressure',
  //     data_index: 3,
  //     data_logger_index: 3,
  //     node_type: 'PXM309',
  //   },
  //   {
  //     node_id: 'p_005',
  //     nd_target_id: 'absPressure',
  //     data_index: 4,
  //     data_logger_index: 4,
  //     node_type: 'PXM309',
  //   },
  //   {
  //     node_id: 'p_006',
  //     nd_target_id: 'absPressure',
  //     data_index: 5,
  //     data_logger_index: 5,
  //     node_type: 'PXM309',
  //   },
  //   {
  //     node_id: 'p_007',
  //     nd_target_id: 'absPressure',
  //     data_index: 6,
  //     data_logger_index: 6,
  //     node_type: 'PXM309',
  //   },
  //   // {
  //   //   node_id: 'p_008',
  //   //   nd_target_id: 'absPressure',
  //   //   data_index: 7,
  //   //   data_logger_index: 7,
  //   //   node_type: 'PXM309',
  //   // },
  // ];

  /** @type {nodeInfo[]} */
  const nodeList = [
    {
      node_id: 'V_001',
      nd_target_id: 'valve',
      data_index: 0,
      data_logger_index: 0,
    },
    {
      node_id: 'V_00',
      nd_target_id: 'valve',
      data_index: 1,
      data_logger_index: 1,
    },
    {
      node_id: 'V_003',
      nd_target_id: 'valve',
      data_index: 2,
      data_logger_index: 2,
    },
    {
      node_id: 'C_001',
      nd_target_id: 'compressor',
      data_index: 3,
      data_logger_index: 0,
    },
  ];

  console.log(cmdInfo);

  // const testReqMsg = '02497e001210010013a2004190ed67fffe0000407374737d03';
  // const realTestReqMsg = Buffer.from(testReqMsg.slice(4, testReqMsg.length - 2), 'hex');

  const onDataList = [
    // `#01EE8DE7920101EED6EF+00.08+00.01+00.01+00.00+00.00+00.00+00.00+00.00${Buffer.from([
    //   0x94,
    // ])}\u0004`,
    `#01EE8DE7948201EE186900${Buffer.from([0x00, 0x04])}`,
  ];

  onDataList.forEach(d => {
    // const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');
    // BU.CLI(realBuffer);

    const dataMap = converter.concreteParsingData(d, cmdInfo, nodeList);
    console.log(dataMap);
  });
}
