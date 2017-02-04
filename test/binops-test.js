/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var add = genlib.add
var sub = genlib.sub
var mul = genlib.mul
var div = genlib.div

describe( 'binops', ()=> {
  it( 'should add 4 and 7 to get 11', ()=> {
    let answer = 11,
        graph = add( 4,7 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should sub 4 and 7 to get -3', ()=> {
    let answer = -3,
        graph = sub( 4,7 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should multiply 4 and 7 to get 28', ()=> {
    let answer = 28,
      graph = mul( 4,7 ),
      out = gen.createCallback( graph ),
      result = out()

    assert.equal( result, answer )
  })

  it( 'should divide 49 and 7 to get 7', ()=> {
    let answer = 7,
      graph = div( 49,7 ),
      out = gen.createCallback( graph ),
      result = out()

    assert.equal( result, answer )
  })

})
