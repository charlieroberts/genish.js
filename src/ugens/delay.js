let gen

import { data, peek, sub, accum, wrap, add } from '../main.js'
import utilities from '../utilities.js'
import poke from './poke.js'

let __poke
const compile = function( obj, offset=0 ) {
  const d = data( obj.maxSize )
  const writeidx = accum(1, 0, 0, obj.maxSize, obj.time )
  const out = peek(
    d,
    wrap( sub( writeidx, obj.time ), 0, obj.maxSize ), 
    0,
    0
  )
  
  __poke( d, obj.input, writeidx )
  
  out.__memoName = obj.__memoName

  return gen.compile( out, offset )
}

const module = __gen => {
  gen = __gen
  __poke = poke( gen )
  return compile
}

export default module
