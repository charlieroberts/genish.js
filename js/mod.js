'use strict'

/**
 * Divides ugen or number *a* by ugen or number *b* and returns the remainder.
 *
 * __Category:__ arithmetic
 * @name mod
 * @function
 * @param {ugen|number} a
 * @param {ugen|number} b
 * @return ugen
 * @example
    out = gen.createCallback( mod( cos(0), .51 ) )
    // creates function body out = ( gen.cos(0) % .51 )
    out() // .49
 */

let gen = require('./gen.js')

module.exports = (...args) => {
  let mod = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out='(',
          diff = 0,
          numCount = 0,
          lastNumber = inputs[ 0 ],
          lastNumberIsUgen = isNaN( lastNumber ),
          modAtEnd = false

      inputs.forEach( (v,i) => {
        if( i === 0 ) return

        let isNumberUgen = isNaN( v ),
            isFinalIdx   = i === inputs.length - 1

        if( !lastNumberIsUgen && !isNumberUgen ) {
          lastNumber = lastNumber % v
          out += lastNumber
        }else{
          out += `${lastNumber} % ${v}`
        }

        if( !isFinalIdx ) out += ' % '
      })

      out += ')'

      return out
    }
  }

  return mod
}
