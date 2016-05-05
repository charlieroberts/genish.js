'use strict';

var _gen = require('./gen.js'),
    data = require('./data.js'),
    poke = require('./poke.js'),
    wrap = require('./wrap.js'),
    accum = require('./accum.js');

var proto = {
  basename: 'delay',

  gen: function gen() {
    var code = void 0,
        out = void 0,
        acc = void 0,
        writeIdx = void 0,
        readIdx = void 0;

    writeIdx = accum(1, 0, { max: this.size }); // initialValue:Math.floor(this.time) })
    readIdx = wrap(sub(writeIdx, this.inputs[1]), 0, this.size);

    poke(this.buffer, this.inputs[0], writeIdx).gen();

    out = peek(this.buffer, readIdx, { mode: 'samples', interp: this.interp }).gen();

    _gen.memo[this.name] = out;

    return out;
  }
};

module.exports = function (in1) {
  var time = arguments.length <= 1 || arguments[1] === undefined ? 256 : arguments[1];
  var properties = arguments[2];

  var ugen = Object.create(proto),
      defaults = { size: 512, feedback: 0, interp: 'linear' };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    time: time,
    buffer: data(defaults.size),
    uid: _gen.getUID(),
    inputs: [in1, time]
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};