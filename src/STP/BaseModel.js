const _ = require('lodash');

const baseFormat = require('./baseFormat');

const AbstBaseModel = require('../Default/AbstBaseModel');

class BaseModel extends AbstBaseModel {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super();
    this.baseFormat = _.clone(baseFormat);

    const BK = { ...baseFormat };
    _.forEach(BK, (v, k) => _.set(BK, k, k));

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
          WAKEUP: [],
          STATUS_POWER: [],
          RESTART: [],
        },
      },
      RELAY: {
        KEY: [BK.relay],
        NAME: '릴레이',
        STATUS: {
          ON: 'ON',
          OFF: 'OFF',
        },
        COMMAND: {
          STATUS: [{}],
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
