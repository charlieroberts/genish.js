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

},{"./gen.js":28}],2:[function(require,module,exports){
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

    out += '  let ' + this.name + '_value = ' + valueRef + ';\n  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating 

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
      defaults = { min: 0, max: 1, shouldWrap: true };

  if (properties !== undefined) Object.assign(defaults, properties);

  if (defaults.initialValue === undefined) defaults.initialValue = defaults.min;

  Object.assign(ugen, {
    min: defaults.min,
    max: defaults.max,
    initial: defaults.initialValue,
    value: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, reset],
    memory: {
      value: { length: 1, idx: null }
    }
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":28}],3:[function(require,module,exports){
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

},{"./gen.js":28}],4:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    div = require('./div.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    accum = require('./accum.js'),
    ifelsef = require('./ifelseif.js'),
    lt = require('./lt.js'),
    bang = require('./bang.js'),
    env = require('./env.js');

module.exports = function () {
  var attackTime = arguments.length <= 0 || arguments[0] === undefined ? 44100 : arguments[0];
  var decayTime = arguments.length <= 1 || arguments[1] === undefined ? 44100 : arguments[1];
  var _props = arguments[2];

  var _bang = bang(),
      phase = accum(1, _bang, { max: Infinity, shouldWrap: false }),
      props = Object.assign({}, { shape: 'exponential', alpha: 5 }, _props),
      bufferData = void 0,
      decayData = void 0,
      out = void 0,
      buffer = void 0;

  // slightly more efficient to use existing phase accumulator for linear envelopes
  if (props.shape === 'linear') {
    out = ifelse(lt(phase, attackTime), memo(div(phase, attackTime)), lt(phase, attackTime + decayTime), sub(1, div(sub(phase, attackTime), decayTime)), 0);
  } else {
    bufferData = env(1024, { type: props.shape, alpha: props.alpha });
    out = ifelse(lt(phase, attackTime), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }), lt(phase, attackTime + decayTime), peek(bufferData, sub(1, div(sub(phase, attackTime), decayTime)), { boundmode: 'clamp' }), 0);
  }

  out.trigger = _bang.trigger;

  return out;
};

},{"./accum.js":2,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":28,"./ifelseif.js":33,"./lt.js":36,"./mul.js":46,"./peek.js":50,"./sub.js":61}],5:[function(require,module,exports){
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

},{"./gen.js":28}],6:[function(require,module,exports){
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
    param = require('./param.js');

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
  bufferData = env(1024, { type: props.shape, alpha: props.alpha });

  sustainCondition = props.triggerRelease ? shouldSustain : lt(phase, attackTime + decayTime + sustainTime);

  releaseAccum = props.triggerRelease ? gtp(sub(sustainLevel, accum(sustainLevel / releaseTime, 0, { shouldWrap: false })), 0) : sub(sustainLevel, mul(div(sub(phase, attackTime + decayTime + sustainTime), releaseTime), sustainLevel)), releaseCondition = props.triggerRelease ? not(shouldSustain) : lt(phase, attackTime + decayTime + sustainTime + releaseTime);

  out = ifelse(
  // attack
  lt(phase, attackTime), peek(bufferData, div(phase, attackTime), { boundmode: 'clamp' }),

  // decay
  lt(phase, attackTime + decayTime), peek(bufferData, sub(1, mul(div(sub(phase, attackTime), decayTime), sub(1, sustainLevel))), { boundmode: 'clamp' }),

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

},{"./accum.js":2,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":28,"./ifelseif.js":33,"./lt.js":36,"./mul.js":46,"./param.js":49,"./peek.js":50,"./sub.js":61}],7:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'and',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    out = '  let ' + this.name + ' = ' + inputs[0] + ' !== 0 && ' + inputs[1] + ' !== 0 | 0\n\n';

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

},{"./gen.js":28}],8:[function(require,module,exports){
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

},{"./gen.js":28}],9:[function(require,module,exports){
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

},{"./gen.js":28}],10:[function(require,module,exports){
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

    ssd.out.run = function () {
        ssd.value = 1;
    };

    return sub(1, ssd.out);
};

},{"./gen.js":28,"./history.js":32,"./mul.js":46,"./sub.js":61}],11:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  gen: function gen() {
    _gen.requestMemory(this.memory);

    var out = '  let ' + this.name + ' = memory[' + this.memory.value.idx + ']\n  if( ' + this.name + ' === 1 ) memory[' + this.memory.value.idx + '] = 0      \n      \n';
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

},{"./gen.js":28}],12:[function(require,module,exports){
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

},{"./gen.js":28}],13:[function(require,module,exports){
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

},{"./gen.js":28}],14:[function(require,module,exports){
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

},{"./floor.js":25,"./gen.js":28,"./memo.js":40,"./sub.js":61}],15:[function(require,module,exports){
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

},{"./gen.js":28}],16:[function(require,module,exports){
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
    functionBody = this.callback(genName, inputs[0], inputs[1], inputs[2], inputs[3], 'memory[' + this.memory.value.idx + ']', 'memory[' + this.memory.wrap.idx + ']');

    _gen.closures.add(_defineProperty({}, this.name, this));

    _gen.memo[this.name] = this.name + '_value';

    if (_gen.memo[this.wrap.name] === undefined) this.wrap.gen();

    return [this.name + '_value', functionBody];
  },
  callback: function callback(_name, _incr, _min, _max, _reset, valueRef, wrapRef) {
    var diff = this.max - this.min,
        out = '',
        wrap = '';

    // must check for reset before storing value for output
    if (!(typeof this.inputs[3] === 'number' && this.inputs[3] < 1)) {
      out += '  if( ' + _reset + ' >= 1 ) ' + valueRef + ' = ' + _min + '\n';
    }

    out += '  let ' + this.name + '_value = ' + valueRef + ';\n  ' + valueRef + ' += ' + _incr + '\n'; // store output value before accumulating 

    if (typeof this.max === 'number' && this.max !== Infinity && typeof this.min === 'number') {
      wrap = '  if( ' + valueRef + ' >= ' + this.max + ' ) {\n    ' + valueRef + ' -= ' + diff + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
    } else if (this.max !== Infinity) {
      wrap = '  if( ' + valueRef + ' >= ' + _max + ' ) {\n    ' + valueRef + ' -= ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else if( ' + valueRef + ' < ' + _min + ' ) {\n    ' + valueRef + ' += ' + _max + ' - ' + _min + '\n    ' + wrapRef + ' = 1\n  }else{\n    ' + wrapRef + ' = 0\n  }\n';
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
  var properties = arguments[4];

  var ugen = Object.create(proto),
      defaults = { initialValue: 0 };

  if (properties !== undefined) Object.assign(defaults, properties);

  Object.assign(ugen, {
    min: min,
    max: max,
    value: defaults.initialValue,
    uid: _gen.getUID(),
    inputs: [incr, min, max, reset],
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

},{"./gen.js":28}],17:[function(require,module,exports){
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

    gen.globals.table = data(buffer);
  }
};

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  if (gen.globals.table === undefined) proto.initTable();

  var ugen = peek(gen.globals.table, phasor(frequency, reset, { min: 0 }));
  ugen.name = 'cycle' + gen.getUID();

  return ugen;
};

},{"./data.js":18,"./gen.js":28,"./mul.js":46,"./peek.js":50,"./phasor.js":51}],18:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    utilities = require('./utilities.js');

var proto = {
  basename: 'data',
  globals: {},

  gen: function gen() {
    var idx = void 0;
    if (_gen.memo[this.name] === undefined) {
      var ugen = this;
      _gen.requestMemory(this.memory); //, ()=> {  console.log("CALLED", ugen); gen.memory.set( ugen.buffer, idx ) } )
      //console.log( 'MEMORY', this.memory, this.buffer.length )
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
    buffer = { length: y > 1 ? y : _gen.samplerate * 60 };
    shouldLoad = true;
  } else if (x instanceof Float32Array) {
    buffer = x;
  }

  ugen = {
    buffer: buffer,
    name: proto.basename + _gen.getUID(),
    dim: buffer.length,
    channels: 1,
    gen: proto.gen,
    onload: null,
    then: function then(fnc) {
      ugen.onload = fnc;
      return ugen;
    }
  };

  ugen.memory = {
    values: { length: ugen.dim, index: null }
  };

  _gen.name = 'data' + _gen.getUID();

  if (shouldLoad) {
    var promise = utilities.loadSample(x, ugen);
    promise.then(function (_buffer) {
      ugen.memory.values.length = _buffer.length;
      ugen.onload();
    });
  }

  if (properties !== undefined && properties.global !== undefined) {
    _gen.globals[properties.global] = ugen;
  }

  return ugen;
};

},{"./gen.js":28,"./utilities.js":66}],19:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":28,"./history.js":32,"./memo.js":40,"./mul.js":46,"./sub.js":61}],20:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js');

module.exports = function () {
    var decayTime = arguments.length <= 0 || arguments[0] === undefined ? 44100 : arguments[0];

    var ssd = history(1),
        t60 = Math.exp(-6.907755278921 / decayTime);

    ssd.in(mul(ssd.out, t60));

    ssd.out.run = function () {
        ssd.value = 1;
    };

    return ssd.out;
};

},{"./gen.js":28,"./history.js":32,"./mul.js":46}],21:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    data = require('./data.js'),
    poke = require('./poke.js'),
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

},{"./accum.js":2,"./data.js":18,"./gen.js":28,"./poke.js":52,"./wrap.js":68}],22:[function(require,module,exports){
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

},{"./gen.js":28,"./history.js":32,"./sub.js":61}],23:[function(require,module,exports){
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

},{"./gen.js":28}],24:[function(require,module,exports){
'use strict';

var gen = require('./gen'),
    windows = require('./windows'),
    data = require('./data'),
    peek = require('./peek'),
    phasor = require('./phasor');

module.exports = function () {
  var length = arguments.length <= 0 || arguments[0] === undefined ? 11025 : arguments[0];
  var properties = arguments[1];

  var defaults = {
    type: 'Triangular',
    bufferLength: 1024,
    alpha: .15
  },
      frequency = length / gen.samplerate,
      props = Object.assign({}, defaults, properties),
      buffer = new Float32Array(props.bufferLength);

  if (gen.globals.windows[props.type] === undefined) gen.globals.windows[props.type] = {};

  if (gen.globals.windows[props.type][props.bufferLength] === undefined) {
    for (var i = 0; i < props.bufferLength; i++) {
      buffer[i] = windows[props.type](props.bufferLength, i, props.alpha);
    }

    gen.globals.windows[props.type][props.bufferLength] = data(buffer);
  }

  var ugen = gen.globals.windows[props.type][props.bufferLength]; //peek( gen.globals.windows[ props.type ][ props.bufferLength ], phasor( frequency, 0, { min:0 } ))
  ugen.name = 'env' + gen.getUID();

  return ugen;
};

},{"./data":18,"./gen":28,"./peek":50,"./phasor":51,"./windows":67}],25:[function(require,module,exports){
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

},{"./gen.js":28}],26:[function(require,module,exports){
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

},{"./gen.js":28}],27:[function(require,module,exports){
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

},{"./gen.js":28}],28:[function(require,module,exports){
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
  memoryIndex: 0,

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


  memoryLength: 0,

  //requestMemory( amount ) {
  //  let idx = this.memorySize

  //  let promise = new Promise()
  //  promise.amount = amount

  //  this.memoryPromises.push( promise )

  //  return promise
  //},

  memoryCallbacks: [],

  getMemoryLength: function getMemoryLength(ugen) {

    function getMemoryForChannel(ugen) {
      if (ugen !== undefined && isNaN(ugen) && ugen.marked === undefined) {
        if (ugen.memory !== undefined) {
          var memory = ugen.memory;
          for (var indexName in memory) {
            var request = memory[indexName];
            gen.memoryLength += request.length;
            //console.log( 'ugen:',ugen.name, 'request:',request.length, 'total:', gen.memoryLength )
          }
        }
        ugen.marked = true;

        if (Array.isArray(ugen.inputs)) ugen.inputs.forEach(getMemoryForChannel);
      }
    }

    if (Array.isArray(ugen)) {
      ugen.forEach(getMemoryForChannel);
    } else {
      getMemoryForChannel(ugen);
    }

    this.histories.forEach(getMemoryForChannel);
  },
  requestMemory: function requestMemory(memorySpec, cb) {
    for (var key in memorySpec) {
      var request = memorySpec[key];

      request.idx = gen.memory.alloc(request.length);

      //  if( request.global !== undefined ) {
      //    if( gen.sharedMemory[ key ] !== undefined ) {
      //      request.idx = gen.sharedMemory[ key ]
      //    }else{
      //      gen.sharedMemory[ key ] = request.idx = gen.memoryIndex
      //      gen.memoryIndex += request.length
      //    }
      //  } else {
      //    request.idx = gen.memoryIndex
      //    gen.memoryIndex += request.length
      //  }
      //}
      //if( typeof cb === 'function' ) {
      //  gen.memoryCallbacks.push( cb )
    }
  },


  sharedMemory: {},

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
    this.globals = { windows: {} };

    this.parameters.length = 0;

    //this.memoryLength = 0
    //this.memoryCallbacks.length = 0
    //this.getMemoryLength( ugen )

    //this.memory = new Float32Array( this.memoryLength )

    //this.memoryCallbacks.forEach( v => {
    //  v()
    //})
    //this.memoryIndex = 0

    this.functionBody = "  'use strict'\n  let memory = gen.memory\n\n";

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
    callback.out = [];

    if (MemoryHelper.isPrototypeOf(this.memory)) callback.memory = this.memory.heap;

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
      } else {
        // if not memoized generate code 
        var code = input.gen();

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
  }
};

