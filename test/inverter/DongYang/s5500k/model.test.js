const { expect } = require('chai');
const { BU } = require('base-util-jh');
const _ = require('lodash');

const Converter = require('../../../../src/Inverter/s5500k/Converter');

const BaseModel = require('../../../../src/Inverter/BaseModel');

const { BASE_MODEL } = BaseModel;

describe('encoding Test 1', () => {
  // 명령 생성 동일 테스트
  it('encoding msg', done => {
    const model1 = new BaseModel({
      deviceId: '\u0001',
      mainCategory: 'Inverter',
      subCategory: 's5500k',
    });

    const msg1 = model1.makeMsg();

    const reqestMsg = Buffer.from([0x0a, 0x96, 0x01, 0x54, 0x18, 0x05, 0x6d]);

    expect(_.isEqual(reqestMsg, msg1)).to.eq(true);

    const model2 = new BaseModel({
      deviceId: '\u0002',
      mainCategory: 'Inverter',
      subCategory: 's5500k',
    });

    const msg2 = model2.makeMsg();

    expect(_.isEqual(Buffer.from([0x0a, 0x96, 0x02, 0x54, 0x18, 0x05, 0x6e]), msg2)).to.eq(true);

    done();
  });
});

describe('Decoding Test', () => {
  it('automaticDecoding', function(done) {
    const converter = new Converter({
      deviceId: '\u0001',
      mainCategory: 'Inverter',
      subCategory: 's5500k',
    });
    // 명령 생성
    const commandStorage = converter.generationCommand();

    // 명령 발송 객체 생성
    // /** @type {dcData} */
    const dcData = {
      commandSet: {
        cmdList: commandStorage,
        currCmdIndex: 0,
      },
    };

    // 수신 받은 데이터 생성

    dcData.data = Buffer.from([
      0xb1,
      0xb5,
      0x01,
      0x15,
      0x0e,
      0x32,
      0x0a,
      0x98,
      0x08,
      0xac,
      0x0d,
      0xce,
      0x04,
      0x4c,
      0x04,
      0xfd,
      0x08,
      0xd0,
      0x07,
      0x79,
      0x00,
      0x59,
      0x02,
      0xe7,
      0x03,
      0x00,
      0x6a,
      0x08,
      0x60,
      0x01,
      0x00,
      0x8e,
      0x89,
      0x00,
      0x40,
      0x80,
      0x10,
      0x20,
      0x08,
      0x8d,
    ]);

    /** @type {BASE_MODEL} */
    const res = converter.parsingUpdateData(dcData).data;
    // BU.CLI(res);

    // 1번째 PV 전압 26.1
    expect(_.head(res.pvAmp)).to.eq(26.1);
    // 2번째 PV 전압 12.3
    expect(_.nth(res.pvAmp, 1)).to.eq(12.3);

    // 배열 1개로 이루어져있고
    expect(res.operTroubleList).length(1);
    // 세부 에러는 3개
    expect(_.head(res.operTroubleList)).length(3);

    expect(_.head(res.powerCpKwh)).to.eq(999);

    done();
  });
});
