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
    var diff = this.max - this.min,
        out = '  ' + _name + '.value += ' + _incr + '\n  ' + (typeof _reset === 'number' && _reset < 1 ? '' : 'if(' + _reset + '>=1 ) ' + _name + '.value = ' + _name + '.min\n') + '\n  if( ' + _name + '.value >= ' + this.max + ' ) ' + _name + '.value -= ' + diff + '\n  \n';
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

},{"./data.js":5,"./gen.js":6,"./mul.js":9,"./peek.js":11,"./phasor.js":12}],5:[function(require,module,exports){
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
  endBlock: [],

  memo: {},

  data: {},

  /* export
   *
   * place gen functions into another object for easier reference
   */

  export: function _export(obj) {},
  addToEndBlock: function addToEndBlock(v) {
    this.endBlock.push('  ' + v);
  },


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
    this.endBlock.length = 0;
    this.closures.clear();
    this.parameters.length = 0;

    this.functionBody = "  'use strict';\n\n";

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
    this.functionBody[lastidx] = '  let out = ' + this.functionBody[lastidx] + '\n';

    if (this.endBlock.length) {
      this.functionBody = this.functionBody.concat(this.endBlock);
      this.functionBody.push('\n  return out');
    } else {
      this.functionBody.push('  return out');
    }
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

var _gen = require('./gen.js');

module.exports = function () {
  var ugen = {
    inputs: [0],

    record: function record(v) {
      var obj = {
        gen: function gen() {
          var inputs = _gen.getInputs(ugen);

          _gen.addToEndBlock('gen.data.' + ugen.name + ' = ' + inputs[0]);

          return inputs[0];
        }
      };

      this.inputs[0] = v;

      return obj;
    },
    gen: function gen() {
      return 'gen.data.' + ugen.name;
    },


    uid: _gen.getUID()
  };

  ugen.name = 'history' + ugen.uid;

  _gen.data[ugen.name] = 0;

  return ugen;
};

},{"./gen.js":6}],8:[function(require,module,exports){
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
  cycle: require('./cycle.js'),
  history: require('./history.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./add.js":3,"./cycle.js":4,"./data.js":5,"./gen.js":6,"./history.js":7,"./mul.js":9,"./param.js":10,"./peek.js":11,"./phasor.js":12,"./sin.js":13}],9:[function(require,module,exports){
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

},{"./gen.js":6}],10:[function(require,module,exports){
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

},{"./gen.js":6}],11:[function(require,module,exports){
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

    functionBody = '  let ' + this.name + '_data  = gen.data.' + this.dataName + ',\n      ' + this.name + '_phase = ' + (this.mode === 0 ? inputs[0] : inputs[0] + ' * gen.data.' + this.dataName + '.length') + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n      ' + this.name + '_frac  = ' + this.name + '_phase - ' + this.name + '_index,\n      ' + this.name + '_base  = ' + this.name + '_data[ ' + this.name + '_index ],\n      ' + this.name + '_out   = ' + this.name + '_base + ' + this.name + '_frac * ( ' + this.name + '_data[ (' + this.name + '_index+1) & (' + this.name + '_data.length - 1) ] - ' + this.name + '_base ) \n\n';
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

},{"./gen.js":6,"./mul.js":9}],12:[function(require,module,exports){
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

},{"./accum.js":2,"./gen.js":6,"./mul.js":9}],13:[function(require,module,exports){
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

},{"./gen.js":6}]},{},[8])(8)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2FkZC5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2dlbi5qcyIsImpzL2hpc3RvcnkuanMiLCJqcy9pbmRleC5qcyIsImpzL211bC5qcyIsImpzL3BhcmFtLmpzIiwianMvcGVlay5qcyIsImpzL3BoYXNvci5qcyIsImpzL3Npbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7QUNBQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVA7O0FBRUosSUFBSSxRQUFRO0FBQ1YsUUFBSyxLQUFMOztBQUVBLHNCQUFNO0FBQ0osUUFBSSxZQUFKO1FBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQVQsQ0FGQTs7QUFJSixRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2QixXQUFJLFFBQUosQ0FBYSxHQUFiLHFCQUFxQixLQUFLLElBQUwsRUFBYSxLQUFLLEdBQUwsQ0FBbEMsRUFEdUI7O0FBR3ZCLDBCQUFrQixPQUFPLENBQVAsUUFBbEIsQ0FIdUI7S0FBekIsTUFLTztBQUNMLFlBQU0sS0FBSyxHQUFMLENBQVUsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFWLENBQU4sQ0FESztLQUxQOztBQVNBLFdBQU8sR0FBUCxDQWJJO0dBSEk7Q0FBUjs7QUFvQkosT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBTixDQURnQjs7QUFHcEIsTUFBSSxNQUFKLEdBQWEsQ0FBRSxDQUFGLENBQWIsQ0FIb0I7O0FBS3BCLFNBQU8sR0FBUCxDQUxvQjtDQUFMOzs7Ozs7O0FDdEJqQixJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVA7O0FBRUosSUFBSSxRQUFRO0FBQ1YsWUFBUyxPQUFUOztBQUVBLHNCQUFNO0FBQ0osUUFBSSxhQUFKO1FBQ0ks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biBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonYWJzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguYWJzIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWJzKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFicyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFicyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhYnMuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gYWJzXG59XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYWNjdW0nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGdlbk5hbWUgKyAnLnZhbHVlJ1xuICAgIFxuICAgIHJldHVybiBbIGdlbk5hbWUgKyAnLnZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfcmVzZXQgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSBgICAke19uYW1lfS52YWx1ZSArPSAke19pbmNyfVxuICAke3R5cGVvZiBfcmVzZXQgPT09ICdudW1iZXInICYmIF9yZXNldCA8IDEgPyAnJyA6ICdpZignK19yZXNldCsnPj0xICkgJytfbmFtZSsnLnZhbHVlID0gJyArIF9uYW1lICsgJy5taW5cXG4nfVxuICBpZiggJHtfbmFtZX0udmFsdWUgPj0gJHt0aGlzLm1heH0gKSAke19uYW1lfS52YWx1ZSAtPSAke2RpZmZ9XG4gIFxuYFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jciwgcmVzZXQ9MCwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHZhbHVlOiAgIDAsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIHJlc2V0IF0sXG4gICAgcHJvcGVydGllczogWyAnX2luY3InLCdfcmVzZXQnIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCJsZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICguLi5hcmdzKSA9PiB7XG4gIGxldCBhZGQgPSB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuKCkge1xuICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgICBvdXQ9JygnLFxuICAgICAgICAgIHN1bSA9IDAsIG51bUNvdW50ID0gMCwgYWRkZXJBdEVuZCA9IGZhbHNlXG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICAgIG91dCArPSB2XG4gICAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgICAgYWRkZXJBdEVuZCA9IHRydWVcbiAgICAgICAgICAgIG91dCArPSAnICsgJ1xuICAgICAgICAgIH1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3VtICs9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICAgIG51bUNvdW50KytcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgaWYoIG51bUNvdW50ID4gMCApIHtcbiAgICAgICAgb3V0ICs9IGFkZGVyQXRFbmQgPyBzdW0gOiAnICsgJyArIHN1bVxuICAgICAgfVxuICAgICAgXG4gICAgICBvdXQgKz0gJyknXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBhZGRcbn1cbiIsImxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwaGFzb3I9cmVxdWlyZSggJy4vcGhhc29yLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY3ljbGUnLFxuICB0YWJsZTpudWxsLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICByZXR1cm4gcGVlaygnc2luVGFibGUnLCBwaGFzb3IoIGlucHV0c1swXSApLCAxLCAxICkuZ2VuKClcbiAgfSxcblxuICBpbml0VGFibGUoKSB7XG4gICAgdGhpcy50YWJsZSA9IGRhdGEoICdzaW5UYWJsZScsIDEwMjQgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDAsIGwgPSB0aGlzLnRhYmxlLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIHRoaXMudGFibGVbIGkgXSA9IE1hdGguc2luKCAoIGkgLyBsICkgKiAoIE1hdGguUEkgKiAyICkgKVxuICAgIH1cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgaWYoIHByb3RvLnRhYmxlID09PSBudWxsICkgcHJvdG8uaW5pdFRhYmxlKCkgXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBmcmVxdWVuY3ksXG4gICAgcmVzZXQsXG4gICAgdGFibGU6ICAgICAgcHJvdG8udGFibGUsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgZnJlcXVlbmN5LCByZXNldCBdLFxuICAgIHByb3BlcnRpZXM6IFsgJ2ZyZXF1ZW5jeScsJ3Jlc2V0JyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuXG4vL2xldCB0YWJsZSA9IGZ1bmN0aW9uKCBmcmVxdWVuY3kgKSB7XG4vLyAgaWYoICEgKHRoaXMgaW5zdGFuY2VvZiB0YWJsZSkgKSByZXR1cm4gbmV3IHRhYmxlKCBmcmVxdWVuY3kgKVxuICAgIFxuLy8gIGxldCB0YWJsZVNpemUgPSAxMDI0XG4gICAgXG4vLyAgT2JqZWN0LmFzc2lnbiggdGhpcywge1xuLy8gICAgZnJlcXVlbmN5LFxuLy8gICAgdWlkOiBnZW4uZ2V0VUlEKCksXG4vLyAgICBwaGFzZTowLFxuLy8gICAgdGFibGVGcmVxOiA0NDEwMCAvIDEwMjQsXG4vLyAgICB0YWJsZTogbmV3IEZsb2F0MzJBcnJheSggdGFibGVTaXplICksXG4vLyAgICBjb2RlZ2VuOiBnZW4uY29kZWdlbixcbiAgICBcbi8vICAgIHNhbXBsZSgpIHtcbi8vICAgICAgbGV0IGluZGV4LCBmcmFjLCBiYXNlXG4gICAgICAgICAgICBcbi8vICAgICAgdGhpcy5waGFzZSArPSB0aGlzLmZyZXF1ZW5jeSAvIHRoaXMudGFibGVGcmVxXG4vLyAgICAgIHdoaWxlKCB0aGlzLnBoYXNlID49IDEwMjQgKSB0aGlzLnBoYXNlIC09IDEwMjRcbiAgICAgICAgXG4vLyAgICAgIGluZGV4ICAgPSB0aGlzLnBoYXNlIHwgMFxuLy8gICAgICBmcmFjICAgID0gdGhpcy5waGFzZSAtIGluZGV4XG4vLyAgICAgIGJhc2UgICAgPSB0aGlzLnRhYmxlWyBpbmRleCBdXG4gICAgICAgIFxuLy8gICAgICByZXR1cm4gYmFzZSArICggZnJhYyAqICggdGhpcy50YWJsZVsgKGluZGV4KzEpICYgMTAyMyBdIC0gYmFzZSApICkgKiAxXG4vLyAgICB9LFxuICAgIFxuLy8gICAgaW5pdFRhYmxlKCkge1xuLy8gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRoaXMudGFibGUubGVuZ3RoOyBpKysgKSB7XG4vLyAgICAgICAgdGhpcy50YWJsZVsgaSBdID0gTWF0aC5zaW4oICggaSAvIHRoaXMudGFibGVTaXplICkgKiAoIE1hdGguUEkgKiAyICkgKVxuLy8gICAgICB9XG4vLyAgICB9XG4gICAgXG4vLyAgfSlcbiAgXG4vLyAgdGhpcy5pbml0VGFibGUoKVxuLy99XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGF0YScsXG5cbiAgZ2VuKCkge1xuICAgIHJldHVybiAnZ2VuLmRhdGEuJyArIHRoaXMubmFtZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggdXNlcm5hbWUsIGRpbT01MTIsIGNoYW5uZWxzPTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gbmV3IEZsb2F0MzJBcnJheSggZGltIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHVzZXJuYW1lLFxuICAgIGRpbSxcbiAgICBjaGFubmVscyxcbiAgICBnZW46ICAgICAgICBwcm90by5nZW5cbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IHVzZXJuYW1lXG5cbiAgZ2VuLmRhdGFbIHVnZW4ubmFtZSBdID0gdWdlblxuICBcbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKiBnZW4uanNcbiAqXG4gKiBsb3ctbGV2ZWwgY29kZSBnZW5lcmF0aW9uIGZvciB1bml0IGdlbmVyYXRvcnNcbiAqXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWNjdW06MCxcbiAgZ2V0VUlEKCkgeyByZXR1cm4gdGhpcy5hY2N1bSsrIH0sXG4gIGRlYnVnOmZhbHNlLFxuICBcbiAgLyogY2xvc3VyZXNcbiAgICpcbiAgICogRnVuY3Rpb25zIHRoYXQgYXJlIGluY2x1ZGVkIGFzIGFyZ3VtZW50cyB0byBtYXN0ZXIgY2FsbGJhY2suIEV4YW1wbGVzOiBNYXRoLmFicywgTWF0aC5yYW5kb20gZXRjLlxuICAgKiBYWFggU2hvdWxkIHByb2JhYmx5IGJlIHJlbmFtZWQgY2FsbGJhY2tQcm9wZXJ0aWVzIG9yIHNvbWV0aGluZyBzaW1pbGFyLi4uIGNsb3N1cmVzIGFyZSBubyBsb25nZXIgdXNlZC5cbiAgICovXG5cbiAgY2xvc3VyZXM6bmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6W10sXG4gIGVuZEJsb2NrOiBbXSxcblxuICBtZW1vOiB7fSxcblxuICBkYXRhOiB7fSxcbiAgXG4gIC8qIGV4cG9ydFxuICAgKlxuICAgKiBwbGFjZSBnZW4gZnVuY3Rpb25zIGludG8gYW5vdGhlciBvYmplY3QgZm9yIGVhc2llciByZWZlcmVuY2VcbiAgICovXG5cbiAgZXhwb3J0KCBvYmogKSB7fSxcblxuICBhZGRUb0VuZEJsb2NrKCB2ICkge1xuICAgIHRoaXMuZW5kQmxvY2sucHVzaCggJyAgJyArIHYgKVxuICB9LFxuICBcbiAgLyogY3JlYXRlQ2FsbGJhY2tcbiAgICpcbiAgICogcGFyYW0gdWdlbiAtIEhlYWQgb2YgZ3JhcGggdG8gYmUgY29kZWdlbidkXG4gICAqXG4gICAqIEdlbmVyYXRlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBhIHBhcnRpY3VsYXIgdWdlbiBncmFwaC5cbiAgICogVGhlIGdlbi5jbG9zdXJlcyBwcm9wZXJ0eSBzdG9yZXMgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZVxuICAgKiBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBmaW5hbCBmdW5jdGlvbjsgdGhlc2UgYXJlIHByZWZpeGVkXG4gICAqIGJlZm9yZSBhbnkgZGVmaW5lZCBwYXJhbXMgdGhlIGdyYXBoIGV4cG9zZXMuIEZvciBleGFtcGxlLCBnaXZlbjpcbiAgICpcbiAgICogZ2VuLmNyZWF0ZUNhbGxiYWNrKCBhYnMoIHBhcmFtKCkgKSApXG4gICAqXG4gICAqIC4uLiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHdpbGwgaGF2ZSBhIHNpZ25hdHVyZSBvZiAoIGFicywgcDAgKS5cbiAgICovXG4gIFxuICBjcmVhdGVDYWxsYmFjayggdWdlbiApIHtcbiAgICBsZXQgY2FsbGJhY2ssIGdyYXBoT3V0cHV0XG5cbiAgICB0aGlzLm1lbW8gPSB7fVxuICAgIHRoaXMuZW5kQmxvY2subGVuZ3RoID0gMFxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMucGFyYW1ldGVycy5sZW5ndGggPSAwXG5cbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiICAndXNlIHN0cmljdCc7XFxuXFxuXCJcblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBncmFwaE91dHB1dCA9IHVnZW4uZ2VuKClcblxuICAgIC8vIGlmIC5nZW4oKSByZXR1cm5zIGFycmF5LCBhZGQgdWdlbiBjYWxsYmFjayAoZ3JhcGhPdXRwdXRbMV0pIHRvIG91ciBvdXRwdXQgZnVuY3Rpb25zIGJvZHlcbiAgICAvLyBhbmQgdGhlbiByZXR1cm4gbmFtZSBvZiB1Z2VuLiBJZiAuZ2VuKCkgb25seSBnZW5lcmF0ZXMgYSBudW1iZXIgKGZvciByZWFsbHkgc2ltcGxlIGdyYXBocylcbiAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IEFycmF5LmlzQXJyYXkoIGdyYXBoT3V0cHV0ICkgPyBncmFwaE91dHB1dFsxXSArICdcXG4nICsgZ3JhcGhPdXRwdXRbMF0gOiBncmFwaE91dHB1dFxuXG4gICAgLy8gc3BsaXQgYm9keSB0byBpbmplY3QgcmV0dXJuIGtleXdvcmQgb24gbGFzdCBsaW5lXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5zcGxpdCgnXFxuJylcbiAgICBcbiAgICAvLyBnZXQgaW5kZXggb2YgbGFzdCBsaW5lXG4gICAgbGV0IGxhc3RpZHggPSB0aGlzLmZ1bmN0aW9uQm9keS5sZW5ndGggLSAxXG5cbiAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICB0aGlzLmZ1bmN0aW9uQm9keVsgbGFzdGlkeCBdID0gJyAgbGV0IG91dCA9ICcgKyB0aGlzLmZ1bmN0aW9uQm9keVsgbGFzdGlkeF0gKyAnXFxuJ1xuICAgIFxuICAgIGlmKCB0aGlzLmVuZEJsb2NrLmxlbmd0aCApIHsgXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmNvbmNhdCggdGhpcy5lbmRCbG9jayApIFxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggJ1xcbiAgcmV0dXJuIG91dCcgKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggJyAgcmV0dXJuIG91dCcgKVxuICAgIH1cbiAgICAvLyByZWFzc2VtYmxlIGZ1bmN0aW9uIGJvZHlcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmpvaW4oJ1xcbicpXG5cbiAgICAvLyB3ZSBjYW4gb25seSBkeW5hbWljYWxseSBjcmVhdGUgYSBuYW1lZCBmdW5jdGlvbiBieSBkeW5hbWljYWxseSBjcmVhdGluZyBhbm90aGVyIGZ1bmN0aW9uXG4gICAgLy8gdG8gY29uc3RydWN0IHRoZSBuYW1lZCBmdW5jdGlvbiEgc2hlZXNoLi4uXG4gICAgbGV0IGJ1aWxkU3RyaW5nID0gYHJldHVybiBmdW5jdGlvbiBnZW4oICR7dGhpcy5wYXJhbWV0ZXJzLmpvaW4oJywnKX0gKXsgXFxuJHt0aGlzLmZ1bmN0aW9uQm9keX1cXG59YFxuICAgIFxuICAgIGlmKCB0aGlzLmRlYnVnICkgY29uc29sZS5sb2coIGJ1aWxkU3RyaW5nICkgXG5cbiAgICBjYWxsYmFjayA9IG5ldyBGdW5jdGlvbiggYnVpbGRTdHJpbmcgKSgpXG4gICAgXG4gICAgLy8gYXNzaWduIHByb3BlcnRpZXMgdG8gbmFtZWQgZnVuY3Rpb25cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMuY2xvc3VyZXMudmFsdWVzKCkgKSB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdmFsdWUgPSBkaWN0WyBuYW1lIF1cblxuICAgICAgY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuICAgIFxuICAgIGNhbGxiYWNrLmRhdGEgPSB0aGlzLmRhdGFcblxuICAgIHJldHVybiBjYWxsYmFja1xuICB9LFxuICBcbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIEdpdmVuIGFuIGFyZ3VtZW50IHVnZW4sIGV4dHJhY3QgaXRzIGlucHV0cy4gSWYgdGhleSBhcmUgbnVtYmVycywgcmV0dXJuIHRoZSBudW1lYnJzLiBJZlxuICAgKiB0aGV5IGFyZSB1Z2VucywgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0cyggdWdlbiApIHtcbiAgICBsZXQgaW5wdXRzID0gdWdlbi5pbnB1dHMubWFwKCBpbnB1dCA9PiB7XG4gICAgICBsZXQgaXNPYmplY3QgPSB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnLFxuICAgICAgICAgIHByb2Nlc3NlZElucHV0XG5cbiAgICAgIGlmKCBpc09iamVjdCApIHsgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uIFxuICAgICAgICBpZiggdGhpcy5tZW1vWyBpbnB1dC5uYW1lIF0gKSB7IC8vIGlmIGl0IGhhcyBiZWVuIG1lbW9pemVkLi4uXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSB0aGlzLm1lbW9bIGlucHV0Lm5hbWUgXVxuICAgICAgICB9ZWxzZXsgLy8gaWYgbm90IG1lbW9pemVkIGdlbmVyYXRlIGNvZGVcbiAgICAgICAgICBsZXQgY29kZSA9IGlucHV0LmdlbigpXG4gICAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGNvZGUgKSApIHtcbiAgICAgICAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV1cbiAgICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVswXVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9ZWxzZXsgLy8gaXQgaW5wdXQgaXMgYSBudW1iZXJcbiAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBpbnB1dFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gcHJvY2Vzc2VkSW5wdXRcbiAgICB9KVxuXG4gICAgcmV0dXJuIGlucHV0c1xuICB9XG59XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIGxldCB1Z2VuID0ge1xuICAgIGlucHV0czogWyAwIF0sXG5cbiAgICByZWNvcmQoIHYgKSB7XG4gICAgICBsZXQgb2JqID0ge1xuICAgICAgICBnZW4oKSB7XG4gICAgICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHVnZW4gKVxuXG4gICAgICAgICAgZ2VuLmFkZFRvRW5kQmxvY2soICdnZW4uZGF0YS4nICsgdWdlbi5uYW1lICsgJyA9ICcgKyBpbnB1dHNbIDAgXSApXG5cbiAgICAgICAgICByZXR1cm4gaW5wdXRzWyAwIF1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmlucHV0c1sgMCBdID0gdlxuXG4gICAgICByZXR1cm4gb2JqXG4gICAgfSxcblxuICAgIGdlbigpIHsgcmV0dXJuICdnZW4uZGF0YS4nICsgdWdlbi5uYW1lIH0sXG5cbiAgICB1aWQ6IGdlbi5nZXRVSUQoKSxcbiAgfVxuICBcbiAgdWdlbi5uYW1lID0gJ2hpc3RvcnknK3VnZW4udWlkXG5cbiAgZ2VuLmRhdGFbIHVnZW4ubmFtZSBdID0gMFxuICBcbiAgcmV0dXJuIHVnZW5cbn1cbiIsImxldCBsaWJyYXJ5ID0ge1xuICBleHBvcnQoIGRlc3RpbmF0aW9uICkge1xuICAgIE9iamVjdC5hc3NpZ24oIGRlc3RpbmF0aW9uLCBsaWJyYXJ5IClcbiAgfSxcblxuICBnZW46ICAgIHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgXG4gIGFiczogICAgcmVxdWlyZSgnLi9hYnMuanMnKSxcbiAgcGFyYW06ICByZXF1aXJlKCcuL3BhcmFtLmpzJyksXG4gIGFkZDogICAgcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgbXVsOiAgICByZXF1aXJlKCcuL211bC5qcycpLFxuICBhY2N1bTogIHJlcXVpcmUoJy4vYWNjdW0uanMnKSxcbiAgc2luOiAgICByZXF1aXJlKCcuL3Npbi5qcycpLFxuICBwaGFzb3I6IHJlcXVpcmUoJy4vcGhhc29yLmpzJyksXG4gIGRhdGE6ICAgcmVxdWlyZSgnLi9kYXRhLmpzJyksXG4gIHBlZWs6ICAgcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gIGN5Y2xlOiAgcmVxdWlyZSgnLi9jeWNsZS5qcycpLFxuICBoaXN0b3J5OnJlcXVpcmUoJy4vaGlzdG9yeS5qcycpLFxufVxuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5XG5cbm1vZHVsZS5leHBvcnRzID0gbGlicmFyeVxuIiwibGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIHgseSApID0+IHtcbiAgbGV0IG11bCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgeCx5IF0sXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dFxuXG4gICAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgICAgb3V0ID0gIGAoJHtpbnB1dHNbMF19ICogJHtpbnB1dHNbMV19KWBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgPSBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSAqIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG11bFxufVxuIiwibGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncCcsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5wYXJhbWV0ZXJzLnB1c2goIHRoaXMubmFtZSApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICBsZXQgcGFyYW0gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcGFyYW0uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBwYXJhbS5uYW1lID0gYCR7cGFyYW0uYmFzZW5hbWV9JHtwYXJhbS5pZH1gXG5cbiAgcmV0dXJuIHBhcmFtXG59XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsICA9IHJlcXVpcmUoJy4vbXVsLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGVlaycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCwgZnVuY3Rpb25Cb2R5XG5cbmZ1bmN0aW9uQm9keSA9IGAgIGxldCAke3RoaXMubmFtZX1fZGF0YSAgPSBnZW4uZGF0YS4ke3RoaXMuZGF0YU5hbWV9LFxuICAgICAgJHt0aGlzLm5hbWV9X3BoYXNlID0gJHt0aGlzLm1vZGUgPT09IDAgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogZ2VuLmRhdGEuJyArIHRoaXMuZGF0YU5hbWUgKyAnLmxlbmd0aCd9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9pbmRleCA9ICR7dGhpcy5uYW1lfV9waGFzZSB8IDAsXG4gICAgICAke3RoaXMubmFtZX1fZnJhYyAgPSAke3RoaXMubmFtZX1fcGhhc2UgLSAke3RoaXMubmFtZX1faW5kZXgsXG4gICAgICAke3RoaXMubmFtZX1fYmFzZSAgPSAke3RoaXMubmFtZX1fZGF0YVsgJHt0aGlzLm5hbWV9X2luZGV4IF0sXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCAke3RoaXMubmFtZX1fZGF0YVsgKCR7dGhpcy5uYW1lfV9pbmRleCsxKSAmICgke3RoaXMubmFtZX1fZGF0YS5sZW5ndGggLSAxKSBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKSBcblxuYFxuICAgIHJldHVybiBbIHRoaXMubmFtZSsnX291dCcsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBkYXRhTmFtZSwgaW5kZXgsIGNoYW5uZWxzPTEsIG1vZGU9MCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApIFxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgZGF0YU5hbWUsXG4gICAgY2hhbm5lbHMsXG4gICAgbW9kZSxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbmRleCBdLFxuICAgIHByb3BlcnRpZXM6IG51bGwsXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuIiwibGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGhhc29yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgcmV0dXJuIGFjY3VtKCBtdWwoIGlucHV0c1swXSwgMS80NDEwMCApLCBpbnB1dHNbMV0gKS5nZW4oKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT0xLCByZXNldD0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGZyZXF1ZW5jeSxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgZnJlcXVlbmN5LCByZXNldCBdLFxuICAgIHByb3BlcnRpZXM6IFsgJ2ZyZXF1ZW5jeScsJ3Jlc2V0JyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwibGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Npbic6IE1hdGguc2luIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5zaW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBzaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2luLmlucHV0cyA9IFsgeCBdXG4gIHNpbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBzaW4ubmFtZSA9IGAke3Npbi5iYXNlbmFtZX17c2luLmlkfWBcblxuICByZXR1cm4gc2luXG59XG4iXX0=
