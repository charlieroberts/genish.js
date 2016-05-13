'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'gate',

  gen() {
    let inputs = gen.getInputs( this ), out
    
    gen.requestMemory( this.memory )
// ${data}.outputs[ ${data}.lastInput ] = 0    
    let data = 'memory[ ' + this.memory.lastInput.idx + ' ]'
    out =

` let ${this.name}_index = ${inputs[1]}
  if( ${this.name}_index != ${data} ) {
    memory[ ${data} ] = 0 
    ${data} = ${inputs[1]}
  }
  memory[ ${this.memory.lastInput.idx + 1 } + ${inputs[1]} ] = ${inputs[0]} 
`
  //${data}.outputs[ ${inputs[1]} ] = ${inputs[0]} 

    gen.memo[ this.name ] = `gen.data.${this.name}`

    return [ ``, ' ' + out ]
  },

  childgen() {
    //if( gen.memo[ this.parent.name ] === undefined ) {
      gen.getInputs( this )
      gen.requestMemory( this.memory )
    //}
    return `memory[ ${this.memory.value.idx} ]`
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
      lastInput: { length:1, idx:null }
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
      inputs: [ ugen ],
      memory: {
        value: { length:1, idx:null }
      }
    })
    gen.data[ ugen.name ].outputs[ i ] = 0
  }

  return ugen
}
