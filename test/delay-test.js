import { delay } from '../src/main.js'

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
  describe( 'a delay', ()=>{
    it( 'should return 0 before delay time', async () => {
      const mem      = makeMemory(),
            expected = 0,
            graph    = delay(1,3,10),
            func     = gen.function( graph ),
            wat      = gen.module( func )

      gen.write( wat, './trash/delay.wat' )

      const wasm     = await gen.assemble( wat, mem )
      const actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })
    it( 'should return 1 after three samples with 10 sample line', async () => { 
      const mem      = makeMemory(),
            expected = 1,
            graph    = delay(1,3,10),
            func     = gen.function( graph ),
            wat      = gen.module( func )

      gen.write( wat, './trash/delay.wat' )

      const wasm     = await gen.assemble( wat, mem )

      wasm.render(0); wasm.render(0); wasm.render(0);
      const actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

    it( 'should return 1 after three samples with 5 sample line', async () => {
      const mem      = makeMemory(),
            expected = 1,
            graph    = delay(1,3,5),
            func     = gen.function( graph ),
            wat      = gen.module( func )

      gen.write( wat, './trash/delay.wat' )

      const wasm     = await gen.assemble( wat, mem )

      wasm.render(0); wasm.render(0); wasm.render(0);
      const actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })
  })
})
