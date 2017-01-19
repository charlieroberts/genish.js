'use strict'

/**
 * A control input determines which of two additional inputs is passed to the
 * output. Note that in the genish.js playground this is globally referred to as
 * the `ternary` ugen, so as not to conflict with JavaScript's `switch` control
 * structure.
 *
 * @name switch
 * @function
 * @param {(ugen|number)} control - When `control` === 1, output `a`; else output `b`.
 * @param {(ugen|number)} a -  Signal that is available to output.
 * @param {(ugen|number)} b - Signal that is available to ouput.
 * @return {ugen}
 * @memberof module:routing
 */

let gen = require( './gen.js' )

let proto = {
  basename:'switch',

  gen() {
    let inputs = gen.getInputs( this ), out

    if( inputs[1] === inputs[2] ) return inputs[1] // if both potential outputs are the same just return one of them

    out = `  var ${this.name}_out = ${inputs[0]} === 1 ? ${inputs[1]} : ${inputs[2]}\n`

    gen.memo[ this.name ] = `${this.name}_out`

    return [ `${this.name}_out`, out ]
  },

}

module.exports = ( control, in1 = 1, in2 = 0 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ control, in1, in2 ],
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
