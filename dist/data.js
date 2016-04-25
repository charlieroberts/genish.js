'use strict';

var gen = require('./gen.js');

var proto = {
  basename: 'data',

  gen: function gen() {
    var genName = 'gen.data.' + this.name;

    return genName;
  }
};

module.exports = function (username) {
  var dim = arguments.length <= 1 || arguments[1] === undefined ? 512 : arguments[1];
  var channels = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var ugen = new Float32Array(512); // Object.create( proto )

  Object.assign(ugen, {
    username: username,
    dim: dim,
    channels: channels,
    inputs: null,
    properties: null,
    gen: proto.gen
  });

  ugen.name = username;

  gen.data[ugen.name] = ugen;

  return ugen;
};