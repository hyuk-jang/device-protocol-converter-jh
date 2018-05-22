
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

    

    if(protocol_info){
      this.protocol_info = protocol_info;
    }

    this.BASE = {
      DEFAULT: {
        STATUS: {
          UNDEF: 'UNDEF'
        },
        COMMAND: {
          STATUS: ''
        }
      },
      SYSTEM: {
        COMMAND: {
          STATUS: ''
        },
        NAME: 'System'
      },
      PV: {
        COMMAND: {
          STATUS: ''
        },
        NAME: 'PV'
      },
      GRID: {
        COMMAND: {
          STATUS: ''
        },
        NAME: '계통'
      },
      POWER: {
        COMMAND: {
          STATUS: ''
        },
        NAME: '발전량'
      },
      OPERATION_INFO: {
        COMMAND: {
          STATUS: ''
        },
        NAME: '동작 정보'
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

  /**
   * @param {Buffer} responseBuf 인버터에서 수신받은 데이터
   * @param {{dialing: Buffer, address: number, length: number, decodingDataList: Array.<{key: string, byte: number, callMethod: string}>}} decodingInfo 인버터에서 수신받은 데이터
   * @return {Buffer} Data Buffer만 리턴
   */
  checkValidate(responseBuf, decodingInfo){}

  /**
   * @param {string} cmd 명령 CODE
   */
  makeMsg(cmd){}


  

}
module.exports = BaseModel;