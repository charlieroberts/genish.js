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

  debug: false,

  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   *
   */

  closures: new Set(),

  parameters: [],

  memo: {},

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
    this.memo = {};
    this.closures.clear();
    this.parameters.length = 0;

    this.functionBody = "'use strict';\n";

    var _function = void 0,
        closures = void 0,
        argumentNames = void 0,
        argumentValues = void 0,
        headOutput = void 0;

    headOutput = ugen.gen();

    // if gen returns array, add ugen callback body and then return name of ugen
    // otherwise, return what ever the output of the call to .gen() is
    this.functionBody += Array.isArray(headOutput) ? headOutput[1] + '\n' + headOutput[0] : headOutput;

    closures = [].concat(_toConsumableArray(this.closures));

    // entries in closure set take from { name: function/object }
    // argumentNames = closures.map( v => Object.keys( v )[0] )

    // XXX errr... this could be more readable. Essenetially, loop through names, find closure with name, return closure value
    //argumentValues= argumentNames.map( key => closures.find( v => v[key] !== undefined )[ key ] )

    argumentNames = this.parameters;

    this.functionBody = this.functionBody.split('\n');

    var lastidx = this.functionBody.length - 1;

    // insert return keyword
    this.functionBody[lastidx] = 'return ' + this.functionBody[lastidx];

    this.functionBody = this.functionBody.join('\n');

    var buildString = 'return function gen(' + argumentNames.join(',') + '){\n' + this.functionBody + '\n}';

    if (this.debug) console.log(buildString);
    var functionBuilder = new Function(buildString);

    _function = functionBuilder(); //new Function( argumentNames, this.functionBody )

    closures.forEach(function (dict) {
      var name = Object.keys(dict)[0],
          value = dict[name];

      _function[name] = value;
    });
    //_function.closures = argumentValues

    if (this.debug) console.log(_function.toString());

    // XXX can the array slicing / concatentation be optimized?
    // perhaps the closure functions could instead be properties of the function
    // itself, referenced via 'this' in the function body, instead of inlined
    // function arguments. Then no concatenation would be required.
    //let out = function() {
    //  let args = Array.prototype.slice.call( arguments, 0 )
    //  return _function.apply( null, _function.closures.concat( args ) )
    //}

    return _function;
  },
  getInputs: function getInputs(ugen) {
    var _this = this;

    var inputs = ugen.inputs.map(function (input) {
      var isObject = (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object',
          out = void 0;
      if (isObject) {
        if (_this.memo[input.name]) {
          //console.log("MEMO", input.name, this.memo[ input.name ] )
          out = _this.memo[input.name];
        } else {
          var code = input.gen();
          if (Array.isArray(code)) {
            _this.functionBody += code[1];
            out = code[0];
          } else {
            out = code;
          }
        }
      } else {
        out = input;
      }

      //if( out === undefined ) {
      //  console.log( 'undefined input: ', input )
      //}
      return out;
    });

    return inputs;
  }
};