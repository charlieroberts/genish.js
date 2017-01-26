'use strict'

/**
 * Converts signals to either 0 or 1. If the input signal does not equal 0 then
 * output is 1; if input == 0 then output 0. Roughly equivalent to the following
 * pseudocode:
 *
 * __Category:__ logic
 * @name bool
 * @function
 * @param {(ugen|Number)} signal - the input signal
 * @return {ugen}
 * @example
 * y = x !== 0 ? 1 : 0
 */

let gen = require( './gen.js' )

let proto = {
  basename:'bool',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = `${inputs[0]} === 0 ? 0 : 1`

    //gen.memo[ this.name ] = `gen.data.${this.name}`

    //return [ `gen.data.${this.name}`, ' ' +out ]
    return out
  }
}

module.exports = ( in1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, {
    uid:        gen.getUID(),
    inputs:     [ in1 ],
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
