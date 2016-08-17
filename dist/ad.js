'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    conditional = require('./conditional');

module.exports = function () {
  var attackTime = arguments.length <= 0 || arguments[0] === undefined ? 44100 : arguments[0];
  var decayTime = arguments.length <= 1 || arguments[1] === undefined ? 44100 : arguments[1];

  var phase = accum(1, 0, { max: Infinity }),
      attackBuffer = new Float32Array(attackTime),
      decayBuffer = new Float32Array(decayTime),
      attackData = void 0,
      decayData = void 0,
      out = void 0;

  if (gen.globals.windows['t60attack'] === undefined) gen.globals.windows['t60attack'] = {};
  if (gen.globals.windows['t60decay'] === undefined) gen.globals.windows['t60decay'] = {};

  if (gen.globals.windows['t60attack'][attackTime] === undefined) {
    for (var i = 0; i < attackTime; i++) {
      attackBuffer[i] = Math.exp(i / attackTime, 5);
    }

    gen.globals.windows['t60attack'][attackTime] = attackData = data(attackBuffer);
  }

  if (gen.globals.windows['t60decay'][decayTime] === undefined) {
    var lastValue = 1,
        t60Time = Math.exp(-6.907755278921 / decayTime);
    for (var _i = 0; _i < decayTime; _i++) {
      decayBuffer[_i] = lastValue;
      lastValue *= t60Time;
    }

    gen.globals.windows['t60decay'][decayTime] = decayData = data(decayBuffer);
  }

  out = conditional(lt(phase, attackTime), peek(attackData, div(phase, attackTime)), peek(decayData, ltp(accum(1 / decayTime, 0, { max: Infinity }), 1)));

  return gtp(out, 0);
};