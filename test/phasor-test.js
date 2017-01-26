/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var phasor = genlib.phasor

describe( 'phasor', ()=>{
  it( 'should ramp to 0 with an frequency of 4410 after five executions', ()=> {
    let answer = 0,
        graph  = phasor( 4410 ),
        out    = gen.createCallback( graph, 512 ),
        result = 0

    for( let i = 0; i < 5; i++ ) out()

    result = out().toFixed( 2 )

    assert.equal( result, answer )
  })
})
