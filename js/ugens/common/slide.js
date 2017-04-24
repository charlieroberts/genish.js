'use strict'

let gen     = require( './gen.js' ),
    history = require( '../target/history.js' ),
    sub     = require( '../target/sub.js' ),
    add     = require( '../target/add.js' ),
    mul     = require( '../target/mul.js' ),
    gt      = require( '../target/gt.js' ),
    div     = require( '../target/div.js' ),
    _switch = require( '../target/switch.js' )

module.exports = ( in1, slideUp = 1, slideDown = 1 ) => {
  let y1 = history(0),
      filter, slideAmount

  //y (n) = y (n-1) + ((x (n) - y (n-1))/slide) 
  slideAmount = _switch( gt(in1,y1.out), slideUp, slideDown )

  filter = add( y1.out, div( sub( in1, y1.out ), slideAmount ) ) 

  y1.in( filter )

  return filter
}
