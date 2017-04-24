'use strict'

const gen     = require( './gen.js' ),
      windows = require( '../../windows.js' ),
      data    = require( './data.js' ), 
      peek    = require( '../target/peek.js' ),
      phasor  = require( './phasor.js' )

module.exports = ( type='triangular', length=1024, alpha=.15, shift=0 ) => {
  const buffer = new Float32Array( length )

  const name = type + '_' + length + '_' + shift
  if( typeof gen.globals.windows[ name ] === 'undefined' ) { 

    for( let i = 0; i < length; i++ ) {
      buffer[ i ] = windows[ type ]( length, i, alpha, shift )
    }

    gen.globals.windows[ name ] = data( buffer )
  }

  const ugen = gen.globals.windows[ name ] 
  ugen.name = 'env' + gen.getUID()

  return ugen
}
