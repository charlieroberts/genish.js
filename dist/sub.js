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
          out = 0,
          diff = 0,
          needsParens = false,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          subAtEnd = false,
          hasUgens = false,
          returnValue = 0;

      this.inputs.forEach(function (value) {
        if (isNaN(value)) hasUgens = true;
      });

      if (hasUgens) {
        // store in variable for future reference
        out = '  let ' + this.name + ' = (';
      } else {
        out = '(';
      }

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber - v;
          out += lastNumber;
          return;
        } else {
          needsParens = true;
          out += lastNumber + ' - ' + v;
        }

        if (!isFinalIdx) out += ' - ';
      });

      if (needsParens) {
        out += ')';
      } else {
        out = out.slice(1); // remove opening paren
      }

      if (hasUgens) out += '\n';

      returnValue = hasUgens ? [this.name, out] : out;

      //if( hasUgens ) gen.memo[ this.name ] = this.name

      return returnValue;
    }
  };

  sub.name = 'sub' + sub.id;

  return sub;
};