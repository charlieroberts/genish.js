/* gen.tests.js
 *
 * This file is for testing the functionality of the gen.js library.
 *
 * To run: mocha gen.tests.js
 *
 * ... after installing all necessary dependencies by running npm install in the
 * top level of the genish.js repo.
 *
 */


'use strict'

let assert = require('assert'),
    genlib = require( '../dist/index.js' ), 
    abs = genlib.abs,
    gen = genlib.gen,
    mul = genlib.mul,
    add = genlib.add,
    param = genlib.param,
    accum = genlib.accum,
    sin   = genlib.sin

describe( 'gen', ()=> {
  it( 'should get back two numbers when fetching the arguments from an add ugen', ()=> {
    let answer = [5,3],
        graph  = add(5,3),
        result = gen.getInputs( graph )

    assert.deepEqual( result, answer )
  })
  it( 'should generate unique ids', ()=> {
    let answer = gen.getUID(),
        result = gen.getUID()

    assert.notEqual( result, answer )
  })
})

describe( 'monops', ()=> {
  it( 'should generate the absolute value of -.5 as .5', ()=> {
    let answer = .5,
        graph = abs( -.5 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of 0 for sin(0)', ()=> {
    let answer = 0,
        graph = sin( 0 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of 1 for sin( PI/2 )', ()=> {
    let answer = 1,
        graph = sin( Math.PI * .5 ),
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

describe( 'complex', ()=> {
  it( 'should add 5 and 2, multiply that by -7, and calculate the absolute value (49)', ()=> {
    let answer = 49,
        graph  = abs( mul( add(5,2), -7 ) ),
        out    = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should create a sine wave', ()=> {
    let frequency = param(),
        phasor    = accum( mul( frequency, 1/44100 ) ),
        oscgraph  = sin( mul( phasor, Math.PI * 2 ) ), 
        osc       = gen.createCallback( oscgraph ),
        answer = [
          0.3353173459027643,
          0.6318084552474613,
          0.8551427630053461,
          0.9794604955306667,
          0.9903669614948382,
          0.8865993063730001,
          0.6801727377709197,
          0.3949892902309387,
          0.06407021998071323,
          -0.27426751067492994
       ],
       result = []
    
    for( let i = 0; i < 10; i++ ) result[i] = osc(2400) 
    
    assert.deepEqual( result, answer )
  })
})
