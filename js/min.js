'use strict'

/**
 * Returns whichever value is lesser.
 *
 * __Category:__ comparison
 * @name eq
 * @function
 * @param {(ugen|number)} a - one element to compare
 * @param {(ugen|number)} b - other element to compare
 * @return {ugen}
 */

let gen  = require('./gen.js')

let proto = {
  name:'min',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ [ this.name ]: Math.min })

      out = `gen.min( ${inputs[0]}, ${inputs[1]} )`

    } else {
      out = Math.min( parseFloat( inputs[0] ), parseFloat( inputs[1] ) )
    }

    return out
  }
}

module.exports = (x,y) => {
  let min = Object.create( proto )

  min.inputs = [ x,y ]

  return min
}
