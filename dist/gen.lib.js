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

},{"./gen.js":7}],2:[function(require,module,exports){
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


  // ${typeof _reset === 'number' && _reset < 1 ? '' : 'if('+_reset+'>=1 ) '+_name+'.value = ' + _name + '.min\n'}

  callback: function callback(_name, _incr, _reset) {
    var diff = this.max - this.min,
        out = '  ' + _name + '.value += ' + _incr + '\n  ' + (typeof _reset === 'number' && _reset < 1 ? '' : 'if(' + _reset + '>=1 ) ' + _name + '.value = ' + this.min + '\n') + '\n  if( ' + _name + '.value >= ' + this.max + ' ) ' + _name + '.value -= ' + diff + '\n  \n';
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

},{"./gen.js":7}],3:[function(require,module,exports){
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

},{"./gen.js":7}],4:[function(require,module,exports){
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

},{"./data.js":5,"./gen.js":7,"./mul.js":10,"./peek.js":12,"./phasor.js":13}],5:[function(require,module,exports){
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

},{"./gen.js":7}],6:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js');

var proto = {
  basename: 'delta',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        n1 = history();

    n1.record(inputs[0]).gen();

    return sub(inputs[0], n1).gen();
  }
};

module.exports = function (in1) {
  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":7,"./history.js":8,"./sub.js":16}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
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

          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
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

},{"./gen.js":7}],9:[function(require,module,exports){
'use strict';

var library = {
  export: function _export(destination) {
    Object.assign(destination, library);
    destination.ssd = library.history; // history is window object property, so use ssd as alias
  },


  gen: require('./gen.js'),

  abs: require('./abs.js'),
  round: require('./round.js'),
  param: require('./param.js'),
  add: require('./add.js'),
  sub: require('./sub.js'),
  mul: require('./mul.js'),
  accum: require('./accum.js'),
  sin: require('./sin.js'),
  phasor: require('./phasor.js'),
  data: require('./data.js'),
  peek: require('./peek.js'),
  cycle: require('./cycle.js'),
  history: require('./history.js'),
  delta: require('./delta.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./add.js":3,"./cycle.js":4,"./data.js":5,"./delta.js":6,"./gen.js":7,"./history.js":8,"./mul.js":10,"./param.js":11,"./peek.js":12,"./phasor.js":13,"./round.js":14,"./sin.js":15,"./sub.js":16}],10:[function(require,module,exports){
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

},{"./gen.js":7}],11:[function(require,module,exports){
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

},{"./gen.js":7}],12:[function(require,module,exports){
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

},{"./gen.js":7,"./mul.js":10}],13:[function(require,module,exports){
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

},{"./accum.js":2,"./gen.js":7,"./mul.js":10}],14:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'round',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.round));

      out = 'gen.round( ' + inputs[0] + ' )';
    } else {
      out = Math.round(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var round = Object.create(proto);

  round.inputs = [x];

  return round;
};

},{"./gen.js":7}],15:[function(require,module,exports){
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

},{"./gen.js":7}],16:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var sub = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          diff = 0,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          subAtEnd = false;

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber - v;
          out += lastNumber;
        } else {
          out += lastNumber + ' - ' + v;
        }

        if (!isFinalIdx) out += ' - ';
      });

      out += ')';

      return out;
    }
  };

  return sub;
};

},{"./gen.js":7}]},{},[9])(9)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2FkZC5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RlbHRhLmpzIiwianMvZ2VuLmpzIiwianMvaGlzdG9yeS5qcyIsImpzL2luZGV4LmpzIiwianMvbXVsLmpzIiwianMvcGFyYW0uanMiLCJqcy9wZWVrLmpzIiwianMvcGhhc29yLmpzIiwianMvcm91bmQuanMiLCJqcy9zaW4uanMiLCJqcy9zdWIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O0FDQUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFQOztBQUVKLElBQUksUUFBUTtBQUNWLFFBQUssS0FBTDs7QUFFQSxzQkFBTTtBQUNKLFFBQUksWUFBSjtRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFULENBRkE7O0FBSUosUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQUosRUFBeUI7QUFDdkIsV0FBSSxRQUFKLENBQWEsR0FBYixxQkFBcUIsS0FBSyxJQUFMLEVBQWEsS0FBSyxHQUFMLENBQWxDLEVBRHVCOztBQUd2QiwwQkFBa0IsT0FBTyxDQUFQLFFBQWxCLENBSHVCO0tBQXpCLE1BS087QUFDTCxZQUFNLEtBQUssR0FBTCxDQUFVLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBVixDQUFOLENBREs7S0FMUDs7QUFTQSxXQUFPLEdBQVAsQ0FiSTtHQUhJO0NBQVI7O0FBb0JKLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQU4sQ0FEZ0I7O0FBR3BCLE1BQUksTUFBSixHQUFhLENBQUUsQ0FBRixDQUFiLENBSG9COztBQUtwQixTQUFPLEdBQVAsQ0FMb0I7Q0FBTDs7Ozs7OztBQ3RCakIsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFQOztBQUVKLElBQUksUUFBUTtBQUNWLFlB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LENBQWxCO09BYmMsQ0FBaEIsQ0FUSTs7QUF5QkosYUFBTyxHQUFQLENBekJJOztBQTJCSixhQUFPLEdBQVAsQ0EzQkk7S0FKRTtHQUFOLENBRHdCOztBQW9DNUIsU0FBTyxHQUFQLENBcEM0QjtDQUFiIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2FicycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmFicyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFicyggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hYnMoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhYnMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWJzLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGFic1xufVxuIiwibGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FjY3VtJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0gKVxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBnZW5OYW1lICsgJy52YWx1ZSdcbiAgICBcbiAgICByZXR1cm4gWyBnZW5OYW1lICsgJy52YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgLy8gJHt0eXBlb2YgX3Jlc2V0ID09PSAnbnVtYmVyJyAmJiBfcmVzZXQgPCAxID8gJycgOiAnaWYoJytfcmVzZXQrJz49MSApICcrX25hbWUrJy52YWx1ZSA9ICcgKyBfbmFtZSArICcubWluXFxuJ31cblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfcmVzZXQgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSBgICAke19uYW1lfS52YWx1ZSArPSAke19pbmNyfVxuICAke3R5cGVvZiBfcmVzZXQgPT09ICdudW1iZXInICYmIF9yZXNldCA8IDEgPyAnJyA6ICdpZignK19yZXNldCsnPj0xICkgJytfbmFtZSsnLnZhbHVlID0gJyArIHRoaXMubWluICsgJ1xcbid9XG4gIGlmKCAke19uYW1lfS52YWx1ZSA+PSAke3RoaXMubWF4fSApICR7X25hbWV9LnZhbHVlIC09ICR7ZGlmZn1cbiAgXG5gXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyLCByZXNldD0wLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdmFsdWU6ICAgMCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW5jciwgcmVzZXQgXSxcbiAgICBwcm9wZXJ0aWVzOiBbICdfaW5jcicsJ19yZXNldCcgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsImxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IGFkZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgc3VtID0gMCwgbnVtQ291bnQgPSAwLCBhZGRlckF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGlzTmFOKCB2ICkgKSB7XG4gICAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgICBhZGRlckF0RW5kID0gdHJ1ZVxuICAgICAgICAgICAgb3V0ICs9ICcgKyAnXG4gICAgICAgICAgfVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdW0gKz0gcGFyc2VGbG9hdCggdiApXG4gICAgICAgICAgbnVtQ291bnQrK1xuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgICBvdXQgKz0gYWRkZXJBdEVuZCA/IHN1bSA6ICcgKyAnICsgc3VtXG4gICAgICB9XG4gICAgICBcbiAgICAgIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIGFkZFxufVxuIiwibGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL3BoYXNvci5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHBoYXNvcj1yZXF1aXJlKCAnLi9waGFzb3IuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjeWNsZScsXG4gIHRhYmxlOm51bGwsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIHJldHVybiBwZWVrKCdzaW5UYWJsZScsIHBoYXNvciggaW5wdXRzWzBdICksIDEsIDEgKS5nZW4oKVxuICB9LFxuXG4gIGluaXRUYWJsZSgpIHtcbiAgICB0aGlzLnRhYmxlID0gZGF0YSggJ3NpblRhYmxlJywgMTAyNCApXG5cbiAgICBmb3IoIGxldCBpID0gMCwgbCA9IHRoaXMudGFibGUubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xuICAgICAgdGhpcy50YWJsZVsgaSBdID0gTWF0aC5zaW4oICggaSAvIGwgKSAqICggTWF0aC5QSSAqIDIgKSApXG4gICAgfVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT0xLCByZXNldD0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBpZiggcHJvdG8udGFibGUgPT09IG51bGwgKSBwcm90by5pbml0VGFibGUoKSBcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGZyZXF1ZW5jeSxcbiAgICByZXNldCxcbiAgICB0YWJsZTogICAgICBwcm90by50YWJsZSxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBmcmVxdWVuY3ksIHJlc2V0IF0sXG4gICAgcHJvcGVydGllczogWyAnZnJlcXVlbmN5JywncmVzZXQnIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGF0YScsXG5cbiAgZ2VuKCkge1xuICAgIHJldHVybiAnZ2VuLmRhdGEuJyArIHRoaXMubmFtZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggdXNlcm5hbWUsIGRpbT01MTIsIGNoYW5uZWxzPTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gbmV3IEZsb2F0MzJBcnJheSggZGltIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHVzZXJuYW1lLFxuICAgIGRpbSxcbiAgICBjaGFubmVscyxcbiAgICBnZW46ICAgICAgICBwcm90by5nZW5cbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IHVzZXJuYW1lXG5cbiAgZ2VuLmRhdGFbIHVnZW4ubmFtZSBdID0gdWdlblxuICBcbiAgcmV0dXJuIHVnZW5cbn1cbiIsImxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGVsdGEnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBuMSAgICAgPSBoaXN0b3J5KClcbiAgICBcbiAgICBuMS5yZWNvcmQoIGlucHV0c1swXSApLmdlbigpXG5cbiAgICByZXR1cm4gc3ViKCBpbnB1dHNbMF0sIG4xICkuZ2VuKClcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuLyogZ2VuLmpzXG4gKlxuICogbG93LWxldmVsIGNvZGUgZ2VuZXJhdGlvbiBmb3IgdW5pdCBnZW5lcmF0b3JzXG4gKlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFjY3VtOjAsXG4gIGdldFVJRCgpIHsgcmV0dXJuIHRoaXMuYWNjdW0rKyB9LFxuICBkZWJ1ZzpmYWxzZSxcbiAgXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICogWFhYIFNob3VsZCBwcm9iYWJseSBiZSByZW5hbWVkIGNhbGxiYWNrUHJvcGVydGllcyBvciBzb21ldGhpbmcgc2ltaWxhci4uLiBjbG9zdXJlcyBhcmUgbm8gbG9uZ2VyIHVzZWQuXG4gICAqL1xuXG4gIGNsb3N1cmVzOm5ldyBTZXQoKSxcblxuICBwYXJhbWV0ZXJzOltdLFxuICBlbmRCbG9jazogW10sXG5cbiAgbWVtbzoge30sXG5cbiAgZGF0YToge30sXG4gIFxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydCggb2JqICkge30sXG5cbiAgYWRkVG9FbmRCbG9jayggdiApIHtcbiAgICB0aGlzLmVuZEJsb2NrLnB1c2goICcgICcgKyB2IClcbiAgfSxcbiAgXG4gIC8qIGNyZWF0ZUNhbGxiYWNrXG4gICAqXG4gICAqIHBhcmFtIHVnZW4gLSBIZWFkIG9mIGdyYXBoIHRvIGJlIGNvZGVnZW4nZFxuICAgKlxuICAgKiBHZW5lcmF0ZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVnZW4gZ3JhcGguXG4gICAqIFRoZSBnZW4uY2xvc3VyZXMgcHJvcGVydHkgc3RvcmVzIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmVcbiAgICogcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZmluYWwgZnVuY3Rpb247IHRoZXNlIGFyZSBwcmVmaXhlZFxuICAgKiBiZWZvcmUgYW55IGRlZmluZWQgcGFyYW1zIHRoZSBncmFwaCBleHBvc2VzLiBGb3IgZXhhbXBsZSwgZ2l2ZW46XG4gICAqXG4gICAqIGdlbi5jcmVhdGVDYWxsYmFjayggYWJzKCBwYXJhbSgpICkgKVxuICAgKlxuICAgKiAuLi4gdGhlIGdlbmVyYXRlZCBmdW5jdGlvbiB3aWxsIGhhdmUgYSBzaWduYXR1cmUgb2YgKCBhYnMsIHAwICkuXG4gICAqL1xuICBcbiAgY3JlYXRlQ2FsbGJhY2soIHVnZW4gKSB7XG4gICAgbGV0IGNhbGxiYWNrLCBncmFwaE91dHB1dFxuXG4gICAgdGhpcy5tZW1vID0ge31cbiAgICB0aGlzLmVuZEJsb2NrLmxlbmd0aCA9IDBcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKClcbiAgICB0aGlzLnBhcmFtZXRlcnMubGVuZ3RoID0gMFxuXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSBcIiAgJ3VzZSBzdHJpY3QnO1xcblxcblwiXG5cbiAgICAvLyBjYWxsIC5nZW4oKSBvbiB0aGUgaGVhZCBvZiB0aGUgZ3JhcGggd2UgYXJlIGdlbmVyYXRpbmcgdGhlIGNhbGxiYWNrIGZvclxuICAgIC8vY29uc29sZS5sb2coICdIRUFEJywgdWdlbiApXG4gICAgZ3JhcGhPdXRwdXQgPSB1Z2VuLmdlbigpXG5cbiAgICAvLyBpZiAuZ2VuKCkgcmV0dXJucyBhcnJheSwgYWRkIHVnZW4gY2FsbGJhY2sgKGdyYXBoT3V0cHV0WzFdKSB0byBvdXIgb3V0cHV0IGZ1bmN0aW9ucyBib2R5XG4gICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgLy8ganVzdCByZXR1cm4gdGhhdCBudW1iZXIgKGdyYXBoT3V0cHV0WzBdKS5cbiAgICB0aGlzLmZ1bmN0aW9uQm9keSArPSBBcnJheS5pc0FycmF5KCBncmFwaE91dHB1dCApID8gZ3JhcGhPdXRwdXRbMV0gKyAnXFxuJyArIGdyYXBoT3V0cHV0WzBdIDogZ3JhcGhPdXRwdXRcblxuICAgIC8vIHNwbGl0IGJvZHkgdG8gaW5qZWN0IHJldHVybiBrZXl3b3JkIG9uIGxhc3QgbGluZVxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpXG4gICAgXG4gICAgLy8gZ2V0IGluZGV4IG9mIGxhc3QgbGluZVxuICAgIGxldCBsYXN0aWR4ID0gdGhpcy5mdW5jdGlvbkJvZHkubGVuZ3RoIC0gMVxuXG4gICAgLy8gaW5zZXJ0IHJldHVybiBrZXl3b3JkXG4gICAgdGhpcy5mdW5jdGlvbkJvZHlbIGxhc3RpZHggXSA9ICcgIGxldCBvdXQgPSAnICsgdGhpcy5mdW5jdGlvbkJvZHlbIGxhc3RpZHggXSArICdcXG4nXG4gICAgXG4gICAgaWYoIHRoaXMuZW5kQmxvY2subGVuZ3RoICkgeyBcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuY29uY2F0KCB0aGlzLmVuZEJsb2NrICkgXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCAnXFxuICByZXR1cm4gb3V0JyApXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCAnICByZXR1cm4gb3V0JyApXG4gICAgfVxuICAgIC8vIHJlYXNzZW1ibGUgZnVuY3Rpb24gYm9keVxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuam9pbignXFxuJylcblxuICAgIC8vIHdlIGNhbiBvbmx5IGR5bmFtaWNhbGx5IGNyZWF0ZSBhIG5hbWVkIGZ1bmN0aW9uIGJ5IGR5bmFtaWNhbGx5IGNyZWF0aW5nIGFub3RoZXIgZnVuY3Rpb25cbiAgICAvLyB0byBjb25zdHJ1Y3QgdGhlIG5hbWVkIGZ1bmN0aW9uISBzaGVlc2guLi5cbiAgICBsZXQgYnVpbGRTdHJpbmcgPSBgcmV0dXJuIGZ1bmN0aW9uIGdlbiggJHt0aGlzLnBhcmFtZXRlcnMuam9pbignLCcpfSApeyBcXG4ke3RoaXMuZnVuY3Rpb25Cb2R5fVxcbn1gXG4gICAgXG4gICAgaWYoIHRoaXMuZGVidWcgKSBjb25zb2xlLmxvZyggYnVpbGRTdHJpbmcgKSBcblxuICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKCBidWlsZFN0cmluZyApKClcbiAgICBcbiAgICAvLyBhc3NpZ24gcHJvcGVydGllcyB0byBuYW1lZCBmdW5jdGlvblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5jbG9zdXJlcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB2YWx1ZSA9IGRpY3RbIG5hbWUgXVxuXG4gICAgICBjYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG4gICAgXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YVxuXG4gICAgcmV0dXJuIGNhbGxiYWNrXG4gIH0sXG4gIFxuICAvKiBnZXRJbnB1dHNcbiAgICpcbiAgICogR2l2ZW4gYW4gYXJndW1lbnQgdWdlbiwgZXh0cmFjdCBpdHMgaW5wdXRzLiBJZiB0aGV5IGFyZSBudW1iZXJzLCByZXR1cm4gdGhlIG51bWVicnMuIElmXG4gICAqIHRoZXkgYXJlIHVnZW5zLCBjYWxsIC5nZW4oKSBvbiB0aGUgdWdlbiwgbWVtb2l6ZSB0aGUgcmVzdWx0IGFuZCByZXR1cm4gdGhlIHJlc3VsdC4gSWYgdGhlXG4gICAqIHVnZW4gaGFzIHByZXZpb3VzbHkgYmVlbiBtZW1vaXplZCByZXR1cm4gdGhlIG1lbW9pemVkIHZhbHVlLlxuICAgKlxuICAgKi9cbiAgZ2V0SW5wdXRzKCB1Z2VuICkge1xuICAgIGxldCBpbnB1dHMgPSB1Z2VuLmlucHV0cy5tYXAoIGlucHV0ID0+IHtcbiAgICAgIGxldCBpc09iamVjdCA9IHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcsXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXRcblxuICAgICAgaWYoIGlzT2JqZWN0ICkgeyAvLyBpZiBpbnB1dCBpcyBhIHVnZW4uLi4gXG4gICAgICAgIGlmKCB0aGlzLm1lbW9bIGlucHV0Lm5hbWUgXSApIHsgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IHRoaXMubWVtb1sgaW5wdXQubmFtZSBdXG4gICAgICAgIH1lbHNleyAvLyBpZiBub3QgbWVtb2l6ZWQgZ2VuZXJhdGUgY29kZVxuICAgICAgICAgIGxldCBjb2RlID0gaW5wdXQuZ2VuKClcbiAgICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggY29kZSApICkge1xuICAgICAgICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gY29kZVsxXVxuICAgICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlWzBdXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1lbHNleyAvLyBpdCBpbnB1dCBpcyBhIG51bWJlclxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm9jZXNzZWRJbnB1dFxuICAgIH0pXG5cbiAgICByZXR1cm4gaW5wdXRzXG4gIH1cbn1cbiIsImxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICgpID0+IHtcbiAgbGV0IHVnZW4gPSB7XG4gICAgaW5wdXRzOiBbIDAgXSxcblxuICAgIHJlY29yZCggdiApIHtcbiAgICAgIGxldCBvYmogPSB7XG4gICAgICAgIGdlbigpIHtcbiAgICAgICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdWdlbiApXG5cbiAgICAgICAgICBnZW4uYWRkVG9FbmRCbG9jayggJ2dlbi5kYXRhLicgKyB1Z2VuLm5hbWUgKyAnID0gJyArIGlucHV0c1sgMCBdIClcbiAgICAgICAgICBcbiAgICAgICAgICAvLyByZXR1cm4gdWdlbiB0aGF0IGlzIGJlaW5nIHJlY29yZGVkIGluc3RlYWQgb2Ygc3NkLlxuICAgICAgICAgIC8vIHRoaXMgZWZmZWN0aXZlbHkgbWFrZXMgYSBjYWxsIHRvIHNzZC5yZWNvcmQoKSB0cmFuc3BhcmVudCB0byB0aGUgZ3JhcGguXG4gICAgICAgICAgLy8gcmVjb3JkaW5nIGlzIHRyaWdnZXJlZCBieSBwcmlvciBjYWxsIHRvIGdlbi5hZGRUb0VuZEJsb2NrLlxuICAgICAgICAgIHJldHVybiBpbnB1dHNbIDAgXVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5wdXRzWyAwIF0gPSB2XG5cbiAgICAgIHJldHVybiBvYmpcbiAgICB9LFxuXG4gICAgZ2VuKCkgeyByZXR1cm4gJ2dlbi5kYXRhLicgKyB1Z2VuLm5hbWUgfSxcblxuICAgIHVpZDogZ2VuLmdldFVJRCgpLFxuICB9XG4gIFxuICB1Z2VuLm5hbWUgPSAnaGlzdG9yeScgKyB1Z2VuLnVpZFxuXG4gIGdlbi5kYXRhWyB1Z2VuLm5hbWUgXSA9IDBcbiAgXG4gIHJldHVybiB1Z2VuXG59XG4iLCJsZXQgbGlicmFyeSA9IHtcbiAgZXhwb3J0KCBkZXN0aW5hdGlvbiApIHtcbiAgICBPYmplY3QuYXNzaWduKCBkZXN0aW5hdGlvbiwgbGlicmFyeSApXG4gICAgZGVzdGluYXRpb24uc3NkID0gbGlicmFyeS5oaXN0b3J5IC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICB9LFxuXG4gIGdlbjogICAgcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICBcbiAgYWJzOiAgICByZXF1aXJlKCcuL2Ficy5qcycpLFxuICByb3VuZDogIHJlcXVpcmUoJy4vcm91bmQuanMnKSxcbiAgcGFyYW06ICByZXF1aXJlKCcuL3BhcmFtLmpzJyksXG4gIGFkZDogICAgcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgc3ViOiAgICByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICBtdWw6ICAgIHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gIGFjY3VtOiAgcmVxdWlyZSgnLi9hY2N1bS5qcycpLFxuICBzaW46ICAgIHJlcXVpcmUoJy4vc2luLmpzJyksXG4gIHBoYXNvcjogcmVxdWlyZSgnLi9waGFzb3IuanMnKSxcbiAgZGF0YTogICByZXF1aXJlKCcuL2RhdGEuanMnKSxcbiAgcGVlazogICByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgY3ljbGU6ICByZXF1aXJlKCcuL2N5Y2xlLmpzJyksXG4gIGhpc3Rvcnk6cmVxdWlyZSgnLi9oaXN0b3J5LmpzJyksXG4gIGRlbHRhOiAgcmVxdWlyZSgnLi9kZWx0YS5qcycpLFxufVxuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5XG5cbm1vZHVsZS5leHBvcnRzID0gbGlicmFyeVxuIiwibGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIHgseSApID0+IHtcbiAgbGV0IG11bCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgeCx5IF0sXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dFxuXG4gICAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgICAgb3V0ID0gIGAoJHtpbnB1dHNbMF19ICogJHtpbnB1dHNbMV19KWBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgPSBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSAqIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG11bFxufVxuIiwibGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncCcsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5wYXJhbWV0ZXJzLnB1c2goIHRoaXMubmFtZSApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICBsZXQgcGFyYW0gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcGFyYW0uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBwYXJhbS5uYW1lID0gYCR7cGFyYW0uYmFzZW5hbWV9JHtwYXJhbS5pZH1gXG5cbiAgcmV0dXJuIHBhcmFtXG59XG4iLCJsZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsICA9IHJlcXVpcmUoJy4vbXVsLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGVlaycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCwgZnVuY3Rpb25Cb2R5XG5cbmZ1bmN0aW9uQm9keSA9IGAgIGxldCAke3RoaXMubmFtZX1fZGF0YSAgPSBnZW4uZGF0YS4ke3RoaXMuZGF0YU5hbWV9LFxuICAgICAgJHt0aGlzLm5hbWV9X3BoYXNlID0gJHt0aGlzLm1vZGUgPT09IDAgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogZ2VuLmRhdGEuJyArIHRoaXMuZGF0YU5hbWUgKyAnLmxlbmd0aCd9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9pbmRleCA9ICR7dGhpcy5uYW1lfV9waGFzZSB8IDAsXG4gICAgICAke3RoaXMubmFtZX1fZnJhYyAgPSAke3RoaXMubmFtZX1fcGhhc2UgLSAke3RoaXMubmFtZX1faW5kZXgsXG4gICAgICAke3RoaXMubmFtZX1fYmFzZSAgPSAke3RoaXMubmFtZX1fZGF0YVsgJHt0aGlzLm5hbWV9X2luZGV4IF0sXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCAke3RoaXMubmFtZX1fZGF0YVsgKCR7dGhpcy5uYW1lfV9pbmRleCsxKSAmICgke3RoaXMubmFtZX1fZGF0YS5sZW5ndGggLSAxKSBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKSBcblxuYFxuICAgIHJldHVybiBbIHRoaXMubmFtZSsnX291dCcsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBkYXRhTmFtZSwgaW5kZXgsIGNoYW5uZWxzPTEsIG1vZGU9MCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApIFxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgZGF0YU5hbWUsXG4gICAgY2hhbm5lbHMsXG4gICAgbW9kZSxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbmRleCBdLFxuICAgIHByb3BlcnRpZXM6IG51bGwsXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuIiwibGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGhhc29yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgcmV0dXJuIGFjY3VtKCBtdWwoIGlucHV0c1swXSwgMS80NDEwMCApLCBpbnB1dHNbMV0gKS5nZW4oKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT0xLCByZXNldD0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGZyZXF1ZW5jeSxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgZnJlcXVlbmN5LCByZXNldCBdLFxuICAgIHByb3BlcnRpZXM6IFsgJ2ZyZXF1ZW5jeScsJ3Jlc2V0JyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwibGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZToncm91bmQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5yb3VuZCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnJvdW5kKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnJvdW5kKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgcm91bmQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcm91bmQuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gcm91bmRcbn1cbiIsImxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBNYXRoLnNpbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpbi5pbnB1dHMgPSBbIHggXVxuICBzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgc2luLm5hbWUgPSBgJHtzaW4uYmFzZW5hbWV9e3Npbi5pZH1gXG5cbiAgcmV0dXJuIHNpblxufVxuIiwibGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgc3ViID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgc3ViQXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAtIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgICAgfSlcblxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gc3ViXG59XG4iXX0=
