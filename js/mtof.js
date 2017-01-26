'use strict'

/**
 * Convert midi note numbers to frequency
 *
 * __Category:__ utilities
 * @name mtof
 * @function
 * @param {(ugen|number)} midi - the note midi number
 * @param {Object} [props = { tuning: 440 }]
 * @return {ugen} an ugen that outputs the frequency
 */

let gen  = require('./gen.js')

let proto = {
  name:'mtof',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.exp })

      out = `( ${this.tuning} * gen.exp( .057762265 * (${inputs[0]} - 69) ) )`

    } else {
      out = this.tuning * Math.exp( .057762265 * ( inputs[0] - 69) )
    }

    return out
  }
}

module.exports = ( x, props ) => {
  let ugen = Object.create( proto ),
      defaults = { tuning:440 }

  if( props !== undefined ) Object.assign( props.defaults )

  Object.assign( ugen, defaults )
  ugen.inputs = [ x ]


  return ugen
}
