'use strict'

/**
 * `slide` is a logarithmically scaled low-pass filter to smooth discontinuities
 * between values. It is especially useful to make continuous transitions from
 * discrete events; for example, sliding from one note frequency to the next.
 * The second argument to `slide` determines the length, in samples, of
 * transitions.
 * FIXME: @example
 *
 * @name slide
 * @function
 * @param {ugen} signal
 * @param {integer} length - Length of slide in samples.
 * @return {ugen}
 * @memberof module:filter
 */

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' ),
    gt      = require( './gt.js' ),
    div     = require( './div.js' ),
    _switch = require( './switch.js' )

module.exports = ( in1, slideUp = 1, slideDown = 1 ) => {
  let y1 = history(0),
      filter, slideAmount

  //y (n) = y (n-1) + ((x (n) - y (n-1))/slide)
  slideAmount = _switch( gt(in1,y1.out), slideUp, slideDown )

  filter = memo( add( y1.out, div( sub( in1, y1.out ), slideAmount ) ) )

  y1.in( filter )

  return filter
}
