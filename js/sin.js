let gen  = require('./gen.js')

let proto = {
  basename:'sin',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    if( isNaN( inputs[0] ) ) {
      //for ( let key in this.closures ) {
      //  gen.closures.add({ [key]:this.closures[key] })
      //}
      
      gen.closures.add({ sin: Math.sin })
      out = `sin( ${inputs[0]} )`

    } else {
      out = Math.sin( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let sin = Object.create( proto )

  sin.inputs = [ x ]
  sin.id = gen.getUID()
  sin.name = `${sin.basename}{sin.id}`

  return sin
}
