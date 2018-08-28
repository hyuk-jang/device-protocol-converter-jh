const {expect} = require('chai');
const {BU} = require('base-util-jh');
const _ = require('lodash');

const Converter = require('../../../src/FarmParallel/youngSanPo/Converter');
const BaseModel = require('../../../src/FarmParallel/BaseModel');

const {decodingProtocolTable} = require('../../../src/FarmParallel/youngSanPo/protocol');

const model = new BaseModel({
  deviceId: '1',
  mainCategory: 'FarmParallel',
  subCategory: 'youngSanPo',
});

// require('default-intelligence');
// require('../../../../default-intelligence');

const protocolInfo = {
  deviceId: '1',
  mainCategory: 'FarmParallel',
  subCategory: 'youngSanPo',
};

describe('encoding Test 1', () => {
  const converter = new Converter(protocolInfo);
  it('generate Msg', done => {
    let cmd = converter.generationCommand(model.device.DEFAULT.COMMAND.STATUS);

    expect(cmd.length).to.eq(1);
    cmd = converter.generationCommand(model.device.CO2.COMMAND.STATUS);
    expect(cmd.length).to.eq(0);

    done();
  });
});

describe('Decoding Test', () => {
  const converter = new Converter(protocolInfo);
  it.only('receive Buffer To Data Body', done => {
    const protocol = decodingProtocolTable(protocolInfo.deviceId);

    // console.dir(protocol);
    // 명령 생성
    const commandStorage = converter.generationCommand(model.device.DEFAULT.COMMAND.STATUS);

    // 명령 발송 객체 생성
    // /** @type {dcData} */
    const dcData = {
      commandSet: {
        cmdList: commandStorage,
        currCmdIndex: 0,
      },
    };

    // data 18개 전부
    const fullData = [18, 8, 28, 14, 50, 51, 2200, 15, 302, 450, 800, 30, 352, 479, 80, 24, 10, 1];

    // 수신 받은 데이터 생성
    let res;
    // 0. 시스템 데이터 파싱, 에러 날 경우 강제 삭제 테스트
    dcData.data = fullData;
    res = converter.parsingUpdateData(dcData).data;
    BU.CLI(res);
    expect(_.get(res, 'name')).to.eq('Error');

    done();
  });

  it('automaticDecoding', done => {
    const converter = new Converter({
      deviceId: '001',
      mainCategory: 'Inverter',
      subCategory: 'das_1.3',
      option: true,
      protocolOptionInfo: {hasTrackingData: true},
    });
    // 명령 생성
    const commandStorage = converter.generationCommand(model.device.DEFAULT.COMMAND.STATUS);

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
    BU.CLI(res.data.message);
    dcData.data = Buffer.from('3,0100,380,24');
    res = converter.parsingUpdateData(dcData).data;
    BU.CLI(res.data);

    BU.CLI(res);
    // 10kW급 테스트 (scale, fixed Test)
    expect(_.get(res, BaseModel.BASE_KEY.sysLineVoltage)).to.eq(380);
    expect(_.get(res, BaseModel.BASE_KEY.sysCapaKw)).to.eq(10);
    expect(_.get(res, BaseModel.BASE_KEY.sysIsSingle)).to.eq(0);

    // 1. 시스템 데이터 파싱
    dcData.data = Buffer.from('^D017001,');
    res = converter.parsingUpdateData(dcData);
    BU.CLI(res.data.message);
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
    BU.CLI(res);
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
    BU.CLI(res);
    expect(_.get(res, BaseModel.BASE_KEY.operTroubleList).length).to.eq(1);

    done();
  });
});
