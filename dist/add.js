'use strict'

let gen = require('./gen.js')

module.exports = ( ...args ) => {
  let add = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out=`  ${this.name} = fround(`,
          sum = 0, numCount = 0, adderAtEnd = false, alreadyFullSummed = true

      gen.variableNames.add( [this.name,'f'] )

      if( inputs.length > 2 ) { 
        inputs.forEach( (v,i) => {
          if( isNaN( v ) ) {
            if( i % 2 === 0 && inputs.length > 2 && i < inputs.length - 1 ) {
              out += 'fround('
            }
            out += v
            
            if( i < inputs.length -1 &&  i % 2 === 0 ) {
              adderAtEnd = true
              out += ' + '
            }

            if( i % 2 === 1 && inputs.length > 2 ) {
              out += ')'
              if( i < inputs.length - 1 ) {
                out += ' + '
                adderAtEnd = true 
              }
            }

            alreadyFullSummed = false
          }else{
            sum += parseFloat( v )
            numCount++
          }
        })
        if( numCount > 0 ) {
          out += adderAtEnd || alreadyFullSummed ? `fround(${sum})` : ` + fround(${sum})`
        }
      }else{
        if( inputs.length === 1 ) {
          out += inputs[0] 
        }else{
          out += `${inputs[0]} + ${inputs[1]}`
        }
      }
      //if( alreadyFullSummed ) out = ''


      
      //if( !alreadyFullSummed ) out += ')'

      out += ');\n'

      return [ this.name, out ]
    }
  }
  
  add.name = 'add'+add.id
  return add
}
