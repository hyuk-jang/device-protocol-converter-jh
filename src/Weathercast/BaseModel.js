const _ = require('lodash');
const baseFormat = require('./baseFormat');

const AbstBaseModel = require('../Default/AbstBaseModel');

class BaseModel extends AbstBaseModel {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super(protocolInfo);

    this.baseFormat = _.clone(baseFormat);

    this.device = {
      DEFAULT: {
        STATUS: {
          UNDEF: 'UNDEF',
        },
        COMMAND: {
          WAKEUP: '',
          LOOP: '',
          LOOP_INDEX: '',
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
    mainCategory: 'Test',
    subCategory: 'das_1.3',
  };

  const model = new BaseModel(protocolInfo);

  console.log('@@@');
  // console.dir(model);
  console.log(model);
  console.log(model.device.POWER.COMMAND.STATUS);
}
