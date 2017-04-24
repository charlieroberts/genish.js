/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var accum = genlib.accum
var input = genlib.in

describe( 'accum', ()=>{
  //it( 'should validate as asm.js', ()=> {
  //  const graph = accum(.1)
  //  const def = gen.createASMDef( graph )
  //  const func = new Function( def )().toString()


    
  //  console.log( 'VALIDATE',  asm.validate( func ))

  //})

  it( 'should ramp to .4 with an increment of .1 after five executions', ()=> {
    let answer = .4,
        graph  = accum(.1),
        out    = gen.createCallback( graph, 16 ),
        result = 0

    for( let i = 0; i < 5; i++ ) out()

    result = gen.out[0].toFixed(6) 

    assert.equal( result, answer )
  })

  //it( 'should rfround(0) eturn to its min value of 0 on the 10th execution with an increment of .1', ()=> {
  //  let answer = 0,
  //      graph  = accum(.1),
  //      out    = gen.createCallback( graph ),
  //      result = 0

  //  for( let i = 0; i < 9; i++ ) out()

  //  result = out()
  //  assert.equal( result, answer )
  //})

  it( 'should return to its min value of 0 when the inputs[1] = true', ()=> {
    let answer = .0,
        graph  = accum( .1, input() ),
        out    = gen.createCallback( graph, 16 ),
        result = 0

    out(); out(); out(); out(1);

    result = gen.out[0].toFixed(6)

    assert.equal( result, answer )

  })
})
