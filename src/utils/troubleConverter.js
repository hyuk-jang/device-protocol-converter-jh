const _ = require('lodash');

const { BU } = require('base-util-jh');

/**
 *
 * @param {string} binary
 * @param {troubleInfo[]} troubleStorage
 */
function makeTroubleList(binary, troubleStorage) {
  /** @type {troubleInfo[]} */
  const troubleList = [];

  binary = [...binary].reverse().join('');

  _.forEach(troubleStorage, (troubleInfo, index) => {
    const binChar = binary.charAt(index);

    if (binChar === '1') {
      // 기본 값은 Error로 설정
      troubleInfo.isError === undefined && _.set(troubleInfo, 'isError', 1);
      _.isNil(troubleInfo.code) && _.set(troubleInfo.code, troubleInfo.msg);

      troubleList.push(troubleInfo);
    }
  });

  return troubleList;
}
exports.makeTroubleList = makeTroubleList;
