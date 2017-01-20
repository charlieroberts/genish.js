/* global describe it */
var assert = require('assert')
var genlib = require( '../dist/index.js' )

var gen = genlib.gen
var add = genlib.add
//gen.debug = true

describe( 'gen', ()=> {
  it( 'should get back two numbers when fetching the arguments from an add ugen', ()=> {
    let answer = [5,3],
        graph  = add(5,3),
        result = gen.getInputs( graph )

    assert.deepEqual( result, answer )
  })
  it( 'should generate unique ids', ()=> {
    let answer = gen.getUID(),
        result = gen.getUID()

    assert.notEqual( result, answer )
  })
})
