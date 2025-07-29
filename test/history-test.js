import {
  param, ssd, add, mul, accum
} from '../src/main.js'

import utilities from '../src/utilities.js'
import gen from '../src/gen.js'
import assert from 'assert'

// account for floating point errors
const decimate = ( value, amount ) => Math.floor( value * amount ) / amount

const makeMemory = function( memoryAmount = 1 ) {
  utilities.resetMemory() 

  const mem = new WebAssembly.Memory({ 
    initial:memoryAmount, maximum:memoryAmount, shared:true
  })

  utilities.setupMemory( mem.buffer )

  return mem
}

gen.init().then( ()=> {

  describe( 'a history', ()=>{
    it( 'should return 0 on first sample before delay', async () => {
      const mem = makeMemory(),
            s = ssd(),
            p = param(1)
      
      s.in( p )

      const expected = 0,
            graph    = s.out,
            func     = gen.function( graph ),
            wat      = gen.module( func, false, 1 ),
            wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )
    })  

    it( 'should return 1 on second sample after delay', async () => {
      const mem = makeMemory(),
            s   = ssd(),
            p   = param(1)

      s.in( p )

      const expected = 1,
            graph    = s.out,
            func     = gen.function( graph ),
            wat      = gen.module( func, false, 1 )

      const wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( 0 ), 1000 ),
            again    = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( again, expected )
    })

    it( 'should work with memory offsets', async () => {
      const mem = makeMemory(),
            s   = ssd(),
            a   = accum(.01),
            p   = param(1)

      s.in( p )

      const expected = 1,
            graph    = s.out,
            func     = gen.function( add(graph, mul(a,0)) ),
            wat      = gen.module( func, false, 1 )

      //gen.write( wat, './trash/history.wat' )

      const wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( 0 ), 1000 ),
            again    = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( again, expected )
    })

  })
})
