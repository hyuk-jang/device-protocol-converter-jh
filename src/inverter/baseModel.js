
'use strict';

const _ = require('lodash');
require('../format/defaultDefine');

const baseFormat = require('./baseFormat');

const ProtocolConverter =  require('../default/ProtocolConverter');

class BaseModel extends ProtocolConverter {
  /** @param {protocol_info} protocol_info */
  constructor(protocol_info) {
    super();
    this.baseFormat = baseFormat;

    this.BASE_KEY = Object.assign({}, baseFormat);
    _.forEach(this.BASE_KEY, (v, k) => this.BASE_KEY[k] = k);

    if(protocol_info){
      this.protocol_info = protocol_info;
    }

    this.DEFAULT = {
      STATUS: {
        UNDEF: 'UNDEF'
      },
      COMMAND: {
        STATUS: ''
      }
    };

    this.SYSTEM = {
      COMMAND: {
        STATUS: ''
      },
      NAME: 'System'
    };

    this.PV = {
      COMMAND: {
        STATUS: ''
      },
      NAME: 'PV'
    };

    this.GRID = {
      COMMAND: {
        STATUS: ''
      },
      NAME: '계통'
    };

    this.POWER = {
      COMMAND: {
        STATUS: ''
      },
      NAME: '발전량'
    };

    this.OPERATION_INFO = {
      COMMAND: {
        STATUS: ''
      },
      NAME: '동작 정보'
    };

    if(_.get(protocol_info, 'subCategory')){
      const Model = require(`./${protocol_info.subCategory}/Model`);
      return new Model(this);
    }

  }

}
module.exports = BaseModel;