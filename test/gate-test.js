/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var add = genlib.add
var mul = genlib.mul
var gate = genlib.gate
var counter = genlib.counter

describe( 'gate', ()=> {
  it( 'should generate output of 0,1,4,9 changing outputs if an counter is passed to both control and input signal and multiplied by itself', ()=> {
    let answer = [ 0,1,4,9 ],
        c = counter(),
        g = gate( c,c, {count:4} ),
        graph = add( mul(g.outputs[0],g.outputs[0]), mul(g.outputs[1],g.outputs[1]), mul(g.outputs[2],g.outputs[2]), mul(g.outputs[3],g.outputs[3] ) ),
        out    = gen.createCallback( graph, 512 ),
        result = []

    result.push( out() ); result.push( out() ); result.push( out() ); result.push( out() );

    assert.deepEqual( result, answer )
  })
})
