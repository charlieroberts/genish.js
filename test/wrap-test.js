import { wrap } from '../src/main.js'

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
  describe( 'a wrap', ()=>{
    it( 'should return 0, with inputs 1,0,1', async () => {
      const mem      = makeMemory(),
            expected = 0,
            graph    = wrap(1,0,1),
            func     = gen.function( graph ),
            wat      = gen.module( func )

      const wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

    
    it( 'should return .5 with inputs 1.5,0,1', async () => {
      const mem  = makeMemory(),
            expected = .5,
            graph    = wrap(1.5,0,1),
            func     = gen.function( graph ),
            wat      = gen.module( func )

      const wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

    
    it( 'should return .75, with inputs .75,0,1', async () => {
      const mem  = makeMemory(),
        expected = .75,
        graph    = wrap(.75,0,1),
        func     = gen.function( graph ),
        wat      = gen.module( func )

      const wasm   = await gen.assemble( wat, mem ),
            actual = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

    it( 'should return .5, with inputs -.5,0,1', async () => {
      const mem      = makeMemory(),
            expected = .5,
            graph    = wrap(-.5,0,1),
            func     = gen.function( graph ),
            wat      = gen.module( func )

      const wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })
    // TODO need to test min once feature is added
    
  })
})
