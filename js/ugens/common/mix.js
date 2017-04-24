'use strict'

let gen = require('./gen.js'),
    add = require('../target/add.js'),
    mul = require('../target/mul.js'),
    sub = require('../target/sub.js'),
    memo= require('../target/memo.js')

module.exports = ( in1, in2, t=.5 ) => {
  let ugen = add( mul(in1, sub(1,t ) ), mul( in2, t ) )
  ugen.name = 'mix' + gen.getUID()

  return ugen
}
