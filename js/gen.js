'use strict'

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

module.exports = {

  accum:0,
  getUID() { return this.accum++ },
  debug:false,
  
  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures:new Set(),

  parameters:[],

  memo: {},
  
  /* export
   *
   * place gen functions into another object for easier reference
   */

  export( obj ) {},
  
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

  createCallback( ugen ) {
    let callback, graphOutput

    this.memo = {}
    this.closures.clear()
    this.parameters.length = 0

    this.functionBody = "'use strict';\n"

    // call .gen() on the head of the graph we are generating the callback for
    graphOutput = ugen.gen()

    // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
    // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
    // just return that number (graphOutput[0]).
    this.functionBody += Array.isArray( graphOutput ) ? graphOutput[1] + '\n' + graphOutput[0] : graphOutput

    // split body to inject return keyword on last line
    this.functionBody = this.functionBody.split('\n')
    
    // get index of last line
    let lastidx = this.functionBody.length - 1

    // insert return keyword
    this.functionBody[ lastidx ] = 'return ' + this.functionBody[ lastidx ] 
    
    // reassemble function body
    this.functionBody = this.functionBody.join('\n')

    // we can only dynamically create a named function by dynamically creating another function
    // to construct the named function! sheesh...
    let buildString = `return function gen( ${this.parameters.join(',')} ){ \n${this.functionBody}\n }`
    
    if( this.debug ) console.log( buildString ) 

    callback = new Function( buildString )()
    
    // assign properties to named function
    for( let dict of this.closures.values() ) {
      let name = Object.keys( dict )[0],
          value = dict[ name ]

      callback[ name ] = value
    }
    
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
    let inputs = ugen.inputs.map( input => {
      let isObject = typeof input === 'object',
          processedInput

      if( isObject ) { // if input is a ugen... 
        if( this.memo[ input.name ] ) { // if it has been memoized...
          processedInput = this.memo[ input.name ]
        }else{ // if not memoized generate code
          let code = input.gen()
          if( Array.isArray( code ) ) {
            this.functionBody += code[1]
            processedInput = code[0]
          }else{
            processedInput = code
          }
        }
      }else{ // it input is a number
        processedInput = input
      }

      return processedInput
    })

    return inputs
  }
}
