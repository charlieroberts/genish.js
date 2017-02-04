'use strict';

var gen = require('./gen'),
    windows = require('./windows'),
    data = require('./data'),
    peek = require('./peek'),
    phasor = require('./phasor');

module.exports = function () {
  var type = arguments.length <= 0 || arguments[0] === undefined ? 'triangular' : arguments[0];
  var length = arguments.length <= 1 || arguments[1] === undefined ? 1024 : arguments[1];
  var alpha = arguments.length <= 2 || arguments[2] === undefined ? .15 : arguments[2];
  var shift = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  var buffer = new Float32Array(length);

  var name = type + '_' + length + '_' + shift;
  if (typeof gen.globals.windows[name] === 'undefined') {

    for (var i = 0; i < length; i++) {
      buffer[i] = windows[type](length, i, alpha, shift);
    }

    gen.globals.windows[name] = data(buffer);
  }

  var ugen = gen.globals.windows[name];
  ugen.name = 'env' + gen.getUID();

  return ugen;
};