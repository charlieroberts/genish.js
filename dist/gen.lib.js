(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9nZW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxPQUFQLEdBQWlCOztBQUVmLFNBQU0sQ0FBTjtBQUNBLDRCQUFTO0FBQUUsV0FBTyxLQUFLLEtBQUwsRUFBUCxDQUFGO0dBSE07O0FBSWYsU0FBTSxLQUFOOzs7Ozs7OztBQVFBLFlBQVMsSUFBSSxHQUFKLEVBQVQ7O0FBRUEsY0FBVyxFQUFYOztBQUVBLFFBQU0sRUFBTjs7Ozs7OztBQU9BLDJCQUFRLEtBQU0sRUF2QkM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUNmLDBDQUFnQixNQUFPO0FBQ3JCLFNBQUssSUFBTCxHQUFZLEVBQVosQ0FEcUI7QUFFckIsU0FBSyxRQUFMLENBQWMsS0FBZCxHQUZxQjtBQUdyQixTQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBekIsQ0FIcUI7O0FBS3JCLFNBQUssWUFBTCxHQUFvQixpQkFBcEIsQ0FMcUI7O0FBT3JCLFFBQUksa0JBQUo7UUFDSSxpQkFESjtRQUVJLHNCQUZKO1FBR0ksdUJBSEo7UUFJSSxtQkFKSixDQVBxQjs7QUFhckIsaUJBQWEsS0FBSyxHQUFMLEVBQWI7Ozs7QUFicUIsUUFpQnJCLENBQUssWUFBTCxJQUFxQixNQUFNLE9BQU4sQ0FBZSxVQUFmLElBQThCLFdBQVcsQ0FBWCxJQUFnQixJQUFoQixHQUF1QixXQUFXLENBQVgsQ0FBdkIsR0FBdUMsVUFBckUsQ0FqQkE7O0FBbUJyQiw0Q0FBZSxLQUFLLFFBQUwsRUFBZjs7Ozs7Ozs7QUFuQnFCLGlCQTJCckIsR0FBZ0IsS0FBSyxVQUFMLENBM0JLOztBQTZCckIsU0FBSyxZQUFMLEdBQW9CLEtBQUssWUFBTCxDQUFrQixLQUFsQixDQUF3QixJQUF4QixDQUFwQixDQTdCcUI7O0FBK0JyQixRQUFJLFVBQVUsS0FBSyxZQUFMLENBQWtCLE1BQWxCLEdBQTJCLENBQTNCOzs7QUEvQk8sUUFrQ3JCLENBQUssWUFBTCxDQUFtQixPQUFuQixJQUErQixZQUFZLEtBQUssWUFBTCxDQUFtQixPQUFuQixDQUFaLENBbENWOztBQW9DckIsU0FBSyxZQUFMLEdBQW9CLEtBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixJQUF2QixDQUFwQixDQXBDcUI7O0FBc0NyQixRQUFJLHVDQUFxQyxjQUFjLElBQWQsQ0FBbUIsR0FBbkIsYUFBOEIsS0FBSyxZQUFMLFFBQW5FLENBdENpQjs7QUF3Q3JCLFFBQUksS0FBSyxLQUFMLEVBQWEsUUFBUSxHQUFSLENBQWEsV0FBYixFQUFqQjtBQUNBLFFBQUksa0JBQWtCLElBQUksUUFBSixDQUNwQixXQURvQixDQUFsQixDQXpDaUI7O0FBNkNyQixnQkFBWSxpQkFBWjs7QUE3Q3FCLFlBK0NyQixDQUFTLE9BQVQsQ0FBa0IsZ0JBQVE7QUFDeEIsVUFBSSxPQUFPLE9BQU8sSUFBUCxDQUFhLElBQWIsRUFBb0IsQ0FBcEIsQ0FBUDtVQUNBLFFBQVEsS0FBTSxJQUFOLENBQVIsQ0FGb0I7O0FBSXhCLGdCQUFXLElBQVgsSUFBb0IsS0FBcEIsQ0FKd0I7S0FBUixDQUFsQjs7O0FBL0NxQixRQXVEakIsS0FBSyxLQUFMLEVBQWEsUUFBUSxHQUFSLENBQWEsVUFBVSxRQUFWLEVBQWIsRUFBakI7Ozs7Ozs7Ozs7O0FBdkRxQixXQWtFZCxTQUFQLENBbEVxQjtHQXZDUjtBQTRHZixnQ0FBVyxNQUFPOzs7QUFDaEIsUUFBSSxTQUFTLEtBQUssTUFBTCxDQUFZLEdBQVosQ0FBaUIsaUJBQVM7QUFDckMsVUFBSSxXQUFXLFFBQU8scURBQVAsS0FBaUIsUUFBakI7VUFDWCxZQURKLENBRHFDO0FBR3JDLFVBQUksUUFBSixFQUFlO0FBQ2IsWUFBSSxNQUFLLElBQUwsQ0FBVyxNQUFNLElBQU4sQ0FBZixFQUE4Qjs7QUFFNUIsZ0JBQU0sTUFBSyxJQUFMLENBQVcsTUFBTSxJQUFOLENBQWpCLENBRjRCO1NBQTlCLE1BR0s7QUFDSCxjQUFJLE9BQU8sTUFBTSxHQUFOLEVBQVAsQ0FERDtBQUVILGNBQUksTUFBTSxPQUFOLENBQWUsSUFBZixDQUFKLEVBQTRCO0FBQzFCLGtCQUFLLFlBQUwsSUFBcUIsS0FBSyxDQUFMLENBQXJCLENBRDBCO0FBRTFCLGtCQUFNLEtBQUssQ0FBTCxDQUFOLENBRjBCO1dBQTVCLE1BR0s7QUFDSCxrQkFBTSxJQUFOLENBREc7V0FITDtTQUxGO09BREYsTUFhSztBQUNILGNBQU0sS0FBTixDQURHO09BYkw7Ozs7O0FBSHFDLGFBdUI5QixHQUFQLENBdkJxQztLQUFULENBQTFCLENBRFk7O0FBMkJoQixXQUFPLE1BQVAsQ0EzQmdCO0dBNUdIO0NBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0J1xuXG4vKiBnZW4uanNcbiAqXG4gKiBsb3ctbGV2ZWwgY29kZSBnZW5lcmF0aW9uIGZvciB1bml0IGdlbmVyYXRvcnNcbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWNjdW06MCxcbiAgZ2V0VUlEKCkgeyByZXR1cm4gdGhpcy5hY2N1bSsrIH0sXG4gIGRlYnVnOmZhbHNlLFxuICBcbiAgLyogY2xvc3VyZXNcbiAgICpcbiAgICogRnVuY3Rpb25zIHRoYXQgYXJlIGluY2x1ZGVkIGFzIGFyZ3VtZW50cyB0byBtYXN0ZXIgY2FsbGJhY2suIEV4YW1wbGVzOiBNYXRoLmFicywgTWF0aC5yYW5kb20gZXRjLlxuICAgKlxuICAgKi9cblxuICBjbG9zdXJlczpuZXcgU2V0KCksXG5cbiAgcGFyYW1ldGVyczpbXSxcblxuICBtZW1vOiB7fSxcbiAgXG4gIC8qIGV4cG9ydFxuICAgKlxuICAgKiBwbGFjZSBnZW4gZnVuY3Rpb25zIGludG8gYW5vdGhlciBvYmplY3QgZm9yIGVhc2llciByZWZlcmVuY2VcbiAgICovXG5cbiAgZXhwb3J0KCBvYmogKSB7fSxcbiAgXG4gIC8qIGNyZWF0ZUNhbGxiYWNrXG4gICAqXG4gICAqIHBhcmFtIHVnZW4gLSBIZWFkIG9mIGdyYXBoIHRvIGJlIGNvZGVnZW4nZFxuICAgKlxuICAgKiBHZW5lcmF0ZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVnZW4gZ3JhcGguXG4gICAqIFRoZSBnZW4uY2xvc3VyZXMgcHJvcGVydHkgc3RvcmVzIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmVcbiAgICogcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZmluYWwgZnVuY3Rpb247IHRoZXNlIGFyZSBwcmVmaXhlZFxuICAgKiBiZWZvcmUgYW55IGRlZmluZWQgcGFyYW1zIHRoZSBncmFwaCBleHBvc2VzLiBGb3IgZXhhbXBsZSwgZ2l2ZW46XG4gICAqXG4gICAqIGdlbi5jcmVhdGVDYWxsYmFjayggYWJzKCBwYXJhbSgpICkgKVxuICAgKlxuICAgKiAuLi4gdGhlIGdlbmVyYXRlZCBmdW5jdGlvbiB3aWxsIGhhdmUgYSBzaWduYXR1cmUgb2YgKCBhYnMsIHAwICkuXG4gICAqL1xuXG4gIGNyZWF0ZUNhbGxiYWNrKCB1Z2VuICkge1xuICAgIHRoaXMubWVtbyA9IHt9XG4gICAgdGhpcy5jbG9zdXJlcy5jbGVhcigpXG4gICAgdGhpcy5wYXJhbWV0ZXJzLmxlbmd0aCA9IDBcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gXCIndXNlIHN0cmljdCc7XFxuXCJcblxuICAgIGxldCBfZnVuY3Rpb24sXG4gICAgICAgIGNsb3N1cmVzLFxuICAgICAgICBhcmd1bWVudE5hbWVzLFxuICAgICAgICBhcmd1bWVudFZhbHVlcyxcbiAgICAgICAgaGVhZE91dHB1dFxuXG4gICAgaGVhZE91dHB1dCA9IHVnZW4uZ2VuKClcblxuICAgIC8vIGlmIGdlbiByZXR1cm5zIGFycmF5LCBhZGQgdWdlbiBjYWxsYmFjayBib2R5IGFuZCB0aGVuIHJldHVybiBuYW1lIG9mIHVnZW5cbiAgICAvLyBvdGhlcndpc2UsIHJldHVybiB3aGF0IGV2ZXIgdGhlIG91dHB1dCBvZiB0aGUgY2FsbCB0byAuZ2VuKCkgaXNcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSArPSBBcnJheS5pc0FycmF5KCBoZWFkT3V0cHV0ICkgPyBoZWFkT3V0cHV0WzFdICsgJ1xcbicgKyBoZWFkT3V0cHV0WzBdIDogaGVhZE91dHB1dFxuXG4gICAgY2xvc3VyZXMgPSBbLi4udGhpcy5jbG9zdXJlc11cblxuICAgIC8vIGVudHJpZXMgaW4gY2xvc3VyZSBzZXQgdGFrZSBmcm9tIHsgbmFtZTogZnVuY3Rpb24vb2JqZWN0IH1cbiAgICAvLyBhcmd1bWVudE5hbWVzID0gY2xvc3VyZXMubWFwKCB2ID0+IE9iamVjdC5rZXlzKCB2IClbMF0gKSBcbiAgICBcbiAgICAvLyBYWFggZXJyci4uLiB0aGlzIGNvdWxkIGJlIG1vcmUgcmVhZGFibGUuIEVzc2VuZXRpYWxseSwgbG9vcCB0aHJvdWdoIG5hbWVzLCBmaW5kIGNsb3N1cmUgd2l0aCBuYW1lLCByZXR1cm4gY2xvc3VyZSB2YWx1ZVxuICAgIC8vYXJndW1lbnRWYWx1ZXM9IGFyZ3VtZW50TmFtZXMubWFwKCBrZXkgPT4gY2xvc3VyZXMuZmluZCggdiA9PiB2W2tleV0gIT09IHVuZGVmaW5lZCApWyBrZXkgXSApXG4gICAgXG4gICAgYXJndW1lbnROYW1lcyA9IHRoaXMucGFyYW1ldGVyc1xuXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5zcGxpdCgnXFxuJylcblxuICAgIGxldCBsYXN0aWR4ID0gdGhpcy5mdW5jdGlvbkJvZHkubGVuZ3RoIC0gMVxuXG4gICAgLy8gaW5zZXJ0IHJldHVybiBrZXl3b3JkXG4gICAgdGhpcy5mdW5jdGlvbkJvZHlbIGxhc3RpZHggXSA9ICdyZXR1cm4gJyArIHRoaXMuZnVuY3Rpb25Cb2R5WyBsYXN0aWR4IF0gXG4gICAgXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKVxuXG4gICAgbGV0IGJ1aWxkU3RyaW5nID0gYHJldHVybiBmdW5jdGlvbiBnZW4oJHthcmd1bWVudE5hbWVzLmpvaW4oJywnKX0pe1xcbiR7dGhpcy5mdW5jdGlvbkJvZHl9XFxufWBcbiAgICBcbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCBidWlsZFN0cmluZyApIFxuICAgIGxldCBmdW5jdGlvbkJ1aWxkZXIgPSBuZXcgRnVuY3Rpb24oXG4gICAgICBidWlsZFN0cmluZyAgICAgIFxuICAgIClcblxuICAgIF9mdW5jdGlvbiA9IGZ1bmN0aW9uQnVpbGRlcigpIC8vbmV3IEZ1bmN0aW9uKCBhcmd1bWVudE5hbWVzLCB0aGlzLmZ1bmN0aW9uQm9keSApXG4gICAgXG4gICAgY2xvc3VyZXMuZm9yRWFjaCggZGljdCA9PiB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdmFsdWUgPSBkaWN0WyBuYW1lIF1cblxuICAgICAgX2Z1bmN0aW9uWyBuYW1lIF0gPSB2YWx1ZVxuICAgIH0pXG4gICAgLy9fZnVuY3Rpb24uY2xvc3VyZXMgPSBhcmd1bWVudFZhbHVlc1xuICAgIFxuICAgIGlmKCB0aGlzLmRlYnVnICkgY29uc29sZS5sb2coIF9mdW5jdGlvbi50b1N0cmluZygpIClcbiAgICBcbiAgICAvLyBYWFggY2FuIHRoZSBhcnJheSBzbGljaW5nIC8gY29uY2F0ZW50YXRpb24gYmUgb3B0aW1pemVkP1xuICAgIC8vIHBlcmhhcHMgdGhlIGNsb3N1cmUgZnVuY3Rpb25zIGNvdWxkIGluc3RlYWQgYmUgcHJvcGVydGllcyBvZiB0aGUgZnVuY3Rpb25cbiAgICAvLyBpdHNlbGYsIHJlZmVyZW5jZWQgdmlhICd0aGlzJyBpbiB0aGUgZnVuY3Rpb24gYm9keSwgaW5zdGVhZCBvZiBpbmxpbmVkXG4gICAgLy8gZnVuY3Rpb24gYXJndW1lbnRzLiBUaGVuIG5vIGNvbmNhdGVuYXRpb24gd291bGQgYmUgcmVxdWlyZWQuXG4gICAgLy9sZXQgb3V0ID0gZnVuY3Rpb24oKSB7IFxuICAgIC8vICBsZXQgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMsIDAgKVxuICAgIC8vICByZXR1cm4gX2Z1bmN0aW9uLmFwcGx5KCBudWxsLCBfZnVuY3Rpb24uY2xvc3VyZXMuY29uY2F0KCBhcmdzICkgKSBcbiAgICAvL31cblxuICAgIHJldHVybiBfZnVuY3Rpb25cbiAgfSxcblxuICBnZXRJbnB1dHMoIHVnZW4gKSB7XG4gICAgbGV0IGlucHV0cyA9IHVnZW4uaW5wdXRzLm1hcCggaW5wdXQgPT4ge1xuICAgICAgbGV0IGlzT2JqZWN0ID0gdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyxcbiAgICAgICAgICBvdXRcbiAgICAgIGlmKCBpc09iamVjdCApIHtcbiAgICAgICAgaWYoIHRoaXMubWVtb1sgaW5wdXQubmFtZSBdICkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coXCJNRU1PXCIsIGlucHV0Lm5hbWUsIHRoaXMubWVtb1sgaW5wdXQubmFtZSBdIClcbiAgICAgICAgICBvdXQgPSB0aGlzLm1lbW9bIGlucHV0Lm5hbWUgXVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBsZXQgY29kZSA9IGlucHV0LmdlbigpXG4gICAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGNvZGUgKSApIHtcbiAgICAgICAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV1cbiAgICAgICAgICAgIG91dCA9IGNvZGVbMF1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG91dCA9IGNvZGVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgPSBpbnB1dFxuICAgICAgfVxuXG4gICAgICAvL2lmKCBvdXQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIC8vICBjb25zb2xlLmxvZyggJ3VuZGVmaW5lZCBpbnB1dDogJywgaW5wdXQgKVxuICAgICAgLy99XG4gICAgICByZXR1cm4gb3V0XG4gICAgfSlcblxuICAgIHJldHVybiBpbnB1dHNcbiAgfVxufVxuIl19
