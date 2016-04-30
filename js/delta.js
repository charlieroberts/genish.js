'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' )

let proto = {
  basename:'delta',

  gen() {
    let inputs = gen.getInputs( this ),
        n1     = history()
    
    n1.record( inputs[0] ).gen()

    return sub( inputs[0], n1 ).gen()
  }

}

module.exports = ( in1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    uid:        gen.getUID(),
    inputs:     [ in1 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
