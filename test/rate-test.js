/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var rate = genlib.rate
var phasor = genlib.phasor

describe( 'rate', ()=>{
  it( 'should cause a phasor with an frequency of 4410 to ramp to -.5 after five executions instead of 0', ()=> {
    let answer = -.5,
        graph  = rate( phasor( 4410 ), .5 ),
        out    = gen.createCallback( graph, 512 ),
        result = 0

    for( let i = 0; i < 6; i++ ) out()

    result = parseFloat( gen.out[0].toFixed( 2 ) )

    assert.equal( result, answer )
  })
})


//describe( 'rate', ()=> {
//  it( 'should cycle 4 times over  given a phasor with a frequency of 1 and a scaling value of .25' , ()=> {
//    let answer = [.1,.1,.1,.1,.1,.1,.1,.1,.1,.1,-.9],
//    d1 = delta( accum(.1) ),
//    out = gen.createCallback( d1 ),
//    result = []

//    for( let i = 0; i < 11; i++ ) result.push( parseFloat( out().toFixed( 6 ) ) )

//    assert.deepEqual( result, answer )
//  })
//})
