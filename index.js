const AbstConverter = require('./src/default/AbstConverter');
require('./src/format/defaultDefine');

/** Intelligence를 위함 */
// require('./src/saltern/xbee/control');

const {baseFormat, deviceStatus, operationController} = require('./src/SetAPI');

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