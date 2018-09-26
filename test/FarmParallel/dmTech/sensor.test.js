const _ = require('lodash');

const moment = require('moment');
const {expect} = require('chai');
const {BU} = require('base-util-jh');

const Converter = require('../../../src/FarmParallel/dmTech/Converter');
const Model = require('../../../src/FarmParallel/dmTech/Model');

const {BASE_MODEL} = Model;

const {decodingProtocolTable} = require('../../../src/FarmParallel/dmTech/protocol');

const protocolInfo = {
  deviceId: '1',
  mainCategory: 'FarmParallel',
  subCategory: 'dmTech',
};
// 명령 모델 객체를 생성.(protocolInfo 강제 입력)
const model = new Model(protocolInfo);

// require('default-intelligence');
// require('../../../../default-intelligence');

// 센서류 데이터를 가져오기 위한 명령 변환 테스트
describe.only('encoding Test 1', () => {
  const converter = new Converter(protocolInfo);
  // 1. 모든 데이터 요청
  // 2. 특정 데이터 요청
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
  it('receive Buffer To Data Body', done => {
    const protocol = decodingProtocolTable(protocolInfo.deviceId);

    // console.dir(protocol);
    // 명령 생성
    let commandStorage = converter.generationCommand(model.device.DEFAULT.COMMAND.STATUS);

    // 명령 발송 객체 생성
    // /** @type {dcData} */
    const dcData = {
      commandSet: {
        cmdList: commandStorage,
        currCmdIndex: 0,
      },
      data: [],
    };

    // data 18개 전부
    const fullData = [17, 5, 25, 14, 50, 51, 2200, 15, 302, 450, 800, 30, 352, 479, 80, 24, 10, 1];

    // 수신 받은 데이터 생성
    /** @type {BASE_MODEL} */
    let res;
    // 전체 데이터 파싱 테스트
    dcData.data = fullData;
    res = converter.parsingUpdateData(dcData).data;
    // BU.CLI(res);
    // BU.CLI(moment(_.head(res.writeDate)).format('YYYY-MM-DD HH:mm:ss'));
    expect(_.head(res.co2)).to.be.eq(80.0);

    // 조도만 가져오고자 할 경우
    commandStorage = converter.generationCommand(model.device.LUX.COMMAND.STATUS);
    BU.CLI(_.head(commandStorage));
    dcData.commandSet.cmdList = commandStorage;
    dcData.data = [38];
    res = converter.parsingUpdateData(dcData).data;
    BU.CLI(res);
    // BU.CLI(moment(_.head(res.writeDate)).format('YYYY-MM-DD HH:mm:ss'));
    expect(_.head(res.lux)).to.be.eq(3.8);

    // 테스트 요청
    commandStorage = converter.generationCommand([
      {
        unitId: '1',
        address: 2,
        length: 13,
      },
    ]);
    dcData.commandSet.cmdList = commandStorage;
    dcData.data = [28, 14, 50, 51, 2200, 15, 302, 450, 800, 30, 352, 480, 80, 24, 10, 1];

    res = converter.parsingUpdateData(dcData).data;
    // BU.CLI(res);
    expect(_.head(res.outsideAirReh)).to.be.eq(48.0);

    // BU.CLI(moment(_.head(res.writeDate)).format('YYYY-MM-DD HH:mm:ss'));

    done();
  });
});
