const _ = require('lodash');
const BaseModel = require('../BaseModel');

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

    // 현재 전압, 전류, 전력 측정값을 Read한다.
    this.device.DEFAULT.COMMAND.STATUS = [
      Buffer.from(':MEASure:VOLTage?\n'),
      Buffer.from(':MEASure:CURRent?\n'),
      Buffer.from(':MEASure:POWer?\n'),
      Buffer.from(':SOUR:INP:STAT?\n'),
    ];

    this.device.DEFAULT.COMMAND.STATUS_POWER = [
      Buffer.from(':SOUR:INP:STAT?\n'), // 현재 전원 상태 확인
    ];

    this.device.DEFAULT.COMMAND.WAKEUP = [
      Buffer.from(':SOUR:INP:STAT ON\n'), // 싱크 상태를 ON/OFF 시키기 위해 사용 (전원이 처음 인가된 후 싱크상태는 OFF)
      Buffer.from(':SOUR:FUNC RES\n'), // CR 모드로 진입한다.(정저항 모드)
      Buffer.from(':SOUR:RES:LEV:IMM 2\n'), // CR 모드에서 저항값을 2옴으로 설정한다.
    ];

    this.device.DEFAULT.COMMAND.RESTART = [
      Buffer.from('LXI:RESTart\n'), // Applies the currently set parameters.
    ];
  }
}

module.exports = Model;
