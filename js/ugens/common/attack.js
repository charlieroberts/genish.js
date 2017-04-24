'use strict'

let gen     = require( './gen.js' ),
    history = require( '../target/history.js' ),
    mul     = require( '../target/mul.js' ),
    sub     = require( '../target/sub.js' )

module.exports = ( decayTime = 44100 ) => {
  let ssd = history ( 1 ),
      t60 = Math.exp( -6.907755278921 / decayTime )

  ssd.in( mul( ssd.out, t60 ) )

  ssd.out.trigger = ()=> {
    ssd.value = 1
  }

  return sub( 1, ssd.out )
}
