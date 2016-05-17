'use strict';

var _gen = require('./gen.js'),
    data = require('./data.js'),
    poke = require('./poke.js'),
    wrap = require('./wrap.js'),
    accum = require('./accum.js');

var proto = {
  basename: 'delay',

  gen: function gen() {
    var inputs = _gen.getInputs(this);

    _gen.memo[this.name] = inputs[0];

    return inputs[0];
  }
};

module.exports = function (in1) {
  var time = arguments.length <= 1 || arguments[1] === undefined ? 256 : arguments[1];
  var properties = arguments[2];

  var ugen = Object.create(proto),
      defaults = { size: 512, feedback: 0, interp: 'linear' },
      writeIdx = void 0,
      readIdx = void 0,
      delaydata = void 0;

  if (properties !== undefined) Object.assign(defaults, properties);

  delaydata = data(defaults.size);

  writeIdx = accum(1, 0, { max: defaults.size }); // initialValue:Math.floor(this.time) })
  readIdx = wrap(sub(writeIdx, time), 0, defaults.size);

  ugen.inputs = [peek(delaydata, readIdx, { mode: 'samples', interp: defaults.interp })];

  ugen.output = poke(delaydata, in1, writeIdx);

  ugen.name = '' + ugen.basename + _gen.getUID();

  return ugen;
};