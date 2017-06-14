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

},{"./gen.js":29}],2:[function(require,module,exports){
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
      out += '  if( ' + _reset + ' >=1 ) ' + valueRef + ' = ' + this.initialValue + '\n\n';
    }

    out += '  var ' + this.name + '_value = ' + valueRef + ';\n';

    if (this.shouldWrap === false && this.shouldClamp === true) {
      out += '  if( ' + valueRef + ' < ' + this.max + ' ) ' + valueRef + ' += ' + _incr + '\n';
    } else {
      out += '  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating
    }

    if (this.max !== Infinity && this.shouldWrap) wrap += '  if( ' + valueRef + ' >= ' + this.max + ' ) ' + valueRef + ' -= ' + diff + '\n';
    if (this.min !== -Infinity && this.shouldWrap) wrap += '  if( ' + valueRef + ' < ' + this.min + ' ) ' + valueRef + ' += ' + diff + '\n\n';

    //if( this.min === 0 && this.max === 1 ) {
    //  wrap =  `  ${valueRef} = ${valueRef} - (${valueRef} | 0)\n\n`
    //} else if( this.min === 0 && ( Math.log2( this.max ) | 0 ) === Math.log2( this.max ) ) {
    //  wrap =  `  ${valueRef} = ${valueRef} & (${this.max} - 1)\n\n`
    //} else if( this.max !== Infinity ){
    //  wrap = `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n\n`
    //}

    out = out + wrap;

    return out;
  }
};

