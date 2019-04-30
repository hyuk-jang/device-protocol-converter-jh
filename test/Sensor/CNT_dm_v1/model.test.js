const { expect } = require('chai');
const { BU } = require('base-util-jh');
const _ = require('lodash');

const Converter = require('../../../src/Sensor/CNT_dm_v1/Converter');
const BaseModel = require('../../../src/Sensor/BaseModel');
const { decodingProtocolTable } = require('../../../src/Sensor/CNT_dm_v1/protocol');

const model = new BaseModel({
  deviceId: Buffer.from([0x30, 0x30, 0x31]),
  mainCategory: 'Sensor',
  subCategory: 'CNT_dm_v1',
});

describe('↓↓↓↓ encoding Test 1 ↓↓↓↓', () => {
  const converter = new Converter({ deviceId: '001', subCategory: 'CNT_dm_v1' });
  it('encoding CNT_dm_v1', done => {
    BU.CLI('defaultCommand', model.device.DEFAULT.COMMAND.STATUS);

    done();
  });
});

describe('Decoding Test', () => {
  // const converter = new Converter({deviceId:'0013A20010215369'} );
  it('receive Buffer To Data Body', function(done) {
    const protocol = decodingProtocolTable(Buffer.from('001'));

    const dummyPv = Buffer.from('R001,01,000000000000000000510020000000000176');
    const bodyPv = model.getValidateData(dummyPv);
    // BU.CLI('bodyPv', bodyPv);

    const dummyPv2 = Buffer.from(
      'R001,02,00000000000000000051002000000000,000000000000000000510020000000000176',
    );
    const bodyPv2 = model.getValidateData(dummyPv2);
    // BU.CLI('bodyPv2', bodyPv2);

    const dummyPv3 = Buffer.from(
      'R001,03,00000000000000000051002000000000,00000000000000000051002000000000,000000000000000000510020000000000176',
    );
    const bodyPv3 = model.getValidateData(dummyPv3);
    // BU.CLI('bodyPv3', bodyPv3);

    const dummyPv4 = Buffer.from(
      'R001,04,00000000000000000051002000000000,00000000000000000051002000000000,00000000000000000051002000000000,000000000000000000510020000000000176',
    );
    const bodyPv4 = model.getValidateData(dummyPv4);
    // BU.CLI('bodyPv4', bodyPv4);

    done();
  });

  //   it('automaticDecoding', function(done) {
  //     const converter = new Converter({
  //       deviceId: '001',
  //       mainCategory: 'Sensor',
  //       subCategory: 'CNT_dm_v1',
  //       option: true,
  //       protocolOptionInfo: { hasTrackingData: true },
  //       // wrapperCategory: 'default',
  //     });

  //     // 명령 생성
  //     const commandStorage = converter.generationCommand({ key: model.device.DEFAULT.KEY });
  //     // BU.CLI(commandStorage);

  //     // 명령 발송 객체 생성
  //     const dcData = {
  //       commandSet: {
  //         cmdList: commandStorage,
  //         currCmdIndex: 0,
  //       },
  //     };

  //     let res;
  //     // PV 데이터 파싱
  //     dcData.commandSet.currCmdIndex = 1;
  //     dcData.data = Buffer.from('00000000000000000051002000000000');
  //     // eslint-disable-next-line prefer-const
  //     res = converter.parsingUpdateData(dcData).data;
  //     BU.CLI(dcData);
  //     expect(_.head(res.pvVol)).to.eq(400);
  //     expect(_.head(res.pvAmp)).to.eq(20);

  //     done();
  //   });
});
