'use strict'

let gen     = require( './gen.js' )

let proto = {
  basename:'sah2',

  gen() {
    let inputs = gen.getInputs( this ), out

    gen.data[ this.name ] = 0
    gen.data[ this.name + '_control' ] = 0

    out = 
` var ${this.name} = gen.data.${this.name}_control,
      ${this.name}_trigger = ${inputs[1]} === 1

  if( ${this.name}_trigger !== ${this.name} ) {
    if( ${this.name}_trigger === 1 ) {
      gen.data.${this.name} = ${inputs[0]}
    }
    gen.data.${this.name}_control = ${this.name}_trigger
  }
`
    
    gen.memo[ this.name ] = `gen.data.${this.name}`

    return [ `gen.data.${this.name}`, ' ' +out ]
  }
}

module.exports = ( in1, control, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { init:0 }

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    lastSample: 0,
    uid:        gen.getUID(),
    inputs:     [ in1, control ],
  },
  defaults )
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
