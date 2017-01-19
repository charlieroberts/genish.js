/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var sah = genlib.sah
var noise = genlib.noise
var peek = genlib.peek
var accum = genlib.accum
var data = genlib.data

describe( 'sah', ()=> {
  it( 'should return the same value until told to sample', ()=> {
    let graph = sah( noise(), peek( data([1,0,1,0]), accum(1,0,{ max:4 }), {interp:'none', mode:'samples'} ) ),
        out   = gen.createCallback( graph, 512 ),

        result = []

    for( let i = 0; i < 4; i++ ) result[i] = out()

    assert( result[0] === result[1] && result[2] !== result[1]  )
  })


})
