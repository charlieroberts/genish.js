'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'bool',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = `${inputs[0]} === 0 ? 0 : 1`
    
    //gen.memo[ this.name ] = `gen.data.${this.name}`

    //return [ `gen.data.${this.name}`, ' ' +out ]
    return out
  }
}

module.exports = ( in1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    uid:        gen.getUID(),
    inputs:     [ in1 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

