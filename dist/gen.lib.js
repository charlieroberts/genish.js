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
        argumentValues = void 0,
        headOutput = void 0;

    headOutput = ugen.gen();
    this.functionBody += Array.isArray(headOutput) ? headOutput[1] + '\n' + headOutput[0] : headOutput;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9nZW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxPQUFQLEdBQWlCOztBQUVmLFNBQU0sQ0FBTjtBQUNBLDRCQUFTO0FBQUUsV0FBTyxLQUFLLEtBQUwsRUFBUCxDQUFGO0dBSE07Ozs7Ozs7OztBQVdmLFlBQVMsSUFBSSxHQUFKLEVBQVQ7O0FBRUEsY0FBVyxFQUFYOztBQUVBLFFBQU0sRUFBTjs7Ozs7OztBQU9BLDJCQUFRLEtBQU0sRUF0QkM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0NmLDBDQUFnQixNQUFPO0FBQ3JCLFNBQUssSUFBTCxHQUFZLEVBQVosQ0FEcUI7QUFFckIsU0FBSyxRQUFMLENBQWMsS0FBZCxHQUZxQjtBQUdyQixTQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBekIsQ0FIcUI7O0FBS3JCLFNBQUssWUFBTCxHQUFvQixpQkFBcEIsQ0FMcUI7O0FBT3JCLFFBQUksa0JBQUo7UUFDSSxpQkFESjtRQUVJLHNCQUZKO1FBR0ksdUJBSEo7UUFJSSxtQkFKSixDQVBxQjs7QUFhckIsaUJBQWEsS0FBSyxHQUFMLEVBQWIsQ0FicUI7QUFjckIsU0FBSyxZQUFMLElBQXFCLE1BQU0sT0FBTixDQUFlLFVBQWYsSUFBOEIsV0FBVyxDQUFYLElBQWdCLElBQWhCLEdBQXVCLFdBQVcsQ0FBWCxDQUF2QixHQUF1QyxVQUFyRSxDQWRBOztBQWdCckIsNENBQWUsS0FBSyxRQUFMLEVBQWY7OztBQWhCcUIsaUJBbUJyQixHQUFnQixTQUFTLEdBQVQsQ0FBYzthQUFLLE9BQU8sSUFBUCxDQUFhLENBQWIsRUFBaUIsQ0FBakI7S0FBTCxDQUE5Qjs7O0FBbkJxQixrQkFzQnJCLEdBQWdCLGNBQWMsR0FBZCxDQUFtQjthQUFPLFNBQVMsSUFBVCxDQUFlO2VBQUssRUFBRSxHQUFGLE1BQVcsU0FBWDtPQUFMLENBQWYsQ0FBNEMsR0FBNUM7S0FBUCxDQUFuQyxDQXRCcUI7O0FBd0JyQixvQkFBZ0IsY0FBYyxNQUFkLENBQXNCLEtBQUssVUFBTCxDQUF0QyxDQXhCcUI7O0FBMEJyQixTQUFLLFlBQUwsR0FBb0IsS0FBSyxZQUFMLENBQWtCLEtBQWxCLENBQXdCLElBQXhCLENBQXBCLENBMUJxQjtBQTJCckIsUUFBSSxVQUFVLEtBQUssWUFBTCxDQUFrQixNQUFsQixHQUEyQixDQUEzQixDQTNCTztBQTRCckIsU0FBSyxZQUFMLENBQW1CLE9BQW5CLElBQStCLFlBQVksS0FBSyxZQUFMLENBQW1CLE9BQW5CLENBQVosQ0E1QlY7QUE2QnJCLFNBQUssWUFBTCxHQUFvQixLQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBcEIsQ0E3QnFCOztBQStCckIsZ0JBQVksSUFBSSxRQUFKLENBQWMsYUFBZCxFQUE2QixLQUFLLFlBQUwsQ0FBekMsQ0EvQnFCOztBQWlDckIsY0FBVSxRQUFWLEdBQXFCLGNBQXJCOzs7Ozs7OztBQWpDcUIsUUF5Q2pCLE1BQU0sU0FBTixHQUFNLEdBQVc7QUFDbkIsVUFBSSxPQUFPLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixJQUF0QixDQUE0QixTQUE1QixFQUF1QyxDQUF2QyxDQUFQLENBRGU7QUFFbkIsYUFBTyxVQUFVLEtBQVYsQ0FBaUIsSUFBakIsRUFBdUIsVUFBVSxRQUFWLENBQW1CLE1BQW5CLENBQTJCLElBQTNCLENBQXZCLENBQVAsQ0FGbUI7S0FBWCxDQXpDVzs7QUE4Q3JCLFdBQU8sR0FBUCxDQTlDcUI7R0F0Q1I7QUF1RmYsZ0NBQVcsTUFBTzs7O0FBQ2hCLFFBQUksU0FBUyxLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWlCLGlCQUFTO0FBQ3JDLFVBQUksV0FBVyxRQUFPLHFEQUFQLEtBQWlCLFFBQWpCO1VBQ1gsWUFESixDQURxQztBQUdyQyxVQUFJLFFBQUosRUFBZTtBQUNiLFlBQUksTUFBSyxJQUFMLENBQVcsTUFBTSxJQUFOLENBQWYsRUFBOEI7O0FBRTVCLGdCQUFNLE1BQUssSUFBTCxDQUFXLE1BQU0sSUFBTixDQUFqQixDQUY0QjtTQUE5QixNQUdLO0FBQ0gsY0FBSSxPQUFPLE1BQU0sR0FBTixFQUFQLENBREQ7QUFFSCxjQUFJLE1BQU0sT0FBTixDQUFlLElBQWYsQ0FBSixFQUE0QjtBQUMxQixrQkFBSyxZQUFMLElBQXFCLEtBQUssQ0FBTCxDQUFyQixDQUQwQjtBQUUxQixrQkFBTSxLQUFLLENBQUwsQ0FBTixDQUYwQjtXQUE1QixNQUdLO0FBQ0gsa0JBQU0sSUFBTixDQURHO1dBSEw7U0FMRjtPQURGLE1BYUs7QUFDSCxjQUFNLEtBQU4sQ0FERztPQWJMOztBQWlCQSxVQUFJLFFBQVEsU0FBUixFQUFvQjtBQUN0QixnQkFBUSxHQUFSLENBQWEsbUJBQWIsRUFBa0MsS0FBbEMsRUFEc0I7T0FBeEI7QUFHQSxhQUFPLEdBQVAsQ0F2QnFDO0tBQVQsQ0FBMUIsQ0FEWTs7QUEyQmhCLFdBQU8sTUFBUCxDQTNCZ0I7R0F2Rkg7Q0FBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGdlbi5qc1xuICpcbiAqIGxvdy1sZXZlbCBjb2RlIGdlbmVyYXRpb24gZm9yIHVuaXQgZ2VuZXJhdG9yc1xuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY2N1bTowLFxuICBnZXRVSUQoKSB7IHJldHVybiB0aGlzLmFjY3VtKysgfSxcbiAgXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICpcbiAgICovXG5cbiAgY2xvc3VyZXM6bmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6W10sXG5cbiAgbWVtbzoge30sXG4gIFxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydCggb2JqICkge30sXG4gIFxuICAvKiBjcmVhdGVDYWxsYmFja1xuICAgKlxuICAgKiBwYXJhbSB1Z2VuIC0gSGVhZCBvZiBncmFwaCB0byBiZSBjb2RlZ2VuJ2RcbiAgICpcbiAgICogR2VuZXJhdGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGEgcGFydGljdWxhciB1Z2VuIGdyYXBoLlxuICAgKiBUaGUgZ2VuLmNsb3N1cmVzIHByb3BlcnR5IHN0b3JlcyBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlXG4gICAqIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGZpbmFsIGZ1bmN0aW9uOyB0aGVzZSBhcmUgcHJlZml4ZWRcbiAgICogYmVmb3JlIGFueSBkZWZpbmVkIHBhcmFtcyB0aGUgZ3JhcGggZXhwb3Nlcy4gRm9yIGV4YW1wbGUsIGdpdmVuOlxuICAgKlxuICAgKiBnZW4uY3JlYXRlQ2FsbGJhY2soIGFicyggcGFyYW0oKSApIClcbiAgICpcbiAgICogLi4uIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gd2lsbCBoYXZlIGEgc2lnbmF0dXJlIG9mICggYWJzLCBwMCApLlxuICAgKi9cblxuICBjcmVhdGVDYWxsYmFjayggdWdlbiApIHtcbiAgICB0aGlzLm1lbW8gPSB7fVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMucGFyYW1ldGVycy5sZW5ndGggPSAwXG5cbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiJ3VzZSBzdHJpY3QnO1xcblwiXG5cbiAgICBsZXQgX2Z1bmN0aW9uLFxuICAgICAgICBjbG9zdXJlcyxcbiAgICAgICAgYXJndW1lbnROYW1lcyxcbiAgICAgICAgYXJndW1lbnRWYWx1ZXMsXG4gICAgICAgIGhlYWRPdXRwdXRcblxuICAgIGhlYWRPdXRwdXQgPSB1Z2VuLmdlbigpXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gQXJyYXkuaXNBcnJheSggaGVhZE91dHB1dCApID8gaGVhZE91dHB1dFsxXSArICdcXG4nICsgaGVhZE91dHB1dFswXSA6IGhlYWRPdXRwdXRcblxuICAgIGNsb3N1cmVzID0gWy4uLnRoaXMuY2xvc3VyZXNdXG5cbiAgICAvLyBlbnRyaWVzIGluIGNsb3N1cmUgc2V0IHRha2UgZnJvbSB7IG5hbWUsIGZ1bmN0aW9uIH1cbiAgICBhcmd1bWVudE5hbWVzID0gY2xvc3VyZXMubWFwKCB2ID0+IE9iamVjdC5rZXlzKCB2IClbMF0gKSBcbiAgICBcbiAgICAvLyBYWFggZXJyci4uLiB0aGlzIGNvdWxkIGJlIG1vcmUgcmVhZGFibGUuIEVzc2VuZXRpYWxseSwgbG9vcCB0aHJvdWdoIG5hbWVzLCBmaW5kIGNsb3N1cmUgd2l0aCBuYW1lLCByZXR1cm4gY2xvc3VyZSB2YWx1ZVxuICAgIGFyZ3VtZW50VmFsdWVzPSBhcmd1bWVudE5hbWVzLm1hcCgga2V5ID0+IGNsb3N1cmVzLmZpbmQoIHYgPT4gdltrZXldICE9PSB1bmRlZmluZWQgKVsga2V5IF0gKVxuICAgIFxuICAgIGFyZ3VtZW50TmFtZXMgPSBhcmd1bWVudE5hbWVzLmNvbmNhdCggdGhpcy5wYXJhbWV0ZXJzIClcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpXG4gICAgbGV0IGxhc3RpZHggPSB0aGlzLmZ1bmN0aW9uQm9keS5sZW5ndGggLSAxXG4gICAgdGhpcy5mdW5jdGlvbkJvZHlbIGxhc3RpZHggXSA9ICdyZXR1cm4gJyArIHRoaXMuZnVuY3Rpb25Cb2R5WyBsYXN0aWR4IF0gXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKVxuICAgIFxuICAgIF9mdW5jdGlvbiA9IG5ldyBGdW5jdGlvbiggYXJndW1lbnROYW1lcywgdGhpcy5mdW5jdGlvbkJvZHkgKVxuXG4gICAgX2Z1bmN0aW9uLmNsb3N1cmVzID0gYXJndW1lbnRWYWx1ZXNcbiAgICBcbiAgICAvL2NvbnNvbGUubG9nKCBfZnVuY3Rpb24udG9TdHJpbmcoKSApXG4gICAgXG4gICAgLy8gWFhYIGNhbiB0aGUgYXJyYXkgc2xpY2luZyAvIGNvbmNhdGVudGF0aW9uIGJlIG9wdGltaXplZD9cbiAgICAvLyBwZXJoYXBzIHRoZSBjbG9zdXJlIGZ1bmN0aW9ucyBjb3VsZCBpbnN0ZWFkIGJlIHByb3BlcnRpZXMgb2YgdGhlIGZ1bmN0aW9uXG4gICAgLy8gaXRzZWxmLCByZWZlcmVuY2VkIHZpYSAndGhpcycgaW4gdGhlIGZ1bmN0aW9uIGJvZHksIGluc3RlYWQgb2YgaW5saW5lZFxuICAgIC8vIGZ1bmN0aW9uIGFyZ3VtZW50cy4gVGhlbiBubyBjb25jYXRlbmF0aW9uIHdvdWxkIGJlIHJlcXVpcmVkLlxuICAgIGxldCBvdXQgPSBmdW5jdGlvbigpIHsgXG4gICAgICBsZXQgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMsIDAgKVxuICAgICAgcmV0dXJuIF9mdW5jdGlvbi5hcHBseSggbnVsbCwgX2Z1bmN0aW9uLmNsb3N1cmVzLmNvbmNhdCggYXJncyApICkgXG4gICAgfVxuXG4gICAgcmV0dXJuIG91dFxuICB9LFxuXG4gIGdldElucHV0cyggdWdlbiApIHtcbiAgICBsZXQgaW5wdXRzID0gdWdlbi5pbnB1dHMubWFwKCBpbnB1dCA9PiB7XG4gICAgICBsZXQgaXNPYmplY3QgPSB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnLFxuICAgICAgICAgIG91dFxuICAgICAgaWYoIGlzT2JqZWN0ICkge1xuICAgICAgICBpZiggdGhpcy5tZW1vWyBpbnB1dC5uYW1lIF0gKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhcIk1FTU9cIiwgaW5wdXQubmFtZSwgdGhpcy5tZW1vWyBpbnB1dC5uYW1lIF0gKVxuICAgICAgICAgIG91dCA9IHRoaXMubWVtb1sgaW5wdXQubmFtZSBdXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGxldCBjb2RlID0gaW5wdXQuZ2VuKClcbiAgICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggY29kZSApICkge1xuICAgICAgICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gY29kZVsxXVxuICAgICAgICAgICAgb3V0ID0gY29kZVswXVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgb3V0ID0gY29kZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9IGlucHV0XG4gICAgICB9XG5cbiAgICAgIGlmKCBvdXQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgY29uc29sZS5sb2coICd1bmRlZmluZWQgaW5wdXQ6ICcsIGlucHV0IClcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRcbiAgICB9KVxuXG4gICAgcmV0dXJuIGlucHV0c1xuICB9XG5cblxuXG59XG5cbi8vaW1wb3J0IGFicyAgIGZyb20gJy4vYWJzLmpzJ1xuLy9pbXBvcnQgcGFyYW0gZnJvbSAnLi9wYXJhbS5qcydcbi8vaW1wb3J0IGFkZCAgIGZyb20gJy4vYWRkLmpzJ1xuLy9pbXBvcnQgbXVsICAgZnJvbSAnLi9hZGQuanMnXG5cbi8vT2JqZWN0LmFzc2lnbiggZ2VuLCB7XG4vLyAgYWJzLFxuLy8gIHBhcmFtLFxuLy8gIGFkZCxcbi8vICBtdWxcbi8vfSlcbiJdfQ==
