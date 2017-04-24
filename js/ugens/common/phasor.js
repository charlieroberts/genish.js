'use strict'

const gen   = require( './gen.js' ),
      accum = require( '../target/accum.js' ), 
      mul   = require( '../target/mul.js' ), 
      proto = { basename:'phasor' }

module.exports = ( frequency=1, reset=0, props ) => {
  if( props === undefined ) props = { min: -1, initialValue:-1 }

  const range = (props.max || 1 ) - props.min

  const ugen = typeof frequency === 'number' ? accum( (frequency * range) / gen.samplerate, reset, props ) :  accum( mul( frequency, 1/gen.samplerate/(1/range) ), reset, props )

  ugen.name = proto.basename + gen.getUID()

  return ugen
}
