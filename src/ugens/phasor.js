let gen

import { accum, div } from '../main.js'

// TODO: use actual samplerate
const compile = function( obj ) {
  const out = accum(
    div(
      obj.frequency,
      44100
    ),
    obj.reset
  )

  return gen.compile( out )
}

const module = __gen => {
  gen = __gen
  return compile
}

export default module