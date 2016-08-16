'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    ternary = require('./switch.js');

module.exports = function () {
  var attackTime = arguments.length <= 0 || arguments[0] === undefined ? 22050 : arguments[0];
  var decayTime = arguments.length <= 1 || arguments[1] === undefined ? 22050 : arguments[1];

  var phase = accum(1, 0, { max: Infinity }),
      attackBuffer = new Float32Array(attackTime),
      decayBuffer = new Float32Array(decayTime),
      attackData = void 0,
      decayData = void 0,
      out = void 0;

  if (gen.globals.windows['t60attack'] === undefined) gen.globals.windows['t60attack'] = {};
  if (gen.globals.windows['t60decay'] === undefined) gen.globals.windows['t60decay'] = {};

  if (gen.globals.windows['t60attack'][attackTime] === undefined) {
    var lastValue = 1,
        t60Time = Math.exp(-6.907755278921 / attackTime);
    for (var i = 0; i < attackTime; i++) {
      attackBuffer[i] = 1 - lastValue;
      lastValue *= t60Time;
    }

    gen.globals.windows['t60attack'][attackTime] = attackData = data(attackBuffer);
  }

  if (gen.globals.windows['t60decay'][decayTime] === undefined) {
    var _lastValue = 1,
        _t60Time = Math.exp(-6.907755278921 / decayTime);
    for (var _i = 0; _i < decayTime; _i++) {
      decayBuffer[_i] = _lastValue;
      _lastValue *= _t60Time;
    }

    gen.globals.windows['t60decay'][decayTime] = decayData = data(decayBuffer);
  }

  out = ternary(lt(phase, attackTime), peek(attackData, div(phase, attackTime)), peek(decayData, div(sub(phase, attackTime), decayTime)));

  return out;
};