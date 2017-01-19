'use strict'

/**
 * Find the absolute value of a signal using `Math.abs`
 *
 * @name abs
 * @function
 * @param {(number|ugen)} signal
 * @return ugen
 * @memberof module:arithmetic
 */

let gen  = require('./gen.js')

let proto = {
  name:'abs',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.abs })

      out = `gen.abs( ${inputs[0]} )`

    } else {
      out = Math.abs( parseFloat( inputs[0] ) )
    }

    return out
  }
}

module.exports = x => {
  let abs = Object.create( proto )

  abs.inputs = [ x ]

  return abs
}
