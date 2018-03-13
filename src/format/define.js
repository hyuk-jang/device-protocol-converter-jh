
/**
 * @typedef {Object} deviceClientFormat Device Client 생성 자료 구조
 * @property {Object=} user Device Client 주체. (최종적으로 데이터를 수신할 대상)
 * @property {boolean} hasOneAndOne 계속하여 연결을 수립할지 여부
 * @property {string} target_id device ID
 * @property {string} target_category inverter, connector 등등 장치 타입
 * @property {string} target_protocol s_hex, dm_v2, ... 장치의 프로토콜
 * @property {string} connect_type 'socket', 'serial', ...
 * @property {number|string} port socket --> number, serial --> string, ...
 * @property {string} host 접속 경로(socket 일 경우 사용)
 * @property {number} baud_rate serial 일 경우 
 * @property {{type: string, option: *}=} parser serial 일 경우 pipe 처리할 parser option
 * @property {{dialing: Buffer}} protocol 프로토콜 컨버터에서 사용되는 옵션
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


