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

},{"./gen.js":30}],2:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'accum',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = void 0;

    _gen.requestMemory(this.memory);

    _gen.memory.heap[this.memory.value.idx] = this.initialValue;

    functionBody = this.callback(genName, inputs[0], inputs[1], 'memory[' + this.memory.value.idx + ']');

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = this.name + '_value';

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _reset, valueRef) {
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
    if (!(typeof this.inputs[1] === 'number' && this.inputs[1] < 1)) {
      if (this.resetValue !== this.min) {

        out += '  if( ' + _reset + ' >=1 ) ' + valueRef + ' = ' + this.resetValue + '\n\n';
        //out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.min}\n\n`
      } else {
          out += '  if( ' + _reset + ' >=1 ) ' + valueRef + ' = ' + this.min + '\n\n';
          //out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.initialValue}\n\n`
        }
    }

    out += '  var ' + this.name + '_value = ' + valueRef + '\n';

    if (this.shouldWrap === false && this.shouldClamp === true) {
      out += '  if( ' + valueRef + ' < ' + this.max + ' ) ' + valueRef + ' += ' + _incr + '\n';
    } else {
      out += '  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating
    }

    if (this.max !== Infinity && this.shouldWrapMax) wrap += '  if( ' + valueRef + ' >= ' + this.max + ' ) ' + valueRef + ' -= ' + diff + '\n';
    if (this.min !== -Infinity && this.shouldWrapMin) wrap += '  if( ' + valueRef + ' < ' + this.min + ' ) ' + valueRef + ' += ' + diff + '\n';

    //if( this.min === 0 && this.max === 1 ) {
    //  wrap =  `  ${valueRef} = ${valueRef} - (${valueRef} | 0)\n\n`
    //} else if( this.min === 0 && ( Math.log2( this.max ) | 0 ) === Math.log2( this.max ) ) {
    //  wrap =  `  ${valueRef} = ${valueRef} & (${this.max} - 1)\n\n`
    //} else if( this.max !== Infinity ){
    //  wrap = `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n\n`
    //}

    out = out + wrap + '\n';

    return out;
  },


  defaults: { min: 0, max: 1, resetValue: 0, initialValue: 0, shouldWrap: true, shouldWrapMax: true, shouldWrapMin: true, shouldClamp: false }
};

module.exports = function (incr) {
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var properties = arguments[2];

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [incr, reset],
    memory: {
      value: { length: 1, idx: null }
    }
  }, proto.defaults, properties);

  if (properties !== undefined && properties.shouldWrapMax === undefined && properties.shouldWrapMin === undefined) {
    if (properties.shouldWrap !== undefined) {
      ugen.shouldWrapMin = ugen.shouldWrapMax = properties.shouldWrap;
    }
  }

  if (properties !== undefined && properties.resetValue === undefined) {
    ugen.resetValue = ugen.min;
  }

  if (ugen.initialValue === undefined) ugen.initialValue = ugen.min;

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      return _gen.memory.heap[this.memory.value.idx];
    },
    set: function set(v) {
      _gen.memory.heap[this.memory.value.idx] = v;
    }
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":30}],3:[function(require,module,exports){
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

},{"./gen.js":30}],4:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    div = require('./div.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    ifelse = require('./ifelseif.js'),
    lt = require('./lt.js'),
    bang = require('./bang.js'),
    env = require('./env.js'),
    add = require('./add.js'),
    poke = require('./poke.js'),
    neq = require('./neq.js'),
    and = require('./and.js'),
    gte = require('./gte.js'),
    memo = require('./memo.js');

module.exports = function () {
  var attackTime = arguments.length <= 0 || arguments[0] === undefined ? 44100 : arguments[0];
  var decayTime = arguments.length <= 1 || arguments[1] === undefined ? 44100 : arguments[1];
  var _props = arguments[2];

  var props = Object.assign({}, { shape: 'exponential', alpha: 5, trigger: null }, _props);
  var _bang = props.trigger !== null ? props.trigger : bang(),
      phase = accum(1, _bang, { min: 0, max: Infinity, initialValue: -Infinity, shouldWrap: false });

  var bufferData = void 0,
      bufferDataReverse = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0;

  //console.log( 'shape:', props.shape, 'attack time:', attackTime, 'decay time:', decayTime )
  var completeFlag = data([0]);

  // slightly more efficient to use existing phase accumulator for linear envelopes
  if (props.shape === 'linear') {
    out = ifelse(and(gte(phase, 0), lt(phase, attackTime)), div(phase, attackTime), and(gte(phase, 0), lt(phase, add(attackTime, decayTime))), sub(1, div(sub(phase, attackTime), decayTime)), neq(phase, -Infinity), poke(completeFlag, 1, 0, { inline: 0 }), 0);
  } else {
    bufferData = env({ length: 1024, type: props.shape, alpha: props.alpha });
    bufferDataReverse = env({ length: 1024, type: props.shape, alpha: props.alpha, reverse: true });

    out = ifelse(and(gte(phase, 0), lt(phase, attackTime)), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }), and(gte(phase, 0), lt(phase, add(attackTime, decayTime))), peek(bufferDataReverse, div(sub(phase, attackTime), decayTime), { boundmode: 'clamp' }), neq(phase, -Infinity), poke(completeFlag, 1, 0, { inline: 0 }), 0);
  }

  out.isComplete = function () {
    return gen.memory.heap[completeFlag.memory.values.idx];
  };

  out.trigger = function () {
    gen.memory.heap[completeFlag.memory.values.idx] = 0;
    _bang.trigger();
  };

  return out;
};

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":30,"./gte.js":32,"./ifelseif.js":35,"./lt.js":38,"./memo.js":42,"./mul.js":48,"./neq.js":49,"./peek.js":54,"./poke.js":56,"./sub.js":65}],5:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'add',
  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = '',
        sum = 0,
        numCount = 0,
        adderAtEnd = false,
        alreadyFullSummed = true;

    if (inputs.length === 0) return 0;

    out = '  var ' + this.name + ' = ';

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

    if (numCount > 0) {
      out += adderAtEnd || alreadyFullSummed ? sum : ' + ' + sum;
    }

    out += '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var add = Object.create(proto);
  add.id = _gen.getUID();
  add.name = add.basename + add.id;
  add.inputs = args;

  return add;
};

},{"./gen.js":30}],6:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    div = require('./div.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    ifelse = require('./ifelseif.js'),
    lt = require('./lt.js'),
    bang = require('./bang.js'),
    env = require('./env.js'),
    param = require('./param.js'),
    add = require('./add.js'),
    gtp = require('./gtp.js'),
    not = require('./not.js'),
    and = require('./and.js'),
    neq = require('./neq.js'),
    poke = require('./poke.js');

module.exports = function () {
  var attackTime = arguments.length <= 0 || arguments[0] === undefined ? 44 : arguments[0];
  var decayTime = arguments.length <= 1 || arguments[1] === undefined ? 22050 : arguments[1];
  var sustainTime = arguments.length <= 2 || arguments[2] === undefined ? 44100 : arguments[2];
  var sustainLevel = arguments.length <= 3 || arguments[3] === undefined ? .6 : arguments[3];
  var releaseTime = arguments.length <= 4 || arguments[4] === undefined ? 44100 : arguments[4];
  var _props = arguments[5];

  var envTrigger = bang(),
      phase = accum(1, envTrigger, { max: Infinity, shouldWrap: false, initialValue: Infinity }),
      shouldSustain = param(1),
      defaults = {
    shape: 'exponential',
    alpha: 5,
    triggerRelease: false
  },
      props = Object.assign({}, defaults, _props),
      bufferData = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0,
      sustainCondition = void 0,
      releaseAccum = void 0,
      releaseCondition = void 0;

  var completeFlag = data([0]);

  bufferData = env({ length: 1024, alpha: props.alpha, shift: 0, type: props.shape });

  sustainCondition = props.triggerRelease ? shouldSustain : lt(phase, add(attackTime, decayTime, sustainTime));

  releaseAccum = props.triggerRelease ? gtp(sub(sustainLevel, accum(div(sustainLevel, releaseTime), 0, { shouldWrap: false })), 0) : sub(sustainLevel, mul(div(sub(phase, add(attackTime, decayTime, sustainTime)), releaseTime), sustainLevel)), releaseCondition = props.triggerRelease ? not(shouldSustain) : lt(phase, add(attackTime, decayTime, sustainTime, releaseTime));

  out = ifelse(
  // attack
  lt(phase, attackTime), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }),

  // decay
  lt(phase, add(attackTime, decayTime)), peek(bufferData, sub(1, mul(div(sub(phase, attackTime), decayTime), sub(1, sustainLevel))), { boundmode: 'clamp' }),

  // sustain
  and(sustainCondition, neq(phase, Infinity)), peek(bufferData, sustainLevel),

  // release
  releaseCondition, //lt( phase,  attackTime +  decayTime +  sustainTime +  releaseTime ),
  peek(bufferData, releaseAccum,
  //sub(  sustainLevel, mul( div( sub( phase,  attackTime +  decayTime +  sustainTime),  releaseTime ),  sustainLevel ) ),
  { boundmode: 'clamp' }), neq(phase, Infinity), poke(completeFlag, 1, 0, { inline: 0 }), 0);

  out.trigger = function () {
    shouldSustain.value = 1;
    envTrigger.trigger();
  };

  out.isComplete = function () {
    return gen.memory.heap[completeFlag.memory.values.idx];
  };

  out.release = function () {
    shouldSustain.value = 0;
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    gen.memory.heap[releaseAccum.inputs[0].inputs[1].memory.value.idx] = 0;
  };

  return out;
};

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":30,"./gtp.js":33,"./ifelseif.js":35,"./lt.js":38,"./mul.js":48,"./neq.js":49,"./not.js":51,"./param.js":53,"./peek.js":54,"./poke.js":56,"./sub.js":65}],7:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'and',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = '  var ' + this.name + ' = (' + inputs[0] + ' !== 0 && ' + inputs[1] + ' !== 0) | 0\n\n';

    _gen.memo[this.name] = '' + this.name;

    return ['' + this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":30}],8:[function(require,module,exports){
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

},{"./gen.js":30}],9:[function(require,module,exports){
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

},{"./gen.js":30}],10:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js');

module.exports = function () {
    var decayTime = arguments.length <= 0 || arguments[0] === undefined ? 44100 : arguments[0];

    var ssd = history(1),
        t60 = Math.exp(-6.907755278921 / decayTime);

    ssd.in(mul(ssd.out, t60));

    ssd.out.trigger = function () {
        ssd.value = 1;
    };

    return sub(1, ssd.out);
};

},{"./gen.js":30,"./history.js":34,"./mul.js":48,"./sub.js":65}],11:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  gen: function gen() {
    _gen.requestMemory(this.memory);

    var out = '  var ' + this.name + ' = memory[' + this.memory.value.idx + ']\n  if( ' + this.name + ' === 1 ) memory[' + this.memory.value.idx + '] = 0      \n      \n';
    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (_props) {
  var ugen = Object.create(proto),
      props = Object.assign({}, { min: 0, max: 1 }, _props);

  ugen.name = 'bang' + _gen.getUID();

  ugen.min = props.min;
  ugen.max = props.max;

  ugen.trigger = function () {
    _gen.memory.heap[ugen.memory.value.idx] = ugen.max;
  };

  ugen.memory = {
    value: { length: 1, idx: null }
  };

  return ugen;
};

},{"./gen.js":30}],12:[function(require,module,exports){
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

},{"./gen.js":30}],13:[function(require,module,exports){
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

},{"./gen.js":30}],14:[function(require,module,exports){
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

    out = ' var ' + this.name + ' = ' + inputs[0] + '\n  if( ' + this.name + ' > ' + inputs[2] + ' ) ' + this.name + ' = ' + inputs[2] + '\n  else if( ' + this.name + ' < ' + inputs[1] + ' ) ' + this.name + ' = ' + inputs[1] + '\n';
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

},{"./floor.js":27,"./gen.js":30,"./memo.js":42,"./sub.js":65}],15:[function(require,module,exports){
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

},{"./gen.js":30}],16:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'counter',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = void 0;

    if (this.memory.value.idx === null) _gen.requestMemory(this.memory);
    functionBody = this.callback(genName, inputs[0], inputs[1], inputs[2], inputs[3], inputs[4], 'memory[' + this.memory.value.idx + ']', 'memory[' + this.memory.wrap.idx + ']');

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = this.name + '_value';

    if (_gen.memo[this.wrap.name] === undefined) this.wrap.gen();

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _min, _max, _reset, loops, valueRef, wrapRef) {
    var diff = this.max - this.min,
        out = '',
        wrap = '';
    // must check for reset before storing value for output
    if (!(typeof this.inputs[3] === 'number' && this.inputs[3] < 1)) {
      out += '  if( ' + _reset + ' >= 1 ) ' + valueRef + ' = ' + _min + '\n';
    }

    out += '  var ' + this.name + '_value = ' + valueRef + ';\n  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating 

    if (typeof this.max === 'number' && this.max !== Infinity && typeof this.min !== 'number') {
      wrap = '  if( ' + valueRef + ' >= ' + this.max + ' &&  ' + loops + ' > 0) {\n    ' + valueRef + ' -= ' + diff + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
    } else if (this.max !== Infinity && this.min !== Infinity) {
      wrap = '  if( ' + valueRef + ' >= ' + _max + ' &&  ' + loops + ' > 0) {\n    ' + valueRef + ' -= ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else if( ' + valueRef + ' < ' + _min + ' &&  ' + loops + ' > 0) {\n    ' + valueRef + ' += ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
    } else {
      out += '\n';
    }

    out = out + wrap;

    return out;
  }
};

module.exports = function () {
  var incr = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var min = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var max = arguments.length <= 2 || arguments[2] === undefined ? Infinity : arguments[2];
  var reset = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];
  var loops = arguments.length <= 4 || arguments[4] === undefined ? 1 : arguments[4];
  var properties = arguments[5];

  var ugen = Object.create(proto),
      defaults = { initialValue: 0, shouldWrap: true };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    min: min,
    max: max,
    value: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, min, max, reset, loops],
    memory: {
      value: { length: 1, idx: null },
      wrap: { length: 1, idx: null }
    },
    wrap: {
      gen: function gen() {
        if (ugen.memory.wrap.idx === null) {
          _gen.requestMemory(ugen.memory);
        }
        _gen.getInputs(this);
        _gen.memo[this.name] = 'memory[ ' + ugen.memory.wrap.idx + ' ]';
        return 'memory[ ' + ugen.memory.wrap.idx + ' ]';
      }
    }
  }, defaults);

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  ugen.wrap.inputs = [ugen];
  ugen.name = '' + ugen.basename + ugen.uid;
  ugen.wrap.name = ugen.name + '_wrap';
  return ugen;
};

},{"./gen.js":30}],17:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./phasor.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js'),
    phasor = require('./phasor.js');

var proto = {
  basename: 'cycle',

  initTable: function initTable() {
    var buffer = new Float32Array(1024);

    for (var i = 0, l = buffer.length; i < l; i++) {
      buffer[i] = Math.sin(i / l * (Math.PI * 2));
    }

    gen.globals.cycle = data(buffer, 1, { immutable: true });
  }
};

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var _props = arguments[2];

  if (typeof gen.globals.cycle === 'undefined') proto.initTable();
  var props = Object.assign({}, { min: 0 }, _props);

  var ugen = peek(gen.globals.cycle, phasor(frequency, reset, props));
  ugen.name = 'cycle' + gen.getUID();

  return ugen;
};

},{"./data.js":18,"./gen.js":30,"./mul.js":48,"./peek.js":54,"./phasor.js":55}],18:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    utilities = require('./utilities.js'),
    peek = require('./peek.js'),
    poke = require('./poke.js');

var proto = {
  basename: 'data',
  globals: {},

  gen: function gen() {
    var idx = void 0;
    if (_gen.memo[this.name] === undefined) {
      var ugen = this;
      _gen.requestMemory(this.memory, this.immutable);
      idx = this.memory.values.idx;
      try {
        _gen.memory.heap.set(this.buffer, idx);
      } catch (e) {
        console.log(e);
        throw Error('error with request. asking for ' + this.buffer.length + '. current index: ' + _gen.memoryIndex + ' of ' + _gen.memory.heap.length);
      }
      //gen.data[ this.name ] = this
      //return 'gen.memory' + this.name + '.buffer'
      _gen.memo[this.name] = idx;
    } else {
      idx = _gen.memo[this.name];
    }
    return idx;
  }
};

module.exports = function (x) {
  var y = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
  var properties = arguments[2];

  var ugen = void 0,
      buffer = void 0,
      shouldLoad = false;

  if (properties !== undefined && properties.global !== undefined) {
    if (_gen.globals[properties.global]) {
      return _gen.globals[properties.global];
    }
  }

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
    buffer = { length: y > 1 ? y : _gen.samplerate * 60 }; // XXX what???
    shouldLoad = true;
  } else if (x instanceof Float32Array) {
    buffer = x;
  }

  ugen = Object.create(proto);

  Object.assign(ugen, {
    buffer: buffer,
    name: proto.basename + _gen.getUID(),
    dim: buffer.length, // XXX how do we dynamically allocate this?
    channels: 1,
    onload: null,
    then: function then(fnc) {
      ugen.onload = fnc;
      return ugen;
    },

    immutable: properties !== undefined && properties.immutable === true ? true : false,
    load: function load(filename) {
      var promise = utilities.loadSample(filename, ugen);
      promise.then(function (_buffer) {
        ugen.memory.values.length = ugen.dim = _buffer.length;
        ugen.onload();
      });
    },

    memory: {
      values: { length: buffer.length, idx: null }
    }
  });

  if (shouldLoad) ugen.load(x);

  if (properties !== undefined) {
    if (properties.global !== undefined) {
      _gen.globals[properties.global] = ugen;
    }
    if (properties.meta === true) {
      var _loop = function _loop(length, _i2) {
        Object.defineProperty(ugen, _i2, {
          get: function get() {
            return peek(ugen, _i2, { mode: 'simple', interp: 'none' });
          },
          set: function set(v) {
            return poke(ugen, v, _i2);
          }
        });
      };

      for (var _i2 = 0, length = ugen.buffer.length; _i2 < length; _i2++) {
        _loop(length, _i2);
      }
    }
  }

  return ugen;
};

},{"./gen.js":30,"./peek.js":54,"./poke.js":56,"./utilities.js":71}],19:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js');

module.exports = function (in1) {
    var x1 = history(),
        y1 = history(),
        filter = void 0;

    //History x1, y1; y = in1 - x1 + y1*0.9997; x1 = in1; y1 = y; out1 = y;
    filter = memo(add(sub(in1, x1.out), mul(y1.out, .9997)));
    x1.in(in1);
    y1.in(filter);

    return filter;
};

},{"./add.js":5,"./gen.js":30,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":65}],20:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js'),
    t60 = require('./t60.js');

module.exports = function () {
    var decayTime = arguments.length <= 0 || arguments[0] === undefined ? 44100 : arguments[0];
    var props = arguments[1];

    var properties = Object.assign({}, { initValue: 1 }, props),
        ssd = history(properties.initValue);

    ssd.in(mul(ssd.out, t60(decayTime)));

    ssd.out.trigger = function () {
        ssd.value = 1;
    };

    return ssd.out;
};

},{"./gen.js":30,"./history.js":34,"./mul.js":48,"./t60.js":67}],21:[function(require,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _gen = require('./gen.js'),
    data = require('./data.js'),
    poke = require('./poke.js'),
    peek = require('./peek.js'),
    sub = require('./sub.js'),
    wrap = require('./wrap.js'),
    accum = require('./accum.js'),
    memo = require('./memo.js');

var proto = {
  basename: 'delay',

  gen: function gen() {
    var inputs = _gen.getInputs(this);

    _gen.memo[this.name] = inputs[0];

    return inputs[0];
  }
};

var defaults = { size: 512, interp: 'none' };

module.exports = function (in1, taps, properties) {
  var ugen = Object.create(proto);
  var writeIdx = void 0,
      readIdx = void 0,
      delaydata = void 0;

  if (Array.isArray(taps) === false) taps = [taps];

  var props = Object.assign({}, defaults, properties);

  var maxTapSize = Math.max.apply(Math, _toConsumableArray(taps));
  if (props.size < maxTapSize) props.size = maxTapSize;

  delaydata = data(props.size);

  ugen.inputs = [];

  writeIdx = accum(1, 0, { max: props.size, min: 0 });

  for (var i = 0; i < taps.length; i++) {
    ugen.inputs[i] = peek(delaydata, wrap(sub(writeIdx, taps[i]), 0, props.size), { mode: 'samples', interp: props.interp });
  }

  ugen.outputs = ugen.inputs; // XXX ugh, Ugh, UGH! but i guess it works.

  poke(delaydata, in1, writeIdx);

  ugen.name = '' + ugen.basename + _gen.getUID();

  return ugen;
};

},{"./accum.js":2,"./data.js":18,"./gen.js":30,"./memo.js":42,"./peek.js":54,"./poke.js":56,"./sub.js":65,"./wrap.js":73}],22:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js');

module.exports = function (in1) {
  var n1 = history();

  n1.in(in1);

  var ugen = sub(in1, n1.out);
  ugen.name = 'delta' + gen.getUID();

  return ugen;
};

},{"./gen.js":30,"./history.js":34,"./sub.js":65}],23:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'div',
  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = '  var ' + this.name + ' = ',
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

    out += '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var div = Object.create(proto);

  Object.assign(div, {
    id: _gen.getUID(),
    inputs: args
  });

  div.name = div.basename + div.id;

  return div;
};

},{"./gen.js":30}],24:[function(require,module,exports){
'use strict';

var gen = require('./gen'),
    windows = require('./windows'),
    data = require('./data'),
    peek = require('./peek'),
    phasor = require('./phasor'),
    defaults = {
  type: 'triangular', length: 1024, alpha: .15, shift: 0, reverse: false
};

module.exports = function (props) {

  var properties = Object.assign({}, defaults, props);
  var buffer = new Float32Array(properties.length);

  var name = properties.type + '_' + properties.length + '_' + properties.shift + '_' + properties.reverse + '_' + properties.alpha;
  if (typeof gen.globals.windows[name] === 'undefined') {

    for (var i = 0; i < properties.length; i++) {
      buffer[i] = windows[properties.type](properties.length, i, properties.alpha, properties.shift);
    }

    if (properties.reverse === true) {
      buffer.reverse();
    }
    gen.globals.windows[name] = data(buffer);
  }

  var ugen = gen.globals.windows[name];
  ugen.name = 'env' + gen.getUID();

  return ugen;
};

},{"./data":18,"./gen":30,"./peek":54,"./phasor":55,"./windows":72}],25:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'eq',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = this.inputs[0] === this.inputs[1] ? 1 : '  var ' + this.name + ' = (' + inputs[0] + ' === ' + inputs[1] + ') | 0\n\n';

    _gen.memo[this.name] = '' + this.name;

    return ['' + this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":30}],26:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'exp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, Math.exp));

      out = 'gen.exp( ' + inputs[0] + ' )';
    } else {
      out = Math.exp(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var exp = Object.create(proto);

  exp.inputs = [x];

  return exp;
};

},{"./gen.js":30}],27:[function(require,module,exports){
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

},{"./gen.js":30}],28:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'fold',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        out = void 0;

    out = this.createCallback(inputs[0], this.min, this.max);

    _gen.memo[this.name] = this.name + '_value';

    return [this.name + '_value', out];
  },
  createCallback: function createCallback(v, lo, hi) {
    var out = ' var ' + this.name + '_value = ' + v + ',\n      ' + this.name + '_range = ' + hi + ' - ' + lo + ',\n      ' + this.name + '_numWraps = 0\n\n  if(' + this.name + '_value >= ' + hi + '){\n    ' + this.name + '_value -= ' + this.name + '_range\n    if(' + this.name + '_value >= ' + hi + '){\n      ' + this.name + '_numWraps = ((' + this.name + '_value - ' + lo + ') / ' + this.name + '_range) | 0\n      ' + this.name + '_value -= ' + this.name + '_range * ' + this.name + '_numWraps\n    }\n    ' + this.name + '_numWraps++\n  } else if(' + this.name + '_value < ' + lo + '){\n    ' + this.name + '_value += ' + this.name + '_range\n    if(' + this.name + '_value < ' + lo + '){\n      ' + this.name + '_numWraps = ((' + this.name + '_value - ' + lo + ') / ' + this.name + '_range- 1) | 0\n      ' + this.name + '_value -= ' + this.name + '_range * ' + this.name + '_numWraps\n    }\n    ' + this.name + '_numWraps--\n  }\n  if(' + this.name + '_numWraps & 1) ' + this.name + '_value = ' + hi + ' + ' + lo + ' - ' + this.name + '_value\n';
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

},{"./gen.js":30}],29:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _gen = require('./gen.js');

