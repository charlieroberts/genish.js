'use strict'

/**
 * A phasor accumulates phase, as determined by its frequency, and wraps between
 * 0 and 1. This creates a sawtooth wave, but with a dc offset of 1 (no negative
 * numbers). If a range of {-1,1} is needed you can use an `accum()` object with
 * the increment `1/gen.samplerate * frequency` and the desired min/max
 * properties.
 *
 * @name phasor
 * @function
 * @param {ugen|number} [frequency = 1]
 * @param {ugen|number} [reset = 0]
 * @param {Object} [props = { max: 1, min: -1 }]
 * @return ugen
 * @memberof module:waveform
 */

let gen  = require( './gen.js' ),
    accum= require( './accum.js' ),
    mul  = require( './mul.js' ),
    proto = { basename:'phasor' }

module.exports = ( frequency=1, reset=0, props ) => {
  if( props === undefined ) props = { min: -1 }

  let range = (props.max || 1 ) - props.min

  let ugen = typeof frequency === 'number' ? accum( (frequency * range) / gen.samplerate, reset, props ) :  accum( mul( frequency, 1/gen.samplerate/(1/range) ), reset, props )

  ugen.name = proto.basename + gen.getUID()

  return ugen
}
