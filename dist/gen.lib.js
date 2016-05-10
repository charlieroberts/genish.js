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

},{"./gen.js":21}],2:[function(require,module,exports){
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

    _gen.memo[this.name] = this.name + '_value';

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _reset) {
    var diff = this.max - this.min,
        out = '',
        wrap = void 0;

    /* three different methods of wrapping, third is most expensive:
     *
     * 1: range {0,1}: y = x - (x | 0)
     * 2: log2(this.max) == integer: y = x & (this.max - 1)
     * 3: all others: if( x >= this.max ) y = this.max -x
     *
     */

    // must check for reset before storing value for output
    if (!(typeof this.inputs[1] === 'number' && this.inputs[1] < 1)) {
      out += '  if( ' + _reset + '>=1 ) ' + _name + '.value = ' + this.min + '\n';
    }

    out += '  let ' + this.name + '_value = ' + _name + '.value;\n  ' + _name + '.value += ' + _incr + '\n'; // store output value before accumulating 

    if (this.min === 0 && this.max === 1) {
      wrap = '  ' + _name + '.value = ' + _name + '.value - (' + _name + '.value | 0)\n\n';
    } else if (this.min === 0 && (Math.log2(this.max) | 0) === Math.log2(this.max)) {
      wrap = '  ' + _name + '.value = ' + _name + '.value & (' + this.max + ' - 1)\n\n';
    } else {
      wrap = '  if( ' + _name + '.value >= ' + this.max + ' ) ' + _name + '.value -= ' + diff + '\n\n';
    }

    out = out + wrap;

    return out;
  }
};

module.exports = function (incr) {
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var properties = arguments[2];

  var ugen = Object.create(proto),
      defaults = { min: 0, max: 1 };

  if (properties !== undefined) Object.assign(defaults, properties);

  if (defaults.initialValue === undefined) defaults.initialValue = defaults.min;

  Object.assign(ugen, {
    min: defaults.min,
    max: defaults.max,
    value: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, reset]
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":21}],3:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'acos',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'acos': Math.acos });

      out = 'gen.acos( ' + inputs[0] + ' )';
    } else {
      out = Math.acos(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var acos = Object.create(proto);

  acos.inputs = [x];
  acos.id = _gen.getUID();
  acos.name = acos.basename + '{acos.id}';

  return acos;
};

},{"./gen.js":21}],4:[function(require,module,exports){
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
          adderAtEnd = false,
          alreadyFullSummed = true;

      inputs.forEach(function (v, i) {
        if (isNaN(v)) {
          out += v;
          if (i < inputs.length - 1) {
            adderAtEnd = true;
            out += ' + ';
          }
          alreadyFullSummed = false;
        } else {
          sum += parseFloat(v);
          numCount++;
        }
      });

      if (alreadyFullSummed) out = '';

      if (numCount > 0) {
        out += adderAtEnd || alreadyFullSummed ? sum : ' + ' + sum;
      }

      if (!alreadyFullSummed) out += ')';

      return out;
    }
  };

  return add;
};

},{"./gen.js":21}],5:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'asin',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'asin': Math.asin });

      out = 'gen.asin( ' + inputs[0] + ' )';
    } else {
      out = Math.asin(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var asin = Object.create(proto);

  asin.inputs = [x];
  asin.id = _gen.getUID();
  asin.name = asin.basename + '{asin.id}';

  return asin;
};

},{"./gen.js":21}],6:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'atan',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'atan': Math.atan });

      out = 'gen.atan( ' + inputs[0] + ' )';
    } else {
      out = Math.atan(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var atan = Object.create(proto);

  atan.inputs = [x];
  atan.id = _gen.getUID();
  atan.name = atan.basename + '{atan.id}';

  return atan;
};

},{"./gen.js":21}],7:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'bool',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = inputs[0] + ' === 0 ? 0 : 1';

    //gen.memo[ this.name ] = `gen.data.${this.name}`

    //return [ `gen.data.${this.name}`, ' ' +out ]
    return out;
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

},{"./gen.js":21}],8:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'ceil',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.ceil));

      out = 'gen.ceil( ' + inputs[0] + ' )';
    } else {
      out = Math.ceil(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var ceil = Object.create(proto);

  ceil.inputs = [x];

  return ceil;
};

},{"./gen.js":21}],9:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    floor = require('./floor.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

var proto = {
  basename: 'clip',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        out = void 0;

    out = ' let ' + this.name + ' = ' + inputs[0] + '\n  if( ' + this.name + ' > ' + inputs[2] + ' ) ' + this.name + ' = ' + inputs[2] + '\n  else if( ' + this.name + ' < ' + inputs[1] + ' ) ' + this.name + ' = ' + inputs[1] + '\n';
    out = ' ' + out;

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1) {
  var min = arguments.length <= 1 || arguments[1] === undefined ? -1 : arguments[1];
  var max = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1, min, max]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./floor.js":18,"./gen.js":21,"./memo.js":30,"./sub.js":48}],10:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'cos',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'cos': Math.cos });

      out = 'gen.cos( ' + inputs[0] + ' )';
    } else {
      out = Math.cos(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var cos = Object.create(proto);

  cos.inputs = [x];
  cos.id = _gen.getUID();
  cos.name = cos.basename + '{cos.id}';

  return cos;
};

},{"./gen.js":21}],11:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'counter',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = this.callback(genName, inputs[0], inputs[1], inputs[2], inputs[3]);

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = this.name + '_value';

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _min, _max, _reset) {
    var diff = this.max - this.min,
        out = '',
        wrap = '';

    /* three different methods of wrapping, third is most expensive:
     *
     * 1: range {0,1}: y = x - (x | 0)
     * 2: log2(this.max) == integer: y = x & (this.max - 1)
     * 3: all others: if( x >= this.max ) y = this.max -x
     *
     */

    // must check for reset before storing value for output
    if (!(typeof this.inputs[3] === 'number' && this.inputs[3] < 1)) {
      out += '  if( ' + _reset + '>=1 ) ' + _name + '.value = ' + _min + '\n';
    }

    out += '  let ' + this.name + '_value = ' + _name + '.value;\n  ' + _name + '.value += ' + _incr + '\n'; // store output value before accumulating 

    if (this.min === 0 && this.max === 1) {
      wrap = '  ' + _name + '.value = ' + _name + '.value - (' + _name + '.value | 0)\n\n';
    } else if (this.min === 0 && (Math.log2(this.max) | 0) === Math.log2(this.max)) {
      wrap = '  ' + _name + '.value = ' + _name + '.value & (' + this.max + ' - 1)\n\n';
    } else if (typeof this.max === 'number' && typeof this.min === 'number') {
      wrap = '  if( ' + _name + '.value >= ' + this.max + ' ) ' + _name + '.value -= ' + diff + '\n\n';
    } else if (this.max !== Infinity) {
      wrap = '  if( ' + _name + '.value >= ' + _max + ' ) ' + _name + '.value -= ' + _max + ' - ' + _min + '\n  else if( ' + _name + '.value < ' + _min + ' ) ' + _name + '.value += ' + _max + ' - ' + _min + '\n\n';
    }

    out = out + wrap;

    return out;
  }
};

module.exports = function (incr) {
  var min = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var max = arguments.length <= 2 || arguments[2] === undefined ? Infinity : arguments[2];
  var reset = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
  var properties = arguments[4];

  var ugen = Object.create(proto),
      defaults = { initialValue: 0 };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    min: min,
    max: max,
    value: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, min, max, reset]
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;
  return ugen;
};

},{"./gen.js":21}],12:[function(require,module,exports){
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
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = peek(proto.table, phasor(inputs[0])).gen();

    _gen.memo[this.name] = out[0];

    return out;
  },
  initTable: function initTable() {
    this.table = data(1024);

    for (var i = 0, l = this.table.buffer.length; i < l; i++) {
      this.table.buffer[i] = Math.sin(i / l * (Math.PI * 2));
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
    inputs: [frequency, reset]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./data.js":13,"./gen.js":21,"./mul.js":35,"./peek.js":39,"./phasor.js":40}],13:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    utilities = require('./utilities.js');

var proto = {
  basename: 'data',

  gen: function gen() {
    _gen.data[this.name] = this;
    return 'gen.data.' + this.name + '.buffer';
  }
};

module.exports = function (x) {
  var y = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

  var ugen = void 0,
      buffer = void 0,
      shouldLoad = false;

  if (typeof x === 'number') {
    if (y !== 1) {
      buffer = [];
      for (var i = 0; i < y; i++) {
        buffer[i] = new Float32Array(x);
      }
    } else {
      buffer = new Float32Array(x);
    }
  } else if (Array.isArray(x)) {
    //! (x instanceof Float32Array ) ) {
    var size = x.length;
    buffer = new Float32Array(size);
    for (var _i = 0; _i < x.length; _i++) {
      buffer[_i] = x[_i];
    }
  } else if (typeof x === 'string') {
    buffer = [0];
    shouldLoad = true;
  } else {
    buffer = x;
  }

  ugen = {
    buffer: buffer,
    name: proto.basename + _gen.getUID(),
    dim: y === 1 ? buffer.length : x,
    channels: 1,
    gen: proto.gen,
    onload: null,
    then: function then(fnc) {
      ugen.onload = fnc;
      return ugen;
    }
  };

  //gen.data[ ugen.name ] = ugen

  if (shouldLoad) {
    var promise = utilities.loadSample(x, ugen);
    promise.then(function () {
      ugen.onload();
    });
  }

  return ugen;
};

},{"./gen.js":21,"./utilities.js":53}],14:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js');

var proto = {
  basename: 'dcblock',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        x1 = history(),
        y1 = history(),
        filter = void 0;

    //History x1, y1; y = in1 - x1 + y1*0.9997; x1 = in1; y1 = y; out1 = y;
    filter = memo(add(sub(inputs[0], x1.out), mul(y1.out, .9997)));
    x1.in(inputs[0]).gen();
    y1.in(filter).gen();

    return filter.name;
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

},{"./add.js":4,"./gen.js":21,"./history.js":24,"./memo.js":30,"./mul.js":35,"./sub.js":48}],15:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    data = require('./data.js'),
    poke = require('./poke.js'),
    wrap = require('./wrap.js'),
    accum = require('./accum.js');

var proto = {
  basename: 'delay',

  gen: function gen() {
    var code = void 0,
        out = void 0,
        acc = void 0,
        writeIdx = void 0,
        readIdx = void 0;

    writeIdx = accum(1, 0, { max: this.size }); // initialValue:Math.floor(this.time) })
    readIdx = wrap(sub(writeIdx, this.inputs[1]), 0, this.size);

    poke(this.buffer, this.inputs[0], writeIdx).gen();

    out = peek(this.buffer, readIdx, { mode: 'samples', interp: this.interp }).gen();

    _gen.memo[this.name] = out;

    return out;
  }
};

module.exports = function (in1) {
  var time = arguments.length <= 1 || arguments[1] === undefined ? 256 : arguments[1];
  var properties = arguments[2];

  var ugen = Object.create(proto),
      defaults = { size: 512, feedback: 0, interp: 'linear' };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    time: time,
    buffer: data(defaults.size),
    uid: _gen.getUID(),
    inputs: [in1, time]
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./accum.js":2,"./data.js":13,"./gen.js":21,"./poke.js":41,"./wrap.js":54}],16:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js');

var proto = {
  basename: 'delta',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        n1 = history();

    n1.in(inputs[0]).gen();

    return sub(inputs[0], n1.out).gen();
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

},{"./gen.js":21,"./history.js":24,"./sub.js":48}],17:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var div = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          diff = 0,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          divAtEnd = false;

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber / v;
          out += lastNumber;
        } else {
          out += lastNumber + ' / ' + v;
        }

        if (!isFinalIdx) out += ' / ';
      });

      out += ')';

      return out;
    }
  };

  return div;
};

},{"./gen.js":21}],18:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'floor',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      //gen.closures.add({ [ this.name ]: Math.floor })

      out = '( ' + inputs[0] + ' | 0 )';
    } else {
      out = inputs[0] | 0;
    }

    return out;
  }
};

module.exports = function (x) {
  var floor = Object.create(proto);

  floor.inputs = [x];

  return floor;
};

},{"./gen.js":21}],19:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'fold',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        out = void 0;

    out = this.createCallback(inputs[0], this.min, this.max);

    return [this.name + '_value', out];
  },
  createCallback: function createCallback(v, lo, hi) {
    var out = ' let ' + this.name + '_value = ' + v + ',\n      ' + this.name + '_range = ' + hi + ' - ' + lo + ',\n      ' + this.name + '_numWraps = 0\n\n  if(' + this.name + '_value >= ' + hi + '){\n    ' + this.name + '_value -= ' + this.name + '_range\n    if(' + this.name + '_value >= ' + hi + '){\n      ' + this.name + '_numWraps = ((' + this.name + '_value - ' + lo + ') / ' + this.name + '_range) | 0\n      ' + this.name + '_value -= ' + this.name + '_range * ' + this.name + '_numWraps\n    }\n    ' + this.name + '_numWraps++\n  } else if(' + this.name + '_value < ' + lo + '){\n    ' + this.name + '_value += ' + this.name + '_range\n    if(' + this.name + '_value < ' + lo + '){\n      ' + this.name + '_numWraps = ((' + this.name + '_value - ' + lo + ') / ' + this.name + '_range- 1) | 0\n      ' + this.name + '_value -= ' + this.name + '_range * ' + this.name + '_numWraps\n    }\n    ' + this.name + '_numWraps--\n  }\n  if(' + this.name + '_numWraps & 1) ' + this.name + '_value = ' + hi + ' + ' + lo + ' - ' + this.name + '_value\n';
    return ' ' + out;
  }
};

