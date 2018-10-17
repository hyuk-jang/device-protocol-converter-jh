const _ = require('lodash');

const baseFormat = require('./baseFormat');

const AbstBaseModel = require('../Default/AbstBaseModel');

class BaseModel extends AbstBaseModel {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super();
    this.baseFormat = _.clone(baseFormat);

    if (protocolInfo) {
      this.protocol_info = protocolInfo;
    }

    this.device = {
      DEFAULT: {
        STATUS: {
          UNDEF: 'UNDEF',
        },
        COMMAND: {
          STATUS: [Buffer.from('')],
        },
      },
      SYSTEM: {
        COMMAND: {
          STATUS: [Buffer.from('')],
        },
        NAME: 'System',
      },
      PV: {
        COMMAND: {
          STATUS: [Buffer.from('')],
        },
        NAME: 'PV',
      },
      GRID: {
        COMMAND: {
          STATUS: [Buffer.from('')],
        },
        NAME: '계통',
      },
      POWER: {
        COMMAND: {
          STATUS: [Buffer.from('')],
        },
        NAME: '발전량',
      },
      OPERATION_INFO: {
        COMMAND: {
          STATUS: [Buffer.from('')],
        },
        NAME: '동작 정보',
      },
      BATTERY: {
        COMMAND: {
          STATUS: [Buffer.from('')],
        },
        NAME: '배터리',
      },
      LED: {
        COMMAND: {
          STATUS: [Buffer.from('')],
        },
        NAME: 'LED',
      },
      TEMP: {
        COMMAND: {
          STATUS: [Buffer.from('')],
        },
        NAME: '배터리',
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
    _.forEach(baseKey, (v, k) => (baseKey[k] = k));
    return baseKey;
  }

  /**
   * @param {Buffer} responseData 인버터에서 수신받은 데이터
   * @param {{dialing: Buffer, address: number, length: number, decodingDataList: Array.<{key: string, byte: number, callMethod: string}>}} decodingInfo 인버터에서 수신받은 데이터
   * @return {Buffer} Data Buffer만 리턴
   */
  getValidateData(responseData, decodingInfo) {}

  /**
   * @param {Buffer} requestData 인버터에 요청한 데이터
   * @return {number}
   */
  getRequestAddr(requestData) {}

  /**
   * @param {Buffer} responseData 인버터에서 수신받은 데이터
   * @return {number}
   */
  getResponseAddr(responseData) {}
}
module.exports = BaseModel;
