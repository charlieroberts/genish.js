'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'abs',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    gen.variableNames.add( [this.id,'f'] )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.abs })

      out = [ this.id, `  ${this.id} = abs( ${inputs[0]} );\n` ]

    } else {
      out = Math.abs( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let abs = Object.create( proto )

  abs.inputs = [ x ]
  abs.id = abs.name + gen.getUID()

  return abs
}
