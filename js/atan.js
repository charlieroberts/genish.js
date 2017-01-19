'use strict'

/**
 * Calculates the arctangent of the input (interpreted as radians) using
 * Javascript's `Math.atan()` function
 *
 * @name atan
 * @function
 * @param {(ugen|number)} radians
 * @return {ugen}
 * @memberof module:trigonometry
 */

let gen  = require('./gen.js')

let proto = {
  basename:'atan',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'atan': Math.atan })

      out = `gen.atan( ${inputs[0]} )`

    } else {
      out = Math.atan( parseFloat( inputs[0] ) )
    }

    return out
  }
}

module.exports = x => {
  let atan = Object.create( proto )

  atan.inputs = [ x ]
  atan.id = gen.getUID()
  atan.name = `${atan.basename}{atan.id}`

  return atan
}
