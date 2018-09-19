const _ = require('lodash');
const defaultModel = require('./DefaultModel');
const ProtocolConverter = require('./ProtocolConverter');

const defaultWrapper = {
  /**
   * @param {protocol_info} protocolInfo
   * @param {Buffer} data
   */
  wrapFrameMsg: (protocolInfo, data) => {
    let returnValue;
    switch (_.get(protocolInfo, 'wrapperCategory', undefined)) {
      case 'default':
        returnValue = defaultWrapper.defaultWrapFrame(protocolInfo, data);
        break;
      default:
        returnValue = data;
        break;
    }

    return returnValue;
  },

  /**
   * 수신받은 dcData에서 frame을 걷어내고, dcData에서 전송 명령 또한 frame을 걷어낸 후 반환
   * @param {protocol_info} protocolInfo
   * @param {dcData} dcData
   */
  decodingDcData: (protocolInfo, dcData) => {
    const protocolConverter = new ProtocolConverter();

    if (_.get(protocolInfo, 'wrapperCategory', undefined) !== undefined) {
      protocolConverter.setCurrTransferCmd(
        dcData,
        defaultWrapper.peelFrameMsg(protocolInfo, protocolConverter.getCurrTransferCmd(dcData)),
      );
      _.set(dcData, 'data', defaultWrapper.peelFrameMsg(protocolInfo, dcData.data));
    }

    return dcData;
  },
  /**
   * 수신받은 data를 frame을 걷어내고 반환
   * @param {protocol_info} protocolInfo
   * @param {dcData} data
   */
  peelFrameMsg: (protocolInfo, data) => {
    let peeledData;
    // 전송 명령 frame을 걷어냄
    switch (_.get(protocolInfo, 'wrapperCategory', undefined)) {
      case 'default':
        peeledData = defaultWrapper.defaultPeelFrame(data);
        break;
      default:
        peeledData = data;
        break;
    }

    return peeledData;
  },

  /**
   * @desc 전송 프레임: STX CMD [*] ETX
   * @param {protocol_info} protocolInfo
   * @param {Buffer} data
   */
  defaultWrapFrame: (protocolInfo, data) => {
    const protocolConverter = new ProtocolConverter();
    let cmd = '';
    switch (protocolInfo.mainCategory) {
      case 'Inverter':
        cmd = 'I';
        break;
      case 'Sensor':
        cmd = 'S';
        break;
      default:
        cmd = 'A';
        break;
    }

    const bufCmd = protocolConverter.makeMsg2Buffer(cmd);
    const bufData = protocolConverter.makeMsg2Buffer(data);

    const result = defaultModel.encodingSimpleMsg(Buffer.concat([bufCmd, bufData]));
    return result;
  },

  /**
   * 수신받은 dcData에서 frame을 걷어내고, dcData에서 전송 명령 또한 frame을 걷어낸 후 반환
   * @param {Buffer} frameData
   * @return {Buffer}
   */
  defaultPeelFrame: frameData => {
    // console.log('frameData', frameData);
    const indexSTX = frameData.indexOf(0x02);
    const indexETX = frameData.lastIndexOf(0x03);
    // STX, CMD 이후부터 마지막 ETX 전까지 자름
    let bufBody;
    if (indexSTX > -1 && indexETX > -1) {
      bufBody = frameData.slice(indexSTX + 2, indexETX);
    } else if (indexSTX > -1) {
      bufBody = frameData.slice(indexSTX + 2);
    } else if (indexETX > -1) {
      bufBody = frameData.slice(0, indexETX);
    }

    return bufBody;
  },
};
module.exports = defaultWrapper;

if (require !== undefined && require.main === module) {
  const encodingResult = defaultWrapper.wrapFrameMsg(
    {
      mainCategory: 'Inverter',
      wrapperCategory: 'default',
    },
    'hiMan123',
  );

  console.log(encodingResult);

  const dcData = defaultWrapper.decodingDcData(
    {
      mainCategory: 'Inverter',
      wrapperCategory: 'default',
    },
    {
      commandSet: {
        cmdList: [
          {
            data: Buffer.from([0x02, 0x30, 0x31, 0x32, 0x03, 0x60, 0x03]),
          },
        ],
        currCmdIndex: 0,
      },
      data: Buffer.from([0x02, 0x30, 0x31, 0x32, 0x03, 0x60, 0x03]),
    },
  );

  console.log(dcData.commandSet.cmdList);
  console.log(dcData.data);
}
