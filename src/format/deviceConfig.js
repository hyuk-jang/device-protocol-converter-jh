/**
 * @typedef {Object} constructorSerial Serial Config
 * @property {string} port 접속 Port
 * @property {number} baudRate 보 레이트
 */

/**
 * @typedef {Object} constructorSerialWithParser Parser를 붙인 Serial config
 * @property {string} port 접속 Port
 * @property {number} baudRate 보 레이트
 * @property {{parser: string, option:*}} addConfigInfo SerialPort에 Binding 할 Parser 객체
 * #parser ---> 'delimiterParser', 'byteLengthParser', 'readLineParser', 'readyParser'
 * #option --> 각 Parser Type에 맞는 Option
 * @example
 * addConfigInfo{parser:'delimiterParser', option: Buffer.from([0x04])}  해당 option과 매칭까지의 데이터 반환
 * addConfigInfo{parser:'byteLengthParser', option: 55} 55Byte로 끊어서 반환
 * addConfigInfo{parser:'readLineParser', option: '\r\n'} Carrige Return 과 Line Feed를 만족할 경우 해당 Option을 제외하고 반환
 * addConfigInfo{parser:'readyParser', option: 'Ready'} all data after READY is received
 */ 

/**
 * @typedef {Object} deviceConfigSocket Socket Config
 * @property {number} port 접속 Port
 * @property {string} host 접속 host
 */

