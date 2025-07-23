import {
  data, peek, accum, param,add
} from '../src/main.js'

import poke from '../src/ugens/poke.js'
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
  const _poke = poke( gen )

  describe( 'a poke', ()=>{
    it( 'should put 42.0 in to memory', async () => {
      const mem = makeMemory(),
            expected = 42,
            d        = data(1),
            p        = _poke(d, 42, 0),
            graph    = peek( d, 0, 0, 0 ),
            func     = gen.function( graph ),
            wat      = gen.module( func, false, 1 ),
            wasm     = await gen.assemble( wat, mem )

      const actual   = decimate( wasm.render( 0 ), 1000 ),
            again    = decimate( wasm.render( 0 ), 1000 )

      assert.strictEqual( again, expected )
    })

    
    it( 'should fill 64 numbers', async () => {
      const mem      = makeMemory(),
            d        = data( 64 ),
            indexp   = param( 0 ),
            valuep   = param( 0 ),
            p        = _poke( d, valuep, indexp ),
            graph    = add(0,0), 
            func     = gen.function( graph ),
            wat      = gen.module( func, false, 1 ),
            wasm     = await gen.assemble( wat, mem )

      for( let i = 0; i < 64; i++ ) {
        indexp.value = i
        valuep.value = i
        wasm.render(0)
      }

      const memf = new Float32Array( mem.buffer )

      let result = true
      for( let i = 0; i < 64; i++ ) {
        if( memf[d.idx + i] !== i ) {
          result = false
          break
        }
      }

      assert( result )
    })

    it( 'should fill 64 numbers with accum index', async () => {
      const mem      = makeMemory(),
            d        = data( 64 ),
            index    = accum(1,0,0,64),
            value    = param(0), 
            p        = _poke( d, value, index ),
            graph    = add(0,0), 
            func     = gen.function( graph ),
            wat      = gen.module( func, false, 1 ),
            wasm     = await gen.assemble( wat, mem )

      const memf = new Float32Array( mem.buffer )
      for( let i = 0; i < 64; i++ ) {
        value.value = i
        wasm.render(0)
      }

      debugger
      let result = true
      for( let i = 0; i < 64; i++ ) {
        if( memf[d.idx + i] !== i ) {
          result = false
          break
        }
      }

      assert( result )
    })

    it( 'should fill 64 numbers with two accums', async () => {
      const mem      = makeMemory(),
            d        = data( 64 ),
            index    = accum(1,0,0,64),
            value    = accum(1,0,0,64), 
            p        = _poke( d, value, index ),
            graph    = add(0,0), 
            func     = gen.function( graph ),
            wat      = gen.module( func, false, 1 ),
            wasm     = await gen.assemble( wat, mem )

      const memf = new Float32Array( mem.buffer )
      for( let i = 0; i < 64; i++ ) wasm.render(0)

      let result = true
      for( let i = 0; i < 64; i++ ) {
        if( memf[d.idx + i] !== i ) {
          result = false
          break
        }
      }

      assert( result )
    })

    it( 'should fill 64 numbers with one accum for both index and value', async () => {
      const mem      = makeMemory(),
            d        = data( 64 ),
            index    = accum(1,0,0,64),
            p        = _poke( d, index, index ),
            graph    = add(0,0), 
            func     = gen.function( graph ),
            wat      = gen.module( func, false, 1 ),
            wasm     = await gen.assemble( wat, mem )

      const memf = new Float32Array( mem.buffer )
      for( let i = 0; i < 64; i++ ) {
        wasm.render(0)
      }

      let result = true
      for( let i = 0; i < 64; i++ ) {
        if( memf[d.idx + i] !== i ) {
          result = false
          break
        }
      }

      assert( result )
    })
    
  })
})
