/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var abs = genlib.abs
var round = genlib.round
var ceil = genlib.ceil
var sign = genlib.sign
var floor = genlib.floor

describe( 'monops', ()=> {
  it( 'should generate the absolute value of -.5 as .5', ()=> {
    let answer = .5,
        graph = abs( -.5 ),
        out = gen.createCallback( graph )

    out()

    assert.equal( gen.out[0], answer )
  })

  it( 'should round .75 to 1', ()=> {
    let answer = 1,
        graph = round( .75 ),
        out = gen.createCallback( graph )
        out()

    assert.equal( gen.out[0], answer )
  })

  it( 'should floor .75 to 0', ()=> {
    let answer = 0,
        graph = floor( .75 ),
        out = gen.createCallback( graph )

    out()

    assert.equal( gen.out[0], answer )
  })

  it( 'should ceil .25 to 1', ()=> {
    let answer = 1,
        graph = ceil( .25 ),
        out = gen.createCallback( graph )
    out()

    assert.equal( gen.out[0], answer )
  })

  it( 'should return -1 for sign(-1000)', ()=> {
    let answer = -1,
        graph = sign( -1000 ),
        out = gen.createCallback( graph )
    out()

    assert.equal( gen.out[0], answer )
  })
  it( 'should return 1 for sign(1000)', ()=> {
    let answer = 1,
        graph = sign( 1000 ),
        out = gen.createCallback( graph )
    out()

    assert.equal( gen.out[0], answer )
  })
})
