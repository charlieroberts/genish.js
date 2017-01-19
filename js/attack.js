'use strict'

/**
 * Attack
 * FIXME: write documentation
 *
 * @name attack
 * @function
 * @param {ugen} [attackTime = 44100] - The time (in samples) to fade 1 by 60 dB.
 * @see t60
 * @memberof module:envelope
 */

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    mul     = require( './mul.js' ),
    sub     = require( './sub.js' )

module.exports = ( decayTime = 44100 ) => {
  let ssd = history ( 1 ),
      t60 = Math.exp( -6.907755278921 / decayTime )

  ssd.in( mul( ssd.out, t60 ) )

  ssd.out.trigger = ()=> {
    ssd.value = 1
  }

  return sub( 1, ssd.out )
}
