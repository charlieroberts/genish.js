'use strict'

let assert = require('assert'),
    genlib = require( './dist/index.js' ), 
    abs = genlib.abs,
    gen = genlib.gen,
    mul = genlib.mul,
    add = genlib.add,
    param = genlib.param


describe( 'monops', ()=> {

  it( 'should generate the absolute value of -.5 as .5', ()=> {

    let answer = .5,
        graph = abs( -.5 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

})

describe( 'binnops', ()=> {

  it( 'should add 4 and 7 to get 11', ()=> {

    let answer = 11,
        graph = add( 4,7 ),
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

})

describe( 'params', ()=> {
  it( 'should return the first argument of 42', ()=> {
    let answer = 42,
        graph = param(),
        out   = gen.createCallback( graph ),
        result = out( 42 )
    
    assert( result, answer )
  })

})

describe( 'complex', ()=> {
  it( 'should add 5 and 2, multiply that by -7, and calculate the absolute value (49)', ()=> {
    let answer = 49,
        graph  = abs( mul( add(5,2), -7 ) ),
        out    = gen.createCallback( graph ),
        result = out()

    assert( result, answer )
  })
})
