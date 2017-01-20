/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var gt = genlib.gt
var gtp = genlib.gtp
var lt = genlib.lt
var ltp = genlib.ltp
var max = genlib.max
var min = genlib.min

describe( 'compare', ()=> {

  it( 'should return 1 for gt(1,0)', ()=> {
    let answer = 1,
        graph = gt(1,0),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should return 0 for lt(1,0)', ()=> {
    let answer = 0,
        graph = lt(1,0),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should return .5 for ltp(.5,1)', ()=> {
    let answer = .5,
        graph = ltp( .5,1 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should return 2 for gtp(2,1)', ()=> {
    let answer = 2,
        graph = gtp( 2,1 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should return 4 for max(2,4)', ()=> {
    let answer = 4,
        graph = max(2,4),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should return 2 for min(2,4)', ()=> {
    let answer = 2,
        graph = min(2,4),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

})
