(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.genish = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'abs',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.abs));

      out = 'gen.abs( ' + inputs[0] + ' )';
    } else {
      out = Math.abs(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var abs = Object.create(proto);

  abs.inputs = [x];

  return abs;
};

},{"./gen.js":6}],2:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'accum',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = this.callback(genName, inputs[0], inputs[1]);

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = genName + '.value';

    return [genName + '.value', functionBody];
  },
  callback: function callback(_name, _incr, _reset) {
    var out = '  ' + _name + '.value += ' + _incr + '\n  ' + (typeof _reset === 'number' && _reset < 1 ? '' : 'if(' + _reset + '>=1 ) ' + _name + '.value = ' + _name + '.min\n') + '\n  if( ' + _name + '.value >= ' + _name + '.max ) ' + _name + '.value = ' + _name + '.min\n    ';

    return out;
  }
};

module.exports = function (incr) {
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var min = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
  var max = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    value: 0,
    uid: _gen.getUID(),
    inputs: [incr, reset],
    properties: ['_incr', '_reset']
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":6}],3:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var add = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          sum = 0,
          numCount = 0,
          adderAtEnd = false;

      inputs.forEach(function (v, i) {
        if (isNaN(v)) {
          out += v;
          if (i < inputs.length - 1) {
            adderAtEnd = true;
            out += ' + ';
          }
        } else {
          sum += parseFloat(v);
          numCount++;
        }
      });

      if (numCount > 0) {
        out += adderAtEnd ? sum : ' + ' + sum;
      }

      out += ')';

      return out;
    }
  };

  return add;
};

},{"./gen.js":6}],4:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    accum = require('./phasor.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js'),
    phasor = require('./phasor.js');

var proto = {
  basename: 'cycle',
  table: null,

  gen: function gen() {
    var inputs = _gen.getInputs(this);

    return peek('sinTable', phasor(inputs[0]), 1, 1).gen();
  },
  initTable: function initTable() {
    this.table = data('sinTable', 1024);

    for (var i = 0, l = this.table.length; i < l; i++) {
      this.table[i] = Math.sin(i / l * (Math.PI * 2));
    }
  }
};

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var ugen = Object.create(proto);

  if (proto.table === null) proto.initTable();

  Object.assign(ugen, {
    frequency: frequency,
    reset: reset,
    table: proto.table,
    uid: _gen.getUID(),
    inputs: [frequency, reset],
    properties: ['frequency', 'reset']
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

//let table = function( frequency ) {
//  if( ! (this instanceof table) ) return new table( frequency )

//  let tableSize = 1024

//  Object.assign( this, {
//    frequency,
//    uid: gen.getUID(),
//    phase:0,
//    tableFreq: 44100 / 1024,
//    table: new Float32Array( tableSize ),
//    codegen: gen.codegen,

//    sample() {
//      let index, frac, base

//      this.phase += this.frequency / this.tableFreq
//      while( this.phase >= 1024 ) this.phase -= 1024

//      index   = this.phase | 0
//      frac    = this.phase - index
//      base    = this.table[ index ]

//      return base + ( frac * ( this.table[ (index+1) & 1023 ] - base ) ) * 1
//    },

//    initTable() {
//      for( let i = 0; i < this.table.length; i++ ) {
//        this.table[ i ] = Math.sin( ( i / this.tableSize ) * ( Math.PI * 2 ) )
//      }
//    }

//  })

//  this.initTable()
//}

},{"./data.js":5,"./gen.js":6,"./mul.js":8,"./peek.js":10,"./phasor.js":11}],5:[function(require,module,exports){
'use strict';

var gen = require('./gen.js');

var proto = {
  basename: 'data',

  gen: function gen() {
    return 'gen.data.' + this.name;
  }
};

module.exports = function (username) {
  var dim = arguments.length <= 1 || arguments[1] === undefined ? 512 : arguments[1];
  var channels = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var ugen = new Float32Array(dim);

  Object.assign(ugen, {
    username: username,
    dim: dim,
    channels: channels,
    gen: proto.gen
  });

  ugen.name = username;

  gen.data[ugen.name] = ugen;

  return ugen;
};

},{"./gen.js":6}],6:[function(require,module,exports){
'use strict';

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

module.exports = {

  accum: 0,
  getUID: function getUID() {
    return this.accum++;
  },

  debug: false,

  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),

  parameters: [],

  memo: {},

  data: {},

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
    var callback = void 0,
        graphOutput = void 0;

    this.memo = {};
    this.closures.clear();
    this.parameters.length = 0;

    this.functionBody = "  'use strict';\n";

    // call .gen() on the head of the graph we are generating the callback for
    //console.log( 'HEAD', ugen )
    graphOutput = ugen.gen();

    // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
    // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
    // just return that number (graphOutput[0]).
    this.functionBody += Array.isArray(graphOutput) ? graphOutput[1] + '\n' + graphOutput[0] : graphOutput;

    // split body to inject return keyword on last line
    this.functionBody = this.functionBody.split('\n');

    // get index of last line
    var lastidx = this.functionBody.length - 1;

    // insert return keyword
    this.functionBody[lastidx] = '  return ' + this.functionBody[lastidx];

    // reassemble function body
    this.functionBody = this.functionBody.join('\n');

    // we can only dynamically create a named function by dynamically creating another function
    // to construct the named function! sheesh...
    var buildString = 'return function gen( ' + this.parameters.join(',') + ' ){ \n' + this.functionBody + '\n}';

    if (this.debug) console.log(buildString);

    callback = new Function(buildString)();

    // assign properties to named function
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = this.closures.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var dict = _step.value;

        var name = Object.keys(dict)[0],
            value = dict[name];

        callback[name] = value;
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    callback.data = this.data;

    return callback;
  },


  /* getInputs
   *
   * Given an argument ugen, extract its inputs. If they are numbers, return the numebrs. If
   * they are ugens, call .gen() on the ugen, memoize the result and return the result. If the
   * ugen has previously been memoized return the memoized value.
   *
   */
  getInputs: function getInputs(ugen) {
    var _this = this;

    var inputs = ugen.inputs.map(function (input) {
      var isObject = (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object',
          processedInput = void 0;

      if (isObject) {
        // if input is a ugen...
        if (_this.memo[input.name]) {
          // if it has been memoized...
          processedInput = _this.memo[input.name];
        } else {
          // if not memoized generate code
          var code = input.gen();
          if (Array.isArray(code)) {
            _this.functionBody += code[1];
            processedInput = code[0];
          } else {
            processedInput = code;
          }
        }
      } else {
        // it input is a number
        processedInput = input;
      }

      return processedInput;
    });

    return inputs;
  }
};

},{}],7:[function(require,module,exports){
'use strict';

var library = {
  export: function _export(destination) {
    Object.assign(destination, library);
  },


  gen: require('./gen.js'),

  abs: require('./abs.js'),
  param: require('./param.js'),
  add: require('./add.js'),
  mul: require('./mul.js'),
  accum: require('./accum.js'),
  sin: require('./sin.js'),
  phasor: require('./phasor.js'),
  data: require('./data.js'),
  peek: require('./peek.js'),
  cycle: require('./cycle.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./add.js":3,"./cycle.js":4,"./data.js":5,"./gen.js":6,"./mul.js":8,"./param.js":9,"./peek.js":10,"./phasor.js":11,"./sin.js":12}],8:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function (x, y) {
  var mul = {
    id: _gen.getUID(),
    inputs: [x, y],

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = void 0;

      if (isNaN(inputs[0]) || isNaN(inputs[1])) {
        out = '(' + inputs[0] + ' * ' + inputs[1] + ')';
      } else {
        out = parseFloat(inputs[0]) * parseFloat(inputs[1]);
      }

      return out;
    }
  };

  return mul;
};

},{"./gen.js":6}],9:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'p',

  gen: function gen() {
    _gen.parameters.push(this.name);

    _gen.memo[this.name] = this.name;

    return this.name;
  }
};

