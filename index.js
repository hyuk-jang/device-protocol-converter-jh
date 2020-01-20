const defaultModule = require('./src/Default/DefaultModel');
const defaultWrapper = require('./src/Default/defaultWrapper');
const ESS = require('./src/ESS/BaseModel');
const FarmParallel = require('./src/FarmParallel/BaseModel');
const S2W = require('./src/S2W/BaseModel');
const Inverter = require('./src/Inverter/BaseModel');
const Weathercast = require('./src/Weathercast/BaseModel');
const UPSAS = require('./src/UPSAS/BaseModel');
const Sensor = require('./src/Sensor/BaseModel');

const MainConverter = require('./src/Default/MainConverter');

/** Intelligence를 위함 */
const BaseModel = {
  defaultModule,
  defaultWrapper,
  ESS,
  FarmParallel,
  S2W,
  Inverter,
  Weathercast,
  UPSAS,
  Sensor,
};

module.exports = {
  AbstConverter: MainConverter,
  MainConverter,
  BaseModel,
};

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  process.on('uncaughtException', err => {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });

  process.on('unhandledRejection', err => {
    // BU.debugConsole();
    console.error(err.stack);
    console.log(err.message);
    console.log('Node NOT Exiting...');
  });
}
