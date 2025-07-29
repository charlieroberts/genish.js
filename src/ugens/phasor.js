let gen

import { accum, div } from '../main.js'

// TODO: use actual samplerate
const compile = function( obj, offset = 0 ) {
  const out = accum(
    div(
      obj.frequency,
      44100
    ),
    obj.reset
  )

  out.__shouldMemo = obj.__shouldMemo
  out.__memoName = obj.__memoName
  
  return gen.compile( out )
}

const module = __gen => {
  gen = __gen
  return compile
}

export default module
