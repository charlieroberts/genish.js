'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'accum',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this);

    _gen.closures.add(_defineProperty({}, this.name, this.boundCallback));

    code = this.name + '( ' + inputs[0] + ',' + inputs[1] + ' )';

    return code;
  }
};

module.exports = function (incr) {
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var min = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
  var max = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    value: 0,
    basename: 'accum',
    uid: _gen.getUID(),
    inputs: [incr, reset],

    callback: function callback(_incr, _reset) {

      this.value += _incr;

      if (_reset >= 1) {
        this.value = this.min;
      } else {
        if (this.value > this.max) this.value = this.min;
      }

      return this.value;
    }
  });

  ugen.name = '' + ugen.basename + ugen.uid;
  ugen.boundCallback = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return ugen.callback.apply(ugen, args);
  };

  return ugen;
};