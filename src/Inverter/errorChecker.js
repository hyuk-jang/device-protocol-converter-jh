const _ = require('lodash');

const { BU } = require('base-util-jh');

const baseFormat = require('./baseFormat');
const { BASE_KEY: BK } = require('./BaseModel');

/**
 * 단상 인버터 데이터 체크
 * @param {Object} dataBody
 */
function checkSingleInv(dataBody) {
  try {
    _.forEach(dataBody, (dataList, dataKey) => {
      // 데이터가 존재하고 첫번째 데이터가 숫자일 경우에만 검증
      if (dataList.length && _.isNumber(_.head(dataList))) {
        const value = _.head(dataList);

        let errMsg;

        switch (dataKey) {
          case BK.pvAmp:
            errMsg = value > 1000 && `pvAmp(${value}) is too high`;
            break;
          case BK.pvVol:
            errMsg = value > 500 && `pvVol(${value}) is too high`;
            break;
          case BK.pvKw:
          case BK.powerPvKw:
            errMsg = value > 1000 && `pvKw(${value}) is too high`;
            break;
          case BK.gridRsVol:
          case BK.gridStVol:
          case BK.gridTrVol:
            errMsg = value > 500 && `gridVol(${value}) is too high`;
            break;
          case BK.gridRAmp:
          case BK.gridSAmp:
          case BK.gridTAmp:
            errMsg = value > 1000 && `gridAmp(${value}) is too high`;
            break;
          case BK.gridLf:
            errMsg = value > 100 && `gridLf(${value}) is too high`;
            break;
          case BK.powerGridKw:
            errMsg = value > 1000 && `powerGridKw(${value}) is too high`;
            break;
          case BK.powerPf:
            errMsg = value > 200 && `powerPf(${value}) is too high`;
            break;
          // 1억 kWh 이상이라면 에러
          case BK.powerCpKwh:
            errMsg = value > 100000000 && `powerCpKwh(${value}) is too high`;
            break;
          default:
            break;
        }
        // 에러 데이터가 있다고 판단될 경우
        if (_.isString(errMsg) && errMsg.length) {
          throw new Error(errMsg);
        }
      }
    });
    // 이상없을 경우 원 데이터 반환
    return dataBody;
  } catch (error) {
    // BU.CLI(error);
    return baseFormat;
  }
}

/**
 * 삼상 인버터 데이터 체크
 * @param {Object} dataBody
 */
function checkTripleInv(dataBody) {
  try {
    _.forEach(dataBody, (dataList, dataKey) => {
      // 데이터가 존재하고 첫번째 데이터가 숫자일 경우에만 검증
      if (dataList.length && _.isNumber(_.head(dataList))) {
        const value = _.head(dataList);

        let errMsg;

        switch (dataKey) {
          case BK.pvAmp:
            errMsg = value > 1000 && `pvAmp(${value}) is too high`;
            break;
          case BK.pvVol:
            errMsg = value > 700 && `pvVol(${value}) is too high`;
            break;
          case BK.pvKw:
          case BK.powerPvKw:
            errMsg = value > 1000 && `pvKw(${value}) is too high`;
            break;
          case BK.gridRsVol:
          case BK.gridStVol:
          case BK.gridTrVol:
            errMsg = value > 700 && `gridVol(${value}) is too high`;
            break;
          case BK.gridRAmp:
          case BK.gridSAmp:
          case BK.gridTAmp:
            errMsg = value > 1000 && `gridAmp(${value}) is too high`;
            break;
          case BK.gridLf:
            errMsg = value > 100 && `gridLf(${value}) is too high`;
            break;
          case BK.powerGridKw:
            errMsg = value > 1000 && `powerGridKw(${value}) is too high`;
            break;
          case BK.powerPf:
            errMsg = value > 200 && `powerPf(${value}) is too high`;
            break;
          // 1억 kWh 이상이라면 에러
          case BK.powerCpKwh:
            errMsg = value > 100000000 && `powerCpKwh(${value}) is too high`;
            break;
          default:
            break;
        }
        // 에러 데이터가 있다고 판단될 경우
        if (_.isString(errMsg) && errMsg.length) {
          throw new Error(errMsg);
        }
      }
    });
    // 이상없을 경우 원 데이터 반환
    return dataBody;
  } catch (error) {
    // BU.CLI(error);
    return baseFormat;
  }
}

module.exports = {
  checkSingleInv,
  checkTripleInv,
};
