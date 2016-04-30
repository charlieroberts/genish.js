'use strict';

var gen = require('./gen.js');

var proto = {
  basename: 'data',

  gen: function gen() {
    return 'gen.data.' + this.name;
  }
};

module.exports = function (x) {
  var y = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  var ugen = void 0;

  if (typeof x === 'number') {
    if (y !== 1) {
      ugen = [];
      for (var i = 0; i < y; i++) {
        ugen[i] = new Float32Array(x);
      }
    } else {
      ugen = new Float32Array(x);
    }
  } else {
    var size = x.length;
    ugen = new Float32Array(size);
    for (var _i = 0; _i < x.length; _i++) {
      ugen[_i] = x[_i];
    }
  }

  Object.assign(ugen, {
    name: proto.basename + gen.getUID(),
    dim: y === 1 ? ugen.length : x,
    channels: 1,
    gen: proto.gen
  });

  gen.data[ugen.name] = ugen;

  return ugen;
};