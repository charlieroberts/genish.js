'use strict'

let gen  = require( './gen.js'  ),
    data = require( './data.js' ),
    poke = require( '../target/poke.js' ),
    peek = require( '../target/peek.js' ),
    sub  = require( '../target/sub.js'  ),
    wrap = require( '../target/wrap.js' ),
    accum= require( '../target/accum.js')

let proto = {
  basename:'delay',

  gen() {
    let inputs = gen.getInputs( this )
    
    gen.memo[ this.name ] = inputs[0]
    
    return inputs[0]
  },
}

module.exports = ( in1, time=256, ...tapsAndProperties ) => {
  let ugen = Object.create( proto ),
      defaults = { size: 512, feedback:0, interp:'linear' },
      writeIdx, readIdx, delaydata, properties, tapTimes = [ time ], taps
  
  if( Array.isArray( tapsAndProperties ) ) {
    properties = tapsAndProperties[ tapsAndProperties.length - 1 ]
    if( tapsAndProperties.length > 1 ) {
      for( let i = 0; i < tapsAndProperties.length - 1; i++ ){
        tapTimes.push( tapsAndProperties[ i ] )
      }
    }
  }else{
    properties = tapsAndProperties
  }

  if( properties !== undefined ) Object.assign( defaults, properties )

  if( defaults.size < time ) defaults.size = time

  delaydata = data( defaults.size )
  
  ugen.inputs = []

  writeIdx = accum( 1, 0, { max:defaults.size }) 
  
  for( let i = 0; i < tapTimes.length; i++ ) {
    ugen.inputs[ i ] = peek( delaydata, wrap( sub( writeIdx, tapTimes[i] ), 0, defaults.size ),{ mode:'samples', interp:defaults.interp })
  }
  
  ugen.outputs = ugen.inputs // ugn, Ugh, UGH! but i guess it works.

  poke( delaydata, in1, writeIdx )

  ugen.name = `${ugen.basename}${gen.getUID()}`

  return ugen
}