module.exports = function () {
  var param = Object.create(proto);

  param.id = _gen.getUID();
  param.name = '' + param.basename + param.id;

  return param;
};

},{"./gen.js":6}],10:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    mul = require('./mul.js');

var proto = {
  basename: 'peek',

  gen: function gen() {
    var genName = 'gen.' + this.name,
        inputs = _gen.getInputs(this),
        out = void 0,
        functionBody = void 0;

    functionBody = '   \n  let ' + this.name + '_data = gen.data.' + this.dataName + ',\n      ' + this.name + '_phase = ' + (this.mode === 0 ? inputs[0] : inputs[0] + ' * gen.data.' + this.dataName + '.length') + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n      ' + this.name + '_frac = ' + this.name + '_phase - ' + this.name + '_index,\n      ' + this.name + '_base =  ' + this.name + '_data[ ' + this.name + '_index ],\n      ' + this.name + '_out  = ' + this.name + '_base + ' + this.name + '_frac * ( ' + this.name + '_data[ (' + this.name + '_index+1) & (' + this.name + '_data.length - 1) ] - ' + this.name + '_base ) \n\n';
    return [this.name + '_out', functionBody];
  }
};

module.exports = function (dataName, index) {
  var channels = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];
  var mode = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    dataName: dataName,
    channels: channels,
    mode: mode,
    uid: _gen.getUID(),
    inputs: [index],
    properties: null
  });

  ugen.name = ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":6,"./mul.js":8}],11:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    accum = require('./accum.js'),
    mul = require('./mul.js');

