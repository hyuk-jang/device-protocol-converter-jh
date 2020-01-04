const _ = require('lodash');

const moment = require('moment');
const { expect } = require('chai');
const { BU } = require('base-util-jh');

const Converter = require('../../../src/FarmParallel/dmTech/Converter');
const Model = require('../../../src/FarmParallel/dmTech/Model');

const { BASE_MODEL } = Model;

/** @type {protocol_info} */
const protocolInfo = {
  deviceId: 1,
  mainCategory: 'FarmParallel',
  subCategory: 'dmTech',
  wrapperCategory: 'default',
};
// 명령 모델 객체를 생성.(protocolInfo 강제 입력)
const model = new Model(protocolInfo);

// 센서류 데이터를 가져오기 위한 명령 변환 테스트
describe('encoding Test 1', () => {
  const converter = new Converter(protocolInfo);
  // 1. 모든 데이터 요청
  // 2. 특정 데이터 요청
  it('generate Msg', done => {
    const statusCmdList = model.device.DEFAULT.COMMAND.STATUS;
    const statusCmdInfo = _.head(statusCmdList);

    let cmdList = converter.generationCommand({ key: model.device.DEFAULT.KEY, value: 2 });

    const cmdInfo = _.head(cmdList);
    /** @type {Buffer} */
    const bufData = cmdInfo.data;

    const STX = bufData.slice(0, 1);
    const CODE = bufData.slice(1, 2);
    const slaveAddr = bufData.slice(2, 3);
    const fnCode = bufData.slice(3, 4);
    const registerAddr = bufData.slice(4, 6);
    const dataLength = bufData.slice(6, 8);
    const ETX = bufData.slice(bufData.length - 1);

    const isSTX = _.isEqual(STX, converter.protocolConverter.STX);
    const isETX = _.isEqual(ETX, converter.protocolConverter.ETX);

    // 프로토콜에 맞는 데이터인지 모두 확인
    expect(isSTX).to.be.true;
    expect(CODE.toString()).to.be.eq('S');
    expect(isETX).to.be.true;

    expect(slaveAddr.readUIntBE(0, 1)).to.eq(Number(statusCmdInfo.unitId));
    expect(fnCode.readUIntBE(0, 1)).to.eq(statusCmdInfo.fnCode);
    expect(registerAddr.readUIntBE(0, 2)).to.eq(statusCmdInfo.address);
    expect(dataLength.readUIntBE(0, 2)).to.eq(statusCmdInfo.dataLength);

    expect(cmdList.length).to.eq(1);
    cmdList = converter.generationCommand({
      key: model.device.LUX.KEY,
      value: 2,
    });
    // 데이터 눈으로 확인. 일일이 쓰기 귀찮음
    BU.CLI(cmdList);
    expect(cmdList.length).to.eq(1);

    done();
  });
});

describe('Decoding Test', () => {
  const converter = new Converter(protocolInfo);
  // 1. addr: 6, length: 12 을 가진 가상 데이터 생성
  // 2. 가상 데이터 파싱 테스트
  // 3. addr: 6, length: 1 을 가진 가상 데이터 파싱
  it('receive Full Data Buffer To Data Body', done => {
    const statusCmdList = model.device.DEFAULT.COMMAND.STATUS;
    const statusCmdInfo = _.head(statusCmdList);
    // 명령 생성
    const cmdList = converter.generationCommand({ key: model.device.DEFAULT.KEY, value: 2 });
    // const cmdList = converter.generationCommand(statusCmdList);
    // 명령 발송 객체 생성
    // /** @type {dcData} */
    const dcData = {
      commandSet: {
        cmdList,
        currCmdIndex: 0,
      },
      data: [],
    };

    // data 18개 전부
    const { unitId, fnCode, address, dataLength } = statusCmdInfo;
    const mbapHeader = Buffer.concat([
      converter.protocolConverter.convertNumToHxToBuf(unitId, 1),
      converter.protocolConverter.convertNumToHxToBuf(fnCode, 1),
      converter.protocolConverter.convertNumToHxToBuf(dataLength, 1),
    ]);
    const fullData = [2200, 15, 302, 450, 800, 30, 352, 479, 80, 24, 10, 1];

    const bufFullData = converter.protocolConverter.convertNumToHxToBuf(fullData, 2);

    // 1. addr: 0, length: 18 을 가진 가상 데이터 생성
    const coverdBufFullData = converter.coverFrame(Buffer.concat([mbapHeader, bufFullData]));

    // 수신 받은 데이터 생성
    // 2. 가상 데이터 파싱 테스트
    dcData.data = coverdBufFullData;
    /** @type {BASE_MODEL} */
    const res = converter.parsingUpdateData(dcData).data;
    BU.CLI(res);
    // BU.CLI(moment(_.head(res.writeDate)).format('YYYY-MM-DD HH:mm:ss'));

    expect(_.head(res.soilWaterValue)).to.be.eq(3.0);
    done();
  });
  // 1. addr: 0, length: 18 을 가진 가상 데이터 생성
  // 2. 가상 데이터 파싱 테스트
  // 3. addr: 6, length: 1 을 가진 가상 데이터 파싱
  it('receive Lux Data Buffer To Data Body', done => {
    const statusCmdList = model.device.LUX.COMMAND.STATUS;
    const statusCmdInfo = _.head(statusCmdList);
    // 명령 생성
    // const cmdList = converter.generationCommand(statusCmdList);
    const cmdList = converter.generationCommand({
      key: model.device.LUX.KEY,
      value: 2,
    });
    // 명령 발송 객체 생성
    // /** @type {dcData} */
    const dcData = {
      commandSet: {
        cmdList,
        currCmdIndex: 0,
      },
      data: [],
    };

    // data 12개 전부
    const { unitId, fnCode, address, dataLength } = statusCmdInfo;
    const mbapHeader = Buffer.concat([
      converter.protocolConverter.convertNumToHxToBuf(unitId, 1),
      converter.protocolConverter.convertNumToHxToBuf(fnCode, 1),
      converter.protocolConverter.convertNumToHxToBuf(dataLength, 1),
    ]);
    const fullData = [2200, 15, 302, 450, 800, 30, 352, 479, 80, 24, 10, 1];

    const bufFullData = converter.protocolConverter.convertNumToHxToBuf([2200], 2);

    // 1. addr: 0, length: 18 을 가진 가상 데이터 생성
    const coverdBufFullData = converter.coverFrame(Buffer.concat([mbapHeader, bufFullData]));

    // 수신 받은 데이터 생성
    // 2. 가상 데이터 파싱 테스트
    dcData.data = coverdBufFullData;
    /** @type {BASE_MODEL} */
    const res = converter.parsingUpdateData(dcData).data;
    // BU.CLI(moment(_.head(res.writeDate)).format('YYYY-MM-DD HH:mm:ss'));

    BU.CLI(res);
    expect(_.head(res.lux)).to.be.eq(2200);
    done();
  });
});
