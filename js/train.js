'use strict'

let gen     = require( './gen.js' ),
    lt      = require( './lt.js' ),
    phasor  = require( './phasor.js' )

let proto = {
  basename:'train',

  gen() {
    let inputs = gen.getInputs( this ),
        graph = lt( accum( div( inputs[0], 44100 ) ), inputs[1] )
    
    return graph.gen()
  }

}

module.exports = ( period=440, pulsewidth=.5 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    uid:        gen.getUID(),
    inputs:     [ period, pulsewidth ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

