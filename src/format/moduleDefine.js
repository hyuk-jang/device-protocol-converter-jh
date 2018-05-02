
exports.definedCommanderResponse = {
  /**
   * @type {string} 수신된 데이터 참
   */
  DONE: 'DONE', 
  /**
   * @type {string} 더 많은 데이터가 필요하니 기달려라
   */
  WAIT: 'WAIT', 
  /**
   * @type {string} 데이터에 문제가 있다
   */
  ERROR: 'ERROR',   
  /**
   * @type {string} 명령을 재전송 해달라
   */
  RETRY: 'RETRY',   
  /**
   * @type {string} 다음 명령으로 가라.(강제)
   */
  NEXT: 'NEXT',     
};