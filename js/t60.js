'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'t60',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ 'exp' ]: Math.exp })

      out = `gen.exp( -6.907755278921 / ${inputs[0]} )`

    } else {
      out = Math.exp( -6.907755278921 / inputs[0] )
    }
    
    return out
  }
}

module.exports = x => {
  let t60 = Object.create( proto )

  t60.inputs = [ x ]

  return t60
}
