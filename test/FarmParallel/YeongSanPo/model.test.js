const _ = require('lodash');

const moment = require('moment');
const { expect } = require('chai');
const { BU } = require('base-util-jh');

const Converter = require('../../../src/FarmParallel/YeongSanPo/Converter');
const Model = require('../../../src/FarmParallel/YeongSanPo/Model');

const { BASE_MODEL } = Model;

const { decodingProtocolTable } = require('../../../src/FarmParallel/YeongSanPo/protocol');

const model = new Model({
  deviceId: '1',
  mainCategory: 'FarmParallel',
  subCategory: 'YeongSanPo',
});

const protocolInfo = {
  deviceId: '1',
  mainCategory: 'FarmParallel',
  subCategory: 'YeongSanPo',
};

describe('encoding Test 1', () => {
  const converter = new Converter(protocolInfo);
  it('generate Msg', done => {
    let cmdList = converter.generationCommand({ key: model.device.DEFAULT.KEY, value: 2 });
    BU.CLI(cmdList);
    const cmdInfo = _.head(cmdList);
    expect(cmdList.length).to.eq(1);
    expect(cmdInfo.data.unitId).to.eq('1');
    cmdList = converter.generationCommand({ key: model.device.SOIL_TEMPERATURE.KEY, value: 2 });
    BU.CLI(cmdList);

    expect(_.head(cmdList).data.dataLength).to.eq(1);

    done();
  });
});

describe('Decoding Test', () => {
  const converter = new Converter(protocolInfo);
  it('receive Buffer To Data Body', done => {
    const protocol = decodingProtocolTable(protocolInfo.deviceId);

    // console.dir(protocol);
    // 명령 생성
    let commandStorage = converter.generationCommand({ key: model.device.DEFAULT.KEY, value: 2 });

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
    const fullData = [2200, 15, 302, 450, 800, 30, 352, 479, 80, 24, 10, 1];

    // 수신 받은 데이터 생성
    /** @type {BASE_MODEL} */
    let res;
    // 전체 데이터 파싱 테스트
    dcData.data = fullData;
    res = converter.parsingUpdateData(dcData).data;
    BU.CLI(res);
    // BU.CLI(moment(_.head(res.writeDate)).format('YYYY-MM-DD HH:mm:ss'));
    expect(_.head(res.outsideAirTemperature)).to.be.eq(-4.8);

    // 조도만 가져오고자 할 경우
    commandStorage = converter.generationCommand({ key: model.device.LUX.KEY, value: 2 });
    BU.CLI(_.head(commandStorage));
    dcData.commandSet.cmdList = commandStorage;
    dcData.data = [38];
    res = converter.parsingUpdateData(dcData).data;
    BU.CLI(res);
    // BU.CLI(moment(_.head(res.writeDate)).format('YYYY-MM-DD HH:mm:ss'));
    expect(_.head(res.lux)).to.be.eq(38);

    // BU.CLI(moment(_.head(res.writeDate)).format('YYYY-MM-DD HH:mm:ss'));

    done();
  });
});
