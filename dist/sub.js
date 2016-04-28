'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var sub = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          diff = 0,
          numCount = 0,
          subAtEnd = false;

      inputs.forEach(function (v, i) {
        if (isNaN(v)) {
          out += v;
          if (i < inputs.length - 1) {
            subAtEnd = true;
            out += ' - ';
          }
        } else {
          diff += parseFloat(v);
          numCount++;
        }
      });

      if (numCount > 0) {
        out += subAtEnd ? diff : ' - ' + diff;
      }

      out += ')';

      return out;
    }
  };

  return sub;
};