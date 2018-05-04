const AbstConverter = require('./src/default/AbstConverter');
require('./src/format/defaultDefine');

/** Intelligence를 위함 */
// require('./src/saltern/xbee/control');
const operationController = {
  saltern: {
    xbee: require('./src/saltern/xbee/controlCommand')
  },
  weathercast: {
    vantagepro2: require('./src/weathercast/vantagepro2/controlCommand')
  }
};


const baseFormat = {
  saltern: require('./src/saltern/baseFormat'),
  weathercast: {
    vantagepro2: require('./src/weathercast/vantagepro2/controlCommand')
  }
};

const deviceStatus = {
  saltern: require('./src/saltern/baseModel').deviceModel,
};



module.exports = {
  AbstConverter,
  operationController,
  baseFormat,
  deviceStatus
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