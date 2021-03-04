const _ = require('lodash');
const { expect } = require('chai');

const { BU } = require('base-util-jh');

const Converter = require('../../src/UPSAS/smRooftop/Converter');
const Model = require('../../src/UPSAS/smRooftop/Model');

const { decodingProtocolTable: DPT } = require('../../src/UPSAS/smRooftop/protocol');

const {
  di: {
    dcmConfigModel: { reqDeviceControlType: reqDCT },
  },
} = require('../../src/module');

const model = new Model();

const { BASE_KEY } = Model;

const { device: mDevice } = model;

describe('↓↓↓↓ Rooftop ↓↓↓↓', () => {
  const protocolInfo = {
    mainCategory: 'UPSAS',
    subCategory: 'smRooftop',
    deviceId: '0013A20010215369',
  };

  const converter = new Converter(protocolInfo);

  /** @type {[]} */
  const zigbeeReadFormats = converter.model.device.DEFAULT.COMMAND.STATUS;

  // BU.CLI(modbusReadFormats);

  const decodingProtocolInfo = DPT(protocolInfo);

  /** @type {nodeInfo[]} */
  const nodeList = [{}];

  // 인코딩
  it('encoding', done => {
    // 계측 명령 테스트
    let reqCmd = converter.generationCommand({
      key: mDevice.DEFAULT.KEY,
      value: reqDCT.MEASURE,
    });

    // 계측 명령은 1개이며 명령은 @sts 이다.
    expect(reqCmd).to.length(1);
    // data 키를 가지고 있어야 한다.
    expect(reqCmd[0].data.data).to.equal('@sts');

    // 수문 제어 명령 테스트
    reqCmd = converter.generationCommand({
      key: mDevice.WATER_DOOR.KEY,
      value: reqDCT.TRUE,
    });

    // 제어 명령은 2개이며 명령은 @cto 이다.
    expect(reqCmd).to.length(2);
    // data 키를 가지고 있어야 한다.
    expect(reqCmd[0].data.data).to.equal('@cto');
    done();
  });

  // 디코딩
  it.only('decoding', done => {
    // 0x90 Zigbee Receive Packet Frame
    const zigbeeReceivePacketInfo = {
      type: 0x90, // xbee_api.constants.FRAME_TYPE.ZIGBEE_RECEIVE_PACKET
      remote64: protocolInfo.deviceId,
      remote16: '7d84',
      receiveOptions: 0x01,
      data: [],
    };

    // 수문
    const dataHeader = ['#', '0001'];

    const waterDoorStatusInfo = {
      OPEN: '02',
      CLOSING: '03',
      CLOSE: '04',
      OPENING: '05',
    };
    // 수문
    let dataWaterDoor = ['0001', waterDoorStatusInfo.CLOSE, '12.3'];

    const onWaterDoorData = dataHeader.concat(dataWaterDoor).join('');
    console.dir(onWaterDoorData);
    console.dir(Buffer.from(onWaterDoorData));

    // 데이터 해석 후 waterDoor 상태가 CLOSE 이어야 한다.
    zigbeeReceivePacketInfo.data = Buffer.from(onWaterDoorData);

    /** @type {BASE_KEY} */
    let parsingResult = converter.concreteParsingData(zigbeeReceivePacketInfo, {
      destination64: protocolInfo.deviceId,
    });

    expect(parsingResult.waterDoor[0]).to.equal(mDevice.WATER_DOOR.STATUS.CLOSE);
    // Scenario 2번째. OPENING 정보를 해석 요청 후 상태 정보가 OPENING 이어야 한다.
    dataWaterDoor = ['0001', waterDoorStatusInfo.OPENING, '12.3'];

    zigbeeReceivePacketInfo.data = Buffer.from(dataHeader.concat(dataWaterDoor).join(''));
    parsingResult = converter.concreteParsingData(zigbeeReceivePacketInfo, {
      destination64: protocolInfo.deviceId,
    });

    expect(parsingResult.waterDoor[0]).to.equal(mDevice.WATER_DOOR.STATUS.OPENING);

    // 펌프
    const pumpStatusInfo = {
      OFF: '00',
      ON: '01',
    };
    const dataPump = ['0003', pumpStatusInfo.OFF, '22.3'];
    zigbeeReceivePacketInfo.data = Buffer.from(dataHeader.concat(dataPump).join(''));

    parsingResult = converter.concreteParsingData(zigbeeReceivePacketInfo, {
      destination64: protocolInfo.deviceId,
    });

    // 펌프 상태가 정지해야함
    expect(parsingResult.pump[0]).to.equal(mDevice.PUMP.STATUS.OFF);

    // 배터리가 22.3 이어야 한다
    expect(parsingResult.battery[0]).to.equal(22.3);
    done();
  });
});
