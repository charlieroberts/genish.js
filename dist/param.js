'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'p',

  gen: function gen() {
    if (_gen.memo[this.name]) return _gen.memo[this.name];

    _gen.parameters.push(this.name);

    _gen.memo[this.name] = this.name;

    return this.name;
  }
};

module.exports = function () {
  var param = Object.create(proto);

  param.id = _gen.getUID();
  param.name = '' + param.basename + param.id;

  return param;
};