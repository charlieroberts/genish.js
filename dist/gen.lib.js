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
        argumentValues = void 0;

    //if( Array.isArray( functionBody ) ) {
    //  this.memo[ functionBody[0] ] = functionBody[0] + '_out'
    //}
    ugen.gen();
    closures = [].concat(_toConsumableArray(this.closures));
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

    this.functionBody = this.functionBody.split('\n');
    var lastidx = this.functionBody.length - 1;
    this.functionBody[lastidx] = 'return ' + this.functionBody[lastidx];
    this.functionBody = this.functionBody.join('\n');

    console.log(this.functionBody);
    _function = new Function(argumentNames, this.functionBody);

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
    var _this = this;

    var inputs = ugen.inputs.map(function (input) {
      var isObject = (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object',
          out = void 0;
      if (isObject) {
        if (_this.memo[input.name]) {
          console.log("MEMO", input.name, _this.memo[input.name]);
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

      if (out === undefined) {
        console.log('undefined input: ', input);
      }
      return out;
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9nZW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxPQUFQLEdBQWlCOztBQUVmLFNBQU0sQ0FBTjtBQUNBLDRCQUFTO0FBQUUsV0FBTyxLQUFLLEtBQUwsRUFBUCxDQUFGO0dBSE07Ozs7Ozs7OztBQVdmLFlBQVMsSUFBSSxHQUFKLEVBQVQ7O0FBRUEsY0FBVyxFQUFYOztBQUVBLFFBQU0sRUFBTjs7Ozs7OztBQU9BLDJCQUFRLEtBQU0sRUF0QkM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0NmLDBDQUFnQixNQUFPO0FBQ3JCLFNBQUssSUFBTCxHQUFZLEVBQVosQ0FEcUI7QUFFckIsU0FBSyxRQUFMLENBQWMsS0FBZCxHQUZxQjtBQUdyQixTQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBekIsQ0FIcUI7O0FBS3JCLFNBQUssWUFBTCxHQUFvQixpQkFBcEIsQ0FMcUI7O0FBT3JCLFFBQUksa0JBQUo7UUFDSSxpQkFESjtRQUVJLHNCQUZKO1FBR0ksdUJBSEo7Ozs7O0FBUHFCLFFBZ0JyQixDQUFLLEdBQUwsR0FoQnFCO0FBaUJyQiw0Q0FBZSxLQUFLLFFBQUwsRUFBZjs7QUFqQnFCLGlCQW1CckIsR0FBZ0IsU0FBUyxHQUFULENBQWM7YUFBSyxPQUFPLElBQVAsQ0FBYSxDQUFiLEVBQWlCLENBQWpCO0tBQUwsQ0FBOUI7OztBQW5CcUIsa0JBc0JyQixHQUFnQixjQUFjLEdBQWQsQ0FBbUI7YUFBTyxTQUFTLElBQVQsQ0FBZTtlQUFLLEVBQUUsR0FBRixNQUFXLFNBQVg7T0FBTCxDQUFmLENBQTRDLEdBQTVDO0tBQVAsQ0FBbkMsQ0F0QnFCOztBQXdCckIsb0JBQWdCLGNBQWMsTUFBZCxDQUFzQixLQUFLLFVBQUwsQ0FBdEMsQ0F4QnFCOztBQTBCckIsU0FBSyxZQUFMLEdBQW9CLEtBQUssWUFBTCxDQUFrQixLQUFsQixDQUF3QixJQUF4QixDQUFwQixDQTFCcUI7QUEyQnJCLFFBQUksVUFBVSxLQUFLLFlBQUwsQ0FBa0IsTUFBbEIsR0FBMkIsQ0FBM0IsQ0EzQk87QUE0QnJCLFNBQUssWUFBTCxDQUFtQixPQUFuQixJQUErQixZQUFZLEtBQUssWUFBTCxDQUFtQixPQUFuQixDQUFaLENBNUJWO0FBNkJyQixTQUFLLFlBQUwsR0FBb0IsS0FBSyxZQUFMLENBQWtCLElBQWxCLENBQXVCLElBQXZCLENBQXBCLENBN0JxQjs7QUErQnJCLFlBQVEsR0FBUixDQUFhLEtBQUssWUFBTCxDQUFiLENBL0JxQjtBQWdDckIsZ0JBQVksSUFBSSxRQUFKLENBQWMsYUFBZCxFQUE2QixLQUFLLFlBQUwsQ0FBekMsQ0FoQ3FCOztBQWtDckIsY0FBVSxRQUFWLEdBQXFCLGNBQXJCOzs7Ozs7OztBQWxDcUIsUUEwQ2pCLE1BQU0sU0FBTixHQUFNLEdBQVc7QUFDbkIsVUFBSSxPQUFPLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixJQUF0QixDQUE0QixTQUE1QixFQUF1QyxDQUF2QyxDQUFQLENBRGU7QUFFbkIsYUFBTyxVQUFVLEtBQVYsQ0FBaUIsSUFBakIsRUFBdUIsVUFBVSxRQUFWLENBQW1CLE1BQW5CLENBQTJCLElBQTNCLENBQXZCLENBQVAsQ0FGbUI7S0FBWCxDQTFDVzs7QUErQ3JCLFdBQU8sR0FBUCxDQS9DcUI7R0F0Q1I7QUF3RmYsZ0NBQVcsTUFBTzs7O0FBQ2hCLFFBQUksU0FBUyxLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWlCLGlCQUFTO0FBQ3JDLFVBQUksV0FBVyxRQUFPLHFEQUFQLEtBQWlCLFFBQWpCO1VBQ1gsWUFESixDQURxQztBQUdyQyxVQUFJLFFBQUosRUFBZTtBQUNiLFlBQUksTUFBSyxJQUFMLENBQVcsTUFBTSxJQUFOLENBQWYsRUFBOEI7QUFDNUIsa0JBQVEsR0FBUixDQUFZLE1BQVosRUFBb0IsTUFBTSxJQUFOLEVBQVksTUFBSyxJQUFMLENBQVcsTUFBTSxJQUFOLENBQTNDLEVBRDRCO0FBRTVCLGdCQUFNLE1BQUssSUFBTCxDQUFXLE1BQU0sSUFBTixDQUFqQixDQUY0QjtTQUE5QixNQUdLO0FBQ0gsY0FBSSxPQUFPLE1BQU0sR0FBTixFQUFQLENBREQ7QUFFSCxjQUFJLE1BQU0sT0FBTixDQUFlLElBQWYsQ0FBSixFQUE0QjtBQUMxQixrQkFBSyxZQUFMLElBQXFCLEtBQUssQ0FBTCxDQUFyQixDQUQwQjtBQUUxQixrQkFBTSxLQUFLLENBQUwsQ0FBTixDQUYwQjtXQUE1QixNQUdLO0FBQ0gsa0JBQU0sSUFBTixDQURHO1dBSEw7U0FMRjtPQURGLE1BYUs7QUFDSCxjQUFNLEtBQU4sQ0FERztPQWJMOztBQWlCQSxVQUFJLFFBQVEsU0FBUixFQUFvQjtBQUN0QixnQkFBUSxHQUFSLENBQWEsbUJBQWIsRUFBa0MsS0FBbEMsRUFEc0I7T0FBeEI7QUFHQSxhQUFPLEdBQVAsQ0F2QnFDO0tBQVQsQ0FBMUIsQ0FEWTs7QUEyQmhCLFdBQU8sTUFBUCxDQTNCZ0I7R0F4Rkg7Q0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGdlbi5qc1xuICpcbiAqIGxvdy1sZXZlbCBjb2RlIGdlbmVyYXRpb24gZm9yIHVuaXQgZ2VuZXJhdG9yc1xuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY2N1bTowLFxuICBnZXRVSUQoKSB7IHJldHVybiB0aGlzLmFjY3VtKysgfSxcbiAgXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICpcbiAgICovXG5cbiAgY2xvc3VyZXM6bmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6W10sXG5cbiAgbWVtbzoge30sXG4gIFxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydCggb2JqICkge30sXG4gIFxuICAvKiBjcmVhdGVDYWxsYmFja1xuICAgKlxuICAgKiBwYXJhbSB1Z2VuIC0gSGVhZCBvZiBncmFwaCB0byBiZSBjb2RlZ2VuJ2RcbiAgICpcbiAgICogR2VuZXJhdGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGEgcGFydGljdWxhciB1Z2VuIGdyYXBoLlxuICAgKiBUaGUgZ2VuLmNsb3N1cmVzIHByb3BlcnR5IHN0b3JlcyBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlXG4gICAqIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGZpbmFsIGZ1bmN0aW9uOyB0aGVzZSBhcmUgcHJlZml4ZWRcbiAgICogYmVmb3JlIGFueSBkZWZpbmVkIHBhcmFtcyB0aGUgZ3JhcGggZXhwb3Nlcy4gRm9yIGV4YW1wbGUsIGdpdmVuOlxuICAgKlxuICAgKiBnZW4uY3JlYXRlQ2FsbGJhY2soIGFicyggcGFyYW0oKSApIClcbiAgICpcbiAgICogLi4uIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gd2lsbCBoYXZlIGEgc2lnbmF0dXJlIG9mICggYWJzLCBwMCApLlxuICAgKi9cblxuICBjcmVhdGVDYWxsYmFjayggdWdlbiApIHtcbiAgICB0aGlzLm1lbW8gPSB7fVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMucGFyYW1ldGVycy5sZW5ndGggPSAwXG5cbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiJ3VzZSBzdHJpY3QnO1xcblwiXG5cbiAgICBsZXQgX2Z1bmN0aW9uLFxuICAgICAgICBjbG9zdXJlcyxcbiAgICAgICAgYXJndW1lbnROYW1lcyxcbiAgICAgICAgYXJndW1lbnRWYWx1ZXNcbiAgICBcblxuICAgIC8vaWYoIEFycmF5LmlzQXJyYXkoIGZ1bmN0aW9uQm9keSApICkge1xuICAgIC8vICB0aGlzLm1lbW9bIGZ1bmN0aW9uQm9keVswXSBdID0gZnVuY3Rpb25Cb2R5WzBdICsgJ19vdXQnXG4gICAgLy99IFxuICAgIHVnZW4uZ2VuKClcbiAgICBjbG9zdXJlcyA9IFsuLi50aGlzLmNsb3N1cmVzXVxuICAgIC8vIGVudHJpZXMgaW4gY2xvc3VyZSBzZXQgdGFrZSBmcm9tIHsgbmFtZSwgZnVuY3Rpb24gfVxuICAgIGFyZ3VtZW50TmFtZXMgPSBjbG9zdXJlcy5tYXAoIHYgPT4gT2JqZWN0LmtleXMoIHYgKVswXSApIFxuICAgIFxuICAgIC8vIFhYWCBlcnJyLi4uIHRoaXMgY291bGQgYmUgbW9yZSByZWFkYWJsZS4gRXNzZW5ldGlhbGx5LCBsb29wIHRocm91Z2ggbmFtZXMsIGZpbmQgY2xvc3VyZSB3aXRoIG5hbWUsIHJldHVybiBjbG9zdXJlIHZhbHVlXG4gICAgYXJndW1lbnRWYWx1ZXM9IGFyZ3VtZW50TmFtZXMubWFwKCBrZXkgPT4gY2xvc3VyZXMuZmluZCggdiA9PiB2W2tleV0gIT09IHVuZGVmaW5lZCApWyBrZXkgXSApXG4gICAgXG4gICAgYXJndW1lbnROYW1lcyA9IGFyZ3VtZW50TmFtZXMuY29uY2F0KCB0aGlzLnBhcmFtZXRlcnMgKVxuXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5zcGxpdCgnXFxuJylcbiAgICBsZXQgbGFzdGlkeCA9IHRoaXMuZnVuY3Rpb25Cb2R5Lmxlbmd0aCAtIDFcbiAgICB0aGlzLmZ1bmN0aW9uQm9keVsgbGFzdGlkeCBdID0gJ3JldHVybiAnICsgdGhpcy5mdW5jdGlvbkJvZHlbIGxhc3RpZHggXSBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmpvaW4oJ1xcbicpXG4gICAgXG4gICAgY29uc29sZS5sb2coIHRoaXMuZnVuY3Rpb25Cb2R5IClcbiAgICBfZnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24oIGFyZ3VtZW50TmFtZXMsIHRoaXMuZnVuY3Rpb25Cb2R5IClcblxuICAgIF9mdW5jdGlvbi5jbG9zdXJlcyA9IGFyZ3VtZW50VmFsdWVzXG4gICAgXG4gICAgLy9jb25zb2xlLmxvZyggX2Z1bmN0aW9uLnRvU3RyaW5nKCkgKVxuICAgIFxuICAgIC8vIFhYWCBjYW4gdGhlIGFycmF5IHNsaWNpbmcgLyBjb25jYXRlbnRhdGlvbiBiZSBvcHRpbWl6ZWQ/XG4gICAgLy8gcGVyaGFwcyB0aGUgY2xvc3VyZSBmdW5jdGlvbnMgY291bGQgaW5zdGVhZCBiZSBwcm9wZXJ0aWVzIG9mIHRoZSBmdW5jdGlvblxuICAgIC8vIGl0c2VsZiwgcmVmZXJlbmNlZCB2aWEgJ3RoaXMnIGluIHRoZSBmdW5jdGlvbiBib2R5LCBpbnN0ZWFkIG9mIGlubGluZWRcbiAgICAvLyBmdW5jdGlvbiBhcmd1bWVudHMuIFRoZW4gbm8gY29uY2F0ZW5hdGlvbiB3b3VsZCBiZSByZXF1aXJlZC5cbiAgICBsZXQgb3V0ID0gZnVuY3Rpb24oKSB7IFxuICAgICAgbGV0IGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJndW1lbnRzLCAwIClcbiAgICAgIHJldHVybiBfZnVuY3Rpb24uYXBwbHkoIG51bGwsIF9mdW5jdGlvbi5jbG9zdXJlcy5jb25jYXQoIGFyZ3MgKSApIFxuICAgIH1cblxuICAgIHJldHVybiBvdXRcbiAgfSxcblxuICBnZXRJbnB1dHMoIHVnZW4gKSB7XG4gICAgbGV0IGlucHV0cyA9IHVnZW4uaW5wdXRzLm1hcCggaW5wdXQgPT4ge1xuICAgICAgbGV0IGlzT2JqZWN0ID0gdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyxcbiAgICAgICAgICBvdXRcbiAgICAgIGlmKCBpc09iamVjdCApIHtcbiAgICAgICAgaWYoIHRoaXMubWVtb1sgaW5wdXQubmFtZSBdICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiTUVNT1wiLCBpbnB1dC5uYW1lLCB0aGlzLm1lbW9bIGlucHV0Lm5hbWUgXSApXG4gICAgICAgICAgb3V0ID0gdGhpcy5tZW1vWyBpbnB1dC5uYW1lIF1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgbGV0IGNvZGUgPSBpbnB1dC5nZW4oKVxuICAgICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBjb2RlICkgKSB7XG4gICAgICAgICAgICB0aGlzLmZ1bmN0aW9uQm9keSArPSBjb2RlWzFdXG4gICAgICAgICAgICBvdXQgPSBjb2RlWzBdXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBvdXQgPSBjb2RlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ID0gaW5wdXRcbiAgICAgIH1cblxuICAgICAgaWYoIG91dCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBjb25zb2xlLmxvZyggJ3VuZGVmaW5lZCBpbnB1dDogJywgaW5wdXQgKVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dFxuICAgIH0pXG5cbiAgICByZXR1cm4gaW5wdXRzXG4gIH1cblxuXG5cbn1cblxuLy9pbXBvcnQgYWJzICAgZnJvbSAnLi9hYnMuanMnXG4vL2ltcG9ydCBwYXJhbSBmcm9tICcuL3BhcmFtLmpzJ1xuLy9pbXBvcnQgYWRkICAgZnJvbSAnLi9hZGQuanMnXG4vL2ltcG9ydCBtdWwgICBmcm9tICcuL2FkZC5qcydcblxuLy9PYmplY3QuYXNzaWduKCBnZW4sIHtcbi8vICBhYnMsXG4vLyAgcGFyYW0sXG4vLyAgYWRkLFxuLy8gIG11bFxuLy99KVxuIl19
