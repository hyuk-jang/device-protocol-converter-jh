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
   * Amp Oil Pump
   * @description AMP_OP
   * @type {number[]=} 오일 펌프 전류
   */
  ampOp: [],
  /**
   * Feedback Valve Oil Tank
   * @description FDVA_OT
   * @type {number[]=} 오일 탱크 밸브 피드백
   */
  fdValveOt: [],
  /**
   * Feedback Valve PTC
   * @description FDVA_PTC
   * @type {number[]=} 집열기 밸브 피드백
   */
  fdValvePtc: [],
  /**
   * Feedback Valve Steam Generator
   * @description FDVA_SG
   * @type {number[]=} 증기 발생기 밸브 피드백
   */
  fdValveSg: [],
  /**
   * Flow Rate Cumulative Steam Generator
   * @description FRCU_SG
   * @type {number[]=} 증기 누계 유량
   */
  frCumSg: [],
  /**
   * Flow Rate Cumulative Pipe
   * @description FRCU_PIP
   * @type {number[]=} 파이프 누계 유량
   */
  frCumPipe: [],
  /**
   * Flow Rate Instantaneous Steam Generator
   * @description FRIN_SG
   * @type {number[]=} 증기 순시 유량
   */
  frInsSg: [],
  /**
   * Flow Rate Instantaneous Pipe
   * @description FRIN_PIP
   * @type {number[]=} 파이프 순시 유량
   */
  frInsPipe: [],
  /**
   * Flow Rate Instantaneous Pipe Operation
   * @description FRIN_PIOP
   * @type {number[]=} 파이프 순시 유량 방향
   */
  frInsPipeOper: [],
  /**
   * @description FRE_PIP
   * @type {number[]=} 파이프 주파수
   */
  frequencyPipe: [],
  /**
   * @description IRR_ENV
   * @type {number[]=} 환경 조도
   */
  irradianceEnv: [],
  /**
   * Pressure Gauge Steam Generator
   * @description PRGA_SG
   * @type {number[]=} 증기 발생기 압력
   */
  pressureGaugeSg: [],
  /**
   * Pressure Gauge Pipe
   * @description PRGA_PIP
   * @type {number[]=} 파이프 압력
   */
  pressureGaugePipe: [],
  /**
   * @description SOL_ENV
   * @type {number[]=} 환경 일사량
   */
  solarEnv: [],
  /**
   * @description TEM_ENV
   * @type {number[]=} 환경 온도
   */
  tempEnv: [],
  /**
   * @description TEM_OIL
   * @type {number[]=} 오일 온도
   */
  tempOil: [],
  /**
   * @description TEM_STE
   * @type {number[]=} 스팀 온도
   */
  tempSteam: [],
  /**
   * @description TEM_UNI
   * @type {number[]=} 단위 온도
   */
  tempUnit: [],
  // *************  Modbus Read Coil
  /**
   * Mode System Operation
   * @description INF_SYOP
   * @type {number[]=} 시스템 동작
   */
  infoSysOper: [],
  /**
   * Mode Weather
   * @description INF_SKY
   * @type {number[]=} 날씨
   */
  infoSky: [],
  /**
   * Mode Use Oil Pump
   * @description INF_USOP
   * @type {number[]=} 오일 펌프 사용 유무
   */
  infoUseOp: [],
  /**
   * Mode System Mode
   * @description INF_SYMO
   * @type {number[]=} 운영 모드
   */
  infoSysMode: [],
  /**
   * @description MOD_OT
   * @type {number[]=} 탱크 모드
   */
  modeOt: [],
  /**
   * @description MOD_STE
   * @type {number[]=} 증기 모드
   */
  modeSteam: [],
  // Device
  /**
   * @description PUM_OIL
   * @type {number[]=} 오일 펌프
   */
  pumpOil: [],
  /**
   * Pump Supply Water
   * @description PUM_SW
   * @type {number[]=} 보충 펌프
   */
  pumpSw: [],
  /**
   * @description PTC
   * @type {number[]=} PTC 집광기
   */
  ptc: [],

  // /**
  //  * @description MODE
  //  * @type {number[]=} 로컬모드 운행중, 원격모드 운행중, 타이머모드 운행중
  //  */
  // operStsMode: [],
  // /**
  //  * @description MODE
  //  * @type {number[]=} 시스템 동작 여부
  //  */
  // isModeSysOper: [],
  // /**
  //  * @description MODE
  //  * @type {number[]=} 맑은 날씨
  //  */
  // isModeSunnySky: [],
  // /**
  //  * @description MODE
  //  * @type {number[]=} 증기 직접공급모드 운행
  //  */
  // isModeDirectStreamOper: [],
  // /**
  //  * @description MODE
  //  * @type {number[]=} 열저장탱크 열저장모드 운행
  //  */
  // isModeHeatSto: [],
  // /**
  //  * @description MODE
  //  * @type {number[]=} 열저장탱크 열방출모드 운행
  //  */
  // isModeHeatRelease: [],
  // /**
  //  * @description MODE
  //  * @type {number[]=} 우선적 열저장모드 운행
  //  */
  // isModeHeatReleaseFirst: [],
  // /**
  //  * @type {number[]=} 1#오일펌프 사용중
  //  */
  // isUseOp1: [],
  // /**
  //  * @type {number[]=} 긴급정지
  //  */
  // isEmergencyStop: [],
  // /**
  //  * @type {number[]=} 오일탱크 열저장 설정 요구에 부합됨
  //  */
  // isReachSetHeatSto: [],
  // // /**
  // //  * @type {number[]=} 1#오일탱크 열저장 설정 요구에 부합됨
  // //  */
  // // isReachSetHeatSto1: [],
  // // /**
  // //  * @type {number[]=} 2#오일탱크 열저장 설정 요구에 부합됨
  // //  */
  // // isReachSetHeatSto2: [],
  // /**
  //  * @type {number[]=} 탱크가 열방출 허용 온도에 도달함
  //  */
  // isReachHeatReleaseTemp: [],
  // // /**
  // //  * @type {number[]=} 1#탱크가 열방출 허용 온도에 도달함
  // //  */
  // // isReachHeatReleaseTemp1: [],
  // // /**
  // //  * @type {number[]=} 2#탱크가 열방출 허용 온도에 도달함
  // //  */
  // // isReachHeatReleaseTemp2: [],
  // /**
  //  * @type {number[]=} 오일 펌프 동작 유무
  //  */
  // isRunOp: [],
  // // /**
  // //  * @type {number[]=} 1# 오일 펌프 동작 유무
  // //  */
  // // isRunOp1: [],
  // // /**
  // //  * @type {number[]=} 2# 오일 펌프 동작 유무
  // //  */
  // // isRunOp2: [],
  // /**
  //  * @type {number[]=} PTC 집광기 동작 유무
  //  */
  // isRunCol: [],
  // /**
  //  * @type {number[]=} 보충 펌프 동작 유무
  //  */
  // isRunWaterPump: [],
  // /**
  //  * @type {number[]=} 증기 누계 유량
  //  */
  // sgCumulativeFlow: [],
  // /**
  //  * @type {number[]=} 증기 순시 유량
  //  */
  // sgInstantaneousFlow: [],
  // /**
  //  * @type {number[]=} 증기발생기 압력
  //  */
  // sgPressure: [],
  // /**
  //  * @type {number[]=} 증기발생기 온도
  //  */
  // sgTemp: [],
  // /**
  //  * @type {number[]=} 집열기 오일배출 온도
  //  */
  // colOilOutletTemp: [],
  // /**
  //  * @type {number[]=} 집열기 오일진입 온도
  //  */
  // colOilInletTemp: [],
  // /**
  //  * @type {number[]=} 현재 방사조도
  //  */
  // outsideIrradiance: [],
  // /**
  //  * @type {number[]=} 현재 환경온도
  //  */
  // outsideTemp: [],
  // /**
  //  * @type {number[]=} 발생기 입구온도
  //  */
  // sgInletTemp: [],
  // /**
  //  * @type {number[]=} 오일탱크 온도
  //  */
  // otTemp: [],
  // // /**
  // //  * @type {number[]=} 1#오일탱크 온도
  // //  */
  // // ot1Temp: [],
  // // /**
  // //  * @type {number[]=} 2#오일탱크 온도
  // //  */
  // // ot2Temp: [],
  // /**
  //  * @type {number[]=} 오일 펌프 전류
  //  */
  // opAmp: [],
  // // /**
  // //  * @type {number[]=} 1# 오일 펌프 전류
  // //  */
  // // op1Amp: [],
  // // /**
  // //  * @type {number[]=} 2# 오일 펌프 전류
  // //  */
  // // op2Amp: [],
  // /**
  //  * @type {number[]=} 발생기 밸브 피드백
  //  */
  // sgValveFd: [],
  // /**
  //  * @type {number[]=} 집열기밸브 피드백
  //  */
  // colValveFd: [],
  // /**
  //  * @type {number[]=} 오일탱크 밸브 피드백
  //  */
  // otValveFd: [],
  // // /**
  // //  * @type {number[]=} 1호 오일탱크 밸브 피드백
  // //  */
  // // ot1ValveFd: [],
  // // /**
  // //  * @type {number[]=} 2호 오일탱크 밸브 피드백
  // //  */
  // // ot2ValveFd: [],
  // /**
  //  * @type {number[]=} 스팀 출구 유량
  //  */
  // sgOutletFlowRate: [],
  // /**
  //  * @type {number[]=} 스팀 출구 유속
  //  */
  // sgOutletFlowRateOperSts: [],
  // /**
  //  * @type {number[]=} 스팀 출구 총 유량
  //  */
  // sgOutletTotalFlowRate: [],
  // /**
  //  * @type {number[]=} 스팀 출구 온도
  //  */
  // sgOutletTemp: [],
  // /**
  //  * @type {number[]=} 스팀 출구 압력
  //  */
  // sgOutletPressure: [],
  // /**
  //  * @type {number[]=} 스팀 출구 주파수
  //  */
  // sgOutletFrequency: [],
  // /**
  //  * @type {number[]=} 스팀 출구 단위
  //  */
  // sgOutletUnit: [],
};
