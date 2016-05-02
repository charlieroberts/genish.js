'use strict'

let gen  = require( './gen.js'  ),
    data = require( './data.js' ),
    poke = require( './poke.js' ),
    wrap = require( './wrap.js' ),
    accum= require( './accum.js')

let proto = {
  basename:'delay',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        out, acc

    poke( this.buffer, inputs[0], accum( 1,0, { max:this.size, initialValue:this.time }) ).gen()

    acc = accum(1,0,{ max:this.size })

    out = peek( this.buffer, acc, { mode:'samples' }).gen()

    gen.memo[ this.name ] = out
    
    return out
  },
}

module.exports = ( in1, time=256, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { size: 512, feedback:0 }

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, {
    time,
    buffer : data( defaults.size ),
    uid:    gen.getUID(),
    inputs: [ in1, time ],
  },
  defaults )
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
