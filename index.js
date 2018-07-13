require('../default-intelligence');

const MainConverter = require('./src/Default/MainConverter');

/** Intelligence를 위함 */
const BaseModel = {
  default: require('./src/Default/DefaultModel'),
  ESS: require('./src/ESS/BaseModel'),
  Inverter: require('./src/Inverter/BaseModel'),
  Saltern: require('./src/Saltern/BaseModel'),
  Weathercast: require('./src/Weathercast/BaseModel')
};

module.exports = {
  AbstConverter: MainConverter,
  MainConverter,
  BaseModel
};

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  process.on('uncaughtException', function(err) {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });

  process.on('unhandledRejection', function(err) {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });
}
