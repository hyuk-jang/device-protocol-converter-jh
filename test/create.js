

const config = {
  target_id: 'VantagePro_1',
  target_name: 'Davis Vantage Pro2',
  target_category: 'weathercast',
  target_protocol: 'vantagepro2',
  connect_type: 'serial',
  port: 'COM3', // Port를 직접 지정하고자 할때 사용
  baud_rate: 19200,
  // parser: {
  //   type: 'byteLengthParser',
  //   option: 55
  // }
};

const AbstConverter = require('../src/default/AbstConverter');

console.log('what?');
const converter = new AbstConverter(config);
converter.setProtocolConverter();


let res = converter.generationCommand();
console.log('222', res);