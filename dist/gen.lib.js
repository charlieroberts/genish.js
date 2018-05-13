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
      //console.log( 'gen:', gen, gen.memory )
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
    console.log('counter value:', this.value);
    _gen.memory.heap[this.memory.value.idx] = this.initialValue;
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
      defaults = Object.assign({ initialValue: 0, shouldWrap: true }, properties);

  Object.assign(ugen, {
    min: min,
    max: max,
    initialValue: defaults.initialValue,
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
  createMemory: function createMemory(amount, type) {
    var mem = MemoryHelper.create(amount, type);
    return mem;
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
    var memType = arguments.length <= 4 || arguments[4] === undefined ? Float64Array : arguments[4];

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
    callback.out = new Float64Array(2);
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
    proto = { basename: 'phasor' },
    div = require('./div.js');

var defaults = { min: -1, max: 1 };

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var _props = arguments[2];

  var props = Object.assign({}, defaults, _props);

  var range = props.max - props.min;

  var ugen = typeof frequency === 'number' ? accum(frequency * range / gen.samplerate, reset, props) : accum(div(mul(frequency, range), gen.samplerate), reset, props);

  ugen.name = proto.basename + gen.getUID();

  return ugen;
};

},{"./accum.js":2,"./div.js":23,"./gen.js":30,"./mul.js":48}],56:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZC5qcyIsImpzL2FkZC5qcyIsImpzL2Fkc3IuanMiLCJqcy9hbmQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2F0dGFjay5qcyIsImpzL2JhbmcuanMiLCJqcy9ib29sLmpzIiwianMvY2VpbC5qcyIsImpzL2NsYW1wLmpzIiwianMvY29zLmpzIiwianMvY291bnRlci5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RjYmxvY2suanMiLCJqcy9kZWNheS5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9lbnYuanMiLCJqcy9lcS5qcyIsImpzL2V4cC5qcyIsImpzL2Zsb29yLmpzIiwianMvZm9sZC5qcyIsImpzL2dhdGUuanMiLCJqcy9nZW4uanMiLCJqcy9ndC5qcyIsImpzL2d0ZS5qcyIsImpzL2d0cC5qcyIsImpzL2hpc3RvcnkuanMiLCJqcy9pZmVsc2VpZi5qcyIsImpzL2luLmpzIiwianMvaW5kZXguanMiLCJqcy9sdC5qcyIsImpzL2x0ZS5qcyIsImpzL2x0cC5qcyIsImpzL21heC5qcyIsImpzL21lbW8uanMiLCJqcy9taW4uanMiLCJqcy9taXguanMiLCJqcy9tb2QuanMiLCJqcy9tc3Rvc2FtcHMuanMiLCJqcy9tdG9mLmpzIiwianMvbXVsLmpzIiwianMvbmVxLmpzIiwianMvbm9pc2UuanMiLCJqcy9ub3QuanMiLCJqcy9wYW4uanMiLCJqcy9wYXJhbS5qcyIsImpzL3BlZWsuanMiLCJqcy9waGFzb3IuanMiLCJqcy9wb2tlLmpzIiwianMvcG93LmpzIiwianMvcmF0ZS5qcyIsImpzL3JvdW5kLmpzIiwianMvc2FoLmpzIiwianMvc2VsZWN0b3IuanMiLCJqcy9zaWduLmpzIiwianMvc2luLmpzIiwianMvc2xpZGUuanMiLCJqcy9zdWIuanMiLCJqcy9zd2l0Y2guanMiLCJqcy90NjAuanMiLCJqcy90YW4uanMiLCJqcy90YW5oLmpzIiwianMvdHJhaW4uanMiLCJqcy91dGlsaXRpZXMuanMiLCJqcy93aW5kb3dzLmpzIiwianMvd3JhcC5qcyIsIi4uL21lbW9yeS1oZWxwZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixRQUFLLEtBQUw7O0FBRUEsc0JBQU07QUFDSixRQUFJLFlBQUo7UUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVCxDQUZBOztBQUlKLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBTCxFQUFhLEtBQUssR0FBTCxDQUFsQyxFQUR1Qjs7QUFHdkIsMEJBQWtCLE9BQU8sQ0FBUCxRQUFsQixDQUh1QjtLQUF6QixNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTixDQURLO0tBTFA7O0FBU0EsV0FBTyxHQUFQLENBYkk7R0FISTtDQUFSOztBQW9CSixPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFOLENBRGdCOztBQUdwQixNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYixDQUhvQjs7QUFLcEIsU0FBTyxHQUFQLENBTG9CO0NBQUw7OztBQ3hCakI7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVA7O0FBRUosSUFBSSxRQUFRO0FBQ1YsWUFBUyxPQUFUOztBQUVBLHNCQUFNO0FBQ0osUUFBSSxhQUFKO1FBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQVQ7UUFDQSxVQUFVLFNBQVMsS0FBSyxJQUFMO1FBQ25CLHFCQUhKLENBREk7O0FB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QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsV0FBVSxRQUFTLGNBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxVQUFVLFFBQVMsYUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsV0FBVSxRQUFTLGNBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFdBQVUsUUFBUyxjQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7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Um9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2FicycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmFicyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFicyggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hYnMoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhYnMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWJzLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGFic1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY2N1bScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keVxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB0aGlzLmluaXRpYWxWYWx1ZVxuXG4gICAgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAgKVxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgIFxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9yZXNldCwgdmFsdWVSZWYgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnXG4gICAgXG4gICAgLyogdGhyZWUgZGlmZmVyZW50IG1ldGhvZHMgb2Ygd3JhcHBpbmcsIHRoaXJkIGlzIG1vc3QgZXhwZW5zaXZlOlxuICAgICAqXG4gICAgICogMTogcmFuZ2UgezAsMX06IHkgPSB4IC0gKHggfCAwKVxuICAgICAqIDI6IGxvZzIodGhpcy5tYXgpID09IGludGVnZXI6IHkgPSB4ICYgKHRoaXMubWF4IC0gMSlcbiAgICAgKiAzOiBhbGwgb3RoZXJzOiBpZiggeCA+PSB0aGlzLm1heCApIHkgPSB0aGlzLm1heCAteFxuICAgICAqXG4gICAgICovXG5cbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzFdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1sxXSA8IDEpICkgeyBcbiAgICAgIGlmKCB0aGlzLnJlc2V0VmFsdWUgIT09IHRoaXMubWluICkge1xuXG4gICAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLnJlc2V0VmFsdWV9XFxuXFxuYFxuICAgICAgICAvL291dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLm1pbn1cXG5cXG5gXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMubWlufVxcblxcbmBcbiAgICAgICAgLy9vdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5pbml0aWFsVmFsdWV9XFxuXFxuYFxuICAgICAgfVxuICAgIH1cblxuICAgIG91dCArPSBgICB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2YWx1ZVJlZn1cXG5gXG4gICAgXG4gICAgaWYoIHRoaXMuc2hvdWxkV3JhcCA9PT0gZmFsc2UgJiYgdGhpcy5zaG91bGRDbGFtcCA9PT0gdHJ1ZSApIHtcbiAgICAgIG91dCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPCAke3RoaXMubWF4IH0gKSAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmBcbiAgICB9ZWxzZXtcbiAgICAgIG91dCArPSBgICAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgICYmIHRoaXMuc2hvdWxkV3JhcE1heCApIHdyYXAgKz0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcbmBcbiAgICBpZiggdGhpcy5taW4gIT09IC1JbmZpbml0eSAmJiB0aGlzLnNob3VsZFdyYXBNaW4gKSB3cmFwICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA8ICR7dGhpcy5taW59ICkgJHt2YWx1ZVJlZn0gKz0gJHtkaWZmfVxcbmBcblxuICAgIC8vaWYoIHRoaXMubWluID09PSAwICYmIHRoaXMubWF4ID09PSAxICkgeyBcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9IC0gKCR7dmFsdWVSZWZ9IHwgMClcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWluID09PSAwICYmICggTWF0aC5sb2cyKCB0aGlzLm1heCApIHwgMCApID09PSBNYXRoLmxvZzIoIHRoaXMubWF4ICkgKSB7XG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAmICgke3RoaXMubWF4fSAtIDEpXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgKXtcbiAgICAvLyAgd3JhcCA9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5cXG5gXG4gICAgLy99XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwICsgJ1xcbidcblxuICAgIHJldHVybiBvdXRcbiAgfSxcblxuICBkZWZhdWx0cyA6IHsgbWluOjAsIG1heDoxLCByZXNldFZhbHVlOjAsIGluaXRpYWxWYWx1ZTowLCBzaG91bGRXcmFwOnRydWUsIHNob3VsZFdyYXBNYXg6IHRydWUsIHNob3VsZFdyYXBNaW46dHJ1ZSwgc2hvdWxkQ2xhbXA6ZmFsc2UgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jciwgcmVzZXQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgICAgIFxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBcbiAgICB7IFxuICAgICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6IFsgaW5jciwgcmVzZXQgXSxcbiAgICAgIG1lbW9yeToge1xuICAgICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgICAgfVxuICAgIH0sXG4gICAgcHJvdG8uZGVmYXVsdHMsXG4gICAgcHJvcGVydGllcyBcbiAgKVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5zaG91bGRXcmFwTWF4ID09PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5zaG91bGRXcmFwTWluID09PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIHByb3BlcnRpZXMuc2hvdWxkV3JhcCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgdWdlbi5zaG91bGRXcmFwTWluID0gdWdlbi5zaG91bGRXcmFwTWF4ID0gcHJvcGVydGllcy5zaG91bGRXcmFwXG4gICAgfVxuICB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnJlc2V0VmFsdWUgPT09IHVuZGVmaW5lZCApIHtcbiAgICB1Z2VuLnJlc2V0VmFsdWUgPSB1Z2VuLm1pblxuICB9XG5cbiAgaWYoIHVnZW4uaW5pdGlhbFZhbHVlID09PSB1bmRlZmluZWQgKSB1Z2VuLmluaXRpYWxWYWx1ZSA9IHVnZW4ubWluXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkgIHsgXG4gICAgICAvL2NvbnNvbGUubG9nKCAnZ2VuOicsIGdlbiwgZ2VuLm1lbW9yeSApXG4gICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSBcbiAgICB9LFxuICAgIHNldCh2KSB7IGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IH1cbiAgfSlcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Fjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhY29zJzogTWF0aC5hY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWNvcyggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWNvcy5pbnB1dHMgPSBbIHggXVxuICBhY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFjb3MubmFtZSA9IGAke2Fjb3MuYmFzZW5hbWV9e2Fjb3MuaWR9YFxuXG4gIHJldHVybiBhY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIG11bCAgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGRpdiAgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIGRhdGEgICAgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrICAgICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgYWNjdW0gICAgPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBpZmVsc2UgICA9IHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICAgIGx0ICAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYmFuZyAgICAgPSByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICAgIGVudiAgICAgID0gcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIHBva2UgICAgID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICBuZXEgICAgICA9IHJlcXVpcmUoICcuL25lcS5qcycgKSxcbiAgICBhbmQgICAgICA9IHJlcXVpcmUoICcuL2FuZC5qcycgKSxcbiAgICBndGUgICAgICA9IHJlcXVpcmUoICcuL2d0ZS5qcycgKSxcbiAgICBtZW1vICAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGF0dGFja1RpbWUgPSA0NDEwMCwgZGVjYXlUaW1lID0gNDQxMDAsIF9wcm9wcyApID0+IHtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNoYXBlOidleHBvbmVudGlhbCcsIGFscGhhOjUsIHRyaWdnZXI6bnVsbCB9LCBfcHJvcHMgKVxuICBjb25zdCBfYmFuZyA9IHByb3BzLnRyaWdnZXIgIT09IG51bGwgPyBwcm9wcy50cmlnZ2VyIDogYmFuZygpLFxuICAgICAgICBwaGFzZSA9IGFjY3VtKCAxLCBfYmFuZywgeyBtaW46MCwgbWF4OiBJbmZpbml0eSwgaW5pdGlhbFZhbHVlOi1JbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSB9KVxuICAgICAgXG4gIGxldCBidWZmZXJEYXRhLCBidWZmZXJEYXRhUmV2ZXJzZSwgZGVjYXlEYXRhLCBvdXQsIGJ1ZmZlclxuXG4gIC8vY29uc29sZS5sb2coICdzaGFwZTonLCBwcm9wcy5zaGFwZSwgJ2F0dGFjayB0aW1lOicsIGF0dGFja1RpbWUsICdkZWNheSB0aW1lOicsIGRlY2F5VGltZSApXG4gIGxldCBjb21wbGV0ZUZsYWcgPSBkYXRhKCBbMF0gKVxuICBcbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIGlmKCBwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicgKSB7XG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApKSxcbiAgICAgIGRpdiggcGhhc2UsIGF0dGFja1RpbWUgKSxcblxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApICksXG4gICAgICBzdWIoIDEsIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSApLCBkZWNheVRpbWUgKSApLFxuICAgICAgXG4gICAgICBuZXEoIHBoYXNlLCAtSW5maW5pdHkpLFxuICAgICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgICAwIFxuICAgIClcbiAgfSBlbHNlIHtcbiAgICBidWZmZXJEYXRhID0gZW52KHsgbGVuZ3RoOjEwMjQsIHR5cGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhIH0pXG4gICAgYnVmZmVyRGF0YVJldmVyc2UgPSBlbnYoeyBsZW5ndGg6MTAyNCwgdHlwZTpwcm9wcy5zaGFwZSwgYWxwaGE6cHJvcHMuYWxwaGEsIHJldmVyc2U6dHJ1ZSB9KVxuXG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAgIGFuZCggZ3RlKHBoYXNlLDApLCBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSApLCBcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGFSZXZlcnNlLCBkaXYoIHN1YiggcGhhc2UsIGF0dGFja1RpbWUgKSwgZGVjYXlUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSksXG5cbiAgICAgIG5lcSggcGhhc2UsIC1JbmZpbml0eSApLFxuICAgICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgICAwXG4gICAgKVxuICB9XG5cbiAgb3V0LmlzQ29tcGxldGUgPSAoKT0+IGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF1cblxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF0gPSAwXG4gICAgX2JhbmcudHJpZ2dlcigpXG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7IFxuICBiYXNlbmFtZTonYWRkJyxcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dD0nJyxcbiAgICAgICAgc3VtID0gMCwgbnVtQ291bnQgPSAwLCBhZGRlckF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgaWYoIGlucHV0cy5sZW5ndGggPT09IDAgKSByZXR1cm4gMFxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGBcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgIGFkZGVyQXRFbmQgPSB0cnVlXG4gICAgICAgICAgb3V0ICs9ICcgKyAnXG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgbnVtQ291bnQrK1xuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgb3V0ICs9IGFkZGVyQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICsgJyArIHN1bVxuICAgIH1cblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGNvbnN0IGFkZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgYWRkLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFkZC5uYW1lID0gYWRkLmJhc2VuYW1lICsgYWRkLmlkXG4gIGFkZC5pbnB1dHMgPSBhcmdzXG5cbiAgcmV0dXJuIGFkZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBtdWwgICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBzdWIgICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBkaXYgICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBkYXRhICAgICA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayAgICAgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIGFjY3VtICAgID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgaWZlbHNlICAgPSByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgICBsdCAgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIGJhbmcgICAgID0gcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgICBlbnYgICAgICA9IHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgICBwYXJhbSAgICA9IHJlcXVpcmUoICcuL3BhcmFtLmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIGd0cCAgICAgID0gcmVxdWlyZSggJy4vZ3RwLmpzJyApLFxuICAgIG5vdCAgICAgID0gcmVxdWlyZSggJy4vbm90LmpzJyApLFxuICAgIGFuZCAgICAgID0gcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICAgIG5lcSAgICAgID0gcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICAgIHBva2UgICAgID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZT00NCwgZGVjYXlUaW1lPTIyMDUwLCBzdXN0YWluVGltZT00NDEwMCwgc3VzdGFpbkxldmVsPS42LCByZWxlYXNlVGltZT00NDEwMCwgX3Byb3BzICkgPT4ge1xuICBsZXQgZW52VHJpZ2dlciA9IGJhbmcoKSxcbiAgICAgIHBoYXNlID0gYWNjdW0oIDEsIGVudlRyaWdnZXIsIHsgbWF4OiBJbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSwgaW5pdGlhbFZhbHVlOkluZmluaXR5IH0pLFxuICAgICAgc2hvdWxkU3VzdGFpbiA9IHBhcmFtKCAxICksXG4gICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgIHNoYXBlOiAnZXhwb25lbnRpYWwnLFxuICAgICAgICAgYWxwaGE6IDUsXG4gICAgICAgICB0cmlnZ2VyUmVsZWFzZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgX3Byb3BzICksXG4gICAgICBidWZmZXJEYXRhLCBkZWNheURhdGEsIG91dCwgYnVmZmVyLCBzdXN0YWluQ29uZGl0aW9uLCByZWxlYXNlQWNjdW0sIHJlbGVhc2VDb25kaXRpb25cblxuXG4gIGNvbnN0IGNvbXBsZXRlRmxhZyA9IGRhdGEoIFswXSApXG5cbiAgYnVmZmVyRGF0YSA9IGVudih7IGxlbmd0aDoxMDI0LCBhbHBoYTpwcm9wcy5hbHBoYSwgc2hpZnQ6MCwgdHlwZTpwcm9wcy5zaGFwZSB9KVxuXG4gIHN1c3RhaW5Db25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZSBcbiAgICA/IHNob3VsZFN1c3RhaW5cbiAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lICkgKVxuXG4gIHJlbGVhc2VBY2N1bSA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgPyBndHAoIHN1Yiggc3VzdGFpbkxldmVsLCBhY2N1bSggZGl2KCBzdXN0YWluTGV2ZWwsIHJlbGVhc2VUaW1lICkgLCAwLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSkgKSwgMCApXG4gICAgOiBzdWIoIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSApICksIHJlbGVhc2VUaW1lICksIHN1c3RhaW5MZXZlbCApICksIFxuXG4gIHJlbGVhc2VDb25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZVxuICAgID8gbm90KCBzaG91bGRTdXN0YWluIClcbiAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lLCByZWxlYXNlVGltZSApIClcblxuICBvdXQgPSBpZmVsc2UoXG4gICAgLy8gYXR0YWNrIFxuICAgIGx0KCBwaGFzZSwgIGF0dGFja1RpbWUgKSwgXG4gICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAvLyBkZWNheVxuICAgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApLCBcbiAgICBwZWVrKCBidWZmZXJEYXRhLCBzdWIoIDEsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSApLCAgZGVjYXlUaW1lICksIHN1YiggMSwgIHN1c3RhaW5MZXZlbCApICkgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgIC8vIHN1c3RhaW5cbiAgICBhbmQoIHN1c3RhaW5Db25kaXRpb24sIG5lcSggcGhhc2UsIEluZmluaXR5ICkgKSxcbiAgICBwZWVrKCBidWZmZXJEYXRhLCAgc3VzdGFpbkxldmVsICksXG5cbiAgICAvLyByZWxlYXNlXG4gICAgcmVsZWFzZUNvbmRpdGlvbiwgLy9sdCggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSArICByZWxlYXNlVGltZSApLFxuICAgIHBlZWsoIFxuICAgICAgYnVmZmVyRGF0YSxcbiAgICAgIHJlbGVhc2VBY2N1bSwgXG4gICAgICAvL3N1YiggIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSksICByZWxlYXNlVGltZSApLCAgc3VzdGFpbkxldmVsICkgKSwgXG4gICAgICB7IGJvdW5kbW9kZTonY2xhbXAnIH1cbiAgICApLFxuXG4gICAgbmVxKCBwaGFzZSwgSW5maW5pdHkgKSxcbiAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAwXG4gIClcbiAgIFxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAxXG4gICAgZW52VHJpZ2dlci50cmlnZ2VyKClcbiAgfVxuXG4gIG91dC5pc0NvbXBsZXRlID0gKCk9PiBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdXG5cbiAgb3V0LnJlbGVhc2UgPSAoKT0+IHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMFxuICAgIC8vIFhYWCBwcmV0dHkgbmFzdHkuLi4gZ3JhYnMgYWNjdW0gaW5zaWRlIG9mIGd0cCBhbmQgcmVzZXRzIHZhbHVlIG1hbnVhbGx5XG4gICAgLy8gdW5mb3J0dW5hdGVseSBlbnZUcmlnZ2VyIHdvbid0IHdvcmsgYXMgaXQncyBiYWNrIHRvIDAgYnkgdGhlIHRpbWUgdGhlIHJlbGVhc2UgYmxvY2sgaXMgdHJpZ2dlcmVkLi4uXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyByZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4IF0gPSAwXG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gMCAmJiAke2lucHV0c1sxXX0gIT09IDApIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXNpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2FzaW4nOiBNYXRoLmFzaW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhc2luLmlucHV0cyA9IFsgeCBdXG4gIGFzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXNpbi5uYW1lID0gYCR7YXNpbi5iYXNlbmFtZX17YXNpbi5pZH1gXG5cbiAgcmV0dXJuIGFzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXRhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2F0YW4nOiBNYXRoLmF0YW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hdGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hdGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXRhbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhdGFuLmlucHV0cyA9IFsgeCBdXG4gIGF0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXRhbi5uYW1lID0gYCR7YXRhbi5iYXNlbmFtZX17YXRhbi5pZH1gXG5cbiAgcmV0dXJuIGF0YW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwICkgPT4ge1xuICBsZXQgc3NkID0gaGlzdG9yeSAoIDEgKSxcbiAgICAgIHQ2MCA9IE1hdGguZXhwKCAtNi45MDc3NTUyNzg5MjEgLyBkZWNheVRpbWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAgKSApXG5cbiAgc3NkLm91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc3NkLnZhbHVlID0gMVxuICB9XG5cbiAgcmV0dXJuIHN1YiggMSwgc3NkLm91dCApXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBnZW4oKSB7XG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBsZXQgb3V0ID0gXG5gICB2YXIgJHt0aGlzLm5hbWV9ID0gbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1cbiAgaWYoICR7dGhpcy5uYW1lfSA9PT0gMSApIG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dID0gMCAgICAgIFxuICAgICAgXG5gXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBfcHJvcHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46MCwgbWF4OjEgfSwgX3Byb3BzIClcblxuICB1Z2VuLm5hbWUgPSAnYmFuZycgKyBnZW4uZ2V0VUlEKClcblxuICB1Z2VuLm1pbiA9IHByb3BzLm1pblxuICB1Z2VuLm1heCA9IHByb3BzLm1heFxuXG4gIHVnZW4udHJpZ2dlciA9ICgpID0+IHtcbiAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gdWdlbi5tYXggXG4gIH1cblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Jvb2wnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IGAke2lucHV0c1swXX0gPT09IDAgPyAwIDogMWBcbiAgICBcbiAgICAvL2dlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICAvL3JldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgK291dCBdXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidjZWlsJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguY2VpbCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmNlaWwoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY2VpbCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNlaWwgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY2VpbC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBjZWlsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NsaXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9XG5cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9ID4gJHtpbnB1dHNbMl19ICkgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMl19XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA8ICR7aW5wdXRzWzFdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzFdfVxuYFxuICAgIG91dCA9ICcgJyArIG91dFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49LTEsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Nvcyc6IE1hdGguY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jb3MoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY29zLmlucHV0cyA9IFsgeCBdXG4gIGNvcy5pZCA9IGdlbi5nZXRVSUQoKVxuICBjb3MubmFtZSA9IGAke2Nvcy5iYXNlbmFtZX17Y29zLmlkfWBcblxuICByZXR1cm4gY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvdW50ZXInLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHlcbiAgICAgICBcbiAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBjb25zb2xlLmxvZyggJ2NvdW50ZXIgdmFsdWU6JywgdGhpcy52YWx1ZSApXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHRoaXMuaW5pdGlhbFZhbHVlXG4gICAgZnVuY3Rpb25Cb2R5ICA9IHRoaXMuY2FsbGJhY2soIGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdLCBpbnB1dHNbMl0sIGlucHV0c1szXSwgaW5wdXRzWzRdLCAgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCwgYG1lbW9yeVske3RoaXMubWVtb3J5LndyYXAuaWR4fV1gICApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG4gICBcbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMud3JhcC5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHRoaXMud3JhcC5nZW4oKVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgY2FsbGJhY2soIF9uYW1lLCBfaW5jciwgX21pbiwgX21heCwgX3Jlc2V0LCBsb29wcywgdmFsdWVSZWYsIHdyYXBSZWYgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnXG4gICAgLy8gbXVzdCBjaGVjayBmb3IgcmVzZXQgYmVmb3JlIHN0b3JpbmcgdmFsdWUgZm9yIG91dHB1dFxuICAgIGlmKCAhKHR5cGVvZiB0aGlzLmlucHV0c1szXSA9PT0gJ251bWJlcicgJiYgdGhpcy5pbnB1dHNbM10gPCAxKSApIHsgXG4gICAgICBvdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PSAxICkgJHt2YWx1ZVJlZn0gPSAke19taW59XFxuYFxuICAgIH1cblxuICAgIG91dCArPSBgICB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2YWx1ZVJlZn07XFxuICAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIFxuICAgIGlmKCB0eXBlb2YgdGhpcy5tYXggPT09ICdudW1iZXInICYmIHRoaXMubWF4ICE9PSBJbmZpbml0eSAmJiB0eXBlb2YgdGhpcy5taW4gIT09ICdudW1iZXInICkge1xuICAgICAgd3JhcCA9IFxuYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICYmICAke2xvb3BzfSA+IDApIHtcbiAgICAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2V7XG4gICAgJHt3cmFwUmVmfSA9IDBcbiAgfVxcbmBcbiAgICB9ZWxzZSBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHRoaXMubWluICE9PSBJbmZpbml0eSApIHtcbiAgICAgIHdyYXAgPSBcbmAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke19tYXh9ICYmICAke2xvb3BzfSA+IDApIHtcbiAgICAke3ZhbHVlUmVmfSAtPSAke19tYXh9IC0gJHtfbWlufVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNlIGlmKCAke3ZhbHVlUmVmfSA8ICR7X21pbn0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9ICs9ICR7X21heH0gLSAke19taW59XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2V7XG4gICAgJHt3cmFwUmVmfSA9IDBcbiAgfVxcbmBcbiAgICB9ZWxzZXtcbiAgICAgIG91dCArPSAnXFxuJ1xuICAgIH1cblxuICAgIG91dCA9IG91dCArIHdyYXBcblxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jcj0xLCBtaW49MCwgbWF4PUluZmluaXR5LCByZXNldD0wLCBsb29wcz0xLCAgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSBPYmplY3QuYXNzaWduKCB7IGluaXRpYWxWYWx1ZTogMCwgc2hvdWxkV3JhcDp0cnVlIH0sIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluOiAgICBtaW4sIFxuICAgIG1heDogICAgbWF4LFxuICAgIGluaXRpYWxWYWx1ZTogZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHZhbHVlOiAgZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbmNyLCBtaW4sIG1heCwgcmVzZXQsIGxvb3BzIF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4OiBudWxsIH0sXG4gICAgICB3cmFwOiAgeyBsZW5ndGg6MSwgaWR4OiBudWxsIH0gXG4gICAgfSxcbiAgICB3cmFwIDoge1xuICAgICAgZ2VuKCkgeyBcbiAgICAgICAgaWYoIHVnZW4ubWVtb3J5LndyYXAuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSApXG4gICAgICAgIH1cbiAgICAgICAgZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbICR7dWdlbi5tZW1vcnkud3JhcC5pZHh9IF1gXG4gICAgICAgIHJldHVybiBgbWVtb3J5WyAke3VnZW4ubWVtb3J5LndyYXAuaWR4fSBdYCBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGRlZmF1bHRzIClcbiBcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IFxuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgXG4gIHVnZW4ud3JhcC5pbnB1dHMgPSBbIHVnZW4gXVxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuICB1Z2VuLndyYXAubmFtZSA9IHVnZW4ubmFtZSArICdfd3JhcCdcbiAgcmV0dXJuIHVnZW5cbn0gXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL3BoYXNvci5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHBoYXNvcj1yZXF1aXJlKCAnLi9waGFzb3IuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjeWNsZScsXG5cbiAgaW5pdFRhYmxlKCkgeyAgICBcbiAgICBsZXQgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApXG5cbiAgICBmb3IoIGxldCBpID0gMCwgbCA9IGJ1ZmZlci5sZW5ndGg7IGkgPCBsOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IE1hdGguc2luKCAoIGkgLyBsICkgKiAoIE1hdGguUEkgKiAyICkgKVxuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLmN5Y2xlID0gZGF0YSggYnVmZmVyLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0gKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT0xLCByZXNldD0wLCBfcHJvcHMgKSA9PiB7XG4gIGlmKCB0eXBlb2YgZ2VuLmdsb2JhbHMuY3ljbGUgPT09ICd1bmRlZmluZWQnICkgcHJvdG8uaW5pdFRhYmxlKCkgXG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46MCB9LCBfcHJvcHMgKVxuXG4gIGNvbnN0IHVnZW4gPSBwZWVrKCBnZW4uZ2xvYmFscy5jeWNsZSwgcGhhc29yKCBmcmVxdWVuY3ksIHJlc2V0LCBwcm9wcyApKVxuICB1Z2VuLm5hbWUgPSAnY3ljbGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gIHV0aWxpdGllcyA9IHJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKSxcbiAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICBwb2tlID0gcmVxdWlyZSgnLi9wb2tlLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGF0YScsXG4gIGdsb2JhbHM6IHt9LFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaWR4XG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgbGV0IHVnZW4gPSB0aGlzXG4gICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnksIHRoaXMuaW1tdXRhYmxlICkgXG4gICAgICBpZHggPSB0aGlzLm1lbW9yeS52YWx1ZXMuaWR4XG4gICAgICB0cnkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXAuc2V0KCB0aGlzLmJ1ZmZlciwgaWR4IClcbiAgICAgIH1jYXRjaCggZSApIHtcbiAgICAgICAgY29uc29sZS5sb2coIGUgKVxuICAgICAgICB0aHJvdyBFcnJvciggJ2Vycm9yIHdpdGggcmVxdWVzdC4gYXNraW5nIGZvciAnICsgdGhpcy5idWZmZXIubGVuZ3RoICsnLiBjdXJyZW50IGluZGV4OiAnICsgZ2VuLm1lbW9yeUluZGV4ICsgJyBvZiAnICsgZ2VuLm1lbW9yeS5oZWFwLmxlbmd0aCApXG4gICAgICB9XG4gICAgICAvL2dlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IHRoaXNcbiAgICAgIC8vcmV0dXJuICdnZW4ubWVtb3J5JyArIHRoaXMubmFtZSArICcuYnVmZmVyJ1xuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaWR4XG4gICAgfWVsc2V7XG4gICAgICBpZHggPSBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgICB9XG4gICAgcmV0dXJuIGlkeFxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggeCwgeT0xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiwgYnVmZmVyLCBzaG91bGRMb2FkID0gZmFsc2VcbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5nbG9iYWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF0gKSB7XG4gICAgICByZXR1cm4gZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF1cbiAgICB9XG4gIH1cblxuICBpZiggdHlwZW9mIHggPT09ICdudW1iZXInICkge1xuICAgIGlmKCB5ICE9PSAxICkge1xuICAgICAgYnVmZmVyID0gW11cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgeTsgaSsrICkge1xuICAgICAgICBidWZmZXJbIGkgXSA9IG5ldyBGbG9hdDMyQXJyYXkoIHggKVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgfVxuICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggeCApICkgeyAvLyEgKHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSApIHtcbiAgICBsZXQgc2l6ZSA9IHgubGVuZ3RoXG4gICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggc2l6ZSApXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSB4WyBpIF1cbiAgICB9XG4gIH1lbHNlIGlmKCB0eXBlb2YgeCA9PT0gJ3N0cmluZycgKSB7XG4gICAgYnVmZmVyID0geyBsZW5ndGg6IHkgPiAxID8geSA6IGdlbi5zYW1wbGVyYXRlICogNjAgfSAvLyBYWFggd2hhdD8/P1xuICAgIHNob3VsZExvYWQgPSB0cnVlXG4gIH1lbHNlIGlmKCB4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkge1xuICAgIGJ1ZmZlciA9IHhcbiAgfVxuICBcbiAgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGJ1ZmZlcixcbiAgICBuYW1lOiBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKSxcbiAgICBkaW06ICBidWZmZXIubGVuZ3RoLCAvLyBYWFggaG93IGRvIHdlIGR5bmFtaWNhbGx5IGFsbG9jYXRlIHRoaXM/XG4gICAgY2hhbm5lbHMgOiAxLFxuICAgIG9ubG9hZDogbnVsbCxcbiAgICB0aGVuKCBmbmMgKSB7XG4gICAgICB1Z2VuLm9ubG9hZCA9IGZuY1xuICAgICAgcmV0dXJuIHVnZW5cbiAgICB9LFxuICAgIGltbXV0YWJsZTogcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuaW1tdXRhYmxlID09PSB0cnVlID8gdHJ1ZSA6IGZhbHNlLFxuICAgIGxvYWQoIGZpbGVuYW1lICkge1xuICAgICAgbGV0IHByb21pc2UgPSB1dGlsaXRpZXMubG9hZFNhbXBsZSggZmlsZW5hbWUsIHVnZW4gKVxuICAgICAgcHJvbWlzZS50aGVuKCAoIF9idWZmZXIgKT0+IHsgXG4gICAgICAgIHVnZW4ubWVtb3J5LnZhbHVlcy5sZW5ndGggPSB1Z2VuLmRpbSA9IF9idWZmZXIubGVuZ3RoICAgICBcbiAgICAgICAgdWdlbi5vbmxvYWQoKSBcbiAgICAgIH0pXG4gICAgfSxcbiAgICBtZW1vcnkgOiB7XG4gICAgICB2YWx1ZXM6IHsgbGVuZ3RoOmJ1ZmZlci5sZW5ndGgsIGlkeDpudWxsIH1cbiAgICB9XG4gIH0pXG5cbiAgaWYoIHNob3VsZExvYWQgKSB1Z2VuLmxvYWQoIHggKVxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggcHJvcGVydGllcy5nbG9iYWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdID0gdWdlblxuICAgIH1cbiAgICBpZiggcHJvcGVydGllcy5tZXRhID09PSB0cnVlICkge1xuICAgICAgZm9yKCBsZXQgaSA9IDAsIGxlbmd0aCA9IHVnZW4uYnVmZmVyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sIGksIHtcbiAgICAgICAgICBnZXQgKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBlZWsoIHVnZW4sIGksIHsgbW9kZTonc2ltcGxlJywgaW50ZXJwOidub25lJyB9IClcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgIHJldHVybiBwb2tlKCB1Z2VuLCB2LCBpIClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgeDEgPSBoaXN0b3J5KCksXG4gICAgICB5MSA9IGhpc3RvcnkoKSxcbiAgICAgIGZpbHRlclxuXG4gIC8vSGlzdG9yeSB4MSwgeTE7IHkgPSBpbjEgLSB4MSArIHkxKjAuOTk5NzsgeDEgPSBpbjE7IHkxID0geTsgb3V0MSA9IHk7XG4gIGZpbHRlciA9IG1lbW8oIGFkZCggc3ViKCBpbjEsIHgxLm91dCApLCBtdWwoIHkxLm91dCwgLjk5OTcgKSApIClcbiAgeDEuaW4oIGluMSApXG4gIHkxLmluKCBmaWx0ZXIgKVxuXG4gIHJldHVybiBmaWx0ZXJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHQ2MCAgICAgPSByZXF1aXJlKCAnLi90NjAuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwLCBwcm9wcyApID0+IHtcbiAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCB7IGluaXRWYWx1ZToxIH0sIHByb3BzICksXG4gICAgICBzc2QgPSBoaXN0b3J5ICggcHJvcGVydGllcy5pbml0VmFsdWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAoIGRlY2F5VGltZSApICkgKVxuXG4gIHNzZC5vdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNzZC52YWx1ZSA9IDFcbiAgfVxuXG4gIHJldHVybiBzc2Qub3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICApLFxuICAgICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgICBwb2tlID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgICAgc3ViICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgICksXG4gICAgICB3cmFwID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgICAgIGFjY3VtPSByZXF1aXJlKCAnLi9hY2N1bS5qcycpLFxuICAgICAgbWVtbyA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkZWxheScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpbnB1dHNbMF1cbiAgICBcbiAgICByZXR1cm4gaW5wdXRzWzBdXG4gIH0sXG59XG5cbmNvbnN0IGRlZmF1bHRzID0geyBzaXplOiA1MTIsIGludGVycDonbm9uZScgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCB0YXBzLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBsZXQgd3JpdGVJZHgsIHJlYWRJZHgsIGRlbGF5ZGF0YVxuXG4gIGlmKCBBcnJheS5pc0FycmF5KCB0YXBzICkgPT09IGZhbHNlICkgdGFwcyA9IFsgdGFwcyBdXG4gIFxuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgY29uc3QgbWF4VGFwU2l6ZSA9IE1hdGgubWF4KCAuLi50YXBzIClcbiAgaWYoIHByb3BzLnNpemUgPCBtYXhUYXBTaXplICkgcHJvcHMuc2l6ZSA9IG1heFRhcFNpemVcblxuICBkZWxheWRhdGEgPSBkYXRhKCBwcm9wcy5zaXplIClcbiAgXG4gIHVnZW4uaW5wdXRzID0gW11cblxuICB3cml0ZUlkeCA9IGFjY3VtKCAxLCAwLCB7IG1heDpwcm9wcy5zaXplLCBtaW46MCB9KVxuICBcbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0YXBzLmxlbmd0aDsgaSsrICkge1xuICAgIHVnZW4uaW5wdXRzWyBpIF0gPSBwZWVrKCBkZWxheWRhdGEsIHdyYXAoIHN1Yiggd3JpdGVJZHgsIHRhcHNbaV0gKSwgMCwgcHJvcHMuc2l6ZSApLHsgbW9kZTonc2FtcGxlcycsIGludGVycDpwcm9wcy5pbnRlcnAgfSlcbiAgfVxuICBcbiAgdWdlbi5vdXRwdXRzID0gdWdlbi5pbnB1dHMgLy8gWFhYIHVnaCwgVWdoLCBVR0ghIGJ1dCBpIGd1ZXNzIGl0IHdvcmtzLlxuXG4gIHBva2UoIGRlbGF5ZGF0YSwgaW4xLCB3cml0ZUlkeCApXG5cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke2dlbi5nZXRVSUQoKX1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCBuMSA9IGhpc3RvcnkoKVxuICAgIFxuICBuMS5pbiggaW4xIClcblxuICBsZXQgdWdlbiA9IHN1YiggaW4xLCBuMS5vdXQgKVxuICB1Z2VuLm5hbWUgPSAnZGVsdGEnK2dlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkaXYnLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PWAgIHZhciAke3RoaXMubmFtZX0gPSBgLFxuICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1sgMCBdLFxuICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgIGRpdkF0RW5kID0gZmFsc2VcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC8gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCArPSBgJHtsYXN0TnVtYmVyfSAvICR7dn1gXG4gICAgICB9XG5cbiAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnIC8gJyBcbiAgICB9KVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICguLi5hcmdzKSA9PiB7XG4gIGNvbnN0IGRpdiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIGRpdiwge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcbiAgfSlcblxuICBkaXYubmFtZSA9IGRpdi5iYXNlbmFtZSArIGRpdi5pZFxuICBcbiAgcmV0dXJuIGRpdlxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuJyApLFxuICAgIHdpbmRvd3MgPSByZXF1aXJlKCAnLi93aW5kb3dzJyApLFxuICAgIGRhdGEgICAgPSByZXF1aXJlKCAnLi9kYXRhJyApLFxuICAgIHBlZWsgICAgPSByZXF1aXJlKCAnLi9wZWVrJyApLFxuICAgIHBoYXNvciAgPSByZXF1aXJlKCAnLi9waGFzb3InICksXG4gICAgZGVmYXVsdHMgPSB7XG4gICAgICB0eXBlOid0cmlhbmd1bGFyJywgbGVuZ3RoOjEwMjQsIGFscGhhOi4xNSwgc2hpZnQ6MCwgcmV2ZXJzZTpmYWxzZSBcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvcHMgPT4ge1xuICBcbiAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgZGVmYXVsdHMsIHByb3BzIClcbiAgbGV0IGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHByb3BlcnRpZXMubGVuZ3RoIClcblxuICBsZXQgbmFtZSA9IHByb3BlcnRpZXMudHlwZSArICdfJyArIHByb3BlcnRpZXMubGVuZ3RoICsgJ18nICsgcHJvcGVydGllcy5zaGlmdCArICdfJyArIHByb3BlcnRpZXMucmV2ZXJzZSArICdfJyArIHByb3BlcnRpZXMuYWxwaGFcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gPT09ICd1bmRlZmluZWQnICkgeyBcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gd2luZG93c1sgcHJvcGVydGllcy50eXBlIF0oIHByb3BlcnRpZXMubGVuZ3RoLCBpLCBwcm9wZXJ0aWVzLmFscGhhLCBwcm9wZXJ0aWVzLnNoaWZ0IClcbiAgICB9XG5cbiAgICBpZiggcHJvcGVydGllcy5yZXZlcnNlID09PSB0cnVlICkgeyBcbiAgICAgIGJ1ZmZlci5yZXZlcnNlKClcbiAgICB9XG4gICAgZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdID0gZGF0YSggYnVmZmVyIClcbiAgfVxuXG4gIGxldCB1Z2VuID0gZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdIFxuICB1Z2VuLm5hbWUgPSAnZW52JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidlcScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gdGhpcy5pbnB1dHNbMF0gPT09IHRoaXMuaW5wdXRzWzFdID8gMSA6IGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ID09PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidleHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYGdlbi5leHAoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguZXhwKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgZXhwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGV4cC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBleHBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidmbG9vcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZmxvb3IgfSlcblxuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19IHwgMCApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSB8IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBmbG9vciA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBmbG9vci5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBmbG9vclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidmb2xkJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0XG5cbiAgICBvdXQgPSB0aGlzLmNyZWF0ZUNhbGxiYWNrKCBpbnB1dHNbMF0sIHRoaXMubWluLCB0aGlzLm1heCApIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBvdXQgXVxuICB9LFxuXG4gIGNyZWF0ZUNhbGxiYWNrKCB2LCBsbywgaGkgKSB7XG4gICAgbGV0IG91dCA9XG5gIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3Z9LFxuICAgICAgJHt0aGlzLm5hbWV9X3JhbmdlID0gJHtoaX0gLSAke2xvfSxcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9IDBcblxuICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gKCgke3RoaXMubmFtZX1fdmFsdWUgLSAke2xvfSkgLyAke3RoaXMubmFtZX1fcmFuZ2UpIHwgMFxuICAgICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZSAqICR7dGhpcy5uYW1lfV9udW1XcmFwc1xuICAgIH1cbiAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMrK1xuICB9IGVsc2UgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlIDwgJHtsb30pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSArPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZS0gMSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcy0tXG4gIH1cbiAgaWYoJHt0aGlzLm5hbWV9X251bVdyYXBzICYgMSkgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHtoaX0gKyAke2xvfSAtICR7dGhpcy5uYW1lfV92YWx1ZVxuYFxuICAgIHJldHVybiAnICcgKyBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZ2F0ZScsXG4gIGNvbnRyb2xTdHJpbmc6bnVsbCwgLy8gaW5zZXJ0IGludG8gb3V0cHV0IGNvZGVnZW4gZm9yIGRldGVybWluaW5nIGluZGV4aW5nXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcbiAgICBcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGxldCBsYXN0SW5wdXRNZW1vcnlJZHggPSAnbWVtb3J5WyAnICsgdGhpcy5tZW1vcnkubGFzdElucHV0LmlkeCArICcgXScsXG4gICAgICAgIG91dHB1dE1lbW9yeVN0YXJ0SWR4ID0gdGhpcy5tZW1vcnkubGFzdElucHV0LmlkeCArIDEsXG4gICAgICAgIGlucHV0U2lnbmFsID0gaW5wdXRzWzBdLFxuICAgICAgICBjb250cm9sU2lnbmFsID0gaW5wdXRzWzFdXG4gICAgXG4gICAgLyogXG4gICAgICogd2UgY2hlY2sgdG8gc2VlIGlmIHRoZSBjdXJyZW50IGNvbnRyb2wgaW5wdXRzIGVxdWFscyBvdXIgbGFzdCBpbnB1dFxuICAgICAqIGlmIHNvLCB3ZSBzdG9yZSB0aGUgc2lnbmFsIGlucHV0IGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50bHlcbiAgICAgKiBzZWxlY3RlZCBpbmRleC4gSWYgbm90LCB3ZSBwdXQgMCBpbiB0aGUgbWVtb3J5IGFzc29jaWF0ZWQgd2l0aCB0aGUgbGFzdCBzZWxlY3RlZCBpbmRleCxcbiAgICAgKiBjaGFuZ2UgdGhlIHNlbGVjdGVkIGluZGV4LCBhbmQgdGhlbiBzdG9yZSB0aGUgc2lnbmFsIGluIHB1dCBpbiB0aGUgbWVtZXJ5IGFzc29pY2F0ZWRcbiAgICAgKiB3aXRoIHRoZSBuZXdseSBzZWxlY3RlZCBpbmRleFxuICAgICAqL1xuICAgIFxuICAgIG91dCA9XG5cbmAgaWYoICR7Y29udHJvbFNpZ25hbH0gIT09ICR7bGFzdElucHV0TWVtb3J5SWR4fSApIHtcbiAgICBtZW1vcnlbICR7bGFzdElucHV0TWVtb3J5SWR4fSArICR7b3V0cHV0TWVtb3J5U3RhcnRJZHh9ICBdID0gMCBcbiAgICAke2xhc3RJbnB1dE1lbW9yeUlkeH0gPSAke2NvbnRyb2xTaWduYWx9XG4gIH1cbiAgbWVtb3J5WyAke291dHB1dE1lbW9yeVN0YXJ0SWR4fSArICR7Y29udHJvbFNpZ25hbH0gXSA9ICR7aW5wdXRTaWduYWx9XG5cbmBcbiAgICB0aGlzLmNvbnRyb2xTdHJpbmcgPSBpbnB1dHNbMV1cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICB0aGlzLm91dHB1dHMuZm9yRWFjaCggdiA9PiB2LmdlbigpIClcblxuICAgIHJldHVybiBbIG51bGwsICcgJyArIG91dCBdXG4gIH0sXG5cbiAgY2hpbGRnZW4oKSB7XG4gICAgaWYoIHRoaXMucGFyZW50LmluaXRpYWxpemVkID09PSBmYWxzZSApIHtcbiAgICAgIGdlbi5nZXRJbnB1dHMoIHRoaXMgKSAvLyBwYXJlbnQgZ2F0ZSBpcyBvbmx5IGlucHV0IG9mIGEgZ2F0ZSBvdXRwdXQsIHNob3VsZCBvbmx5IGJlIGdlbidkIG9uY2UuXG4gICAgfVxuXG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9IF1gXG4gICAgfVxuICAgIFxuICAgIHJldHVybiAgYG1lbW9yeVsgJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9IF1gXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGNvbnRyb2wsIGluMSwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGNvdW50OiAyIH1cblxuICBpZiggdHlwZW9mIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgb3V0cHV0czogW10sXG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBjb250cm9sIF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICBsYXN0SW5wdXQ6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICB9LFxuICAgIGluaXRpYWxpemVkOmZhbHNlXG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHtnZW4uZ2V0VUlEKCl9YFxuXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgdWdlbi5jb3VudDsgaSsrICkge1xuICAgIHVnZW4ub3V0cHV0cy5wdXNoKHtcbiAgICAgIGluZGV4OmksXG4gICAgICBnZW46IHByb3RvLmNoaWxkZ2VuLFxuICAgICAgcGFyZW50OnVnZW4sXG4gICAgICBpbnB1dHM6IFsgdWdlbiBdLFxuICAgICAgbWVtb3J5OiB7XG4gICAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZWQ6ZmFsc2UsXG4gICAgICBuYW1lOiBgJHt1Z2VuLm5hbWV9X291dCR7Z2VuLmdldFVJRCgpfWBcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKiBnZW4uanNcbiAqXG4gKiBsb3ctbGV2ZWwgY29kZSBnZW5lcmF0aW9uIGZvciB1bml0IGdlbmVyYXRvcnNcbiAqXG4gKi9cblxubGV0IE1lbW9yeUhlbHBlciA9IHJlcXVpcmUoICdtZW1vcnktaGVscGVyJyApXG5cbmxldCBnZW4gPSB7XG5cbiAgYWNjdW06MCxcbiAgZ2V0VUlEKCkgeyByZXR1cm4gdGhpcy5hY2N1bSsrIH0sXG4gIGRlYnVnOmZhbHNlLFxuICBzYW1wbGVyYXRlOiA0NDEwMCwgLy8gY2hhbmdlIG9uIGF1ZGlvY29udGV4dCBjcmVhdGlvblxuICBzaG91bGRMb2NhbGl6ZTogZmFsc2UsXG4gIGdsb2JhbHM6e1xuICAgIHdpbmRvd3M6IHt9LFxuICB9LFxuICBcbiAgLyogY2xvc3VyZXNcbiAgICpcbiAgICogRnVuY3Rpb25zIHRoYXQgYXJlIGluY2x1ZGVkIGFzIGFyZ3VtZW50cyB0byBtYXN0ZXIgY2FsbGJhY2suIEV4YW1wbGVzOiBNYXRoLmFicywgTWF0aC5yYW5kb20gZXRjLlxuICAgKiBYWFggU2hvdWxkIHByb2JhYmx5IGJlIHJlbmFtZWQgY2FsbGJhY2tQcm9wZXJ0aWVzIG9yIHNvbWV0aGluZyBzaW1pbGFyLi4uIGNsb3N1cmVzIGFyZSBubyBsb25nZXIgdXNlZC5cbiAgICovXG5cbiAgY2xvc3VyZXM6IG5ldyBTZXQoKSxcbiAgcGFyYW1zOiAgIG5ldyBTZXQoKSxcblxuICBwYXJhbWV0ZXJzOltdLFxuICBlbmRCbG9jazogbmV3IFNldCgpLFxuICBoaXN0b3JpZXM6IG5ldyBNYXAoKSxcblxuICBtZW1vOiB7fSxcblxuICAvL2RhdGE6IHt9LFxuICBcbiAgLyogZXhwb3J0XG4gICAqXG4gICAqIHBsYWNlIGdlbiBmdW5jdGlvbnMgaW50byBhbm90aGVyIG9iamVjdCBmb3IgZWFzaWVyIHJlZmVyZW5jZVxuICAgKi9cblxuICBleHBvcnQoIG9iaiApIHt9LFxuXG4gIGFkZFRvRW5kQmxvY2soIHYgKSB7XG4gICAgdGhpcy5lbmRCbG9jay5hZGQoICcgICcgKyB2IClcbiAgfSxcbiAgXG4gIHJlcXVlc3RNZW1vcnkoIG1lbW9yeVNwZWMsIGltbXV0YWJsZT1mYWxzZSApIHtcbiAgICBmb3IoIGxldCBrZXkgaW4gbWVtb3J5U3BlYyApIHtcbiAgICAgIGxldCByZXF1ZXN0ID0gbWVtb3J5U3BlY1sga2V5IF1cblxuICAgICAgLy9jb25zb2xlLmxvZyggJ3JlcXVlc3RpbmcgJyArIGtleSArICc6JyAsIEpTT04uc3RyaW5naWZ5KCByZXF1ZXN0ICkgKVxuXG4gICAgICBpZiggcmVxdWVzdC5sZW5ndGggPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgY29uc29sZS5sb2coICd1bmRlZmluZWQgbGVuZ3RoIGZvcjonLCBrZXkgKVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaWR4ID0gZ2VuLm1lbW9yeS5hbGxvYyggcmVxdWVzdC5sZW5ndGgsIGltbXV0YWJsZSApXG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZU1lbW9yeSggYW1vdW50LCB0eXBlICkge1xuICAgIGNvbnN0IG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIGFtb3VudCwgdHlwZSApXG4gICAgcmV0dXJuIG1lbVxuICB9LFxuXG4gIC8qIGNyZWF0ZUNhbGxiYWNrXG4gICAqXG4gICAqIHBhcmFtIHVnZW4gLSBIZWFkIG9mIGdyYXBoIHRvIGJlIGNvZGVnZW4nZFxuICAgKlxuICAgKiBHZW5lcmF0ZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVnZW4gZ3JhcGguXG4gICAqIFRoZSBnZW4uY2xvc3VyZXMgcHJvcGVydHkgc3RvcmVzIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmVcbiAgICogcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZmluYWwgZnVuY3Rpb247IHRoZXNlIGFyZSBwcmVmaXhlZFxuICAgKiBiZWZvcmUgYW55IGRlZmluZWQgcGFyYW1zIHRoZSBncmFwaCBleHBvc2VzLiBGb3IgZXhhbXBsZSwgZ2l2ZW46XG4gICAqXG4gICAqIGdlbi5jcmVhdGVDYWxsYmFjayggYWJzKCBwYXJhbSgpICkgKVxuICAgKlxuICAgKiAuLi4gdGhlIGdlbmVyYXRlZCBmdW5jdGlvbiB3aWxsIGhhdmUgYSBzaWduYXR1cmUgb2YgKCBhYnMsIHAwICkuXG4gICAqL1xuICBcbiAgY3JlYXRlQ2FsbGJhY2soIHVnZW4sIG1lbSwgZGVidWcgPSBmYWxzZSwgc2hvdWxkSW5saW5lTWVtb3J5PWZhbHNlLCBtZW1UeXBlID0gRmxvYXQ2NEFycmF5ICkge1xuICAgIGxldCBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIHVnZW4gKSAmJiB1Z2VuLmxlbmd0aCA+IDEsXG4gICAgICAgIGNhbGxiYWNrLCBcbiAgICAgICAgY2hhbm5lbDEsIGNoYW5uZWwyXG5cbiAgICBpZiggdHlwZW9mIG1lbSA9PT0gJ251bWJlcicgfHwgbWVtID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCBtZW0sIG1lbVR5cGUgKVxuICAgIH1cbiAgICBcbiAgICAvL2NvbnNvbGUubG9nKCAnY2IgbWVtb3J5OicsIG1lbSApXG4gICAgdGhpcy5tZW1vcnkgPSBtZW1cbiAgICB0aGlzLm1lbW8gPSB7fSBcbiAgICB0aGlzLmVuZEJsb2NrLmNsZWFyKClcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKClcbiAgICB0aGlzLnBhcmFtcy5jbGVhcigpXG4gICAgLy90aGlzLmdsb2JhbHMgPSB7IHdpbmRvd3M6e30gfVxuICAgIFxuICAgIHRoaXMucGFyYW1ldGVycy5sZW5ndGggPSAwXG4gICAgXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSBcIiAgJ3VzZSBzdHJpY3QnXFxuXCJcbiAgICBpZiggc2hvdWxkSW5saW5lTWVtb3J5PT09ZmFsc2UgKSB0aGlzLmZ1bmN0aW9uQm9keSArPSBcIiAgdmFyIG1lbW9yeSA9IGdlbi5tZW1vcnlcXG5cXG5cIiBcblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDEgKyBpc1N0ZXJlbzsgaSsrICkge1xuICAgICAgaWYoIHR5cGVvZiB1Z2VuW2ldID09PSAnbnVtYmVyJyApIGNvbnRpbnVlXG5cbiAgICAgIC8vbGV0IGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHVnZW5baV0uZ2VuKCkgOiB1Z2VuLmdlbigpLFxuICAgICAgbGV0IGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHRoaXMuZ2V0SW5wdXQoIHVnZW5baV0gKSA6IHRoaXMuZ2V0SW5wdXQoIHVnZW4gKSwgXG4gICAgICAgICAgYm9keSA9ICcnXG5cbiAgICAgIC8vIGlmIC5nZW4oKSByZXR1cm5zIGFycmF5LCBhZGQgdWdlbiBjYWxsYmFjayAoZ3JhcGhPdXRwdXRbMV0pIHRvIG91ciBvdXRwdXQgZnVuY3Rpb25zIGJvZHlcbiAgICAgIC8vIGFuZCB0aGVuIHJldHVybiBuYW1lIG9mIHVnZW4uIElmIC5nZW4oKSBvbmx5IGdlbmVyYXRlcyBhIG51bWJlciAoZm9yIHJlYWxseSBzaW1wbGUgZ3JhcGhzKVxuICAgICAgLy8ganVzdCByZXR1cm4gdGhhdCBudW1iZXIgKGdyYXBoT3V0cHV0WzBdKS5cbiAgICAgIGJvZHkgKz0gQXJyYXkuaXNBcnJheSggY2hhbm5lbCApID8gY2hhbm5lbFsxXSArICdcXG4nICsgY2hhbm5lbFswXSA6IGNoYW5uZWxcblxuICAgICAgLy8gc3BsaXQgYm9keSB0byBpbmplY3QgcmV0dXJuIGtleXdvcmQgb24gbGFzdCBsaW5lXG4gICAgICBib2R5ID0gYm9keS5zcGxpdCgnXFxuJylcbiAgICAgXG4gICAgICAvL2lmKCBkZWJ1ZyApIGNvbnNvbGUubG9nKCAnZnVuY3Rpb25Cb2R5IGxlbmd0aCcsIGJvZHkgKVxuICAgICAgXG4gICAgICAvLyBuZXh0IGxpbmUgaXMgdG8gYWNjb21tb2RhdGUgbWVtbyBhcyBncmFwaCBoZWFkXG4gICAgICBpZiggYm9keVsgYm9keS5sZW5ndGggLTEgXS50cmltKCkuaW5kZXhPZignbGV0JykgPiAtMSApIHsgYm9keS5wdXNoKCAnXFxuJyApIH0gXG5cbiAgICAgIC8vIGdldCBpbmRleCBvZiBsYXN0IGxpbmVcbiAgICAgIGxldCBsYXN0aWR4ID0gYm9keS5sZW5ndGggLSAxXG5cbiAgICAgIC8vIGluc2VydCByZXR1cm4ga2V5d29yZFxuICAgICAgYm9keVsgbGFzdGlkeCBdID0gJyAgZ2VuLm91dFsnICsgaSArICddICA9ICcgKyBib2R5WyBsYXN0aWR4IF0gKyAnXFxuJ1xuXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSArPSBib2R5LmpvaW4oJ1xcbicpXG4gICAgfVxuICAgIFxuICAgIHRoaXMuaGlzdG9yaWVzLmZvckVhY2goIHZhbHVlID0+IHtcbiAgICAgIGlmKCB2YWx1ZSAhPT0gbnVsbCApXG4gICAgICAgIHZhbHVlLmdlbigpICAgICAgXG4gICAgfSlcblxuICAgIGxldCByZXR1cm5TdGF0ZW1lbnQgPSBpc1N0ZXJlbyA/ICcgIHJldHVybiBnZW4ub3V0JyA6ICcgIHJldHVybiBnZW4ub3V0WzBdJ1xuICAgIFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpXG5cbiAgICBpZiggdGhpcy5lbmRCbG9jay5zaXplICkgeyBcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuY29uY2F0KCBBcnJheS5mcm9tKCB0aGlzLmVuZEJsb2NrICkgKVxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2goIHJldHVyblN0YXRlbWVudCApXG4gICAgfVxuICAgIC8vIHJlYXNzZW1ibGUgZnVuY3Rpb24gYm9keVxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuam9pbignXFxuJylcblxuICAgIC8vIHdlIGNhbiBvbmx5IGR5bmFtaWNhbGx5IGNyZWF0ZSBhIG5hbWVkIGZ1bmN0aW9uIGJ5IGR5bmFtaWNhbGx5IGNyZWF0aW5nIGFub3RoZXIgZnVuY3Rpb25cbiAgICAvLyB0byBjb25zdHJ1Y3QgdGhlIG5hbWVkIGZ1bmN0aW9uISBzaGVlc2guLi5cbiAgICAvL1xuICAgIGlmKCBzaG91bGRJbmxpbmVNZW1vcnkgPT09IHRydWUgKSB7XG4gICAgICB0aGlzLnBhcmFtZXRlcnMucHVzaCggJ21lbW9yeScgKVxuICAgIH1cbiAgICBsZXQgYnVpbGRTdHJpbmcgPSBgcmV0dXJuIGZ1bmN0aW9uIGdlbiggJHsgdGhpcy5wYXJhbWV0ZXJzLmpvaW4oJywnKSB9ICl7IFxcbiR7IHRoaXMuZnVuY3Rpb25Cb2R5IH1cXG59YFxuICAgIFxuICAgIGlmKCB0aGlzLmRlYnVnIHx8IGRlYnVnICkgY29uc29sZS5sb2coIGJ1aWxkU3RyaW5nICkgXG5cbiAgICBjYWxsYmFjayA9IG5ldyBGdW5jdGlvbiggYnVpbGRTdHJpbmcgKSgpXG5cbiAgICBcbiAgICAvLyBhc3NpZ24gcHJvcGVydGllcyB0byBuYW1lZCBmdW5jdGlvblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5jbG9zdXJlcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB2YWx1ZSA9IGRpY3RbIG5hbWUgXVxuXG4gICAgICBjYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHVnZW4gPSBkaWN0WyBuYW1lIF1cbiAgICAgIFxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBjYWxsYmFjaywgbmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHVnZW4udmFsdWUgfSxcbiAgICAgICAgc2V0KHYpeyB1Z2VuLnZhbHVlID0gdiB9XG4gICAgICB9KVxuICAgICAgLy9jYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICBjYWxsYmFjay5kYXRhID0gdGhpcy5kYXRhXG4gICAgY2FsbGJhY2sub3V0ICA9IG5ldyBGbG9hdDY0QXJyYXkoIDIgKVxuICAgIGNhbGxiYWNrLnBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlcnMuc2xpY2UoIDAgKVxuXG4gICAgLy9pZiggTWVtb3J5SGVscGVyLmlzUHJvdG90eXBlT2YoIHRoaXMubWVtb3J5ICkgKSBcbiAgICBjYWxsYmFjay5tZW1vcnkgPSB0aGlzLm1lbW9yeS5oZWFwXG5cbiAgICB0aGlzLmhpc3Rvcmllcy5jbGVhcigpXG5cbiAgICByZXR1cm4gY2FsbGJhY2tcbiAgfSxcbiAgXG4gIC8qIGdldElucHV0c1xuICAgKlxuICAgKiBDYWxsZWQgYnkgZWFjaCBpbmRpdmlkdWFsIHVnZW4gd2hlbiB0aGVpciAuZ2VuKCkgbWV0aG9kIGlzIGNhbGxlZCB0byByZXNvbHZlIHRoZWlyIHZhcmlvdXMgaW5wdXRzLlxuICAgKiBJZiBhbiBpbnB1dCBpcyBhIG51bWJlciwgcmV0dXJuIHRoZSBudW1iZXIuIElmXG4gICAqIGl0IGlzIGFuIHVnZW4sIGNhbGwgLmdlbigpIG9uIHRoZSB1Z2VuLCBtZW1vaXplIHRoZSByZXN1bHQgYW5kIHJldHVybiB0aGUgcmVzdWx0LiBJZiB0aGVcbiAgICogdWdlbiBoYXMgcHJldmlvdXNseSBiZWVuIG1lbW9pemVkIHJldHVybiB0aGUgbWVtb2l6ZWQgdmFsdWUuXG4gICAqXG4gICAqL1xuICBnZXRJbnB1dHMoIHVnZW4gKSB7XG4gICAgcmV0dXJuIHVnZW4uaW5wdXRzLm1hcCggZ2VuLmdldElucHV0ICkgXG4gIH0sXG5cbiAgZ2V0SW5wdXQoIGlucHV0ICkge1xuICAgIGxldCBpc09iamVjdCA9IHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcsXG4gICAgICAgIHByb2Nlc3NlZElucHV0XG5cbiAgICBpZiggaXNPYmplY3QgKSB7IC8vIGlmIGlucHV0IGlzIGEgdWdlbi4uLiBcbiAgICAgIC8vY29uc29sZS5sb2coIGlucHV0Lm5hbWUsIGdlbi5tZW1vWyBpbnB1dC5uYW1lIF0gKVxuICAgICAgaWYoIGdlbi5tZW1vWyBpbnB1dC5uYW1lIF0gKSB7IC8vIGlmIGl0IGhhcyBiZWVuIG1lbW9pemVkLi4uXG4gICAgICAgIHByb2Nlc3NlZElucHV0ID0gZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXVxuICAgICAgfWVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGlucHV0ICkgKSB7XG4gICAgICAgIGdlbi5nZXRJbnB1dCggaW5wdXRbMF0gKVxuICAgICAgICBnZW4uZ2V0SW5wdXQoIGlucHV0WzFdIClcbiAgICAgIH1lbHNleyAvLyBpZiBub3QgbWVtb2l6ZWQgZ2VuZXJhdGUgY29kZSAgXG4gICAgICAgIGlmKCB0eXBlb2YgaW5wdXQuZ2VuICE9PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCAnbm8gZ2VuIGZvdW5kOicsIGlucHV0LCBpbnB1dC5nZW4gKVxuICAgICAgICB9XG4gICAgICAgIGxldCBjb2RlID0gaW5wdXQuZ2VuKClcbiAgICAgICAgLy9pZiggY29kZS5pbmRleE9mKCAnT2JqZWN0JyApID4gLTEgKSBjb25zb2xlLmxvZyggJ2JhZCBpbnB1dDonLCBpbnB1dCwgY29kZSApXG4gICAgICAgIFxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggY29kZSApICkge1xuICAgICAgICAgIGlmKCAhZ2VuLnNob3VsZExvY2FsaXplICkge1xuICAgICAgICAgICAgZ2VuLmZ1bmN0aW9uQm9keSArPSBjb2RlWzFdXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBnZW4uY29kZU5hbWUgPSBjb2RlWzBdXG4gICAgICAgICAgICBnZW4ubG9jYWxpemVkQ29kZS5wdXNoKCBjb2RlWzFdIClcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyggJ2FmdGVyIEdFTicgLCB0aGlzLmZ1bmN0aW9uQm9keSApXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlWzBdXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfWVsc2V7IC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2Nlc3NlZElucHV0XG4gIH0sXG5cbiAgc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXVxuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSB0cnVlXG4gIH0sXG4gIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApIF1cbiAgfSxcblxuICBmcmVlKCBncmFwaCApIHtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggZ3JhcGggKSApIHsgLy8gc3RlcmVvIHVnZW5cbiAgICAgIGZvciggbGV0IGNoYW5uZWwgb2YgZ3JhcGggKSB7XG4gICAgICAgIHRoaXMuZnJlZSggY2hhbm5lbCApXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKCB0eXBlb2YgZ3JhcGggPT09ICdvYmplY3QnICkge1xuICAgICAgICBpZiggZ3JhcGgubWVtb3J5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgZm9yKCBsZXQgbWVtb3J5S2V5IGluIGdyYXBoLm1lbW9yeSApIHtcbiAgICAgICAgICAgIHRoaXMubWVtb3J5LmZyZWUoIGdyYXBoLm1lbW9yeVsgbWVtb3J5S2V5IF0uaWR4IClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGdyYXBoLmlucHV0cyApICkge1xuICAgICAgICAgIGZvciggbGV0IHVnZW4gb2YgZ3JhcGguaW5wdXRzICkge1xuICAgICAgICAgICAgdGhpcy5mcmVlKCB1Z2VuIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZW5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZ3QnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCgoICR7aW5wdXRzWzBdfSA+ICR7aW5wdXRzWzFdfSkgfCAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPiBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG5cXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndC5pbnB1dHMgPSBbIHgseSBdXG4gIGd0Lm5hbWUgPSBndC5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBndFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoICR7aW5wdXRzWzBdfSA+PSAke2lucHV0c1sxXX0gfCAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPj0gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3QuaW5wdXRzID0gWyB4LHkgXVxuICBndC5uYW1lID0gJ2d0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidndHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoICggJHtpbnB1dHNbMF19ID4gJHtpbnB1dHNbMV19ICkgfCAwICkgKWAgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqICggKCBpbnB1dHNbMF0gPiBpbnB1dHNbMV0gKSB8IDAgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3RwLmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gZ3RwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjE9MCApID0+IHtcbiAgbGV0IHVnZW4gPSB7XG4gICAgaW5wdXRzOiBbIGluMSBdLFxuICAgIG1lbW9yeTogeyB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4OiBudWxsIH0gfSxcbiAgICByZWNvcmRlcjogbnVsbCxcblxuICAgIGluKCB2ICkge1xuICAgICAgaWYoIGdlbi5oaXN0b3JpZXMuaGFzKCB2ICkgKXtcbiAgICAgICAgbGV0IG1lbW9IaXN0b3J5ID0gZ2VuLmhpc3Rvcmllcy5nZXQoIHYgKVxuICAgICAgICB1Z2VuLm5hbWUgPSBtZW1vSGlzdG9yeS5uYW1lXG4gICAgICAgIHJldHVybiBtZW1vSGlzdG9yeVxuICAgICAgfVxuXG4gICAgICBsZXQgb2JqID0ge1xuICAgICAgICBnZW4oKSB7XG4gICAgICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHVnZW4gKVxuXG4gICAgICAgICAgaWYoIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSApXG4gICAgICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gaW4xXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeFxuICAgICAgICAgIFxuICAgICAgICAgIGdlbi5hZGRUb0VuZEJsb2NrKCAnbWVtb3J5WyAnICsgaWR4ICsgJyBdID0gJyArIGlucHV0c1sgMCBdIClcbiAgICAgICAgICBcbiAgICAgICAgICAvLyByZXR1cm4gdWdlbiB0aGF0IGlzIGJlaW5nIHJlY29yZGVkIGluc3RlYWQgb2Ygc3NkLlxuICAgICAgICAgIC8vIHRoaXMgZWZmZWN0aXZlbHkgbWFrZXMgYSBjYWxsIHRvIHNzZC5yZWNvcmQoKSB0cmFuc3BhcmVudCB0byB0aGUgZ3JhcGguXG4gICAgICAgICAgLy8gcmVjb3JkaW5nIGlzIHRyaWdnZXJlZCBieSBwcmlvciBjYWxsIHRvIGdlbi5hZGRUb0VuZEJsb2NrLlxuICAgICAgICAgIGdlbi5oaXN0b3JpZXMuc2V0KCB2LCBvYmogKVxuXG4gICAgICAgICAgcmV0dXJuIGlucHV0c1sgMCBdXG4gICAgICAgIH0sXG4gICAgICAgIG5hbWU6IHVnZW4ubmFtZSArICdfaW4nK2dlbi5nZXRVSUQoKSxcbiAgICAgICAgbWVtb3J5OiB1Z2VuLm1lbW9yeVxuICAgICAgfVxuXG4gICAgICB0aGlzLmlucHV0c1sgMCBdID0gdlxuICAgICAgXG4gICAgICB1Z2VuLnJlY29yZGVyID0gb2JqXG5cbiAgICAgIHJldHVybiBvYmpcbiAgICB9LFxuICAgIFxuICAgIG91dDoge1xuICAgICAgICAgICAgXG4gICAgICBnZW4oKSB7XG4gICAgICAgIGlmKCB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgaWYoIGdlbi5oaXN0b3JpZXMuZ2V0KCB1Z2VuLmlucHV0c1swXSApID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBnZW4uaGlzdG9yaWVzLnNldCggdWdlbi5pbnB1dHNbMF0sIHVnZW4ucmVjb3JkZXIgKVxuICAgICAgICAgIH1cbiAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdWdlbi5tZW1vcnkudmFsdWUuaWR4IF0gPSBwYXJzZUZsb2F0KCBpbjEgKVxuICAgICAgICB9XG4gICAgICAgIGxldCBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHhcbiAgICAgICAgIFxuICAgICAgICByZXR1cm4gJ21lbW9yeVsgJyArIGlkeCArICcgXSAnXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICB1aWQ6IGdlbi5nZXRVSUQoKSxcbiAgfVxuICBcbiAgdWdlbi5vdXQubWVtb3J5ID0gdWdlbi5tZW1vcnkgXG5cbiAgdWdlbi5uYW1lID0gJ2hpc3RvcnknICsgdWdlbi51aWRcbiAgdWdlbi5vdXQubmFtZSA9IHVnZW4ubmFtZSArICdfb3V0J1xuICB1Z2VuLmluLl9uYW1lICA9IHVnZW4ubmFtZSA9ICdfaW4nXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonaWZlbHNlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvbmRpdGlvbmFscyA9IHRoaXMuaW5wdXRzWzBdLFxuICAgICAgICBkZWZhdWx0VmFsdWUgPSBnZW4uZ2V0SW5wdXQoIGNvbmRpdGlvbmFsc1sgY29uZGl0aW9uYWxzLmxlbmd0aCAtIDFdICksXG4gICAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX1fb3V0ID0gJHtkZWZhdWx0VmFsdWV9XFxuYCBcblxuICAgIC8vY29uc29sZS5sb2coICdjb25kaXRpb25hbHM6JywgdGhpcy5uYW1lLCBjb25kaXRpb25hbHMgKVxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2RlZmF1bHRWYWx1ZTonLCBkZWZhdWx0VmFsdWUgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBjb25kaXRpb25hbHMubGVuZ3RoIC0gMjsgaSs9IDIgKSB7XG4gICAgICBsZXQgaXNFbmRCbG9jayA9IGkgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggLSAzLFxuICAgICAgICAgIGNvbmQgID0gZ2VuLmdldElucHV0KCBjb25kaXRpb25hbHNbIGkgXSApLFxuICAgICAgICAgIHByZWJsb2NrID0gY29uZGl0aW9uYWxzWyBpKzEgXSxcbiAgICAgICAgICBibG9jaywgYmxvY2tOYW1lLCBvdXRwdXRcblxuICAgICAgLy9jb25zb2xlLmxvZyggJ3BiJywgcHJlYmxvY2sgKVxuXG4gICAgICBpZiggdHlwZW9mIHByZWJsb2NrID09PSAnbnVtYmVyJyApe1xuICAgICAgICBibG9jayA9IHByZWJsb2NrXG4gICAgICAgIGJsb2NrTmFtZSA9IG51bGxcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggZ2VuLm1lbW9bIHByZWJsb2NrLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIC8vIHVzZWQgdG8gcGxhY2UgYWxsIGNvZGUgZGVwZW5kZW5jaWVzIGluIGFwcHJvcHJpYXRlIGJsb2Nrc1xuICAgICAgICAgIGdlbi5zdGFydExvY2FsaXplKClcblxuICAgICAgICAgIGdlbi5nZXRJbnB1dCggcHJlYmxvY2sgKVxuXG4gICAgICAgICAgYmxvY2sgPSBnZW4uZW5kTG9jYWxpemUoKVxuICAgICAgICAgIGJsb2NrTmFtZSA9IGJsb2NrWzBdXG4gICAgICAgICAgYmxvY2sgPSBibG9ja1sgMSBdLmpvaW4oJycpXG4gICAgICAgICAgYmxvY2sgPSAnICAnICsgYmxvY2sucmVwbGFjZSggL1xcbi9naSwgJ1xcbiAgJyApXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJsb2NrID0gJydcbiAgICAgICAgICBibG9ja05hbWUgPSBnZW4ubWVtb1sgcHJlYmxvY2submFtZSBdXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb3V0cHV0ID0gYmxvY2tOYW1lID09PSBudWxsID8gXG4gICAgICAgIGAgICR7dGhpcy5uYW1lfV9vdXQgPSAke2Jsb2NrfWAgOlxuICAgICAgICBgJHtibG9ja30gICR7dGhpcy5uYW1lfV9vdXQgPSAke2Jsb2NrTmFtZX1gXG4gICAgICBcbiAgICAgIGlmKCBpPT09MCApIG91dCArPSAnICdcbiAgICAgIG91dCArPSBcbmAgaWYoICR7Y29uZH0gPT09IDEgKSB7XG4ke291dHB1dH1cbiAgfWBcblxuICAgICAgaWYoICFpc0VuZEJsb2NrICkge1xuICAgICAgICBvdXQgKz0gYCBlbHNlYFxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCArPSBgXFxuYFxuICAgICAgfVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgY29uZGl0aW9ucyA9IEFycmF5LmlzQXJyYXkoIGFyZ3NbMF0gKSA/IGFyZ3NbMF0gOiBhcmdzXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbmRpdGlvbnMgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidpbicsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5wYXJhbWV0ZXJzLnB1c2goIHRoaXMubmFtZSApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBuYW1lICkgPT4ge1xuICBsZXQgaW5wdXQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgaW5wdXQuaWQgICA9IGdlbi5nZXRVSUQoKVxuICBpbnB1dC5uYW1lID0gbmFtZSAhPT0gdW5kZWZpbmVkID8gbmFtZSA6IGAke2lucHV0LmJhc2VuYW1lfSR7aW5wdXQuaWR9YFxuICBpbnB1dFswXSA9IHtcbiAgICBnZW4oKSB7XG4gICAgICBpZiggISBnZW4ucGFyYW1ldGVycy5pbmNsdWRlcyggaW5wdXQubmFtZSApICkgZ2VuLnBhcmFtZXRlcnMucHVzaCggaW5wdXQubmFtZSApXG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMF0nXG4gICAgfVxuICB9XG4gIGlucHV0WzFdID0ge1xuICAgIGdlbigpIHtcbiAgICAgIGlmKCAhIGdlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5wdXNoKCBpbnB1dC5uYW1lIClcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1sxXSdcbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiBpbnB1dFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBsaWJyYXJ5ID0ge1xuICBleHBvcnQoIGRlc3RpbmF0aW9uICkge1xuICAgIGlmKCBkZXN0aW5hdGlvbiA9PT0gd2luZG93ICkge1xuICAgICAgZGVzdGluYXRpb24uc3NkID0gbGlicmFyeS5oaXN0b3J5ICAgIC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICAgICAgZGVzdGluYXRpb24uaW5wdXQgPSBsaWJyYXJ5LmluICAgICAgIC8vIGluIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG4gICAgICBkZXN0aW5hdGlvbi50ZXJuYXJ5ID0gbGlicmFyeS5zd2l0Y2ggLy8gc3dpdGNoIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5Lmhpc3RvcnlcbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LmluXG4gICAgICBkZWxldGUgbGlicmFyeS5zd2l0Y2hcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKCBkZXN0aW5hdGlvbiwgbGlicmFyeSApXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGxpYnJhcnksICdzYW1wbGVyYXRlJywge1xuICAgICAgZ2V0KCkgeyByZXR1cm4gbGlicmFyeS5nZW4uc2FtcGxlcmF0ZSB9LFxuICAgICAgc2V0KHYpIHt9XG4gICAgfSlcblxuICAgIGxpYnJhcnkuaW4gPSBkZXN0aW5hdGlvbi5pbnB1dFxuICAgIGxpYnJhcnkuaGlzdG9yeSA9IGRlc3RpbmF0aW9uLnNzZFxuICAgIGxpYnJhcnkuc3dpdGNoID0gZGVzdGluYXRpb24udGVybmFyeVxuXG4gICAgZGVzdGluYXRpb24uY2xpcCA9IGxpYnJhcnkuY2xhbXBcbiAgfSxcblxuICBnZW46ICAgICAgcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICBcbiAgYWJzOiAgICAgIHJlcXVpcmUoICcuL2Ficy5qcycgKSxcbiAgcm91bmQ6ICAgIHJlcXVpcmUoICcuL3JvdW5kLmpzJyApLFxuICBwYXJhbTogICAgcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gIGFkZDogICAgICByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gIHN1YjogICAgICByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gIG11bDogICAgICByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gIGRpdjogICAgICByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gIGFjY3VtOiAgICByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgY291bnRlcjogIHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gIHNpbjogICAgICByZXF1aXJlKCAnLi9zaW4uanMnICksXG4gIGNvczogICAgICByZXF1aXJlKCAnLi9jb3MuanMnICksXG4gIHRhbjogICAgICByZXF1aXJlKCAnLi90YW4uanMnICksXG4gIHRhbmg6ICAgICByZXF1aXJlKCAnLi90YW5oLmpzJyApLFxuICBhc2luOiAgICAgcmVxdWlyZSggJy4vYXNpbi5qcycgKSxcbiAgYWNvczogICAgIHJlcXVpcmUoICcuL2Fjb3MuanMnICksXG4gIGF0YW46ICAgICByZXF1aXJlKCAnLi9hdGFuLmpzJyApLCAgXG4gIHBoYXNvcjogICByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gIGRhdGE6ICAgICByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICBwZWVrOiAgICAgcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgY3ljbGU6ICAgIHJlcXVpcmUoICcuL2N5Y2xlLmpzJyApLFxuICBoaXN0b3J5OiAgcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgZGVsdGE6ICAgIHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICBmbG9vcjogICAgcmVxdWlyZSggJy4vZmxvb3IuanMnICksXG4gIGNlaWw6ICAgICByZXF1aXJlKCAnLi9jZWlsLmpzJyApLFxuICBtaW46ICAgICAgcmVxdWlyZSggJy4vbWluLmpzJyApLFxuICBtYXg6ICAgICAgcmVxdWlyZSggJy4vbWF4LmpzJyApLFxuICBzaWduOiAgICAgcmVxdWlyZSggJy4vc2lnbi5qcycgKSxcbiAgZGNibG9jazogIHJlcXVpcmUoICcuL2RjYmxvY2suanMnICksXG4gIG1lbW86ICAgICByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICByYXRlOiAgICAgcmVxdWlyZSggJy4vcmF0ZS5qcycgKSxcbiAgd3JhcDogICAgIHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gIG1peDogICAgICByZXF1aXJlKCAnLi9taXguanMnICksXG4gIGNsYW1wOiAgICByZXF1aXJlKCAnLi9jbGFtcC5qcycgKSxcbiAgcG9rZTogICAgIHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gIGRlbGF5OiAgICByZXF1aXJlKCAnLi9kZWxheS5qcycgKSxcbiAgZm9sZDogICAgIHJlcXVpcmUoICcuL2ZvbGQuanMnICksXG4gIG1vZCA6ICAgICByZXF1aXJlKCAnLi9tb2QuanMnICksXG4gIHNhaCA6ICAgICByZXF1aXJlKCAnLi9zYWguanMnICksXG4gIG5vaXNlOiAgICByZXF1aXJlKCAnLi9ub2lzZS5qcycgKSxcbiAgbm90OiAgICAgIHJlcXVpcmUoICcuL25vdC5qcycgKSxcbiAgZ3Q6ICAgICAgIHJlcXVpcmUoICcuL2d0LmpzJyApLFxuICBndGU6ICAgICAgcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICBsdDogICAgICAgcmVxdWlyZSggJy4vbHQuanMnICksIFxuICBsdGU6ICAgICAgcmVxdWlyZSggJy4vbHRlLmpzJyApLCBcbiAgYm9vbDogICAgIHJlcXVpcmUoICcuL2Jvb2wuanMnICksXG4gIGdhdGU6ICAgICByZXF1aXJlKCAnLi9nYXRlLmpzJyApLFxuICB0cmFpbjogICAgcmVxdWlyZSggJy4vdHJhaW4uanMnICksXG4gIHNsaWRlOiAgICByZXF1aXJlKCAnLi9zbGlkZS5qcycgKSxcbiAgaW46ICAgICAgIHJlcXVpcmUoICcuL2luLmpzJyApLFxuICB0NjA6ICAgICAgcmVxdWlyZSggJy4vdDYwLmpzJyksXG4gIG10b2Y6ICAgICByZXF1aXJlKCAnLi9tdG9mLmpzJyksXG4gIGx0cDogICAgICByZXF1aXJlKCAnLi9sdHAuanMnKSwgICAgICAgIC8vIFRPRE86IHRlc3RcbiAgZ3RwOiAgICAgIHJlcXVpcmUoICcuL2d0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBzd2l0Y2g6ICAgcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApLFxuICBtc3Rvc2FtcHM6cmVxdWlyZSggJy4vbXN0b3NhbXBzLmpzJyApLCAvLyBUT0RPOiBuZWVkcyB0ZXN0LFxuICBzZWxlY3RvcjogcmVxdWlyZSggJy4vc2VsZWN0b3IuanMnICksXG4gIHV0aWxpdGllczpyZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gIHBvdzogICAgICByZXF1aXJlKCAnLi9wb3cuanMnICksXG4gIGF0dGFjazogICByZXF1aXJlKCAnLi9hdHRhY2suanMnICksXG4gIGRlY2F5OiAgICByZXF1aXJlKCAnLi9kZWNheS5qcycgKSxcbiAgd2luZG93czogIHJlcXVpcmUoICcuL3dpbmRvd3MuanMnICksXG4gIGVudjogICAgICByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gIGFkOiAgICAgICByZXF1aXJlKCAnLi9hZC5qcycgICksXG4gIGFkc3I6ICAgICByZXF1aXJlKCAnLi9hZHNyLmpzJyApLFxuICBpZmVsc2U6ICAgcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gIGJhbmc6ICAgICByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICBhbmQ6ICAgICAgcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICBwYW46ICAgICAgcmVxdWlyZSggJy4vcGFuLmpzJyApLFxuICBlcTogICAgICAgcmVxdWlyZSggJy4vZXEuanMnICksXG4gIG5lcTogICAgICByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gIGV4cDogICAgICByZXF1aXJlKCAnLi9leHAuanMnIClcbn1cblxubGlicmFyeS5nZW4ubGliID0gbGlicmFyeVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYnJhcnlcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbHQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19KSB8IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gbHQuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPD0gJHtpbnB1dHNbMV19IHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gJ2x0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoKCAke2lucHV0c1swXX0gPCAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCggaW5wdXRzWzBdIDwgaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHRwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGx0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21heCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5tYXggfSlcblxuICAgICAgb3V0ID0gYGdlbi5tYXgoICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5tYXgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1heCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtYXguaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtYXhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtZW1vJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IChpbjEsbWVtb05hbWUpID0+IHtcbiAgbGV0IG1lbW8gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBtZW1vLmlucHV0cyA9IFsgaW4xIF1cbiAgbWVtby5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIG1lbW8ubmFtZSA9IG1lbW9OYW1lICE9PSB1bmRlZmluZWQgPyBtZW1vTmFtZSArICdfJyArIGdlbi5nZXRVSUQoKSA6IGAke21lbW8uYmFzZW5hbWV9JHttZW1vLmlkfWBcblxuICByZXR1cm4gbWVtb1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21pbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5taW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5taW4oICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5taW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1pbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtaW4uaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIsIHQ9LjUgKSA9PiB7XG4gIGxldCB1Z2VuID0gbWVtbyggYWRkKCBtdWwoaW4xLCBzdWIoMSx0ICkgKSwgbXVsKCBpbjIsIHQgKSApIClcbiAgdWdlbi5uYW1lID0gJ21peCcgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IG1vZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICAgIG1vZEF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgJSB2XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9ICUgJHt2fWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnICUgJyBcbiAgICAgIH0pXG5cbiAgICAgIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIG1vZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtc3Rvc2FtcHMnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHJldHVyblZhbHVlXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lIH0gPSAke2dlbi5zYW1wbGVyYXRlfSAvIDEwMDAgKiAke2lucHV0c1swXX0gXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBnZW4uc2FtcGxlcmF0ZSAvIDEwMDAgKiB0aGlzLmlucHV0c1swXVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH0gICAgXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbXN0b3NhbXBzID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1zdG9zYW1wcy5pbnB1dHMgPSBbIHggXVxuICBtc3Rvc2FtcHMubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG1zdG9zYW1wc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J210b2YnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCggJHt0aGlzLnR1bmluZ30gKiBnZW4uZXhwKCAuMDU3NzYyMjY1ICogKCR7aW5wdXRzWzBdfSAtIDY5KSApIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gdGhpcy50dW5pbmcgKiBNYXRoLmV4cCggLjA1Nzc2MjI2NSAqICggaW5wdXRzWzBdIC0gNjkpIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCBwcm9wcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IHR1bmluZzo0NDAgfVxuICBcbiAgaWYoIHByb3BzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBwcm9wcy5kZWZhdWx0cyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgZGVmYXVsdHMgKVxuICB1Z2VuLmlucHV0cyA9IFsgeCBdXG4gIFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdtdWwnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCxcbiAgICAgICAgc3VtID0gMSwgbnVtQ291bnQgPSAwLCBtdWxBdEVuZCA9IGZhbHNlLCBhbHJlYWR5RnVsbFN1bW1lZCA9IHRydWVcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgIG11bEF0RW5kID0gdHJ1ZVxuICAgICAgICAgIG91dCArPSAnICogJ1xuICAgICAgICB9XG4gICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gZmFsc2VcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggaSA9PT0gMCApIHtcbiAgICAgICAgICBzdW0gPSB2XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN1bSAqPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgfVxuICAgICAgICBudW1Db3VudCsrXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICBvdXQgKz0gbXVsQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICogJyArIHN1bVxuICAgIH1cblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGNvbnN0IG11bCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIG11bCwge1xuICAgICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6IGFyZ3MsXG4gIH0pXG4gIFxuICBtdWwubmFtZSA9IG11bC5iYXNlbmFtZSArIG11bC5pZFxuXG4gIHJldHVybiBtdWxcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J25lcScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gLyp0aGlzLmlucHV0c1swXSAhPT0gdGhpcy5pbnB1dHNbMV0gPyAxIDoqLyBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gJHtpbnB1dHNbMV19KSB8IDBcXG5cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidub2lzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXRcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnbm9pc2UnIDogTWF0aC5yYW5kb20gfSlcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBnZW4ubm9pc2UoKVxcbmBcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm9pc2UgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIG5vaXNlLm5hbWUgPSBwcm90by5uYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG5vaXNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbm90JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gPT09IDAgPyAxIDogMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSAhaW5wdXRzWzBdID09PSAwID8gMSA6IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbm90LmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIG5vdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwYW4nLCBcbiAgaW5pdFRhYmxlKCkgeyAgICBcbiAgICBsZXQgYnVmZmVyTCA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKSxcbiAgICAgICAgYnVmZmVyUiA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgY29uc3QgYW5nVG9SYWQgPSBNYXRoLlBJIC8gMTgwXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxMDI0OyBpKysgKSB7IFxuICAgICAgbGV0IHBhbiA9IGkgKiAoIDkwIC8gMTAyNCApXG4gICAgICBidWZmZXJMW2ldID0gTWF0aC5jb3MoIHBhbiAqIGFuZ1RvUmFkICkgXG4gICAgICBidWZmZXJSW2ldID0gTWF0aC5zaW4oIHBhbiAqIGFuZ1RvUmFkIClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5wYW5MID0gZGF0YSggYnVmZmVyTCwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9KVxuICAgIGdlbi5nbG9iYWxzLnBhblIgPSBkYXRhKCBidWZmZXJSLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0pXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggbGVmdElucHV0LCByaWdodElucHV0LCBwYW4gPS41LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBpZiggZ2VuLmdsb2JhbHMucGFuTCA9PT0gdW5kZWZpbmVkICkgcHJvdG8uaW5pdFRhYmxlKClcblxuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgbGVmdElucHV0LCByaWdodElucHV0IF0sXG4gICAgbGVmdDogICAgbXVsKCBsZWZ0SW5wdXQsIHBlZWsoIGdlbi5nbG9iYWxzLnBhbkwsIHBhbiwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSApLFxuICAgIHJpZ2h0OiAgIG11bCggcmlnaHRJbnB1dCwgcGVlayggZ2VuLmdsb2JhbHMucGFuUiwgcGFuLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pIClcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncGFyYW0nLFxuXG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGdlbi5wYXJhbXMuYWRkKHsgW3RoaXMubmFtZV06IHRoaXMgfSlcblxuICAgIHRoaXMudmFsdWUgPSB0aGlzLmluaXRpYWxWYWx1ZVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYFxuXG4gICAgcmV0dXJuIGdlbi5tZW1vWyB0aGlzLm5hbWUgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggcHJvcE5hbWU9MCwgdmFsdWU9MCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBpZiggdHlwZW9mIHByb3BOYW1lICE9PSAnc3RyaW5nJyApIHtcbiAgICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSBwcm9wTmFtZVxuICB9ZWxzZXtcbiAgICB1Z2VuLm5hbWUgPSBwcm9wTmFtZVxuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gdmFsdWVcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgICBkYXRhVWdlbiA9IHJlcXVpcmUoJy4vZGF0YS5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BlZWsnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQsIGZ1bmN0aW9uQm9keSwgbmV4dCwgbGVuZ3RoSXNMb2cyLCBpZHhcbiAgICBcbiAgICBpZHggPSBpbnB1dHNbMV1cbiAgICBsZW5ndGhJc0xvZzIgPSAoTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApIHwgMCkgID09PSBNYXRoLmxvZzIoIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIClcblxuICAgIGlmKCB0aGlzLm1vZGUgIT09ICdzaW1wbGUnICkge1xuXG4gICAgZnVuY3Rpb25Cb2R5ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9kYXRhSWR4ICA9ICR7aWR4fSwgXG4gICAgICAke3RoaXMubmFtZX1fcGhhc2UgPSAke3RoaXMubW9kZSA9PT0gJ3NhbXBsZXMnID8gaW5wdXRzWzBdIDogaW5wdXRzWzBdICsgJyAqICcgKyAodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxKSB9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9pbmRleCA9ICR7dGhpcy5uYW1lfV9waGFzZSB8IDAsXFxuYFxuXG4gICAgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnd3JhcCcgKSB7XG4gICAgICBuZXh0ID0gbGVuZ3RoSXNMb2cyID9cbiAgICAgIGAoICR7dGhpcy5uYW1lfV9pbmRleCArIDEgKSAmICgke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSAtIDEpYCA6XG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSA/ICR7dGhpcy5uYW1lfV9pbmRleCArIDEgLSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfWVsc2UgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnY2xhbXAnICkge1xuICAgICAgbmV4dCA9IFxuICAgICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gPyAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH0gZWxzZSBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdmb2xkJyB8fCB0aGlzLmJvdW5kbW9kZSA9PT0gJ21pcnJvcicgKSB7XG4gICAgICBuZXh0ID0gXG4gICAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA/ICR7dGhpcy5uYW1lfV9pbmRleCAtICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfWVsc2V7XG4gICAgICAgbmV4dCA9IFxuICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDFgICAgICBcbiAgICB9XG5cbiAgICBpZiggdGhpcy5pbnRlcnAgPT09ICdsaW5lYXInICkgeyAgICAgIFxuICAgIGZ1bmN0aW9uQm9keSArPSBgICAgICAgJHt0aGlzLm5hbWV9X2ZyYWMgID0gJHt0aGlzLm5hbWV9X3BoYXNlIC0gJHt0aGlzLm5hbWV9X2luZGV4LFxuICAgICAgJHt0aGlzLm5hbWV9X2Jhc2UgID0gbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICAke3RoaXMubmFtZX1faW5kZXggXSxcbiAgICAgICR7dGhpcy5uYW1lfV9uZXh0ICA9ICR7bmV4dH0sYFxuICAgICAgXG4gICAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdpZ25vcmUnICkge1xuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gYFxuICAgICAgJHt0aGlzLm5hbWV9X291dCAgID0gJHt0aGlzLm5hbWV9X2luZGV4ID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSB8fCAke3RoaXMubmFtZX1faW5kZXggPCAwID8gMCA6ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoIG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1fbmV4dCBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKVxcblxcbmBcbiAgICAgIH1lbHNle1xuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gYFxuICAgICAgJHt0aGlzLm5hbWV9X291dCAgID0gJHt0aGlzLm5hbWV9X2Jhc2UgKyAke3RoaXMubmFtZX1fZnJhYyAqICggbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9uZXh0IF0gLSAke3RoaXMubmFtZX1fYmFzZSApXFxuXFxuYFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fb3V0ID0gbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9pbmRleCBdXFxuXFxuYFxuICAgIH1cblxuICAgIH0gZWxzZSB7IC8vIG1vZGUgaXMgc2ltcGxlXG4gICAgICBmdW5jdGlvbkJvZHkgPSBgbWVtb3J5WyAke2lkeH0gKyAkeyBpbnB1dHNbMF0gfSBdYFxuICAgICAgXG4gICAgICByZXR1cm4gZnVuY3Rpb25Cb2R5XG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ19vdXQnXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUrJ19vdXQnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGRlZmF1bHRzIDogeyBjaGFubmVsczoxLCBtb2RlOidwaGFzZScsIGludGVycDonbGluZWFyJywgYm91bmRtb2RlOid3cmFwJyB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbnB1dF9kYXRhLCBpbmRleD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICAvL2NvbnNvbGUubG9nKCBkYXRhVWdlbiwgZ2VuLmRhdGEgKVxuXG4gIC8vIFhYWCB3aHkgaXMgZGF0YVVnZW4gbm90IHRoZSBhY3R1YWwgZnVuY3Rpb24/IHNvbWUgdHlwZSBvZiBicm93c2VyaWZ5IG5vbnNlbnNlLi4uXG4gIGNvbnN0IGZpbmFsRGF0YSA9IHR5cGVvZiBpbnB1dF9kYXRhLmJhc2VuYW1lID09PSAndW5kZWZpbmVkJyA/IGdlbi5saWIuZGF0YSggaW5wdXRfZGF0YSApIDogaW5wdXRfZGF0YVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIFxuICAgIHsgXG4gICAgICAnZGF0YSc6ICAgICBmaW5hbERhdGEsXG4gICAgICBkYXRhTmFtZTogICBmaW5hbERhdGEubmFtZSxcbiAgICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogICAgIFsgaW5kZXgsIGZpbmFsRGF0YSBdLFxuICAgIH0sXG4gICAgcHJvdG8uZGVmYXVsdHMsXG4gICAgcHJvcGVydGllcyBcbiAgKVxuICBcbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW0gPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBtdWwgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwcm90byA9IHsgYmFzZW5hbWU6J3BoYXNvcicgfSxcbiAgICBkaXYgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKVxuXG5jb25zdCBkZWZhdWx0cyA9IHsgbWluOiAtMSwgbWF4OiAxIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeSA9IDEsIHJlc2V0ID0gMCwgX3Byb3BzICkgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgX3Byb3BzIClcblxuICBjb25zdCByYW5nZSA9IHByb3BzLm1heCAtIHByb3BzLm1pblxuXG4gIGNvbnN0IHVnZW4gPSB0eXBlb2YgZnJlcXVlbmN5ID09PSAnbnVtYmVyJyBcbiAgICA/IGFjY3VtKCAoZnJlcXVlbmN5ICogcmFuZ2UpIC8gZ2VuLnNhbXBsZXJhdGUsIHJlc2V0LCBwcm9wcyApIFxuICAgIDogYWNjdW0oIFxuICAgICAgICBkaXYoIFxuICAgICAgICAgIG11bCggZnJlcXVlbmN5LCByYW5nZSApLFxuICAgICAgICAgIGdlbi5zYW1wbGVyYXRlXG4gICAgICAgICksIFxuICAgICAgICByZXNldCwgcHJvcHMgXG4gICAgKVxuXG4gIHVnZW4ubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsICA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcC5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Bva2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZGF0YU5hbWUgPSAnbWVtb3J5JyxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBpZHgsIG91dCwgd3JhcHBlZFxuICAgIFxuICAgIGlkeCA9IHRoaXMuZGF0YS5nZW4oKVxuXG4gICAgLy9nZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIC8vd3JhcHBlZCA9IHdyYXAoIHRoaXMuaW5wdXRzWzFdLCAwLCB0aGlzLmRhdGFMZW5ndGggKS5nZW4oKVxuICAgIC8vaWR4ID0gd3JhcHBlZFswXVxuICAgIC8vZ2VuLmZ1bmN0aW9uQm9keSArPSB3cmFwcGVkWzFdXG4gICAgbGV0IG91dHB1dFN0ciA9IHRoaXMuaW5wdXRzWzFdID09PSAwID9cbiAgICAgIGAgICR7ZGF0YU5hbWV9WyAke2lkeH0gXSA9ICR7aW5wdXRzWzBdfVxcbmAgOlxuICAgICAgYCAgJHtkYXRhTmFtZX1bICR7aWR4fSArICR7aW5wdXRzWzFdfSBdID0gJHtpbnB1dHNbMF19XFxuYFxuXG4gICAgaWYoIHRoaXMuaW5saW5lID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IG91dHB1dFN0clxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIFsgdGhpcy5pbmxpbmUsIG91dHB1dFN0ciBdXG4gICAgfVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9ICggZGF0YSwgdmFsdWUsIGluZGV4LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6MSB9IFxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBkYXRhLFxuICAgIGRhdGFOYW1lOiAgIGRhdGEubmFtZSxcbiAgICBkYXRhTGVuZ3RoOiBkYXRhLmJ1ZmZlci5sZW5ndGgsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgdmFsdWUsIGluZGV4IF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcblxuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuICBcbiAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4ubmFtZSwgdWdlbiApXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG93JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Bvdyc6IE1hdGgucG93IH0pXG5cbiAgICAgIG91dCA9IGBnZW4ucG93KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdHlwZW9mIGlucHV0c1swXSA9PT0gJ3N0cmluZycgJiYgaW5wdXRzWzBdWzBdID09PSAnKCcgKSB7XG4gICAgICAgIGlucHV0c1swXSA9IGlucHV0c1swXS5zbGljZSgxLC0xKVxuICAgICAgfVxuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMV0gPT09ICdzdHJpbmcnICYmIGlucHV0c1sxXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMV0gPSBpbnB1dHNbMV0uc2xpY2UoMSwtMSlcbiAgICAgIH1cblxuICAgICAgb3V0ID0gTWF0aC5wb3coIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0pIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgcG93ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHBvdy5pbnB1dHMgPSBbIHgseSBdXG4gIHBvdy5pZCA9IGdlbi5nZXRVSUQoKVxuICBwb3cubmFtZSA9IGAke3Bvdy5iYXNlbmFtZX17cG93LmlkfWBcblxuICByZXR1cm4gcG93XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gICAgZGVsdGEgICA9IHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICAgIHdyYXAgICAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3JhdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBwaGFzZSAgPSBoaXN0b3J5KCksXG4gICAgICAgIGluTWludXMxID0gaGlzdG9yeSgpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmaWx0ZXIsIHN1bSwgb3V0XG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X2RpZmYgPSAke2lucHV0c1swXX0gLSAke2dlbk5hbWV9Lmxhc3RTYW1wbGVcbiAgaWYoICR7dGhpcy5uYW1lfV9kaWZmIDwgLS41ICkgJHt0aGlzLm5hbWV9X2RpZmYgKz0gMVxuICAke2dlbk5hbWV9LnBoYXNlICs9ICR7dGhpcy5uYW1lfV9kaWZmICogJHtpbnB1dHNbMV19XG4gIGlmKCAke2dlbk5hbWV9LnBoYXNlID4gMSApICR7Z2VuTmFtZX0ucGhhc2UgLT0gMVxuICAke2dlbk5hbWV9Lmxhc3RTYW1wbGUgPSAke2lucHV0c1swXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcblxuICAgIHJldHVybiBbIGdlbk5hbWUgKyAnLnBoYXNlJywgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCByYXRlICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHBoYXNlOiAgICAgIDAsXG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIHJhdGUgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidyb3VuZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLnJvdW5kIH0pXG5cbiAgICAgIG91dCA9IGBnZW4ucm91bmQoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgucm91bmQoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCByb3VuZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICByb3VuZC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiByb3VuZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NhaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSAwXG4gICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lICsgJ19jb250cm9sJyBdID0gMFxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuXG4gICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX1fY29udHJvbCA9IG1lbW9yeVske3RoaXMubWVtb3J5LmNvbnRyb2wuaWR4fV0sXG4gICAgICAke3RoaXMubmFtZX1fdHJpZ2dlciA9ICR7aW5wdXRzWzFdfSA+ICR7aW5wdXRzWzJdfSA/IDEgOiAwXG5cbiAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyICE9PSAke3RoaXMubmFtZX1fY29udHJvbCAgKSB7XG4gICAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyID09PSAxICkgXG4gICAgICBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XSA9ICR7aW5wdXRzWzBdfVxuICAgIFxuICAgIG1lbW9yeVske3RoaXMubWVtb3J5LmNvbnRyb2wuaWR4fV0gPSAke3RoaXMubmFtZX1fdHJpZ2dlclxuICB9XG5gXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAsICcgJyArb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBjb250cm9sLCB0aHJlc2hvbGQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXQ6MCB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCBjb250cm9sLHRocmVzaG9sZCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgY29udHJvbDogeyBpZHg6bnVsbCwgbGVuZ3RoOjEgfSxcbiAgICAgIHZhbHVlOiAgIHsgaWR4Om51bGwsIGxlbmd0aDoxIH0sXG4gICAgfVxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzZWxlY3RvcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dCwgcmV0dXJuVmFsdWUgPSAwXG4gICAgXG4gICAgc3dpdGNoKCBpbnB1dHMubGVuZ3RoICkge1xuICAgICAgY2FzZSAyIDpcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBpbnB1dHNbMV1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDMgOlxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcblxcbmA7XG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsIG91dCBdXG4gICAgICAgIGJyZWFrOyAgXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAwXG4gIHN3aXRjaCggJHtpbnB1dHNbMF19ICsgMSApIHtcXG5gXG5cbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICBvdXQgKz1gICAgIGNhc2UgJHtpfTogJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzW2ldfTsgYnJlYWs7XFxuYCBcbiAgICAgICAgfVxuXG4gICAgICAgIG91dCArPSAnICB9XFxuXFxuJ1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSArICdfb3V0JywgJyAnICsgb3V0IF1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uaW5wdXRzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonc2lnbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLnNpZ24gfSlcblxuICAgICAgb3V0ID0gYGdlbi5zaWduKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpZ24oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBzaWduID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpZ24uaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gc2lnblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBNYXRoLnNpbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpbi5pbnB1dHMgPSBbIHggXVxuICBzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgc2luLm5hbWUgPSBgJHtzaW4uYmFzZW5hbWV9e3Npbi5pZH1gXG5cbiAgcmV0dXJuIHNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGd0ICAgICAgPSByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgICBkaXYgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIF9zd2l0Y2ggPSByZXF1aXJlKCAnLi9zd2l0Y2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgc2xpZGVVcCA9IDEsIHNsaWRlRG93biA9IDEgKSA9PiB7XG4gIGxldCB5MSA9IGhpc3RvcnkoMCksXG4gICAgICBmaWx0ZXIsIHNsaWRlQW1vdW50XG5cbiAgLy95IChuKSA9IHkgKG4tMSkgKyAoKHggKG4pIC0geSAobi0xKSkvc2xpZGUpIFxuICBzbGlkZUFtb3VudCA9IF9zd2l0Y2goIGd0KGluMSx5MS5vdXQpLCBzbGlkZVVwLCBzbGlkZURvd24gKVxuXG4gIGZpbHRlciA9IG1lbW8oIGFkZCggeTEub3V0LCBkaXYoIHN1YiggaW4xLCB5MS5vdXQgKSwgc2xpZGVBbW91bnQgKSApIClcblxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N1YicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9MCxcbiAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBzdWJBdEVuZCA9IGZhbHNlLFxuICAgICAgICBoYXNVZ2VucyA9IGZhbHNlLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IDBcblxuICAgIHRoaXMuaW5wdXRzLmZvckVhY2goIHZhbHVlID0+IHsgaWYoIGlzTmFOKCB2YWx1ZSApICkgaGFzVWdlbnMgPSB0cnVlIH0pXG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC0gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICByZXR1cm5cbiAgICAgIH1lbHNle1xuICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC0gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGxldCBzdWIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggc3ViLCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzXG4gIH0pXG4gICAgICAgXG4gIHN1Yi5uYW1lID0gJ3N1YicgKyBzdWIuaWRcblxuICByZXR1cm4gc3ViXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzd2l0Y2gnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIGlmKCBpbnB1dHNbMV0gPT09IGlucHV0c1syXSApIHJldHVybiBpbnB1dHNbMV0gLy8gaWYgYm90aCBwb3RlbnRpYWwgb3V0cHV0cyBhcmUgdGhlIHNhbWUganVzdCByZXR1cm4gb25lIG9mIHRoZW1cbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEgPSAxLCBpbjIgPSAwICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbnRyb2wsIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Q2MCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyAnZXhwJyBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gZ2VuLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gJHtpbnB1dHNbMF19IClcXG5cXG5gXG4gICAgIFxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gb3V0XG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguZXhwKCAtNi45MDc3NTUyNzg5MjEgLyBpbnB1dHNbMF0gKVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH0gICAgXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdDYwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHQ2MC5pbnB1dHMgPSBbIHggXVxuICB0NjAubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHQ2MFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0YW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICd0YW4nOiBNYXRoLnRhbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnRhbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgudGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbi5pbnB1dHMgPSBbIHggXVxuICB0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgdGFuLm5hbWUgPSBgJHt0YW4uYmFzZW5hbWV9e3Rhbi5pZH1gXG5cbiAgcmV0dXJuIHRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0YW5oJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAndGFuaCc6IE1hdGgudGFuaCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnRhbmgoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbmgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW5oID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbmguaW5wdXRzID0gWyB4IF1cbiAgdGFuaC5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW5oLm5hbWUgPSBgJHt0YW5oLmJhc2VuYW1lfXt0YW5oLmlkfWBcblxuICByZXR1cm4gdGFuaFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGx0ICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBwaGFzb3IgID0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9NDQwLCBwdWxzZXdpZHRoPS41ICkgPT4ge1xuICBsZXQgZ3JhcGggPSBsdCggYWNjdW0oIGRpdiggZnJlcXVlbmN5LCA0NDEwMCApICksIC41IClcblxuICBncmFwaC5uYW1lID0gYHRyYWluJHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiBncmFwaFxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKVxuXG5sZXQgaXNTdGVyZW8gPSBmYWxzZVxuXG5sZXQgdXRpbGl0aWVzID0ge1xuICBjdHg6IG51bGwsXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9ICgpID0+IDBcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5mb3JFYWNoKCB2ID0+IHYoKSApXG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MubGVuZ3RoID0gMFxuICB9LFxuXG4gIGNyZWF0ZUNvbnRleHQoKSB7XG4gICAgbGV0IEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHRcbiAgICB0aGlzLmN0eCA9IG5ldyBBQygpXG5cbiAgICBnZW4uc2FtcGxlcmF0ZSA9IHRoaXMuY3R4LnNhbXBsZVJhdGVcblxuICAgIGxldCBzdGFydCA9ICgpID0+IHtcbiAgICAgIGlmKCB0eXBlb2YgQUMgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG5cbiAgICAgICAgICBpZiggJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkgeyAvLyByZXF1aXJlZCB0byBzdGFydCBhdWRpbyB1bmRlciBpT1MgNlxuICAgICAgICAgICAgIGxldCBteVNvdXJjZSA9IHV0aWxpdGllcy5jdHguY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KCB1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uIClcbiAgICAgICAgICAgICBteVNvdXJjZS5ub3RlT24oIDAgKVxuICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICBjcmVhdGVTY3JpcHRQcm9jZXNzb3IoKSB7XG4gICAgdGhpcy5ub2RlID0gdGhpcy5jdHguY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCAxMDI0LCAwLCAyIClcbiAgICB0aGlzLmNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfVxuICAgIGlmKCB0eXBlb2YgdGhpcy5jYWxsYmFjayA9PT0gJ3VuZGVmaW5lZCcgKSB0aGlzLmNhbGxiYWNrID0gdGhpcy5jbGVhckZ1bmN0aW9uXG5cbiAgICB0aGlzLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiggYXVkaW9Qcm9jZXNzaW5nRXZlbnQgKSB7XG4gICAgICB2YXIgb3V0cHV0QnVmZmVyID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQub3V0cHV0QnVmZmVyO1xuXG4gICAgICB2YXIgbGVmdCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMCApLFxuICAgICAgICAgIHJpZ2h0PSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDEgKSxcbiAgICAgICAgICBpc1N0ZXJlbyA9IHV0aWxpdGllcy5pc1N0ZXJlb1xuXG4gICAgIGZvciggdmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGxlZnQubGVuZ3RoOyBzYW1wbGUrKyApIHtcbiAgICAgICAgdmFyIG91dCA9IHV0aWxpdGllcy5jYWxsYmFjaygpXG5cbiAgICAgICAgaWYoIGlzU3RlcmVvID09PSBmYWxzZSApIHtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgXSA9IHJpZ2h0WyBzYW1wbGUgXSA9IG91dCBcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgbGVmdFsgc2FtcGxlICBdID0gb3V0WzBdXG4gICAgICAgICAgcmlnaHRbIHNhbXBsZSBdID0gb3V0WzFdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm5vZGUuY29ubmVjdCggdGhpcy5jdHguZGVzdGluYXRpb24gKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgXG4gIHBsYXlHcmFwaCggZ3JhcGgsIGRlYnVnLCBtZW09NDQxMDAqMTAsIG1lbVR5cGU9RmxvYXQzMkFycmF5ICkge1xuICAgIHV0aWxpdGllcy5jbGVhcigpXG4gICAgaWYoIGRlYnVnID09PSB1bmRlZmluZWQgKSBkZWJ1ZyA9IGZhbHNlXG4gICAgICAgICAgXG4gICAgdGhpcy5pc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIGdyYXBoIClcblxuICAgIHV0aWxpdGllcy5jYWxsYmFjayA9IGdlbi5jcmVhdGVDYWxsYmFjayggZ3JhcGgsIG1lbSwgZGVidWcsIGZhbHNlLCBtZW1UeXBlIClcbiAgICBcbiAgICBpZiggdXRpbGl0aWVzLmNvbnNvbGUgKSB1dGlsaXRpZXMuY29uc29sZS5zZXRWYWx1ZSggdXRpbGl0aWVzLmNhbGxiYWNrLnRvU3RyaW5nKCkgKVxuXG4gICAgcmV0dXJuIHV0aWxpdGllcy5jYWxsYmFja1xuICB9LFxuXG4gIGxvYWRTYW1wbGUoIHNvdW5kRmlsZVBhdGgsIGRhdGEgKSB7XG4gICAgbGV0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgcmVxLm9wZW4oICdHRVQnLCBzb3VuZEZpbGVQYXRoLCB0cnVlIClcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJyBcbiAgICBcbiAgICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSxyZWplY3QpID0+IHtcbiAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGF1ZGlvRGF0YSA9IHJlcS5yZXNwb25zZVxuXG4gICAgICAgIHV0aWxpdGllcy5jdHguZGVjb2RlQXVkaW9EYXRhKCBhdWRpb0RhdGEsIChidWZmZXIpID0+IHtcbiAgICAgICAgICBkYXRhLmJ1ZmZlciA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKVxuICAgICAgICAgIHJlc29sdmUoIGRhdGEuYnVmZmVyIClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmVxLnNlbmQoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG59XG5cbnV0aWxpdGllcy5jbGVhci5jYWxsYmFja3MgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxpdGllc1xuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qXG4gKiBtYW55IHdpbmRvd3MgaGVyZSBhZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2NvcmJhbmJyb29rL2RzcC5qcy9ibG9iL21hc3Rlci9kc3AuanNcbiAqIHN0YXJ0aW5nIGF0IGxpbmUgMTQyN1xuICogdGFrZW4gOC8xNS8xNlxuKi8gXG5cbmNvbnN0IHdpbmRvd3MgPSBtb2R1bGUuZXhwb3J0cyA9IHsgXG4gIGJhcnRsZXR0KCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAyIC8gKGxlbmd0aCAtIDEpICogKChsZW5ndGggLSAxKSAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKSBcbiAgfSxcblxuICBiYXJ0bGV0dEhhbm4oIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNjIgLSAwLjQ4ICogTWF0aC5hYnMoaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAwLjUpIC0gMC4zOCAqIE1hdGguY29zKCAyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGJsYWNrbWFuKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICBsZXQgYTAgPSAoMSAtIGFscGhhKSAvIDIsXG4gICAgICAgIGExID0gMC41LFxuICAgICAgICBhMiA9IGFscGhhIC8gMlxuXG4gICAgcmV0dXJuIGEwIC0gYTEgKiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSArIGEyICogTWF0aC5jb3MoNCAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBjb3NpbmUoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIE1hdGguY29zKE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIE1hdGguUEkgLyAyKVxuICB9LFxuXG4gIGdhdXNzKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICByZXR1cm4gTWF0aC5wb3coTWF0aC5FLCAtMC41ICogTWF0aC5wb3coKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikgLyAoYWxwaGEgKiAobGVuZ3RoIC0gMSkgLyAyKSwgMikpXG4gIH0sXG5cbiAgaGFtbWluZyggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC41NCAtIDAuNDYgKiBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBoYW5uKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjUgKiAoMSAtIE1hdGguY29zKCBNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSApXG4gIH0sXG5cbiAgbGFuY3pvcyggbGVuZ3RoLCBpbmRleCApIHtcbiAgICBsZXQgeCA9IDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIDE7XG4gICAgcmV0dXJuIE1hdGguc2luKE1hdGguUEkgKiB4KSAvIChNYXRoLlBJICogeClcbiAgfSxcblxuICByZWN0YW5ndWxhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMVxuICB9LFxuXG4gIHRyaWFuZ3VsYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDIgLyBsZW5ndGggKiAobGVuZ3RoIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpXG4gIH0sXG5cbiAgLy8gcGFyYWJvbGFcbiAgd2VsY2goIGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0PTAgKSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgY29uc3QgaW5kZXggPSBzaGlmdCA9PT0gMCA/IF9pbmRleCA6IChfaW5kZXggKyBNYXRoLmZsb29yKCBzaGlmdCAqIGxlbmd0aCApKSAlIGxlbmd0aFxuICAgIGNvbnN0IG5fMV9vdmVyMiA9IChsZW5ndGggLSAxKSAvIDIgXG5cbiAgICByZXR1cm4gMSAtIE1hdGgucG93KCAoIGluZGV4IC0gbl8xX292ZXIyICkgLyBuXzFfb3ZlcjIsIDIgKVxuICB9LFxuICBpbnZlcnNld2VsY2goIGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0PTAgKSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgbGV0IGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vciggc2hpZnQgKiBsZW5ndGggKSkgJSBsZW5ndGhcbiAgICBjb25zdCBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyXG5cbiAgICByZXR1cm4gTWF0aC5wb3coICggaW5kZXggLSBuXzFfb3ZlcjIgKSAvIG5fMV9vdmVyMiwgMiApXG4gIH0sXG5cbiAgcGFyYWJvbGEoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgaWYoIGluZGV4IDw9IGxlbmd0aCAvIDIgKSB7XG4gICAgICByZXR1cm4gd2luZG93cy5pbnZlcnNld2VsY2goIGxlbmd0aCAvIDIsIGluZGV4ICkgLSAxXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gMSAtIHdpbmRvd3MuaW52ZXJzZXdlbGNoKCBsZW5ndGggLyAyLCBpbmRleCAtIGxlbmd0aCAvIDIgKVxuICAgIH1cbiAgfSxcblxuICBleHBvbmVudGlhbCggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KCBpbmRleCAvIGxlbmd0aCwgYWxwaGEgKVxuICB9LFxuXG4gIGxpbmVhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gaW5kZXggLyBsZW5ndGhcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vcj0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiAgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid3cmFwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgc2lnbmFsID0gaW5wdXRzWzBdLCBtaW4gPSBpbnB1dHNbMV0sIG1heCA9IGlucHV0c1syXSxcbiAgICAgICAgb3V0LCBkaWZmXG5cbiAgICAvL291dCA9IGAoKCgke2lucHV0c1swXX0gLSAke3RoaXMubWlufSkgJSAke2RpZmZ9ICArICR7ZGlmZn0pICUgJHtkaWZmfSArICR7dGhpcy5taW59KWBcbiAgICAvL2NvbnN0IGxvbmcgbnVtV3JhcHMgPSBsb25nKCh2LWxvKS9yYW5nZSkgLSAodiA8IGxvKTtcbiAgICAvL3JldHVybiB2IC0gcmFuZ2UgKiBkb3VibGUobnVtV3JhcHMpOyAgIFxuICAgIFxuICAgIGlmKCB0aGlzLm1pbiA9PT0gMCApIHtcbiAgICAgIGRpZmYgPSBtYXhcbiAgICB9ZWxzZSBpZiAoIGlzTmFOKCBtYXggKSB8fCBpc05hTiggbWluICkgKSB7XG4gICAgICBkaWZmID0gYCR7bWF4fSAtICR7bWlufWBcbiAgICB9ZWxzZXtcbiAgICAgIGRpZmYgPSBtYXggLSBtaW5cbiAgICB9XG5cbiAgICBvdXQgPVxuYCB2YXIgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XG4gIGlmKCAke3RoaXMubmFtZX0gPCAke3RoaXMubWlufSApICR7dGhpcy5uYW1lfSArPSAke2RpZmZ9XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA+ICR7dGhpcy5tYXh9ICkgJHt0aGlzLm5hbWV9IC09ICR7ZGlmZn1cblxuYFxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCAnICcgKyBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgbWluLCBtYXggXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgTWVtb3J5SGVscGVyID0ge1xuICBjcmVhdGUoIHNpemVPckJ1ZmZlcj00MDk2LCBtZW10eXBlPUZsb2F0MzJBcnJheSApIHtcbiAgICBsZXQgaGVscGVyID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG5cbiAgICAvLyBjb252ZW5pZW50bHksIGJ1ZmZlciBjb25zdHJ1Y3RvcnMgYWNjZXB0IGVpdGhlciBhIHNpemUgb3IgYW4gYXJyYXkgYnVmZmVyIHRvIHVzZS4uLlxuICAgIC8vIHNvLCBubyBtYXR0ZXIgd2hpY2ggaXMgcGFzc2VkIHRvIHNpemVPckJ1ZmZlciBpdCBzaG91bGQgd29yay5cbiAgICBPYmplY3QuYXNzaWduKCBoZWxwZXIsIHtcbiAgICAgIGhlYXA6IG5ldyBtZW10eXBlKCBzaXplT3JCdWZmZXIgKSxcbiAgICAgIGxpc3Q6IHt9LFxuICAgICAgZnJlZUxpc3Q6IHt9XG4gICAgfSlcblxuICAgIHJldHVybiBoZWxwZXJcbiAgfSxcblxuICBhbGxvYyggc2l6ZSwgaW1tdXRhYmxlICkge1xuICAgIGxldCBpZHggPSAtMVxuXG4gICAgaWYoIHNpemUgPiB0aGlzLmhlYXAubGVuZ3RoICkge1xuICAgICAgdGhyb3cgRXJyb3IoICdBbGxvY2F0aW9uIHJlcXVlc3QgaXMgbGFyZ2VyIHRoYW4gaGVhcCBzaXplIG9mICcgKyB0aGlzLmhlYXAubGVuZ3RoIClcbiAgICB9XG5cbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5mcmVlTGlzdCApIHtcbiAgICAgIGxldCBjYW5kaWRhdGUgPSB0aGlzLmZyZWVMaXN0WyBrZXkgXVxuXG4gICAgICBpZiggY2FuZGlkYXRlLnNpemUgPj0gc2l6ZSApIHtcbiAgICAgICAgaWR4ID0ga2V5XG5cbiAgICAgICAgdGhpcy5saXN0WyBpZHggXSA9IHsgc2l6ZSwgaW1tdXRhYmxlLCByZWZlcmVuY2VzOjEgfVxuXG4gICAgICAgIGlmKCBjYW5kaWRhdGUuc2l6ZSAhPT0gc2l6ZSApIHtcbiAgICAgICAgICBsZXQgbmV3SW5kZXggPSBpZHggKyBzaXplLFxuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZVxuXG4gICAgICAgICAgZm9yKCBsZXQga2V5IGluIHRoaXMubGlzdCApIHtcbiAgICAgICAgICAgIGlmKCBrZXkgPiBuZXdJbmRleCApIHtcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSBrZXkgLSBuZXdJbmRleFxuICAgICAgICAgICAgICB0aGlzLmZyZWVMaXN0WyBuZXdJbmRleCBdID0gbmV3RnJlZVNpemVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBpZHggIT09IC0xICkgZGVsZXRlIHRoaXMuZnJlZUxpc3RbIGlkeCBdXG5cbiAgICBpZiggaWR4ID09PSAtMSApIHtcbiAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMoIHRoaXMubGlzdCApLFxuICAgICAgICAgIGxhc3RJbmRleFxuXG4gICAgICBpZigga2V5cy5sZW5ndGggKSB7IC8vIGlmIG5vdCBmaXJzdCBhbGxvY2F0aW9uLi4uXG4gICAgICAgIGxhc3RJbmRleCA9IHBhcnNlSW50KCBrZXlzWyBrZXlzLmxlbmd0aCAtIDEgXSApXG5cbiAgICAgICAgaWR4ID0gbGFzdEluZGV4ICsgdGhpcy5saXN0WyBsYXN0SW5kZXggXS5zaXplXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWR4ID0gMFxuICAgICAgfVxuXG4gICAgICB0aGlzLmxpc3RbIGlkeCBdID0geyBzaXplLCBpbW11dGFibGUsIHJlZmVyZW5jZXM6MSB9XG4gICAgfVxuXG4gICAgaWYoIGlkeCArIHNpemUgPj0gdGhpcy5oZWFwLmxlbmd0aCApIHtcbiAgICAgIHRocm93IEVycm9yKCAnTm8gYXZhaWxhYmxlIGJsb2NrcyByZW1haW4gc3VmZmljaWVudCBmb3IgYWxsb2NhdGlvbiByZXF1ZXN0LicgKVxuICAgIH1cbiAgICByZXR1cm4gaWR4XG4gIH0sXG5cbiAgYWRkUmVmZXJlbmNlKCBpbmRleCApIHtcbiAgICBpZiggdGhpcy5saXN0WyBpbmRleCBdICE9PSB1bmRlZmluZWQgKSB7IFxuICAgICAgdGhpcy5saXN0WyBpbmRleCBdLnJlZmVyZW5jZXMrK1xuICAgIH1cbiAgfSxcblxuICBmcmVlKCBpbmRleCApIHtcbiAgICBpZiggdGhpcy5saXN0WyBpbmRleCBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICB0aHJvdyBFcnJvciggJ0NhbGxpbmcgZnJlZSgpIG9uIG5vbi1leGlzdGluZyBibG9jay4nIClcbiAgICB9XG5cbiAgICBsZXQgc2xvdCA9IHRoaXMubGlzdFsgaW5kZXggXVxuICAgIGlmKCBzbG90ID09PSAwICkgcmV0dXJuXG4gICAgc2xvdC5yZWZlcmVuY2VzLS1cblxuICAgIGlmKCBzbG90LnJlZmVyZW5jZXMgPT09IDAgJiYgc2xvdC5pbW11dGFibGUgIT09IHRydWUgKSB7ICAgIFxuICAgICAgdGhpcy5saXN0WyBpbmRleCBdID0gMFxuXG4gICAgICBsZXQgZnJlZUJsb2NrU2l6ZSA9IDBcbiAgICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmxpc3QgKSB7XG4gICAgICAgIGlmKCBrZXkgPiBpbmRleCApIHtcbiAgICAgICAgICBmcmVlQmxvY2tTaXplID0ga2V5IC0gaW5kZXhcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZnJlZUxpc3RbIGluZGV4IF0gPSBmcmVlQmxvY2tTaXplXG4gICAgfVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUhlbHBlclxuIl19
