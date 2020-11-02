const _ = require('lodash');
const { expect } = require('chai');

const { BU } = require('base-util-jh');

const Converter = require('../../src/ETC/JK_NR_2/Converter');
const TempConverter = require('../../src/ETC/BatSm/Converter');

const {
  di: {
    dcmConfigModel: { reqDeviceControlType: reqDCT },
  },
} = require('../../src/module');

describe('↓↓↓↓ JK_NR_2 ↓↓↓↓', () => {
  const converter = new Converter({ mainCategory: 'ETC', subCategory: 'JK_NR_2' });

  it('encoding', done => {
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

  it('decoding', done => {
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
      const result = converter.concreteParsingData(
        Buffer.from(data),
        relayCmdList[index],
      );

      // onDeviceOperationStatus.Relay 동작 여부 확인
      expect(_.map(result.relay, rData => conv[rData])).to.deep.equal(
        relayCurrDataList[index],
      );
    });

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
      subCategory: 'Temp',
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
