'use strict'

/**
 * Returns 1 for positive input and -1 for negative input. Zero returns itself.
 * Uses JavaScript's `Math.sign()` function.
 *
 * __Category:__ numeric
 * @name sign
 * @function
 * @param {(ugen|number)} value
 * @return {ugen}
 */

let gen  = require('./gen.js')

let proto = {
  name:'sign',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.sign })

      out = `gen.sign( ${inputs[0]} )`

    } else {
      out = Math.sign( parseFloat( inputs[0] ) )
    }

    return out
  }
}

module.exports = x => {
  let sign = Object.create( proto )

  sign.inputs = [ x ]

  return sign
}
