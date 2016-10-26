'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js'),
    t60 = require('./t60.js');

module.exports = function () {
  var decayTime = arguments.length <= 0 || arguments[0] === undefined ? 44100 : arguments[0];

  var ssd = history(1);

  ssd.in(mul(ssd.out, t60(decayTime)));

  ssd.out.trigger = function () {
    ssd.value = 1;
  };

  return ssd.out;
};