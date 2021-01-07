const _ = require('lodash');
const { BU } = require('base-util-jh');
const AbstConverter = require('../../Default/AbstConverter');
const protocol = require('./protocol');

const BaseModel = require('../BaseModel');

const { BASE_KEY: BK } = BaseModel;
class Converter extends AbstConverter {
  /**
   * @param {protocol_info} protocolInfo
   */
  constructor(protocolInfo) {
    super(protocolInfo);

    /** BaseModel */
    this.BaseModel = BaseModel;

    this.baseModel = new BaseModel(protocolInfo);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성.
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @param {string} cmd
   * @return {Array.<commandInfo>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(cmd) {
    if (cmd) {
      return this.makeDefaultCommandInfo(cmd);
    }
    return this.makeDefaultCommandInfo(this.baseModel.device.DEFAULT.COMMAND.LOOP);
  }

  /**
   * 데이터 분석 요청
   * @param {Buffer} deviceData 장치로 요청한 명령
   */
  concreteParsingData(deviceData) {
    const responseData = deviceData;

    const strLoopSTX = '4c4f4f';

    let bufferData =
      responseData instanceof Buffer
        ? responseData
        : this.protocolConverter.makeMsg2Buffer(responseData);

    const wakeupSTX = bufferData.slice(0, 2);
    const cmdSTX = bufferData.slice(0, 4);
    let loopSTX = bufferData.slice(0, 3);
    // wakeUp 명령을 내렸을 경우 \n\r 포함여부 확인
    if (wakeupSTX.equals(Buffer.from('0a0d', 'hex'))) {
      // ACK를 제외하고 데이터 저장
      this.resetTrackingDataBuffer();
      throw new Error('wakeUp Event');
    }

    // ACK 붙어 올 경우
    if (cmdSTX.equals(Buffer.from(`06${strLoopSTX}`, 'hex'))) {
      // ACK를 제외하고 데이터 저장
      this.resetTrackingDataBuffer();
      this.trackingDataBuffer = bufferData.slice(1);
      bufferData = this.trackingDataBuffer;
      loopSTX = bufferData.slice(0, 3);
    }

    // LOOP 명령 수행 여부 확인
    if (!loopSTX.equals(Buffer.from(strLoopSTX, 'hex'))) {
      throw new Error(
        `Not Matching ReqAddr: ${strLoopSTX}, ResAddr: ${loopSTX.toString()}`,
      );
    }

    // 아직 데이터가 완성되지 못하였을 경우
    if (bufferData.length < 99) {
      throw new RangeError(
        `Not Matching Length Expect: ${99}, Length: ${bufferData.length}`,
      );
    }
    // 연속으로 데이터가 들어올 경우
    if (bufferData.length === 198) {
      BU.CLI('bufferData.length === 198');
      bufferData = bufferData.slice(99);
    }

    if (bufferData.length !== 99) {
      throw new Error(`Not Matching Length Expect: ${99}, Length: ${bufferData.length}`);
    }

    protocol.forEach(pInfo => {
      const {
        key,
        substr: [startPoint, endPoint],
      } = pInfo;

      const realStartPoint = startPoint + endPoint - 1;
      let hexCode = '';
      let hasError = false;
      for (let i = realStartPoint; i >= startPoint; i -= 1) {
        let TargetValue = bufferData[i].toString(16);
        if (TargetValue === 'ff') {
          TargetValue = '00';
          if (key === 'OutsideTemperature' || key === 'SolarRadiation') {
            hasError = true;
          }
        }
        if (TargetValue.length === 1) {
          hexCode += '0';
        }
        hexCode += TargetValue;
      }
      if (hasError) {
        pInfo.value = null;
      } else {
        pInfo.value = this.changeData(
          key,
          Number(this.protocolConverter.converter().hex2dec(hexCode)),
        );
      }
    });

    const vantagePro2Data = {};
    protocol.forEach(protocolInfo => {
      const result = this.getProtocolValue(protocolInfo.key);
      vantagePro2Data[result.key] = result.value;
    });
    return vantagePro2Data;
    // }
    // else {
    //   throw new Error('요청한 데이터에 문제가 있습니다.');
    // }
  }

  getProtocolValue(findKey) {
    const findObj = protocol.find(obj => obj.key === findKey);

    if (findObj === undefined || findObj == null) {
      findObj.value = '';
    }
    return findObj;
  }

  changeData(key, value) {
    const {
      Barometer,
      ConsoleBatteryVoltage,
      DayET,
      DayRain,
      ExtraHumidties,
      ExtraTempHumAlarms,
      ExtraTemperatures,
      InsideAlarms,
      InsideHumidity,
      InsideTemperature,
      LeafTemperatures,
      LeafWetnesses,
      Min10AvgWindSpeed,
      MonthET,
      MonthRain,
      NextRecord,
      OutsideAlarms,
      OutsideHumidity,
      OutsideTemperature,
      RainAlarms,
      RainRate,
      SoilLeafAlarms,
      SoilMoistures,
      SoilTemperatures,
      SolarRadiation,
      StartDateofcurrentStorm,
      StormRain,
      TimeofSunrise,
      TimeofSunset,
      TransmitterBatteryStatus,
      UV,
      WindDirection,
      WindSpeed,
      YearET,
      YearRain,
    } = BK;

    const returnvalue = value;
    let res;
    switch (key) {
      case Barometer:
        return _.round(returnvalue * 0.001 * 33.863882, 2);
      case InsideTemperature:
        return _.round((returnvalue * 0.1 - 32) / 1.8, 2);
      case InsideHumidity:
        return returnvalue;
      case OutsideTemperature:
        return _.round((returnvalue * 0.1 - 32) / 1.8, 2);
      case WindSpeed:
        // console.log('base WindSpeed',returnvalue)
        return _.round(returnvalue * 0.44704, 2);
      case Min10AvgWindSpeed:
        return _.round(returnvalue * 0.44704, 2);
      case WindDirection:
        // console.log('WindDirection', DataValue)
        res = _.round(value / 45);
        res = res >= 8 || res < 0 ? 0 : res;
        return res;
      case ExtraTemperatures:
      case SoilTemperatures:
      case LeafTemperatures:
      case OutsideHumidity:
      case ExtraHumidties:
        return returnvalue;
      case RainRate:
      case DayRain:
      case MonthRain:
      case YearRain:
        return _.round(returnvalue * 0.2, 1);
      case UV:
      case SolarRadiation:
        return returnvalue;
      case StormRain:
        return _.round(returnvalue * 0.2, 2);
      case ConsoleBatteryVoltage:
        return _.round((returnvalue * 300) / 512 / 100, 2);
      default:
        return returnvalue;
    }
  }
}
module.exports = Converter;

// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');
  //* * OutsideTemperature
  const arr = [
    '4c4f4fc400cb02187464033bd70202074c00ffffffffffffffffffffffffffffff5affffffffffffff0000ff6900a30193a0d800a301c107110002008401ffffffffffffff0000000000000000000000000000000000001a0107a405007e040a0d1f46',
    // '4c4f4f1400e2056f74270332bf020c0c4801ffffffffffffffffffffffffffffff41ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000c60002876e02f9070a0d03be',
    // '064c4f4f000054099875c8014b970103039800ffffffffffffffffffffffffffffff58ffffffffffffff00000000000000ffff0000ce001b020200d9008602ffffffffffffff000000000000000000000000000000000000b900062c9202da070a0d39',
    // '4c4f4f1400e4056f74260332be020a0c4c01ffffffffffffffffffffffffffffff41ffffffffffffff000009fb000000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000b00002876e02f9070a0d6112',
    // '4c4f4f1400e4056f74260332be02090c6301ffffffffffffffffffffffffffffff41ffffffffffffff000009ff000000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000b00002876e02f9070a0db8e5',
    // '4c4f4f1400e3056f74260332bf020b0c5601ffffffffffffffffffffffffffffff43ffffffffffffff000009ff000000ffff00000d000d00ca002e016004ffffffffffffff0000000000000000000000000000000000004c0102876e02f9070a0d13c8',
    // '4c4f4f1400e2056f74270332be020c0c5801ffffffffffffffffffffffffffffff41ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000c60002876e02f9070a0d5e38',
    // '4c4f4fec0026055574220334c4020d085a01ffffffffffffffffffffffffffffff44ffffffffffffff00003c37030000ffff00000d000d0093002e016004ffffffffffffff0000000000000000000000000000000000003b0103c06f02f9070a0d9320',
    // '4c4f4f1400e2056f74270332bf020b0c5d01ffffffffffffffffffffffffffffff43ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000c60002876e02f9070a0d9b33',
    // '4c4f4f1400e3056f74260332bf020a0c3701ffffffffffffffffffffffffffffff43ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff0000000000000000000000000000000000004c0102876e02f9070a0de828',
    // '4c4f4fec000c03af749b034063030706f800ffffffffffffffffffffffffffffff48ffffffffffffff0000188a010000ffff000059016b028e00a8011b0affffffffffffff000000000000000000000000000000000000ae00062dbf02d8070a0d17b7',
  ];

  const con = new Converter();
  arr.forEach(currentItem => {
    const buf = Buffer.from(currentItem, 'hex');

    const res = con.parsingUpdateData({
      commandSet: { currCmdIndex: 0, cmdList: [{ data: 'LOOP\n' }] },
      data: buf,
    });
    console.dir(res);
  });
}
