/* eslint-disable global-require */
const { BU } = require('base-util-jh');

/** @param {protocol_info} protocolInfo */
module.exports = protocolInfo => {
  // BU.CLI(protocolInfo);
  const { mainCategory, subCategory } = protocolInfo;
  let Converter;
  let Model;
  let baseFormat;

  switch (mainCategory) {
    case 'ETC':
      baseFormat = require('../ETC/baseFormat');
      switch (subCategory) {
        case 'JK_NR_2':
          Converter = require('../ETC/JK_NR_2/Converter');
          Model = require('../ETC/JK_NR_2/Model');
          break;
        case 'Kincony':
          Converter = require('../ETC/Kincony/Converter');
          Model = require('../ETC/Kincony/Model');
          break;
        case 'BatSm':
          Converter = require('../ETC/BatSm/Converter');
          Model = require('../ETC/BatSm/Model');
          break;
        default:
          break;
      }
      break;
    case 'FarmParallel':
      baseFormat = require('../FarmParallel/baseFormat');
      switch (subCategory) {
        case 'dmTech':
          Converter = require('../FarmParallel/dmTech/Converter');
          Model = require('../FarmParallel/dmTech/Model');
          break;
        default:
          break;
      }
      break;
    case 'Inverter':
      baseFormat = require('../Inverter/baseFormat');
      switch (subCategory) {
        case 'ESP3K5':
          Converter = require('../Inverter/ESP3K5/Converter');
          Model = require('../Inverter/ESP3K5/Model');
          break;
        case 'KDX_300':
          Converter = require('../Inverter/KDX_300/Converter');
          Model = require('../Inverter/KDX_300/Model');
          break;
        case 'das_1.3':
          Converter = require('../Inverter/das_1.3/Converter');
          Model = require('../Inverter/das_1.3/Model');
          break;
        case 'hexPowerSingle':
          Converter = require('../Inverter/hexPowerSingle/Converter');
          Model = require('../Inverter/hexPowerSingle/Model');
          break;
        case 'hexPowerTriple':
          Converter = require('../Inverter/hexPowerTriple/Converter');
          Model = require('../Inverter/hexPowerTriple/Model');
          break;
        case 's5500k':
          Converter = require('../Inverter/s5500k/Converter');
          Model = require('../Inverter/s5500k/Model');
          break;

        default:
          break;
      }
      break;
    case 'NI':
      baseFormat = require('../NI/baseFormat');
      switch (subCategory) {
        case 'cDaq':
          Converter = require('../NI/cDaq/Converter');
          Model = require('../NI/cDaq/Model');
          break;
        default:
          break;
      }
      break;
    case 'S2W':
      baseFormat = require('../S2W/baseFormat');
      switch (subCategory) {
        case 'dmTech':
          Converter = require('../S2W/dmTech/Converter');
          Model = require('../S2W/dmTech/Model');
          break;
        case 'sm':
          Converter = require('../S2W/sm/Converter');
          Model = require('../S2W/sm/Model');
          break;
        default:
          break;
      }
      break;
    case 'Sensor':
      baseFormat = require('../Sensor/baseFormat');
      switch (subCategory) {
        case 'CNT_DK_v2.2':
          Converter = require('../Sensor/CNT_DK_v2.2/Converter');
          Model = require('../Sensor/CNT_DK_v2.2/Model');
          break;
        case 'CNT_dm_v1':
          Converter = require('../Sensor/CNT_dm_v1/Converter');
          Model = require('../Sensor/CNT_dm_v1/Model');
          break;
        case 'EanEnv':
          Converter = require('../Sensor/EanEnv/Converter');
          Model = require('../Sensor/EanEnv/Model');
          break;
        case 'EanPV':
          Converter = require('../Sensor/EanPV/Converter');
          Model = require('../Sensor/EanPV/Model');
          break;

        default:
          break;
      }
      break;
    case 'STP':
      baseFormat = require('../STP/baseFormat');
      switch (subCategory) {
        case 'JungHan':
          Converter = require('../STP/JungHan/Converter');
          Model = require('../STP/JungHan/Model');
          break;
        default:
          break;
      }
      break;
    case 'UPSAS':
      baseFormat = require('../UPSAS/baseFormat');
      switch (subCategory) {
        case 'xbee':
          Converter = require('../UPSAS/xbee/Converter');
          Model = require('../UPSAS/xbee/Model');
          break;
        case 'muan100kW':
          Converter = require('../UPSAS/muan100kW/Converter');
          Model = require('../UPSAS/muan100kW/Model');
          break;
        case 'smRooftop':
          Converter = require('../UPSAS/smRooftop/Converter');
          Model = require('../UPSAS/smRooftop/Model');
          break;
        default:
          break;
      }
      break;
    case 'Weathercast':
      baseFormat = require('../Weathercast/baseFormat');
      switch (subCategory) {
        case 'vantagepro2':
          Converter = require('../Weathercast/vantagepro2/Converter');
          Model = require('../Weathercast/vantagepro2/Model');
          break;
        default:
          break;
      }
      break;
    default:
      break;
  }

  return {
    baseFormat,
    Converter,
    Model,
  };
};
