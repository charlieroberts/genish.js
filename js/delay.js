'use strict'

let gen  = require( './gen.js'  ),
    data = require( './data.js' ),
    poke = require( './poke.js' ),
    wrap = require( './wrap.js' ),
    accum= require( './accum.js')

let proto = {
  basename:'delay',

  gen() {
    let inputs = gen.getInputs( this )
    
    gen.memo[ this.name ] = inputs[0]
    
    return inputs[0]
  },
}

module.exports = ( in1, time=256, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { size: 512, feedback:0, interp:'linear' },
      writeIdx, readIdx, delaydata

  if( properties !== undefined ) Object.assign( defaults, properties )

  delaydata = data( defaults.size )

  writeIdx = accum( 1, 0, { max:defaults.size }) // initialValue:Math.floor(this.time) }) 
  readIdx  = wrap( sub( writeIdx, time ), 0, defaults.size )

  ugen.inputs =[
    peek( delaydata, readIdx, { mode:'samples', interp:defaults.interp })
  ]

  ugen.output = poke( delaydata, in1, writeIdx )

  ugen.name = `${ugen.basename}${gen.getUID()}`

  return ugen
}
