'use strict';

var _gen = require('./gen.js');

var proto = {
  gen: function gen() {
    _gen.requestMemory(this.memory);

    var out = '  let ' + this.name + ' = memory[' + this.memory.value.idx + ']\n  if( ' + this.name + ' === 1 ) memory[' + this.memory.value.idx + '] = 0      \n      \n';
    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function () {
  var max = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var min = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var ugen = Object.create(proto);
  ugen.name = 'bang' + _gen.getUID();
  ugen.min = min;
  ugen.max = max;

  ugen.trigger = function () {
    _gen.memory.heap[ugen.memory.value.idx] = max;
  };

  ugen.memory = {
    value: { length: 1, idx: null }
  };

  return ugen;
};