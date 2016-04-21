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

    // insert return keyword
    this.functionBody[lastidx] = 'return ' + this.functionBody[lastidx];

    this.functionBody = this.functionBody.join('\n');
    console.log('before function builder');

    var buildString = 'return function foo(' + argumentNames.join(',') + '){\n' + this.functionBody + '\n}';

    console.log('build string:', buildString);
    var functionBuilder = new Function(null, buildString);

    console.log('FUNCTION', functionBuilder.toString());

    _function = functionBuilder(); //new Function( argumentNames, this.functionBody )

    _function.closures = argumentValues;

    if (this.debug) console.log(_function.toString());

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

      //if( out === undefined ) {
      //  console.log( 'undefined input: ', input )
      //}
      return out;
    });

    return inputs;
  }
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9nZW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxPQUFQLEdBQWlCOztBQUVmLFNBQU0sQ0FBTjtBQUNBLDRCQUFTO0FBQUUsV0FBTyxLQUFLLEtBQUwsRUFBUCxDQUFGO0dBSE07O0FBSWYsU0FBTSxLQUFOOzs7Ozs7OztBQVFBLFlBQVMsSUFBSSxHQUFKLEVBQVQ7O0FBRUEsY0FBVyxFQUFYOztBQUVBLFFBQU0sRUFBTjs7Ozs7OztBQU9BLDJCQUFRLEtBQU0sRUF2QkM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUNmLDBDQUFnQixNQUFPO0FBQ3JCLFNBQUssSUFBTCxHQUFZLEVBQVosQ0FEcUI7QUFFckIsU0FBSyxRQUFMLENBQWMsS0FBZCxHQUZxQjtBQUdyQixTQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBekIsQ0FIcUI7O0FBS3JCLFNBQUssWUFBTCxHQUFvQixpQkFBcEIsQ0FMcUI7O0FBT3JCLFFBQUksa0JBQUo7UUFDSSxpQkFESjtRQUVJLHNCQUZKO1FBR0ksdUJBSEo7UUFJSSxtQkFKSixDQVBxQjs7QUFhckIsaUJBQWEsS0FBSyxHQUFMLEVBQWI7Ozs7QUFicUIsUUFpQnJCLENBQUssWUFBTCxJQUFxQixNQUFNLE9BQU4sQ0FBZSxVQUFmLElBQThCLFdBQVcsQ0FBWCxJQUFnQixJQUFoQixHQUF1QixXQUFXLENBQVgsQ0FBdkIsR0FBdUMsVUFBckUsQ0FqQkE7O0FBbUJyQiw0Q0FBZSxLQUFLLFFBQUwsRUFBZjs7O0FBbkJxQixpQkFzQnJCLEdBQWdCLFNBQVMsR0FBVCxDQUFjO2FBQUssT0FBTyxJQUFQLENBQWEsQ0FBYixFQUFpQixDQUFqQjtLQUFMLENBQTlCOzs7QUF0QnFCLGtCQXlCckIsR0FBZ0IsY0FBYyxHQUFkLENBQW1CO2FBQU8sU0FBUyxJQUFULENBQWU7ZUFBSyxFQUFFLEdBQUYsTUFBVyxTQUFYO09BQUwsQ0FBZixDQUE0QyxHQUE1QztLQUFQLENBQW5DLENBekJxQjs7QUEyQnJCLG9CQUFnQixjQUFjLE1BQWQsQ0FBc0IsS0FBSyxVQUFMLENBQXRDLENBM0JxQjs7QUE2QnJCLFNBQUssWUFBTCxHQUFvQixLQUFLLFlBQUwsQ0FBa0IsS0FBbEIsQ0FBd0IsSUFBeEIsQ0FBcEIsQ0E3QnFCOztBQStCckIsUUFBSSxVQUFVLEtBQUssWUFBTCxDQUFrQixNQUFsQixHQUEyQixDQUEzQjs7O0FBL0JPLFFBa0NyQixDQUFLLFlBQUwsQ0FBbUIsT0FBbkIsSUFBK0IsWUFBWSxLQUFLLFlBQUwsQ0FBbUIsT0FBbkIsQ0FBWixDQWxDVjs7QUFvQ3JCLFNBQUssWUFBTCxHQUFvQixLQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsSUFBdkIsQ0FBcEIsQ0FwQ3FCO0FBcUNyQixZQUFRLEdBQVIsQ0FBYSx5QkFBYixFQXJDcUI7O0FBdUNyQixRQUFJLHVDQUFxQyxjQUFjLElBQWQsQ0FBbUIsR0FBbkIsYUFBOEIsS0FBSyxZQUFMLFFBQW5FLENBdkNpQjs7QUF5Q3JCLFlBQVEsR0FBUixDQUFhLGVBQWIsRUFBOEIsV0FBOUIsRUF6Q3FCO0FBMENyQixRQUFJLGtCQUFrQixJQUFJLFFBQUosQ0FDcEIsSUFEb0IsRUFFcEIsV0FGb0IsQ0FBbEIsQ0ExQ2lCOztBQStDckIsWUFBUSxHQUFSLENBQWEsVUFBYixFQUF5QixnQkFBZ0IsUUFBaEIsRUFBekIsRUEvQ3FCOztBQWlEckIsZ0JBQVksaUJBQVo7O0FBakRxQixhQW1EckIsQ0FBVSxRQUFWLEdBQXFCLGNBQXJCLENBbkRxQjs7QUFxRHJCLFFBQUksS0FBSyxLQUFMLEVBQWEsUUFBUSxHQUFSLENBQWEsVUFBVSxRQUFWLEVBQWIsRUFBakI7Ozs7OztBQXJEcUIsUUEyRGpCLE1BQU0sU0FBTixHQUFNLEdBQVc7QUFDbkIsVUFBSSxPQUFPLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixJQUF0QixDQUE0QixTQUE1QixFQUF1QyxDQUF2QyxDQUFQLENBRGU7QUFFbkIsYUFBTyxVQUFVLEtBQVYsQ0FBaUIsSUFBakIsRUFBdUIsVUFBVSxRQUFWLENBQW1CLE1BQW5CLENBQTJCLElBQTNCLENBQXZCLENBQVAsQ0FGbUI7S0FBWCxDQTNEVzs7QUFnRXJCLFdBQU8sR0FBUCxDQWhFcUI7R0F2Q1I7QUEwR2YsZ0NBQVcsTUFBTzs7O0FBQ2hCLFFBQUksU0FBUyxLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWlCLGlCQUFTO0FBQ3JDLFVBQUksV0FBVyxRQUFPLHFEQUFQLEtBQWlCLFFBQWpCO1VBQ1gsWUFESixDQURxQztBQUdyQyxVQUFJLFFBQUosRUFBZTtBQUNiLFlBQUksTUFBSyxJQUFMLENBQVcsTUFBTSxJQUFOLENBQWYsRUFBOEI7O0FBRTVCLGdCQUFNLE1BQUssSUFBTCxDQUFXLE1BQU0sSUFBTixDQUFqQixDQUY0QjtTQUE5QixNQUdLO0FBQ0gsY0FBSSxPQUFPLE1BQU0sR0FBTixFQUFQLENBREQ7QUFFSCxjQUFJLE1BQU0sT0FBTixDQUFlLElBQWYsQ0FBSixFQUE0QjtBQUMxQixrQkFBSyxZQUFMLElBQXFCLEtBQUssQ0FBTCxDQUFyQixDQUQwQjtBQUUxQixrQkFBTSxLQUFLLENBQUwsQ0FBTixDQUYwQjtXQUE1QixNQUdLO0FBQ0gsa0JBQU0sSUFBTixDQURHO1dBSEw7U0FMRjtPQURGLE1BYUs7QUFDSCxjQUFNLEtBQU4sQ0FERztPQWJMOzs7OztBQUhxQyxhQXVCOUIsR0FBUCxDQXZCcUM7S0FBVCxDQUExQixDQURZOztBQTJCaEIsV0FBTyxNQUFQLENBM0JnQjtHQTFHSDtDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxuLyogZ2VuLmpzXG4gKlxuICogbG93LWxldmVsIGNvZGUgZ2VuZXJhdGlvbiBmb3IgdW5pdCBnZW5lcmF0b3JzXG4gKlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFjY3VtOjAsXG4gIGdldFVJRCgpIHsgcmV0dXJuIHRoaXMuYWNjdW0rKyB9LFxuICBkZWJ1ZzpmYWxzZSxcbiAgXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICpcbiAgICovXG5cbiAgY2xvc3VyZXM6bmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6W10sXG5cbiAgbWVtbzoge30sXG4gIFxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydCggb2JqICkge30sXG4gIFxuICAvKiBjcmVhdGVDYWxsYmFja1xuICAgKlxuICAgKiBwYXJhbSB1Z2VuIC0gSGVhZCBvZiBncmFwaCB0byBiZSBjb2RlZ2VuJ2RcbiAgICpcbiAgICogR2VuZXJhdGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGEgcGFydGljdWxhciB1Z2VuIGdyYXBoLlxuICAgKiBUaGUgZ2VuLmNsb3N1cmVzIHByb3BlcnR5IHN0b3JlcyBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlXG4gICAqIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGZpbmFsIGZ1bmN0aW9uOyB0aGVzZSBhcmUgcHJlZml4ZWRcbiAgICogYmVmb3JlIGFueSBkZWZpbmVkIHBhcmFtcyB0aGUgZ3JhcGggZXhwb3Nlcy4gRm9yIGV4YW1wbGUsIGdpdmVuOlxuICAgKlxuICAgKiBnZW4uY3JlYXRlQ2FsbGJhY2soIGFicyggcGFyYW0oKSApIClcbiAgICpcbiAgICogLi4uIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gd2lsbCBoYXZlIGEgc2lnbmF0dXJlIG9mICggYWJzLCBwMCApLlxuICAgKi9cblxuICBjcmVhdGVDYWxsYmFjayggdWdlbiApIHtcbiAgICB0aGlzLm1lbW8gPSB7fVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMucGFyYW1ldGVycy5sZW5ndGggPSAwXG5cbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiJ3VzZSBzdHJpY3QnO1xcblwiXG5cbiAgICBsZXQgX2Z1bmN0aW9uLFxuICAgICAgICBjbG9zdXJlcyxcbiAgICAgICAgYXJndW1lbnROYW1lcyxcbiAgICAgICAgYXJndW1lbnRWYWx1ZXMsXG4gICAgICAgIGhlYWRPdXRwdXRcblxuICAgIGhlYWRPdXRwdXQgPSB1Z2VuLmdlbigpXG5cbiAgICAvLyBpZiBnZW4gcmV0dXJucyBhcnJheSwgYWRkIHVnZW4gY2FsbGJhY2sgYm9keSBhbmQgdGhlbiByZXR1cm4gbmFtZSBvZiB1Z2VuXG4gICAgLy8gb3RoZXJ3aXNlLCByZXR1cm4gd2hhdCBldmVyIHRoZSBvdXRwdXQgb2YgdGhlIGNhbGwgdG8gLmdlbigpIGlzXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gQXJyYXkuaXNBcnJheSggaGVhZE91dHB1dCApID8gaGVhZE91dHB1dFsxXSArICdcXG4nICsgaGVhZE91dHB1dFswXSA6IGhlYWRPdXRwdXRcblxuICAgIGNsb3N1cmVzID0gWy4uLnRoaXMuY2xvc3VyZXNdXG5cbiAgICAvLyBlbnRyaWVzIGluIGNsb3N1cmUgc2V0IHRha2UgZnJvbSB7IG5hbWUsIGZ1bmN0aW9uIH1cbiAgICBhcmd1bWVudE5hbWVzID0gY2xvc3VyZXMubWFwKCB2ID0+IE9iamVjdC5rZXlzKCB2IClbMF0gKSBcbiAgICBcbiAgICAvLyBYWFggZXJyci4uLiB0aGlzIGNvdWxkIGJlIG1vcmUgcmVhZGFibGUuIEVzc2VuZXRpYWxseSwgbG9vcCB0aHJvdWdoIG5hbWVzLCBmaW5kIGNsb3N1cmUgd2l0aCBuYW1lLCByZXR1cm4gY2xvc3VyZSB2YWx1ZVxuICAgIGFyZ3VtZW50VmFsdWVzPSBhcmd1bWVudE5hbWVzLm1hcCgga2V5ID0+IGNsb3N1cmVzLmZpbmQoIHYgPT4gdltrZXldICE9PSB1bmRlZmluZWQgKVsga2V5IF0gKVxuICAgIFxuICAgIGFyZ3VtZW50TmFtZXMgPSBhcmd1bWVudE5hbWVzLmNvbmNhdCggdGhpcy5wYXJhbWV0ZXJzIClcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpXG5cbiAgICBsZXQgbGFzdGlkeCA9IHRoaXMuZnVuY3Rpb25Cb2R5Lmxlbmd0aCAtIDFcblxuICAgIC8vIGluc2VydCByZXR1cm4ga2V5d29yZFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5WyBsYXN0aWR4IF0gPSAncmV0dXJuICcgKyB0aGlzLmZ1bmN0aW9uQm9keVsgbGFzdGlkeCBdIFxuICAgIFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuam9pbignXFxuJylcbiAgICBjb25zb2xlLmxvZyggJ2JlZm9yZSBmdW5jdGlvbiBidWlsZGVyJyApXG5cbiAgICBsZXQgYnVpbGRTdHJpbmcgPSBgcmV0dXJuIGZ1bmN0aW9uIGZvbygke2FyZ3VtZW50TmFtZXMuam9pbignLCcpfSl7XFxuJHt0aGlzLmZ1bmN0aW9uQm9keX1cXG59YFxuICAgIFxuICAgIGNvbnNvbGUubG9nKCAnYnVpbGQgc3RyaW5nOicsIGJ1aWxkU3RyaW5nIClcbiAgICBsZXQgZnVuY3Rpb25CdWlsZGVyID0gbmV3IEZ1bmN0aW9uKCBcbiAgICAgIG51bGwsXG4gICAgICBidWlsZFN0cmluZyAgICAgIFxuICAgIClcblxuICAgIGNvbnNvbGUubG9nKCAnRlVOQ1RJT04nLCBmdW5jdGlvbkJ1aWxkZXIudG9TdHJpbmcoKSApXG4gICAgXG4gICAgX2Z1bmN0aW9uID0gZnVuY3Rpb25CdWlsZGVyKCkgLy9uZXcgRnVuY3Rpb24oIGFyZ3VtZW50TmFtZXMsIHRoaXMuZnVuY3Rpb25Cb2R5IClcblxuICAgIF9mdW5jdGlvbi5jbG9zdXJlcyA9IGFyZ3VtZW50VmFsdWVzXG4gICAgXG4gICAgaWYoIHRoaXMuZGVidWcgKSBjb25zb2xlLmxvZyggX2Z1bmN0aW9uLnRvU3RyaW5nKCkgKVxuICAgIFxuICAgIC8vIFhYWCBjYW4gdGhlIGFycmF5IHNsaWNpbmcgLyBjb25jYXRlbnRhdGlvbiBiZSBvcHRpbWl6ZWQ/XG4gICAgLy8gcGVyaGFwcyB0aGUgY2xvc3VyZSBmdW5jdGlvbnMgY291bGQgaW5zdGVhZCBiZSBwcm9wZXJ0aWVzIG9mIHRoZSBmdW5jdGlvblxuICAgIC8vIGl0c2VsZiwgcmVmZXJlbmNlZCB2aWEgJ3RoaXMnIGluIHRoZSBmdW5jdGlvbiBib2R5LCBpbnN0ZWFkIG9mIGlubGluZWRcbiAgICAvLyBmdW5jdGlvbiBhcmd1bWVudHMuIFRoZW4gbm8gY29uY2F0ZW5hdGlvbiB3b3VsZCBiZSByZXF1aXJlZC5cbiAgICBsZXQgb3V0ID0gZnVuY3Rpb24oKSB7IFxuICAgICAgbGV0IGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJndW1lbnRzLCAwIClcbiAgICAgIHJldHVybiBfZnVuY3Rpb24uYXBwbHkoIG51bGwsIF9mdW5jdGlvbi5jbG9zdXJlcy5jb25jYXQoIGFyZ3MgKSApIFxuICAgIH1cblxuICAgIHJldHVybiBvdXRcbiAgfSxcblxuICBnZXRJbnB1dHMoIHVnZW4gKSB7XG4gICAgbGV0IGlucHV0cyA9IHVnZW4uaW5wdXRzLm1hcCggaW5wdXQgPT4ge1xuICAgICAgbGV0IGlzT2JqZWN0ID0gdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyxcbiAgICAgICAgICBvdXRcbiAgICAgIGlmKCBpc09iamVjdCApIHtcbiAgICAgICAgaWYoIHRoaXMubWVtb1sgaW5wdXQubmFtZSBdICkge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coXCJNRU1PXCIsIGlucHV0Lm5hbWUsIHRoaXMubWVtb1sgaW5wdXQubmFtZSBdIClcbiAgICAgICAgICBvdXQgPSB0aGlzLm1lbW9bIGlucHV0Lm5hbWUgXVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBsZXQgY29kZSA9IGlucHV0LmdlbigpXG4gICAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGNvZGUgKSApIHtcbiAgICAgICAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV1cbiAgICAgICAgICAgIG91dCA9IGNvZGVbMF1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIG91dCA9IGNvZGVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgPSBpbnB1dFxuICAgICAgfVxuXG4gICAgICAvL2lmKCBvdXQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIC8vICBjb25zb2xlLmxvZyggJ3VuZGVmaW5lZCBpbnB1dDogJywgaW5wdXQgKVxuICAgICAgLy99XG4gICAgICByZXR1cm4gb3V0XG4gICAgfSlcblxuICAgIHJldHVybiBpbnB1dHNcbiAgfVxufVxuIl19
