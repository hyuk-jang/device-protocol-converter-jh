'use strict';
const _ = require('lodash');
const baseFormat = require('./baseFormat');

require('../format/defaultDefine');

class BaseModel {
  /** @param {protocol_info} protocol_info */
  constructor(protocol_info) {
    this.baseFormat = baseFormat;


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

  static get BASE_KEY() {
    let baseKey = Object.assign({}, baseFormat);
    _.forEach(baseKey, (v, k) => baseKey[k] = k);
    return baseKey;
  }
}
module.exports = BaseModel;