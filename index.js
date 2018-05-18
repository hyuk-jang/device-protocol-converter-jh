const AbstConverter = require('./src/default/AbstConverter');
require('./src/format/defaultDefine');

/** Intelligence를 위함 */
const BaseModel = {
  default: require('./src/default/DefaultModel'),
  Inverter: require('./src/inverter/baseModel'),
  Saltern: require('./src/saltern/baseModel'),
  Weathercast: require('./src/weathercast/baseModel')
};


module.exports = {
  AbstConverter,
  BaseModel
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