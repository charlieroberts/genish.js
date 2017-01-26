'use strict'

/**
 * Returns 1 if `a` is greater than `b`, otherwise returns 0
 *
 * __Category:__ comparison
 * @name gt
 * @function
 * @param {(ugen|number)} a - one element to compare
 * @param {(ugen|number)} b - other element to compare
 * @return {ugen}
 */

let gen  = require('./gen.js')

let proto = {
  name:'gt',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    out = `  var ${this.name} = `

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `(( ${inputs[0]} > ${inputs[1]}) | 0 )`
    } else {
      out += inputs[0] > inputs[1] ? 1 : 0
    }
    out += '\n\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
  }
}

module.exports = (x,y) => {
  let gt = Object.create( proto )

  gt.inputs = [ x,y ]
  gt.name = 'gt'+gen.getUID()

  return gt
}
