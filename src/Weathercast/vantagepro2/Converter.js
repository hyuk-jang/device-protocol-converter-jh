"use strict";
const _ = require("lodash");
const { BU } = require("base-util-jh");
const AbstConverter = require("../../Default/AbstConverter");
const protocol = require("./protocol");

const BaseModel = require("../BaseModel");

class Converter extends AbstConverter {
  /**
   * @param {protocol_info} protocol_info
   */
  constructor(protocol_info) {
    super(protocol_info);

    /** BaseModel */
    this.BaseModel = BaseModel;
    this.baseModel = new BaseModel(protocol_info);
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
    } else {
      return this.makeDefaultCommandInfo(this.baseModel.device.DEFAULT.COMMAND.LOOP);
    }
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  concreteParsingData(dcData) {
    try {
      let requestData = this.getCurrTransferCmd(dcData);
      let responseData = dcData.data;

      // if(_.includes(requestData, this.baseModel.device.DEFAULT.COMMAND.LOOP)){
      let bufferData =
        responseData instanceof Buffer
          ? responseData
          : this.protocolConverter.makeMsg2Buffer(responseData);

      let wakeupSTX = bufferData.slice(0, 2);
      let cmdSTX = bufferData.slice(0, 4);
      let loopSTX = bufferData.slice(0, 3);
      // wakeUp 명령을 내렸을 경우 \n\r 포함여부 확인
      if (wakeupSTX.toString() === Buffer.from([0x0a, 0x0d]).toString()) {
        // ACK를 제외하고 데이터 저장
        this.resetTrackingDataBuffer();
        throw new Error("wakeUp Event");
      }
      if (cmdSTX.toString() === Buffer.from([0x06, 0x4c, 0x4f, 0x4f]).toString()) {
        // ACK를 제외하고 데이터 저장
        this.resetTrackingDataBuffer();
        bufferData = this.trackingDataBuffer = bufferData.slice(1);
        loopSTX = bufferData.slice(0, 3);
      }
      if (loopSTX.toString() !== Buffer.from([0x4c, 0x4f, 0x4f]).toString()) {
        // LOOP 명령 수행 여부 확인
        throw new Error(
          `Not Matching ReqAddr: ${Buffer.from([
            0x4c,
            0x4f,
            0x4f
          ]).toString()}, ResAddr: ${loopSTX.toString()}`
        );
      }
      if (bufferData.length !== 99) {
        throw new Error(`Not Matching Length Expect: ${99}, Length: ${bufferData.length}`);
      }
      protocol.forEach(protocol => {
        let startPoint = protocol.substr[0];
        let endPoint = protocol.substr[1];
        let realStartPoint = startPoint + endPoint - 1;
        let hexCode = "";
        let hasError = false;
        for (let i = realStartPoint; i >= startPoint; i--) {
          let TargetValue = bufferData[i].toString(16);
          if (TargetValue === "ff") {
            TargetValue = "00";
            if (protocol.key === "OutsideTemperature" || protocol.key === "SolarRadiation") {
              hasError = true;
            }
          }
          if (TargetValue.length === 1) {
            hexCode += "0";
          }
          hexCode += TargetValue;
        }
        if (hasError) {
          protocol.value = null;
        } else {
          protocol.value = this._ChangeData(
            protocol.key,
            this.protocolConverter.converter().hex2dec(hexCode)
          );
        }
      });

      let vantagePro2Data = {};
      protocol.forEach(protocol => {
        let result = this.getProtocolValue(protocol.key);
        vantagePro2Data[result.key] = result.value;
      });
      return vantagePro2Data;
      // }
      // else {
      //   throw new Error('요청한 데이터에 문제가 있습니다.');
      // }
    } catch (error) {
      throw error;
    }
  }

  getProtocolValue(findKey) {
    let findObj = protocol.find(obj => {
      return obj.key === findKey;
    });

    if (findObj === undefined || findObj == null) {
      findObj.value = "";
    } else {
      findObj.value;
    }
    return findObj;
  }

