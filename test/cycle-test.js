/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var cycle = genlib.cycle

describe( 'cycle', ()=> {
  it( 'should be at 0 after five outputs at 11025 hz', ()=> {
    let answer = 0,
        c = cycle( 11025 ),
        out = gen.createCallback( c, 2048 ),
        result = []

    for( let i = 0; i < 5; i++ ) result[i] = out()
    assert.equal( result[4], answer )
  })

  it( 'should generate values in the range {-1,1} over 2000 samples', ()=> {
    let storage = [],
        c = cycle( 440 ),
        out = gen.createCallback( c,2048 ),
        outputMin, outputMax

    for( let i = 0; i < 2000; i++ ) storage[i] = out()

    outputMin = Math.min.apply( null, storage )
    outputMax = Math.max.apply( null, storage )

    //console.log( '  ', outputMin, outputMax )
    assert( (outputMin <= -.99 && outputMin >= -1.0001) && (outputMax >= .99 && outputMax <= 1.0001) )
  })
})
