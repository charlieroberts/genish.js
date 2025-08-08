import { add,mul,sub,div,floor } from '../main.js'

let gen

const compile = function( obj, offset = 0 ) {
  const z = div( obj[0], obj[1] )

  const floorz = floor( z )
  const diff = sub( z, floorz )
  const ugen = mul( obj[1], diff )
  
  ugen.__shouldMemo = obj.__shouldMemo 
  ugen.__memoName = obj.__memoName

  return gen.compile( ugen, offset )
}

const module = __gen => {
  gen = __gen
  return compile
}

export default module

/*
(f32.div
  (local.get $x)
  (local.get $y)
)
local.tee $z
local.get $z
f32.floor
f32.sub

local.get $y
f32.mul
*/
