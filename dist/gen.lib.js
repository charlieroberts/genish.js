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
      wrap = '  if( ' + valueRef + ' >= ' + this.max + ' && ' + loops + ' ) {\n    ' + valueRef + ' -= ' + diff + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
    } else if (this.max !== Infinity && this.min !== Infinity) {
      wrap = '  if( ' + valueRef + ' >= ' + _max + ' && ' + loops + ' ) {\n    ' + valueRef + ' -= ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else if( ' + valueRef + ' < ' + _min + ' && ' + loops + ' ) {\n    ' + valueRef + ' += ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
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

module.exports = function (in1) {
  for (var _len = arguments.length, tapsAndProperties = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    tapsAndProperties[_key - 2] = arguments[_key];
  }

  var time = arguments.length <= 1 || arguments[1] === undefined ? 256 : arguments[1];

  var ugen = Object.create(proto),
      defaults = { size: 512, feedback: 0, interp: 'linear' },
      writeIdx = void 0,
      readIdx = void 0,
      delaydata = void 0,
      properties = void 0,
      tapTimes = [time],
      taps = void 0;

  if (Array.isArray(tapsAndProperties)) {
    properties = tapsAndProperties[tapsAndProperties.length - 1];
    if (tapsAndProperties.length > 1) {
      for (var i = 0; i < tapsAndProperties.length - 1; i++) {
        tapTimes.push(tapsAndProperties[i]);
      }
    }
  } else {
    properties = tapsAndProperties;
  }

  if (properties !== undefined) Object.assign(defaults, properties);

  if (defaults.size < time) defaults.size = time;

  delaydata = data(defaults.size);

  ugen.inputs = [];

  writeIdx = accum(1, 0, { max: defaults.size });

  for (var _i = 0; _i < tapTimes.length; _i++) {
    ugen.inputs[_i] = peek(delaydata, wrap(sub(writeIdx, tapTimes[_i]), 0, defaults.size), { mode: 'samples', interp: defaults.interp });
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

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var mul = {
    id: _gen.getUID(),
    inputs: args,

    gen: function gen() {
      var inputs = _gen.getInputs(this),
          out = '(',
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

      if (alreadyFullSummed) out = '';

      if (numCount > 0) {
        out += mulAtEnd || alreadyFullSummed ? sum : ' * ' + sum;
      }

      if (!alreadyFullSummed) out += ')';

      return out;
    }
  };

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

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var sub = {
    id: _gen.getUID(),
    inputs: args,

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

      if (hasUgens) {
        // store in variable for future reference
        out = '  var ' + this.name + ' = (';
      } else {
        out = '(';
      }

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

      if (hasUgens) out += '\n';

      returnValue = hasUgens ? [this.name, out] : out;

      if (hasUgens) _gen.memo[this.name] = this.name;

      return returnValue;
    }
  };

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZC5qcyIsImpzL2FkZC5qcyIsImpzL2Fkc3IuanMiLCJqcy9hbmQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2F0dGFjay5qcyIsImpzL2JhbmcuanMiLCJqcy9ib29sLmpzIiwianMvY2VpbC5qcyIsImpzL2NsYW1wLmpzIiwianMvY29zLmpzIiwianMvY291bnRlci5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RjYmxvY2suanMiLCJqcy9kZWNheS5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9lbnYuanMiLCJqcy9lcS5qcyIsImpzL2Zsb29yLmpzIiwianMvZm9sZC5qcyIsImpzL2dhdGUuanMiLCJqcy9nZW4uanMiLCJqcy9ndC5qcyIsImpzL2d0ZS5qcyIsImpzL2d0cC5qcyIsImpzL2hpc3RvcnkuanMiLCJqcy9pZmVsc2VpZi5qcyIsImpzL2luLmpzIiwianMvaW5kZXguanMiLCJqcy9sdC5qcyIsImpzL2x0ZS5qcyIsImpzL2x0cC5qcyIsImpzL21heC5qcyIsImpzL21lbW8uanMiLCJqcy9taW4uanMiLCJqcy9taXguanMiLCJqcy9tb2QuanMiLCJqcy9tc3Rvc2FtcHMuanMiLCJqcy9tdG9mLmpzIiwianMvbXVsLmpzIiwianMvbmVxLmpzIiwianMvbm9pc2UuanMiLCJqcy9ub3QuanMiLCJqcy9wYW4uanMiLCJqcy9wYXJhbS5qcyIsImpzL3BlZWsuanMiLCJqcy9waGFzb3IuanMiLCJqcy9wb2tlLmpzIiwianMvcG93LmpzIiwianMvcmF0ZS5qcyIsImpzL3JvdW5kLmpzIiwianMvc2FoLmpzIiwianMvc2VsZWN0b3IuanMiLCJqcy9zaWduLmpzIiwianMvc2luLmpzIiwianMvc2xpZGUuanMiLCJqcy9zdWIuanMiLCJqcy9zd2l0Y2guanMiLCJqcy90NjAuanMiLCJqcy90YW4uanMiLCJqcy90YW5oLmpzIiwianMvdHJhaW4uanMiLCJqcy91dGlsaXRpZXMuanMiLCJqcy93aW5kb3dzLmpzIiwianMvd3JhcC5qcyIsIi4uL21lbW9yeS1oZWxwZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBUDs7QUFFSixJQUFJLFFBQVE7QUFDVixRQUFLLEtBQUw7O0FBRUEsc0JBQU07QUFDSixRQUFJLFlBQUo7UUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBVCxDQUZBOztBQUlKLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBTCxFQUFhLEtBQUssR0FBTCxDQUFsQyxFQUR1Qjs7QUFHdkIsMEJBQWtCLE9BQU8sQ0FBUCxRQUFsQixDQUh1QjtLQUF6QixNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTixDQURLO0tBTFA7O0FBU0EsV0FBTyxHQUFQLENBYkk7R0FISTtDQUFSOztBQW9CSixPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFOLENBRGdCOztBQUdwQixNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYixDQUhvQjs7QUFLcEIsU0FBTyxHQUFQLENBTG9CO0NBQUw7OztBQ3hCakI7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVA7O0FBRUosSUFBSSxRQUFRO0FBQ1YsWUFBUyxPQUFUOztBQUVBLHNCQUFNO0FBQ0osUUFBSSxhQUFKO1FBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQVQ7UUFDQSxVQUFVLFNBQVMsS0FBSyxJQUFMO1FBQ25CLHFCQUhKLENBREk7O0FBTUosU0FBSSxhQUFK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UyxjQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxXQUFVLFFBQVMsY0FBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsTUFBVSxRQUFTLFNBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxNQUFVLFFBQVMsU0FBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxNQUFVLFFBQVMsU0FBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFVBQVUsUUFBUyxhQUFULENBQVY7QUFDQSxhQUFVLFFBQVMsZ0JBQVQsQ0FBVjtBQUNBLFlBQVUsUUFBUyxlQUFULENBQVY7QUFDQSxhQUFVLFFB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Q25CLFlBRG1CO0FBRW5CLFlBRm1CO0FBR25CLFNBQVEsS0FBSSxNQUFKLEVBQVI7QUFDQSxZQUFRLENBQUUsR0FBRixFQUFPLEdBQVAsRUFBWSxHQUFaLENBQVI7R0FKRixFQUh3Qzs7QUFVeEMsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFMLEdBQWdCLEtBQUssR0FBTCxDQVZTOztBQVl4QyxTQUFPLElBQVAsQ0Fad0M7Q0FBekI7OztBQ3ZDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonYWJzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguYWJzIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWJzKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFicyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFicyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhYnMuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gYWJzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FjY3VtJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5XG5cbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG4gICAgXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgY2FsbGJhY2soIF9uYW1lLCBfaW5jciwgX3Jlc2V0LCB2YWx1ZVJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICBcbiAgICAvKiB0aHJlZSBkaWZmZXJlbnQgbWV0aG9kcyBvZiB3cmFwcGluZywgdGhpcmQgaXMgbW9zdCBleHBlbnNpdmU6XG4gICAgICpcbiAgICAgKiAxOiByYW5nZSB7MCwxfTogeSA9IHggLSAoeCB8IDApXG4gICAgICogMjogbG9nMih0aGlzLm1heCkgPT0gaW50ZWdlcjogeSA9IHggJiAodGhpcy5tYXggLSAxKVxuICAgICAqIDM6IGFsbCBvdGhlcnM6IGlmKCB4ID49IHRoaXMubWF4ICkgeSA9IHRoaXMubWF4IC14XG4gICAgICpcbiAgICAgKi9cblxuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiggISh0eXBlb2YgdGhpcy5pbnB1dHNbMV0gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzFdIDwgMSkgKSB7IFxuICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMuaW5pdGlhbFZhbHVlfVxcblxcbmAgXG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfTtcXG5gXG4gICAgXG4gICAgaWYoIHRoaXMuc2hvdWxkV3JhcCA9PT0gZmFsc2UgJiYgdGhpcy5zaG91bGRDbGFtcCA9PT0gdHJ1ZSApIHtcbiAgICAgIG91dCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPCAke3RoaXMubWF4IH0gKSAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmBcbiAgICB9ZWxzZXtcbiAgICAgIG91dCArPSBgICAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgICYmIHRoaXMuc2hvdWxkV3JhcCApIHdyYXAgKz0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcbmBcbiAgICBpZiggdGhpcy5taW4gIT09IC1JbmZpbml0eSAmJiB0aGlzLnNob3VsZFdyYXAgKSB3cmFwICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA8ICR7dGhpcy5taW59ICkgJHt2YWx1ZVJlZn0gKz0gJHtkaWZmfVxcblxcbmBcblxuICAgIC8vaWYoIHRoaXMubWluID09PSAwICYmIHRoaXMubWF4ID09PSAxICkgeyBcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9IC0gKCR7dmFsdWVSZWZ9IHwgMClcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWluID09PSAwICYmICggTWF0aC5sb2cyKCB0aGlzLm1heCApIHwgMCApID09PSBNYXRoLmxvZzIoIHRoaXMubWF4ICkgKSB7XG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAmICgke3RoaXMubWF4fSAtIDEpXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgKXtcbiAgICAvLyAgd3JhcCA9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5cXG5gXG4gICAgLy99XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwXG5cbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluY3IsIHJlc2V0PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBtaW46MCwgbWF4OjEsIHNob3VsZFdyYXA6IHRydWUsIHNob3VsZENsYW1wOmZhbHNlIH1cbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgaWYoIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSA9PT0gdW5kZWZpbmVkICkgZGVmYXVsdHMuaW5pdGlhbFZhbHVlID0gZGVmYXVsdHMubWluXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW46IGRlZmF1bHRzLm1pbiwgXG4gICAgbWF4OiBkZWZhdWx0cy5tYXgsXG4gICAgaW5pdGlhbDogZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbmNyLCByZXNldCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICB9XG4gIH0sXG4gIGRlZmF1bHRzIClcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7IHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdIH0sXG4gICAgc2V0KHYpIHsgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgfVxuICB9KVxuXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYWNvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Fjb3MnOiBNYXRoLmFjb3MgfSlcblxuICAgICAgb3V0ID0gYGdlbi5hY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hY29zKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYWNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhY29zLmlucHV0cyA9IFsgeCBdXG4gIGFjb3MuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWNvcy5uYW1lID0gYCR7YWNvcy5iYXNlbmFtZX17YWNvcy5pZH1gXG5cbiAgcmV0dXJuIGFjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbXVsICAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgZGl2ICAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgZGF0YSAgICAgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgICAgID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBhY2N1bSAgICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGlmZWxzZSAgID0gcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gICAgbHQgICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBiYW5nICAgICA9IHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gICAgZW52ICAgICAgPSByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gICAgYWRkICAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgcG9rZSAgICAgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICAgIG5lcSAgICAgID0gcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICAgIGFuZCAgICAgID0gcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICAgIGd0ZSAgICAgID0gcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICAgIG1lbW8gICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZSA9IDQ0MTAwLCBkZWNheVRpbWUgPSA0NDEwMCwgX3Byb3BzICkgPT4ge1xuICBsZXQgX2JhbmcgPSBiYW5nKCksXG4gICAgICBwaGFzZSA9IGFjY3VtKCAxLCBfYmFuZywgeyBtYXg6IEluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlLCBpbml0aWFsVmFsdWU6LUluZmluaXR5IH0pLFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNoYXBlOidleHBvbmVudGlhbCcsIGFscGhhOjUgfSwgX3Byb3BzICksXG4gICAgICBidWZmZXJEYXRhLCBkZWNheURhdGEsIG91dCwgYnVmZmVyXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnYXR0YWNrIHRpbWU6JywgYXR0YWNrVGltZSwgJ2RlY2F5IHRpbWU6JywgZGVjYXlUaW1lIClcbiAgbGV0IGNvbXBsZXRlRmxhZyA9IGRhdGEoIFswXSApXG4gIFxuICAvLyBzbGlnaHRseSBtb3JlIGVmZmljaWVudCB0byB1c2UgZXhpc3RpbmcgcGhhc2UgYWNjdW11bGF0b3IgZm9yIGxpbmVhciBlbnZlbG9wZXNcbiAgaWYoIHByb3BzLnNoYXBlID09PSAnbGluZWFyJyApIHtcbiAgICBvdXQgPSBpZmVsc2UoIFxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgbHQoIHBoYXNlLCBhdHRhY2tUaW1lICkpLFxuICAgICAgbWVtbyggZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApICksXG5cbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksICBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSApLFxuICAgICAgc3ViKCAxLCBkaXYoIHN1YiggcGhhc2UsIGF0dGFja1RpbWUgKSwgZGVjYXlUaW1lICkgKSxcbiAgICAgIFxuICAgICAgbmVxKCBwaGFzZSwgLUluZmluaXR5KSxcbiAgICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgICAgMCBcbiAgICApXG4gIH0gZWxzZSB7ICAgICBcbiAgICBidWZmZXJEYXRhID0gZW52KCAxMDI0LCB7IHR5cGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhIH0pXG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgICAgYW5kKCBndGUocGhhc2UsMCksIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgc3ViKCAxLCBkaXYoIHN1YiggcGhhc2UsIGF0dGFja1RpbWUgKSwgZGVjYXlUaW1lICkgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgICAgbmVxKCBwaGFzZSwgLUluZmluaXR5KSxcbiAgICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgICAgMFxuICAgIClcbiAgfVxuXG4gIG91dC5pc0NvbXBsZXRlID0gKCk9PiBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdXG5cbiAgb3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdID0gMFxuICAgIF9iYW5nLnRyaWdnZXIoKVxuICB9XG5cbiAgcmV0dXJuIG91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgbGV0IGFkZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgc3VtID0gMCwgbnVtQ291bnQgPSAwLCBhZGRlckF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgICBvdXQgKz0gdlxuICAgICAgICAgIGlmKCBpIDwgaW5wdXRzLmxlbmd0aCAtMSApIHtcbiAgICAgICAgICAgIGFkZGVyQXRFbmQgPSB0cnVlXG4gICAgICAgICAgICBvdXQgKz0gJyArICdcbiAgICAgICAgICB9XG4gICAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdW0gKz0gcGFyc2VGbG9hdCggdiApXG4gICAgICAgICAgbnVtQ291bnQrK1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgXG4gICAgICBpZiggYWxyZWFkeUZ1bGxTdW1tZWQgKSBvdXQgPSAnJ1xuXG4gICAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgICBvdXQgKz0gYWRkZXJBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKyAnICsgc3VtXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKCAhYWxyZWFkeUZ1bGxTdW1tZWQgKSBvdXQgKz0gJyknXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBhZGRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbXVsICAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgZGl2ICAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgZGF0YSAgICAgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgICAgID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBhY2N1bSAgICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGlmZWxzZSAgID0gcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gICAgbHQgICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBiYW5nICAgICA9IHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gICAgZW52ICAgICAgPSByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gICAgcGFyYW0gICAgPSByZXF1aXJlKCAnLi9wYXJhbS5qcycgKSxcbiAgICBhZGQgICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBndHAgICAgICA9IHJlcXVpcmUoICcuL2d0cC5qcycgKSxcbiAgICBub3QgICAgICA9IHJlcXVpcmUoICcuL25vdC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZT00NCwgZGVjYXlUaW1lPTIyMDUwLCBzdXN0YWluVGltZT00NDEwMCwgc3VzdGFpbkxldmVsPS42LCByZWxlYXNlVGltZT00NDEwMCwgX3Byb3BzICkgPT4ge1xuICBsZXQgZW52VHJpZ2dlciA9IGJhbmcoKSxcbiAgICAgIHBoYXNlID0gYWNjdW0oIDEsIGVudlRyaWdnZXIsIHsgbWF4OiBJbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSB9KSxcbiAgICAgIHNob3VsZFN1c3RhaW4gPSBwYXJhbSggMSApLFxuICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICBzaGFwZTogJ2V4cG9uZW50aWFsJyxcbiAgICAgICAgIGFscGhhOiA1LFxuICAgICAgICAgdHJpZ2dlclJlbGVhc2U6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIF9wcm9wcyApLFxuICAgICAgYnVmZmVyRGF0YSwgZGVjYXlEYXRhLCBvdXQsIGJ1ZmZlciwgc3VzdGFpbkNvbmRpdGlvbiwgcmVsZWFzZUFjY3VtLCByZWxlYXNlQ29uZGl0aW9uXG5cbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIC8vaWYoIHByb3BzLnNoYXBlID09PSAnbGluZWFyJyApIHtcbiAgLy8gIG91dCA9IGlmZWxzZSggXG4gIC8vICAgIGx0KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSApLCBtZW1vKCBkaXYoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICkgKSxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICksIHN1YiggMSwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKSwgcHJvcHMuZGVjYXlUaW1lICksIDEtcHJvcHMuc3VzdGFpbkxldmVsICkgKSxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICsgcHJvcHMuc3VzdGFpblRpbWUgKSwgXG4gIC8vICAgICAgcHJvcHMuc3VzdGFpbkxldmVsLFxuICAvLyAgICBsdCggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKyBwcm9wcy5zdXN0YWluVGltZSArIHByb3BzLnJlbGVhc2VUaW1lICksIFxuICAvLyAgICAgIHN1YiggcHJvcHMuc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSArIHByb3BzLmRlY2F5VGltZSArIHByb3BzLnN1c3RhaW5UaW1lICksIHByb3BzLnJlbGVhc2VUaW1lICksIHByb3BzLnN1c3RhaW5MZXZlbCkgKSxcbiAgLy8gICAgMFxuICAvLyAgKVxuICAvL30gZWxzZSB7ICAgICBcbiAgICBidWZmZXJEYXRhID0gZW52KHsgbGVuZ3RoOjEwMjQsIGFscGhhOnByb3BzLmFscGhhLCBzaGlmdDowLCB0eXBlOnByb3BzLnNoYXBlIH0pXG5cbiAgICBjb25zb2xlLmxvZyggYnVmZmVyRGF0YSApXG4gICAgXG4gICAgc3VzdGFpbkNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlIFxuICAgICAgPyBzaG91bGRTdXN0YWluXG4gICAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lICkgKVxuXG4gICAgcmVsZWFzZUFjY3VtID0gcHJvcHMudHJpZ2dlclJlbGVhc2VcbiAgICAgID8gZ3RwKCBzdWIoIHN1c3RhaW5MZXZlbCwgYWNjdW0oIGRpdiggc3VzdGFpbkxldmVsLCByZWxlYXNlVGltZSApICwgMCwgeyBzaG91bGRXcmFwOmZhbHNlIH0pICksIDAgKVxuICAgICAgOiBzdWIoIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSApICksIHJlbGVhc2VUaW1lICksIHN1c3RhaW5MZXZlbCApICksIFxuXG4gICAgcmVsZWFzZUNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgICA/IG5vdCggc2hvdWxkU3VzdGFpbiApXG4gICAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lLCByZWxlYXNlVGltZSApIClcblxuICAgIG91dCA9IGlmZWxzZShcbiAgICAgIC8vIGF0dGFjayBcbiAgICAgIGx0KCBwaGFzZSwgIGF0dGFja1RpbWUgKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgICAgLy8gZGVjYXlcbiAgICAgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApLCBcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGEsIHN1YiggMSwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICksICBkZWNheVRpbWUgKSwgc3ViKCAxLCAgc3VzdGFpbkxldmVsICkgKSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pLFxuXG4gICAgICAvLyBzdXN0YWluXG4gICAgICBzdXN0YWluQ29uZGl0aW9uLFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgIHN1c3RhaW5MZXZlbCApLFxuXG4gICAgICAvLyByZWxlYXNlXG4gICAgICByZWxlYXNlQ29uZGl0aW9uLCAvL2x0KCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lICsgIHJlbGVhc2VUaW1lICksXG4gICAgICBwZWVrKCBcbiAgICAgICAgYnVmZmVyRGF0YSxcbiAgICAgICAgcmVsZWFzZUFjY3VtLCBcbiAgICAgICAgLy9zdWIoICBzdXN0YWluTGV2ZWwsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSArICBkZWNheVRpbWUgKyAgc3VzdGFpblRpbWUpLCAgcmVsZWFzZVRpbWUgKSwgIHN1c3RhaW5MZXZlbCApICksIFxuICAgICAgICB7IGJvdW5kbW9kZTonY2xhbXAnIH1cbiAgICAgICksXG5cbiAgICAgIDBcbiAgICApXG4gIC8vfVxuICAgXG4gIG91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDFcbiAgICBlbnZUcmlnZ2VyLnRyaWdnZXIoKVxuICB9XG5cbiAgb3V0LnJlbGVhc2UgPSAoKT0+IHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMFxuICAgIC8vIFhYWCBwcmV0dHkgbmFzdHkuLi4gZ3JhYnMgYWNjdW0gaW5zaWRlIG9mIGd0cCBhbmQgcmVzZXRzIHZhbHVlIG1hbnVhbGx5XG4gICAgLy8gdW5mb3J0dW5hdGVseSBlbnZUcmlnZ2VyIHdvbid0IHdvcmsgYXMgaXQncyBiYWNrIHRvIDAgYnkgdGhlIHRpbWUgdGhlIHJlbGVhc2UgYmxvY2sgaXMgdHJpZ2dlcmVkLi4uXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyByZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4IF0gPSAwXG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gMCAmJiAke2lucHV0c1sxXX0gIT09IDApIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXNpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2FzaW4nOiBNYXRoLmFzaW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhc2luLmlucHV0cyA9IFsgeCBdXG4gIGFzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXNpbi5uYW1lID0gYCR7YXNpbi5iYXNlbmFtZX17YXNpbi5pZH1gXG5cbiAgcmV0dXJuIGFzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXRhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2F0YW4nOiBNYXRoLmF0YW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5hdGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hdGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXRhbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhdGFuLmlucHV0cyA9IFsgeCBdXG4gIGF0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXRhbi5uYW1lID0gYCR7YXRhbi5iYXNlbmFtZX17YXRhbi5pZH1gXG5cbiAgcmV0dXJuIGF0YW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwICkgPT4ge1xuICBsZXQgc3NkID0gaGlzdG9yeSAoIDEgKSxcbiAgICAgIHQ2MCA9IE1hdGguZXhwKCAtNi45MDc3NTUyNzg5MjEgLyBkZWNheVRpbWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAgKSApXG5cbiAgc3NkLm91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc3NkLnZhbHVlID0gMVxuICB9XG5cbiAgcmV0dXJuIHN1YiggMSwgc3NkLm91dCApXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBnZW4oKSB7XG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBsZXQgb3V0ID0gXG5gICB2YXIgJHt0aGlzLm5hbWV9ID0gbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1cbiAgaWYoICR7dGhpcy5uYW1lfSA9PT0gMSApIG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dID0gMCAgICAgIFxuICAgICAgXG5gXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBfcHJvcHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46MCwgbWF4OjEgfSwgX3Byb3BzIClcblxuICB1Z2VuLm5hbWUgPSAnYmFuZycgKyBnZW4uZ2V0VUlEKClcblxuICB1Z2VuLm1pbiA9IHByb3BzLm1pblxuICB1Z2VuLm1heCA9IHByb3BzLm1heFxuXG4gIHVnZW4udHJpZ2dlciA9ICgpID0+IHtcbiAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gdWdlbi5tYXggXG4gIH1cblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Jvb2wnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IGAke2lucHV0c1swXX0gPT09IDAgPyAwIDogMWBcbiAgICBcbiAgICAvL2dlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICAvL3JldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgK291dCBdXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidjZWlsJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguY2VpbCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmNlaWwoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY2VpbCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNlaWwgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY2VpbC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBjZWlsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NsaXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9XG5cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9ID4gJHtpbnB1dHNbMl19ICkgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMl19XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA8ICR7aW5wdXRzWzFdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzFdfVxuYFxuICAgIG91dCA9ICcgJyArIG91dFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49LTEsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Nvcyc6IE1hdGguY29zIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jb3MoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY29zLmlucHV0cyA9IFsgeCBdXG4gIGNvcy5pZCA9IGdlbi5nZXRVSUQoKVxuICBjb3MubmFtZSA9IGAke2Nvcy5iYXNlbmFtZX17Y29zLmlkfWBcblxuICByZXR1cm4gY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvdW50ZXInLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHlcbiAgICAgICBcbiAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBmdW5jdGlvbkJvZHkgID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGlucHV0c1syXSwgaW5wdXRzWzNdLCBpbnB1dHNbNF0sICBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gLCBgbWVtb3J5WyR7dGhpcy5tZW1vcnkud3JhcC5pZHh9XWAgIClcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgIFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy53cmFwLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkgdGhpcy53cmFwLmdlbigpXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfbWluLCBfbWF4LCBfcmVzZXQsIGxvb3BzLCB2YWx1ZVJlZiwgd3JhcFJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICBcbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzNdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1szXSA8IDEpICkgeyBcbiAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49IDEgKSAke3ZhbHVlUmVmfSA9ICR7X21pbn1cXG5gXG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfTtcXG4gICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgXG4gICAgaWYoIHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHR5cGVvZiB0aGlzLm1pbiAhPT0gJ251bWJlcicgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gJiYgJHtsb29wc30gKSB7XG4gICAgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNle1xuICAgICR7d3JhcFJlZn0gPSAwXG4gIH1cXG5gXG4gICAgfWVsc2UgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSAmJiB0aGlzLm1pbiAhPT0gSW5maW5pdHkgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHtfbWF4fSAmJiAke2xvb3BzfSApIHtcbiAgICAke3ZhbHVlUmVmfSAtPSAke19tYXh9IC0gJHtfbWlufVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNlIGlmKCAke3ZhbHVlUmVmfSA8ICR7X21pbn0gJiYgJHtsb29wc30gKSB7XG4gICAgJHt2YWx1ZVJlZn0gKz0gJHtfbWF4fSAtICR7X21pbn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNle1xuICAgICAgb3V0ICs9ICdcXG4nXG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyPTEsIG1pbj0wLCBtYXg9SW5maW5pdHksIHJlc2V0PTAsIGxvb3BzPTEsICBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdGlhbFZhbHVlOiAwLCBzaG91bGRXcmFwOnRydWUgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW46ICAgIG1pbiwgXG4gICAgbWF4OiAgICBtYXgsXG4gICAgdmFsdWU6ICBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIG1pbiwgbWF4LCByZXNldCwgbG9vcHMgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSxcbiAgICAgIHdyYXA6ICB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSBcbiAgICB9LFxuICAgIHdyYXAgOiB7XG4gICAgICBnZW4oKSB7IFxuICAgICAgICBpZiggdWdlbi5tZW1vcnkud3JhcC5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgfVxuICAgICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWBcbiAgICAgICAgcmV0dXJuIGBtZW1vcnlbICR7dWdlbi5tZW1vcnkud3JhcC5pZHh9IF1gIFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuICBcbiAgdWdlbi53cmFwLmlucHV0cyA9IFsgdWdlbiBdXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG4gIHVnZW4ud3JhcC5uYW1lID0gdWdlbi5uYW1lICsgJ193cmFwJ1xuICByZXR1cm4gdWdlblxufSBcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bT0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgcGhhc29yPXJlcXVpcmUoICcuL3BoYXNvci5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2N5Y2xlJyxcblxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICAgIGZvciggbGV0IGkgPSAwLCBsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gTWF0aC5zaW4oICggaSAvIGwgKSAqICggTWF0aC5QSSAqIDIgKSApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMuY3ljbGUgPSBkYXRhKCBidWZmZXIsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSApXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAsIF9wcm9wcyApID0+IHtcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy5jeWNsZSA9PT0gJ3VuZGVmaW5lZCcgKSBwcm90by5pbml0VGFibGUoKSBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowIH0sIF9wcm9wcyApXG5cbiAgY29uc3QgdWdlbiA9IHBlZWsoIGdlbi5nbG9iYWxzLmN5Y2xlLCBwaGFzb3IoIGZyZXF1ZW5jeSwgcmVzZXQsIHByb3BzICkpXG4gIHVnZW4ubmFtZSA9ICdjeWNsZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgdXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApLFxuICBwZWVrID0gcmVxdWlyZSgnLi9wZWVrLmpzJyksXG4gIHBva2UgPSByZXF1aXJlKCcuL3Bva2UuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkYXRhJyxcbiAgZ2xvYmFsczoge30sXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpZHhcbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBsZXQgdWdlbiA9IHRoaXNcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUgKSBcbiAgICAgIGlkeCA9IHRoaXMubWVtb3J5LnZhbHVlcy5pZHhcbiAgICAgIHRyeSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcC5zZXQoIHRoaXMuYnVmZmVyLCBpZHggKVxuICAgICAgfWNhdGNoKCBlICkge1xuICAgICAgICBjb25zb2xlLmxvZyggZSApXG4gICAgICAgIHRocm93IEVycm9yKCAnZXJyb3Igd2l0aCByZXF1ZXN0LiBhc2tpbmcgZm9yICcgKyB0aGlzLmJ1ZmZlci5sZW5ndGggKycuIGN1cnJlbnQgaW5kZXg6ICcgKyBnZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBnZW4ubWVtb3J5LmhlYXAubGVuZ3RoIClcbiAgICAgIH1cbiAgICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gdGhpc1xuICAgICAgLy9yZXR1cm4gJ2dlbi5tZW1vcnknICsgdGhpcy5uYW1lICsgJy5idWZmZXInXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpZHhcbiAgICB9ZWxzZXtcbiAgICAgIGlkeCA9IGdlbi5tZW1vWyB0aGlzLm5hbWUgXVxuICAgIH1cbiAgICByZXR1cm4gaWR4XG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCB5PTEsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuLCBidWZmZXIsIHNob3VsZExvYWQgPSBmYWxzZVxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXSApIHtcbiAgICAgIHJldHVybiBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXVxuICAgIH1cbiAgfVxuXG4gIGlmKCB0eXBlb2YgeCA9PT0gJ251bWJlcicgKSB7XG4gICAgaWYoIHkgIT09IDEgKSB7XG4gICAgICBidWZmZXIgPSBbXVxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB5OyBpKysgKSB7XG4gICAgICAgIGJ1ZmZlclsgaSBdID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCB4IClcbiAgICB9XG4gIH1lbHNlIGlmKCBBcnJheS5pc0FycmF5KCB4ICkgKSB7IC8vISAoeCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSApICkge1xuICAgIGxldCBzaXplID0geC5sZW5ndGhcbiAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBzaXplIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHgubGVuZ3RoOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IHhbIGkgXVxuICAgIH1cbiAgfWVsc2UgaWYoIHR5cGVvZiB4ID09PSAnc3RyaW5nJyApIHtcbiAgICBidWZmZXIgPSB7IGxlbmd0aDogeSA+IDEgPyB5IDogZ2VuLnNhbXBsZXJhdGUgKiA2MCB9IC8vIFhYWCB3aGF0Pz8/XG4gICAgc2hvdWxkTG9hZCA9IHRydWVcbiAgfWVsc2UgaWYoIHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSB7XG4gICAgYnVmZmVyID0geFxuICB9XG4gIFxuICB1Z2VuID0geyBcbiAgICBidWZmZXIsXG4gICAgbmFtZTogcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKCksXG4gICAgZGltOiAgYnVmZmVyLmxlbmd0aCwgLy8gWFhYIGhvdyBkbyB3ZSBkeW5hbWljYWxseSBhbGxvY2F0ZSB0aGlzP1xuICAgIGNoYW5uZWxzIDogMSxcbiAgICBnZW46ICBwcm90by5nZW4sXG4gICAgb25sb2FkOiBudWxsLFxuICAgIHRoZW4oIGZuYyApIHtcbiAgICAgIHVnZW4ub25sb2FkID0gZm5jXG4gICAgICByZXR1cm4gdWdlblxuICAgIH0sXG4gICAgaW1tdXRhYmxlOiBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5pbW11dGFibGUgPT09IHRydWUgPyB0cnVlIDogZmFsc2UsXG4gICAgbG9hZCggZmlsZW5hbWUgKSB7XG4gICAgICBsZXQgcHJvbWlzZSA9IHV0aWxpdGllcy5sb2FkU2FtcGxlKCBmaWxlbmFtZSwgdWdlbiApXG4gICAgICBwcm9taXNlLnRoZW4oICggX2J1ZmZlciApPT4geyBcbiAgICAgICAgdWdlbi5tZW1vcnkudmFsdWVzLmxlbmd0aCA9IHVnZW4uZGltID0gX2J1ZmZlci5sZW5ndGggICAgIFxuICAgICAgICB1Z2VuLm9ubG9hZCgpIFxuICAgICAgfSlcbiAgICB9LFxuICB9XG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWVzOiB7IGxlbmd0aDp1Z2VuLmRpbSwgaWR4Om51bGwgfVxuICB9XG5cbiAgZ2VuLm5hbWUgPSAnZGF0YScgKyBnZW4uZ2V0VUlEKClcblxuICBpZiggc2hvdWxkTG9hZCApIHVnZW4ubG9hZCggeCApXG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF0gPSB1Z2VuXG4gICAgfVxuICAgIGlmKCBwcm9wZXJ0aWVzLm1ldGEgPT09IHRydWUgKSB7XG4gICAgICBmb3IoIGxldCBpID0gMCwgbGVuZ3RoID0gdWdlbi5idWZmZXIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgaSwge1xuICAgICAgICAgIGdldCAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGVlayggdWdlbiwgaSwgeyBtb2RlOidzaW1wbGUnLCBpbnRlcnA6J25vbmUnIH0gKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgICAgcmV0dXJuIHBva2UoIHVnZW4sIHYsIGkgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB4MSA9IGhpc3RvcnkoKSxcbiAgICAgIHkxID0gaGlzdG9yeSgpLFxuICAgICAgZmlsdGVyXG5cbiAgLy9IaXN0b3J5IHgxLCB5MTsgeSA9IGluMSAtIHgxICsgeTEqMC45OTk3OyB4MSA9IGluMTsgeTEgPSB5OyBvdXQxID0geTtcbiAgZmlsdGVyID0gbWVtbyggYWRkKCBzdWIoIGluMSwgeDEub3V0ICksIG11bCggeTEub3V0LCAuOTk5NyApICkgKVxuICB4MS5pbiggaW4xIClcbiAgeTEuaW4oIGZpbHRlciApXG5cbiAgcmV0dXJuIGZpbHRlclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgdDYwICAgICA9IHJlcXVpcmUoICcuL3Q2MC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGVjYXlUaW1lID0gNDQxMDAsIHByb3BzICkgPT4ge1xuICBsZXQgcHJvcGVydGllcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgaW5pdFZhbHVlOjEgfSwgcHJvcHMgKSxcbiAgICAgIHNzZCA9IGhpc3RvcnkgKCBwcm9wZXJ0aWVzLmluaXRWYWx1ZSApXG5cbiAgc3NkLmluKCBtdWwoIHNzZC5vdXQsIHQ2MCggZGVjYXlUaW1lICkgKSApXG5cbiAgc3NkLm91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc3NkLnZhbHVlID0gMVxuICB9XG5cbiAgcmV0dXJuIHNzZC5vdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBva2UgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIHN1YiAgPSByZXF1aXJlKCAnLi9zdWIuanMnICApLFxuICAgIHdyYXAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9hY2N1bS5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RlbGF5JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlucHV0c1swXVxuICAgIFxuICAgIHJldHVybiBpbnB1dHNbMF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgdGltZT0yNTYsIC4uLnRhcHNBbmRQcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgc2l6ZTogNTEyLCBmZWVkYmFjazowLCBpbnRlcnA6J2xpbmVhcicgfSxcbiAgICAgIHdyaXRlSWR4LCByZWFkSWR4LCBkZWxheWRhdGEsIHByb3BlcnRpZXMsIHRhcFRpbWVzID0gWyB0aW1lIF0sIHRhcHNcbiAgXG4gIGlmKCBBcnJheS5pc0FycmF5KCB0YXBzQW5kUHJvcGVydGllcyApICkge1xuICAgIHByb3BlcnRpZXMgPSB0YXBzQW5kUHJvcGVydGllc1sgdGFwc0FuZFByb3BlcnRpZXMubGVuZ3RoIC0gMSBdXG4gICAgaWYoIHRhcHNBbmRQcm9wZXJ0aWVzLmxlbmd0aCA+IDEgKSB7XG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHRhcHNBbmRQcm9wZXJ0aWVzLmxlbmd0aCAtIDE7IGkrKyApe1xuICAgICAgICB0YXBUaW1lcy5wdXNoKCB0YXBzQW5kUHJvcGVydGllc1sgaSBdIClcbiAgICAgIH1cbiAgICB9XG4gIH1lbHNle1xuICAgIHByb3BlcnRpZXMgPSB0YXBzQW5kUHJvcGVydGllc1xuICB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBpZiggZGVmYXVsdHMuc2l6ZSA8IHRpbWUgKSBkZWZhdWx0cy5zaXplID0gdGltZVxuXG4gIGRlbGF5ZGF0YSA9IGRhdGEoIGRlZmF1bHRzLnNpemUgKVxuICBcbiAgdWdlbi5pbnB1dHMgPSBbXVxuXG4gIHdyaXRlSWR4ID0gYWNjdW0oIDEsIDAsIHsgbWF4OmRlZmF1bHRzLnNpemUgfSkgXG4gIFxuICBmb3IoIGxldCBpID0gMDsgaSA8IHRhcFRpbWVzLmxlbmd0aDsgaSsrICkge1xuICAgIHVnZW4uaW5wdXRzWyBpIF0gPSBwZWVrKCBkZWxheWRhdGEsIHdyYXAoIHN1Yiggd3JpdGVJZHgsIHRhcFRpbWVzW2ldICksIDAsIGRlZmF1bHRzLnNpemUgKSx7IG1vZGU6J3NhbXBsZXMnLCBpbnRlcnA6ZGVmYXVsdHMuaW50ZXJwIH0pXG4gIH1cbiAgXG4gIHVnZW4ub3V0cHV0cyA9IHVnZW4uaW5wdXRzIC8vIHVnbiwgVWdoLCBVR0ghIGJ1dCBpIGd1ZXNzIGl0IHdvcmtzLlxuXG4gIHBva2UoIGRlbGF5ZGF0YSwgaW4xLCB3cml0ZUlkeCApXG5cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke2dlbi5nZXRVSUQoKX1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCBuMSA9IGhpc3RvcnkoKVxuICAgIFxuICBuMS5pbiggaW4xIClcblxuICBsZXQgdWdlbiA9IHN1YiggaW4xLCBuMS5vdXQgKVxuICB1Z2VuLm5hbWUgPSAnZGVsdGEnK2dlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgZGl2ID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgZGl2QXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAvIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLyAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLyAnIFxuICAgICAgfSlcblxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gZGl2XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4nICksXG4gICAgd2luZG93cyA9IHJlcXVpcmUoICcuL3dpbmRvd3MnICksXG4gICAgZGF0YSAgICA9IHJlcXVpcmUoICcuL2RhdGEnICksXG4gICAgcGVlayAgICA9IHJlcXVpcmUoICcuL3BlZWsnICksXG4gICAgcGhhc29yICA9IHJlcXVpcmUoICcuL3BoYXNvcicgKSxcbiAgICBkZWZhdWx0cyA9IHtcbiAgICAgIHR5cGU6J3RyaWFuZ3VsYXInLCBsZW5ndGg6MTAyNCwgYWxwaGE6LjE1LCBzaGlmdDowIFxuICAgIH1cblxubW9kdWxlLmV4cG9ydHMgPSBwcm9wcyA9PiB7XG4gIGxldCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBwcm9wcyApXG4gIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBwcm9wZXJ0aWVzLmxlbmd0aCApXG5cbiAgbGV0IG5hbWUgPSBwcm9wZXJ0aWVzLnR5cGUgKyAnXycgKyBwcm9wZXJ0aWVzLmxlbmd0aCArICdfJyArIHByb3BlcnRpZXMuc2hpZnRcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gPT09ICd1bmRlZmluZWQnICkgeyBcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gd2luZG93c1sgcHJvcGVydGllcy50eXBlIF0oIHByb3BlcnRpZXMubGVuZ3RoLCBpLCBwcm9wZXJ0aWVzLmFscGhhLCBwcm9wZXJ0aWVzLnNoaWZ0IClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gPSBkYXRhKCBidWZmZXIgKVxuICB9XG5cbiAgbGV0IHVnZW4gPSBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gXG4gIHVnZW4ubmFtZSA9ICdlbnYnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2VxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSB0aGlzLmlucHV0c1swXSA9PT0gdGhpcy5pbnB1dHNbMV0gPyAxIDogYCAgdmFyICR7dGhpcy5uYW1lfSA9ICgke2lucHV0c1swXX0gPT09ICR7aW5wdXRzWzFdfSkgfCAwXFxuXFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1gLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2Zsb29yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgLy9nZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5mbG9vciB9KVxuXG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gfCAwIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdIHwgMFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGZsb29yID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGZsb29yLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGZsb29yXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2ZvbGQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9IHRoaXMuY3JlYXRlQ2FsbGJhY2soIGlucHV0c1swXSwgdGhpcy5taW4sIHRoaXMubWF4ICkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dCBdXG4gIH0sXG5cbiAgY3JlYXRlQ2FsbGJhY2soIHYsIGxvLCBoaSApIHtcbiAgICBsZXQgb3V0ID1cbmAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dn0sXG4gICAgICAke3RoaXMubmFtZX1fcmFuZ2UgPSAke2hpfSAtICR7bG99LFxuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gMFxuXG4gIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcysrXG4gIH0gZWxzZSBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlICs9ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA8ICR7bG99KXtcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9ICgoJHt0aGlzLm5hbWV9X3ZhbHVlIC0gJHtsb30pIC8gJHt0aGlzLm5hbWV9X3JhbmdlLSAxKSB8IDBcbiAgICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2UgKiAke3RoaXMubmFtZX1fbnVtV3JhcHNcbiAgICB9XG4gICAgJHt0aGlzLm5hbWV9X251bVdyYXBzLS1cbiAgfVxuICBpZigke3RoaXMubmFtZX1fbnVtV3JhcHMgJiAxKSAke3RoaXMubmFtZX1fdmFsdWUgPSAke2hpfSArICR7bG99IC0gJHt0aGlzLm5hbWV9X3ZhbHVlXG5gXG4gICAgcmV0dXJuICcgJyArIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidnYXRlJyxcbiAgY29udHJvbFN0cmluZzpudWxsLCAvLyBpbnNlcnQgaW50byBvdXRwdXQgY29kZWdlbiBmb3IgZGV0ZXJtaW5pbmcgaW5kZXhpbmdcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuICAgIFxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgbGV0IGxhc3RJbnB1dE1lbW9yeUlkeCA9ICdtZW1vcnlbICcgKyB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgJyBdJyxcbiAgICAgICAgb3V0cHV0TWVtb3J5U3RhcnRJZHggPSB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgMSxcbiAgICAgICAgaW5wdXRTaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIGNvbnRyb2xTaWduYWwgPSBpbnB1dHNbMV1cbiAgICBcbiAgICAvKiBcbiAgICAgKiB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgY29udHJvbCBpbnB1dHMgZXF1YWxzIG91ciBsYXN0IGlucHV0XG4gICAgICogaWYgc28sIHdlIHN0b3JlIHRoZSBzaWduYWwgaW5wdXQgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnRseVxuICAgICAqIHNlbGVjdGVkIGluZGV4LiBJZiBub3QsIHdlIHB1dCAwIGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBsYXN0IHNlbGVjdGVkIGluZGV4LFxuICAgICAqIGNoYW5nZSB0aGUgc2VsZWN0ZWQgaW5kZXgsIGFuZCB0aGVuIHN0b3JlIHRoZSBzaWduYWwgaW4gcHV0IGluIHRoZSBtZW1lcnkgYXNzb2ljYXRlZFxuICAgICAqIHdpdGggdGhlIG5ld2x5IHNlbGVjdGVkIGluZGV4XG4gICAgICovXG4gICAgXG4gICAgb3V0ID1cblxuYCBpZiggJHtjb250cm9sU2lnbmFsfSAhPT0gJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICkge1xuICAgIG1lbW9yeVsgJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICsgJHtvdXRwdXRNZW1vcnlTdGFydElkeH0gIF0gPSAwIFxuICAgICR7bGFzdElucHV0TWVtb3J5SWR4fSA9ICR7Y29udHJvbFNpZ25hbH1cbiAgfVxuICBtZW1vcnlbICR7b3V0cHV0TWVtb3J5U3RhcnRJZHh9ICsgJHtjb250cm9sU2lnbmFsfSBdID0gJHtpbnB1dFNpZ25hbH1cblxuYFxuICAgIHRoaXMuY29udHJvbFN0cmluZyA9IGlucHV0c1sxXVxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHRoaXMub3V0cHV0cy5mb3JFYWNoKCB2ID0+IHYuZ2VuKCkgKVxuXG4gICAgcmV0dXJuIFsgbnVsbCwgJyAnICsgb3V0IF1cbiAgfSxcblxuICBjaGlsZGdlbigpIHtcbiAgICBpZiggdGhpcy5wYXJlbnQuaW5pdGlhbGl6ZWQgPT09IGZhbHNlICkge1xuICAgICAgZ2VuLmdldElucHV0cyggdGhpcyApIC8vIHBhcmVudCBnYXRlIGlzIG9ubHkgaW5wdXQgb2YgYSBnYXRlIG91dHB1dCwgc2hvdWxkIG9ubHkgYmUgZ2VuJ2Qgb25jZS5cbiAgICB9XG5cbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuICBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggY29udHJvbCwgaW4xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY291bnQ6IDIgfVxuXG4gIGlmKCB0eXBlb2YgcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICBvdXRwdXRzOiBbXSxcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGNvbnRyb2wgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGxhc3RJbnB1dDogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgIH0sXG4gICAgaW5pdGlhbGl6ZWQ6ZmFsc2VcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke2dlbi5nZXRVSUQoKX1gXG5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB1Z2VuLmNvdW50OyBpKysgKSB7XG4gICAgdWdlbi5vdXRwdXRzLnB1c2goe1xuICAgICAgaW5kZXg6aSxcbiAgICAgIGdlbjogcHJvdG8uY2hpbGRnZW4sXG4gICAgICBwYXJlbnQ6dWdlbixcbiAgICAgIGlucHV0czogWyB1Z2VuIF0sXG4gICAgICBtZW1vcnk6IHtcbiAgICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplZDpmYWxzZSxcbiAgICAgIG5hbWU6IGAke3VnZW4ubmFtZX1fb3V0JHtnZW4uZ2V0VUlEKCl9YFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGdlbi5qc1xuICpcbiAqIGxvdy1sZXZlbCBjb2RlIGdlbmVyYXRpb24gZm9yIHVuaXQgZ2VuZXJhdG9yc1xuICpcbiAqL1xuXG5sZXQgTWVtb3J5SGVscGVyID0gcmVxdWlyZSggJ21lbW9yeS1oZWxwZXInIClcblxubGV0IGdlbiA9IHtcblxuICBhY2N1bTowLFxuICBnZXRVSUQoKSB7IHJldHVybiB0aGlzLmFjY3VtKysgfSxcbiAgZGVidWc6ZmFsc2UsXG4gIHNhbXBsZXJhdGU6IDQ0MTAwLCAvLyBjaGFuZ2Ugb24gYXVkaW9jb250ZXh0IGNyZWF0aW9uXG4gIHNob3VsZExvY2FsaXplOiBmYWxzZSxcbiAgZ2xvYmFsczp7XG4gICAgd2luZG93czoge30sXG4gIH0sXG4gIFxuICAvKiBjbG9zdXJlc1xuICAgKlxuICAgKiBGdW5jdGlvbnMgdGhhdCBhcmUgaW5jbHVkZWQgYXMgYXJndW1lbnRzIHRvIG1hc3RlciBjYWxsYmFjay4gRXhhbXBsZXM6IE1hdGguYWJzLCBNYXRoLnJhbmRvbSBldGMuXG4gICAqIFhYWCBTaG91bGQgcHJvYmFibHkgYmUgcmVuYW1lZCBjYWxsYmFja1Byb3BlcnRpZXMgb3Igc29tZXRoaW5nIHNpbWlsYXIuLi4gY2xvc3VyZXMgYXJlIG5vIGxvbmdlciB1c2VkLlxuICAgKi9cblxuICBjbG9zdXJlczogbmV3IFNldCgpLFxuICBwYXJhbXM6ICAgbmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6W10sXG4gIGVuZEJsb2NrOiBuZXcgU2V0KCksXG4gIGhpc3RvcmllczogbmV3IE1hcCgpLFxuXG4gIG1lbW86IHt9LFxuXG4gIGRhdGE6IHt9LFxuICBcbiAgLyogZXhwb3J0XG4gICAqXG4gICAqIHBsYWNlIGdlbiBmdW5jdGlvbnMgaW50byBhbm90aGVyIG9iamVjdCBmb3IgZWFzaWVyIHJlZmVyZW5jZVxuICAgKi9cblxuICBleHBvcnQoIG9iaiApIHt9LFxuXG4gIGFkZFRvRW5kQmxvY2soIHYgKSB7XG4gICAgdGhpcy5lbmRCbG9jay5hZGQoICcgICcgKyB2IClcbiAgfSxcbiAgXG4gIHJlcXVlc3RNZW1vcnkoIG1lbW9yeVNwZWMsIGltbXV0YWJsZT1mYWxzZSApIHtcbiAgICBmb3IoIGxldCBrZXkgaW4gbWVtb3J5U3BlYyApIHtcbiAgICAgIGxldCByZXF1ZXN0ID0gbWVtb3J5U3BlY1sga2V5IF1cblxuICAgICAgcmVxdWVzdC5pZHggPSBnZW4ubWVtb3J5LmFsbG9jKCByZXF1ZXN0Lmxlbmd0aCwgaW1tdXRhYmxlIClcbiAgICB9XG4gIH0sXG5cbiAgLyogY3JlYXRlQ2FsbGJhY2tcbiAgICpcbiAgICogcGFyYW0gdWdlbiAtIEhlYWQgb2YgZ3JhcGggdG8gYmUgY29kZWdlbidkXG4gICAqXG4gICAqIEdlbmVyYXRlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBhIHBhcnRpY3VsYXIgdWdlbiBncmFwaC5cbiAgICogVGhlIGdlbi5jbG9zdXJlcyBwcm9wZXJ0eSBzdG9yZXMgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZVxuICAgKiBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBmaW5hbCBmdW5jdGlvbjsgdGhlc2UgYXJlIHByZWZpeGVkXG4gICAqIGJlZm9yZSBhbnkgZGVmaW5lZCBwYXJhbXMgdGhlIGdyYXBoIGV4cG9zZXMuIEZvciBleGFtcGxlLCBnaXZlbjpcbiAgICpcbiAgICogZ2VuLmNyZWF0ZUNhbGxiYWNrKCBhYnMoIHBhcmFtKCkgKSApXG4gICAqXG4gICAqIC4uLiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHdpbGwgaGF2ZSBhIHNpZ25hdHVyZSBvZiAoIGFicywgcDAgKS5cbiAgICovXG4gIFxuICBjcmVhdGVDYWxsYmFjayggdWdlbiwgbWVtLCBkZWJ1ZyA9IGZhbHNlLCBzaG91bGRJbmxpbmVNZW1vcnk9ZmFsc2UgKSB7XG4gICAgbGV0IGlzU3RlcmVvID0gQXJyYXkuaXNBcnJheSggdWdlbiApICYmIHVnZW4ubGVuZ3RoID4gMSxcbiAgICAgICAgY2FsbGJhY2ssIFxuICAgICAgICBjaGFubmVsMSwgY2hhbm5lbDJcblxuICAgIGlmKCB0eXBlb2YgbWVtID09PSAnbnVtYmVyJyB8fCBtZW0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIG1lbSApXG4gICAgfVxuICAgIFxuICAgIC8vY29uc29sZS5sb2coICdjYiBtZW1vcnk6JywgbWVtIClcbiAgICB0aGlzLm1lbW9yeSA9IG1lbVxuICAgIHRoaXMubWVtbyA9IHt9IFxuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMucGFyYW1zLmNsZWFyKClcbiAgICAvL3RoaXMuZ2xvYmFscyA9IHsgd2luZG93czp7fSB9XG4gICAgXG4gICAgdGhpcy5wYXJhbWV0ZXJzLmxlbmd0aCA9IDBcbiAgICBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiICAndXNlIHN0cmljdCdcXG5cIlxuICAgIGlmKCBzaG91bGRJbmxpbmVNZW1vcnk9PT1mYWxzZSApIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IFwiICB2YXIgbWVtb3J5ID0gZ2VuLm1lbW9yeVxcblxcblwiIFxuXG4gICAgLy8gY2FsbCAuZ2VuKCkgb24gdGhlIGhlYWQgb2YgdGhlIGdyYXBoIHdlIGFyZSBnZW5lcmF0aW5nIHRoZSBjYWxsYmFjayBmb3JcbiAgICAvL2NvbnNvbGUubG9nKCAnSEVBRCcsIHVnZW4gKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMSArIGlzU3RlcmVvOyBpKysgKSB7XG4gICAgICBpZiggdHlwZW9mIHVnZW5baV0gPT09ICdudW1iZXInICkgY29udGludWVcblxuICAgICAgbGV0IGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHVnZW5baV0uZ2VuKCkgOiB1Z2VuLmdlbigpLFxuICAgICAgICAgIGJvZHkgPSAnJ1xuXG4gICAgICAvLyBpZiAuZ2VuKCkgcmV0dXJucyBhcnJheSwgYWRkIHVnZW4gY2FsbGJhY2sgKGdyYXBoT3V0cHV0WzFdKSB0byBvdXIgb3V0cHV0IGZ1bmN0aW9ucyBib2R5XG4gICAgICAvLyBhbmQgdGhlbiByZXR1cm4gbmFtZSBvZiB1Z2VuLiBJZiAuZ2VuKCkgb25seSBnZW5lcmF0ZXMgYSBudW1iZXIgKGZvciByZWFsbHkgc2ltcGxlIGdyYXBocylcbiAgICAgIC8vIGp1c3QgcmV0dXJuIHRoYXQgbnVtYmVyIChncmFwaE91dHB1dFswXSkuXG4gICAgICBib2R5ICs9IEFycmF5LmlzQXJyYXkoIGNoYW5uZWwgKSA/IGNoYW5uZWxbMV0gKyAnXFxuJyArIGNoYW5uZWxbMF0gOiBjaGFubmVsXG5cbiAgICAgIC8vIHNwbGl0IGJvZHkgdG8gaW5qZWN0IHJldHVybiBrZXl3b3JkIG9uIGxhc3QgbGluZVxuICAgICAgYm9keSA9IGJvZHkuc3BsaXQoJ1xcbicpXG4gICAgIFxuICAgICAgLy9pZiggZGVidWcgKSBjb25zb2xlLmxvZyggJ2Z1bmN0aW9uQm9keSBsZW5ndGgnLCBib2R5IClcbiAgICAgIFxuICAgICAgLy8gbmV4dCBsaW5lIGlzIHRvIGFjY29tbW9kYXRlIG1lbW8gYXMgZ3JhcGggaGVhZFxuICAgICAgaWYoIGJvZHlbIGJvZHkubGVuZ3RoIC0xIF0udHJpbSgpLmluZGV4T2YoJ2xldCcpID4gLTEgKSB7IGJvZHkucHVzaCggJ1xcbicgKSB9IFxuXG4gICAgICAvLyBnZXQgaW5kZXggb2YgbGFzdCBsaW5lXG4gICAgICBsZXQgbGFzdGlkeCA9IGJvZHkubGVuZ3RoIC0gMVxuXG4gICAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICAgIGJvZHlbIGxhc3RpZHggXSA9ICcgIGdlbi5vdXRbJyArIGkgKyAnXSAgPSAnICsgYm9keVsgbGFzdGlkeCBdICsgJ1xcbidcblxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gYm9keS5qb2luKCdcXG4nKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLmhpc3Rvcmllcy5mb3JFYWNoKCB2YWx1ZSA9PiB7XG4gICAgICBpZiggdmFsdWUgIT09IG51bGwgKVxuICAgICAgICB2YWx1ZS5nZW4oKSAgICAgIFxuICAgIH0pXG5cbiAgICBsZXQgcmV0dXJuU3RhdGVtZW50ID0gaXNTdGVyZW8gPyAnICByZXR1cm4gZ2VuLm91dCcgOiAnICByZXR1cm4gZ2VuLm91dFswXSdcbiAgICBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LnNwbGl0KCdcXG4nKVxuXG4gICAgaWYoIHRoaXMuZW5kQmxvY2suc2l6ZSApIHsgXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmNvbmNhdCggQXJyYXkuZnJvbSggdGhpcy5lbmRCbG9jayApIClcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2goIHJldHVyblN0YXRlbWVudCApXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCByZXR1cm5TdGF0ZW1lbnQgKVxuICAgIH1cbiAgICAvLyByZWFzc2VtYmxlIGZ1bmN0aW9uIGJvZHlcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IHRoaXMuZnVuY3Rpb25Cb2R5LmpvaW4oJ1xcbicpXG5cbiAgICAvLyB3ZSBjYW4gb25seSBkeW5hbWljYWxseSBjcmVhdGUgYSBuYW1lZCBmdW5jdGlvbiBieSBkeW5hbWljYWxseSBjcmVhdGluZyBhbm90aGVyIGZ1bmN0aW9uXG4gICAgLy8gdG8gY29uc3RydWN0IHRoZSBuYW1lZCBmdW5jdGlvbiEgc2hlZXNoLi4uXG4gICAgLy9cbiAgICBpZiggc2hvdWxkSW5saW5lTWVtb3J5ID09PSB0cnVlICkge1xuICAgICAgdGhpcy5wYXJhbWV0ZXJzLnB1c2goICdtZW1vcnknIClcbiAgICB9XG4gICAgbGV0IGJ1aWxkU3RyaW5nID0gYHJldHVybiBmdW5jdGlvbiBnZW4oICR7IHRoaXMucGFyYW1ldGVycy5qb2luKCcsJykgfSApeyBcXG4keyB0aGlzLmZ1bmN0aW9uQm9keSB9XFxufWBcbiAgICBcbiAgICBpZiggdGhpcy5kZWJ1ZyB8fCBkZWJ1ZyApIGNvbnNvbGUubG9nKCBidWlsZFN0cmluZyApIFxuXG4gICAgY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oIGJ1aWxkU3RyaW5nICkoKVxuXG4gICAgXG4gICAgLy8gYXNzaWduIHByb3BlcnRpZXMgdG8gbmFtZWQgZnVuY3Rpb25cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMuY2xvc3VyZXMudmFsdWVzKCkgKSB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdmFsdWUgPSBkaWN0WyBuYW1lIF1cblxuICAgICAgY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgZm9yKCBsZXQgZGljdCBvZiB0aGlzLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB1Z2VuID0gZGljdFsgbmFtZSBdXG4gICAgICBcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggY2FsbGJhY2ssIG5hbWUsIHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQoKSB7IHJldHVybiB1Z2VuLnZhbHVlIH0sXG4gICAgICAgIHNldCh2KXsgdWdlbi52YWx1ZSA9IHYgfVxuICAgICAgfSlcbiAgICAgIC8vY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YVxuICAgIGNhbGxiYWNrLm91dCAgPSBuZXcgRmxvYXQzMkFycmF5KCAyIClcbiAgICBjYWxsYmFjay5wYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJzLnNsaWNlKCAwIClcblxuICAgIC8vaWYoIE1lbW9yeUhlbHBlci5pc1Byb3RvdHlwZU9mKCB0aGlzLm1lbW9yeSApICkgXG4gICAgY2FsbGJhY2subWVtb3J5ID0gdGhpcy5tZW1vcnkuaGVhcFxuXG4gICAgdGhpcy5oaXN0b3JpZXMuY2xlYXIoKVxuXG4gICAgcmV0dXJuIGNhbGxiYWNrXG4gIH0sXG4gIFxuICAvKiBnZXRJbnB1dHNcbiAgICpcbiAgICogR2l2ZW4gYW4gYXJndW1lbnQgdWdlbiwgZXh0cmFjdCBpdHMgaW5wdXRzLiBJZiB0aGV5IGFyZSBudW1iZXJzLCByZXR1cm4gdGhlIG51bWVicnMuIElmXG4gICAqIHRoZXkgYXJlIHVnZW5zLCBjYWxsIC5nZW4oKSBvbiB0aGUgdWdlbiwgbWVtb2l6ZSB0aGUgcmVzdWx0IGFuZCByZXR1cm4gdGhlIHJlc3VsdC4gSWYgdGhlXG4gICAqIHVnZW4gaGFzIHByZXZpb3VzbHkgYmVlbiBtZW1vaXplZCByZXR1cm4gdGhlIG1lbW9pemVkIHZhbHVlLlxuICAgKlxuICAgKi9cbiAgZ2V0SW5wdXRzKCB1Z2VuICkge1xuICAgIHJldHVybiB1Z2VuLmlucHV0cy5tYXAoIGdlbi5nZXRJbnB1dCApIFxuICB9LFxuXG4gIGdldElucHV0KCBpbnB1dCApIHtcbiAgICBsZXQgaXNPYmplY3QgPSB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnLFxuICAgICAgICBwcm9jZXNzZWRJbnB1dFxuXG4gICAgaWYoIGlzT2JqZWN0ICkgeyAvLyBpZiBpbnB1dCBpcyBhIHVnZW4uLi4gXG4gICAgICBpZiggZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApIHsgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBnZW4ubWVtb1sgaW5wdXQubmFtZSBdXG4gICAgICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaW5wdXQgKSApIHtcbiAgICAgICAgZ2VuLmdldElucHV0KCBpbnB1dFswXSApXG4gICAgICAgIGdlbi5nZXRJbnB1dCggaW5wdXRbMV0gKVxuICAgICAgfWVsc2V7IC8vIGlmIG5vdCBtZW1vaXplZCBnZW5lcmF0ZSBjb2RlICBcbiAgICAgICAgaWYoIHR5cGVvZiBpbnB1dC5nZW4gIT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coICdubyBnZW4gZm91bmQ6JywgaW5wdXQsIGlucHV0LmdlbiApXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNvZGUgPSBpbnB1dC5nZW4oKVxuICAgICAgICAvL2lmKCBjb2RlLmluZGV4T2YoICdPYmplY3QnICkgPiAtMSApIGNvbnNvbGUubG9nKCAnYmFkIGlucHV0OicsIGlucHV0LCBjb2RlIClcbiAgICAgICAgXG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBjb2RlICkgKSB7XG4gICAgICAgICAgaWYoICFnZW4uc2hvdWxkTG9jYWxpemUgKSB7XG4gICAgICAgICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IGNvZGVbMV1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGdlbi5jb2RlTmFtZSA9IGNvZGVbMF1cbiAgICAgICAgICAgIGdlbi5sb2NhbGl6ZWRDb2RlLnB1c2goIGNvZGVbMV0gKVxuICAgICAgICAgIH1cbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCAnYWZ0ZXIgR0VOJyAsIHRoaXMuZnVuY3Rpb25Cb2R5IClcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVbMF1cbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ZWxzZXsgLy8gaXQgaW5wdXQgaXMgYSBudW1iZXJcbiAgICAgIHByb2Nlc3NlZElucHV0ID0gaW5wdXRcbiAgICB9XG5cbiAgICByZXR1cm4gcHJvY2Vzc2VkSW5wdXRcbiAgfSxcblxuICBzdGFydExvY2FsaXplKCkge1xuICAgIHRoaXMubG9jYWxpemVkQ29kZSA9IFtdXG4gICAgdGhpcy5zaG91bGRMb2NhbGl6ZSA9IHRydWVcbiAgfSxcbiAgZW5kTG9jYWxpemUoKSB7XG4gICAgdGhpcy5zaG91bGRMb2NhbGl6ZSA9IGZhbHNlXG5cbiAgICByZXR1cm4gWyB0aGlzLmNvZGVOYW1lLCB0aGlzLmxvY2FsaXplZENvZGUuc2xpY2UoMCkgXVxuICB9LFxuXG4gIGZyZWUoIGdyYXBoICkge1xuICAgIGlmKCBBcnJheS5pc0FycmF5KCBncmFwaCApICkgeyAvLyBzdGVyZW8gdWdlblxuICAgICAgZm9yKCBsZXQgY2hhbm5lbCBvZiBncmFwaCApIHtcbiAgICAgICAgdGhpcy5mcmVlKCBjaGFubmVsIClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBncmFwaCA9PT0gJ29iamVjdCcgKSB7XG4gICAgICAgIGlmKCBncmFwaC5tZW1vcnkgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICBmb3IoIGxldCBtZW1vcnlLZXkgaW4gZ3JhcGgubWVtb3J5ICkge1xuICAgICAgICAgICAgdGhpcy5tZW1vcnkuZnJlZSggZ3JhcGgubWVtb3J5WyBtZW1vcnlLZXkgXS5pZHggKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggZ3JhcGguaW5wdXRzICkgKSB7XG4gICAgICAgICAgZm9yKCBsZXQgdWdlbiBvZiBncmFwaC5pbnB1dHMgKSB7XG4gICAgICAgICAgICB0aGlzLmZyZWUoIHVnZW4gKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdlblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0pIHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID4gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3QuaW5wdXRzID0gWyB4LHkgXVxuICBndC5uYW1lID0gJ2d0JytnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPj0gJHtpbnB1dHNbMV19IHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID49IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cbiAgZ3QubmFtZSA9ICdndGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCAoICR7aW5wdXRzWzBdfSA+ICR7aW5wdXRzWzFdfSApIHwgMCApIClgIFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoICggaW5wdXRzWzBdID4gaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3RwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGd0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xPTAgKSA9PiB7XG4gIGxldCB1Z2VuID0ge1xuICAgIGlucHV0czogWyBpbjEgXSxcbiAgICBtZW1vcnk6IHsgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IH0sXG4gICAgcmVjb3JkZXI6IG51bGwsXG5cbiAgICBpbiggdiApIHtcbiAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmhhcyggdiApICl7XG4gICAgICAgIGxldCBtZW1vSGlzdG9yeSA9IGdlbi5oaXN0b3JpZXMuZ2V0KCB2IClcbiAgICAgICAgdWdlbi5uYW1lID0gbWVtb0hpc3RvcnkubmFtZVxuICAgICAgICByZXR1cm4gbWVtb0hpc3RvcnlcbiAgICAgIH1cblxuICAgICAgbGV0IG9iaiA9IHtcbiAgICAgICAgZ2VuKCkge1xuICAgICAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB1Z2VuIClcblxuICAgICAgICAgIGlmKCB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IGluMVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHhcbiAgICAgICAgICBcbiAgICAgICAgICBnZW4uYWRkVG9FbmRCbG9jayggJ21lbW9yeVsgJyArIGlkeCArICcgXSA9ICcgKyBpbnB1dHNbIDAgXSApXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICBnZW4uaGlzdG9yaWVzLnNldCggdiwgb2JqIClcblxuICAgICAgICAgIHJldHVybiBpbnB1dHNbIDAgXVxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX2luJytnZW4uZ2V0VUlEKCksXG4gICAgICAgIG1lbW9yeTogdWdlbi5tZW1vcnlcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnB1dHNbIDAgXSA9IHZcbiAgICAgIFxuICAgICAgdWdlbi5yZWNvcmRlciA9IG9ialxuXG4gICAgICByZXR1cm4gb2JqXG4gICAgfSxcbiAgICBcbiAgICBvdXQ6IHtcbiAgICAgICAgICAgIFxuICAgICAgZ2VuKCkge1xuICAgICAgICBpZiggdWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmdldCggdWdlbi5pbnB1dHNbMF0gKSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4uaW5wdXRzWzBdLCB1Z2VuLnJlY29yZGVyIClcbiAgICAgICAgICB9XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gcGFyc2VGbG9hdCggaW4xIClcbiAgICAgICAgfVxuICAgICAgICBsZXQgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4XG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuICdtZW1vcnlbICcgKyBpZHggKyAnIF0gJ1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgdWlkOiBnZW4uZ2V0VUlEKCksXG4gIH1cbiAgXG4gIHVnZW4ub3V0Lm1lbW9yeSA9IHVnZW4ubWVtb3J5IFxuXG4gIHVnZW4ubmFtZSA9ICdoaXN0b3J5JyArIHVnZW4udWlkXG4gIHVnZW4ub3V0Lm5hbWUgPSB1Z2VuLm5hbWUgKyAnX291dCdcbiAgdWdlbi5pbi5fbmFtZSAgPSB1Z2VuLm5hbWUgPSAnX2luJ1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIi8qXG5cbiBhID0gY29uZGl0aW9uYWwoIGNvbmRpdGlvbiwgdHJ1ZUJsb2NrLCBmYWxzZUJsb2NrIClcbiBiID0gY29uZGl0aW9uYWwoW1xuICAgY29uZGl0aW9uMSwgYmxvY2sxLFxuICAgY29uZGl0aW9uMiwgYmxvY2syLFxuICAgY29uZGl0aW9uMywgYmxvY2szLFxuICAgZGVmYXVsdEJsb2NrXG4gXSlcblxuKi9cbid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2lmZWxzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb25kaXRpb25hbHMgPSB0aGlzLmlucHV0c1swXSxcbiAgICAgICAgZGVmYXVsdFZhbHVlID0gZ2VuLmdldElucHV0KCBjb25kaXRpb25hbHNbIGNvbmRpdGlvbmFscy5sZW5ndGggLSAxXSApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7ZGVmYXVsdFZhbHVlfVxcbmAgXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnZGVmYXVsdFZhbHVlOicsIGRlZmF1bHRWYWx1ZSApXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IGNvbmRpdGlvbmFscy5sZW5ndGggLSAyOyBpKz0gMiApIHtcbiAgICAgIGxldCBpc0VuZEJsb2NrID0gaSA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCAtIDMsXG4gICAgICAgICAgY29uZCAgPSBnZW4uZ2V0SW5wdXQoIGNvbmRpdGlvbmFsc1sgaSBdICksXG4gICAgICAgICAgcHJlYmxvY2sgPSBjb25kaXRpb25hbHNbIGkrMSBdLFxuICAgICAgICAgIGJsb2NrLCBibG9ja05hbWUsIG91dHB1dFxuXG4gICAgICAvL2NvbnNvbGUubG9nKCAncGInLCBwcmVibG9jayApXG5cbiAgICAgIGlmKCB0eXBlb2YgcHJlYmxvY2sgPT09ICdudW1iZXInICl7XG4gICAgICAgIGJsb2NrID0gcHJlYmxvY2tcbiAgICAgICAgYmxvY2tOYW1lID0gbnVsbFxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBnZW4ubWVtb1sgcHJlYmxvY2submFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgLy8gdXNlZCB0byBwbGFjZSBhbGwgY29kZSBkZXBlbmRlbmNpZXMgaW4gYXBwcm9wcmlhdGUgYmxvY2tzXG4gICAgICAgICAgZ2VuLnN0YXJ0TG9jYWxpemUoKVxuXG4gICAgICAgICAgZ2VuLmdldElucHV0KCBwcmVibG9jayApXG5cbiAgICAgICAgICBibG9jayA9IGdlbi5lbmRMb2NhbGl6ZSgpXG4gICAgICAgICAgYmxvY2tOYW1lID0gYmxvY2tbMF1cbiAgICAgICAgICBibG9jayA9IGJsb2NrWyAxIF0uam9pbignJylcbiAgICAgICAgICBibG9jayA9ICcgICcgKyBibG9jay5yZXBsYWNlKCAvXFxuL2dpLCAnXFxuICAnIClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgYmxvY2sgPSAnJ1xuICAgICAgICAgIGJsb2NrTmFtZSA9IGdlbi5tZW1vWyBwcmVibG9jay5uYW1lIF1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvdXRwdXQgPSBibG9ja05hbWUgPT09IG51bGwgPyBcbiAgICAgICAgYCAgJHt0aGlzLm5hbWV9X291dCA9ICR7YmxvY2t9YCA6XG4gICAgICAgIGAke2Jsb2NrfSAgJHt0aGlzLm5hbWV9X291dCA9ICR7YmxvY2tOYW1lfWBcbiAgICAgIFxuICAgICAgaWYoIGk9PT0wICkgb3V0ICs9ICcgJ1xuICAgICAgb3V0ICs9IFxuYCBpZiggJHtjb25kfSA9PT0gMSApIHtcbiR7b3V0cHV0fVxuICB9YFxuXG5pZiggIWlzRW5kQmxvY2sgKSB7XG4gIG91dCArPSBgIGVsc2VgXG59ZWxzZXtcbiAgb3V0ICs9IGBcXG5gXG59XG4vKiAgICAgICAgIFxuIGVsc2VgXG4gICAgICB9ZWxzZSBpZiggaXNFbmRCbG9jayApIHtcbiAgICAgICAgb3V0ICs9IGB7XFxuICAke291dHB1dH1cXG4gIH1cXG5gXG4gICAgICB9ZWxzZSB7XG5cbiAgICAgICAgLy9pZiggaSArIDIgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggfHwgaSA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCAtIDEgKSB7XG4gICAgICAgIC8vICBvdXQgKz0gYHtcXG4gICR7b3V0cHV0fVxcbiAgfVxcbmBcbiAgICAgICAgLy99ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gXG5gIGlmKCAke2NvbmR9ID09PSAxICkge1xuJHtvdXRwdXR9XG4gIH0gZWxzZSBgXG4gICAgICAgIC8vfVxuICAgICAgfSovXG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfV9vdXRgXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9X291dGAsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBjb25kaXRpb25zID0gQXJyYXkuaXNBcnJheSggYXJnc1swXSApID8gYXJnc1swXSA6IGFyZ3NcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgY29uZGl0aW9ucyBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2luJyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLnBhcmFtZXRlcnMucHVzaCggdGhpcy5uYW1lIClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiB0aGlzLm5hbWVcbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIG5hbWUgKSA9PiB7XG4gIGxldCBpbnB1dCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBpbnB1dC5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIGlucHV0Lm5hbWUgPSBuYW1lICE9PSB1bmRlZmluZWQgPyBuYW1lIDogYCR7aW5wdXQuYmFzZW5hbWV9JHtpbnB1dC5pZH1gXG4gIGlucHV0WzBdID0ge1xuICAgIGdlbigpIHtcbiAgICAgIGlmKCAhIGdlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5wdXNoKCBpbnB1dC5uYW1lIClcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1swXSdcbiAgICB9XG4gIH1cbiAgaW5wdXRbMV0gPSB7XG4gICAgZ2VuKCkge1xuICAgICAgaWYoICEgZ2VuLnBhcmFtZXRlcnMuaW5jbHVkZXMoIGlucHV0Lm5hbWUgKSApIGdlbi5wYXJhbWV0ZXJzLnB1c2goIGlucHV0Lm5hbWUgKVxuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzFdJ1xuICAgIH1cbiAgfVxuXG5cbiAgcmV0dXJuIGlucHV0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGxpYnJhcnkgPSB7XG4gIGV4cG9ydCggZGVzdGluYXRpb24gKSB7XG4gICAgaWYoIGRlc3RpbmF0aW9uID09PSB3aW5kb3cgKSB7XG4gICAgICBkZXN0aW5hdGlvbi5zc2QgPSBsaWJyYXJ5Lmhpc3RvcnkgICAgLy8gaGlzdG9yeSBpcyB3aW5kb3cgb2JqZWN0IHByb3BlcnR5LCBzbyB1c2Ugc3NkIGFzIGFsaWFzXG4gICAgICBkZXN0aW5hdGlvbi5pbnB1dCA9IGxpYnJhcnkuaW4gICAgICAgLy8gaW4gaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcbiAgICAgIGRlc3RpbmF0aW9uLnRlcm5hcnkgPSBsaWJyYXJ5LnN3aXRjaCAvLyBzd2l0Y2ggaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcblxuICAgICAgZGVsZXRlIGxpYnJhcnkuaGlzdG9yeVxuICAgICAgZGVsZXRlIGxpYnJhcnkuaW5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LnN3aXRjaFxuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oIGRlc3RpbmF0aW9uLCBsaWJyYXJ5IClcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggbGlicmFyeSwgJ3NhbXBsZXJhdGUnLCB7XG4gICAgICBnZXQoKSB7IHJldHVybiBsaWJyYXJ5Lmdlbi5zYW1wbGVyYXRlIH0sXG4gICAgICBzZXQodikge31cbiAgICB9KVxuXG4gICAgbGlicmFyeS5pbiA9IGRlc3RpbmF0aW9uLmlucHV0XG4gICAgbGlicmFyeS5oaXN0b3J5ID0gZGVzdGluYXRpb24uc3NkXG4gICAgbGlicmFyeS5zd2l0Y2ggPSBkZXN0aW5hdGlvbi50ZXJuYXJ5XG5cbiAgICBkZXN0aW5hdGlvbi5jbGlwID0gbGlicmFyeS5jbGFtcFxuICB9LFxuXG4gIGdlbjogICAgICByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gIFxuICBhYnM6ICAgICAgcmVxdWlyZSggJy4vYWJzLmpzJyApLFxuICByb3VuZDogICAgcmVxdWlyZSggJy4vcm91bmQuanMnICksXG4gIHBhcmFtOiAgICByZXF1aXJlKCAnLi9wYXJhbS5qcycgKSxcbiAgYWRkOiAgICAgIHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgc3ViOiAgICAgIHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgbXVsOiAgICAgIHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgZGl2OiAgICAgIHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgYWNjdW06ICAgIHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICBjb3VudGVyOiAgcmVxdWlyZSggJy4vY291bnRlci5qcycgKSxcbiAgc2luOiAgICAgIHJlcXVpcmUoICcuL3Npbi5qcycgKSxcbiAgY29zOiAgICAgIHJlcXVpcmUoICcuL2Nvcy5qcycgKSxcbiAgdGFuOiAgICAgIHJlcXVpcmUoICcuL3Rhbi5qcycgKSxcbiAgdGFuaDogICAgIHJlcXVpcmUoICcuL3RhbmguanMnICksXG4gIGFzaW46ICAgICByZXF1aXJlKCAnLi9hc2luLmpzJyApLFxuICBhY29zOiAgICAgcmVxdWlyZSggJy4vYWNvcy5qcycgKSxcbiAgYXRhbjogICAgIHJlcXVpcmUoICcuL2F0YW4uanMnICksICBcbiAgcGhhc29yOiAgIHJlcXVpcmUoICcuL3BoYXNvci5qcycgKSxcbiAgZGF0YTogICAgIHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gIHBlZWs6ICAgICByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICBjeWNsZTogICAgcmVxdWlyZSggJy4vY3ljbGUuanMnICksXG4gIGhpc3Rvcnk6ICByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICBkZWx0YTogICAgcmVxdWlyZSggJy4vZGVsdGEuanMnICksXG4gIGZsb29yOiAgICByZXF1aXJlKCAnLi9mbG9vci5qcycgKSxcbiAgY2VpbDogICAgIHJlcXVpcmUoICcuL2NlaWwuanMnICksXG4gIG1pbjogICAgICByZXF1aXJlKCAnLi9taW4uanMnICksXG4gIG1heDogICAgICByZXF1aXJlKCAnLi9tYXguanMnICksXG4gIHNpZ246ICAgICByZXF1aXJlKCAnLi9zaWduLmpzJyApLFxuICBkY2Jsb2NrOiAgcmVxdWlyZSggJy4vZGNibG9jay5qcycgKSxcbiAgbWVtbzogICAgIHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gIHJhdGU6ICAgICByZXF1aXJlKCAnLi9yYXRlLmpzJyApLFxuICB3cmFwOiAgICAgcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgbWl4OiAgICAgIHJlcXVpcmUoICcuL21peC5qcycgKSxcbiAgY2xhbXA6ICAgIHJlcXVpcmUoICcuL2NsYW1wLmpzJyApLFxuICBwb2tlOiAgICAgcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgZGVsYXk6ICAgIHJlcXVpcmUoICcuL2RlbGF5LmpzJyApLFxuICBmb2xkOiAgICAgcmVxdWlyZSggJy4vZm9sZC5qcycgKSxcbiAgbW9kIDogICAgIHJlcXVpcmUoICcuL21vZC5qcycgKSxcbiAgc2FoIDogICAgIHJlcXVpcmUoICcuL3NhaC5qcycgKSxcbiAgbm9pc2U6ICAgIHJlcXVpcmUoICcuL25vaXNlLmpzJyApLFxuICBub3Q6ICAgICAgcmVxdWlyZSggJy4vbm90LmpzJyApLFxuICBndDogICAgICAgcmVxdWlyZSggJy4vZ3QuanMnICksXG4gIGd0ZTogICAgICByZXF1aXJlKCAnLi9ndGUuanMnICksXG4gIGx0OiAgICAgICByZXF1aXJlKCAnLi9sdC5qcycgKSwgXG4gIGx0ZTogICAgICByZXF1aXJlKCAnLi9sdGUuanMnICksIFxuICBib29sOiAgICAgcmVxdWlyZSggJy4vYm9vbC5qcycgKSxcbiAgZ2F0ZTogICAgIHJlcXVpcmUoICcuL2dhdGUuanMnICksXG4gIHRyYWluOiAgICByZXF1aXJlKCAnLi90cmFpbi5qcycgKSxcbiAgc2xpZGU6ICAgIHJlcXVpcmUoICcuL3NsaWRlLmpzJyApLFxuICBpbjogICAgICAgcmVxdWlyZSggJy4vaW4uanMnICksXG4gIHQ2MDogICAgICByZXF1aXJlKCAnLi90NjAuanMnKSxcbiAgbXRvZjogICAgIHJlcXVpcmUoICcuL210b2YuanMnKSxcbiAgbHRwOiAgICAgIHJlcXVpcmUoICcuL2x0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBndHA6ICAgICAgcmVxdWlyZSggJy4vZ3RwLmpzJyksICAgICAgICAvLyBUT0RPOiB0ZXN0XG4gIHN3aXRjaDogICByZXF1aXJlKCAnLi9zd2l0Y2guanMnICksXG4gIG1zdG9zYW1wczpyZXF1aXJlKCAnLi9tc3Rvc2FtcHMuanMnICksIC8vIFRPRE86IG5lZWRzIHRlc3QsXG4gIHNlbGVjdG9yOiByZXF1aXJlKCAnLi9zZWxlY3Rvci5qcycgKSxcbiAgdXRpbGl0aWVzOnJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKSxcbiAgcG93OiAgICAgIHJlcXVpcmUoICcuL3Bvdy5qcycgKSxcbiAgYXR0YWNrOiAgIHJlcXVpcmUoICcuL2F0dGFjay5qcycgKSxcbiAgZGVjYXk6ICAgIHJlcXVpcmUoICcuL2RlY2F5LmpzJyApLFxuICB3aW5kb3dzOiAgcmVxdWlyZSggJy4vd2luZG93cy5qcycgKSxcbiAgZW52OiAgICAgIHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgYWQ6ICAgICAgIHJlcXVpcmUoICcuL2FkLmpzJyAgKSxcbiAgYWRzcjogICAgIHJlcXVpcmUoICcuL2Fkc3IuanMnICksXG4gIGlmZWxzZTogICByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgYmFuZzogICAgIHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gIGFuZDogICAgICByZXF1aXJlKCAnLi9hbmQuanMnICksXG4gIHBhbjogICAgICByZXF1aXJlKCAnLi9wYW4uanMnICksXG4gIGVxOiAgICAgICByZXF1aXJlKCAnLi9lcS5qcycgKSxcbiAgbmVxOiAgICAgIHJlcXVpcmUoICcuL25lcS5qcycgKVxufVxuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5XG5cbm1vZHVsZS5leHBvcnRzID0gbGlicmFyeVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2x0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCgoICR7aW5wdXRzWzBdfSA8ICR7aW5wdXRzWzFdfSkgfCAwICApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdIDwgaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0LmlucHV0cyA9IFsgeCx5IF1cbiAgbHQubmFtZSA9ICdsdCcgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPD0gJHtpbnB1dHNbMV19IHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gJ2x0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoKCAke2lucHV0c1swXX0gPCAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCggaW5wdXRzWzBdIDwgaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHRwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGx0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21heCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5tYXggfSlcblxuICAgICAgb3V0ID0gYGdlbi5tYXgoICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5tYXgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1heCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtYXguaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtYXhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtZW1vJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IChpbjEsbWVtb05hbWUpID0+IHtcbiAgbGV0IG1lbW8gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBtZW1vLmlucHV0cyA9IFsgaW4xIF1cbiAgbWVtby5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIG1lbW8ubmFtZSA9IG1lbW9OYW1lICE9PSB1bmRlZmluZWQgPyBtZW1vTmFtZSArICdfJyArIGdlbi5nZXRVSUQoKSA6IGAke21lbW8uYmFzZW5hbWV9JHttZW1vLmlkfWBcblxuICByZXR1cm4gbWVtb1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21pbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5taW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5taW4oICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5taW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1pbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtaW4uaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIsIHQ9LjUgKSA9PiB7XG4gIGxldCB1Z2VuID0gbWVtbyggYWRkKCBtdWwoaW4xLCBzdWIoMSx0ICkgKSwgbXVsKCBpbjIsIHQgKSApIClcbiAgdWdlbi5uYW1lID0gJ21peCcgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IG1vZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICAgIG1vZEF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgJSB2XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9ICUgJHt2fWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnICUgJyBcbiAgICAgIH0pXG5cbiAgICAgIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIG1vZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtc3Rvc2FtcHMnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHJldHVyblZhbHVlXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lIH0gPSAke2dlbi5zYW1wbGVyYXRlfSAvIDEwMDAgKiAke2lucHV0c1swXX0gXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBnZW4uc2FtcGxlcmF0ZSAvIDEwMDAgKiB0aGlzLmlucHV0c1swXVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH0gICAgXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbXN0b3NhbXBzID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1zdG9zYW1wcy5pbnB1dHMgPSBbIHggXVxuICBtc3Rvc2FtcHMubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG1zdG9zYW1wc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J210b2YnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCggJHt0aGlzLnR1bmluZ30gKiBnZW4uZXhwKCAuMDU3NzYyMjY1ICogKCR7aW5wdXRzWzBdfSAtIDY5KSApIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gdGhpcy50dW5pbmcgKiBNYXRoLmV4cCggLjA1Nzc2MjI2NSAqICggaW5wdXRzWzBdIC0gNjkpIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCBwcm9wcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IHR1bmluZzo0NDAgfVxuICBcbiAgaWYoIHByb3BzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBwcm9wcy5kZWZhdWx0cyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgZGVmYXVsdHMgKVxuICB1Z2VuLmlucHV0cyA9IFsgeCBdXG4gIFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGxldCBtdWwgPSB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuKCkge1xuICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgICBvdXQ9JygnLFxuICAgICAgICAgIHN1bSA9IDEsIG51bUNvdW50ID0gMCwgbXVsQXRFbmQgPSBmYWxzZSwgYWxyZWFkeUZ1bGxTdW1tZWQgPSB0cnVlXG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICAgIG91dCArPSB2XG4gICAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgICAgbXVsQXRFbmQgPSB0cnVlXG4gICAgICAgICAgICBvdXQgKz0gJyAqICdcbiAgICAgICAgICB9XG4gICAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBpZiggaSA9PT0gMCApIHtcbiAgICAgICAgICAgIHN1bSA9IHZcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHN1bSAqPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgICB9XG4gICAgICAgICAgbnVtQ291bnQrK1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgXG4gICAgICBpZiggYWxyZWFkeUZ1bGxTdW1tZWQgKSBvdXQgPSAnJ1xuXG4gICAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgICBvdXQgKz0gbXVsQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICogJyArIHN1bVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZiggIWFscmVhZHlGdWxsU3VtbWVkICkgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG11bFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbmVxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSAvKnRoaXMuaW5wdXRzWzBdICE9PSB0aGlzLmlucHV0c1sxXSA/IDEgOiovIGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ICE9PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vaXNlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dFxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdub2lzZScgOiBNYXRoLnJhbmRvbSB9KVxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGdlbi5ub2lzZSgpXFxuYFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub2lzZSA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgbm9pc2UubmFtZSA9IHByb3RvLm5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbm9pc2Vcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidub3QnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSApIHtcbiAgICAgIG91dCA9IGAoICR7aW5wdXRzWzBdfSA9PT0gMCA/IDEgOiAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9ICFpbnB1dHNbMF0gPT09IDAgPyAxIDogMFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IG5vdCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBub3QuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gbm90XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BhbicsIFxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXJMID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApLFxuICAgICAgICBidWZmZXJSID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApXG5cbiAgICBsZXQgc3FydFR3b092ZXJUd28gPSBNYXRoLnNxcnQoMikgLyAyXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDEwMjQ7IGkrKyApIHsgXG4gICAgICBsZXQgcGFuID0gLTEgKyAoIGkgLyAxMDI0ICkgKiAyXG4gICAgICBidWZmZXJMW2ldID0gKCBzcXJ0VHdvT3ZlclR3byAqICggTWF0aC5jb3MocGFuKSAtIE1hdGguc2luKHBhbikgKSApXG4gICAgICBidWZmZXJSW2ldID0gKCBzcXJ0VHdvT3ZlclR3byAqICggTWF0aC5jb3MocGFuKSArIE1hdGguc2luKHBhbikgKSApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMucGFuTCA9IGRhdGEoIGJ1ZmZlckwsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSlcbiAgICBnZW4uZ2xvYmFscy5wYW5SID0gZGF0YSggYnVmZmVyUiwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9KVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGxlZnRJbnB1dCwgcmlnaHRJbnB1dCwgcGFuID0uNSwgcHJvcGVydGllcyApID0+IHtcbiAgaWYoIGdlbi5nbG9iYWxzLnBhbkwgPT09IHVuZGVmaW5lZCApIHByb3RvLmluaXRUYWJsZSgpXG5cbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGxlZnRJbnB1dCwgcmlnaHRJbnB1dCBdLFxuICAgIGxlZnQ6ICAgIG11bCggbGVmdElucHV0LCBwZWVrKCBnZW4uZ2xvYmFscy5wYW5MLCBwYW4sIHsgYm91bmRtb2RlOidjbGFtcCcgfSkgKSxcbiAgICByaWdodDogICBtdWwoIHJpZ2h0SW5wdXQsIHBlZWsoIGdlbi5nbG9iYWxzLnBhblIsIHBhbiwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSApXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3BhcmFtJyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBnZW4ucGFyYW1zLmFkZCh7IFt0aGlzLm5hbWVdOiB0aGlzIH0pXG5cbiAgICB0aGlzLnZhbHVlID0gdGhpcy5pbml0aWFsVmFsdWVcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWBcblxuICAgIHJldHVybiBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHByb3BOYW1lPTAsIHZhbHVlPTAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgaWYoIHR5cGVvZiBwcm9wTmFtZSAhPT0gJ3N0cmluZycgKSB7XG4gICAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gcHJvcE5hbWVcbiAgfWVsc2V7XG4gICAgdWdlbi5uYW1lID0gcHJvcE5hbWVcbiAgICB1Z2VuLmluaXRpYWxWYWx1ZSA9IHZhbHVlXG4gIH1cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwZWVrJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0LCBmdW5jdGlvbkJvZHksIG5leHQsIGxlbmd0aElzTG9nMiwgaWR4XG4gICAgXG4gICAgaWR4ID0gaW5wdXRzWzFdXG4gICAgbGVuZ3RoSXNMb2cyID0gKE1hdGgubG9nMiggdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKSB8IDApICA9PT0gTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApXG5cbiAgICBpZiggdGhpcy5tb2RlICE9PSAnc2ltcGxlJyApIHtcblxuICAgIGZ1bmN0aW9uQm9keSA9IGAgIHZhciAke3RoaXMubmFtZX1fZGF0YUlkeCAgPSAke2lkeH0sIFxuICAgICAgJHt0aGlzLm5hbWV9X3BoYXNlID0gJHt0aGlzLm1vZGUgPT09ICdzYW1wbGVzJyA/IGlucHV0c1swXSA6IGlucHV0c1swXSArICcgKiAnICsgKHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMSkgfSwgXG4gICAgICAke3RoaXMubmFtZX1faW5kZXggPSAke3RoaXMubmFtZX1fcGhhc2UgfCAwLFxcbmBcblxuICAgIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ3dyYXAnICkge1xuICAgICAgbmV4dCA9IGxlbmd0aElzTG9nMiA/XG4gICAgICBgKCAke3RoaXMubmFtZX1faW5kZXggKyAxICkgJiAoJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gLSAxKWAgOlxuICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gPyAke3RoaXMubmFtZX1faW5kZXggKyAxIC0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH1lbHNlIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2NsYW1wJyApIHtcbiAgICAgIG5leHQgPSBcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA/ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfWVsc2V7XG4gICAgICAgbmV4dCA9IFxuICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDFgICAgICBcbiAgICB9XG5cbiAgICBpZiggdGhpcy5pbnRlcnAgPT09ICdsaW5lYXInICkgeyAgICAgIFxuICAgIGZ1bmN0aW9uQm9keSArPSBgICAgICAgJHt0aGlzLm5hbWV9X2ZyYWMgID0gJHt0aGlzLm5hbWV9X3BoYXNlIC0gJHt0aGlzLm5hbWV9X2luZGV4LFxuICAgICAgJHt0aGlzLm5hbWV9X2Jhc2UgID0gbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICAke3RoaXMubmFtZX1faW5kZXggXSxcbiAgICAgICR7dGhpcy5uYW1lfV9uZXh0ICA9ICR7bmV4dH0sYFxuICAgICAgXG4gICAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdpZ25vcmUnICkge1xuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gYFxuICAgICAgJHt0aGlzLm5hbWV9X291dCAgID0gJHt0aGlzLm5hbWV9X2luZGV4ID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSB8fCAke3RoaXMubmFtZX1faW5kZXggPCAwID8gMCA6ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoIG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1fbmV4dCBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKVxcblxcbmBcbiAgICAgIH1lbHNle1xuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gYFxuICAgICAgJHt0aGlzLm5hbWV9X291dCAgID0gJHt0aGlzLm5hbWV9X2Jhc2UgKyAke3RoaXMubmFtZX1fZnJhYyAqICggbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9uZXh0IF0gLSAke3RoaXMubmFtZX1fYmFzZSApXFxuXFxuYFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fb3V0ID0gbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9pbmRleCBdXFxuXFxuYFxuICAgIH1cblxuICAgIH0gZWxzZSB7IC8vIG1vZGUgaXMgc2ltcGxlXG4gICAgICBmdW5jdGlvbkJvZHkgPSBgbWVtb3J5WyAke2lkeH0gKyAkeyBpbnB1dHNbMF0gfSBdYFxuICAgICAgXG4gICAgICByZXR1cm4gZnVuY3Rpb25Cb2R5XG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ19vdXQnXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUrJ19vdXQnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGF0YSwgaW5kZXgsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjaGFubmVsczoxLCBtb2RlOidwaGFzZScsIGludGVycDonbGluZWFyJywgYm91bmRtb2RlOid3cmFwJyB9IFxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGRhdGEsXG4gICAgZGF0YU5hbWU6ICAgZGF0YS5uYW1lLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluZGV4LCBkYXRhIF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgcHJvdG8gPSB7IGJhc2VuYW1lOidwaGFzb3InIH1cblxuY29uc3QgZGVmYXVsdHMgPSB7IG1pbjogLTEsIG1heDogMSB9XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCwgX3Byb3BzICkgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgX3Byb3BzIClcblxuICBsZXQgcmFuZ2UgPSBwcm9wcy5tYXggLSBwcm9wcy5taW5cblxuICBsZXQgdWdlbiA9IHR5cGVvZiBmcmVxdWVuY3kgPT09ICdudW1iZXInID8gYWNjdW0oIChmcmVxdWVuY3kgKiByYW5nZSkgLyBnZW4uc2FtcGxlcmF0ZSwgcmVzZXQsIHByb3BzICkgOiAgYWNjdW0oIG11bCggZnJlcXVlbmN5LCAxL2dlbi5zYW1wbGVyYXRlLygxL3JhbmdlKSApLCByZXNldCwgcHJvcHMgKVxuXG4gIHVnZW4ubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsICA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcC5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Bva2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZGF0YU5hbWUgPSAnbWVtb3J5JyxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBpZHgsIG91dCwgd3JhcHBlZFxuICAgIFxuICAgIGlkeCA9IHRoaXMuZGF0YS5nZW4oKVxuXG4gICAgLy9nZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIC8vd3JhcHBlZCA9IHdyYXAoIHRoaXMuaW5wdXRzWzFdLCAwLCB0aGlzLmRhdGFMZW5ndGggKS5nZW4oKVxuICAgIC8vaWR4ID0gd3JhcHBlZFswXVxuICAgIC8vZ2VuLmZ1bmN0aW9uQm9keSArPSB3cmFwcGVkWzFdXG4gICAgbGV0IG91dHB1dFN0ciA9IHRoaXMuaW5wdXRzWzFdID09PSAwID9cbiAgICAgIGAgICR7ZGF0YU5hbWV9WyAke2lkeH0gXSA9ICR7aW5wdXRzWzBdfVxcbmAgOlxuICAgICAgYCAgJHtkYXRhTmFtZX1bICR7aWR4fSArICR7aW5wdXRzWzFdfSBdID0gJHtpbnB1dHNbMF19XFxuYFxuXG4gICAgaWYoIHRoaXMuaW5saW5lID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IG91dHB1dFN0clxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIFsgdGhpcy5pbmxpbmUsIG91dHB1dFN0ciBdXG4gICAgfVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9ICggZGF0YSwgdmFsdWUsIGluZGV4LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6MSB9IFxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBkYXRhLFxuICAgIGRhdGFOYW1lOiAgIGRhdGEubmFtZSxcbiAgICBkYXRhTGVuZ3RoOiBkYXRhLmJ1ZmZlci5sZW5ndGgsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgdmFsdWUsIGluZGV4IF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcblxuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuICBcbiAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4ubmFtZSwgdWdlbiApXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG93JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Bvdyc6IE1hdGgucG93IH0pXG5cbiAgICAgIG91dCA9IGBnZW4ucG93KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdHlwZW9mIGlucHV0c1swXSA9PT0gJ3N0cmluZycgJiYgaW5wdXRzWzBdWzBdID09PSAnKCcgKSB7XG4gICAgICAgIGlucHV0c1swXSA9IGlucHV0c1swXS5zbGljZSgxLC0xKVxuICAgICAgfVxuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMV0gPT09ICdzdHJpbmcnICYmIGlucHV0c1sxXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMV0gPSBpbnB1dHNbMV0uc2xpY2UoMSwtMSlcbiAgICAgIH1cblxuICAgICAgb3V0ID0gTWF0aC5wb3coIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0pIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgcG93ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHBvdy5pbnB1dHMgPSBbIHgseSBdXG4gIHBvdy5pZCA9IGdlbi5nZXRVSUQoKVxuICBwb3cubmFtZSA9IGAke3Bvdy5iYXNlbmFtZX17cG93LmlkfWBcblxuICByZXR1cm4gcG93XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gICAgZGVsdGEgICA9IHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICAgIHdyYXAgICAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3JhdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBwaGFzZSAgPSBoaXN0b3J5KCksXG4gICAgICAgIGluTWludXMxID0gaGlzdG9yeSgpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmaWx0ZXIsIHN1bSwgb3V0XG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X2RpZmYgPSAke2lucHV0c1swXX0gLSAke2dlbk5hbWV9Lmxhc3RTYW1wbGVcbiAgaWYoICR7dGhpcy5uYW1lfV9kaWZmIDwgLS41ICkgJHt0aGlzLm5hbWV9X2RpZmYgKz0gMVxuICAke2dlbk5hbWV9LnBoYXNlICs9ICR7dGhpcy5uYW1lfV9kaWZmICogJHtpbnB1dHNbMV19XG4gIGlmKCAke2dlbk5hbWV9LnBoYXNlID4gMSApICR7Z2VuTmFtZX0ucGhhc2UgLT0gMVxuICAke2dlbk5hbWV9Lmxhc3RTYW1wbGUgPSAke2lucHV0c1swXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcblxuICAgIHJldHVybiBbIGdlbk5hbWUgKyAnLnBoYXNlJywgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCByYXRlICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHBoYXNlOiAgICAgIDAsXG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIHJhdGUgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidyb3VuZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLnJvdW5kIH0pXG5cbiAgICAgIG91dCA9IGBnZW4ucm91bmQoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgucm91bmQoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCByb3VuZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICByb3VuZC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiByb3VuZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NhaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gMFxuICAgIGdlbi5kYXRhWyB0aGlzLm5hbWUgKyAnX2NvbnRyb2wnIF0gPSAwXG5cbiAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfSA9IGdlbi5kYXRhLiR7dGhpcy5uYW1lfV9jb250cm9sLFxuICAgICAgJHt0aGlzLm5hbWV9X3RyaWdnZXIgPSAke2lucHV0c1sxXX0gPiAke2lucHV0c1syXX0gPyAxIDogMFxuXG4gIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciAhPT0gJHt0aGlzLm5hbWV9ICApIHtcbiAgICBpZiggJHt0aGlzLm5hbWV9X3RyaWdnZXIgPT09IDEgKSBcbiAgICAgIGdlbi5kYXRhLiR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICAgIGdlbi5kYXRhLiR7dGhpcy5uYW1lfV9jb250cm9sID0gJHt0aGlzLm5hbWV9X3RyaWdnZXJcbiAgfVxuYFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YCwgJyAnICtvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGNvbnRyb2wsIHRocmVzaG9sZD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdDowIH1cblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIGNvbnRyb2wsdGhyZXNob2xkIF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NlbGVjdG9yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0LCByZXR1cm5WYWx1ZSA9IDBcbiAgICBcbiAgICBzd2l0Y2goIGlucHV0cy5sZW5ndGggKSB7XG4gICAgICBjYXNlIDIgOlxuICAgICAgICByZXR1cm5WYWx1ZSA9IGlucHV0c1sxXVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMyA6XG4gICAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX1fb3V0ID0gJHtpbnB1dHNbMF19ID09PSAxID8gJHtpbnB1dHNbMV19IDogJHtpbnB1dHNbMl19XFxuXFxuYDtcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSArICdfb3V0Jywgb3V0IF1cbiAgICAgICAgYnJlYWs7ICBcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X291dCA9IDBcbiAgc3dpdGNoKCAke2lucHV0c1swXX0gKyAxICkge1xcbmBcblxuICAgICAgICBmb3IoIGxldCBpID0gMTsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKyApe1xuICAgICAgICAgIG91dCArPWAgICAgY2FzZSAke2l9OiAke3RoaXMubmFtZX1fb3V0ID0gJHtpbnB1dHNbaV19OyBicmVhaztcXG5gIFxuICAgICAgICB9XG5cbiAgICAgICAgb3V0ICs9ICcgIH1cXG5cXG4nXG4gICAgICAgIFxuICAgICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lICsgJ19vdXQnLCAnICcgKyBvdXQgXVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfb3V0J1xuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5pbnB1dHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHNcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidzaWduJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguc2lnbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnNpZ24oICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2lnbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpZ24gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2lnbi5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBzaWduXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Npbic6IE1hdGguc2luIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5zaW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBzaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2luLmlucHV0cyA9IFsgeCBdXG4gIHNpbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBzaW4ubmFtZSA9IGAke3Npbi5iYXNlbmFtZX17c2luLmlkfWBcblxuICByZXR1cm4gc2luXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gICAgZ3QgICAgICA9IHJlcXVpcmUoICcuL2d0LmpzJyApLFxuICAgIGRpdiAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgX3N3aXRjaCA9IHJlcXVpcmUoICcuL3N3aXRjaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBzbGlkZVVwID0gMSwgc2xpZGVEb3duID0gMSApID0+IHtcbiAgbGV0IHkxID0gaGlzdG9yeSgwKSxcbiAgICAgIGZpbHRlciwgc2xpZGVBbW91bnRcblxuICAvL3kgKG4pID0geSAobi0xKSArICgoeCAobikgLSB5IChuLTEpKS9zbGlkZSkgXG4gIHNsaWRlQW1vdW50ID0gX3N3aXRjaCggZ3QoaW4xLHkxLm91dCksIHNsaWRlVXAsIHNsaWRlRG93biApXG5cbiAgZmlsdGVyID0gbWVtbyggYWRkKCB5MS5vdXQsIGRpdiggc3ViKCBpbjEsIHkxLm91dCApLCBzbGlkZUFtb3VudCApICkgKVxuXG4gIHkxLmluKCBmaWx0ZXIgKVxuXG4gIHJldHVybiBmaWx0ZXJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgbGV0IHN1YiA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0wLFxuICAgICAgICAgIGRpZmYgPSAwLFxuICAgICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsIFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICAgIHN1YkF0RW5kID0gZmFsc2UsXG4gICAgICAgICAgaGFzVWdlbnMgPSBmYWxzZSxcbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IDBcblxuICAgICAgdGhpcy5pbnB1dHMuZm9yRWFjaCggdmFsdWUgPT4geyBpZiggaXNOYU4oIHZhbHVlICkgKSBoYXNVZ2VucyA9IHRydWUgfSlcbiAgICAgIFxuICAgICAgaWYoIGhhc1VnZW5zICkgeyAvLyBzdG9yZSBpbiB2YXJpYWJsZSBmb3IgZnV0dXJlIHJlZmVyZW5jZVxuICAgICAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAoJ1xuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9ICcoJ1xuICAgICAgfVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAtIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgICAgfSlcbiAgICBcbiAgICAgIGlmKCBuZWVkc1BhcmVucyApIHtcbiAgICAgICAgb3V0ICs9ICcpJ1xuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9IG91dC5zbGljZSggMSApIC8vIHJlbW92ZSBvcGVuaW5nIHBhcmVuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKCBoYXNVZ2VucyApIG91dCArPSAnXFxuJ1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IGhhc1VnZW5zID8gWyB0aGlzLm5hbWUsIG91dCBdIDogb3V0XG4gICAgICBcbiAgICAgIGlmKCBoYXNVZ2VucyApIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgICB9XG4gIH1cbiAgIFxuICBzdWIubmFtZSA9ICdzdWInK3N1Yi5pZFxuXG4gIHJldHVybiBzdWJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N3aXRjaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgaWYoIGlucHV0c1sxXSA9PT0gaW5wdXRzWzJdICkgcmV0dXJuIGlucHV0c1sxXSAvLyBpZiBib3RoIHBvdGVudGlhbCBvdXRwdXRzIGFyZSB0aGUgc2FtZSBqdXN0IHJldHVybiBvbmUgb2YgdGhlbVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX1fb3V0ID0gJHtpbnB1dHNbMF19ID09PSAxID8gJHtpbnB1dHNbMV19IDogJHtpbnB1dHNbMl19XFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfV9vdXRgXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9X291dGAsIG91dCBdXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGNvbnRyb2wsIGluMSA9IDEsIGluMiA9IDAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgY29udHJvbCwgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondDYwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICByZXR1cm5WYWx1ZVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbICdleHAnIF06IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBnZW4uZXhwKCAtNi45MDc3NTUyNzg5MjEgLyAke2lucHV0c1swXX0gKVxcblxcbmBcbiAgICAgXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBvdXRcbiAgICAgIFxuICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSwgb3V0IF1cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5leHAoIC02LjkwNzc1NTI3ODkyMSAvIGlucHV0c1swXSApXG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0XG4gICAgfSAgICBcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0NjAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdDYwLmlucHV0cyA9IFsgeCBdXG4gIHQ2MC5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdDYwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IE1hdGgudGFuIH0pXG5cbiAgICAgIG91dCA9IGBnZW4udGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdGFuLmlucHV0cyA9IFsgeCBdXG4gIHRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW4ubmFtZSA9IGAke3Rhbi5iYXNlbmFtZX17dGFuLmlkfWBcblxuICByZXR1cm4gdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbmgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICd0YW5oJzogTWF0aC50YW5oIH0pXG5cbiAgICAgIG91dCA9IGBnZW4udGFuaCggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgudGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdGFuLmlucHV0cyA9IFsgeCBdXG4gIHRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW4ubmFtZSA9IGAke3Rhbi5iYXNlbmFtZX17dGFuLmlkfWBcblxuICByZXR1cm4gdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbHQgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIHBoYXNvciAgPSByZXF1aXJlKCAnLi9waGFzb3IuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT00NDAsIHB1bHNld2lkdGg9LjUgKSA9PiB7XG4gIGxldCBncmFwaCA9IGx0KCBhY2N1bSggZGl2KCBmcmVxdWVuY3ksIDQ0MTAwICkgKSwgLjUgKVxuXG4gIGdyYXBoLm5hbWUgPSBgdHJhaW4ke2dlbi5nZXRVSUQoKX1gXG5cbiAgcmV0dXJuIGdyYXBoXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApXG5cbmxldCBpc1N0ZXJlbyA9IGZhbHNlXG5cbmxldCB1dGlsaXRpZXMgPSB7XG4gIGN0eDogbnVsbCxcblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmNhbGxiYWNrID0gKCkgPT4gMFxuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmZvckVhY2goIHYgPT4gdigpIClcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5sZW5ndGggPSAwXG4gIH0sXG5cbiAgY3JlYXRlQ29udGV4dCgpIHtcbiAgICBsZXQgQUMgPSB0eXBlb2YgQXVkaW9Db250ZXh0ID09PSAndW5kZWZpbmVkJyA/IHdlYmtpdEF1ZGlvQ29udGV4dCA6IEF1ZGlvQ29udGV4dFxuICAgIHRoaXMuY3R4ID0gbmV3IEFDKClcbiAgICBnZW4uc2FtcGxlcmF0ZSA9IHRoaXMuY3R4LnNhbXBsZVJhdGVcblxuICAgIGxldCBzdGFydCA9ICgpID0+IHtcbiAgICAgIGlmKCB0eXBlb2YgQUMgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG5cbiAgICAgICAgICBpZiggJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICl7IC8vIHJlcXVpcmVkIHRvIHN0YXJ0IGF1ZGlvIHVuZGVyIGlPUyA2XG4gICAgICAgICAgICBsZXQgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KCB1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uIClcbiAgICAgICAgICAgIG15U291cmNlLm5vdGVPbiggMCApXG4gICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG5cbiAgY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCkge1xuICAgIHRoaXMubm9kZSA9IHRoaXMuY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvciggMTAyNCwgMCwgMiApLFxuICAgIHRoaXMuY2xlYXJGdW5jdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMCB9LFxuICAgIHRoaXMuY2FsbGJhY2sgPSB0aGlzLmNsZWFyRnVuY3Rpb25cblxuICAgIHRoaXMubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKCBhdWRpb1Byb2Nlc3NpbmdFdmVudCApIHtcbiAgICAgIHZhciBvdXRwdXRCdWZmZXIgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXI7XG5cbiAgICAgIHZhciBsZWZ0ID0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAwICksXG4gICAgICAgICAgcmlnaHQ9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMSApXG5cbiAgICAgIGZvciAodmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGxlZnQubGVuZ3RoOyBzYW1wbGUrKykge1xuICAgICAgICBpZiggIWlzU3RlcmVvICkge1xuICAgICAgICAgIGxlZnRbIHNhbXBsZSBdID0gcmlnaHRbIHNhbXBsZSBdID0gdXRpbGl0aWVzLmNhbGxiYWNrKClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgdmFyIG91dCA9IHV0aWxpdGllcy5jYWxsYmFjaygpXG4gICAgICAgICAgbGVmdFsgc2FtcGxlICBdID0gb3V0WzBdXG4gICAgICAgICAgcmlnaHRbIHNhbXBsZSBdID0gb3V0WzFdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm5vZGUuY29ubmVjdCggdGhpcy5jdHguZGVzdGluYXRpb24gKVxuXG4gICAgLy90aGlzLm5vZGUuY29ubmVjdCggdGhpcy5hbmFseXplciApXG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuICBcbiAgcGxheUdyYXBoKCBncmFwaCwgZGVidWcsIG1lbT00NDEwMCoxMCApIHtcbiAgICB1dGlsaXRpZXMuY2xlYXIoKVxuICAgIGlmKCBkZWJ1ZyA9PT0gdW5kZWZpbmVkICkgZGVidWcgPSBmYWxzZVxuICAgICAgICAgIFxuICAgIGlzU3RlcmVvID0gQXJyYXkuaXNBcnJheSggZ3JhcGggKVxuXG4gICAgdXRpbGl0aWVzLmNhbGxiYWNrID0gZ2VuLmNyZWF0ZUNhbGxiYWNrKCBncmFwaCwgbWVtLCBkZWJ1ZyApXG4gICAgXG4gICAgaWYoIHV0aWxpdGllcy5jb25zb2xlICkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUoIHV0aWxpdGllcy5jYWxsYmFjay50b1N0cmluZygpIClcblxuICAgIHJldHVybiB1dGlsaXRpZXMuY2FsbGJhY2tcbiAgfSxcblxuICBsb2FkU2FtcGxlKCBzb3VuZEZpbGVQYXRoLCBkYXRhICkge1xuICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHJlcS5vcGVuKCAnR0VUJywgc291bmRGaWxlUGF0aCwgdHJ1ZSApXG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcicgXG4gICAgXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUscmVqZWN0KSA9PiB7XG4gICAgICByZXEub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhdWRpb0RhdGEgPSByZXEucmVzcG9uc2VcblxuICAgICAgICB1dGlsaXRpZXMuY3R4LmRlY29kZUF1ZGlvRGF0YSggYXVkaW9EYXRhLCAoYnVmZmVyKSA9PiB7XG4gICAgICAgICAgZGF0YS5idWZmZXIgPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMClcbiAgICAgICAgICByZXNvbHZlKCBkYXRhLmJ1ZmZlciApXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJlcS5zZW5kKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxufVxuXG51dGlsaXRpZXMuY2xlYXIuY2FsbGJhY2tzID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsaXRpZXNcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKlxuICogbWFueSB3aW5kb3dzIGhlcmUgYWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9jb3JiYW5icm9vay9kc3AuanMvYmxvYi9tYXN0ZXIvZHNwLmpzXG4gKiBzdGFydGluZyBhdCBsaW5lIDE0MjdcbiAqIHRha2VuIDgvMTUvMTZcbiovIFxuXG5jb25zdCB3aW5kb3dzID0gbW9kdWxlLmV4cG9ydHMgPSB7IFxuICBiYXJ0bGV0dCggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMiAvIChsZW5ndGggLSAxKSAqICgobGVuZ3RoIC0gMSkgLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSkgXG4gIH0sXG5cbiAgYmFydGxldHRIYW5uKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjYyIC0gMC40OCAqIE1hdGguYWJzKGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMC41KSAtIDAuMzggKiBNYXRoLmNvcyggMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBibGFja21hbiggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgbGV0IGEwID0gKDEgLSBhbHBoYSkgLyAyLFxuICAgICAgICBhMSA9IDAuNSxcbiAgICAgICAgYTIgPSBhbHBoYSAvIDJcblxuICAgIHJldHVybiBhMCAtIGExICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKyBhMiAqIE1hdGguY29zKDQgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgY29zaW5lKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiBNYXRoLmNvcyhNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSBNYXRoLlBJIC8gMilcbiAgfSxcblxuICBnYXVzcyggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KE1hdGguRSwgLTAuNSAqIE1hdGgucG93KChpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpIC8gKGFscGhhICogKGxlbmd0aCAtIDEpIC8gMiksIDIpKVxuICB9LFxuXG4gIGhhbW1pbmcoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNTQgLSAwLjQ2ICogTWF0aC5jb3MoIE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgaGFubiggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKVxuICB9LFxuXG4gIGxhbmN6b3MoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgbGV0IHggPSAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAxO1xuICAgIHJldHVybiBNYXRoLnNpbihNYXRoLlBJICogeCkgLyAoTWF0aC5QSSAqIHgpXG4gIH0sXG5cbiAgcmVjdGFuZ3VsYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDFcbiAgfSxcblxuICB0cmlhbmd1bGFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAyIC8gbGVuZ3RoICogKGxlbmd0aCAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKVxuICB9LFxuXG4gIC8vIHBhcmFib2xhXG4gIHdlbGNoKCBsZW5ndGgsIF9pbmRleCwgaWdub3JlLCBzaGlmdCApIHtcbiAgICAvL3dbbl0gPSAxIC0gTWF0aC5wb3coICggbiAtICggKE4tMSkgLyAyICkgKSAvICgoIE4tMSApIC8gMiApLCAyIClcbiAgICBjb25zdCBpbmRleCA9IHNoaWZ0ID09PSAwID8gX2luZGV4IDogKF9pbmRleCArIE1hdGguZmxvb3IoIHNoaWZ0ICogbGVuZ3RoICkpICUgbGVuZ3RoXG4gICAgY29uc3Qgbl8xX292ZXIyID0gKGxlbmd0aCAtIDEpIC8gMiBcblxuICAgIHJldHVybiAxIC0gTWF0aC5wb3coICggaW5kZXggLSBuXzFfb3ZlcjIgKSAvIG5fMV9vdmVyMiwgMiApXG4gIH0sXG4gIGludmVyc2V3ZWxjaCggbGVuZ3RoLCBfaW5kZXgsIGlnbm9yZSwgc2hpZnQ9MCApIHtcbiAgICAvL3dbbl0gPSAxIC0gTWF0aC5wb3coICggbiAtICggKE4tMSkgLyAyICkgKSAvICgoIE4tMSApIC8gMiApLCAyIClcbiAgICBsZXQgaW5kZXggPSBzaGlmdCA9PT0gMCA/IF9pbmRleCA6IChfaW5kZXggKyBNYXRoLmZsb29yKCBzaGlmdCAqIGxlbmd0aCApKSAlIGxlbmd0aFxuICAgIGNvbnN0IG5fMV9vdmVyMiA9IChsZW5ndGggLSAxKSAvIDJcblxuICAgIHJldHVybiBNYXRoLnBvdyggKCBpbmRleCAtIG5fMV9vdmVyMiApIC8gbl8xX292ZXIyLCAyIClcbiAgfSxcblxuICBwYXJhYm9sYSggbGVuZ3RoLCBpbmRleCApIHtcbiAgICBpZiggaW5kZXggPD0gbGVuZ3RoIC8gMiApIHtcbiAgICAgIHJldHVybiB3aW5kb3dzLmludmVyc2V3ZWxjaCggbGVuZ3RoIC8gMiwgaW5kZXggKSAtIDFcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiAxIC0gd2luZG93cy5pbnZlcnNld2VsY2goIGxlbmd0aCAvIDIsIGluZGV4IC0gbGVuZ3RoIC8gMiApXG4gICAgfVxuICB9LFxuXG4gIGV4cG9uZW50aWFsKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICByZXR1cm4gTWF0aC5wb3coIGluZGV4L2xlbmd0aCwgYWxwaGEgKVxuICB9LFxuXG4gIGxpbmVhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gaW5kZXgvbGVuZ3RoXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZmxvb3I9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTond3JhcCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHNpZ25hbCA9IGlucHV0c1swXSwgbWluID0gaW5wdXRzWzFdLCBtYXggPSBpbnB1dHNbMl0sXG4gICAgICAgIG91dCwgZGlmZlxuXG4gICAgLy9vdXQgPSBgKCgoJHtpbnB1dHNbMF19IC0gJHt0aGlzLm1pbn0pICUgJHtkaWZmfSAgKyAke2RpZmZ9KSAlICR7ZGlmZn0gKyAke3RoaXMubWlufSlgXG4gICAgLy9jb25zdCBsb25nIG51bVdyYXBzID0gbG9uZygodi1sbykvcmFuZ2UpIC0gKHYgPCBsbyk7XG4gICAgLy9yZXR1cm4gdiAtIHJhbmdlICogZG91YmxlKG51bVdyYXBzKTsgICBcbiAgICBcbiAgICBpZiggdGhpcy5taW4gPT09IDAgKSB7XG4gICAgICBkaWZmID0gbWF4XG4gICAgfWVsc2UgaWYgKCBpc05hTiggbWF4ICkgfHwgaXNOYU4oIG1pbiApICkge1xuICAgICAgZGlmZiA9IGAke21heH0gLSAke21pbn1gXG4gICAgfWVsc2V7XG4gICAgICBkaWZmID0gbWF4IC0gbWluXG4gICAgfVxuXG4gICAgb3V0ID1cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9IDwgJHt0aGlzLm1pbn0gKSAke3RoaXMubmFtZX0gKz0gJHtkaWZmfVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPiAke3RoaXMubWF4fSApICR7dGhpcy5uYW1lfSAtPSAke2RpZmZ9XG5cbmBcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgJyAnICsgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IE1lbW9yeUhlbHBlciA9IHtcbiAgY3JlYXRlKCBzaXplT3JCdWZmZXI9NDA5NiwgbWVtdHlwZT1GbG9hdDMyQXJyYXkgKSB7XG4gICAgbGV0IGhlbHBlciA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuXG4gICAgLy8gY29udmVuaWVudGx5LCBidWZmZXIgY29uc3RydWN0b3JzIGFjY2VwdCBlaXRoZXIgYSBzaXplIG9yIGFuIGFycmF5IGJ1ZmZlciB0byB1c2UuLi5cbiAgICAvLyBzbywgbm8gbWF0dGVyIHdoaWNoIGlzIHBhc3NlZCB0byBzaXplT3JCdWZmZXIgaXQgc2hvdWxkIHdvcmsuXG4gICAgT2JqZWN0LmFzc2lnbiggaGVscGVyLCB7XG4gICAgICBoZWFwOiBuZXcgbWVtdHlwZSggc2l6ZU9yQnVmZmVyICksXG4gICAgICBsaXN0OiB7fSxcbiAgICAgIGZyZWVMaXN0OiB7fVxuICAgIH0pXG5cbiAgICByZXR1cm4gaGVscGVyXG4gIH0sXG5cbiAgYWxsb2MoIHNpemUsIGltbXV0YWJsZSApIHtcbiAgICBsZXQgaWR4ID0gLTFcblxuICAgIGlmKCBzaXplID4gdGhpcy5oZWFwLmxlbmd0aCApIHtcbiAgICAgIHRocm93IEVycm9yKCAnQWxsb2NhdGlvbiByZXF1ZXN0IGlzIGxhcmdlciB0aGFuIGhlYXAgc2l6ZSBvZiAnICsgdGhpcy5oZWFwLmxlbmd0aCApXG4gICAgfVxuXG4gICAgZm9yKCBsZXQga2V5IGluIHRoaXMuZnJlZUxpc3QgKSB7XG4gICAgICBsZXQgY2FuZGlkYXRlID0gdGhpcy5mcmVlTGlzdFsga2V5IF1cblxuICAgICAgaWYoIGNhbmRpZGF0ZS5zaXplID49IHNpemUgKSB7XG4gICAgICAgIGlkeCA9IGtleVxuXG4gICAgICAgIHRoaXMubGlzdFsgaWR4IF0gPSB7IHNpemUsIGltbXV0YWJsZSwgcmVmZXJlbmNlczoxIH1cblxuICAgICAgICBpZiggY2FuZGlkYXRlLnNpemUgIT09IHNpemUgKSB7XG4gICAgICAgICAgbGV0IG5ld0luZGV4ID0gaWR4ICsgc2l6ZSxcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemVcblxuICAgICAgICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmxpc3QgKSB7XG4gICAgICAgICAgICBpZigga2V5ID4gbmV3SW5kZXggKSB7XG4gICAgICAgICAgICAgIG5ld0ZyZWVTaXplID0ga2V5IC0gbmV3SW5kZXhcbiAgICAgICAgICAgICAgdGhpcy5mcmVlTGlzdFsgbmV3SW5kZXggXSA9IG5ld0ZyZWVTaXplXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiggaWR4ICE9PSAtMSApIGRlbGV0ZSB0aGlzLmZyZWVMaXN0WyBpZHggXVxuXG4gICAgaWYoIGlkeCA9PT0gLTEgKSB7XG4gICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKCB0aGlzLmxpc3QgKSxcbiAgICAgICAgICBsYXN0SW5kZXhcblxuICAgICAgaWYoIGtleXMubGVuZ3RoICkgeyAvLyBpZiBub3QgZmlyc3QgYWxsb2NhdGlvbi4uLlxuICAgICAgICBsYXN0SW5kZXggPSBwYXJzZUludCgga2V5c1sga2V5cy5sZW5ndGggLSAxIF0gKVxuXG4gICAgICAgIGlkeCA9IGxhc3RJbmRleCArIHRoaXMubGlzdFsgbGFzdEluZGV4IF0uc2l6ZVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlkeCA9IDBcbiAgICAgIH1cblxuICAgICAgdGhpcy5saXN0WyBpZHggXSA9IHsgc2l6ZSwgaW1tdXRhYmxlLCByZWZlcmVuY2VzOjEgfVxuICAgIH1cblxuICAgIGlmKCBpZHggKyBzaXplID49IHRoaXMuaGVhcC5sZW5ndGggKSB7XG4gICAgICB0aHJvdyBFcnJvciggJ05vIGF2YWlsYWJsZSBibG9ja3MgcmVtYWluIHN1ZmZpY2llbnQgZm9yIGFsbG9jYXRpb24gcmVxdWVzdC4nIClcbiAgICB9XG4gICAgcmV0dXJuIGlkeFxuICB9LFxuXG4gIGFkZFJlZmVyZW5jZSggaW5kZXggKSB7XG4gICAgaWYoIHRoaXMubGlzdFsgaW5kZXggXSAhPT0gdW5kZWZpbmVkICkgeyBcbiAgICAgIHRoaXMubGlzdFsgaW5kZXggXS5yZWZlcmVuY2VzKytcbiAgICB9XG4gIH0sXG5cbiAgZnJlZSggaW5kZXggKSB7XG4gICAgaWYoIHRoaXMubGlzdFsgaW5kZXggXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgdGhyb3cgRXJyb3IoICdDYWxsaW5nIGZyZWUoKSBvbiBub24tZXhpc3RpbmcgYmxvY2suJyApXG4gICAgfVxuXG4gICAgbGV0IHNsb3QgPSB0aGlzLmxpc3RbIGluZGV4IF1cbiAgICBpZiggc2xvdCA9PT0gMCApIHJldHVyblxuICAgIHNsb3QucmVmZXJlbmNlcy0tXG5cbiAgICBpZiggc2xvdC5yZWZlcmVuY2VzID09PSAwICYmIHNsb3QuaW1tdXRhYmxlICE9PSB0cnVlICkgeyAgICBcbiAgICAgIHRoaXMubGlzdFsgaW5kZXggXSA9IDBcblxuICAgICAgbGV0IGZyZWVCbG9ja1NpemUgPSAwXG4gICAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5saXN0ICkge1xuICAgICAgICBpZigga2V5ID4gaW5kZXggKSB7XG4gICAgICAgICAgZnJlZUJsb2NrU2l6ZSA9IGtleSAtIGluZGV4XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmZyZWVMaXN0WyBpbmRleCBdID0gZnJlZUJsb2NrU2l6ZVxuICAgIH1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlIZWxwZXJcbiJdfQ==
