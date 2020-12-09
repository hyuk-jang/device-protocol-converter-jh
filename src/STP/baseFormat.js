// Solar Thermal Power (태양열 발전)
/**
 * Steam Generator: SG
 * Flow Switch: FS
 * Oil Pump: OP
 * Oil Tank: OT
 *
 * Collector: Col
 * Feedback: FD
 * System: SYS
 * Storage: STO
 * Operation: OPER
 * Status: STS
 * Current: CUR
 */

/**
 * @module baseFormat 기타
 */
module.exports = {
  /**
   * @description MODE
   * @type {number[]=} 로컬모드 운행중, 원격모드 운행중, 타이머모드 운행중
   */
  operStsMode: [],
  /**
   * @description MODE
   * @type {number[]=} 시스템 동작 여부
   */
  isModeSysOper: [],
  /**
   * @description MODE
   * @type {number[]=} 맑은 날씨
   */
  isModeSunnySky: [],
  /**
   * @description MODE
   * @type {number[]=} 증기 직접공급모드 운행
   */
  isModeDirectStreamOper: [],
  /**
   * @description MODE
   * @type {number[]=} 열저장탱크 열저장모드 운행
   */
  isModeHeatSto: [],
  /**
   * @description MODE
   * @type {number[]=} 열저장탱크 열방출모드 운행
   */
  isModeHeatRelease: [],
  /**
   * @description MODE
   * @type {number[]=} 우선적 열저장모드 운행
   */
  isModeHeatReleaseFirst: [],
  /**
   * @type {number[]=} 1#오일펌프 사용중
   */
  isUseOp1: [],
  /**
   * @type {number[]=} 긴급정지
   */
  isEmergencyStop: [],
  /**
   * @type {number[]=} 오일탱크 열저장 설정 요구에 부합됨
   */
  isReachSetHeatSto: [],
  // /**
  //  * @type {number[]=} 1#오일탱크 열저장 설정 요구에 부합됨
  //  */
  // isReachSetHeatSto1: [],
  // /**
  //  * @type {number[]=} 2#오일탱크 열저장 설정 요구에 부합됨
  //  */
  // isReachSetHeatSto2: [],
  /**
   * @type {number[]=} 탱크가 열방출 허용 온도에 도달함
   */
  isReachHeatReleaseTemp: [],
  // /**
  //  * @type {number[]=} 1#탱크가 열방출 허용 온도에 도달함
  //  */
  // isReachHeatReleaseTemp1: [],
  // /**
  //  * @type {number[]=} 2#탱크가 열방출 허용 온도에 도달함
  //  */
  // isReachHeatReleaseTemp2: [],
  /**
   * @type {number[]=} 오일 펌프 동작 유무
   */
  isRunOp: [],
  // /**
  //  * @type {number[]=} 1# 오일 펌프 동작 유무
  //  */
  // isRunOp1: [],
  // /**
  //  * @type {number[]=} 2# 오일 펌프 동작 유무
  //  */
  // isRunOp2: [],
  /**
   * @type {number[]=} PTC 집광기 동작 유무
   */
  isRunCol: [],
  /**
   * @type {number[]=} 보충 펌프 동작 유무
   */
  isRunWaterPump: [],
  /**
   * @type {number[]=} 증기 누계 유량
   */
  sgCumulativeFlow: [],
  /**
   * @type {number[]=} 증기 순시 유량
   */
  sgInstantaneousFlow: [],
  /**
   * @type {number[]=} 증기발생기 압력
   */
  sgPressure: [],
  /**
   * @type {number[]=} 증기발생기 온도
   */
  sgTemp: [],
  /**
   * @type {number[]=} 집열기 오일배출 온도
   */
  colOilOutletTemp: [],
  /**
   * @type {number[]=} 집열기 오일진입 온도
   */
  colOilInletTemp: [],
  /**
   * @type {number[]=} 현재 방사조도
   */
  outsideIrradiance: [],
  /**
   * @type {number[]=} 현재 환경온도
   */
  outsideTemp: [],
  /**
   * @type {number[]=} 발생기 입구온도
   */
  sgInletTemp: [],
  /**
   * @type {number[]=} 오일탱크 온도
   */
  otTemp: [],
  // /**
  //  * @type {number[]=} 1#오일탱크 온도
  //  */
  // ot1Temp: [],
  // /**
  //  * @type {number[]=} 2#오일탱크 온도
  //  */
  // ot2Temp: [],
  /**
   * @type {number[]=} 오일 펌프 전류
   */
  opAmp: [],
  // /**
  //  * @type {number[]=} 1# 오일 펌프 전류
  //  */
  // op1Amp: [],
  // /**
  //  * @type {number[]=} 2# 오일 펌프 전류
  //  */
  // op2Amp: [],
  /**
   * @type {number[]=} 발생기 밸브 피드백
   */
  sgValveFd: [],
  /**
   * @type {number[]=} 집열기밸브 피드백
   */
  colValveFd: [],
  /**
   * @type {number[]=} 오일탱크 밸브 피드백
   */
  otValveFd: [],
  // /**
  //  * @type {number[]=} 1호 오일탱크 밸브 피드백
  //  */
  // ot1ValveFd: [],
  // /**
  //  * @type {number[]=} 2호 오일탱크 밸브 피드백
  //  */
  // ot2ValveFd: [],
  /**
   * @type {number[]=} 스팀 출구 유량
   */
  sgOutletFlowRate: [],
  /**
   * @type {number[]=} 스팀 출구 유속
   */
  sgOutletFlowRateOperSts: [],
  /**
   * @type {number[]=} 스팀 출구 총 유량
   */
  sgOutletTotalFlowRate: [],
  /**
   * @type {number[]=} 스팀 출구 온도
   */
  sgOutletTemp: [],
  /**
   * @type {number[]=} 스팀 출구 압력
   */
  sgOutletPressure: [],
  /**
   * @type {number[]=} 스팀 출구 주파수
   */
  sgOutletFrequency: [],
  /**
   * @type {number[]=} 스팀 출구 단위
   */
  sgOutletUnit: [],
};
