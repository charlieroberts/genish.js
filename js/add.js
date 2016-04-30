'use strict'

let gen = require('./gen.js')

module.exports = (...args) => {
  let add = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out='(',
          sum = 0, numCount = 0, adderAtEnd = false

      inputs.forEach( (v,i) => {
        if( isNaN( v ) ) {
          out += v
          if( i < inputs.length -1 ) {
            adderAtEnd = true
            out += ' + '
          }
        }else{
          sum += parseFloat( v )
          numCount++
        }
      })

      if( numCount > 0 ) {
        out += adderAtEnd ? sum : ' + ' + sum
      }
      
      out += ')'

      return out
    }
  }
  
  return add
}
