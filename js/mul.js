'use strict'

/**
 * Multiples two number or ugens together.
 *
 * @name mul
 * @function
 * @memberof module:arithmetic
 * @param {ugen|number} a
 * @param {ugen|number} b
 * @return ugen
 * @example
 * out = gen.createCallback( mul( cos(0), 5 ) )
 * // creates function body out = ( gen.cos(0) * 5 )
 * out() // 5
 */

let gen = require('./gen.js')

module.exports = ( x,y ) => {
  let mul = {
    id:     gen.getUID(),
    inputs: [ x,y ],

    gen() {
      let inputs = gen.getInputs( this ),
          out

      if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
        out =  `(${inputs[0]} * ${inputs[1]})`
      }else{
        out = parseFloat( inputs[0] ) * parseFloat( inputs[1] )
      }

      return out
    }
  }

  return mul
}
