'use strict'

let gen  = require( './gen.js' ),
    accum= require( './phasor.js' ),
    data = require( './data.js' ),
    peek = require( './peek.js' ),
    mul  = require( './mul.js' ),
    phasor=require( './phasor.js')

let proto = {
  basename:'cycle',
  table:null,

  gen() {
    let inputs = gen.getInputs( this ), out
    
    out = peek( proto.table, phasor( inputs[0] ) ).gen()
    
    gen.memo[ this.name ] = out[0]
    
    return out
  },

  initTable() {
    this.table = data( 1024 )

    for( let i = 0, l = this.table.length; i < l; i++ ) {
      this.table[ i ] = Math.sin( ( i / l ) * ( Math.PI * 2 ) )
    }
  }

}

module.exports = ( frequency=1, reset=0 ) => {
  let ugen = Object.create( proto )

  if( proto.table === null ) proto.initTable() 

  Object.assign( ugen, { 
    frequency,
    reset,
    table:      proto.table,
    uid:        gen.getUID(),
    inputs:     [ frequency, reset ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
