'use strict'

/**
 * genish.js creates optimized audio callback functions; the `input` ugen
 * creates a argument to a genish callback function that can be manipulated. For
 * example, if we wanted a sine oscillator that let us control its frequency and
 * amplitude, we could use:
 *
 * @name input
 * @function
 * @example
 * frequency = input()
 * gain = input()
 * osc = mul( cycle( frequency ), gain )
 * callback = gen.createCallback( osc )
 * // one sample of output with a 440 Hz frequency, .5 gain
 * callback( 440, .5 )
 * // another sample using 220 Hz frequency, .25 gain
 * callback( 220, .25 )
 * @memberof module:control
 */

let gen = require('./gen.js')

let proto = {
  basename:'in',

  gen() {
    gen.parameters.push( this.name )

    gen.memo[ this.name ] = this.name

    return this.name
  }
}

module.exports = ( name ) => {
  let input = Object.create( proto )

  input.id   = gen.getUID()
  input.name = name !== undefined ? name : `${input.basename}${input.id}`
  input[0] = {
    gen() {
      if( ! gen.parameters.includes( input.name ) ) gen.parameters.push( input.name )
      return input.name + '[0]'
    }
  }
  input[1] = {
    gen() {
      if( ! gen.parameters.includes( input.name ) ) gen.parameters.push( input.name )
      return input.name + '[1]'
    }
  }


  return input
}
