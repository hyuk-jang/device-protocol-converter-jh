const BU = require('base-util-jh').baseUtil;
const ProtocolConverter = require('../../default/ProtocolConverter');
const protocol = require('./protocol');
// const baseFormat = require('../baseFormat');

require('../../format/define');
class Converter extends ProtocolConverter {
  constructor() {
    super();
  }

  /**
   * 장치를 조회 및 제어하기 위한 명령 생성. 
   * cmd가 있다면 cmd에 맞는 특정 명령을 생성하고 아니라면 기본 명령을 생성
   * @return {Array} 장치를 조회하기 위한 명령 리스트 반환
   */
  generationCommand(){
    return ['LOOP\n'];
  }

  /**
   * 데이터 분석 요청
   * @param {*} requestData 장치로 요청한 명령
   * @param {*} responseData 장치에서 수신한 데이터
   * @return {parsingResultFormat}
   */
  parsingUpdateData(requestData, responseData){
    /** @type {parsingResultFormat} */
    const returnvalue = {};

    if('LOOP\n' === requestData){
      let bufferData = responseData instanceof Buffer ? responseData : Buffer.from(responseData);

      let addValue = 0;
      if (bufferData.length == 100) {
        addValue = 1;
      } else if (bufferData.length == 99) {
        addValue = 0;
      } else {
        returnvalue.eventCode = 'wait';
        returnvalue.data = {};
        return returnvalue;
      }
      
      protocol.forEach(protocol => {
        let startPoint = protocol.substr[0];
        let endPoint = protocol.substr[1];
        let realStartPoint = startPoint + endPoint - 1 + addValue;
        let hexCode = '';
        for (let i = realStartPoint; i >= startPoint + addValue; i--) {
          let TargetValue = bufferData[i].toString(16);
          if (TargetValue == 'ff') {
            TargetValue = '00';
          }
  
          if (TargetValue.length === 1) {
            hexCode += '0';
          }
          hexCode += TargetValue;
        }
        protocol.value = this._ChangeData(protocol.key, this.converter().hex2dec(hexCode));
      });
  
      let vantagePro2Data = {};
      protocol.forEach((protocol) => {
        let result = this.getProtocolValue(protocol.key);
        vantagePro2Data[result.key] = result.value;
      });

      returnvalue.eventCode = 'done';
      returnvalue.data = vantagePro2Data;

      return returnvalue;
    } else {
      throw new Error('요청한 데이터에 문제가 있습니다.');
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