
/**
 * @typedef {Object} deviceClientFormat Device Client 생성 자료 구조
 * @property {string} target_id device ID
 * @property {string} target_category inverter, connector, weather
 * @property {string} target_protocol s_hex, dm_v2, ...
 * @property {protocolConstructorConfig} protocolConstructorConfig
 */

/** 
 * @typedef {Object} protocolConstructorConfig 프로토콜 생성자에 넘겨줄 설정 데이터
 * @property {string|Buffer} deviceId
 */

/**
 * @typedef {Object} parsingResultFormat
 * @property {string} eventCode Parsing 결과 Event Code
 * @property {*} data Parsing 결과 반환 Data
 * @example
 * eventCode ---->
 * 'wait' : 대기
 * 'request' : 명령 재 전송
 * 'done' : Parsing 성공
 * 'fail' : Parsing 실패
 */

/**
 * @typedef {Object} generationCmdConfig 생성시킬 명령을 호출하는 형식
 * @property {string} cmdKey 생성 시킬 명령 고유 키(각 프로토콜 컨버터마다 존재. 해당 API 참조)
 * @property {string=} target 작동 시킬 대상(각 프로토콜 컨버터마다 존재. 해당 API 참조)
 */

