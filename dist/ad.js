'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    div = require('./div.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    ifelsef = require('./ifelseif.js'),
    lt = require('./lt.js'),
    bang = require('./bang.js');

module.exports = function () {
  var attackTime = arguments.length <= 0 || arguments[0] === undefined ? 44100 : arguments[0];
  var decayTime = arguments.length <= 1 || arguments[1] === undefined ? 44100 : arguments[1];
  var _props = arguments[2];

  var _bang = bang(),
      phase = accum(1, _bang, { max: Infinity, shouldWrap: false }),
      props = Object.assign({}, { shape: 'exp' }, _props),
      bufferData = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0;

  if (props.shape === 'exp') {
    if (gen.globals.expCurve === undefined) {
      buffer = new Float32Array(1024);

      for (var i = 0; i < 1024; i++) {
        buffer[i] = Math.pow(i / 1024, 4);
      }

      gen.globals.expCurve = bufferData = data(buffer);
    } else {
      bufferData = gen.globals.expCurve;
    }
    out = ifelse([lt(phase, attackTime), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }), lt(phase, attackTime + decayTime), peek(bufferData, sub(1, div(sub(phase, attackTime), decayTime)), { boundmode: 'clamp' }), 0]);
  } else if (props.shape === 'linear') {
    out = ifelse([lt(phase, attackTime), memo(div(phase, attackTime)), //peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ),
    lt(phase, attackTime + decayTime), sub(1, div(sub(phase, attackTime), decayTime)), 0]);
  }

  out.trigger = _bang.trigger;

  return out;
};