var proto = {
  basename: 'phasor',

  gen: function gen() {
    var inputs = _gen.getInputs(this);

    return accum(mul(inputs[0], 1 / 44100), inputs[1]).gen();
  }
};

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    frequency: frequency,
    uid: _gen.getUID(),
    inputs: [frequency, reset],
    properties: ['frequency', 'reset']
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./accum.js":2,"./gen.js":6,"./mul.js":8}],12:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sin',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'sin': Math.sin });

      out = 'gen.sin( ' + inputs[0] + ' )';
    } else {
      out = Math.sin(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var sin = Object.create(proto);

  sin.inputs = [x];
  sin.id = _gen.getUID();
  sin.name = sin.basename + '{sin.id}';

  return sin;
};

},{"./gen.js":6}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2FkZC5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2dlbi5qcyIsImpzL2luZGV4LmpzIiwianMvbXVsLmpzIiwianMvcGFyYW0uanMiLCJqcy9wZWVrLmpzIiwianMvcGhhc29yLmpzIiwianMvc2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixRQUFLLEtBQUw7O0FBRUEsc0JBQU07QUFDSixRQUFJLFlBQUo7UUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVCxDQUZBOztBQUlKLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBTCxFQUFhLEtBQUssR0FBTCxDQUFsQyxFQUR1Qjs7QUFHdkIsMEJBQWtCLE9BQU8sQ0FBUCxRQUFsQixDQUh1QjtLQUF6QixNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTixDQURLO0tBTFA7O0FBU0EsV0FBTyxHQUFQLENBYkk7R0FISTtDQUFSOztBQW9CSixPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFOLENBRGdCOztBQUdwQixNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYixDQUhvQjs7QUFLcEIsU0FBTyxHQUFQLENBTG9CO0NBQUw7Ozs7Ozs7QUN0QmpCLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixZQUFTLE9BQVQ7O0FBRUEsc0JBQU07QUFDSixRQUFJLGFBQUo7UUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVDtRQUNBLFVBQVUsU0FBUyxLQUFLLElBQUw7UUFDbkIsZUFBZSxLQUFLLFFBQUwsQ0FBZSxPQUFmLEVBQXdCLE9BQU8sQ0FBUCxDQUF4QixFQUFtQyxPQUFPLENBQVAsQ0FBbkMsQ0FBZixDQUpBOztBQU1KLFNBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBTCxFQUFhLEtBQWxDLEVBTkk7O0FBUUosU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFMLENBQVYsR0FBd0IsVUFBVSxRQUFWLENBUnBCOztBQVVKLFdBQU8sQ0FBRSxVQUFVLFFBQVYsRUFBb0IsWUFBdEIsQ0FBUCxDQVZJO0dBSEk7QUFnQlYsOEJBQVUsT0FBTyxPQUFPLFFBQVM7QUFDL0IsUUFBSSxhQUFXLHVCQUFrQixrQkFDakMsT0FBTyxNQUFQLEtBQWtCLFFBQWxCLElBQThCLFNBQVMsQ0FBVCxHQUFhLEVBQTNDLEdBQWdELFFBQU0sTUFBTixHQUFhLFFBQWIsR0FBc0IsS0FBdEIsR0FBNEIsV0FBNUIsR0FBMEMsS0FBMUMsR0FBa0QsUUFBbEQsaUJBQzVDLHVCQUFrQixvQkFBZSxzQkFBaUIsb0JBRmxELENBRDJCOztBQU0vQixXQUFPLEdBQVAsQ0FOK0I7R0FoQnZCO0NBQVI7O0FBMEJKLE9BQU8sT0FBUCxHQUFpQixVQUFFLElBQUYsRUFBbUM7TUFBM0IsOERBQU0saUJBQXFCO01BQWxCLDREQUFJLGlCQUFjO01BQVgsNERBQUksaUJBQU87O0FBQ2xELE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVAsQ0FEOEM7O0FBR2xELFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsWUFEbUI7QUFFbkIsWUFGbUI7QUFHbkIsV0FBUyxDQUFUO0FBQ0EsU0FBUSxLQUFJLE1BQUosRUFBUjtBQUNBLFlBQVEsQ0FBRSxJQUFGLEVBQVEsS0FBUixDQUFSO0FBQ0EsZ0JBQVksQ0FBRSxPQUFGLEVBQVUsUUFBVixDQUFaO0dBTkYsRUFIa0Q7O0FBWWxELE9BQUssSUFBTCxRQUFlLEtBQUssUUFBTCxHQUFnQixLQUFLLEdBQUwsQ0FabUI7O0FBY2xELFNBQU8sSUFBUCxDQWRrRDtDQUFuQzs7Ozs7QUM1QmpCLElBQUksT0FBTSxRQUFRLFVBQVIsQ0FBTjs7QUFFSixPQUFPLE9BQVAsR0FBaUIsWUFBYTtvQ0FBVDs7R0FBUzs7QUFDNUIsTUFBSSxNQUFNO0FBQ1IsUUFBUSxLQUFJLE1BQUosRUFBUjtBQUNBLFlBQVEsSUFBUjs7QUFFQSx3QkFBTTtBQUNKLFVBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQVQ7VUFDQSxNQUFJLEdBQUo7VUFDQSxNQUFNLENBQU47VUFBUyxXQUFXLENBQVg7VUFBYyxhQUFhLEtBQWIsQ0FIdkI7O0FBS0osYUFBTyxPQUFQLENBQWdCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBUztBQUN2QixZQUFJLE1BQU8sQ0FBUCxDQUFKLEVBQWlCO0FBQ2YsaUJBQU8sQ0FBUCxDQURlO0FBRWYsY0FBSSxJQUFJLE9BQU8sTUFBUCxHQUFlLENBQWYsRUFBbUI7QUFDekIseUJBQWEsSUFBYixDQUR5QjtBQUV6QixtQkFBTyxLQUFQLENBRnlCO1dBQTNCO1NBRkYsTUFNSztBQUNILGlCQUFPLFdBQVksQ0FBWixDQUFQLENBREc7QUFFSCxxQkFGRztTQU5MO09BRGMsQ0FBaEIsQ0FMSTs7QUFrQkosVUFBSSxXQUFXLENBQVgsRUFBZTtBQUNqQixlQUFPLGFBQWEsR0FBYixHQUFtQixRQUFRLEdBQVIsQ0FEVDtPQUFuQjs7QUFJQSxhQUFPLEdBQVAsQ0F0Qkk7O0FBd0JKLGFBQU8sR0FBUCxDQXhCSTtLQUpFO0dBQU4sQ0FEd0I7O0FBaUM1QixTQUFPLEdBQVAsQ0FqQzRCO0NBQWI7Ozs7O0FDRmpCLElBQUksT0FBTyxRQUFTLFVBQVQsQ0FBUDtJQUNBLFFBQU8sUUFBUyxhQUFULENBQVA7SUFDQSxPQUFPLFFBQVMsV0FBVCxDQUFQO0lBQ0EsT0FBTyxRQUFTLFdBQVQsQ0FBUDtJQUNBLE1BQU8sUUFBUyxVQUFULENBQVA7SUFDQSxTQUFPLFFBQVMsYUFBVCxDQUFQOztBQUVKLElBQUksUUFBUTtBQUNWLFlBQVMsT0FBVDtBQUNBLFNBQU0sSUFBTjs7QUFFQSxzQkFBTTtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQVQsQ0FEQTs7QUFHSixXQUFPLEtBQUssVUFBTCxFQUFpQixPQUFRLE9BQU8sQ0FBUCxDQUFSLENBQWpCLEVBQXNDLENBQXRDLEVBQXlDLENBQXpDLEVBQTZDLEdBQTdDLEVBQVAsQ0FISTtHQUpJO0FBVVYsa0NBQVk7QUFDVixTQUFLLEtBQUwsR0FBYSxLQUFNLFVBQU4sRUFBa0IsSUFBbEIsQ0FBYixDQURVOztBQUdWLFNBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLEtBQUssS0FBTCxDQUFXLE1BQVgsRUFBbUIsSUFBSSxDQUFKLEVBQU8sR0FBOUMsRUFBb0Q7QUFDbEQsV0FBSyxLQUFMLENBQVksQ0FBWixJQUFrQixLQUFLLEdBQUwsQ0FBVSxDQUFFLEdBQUksQ0FBSixJQUFZLEtBQUssRUFBTCxHQUFVLENBQVYsQ0FBZCxDQUE1QixDQURrRDtLQUFwRDtHQWJRO0NBQVI7O0FBb0JKLE9BQU8sT0FBUCxHQUFpQixZQUE0QjtNQUExQixrRUFBVSxpQkFBZ0I7TUFBYiw4REFBTSxpQkFBTzs7QUFDM0MsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBUCxDQUR1Qzs7QUFHM0MsTUFBSSxNQUFNLEtBQU4sS0FBZ0IsSUFBaEIsRUFBdUIsTUFBTSxTQUFOLEdBQTNCOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsd0JBRG1CO0FBRW5CLGdCQUZtQjtBQUduQixXQUFZLE1BQU0sS0FBTjtBQUNaLFNBQVksS0FBSSxNQUFKLEVBQVo7QUFDQSxZQUFZLENBQUUsU0FBRixFQUFhLEtBQWIsQ0FBWjtBQUNBLGdCQUFZLENBQUUsV0FBRixFQUFjLE9BQWQsQ0FBWjtHQU5GLEVBTDJDOztBQWMzQyxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQUwsR0FBZ0IsS0FBSyxHQUFMLENBZFk7O0FBZ0IzQyxTQUFPLElBQVAsQ0FoQjJDO0NBQTVCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMzQmpCLElBQUksTUFBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixZQUFTLE1BQVQ7O0FBRUEsc0JBQU07QUFDSixXQUFPLGNBQWMsS0FBSyxJQUFMLENBRGpCO0dBSEk7Q0FBUjs7QUFRSixPQUFPLE9BQVAsR0FBaUIsVUFBRSxRQUFGLEVBQXFDO01BQXpCLDREQUFJLG1CQUFxQjtNQUFoQixpRUFBUyxpQkFBTzs7QUFDcEQsTUFBSSxPQUFPLElBQUksWUFBSixDQUFrQixHQUFsQixDQUFQLENBRGdEOztBQUdwRCxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLHNCQURtQjtBQUVuQixZQUZtQjtBQUduQixzQkFIbUI7QUFJbkIsU0FBWSxNQUFNLEdBQU47R0FKZCxFQUhvRDs7QUFVcEQsT0FBSyxJQUFMLEdBQVksUUFBWixDQVZvRDs7QUFZcEQsTUFBSSxJQUFKLENBQVUsS0FBSyxJQUFMLENBQVYsR0FBd0IsSUFBeEIsQ0Fab0Q7O0FBY3BELFNBQU8sSUFBUCxDQWRvRDtDQUFyQzs7O0FDVmpCOzs7Ozs7Ozs7O0FBUUEsT0FBTyxPQUFQLEdBQWlCOztBQUVmLFNBQU0sQ0FBTjtBQUNBLDRCQUFTO0FBQUUsV0FBTyxLQUFLLEtBQUwsRUFBUCxDQUFGO0dBSE07O0FBSWYsU0FBTSxLQUFOOzs7Ozs7OztBQVFBLFlBQVMsSUFBSSxHQUFKLEVBQVQ7O0FBRUEsY0FBVyxFQUFYOztBQUVBLFFBQU0sRUFBTjs7QUFFQSxRQUFNLEVBQU47Ozs7Ozs7QUFPQSwyQkFBUSxLQUFNLEVBekJDOzs7Ozs7Ozs7Ozs7Ozs7OztBQXlDZiwwQ0FBZ0IsTUFBTztBQUNyQixRQUFJLGlCQUFKO1FBQWMsb0JBQWQsQ0FEcUI7O0FBR3JCLFNBQUssSUFBTCxHQUFZLEVBQVosQ0FIcUI7QUFJckIsU0FBSyxRQUFMLENBQWMsS0FBZCxHQUpxQjtBQUtyQixTQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsR0FBeUIsQ0FBekIsQ0FMcUI7O0FBT3JCLFNBQUssWUFBTCxHQUFvQixtQkFBcEI7Ozs7QUFQcUIsZUFXckIsR0FBYyxLQUFLLEdBQUwsRUFBZDs7Ozs7QUFYcUIsUUFnQnJCLENBQUssWUFBTCxJQUFxQixNQUFNLE9BQU4sQ0FBZSxXQUFmLElBQStCLFlBQVksQ0FBWixJQUFpQixJQUFqQixHQUF3QixZQUFZLENBQVosQ0FBeEIsR0FBeUMsV0FBeEU7OztBQWhCQSxRQW1CckIsQ0FBSyxZQUFMLEdBQW9CLEtBQUssWUFBTCxDQUFrQixLQUFsQixDQUF3QixJQUF4QixDQUFwQjs7O0FBbkJxQixRQXNCakIsVUFBVSxLQUFLLFlBQUwsQ0FBa0IsTUFBbEIsR0FBMkIsQ0FBM0I7OztBQXRCTyxRQXlCckIsQ0FBSyxZQUFMLENBQW1CLE9BQW5CLElBQStCLGNBQWMsS0FBSyxZQUFMLENBQW1CLE9BQW5CLENBQWQ7OztBQXpCVixRQTRCckIsQ0FBSyxZQUFMLEdBQW9CLEtBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixJQUF2QixDQUFwQjs7OztBQTVCcUIsUUFnQ2pCLHdDQUFzQyxLQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsR0FBckIsZUFBa0MsS0FBSyxZQUFMLFFBQXhFLENBaENpQjs7QUFrQ3JCLFFBQUksS0FBSyxLQUFMLEVBQWEsUUFBUSxHQUFSLENBQWEsV0FBYixFQUFqQjs7QUFFQSxlQUFXLElBQUksUUFBSixDQUFjLFdBQWQsR0FBWDs7O0FBcENxQjs7Ozs7QUF1Q3JCLDJCQUFpQixLQUFLLFFBQUwsQ0FBYyxNQUFkLDRCQUFqQixvR0FBMEM7WUFBakMsbUJBQWlDOztBQUN4QyxZQUFJLE9BQU8sT0FBTyxJQUFQLENBQWEsSUFBYixFQUFvQixDQUFwQixDQUFQO1lBQ0EsUUFBUSxLQUFNLElBQU4sQ0FBUixDQUZvQzs7QUFJeEMsaUJBQVUsSUFBVixJQUFtQixLQUFuQixDQUp3QztPQUExQzs7Ozs7Ozs7Ozs7Ozs7S0F2Q3FCOztBQThDckIsYUFBUyxJQUFULEdBQWdCLEtBQUssSUFBTCxDQTlDSzs7QUFnRHJCLFdBQU8sUUFBUCxDQWhEcUI7R0F6Q1I7Ozs7Ozs7Ozs7QUFtR2YsZ0NBQVcsTUFBTzs7O0FBQ2hCLFFBQUksU0FBUyxLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWlCLGlCQUFTO0FBQ3JDLFVBQUksV0FBVyxRQUFPLHFEQUFQLEtBQWlCLFFBQWpCO1VBQ1gsdUJBREosQ0FEcUM7O0FBSXJDLFVBQUksUUFBSixFQUFlOztBQUNiLFlBQUksTUFBSyxJQUFMLENBQVcsTUFBTSxJQUFOLENBQWYsRUFBOEI7O0FBQzVCLDJCQUFpQixNQUFLLElBQUwsQ0FBVyxNQUFNLElBQU4sQ0FBNUIsQ0FENEI7U0FBOUIsTUFFSzs7QUFDSCxjQUFJLE9BQU8sTUFBTSxHQUFOLEVBQVAsQ0FERDtBQUVILGNBQUksTUFBTSxPQUFOLENBQWUsSUFBZixDQUFKLEVBQTRCO0FBQzFCLGtCQUFLLFlBQUwsSUFBcUIsS0FBSyxDQUFMLENBQXJCLENBRDBCO0FBRTFCLDZCQUFpQixLQUFLLENBQUwsQ0FBakIsQ0FGMEI7V0FBNUIsTUFHSztBQUNILDZCQUFpQixJQUFqQixDQURHO1dBSEw7U0FKRjtPQURGLE1BWUs7O0FBQ0gseUJBQWlCLEtBQWpCLENBREc7T0FaTDs7QUFnQkEsYUFBTyxjQUFQLENBcEJxQztLQUFULENBQTFCLENBRFk7O0FBd0JoQixXQUFPLE1BQVAsQ0F4QmdCO0dBbkdIO0NBQWpCOzs7OztBQ1JBLElBQUksVUFBVTtBQUNaLDJCQUFRLGFBQWM7QUFDcEIsV0FBTyxNQUFQLENBQWUsV0FBZixFQUE0QixPQUE1QixFQURvQjtHQURWOzs7QUFLWixPQUFRLFFBQVMsVUFBVCxDQUFSOztBQUVBLE9BQVEsUUFBUSxVQUFSLENBQVI7QUFDQSxTQUFRLFFBQVEsWUFBUixDQUFSO0FBQ0EsT0FBUSxRQUFRLFVBQVIsQ0FBUjtBQUNBLE9BQVEsUUFBUSxVQUFSLENBQVI7QUFDQSxTQUFRLFFBQVEsWUFBUixDQUFSO0FBQ0EsT0FBUSxRQUFRLFVBQVIsQ0FBUjtBQUNBLFVBQVEsUUFBUSxhQUFSLENBQVI7QUFDQSxRQUFRLFFBQVEsV0FBUixDQUFSO0FBQ0EsUUFBUSxRQUFRLFdBQVIsQ0FBUjtBQUNBLFNBQVEsUUFBUSxZQUFSLENBQVI7Q0FoQkU7O0FBbUJKLFFBQVEsR0FBUixDQUFZLEdBQVosR0FBa0IsT0FBbEI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOzs7OztBQ3JCQSxJQUFJLE9BQU0sUUFBUSxVQUFSLENBQU47O0FBRUosT0FBTyxPQUFQLEdBQWlCLFVBQUUsQ0FBRixFQUFJLENBQUosRUFBVztBQUMxQixNQUFJLE1BQU07QUFDUixRQUFRLEtBQUksTUFBSixFQUFSO0FBQ0EsWUFBUSxDQUFFLENBQUYsRUFBSSxDQUFKLENBQVI7O0FBRUEsd0JBQU07QUFDSixVQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFUO1VBQ0EsWUFESixDQURJOztBQUlKLFVBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxLQUFzQixNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQXRCLEVBQTJDO0FBQzdDLG9CQUFXLE9BQU8sQ0FBUCxZQUFlLE9BQU8sQ0FBUCxPQUExQixDQUQ2QztPQUEvQyxNQUVLO0FBQ0gsY0FBTSxXQUFZLE9BQU8sQ0FBUCxDQUFaLElBQTBCLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBMUIsQ0FESDtPQUZMOztBQU1BLGFBQU8sR0FBUCxDQVZJO0tBSkU7R0FBTixDQURzQjs7QUFtQjFCLFNBQU8sR0FBUCxDQW5CMEI7Q0FBWDs7Ozs7QUNGakIsSUFBSSxPQUFNLFFBQVEsVUFBUixDQUFOOztBQUVKLElBQUksUUFBUTtBQUNWLFlBQVMsR0FBVDs7QUFFQSxzQkFBTTtBQUNKLFNBQUksVUFBSixDQUFlLElBQWYsQ0FBcUIsS0FBSyxJQUFMLENBQXJCLENBREk7O0FBR0osU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFMLENBQVYsR0FBd0IsS0FBSyxJQUFMLENBSHBCOztBQUtKLFdBQU8sS0FBSyxJQUFMLENBTEg7R0FISTtDQUFSOztBQVlKLE9BQU8sT0FBUCxHQUFpQixZQUFNO0FBQ3JCLE1BQUksUUFBUSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVIsQ0FEaUI7O0FBR3JCLFFBQU0sRUFBTixHQUFhLEtBQUksTUFBSixFQUFiLENBSHFCO0FBSXJCLFFBQU0sSUFBTixRQUFnQixNQUFNLFFBQU4sR0FBaUIsTUFBTSxFQUFOLENBSlo7O0FBTXJCLFNBQU8sS0FBUCxDQU5xQjtDQUFOOzs7OztBQ2RqQixJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVA7SUFDQSxNQUFPLFFBQVEsVUFBUixDQUFQOztBQUVKLElBQUksUUFBUTtBQUNWLFlBQVMsTUFBVDs7QUFFQSxzQkFBTTtBQUNKLFFBQUksVUFBVSxTQUFTLEtBQUssSUFBTDtRQUNuQixTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVDtRQUNBLFlBRko7UUFFUyxxQkFGVCxDQURJOztBQUtSLG1DQUNRLEtBQUssSUFBTCx5QkFBNkIsS0FBSyxRQUFMLGlCQUM3QixLQUFLLElBQUwsa0JBQXFCLEtBQUssSUFBTCxLQUFjLENBQWQsR0FBa0IsT0FBTyxDQUFQLENBQWxCLEdBQThCLE9BQU8sQ0FBUCxJQUFZLGNBQVosR0FBNEIsS0FBSyxRQUFMLEdBQWMsU0FBMUMsbUJBQ25ELEtBQUssSUFBTCxpQkFBcUIsS0FBSyxJQUFMLDJCQUNyQixLQUFLLElBQUwsZ0JBQW9CLEtBQUssSUFBTCxpQkFBcUIsS0FBSyxJQUFMLHVCQUN6QyxLQUFLLElBQUwsaUJBQXFCLEtBQUssSUFBTCxlQUFtQixLQUFLLElBQUwseUJBQ3hDLEtBQUssSUFBTCxnQkFBb0IsS0FBSyxJQUFMLGdCQUFvQixLQUFLLElBQUwsa0JBQXNCLEtBQUssSUFBTCxnQkFBb0IsS0FBSyxJQUFMLHFCQUF5QixLQUFLLElBQUwsOEJBQWtDLEtBQUssSUFBTCxpQkFOckosQ0FMUTtBQWNKLFdBQU8sQ0FBRSxLQUFLLElBQUwsR0FBVSxNQUFWLEVBQWtCLFlBQXBCLENBQVAsQ0FkSTtHQUhJO0NBQVI7O0FBcUJKLE9BQU8sT0FBUCxHQUFpQixVQUFFLFFBQUYsRUFBWSxLQUFaLEVBQTJDO01BQXhCLGlFQUFTLGlCQUFlO01BQVosNkRBQUssaUJBQU87O0FBQzFELE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVAsQ0FEc0Q7O0FBRzFELFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsc0JBRG1CO0FBRW5CLHNCQUZtQjtBQUduQixjQUhtQjtBQUluQixTQUFZLEtBQUksTUFBSixFQUFaO0FBQ0EsWUFBWSxDQUFFLEtBQUYsQ0FBWjtBQUNBLGdCQUFZLElBQVo7R0FORixFQUgwRDs7QUFZMUQsT0FBSyxJQUFMLEdBQVksS0FBSyxRQUFMLEdBQWdCLEtBQUssR0FBTCxDQVo4Qjs7QUFjMUQsU0FBTyxJQUFQLENBZDBEO0NBQTNDOzs7OztBQ3hCakIsSUFBSSxPQUFPLFFBQVMsVUFBVCxDQUFQO0lBQ0EsUUFBTyxRQUFTLFlBQVQsQ0FBUDtJQUNBLE1BQU8sUUFBUyxVQUFULENBQVA7O0FBRUosSUFBSSxRQUFRO0FBQ1YsWUFBUyxRQUFUOztBQUVBLHNCQUFNO0FBQ0osUUFBSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVCxDQURBOztBQUdKLFdBQU8sTUFBTyxJQUFLLE9BQU8sQ0FBUCxDQUFMLEVBQWdCLElBQUUsS0FBRixDQUF2QixFQUFrQyxPQUFPLENBQVAsQ0FBbEMsRUFBOEMsR0FBOUMsRUFBUCxDQUhJO0dBSEk7Q0FBUjs7QUFXSixPQUFPLE9BQVAsR0FBaUIsWUFBNEI7TUFBMUIsa0VBQVUsaUJBQWdCO01BQWIsOERBQU0saUJBQU87O0FBQzNDLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVAsQ0FEdUM7O0FBRzNDLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsd0JBRG1CO0FBRW5CLFNBQVEsS0FBSSxNQUFKLEVBQVI7QUFDQSxZQUFRLENBQUUsU0FBRixFQUFhLEtBQWIsQ0FBUjtBQUNBLGdCQUFZLENBQUUsV0FBRixFQUFjLE9BQWQsQ0FBWjtHQUpGLEVBSDJDOztBQVUzQyxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQUwsR0FBZ0IsS0FBSyxHQUFMLENBVlk7O0FBWTNDLFNBQU8sSUFBUCxDQVoyQztDQUE1Qjs7Ozs7QUNmakIsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFQOztBQUVKLElBQUksUUFBUTtBQUNWLFlBQVMsS0FBVDs7QUFFQSxzQkFBTTtBQUNKLFFBQUksWUFBSjtRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFULENBRkE7O0FBSUosUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQUosRUFBeUI7QUFDdkIsV0FBSSxRQUFKLENBQWEsR0FBYixDQUFpQixFQUFFLE9BQU8sS0FBSyxHQUFMLEVBQTFCLEVBRHVCOztBQUd2QiwwQkFBa0IsT0FBTyxDQUFQLFFBQWxCLENBSHVCO0tBQXpCLE1BS087QUFDTCxZQUFNLEtBQUssR0FBTCxDQUFVLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBVixDQUFOLENBREs7S0FMUDs7QUFTQSxXQUFPLEdBQVAsQ0FiSTtHQUhJO0NBQVI7O0FBb0JKLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQU4sQ0FEZ0I7O0FBR3BCLE1BQUksTUFBSixHQUFhLENBQUUsQ0FBRixDQUFiLENBSG9CO0FBSXBCLE1BQUksRUFBSixHQUFTLEtBQUksTUFBSixFQUFULENBSm9CO0FBS3BCLE1BQUksSUFBSixHQUFjLElBQUksUUFBSixhQUFkLENBTG9COztBQU9wQixTQUFPLEdBQVAsQ0FQb0I7Q0FBTCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidhYnMnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5hYnMgfSlcblxuICAgICAgb3V0ID0gYGdlbi5hYnMoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWJzKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYWJzID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFicy5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBhYnNcbn1cbiIsImxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY2N1bScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keSA9IHRoaXMuY2FsbGJhY2soIGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdIClcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gZ2VuTmFtZSArICcudmFsdWUnXG4gICAgXG4gICAgcmV0dXJuIFsgZ2VuTmFtZSArICcudmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9yZXNldCApIHtcbiAgICBsZXQgb3V0ID0gYCAgJHtfbmFtZX0udmFsdWUgKz0gJHtfaW5jcn1cbiAgJHt0eXBlb2YgX3Jlc2V0ID09PSAnbnVtYmVyJyAmJiBfcmVzZXQgPCAxID8gJycgOiAnaWYoJytfcmVzZXQrJz49MSApICcrX25hbWUrJy52YWx1ZSA9ICcgKyBfbmFtZSArICcubWluXFxuJ31cbiAgaWYoICR7X25hbWV9LnZhbHVlID49ICR7X25hbWV9Lm1heCApICR7X25hbWV9LnZhbHVlID0gJHtfbmFtZX0ubWluXG4gICAgYFxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jciwgcmVzZXQ9MCwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHZhbHVlOiAgIDAsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIHJlc2V0IF0sXG4gICAgcHJvcGVydGllczogWyAnX2luY3InLCdfcmVzZXQnIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCJsZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICguLi5hcmdzKSA9PiB7XG4gIGxldCBhZGQgPSB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuKCkge1xuICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgICBvdXQ9JygnLFxuICAgICAgICAgIHN1bSA9IDAsIG51bUNvdW50ID0gMCwgYWRkZXJBdEVuZCA9IGZhbHNlXG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICAgIG91dCArPSB2XG4gICAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgICAgYWRkZXJBdEVuZCA9IHRydWVcbiAgICAgICAgICAgIG91dCArPSAnICsgJ1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3VtICs9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICAgIG51bUNvdW50KytcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgaWYoIG51bUNvdW50ID4gMCApIHtcbiAgICAgICAgb3V0ICs9IGFkZGVyQXRFbmQgPyBzdW0gOiAnICsgJyArIHN1bVxuICAgICAgfVxuICAgICAgXG4gICAgICBvdXQgKz0gJyknXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBhZGRcbn1cbiIsImxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwaGFzb3I9cmVxdWlyZSggJy4vcGhhc29yLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY3ljbGUnLFxuICB0YWJsZTpudWxsLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICByZXR1cm4gcGVlaygnc2luVGFibGUnLCBwaGFzb3IoIGlucHV0c1swXSApLCAxLCAxICkuZ2VuKClcbiAgfSxcblxuICBpbml0VGFibGUoKSB7XG4gICAgdGhpcy50YWJsZSA9IGRhdGEoICdzaW5UYWJsZScsIDEwMjQgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDAsIGwgPSB0aGlzLnRhYmxlLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIHRoaXMudGFibGVbIGkgXSA9IE1hdGguc2luKCAoIGkgLyBsICkgKiAoIE1hdGguUEkgKiAyICkgKVxuICAgIH1cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgaWYoIHByb3RvLnRhYmxlID09PSBudWxsICkgcHJvdG8uaW5pdFRhYmxlKCkgXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBmcmVxdWVuY3ksXG4gICAgcmVzZXQsXG4gICAgdGFibGU6ICAgICAgcHJvdG8udGFibGUsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgZnJlcXVlbmN5LCByZXNldCBdLFxuICAgIHByb3BlcnRpZXM6IFsgJ2ZyZXF1ZW5jeScsJ3Jlc2V0JyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuXG4vL2xldCB0YWJsZSA9IGZ1bmN0aW9uKCBmcmVxdWVuY3kgKSB7XG4vLyAgaWYoICEgKHRoaXMgaW5zdGFuY2VvZiB0YWJsZSkgKSByZXR1cm4gbmV3IHRhYmxlKCBmcmVxdWVuY3kgKVxuICAgIFxuLy8gIGxldCB0YWJsZVNpemUgPSAxMDI0XG4gICAgXG4vLyAgT2JqZWN0LmFzc2lnbiggdGhpcywge1xuLy8gICAgZnJlcXVlbmN5LFxuLy8gICAgdWlkOiBnZW4uZ2V0VUlEKCksXG4vLyAgICBwaGFzZTowLFxuLy8gICAgdGFibGVGcmVxOiA0NDEwMCAvIDEwMjQsXG4vLyAgICB0YWJsZTogbmV3IEZsb2F0MzJBcnJheSggdGFibGVTaXplICksXG4vLyAgICBjb2RlZ2VuOiBnZW4uY29kZWdlbixcbiAgICBcbi8vICAgIHNhbXBsZSgpIHtcbi8vICAgICAgbGV0IGluZGV4LCBmcmFjLCBiYXNlXG4gICAgICAgICAgICBcbi8vICAgICAgdGhpcy5waGFzZSArPSB0aGlzLmZyZXF1ZW5jeSAvIHRoaXMudGFibGVGcmVxXG4vLyAgICAgIHdoaWxlKCB0aGlzLnBoYXNlID49IDEwMjQgKSB0aGlzLnBoYXNlIC09IDEwMjRcbiAgICAgICAgXG4vLyAgICAgIGluZGV4ICAgPSB0aGlzLnBoYXNlIHwgMFxuLy8gICAgICBmcmFjICAgID0gdGhpcy5waGFzZSAtIGluZGV4XG4vLyAgICAgIGJhc2UgICAgPSB0aGlzLnRhYmxlWyBpbmRleCBdXG4gICAgICAgIFxuLy8gICAgICByZXR1cm4gYmFzZSArICggZnJhYyAqICggdGhpcy50YWJsZVsgKGluZGV4KzEpICYgMTAyMyBdIC0gYmFzZSApICkgKiAxXG4vLyAgICB9LFxuICAgIFxuLy8gICAgaW5pdFRhYmxlKCkge1xuLy8gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMudGFibGUubGVuZ3RoOyBpKysgKSB7XG4vLyAgICAgICAgdGhpcy50YWJsZVsgaSBdID0gTWF0aC5zaW4oICggaSAvIHRoaXMudGFibGVTaXplICkgKiAoIE1hdGguUEkgKiAyICkgKVxuLy8gICAgICB9XG4vLyAgICB9XG4gICAgXG4vLyAgfSlcbiAgXG4vLyAgdGhpcy5pbml0VGFibGUoKVxuLy99XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGF0YScsXG5cbiAgZ2VuKCkge1xuICAgIHJldHVybiAnZ2VuLmRhdGEuJyArIHRoaXMubmFtZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggdXNlcm5hbWUsIGRpbT01MTIsIGNoYW5uZWxzPTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gbmV3IEZsb2F0MzJBcnJheSggZGltIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHVzZXJuYW1lLFxuICAgIGRpbSxcbiAgICBjaGFubmVscyxcbiAgICBnZW46ICAgICAgICBwcm90by5nZW5cbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IHVzZXJuYW1lXG5cbiAgZ2VuLmRhdGFbIHVnZW4ubmFtZSBdID0gdWdlblxuICBcbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKiBnZW4uanNcbiAqXG4gKiBsb3ctbGV2ZWwgY29kZSBnZW5lcmF0aW9uIGZvciB1bml0IGdlbmVyYXRvcnNcbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWNjdW06MCxcbiAgZ2V0VUlEKCkgeyByZXR1cm4gdGhpcy5hY2N1bSsrIH0sXG4gIGRlYnVnOmZhbHNlLFxuICBcbiAgLyogY2xvc3VyZXNcbiAgICpcbiAgICogRnVuY3Rpb25zIHRoYXQgYXJlIGluY2x1ZGVkIGFzIGFyZ3VtZW50cyB0byBtYXN0ZXIgY2FsbGJhY2suIEV4YW1wbGVzOiBNYXRoLmFicywgTWF0aC5yYW5kb20gZXRjLlxuICAgKiBYWFggU2hvdWxkIHByb2JhYmx5IGJlIHJlbmFtZWQgY2FsbGJhY2tQcm9wZXJ0aWVzIG9yIHNvbWV0aGluZyBzaW1pbGFyLi4uIGNsb3N1cmVzIGFyZSBubyBsb25nZXIgdXNlZC5cbiAgICovXG5cbiAgY2xvc3VyZXM6bmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6W10sXG5cbiAgbWVtbzoge30sXG5cbiAgZGF0YToge30sXG4gIFxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydCggb2JqICkge30sXG4gIFxuICAvKiBjcmVhdGVDYWxsYmFja1xuICAgKlxuICAgKiBwYXJhbSB1Z2VuIC0gSGVhZCBvZiBncmFwaCB0byBiZSBjb2RlZ2VuJ2RcbiAgICpcbiAgICogR2VuZXJhdGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGEgcGFydGljdWxhciB1Z2VuIGdyYXBoLlxuICAgKiBUaGUgZ2VuLmNsb3N1cmVzIHByb3BlcnR5IHN0b3JlcyBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlXG4gICAqIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGZpbmFsIGZ1bmN0aW9uOyB0aGVzZSBhcmUgcHJlZml4ZWRcbiAgICogYmVmb3JlIGFueSBkZWZpbmVkIHBhcmFtcyB0aGUgZ3JhcGggZXhwb3Nlcy4gRm9yIGV4YW1wbGUsIGdpdmVuOlxuICAgKlxuICAgKiBnZW4uY3JlYXRlQ2FsbGJhY2soIGFicyggcGFyYW0oKSApIClcbiAgICpcbiAgICogLi4uIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gd2lsbCBoYXZlIGEgc2lnbmF0dXJlIG9mICggYWJzLCBwMCApLlxuICAgKi9cblxuICBjcmVhdGVDYWxsYmFjayggdWdlbiApIHtcbiAgICBsZXQgY2FsbGJhY2ssIGdyYXBoT3V0cHV0XG5cbiAgICB0aGlzLm1lbW8gPSB7fVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMucGFyYW1ldGVycy5sZW5ndGggPSAwXG5cbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiICAndXNlIHN0cmljdCc7XFxuXCJcblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBncmFwaE91dHB1dCA9IHVnZW4uZ2VuKClcblxuICAgIC8vIGlmIC5nZW4oKSByZXR1cm5zIGFycmF5LCBhZGQgdWdlbiBjYWxsYmFjayAoZ3JhcGhPdXRwdXRbMV0pIHRvIG91ciBvdXRwdXQgZnVuY3Rpb25zIGJvZHlcbiAgICAvLyBhbmQgdGhlbiByZXR1cm4gbmFtZSBvZiB1Z2VuLiBJZiAuZ2VuKCkgb25seSBnZW5lcmF0ZXMgYSBudW1iZXIgKGZvciByZWFsbHkgc2ltcGxlIGdyYXBocylcbiAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IEFycmF5LmlzQXJyYXkoIGdyYXBoT3V0cHV0ICkgPyBncmFwaE91dHB1dFsxXSArICdcXG4nICsgZ3JhcGhPdXRwdXRbMF0gOiBncmFwaE91dHB1dFxuXG4gICAgLy8gc3BsaXQgYm9keSB0byBpbmplY3QgcmV0dXJuIGtleXdvcmQgb24gbGFzdCBsaW5lXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5zcGxpdCgnXFxuJylcbiAgICBcbiAgICAvLyBnZXQgaW5kZXggb2YgbGFzdCBsaW5lXG4gICAgbGV0IGxhc3RpZHggPSB0aGlzLmZ1bmN0aW9uQm9keS5sZW5ndGggLSAxXG5cbiAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICB0aGlzLmZ1bmN0aW9uQm9keVsgbGFzdGlkeCBdID0gJyAgcmV0dXJuICcgKyB0aGlzLmZ1bmN0aW9uQm9keVsgbGFzdGlkeCBdIFxuICAgIFxuICAgIC8vIHJlYXNzZW1ibGUgZnVuY3Rpb24gYm9keVxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuam9pbignXFxuJylcblxuICAgIC8vIHdlIGNhbiBvbmx5IGR5bmFtaWNhbGx5IGNyZWF0ZSBhIG5hbWVkIGZ1bmN0aW9uIGJ5IGR5bmFtaWNhbGx5IGNyZWF0aW5nIGFub3RoZXIgZnVuY3Rpb25cbiAgICAvLyB0byBjb25zdHJ1Y3QgdGhlIG5hbWVkIGZ1bmN0aW9uISBzaGVlc2guLi5cbiAgICBsZXQgYnVpbGRTdHJpbmcgPSBgcmV0dXJuIGZ1bmN0aW9uIGdlbiggJHt0aGlzLnBhcmFtZXRlcnMuam9pbignLCcpfSApeyBcXG4ke3RoaXMuZnVuY3Rpb25Cb2R5fVxcbn1gXG4gICAgXG4gICAgaWYoIHRoaXMuZGVidWcgKSBjb25zb2xlLmxvZyggYnVpbGRTdHJpbmcgKSBcblxuICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKCBidWlsZFN0cmluZyApKClcbiAgICBcbiAgICAvLyBhc3NpZ24gcHJvcGVydGllcyB0byBuYW1lZCBmdW5jdGlvblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5jbG9zdXJlcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB2YWx1ZSA9IGRpY3RbIG5hbWUgXVxuXG4gICAgICBjYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG4gICAgXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YVxuXG4gICAgcmV0dXJuIGNhbGxiYWNrXG4gIH0sXG4gIFxuICAvKiBnZXRJbnB1dHNcbiAgICpcbiAgICogR2l2ZW4gYW4gYXJndW1lbnQgdWdlbiwgZXh0cmFjdCBpdHMgaW5wdXRzLiBJZiB0aGV5IGFyZSBudW1iZXJzLCByZXR1cm4gdGhlIG51bWVicnMuIElmXG4gICAqIHRoZXkgYXJlIHVnZW5zLCBjYWxsIC5nZW4oKSBvbiB0aGUgdWdlbiwgbWVtb2l6ZSB0aGUgcmVzdWx0IGFuZCByZXR1cm4gdGhlIHJlc3VsdC4gSWYgdGhlXG4gICAqIHVnZW4gaGFzIHByZXZpb3VzbHkgYmVlbiBtZW1vaXplZCByZXR1cm4gdGhlIG1lbW9pemVkIHZhbHVlLlxuICAgKlxuICAgKi9cbiAgZ2V0SW5wdXRzKCB1Z2VuICkge1xuICAgIGxldCBpbnB1dHMgPSB1Z2VuLmlucHV0cy5tYXAoIGlucHV0ID0+IHtcbiAgICAgIGxldCBpc09iamVjdCA9IHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcsXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXRcblxuICAgICAgaWYoIGlzT2JqZWN0ICkgeyAvLyBpZiBpbnB1dCBpcyBhIHVnZW4uLi4gXG4gICAgICAgIGlmKCB0aGlzLm1lbW9bIGlucHV0Lm5hbWUgXSApIHsgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IHRoaXMubWVtb1sgaW5wdXQubmFtZSBdXG4gICAgICAgIH1lbHNleyAvLyBpZiBub3QgbWVtb2l6ZWQgZ2VuZXJhdGUgY29kZVxuICAgICAgICAgIGxldCBjb2RlID0gaW5wdXQuZ2VuKClcbiAgICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggY29kZSApICkge1xuICAgICAgICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gY29kZVsxXVxuICAgICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlWzBdXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1lbHNleyAvLyBpdCBpbnB1dCBpcyBhIG51bWJlclxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm9jZXNzZWRJbnB1dFxuICAgIH0pXG5cbiAgICByZXR1cm4gaW5wdXRzXG4gIH1cbn1cbiIsImxldCBsaWJyYXJ5ID0ge1xuICBleHBvcnQoIGRlc3RpbmF0aW9uICkge1xuICAgIE9iamVjdC5hc3NpZ24oIGRlc3RpbmF0aW9uLCBsaWJyYXJ5IClcbiAgfSxcblxuICBnZW46ICAgIHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgXG4gIGFiczogICAgcmVxdWlyZSgnLi9hYnMuanMnKSxcbiAgcGFyYW06ICByZXF1aXJlKCcuL3BhcmFtLmpzJyksXG4gIGFkZDogICAgcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgbXVsOiAgICByZXF1aXJlKCcuL211bC5qcycpLFxuICBhY2N1bTogIHJlcXVpcmUoJy4vYWNjdW0uanMnKSxcbiAgc2luOiAgICByZXF1aXJlKCcuL3Npbi5qcycpLFxuICBwaGFzb3I6IHJlcXVpcmUoJy4vcGhhc29yLmpzJyksXG4gIGRhdGE6ICAgcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gIHBlZWs6ICAgcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gIGN5Y2xlOiAgcmVxdWlyZSgnLi9jeWNsZS5qcycpLFxufVxuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5XG5cbm1vZHVsZS5leHBvcnRzID0gbGlicmFyeVxuIiwibGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIHgseSApID0+IHtcbiAgbGV0IG11bCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgeCx5IF0sXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dFxuXG4gICAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgICAgb3V0ID0gIGAoJHtpbnB1dHNbMF19ICogJHtpbnB1dHNbMV19KWBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgPSBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSAqIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG11bFxufVxuIiwibGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncCcsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5wYXJhbWV0ZXJzLnB1c2goIHRoaXMubmFtZSApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICBsZXQgcGFyYW0gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcGFyYW0uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBwYXJhbS5uYW1lID0gYCR7cGFyYW0uYmFzZW5hbWV9JHtwYXJhbS5pZH1gXG5cbiAgcmV0dXJuIHBhcmFtXG59XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsICA9IHJlcXVpcmUoJy4vbXVsLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGVlaycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCwgZnVuY3Rpb25Cb2R5XG5cbmZ1bmN0aW9uQm9keSA9IGAgICBcbiAgbGV0ICR7dGhpcy5uYW1lfV9kYXRhID0gZ2VuLmRhdGEuJHt0aGlzLmRhdGFOYW1lfSxcbiAgICAgICR7dGhpcy5uYW1lfV9waGFzZSA9ICR7dGhpcy5tb2RlID09PSAwID8gaW5wdXRzWzBdIDogaW5wdXRzWzBdICsgJyAqIGdlbi5kYXRhLicgK3RoaXMuZGF0YU5hbWUrJy5sZW5ndGgnfSwgXG4gICAgICAke3RoaXMubmFtZX1faW5kZXggPSAke3RoaXMubmFtZX1fcGhhc2UgfCAwLFxuICAgICAgJHt0aGlzLm5hbWV9X2ZyYWMgPSAke3RoaXMubmFtZX1fcGhhc2UgLSAke3RoaXMubmFtZX1faW5kZXgsXG4gICAgICAke3RoaXMubmFtZX1fYmFzZSA9ICAke3RoaXMubmFtZX1fZGF0YVsgJHt0aGlzLm5hbWV9X2luZGV4IF0sXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICA9ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoICR7dGhpcy5uYW1lfV9kYXRhWyAoJHt0aGlzLm5hbWV9X2luZGV4KzEpICYgKCR7dGhpcy5uYW1lfV9kYXRhLmxlbmd0aCAtIDEpIF0gLSAke3RoaXMubmFtZX1fYmFzZSApIFxuXG5gXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lKydfb3V0JywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGRhdGFOYW1lLCBpbmRleCwgY2hhbm5lbHM9MSwgbW9kZT0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICkgXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBkYXRhTmFtZSxcbiAgICBjaGFubmVscyxcbiAgICBtb2RlLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluZGV4IF0sXG4gICAgcHJvcGVydGllczogbnVsbCxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bT0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwaGFzb3InLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICByZXR1cm4gYWNjdW0oIG11bCggaW5wdXRzWzBdLCAxLzQ0MTAwICksIGlucHV0c1sxXSApLmdlbigpXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgZnJlcXVlbmN5LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBmcmVxdWVuY3ksIHJlc2V0IF0sXG4gICAgcHJvcGVydGllczogWyAnZnJlcXVlbmN5JywncmVzZXQnIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2luJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnc2luJzogTWF0aC5zaW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5zaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBzaW4uaW5wdXRzID0gWyB4IF1cbiAgc2luLmlkID0gZ2VuLmdldFVJRCgpXG4gIHNpbi5uYW1lID0gYCR7c2luLmJhc2VuYW1lfXtzaW4uaWR9YFxuXG4gIHJldHVybiBzaW5cbn1cbiJdfQ==
