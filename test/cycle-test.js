import {
  cycle, accum, peek
} from '../src/main.js'

import utilities from '../src/utilities.js'
import gen from '../src/gen.js'
import assert from 'assert'

// account for floating point errors
// CAREFUL on really low frequencies you neeed to use
// enough resolution
const decimate = ( value, amount ) => Math.floor( value * amount ) / amount

const makeMemory = function( memoryAmount = 50 ) {
  utilities.resetMemory()

  const mem = new WebAssembly.Memory({ 
    initial:memoryAmount, maximum:memoryAmount, shared:true
  })

  utilities.setupMemory( mem.buffer )
  utilities.createWavetables()

  return mem
}

gen.init().then( ()=> {
  describe( 'a cycle', ()=>{
     it( 'should return 0 on first execution with any frequency (110 Hz here)', async () => {
       const mem      = makeMemory(),
             expected = 0,
             graph    = cycle( 110 ),
             func     = gen.function( graph ),
             wat      = gen.module( func ),
             wasm     = await gen.assemble( wat, mem ),
             actual   = decimate( wasm.render( graph.idx * 4 ), 1000 )

       assert.strictEqual( actual, expected )    
     })

    it( 'should increase over first two samples', async () => {
      const mem      = makeMemory(),
            graph    = cycle( 1 ),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem ),
            sample1  = decimate( wasm.render( graph.idx * 4 ), 100000 ),
            sample2  = decimate( wasm.render( graph.idx * 4 ), 100000 )

      //console.log( sample1, sample2, sample2 > sample1 )
      assert( sample2 > sample1 )
    })
  })
})
