'use strict';

const _ = require('lodash');

const baseFormat = require('./baseFormat');

const ProtocolConverter =  require('../Default/ProtocolConverter');

require('../format/defaultDefine');
class BaseModel extends ProtocolConverter {
  /** @param {protocol_info} protocol_info */
  constructor(protocol_info) {
    super();
    this.baseFormat = _.clone(baseFormat);

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
      },
      BATTERY: {
        COMMAND: {
          STATUS: [Buffer.from('')]
        },
        NAME: '배터리'
      },
      LED: {
        COMMAND: {
          STATUS: [Buffer.from('')]
        },
        NAME: 'LED'
      },
      TEMP: {
        COMMAND: {
          STATUS: [Buffer.from('')]
        },
        NAME: '배터리'
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

  /**
   * @param {Buffer} responseBuf 인버터에서 수신받은 데이터
   * @param {{dialing: Buffer, address: number, length: number, decodingDataList: Array.<{key: string, byte: number, callMethod: string}>}} decodingInfo 인버터에서 수신받은 데이터
   * @return {Buffer} Data Buffer만 리턴
   */
  checkValidate(responseBuf, decodingInfo){}

  /**
   * @param {Buffer} requestBuf 인버터에 요청한 데이터
   * @return {number}
   */
  getRequestAddr(requestBuf){}

  /**
   * @param {Buffer} responseBuf 인버터에서 수신받은 데이터
   * @return {number}
   */
  getResponseAddr(responseBuf){}

}
module.exports = BaseModel;