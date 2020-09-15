const _ = require('lodash');

const baseFormat = require('./baseFormat');

const AbstBaseModel = require('../Default/AbstBaseModel');

class BaseModel extends AbstBaseModel {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super();
    this.baseFormat = _.clone(baseFormat);

    const baseKey = { ...baseFormat };
    _.forEach(baseKey, (v, k) => _.set(baseKey, k, k));

    this.device = {
      DEFAULT: {
        /**
         * @type {string} DataLogger
         * @default DEFAULT 기본적인 Data Logger 값
         */
        KEY: 'DEFAULT',
        STATUS: {
          UNDEF: 'UNDEF',
        },
        COMMAND: {
          STATUS: [],
        },
      },
      WATER_DOOR: {
        KEY: baseKey.waterDoor,
        NAME: '수문',
        STATUS: {
          STOP: 'STOP',
          OPEN: 'OPEN',
          OPENING: 'OPENING',
          CLOSE: 'CLOSE',
          CLOSING: 'CLOSING',
        },
        COMMAND: {
          OPEN: [],
          CLOSE: [],
          STATUS: [],
        },
        /** @type {string} 수문 */
      },
      GATE_VALVE: {
        KEY: baseKey.gateValve,
        NAME: '수문용 밸브',
        STATUS: {
          UNDEF: 'UNDEF',
          CLOSE: 'CLOSE',
          OPEN: 'OPEN',
          BUSY: 'BUSY',
          CLOSING: 'CLOSING',
          OPENING: 'OPENING',
        },
        COMMAND: {
          OPEN: [],
          CLOSE: [],
          STATUS: [],
        },
        /** @type {string} 수문 */
      },
      VALVE: {
        /** @type {string} 밸브 */
        KEY: baseKey.valve,
        NAME: '밸브',
        STATUS: {
          UNDEF: 'UNDEF',
          CLOSE: 'CLOSE',
          OPEN: 'OPEN',
          BUSY: 'BUSY',
          CLOSING: 'CLOSING',
          OPENING: 'OPENING',
        },
        COMMAND: {
          OPEN: [],
          CLOSE: [],
          STATUS: [],
        },
      },
      PUMP: {
        /** @type {string} 펌프 */
        KEY: baseKey.pump,
        NAME: '펌프',
        STATUS: {
          OFF: 'OFF',
          ON: 'ON',
        },
        COMMAND: {
          ON: [],
          OFF: [],
          STATUS: [],
        },
      },
      WATER_LEVEL: {
        /** @type {string} 수위 */
        KEY: baseKey.waterLevel,
        NAME: '수위',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      SALINITY: {
        /** @type {string} 염도 */
        KEY: baseKey.salinity,
        NAME: '염도',
        STATUS: {},
        COMMAND: {
          MEASURE: [],
          STATUS: [],
        },
      },
      BRINE_TEMPERATURE: {
        /** @type {string} 수중 온도 */
        KEY: baseKey.brineTemperature,
        NAME: '수온',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      MODULE_FRONT_TEMPERATURE: {
        /** @type {string} 모듈 앞면 온도 */
        KEY: baseKey.moduleFrontTemperature,
        NAME: '모듈 온도',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      MODULE_REAR_TEMPERATURE: {
        /** @type {string} 모듈 뒷면 온도 */
        // KEY: 'moduleRearTemperature',
        KEY: baseKey.moduleRearTemperature,
        NAME: '모듈 온도',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      CONNECTOR_GROUND_RELAY: {
        /** @type {string} 접속반 지락 계전기 */
        KEY: baseKey.isConnectorGroundRelay,
        NAME: '지락 계전기',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      BATTERY: {
        /** @type {string} 배터리 전압 */
        KEY: baseKey.battery,
        NAME: '배터리 전압',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
    };

    /** Protocol 정보에 따라 자동으로 세부 Model Binding */
    if (protocolInfo) {
      return this.bindingSubCategory(protocolInfo);
    }
  }

  /** 현재 카테고리에 있는 장치 데이터를 저장하기 위한 모델 */
  static get BASE_MODEL() {
    return _.cloneDeep(baseFormat);
  }

  /** BASE_MODEL Key와 같은 값을 가진 Value를 매칭 후 반환 */
  static get BASE_KEY() {
    const baseKey = _.clone(baseFormat);
    _.forEach(baseKey, (v, k) => _.set(baseKey, k, k));
    return baseKey;
  }
}
module.exports = BaseModel;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  /** @type {protocol_info} */
  const protocolInfo = {
    mainCategory: 'Saltern',
    subCategory: 'xbee',
  };

  console.log(BaseModel.BASE_KEY);
  console.log(BaseModel.GET_BASE_KEY(protocolInfo));
  const model = new BaseModel(protocolInfo);

  // console.log(model);
  console.log(model.device.PUMP.COMMAND.OFF);
}
