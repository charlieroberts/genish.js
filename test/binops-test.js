import {
  add, sub, mul, div, min, max, eq, neq, and, gt, gte, lt, lte
} from '../src/main.js'

import gen from '../src/gen.js'
import assert from 'assert'

// account for floating point errors
const decimate = ( value, amount ) => Math.floor( value * amount ) / amount

// NOTE: none of these tests have proper memory setups, however, since
// none of these functions actually use any memory, they work as is.
gen.init().then( ()=> {

  describe( 'the binops ugens', ()=> {
    it( 'should add 4 and 7 and get 11', async ()=> {
      let answer = 11,
          graph  = add( 4,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 1000 )

      assert.equal( result, answer )
    })

    it( 'should sub 4 and 7 to get -3', async ()=> {
      let answer = -3,
          graph  = sub( 4,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 1000 )

      assert.equal( result, answer )
    })
    
    it( 'should multiply 4 and 7 to get 28', async ()=> {
      let answer = 28,
          graph  = mul( 4,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 1000 )

      assert.equal( result, answer )
    })

    it( 'should divide 49 and 7 to get 7', async ()=> {
      let answer = 7,
          graph  = div( 49,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 1000 )

      assert.equal( result, answer )
    })

    it( 'should output 4 when taking the min of 7 and 4', async ()=> {
      let answer = 4,
          graph  = min( 4,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 1000 )

      assert.equal( result, answer )
    })

    it( 'should output 7 when taking the max of 7 and 4', async ()=> {
      let answer = 7,
          graph  = max( 4,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 1000 )

      assert.equal( result, answer )
    })

  })

  describe( 'the logic ugens', ()=> {
    it( 'should output 0 when checking if 4 & 7 are equal', async ()=> {
      let answer = 0,
          graph  = eq( 4,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 1000 )

      assert.equal( result, answer )
    })

    it( 'should output 1 when checking if 4 & 7 are not equal', async ()=> {
      let answer = 1,
          graph  = neq( 4,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 1000 )

      assert.equal( result, answer )
    })

    // it( 'should output 1 when doing an "and" comparison on 4 & 7', ()=> {
    //   let answer = 1,
    //       graph  = and( 4,7 ),
    //       func   = gen.function( graph ),
    //       wat    = gen.module( func, true ),
    //       result = 0

    //   gen.assemble( wat ).then( wasm => {
    //     result = decimate( wasm.render(), 1000 )

    //     assert.equal( result, answer )
    //   })
    // })

    it( 'should output 0 when doing a gt on (4,7)', async ()=> {
      let answer = 0,
          graph  = gt( 4,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 10 )

      assert.equal( result, answer )
    })

    it( 'should output 1 when doing a gt on (7,4)', async ()=> {
      let answer = 1,
          graph  = gt( 7,4 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 10 )

      assert.equal( result, answer )
    })

    it( 'should output 1 when doing a gte on (7,7)', async ()=> {
      let answer = 1,
          graph  = gte( 7,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 10 )

      assert.equal( result, answer )
    })

    it( 'should output 1 when doing a lt on (4,7)', async ()=> {
      let answer = 1,
          graph  = lt( 4,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 10 )

      assert.equal( result, answer )
    })

    it( 'should output 0 when doing a lt on (7,4)', async ()=> {
      let answer = 0,
          graph  = lt( 7,4 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 10 )

      assert.equal( result, answer )
    })

    it( 'should output 1 when doing a lte on (7,7)', async ()=> {
      let answer = 1,
          graph  = lte( 7,7 ),
          func   = gen.function( graph ),
          wat    = gen.module( func )

      const wasm = await gen.assemble( wat )
      const result = decimate( wasm.render(), 10 )

      assert.equal( result, answer )
    })

  })

})
