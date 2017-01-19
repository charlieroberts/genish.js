'use strict'

/**
 * Calculates the tangent of the input (interpreted as radians) using
 * Javascript's `Math.tan()` function
 *
 * @name tan
 * @function
 * @param {(ugen|number)} radians
 * @return {ugen}
 * @memberof module:trigonometry
 */

let gen  = require('./gen.js')

let proto = {
  basename:'tan',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'tan': Math.tan })

      out = `gen.tan( ${inputs[0]} )`

    } else {
      out = Math.tan( parseFloat( inputs[0] ) )
    }

    return out
  }
}

module.exports = x => {
  let tan = Object.create( proto )

  tan.inputs = [ x ]
  tan.id = gen.getUID()
  tan.name = `${tan.basename}{tan.id}`

  return tan
}
