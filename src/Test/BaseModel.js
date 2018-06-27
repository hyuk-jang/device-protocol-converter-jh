'use strict';
const _ = require('lodash');
const baseFormat = require('./baseFormat');

const AbstBaseModel = require('../Default/AbstBaseModel');
class BaseModel extends AbstBaseModel {
  /** @param {protocol_info} protocol_info */
  constructor(protocol_info) {
    super();
    this.baseFormat = _.clone(baseFormat);

    this.device = {
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

 
    /** Protocol 정보에 따라 자동으로 세부 Model Binding */
    if(protocol_info){
      return this.bindingSubCategory(protocol_info);
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
   * @override
   * @param {Buffer} responseData 인버터에서 수신받은 데이터
   * @param {{dialing: Buffer, address: number, length: number, decodingDataList: Array.<{key: string, byte: number, callMethod: string}>}} decodingInfo 인버터에서 수신받은 데이터
   * @return {Buffer} Data Buffer만 리턴
   */
  getValidateData(responseData, decodingInfo){}

  /**
   * @override
   * @param {Buffer} requestData 인버터에 요청한 데이터
   * @return {number}
   */
  getRequestAddr(requestData){}

  /**
   * @override
   * @param {Buffer} responseData 인버터에서 수신받은 데이터
   * @return {number}
   */
  getResponseAddr(responseData){}

}
module.exports = BaseModel;


// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  /** @type {protocol_info} */
  let protocol_info = {
    mainCategory: 'Saltern',
    subCategory: 'xbee'
  };

  
  console.log(BaseModel.BASE_KEY);
  console.log(BaseModel.GET_BASE_KEY(protocol_info));
  const model = new BaseModel(protocol_info);
  
  // console.log(model);
  // console.log(model.device.POWER.COMMAND.STATUS);

}