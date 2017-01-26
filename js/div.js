'use strict'

/**
 * Divides ugen or number *a* by ugen or number *b*.
 *
 * __Category:__ arithmetic
 * @name div
 * @function
 * @param {ugen|number} a
 * @param {ugen|number} b
 * @return ugen
 * @example
    out = gen.createCallback( div( cos(0), 2 ) )
    // creates function body out = ( gen.cos(0) / 2 )
    out() // .5
 */

let gen = require('./gen.js')

module.exports = (...args) => {
  let div = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out='(',
          diff = 0,
          numCount = 0,
          lastNumber = inputs[ 0 ],
          lastNumberIsUgen = isNaN( lastNumber ),
          divAtEnd = false

      inputs.forEach( (v,i) => {
        if( i === 0 ) return

        let isNumberUgen = isNaN( v ),
            isFinalIdx   = i === inputs.length - 1

        if( !lastNumberIsUgen && !isNumberUgen ) {
          lastNumber = lastNumber / v
          out += lastNumber
        }else{
          out += `${lastNumber} / ${v}`
        }

        if( !isFinalIdx ) out += ' / '
      })

      out += ')'

      return out
    }
  }

  return div
}
