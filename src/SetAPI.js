


exports.operationController = {
  saltern: {
    xbee: require('./saltern/xbee/controlCommand')
  },
  weathercast: {
    vantagepro2: require('./weathercast/vantagepro2/controlCommand')
  }
};


exports.baseFormat = {
  saltern: require('./saltern/baseFormat'),
  weathercast: {
    vantagepro2: require('./weathercast/vantagepro2/controlCommand')
  }
};

exports.deviceStatus = {
  saltern: require('./saltern/baseModel').deviceModel,
};