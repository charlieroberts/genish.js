'use strict'

/**
 * low-level code generation for unit generators
 *
 * #### Properties
 * - `accum` *integer**<br> A number that is incremeneted everytime a ugen is created in order to provide a unique id.
 * - `debug` *boolean*<br> When this flag is set, all callbacks generated will be logged to the console.
 * - `closures` *Set*<br> Currently inappropriately named, this property contains key/value pairs which assign properties to the named, generated functions. These properties can the be called as methods or accessed more generally from within the generated callback.
 * - `histories` *Map*<br> Stores references to all single-sample delays, so that they can record their input at the end of generated callback functions.
 * - `memo` *object*<br> Once a ugen has generated it's associated output string, that string is placed in this object, assigned to key equalling the ugens unique id. Before asking any ugen to generate code, genish will check to see if there is already a memoized version stored in this object; if so, that will be used.
 * - `data` *object*<br> A general storage area that is accessible from within generated callbacks.
 *
 *
 * #### Methods
 * - `createCallback`: This will codegen a callback function for the ugen passed as the first argument. If that ugen is dependent on other ugens, these in turn will also be asked to codegen until the entire graph is contained within the output callback function. If the debug flag is set then the function body will be printed to the console.
 *   - **graph** &nbsp;  *object* or *array* &nbsp; A genish.js unit generator to be compiled. If an array of two ugens is passed, the resulting function will output a stereo signal.
 *   - **debug** &nbsp;  *boolean* &nbsp; When set, print the string representation of the generated function to the console.
 * - `getInputs` This method looks at the argument ugen and, assuming it has dependencies, calls their codegen methods so that their code is added to the final output function. It is only used internally during calls to `gen.createCallback()`. The basic codegen process is calling `getInputs` recursively until the entire graph has been resolved.
 *   - **ugen** &nbsp;  *object* &nbsp; A genish.js unit generator.
 *
 * @name gen
 *
 * @example
 * out = gen.createCallback( add(5,3) )
 * out() // 8
 * out = gen.createCallback( [ accum(.1), accum(.2) ] )
 * out() // [  0,  0 ]
 * out() // [ .1, .2 ]
 * out() // [ .2, .4 ]
 * out() // [ .3, .6 ] etc...
*/

let MemoryHelper = require( 'memory-helper' )

