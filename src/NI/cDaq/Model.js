const _ = require('lodash');

const BaseModel = require('../BaseModel');

class Model extends BaseModel {
  /**
   * @param {protocol_info} protocolInfo
   * @param {AbstConverter} converter
   */
  constructor(protocolInfo, converter) {
    super();

    this.converter = converter;

    // Off
    this.device.RELAY.COMMAND[0] = nodeInfo => {
      if (!this.converter.currRelayDataList.length) {
        throw new Error(
          `슬롯 Serial(${this.converter.cDaqSlotSerial})의 계측 데이터에 이상이 있습니다.`,
        );
      }

      const { data_index: dIndex = 0 } = nodeInfo;

      return [
        {
          fnCode: this.FN_CODE.SET,
          cmd: _.chain(this.converter.currRelayDataList)
            .clone()
            .set(dIndex, 0)
            .reverse()
            .join('')
            .parseInt(2)
            .toString()
            .padStart(2, '0')
            .value(),
        },
      ];
    };

    // On
    this.device.RELAY.COMMAND[1] = nodeInfo => {
      if (!this.converter.currRelayDataList.length) {
        throw new Error(
          `슬롯 Serial(${this.converter.cDaqSlotSerial})의 계측 데이터에 이상이 있습니다.`,
        );
      }

      const { data_index: dIndex = 0 } = nodeInfo;

      return [
        {
          fnCode: this.FN_CODE.SET,
          cmd: _.chain(this.converter.currRelayDataList)
            .clone()
            .set(dIndex, 1)
            .reverse()
            .join('')
            .parseInt(2)
            .toString()
            .padStart(2, '0')
            .value(),
        },
      ];
    };
  }

  /**
   * 데이터로거 노드 인덱스에 1을 더한 후 2자리 string으로 변환
   * @param {nodeInfo=} nodeInfo nodeInfo에서의 data_logger_index
   */
  openRelay() {
    // 현재 릴레이의 상태를 가져옴
  }

  /**
   * 데이터로거 노드 인덱스에 1을 더한 후 2자리 string으로 변환
   * @param {nodeInfo=} nodeInfo nodeInfo에서의 data_logger_index
   */
  convertNodeNumber(nodeInfo) {
    const { data_index: dIndex = 0 } = nodeInfo;

    return _.padStart(dIndex, 2, '0');
  }
}

module.exports = Model;
