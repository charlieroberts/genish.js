'use strict'

/**
 * Creates an envelope with attack, decay, sustatin and release stages, with
 * each duration measured in samples. Envelopes can automatically advance
 * through their entirety (default behavior) or can stop at the sustain stage
 * and what for a command to advance by setting the `triggerRelease` property to
 * a value of `1`.

 * #### Properties
 * - `shape` *string* (default 'exponental') determines the shape of the attack / decay / release.
 * - `alpha` *number* (default 5) An extra number used to determine windowing. In the case of 'exponential' envelopes, this determines the amount of curvature in the envelope. For 'linear' envelopes this number has no effect.
 * - `triggerRelease` *boolean* (default false) This property determines if the envelope waits for a `release()` message before terminating the sustain segment and advancing to the release segment. By setting this value to `1`, you can easily script release of the envelope to depend on user interaction. When `releaseTrigger` is true, the `sustainTime` input has no effect on envelope.
 *
 * #### Methods
 * - `trigger`: Re-trigger the envelope.
 * - `release`: Move from the sustain stage to the release stage of the envelope. This method only has effect if the `triggerRelease` property to set to `true` on instantiation. Note that calling this method will not skip attack or decay stages... if called during the attack or decay stage the envelope will simply bypass the sustain stage and continue straight to the release after the decay is completed.
 *
 * __Category:__ envelope
 * @name adsr
 * @function
 * @param {ugen|number} [attackTime] Attack time measured in samples, defaults to `gen.samplerate / 1000` (one ms).
 * @param {ugen|number} [decayTime] Decay time measured in samples, defaults to `gen.samplerate / 2` (half a second).
 * @param {ugen|number} [sustainTime] Sustain time measured in samples, defaults to `gen.samplerate` (one second).
 * @param {ugen|number} [sustainLevel] Each stage of the envelope is controlled via a wavetable; the sustainLevel property dictates at one point in the wavetable the envelope rests before releasing. Thus, a value of .5 does not mean that the output of the envelope during sustain will be .5 (unless enveloping for the adsr is linear)... it will instead depend on the type enveloping used. Default is .6.
 * @param {ugen|number} [releaseTime] Release time measured in samples, defaults to `gen.samplerate` (one second).
 * @example
 * myenv = adsr( 44, 22050, 22050, .6, 44100, { releaseTrigger:true })
 * play(
 *   mul( myenv, cycle( 330 ) )
 * )
 * // wait until sustain and then run next line to release
 * myenv.release()
 * // re-trigger
 * myenv.retrigger()
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
    param    = require( './param.js' ),
    add      = require( './add.js' ),
    gtp      = require( './gtp.js' ),
    not      = require( './not.js' )

module.exports = ( attackTime=44, decayTime=22050, sustainTime=44100, sustainLevel=.6, releaseTime=44100, _props ) => {
  let envTrigger = bang(),
      phase = accum( 1, envTrigger, { max: Infinity, shouldWrap:false }),
      shouldSustain = param( 1 ),
      defaults = {
         shape: 'exponential',
         alpha: 5,
         triggerRelease: false,
      },
      props = Object.assign({}, defaults, _props ),
      bufferData, decayData, out, buffer, sustainCondition, releaseAccum, releaseCondition

  // slightly more efficient to use existing phase accumulator for linear envelopes
  //if( props.shape === 'linear' ) {
  //  out = ifelse(
  //    lt( phase, props.attackTime ), memo( div( phase, props.attackTime ) ),
  //    lt( phase, props.attackTime + props.decayTime ), sub( 1, mul( div( sub( phase, props.attackTime ), props.decayTime ), 1-props.sustainLevel ) ),
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime ),
  //      props.sustainLevel,
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime + props.releaseTime ),
  //      sub( props.sustainLevel, mul( div( sub( phase, props.attackTime + props.decayTime + props.sustainTime ), props.releaseTime ), props.sustainLevel) ),
  //    0
  //  )
  //} else {
    bufferData = env( 1024, { type:props.shape, alpha:props.alpha } )

    sustainCondition = props.triggerRelease
      ? shouldSustain
      : lt( phase, add( attackTime, decayTime, sustainTime ) )

    releaseAccum = props.triggerRelease
      ? gtp( sub( sustainLevel, accum( div( sustainLevel, releaseTime ) , 0, { shouldWrap:false }) ), 0 )
      : sub( sustainLevel, mul( div( sub( phase, add( attackTime, decayTime, sustainTime ) ), releaseTime ), sustainLevel ) ),

    releaseCondition = props.triggerRelease
      ? not( shouldSustain )
      : lt( phase, add( attackTime, decayTime, sustainTime, releaseTime ) )

    out = ifelse(
      // attack
      lt( phase,  attackTime ),
      peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ),

      // decay
      lt( phase, add( attackTime, decayTime ) ),
      peek( bufferData, sub( 1, mul( div( sub( phase,  attackTime ),  decayTime ), sub( 1,  sustainLevel ) ) ), { boundmode:'clamp' }),

      // sustain
      sustainCondition,
      peek( bufferData,  sustainLevel ),

      // release
      releaseCondition, //lt( phase,  attackTime +  decayTime +  sustainTime +  releaseTime ),
      peek(
        bufferData,
        releaseAccum,
        //sub(  sustainLevel, mul( div( sub( phase,  attackTime +  decayTime +  sustainTime),  releaseTime ),  sustainLevel ) ),
        { boundmode:'clamp' }
      ),

      0
    )
  //}

  out.trigger = ()=> {
    shouldSustain.value = 1
    envTrigger.trigger()
  }

  out.release = ()=> {
    shouldSustain.value = 0
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    gen.memory.heap[ releaseAccum.inputs[0].inputs[1].memory.value.idx ] = 0
  }

  return out
}
