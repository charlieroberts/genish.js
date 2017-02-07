/* global describe it */
// FIXME: extract non-arithmetic
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var sin = genlib.sin
var cos = genlib.cos
var tan = genlib.tan
var asin = genlib.asin
var acos = genlib.acos
var atan = genlib.atan
var mtof = genlib.mtof
var history = genlib.history
var t60 = genlib.t60
var mul = genlib.mul

describe( 'monops', ()=> {
  it( 'should generate a value of 0 for sin(0)', ()=> {
    let answer = 0,
        graph = sin( 0 ),
        out = gen.createCallback( graph )

    out()

    result = gen.out[0]

    assert.equal( result, answer )
  })

  it( 'should generate a value of 1 for sin( PI/2 )', ()=> {
    let answer = 1,
        graph = sin( Math.PI * .5 ),
        out = gen.createCallback( graph )

    out()

    assert.equal( gen.out[0], answer )
  })
  it( 'should generate a value of 1 for cos(0)', ()=> {
    let answer = 1,
        graph = cos( 0 ),
        out = gen.createCallback( graph )

    out()

    assert.equal( gen.out[0], answer )
  })

  it( 'should generate a value of 0 for cos( PI/2 )', ()=> {
    let answer = 0,
        graph = cos( Math.PI * .5 ),
        out = gen.createCallback( graph )
      
    out()

    assert.equal( parseFloat( get.out[0].toFixed(6) ), answer )
  })

  it( 'should generate a value of 0 for tan(0)', ()=> {
    let answer = 0,
        graph = tan( 0 ),
        out = gen.createCallback( graph )
    
    out()

    assert.equal( gen.out[0], answer )
  })

  it( 'should generate a value of 1 for tan( PI/4 )', ()=> {
    let answer = 1,
        graph = tan( Math.PI / 4 ),
        out = gen.createCallback( graph )
        
    out()  

    assert.equal( parseFloat( gen.out[0].toFixed(6) ), answer )
  })
  it( 'should generate a value of 0 for asin(0)', ()=> {
    let answer = 0,
        graph = asin( 0 ),
        out = gen.createCallback( graph )
      
    out()

    assert.equal( gen.out[0], answer )
  })

  it( 'should generate a value of PI/2 for asin( 1 )', ()=> {
    let answer = Math.PI * .5,
        graph = asin( 1 ),
        out = gen.createCallback( graph )
    
    out()

    assert.equal( gen.out[0], answer )
  })

  it( 'should generate a value of PI/2 for acos(0)', ()=> {
    let answer = Math.PI * .5,
        graph = acos( 0 ),
        out = gen.createCallback( graph )

    out()

    assert.equal( gen.out[0], answer )
  })

  it( 'should generate a value of 0 for acos( 1 )', ()=> {
    let answer = 0,
        graph = acos( 1 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of 0 for atan(0)', ()=> {
    let answer = 0,
        graph = atan( 0 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of PI/4 for atan( 1 )', ()=> {
    let answer = Math.PI / 4,
        graph = atan( 1 ),
        out = gen.createCallback( graph )
    
    out()

    assert.equal( gen.out[0], answer )
  })

  it( 'should fade 1 to .001 over 10 samples using t60(10)', ()=> {
    let answer = .001,
        x = history( 1 ),
        graph = x.in( mul( x.out, t60(10) ) ),
        out   = gen.createCallback( graph, 4096 ),
        result

    for( let i = 0 ; i < 10; i++ ) out()

    result = parseFloat( gen.out[0].toFixed( 4 ) )

    assert.equal( result, answer )
  })

  it( 'should convert midi value 69 to 440 (hz, default tuning)', ()=> {
    let answer = 440,
        graph  = mtof( 69 ),
        out    = gen.createCallback( graph )

    out()

    assert.equal( answer, gen.out[0] )
  })
})
