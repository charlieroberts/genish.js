/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var dcblock = genlib.dcblock
var add = genlib.add
var cycle = genlib.cycle

describe( 'dcblock', ()=>{
  it( 'should filter offset of .5 to make signal range {-1,1} after >20000 samples', ()=> {
    let storage = [],
        graph  = dcblock( add( .5, cycle( 440 ) ) ),
        out    = gen.createCallback( graph, 2048, true ),
        outputMax, outputMin

    // let filter run for a bit
    for( let i = 0; i < 20000; i++ ) {
      out()
    }

    for( let i = 0; i < 1000; i++ ) {
      out()
      storage[ i ] = gen.out[ 0 ]
    }

    outputMax = Math.max.apply( null, storage )
    outputMin = Math.min.apply( null, storage )

    assert( outputMax <=1.1 && outputMin >= -1.1 )
  })
})
