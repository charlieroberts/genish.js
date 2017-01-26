'use strict'

/**
 * Fold constricts an input `a` to a particular range. Given a range of {0,1}
 * and an input signal of {.8,.9,1,1.1,1.2}, fold will return {.8,.9,1,.9,.8}.
 *
 * __Category:__ range
 * @name fold
 * @function
 * @param {(ugen|number)} a - Input signal to fold.
 * @param {(ugen|number)} min - Signal or number that sets minimum of range to fold input to.
 * @param {(ugen|number)} max - Signal or number that sets maximum of range to fold input to.
 */

let gen  = require('./gen.js')

let proto = {
  basename:'fold',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        out

    out = this.createCallback( inputs[0], this.min, this.max )

    gen.memo[ this.name ] = this.name + '_value'

    return [ this.name + '_value', out ]
  },

  createCallback( v, lo, hi ) {
    let out =
` var ${this.name}_value = ${v},
      ${this.name}_range = ${hi} - ${lo},
      ${this.name}_numWraps = 0

  if(${this.name}_value >= ${hi}){
    ${this.name}_value -= ${this.name}_range
    if(${this.name}_value >= ${hi}){
      ${this.name}_numWraps = ((${this.name}_value - ${lo}) / ${this.name}_range) | 0
      ${this.name}_value -= ${this.name}_range * ${this.name}_numWraps
    }
    ${this.name}_numWraps++
  } else if(${this.name}_value < ${lo}){
    ${this.name}_value += ${this.name}_range
    if(${this.name}_value < ${lo}){
      ${this.name}_numWraps = ((${this.name}_value - ${lo}) / ${this.name}_range- 1) | 0
      ${this.name}_value -= ${this.name}_range * ${this.name}_numWraps
    }
    ${this.name}_numWraps--
  }
  if(${this.name}_numWraps & 1) ${this.name}_value = ${hi} + ${lo} - ${this.name}_value
`
    return ' ' + out
  }
}

module.exports = ( in1, min=0, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, {
    min,
    max,
    uid:    gen.getUID(),
    inputs: [ in1 ],
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
