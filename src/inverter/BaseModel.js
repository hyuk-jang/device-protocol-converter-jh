'use strict';

const _ = require('lodash');

const baseFormat = require('./baseFormat');

const ProtocolConverter =  require('../default/ProtocolConverter');

require('../format/defaultDefine');
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
          STATUS: [Buffer.from('')]
        }
      },
      SYSTEM: {
        COMMAND: {
          STATUS: [Buffer.from('')]
        },
        NAME: 'System'
      },
      PV: {
        COMMAND: {
          STATUS: [Buffer.from('')]
        },
        NAME: 'PV'
      },
      GRID: {
        COMMAND: {
          STATUS: [Buffer.from('')]
        },
        NAME: '계통'
      },
      POWER: {
        COMMAND: {
          STATUS: [Buffer.from('')]
        },
        NAME: '발전량'
      },
      OPERATION_INFO: {
        COMMAND: {
          STATUS: [Buffer.from('')]
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
}
module.exports = BaseModel;