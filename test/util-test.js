/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var mtof = genlib.mtof

describe( 'monops', ()=> {
  it( 'should convert midi value 69 to 440 (hz, default tuning)', ()=> {
    let answer = 440,
        graph  = mtof( 69 ),
        out    = gen.createCallback( graph )

    out()

    assert.equal( answer, gen.out[0] )
  })
})
