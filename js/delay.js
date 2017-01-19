'use strict'
/**
 * Creates a delay line that delays an input signal by an argument number of
 * samples.
 *
 * #### Properties
 * - `size` *number* (default 512) determines the length of the delay line.
 * - `interp` *interp* (default 'linear') Set the interpolation used to access non-integer indices in the delay line. Currently can be 'linear' or 'none'.
 *
 * @name delay
 * @function
 * @param {(ugen|number)} in - The signal to be delayed.
 * @param {Number} delayTime - The amount of time to delay the incoming signal.
 * @param {Object} properties - A dictionary of properties to assign to the ugen; see below.
 * @memberof module:feedback
 */

let gen  = require( './gen.js'  ),
    data = require( './data.js' ),
    poke = require( './poke.js' ),
    peek = require( './peek.js' ),
    sub  = require( './sub.js'  ),
    wrap = require( './wrap.js' ),
    accum= require( './accum.js')

let proto = {
  basename:'delay',

  gen() {
    let inputs = gen.getInputs( this )

    gen.memo[ this.name ] = inputs[0]

    return inputs[0]
  },
}

module.exports = ( in1, time=256, ...tapsAndProperties ) => {
  let ugen = Object.create( proto ),
      defaults = { size: 512, feedback:0, interp:'linear' },
      writeIdx, readIdx, delaydata, properties, tapTimes = [ time ], taps

  if( Array.isArray( tapsAndProperties ) ) {
    properties = tapsAndProperties[ tapsAndProperties.length - 1 ]
    if( tapsAndProperties.length > 1 ) {
      for( let i = 0; i < tapsAndProperties.length - 1; i++ ){
        tapTimes.push( tapsAndProperties[ i ] )
      }
    }
  }

  if( properties !== undefined ) Object.assign( defaults, properties )

  if( defaults.size < time ) defaults.size = time

  delaydata = data( defaults.size )

  ugen.inputs = []

  writeIdx = accum( 1, 0, { max:defaults.size })

  for( let i = 0; i < tapTimes.length; i++ ) {
    ugen.inputs[ i ] = peek( delaydata, wrap( sub( writeIdx, tapTimes[i] ), 0, defaults.size ),{ mode:'samples', interp:defaults.interp })
  }

  ugen.outputs = ugen.inputs // ugn, Ugh, UGH! but i guess it works.

  poke( delaydata, in1, writeIdx )

  ugen.name = `${ugen.basename}${gen.getUID()}`

  return ugen
}
