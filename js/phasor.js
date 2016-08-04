'use strict'

let gen  = require( './gen.js' ),
    accum= require( './accum.js' ),
    mul  = require( './mul.js' ),
    proto = { basename:'phasor' }

module.exports = ( frequency=1, reset=0, props ) => {
  let ugen = typeof frequency === 'number' ? accum( frequency / gen.samplerate, reset, props ) :  accum( mul( frequency, 1/gen.samplerate ), reset, props )

  ugen.name = proto.basename + gen.getUID()

  return ugen
}
