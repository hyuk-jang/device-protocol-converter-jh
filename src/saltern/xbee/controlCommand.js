module.exports = {
  WATER_DOOR: {
    OPEN: {
      cmd: '@cgo',
      cmdList: [{
        cmd: '@cgo'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    },
    CLOSE: {
      cmd: '@cgc',
      cmdList: [{
        cmd: '@cgc'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    },
    STATUS: {
      cmd: '@sts'
    }
  },
  SALINITY: {
    MEASURE: {
      cmd: '@cgm',
      cmdList: [{
        cmd: '@cgm'
      }, {
        timeout: 1000,
        cmd: '@sts'
      }]
    },
    STATUS: {
      cmd: '@sts'
    }
  },
  WATER_LEVEL: {
    STATUS: {
      cmd: '@sts'
    }
  },
  VALVE: {
    OPEN: {
      cmd: '@cvo',
      cmdList: [{
        cmd: '@cvo'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    },
    CLOSE: {
      cmd: '@cvc',
      cmdList: [{
        cmd: '@cvc'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    },
    STATUS: {
      cmd: '@sts'
    }
  },
  PUMP: {
    ON: {
      cmd: '@cpo',
      cmdList: [{
        cmd: '@cpo'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    },
    OFF: {
      cmd: '@cpc',
      cmdList: [{
        cmd: '@cpc'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    },
    STATUS: {
      cmd: '@sts'
    }
  }
};
