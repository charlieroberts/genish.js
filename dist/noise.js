'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'noise',

  gen: function gen() {
    var out = void 0;

    _gen.closures.add({ 'noise': Math.random });

    out = 'gen.noise()';

    return out;
  }
};

module.exports = function (x) {
  var noise = Object.create(proto);

  return noise;
};