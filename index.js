const AbstConverter = require('./src/default/AbstConverter');
require('./src/format/define');

/** Intelligence를 위함 */
const weathercastProtocolFormat =  require('./src/weathercast/baseFormat');



module.exports = {
  AbstConverter,
  weathercastProtocolFormat
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