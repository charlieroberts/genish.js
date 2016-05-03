'use strict';

var gen = require('./gen.js'),
    utilities = require('./utilities.js');

var proto = {
  basename: 'data',

  gen: function gen() {
    return 'gen.data.' + this.name + '.buffer';
  }
};

module.exports = function (x) {
  var y = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  var ugen = void 0,
      buffer = void 0,
      shouldLoad = false;

  if (typeof x === 'number') {
    if (y !== 1) {
      buffer = [];
      for (var i = 0; i < y; i++) {
        buffer[i] = new Float32Array(x);
      }
    } else {
      buffer = new Float32Array(x);
    }
  } else if (Array.isArray(x)) {
    //! (x instanceof Float32Array ) ) {
    var size = x.length;
    buffer = new Float32Array(size);
    for (var _i = 0; _i < x.length; _i++) {
      buffer[_i] = x[_i];
    }
  } else if (typeof x === 'string') {
    buffer = [0];
    shouldLoad = true;
  } else {
    buffer = x;
  }

  ugen = {
    buffer: buffer,
    name: proto.basename + gen.getUID(),
    dim: y === 1 ? buffer.length : x,
    channels: 1,
    gen: proto.gen,
    onload: null,
    then: function then(fnc) {
      ugen.onload = fnc;
      return ugen;
    }
  };

  gen.data[ugen.name] = ugen;

  if (shouldLoad) {
    var promise = utilities.loadSample(x, ugen);
    promise.then(function () {
      ugen.onload();
    });
  }

  return ugen;
};