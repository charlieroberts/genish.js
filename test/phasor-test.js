/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var phasor = genlib.phasor

describe( 'phasor', ()=>{
  it( 'should ramp to 0 with an frequency of 4410 after six executions', ()=> {
    let answer = 0,
        graph  = phasor( 4410 ),
        out    = gen.createCallback( graph, 512 ),
        result

    for( let i = 0; i < 6; i++ ) out()

    result = parseFloat( gen.out[0].toFixed( 2 ) )

    assert.equal( result, answer )
  })
})
