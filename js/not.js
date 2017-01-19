'use strict'

/**
 * An input of 0 returns 1 while all other values return 0.
 * @name not
 * @function
 * @param {(ugen|number)} signal - the input signal
 * @return {ugen}
 * @memberof module:logic
 * @example
 * y = x !== 0 ? 0 : 1
 */

let gen  = require('./gen.js')

let proto = {
  name:'not',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( this.inputs[0] ) ) {
      out = `( ${inputs[0]} === 0 ? 1 : 0 )`
    } else {
      out = !inputs[0] === 0 ? 1 : 0
    }

    return out
  }
}

module.exports = x => {
  let not = Object.create( proto )

  not.inputs = [ x ]

  return not
}
