let gen = require('./gen.js')

module.exports = (...args) => {
  let sub = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out='(',
          diff = 0, numCount = 0, subAtEnd = false

      inputs.forEach( (v,i) => {
        if( isNaN( v ) ) {
          out += v
          if( i < inputs.length -1 ) {
            subAtEnd = true
            out += ' - '
          }
        }else{
          diff += parseFloat( v )
          numCount++
        }
      })

      if( numCount > 0 ) {
        out += subAtEnd ? diff : ' - ' + diff
      }
      
      out += ')'

      return out
    }
  }
  
  return sub
}
