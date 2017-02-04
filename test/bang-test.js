/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var bang = genlib.bang

describe( 'bang', ()=> {
 it( 'should return 1 after triggering, zero at all other times', ()=> {
    let answer = [0,1,0],
        b = bang(),
        out = gen.createCallback( b ),
        result = []

    result.push( out() )
    b.trigger()
    result.push( out() )
    result.push( out() )

    assert.deepEqual( result, answer )

 })
})
