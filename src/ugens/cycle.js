let gen

import { phasor,peek,accum, div } from '../main.js'
import utilities from '../utilities.js'

const compile = function( obj, offset=0 ) {
  const out = peek(
    utilities.sinedata,
    accum( div(obj.frequency, utilities.memi[ utilities.sridx ] ) ),
    'linear',
    'phase'
  )

  out.__shouldMemo = obj.__shouldMemo
  out.__memoName = obj.__memoName

  return gen.compile( out, offset )
}

const module = __gen => {
  gen = __gen
  return compile
}

export default module
