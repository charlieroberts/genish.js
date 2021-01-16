'use strict'

const gen   = require( './gen.js' ),
      accum = require( './accum.js' ),
      mul   = require( './mul.js' ),
      proto = { basename:'phasorN' },
      div   = require( './div.js' )

const defaults = { min: 0, max: 1 }

module.exports = ( frequency = 1, reset = 0, _props ) => {
  const props = Object.assign( {}, defaults, _props )

  const range = props.max - props.min

  const ugen = typeof frequency === 'number' 
    ? accum( (frequency * range) / gen.samplerate, reset, props ) 
    : accum( 
        div( 
          mul( frequency, range ),
          gen.samplerate
        ), 
        reset, props 
    )

  ugen.name = proto.basename + gen.getUID()

  return ugen
}
