const { expect } = require('chai');
const { BU } = require('base-util-jh');
const _ = require('lodash');

const Converter = require('../../src/UPSAS/xbee/Converter');

const Model = require('../../src/UPSAS/xbee/Model');

const { reqDeviceControlType } = require('../../src/module').di.dcmConfigModel;

const model = new Model();

describe('encoding Test 1', () => {
  const converter = new Converter({ deviceId: '0013A20010215369' });
  it('encoding Xbee', done => {
    BU.CLI(model.device.WATER_DOOR.COMMAND.OPEN);
    let cmdInfo = converter.generationCommand({
      key: model.device.WATER_DOOR.KEY,
      value: reqDeviceControlType.TRUE,
    });
    BU.CLI(cmdInfo);
    let genCmdInfo = _.head(cmdInfo);
    BU.CLI(genCmdInfo);
    expect(genCmdInfo.data.destination64).to.eq('0013A20010215369');
    expect(genCmdInfo.data.data).to.eq(_.head(model.device.WATER_DOOR.COMMAND.OPEN).cmd);
    expect(_.nth(cmdInfo, 1).data.data).to.be.equal(
      _.nth(model.device.WATER_DOOR.COMMAND.STATUS, 0).cmd,
    );

    BU.CLI(cmdInfo);
    cmdInfo = converter.generationCommand({
      key: model.device.VALVE.KEY,
      value: reqDeviceControlType.FALSE,
    });
    genCmdInfo = _.head(cmdInfo);
    BU.CLI(genCmdInfo);
    expect(genCmdInfo.data.destination64).to.be.eq('0013A20010215369');
    expect(genCmdInfo.data.data).to.be.equal(
      _.nth(model.device.VALVE.COMMAND.CLOSE, 0).cmd,
    );
    expect(_.nth(cmdInfo, 1).data.data).to.be.equal(
      _.nth(model.device.VALVE.COMMAND.STATUS, 0).cmd,
    );

    BU.CLI(converter.frameIdList);

    done();
  });
});

describe('Decoding Test', function () {
  // const baseFormat = require('../../src/Saltern/baseFormat');
  // const {deviceModel} = require('../../src/Saltern/baseModel');
  const converter = new Converter({
    mainCategory: 'UPSAS',
    subCategory: 'xbee',
    deviceId: '0013A20010215369',
  });
  it('automaticDecoding', function (done) {
    // BU.CLI(baseFormat);
    // BU.CLI(deviceModel);

    const requestData = {
      data: {
        type: 16,
        id: 1,
        destination64: '0013A20040F7AB6C',
        data: '@cgc',
      },
      commandExecutionTimeoutMs: 1000,
      delayExecutionTimeoutMs: false,
    };

    const responseData = {
      type: 144,
      remote64: '0013a20040f7ab6c',
      remote16: 'e77b',
      receiveOptions: 1,
      data: {
        type: 'Buffer',
        data: [
          35,
          48,
          48,
          48,
          49,
          48,
          48,
          48,
          50,
          48,
          49,
          48,
          55,
          49,
          48,
          48,
          48,
          46,
          48,
          48,
          48,
          50,
          50,
          46,
          55,
          48,
          57,
          46,
          55,
        ],
      },
    };
    // data:{'type':'Buffer','data':[35,48,48,48,49,48,48,48,49,48,52,48,48,48,48,48,48,49,48,46,50,]}};
    responseData.data = Buffer.from(responseData.data);

    const decodingObj = converter.parsingUpdateData({ data: responseData });
    BU.CLI(decodingObj);

    done();
  });
});
