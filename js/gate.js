'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'gate',

  gen() {
    let inputs = gen.getInputs( this ), out
    
    gen.requestMemory( this.memory )
    let data = 'memory[ ' + this.memory.lastInput.idx + ' ]'
    
    /* 
     * we check to see if the current control inputs equals our last input
     * if so, we store the signal input in the memory associated with the currently
     * selected index. If not, we put 0 in the memory associated with the last selected index,
     * change the selected index, and then store the signal in put in the memery assoicated
     * with the newly selected index
     */
    
    out =

` let ${this.name}_index = ${inputs[1]}
  if( ${this.name}_index != ${data} ) {
    memory[ ${data} + ${this.memory.lastInput.idx + 1}  ] = 0 
    ${data} = ${inputs[1]}
  }
  memory[ ${this.memory.lastInput.idx + 1 } + ${inputs[1]} ] = ${inputs[0]} 

`

    gen.memo[ this.name ] = `${this.name}`

    return [ ``, ' ' + out ]
  },

  childgen() {
    if( gen.memo[ this.parent.name ] === undefined ) {
      gen.getInputs( this )
    }
    
    if( gen.memo[ this.name ] === undefined ) {
      console.log( 'GATE OUT: ', this.name, ' REQUESTING MEMORY' )
      gen.requestMemory( this.memory )

      gen.memo[ this.name ] = `memory[ ${this.memory.value.idx} ]`
    }

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
  
  ugen.name = `${ugen.basename}${gen.getUID()}`

  for( let i = 0; i < ugen.count; i++ ) {
    ugen.outputs.push({
      index:i,
      gen: proto.childgen,
      parent:ugen,
      inputs: [ ugen ],
      memory: {
        value: { length:1, idx:null }
      },
      name: `${ugen.name}_out${gen.getUID()}`
    })
  }

  return ugen
}
