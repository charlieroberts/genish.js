'use strict'

let gen  = require('./gen.js'),
    utilities = require( './utilities.js' )

let proto = {
  basename:'data',
  globals: {},

  gen() {
    let idx
    if( gen.memo[ this.name ] === undefined ) {
      console.log( 'gen data' )
      let ugen = this
      gen.requestMemory( this.memory ) //, ()=> {  console.log("CALLED", ugen); gen.memory.set( ugen.buffer, idx ) } )
      //console.log( 'MEMORY', this.memory, this.buffer )
      idx = this.memory.values.idx
      gen.memory.set( this.buffer, idx )

      //gen.data[ this.name ] = this
      //return 'gen.memory' + this.name + '.buffer'
      gen.memo[ this.name ] = idx
    }else{
      console.log( 'MEMO?' )
      idx = gen.memo[ this.name ]
    }
    return idx
  },
}

module.exports = ( x, y=1, properties ) => {
  let ugen, buffer, shouldLoad = false
  
  if( properties !== undefined && properties.global !== undefined ) {
    if( gen.globals[ properties.global ] ) {
      return gen.globals[ properties.global ]
    }
  }

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
    buffer = { length: y || 44100 }
    shouldLoad = true
  }else if( x instanceof Float32Array ) {
    buffer = x
  }
  
  ugen = { 
    buffer,
    name: proto.basename + gen.getUID(),
    dim:  buffer.length,
    channels : 1,
    gen:  proto.gen,
    onload: null,
    then( fnc ) {
      ugen.onload = fnc
      return ugen
    },
  }
  ugen.memory = {
    values: { length:ugen.dim, index:null }
  }

  gen.name = 'data'+gen.getUID()
  //gen.data[ ugen.name ] = ugen

  if( shouldLoad ) {
    let promise = utilities.loadSample( x, ugen )
    promise.then( ( _buffer )=> { 
      ugen.onload() 
      ugen.memory.length = _buffer.length
    })
  }
  
  if( properties !== undefined && properties.global !== undefined ) {
    gen.globals[ properties.global ] = ugen
  }

  return ugen
}
