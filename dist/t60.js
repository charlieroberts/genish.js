'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 't60',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.exp));

      out = 'gen.exp( -6.907755278921 / ' + inputs[0] + ' )';
    } else {
      out = Math.exp(-6.907755278921 / inputs[0]);
    }

    return out;
  }
};

module.exports = function (x) {
  var t60 = Object.create(proto);

  t60.inputs = [x];

  return t60;
};