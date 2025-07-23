import {
  accum, add
} from '../src/main.js'

import utilities from '../src/utilities.js'
import gen from '../src/gen.js'
import assert from 'assert'

// account for floating point errors
const decimate = ( value, amount ) => Math.floor( value * amount ) / amount

const makeMemory = function( memoryAmount = 50 ) {
  utilities.resetMemory()

  const mem = new WebAssembly.Memory({ 
    initial:memoryAmount, maximum:memoryAmount, shared:true
  })

  utilities.setupMemory( mem.buffer )

  return mem
}

gen.init().then( ()=> {

  describe( 'in combo tests', ()=> {
    it( 'adding two accums with an incr of .1 should yield .2 on sample #2', async ()=> {
      const mem = makeMemory()
      let answer = .3,
          graph  = add( accum(.1), accum(.2) ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat, mem )

      wasm.render( graph.idx * 4 )

      const result = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.equal( result, answer )
    })

  })

})
