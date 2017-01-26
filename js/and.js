'use strict'

/**
 * Returns 1 if both inputs do not equal 0.
 *
 * __Category:__ logic
 * @name and
 * @function
 * @param {(ugen|Number)} a - input signal
 * @param {(ugen|Number)} b - input signal
 * @return {ugen}
 */

let gen = require( './gen.js' )

let proto = {
  basename:'and',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = `  var ${this.name} = (${inputs[0]} !== 0 && ${inputs[1]} !== 0) | 0\n\n`

    gen.memo[ this.name ] = `${this.name}`

    return [ `${this.name}`, out ]
  },

}

module.exports = ( in1, in2 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ in1, in2 ],
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
