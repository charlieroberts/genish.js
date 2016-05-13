'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'gate',

  gen() {
    let inputs = gen.getInputs( this ), out, data ='gen.data.' + this.name
    
    out =

` let ${this.name}_index = ${inputs[1]}
  if( ${this.name}_index != ${data}.lastInput ) {
    ${data}.outputs[ ${data}.lastInput ] = 0
    ${data}.lastInput = ${inputs[1]}
  }
  ${data}.outputs[ ${inputs[1]} ] = ${inputs[0]} 
`

    gen.memo[ this.name ] = `gen.data.${this.name}`

    return [ `gen.data.${this.name}`, ' ' + out ]
  },

  childgen() {
    if( gen.memo[ this.parent.name ] === undefined ) {
      gen.getInputs( this )
    }
    return `gen.data.${this.parent.name}.outputs[ ${this.index} ]`
  }
}

module.exports = ( control, in1, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { count: 2 }

  if( typeof properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, {
    outputs: [],
    uid:     gen.getUID(),
    inputs:  [ in1, control ],
    memory: {
      value: { length:1, idx:null }
    }
  },
  defaults )
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  gen.data[ ugen.name ] = { outputs: [], lastInput:0 }

  for( let i = 0; i < ugen.count; i++ ) {
    ugen.outputs.push({
      index:i,
      gen: proto.childgen,
      parent:ugen,
      inputs: [ ugen ]
    })
    gen.data[ ugen.name ].outputs[ i ] = 0
  }

  return ugen
}
