'use strict'

let gen  = require( './gen.js'  ),
    data = require( './data.js' ),
    poke = require( './poke.js' ),
    wrap = require( './wrap.js' ),
    accum= require( './accum.js')

let proto = {
  basename:'delay',

  gen() {
    let code, out, acc

    poke( this.buffer, this.inputs[0], accum( 1, 0, { max:this.size, initialValue:Math.floor(this.time) }) ).gen()

    acc = accum( 1, 0, { max:this.size })

    out = peek( this.buffer, acc, { mode:'samples', interp:this.interp }).gen()

    gen.memo[ this.name ] = out
    
    return out
  },
}

module.exports = ( in1, time=256, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { size: 512, feedback:0, interp:'none' }

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
