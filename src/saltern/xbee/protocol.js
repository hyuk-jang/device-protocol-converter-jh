exports.encodingProtocolTable = {
  waterDoor: [{
    requestCmd: 'open',
    responseCmd: '@cgo',
    hasAction: true
  },{
    requestCmd: 'close',
    responseCmd: '@cgc',
    hasAction: true
  },{
    requestCmd: 'status',
    responseCmd: '@sts'
  }],
  salinity: [{
    requestCmd: 'measure',
    responseCmd: '@cgc'
  },{
    requestCmd: 'status',
    responseCmd: '@sts'
  }],
  waterLevel: [{
    requestCmd: 'status',
    responseCmd: '@sts'
  }],
  valve: [{
    requestCmd: 'open',
    responseCmd: '@cvo',
    hasAction: true
  },{
    requestCmd: 'close',
    responseCmd: '@cvc',
    hasAction: true
  },{
    requestCmd: 'status',
    responseCmd: '@sts'
  }],
  pump: [{
    requestCmd: 'open',
    responseCmd: '@cpo',
    hasAction: true
  },{
    requestCmd: 'close',
    responseCmd: '@cpc',
    hasAction: true
  },{
    requestCmd: 'status',
    responseCmd: '@sts'
  }],
  
};




exports.decodingProtocolTable = (dialing) => {
  /** @type {Array.<{}>} */
  return {
    waterDoor: {
      dialing,
      address: '0001',
      length: '12'    // 수신할 데이터 Byte
    },
    valve: {
      dialing,
      address: '0002',
      length: '6'
    },
    pump: {
      dialing,
      address: '0003',
      length: '6'
    },
  };
};