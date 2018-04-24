const {expect} = require('chai');
const {BU} = require('base-util-jh');
const _ = require('lodash');

const Converter = require('../../src/saltern/xbee/Converter');

describe('encoding Test 1', () => {
  const converter = new Converter({deviceId:'0013A20010215369'} );
  it('encoding Xbee', done => {

    let cmdInfo = converter.generationCommand({cmdKey: 'open', target: 'waterDoor'});
    let genCmdInfo =_.head(cmdInfo);
    expect(genCmdInfo.destination64).to.be.eq('0013A20010215369');
    expect(genCmdInfo.data).to.be.equal('@cgo');

    BU.CLI(cmdInfo);
    cmdInfo = converter.generationCommand({cmdKey: 'open', target: 'ghost'});
    genCmdInfo =_.head(cmdInfo);
    expect(genCmdInfo.destination64).to.be.eq('0013A20010215369');
    expect(genCmdInfo.data).to.be.equal(undefined);

    BU.CLI(converter.frameIdList); 

    done();
  });

  it('decoding Xbee', done => {
    done();
  });

});