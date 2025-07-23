import {
  cycle, phasor, accum, add, mul, peek, cycle_compiled, param, noise, sah, data, memo 
} from '../main.js'

import poke from '../ugens/poke.js'

import utilities from '../utilities.js'
import gen from '../gen.js'

// account for floating point errors
const decimate = ( value, amount ) => Math.floor( value * amount ) / amount

const makeMemory = function( memoryAmount = 50 ) {
  const mem = new WebAssembly.Memory({ 
    initial:memoryAmount, maximum:memoryAmount, shared:true 
  })

  utilities.setupMemory( mem.buffer )
  //utilities.createWavetables()

  return mem
}

await gen.init()

const mem = makeMemory(50)

/*
const Sine = gen.factory( (freq=110,gain=.1) => mul( cycle_compiled( freq ), gain ) )
const Bus  = gen.factory( (gain, ...ugens) => {
  let out = ugens[0]
  for( let i = 1; i < ugens.length; i++ ) {
    out = add( out, ugens[1] )
  }
  return mul( gain,out )
})
*/

const _poke = poke( gen )
/*
const d = data([.5]),
      e = data(24),
      idx = accum(.002)

_poke( d, idx, 0 )
 
const graph =  peek( d, 0, 0, 0 )
*/

/*
const  d = data(1024),
       c = accum(.005)

_poke( d, c, 0 )
const graph = peek( d, 0, 0, 0 )
*/
const d = data(1024),
      c = accum(.005),
      i1 = accum(1,0,0,1024),
      i2 = accum(1,0,0,1024)

_poke( d,c,i1 )
const graph = peek(d,i2,0,0)

const func = gen.function( graph ),
      wat  = gen.module( func, false, 50 )

gen.write( wat, 'test.wat' )

