let gen

import { peek, data } from '../main.js'
import poke from './poke.js'

let __poke = null
// TODO: use actual samplerate
const compile = function( obj, offset = 0 ) {
  // triggers compilation of poke in current ugen
  __poke( obj.__data, obj.__input, offset  )

  const out = peek( obj.__data, 0, 0, 0 ) 
  out.__memoName = obj.__memoName
  out.__memoName =  'history_' + obj.idx + '_out'
  
  return gen.compile( out, offset )
}

const module = __gen => {
  gen = __gen
  __poke = poke( gen )
  return compile
}

export default module
