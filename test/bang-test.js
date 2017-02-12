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

    out(); result.push( gen.out[0] )
    
    b.trigger()
    out(); result.push( gen.out[0] )

    out(); result.push( gen.out[0] )

    assert.deepEqual( result, answer )
 })
})
