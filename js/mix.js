'use strict'

/**
 * Mix two signals `a` and `b`
 *
 * __Category:__
 * @name mix
 * @function
 * @param {(ugen|number)} a - one signal to mix
 * @param {(ugen|number)} b - other signal to mix
 * @param {(ugen|number)} [t = 0.5] the relative amount between both
 * @return {ugen}
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
