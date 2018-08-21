require('../default-intelligence');

const defaultModule = require('./src/Default/DefaultModel');
const ESS = require('./src/ESS/BaseModel');
const Inverter = require('./src/Inverter/BaseModel');
const Weathercast = require('./src/Weathercast/BaseModel');
const UPSAS = require('./src/UPSAS/BaseModel');

const MainConverter = require('./src/Default/MainConverter');

/** Intelligence를 위함 */
const BaseModel = {
  defaultModule,
  ESS,
  Inverter,
  Weathercast,
  UPSAS,
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
