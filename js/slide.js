'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' )

let proto = {
  basename:'slide',

  gen() {
    let inputs = gen.getInputs( this ),
        y1     = history(),
        filter

    //filter = memo( add( sub( inputs[0], x1.out ), mul( y1.out, .9997 ) ) )
    filter = memo( add( y1.out, div( sub( inputs[0], y1.out ), inputs[1] ) ) ) 
    y1.in( filter ).gen()

    return filter.name
  }

}

module.exports = ( in1, slideUp = 1, slideDown = 1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    uid:        gen.getUID(),
    inputs:     [ in1, slideUp, slideDown ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
