'use strict'

/**
 * Calculates the cosine of the input (interpreted as radians) using
 * Javascript's `Math.cos()` function
 *
 * @name cos
 * @function
 * @param {(ugen|number)} radians
 * @return {ugen}
 * @memberof module:trigonometry
 */

let gen  = require('./gen.js')

let proto = {
  basename:'cos',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'cos': Math.cos })

      out = `gen.cos( ${inputs[0]} )`

    } else {
      out = Math.cos( parseFloat( inputs[0] ) )
    }

    return out
  }
}

module.exports = x => {
  let cos = Object.create( proto )

  cos.inputs = [ x ]
  cos.id = gen.getUID()
  cos.name = `${cos.basename}{cos.id}`

  return cos
}
