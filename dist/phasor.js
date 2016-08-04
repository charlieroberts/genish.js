'use strict';

var gen = require('./gen.js'),
    accum = require('./accum.js'),
    mul = require('./mul.js'),
    proto = { basename: 'phasor' };

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var props = arguments[2];

  var ugen = typeof frequency === 'number' ? accum(frequency / gen.samplerate, reset, props) : accum(mul(frequency, 1 / gen.samplerate), reset, props);

  ugen.name = proto.basename + gen.getUID();

  return ugen;
};