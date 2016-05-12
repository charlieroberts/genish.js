'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' )

module.exports = ( in1, slideUp = 1, slideDown = 1 ) => {
  let y1 = history(),
      filter

  filter = memo( add( y1.out, div( sub( in1, y1.out ), slideUp ) ) )
  y1.in( filter )

  return filter
}
