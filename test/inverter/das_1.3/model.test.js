const {expect} = require('chai');
const {BU} = require('base-util-jh');
const _ = require('lodash');

const Converter = require('../../../src/Inverter/das_1.3/Converter');

const BaseModel = require('../../../src/Inverter/BaseModel');

const model = new BaseModel({
  deviceId: Buffer.from([0x30, 0x30, 0x30]),
  mainCategory: 'Inverter',
  subCategory: 'das_1.3',
});

// require('default-intelligence');
// require('../../../../default-intelligence');

describe('encoding Test 1', () => {
  const converter = new Converter({deviceId: '001', subCategory: 'das_1.3'});
  it('encoding das', done => {
    BU.CLI(model.device.PV.COMMAND.STATUS);
    BU.CLI(model.device.GRID.COMMAND.STATUS);
    BU.CLI(model.device.POWER.COMMAND.STATUS);

    BU.CLI(model.device.SYSTEM.COMMAND.STATUS);
    BU.CLI(model.device.OPERATION_INFO.COMMAND.STATUS);
    BU.CLI(model.device.DEFAULT.COMMAND.STATUS);

    done();
  });

  it('generate Msg', done => {
    let cmd = converter.generationCommand({
      key: model.device.GRID.KEY,
    });
    BU.CLI(cmd);

    expect(cmd.length).to.eq(2);
    cmd = converter.generationCommand({key: model.device.DEFAULT.KEY});
    BU.CLI(cmd);
    expect(cmd.length).to.eq(6);

    done();
  });
});

const {decodingProtocolTable} = require('../../../src/Inverter/das_1.3/protocol');

