import {
  accum, param, sub, mul 
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

  return mem
}

gen.init().then( ()=> {
  describe( 'a param', ()=>{
     it( 'should return 42', async () => {
       const mem      = makeMemory(),
             expected = 42,
             graph    = param( 42 ),
             func     = gen.function( graph ),
             wat      = gen.module( func ),
             wasm     = await gen.assemble( wat, mem ),
             actual   = decimate( wasm.render( 0 ), 1000 )

       assert.strictEqual( actual, expected )    
     })

    it( 'should change what it returns after changing its value', async () => {
      const mem      = makeMemory(),
            graph    = param( 42 ),
            func     = gen.function( graph ),
            wat      = gen.module( func ),
            wasm     = await gen.assemble( wat, mem ),
            sample1  = decimate( wasm.render( 0 ), 100000 )

      graph.value = 0

      const sample2  = decimate( wasm.render( 0 ), 100000 )

      //console.log( sample1, sample2, sample2 > sample1 )
      assert( sample1 === 42 && sample2 === 0 )
    })

    it( 'should return 42 even with memory offsets', async () => {
       const mem      = makeMemory(),
             expected = 42,
             a        = accum(.01),
             p        = param( 42 ),
             graph    = sub(p,mul(a,0)),
             func     = gen.function( graph ),
             wat      = gen.module( func ),
             wasm     = await gen.assemble( wat, mem )

       //console.log( 'param value:', p.value, p.idx )
       const actual   = decimate( wasm.render( 0 ), 1000 )

       assert.strictEqual( actual, expected )    
     })

  })
})
