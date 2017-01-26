'use strict'

/**
 * Calculates the arcsine of the input (interpreted as radians) using
 * Javascript's `Math.asin()` function
 *
 * __Category:__ trigonometry
 * @name asin
 * @function
 * @param {(ugen|number)} radians
 * @return {ugen}
 */

let gen  = require('./gen.js')

let proto = {
  basename:'asin',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'asin': Math.asin })

      out = `gen.asin( ${inputs[0]} )`

    } else {
      out = Math.asin( parseFloat( inputs[0] ) )
    }

    return out
  }
}

module.exports = x => {
  let asin = Object.create( proto )

  asin.inputs = [ x ]
  asin.id = gen.getUID()
  asin.name = `${asin.basename}{asin.id}`

  return asin
}
