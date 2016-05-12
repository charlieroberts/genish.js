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

    filter = memo( add( y1.out, div( sub( inputs[0], y1.out ), inputs[1] ) ) )
    y1.in( filter ).gen()

    return filter.name
  }

}

module.exports = ( in1, slideUp = 1, slideDown = 1 ) => {

  let y1 = history(),
      filter

  filter = memo( add( y1.out, div( sub( in1, y1.out ), slideUp ) ) )
  y1.in( filter )
  
  //filter.name = 'slide'+gen.getUID()

  return filter
}
