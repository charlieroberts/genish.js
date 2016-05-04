'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sah',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = '  if( ' + inputs[1] + ' > 0 )  gen.data.' + this.name + ' = ' + inputs[0] + '\n';

    _gen.memo[this.name] = 'gen.data.' + this.name;

    return ['gen.data.' + this.name, out];
  }
};

module.exports = function (in1, control) {
  var ugen = Object.create(proto);

  Object.assign(ugen, {
    lastSample: 0,
    uid: _gen.getUID(),
    inputs: [in1, control]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  _gen.data[ugen.name] = 0;

  return ugen;
};