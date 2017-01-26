'use strict'

/**
 * Cycle creates a sine oscillator running at a provided frequency. The
 * oscillator runs via an interpolated wavetable lookup.
 *
 * __Category:__ waveform
 * @name cycle
 * @function
 * @param {ugen|number} frequency
 * @return ugen
 */

let gen  = require( './gen.js' ),
    accum= require( './phasor.js' ),
    data = require( './data.js' ),
    peek = require( './peek.js' ),
    mul  = require( './mul.js' ),
    phasor=require( './phasor.js')

let proto = {
  basename:'cycle',

  initTable() {
    let buffer = new Float32Array( 1024 )

    for( let i = 0, l = buffer.length; i < l; i++ ) {
      buffer[ i ] = Math.sin( ( i / l ) * ( Math.PI * 2 ) )
    }

    gen.globals.cycle = data( buffer, 1, { immutable:true } )
  }

}

module.exports = ( frequency=1, reset=0 ) => {
  if( gen.globals.cycle === undefined ) proto.initTable()

  let ugen = peek( gen.globals.cycle, phasor( frequency, reset, { min:0 } ))
  ugen.name = 'cycle' + gen.getUID()

  return ugen
}
