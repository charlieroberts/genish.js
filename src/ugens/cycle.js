let gen

import { phasor,peek,accum, div } from '../main.js'
import utilities from '../utilities.js'

const compile = function( obj, offset=0 ) {
  const out = peek(
    utilities.sinedata,
    accum( obj.frequency / utilities.memi[ utilities.sridx ] ),
    'none',
    'phase'
  )

  const str = gen.compile( out, offset )

  return str
}

const module = __gen => {
  gen = __gen
  return compile
}

export default module