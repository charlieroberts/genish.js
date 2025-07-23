import {
  noise
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
  describe( 'noise', ()=>{
    it( 'should return different values', async () => {
      const mem      = makeMemory(),
            expected = 0,
            graph    = noise(3),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem ),
            sample1  = decimate( wasm.render( graph.idx * 4 ), 1000 ),
            sample2  = decimate( wasm.render( graph.idx * 4 ), 1000 ),
            sample3  = decimate( wasm.render( graph.idx * 4 ), 1000 ),
            sample4  = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.notStrictEqual( sample1, sample2 )    
    })
  })
})
