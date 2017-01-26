'use strict'

/**
 * Calculates the arccosine of the input (interpreted as radians) using
 * Javascript's `Math.acos()` function
 *
 * __Category:__ trigonometry
 * @name acos
 * @function
 * @param {(ugen|number)} radians
 * @return {ugen}
 */

let gen  = require('./gen.js')

let proto = {
  basename:'acos',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'acos': Math.acos })

      out = `gen.acos( ${inputs[0]} )`

    } else {
      out = Math.acos( parseFloat( inputs[0] ) )
    }

    return out
  }
}

module.exports = x => {
  let acos = Object.create( proto )

  acos.inputs = [ x ]
  acos.id = gen.getUID()
  acos.name = `${acos.basename}{acos.id}`

  return acos
}
