const { expect } = require('chai');
const { BU } = require('base-util-jh');
const _ = require('lodash');

const Converter = require('../../../src/Inverter/hexPowerSingle/Converter');
const BaseModel = require('../../../src/Inverter/BaseModel');
const protocolConverter = require('../../../src/Default/ProtocolConverter');

const { BASE_MODEL } = BaseModel;

const model = new BaseModel({
  deviceId: Buffer.from([0x30, 0x31]),
  mainCategory: 'Inverter',
  subCategory: 'hexPowerSingle',
});

describe('↓↓↓↓ encoding Test 1 ↓↓↓↓', () => {
  const converter = new Converter({ deviceId: '01', subCategory: 'hexPowerSingle' });
  it('encoding hexPower', done => {
    BU.CLI('defaultCommand', model.device.DEFAULT.COMMAND.STATUS);

    done();
  });
  it('generate Msg', done => {
    const cmd = converter.generationCommand({
      key: model.device.OPERATION_INFO.KEY,
    });

    // BU.CLI('cmd', cmd);

    done();
  });
});

const { decodingProtocolTable } = require('../../../src/Inverter/hexPowerSingle/protocol');

describe('↓↓↓↓ decoding Test ↓↓↓↓', () => {
  it('receive Buffer To Data Body', done => {
    const protocol = decodingProtocolTable(Buffer.from('01'));
    const dummyFault = Buffer.from(
      '0630315230303034303030383430613230303231303030303034623904',
      'hex',
    );
    const bodyFault = model.getValidateData(dummyFault, protocol.OPERATION);
    // BU.CLI('bodyFalut', bodyFault);

    done();
  });

  it('automaticDecoding', function(done) {
    const converter = new Converter({
      deviceId: '01',
      subCategory: 'hexPowerSingle',
      option: true,
      protocolOptionInfo: { hasTrackingData: true },
    });

    const commandStorage = converter.generationCommand({ key: model.device.DEFAULT.KEY });

    // 명령 발송 객체 생성
    // /** @type {dcData} */
    const dcData = {
      commandSet: {
        cmdList: commandStorage,
        currCmdIndex: 0,
      },
    };

    // 수신 받은 데이터 생성
    /** @type {BASE_MODEL} */
    let res;
    const ACK = Buffer.from('06', 'hex');
    const EOT = Buffer.from('04', 'hex');

    dcData.data = Buffer.from(`${ACK}01R0004000840a20021000004b9${EOT}`);
    // eslint-disable-next-line prefer-const
    res = converter.parsingUpdateData(dcData).data;
    BU.CLI(res);

    done();
  });
});
