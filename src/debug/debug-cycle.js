import {
  cycle, phasor, accum, add, mul, peek, cycle_compiled
} from '../main.js'

import utilities from '../utilities.js'

import gen from '../gen.js'

// account for floating point errors
const decimate = ( value, amount ) => Math.floor( value * amount ) / amount

const makeMemory = function( memoryAmount = 50 ) {
  const mem = new WebAssembly.Memory({ 
    initial:memoryAmount, maximum:memoryAmount, shared:true 
  })

  utilities.setupMemory( mem.buffer )
  utilities.createWavetables()

  return mem
}

await gen.init()

const mem      = makeMemory(500)

/*
let baseFreq = 55
let prev = cycle_compiled( baseFreq )
baseFreq *= 1.00125
let count = 3000
let i = 1
for( i = 1; i < count; i++ ) {
  prev = add( prev, cycle_compiled(baseFreq) )
  baseFreq *= 1.001
}
graph = mul( prev, 1/count)
*/

const Sine = gen.factory( (freq=110,gain=.1) => mul( cycle_compiled( freq ), gain ) )
const s = Sine(330,.1)
//console.log( s )

const func = gen.function( s ),//Sine.compile(),
      wat  = gen.module( func, false, 500 )

gen.write( wat, 'test.wat' )
// const wasm     = await gen.assemble( wat, mem )

// for( let i = 0; i < 10; i++ ) {
//   console.log( wasm.render( graph.idx * 4 )  )
// }