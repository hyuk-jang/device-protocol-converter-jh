const _ = require('lodash');
const BaseModel = require('../BaseModel');

/**
 * @typedef {Object} fpSensorRequestFormat modbusRTU 요청 데이터 포맷
 * @property {string} unitId ModbusRTU 장치 ID
 * @property {number} address 가져올 시작 주소
 * @property {number} dataLength 가져올 데이터 개수
 * @property {number=} fnCode FunctionCode @default 4 (ReadInputRegister)
 */

class Model extends BaseModel {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super();
    // 프로토콜 정보가 있다면 세팅
    if (protocolInfo) {
      this.protocolInfo = protocolInfo;
    }
    this.dialing = _.get(this, 'protocolInfo.deviceId');

    this.device.DEFAULT.COMMAND.STATUS = [
      {
        unitId: this.dialing,
        address: 6,
        dataLength: 12,
      },
    ];

    this.device.LUX.COMMAND.STATUS = [
      {
        unitId: this.dialing,
        address: 6,
        dataLength: 1,
      },
    ];

    this.device.SOIL_TEMPERATURE.COMMAND.STATUS = [
      {
        unitId: this.dialing,
        fnCode: 4,
        address: 8,
        dataLength: 1,
      },
    ];
  }
}

module.exports = Model;
