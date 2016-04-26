'use strict';

var _gen = require('./gen.js'),
    mul = require('./mul.js');

var proto = {
  basename: 'peek',

  gen: function gen() {
    var genName = 'gen.' + this.name,
        inputs = _gen.getInputs(this),
        out = void 0,
        functionBody = void 0;

    functionBody = '   \n  let ' + this.name + '_data = gen.data.' + this.dataName + ',\n      ' + this.name + '_phase = ' + (this.mode === 0 ? inputs[0] : inputs[0] + ' * gen.data.' + this.dataName + '.length') + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n      ' + this.name + '_frac = ' + this.name + '_phase - ' + this.name + '_index,\n      ' + this.name + '_base =  ' + this.name + '_data[ ' + this.name + '_index ],\n      ' + this.name + '_out  = ' + this.name + '_base + ' + this.name + '_frac * ( ' + this.name + '_data[ (' + this.name + '_index+1) & (' + this.name + '_data.length - 1) ] - ' + this.name + '_base ) \n\n      //console.log( ' + this.name + '_index, ' + this.name + '_data.length - 1, ' + this.name + '_out )\n';
    return [this.name + '_out', functionBody];
  }
};

module.exports = function (dataName, index) {
  var channels = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
  var mode = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    dataName: dataName,
    channels: channels,
    mode: mode,
    uid: _gen.getUID(),
    inputs: [index],
    properties: null
  });

  ugen.name = ugen.basename + ugen.uid;

  return ugen;
};