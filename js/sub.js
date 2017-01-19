'use strict'

/**
 * Subtract
 *
 * @name sub
 * @function
 * @param {(...number|...ugen)} args
 * @return ugen
 * @memberof module:arithmetic
 * @example
 * out = gen.createCallback( sub( abs(.1),1,2 ) )
 * // creates function body out = ( .1 - 3 )
 * out() // -2.9
 */

let gen = require('./gen.js')

module.exports = ( ...args ) => {
  let sub = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out=0,
          diff = 0,
          needsParens = false,
          numCount = 0,
          lastNumber = inputs[ 0 ],
          lastNumberIsUgen = isNaN( lastNumber ),
          subAtEnd = false,
          hasUgens = false,
          returnValue = 0

      this.inputs.forEach( value => { if( isNaN( value ) ) hasUgens = true })

      if( hasUgens ) { // store in variable for future reference
        out = '  var ' + this.name + ' = ('
      }else{
        out = '('
      }

      inputs.forEach( (v,i) => {
        if( i === 0 ) return

        let isNumberUgen = isNaN( v ),
            isFinalIdx   = i === inputs.length - 1

        if( !lastNumberIsUgen && !isNumberUgen ) {
          lastNumber = lastNumber - v
          out += lastNumber
          return
        }else{
          needsParens = true
          out += `${lastNumber} - ${v}`
        }

        if( !isFinalIdx ) out += ' - '
      })

      if( needsParens ) {
        out += ')'
      }else{
        out = out.slice( 1 ) // remove opening paren
      }

      if( hasUgens ) out += '\n'

      returnValue = hasUgens ? [ this.name, out ] : out

      if( hasUgens ) gen.memo[ this.name ] = this.name

      return returnValue
    }
  }

  sub.name = 'sub'+sub.id

  return sub
}
