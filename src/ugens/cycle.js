let gen

import { phasor,peek,utilities,accum } from '../main.js'

const compile = function( obj ) {
  const out = peek(
    utilities.sinedata,
    accum( 110/44100 ),
    // phasor(
    //   obj.frequency,
    //   obj.reset
    // ),
    'linear',
    'phase'
  )

  return gen.compile( out )
}

const module = __gen => {
  gen = __gen
  return compile
}

export default module