  _ChangeData(DataName, DataValue) {
    //console.log('ChangeData : ' + DataName, DataValue)
    let returnvalue = DataValue;

    switch (DataName) {
      case "Barometer":
        return Math.round10(returnvalue * 0.001 * 33.863882, -1);
      case "InsideTemperature":
        return Math.round10((returnvalue * 0.1 - 32) / 1.8, -1);
      case "InsideHumidity":
        return returnvalue;
      case "OutsideTemperature":
        return Math.round10((returnvalue * 0.1 - 32) / 1.8, -1);
      case "WindSpeed":
        //console.log('base WindSpeed',returnvalue)
        return Math.round10(returnvalue * 0.44704, -1);
      case "Min10AvgWindSpeed":
        return Math.round10(returnvalue * 0.44704, -1);
      case "WindDirection":
        //console.log('WindDirection', DataValue)
        var res = Math.round(DataValue / 45);
        res = res >= 8 || res < 0 ? 0 : res;
        return res;
      case "ExtraTemperatures":
      case "SoilTemperatures":
      case "LeafTemperatures":
      case "OutsideHumidity":
      case "ExtraHumidties":
        return returnvalue;
      case "RainRate":
        return Math.round10(returnvalue * 0.2, -1);
      case "UV":
      case "SolarRadiation":
        return returnvalue;
      case "StormRain":
        return Math.round10(returnvalue * 0.2, -1);
      default:
        return returnvalue;
    }
  }
}
module.exports = Converter;

// if __main process
if (require !== undefined && require.main === module) {
  console.log("__main__");
  //** OutsideTemperature
  let arr = [
    "4c4f4fec00a0045b7434032d24030201a300ffffffffffffffffffffffffffffff2bffffffffffffff000050ca030000ffff00000d000d0061002e016004ffffffffffffff000000000000000000000000000000000000c70003c06f02f9070a0d3387",
    "4c4f4f1400e2056f74270332bf020c0c4801ffffffffffffffffffffffffffffff41ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000c60002876e02f9070a0d03be",
    "064c4f4f000054099875c8014b970103039800ffffffffffffffffffffffffffffff58ffffffffffffff00000000000000ffff0000ce001b020200d9008602ffffffffffffff000000000000000000000000000000000000b900062c9202da070a0d39",
    "4c4f4f1400e4056f74260332be020a0c4c01ffffffffffffffffffffffffffffff41ffffffffffffff000009fb000000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000b00002876e02f9070a0d6112",
    "4c4f4f1400e4056f74260332be02090c6301ffffffffffffffffffffffffffffff41ffffffffffffff000009ff000000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000b00002876e02f9070a0db8e5",
    "4c4f4f1400e3056f74260332bf020b0c5601ffffffffffffffffffffffffffffff43ffffffffffffff000009ff000000ffff00000d000d00ca002e016004ffffffffffffff0000000000000000000000000000000000004c0102876e02f9070a0d13c8",
    "4c4f4f1400e2056f74270332be020c0c5801ffffffffffffffffffffffffffffff41ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000c60002876e02f9070a0d5e38",
    "4c4f4fec0026055574220334c4020d085a01ffffffffffffffffffffffffffffff44ffffffffffffff00003c37030000ffff00000d000d0093002e016004ffffffffffffff0000000000000000000000000000000000003b0103c06f02f9070a0d9320",
    "4c4f4f1400e2056f74270332bf020b0c5d01ffffffffffffffffffffffffffffff43ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff000000000000000000000000000000000000c60002876e02f9070a0d9b33",
    "4c4f4f1400e3056f74260332bf020a0c3701ffffffffffffffffffffffffffffff43ffffffffffffff00000902010000ffff00000d000d00ca002e016004ffffffffffffff0000000000000000000000000000000000004c0102876e02f9070a0de828"
  ];

  let con = new Converter();
  arr.forEach(currentItem => {
    let buf = Buffer.from(currentItem, "hex");

    let res = con.parsingUpdateData({
      commandSet: { currCmdIndex: 0, cmdList: [{ data: "LOOP\n" }] },
      data: buf
    });
    console.dir(res.data[BaseModel.BASE_KEY.SolarRadiation]);
  });
}
