"use strict";

var _gen = require('./gen.js');

module.exports = function (x, y) {
  var add = {
    id: _gen.getUID(),
    inputs: [x, y],

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = void 0;
      console.log("ADDDDDD", inputs);
      if (isNaN(inputs[0]) || isNaN(inputs[1])) {
        _gen.functionBody += inputs[0] + " + " + inputs[1];
      } else {
        _gen.functionBody += parseFloat(inputs[0]) + parseFloat(inputs[1]);
      }

      return out;
    }
  };

  return add;
};