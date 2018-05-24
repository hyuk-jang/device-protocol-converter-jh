
/** 
 * @typedef {Object} protocol_info 프로토콜 생성자에 넘겨줄 설정 데이터
 * @property {string} mainCategory
 * @property {string} subCategory
 * @property {string|Buffer} deviceId
 * @property {*} option
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


 
/**
 * @typedef {Object} commandInfo 실제 장치로 명령을 수행할 데이터
 * @property {*} data 실제 수행할 명령
 * @property {number=} delayExecutionTimeoutMs 해당 명령을 수행하기전 대기 시간(ms)
 * @property {number} commandExecutionTimeoutMs 해당 명령을 수행할때까지의 timeout 유예시간(ms)
 */ 

/**
 * @typedef {Object} dcData CommandSet의 각각의 명령을 수행 결과 응답 데이터를 해당 Commander에게 알려줘야할 때 사용
 * @property {commandSet} commandSet 수행 명령 집합
 * @property {Buffer|*} data 발생한 데이터
 * @property {Manager} spreader 이벤트 전파자
 */ 

/**
 * @typedef {Object} commandSet 명령 수행 자료 구조
 * @property {number} rank 우선순위 (0: 긴급 명령으로 현재 진행되고 있는 명령 무시하고 즉시 해당 명령 수행, 1: 1순위 명령, 2: 2순위 명령 ...) 기본 값 2
 * @property {string} commandId 해당 명령 통합 ID
 * @property {string} commandType 명령 통합의 요청, 삭제 (ADD, CANCEL)
 * @property {string} commandName 해당 명령 집합 단위 이름
 * @property {Array.<commandInfo>} cmdList 명령을 보낼 배열
 * @property {number} currCmdIndex cmdList Index
 * @property {number} operationStatus 명령 수행 상태
 * @property {AbstCommander} commander [Auto Made] 명령을 요청한 Commander
 * @property {boolean} hasErrorHandling [Auto Made] 에러가 발생하였을 경우 다음 명령 진행을 멈출지 여부
 * @property {boolean} hasOneAndOne [Auto Made] 계속하여 연결을 수립할지 여부
 * @property {Timer=} commandExecutionTimer [Running Time Made] 명령 발송 후 응답까지 기다리는 SetTimeout
 * @property {Timer=} commandQueueReturnTimer [Running Time Made] 진행할 명령의 지연시간이 존재할 경우 standbyCommandSetList 대기열로 돌아오기까지의 SetTimeout
 */



/**
 * @typedef {Object} decondigInfo 수신받은 Buffer 데이터를 Parsing 하는데 필요한 정보
 * @property {string} key baseFormat Key
 * @property {number} byte Byte Length
 * @property {number=} startIndex 시작 
 * @property {string} callMethod Protocol Converter에 저장되어 있는 메소드 명
 * @prop {number=} scale 결과값에 곱할 배율
 * @prop {number=} fixed 소수점 처리 할 자리수
 */  