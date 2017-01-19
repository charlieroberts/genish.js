'use strict'

/**
 * Selector is basically the same as `switch()` but allows you to have an
 * arbitrary number of inputs to choose between.
 *
 * @name selector
 * @function
 * @param {(ugen|number)} control -  Determines which input signal is passed to the ugen's output.
 * @param {(...ugen|...number)} inputs - After the `control` input, an arbitrary number of inputs can be passed to the selector constructor.
 * @return {ugen}
 * @memberof module:routing
 */

let gen = require( './gen.js' )

let proto = {
  basename:'selector',

  gen() {
    let inputs = gen.getInputs( this ), out, returnValue = 0

    switch( inputs.length ) {
      case 2 :
        returnValue = inputs[1]
        break;
      case 3 :
        out = `  var ${this.name}_out = ${inputs[0]} === 1 ? ${inputs[1]} : ${inputs[2]}\n\n`;
        returnValue = [ this.name + '_out', out ]
        break;
      default:
        out =
` var ${this.name}_out = 0
  switch( ${inputs[0]} + 1 ) {\n`

        for( let i = 1; i < inputs.length; i++ ){
          out +=`    case ${i}: ${this.name}_out = ${inputs[i]}; break;\n`
        }

        out += '  }\n\n'

        returnValue = [ this.name + '_out', ' ' + out ]
    }

    gen.memo[ this.name ] = this.name + '_out'

    return returnValue
  },
}

module.exports = ( ...inputs ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
