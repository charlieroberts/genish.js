'use strict'

/**
 * Adds an unlimited number of signals (numbers or ugens)
 * @name add
 * @function
 * @param {(...number|...ugen)} args
 * @return ugen
 * @example
    out = gen.createCallback( add(1,2) )
    // creates function body out = ( 3 )
    out() // 3
 * @memberof module:arithmetic
 */

let gen = require('./gen.js')

module.exports = (...args) => {
  let add = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out='(',
          sum = 0, numCount = 0, adderAtEnd = false, alreadyFullSummed = true

      inputs.forEach( (v,i) => {
        if( isNaN( v ) ) {
          out += v
          if( i < inputs.length -1 ) {
            adderAtEnd = true
            out += ' + '
          }
          alreadyFullSummed = false
        }else{
          sum += parseFloat( v )
          numCount++
        }
      })

      if( alreadyFullSummed ) out = ''

      if( numCount > 0 ) {
        out += adderAtEnd || alreadyFullSummed ? sum : ' + ' + sum
      }

      if( !alreadyFullSummed ) out += ')'

      return out
    }
  }

  return add
}
