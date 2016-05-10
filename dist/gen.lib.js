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

},{"./floor.js":18,"./gen.js":21,"./memo.js":28,"./sub.js":46}],10:[function(require,module,exports){
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

},{"./data.js":13,"./gen.js":21,"./mul.js":33,"./peek.js":37,"./phasor.js":38}],13:[function(require,module,exports){
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

},{"./gen.js":21,"./utilities.js":50}],14:[function(require,module,exports){
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

},{"./add.js":4,"./gen.js":21,"./history.js":23,"./memo.js":28,"./mul.js":33,"./sub.js":46}],15:[function(require,module,exports){
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

},{"./accum.js":2,"./data.js":13,"./gen.js":21,"./poke.js":39,"./wrap.js":51}],16:[function(require,module,exports){
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

},{"./gen.js":21,"./history.js":23,"./sub.js":46}],17:[function(require,module,exports){
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

},{"./gen.js":21}],24:[function(require,module,exports){
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

},{"./gen.js":21}],25:[function(require,module,exports){
'use strict';

var library = {
  export: function _export(destination) {
    destination.ssd = library.history; // history is window object property, so use ssd as alias
    destination.input = library.in; // in is a keyword in javascript

    delete library.history;
    delete library.in;

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
  utilities: require('./utilities.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./add.js":4,"./asin.js":5,"./atan.js":6,"./bool.js":7,"./ceil.js":8,"./clamp.js":9,"./cos.js":10,"./counter.js":11,"./cycle.js":12,"./data.js":13,"./dcblock.js":14,"./delay.js":15,"./delta.js":16,"./div.js":17,"./floor.js":18,"./fold.js":19,"./gate.js":20,"./gen.js":21,"./gt.js":22,"./history.js":23,"./in.js":24,"./lt.js":26,"./max.js":27,"./memo.js":28,"./min.js":29,"./mix.js":30,"./mod.js":31,"./mtof.js":32,"./mul.js":33,"./noise.js":34,"./not.js":35,"./param.js":36,"./peek.js":37,"./phasor.js":38,"./poke.js":39,"./rate.js":40,"./round.js":41,"./sah.js":42,"./sign.js":43,"./sin.js":44,"./slide.js":45,"./sub.js":46,"./t60.js":47,"./tan.js":48,"./train.js":49,"./utilities.js":50,"./wrap.js":51}],26:[function(require,module,exports){
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

},{"./gen.js":21}],27:[function(require,module,exports){
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

},{"./gen.js":21}],28:[function(require,module,exports){
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

},{"./gen.js":21}],29:[function(require,module,exports){
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

},{"./gen.js":21}],30:[function(require,module,exports){
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

},{"./add.js":4,"./gen.js":21,"./mul.js":33,"./sub.js":46}],31:[function(require,module,exports){
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

},{"./gen.js":21}],32:[function(require,module,exports){
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

},{"./gen.js":21}],33:[function(require,module,exports){
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

},{"./gen.js":21}],34:[function(require,module,exports){
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

},{"./gen.js":21}],35:[function(require,module,exports){
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

},{"./gen.js":21}],36:[function(require,module,exports){
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

},{"./gen.js":21}],37:[function(require,module,exports){
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

},{"./gen.js":21}],38:[function(require,module,exports){
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

},{"./accum.js":2,"./gen.js":21,"./mul.js":33}],39:[function(require,module,exports){
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

},{"./gen.js":21,"./mul.js":33,"./wrap.js":51}],40:[function(require,module,exports){
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

},{"./add.js":4,"./delta.js":16,"./gen.js":21,"./history.js":23,"./memo.js":28,"./mul.js":33,"./sub.js":46,"./wrap.js":51}],41:[function(require,module,exports){
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

},{"./gen.js":21}],42:[function(require,module,exports){
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

},{"./gen.js":21}],43:[function(require,module,exports){
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

},{"./gen.js":21}],44:[function(require,module,exports){
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

},{"./gen.js":21}],45:[function(require,module,exports){
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

},{"./add.js":4,"./gen.js":21,"./history.js":23,"./memo.js":28,"./mul.js":33,"./sub.js":46}],46:[function(require,module,exports){
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

},{"./gen.js":21}],47:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 't60',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.exp));

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

},{"./gen.js":21}],48:[function(require,module,exports){
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

},{"./gen.js":21}],49:[function(require,module,exports){
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

},{"./gen.js":21,"./lt.js":26,"./phasor.js":38}],50:[function(require,module,exports){
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
  },
  createContext: function createContext() {
    this.ctx = new (AudioContext || webkitAudioContext)();
    gen.samplerate = this.ctx.samplerate;

    return this;
  },
  createScriptProcessor: function createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor(1024, 0, 2), this.clearFunction = function () {
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

module.exports = utilities;

},{"./data.js":13,"./gen.js":21}],51:[function(require,module,exports){
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

},{"./floor.js":18,"./gen.js":21,"./memo.js":28,"./sub.js":46}]},{},[25])(25)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZGQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2Jvb2wuanMiLCJqcy9jZWlsLmpzIiwianMvY2xhbXAuanMiLCJqcy9jb3MuanMiLCJqcy9jb3VudGVyLmpzIiwianMvY3ljbGUuanMiLCJqcy9kYXRhLmpzIiwianMvZGNibG9jay5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9mbG9vci5qcyIsImpzL2ZvbGQuanMiLCJqcy9nYXRlLmpzIiwianMvZ2VuLmpzIiwianMvZ3QuanMiLCJqcy9oaXN0b3J5LmpzIiwianMvaW4uanMiLCJqcy9pbmRleC5qcyIsImpzL2x0LmpzIiwianMvbWF4LmpzIiwianMvbWVtby5qcyIsImpzL21pbi5qcyIsImpzL21peC5qcyIsImpzL21vZC5qcyIsImpzL210b2YuanMiLCJqcy9tdWwuanMiLCJqcy9ub2lzZS5qcyIsImpzL25vdC5qcyIsImpzL3BhcmFtLmpzIiwianMvcGVlay5qcyIsImpzL3BoYXNvci5qcyIsImpzL3Bva2UuanMiLCJqcy9yYXRlLmpzIiwianMvcm91bmQuanMiLCJqcy9zYWguanMiLCJqcy9zaWduLmpzIiwianMvc2luLmpzIiwianMvc2xpZGUuanMiLCJqcy9zdWIuanMiLCJqcy90NjAuanMiLCJqcy90YW4uanMiLCJqcy90cmFpbi5qcyIsImpzL3V0aWxpdGllcy5qcyIsImpzL3dyYXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixRQUFLLEtBQUw7O0FBRUEsc0JBQU07QUFDSixRQUFJLFlBQUo7UUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVCxDQUZBOztB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R0FBbUIsUUFBUSxLQUFSLENBUkM7R0FEVjs7O0FBWVosT0FBVSxRQUFTLFVBQVQsQ0FBVjs7QUFFQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFdBQVUsUUFBUyxjQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxVQUFVLFFBQVMsYUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsV0FBVSxRQUFTLGNBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFdBQVUsUUFBUyxjQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxD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O01BQVgsNERBQUksaUJBQU87O0FBQ3hDLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVAsQ0FEb0M7O0FBR3hDLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsWUFEbUI7QUFFbkIsWUFGbUI7QUFHbkIsU0FBUSxLQUFJLE1BQUosRUFBUjtBQUNBLFlBQVEsQ0FBRSxHQUFGLEVBQU8sR0FBUCxFQUFZLEdBQVosQ0FBUjtHQUpGLEVBSHdDOztBQVV4QyxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQUwsR0FBZ0IsS0FBSyxHQUFMLENBVlM7O0FBWXhDLFNBQU8sSUFBUCxDQVp3QztDQUF6QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonYWJzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguYWJzIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWJzKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFicyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFicyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhYnMuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gYWJzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FjY3VtJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0gKVxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgIFxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9yZXNldCApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwXG4gICAgXG4gICAgLyogdGhyZWUgZGlmZmVyZW50IG1ldGhvZHMgb2Ygd3JhcHBpbmcsIHRoaXJkIGlzIG1vc3QgZXhwZW5zaXZlOlxuICAgICAqXG4gICAgICogMTogcmFuZ2UgezAsMX06IHkgPSB4IC0gKHggfCAwKVxuICAgICAqIDI6IGxvZzIodGhpcy5tYXgpID09IGludGVnZXI6IHkgPSB4ICYgKHRoaXMubWF4IC0gMSlcbiAgICAgKiAzOiBhbGwgb3RoZXJzOiBpZiggeCA+PSB0aGlzLm1heCApIHkgPSB0aGlzLm1heCAteFxuICAgICAqXG4gICAgICovXG5cbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzFdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1sxXSA8IDEpICkgeyBcbiAgICAgIG91dCArPSAnICBpZiggJytfcmVzZXQrJz49MSApICcrX25hbWUrJy52YWx1ZSA9ICcgKyB0aGlzLm1pbiArICdcXG4nXG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIGxldCAke3RoaXMubmFtZX1fdmFsdWUgPSAke19uYW1lfS52YWx1ZTtcXG4gICR7X25hbWV9LnZhbHVlICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgXG4gICAgaWYoIHRoaXMubWluID09PSAwICYmIHRoaXMubWF4ID09PSAxICkgeyBcbiAgICAgIHdyYXAgPSAgYCAgJHtfbmFtZX0udmFsdWUgPSAke19uYW1lfS52YWx1ZSAtICgke19uYW1lfS52YWx1ZSB8IDApXFxuXFxuYFxuICAgIH0gZWxzZSBpZiggdGhpcy5taW4gPT09IDAgJiYgKCBNYXRoLmxvZzIoIHRoaXMubWF4ICkgfCAwICkgPT09IE1hdGgubG9nMiggdGhpcy5tYXggKSApIHtcbiAgICAgIHdyYXAgPSAgYCAgJHtfbmFtZX0udmFsdWUgPSAke19uYW1lfS52YWx1ZSAmICgke3RoaXMubWF4fSAtIDEpXFxuXFxuYFxuICAgIH0gZWxzZSB7XG4gICAgICB3cmFwID0gYCAgaWYoICR7X25hbWV9LnZhbHVlID49ICR7dGhpcy5tYXh9ICkgJHtfbmFtZX0udmFsdWUgLT0gJHtkaWZmfVxcblxcbmBcbiAgICB9XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwXG5cbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluY3IsIHJlc2V0PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBtaW46MCwgbWF4OjEgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgaWYoIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSA9PT0gdW5kZWZpbmVkICkgZGVmYXVsdHMuaW5pdGlhbFZhbHVlID0gZGVmYXVsdHMubWluXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW46IGRlZmF1bHRzLm1pbiwgXG4gICAgbWF4OiBkZWZhdWx0cy5tYXgsXG4gICAgdmFsdWU6ICBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIHJlc2V0IF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Fjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhY29zJzogTWF0aC5hY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWNvcyggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWNvcy5pbnB1dHMgPSBbIHggXVxuICBhY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFjb3MubmFtZSA9IGAke2Fjb3MuYmFzZW5hbWV9e2Fjb3MuaWR9YFxuXG4gIHJldHVybiBhY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgYWRkID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBzdW0gPSAwLCBudW1Db3VudCA9IDAsIGFkZGVyQXRFbmQgPSBmYWxzZSwgYWxyZWFkeUZ1bGxTdW1tZWQgPSB0cnVlXG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICAgIG91dCArPSB2XG4gICAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgICAgYWRkZXJBdEVuZCA9IHRydWVcbiAgICAgICAgICAgIG91dCArPSAnICsgJ1xuICAgICAgICAgIH1cbiAgICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgICBudW1Db3VudCsrXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBcbiAgICAgIGlmKCBhbHJlYWR5RnVsbFN1bW1lZCApIG91dCA9ICcnXG5cbiAgICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICAgIG91dCArPSBhZGRlckF0RW5kIHx8IGFscmVhZHlGdWxsU3VtbWVkID8gc3VtIDogJyArICcgKyBzdW1cbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYoICFhbHJlYWR5RnVsbFN1bW1lZCApIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIGFkZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhc2luJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYXNpbic6IE1hdGguYXNpbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFzaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFzaW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFzaW4uaW5wdXRzID0gWyB4IF1cbiAgYXNpbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhc2luLm5hbWUgPSBgJHthc2luLmJhc2VuYW1lfXthc2luLmlkfWBcblxuICByZXR1cm4gYXNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhdGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYXRhbic6IE1hdGguYXRhbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmF0YW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmF0YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGF0YW4uaW5wdXRzID0gWyB4IF1cbiAgYXRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhdGFuLm5hbWUgPSBgJHthdGFuLmJhc2VuYW1lfXthdGFuLmlkfWBcblxuICByZXR1cm4gYXRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYm9vbCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gYCR7aW5wdXRzWzBdfSA9PT0gMCA/IDAgOiAxYFxuICAgIFxuICAgIC8vZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIC8vcmV0dXJuIFsgYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWAsICcgJyArb3V0IF1cbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2NlaWwnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5jZWlsIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uY2VpbCggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jZWlsKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgY2VpbCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBjZWlsLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGNlaWxcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZmxvb3I9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY2xpcCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dFxuXG4gICAgb3V0ID1cblxuYCBsZXQgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XG4gIGlmKCAke3RoaXMubmFtZX0gPiAke2lucHV0c1syXX0gKSAke3RoaXMubmFtZX0gPSAke2lucHV0c1syXX1cbiAgZWxzZSBpZiggJHt0aGlzLm5hbWV9IDwgJHtpbnB1dHNbMV19ICkgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMV19XG5gXG4gICAgb3V0ID0gJyAnICsgb3V0XG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0tMSwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgbWluLCBtYXggXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY29zJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnY29zJzogTWF0aC5jb3MgfSlcblxuICAgICAgb3V0ID0gYGdlbi5jb3MoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBjb3MuaW5wdXRzID0gWyB4IF1cbiAgY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGNvcy5uYW1lID0gYCR7Y29zLmJhc2VuYW1lfXtjb3MuaWR9YFxuXG4gIHJldHVybiBjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY291bnRlcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keSA9IHRoaXMuY2FsbGJhY2soIGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdLCBpbnB1dHNbMl0sIGlucHV0c1szXSApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG4gICAgXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgY2FsbGJhY2soIF9uYW1lLCBfaW5jciwgX21pbiwgX21heCwgX3Jlc2V0ICkge1xuICAgIGxldCBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJ1xuICAgIFxuICAgIC8qIHRocmVlIGRpZmZlcmVudCBtZXRob2RzIG9mIHdyYXBwaW5nLCB0aGlyZCBpcyBtb3N0IGV4cGVuc2l2ZTpcbiAgICAgKlxuICAgICAqIDE6IHJhbmdlIHswLDF9OiB5ID0geCAtICh4IHwgMClcbiAgICAgKiAyOiBsb2cyKHRoaXMubWF4KSA9PSBpbnRlZ2VyOiB5ID0geCAmICh0aGlzLm1heCAtIDEpXG4gICAgICogMzogYWxsIG90aGVyczogaWYoIHggPj0gdGhpcy5tYXggKSB5ID0gdGhpcy5tYXggLXhcbiAgICAgKlxuICAgICAqL1xuXG4gICAgLy8gbXVzdCBjaGVjayBmb3IgcmVzZXQgYmVmb3JlIHN0b3JpbmcgdmFsdWUgZm9yIG91dHB1dFxuICAgIGlmKCAhKHR5cGVvZiB0aGlzLmlucHV0c1szXSA9PT0gJ251bWJlcicgJiYgdGhpcy5pbnB1dHNbM10gPCAxKSApIHsgXG4gICAgICBvdXQgKz0gJyAgaWYoICcrX3Jlc2V0Kyc+PTEgKSAnK19uYW1lKycudmFsdWUgPSAnICsgX21pbiArICdcXG4nXG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIGxldCAke3RoaXMubmFtZX1fdmFsdWUgPSAke19uYW1lfS52YWx1ZTtcXG4gICR7X25hbWV9LnZhbHVlICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgXG4gICAgaWYoIHRoaXMubWluID09PSAwICYmIHRoaXMubWF4ID09PSAxICkgeyBcbiAgICAgIHdyYXAgPSAgYCAgJHtfbmFtZX0udmFsdWUgPSAke19uYW1lfS52YWx1ZSAtICgke19uYW1lfS52YWx1ZSB8IDApXFxuXFxuYFxuICAgIH0gZWxzZSBpZiggdGhpcy5taW4gPT09IDAgJiYgKCBNYXRoLmxvZzIoIHRoaXMubWF4ICkgfCAwICkgPT09IE1hdGgubG9nMiggdGhpcy5tYXggKSApIHtcbiAgICAgIHdyYXAgPSAgYCAgJHtfbmFtZX0udmFsdWUgPSAke19uYW1lfS52YWx1ZSAmICgke3RoaXMubWF4fSAtIDEpXFxuXFxuYFxuICAgIH0gZWxzZSBpZiggdHlwZW9mIHRoaXMubWF4ID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgdGhpcy5taW4gPT09ICdudW1iZXInICkge1xuICAgICAgd3JhcCA9IGAgIGlmKCAke19uYW1lfS52YWx1ZSA+PSAke3RoaXMubWF4fSApICR7X25hbWV9LnZhbHVlIC09ICR7ZGlmZn1cXG5cXG5gXG4gICAgfWVsc2UgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSApIHtcbiAgICAgIHdyYXAgPSBcbmAgIGlmKCAke19uYW1lfS52YWx1ZSA+PSAke19tYXh9ICkgJHtfbmFtZX0udmFsdWUgLT0gJHtfbWF4fSAtICR7X21pbn1cbiAgZWxzZSBpZiggJHtfbmFtZX0udmFsdWUgPCAke19taW59ICkgJHtfbmFtZX0udmFsdWUgKz0gJHtfbWF4fSAtICR7X21pbn1cXG5cXG5gXG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyLCBtaW49MCwgbWF4PUluZmluaXR5LCByZXNldD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdGlhbFZhbHVlOiAwIH1cblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluOiAgICBtaW4sIFxuICAgIG1heDogICAgbWF4LFxuICAgIHZhbHVlOiAgZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbmNyLCBtaW4sIG1heCwgcmVzZXQgXSxcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcbiAgcmV0dXJuIHVnZW5cbn0gXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL3BoYXNvci5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHBoYXNvcj1yZXF1aXJlKCAnLi9waGFzb3IuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjeWNsZScsXG4gIHRhYmxlOm51bGwsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuICAgIFxuICAgIG91dCA9IHBlZWsoIHByb3RvLnRhYmxlLCBwaGFzb3IoIGlucHV0c1swXSApICkuZ2VuKClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBvdXRbMF1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH0sXG5cbiAgaW5pdFRhYmxlKCkge1xuICAgIHRoaXMudGFibGUgPSBkYXRhKCAxMDI0IClcblxuICAgIGZvciggbGV0IGkgPSAwLCBsID0gdGhpcy50YWJsZS5idWZmZXIubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xuICAgICAgdGhpcy50YWJsZS5idWZmZXJbIGkgXSA9IE1hdGguc2luKCAoIGkgLyBsICkgKiAoIE1hdGguUEkgKiAyICkgKVxuICAgIH1cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgaWYoIHByb3RvLnRhYmxlID09PSBudWxsICkgcHJvdG8uaW5pdFRhYmxlKCkgXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBmcmVxdWVuY3ksXG4gICAgcmVzZXQsXG4gICAgdGFibGU6ICAgICAgcHJvdG8udGFibGUsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgZnJlcXVlbmN5LCByZXNldCBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICB1dGlsaXRpZXMgPSByZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGF0YScsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IHRoaXNcbiAgICByZXR1cm4gJ2dlbi5kYXRhLicgKyB0aGlzLm5hbWUgKyAnLmJ1ZmZlcidcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHk9MSApID0+IHtcbiAgbGV0IHVnZW4sIGJ1ZmZlciwgc2hvdWxkTG9hZCA9IGZhbHNlXG4gICAgXG4gIGlmKCB0eXBlb2YgeCA9PT0gJ251bWJlcicgKSB7XG4gICAgaWYoIHkgIT09IDEgKSB7XG4gICAgICBidWZmZXIgPSBbXVxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB5OyBpKysgKSB7XG4gICAgICAgIGJ1ZmZlclsgaSBdID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCB4IClcbiAgICB9XG4gIH1lbHNlIGlmKCBBcnJheS5pc0FycmF5KCB4ICkgKSB7IC8vISAoeCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSApICkge1xuICAgIGxldCBzaXplID0geC5sZW5ndGhcbiAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBzaXplIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IHhbIGkgXVxuICAgIH1cbiAgfWVsc2UgaWYoIHR5cGVvZiB4ID09PSAnc3RyaW5nJyApIHtcbiAgICBidWZmZXIgPSBbIDAgXVxuICAgIHNob3VsZExvYWQgPSB0cnVlXG4gIH1lbHNle1xuICAgIGJ1ZmZlciA9IHhcbiAgfVxuXG4gIHVnZW4gPSB7IFxuICAgIGJ1ZmZlcixcbiAgICBuYW1lOiBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKSxcbiAgICBkaW06IHkgPT09IDEgPyBidWZmZXIubGVuZ3RoIDogeCxcbiAgICBjaGFubmVscyA6IDEsXG4gICAgZ2VuOiAgcHJvdG8uZ2VuLFxuICAgIG9ubG9hZDogbnVsbCxcbiAgICB0aGVuKCBmbmMgKSB7XG4gICAgICB1Z2VuLm9ubG9hZCA9IGZuY1xuICAgICAgcmV0dXJuIHVnZW5cbiAgICB9LFxuICB9XG4gIFxuICAvL2dlbi5kYXRhWyB1Z2VuLm5hbWUgXSA9IHVnZW5cblxuICBpZiggc2hvdWxkTG9hZCApIHtcbiAgICBsZXQgcHJvbWlzZSA9IHV0aWxpdGllcy5sb2FkU2FtcGxlKCB4LCB1Z2VuIClcbiAgICBwcm9taXNlLnRoZW4oICgpPT4geyB1Z2VuLm9ubG9hZCgpIH0pXG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RjYmxvY2snLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICB4MSAgICAgPSBoaXN0b3J5KCksXG4gICAgICAgIHkxICAgICA9IGhpc3RvcnkoKSxcbiAgICAgICAgZmlsdGVyXG5cbiAgICAvL0hpc3RvcnkgeDEsIHkxOyB5ID0gaW4xIC0geDEgKyB5MSowLjk5OTc7IHgxID0gaW4xOyB5MSA9IHk7IG91dDEgPSB5O1xuICAgIGZpbHRlciA9IG1lbW8oIGFkZCggc3ViKCBpbnB1dHNbMF0sIHgxLm91dCApLCBtdWwoIHkxLm91dCwgLjk5OTcgKSApIClcbiAgICB4MS5pbiggaW5wdXRzWzBdICkuZ2VuKClcbiAgICB5MS5pbiggZmlsdGVyICkuZ2VuKClcblxuICAgIHJldHVybiBmaWx0ZXIubmFtZVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcG9rZSA9IHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gICAgd3JhcCA9IHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL2FjY3VtLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGVsYXknLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSwgb3V0LCBhY2MsIHdyaXRlSWR4LCByZWFkSWR4XG4gICAgXG4gICAgd3JpdGVJZHggPSBhY2N1bSggMSwgMCwgeyBtYXg6dGhpcy5zaXplfSkgLy8gaW5pdGlhbFZhbHVlOk1hdGguZmxvb3IodGhpcy50aW1lKSB9KSBcbiAgICByZWFkSWR4ICA9IHdyYXAoIHN1Yiggd3JpdGVJZHgsIHRoaXMuaW5wdXRzWzFdICksIDAsIHRoaXMuc2l6ZSApXG5cbiAgICBwb2tlKCB0aGlzLmJ1ZmZlciwgdGhpcy5pbnB1dHNbMF0sIHdyaXRlSWR4ICkuZ2VuKClcblxuICAgIG91dCA9IHBlZWsoIHRoaXMuYnVmZmVyLCByZWFkSWR4LCB7IG1vZGU6J3NhbXBsZXMnLCBpbnRlcnA6dGhpcy5pbnRlcnAgfSkuZ2VuKClcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgdGltZT0yNTYsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBzaXplOiA1MTIsIGZlZWRiYWNrOjAsIGludGVycDonbGluZWFyJyB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdGltZSxcbiAgICBidWZmZXIgOiBkYXRhKCBkZWZhdWx0cy5zaXplICksXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgdGltZSBdLFxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkZWx0YScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG4xICAgICA9IGhpc3RvcnkoKVxuICAgIFxuICAgIG4xLmluKCBpbnB1dHNbMF0gKS5nZW4oKVxuXG4gICAgcmV0dXJuIHN1YiggaW5wdXRzWzBdLCBuMS5vdXQgKS5nZW4oKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICguLi5hcmdzKSA9PiB7XG4gIGxldCBkaXYgPSB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuKCkge1xuICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgICBvdXQ9JygnLFxuICAgICAgICAgIGRpZmYgPSAwLCBcbiAgICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1sgMCBdLFxuICAgICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTiggbGFzdE51bWJlciApLCBcbiAgICAgICAgICBkaXZBdEVuZCA9IGZhbHNlXG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICAgIGlmKCBpID09PSAwICkgcmV0dXJuXG5cbiAgICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgICAgICBpc0ZpbmFsSWR4ICAgPSBpID09PSBpbnB1dHMubGVuZ3RoIC0gMVxuXG4gICAgICAgIGlmKCAhbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuICkge1xuICAgICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC8gdlxuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIG91dCArPSBgJHtsYXN0TnVtYmVyfSAvICR7dn1gXG4gICAgICAgIH1cblxuICAgICAgICBpZiggIWlzRmluYWxJZHggKSBvdXQgKz0gJyAvICcgXG4gICAgICB9KVxuXG4gICAgICBvdXQgKz0gJyknXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBkaXZcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidmbG9vcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZmxvb3IgfSlcblxuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19IHwgMCApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSB8IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBmbG9vciA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBmbG9vci5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBmbG9vclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidmb2xkJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0XG5cbiAgICBvdXQgPSB0aGlzLmNyZWF0ZUNhbGxiYWNrKCBpbnB1dHNbMF0sIHRoaXMubWluLCB0aGlzLm1heCApIFxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dCBdXG4gIH0sXG5cbiAgY3JlYXRlQ2FsbGJhY2soIHYsIGxvLCBoaSApIHtcbiAgICBsZXQgb3V0ID1cbmAgbGV0ICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dn0sXG4gICAgICAke3RoaXMubmFtZX1fcmFuZ2UgPSAke2hpfSAtICR7bG99LFxuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gMFxuXG4gIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcysrXG4gIH0gZWxzZSBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlICs9ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA8ICR7bG99KXtcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9ICgoJHt0aGlzLm5hbWV9X3ZhbHVlIC0gJHtsb30pIC8gJHt0aGlzLm5hbWV9X3JhbmdlLSAxKSB8IDBcbiAgICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2UgKiAke3RoaXMubmFtZX1fbnVtV3JhcHNcbiAgICB9XG4gICAgJHt0aGlzLm5hbWV9X251bVdyYXBzLS1cbiAgfVxuICBpZigke3RoaXMubmFtZX1fbnVtV3JhcHMgJiAxKSAke3RoaXMubmFtZX1fdmFsdWUgPSAke2hpfSArICR7bG99IC0gJHt0aGlzLm5hbWV9X3ZhbHVlXG5gXG4gICAgcmV0dXJuICcgJyArIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidnYXRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0LCBkYXRhID0nZ2VuLmRhdGEuJyArIHRoaXMubmFtZVxuICAgIFxuICAgIG91dCA9XG5cbmAgbGV0ICR7dGhpcy5uYW1lfV9pbmRleCA9ICR7aW5wdXRzWzFdfVxuICBpZiggJHt0aGlzLm5hbWV9X2luZGV4ICE9ICR7ZGF0YX0ubGFzdElucHV0ICkge1xuICAgICR7ZGF0YX0ub3V0cHV0c1sgJHtkYXRhfS5sYXN0SW5wdXQgXSA9IDBcbiAgICAke2RhdGF9Lmxhc3RJbnB1dCA9ICR7aW5wdXRzWzFdfVxuICB9XG4gICR7ZGF0YX0ub3V0cHV0c1sgJHtpbnB1dHNbMV19IF0gPSAke2lucHV0c1swXX0gXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgcmV0dXJuIFsgYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWAsICcgJyArIG91dCBdXG4gIH0sXG5cbiAgY2hpbGRnZW4oKSB7XG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLnBhcmVudC5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIH1cbiAgICByZXR1cm4gYGdlbi5kYXRhLiR7dGhpcy5wYXJlbnQubmFtZX0ub3V0cHV0c1sgJHt0aGlzLmluZGV4fSBdYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjb3VudDogMiB9XG5cbiAgaWYoIHR5cGVvZiBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIG91dHB1dHM6IFtdLFxuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgY29udHJvbCBdLFxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIGdlbi5kYXRhWyB1Z2VuLm5hbWUgXSA9IHsgb3V0cHV0czogW10sIGxhc3RJbnB1dDowIH1cblxuICBmb3IoIGxldCBpID0gMDsgaSA8IHVnZW4uY291bnQ7IGkrKyApIHtcbiAgICB1Z2VuLm91dHB1dHMucHVzaCh7XG4gICAgICBpbmRleDppLFxuICAgICAgZ2VuOiBwcm90by5jaGlsZGdlbixcbiAgICAgIHBhcmVudDp1Z2VuLFxuICAgICAgaW5wdXRzOiBbIHVnZW4gXVxuICAgIH0pXG4gICAgZ2VuLmRhdGFbIHVnZW4ubmFtZSBdLm91dHB1dHNbIGkgXSA9IDBcbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuLyogZ2VuLmpzXG4gKlxuICogbG93LWxldmVsIGNvZGUgZ2VuZXJhdGlvbiBmb3IgdW5pdCBnZW5lcmF0b3JzXG4gKlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFjY3VtOjAsXG4gIGdldFVJRCgpIHsgcmV0dXJuIHRoaXMuYWNjdW0rKyB9LFxuICBkZWJ1ZzpmYWxzZSxcbiAgc2FtcGxlcmF0ZTogNDQxMDAsIC8vIGNoYW5nZSBvbiBhdWRpb2NvbnRleHQgY3JlYXRpb25cbiAgXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICogWFhYIFNob3VsZCBwcm9iYWJseSBiZSByZW5hbWVkIGNhbGxiYWNrUHJvcGVydGllcyBvciBzb21ldGhpbmcgc2ltaWxhci4uLiBjbG9zdXJlcyBhcmUgbm8gbG9uZ2VyIHVzZWQuXG4gICAqL1xuXG4gIGNsb3N1cmVzOm5ldyBTZXQoKSxcblxuICBwYXJhbWV0ZXJzOltdLFxuICBlbmRCbG9jazogbmV3IFNldCgpLFxuICBoaXN0b3JpZXM6IG5ldyBNYXAoKSxcblxuICBtZW1vOiB7fSxcblxuICBkYXRhOiB7fSxcbiAgXG4gIC8qIGV4cG9ydFxuICAgKlxuICAgKiBwbGFjZSBnZW4gZnVuY3Rpb25zIGludG8gYW5vdGhlciBvYmplY3QgZm9yIGVhc2llciByZWZlcmVuY2VcbiAgICovXG5cbiAgZXhwb3J0KCBvYmogKSB7fSxcblxuICBhZGRUb0VuZEJsb2NrKCB2ICkge1xuICAgIHRoaXMuZW5kQmxvY2suYWRkKCAnICAnICsgdiApXG4gIH0sXG4gIFxuICAvKiBjcmVhdGVDYWxsYmFja1xuICAgKlxuICAgKiBwYXJhbSB1Z2VuIC0gSGVhZCBvZiBncmFwaCB0byBiZSBjb2RlZ2VuJ2RcbiAgICpcbiAgICogR2VuZXJhdGUgY2FsbGJhY2sgZnVuY3Rpb24gZm9yIGEgcGFydGljdWxhciB1Z2VuIGdyYXBoLlxuICAgKiBUaGUgZ2VuLmNsb3N1cmVzIHByb3BlcnR5IHN0b3JlcyBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlXG4gICAqIHBhc3NlZCBhcyBhcmd1bWVudHMgdG8gdGhlIGZpbmFsIGZ1bmN0aW9uOyB0aGVzZSBhcmUgcHJlZml4ZWRcbiAgICogYmVmb3JlIGFueSBkZWZpbmVkIHBhcmFtcyB0aGUgZ3JhcGggZXhwb3Nlcy4gRm9yIGV4YW1wbGUsIGdpdmVuOlxuICAgKlxuICAgKiBnZW4uY3JlYXRlQ2FsbGJhY2soIGFicyggcGFyYW0oKSApIClcbiAgICpcbiAgICogLi4uIHRoZSBnZW5lcmF0ZWQgZnVuY3Rpb24gd2lsbCBoYXZlIGEgc2lnbmF0dXJlIG9mICggYWJzLCBwMCApLlxuICAgKi9cbiAgXG4gIGNyZWF0ZUNhbGxiYWNrKCB1Z2VuLCBkZWJ1ZyA9IGZhbHNlICkge1xuICAgIGxldCBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIHVnZW4gKSxcbiAgICAgICAgY2FsbGJhY2ssIFxuICAgICAgICBjaGFubmVsMSwgY2hhbm5lbDJcbiAgICBcbiAgICAvL3RoaXMuZGF0YSA9IHt9IFxuICAgIHRoaXMubWVtbyA9IHt9XG4gICAgdGhpcy5lbmRCbG9jay5jbGVhcigpXG4gICAgdGhpcy5jbG9zdXJlcy5jbGVhcigpXG4gICAgdGhpcy5oaXN0b3JpZXMuY2xlYXIoKVxuICAgIHRoaXMucGFyYW1ldGVycy5sZW5ndGggPSAwXG5cbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiICAndXNlIHN0cmljdCc7XFxuXFxuXCJcblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDEgKyBpc1N0ZXJlbzsgaSsrICkge1xuICAgICAgbGV0IGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHVnZW5baV0uZ2VuKCkgOiB1Z2VuLmdlbigpLFxuICAgICAgICAgIGJvZHkgPSAnJ1xuXG4gICAgICAvLyBpZiAuZ2VuKCkgcmV0dXJucyBhcnJheSwgYWRkIHVnZW4gY2FsbGJhY2sgKGdyYXBoT3V0cHV0WzFdKSB0byBvdXIgb3V0cHV0IGZ1bmN0aW9ucyBib2R5XG4gICAgICAvLyBhbmQgdGhlbiByZXR1cm4gbmFtZSBvZiB1Z2VuLiBJZiAuZ2VuKCkgb25seSBnZW5lcmF0ZXMgYSBudW1iZXIgKGZvciByZWFsbHkgc2ltcGxlIGdyYXBocylcbiAgICAgIC8vIGp1c3QgcmV0dXJuIHRoYXQgbnVtYmVyIChncmFwaE91dHB1dFswXSkuXG4gICAgICBib2R5ICs9IEFycmF5LmlzQXJyYXkoIGNoYW5uZWwgKSA/IGNoYW5uZWxbMV0gKyAnXFxuJyArIGNoYW5uZWxbMF0gOiBjaGFubmVsXG5cbiAgICAgIC8vIHNwbGl0IGJvZHkgdG8gaW5qZWN0IHJldHVybiBrZXl3b3JkIG9uIGxhc3QgbGluZVxuICAgICAgYm9keSA9IGJvZHkuc3BsaXQoJ1xcbicpXG4gICAgIFxuICAgICAgLy9pZiggZGVidWcgKSBjb25zb2xlLmxvZyggJ2Z1bmN0aW9uQm9keSBsZW5ndGgnLCBib2R5IClcbiAgICAgIFxuICAgICAgLy8gbmV4dCBsaW5lIGlzIHRvIGFjY29tbW9kYXRlIG1lbW8gYXMgZ3JhcGggaGVhZFxuICAgICAgaWYoIGJvZHlbIGJvZHkubGVuZ3RoIC0xIF0udHJpbSgpLmluZGV4T2YoJ2xldCcpID4gLTEgKSB7IGJvZHkucHVzaCggJ1xcbicgKSB9IFxuXG4gICAgICAvLyBnZXQgaW5kZXggb2YgbGFzdCBsaW5lXG4gICAgICBsZXQgbGFzdGlkeCA9IGJvZHkubGVuZ3RoIC0gMVxuXG4gICAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICAgIGJvZHlbIGxhc3RpZHggXSA9ICcgIGdlbi5vdXRbJyArIGkgKyAnXSAgPSAnICsgYm9keVsgbGFzdGlkeCBdICsgJ1xcbidcblxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gYm9keS5qb2luKCdcXG4nKVxuICAgIH1cblxuICAgIGxldCByZXR1cm5TdGF0ZW1lbnQgPSBpc1N0ZXJlbyA/ICcgIHJldHVybiBnZW4ub3V0JyA6ICcgIHJldHVybiBnZW4ub3V0WzBdJ1xuICAgIFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpXG5cbiAgICBpZiggdGhpcy5lbmRCbG9jay5zaXplICkgeyBcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuY29uY2F0KCBBcnJheS5mcm9tKCB0aGlzLmVuZEJsb2NrICkgKVxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2goIHJldHVyblN0YXRlbWVudCApXG4gICAgfVxuICAgIC8vIHJlYXNzZW1ibGUgZnVuY3Rpb24gYm9keVxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuam9pbignXFxuJylcblxuICAgIC8vIHdlIGNhbiBvbmx5IGR5bmFtaWNhbGx5IGNyZWF0ZSBhIG5hbWVkIGZ1bmN0aW9uIGJ5IGR5bmFtaWNhbGx5IGNyZWF0aW5nIGFub3RoZXIgZnVuY3Rpb25cbiAgICAvLyB0byBjb25zdHJ1Y3QgdGhlIG5hbWVkIGZ1bmN0aW9uISBzaGVlc2guLi5cbiAgICBsZXQgYnVpbGRTdHJpbmcgPSBgcmV0dXJuIGZ1bmN0aW9uIGdlbiggJHt0aGlzLnBhcmFtZXRlcnMuam9pbignLCcpfSApeyBcXG4ke3RoaXMuZnVuY3Rpb25Cb2R5fVxcbn1gXG4gICAgXG4gICAgaWYoIHRoaXMuZGVidWcgfHwgZGVidWcgKSBjb25zb2xlLmxvZyggYnVpbGRTdHJpbmcgKSBcblxuICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKCBidWlsZFN0cmluZyApKClcbiAgICBcbiAgICAvLyBhc3NpZ24gcHJvcGVydGllcyB0byBuYW1lZCBmdW5jdGlvblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5jbG9zdXJlcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB2YWx1ZSA9IGRpY3RbIG5hbWUgXVxuXG4gICAgICBjYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG4gICAgXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YVxuICAgIGNhbGxiYWNrLm91dCAgPSBbXVxuXG4gICAgcmV0dXJuIGNhbGxiYWNrXG4gIH0sXG4gIFxuICAvKiBnZXRJbnB1dHNcbiAgICpcbiAgICogR2l2ZW4gYW4gYXJndW1lbnQgdWdlbiwgZXh0cmFjdCBpdHMgaW5wdXRzLiBJZiB0aGV5IGFyZSBudW1iZXJzLCByZXR1cm4gdGhlIG51bWVicnMuIElmXG4gICAqIHRoZXkgYXJlIHVnZW5zLCBjYWxsIC5nZW4oKSBvbiB0aGUgdWdlbiwgbWVtb2l6ZSB0aGUgcmVzdWx0IGFuZCByZXR1cm4gdGhlIHJlc3VsdC4gSWYgdGhlXG4gICAqIHVnZW4gaGFzIHByZXZpb3VzbHkgYmVlbiBtZW1vaXplZCByZXR1cm4gdGhlIG1lbW9pemVkIHZhbHVlLlxuICAgKlxuICAgKi9cbiAgZ2V0SW5wdXRzKCB1Z2VuICkge1xuICAgIGxldCBpbnB1dHMgPSB1Z2VuLmlucHV0cy5tYXAoIGlucHV0ID0+IHtcbiAgICAgIGxldCBpc09iamVjdCA9IHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcsXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXRcblxuICAgICAgaWYoIGlzT2JqZWN0ICkgeyAvLyBpZiBpbnB1dCBpcyBhIHVnZW4uLi4gXG4gICAgICAgIGlmKCB0aGlzLm1lbW9bIGlucHV0Lm5hbWUgXSApIHsgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IHRoaXMubWVtb1sgaW5wdXQubmFtZSBdXG4gICAgICAgIH1lbHNleyAvLyBpZiBub3QgbWVtb2l6ZWQgZ2VuZXJhdGUgY29kZVxuICAgICAgICAgIGxldCBjb2RlID0gaW5wdXQuZ2VuKClcbiAgICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggY29kZSApICkge1xuICAgICAgICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gY29kZVsxXVxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ2FmdGVyIEdFTicgLCB0aGlzLmZ1bmN0aW9uQm9keSApXG4gICAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfWVsc2V7IC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICAgIHByb2Nlc3NlZElucHV0ID0gaW5wdXRcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHByb2Nlc3NlZElucHV0XG4gICAgfSlcblxuICAgIHJldHVybiBpbnB1dHNcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0gPyAxIDogMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdID4gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMT0wICkgPT4ge1xuICBsZXQgdWdlbiA9IHtcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG5cbiAgICBpbiggdiApIHtcbiAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmhhcyggdiApICl7XG4gICAgICAgIGxldCBtZW1vSGlzdG9yeSA9IGdlbi5oaXN0b3JpZXMuZ2V0KCB2IClcbiAgICAgICAgdWdlbi5uYW1lID0gbWVtb0hpc3RvcnkubmFtZVxuICAgICAgICByZXR1cm4gbWVtb0hpc3RvcnlcbiAgICAgIH1cblxuICAgICAgbGV0IG9iaiA9IHtcbiAgICAgICAgZ2VuKCkge1xuICAgICAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB1Z2VuIClcbiAgICAgICAgICBcbiAgICAgICAgICBpZiggIGdlbi5kYXRhWyB1Z2VuLm5hbWUgXSA9PT0gdW5kZWZpbmVkICl7XG4gICAgICAgICAgICBnZW4uZGF0YVsgdWdlbi5uYW1lIF0gPSBpbjFcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBnZW4uYWRkVG9FbmRCbG9jayggJ2dlbi5kYXRhLicgKyB1Z2VuLm5hbWUgKyAnID0gJyArIGlucHV0c1sgMCBdIClcbiAgICAgICAgICBcbiAgICAgICAgICAvLyByZXR1cm4gdWdlbiB0aGF0IGlzIGJlaW5nIHJlY29yZGVkIGluc3RlYWQgb2Ygc3NkLlxuICAgICAgICAgIC8vIHRoaXMgZWZmZWN0aXZlbHkgbWFrZXMgYSBjYWxsIHRvIHNzZC5yZWNvcmQoKSB0cmFuc3BhcmVudCB0byB0aGUgZ3JhcGguXG4gICAgICAgICAgLy8gcmVjb3JkaW5nIGlzIHRyaWdnZXJlZCBieSBwcmlvciBjYWxsIHRvIGdlbi5hZGRUb0VuZEJsb2NrLlxuICAgICAgICAgIHJldHVybiBpbnB1dHNbIDAgXVxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiB1Z2VuLm5hbWVcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnB1dHNbIDAgXSA9IHZcbiAgICAgIFxuICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHYsIG9iaiApXG5cbiAgICAgIHJldHVybiBvYmpcbiAgICB9LFxuICAgIFxuICAgIG91dDoge1xuICAgICAgXG4gICAgICBnZW4oKSB7XG4gICAgICAgIGlmKCBnZW4uZGF0YVsgdWdlbi5uYW1lIF0gPT09IHVuZGVmaW5lZCApIGdlbi5kYXRhWyB1Z2VuLm5hbWUgXSA9IHBhcnNlRmxvYXQoIGluMSApXG4gICAgICAgIHJldHVybiAnZ2VuLmRhdGEuJyArIHVnZW4ubmFtZSBcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHVpZDogZ2VuLmdldFVJRCgpLFxuICB9XG4gIFxuICB1Z2VuLm5hbWUgPSAnaGlzdG9yeScgKyB1Z2VuLnVpZFxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2luJyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLnBhcmFtZXRlcnMucHVzaCggdGhpcy5uYW1lIClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiB0aGlzLm5hbWVcbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoKSA9PiB7XG4gIGxldCBpbnB1dCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBpbnB1dC5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIGlucHV0Lm5hbWUgPSBgJHtpbnB1dC5iYXNlbmFtZX0ke2lucHV0LmlkfWBcblxuICByZXR1cm4gaW5wdXRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgbGlicmFyeSA9IHtcbiAgZXhwb3J0KCBkZXN0aW5hdGlvbiApIHtcbiAgICBkZXN0aW5hdGlvbi5zc2QgPSBsaWJyYXJ5Lmhpc3RvcnkgLy8gaGlzdG9yeSBpcyB3aW5kb3cgb2JqZWN0IHByb3BlcnR5LCBzbyB1c2Ugc3NkIGFzIGFsaWFzXG4gICAgZGVzdGluYXRpb24uaW5wdXQgPSBsaWJyYXJ5LmluICAgIC8vIGluIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG5cbiAgICBkZWxldGUgbGlicmFyeS5oaXN0b3J5XG4gICAgZGVsZXRlIGxpYnJhcnkuaW5cbiAgICBcbiAgICBPYmplY3QuYXNzaWduKCBkZXN0aW5hdGlvbiwgbGlicmFyeSApXG4gICAgZGVzdGluYXRpb24uY2xpcCA9IGxpYnJhcnkuY2xhbXBcbiAgfSxcblxuICBnZW46ICAgICAgcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICBcbiAgYWJzOiAgICAgIHJlcXVpcmUoICcuL2Ficy5qcycgKSxcbiAgcm91bmQ6ICAgIHJlcXVpcmUoICcuL3JvdW5kLmpzJyApLFxuICBwYXJhbTogICAgcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gIGFkZDogICAgICByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gIHN1YjogICAgICByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gIG11bDogICAgICByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gIGRpdjogICAgICByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gIGFjY3VtOiAgICByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgY291bnRlcjogIHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gIHNpbjogICAgICByZXF1aXJlKCAnLi9zaW4uanMnICksXG4gIGNvczogICAgICByZXF1aXJlKCAnLi9jb3MuanMnICksXG4gIHRhbjogICAgICByZXF1aXJlKCAnLi90YW4uanMnICksXG4gIGFzaW46ICAgICByZXF1aXJlKCAnLi9hc2luLmpzJyApLFxuICBhY29zOiAgICAgcmVxdWlyZSggJy4vYWNvcy5qcycgKSxcbiAgYXRhbjogICAgIHJlcXVpcmUoICcuL2F0YW4uanMnICksICBcbiAgcGhhc29yOiAgIHJlcXVpcmUoICcuL3BoYXNvci5qcycgKSxcbiAgZGF0YTogICAgIHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gIHBlZWs6ICAgICByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICBjeWNsZTogICAgcmVxdWlyZSggJy4vY3ljbGUuanMnICksXG4gIGhpc3Rvcnk6ICByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICBkZWx0YTogICAgcmVxdWlyZSggJy4vZGVsdGEuanMnICksXG4gIGZsb29yOiAgICByZXF1aXJlKCAnLi9mbG9vci5qcycgKSxcbiAgY2VpbDogICAgIHJlcXVpcmUoICcuL2NlaWwuanMnICksXG4gIG1pbjogICAgICByZXF1aXJlKCAnLi9taW4uanMnICksXG4gIG1heDogICAgICByZXF1aXJlKCAnLi9tYXguanMnICksXG4gIHNpZ246ICAgICByZXF1aXJlKCAnLi9zaWduLmpzJyApLFxuICBkY2Jsb2NrOiAgcmVxdWlyZSggJy4vZGNibG9jay5qcycgKSxcbiAgbWVtbzogICAgIHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gIHJhdGU6ICAgICByZXF1aXJlKCAnLi9yYXRlLmpzJyApLFxuICB3cmFwOiAgICAgcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgbWl4OiAgICAgIHJlcXVpcmUoICcuL21peC5qcycgKSxcbiAgY2xhbXA6ICAgIHJlcXVpcmUoICcuL2NsYW1wLmpzJyApLFxuICBwb2tlOiAgICAgcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgZGVsYXk6ICAgIHJlcXVpcmUoICcuL2RlbGF5LmpzJyApLFxuICBmb2xkOiAgICAgcmVxdWlyZSggJy4vZm9sZC5qcycgKSxcbiAgbW9kIDogICAgIHJlcXVpcmUoICcuL21vZC5qcycgKSxcbiAgc2FoIDogICAgIHJlcXVpcmUoICcuL3NhaC5qcycgKSxcbiAgbm9pc2U6ICAgIHJlcXVpcmUoICcuL25vaXNlLmpzJyApLFxuICBub3Q6ICAgICAgcmVxdWlyZSggJy4vbm90LmpzJyApLFxuICBndDogICAgICAgcmVxdWlyZSggJy4vZ3QuanMnICksXG4gIGx0OiAgICAgICByZXF1aXJlKCAnLi9sdC5qcycgKSwgXG4gIGJvb2w6ICAgICByZXF1aXJlKCAnLi9ib29sLmpzJyApLFxuICBnYXRlOiAgICAgcmVxdWlyZSggJy4vZ2F0ZS5qcycgKSxcbiAgdHJhaW46ICAgIHJlcXVpcmUoICcuL3RyYWluLmpzJyApLFxuICBzbGlkZTogICAgcmVxdWlyZSggJy4vc2xpZGUuanMnICksXG4gIGluOiAgICAgICByZXF1aXJlKCAnLi9pbi5qcycgKSxcbiAgdDYwOiAgICAgIHJlcXVpcmUoICcuL3Q2MC5qcycpLFxuICBtdG9mOiAgICAgcmVxdWlyZSggJy4vbXRvZi5qcycpLFxuICB1dGlsaXRpZXM6cmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApXG59XG5cbmxpYnJhcnkuZ2VuLmxpYiA9IGxpYnJhcnlcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJyYXJ5XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbHQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoICR7aW5wdXRzWzBdfSA8ICR7aW5wdXRzWzFdfSA/IDEgOiAwICApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBsdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21heCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5tYXggfSlcblxuICAgICAgb3V0ID0gYGdlbi5tYXgoICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5tYXgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1heCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtYXguaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtYXhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtZW1vJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgbGV0ICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGluMSA9PiB7XG4gIGxldCBtZW1vID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgbWVtby5pbnB1dHMgPSBbIGluMSBdXG4gIG1lbW8uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBtZW1vLm5hbWUgPSBgJHttZW1vLmJhc2VuYW1lfSR7bWVtby5pZH1gXG5cbiAgcmV0dXJuIG1lbW9cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGgubWluIH0pXG5cbiAgICAgIG91dCA9IGBnZW4ubWluKCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWluKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBtaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbWluLmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbWluXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbWl4JyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYWRkKCBtdWwodGhpcy5pbnB1dHNbMF0sIHN1YigxLHRoaXMuaW5wdXRzWzJdKSApLCBtdWwoIHRoaXMuaW5wdXRzWzFdLCB0aGlzLmlucHV0c1syXSApICkuZ2VuKClcblxuICAgIHJldHVybiBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIsIHQ9LjUgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgaW4yLCB0IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgbW9kID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgbW9kQXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAlIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gJSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgJSAnIFxuICAgICAgfSlcblxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbW9kXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbXRvZicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgKCAke3RoaXMudHVuaW5nfSAqIGdlbi5leHAoIC4wNTc3NjIyNjUgKiAoJHtpbnB1dHNbMF19IC0gNjkpICkgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSB0aGlzLnR1bmluZyAqIE1hdGguZXhwKCAuMDU3NzYyMjY1ICogKCBpbnB1dHNbMF0gLSA2OSkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHByb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgdHVuaW5nOjQ0MCB9XG4gIFxuICBpZiggcHJvcHMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIHByb3BzLmRlZmF1bHRzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBkZWZhdWx0cyApXG4gIHVnZW4uaW5wdXRzID0gWyB4IF1cbiAgXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggeCx5ICkgPT4ge1xuICBsZXQgbXVsID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyB4LHkgXSxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0XG5cbiAgICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgICBvdXQgPSAgYCgke2lucHV0c1swXX0gKiAke2lucHV0c1sxXX0pYFxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9IHBhcnNlRmxvYXQoIGlucHV0c1swXSApICogcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbXVsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbm9pc2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0XG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ25vaXNlJyA6IE1hdGgucmFuZG9tIH0pXG5cbiAgICBvdXQgPSBgZ2VuLm5vaXNlKClgXG5cbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IG5vaXNlID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHJldHVybiBub2lzZVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vdCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19ID09PSAwID8gMSA6IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gIWlucHV0c1swXSA9PT0gMCA/IDEgOiAwXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm90ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG5vdC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBub3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGdlbigpIHtcbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcy52YWx1ZSB9KSBcbiAgICByZXR1cm4gJ2dlbi4nICsgdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBwcm9wTmFtZSwgdmFsdWUgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHVnZW4ubmFtZSA9IHByb3BOYW1lXG4gIHVnZW4udmFsdWUgPSB2YWx1ZVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BlZWsnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQsIGZ1bmN0aW9uQm9keSwgbmV4dCwgbGVuZ3RoSXNMb2cyXG4gICAgXG4gICAgdGhpcy5kYXRhLmdlbigpXG4gICAgbGVuZ3RoSXNMb2cyID0gKE1hdGgubG9nMiggdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKSB8IDApICA9PT0gTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApXG5cbiAgICAvL2NvbnNvbGUubG9nKCBcIkxFTkdUSCBJUyBMT0cyXCIsIGxlbmd0aElzTG9nMiwgdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKVxuXG4gICAgZnVuY3Rpb25Cb2R5ID0gYCAgbGV0ICR7dGhpcy5uYW1lfV9kYXRhICA9IGdlbi5kYXRhLiR7dGhpcy5kYXRhTmFtZX0uYnVmZmVyLFxuICAgICAgJHt0aGlzLm5hbWV9X3BoYXNlID0gJHt0aGlzLm1vZGUgPT09ICdzYW1wbGVzJyA/IGlucHV0c1swXSA6IGlucHV0c1swXSArICcgKiAnICsgdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggfSwgXG4gICAgICAke3RoaXMubmFtZX1faW5kZXggPSAke3RoaXMubmFtZX1fcGhhc2UgfCAwLFxcbmBcblxuICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgPyBcbiAgICAgIGAoICR7dGhpcy5uYW1lfV9pbmRleCArIDEgKSAmICgke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSAtIDEpYCA6XG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSA/ICR7dGhpcy5uYW1lfV9pbmRleCArIDEgLSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG5cbiAgaWYoIHRoaXMuaW50ZXJwID09PSAnbGluZWFyJyApIHsgICAgICBcbiAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9mcmFjICA9ICR7dGhpcy5uYW1lfV9waGFzZSAtICR7dGhpcy5uYW1lfV9pbmRleCxcbiAgICAgICR7dGhpcy5uYW1lfV9iYXNlICA9ICR7dGhpcy5uYW1lfV9kYXRhWyAke3RoaXMubmFtZX1faW5kZXggXSxcbiAgICAgICR7dGhpcy5uYW1lfV9uZXh0ICA9ICR7bmV4dH0sICAgICBcbiAgICAgICR7dGhpcy5uYW1lfV9vdXQgICA9ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoICR7dGhpcy5uYW1lfV9kYXRhWyAke3RoaXMubmFtZX1fbmV4dCBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKVxcblxcbmBcblxuICAgIH1lbHNle1xuICAgICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fb3V0ID0gJHt0aGlzLm5hbWV9X2RhdGFbICR7dGhpcy5uYW1lfV9pbmRleCBdXFxuXFxuYFxuICAgIH1cbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSsnX291dCcsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBkYXRhLCBpbmRleCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGNoYW5uZWxzOjEsIG1vZGU6J3BoYXNlJywgaW50ZXJwOidsaW5lYXInIH0gXG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGRhdGEsXG4gICAgZGF0YU5hbWU6ICAgZGF0YS5uYW1lLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluZGV4IF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGhhc29yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBhY2N1bSggbXVsKCBpbnB1dHNbMF0sIDEvNDQxMDAgKSwgaW5wdXRzWzFdICkuZ2VuKClcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFswXVxuXG4gICAgcmV0dXJuIG91dFxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT0xLCByZXNldD0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGZyZXF1ZW5jeSxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgZnJlcXVlbmN5LCByZXNldCBdLFxuICAgIHByb3BlcnRpZXM6IFsgJ2ZyZXF1ZW5jeScsJ3Jlc2V0JyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBtdWwgID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG9rZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBkYXRhTmFtZSA9ICdnZW4uZGF0YS4nICsgdGhpcy5kYXRhTmFtZSArICcuYnVmZmVyJyxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBpZHgsIG91dCwgd3JhcHBlZFxuXG4gICAgLy93cmFwcGVkID0gd3JhcCggdGhpcy5pbnB1dHNbMV0sIDAsIHRoaXMuZGF0YUxlbmd0aCApLmdlbigpXG4gICAgLy9pZHggPSB3cmFwcGVkWzBdXG4gICAgLy9nZW4uZnVuY3Rpb25Cb2R5ICs9IHdyYXBwZWRbMV1cbiAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGAgICR7ZGF0YU5hbWV9WyR7aW5wdXRzWzFdfV0gPSAke2lucHV0c1swXX1cXG5cXG5gXG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gKCBkYXRhLCB2YWx1ZSwgaW5kZXgsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjaGFubmVsczoxIH0gXG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGRhdGEsXG4gICAgZGF0YU5hbWU6ICAgZGF0YS5uYW1lLFxuICAgIGRhdGFMZW5ndGg6IGRhdGEuYnVmZmVyLmxlbmd0aCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyB2YWx1ZSwgaW5kZXggXSxcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgICBkZWx0YSAgID0gcmVxdWlyZSggJy4vZGVsdGEuanMnICksXG4gICAgd3JhcCAgICA9IHJlcXVpcmUoICcuL3dyYXAuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncmF0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHBoYXNlICA9IGhpc3RvcnkoKSxcbiAgICAgICAgaW5NaW51czEgPSBoaXN0b3J5KCksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZpbHRlciwgc3VtLCBvdXRcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgb3V0ID0gXG5gIGxldCAke3RoaXMubmFtZX1fZGlmZiA9ICR7aW5wdXRzWzBdfSAtICR7Z2VuTmFtZX0ubGFzdFNhbXBsZVxuICBpZiggJHt0aGlzLm5hbWV9X2RpZmYgPCAtLjUgKSAke3RoaXMubmFtZX1fZGlmZiArPSAxXG4gICR7Z2VuTmFtZX0ucGhhc2UgKz0gJHt0aGlzLm5hbWV9X2RpZmYgKiAke2lucHV0c1sxXX1cbiAgaWYoICR7Z2VuTmFtZX0ucGhhc2UgPiAxICkgJHtnZW5OYW1lfS5waGFzZSAtPSAxXG4gICR7Z2VuTmFtZX0ubGFzdFNhbXBsZSA9ICR7aW5wdXRzWzBdfVxuYFxuICAgIG91dCA9ICcgJyArIG91dFxuXG4gICAgcmV0dXJuIFsgZ2VuTmFtZSArICcucGhhc2UnLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHJhdGUgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgcGhhc2U6ICAgICAgMCxcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSwgcmF0ZSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J3JvdW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGgucm91bmQgfSlcblxuICAgICAgb3V0ID0gYGdlbi5yb3VuZCggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5yb3VuZCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHJvdW5kID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHJvdW5kLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIHJvdW5kXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2FoJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBnZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSAwXG4gICAgZ2VuLmRhdGFbIHRoaXMubmFtZSArICdfY29udHJvbCcgXSA9IDBcblxuICAgIG91dCA9IFxuYCBsZXQgJHt0aGlzLm5hbWV9ID0gZ2VuLmRhdGEuJHt0aGlzLm5hbWV9X2NvbnRyb2wsXG4gICAgICAke3RoaXMubmFtZX1fdHJpZ2dlciA9ICR7aW5wdXRzWzFdfSA+ICR7aW5wdXRzWzJdfSA/IDEgOiAwXG5cbiAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyICE9PSAke3RoaXMubmFtZX0gICkge1xuICAgIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciA9PT0gMSApIFxuICAgICAgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XG4gICAgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9X2NvbnRyb2wgPSAke3RoaXMubmFtZX1fdHJpZ2dlclxuICB9XG5gXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgK291dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgY29udHJvbCwgdGhyZXNob2xkPTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0OjAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSwgY29udHJvbCx0aHJlc2hvbGQgXSxcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J3NpZ24nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5zaWduIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uc2lnbiggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5zaWduKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2lnbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBzaWduLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIHNpZ25cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2luJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnc2luJzogTWF0aC5zaW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5zaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBzaW4uaW5wdXRzID0gWyB4IF1cbiAgc2luLmlkID0gZ2VuLmdldFVJRCgpXG4gIHNpbi5uYW1lID0gYCR7c2luLmJhc2VuYW1lfXtzaW4uaWR9YFxuXG4gIHJldHVybiBzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzbGlkZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHkxICAgICA9IGhpc3RvcnkoKSxcbiAgICAgICAgZmlsdGVyXG5cbiAgICBmaWx0ZXIgPSBtZW1vKCBhZGQoIHkxLm91dCwgZGl2KCBzdWIoIGlucHV0c1swXSwgeTEub3V0ICksIGlucHV0c1sxXSApICkgKVxuICAgIHkxLmluKCBmaWx0ZXIgKS5nZW4oKVxuXG4gICAgcmV0dXJuIGZpbHRlci5uYW1lXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBzbGlkZVVwID0gMSwgc2xpZGVEb3duID0gMSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIHNsaWRlVXAsIHNsaWRlRG93biBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IHN1YiA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgICAgbmVlZHNQYXJlbnMgPSBmYWxzZSwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgc3ViQXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAtIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgICAgfSlcbiAgICBcbiAgICAgIGlmKCBuZWVkc1BhcmVucyApIHtcbiAgICAgICAgb3V0ICs9ICcpJ1xuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9IG91dC5zbGljZSggMSApIC8vIHJlbW92ZSBvcGVuaW5nIHBhcmVuXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBzdWJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOid0NjAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYGdlbi5leHAoIC02LjkwNzc1NTI3ODkyMSAvICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguZXhwKCAtNi45MDc3NTUyNzg5MjEgLyBpbnB1dHNbMF0gKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHQ2MCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0NjAuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gdDYwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IE1hdGgudGFuIH0pXG5cbiAgICAgIG91dCA9IGBnZW4udGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdGFuLmlucHV0cyA9IFsgeCBdXG4gIHRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW4ubmFtZSA9IGAke3Rhbi5iYXNlbmFtZX17dGFuLmlkfWBcblxuICByZXR1cm4gdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbHQgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIHBoYXNvciAgPSByZXF1aXJlKCAnLi9waGFzb3IuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondHJhaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBncmFwaCA9IGx0KCBhY2N1bSggZGl2KCBpbnB1dHNbMF0sIDQ0MTAwICkgKSwgaW5wdXRzWzFdIClcbiAgICBcbiAgICByZXR1cm4gZ3JhcGguZ2VuKClcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBwZXJpb2Q9NDQwLCBwdWxzZXdpZHRoPS41ICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIHBlcmlvZCwgcHVsc2V3aWR0aCBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKVxuXG5sZXQgaXNTdGVyZW8gPSBmYWxzZVxuXG5sZXQgdXRpbGl0aWVzID0ge1xuICBjdHg6IG51bGwsXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9ICgpID0+IDBcbiAgfSxcblxuICBjcmVhdGVDb250ZXh0KCkge1xuICAgIHRoaXMuY3R4ID0gbmV3ICggQXVkaW9Db250ZXh0IHx8IHdlYmtpdEF1ZGlvQ29udGV4dCApKClcbiAgICBnZW4uc2FtcGxlcmF0ZSA9IHRoaXMuY3R4LnNhbXBsZXJhdGVcblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCkge1xuICAgIHRoaXMubm9kZSA9IHRoaXMuY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvciggMTAyNCwgMCwgMiApLFxuICAgIHRoaXMuY2xlYXJGdW5jdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMCB9LFxuICAgIHRoaXMuY2FsbGJhY2sgPSB0aGlzLmNsZWFyRnVuY3Rpb25cblxuICAgIHRoaXMubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKCBhdWRpb1Byb2Nlc3NpbmdFdmVudCApIHtcbiAgICAgIHZhciBvdXRwdXRCdWZmZXIgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXI7XG5cbiAgICAgIHZhciBsZWZ0ID0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAwICksXG4gICAgICAgICAgcmlnaHQ9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMSApXG5cbiAgICAgIGZvciAodmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGxlZnQubGVuZ3RoOyBzYW1wbGUrKykge1xuICAgICAgICBpZiggIWlzU3RlcmVvICkge1xuICAgICAgICAgIGxlZnRbIHNhbXBsZSBdID0gcmlnaHRbIHNhbXBsZSBdID0gdXRpbGl0aWVzLmNhbGxiYWNrKClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdmFyIG91dCA9IHV0aWxpdGllcy5jYWxsYmFjaygpXG4gICAgICAgICAgbGVmdFsgc2FtcGxlICBdID0gb3V0WzBdXG4gICAgICAgICAgcmlnaHRbIHNhbXBsZSBdID0gb3V0WzFdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm5vZGUuY29ubmVjdCggdGhpcy5jdHguZGVzdGluYXRpb24gKVxuXG4gICAgLy90aGlzLm5vZGUuY29ubmVjdCggdGhpcy5hbmFseXplciApXG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBcbiAgcGxheUdyYXBoKCBncmFwaCwgZGVidWcgKSB7XG4gICAgaWYoIGRlYnVnID09PSB1bmRlZmluZWQgKSBkZWJ1ZyA9IGZhbHNlXG4gICAgICAgICAgXG4gICAgaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCBncmFwaCApXG5cbiAgICB1dGlsaXRpZXMuY2FsbGJhY2sgPSBnZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBkZWJ1ZyApXG4gICAgXG4gICAgaWYoIHV0aWxpdGllcy5jb25zb2xlICkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUoIHV0aWxpdGllcy5jYWxsYmFjay50b1N0cmluZygpIClcblxuICAgIHJldHVybiB1dGlsaXRpZXMuY2FsbGJhY2tcbiAgfSxcblxuICBsb2FkU2FtcGxlKCBzb3VuZEZpbGVQYXRoLCBkYXRhICkge1xuICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHJlcS5vcGVuKCAnR0VUJywgc291bmRGaWxlUGF0aCwgdHJ1ZSApXG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcicgXG4gICAgXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUscmVqZWN0KSA9PiB7XG4gICAgICByZXEub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhdWRpb0RhdGEgPSByZXEucmVzcG9uc2VcblxuICAgICAgICB1dGlsaXRpZXMuY3R4LmRlY29kZUF1ZGlvRGF0YSggYXVkaW9EYXRhLCAoYnVmZmVyKSA9PiB7XG4gICAgICAgICAgZGF0YS5idWZmZXIgPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMClcbiAgICAgICAgICByZXNvbHZlKCBkYXRhLmJ1ZmZlciApXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJlcS5zZW5kKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxpdGllc1xuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vcj0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiAgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid3cmFwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgc2lnbmFsID0gaW5wdXRzWzBdLCBtaW4gPSBpbnB1dHNbMV0sIG1heCA9IGlucHV0c1syXSxcbiAgICAgICAgb3V0XG5cbiAgICAvL291dCA9IGAoKCgke2lucHV0c1swXX0gLSAke3RoaXMubWlufSkgJSAke2RpZmZ9ICArICR7ZGlmZn0pICUgJHtkaWZmfSArICR7dGhpcy5taW59KWBcbiAgICAvL2NvbnN0IGxvbmcgbnVtV3JhcHMgPSBsb25nKCh2LWxvKS9yYW5nZSkgLSAodiA8IGxvKTtcbiAgICAvL3JldHVybiB2IC0gcmFuZ2UgKiBkb3VibGUobnVtV3JhcHMpOyAgIFxuICAgIFxuICAgIG91dCA9YCAgbGV0ICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9IDwgJHt0aGlzLm1pbn0gKSAke3RoaXMubmFtZX0gKz0gJHt0aGlzLm1heH0gLSAke3RoaXMubWlufVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPiAke3RoaXMubWF4fSApICR7dGhpcy5uYW1lfSAtPSAke3RoaXMubWF4fSAtICR7dGhpcy5taW59XFxuXFxuYFxuXG4vL2AgbGV0ICR7dGhpcy5uYW1lfSA9ICR7c2lnbmFsfVxuLy8gIGlmKCAke3RoaXMubmFtZX0gPCAke21pbn0gfHwgJHt0aGlzLm5hbWV9ID4gJHttYXh9ICkge1xuLy8gICAgbGV0IGRpZmYgPSAke21heH0gLSAke21pbn1cbi8vICAgICR7dGhpcy5uYW1lfSAtPSBkaWZmXG4vLyAgICAvL2xldCBudW1XcmFwcyA9ICgoICR7c2lnbmFsfSAtICR7bWlufSApIC8gZGlmZiApIHwgMFxuLy8gICAgLy8ke3RoaXMubmFtZX0gPSAke3RoaXMubmFtZX0gLSBkaWZmICogbnVtV3JhcHNcbi8vICB9XG4vL2Bcbi8vICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPiAke21heH0gKSAke3RoaXMubmFtZX0gLT0gJHttYXh9IC0gJHtpbn1cblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgJyAnICsgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iXX0=
