'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' )

let proto = {
  basename:'dcblock',

  gen() {
    let inputs = gen.getInputs( this ),
        x1     = history(),
        y1     = history(),
        filter

    //History x1, y1; y = in1 - x1 + y1*0.9997; x1 = in1; y1 = y; out1 = y;
    filter = memo( add( sub( inputs[0], x1 ), mul( y1, .9997 ) ) )
    x1.record( inputs[0] ).gen()
    y1.record( filter ).gen()

    return filter.name
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
