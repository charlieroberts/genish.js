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
    var diff = this.max - this.min;
    var out = '  ' + _name + '.value += ' + _incr + '\n  ' + (typeof _reset === 'number' && _reset < 1 ? '' : 'if(' + _reset + '>=1 ) ' + _name + '.value = ' + _name + '.min\n') + '\n  if( ' + _name + '.value >= ' + this.max + ' ) ' + _name + '.value -= ' + diff + '\n  \n';

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2FkZC5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2dlbi5qcyIsImpzL2luZGV4LmpzIiwianMvbXVsLmpzIiwianMvcGFyYW0uanMiLCJqcy9wZWVrLmpzIiwianMvcGhhc29yLmpzIiwianMvc2luLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7OztBQ0FBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixRQUFLLEtBQUw7O0FBRUEsc0JBQU07QUFDSixRQUFJLFlBQUo7UUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVCxDQUZBOztBQUlKLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBTCxFQUFhLEtBQUssR0FBTCxDQUFsQyxFQUR1Qjs7QUFHdkIsMEJBQWtCLE9BQU8sQ0FBUCxRQUFsQixDQUh1QjtLQUF6QixNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTixDQURLO0tBTFA7O0FBU0EsV0FBTyxHQUFQLENBYkk7R0FISTtDQUFSOztBQW9CSixPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFOLENBRGdCOztBQUdwQixNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYixDQUhvQjs7QUFLcEIsU0FBTyxHQUFQLENBTG9CO0NBQUw7Ozs7Ozs7QUN0QmpCLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixZQUFTLE9BQVQ7O0FBRUEsc0JBQU07QUFDSixRQUFJLGFBQUo7UUFDSSxTQUFTLEtBQUksU0FBSixD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RUFBYyxPQUFkLENBQVo7R0FKRixFQUgyQzs7QUFVM0MsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFMLEdBQWdCLEtBQUssR0FBTCxDQVZZOztBQVkzQyxTQUFPLElBQVAsQ0FaMkM7Q0FBNUI7Ozs7O0FDZmpCLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixZQUFTLEtBQVQ7O0FBRUEsc0JBQU07QUFDSixRQUFJLFlBQUo7UUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVCxDQUZBOztBQUlKLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsRUFBRSxPQUFPLEtBQUssR0FBTCxFQUExQixFQUR1Qjs7QUFHdkIsMEJBQWtCLE9BQU8sQ0FBUCxRQUFsQixDQUh1QjtLQUF6QixNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTixDQURLO0tBTFA7O0FBU0EsV0FBTyxHQUFQLENBYkk7R0FISTtDQUFSOztBQW9CSixPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFOLENBRGdCOztBQUdwQixNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYixDQUhvQjtBQUlwQixNQUFJLEVBQUosR0FBUyxLQUFJLE1BQUosRUFBVCxDQUpvQjtBQUtwQixNQUFJLElBQUosR0FBYyxJQUFJLFFBQUosYUFBZCxDQUxvQjs7QUFPcEIsU0FBTyxHQUFQLENBUG9CO0NBQUwiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonYWJzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguYWJzIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWJzKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFicyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFicyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhYnMuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gYWJzXG59XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYWNjdW0nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGdlbk5hbWUgKyAnLnZhbHVlJ1xuICAgIFxuICAgIHJldHVybiBbIGdlbk5hbWUgKyAnLnZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfcmVzZXQgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluXG4gICAgbGV0IG91dCA9IGAgICR7X25hbWV9LnZhbHVlICs9ICR7X2luY3J9XG4gICR7dHlwZW9mIF9yZXNldCA9PT0gJ251bWJlcicgJiYgX3Jlc2V0IDwgMSA/ICcnIDogJ2lmKCcrX3Jlc2V0Kyc+PTEgKSAnK19uYW1lKycudmFsdWUgPSAnICsgX25hbWUgKyAnLm1pblxcbid9XG4gIGlmKCAke19uYW1lfS52YWx1ZSA+PSAke3RoaXMubWF4fSApICR7X25hbWV9LnZhbHVlIC09ICR7ZGlmZn1cbiAgXG5gXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyLCByZXNldD0wLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdmFsdWU6ICAgMCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW5jciwgcmVzZXQgXSxcbiAgICBwcm9wZXJ0aWVzOiBbICdfaW5jcicsJ19yZXNldCcgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsImxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IGFkZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgc3VtID0gMCwgbnVtQ291bnQgPSAwLCBhZGRlckF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGlzTmFOKCB2ICkgKSB7XG4gICAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgICBhZGRlckF0RW5kID0gdHJ1ZVxuICAgICAgICAgICAgb3V0ICs9ICcgKyAnXG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdW0gKz0gcGFyc2VGbG9hdCggdiApXG4gICAgICAgICAgbnVtQ291bnQrK1xuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgICBvdXQgKz0gYWRkZXJBdEVuZCA/IHN1bSA6ICcgKyAnICsgc3VtXG4gICAgICB9XG4gICAgICBcbiAgICAgIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIGFkZFxufVxuIiwibGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL3BoYXNvci5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHBoYXNvcj1yZXF1aXJlKCAnLi9waGFzb3IuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjeWNsZScsXG4gIHRhYmxlOm51bGwsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIHJldHVybiBwZWVrKCdzaW5UYWJsZScsIHBoYXNvciggaW5wdXRzWzBdICksIDEsIDEgKS5nZW4oKVxuICB9LFxuXG4gIGluaXRUYWJsZSgpIHtcbiAgICB0aGlzLnRhYmxlID0gZGF0YSggJ3NpblRhYmxlJywgMTAyNCApXG5cbiAgICBmb3IoIGxldCBpID0gMCwgbCA9IHRoaXMudGFibGUubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xuICAgICAgdGhpcy50YWJsZVsgaSBdID0gTWF0aC5zaW4oICggaSAvIGwgKSAqICggTWF0aC5QSSAqIDIgKSApXG4gICAgfVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT0xLCByZXNldD0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBpZiggcHJvdG8udGFibGUgPT09IG51bGwgKSBwcm90by5pbml0VGFibGUoKSBcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGZyZXF1ZW5jeSxcbiAgICByZXNldCxcbiAgICB0YWJsZTogICAgICBwcm90by50YWJsZSxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBmcmVxdWVuY3ksIHJlc2V0IF0sXG4gICAgcHJvcGVydGllczogWyAnZnJlcXVlbmN5JywncmVzZXQnIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG5cbi8vbGV0IHRhYmxlID0gZnVuY3Rpb24oIGZyZXF1ZW5jeSApIHtcbi8vICBpZiggISAodGhpcyBpbnN0YW5jZW9mIHRhYmxlKSApIHJldHVybiBuZXcgdGFibGUoIGZyZXF1ZW5jeSApXG4gICAgXG4vLyAgbGV0IHRhYmxlU2l6ZSA9IDEwMjRcbiAgICBcbi8vICBPYmplY3QuYXNzaWduKCB0aGlzLCB7XG4vLyAgICBmcmVxdWVuY3ksXG4vLyAgICB1aWQ6IGdlbi5nZXRVSUQoKSxcbi8vICAgIHBoYXNlOjAsXG4vLyAgICB0YWJsZUZyZXE6IDQ0MTAwIC8gMTAyNCxcbi8vICAgIHRhYmxlOiBuZXcgRmxvYXQzMkFycmF5KCB0YWJsZVNpemUgKSxcbi8vICAgIGNvZGVnZW46IGdlbi5jb2RlZ2VuLFxuICAgIFxuLy8gICAgc2FtcGxlKCkge1xuLy8gICAgICBsZXQgaW5kZXgsIGZyYWMsIGJhc2VcbiAgICAgICAgICAgIFxuLy8gICAgICB0aGlzLnBoYXNlICs9IHRoaXMuZnJlcXVlbmN5IC8gdGhpcy50YWJsZUZyZXFcbi8vICAgICAgd2hpbGUoIHRoaXMucGhhc2UgPj0gMTAyNCApIHRoaXMucGhhc2UgLT0gMTAyNFxuICAgICAgICBcbi8vICAgICAgaW5kZXggICA9IHRoaXMucGhhc2UgfCAwXG4vLyAgICAgIGZyYWMgICAgPSB0aGlzLnBoYXNlIC0gaW5kZXhcbi8vICAgICAgYmFzZSAgICA9IHRoaXMudGFibGVbIGluZGV4IF1cbiAgICAgICAgXG4vLyAgICAgIHJldHVybiBiYXNlICsgKCBmcmFjICogKCB0aGlzLnRhYmxlWyAoaW5kZXgrMSkgJiAxMDIzIF0gLSBiYXNlICkgKSAqIDFcbi8vICAgIH0sXG4gICAgXG4vLyAgICBpbml0VGFibGUoKSB7XG4vLyAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGhpcy50YWJsZS5sZW5ndGg7IGkrKyApIHtcbi8vICAgICAgICB0aGlzLnRhYmxlWyBpIF0gPSBNYXRoLnNpbiggKCBpIC8gdGhpcy50YWJsZVNpemUgKSAqICggTWF0aC5QSSAqIDIgKSApXG4vLyAgICAgIH1cbi8vICAgIH1cbiAgICBcbi8vICB9KVxuICBcbi8vICB0aGlzLmluaXRUYWJsZSgpXG4vL31cbiIsImxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkYXRhJyxcblxuICBnZW4oKSB7XG4gICAgcmV0dXJuICdnZW4uZGF0YS4nICsgdGhpcy5uYW1lXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB1c2VybmFtZSwgZGltPTUxMiwgY2hhbm5lbHM9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBuZXcgRmxvYXQzMkFycmF5KCBkaW0gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdXNlcm5hbWUsXG4gICAgZGltLFxuICAgIGNoYW5uZWxzLFxuICAgIGdlbjogICAgICAgIHByb3RvLmdlblxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gdXNlcm5hbWVcblxuICBnZW4uZGF0YVsgdWdlbi5uYW1lIF0gPSB1Z2VuXG4gIFxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGdlbi5qc1xuICpcbiAqIGxvdy1sZXZlbCBjb2RlIGdlbmVyYXRpb24gZm9yIHVuaXQgZ2VuZXJhdG9yc1xuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY2N1bTowLFxuICBnZXRVSUQoKSB7IHJldHVybiB0aGlzLmFjY3VtKysgfSxcbiAgZGVidWc6ZmFsc2UsXG4gIFxuICAvKiBjbG9zdXJlc1xuICAgKlxuICAgKiBGdW5jdGlvbnMgdGhhdCBhcmUgaW5jbHVkZWQgYXMgYXJndW1lbnRzIHRvIG1hc3RlciBjYWxsYmFjay4gRXhhbXBsZXM6IE1hdGguYWJzLCBNYXRoLnJhbmRvbSBldGMuXG4gICAqIFhYWCBTaG91bGQgcHJvYmFibHkgYmUgcmVuYW1lZCBjYWxsYmFja1Byb3BlcnRpZXMgb3Igc29tZXRoaW5nIHNpbWlsYXIuLi4gY2xvc3VyZXMgYXJlIG5vIGxvbmdlciB1c2VkLlxuICAgKi9cblxuICBjbG9zdXJlczpuZXcgU2V0KCksXG5cbiAgcGFyYW1ldGVyczpbXSxcblxuICBtZW1vOiB7fSxcblxuICBkYXRhOiB7fSxcbiAgXG4gIC8qIGV4cG9ydFxuICAgKlxuICAgKiBwbGFjZSBnZW4gZnVuY3Rpb25zIGludG8gYW5vdGhlciBvYmplY3QgZm9yIGVhc2llciByZWZlcmVuY2VcbiAgICovXG5cbiAgZXhwb3J0KCBvYmogKSB7fSxcbiAgXG4gIC8qIGNyZWF0ZUNhbGxiYWNrXG4gICAqXG4gICAqIHBhcmFtIHVnZW4gLSBIZWFkIG9mIGdyYXBoIHRvIGJlIGNvZGVnZW4nZFxuICAgKlxuICAgKiBHZW5lcmF0ZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVnZW4gZ3JhcGguXG4gICAqIFRoZSBnZW4uY2xvc3VyZXMgcHJvcGVydHkgc3RvcmVzIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmVcbiAgICogcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZmluYWwgZnVuY3Rpb247IHRoZXNlIGFyZSBwcmVmaXhlZFxuICAgKiBiZWZvcmUgYW55IGRlZmluZWQgcGFyYW1zIHRoZSBncmFwaCBleHBvc2VzLiBGb3IgZXhhbXBsZSwgZ2l2ZW46XG4gICAqXG4gICAqIGdlbi5jcmVhdGVDYWxsYmFjayggYWJzKCBwYXJhbSgpICkgKVxuICAgKlxuICAgKiAuLi4gdGhlIGdlbmVyYXRlZCBmdW5jdGlvbiB3aWxsIGhhdmUgYSBzaWduYXR1cmUgb2YgKCBhYnMsIHAwICkuXG4gICAqL1xuXG4gIGNyZWF0ZUNhbGxiYWNrKCB1Z2VuICkge1xuICAgIGxldCBjYWxsYmFjaywgZ3JhcGhPdXRwdXRcblxuICAgIHRoaXMubWVtbyA9IHt9XG4gICAgdGhpcy5jbG9zdXJlcy5jbGVhcigpXG4gICAgdGhpcy5wYXJhbWV0ZXJzLmxlbmd0aCA9IDBcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gXCIgICd1c2Ugc3RyaWN0JztcXG5cIlxuXG4gICAgLy8gY2FsbCAuZ2VuKCkgb24gdGhlIGhlYWQgb2YgdGhlIGdyYXBoIHdlIGFyZSBnZW5lcmF0aW5nIHRoZSBjYWxsYmFjayBmb3JcbiAgICAvL2NvbnNvbGUubG9nKCAnSEVBRCcsIHVnZW4gKVxuICAgIGdyYXBoT3V0cHV0ID0gdWdlbi5nZW4oKVxuXG4gICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgIC8vIGFuZCB0aGVuIHJldHVybiBuYW1lIG9mIHVnZW4uIElmIC5nZW4oKSBvbmx5IGdlbmVyYXRlcyBhIG51bWJlciAoZm9yIHJlYWxseSBzaW1wbGUgZ3JhcGhzKVxuICAgIC8vIGp1c3QgcmV0dXJuIHRoYXQgbnVtYmVyIChncmFwaE91dHB1dFswXSkuXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gQXJyYXkuaXNBcnJheSggZ3JhcGhPdXRwdXQgKSA/IGdyYXBoT3V0cHV0WzFdICsgJ1xcbicgKyBncmFwaE91dHB1dFswXSA6IGdyYXBoT3V0cHV0XG5cbiAgICAvLyBzcGxpdCBib2R5IHRvIGluamVjdCByZXR1cm4ga2V5d29yZCBvbiBsYXN0IGxpbmVcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LnNwbGl0KCdcXG4nKVxuICAgIFxuICAgIC8vIGdldCBpbmRleCBvZiBsYXN0IGxpbmVcbiAgICBsZXQgbGFzdGlkeCA9IHRoaXMuZnVuY3Rpb25Cb2R5Lmxlbmd0aCAtIDFcblxuICAgIC8vIGluc2VydCByZXR1cm4ga2V5d29yZFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5WyBsYXN0aWR4IF0gPSAnICByZXR1cm4gJyArIHRoaXMuZnVuY3Rpb25Cb2R5WyBsYXN0aWR4IF0gXG4gICAgXG4gICAgLy8gcmVhc3NlbWJsZSBmdW5jdGlvbiBib2R5XG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKVxuXG4gICAgLy8gd2UgY2FuIG9ubHkgZHluYW1pY2FsbHkgY3JlYXRlIGEgbmFtZWQgZnVuY3Rpb24gYnkgZHluYW1pY2FsbHkgY3JlYXRpbmcgYW5vdGhlciBmdW5jdGlvblxuICAgIC8vIHRvIGNvbnN0cnVjdCB0aGUgbmFtZWQgZnVuY3Rpb24hIHNoZWVzaC4uLlxuICAgIGxldCBidWlsZFN0cmluZyA9IGByZXR1cm4gZnVuY3Rpb24gZ2VuKCAke3RoaXMucGFyYW1ldGVycy5qb2luKCcsJyl9ICl7IFxcbiR7dGhpcy5mdW5jdGlvbkJvZHl9XFxufWBcbiAgICBcbiAgICBpZiggdGhpcy5kZWJ1ZyApIGNvbnNvbGUubG9nKCBidWlsZFN0cmluZyApIFxuXG4gICAgY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oIGJ1aWxkU3RyaW5nICkoKVxuICAgIFxuICAgIC8vIGFzc2lnbiBwcm9wZXJ0aWVzIHRvIG5hbWVkIGZ1bmN0aW9uXG4gICAgZm9yKCBsZXQgZGljdCBvZiB0aGlzLmNsb3N1cmVzLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHZhbHVlID0gZGljdFsgbmFtZSBdXG5cbiAgICAgIGNhbGxiYWNrWyBuYW1lIF0gPSB2YWx1ZVxuICAgIH1cbiAgICBcbiAgICBjYWxsYmFjay5kYXRhID0gdGhpcy5kYXRhXG5cbiAgICByZXR1cm4gY2FsbGJhY2tcbiAgfSxcbiAgXG4gIC8qIGdldElucHV0c1xuICAgKlxuICAgKiBHaXZlbiBhbiBhcmd1bWVudCB1Z2VuLCBleHRyYWN0IGl0cyBpbnB1dHMuIElmIHRoZXkgYXJlIG51bWJlcnMsIHJldHVybiB0aGUgbnVtZWJycy4gSWZcbiAgICogdGhleSBhcmUgdWdlbnMsIGNhbGwgLmdlbigpIG9uIHRoZSB1Z2VuLCBtZW1vaXplIHRoZSByZXN1bHQgYW5kIHJldHVybiB0aGUgcmVzdWx0LiBJZiB0aGVcbiAgICogdWdlbiBoYXMgcHJldmlvdXNseSBiZWVuIG1lbW9pemVkIHJldHVybiB0aGUgbWVtb2l6ZWQgdmFsdWUuXG4gICAqXG4gICAqL1xuICBnZXRJbnB1dHMoIHVnZW4gKSB7XG4gICAgbGV0IGlucHV0cyA9IHVnZW4uaW5wdXRzLm1hcCggaW5wdXQgPT4ge1xuICAgICAgbGV0IGlzT2JqZWN0ID0gdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyxcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dFxuXG4gICAgICBpZiggaXNPYmplY3QgKSB7IC8vIGlmIGlucHV0IGlzIGEgdWdlbi4uLiBcbiAgICAgICAgaWYoIHRoaXMubWVtb1sgaW5wdXQubmFtZSBdICkgeyAvLyBpZiBpdCBoYXMgYmVlbiBtZW1vaXplZC4uLlxuICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gdGhpcy5tZW1vWyBpbnB1dC5uYW1lIF1cbiAgICAgICAgfWVsc2V7IC8vIGlmIG5vdCBtZW1vaXplZCBnZW5lcmF0ZSBjb2RlXG4gICAgICAgICAgbGV0IGNvZGUgPSBpbnB1dC5nZW4oKVxuICAgICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBjb2RlICkgKSB7XG4gICAgICAgICAgICB0aGlzLmZ1bmN0aW9uQm9keSArPSBjb2RlWzFdXG4gICAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfWVsc2V7IC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICAgIHByb2Nlc3NlZElucHV0ID0gaW5wdXRcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb2Nlc3NlZElucHV0XG4gICAgfSlcblxuICAgIHJldHVybiBpbnB1dHNcbiAgfVxufVxuIiwibGV0IGxpYnJhcnkgPSB7XG4gIGV4cG9ydCggZGVzdGluYXRpb24gKSB7XG4gICAgT2JqZWN0LmFzc2lnbiggZGVzdGluYXRpb24sIGxpYnJhcnkgKVxuICB9LFxuXG4gIGdlbjogICAgcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICBcbiAgYWJzOiAgICByZXF1aXJlKCcuL2Ficy5qcycpLFxuICBwYXJhbTogIHJlcXVpcmUoJy4vcGFyYW0uanMnKSxcbiAgYWRkOiAgICByZXF1aXJlKCcuL2FkZC5qcycpLFxuICBtdWw6ICAgIHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gIGFjY3VtOiAgcmVxdWlyZSgnLi9hY2N1bS5qcycpLFxuICBzaW46ICAgIHJlcXVpcmUoJy4vc2luLmpzJyksXG4gIHBoYXNvcjogcmVxdWlyZSgnLi9waGFzb3IuanMnKSxcbiAgZGF0YTogICByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgcGVlazogICByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgY3ljbGU6ICByZXF1aXJlKCcuL2N5Y2xlLmpzJyksXG59XG5cbmxpYnJhcnkuZ2VuLmxpYiA9IGxpYnJhcnlcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJyYXJ5XG4iLCJsZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggeCx5ICkgPT4ge1xuICBsZXQgbXVsID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyB4LHkgXSxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0XG5cbiAgICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgICBvdXQgPSAgYCgke2lucHV0c1swXX0gKiAke2lucHV0c1sxXX0pYFxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9IHBhcnNlRmxvYXQoIGlucHV0c1swXSApICogcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbXVsXG59XG4iLCJsZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwJyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLnBhcmFtZXRlcnMucHVzaCggdGhpcy5uYW1lIClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiB0aGlzLm5hbWVcbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIGxldCBwYXJhbSA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBwYXJhbS5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIHBhcmFtLm5hbWUgPSBgJHtwYXJhbS5iYXNlbmFtZX0ke3BhcmFtLmlkfWBcblxuICByZXR1cm4gcGFyYW1cbn1cbiIsImxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBtdWwgID0gcmVxdWlyZSgnLi9tdWwuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwZWVrJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0LCBmdW5jdGlvbkJvZHlcblxuZnVuY3Rpb25Cb2R5ID0gYCAgIFxuICBsZXQgJHt0aGlzLm5hbWV9X2RhdGEgPSBnZW4uZGF0YS4ke3RoaXMuZGF0YU5hbWV9LFxuICAgICAgJHt0aGlzLm5hbWV9X3BoYXNlID0gJHt0aGlzLm1vZGUgPT09IDAgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogZ2VuLmRhdGEuJyArIHRoaXMuZGF0YU5hbWUgKyAnLmxlbmd0aCd9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9pbmRleCA9ICR7dGhpcy5uYW1lfV9waGFzZSB8IDAsXG4gICAgICAke3RoaXMubmFtZX1fZnJhYyA9ICR7dGhpcy5uYW1lfV9waGFzZSAtICR7dGhpcy5uYW1lfV9pbmRleCxcbiAgICAgICR7dGhpcy5uYW1lfV9iYXNlID0gICR7dGhpcy5uYW1lfV9kYXRhWyAke3RoaXMubmFtZX1faW5kZXggXSxcbiAgICAgICR7dGhpcy5uYW1lfV9vdXQgID0gJHt0aGlzLm5hbWV9X2Jhc2UgKyAke3RoaXMubmFtZX1fZnJhYyAqICggJHt0aGlzLm5hbWV9X2RhdGFbICgke3RoaXMubmFtZX1faW5kZXgrMSkgJiAoJHt0aGlzLm5hbWV9X2RhdGEubGVuZ3RoIC0gMSkgXSAtICR7dGhpcy5uYW1lfV9iYXNlICkgXG5cbmBcbiAgICByZXR1cm4gWyB0aGlzLm5hbWUrJ19vdXQnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGF0YU5hbWUsIGluZGV4LCBjaGFubmVscz0xLCBtb2RlPTAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSBcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGRhdGFOYW1lLFxuICAgIGNoYW5uZWxzLFxuICAgIG1vZGUsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW5kZXggXSxcbiAgICBwcm9wZXJ0aWVzOiBudWxsLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsImxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BoYXNvcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIHJldHVybiBhY2N1bSggbXVsKCBpbnB1dHNbMF0sIDEvNDQxMDAgKSwgaW5wdXRzWzFdICkuZ2VuKClcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBmcmVxdWVuY3ksXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGZyZXF1ZW5jeSwgcmVzZXQgXSxcbiAgICBwcm9wZXJ0aWVzOiBbICdmcmVxdWVuY3knLCdyZXNldCcgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsImxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBNYXRoLnNpbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpbi5pbnB1dHMgPSBbIHggXVxuICBzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgc2luLm5hbWUgPSBgJHtzaW4uYmFzZW5hbWV9e3Npbi5pZH1gXG5cbiAgcmV0dXJuIHNpblxufVxuIl19
