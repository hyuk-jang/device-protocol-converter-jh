const _ = require('lodash');

const baseFormat = require('./baseFormat');

const AbstBaseModel = require('../Default/AbstBaseModel');

class BaseModel extends AbstBaseModel {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    super();

    this.FN_CODE = {
      MEASURE: '1',
      SET: '2',
    };

    const BK = { ...baseFormat };
    _.forEach(BK, (v, k) => _.set(BK, k, k));

    this.device = {
      DEFAULT: {
        /**
         * @type {string} DataLogger
         * @default DEFAULT 기본적인 Data Logger 값
         */
        KEY: 'DEFAULT',
        STATUS: {
          UNDEF: 'UNDEF',
        },
        COMMAND: {
          STATUS: [
            {
              fnCode: this.FN_CODE.MEASURE,
              cmd: '00',
            },
          ],
        },
      },
      // Device
      VOLTAGE: {
        KEY: [BK.pressure, BK.absPressure, BK.gaugePressure],
        NAME: '전압',
        STATUS: {},
        COMMAND: {
          STATUS: [
            {
              fnCode: this.FN_CODE.MEASURE,
              cmd: '00',
            },
          ],
        },
      },
      RELAY: {
        KEY: [BK.valve, BK.compressor],
        NAME: '릴레이',
        STATUS: {
          ON: 'ON',
          OFF: 'OFF',
        },
        COMMAND: {
          STATUS: [
            {
              fnCode: this.FN_CODE.MEASURE,
              cmd: '00',
            },
          ],
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

  /**
   * 데이터의 두 임계치 사이에서의 위치 비율을 반환
   * @param {number} numData
   * @param {number} minThreshold
   * @param {number} maxThreshold
   * @return {number} 0 ~ 1
   */
  static cNumToRangeRate(numData, minThreshold, maxThreshold) {
    const range = maxThreshold - minThreshold;

    return (numData - minThreshold) / range;
  }

  /**
   * 두 임계치 사이에서 비율이 위치하는 상대값 반환
   * @param {number} rate 비율 0 ~ 1
   * @param {number} minThreshold
   * @param {number} maxThreshold
   * @return {number} 두 임계치 사이의 비율이 위치하는 상대 값
   */
  static cRangeRateToNum(rate, minThreshold, maxThreshold, toFixed) {
    const range = maxThreshold - minThreshold;

    const numData = range * rate + minThreshold;

    return typeof toFixed === 'number' ? _.round(numData, toFixed) : numData;
  }
}
module.exports = BaseModel;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  /** @type {protocol_info} */
  const protocolInfo = {
    mainCategory: 'Saltern',
    subCategory: 'xbee',
  };

  console.log(BaseModel.BASE_KEY);
  console.log(BaseModel.GET_BASE_KEY(protocolInfo));
  const model = new BaseModel(protocolInfo);

  // console.log(model);
  console.log(model.device.PUMP.COMMAND.OFF);
}
