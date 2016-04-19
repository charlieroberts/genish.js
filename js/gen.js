'use strict'

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

module.exports = {

  accum:0,
  getUID() { return this.accum++ },
  
  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   *
   */

  closures:new Set(),

  parameters:[],
  
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
    this.closures.clear()
    this.parameters.length = 0

    let functionBody = ugen.gen(),
        closures = [ ...this.closures ],
        _function,
        argumentNames,
        argumentValues

    // entries in closure set take from { name, function }
    argumentNames = closures.map( v => Object.keys( v )[0] ) 
    
    // XXX errr... this could be more readable. Essenetially, loop through names, find closure with name, return closure value
    argumentValues= argumentNames.map( key => closures.find( v => v[key] !== undefined )[ key ] )
    
    argumentNames = argumentNames.concat( this.parameters )

    _function = new Function( argumentNames, `return ${functionBody}` )

    _function.closures = argumentValues
    
    //console.log( _function.toString() )
    
    // XXX can the array slicing / concatentation be optimized?
    // perhaps the closure functions could instead be properties of the function
    // itself, referenced via 'this' in the function body, instead of inlined
    // function arguments. Then no concatenation would be required.
    let out = function() { 
      let args = Array.prototype.slice.call( arguments, 0 )
      return _function.apply( null, _function.closures.concat( args ) ) 
    }

    return out
  },

  getInputs( ugen ) {
    let inputs = ugen.inputs.map( v => {
      return typeof v === 'object' ? v.gen() : v
    })

    return inputs
  }



}

//import abs   from './abs.js'
//import param from './param.js'
//import add   from './add.js'
//import mul   from './add.js'

//Object.assign( gen, {
//  abs,
//  param,
//  add,
//  mul
//})