module.exports = function (in1) {
  var min = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var max = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":21}],20:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _gen = require('./gen.js');

var proto = {
  basename: 'gate',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0,
        data = 'gen.data.' + this.name;

    out = ' let ' + this.name + '_index = ' + inputs[1] + '\n  if( ' + this.name + '_index != ' + data + '.lastInput ) {\n    ' + data + '.outputs[ ' + data + '.lastInput ] = 0\n    ' + data + '.lastInput = ' + inputs[1] + '\n  }\n  ' + data + '.outputs[ ' + inputs[1] + ' ] = ' + inputs[0] + ' \n';

    _gen.memo[this.name] = 'gen.data.' + this.name;

    return ['gen.data.' + this.name, ' ' + out];
  },
  childgen: function childgen() {
    if (_gen.memo[this.parent.name] === undefined) {
      _gen.getInputs(this);
    }
    return 'gen.data.' + this.parent.name + '.outputs[ ' + this.index + ' ]';
  }
};

module.exports = function (control, in1, properties) {
  var ugen = Object.create(proto),
      defaults = { count: 2 };

  if ((typeof properties === 'undefined' ? 'undefined' : _typeof(properties)) !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    outputs: [],
    uid: _gen.getUID(),
    inputs: [in1, control]
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  _gen.data[ugen.name] = { outputs: [], lastInput: 0 };

  for (var i = 0; i < ugen.count; i++) {
    ugen.outputs.push({
      index: i,
      gen: proto.childgen,
      parent: ugen,
      inputs: [ugen]
    });
    _gen.data[ugen.name].outputs[i] = 0;
  }

  return ugen;
};

},{"./gen.js":21}],21:[function(require,module,exports){
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
  samplerate: 44100, // change on audiocontext creation

  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),

  parameters: [],
  endBlock: new Set(),
  histories: new Map(),

  memo: {},

  data: {},

  /* export
   *
   * place gen functions into another object for easier reference
   */

  export: function _export(obj) {},
  addToEndBlock: function addToEndBlock(v) {
    this.endBlock.add('  ' + v);
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
    var debug = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    var isStereo = Array.isArray(ugen),
        callback = void 0,
        channel1 = void 0,
        channel2 = void 0;

    //this.data = {}
    this.memo = {};
    this.endBlock.clear();
    this.closures.clear();
    this.histories.clear();
    this.parameters.length = 0;

    this.functionBody = "  'use strict';\n\n";

    // call .gen() on the head of the graph we are generating the callback for
    //console.log( 'HEAD', ugen )
    for (var i = 0; i < 1 + isStereo; i++) {
      var channel = isStereo ? ugen[i].gen() : ugen.gen(),
          body = '';

      // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
      // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
      // just return that number (graphOutput[0]).
      body += Array.isArray(channel) ? channel[1] + '\n' + channel[0] : channel;

      // split body to inject return keyword on last line
      body = body.split('\n');

      //if( debug ) console.log( 'functionBody length', body )

      // next line is to accommodate memo as graph head
      if (body[body.length - 1].trim().indexOf('let') > -1) {
        body.push('\n');
      }

      // get index of last line
      var lastidx = body.length - 1;

      // insert return keyword
      body[lastidx] = '  gen.out[' + i + ']  = ' + body[lastidx] + '\n';

      this.functionBody += body.join('\n');
    }

    var returnStatement = isStereo ? '  return gen.out' : '  return gen.out[0]';

    this.functionBody = this.functionBody.split('\n');

    if (this.endBlock.size) {
      this.functionBody = this.functionBody.concat(Array.from(this.endBlock));
      this.functionBody.push(returnStatement);
    } else {
      this.functionBody.push(returnStatement);
    }
    // reassemble function body
    this.functionBody = this.functionBody.join('\n');

    // we can only dynamically create a named function by dynamically creating another function
    // to construct the named function! sheesh...
    var buildString = 'return function gen( ' + this.parameters.join(',') + ' ){ \n' + this.functionBody + '\n}';

    if (this.debug || debug) console.log(buildString);

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
    callback.out = [];

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
            //console.log( 'after GEN' , this.functionBody )
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

},{}],22:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '( ' + inputs[0] + ' > ' + inputs[1] + ' ? 1 : 0  )';
    } else {
      out = inputs[0] > inputs[1] ? 1 : 0;
    }

    return out;
  }
};

module.exports = function (x, y) {
  var gt = Object.create(proto);

  gt.inputs = [x, y];

  return gt;
};

},{"./gen.js":21}],23:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gtp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '(' + inputs[0] + ' * ( ' + inputs[0] + ' > ' + inputs[1] + ' ) )';
    } else {
      out = inputs[0] * (inputs[0] > inputs[1]);
    }

    return out;
  }
};

module.exports = function (x, y) {
  var gtp = Object.create(proto);

  gtp.inputs = [x, y];

  return gtp;
};

},{"./gen.js":21}],24:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  var in1 = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

  var ugen = {
    inputs: [in1],

    in: function _in(v) {
      if (_gen.histories.has(v)) {
        var memoHistory = _gen.histories.get(v);
        ugen.name = memoHistory.name;
        return memoHistory;
      }

      var obj = {
        gen: function gen() {
          var inputs = _gen.getInputs(ugen);

          if (_gen.data[ugen.name] === undefined) {
            _gen.data[ugen.name] = in1;
          }

          _gen.addToEndBlock('gen.data.' + ugen.name + ' = ' + inputs[0]);

          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
          return inputs[0];
        },

        name: ugen.name
      };

      this.inputs[0] = v;

      _gen.histories.set(v, obj);

      return obj;
    },


    out: {
      gen: function gen() {
        if (_gen.data[ugen.name] === undefined) _gen.data[ugen.name] = parseFloat(in1);
        return 'gen.data.' + ugen.name;
      }
    },

    uid: _gen.getUID()
  };

  ugen.name = 'history' + ugen.uid;
  return ugen;
};

},{"./gen.js":21}],25:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'in',

  gen: function gen() {
    _gen.parameters.push(this.name);

    _gen.memo[this.name] = this.name;

    return this.name;
  }
};

module.exports = function () {
  var input = Object.create(proto);

  input.id = _gen.getUID();
  input.name = '' + input.basename + input.id;

  return input;
};

},{"./gen.js":21}],26:[function(require,module,exports){
'use strict';

var library = {
  export: function _export(destination) {
    destination.ssd = library.history; // history is window object property, so use ssd as alias
    destination.input = library.in; // in is a keyword in javascript
    destination.ternary = library.switch; // switch is a keyword in javascript

    delete library.history;
    delete library.in;
    delete library.switch;

    Object.assign(destination, library);
    destination.clip = library.clamp;
  },


  gen: require('./gen.js'),

  abs: require('./abs.js'),
  round: require('./round.js'),
  param: require('./param.js'),
  add: require('./add.js'),
  sub: require('./sub.js'),
  mul: require('./mul.js'),
  div: require('./div.js'),
  accum: require('./accum.js'),
  counter: require('./counter.js'),
  sin: require('./sin.js'),
  cos: require('./cos.js'),
  tan: require('./tan.js'),
  asin: require('./asin.js'),
  acos: require('./acos.js'),
  atan: require('./atan.js'),
  phasor: require('./phasor.js'),
  data: require('./data.js'),
  peek: require('./peek.js'),
  cycle: require('./cycle.js'),
  history: require('./history.js'),
  delta: require('./delta.js'),
  floor: require('./floor.js'),
  ceil: require('./ceil.js'),
  min: require('./min.js'),
  max: require('./max.js'),
  sign: require('./sign.js'),
  dcblock: require('./dcblock.js'),
  memo: require('./memo.js'),
  rate: require('./rate.js'),
  wrap: require('./wrap.js'),
  mix: require('./mix.js'),
  clamp: require('./clamp.js'),
  poke: require('./poke.js'),
  delay: require('./delay.js'),
  fold: require('./fold.js'),
  mod: require('./mod.js'),
  sah: require('./sah.js'),
  noise: require('./noise.js'),
  not: require('./not.js'),
  gt: require('./gt.js'),
  lt: require('./lt.js'),
  bool: require('./bool.js'),
  gate: require('./gate.js'),
  train: require('./train.js'),
  slide: require('./slide.js'),
  in: require('./in.js'),
  t60: require('./t60.js'),
  mtof: require('./mtof.js'),
  ltp: require('./ltp.js'),
  gtp: require('./gtp.js'),
  switch: require('./switch.js'),
  utilities: require('./utilities.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./add.js":4,"./asin.js":5,"./atan.js":6,"./bool.js":7,"./ceil.js":8,"./clamp.js":9,"./cos.js":10,"./counter.js":11,"./cycle.js":12,"./data.js":13,"./dcblock.js":14,"./delay.js":15,"./delta.js":16,"./div.js":17,"./floor.js":18,"./fold.js":19,"./gate.js":20,"./gen.js":21,"./gt.js":22,"./gtp.js":23,"./history.js":24,"./in.js":25,"./lt.js":27,"./ltp.js":28,"./max.js":29,"./memo.js":30,"./min.js":31,"./mix.js":32,"./mod.js":33,"./mtof.js":34,"./mul.js":35,"./noise.js":36,"./not.js":37,"./param.js":38,"./peek.js":39,"./phasor.js":40,"./poke.js":41,"./rate.js":42,"./round.js":43,"./sah.js":44,"./sign.js":45,"./sin.js":46,"./slide.js":47,"./sub.js":48,"./switch.js":49,"./t60.js":50,"./tan.js":51,"./train.js":52,"./utilities.js":53,"./wrap.js":54}],27:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '( ' + inputs[0] + ' < ' + inputs[1] + ' ? 1 : 0  )';
    } else {
      out = inputs[0] < inputs[1] ? 1 : 0;
    }

    return out;
  }
};

module.exports = function (x, y) {
  var lt = Object.create(proto);

  lt.inputs = [x, y];

  return lt;
};

},{"./gen.js":21}],28:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'ltp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '(' + inputs[0] + ' * ( ' + inputs[0] + ' < ' + inputs[1] + ' ) )';
    } else {
      out = inputs[0] * (inputs[0] < inputs[1]);
    }

    return out;
  }
};

module.exports = function (x, y) {
  var ltp = Object.create(proto);

  ltp.inputs = [x, y];

  return ltp;
};

},{"./gen.js":21}],29:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'max',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.max));

      out = 'gen.max( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      out = Math.max(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var max = Object.create(proto);

  max.inputs = [x, y];

  return max;
};

},{"./gen.js":21}],30:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'memo',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  let ' + this.name + ' = ' + inputs[0] + '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1) {
  var memo = Object.create(proto);

  memo.inputs = [in1];
  memo.id = _gen.getUID();
  memo.name = '' + memo.basename + memo.id;

  return memo;
};

},{"./gen.js":21}],31:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'min',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.min));

      out = 'gen.min( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      out = Math.min(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var min = Object.create(proto);

  min.inputs = [x, y];

  return min;
};

},{"./gen.js":21}],32:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js');

var proto = {
  basename: 'mix',

  gen: function gen() {
    _gen.memo[this.name] = add(mul(this.inputs[0], sub(1, this.inputs[2])), mul(this.inputs[1], this.inputs[2])).gen();

    return _gen.memo[this.name];
  }
};

module.exports = function (in1, in2) {
  var t = arguments.length <= 2 || arguments[2] === undefined ? .5 : arguments[2];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2, t]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./add.js":4,"./gen.js":21,"./mul.js":35,"./sub.js":48}],33:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var mod = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
          diff = 0,
          numCount = 0,
          lastNumber = inputs[0],
          lastNumberIsUgen = isNaN(lastNumber),
          modAtEnd = false;

      inputs.forEach(function (v, i) {
        if (i === 0) return;

        var isNumberUgen = isNaN(v),
            isFinalIdx = i === inputs.length - 1;

        if (!lastNumberIsUgen && !isNumberUgen) {
          lastNumber = lastNumber % v;
          out += lastNumber;
        } else {
          out += lastNumber + ' % ' + v;
        }

        if (!isFinalIdx) out += ' % ';
      });

      out += ')';

      return out;
    }
  };

  return mod;
};

},{"./gen.js":21}],34:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'mtof',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.exp));

      out = '( ' + this.tuning + ' * gen.exp( .057762265 * (' + inputs[0] + ' - 69) ) )';
    } else {
      out = this.tuning * Math.exp(.057762265 * (inputs[0] - 69));
    }

    return out;
  }
};

module.exports = function (x, props) {
  var ugen = Object.create(proto),
      defaults = { tuning: 440 };

  if (props !== undefined) Object.assign(props.defaults);

  Object.assign(ugen, defaults);
  ugen.inputs = [x];

  return ugen;
};

},{"./gen.js":21}],35:[function(require,module,exports){
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

},{"./gen.js":21}],36:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'noise',

  gen: function gen() {
    var out = void 0;

    _gen.closures.add({ 'noise': Math.random });

    out = 'gen.noise()';

    return out;
  }
};

