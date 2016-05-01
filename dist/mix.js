'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'mix',

  gen: function gen() {
    _gen.memo[this.name] = add(this.inputs[0], mul(sub(this.inputs[1], this.inputs[0]), this.inputs[2])).gen();

    return _gen.memo[this.name];
  }
};

module.exports = function (in1, in2) {
  var t = arguments.length <= 2 || arguments[2] === undefined ? .5 : arguments[2];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2, t]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};