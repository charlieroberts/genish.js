/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var mix = genlib.mix

describe( 'mix', () => {
  it( 'should output .5 given mix(0,2,.25)', ()=> {
    let answer = .5,
        graph = mix( 0,2,.25 ),
        out = gen.createCallback( graph )

    out()

    assert.equal( gen.out[0], answer )
  })
})
