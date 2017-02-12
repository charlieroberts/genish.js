/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var clamp = genlib.clamp
var mul = genlib.mul
var cycle = genlib.cycle

describe( 'clamp', () => {
  it( 'should not let samples outside the range of -1..1', ()=> {
    let graph = clamp( mul( cycle(440), 10 ), -1, 1 ),
        storage = [],
        out = gen.createCallback( graph, 2048 )

    for( let i = 0; i < 200; i++ ) {
      out()
      storage[ i ] = gen.out[ 0 ]
    }


    let min = Math.min.apply( null, storage ),
        max = Math.max.apply( null, storage )

    assert( min >= -1 && max <= 1 )
  })
})
