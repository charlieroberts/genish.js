'use strict'

/**
 * Rounds input up to nearest integer using Javascript's `Math.ceil()` function
 *
 * __Category:__ numeric
 * @name ceil
 * @function
 * @param {(ugen|number)} value
 * @return {ugen}
 */

let gen  = require('./gen.js')

let proto = {
  name:'ceil',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.ceil })

      out = `gen.ceil( ${inputs[0]} )`

    } else {
      out = Math.ceil( parseFloat( inputs[0] ) )
    }

    return out
  }
}

module.exports = x => {
  let ceil = Object.create( proto )

  ceil.inputs = [ x ]

  return ceil
}
