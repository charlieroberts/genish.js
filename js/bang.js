'use strict'

let gen = require('./gen.js')

let proto = {
  gen() {
    gen.requestMemory( this.memory )
    
    let out = 
`  let ${this.name} = memory[${this.memory.value.idx}]
  if( ${this.name} === 1 ) memory[${this.memory.value.idx}] = 0      
      
`
    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  } 
}

module.exports = ( max = 1, min = 0 ) => {
  let ugen = Object.create( proto )
  ugen.name = 'bang' + gen.getUID()
  ugen.min = min
  ugen.max = max

  ugen.trigger = () => {
    gen.memory.heap[ ugen.memory.value.idx ] = max 
  }

  ugen.memory = {
    value: { length:1, idx:null }
  }

  return ugen
}
