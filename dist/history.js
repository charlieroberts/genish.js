'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  var ugen = {
    inputs: [0],

    record: function record(v) {
      var obj = {
        gen: function gen() {
          var inputs = _gen.getInputs(ugen);

          _gen.addToEndBlock('gen.data.' + ugen.name + ' = ' + inputs[0]);

          return inputs[0];
        }
      };

      this.inputs[0] = v;

      return obj;
    },
    gen: function gen() {
      return 'gen.data.' + ugen.name;
    },


    uid: _gen.getUID()
  };

  ugen.name = 'history' + ugen.uid;

  _gen.data[ugen.name] = 0;

  return ugen;
};