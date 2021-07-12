import {
  peek, data, setupMemory
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

  describe( 'a peek', ()=>{
    it( 'should return 42 on with an index of 0 and a data of [42]', async () => {
      const mem = makeMemory(),
            expected = 42,
            graph    = peek( data([ 42 ]), 0, 'none', 'samples' ),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.strictEqual( actual, expected )
    })

    it( 'should return 42 on with an index of 3 and a data of [0,1,2,42]', async () => {
      const mem = makeMemory(),
            expected = 42,
            graph    = peek( data( [0,1,2,42] ), 3, 'none', 'samples' ),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.strictEqual( actual, expected )
    })

    it( 'should return 1 on with an index of .75 and a data of [0,1,2] (no interp)', async () => {
      const mem = makeMemory(),
            expected = 1,
            graph    = peek( data( [0,1,2] ), .75, 'none' ),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.strictEqual( actual, expected )
    })

    it( 'should return .5 with an index of .5 and a data of [0,1] (linear interp)', async () => {
      const mem      = makeMemory(),
            expected = .5,
            graph    = peek( data( [0,1] ), .5, 'linear', 'phase' ),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.strictEqual( actual, expected )
    })

    it( 'should return 1 with an index of .5 and a data of [0,2] (linear interp)', async () => {
      const mem      = makeMemory(),
            expected = 1,
            graph    = peek( data( [0,2] ), .5, 'linear', 'phase' ),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.strictEqual( actual, expected )
    })

    it( 'should return 2 with an index of .5 and a data of [1,3] (linear interp)', async () => {
      const mem      = makeMemory(),
            expected = 2,
            graph    = peek( data( [1,3] ), .5, 'linear', 'phase' ),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( graph.idx * 4 ), 1000 )

      assert.strictEqual( actual, expected )
    })
  })
})