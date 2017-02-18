/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var fold = genlib.fold

describe( 'fold', ()=> {
  it( 'should generate a value of .75 given an input of 1.25, a min of 0 and a max of 1', ()=> {
    let answer = .75,
        graph = fold( 1.25 ),
        out = gen.createCallback( graph ),
        result

    out()
    result = gen.out[0]

    assert.equal( answer, result )
  })
})
