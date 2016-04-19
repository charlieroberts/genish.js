'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'accum',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        functionBody = void 0;

    _gen.closures.add(_defineProperty({}, this.name, this));

    functionBody = this.callback.toString().split('\n');
    functionBody = functionBody.slice(1, -2);
    functionBody = functionBody.join('\n');

    this.properties.forEach(function (v, idx) {
      return functionBody = functionBody.replace(v, inputs[idx]);
    });

    functionBody = functionBody.replace(/this/gi, this.name);
    functionBody += '\n';
    // put this at end so previous properties replacement doesn't interfere

    _gen.memo[this.name] = this.name + '.value';

    return [this.name + '.value', functionBody];
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
    properties: ['_incr', '_reset'],

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

  return ugen;
};