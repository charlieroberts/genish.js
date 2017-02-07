'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'atan',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    gen.variableNames.add( [this.name, 'f'] )
    
    if( isNaN( inputs[0] ) ) {

      out = [ this.name, `  ${this.name} = fround( atan( ${inputs[0]} ) );\n` ] 

    } else {
      out = Math.atan( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let atan = Object.create( proto )

  atan.inputs = [ x ]
  atan.id = gen.getUID()
  atan.name = `${atan.basename}${atan.id}`

  return atan
}
