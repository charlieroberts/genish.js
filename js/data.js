'use strict'

let gen  = require('./gen.js'),
    utilities = require( './utilities.js' )

let proto = {
  basename:'data',

  gen() {
    return 'gen.data.' + this.name + '.buffer'
  },
}

module.exports = ( x, y=1 ) => {
  let ugen, buffer, shouldLoad = false
    
  if( typeof x === 'number' ) {
    if( y !== 1 ) {
      buffer = []
      for( let i = 0; i < y; i++ ) {
        buffer[ i ] = new Float32Array( x )
      }
    }else{
      buffer = new Float32Array( x )
    }
  }else if( Array.isArray( x ) ) { //! (x instanceof Float32Array ) ) {
    let size = x.length
    buffer = new Float32Array( size )
    for( let i = 0; i < x.length; i++ ) {
      buffer[ i ] = x[ i ]
    }
  }else if( typeof x === 'string' ) {
    buffer = [ 0 ]
    shouldLoad = true
  }else{
    buffer = x
  }

  ugen = { 
    buffer,
    name: proto.basename + gen.getUID(),
    dim: y === 1 ? buffer.length : x,
    channels : 1,
    gen:  proto.gen
  }
  
  gen.data[ ugen.name ] = ugen

  if( shouldLoad ) utilities.loadSample( x, ugen )
  
  return ugen
}
