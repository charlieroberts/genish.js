import {
  accum, setupMemory
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

  describe( 'an accum', ()=>{
    it( 'should return 0 on first execution', async () => {
      const mem      = makeMemory(),
            expected = 0,
            graph    = accum(.5),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

    it( 'should ramp to .4 with an increment of .1 after five executions', async () => {
      const mem      = makeMemory(),
            expected = .4,
            graph    = accum(.1),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem )

      wasm.render( graph.idx * 4 )
      wasm.render( graph.idx * 4 )
      wasm.render( graph.idx * 4 )
      wasm.render( graph.idx * 4 )

      const actual = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

    it( 'should return to its min value of 0 on the 11th execution with an increment of .1', async () => {
      const mem      = makeMemory(),
            expected = 0,
            graph    = accum(.1),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem )

      for( let i = 0; i < 10; i++ ) wasm.render( graph.idx * 4 )
      const actual = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.strictEqual( actual, expected )    
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