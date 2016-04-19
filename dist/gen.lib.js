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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9nZW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7Ozs7Ozs7Ozs7O0FBUUEsT0FBTyxPQUFQLEdBQWlCOztBQUVmLFNBQU0sQ0FBTjtBQUNBLDRCQUFTO0FBQUUsV0FBTyxLQUFLLEtBQUwsRUFBUCxDQUFGO0dBSE07Ozs7Ozs7OztBQVdmLFlBQVMsSUFBSSxHQUFKLEVBQVQ7O0FBRUEsY0FBVyxFQUFYOzs7Ozs7O0FBT0EsMkJBQVEsS0FBTSxFQXBCQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQ2YsMENBQWdCLE1BQU87QUFDckIsU0FBSyxRQUFMLENBQWMsS0FBZCxHQURxQjtBQUVyQixTQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBekIsQ0FGcUI7O0FBSXJCLFFBQUksZUFBZSxLQUFLLEdBQUwsRUFBZjtRQUNBLHdDQUFnQixLQUFLLFFBQUwsRUFBaEI7UUFDQSxrQkFGSjtRQUdJLHNCQUhKO1FBSUksdUJBSko7OztBQUpxQixpQkFXckIsR0FBZ0IsU0FBUyxHQUFULENBQWM7YUFBSyxPQUFPLElBQVAsQ0FBYSxDQUFiLEVBQWlCLENBQWpCO0tBQUwsQ0FBOUI7OztBQVhxQixrQkFjckIsR0FBZ0IsY0FBYyxHQUFkLENBQW1CO2FBQU8sU0FBUyxJQUFULENBQWU7ZUFBSyxFQUFFLEdBQUYsTUFBVyxTQUFYO09BQUwsQ0FBZixDQUE0QyxHQUE1QztLQUFQLENBQW5DLENBZHFCOztBQWdCckIsb0JBQWdCLGNBQWMsTUFBZCxDQUFzQixLQUFLLFVBQUwsQ0FBdEMsQ0FoQnFCOztBQWtCckIsZ0JBQVksSUFBSSxRQUFKLENBQWMsYUFBZCxjQUF1QyxZQUF2QyxDQUFaLENBbEJxQjs7QUFvQnJCLGNBQVUsUUFBVixHQUFxQixjQUFyQjs7Ozs7Ozs7QUFwQnFCLFFBNEJqQixNQUFNLFNBQU4sR0FBTSxHQUFXO0FBQ25CLFVBQUksT0FBTyxNQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsSUFBdEIsQ0FBNEIsU0FBNUIsRUFBdUMsQ0FBdkMsQ0FBUCxDQURlO0FBRW5CLGFBQU8sVUFBVSxLQUFWLENBQWlCLElBQWpCLEVBQXVCLFVBQVUsUUFBVixDQUFtQixNQUFuQixDQUEyQixJQUEzQixDQUF2QixDQUFQLENBRm1CO0tBQVgsQ0E1Qlc7O0FBaUNyQixXQUFPLEdBQVAsQ0FqQ3FCO0dBcENSO0FBd0VmLGdDQUFXLE1BQU87QUFDaEIsUUFBSSxTQUFTLEtBQUssTUFBTCxDQUFZLEdBQVosQ0FBaUIsYUFBSztBQUNqQyxhQUFPLFFBQU8sNkNBQVAsS0FBYSxRQUFiLEdBQXdCLEVBQUUsR0FBRixFQUF4QixHQUFrQyxDQUFsQyxDQUQwQjtLQUFMLENBQTFCLENBRFk7O0FBS2hCLFdBQU8sTUFBUCxDQUxnQjtHQXhFSDtDQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxuLyogZ2VuLmpzXG4gKlxuICogbG93LWxldmVsIGNvZGUgZ2VuZXJhdGlvbiBmb3IgdW5pdCBnZW5lcmF0b3JzXG4gKlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFjY3VtOjAsXG4gIGdldFVJRCgpIHsgcmV0dXJuIHRoaXMuYWNjdW0rKyB9LFxuICBcbiAgLyogY2xvc3VyZXNcbiAgICpcbiAgICogRnVuY3Rpb25zIHRoYXQgYXJlIGluY2x1ZGVkIGFzIGFyZ3VtZW50cyB0byBtYXN0ZXIgY2FsbGJhY2suIEV4YW1wbGVzOiBNYXRoLmFicywgTWF0aC5yYW5kb20gZXRjLlxuICAgKlxuICAgKi9cblxuICBjbG9zdXJlczpuZXcgU2V0KCksXG5cbiAgcGFyYW1ldGVyczpbXSxcbiAgXG4gIC8qIGV4cG9ydFxuICAgKlxuICAgKiBwbGFjZSBnZW4gZnVuY3Rpb25zIGludG8gYW5vdGhlciBvYmplY3QgZm9yIGVhc2llciByZWZlcmVuY2VcbiAgICovXG5cbiAgZXhwb3J0KCBvYmogKSB7fSxcbiAgXG4gIC8qIGNyZWF0ZUNhbGxiYWNrXG4gICAqXG4gICAqIHBhcmFtIHVnZW4gLSBIZWFkIG9mIGdyYXBoIHRvIGJlIGNvZGVnZW4nZFxuICAgKlxuICAgKiBHZW5lcmF0ZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVnZW4gZ3JhcGguXG4gICAqIFRoZSBnZW4uY2xvc3VyZXMgcHJvcGVydHkgc3RvcmVzIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmVcbiAgICogcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZmluYWwgZnVuY3Rpb247IHRoZXNlIGFyZSBwcmVmaXhlZFxuICAgKiBiZWZvcmUgYW55IGRlZmluZWQgcGFyYW1zIHRoZSBncmFwaCBleHBvc2VzLiBGb3IgZXhhbXBsZSwgZ2l2ZW46XG4gICAqXG4gICAqIGdlbi5jcmVhdGVDYWxsYmFjayggYWJzKCBwYXJhbSgpICkgKVxuICAgKlxuICAgKiAuLi4gdGhlIGdlbmVyYXRlZCBmdW5jdGlvbiB3aWxsIGhhdmUgYSBzaWduYXR1cmUgb2YgKCBhYnMsIHAwICkuXG4gICAqL1xuXG4gIGNyZWF0ZUNhbGxiYWNrKCB1Z2VuICkge1xuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMucGFyYW1ldGVycy5sZW5ndGggPSAwXG5cbiAgICBsZXQgZnVuY3Rpb25Cb2R5ID0gdWdlbi5nZW4oKSxcbiAgICAgICAgY2xvc3VyZXMgPSBbIC4uLnRoaXMuY2xvc3VyZXMgXSxcbiAgICAgICAgX2Z1bmN0aW9uLFxuICAgICAgICBhcmd1bWVudE5hbWVzLFxuICAgICAgICBhcmd1bWVudFZhbHVlc1xuXG4gICAgLy8gZW50cmllcyBpbiBjbG9zdXJlIHNldCB0YWtlIGZyb20geyBuYW1lLCBmdW5jdGlvbiB9XG4gICAgYXJndW1lbnROYW1lcyA9IGNsb3N1cmVzLm1hcCggdiA9PiBPYmplY3Qua2V5cyggdiApWzBdICkgXG4gICAgXG4gICAgLy8gWFhYIGVycnIuLi4gdGhpcyBjb3VsZCBiZSBtb3JlIHJlYWRhYmxlLiBFc3NlbmV0aWFsbHksIGxvb3AgdGhyb3VnaCBuYW1lcywgZmluZCBjbG9zdXJlIHdpdGggbmFtZSwgcmV0dXJuIGNsb3N1cmUgdmFsdWVcbiAgICBhcmd1bWVudFZhbHVlcz0gYXJndW1lbnROYW1lcy5tYXAoIGtleSA9PiBjbG9zdXJlcy5maW5kKCB2ID0+IHZba2V5XSAhPT0gdW5kZWZpbmVkIClbIGtleSBdIClcbiAgICBcbiAgICBhcmd1bWVudE5hbWVzID0gYXJndW1lbnROYW1lcy5jb25jYXQoIHRoaXMucGFyYW1ldGVycyApXG5cbiAgICBfZnVuY3Rpb24gPSBuZXcgRnVuY3Rpb24oIGFyZ3VtZW50TmFtZXMsIGByZXR1cm4gJHtmdW5jdGlvbkJvZHl9YCApXG5cbiAgICBfZnVuY3Rpb24uY2xvc3VyZXMgPSBhcmd1bWVudFZhbHVlc1xuICAgIFxuICAgIC8vY29uc29sZS5sb2coIF9mdW5jdGlvbi50b1N0cmluZygpIClcbiAgICBcbiAgICAvLyBYWFggY2FuIHRoZSBhcnJheSBzbGljaW5nIC8gY29uY2F0ZW50YXRpb24gYmUgb3B0aW1pemVkP1xuICAgIC8vIHBlcmhhcHMgdGhlIGNsb3N1cmUgZnVuY3Rpb25zIGNvdWxkIGluc3RlYWQgYmUgcHJvcGVydGllcyBvZiB0aGUgZnVuY3Rpb25cbiAgICAvLyBpdHNlbGYsIHJlZmVyZW5jZWQgdmlhICd0aGlzJyBpbiB0aGUgZnVuY3Rpb24gYm9keSwgaW5zdGVhZCBvZiBpbmxpbmVkXG4gICAgLy8gZnVuY3Rpb24gYXJndW1lbnRzLiBUaGVuIG5vIGNvbmNhdGVuYXRpb24gd291bGQgYmUgcmVxdWlyZWQuXG4gICAgbGV0IG91dCA9IGZ1bmN0aW9uKCkgeyBcbiAgICAgIGxldCBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMCApXG4gICAgICByZXR1cm4gX2Z1bmN0aW9uLmFwcGx5KCBudWxsLCBfZnVuY3Rpb24uY2xvc3VyZXMuY29uY2F0KCBhcmdzICkgKSBcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0XG4gIH0sXG5cbiAgZ2V0SW5wdXRzKCB1Z2VuICkge1xuICAgIGxldCBpbnB1dHMgPSB1Z2VuLmlucHV0cy5tYXAoIHYgPT4ge1xuICAgICAgcmV0dXJuIHR5cGVvZiB2ID09PSAnb2JqZWN0JyA/IHYuZ2VuKCkgOiB2XG4gICAgfSlcblxuICAgIHJldHVybiBpbnB1dHNcbiAgfVxuXG5cblxufVxuXG4vL2ltcG9ydCBhYnMgICBmcm9tICcuL2Ficy5qcydcbi8vaW1wb3J0IHBhcmFtIGZyb20gJy4vcGFyYW0uanMnXG4vL2ltcG9ydCBhZGQgICBmcm9tICcuL2FkZC5qcydcbi8vaW1wb3J0IG11bCAgIGZyb20gJy4vYWRkLmpzJ1xuXG4vL09iamVjdC5hc3NpZ24oIGdlbiwge1xuLy8gIGFicyxcbi8vICBwYXJhbSxcbi8vICBhZGQsXG4vLyAgbXVsXG4vL30pXG4iXX0=