var proto = {
  basename: 'gate',
  controlString: null, // insert into output codegen for determining indexing
  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    _gen.requestMemory(this.memory);

    var lastInputMemoryIdx = 'memory[ ' + this.memory.lastInput.idx + ' ]',
        outputMemoryStartIdx = this.memory.lastInput.idx + 1,
        inputSignal = inputs[0],
        controlSignal = inputs[1];

    /* 
     * we check to see if the current control inputs equals our last input
     * if so, we store the signal input in the memory associated with the currently
     * selected index. If not, we put 0 in the memory associated with the last selected index,
     * change the selected index, and then store the signal in put in the memery assoicated
     * with the newly selected index
     */

    out = ' if( ' + controlSignal + ' !== ' + lastInputMemoryIdx + ' ) {\n    memory[ ' + lastInputMemoryIdx + ' + ' + outputMemoryStartIdx + '  ] = 0 \n    ' + lastInputMemoryIdx + ' = ' + controlSignal + '\n  }\n  memory[ ' + outputMemoryStartIdx + ' + ' + controlSignal + ' ] = ' + inputSignal + '\n\n';
    this.controlString = inputs[1];
    this.initialized = true;

    _gen.memo[this.name] = this.name;

    this.outputs.forEach(function (v) {
      return v.gen();
    });

    return [null, ' ' + out];
  },
  childgen: function childgen() {
    if (this.parent.initialized === false) {
      _gen.getInputs(this); // parent gate is only input of a gate output, should only be gen'd once.
    }

    if (_gen.memo[this.name] === undefined) {
      _gen.requestMemory(this.memory);

      _gen.memo[this.name] = 'memory[ ' + this.memory.value.idx + ' ]';
    }

    return 'memory[ ' + this.memory.value.idx + ' ]';
  }
};

module.exports = function (control, in1, properties) {
  var ugen = Object.create(proto),
      defaults = { count: 2 };

  if ((typeof properties === 'undefined' ? 'undefined' : _typeof(properties)) !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    outputs: [],
    uid: _gen.getUID(),
    inputs: [in1, control],
    memory: {
      lastInput: { length: 1, idx: null }
    },
    initialized: false
  }, defaults);

  ugen.name = '' + ugen.basename + _gen.getUID();

  for (var i = 0; i < ugen.count; i++) {
    ugen.outputs.push({
      index: i,
      gen: proto.childgen,
      parent: ugen,
      inputs: [ugen],
      memory: {
        value: { length: 1, idx: null }
      },
      initialized: false,
      name: ugen.name + '_out' + _gen.getUID()
    });
  }

  return ugen;
};

},{"./gen.js":30}],30:[function(require,module,exports){
'use strict';

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var MemoryHelper = require('memory-helper');

var gen = {

  accum: 0,
  getUID: function getUID() {
    return this.accum++;
  },

  debug: false,
  samplerate: 44100, // change on audiocontext creation
  shouldLocalize: false,
  globals: {
    windows: {}
  },

  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),
  params: new Set(),

  parameters: [],
  endBlock: new Set(),
  histories: new Map(),

  memo: {},

  //data: {},

  /* export
   *
   * place gen functions into another object for easier reference
   */

  export: function _export(obj) {},
  addToEndBlock: function addToEndBlock(v) {
    this.endBlock.add('  ' + v);
  },
  requestMemory: function requestMemory(memorySpec) {
    var immutable = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    for (var key in memorySpec) {
      var request = memorySpec[key];

      //console.log( 'requesting ' + key + ':' , JSON.stringify( request ) )

      if (request.length === undefined) {
        console.log('undefined length for:', key);

        continue;
      }

      request.idx = gen.memory.alloc(request.length, immutable);
    }
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

  createCallback: function createCallback(ugen, mem) {
    var debug = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    var shouldInlineMemory = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
    var memType = arguments.length <= 4 || arguments[4] === undefined ? Float32Array : arguments[4];

    var isStereo = Array.isArray(ugen) && ugen.length > 1,
        callback = void 0,
        channel1 = void 0,
        channel2 = void 0;

    if (typeof mem === 'number' || mem === undefined) {
      mem = MemoryHelper.create(mem, memType);
    }

    //console.log( 'cb memory:', mem )
    this.memory = mem;
    this.memo = {};
    this.endBlock.clear();
    this.closures.clear();
    this.params.clear();
    //this.globals = { windows:{} }

    this.parameters.length = 0;

    this.functionBody = "  'use strict'\n";
    if (shouldInlineMemory === false) this.functionBody += "  var memory = gen.memory\n\n";

    // call .gen() on the head of the graph we are generating the callback for
    //console.log( 'HEAD', ugen )
    for (var i = 0; i < 1 + isStereo; i++) {
      if (typeof ugen[i] === 'number') continue;

      //let channel = isStereo ? ugen[i].gen() : ugen.gen(),
      var channel = isStereo ? this.getInput(ugen[i]) : this.getInput(ugen),
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

    this.histories.forEach(function (value) {
      if (value !== null) value.gen();
    });

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
    //
    if (shouldInlineMemory === true) {
      this.parameters.push('memory');
    }
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

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      var _loop = function _loop() {
        var dict = _step2.value;

        var name = Object.keys(dict)[0],
            ugen = dict[name];

        Object.defineProperty(callback, name, {
          configurable: true,
          get: function get() {
            return ugen.value;
          },
          set: function set(v) {
            ugen.value = v;
          }
        });
        //callback[ name ] = value
      };

      for (var _iterator2 = this.params.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        _loop();
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    callback.data = this.data;
    callback.out = new Float32Array(2);
    callback.parameters = this.parameters.slice(0);

    //if( MemoryHelper.isPrototypeOf( this.memory ) )
    callback.memory = this.memory.heap;

    this.histories.clear();

    return callback;
  },


  /* getInputs
   *
   * Called by each individual ugen when their .gen() method is called to resolve their various inputs.
   * If an input is a number, return the number. If
   * it is an ugen, call .gen() on the ugen, memoize the result and return the result. If the
   * ugen has previously been memoized return the memoized value.
   *
   */
  getInputs: function getInputs(ugen) {
    return ugen.inputs.map(gen.getInput);
  },
  getInput: function getInput(input) {
    var isObject = (typeof input === 'undefined' ? 'undefined' : _typeof(input)) === 'object',
        processedInput = void 0;

    if (isObject) {
      // if input is a ugen...
      //console.log( input.name, gen.memo[ input.name ] )
      if (gen.memo[input.name]) {
        // if it has been memoized...
        processedInput = gen.memo[input.name];
      } else if (Array.isArray(input)) {
        gen.getInput(input[0]);
        gen.getInput(input[1]);
      } else {
        // if not memoized generate code 
        if (typeof input.gen !== 'function') {
          console.log('no gen found:', input, input.gen);
        }
        var code = input.gen();
        //if( code.indexOf( 'Object' ) > -1 ) console.log( 'bad input:', input, code )

        if (Array.isArray(code)) {
          if (!gen.shouldLocalize) {
            gen.functionBody += code[1];
          } else {
            gen.codeName = code[0];
            gen.localizedCode.push(code[1]);
          }
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
  },
  startLocalize: function startLocalize() {
    this.localizedCode = [];
    this.shouldLocalize = true;
  },
  endLocalize: function endLocalize() {
    this.shouldLocalize = false;

    return [this.codeName, this.localizedCode.slice(0)];
  },
  free: function free(graph) {
    if (Array.isArray(graph)) {
      // stereo ugen
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = graph[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var channel = _step3.value;

          this.free(channel);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    } else {
      if ((typeof graph === 'undefined' ? 'undefined' : _typeof(graph)) === 'object') {
        if (graph.memory !== undefined) {
          for (var memoryKey in graph.memory) {
            this.memory.free(graph.memory[memoryKey].idx);
          }
        }
        if (Array.isArray(graph.inputs)) {
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = graph.inputs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var ugen = _step4.value;

              this.free(ugen);
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        }
      }
    }
  }
};

module.exports = gen;

},{"memory-helper":74}],31:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'gt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '(( ' + inputs[0] + ' > ' + inputs[1] + ') | 0 )';
    } else {
      out += inputs[0] > inputs[1] ? 1 : 0;
    }
    out += '\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x, y) {
  var gt = Object.create(proto);

  gt.inputs = [x, y];
  gt.name = gt.basename + _gen.getUID();

  return gt;
};

},{"./gen.js":30}],32:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gte',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' >= ' + inputs[1] + ' | 0 )';
    } else {
      out += inputs[0] >= inputs[1] ? 1 : 0;
    }
    out += '\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x, y) {
  var gt = Object.create(proto);

  gt.inputs = [x, y];
  gt.name = 'gte' + _gen.getUID();

  return gt;
};

},{"./gen.js":30}],33:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gtp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '(' + inputs[0] + ' * ( ( ' + inputs[0] + ' > ' + inputs[1] + ' ) | 0 ) )';
    } else {
      out = inputs[0] * (inputs[0] > inputs[1] | 0);
    }

    return out;
  }
};

module.exports = function (x, y) {
  var gtp = Object.create(proto);

  gtp.inputs = [x, y];

  return gtp;
};

},{"./gen.js":30}],34:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  var in1 = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

  var ugen = {
    inputs: [in1],
    memory: { value: { length: 1, idx: null } },
    recorder: null,

    in: function _in(v) {
      if (_gen.histories.has(v)) {
        var memoHistory = _gen.histories.get(v);
        ugen.name = memoHistory.name;
        return memoHistory;
      }

      var obj = {
        gen: function gen() {
          var inputs = _gen.getInputs(ugen);

          if (ugen.memory.value.idx === null) {
            _gen.requestMemory(ugen.memory);
            _gen.memory.heap[ugen.memory.value.idx] = in1;
          }

          var idx = ugen.memory.value.idx;

          _gen.addToEndBlock('memory[ ' + idx + ' ] = ' + inputs[0]);

          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
          _gen.histories.set(v, obj);

          return inputs[0];
        },

        name: ugen.name + '_in' + _gen.getUID(),
        memory: ugen.memory
      };

      this.inputs[0] = v;

      ugen.recorder = obj;

      return obj;
    },


    out: {
      gen: function gen() {
        if (ugen.memory.value.idx === null) {
          if (_gen.histories.get(ugen.inputs[0]) === undefined) {
            _gen.histories.set(ugen.inputs[0], ugen.recorder);
          }
          _gen.requestMemory(ugen.memory);
          _gen.memory.heap[ugen.memory.value.idx] = parseFloat(in1);
        }
        var idx = ugen.memory.value.idx;

        return 'memory[ ' + idx + ' ] ';
      }
    },

    uid: _gen.getUID()
  };

  ugen.out.memory = ugen.memory;

  ugen.name = 'history' + ugen.uid;
  ugen.out.name = ugen.name + '_out';
  ugen.in._name = ugen.name = '_in';

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  return ugen;
};

},{"./gen.js":30}],35:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'ifelse',

  gen: function gen() {
    var conditionals = this.inputs[0],
        defaultValue = _gen.getInput(conditionals[conditionals.length - 1]),
        out = '  var ' + this.name + '_out = ' + defaultValue + '\n';

    //console.log( 'conditionals:', this.name, conditionals )

    //console.log( 'defaultValue:', defaultValue )

    for (var i = 0; i < conditionals.length - 2; i += 2) {
      var isEndBlock = i === conditionals.length - 3,
          cond = _gen.getInput(conditionals[i]),
          preblock = conditionals[i + 1],
          block = void 0,
          blockName = void 0,
          output = void 0;

      //console.log( 'pb', preblock )

      if (typeof preblock === 'number') {
        block = preblock;
        blockName = null;
      } else {
        if (_gen.memo[preblock.name] === undefined) {
          // used to place all code dependencies in appropriate blocks
          _gen.startLocalize();

          _gen.getInput(preblock);

          block = _gen.endLocalize();
          blockName = block[0];
          block = block[1].join('');
          block = '  ' + block.replace(/\n/gi, '\n  ');
        } else {
          block = '';
          blockName = _gen.memo[preblock.name];
        }
      }

      output = blockName === null ? '  ' + this.name + '_out = ' + block : block + '  ' + this.name + '_out = ' + blockName;

      if (i === 0) out += ' ';
      out += ' if( ' + cond + ' === 1 ) {\n' + output + '\n  }';

      if (!isEndBlock) {
        out += ' else';
      } else {
        out += '\n';
      }
    }

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', out];
  }
};

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var ugen = Object.create(proto),
      conditions = Array.isArray(args[0]) ? args[0] : args;

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [conditions]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":30}],36:[function(require,module,exports){
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

module.exports = function (name) {
  var input = Object.create(proto);

  input.id = _gen.getUID();
  input.name = name !== undefined ? name : '' + input.basename + input.id;
  input[0] = {
    gen: function gen() {
      if (!_gen.parameters.includes(input.name)) _gen.parameters.push(input.name);
      return input.name + '[0]';
    }
  };
  input[1] = {
    gen: function gen() {
      if (!_gen.parameters.includes(input.name)) _gen.parameters.push(input.name);
      return input.name + '[1]';
    }
  };

  return input;
};

},{"./gen.js":30}],37:[function(require,module,exports){
'use strict';

var library = {
  export: function _export(destination) {
    if (destination === window) {
      destination.ssd = library.history; // history is window object property, so use ssd as alias
      destination.input = library.in; // in is a keyword in javascript
      destination.ternary = library.switch; // switch is a keyword in javascript

      delete library.history;
      delete library.in;
      delete library.switch;
    }

    Object.assign(destination, library);

    Object.defineProperty(library, 'samplerate', {
      get: function get() {
        return library.gen.samplerate;
      },
      set: function set(v) {}
    });

    library.in = destination.input;
    library.history = destination.ssd;
    library.switch = destination.ternary;

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
  tanh: require('./tanh.js'),
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
  gte: require('./gte.js'),
  lt: require('./lt.js'),
  lte: require('./lte.js'),
  bool: require('./bool.js'),
  gate: require('./gate.js'),
  train: require('./train.js'),
  slide: require('./slide.js'),
  in: require('./in.js'),
  t60: require('./t60.js'),
  mtof: require('./mtof.js'),
  ltp: require('./ltp.js'), // TODO: test
  gtp: require('./gtp.js'), // TODO: test
  switch: require('./switch.js'),
  mstosamps: require('./mstosamps.js'), // TODO: needs test,
  selector: require('./selector.js'),
  utilities: require('./utilities.js'),
  pow: require('./pow.js'),
  attack: require('./attack.js'),
  decay: require('./decay.js'),
  windows: require('./windows.js'),
  env: require('./env.js'),
  ad: require('./ad.js'),
  adsr: require('./adsr.js'),
  ifelse: require('./ifelseif.js'),
  bang: require('./bang.js'),
  and: require('./and.js'),
  pan: require('./pan.js'),
  eq: require('./eq.js'),
  neq: require('./neq.js'),
  exp: require('./exp.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./data.js":18,"./dcblock.js":19,"./decay.js":20,"./delay.js":21,"./delta.js":22,"./div.js":23,"./env.js":24,"./eq.js":25,"./exp.js":26,"./floor.js":27,"./fold.js":28,"./gate.js":29,"./gen.js":30,"./gt.js":31,"./gte.js":32,"./gtp.js":33,"./history.js":34,"./ifelseif.js":35,"./in.js":36,"./lt.js":38,"./lte.js":39,"./ltp.js":40,"./max.js":41,"./memo.js":42,"./min.js":43,"./mix.js":44,"./mod.js":45,"./mstosamps.js":46,"./mtof.js":47,"./mul.js":48,"./neq.js":49,"./noise.js":50,"./not.js":51,"./pan.js":52,"./param.js":53,"./peek.js":54,"./phasor.js":55,"./poke.js":56,"./pow.js":57,"./rate.js":58,"./round.js":59,"./sah.js":60,"./selector.js":61,"./sign.js":62,"./sin.js":63,"./slide.js":64,"./sub.js":65,"./switch.js":66,"./t60.js":67,"./tan.js":68,"./tanh.js":69,"./train.js":70,"./utilities.js":71,"./windows.js":72,"./wrap.js":73}],38:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'lt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '(( ' + inputs[0] + ' < ' + inputs[1] + ') | 0  )';
    } else {
      out += inputs[0] < inputs[1] ? 1 : 0;
    }
    out += '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];

    return out;
  }
};

module.exports = function (x, y) {
  var lt = Object.create(proto);

  lt.inputs = [x, y];
  lt.name = lt.basename + _gen.getUID();

  return lt;
};

},{"./gen.js":30}],39:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lte',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' <= ' + inputs[1] + ' | 0  )';
    } else {
      out += inputs[0] <= inputs[1] ? 1 : 0;
    }
    out += '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];

    return out;
  }
};

module.exports = function (x, y) {
  var lt = Object.create(proto);

  lt.inputs = [x, y];
  lt.name = 'lte' + _gen.getUID();

  return lt;
};

},{"./gen.js":30}],40:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'ltp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out = '(' + inputs[0] + ' * (( ' + inputs[0] + ' < ' + inputs[1] + ' ) | 0 ) )';
    } else {
      out = inputs[0] * (inputs[0] < inputs[1] | 0);
    }

    return out;
  }
};

module.exports = function (x, y) {
  var ltp = Object.create(proto);

  ltp.inputs = [x, y];

  return ltp;
};

},{"./gen.js":30}],41:[function(require,module,exports){
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

},{"./gen.js":30}],42:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'memo',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  var ' + this.name + ' = ' + inputs[0] + '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1, memoName) {
  var memo = Object.create(proto);

  memo.inputs = [in1];
  memo.id = _gen.getUID();
  memo.name = memoName !== undefined ? memoName + '_' + _gen.getUID() : '' + memo.basename + memo.id;

  return memo;
};

},{"./gen.js":30}],43:[function(require,module,exports){
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

},{"./gen.js":30}],44:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

module.exports = function (in1, in2) {
    var t = arguments.length <= 2 || arguments[2] === undefined ? .5 : arguments[2];

    var ugen = memo(add(mul(in1, sub(1, t)), mul(in2, t)));
    ugen.name = 'mix' + gen.getUID();

    return ugen;
};

},{"./add.js":5,"./gen.js":30,"./memo.js":42,"./mul.js":48,"./sub.js":65}],45:[function(require,module,exports){
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

},{"./gen.js":30}],46:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'mstosamps',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this),
        returnValue = void 0;

    if (isNaN(inputs[0])) {
      out = '  var ' + this.name + ' = ' + _gen.samplerate + ' / 1000 * ' + inputs[0] + ' \n\n';

      _gen.memo[this.name] = out;

      returnValue = [this.name, out];
    } else {
      out = _gen.samplerate / 1000 * this.inputs[0];

      returnValue = out;
    }

    return returnValue;
  }
};

module.exports = function (x) {
  var mstosamps = Object.create(proto);

  mstosamps.inputs = [x];
  mstosamps.name = proto.basename + _gen.getUID();

  return mstosamps;
};

},{"./gen.js":30}],47:[function(require,module,exports){
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

},{"./gen.js":30}],48:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'mul',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = '  var ' + this.name + ' = ',
        sum = 1,
        numCount = 0,
        mulAtEnd = false,
        alreadyFullSummed = true;

    inputs.forEach(function (v, i) {
      if (isNaN(v)) {
        out += v;
        if (i < inputs.length - 1) {
          mulAtEnd = true;
          out += ' * ';
        }
        alreadyFullSummed = false;
      } else {
        if (i === 0) {
          sum = v;
        } else {
          sum *= parseFloat(v);
        }
        numCount++;
      }
    });

    if (numCount > 0) {
      out += mulAtEnd || alreadyFullSummed ? sum : ' * ' + sum;
    }

    out += '\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var mul = Object.create(proto);

  Object.assign(mul, {
    id: _gen.getUID(),
    inputs: args
  });

  mul.name = mul.basename + mul.id;

  return mul;
};

},{"./gen.js":30}],49:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'neq',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = /*this.inputs[0] !== this.inputs[1] ? 1 :*/'  var ' + this.name + ' = (' + inputs[0] + ' !== ' + inputs[1] + ') | 0\n\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (in1, in2) {
  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":30}],50:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'noise',

  gen: function gen() {
    var out = void 0;

    _gen.closures.add({ 'noise': Math.random });

    out = '  var ' + this.name + ' = gen.noise()\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x) {
  var noise = Object.create(proto);
  noise.name = proto.name + _gen.getUID();

  return noise;
};

},{"./gen.js":30}],51:[function(require,module,exports){
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

},{"./gen.js":30}],52:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js');

var proto = {
  basename: 'pan',
  initTable: function initTable() {
    var bufferL = new Float32Array(1024),
        bufferR = new Float32Array(1024);

    var angToRad = Math.PI / 180;
    for (var i = 0; i < 1024; i++) {
      var pan = i * (90 / 1024);
      bufferL[i] = Math.cos(pan * angToRad);
      bufferR[i] = Math.sin(pan * angToRad);
    }

    gen.globals.panL = data(bufferL, 1, { immutable: true });
    gen.globals.panR = data(bufferR, 1, { immutable: true });
  }
};

module.exports = function (leftInput, rightInput) {
  var pan = arguments.length <= 2 || arguments[2] === undefined ? .5 : arguments[2];
  var properties = arguments[3];

  if (gen.globals.panL === undefined) proto.initTable();

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: gen.getUID(),
    inputs: [leftInput, rightInput],
    left: mul(leftInput, peek(gen.globals.panL, pan, { boundmode: 'clamp' })),
    right: mul(rightInput, peek(gen.globals.panR, pan, { boundmode: 'clamp' }))
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./data.js":18,"./gen.js":30,"./mul.js":48,"./peek.js":54}],53:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 'param',

  gen: function gen() {
    _gen.requestMemory(this.memory);

    _gen.params.add(_defineProperty({}, this.name, this));

    this.value = this.initialValue;

    _gen.memo[this.name] = 'memory[' + this.memory.value.idx + ']';

    return _gen.memo[this.name];
  }
};

module.exports = function () {
  var propName = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
  var value = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var ugen = Object.create(proto);

  if (typeof propName !== 'string') {
    ugen.name = ugen.basename + _gen.getUID();
    ugen.initialValue = propName;
  } else {
    ugen.name = propName;
    ugen.initialValue = value;
  }

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        _gen.memory.heap[this.memory.value.idx] = v;
      }
    }
  });

  ugen.memory = {
    value: { length: 1, idx: null }
  };

  return ugen;
};

},{"./gen.js":30}],54:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    dataUgen = require('./data.js');

