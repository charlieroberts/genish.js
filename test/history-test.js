/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var history = genlib.history
var add = genlib.add
var accum = genlib.accum
// 0 (+1) 1 (+2) 3 (+3) 6
describe( 'history', ()=> {
  it( 'should return 7 after recording an accum with an increment of 1 + history for four samples', ()=> {
    let answer = 7,
        h1 = history(),
        h1input = accum( add(1, h1.out ), 0, {min:0, max:10} ), out, result = []

    h1.in( h1input )
    out = gen.createCallback( h1input, 8 )

    for( let i = 0; i < 5; i++ ) result[i] = out()
    assert.equal( result[4], answer )
  })
})
