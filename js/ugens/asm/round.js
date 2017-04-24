'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'round',

  gen() {
    let out,
        inputs = gen.getInputs( this )


    if( isNaN( inputs[0] ) ) {
      gen.variableNames.add( [this.name, 'f'] )
      out = [ this.name, `${this.name} = fround( round( ${inputs[0]} ) )\n`]

    } else {
      out = Math.round( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let round = Object.create( proto )
  round.name = round.basename + gen.getUID()

  round.inputs = [ x ]

  return round
}
