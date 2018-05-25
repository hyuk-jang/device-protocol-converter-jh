'use strict';
const _ = require('lodash');
const {BU} = require('base-util-jh');
const ProtocolConverter = require('../../default/ProtocolConverter');
const protocol = require('./protocol');

const Model = require('./Model');


require('../../format/defaultDefine');
class Converter extends ProtocolConverter {
  constructor() {
    super();

    this.baseModel = new Model();
    // BU.CLIN(this.baseModel);
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성. 
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @return {Array} 장치를 조회하기 위한 명령 리스트 반환
   * @return {Array.<commandInfo>} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(){
    /** @type {commandInfo} */
    const commandObj = {
      data: this.baseModel.DEFAULT.COMMAND.MEASURE,
      commandExecutionTimeoutMs: 1000 * 10
    };

    return [commandObj];
  }

  /**
   * 데이터 분석 요청
   * @param {dcData} dcData 장치로 요청한 명령
   * @return {parsingResultFormat}
   */
  parsingUpdateData(dcData){
    /** @type {parsingResultFormat} */
    const returnValue = {};

    try {
      let requestData = this.getCurrTransferCmd(dcData);
      let responseData = dcData.data;
      // BU.CLI(responseData);
    
      if(_.includes(requestData, this.baseModel.DEFAULT.COMMAND.MEASURE)){
        let bufferData = responseData instanceof Buffer ? responseData : this.makeMsg2Buffer(responseData);

        let STX = bufferData.slice(0, 3);
        if(STX.toString() !== Buffer.from([0x4c, 0x4f, 0x4f]).toString()){
          returnValue.eventCode = this.definedCommanderResponse.WAIT;
          returnValue.data = {};
          return returnValue;
        }
        let addValue = 0;
        if (bufferData.length == 100) {
          addValue = 1;
        } else if (bufferData.length == 99) {
          addValue = 0;
        } else {
          returnValue.eventCode = this.definedCommanderResponse.WAIT;
          returnValue.data = {};
          return returnValue;
        }
        protocol.forEach(protocol => {
          let startPoint = protocol.substr[0];
          let endPoint = protocol.substr[1];
          let realStartPoint = startPoint + endPoint - 1 + addValue;
          let hexCode = '';
          let hasError = false;
          for (let i = realStartPoint; i >= startPoint + addValue; i--) {
            let TargetValue = bufferData[i].toString(16);
            if (TargetValue === 'ff') {
              TargetValue = '00';
              if(protocol.key === 'OutsideTemperature' || protocol.key === 'SolarRadiation'){
                hasError = true;
              }
            }
  
            if (TargetValue.length === 1) {
              hexCode += '0';
            }
            hexCode += TargetValue;
          }

          if(hasError){
            protocol.value = null;
          } else {
            protocol.value = this._ChangeData(protocol.key, this.converter().hex2dec(hexCode));
          }
        });
  
        let vantagePro2Data = {};
        protocol.forEach((protocol) => {
          let result = this.getProtocolValue(protocol.key);
          vantagePro2Data[result.key] = result.value;
        });

        returnValue.eventCode = this.definedCommanderResponse.DONE;
        returnValue.data = vantagePro2Data;

        return returnValue;
      } else {
        throw new Error('요청한 데이터에 문제가 있습니다.');
      }
    } catch (error) {
      returnValue.eventCode = this.definedCommanderResponse.ERROR;
      returnValue.data = error;
      return returnValue;
    }
  }

  getProtocolValue(findKey) {
    let findObj = protocol.find((obj) => {
      return obj.key === findKey;
    });

    if (findObj === undefined || findObj == null) {
      findObj.value = '';
    } else {
      findObj.value;
    }
    return findObj;
  }

  _ChangeData(DataName, DataValue) {
    //console.log('ChangeData : ' + DataName, DataValue)
    let returnvalue = DataValue;

    switch (DataName) {
    case 'Barometer':
      return Math.round10(returnvalue * 0.001 * 33.863882, -1);
    case 'InsideTemperature':
      return Math.round10((returnvalue * 0.1 - 32) / 1.8, -1);
    case 'InsideHumidity':
      return returnvalue;
    case 'OutsideTemperature':
      return Math.round10((returnvalue * 0.1 - 32) / 1.8, -1);
    case 'WindSpeed':
      //console.log('base WindSpeed',returnvalue)
      return Math.round10(returnvalue * 0.44704, -1);
    case 'Min10AvgWindSpeed':
      return Math.round10(returnvalue * 0.44704, -1);
    case 'WindDirection':
      //console.log('WindDirection', DataValue)
      var res = Math.round(DataValue / 45);
      res = res >= 8 || res < 0 ? 0 : res;
      return res;
    case 'ExtraTemperatures':
    case 'SoilTemperatures':
    case 'LeafTemperatures':
    case 'OutsideHumidity':
    case 'ExtraHumidties':
      return returnvalue;
    case 'RainRate':
      return Math.round10(returnvalue * 0.2, -1);
    case 'UV':
    case 'SolarRadiation':
      return returnvalue;
    case 'StormRain':
      return Math.round10(returnvalue * 0.2, -1);
    default:
      return returnvalue;
    }


  }
  
} 
module.exports = Converter;


// if __main process
if (require !== undefined && require.main === module) {
  console.log('__main__');
  //** OutsideTemperature
  let arr = [
    '4c4f4f00001101b2752e023dff010b0b6301ffffffffffffffffffffffffffffff46ffffffffffffff0000001a000000ffff0000ce001b027900bc006902ffffffffffffff000000000000000000000000000000000000b900062c9302d8070a0d7802',
    '4c4f4f00001001b3752f023dff010f0b0500ffffffffffffffffffffffffffffff46ffffffffffffff0000001a000000ffff0000ce001b027900bc006902ffffffffffffff000000000000000000000000000000000000bb00062c9302d8070a0d71f2',
    '4c4f4f14007801ce751f0242f50101018b00ffffffffffffffffffffffffffffff4effffffffffffff00000000000000ffff0000ce001b027c00bc006902ffffffffffffff000000000000000000000000000000000000f20008019302d8070a0ddc7a',
    '4c4f4f00000901b17530023d00020a0b5f01ffffffffffffffffffffffffffffff47ffffffffffffff00000023000000ffff0000ce001b027900bc006902ffffffffffffff000000000000000000000000000000000000d000062c9302d8070a0d161b',
    '4c4f4f00001d04cb75fc0149ff0101007900ffffffffffffffffffffffffffffff4affffffffffffff0000067d000000ffff0000ce001b020400c9007602ffffffffffffff000000000000000000000000000000000000ad00062c9302d9070a0d220e',
    '4c4f4f000054099875c8014b970103039800ffffffffffffffffffffffffffffff58ffffffffffffff00000000000000ffff0000ce001b020200d9008602ffffffffffffff000000000000000000000000000000000000b900062c9202da070a0d395d',
    '4c4f4f000054099875c8014b970103039800ffffffffffffffffffffffffffffff58ffffffffffffff00000000000000ffff0000ce001b020200d9008602ffffffffffffff000000000000000000000000000000000000b900062c9202da070a0d395d',
    '064c4f4f000054099875c8014b970103039800ffffffffffffffffffffffffffffff58ffffffffffffff00000000000000ffff0000ce001b020200d9008602ffffffffffffff000000000000000000000000000000000000b900062c9202da070a0d39',
    '4c4f4f000054099875c8014b970103039800ffffffffffffffffffffffffffffff58ffffffffffffff00000000000000ffff0000ce001b020200d9008602ffffffffffffff000000000000000000000000000000000000b900062c9202da070a0d395d'
  ];
    
  let con = new Converter();
  arr.forEach(currentItem => {
    let buf = Buffer.from(currentItem, 'hex');
    
    let res = con.parsingUpdateData({commandSet: {currCmdIndex:0, cmdList:[{data:'LOOP\n'}]}, data: buf});
    console.dir(res.data.OutsideTemperature);
      
  });
    

}


