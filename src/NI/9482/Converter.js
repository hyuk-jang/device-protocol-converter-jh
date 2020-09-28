const _ = require('lodash');
const { BU } = require('base-util-jh');

const Model = require('./Model');
const protocol = require('./protocol');

const cDaqConverter = require('../../Default/Converter/cDaqConverter');

const baseFormat = require('../baseFormat');

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

    /** @type {number[]} 릴레이 데이터 4채널 0, 1 저장됨 */
    this.currDataList;
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
      // '00' ~ '15'
      const data = super.concreteParsingData(deviceData, currTransferCmd, nodeList);
      //   BU.CLI(data);
      // '12' >> [0, 0, 1, 1] 변환
      this.currDataList = this.protocolConverter
        .converter()
        // '12' >> '1100'
        .dec2bin(Number(data.toString()))
        // 8이하의 수일 경우 4자리가 안되므로 앞자리부터 0 채움
        .padStart(4, '0')
        // '1100' >> [1, 1, 0, 0]
        .split('')
        // MSB >> LSB 변환, [1, 1, 0, 0] >> [0, 0, 1, 1]
        .reverse();

      //   BU.CLI(this.currDataList);

      //   BU.CLIN(nodeList);
      // 데이터를 저장할 모델 생성(얕은 복사)
      const dataModel = { ...baseFormat };
      // 릴레이 데이터 목록을 순회하면서 채널(data_index)과 일치하는 Node를 찾고 Model에 데이터를 정제하여 정의
      this.currDataList.forEach((isOn, ch) => {
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
      this.currDataList = [];
      throw error;
    }
  }
}
module.exports = Converter;

if (require !== undefined && require.main === module) {
  // Slot Serial
  //   const deviceId = '01EE1809';
  const deviceId = '01EE1869';
  //   cDaq Serial
  const subDeviceId = '01EE8DE7';
  const converter = new Converter({
    mainCategory: 'NI',
    subCategory: '9482',
    deviceId,
    subDeviceId,
  });

  converter.currDataList = [0, 1, 1, 1];

  const cmdInfo = converter.generationCommand({
    key: Model.BASE_KEY.compressor,
    value: 0,
    nodeInfo: {
      // 장치 슬롯 위치 (0~3) 4채널
      data_index: 3,
    },
  });

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
    // sendFrame: #(A) + cDaqSerial(B[4]) + modelType(A) + slotSerial(B[4]) + dataBody(B) + checksum(B) + EOT(B)
    // Buffer.concat([
    //   Buffer.from(
    //     `#${converter.cDaqSerial}${converter.cDaqSlotType}${converter.cDaqSlotSerial}`,
    //   ),
    //   Buffer.from('12'),
    //   Buffer.from('fd', 'hex'),
    //   converter.protocolConverter.EOT,
    // ]),
    `#01EE8DE7948201EE186900${Buffer.from([0x00, 0x04])}`,
  ];

  onDataList.forEach(d => {
    // const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');
    // BU.CLI(realBuffer);

    const dataMap = converter.concreteParsingData(d, cmdInfo, nodeList);
    console.log(dataMap);
  });
}
