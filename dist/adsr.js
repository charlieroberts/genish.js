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
    bang = require('./bang.js'),
    env = require('./env.js'),
    param = require('./param.js');

module.exports = function (_props) {
  var envTrigger = bang(),
      phase = accum(1, envTrigger, { max: Infinity, shouldWrap: false }),
      shouldSustain = param(1),
      defaults = {
    shape: 'Exponential',
    alpha: 5,
    attackTime: 44,
    decayTime: gen.samplerate / 2,
    sustainTime: gen.samplerate,
    releaseTime: gen.samplerate,
    sustainLevel: .7,
    triggerRelease: false
  },
      props = Object.assign({}, defaults, _props),
      bufferData = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0,
      sustainCondition = void 0,
      releaseAccum = void 0,
      releaseCondition = void 0;

  // slightly more efficient to use existing phase accumulator for linear envelopes
  if (props.shape === 'linear') {
    out = ifelse(lt(phase, props.attackTime), memo(div(phase, props.attackTime)), lt(phase, props.attackTime + props.decayTime), sub(1, mul(div(sub(phase, props.attackTime), props.decayTime), 1 - props.sustainLevel)), lt(phase, props.attackTime + props.decayTime + props.sustainTime), props.sustainLevel, lt(phase, props.attackTime + props.decayTime + props.sustainTime + props.releaseTime), sub(props.sustainLevel, mul(div(sub(phase, props.attackTime + props.decayTime + props.sustainTime), props.releaseTime), props.sustainLevel)), 0);
  } else {
    bufferData = env(1024, { type: props.shape, alpha: props.alpha });

    sustainCondition = props.triggerRelease ? shouldSustain : lt(phase, props.attackTime + props.decayTime + props.sustainTime);

    releaseAccum = props.triggerRelease ? gtp(sub(props.sustainLevel, accum(props.sustainLevel / props.releaseTime, 0, { shouldWrap: false })), 0) : sub(props.sustainLevel, mul(div(sub(phase, props.attackTime + props.decayTime + props.sustainTime), props.releaseTime), props.sustainLevel)), releaseCondition = props.triggerRelease ? not(shouldSustain) : lt(phase, props.attackTime + props.decayTime + props.sustainTime + props.releaseTime);

    out = ifelse(
    // attack
    lt(phase, props.attackTime), peek(bufferData, div(phase, props.attackTime), { boundmode: 'clamp' }),

    // decay
    lt(phase, props.attackTime + props.decayTime), peek(bufferData, sub(1, mul(div(sub(phase, props.attackTime), props.decayTime), 1 - props.sustainLevel)), { boundmode: 'clamp' }),

    // sustain
    sustainCondition, peek(bufferData, props.sustainLevel),

    // release
    releaseCondition, //lt( phase, props.attackTime + props.decayTime + props.sustainTime + props.releaseTime ),
    peek(bufferData, releaseAccum,
    //sub( props.sustainLevel, mul( div( sub( phase, props.attackTime + props.decayTime + props.sustainTime), props.releaseTime ), props.sustainLevel ) ),
    { boundmode: 'clamp' }), 0);
  }

  out.trigger = function () {
    shouldSustain.value = 1;
    envTrigger.trigger();
  };

  out.release = function () {
    shouldSustain.value = 0;
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    gen.memory.heap[releaseAccum.inputs[0].inputs[1].memory.value.idx] = 0;
  };

  return out;
};