module.exports = function (x) {
  var noise = Object.create(proto);

  return noise;
};

},{"./gen.js":21}],37:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'not',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0])) {
      out = '( ' + inputs[0] + ' === 0 ? 1 : 0 )';
    } else {
      out = !inputs[0] === 0 ? 1 : 0;
    }

    return out;
  }
};

module.exports = function (x) {
  var not = Object.create(proto);

  not.inputs = [x];

  return not;
};

},{"./gen.js":21}],38:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  gen: function gen() {
    _gen.closures.add(_defineProperty({}, this.name, this.value));
    return 'gen.' + this.name;
  }
};

module.exports = function (propName, value) {
  var ugen = Object.create(proto);

  ugen.name = propName;
  ugen.value = value;

  return ugen;
};

},{"./gen.js":21}],39:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'peek',

  gen: function gen() {
    var genName = 'gen.' + this.name,
        inputs = _gen.getInputs(this),
        out = void 0,
        functionBody = void 0,
        next = void 0,
        lengthIsLog2 = void 0;

    this.data.gen();
    lengthIsLog2 = (Math.log2(this.data.buffer.length) | 0) === Math.log2(this.data.buffer.length);

    //console.log( "LENGTH IS LOG2", lengthIsLog2, this.data.buffer.length )

    functionBody = '  let ' + this.name + '_data  = gen.data.' + this.dataName + '.buffer,\n      ' + this.name + '_phase = ' + (this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + this.data.buffer.length) + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n';

    next = lengthIsLog2 ? '( ' + this.name + '_index + 1 ) & (' + this.data.buffer.length + ' - 1)' : this.name + '_index + 1 >= ' + this.data.buffer.length + ' ? ' + this.name + '_index + 1 - ' + this.data.buffer.length + ' : ' + this.name + '_index + 1';

    if (this.interp === 'linear') {
      functionBody += '      ' + this.name + '_frac  = ' + this.name + '_phase - ' + this.name + '_index,\n      ' + this.name + '_base  = ' + this.name + '_data[ ' + this.name + '_index ],\n      ' + this.name + '_next  = ' + next + ',     \n      ' + this.name + '_out   = ' + this.name + '_base + ' + this.name + '_frac * ( ' + this.name + '_data[ ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
    } else {
      functionBody += '      ' + this.name + '_out = ' + this.name + '_data[ ' + this.name + '_index ]\n\n';
    }

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', functionBody];
  }
};

module.exports = function (data, index, properties) {
  var ugen = Object.create(proto),
      defaults = { channels: 1, mode: 'phase', interp: 'linear' };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    data: data,
    dataName: data.name,
    uid: _gen.getUID(),
    inputs: [index]
  }, defaults);

  ugen.name = ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":21}],40:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    accum = require('./accum.js'),
    mul = require('./mul.js');

var proto = {
  basename: 'phasor',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = accum(mul(inputs[0], 1 / 44100), inputs[1]).gen();

    _gen.memo[this.name] = out[0];

    return out;
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

},{"./accum.js":2,"./gen.js":21,"./mul.js":35}],41:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    mul = require('./mul.js'),
    wrap = require('./wrap.js');

var proto = {
  basename: 'poke',

  gen: function gen() {
    var dataName = 'gen.data.' + this.dataName + '.buffer',
        inputs = _gen.getInputs(this),
        idx = void 0,
        out = void 0,
        wrapped = void 0;

    //wrapped = wrap( this.inputs[1], 0, this.dataLength ).gen()
    //idx = wrapped[0]
    //gen.functionBody += wrapped[1]
    _gen.functionBody += '  ' + dataName + '[' + inputs[1] + '] = ' + inputs[0] + '\n\n';
  }
};
module.exports = function (data, value, index, properties) {
  var ugen = Object.create(proto),
      defaults = { channels: 1 };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    data: data,
    dataName: data.name,
    dataLength: data.buffer.length,
    uid: _gen.getUID(),
    inputs: [value, index]
  }, defaults);

  ugen.name = ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":21,"./mul.js":35,"./wrap.js":54}],42:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js'),
    delta = require('./delta.js'),
    wrap = require('./wrap.js');

var proto = {
  basename: 'rate',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        phase = history(),
        inMinus1 = history(),
        genName = 'gen.' + this.name,
        filter = void 0,
        sum = void 0,
        out = void 0;

    _gen.closures.add(_defineProperty({}, this.name, this));

    out = ' let ' + this.name + '_diff = ' + inputs[0] + ' - ' + genName + '.lastSample\n  if( ' + this.name + '_diff < -.5 ) ' + this.name + '_diff += 1\n  ' + genName + '.phase += ' + this.name + '_diff * ' + inputs[1] + '\n  if( ' + genName + '.phase > 1 ) ' + genName + '.phase -= 1\n  ' + genName + '.lastSample = ' + inputs[0] + '\n';
    out = ' ' + out;

    return [genName + '.phase', out];
  }
};

module.exports = function (in1, rate) {
  var ugen = Object.create(proto);

  Object.assign(ugen, {
    phase: 0,
    lastSample: 0,
    uid: _gen.getUID(),
    inputs: [in1, rate]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./add.js":4,"./delta.js":16,"./gen.js":21,"./history.js":24,"./memo.js":30,"./mul.js":35,"./sub.js":48,"./wrap.js":54}],43:[function(require,module,exports){
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

},{"./gen.js":21}],44:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sah',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    _gen.data[this.name] = 0;
    _gen.data[this.name + '_control'] = 0;

    out = ' let ' + this.name + ' = gen.data.' + this.name + '_control,\n      ' + this.name + '_trigger = ' + inputs[1] + ' > ' + inputs[2] + ' ? 1 : 0\n\n  if( ' + this.name + '_trigger !== ' + this.name + '  ) {\n    if( ' + this.name + '_trigger === 1 ) \n      gen.data.' + this.name + ' = ' + inputs[0] + '\n    gen.data.' + this.name + '_control = ' + this.name + '_trigger\n  }\n';

    _gen.memo[this.name] = 'gen.data.' + this.name;

    return ['gen.data.' + this.name, ' ' + out];
  }
};

module.exports = function (in1, control) {
  var threshold = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
  var properties = arguments[3];

  var ugen = Object.create(proto),
      defaults = { init: 0 };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    lastSample: 0,
    uid: _gen.getUID(),
    inputs: [in1, control, threshold]
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":21}],45:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'sign',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.sign));

      out = 'gen.sign( ' + inputs[0] + ' )';
    } else {
      out = Math.sign(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var sign = Object.create(proto);

  sign.inputs = [x];

  return sign;
};

},{"./gen.js":21}],46:[function(require,module,exports){
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

},{"./gen.js":21}],47:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js');

var proto = {
  basename: 'slide',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        y1 = history(),
        filter = void 0;

    filter = memo(add(y1.out, div(sub(inputs[0], y1.out), inputs[1])));
    y1.in(filter).gen();

    return filter.name;
  }
};

module.exports = function (in1) {
  var slideUp = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
  var slideDown = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, slideUp, slideDown]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./add.js":4,"./gen.js":21,"./history.js":24,"./memo.js":30,"./mul.js":35,"./sub.js":48}],48:[function(require,module,exports){
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
          needsParens = false,
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
          return;
        } else {
          needsParens = true;
          out += lastNumber + ' - ' + v;
        }

        if (!isFinalIdx) out += ' - ';
      });

      if (needsParens) {
        out += ')';
      } else {
        out = out.slice(1); // remove opening paren
      }

      return out;
    }
  };

  return sub;
};

},{"./gen.js":21}],49:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'switch',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = '  let ' + this.name + '_out = ' + inputs[0] + ' === 1 ? ' + inputs[1] + ' : ' + inputs[2];

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', out];
  }
};

module.exports = function (control) {
  var in1 = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
  var in2 = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [control, in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":21}],50:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 't60',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, 'exp', Math.exp));

      out = 'gen.exp( -6.907755278921 / ' + inputs[0] + ' )';
    } else {
      out = Math.exp(-6.907755278921 / inputs[0]);
    }

    return out;
  }
};

module.exports = function (x) {
  var t60 = Object.create(proto);

  t60.inputs = [x];

  return t60;
};

},{"./gen.js":21}],51:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'tan',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'tan': Math.tan });

      out = 'gen.tan( ' + inputs[0] + ' )';
    } else {
      out = Math.tan(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var tan = Object.create(proto);

  tan.inputs = [x];
  tan.id = _gen.getUID();
  tan.name = tan.basename + '{tan.id}';

  return tan;
};

},{"./gen.js":21}],52:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    lt = require('./lt.js'),
    phasor = require('./phasor.js');

var proto = {
  basename: 'train',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        graph = lt(accum(div(inputs[0], 44100)), inputs[1]);

    return graph.gen();
  }
};

module.exports = function () {
  var period = arguments.length <= 0 || arguments[0] === undefined ? 440 : arguments[0];
  var pulsewidth = arguments.length <= 1 || arguments[1] === undefined ? .5 : arguments[1];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [period, pulsewidth]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":21,"./lt.js":27,"./phasor.js":40}],53:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    data = require('./data.js');

var isStereo = false;

var utilities = {
  ctx: null,

  clear: function clear() {
    this.callback = function () {
      return 0;
    };
    console.log(this.clear.callbacks);
    this.clear.callbacks.forEach(function (v) {
      return v();
    });
    this.clear.callbacks.length = 0;
  },
  createContext: function createContext() {
    this.ctx = new (AudioContext || webkitAudioContext)();
    gen.samplerate = this.ctx.samplerate;

    return this;
  },
  createScriptProcessor: function createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor(256, 0, 2), this.clearFunction = function () {
      return 0;
    }, this.callback = this.clearFunction;

    this.node.onaudioprocess = function (audioProcessingEvent) {
      var outputBuffer = audioProcessingEvent.outputBuffer;

      var left = outputBuffer.getChannelData(0),
          right = outputBuffer.getChannelData(1);

      for (var sample = 0; sample < left.length; sample++) {
        if (!isStereo) {
          left[sample] = right[sample] = utilities.callback();
        } else {
          var out = utilities.callback();
          left[sample] = out[0];
          right[sample] = out[1];
        }
      }
    };

    this.node.connect(this.ctx.destination);

    //this.node.connect( this.analyzer )

    return this;
  },
  playGraph: function playGraph(graph, debug) {
    if (debug === undefined) debug = false;

    isStereo = Array.isArray(graph);

    utilities.callback = gen.createCallback(graph, debug);

    if (utilities.console) utilities.console.setValue(utilities.callback.toString());

    return utilities.callback;
  },
  loadSample: function loadSample(soundFilePath, data) {
    var req = new XMLHttpRequest();
    req.open('GET', soundFilePath, true);
    req.responseType = 'arraybuffer';

    var promise = new Promise(function (resolve, reject) {
      req.onload = function () {
        var audioData = req.response;

        utilities.ctx.decodeAudioData(audioData, function (buffer) {
          data.buffer = buffer.getChannelData(0);
          resolve(data.buffer);
        });
      };
    });

    req.send();

    return promise;
  }
};

utilities.clear.callbacks = [];

module.exports = utilities;

},{"./data.js":13,"./gen.js":21}],54:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    floor = require('./floor.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

var proto = {
  basename: 'wrap',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        signal = inputs[0],
        min = inputs[1],
        max = inputs[2],
        out = void 0;

    //out = `(((${inputs[0]} - ${this.min}) % ${diff}  + ${diff}) % ${diff} + ${this.min})`
    //const long numWraps = long((v-lo)/range) - (v < lo);
    //return v - range * double(numWraps);  

    out = '  let ' + this.name + ' = ' + inputs[0] + '\n  if( ' + this.name + ' < ' + this.min + ' ) ' + this.name + ' += ' + this.max + ' - ' + this.min + '\n  else if( ' + this.name + ' > ' + this.max + ' ) ' + this.name + ' -= ' + this.max + ' - ' + this.min + '\n\n';

    //` let ${this.name} = ${signal}
    //  if( ${this.name} < ${min} || ${this.name} > ${max} ) {
    //    let diff = ${max} - ${min}
    //    ${this.name} -= diff
    //    //let numWraps = (( ${signal} - ${min} ) / diff ) | 0
    //    //${this.name} = ${this.name} - diff * numWraps
    //  }
    //`
    //  else if( ${this.name} > ${max} ) ${this.name} -= ${max} - ${in}

    return [this.name, ' ' + out];
  }
};

