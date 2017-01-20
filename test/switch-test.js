/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var ternary = genlib.switch
var input = genlib.in

describe( 'switch', ()=> {
  it( 'should generate ouput of 0,1 given switch( in(), 0, 1 ) -> (1), (0)', ()=> {
    let answer = [ 0,1 ],
        graph  = ternary( input(), 0, 1 ),
        out    = gen.createCallback( graph ),
        result = []

    result.push( out( 1 ) ); result.push( out( 0 ) )

    assert.deepEqual( result, answer )
  })
})
