'use strict'

/**
 * Data objects serve as containers for storing numbers; these numbers can be read using calls to `peek()` and the data object can be written to using calls to `poke()`.
 *
 * The constructor can be called with three different argumensts. If a
 * *dataArray* is passed as the first argument, this array becomes the data
 * object's underlying data source. If a *dataLength* integer is passed, a
 * Float32Array is created using the provided length. If a *audioFileToLoad*
 * string is passed, the data object attempts to load the file at the provided
 * URL and generates a JavaScript Promise that used with the `then()` method.
 *
 * When the `data` constructor is called passing in the path of a file to
 * load, a JavaScript Promise is created that will be resovled when the
 * audiofile has been loaded. `then()` provides a callback function to be
 * executed when resolution is complete. You can use this to delay starting
 * playback of a graph until all data dependencies have been loaded.
 *
 * @name data
 * @function
 * @param {Array|Integer|String} value
 * @memberof module:buffer
 * @example
  audiofile = data( 'myaudiofile.wav' ).then( ()=> {
    out = gen.createCallback( peek( audiofile, phasor(.1) ) )
  })
*/

let gen  = require('./gen.js'),
  utilities = require( './utilities.js' ),
  peek = require('./peek.js'),
  poke = require('./poke.js')

let proto = {
  basename:'data',
  globals: {},

  gen() {
    let idx
    if( gen.memo[ this.name ] === undefined ) {
      let ugen = this
      gen.requestMemory( this.memory, this.immutable )
      idx = this.memory.values.idx
      try {
        gen.memory.heap.set( this.buffer, idx )
      }catch( e ) {
        console.log( e )
        throw Error( 'error with request. asking for ' + this.buffer.length +'. current index: ' + gen.memoryIndex + ' of ' + gen.memory.heap.length )
      }
      //gen.data[ this.name ] = this
      //return 'gen.memory' + this.name + '.buffer'
      gen.memo[ this.name ] = idx
    }else{
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
    buffer = { length: y > 1 ? y : gen.samplerate * 60 } // XXX what???
    shouldLoad = true
  }else if( x instanceof Float32Array ) {
    buffer = x
  }

  ugen = {
    buffer,
    name: proto.basename + gen.getUID(),
    dim:  buffer.length, // XXX how do we dynamically allocate this?
    channels : 1,
    gen:  proto.gen,
    onload: null,

    /**
     * Add a callback when the data is loaded
     *
     * @name then
     * @function
     * @param {callback}
     * @return {ugen} the ugen itself
     * @memberof data
     */
    then( fnc ) {
      ugen.onload = fnc
      return ugen
    },
    immutable: properties !== undefined && properties.immutable === true ? true : false,
    load( filename ) {
      let promise = utilities.loadSample( filename, ugen )
      promise.then( ( _buffer )=> {
        ugen.memory.values.length = ugen.dim = _buffer.length
        ugen.onload()
      })
    },
  }

  ugen.memory = {
    values: { length:ugen.dim, idx:null }
  }

  gen.name = 'data' + gen.getUID()

  if( shouldLoad ) ugen.load( x )

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

  return ugen
}
