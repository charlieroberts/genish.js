'use strict';

var _gen = require('./gen.js'),
    accum = require('./phasor.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js'),
    phasor = require('./phasor.js');

var proto = {
  basename: 'cycle',
  table: null,

  gen: function gen() {
    var inputs = _gen.getInputs(this);

    return peek('sinTable', phasor(inputs[0]), 1, 1).gen();
  },
  initTable: function initTable() {
    this.table = data('sinTable', 1024);

    for (var i = 0, l = this.table.length; i < l; i++) {
      this.table[i] = Math.sin(i / l * (Math.PI * 2));
    }
  }
};

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var ugen = Object.create(proto);

  if (proto.table === null) proto.initTable();

  Object.assign(ugen, {
    frequency: frequency,
    reset: reset,
    table: proto.table,
    uid: _gen.getUID(),
    inputs: [frequency, reset],
    properties: ['frequency', 'reset']
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

//let table = function( frequency ) {
//  if( ! (this instanceof table) ) return new table( frequency )

//  let tableSize = 1024

//  Object.assign( this, {
//    frequency,
//    uid: gen.getUID(),
//    phase:0,
//    tableFreq: 44100 / 1024,
//    table: new Float32Array( tableSize ),
//    codegen: gen.codegen,

//    sample() {
//      let index, frac, base

//      this.phase += this.frequency / this.tableFreq
//      while( this.phase >= 1024 ) this.phase -= 1024

//      index   = this.phase | 0
//      frac    = this.phase - index
//      base    = this.table[ index ]

//      return base + ( frac * ( this.table[ (index+1) & 1023 ] - base ) ) * 1
//    },

//    initTable() {
//      for( let i = 0; i < this.table.length; i++ ) {
//        this.table[ i ] = Math.sin( ( i / this.tableSize ) * ( Math.PI * 2 ) )
//      }
//    }

//  })

//  this.initTable()
//}