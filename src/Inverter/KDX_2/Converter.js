const _ = require('lodash');
const { BU } = require('base-util-jh');
const ModbusRtuConverter = require('../../Default/Converter/ModbusRtuConverter');
const protocol = require('./protocol');

const Model = require('./Model');
const { BASE_MODEL } = require('./Model');

class Converter extends ModbusRtuConverter {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    // 현 Converter에서 사용하는 protocol과 Model을 자동으로 정의할 수 있도록 생성자 요청
    super(protocolInfo, Model);

    this.decodingTable = protocol.decodingProtocolTable(protocolInfo);
    this.onDeviceOperationStatus = protocol.onDeviceOperationStatus;
  }

  /**
   * FnCode 04, Read Input Register. 순수 Spec Data 반환
   * @param {Buffer} resBuffer CRC 제거된 Read Input Register
   * @param {Buffer} reqBuffer 현재 요청한 명령
   */
  refineReadInputRegister(resBuffer, reqBuffer) {
    const { dataBody, registerAddr } = super.refineReadInputRegister(
      resBuffer,
      reqBuffer,
    );

    /** @type {decodingProtocolInfo} */
    let decodingTable;

    // 장치 addr
    if (registerAddr === 45) {
      decodingTable = this.decodingTable.RESET_DATA_UNIT;
    } else {
      decodingTable = this.decodingTable.DEFAULT;
    }

    // FIXME: 실제 현장에서의 간헐적인 00000000000000 데이터 처리를 위함. 해당 데이터는 사용하지 않음
    if (_.every(dataBody, v => _.isEqual(v, Buffer.alloc(1, 0)))) {
      return BASE_MODEL;
    }

    /** @type {BASE_MODEL} */
    const returnValue = this.automaticDecodingIndex(decodingTable, dataBody);

    // FIXME: 영산포 왼쪽 전력량계부터
    if (_.isEqual(this.model.dialing, 5)) {
      returnValue.powerCpKwh[0] -= 16.811;
    } else if (_.isEqual(this.model.dialing, 6)) {
      returnValue.powerCpKwh[0] -= 24.415;
    } else if (_.isEqual(this.model.dialing, 7)) {
      returnValue.powerCpKwh[0] -= 20.802;
    } else if (_.isEqual(this.model.dialing, 8)) {
      returnValue.powerCpKwh[0] -= 23.367;
    }

    return returnValue;
  }
}
module.exports = Converter;

// 테스트
if (require !== undefined && require.main === module) {
  const converter = new Converter({
    deviceId: 1,
    mainCategory: 'Inverter',
    subCategory: 'KDX_300',
  });

  const requestMsg = converter.generationCommand({
    key: converter.model.device.DEFAULT.KEY,
  });

  // BU.CLI(requestMsg);
  // 02490104002d0002e1c203
  // 024901040000001e700203
  const dataList = [
    // '0249050404102031316f0aff03',
    // '024905043c090f0000090f090f0000000000dc0031003101c30000000001c300f10000000000f102000000000002000336ffeb00010336177000128b2d00000369643bff03',
    // '024905043c09440000094409440000000001820000000003930000000003930043000000000043039500000000039503e30000000003e3176f0012793f000003694b98ff03',

    // '0249060404102031315c0aff03',
    // '024906043c090f0000090f090f0000000000e60000000002150000000002150035000000000035021700000000021703e20000000003e2177000190f2b000001959bfcff03',

    // '0249070404102031314cca03',
    // '024907043c091e0000091e091e0000000000e10031003101c90000000001c90105000000000105020e00000000020e033d0005000f033d17700015045f00000000d6ff03',

    // '024908040410203131b3ca03',
    // '024908043c091d0000091d091d000000000100000000000253000000000253003f00000000003f025600000000025603e10000000003e11770001bb61d0000000057ff03',

    // '02490104041020212126c6ff03',
    // '02490104041020212126c603',
    // '024901043c090e0000090e090e0000000003720000000000cb0000000000cb001900000000001900cc0000000000cc03e00000000003e017730000306300000001b09a03',

    '02490104041020212126c603',
    '024901043c090800000909090900000000044a0000000000fc0000000000fc001d00000000001d00fe0000000000fe03e20000000003e217710000c78000000002e1fa03',
  ];

  dataList.forEach((d, index) => {
    // const realBuffer = Buffer.from(d, 'hex');
    const realBuffer = Buffer.from(d.slice(4, d.length - 2), 'hex');

    // const result = converter.testParsingData(realBuffer);
    // BU.CLI(result);
    const dataMap = converter.concreteParsingData(realBuffer, requestMsg[index].data);
    console.log(dataMap);
  });

  // console.log('requestMsg', requestMsg);
  // const data = Buffer.from(
  //   '08040410203131b3ca',
  //   '024908043c097b0000097c097c0000000002620000000005c30000000005c3009200000000009205ca0000000005ca03e20000000003e21772001bb22200000000bcf703',
  //   // '02490104041020212126c603',
  //   // '024901043c090e0000090e090e0000000003720000000000cb0000000000cb001900000000001900cc0000000000cc03e00000000003e017730000306300000001b09a03',
  //   'hex',
  // );

  // const dataMap = converter.concreteParsingData(data, _.head(converter.generationCommand()).data);
  // BU.CLI('dataMap', dataMap);
}

// 024901040000001e700203
// 024905040000001e718603
