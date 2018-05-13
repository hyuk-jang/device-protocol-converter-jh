'use strict';
const baseFormat = require('./baseFormat');

class BaseModel {
  constructor(type) {
    this.baseFormat = baseFormat;


    this.DEFAULT = {
      STATUS: {
        UNDEF: 'UNDEF'
      },
      COMMAND: {
        MEASURE: ''
      }
    };

    
    if(type){
      const Model = require(`./${type}/Model`);
      return new Model(this);
    }
  }
}
module.exports = BaseModel;