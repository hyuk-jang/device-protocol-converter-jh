const Model = require('./Model');

const { BASE_KEY: BK } = Model;

const {
  device: { RELAY },
} = new Model();

const onDeviceOperationStatus = {
  /** @type {Object} 릴레이 */
  [RELAY.KEY]: {
    /** @type {number} 꺼짐 */
    0: RELAY.STATUS.OFF,
    /** @type {number} 켜짐 */
    1: RELAY.STATUS.ON,
  },
};
exports.onDeviceOperationStatus = onDeviceOperationStatus;

exports.decodingProtocolTable = () => {
  /** @type {decodingProtocolInfo} */
  const relay = {
    decodingDataList: [
      {
        key: BK.relay,
      },
      {
        key: BK.relay,
      },
      {
        key: BK.relay,
      },
      {
        key: BK.relay,
      },
      {
        key: BK.relay,
      },
      {
        key: BK.relay,
      },
      {
        key: BK.relay,
      },
      {
        key: BK.relay,
      },
    ],
  };

  return relay;
};
