'use strict'

/**
 * Creates an envelope with an attack and a decay stage, both measured in samples.
 *
 * #### Properties
 * - `shape` *string* ('linear' or 'exponential', default 'exponental') determines the shape of the attack / decay.
 * - `alpha` *number* (default 5) An extra number used to determine windowing. In the case of 'exponential' envelopes, this determines the amount of curvature in the envelope. For 'linear' envelopes this number has no effect.
 *
 * #### Methods
 * - `trigger`: Re-trigger the envelope.
 * - `isComplete`: test if the envelope is completed
 *
 * @name ad
 * @function
 * @param {(ugen|number)} attackTime - Attack time measured in samples, defaults to 44100.
 * @param {(ugen|number)} decayTime - Decay time measured in samples, defaults to 44100.
 * @param {Object} [props = { shape: 'exponential', alpha: 5 }] - the initial property values
 * @return {ugen}
 * @example
 * myenv = ad( 44, 88200 )
 * play(
 *   mul( myenv, cycle( 330 ) )
 * )
 * // wait some time for decay and then run to re-trigger
 * myenv.trigger()
 *
 * @memberof module:envelope
 */

let gen      = require( './gen.js' ),
    mul      = require( './mul.js' ),
    sub      = require( './sub.js' ),
    div      = require( './div.js' ),
    data     = require( './data.js' ),
    peek     = require( './peek.js' ),
    accum    = require( './accum.js' ),
    ifelse   = require( './ifelseif.js' ),
    lt       = require( './lt.js' ),
    bang     = require( './bang.js' ),
    env      = require( './env.js' ),
    add      = require( './add.js' ),
    poke     = require( './poke.js' ),
    neq      = require( './neq.js' ),
    and      = require( './and.js' ),
    gte      = require( './gte.js' ),
    memo     = require( './memo.js' )

module.exports = ( attackTime = 44100, decayTime = 44100, _props ) => {
  let _bang = bang(),
      phase = accum( 1, _bang, { max: Infinity, shouldWrap:false, initialValue:-Infinity }),
      props = Object.assign({}, { shape:'exponential', alpha:5 }, _props ),
      bufferData, decayData, out, buffer

    //console.log( 'attack time:', attackTime, 'decay time:', decayTime )
  let completeFlag = data( [0] )

  // slightly more efficient to use existing phase accumulator for linear envelopes
  if( props.shape === 'linear' ) {
    out = ifelse(
      and( gte( phase, 0), lt( phase, attackTime )),
      memo( div( phase, attackTime ) ),

      and( gte( phase, 0),  lt( phase, add( attackTime, decayTime ) ) ),
      sub( 1, div( sub( phase, attackTime ), decayTime ) ),

      neq( phase, -Infinity),
      poke( completeFlag, 1, 0, { inline:0 }),

      0
    )
  } else {
    bufferData = env( 1024, { type:props.shape, alpha:props.alpha })
    out = ifelse(
      and( gte( phase, 0), lt( phase, attackTime )),
      peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ),

      and( gte(phase,0), lt( phase, add( attackTime, decayTime ) ) ),
      peek( bufferData, sub( 1, div( sub( phase, attackTime ), decayTime ) ), { boundmode:'clamp' }),

      neq( phase, -Infinity),
      poke( completeFlag, 1, 0, { inline:0 }),

      0
    )
  }

  out.isComplete = ()=> gen.memory.heap[ completeFlag.memory.values.idx ]

  out.trigger = ()=> {
    gen.memory.heap[ completeFlag.memory.values.idx ] = 0
    _bang.trigger()
  }

  return out
}
