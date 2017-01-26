'use strict'

/**
 * Returns `a` if `a` is lesser than `b`, otherwise returns 0
 *
 * __Category:__ comparison
 * @name ltp
 * @function
 * @param {(ugen|number)} a - one element to compare
 * @param {(ugen|number)} b - other element to compare
 * @return {ugen}
 */

let gen  = require('./gen.js')

let proto = {
  name:'ltp',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out = `(${inputs[ 0 ]} * (( ${inputs[0]} < ${inputs[1]} ) | 0 ) )`
    } else {
      out = inputs[0] * (( inputs[0] < inputs[1] ) | 0 )
    }

    return out
  }
}

module.exports = (x,y) => {
  let ltp = Object.create( proto )

  ltp.inputs = [ x,y ]

  return ltp
}
