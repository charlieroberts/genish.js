'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'sign',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.sign })

      out = `gen.sign( ${inputs[0]} )`

    } else {
      out = Math.sign( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let sign = Object.create( proto )

  sign.inputs = [ x ]

  return sign
}
