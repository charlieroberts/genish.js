'use strict'

let gen     = require( './gen.js' ),
    history = require( '../target/history.js' ),
    sub     = require( '../target/sub.js' ),
    add     = require( '../target/add.js' ),
    mul     = require( '../target/mul.js' )

module.exports = in1 => {
  let x1 = history(),
      y1 = history(),
      filter

  //History x1, y1; y = in1 - x1 + y1*0.9997; x1 = in1; y1 = y; out1 = y;
  filter = add( sub( in1, x1.out ), mul( y1.out, .9997 ) )
  x1.in( in1 )
  y1.in( filter )

  // double placement of add ugen occurs when y1.in() takes an argument
  // graph that includes y1.out

  return filter
}
