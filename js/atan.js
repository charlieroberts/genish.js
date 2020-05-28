'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'atan',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet ? '' : 'gen.'

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'atan': isWorklet ? 'Math.atan' : Math.atan })

      out = `${ref}atan( ${inputs[0]} )` 

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
  atan.name = `${atan.basename}{atan.id}`

  return atan
}
