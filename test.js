'use strict'

let _ = require('./gen2.js')

let add = _.add, 
    gen = _.gen,
    mul = _.mul,
    bus = _.bus,
    abs = _.abs,
    sin = _.sin,
    PI  = _.PI,
    twoPI = PI * 2,
    param = _.param,
    accum = _.accum,
    sampleRate = _.SR

/* HERE ARE THE IMPORTANT LINES */
let frequency = param( 440 )

gen.graph = sin( mul( accum( mul( 1 / sampleRate, frequency ) ), twoPI ) )

for( let i = 0; i < 100; i++ ) {
  let out = gen.out()
  console.log( `${i}: ${out}` )
}

console.log( '\n\n************** SET FREQUENCY TO 1760 *****************\n\n' )

frequency( 1760 )

for( let i = 0; i < 100; i++ ) {
  let out = gen.out()
  console.log( `${i}: ${out}` )
}