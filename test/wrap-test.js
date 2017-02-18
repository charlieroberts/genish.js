/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var wrap = genlib.wrap
var accum = genlib.accum

describe( 'wrap', () => {
  it( 'should not let an accum with a max of 1000 travel past 1', ()=> {
    let max = 1,
        storage = [],
        acc = accum( .5, 0, 0, 100 ),
        graph = wrap( acc, 0, max ),
        out = gen.createCallback( graph, 512 ),
        result

    for( let i = 0; i < 20; i++ ) {
      out()
      storage[ i ] = gen.out[0]
    }

    result = Math.max.apply( null, storage )

    assert( result < max )

  })
})
