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

  it( 'should return the value of 2 when peeking into an array of {0,512} at a sampling rate of 512 and a phase of 2 * (1/512) w/ peek', ()=> {
    const arraySize = 512
    const answer = 2,
          dataArray = new Float32Array( arraySize )

    let p,out,result, sampleIncrement, phase

    for( let i = 0; i < arraySize; i++ ) { dataArray[i] = i }
    
    sampleIncrement = 1 / arraySize
    phase = 2 * sampleIncrement

    p = peek( data( dataArray ), phase, { mode:'phase', interp:'none' } ) 
    
    out = gen.createCallback( p )

    out()

    assert.equal( gen.out[0], answer )
  })
})
