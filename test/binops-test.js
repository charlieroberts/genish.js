import {
  setupMemory,
  add, sub, mul, div, min, max, eq, neq, and, gt, gte, lt, lte
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

// memory must be made before graph creation, hence the parameter ordering below
const runTest = function( description, expected, mem, graph ) {
  it( description, async ()=> {
    const func   = gen.function( graph ),
          wat    = gen.module( func ),
          wasm   = await gen.assemble( wat, mem ),
          actual = decimate( wasm.render( graph.idx * 4 ), 1000 )

    assert.strictEqual( actual, expected )
  })
}

gen.init().then( ()=> {

  describe( 'the binops ugens', ()=> {
    runTest( 'should add 4 and 7 and get 11', 11, makeMemory(), add(4,7) )
    runTest( 'should sub 4 and 7 to get -3', -3,  makeMemory(), sub(4,7) )
    runTest( 'should multiply 4 and 7 to get 28', 28,  makeMemory(), mul(4,7) )
    runTest( 'should divide 49 and 7 to get 7',   7,   makeMemory(), div(49,7) )
    runTest( 'should output 4 when taking the min of 7 and 4', 4, makeMemory(), min(4,7) )
    runTest( 'should output 7 when taking the max of 7 and 4', 7, makeMemory(), max(4,7) )
  })

  describe( 'the logic ugens', ()=> {
    runTest( 'should output 0 when checking if 4 & 7 are equal',     0, makeMemory(), eq(4,7)  )
    runTest( 'should output 1 when checking if 4 & 7 are not equal', 1, makeMemory(), neq(4,7) )
    runTest( 'should output 0 when doing a gt on (4,7)', 0,  makeMemory(), gt(4,7) )
    runTest( 'should output 1 when doing a gt on (7,4)', 1,  makeMemory(), gt(7,4) )
    runTest( 'should output 1 when doing a gte on (7,7)', 1, makeMemory(), gte(7,7) )
    runTest( 'should output 1 when doing a lt on (4,7)', 1,  makeMemory(), lt(4,7) )
    runTest( 'should output 0 when doing a lt on (7,4)', 0,  makeMemory(), lt(7,4) )
    runTest( 'should output 1 when doing a lte on (7,7)', 1, makeMemory(), lte(7,7) )
  })

})
