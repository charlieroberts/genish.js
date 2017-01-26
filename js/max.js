'use strict'

/**
 * Returns whichever value is greater.
 *
 * __Category:__ comparison
 * @name max
 * @function
 * @param {(ugen|number)} a - one element to compare
 * @param {(ugen|number)} b - other element to compare
 * @return {ugen}
 */

let gen  = require('./gen.js')

let proto = {
  name:'max',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ [ this.name ]: Math.max })

      out = `gen.max( ${inputs[0]}, ${inputs[1]} )`

    } else {
      out = Math.max( parseFloat( inputs[0] ), parseFloat( inputs[1] ) )
    }

    return out
  }
}

module.exports = (x,y) => {
  let max = Object.create( proto )

  max.inputs = [ x,y ]

  return max
}