let gen = {

  accum:0,
  getUID() { return this.accum++ },
  debug:false,
  samplerate: 44100, // change on audiocontext creation
  shouldLocalize: false,
  globals:{
    windows: {},
  },

  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),
  params:   new Set(),

  parameters:[],
  endBlock: new Set(),
  histories: new Map(),

  memo: {},

  data: {},

  /* export
   *
   * place gen functions into another object for easier reference
   */

  export( obj ) {},

  addToEndBlock( v ) {
    this.endBlock.add( '  ' + v )
  },

  requestMemory( memorySpec, immutable=false ) {
    for( let key in memorySpec ) {
      let request = memorySpec[ key ]

      request.idx = gen.memory.alloc( request.length, immutable )
    }
  },

  /* createCallback
   *
   * param ugen - Head of graph to be codegen'd
   *
   * Generate callback function for a particular ugen graph.
   * The gen.closures property stores functions that need to be
   * passed as arguments to the final function; these are prefixed
   * before any defined params the graph exposes. For example, given:
   *
   * gen.createCallback( abs( param() ) )
   *
   * ... the generated function will have a signature of ( abs, p0 ).
   */

  createCallback( ugen, mem, debug = false ) {
    let isStereo = Array.isArray( ugen ) && ugen.length > 1,
        callback,
        channel1, channel2

    if( typeof mem === 'number' || mem === undefined ) {
      mem = MemoryHelper.create( mem )
    }

    //console.log( 'cb memory:', mem )
    this.memory = mem
    this.memo = {}
    this.endBlock.clear()
    this.closures.clear()
    this.params.clear()
    this.globals = { windows:{} }

    this.parameters.length = 0

    this.functionBody = "  'use strict'\n  var memory = gen.memory\n\n";

    // call .gen() on the head of the graph we are generating the callback for
    //console.log( 'HEAD', ugen )
    for( let i = 0; i < 1 + isStereo; i++ ) {
      if( typeof ugen[i] === 'number' ) continue

      let channel = isStereo ? ugen[i].gen() : ugen.gen(),
          body = ''

      // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
      // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
      // just return that number (graphOutput[0]).
      body += Array.isArray( channel ) ? channel[1] + '\n' + channel[0] : channel

      // split body to inject return keyword on last line
      body = body.split('\n')

      //if( debug ) console.log( 'functionBody length', body )

      // next line is to accommodate memo as graph head
      if( body[ body.length -1 ].trim().indexOf('let') > -1 ) { body.push( '\n' ) }

      // get index of last line
      let lastidx = body.length - 1

      // insert return keyword
      body[ lastidx ] = '  gen.out[' + i + ']  = ' + body[ lastidx ] + '\n'

      this.functionBody += body.join('\n')
    }

    this.histories.forEach( value => {
      if( value !== null )
        value.gen()
    })

    let returnStatement = isStereo ? '  return gen.out' : '  return gen.out[0]'

    this.functionBody = this.functionBody.split('\n')

    if( this.endBlock.size ) {
      this.functionBody = this.functionBody.concat( Array.from( this.endBlock ) )
      this.functionBody.push( returnStatement )
    }else{
      this.functionBody.push( returnStatement )
    }
    // reassemble function body
    this.functionBody = this.functionBody.join('\n')

    // we can only dynamically create a named function by dynamically creating another function
    // to construct the named function! sheesh...
    let buildString = `return function gen( ${ this.parameters.join(',') } ){ \n${ this.functionBody }\n}`

    if( this.debug || debug ) console.log( buildString )

    callback = new Function( buildString )()


    // assign properties to named function
    for( let dict of this.closures.values() ) {
      let name = Object.keys( dict )[0],
          value = dict[ name ]

      callback[ name ] = value
    }

    for( let dict of this.params.values() ) {
      let name = Object.keys( dict )[0],
          ugen = dict[ name ]

      Object.defineProperty( callback, name, {
        configurable: true,
        get() { return ugen.value },
        set(v){ ugen.value = v }
      })
      //callback[ name ] = value
    }

    callback.data = this.data
    callback.out  = new Float32Array( 2 )
    callback.parameters = this.parameters.slice( 0 )

    //if( MemoryHelper.isPrototypeOf( this.memory ) )
    callback.memory = this.memory.heap

    this.histories.clear()

    return callback
  },

  /* getInputs
   *
   * Given an argument ugen, extract its inputs. If they are numbers, return the numebrs. If
   * they are ugens, call .gen() on the ugen, memoize the result and return the result. If the
   * ugen has previously been memoized return the memoized value.
   *
   */
  getInputs( ugen ) {
    return ugen.inputs.map( gen.getInput )
  },

  getInput( input ) {
    let isObject = typeof input === 'object',
        processedInput

    if( isObject ) { // if input is a ugen...
      if( gen.memo[ input.name ] ) { // if it has been memoized...
        processedInput = gen.memo[ input.name ]
      }else if( Array.isArray( input ) ) {
        gen.getInput( input[0] )
        gen.getInput( input[0] )
      }else{ // if not memoized generate code
        if( typeof input.gen !== 'function' ) {
          console.log( 'no gen found:', input, input.gen )
        }
        let code = input.gen()

        if( Array.isArray( code ) ) {
          if( !gen.shouldLocalize ) {
            gen.functionBody += code[1]
          }else{
            gen.codeName = code[0]
            gen.localizedCode.push( code[1] )
          }
          //console.log( 'after GEN' , this.functionBody )
          processedInput = code[0]
        }else{
          processedInput = code
        }
      }
    }else{ // it input is a number
      processedInput = input
    }

    return processedInput
  },

  startLocalize() {
    this.localizedCode = []
    this.shouldLocalize = true
  },
  endLocalize() {
    this.shouldLocalize = false

    return [ this.codeName, this.localizedCode.slice(0) ]
  },

  free( graph ) {
    if( Array.isArray( graph ) ) { // stereo ugen
      for( let channel of graph ) {
        this.free( channel )
      }
    } else {
      if( typeof graph === 'object' ) {
        if( graph.memory !== undefined ) {
          for( let memoryKey in graph.memory ) {
            this.memory.free( graph.memory[ memoryKey ].idx )
          }
        }
        if( Array.isArray( graph.inputs ) ) {
          for( let ugen of graph.inputs ) {
            this.free( ugen )
          }
        }
      }
    }
  }
}

module.exports = gen
