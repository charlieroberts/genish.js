'use strict'

let assert = require('assert'),
    genlib = require( './dist/index.js' ), 
    abs = genlib.abs,
    gen = genlib.gen,
    mul = genlib.mul,
    add = genlib.add,
    param = genlib.param,
    accum = genlib.accum


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
    
    assert.equal( result, answer )
  })

})

describe( 'complex', ()=> {
  it( 'should add 5 and 2, multiply that by -7, and calculate the absolute value (49)', ()=> {
    let answer = 49,
        graph  = abs( mul( add(5,2), -7 ) ),
        out    = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })
})

describe( 'accum', ()=>{
  it( 'should ramp to .5 with an increment of .1 after five executions', ()=> {
    let answer = .5,
        graph  = accum(.1),
        out    = gen.createCallback( graph ),
        result = 0
    
    for( let i = 0; i < 4; i++ ) out()
    
    result = out()
    
    assert.equal( result, answer )
  })

  it( 'should return to its min value of 0 on the 11th execution with an increment of .1', ()=> {
    let answer = 0,
        graph  = accum(.1),
        out    = gen.createCallback( graph ),
        result = 0
    
    for( let i = 0; i < 10; i++ ) out()

    result = out()
    assert.equal( result, answer )
  })

  it( 'should return to its min value of 0 when the inputs[1] = true', ()=> {
    let answer = .0,
        graph  = accum( .1, param() ),
        out    = gen.createCallback( graph ),
        result = 0

    out(); out(); out();

    result = out( 1 )

    assert.equal( result, answer )
  })
})
