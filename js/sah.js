'use strict'

let gen     = require( './gen.js' )

let proto = {
  basename:'sah',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = `  if( ${inputs[1]} > 0 )  gen.data.${this.name} = ${inputs[0]}\n`
    
    gen.memo[ this.name ] = `gen.data.${this.name}`

    return [ `gen.data.${this.name}`, out ]
  }
}

module.exports = ( in1, control ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    lastSample: 0,
    uid:        gen.getUID(),
    inputs:     [ in1, control ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  gen.data[ ugen.name ] = 0

  return ugen
}