module.exports = function (in1) {
  var min = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var max = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    min: min,
    max: max,
    uid: _gen.getUID(),
    inputs: [in1, min, max]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./floor.js":18,"./gen.js":21,"./memo.js":30,"./sub.js":48}]},{},[26])(26)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZGQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2Jvb2wuanMiLCJqcy9jZWlsLmpzIiwianMvY2xhbXAuanMiLCJqcy9jb3MuanMiLCJqcy9jb3VudGVyLmpzIiwianMvY3ljbGUuanMiLCJqcy9kYXRhLmpzIiwianMvZGNibG9jay5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9mbG9vci5qcyIsImpzL2ZvbGQuanMiLCJqcy9nYXRlLmpzIiwianMvZ2VuLmpzIiwianMvZ3QuanMiLCJqcy9ndHAuanMiLCJqcy9oaXN0b3J5LmpzIiwianMvaW4uanMiLCJqcy9pbmRleC5qcyIsImpzL2x0LmpzIiwianMvbHRwLmpzIiwianMvbWF4LmpzIiwianMvbWVtby5qcyIsImpzL21pbi5qcyIsImpzL21peC5qcyIsImpzL21vZC5qcyIsImpzL210b2YuanMiLCJqcy9tdWwuanMiLCJqcy9ub2lzZS5qcyIsImpzL25vdC5qcyIsImpzL3BhcmFtLmpzIiwianMvcGVlay5qcyIsImpzL3BoYXNvci5qcyIsImpzL3Bva2UuanMiLCJqcy9yYXRlLmpzIiwianMvcm91bmQuanMiLCJqcy9zYWguanMiLCJqcy9zaWduLmpzIiwianMvc2luLmpzIiwianMvc2xpZGUuanMiLCJqcy9zdWIuanMiLCJqcy9zd2l0Y2guanMiLCJqcy90NjAuanMiLCJqcy90YW4uanMiLCJqcy90cmFpbi5qcyIsImpzL3V0aWxpdGllcy5qcyIsImpzL3dyYXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixRQUFLLEtBQUw7O0FBRUEsc0JBQU07QUFDSixRQUFJLFlBQUo7UUFD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LFVBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxXQUFVLFFBQVMsY0FBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsVUFBVSxRQUFTLGFBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFdBQVUsUUFBUyxjQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxXQUFVLFFBQVMsY0FBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsTUFBVSxRQUFTLFNBQVQsQ0FBVjtBQUNBLE1BQVUsUUFBUyxTQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsUUFBVSxRQUFT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LENBQVQ7UUFBb0IsTUFBTSxPQUFPLENBQVAsQ0FBTjtRQUFpQixNQUFNLE9BQU8sQ0FBUCxDQUFOO1FBQ3JDLFlBSEo7Ozs7OztBQURJLE9BVUosY0FBYyxLQUFLLElBQUwsV0FBZSxPQUFPLENBQVAsaUJBQ3pCLEtBQUssSUFBTCxXQUFlLEtBQUssR0FBTCxXQUFjLEtBQUssSUFBTCxZQUFnQixLQUFLLEdBQUwsV0FBYyxLQUFLLEdBQUwscUJBQ3RELEtBQUssSUFBTCxXQUFlLEtBQUssR0FBTCxXQUFjLEtBQUssSUFBTCxZQUFnQixLQUFLLEdBQUwsV0FBYyxLQUFLLEdBQUwsU0FGcEU7Ozs7Ozs7Ozs7OztBQVZJLFdBd0JHLENBQUUsS0FBSyxJQUFMLEVBQVcsTUFBTSxHQUFOLENBQXBCLENBeEJJO0dBSEk7Q0FBUjs7QUErQkosT0FBTyxPQUFQLEdBQWlCLFVBQUUsR0FBRixFQUF5QjtNQUFsQiw0REFBSSxpQkFBYztNQUFYLDREQUFJLGlCQUFPOztBQUN4QyxNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFQLENBRG9DOztBQUd4QyxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFlBRG1CO0FBRW5CLFlBRm1CO0FBR25CLFNBQVEsS0FBSSxNQUFKLEVBQVI7QUFDQSxZQUFRLENBQUUsR0FBRixFQUFPLEdBQVAsRUFBWSxHQUFaLENBQVI7R0FKRixFQUh3Qzs7QUFVeEMsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFMLEdBQWdCLEtBQUssR0FBTCxDQVZTOztBQVl4QyxTQUFPLElBQVAsQ0Fad0M7Q0FBekIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2FicycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmFicyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFicyggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hYnMoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhYnMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWJzLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGFic1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY2N1bScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keSA9IHRoaXMuY2FsbGJhY2soIGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdIClcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgICBcbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfcmVzZXQgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcFxuICAgIFxuICAgIC8qIHRocmVlIGRpZmZlcmVudCBtZXRob2RzIG9mIHdyYXBwaW5nLCB0aGlyZCBpcyBtb3N0IGV4cGVuc2l2ZTpcbiAgICAgKlxuICAgICAqIDE6IHJhbmdlIHswLDF9OiB5ID0geCAtICh4IHwgMClcbiAgICAgKiAyOiBsb2cyKHRoaXMubWF4KSA9PSBpbnRlZ2VyOiB5ID0geCAmICh0aGlzLm1heCAtIDEpXG4gICAgICogMzogYWxsIG90aGVyczogaWYoIHggPj0gdGhpcy5tYXggKSB5ID0gdGhpcy5tYXggLXhcbiAgICAgKlxuICAgICAqL1xuXG4gICAgLy8gbXVzdCBjaGVjayBmb3IgcmVzZXQgYmVmb3JlIHN0b3JpbmcgdmFsdWUgZm9yIG91dHB1dFxuICAgIGlmKCAhKHR5cGVvZiB0aGlzLmlucHV0c1sxXSA9PT0gJ251bWJlcicgJiYgdGhpcy5pbnB1dHNbMV0gPCAxKSApIHsgXG4gICAgICBvdXQgKz0gJyAgaWYoICcrX3Jlc2V0Kyc+PTEgKSAnK19uYW1lKycudmFsdWUgPSAnICsgdGhpcy5taW4gKyAnXFxuJ1xuICAgIH1cblxuICAgIG91dCArPSBgICBsZXQgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHtfbmFtZX0udmFsdWU7XFxuICAke19uYW1lfS52YWx1ZSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIFxuICAgIGlmKCB0aGlzLm1pbiA9PT0gMCAmJiB0aGlzLm1heCA9PT0gMSApIHsgXG4gICAgICB3cmFwID0gIGAgICR7X25hbWV9LnZhbHVlID0gJHtfbmFtZX0udmFsdWUgLSAoJHtfbmFtZX0udmFsdWUgfCAwKVxcblxcbmBcbiAgICB9IGVsc2UgaWYoIHRoaXMubWluID09PSAwICYmICggTWF0aC5sb2cyKCB0aGlzLm1heCApIHwgMCApID09PSBNYXRoLmxvZzIoIHRoaXMubWF4ICkgKSB7XG4gICAgICB3cmFwID0gIGAgICR7X25hbWV9LnZhbHVlID0gJHtfbmFtZX0udmFsdWUgJiAoJHt0aGlzLm1heH0gLSAxKVxcblxcbmBcbiAgICB9IGVsc2Uge1xuICAgICAgd3JhcCA9IGAgIGlmKCAke19uYW1lfS52YWx1ZSA+PSAke3RoaXMubWF4fSApICR7X25hbWV9LnZhbHVlIC09ICR7ZGlmZn1cXG5cXG5gXG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyLCByZXNldD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgbWluOjAsIG1heDoxIH1cblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIGlmKCBkZWZhdWx0cy5pbml0aWFsVmFsdWUgPT09IHVuZGVmaW5lZCApIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSA9IGRlZmF1bHRzLm1pblxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluOiBkZWZhdWx0cy5taW4sIFxuICAgIG1heDogZGVmYXVsdHMubWF4LFxuICAgIHZhbHVlOiAgZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbmNyLCByZXNldCBdLFxuICB9LFxuICBkZWZhdWx0cyApXG5cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY29zJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYWNvcyc6IE1hdGguYWNvcyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFjb3MoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFjb3MoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhY29zID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFjb3MuaW5wdXRzID0gWyB4IF1cbiAgYWNvcy5pZCA9IGdlbi5nZXRVSUQoKVxuICBhY29zLm5hbWUgPSBgJHthY29zLmJhc2VuYW1lfXthY29zLmlkfWBcblxuICByZXR1cm4gYWNvc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IGFkZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgc3VtID0gMCwgbnVtQ291bnQgPSAwLCBhZGRlckF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgICBvdXQgKz0gdlxuICAgICAgICAgIGlmKCBpIDwgaW5wdXRzLmxlbmd0aCAtMSApIHtcbiAgICAgICAgICAgIGFkZGVyQXRFbmQgPSB0cnVlXG4gICAgICAgICAgICBvdXQgKz0gJyArICdcbiAgICAgICAgICB9XG4gICAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdW0gKz0gcGFyc2VGbG9hdCggdiApXG4gICAgICAgICAgbnVtQ291bnQrK1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgXG4gICAgICBpZiggYWxyZWFkeUZ1bGxTdW1tZWQgKSBvdXQgPSAnJ1xuXG4gICAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgICBvdXQgKz0gYWRkZXJBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKyAnICsgc3VtXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKCAhYWxyZWFkeUZ1bGxTdW1tZWQgKSBvdXQgKz0gJyknXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBhZGRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXNpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2FzaW4nOiBNYXRoLmFzaW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhc2luLmlucHV0cyA9IFsgeCBdXG4gIGFzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXNpbi5uYW1lID0gYCR7YXNpbi5iYXNlbmFtZX17YXNpbi5pZH1gXG5cbiAgcmV0dXJuIGFzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXRhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2F0YW4nOiBNYXRoLmF0YW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hdGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hdGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXRhbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhdGFuLmlucHV0cyA9IFsgeCBdXG4gIGF0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXRhbi5uYW1lID0gYCR7YXRhbi5iYXNlbmFtZX17YXRhbi5pZH1gXG5cbiAgcmV0dXJuIGF0YW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Jvb2wnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IGAke2lucHV0c1swXX0gPT09IDAgPyAwIDogMWBcbiAgICBcbiAgICAvL2dlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICAvL3JldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgK291dCBdXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidjZWlsJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguY2VpbCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmNlaWwoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY2VpbCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNlaWwgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY2VpbC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBjZWlsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NsaXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9XG5cbmAgbGV0ICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9ID4gJHtpbnB1dHNbMl19ICkgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMl19XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA8ICR7aW5wdXRzWzFdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzFdfVxuYFxuICAgIG91dCA9ICcgJyArIG91dFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49LTEsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Nvcyc6IE1hdGguY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jb3MoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY29zLmlucHV0cyA9IFsgeCBdXG4gIGNvcy5pZCA9IGdlbi5nZXRVSUQoKVxuICBjb3MubmFtZSA9IGAke2Nvcy5iYXNlbmFtZX17Y29zLmlkfWBcblxuICByZXR1cm4gY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvdW50ZXInLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgaW5wdXRzWzJdLCBpbnB1dHNbM10gKVxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgIFxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9taW4sIF9tYXgsIF9yZXNldCApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICBcbiAgICAvKiB0aHJlZSBkaWZmZXJlbnQgbWV0aG9kcyBvZiB3cmFwcGluZywgdGhpcmQgaXMgbW9zdCBleHBlbnNpdmU6XG4gICAgICpcbiAgICAgKiAxOiByYW5nZSB7MCwxfTogeSA9IHggLSAoeCB8IDApXG4gICAgICogMjogbG9nMih0aGlzLm1heCkgPT0gaW50ZWdlcjogeSA9IHggJiAodGhpcy5tYXggLSAxKVxuICAgICAqIDM6IGFsbCBvdGhlcnM6IGlmKCB4ID49IHRoaXMubWF4ICkgeSA9IHRoaXMubWF4IC14XG4gICAgICpcbiAgICAgKi9cblxuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiggISh0eXBlb2YgdGhpcy5pbnB1dHNbM10gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzNdIDwgMSkgKSB7IFxuICAgICAgb3V0ICs9ICcgIGlmKCAnK19yZXNldCsnPj0xICkgJytfbmFtZSsnLnZhbHVlID0gJyArIF9taW4gKyAnXFxuJ1xuICAgIH1cblxuICAgIG91dCArPSBgICBsZXQgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHtfbmFtZX0udmFsdWU7XFxuICAke19uYW1lfS52YWx1ZSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIFxuICAgIGlmKCB0aGlzLm1pbiA9PT0gMCAmJiB0aGlzLm1heCA9PT0gMSApIHsgXG4gICAgICB3cmFwID0gIGAgICR7X25hbWV9LnZhbHVlID0gJHtfbmFtZX0udmFsdWUgLSAoJHtfbmFtZX0udmFsdWUgfCAwKVxcblxcbmBcbiAgICB9IGVsc2UgaWYoIHRoaXMubWluID09PSAwICYmICggTWF0aC5sb2cyKCB0aGlzLm1heCApIHwgMCApID09PSBNYXRoLmxvZzIoIHRoaXMubWF4ICkgKSB7XG4gICAgICB3cmFwID0gIGAgICR7X25hbWV9LnZhbHVlID0gJHtfbmFtZX0udmFsdWUgJiAoJHt0aGlzLm1heH0gLSAxKVxcblxcbmBcbiAgICB9IGVsc2UgaWYoIHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHRoaXMubWluID09PSAnbnVtYmVyJyApIHtcbiAgICAgIHdyYXAgPSBgICBpZiggJHtfbmFtZX0udmFsdWUgPj0gJHt0aGlzLm1heH0gKSAke19uYW1lfS52YWx1ZSAtPSAke2RpZmZ9XFxuXFxuYFxuICAgIH1lbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHtfbmFtZX0udmFsdWUgPj0gJHtfbWF4fSApICR7X25hbWV9LnZhbHVlIC09ICR7X21heH0gLSAke19taW59XG4gIGVsc2UgaWYoICR7X25hbWV9LnZhbHVlIDwgJHtfbWlufSApICR7X25hbWV9LnZhbHVlICs9ICR7X21heH0gLSAke19taW59XFxuXFxuYFxuICAgIH1cblxuICAgIG91dCA9IG91dCArIHdyYXBcblxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jciwgbWluPTAsIG1heD1JbmZpbml0eSwgcmVzZXQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXRpYWxWYWx1ZTogMCB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbjogICAgbWluLCBcbiAgICBtYXg6ICAgIG1heCxcbiAgICB2YWx1ZTogIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW5jciwgbWluLCBtYXgsIHJlc2V0IF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG4gIHJldHVybiB1Z2VuXG59IFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwaGFzb3I9cmVxdWlyZSggJy4vcGhhc29yLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY3ljbGUnLFxuICB0YWJsZTpudWxsLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcbiAgICBcbiAgICBvdXQgPSBwZWVrKCBwcm90by50YWJsZSwgcGhhc29yKCBpbnB1dHNbMF0gKSApLmdlbigpXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gb3V0WzBdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9LFxuXG4gIGluaXRUYWJsZSgpIHtcbiAgICB0aGlzLnRhYmxlID0gZGF0YSggMTAyNCApXG5cbiAgICBmb3IoIGxldCBpID0gMCwgbCA9IHRoaXMudGFibGUuYnVmZmVyLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIHRoaXMudGFibGUuYnVmZmVyWyBpIF0gPSBNYXRoLnNpbiggKCBpIC8gbCApICogKCBNYXRoLlBJICogMiApIClcbiAgICB9XG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGlmKCBwcm90by50YWJsZSA9PT0gbnVsbCApIHByb3RvLmluaXRUYWJsZSgpIFxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgZnJlcXVlbmN5LFxuICAgIHJlc2V0LFxuICAgIHRhYmxlOiAgICAgIHByb3RvLnRhYmxlLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGZyZXF1ZW5jeSwgcmVzZXQgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgdXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RhdGEnLFxuXG4gIGdlbigpIHtcbiAgICBnZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSB0aGlzXG4gICAgcmV0dXJuICdnZW4uZGF0YS4nICsgdGhpcy5uYW1lICsgJy5idWZmZXInXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCB5PTEgKSA9PiB7XG4gIGxldCB1Z2VuLCBidWZmZXIsIHNob3VsZExvYWQgPSBmYWxzZVxuICAgIFxuICBpZiggdHlwZW9mIHggPT09ICdudW1iZXInICkge1xuICAgIGlmKCB5ICE9PSAxICkge1xuICAgICAgYnVmZmVyID0gW11cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgeTsgaSsrICkge1xuICAgICAgICBidWZmZXJbIGkgXSA9IG5ldyBGbG9hdDMyQXJyYXkoIHggKVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgfVxuICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggeCApICkgeyAvLyEgKHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSApIHtcbiAgICBsZXQgc2l6ZSA9IHgubGVuZ3RoXG4gICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggc2l6ZSApXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSB4WyBpIF1cbiAgICB9XG4gIH1lbHNlIGlmKCB0eXBlb2YgeCA9PT0gJ3N0cmluZycgKSB7XG4gICAgYnVmZmVyID0gWyAwIF1cbiAgICBzaG91bGRMb2FkID0gdHJ1ZVxuICB9ZWxzZXtcbiAgICBidWZmZXIgPSB4XG4gIH1cblxuICB1Z2VuID0geyBcbiAgICBidWZmZXIsXG4gICAgbmFtZTogcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKCksXG4gICAgZGltOiB5ID09PSAxID8gYnVmZmVyLmxlbmd0aCA6IHgsXG4gICAgY2hhbm5lbHMgOiAxLFxuICAgIGdlbjogIHByb3RvLmdlbixcbiAgICBvbmxvYWQ6IG51bGwsXG4gICAgdGhlbiggZm5jICkge1xuICAgICAgdWdlbi5vbmxvYWQgPSBmbmNcbiAgICAgIHJldHVybiB1Z2VuXG4gICAgfSxcbiAgfVxuICBcbiAgLy9nZW4uZGF0YVsgdWdlbi5uYW1lIF0gPSB1Z2VuXG5cbiAgaWYoIHNob3VsZExvYWQgKSB7XG4gICAgbGV0IHByb21pc2UgPSB1dGlsaXRpZXMubG9hZFNhbXBsZSggeCwgdWdlbiApXG4gICAgcHJvbWlzZS50aGVuKCAoKT0+IHsgdWdlbi5vbmxvYWQoKSB9KVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkY2Jsb2NrJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgeDEgICAgID0gaGlzdG9yeSgpLFxuICAgICAgICB5MSAgICAgPSBoaXN0b3J5KCksXG4gICAgICAgIGZpbHRlclxuXG4gICAgLy9IaXN0b3J5IHgxLCB5MTsgeSA9IGluMSAtIHgxICsgeTEqMC45OTk3OyB4MSA9IGluMTsgeTEgPSB5OyBvdXQxID0geTtcbiAgICBmaWx0ZXIgPSBtZW1vKCBhZGQoIHN1YiggaW5wdXRzWzBdLCB4MS5vdXQgKSwgbXVsKCB5MS5vdXQsIC45OTk3ICkgKSApXG4gICAgeDEuaW4oIGlucHV0c1swXSApLmdlbigpXG4gICAgeTEuaW4oIGZpbHRlciApLmdlbigpXG5cbiAgICByZXR1cm4gZmlsdGVyLm5hbWVcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBva2UgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICAgIHdyYXAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9hY2N1bS5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RlbGF5JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsIG91dCwgYWNjLCB3cml0ZUlkeCwgcmVhZElkeFxuICAgIFxuICAgIHdyaXRlSWR4ID0gYWNjdW0oIDEsIDAsIHsgbWF4OnRoaXMuc2l6ZX0pIC8vIGluaXRpYWxWYWx1ZTpNYXRoLmZsb29yKHRoaXMudGltZSkgfSkgXG4gICAgcmVhZElkeCAgPSB3cmFwKCBzdWIoIHdyaXRlSWR4LCB0aGlzLmlucHV0c1sxXSApLCAwLCB0aGlzLnNpemUgKVxuXG4gICAgcG9rZSggdGhpcy5idWZmZXIsIHRoaXMuaW5wdXRzWzBdLCB3cml0ZUlkeCApLmdlbigpXG5cbiAgICBvdXQgPSBwZWVrKCB0aGlzLmJ1ZmZlciwgcmVhZElkeCwgeyBtb2RlOidzYW1wbGVzJywgaW50ZXJwOnRoaXMuaW50ZXJwIH0pLmdlbigpXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBvdXRcbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHRpbWU9MjU2LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgc2l6ZTogNTEyLCBmZWVkYmFjazowLCBpbnRlcnA6J2xpbmVhcicgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHRpbWUsXG4gICAgYnVmZmVyIDogZGF0YSggZGVmYXVsdHMuc2l6ZSApLFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIHRpbWUgXSxcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGVsdGEnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBuMSAgICAgPSBoaXN0b3J5KClcbiAgICBcbiAgICBuMS5pbiggaW5wdXRzWzBdICkuZ2VuKClcblxuICAgIHJldHVybiBzdWIoIGlucHV0c1swXSwgbjEub3V0ICkuZ2VuKClcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgZGl2ID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgZGl2QXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAvIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLyAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLyAnIFxuICAgICAgfSlcblxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gZGl2XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZmxvb3InLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICAvL2dlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmZsb29yIH0pXG5cbiAgICAgIG91dCA9IGAoICR7aW5wdXRzWzBdfSB8IDAgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gfCAwXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgZmxvb3IgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZmxvb3IuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gZmxvb3Jcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZm9sZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dFxuXG4gICAgb3V0ID0gdGhpcy5jcmVhdGVDYWxsYmFjayggaW5wdXRzWzBdLCB0aGlzLm1pbiwgdGhpcy5tYXggKSBcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBvdXQgXVxuICB9LFxuXG4gIGNyZWF0ZUNhbGxiYWNrKCB2LCBsbywgaGkgKSB7XG4gICAgbGV0IG91dCA9XG5gIGxldCAke3RoaXMubmFtZX1fdmFsdWUgPSAke3Z9LFxuICAgICAgJHt0aGlzLm5hbWV9X3JhbmdlID0gJHtoaX0gLSAke2xvfSxcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9IDBcblxuICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gKCgke3RoaXMubmFtZX1fdmFsdWUgLSAke2xvfSkgLyAke3RoaXMubmFtZX1fcmFuZ2UpIHwgMFxuICAgICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZSAqICR7dGhpcy5uYW1lfV9udW1XcmFwc1xuICAgIH1cbiAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMrK1xuICB9IGVsc2UgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlIDwgJHtsb30pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSArPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZS0gMSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcy0tXG4gIH1cbiAgaWYoJHt0aGlzLm5hbWV9X251bVdyYXBzICYgMSkgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHtoaX0gKyAke2xvfSAtICR7dGhpcy5uYW1lfV92YWx1ZVxuYFxuICAgIHJldHVybiAnICcgKyBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZ2F0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dCwgZGF0YSA9J2dlbi5kYXRhLicgKyB0aGlzLm5hbWVcbiAgICBcbiAgICBvdXQgPVxuXG5gIGxldCAke3RoaXMubmFtZX1faW5kZXggPSAke2lucHV0c1sxXX1cbiAgaWYoICR7dGhpcy5uYW1lfV9pbmRleCAhPSAke2RhdGF9Lmxhc3RJbnB1dCApIHtcbiAgICAke2RhdGF9Lm91dHB1dHNbICR7ZGF0YX0ubGFzdElucHV0IF0gPSAwXG4gICAgJHtkYXRhfS5sYXN0SW5wdXQgPSAke2lucHV0c1sxXX1cbiAgfVxuICAke2RhdGF9Lm91dHB1dHNbICR7aW5wdXRzWzFdfSBdID0gJHtpbnB1dHNbMF19IFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgKyBvdXQgXVxuICB9LFxuXG4gIGNoaWxkZ2VuKCkge1xuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy5wYXJlbnQubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICB9XG4gICAgcmV0dXJuIGBnZW4uZGF0YS4ke3RoaXMucGFyZW50Lm5hbWV9Lm91dHB1dHNbICR7dGhpcy5pbmRleH0gXWBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggY29udHJvbCwgaW4xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY291bnQ6IDIgfVxuXG4gIGlmKCB0eXBlb2YgcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICBvdXRwdXRzOiBbXSxcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGNvbnRyb2wgXSxcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICBnZW4uZGF0YVsgdWdlbi5uYW1lIF0gPSB7IG91dHB1dHM6IFtdLCBsYXN0SW5wdXQ6MCB9XG5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB1Z2VuLmNvdW50OyBpKysgKSB7XG4gICAgdWdlbi5vdXRwdXRzLnB1c2goe1xuICAgICAgaW5kZXg6aSxcbiAgICAgIGdlbjogcHJvdG8uY2hpbGRnZW4sXG4gICAgICBwYXJlbnQ6dWdlbixcbiAgICAgIGlucHV0czogWyB1Z2VuIF1cbiAgICB9KVxuICAgIGdlbi5kYXRhWyB1Z2VuLm5hbWUgXS5vdXRwdXRzWyBpIF0gPSAwXG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGdlbi5qc1xuICpcbiAqIGxvdy1sZXZlbCBjb2RlIGdlbmVyYXRpb24gZm9yIHVuaXQgZ2VuZXJhdG9yc1xuICpcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBhY2N1bTowLFxuICBnZXRVSUQoKSB7IHJldHVybiB0aGlzLmFjY3VtKysgfSxcbiAgZGVidWc6ZmFsc2UsXG4gIHNhbXBsZXJhdGU6IDQ0MTAwLCAvLyBjaGFuZ2Ugb24gYXVkaW9jb250ZXh0IGNyZWF0aW9uXG4gIFxuICAvKiBjbG9zdXJlc1xuICAgKlxuICAgKiBGdW5jdGlvbnMgdGhhdCBhcmUgaW5jbHVkZWQgYXMgYXJndW1lbnRzIHRvIG1hc3RlciBjYWxsYmFjay4gRXhhbXBsZXM6IE1hdGguYWJzLCBNYXRoLnJhbmRvbSBldGMuXG4gICAqIFhYWCBTaG91bGQgcHJvYmFibHkgYmUgcmVuYW1lZCBjYWxsYmFja1Byb3BlcnRpZXMgb3Igc29tZXRoaW5nIHNpbWlsYXIuLi4gY2xvc3VyZXMgYXJlIG5vIGxvbmdlciB1c2VkLlxuICAgKi9cblxuICBjbG9zdXJlczpuZXcgU2V0KCksXG5cbiAgcGFyYW1ldGVyczpbXSxcbiAgZW5kQmxvY2s6IG5ldyBTZXQoKSxcbiAgaGlzdG9yaWVzOiBuZXcgTWFwKCksXG5cbiAgbWVtbzoge30sXG5cbiAgZGF0YToge30sXG4gIFxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydCggb2JqICkge30sXG5cbiAgYWRkVG9FbmRCbG9jayggdiApIHtcbiAgICB0aGlzLmVuZEJsb2NrLmFkZCggJyAgJyArIHYgKVxuICB9LFxuICBcbiAgLyogY3JlYXRlQ2FsbGJhY2tcbiAgICpcbiAgICogcGFyYW0gdWdlbiAtIEhlYWQgb2YgZ3JhcGggdG8gYmUgY29kZWdlbidkXG4gICAqXG4gICAqIEdlbmVyYXRlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBhIHBhcnRpY3VsYXIgdWdlbiBncmFwaC5cbiAgICogVGhlIGdlbi5jbG9zdXJlcyBwcm9wZXJ0eSBzdG9yZXMgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZVxuICAgKiBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBmaW5hbCBmdW5jdGlvbjsgdGhlc2UgYXJlIHByZWZpeGVkXG4gICAqIGJlZm9yZSBhbnkgZGVmaW5lZCBwYXJhbXMgdGhlIGdyYXBoIGV4cG9zZXMuIEZvciBleGFtcGxlLCBnaXZlbjpcbiAgICpcbiAgICogZ2VuLmNyZWF0ZUNhbGxiYWNrKCBhYnMoIHBhcmFtKCkgKSApXG4gICAqXG4gICAqIC4uLiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHdpbGwgaGF2ZSBhIHNpZ25hdHVyZSBvZiAoIGFicywgcDAgKS5cbiAgICovXG4gIFxuICBjcmVhdGVDYWxsYmFjayggdWdlbiwgZGVidWcgPSBmYWxzZSApIHtcbiAgICBsZXQgaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCB1Z2VuICksXG4gICAgICAgIGNhbGxiYWNrLCBcbiAgICAgICAgY2hhbm5lbDEsIGNoYW5uZWwyXG4gICAgXG4gICAgLy90aGlzLmRhdGEgPSB7fSBcbiAgICB0aGlzLm1lbW8gPSB7fVxuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMuaGlzdG9yaWVzLmNsZWFyKClcbiAgICB0aGlzLnBhcmFtZXRlcnMubGVuZ3RoID0gMFxuXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSBcIiAgJ3VzZSBzdHJpY3QnO1xcblxcblwiXG5cbiAgICAvLyBjYWxsIC5nZW4oKSBvbiB0aGUgaGVhZCBvZiB0aGUgZ3JhcGggd2UgYXJlIGdlbmVyYXRpbmcgdGhlIGNhbGxiYWNrIGZvclxuICAgIC8vY29uc29sZS5sb2coICdIRUFEJywgdWdlbiApXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxICsgaXNTdGVyZW87IGkrKyApIHtcbiAgICAgIGxldCBjaGFubmVsID0gaXNTdGVyZW8gPyB1Z2VuW2ldLmdlbigpIDogdWdlbi5nZW4oKSxcbiAgICAgICAgICBib2R5ID0gJydcblxuICAgICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgICAgYm9keSArPSBBcnJheS5pc0FycmF5KCBjaGFubmVsICkgPyBjaGFubmVsWzFdICsgJ1xcbicgKyBjaGFubmVsWzBdIDogY2hhbm5lbFxuXG4gICAgICAvLyBzcGxpdCBib2R5IHRvIGluamVjdCByZXR1cm4ga2V5d29yZCBvbiBsYXN0IGxpbmVcbiAgICAgIGJvZHkgPSBib2R5LnNwbGl0KCdcXG4nKVxuICAgICBcbiAgICAgIC8vaWYoIGRlYnVnICkgY29uc29sZS5sb2coICdmdW5jdGlvbkJvZHkgbGVuZ3RoJywgYm9keSApXG4gICAgICBcbiAgICAgIC8vIG5leHQgbGluZSBpcyB0byBhY2NvbW1vZGF0ZSBtZW1vIGFzIGdyYXBoIGhlYWRcbiAgICAgIGlmKCBib2R5WyBib2R5Lmxlbmd0aCAtMSBdLnRyaW0oKS5pbmRleE9mKCdsZXQnKSA+IC0xICkgeyBib2R5LnB1c2goICdcXG4nICkgfSBcblxuICAgICAgLy8gZ2V0IGluZGV4IG9mIGxhc3QgbGluZVxuICAgICAgbGV0IGxhc3RpZHggPSBib2R5Lmxlbmd0aCAtIDFcblxuICAgICAgLy8gaW5zZXJ0IHJldHVybiBrZXl3b3JkXG4gICAgICBib2R5WyBsYXN0aWR4IF0gPSAnICBnZW4ub3V0WycgKyBpICsgJ10gID0gJyArIGJvZHlbIGxhc3RpZHggXSArICdcXG4nXG5cbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGJvZHkuam9pbignXFxuJylcbiAgICB9XG5cbiAgICBsZXQgcmV0dXJuU3RhdGVtZW50ID0gaXNTdGVyZW8gPyAnICByZXR1cm4gZ2VuLm91dCcgOiAnICByZXR1cm4gZ2VuLm91dFswXSdcbiAgICBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LnNwbGl0KCdcXG4nKVxuXG4gICAgaWYoIHRoaXMuZW5kQmxvY2suc2l6ZSApIHsgXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmNvbmNhdCggQXJyYXkuZnJvbSggdGhpcy5lbmRCbG9jayApIClcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2goIHJldHVyblN0YXRlbWVudCApXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCByZXR1cm5TdGF0ZW1lbnQgKVxuICAgIH1cbiAgICAvLyByZWFzc2VtYmxlIGZ1bmN0aW9uIGJvZHlcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmpvaW4oJ1xcbicpXG5cbiAgICAvLyB3ZSBjYW4gb25seSBkeW5hbWljYWxseSBjcmVhdGUgYSBuYW1lZCBmdW5jdGlvbiBieSBkeW5hbWljYWxseSBjcmVhdGluZyBhbm90aGVyIGZ1bmN0aW9uXG4gICAgLy8gdG8gY29uc3RydWN0IHRoZSBuYW1lZCBmdW5jdGlvbiEgc2hlZXNoLi4uXG4gICAgbGV0IGJ1aWxkU3RyaW5nID0gYHJldHVybiBmdW5jdGlvbiBnZW4oICR7dGhpcy5wYXJhbWV0ZXJzLmpvaW4oJywnKX0gKXsgXFxuJHt0aGlzLmZ1bmN0aW9uQm9keX1cXG59YFxuICAgIFxuICAgIGlmKCB0aGlzLmRlYnVnIHx8IGRlYnVnICkgY29uc29sZS5sb2coIGJ1aWxkU3RyaW5nICkgXG5cbiAgICBjYWxsYmFjayA9IG5ldyBGdW5jdGlvbiggYnVpbGRTdHJpbmcgKSgpXG4gICAgXG4gICAgLy8gYXNzaWduIHByb3BlcnRpZXMgdG8gbmFtZWQgZnVuY3Rpb25cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMuY2xvc3VyZXMudmFsdWVzKCkgKSB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdmFsdWUgPSBkaWN0WyBuYW1lIF1cblxuICAgICAgY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuICAgIFxuICAgIGNhbGxiYWNrLmRhdGEgPSB0aGlzLmRhdGFcbiAgICBjYWxsYmFjay5vdXQgID0gW11cblxuICAgIHJldHVybiBjYWxsYmFja1xuICB9LFxuICBcbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIEdpdmVuIGFuIGFyZ3VtZW50IHVnZW4sIGV4dHJhY3QgaXRzIGlucHV0cy4gSWYgdGhleSBhcmUgbnVtYmVycywgcmV0dXJuIHRoZSBudW1lYnJzLiBJZlxuICAgKiB0aGV5IGFyZSB1Z2VucywgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0cyggdWdlbiApIHtcbiAgICBsZXQgaW5wdXRzID0gdWdlbi5pbnB1dHMubWFwKCBpbnB1dCA9PiB7XG4gICAgICBsZXQgaXNPYmplY3QgPSB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnLFxuICAgICAgICAgIHByb2Nlc3NlZElucHV0XG5cbiAgICAgIGlmKCBpc09iamVjdCApIHsgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uIFxuICAgICAgICBpZiggdGhpcy5tZW1vWyBpbnB1dC5uYW1lIF0gKSB7IC8vIGlmIGl0IGhhcyBiZWVuIG1lbW9pemVkLi4uXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSB0aGlzLm1lbW9bIGlucHV0Lm5hbWUgXVxuICAgICAgICB9ZWxzZXsgLy8gaWYgbm90IG1lbW9pemVkIGdlbmVyYXRlIGNvZGVcbiAgICAgICAgICBsZXQgY29kZSA9IGlucHV0LmdlbigpXG4gICAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGNvZGUgKSApIHtcbiAgICAgICAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV1cbiAgICAgICAgICAgIC8vY29uc29sZS5sb2coICdhZnRlciBHRU4nICwgdGhpcy5mdW5jdGlvbkJvZHkgKVxuICAgICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlWzBdXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1lbHNleyAvLyBpdCBpbnB1dCBpcyBhIG51bWJlclxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwcm9jZXNzZWRJbnB1dFxuICAgIH0pXG5cbiAgICByZXR1cm4gaW5wdXRzXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidndCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19ID4gJHtpbnB1dHNbMV19ID8gMSA6IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSA+IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0gKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCBpbnB1dHNbMF0gPiBpbnB1dHNbMV0gKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3RwLmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gZ3RwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjE9MCApID0+IHtcbiAgbGV0IHVnZW4gPSB7XG4gICAgaW5wdXRzOiBbIGluMSBdLFxuXG4gICAgaW4oIHYgKSB7XG4gICAgICBpZiggZ2VuLmhpc3Rvcmllcy5oYXMoIHYgKSApe1xuICAgICAgICBsZXQgbWVtb0hpc3RvcnkgPSBnZW4uaGlzdG9yaWVzLmdldCggdiApXG4gICAgICAgIHVnZW4ubmFtZSA9IG1lbW9IaXN0b3J5Lm5hbWVcbiAgICAgICAgcmV0dXJuIG1lbW9IaXN0b3J5XG4gICAgICB9XG5cbiAgICAgIGxldCBvYmogPSB7XG4gICAgICAgIGdlbigpIHtcbiAgICAgICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdWdlbiApXG4gICAgICAgICAgXG4gICAgICAgICAgaWYoICBnZW4uZGF0YVsgdWdlbi5uYW1lIF0gPT09IHVuZGVmaW5lZCApe1xuICAgICAgICAgICAgZ2VuLmRhdGFbIHVnZW4ubmFtZSBdID0gaW4xXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZ2VuLmFkZFRvRW5kQmxvY2soICdnZW4uZGF0YS4nICsgdWdlbi5uYW1lICsgJyA9ICcgKyBpbnB1dHNbIDAgXSApXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICByZXR1cm4gaW5wdXRzWyAwIF1cbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogdWdlbi5uYW1lXG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5wdXRzWyAwIF0gPSB2XG4gICAgICBcbiAgICAgIGdlbi5oaXN0b3JpZXMuc2V0KCB2LCBvYmogKVxuXG4gICAgICByZXR1cm4gb2JqXG4gICAgfSxcbiAgICBcbiAgICBvdXQ6IHtcbiAgICAgIFxuICAgICAgZ2VuKCkge1xuICAgICAgICBpZiggZ2VuLmRhdGFbIHVnZW4ubmFtZSBdID09PSB1bmRlZmluZWQgKSBnZW4uZGF0YVsgdWdlbi5uYW1lIF0gPSBwYXJzZUZsb2F0KCBpbjEgKVxuICAgICAgICByZXR1cm4gJ2dlbi5kYXRhLicgKyB1Z2VuLm5hbWUgXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICB1aWQ6IGdlbi5nZXRVSUQoKSxcbiAgfVxuICBcbiAgdWdlbi5uYW1lID0gJ2hpc3RvcnknICsgdWdlbi51aWRcbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidpbicsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5wYXJhbWV0ZXJzLnB1c2goIHRoaXMubmFtZSApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICBsZXQgaW5wdXQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgaW5wdXQuaWQgICA9IGdlbi5nZXRVSUQoKVxuICBpbnB1dC5uYW1lID0gYCR7aW5wdXQuYmFzZW5hbWV9JHtpbnB1dC5pZH1gXG5cbiAgcmV0dXJuIGlucHV0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGxpYnJhcnkgPSB7XG4gIGV4cG9ydCggZGVzdGluYXRpb24gKSB7XG4gICAgZGVzdGluYXRpb24uc3NkID0gbGlicmFyeS5oaXN0b3J5IC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICAgIGRlc3RpbmF0aW9uLmlucHV0ID0gbGlicmFyeS5pbiAgICAvLyBpbiBpcyBhIGtleXdvcmQgaW4gamF2YXNjcmlwdFxuICAgIGRlc3RpbmF0aW9uLnRlcm5hcnkgPSBsaWJyYXJ5LnN3aXRjaCAvLyBzd2l0Y2ggaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcblxuICAgIGRlbGV0ZSBsaWJyYXJ5Lmhpc3RvcnlcbiAgICBkZWxldGUgbGlicmFyeS5pblxuICAgIGRlbGV0ZSBsaWJyYXJ5LnN3aXRjaFxuICAgIFxuICAgIE9iamVjdC5hc3NpZ24oIGRlc3RpbmF0aW9uLCBsaWJyYXJ5IClcbiAgICBkZXN0aW5hdGlvbi5jbGlwID0gbGlicmFyeS5jbGFtcFxuICB9LFxuXG4gIGdlbjogICAgICByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gIFxuICBhYnM6ICAgICAgcmVxdWlyZSggJy4vYWJzLmpzJyApLFxuICByb3VuZDogICAgcmVxdWlyZSggJy4vcm91bmQuanMnICksXG4gIHBhcmFtOiAgICByZXF1aXJlKCAnLi9wYXJhbS5qcycgKSxcbiAgYWRkOiAgICAgIHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgc3ViOiAgICAgIHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgbXVsOiAgICAgIHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgZGl2OiAgICAgIHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgYWNjdW06ICAgIHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICBjb3VudGVyOiAgcmVxdWlyZSggJy4vY291bnRlci5qcycgKSxcbiAgc2luOiAgICAgIHJlcXVpcmUoICcuL3Npbi5qcycgKSxcbiAgY29zOiAgICAgIHJlcXVpcmUoICcuL2Nvcy5qcycgKSxcbiAgdGFuOiAgICAgIHJlcXVpcmUoICcuL3Rhbi5qcycgKSxcbiAgYXNpbjogICAgIHJlcXVpcmUoICcuL2FzaW4uanMnICksXG4gIGFjb3M6ICAgICByZXF1aXJlKCAnLi9hY29zLmpzJyApLFxuICBhdGFuOiAgICAgcmVxdWlyZSggJy4vYXRhbi5qcycgKSwgIFxuICBwaGFzb3I6ICAgcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICBkYXRhOiAgICAgcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgcGVlazogICAgIHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gIGN5Y2xlOiAgICByZXF1aXJlKCAnLi9jeWNsZS5qcycgKSxcbiAgaGlzdG9yeTogIHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gIGRlbHRhOiAgICByZXF1aXJlKCAnLi9kZWx0YS5qcycgKSxcbiAgZmxvb3I6ICAgIHJlcXVpcmUoICcuL2Zsb29yLmpzJyApLFxuICBjZWlsOiAgICAgcmVxdWlyZSggJy4vY2VpbC5qcycgKSxcbiAgbWluOiAgICAgIHJlcXVpcmUoICcuL21pbi5qcycgKSxcbiAgbWF4OiAgICAgIHJlcXVpcmUoICcuL21heC5qcycgKSxcbiAgc2lnbjogICAgIHJlcXVpcmUoICcuL3NpZ24uanMnICksXG4gIGRjYmxvY2s6ICByZXF1aXJlKCAnLi9kY2Jsb2NrLmpzJyApLFxuICBtZW1vOiAgICAgcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgcmF0ZTogICAgIHJlcXVpcmUoICcuL3JhdGUuanMnICksXG4gIHdyYXA6ICAgICByZXF1aXJlKCAnLi93cmFwLmpzJyApLFxuICBtaXg6ICAgICAgcmVxdWlyZSggJy4vbWl4LmpzJyApLFxuICBjbGFtcDogICAgcmVxdWlyZSggJy4vY2xhbXAuanMnICksXG4gIHBva2U6ICAgICByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICBkZWxheTogICAgcmVxdWlyZSggJy4vZGVsYXkuanMnICksXG4gIGZvbGQ6ICAgICByZXF1aXJlKCAnLi9mb2xkLmpzJyApLFxuICBtb2QgOiAgICAgcmVxdWlyZSggJy4vbW9kLmpzJyApLFxuICBzYWggOiAgICAgcmVxdWlyZSggJy4vc2FoLmpzJyApLFxuICBub2lzZTogICAgcmVxdWlyZSggJy4vbm9pc2UuanMnICksXG4gIG5vdDogICAgICByZXF1aXJlKCAnLi9ub3QuanMnICksXG4gIGd0OiAgICAgICByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgbHQ6ICAgICAgIHJlcXVpcmUoICcuL2x0LmpzJyApLCBcbiAgYm9vbDogICAgIHJlcXVpcmUoICcuL2Jvb2wuanMnICksXG4gIGdhdGU6ICAgICByZXF1aXJlKCAnLi9nYXRlLmpzJyApLFxuICB0cmFpbjogICAgcmVxdWlyZSggJy4vdHJhaW4uanMnICksXG4gIHNsaWRlOiAgICByZXF1aXJlKCAnLi9zbGlkZS5qcycgKSxcbiAgaW46ICAgICAgIHJlcXVpcmUoICcuL2luLmpzJyApLFxuICB0NjA6ICAgICAgcmVxdWlyZSggJy4vdDYwLmpzJyksXG4gIG10b2Y6ICAgICByZXF1aXJlKCAnLi9tdG9mLmpzJyksXG4gIGx0cDogICAgICByZXF1aXJlKCAnLi9sdHAuanMnKSxcbiAgZ3RwOiAgICAgIHJlcXVpcmUoICcuL2d0cC5qcycpLFxuICBzd2l0Y2g6ICAgcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApLFxuICB1dGlsaXRpZXM6cmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApXG59XG5cbmxpYnJhcnkuZ2VuLmxpYiA9IGxpYnJhcnlcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJyYXJ5XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbHQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoICR7aW5wdXRzWzBdfSA8ICR7aW5wdXRzWzFdfSA/IDEgOiAwICApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBsdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2x0cCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ID0gYCgke2lucHV0c1sgMCBdfSAqICggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19ICkgKWAgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqICggaW5wdXRzWzBdIDwgaW5wdXRzWzFdIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHRwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGx0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21heCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5tYXggfSlcblxuICAgICAgb3V0ID0gYGdlbi5tYXgoICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5tYXgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1heCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtYXguaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtYXhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtZW1vJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgbGV0ICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluMSA9PiB7XG4gIGxldCBtZW1vID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgbWVtby5pbnB1dHMgPSBbIGluMSBdXG4gIG1lbW8uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBtZW1vLm5hbWUgPSBgJHttZW1vLmJhc2VuYW1lfSR7bWVtby5pZH1gXG5cbiAgcmV0dXJuIG1lbW9cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGgubWluIH0pXG5cbiAgICAgIG91dCA9IGBnZW4ubWluKCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWluKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBtaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbWluLmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbWluXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbWl4JyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYWRkKCBtdWwodGhpcy5pbnB1dHNbMF0sIHN1YigxLHRoaXMuaW5wdXRzWzJdKSApLCBtdWwoIHRoaXMuaW5wdXRzWzFdLCB0aGlzLmlucHV0c1syXSApICkuZ2VuKClcblxuICAgIHJldHVybiBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIsIHQ9LjUgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgaW4yLCB0IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgbW9kID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgbW9kQXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAlIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gJSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgJSAnIFxuICAgICAgfSlcblxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbW9kXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbXRvZicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgKCAke3RoaXMudHVuaW5nfSAqIGdlbi5leHAoIC4wNTc3NjIyNjUgKiAoJHtpbnB1dHNbMF19IC0gNjkpICkgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSB0aGlzLnR1bmluZyAqIE1hdGguZXhwKCAuMDU3NzYyMjY1ICogKCBpbnB1dHNbMF0gLSA2OSkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHByb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgdHVuaW5nOjQ0MCB9XG4gIFxuICBpZiggcHJvcHMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIHByb3BzLmRlZmF1bHRzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBkZWZhdWx0cyApXG4gIHVnZW4uaW5wdXRzID0gWyB4IF1cbiAgXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggeCx5ICkgPT4ge1xuICBsZXQgbXVsID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyB4LHkgXSxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0XG5cbiAgICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgICBvdXQgPSAgYCgke2lucHV0c1swXX0gKiAke2lucHV0c1sxXX0pYFxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9IHBhcnNlRmxvYXQoIGlucHV0c1swXSApICogcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbXVsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbm9pc2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0XG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ25vaXNlJyA6IE1hdGgucmFuZG9tIH0pXG5cbiAgICBvdXQgPSBgZ2VuLm5vaXNlKClgXG5cbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IG5vaXNlID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHJldHVybiBub2lzZVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vdCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19ID09PSAwID8gMSA6IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gIWlucHV0c1swXSA9PT0gMCA/IDEgOiAwXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm90ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG5vdC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBub3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGdlbigpIHtcbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcy52YWx1ZSB9KSBcbiAgICByZXR1cm4gJ2dlbi4nICsgdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBwcm9wTmFtZSwgdmFsdWUgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHVnZW4ubmFtZSA9IHByb3BOYW1lXG4gIHVnZW4udmFsdWUgPSB2YWx1ZVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BlZWsnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQsIGZ1bmN0aW9uQm9keSwgbmV4dCwgbGVuZ3RoSXNMb2cyXG4gICAgXG4gICAgdGhpcy5kYXRhLmdlbigpXG4gICAgbGVuZ3RoSXNMb2cyID0gKE1hdGgubG9nMiggdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKSB8IDApICA9PT0gTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApXG5cbiAgICAvL2NvbnNvbGUubG9nKCBcIkxFTkdUSCBJUyBMT0cyXCIsIGxlbmd0aElzTG9nMiwgdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKVxuXG4gICAgZnVuY3Rpb25Cb2R5ID0gYCAgbGV0ICR7dGhpcy5uYW1lfV9kYXRhICA9IGdlbi5kYXRhLiR7dGhpcy5kYXRhTmFtZX0uYnVmZmVyLFxuICAgICAgJHt0aGlzLm5hbWV9X3BoYXNlID0gJHt0aGlzLm1vZGUgPT09ICdzYW1wbGVzJyA/IGlucHV0c1swXSA6IGlucHV0c1swXSArICcgKiAnICsgdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggfSwgXG4gICAgICAke3RoaXMubmFtZX1faW5kZXggPSAke3RoaXMubmFtZX1fcGhhc2UgfCAwLFxcbmBcblxuICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgPyBcbiAgICAgIGAoICR7dGhpcy5uYW1lfV9pbmRleCArIDEgKSAmICgke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSAtIDEpYCA6XG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSA/ICR7dGhpcy5uYW1lfV9pbmRleCArIDEgLSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG5cbiAgaWYoIHRoaXMuaW50ZXJwID09PSAnbGluZWFyJyApIHsgICAgICBcbiAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9mcmFjICA9ICR7dGhpcy5uYW1lfV9waGFzZSAtICR7dGhpcy5uYW1lfV9pbmRleCxcbiAgICAgICR7dGhpcy5uYW1lfV9iYXNlICA9ICR7dGhpcy5uYW1lfV9kYXRhWyAke3RoaXMubmFtZX1faW5kZXggXSxcbiAgICAgICR7dGhpcy5uYW1lfV9uZXh0ICA9ICR7bmV4dH0sICAgICBcbiAgICAgICR7dGhpcy5uYW1lfV9vdXQgICA9ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoICR7dGhpcy5uYW1lfV9kYXRhWyAke3RoaXMubmFtZX1fbmV4dCBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKVxcblxcbmBcblxuICAgIH1lbHNle1xuICAgICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fb3V0ID0gJHt0aGlzLm5hbWV9X2RhdGFbICR7dGhpcy5uYW1lfV9pbmRleCBdXFxuXFxuYFxuICAgIH1cbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSsnX291dCcsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBkYXRhLCBpbmRleCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGNoYW5uZWxzOjEsIG1vZGU6J3BoYXNlJywgaW50ZXJwOidsaW5lYXInIH0gXG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGRhdGEsXG4gICAgZGF0YU5hbWU6ICAgZGF0YS5uYW1lLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluZGV4IF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGhhc29yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBhY2N1bSggbXVsKCBpbnB1dHNbMF0sIDEvNDQxMDAgKSwgaW5wdXRzWzFdICkuZ2VuKClcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFswXVxuXG4gICAgcmV0dXJuIG91dFxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT0xLCByZXNldD0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGZyZXF1ZW5jeSxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgZnJlcXVlbmN5LCByZXNldCBdLFxuICAgIHByb3BlcnRpZXM6IFsgJ2ZyZXF1ZW5jeScsJ3Jlc2V0JyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBtdWwgID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG9rZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBkYXRhTmFtZSA9ICdnZW4uZGF0YS4nICsgdGhpcy5kYXRhTmFtZSArICcuYnVmZmVyJyxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBpZHgsIG91dCwgd3JhcHBlZFxuXG4gICAgLy93cmFwcGVkID0gd3JhcCggdGhpcy5pbnB1dHNbMV0sIDAsIHRoaXMuZGF0YUxlbmd0aCApLmdlbigpXG4gICAgLy9pZHggPSB3cmFwcGVkWzBdXG4gICAgLy9nZW4uZnVuY3Rpb25Cb2R5ICs9IHdyYXBwZWRbMV1cbiAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGAgICR7ZGF0YU5hbWV9WyR7aW5wdXRzWzFdfV0gPSAke2lucHV0c1swXX1cXG5cXG5gXG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gKCBkYXRhLCB2YWx1ZSwgaW5kZXgsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjaGFubmVsczoxIH0gXG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGRhdGEsXG4gICAgZGF0YU5hbWU6ICAgZGF0YS5uYW1lLFxuICAgIGRhdGFMZW5ndGg6IGRhdGEuYnVmZmVyLmxlbmd0aCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyB2YWx1ZSwgaW5kZXggXSxcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgICBkZWx0YSAgID0gcmVxdWlyZSggJy4vZGVsdGEuanMnICksXG4gICAgd3JhcCAgICA9IHJlcXVpcmUoICcuL3dyYXAuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncmF0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHBoYXNlICA9IGhpc3RvcnkoKSxcbiAgICAgICAgaW5NaW51czEgPSBoaXN0b3J5KCksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZpbHRlciwgc3VtLCBvdXRcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgb3V0ID0gXG5gIGxldCAke3RoaXMubmFtZX1fZGlmZiA9ICR7aW5wdXRzWzBdfSAtICR7Z2VuTmFtZX0ubGFzdFNhbXBsZVxuICBpZiggJHt0aGlzLm5hbWV9X2RpZmYgPCAtLjUgKSAke3RoaXMubmFtZX1fZGlmZiArPSAxXG4gICR7Z2VuTmFtZX0ucGhhc2UgKz0gJHt0aGlzLm5hbWV9X2RpZmYgKiAke2lucHV0c1sxXX1cbiAgaWYoICR7Z2VuTmFtZX0ucGhhc2UgPiAxICkgJHtnZW5OYW1lfS5waGFzZSAtPSAxXG4gICR7Z2VuTmFtZX0ubGFzdFNhbXBsZSA9ICR7aW5wdXRzWzBdfVxuYFxuICAgIG91dCA9ICcgJyArIG91dFxuXG4gICAgcmV0dXJuIFsgZ2VuTmFtZSArICcucGhhc2UnLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHJhdGUgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgcGhhc2U6ICAgICAgMCxcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSwgcmF0ZSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J3JvdW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGgucm91bmQgfSlcblxuICAgICAgb3V0ID0gYGdlbi5yb3VuZCggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5yb3VuZCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHJvdW5kID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHJvdW5kLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIHJvdW5kXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2FoJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBnZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSAwXG4gICAgZ2VuLmRhdGFbIHRoaXMubmFtZSArICdfY29udHJvbCcgXSA9IDBcblxuICAgIG91dCA9IFxuYCBsZXQgJHt0aGlzLm5hbWV9ID0gZ2VuLmRhdGEuJHt0aGlzLm5hbWV9X2NvbnRyb2wsXG4gICAgICAke3RoaXMubmFtZX1fdHJpZ2dlciA9ICR7aW5wdXRzWzFdfSA+ICR7aW5wdXRzWzJdfSA/IDEgOiAwXG5cbiAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyICE9PSAke3RoaXMubmFtZX0gICkge1xuICAgIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciA9PT0gMSApIFxuICAgICAgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XG4gICAgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9X2NvbnRyb2wgPSAke3RoaXMubmFtZX1fdHJpZ2dlclxuICB9XG5gXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgK291dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgY29udHJvbCwgdGhyZXNob2xkPTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0OjAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSwgY29udHJvbCx0aHJlc2hvbGQgXSxcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J3NpZ24nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5zaWduIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uc2lnbiggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5zaWduKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2lnbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBzaWduLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIHNpZ25cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2luJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnc2luJzogTWF0aC5zaW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5zaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBzaW4uaW5wdXRzID0gWyB4IF1cbiAgc2luLmlkID0gZ2VuLmdldFVJRCgpXG4gIHNpbi5uYW1lID0gYCR7c2luLmJhc2VuYW1lfXtzaW4uaWR9YFxuXG4gIHJldHVybiBzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzbGlkZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHkxICAgICA9IGhpc3RvcnkoKSxcbiAgICAgICAgZmlsdGVyXG5cbiAgICBmaWx0ZXIgPSBtZW1vKCBhZGQoIHkxLm91dCwgZGl2KCBzdWIoIGlucHV0c1swXSwgeTEub3V0ICksIGlucHV0c1sxXSApICkgKVxuICAgIHkxLmluKCBmaWx0ZXIgKS5nZW4oKVxuXG4gICAgcmV0dXJuIGZpbHRlci5uYW1lXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBzbGlkZVVwID0gMSwgc2xpZGVEb3duID0gMSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIHNsaWRlVXAsIHNsaWRlRG93biBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IHN1YiA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgICAgbmVlZHNQYXJlbnMgPSBmYWxzZSwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgc3ViQXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAtIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgICAgfSlcbiAgICBcbiAgICAgIGlmKCBuZWVkc1BhcmVucyApIHtcbiAgICAgICAgb3V0ICs9ICcpJ1xuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9IG91dC5zbGljZSggMSApIC8vIHJlbW92ZSBvcGVuaW5nIHBhcmVuXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBzdWJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N3aXRjaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuICAgIFxuICAgIG91dCA9IGAgIGxldCAke3RoaXMubmFtZX1fb3V0ID0gJHtpbnB1dHNbMF19ID09PSAxID8gJHtpbnB1dHNbMV19IDogJHtpbnB1dHNbMl19YFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfV9vdXRgXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9X291dGAsIG91dCBdXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGNvbnRyb2wsIGluMSA9IDEsIGluMiA9IDAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBjb250cm9sLCBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J3Q2MCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbICdleHAnIF06IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uZXhwKCAtNi45MDc3NTUyNzg5MjEgLyAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gaW5wdXRzWzBdIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0NjAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdDYwLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIHQ2MFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0YW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICd0YW4nOiBNYXRoLnRhbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnRhbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgudGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbi5pbnB1dHMgPSBbIHggXVxuICB0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgdGFuLm5hbWUgPSBgJHt0YW4uYmFzZW5hbWV9e3Rhbi5pZH1gXG5cbiAgcmV0dXJuIHRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGx0ICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBwaGFzb3IgID0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RyYWluJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ3JhcGggPSBsdCggYWNjdW0oIGRpdiggaW5wdXRzWzBdLCA0NDEwMCApICksIGlucHV0c1sxXSApXG4gICAgXG4gICAgcmV0dXJuIGdyYXBoLmdlbigpXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggcGVyaW9kPTQ0MCwgcHVsc2V3aWR0aD0uNSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBwZXJpb2QsIHB1bHNld2lkdGggXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnIClcblxubGV0IGlzU3RlcmVvID0gZmFsc2VcblxubGV0IHV0aWxpdGllcyA9IHtcbiAgY3R4OiBudWxsLFxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuY2FsbGJhY2sgPSAoKSA9PiAwXG4gICAgY29uc29sZS5sb2coIHRoaXMuY2xlYXIuY2FsbGJhY2tzIClcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5mb3JFYWNoKCB2ID0+IHYoKSApXG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MubGVuZ3RoID0gMFxuICB9LFxuXG4gIGNyZWF0ZUNvbnRleHQoKSB7XG4gICAgdGhpcy5jdHggPSBuZXcgKCBBdWRpb0NvbnRleHQgfHwgd2Via2l0QXVkaW9Db250ZXh0ICkoKVxuICAgIGdlbi5zYW1wbGVyYXRlID0gdGhpcy5jdHguc2FtcGxlcmF0ZVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICBjcmVhdGVTY3JpcHRQcm9jZXNzb3IoKSB7XG4gICAgdGhpcy5ub2RlID0gdGhpcy5jdHguY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCAyNTYsIDAsIDIgKSxcbiAgICB0aGlzLmNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfSxcbiAgICB0aGlzLmNhbGxiYWNrID0gdGhpcy5jbGVhckZ1bmN0aW9uXG5cbiAgICB0aGlzLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiggYXVkaW9Qcm9jZXNzaW5nRXZlbnQgKSB7XG4gICAgICB2YXIgb3V0cHV0QnVmZmVyID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQub3V0cHV0QnVmZmVyO1xuXG4gICAgICB2YXIgbGVmdCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMCApLFxuICAgICAgICAgIHJpZ2h0PSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDEgKVxuXG4gICAgICBmb3IgKHZhciBzYW1wbGUgPSAwOyBzYW1wbGUgPCBsZWZ0Lmxlbmd0aDsgc2FtcGxlKyspIHtcbiAgICAgICAgaWYoICFpc1N0ZXJlbyApIHtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgXSA9IHJpZ2h0WyBzYW1wbGUgXSA9IHV0aWxpdGllcy5jYWxsYmFjaygpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHZhciBvdXQgPSB1dGlsaXRpZXMuY2FsbGJhY2soKVxuICAgICAgICAgIGxlZnRbIHNhbXBsZSAgXSA9IG91dFswXVxuICAgICAgICAgIHJpZ2h0WyBzYW1wbGUgXSA9IG91dFsxXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ub2RlLmNvbm5lY3QoIHRoaXMuY3R4LmRlc3RpbmF0aW9uIClcblxuICAgIC8vdGhpcy5ub2RlLmNvbm5lY3QoIHRoaXMuYW5hbHl6ZXIgKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgXG4gIHBsYXlHcmFwaCggZ3JhcGgsIGRlYnVnICkge1xuICAgIGlmKCBkZWJ1ZyA9PT0gdW5kZWZpbmVkICkgZGVidWcgPSBmYWxzZVxuICAgICAgICAgIFxuICAgIGlzU3RlcmVvID0gQXJyYXkuaXNBcnJheSggZ3JhcGggKVxuXG4gICAgdXRpbGl0aWVzLmNhbGxiYWNrID0gZ2VuLmNyZWF0ZUNhbGxiYWNrKCBncmFwaCwgZGVidWcgKVxuICAgIFxuICAgIGlmKCB1dGlsaXRpZXMuY29uc29sZSApIHV0aWxpdGllcy5jb25zb2xlLnNldFZhbHVlKCB1dGlsaXRpZXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG5cbiAgICByZXR1cm4gdXRpbGl0aWVzLmNhbGxiYWNrXG4gIH0sXG5cbiAgbG9hZFNhbXBsZSggc291bmRGaWxlUGF0aCwgZGF0YSApIHtcbiAgICBsZXQgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICByZXEub3BlbiggJ0dFVCcsIHNvdW5kRmlsZVBhdGgsIHRydWUgKVxuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInIFxuICAgIFxuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLHJlamVjdCkgPT4ge1xuICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXVkaW9EYXRhID0gcmVxLnJlc3BvbnNlXG5cbiAgICAgICAgdXRpbGl0aWVzLmN0eC5kZWNvZGVBdWRpb0RhdGEoIGF1ZGlvRGF0YSwgKGJ1ZmZlcikgPT4ge1xuICAgICAgICAgIGRhdGEuYnVmZmVyID0gYnVmZmVyLmdldENoYW5uZWxEYXRhKDApXG4gICAgICAgICAgcmVzb2x2ZSggZGF0YS5idWZmZXIgKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXEuc2VuZCgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbn1cblxudXRpbGl0aWVzLmNsZWFyLmNhbGxiYWNrcyA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbGl0aWVzXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3dyYXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBzaWduYWwgPSBpbnB1dHNbMF0sIG1pbiA9IGlucHV0c1sxXSwgbWF4ID0gaW5wdXRzWzJdLFxuICAgICAgICBvdXRcblxuICAgIC8vb3V0ID0gYCgoKCR7aW5wdXRzWzBdfSAtICR7dGhpcy5taW59KSAlICR7ZGlmZn0gICsgJHtkaWZmfSkgJSAke2RpZmZ9ICsgJHt0aGlzLm1pbn0pYFxuICAgIC8vY29uc3QgbG9uZyBudW1XcmFwcyA9IGxvbmcoKHYtbG8pL3JhbmdlKSAtICh2IDwgbG8pO1xuICAgIC8vcmV0dXJuIHYgLSByYW5nZSAqIGRvdWJsZShudW1XcmFwcyk7ICAgXG4gICAgXG4gICAgb3V0ID1gICBsZXQgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XG4gIGlmKCAke3RoaXMubmFtZX0gPCAke3RoaXMubWlufSApICR7dGhpcy5uYW1lfSArPSAke3RoaXMubWF4fSAtICR7dGhpcy5taW59XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA+ICR7dGhpcy5tYXh9ICkgJHt0aGlzLm5hbWV9IC09ICR7dGhpcy5tYXh9IC0gJHt0aGlzLm1pbn1cXG5cXG5gXG5cbi8vYCBsZXQgJHt0aGlzLm5hbWV9ID0gJHtzaWduYWx9XG4vLyAgaWYoICR7dGhpcy5uYW1lfSA8ICR7bWlufSB8fCAke3RoaXMubmFtZX0gPiAke21heH0gKSB7XG4vLyAgICBsZXQgZGlmZiA9ICR7bWF4fSAtICR7bWlufVxuLy8gICAgJHt0aGlzLm5hbWV9IC09IGRpZmZcbi8vICAgIC8vbGV0IG51bVdyYXBzID0gKCggJHtzaWduYWx9IC0gJHttaW59ICkgLyBkaWZmICkgfCAwXG4vLyAgICAvLyR7dGhpcy5uYW1lfSA9ICR7dGhpcy5uYW1lfSAtIGRpZmYgKiBudW1XcmFwc1xuLy8gIH1cbi8vYFxuLy8gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA+ICR7bWF4fSApICR7dGhpcy5uYW1lfSAtPSAke21heH0gLSAke2lufVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCAnICcgKyBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgbWluLCBtYXggXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiJdfQ==