describe('Decoding Test', () => {
  // const converter = new Converter({deviceId:'0013A20010215369'} );
  it('receive Buffer To Data Body', function(done) {
    const protocol = decodingProtocolTable(Buffer.from('001'));

    // console.dir(protocol);

    const dummySystem = Buffer.from('^D017001,3,0100,380,24');
    const bodySystem = model.getValidateData(dummySystem, protocol.SYSTEM);
    BU.CLI('bodySystem', bodySystem);

    const dummyPv = Buffer.from('^D120001,400,0200,0080,18');
    const bodyPv = model.getValidateData(dummyPv, protocol.PV);
    BU.CLI('bodyPv', bodyPv);

    let buffer = Buffer.from('^D222001,380,379,381,600,55');
    let body = model.getValidateData(buffer, protocol.GRID_VOL);
    BU.CLI('body', body);

    buffer = Buffer.from('^D321001,0118,0119,0118,38');
    body = model.getValidateData(buffer, protocol.GRID_AMP);
    BU.CLI('body', body);

    buffer = Buffer.from('^D419001,0078,0000100,31');
    body = model.getValidateData(buffer, protocol.POWER);
    BU.CLI('body', body);

    buffer = Buffer.from('^D612001,0,0,0,10');
    body = model.getValidateData(buffer, protocol.OPERATION);
    BU.CLI('body', body);

    done();
  });

  it('automaticDecoding', function(done) {
    const converter = new Converter({
      deviceId: '001',
      mainCategory: 'Inverter',
      subCategory: 'das_1.3',
      option: true,
      protocolOptionInfo: {hasTrackingData: true},
      // wrapperCategory: 'default',
    });
    // 명령 생성
    const commandStorage = converter.generationCommand({key: model.device.DEFAULT.KEY});
    BU.CLI(commandStorage);

    // 명령 발송 객체 생성
    // /** @type {dcData} */
    const dcData = {
      commandSet: {
        cmdList: commandStorage,
        currCmdIndex: 0,
      },
    };

    // 수신 받은 데이터 생성
    let res;
    // 0. 시스템 데이터 파싱, 에러 날 경우 강제 삭제 테스트
    dcData.data = Buffer.from('^001,3,0100,380,24');
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, 'name')).to.eq('Error');
    dcData.data = Buffer.from('^,,380,24');
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, 'name')).to.eq('Error');
    dcData.data = Buffer.from('^D,24');
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, 'name')).to.eq('Error');

    // 정상 데이터가 들어와도 에러
    dcData.data = Buffer.from('^D017001,3,0100,380,24');
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, 'name')).to.eq('Error');

    // 리셋 처리 후 정상 데이터가 들어오면 진행
    converter.resetTrackingDataBuffer();
    dcData.data = Buffer.from('^D017001,3,0100,380,24');
    res = converter.parsingUpdateData(dcData).data;
    // BU.CLI(res);
    expect(_.get(res, 'name')).to.not.eq('Error');

    // 1. 시스템 데이터 파싱
    dcData.data = Buffer.from('^D017001,');
    res = converter.parsingUpdateData(dcData);
    // BU.CLI(res.data.message);
    dcData.data = Buffer.from('3,0100,380,24');
    res = converter.parsingUpdateData(dcData).data;
    // BU.CLI(res.data);

    // 10kW급 테스트 (scale, fixed Test)
    expect(_.get(res, BaseModel.BASE_KEY.sysLineVoltage)).to.eq(380);
    expect(_.get(res, BaseModel.BASE_KEY.sysCapaKw)).to.eq(10);
    expect(_.get(res, BaseModel.BASE_KEY.sysIsSingle)).to.eq(0);

    // 1. 시스템 데이터 파싱
    dcData.data = Buffer.from('^D017001,');
    res = converter.parsingUpdateData(dcData);
    // BU.CLI(res.data.message);
    dcData.data = Buffer.from('3,0100,380,24');
    res = converter.parsingUpdateData(dcData).data;
    // 10kW급 테스트 (scale, fixed Test)
    expect(_.get(res, BaseModel.BASE_KEY.sysLineVoltage)).to.eq(380);
    expect(_.get(res, BaseModel.BASE_KEY.sysCapaKw)).to.eq(10);
    expect(_.get(res, BaseModel.BASE_KEY.sysIsSingle)).to.eq(0);

    // 2. PV 데이터 파싱
    dcData.commandSet.currCmdIndex = 1;
    dcData.data = Buffer.from('^D120001,400,0200,0080,18');
    res = converter.parsingUpdateData(dcData).data;
    // BU.CLI(res);
    expect(_.get(res, BaseModel.BASE_KEY.pvVol)).to.eq(400);
    expect(_.get(res, BaseModel.BASE_KEY.pvAmp)).to.eq(20);
    expect(_.get(res, BaseModel.BASE_KEY.pvKw)).to.eq(8);

    // 3. GRID VOL 데이터 파싱
    dcData.commandSet.currCmdIndex = 2;
    dcData.data = Buffer.from('^D222001,380,379,381,600,55');
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, BaseModel.BASE_KEY.gridRsVol)).to.eq(380);
    expect(_.get(res, BaseModel.BASE_KEY.gridStVol)).to.eq(379);
    expect(_.get(res, BaseModel.BASE_KEY.gridTrVol)).to.eq(381);
    expect(_.get(res, BaseModel.BASE_KEY.gridLf)).to.eq(60);

    // 4. GRID AMP 데이터 파싱
    dcData.commandSet.currCmdIndex = 3;
    dcData.data = Buffer.from('^D321001,0118,0119,0118,38');
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, BaseModel.BASE_KEY.gridRAmp)).to.eq(11.8);
    expect(_.get(res, BaseModel.BASE_KEY.gridSAmp)).to.eq(11.9);
    expect(_.get(res, BaseModel.BASE_KEY.gridTAmp)).to.eq(11.8);

    // 5. Power 데이터 파싱
    dcData.commandSet.currCmdIndex = 4;
    dcData.data = Buffer.from('^D419001,0078,0000100,31');
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, BaseModel.BASE_KEY.powerGridKw)).to.eq(7.8);
    expect(_.get(res, BaseModel.BASE_KEY.powerCpKwh)).to.eq(100);

    // 6. Operation 데이터 파싱
    dcData.commandSet.currCmdIndex = 5;
    dcData.data = Buffer.from('^D612001,0,0,0,10');
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, BaseModel.BASE_KEY.operIsError)).to.eq(0);
    expect(_.get(res, BaseModel.BASE_KEY.operIsRun)).to.eq(1);
    expect(_.get(res, BaseModel.BASE_KEY.operTroubleList).length).to.eq(0);

    dcData.data = Buffer.from('^D612001,0,0,Z,45');
    res = converter.parsingUpdateData(dcData).data;
    // BU.CLI(res);
    expect(_.get(res, BaseModel.BASE_KEY.operTroubleList).length).to.eq(1);

    done();
  });
  it('automaticWrappingDecoding', function(done) {
    const converter = new Converter({
      deviceId: '001',
      mainCategory: 'Inverter',
      subCategory: 'das_1.3',
      option: true,
      protocolOptionInfo: {hasTrackingData: true},
      wrapperCategory: 'default',
    });
    // 명령 생성
    const commandStorage = converter.generationCommand({key: model.device.DEFAULT.KEY});
    BU.CLI(commandStorage);

    // 명령 발송 객체 생성
    // /** @type {dcData} */
    const originDcData = {
      commandSet: {
        cmdList: commandStorage,
        currCmdIndex: 0,
      },
    };
    BU.CLI(originDcData);

    // 수신 받은 데이터 생성
    let res;
    // 0. 시스템 데이터 파싱, 에러 날 경우 강제 삭제 테스트
    let dcData;
    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^001,3,0100,380,24');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, 'name')).to.eq('Error');

    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^,,380,24');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, 'name')).to.eq('Error');

    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^D,24');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, 'name')).to.eq('Error');

    // 정상 데이터가 들어와도 에러
    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^D017001,3,0100,380,24');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, 'name')).to.eq('Error');

    // 리셋 처리 후 정상 데이터가 들어오면 진행
    converter.resetTrackingDataBuffer();
    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^D017001,3,0100,380,24');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, 'name')).to.not.eq('Error');

    // 1. 시스템 데이터 파싱
    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^D017001,3,0100,380,24');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;

    // 10kW급 테스트 (scale, fixed Test)
    expect(_.get(res, BaseModel.BASE_KEY.sysLineVoltage)).to.eq(380);
    expect(_.get(res, BaseModel.BASE_KEY.sysCapaKw)).to.eq(10);
    expect(_.get(res, BaseModel.BASE_KEY.sysIsSingle)).to.eq(0);

    // 2. PV 데이터 파싱
    originDcData.commandSet.currCmdIndex = 1;

    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^D120001,400,0200,0080,18');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, BaseModel.BASE_KEY.pvVol)).to.eq(400);
    expect(_.get(res, BaseModel.BASE_KEY.pvAmp)).to.eq(20);
    expect(_.get(res, BaseModel.BASE_KEY.pvKw)).to.eq(8);

    // 3. GRID VOL 데이터 파싱
    originDcData.commandSet.currCmdIndex = 2;
    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^D222001,380,379,381,600,55');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;

    expect(_.get(res, BaseModel.BASE_KEY.gridRsVol)).to.eq(380);
    expect(_.get(res, BaseModel.BASE_KEY.gridStVol)).to.eq(379);
    expect(_.get(res, BaseModel.BASE_KEY.gridTrVol)).to.eq(381);
    expect(_.get(res, BaseModel.BASE_KEY.gridLf)).to.eq(60);

    // 4. GRID AMP 데이터 파싱
    originDcData.commandSet.currCmdIndex = 3;
    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^D321001,0118,0119,0118,38');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;

    expect(_.get(res, BaseModel.BASE_KEY.gridRAmp)).to.eq(11.8);
    expect(_.get(res, BaseModel.BASE_KEY.gridSAmp)).to.eq(11.9);
    expect(_.get(res, BaseModel.BASE_KEY.gridTAmp)).to.eq(11.8);

    // 5. Power 데이터 파싱
    originDcData.commandSet.currCmdIndex = 4;
    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^D419001,0078,0000100,31');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, BaseModel.BASE_KEY.powerGridKw)).to.eq(7.8);
    expect(_.get(res, BaseModel.BASE_KEY.powerCpKwh)).to.eq(100);

    // 6. Operation 데이터 파싱
    originDcData.commandSet.currCmdIndex = 5;
    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^D612001,0,0,0,10');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;
    expect(_.get(res, BaseModel.BASE_KEY.operIsError)).to.eq(0);
    expect(_.get(res, BaseModel.BASE_KEY.operIsRun)).to.eq(1);
    expect(_.get(res, BaseModel.BASE_KEY.operTroubleList).length).to.eq(0);

    dcData = _.cloneDeep(originDcData);
    dcData.data = Buffer.from('^D612001,0,0,Z,45');
    dcData.data = converter.coverFrame(dcData.data);
    res = converter.parsingUpdateData(dcData).data;
    // BU.CLI(res);
    expect(_.get(res, BaseModel.BASE_KEY.operTroubleList).length).to.eq(1);

    done();
  });
});
