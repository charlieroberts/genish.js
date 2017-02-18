/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var delta = genlib.delta
var accum = genlib.accum

describe( 'delta', ()=> {
  it( 'should return 0 or .1 when tracking accum(.1) for first 11 samples, -.9 for 11th (after accum wraps)' , ()=> {
    let answer = [0,.1,.1,.1,.1,.1,.1,.1,.1,.1,-.9],
        d1 = delta( accum(.1) ),
        out = gen.createCallback( d1, 8 ),
        result = []

    for( let i = 0; i < 11; i++ ) {
      out()
      result.push( parseFloat( gen.out[0].toFixed( 6 ) ) )
    }

    assert.deepEqual( result, answer )
  })
})
