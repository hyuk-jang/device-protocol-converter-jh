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
      WRITE_DATE: {
        KEY: baseKey.writeDate,
        NAME: '측정 시간',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      SOIL_TEMPERATURE: {
        KEY: baseKey.soilTemperature,
        NAME: '토양 온도',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      OUTSIDE_AIR_TEMPERATURE: {
        KEY: baseKey.outsideAirTemperature,
        NAME: '외기 온도',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      PV_REAR_TEMPERATURE: {
        KEY: baseKey.pvRearTemperature,
        NAME: '모듈 뒷면 온도',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      SOIL_REH: {
        KEY: baseKey.soilReh,
        NAME: '토양 습도',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      OUTSIDE_AIR_REH: {
        KEY: baseKey.outsideAirReh,
        NAME: '외기 습도',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      WIND_SPEED: {
        KEY: baseKey.windSpeed,
        NAME: '풍속',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      WIND_DIRECTRION: {
        KEY: baseKey.windDirection,
        NAME: '풍향',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      HORIZONTAL_SOLAR: {
        KEY: baseKey.horizontalSolar,
        NAME: '일사량',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      INCLINED_SOLAR: {
        KEY: baseKey.inclinedSolar,
        NAME: '경사 일사량',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      R1: {
        KEY: baseKey.r1,
        NAME: '시간당 강우량',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      IS_RAIN: {
        KEY: baseKey.isRain,
        NAME: '강우 감지 여부',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      CO2: {
        KEY: baseKey.co2,
        NAME: '이산화탄소',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      LUX: {
        KEY: baseKey.lux,
        NAME: '조도',
        STATUS: {},
        COMMAND: {
          STATUS: [],
        },
      },
      SOIL_WATER_VALUE: {
        KEY: baseKey.soilWaterValue,
        NAME: '토양 EC 값',
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
