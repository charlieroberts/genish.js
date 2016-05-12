'use strict'

let gen  = require( './gen.js' ),
    accum= require( './accum.js' ),
    mul  = require( './mul.js' ),
    proto = { basename:'phasor' }

module.exports = ( frequency=1, reset=0 ) => {
  let ugen = accum( mul( frequency, 1/gen.samplerate ), reset )

  ugen.name = proto.basename + gen.getUID()

  return ugen
}
