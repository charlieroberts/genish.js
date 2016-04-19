let gen  = require('./gen.js')

let proto = {
  name:'accum',

  gen() {
    let code,
        inputs = gen.getInputs( this )
    
    gen.closures.add({ [this.name]: this.boundCallback })

    code = `${this.name}( ${inputs[0]},${inputs[1]} )`
    
    return code
  }
}

module.exports = ( incr, reset=0, min=0, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    min, 
    max,
    value:   0,
    basename:'accum',
    uid:    gen.getUID(),
    inputs: [ incr, reset ],

    callback( _incr, _reset ) {
      
      this.value += _incr
        
      if( _reset >= 1 ) {
        this.value = this.min
      }else{
        if( this.value > this.max ) this.value = this.min
      }
      
      return this.value

    }
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`
  ugen.boundCallback = (...args) => { return ugen.callback.apply( ugen, args ) }

  return ugen
}