var proto = {
  basename: 'peek',

  gen: function gen() {
    var genName = 'gen.' + this.name,
        inputs = _gen.getInputs(this),
        out = void 0,
        functionBody = void 0,
        next = void 0,
        lengthIsLog2 = void 0,
        idx = void 0;

    idx = inputs[1];
    lengthIsLog2 = (Math.log2(this.data.buffer.length) | 0) === Math.log2(this.data.buffer.length);

    if (this.mode !== 'simple') {

      functionBody = '  var ' + this.name + '_dataIdx  = ' + idx + ', \n      ' + this.name + '_phase = ' + (this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + (this.data.buffer.length - 1)) + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n';

      if (this.boundmode === 'wrap') {
        next = lengthIsLog2 ? '( ' + this.name + '_index + 1 ) & (' + this.data.buffer.length + ' - 1)' : this.name + '_index + 1 >= ' + this.data.buffer.length + ' ? ' + this.name + '_index + 1 - ' + this.data.buffer.length + ' : ' + this.name + '_index + 1';
      } else if (this.boundmode === 'clamp') {
        next = this.name + '_index + 1 >= ' + (this.data.buffer.length - 1) + ' ? ' + (this.data.buffer.length - 1) + ' : ' + this.name + '_index + 1';
      } else if (this.boundmode === 'fold' || this.boundmode === 'mirror') {
        next = this.name + '_index + 1 >= ' + (this.data.buffer.length - 1) + ' ? ' + this.name + '_index - ' + (this.data.buffer.length - 1) + ' : ' + this.name + '_index + 1';
      } else {
        next = this.name + '_index + 1';
      }

      if (this.interp === 'linear') {
        functionBody += '      ' + this.name + '_frac  = ' + this.name + '_phase - ' + this.name + '_index,\n      ' + this.name + '_base  = memory[ ' + this.name + '_dataIdx +  ' + this.name + '_index ],\n      ' + this.name + '_next  = ' + next + ',';

        if (this.boundmode === 'ignore') {
          functionBody += '\n      ' + this.name + '_out   = ' + this.name + '_index >= ' + (this.data.buffer.length - 1) + ' || ' + this.name + '_index < 0 ? 0 : ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
        } else {
          functionBody += '\n      ' + this.name + '_out   = ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
        }
      } else {
        functionBody += '      ' + this.name + '_out = memory[ ' + this.name + '_dataIdx + ' + this.name + '_index ]\n\n';
      }
    } else {
      // mode is simple
      functionBody = 'memory[ ' + idx + ' + ' + inputs[0] + ' ]';

      return functionBody;
    }

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', functionBody];
  },


  defaults: { channels: 1, mode: 'phase', interp: 'linear', boundmode: 'wrap' }
};

module.exports = function (input_data) {
  var index = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var properties = arguments[2];

  var ugen = Object.create(proto);

  //console.log( dataUgen, gen.data )

  // XXX why is dataUgen not the actual function? some type of browserify nonsense...
  var finalData = typeof input_data.basename === 'undefined' ? _gen.lib.data(input_data) : input_data;

  Object.assign(ugen, {
    'data': finalData,
    dataName: finalData.name,
    uid: _gen.getUID(),
    inputs: [index, finalData]
  }, proto.defaults, properties);

  ugen.name = ugen.basename + ugen.uid;

  return ugen;
};

},{"./data.js":18,"./gen.js":30}],55:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./accum.js'),
    mul = require('./mul.js'),
    proto = { basename: 'phasor' };

var defaults = { min: -1, max: 1 };

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var _props = arguments[2];

  var props = Object.assign({}, defaults, _props);

  var range = props.max - props.min;

  var ugen = typeof frequency === 'number' ? accum(frequency * range / gen.samplerate, reset, props) : accum(mul(frequency, 1 / gen.samplerate / (1 / range)), reset, props);

  ugen.name = proto.basename + gen.getUID();

  return ugen;
};

},{"./accum.js":2,"./gen.js":30,"./mul.js":48}],56:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    mul = require('./mul.js'),
    wrap = require('./wrap.js');

var proto = {
  basename: 'poke',

  gen: function gen() {
    var dataName = 'memory',
        inputs = _gen.getInputs(this),
        idx = void 0,
        out = void 0,
        wrapped = void 0;

    idx = this.data.gen();

    //gen.requestMemory( this.memory )
    //wrapped = wrap( this.inputs[1], 0, this.dataLength ).gen()
    //idx = wrapped[0]
    //gen.functionBody += wrapped[1]
    var outputStr = this.inputs[1] === 0 ? '  ' + dataName + '[ ' + idx + ' ] = ' + inputs[0] + '\n' : '  ' + dataName + '[ ' + idx + ' + ' + inputs[1] + ' ] = ' + inputs[0] + '\n';

    if (this.inline === undefined) {
      _gen.functionBody += outputStr;
    } else {
      return [this.inline, outputStr];
    }
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

  _gen.histories.set(ugen.name, ugen);

  return ugen;
};

},{"./gen.js":30,"./mul.js":48,"./wrap.js":73}],57:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'pow',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add({ 'pow': Math.pow });

      out = 'gen.pow( ' + inputs[0] + ', ' + inputs[1] + ' )';
    } else {
      if (typeof inputs[0] === 'string' && inputs[0][0] === '(') {
        inputs[0] = inputs[0].slice(1, -1);
      }
      if (typeof inputs[1] === 'string' && inputs[1][0] === '(') {
        inputs[1] = inputs[1].slice(1, -1);
      }

      out = Math.pow(parseFloat(inputs[0]), parseFloat(inputs[1]));
    }

    return out;
  }
};

module.exports = function (x, y) {
  var pow = Object.create(proto);

  pow.inputs = [x, y];
  pow.id = _gen.getUID();
  pow.name = pow.basename + '{pow.id}';

  return pow;
};

},{"./gen.js":30}],58:[function(require,module,exports){
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

    out = ' var ' + this.name + '_diff = ' + inputs[0] + ' - ' + genName + '.lastSample\n  if( ' + this.name + '_diff < -.5 ) ' + this.name + '_diff += 1\n  ' + genName + '.phase += ' + this.name + '_diff * ' + inputs[1] + '\n  if( ' + genName + '.phase > 1 ) ' + genName + '.phase -= 1\n  ' + genName + '.lastSample = ' + inputs[0] + '\n';
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

},{"./add.js":5,"./delta.js":22,"./gen.js":30,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":65,"./wrap.js":73}],59:[function(require,module,exports){
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

},{"./gen.js":30}],60:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sah',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    //gen.data[ this.name ] = 0
    //gen.data[ this.name + '_control' ] = 0

    _gen.requestMemory(this.memory);

    out = ' var ' + this.name + '_control = memory[' + this.memory.control.idx + '],\n      ' + this.name + '_trigger = ' + inputs[1] + ' > ' + inputs[2] + ' ? 1 : 0\n\n  if( ' + this.name + '_trigger !== ' + this.name + '_control  ) {\n    if( ' + this.name + '_trigger === 1 ) \n      memory[' + this.memory.value.idx + '] = ' + inputs[0] + '\n    \n    memory[' + this.memory.control.idx + '] = ' + this.name + '_trigger\n  }\n';

    _gen.memo[this.name] = 'gen.data.' + this.name;

    return ['memory[' + this.memory.value.idx + ']', ' ' + out];
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
    inputs: [in1, control, threshold],
    memory: {
      control: { idx: null, length: 1 },
      value: { idx: null, length: 1 }
    }
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":30}],61:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'selector',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0,
        returnValue = 0;

    switch (inputs.length) {
      case 2:
        returnValue = inputs[1];
        break;
      case 3:
        out = '  var ' + this.name + '_out = ' + inputs[0] + ' === 1 ? ' + inputs[1] + ' : ' + inputs[2] + '\n\n';
        returnValue = [this.name + '_out', out];
        break;
      default:
        out = ' var ' + this.name + '_out = 0\n  switch( ' + inputs[0] + ' + 1 ) {\n';

        for (var i = 1; i < inputs.length; i++) {
          out += '    case ' + i + ': ' + this.name + '_out = ' + inputs[i] + '; break;\n';
        }

        out += '  }\n\n';

        returnValue = [this.name + '_out', ' ' + out];
    }

    _gen.memo[this.name] = this.name + '_out';

    return returnValue;
  }
};

module.exports = function () {
  for (var _len = arguments.length, inputs = Array(_len), _key = 0; _key < _len; _key++) {
    inputs[_key] = arguments[_key];
  }

  var ugen = Object.create(proto);

  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: inputs
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":30}],62:[function(require,module,exports){
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

},{"./gen.js":30}],63:[function(require,module,exports){
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

},{"./gen.js":30}],64:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js'),
    gt = require('./gt.js'),
    div = require('./div.js'),
    _switch = require('./switch.js');

module.exports = function (in1) {
    var slideUp = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
    var slideDown = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

    var y1 = history(0),
        filter = void 0,
        slideAmount = void 0;

    //y (n) = y (n-1) + ((x (n) - y (n-1))/slide)
    slideAmount = _switch(gt(in1, y1.out), slideUp, slideDown);

    filter = memo(add(y1.out, div(sub(in1, y1.out), slideAmount)));

    y1.in(filter);

    return filter;
};

},{"./add.js":5,"./div.js":23,"./gen.js":30,"./gt.js":31,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":65,"./switch.js":66}],65:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sub',
  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = 0,
        diff = 0,
        needsParens = false,
        numCount = 0,
        lastNumber = inputs[0],
        lastNumberIsUgen = isNaN(lastNumber),
        subAtEnd = false,
        hasUgens = false,
        returnValue = 0;

    this.inputs.forEach(function (value) {
      if (isNaN(value)) hasUgens = true;
    });

    out = '  var ' + this.name + ' = ';

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

    out += '\n';

    returnValue = [this.name, out];

    _gen.memo[this.name] = this.name;

    return returnValue;
  }
};

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var sub = Object.create(proto);

  Object.assign(sub, {
    id: _gen.getUID(),
    inputs: args
  });

  sub.name = 'sub' + sub.id;

  return sub;
};

},{"./gen.js":30}],66:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'switch',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    if (inputs[1] === inputs[2]) return inputs[1]; // if both potential outputs are the same just return one of them

    out = '  var ' + this.name + '_out = ' + inputs[0] + ' === 1 ? ' + inputs[1] + ' : ' + inputs[2] + '\n';

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

},{"./gen.js":30}],67:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 't60',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this),
        returnValue = void 0;

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, 'exp', Math.exp));

      out = '  var ' + this.name + ' = gen.exp( -6.907755278921 / ' + inputs[0] + ' )\n\n';

      _gen.memo[this.name] = out;

      returnValue = [this.name, out];
    } else {
      out = Math.exp(-6.907755278921 / inputs[0]);

      returnValue = out;
    }

    return returnValue;
  }
};

module.exports = function (x) {
  var t60 = Object.create(proto);

  t60.inputs = [x];
  t60.name = proto.basename + _gen.getUID();

  return t60;
};

},{"./gen.js":30}],68:[function(require,module,exports){
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

},{"./gen.js":30}],69:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'tanh',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'tanh': Math.tanh });

      out = 'gen.tanh( ' + inputs[0] + ' )';
    } else {
      out = Math.tanh(parseFloat(inputs[0]));
    }

    return out;
  }
};

