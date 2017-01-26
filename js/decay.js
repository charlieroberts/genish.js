'use strict'

/**
 * Decay
 * FIXME: add documentation
 *
 * __Category:__ envelope
 * @name decay
 * @function
 * @param {(ugen|number)} [decayType = 44100]
 * @param {Object} [props = { initValue: 1}]
 * @return {ugen}
 */

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    mul     = require( './mul.js' ),
    t60     = require( './t60.js' )

module.exports = ( decayTime = 44100, props ) => {
  let properties = Object.assign({}, { initValue:1 }, props ),
      ssd = history ( properties.initValue )

  ssd.in( mul( ssd.out, t60( decayTime ) ) )

  ssd.out.trigger = ()=> {
    ssd.value = 1
  }

  return ssd.out
}
