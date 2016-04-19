'use strict';

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

module.exports = {

  accum: 0,
  getUID: function getUID() {
    return this.accum++;
  },


  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   *
   */

  closures: new Set(),

  parameters: [],

  /* export
   *
   * place gen functions into another object for easier reference
   */

  export: function _export(obj) {},


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

  createCallback: function createCallback(ugen) {
    this.closures.clear();
    this.parameters.length = 0;

    var functionBody = ugen.gen(),
        closures = [].concat(_toConsumableArray(this.closures)),
        _function = void 0,
        argumentNames = void 0,
        argumentValues = void 0;

    // entries in closure set take from { name, function }
    argumentNames = closures.map(function (v) {
      return Object.keys(v)[0];
    });

    // XXX errr... this could be more readable. Essenetially, loop through names, find closure with name, return closure value
    argumentValues = argumentNames.map(function (key) {
      return closures.find(function (v) {
        return v[key] !== undefined;
      })[key];
    });

    argumentNames = argumentNames.concat(this.parameters);

    _function = new Function(argumentNames, 'return ' + functionBody);

    _function.closures = argumentValues;

    //console.log( _function.toString() )

    // XXX can the array slicing / concatentation be optimized?
    // perhaps the closure functions could instead be properties of the function
    // itself, referenced via 'this' in the function body, instead of inlined
    // function arguments. Then no concatenation would be required.
    var out = function out() {
      var args = Array.prototype.slice.call(arguments, 0);
      return _function.apply(null, _function.closures.concat(args));
    };

    return out;
  },
  getInputs: function getInputs(ugen) {
    var inputs = ugen.inputs.map(function (v) {
      return (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object' ? v.gen() : v;
    });

    return inputs;
  }
};

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