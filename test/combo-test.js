import {
  accum, add, setupMemory
} from '../src/main.js'

import gen from '../src/gen.js'
import assert from 'assert'

// account for floating point errors
const decimate = ( value, amount ) => Math.floor( value * amount ) / amount

const makeMemory = function( memoryAmount = 50 ) {
  const mem = new WebAssembly.Memory({ 
    initial:memoryAmount, maximum:memoryAmount, shared:true 
  })

  setupMemory( mem.buffer )

  return mem
}

gen.init().then( ()=> {

  describe( 'in combo tests', ()=> {
    it( 'adding two accums with an incr of .1 should yield .2 on sample #2', async ()=> {
      let answer = .3,
          graph  = add( accum(.1), accum(.2) ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )

      wasm.render()
      const result = decimate( wasm.render(), 1000 )

      assert.equal( result, answer )
    })

  })

})