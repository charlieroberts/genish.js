'use strict';

var library = {
  export: function _export(destination) {
    Object.assign(destination, library);
  },


  gen: require('./gen.js'),

  abs: require('./abs.js'),
  param: require('./param.js'),
  add: require('./add.js'),
  mul: require('./mul.js'),
  accum: require('./accum.js'),
  sin: require('./sin.js'),
  phasor: require('./phasor.js'),
  data: require('./data.js'),
  peek: require('./peek.js'),
  cycle: require('./cycle.js')
};

library.gen.lib = library;

module.exports = library;