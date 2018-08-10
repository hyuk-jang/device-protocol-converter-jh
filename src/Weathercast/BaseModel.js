'use strict';
const _ = require('lodash');
const baseFormat = require('./baseFormat');

const AbstBaseModel = require('../Default/AbstBaseModel');

class BaseModel extends AbstBaseModel {
  /** @param {protocol_info} protocol_info */
  constructor(protocol_info) {
    super(protocol_info);

    this.baseFormat = _.clone(baseFormat);

    this.device = {
      DEFAULT: {
        STATUS: {
          UNDEF: 'UNDEF'
        },
        COMMAND: {
          WAKEUP: '',
          LOOP: '',
          LOOP_INDEX: ''
        }
      }
    };


    /** Protocol 정보에 따라 자동으로 세부 Model Binding */
    if(protocol_info){
      return this.bindingSubCategory(protocol_info);
    }
  }


  /** 현재 카테고리에 있는 장치 데이터를 저장하기 위한 모델 */
  static get BASE_MODEL() {
    return  _.cloneDeep(baseFormat);
  }

  /** BASE_MODEL Key와 같은 값을 가진 Value를 매칭 후 반환 */
  static get BASE_KEY() {
    let baseKey = Object.assign({}, baseFormat);
    _.forEach(baseKey, (v, k) => baseKey[k] = k);
    return baseKey;
  }
}
module.exports = BaseModel;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  /** @type {protocol_info} */
  let protocol_info = {
    mainCategory: 'Test',
    subCategory: 'das_1.3'
  };

  const model = new BaseModel(protocol_info);
  
  console.log('@@@');
  // console.dir(model);
  console.log(model);
  console.log(model.device.POWER.COMMAND.STATUS);

}