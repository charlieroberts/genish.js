'use strict'

let gen  = require('./gen.js'),
    mul  = require('./mul.js'),
    wrap = require('./wrap.js')

let proto = {
  basename:'poke',

  gen() {
    let dataName = 'gen.data.' + this.dataName,
        inputs = gen.getInputs( this ),
        idx, out

    idx = wrap( inputs[1], 0, this.dataLength ).gen()
    gen.functionBody += `  ${dataName}[${idx}] = ${inputs[0]}\n\n`
  }
}
module.exports = ( data, value, index, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { channels:1 } 

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    data,
    dataName:   data.name,
    dataLength: data.length,
    uid:        gen.getUID(),
    inputs:     [ value, index ],
  },
  defaults )
  
  ugen.name = ugen.basename + ugen.uid

  return ugen
}
