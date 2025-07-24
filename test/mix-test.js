import { mix } from '../src/main.js'

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
  describe( 'a mix', ()=>{
    it( 'should return .5, with inputs 0,1,.5', async () => {
      const mem      = makeMemory(),
            expected = .5,
            graph    = mix(0,1,.5),
            func     = gen.function( graph ),
            wat      = gen.module( func )

      //gen.write( wat, './trash/mix.wat' )

      const wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

    it( 'should return 1, with inputs 0,1,1', async () => {
      const mem  = makeMemory(),
            expected = 1,
            graph    = mix(0,1,1),
            func     = gen.function( graph ),
            wat      = gen.module( func )

      const wasm     = await gen.assemble( wat, mem ),
            actual   = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })

    it( 'should return 0, with inputs 0,1,0', async () => {
      const mem  = makeMemory(),
        expected = 1,
        graph    = mix(0,1,1),
        func     = gen.function( graph ),
        wat      = gen.module( func )

      const wasm   = await gen.assemble( wat, mem ),
            actual = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( actual, expected )    
    })
  })
})
