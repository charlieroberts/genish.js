let gen

import { phasor,peek,accum, div, ssd, gt, ifelse } from '../main.js'
import utilities from '../utilities.js'

const compile = function( obj, offset=0 ) {
  let y1 = ssd(0),
      filter = null, 
      slideAmount = null

  //y (n) = y (n-1) + ((x (n) - y (n-1))/slide) 
  slideAmount = ifelse( gt( obj.input, y1.out), obj.slideUp, obj.slideDown )

  // filter = memo( add( y1.out, div( sub( in1, y1.out ), slideAmount ) ) )
  filter = add( y1.out, div( sub( obj.input, y1.out ), slideAmount ) ).memo() 

  y1.in( filter )
  
  filter.__shouldMemo = obj.__shouldMemo
  filter.__memoName = obj.__memoName

  return gen.compile( filter, offset )
}

const module = __gen => {
  gen = __gen
  return compile
}

export default module
