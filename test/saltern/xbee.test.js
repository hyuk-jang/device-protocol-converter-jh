const {expect} = require('chai');
const {BU} = require('base-util-jh');
const _ = require('lodash');

const Converter = require('../../src/saltern/xbee/Converter');

const controlCommand = require('../../src/saltern/xbee/controlCommand');

describe('encoding Test 1', () => {
  const converter = new Converter({deviceId:'0013A20010215369'} );
  it('encoding Xbee', done => {

    let cmdInfo = converter.generationCommand(controlCommand.waterDoor.OPEN);
    let genCmdInfo =_.head(cmdInfo);
    expect(genCmdInfo.destination64).to.eq('0013A20010215369');
    expect(genCmdInfo.data).to.eq(controlCommand.waterDoor.OPEN.cmd);
    expect(_.nth(cmdInfo, 1).data).to.be.equal(controlCommand.waterDoor.STATUS.cmd);

    BU.CLI(cmdInfo);
    cmdInfo = converter.generationCommand(controlCommand.valve.CLOSE);
    genCmdInfo =_.head(cmdInfo);
    expect(genCmdInfo.destination64).to.be.eq('0013A20010215369');
    expect(genCmdInfo.data).to.be.equal(controlCommand.valve.CLOSE.cmd);
    expect(_.nth(cmdInfo, 1).data).to.be.equal(controlCommand.valve.STATUS.cmd);

    BU.CLI(converter.frameIdList); 

    done();
  });

  it('decoding Xbee', done => {
    done();
  });

});