import {
  phasor, setupMemory
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
  describe( 'a phasor', ()=>{
    it( 'should return 0 on first execution with any frequency (110 Hz here)', async () => {
      const mem      = makeMemory(),
            expected = 0,
            graph    = phasor( 110 ),
            func     = gen.function( graph ),
            wat      = gen.module( func, true ),
            wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

    // it( 'should return 1 with a frequency of 11025 after 5 samples', async () => {
    //   const mem      = makeMemory(),
    //         expected = 1
    //         graph    = phasor( 11025 ),
    //         func     = gen.function( graph ),
    //         wat      = gen.module( func ),
    //         wasm     = await gen.assemble( wat, mem ),
    //         sample1  = decimate( wasm.render( graph.idx * 4 ), 1000 ),
    //         sample2  = decimate( wasm.render( graph.idx * 4 ), 1000 ),
    //         sample3  = decimate( wasm.render( graph.idx * 4 ), 1000 ),
    //         sample4  = decimate( wasm.render( graph.idx * 4 ), 1000 ),
    //         actual   = decimate( wasm.render( graph.idx * 4 ), 1000 )

    //   console.log( sample1, sample2, sample3, sample4, actual )
    //   assert.strictEqual( actual, expected )    
    // })
  })
})