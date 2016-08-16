'use strict'

let gen     = require( './gen.js' ),
    mul     = require( './mul.js' ),
    sub     = require( './sub.js' ),
    data    = require( './data.js' ),
    peek    = require( './peek.js' ),
    accum   = require( './accum.js' ),
    ternary = require( './switch.js' )

module.exports = ( attackTime = 22050, decayTime = 22050 ) => {
  let phase = accum( 1, 0, { max: Infinity }),
      attackBuffer = new Float32Array( attackTime ),
      decayBuffer  = new Float32Array( decayTime ),
      attackData, decayData, out

  if( gen.globals.windows[ 't60attack' ] === undefined ) gen.globals.windows[ 't60attack' ] = {}
  if( gen.globals.windows[ 't60decay' ]  === undefined ) gen.globals.windows[ 't60decay' ] = {}
  
  if( gen.globals.windows[ 't60attack' ][ attackTime ] === undefined ) {
    let lastValue = 1, t60Time = Math.exp( -6.907755278921 / attackTime )
    for( let i = 0; i < attackTime; i++ ) {
      attackBuffer[ i ] = 1 - lastValue
      lastValue *= t60Time
    }

    gen.globals.windows[ 't60attack' ][ attackTime ] = attackData = data( attackBuffer )
  }

  if( gen.globals.windows[ 't60decay' ][ decayTime ] === undefined ) {
    let lastValue = 1, t60Time = Math.exp( -6.907755278921 / decayTime )
    for( let i = 0; i < decayTime; i++ ) {
      decayBuffer[ i ] = lastValue
      lastValue *= t60Time
    }

    gen.globals.windows[ 't60decay' ][ decayTime ] = decayData = data( decayBuffer )
  }

  out = ternary( lt( phase, attackTime ), peek( attackData, div( phase, attackTime ) ), peek( decayData, div( sub( phase, attackTime ), decayTime ) ) )

  return out
}
