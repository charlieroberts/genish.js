/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var input = genlib.in

describe( 'in', ()=> {
  it( 'should return the first argument of 42', ()=> {
    let answer = 42,
        graph = input(),
        out   = gen.createCallback( graph ),
        result = out( 42 )

    assert.equal( result, answer )
  })
})