module.exports = gen;

},{"memory-helper":69}],29:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  let ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' > ' + inputs[1] + ' | 0 )';
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

},{"./gen.js":28}],30:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'gte',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  let ' + this.name + ' = ';

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

},{"./gen.js":28}],31:[function(require,module,exports){
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

},{"./gen.js":28}],32:[function(require,module,exports){
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

},{"./gen.js":28}],33:[function(require,module,exports){
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
    //let cond = gen.getInput( this.inputs[0] ),
    //    block1, block2, block1Name, block2Name, cond1, cond2, out

    var conditionals = this.inputs[0],
        out = '\n  let ' + this.name + '_out\n';

    for (var i = 0; i < conditionals.length; i += 2) {
      var isEndBlock = i === conditionals.length - 1,
          cond = !isEndBlock ? _gen.getInput(conditionals[i]) : null,
          preblock = isEndBlock ? conditionals[i] : conditionals[i + 1],
          block = void 0,
          blockName = void 0,
          output = void 0;

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

      output = blockName === null ? '  ' + this.name + '_out = ' + block : block + '    ' + this.name + '_out = ' + blockName;

      if (i === 0) {
        out += '  if( ' + cond + ' ) {\n' + output + '\n  } else';
      } else if (isEndBlock) {
        out += '{\n  ' + output + '\n  }\n';
      } else {

        if (i + 2 === conditionals.length || i === conditionals.length - 1) {
          out += '{\n  ' + output + '\n  }\n';
        } else {
          out += ' if( ' + cond + ' ) {\n' + output + '\n  } else ';
        }
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

},{"./gen.js":28}],34:[function(require,module,exports){
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

},{"./gen.js":28}],35:[function(require,module,exports){
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
  and: require('./and.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./data.js":18,"./dcblock.js":19,"./decay.js":20,"./delay.js":21,"./delta.js":22,"./div.js":23,"./env.js":24,"./floor.js":25,"./fold.js":26,"./gate.js":27,"./gen.js":28,"./gt.js":29,"./gte.js":30,"./gtp.js":31,"./history.js":32,"./ifelseif.js":33,"./in.js":34,"./lt.js":36,"./lte.js":37,"./ltp.js":38,"./max.js":39,"./memo.js":40,"./min.js":41,"./mix.js":42,"./mod.js":43,"./mstosamps.js":44,"./mtof.js":45,"./mul.js":46,"./noise.js":47,"./not.js":48,"./param.js":49,"./peek.js":50,"./phasor.js":51,"./poke.js":52,"./pow.js":53,"./rate.js":54,"./round.js":55,"./sah.js":56,"./selector.js":57,"./sign.js":58,"./sin.js":59,"./slide.js":60,"./sub.js":61,"./switch.js":62,"./t60.js":63,"./tan.js":64,"./train.js":65,"./utilities.js":66,"./windows.js":67,"./wrap.js":68}],36:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lt',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  let ' + this.name + ' = ';

    if (isNaN(this.inputs[0]) || isNaN(this.inputs[1])) {
      out += '( ' + inputs[0] + ' < ' + inputs[1] + ' | 0  )';
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

},{"./gen.js":28}],37:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'lte',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    out = '  let ' + this.name + ' = ';

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

},{"./gen.js":28}],38:[function(require,module,exports){
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

},{"./gen.js":28}],39:[function(require,module,exports){
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

},{"./gen.js":28}],40:[function(require,module,exports){
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

module.exports = function (in1, memoName) {
  var memo = Object.create(proto);

  memo.inputs = [in1];
  memo.id = _gen.getUID();
  memo.name = memoName !== undefined ? memoName + '_' + _gen.getUID() : '' + memo.basename + memo.id;

  return memo;
};

},{"./gen.js":28}],41:[function(require,module,exports){
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

},{"./gen.js":28}],42:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":28,"./memo.js":40,"./mul.js":46,"./sub.js":61}],43:[function(require,module,exports){
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

},{"./gen.js":28}],44:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'mstosamps',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this),
        returnValue = void 0;

    if (isNaN(inputs[0])) {
      out = '  let ' + this.name + ' = ' + _gen.samplerate + ' / 1000 * ' + inputs[0] + ' \n\n';

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

},{"./gen.js":28}],45:[function(require,module,exports){
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

},{"./gen.js":28}],46:[function(require,module,exports){
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

},{"./gen.js":28}],47:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'noise',

  gen: function gen() {
    var out = void 0;

    _gen.closures.add({ 'noise': Math.random });

    out = '  let ' + this.name + ' = gen.noise()\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x) {
  var noise = Object.create(proto);
  noise.name = proto.name + _gen.getUID();

  return noise;
};

},{"./gen.js":28}],48:[function(require,module,exports){
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

},{"./gen.js":28}],49:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
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
    ugen.name = 'param' + _gen.getUID();
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

},{"./gen.js":28}],50:[function(require,module,exports){
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

    //idx = this.data.gen()
    idx = inputs[1];
    lengthIsLog2 = (Math.log2(this.data.buffer.length) | 0) === Math.log2(this.data.buffer.length);

    //console.log( "LENGTH IS LOG2", lengthIsLog2, this.data.buffer.length )
    //${this.name}_index = ${this.name}_phase | 0,\n`
    functionBody = '  let ' + this.name + '_dataIdx  = ' + idx + ', \n      ' + this.name + '_phase = ' + (this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + this.data.buffer.length) + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n';

    //next = lengthIsLog2 ?
    if (this.boundmode === 'wrap') {
      next = lengthIsLog2 ? '( ' + this.name + '_index + 1 ) & (' + this.data.buffer.length + ' - 1)' : this.name + '_index + 1 >= ' + this.data.buffer.length + ' ? ' + this.name + '_index + 1 - ' + this.data.buffer.length + ' : ' + this.name + '_index + 1';
    } else if (this.boundmode === 'clamp') {
      next = this.name + '_index + 1 >= ' + (this.data.buffer.length - 1) + ' ? ' + (this.data.buffer.length - 1) + ' : ' + this.name + '_index + 1';
    }

    if (this.interp === 'linear') {
      functionBody += '      ' + this.name + '_frac  = ' + this.name + '_phase - ' + this.name + '_index,\n      ' + this.name + '_base  = memory[ ' + this.name + '_dataIdx +  ' + this.name + '_index ],\n      ' + this.name + '_next  = ' + next + ',     \n      ' + this.name + '_out   = ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
    } else {
      functionBody += '      ' + this.name + '_out = memory[ ' + this.name + '_dataIdx + ' + this.name + '_index ]\n\n';
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

},{"./gen.js":28}],51:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./accum.js'),
    mul = require('./mul.js'),
    proto = { basename: 'phasor' };

module.exports = function () {
  var frequency = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var reset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
  var props = arguments[2];

  if (props === undefined) props = { min: -1 };

  var range = (props.max || 1) - props.min;

  var ugen = typeof frequency === 'number' ? accum(frequency * range / gen.samplerate, reset, props) : accum(mul(frequency, 1 / gen.samplerate / (1 / range)), reset, props);

  ugen.name = proto.basename + gen.getUID();

  return ugen;
};

},{"./accum.js":2,"./gen.js":28,"./mul.js":46}],52:[function(require,module,exports){
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
    _gen.functionBody += '  ' + dataName + '[ ' + idx + ' + ' + inputs[1] + ' ] = ' + inputs[0] + '\n';
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

},{"./gen.js":28,"./mul.js":46,"./wrap.js":68}],53:[function(require,module,exports){
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

},{"./gen.js":28}],54:[function(require,module,exports){
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

},{"./add.js":5,"./delta.js":22,"./gen.js":28,"./history.js":32,"./memo.js":40,"./mul.js":46,"./sub.js":61,"./wrap.js":68}],55:[function(require,module,exports){
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

},{"./gen.js":28}],56:[function(require,module,exports){
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

},{"./gen.js":28}],57:[function(require,module,exports){
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
        out = '  let ' + this.name + '_out = ' + inputs[0] + ' === 1 ? ' + inputs[1] + ' : ' + inputs[2] + '\n\n';
        returnValue = [this.name + '_out', out];
        break;
      default:
        out = ' let ' + this.name + '_out = 0\n  switch( ' + inputs[0] + ' + 1 ) {\n';

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

},{"./gen.js":28}],58:[function(require,module,exports){
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

},{"./gen.js":28}],59:[function(require,module,exports){
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

},{"./gen.js":28}],60:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js'),
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

},{"./add.js":5,"./gen.js":28,"./history.js":32,"./memo.js":40,"./mul.js":46,"./sub.js":61,"./switch.js":62}],61:[function(require,module,exports){
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
        out = '  let ' + this.name + ' = (';
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

},{"./gen.js":28}],62:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'switch',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    if (inputs[1] === inputs[2]) return inputs[1]; // if both potential outputs are the same just return one of them

    out = '  let ' + this.name + '_out = ' + inputs[0] + ' === 1 ? ' + inputs[1] + ' : ' + inputs[2] + '\n\n';

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

},{"./gen.js":28}],63:[function(require,module,exports){
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

      out = '  let ' + this.name + ' = gen.exp( -6.907755278921 / ' + inputs[0] + ' )\n\n';

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

},{"./gen.js":28}],64:[function(require,module,exports){
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

},{"./gen.js":28}],65:[function(require,module,exports){
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

},{"./gen.js":28,"./lt.js":36,"./phasor.js":51}],66:[function(require,module,exports){
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
    this.ctx = new (AudioContext || webkitAudioContext)();
    gen.samplerate = this.ctx.sampleRate;

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

},{"./data.js":18,"./gen.js":28}],67:[function(require,module,exports){
'use strict';

/*
 * adapted from https://github.com/corbanbrook/dsp.js/blob/master/dsp.js
 * starting at line 1427
 * taken 8/15/16
*/

module.exports = {
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
  exponential: function exponential(length, index, alpha) {
    return Math.pow(index / length, alpha);
  },
  linear: function linear(length, index) {
    return index / length;
  }
};

},{}],68:[function(require,module,exports){
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

    out = ' let ' + this.name + ' = ' + inputs[0] + '\n  if( ' + this.name + ' < ' + this.min + ' ) ' + this.name + ' += ' + diff + '\n  else if( ' + this.name + ' > ' + this.max + ' ) ' + this.name + ' -= ' + diff + '\n\n';

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

},{"./floor.js":25,"./gen.js":28,"./memo.js":40,"./sub.js":61}],69:[function(require,module,exports){
"use strict"

let MemoryHelper = {
  create( size=4096, memtype=Float32Array ) {
    let helper = Object.create( this )

    Object.assign( helper, {
      heap: new memtype( size ),
      list: {},
      freeList: {}
    })

    return helper
  },
  
  alloc( amount ) {
    let idx = -1

    if( amount > this.heap.length ) {
      throw Error( 'Allocation request is larger than heap size of ' + this.heap.length )
    }

    for( let key in this.freeList ) {
      let candidateSize = this.freeList[ key ]

      if( candidateSize >= amount ) {
        idx = key

        this.list[ idx ] = amount

        if( candidateSize !== amount ) {
          let newIndex = idx + amount,
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

    if( idx === -1 ) {
      let keys = Object.keys( this.list ),
          lastIndex

      if( keys.length ) { // if not first allocation...
        lastIndex = parseInt( keys[ keys.length - 1 ] )

        idx = lastIndex + this.list[ lastIndex ]
      }else{
        idx = 0
      }

      this.list[ idx ] = amount
    }

    if( idx + amount >= this.heap.length ) {
      throw Error( 'No available blocks remain sufficient for allocation request.' )
    }
    return idx
  },

  free( index ) {
    if( typeof this.list[ index ] !== 'number' ) {
      throw Error( 'Calling free() on non-existing block.' )
    }

    this.list[ index ] = 0

    let size = 0
    for( let key in this.list ) {
      if( key > index ) {
        size = key - index
        break
      }
    }

    this.freeList[ index ] = size
  }
}

module.exports = MemoryHelper


},{}]},{},[35])(35)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZC5qcyIsImpzL2FkZC5qcyIsImpzL2Fkc3IuanMiLCJqcy9hbmQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2F0dGFjay5qcyIsImpzL2JhbmcuanMiLCJqcy9ib29sLmpzIiwianMvY2VpbC5qcyIsImpzL2NsYW1wLmpzIiwianMvY29zLmpzIiwianMvY291bnRlci5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RjYmxvY2suanMiLCJqcy9kZWNheS5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9lbnYuanMiLCJqcy9mbG9vci5qcyIsImpzL2ZvbGQuanMiLCJqcy9nYXRlLmpzIiwianMvZ2VuLmpzIiwianMvZ3QuanMiLCJqcy9ndGUuanMiLCJqcy9ndHAuanMiLCJqcy9oaXN0b3J5LmpzIiwianMvaWZlbHNlaWYuanMiLCJqcy9pbi5qcyIsImpzL2luZGV4LmpzIiwianMvbHQuanMiLCJqcy9sdGUuanMiLCJqcy9sdHAuanMiLCJqcy9tYXguanMiLCJqcy9tZW1vLmpzIiwianMvbWluLmpzIiwianMvbWl4LmpzIiwianMvbW9kLmpzIiwianMvbXN0b3NhbXBzLmpzIiwianMvbXRvZi5qcyIsImpzL211bC5qcyIsImpzL25vaXNlLmpzIiwianMvbm90LmpzIiwianMvcGFyYW0uanMiLCJqcy9wZWVrLmpzIiwianMvcGhhc29yLmpzIiwianMvcG9rZS5qcyIsImpzL3Bvdy5qcyIsImpzL3JhdGUuanMiLCJqcy9yb3VuZC5qcyIsImpzL3NhaC5qcyIsImpzL3NlbGVjdG9yLmpzIiwianMvc2lnbi5qcyIsImpzL3Npbi5qcyIsImpzL3NsaWRlLmpzIiwianMvc3ViLmpzIiwianMvc3dpdGNoLmpzIiwianMvdDYwLmpzIiwianMvdGFuLmpzIiwianMvdHJhaW4uanMiLCJqcy91dGlsaXRpZXMuanMiLCJqcy93aW5kb3dzLmpzIiwianMvd3JhcC5qcyIsIm5vZGVfbW9kdWxlcy9tZW1vcnktaGVscGVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVA7O0FBRUosSUFBSSxRQUFRO0FBQ1YsUUFBSyxLQUFMOztBQUVBLHNCQUFNO0FBQ0osUUFBSSxZQUFKO1FBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQVQsQ0FGQTs7QUFJSixRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2QixXQUFJLFFBQUosQ0FBYSxHQUFiLHFCQUFxQixLQUFLLElBQUwsRUFBYSxLQUFLLEdBQUwsQ0FBbEMsRUFEdUI7O0FBR3ZCLDBCQUFrQixPQUFPLENBQVAsUUFBbEIsQ0FIdUI7S0FBekIsTUFLTztBQUNMLFlBQU0sS0FBSyxHQUFMLENBQVUsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFWLENBQU4sQ0FESztLQUxQOztBQVNBLFdBQU8sR0FBUCxDQWJJO0dBSEk7Q0FBUjs7QUFvQkosT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBTixDQURnQjs7QUFHcEIsTUFBSSxNQUFKLEdBQWEsQ0FBRSxDQUFGLENBQWIsQ0FIb0I7O0FBS3BCLFNBQU8sR0FBUCxDQUxvQjtDQUFMOzs7QUN4QmpCOzs7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFQOztBQUVKLElBQUksUUFBUTtBQUNWLFlBQVMsT0FBVDs7QUFFQSxzQkFBTTtBQUNKLFFBQUksYUFBSjtRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFUO1FBQ0EsVUFBVSxTQUFTLEtBQUssSUFBTDtRQUNuQixxQkFISixDQURJOztBQU1KLFNBQUksYUFBSixDQUFtQixLQUFLLE1BQUwsQ0FBbkIsQ0FOSTs7QUFRSixTQUFJ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bUIsUUFBUSxLQUFSLENBWkM7R0FEVjs7O0FBZ0JaLE9BQVUsUUFBUyxVQUFULENBQVY7O0FBRUEsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxXQUFVLFFBQVMsY0FBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLE9BQVUsUUFBUyxVQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsVUFBVSxRQUFTLGFBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFdBQVUsUUFBUyxjQUFULENBQVY7QUFDQSxTQUFVLFFBQVMsWUFBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxPQUFVLFFBQVMsVUFBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxXQUFVLFFBQVMsY0FBVCxDQUFWO0FBQ0EsUUFBVSxRQUFTLFdBQVQsQ0FBVjtBQUNBLFFBQVUsUUFBUyxXQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsT0FBVSxRQUFTLFVBQVQsQ0FBVjtBQUNBLFNBQVUsUUFBUyxZQUFULENBQVY7QUFDQSxRQUFVLFFBQVMsV0FBVCxDQUFWO0FBQ0EsU0FBVSxRQUFTLFlBQVQsQ0FB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QUssSUFBTCxRQUFlLEtBQUssUUFBTCxHQUFnQixLQUFLLEdBQUwsQ0FWUzs7QUFZeEMsU0FBTyxJQUFQLENBWndDO0NBQXpCOzs7QUN2Q2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2FicycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmFicyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFicyggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hYnMoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhYnMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWJzLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGFic1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY2N1bScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keVxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB0aGlzLmluaXRpYWxWYWx1ZVxuXG4gICAgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAgKVxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgIFxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9yZXNldCwgdmFsdWVSZWYgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnXG4gICAgXG4gICAgLyogdGhyZWUgZGlmZmVyZW50IG1ldGhvZHMgb2Ygd3JhcHBpbmcsIHRoaXJkIGlzIG1vc3QgZXhwZW5zaXZlOlxuICAgICAqXG4gICAgICogMTogcmFuZ2UgezAsMX06IHkgPSB4IC0gKHggfCAwKVxuICAgICAqIDI6IGxvZzIodGhpcy5tYXgpID09IGludGVnZXI6IHkgPSB4ICYgKHRoaXMubWF4IC0gMSlcbiAgICAgKiAzOiBhbGwgb3RoZXJzOiBpZiggeCA+PSB0aGlzLm1heCApIHkgPSB0aGlzLm1heCAteFxuICAgICAqXG4gICAgICovXG5cbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzFdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1sxXSA8IDEpICkgeyBcbiAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLmluaXRpYWxWYWx1ZX1cXG5cXG5gIFxuICAgIH1cblxuICAgIG91dCArPSBgICBsZXQgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2YWx1ZVJlZn07XFxuICAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIFxuICAgIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgICYmIHRoaXMuc2hvdWxkV3JhcCApIHdyYXAgKz0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcbmBcbiAgICBpZiggdGhpcy5taW4gIT09IC1JbmZpbml0eSAmJiB0aGlzLnNob3VsZFdyYXAgKSB3cmFwICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA8ICR7dGhpcy5taW59ICkgJHt2YWx1ZVJlZn0gKz0gJHtkaWZmfVxcblxcbmBcblxuICAgIC8vaWYoIHRoaXMubWluID09PSAwICYmIHRoaXMubWF4ID09PSAxICkgeyBcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9IC0gKCR7dmFsdWVSZWZ9IHwgMClcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWluID09PSAwICYmICggTWF0aC5sb2cyKCB0aGlzLm1heCApIHwgMCApID09PSBNYXRoLmxvZzIoIHRoaXMubWF4ICkgKSB7XG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAmICgke3RoaXMubWF4fSAtIDEpXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgKXtcbiAgICAvLyAgd3JhcCA9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5cXG5gXG4gICAgLy99XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwXG5cbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluY3IsIHJlc2V0PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBtaW46MCwgbWF4OjEsIHNob3VsZFdyYXA6IHRydWUgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgaWYoIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSA9PT0gdW5kZWZpbmVkICkgZGVmYXVsdHMuaW5pdGlhbFZhbHVlID0gZGVmYXVsdHMubWluXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW46IGRlZmF1bHRzLm1pbiwgXG4gICAgbWF4OiBkZWZhdWx0cy5tYXgsXG4gICAgaW5pdGlhbDogZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHZhbHVlOiAgZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbmNyLCByZXNldCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICB9XG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYWNvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Fjb3MnOiBNYXRoLmFjb3MgfSlcblxuICAgICAgb3V0ID0gYGdlbi5hY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hY29zKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYWNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhY29zLmlucHV0cyA9IFsgeCBdXG4gIGFjb3MuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWNvcy5uYW1lID0gYCR7YWNvcy5iYXNlbmFtZX17YWNvcy5pZH1gXG5cbiAgcmV0dXJuIGFjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbXVsICAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgZGl2ICAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgZGF0YSAgICAgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgICAgID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBhY2N1bSAgICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGlmZWxzZWYgPSByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgICBsdCAgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIGJhbmcgICAgID0gcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgICBlbnYgICAgICA9IHJlcXVpcmUoICcuL2Vudi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZSA9IDQ0MTAwLCBkZWNheVRpbWUgPSA0NDEwMCwgX3Byb3BzICkgPT4ge1xuICBsZXQgX2JhbmcgPSBiYW5nKCksXG4gICAgICBwaGFzZSA9IGFjY3VtKCAxLCBfYmFuZywgeyBtYXg6IEluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlIH0pLFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNoYXBlOidleHBvbmVudGlhbCcsIGFscGhhOjUgfSwgX3Byb3BzICksXG4gICAgICBidWZmZXJEYXRhLCBkZWNheURhdGEsIG91dCwgYnVmZmVyXG5cbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIGlmKCBwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicgKSB7XG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApLCBtZW1vKCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICkgKSxcbiAgICAgIGx0KCBwaGFzZSwgYXR0YWNrVGltZSArIGRlY2F5VGltZSApLCBzdWIoIDEsIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSApLCBkZWNheVRpbWUgKSApLCBcbiAgICAgIDBcbiAgICApXG4gIH0gZWxzZSB7ICAgICBcbiAgICBidWZmZXJEYXRhID0gZW52KCAxMDI0LCB7IHR5cGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhIH0gKVxuICAgIG91dCA9IGlmZWxzZSggXG4gICAgICBsdCggcGhhc2UsIGF0dGFja1RpbWUgKSwgXG4gICAgICAgIHBlZWsoIGJ1ZmZlckRhdGEsIGRpdiggcGhhc2UsIGF0dGFja1RpbWUgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9ICksIFxuICAgICAgbHQoIHBoYXNlLCBhdHRhY2tUaW1lICsgZGVjYXlUaW1lICksIFxuICAgICAgICBwZWVrKCBidWZmZXJEYXRhLCBzdWIoIDEsIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSApLCBkZWNheVRpbWUgKSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pLCBcbiAgICAgIDBcbiAgICApXG4gIH1cbiAgIFxuICBvdXQudHJpZ2dlciA9IF9iYW5nLnRyaWdnZXJcblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IGFkZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgc3VtID0gMCwgbnVtQ291bnQgPSAwLCBhZGRlckF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgICBvdXQgKz0gdlxuICAgICAgICAgIGlmKCBpIDwgaW5wdXRzLmxlbmd0aCAtMSApIHtcbiAgICAgICAgICAgIGFkZGVyQXRFbmQgPSB0cnVlXG4gICAgICAgICAgICBvdXQgKz0gJyArICdcbiAgICAgICAgICB9XG4gICAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBzdW0gKz0gcGFyc2VGbG9hdCggdiApXG4gICAgICAgICAgbnVtQ291bnQrK1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgXG4gICAgICBpZiggYWxyZWFkeUZ1bGxTdW1tZWQgKSBvdXQgPSAnJ1xuXG4gICAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgICBvdXQgKz0gYWRkZXJBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKyAnICsgc3VtXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKCAhYWxyZWFkeUZ1bGxTdW1tZWQgKSBvdXQgKz0gJyknXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBhZGRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbXVsICAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgZGl2ICAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgZGF0YSAgICAgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgICAgID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBhY2N1bSAgICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGlmZWxzZSAgID0gcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gICAgbHQgICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBiYW5nICAgICA9IHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gICAgZW52ICAgICAgPSByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gICAgcGFyYW0gICAgPSByZXF1aXJlKCAnLi9wYXJhbS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZT00NCwgZGVjYXlUaW1lPTIyMDUwLCBzdXN0YWluVGltZT00NDEwMCwgc3VzdGFpbkxldmVsPS42LCByZWxlYXNlVGltZT00NDEwMCwgX3Byb3BzICkgPT4ge1xuICBsZXQgZW52VHJpZ2dlciA9IGJhbmcoKSxcbiAgICAgIHBoYXNlID0gYWNjdW0oIDEsIGVudlRyaWdnZXIsIHsgbWF4OiBJbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSB9KSxcbiAgICAgIHNob3VsZFN1c3RhaW4gPSBwYXJhbSggMSApLFxuICAgICAgZGVmYXVsdHMgPSB7XG4gICAgICAgICBzaGFwZTogJ2V4cG9uZW50aWFsJyxcbiAgICAgICAgIGFscGhhOiA1LFxuICAgICAgICAgdHJpZ2dlclJlbGVhc2U6IGZhbHNlLFxuICAgICAgfSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIF9wcm9wcyApLFxuICAgICAgYnVmZmVyRGF0YSwgZGVjYXlEYXRhLCBvdXQsIGJ1ZmZlciwgc3VzdGFpbkNvbmRpdGlvbiwgcmVsZWFzZUFjY3VtLCByZWxlYXNlQ29uZGl0aW9uXG5cbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIC8vaWYoIHByb3BzLnNoYXBlID09PSAnbGluZWFyJyApIHtcbiAgLy8gIG91dCA9IGlmZWxzZSggXG4gIC8vICAgIGx0KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSApLCBtZW1vKCBkaXYoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICkgKSxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICksIHN1YiggMSwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKSwgcHJvcHMuZGVjYXlUaW1lICksIDEtcHJvcHMuc3VzdGFpbkxldmVsICkgKSxcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICsgcHJvcHMuc3VzdGFpblRpbWUgKSwgXG4gIC8vICAgICAgcHJvcHMuc3VzdGFpbkxldmVsLFxuICAvLyAgICBsdCggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKyBwcm9wcy5zdXN0YWluVGltZSArIHByb3BzLnJlbGVhc2VUaW1lICksIFxuICAvLyAgICAgIHN1YiggcHJvcHMuc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSArIHByb3BzLmRlY2F5VGltZSArIHByb3BzLnN1c3RhaW5UaW1lICksIHByb3BzLnJlbGVhc2VUaW1lICksIHByb3BzLnN1c3RhaW5MZXZlbCkgKSxcbiAgLy8gICAgMFxuICAvLyAgKVxuICAvL30gZWxzZSB7ICAgICBcbiAgICBidWZmZXJEYXRhID0gZW52KCAxMDI0LCB7IHR5cGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhIH0gKVxuICAgIFxuICAgIHN1c3RhaW5Db25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZSBcbiAgICAgID8gc2hvdWxkU3VzdGFpblxuICAgICAgOiBsdCggcGhhc2UsIGF0dGFja1RpbWUgKyBkZWNheVRpbWUgKyBzdXN0YWluVGltZSApXG5cbiAgICByZWxlYXNlQWNjdW0gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZVxuICAgICAgPyBndHAoIHN1Yiggc3VzdGFpbkxldmVsLCBhY2N1bSggc3VzdGFpbkxldmVsIC8gcmVsZWFzZVRpbWUgLCAwLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSkgKSwgMCApXG4gICAgICA6IHN1Yiggc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSArIGRlY2F5VGltZSArIHN1c3RhaW5UaW1lKSwgcmVsZWFzZVRpbWUgKSwgc3VzdGFpbkxldmVsICkgKSwgXG5cbiAgICByZWxlYXNlQ29uZGl0aW9uID0gcHJvcHMudHJpZ2dlclJlbGVhc2VcbiAgICAgID8gbm90KCBzaG91bGRTdXN0YWluIClcbiAgICAgIDogbHQoIHBoYXNlLCBhdHRhY2tUaW1lICsgZGVjYXlUaW1lICsgc3VzdGFpblRpbWUgKyByZWxlYXNlVGltZSApXG5cbiAgICBvdXQgPSBpZmVsc2UoXG4gICAgICAvLyBhdHRhY2sgXG4gICAgICBsdCggcGhhc2UsICBhdHRhY2tUaW1lICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgIGF0dGFja1RpbWUgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9ICksIFxuXG4gICAgICAvLyBkZWNheVxuICAgICAgbHQoIHBoYXNlLCAgYXR0YWNrVGltZSArICBkZWNheVRpbWUgKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhLCBzdWIoIDEsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSApLCAgZGVjYXlUaW1lICksIHN1YiggMSwgIHN1c3RhaW5MZXZlbCApICkgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgICAgLy8gc3VzdGFpblxuICAgICAgc3VzdGFpbkNvbmRpdGlvbixcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGEsICBzdXN0YWluTGV2ZWwgKSxcblxuICAgICAgLy8gcmVsZWFzZVxuICAgICAgcmVsZWFzZUNvbmRpdGlvbiwgLy9sdCggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSArICByZWxlYXNlVGltZSApLFxuICAgICAgcGVlayggXG4gICAgICAgIGJ1ZmZlckRhdGEsXG4gICAgICAgIHJlbGVhc2VBY2N1bSwgXG4gICAgICAgIC8vc3ViKCAgc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lKSwgIHJlbGVhc2VUaW1lICksICBzdXN0YWluTGV2ZWwgKSApLCBcbiAgICAgICAgeyBib3VuZG1vZGU6J2NsYW1wJyB9XG4gICAgICApLFxuXG4gICAgICAwXG4gICAgKVxuICAvL31cbiAgIFxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAxXG4gICAgZW52VHJpZ2dlci50cmlnZ2VyKClcbiAgfVxuXG4gIG91dC5yZWxlYXNlID0gKCk9PiB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDBcbiAgICAvLyBYWFggcHJldHR5IG5hc3R5Li4uIGdyYWJzIGFjY3VtIGluc2lkZSBvZiBndHAgYW5kIHJlc2V0cyB2YWx1ZSBtYW51YWxseVxuICAgIC8vIHVuZm9ydHVuYXRlbHkgZW52VHJpZ2dlciB3b24ndCB3b3JrIGFzIGl0J3MgYmFjayB0byAwIGJ5IHRoZSB0aW1lIHRoZSByZWxlYXNlIGJsb2NrIGlzIHRyaWdnZXJlZC4uLlxuICAgIGdlbi5tZW1vcnkuaGVhcFsgcmVsZWFzZUFjY3VtLmlucHV0c1swXS5pbnB1dHNbMV0ubWVtb3J5LnZhbHVlLmlkeCBdID0gMFxuICB9XG5cbiAgcmV0dXJuIG91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FuZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gYCAgbGV0ICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfSAhPT0gMCAmJiAke2lucHV0c1sxXX0gIT09IDAgfCAwXFxuXFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1gLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhc2luJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYXNpbic6IE1hdGguYXNpbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFzaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFzaW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFzaW4uaW5wdXRzID0gWyB4IF1cbiAgYXNpbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhc2luLm5hbWUgPSBgJHthc2luLmJhc2VuYW1lfXthc2luLmlkfWBcblxuICByZXR1cm4gYXNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhdGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYXRhbic6IE1hdGguYXRhbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmF0YW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmF0YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGF0YW4uaW5wdXRzID0gWyB4IF1cbiAgYXRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhdGFuLm5hbWUgPSBgJHthdGFuLmJhc2VuYW1lfXthdGFuLmlkfWBcblxuICByZXR1cm4gYXRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGVjYXlUaW1lID0gNDQxMDAgKSA9PiB7XG4gIGxldCBzc2QgPSBoaXN0b3J5ICggMSApLFxuICAgICAgdDYwID0gTWF0aC5leHAoIC02LjkwNzc1NTI3ODkyMSAvIGRlY2F5VGltZSApXG5cbiAgc3NkLmluKCBtdWwoIHNzZC5vdXQsIHQ2MCApIClcblxuICBzc2Qub3V0LnJ1biA9ICgpPT4ge1xuICAgIHNzZC52YWx1ZSA9IDFcbiAgfVxuXG4gIHJldHVybiBzdWIoIDEsIHNzZC5vdXQgKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgZ2VuKCkge1xuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgbGV0IG91dCA9IFxuYCAgbGV0ICR7dGhpcy5uYW1lfSA9IG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dXG4gIGlmKCAke3RoaXMubmFtZX0gPT09IDEgKSBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XSA9IDAgICAgICBcbiAgICAgIFxuYFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggX3Byb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOjAsIG1heDoxIH0sIF9wcm9wcyApXG5cbiAgdWdlbi5uYW1lID0gJ2JhbmcnICsgZ2VuLmdldFVJRCgpXG5cbiAgdWdlbi5taW4gPSBwcm9wcy5taW5cbiAgdWdlbi5tYXggPSBwcm9wcy5tYXhcblxuICB1Z2VuLnRyaWdnZXIgPSAoKSA9PiB7XG4gICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IHVnZW4ubWF4IFxuICB9XG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidib29sJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgJHtpbnB1dHNbMF19ID09PSAwID8gMCA6IDFgXG4gICAgXG4gICAgLy9nZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgLy9yZXR1cm4gWyBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YCwgJyAnICtvdXQgXVxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonY2VpbCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmNlaWwgfSlcblxuICAgICAgb3V0ID0gYGdlbi5jZWlsKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNlaWwoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjZWlsID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGNlaWwuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gY2VpbFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vcj0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiAgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjbGlwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0XG5cbiAgICBvdXQgPVxuXG5gIGxldCAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cbiAgaWYoICR7dGhpcy5uYW1lfSA+ICR7aW5wdXRzWzJdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzJdfVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPCAke2lucHV0c1sxXX0gKSAke3RoaXMubmFtZX0gPSAke2lucHV0c1sxXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPS0xLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xLCBtaW4sIG1heCBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdjb3MnOiBNYXRoLmNvcyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmNvcyggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY29zKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgY29zID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGNvcy5pbnB1dHMgPSBbIHggXVxuICBjb3MuaWQgPSBnZW4uZ2V0VUlEKClcbiAgY29zLm5hbWUgPSBgJHtjb3MuYmFzZW5hbWV9e2Nvcy5pZH1gXG5cbiAgcmV0dXJuIGNvc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjb3VudGVyJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5XG4gICAgICAgXG4gICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgZnVuY3Rpb25Cb2R5ICA9IHRoaXMuY2FsbGJhY2soIGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdLCBpbnB1dHNbMl0sIGlucHV0c1szXSwgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCwgYG1lbW9yeVske3RoaXMubWVtb3J5LndyYXAuaWR4fV1gICApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG4gICBcbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMud3JhcC5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHRoaXMud3JhcC5nZW4oKVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgY2FsbGJhY2soIF9uYW1lLCBfaW5jciwgX21pbiwgX21heCwgX3Jlc2V0LCB2YWx1ZVJlZiwgd3JhcFJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICBcbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzNdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1szXSA8IDEpICkgeyBcbiAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49IDEgKSAke3ZhbHVlUmVmfSA9ICR7X21pbn1cXG5gXG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIGxldCAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfTtcXG4gICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgXG4gICAgaWYoIHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmICB0eXBlb2YgdGhpcy5taW4gPT09ICdudW1iZXInICkge1xuICAgICAgd3JhcCA9IFxuYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHtfbWF4fSApIHtcbiAgICAke3ZhbHVlUmVmfSAtPSAke19tYXh9IC0gJHtfbWlufVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNlIGlmKCAke3ZhbHVlUmVmfSA8ICR7X21pbn0gKSB7XG4gICAgJHt2YWx1ZVJlZn0gKz0gJHtfbWF4fSAtICR7X21pbn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNle1xuICAgICAgb3V0ICs9ICdcXG4nXG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyPTEsIG1pbj0wLCBtYXg9SW5maW5pdHksIHJlc2V0PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0aWFsVmFsdWU6IDAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW46ICAgIG1pbiwgXG4gICAgbWF4OiAgICBtYXgsXG4gICAgdmFsdWU6ICBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIG1pbiwgbWF4LCByZXNldCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9LFxuICAgICAgd3JhcDogIHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IFxuICAgIH0sXG4gICAgd3JhcCA6IHtcbiAgICAgIGdlbigpIHsgXG4gICAgICAgIGlmKCB1Z2VuLm1lbW9yeS53cmFwLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICB9XG4gICAgICAgIGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyAke3VnZW4ubWVtb3J5LndyYXAuaWR4fSBdYFxuICAgICAgICByZXR1cm4gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWAgXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBkZWZhdWx0cyApXG4gXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIFxuICB1Z2VuLndyYXAuaW5wdXRzID0gWyB1Z2VuIF1cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcbiAgdWdlbi53cmFwLm5hbWUgPSB1Z2VuLm5hbWUgKyAnX3dyYXAnXG4gIHJldHVybiB1Z2VuXG59IFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwaGFzb3I9cmVxdWlyZSggJy4vcGhhc29yLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY3ljbGUnLFxuXG4gIGluaXRUYWJsZSgpIHsgICAgXG4gICAgbGV0IGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDAsIGwgPSBidWZmZXIubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSBNYXRoLnNpbiggKCBpIC8gbCApICogKCBNYXRoLlBJICogMiApIClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy50YWJsZSA9IGRhdGEoIGJ1ZmZlciApXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAgKSA9PiB7XG4gIGlmKCBnZW4uZ2xvYmFscy50YWJsZSA9PT0gdW5kZWZpbmVkICkgcHJvdG8uaW5pdFRhYmxlKCkgXG4gIFxuICBsZXQgdWdlbiA9IHBlZWsoIGdlbi5nbG9iYWxzLnRhYmxlLCBwaGFzb3IoIGZyZXF1ZW5jeSwgcmVzZXQsIHsgbWluOjAgfSApKVxuICB1Z2VuLm5hbWUgPSAnY3ljbGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgdXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RhdGEnLFxuICBnbG9iYWxzOiB7fSxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlkeFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGxldCB1Z2VuID0gdGhpc1xuICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5ICkgLy8sICgpPT4geyAgY29uc29sZS5sb2coXCJDQUxMRURcIiwgdWdlbik7IGdlbi5tZW1vcnkuc2V0KCB1Z2VuLmJ1ZmZlciwgaWR4ICkgfSApXG4gICAgICAvL2NvbnNvbGUubG9nKCAnTUVNT1JZJywgdGhpcy5tZW1vcnksIHRoaXMuYnVmZmVyLmxlbmd0aCApXG4gICAgICBpZHggPSB0aGlzLm1lbW9yeS52YWx1ZXMuaWR4XG4gICAgICB0cnkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXAuc2V0KCB0aGlzLmJ1ZmZlciwgaWR4IClcbiAgICAgIH1jYXRjaCggZSApIHtcbiAgICAgICAgY29uc29sZS5sb2coIGUgKVxuICAgICAgICB0aHJvdyBFcnJvciggJ2Vycm9yIHdpdGggcmVxdWVzdC4gYXNraW5nIGZvciAnICsgdGhpcy5idWZmZXIubGVuZ3RoICsnLiBjdXJyZW50IGluZGV4OiAnICsgZ2VuLm1lbW9yeUluZGV4ICsgJyBvZiAnICsgZ2VuLm1lbW9yeS5oZWFwLmxlbmd0aCApXG4gICAgICB9XG4gICAgICAvL2dlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IHRoaXNcbiAgICAgIC8vcmV0dXJuICdnZW4ubWVtb3J5JyArIHRoaXMubmFtZSArICcuYnVmZmVyJ1xuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaWR4XG4gICAgfWVsc2V7XG4gICAgICBpZHggPSBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgICB9XG4gICAgcmV0dXJuIGlkeFxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggeCwgeT0xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiwgYnVmZmVyLCBzaG91bGRMb2FkID0gZmFsc2VcbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5nbG9iYWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF0gKSB7XG4gICAgICByZXR1cm4gZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF1cbiAgICB9XG4gIH1cblxuICBpZiggdHlwZW9mIHggPT09ICdudW1iZXInICkge1xuICAgIGlmKCB5ICE9PSAxICkge1xuICAgICAgYnVmZmVyID0gW11cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgeTsgaSsrICkge1xuICAgICAgICBidWZmZXJbIGkgXSA9IG5ldyBGbG9hdDMyQXJyYXkoIHggKVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgfVxuICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggeCApICkgeyAvLyEgKHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSApIHtcbiAgICBsZXQgc2l6ZSA9IHgubGVuZ3RoXG4gICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggc2l6ZSApXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSB4WyBpIF1cbiAgICB9XG4gIH1lbHNlIGlmKCB0eXBlb2YgeCA9PT0gJ3N0cmluZycgKSB7XG4gICAgYnVmZmVyID0geyBsZW5ndGg6IHkgPiAxID8geSA6IGdlbi5zYW1wbGVyYXRlICogNjAgfVxuICAgIHNob3VsZExvYWQgPSB0cnVlXG4gIH1lbHNlIGlmKCB4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkge1xuICAgIGJ1ZmZlciA9IHhcbiAgfVxuICBcbiAgdWdlbiA9IHsgXG4gICAgYnVmZmVyLFxuICAgIG5hbWU6IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpLFxuICAgIGRpbTogIGJ1ZmZlci5sZW5ndGgsXG4gICAgY2hhbm5lbHMgOiAxLFxuICAgIGdlbjogIHByb3RvLmdlbixcbiAgICBvbmxvYWQ6IG51bGwsXG4gICAgdGhlbiggZm5jICkge1xuICAgICAgdWdlbi5vbmxvYWQgPSBmbmNcbiAgICAgIHJldHVybiB1Z2VuXG4gICAgfSxcbiAgfVxuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlczogeyBsZW5ndGg6dWdlbi5kaW0sIGluZGV4Om51bGwgfVxuICB9XG5cbiAgZ2VuLm5hbWUgPSAnZGF0YScrZ2VuLmdldFVJRCgpXG5cbiAgaWYoIHNob3VsZExvYWQgKSB7XG4gICAgbGV0IHByb21pc2UgPSB1dGlsaXRpZXMubG9hZFNhbXBsZSggeCwgdWdlbiApXG4gICAgcHJvbWlzZS50aGVuKCAoIF9idWZmZXIgKT0+IHsgXG4gICAgICB1Z2VuLm1lbW9yeS52YWx1ZXMubGVuZ3RoID0gX2J1ZmZlci5sZW5ndGggICAgIFxuICAgICAgdWdlbi5vbmxvYWQoKSBcbiAgICB9KVxuICB9XG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQgKSB7XG4gICAgZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF0gPSB1Z2VuXG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB4MSA9IGhpc3RvcnkoKSxcbiAgICAgIHkxID0gaGlzdG9yeSgpLFxuICAgICAgZmlsdGVyXG5cbiAgLy9IaXN0b3J5IHgxLCB5MTsgeSA9IGluMSAtIHgxICsgeTEqMC45OTk3OyB4MSA9IGluMTsgeTEgPSB5OyBvdXQxID0geTtcbiAgZmlsdGVyID0gbWVtbyggYWRkKCBzdWIoIGluMSwgeDEub3V0ICksIG11bCggeTEub3V0LCAuOTk5NyApICkgKVxuICB4MS5pbiggaW4xIClcbiAgeTEuaW4oIGZpbHRlciApXG5cbiAgcmV0dXJuIGZpbHRlclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwICkgPT4ge1xuICBsZXQgc3NkID0gaGlzdG9yeSAoIDEgKSxcbiAgICAgIHQ2MCA9IE1hdGguZXhwKCAtNi45MDc3NTUyNzg5MjEgLyBkZWNheVRpbWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAgKSApXG5cbiAgc3NkLm91dC5ydW4gPSAoKT0+IHtcbiAgICBzc2QudmFsdWUgPSAxXG4gIH1cblxuICByZXR1cm4gc3NkLm91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcG9rZSA9IHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gICAgd3JhcCA9IHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL2FjY3VtLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGVsYXknLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaW5wdXRzWzBdXG4gICAgXG4gICAgcmV0dXJuIGlucHV0c1swXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCB0aW1lPTI1NiwgLi4udGFwc0FuZFByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBzaXplOiA1MTIsIGZlZWRiYWNrOjAsIGludGVycDonbGluZWFyJyB9LFxuICAgICAgd3JpdGVJZHgsIHJlYWRJZHgsIGRlbGF5ZGF0YSwgcHJvcGVydGllcywgdGFwVGltZXMgPSBbIHRpbWUgXSwgdGFwc1xuICBcbiAgaWYoIEFycmF5LmlzQXJyYXkoIHRhcHNBbmRQcm9wZXJ0aWVzICkgKSB7XG4gICAgcHJvcGVydGllcyA9IHRhcHNBbmRQcm9wZXJ0aWVzWyB0YXBzQW5kUHJvcGVydGllcy5sZW5ndGggLSAxIF1cbiAgICBpZiggdGFwc0FuZFByb3BlcnRpZXMubGVuZ3RoID4gMSApIHtcbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgdGFwc0FuZFByb3BlcnRpZXMubGVuZ3RoIC0gMTsgaSsrICl7XG4gICAgICAgIHRhcFRpbWVzLnB1c2goIHRhcHNBbmRQcm9wZXJ0aWVzWyBpIF0gKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgaWYoIGRlZmF1bHRzLnNpemUgPCB0aW1lICkgZGVmYXVsdHMuc2l6ZSA9IHRpbWVcblxuICBkZWxheWRhdGEgPSBkYXRhKCBkZWZhdWx0cy5zaXplIClcbiAgXG4gIHVnZW4uaW5wdXRzID0gW11cblxuICB3cml0ZUlkeCA9IGFjY3VtKCAxLCAwLCB7IG1heDpkZWZhdWx0cy5zaXplIH0pIFxuICBcbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0YXBUaW1lcy5sZW5ndGg7IGkrKyApIHtcbiAgICB1Z2VuLmlucHV0c1sgaSBdID0gcGVlayggZGVsYXlkYXRhLCB3cmFwKCBzdWIoIHdyaXRlSWR4LCB0YXBUaW1lc1tpXSApLCAwLCBkZWZhdWx0cy5zaXplICkseyBtb2RlOidzYW1wbGVzJywgaW50ZXJwOmRlZmF1bHRzLmludGVycCB9KVxuICB9XG4gIFxuICB1Z2VuLm91dHB1dHMgPSB1Z2VuLmlucHV0cyAvLyB1Z24sIFVnaCwgVUdIISBidXQgaSBndWVzcyBpdCB3b3Jrcy5cblxuICBwb2tlKCBkZWxheWRhdGEsIGluMSwgd3JpdGVJZHggKVxuXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgbjEgPSBoaXN0b3J5KClcbiAgICBcbiAgbjEuaW4oIGluMSApXG5cbiAgbGV0IHVnZW4gPSBzdWIoIGluMSwgbjEub3V0IClcbiAgdWdlbi5uYW1lID0gJ2RlbHRhJytnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IGRpdiA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICAgIGRpdkF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgLyB2XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC8gJHt2fWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnIC8gJyBcbiAgICAgIH0pXG5cbiAgICAgIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIGRpdlxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuJyApLFxuICAgIHdpbmRvd3MgPSByZXF1aXJlKCAnLi93aW5kb3dzJyApLFxuICAgIGRhdGEgICAgPSByZXF1aXJlKCAnLi9kYXRhJyApLFxuICAgIHBlZWsgICAgPSByZXF1aXJlKCAnLi9wZWVrJyApLFxuICAgIHBoYXNvciAgPSByZXF1aXJlKCAnLi9waGFzb3InIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGxlbmd0aCA9IDExMDI1LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgZGVmYXVsdHMgPSB7XG4gICAgICAgIHR5cGU6ICdUcmlhbmd1bGFyJyxcbiAgICAgICAgYnVmZmVyTGVuZ3RoOiAxMDI0LFxuICAgICAgICBhbHBoYTogLjE1XG4gICAgICB9LFxuICAgICAgZnJlcXVlbmN5ID0gbGVuZ3RoIC8gZ2VuLnNhbXBsZXJhdGUsXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBwcm9wZXJ0aWVzICksXG4gICAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBwcm9wcy5idWZmZXJMZW5ndGggKVxuXG4gIGlmKCBnZW4uZ2xvYmFscy53aW5kb3dzWyBwcm9wcy50eXBlIF0gPT09IHVuZGVmaW5lZCApIGdlbi5nbG9iYWxzLndpbmRvd3NbIHByb3BzLnR5cGUgXSA9IHt9XG5cbiAgaWYoIGdlbi5nbG9iYWxzLndpbmRvd3NbIHByb3BzLnR5cGUgXVsgcHJvcHMuYnVmZmVyTGVuZ3RoIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHByb3BzLmJ1ZmZlckxlbmd0aDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSB3aW5kb3dzWyBwcm9wcy50eXBlIF0oIHByb3BzLmJ1ZmZlckxlbmd0aCwgaSwgcHJvcHMuYWxwaGEgKVxuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLndpbmRvd3NbIHByb3BzLnR5cGUgXVsgcHJvcHMuYnVmZmVyTGVuZ3RoIF0gPSBkYXRhKCBidWZmZXIgKVxuICB9XG5cbiAgbGV0IHVnZW4gPSBnZW4uZ2xvYmFscy53aW5kb3dzWyBwcm9wcy50eXBlIF1bIHByb3BzLmJ1ZmZlckxlbmd0aCBdIC8vcGVlayggZ2VuLmdsb2JhbHMud2luZG93c1sgcHJvcHMudHlwZSBdWyBwcm9wcy5idWZmZXJMZW5ndGggXSwgcGhhc29yKCBmcmVxdWVuY3ksIDAsIHsgbWluOjAgfSApKVxuICB1Z2VuLm5hbWUgPSAnZW52JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZmxvb3InLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICAvL2dlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmZsb29yIH0pXG5cbiAgICAgIG91dCA9IGAoICR7aW5wdXRzWzBdfSB8IDAgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gfCAwXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgZmxvb3IgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZmxvb3IuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gZmxvb3Jcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZm9sZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dFxuXG4gICAgb3V0ID0gdGhpcy5jcmVhdGVDYWxsYmFjayggaW5wdXRzWzBdLCB0aGlzLm1pbiwgdGhpcy5tYXggKSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgb3V0IF1cbiAgfSxcblxuICBjcmVhdGVDYWxsYmFjayggdiwgbG8sIGhpICkge1xuICAgIGxldCBvdXQgPVxuYCBsZXQgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2fSxcbiAgICAgICR7dGhpcy5uYW1lfV9yYW5nZSA9ICR7aGl9IC0gJHtsb30sXG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAwXG5cbiAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlID49ICR7aGl9KXtcbiAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlXG4gICAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlID49ICR7aGl9KXtcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9ICgoJHt0aGlzLm5hbWV9X3ZhbHVlIC0gJHtsb30pIC8gJHt0aGlzLm5hbWV9X3JhbmdlKSB8IDBcbiAgICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2UgKiAke3RoaXMubmFtZX1fbnVtV3JhcHNcbiAgICB9XG4gICAgJHt0aGlzLm5hbWV9X251bVdyYXBzKytcbiAgfSBlbHNlIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA8ICR7bG99KXtcbiAgICAke3RoaXMubmFtZX1fdmFsdWUgKz0gJHt0aGlzLm5hbWV9X3JhbmdlXG4gICAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlIDwgJHtsb30pe1xuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gKCgke3RoaXMubmFtZX1fdmFsdWUgLSAke2xvfSkgLyAke3RoaXMubmFtZX1fcmFuZ2UtIDEpIHwgMFxuICAgICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZSAqICR7dGhpcy5uYW1lfV9udW1XcmFwc1xuICAgIH1cbiAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMtLVxuICB9XG4gIGlmKCR7dGhpcy5uYW1lfV9udW1XcmFwcyAmIDEpICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7aGl9ICsgJHtsb30gLSAke3RoaXMubmFtZX1fdmFsdWVcbmBcbiAgICByZXR1cm4gJyAnICsgb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2dhdGUnLFxuICBjb250cm9sU3RyaW5nOm51bGwsIC8vIGluc2VydCBpbnRvIG91dHB1dCBjb2RlZ2VuIGZvciBkZXRlcm1pbmluZyBpbmRleGluZ1xuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG4gICAgXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBsZXQgbGFzdElucHV0TWVtb3J5SWR4ID0gJ21lbW9yeVsgJyArIHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAnIF0nLFxuICAgICAgICBvdXRwdXRNZW1vcnlTdGFydElkeCA9IHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAxLFxuICAgICAgICBpbnB1dFNpZ25hbCA9IGlucHV0c1swXSxcbiAgICAgICAgY29udHJvbFNpZ25hbCA9IGlucHV0c1sxXVxuICAgIFxuICAgIC8qIFxuICAgICAqIHdlIGNoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCBjb250cm9sIGlucHV0cyBlcXVhbHMgb3VyIGxhc3QgaW5wdXRcbiAgICAgKiBpZiBzbywgd2Ugc3RvcmUgdGhlIHNpZ25hbCBpbnB1dCBpbiB0aGUgbWVtb3J5IGFzc29jaWF0ZWQgd2l0aCB0aGUgY3VycmVudGx5XG4gICAgICogc2VsZWN0ZWQgaW5kZXguIElmIG5vdCwgd2UgcHV0IDAgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGxhc3Qgc2VsZWN0ZWQgaW5kZXgsXG4gICAgICogY2hhbmdlIHRoZSBzZWxlY3RlZCBpbmRleCwgYW5kIHRoZW4gc3RvcmUgdGhlIHNpZ25hbCBpbiBwdXQgaW4gdGhlIG1lbWVyeSBhc3NvaWNhdGVkXG4gICAgICogd2l0aCB0aGUgbmV3bHkgc2VsZWN0ZWQgaW5kZXhcbiAgICAgKi9cbiAgICBcbiAgICBvdXQgPVxuXG5gIGlmKCAke2NvbnRyb2xTaWduYWx9ICE9PSAke2xhc3RJbnB1dE1lbW9yeUlkeH0gKSB7XG4gICAgbWVtb3J5WyAke2xhc3RJbnB1dE1lbW9yeUlkeH0gKyAke291dHB1dE1lbW9yeVN0YXJ0SWR4fSAgXSA9IDAgXG4gICAgJHtsYXN0SW5wdXRNZW1vcnlJZHh9ID0gJHtjb250cm9sU2lnbmFsfVxuICB9XG4gIG1lbW9yeVsgJHtvdXRwdXRNZW1vcnlTdGFydElkeH0gKyAke2NvbnRyb2xTaWduYWx9IF0gPSAke2lucHV0U2lnbmFsfVxuXG5gXG4gICAgdGhpcy5jb250cm9sU3RyaW5nID0gaW5wdXRzWzFdXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgdGhpcy5vdXRwdXRzLmZvckVhY2goIHYgPT4gdi5nZW4oKSApXG5cbiAgICByZXR1cm4gWyBudWxsLCAnICcgKyBvdXQgXVxuICB9LFxuXG4gIGNoaWxkZ2VuKCkge1xuICAgIGlmKCB0aGlzLnBhcmVudC5pbml0aWFsaXplZCA9PT0gZmFsc2UgKSB7XG4gICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzICkgLy8gcGFyZW50IGdhdGUgaXMgb25seSBpbnB1dCBvZiBhIGdhdGUgb3V0cHV0LCBzaG91bGQgb25seSBiZSBnZW4nZCBvbmNlLlxuICAgIH1cblxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG5cbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbICR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fSBdYFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gIGBtZW1vcnlbICR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fSBdYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjb3VudDogMiB9XG5cbiAgaWYoIHR5cGVvZiBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIG91dHB1dHM6IFtdLFxuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgY29udHJvbCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgbGFzdElucHV0OiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgfSxcbiAgICBpbml0aWFsaXplZDpmYWxzZVxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7Z2VuLmdldFVJRCgpfWBcblxuICBmb3IoIGxldCBpID0gMDsgaSA8IHVnZW4uY291bnQ7IGkrKyApIHtcbiAgICB1Z2VuLm91dHB1dHMucHVzaCh7XG4gICAgICBpbmRleDppLFxuICAgICAgZ2VuOiBwcm90by5jaGlsZGdlbixcbiAgICAgIHBhcmVudDp1Z2VuLFxuICAgICAgaW5wdXRzOiBbIHVnZW4gXSxcbiAgICAgIG1lbW9yeToge1xuICAgICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgICAgfSxcbiAgICAgIGluaXRpYWxpemVkOmZhbHNlLFxuICAgICAgbmFtZTogYCR7dWdlbi5uYW1lfV9vdXQke2dlbi5nZXRVSUQoKX1gXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuLyogZ2VuLmpzXG4gKlxuICogbG93LWxldmVsIGNvZGUgZ2VuZXJhdGlvbiBmb3IgdW5pdCBnZW5lcmF0b3JzXG4gKlxuICovXG5cbmxldCBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCAnbWVtb3J5LWhlbHBlcicgKVxuXG5sZXQgZ2VuID0ge1xuXG4gIGFjY3VtOjAsXG4gIGdldFVJRCgpIHsgcmV0dXJuIHRoaXMuYWNjdW0rKyB9LFxuICBkZWJ1ZzpmYWxzZSxcbiAgc2FtcGxlcmF0ZTogNDQxMDAsIC8vIGNoYW5nZSBvbiBhdWRpb2NvbnRleHQgY3JlYXRpb25cbiAgc2hvdWxkTG9jYWxpemU6IGZhbHNlLFxuICBnbG9iYWxzOntcbiAgICB3aW5kb3dzOiB7fSxcbiAgfSxcbiAgXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICogWFhYIFNob3VsZCBwcm9iYWJseSBiZSByZW5hbWVkIGNhbGxiYWNrUHJvcGVydGllcyBvciBzb21ldGhpbmcgc2ltaWxhci4uLiBjbG9zdXJlcyBhcmUgbm8gbG9uZ2VyIHVzZWQuXG4gICAqL1xuXG4gIGNsb3N1cmVzOiBuZXcgU2V0KCksXG4gIHBhcmFtczogICBuZXcgU2V0KCksXG5cbiAgcGFyYW1ldGVyczpbXSxcbiAgZW5kQmxvY2s6IG5ldyBTZXQoKSxcbiAgaGlzdG9yaWVzOiBuZXcgTWFwKCksXG4gIG1lbW9yeUluZGV4OiAwLFxuXG4gIG1lbW86IHt9LFxuXG4gIGRhdGE6IHt9LFxuICBcbiAgLyogZXhwb3J0XG4gICAqXG4gICAqIHBsYWNlIGdlbiBmdW5jdGlvbnMgaW50byBhbm90aGVyIG9iamVjdCBmb3IgZWFzaWVyIHJlZmVyZW5jZVxuICAgKi9cblxuICBleHBvcnQoIG9iaiApIHt9LFxuXG4gIGFkZFRvRW5kQmxvY2soIHYgKSB7XG4gICAgdGhpcy5lbmRCbG9jay5hZGQoICcgICcgKyB2IClcbiAgfSxcbiAgXG4gIG1lbW9yeUxlbmd0aCA6IDAsXG5cbiAgLy9yZXF1ZXN0TWVtb3J5KCBhbW91bnQgKSB7XG4gIC8vICBsZXQgaWR4ID0gdGhpcy5tZW1vcnlTaXplIFxuICAgIFxuICAvLyAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgpXG4gIC8vICBwcm9taXNlLmFtb3VudCA9IGFtb3VudFxuXG4gIC8vICB0aGlzLm1lbW9yeVByb21pc2VzLnB1c2goIHByb21pc2UgKVxuXG4gIC8vICByZXR1cm4gcHJvbWlzZVxuICAvL30sXG5cbiAgbWVtb3J5Q2FsbGJhY2tzOiBbXSxcbiAgXG4gIGdldE1lbW9yeUxlbmd0aCggdWdlbiApIHtcblxuICAgIGZ1bmN0aW9uIGdldE1lbW9yeUZvckNoYW5uZWwoIHVnZW4gKSB7XG4gICAgICBpZiggdWdlbiAhPT0gdW5kZWZpbmVkICYmIGlzTmFOKCB1Z2VuICkgJiYgdWdlbi5tYXJrZWQgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgaWYoIHVnZW4ubWVtb3J5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgbGV0IG1lbW9yeSA9IHVnZW4ubWVtb3J5XG4gICAgICAgICAgZm9yKCBsZXQgaW5kZXhOYW1lIGluIG1lbW9yeSApIHtcbiAgICAgICAgICAgIGxldCByZXF1ZXN0ID0gbWVtb3J5WyBpbmRleE5hbWUgXVxuICAgICAgICAgICAgZ2VuLm1lbW9yeUxlbmd0aCArPSByZXF1ZXN0Lmxlbmd0aFxuICAgICAgICAgICAgLy9jb25zb2xlLmxvZyggJ3VnZW46Jyx1Z2VuLm5hbWUsICdyZXF1ZXN0OicscmVxdWVzdC5sZW5ndGgsICd0b3RhbDonLCBnZW4ubWVtb3J5TGVuZ3RoIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdWdlbi5tYXJrZWQgPSB0cnVlXG5cbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIHVnZW4uaW5wdXRzICkgKSB1Z2VuLmlucHV0cy5mb3JFYWNoKCBnZXRNZW1vcnlGb3JDaGFubmVsIClcbiAgICAgIH0gXG4gICAgfSAgXG5cbiAgICBpZiggQXJyYXkuaXNBcnJheSggdWdlbiApICkge1xuICAgICAgdWdlbi5mb3JFYWNoKCBnZXRNZW1vcnlGb3JDaGFubmVsIClcbiAgICB9ZWxzZXtcbiAgICAgIGdldE1lbW9yeUZvckNoYW5uZWwoIHVnZW4gKVxuICAgIH1cblxuICAgIHRoaXMuaGlzdG9yaWVzLmZvckVhY2goIGdldE1lbW9yeUZvckNoYW5uZWwgKVxuICB9LFxuICBcbiAgcmVxdWVzdE1lbW9yeSggbWVtb3J5U3BlYywgY2IgKSB7XG4gICAgZm9yKCBsZXQga2V5IGluIG1lbW9yeVNwZWMgKSB7XG4gICAgICBsZXQgcmVxdWVzdCA9IG1lbW9yeVNwZWNbIGtleSBdXG5cbiAgICAgIHJlcXVlc3QuaWR4ID0gZ2VuLm1lbW9yeS5hbGxvYyggcmVxdWVzdC5sZW5ndGggKVxuICAgIFxuXG4gICAgLy8gIGlmKCByZXF1ZXN0Lmdsb2JhbCAhPT0gdW5kZWZpbmVkICkgeyBcbiAgICAvLyAgICBpZiggZ2VuLnNoYXJlZE1lbW9yeVsga2V5IF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICAvLyAgICAgIHJlcXVlc3QuaWR4ID0gZ2VuLnNoYXJlZE1lbW9yeVsga2V5IF1cbiAgICAvLyAgICB9ZWxzZXtcbiAgICAvLyAgICAgIGdlbi5zaGFyZWRNZW1vcnlbIGtleSBdID0gcmVxdWVzdC5pZHggPSBnZW4ubWVtb3J5SW5kZXhcbiAgICAvLyAgICAgIGdlbi5tZW1vcnlJbmRleCArPSByZXF1ZXN0Lmxlbmd0aFxuICAgIC8vICAgIH1cbiAgICAvLyAgfSBlbHNlIHtcbiAgICAvLyAgICByZXF1ZXN0LmlkeCA9IGdlbi5tZW1vcnlJbmRleFxuICAgIC8vICAgIGdlbi5tZW1vcnlJbmRleCArPSByZXF1ZXN0Lmxlbmd0aFxuICAgIC8vICB9XG4gICAgLy99XG4gICAgLy9pZiggdHlwZW9mIGNiID09PSAnZnVuY3Rpb24nICkge1xuICAgIC8vICBnZW4ubWVtb3J5Q2FsbGJhY2tzLnB1c2goIGNiIClcbiAgICB9XG4gICAgXG5cbiAgfSxcblxuICBzaGFyZWRNZW1vcnk6e30sXG5cbiAgLyogY3JlYXRlQ2FsbGJhY2tcbiAgICpcbiAgICogcGFyYW0gdWdlbiAtIEhlYWQgb2YgZ3JhcGggdG8gYmUgY29kZWdlbidkXG4gICAqXG4gICAqIEdlbmVyYXRlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBhIHBhcnRpY3VsYXIgdWdlbiBncmFwaC5cbiAgICogVGhlIGdlbi5jbG9zdXJlcyBwcm9wZXJ0eSBzdG9yZXMgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZVxuICAgKiBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBmaW5hbCBmdW5jdGlvbjsgdGhlc2UgYXJlIHByZWZpeGVkXG4gICAqIGJlZm9yZSBhbnkgZGVmaW5lZCBwYXJhbXMgdGhlIGdyYXBoIGV4cG9zZXMuIEZvciBleGFtcGxlLCBnaXZlbjpcbiAgICpcbiAgICogZ2VuLmNyZWF0ZUNhbGxiYWNrKCBhYnMoIHBhcmFtKCkgKSApXG4gICAqXG4gICAqIC4uLiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHdpbGwgaGF2ZSBhIHNpZ25hdHVyZSBvZiAoIGFicywgcDAgKS5cbiAgICovXG4gIFxuICBjcmVhdGVDYWxsYmFjayggdWdlbiwgbWVtLCBkZWJ1ZyA9IGZhbHNlICkge1xuICAgIGxldCBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIHVnZW4gKSAmJiB1Z2VuLmxlbmd0aCA+IDEsXG4gICAgICAgIGNhbGxiYWNrLCBcbiAgICAgICAgY2hhbm5lbDEsIGNoYW5uZWwyXG5cbiAgICBpZiggdHlwZW9mIG1lbSA9PT0gJ251bWJlcicgfHwgbWVtID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCBtZW0gKVxuICAgIH1cbiAgICBcbiAgICAvL2NvbnNvbGUubG9nKCAnY2IgbWVtb3J5OicsIG1lbSApXG4gICAgdGhpcy5tZW1vcnkgPSBtZW1cbiAgICB0aGlzLm1lbW8gPSB7fSBcbiAgICB0aGlzLmVuZEJsb2NrLmNsZWFyKClcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKClcbiAgICB0aGlzLnBhcmFtcy5jbGVhcigpXG4gICAgdGhpcy5nbG9iYWxzID0geyB3aW5kb3dzOnt9IH1cbiAgICBcbiAgICB0aGlzLnBhcmFtZXRlcnMubGVuZ3RoID0gMFxuICAgIFxuICAgIC8vdGhpcy5tZW1vcnlMZW5ndGggPSAwXG4gICAgLy90aGlzLm1lbW9yeUNhbGxiYWNrcy5sZW5ndGggPSAwXG4gICAgLy90aGlzLmdldE1lbW9yeUxlbmd0aCggdWdlbiApXG5cbiAgICAvL3RoaXMubWVtb3J5ID0gbmV3IEZsb2F0MzJBcnJheSggdGhpcy5tZW1vcnlMZW5ndGggKVxuXG4gICAgLy90aGlzLm1lbW9yeUNhbGxiYWNrcy5mb3JFYWNoKCB2ID0+IHtcbiAgICAvLyAgdigpXG4gICAgLy99KVxuICAgIC8vdGhpcy5tZW1vcnlJbmRleCA9IDBcblxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gXCIgICd1c2Ugc3RyaWN0J1xcbiAgbGV0IG1lbW9yeSA9IGdlbi5tZW1vcnlcXG5cXG5cIjtcblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDEgKyBpc1N0ZXJlbzsgaSsrICkge1xuICAgICAgaWYoIHR5cGVvZiB1Z2VuW2ldID09PSAnbnVtYmVyJyApIGNvbnRpbnVlXG5cbiAgICAgIGxldCBjaGFubmVsID0gaXNTdGVyZW8gPyB1Z2VuW2ldLmdlbigpIDogdWdlbi5nZW4oKSxcbiAgICAgICAgICBib2R5ID0gJydcblxuICAgICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgICAgYm9keSArPSBBcnJheS5pc0FycmF5KCBjaGFubmVsICkgPyBjaGFubmVsWzFdICsgJ1xcbicgKyBjaGFubmVsWzBdIDogY2hhbm5lbFxuXG4gICAgICAvLyBzcGxpdCBib2R5IHRvIGluamVjdCByZXR1cm4ga2V5d29yZCBvbiBsYXN0IGxpbmVcbiAgICAgIGJvZHkgPSBib2R5LnNwbGl0KCdcXG4nKVxuICAgICBcbiAgICAgIC8vaWYoIGRlYnVnICkgY29uc29sZS5sb2coICdmdW5jdGlvbkJvZHkgbGVuZ3RoJywgYm9keSApXG4gICAgICBcbiAgICAgIC8vIG5leHQgbGluZSBpcyB0byBhY2NvbW1vZGF0ZSBtZW1vIGFzIGdyYXBoIGhlYWRcbiAgICAgIGlmKCBib2R5WyBib2R5Lmxlbmd0aCAtMSBdLnRyaW0oKS5pbmRleE9mKCdsZXQnKSA+IC0xICkgeyBib2R5LnB1c2goICdcXG4nICkgfSBcblxuICAgICAgLy8gZ2V0IGluZGV4IG9mIGxhc3QgbGluZVxuICAgICAgbGV0IGxhc3RpZHggPSBib2R5Lmxlbmd0aCAtIDFcblxuICAgICAgLy8gaW5zZXJ0IHJldHVybiBrZXl3b3JkXG4gICAgICBib2R5WyBsYXN0aWR4IF0gPSAnICBnZW4ub3V0WycgKyBpICsgJ10gID0gJyArIGJvZHlbIGxhc3RpZHggXSArICdcXG4nXG5cbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGJvZHkuam9pbignXFxuJylcbiAgICB9XG4gICAgXG4gICAgdGhpcy5oaXN0b3JpZXMuZm9yRWFjaCggdmFsdWUgPT4ge1xuICAgICAgaWYoIHZhbHVlICE9PSBudWxsIClcbiAgICAgICAgdmFsdWUuZ2VuKCkgICAgICBcbiAgICB9KVxuXG4gICAgbGV0IHJldHVyblN0YXRlbWVudCA9IGlzU3RlcmVvID8gJyAgcmV0dXJuIGdlbi5vdXQnIDogJyAgcmV0dXJuIGdlbi5vdXRbMF0nXG4gICAgXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5zcGxpdCgnXFxuJylcblxuICAgIGlmKCB0aGlzLmVuZEJsb2NrLnNpemUgKSB7IFxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5jb25jYXQoIEFycmF5LmZyb20oIHRoaXMuZW5kQmxvY2sgKSApXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCByZXR1cm5TdGF0ZW1lbnQgKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAgICB9XG4gICAgLy8gcmVhc3NlbWJsZSBmdW5jdGlvbiBib2R5XG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKVxuXG4gICAgLy8gd2UgY2FuIG9ubHkgZHluYW1pY2FsbHkgY3JlYXRlIGEgbmFtZWQgZnVuY3Rpb24gYnkgZHluYW1pY2FsbHkgY3JlYXRpbmcgYW5vdGhlciBmdW5jdGlvblxuICAgIC8vIHRvIGNvbnN0cnVjdCB0aGUgbmFtZWQgZnVuY3Rpb24hIHNoZWVzaC4uLlxuICAgIGxldCBidWlsZFN0cmluZyA9IGByZXR1cm4gZnVuY3Rpb24gZ2VuKCAkeyB0aGlzLnBhcmFtZXRlcnMuam9pbignLCcpIH0gKXsgXFxuJHsgdGhpcy5mdW5jdGlvbkJvZHkgfVxcbn1gXG4gICAgXG4gICAgaWYoIHRoaXMuZGVidWcgfHwgZGVidWcgKSBjb25zb2xlLmxvZyggYnVpbGRTdHJpbmcgKSBcblxuICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKCBidWlsZFN0cmluZyApKClcbiAgICBcbiAgICAvLyBhc3NpZ24gcHJvcGVydGllcyB0byBuYW1lZCBmdW5jdGlvblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5jbG9zdXJlcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB2YWx1ZSA9IGRpY3RbIG5hbWUgXVxuXG4gICAgICBjYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHVnZW4gPSBkaWN0WyBuYW1lIF1cbiAgICAgIFxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBjYWxsYmFjaywgbmFtZSwge1xuICAgICAgICBnZXQoKSB7IHJldHVybiB1Z2VuLnZhbHVlIH0sXG4gICAgICAgIHNldCh2KXsgdWdlbi52YWx1ZSA9IHYgfVxuICAgICAgfSlcbiAgICAgIC8vY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YVxuICAgIGNhbGxiYWNrLm91dCAgPSBbXVxuXG4gICAgaWYoIE1lbW9yeUhlbHBlci5pc1Byb3RvdHlwZU9mKCB0aGlzLm1lbW9yeSApICkgXG4gICAgICBjYWxsYmFjay5tZW1vcnkgPSB0aGlzLm1lbW9yeS5oZWFwXG5cbiAgICB0aGlzLmhpc3Rvcmllcy5jbGVhcigpXG5cbiAgICByZXR1cm4gY2FsbGJhY2tcbiAgfSxcbiAgXG4gIC8qIGdldElucHV0c1xuICAgKlxuICAgKiBHaXZlbiBhbiBhcmd1bWVudCB1Z2VuLCBleHRyYWN0IGl0cyBpbnB1dHMuIElmIHRoZXkgYXJlIG51bWJlcnMsIHJldHVybiB0aGUgbnVtZWJycy4gSWZcbiAgICogdGhleSBhcmUgdWdlbnMsIGNhbGwgLmdlbigpIG9uIHRoZSB1Z2VuLCBtZW1vaXplIHRoZSByZXN1bHQgYW5kIHJldHVybiB0aGUgcmVzdWx0LiBJZiB0aGVcbiAgICogdWdlbiBoYXMgcHJldmlvdXNseSBiZWVuIG1lbW9pemVkIHJldHVybiB0aGUgbWVtb2l6ZWQgdmFsdWUuXG4gICAqXG4gICAqL1xuICBnZXRJbnB1dHMoIHVnZW4gKSB7XG4gICAgcmV0dXJuIHVnZW4uaW5wdXRzLm1hcCggZ2VuLmdldElucHV0ICkgXG4gIH0sXG5cbiAgZ2V0SW5wdXQoIGlucHV0ICkge1xuICAgIGxldCBpc09iamVjdCA9IHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcsXG4gICAgICAgIHByb2Nlc3NlZElucHV0XG5cbiAgICBpZiggaXNPYmplY3QgKSB7IC8vIGlmIGlucHV0IGlzIGEgdWdlbi4uLiBcbiAgICAgIGlmKCBnZW4ubWVtb1sgaW5wdXQubmFtZSBdICkgeyAvLyBpZiBpdCBoYXMgYmVlbiBtZW1vaXplZC4uLlxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGdlbi5tZW1vWyBpbnB1dC5uYW1lIF1cbiAgICAgIH1lbHNleyAvLyBpZiBub3QgbWVtb2l6ZWQgZ2VuZXJhdGUgY29kZSAgXG4gICAgICAgIGxldCBjb2RlID0gaW5wdXQuZ2VuKClcblxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggY29kZSApICkge1xuICAgICAgICAgIGlmKCAhZ2VuLnNob3VsZExvY2FsaXplICkge1xuICAgICAgICAgICAgZ2VuLmZ1bmN0aW9uQm9keSArPSBjb2RlWzFdXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBnZW4uY29kZU5hbWUgPSBjb2RlWzBdXG4gICAgICAgICAgICBnZW4ubG9jYWxpemVkQ29kZS5wdXNoKCBjb2RlWzFdIClcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyggJ2FmdGVyIEdFTicgLCB0aGlzLmZ1bmN0aW9uQm9keSApXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlWzBdXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfWVsc2V7IC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2Nlc3NlZElucHV0XG4gIH0sXG5cbiAgc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXVxuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSB0cnVlXG4gIH0sXG4gIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApIF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZW5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidndCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIGxldCAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0gfCAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPiBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG5cXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndC5pbnB1dHMgPSBbIHgseSBdXG4gIGd0Lm5hbWUgPSAnZ3QnK2dlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBndFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgbGV0ICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoICR7aW5wdXRzWzBdfSA+PSAke2lucHV0c1sxXX0gfCAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPj0gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3QuaW5wdXRzID0gWyB4LHkgXVxuICBndC5uYW1lID0gJ2d0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidndHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoICggJHtpbnB1dHNbMF19ID4gJHtpbnB1dHNbMV19ICkgfCAwICkgKWAgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqICggKCBpbnB1dHNbMF0gPiBpbnB1dHNbMV0gKSB8IDAgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3RwLmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gZ3RwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjE9MCApID0+IHtcbiAgbGV0IHVnZW4gPSB7XG4gICAgaW5wdXRzOiBbIGluMSBdLFxuICAgIG1lbW9yeTogeyB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4OiBudWxsIH0gfSxcbiAgICByZWNvcmRlcjogbnVsbCxcblxuICAgIGluKCB2ICkge1xuICAgICAgaWYoIGdlbi5oaXN0b3JpZXMuaGFzKCB2ICkgKXtcbiAgICAgICAgbGV0IG1lbW9IaXN0b3J5ID0gZ2VuLmhpc3Rvcmllcy5nZXQoIHYgKVxuICAgICAgICB1Z2VuLm5hbWUgPSBtZW1vSGlzdG9yeS5uYW1lXG4gICAgICAgIHJldHVybiBtZW1vSGlzdG9yeVxuICAgICAgfVxuXG4gICAgICBsZXQgb2JqID0ge1xuICAgICAgICBnZW4oKSB7XG4gICAgICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHVnZW4gKVxuXG4gICAgICAgICAgaWYoIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSApXG4gICAgICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gaW4xXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeFxuICAgICAgICAgIFxuICAgICAgICAgIGdlbi5hZGRUb0VuZEJsb2NrKCAnbWVtb3J5WyAnICsgaWR4ICsgJyBdID0gJyArIGlucHV0c1sgMCBdIClcbiAgICAgICAgICBcbiAgICAgICAgICAvLyByZXR1cm4gdWdlbiB0aGF0IGlzIGJlaW5nIHJlY29yZGVkIGluc3RlYWQgb2Ygc3NkLlxuICAgICAgICAgIC8vIHRoaXMgZWZmZWN0aXZlbHkgbWFrZXMgYSBjYWxsIHRvIHNzZC5yZWNvcmQoKSB0cmFuc3BhcmVudCB0byB0aGUgZ3JhcGguXG4gICAgICAgICAgLy8gcmVjb3JkaW5nIGlzIHRyaWdnZXJlZCBieSBwcmlvciBjYWxsIHRvIGdlbi5hZGRUb0VuZEJsb2NrLlxuICAgICAgICAgIGdlbi5oaXN0b3JpZXMuc2V0KCB2LCBvYmogKVxuXG4gICAgICAgICAgcmV0dXJuIGlucHV0c1sgMCBdXG4gICAgICAgIH0sXG4gICAgICAgIG5hbWU6IHVnZW4ubmFtZSArICdfaW4nK2dlbi5nZXRVSUQoKSxcbiAgICAgICAgbWVtb3J5OiB1Z2VuLm1lbW9yeVxuICAgICAgfVxuXG4gICAgICB0aGlzLmlucHV0c1sgMCBdID0gdlxuICAgICAgXG4gICAgICB1Z2VuLnJlY29yZGVyID0gb2JqXG5cbiAgICAgIHJldHVybiBvYmpcbiAgICB9LFxuICAgIFxuICAgIG91dDoge1xuICAgICAgICAgICAgXG4gICAgICBnZW4oKSB7XG4gICAgICAgIGlmKCB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgaWYoIGdlbi5oaXN0b3JpZXMuZ2V0KCB1Z2VuLmlucHV0c1swXSApID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBnZW4uaGlzdG9yaWVzLnNldCggdWdlbi5pbnB1dHNbMF0sIHVnZW4ucmVjb3JkZXIgKVxuICAgICAgICAgIH1cbiAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdWdlbi5tZW1vcnkudmFsdWUuaWR4IF0gPSBwYXJzZUZsb2F0KCBpbjEgKVxuICAgICAgICB9XG4gICAgICAgIGxldCBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHhcbiAgICAgICAgIFxuICAgICAgICByZXR1cm4gJ21lbW9yeVsgJyArIGlkeCArICcgXSAnXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICB1aWQ6IGdlbi5nZXRVSUQoKSxcbiAgfVxuICBcbiAgdWdlbi5vdXQubWVtb3J5ID0gdWdlbi5tZW1vcnkgXG5cbiAgdWdlbi5uYW1lID0gJ2hpc3RvcnknICsgdWdlbi51aWRcbiAgdWdlbi5vdXQubmFtZSA9IHVnZW4ubmFtZSArICdfb3V0J1xuICB1Z2VuLmluLl9uYW1lICA9IHVnZW4ubmFtZSA9ICdfaW4nXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gdWdlblxufVxuIiwiLypcblxuIGEgPSBjb25kaXRpb25hbCggY29uZGl0aW9uLCB0cnVlQmxvY2ssIGZhbHNlQmxvY2sgKVxuIGIgPSBjb25kaXRpb25hbChbXG4gICBjb25kaXRpb24xLCBibG9jazEsXG4gICBjb25kaXRpb24yLCBibG9jazIsXG4gICBjb25kaXRpb24zLCBibG9jazMsXG4gICBkZWZhdWx0QmxvY2tcbiBdKVxuXG4qL1xuJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonaWZlbHNlJyxcblxuICBnZW4oKSB7XG4gICAgLy9sZXQgY29uZCA9IGdlbi5nZXRJbnB1dCggdGhpcy5pbnB1dHNbMF0gKSxcbiAgICAvLyAgICBibG9jazEsIGJsb2NrMiwgYmxvY2sxTmFtZSwgYmxvY2syTmFtZSwgY29uZDEsIGNvbmQyLCBvdXRcblxuICAgIGxldCBjb25kaXRpb25hbHMgPSB0aGlzLmlucHV0c1swXSxcbiAgICAgICAgb3V0ID0gYFxcbiAgbGV0ICR7dGhpcy5uYW1lfV9vdXRcXG5gIFxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBjb25kaXRpb25hbHMubGVuZ3RoOyBpKz0gMiApIHtcbiAgICAgIGxldCBpc0VuZEJsb2NrID0gaSA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCAtIDEsXG4gICAgICAgICAgY29uZCAgPSAhaXNFbmRCbG9jayA/IGdlbi5nZXRJbnB1dCggY29uZGl0aW9uYWxzWyBpIF0gKSA6IG51bGwsXG4gICAgICAgICAgcHJlYmxvY2sgPSBpc0VuZEJsb2NrID8gY29uZGl0aW9uYWxzWyBpIF0gOiBjb25kaXRpb25hbHNbIGkrMSBdLFxuICAgICAgICAgIGJsb2NrLCBibG9ja05hbWUsIG91dHB1dFxuXG4gICAgICBpZiggdHlwZW9mIHByZWJsb2NrID09PSAnbnVtYmVyJyApe1xuICAgICAgICBibG9jayA9IHByZWJsb2NrXG4gICAgICAgIGJsb2NrTmFtZSA9IG51bGxcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggZ2VuLm1lbW9bIHByZWJsb2NrLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIC8vIHVzZWQgdG8gcGxhY2UgYWxsIGNvZGUgZGVwZW5kZW5jaWVzIGluIGFwcHJvcHJpYXRlIGJsb2Nrc1xuICAgICAgICAgIGdlbi5zdGFydExvY2FsaXplKClcblxuICAgICAgICAgIGdlbi5nZXRJbnB1dCggcHJlYmxvY2sgIClcblxuICAgICAgICAgIGJsb2NrID0gZ2VuLmVuZExvY2FsaXplKClcbiAgICAgICAgICBibG9ja05hbWUgPSBibG9ja1swXVxuICAgICAgICAgIGJsb2NrID0gYmxvY2tbIDEgXS5qb2luKCcnKVxuICAgICAgICAgIGJsb2NrID0gJyAgJyArIGJsb2NrLnJlcGxhY2UoIC9cXG4vZ2ksICdcXG4gICcgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBibG9jayA9ICcnXG4gICAgICAgICAgYmxvY2tOYW1lID0gZ2VuLm1lbW9bIHByZWJsb2NrLm5hbWUgXVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG91dHB1dCA9IGJsb2NrTmFtZSA9PT0gbnVsbCA/IFxuICAgICAgICBgICAke3RoaXMubmFtZX1fb3V0ID0gJHtibG9ja31gIDpcbiAgICAgICAgYCR7YmxvY2t9ICAgICR7dGhpcy5uYW1lfV9vdXQgPSAke2Jsb2NrTmFtZX1gXG5cbiAgICAgIGlmKCBpID09PSAwICkge1xuICAgICAgICBvdXQgKz0gYCAgaWYoICR7Y29uZH0gKSB7XG4ke291dHB1dH1cbiAgfSBlbHNlYFxuICAgICAgfWVsc2UgaWYoIGlzRW5kQmxvY2sgKSB7XG4gICAgICAgIG91dCArPSBge1xcbiAgJHtvdXRwdXR9XFxuICB9XFxuYFxuICAgICAgfWVsc2Uge1xuXG4gICAgICAgIGlmKCBpICsgMiA9PT0gY29uZGl0aW9uYWxzLmxlbmd0aCB8fCBpID09PSBjb25kaXRpb25hbHMubGVuZ3RoIC0gMSApIHtcbiAgICAgICAgICBvdXQgKz0gYHtcXG4gICR7b3V0cHV0fVxcbiAgfVxcbmBcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgb3V0ICs9IGAgaWYoICR7Y29uZH0gKSB7XG4ke291dHB1dH1cbiAgfSBlbHNlIGBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgY29uZGl0aW9ucyA9IEFycmF5LmlzQXJyYXkoIGFyZ3NbMF0gKSA/IGFyZ3NbMF0gOiBhcmdzXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbmRpdGlvbnMgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidpbicsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5wYXJhbWV0ZXJzLnB1c2goIHRoaXMubmFtZSApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCkgPT4ge1xuICBsZXQgaW5wdXQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgaW5wdXQuaWQgICA9IGdlbi5nZXRVSUQoKVxuICBpbnB1dC5uYW1lID0gYCR7aW5wdXQuYmFzZW5hbWV9JHtpbnB1dC5pZH1gXG5cbiAgcmV0dXJuIGlucHV0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGxpYnJhcnkgPSB7XG4gIGV4cG9ydCggZGVzdGluYXRpb24gKSB7XG4gICAgaWYoIGRlc3RpbmF0aW9uID09PSB3aW5kb3cgKSB7XG4gICAgICBkZXN0aW5hdGlvbi5zc2QgPSBsaWJyYXJ5Lmhpc3RvcnkgICAgLy8gaGlzdG9yeSBpcyB3aW5kb3cgb2JqZWN0IHByb3BlcnR5LCBzbyB1c2Ugc3NkIGFzIGFsaWFzXG4gICAgICBkZXN0aW5hdGlvbi5pbnB1dCA9IGxpYnJhcnkuaW4gICAgICAgLy8gaW4gaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcbiAgICAgIGRlc3RpbmF0aW9uLnRlcm5hcnkgPSBsaWJyYXJ5LnN3aXRjaCAvLyBzd2l0Y2ggaXMgYSBrZXl3b3JkIGluIGphdmFzY3JpcHRcblxuICAgICAgZGVsZXRlIGxpYnJhcnkuaGlzdG9yeVxuICAgICAgZGVsZXRlIGxpYnJhcnkuaW5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LnN3aXRjaFxuICAgIH1cblxuICAgIE9iamVjdC5hc3NpZ24oIGRlc3RpbmF0aW9uLCBsaWJyYXJ5IClcbiAgICBkZXN0aW5hdGlvbi5jbGlwID0gbGlicmFyeS5jbGFtcFxuICB9LFxuXG4gIGdlbjogICAgICByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gIFxuICBhYnM6ICAgICAgcmVxdWlyZSggJy4vYWJzLmpzJyApLFxuICByb3VuZDogICAgcmVxdWlyZSggJy4vcm91bmQuanMnICksXG4gIHBhcmFtOiAgICByZXF1aXJlKCAnLi9wYXJhbS5qcycgKSxcbiAgYWRkOiAgICAgIHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgc3ViOiAgICAgIHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgbXVsOiAgICAgIHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgZGl2OiAgICAgIHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgYWNjdW06ICAgIHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICBjb3VudGVyOiAgcmVxdWlyZSggJy4vY291bnRlci5qcycgKSxcbiAgc2luOiAgICAgIHJlcXVpcmUoICcuL3Npbi5qcycgKSxcbiAgY29zOiAgICAgIHJlcXVpcmUoICcuL2Nvcy5qcycgKSxcbiAgdGFuOiAgICAgIHJlcXVpcmUoICcuL3Rhbi5qcycgKSxcbiAgYXNpbjogICAgIHJlcXVpcmUoICcuL2FzaW4uanMnICksXG4gIGFjb3M6ICAgICByZXF1aXJlKCAnLi9hY29zLmpzJyApLFxuICBhdGFuOiAgICAgcmVxdWlyZSggJy4vYXRhbi5qcycgKSwgIFxuICBwaGFzb3I6ICAgcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICBkYXRhOiAgICAgcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgcGVlazogICAgIHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gIGN5Y2xlOiAgICByZXF1aXJlKCAnLi9jeWNsZS5qcycgKSxcbiAgaGlzdG9yeTogIHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gIGRlbHRhOiAgICByZXF1aXJlKCAnLi9kZWx0YS5qcycgKSxcbiAgZmxvb3I6ICAgIHJlcXVpcmUoICcuL2Zsb29yLmpzJyApLFxuICBjZWlsOiAgICAgcmVxdWlyZSggJy4vY2VpbC5qcycgKSxcbiAgbWluOiAgICAgIHJlcXVpcmUoICcuL21pbi5qcycgKSxcbiAgbWF4OiAgICAgIHJlcXVpcmUoICcuL21heC5qcycgKSxcbiAgc2lnbjogICAgIHJlcXVpcmUoICcuL3NpZ24uanMnICksXG4gIGRjYmxvY2s6ICByZXF1aXJlKCAnLi9kY2Jsb2NrLmpzJyApLFxuICBtZW1vOiAgICAgcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgcmF0ZTogICAgIHJlcXVpcmUoICcuL3JhdGUuanMnICksXG4gIHdyYXA6ICAgICByZXF1aXJlKCAnLi93cmFwLmpzJyApLFxuICBtaXg6ICAgICAgcmVxdWlyZSggJy4vbWl4LmpzJyApLFxuICBjbGFtcDogICAgcmVxdWlyZSggJy4vY2xhbXAuanMnICksXG4gIHBva2U6ICAgICByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICBkZWxheTogICAgcmVxdWlyZSggJy4vZGVsYXkuanMnICksXG4gIGZvbGQ6ICAgICByZXF1aXJlKCAnLi9mb2xkLmpzJyApLFxuICBtb2QgOiAgICAgcmVxdWlyZSggJy4vbW9kLmpzJyApLFxuICBzYWggOiAgICAgcmVxdWlyZSggJy4vc2FoLmpzJyApLFxuICBub2lzZTogICAgcmVxdWlyZSggJy4vbm9pc2UuanMnICksXG4gIG5vdDogICAgICByZXF1aXJlKCAnLi9ub3QuanMnICksXG4gIGd0OiAgICAgICByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgZ3RlOiAgICAgIHJlcXVpcmUoICcuL2d0ZS5qcycgKSxcbiAgbHQ6ICAgICAgIHJlcXVpcmUoICcuL2x0LmpzJyApLCBcbiAgbHRlOiAgICAgIHJlcXVpcmUoICcuL2x0ZS5qcycgKSwgXG4gIGJvb2w6ICAgICByZXF1aXJlKCAnLi9ib29sLmpzJyApLFxuICBnYXRlOiAgICAgcmVxdWlyZSggJy4vZ2F0ZS5qcycgKSxcbiAgdHJhaW46ICAgIHJlcXVpcmUoICcuL3RyYWluLmpzJyApLFxuICBzbGlkZTogICAgcmVxdWlyZSggJy4vc2xpZGUuanMnICksXG4gIGluOiAgICAgICByZXF1aXJlKCAnLi9pbi5qcycgKSxcbiAgdDYwOiAgICAgIHJlcXVpcmUoICcuL3Q2MC5qcycpLFxuICBtdG9mOiAgICAgcmVxdWlyZSggJy4vbXRvZi5qcycpLFxuICBsdHA6ICAgICAgcmVxdWlyZSggJy4vbHRwLmpzJyksICAgICAgICAvLyBUT0RPOiB0ZXN0XG4gIGd0cDogICAgICByZXF1aXJlKCAnLi9ndHAuanMnKSwgICAgICAgIC8vIFRPRE86IHRlc3RcbiAgc3dpdGNoOiAgIHJlcXVpcmUoICcuL3N3aXRjaC5qcycgKSxcbiAgbXN0b3NhbXBzOnJlcXVpcmUoICcuL21zdG9zYW1wcy5qcycgKSwgLy8gVE9ETzogbmVlZHMgdGVzdCxcbiAgc2VsZWN0b3I6IHJlcXVpcmUoICcuL3NlbGVjdG9yLmpzJyApLFxuICB1dGlsaXRpZXM6cmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApLFxuICBwb3c6ICAgICAgcmVxdWlyZSggJy4vcG93LmpzJyApLFxuICBhdHRhY2s6ICAgcmVxdWlyZSggJy4vYXR0YWNrLmpzJyApLFxuICBkZWNheTogICAgcmVxdWlyZSggJy4vZGVjYXkuanMnICksXG4gIHdpbmRvd3M6ICByZXF1aXJlKCAnLi93aW5kb3dzLmpzJyApLFxuICBlbnY6ICAgICAgcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICBhZDogICAgICAgcmVxdWlyZSggJy4vYWQuanMnICApLFxuICBhZHNyOiAgICAgcmVxdWlyZSggJy4vYWRzci5qcycgKSxcbiAgaWZlbHNlOiAgIHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICBiYW5nOiAgICAgcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgYW5kOiAgICAgIHJlcXVpcmUoICcuL2FuZC5qcycgKVxufVxuXG5saWJyYXJ5Lmdlbi5saWIgPSBsaWJyYXJ5XG5cbm1vZHVsZS5leHBvcnRzID0gbGlicmFyeVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2x0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBvdXQgPSBgICBsZXQgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19IHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBsdCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBsdC5pbnB1dHMgPSBbIHgseSBdXG4gIGx0Lm5hbWUgPSAnbHQnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGx0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbHRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBvdXQgPSBgICBsZXQgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCggJHtpbnB1dHNbMF19IDw9ICR7aW5wdXRzWzFdfSB8IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPD0gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0LmlucHV0cyA9IFsgeCx5IF1cbiAgbHQubmFtZSA9ICdsdGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGx0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbHRwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19ICkgfCAwICkgKWAgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqICgoIGlucHV0c1swXSA8IGlucHV0c1sxXSApIHwgMCApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0cCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBsdHAuaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBsdHBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtYXgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGgubWF4IH0pXG5cbiAgICAgIG91dCA9IGBnZW4ubWF4KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWF4KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBtYXggPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbWF4LmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbWF4XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbWVtbycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIGxldCAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoaW4xLG1lbW9OYW1lKSA9PiB7XG4gIGxldCBtZW1vID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgbWVtby5pbnB1dHMgPSBbIGluMSBdXG4gIG1lbW8uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBtZW1vLm5hbWUgPSBtZW1vTmFtZSAhPT0gdW5kZWZpbmVkID8gbWVtb05hbWUgKyAnXycgKyBnZW4uZ2V0VUlEKCkgOiBgJHttZW1vLmJhc2VuYW1lfSR7bWVtby5pZH1gXG5cbiAgcmV0dXJuIG1lbW9cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGgubWluIH0pXG5cbiAgICAgIG91dCA9IGBnZW4ubWluKCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWluKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBtaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbWluLmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbWluXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgYWRkID0gcmVxdWlyZSgnLi9hZGQuanMnKSxcbiAgICBtdWwgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHN1YiA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbz0gcmVxdWlyZSgnLi9tZW1vLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgaW4yLCB0PS41ICkgPT4ge1xuICBsZXQgdWdlbiA9IG1lbW8oIGFkZCggbXVsKGluMSwgc3ViKDEsdCApICksIG11bCggaW4yLCB0ICkgKSApXG4gIHVnZW4ubmFtZSA9ICdtaXgnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICguLi5hcmdzKSA9PiB7XG4gIGxldCBtb2QgPSB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuKCkge1xuICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgICBvdXQ9JygnLFxuICAgICAgICAgIGRpZmYgPSAwLCBcbiAgICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1sgMCBdLFxuICAgICAgICAgIGxhc3ROdW1iZXJJc1VnZW4gPSBpc05hTiggbGFzdE51bWJlciApLCBcbiAgICAgICAgICBtb2RBdEVuZCA9IGZhbHNlXG5cbiAgICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICAgIGlmKCBpID09PSAwICkgcmV0dXJuXG5cbiAgICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgICAgICBpc0ZpbmFsSWR4ICAgPSBpID09PSBpbnB1dHMubGVuZ3RoIC0gMVxuXG4gICAgICAgIGlmKCAhbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuICkge1xuICAgICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyICUgdlxuICAgICAgICAgIG91dCArPSBsYXN0TnVtYmVyXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIG91dCArPSBgJHtsYXN0TnVtYmVyfSAlICR7dn1gXG4gICAgICAgIH1cblxuICAgICAgICBpZiggIWlzRmluYWxJZHggKSBvdXQgKz0gJyAlICcgXG4gICAgICB9KVxuXG4gICAgICBvdXQgKz0gJyknXG5cbiAgICAgIHJldHVybiBvdXRcbiAgICB9XG4gIH1cbiAgXG4gIHJldHVybiBtb2Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbXN0b3NhbXBzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICByZXR1cm5WYWx1ZVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIG91dCA9IGAgIGxldCAke3RoaXMubmFtZSB9ID0gJHtnZW4uc2FtcGxlcmF0ZX0gLyAxMDAwICogJHtpbnB1dHNbMF19IFxcblxcbmBcbiAgICAgXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBvdXRcbiAgICAgIFxuICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSwgb3V0IF1cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gZ2VuLnNhbXBsZXJhdGUgLyAxMDAwICogdGhpcy5pbnB1dHNbMF1cblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9ICAgIFxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IG1zdG9zYW1wcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtc3Rvc2FtcHMuaW5wdXRzID0gWyB4IF1cbiAgbXN0b3NhbXBzLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBtc3Rvc2FtcHNcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtdG9mJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGAoICR7dGhpcy50dW5pbmd9ICogZ2VuLmV4cCggLjA1Nzc2MjI2NSAqICgke2lucHV0c1swXX0gLSA2OSkgKSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IHRoaXMudHVuaW5nICogTWF0aC5leHAoIC4wNTc3NjIyNjUgKiAoIGlucHV0c1swXSAtIDY5KSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggeCwgcHJvcHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyB0dW5pbmc6NDQwIH1cbiAgXG4gIGlmKCBwcm9wcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggcHJvcHMuZGVmYXVsdHMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIGRlZmF1bHRzIClcbiAgdWdlbi5pbnB1dHMgPSBbIHggXVxuICBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LHkgKSA9PiB7XG4gIGxldCBtdWwgPSB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIHgseSBdLFxuXG4gICAgZ2VuKCkge1xuICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgICBvdXRcblxuICAgICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICAgIG91dCA9ICBgKCR7aW5wdXRzWzBdfSAqICR7aW5wdXRzWzFdfSlgXG4gICAgICB9ZWxzZXtcbiAgICAgICAgb3V0ID0gcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKiBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSBcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtdWxcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidub2lzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXRcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnbm9pc2UnIDogTWF0aC5yYW5kb20gfSlcblxuICAgIG91dCA9IGAgIGxldCAke3RoaXMubmFtZX0gPSBnZW4ubm9pc2UoKVxcbmBcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm9pc2UgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIG5vaXNlLm5hbWUgPSBwcm90by5uYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG5vaXNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbm90JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gPT09IDAgPyAxIDogMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSAhaW5wdXRzWzBdID09PSAwID8gMSA6IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbm90LmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIG5vdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgZ2VuKCkge1xuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgZ2VuLnBhcmFtcy5hZGQoeyBbdGhpcy5uYW1lXTogdGhpcyB9KVxuXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gXG5cbiAgICByZXR1cm4gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBwcm9wTmFtZT0wLCB2YWx1ZT0wICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIGlmKCB0eXBlb2YgcHJvcE5hbWUgIT09ICdzdHJpbmcnICkge1xuICAgIHVnZW4ubmFtZSA9ICdwYXJhbScgKyBnZW4uZ2V0VUlEKClcbiAgICB1Z2VuLmluaXRpYWxWYWx1ZSA9IHByb3BOYW1lXG4gIH1lbHNle1xuICAgIHVnZW4ubmFtZSA9IHByb3BOYW1lXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSB2YWx1ZVxuICB9XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGVlaycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCwgZnVuY3Rpb25Cb2R5LCBuZXh0LCBsZW5ndGhJc0xvZzIsIGlkeFxuICAgIFxuICAgIC8vaWR4ID0gdGhpcy5kYXRhLmdlbigpXG4gICAgaWR4ID0gaW5wdXRzWzFdXG4gICAgbGVuZ3RoSXNMb2cyID0gKE1hdGgubG9nMiggdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKSB8IDApICA9PT0gTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApXG5cbiAgICAvL2NvbnNvbGUubG9nKCBcIkxFTkdUSCBJUyBMT0cyXCIsIGxlbmd0aElzTG9nMiwgdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKVxuLy8ke3RoaXMubmFtZX1faW5kZXggPSAke3RoaXMubmFtZX1fcGhhc2UgfCAwLFxcbmBcbiAgICBmdW5jdGlvbkJvZHkgPSBgICBsZXQgJHt0aGlzLm5hbWV9X2RhdGFJZHggID0gJHtpZHh9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9waGFzZSA9ICR7dGhpcy5tb2RlID09PSAnc2FtcGxlcycgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogJyArIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIH0sIFxuICAgICAgJHt0aGlzLm5hbWV9X2luZGV4ID0gJHt0aGlzLm5hbWV9X3BoYXNlIHwgMCxcXG5gXG5cbiAgICAvL25leHQgPSBsZW5ndGhJc0xvZzIgPyBcbiAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICd3cmFwJyApIHtcbiAgICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgP1xuICAgICAgYCggJHt0aGlzLm5hbWV9X2luZGV4ICsgMSApICYgKCR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IC0gMSlgIDpcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9ID8gJHt0aGlzLm5hbWV9X2luZGV4ICsgMSAtICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZSBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdjbGFtcCcgKSB7XG4gICAgICBuZXh0ID0gXG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gPyAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH1cblxuICAgIGlmKCB0aGlzLmludGVycCA9PT0gJ2xpbmVhcicgKSB7ICAgICAgXG4gICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fZnJhYyAgPSAke3RoaXMubmFtZX1fcGhhc2UgLSAke3RoaXMubmFtZX1faW5kZXgsXG4gICAgICAke3RoaXMubmFtZX1fYmFzZSAgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgICR7dGhpcy5uYW1lfV9pbmRleCBdLFxuICAgICAgJHt0aGlzLm5hbWV9X25leHQgID0gJHtuZXh0fSwgICAgIFxuICAgICAgJHt0aGlzLm5hbWV9X291dCAgID0gJHt0aGlzLm5hbWV9X2Jhc2UgKyAke3RoaXMubmFtZX1fZnJhYyAqICggbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9uZXh0IF0gLSAke3RoaXMubmFtZX1fYmFzZSApXFxuXFxuYFxuXG4gICAgfWVsc2V7XG4gICAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9vdXQgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X2luZGV4IF1cXG5cXG5gXG4gICAgfVxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfb3V0J1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lKydfb3V0JywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGRhdGEsIGluZGV4LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6MSwgbW9kZToncGhhc2UnLCBpbnRlcnA6J2xpbmVhcicsIGJvdW5kbW9kZTond3JhcCcgfSBcbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBkYXRhLFxuICAgIGRhdGFOYW1lOiAgIGRhdGEubmFtZSxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbmRleCwgZGF0YSBdLFxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHByb3RvID0geyBiYXNlbmFtZToncGhhc29yJyB9XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCwgcHJvcHMgKSA9PiB7XG4gIGlmKCBwcm9wcyA9PT0gdW5kZWZpbmVkICkgcHJvcHMgPSB7IG1pbjogLTEgfVxuXG4gIGxldCByYW5nZSA9IChwcm9wcy5tYXggfHwgMSApIC0gcHJvcHMubWluXG5cbiAgbGV0IHVnZW4gPSB0eXBlb2YgZnJlcXVlbmN5ID09PSAnbnVtYmVyJyA/IGFjY3VtKCAoZnJlcXVlbmN5ICogcmFuZ2UpIC8gZ2VuLnNhbXBsZXJhdGUsIHJlc2V0LCBwcm9wcyApIDogIGFjY3VtKCBtdWwoIGZyZXF1ZW5jeSwgMS9nZW4uc2FtcGxlcmF0ZS8oMS9yYW5nZSkgKSwgcmVzZXQsIHByb3BzIClcblxuICB1Z2VuLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIG11bCAgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHdyYXAgPSByZXF1aXJlKCcuL3dyYXAuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwb2tlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGRhdGFOYW1lID0gJ21lbW9yeScsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgaWR4LCBvdXQsIHdyYXBwZWRcbiAgICBcbiAgICBpZHggPSB0aGlzLmRhdGEuZ2VuKClcblxuICAgIC8vZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICAvL3dyYXBwZWQgPSB3cmFwKCB0aGlzLmlucHV0c1sxXSwgMCwgdGhpcy5kYXRhTGVuZ3RoICkuZ2VuKClcbiAgICAvL2lkeCA9IHdyYXBwZWRbMF1cbiAgICAvL2dlbi5mdW5jdGlvbkJvZHkgKz0gd3JhcHBlZFsxXVxuICAgIGdlbi5mdW5jdGlvbkJvZHkgKz0gYCAgJHtkYXRhTmFtZX1bICR7aWR4fSArICR7aW5wdXRzWzFdfSBdID0gJHtpbnB1dHNbMF19XFxuYFxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9ICggZGF0YSwgdmFsdWUsIGluZGV4LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6MSB9IFxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBkYXRhLFxuICAgIGRhdGFOYW1lOiAgIGRhdGEubmFtZSxcbiAgICBkYXRhTGVuZ3RoOiBkYXRhLmJ1ZmZlci5sZW5ndGgsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgdmFsdWUsIGluZGV4IF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcblxuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuICBcbiAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4ubmFtZSwgdWdlbiApXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG93JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Bvdyc6IE1hdGgucG93IH0pXG5cbiAgICAgIG91dCA9IGBnZW4ucG93KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdHlwZW9mIGlucHV0c1swXSA9PT0gJ3N0cmluZycgJiYgaW5wdXRzWzBdWzBdID09PSAnKCcgKSB7XG4gICAgICAgIGlucHV0c1swXSA9IGlucHV0c1swXS5zbGljZSgxLC0xKVxuICAgICAgfVxuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMV0gPT09ICdzdHJpbmcnICYmIGlucHV0c1sxXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMV0gPSBpbnB1dHNbMV0uc2xpY2UoMSwtMSlcbiAgICAgIH1cblxuICAgICAgb3V0ID0gTWF0aC5wb3coIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0pIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgcG93ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHBvdy5pbnB1dHMgPSBbIHgseSBdXG4gIHBvdy5pZCA9IGdlbi5nZXRVSUQoKVxuICBwb3cubmFtZSA9IGAke3Bvdy5iYXNlbmFtZX17cG93LmlkfWBcblxuICByZXR1cm4gcG93XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gICAgZGVsdGEgICA9IHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICAgIHdyYXAgICAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3JhdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBwaGFzZSAgPSBoaXN0b3J5KCksXG4gICAgICAgIGluTWludXMxID0gaGlzdG9yeSgpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmaWx0ZXIsIHN1bSwgb3V0XG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIG91dCA9IFxuYCBsZXQgJHt0aGlzLm5hbWV9X2RpZmYgPSAke2lucHV0c1swXX0gLSAke2dlbk5hbWV9Lmxhc3RTYW1wbGVcbiAgaWYoICR7dGhpcy5uYW1lfV9kaWZmIDwgLS41ICkgJHt0aGlzLm5hbWV9X2RpZmYgKz0gMVxuICAke2dlbk5hbWV9LnBoYXNlICs9ICR7dGhpcy5uYW1lfV9kaWZmICogJHtpbnB1dHNbMV19XG4gIGlmKCAke2dlbk5hbWV9LnBoYXNlID4gMSApICR7Z2VuTmFtZX0ucGhhc2UgLT0gMVxuICAke2dlbk5hbWV9Lmxhc3RTYW1wbGUgPSAke2lucHV0c1swXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcblxuICAgIHJldHVybiBbIGdlbk5hbWUgKyAnLnBoYXNlJywgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCByYXRlICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHBoYXNlOiAgICAgIDAsXG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIHJhdGUgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidyb3VuZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLnJvdW5kIH0pXG5cbiAgICAgIG91dCA9IGBnZW4ucm91bmQoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgucm91bmQoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCByb3VuZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICByb3VuZC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiByb3VuZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NhaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gMFxuICAgIGdlbi5kYXRhWyB0aGlzLm5hbWUgKyAnX2NvbnRyb2wnIF0gPSAwXG5cbiAgICBvdXQgPSBcbmAgbGV0ICR7dGhpcy5uYW1lfSA9IGdlbi5kYXRhLiR7dGhpcy5uYW1lfV9jb250cm9sLFxuICAgICAgJHt0aGlzLm5hbWV9X3RyaWdnZXIgPSAke2lucHV0c1sxXX0gPiAke2lucHV0c1syXX0gPyAxIDogMFxuXG4gIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciAhPT0gJHt0aGlzLm5hbWV9ICApIHtcbiAgICBpZiggJHt0aGlzLm5hbWV9X3RyaWdnZXIgPT09IDEgKSBcbiAgICAgIGdlbi5kYXRhLiR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICAgIGdlbi5kYXRhLiR7dGhpcy5uYW1lfV9jb250cm9sID0gJHt0aGlzLm5hbWV9X3RyaWdnZXJcbiAgfVxuYFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YCwgJyAnICtvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGNvbnRyb2wsIHRocmVzaG9sZD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgaW5pdDowIH1cblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIGNvbnRyb2wsdGhyZXNob2xkIF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NlbGVjdG9yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0LCByZXR1cm5WYWx1ZSA9IDBcbiAgICBcbiAgICBzd2l0Y2goIGlucHV0cy5sZW5ndGggKSB7XG4gICAgICBjYXNlIDIgOlxuICAgICAgICByZXR1cm5WYWx1ZSA9IGlucHV0c1sxXVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMyA6XG4gICAgICAgIG91dCA9IGAgIGxldCAke3RoaXMubmFtZX1fb3V0ID0gJHtpbnB1dHNbMF19ID09PSAxID8gJHtpbnB1dHNbMV19IDogJHtpbnB1dHNbMl19XFxuXFxuYDtcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSArICdfb3V0Jywgb3V0IF1cbiAgICAgICAgYnJlYWs7ICBcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIG91dCA9IFxuYCBsZXQgJHt0aGlzLm5hbWV9X291dCA9IDBcbiAgc3dpdGNoKCAke2lucHV0c1swXX0gKyAxICkge1xcbmBcblxuICAgICAgICBmb3IoIGxldCBpID0gMTsgaSA8IGlucHV0cy5sZW5ndGg7IGkrKyApe1xuICAgICAgICAgIG91dCArPWAgICAgY2FzZSAke2l9OiAke3RoaXMubmFtZX1fb3V0ID0gJHtpbnB1dHNbaV19OyBicmVhaztcXG5gIFxuICAgICAgICB9XG5cbiAgICAgICAgb3V0ICs9ICcgIH1cXG5cXG4nXG4gICAgICAgIFxuICAgICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lICsgJ19vdXQnLCAnICcgKyBvdXQgXVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfb3V0J1xuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5pbnB1dHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHNcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidzaWduJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguc2lnbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnNpZ24oICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2lnbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpZ24gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2lnbi5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBzaWduXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Npbic6IE1hdGguc2luIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5zaW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBzaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2luLmlucHV0cyA9IFsgeCBdXG4gIHNpbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBzaW4ubmFtZSA9IGAke3Npbi5iYXNlbmFtZX17c2luLmlkfWBcblxuICByZXR1cm4gc2luXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gICAgX3N3aXRjaCA9IHJlcXVpcmUoICcuL3N3aXRjaC5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBzbGlkZVVwID0gMSwgc2xpZGVEb3duID0gMSApID0+IHtcbiAgbGV0IHkxID0gaGlzdG9yeSgwKSxcbiAgICAgIGZpbHRlciwgc2xpZGVBbW91bnRcblxuICAvL3kgKG4pID0geSAobi0xKSArICgoeCAobikgLSB5IChuLTEpKS9zbGlkZSkgXG4gIHNsaWRlQW1vdW50ID0gX3N3aXRjaCggZ3QoaW4xLHkxLm91dCksIHNsaWRlVXAsIHNsaWRlRG93biApXG5cbiAgZmlsdGVyID0gbWVtbyggYWRkKCB5MS5vdXQsIGRpdiggc3ViKCBpbjEsIHkxLm91dCApLCBzbGlkZUFtb3VudCApICkgKVxuXG4gIHkxLmluKCBmaWx0ZXIgKVxuXG4gIHJldHVybiBmaWx0ZXJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgbGV0IHN1YiA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0wLFxuICAgICAgICAgIGRpZmYgPSAwLFxuICAgICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsIFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICAgIHN1YkF0RW5kID0gZmFsc2UsXG4gICAgICAgICAgaGFzVWdlbnMgPSBmYWxzZSxcbiAgICAgICAgICByZXR1cm5WYWx1ZSA9IDBcblxuICAgICAgdGhpcy5pbnB1dHMuZm9yRWFjaCggdmFsdWUgPT4geyBpZiggaXNOYU4oIHZhbHVlICkgKSBoYXNVZ2VucyA9IHRydWUgfSlcbiAgICAgIFxuICAgICAgaWYoIGhhc1VnZW5zICkgeyAvLyBzdG9yZSBpbiB2YXJpYWJsZSBmb3IgZnV0dXJlIHJlZmVyZW5jZVxuICAgICAgICBvdXQgPSAnICBsZXQgJyArIHRoaXMubmFtZSArICcgPSAoJ1xuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9ICcoJ1xuICAgICAgfVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAtIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgICAgfSlcbiAgICBcbiAgICAgIGlmKCBuZWVkc1BhcmVucyApIHtcbiAgICAgICAgb3V0ICs9ICcpJ1xuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9IG91dC5zbGljZSggMSApIC8vIHJlbW92ZSBvcGVuaW5nIHBhcmVuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKCBoYXNVZ2VucyApIG91dCArPSAnXFxuJ1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IGhhc1VnZW5zID8gWyB0aGlzLm5hbWUsIG91dCBdIDogb3V0XG4gICAgICBcbiAgICAgIGlmKCBoYXNVZ2VucyApIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgICB9XG4gIH1cbiAgIFxuICBzdWIubmFtZSA9ICdzdWInK3N1Yi5pZFxuXG4gIHJldHVybiBzdWJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N3aXRjaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgaWYoIGlucHV0c1sxXSA9PT0gaW5wdXRzWzJdICkgcmV0dXJuIGlucHV0c1sxXSAvLyBpZiBib3RoIHBvdGVudGlhbCBvdXRwdXRzIGFyZSB0aGUgc2FtZSBqdXN0IHJldHVybiBvbmUgb2YgdGhlbVxuICAgIFxuICAgIG91dCA9IGAgIGxldCAke3RoaXMubmFtZX1fb3V0ID0gJHtpbnB1dHNbMF19ID09PSAxID8gJHtpbnB1dHNbMV19IDogJHtpbnB1dHNbMl19XFxuXFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfV9vdXRgXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9X291dGAsIG91dCBdXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGNvbnRyb2wsIGluMSA9IDEsIGluMiA9IDAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgY29udHJvbCwgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondDYwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICByZXR1cm5WYWx1ZVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbICdleHAnIF06IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGAgIGxldCAke3RoaXMubmFtZX0gPSBnZW4uZXhwKCAtNi45MDc3NTUyNzg5MjEgLyAke2lucHV0c1swXX0gKVxcblxcbmBcbiAgICAgXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBvdXRcbiAgICAgIFxuICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSwgb3V0IF1cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5leHAoIC02LjkwNzc1NTI3ODkyMSAvIGlucHV0c1swXSApXG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0XG4gICAgfSAgICBcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0NjAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdDYwLmlucHV0cyA9IFsgeCBdXG4gIHQ2MC5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdDYwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IE1hdGgudGFuIH0pXG5cbiAgICAgIG91dCA9IGBnZW4udGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdGFuLmlucHV0cyA9IFsgeCBdXG4gIHRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW4ubmFtZSA9IGAke3Rhbi5iYXNlbmFtZX17dGFuLmlkfWBcblxuICByZXR1cm4gdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbHQgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIHBoYXNvciAgPSByZXF1aXJlKCAnLi9waGFzb3IuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT00NDAsIHB1bHNld2lkdGg9LjUgKSA9PiB7XG4gIGxldCBncmFwaCA9IGx0KCBhY2N1bSggZGl2KCBmcmVxdWVuY3ksIDQ0MTAwICkgKSwgLjUgKVxuXG4gIGdyYXBoLm5hbWUgPSBgdHJhaW4ke2dlbi5nZXRVSUQoKX1gXG5cbiAgcmV0dXJuIGdyYXBoXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApXG5cbmxldCBpc1N0ZXJlbyA9IGZhbHNlXG5cbmxldCB1dGlsaXRpZXMgPSB7XG4gIGN0eDogbnVsbCxcblxuICBjbGVhcigpIHtcbiAgICB0aGlzLmNhbGxiYWNrID0gKCkgPT4gMFxuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmZvckVhY2goIHYgPT4gdigpIClcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5sZW5ndGggPSAwXG4gIH0sXG5cbiAgY3JlYXRlQ29udGV4dCgpIHtcbiAgICB0aGlzLmN0eCA9IG5ldyAoIEF1ZGlvQ29udGV4dCB8fCB3ZWJraXRBdWRpb0NvbnRleHQgKSgpXG4gICAgZ2VuLnNhbXBsZXJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlXG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvcigpIHtcbiAgICB0aGlzLm5vZGUgPSB0aGlzLmN0eC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoIDEwMjQsIDAsIDIgKSxcbiAgICB0aGlzLmNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfSxcbiAgICB0aGlzLmNhbGxiYWNrID0gdGhpcy5jbGVhckZ1bmN0aW9uXG5cbiAgICB0aGlzLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiggYXVkaW9Qcm9jZXNzaW5nRXZlbnQgKSB7XG4gICAgICB2YXIgb3V0cHV0QnVmZmVyID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQub3V0cHV0QnVmZmVyO1xuXG4gICAgICB2YXIgbGVmdCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMCApLFxuICAgICAgICAgIHJpZ2h0PSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDEgKVxuXG4gICAgICBmb3IgKHZhciBzYW1wbGUgPSAwOyBzYW1wbGUgPCBsZWZ0Lmxlbmd0aDsgc2FtcGxlKyspIHtcbiAgICAgICAgaWYoICFpc1N0ZXJlbyApIHtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgXSA9IHJpZ2h0WyBzYW1wbGUgXSA9IHV0aWxpdGllcy5jYWxsYmFjaygpXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHZhciBvdXQgPSB1dGlsaXRpZXMuY2FsbGJhY2soKVxuICAgICAgICAgIGxlZnRbIHNhbXBsZSAgXSA9IG91dFswXVxuICAgICAgICAgIHJpZ2h0WyBzYW1wbGUgXSA9IG91dFsxXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ub2RlLmNvbm5lY3QoIHRoaXMuY3R4LmRlc3RpbmF0aW9uIClcblxuICAgIC8vdGhpcy5ub2RlLmNvbm5lY3QoIHRoaXMuYW5hbHl6ZXIgKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgXG4gIHBsYXlHcmFwaCggZ3JhcGgsIGRlYnVnLCBtZW09NDQxMDAqMTAgKSB7XG4gICAgdXRpbGl0aWVzLmNsZWFyKClcbiAgICBpZiggZGVidWcgPT09IHVuZGVmaW5lZCApIGRlYnVnID0gZmFsc2VcbiAgICAgICAgICBcbiAgICBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIGdyYXBoIClcblxuICAgIHV0aWxpdGllcy5jYWxsYmFjayA9IGdlbi5jcmVhdGVDYWxsYmFjayggZ3JhcGgsIG1lbSwgZGVidWcgKVxuICAgIFxuICAgIGlmKCB1dGlsaXRpZXMuY29uc29sZSApIHV0aWxpdGllcy5jb25zb2xlLnNldFZhbHVlKCB1dGlsaXRpZXMuY2FsbGJhY2sudG9TdHJpbmcoKSApXG5cbiAgICByZXR1cm4gdXRpbGl0aWVzLmNhbGxiYWNrXG4gIH0sXG5cbiAgbG9hZFNhbXBsZSggc291bmRGaWxlUGF0aCwgZGF0YSApIHtcbiAgICBsZXQgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICByZXEub3BlbiggJ0dFVCcsIHNvdW5kRmlsZVBhdGgsIHRydWUgKVxuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInIFxuICAgIFxuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLHJlamVjdCkgPT4ge1xuICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXVkaW9EYXRhID0gcmVxLnJlc3BvbnNlXG5cbiAgICAgICAgdXRpbGl0aWVzLmN0eC5kZWNvZGVBdWRpb0RhdGEoIGF1ZGlvRGF0YSwgKGJ1ZmZlcikgPT4ge1xuICAgICAgICAgIGRhdGEuYnVmZmVyID0gYnVmZmVyLmdldENoYW5uZWxEYXRhKDApXG4gICAgICAgICAgcmVzb2x2ZSggZGF0YS5idWZmZXIgKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXEuc2VuZCgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbn1cblxudXRpbGl0aWVzLmNsZWFyLmNhbGxiYWNrcyA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbGl0aWVzXG4iLCIndXNlIHN0cmljdCdcblxuLypcbiAqIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vY29yYmFuYnJvb2svZHNwLmpzL2Jsb2IvbWFzdGVyL2RzcC5qc1xuICogc3RhcnRpbmcgYXQgbGluZSAxNDI3XG4gKiB0YWtlbiA4LzE1LzE2XG4qLyBcblxubW9kdWxlLmV4cG9ydHMgPSB7IFxuICBiYXJ0bGV0dCggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMiAvIChsZW5ndGggLSAxKSAqICgobGVuZ3RoIC0gMSkgLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSkgXG4gIH0sXG5cbiAgYmFydGxldHRIYW5uKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjYyIC0gMC40OCAqIE1hdGguYWJzKGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMC41KSAtIDAuMzggKiBNYXRoLmNvcyggMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBibGFja21hbiggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgbGV0IGEwID0gKDEgLSBhbHBoYSkgLyAyLFxuICAgICAgICBhMSA9IDAuNSxcbiAgICAgICAgYTIgPSBhbHBoYSAvIDJcblxuICAgIHJldHVybiBhMCAtIGExICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKyBhMiAqIE1hdGguY29zKDQgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgY29zaW5lKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiBNYXRoLmNvcyhNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSBNYXRoLlBJIC8gMilcbiAgfSxcblxuICBnYXVzcyggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KE1hdGguRSwgLTAuNSAqIE1hdGgucG93KChpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpIC8gKGFscGhhICogKGxlbmd0aCAtIDEpIC8gMiksIDIpKVxuICB9LFxuXG4gIGhhbW1pbmcoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNTQgLSAwLjQ2ICogTWF0aC5jb3MoIE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgaGFubiggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKVxuICB9LFxuXG4gIGxhbmN6b3MoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgbGV0IHggPSAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAxO1xuICAgIHJldHVybiBNYXRoLnNpbihNYXRoLlBJICogeCkgLyAoTWF0aC5QSSAqIHgpXG4gIH0sXG5cbiAgcmVjdGFuZ3VsYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDFcbiAgfSxcblxuICB0cmlhbmd1bGFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAyIC8gbGVuZ3RoICogKGxlbmd0aCAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKVxuICB9LFxuXG4gIGV4cG9uZW50aWFsKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICByZXR1cm4gTWF0aC5wb3coIGluZGV4L2xlbmd0aCwgYWxwaGEgKVxuICB9LFxuXG4gIGxpbmVhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gaW5kZXgvbGVuZ3RoXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZmxvb3I9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTond3JhcCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHNpZ25hbCA9IGlucHV0c1swXSwgbWluID0gaW5wdXRzWzFdLCBtYXggPSBpbnB1dHNbMl0sXG4gICAgICAgIG91dCwgZGlmZlxuXG4gICAgLy9vdXQgPSBgKCgoJHtpbnB1dHNbMF19IC0gJHt0aGlzLm1pbn0pICUgJHtkaWZmfSAgKyAke2RpZmZ9KSAlICR7ZGlmZn0gKyAke3RoaXMubWlufSlgXG4gICAgLy9jb25zdCBsb25nIG51bVdyYXBzID0gbG9uZygodi1sbykvcmFuZ2UpIC0gKHYgPCBsbyk7XG4gICAgLy9yZXR1cm4gdiAtIHJhbmdlICogZG91YmxlKG51bVdyYXBzKTsgICBcbiAgICBcbiAgICBpZiggdGhpcy5taW4gPT09IDAgKSB7XG4gICAgICBkaWZmID0gbWF4XG4gICAgfWVsc2UgaWYgKCBpc05hTiggbWF4ICkgfHwgaXNOYU4oIG1pbiApICkge1xuICAgICAgZGlmZiA9IGAke21heH0gLSAke21pbn1gXG4gICAgfWVsc2V7XG4gICAgICBkaWZmID0gbWF4IC0gbWluXG4gICAgfVxuXG4gICAgb3V0ID1cbmAgbGV0ICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9IDwgJHt0aGlzLm1pbn0gKSAke3RoaXMubmFtZX0gKz0gJHtkaWZmfVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPiAke3RoaXMubWF4fSApICR7dGhpcy5uYW1lfSAtPSAke2RpZmZ9XG5cbmBcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgJyAnICsgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCJcInVzZSBzdHJpY3RcIlxuXG5sZXQgTWVtb3J5SGVscGVyID0ge1xuICBjcmVhdGUoIHNpemU9NDA5NiwgbWVtdHlwZT1GbG9hdDMyQXJyYXkgKSB7XG4gICAgbGV0IGhlbHBlciA9IE9iamVjdC5jcmVhdGUoIHRoaXMgKVxuXG4gICAgT2JqZWN0LmFzc2lnbiggaGVscGVyLCB7XG4gICAgICBoZWFwOiBuZXcgbWVtdHlwZSggc2l6ZSApLFxuICAgICAgbGlzdDoge30sXG4gICAgICBmcmVlTGlzdDoge31cbiAgICB9KVxuXG4gICAgcmV0dXJuIGhlbHBlclxuICB9LFxuICBcbiAgYWxsb2MoIGFtb3VudCApIHtcbiAgICBsZXQgaWR4ID0gLTFcblxuICAgIGlmKCBhbW91bnQgPiB0aGlzLmhlYXAubGVuZ3RoICkge1xuICAgICAgdGhyb3cgRXJyb3IoICdBbGxvY2F0aW9uIHJlcXVlc3QgaXMgbGFyZ2VyIHRoYW4gaGVhcCBzaXplIG9mICcgKyB0aGlzLmhlYXAubGVuZ3RoIClcbiAgICB9XG5cbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5mcmVlTGlzdCApIHtcbiAgICAgIGxldCBjYW5kaWRhdGVTaXplID0gdGhpcy5mcmVlTGlzdFsga2V5IF1cblxuICAgICAgaWYoIGNhbmRpZGF0ZVNpemUgPj0gYW1vdW50ICkge1xuICAgICAgICBpZHggPSBrZXlcblxuICAgICAgICB0aGlzLmxpc3RbIGlkeCBdID0gYW1vdW50XG5cbiAgICAgICAgaWYoIGNhbmRpZGF0ZVNpemUgIT09IGFtb3VudCApIHtcbiAgICAgICAgICBsZXQgbmV3SW5kZXggPSBpZHggKyBhbW91bnQsXG4gICAgICAgICAgICAgIG5ld0ZyZWVTaXplXG5cbiAgICAgICAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5saXN0ICkge1xuICAgICAgICAgICAgaWYoIGtleSA+IG5ld0luZGV4ICkge1xuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZSA9IGtleSAtIG5ld0luZGV4XG4gICAgICAgICAgICAgIHRoaXMuZnJlZUxpc3RbIG5ld0luZGV4IF0gPSBuZXdGcmVlU2l6ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGlkeCA9PT0gLTEgKSB7XG4gICAgICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKCB0aGlzLmxpc3QgKSxcbiAgICAgICAgICBsYXN0SW5kZXhcblxuICAgICAgaWYoIGtleXMubGVuZ3RoICkgeyAvLyBpZiBub3QgZmlyc3QgYWxsb2NhdGlvbi4uLlxuICAgICAgICBsYXN0SW5kZXggPSBwYXJzZUludCgga2V5c1sga2V5cy5sZW5ndGggLSAxIF0gKVxuXG4gICAgICAgIGlkeCA9IGxhc3RJbmRleCArIHRoaXMubGlzdFsgbGFzdEluZGV4IF1cbiAgICAgIH1lbHNle1xuICAgICAgICBpZHggPSAwXG4gICAgICB9XG5cbiAgICAgIHRoaXMubGlzdFsgaWR4IF0gPSBhbW91bnRcbiAgICB9XG5cbiAgICBpZiggaWR4ICsgYW1vdW50ID49IHRoaXMuaGVhcC5sZW5ndGggKSB7XG4gICAgICB0aHJvdyBFcnJvciggJ05vIGF2YWlsYWJsZSBibG9ja3MgcmVtYWluIHN1ZmZpY2llbnQgZm9yIGFsbG9jYXRpb24gcmVxdWVzdC4nIClcbiAgICB9XG4gICAgcmV0dXJuIGlkeFxuICB9LFxuXG4gIGZyZWUoIGluZGV4ICkge1xuICAgIGlmKCB0eXBlb2YgdGhpcy5saXN0WyBpbmRleCBdICE9PSAnbnVtYmVyJyApIHtcbiAgICAgIHRocm93IEVycm9yKCAnQ2FsbGluZyBmcmVlKCkgb24gbm9uLWV4aXN0aW5nIGJsb2NrLicgKVxuICAgIH1cblxuICAgIHRoaXMubGlzdFsgaW5kZXggXSA9IDBcblxuICAgIGxldCBzaXplID0gMFxuICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmxpc3QgKSB7XG4gICAgICBpZigga2V5ID4gaW5kZXggKSB7XG4gICAgICAgIHNpemUgPSBrZXkgLSBpbmRleFxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZnJlZUxpc3RbIGluZGV4IF0gPSBzaXplXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlIZWxwZXJcblxuIl19
