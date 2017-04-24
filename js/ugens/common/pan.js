'use strict'

let gen = require( './gen.js' ),
    data = require( './data.js' ),
    peek = require( '../target/peek.js' ),
    mul  = require( '../target/mul.js' )

let proto = {
  basename:'pan', 
  initTable() {    
    let bufferL = new Float32Array( 1024 ),
        bufferR = new Float32Array( 1024 )

    let sqrtTwoOverTwo = Math.sqrt(2) / 2

    for( let i = 0; i < 1024; i++ ) { 
      let pan = -1 + ( i / 1024 ) * 2
      bufferL[i] = ( sqrtTwoOverTwo * ( Math.cos(pan) - Math.sin(pan) ) )
      bufferR[i] = ( sqrtTwoOverTwo * ( Math.cos(pan) + Math.sin(pan) ) )
    }

    gen.globals.panL = data( bufferL, 1, { immutable:true })
    gen.globals.panR = data( bufferR, 1, { immutable:true })
  }

}

module.exports = ( leftInput, rightInput, pan, properties ) => {
  if( gen.globals.panL === undefined ) proto.initTable()

  let ugen = Object.create( proto )

  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ leftInput, rightInput ],
    left:    mul( leftInput, peek( gen.globals.panL, pan, { boundmode:'clamp' }) ),
    right:   mul( rightInput, peek( gen.globals.panR, pan, { boundmode:'clamp' }) )
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
