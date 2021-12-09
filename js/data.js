'use strict'

const gen  = require('./gen.js'),
      utilities = require( './utilities.js' ),
      peek = require('./peek.js'),
      poke = require('./poke.js')

const proto = {
  basename:'data',
  globals: {},
  memo:{},

  gen() {
    let idx
    //console.log( 'data name:', this.name, proto.memo )
    //debugger
    if( gen.memo[ this.name ] === undefined ) {
      let ugen = this
      gen.requestMemory( this.memory, this.immutable ) 
      idx = this.memory.values.idx
      if( this.buffer !== undefined ) {
        try {
          gen.memory.heap.set( this.buffer, idx )
        }catch( e ) {
          console.log( e )
          throw Error( 'error with request. asking for ' + this.buffer.length +'. current index: ' + gen.memoryIndex + ' of ' + gen.memory.heap.length )
        }
      }
      //gen.data[ this.name ] = this
      //return 'gen.memory' + this.name + '.buffer'
      if( this.name.indexOf('data') === -1 ) {
        proto.memo[ this.name ] = idx
      }else{
        gen.memo[ this.name ] = idx
      }
    }else{
      //console.log( 'using gen data memo', proto.memo[ this.name ] )
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
    //buffer = { length: y > 1 ? y : gen.samplerate * 60 } // XXX what???
    //if( proto.memo[ x ] === undefined ) {
      buffer = { length: y > 1 ? y : 1 } // XXX what???
      shouldLoad = true
    //}else{
      //buffer = proto.memo[ x ]
    //}
  }else if( x instanceof Float32Array ) {
    buffer = x
  }else if( x instanceof Uint8Array ) {
    buffer = x
  }else if( x instanceof AudioBuffer ) {
    buffer = x.getChannelData(0)
  }
  
  ugen = Object.create( proto ) 

  Object.assign( ugen, 
  { 
    buffer,
    name: proto.basename + gen.getUID(),
    dim:  buffer !== undefined ? buffer.length : 1, // XXX how do we dynamically allocate this?
    channels : 1,
    onload: properties !== undefined ? properties.onload || null : null,
    //then( fnc ) {
    //  ugen.onload = fnc
    //  return ugen
    //},
    immutable: properties !== undefined && properties.immutable === true ? true : false,
    load( filename, __resolve ) {
      let promise = utilities.loadSample( filename, ugen )
      promise.then( _buffer => { 
        proto.memo[ x ] = _buffer
        ugen.name = filename
        ugen.memory.values.length = ugen.dim = _buffer.length

        gen.requestMemory( ugen.memory, ugen.immutable ) 
        gen.memory.heap.set( _buffer, ugen.memory.values.idx )
        if( typeof ugen.onload === 'function' ) ugen.onload( _buffer ) 
        __resolve( ugen )
      })
    },
    memory : {
      values: { length:buffer !== undefined ? buffer.length : 1, idx:null }
    }
  },
  properties
  )

  
  if( properties !== undefined ) {
    if( properties.global !== undefined ) {
      gen.globals[ properties.global ] = ugen
    }
    if( properties.meta === true ) {
      for( let i = 0, length = ugen.buffer.length; i < length; i++ ) {
        Object.defineProperty( ugen, i, {
          get () {
            return peek( ugen, i, { mode:'simple', interp:'none' } )
          },
          set( v ) {
            return poke( ugen, v, i )
          }
        })
      }
    }
  }

  let returnValue
  if( shouldLoad === true ) {
    returnValue = new Promise( (resolve,reject) => {
      //ugen.load( x, resolve )
      let promise = utilities.loadSample( x, ugen )
      promise.then( _buffer => { 
        proto.memo[ x ] = _buffer
        ugen.memory.values.length = ugen.dim = _buffer.length

        ugen.buffer = _buffer
        //gen.once( 'memory init', ()=> {
        //  console.log( "CALLED", ugen.memory )
        //  gen.requestMemory( ugen.memory, ugen.immutable ) 
        //  gen.memory.heap.set( _buffer, ugen.memory.values.idx )
        //  if( typeof ugen.onload === 'function' ) ugen.onload( _buffer ) 
        //})
        
        resolve( ugen )
      })     
    })
  }else if( proto.memo[ x ] !== undefined ) {

    gen.once( 'memory init', ()=> {
      gen.requestMemory( ugen.memory, ugen.immutable ) 
      gen.memory.heap.set( ugen.buffer, ugen.memory.values.idx )
      if( typeof ugen.onload === 'function' ) ugen.onload( ugen.buffer ) 
    })

    returnValue = ugen
  }else{
    returnValue = ugen
  }

  return returnValue 
}

