let gen  = require('./gen.js')

let proto = {
  basename:'accum',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        functionBody

    gen.closures.add({ [this.name]: this }) 

    functionBody = this.callback.toString().split('\n')
    functionBody = functionBody.slice( 1, -2 )
    functionBody = functionBody.join('\n')
    
    this.properties.forEach( (v,idx) => functionBody = functionBody.replace( v, inputs[ idx ] ) )

    functionBody = functionBody.replace( /this/gi, this.name )
    functionBody += '\n'; 
    // put this at end so previous properties replacement doesn't interfere
    
    gen.memo[ this.name ] = this.name + '.value'

    return [ this.name + '.value', functionBody ]
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
    properties: [ '_incr','_reset' ],

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

  return ugen
}
