const _ = require('lodash');
const { expect } = require('chai');

const { BU } = require('base-util-jh');

const KinConverter = require('../../src/ETC/Kincony/Converter');
const JkConverter = require('../../src/ETC/JK_NR_2/Converter');
const TempConverter = require('../../src/ETC/BatSm/Converter');

const {
  di: {
    dcmConfigModel: { reqDeviceControlType: reqDCT },
  },
} = require('../../src/module');

describe('↓↓↓↓ Relay ↓↓↓↓', () => {
  it('→→→→ encoding JK_NR_2', done => {
    const converter = new JkConverter({ mainCategory: 'ETC', subCategory: 'JK_NR_2' });
    /** @type {nodeInfo[]} */
    const relayNodeList = [
      {
        node_id: 'R_001',
        nd_target_id: 'relay',
        data_index: 1,
        data_logger_index: 0,
      },
      {
        node_id: 'R_001',
        nd_target_id: 'relay',
        data_index: 2,
        data_logger_index: 1,
      },
    ];

    // 초기값이 없을 경우 '00'
    expect(
      converter.generationCommand({
        value: reqDCT.MEASURE,
      })[0].data,
    ).eq('00');

    // Measure Test
    relayNodeList.forEach(nodeInfo => {
      const { nd_target_id: ndId } = nodeInfo;
      // On
      expect(
        converter.generationCommand({
          key: ndId,
          value: reqDCT.TRUE,
          nodeInfo,
        })[0].data,
      ).eq(`1${nodeInfo.data_index}`);

      // Off
      expect(
        converter.generationCommand({
          key: ndId,
          value: reqDCT.FALSE,
          nodeInfo,
        })[0].data,
      ).eq(`2${nodeInfo.data_index}`);
    });

    done();
  });

  it('→→→→ encoding Kincony', done => {
    const converter = new KinConverter({ mainCategory: 'ETC', subCategory: 'Kincony' });

    /** @type {nodeInfo[]} */
    const relayNodeList = [
      {
        node_id: 'R_001',
        nd_target_id: 'relay',
        data_index: 1,
        data_logger_index: 0,
      },
      {
        node_id: 'R_002',
        nd_target_id: 'relay',
        data_index: 2,
        data_logger_index: 1,
      },
      {
        node_id: 'R_003',
        nd_target_id: 'relay',
        data_index: 3,
        data_logger_index: 2,
      },
      {
        node_id: 'R_004',
        nd_target_id: 'relay',
        data_index: 4,
        data_logger_index: 3,
      },
    ];

    // 초기값이 없을 경우 'RELAY-STATE-255'
    expect(
      converter.generationCommand({
        value: reqDCT.MEASURE,
      })[0].data,
    ).eq('RELAY-STATE-255');

    // Measure Test
    relayNodeList.forEach(nodeInfo => {
      const { nd_target_id: ndId } = nodeInfo;
      // On
      expect(
        converter.generationCommand({
          key: ndId,
          value: reqDCT.TRUE,
          nodeInfo,
        })[0].data,
      ).eq(`RELAY-SET-255,${nodeInfo.data_index},1`);

      // Off
      expect(
        converter.generationCommand({
          key: ndId,
          value: reqDCT.FALSE,
          nodeInfo,
        })[0].data,
      ).eq(`RELAY-SET-255,${nodeInfo.data_index},0`);
    });

    done();
  });

  it('→→→→ decoding JK_NR_2', done => {
    const converter = new JkConverter({ mainCategory: 'ETC', subCategory: 'JK_NR_2' });
    const relayCmdList = ['00', '11', '12', '21', '22'];
    const relayDataList = ['00000000', '10000000', '11000000', '01000000', '00000000'];
    const relayCurrDataList = [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
    ];

    const conv = {
      ON: 1,
      OFF: 0,
    };

    relayDataList.forEach((data, index) => {
      const result = converter.concreteParsingData(Buffer.from(data));
      // onDeviceOperationStatus.Relay 동작 여부 확인
      expect(_.map(result.relay, rData => conv[rData])).to.deep.equal(
        relayCurrDataList[index],
      );
    });

    done();
  });

  it('→→→→ decoding Kincony', done => {
    const converter = new KinConverter({ mainCategory: 'ETC', subCategory: 'Kincony' });

    /** @type {nodeInfo[]} */
    const relayNodeList = [
      {
        node_id: 'R_001',
        nd_target_id: 'relay',
        data_index: 1,
        data_logger_index: 0,
      },
      {
        node_id: 'R_002',
        nd_target_id: 'relay',
        data_index: 2,
        data_logger_index: 1,
      },
      {
        node_id: 'R_003',
        nd_target_id: 'relay',
        data_index: 3,
        data_logger_index: 2,
      },
      {
        node_id: 'R_004',
        nd_target_id: 'relay',
        data_index: 4,
        data_logger_index: 3,
      },
    ];

    // 개별 제어 테스트 (3채널 On)
    const indCmd = converter.generationCommand({
      key: 'relay',
      value: reqDCT.TRUE,
      nodeInfo: relayNodeList[2],
    })[0].data;

    const expectReqIndCmd = 'RELAY-SET-255,3,1';
    expect(indCmd).eq(expectReqIndCmd);

    const result = converter.concreteParsingData(expectReqIndCmd, null, relayNodeList);

    expect(result.relay[2]).to.eq('ON');

    // 계측 명령
    const measureCmd = converter.generationCommand()[0].data;

    const expectReqMeasureCmd = 'RELAY-STATE-255';
    expect(measureCmd).eq(expectReqMeasureCmd);

    const result2 = converter.concreteParsingData(
      `${expectReqMeasureCmd},11`,
      null,
      relayNodeList,
    );

    expect(result2.relay).to.deep.eq(['ON', 'ON', 'OFF', 'ON']);

    done();
  });
});

describe('↓↓↓↓ Temp ↓↓↓↓', () => {
  function getPercentBattery(dataModel) {
    return dataModel.percentBattery[0];
  }

  it('encoding & decoding', done => {
    const batDataList = ['095.1', '100.0', '002.4', '022.8', '000.0'];
    const batConvDataList = [95.1, 100, 2.4, 22.8, 0];

    const converter = new TempConverter({
      mainCategory: 'ETC',
      subCategory: 'BatSm',
    });

    const measureCmd = Buffer.concat([
      Buffer.from('02', 'hex'),
      Buffer.from('M'),
      Buffer.from('03', 'hex'),
    ]);

    expect(
      converter.generationCommand({
        value: reqDCT.MEASURE,
      })[0].data,
    ).to.deep.eq(measureCmd);

    batDataList.forEach((batData, index) => {
      const deviceData = Buffer.concat([
        Buffer.from('02', 'hex'),
        Buffer.from(batData),
        Buffer.from('03', 'hex'),
      ]);

      const dataModel = converter.concreteParsingData(deviceData);

      expect(getPercentBattery(dataModel)).eq(batConvDataList[index]);
    });

    done();
  });
});
