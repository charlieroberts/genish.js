'use strict'

/**
 * Rounds input down to nearest integer by performing a bitwise or with 0.
 *
 * __Category:__ numeric
 * @name floor
 * @function
 * @param {(ugen|number)} a
 * @return {ugen}
 * @example
 * out = gen.createCallback( round( in() ) )
 * // creates function body: out = ( in1 | 0 )
 */

let gen  = require('./gen.js')

let proto = {
  name:'floor',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      //gen.closures.add({ [ this.name ]: Math.floor })

      out = `( ${inputs[0]} | 0 )`

    } else {
      out = inputs[0] | 0
    }

    return out
  }
}

module.exports = x => {
  let floor = Object.create( proto )

  floor.inputs = [ x ]

  return floor
}
