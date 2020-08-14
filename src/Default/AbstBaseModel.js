const _ = require('lodash');

const dpcRouter = require('./dpcRouter');
const ProtocolConverter = require('./ProtocolConverter');

class AbstBaseModel {
  /** @param {protocol_info} protocolInfo */
  constructor(protocolInfo) {
    this.protocolConverter = new ProtocolConverter();
    this.baseFormat = {};

    this.device = {
      DEFAULT: {
        STATUS: {
          UNDEF: 'UNDEF',
        },
        COMMAND: {
          STATUS: null,
        },
      },
    };

    if (protocolInfo) {
      return this.bindingSubCategory(protocolInfo);
    }
  }

  /**
   * @abstract
   * Protocol 정보에 따라서 적합한 Model을 결합시킴. Strategy Pattern 변형
   * @param {protocol_info} protocolInfo
   */
  bindingSubCategory(protocolInfo) {
    this.protocolInfo = protocolInfo;

    if (_.get(protocolInfo, 'mainCategory') && _.get(protocolInfo, 'subCategory')) {
      // const Model = require(`../${protocolInfo.mainCategory}/${protocolInfo.subCategory}/Model`);
      const { Model } = dpcRouter(protocolInfo);

      // Model에 프로토콜 정보 설정
      const model = new Model(this.protocolInfo);
      _.set(model, 'protocolInfo', this.protocolInfo);
      return model;
    }
  }

  /**
   * @interface
   * 응답받은 장치 데이터의 유효성을 분석하고 유효 데이터를 구하여 반환
   * @param {Buffer} responseData 응답받은 장치 데이터
   * @param {*} decodingInfo 응답받은 장치 데이터를 분석하기 위한 정보
   * @return {*} 유효 데이터 반환. 실패시 예외 반환
   */
  getValidateData(responseData, decodingInfo) {}

  /**
   * @interface
   * 장치에 요청한 명령의 주소를 가져옴.
   * @desc ReqestAddr과 ResponseAddr을 확인하여 요청 명령에 대한 응답 결과인지 확인
   * @param {*} requestData 장치로 보낸 명령
   * @example
   * ^P001ST1 --> ^(시작문자) P(Code) 001(ID), ST(Option) 1(주소)
   * ENQ 국번 CMD 번지 갯수 CK_SUM EOT --> 번지
   * @return {number}
   */
  getRequestAddr(requestData) {}

  /**
   * @interface
   * 장치에서 응답받은 데이터의 주소를 가져옴
   * @desc ReqestAddr과 ResponseAddr을 확인하여 요청 명령에 대한 응답 결과인지 확인
   * @param {*} responseData 장치에서 수신받은 데이터
   * @example
   * ^D117002~ --> ^(시작문자) D(Code) 1(주소), 17(Length) 002(ID)
   * ACK 국번 CMD 번지 DATA CK_SUM EOT --> 번지
   * @return {number}
   */
  getResponseAddr(responseData) {}

  /**
   * @abstract
   * @static
   * 현재 카테고리에 있는 장치 데이터를 저장하기 위한 모델
   * @desc MainCategory 폴더에 존재하는 baseFormat.js을 복사
   * @param {protocol_info} protocolInfo
   * @return {Object}
   */
  static GET_BASE_MODEL(protocolInfo) {
    // const path = `../${protocolInfo.mainCategory}/baseFormat`;
    const { baseFormat } = dpcRouter(protocolInfo);
    // const baseFormat = require(path);
    return _.cloneDeep(baseFormat);
  }

  /** 현재 카테고리에 있는 장치 데이터를 저장하기 위한 모델 */
  static get BASE_MODEL() {
    return '';
  }

  /**
   * @static
   * BASE_MODEL Key와 같은 값을 가진 Value를 매칭 후 반환
   * @desc MainCategory 폴더에 존재하는 baseFormat.js 의 {key: value}쌍을 {key: key}으로 변경하여 반환
   * @param {protocol_info} protocolInfo
   * @return {Object}
   */
  static GET_BASE_KEY(protocolInfo) {
    const { baseFormat } = dpcRouter(protocolInfo);
    const baseKey = { ...baseFormat };
    _.forEach(baseKey, (v, k) => _.set(baseKey, k, k));
    return baseKey;
  }

  /** 현재 카테고리에 있는 장치 데이터를 저장하기 위한 모델 */
  get BASE_MODEL() {
    return _.cloneDeep(this.baseFormat);
  }

  /** BASE_MODEL Key와 같은 값을 가진 Value를 매칭 후 반환 */
  get BASE_KEY() {
    const baseKey = _.clone(this.baseFormat);
    _.forEach(baseKey, (v, k) => _.set(baseKey, k, k));
    return baseKey;
  }
}
module.exports = AbstBaseModel;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');

  /** @type {protocol_info} */
  const protocolInfo = {
    mainCategory: 'Saltern',
    subCategory: 'xbee',
  };

  const baseModl = AbstBaseModel.GET_BASE_MODEL(protocolInfo);
  console.log(baseModl);
  const baseKeys = AbstBaseModel.GET_BASE_KEY(protocolInfo);
  console.log(baseKeys);

  const model = new AbstBaseModel(protocolInfo);

  // console.dir(model);
  // console.log(model.device.DEFAULT.COMMAND);
}
