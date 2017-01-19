'use strict'

/**
 * Mix two signals `a` and `b`
 * FIXME: Write documentation
 *
 * @name mix
 * @function
 * @param {(ugen|number)} a
 * @param {(ugen|number)} b
 * @param {(ugen|number)} [t = 0.5]
 * @return {ugen}
 * FIXME: @moduleof ??
 */

let gen = require('./gen.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    memo= require('./memo.js')

module.exports = ( in1, in2, t=.5 ) => {
  let ugen = memo( add( mul(in1, sub(1,t ) ), mul( in2, t ) ) )
  ugen.name = 'mix' + gen.getUID()

  return ugen
}