module.exports = function (x) {
  var tanh = Object.create(proto);

  tanh.inputs = [x];
  tanh.id = _gen.getUID();
  tanh.name = tanh.basename + '{tanh.id}';

  return tanh;
};

},{"./gen.js":30}],70:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    lt = require('./lt.js'),
    phasor = require('./phasor.js');

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 440 : arguments[0];
  var pulsewidth = arguments.length <= 1 || arguments[1] === undefined ? .5 : arguments[1];

  var graph = lt(accum(div(frequency, 44100)), .5);

  graph.name = 'train' + gen.getUID();

  return graph;
};

},{"./gen.js":30,"./lt.js":38,"./phasor.js":55}],71:[function(require,module,exports){
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
    this.clear.callbacks.forEach(function (v) {
      return v();
    });
    this.clear.callbacks.length = 0;
  },
  createContext: function createContext() {
    var AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext;
    this.ctx = new AC();

    gen.samplerate = this.ctx.sampleRate;

    var start = function start() {
      if (typeof AC !== 'undefined') {
        if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
          window.removeEventListener('touchstart', start);

          if ('ontouchstart' in document.documentElement) {
            // required to start audio under iOS 6
            var mySource = utilities.ctx.createBufferSource();
            mySource.connect(utilities.ctx.destination);
            mySource.noteOn(0);
          }
        }
      }
    };

    if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
      window.addEventListener('touchstart', start);
    }

    return this;
  },
  createScriptProcessor: function createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor(1024, 0, 2);
    this.clearFunction = function () {
      return 0;
    };
    if (typeof this.callback === 'undefined') this.callback = this.clearFunction;

    this.node.onaudioprocess = function (audioProcessingEvent) {
      var outputBuffer = audioProcessingEvent.outputBuffer;

      var left = outputBuffer.getChannelData(0),
          right = outputBuffer.getChannelData(1),
          isStereo = utilities.isStereo;

      for (var sample = 0; sample < left.length; sample++) {
        var out = utilities.callback();

        if (isStereo === false) {
          left[sample] = right[sample] = out;
        } else {
          left[sample] = out[0];
          right[sample] = out[1];
        }
      }
    };

    this.node.connect(this.ctx.destination);

    return this;
  },
  playGraph: function playGraph(graph, debug) {
    var mem = arguments.length <= 2 || arguments[2] === undefined ? 44100 * 10 : arguments[2];
    var memType = arguments.length <= 3 || arguments[3] === undefined ? Float32Array : arguments[3];

    utilities.clear();
    if (debug === undefined) debug = false;

    this.isStereo = Array.isArray(graph);

    utilities.callback = gen.createCallback(graph, mem, debug, false, memType);

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

},{"./data.js":18,"./gen.js":30}],72:[function(require,module,exports){
'use strict';

/*
 * many windows here adapted from https://github.com/corbanbrook/dsp.js/blob/master/dsp.js
 * starting at line 1427
 * taken 8/15/16
*/

var windows = module.exports = {
  bartlett: function bartlett(length, index) {
    return 2 / (length - 1) * ((length - 1) / 2 - Math.abs(index - (length - 1) / 2));
  },
  bartlettHann: function bartlettHann(length, index) {
    return 0.62 - 0.48 * Math.abs(index / (length - 1) - 0.5) - 0.38 * Math.cos(2 * Math.PI * index / (length - 1));
  },
  blackman: function blackman(length, index, alpha) {
    var a0 = (1 - alpha) / 2,
        a1 = 0.5,
        a2 = alpha / 2;

    return a0 - a1 * Math.cos(2 * Math.PI * index / (length - 1)) + a2 * Math.cos(4 * Math.PI * index / (length - 1));
  },
  cosine: function cosine(length, index) {
    return Math.cos(Math.PI * index / (length - 1) - Math.PI / 2);
  },
  gauss: function gauss(length, index, alpha) {
    return Math.pow(Math.E, -0.5 * Math.pow((index - (length - 1) / 2) / (alpha * (length - 1) / 2), 2));
  },
  hamming: function hamming(length, index) {
    return 0.54 - 0.46 * Math.cos(Math.PI * 2 * index / (length - 1));
  },
  hann: function hann(length, index) {
    return 0.5 * (1 - Math.cos(Math.PI * 2 * index / (length - 1)));
  },
  lanczos: function lanczos(length, index) {
    var x = 2 * index / (length - 1) - 1;
    return Math.sin(Math.PI * x) / (Math.PI * x);
  },
  rectangular: function rectangular(length, index) {
    return 1;
  },
  triangular: function triangular(length, index) {
    return 2 / length * (length / 2 - Math.abs(index - (length - 1) / 2));
  },


  // parabola
  welch: function welch(length, _index, ignore) {
    var shift = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    var index = shift === 0 ? _index : (_index + Math.floor(shift * length)) % length;
    var n_1_over2 = (length - 1) / 2;

    return 1 - Math.pow((index - n_1_over2) / n_1_over2, 2);
  },
  inversewelch: function inversewelch(length, _index, ignore) {
    var shift = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    var index = shift === 0 ? _index : (_index + Math.floor(shift * length)) % length;
    var n_1_over2 = (length - 1) / 2;

    return Math.pow((index - n_1_over2) / n_1_over2, 2);
  },
  parabola: function parabola(length, index) {
    if (index <= length / 2) {
      return windows.inversewelch(length / 2, index) - 1;
    } else {
      return 1 - windows.inversewelch(length / 2, index - length / 2);
    }
  },
  exponential: function exponential(length, index, alpha) {
    return Math.pow(index / length, alpha);
  },
  linear: function linear(length, index) {
    return index / length;
  }
};

},{}],73:[function(require,module,exports){
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
        out = void 0,
        diff = void 0;

    //out = `(((${inputs[0]} - ${this.min}) % ${diff}  + ${diff}) % ${diff} + ${this.min})`
    //const long numWraps = long((v-lo)/range) - (v < lo);
    //return v - range * double(numWraps);  

    if (this.min === 0) {
      diff = max;
    } else if (isNaN(max) || isNaN(min)) {
      diff = max + ' - ' + min;
    } else {
      diff = max - min;
    }

    out = ' var ' + this.name + ' = ' + inputs[0] + '\n  if( ' + this.name + ' < ' + this.min + ' ) ' + this.name + ' += ' + diff + '\n  else if( ' + this.name + ' > ' + this.max + ' ) ' + this.name + ' -= ' + diff + '\n\n';

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

},{"./floor.js":27,"./gen.js":30,"./memo.js":42,"./sub.js":65}],74:[function(require,module,exports){
'use strict'

let MemoryHelper = {
  create( sizeOrBuffer=4096, memtype=Float32Array ) {
    let helper = Object.create( this )

    // conveniently, buffer constructors accept either a size or an array buffer to use...
    // so, no matter which is passed to sizeOrBuffer it should work.
    Object.assign( helper, {
      heap: new memtype( sizeOrBuffer ),
      list: {},
      freeList: {}
    })

    return helper
  },

  alloc( size, immutable ) {
    let idx = -1

    if( size > this.heap.length ) {
      throw Error( 'Allocation request is larger than heap size of ' + this.heap.length )
    }

    for( let key in this.freeList ) {
      let candidate = this.freeList[ key ]

      if( candidate.size >= size ) {
        idx = key

        this.list[ idx ] = { size, immutable, references:1 }

        if( candidate.size !== size ) {
          let newIndex = idx + size,
              newFreeSize

          for( let key in this.list ) {
            if( key > newIndex ) {
              newFreeSize = key - newIndex
              this.freeList[ newIndex ] = newFreeSize
            }
          }
        }

        break
      }
    }

    if( idx !== -1 ) delete this.freeList[ idx ]

    if( idx === -1 ) {
      let keys = Object.keys( this.list ),
          lastIndex

      if( keys.length ) { // if not first allocation...
        lastIndex = parseInt( keys[ keys.length - 1 ] )

        idx = lastIndex + this.list[ lastIndex ].size
      }else{
        idx = 0
      }

      this.list[ idx ] = { size, immutable, references:1 }
    }

    if( idx + size >= this.heap.length ) {
      throw Error( 'No available blocks remain sufficient for allocation request.' )
    }
    return idx
  },

  addReference( index ) {
    if( this.list[ index ] !== undefined ) { 
      this.list[ index ].references++
    }
  },

  free( index ) {
    if( this.list[ index ] === undefined ) {
      throw Error( 'Calling free() on non-existing block.' )
    }

    let slot = this.list[ index ]
    if( slot === 0 ) return
    slot.references--

    if( slot.references === 0 && slot.immutable !== true ) {    
      this.list[ index ] = 0

      let freeBlockSize = 0
      for( let key in this.list ) {
        if( key > index ) {
          freeBlockSize = key - index
          break
        }
      }

      this.freeList[ index ] = freeBlockSize
    }
  },
}

module.exports = MemoryHelper

},{}]},{},[37])(37)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZC5qcyIsImpzL2FkZC5qcyIsImpzL2Fkc3IuanMiLCJqcy9hbmQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2F0dGFjay5qcyIsImpzL2JhbmcuanMiLCJqcy9ib29sLmpzIiwianMvY2VpbC5qcyIsImpzL2NsYW1wLmpzIiwianMvY29zLmpzIiwianMvY291bnRlci5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RjYmxvY2suanMiLCJqcy9kZWNheS5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9lbnYuanMiLCJqcy9lcS5qcyIsImpzL2V4cC5qcyIsImpzL2Zsb29yLmpzIiwianMvZm9sZC5qcyIsImpzL2dhdGUuanMiLCJqcy9nZW4uanMiLCJqcy9ndC5qcyIsImpzL2d0ZS5qcyIsImpzL2d0cC5qcyIsImpzL2hpc3RvcnkuanMiLCJqcy9pZmVsc2VpZi5qcyIsImpzL2luLmpzIiwianMvaW5kZXguanMiLCJqcy9sdC5qcyIsImpzL2x0ZS5qcyIsImpzL2x0cC5qcyIsImpzL21heC5qcyIsImpzL21lbW8uanMiLCJqcy9taW4uanMiLCJqcy9taXguanMiLCJqcy9tb2QuanMiLCJqcy9tc3Rvc2FtcHMuanMiLCJqcy9tdG9mLmpzIiwianMvbXVsLmpzIiwianMvbmVxLmpzIiwianMvbm9pc2UuanMiLCJqcy9ub3QuanMiLCJqcy9wYW4uanMiLCJqcy9wYXJhbS5qcyIsImpzL3BlZWsuanMiLCJqcy9waGFzb3IuanMiLCJqcy9wb2tlLmpzIiwianMvcG93LmpzIiwianMvcmF0ZS5qcyIsImpzL3JvdW5kLmpzIiwianMvc2FoLmpzIiwianMvc2VsZWN0b3IuanMiLCJqcy9zaWduLmpzIiwianMvc2luLmpzIiwianMvc2xpZGUuanMiLCJqcy9zdWIuanMiLCJqcy9zd2l0Y2guanMiLCJqcy90NjAuanMiLCJqcy90YW4uanMiLCJqcy90YW5oLmpzIiwianMvdHJhaW4uanMiLCJqcy91dGlsaXRpZXMuanMiLCJqcy93aW5kb3dzLmpzIiwianMvd3JhcC5qcyIsIi4uL21lbW9yeS1oZWxwZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixRQUFLLEtBQUw7O0FBRUEsc0JBQU07QUFDSixRQUFJLFlBQUo7UUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVCxDQUZBOztBQUlKLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBTCxFQUFhLEtBQUssR0FBTCxDQUFsQyxFQUR1Qjs7QUFHdkIsMEJBQWtCLE9BQU8sQ0FBUCxRQUFsQixDQUh1QjtLQUF6QixNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTixDQURLO0tBTFA7O0FBU0EsV0FBTyxHQUFQLENBYkk7R0FISTtDQUFSOztBQW9CSixPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFOLENBRGdCOztBQUdwQixNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYixDQUhvQjs7QUFLcEIsU0FBTyxHQUFQLENBTG9CO0NBQUw7OztBQ3hCakI7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVA7O0FBRUosSUFBSSxRQUFRO0FBQ1YsWUFBUyxPQUFUOztBQUVBLHNCQUFNO0FBQ0osUUFBSSxhQUFKO1FBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQVQ7UUFDQSxVQUFVLFNBQVMsS0FBSyxJQUFMO1FBQ25CLHFCQUhKLENBREk7O0FB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QUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxVQUFVLFFBQVMsYUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsV0FBVSxRQUFTLGNBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFdBQVUsUUFBUyxjQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxNQUFVLFFBQVMsU0FBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLE1BQVUsUUFBUyxTQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLE1BQVUsUUFBUyxTQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxD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Qzs7QUFVeEMsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFMLEdBQWdCLEtBQUssR0FBTCxDQVZTOztBQVl4QyxTQUFPLElBQVAsQ0Fad0M7Q0FBekI7OztBQ3ZDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonYWJzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguYWJzIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWJzKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFicyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFicyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhYnMuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gYWJzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FjY3VtJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5XG5cbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG4gICAgXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgY2FsbGJhY2soIF9uYW1lLCBfaW5jciwgX3Jlc2V0LCB2YWx1ZVJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICBcbiAgICAvKiB0aHJlZSBkaWZmZXJlbnQgbWV0aG9kcyBvZiB3cmFwcGluZywgdGhpcmQgaXMgbW9zdCBleHBlbnNpdmU6XG4gICAgICpcbiAgICAgKiAxOiByYW5nZSB7MCwxfTogeSA9IHggLSAoeCB8IDApXG4gICAgICogMjogbG9nMih0aGlzLm1heCkgPT0gaW50ZWdlcjogeSA9IHggJiAodGhpcy5tYXggLSAxKVxuICAgICAqIDM6IGFsbCBvdGhlcnM6IGlmKCB4ID49IHRoaXMubWF4ICkgeSA9IHRoaXMubWF4IC14XG4gICAgICpcbiAgICAgKi9cblxuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiggISh0eXBlb2YgdGhpcy5pbnB1dHNbMV0gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzFdIDwgMSkgKSB7IFxuICAgICAgaWYoIHRoaXMucmVzZXRWYWx1ZSAhPT0gdGhpcy5taW4gKSB7XG5cbiAgICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMucmVzZXRWYWx1ZX1cXG5cXG5gXG4gICAgICAgIC8vb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMubWlufVxcblxcbmBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5taW59XFxuXFxuYFxuICAgICAgICAvL291dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLmluaXRpYWxWYWx1ZX1cXG5cXG5gXG4gICAgICB9XG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfVxcbmBcbiAgICBcbiAgICBpZiggdGhpcy5zaG91bGRXcmFwID09PSBmYWxzZSAmJiB0aGlzLnNob3VsZENsYW1wID09PSB0cnVlICkge1xuICAgICAgb3V0ICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA8ICR7dGhpcy5tYXggfSApICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYFxuICAgIH1lbHNle1xuICAgICAgb3V0ICs9IGAgICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgfVxuXG4gICAgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSAgJiYgdGhpcy5zaG91bGRXcmFwTWF4ICkgd3JhcCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gKSAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XFxuYFxuICAgIGlmKCB0aGlzLm1pbiAhPT0gLUluZmluaXR5ICYmIHRoaXMuc2hvdWxkV3JhcE1pbiApIHdyYXAgKz0gYCAgaWYoICR7dmFsdWVSZWZ9IDwgJHt0aGlzLm1pbn0gKSAke3ZhbHVlUmVmfSArPSAke2RpZmZ9XFxuYFxuXG4gICAgLy9pZiggdGhpcy5taW4gPT09IDAgJiYgdGhpcy5tYXggPT09IDEgKSB7IFxuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gLSAoJHt2YWx1ZVJlZn0gfCAwKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5taW4gPT09IDAgJiYgKCBNYXRoLmxvZzIoIHRoaXMubWF4ICkgfCAwICkgPT09IE1hdGgubG9nMiggdGhpcy5tYXggKSApIHtcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9ICYgKCR7dGhpcy5tYXh9IC0gMSlcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSApe1xuICAgIC8vICB3cmFwID0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcblxcbmBcbiAgICAvL31cblxuICAgIG91dCA9IG91dCArIHdyYXAgKyAnXFxuJ1xuXG4gICAgcmV0dXJuIG91dFxuICB9LFxuXG4gIGRlZmF1bHRzIDogeyBtaW46MCwgbWF4OjEsIHJlc2V0VmFsdWU6MCwgaW5pdGlhbFZhbHVlOjAsIHNob3VsZFdyYXA6dHJ1ZSwgc2hvdWxkV3JhcE1heDogdHJ1ZSwgc2hvdWxkV3JhcE1pbjp0cnVlLCBzaG91bGRDbGFtcDpmYWxzZSB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyLCByZXNldD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICAgICAgXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIFxuICAgIHsgXG4gICAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogWyBpbmNyLCByZXNldCBdLFxuICAgICAgbWVtb3J5OiB7XG4gICAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwcm90by5kZWZhdWx0cyxcbiAgICBwcm9wZXJ0aWVzIFxuICApXG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnNob3VsZFdyYXBNYXggPT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnNob3VsZFdyYXBNaW4gPT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggcHJvcGVydGllcy5zaG91bGRXcmFwICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICB1Z2VuLnNob3VsZFdyYXBNaW4gPSB1Z2VuLnNob3VsZFdyYXBNYXggPSBwcm9wZXJ0aWVzLnNob3VsZFdyYXBcbiAgICB9XG4gIH1cblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMucmVzZXRWYWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuICAgIHVnZW4ucmVzZXRWYWx1ZSA9IHVnZW4ubWluXG4gIH1cblxuICBpZiggdWdlbi5pbml0aWFsVmFsdWUgPT09IHVuZGVmaW5lZCApIHVnZW4uaW5pdGlhbFZhbHVlID0gdWdlbi5taW5cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSAgeyByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSB9LFxuICAgIHNldCh2KSB7IGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IH1cbiAgfSlcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Fjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhY29zJzogTWF0aC5hY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWNvcyggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWNvcy5pbnB1dHMgPSBbIHggXVxuICBhY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFjb3MubmFtZSA9IGAke2Fjb3MuYmFzZW5hbWV9e2Fjb3MuaWR9YFxuXG4gIHJldHVybiBhY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIG11bCAgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGRpdiAgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIGRhdGEgICAgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrICAgICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgYWNjdW0gICAgPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBpZmVsc2UgICA9IHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICAgIGx0ICAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYmFuZyAgICAgPSByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICAgIGVudiAgICAgID0gcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIHBva2UgICAgID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICBuZXEgICAgICA9IHJlcXVpcmUoICcuL25lcS5qcycgKSxcbiAgICBhbmQgICAgICA9IHJlcXVpcmUoICcuL2FuZC5qcycgKSxcbiAgICBndGUgICAgICA9IHJlcXVpcmUoICcuL2d0ZS5qcycgKSxcbiAgICBtZW1vICAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGF0dGFja1RpbWUgPSA0NDEwMCwgZGVjYXlUaW1lID0gNDQxMDAsIF9wcm9wcyApID0+IHtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNoYXBlOidleHBvbmVudGlhbCcsIGFscGhhOjUsIHRyaWdnZXI6bnVsbCB9LCBfcHJvcHMgKVxuICBjb25zdCBfYmFuZyA9IHByb3BzLnRyaWdnZXIgIT09IG51bGwgPyBwcm9wcy50cmlnZ2VyIDogYmFuZygpLFxuICAgICAgICBwaGFzZSA9IGFjY3VtKCAxLCBfYmFuZywgeyBtaW46MCwgbWF4OiBJbmZpbml0eSwgaW5pdGlhbFZhbHVlOi1JbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSB9KVxuICAgICAgXG4gIGxldCBidWZmZXJEYXRhLCBidWZmZXJEYXRhUmV2ZXJzZSwgZGVjYXlEYXRhLCBvdXQsIGJ1ZmZlclxuXG4gIC8vY29uc29sZS5sb2coICdzaGFwZTonLCBwcm9wcy5zaGFwZSwgJ2F0dGFjayB0aW1lOicsIGF0dGFja1RpbWUsICdkZWNheSB0aW1lOicsIGRlY2F5VGltZSApXG4gIGxldCBjb21wbGV0ZUZsYWcgPSBkYXRhKCBbMF0gKVxuICBcbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIGlmKCBwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicgKSB7XG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApKSxcbiAgICAgIGRpdiggcGhhc2UsIGF0dGFja1RpbWUgKSxcblxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApICksXG4gICAgICBzdWIoIDEsIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSApLCBkZWNheVRpbWUgKSApLFxuICAgICAgXG4gICAgICBuZXEoIHBoYXNlLCAtSW5maW5pdHkpLFxuICAgICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgICAwIFxuICAgIClcbiAgfSBlbHNlIHtcbiAgICBidWZmZXJEYXRhID0gZW52KHsgbGVuZ3RoOjEwMjQsIHR5cGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhIH0pXG4gICAgYnVmZmVyRGF0YVJldmVyc2UgPSBlbnYoeyBsZW5ndGg6MTAyNCwgdHlwZTpwcm9wcy5zaGFwZSwgYWxwaGE6cHJvcHMuYWxwaGEsIHJldmVyc2U6dHJ1ZSB9KVxuXG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAgIGFuZCggZ3RlKHBoYXNlLDApLCBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSApLCBcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGFSZXZlcnNlLCBkaXYoIHN1YiggcGhhc2UsIGF0dGFja1RpbWUgKSwgZGVjYXlUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSksXG5cbiAgICAgIG5lcSggcGhhc2UsIC1JbmZpbml0eSApLFxuICAgICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgICAwXG4gICAgKVxuICB9XG5cbiAgb3V0LmlzQ29tcGxldGUgPSAoKT0+IGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF1cblxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF0gPSAwXG4gICAgX2JhbmcudHJpZ2dlcigpXG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7IFxuICBiYXNlbmFtZTonYWRkJyxcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dD0nJyxcbiAgICAgICAgc3VtID0gMCwgbnVtQ291bnQgPSAwLCBhZGRlckF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgaWYoIGlucHV0cy5sZW5ndGggPT09IDAgKSByZXR1cm4gMFxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGBcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgIGFkZGVyQXRFbmQgPSB0cnVlXG4gICAgICAgICAgb3V0ICs9ICcgKyAnXG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgbnVtQ291bnQrK1xuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgb3V0ICs9IGFkZGVyQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICsgJyArIHN1bVxuICAgIH1cblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGNvbnN0IGFkZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgYWRkLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFkZC5uYW1lID0gYWRkLmJhc2VuYW1lICsgYWRkLmlkXG4gIGFkZC5pbnB1dHMgPSBhcmdzXG5cbiAgcmV0dXJuIGFkZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBtdWwgICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBzdWIgICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBkaXYgICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBkYXRhICAgICA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayAgICAgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIGFjY3VtICAgID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgaWZlbHNlICAgPSByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgICBsdCAgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIGJhbmcgICAgID0gcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgICBlbnYgICAgICA9IHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgICBwYXJhbSAgICA9IHJlcXVpcmUoICcuL3BhcmFtLmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIGd0cCAgICAgID0gcmVxdWlyZSggJy4vZ3RwLmpzJyApLFxuICAgIG5vdCAgICAgID0gcmVxdWlyZSggJy4vbm90LmpzJyApLFxuICAgIGFuZCAgICAgID0gcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICAgIG5lcSAgICAgID0gcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICAgIHBva2UgICAgID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZT00NCwgZGVjYXlUaW1lPTIyMDUwLCBzdXN0YWluVGltZT00NDEwMCwgc3VzdGFpbkxldmVsPS42LCByZWxlYXNlVGltZT00NDEwMCwgX3Byb3BzICkgPT4ge1xuICBsZXQgZW52VHJpZ2dlciA9IGJhbmcoKSxcbiAgICAgIHBoYXNlID0gYWNjdW0oIDEsIGVudlRyaWdnZXIsIHsgbWF4OiBJbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSwgaW5pdGlhbFZhbHVlOkluZmluaXR5IH0pLFxuICAgICAgc2hvdWxkU3VzdGFpbiA9IHBhcmFtKCAxICksXG4gICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgIHNoYXBlOiAnZXhwb25lbnRpYWwnLFxuICAgICAgICAgYWxwaGE6IDUsXG4gICAgICAgICB0cmlnZ2VyUmVsZWFzZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgX3Byb3BzICksXG4gICAgICBidWZmZXJEYXRhLCBkZWNheURhdGEsIG91dCwgYnVmZmVyLCBzdXN0YWluQ29uZGl0aW9uLCByZWxlYXNlQWNjdW0sIHJlbGVhc2VDb25kaXRpb25cblxuXG4gIGNvbnN0IGNvbXBsZXRlRmxhZyA9IGRhdGEoIFswXSApXG5cbiAgYnVmZmVyRGF0YSA9IGVudih7IGxlbmd0aDoxMDI0LCBhbHBoYTpwcm9wcy5hbHBoYSwgc2hpZnQ6MCwgdHlwZTpwcm9wcy5zaGFwZSB9KVxuXG4gIHN1c3RhaW5Db25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZSBcbiAgICA/IHNob3VsZFN1c3RhaW5cbiAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lICkgKVxuXG4gIHJlbGVhc2VBY2N1bSA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgPyBndHAoIHN1Yiggc3VzdGFpbkxldmVsLCBhY2N1bSggZGl2KCBzdXN0YWluTGV2ZWwsIHJlbGVhc2VUaW1lICkgLCAwLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSkgKSwgMCApXG4gICAgOiBzdWIoIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSApICksIHJlbGVhc2VUaW1lICksIHN1c3RhaW5MZXZlbCApICksIFxuXG4gIHJlbGVhc2VDb25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZVxuICAgID8gbm90KCBzaG91bGRTdXN0YWluIClcbiAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lLCByZWxlYXNlVGltZSApIClcblxuICBvdXQgPSBpZmVsc2UoXG4gICAgLy8gYXR0YWNrIFxuICAgIGx0KCBwaGFzZSwgIGF0dGFja1RpbWUgKSwgXG4gICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAvLyBkZWNheVxuICAgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApLCBcbiAgICBwZWVrKCBidWZmZXJEYXRhLCBzdWIoIDEsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSApLCAgZGVjYXlUaW1lICksIHN1YiggMSwgIHN1c3RhaW5MZXZlbCApICkgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgIC8vIHN1c3RhaW5cbiAgICBhbmQoIHN1c3RhaW5Db25kaXRpb24sIG5lcSggcGhhc2UsIEluZmluaXR5ICkgKSxcbiAgICBwZWVrKCBidWZmZXJEYXRhLCAgc3VzdGFpbkxldmVsICksXG5cbiAgICAvLyByZWxlYXNlXG4gICAgcmVsZWFzZUNvbmRpdGlvbiwgLy9sdCggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSArICByZWxlYXNlVGltZSApLFxuICAgIHBlZWsoIFxuICAgICAgYnVmZmVyRGF0YSxcbiAgICAgIHJlbGVhc2VBY2N1bSwgXG4gICAgICAvL3N1YiggIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSksICByZWxlYXNlVGltZSApLCAgc3VzdGFpbkxldmVsICkgKSwgXG4gICAgICB7IGJvdW5kbW9kZTonY2xhbXAnIH1cbiAgICApLFxuXG4gICAgbmVxKCBwaGFzZSwgSW5maW5pdHkgKSxcbiAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAwXG4gIClcbiAgIFxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAxXG4gICAgZW52VHJpZ2dlci50cmlnZ2VyKClcbiAgfVxuXG4gIG91dC5pc0NvbXBsZXRlID0gKCk9PiBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdXG5cbiAgb3V0LnJlbGVhc2UgPSAoKT0+IHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMFxuICAgIC8vIFhYWCBwcmV0dHkgbmFzdHkuLi4gZ3JhYnMgYWNjdW0gaW5zaWRlIG9mIGd0cCBhbmQgcmVzZXRzIHZhbHVlIG1hbnVhbGx5XG4gICAgLy8gdW5mb3J0dW5hdGVseSBlbnZUcmlnZ2VyIHdvbid0IHdvcmsgYXMgaXQncyBiYWNrIHRvIDAgYnkgdGhlIHRpbWUgdGhlIHJlbGVhc2UgYmxvY2sgaXMgdHJpZ2dlcmVkLi4uXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyByZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4IF0gPSAwXG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gMCAmJiAke2lucHV0c1sxXX0gIT09IDApIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXNpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2FzaW4nOiBNYXRoLmFzaW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhc2luLmlucHV0cyA9IFsgeCBdXG4gIGFzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXNpbi5uYW1lID0gYCR7YXNpbi5iYXNlbmFtZX17YXNpbi5pZH1gXG5cbiAgcmV0dXJuIGFzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXRhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2F0YW4nOiBNYXRoLmF0YW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hdGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hdGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXRhbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhdGFuLmlucHV0cyA9IFsgeCBdXG4gIGF0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXRhbi5uYW1lID0gYCR7YXRhbi5iYXNlbmFtZX17YXRhbi5pZH1gXG5cbiAgcmV0dXJuIGF0YW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwICkgPT4ge1xuICBsZXQgc3NkID0gaGlzdG9yeSAoIDEgKSxcbiAgICAgIHQ2MCA9IE1hdGguZXhwKCAtNi45MDc3NTUyNzg5MjEgLyBkZWNheVRpbWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAgKSApXG5cbiAgc3NkLm91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc3NkLnZhbHVlID0gMVxuICB9XG5cbiAgcmV0dXJuIHN1YiggMSwgc3NkLm91dCApXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBnZW4oKSB7XG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBsZXQgb3V0ID0gXG5gICB2YXIgJHt0aGlzLm5hbWV9ID0gbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1cbiAgaWYoICR7dGhpcy5uYW1lfSA9PT0gMSApIG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dID0gMCAgICAgIFxuICAgICAgXG5gXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBfcHJvcHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46MCwgbWF4OjEgfSwgX3Byb3BzIClcblxuICB1Z2VuLm5hbWUgPSAnYmFuZycgKyBnZW4uZ2V0VUlEKClcblxuICB1Z2VuLm1pbiA9IHByb3BzLm1pblxuICB1Z2VuLm1heCA9IHByb3BzLm1heFxuXG4gIHVnZW4udHJpZ2dlciA9ICgpID0+IHtcbiAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gdWdlbi5tYXggXG4gIH1cblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Jvb2wnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IGAke2lucHV0c1swXX0gPT09IDAgPyAwIDogMWBcbiAgICBcbiAgICAvL2dlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICAvL3JldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgK291dCBdXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidjZWlsJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguY2VpbCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmNlaWwoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY2VpbCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNlaWwgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY2VpbC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBjZWlsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NsaXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9XG5cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9ID4gJHtpbnB1dHNbMl19ICkgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMl19XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA8ICR7aW5wdXRzWzFdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzFdfVxuYFxuICAgIG91dCA9ICcgJyArIG91dFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49LTEsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Nvcyc6IE1hdGguY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jb3MoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY29zLmlucHV0cyA9IFsgeCBdXG4gIGNvcy5pZCA9IGdlbi5nZXRVSUQoKVxuICBjb3MubmFtZSA9IGAke2Nvcy5iYXNlbmFtZX17Y29zLmlkfWBcblxuICByZXR1cm4gY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvdW50ZXInLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHlcbiAgICAgICBcbiAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBmdW5jdGlvbkJvZHkgID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGlucHV0c1syXSwgaW5wdXRzWzNdLCBpbnB1dHNbNF0sICBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gLCBgbWVtb3J5WyR7dGhpcy5tZW1vcnkud3JhcC5pZHh9XWAgIClcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgIFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy53cmFwLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkgdGhpcy53cmFwLmdlbigpXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfbWluLCBfbWF4LCBfcmVzZXQsIGxvb3BzLCB2YWx1ZVJlZiwgd3JhcFJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzNdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1szXSA8IDEpICkgeyBcbiAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49IDEgKSAke3ZhbHVlUmVmfSA9ICR7X21pbn1cXG5gXG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfTtcXG4gICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgXG4gICAgaWYoIHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHR5cGVvZiB0aGlzLm1pbiAhPT0gJ251bWJlcicgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdGhpcy5taW4gIT09IEluZmluaXR5ICkge1xuICAgICAgd3JhcCA9IFxuYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7X21heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7X21heH0gLSAke19taW59XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2UgaWYoICR7dmFsdWVSZWZ9IDwgJHtfbWlufSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gKz0gJHtfbWF4fSAtICR7X21pbn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNle1xuICAgICAgb3V0ICs9ICdcXG4nXG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyPTEsIG1pbj0wLCBtYXg9SW5maW5pdHksIHJlc2V0PTAsIGxvb3BzPTEsICBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdGlhbFZhbHVlOiAwLCBzaG91bGRXcmFwOnRydWUgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW46ICAgIG1pbiwgXG4gICAgbWF4OiAgICBtYXgsXG4gICAgdmFsdWU6ICBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIG1pbiwgbWF4LCByZXNldCwgbG9vcHMgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSxcbiAgICAgIHdyYXA6ICB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSBcbiAgICB9LFxuICAgIHdyYXAgOiB7XG4gICAgICBnZW4oKSB7IFxuICAgICAgICBpZiggdWdlbi5tZW1vcnkud3JhcC5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgfVxuICAgICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWBcbiAgICAgICAgcmV0dXJuIGBtZW1vcnlbICR7dWdlbi5tZW1vcnkud3JhcC5pZHh9IF1gIFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuICBcbiAgdWdlbi53cmFwLmlucHV0cyA9IFsgdWdlbiBdXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG4gIHVnZW4ud3JhcC5uYW1lID0gdWdlbi5uYW1lICsgJ193cmFwJ1xuICByZXR1cm4gdWdlblxufSBcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bT0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgcGhhc29yPXJlcXVpcmUoICcuL3BoYXNvci5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2N5Y2xlJyxcblxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICAgIGZvciggbGV0IGkgPSAwLCBsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gTWF0aC5zaW4oICggaSAvIGwgKSAqICggTWF0aC5QSSAqIDIgKSApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMuY3ljbGUgPSBkYXRhKCBidWZmZXIsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSApXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAsIF9wcm9wcyApID0+IHtcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy5jeWNsZSA9PT0gJ3VuZGVmaW5lZCcgKSBwcm90by5pbml0VGFibGUoKSBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowIH0sIF9wcm9wcyApXG5cbiAgY29uc3QgdWdlbiA9IHBlZWsoIGdlbi5nbG9iYWxzLmN5Y2xlLCBwaGFzb3IoIGZyZXF1ZW5jeSwgcmVzZXQsIHByb3BzICkpXG4gIHVnZW4ubmFtZSA9ICdjeWNsZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgdXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApLFxuICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gIHBva2UgPSByZXF1aXJlKCcuL3Bva2UuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkYXRhJyxcbiAgZ2xvYmFsczoge30sXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpZHhcbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBsZXQgdWdlbiA9IHRoaXNcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUgKSBcbiAgICAgIGlkeCA9IHRoaXMubWVtb3J5LnZhbHVlcy5pZHhcbiAgICAgIHRyeSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcC5zZXQoIHRoaXMuYnVmZmVyLCBpZHggKVxuICAgICAgfWNhdGNoKCBlICkge1xuICAgICAgICBjb25zb2xlLmxvZyggZSApXG4gICAgICAgIHRocm93IEVycm9yKCAnZXJyb3Igd2l0aCByZXF1ZXN0LiBhc2tpbmcgZm9yICcgKyB0aGlzLmJ1ZmZlci5sZW5ndGggKycuIGN1cnJlbnQgaW5kZXg6ICcgKyBnZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBnZW4ubWVtb3J5LmhlYXAubGVuZ3RoIClcbiAgICAgIH1cbiAgICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gdGhpc1xuICAgICAgLy9yZXR1cm4gJ2dlbi5tZW1vcnknICsgdGhpcy5uYW1lICsgJy5idWZmZXInXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpZHhcbiAgICB9ZWxzZXtcbiAgICAgIGlkeCA9IGdlbi5tZW1vWyB0aGlzLm5hbWUgXVxuICAgIH1cbiAgICByZXR1cm4gaWR4XG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCB5PTEsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuLCBidWZmZXIsIHNob3VsZExvYWQgPSBmYWxzZVxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXSApIHtcbiAgICAgIHJldHVybiBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXVxuICAgIH1cbiAgfVxuXG4gIGlmKCB0eXBlb2YgeCA9PT0gJ251bWJlcicgKSB7XG4gICAgaWYoIHkgIT09IDEgKSB7XG4gICAgICBidWZmZXIgPSBbXVxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB5OyBpKysgKSB7XG4gICAgICAgIGJ1ZmZlclsgaSBdID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCB4IClcbiAgICB9XG4gIH1lbHNlIGlmKCBBcnJheS5pc0FycmF5KCB4ICkgKSB7IC8vISAoeCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSApICkge1xuICAgIGxldCBzaXplID0geC5sZW5ndGhcbiAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBzaXplIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IHhbIGkgXVxuICAgIH1cbiAgfWVsc2UgaWYoIHR5cGVvZiB4ID09PSAnc3RyaW5nJyApIHtcbiAgICBidWZmZXIgPSB7IGxlbmd0aDogeSA+IDEgPyB5IDogZ2VuLnNhbXBsZXJhdGUgKiA2MCB9IC8vIFhYWCB3aGF0Pz8/XG4gICAgc2hvdWxkTG9hZCA9IHRydWVcbiAgfWVsc2UgaWYoIHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSB7XG4gICAgYnVmZmVyID0geFxuICB9XG4gIFxuICB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgYnVmZmVyLFxuICAgIG5hbWU6IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpLFxuICAgIGRpbTogIGJ1ZmZlci5sZW5ndGgsIC8vIFhYWCBob3cgZG8gd2UgZHluYW1pY2FsbHkgYWxsb2NhdGUgdGhpcz9cbiAgICBjaGFubmVscyA6IDEsXG4gICAgb25sb2FkOiBudWxsLFxuICAgIHRoZW4oIGZuYyApIHtcbiAgICAgIHVnZW4ub25sb2FkID0gZm5jXG4gICAgICByZXR1cm4gdWdlblxuICAgIH0sXG4gICAgaW1tdXRhYmxlOiBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5pbW11dGFibGUgPT09IHRydWUgPyB0cnVlIDogZmFsc2UsXG4gICAgbG9hZCggZmlsZW5hbWUgKSB7XG4gICAgICBsZXQgcHJvbWlzZSA9IHV0aWxpdGllcy5sb2FkU2FtcGxlKCBmaWxlbmFtZSwgdWdlbiApXG4gICAgICBwcm9taXNlLnRoZW4oICggX2J1ZmZlciApPT4geyBcbiAgICAgICAgdWdlbi5tZW1vcnkudmFsdWVzLmxlbmd0aCA9IHVnZW4uZGltID0gX2J1ZmZlci5sZW5ndGggICAgIFxuICAgICAgICB1Z2VuLm9ubG9hZCgpIFxuICAgICAgfSlcbiAgICB9LFxuICAgIG1lbW9yeSA6IHtcbiAgICAgIHZhbHVlczogeyBsZW5ndGg6YnVmZmVyLmxlbmd0aCwgaWR4Om51bGwgfVxuICAgIH1cbiAgfSlcblxuICBpZiggc2hvdWxkTG9hZCApIHVnZW4ubG9hZCggeCApXG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF0gPSB1Z2VuXG4gICAgfVxuICAgIGlmKCBwcm9wZXJ0aWVzLm1ldGEgPT09IHRydWUgKSB7XG4gICAgICBmb3IoIGxldCBpID0gMCwgbGVuZ3RoID0gdWdlbi5idWZmZXIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgaSwge1xuICAgICAgICAgIGdldCAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGVlayggdWdlbiwgaSwgeyBtb2RlOidzaW1wbGUnLCBpbnRlcnA6J25vbmUnIH0gKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgICAgcmV0dXJuIHBva2UoIHVnZW4sIHYsIGkgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB4MSA9IGhpc3RvcnkoKSxcbiAgICAgIHkxID0gaGlzdG9yeSgpLFxuICAgICAgZmlsdGVyXG5cbiAgLy9IaXN0b3J5IHgxLCB5MTsgeSA9IGluMSAtIHgxICsgeTEqMC45OTk3OyB4MSA9IGluMTsgeTEgPSB5OyBvdXQxID0geTtcbiAgZmlsdGVyID0gbWVtbyggYWRkKCBzdWIoIGluMSwgeDEub3V0ICksIG11bCggeTEub3V0LCAuOTk5NyApICkgKVxuICB4MS5pbiggaW4xIClcbiAgeTEuaW4oIGZpbHRlciApXG5cbiAgcmV0dXJuIGZpbHRlclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgdDYwICAgICA9IHJlcXVpcmUoICcuL3Q2MC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGVjYXlUaW1lID0gNDQxMDAsIHByb3BzICkgPT4ge1xuICBsZXQgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgaW5pdFZhbHVlOjEgfSwgcHJvcHMgKSxcbiAgICAgIHNzZCA9IGhpc3RvcnkgKCBwcm9wZXJ0aWVzLmluaXRWYWx1ZSApXG5cbiAgc3NkLmluKCBtdWwoIHNzZC5vdXQsIHQ2MCggZGVjYXlUaW1lICkgKSApXG5cbiAgc3NkLm91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc3NkLnZhbHVlID0gMVxuICB9XG5cbiAgcmV0dXJuIHNzZC5vdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgICksXG4gICAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICAgIHBva2UgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICAgICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgICBzdWIgID0gcmVxdWlyZSggJy4vc3ViLmpzJyAgKSxcbiAgICAgIHdyYXAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApLFxuICAgICAgYWNjdW09IHJlcXVpcmUoICcuL2FjY3VtLmpzJyksXG4gICAgICBtZW1vID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RlbGF5JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlucHV0c1swXVxuICAgIFxuICAgIHJldHVybiBpbnB1dHNbMF1cbiAgfSxcbn1cblxuY29uc3QgZGVmYXVsdHMgPSB7IHNpemU6IDUxMiwgaW50ZXJwOidub25lJyB9XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHRhcHMsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGNvbnN0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIGxldCB3cml0ZUlkeCwgcmVhZElkeCwgZGVsYXlkYXRhXG5cbiAgaWYoIEFycmF5LmlzQXJyYXkoIHRhcHMgKSA9PT0gZmFsc2UgKSB0YXBzID0gWyB0YXBzIF1cbiAgXG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBjb25zdCBtYXhUYXBTaXplID0gTWF0aC5tYXgoIC4uLnRhcHMgKVxuICBpZiggcHJvcHMuc2l6ZSA8IG1heFRhcFNpemUgKSBwcm9wcy5zaXplID0gbWF4VGFwU2l6ZVxuXG4gIGRlbGF5ZGF0YSA9IGRhdGEoIHByb3BzLnNpemUgKVxuICBcbiAgdWdlbi5pbnB1dHMgPSBbXVxuXG4gIHdyaXRlSWR4ID0gYWNjdW0oIDEsIDAsIHsgbWF4OnByb3BzLnNpemUsIG1pbjowIH0pXG4gIFxuICBmb3IoIGxldCBpID0gMDsgaSA8IHRhcHMubGVuZ3RoOyBpKysgKSB7XG4gICAgdWdlbi5pbnB1dHNbIGkgXSA9IHBlZWsoIGRlbGF5ZGF0YSwgd3JhcCggc3ViKCB3cml0ZUlkeCwgdGFwc1tpXSApLCAwLCBwcm9wcy5zaXplICkseyBtb2RlOidzYW1wbGVzJywgaW50ZXJwOnByb3BzLmludGVycCB9KVxuICB9XG4gIFxuICB1Z2VuLm91dHB1dHMgPSB1Z2VuLmlucHV0cyAvLyBYWFggdWdoLCBVZ2gsIFVHSCEgYnV0IGkgZ3Vlc3MgaXQgd29ya3MuXG5cbiAgcG9rZSggZGVsYXlkYXRhLCBpbjEsIHdyaXRlSWR4IClcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7Z2VuLmdldFVJRCgpfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IG4xID0gaGlzdG9yeSgpXG4gICAgXG4gIG4xLmluKCBpbjEgKVxuXG4gIGxldCB1Z2VuID0gc3ViKCBpbjEsIG4xLm91dCApXG4gIHVnZW4ubmFtZSA9ICdkZWx0YScrZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RpdicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9YCAgdmFyICR7dGhpcy5uYW1lfSA9IGAsXG4gICAgICAgIGRpZmYgPSAwLCBcbiAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTiggbGFzdE51bWJlciApLCBcbiAgICAgICAgZGl2QXRFbmQgPSBmYWxzZVxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpID09PSAwICkgcmV0dXJuXG5cbiAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICBpc0ZpbmFsSWR4ICAgPSBpID09PSBpbnB1dHMubGVuZ3RoIC0gMVxuXG4gICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgLyB2XG4gICAgICAgIG91dCArPSBsYXN0TnVtYmVyXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC8gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLyAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgY29uc3QgZGl2ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggZGl2LCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuICB9KVxuXG4gIGRpdi5uYW1lID0gZGl2LmJhc2VuYW1lICsgZGl2LmlkXG4gIFxuICByZXR1cm4gZGl2XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4nICksXG4gICAgd2luZG93cyA9IHJlcXVpcmUoICcuL3dpbmRvd3MnICksXG4gICAgZGF0YSAgICA9IHJlcXVpcmUoICcuL2RhdGEnICksXG4gICAgcGVlayAgICA9IHJlcXVpcmUoICcuL3BlZWsnICksXG4gICAgcGhhc29yICA9IHJlcXVpcmUoICcuL3BoYXNvcicgKSxcbiAgICBkZWZhdWx0cyA9IHtcbiAgICAgIHR5cGU6J3RyaWFuZ3VsYXInLCBsZW5ndGg6MTAyNCwgYWxwaGE6LjE1LCBzaGlmdDowLCByZXZlcnNlOmZhbHNlIFxuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBwcm9wcyA9PiB7XG4gIFxuICBsZXQgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgcHJvcHMgKVxuICBsZXQgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggcHJvcGVydGllcy5sZW5ndGggKVxuXG4gIGxldCBuYW1lID0gcHJvcGVydGllcy50eXBlICsgJ18nICsgcHJvcGVydGllcy5sZW5ndGggKyAnXycgKyBwcm9wZXJ0aWVzLnNoaWZ0ICsgJ18nICsgcHJvcGVydGllcy5yZXZlcnNlICsgJ18nICsgcHJvcGVydGllcy5hbHBoYVxuICBpZiggdHlwZW9mIGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSA9PT0gJ3VuZGVmaW5lZCcgKSB7IFxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSB3aW5kb3dzWyBwcm9wZXJ0aWVzLnR5cGUgXSggcHJvcGVydGllcy5sZW5ndGgsIGksIHByb3BlcnRpZXMuYWxwaGEsIHByb3BlcnRpZXMuc2hpZnQgKVxuICAgIH1cblxuICAgIGlmKCBwcm9wZXJ0aWVzLnJldmVyc2UgPT09IHRydWUgKSB7IFxuICAgICAgYnVmZmVyLnJldmVyc2UoKVxuICAgIH1cbiAgICBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gPSBkYXRhKCBidWZmZXIgKVxuICB9XG5cbiAgbGV0IHVnZW4gPSBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gXG4gIHVnZW4ubmFtZSA9ICdlbnYnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2VxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSB0aGlzLmlucHV0c1swXSA9PT0gdGhpcy5pbnB1dHNbMV0gPyAxIDogYCAgdmFyICR7dGhpcy5uYW1lfSA9ICgke2lucHV0c1swXX0gPT09ICR7aW5wdXRzWzFdfSkgfCAwXFxuXFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1gLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2V4cCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmV4cCggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5leHAoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBleHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZXhwLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGV4cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2Zsb29yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgLy9nZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5mbG9vciB9KVxuXG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gfCAwIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdIHwgMFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGZsb29yID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGZsb29yLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGZsb29yXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2ZvbGQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9IHRoaXMuY3JlYXRlQ2FsbGJhY2soIGlucHV0c1swXSwgdGhpcy5taW4sIHRoaXMubWF4ICkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dCBdXG4gIH0sXG5cbiAgY3JlYXRlQ2FsbGJhY2soIHYsIGxvLCBoaSApIHtcbiAgICBsZXQgb3V0ID1cbmAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dn0sXG4gICAgICAke3RoaXMubmFtZX1fcmFuZ2UgPSAke2hpfSAtICR7bG99LFxuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gMFxuXG4gIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcysrXG4gIH0gZWxzZSBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlICs9ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA8ICR7bG99KXtcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9ICgoJHt0aGlzLm5hbWV9X3ZhbHVlIC0gJHtsb30pIC8gJHt0aGlzLm5hbWV9X3JhbmdlLSAxKSB8IDBcbiAgICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2UgKiAke3RoaXMubmFtZX1fbnVtV3JhcHNcbiAgICB9XG4gICAgJHt0aGlzLm5hbWV9X251bVdyYXBzLS1cbiAgfVxuICBpZigke3RoaXMubmFtZX1fbnVtV3JhcHMgJiAxKSAke3RoaXMubmFtZX1fdmFsdWUgPSAke2hpfSArICR7bG99IC0gJHt0aGlzLm5hbWV9X3ZhbHVlXG5gXG4gICAgcmV0dXJuICcgJyArIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidnYXRlJyxcbiAgY29udHJvbFN0cmluZzpudWxsLCAvLyBpbnNlcnQgaW50byBvdXRwdXQgY29kZWdlbiBmb3IgZGV0ZXJtaW5pbmcgaW5kZXhpbmdcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuICAgIFxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgbGV0IGxhc3RJbnB1dE1lbW9yeUlkeCA9ICdtZW1vcnlbICcgKyB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgJyBdJyxcbiAgICAgICAgb3V0cHV0TWVtb3J5U3RhcnRJZHggPSB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgMSxcbiAgICAgICAgaW5wdXRTaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIGNvbnRyb2xTaWduYWwgPSBpbnB1dHNbMV1cbiAgICBcbiAgICAvKiBcbiAgICAgKiB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgY29udHJvbCBpbnB1dHMgZXF1YWxzIG91ciBsYXN0IGlucHV0XG4gICAgICogaWYgc28sIHdlIHN0b3JlIHRoZSBzaWduYWwgaW5wdXQgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnRseVxuICAgICAqIHNlbGVjdGVkIGluZGV4LiBJZiBub3QsIHdlIHB1dCAwIGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBsYXN0IHNlbGVjdGVkIGluZGV4LFxuICAgICAqIGNoYW5nZSB0aGUgc2VsZWN0ZWQgaW5kZXgsIGFuZCB0aGVuIHN0b3JlIHRoZSBzaWduYWwgaW4gcHV0IGluIHRoZSBtZW1lcnkgYXNzb2ljYXRlZFxuICAgICAqIHdpdGggdGhlIG5ld2x5IHNlbGVjdGVkIGluZGV4XG4gICAgICovXG4gICAgXG4gICAgb3V0ID1cblxuYCBpZiggJHtjb250cm9sU2lnbmFsfSAhPT0gJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICkge1xuICAgIG1lbW9yeVsgJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICsgJHtvdXRwdXRNZW1vcnlTdGFydElkeH0gIF0gPSAwIFxuICAgICR7bGFzdElucHV0TWVtb3J5SWR4fSA9ICR7Y29udHJvbFNpZ25hbH1cbiAgfVxuICBtZW1vcnlbICR7b3V0cHV0TWVtb3J5U3RhcnRJZHh9ICsgJHtjb250cm9sU2lnbmFsfSBdID0gJHtpbnB1dFNpZ25hbH1cblxuYFxuICAgIHRoaXMuY29udHJvbFN0cmluZyA9IGlucHV0c1sxXVxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHRoaXMub3V0cHV0cy5mb3JFYWNoKCB2ID0+IHYuZ2VuKCkgKVxuXG4gICAgcmV0dXJuIFsgbnVsbCwgJyAnICsgb3V0IF1cbiAgfSxcblxuICBjaGlsZGdlbigpIHtcbiAgICBpZiggdGhpcy5wYXJlbnQuaW5pdGlhbGl6ZWQgPT09IGZhbHNlICkge1xuICAgICAgZ2VuLmdldElucHV0cyggdGhpcyApIC8vIHBhcmVudCBnYXRlIGlzIG9ubHkgaW5wdXQgb2YgYSBnYXRlIG91dHB1dCwgc2hvdWxkIG9ubHkgYmUgZ2VuJ2Qgb25jZS5cbiAgICB9XG5cbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuICBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggY29udHJvbCwgaW4xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY291bnQ6IDIgfVxuXG4gIGlmKCB0eXBlb2YgcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICBvdXRwdXRzOiBbXSxcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGNvbnRyb2wgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGxhc3RJbnB1dDogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgIH0sXG4gICAgaW5pdGlhbGl6ZWQ6ZmFsc2VcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke2dlbi5nZXRVSUQoKX1gXG5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB1Z2VuLmNvdW50OyBpKysgKSB7XG4gICAgdWdlbi5vdXRwdXRzLnB1c2goe1xuICAgICAgaW5kZXg6aSxcbiAgICAgIGdlbjogcHJvdG8uY2hpbGRnZW4sXG4gICAgICBwYXJlbnQ6dWdlbixcbiAgICAgIGlucHV0czogWyB1Z2VuIF0sXG4gICAgICBtZW1vcnk6IHtcbiAgICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplZDpmYWxzZSxcbiAgICAgIG5hbWU6IGAke3VnZW4ubmFtZX1fb3V0JHtnZW4uZ2V0VUlEKCl9YFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGdlbi5qc1xuICpcbiAqIGxvdy1sZXZlbCBjb2RlIGdlbmVyYXRpb24gZm9yIHVuaXQgZ2VuZXJhdG9yc1xuICpcbiAqL1xuXG5sZXQgTWVtb3J5SGVscGVyID0gcmVxdWlyZSggJ21lbW9yeS1oZWxwZXInIClcblxubGV0IGdlbiA9IHtcblxuICBhY2N1bTowLFxuICBnZXRVSUQoKSB7IHJldHVybiB0aGlzLmFjY3VtKysgfSxcbiAgZGVidWc6ZmFsc2UsXG4gIHNhbXBsZXJhdGU6IDQ0MTAwLCAvLyBjaGFuZ2Ugb24gYXVkaW9jb250ZXh0IGNyZWF0aW9uXG4gIHNob3VsZExvY2FsaXplOiBmYWxzZSxcbiAgZ2xvYmFsczp7XG4gICAgd2luZG93czoge30sXG4gIH0sXG4gIFxuICAvKiBjbG9zdXJlc1xuICAgKlxuICAgKiBGdW5jdGlvbnMgdGhhdCBhcmUgaW5jbHVkZWQgYXMgYXJndW1lbnRzIHRvIG1hc3RlciBjYWxsYmFjay4gRXhhbXBsZXM6IE1hdGguYWJzLCBNYXRoLnJhbmRvbSBldGMuXG4gICAqIFhYWCBTaG91bGQgcHJvYmFibHkgYmUgcmVuYW1lZCBjYWxsYmFja1Byb3BlcnRpZXMgb3Igc29tZXRoaW5nIHNpbWlsYXIuLi4gY2xvc3VyZXMgYXJlIG5vIGxvbmdlciB1c2VkLlxuICAgKi9cblxuICBjbG9zdXJlczogbmV3IFNldCgpLFxuICBwYXJhbXM6ICAgbmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6W10sXG4gIGVuZEJsb2NrOiBuZXcgU2V0KCksXG4gIGhpc3RvcmllczogbmV3IE1hcCgpLFxuXG4gIG1lbW86IHt9LFxuXG4gIC8vZGF0YToge30sXG4gIFxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydCggb2JqICkge30sXG5cbiAgYWRkVG9FbmRCbG9jayggdiApIHtcbiAgICB0aGlzLmVuZEJsb2NrLmFkZCggJyAgJyArIHYgKVxuICB9LFxuICBcbiAgcmVxdWVzdE1lbW9yeSggbWVtb3J5U3BlYywgaW1tdXRhYmxlPWZhbHNlICkge1xuICAgIGZvciggbGV0IGtleSBpbiBtZW1vcnlTcGVjICkge1xuICAgICAgbGV0IHJlcXVlc3QgPSBtZW1vcnlTcGVjWyBrZXkgXVxuXG4gICAgICAvL2NvbnNvbGUubG9nKCAncmVxdWVzdGluZyAnICsga2V5ICsgJzonICwgSlNPTi5zdHJpbmdpZnkoIHJlcXVlc3QgKSApXG5cbiAgICAgIGlmKCByZXF1ZXN0Lmxlbmd0aCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBjb25zb2xlLmxvZyggJ3VuZGVmaW5lZCBsZW5ndGggZm9yOicsIGtleSApXG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5pZHggPSBnZW4ubWVtb3J5LmFsbG9jKCByZXF1ZXN0Lmxlbmd0aCwgaW1tdXRhYmxlIClcbiAgICB9XG4gIH0sXG5cbiAgLyogY3JlYXRlQ2FsbGJhY2tcbiAgICpcbiAgICogcGFyYW0gdWdlbiAtIEhlYWQgb2YgZ3JhcGggdG8gYmUgY29kZWdlbidkXG4gICAqXG4gICAqIEdlbmVyYXRlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBhIHBhcnRpY3VsYXIgdWdlbiBncmFwaC5cbiAgICogVGhlIGdlbi5jbG9zdXJlcyBwcm9wZXJ0eSBzdG9yZXMgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZVxuICAgKiBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBmaW5hbCBmdW5jdGlvbjsgdGhlc2UgYXJlIHByZWZpeGVkXG4gICAqIGJlZm9yZSBhbnkgZGVmaW5lZCBwYXJhbXMgdGhlIGdyYXBoIGV4cG9zZXMuIEZvciBleGFtcGxlLCBnaXZlbjpcbiAgICpcbiAgICogZ2VuLmNyZWF0ZUNhbGxiYWNrKCBhYnMoIHBhcmFtKCkgKSApXG4gICAqXG4gICAqIC4uLiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHdpbGwgaGF2ZSBhIHNpZ25hdHVyZSBvZiAoIGFicywgcDAgKS5cbiAgICovXG4gIFxuICBjcmVhdGVDYWxsYmFjayggdWdlbiwgbWVtLCBkZWJ1ZyA9IGZhbHNlLCBzaG91bGRJbmxpbmVNZW1vcnk9ZmFsc2UsIG1lbVR5cGUgPSBGbG9hdDMyQXJyYXkgKSB7XG4gICAgbGV0IGlzU3RlcmVvID0gQXJyYXkuaXNBcnJheSggdWdlbiApICYmIHVnZW4ubGVuZ3RoID4gMSxcbiAgICAgICAgY2FsbGJhY2ssIFxuICAgICAgICBjaGFubmVsMSwgY2hhbm5lbDJcblxuICAgIGlmKCB0eXBlb2YgbWVtID09PSAnbnVtYmVyJyB8fCBtZW0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIG1lbSwgbWVtVHlwZSApXG4gICAgfVxuICAgIFxuICAgIC8vY29uc29sZS5sb2coICdjYiBtZW1vcnk6JywgbWVtIClcbiAgICB0aGlzLm1lbW9yeSA9IG1lbVxuICAgIHRoaXMubWVtbyA9IHt9IFxuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMucGFyYW1zLmNsZWFyKClcbiAgICAvL3RoaXMuZ2xvYmFscyA9IHsgd2luZG93czp7fSB9XG4gICAgXG4gICAgdGhpcy5wYXJhbWV0ZXJzLmxlbmd0aCA9IDBcbiAgICBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiICAndXNlIHN0cmljdCdcXG5cIlxuICAgIGlmKCBzaG91bGRJbmxpbmVNZW1vcnk9PT1mYWxzZSApIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IFwiICB2YXIgbWVtb3J5ID0gZ2VuLm1lbW9yeVxcblxcblwiIFxuXG4gICAgLy8gY2FsbCAuZ2VuKCkgb24gdGhlIGhlYWQgb2YgdGhlIGdyYXBoIHdlIGFyZSBnZW5lcmF0aW5nIHRoZSBjYWxsYmFjayBmb3JcbiAgICAvL2NvbnNvbGUubG9nKCAnSEVBRCcsIHVnZW4gKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMSArIGlzU3RlcmVvOyBpKysgKSB7XG4gICAgICBpZiggdHlwZW9mIHVnZW5baV0gPT09ICdudW1iZXInICkgY29udGludWVcblxuICAgICAgLy9sZXQgY2hhbm5lbCA9IGlzU3RlcmVvID8gdWdlbltpXS5nZW4oKSA6IHVnZW4uZ2VuKCksXG4gICAgICBsZXQgY2hhbm5lbCA9IGlzU3RlcmVvID8gdGhpcy5nZXRJbnB1dCggdWdlbltpXSApIDogdGhpcy5nZXRJbnB1dCggdWdlbiApLCBcbiAgICAgICAgICBib2R5ID0gJydcblxuICAgICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgICAgYm9keSArPSBBcnJheS5pc0FycmF5KCBjaGFubmVsICkgPyBjaGFubmVsWzFdICsgJ1xcbicgKyBjaGFubmVsWzBdIDogY2hhbm5lbFxuXG4gICAgICAvLyBzcGxpdCBib2R5IHRvIGluamVjdCByZXR1cm4ga2V5d29yZCBvbiBsYXN0IGxpbmVcbiAgICAgIGJvZHkgPSBib2R5LnNwbGl0KCdcXG4nKVxuICAgICBcbiAgICAgIC8vaWYoIGRlYnVnICkgY29uc29sZS5sb2coICdmdW5jdGlvbkJvZHkgbGVuZ3RoJywgYm9keSApXG4gICAgICBcbiAgICAgIC8vIG5leHQgbGluZSBpcyB0byBhY2NvbW1vZGF0ZSBtZW1vIGFzIGdyYXBoIGhlYWRcbiAgICAgIGlmKCBib2R5WyBib2R5Lmxlbmd0aCAtMSBdLnRyaW0oKS5pbmRleE9mKCdsZXQnKSA+IC0xICkgeyBib2R5LnB1c2goICdcXG4nICkgfSBcblxuICAgICAgLy8gZ2V0IGluZGV4IG9mIGxhc3QgbGluZVxuICAgICAgbGV0IGxhc3RpZHggPSBib2R5Lmxlbmd0aCAtIDFcblxuICAgICAgLy8gaW5zZXJ0IHJldHVybiBrZXl3b3JkXG4gICAgICBib2R5WyBsYXN0aWR4IF0gPSAnICBnZW4ub3V0WycgKyBpICsgJ10gID0gJyArIGJvZHlbIGxhc3RpZHggXSArICdcXG4nXG5cbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGJvZHkuam9pbignXFxuJylcbiAgICB9XG4gICAgXG4gICAgdGhpcy5oaXN0b3JpZXMuZm9yRWFjaCggdmFsdWUgPT4ge1xuICAgICAgaWYoIHZhbHVlICE9PSBudWxsIClcbiAgICAgICAgdmFsdWUuZ2VuKCkgICAgICBcbiAgICB9KVxuXG4gICAgbGV0IHJldHVyblN0YXRlbWVudCA9IGlzU3RlcmVvID8gJyAgcmV0dXJuIGdlbi5vdXQnIDogJyAgcmV0dXJuIGdlbi5vdXRbMF0nXG4gICAgXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5zcGxpdCgnXFxuJylcblxuICAgIGlmKCB0aGlzLmVuZEJsb2NrLnNpemUgKSB7IFxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5jb25jYXQoIEFycmF5LmZyb20oIHRoaXMuZW5kQmxvY2sgKSApXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCByZXR1cm5TdGF0ZW1lbnQgKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAgICB9XG4gICAgLy8gcmVhc3NlbWJsZSBmdW5jdGlvbiBib2R5XG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKVxuXG4gICAgLy8gd2UgY2FuIG9ubHkgZHluYW1pY2FsbHkgY3JlYXRlIGEgbmFtZWQgZnVuY3Rpb24gYnkgZHluYW1pY2FsbHkgY3JlYXRpbmcgYW5vdGhlciBmdW5jdGlvblxuICAgIC8vIHRvIGNvbnN0cnVjdCB0aGUgbmFtZWQgZnVuY3Rpb24hIHNoZWVzaC4uLlxuICAgIC8vXG4gICAgaWYoIHNob3VsZElubGluZU1lbW9yeSA9PT0gdHJ1ZSApIHtcbiAgICAgIHRoaXMucGFyYW1ldGVycy5wdXNoKCAnbWVtb3J5JyApXG4gICAgfVxuICAgIGxldCBidWlsZFN0cmluZyA9IGByZXR1cm4gZnVuY3Rpb24gZ2VuKCAkeyB0aGlzLnBhcmFtZXRlcnMuam9pbignLCcpIH0gKXsgXFxuJHsgdGhpcy5mdW5jdGlvbkJvZHkgfVxcbn1gXG4gICAgXG4gICAgaWYoIHRoaXMuZGVidWcgfHwgZGVidWcgKSBjb25zb2xlLmxvZyggYnVpbGRTdHJpbmcgKSBcblxuICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKCBidWlsZFN0cmluZyApKClcblxuICAgIFxuICAgIC8vIGFzc2lnbiBwcm9wZXJ0aWVzIHRvIG5hbWVkIGZ1bmN0aW9uXG4gICAgZm9yKCBsZXQgZGljdCBvZiB0aGlzLmNsb3N1cmVzLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHZhbHVlID0gZGljdFsgbmFtZSBdXG5cbiAgICAgIGNhbGxiYWNrWyBuYW1lIF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5wYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdWdlbiA9IGRpY3RbIG5hbWUgXVxuICAgICAgXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGNhbGxiYWNrLCBuYW1lLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gdWdlbi52YWx1ZSB9LFxuICAgICAgICBzZXQodil7IHVnZW4udmFsdWUgPSB2IH1cbiAgICAgIH0pXG4gICAgICAvL2NhbGxiYWNrWyBuYW1lIF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIGNhbGxiYWNrLmRhdGEgPSB0aGlzLmRhdGFcbiAgICBjYWxsYmFjay5vdXQgID0gbmV3IEZsb2F0MzJBcnJheSggMiApXG4gICAgY2FsbGJhY2sucGFyYW1ldGVycyA9IHRoaXMucGFyYW1ldGVycy5zbGljZSggMCApXG5cbiAgICAvL2lmKCBNZW1vcnlIZWxwZXIuaXNQcm90b3R5cGVPZiggdGhpcy5tZW1vcnkgKSApIFxuICAgIGNhbGxiYWNrLm1lbW9yeSA9IHRoaXMubWVtb3J5LmhlYXBcblxuICAgIHRoaXMuaGlzdG9yaWVzLmNsZWFyKClcblxuICAgIHJldHVybiBjYWxsYmFja1xuICB9LFxuICBcbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIENhbGxlZCBieSBlYWNoIGluZGl2aWR1YWwgdWdlbiB3aGVuIHRoZWlyIC5nZW4oKSBtZXRob2QgaXMgY2FsbGVkIHRvIHJlc29sdmUgdGhlaXIgdmFyaW91cyBpbnB1dHMuXG4gICAqIElmIGFuIGlucHV0IGlzIGEgbnVtYmVyLCByZXR1cm4gdGhlIG51bWJlci4gSWZcbiAgICogaXQgaXMgYW4gdWdlbiwgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0cyggdWdlbiApIHtcbiAgICByZXR1cm4gdWdlbi5pbnB1dHMubWFwKCBnZW4uZ2V0SW5wdXQgKSBcbiAgfSxcblxuICBnZXRJbnB1dCggaW5wdXQgKSB7XG4gICAgbGV0IGlzT2JqZWN0ID0gdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyxcbiAgICAgICAgcHJvY2Vzc2VkSW5wdXRcblxuICAgIGlmKCBpc09iamVjdCApIHsgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uIFxuICAgICAgLy9jb25zb2xlLmxvZyggaW5wdXQubmFtZSwgZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApXG4gICAgICBpZiggZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApIHsgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBnZW4ubWVtb1sgaW5wdXQubmFtZSBdXG4gICAgICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaW5wdXQgKSApIHtcbiAgICAgICAgZ2VuLmdldElucHV0KCBpbnB1dFswXSApXG4gICAgICAgIGdlbi5nZXRJbnB1dCggaW5wdXRbMV0gKVxuICAgICAgfWVsc2V7IC8vIGlmIG5vdCBtZW1vaXplZCBnZW5lcmF0ZSBjb2RlICBcbiAgICAgICAgaWYoIHR5cGVvZiBpbnB1dC5nZW4gIT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coICdubyBnZW4gZm91bmQ6JywgaW5wdXQsIGlucHV0LmdlbiApXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvZGUgPSBpbnB1dC5nZW4oKVxuICAgICAgICAvL2lmKCBjb2RlLmluZGV4T2YoICdPYmplY3QnICkgPiAtMSApIGNvbnNvbGUubG9nKCAnYmFkIGlucHV0OicsIGlucHV0LCBjb2RlIClcbiAgICAgICAgXG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBjb2RlICkgKSB7XG4gICAgICAgICAgaWYoICFnZW4uc2hvdWxkTG9jYWxpemUgKSB7XG4gICAgICAgICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGdlbi5jb2RlTmFtZSA9IGNvZGVbMF1cbiAgICAgICAgICAgIGdlbi5sb2NhbGl6ZWRDb2RlLnB1c2goIGNvZGVbMV0gKVxuICAgICAgICAgIH1cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnYWZ0ZXIgR0VOJyAsIHRoaXMuZnVuY3Rpb25Cb2R5IClcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ZWxzZXsgLy8gaXQgaW5wdXQgaXMgYSBudW1iZXJcbiAgICAgIHByb2Nlc3NlZElucHV0ID0gaW5wdXRcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvY2Vzc2VkSW5wdXRcbiAgfSxcblxuICBzdGFydExvY2FsaXplKCkge1xuICAgIHRoaXMubG9jYWxpemVkQ29kZSA9IFtdXG4gICAgdGhpcy5zaG91bGRMb2NhbGl6ZSA9IHRydWVcbiAgfSxcbiAgZW5kTG9jYWxpemUoKSB7XG4gICAgdGhpcy5zaG91bGRMb2NhbGl6ZSA9IGZhbHNlXG5cbiAgICByZXR1cm4gWyB0aGlzLmNvZGVOYW1lLCB0aGlzLmxvY2FsaXplZENvZGUuc2xpY2UoMCkgXVxuICB9LFxuXG4gIGZyZWUoIGdyYXBoICkge1xuICAgIGlmKCBBcnJheS5pc0FycmF5KCBncmFwaCApICkgeyAvLyBzdGVyZW8gdWdlblxuICAgICAgZm9yKCBsZXQgY2hhbm5lbCBvZiBncmFwaCApIHtcbiAgICAgICAgdGhpcy5mcmVlKCBjaGFubmVsIClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBncmFwaCA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgIGlmKCBncmFwaC5tZW1vcnkgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICBmb3IoIGxldCBtZW1vcnlLZXkgaW4gZ3JhcGgubWVtb3J5ICkge1xuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZnJlZSggZ3JhcGgubWVtb3J5WyBtZW1vcnlLZXkgXS5pZHggKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggZ3JhcGguaW5wdXRzICkgKSB7XG4gICAgICAgICAgZm9yKCBsZXQgdWdlbiBvZiBncmFwaC5pbnB1dHMgKSB7XG4gICAgICAgICAgICB0aGlzLmZyZWUoIHVnZW4gKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdlblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidndCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCggJHtpbnB1dHNbMF19ID4gJHtpbnB1dHNbMV19KSB8IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA+IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cbiAgZ3QubmFtZSA9IGd0LmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidndGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCggJHtpbnB1dHNbMF19ID49ICR7aW5wdXRzWzFdfSB8IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA+PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG5cXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndC5pbnB1dHMgPSBbIHgseSBdXG4gIGd0Lm5hbWUgPSAnZ3RlJyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBndFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0cCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ID0gYCgke2lucHV0c1sgMCBdfSAqICggKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCAoIGlucHV0c1swXSA+IGlucHV0c1sxXSApIHwgMCApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0cCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndHAuaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBndHBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMT0wICkgPT4ge1xuICBsZXQgdWdlbiA9IHtcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG4gICAgbWVtb3J5OiB7IHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSB9LFxuICAgIHJlY29yZGVyOiBudWxsLFxuXG4gICAgaW4oIHYgKSB7XG4gICAgICBpZiggZ2VuLmhpc3Rvcmllcy5oYXMoIHYgKSApe1xuICAgICAgICBsZXQgbWVtb0hpc3RvcnkgPSBnZW4uaGlzdG9yaWVzLmdldCggdiApXG4gICAgICAgIHVnZW4ubmFtZSA9IG1lbW9IaXN0b3J5Lm5hbWVcbiAgICAgICAgcmV0dXJuIG1lbW9IaXN0b3J5XG4gICAgICB9XG5cbiAgICAgIGxldCBvYmogPSB7XG4gICAgICAgIGdlbigpIHtcbiAgICAgICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdWdlbiApXG5cbiAgICAgICAgICBpZiggdWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdWdlbi5tZW1vcnkudmFsdWUuaWR4IF0gPSBpbjFcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4XG4gICAgICAgICAgXG4gICAgICAgICAgZ2VuLmFkZFRvRW5kQmxvY2soICdtZW1vcnlbICcgKyBpZHggKyAnIF0gPSAnICsgaW5wdXRzWyAwIF0gKVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIHJldHVybiB1Z2VuIHRoYXQgaXMgYmVpbmcgcmVjb3JkZWQgaW5zdGVhZCBvZiBzc2QuXG4gICAgICAgICAgLy8gdGhpcyBlZmZlY3RpdmVseSBtYWtlcyBhIGNhbGwgdG8gc3NkLnJlY29yZCgpIHRyYW5zcGFyZW50IHRvIHRoZSBncmFwaC5cbiAgICAgICAgICAvLyByZWNvcmRpbmcgaXMgdHJpZ2dlcmVkIGJ5IHByaW9yIGNhbGwgdG8gZ2VuLmFkZFRvRW5kQmxvY2suXG4gICAgICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHYsIG9iaiApXG5cbiAgICAgICAgICByZXR1cm4gaW5wdXRzWyAwIF1cbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogdWdlbi5uYW1lICsgJ19pbicrZ2VuLmdldFVJRCgpLFxuICAgICAgICBtZW1vcnk6IHVnZW4ubWVtb3J5XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5wdXRzWyAwIF0gPSB2XG4gICAgICBcbiAgICAgIHVnZW4ucmVjb3JkZXIgPSBvYmpcblxuICAgICAgcmV0dXJuIG9ialxuICAgIH0sXG4gICAgXG4gICAgb3V0OiB7XG4gICAgICAgICAgICBcbiAgICAgIGdlbigpIHtcbiAgICAgICAgaWYoIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICBpZiggZ2VuLmhpc3Rvcmllcy5nZXQoIHVnZW4uaW5wdXRzWzBdICkgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGdlbi5oaXN0b3JpZXMuc2V0KCB1Z2VuLmlucHV0c1swXSwgdWdlbi5yZWNvcmRlciApXG4gICAgICAgICAgfVxuICAgICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSApXG4gICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IHBhcnNlRmxvYXQoIGluMSApXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeFxuICAgICAgICAgXG4gICAgICAgIHJldHVybiAnbWVtb3J5WyAnICsgaWR4ICsgJyBdICdcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHVpZDogZ2VuLmdldFVJRCgpLFxuICB9XG4gIFxuICB1Z2VuLm91dC5tZW1vcnkgPSB1Z2VuLm1lbW9yeSBcblxuICB1Z2VuLm5hbWUgPSAnaGlzdG9yeScgKyB1Z2VuLnVpZFxuICB1Z2VuLm91dC5uYW1lID0gdWdlbi5uYW1lICsgJ19vdXQnXG4gIHVnZW4uaW4uX25hbWUgID0gdWdlbi5uYW1lID0gJ19pbidcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidpZmVsc2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29uZGl0aW9uYWxzID0gdGhpcy5pbnB1dHNbMF0sXG4gICAgICAgIGRlZmF1bHRWYWx1ZSA9IGdlbi5nZXRJbnB1dCggY29uZGl0aW9uYWxzWyBjb25kaXRpb25hbHMubGVuZ3RoIC0gMV0gKSxcbiAgICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2RlZmF1bHRWYWx1ZX1cXG5gIFxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2NvbmRpdGlvbmFsczonLCB0aGlzLm5hbWUsIGNvbmRpdGlvbmFscyApXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnZGVmYXVsdFZhbHVlOicsIGRlZmF1bHRWYWx1ZSApXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGNvbmRpdGlvbmFscy5sZW5ndGggLSAyOyBpKz0gMiApIHtcbiAgICAgIGxldCBpc0VuZEJsb2NrID0gaSA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCAtIDMsXG4gICAgICAgICAgY29uZCAgPSBnZW4uZ2V0SW5wdXQoIGNvbmRpdGlvbmFsc1sgaSBdICksXG4gICAgICAgICAgcHJlYmxvY2sgPSBjb25kaXRpb25hbHNbIGkrMSBdLFxuICAgICAgICAgIGJsb2NrLCBibG9ja05hbWUsIG91dHB1dFxuXG4gICAgICAvL2NvbnNvbGUubG9nKCAncGInLCBwcmVibG9jayApXG5cbiAgICAgIGlmKCB0eXBlb2YgcHJlYmxvY2sgPT09ICdudW1iZXInICl7XG4gICAgICAgIGJsb2NrID0gcHJlYmxvY2tcbiAgICAgICAgYmxvY2tOYW1lID0gbnVsbFxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBnZW4ubWVtb1sgcHJlYmxvY2submFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgLy8gdXNlZCB0byBwbGFjZSBhbGwgY29kZSBkZXBlbmRlbmNpZXMgaW4gYXBwcm9wcmlhdGUgYmxvY2tzXG4gICAgICAgICAgZ2VuLnN0YXJ0TG9jYWxpemUoKVxuXG4gICAgICAgICAgZ2VuLmdldElucHV0KCBwcmVibG9jayApXG5cbiAgICAgICAgICBibG9jayA9IGdlbi5lbmRMb2NhbGl6ZSgpXG4gICAgICAgICAgYmxvY2tOYW1lID0gYmxvY2tbMF1cbiAgICAgICAgICBibG9jayA9IGJsb2NrWyAxIF0uam9pbignJylcbiAgICAgICAgICBibG9jayA9ICcgICcgKyBibG9jay5yZXBsYWNlKCAvXFxuL2dpLCAnXFxuICAnIClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYmxvY2sgPSAnJ1xuICAgICAgICAgIGJsb2NrTmFtZSA9IGdlbi5tZW1vWyBwcmVibG9jay5uYW1lIF1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvdXRwdXQgPSBibG9ja05hbWUgPT09IG51bGwgPyBcbiAgICAgICAgYCAgJHt0aGlzLm5hbWV9X291dCA9ICR7YmxvY2t9YCA6XG4gICAgICAgIGAke2Jsb2NrfSAgJHt0aGlzLm5hbWV9X291dCA9ICR7YmxvY2tOYW1lfWBcbiAgICAgIFxuICAgICAgaWYoIGk9PT0wICkgb3V0ICs9ICcgJ1xuICAgICAgb3V0ICs9IFxuYCBpZiggJHtjb25kfSA9PT0gMSApIHtcbiR7b3V0cHV0fVxuICB9YFxuXG4gICAgICBpZiggIWlzRW5kQmxvY2sgKSB7XG4gICAgICAgIG91dCArPSBgIGVsc2VgXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGBcXG5gXG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfV9vdXRgXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9X291dGAsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSggYXJnc1swXSApID8gYXJnc1swXSA6IGFyZ3NcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgY29uZGl0aW9ucyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2luJyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLnBhcmFtZXRlcnMucHVzaCggdGhpcy5uYW1lIClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiB0aGlzLm5hbWVcbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIG5hbWUgKSA9PiB7XG4gIGxldCBpbnB1dCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBpbnB1dC5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIGlucHV0Lm5hbWUgPSBuYW1lICE9PSB1bmRlZmluZWQgPyBuYW1lIDogYCR7aW5wdXQuYmFzZW5hbWV9JHtpbnB1dC5pZH1gXG4gIGlucHV0WzBdID0ge1xuICAgIGdlbigpIHtcbiAgICAgIGlmKCAhIGdlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5wdXNoKCBpbnB1dC5uYW1lIClcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1swXSdcbiAgICB9XG4gIH1cbiAgaW5wdXRbMV0gPSB7XG4gICAgZ2VuKCkge1xuICAgICAgaWYoICEgZ2VuLnBhcmFtZXRlcnMuaW5jbHVkZXMoIGlucHV0Lm5hbWUgKSApIGdlbi5wYXJhbWV0ZXJzLnB1c2goIGlucHV0Lm5hbWUgKVxuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzFdJ1xuICAgIH1cbiAgfVxuXG5cbiAgcmV0dXJuIGlucHV0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGxpYnJhcnkgPSB7XG4gIGV4cG9ydCggZGVzdGluYXRpb24gKSB7XG4gICAgaWYoIGRlc3RpbmF0aW9uID09PSB3aW5kb3cgKSB7XG4gICAgICBkZXN0aW5hdGlvbi5zc2QgPSBsaWJyYXJ5Lmhpc3RvcnkgICAgLy8gaGlzdG9yeSBpcyB3aW5kb3cgb2JqZWN0IHByb3BlcnR5LCBzbyB1c2Ugc3NkIGFzIGFsaWFzXG4gICAgICBkZXN0aW5hdGlvbi5pbnB1dCA9IGxpYnJhcnkuaW4gICAgICAgLy8gaW4gaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcbiAgICAgIGRlc3RpbmF0aW9uLnRlcm5hcnkgPSBsaWJyYXJ5LnN3aXRjaCAvLyBzd2l0Y2ggaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcblxuICAgICAgZGVsZXRlIGxpYnJhcnkuaGlzdG9yeVxuICAgICAgZGVsZXRlIGxpYnJhcnkuaW5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LnN3aXRjaFxuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oIGRlc3RpbmF0aW9uLCBsaWJyYXJ5IClcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggbGlicmFyeSwgJ3NhbXBsZXJhdGUnLCB7XG4gICAgICBnZXQoKSB7IHJldHVybiBsaWJyYXJ5Lmdlbi5zYW1wbGVyYXRlIH0sXG4gICAgICBzZXQodikge31cbiAgICB9KVxuXG4gICAgbGlicmFyeS5pbiA9IGRlc3RpbmF0aW9uLmlucHV0XG4gICAgbGlicmFyeS5oaXN0b3J5ID0gZGVzdGluYXRpb24uc3NkXG4gICAgbGlicmFyeS5zd2l0Y2ggPSBkZXN0aW5hdGlvbi50ZXJuYXJ5XG5cbiAgICBkZXN0aW5hdGlvbi5jbGlwID0gbGlicmFyeS5jbGFtcFxuICB9LFxuXG4gIGdlbjogICAgICByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gIFxuICBhYnM6ICAgICAgcmVxdWlyZSggJy4vYWJzLmpzJyApLFxuICByb3VuZDogICAgcmVxdWlyZSggJy4vcm91bmQuanMnICksXG4gIHBhcmFtOiAgICByZXF1aXJlKCAnLi9wYXJhbS5qcycgKSxcbiAgYWRkOiAgICAgIHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgc3ViOiAgICAgIHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgbXVsOiAgICAgIHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgZGl2OiAgICAgIHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgYWNjdW06ICAgIHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICBjb3VudGVyOiAgcmVxdWlyZSggJy4vY291bnRlci5qcycgKSxcbiAgc2luOiAgICAgIHJlcXVpcmUoICcuL3Npbi5qcycgKSxcbiAgY29zOiAgICAgIHJlcXVpcmUoICcuL2Nvcy5qcycgKSxcbiAgdGFuOiAgICAgIHJlcXVpcmUoICcuL3Rhbi5qcycgKSxcbiAgdGFuaDogICAgIHJlcXVpcmUoICcuL3RhbmguanMnICksXG4gIGFzaW46ICAgICByZXF1aXJlKCAnLi9hc2luLmpzJyApLFxuICBhY29zOiAgICAgcmVxdWlyZSggJy4vYWNvcy5qcycgKSxcbiAgYXRhbjogICAgIHJlcXVpcmUoICcuL2F0YW4uanMnICksICBcbiAgcGhhc29yOiAgIHJlcXVpcmUoICcuL3BoYXNvci5qcycgKSxcbiAgZGF0YTogICAgIHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gIHBlZWs6ICAgICByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICBjeWNsZTogICAgcmVxdWlyZSggJy4vY3ljbGUuanMnICksXG4gIGhpc3Rvcnk6ICByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICBkZWx0YTogICAgcmVxdWlyZSggJy4vZGVsdGEuanMnICksXG4gIGZsb29yOiAgICByZXF1aXJlKCAnLi9mbG9vci5qcycgKSxcbiAgY2VpbDogICAgIHJlcXVpcmUoICcuL2NlaWwuanMnICksXG4gIG1pbjogICAgICByZXF1aXJlKCAnLi9taW4uanMnICksXG4gIG1heDogICAgICByZXF1aXJlKCAnLi9tYXguanMnICksXG4gIHNpZ246ICAgICByZXF1aXJlKCAnLi9zaWduLmpzJyApLFxuICBkY2Jsb2NrOiAgcmVxdWlyZSggJy4vZGNibG9jay5qcycgKSxcbiAgbWVtbzogICAgIHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gIHJhdGU6ICAgICByZXF1aXJlKCAnLi9yYXRlLmpzJyApLFxuICB3cmFwOiAgICAgcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgbWl4OiAgICAgIHJlcXVpcmUoICcuL21peC5qcycgKSxcbiAgY2xhbXA6ICAgIHJlcXVpcmUoICcuL2NsYW1wLmpzJyApLFxuICBwb2tlOiAgICAgcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgZGVsYXk6ICAgIHJlcXVpcmUoICcuL2RlbGF5LmpzJyApLFxuICBmb2xkOiAgICAgcmVxdWlyZSggJy4vZm9sZC5qcycgKSxcbiAgbW9kIDogICAgIHJlcXVpcmUoICcuL21vZC5qcycgKSxcbiAgc2FoIDogICAgIHJlcXVpcmUoICcuL3NhaC5qcycgKSxcbiAgbm9pc2U6ICAgIHJlcXVpcmUoICcuL25vaXNlLmpzJyApLFxuICBub3Q6ICAgICAgcmVxdWlyZSggJy4vbm90LmpzJyApLFxuICBndDogICAgICAgcmVxdWlyZSggJy4vZ3QuanMnICksXG4gIGd0ZTogICAgICByZXF1aXJlKCAnLi9ndGUuanMnICksXG4gIGx0OiAgICAgICByZXF1aXJlKCAnLi9sdC5qcycgKSwgXG4gIGx0ZTogICAgICByZXF1aXJlKCAnLi9sdGUuanMnICksIFxuICBib29sOiAgICAgcmVxdWlyZSggJy4vYm9vbC5qcycgKSxcbiAgZ2F0ZTogICAgIHJlcXVpcmUoICcuL2dhdGUuanMnICksXG4gIHRyYWluOiAgICByZXF1aXJlKCAnLi90cmFpbi5qcycgKSxcbiAgc2xpZGU6ICAgIHJlcXVpcmUoICcuL3NsaWRlLmpzJyApLFxuICBpbjogICAgICAgcmVxdWlyZSggJy4vaW4uanMnICksXG4gIHQ2MDogICAgICByZXF1aXJlKCAnLi90NjAuanMnKSxcbiAgbXRvZjogICAgIHJlcXVpcmUoICcuL210b2YuanMnKSxcbiAgbHRwOiAgICAgIHJlcXVpcmUoICcuL2x0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBndHA6ICAgICAgcmVxdWlyZSggJy4vZ3RwLmpzJyksICAgICAgICAvLyBUT0RPOiB0ZXN0XG4gIHN3aXRjaDogICByZXF1aXJlKCAnLi9zd2l0Y2guanMnICksXG4gIG1zdG9zYW1wczpyZXF1aXJlKCAnLi9tc3Rvc2FtcHMuanMnICksIC8vIFRPRE86IG5lZWRzIHRlc3QsXG4gIHNlbGVjdG9yOiByZXF1aXJlKCAnLi9zZWxlY3Rvci5qcycgKSxcbiAgdXRpbGl0aWVzOnJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKSxcbiAgcG93OiAgICAgIHJlcXVpcmUoICcuL3Bvdy5qcycgKSxcbiAgYXR0YWNrOiAgIHJlcXVpcmUoICcuL2F0dGFjay5qcycgKSxcbiAgZGVjYXk6ICAgIHJlcXVpcmUoICcuL2RlY2F5LmpzJyApLFxuICB3aW5kb3dzOiAgcmVxdWlyZSggJy4vd2luZG93cy5qcycgKSxcbiAgZW52OiAgICAgIHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgYWQ6ICAgICAgIHJlcXVpcmUoICcuL2FkLmpzJyAgKSxcbiAgYWRzcjogICAgIHJlcXVpcmUoICcuL2Fkc3IuanMnICksXG4gIGlmZWxzZTogICByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgYmFuZzogICAgIHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gIGFuZDogICAgICByZXF1aXJlKCAnLi9hbmQuanMnICksXG4gIHBhbjogICAgICByZXF1aXJlKCAnLi9wYW4uanMnICksXG4gIGVxOiAgICAgICByZXF1aXJlKCAnLi9lcS5qcycgKSxcbiAgbmVxOiAgICAgIHJlcXVpcmUoICcuL25lcS5qcycgKSxcbiAgZXhwOiAgICAgIHJlcXVpcmUoICcuL2V4cC5qcycgKVxufVxuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5XG5cbm1vZHVsZS5leHBvcnRzID0gbGlicmFyeVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidsdCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoKCAke2lucHV0c1swXX0gPCAke2lucHV0c1sxXX0pIHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBsdCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBsdC5pbnB1dHMgPSBbIHgseSBdXG4gIGx0Lm5hbWUgPSBsdC5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBsdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2x0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoICR7aW5wdXRzWzBdfSA8PSAke2lucHV0c1sxXX0gfCAwICApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdIDw9IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBsdCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBsdC5pbnB1dHMgPSBbIHgseSBdXG4gIGx0Lm5hbWUgPSAnbHRlJyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBsdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2x0cCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ID0gYCgke2lucHV0c1sgMCBdfSAqICgoICR7aW5wdXRzWzBdfSA8ICR7aW5wdXRzWzFdfSApIHwgMCApIClgIFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoKCBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gKSB8IDAgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBsdHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHRwLmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbHRwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbWF4JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLm1heCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLm1heCggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1heCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICksIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbWF4ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1heC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIG1heFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J21lbW8nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKGluMSxtZW1vTmFtZSkgPT4ge1xuICBsZXQgbWVtbyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIG1lbW8uaW5wdXRzID0gWyBpbjEgXVxuICBtZW1vLmlkICAgPSBnZW4uZ2V0VUlEKClcbiAgbWVtby5uYW1lID0gbWVtb05hbWUgIT09IHVuZGVmaW5lZCA/IG1lbW9OYW1lICsgJ18nICsgZ2VuLmdldFVJRCgpIDogYCR7bWVtby5iYXNlbmFtZX0ke21lbW8uaWR9YFxuXG4gIHJldHVybiBtZW1vXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbWluJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLm1pbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLm1pbiggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1pbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICksIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbWluID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1pbi5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIG1pblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW89IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiwgdD0uNSApID0+IHtcbiAgbGV0IHVnZW4gPSBtZW1vKCBhZGQoIG11bChpbjEsIHN1YigxLHQgKSApLCBtdWwoIGluMiwgdCApICkgKVxuICB1Z2VuLm5hbWUgPSAnbWl4JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgbW9kID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgbW9kQXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAlIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gJSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgJSAnIFxuICAgICAgfSlcblxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbW9kXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J21zdG9zYW1wcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWUgfSA9ICR7Z2VuLnNhbXBsZXJhdGV9IC8gMTAwMCAqICR7aW5wdXRzWzBdfSBcXG5cXG5gXG4gICAgIFxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gb3V0XG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGdlbi5zYW1wbGVyYXRlIC8gMTAwMCAqIHRoaXMuaW5wdXRzWzBdXG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0XG4gICAgfSAgICBcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBtc3Rvc2FtcHMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbXN0b3NhbXBzLmlucHV0cyA9IFsgeCBdXG4gIG1zdG9zYW1wcy5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbXN0b3NhbXBzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbXRvZicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgKCAke3RoaXMudHVuaW5nfSAqIGdlbi5leHAoIC4wNTc3NjIyNjUgKiAoJHtpbnB1dHNbMF19IC0gNjkpICkgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSB0aGlzLnR1bmluZyAqIE1hdGguZXhwKCAuMDU3NzYyMjY1ICogKCBpbnB1dHNbMF0gLSA2OSkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHByb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgdHVuaW5nOjQ0MCB9XG4gIFxuICBpZiggcHJvcHMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIHByb3BzLmRlZmF1bHRzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBkZWZhdWx0cyApXG4gIHVnZW4uaW5wdXRzID0gWyB4IF1cbiAgXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTogJ211bCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgLFxuICAgICAgICBzdW0gPSAxLCBudW1Db3VudCA9IDAsIG11bEF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICBvdXQgKz0gdlxuICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgbXVsQXRFbmQgPSB0cnVlXG4gICAgICAgICAgb3V0ICs9ICcgKiAnXG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBpID09PSAwICkge1xuICAgICAgICAgIHN1bSA9IHZcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3VtICo9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICB9XG4gICAgICAgIG51bUNvdW50KytcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYoIG51bUNvdW50ID4gMCApIHtcbiAgICAgIG91dCArPSBtdWxBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKiAnICsgc3VtXG4gICAgfVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgY29uc3QgbXVsID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggbXVsLCB7XG4gICAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogYXJncyxcbiAgfSlcbiAgXG4gIG11bC5uYW1lID0gbXVsLmJhc2VuYW1lICsgbXVsLmlkXG5cbiAgcmV0dXJuIG11bFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbmVxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSAvKnRoaXMuaW5wdXRzWzBdICE9PSB0aGlzLmlucHV0c1sxXSA/IDEgOiovIGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ICE9PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vaXNlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dFxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdub2lzZScgOiBNYXRoLnJhbmRvbSB9KVxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGdlbi5ub2lzZSgpXFxuYFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub2lzZSA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgbm9pc2UubmFtZSA9IHByb3RvLm5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbm9pc2Vcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidub3QnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSApIHtcbiAgICAgIG91dCA9IGAoICR7aW5wdXRzWzBdfSA9PT0gMCA/IDEgOiAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9ICFpbnB1dHNbMF0gPT09IDAgPyAxIDogMFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IG5vdCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBub3QuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gbm90XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BhbicsIFxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXJMID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApLFxuICAgICAgICBidWZmZXJSID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApXG5cbiAgICBjb25zdCBhbmdUb1JhZCA9IE1hdGguUEkgLyAxODBcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDEwMjQ7IGkrKyApIHsgXG4gICAgICBsZXQgcGFuID0gaSAqICggOTAgLyAxMDI0IClcbiAgICAgIGJ1ZmZlckxbaV0gPSBNYXRoLmNvcyggcGFuICogYW5nVG9SYWQgKSBcbiAgICAgIGJ1ZmZlclJbaV0gPSBNYXRoLnNpbiggcGFuICogYW5nVG9SYWQgKVxuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLnBhbkwgPSBkYXRhKCBidWZmZXJMLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0pXG4gICAgZ2VuLmdsb2JhbHMucGFuUiA9IGRhdGEoIGJ1ZmZlclIsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSlcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBsZWZ0SW5wdXQsIHJpZ2h0SW5wdXQsIHBhbiA9LjUsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGlmKCBnZW4uZ2xvYmFscy5wYW5MID09PSB1bmRlZmluZWQgKSBwcm90by5pbml0VGFibGUoKVxuXG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBsZWZ0SW5wdXQsIHJpZ2h0SW5wdXQgXSxcbiAgICBsZWZ0OiAgICBtdWwoIGxlZnRJbnB1dCwgcGVlayggZ2VuLmdsb2JhbHMucGFuTCwgcGFuLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pICksXG4gICAgcmlnaHQ6ICAgbXVsKCByaWdodElucHV0LCBwZWVrKCBnZW4uZ2xvYmFscy5wYW5SLCBwYW4sIHsgYm91bmRtb2RlOidjbGFtcCcgfSkgKVxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdwYXJhbScsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgZ2VuLnBhcmFtcy5hZGQoeyBbdGhpcy5uYW1lXTogdGhpcyB9KVxuXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gXG5cbiAgICByZXR1cm4gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBwcm9wTmFtZT0wLCB2YWx1ZT0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIGlmKCB0eXBlb2YgcHJvcE5hbWUgIT09ICdzdHJpbmcnICkge1xuICAgIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcbiAgICB1Z2VuLmluaXRpYWxWYWx1ZSA9IHByb3BOYW1lXG4gIH1lbHNle1xuICAgIHVnZW4ubmFtZSA9IHByb3BOYW1lXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSB2YWx1ZVxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICAgIGRhdGFVZ2VuID0gcmVxdWlyZSgnLi9kYXRhLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGVlaycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCwgZnVuY3Rpb25Cb2R5LCBuZXh0LCBsZW5ndGhJc0xvZzIsIGlkeFxuICAgIFxuICAgIGlkeCA9IGlucHV0c1sxXVxuICAgIGxlbmd0aElzTG9nMiA9IChNYXRoLmxvZzIoIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoICkgfCAwKSAgPT09IE1hdGgubG9nMiggdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKVxuXG4gICAgaWYoIHRoaXMubW9kZSAhPT0gJ3NpbXBsZScgKSB7XG5cbiAgICBmdW5jdGlvbkJvZHkgPSBgICB2YXIgJHt0aGlzLm5hbWV9X2RhdGFJZHggID0gJHtpZHh9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9waGFzZSA9ICR7dGhpcy5tb2RlID09PSAnc2FtcGxlcycgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEpIH0sIFxuICAgICAgJHt0aGlzLm5hbWV9X2luZGV4ID0gJHt0aGlzLm5hbWV9X3BoYXNlIHwgMCxcXG5gXG5cbiAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICd3cmFwJyApIHtcbiAgICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgP1xuICAgICAgYCggJHt0aGlzLm5hbWV9X2luZGV4ICsgMSApICYgKCR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IC0gMSlgIDpcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9ID8gJHt0aGlzLm5hbWV9X2luZGV4ICsgMSAtICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZSBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdjbGFtcCcgKSB7XG4gICAgICBuZXh0ID0gXG4gICAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA/ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfSBlbHNlIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2ZvbGQnIHx8IHRoaXMuYm91bmRtb2RlID09PSAnbWlycm9yJyApIHtcbiAgICAgIG5leHQgPSBcbiAgICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9ID8gJHt0aGlzLm5hbWV9X2luZGV4IC0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZXtcbiAgICAgICBuZXh0ID0gXG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMWAgICAgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLmludGVycCA9PT0gJ2xpbmVhcicgKSB7ICAgICAgXG4gICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fZnJhYyAgPSAke3RoaXMubmFtZX1fcGhhc2UgLSAke3RoaXMubmFtZX1faW5kZXgsXG4gICAgICAke3RoaXMubmFtZX1fYmFzZSAgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgICR7dGhpcy5uYW1lfV9pbmRleCBdLFxuICAgICAgJHt0aGlzLm5hbWV9X25leHQgID0gJHtuZXh0fSxgXG4gICAgICBcbiAgICAgIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2lnbm9yZScgKSB7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1faW5kZXggPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IHx8ICR7dGhpcy5uYW1lfV9pbmRleCA8IDAgPyAwIDogJHt0aGlzLm5hbWV9X2Jhc2UgKyAke3RoaXMubmFtZX1fZnJhYyAqICggbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9uZXh0IF0gLSAke3RoaXMubmFtZX1fYmFzZSApXFxuXFxuYFxuICAgICAgfWVsc2V7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X25leHQgXSAtICR7dGhpcy5uYW1lfV9iYXNlIClcXG5cXG5gXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9vdXQgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X2luZGV4IF1cXG5cXG5gXG4gICAgfVxuXG4gICAgfSBlbHNlIHsgLy8gbW9kZSBpcyBzaW1wbGVcbiAgICAgIGZ1bmN0aW9uQm9keSA9IGBtZW1vcnlbICR7aWR4fSArICR7IGlucHV0c1swXSB9IF1gXG4gICAgICBcbiAgICAgIHJldHVybiBmdW5jdGlvbkJvZHlcbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSsnX291dCcsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgZGVmYXVsdHMgOiB7IGNoYW5uZWxzOjEsIG1vZGU6J3BoYXNlJywgaW50ZXJwOidsaW5lYXInLCBib3VuZG1vZGU6J3dyYXAnIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGlucHV0X2RhdGEsIGluZGV4PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIC8vY29uc29sZS5sb2coIGRhdGFVZ2VuLCBnZW4uZGF0YSApXG5cbiAgLy8gWFhYIHdoeSBpcyBkYXRhVWdlbiBub3QgdGhlIGFjdHVhbCBmdW5jdGlvbj8gc29tZSB0eXBlIG9mIGJyb3dzZXJpZnkgbm9uc2Vuc2UuLi5cbiAgY29uc3QgZmluYWxEYXRhID0gdHlwZW9mIGlucHV0X2RhdGEuYmFzZW5hbWUgPT09ICd1bmRlZmluZWQnID8gZ2VuLmxpYi5kYXRhKCBpbnB1dF9kYXRhICkgOiBpbnB1dF9kYXRhXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgXG4gICAgeyBcbiAgICAgICdkYXRhJzogICAgIGZpbmFsRGF0YSxcbiAgICAgIGRhdGFOYW1lOiAgIGZpbmFsRGF0YS5uYW1lLFxuICAgICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgICAgaW5wdXRzOiAgICAgWyBpbmRleCwgZmluYWxEYXRhIF0sXG4gICAgfSxcbiAgICBwcm90by5kZWZhdWx0cyxcbiAgICBwcm9wZXJ0aWVzIFxuICApXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIG11bCAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHByb3RvID0geyBiYXNlbmFtZToncGhhc29yJyB9XG5cbmNvbnN0IGRlZmF1bHRzID0geyBtaW46IC0xLCBtYXg6IDEgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5ID0gMSwgcmVzZXQgPSAwLCBfcHJvcHMgKSA9PiB7XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBfcHJvcHMgKVxuXG4gIGNvbnN0IHJhbmdlID0gcHJvcHMubWF4IC0gcHJvcHMubWluXG5cbiAgY29uc3QgdWdlbiA9IHR5cGVvZiBmcmVxdWVuY3kgPT09ICdudW1iZXInIFxuICAgID8gYWNjdW0oIChmcmVxdWVuY3kgKiByYW5nZSkgLyBnZW4uc2FtcGxlcmF0ZSwgcmVzZXQsIHByb3BzICkgXG4gICAgOiBhY2N1bSggbXVsKCBmcmVxdWVuY3ksIDEgLyBnZW4uc2FtcGxlcmF0ZSAvICggMSAvIHJhbmdlICkgKSwgcmVzZXQsIHByb3BzIClcblxuICB1Z2VuLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIG11bCAgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHdyYXAgPSByZXF1aXJlKCcuL3dyYXAuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwb2tlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGRhdGFOYW1lID0gJ21lbW9yeScsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgaWR4LCBvdXQsIHdyYXBwZWRcbiAgICBcbiAgICBpZHggPSB0aGlzLmRhdGEuZ2VuKClcblxuICAgIC8vZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICAvL3dyYXBwZWQgPSB3cmFwKCB0aGlzLmlucHV0c1sxXSwgMCwgdGhpcy5kYXRhTGVuZ3RoICkuZ2VuKClcbiAgICAvL2lkeCA9IHdyYXBwZWRbMF1cbiAgICAvL2dlbi5mdW5jdGlvbkJvZHkgKz0gd3JhcHBlZFsxXVxuICAgIGxldCBvdXRwdXRTdHIgPSB0aGlzLmlucHV0c1sxXSA9PT0gMCA/XG4gICAgICBgICAke2RhdGFOYW1lfVsgJHtpZHh9IF0gPSAke2lucHV0c1swXX1cXG5gIDpcbiAgICAgIGAgICR7ZGF0YU5hbWV9WyAke2lkeH0gKyAke2lucHV0c1sxXX0gXSA9ICR7aW5wdXRzWzBdfVxcbmBcblxuICAgIGlmKCB0aGlzLmlubGluZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLmZ1bmN0aW9uQm9keSArPSBvdXRwdXRTdHJcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBbIHRoaXMuaW5saW5lLCBvdXRwdXRTdHIgXVxuICAgIH1cbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSAoIGRhdGEsIHZhbHVlLCBpbmRleCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGNoYW5uZWxzOjEgfSBcblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgZGF0YSxcbiAgICBkYXRhTmFtZTogICBkYXRhLm5hbWUsXG4gICAgZGF0YUxlbmd0aDogZGF0YS5idWZmZXIubGVuZ3RoLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIHZhbHVlLCBpbmRleCBdLFxuICB9LFxuICBkZWZhdWx0cyApXG5cblxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcbiAgXG4gIGdlbi5oaXN0b3JpZXMuc2V0KCB1Z2VuLm5hbWUsIHVnZW4gKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BvdycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdwb3cnOiBNYXRoLnBvdyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnBvdyggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMF0gPT09ICdzdHJpbmcnICYmIGlucHV0c1swXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMF0gPSBpbnB1dHNbMF0uc2xpY2UoMSwtMSlcbiAgICAgIH1cbiAgICAgIGlmKCB0eXBlb2YgaW5wdXRzWzFdID09PSAnc3RyaW5nJyAmJiBpbnB1dHNbMV1bMF0gPT09ICcoJyApIHtcbiAgICAgICAgaW5wdXRzWzFdID0gaW5wdXRzWzFdLnNsaWNlKDEsLTEpXG4gICAgICB9XG5cbiAgICAgIG91dCA9IE1hdGgucG93KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IHBvdyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBwb3cuaW5wdXRzID0gWyB4LHkgXVxuICBwb3cuaWQgPSBnZW4uZ2V0VUlEKClcbiAgcG93Lm5hbWUgPSBgJHtwb3cuYmFzZW5hbWV9e3Bvdy5pZH1gXG5cbiAgcmV0dXJuIHBvd1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGRlbHRhICAgPSByZXF1aXJlKCAnLi9kZWx0YS5qcycgKSxcbiAgICB3cmFwICAgID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidyYXRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcGhhc2UgID0gaGlzdG9yeSgpLFxuICAgICAgICBpbk1pbnVzMSA9IGhpc3RvcnkoKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZmlsdGVyLCBzdW0sIG91dFxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9kaWZmID0gJHtpbnB1dHNbMF19IC0gJHtnZW5OYW1lfS5sYXN0U2FtcGxlXG4gIGlmKCAke3RoaXMubmFtZX1fZGlmZiA8IC0uNSApICR7dGhpcy5uYW1lfV9kaWZmICs9IDFcbiAgJHtnZW5OYW1lfS5waGFzZSArPSAke3RoaXMubmFtZX1fZGlmZiAqICR7aW5wdXRzWzFdfVxuICBpZiggJHtnZW5OYW1lfS5waGFzZSA+IDEgKSAke2dlbk5hbWV9LnBoYXNlIC09IDFcbiAgJHtnZW5OYW1lfS5sYXN0U2FtcGxlID0gJHtpbnB1dHNbMF19XG5gXG4gICAgb3V0ID0gJyAnICsgb3V0XG5cbiAgICByZXR1cm4gWyBnZW5OYW1lICsgJy5waGFzZScsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgcmF0ZSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBwaGFzZTogICAgICAwLFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCByYXRlIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZToncm91bmQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5yb3VuZCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnJvdW5kKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnJvdW5kKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgcm91bmQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcm91bmQuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gcm91bmRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzYWgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gMFxuICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSArICdfY29udHJvbCcgXSA9IDBcblxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG5cblxuICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X2NvbnRyb2wgPSBtZW1vcnlbJHt0aGlzLm1lbW9yeS5jb250cm9sLmlkeH1dLFxuICAgICAgJHt0aGlzLm5hbWV9X3RyaWdnZXIgPSAke2lucHV0c1sxXX0gPiAke2lucHV0c1syXX0gPyAxIDogMFxuXG4gIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciAhPT0gJHt0aGlzLm5hbWV9X2NvbnRyb2wgICkge1xuICAgIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciA9PT0gMSApIFxuICAgICAgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV0gPSAke2lucHV0c1swXX1cbiAgICBcbiAgICBtZW1vcnlbJHt0aGlzLm1lbW9yeS5jb250cm9sLmlkeH1dID0gJHt0aGlzLm5hbWV9X3RyaWdnZXJcbiAgfVxuYFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gLCAnICcgK291dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgY29udHJvbCwgdGhyZXNob2xkPTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0OjAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSwgY29udHJvbCx0aHJlc2hvbGQgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGNvbnRyb2w6IHsgaWR4Om51bGwsIGxlbmd0aDoxIH0sXG4gICAgICB2YWx1ZTogICB7IGlkeDpudWxsLCBsZW5ndGg6MSB9LFxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2VsZWN0b3InLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXQsIHJldHVyblZhbHVlID0gMFxuICAgIFxuICAgIHN3aXRjaCggaW5wdXRzLmxlbmd0aCApIHtcbiAgICAgIGNhc2UgMiA6XG4gICAgICAgIHJldHVyblZhbHVlID0gaW5wdXRzWzFdXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzIDpcbiAgICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1swXX0gPT09IDEgPyAke2lucHV0c1sxXX0gOiAke2lucHV0c1syXX1cXG5cXG5gO1xuICAgICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lICsgJ19vdXQnLCBvdXQgXVxuICAgICAgICBicmVhazsgIFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX1fb3V0ID0gMFxuICBzd2l0Y2goICR7aW5wdXRzWzBdfSArIDEgKSB7XFxuYFxuXG4gICAgICAgIGZvciggbGV0IGkgPSAxOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrICl7XG4gICAgICAgICAgb3V0ICs9YCAgICBjYXNlICR7aX06ICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1tpXX07IGJyZWFrO1xcbmAgXG4gICAgICAgIH1cblxuICAgICAgICBvdXQgKz0gJyAgfVxcblxcbidcbiAgICAgICAgXG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsICcgJyArIG91dCBdXG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ19vdXQnXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmlucHV0cyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0c1xuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J3NpZ24nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5zaWduIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uc2lnbiggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5zaWduKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2lnbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBzaWduLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIHNpZ25cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2luJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnc2luJzogTWF0aC5zaW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5zaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBzaW4uaW5wdXRzID0gWyB4IF1cbiAgc2luLmlkID0gZ2VuLmdldFVJRCgpXG4gIHNpbi5uYW1lID0gYCR7c2luLmJhc2VuYW1lfXtzaW4uaWR9YFxuXG4gIHJldHVybiBzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgICBndCAgICAgID0gcmVxdWlyZSggJy4vZ3QuanMnICksXG4gICAgZGl2ICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBfc3dpdGNoID0gcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHNsaWRlVXAgPSAxLCBzbGlkZURvd24gPSAxICkgPT4ge1xuICBsZXQgeTEgPSBoaXN0b3J5KDApLFxuICAgICAgZmlsdGVyLCBzbGlkZUFtb3VudFxuXG4gIC8veSAobikgPSB5IChuLTEpICsgKCh4IChuKSAtIHkgKG4tMSkpL3NsaWRlKSBcbiAgc2xpZGVBbW91bnQgPSBfc3dpdGNoKCBndChpbjEseTEub3V0KSwgc2xpZGVVcCwgc2xpZGVEb3duIClcblxuICBmaWx0ZXIgPSBtZW1vKCBhZGQoIHkxLm91dCwgZGl2KCBzdWIoIGluMSwgeTEub3V0ICksIHNsaWRlQW1vdW50ICkgKSApXG5cbiAgeTEuaW4oIGZpbHRlciApXG5cbiAgcmV0dXJuIGZpbHRlclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzdWInLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PTAsXG4gICAgICAgIGRpZmYgPSAwLFxuICAgICAgICBuZWVkc1BhcmVucyA9IGZhbHNlLCBcbiAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTiggbGFzdE51bWJlciApLCBcbiAgICAgICAgc3ViQXRFbmQgPSBmYWxzZSxcbiAgICAgICAgaGFzVWdlbnMgPSBmYWxzZSxcbiAgICAgICAgcmV0dXJuVmFsdWUgPSAwXG5cbiAgICB0aGlzLmlucHV0cy5mb3JFYWNoKCB2YWx1ZSA9PiB7IGlmKCBpc05hTiggdmFsdWUgKSApIGhhc1VnZW5zID0gdHJ1ZSB9KVxuXG4gICAgb3V0ID0gJyAgdmFyICcgKyB0aGlzLm5hbWUgKyAnID0gJ1xuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpID09PSAwICkgcmV0dXJuXG5cbiAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgIGlmKCAhbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuICkge1xuICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAtIHZcbiAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgcmV0dXJuXG4gICAgICB9ZWxzZXtcbiAgICAgICAgbmVlZHNQYXJlbnMgPSB0cnVlXG4gICAgICAgIG91dCArPSBgJHtsYXN0TnVtYmVyfSAtICR7dn1gXG4gICAgICB9XG5cbiAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnIC0gJyBcbiAgICB9KVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICkgPT4ge1xuICBsZXQgc3ViID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHN1Yiwge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJnc1xuICB9KVxuICAgICAgIFxuICBzdWIubmFtZSA9ICdzdWInICsgc3ViLmlkXG5cbiAgcmV0dXJuIHN1YlxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc3dpdGNoJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBpZiggaW5wdXRzWzFdID09PSBpbnB1dHNbMl0gKSByZXR1cm4gaW5wdXRzWzFdIC8vIGlmIGJvdGggcG90ZW50aWFsIG91dHB1dHMgYXJlIHRoZSBzYW1lIGp1c3QgcmV0dXJuIG9uZSBvZiB0aGVtXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1swXX0gPT09IDEgPyAke2lucHV0c1sxXX0gOiAke2lucHV0c1syXX1cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9X291dGBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1fb3V0YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggY29udHJvbCwgaW4xID0gMSwgaW4yID0gMCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBjb250cm9sLCBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0NjAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHJldHVyblZhbHVlXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgJ2V4cCcgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGdlbi5leHAoIC02LjkwNzc1NTI3ODkyMSAvICR7aW5wdXRzWzBdfSApXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gaW5wdXRzWzBdIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9ICAgIFxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHQ2MCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0NjAuaW5wdXRzID0gWyB4IF1cbiAgdDYwLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB0NjBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAndGFuJzogTWF0aC50YW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi50YW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHRhbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0YW4uaW5wdXRzID0gWyB4IF1cbiAgdGFuLmlkID0gZ2VuLmdldFVJRCgpXG4gIHRhbi5uYW1lID0gYCR7dGFuLmJhc2VuYW1lfXt0YW4uaWR9YFxuXG4gIHJldHVybiB0YW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondGFuaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3RhbmgnOiBNYXRoLnRhbmggfSlcblxuICAgICAgb3V0ID0gYGdlbi50YW5oKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW5oKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdGFuaCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0YW5oLmlucHV0cyA9IFsgeCBdXG4gIHRhbmguaWQgPSBnZW4uZ2V0VUlEKClcbiAgdGFuaC5uYW1lID0gYCR7dGFuaC5iYXNlbmFtZX17dGFuaC5pZH1gXG5cbiAgcmV0dXJuIHRhbmhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBsdCAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgcGhhc29yICA9IHJlcXVpcmUoICcuL3BoYXNvci5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTQ0MCwgcHVsc2V3aWR0aD0uNSApID0+IHtcbiAgbGV0IGdyYXBoID0gbHQoIGFjY3VtKCBkaXYoIGZyZXF1ZW5jeSwgNDQxMDAgKSApLCAuNSApXG5cbiAgZ3JhcGgubmFtZSA9IGB0cmFpbiR7Z2VuLmdldFVJRCgpfWBcblxuICByZXR1cm4gZ3JhcGhcbn1cblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnIClcblxubGV0IGlzU3RlcmVvID0gZmFsc2VcblxubGV0IHV0aWxpdGllcyA9IHtcbiAgY3R4OiBudWxsLFxuXG4gIGNsZWFyKCkge1xuICAgIHRoaXMuY2FsbGJhY2sgPSAoKSA9PiAwXG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MuZm9yRWFjaCggdiA9PiB2KCkgKVxuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmxlbmd0aCA9IDBcbiAgfSxcblxuICBjcmVhdGVDb250ZXh0KCkge1xuICAgIGxldCBBQyA9IHR5cGVvZiBBdWRpb0NvbnRleHQgPT09ICd1bmRlZmluZWQnID8gd2Via2l0QXVkaW9Db250ZXh0IDogQXVkaW9Db250ZXh0XG4gICAgdGhpcy5jdHggPSBuZXcgQUMoKVxuXG4gICAgZ2VuLnNhbXBsZXJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlXG5cbiAgICBsZXQgc3RhcnQgPSAoKSA9PiB7XG4gICAgICBpZiggdHlwZW9mIEFDICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuXG4gICAgICAgICAgaWYoICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHsgLy8gcmVxdWlyZWQgdG8gc3RhcnQgYXVkaW8gdW5kZXIgaU9TIDZcbiAgICAgICAgICAgICBsZXQgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgICAgICAgbXlTb3VyY2UuY29ubmVjdCggdXRpbGl0aWVzLmN0eC5kZXN0aW5hdGlvbiApXG4gICAgICAgICAgICAgbXlTb3VyY2Uubm90ZU9uKCAwIClcbiAgICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCkge1xuICAgIHRoaXMubm9kZSA9IHRoaXMuY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvciggMTAyNCwgMCwgMiApXG4gICAgdGhpcy5jbGVhckZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiAwIH1cbiAgICBpZiggdHlwZW9mIHRoaXMuY2FsbGJhY2sgPT09ICd1bmRlZmluZWQnICkgdGhpcy5jYWxsYmFjayA9IHRoaXMuY2xlYXJGdW5jdGlvblxuXG4gICAgdGhpcy5ub2RlLm9uYXVkaW9wcm9jZXNzID0gZnVuY3Rpb24oIGF1ZGlvUHJvY2Vzc2luZ0V2ZW50ICkge1xuICAgICAgdmFyIG91dHB1dEJ1ZmZlciA9IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50Lm91dHB1dEJ1ZmZlcjtcblxuICAgICAgdmFyIGxlZnQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDAgKSxcbiAgICAgICAgICByaWdodD0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAxICksXG4gICAgICAgICAgaXNTdGVyZW8gPSB1dGlsaXRpZXMuaXNTdGVyZW9cblxuICAgICBmb3IoIHZhciBzYW1wbGUgPSAwOyBzYW1wbGUgPCBsZWZ0Lmxlbmd0aDsgc2FtcGxlKysgKSB7XG4gICAgICAgIHZhciBvdXQgPSB1dGlsaXRpZXMuY2FsbGJhY2soKVxuXG4gICAgICAgIGlmKCBpc1N0ZXJlbyA9PT0gZmFsc2UgKSB7XG4gICAgICAgICAgbGVmdFsgc2FtcGxlIF0gPSByaWdodFsgc2FtcGxlIF0gPSBvdXQgXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGxlZnRbIHNhbXBsZSAgXSA9IG91dFswXVxuICAgICAgICAgIHJpZ2h0WyBzYW1wbGUgXSA9IG91dFsxXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ub2RlLmNvbm5lY3QoIHRoaXMuY3R4LmRlc3RpbmF0aW9uIClcblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIFxuICBwbGF5R3JhcGgoIGdyYXBoLCBkZWJ1ZywgbWVtPTQ0MTAwKjEwLCBtZW1UeXBlPUZsb2F0MzJBcnJheSApIHtcbiAgICB1dGlsaXRpZXMuY2xlYXIoKVxuICAgIGlmKCBkZWJ1ZyA9PT0gdW5kZWZpbmVkICkgZGVidWcgPSBmYWxzZVxuICAgICAgICAgIFxuICAgIHRoaXMuaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCBncmFwaCApXG5cbiAgICB1dGlsaXRpZXMuY2FsbGJhY2sgPSBnZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBtZW0sIGRlYnVnLCBmYWxzZSwgbWVtVHlwZSApXG4gICAgXG4gICAgaWYoIHV0aWxpdGllcy5jb25zb2xlICkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUoIHV0aWxpdGllcy5jYWxsYmFjay50b1N0cmluZygpIClcblxuICAgIHJldHVybiB1dGlsaXRpZXMuY2FsbGJhY2tcbiAgfSxcblxuICBsb2FkU2FtcGxlKCBzb3VuZEZpbGVQYXRoLCBkYXRhICkge1xuICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHJlcS5vcGVuKCAnR0VUJywgc291bmRGaWxlUGF0aCwgdHJ1ZSApXG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcicgXG4gICAgXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUscmVqZWN0KSA9PiB7XG4gICAgICByZXEub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhdWRpb0RhdGEgPSByZXEucmVzcG9uc2VcblxuICAgICAgICB1dGlsaXRpZXMuY3R4LmRlY29kZUF1ZGlvRGF0YSggYXVkaW9EYXRhLCAoYnVmZmVyKSA9PiB7XG4gICAgICAgICAgZGF0YS5idWZmZXIgPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMClcbiAgICAgICAgICByZXNvbHZlKCBkYXRhLmJ1ZmZlciApXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJlcS5zZW5kKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxufVxuXG51dGlsaXRpZXMuY2xlYXIuY2FsbGJhY2tzID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsaXRpZXNcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKlxuICogbWFueSB3aW5kb3dzIGhlcmUgYWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9jb3JiYW5icm9vay9kc3AuanMvYmxvYi9tYXN0ZXIvZHNwLmpzXG4gKiBzdGFydGluZyBhdCBsaW5lIDE0MjdcbiAqIHRha2VuIDgvMTUvMTZcbiovIFxuXG5jb25zdCB3aW5kb3dzID0gbW9kdWxlLmV4cG9ydHMgPSB7IFxuICBiYXJ0bGV0dCggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMiAvIChsZW5ndGggLSAxKSAqICgobGVuZ3RoIC0gMSkgLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSkgXG4gIH0sXG5cbiAgYmFydGxldHRIYW5uKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjYyIC0gMC40OCAqIE1hdGguYWJzKGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMC41KSAtIDAuMzggKiBNYXRoLmNvcyggMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBibGFja21hbiggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgbGV0IGEwID0gKDEgLSBhbHBoYSkgLyAyLFxuICAgICAgICBhMSA9IDAuNSxcbiAgICAgICAgYTIgPSBhbHBoYSAvIDJcblxuICAgIHJldHVybiBhMCAtIGExICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKyBhMiAqIE1hdGguY29zKDQgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgY29zaW5lKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiBNYXRoLmNvcyhNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSBNYXRoLlBJIC8gMilcbiAgfSxcblxuICBnYXVzcyggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KE1hdGguRSwgLTAuNSAqIE1hdGgucG93KChpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpIC8gKGFscGhhICogKGxlbmd0aCAtIDEpIC8gMiksIDIpKVxuICB9LFxuXG4gIGhhbW1pbmcoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNTQgLSAwLjQ2ICogTWF0aC5jb3MoIE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgaGFubiggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKVxuICB9LFxuXG4gIGxhbmN6b3MoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgbGV0IHggPSAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAxO1xuICAgIHJldHVybiBNYXRoLnNpbihNYXRoLlBJICogeCkgLyAoTWF0aC5QSSAqIHgpXG4gIH0sXG5cbiAgcmVjdGFuZ3VsYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDFcbiAgfSxcblxuICB0cmlhbmd1bGFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAyIC8gbGVuZ3RoICogKGxlbmd0aCAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKVxuICB9LFxuXG4gIC8vIHBhcmFib2xhXG4gIHdlbGNoKCBsZW5ndGgsIF9pbmRleCwgaWdub3JlLCBzaGlmdD0wICkge1xuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIGNvbnN0IGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vciggc2hpZnQgKiBsZW5ndGggKSkgJSBsZW5ndGhcbiAgICBjb25zdCBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyIFxuXG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdyggKCBpbmRleCAtIG5fMV9vdmVyMiApIC8gbl8xX292ZXIyLCAyIClcbiAgfSxcbiAgaW52ZXJzZXdlbGNoKCBsZW5ndGgsIF9pbmRleCwgaWdub3JlLCBzaGlmdD0wICkge1xuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIGxldCBpbmRleCA9IHNoaWZ0ID09PSAwID8gX2luZGV4IDogKF9pbmRleCArIE1hdGguZmxvb3IoIHNoaWZ0ICogbGVuZ3RoICkpICUgbGVuZ3RoXG4gICAgY29uc3Qgbl8xX292ZXIyID0gKGxlbmd0aCAtIDEpIC8gMlxuXG4gICAgcmV0dXJuIE1hdGgucG93KCAoIGluZGV4IC0gbl8xX292ZXIyICkgLyBuXzFfb3ZlcjIsIDIgKVxuICB9LFxuXG4gIHBhcmFib2xhKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIGlmKCBpbmRleCA8PSBsZW5ndGggLyAyICkge1xuICAgICAgcmV0dXJuIHdpbmRvd3MuaW52ZXJzZXdlbGNoKCBsZW5ndGggLyAyLCBpbmRleCApIC0gMVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIDEgLSB3aW5kb3dzLmludmVyc2V3ZWxjaCggbGVuZ3RoIC8gMiwgaW5kZXggLSBsZW5ndGggLyAyIClcbiAgICB9XG4gIH0sXG5cbiAgZXhwb25lbnRpYWwoIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIHJldHVybiBNYXRoLnBvdyggaW5kZXggLyBsZW5ndGgsIGFscGhhIClcbiAgfSxcblxuICBsaW5lYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIGluZGV4IC8gbGVuZ3RoXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZmxvb3I9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTond3JhcCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHNpZ25hbCA9IGlucHV0c1swXSwgbWluID0gaW5wdXRzWzFdLCBtYXggPSBpbnB1dHNbMl0sXG4gICAgICAgIG91dCwgZGlmZlxuXG4gICAgLy9vdXQgPSBgKCgoJHtpbnB1dHNbMF19IC0gJHt0aGlzLm1pbn0pICUgJHtkaWZmfSAgKyAke2RpZmZ9KSAlICR7ZGlmZn0gKyAke3RoaXMubWlufSlgXG4gICAgLy9jb25zdCBsb25nIG51bVdyYXBzID0gbG9uZygodi1sbykvcmFuZ2UpIC0gKHYgPCBsbyk7XG4gICAgLy9yZXR1cm4gdiAtIHJhbmdlICogZG91YmxlKG51bVdyYXBzKTsgICBcbiAgICBcbiAgICBpZiggdGhpcy5taW4gPT09IDAgKSB7XG4gICAgICBkaWZmID0gbWF4XG4gICAgfWVsc2UgaWYgKCBpc05hTiggbWF4ICkgfHwgaXNOYU4oIG1pbiApICkge1xuICAgICAgZGlmZiA9IGAke21heH0gLSAke21pbn1gXG4gICAgfWVsc2V7XG4gICAgICBkaWZmID0gbWF4IC0gbWluXG4gICAgfVxuXG4gICAgb3V0ID1cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9IDwgJHt0aGlzLm1pbn0gKSAke3RoaXMubmFtZX0gKz0gJHtkaWZmfVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPiAke3RoaXMubWF4fSApICR7dGhpcy5uYW1lfSAtPSAke2RpZmZ9XG5cbmBcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgJyAnICsgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IE1lbW9yeUhlbHBlciA9IHtcbiAgY3JlYXRlKCBzaXplT3JCdWZmZXI9NDA5NiwgbWVtdHlwZT1GbG9hdDMyQXJyYXkgKSB7XG4gICAgbGV0IGhlbHBlciA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuXG4gICAgLy8gY29udmVuaWVudGx5LCBidWZmZXIgY29uc3RydWN0b3JzIGFjY2VwdCBlaXRoZXIgYSBzaXplIG9yIGFuIGFycmF5IGJ1ZmZlciB0byB1c2UuLi5cbiAgICAvLyBzbywgbm8gbWF0dGVyIHdoaWNoIGlzIHBhc3NlZCB0byBzaXplT3JCdWZmZXIgaXQgc2hvdWxkIHdvcmsuXG4gICAgT2JqZWN0LmFzc2lnbiggaGVscGVyLCB7XG4gICAgICBoZWFwOiBuZXcgbWVtdHlwZSggc2l6ZU9yQnVmZmVyICksXG4gICAgICBsaXN0OiB7fSxcbiAgICAgIGZyZWVMaXN0OiB7fVxuICAgIH0pXG5cbiAgICByZXR1cm4gaGVscGVyXG4gIH0sXG5cbiAgYWxsb2MoIHNpemUsIGltbXV0YWJsZSApIHtcbiAgICBsZXQgaWR4ID0gLTFcblxuICAgIGlmKCBzaXplID4gdGhpcy5oZWFwLmxlbmd0aCApIHtcbiAgICAgIHRocm93IEVycm9yKCAnQWxsb2NhdGlvbiByZXF1ZXN0IGlzIGxhcmdlciB0aGFuIGhlYXAgc2l6ZSBvZiAnICsgdGhpcy5oZWFwLmxlbmd0aCApXG4gICAgfVxuXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZnJlZUxpc3QgKSB7XG4gICAgICBsZXQgY2FuZGlkYXRlID0gdGhpcy5mcmVlTGlzdFsga2V5IF1cblxuICAgICAgaWYoIGNhbmRpZGF0ZS5zaXplID49IHNpemUgKSB7XG4gICAgICAgIGlkeCA9IGtleVxuXG4gICAgICAgIHRoaXMubGlzdFsgaWR4IF0gPSB7IHNpemUsIGltbXV0YWJsZSwgcmVmZXJlbmNlczoxIH1cblxuICAgICAgICBpZiggY2FuZGlkYXRlLnNpemUgIT09IHNpemUgKSB7XG4gICAgICAgICAgbGV0IG5ld0luZGV4ID0gaWR4ICsgc2l6ZSxcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemVcblxuICAgICAgICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmxpc3QgKSB7XG4gICAgICAgICAgICBpZigga2V5ID4gbmV3SW5kZXggKSB7XG4gICAgICAgICAgICAgIG5ld0ZyZWVTaXplID0ga2V5IC0gbmV3SW5kZXhcbiAgICAgICAgICAgICAgdGhpcy5mcmVlTGlzdFsgbmV3SW5kZXggXSA9IG5ld0ZyZWVTaXplXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggaWR4ICE9PSAtMSApIGRlbGV0ZSB0aGlzLmZyZWVMaXN0WyBpZHggXVxuXG4gICAgaWYoIGlkeCA9PT0gLTEgKSB7XG4gICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKCB0aGlzLmxpc3QgKSxcbiAgICAgICAgICBsYXN0SW5kZXhcblxuICAgICAgaWYoIGtleXMubGVuZ3RoICkgeyAvLyBpZiBub3QgZmlyc3QgYWxsb2NhdGlvbi4uLlxuICAgICAgICBsYXN0SW5kZXggPSBwYXJzZUludCgga2V5c1sga2V5cy5sZW5ndGggLSAxIF0gKVxuXG4gICAgICAgIGlkeCA9IGxhc3RJbmRleCArIHRoaXMubGlzdFsgbGFzdEluZGV4IF0uc2l6ZVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlkeCA9IDBcbiAgICAgIH1cblxuICAgICAgdGhpcy5saXN0WyBpZHggXSA9IHsgc2l6ZSwgaW1tdXRhYmxlLCByZWZlcmVuY2VzOjEgfVxuICAgIH1cblxuICAgIGlmKCBpZHggKyBzaXplID49IHRoaXMuaGVhcC5sZW5ndGggKSB7XG4gICAgICB0aHJvdyBFcnJvciggJ05vIGF2YWlsYWJsZSBibG9ja3MgcmVtYWluIHN1ZmZpY2llbnQgZm9yIGFsbG9jYXRpb24gcmVxdWVzdC4nIClcbiAgICB9XG4gICAgcmV0dXJuIGlkeFxuICB9LFxuXG4gIGFkZFJlZmVyZW5jZSggaW5kZXggKSB7XG4gICAgaWYoIHRoaXMubGlzdFsgaW5kZXggXSAhPT0gdW5kZWZpbmVkICkgeyBcbiAgICAgIHRoaXMubGlzdFsgaW5kZXggXS5yZWZlcmVuY2VzKytcbiAgICB9XG4gIH0sXG5cbiAgZnJlZSggaW5kZXggKSB7XG4gICAgaWYoIHRoaXMubGlzdFsgaW5kZXggXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgdGhyb3cgRXJyb3IoICdDYWxsaW5nIGZyZWUoKSBvbiBub24tZXhpc3RpbmcgYmxvY2suJyApXG4gICAgfVxuXG4gICAgbGV0IHNsb3QgPSB0aGlzLmxpc3RbIGluZGV4IF1cbiAgICBpZiggc2xvdCA9PT0gMCApIHJldHVyblxuICAgIHNsb3QucmVmZXJlbmNlcy0tXG5cbiAgICBpZiggc2xvdC5yZWZlcmVuY2VzID09PSAwICYmIHNsb3QuaW1tdXRhYmxlICE9PSB0cnVlICkgeyAgICBcbiAgICAgIHRoaXMubGlzdFsgaW5kZXggXSA9IDBcblxuICAgICAgbGV0IGZyZWVCbG9ja1NpemUgPSAwXG4gICAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5saXN0ICkge1xuICAgICAgICBpZigga2V5ID4gaW5kZXggKSB7XG4gICAgICAgICAgZnJlZUJsb2NrU2l6ZSA9IGtleSAtIGluZGV4XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmZyZWVMaXN0WyBpbmRleCBdID0gZnJlZUJsb2NrU2l6ZVxuICAgIH1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlIZWxwZXJcbiJdfQ==
