/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var noise = genlib.noise

describe( 'noise', ()=> {
  it( 'should not return the same number', ()=> {
    let answer = -1,
        storage = [],
        graph = noise(),
        out   = gen.createCallback( graph ),
        result

    for( var i = 0; i < 256; i++ ) {
      out()
      var sample = gen.out[0]
      result = storage.indexOf( sample )
      if( result !== -1 ) break
      storage.push( sample )
    }

    assert.equal( result, answer )
  })
})
