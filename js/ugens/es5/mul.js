'use strict'

let gen = require('./gen.js')

module.exports = ( ...args ) => {
  let mul = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out='(',
          sum = 1, numCount = 0, mulAtEnd = false, alreadyFullSummed = true

      inputs.forEach( (v,i) => {
        if( isNaN( v ) ) {
          out += v
          if( i < inputs.length -1 ) {
            mulAtEnd = true
            out += ' * '
          }
          alreadyFullSummed = false
        }else{
          if( i === 0 ) {
            sum = v
          }else{
            sum *= parseFloat( v )
          }
          numCount++
        }
      })
      
      if( alreadyFullSummed ) out = ''

      if( numCount > 0 ) {
        out += mulAtEnd || alreadyFullSummed ? sum : ' * ' + sum
      }
      
      if( !alreadyFullSummed ) out += ')'

      return out
    }
  }

  return mul
}
