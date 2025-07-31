let gen

import { data, peek, sub, accum, wrap, add, max, abs } from '../main.js'
import utilities from '../utilities.js'
import poke from './poke.js'

let __poke
const compile = function( obj, offset=0 ) {
  const d = data( obj.maxSize )
  const writeidx = accum(1, 0, 0, obj.maxSize, obj.time )
  __poke( d, obj.input, writeidx )
  const out = peek(
    d,
    //abs( sub( writeidx, obj.time ) ),
    writeidx,//wrap( sub( writeidx, obj.time ), 0, obj.maxSize ), 
    0,
    0
  )
  
  
  out.__shouldMemo = obj.__shouldMemo
  out.__memoName = obj.__memoName

  return gen.compile( out, offset )
}

const module = __gen => {
  gen = __gen
  __poke = poke( gen )
  return compile
}

export default module
