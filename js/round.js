'use strict'

/**
 * Rounds input up or down to nearest integer using Javascript's `Math.round()` function
 *
 * __Category:__ numeric
 * @name round
 * @function
 * @param {(ugen|number)} a
 * @return {ugen}
 */

let gen  = require('./gen.js')

let proto = {
  name:'round',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.round })

      out = `gen.round( ${inputs[0]} )`

    } else {
      out = Math.round( parseFloat( inputs[0] ) )
    }

    return out
  }
}

module.exports = x => {
  let round = Object.create( proto )

  round.inputs = [ x ]

  return round
}
