'use strict';
const _ = require('lodash');
const baseFormat = require('./baseFormat');

require('../format/defaultDefine');

class BaseModel {
  /** @param {protocol_info} protocol_info */
  constructor(protocol_info) {
    this.DEFAULT = {
      STATUS: {
        UNDEF: 'UNDEF'
      },
      COMMAND: {
        MEASURE: ''
      }
    };

    
    if(_.get(protocol_info, 'subCategory')){
      const Model = require(`./${protocol_info.subCategory}/Model`);
      return new Model(this);
    }
  }

  /** 현재 카테고리에 있는 장치 데이터를 저장하기 위한 모델 */
  static get BASE_MODEL() {
    return Object.assign({}, baseFormat);
  }

  /** BASE_MODEL Key와 같은 값을 가진 Value를 매칭 후 반환 */
  static get BASE_KEY() {
    let baseKey = Object.assign({}, baseFormat);
    _.forEach(baseKey, (v, k) => baseKey[k] = k);
    return baseKey;
  }
}
module.exports = BaseModel;