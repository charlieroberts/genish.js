'use strict'

/**
 * Envelope
 * FIXME: Add documentation
 *
 * @name env
 * @function
 * @param {(ugen|number)} [length=11025]
 * @param {Object} [props = { type: 'Triangular', bufferLength: 1024, alpha: 0.15 }]
 * @return {ugen}
 * @memberof module:buffer
 */

let gen     = require( './gen' ),
    windows = require( './windows' ),
    data    = require( './data' ),
    peek    = require( './peek' ),
    phasor  = require( './phasor' )

module.exports = ( length = 11025, properties ) => {
  let defaults = {
        type: 'Triangular',
        bufferLength: 1024,
        alpha: .15
      },
      frequency = length / gen.samplerate,
      props = Object.assign({}, defaults, properties ),
      buffer = new Float32Array( props.bufferLength )

  if( gen.globals.windows[ props.type ] === undefined ) gen.globals.windows[ props.type ] = {}

  if( gen.globals.windows[ props.type ][ props.bufferLength ] === undefined ) {
    for( let i = 0; i < props.bufferLength; i++ ) {
      buffer[ i ] = windows[ props.type ]( props.bufferLength, i, props.alpha )
    }

    gen.globals.windows[ props.type ][ props.bufferLength ] = data( buffer )
  }

  let ugen = gen.globals.windows[ props.type ][ props.bufferLength ] //peek( gen.globals.windows[ props.type ][ props.bufferLength ], phasor( frequency, 0, { min:0 } ))
  ugen.name = 'env' + gen.getUID()

  return ugen
}
