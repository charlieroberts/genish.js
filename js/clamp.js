'use strict'

/**
 * Clamp constricts an input `a` to a particular range. If input `a` exceeds the
 * maximum, the maximum is returned. If input `b` is less than the minimum, the
 * minimum is returned.
 *
 * @name clamp
 * @function
 * @param {(ugen|number)} a - Input signal to clamp.
 * @param {(ugen|number)} min - Signal or number that sets minimum of range to clamp input to.
 * @param {(ugen|number)} max - Signal or number that sets maximum of range to clamp input to.
 * @memberof module:range
 */

let gen  = require('./gen.js'),
    floor= require('./floor.js'),
    sub  = require('./sub.js'),
    memo = require('./memo.js')

let proto = {
  basename:'clip',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        out

    out =

` var ${this.name} = ${inputs[0]}
  if( ${this.name} > ${inputs[2]} ) ${this.name} = ${inputs[2]}
  else if( ${this.name} < ${inputs[1]} ) ${this.name} = ${inputs[1]}
`
    out = ' ' + out

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  },
}

module.exports = ( in1, min=-1, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, {
    min,
    max,
    uid:    gen.getUID(),
    inputs: [ in1, min, max ],
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
