const {expect} = require('chai');
const {BU} = require('base-util-jh');
const _ = require('lodash');

const Converter = require('../../src/saltern/xbee/Converter');

const controlCommand = require('../../src/saltern/xbee/controlCommand');

describe.skip('encoding Test 1', () => {
  const converter = new Converter({deviceId:'0013A20010215369'} );
  it('encoding Xbee', done => {

    let cmdInfo = converter.generationCommand(controlCommand.waterDoor.OPEN);
    let genCmdInfo =_.head(cmdInfo);
    expect(genCmdInfo.data.destination64).to.eq('0013A20010215369');
    expect(genCmdInfo.data.data).to.eq(controlCommand.waterDoor.OPEN.cmd);
    expect(_.nth(cmdInfo, 1).data.data).to.be.equal(controlCommand.waterDoor.STATUS.cmd);

    BU.CLI(cmdInfo);
    cmdInfo = converter.generationCommand(controlCommand.valve.CLOSE);
    genCmdInfo =_.head(cmdInfo);
    expect(genCmdInfo.data.destination64).to.be.eq('0013A20010215369');
    expect(genCmdInfo.data.data).to.be.equal(controlCommand.valve.CLOSE.cmd);
    expect(_.nth(cmdInfo, 1).data.data).to.be.equal(controlCommand.valve.STATUS.cmd);

    BU.CLI(converter.frameIdList); 

    done();
  });
});

describe('Decoding Test', function() {
  // const baseFormat = require('../../src/saltern/baseFormat');
  // const {deviceModel} = require('../../src/saltern/baseModel');
  const converter = new Converter({deviceId:'0013A20010215369'} );
  it('automaticDecoding', function(done) {
    // BU.CLI(baseFormat);
    // BU.CLI(deviceModel);
    
    const requestData = { data:
      { type: 16,
        id: 1,
        destination64: '0013A20040F7AB6C',
        data: '@cgc' },
    commandExecutionTimeoutMs: 1000,
    delayExecutionTimeoutMs: false };

    const responseData = { type: 144,
      remote64: '0013a20040f7ab6c',
      remote16: 'e77b',
      receiveOptions: 1,
      data:{'type':'Buffer','data':[35,48,48,48,49,48,48,48,49,48,52,48,48,48,48,48,48,49,48,46,50,]}};
    responseData.data = Buffer.from(responseData.data);

    let decodingObj = converter.parsingUpdateData({data: responseData});
    BU.CLI(decodingObj);

    done();
  });

});