'use strict'

let gen = require( './gen.js' ),
    data = require( './data.js' ),
    peek = require( './peek.js' ),
    mul  = require( './mul.js' )

let proto = {
  basename:'pan', 
  initTable() {    
    let bufferL = new Float32Array( 1024 ),
        bufferR = new Float32Array( 1024 )

    const angToRad = Math.PI / 180
    for( let i = 0; i < 1024; i++ ) { 
      let pan = i * ( 90 / 1024 )
      bufferL[i] = Math.cos( pan * angToRad ) 
      bufferR[i] = Math.sin( pan * angToRad )
    }

    gen.globals.panL = data( bufferL, 1, { immutable:true })
    gen.globals.panR = data( bufferR, 1, { immutable:true })
  }

}

module.exports = ( leftInput, rightInput, pan =.5, properties ) => {
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
