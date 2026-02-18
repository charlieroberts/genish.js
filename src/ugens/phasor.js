let gen

import { accum, div, samplerate } from '../ugens.compiled.js'
import utilities from '../utilities.js'

// TODO: use actual samplerate
const compile = function( obj, offset = 0 ) {
  const out = accum( div(obj.frequency, samplerate() ), obj.reset )

  out.__shouldMemo = obj.__shouldMemo
  out.__memoName = obj.__memoName
  
  return gen.compile( out, offset )
}

const module = __gen => {
  gen = __gen
  return compile
}

export default module