module.exports = function (incr) {
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var properties = arguments[2];

  var ugen = Object.create(proto),
      defaults = { min: 0, max: 1, shouldWrap: true, shouldClamp: false };

  if (properties !== undefined) Object.assign(defaults, properties);

  if (defaults.initialValue === undefined) defaults.initialValue = defaults.min;

  Object.assign(ugen, {
    min: defaults.min,
    max: defaults.max,
    initial: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, reset],
    memory: {
      value: { length: 1, idx: null }
    }
  }, defaults);

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

},{"./gen.js":29}],3:[function(require,module,exports){
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

},{"./gen.js":29}],4:[function(require,module,exports){
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

  var _bang = bang(),
      phase = accum(1, _bang, { max: Infinity, shouldWrap: false, initialValue: -Infinity }),
      props = Object.assign({}, { shape: 'exponential', alpha: 5 }, _props),
      bufferData = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0;

  //console.log( 'attack time:', attackTime, 'decay time:', decayTime )
  var completeFlag = data([0]);

  // slightly more efficient to use existing phase accumulator for linear envelopes
  if (props.shape === 'linear') {
    out = ifelse(and(gte(phase, 0), lt(phase, attackTime)), memo(div(phase, attackTime)), and(gte(phase, 0), lt(phase, add(attackTime, decayTime))), sub(1, div(sub(phase, attackTime), decayTime)), neq(phase, -Infinity), poke(completeFlag, 1, 0, { inline: 0 }), 0);
  } else {
    bufferData = env(1024, { type: props.shape, alpha: props.alpha });
    out = ifelse(and(gte(phase, 0), lt(phase, attackTime)), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }), and(gte(phase, 0), lt(phase, add(attackTime, decayTime))), peek(bufferData, sub(1, div(sub(phase, attackTime), decayTime)), { boundmode: 'clamp' }), neq(phase, -Infinity), poke(completeFlag, 1, 0, { inline: 0 }), 0);
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

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":29,"./gte.js":31,"./ifelseif.js":34,"./lt.js":37,"./memo.js":41,"./mul.js":47,"./neq.js":48,"./peek.js":53,"./poke.js":55,"./sub.js":64}],5:[function(require,module,exports){
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

},{"./gen.js":29}],6:[function(require,module,exports){
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
    not = require('./not.js');

module.exports = function () {
  var attackTime = arguments.length <= 0 || arguments[0] === undefined ? 44 : arguments[0];
  var decayTime = arguments.length <= 1 || arguments[1] === undefined ? 22050 : arguments[1];
  var sustainTime = arguments.length <= 2 || arguments[2] === undefined ? 44100 : arguments[2];
  var sustainLevel = arguments.length <= 3 || arguments[3] === undefined ? .6 : arguments[3];
  var releaseTime = arguments.length <= 4 || arguments[4] === undefined ? 44100 : arguments[4];
  var _props = arguments[5];

  var envTrigger = bang(),
      phase = accum(1, envTrigger, { max: Infinity, shouldWrap: false }),
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

  // slightly more efficient to use existing phase accumulator for linear envelopes
  //if( props.shape === 'linear' ) {
  //  out = ifelse(
  //    lt( phase, props.attackTime ), memo( div( phase, props.attackTime ) ),
  //    lt( phase, props.attackTime + props.decayTime ), sub( 1, mul( div( sub( phase, props.attackTime ), props.decayTime ), 1-props.sustainLevel ) ),
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime ),
  //      props.sustainLevel,
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime + props.releaseTime ),
  //      sub( props.sustainLevel, mul( div( sub( phase, props.attackTime + props.decayTime + props.sustainTime ), props.releaseTime ), props.sustainLevel) ),
  //    0
  //  )
  //} else {    
  bufferData = env({ length: 1024, alpha: props.alpha, shift: 0, type: props.shape });

  console.log(bufferData);

  sustainCondition = props.triggerRelease ? shouldSustain : lt(phase, add(attackTime, decayTime, sustainTime));

  releaseAccum = props.triggerRelease ? gtp(sub(sustainLevel, accum(div(sustainLevel, releaseTime), 0, { shouldWrap: false })), 0) : sub(sustainLevel, mul(div(sub(phase, add(attackTime, decayTime, sustainTime)), releaseTime), sustainLevel)), releaseCondition = props.triggerRelease ? not(shouldSustain) : lt(phase, add(attackTime, decayTime, sustainTime, releaseTime));

  out = ifelse(
  // attack
  lt(phase, attackTime), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }),

  // decay
  lt(phase, add(attackTime, decayTime)), peek(bufferData, sub(1, mul(div(sub(phase, attackTime), decayTime), sub(1, sustainLevel))), { boundmode: 'clamp' }),

  // sustain
  sustainCondition, peek(bufferData, sustainLevel),

  // release
  releaseCondition, //lt( phase,  attackTime +  decayTime +  sustainTime +  releaseTime ),
  peek(bufferData, releaseAccum,
  //sub(  sustainLevel, mul( div( sub( phase,  attackTime +  decayTime +  sustainTime),  releaseTime ),  sustainLevel ) ),
  { boundmode: 'clamp' }), 0);
  //}

  out.trigger = function () {
    shouldSustain.value = 1;
    envTrigger.trigger();
  };

  out.release = function () {
    shouldSustain.value = 0;
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    gen.memory.heap[releaseAccum.inputs[0].inputs[1].memory.value.idx] = 0;
  };

  return out;
};

},{"./accum.js":2,"./add.js":5,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":29,"./gtp.js":32,"./ifelseif.js":34,"./lt.js":37,"./mul.js":47,"./not.js":50,"./param.js":52,"./peek.js":53,"./sub.js":64}],7:[function(require,module,exports){
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

},{"./gen.js":29}],8:[function(require,module,exports){
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

},{"./gen.js":29}],9:[function(require,module,exports){
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

},{"./gen.js":29}],10:[function(require,module,exports){
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

},{"./gen.js":29,"./history.js":33,"./mul.js":47,"./sub.js":64}],11:[function(require,module,exports){
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

},{"./gen.js":29}],12:[function(require,module,exports){
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

},{"./gen.js":29}],13:[function(require,module,exports){
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

},{"./gen.js":29}],14:[function(require,module,exports){
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

},{"./floor.js":26,"./gen.js":29,"./memo.js":41,"./sub.js":64}],15:[function(require,module,exports){
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

},{"./gen.js":29}],16:[function(require,module,exports){
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

},{"./gen.js":29}],17:[function(require,module,exports){
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

},{"./data.js":18,"./gen.js":29,"./mul.js":47,"./peek.js":53,"./phasor.js":54}],18:[function(require,module,exports){
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

  ugen = {
    buffer: buffer,
    name: proto.basename + _gen.getUID(),
    dim: buffer.length, // XXX how do we dynamically allocate this?
    channels: 1,
    gen: proto.gen,
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
    }
  };

  ugen.memory = {
    values: { length: ugen.dim, idx: null }
  };

  _gen.name = 'data' + _gen.getUID();

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

},{"./gen.js":29,"./peek.js":53,"./poke.js":55,"./utilities.js":70}],19:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":29,"./history.js":33,"./memo.js":41,"./mul.js":47,"./sub.js":64}],20:[function(require,module,exports){
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

},{"./gen.js":29,"./history.js":33,"./mul.js":47,"./t60.js":66}],21:[function(require,module,exports){
'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _gen = require('./gen.js'),
    data = require('./data.js'),
    poke = require('./poke.js'),
    peek = require('./peek.js'),
    sub = require('./sub.js'),
    wrap = require('./wrap.js'),
    accum = require('./accum.js');

var proto = {
  basename: 'delay',

  gen: function gen() {
    var inputs = _gen.getInputs(this);

    _gen.memo[this.name] = inputs[0];

    return inputs[0];
  }
};

var defaults = { size: 512, feedback: 0, interp: 'linear' };

module.exports = function (in1, taps, properties) {
  var ugen = Object.create(proto),
      writeIdx = void 0,
      readIdx = void 0,
      delaydata = void 0;

  if (Array.isArray(taps) === false) taps = [taps];

  var props = Object.assign({}, defaults, properties);

  if (props.size < Math.max.apply(Math, _toConsumableArray(taps))) props.size = Math.max.apply(Math, _toConsumableArray(taps));

  delaydata = data(props.size);

  ugen.inputs = [];

  writeIdx = accum(1, 0, { max: props.size });

  for (var i = 0; i < taps.length; i++) {
    ugen.inputs[i] = peek(delaydata, wrap(sub(writeIdx, taps[i]), 0, props.size), { mode: 'samples', interp: props.interp });
  }

  ugen.outputs = ugen.inputs; // ugn, Ugh, UGH! but i guess it works.

  poke(delaydata, in1, writeIdx);

  ugen.name = '' + ugen.basename + _gen.getUID();

  return ugen;
};

},{"./accum.js":2,"./data.js":18,"./gen.js":29,"./peek.js":53,"./poke.js":55,"./sub.js":64,"./wrap.js":72}],22:[function(require,module,exports){
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

},{"./gen.js":29,"./history.js":33,"./sub.js":64}],23:[function(require,module,exports){
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

},{"./gen.js":29}],24:[function(require,module,exports){
'use strict';

var gen = require('./gen'),
    windows = require('./windows'),
    data = require('./data'),
    peek = require('./peek'),
    phasor = require('./phasor'),
    defaults = {
  type: 'triangular', length: 1024, alpha: .15, shift: 0
};

module.exports = function (props) {
  var properties = Object.assign({}, defaults, props);
  var buffer = new Float32Array(properties.length);

  var name = properties.type + '_' + properties.length + '_' + properties.shift;
  if (typeof gen.globals.windows[name] === 'undefined') {

    for (var i = 0; i < properties.length; i++) {
      buffer[i] = windows[properties.type](properties.length, i, properties.alpha, properties.shift);
    }

    gen.globals.windows[name] = data(buffer);
  }

  var ugen = gen.globals.windows[name];
  ugen.name = 'env' + gen.getUID();

  return ugen;
};

},{"./data":18,"./gen":29,"./peek":53,"./phasor":54,"./windows":71}],25:[function(require,module,exports){
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

},{"./gen.js":29}],26:[function(require,module,exports){
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

},{"./gen.js":29}],27:[function(require,module,exports){
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

},{"./gen.js":29}],28:[function(require,module,exports){
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

},{"./gen.js":29}],29:[function(require,module,exports){
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

  data: {},

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

    var isStereo = Array.isArray(ugen) && ugen.length > 1,
        callback = void 0,
        channel1 = void 0,
        channel2 = void 0;

    if (typeof mem === 'number' || mem === undefined) {
      mem = MemoryHelper.create(mem);
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
   * Given an argument ugen, extract its inputs. If they are numbers, return the numebrs. If
   * they are ugens, call .gen() on the ugen, memoize the result and return the result. If the
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

},{"memory-helper":73}],30:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gt',

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
  gt.name = 'gt' + _gen.getUID();

  return gt;
};

},{"./gen.js":29}],31:[function(require,module,exports){
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

},{"./gen.js":29}],32:[function(require,module,exports){
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

},{"./gen.js":29}],33:[function(require,module,exports){
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

},{"./gen.js":29}],34:[function(require,module,exports){
/*

 a = conditional( condition, trueBlock, falseBlock )
 b = conditional([
   condition1, block1,
   condition2, block2,
   condition3, block3,
   defaultBlock
 ])

*/
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'ifelse',

  gen: function gen() {
    var conditionals = this.inputs[0],
        defaultValue = _gen.getInput(conditionals[conditionals.length - 1]),
        out = '  var ' + this.name + '_out = ' + defaultValue + '\n';

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
      /*         
       else`
            }else if( isEndBlock ) {
              out += `{\n  ${output}\n  }\n`
            }else {
      
              //if( i + 2 === conditionals.length || i === conditionals.length - 1 ) {
              //  out += `{\n  ${output}\n  }\n`
              //}else{
                out += 
      ` if( ${cond} === 1 ) {
      ${output}
        } else `
              //}
            }*/
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

},{"./gen.js":29}],35:[function(require,module,exports){
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

},{"./gen.js":29}],36:[function(require,module,exports){
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
  neq: require('./neq.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./data.js":18,"./dcblock.js":19,"./decay.js":20,"./delay.js":21,"./delta.js":22,"./div.js":23,"./env.js":24,"./eq.js":25,"./floor.js":26,"./fold.js":27,"./gate.js":28,"./gen.js":29,"./gt.js":30,"./gte.js":31,"./gtp.js":32,"./history.js":33,"./ifelseif.js":34,"./in.js":35,"./lt.js":37,"./lte.js":38,"./ltp.js":39,"./max.js":40,"./memo.js":41,"./min.js":42,"./mix.js":43,"./mod.js":44,"./mstosamps.js":45,"./mtof.js":46,"./mul.js":47,"./neq.js":48,"./noise.js":49,"./not.js":50,"./pan.js":51,"./param.js":52,"./peek.js":53,"./phasor.js":54,"./poke.js":55,"./pow.js":56,"./rate.js":57,"./round.js":58,"./sah.js":59,"./selector.js":60,"./sign.js":61,"./sin.js":62,"./slide.js":63,"./sub.js":64,"./switch.js":65,"./t60.js":66,"./tan.js":67,"./tanh.js":68,"./train.js":69,"./utilities.js":70,"./windows.js":71,"./wrap.js":72}],37:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lt',

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
  lt.name = 'lt' + _gen.getUID();

  return lt;
};

},{"./gen.js":29}],38:[function(require,module,exports){
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

},{"./gen.js":29}],39:[function(require,module,exports){
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

},{"./gen.js":29}],40:[function(require,module,exports){
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

},{"./gen.js":29}],41:[function(require,module,exports){
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

},{"./gen.js":29}],42:[function(require,module,exports){
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

},{"./gen.js":29}],43:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":29,"./memo.js":41,"./mul.js":47,"./sub.js":64}],44:[function(require,module,exports){
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

},{"./gen.js":29}],45:[function(require,module,exports){
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

},{"./gen.js":29}],46:[function(require,module,exports){
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

},{"./gen.js":29}],47:[function(require,module,exports){
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

},{"./gen.js":29}],48:[function(require,module,exports){
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

},{"./gen.js":29}],49:[function(require,module,exports){
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

},{"./gen.js":29}],50:[function(require,module,exports){
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

},{"./gen.js":29}],51:[function(require,module,exports){
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

    var sqrtTwoOverTwo = Math.sqrt(2) / 2;

    for (var i = 0; i < 1024; i++) {
      var pan = -1 + i / 1024 * 2;
      bufferL[i] = sqrtTwoOverTwo * (Math.cos(pan) - Math.sin(pan));
      bufferR[i] = sqrtTwoOverTwo * (Math.cos(pan) + Math.sin(pan));
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

},{"./data.js":18,"./gen.js":29,"./mul.js":47,"./peek.js":53}],52:[function(require,module,exports){
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

},{"./gen.js":29}],53:[function(require,module,exports){
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
  }
};

module.exports = function (data, index, properties) {
  var ugen = Object.create(proto),
      defaults = { channels: 1, mode: 'phase', interp: 'linear', boundmode: 'wrap' };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    data: data,
    dataName: data.name,
    uid: _gen.getUID(),
    inputs: [index, data]
  }, defaults);

  ugen.name = ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":29}],54:[function(require,module,exports){
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

},{"./accum.js":2,"./gen.js":29,"./mul.js":47}],55:[function(require,module,exports){
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

},{"./gen.js":29,"./mul.js":47,"./wrap.js":72}],56:[function(require,module,exports){
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

},{"./gen.js":29}],57:[function(require,module,exports){
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

},{"./add.js":5,"./delta.js":22,"./gen.js":29,"./history.js":33,"./memo.js":41,"./mul.js":47,"./sub.js":64,"./wrap.js":72}],58:[function(require,module,exports){
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

},{"./gen.js":29}],59:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sah',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    _gen.data[this.name] = 0;
    _gen.data[this.name + '_control'] = 0;

    out = ' var ' + this.name + ' = gen.data.' + this.name + '_control,\n      ' + this.name + '_trigger = ' + inputs[1] + ' > ' + inputs[2] + ' ? 1 : 0\n\n  if( ' + this.name + '_trigger !== ' + this.name + '  ) {\n    if( ' + this.name + '_trigger === 1 ) \n      gen.data.' + this.name + ' = ' + inputs[0] + '\n    gen.data.' + this.name + '_control = ' + this.name + '_trigger\n  }\n';

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

},{"./gen.js":29}],60:[function(require,module,exports){
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

},{"./gen.js":29}],61:[function(require,module,exports){
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

},{"./gen.js":29}],62:[function(require,module,exports){
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

},{"./gen.js":29}],63:[function(require,module,exports){
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

},{"./add.js":5,"./div.js":23,"./gen.js":29,"./gt.js":30,"./history.js":33,"./memo.js":41,"./mul.js":47,"./sub.js":64,"./switch.js":65}],64:[function(require,module,exports){
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

},{"./gen.js":29}],65:[function(require,module,exports){
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

},{"./gen.js":29}],66:[function(require,module,exports){
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

},{"./gen.js":29}],67:[function(require,module,exports){
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

},{"./gen.js":29}],68:[function(require,module,exports){
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

},{"./gen.js":29}],69:[function(require,module,exports){
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

},{"./gen.js":29,"./lt.js":37,"./phasor.js":54}],70:[function(require,module,exports){
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
    var mem = arguments.length <= 2 || arguments[2] === undefined ? 44100 * 10 : arguments[2];

    utilities.clear();
    if (debug === undefined) debug = false;

    isStereo = Array.isArray(graph);

    utilities.callback = gen.createCallback(graph, mem, debug);

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

},{"./data.js":18,"./gen.js":29}],71:[function(require,module,exports){
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
  welch: function welch(length, _index, ignore, shift) {
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

},{}],72:[function(require,module,exports){
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

},{"./floor.js":26,"./gen.js":29,"./memo.js":41,"./sub.js":64}],73:[function(require,module,exports){
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

},{}]},{},[36])(36)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZC5qcyIsImpzL2FkZC5qcyIsImpzL2Fkc3IuanMiLCJqcy9hbmQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2F0dGFjay5qcyIsImpzL2JhbmcuanMiLCJqcy9ib29sLmpzIiwianMvY2VpbC5qcyIsImpzL2NsYW1wLmpzIiwianMvY29zLmpzIiwianMvY291bnRlci5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RjYmxvY2suanMiLCJqcy9kZWNheS5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9lbnYuanMiLCJqcy9lcS5qcyIsImpzL2Zsb29yLmpzIiwianMvZm9sZC5qcyIsImpzL2dhdGUuanMiLCJqcy9nZW4uanMiLCJqcy9ndC5qcyIsImpzL2d0ZS5qcyIsImpzL2d0cC5qcyIsImpzL2hpc3RvcnkuanMiLCJqcy9pZmVsc2VpZi5qcyIsImpzL2luLmpzIiwianMvaW5kZXguanMiLCJqcy9sdC5qcyIsImpzL2x0ZS5qcyIsImpzL2x0cC5qcyIsImpzL21heC5qcyIsImpzL21lbW8uanMiLCJqcy9taW4uanMiLCJqcy9taXguanMiLCJqcy9tb2QuanMiLCJqcy9tc3Rvc2FtcHMuanMiLCJqcy9tdG9mLmpzIiwianMvbXVsLmpzIiwianMvbmVxLmpzIiwianMvbm9pc2UuanMiLCJqcy9ub3QuanMiLCJqcy9wYW4uanMiLCJqcy9wYXJhbS5qcyIsImpzL3BlZWsuanMiLCJqcy9waGFzb3IuanMiLCJqcy9wb2tlLmpzIiwianMvcG93LmpzIiwianMvcmF0ZS5qcyIsImpzL3JvdW5kLmpzIiwianMvc2FoLmpzIiwianMvc2VsZWN0b3IuanMiLCJqcy9zaWduLmpzIiwianMvc2luLmpzIiwianMvc2xpZGUuanMiLCJqcy9zdWIuanMiLCJqcy9zd2l0Y2guanMiLCJqcy90NjAuanMiLCJqcy90YW4uanMiLCJqcy90YW5oLmpzIiwianMvdHJhaW4uanMiLCJqcy91dGlsaXRpZXMuanMiLCJqcy93aW5kb3dzLmpzIiwianMvd3JhcC5qcyIsIi4uL21lbW9yeS1oZWxwZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixRQUFLLEtBQUw7O0FBRUEsc0JBQU07QUFDSixRQUFJLFlBQUo7UUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVCxDQUZBOztBQUlKLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBTCxFQUFhLEtBQUssR0FBTCxDQUFsQyxFQUR1Qjs7QUFHdkIsMEJBQWtCLE9BQU8sQ0FBUCxRQUFsQixDQUh1QjtLQUF6QixNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTixDQURLO0tBTFA7O0FBU0EsV0FBTyxHQUFQLENBYkk7R0FISTtDQUFSOztBQW9CSixPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFOLENBRGdCOztBQUdwQixNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYixDQUhvQjs7QUFLcEIsU0FBTyxHQUFQLENBTG9CO0NBQUw7OztBQ3hCakI7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVA7O0FBRUosSUFBSSxRQUFRO0FBQ1YsWUFBUyxPQUFUOztBQUVBLHNCQUFNO0FBQ0osUUFBSSxhQUFKO1FBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQVQ7UUFDQSxVQUFVLFNBQVMsS0FBSyxJQUFMO1FBQ25CLHFCQUhKLENBREk7O0FBTUosU0FBSSxhQUFK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UUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsVUFBVSxRQUFTLGFBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFdBQVUsUUFBUyxjQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxXQUFVLFFBQVMsY0FBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsTUFBVSxRQUFTLFNBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxNQUFVLFFBQVMsU0FBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxNQUFVLFFBQVMsU0FBVCxDQUFWO0FBQ0Es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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2FicycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmFicyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFicyggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hYnMoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhYnMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWJzLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGFic1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY2N1bScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keVxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB0aGlzLmluaXRpYWxWYWx1ZVxuXG4gICAgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAgKVxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgIFxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9yZXNldCwgdmFsdWVSZWYgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnXG4gICAgXG4gICAgLyogdGhyZWUgZGlmZmVyZW50IG1ldGhvZHMgb2Ygd3JhcHBpbmcsIHRoaXJkIGlzIG1vc3QgZXhwZW5zaXZlOlxuICAgICAqXG4gICAgICogMTogcmFuZ2UgezAsMX06IHkgPSB4IC0gKHggfCAwKVxuICAgICAqIDI6IGxvZzIodGhpcy5tYXgpID09IGludGVnZXI6IHkgPSB4ICYgKHRoaXMubWF4IC0gMSlcbiAgICAgKiAzOiBhbGwgb3RoZXJzOiBpZiggeCA+PSB0aGlzLm1heCApIHkgPSB0aGlzLm1heCAteFxuICAgICAqXG4gICAgICovXG5cbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzFdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1sxXSA8IDEpICkgeyBcbiAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLmluaXRpYWxWYWx1ZX1cXG5cXG5gIFxuICAgIH1cblxuICAgIG91dCArPSBgICB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2YWx1ZVJlZn07XFxuYFxuICAgIFxuICAgIGlmKCB0aGlzLnNob3VsZFdyYXAgPT09IGZhbHNlICYmIHRoaXMuc2hvdWxkQ2xhbXAgPT09IHRydWUgKSB7XG4gICAgICBvdXQgKz0gYCAgaWYoICR7dmFsdWVSZWZ9IDwgJHt0aGlzLm1heCB9ICkgJHt2YWx1ZVJlZn0gKz0gJHtfaW5jcn1cXG5gXG4gICAgfWVsc2V7XG4gICAgICBvdXQgKz0gYCAgJHt2YWx1ZVJlZn0gKz0gJHtfaW5jcn1cXG5gIC8vIHN0b3JlIG91dHB1dCB2YWx1ZSBiZWZvcmUgYWNjdW11bGF0aW5nICBcbiAgICB9XG5cbiAgICBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICAmJiB0aGlzLnNob3VsZFdyYXAgKSB3cmFwICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5gXG4gICAgaWYoIHRoaXMubWluICE9PSAtSW5maW5pdHkgJiYgdGhpcy5zaG91bGRXcmFwICkgd3JhcCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPCAke3RoaXMubWlufSApICR7dmFsdWVSZWZ9ICs9ICR7ZGlmZn1cXG5cXG5gXG5cbiAgICAvL2lmKCB0aGlzLm1pbiA9PT0gMCAmJiB0aGlzLm1heCA9PT0gMSApIHsgXG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAtICgke3ZhbHVlUmVmfSB8IDApXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1pbiA9PT0gMCAmJiAoIE1hdGgubG9nMiggdGhpcy5tYXggKSB8IDAgKSA9PT0gTWF0aC5sb2cyKCB0aGlzLm1heCApICkge1xuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gJiAoJHt0aGlzLm1heH0gLSAxKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICl7XG4gICAgLy8gIHdyYXAgPSBgICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gKSAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XFxuXFxuYFxuICAgIC8vfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyLCByZXNldD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgbWluOjAsIG1heDoxLCBzaG91bGRXcmFwOiB0cnVlLCBzaG91bGRDbGFtcDpmYWxzZSB9XG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIGlmKCBkZWZhdWx0cy5pbml0aWFsVmFsdWUgPT09IHVuZGVmaW5lZCApIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSA9IGRlZmF1bHRzLm1pblxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluOiBkZWZhdWx0cy5taW4sIFxuICAgIG1heDogZGVmYXVsdHMubWF4LFxuICAgIGluaXRpYWw6IGRlZmF1bHRzLmluaXRpYWxWYWx1ZSxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW5jciwgcmVzZXQgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgfVxuICB9LFxuICBkZWZhdWx0cyApXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkgeyByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSB9LFxuICAgIHNldCh2KSB7IGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IH1cbiAgfSlcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Fjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhY29zJzogTWF0aC5hY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWNvcyggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWNvcy5pbnB1dHMgPSBbIHggXVxuICBhY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFjb3MubmFtZSA9IGAke2Fjb3MuYmFzZW5hbWV9e2Fjb3MuaWR9YFxuXG4gIHJldHVybiBhY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIG11bCAgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGRpdiAgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIGRhdGEgICAgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrICAgICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgYWNjdW0gICAgPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBpZmVsc2UgICA9IHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICAgIGx0ICAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYmFuZyAgICAgPSByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICAgIGVudiAgICAgID0gcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIHBva2UgICAgID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICBuZXEgICAgICA9IHJlcXVpcmUoICcuL25lcS5qcycgKSxcbiAgICBhbmQgICAgICA9IHJlcXVpcmUoICcuL2FuZC5qcycgKSxcbiAgICBndGUgICAgICA9IHJlcXVpcmUoICcuL2d0ZS5qcycgKSxcbiAgICBtZW1vICAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGF0dGFja1RpbWUgPSA0NDEwMCwgZGVjYXlUaW1lID0gNDQxMDAsIF9wcm9wcyApID0+IHtcbiAgbGV0IF9iYW5nID0gYmFuZygpLFxuICAgICAgcGhhc2UgPSBhY2N1bSggMSwgX2JhbmcsIHsgbWF4OiBJbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSwgaW5pdGlhbFZhbHVlOi1JbmZpbml0eSB9KSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBzaGFwZTonZXhwb25lbnRpYWwnLCBhbHBoYTo1IH0sIF9wcm9wcyApLFxuICAgICAgYnVmZmVyRGF0YSwgZGVjYXlEYXRhLCBvdXQsIGJ1ZmZlclxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2F0dGFjayB0aW1lOicsIGF0dGFja1RpbWUsICdkZWNheSB0aW1lOicsIGRlY2F5VGltZSApXG4gIGxldCBjb21wbGV0ZUZsYWcgPSBkYXRhKCBbMF0gKVxuICBcbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIGlmKCBwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicgKSB7XG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApKSxcbiAgICAgIG1lbW8oIGRpdiggcGhhc2UsIGF0dGFja1RpbWUgKSApLFxuXG4gICAgICBhbmQoIGd0ZSggcGhhc2UsIDApLCAgbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSApICkgKSxcbiAgICAgIHN1YiggMSwgZGl2KCBzdWIoIHBoYXNlLCBhdHRhY2tUaW1lICksIGRlY2F5VGltZSApICksXG4gICAgICBcbiAgICAgIG5lcSggcGhhc2UsIC1JbmZpbml0eSksXG4gICAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAgIDAgXG4gICAgKVxuICB9IGVsc2UgeyAgICAgXG4gICAgYnVmZmVyRGF0YSA9IGVudiggMTAyNCwgeyB0eXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSB9KVxuICAgIG91dCA9IGlmZWxzZSggXG4gICAgICBhbmQoIGd0ZSggcGhhc2UsIDApLCBsdCggcGhhc2UsIGF0dGFja1RpbWUgKSksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAgIGFuZCggZ3RlKHBoYXNlLDApLCBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSApLCBcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGEsIHN1YiggMSwgZGl2KCBzdWIoIHBoYXNlLCBhdHRhY2tUaW1lICksIGRlY2F5VGltZSApICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSksXG5cbiAgICAgIG5lcSggcGhhc2UsIC1JbmZpbml0eSksXG4gICAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAgIDBcbiAgICApXG4gIH1cblxuICBvdXQuaXNDb21wbGV0ZSA9ICgpPT4gZ2VuLm1lbW9yeS5oZWFwWyBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHggXVxuXG4gIG91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgZ2VuLm1lbW9yeS5oZWFwWyBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHggXSA9IDBcbiAgICBfYmFuZy50cmlnZ2VyKClcbiAgfVxuXG4gIHJldHVybiBvdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHsgXG4gIGJhc2VuYW1lOidhZGQnLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PScnLFxuICAgICAgICBzdW0gPSAwLCBudW1Db3VudCA9IDAsIGFkZGVyQXRFbmQgPSBmYWxzZSwgYWxyZWFkeUZ1bGxTdW1tZWQgPSB0cnVlXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYFxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICBvdXQgKz0gdlxuICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgYWRkZXJBdEVuZCA9IHRydWVcbiAgICAgICAgICBvdXQgKz0gJyArICdcbiAgICAgICAgfVxuICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3VtICs9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICBudW1Db3VudCsrXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICBvdXQgKz0gYWRkZXJBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKyAnICsgc3VtXG4gICAgfVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgY29uc3QgYWRkID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBhZGQuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWRkLm5hbWUgPSBhZGQuYmFzZW5hbWUgKyBhZGQuaWRcbiAgYWRkLmlucHV0cyA9IGFyZ3NcblxuICByZXR1cm4gYWRkXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIG11bCAgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGRpdiAgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIGRhdGEgICAgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrICAgICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgYWNjdW0gICAgPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBpZmVsc2UgICA9IHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICAgIGx0ICAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYmFuZyAgICAgPSByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICAgIGVudiAgICAgID0gcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICAgIHBhcmFtICAgID0gcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gICAgYWRkICAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgZ3RwICAgICAgPSByZXF1aXJlKCAnLi9ndHAuanMnICksXG4gICAgbm90ICAgICAgPSByZXF1aXJlKCAnLi9ub3QuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGF0dGFja1RpbWU9NDQsIGRlY2F5VGltZT0yMjA1MCwgc3VzdGFpblRpbWU9NDQxMDAsIHN1c3RhaW5MZXZlbD0uNiwgcmVsZWFzZVRpbWU9NDQxMDAsIF9wcm9wcyApID0+IHtcbiAgbGV0IGVudlRyaWdnZXIgPSBiYW5nKCksXG4gICAgICBwaGFzZSA9IGFjY3VtKCAxLCBlbnZUcmlnZ2VyLCB7IG1heDogSW5maW5pdHksIHNob3VsZFdyYXA6ZmFsc2UgfSksXG4gICAgICBzaG91bGRTdXN0YWluID0gcGFyYW0oIDEgKSxcbiAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgc2hhcGU6ICdleHBvbmVudGlhbCcsXG4gICAgICAgICBhbHBoYTogNSxcbiAgICAgICAgIHRyaWdnZXJSZWxlYXNlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBfcHJvcHMgKSxcbiAgICAgIGJ1ZmZlckRhdGEsIGRlY2F5RGF0YSwgb3V0LCBidWZmZXIsIHN1c3RhaW5Db25kaXRpb24sIHJlbGVhc2VBY2N1bSwgcmVsZWFzZUNvbmRpdGlvblxuXG4gIC8vIHNsaWdodGx5IG1vcmUgZWZmaWNpZW50IHRvIHVzZSBleGlzdGluZyBwaGFzZSBhY2N1bXVsYXRvciBmb3IgbGluZWFyIGVudmVsb3Blc1xuICAvL2lmKCBwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicgKSB7XG4gIC8vICBvdXQgPSBpZmVsc2UoIFxuICAvLyAgICBsdCggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKSwgbWVtbyggZGl2KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSApICksXG4gIC8vICAgIGx0KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSArIHByb3BzLmRlY2F5VGltZSApLCBzdWIoIDEsIG11bCggZGl2KCBzdWIoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICksIHByb3BzLmRlY2F5VGltZSApLCAxLXByb3BzLnN1c3RhaW5MZXZlbCApICksXG4gIC8vICAgIGx0KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSArIHByb3BzLmRlY2F5VGltZSArIHByb3BzLnN1c3RhaW5UaW1lICksIFxuICAvLyAgICAgIHByb3BzLnN1c3RhaW5MZXZlbCxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICsgcHJvcHMuc3VzdGFpblRpbWUgKyBwcm9wcy5yZWxlYXNlVGltZSApLCBcbiAgLy8gICAgICBzdWIoIHByb3BzLnN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKyBwcm9wcy5zdXN0YWluVGltZSApLCBwcm9wcy5yZWxlYXNlVGltZSApLCBwcm9wcy5zdXN0YWluTGV2ZWwpICksXG4gIC8vICAgIDBcbiAgLy8gIClcbiAgLy99IGVsc2UgeyAgICAgXG4gICAgYnVmZmVyRGF0YSA9IGVudih7IGxlbmd0aDoxMDI0LCBhbHBoYTpwcm9wcy5hbHBoYSwgc2hpZnQ6MCwgdHlwZTpwcm9wcy5zaGFwZSB9KVxuXG4gICAgY29uc29sZS5sb2coIGJ1ZmZlckRhdGEgKVxuICAgIFxuICAgIHN1c3RhaW5Db25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZSBcbiAgICAgID8gc2hvdWxkU3VzdGFpblxuICAgICAgOiBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSApIClcblxuICAgIHJlbGVhc2VBY2N1bSA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgICA/IGd0cCggc3ViKCBzdXN0YWluTGV2ZWwsIGFjY3VtKCBkaXYoIHN1c3RhaW5MZXZlbCwgcmVsZWFzZVRpbWUgKSAsIDAsIHsgc2hvdWxkV3JhcDpmYWxzZSB9KSApLCAwIClcbiAgICAgIDogc3ViKCBzdXN0YWluTGV2ZWwsIG11bCggZGl2KCBzdWIoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUgKSApLCByZWxlYXNlVGltZSApLCBzdXN0YWluTGV2ZWwgKSApLCBcblxuICAgIHJlbGVhc2VDb25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZVxuICAgICAgPyBub3QoIHNob3VsZFN1c3RhaW4gKVxuICAgICAgOiBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSwgcmVsZWFzZVRpbWUgKSApXG5cbiAgICBvdXQgPSBpZmVsc2UoXG4gICAgICAvLyBhdHRhY2sgXG4gICAgICBsdCggcGhhc2UsICBhdHRhY2tUaW1lICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAgIC8vIGRlY2F5XG4gICAgICBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhLCBzdWIoIDEsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSApLCAgZGVjYXlUaW1lICksIHN1YiggMSwgIHN1c3RhaW5MZXZlbCApICkgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgICAgLy8gc3VzdGFpblxuICAgICAgc3VzdGFpbkNvbmRpdGlvbixcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGEsICBzdXN0YWluTGV2ZWwgKSxcblxuICAgICAgLy8gcmVsZWFzZVxuICAgICAgcmVsZWFzZUNvbmRpdGlvbiwgLy9sdCggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSArICByZWxlYXNlVGltZSApLFxuICAgICAgcGVlayggXG4gICAgICAgIGJ1ZmZlckRhdGEsXG4gICAgICAgIHJlbGVhc2VBY2N1bSwgXG4gICAgICAgIC8vc3ViKCAgc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lKSwgIHJlbGVhc2VUaW1lICksICBzdXN0YWluTGV2ZWwgKSApLCBcbiAgICAgICAgeyBib3VuZG1vZGU6J2NsYW1wJyB9XG4gICAgICApLFxuXG4gICAgICAwXG4gICAgKVxuICAvL31cbiAgIFxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAxXG4gICAgZW52VHJpZ2dlci50cmlnZ2VyKClcbiAgfVxuXG4gIG91dC5yZWxlYXNlID0gKCk9PiB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDBcbiAgICAvLyBYWFggcHJldHR5IG5hc3R5Li4uIGdyYWJzIGFjY3VtIGluc2lkZSBvZiBndHAgYW5kIHJlc2V0cyB2YWx1ZSBtYW51YWxseVxuICAgIC8vIHVuZm9ydHVuYXRlbHkgZW52VHJpZ2dlciB3b24ndCB3b3JrIGFzIGl0J3MgYmFjayB0byAwIGJ5IHRoZSB0aW1lIHRoZSByZWxlYXNlIGJsb2NrIGlzIHRyaWdnZXJlZC4uLlxuICAgIGdlbi5tZW1vcnkuaGVhcFsgcmVsZWFzZUFjY3VtLmlucHV0c1swXS5pbnB1dHNbMV0ubWVtb3J5LnZhbHVlLmlkeCBdID0gMFxuICB9XG5cbiAgcmV0dXJuIG91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FuZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9ICgke2lucHV0c1swXX0gIT09IDAgJiYgJHtpbnB1dHNbMV19ICE9PSAwKSB8IDBcXG5cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfWAsIG91dCBdXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgaW4yICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FzaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhc2luJzogTWF0aC5hc2luIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYXNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYXNpbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFzaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYXNpbi5pbnB1dHMgPSBbIHggXVxuICBhc2luLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFzaW4ubmFtZSA9IGAke2FzaW4uYmFzZW5hbWV9e2FzaW4uaWR9YFxuXG4gIHJldHVybiBhc2luXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2F0YW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhdGFuJzogTWF0aC5hdGFuIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYXRhbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYXRhbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGF0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYXRhbi5pbnB1dHMgPSBbIHggXVxuICBhdGFuLmlkID0gZ2VuLmdldFVJRCgpXG4gIGF0YW4ubmFtZSA9IGAke2F0YW4uYmFzZW5hbWV9e2F0YW4uaWR9YFxuXG4gIHJldHVybiBhdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkZWNheVRpbWUgPSA0NDEwMCApID0+IHtcbiAgbGV0IHNzZCA9IGhpc3RvcnkgKCAxICksXG4gICAgICB0NjAgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gZGVjYXlUaW1lIClcblxuICBzc2QuaW4oIG11bCggc3NkLm91dCwgdDYwICkgKVxuXG4gIHNzZC5vdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNzZC52YWx1ZSA9IDFcbiAgfVxuXG4gIHJldHVybiBzdWIoIDEsIHNzZC5vdXQgKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgZ2VuKCkge1xuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgbGV0IG91dCA9IFxuYCAgdmFyICR7dGhpcy5uYW1lfSA9IG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dXG4gIGlmKCAke3RoaXMubmFtZX0gPT09IDEgKSBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XSA9IDAgICAgICBcbiAgICAgIFxuYFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggX3Byb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOjAsIG1heDoxIH0sIF9wcm9wcyApXG5cbiAgdWdlbi5uYW1lID0gJ2JhbmcnICsgZ2VuLmdldFVJRCgpXG5cbiAgdWdlbi5taW4gPSBwcm9wcy5taW5cbiAgdWdlbi5tYXggPSBwcm9wcy5tYXhcblxuICB1Z2VuLnRyaWdnZXIgPSAoKSA9PiB7XG4gICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IHVnZW4ubWF4IFxuICB9XG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidib29sJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgJHtpbnB1dHNbMF19ID09PSAwID8gMCA6IDFgXG4gICAgXG4gICAgLy9nZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgLy9yZXR1cm4gWyBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YCwgJyAnICtvdXQgXVxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonY2VpbCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmNlaWwgfSlcblxuICAgICAgb3V0ID0gYGdlbi5jZWlsKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNlaWwoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjZWlsID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGNlaWwuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gY2VpbFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vcj0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiAgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjbGlwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0XG5cbiAgICBvdXQgPVxuXG5gIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cbiAgaWYoICR7dGhpcy5uYW1lfSA+ICR7aW5wdXRzWzJdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzJdfVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPCAke2lucHV0c1sxXX0gKSAke3RoaXMubmFtZX0gPSAke2lucHV0c1sxXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPS0xLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xLCBtaW4sIG1heCBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdjb3MnOiBNYXRoLmNvcyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmNvcyggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY29zKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgY29zID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGNvcy5pbnB1dHMgPSBbIHggXVxuICBjb3MuaWQgPSBnZW4uZ2V0VUlEKClcbiAgY29zLm5hbWUgPSBgJHtjb3MuYmFzZW5hbWV9e2Nvcy5pZH1gXG5cbiAgcmV0dXJuIGNvc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjb3VudGVyJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5XG4gICAgICAgXG4gICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgZnVuY3Rpb25Cb2R5ICA9IHRoaXMuY2FsbGJhY2soIGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdLCBpbnB1dHNbMl0sIGlucHV0c1szXSwgaW5wdXRzWzRdLCAgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCwgYG1lbW9yeVske3RoaXMubWVtb3J5LndyYXAuaWR4fV1gICApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG4gICBcbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMud3JhcC5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHRoaXMud3JhcC5nZW4oKVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgY2FsbGJhY2soIF9uYW1lLCBfaW5jciwgX21pbiwgX21heCwgX3Jlc2V0LCBsb29wcywgdmFsdWVSZWYsIHdyYXBSZWYgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnXG4gICAgLy8gbXVzdCBjaGVjayBmb3IgcmVzZXQgYmVmb3JlIHN0b3JpbmcgdmFsdWUgZm9yIG91dHB1dFxuICAgIGlmKCAhKHR5cGVvZiB0aGlzLmlucHV0c1szXSA9PT0gJ251bWJlcicgJiYgdGhpcy5pbnB1dHNbM10gPCAxKSApIHsgXG4gICAgICBvdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PSAxICkgJHt2YWx1ZVJlZn0gPSAke19taW59XFxuYFxuICAgIH1cblxuICAgIG91dCArPSBgICB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2YWx1ZVJlZn07XFxuICAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIFxuICAgIGlmKCB0eXBlb2YgdGhpcy5tYXggPT09ICdudW1iZXInICYmIHRoaXMubWF4ICE9PSBJbmZpbml0eSAmJiB0eXBlb2YgdGhpcy5taW4gIT09ICdudW1iZXInICkge1xuICAgICAgd3JhcCA9IFxuYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICYmICAke2xvb3BzfSA+IDApIHtcbiAgICAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2V7XG4gICAgJHt3cmFwUmVmfSA9IDBcbiAgfVxcbmBcbiAgICB9ZWxzZSBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHRoaXMubWluICE9PSBJbmZpbml0eSApIHtcbiAgICAgIHdyYXAgPSBcbmAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke19tYXh9ICYmICAke2xvb3BzfSA+IDApIHtcbiAgICAke3ZhbHVlUmVmfSAtPSAke19tYXh9IC0gJHtfbWlufVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNlIGlmKCAke3ZhbHVlUmVmfSA8ICR7X21pbn0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9ICs9ICR7X21heH0gLSAke19taW59XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2V7XG4gICAgJHt3cmFwUmVmfSA9IDBcbiAgfVxcbmBcbiAgICB9ZWxzZXtcbiAgICAgIG91dCArPSAnXFxuJ1xuICAgIH1cblxuICAgIG91dCA9IG91dCArIHdyYXBcblxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jcj0xLCBtaW49MCwgbWF4PUluZmluaXR5LCByZXNldD0wLCBsb29wcz0xLCAgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXRpYWxWYWx1ZTogMCwgc2hvdWxkV3JhcDp0cnVlIH1cblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluOiAgICBtaW4sIFxuICAgIG1heDogICAgbWF4LFxuICAgIHZhbHVlOiAgZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbmNyLCBtaW4sIG1heCwgcmVzZXQsIGxvb3BzIF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4OiBudWxsIH0sXG4gICAgICB3cmFwOiAgeyBsZW5ndGg6MSwgaWR4OiBudWxsIH0gXG4gICAgfSxcbiAgICB3cmFwIDoge1xuICAgICAgZ2VuKCkgeyBcbiAgICAgICAgaWYoIHVnZW4ubWVtb3J5LndyYXAuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSApXG4gICAgICAgIH1cbiAgICAgICAgZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbICR7dWdlbi5tZW1vcnkud3JhcC5pZHh9IF1gXG4gICAgICAgIHJldHVybiBgbWVtb3J5WyAke3VnZW4ubWVtb3J5LndyYXAuaWR4fSBdYCBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGRlZmF1bHRzIClcbiBcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IFxuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgXG4gIHVnZW4ud3JhcC5pbnB1dHMgPSBbIHVnZW4gXVxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuICB1Z2VuLndyYXAubmFtZSA9IHVnZW4ubmFtZSArICdfd3JhcCdcbiAgcmV0dXJuIHVnZW5cbn0gXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL3BoYXNvci5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHBoYXNvcj1yZXF1aXJlKCAnLi9waGFzb3IuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjeWNsZScsXG5cbiAgaW5pdFRhYmxlKCkgeyAgICBcbiAgICBsZXQgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApXG5cbiAgICBmb3IoIGxldCBpID0gMCwgbCA9IGJ1ZmZlci5sZW5ndGg7IGkgPCBsOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IE1hdGguc2luKCAoIGkgLyBsICkgKiAoIE1hdGguUEkgKiAyICkgKVxuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLmN5Y2xlID0gZGF0YSggYnVmZmVyLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0gKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT0xLCByZXNldD0wLCBfcHJvcHMgKSA9PiB7XG4gIGlmKCB0eXBlb2YgZ2VuLmdsb2JhbHMuY3ljbGUgPT09ICd1bmRlZmluZWQnICkgcHJvdG8uaW5pdFRhYmxlKCkgXG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46MCB9LCBfcHJvcHMgKVxuXG4gIGNvbnN0IHVnZW4gPSBwZWVrKCBnZW4uZ2xvYmFscy5jeWNsZSwgcGhhc29yKCBmcmVxdWVuY3ksIHJlc2V0LCBwcm9wcyApKVxuICB1Z2VuLm5hbWUgPSAnY3ljbGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gIHV0aWxpdGllcyA9IHJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKSxcbiAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICBwb2tlID0gcmVxdWlyZSgnLi9wb2tlLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGF0YScsXG4gIGdsb2JhbHM6IHt9LFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaWR4XG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgbGV0IHVnZW4gPSB0aGlzXG4gICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnksIHRoaXMuaW1tdXRhYmxlICkgXG4gICAgICBpZHggPSB0aGlzLm1lbW9yeS52YWx1ZXMuaWR4XG4gICAgICB0cnkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXAuc2V0KCB0aGlzLmJ1ZmZlciwgaWR4IClcbiAgICAgIH1jYXRjaCggZSApIHtcbiAgICAgICAgY29uc29sZS5sb2coIGUgKVxuICAgICAgICB0aHJvdyBFcnJvciggJ2Vycm9yIHdpdGggcmVxdWVzdC4gYXNraW5nIGZvciAnICsgdGhpcy5idWZmZXIubGVuZ3RoICsnLiBjdXJyZW50IGluZGV4OiAnICsgZ2VuLm1lbW9yeUluZGV4ICsgJyBvZiAnICsgZ2VuLm1lbW9yeS5oZWFwLmxlbmd0aCApXG4gICAgICB9XG4gICAgICAvL2dlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IHRoaXNcbiAgICAgIC8vcmV0dXJuICdnZW4ubWVtb3J5JyArIHRoaXMubmFtZSArICcuYnVmZmVyJ1xuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaWR4XG4gICAgfWVsc2V7XG4gICAgICBpZHggPSBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgICB9XG4gICAgcmV0dXJuIGlkeFxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggeCwgeT0xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiwgYnVmZmVyLCBzaG91bGRMb2FkID0gZmFsc2VcbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5nbG9iYWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF0gKSB7XG4gICAgICByZXR1cm4gZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF1cbiAgICB9XG4gIH1cblxuICBpZiggdHlwZW9mIHggPT09ICdudW1iZXInICkge1xuICAgIGlmKCB5ICE9PSAxICkge1xuICAgICAgYnVmZmVyID0gW11cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgeTsgaSsrICkge1xuICAgICAgICBidWZmZXJbIGkgXSA9IG5ldyBGbG9hdDMyQXJyYXkoIHggKVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgfVxuICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggeCApICkgeyAvLyEgKHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSApIHtcbiAgICBsZXQgc2l6ZSA9IHgubGVuZ3RoXG4gICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggc2l6ZSApXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSB4WyBpIF1cbiAgICB9XG4gIH1lbHNlIGlmKCB0eXBlb2YgeCA9PT0gJ3N0cmluZycgKSB7XG4gICAgYnVmZmVyID0geyBsZW5ndGg6IHkgPiAxID8geSA6IGdlbi5zYW1wbGVyYXRlICogNjAgfSAvLyBYWFggd2hhdD8/P1xuICAgIHNob3VsZExvYWQgPSB0cnVlXG4gIH1lbHNlIGlmKCB4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkge1xuICAgIGJ1ZmZlciA9IHhcbiAgfVxuICBcbiAgdWdlbiA9IHsgXG4gICAgYnVmZmVyLFxuICAgIG5hbWU6IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpLFxuICAgIGRpbTogIGJ1ZmZlci5sZW5ndGgsIC8vIFhYWCBob3cgZG8gd2UgZHluYW1pY2FsbHkgYWxsb2NhdGUgdGhpcz9cbiAgICBjaGFubmVscyA6IDEsXG4gICAgZ2VuOiAgcHJvdG8uZ2VuLFxuICAgIG9ubG9hZDogbnVsbCxcbiAgICB0aGVuKCBmbmMgKSB7XG4gICAgICB1Z2VuLm9ubG9hZCA9IGZuY1xuICAgICAgcmV0dXJuIHVnZW5cbiAgICB9LFxuICAgIGltbXV0YWJsZTogcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuaW1tdXRhYmxlID09PSB0cnVlID8gdHJ1ZSA6IGZhbHNlLFxuICAgIGxvYWQoIGZpbGVuYW1lICkge1xuICAgICAgbGV0IHByb21pc2UgPSB1dGlsaXRpZXMubG9hZFNhbXBsZSggZmlsZW5hbWUsIHVnZW4gKVxuICAgICAgcHJvbWlzZS50aGVuKCAoIF9idWZmZXIgKT0+IHsgXG4gICAgICAgIHVnZW4ubWVtb3J5LnZhbHVlcy5sZW5ndGggPSB1Z2VuLmRpbSA9IF9idWZmZXIubGVuZ3RoICAgICBcbiAgICAgICAgdWdlbi5vbmxvYWQoKSBcbiAgICAgIH0pXG4gICAgfSxcbiAgfVxuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlczogeyBsZW5ndGg6dWdlbi5kaW0sIGlkeDpudWxsIH1cbiAgfVxuXG4gIGdlbi5uYW1lID0gJ2RhdGEnICsgZ2VuLmdldFVJRCgpXG5cbiAgaWYoIHNob3VsZExvYWQgKSB1Z2VuLmxvYWQoIHggKVxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggcHJvcGVydGllcy5nbG9iYWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdID0gdWdlblxuICAgIH1cbiAgICBpZiggcHJvcGVydGllcy5tZXRhID09PSB0cnVlICkge1xuICAgICAgZm9yKCBsZXQgaSA9IDAsIGxlbmd0aCA9IHVnZW4uYnVmZmVyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sIGksIHtcbiAgICAgICAgICBnZXQgKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBlZWsoIHVnZW4sIGksIHsgbW9kZTonc2ltcGxlJywgaW50ZXJwOidub25lJyB9IClcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgIHJldHVybiBwb2tlKCB1Z2VuLCB2LCBpIClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgeDEgPSBoaXN0b3J5KCksXG4gICAgICB5MSA9IGhpc3RvcnkoKSxcbiAgICAgIGZpbHRlclxuXG4gIC8vSGlzdG9yeSB4MSwgeTE7IHkgPSBpbjEgLSB4MSArIHkxKjAuOTk5NzsgeDEgPSBpbjE7IHkxID0geTsgb3V0MSA9IHk7XG4gIGZpbHRlciA9IG1lbW8oIGFkZCggc3ViKCBpbjEsIHgxLm91dCApLCBtdWwoIHkxLm91dCwgLjk5OTcgKSApIClcbiAgeDEuaW4oIGluMSApXG4gIHkxLmluKCBmaWx0ZXIgKVxuXG4gIHJldHVybiBmaWx0ZXJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHQ2MCAgICAgPSByZXF1aXJlKCAnLi90NjAuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwLCBwcm9wcyApID0+IHtcbiAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCB7IGluaXRWYWx1ZToxIH0sIHByb3BzICksXG4gICAgICBzc2QgPSBoaXN0b3J5ICggcHJvcGVydGllcy5pbml0VmFsdWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAoIGRlY2F5VGltZSApICkgKVxuXG4gIHNzZC5vdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNzZC52YWx1ZSA9IDFcbiAgfVxuXG4gIHJldHVybiBzc2Qub3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICApLFxuICAgICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgICBwb2tlID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgICAgc3ViICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgICksXG4gICAgICB3cmFwID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgICAgIGFjY3VtPSByZXF1aXJlKCAnLi9hY2N1bS5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGVsYXknLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaW5wdXRzWzBdXG4gICAgXG4gICAgcmV0dXJuIGlucHV0c1swXVxuICB9LFxufVxuXG5jb25zdCBkZWZhdWx0cyA9IHsgc2l6ZTogNTEyLCBmZWVkYmFjazowLCBpbnRlcnA6J2xpbmVhcicgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCB0YXBzLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICB3cml0ZUlkeCwgcmVhZElkeCwgZGVsYXlkYXRhXG5cbiAgaWYoIEFycmF5LmlzQXJyYXkoIHRhcHMgKSA9PT0gZmFsc2UgKSB0YXBzID0gWyB0YXBzIF1cbiAgXG4gIGxldCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgaWYoIHByb3BzLnNpemUgPCBNYXRoLm1heCggLi4udGFwcyApICkgcHJvcHMuc2l6ZSA9IE1hdGgubWF4KCAuLi50YXBzIClcblxuICBkZWxheWRhdGEgPSBkYXRhKCBwcm9wcy5zaXplIClcbiAgXG4gIHVnZW4uaW5wdXRzID0gW11cblxuICB3cml0ZUlkeCA9IGFjY3VtKCAxLCAwLCB7IG1heDpwcm9wcy5zaXplIH0pIFxuICBcbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0YXBzLmxlbmd0aDsgaSsrICkge1xuICAgIHVnZW4uaW5wdXRzWyBpIF0gPSBwZWVrKCBkZWxheWRhdGEsIHdyYXAoIHN1Yiggd3JpdGVJZHgsIHRhcHNbaV0gKSwgMCwgcHJvcHMuc2l6ZSApLHsgbW9kZTonc2FtcGxlcycsIGludGVycDpwcm9wcy5pbnRlcnAgfSlcbiAgfVxuICBcbiAgdWdlbi5vdXRwdXRzID0gdWdlbi5pbnB1dHMgLy8gdWduLCBVZ2gsIFVHSCEgYnV0IGkgZ3Vlc3MgaXQgd29ya3MuXG5cbiAgcG9rZSggZGVsYXlkYXRhLCBpbjEsIHdyaXRlSWR4IClcblxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7Z2VuLmdldFVJRCgpfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IG4xID0gaGlzdG9yeSgpXG4gICAgXG4gIG4xLmluKCBpbjEgKVxuXG4gIGxldCB1Z2VuID0gc3ViKCBpbjEsIG4xLm91dCApXG4gIHVnZW4ubmFtZSA9ICdkZWx0YScrZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RpdicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9YCAgdmFyICR7dGhpcy5uYW1lfSA9IGAsXG4gICAgICAgIGRpZmYgPSAwLCBcbiAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTiggbGFzdE51bWJlciApLCBcbiAgICAgICAgZGl2QXRFbmQgPSBmYWxzZVxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpID09PSAwICkgcmV0dXJuXG5cbiAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICBpc0ZpbmFsSWR4ICAgPSBpID09PSBpbnB1dHMubGVuZ3RoIC0gMVxuXG4gICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgLyB2XG4gICAgICAgIG91dCArPSBsYXN0TnVtYmVyXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC8gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLyAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgY29uc3QgZGl2ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggZGl2LCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuICB9KVxuXG4gIGRpdi5uYW1lID0gZGl2LmJhc2VuYW1lICsgZGl2LmlkXG4gIFxuICByZXR1cm4gZGl2XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4nICksXG4gICAgd2luZG93cyA9IHJlcXVpcmUoICcuL3dpbmRvd3MnICksXG4gICAgZGF0YSAgICA9IHJlcXVpcmUoICcuL2RhdGEnICksXG4gICAgcGVlayAgICA9IHJlcXVpcmUoICcuL3BlZWsnICksXG4gICAgcGhhc29yICA9IHJlcXVpcmUoICcuL3BoYXNvcicgKSxcbiAgICBkZWZhdWx0cyA9IHtcbiAgICAgIHR5cGU6J3RyaWFuZ3VsYXInLCBsZW5ndGg6MTAyNCwgYWxwaGE6LjE1LCBzaGlmdDowIFxuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBwcm9wcyA9PiB7XG4gIGxldCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBwcm9wcyApXG4gIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBwcm9wZXJ0aWVzLmxlbmd0aCApXG5cbiAgbGV0IG5hbWUgPSBwcm9wZXJ0aWVzLnR5cGUgKyAnXycgKyBwcm9wZXJ0aWVzLmxlbmd0aCArICdfJyArIHByb3BlcnRpZXMuc2hpZnRcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gPT09ICd1bmRlZmluZWQnICkgeyBcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gd2luZG93c1sgcHJvcGVydGllcy50eXBlIF0oIHByb3BlcnRpZXMubGVuZ3RoLCBpLCBwcm9wZXJ0aWVzLmFscGhhLCBwcm9wZXJ0aWVzLnNoaWZ0IClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gPSBkYXRhKCBidWZmZXIgKVxuICB9XG5cbiAgbGV0IHVnZW4gPSBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gXG4gIHVnZW4ubmFtZSA9ICdlbnYnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2VxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSB0aGlzLmlucHV0c1swXSA9PT0gdGhpcy5pbnB1dHNbMV0gPyAxIDogYCAgdmFyICR7dGhpcy5uYW1lfSA9ICgke2lucHV0c1swXX0gPT09ICR7aW5wdXRzWzFdfSkgfCAwXFxuXFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1gLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2Zsb29yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgLy9nZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5mbG9vciB9KVxuXG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gfCAwIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdIHwgMFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGZsb29yID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGZsb29yLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGZsb29yXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2ZvbGQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9IHRoaXMuY3JlYXRlQ2FsbGJhY2soIGlucHV0c1swXSwgdGhpcy5taW4sIHRoaXMubWF4ICkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dCBdXG4gIH0sXG5cbiAgY3JlYXRlQ2FsbGJhY2soIHYsIGxvLCBoaSApIHtcbiAgICBsZXQgb3V0ID1cbmAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dn0sXG4gICAgICAke3RoaXMubmFtZX1fcmFuZ2UgPSAke2hpfSAtICR7bG99LFxuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gMFxuXG4gIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcysrXG4gIH0gZWxzZSBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlICs9ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA8ICR7bG99KXtcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9ICgoJHt0aGlzLm5hbWV9X3ZhbHVlIC0gJHtsb30pIC8gJHt0aGlzLm5hbWV9X3JhbmdlLSAxKSB8IDBcbiAgICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2UgKiAke3RoaXMubmFtZX1fbnVtV3JhcHNcbiAgICB9XG4gICAgJHt0aGlzLm5hbWV9X251bVdyYXBzLS1cbiAgfVxuICBpZigke3RoaXMubmFtZX1fbnVtV3JhcHMgJiAxKSAke3RoaXMubmFtZX1fdmFsdWUgPSAke2hpfSArICR7bG99IC0gJHt0aGlzLm5hbWV9X3ZhbHVlXG5gXG4gICAgcmV0dXJuICcgJyArIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidnYXRlJyxcbiAgY29udHJvbFN0cmluZzpudWxsLCAvLyBpbnNlcnQgaW50byBvdXRwdXQgY29kZWdlbiBmb3IgZGV0ZXJtaW5pbmcgaW5kZXhpbmdcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuICAgIFxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgbGV0IGxhc3RJbnB1dE1lbW9yeUlkeCA9ICdtZW1vcnlbICcgKyB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgJyBdJyxcbiAgICAgICAgb3V0cHV0TWVtb3J5U3RhcnRJZHggPSB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgMSxcbiAgICAgICAgaW5wdXRTaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIGNvbnRyb2xTaWduYWwgPSBpbnB1dHNbMV1cbiAgICBcbiAgICAvKiBcbiAgICAgKiB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgY29udHJvbCBpbnB1dHMgZXF1YWxzIG91ciBsYXN0IGlucHV0XG4gICAgICogaWYgc28sIHdlIHN0b3JlIHRoZSBzaWduYWwgaW5wdXQgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnRseVxuICAgICAqIHNlbGVjdGVkIGluZGV4LiBJZiBub3QsIHdlIHB1dCAwIGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBsYXN0IHNlbGVjdGVkIGluZGV4LFxuICAgICAqIGNoYW5nZSB0aGUgc2VsZWN0ZWQgaW5kZXgsIGFuZCB0aGVuIHN0b3JlIHRoZSBzaWduYWwgaW4gcHV0IGluIHRoZSBtZW1lcnkgYXNzb2ljYXRlZFxuICAgICAqIHdpdGggdGhlIG5ld2x5IHNlbGVjdGVkIGluZGV4XG4gICAgICovXG4gICAgXG4gICAgb3V0ID1cblxuYCBpZiggJHtjb250cm9sU2lnbmFsfSAhPT0gJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICkge1xuICAgIG1lbW9yeVsgJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICsgJHtvdXRwdXRNZW1vcnlTdGFydElkeH0gIF0gPSAwIFxuICAgICR7bGFzdElucHV0TWVtb3J5SWR4fSA9ICR7Y29udHJvbFNpZ25hbH1cbiAgfVxuICBtZW1vcnlbICR7b3V0cHV0TWVtb3J5U3RhcnRJZHh9ICsgJHtjb250cm9sU2lnbmFsfSBdID0gJHtpbnB1dFNpZ25hbH1cblxuYFxuICAgIHRoaXMuY29udHJvbFN0cmluZyA9IGlucHV0c1sxXVxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHRoaXMub3V0cHV0cy5mb3JFYWNoKCB2ID0+IHYuZ2VuKCkgKVxuXG4gICAgcmV0dXJuIFsgbnVsbCwgJyAnICsgb3V0IF1cbiAgfSxcblxuICBjaGlsZGdlbigpIHtcbiAgICBpZiggdGhpcy5wYXJlbnQuaW5pdGlhbGl6ZWQgPT09IGZhbHNlICkge1xuICAgICAgZ2VuLmdldElucHV0cyggdGhpcyApIC8vIHBhcmVudCBnYXRlIGlzIG9ubHkgaW5wdXQgb2YgYSBnYXRlIG91dHB1dCwgc2hvdWxkIG9ubHkgYmUgZ2VuJ2Qgb25jZS5cbiAgICB9XG5cbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuICBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggY29udHJvbCwgaW4xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY291bnQ6IDIgfVxuXG4gIGlmKCB0eXBlb2YgcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICBvdXRwdXRzOiBbXSxcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGNvbnRyb2wgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGxhc3RJbnB1dDogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgIH0sXG4gICAgaW5pdGlhbGl6ZWQ6ZmFsc2VcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke2dlbi5nZXRVSUQoKX1gXG5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB1Z2VuLmNvdW50OyBpKysgKSB7XG4gICAgdWdlbi5vdXRwdXRzLnB1c2goe1xuICAgICAgaW5kZXg6aSxcbiAgICAgIGdlbjogcHJvdG8uY2hpbGRnZW4sXG4gICAgICBwYXJlbnQ6dWdlbixcbiAgICAgIGlucHV0czogWyB1Z2VuIF0sXG4gICAgICBtZW1vcnk6IHtcbiAgICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplZDpmYWxzZSxcbiAgICAgIG5hbWU6IGAke3VnZW4ubmFtZX1fb3V0JHtnZW4uZ2V0VUlEKCl9YFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGdlbi5qc1xuICpcbiAqIGxvdy1sZXZlbCBjb2RlIGdlbmVyYXRpb24gZm9yIHVuaXQgZ2VuZXJhdG9yc1xuICpcbiAqL1xuXG5sZXQgTWVtb3J5SGVscGVyID0gcmVxdWlyZSggJ21lbW9yeS1oZWxwZXInIClcblxubGV0IGdlbiA9IHtcblxuICBhY2N1bTowLFxuICBnZXRVSUQoKSB7IHJldHVybiB0aGlzLmFjY3VtKysgfSxcbiAgZGVidWc6ZmFsc2UsXG4gIHNhbXBsZXJhdGU6IDQ0MTAwLCAvLyBjaGFuZ2Ugb24gYXVkaW9jb250ZXh0IGNyZWF0aW9uXG4gIHNob3VsZExvY2FsaXplOiBmYWxzZSxcbiAgZ2xvYmFsczp7XG4gICAgd2luZG93czoge30sXG4gIH0sXG4gIFxuICAvKiBjbG9zdXJlc1xuICAgKlxuICAgKiBGdW5jdGlvbnMgdGhhdCBhcmUgaW5jbHVkZWQgYXMgYXJndW1lbnRzIHRvIG1hc3RlciBjYWxsYmFjay4gRXhhbXBsZXM6IE1hdGguYWJzLCBNYXRoLnJhbmRvbSBldGMuXG4gICAqIFhYWCBTaG91bGQgcHJvYmFibHkgYmUgcmVuYW1lZCBjYWxsYmFja1Byb3BlcnRpZXMgb3Igc29tZXRoaW5nIHNpbWlsYXIuLi4gY2xvc3VyZXMgYXJlIG5vIGxvbmdlciB1c2VkLlxuICAgKi9cblxuICBjbG9zdXJlczogbmV3IFNldCgpLFxuICBwYXJhbXM6ICAgbmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6W10sXG4gIGVuZEJsb2NrOiBuZXcgU2V0KCksXG4gIGhpc3RvcmllczogbmV3IE1hcCgpLFxuXG4gIG1lbW86IHt9LFxuXG4gIGRhdGE6IHt9LFxuICBcbiAgLyogZXhwb3J0XG4gICAqXG4gICAqIHBsYWNlIGdlbiBmdW5jdGlvbnMgaW50byBhbm90aGVyIG9iamVjdCBmb3IgZWFzaWVyIHJlZmVyZW5jZVxuICAgKi9cblxuICBleHBvcnQoIG9iaiApIHt9LFxuXG4gIGFkZFRvRW5kQmxvY2soIHYgKSB7XG4gICAgdGhpcy5lbmRCbG9jay5hZGQoICcgICcgKyB2IClcbiAgfSxcbiAgXG4gIHJlcXVlc3RNZW1vcnkoIG1lbW9yeVNwZWMsIGltbXV0YWJsZT1mYWxzZSApIHtcbiAgICBmb3IoIGxldCBrZXkgaW4gbWVtb3J5U3BlYyApIHtcbiAgICAgIGxldCByZXF1ZXN0ID0gbWVtb3J5U3BlY1sga2V5IF1cblxuICAgICAgcmVxdWVzdC5pZHggPSBnZW4ubWVtb3J5LmFsbG9jKCByZXF1ZXN0Lmxlbmd0aCwgaW1tdXRhYmxlIClcbiAgICB9XG4gIH0sXG5cbiAgLyogY3JlYXRlQ2FsbGJhY2tcbiAgICpcbiAgICogcGFyYW0gdWdlbiAtIEhlYWQgb2YgZ3JhcGggdG8gYmUgY29kZWdlbidkXG4gICAqXG4gICAqIEdlbmVyYXRlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBhIHBhcnRpY3VsYXIgdWdlbiBncmFwaC5cbiAgICogVGhlIGdlbi5jbG9zdXJlcyBwcm9wZXJ0eSBzdG9yZXMgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZVxuICAgKiBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBmaW5hbCBmdW5jdGlvbjsgdGhlc2UgYXJlIHByZWZpeGVkXG4gICAqIGJlZm9yZSBhbnkgZGVmaW5lZCBwYXJhbXMgdGhlIGdyYXBoIGV4cG9zZXMuIEZvciBleGFtcGxlLCBnaXZlbjpcbiAgICpcbiAgICogZ2VuLmNyZWF0ZUNhbGxiYWNrKCBhYnMoIHBhcmFtKCkgKSApXG4gICAqXG4gICAqIC4uLiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHdpbGwgaGF2ZSBhIHNpZ25hdHVyZSBvZiAoIGFicywgcDAgKS5cbiAgICovXG4gIFxuICBjcmVhdGVDYWxsYmFjayggdWdlbiwgbWVtLCBkZWJ1ZyA9IGZhbHNlLCBzaG91bGRJbmxpbmVNZW1vcnk9ZmFsc2UgKSB7XG4gICAgbGV0IGlzU3RlcmVvID0gQXJyYXkuaXNBcnJheSggdWdlbiApICYmIHVnZW4ubGVuZ3RoID4gMSxcbiAgICAgICAgY2FsbGJhY2ssIFxuICAgICAgICBjaGFubmVsMSwgY2hhbm5lbDJcblxuICAgIGlmKCB0eXBlb2YgbWVtID09PSAnbnVtYmVyJyB8fCBtZW0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIG1lbSApXG4gICAgfVxuICAgIFxuICAgIC8vY29uc29sZS5sb2coICdjYiBtZW1vcnk6JywgbWVtIClcbiAgICB0aGlzLm1lbW9yeSA9IG1lbVxuICAgIHRoaXMubWVtbyA9IHt9IFxuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMucGFyYW1zLmNsZWFyKClcbiAgICAvL3RoaXMuZ2xvYmFscyA9IHsgd2luZG93czp7fSB9XG4gICAgXG4gICAgdGhpcy5wYXJhbWV0ZXJzLmxlbmd0aCA9IDBcbiAgICBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiICAndXNlIHN0cmljdCdcXG5cIlxuICAgIGlmKCBzaG91bGRJbmxpbmVNZW1vcnk9PT1mYWxzZSApIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IFwiICB2YXIgbWVtb3J5ID0gZ2VuLm1lbW9yeVxcblxcblwiIFxuXG4gICAgLy8gY2FsbCAuZ2VuKCkgb24gdGhlIGhlYWQgb2YgdGhlIGdyYXBoIHdlIGFyZSBnZW5lcmF0aW5nIHRoZSBjYWxsYmFjayBmb3JcbiAgICAvL2NvbnNvbGUubG9nKCAnSEVBRCcsIHVnZW4gKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMSArIGlzU3RlcmVvOyBpKysgKSB7XG4gICAgICBpZiggdHlwZW9mIHVnZW5baV0gPT09ICdudW1iZXInICkgY29udGludWVcblxuICAgICAgbGV0IGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHVnZW5baV0uZ2VuKCkgOiB1Z2VuLmdlbigpLFxuICAgICAgICAgIGJvZHkgPSAnJ1xuXG4gICAgICAvLyBpZiAuZ2VuKCkgcmV0dXJucyBhcnJheSwgYWRkIHVnZW4gY2FsbGJhY2sgKGdyYXBoT3V0cHV0WzFdKSB0byBvdXIgb3V0cHV0IGZ1bmN0aW9ucyBib2R5XG4gICAgICAvLyBhbmQgdGhlbiByZXR1cm4gbmFtZSBvZiB1Z2VuLiBJZiAuZ2VuKCkgb25seSBnZW5lcmF0ZXMgYSBudW1iZXIgKGZvciByZWFsbHkgc2ltcGxlIGdyYXBocylcbiAgICAgIC8vIGp1c3QgcmV0dXJuIHRoYXQgbnVtYmVyIChncmFwaE91dHB1dFswXSkuXG4gICAgICBib2R5ICs9IEFycmF5LmlzQXJyYXkoIGNoYW5uZWwgKSA/IGNoYW5uZWxbMV0gKyAnXFxuJyArIGNoYW5uZWxbMF0gOiBjaGFubmVsXG5cbiAgICAgIC8vIHNwbGl0IGJvZHkgdG8gaW5qZWN0IHJldHVybiBrZXl3b3JkIG9uIGxhc3QgbGluZVxuICAgICAgYm9keSA9IGJvZHkuc3BsaXQoJ1xcbicpXG4gICAgIFxuICAgICAgLy9pZiggZGVidWcgKSBjb25zb2xlLmxvZyggJ2Z1bmN0aW9uQm9keSBsZW5ndGgnLCBib2R5IClcbiAgICAgIFxuICAgICAgLy8gbmV4dCBsaW5lIGlzIHRvIGFjY29tbW9kYXRlIG1lbW8gYXMgZ3JhcGggaGVhZFxuICAgICAgaWYoIGJvZHlbIGJvZHkubGVuZ3RoIC0xIF0udHJpbSgpLmluZGV4T2YoJ2xldCcpID4gLTEgKSB7IGJvZHkucHVzaCggJ1xcbicgKSB9IFxuXG4gICAgICAvLyBnZXQgaW5kZXggb2YgbGFzdCBsaW5lXG4gICAgICBsZXQgbGFzdGlkeCA9IGJvZHkubGVuZ3RoIC0gMVxuXG4gICAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICAgIGJvZHlbIGxhc3RpZHggXSA9ICcgIGdlbi5vdXRbJyArIGkgKyAnXSAgPSAnICsgYm9keVsgbGFzdGlkeCBdICsgJ1xcbidcblxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gYm9keS5qb2luKCdcXG4nKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLmhpc3Rvcmllcy5mb3JFYWNoKCB2YWx1ZSA9PiB7XG4gICAgICBpZiggdmFsdWUgIT09IG51bGwgKVxuICAgICAgICB2YWx1ZS5nZW4oKSAgICAgIFxuICAgIH0pXG5cbiAgICBsZXQgcmV0dXJuU3RhdGVtZW50ID0gaXNTdGVyZW8gPyAnICByZXR1cm4gZ2VuLm91dCcgOiAnICByZXR1cm4gZ2VuLm91dFswXSdcbiAgICBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LnNwbGl0KCdcXG4nKVxuXG4gICAgaWYoIHRoaXMuZW5kQmxvY2suc2l6ZSApIHsgXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmNvbmNhdCggQXJyYXkuZnJvbSggdGhpcy5lbmRCbG9jayApIClcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2goIHJldHVyblN0YXRlbWVudCApXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCByZXR1cm5TdGF0ZW1lbnQgKVxuICAgIH1cbiAgICAvLyByZWFzc2VtYmxlIGZ1bmN0aW9uIGJvZHlcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmpvaW4oJ1xcbicpXG5cbiAgICAvLyB3ZSBjYW4gb25seSBkeW5hbWljYWxseSBjcmVhdGUgYSBuYW1lZCBmdW5jdGlvbiBieSBkeW5hbWljYWxseSBjcmVhdGluZyBhbm90aGVyIGZ1bmN0aW9uXG4gICAgLy8gdG8gY29uc3RydWN0IHRoZSBuYW1lZCBmdW5jdGlvbiEgc2hlZXNoLi4uXG4gICAgLy9cbiAgICBpZiggc2hvdWxkSW5saW5lTWVtb3J5ID09PSB0cnVlICkge1xuICAgICAgdGhpcy5wYXJhbWV0ZXJzLnB1c2goICdtZW1vcnknIClcbiAgICB9XG4gICAgbGV0IGJ1aWxkU3RyaW5nID0gYHJldHVybiBmdW5jdGlvbiBnZW4oICR7IHRoaXMucGFyYW1ldGVycy5qb2luKCcsJykgfSApeyBcXG4keyB0aGlzLmZ1bmN0aW9uQm9keSB9XFxufWBcbiAgICBcbiAgICBpZiggdGhpcy5kZWJ1ZyB8fCBkZWJ1ZyApIGNvbnNvbGUubG9nKCBidWlsZFN0cmluZyApIFxuXG4gICAgY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oIGJ1aWxkU3RyaW5nICkoKVxuXG4gICAgXG4gICAgLy8gYXNzaWduIHByb3BlcnRpZXMgdG8gbmFtZWQgZnVuY3Rpb25cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMuY2xvc3VyZXMudmFsdWVzKCkgKSB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdmFsdWUgPSBkaWN0WyBuYW1lIF1cblxuICAgICAgY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgZm9yKCBsZXQgZGljdCBvZiB0aGlzLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB1Z2VuID0gZGljdFsgbmFtZSBdXG4gICAgICBcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggY2FsbGJhY2ssIG5hbWUsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7IHJldHVybiB1Z2VuLnZhbHVlIH0sXG4gICAgICAgIHNldCh2KXsgdWdlbi52YWx1ZSA9IHYgfVxuICAgICAgfSlcbiAgICAgIC8vY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YVxuICAgIGNhbGxiYWNrLm91dCAgPSBuZXcgRmxvYXQzMkFycmF5KCAyIClcbiAgICBjYWxsYmFjay5wYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJzLnNsaWNlKCAwIClcblxuICAgIC8vaWYoIE1lbW9yeUhlbHBlci5pc1Byb3RvdHlwZU9mKCB0aGlzLm1lbW9yeSApICkgXG4gICAgY2FsbGJhY2subWVtb3J5ID0gdGhpcy5tZW1vcnkuaGVhcFxuXG4gICAgdGhpcy5oaXN0b3JpZXMuY2xlYXIoKVxuXG4gICAgcmV0dXJuIGNhbGxiYWNrXG4gIH0sXG4gIFxuICAvKiBnZXRJbnB1dHNcbiAgICpcbiAgICogR2l2ZW4gYW4gYXJndW1lbnQgdWdlbiwgZXh0cmFjdCBpdHMgaW5wdXRzLiBJZiB0aGV5IGFyZSBudW1iZXJzLCByZXR1cm4gdGhlIG51bWVicnMuIElmXG4gICAqIHRoZXkgYXJlIHVnZW5zLCBjYWxsIC5nZW4oKSBvbiB0aGUgdWdlbiwgbWVtb2l6ZSB0aGUgcmVzdWx0IGFuZCByZXR1cm4gdGhlIHJlc3VsdC4gSWYgdGhlXG4gICAqIHVnZW4gaGFzIHByZXZpb3VzbHkgYmVlbiBtZW1vaXplZCByZXR1cm4gdGhlIG1lbW9pemVkIHZhbHVlLlxuICAgKlxuICAgKi9cbiAgZ2V0SW5wdXRzKCB1Z2VuICkge1xuICAgIHJldHVybiB1Z2VuLmlucHV0cy5tYXAoIGdlbi5nZXRJbnB1dCApIFxuICB9LFxuXG4gIGdldElucHV0KCBpbnB1dCApIHtcbiAgICBsZXQgaXNPYmplY3QgPSB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnLFxuICAgICAgICBwcm9jZXNzZWRJbnB1dFxuXG4gICAgaWYoIGlzT2JqZWN0ICkgeyAvLyBpZiBpbnB1dCBpcyBhIHVnZW4uLi4gXG4gICAgICBpZiggZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApIHsgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBnZW4ubWVtb1sgaW5wdXQubmFtZSBdXG4gICAgICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaW5wdXQgKSApIHtcbiAgICAgICAgZ2VuLmdldElucHV0KCBpbnB1dFswXSApXG4gICAgICAgIGdlbi5nZXRJbnB1dCggaW5wdXRbMV0gKVxuICAgICAgfWVsc2V7IC8vIGlmIG5vdCBtZW1vaXplZCBnZW5lcmF0ZSBjb2RlICBcbiAgICAgICAgaWYoIHR5cGVvZiBpbnB1dC5nZW4gIT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coICdubyBnZW4gZm91bmQ6JywgaW5wdXQsIGlucHV0LmdlbiApXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvZGUgPSBpbnB1dC5nZW4oKVxuICAgICAgICAvL2lmKCBjb2RlLmluZGV4T2YoICdPYmplY3QnICkgPiAtMSApIGNvbnNvbGUubG9nKCAnYmFkIGlucHV0OicsIGlucHV0LCBjb2RlIClcbiAgICAgICAgXG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBjb2RlICkgKSB7XG4gICAgICAgICAgaWYoICFnZW4uc2hvdWxkTG9jYWxpemUgKSB7XG4gICAgICAgICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGdlbi5jb2RlTmFtZSA9IGNvZGVbMF1cbiAgICAgICAgICAgIGdlbi5sb2NhbGl6ZWRDb2RlLnB1c2goIGNvZGVbMV0gKVxuICAgICAgICAgIH1cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnYWZ0ZXIgR0VOJyAsIHRoaXMuZnVuY3Rpb25Cb2R5IClcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ZWxzZXsgLy8gaXQgaW5wdXQgaXMgYSBudW1iZXJcbiAgICAgIHByb2Nlc3NlZElucHV0ID0gaW5wdXRcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvY2Vzc2VkSW5wdXRcbiAgfSxcblxuICBzdGFydExvY2FsaXplKCkge1xuICAgIHRoaXMubG9jYWxpemVkQ29kZSA9IFtdXG4gICAgdGhpcy5zaG91bGRMb2NhbGl6ZSA9IHRydWVcbiAgfSxcbiAgZW5kTG9jYWxpemUoKSB7XG4gICAgdGhpcy5zaG91bGRMb2NhbGl6ZSA9IGZhbHNlXG5cbiAgICByZXR1cm4gWyB0aGlzLmNvZGVOYW1lLCB0aGlzLmxvY2FsaXplZENvZGUuc2xpY2UoMCkgXVxuICB9LFxuXG4gIGZyZWUoIGdyYXBoICkge1xuICAgIGlmKCBBcnJheS5pc0FycmF5KCBncmFwaCApICkgeyAvLyBzdGVyZW8gdWdlblxuICAgICAgZm9yKCBsZXQgY2hhbm5lbCBvZiBncmFwaCApIHtcbiAgICAgICAgdGhpcy5mcmVlKCBjaGFubmVsIClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBncmFwaCA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgIGlmKCBncmFwaC5tZW1vcnkgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICBmb3IoIGxldCBtZW1vcnlLZXkgaW4gZ3JhcGgubWVtb3J5ICkge1xuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZnJlZSggZ3JhcGgubWVtb3J5WyBtZW1vcnlLZXkgXS5pZHggKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggZ3JhcGguaW5wdXRzICkgKSB7XG4gICAgICAgICAgZm9yKCBsZXQgdWdlbiBvZiBncmFwaC5pbnB1dHMgKSB7XG4gICAgICAgICAgICB0aGlzLmZyZWUoIHVnZW4gKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdlblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0pIHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID4gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3QuaW5wdXRzID0gWyB4LHkgXVxuICBndC5uYW1lID0gJ2d0JytnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPj0gJHtpbnB1dHNbMV19IHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID49IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cbiAgZ3QubmFtZSA9ICdndGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCAoICR7aW5wdXRzWzBdfSA+ICR7aW5wdXRzWzFdfSApIHwgMCApIClgIFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoICggaW5wdXRzWzBdID4gaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3RwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGd0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xPTAgKSA9PiB7XG4gIGxldCB1Z2VuID0ge1xuICAgIGlucHV0czogWyBpbjEgXSxcbiAgICBtZW1vcnk6IHsgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IH0sXG4gICAgcmVjb3JkZXI6IG51bGwsXG5cbiAgICBpbiggdiApIHtcbiAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmhhcyggdiApICl7XG4gICAgICAgIGxldCBtZW1vSGlzdG9yeSA9IGdlbi5oaXN0b3JpZXMuZ2V0KCB2IClcbiAgICAgICAgdWdlbi5uYW1lID0gbWVtb0hpc3RvcnkubmFtZVxuICAgICAgICByZXR1cm4gbWVtb0hpc3RvcnlcbiAgICAgIH1cblxuICAgICAgbGV0IG9iaiA9IHtcbiAgICAgICAgZ2VuKCkge1xuICAgICAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB1Z2VuIClcblxuICAgICAgICAgIGlmKCB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IGluMVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHhcbiAgICAgICAgICBcbiAgICAgICAgICBnZW4uYWRkVG9FbmRCbG9jayggJ21lbW9yeVsgJyArIGlkeCArICcgXSA9ICcgKyBpbnB1dHNbIDAgXSApXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICBnZW4uaGlzdG9yaWVzLnNldCggdiwgb2JqIClcblxuICAgICAgICAgIHJldHVybiBpbnB1dHNbIDAgXVxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX2luJytnZW4uZ2V0VUlEKCksXG4gICAgICAgIG1lbW9yeTogdWdlbi5tZW1vcnlcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnB1dHNbIDAgXSA9IHZcbiAgICAgIFxuICAgICAgdWdlbi5yZWNvcmRlciA9IG9ialxuXG4gICAgICByZXR1cm4gb2JqXG4gICAgfSxcbiAgICBcbiAgICBvdXQ6IHtcbiAgICAgICAgICAgIFxuICAgICAgZ2VuKCkge1xuICAgICAgICBpZiggdWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmdldCggdWdlbi5pbnB1dHNbMF0gKSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4uaW5wdXRzWzBdLCB1Z2VuLnJlY29yZGVyIClcbiAgICAgICAgICB9XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gcGFyc2VGbG9hdCggaW4xIClcbiAgICAgICAgfVxuICAgICAgICBsZXQgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4XG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuICdtZW1vcnlbICcgKyBpZHggKyAnIF0gJ1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgdWlkOiBnZW4uZ2V0VUlEKCksXG4gIH1cbiAgXG4gIHVnZW4ub3V0Lm1lbW9yeSA9IHVnZW4ubWVtb3J5IFxuXG4gIHVnZW4ubmFtZSA9ICdoaXN0b3J5JyArIHVnZW4udWlkXG4gIHVnZW4ub3V0Lm5hbWUgPSB1Z2VuLm5hbWUgKyAnX291dCdcbiAgdWdlbi5pbi5fbmFtZSAgPSB1Z2VuLm5hbWUgPSAnX2luJ1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIi8qXG5cbiBhID0gY29uZGl0aW9uYWwoIGNvbmRpdGlvbiwgdHJ1ZUJsb2NrLCBmYWxzZUJsb2NrIClcbiBiID0gY29uZGl0aW9uYWwoW1xuICAgY29uZGl0aW9uMSwgYmxvY2sxLFxuICAgY29uZGl0aW9uMiwgYmxvY2syLFxuICAgY29uZGl0aW9uMywgYmxvY2szLFxuICAgZGVmYXVsdEJsb2NrXG4gXSlcblxuKi9cbid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2lmZWxzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb25kaXRpb25hbHMgPSB0aGlzLmlucHV0c1swXSxcbiAgICAgICAgZGVmYXVsdFZhbHVlID0gZ2VuLmdldElucHV0KCBjb25kaXRpb25hbHNbIGNvbmRpdGlvbmFscy5sZW5ndGggLSAxXSApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7ZGVmYXVsdFZhbHVlfVxcbmAgXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnZGVmYXVsdFZhbHVlOicsIGRlZmF1bHRWYWx1ZSApXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGNvbmRpdGlvbmFscy5sZW5ndGggLSAyOyBpKz0gMiApIHtcbiAgICAgIGxldCBpc0VuZEJsb2NrID0gaSA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCAtIDMsXG4gICAgICAgICAgY29uZCAgPSBnZW4uZ2V0SW5wdXQoIGNvbmRpdGlvbmFsc1sgaSBdICksXG4gICAgICAgICAgcHJlYmxvY2sgPSBjb25kaXRpb25hbHNbIGkrMSBdLFxuICAgICAgICAgIGJsb2NrLCBibG9ja05hbWUsIG91dHB1dFxuXG4gICAgICAvL2NvbnNvbGUubG9nKCAncGInLCBwcmVibG9jayApXG5cbiAgICAgIGlmKCB0eXBlb2YgcHJlYmxvY2sgPT09ICdudW1iZXInICl7XG4gICAgICAgIGJsb2NrID0gcHJlYmxvY2tcbiAgICAgICAgYmxvY2tOYW1lID0gbnVsbFxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBnZW4ubWVtb1sgcHJlYmxvY2submFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgLy8gdXNlZCB0byBwbGFjZSBhbGwgY29kZSBkZXBlbmRlbmNpZXMgaW4gYXBwcm9wcmlhdGUgYmxvY2tzXG4gICAgICAgICAgZ2VuLnN0YXJ0TG9jYWxpemUoKVxuXG4gICAgICAgICAgZ2VuLmdldElucHV0KCBwcmVibG9jayApXG5cbiAgICAgICAgICBibG9jayA9IGdlbi5lbmRMb2NhbGl6ZSgpXG4gICAgICAgICAgYmxvY2tOYW1lID0gYmxvY2tbMF1cbiAgICAgICAgICBibG9jayA9IGJsb2NrWyAxIF0uam9pbignJylcbiAgICAgICAgICBibG9jayA9ICcgICcgKyBibG9jay5yZXBsYWNlKCAvXFxuL2dpLCAnXFxuICAnIClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYmxvY2sgPSAnJ1xuICAgICAgICAgIGJsb2NrTmFtZSA9IGdlbi5tZW1vWyBwcmVibG9jay5uYW1lIF1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvdXRwdXQgPSBibG9ja05hbWUgPT09IG51bGwgPyBcbiAgICAgICAgYCAgJHt0aGlzLm5hbWV9X291dCA9ICR7YmxvY2t9YCA6XG4gICAgICAgIGAke2Jsb2NrfSAgJHt0aGlzLm5hbWV9X291dCA9ICR7YmxvY2tOYW1lfWBcbiAgICAgIFxuICAgICAgaWYoIGk9PT0wICkgb3V0ICs9ICcgJ1xuICAgICAgb3V0ICs9IFxuYCBpZiggJHtjb25kfSA9PT0gMSApIHtcbiR7b3V0cHV0fVxuICB9YFxuXG5pZiggIWlzRW5kQmxvY2sgKSB7XG4gIG91dCArPSBgIGVsc2VgXG59ZWxzZXtcbiAgb3V0ICs9IGBcXG5gXG59XG4vKiAgICAgICAgIFxuIGVsc2VgXG4gICAgICB9ZWxzZSBpZiggaXNFbmRCbG9jayApIHtcbiAgICAgICAgb3V0ICs9IGB7XFxuICAke291dHB1dH1cXG4gIH1cXG5gXG4gICAgICB9ZWxzZSB7XG5cbiAgICAgICAgLy9pZiggaSArIDIgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggfHwgaSA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgIC8vICBvdXQgKz0gYHtcXG4gICR7b3V0cHV0fVxcbiAgfVxcbmBcbiAgICAgICAgLy99ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gXG5gIGlmKCAke2NvbmR9ID09PSAxICkge1xuJHtvdXRwdXR9XG4gIH0gZWxzZSBgXG4gICAgICAgIC8vfVxuICAgICAgfSovXG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfV9vdXRgXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9X291dGAsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSggYXJnc1swXSApID8gYXJnc1swXSA6IGFyZ3NcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgY29uZGl0aW9ucyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2luJyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLnBhcmFtZXRlcnMucHVzaCggdGhpcy5uYW1lIClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiB0aGlzLm5hbWVcbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIG5hbWUgKSA9PiB7XG4gIGxldCBpbnB1dCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBpbnB1dC5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIGlucHV0Lm5hbWUgPSBuYW1lICE9PSB1bmRlZmluZWQgPyBuYW1lIDogYCR7aW5wdXQuYmFzZW5hbWV9JHtpbnB1dC5pZH1gXG4gIGlucHV0WzBdID0ge1xuICAgIGdlbigpIHtcbiAgICAgIGlmKCAhIGdlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5wdXNoKCBpbnB1dC5uYW1lIClcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1swXSdcbiAgICB9XG4gIH1cbiAgaW5wdXRbMV0gPSB7XG4gICAgZ2VuKCkge1xuICAgICAgaWYoICEgZ2VuLnBhcmFtZXRlcnMuaW5jbHVkZXMoIGlucHV0Lm5hbWUgKSApIGdlbi5wYXJhbWV0ZXJzLnB1c2goIGlucHV0Lm5hbWUgKVxuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzFdJ1xuICAgIH1cbiAgfVxuXG5cbiAgcmV0dXJuIGlucHV0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGxpYnJhcnkgPSB7XG4gIGV4cG9ydCggZGVzdGluYXRpb24gKSB7XG4gICAgaWYoIGRlc3RpbmF0aW9uID09PSB3aW5kb3cgKSB7XG4gICAgICBkZXN0aW5hdGlvbi5zc2QgPSBsaWJyYXJ5Lmhpc3RvcnkgICAgLy8gaGlzdG9yeSBpcyB3aW5kb3cgb2JqZWN0IHByb3BlcnR5LCBzbyB1c2Ugc3NkIGFzIGFsaWFzXG4gICAgICBkZXN0aW5hdGlvbi5pbnB1dCA9IGxpYnJhcnkuaW4gICAgICAgLy8gaW4gaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcbiAgICAgIGRlc3RpbmF0aW9uLnRlcm5hcnkgPSBsaWJyYXJ5LnN3aXRjaCAvLyBzd2l0Y2ggaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcblxuICAgICAgZGVsZXRlIGxpYnJhcnkuaGlzdG9yeVxuICAgICAgZGVsZXRlIGxpYnJhcnkuaW5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LnN3aXRjaFxuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oIGRlc3RpbmF0aW9uLCBsaWJyYXJ5IClcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggbGlicmFyeSwgJ3NhbXBsZXJhdGUnLCB7XG4gICAgICBnZXQoKSB7IHJldHVybiBsaWJyYXJ5Lmdlbi5zYW1wbGVyYXRlIH0sXG4gICAgICBzZXQodikge31cbiAgICB9KVxuXG4gICAgbGlicmFyeS5pbiA9IGRlc3RpbmF0aW9uLmlucHV0XG4gICAgbGlicmFyeS5oaXN0b3J5ID0gZGVzdGluYXRpb24uc3NkXG4gICAgbGlicmFyeS5zd2l0Y2ggPSBkZXN0aW5hdGlvbi50ZXJuYXJ5XG5cbiAgICBkZXN0aW5hdGlvbi5jbGlwID0gbGlicmFyeS5jbGFtcFxuICB9LFxuXG4gIGdlbjogICAgICByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gIFxuICBhYnM6ICAgICAgcmVxdWlyZSggJy4vYWJzLmpzJyApLFxuICByb3VuZDogICAgcmVxdWlyZSggJy4vcm91bmQuanMnICksXG4gIHBhcmFtOiAgICByZXF1aXJlKCAnLi9wYXJhbS5qcycgKSxcbiAgYWRkOiAgICAgIHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgc3ViOiAgICAgIHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgbXVsOiAgICAgIHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgZGl2OiAgICAgIHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgYWNjdW06ICAgIHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICBjb3VudGVyOiAgcmVxdWlyZSggJy4vY291bnRlci5qcycgKSxcbiAgc2luOiAgICAgIHJlcXVpcmUoICcuL3Npbi5qcycgKSxcbiAgY29zOiAgICAgIHJlcXVpcmUoICcuL2Nvcy5qcycgKSxcbiAgdGFuOiAgICAgIHJlcXVpcmUoICcuL3Rhbi5qcycgKSxcbiAgdGFuaDogICAgIHJlcXVpcmUoICcuL3RhbmguanMnICksXG4gIGFzaW46ICAgICByZXF1aXJlKCAnLi9hc2luLmpzJyApLFxuICBhY29zOiAgICAgcmVxdWlyZSggJy4vYWNvcy5qcycgKSxcbiAgYXRhbjogICAgIHJlcXVpcmUoICcuL2F0YW4uanMnICksICBcbiAgcGhhc29yOiAgIHJlcXVpcmUoICcuL3BoYXNvci5qcycgKSxcbiAgZGF0YTogICAgIHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gIHBlZWs6ICAgICByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICBjeWNsZTogICAgcmVxdWlyZSggJy4vY3ljbGUuanMnICksXG4gIGhpc3Rvcnk6ICByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICBkZWx0YTogICAgcmVxdWlyZSggJy4vZGVsdGEuanMnICksXG4gIGZsb29yOiAgICByZXF1aXJlKCAnLi9mbG9vci5qcycgKSxcbiAgY2VpbDogICAgIHJlcXVpcmUoICcuL2NlaWwuanMnICksXG4gIG1pbjogICAgICByZXF1aXJlKCAnLi9taW4uanMnICksXG4gIG1heDogICAgICByZXF1aXJlKCAnLi9tYXguanMnICksXG4gIHNpZ246ICAgICByZXF1aXJlKCAnLi9zaWduLmpzJyApLFxuICBkY2Jsb2NrOiAgcmVxdWlyZSggJy4vZGNibG9jay5qcycgKSxcbiAgbWVtbzogICAgIHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gIHJhdGU6ICAgICByZXF1aXJlKCAnLi9yYXRlLmpzJyApLFxuICB3cmFwOiAgICAgcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgbWl4OiAgICAgIHJlcXVpcmUoICcuL21peC5qcycgKSxcbiAgY2xhbXA6ICAgIHJlcXVpcmUoICcuL2NsYW1wLmpzJyApLFxuICBwb2tlOiAgICAgcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgZGVsYXk6ICAgIHJlcXVpcmUoICcuL2RlbGF5LmpzJyApLFxuICBmb2xkOiAgICAgcmVxdWlyZSggJy4vZm9sZC5qcycgKSxcbiAgbW9kIDogICAgIHJlcXVpcmUoICcuL21vZC5qcycgKSxcbiAgc2FoIDogICAgIHJlcXVpcmUoICcuL3NhaC5qcycgKSxcbiAgbm9pc2U6ICAgIHJlcXVpcmUoICcuL25vaXNlLmpzJyApLFxuICBub3Q6ICAgICAgcmVxdWlyZSggJy4vbm90LmpzJyApLFxuICBndDogICAgICAgcmVxdWlyZSggJy4vZ3QuanMnICksXG4gIGd0ZTogICAgICByZXF1aXJlKCAnLi9ndGUuanMnICksXG4gIGx0OiAgICAgICByZXF1aXJlKCAnLi9sdC5qcycgKSwgXG4gIGx0ZTogICAgICByZXF1aXJlKCAnLi9sdGUuanMnICksIFxuICBib29sOiAgICAgcmVxdWlyZSggJy4vYm9vbC5qcycgKSxcbiAgZ2F0ZTogICAgIHJlcXVpcmUoICcuL2dhdGUuanMnICksXG4gIHRyYWluOiAgICByZXF1aXJlKCAnLi90cmFpbi5qcycgKSxcbiAgc2xpZGU6ICAgIHJlcXVpcmUoICcuL3NsaWRlLmpzJyApLFxuICBpbjogICAgICAgcmVxdWlyZSggJy4vaW4uanMnICksXG4gIHQ2MDogICAgICByZXF1aXJlKCAnLi90NjAuanMnKSxcbiAgbXRvZjogICAgIHJlcXVpcmUoICcuL210b2YuanMnKSxcbiAgbHRwOiAgICAgIHJlcXVpcmUoICcuL2x0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBndHA6ICAgICAgcmVxdWlyZSggJy4vZ3RwLmpzJyksICAgICAgICAvLyBUT0RPOiB0ZXN0XG4gIHN3aXRjaDogICByZXF1aXJlKCAnLi9zd2l0Y2guanMnICksXG4gIG1zdG9zYW1wczpyZXF1aXJlKCAnLi9tc3Rvc2FtcHMuanMnICksIC8vIFRPRE86IG5lZWRzIHRlc3QsXG4gIHNlbGVjdG9yOiByZXF1aXJlKCAnLi9zZWxlY3Rvci5qcycgKSxcbiAgdXRpbGl0aWVzOnJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKSxcbiAgcG93OiAgICAgIHJlcXVpcmUoICcuL3Bvdy5qcycgKSxcbiAgYXR0YWNrOiAgIHJlcXVpcmUoICcuL2F0dGFjay5qcycgKSxcbiAgZGVjYXk6ICAgIHJlcXVpcmUoICcuL2RlY2F5LmpzJyApLFxuICB3aW5kb3dzOiAgcmVxdWlyZSggJy4vd2luZG93cy5qcycgKSxcbiAgZW52OiAgICAgIHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgYWQ6ICAgICAgIHJlcXVpcmUoICcuL2FkLmpzJyAgKSxcbiAgYWRzcjogICAgIHJlcXVpcmUoICcuL2Fkc3IuanMnICksXG4gIGlmZWxzZTogICByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgYmFuZzogICAgIHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gIGFuZDogICAgICByZXF1aXJlKCAnLi9hbmQuanMnICksXG4gIHBhbjogICAgICByZXF1aXJlKCAnLi9wYW4uanMnICksXG4gIGVxOiAgICAgICByZXF1aXJlKCAnLi9lcS5qcycgKSxcbiAgbmVxOiAgICAgIHJlcXVpcmUoICcuL25lcS5qcycgKVxufVxuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5XG5cbm1vZHVsZS5leHBvcnRzID0gbGlicmFyeVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2x0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCgoICR7aW5wdXRzWzBdfSA8ICR7aW5wdXRzWzFdfSkgfCAwICApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdIDwgaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0LmlucHV0cyA9IFsgeCx5IF1cbiAgbHQubmFtZSA9ICdsdCcgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPD0gJHtpbnB1dHNbMV19IHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gJ2x0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoKCAke2lucHV0c1swXX0gPCAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCggaW5wdXRzWzBdIDwgaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHRwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGx0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21heCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5tYXggfSlcblxuICAgICAgb3V0ID0gYGdlbi5tYXgoICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5tYXgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1heCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtYXguaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtYXhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtZW1vJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IChpbjEsbWVtb05hbWUpID0+IHtcbiAgbGV0IG1lbW8gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBtZW1vLmlucHV0cyA9IFsgaW4xIF1cbiAgbWVtby5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIG1lbW8ubmFtZSA9IG1lbW9OYW1lICE9PSB1bmRlZmluZWQgPyBtZW1vTmFtZSArICdfJyArIGdlbi5nZXRVSUQoKSA6IGAke21lbW8uYmFzZW5hbWV9JHttZW1vLmlkfWBcblxuICByZXR1cm4gbWVtb1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21pbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5taW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5taW4oICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5taW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1pbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtaW4uaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIsIHQ9LjUgKSA9PiB7XG4gIGxldCB1Z2VuID0gbWVtbyggYWRkKCBtdWwoaW4xLCBzdWIoMSx0ICkgKSwgbXVsKCBpbjIsIHQgKSApIClcbiAgdWdlbi5uYW1lID0gJ21peCcgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IG1vZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICAgIG1vZEF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgJSB2XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9ICUgJHt2fWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnICUgJyBcbiAgICAgIH0pXG5cbiAgICAgIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIG1vZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtc3Rvc2FtcHMnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHJldHVyblZhbHVlXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lIH0gPSAke2dlbi5zYW1wbGVyYXRlfSAvIDEwMDAgKiAke2lucHV0c1swXX0gXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBnZW4uc2FtcGxlcmF0ZSAvIDEwMDAgKiB0aGlzLmlucHV0c1swXVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH0gICAgXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbXN0b3NhbXBzID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1zdG9zYW1wcy5pbnB1dHMgPSBbIHggXVxuICBtc3Rvc2FtcHMubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG1zdG9zYW1wc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J210b2YnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCggJHt0aGlzLnR1bmluZ30gKiBnZW4uZXhwKCAuMDU3NzYyMjY1ICogKCR7aW5wdXRzWzBdfSAtIDY5KSApIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gdGhpcy50dW5pbmcgKiBNYXRoLmV4cCggLjA1Nzc2MjI2NSAqICggaW5wdXRzWzBdIC0gNjkpIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCBwcm9wcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IHR1bmluZzo0NDAgfVxuICBcbiAgaWYoIHByb3BzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBwcm9wcy5kZWZhdWx0cyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgZGVmYXVsdHMgKVxuICB1Z2VuLmlucHV0cyA9IFsgeCBdXG4gIFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdtdWwnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCxcbiAgICAgICAgc3VtID0gMSwgbnVtQ291bnQgPSAwLCBtdWxBdEVuZCA9IGZhbHNlLCBhbHJlYWR5RnVsbFN1bW1lZCA9IHRydWVcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgIG11bEF0RW5kID0gdHJ1ZVxuICAgICAgICAgIG91dCArPSAnICogJ1xuICAgICAgICB9XG4gICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gZmFsc2VcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggaSA9PT0gMCApIHtcbiAgICAgICAgICBzdW0gPSB2XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN1bSAqPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgfVxuICAgICAgICBudW1Db3VudCsrXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICBvdXQgKz0gbXVsQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICogJyArIHN1bVxuICAgIH1cblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGNvbnN0IG11bCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIG11bCwge1xuICAgICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6IGFyZ3MsXG4gIH0pXG4gIFxuICBtdWwubmFtZSA9IG11bC5iYXNlbmFtZSArIG11bC5pZFxuXG4gIHJldHVybiBtdWxcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J25lcScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gLyp0aGlzLmlucHV0c1swXSAhPT0gdGhpcy5pbnB1dHNbMV0gPyAxIDoqLyBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gJHtpbnB1dHNbMV19KSB8IDBcXG5cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidub2lzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXRcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnbm9pc2UnIDogTWF0aC5yYW5kb20gfSlcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBnZW4ubm9pc2UoKVxcbmBcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm9pc2UgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIG5vaXNlLm5hbWUgPSBwcm90by5uYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG5vaXNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbm90JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gPT09IDAgPyAxIDogMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSAhaW5wdXRzWzBdID09PSAwID8gMSA6IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbm90LmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIG5vdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwYW4nLCBcbiAgaW5pdFRhYmxlKCkgeyAgICBcbiAgICBsZXQgYnVmZmVyTCA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKSxcbiAgICAgICAgYnVmZmVyUiA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgbGV0IHNxcnRUd29PdmVyVHdvID0gTWF0aC5zcXJ0KDIpIC8gMlxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxMDI0OyBpKysgKSB7IFxuICAgICAgbGV0IHBhbiA9IC0xICsgKCBpIC8gMTAyNCApICogMlxuICAgICAgYnVmZmVyTFtpXSA9ICggc3FydFR3b092ZXJUd28gKiAoIE1hdGguY29zKHBhbikgLSBNYXRoLnNpbihwYW4pICkgKVxuICAgICAgYnVmZmVyUltpXSA9ICggc3FydFR3b092ZXJUd28gKiAoIE1hdGguY29zKHBhbikgKyBNYXRoLnNpbihwYW4pICkgKVxuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLnBhbkwgPSBkYXRhKCBidWZmZXJMLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0pXG4gICAgZ2VuLmdsb2JhbHMucGFuUiA9IGRhdGEoIGJ1ZmZlclIsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSlcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBsZWZ0SW5wdXQsIHJpZ2h0SW5wdXQsIHBhbiA9LjUsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGlmKCBnZW4uZ2xvYmFscy5wYW5MID09PSB1bmRlZmluZWQgKSBwcm90by5pbml0VGFibGUoKVxuXG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBsZWZ0SW5wdXQsIHJpZ2h0SW5wdXQgXSxcbiAgICBsZWZ0OiAgICBtdWwoIGxlZnRJbnB1dCwgcGVlayggZ2VuLmdsb2JhbHMucGFuTCwgcGFuLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pICksXG4gICAgcmlnaHQ6ICAgbXVsKCByaWdodElucHV0LCBwZWVrKCBnZW4uZ2xvYmFscy5wYW5SLCBwYW4sIHsgYm91bmRtb2RlOidjbGFtcCcgfSkgKVxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdwYXJhbScsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgZ2VuLnBhcmFtcy5hZGQoeyBbdGhpcy5uYW1lXTogdGhpcyB9KVxuXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gXG5cbiAgICByZXR1cm4gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBwcm9wTmFtZT0wLCB2YWx1ZT0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIGlmKCB0eXBlb2YgcHJvcE5hbWUgIT09ICdzdHJpbmcnICkge1xuICAgIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcbiAgICB1Z2VuLmluaXRpYWxWYWx1ZSA9IHByb3BOYW1lXG4gIH1lbHNle1xuICAgIHVnZW4ubmFtZSA9IHByb3BOYW1lXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSB2YWx1ZVxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGVlaycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCwgZnVuY3Rpb25Cb2R5LCBuZXh0LCBsZW5ndGhJc0xvZzIsIGlkeFxuICAgIFxuICAgIGlkeCA9IGlucHV0c1sxXVxuICAgIGxlbmd0aElzTG9nMiA9IChNYXRoLmxvZzIoIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoICkgfCAwKSAgPT09IE1hdGgubG9nMiggdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKVxuXG4gICAgaWYoIHRoaXMubW9kZSAhPT0gJ3NpbXBsZScgKSB7XG5cbiAgICBmdW5jdGlvbkJvZHkgPSBgICB2YXIgJHt0aGlzLm5hbWV9X2RhdGFJZHggID0gJHtpZHh9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9waGFzZSA9ICR7dGhpcy5tb2RlID09PSAnc2FtcGxlcycgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDEpIH0sIFxuICAgICAgJHt0aGlzLm5hbWV9X2luZGV4ID0gJHt0aGlzLm5hbWV9X3BoYXNlIHwgMCxcXG5gXG5cbiAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICd3cmFwJyApIHtcbiAgICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgP1xuICAgICAgYCggJHt0aGlzLm5hbWV9X2luZGV4ICsgMSApICYgKCR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IC0gMSlgIDpcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9ID8gJHt0aGlzLm5hbWV9X2luZGV4ICsgMSAtICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZSBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdjbGFtcCcgKSB7XG4gICAgICBuZXh0ID0gXG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gPyAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH1lbHNle1xuICAgICAgIG5leHQgPSBcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxYCAgICAgXG4gICAgfVxuXG4gICAgaWYoIHRoaXMuaW50ZXJwID09PSAnbGluZWFyJyApIHsgICAgICBcbiAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9mcmFjICA9ICR7dGhpcy5uYW1lfV9waGFzZSAtICR7dGhpcy5uYW1lfV9pbmRleCxcbiAgICAgICR7dGhpcy5uYW1lfV9iYXNlICA9IG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAgJHt0aGlzLm5hbWV9X2luZGV4IF0sXG4gICAgICAke3RoaXMubmFtZX1fbmV4dCAgPSAke25leHR9LGBcbiAgICAgIFxuICAgICAgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnaWdub3JlJyApIHtcbiAgICAgICAgZnVuY3Rpb25Cb2R5ICs9IGBcbiAgICAgICR7dGhpcy5uYW1lfV9vdXQgICA9ICR7dGhpcy5uYW1lfV9pbmRleCA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gfHwgJHt0aGlzLm5hbWV9X2luZGV4IDwgMCA/IDAgOiAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X25leHQgXSAtICR7dGhpcy5uYW1lfV9iYXNlIClcXG5cXG5gXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZnVuY3Rpb25Cb2R5ICs9IGBcbiAgICAgICR7dGhpcy5uYW1lfV9vdXQgICA9ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoIG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1fbmV4dCBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKVxcblxcbmBcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGZ1bmN0aW9uQm9keSArPSBgICAgICAgJHt0aGlzLm5hbWV9X291dCA9IG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1faW5kZXggXVxcblxcbmBcbiAgICB9XG5cbiAgICB9IGVsc2UgeyAvLyBtb2RlIGlzIHNpbXBsZVxuICAgICAgZnVuY3Rpb25Cb2R5ID0gYG1lbW9yeVsgJHtpZHh9ICsgJHsgaW5wdXRzWzBdIH0gXWBcbiAgICAgIFxuICAgICAgcmV0dXJuIGZ1bmN0aW9uQm9keVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfb3V0J1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lKydfb3V0JywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGRhdGEsIGluZGV4LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6MSwgbW9kZToncGhhc2UnLCBpbnRlcnA6J2xpbmVhcicsIGJvdW5kbW9kZTond3JhcCcgfSBcbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBkYXRhLFxuICAgIGRhdGFOYW1lOiAgIGRhdGEubmFtZSxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbmRleCwgZGF0YSBdLFxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHByb3RvID0geyBiYXNlbmFtZToncGhhc29yJyB9XG5cbmNvbnN0IGRlZmF1bHRzID0geyBtaW46IC0xLCBtYXg6IDEgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAsIF9wcm9wcyApID0+IHtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgZGVmYXVsdHMsIF9wcm9wcyApXG5cbiAgbGV0IHJhbmdlID0gcHJvcHMubWF4IC0gcHJvcHMubWluXG5cbiAgbGV0IHVnZW4gPSB0eXBlb2YgZnJlcXVlbmN5ID09PSAnbnVtYmVyJyA/IGFjY3VtKCAoZnJlcXVlbmN5ICogcmFuZ2UpIC8gZ2VuLnNhbXBsZXJhdGUsIHJlc2V0LCBwcm9wcyApIDogIGFjY3VtKCBtdWwoIGZyZXF1ZW5jeSwgMS9nZW4uc2FtcGxlcmF0ZS8oMS9yYW5nZSkgKSwgcmVzZXQsIHByb3BzIClcblxuICB1Z2VuLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIG11bCAgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHdyYXAgPSByZXF1aXJlKCcuL3dyYXAuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwb2tlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGRhdGFOYW1lID0gJ21lbW9yeScsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgaWR4LCBvdXQsIHdyYXBwZWRcbiAgICBcbiAgICBpZHggPSB0aGlzLmRhdGEuZ2VuKClcblxuICAgIC8vZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICAvL3dyYXBwZWQgPSB3cmFwKCB0aGlzLmlucHV0c1sxXSwgMCwgdGhpcy5kYXRhTGVuZ3RoICkuZ2VuKClcbiAgICAvL2lkeCA9IHdyYXBwZWRbMF1cbiAgICAvL2dlbi5mdW5jdGlvbkJvZHkgKz0gd3JhcHBlZFsxXVxuICAgIGxldCBvdXRwdXRTdHIgPSB0aGlzLmlucHV0c1sxXSA9PT0gMCA/XG4gICAgICBgICAke2RhdGFOYW1lfVsgJHtpZHh9IF0gPSAke2lucHV0c1swXX1cXG5gIDpcbiAgICAgIGAgICR7ZGF0YU5hbWV9WyAke2lkeH0gKyAke2lucHV0c1sxXX0gXSA9ICR7aW5wdXRzWzBdfVxcbmBcblxuICAgIGlmKCB0aGlzLmlubGluZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLmZ1bmN0aW9uQm9keSArPSBvdXRwdXRTdHJcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBbIHRoaXMuaW5saW5lLCBvdXRwdXRTdHIgXVxuICAgIH1cbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSAoIGRhdGEsIHZhbHVlLCBpbmRleCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGNoYW5uZWxzOjEgfSBcblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgZGF0YSxcbiAgICBkYXRhTmFtZTogICBkYXRhLm5hbWUsXG4gICAgZGF0YUxlbmd0aDogZGF0YS5idWZmZXIubGVuZ3RoLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIHZhbHVlLCBpbmRleCBdLFxuICB9LFxuICBkZWZhdWx0cyApXG5cblxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcbiAgXG4gIGdlbi5oaXN0b3JpZXMuc2V0KCB1Z2VuLm5hbWUsIHVnZW4gKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BvdycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdwb3cnOiBNYXRoLnBvdyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnBvdyggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMF0gPT09ICdzdHJpbmcnICYmIGlucHV0c1swXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMF0gPSBpbnB1dHNbMF0uc2xpY2UoMSwtMSlcbiAgICAgIH1cbiAgICAgIGlmKCB0eXBlb2YgaW5wdXRzWzFdID09PSAnc3RyaW5nJyAmJiBpbnB1dHNbMV1bMF0gPT09ICcoJyApIHtcbiAgICAgICAgaW5wdXRzWzFdID0gaW5wdXRzWzFdLnNsaWNlKDEsLTEpXG4gICAgICB9XG5cbiAgICAgIG91dCA9IE1hdGgucG93KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IHBvdyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBwb3cuaW5wdXRzID0gWyB4LHkgXVxuICBwb3cuaWQgPSBnZW4uZ2V0VUlEKClcbiAgcG93Lm5hbWUgPSBgJHtwb3cuYmFzZW5hbWV9e3Bvdy5pZH1gXG5cbiAgcmV0dXJuIHBvd1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGRlbHRhICAgPSByZXF1aXJlKCAnLi9kZWx0YS5qcycgKSxcbiAgICB3cmFwICAgID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidyYXRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcGhhc2UgID0gaGlzdG9yeSgpLFxuICAgICAgICBpbk1pbnVzMSA9IGhpc3RvcnkoKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZmlsdGVyLCBzdW0sIG91dFxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9kaWZmID0gJHtpbnB1dHNbMF19IC0gJHtnZW5OYW1lfS5sYXN0U2FtcGxlXG4gIGlmKCAke3RoaXMubmFtZX1fZGlmZiA8IC0uNSApICR7dGhpcy5uYW1lfV9kaWZmICs9IDFcbiAgJHtnZW5OYW1lfS5waGFzZSArPSAke3RoaXMubmFtZX1fZGlmZiAqICR7aW5wdXRzWzFdfVxuICBpZiggJHtnZW5OYW1lfS5waGFzZSA+IDEgKSAke2dlbk5hbWV9LnBoYXNlIC09IDFcbiAgJHtnZW5OYW1lfS5sYXN0U2FtcGxlID0gJHtpbnB1dHNbMF19XG5gXG4gICAgb3V0ID0gJyAnICsgb3V0XG5cbiAgICByZXR1cm4gWyBnZW5OYW1lICsgJy5waGFzZScsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgcmF0ZSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBwaGFzZTogICAgICAwLFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCByYXRlIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZToncm91bmQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5yb3VuZCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnJvdW5kKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnJvdW5kKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgcm91bmQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcm91bmQuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gcm91bmRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzYWgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIGdlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IDBcbiAgICBnZW4uZGF0YVsgdGhpcy5uYW1lICsgJ19jb250cm9sJyBdID0gMFxuXG4gICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX0gPSBnZW4uZGF0YS4ke3RoaXMubmFtZX1fY29udHJvbCxcbiAgICAgICR7dGhpcy5uYW1lfV90cmlnZ2VyID0gJHtpbnB1dHNbMV19ID4gJHtpbnB1dHNbMl19ID8gMSA6IDBcblxuICBpZiggJHt0aGlzLm5hbWV9X3RyaWdnZXIgIT09ICR7dGhpcy5uYW1lfSAgKSB7XG4gICAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyID09PSAxICkgXG4gICAgICBnZW4uZGF0YS4ke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cbiAgICBnZW4uZGF0YS4ke3RoaXMubmFtZX1fY29udHJvbCA9ICR7dGhpcy5uYW1lfV90cmlnZ2VyXG4gIH1cbmBcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgcmV0dXJuIFsgYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWAsICcgJyArb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBjb250cm9sLCB0aHJlc2hvbGQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXQ6MCB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCBjb250cm9sLHRocmVzaG9sZCBdLFxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzZWxlY3RvcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dCwgcmV0dXJuVmFsdWUgPSAwXG4gICAgXG4gICAgc3dpdGNoKCBpbnB1dHMubGVuZ3RoICkge1xuICAgICAgY2FzZSAyIDpcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBpbnB1dHNbMV1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDMgOlxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcblxcbmA7XG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsIG91dCBdXG4gICAgICAgIGJyZWFrOyAgXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAwXG4gIHN3aXRjaCggJHtpbnB1dHNbMF19ICsgMSApIHtcXG5gXG5cbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICBvdXQgKz1gICAgIGNhc2UgJHtpfTogJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzW2ldfTsgYnJlYWs7XFxuYCBcbiAgICAgICAgfVxuXG4gICAgICAgIG91dCArPSAnICB9XFxuXFxuJ1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSArICdfb3V0JywgJyAnICsgb3V0IF1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uaW5wdXRzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonc2lnbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLnNpZ24gfSlcblxuICAgICAgb3V0ID0gYGdlbi5zaWduKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpZ24oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBzaWduID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpZ24uaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gc2lnblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBNYXRoLnNpbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpbi5pbnB1dHMgPSBbIHggXVxuICBzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgc2luLm5hbWUgPSBgJHtzaW4uYmFzZW5hbWV9e3Npbi5pZH1gXG5cbiAgcmV0dXJuIHNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGd0ICAgICAgPSByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgICBkaXYgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIF9zd2l0Y2ggPSByZXF1aXJlKCAnLi9zd2l0Y2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgc2xpZGVVcCA9IDEsIHNsaWRlRG93biA9IDEgKSA9PiB7XG4gIGxldCB5MSA9IGhpc3RvcnkoMCksXG4gICAgICBmaWx0ZXIsIHNsaWRlQW1vdW50XG5cbiAgLy95IChuKSA9IHkgKG4tMSkgKyAoKHggKG4pIC0geSAobi0xKSkvc2xpZGUpIFxuICBzbGlkZUFtb3VudCA9IF9zd2l0Y2goIGd0KGluMSx5MS5vdXQpLCBzbGlkZVVwLCBzbGlkZURvd24gKVxuXG4gIGZpbHRlciA9IG1lbW8oIGFkZCggeTEub3V0LCBkaXYoIHN1YiggaW4xLCB5MS5vdXQgKSwgc2xpZGVBbW91bnQgKSApIClcblxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N1YicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9MCxcbiAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBzdWJBdEVuZCA9IGZhbHNlLFxuICAgICAgICBoYXNVZ2VucyA9IGZhbHNlLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IDBcblxuICAgIHRoaXMuaW5wdXRzLmZvckVhY2goIHZhbHVlID0+IHsgaWYoIGlzTmFOKCB2YWx1ZSApICkgaGFzVWdlbnMgPSB0cnVlIH0pXG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC0gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICByZXR1cm5cbiAgICAgIH1lbHNle1xuICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC0gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGxldCBzdWIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggc3ViLCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzXG4gIH0pXG4gICAgICAgXG4gIHN1Yi5uYW1lID0gJ3N1YicgKyBzdWIuaWRcblxuICByZXR1cm4gc3ViXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzd2l0Y2gnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIGlmKCBpbnB1dHNbMV0gPT09IGlucHV0c1syXSApIHJldHVybiBpbnB1dHNbMV0gLy8gaWYgYm90aCBwb3RlbnRpYWwgb3V0cHV0cyBhcmUgdGhlIHNhbWUganVzdCByZXR1cm4gb25lIG9mIHRoZW1cbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEgPSAxLCBpbjIgPSAwICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbnRyb2wsIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Q2MCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyAnZXhwJyBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gZ2VuLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gJHtpbnB1dHNbMF19IClcXG5cXG5gXG4gICAgIFxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gb3V0XG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguZXhwKCAtNi45MDc3NTUyNzg5MjEgLyBpbnB1dHNbMF0gKVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH0gICAgXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdDYwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHQ2MC5pbnB1dHMgPSBbIHggXVxuICB0NjAubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHQ2MFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0YW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICd0YW4nOiBNYXRoLnRhbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnRhbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgudGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbi5pbnB1dHMgPSBbIHggXVxuICB0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgdGFuLm5hbWUgPSBgJHt0YW4uYmFzZW5hbWV9e3Rhbi5pZH1gXG5cbiAgcmV0dXJuIHRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0YW5oJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAndGFuaCc6IE1hdGgudGFuaCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnRhbmgoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbmgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW5oID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbmguaW5wdXRzID0gWyB4IF1cbiAgdGFuaC5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW5oLm5hbWUgPSBgJHt0YW5oLmJhc2VuYW1lfXt0YW5oLmlkfWBcblxuICByZXR1cm4gdGFuaFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGx0ICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBwaGFzb3IgID0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9NDQwLCBwdWxzZXdpZHRoPS41ICkgPT4ge1xuICBsZXQgZ3JhcGggPSBsdCggYWNjdW0oIGRpdiggZnJlcXVlbmN5LCA0NDEwMCApICksIC41IClcblxuICBncmFwaC5uYW1lID0gYHRyYWluJHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiBncmFwaFxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKVxuXG5sZXQgaXNTdGVyZW8gPSBmYWxzZVxuXG5sZXQgdXRpbGl0aWVzID0ge1xuICBjdHg6IG51bGwsXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9ICgpID0+IDBcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5mb3JFYWNoKCB2ID0+IHYoKSApXG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MubGVuZ3RoID0gMFxuICB9LFxuXG4gIGNyZWF0ZUNvbnRleHQoKSB7XG4gICAgbGV0IEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHRcbiAgICB0aGlzLmN0eCA9IG5ldyBBQygpXG4gICAgZ2VuLnNhbXBsZXJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlXG5cbiAgICBsZXQgc3RhcnQgPSAoKSA9PiB7XG4gICAgICBpZiggdHlwZW9mIEFDICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuXG4gICAgICAgICAgaWYoICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApeyAvLyByZXF1aXJlZCB0byBzdGFydCBhdWRpbyB1bmRlciBpT1MgNlxuICAgICAgICAgICAgbGV0IG15U291cmNlID0gdXRpbGl0aWVzLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICAgICAgICAgICAgbXlTb3VyY2UuY29ubmVjdCggdXRpbGl0aWVzLmN0eC5kZXN0aW5hdGlvbiApXG4gICAgICAgICAgICBteVNvdXJjZS5ub3RlT24oIDAgKVxuICAgICAgICAgIH1cbiAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHN0YXJ0IClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvcigpIHtcbiAgICB0aGlzLm5vZGUgPSB0aGlzLmN0eC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoIDEwMjQsIDAsIDIgKSxcbiAgICB0aGlzLmNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfSxcbiAgICB0aGlzLmNhbGxiYWNrID0gdGhpcy5jbGVhckZ1bmN0aW9uXG5cbiAgICB0aGlzLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiggYXVkaW9Qcm9jZXNzaW5nRXZlbnQgKSB7XG4gICAgICB2YXIgb3V0cHV0QnVmZmVyID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQub3V0cHV0QnVmZmVyO1xuXG4gICAgICB2YXIgbGVmdCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMCApLFxuICAgICAgICAgIHJpZ2h0PSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDEgKVxuXG4gICAgICBmb3IgKHZhciBzYW1wbGUgPSAwOyBzYW1wbGUgPCBsZWZ0Lmxlbmd0aDsgc2FtcGxlKyspIHtcbiAgICAgICAgaWYoICFpc1N0ZXJlbyApIHtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgXSA9IHJpZ2h0WyBzYW1wbGUgXSA9IHV0aWxpdGllcy5jYWxsYmFjaygpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHZhciBvdXQgPSB1dGlsaXRpZXMuY2FsbGJhY2soKVxuICAgICAgICAgIGxlZnRbIHNhbXBsZSAgXSA9IG91dFswXVxuICAgICAgICAgIHJpZ2h0WyBzYW1wbGUgXSA9IG91dFsxXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ub2RlLmNvbm5lY3QoIHRoaXMuY3R4LmRlc3RpbmF0aW9uIClcblxuICAgIC8vdGhpcy5ub2RlLmNvbm5lY3QoIHRoaXMuYW5hbHl6ZXIgKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgXG4gIHBsYXlHcmFwaCggZ3JhcGgsIGRlYnVnLCBtZW09NDQxMDAqMTAgKSB7XG4gICAgdXRpbGl0aWVzLmNsZWFyKClcbiAgICBpZiggZGVidWcgPT09IHVuZGVmaW5lZCApIGRlYnVnID0gZmFsc2VcbiAgICAgICAgICBcbiAgICBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIGdyYXBoIClcblxuICAgIHV0aWxpdGllcy5jYWxsYmFjayA9IGdlbi5jcmVhdGVDYWxsYmFjayggZ3JhcGgsIG1lbSwgZGVidWcgKVxuICAgIFxuICAgIGlmKCB1dGlsaXRpZXMuY29uc29sZSApIHV0aWxpdGllcy5jb25zb2xlLnNldFZhbHVlKCB1dGlsaXRpZXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG5cbiAgICByZXR1cm4gdXRpbGl0aWVzLmNhbGxiYWNrXG4gIH0sXG5cbiAgbG9hZFNhbXBsZSggc291bmRGaWxlUGF0aCwgZGF0YSApIHtcbiAgICBsZXQgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICByZXEub3BlbiggJ0dFVCcsIHNvdW5kRmlsZVBhdGgsIHRydWUgKVxuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInIFxuICAgIFxuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLHJlamVjdCkgPT4ge1xuICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXVkaW9EYXRhID0gcmVxLnJlc3BvbnNlXG5cbiAgICAgICAgdXRpbGl0aWVzLmN0eC5kZWNvZGVBdWRpb0RhdGEoIGF1ZGlvRGF0YSwgKGJ1ZmZlcikgPT4ge1xuICAgICAgICAgIGRhdGEuYnVmZmVyID0gYnVmZmVyLmdldENoYW5uZWxEYXRhKDApXG4gICAgICAgICAgcmVzb2x2ZSggZGF0YS5idWZmZXIgKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXEuc2VuZCgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbn1cblxudXRpbGl0aWVzLmNsZWFyLmNhbGxiYWNrcyA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbGl0aWVzXG4iLCIndXNlIHN0cmljdCdcblxuLypcbiAqIG1hbnkgd2luZG93cyBoZXJlIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vY29yYmFuYnJvb2svZHNwLmpzL2Jsb2IvbWFzdGVyL2RzcC5qc1xuICogc3RhcnRpbmcgYXQgbGluZSAxNDI3XG4gKiB0YWtlbiA4LzE1LzE2XG4qLyBcblxuY29uc3Qgd2luZG93cyA9IG1vZHVsZS5leHBvcnRzID0geyBcbiAgYmFydGxldHQoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDIgLyAobGVuZ3RoIC0gMSkgKiAoKGxlbmd0aCAtIDEpIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpIFxuICB9LFxuXG4gIGJhcnRsZXR0SGFubiggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC42MiAtIDAuNDggKiBNYXRoLmFicyhpbmRleCAvIChsZW5ndGggLSAxKSAtIDAuNSkgLSAwLjM4ICogTWF0aC5jb3MoIDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgYmxhY2ttYW4oIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIGxldCBhMCA9ICgxIC0gYWxwaGEpIC8gMixcbiAgICAgICAgYTEgPSAwLjUsXG4gICAgICAgIGEyID0gYWxwaGEgLyAyXG5cbiAgICByZXR1cm4gYTAgLSBhMSAqIE1hdGguY29zKDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpICsgYTIgKiBNYXRoLmNvcyg0ICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGNvc2luZSggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gTWF0aC5jb3MoTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gTWF0aC5QSSAvIDIpXG4gIH0sXG5cbiAgZ2F1c3MoIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIHJldHVybiBNYXRoLnBvdyhNYXRoLkUsIC0wLjUgKiBNYXRoLnBvdygoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSAvIChhbHBoYSAqIChsZW5ndGggLSAxKSAvIDIpLCAyKSlcbiAgfSxcblxuICBoYW1taW5nKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjU0IC0gMC40NiAqIE1hdGguY29zKCBNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGhhbm4oIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNSAqICgxIC0gTWF0aC5jb3MoIE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpIClcbiAgfSxcblxuICBsYW5jem9zKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIGxldCB4ID0gMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMTtcbiAgICByZXR1cm4gTWF0aC5zaW4oTWF0aC5QSSAqIHgpIC8gKE1hdGguUEkgKiB4KVxuICB9LFxuXG4gIHJlY3Rhbmd1bGFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAxXG4gIH0sXG5cbiAgdHJpYW5ndWxhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMiAvIGxlbmd0aCAqIChsZW5ndGggLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSlcbiAgfSxcblxuICAvLyBwYXJhYm9sYVxuICB3ZWxjaCggbGVuZ3RoLCBfaW5kZXgsIGlnbm9yZSwgc2hpZnQgKSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgY29uc3QgaW5kZXggPSBzaGlmdCA9PT0gMCA/IF9pbmRleCA6IChfaW5kZXggKyBNYXRoLmZsb29yKCBzaGlmdCAqIGxlbmd0aCApKSAlIGxlbmd0aFxuICAgIGNvbnN0IG5fMV9vdmVyMiA9IChsZW5ndGggLSAxKSAvIDIgXG5cbiAgICByZXR1cm4gMSAtIE1hdGgucG93KCAoIGluZGV4IC0gbl8xX292ZXIyICkgLyBuXzFfb3ZlcjIsIDIgKVxuICB9LFxuICBpbnZlcnNld2VsY2goIGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0PTAgKSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgbGV0IGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vciggc2hpZnQgKiBsZW5ndGggKSkgJSBsZW5ndGhcbiAgICBjb25zdCBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyXG5cbiAgICByZXR1cm4gTWF0aC5wb3coICggaW5kZXggLSBuXzFfb3ZlcjIgKSAvIG5fMV9vdmVyMiwgMiApXG4gIH0sXG5cbiAgcGFyYWJvbGEoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgaWYoIGluZGV4IDw9IGxlbmd0aCAvIDIgKSB7XG4gICAgICByZXR1cm4gd2luZG93cy5pbnZlcnNld2VsY2goIGxlbmd0aCAvIDIsIGluZGV4ICkgLSAxXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gMSAtIHdpbmRvd3MuaW52ZXJzZXdlbGNoKCBsZW5ndGggLyAyLCBpbmRleCAtIGxlbmd0aCAvIDIgKVxuICAgIH1cbiAgfSxcblxuICBleHBvbmVudGlhbCggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KCBpbmRleC9sZW5ndGgsIGFscGhhIClcbiAgfSxcblxuICBsaW5lYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIGluZGV4L2xlbmd0aFxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3dyYXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBzaWduYWwgPSBpbnB1dHNbMF0sIG1pbiA9IGlucHV0c1sxXSwgbWF4ID0gaW5wdXRzWzJdLFxuICAgICAgICBvdXQsIGRpZmZcblxuICAgIC8vb3V0ID0gYCgoKCR7aW5wdXRzWzBdfSAtICR7dGhpcy5taW59KSAlICR7ZGlmZn0gICsgJHtkaWZmfSkgJSAke2RpZmZ9ICsgJHt0aGlzLm1pbn0pYFxuICAgIC8vY29uc3QgbG9uZyBudW1XcmFwcyA9IGxvbmcoKHYtbG8pL3JhbmdlKSAtICh2IDwgbG8pO1xuICAgIC8vcmV0dXJuIHYgLSByYW5nZSAqIGRvdWJsZShudW1XcmFwcyk7ICAgXG4gICAgXG4gICAgaWYoIHRoaXMubWluID09PSAwICkge1xuICAgICAgZGlmZiA9IG1heFxuICAgIH1lbHNlIGlmICggaXNOYU4oIG1heCApIHx8IGlzTmFOKCBtaW4gKSApIHtcbiAgICAgIGRpZmYgPSBgJHttYXh9IC0gJHttaW59YFxuICAgIH1lbHNle1xuICAgICAgZGlmZiA9IG1heCAtIG1pblxuICAgIH1cblxuICAgIG91dCA9XG5gIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cbiAgaWYoICR7dGhpcy5uYW1lfSA8ICR7dGhpcy5taW59ICkgJHt0aGlzLm5hbWV9ICs9ICR7ZGlmZn1cbiAgZWxzZSBpZiggJHt0aGlzLm5hbWV9ID4gJHt0aGlzLm1heH0gKSAke3RoaXMubmFtZX0gLT0gJHtkaWZmfVxuXG5gXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsICcgJyArIG91dCBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xLCBtaW4sIG1heCBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBNZW1vcnlIZWxwZXIgPSB7XG4gIGNyZWF0ZSggc2l6ZU9yQnVmZmVyPTQwOTYsIG1lbXR5cGU9RmxvYXQzMkFycmF5ICkge1xuICAgIGxldCBoZWxwZXIgPSBPYmplY3QuY3JlYXRlKCB0aGlzIClcblxuICAgIC8vIGNvbnZlbmllbnRseSwgYnVmZmVyIGNvbnN0cnVjdG9ycyBhY2NlcHQgZWl0aGVyIGEgc2l6ZSBvciBhbiBhcnJheSBidWZmZXIgdG8gdXNlLi4uXG4gICAgLy8gc28sIG5vIG1hdHRlciB3aGljaCBpcyBwYXNzZWQgdG8gc2l6ZU9yQnVmZmVyIGl0IHNob3VsZCB3b3JrLlxuICAgIE9iamVjdC5hc3NpZ24oIGhlbHBlciwge1xuICAgICAgaGVhcDogbmV3IG1lbXR5cGUoIHNpemVPckJ1ZmZlciApLFxuICAgICAgbGlzdDoge30sXG4gICAgICBmcmVlTGlzdDoge31cbiAgICB9KVxuXG4gICAgcmV0dXJuIGhlbHBlclxuICB9LFxuXG4gIGFsbG9jKCBzaXplLCBpbW11dGFibGUgKSB7XG4gICAgbGV0IGlkeCA9IC0xXG5cbiAgICBpZiggc2l6ZSA+IHRoaXMuaGVhcC5sZW5ndGggKSB7XG4gICAgICB0aHJvdyBFcnJvciggJ0FsbG9jYXRpb24gcmVxdWVzdCBpcyBsYXJnZXIgdGhhbiBoZWFwIHNpemUgb2YgJyArIHRoaXMuaGVhcC5sZW5ndGggKVxuICAgIH1cblxuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmZyZWVMaXN0ICkge1xuICAgICAgbGV0IGNhbmRpZGF0ZSA9IHRoaXMuZnJlZUxpc3RbIGtleSBdXG5cbiAgICAgIGlmKCBjYW5kaWRhdGUuc2l6ZSA+PSBzaXplICkge1xuICAgICAgICBpZHggPSBrZXlcblxuICAgICAgICB0aGlzLmxpc3RbIGlkeCBdID0geyBzaXplLCBpbW11dGFibGUsIHJlZmVyZW5jZXM6MSB9XG5cbiAgICAgICAgaWYoIGNhbmRpZGF0ZS5zaXplICE9PSBzaXplICkge1xuICAgICAgICAgIGxldCBuZXdJbmRleCA9IGlkeCArIHNpemUsXG4gICAgICAgICAgICAgIG5ld0ZyZWVTaXplXG5cbiAgICAgICAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5saXN0ICkge1xuICAgICAgICAgICAgaWYoIGtleSA+IG5ld0luZGV4ICkge1xuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZSA9IGtleSAtIG5ld0luZGV4XG4gICAgICAgICAgICAgIHRoaXMuZnJlZUxpc3RbIG5ld0luZGV4IF0gPSBuZXdGcmVlU2l6ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGlkeCAhPT0gLTEgKSBkZWxldGUgdGhpcy5mcmVlTGlzdFsgaWR4IF1cblxuICAgIGlmKCBpZHggPT09IC0xICkge1xuICAgICAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyggdGhpcy5saXN0ICksXG4gICAgICAgICAgbGFzdEluZGV4XG5cbiAgICAgIGlmKCBrZXlzLmxlbmd0aCApIHsgLy8gaWYgbm90IGZpcnN0IGFsbG9jYXRpb24uLi5cbiAgICAgICAgbGFzdEluZGV4ID0gcGFyc2VJbnQoIGtleXNbIGtleXMubGVuZ3RoIC0gMSBdIClcblxuICAgICAgICBpZHggPSBsYXN0SW5kZXggKyB0aGlzLmxpc3RbIGxhc3RJbmRleCBdLnNpemVcbiAgICAgIH1lbHNle1xuICAgICAgICBpZHggPSAwXG4gICAgICB9XG5cbiAgICAgIHRoaXMubGlzdFsgaWR4IF0gPSB7IHNpemUsIGltbXV0YWJsZSwgcmVmZXJlbmNlczoxIH1cbiAgICB9XG5cbiAgICBpZiggaWR4ICsgc2l6ZSA+PSB0aGlzLmhlYXAubGVuZ3RoICkge1xuICAgICAgdGhyb3cgRXJyb3IoICdObyBhdmFpbGFibGUgYmxvY2tzIHJlbWFpbiBzdWZmaWNpZW50IGZvciBhbGxvY2F0aW9uIHJlcXVlc3QuJyApXG4gICAgfVxuICAgIHJldHVybiBpZHhcbiAgfSxcblxuICBhZGRSZWZlcmVuY2UoIGluZGV4ICkge1xuICAgIGlmKCB0aGlzLmxpc3RbIGluZGV4IF0gIT09IHVuZGVmaW5lZCApIHsgXG4gICAgICB0aGlzLmxpc3RbIGluZGV4IF0ucmVmZXJlbmNlcysrXG4gICAgfVxuICB9LFxuXG4gIGZyZWUoIGluZGV4ICkge1xuICAgIGlmKCB0aGlzLmxpc3RbIGluZGV4IF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHRocm93IEVycm9yKCAnQ2FsbGluZyBmcmVlKCkgb24gbm9uLWV4aXN0aW5nIGJsb2NrLicgKVxuICAgIH1cblxuICAgIGxldCBzbG90ID0gdGhpcy5saXN0WyBpbmRleCBdXG4gICAgaWYoIHNsb3QgPT09IDAgKSByZXR1cm5cbiAgICBzbG90LnJlZmVyZW5jZXMtLVxuXG4gICAgaWYoIHNsb3QucmVmZXJlbmNlcyA9PT0gMCAmJiBzbG90LmltbXV0YWJsZSAhPT0gdHJ1ZSApIHsgICAgXG4gICAgICB0aGlzLmxpc3RbIGluZGV4IF0gPSAwXG5cbiAgICAgIGxldCBmcmVlQmxvY2tTaXplID0gMFxuICAgICAgZm9yKCBsZXQga2V5IGluIHRoaXMubGlzdCApIHtcbiAgICAgICAgaWYoIGtleSA+IGluZGV4ICkge1xuICAgICAgICAgIGZyZWVCbG9ja1NpemUgPSBrZXkgLSBpbmRleFxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5mcmVlTGlzdFsgaW5kZXggXSA9IGZyZWVCbG9ja1NpemVcbiAgICB9XG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5SGVscGVyXG4iXX0=
