import { add,mul,sub } from '../main.js'

let gen

const compile = function( obj, offset = 0 ) {
  const ugen = add( 
    mul( 
      obj.in1, 
      sub( 1, obj.t ) 
    ), 
    mul( 
      obj.in2, 
      obj.t 
    )
  )

  ugen.__shouldMemo = obj.__shouldMemo 
  ugen.__memoName = obj.__memoName

  return gen.compile( ugen, offset )
}

const module = __gen => {
  gen = __gen
  return compile
}

export default module
