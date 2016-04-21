let gen  = require('./gen.js')

let proto = {
  basename:'accum',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        genName = 'gen.' + this.name,
        functionBody = this.callback( genName, inputs[0], inputs[1] )

    gen.closures.add({ [ this.name ]: this }) 

    gen.memo[ this.name ] = genName + '.value'
    
    return [ genName + '.value', functionBody ]
  },

  callback( _name, _incr, _reset ) {
    let out = `${_name}.value += ${_incr}

    if( ${_reset} >= 1 ) {
      ${_name}.value = ${_name}.min
    }else{
      if( ${_name}.value > ${_name}.max ) ${_name}.value = ${_name}.min
    }
    `
    
    return out
  }
}

module.exports = ( incr, reset=0, min=0, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    min, 
    max,
    value:   0,
    uid:    gen.getUID(),
    inputs: [ incr, reset ],
    properties: [ '_incr','_reset' ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
