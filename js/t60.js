'use strict'

/**
 * `t60` provides a multiplier that, when applied to a signal every sample,
 * fades it by 60db (at which point it is effectively inaudible). Although the
 * example below shows `t60` in action, it would actually be much more efficient
 * to calculate t60 once since the time used (88200) is static.
 *
 * @name t60
 * @function
 * @param {ugen} fadeTime - The time (in samples) to fade 1 by 60 dB.
 * @example
 * lastsample = ssd(1)
 * // update fade with previous output * t60
 * // we could also use: Math.exp( -6.907755278921 / 88200 ) instead of t60( 88200 )
 * fade = mul( lastsample.out, t60( 88200 ) )
 * // record current value of fade
 * lastsample.in( fade )
 * play( mul( lastsample.out, cycle( 330 ) ) )
 * @memberof module:envelope
 */

let gen  = require('./gen.js')

let proto = {
  basename:'t60',

  gen() {
    let out,
        inputs = gen.getInputs( this ),
        returnValue

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ 'exp' ]: Math.exp })

      out = `  var ${this.name} = gen.exp( -6.907755278921 / ${inputs[0]} )\n\n`

      gen.memo[ this.name ] = out

      returnValue = [ this.name, out ]
    } else {
      out = Math.exp( -6.907755278921 / inputs[0] )

      returnValue = out
    }

    return returnValue
  }
}

module.exports = x => {
  let t60 = Object.create( proto )

  t60.inputs = [ x ]
  t60.name = proto.basename + gen.getUID()

  return t60
}
