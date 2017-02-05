'use strict'

let gen     = require( './gen' ),
    windows = require( './windows' ),
    data    = require( './data' ),
    peek    = require( './peek' ),
    phasor  = require( './phasor' )

module.exports = ( type='triangular', length=1024, alpha=.15, shift=0 ) => {
  let buffer = new Float32Array( length )

  let name = type + '_' + length + '_' + shift
  if( typeof gen.globals.windows[ name ] === 'undefined' ) { 

    for( let i = 0; i < length; i++ ) {
      buffer[ i ] = windows[ type ]( length, i, alpha, shift )
    }

    gen.globals.windows[ name ] = data( buffer )
  }

  let ugen = gen.globals.windows[ name ] 
  ugen.name = 'env' + gen.getUID()

  return ugen
}
