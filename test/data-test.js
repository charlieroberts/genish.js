/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var data = genlib.data
var peek = genlib.peek

describe( 'data + peek', ()=>{
  it( 'should return the value of index data[2] (49) when requesting it via peek', ()=> {
    let answer = 49,
        d = data( [0,0,49] ),
        p = peek( d, 2, { mode:'samples' }),
        out = gen.createCallback( p, 16  )

    out()

    assert.equal( gen.out[0], answer )
  })

  it( 'should return the value of 49 when indexing uisng phase w/ peek', ()=> {
    let answer = 49,
        _d = new Float32Array( 512 ),
        d,p,out,result

    _d[2] = 49
    
    // XXX somehow this is indexing _d[1] instead of _d[2]...
    // uncommenting the line below makes this test pass
    //_d[1] = 49
  
    d = data( _d )
    p = peek( d, .00390625, { mode:'phase', interp:'none' } ) //.00390625 is phase for index[2] if 512 data length
    out = gen.createCallback( p, 2048 )

    out()

    assert.equal( gen.out[0], answer )
  })
})
