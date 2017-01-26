'use strict'

/**
 * Calculates the sine of the input (interepreted as radians) using Javascript's
 * `Math.sin()` function
 *
 * __Category:__ trigonometry
 * @name sin
 * @function
 * @param {(ugen|number)} radians
 * @return {ugen}
 */
let gen  = require('./gen.js')

let proto = {
  basename:'sin',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'sin': Math.sin })

      out = `gen.sin( ${inputs[0]} )`

    } else {
      out = Math.sin( parseFloat( inputs[0] ) )
    }

    return out
  }
}

module.exports = x => {
  let sin = Object.create( proto )

  sin.inputs = [ x ]
  sin.id = gen.getUID()
  sin.name = `${sin.basename}{sin.id}`

  return sin
}
