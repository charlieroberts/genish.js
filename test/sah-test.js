import {
  sah,param,add, accum,mul 
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
  describe( 'sah', ()=>{
    it( 'should return 1 on first execution assuming 1 is the input', async () => {
       const mem      = makeMemory(),
             expected = 1,
             graph    = sah(1),
             func     = gen.function( graph ),
             wat      = gen.module( func ),
             wasm     = await gen.assemble( wat, mem )

      const actual   = decimate( wasm.render( 0 ), 1000 )

      gen.write( wat, './trash/sah.wat' )
      assert.strictEqual( actual, expected )    
    })

    it( 'should return 0 on second execution even if the input changes', async () => {
       const mem      = makeMemory(),
             expected = 0,
             graph    = sah(0),
             func     = gen.function( graph ),
             wat      = gen.module( func ),
             wasm     = await gen.assemble( wat, mem )

       const sample1  = decimate( wasm.render( 0 ), 1000 )
       graph.input = 10000
       const sample2  = decimate( wasm.render( 0 ), 1000 )

       assert.strictEqual( sample2, expected )    
     })
    it( 'should return new value after trigger is detected', async () => {
       const mem      = makeMemory(),
             expected = 1,
             inputp   = param(0),
             controlp = param(0),
             graph    = sah( inputp, controlp ),
             func     = gen.function( graph ),
             wat      = gen.module( func ),
             wasm     = await gen.assemble( wat, mem )

       const sample1  = decimate( wasm.render( 0 ), 1000 )
       inputp.value = 1
       controlp.value = 1
       const sample2  = decimate( wasm.render( 0 ), 1000 )

       assert.strictEqual( sample2, expected )    
     })
    it( 'works with memory offsets', async () => {
       const mem      = makeMemory(),
             expected = 1,
             inputp   = param(0),
             controlp = param(0),
             graph    = add( mul(accum(.1),0), sah( inputp, controlp ) ),
             func     = gen.function( graph ),
             wat      = gen.module( func ),
             wasm     = await gen.assemble( wat, mem )

       const sample1  = decimate( wasm.render( 0 ), 1000 )
       inputp.value = 1
       controlp.value = 1
       const sample2  = decimate( wasm.render( 0 ), 1000 )

       assert.strictEqual( sample2, expected )    
    })
  })
})
