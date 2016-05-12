'use strict'

let gen  = require( './gen.js'  ),
    data = require( './data.js' ),
    poke = require( './poke.js' ),
    wrap = require( './wrap.js' ),
    accum= require( './accum.js')

let proto = {
  basename:'delay',

  gen() {
  //  let code, out, acc, writeIdx, readIdx
    
  //  writeIdx = accum( 1, 0, { max:this.size}) // initialValue:Math.floor(this.time) }) 
  //  readIdx  = wrap( sub( writeIdx, this.inputs[1] ), 0, this.size )

  //  poke( this.buffer, this.inputs[0], writeIdx ).gen()

  //  out = peek( this.buffer, readIdx, { mode:'samples', interp:this.interp }).gen()
    
    this.inputs[0].gen()
    let out = this.inputs[1].gen()

    gen.memo[ this.name ] = out
    
    return out
  },
}

module.exports = ( in1, time=256, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { size: 512, feedback:0, interp:'linear' }

  if( properties !== undefined ) Object.assign( defaults, properties )

  //Object.assign( ugen, {
  //  time,
  //  buffer : data( defaults.size ),
  //  uid:    gen.getUID(),
  //  inputs: [ in1, time ],
  //},
  //defaults )

  let code, out, acc, writeIdx, readIdx, delaydata

  delaydata = data( defaults.size )

  writeIdx = accum( 1, 0, { max:defaults.size }) // initialValue:Math.floor(this.time) }) 
  readIdx  = wrap( sub( writeIdx, time ), 0, defaults.size )

  ugen.inputs =[
    poke( delaydata, in1, writeIdx ),
    peek( delaydata, readIdx, { mode:'samples', interp:defaults.interp })
  ]

  
  //gen.memo[ this.name ] = out
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
