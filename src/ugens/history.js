let gen

import { peek, data } from '../ugens.compiled.js'
import poke from './poke.js'

let __poke = null

const compile = function( obj, offset = 0 ) {
  obj.__data = data([ obj.value ])

  // triggers compilation of poke in current ugen
  __poke( obj.__data, obj.__input, offset  )

  const out = peek( obj.__data, 0, 0, 0 ) 
  out.__memoName =  obj.__memoName
  out.__shouldMemo = obj.__shouldMemo
  
  return gen.compile( out, offset )
}

const module = __gen => {
  gen = __gen
  __poke = poke( gen )
  return compile
}

export default module
