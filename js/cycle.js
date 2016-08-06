'use strict'

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

    gen.globals.table = data( buffer )
  }

}

module.exports = ( frequency=1, reset=0 ) => {
  if( gen.globals.table === undefined ) proto.initTable() 
  
  let ugen = peek( gen.globals.table, phasor( frequency, reset, { min:0 } ))
  ugen.name = 'cycle' + gen.getUID()

  return ugen
}
