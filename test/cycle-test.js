import {
  cycle, setupMemory, utilities, accum, peek
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
  utilities.createWavetables()

  return mem
}

gen.init().then( ()=> {
  describe( 'a cycle', ()=>{
    // it( 'should return 0 on first execution with any frequency (110 Hz here)', async () => {
    //   const mem      = makeMemory(),
    //         expected = 0,
    //         graph    = cycle( 110 ),
    //         func     = gen.function( graph ),
    //         wat      = gen.module( func ),
    //         wasm     = await gen.assemble( wat, mem ),
    //         actual   = decimate( wasm.render( graph.idx * 4 ), 1000 )

    //   assert.strictEqual( actual, expected )    
    // })

    it( 'should increase over first two samples', async () => {
      debugger
      const mem      = makeMemory(),
            graph    = cycle( .1 ),
            // graph    = peek(
            //   utilities.sinedata,
            //   accum( .1 ),
            //   'linear',
            //   'phase'
            // ),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem ),
            sample1  = decimate( wasm.render( graph.idx * 4 ), 1000 ),
            sample2  = decimate( wasm.render( graph.idx * 4 ), 1000 )

      console.log( sample1, sample2, sample2 > sample1 )
      assert( sample2 > sample1 )
    })
  //   it( 'should return to its min value of 0 when the inputs[1] = true', ()=> {
  //     let answer = .0,
  //         p      = param( 0 ),
  //         graph  = accum( .1, p ),
  //         wat    = gen.module( graph, 16 ),
  //         result = 0

  //     gen.assemble( wat ).then( wasm => {
  //       wasm.render(); wasm.render(); wasm.render();
  //       p.value = 1

  //       result = wasm.render()
    
  //       assert.equal( result, answer )
  //     })
  //   })
  })
})