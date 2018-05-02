module.exports = {
  waterDoor: {
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
  salinity: {
    MEASURE: {
      cmd: '@cgm',
      cmdList: [{
        cmd: '@cgm'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    },
    STATUS: {
      cmd: '@sts'
    }
  },
  waterLevel: {
    STATUS: {
      cmd: '@sts'
    }
  },
  valve: {
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
  pump: {
    OPEN: {
      cmd: '@cpo',
      cmdList: [{
        cmd: '@cpo'
      }, {
        timeout: 1000 * 10,
        cmd: '@sts'
      }]
    },
    CLOSE: {
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
