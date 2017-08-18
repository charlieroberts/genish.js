/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var data  = genlib.data
var delay = genlib.delay
var peek  = genlib.peek
var accum = genlib.accum

describe( 'delay', ()=>{
  it( 'should return the value of the first input sample (1) after a delay of three samples.', ()=> {
    let answer = 1,
        p = peek( [1,0,0,0], accum( 1, 0, { min:0, max:3}), { mode:'samples' }),
        d = delay( p, 3 ),
        out = gen.createCallback( d.outputs[0], 1024 )
        result

    // three samples of delay  
    out(); out(); out(); 

    // ... and then the result
    result = out();

    assert.equal( result, answer )
  })

  it( 'should return a value of 1 on the second sample in the first output (tap), and 1 on the third sample of the second output', ()=> {
    let answer = [[0,0],[1,0],[0,1]],
        p = peek( [1,0,0], accum( 1, 0, { min:0, max:3}), { mode:'samples' }),
        d = delay( p, [1, 2] ),
        out = gen.createCallback( [ d.outputs[0], d.outputs[1] ], 1024, true ),
        result = []

    // three samples of delay  
    result.push( out().slice(0) )
    result.push( out().slice(0) )
    result.push( out().slice(0) )

    assert.deepEqual( result, answer )
  })
})
