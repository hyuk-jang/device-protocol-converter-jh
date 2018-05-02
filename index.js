const AbstConverter = require('./src/default/AbstConverter');
require('./src/format/define');

/** Intelligence를 위함 */
// require('./src/saltern/xbee/control');

let controlCommand = {
  saltern: {
    xbee: require('./src/saltern/xbee/controlCommand')
  },
  weathercast: {
    vantagepro2: require('./src/weathercast/vantagepro2/controlCommand')
  }
};

let protocolFormat = {
  weathercast: require('./src/weathercast/baseFormat')
};

const weathercastProtocolFormat =  require('./src/weathercast/baseFormat');



module.exports = {
  AbstConverter,
  weathercastProtocolFormat,
  protocolFormat,
  controlCommand
};

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');





  process.on('uncaughtException', function (err) {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });
  
  
  process.on('unhandledRejection', function (err) {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });
}