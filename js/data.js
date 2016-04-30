'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'data',

  gen() {
    return 'gen.data.' + this.name
  },
}

module.exports = ( x, y=1 ) => {
  let ugen 
    
  if( typeof x === 'number' ) {
    if( y !== 1 ) {
      ugen = []
      for( let i = 0; i < y; i++ ) {
        ugen[ i ] = new Float32Array( x )
      }
    }else{
      ugen = new Float32Array( x )
    }
  }else{
    let size = x.length
    ugen = new Float32Array( size )
    for( let i = 0; i < x.length; i++ ) {
      ugen[ i ] = x[ i ]
    }
  }

  Object.assign( ugen, { 
    name: proto.basename + gen.getUID(),
    dim: y === 1 ? ugen.length : x,
    channels : 1,
    gen:  proto.gen
  })
  
  gen.data[ ugen.name ] = ugen
  
  return ugen
}
