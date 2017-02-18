/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var selector = genlib.selector
var input = genlib.in

describe( 'selector', ()=> {
  it( 'should generate ouput of 0,1,2 given selector( in(), 0, 1, 2 ) -> (0), (1), (2)', ()=> {
    let answer = [ 0,1,2 ],
        graph  = selector( input(), 0, 1, 2 ),
        out    = gen.createCallback( graph ),
        result = []

    out( 0 )
    result.push( gen.out[0] )
    out( 1 )
    result.push( gen.out[0] )
    out( 2 )
    result.push( gen.out[0] )

    assert.deepEqual( result, answer )
  })
})
