let gen  = require('./gen.js')

let proto = {
  name:'abs',

  closures : { 
    abs : Math.abs 
  },

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    if( isNaN( inputs[0] ) ) {
      for ( let key in this.closures ) {
        gen.closures.add({ [key]:this.closures[key] })
      }

      out = `abs( ${inputs[0]} )`

    } else {
      out = Math.abs( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let abs = Object.create( proto )

  abs.inputs = [ x ]

  return abs
}
