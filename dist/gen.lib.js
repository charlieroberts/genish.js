(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.genish = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'abs',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, isWorklet ? 'Math.abs' : Math.abs));

      out = ref + 'abs( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],2:[function(require,module,exports){
'use strict';

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

    //gen.closures.add({ [ this.name ]: this }) 

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
  var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
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

},{"./gen.js":32}],3:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'acos',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'acos': isWorklet ? 'Math.acos' : Math.acos });

      out = ref + 'acos( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],4:[function(require,module,exports){
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
    memo = require('./memo.js'),
    utilities = require('./utilities.js');

module.exports = function () {
  var attackTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44100;
  var decayTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 44100;
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

  var usingWorklet = gen.mode === 'worklet';
  if (usingWorklet === true) {
    out.node = null;
    utilities.register(out);
  }

  // needed for gibberish... getting this to work right with worklets
  // via promises will probably be tricky
  out.isComplete = function () {
    if (usingWorklet === true && out.node !== null) {
      var p = new Promise(function (resolve) {
        out.node.getMemoryValue(completeFlag.memory.values.idx, resolve);
      });

      return p;
    } else {
      return gen.memory.heap[completeFlag.memory.values.idx];
    }
  };

  out.trigger = function () {
    if (usingWorklet === true && out.node !== null) {
      out.node.port.postMessage({ key: 'set', idx: completeFlag.memory.values.idx, value: 0 });
    } else {
      gen.memory.heap[completeFlag.memory.values.idx] = 0;
    }
    _bang.trigger();
  };

  return out;
};

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":32,"./gte.js":34,"./ifelseif.js":37,"./lt.js":40,"./memo.js":44,"./mul.js":50,"./neq.js":51,"./peek.js":56,"./poke.js":58,"./sub.js":69,"./utilities.js":75}],5:[function(require,module,exports){
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

},{"./gen.js":32}],6:[function(require,module,exports){
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
  var attackTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44;
  var decayTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 22050;
  var sustainTime = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 44100;
  var sustainLevel = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : .6;
  var releaseTime = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 44100;
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

  var usingWorklet = gen.mode === 'worklet';
  if (usingWorklet === true) {
    out.node = null;
    utilities.register(out);
  }

  out.trigger = function () {
    shouldSustain.value = 1;
    envTrigger.trigger();
  };

  // needed for gibberish... getting this to work right with worklets
  // via promises will probably be tricky
  out.isComplete = function () {
    if (usingWorklet === true && out.node !== null) {
      var p = new Promise(function (resolve) {
        out.node.getMemoryValue(completeFlag.memory.values.idx, resolve);
      });

      return p;
    } else {
      return gen.memory.heap[completeFlag.memory.values.idx];
    }
  };

  out.release = function () {
    shouldSustain.value = 0;
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    if (usingWorklet && out.node !== null) {
      out.node.port.postMessage({ key: 'set', idx: releaseAccum.inputs[0].inputs[1].memory.value.idx, value: 0 });
    } else {
      gen.memory.heap[releaseAccum.inputs[0].inputs[1].memory.value.idx] = 0;
    }
  };

  return out;
};

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":32,"./gtp.js":35,"./ifelseif.js":37,"./lt.js":40,"./mul.js":50,"./neq.js":51,"./not.js":53,"./param.js":55,"./peek.js":56,"./poke.js":58,"./sub.js":69}],7:[function(require,module,exports){
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

},{"./gen.js":32}],8:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'asin',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'asin': isWorklet ? 'Math.sin' : Math.asin });

      out = ref + 'asin( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],9:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'atan',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'atan': isWorklet ? 'Math.atan' : Math.atan });

      out = ref + 'atan( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],10:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js');

module.exports = function () {
    var decayTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44100;

    var ssd = history(1),
        t60 = Math.exp(-6.907755278921 / decayTime);

    ssd.in(mul(ssd.out, t60));

    ssd.out.trigger = function () {
        ssd.value = 1;
    };

    return sub(1, ssd.out);
};

},{"./gen.js":32,"./history.js":36,"./mul.js":50,"./sub.js":69}],11:[function(require,module,exports){
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

  var usingWorklet = _gen.mode === 'worklet';
  if (usingWorklet === true) {
    ugen.node = null;
    utilities.register(ugen);
  }

  ugen.trigger = function () {
    if (usingWorklet === true && ugen.node !== null) {
      ugen.node.port.postMessage({ key: 'set', idx: ugen.memory.value.idx, value: ugen.max });
    } else {
      _gen.memory.heap[ugen.memory.value.idx] = ugen.max;
    }
  };

  ugen.memory = {
    value: { length: 1, idx: null }
  };

  return ugen;
};

},{"./gen.js":32}],12:[function(require,module,exports){
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

},{"./gen.js":32}],13:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'ceil',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, isWorklet ? 'Math.ceil' : Math.ceil));

      out = ref + 'ceil( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],14:[function(require,module,exports){
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
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : -1;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

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

},{"./floor.js":29,"./gen.js":32,"./memo.js":44,"./sub.js":69}],15:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'cos',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';

    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'cos': isWorklet ? 'Math.cos' : Math.cos });

      out = ref + 'cos( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],16:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'counter',

  gen: function gen() {
    var code = void 0,
        inputs = _gen.getInputs(this),
        genName = 'gen.' + this.name,
        functionBody = void 0;

    if (this.memory.value.idx === null) _gen.requestMemory(this.memory);
    _gen.memory.heap[this.memory.value.idx] = this.initialValue;

    functionBody = this.callback(genName, inputs[0], inputs[1], inputs[2], inputs[3], inputs[4], 'memory[' + this.memory.value.idx + ']', 'memory[' + this.memory.wrap.idx + ']');

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
  var incr = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var reset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var loops = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
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

},{"./gen.js":32}],17:[function(require,module,exports){
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
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var _props = arguments[2];

  if (typeof gen.globals.cycle === 'undefined') proto.initTable();
  var props = Object.assign({}, { min: 0 }, _props);

  var ugen = peek(gen.globals.cycle, phasor(frequency, reset, props));
  ugen.name = 'cycle' + gen.getUID();

  return ugen;
};

},{"./data.js":18,"./gen.js":32,"./mul.js":50,"./peek.js":56,"./phasor.js":57}],18:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js'),
    utilities = require('./utilities.js'),
    peek = require('./peek.js'),
    poke = require('./poke.js');

var proto = {
  basename: 'data',
  globals: {},
  memo: {},

  gen: function gen() {
    var idx = void 0;
    //console.log( 'data name:', this.name, proto.memo )
    //debugger
    if (_gen.memo[this.name] === undefined) {
      var ugen = this;
      _gen.requestMemory(this.memory, this.immutable);
      idx = this.memory.values.idx;
      if (this.buffer !== undefined) {
        try {
          _gen.memory.heap.set(this.buffer, idx);
        } catch (e) {
          console.log(e);
          throw Error('error with request. asking for ' + this.buffer.length + '. current index: ' + _gen.memoryIndex + ' of ' + _gen.memory.heap.length);
        }
      }
      //gen.data[ this.name ] = this
      //return 'gen.memory' + this.name + '.buffer'
      if (this.name.indexOf('data') === -1) {
        proto.memo[this.name] = idx;
      } else {
        _gen.memo[this.name] = idx;
      }
    } else {
      //console.log( 'using gen data memo', proto.memo[ this.name ] )
      idx = _gen.memo[this.name];
    }
    return idx;
  }
};

module.exports = function (x) {
  var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
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
    //buffer = { length: y > 1 ? y : gen.samplerate * 60 } // XXX what???
    //if( proto.memo[ x ] === undefined ) {
    buffer = { length: y > 1 ? y : 1 // XXX what???
    };shouldLoad = true;
    //}else{
    //buffer = proto.memo[ x ]
    //}
  } else if (x instanceof Float32Array) {
    buffer = x;
  }

  ugen = Object.create(proto);

  Object.assign(ugen, {
    buffer: buffer,
    name: proto.basename + _gen.getUID(),
    dim: buffer !== undefined ? buffer.length : 1, // XXX how do we dynamically allocate this?
    channels: 1,
    onload: null,
    //then( fnc ) {
    //  ugen.onload = fnc
    //  return ugen
    //},
    immutable: properties !== undefined && properties.immutable === true ? true : false,
    load: function load(filename, __resolve) {
      var promise = utilities.loadSample(filename, ugen);
      promise.then(function (_buffer) {
        proto.memo[x] = _buffer;
        ugen.name = filename;
        ugen.memory.values.length = ugen.dim = _buffer.length;

        _gen.requestMemory(ugen.memory, ugen.immutable);
        _gen.memory.heap.set(_buffer, ugen.memory.values.idx);
        if (typeof ugen.onload === 'function') ugen.onload(_buffer);
        __resolve(ugen);
      });
    },

    memory: {
      values: { length: buffer !== undefined ? buffer.length : 1, idx: null }
    }
  }, properties);

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

  var returnValue = void 0;
  if (shouldLoad === true) {
    returnValue = new Promise(function (resolve, reject) {
      //ugen.load( x, resolve )
      var promise = utilities.loadSample(x, ugen);
      promise.then(function (_buffer) {
        proto.memo[x] = _buffer;
        ugen.memory.values.length = ugen.dim = _buffer.length;

        ugen.buffer = _buffer;
        _gen.on('memory init', function () {
          _gen.requestMemory(ugen.memory, ugen.immutable);
          _gen.memory.heap.set(_buffer, ugen.memory.values.idx);
          if (typeof ugen.onload === 'function') ugen.onload(_buffer);
        });
        resolve(ugen);
      });
    });
  } else if (proto.memo[x] !== undefined) {
    _gen.on('memory init', function () {
      _gen.requestMemory(ugen.memory, ugen.immutable);
      _gen.memory.heap.set(ugen.buffer, ugen.memory.values.idx);
      if (typeof ugen.onload === 'function') ugen.onload(ugen.buffer);
    });
    returnValue = ugen;
  } else {
    returnValue = ugen;
  }

  return returnValue;
};

},{"./gen.js":32,"./peek.js":56,"./poke.js":58,"./utilities.js":75}],19:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":32,"./history.js":36,"./memo.js":44,"./mul.js":50,"./sub.js":69}],20:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    history = require('./history.js'),
    mul = require('./mul.js'),
    t60 = require('./t60.js');

module.exports = function () {
    var decayTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44100;
    var props = arguments[1];

    var properties = Object.assign({}, { initValue: 1 }, props),
        ssd = history(properties.initValue);

    ssd.in(mul(ssd.out, t60(decayTime)));

    ssd.out.trigger = function () {
        ssd.value = 1;
    };

    return ssd.out;
};

},{"./gen.js":32,"./history.js":36,"./mul.js":50,"./t60.js":71}],21:[function(require,module,exports){
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

},{"./accum.js":2,"./data.js":18,"./gen.js":32,"./memo.js":44,"./peek.js":56,"./poke.js":58,"./sub.js":69,"./wrap.js":77}],22:[function(require,module,exports){
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

},{"./gen.js":32,"./history.js":36,"./sub.js":69}],23:[function(require,module,exports){
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

},{"./gen.js":32}],24:[function(require,module,exports){
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

},{"./data":18,"./gen":32,"./peek":56,"./phasor":57,"./windows":76}],25:[function(require,module,exports){
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

},{"./gen.js":32}],26:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'exp',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, isWorklet ? 'Math.exp' : Math.exp));

      out = ref + 'exp( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],27:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

// originally from:
// https://github.com/GoogleChromeLabs/audioworklet-polyfill
// I am modifying it to accept variable buffer sizes
// and to get rid of some strange global initialization that seems required to use it
// with browserify. Also, I added changes to fix a bug in Safari for the AudioWorkletProcessor
// property not having a prototype (see:https://github.com/GoogleChromeLabs/audioworklet-polyfill/pull/25)
// TODO: Why is there an iframe involved? (realm.js)

var Realm = require('./realm.js');

var AWPF = function AWPF() {
  var self = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;
  var bufferSize = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4096;

  var PARAMS = [];
  var nextPort = void 0;

  if (typeof AudioWorkletNode !== 'function' || !("audioWorklet" in AudioContext.prototype)) {
    self.AudioWorkletNode = function AudioWorkletNode(context, name, options) {
      var processor = getProcessorsForContext(context)[name];
      var outputChannels = options && options.outputChannelCount ? options.outputChannelCount[0] : 2;
      var scriptProcessor = context.createScriptProcessor(bufferSize, 2, outputChannels);

      scriptProcessor.parameters = new Map();
      if (processor.properties) {
        for (var i = 0; i < processor.properties.length; i++) {
          var prop = processor.properties[i];
          var node = context.createGain().gain;
          node.value = prop.defaultValue;
          // @TODO there's no good way to construct the proxy AudioParam here
          scriptProcessor.parameters.set(prop.name, node);
        }
      }

      var mc = new MessageChannel();
      nextPort = mc.port2;
      var inst = new processor.Processor(options || {});
      nextPort = null;

      scriptProcessor.port = mc.port1;
      scriptProcessor.processor = processor;
      scriptProcessor.instance = inst;
      scriptProcessor.onaudioprocess = onAudioProcess;
      return scriptProcessor;
    };

    Object.defineProperty((self.AudioContext || self.webkitAudioContext).prototype, 'audioWorklet', {
      get: function get() {
        return this.$$audioWorklet || (this.$$audioWorklet = new self.AudioWorklet(this));
      }
    });

    /* XXX - ADDED TO OVERCOME PROBLEM IN SAFARI WHERE AUDIOWORKLETPROCESSOR PROTOTYPE IS NOT AN OBJECT */
    var AudioWorkletProcessor = function AudioWorkletProcessor() {
      this.port = nextPort;
    };
    AudioWorkletProcessor.prototype = {};

    self.AudioWorklet = function () {
      function AudioWorklet(audioContext) {
        _classCallCheck(this, AudioWorklet);

        this.$$context = audioContext;
      }

      _createClass(AudioWorklet, [{
        key: 'addModule',
        value: function addModule(url, options) {
          var _this = this;

          return fetch(url).then(function (r) {
            if (!r.ok) throw Error(r.status);
            return r.text();
          }).then(function (code) {
            var context = {
              sampleRate: _this.$$context.sampleRate,
              currentTime: _this.$$context.currentTime,
              AudioWorkletProcessor: AudioWorkletProcessor,
              registerProcessor: function registerProcessor(name, Processor) {
                var processors = getProcessorsForContext(_this.$$context);
                processors[name] = {
                  realm: realm,
                  context: context,
                  Processor: Processor,
                  properties: Processor.parameterDescriptors || []
                };
              }
            };

            context.self = context;
            var realm = new Realm(context, document.documentElement);
            realm.exec((options && options.transpile || String)(code));
            return null;
          });
        }
      }]);

      return AudioWorklet;
    }();
  }

  function onAudioProcess(e) {
    var _this2 = this;

    var parameters = {};
    var index = -1;
    this.parameters.forEach(function (value, key) {
      var arr = PARAMS[++index] || (PARAMS[index] = new Float32Array(_this2.bufferSize));
      // @TODO proper values here if possible
      arr.fill(value.value);
      parameters[key] = arr;
    });
    this.processor.realm.exec('self.sampleRate=sampleRate=' + this.context.sampleRate + ';' + 'self.currentTime=currentTime=' + this.context.currentTime);
    var inputs = channelToArray(e.inputBuffer);
    var outputs = channelToArray(e.outputBuffer);
    this.instance.process([inputs], [outputs], parameters);
  }

  function channelToArray(ch) {
    var out = [];
    for (var i = 0; i < ch.numberOfChannels; i++) {
      out[i] = ch.getChannelData(i);
    }
    return out;
  }

  function getProcessorsForContext(audioContext) {
    return audioContext.$$processors || (audioContext.$$processors = {});
  }
};

module.exports = AWPF;

},{"./realm.js":28}],28:[function(require,module,exports){
'use strict';

/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

module.exports = function Realm(scope, parentElement) {
  var frame = document.createElement('iframe');
  frame.style.cssText = 'position:absolute;left:0;top:-999px;width:1px;height:1px;';
  parentElement.appendChild(frame);
  var win = frame.contentWindow;
  var doc = win.document;
  var vars = 'var window,$hook';
  for (var i in win) {
    if (!(i in scope) && i !== 'eval') {
      vars += ',';
      vars += i;
    }
  }
  for (var _i in scope) {
    vars += ',';
    vars += _i;
    vars += '=self.';
    vars += _i;
  }
  var script = doc.createElement('script');
  script.appendChild(doc.createTextNode('function $hook(self,console) {"use strict";\n        ' + vars + ';return function() {return eval(arguments[0])}}'));
  doc.body.appendChild(script);
  this.exec = win.$hook.call(scope, scope, console);
};

},{}],29:[function(require,module,exports){
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

},{"./gen.js":32}],30:[function(require,module,exports){
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
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

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

},{"./gen.js":32}],31:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

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

},{"./gen.js":32}],32:[function(require,module,exports){
'use strict';

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var MemoryHelper = require('memory-helper');
var EE = require('events').EventEmitter;

var gen = {

  accum: 0,
  getUID: function getUID() {
    return this.accum++;
  },

  debug: false,
  samplerate: 44100, // change on audiocontext creation
  shouldLocalize: false,
  graph: null,
  globals: {
    windows: {}
  },
  mode: 'worklet',

  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),
  params: new Set(),
  inputs: new Set(),

  parameters: new Set(),
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
    var immutable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

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
  createCallback: function createCallback(ugen, mem) {
    var debug = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var shouldInlineMemory = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var memType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : Float64Array;

    var isStereo = Array.isArray(ugen) && ugen.length > 1,
        callback = void 0,
        channel1 = void 0,
        channel2 = void 0;

    if (typeof mem === 'number' || mem === undefined) {
      this.memory = this.createMemory(mem, memType);
      this.outputIdx = this.memory.alloc(2, true);
      this.emit('memory init');
    }

    //console.log( 'cb memory:', mem )
    this.graph = ugen;
    this.memo = {};
    this.endBlock.clear();
    this.closures.clear();
    this.inputs.clear();
    this.params.clear();
    this.globals = { windows: {} };

    this.parameters.clear();

    this.functionBody = "  'use strict'\n";
    if (shouldInlineMemory === false) {
      this.functionBody += this.mode === 'worklet' ? "  var memory = this.memory\n\n" : "  var memory = gen.memory\n\n";
    }

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
      body[lastidx] = '  memory[' + (this.outputIdx + i) + ']  = ' + body[lastidx] + '\n';

      this.functionBody += body.join('\n');
    }

    this.histories.forEach(function (value) {
      if (value !== null) value.gen();
    });

    var returnStatement = isStereo ? '  return [ memory[' + this.outputIdx + '], memory[' + (this.outputIdx + 1) + '] ]' : '  return memory[' + this.outputIdx + ']';

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
      this.parameters.add('memory');
    }

    var paramString = '';
    if (this.mode === 'worklet') {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.parameters.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var name = _step.value;

          paramString += name + ',';
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

      paramString = paramString.slice(0, -1);
    }

    var separator = this.parameters.size !== 0 && this.inputs.size > 0 ? ', ' : '';

    var inputString = '';
    if (this.mode === 'worklet') {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.inputs.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _ugen = _step2.value;

          inputString += _ugen.name + ',';
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

      inputString = inputString.slice(0, -1);
    }

    var buildString = this.mode === 'worklet' ? 'return function( ' + inputString + ' ' + separator + ' ' + paramString + ' ){ \n' + this.functionBody + '\n}' : 'return function gen( ' + [].concat(_toConsumableArray(this.parameters)).join(',') + ' ){ \n' + this.functionBody + '\n}';

    if (this.debug || debug) console.log(buildString);

    callback = new Function(buildString)();

    // assign properties to named function
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = this.closures.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var dict = _step3.value;

        var _name = Object.keys(dict)[0],
            value = dict[_name];

        callback[_name] = value;
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

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      var _loop = function _loop() {
        var dict = _step4.value;

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

      for (var _iterator4 = this.params.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        _loop();
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

    callback.members = this.closures;
    callback.data = this.data;
    callback.params = this.params;
    callback.inputs = this.inputs;
    callback.parameters = this.parameters; //.slice( 0 )
    callback.isStereo = isStereo;

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
          input = input.graph;
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
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = graph[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var channel = _step5.value;

          this.free(channel);
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
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
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = graph.inputs[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var ugen = _step6.value;

              this.free(ugen);
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6.return) {
                _iterator6.return();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }
        }
      }
    }
  }
};

gen.__proto__ = new EE();

module.exports = gen;

},{"events":78,"memory-helper":79}],33:[function(require,module,exports){
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

},{"./gen.js":32}],34:[function(require,module,exports){
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

},{"./gen.js":32}],35:[function(require,module,exports){
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

},{"./gen.js":32}],36:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

module.exports = function () {
  var in1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

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

},{"./gen.js":32}],37:[function(require,module,exports){
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

},{"./gen.js":32}],38:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'in',

  gen: function gen() {
    var isWorklet = _gen.mode === 'worklet';

    if (isWorklet) {
      _gen.inputs.add(this);
    } else {
      _gen.parameters.add(this.name);
    }

    //gen.memo[ this.name ] = isWorklet ? this.name + '[i]' : this.name
    _gen.memo[this.name] = this.name + '[i]';

    return this.name + '[i]';
  }
};

module.exports = function (name) {
  var inputNumber = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var channelNumber = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var defaultValue = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  var min = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  var max = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 1;

  var input = Object.create(proto);

  input.id = _gen.getUID();
  input.name = name !== undefined ? name : '' + input.basename + input.id;
  Object.assign(input, { defaultValue: defaultValue, min: min, max: max, inputNumber: inputNumber, channelNumber: channelNumber });

  input[0] = {
    gen: function gen() {
      if (!_gen.parameters.has(input.name)) _gen.parameters.add(input.name);
      return input.name + '[0]';
    }
  };
  input[1] = {
    gen: function gen() {
      if (!_gen.parameters.has(input.name)) _gen.parameters.add(input.name);
      return input.name + '[1]';
    }
  };

  return input;
};

},{"./gen.js":32}],39:[function(require,module,exports){
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
  exp: require('./exp.js'),
  process: require('./process.js'),
  seq: require('./seq.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./data.js":18,"./dcblock.js":19,"./decay.js":20,"./delay.js":21,"./delta.js":22,"./div.js":23,"./env.js":24,"./eq.js":25,"./exp.js":26,"./floor.js":29,"./fold.js":30,"./gate.js":31,"./gen.js":32,"./gt.js":33,"./gte.js":34,"./gtp.js":35,"./history.js":36,"./ifelseif.js":37,"./in.js":38,"./lt.js":40,"./lte.js":41,"./ltp.js":42,"./max.js":43,"./memo.js":44,"./min.js":45,"./mix.js":46,"./mod.js":47,"./mstosamps.js":48,"./mtof.js":49,"./mul.js":50,"./neq.js":51,"./noise.js":52,"./not.js":53,"./pan.js":54,"./param.js":55,"./peek.js":56,"./phasor.js":57,"./poke.js":58,"./pow.js":59,"./process.js":60,"./rate.js":61,"./round.js":62,"./sah.js":63,"./selector.js":64,"./seq.js":65,"./sign.js":66,"./sin.js":67,"./slide.js":68,"./sub.js":69,"./switch.js":70,"./t60.js":71,"./tan.js":72,"./tanh.js":73,"./train.js":74,"./utilities.js":75,"./windows.js":76,"./wrap.js":77}],40:[function(require,module,exports){
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

},{"./gen.js":32}],41:[function(require,module,exports){
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

},{"./gen.js":32}],42:[function(require,module,exports){
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

},{"./gen.js":32}],43:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'max',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add(_defineProperty({}, this.name, isWorklet ? 'Math.max' : Math.max));

      out = ref + 'max( ' + inputs[0] + ', ' + inputs[1] + ' )';
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

},{"./gen.js":32}],44:[function(require,module,exports){
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

},{"./gen.js":32}],45:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'min',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add(_defineProperty({}, this.name, isWorklet ? 'Math.min' : Math.min));

      out = ref + 'min( ' + inputs[0] + ', ' + inputs[1] + ' )';
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

},{"./gen.js":32}],46:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    memo = require('./memo.js');

module.exports = function (in1, in2) {
    var t = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : .5;

    var ugen = memo(add(mul(in1, sub(1, t)), mul(in2, t)));
    ugen.name = 'mix' + gen.getUID();

    return ugen;
};

},{"./add.js":5,"./gen.js":32,"./memo.js":44,"./mul.js":50,"./sub.js":69}],47:[function(require,module,exports){
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

},{"./gen.js":32}],48:[function(require,module,exports){
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

},{"./gen.js":32}],49:[function(require,module,exports){
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

},{"./gen.js":32}],50:[function(require,module,exports){
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

},{"./gen.js":32}],51:[function(require,module,exports){
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

},{"./gen.js":32}],52:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  name: 'noise',

  gen: function gen() {
    var out = void 0;

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    _gen.closures.add({ 'noise': isWorklet ? 'Math.random' : Math.random });

    out = '  var ' + this.name + ' = ' + ref + 'noise()\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];
  }
};

module.exports = function (x) {
  var noise = Object.create(proto);
  noise.name = proto.name + _gen.getUID();

  return noise;
};

},{"./gen.js":32}],53:[function(require,module,exports){
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

},{"./gen.js":32}],54:[function(require,module,exports){
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
  var pan = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : .5;
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

},{"./data.js":18,"./gen.js":32,"./mul.js":50,"./peek.js":56}],55:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'param',

  gen: function gen() {
    _gen.requestMemory(this.memory);

    _gen.params.add(this);

    var isWorklet = _gen.mode === 'worklet';

    if (isWorklet) _gen.parameters.add(this.name);

    this.value = this.initialValue;

    _gen.memo[this.name] = isWorklet ? this.name : 'memory[' + this.memory.value.idx + ']';

    return _gen.memo[this.name];
  }
};

module.exports = function () {
  var propName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var min = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var max = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

  var ugen = Object.create(proto);

  if (typeof propName !== 'string') {
    ugen.name = ugen.basename + _gen.getUID();
    ugen.initialValue = propName;
  } else {
    ugen.name = propName;
    ugen.initialValue = value;
  }

  ugen.min = min;
  ugen.max = max;
  ugen.defaultValue = ugen.initialValue;

  // for storing worklet nodes once they're instantiated
  ugen.waapi = null;

  ugen.isWorklet = _gen.mode === 'worklet';

  Object.defineProperty(ugen, 'value', {
    get: function get() {
      if (this.memory.value.idx !== null) {
        return _gen.memory.heap[this.memory.value.idx];
      } else {
        return this.initialValue;
      }
    },
    set: function set(v) {
      if (this.memory.value.idx !== null) {
        if (this.isWorklet && this.waapi !== null) {
          this.waapi.value = v;
        } else {
          _gen.memory.heap[this.memory.value.idx] = v;
        }
      }
    }
  });

  ugen.memory = {
    value: { length: 1, idx: null }
  };

  return ugen;
};

},{"./gen.js":32}],56:[function(require,module,exports){
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

      functionBody = '  var ' + this.name + '_dataIdx  = ' + idx + ', \n      ' + this.name + '_phase = ' + (this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + this.data.buffer.length) + ', \n      ' + this.name + '_index = ' + this.name + '_phase | 0,\n';

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
  var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
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

},{"./data.js":18,"./gen.js":32}],57:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./accum.js'),
    mul = require('./mul.js'),
    proto = { basename: 'phasor' },
    div = require('./div.js');

var defaults = { min: -1, max: 1 };

module.exports = function () {
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var _props = arguments[2];

  var props = Object.assign({}, defaults, _props);

  var range = props.max - props.min;

  var ugen = typeof frequency === 'number' ? accum(frequency * range / gen.samplerate, reset, props) : accum(div(mul(frequency, range), gen.samplerate), reset, props);

  ugen.name = proto.basename + gen.getUID();

  return ugen;
};

},{"./accum.js":2,"./div.js":23,"./gen.js":32,"./mul.js":50}],58:[function(require,module,exports){
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

},{"./gen.js":32,"./mul.js":50,"./wrap.js":77}],59:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'pow',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0]) || isNaN(inputs[1])) {
      _gen.closures.add({ 'pow': isWorklet ? 'Math.pow' : Math.pow });

      out = ref + 'pow( ' + inputs[0] + ', ' + inputs[1] + ' )';
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

},{"./gen.js":32}],60:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');
var proto = {
  basename: 'process',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    _gen.closures.add(_defineProperty({}, '' + this.funcname, this.func));

    out = '  var ' + this.name + ' = gen[\'' + this.funcname + '\'](';

    inputs.forEach(function (v, i, arr) {
      out += arr[i];
      if (i < arr.length - 1) out += ',';
    });

    out += ')\n';

    _gen.memo[this.name] = this.name;

    return [this.name, out];

    return out;
  }
};

module.exports = function () {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var process = {}; // Object.create( proto )
  var id = _gen.getUID();
  process.name = 'process' + id;

  process.func = new (Function.prototype.bind.apply(Function, [null].concat(args)))();

  //gen.globals[ process.name ] = process.func

  process.call = function () {
    var output = Object.create(proto);
    output.funcname = process.name;
    output.func = process.func;
    output.name = 'process_out_' + id;
    output.process = process;

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    output.inputs = args;

    return output;
  };

  return process;
};

},{"./gen.js":32}],61:[function(require,module,exports){
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

},{"./add.js":5,"./delta.js":22,"./gen.js":32,"./history.js":36,"./memo.js":44,"./mul.js":50,"./sub.js":69,"./wrap.js":77}],62:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'round',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, isWorklet ? 'Math.round' : Math.round));

      out = ref + 'round( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],63:[function(require,module,exports){
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

    _gen.memo[this.name] = 'memory[' + this.memory.value.idx + ']'; //`gen.data.${this.name}`

    return ['memory[' + this.memory.value.idx + ']', ' ' + out];
  }
};

module.exports = function (in1, control) {
  var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
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

},{"./gen.js":32}],64:[function(require,module,exports){
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

},{"./gen.js":32}],65:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./accum.js'),
    counter = require('./counter.js'),
    peek = require('./peek.js'),
    ssd = require('./history.js'),
    data = require('./data.js'),
    proto = { basename: 'seq' };

module.exports = function () {
  var durations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 11025;
  var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [0, 1];
  var phaseIncrement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

  var clock = void 0;

  if (Array.isArray(durations)) {
    // we want a counter that is using our current
    // rate value, but we want the rate value to be derived from
    // the counter. must insert a single-sample dealy to avoid
    // infinite loop.
    var clock2 = counter(0, 0, durations.length);
    var __durations = peek(data(durations), clock2, { mode: 'simple' });
    clock = counter(phaseIncrement, 0, __durations);

    // add one sample delay to avoid codegen loop
    var s = ssd();
    s.in(clock.wrap);
    clock2.inputs[0] = s.out;
  } else {
    // if the rate argument is a single value we don't need to
    // do anything tricky.
    clock = counter(phaseIncrement, 0, durations);
  }

  var stepper = accum(clock.wrap, 0, { min: 0, max: values.length });

  var ugen = peek(data(values), stepper, { mode: 'simple' });

  ugen.name = proto.basename + gen.getUID();
  ugen.trigger = clock.wrap;

  return ugen;
};

},{"./accum.js":2,"./counter.js":16,"./data.js":18,"./gen.js":32,"./history.js":36,"./peek.js":56}],66:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  name: 'sign',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, this.name, isWorklet ? 'Math.sign' : Math.sign));

      out = ref + 'sign( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],67:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'sin',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'sin': isWorklet ? 'Math.sin' : Math.sin });

      out = ref + 'sin( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],68:[function(require,module,exports){
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
    var slideUp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var slideDown = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

    var y1 = history(0),
        filter = void 0,
        slideAmount = void 0;

    //y (n) = y (n-1) + ((x (n) - y (n-1))/slide) 
    slideAmount = _switch(gt(in1, y1.out), slideUp, slideDown);

    filter = memo(add(y1.out, div(sub(in1, y1.out), slideAmount)));

    y1.in(filter);

    return filter;
};

},{"./add.js":5,"./div.js":23,"./gen.js":32,"./gt.js":33,"./history.js":36,"./memo.js":44,"./mul.js":50,"./sub.js":69,"./switch.js":70}],69:[function(require,module,exports){
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

},{"./gen.js":32}],70:[function(require,module,exports){
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
  var in1 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var in2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var ugen = Object.create(proto);
  Object.assign(ugen, {
    uid: _gen.getUID(),
    inputs: [control, in1, in2]
  });

  ugen.name = '' + ugen.basename + ugen.uid;

  return ugen;
};

},{"./gen.js":32}],71:[function(require,module,exports){
'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var _gen = require('./gen.js');

var proto = {
  basename: 't60',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this),
        returnValue = void 0;

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add(_defineProperty({}, 'exp', isWorklet ? 'Math.exp' : Math.exp));

      out = '  var ' + this.name + ' = ' + ref + 'exp( -6.907755278921 / ' + inputs[0] + ' )\n\n';

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

},{"./gen.js":32}],72:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'tan',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'tan': isWorklet ? 'Math.tan' : Math.tan });

      out = ref + 'tan( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],73:[function(require,module,exports){
'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'tanh',

  gen: function gen() {
    var out = void 0,
        inputs = _gen.getInputs(this);

    var isWorklet = _gen.mode === 'worklet';
    var ref = isWorklet ? '' : 'gen.';

    if (isNaN(inputs[0])) {
      _gen.closures.add({ 'tanh': isWorklet ? 'Math.tan' : Math.tanh });

      out = ref + 'tanh( ' + inputs[0] + ' )';
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

},{"./gen.js":32}],74:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    lt = require('./lt.js'),
    accum = require('./accum.js'),
    div = require('./div.js');

module.exports = function () {
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 440;
  var pulsewidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : .5;

  var graph = lt(accum(div(frequency, 44100)), pulsewidth);

  graph.name = 'train' + gen.getUID();

  return graph;
};

},{"./accum.js":2,"./div.js":23,"./gen.js":32,"./lt.js":40}],75:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var AWPF = require('./external/audioworklet-polyfill.js'),
    gen = require('./gen.js'),
    data = require('./data.js');

var isStereo = false;

var utilities = {
  ctx: null,
  buffers: {},
  isStereo: false,

  clear: function clear() {
    if (this.workletNode !== undefined) {
      this.workletNode.disconnect();
    } else {
      this.callback = function () {
        return 0;
      };
    }
    this.clear.callbacks.forEach(function (v) {
      return v();
    });
    this.clear.callbacks.length = 0;

    this.isStereo = false;

    if (gen.graph !== null) gen.free(gen.graph);
  },
  createContext: function createContext() {
    var _this = this;

    var bufferSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 2048;

    var AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext;

    // tell polyfill global object and buffersize
    AWPF(window, bufferSize);

    var start = function start() {
      if (typeof AC !== 'undefined') {
        _this.ctx = new AC({ latencyHint: .0125 });

        gen.samplerate = _this.ctx.sampleRate;

        if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
          window.removeEventListener('touchstart', start);
        } else {
          window.removeEventListener('mousedown', start);
          window.removeEventListener('keydown', start);
        }

        var mySource = utilities.ctx.createBufferSource();
        mySource.connect(utilities.ctx.destination);
        mySource.start();
      }
    };

    if (document && document.documentElement && 'ontouchstart' in document.documentElement) {
      window.addEventListener('touchstart', start);
    } else {
      window.addEventListener('mousedown', start);
      window.addEventListener('keydown', start);
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


  // remove starting stuff and add tabs
  prettyPrintCallback: function prettyPrintCallback(cb) {
    // get rid of "function gen" and start with parenthesis
    // const shortendCB = cb.toString().slice(9)
    var cbSplit = cb.toString().split('\n');
    var cbTrim = cbSplit.slice(3, -2);
    var cbTabbed = cbTrim.map(function (v) {
      return '      ' + v;
    });

    return cbTabbed.join('\n');
  },
  createParameterDescriptors: function createParameterDescriptors(cb) {
    // [{name: 'amplitude', defaultValue: 0.25, minValue: 0, maxValue: 1}];
    var paramStr = '';

    //for( let ugen of cb.params.values() ) {
    //  paramStr += `{ name:'${ugen.name}', defaultValue:${ugen.value}, minValue:${ugen.min}, maxValue:${ugen.max} },\n      `
    //}
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = cb.params.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var ugen = _step.value;

        paramStr += '{ name:\'' + ugen.name + '\', automationRate:\'k-rate\', defaultValue:' + ugen.defaultValue + ', minValue:' + ugen.min + ', maxValue:' + ugen.max + ' },\n      ';
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

    return paramStr;
  },
  createParameterDereferences: function createParameterDereferences(cb) {
    var str = cb.params.size > 0 ? '\n      ' : '';
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = cb.params.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var ugen = _step2.value;

        str += 'const ' + ugen.name + ' = parameters.' + ugen.name + '[0]\n      ';
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

    return str;
  },
  createParameterArguments: function createParameterArguments(cb) {
    var paramList = '';
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = cb.params.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var ugen = _step3.value;

        paramList += ugen.name + '[i],';
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

    paramList = paramList.slice(0, -1);

    return paramList;
  },
  createInputDereferences: function createInputDereferences(cb) {
    var str = cb.inputs.size > 0 ? '\n' : '';
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = cb.inputs.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var input = _step4.value;

        str += 'const ' + input.name + ' = inputs[ ' + input.inputNumber + ' ][ ' + input.channelNumber + ' ]\n      ';
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

    return str;
  },
  createInputArguments: function createInputArguments(cb) {
    var paramList = '';
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = cb.inputs.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var input = _step5.value;

        paramList += input.name + '[i],';
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }

    paramList = paramList.slice(0, -1);

    return paramList;
  },
  createFunctionDereferences: function createFunctionDereferences(cb) {
    var memberString = cb.members.size > 0 ? '\n' : '';
    var memo = {};
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = cb.members.values()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var dict = _step6.value;

        var name = Object.keys(dict)[0],
            value = dict[name];

        if (memo[name] !== undefined) continue;
        memo[name] = true;

        memberString += '      const ' + name + ' = ' + value + '\n';
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6.return) {
          _iterator6.return();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }

    return memberString;
  },
  createWorkletProcessor: function createWorkletProcessor(graph, name, debug) {
    var mem = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 44100 * 10;

    //const mem = MemoryHelper.create( 4096, Float64Array )
    var cb = gen.createCallback(graph, mem, debug);
    var inputs = cb.inputs;

    // get all inputs and create appropriate audioparam initializers
    var parameterDescriptors = this.createParameterDescriptors(cb);
    var parameterDereferences = this.createParameterDereferences(cb);
    var paramList = this.createParameterArguments(cb);
    var inputDereferences = this.createInputDereferences(cb);
    var inputList = this.createInputArguments(cb);
    var memberString = this.createFunctionDereferences(cb);

    // change output based on number of channels.
    var genishOutputLine = cb.isStereo === false ? 'left[ i ] = memory[0]' : 'left[ i ] = memory[0];\n\t\tright[ i ] = memory[1]\n';

    var prettyCallback = this.prettyPrintCallback(cb);

    /***** begin callback code ****/
    // note that we have to check to see that memory has been passed
    // to the worker before running the callback function, otherwise
    // it can be passed too slowly and fail on occassion

    var workletCode = '\nclass ' + name + 'Processor extends AudioWorkletProcessor {\n\n  static get parameterDescriptors() {\n    const params = [\n      ' + parameterDescriptors + '      \n    ]\n    return params\n  }\n \n  constructor( options ) {\n    super( options )\n    this.port.onmessage = this.handleMessage.bind( this )\n    this.initialized = false\n  }\n\n  handleMessage( event ) {\n    if( event.data.key === \'init\' ) {\n      this.memory = event.data.memory\n      this.initialized = true\n    }else if( event.data.key === \'set\' ) {\n      this.memory[ event.data.idx ] = event.data.value\n    }else if( event.data.key === \'get\' ) {\n      this.port.postMessage({ key:\'return\', idx:event.data.idx, value:this.memory[event.data.idx] })     \n    }\n  }\n\n  process( inputs, outputs, parameters ) {\n    if( this.initialized === true ) {\n      const output = outputs[0]\n      const left   = output[ 0 ]\n      const right  = output[ 1 ]\n      const len    = left.length\n      const memory = this.memory ' + parameterDereferences + inputDereferences + memberString + '\n\n      for( let i = 0; i < len; ++i ) {\n        ' + prettyCallback + '\n        ' + genishOutputLine + '\n      }\n    }\n    return true\n  }\n}\n    \nregisterProcessor( \'' + name + '\', ' + name + 'Processor)';

    /***** end callback code *****/

    if (debug === true) console.log(workletCode);

    var url = window.URL.createObjectURL(new Blob([workletCode], { type: 'text/javascript' }));

    return [url, workletCode, inputs, cb.params, cb.isStereo];
  },


  registeredForNodeAssignment: [],
  register: function register(ugen) {
    if (this.registeredForNodeAssignment.indexOf(ugen) === -1) {
      this.registeredForNodeAssignment.push(ugen);
    }
  },
  playWorklet: function playWorklet(graph, name) {
    var debug = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var mem = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 44100 * 60;

    utilities.clear();

    var _utilities$createWork = utilities.createWorkletProcessor(graph, name, debug, mem),
        _utilities$createWork2 = _slicedToArray(_utilities$createWork, 5),
        url = _utilities$createWork2[0],
        codeString = _utilities$createWork2[1],
        inputs = _utilities$createWork2[2],
        params = _utilities$createWork2[3],
        isStereo = _utilities$createWork2[4];

    var nodePromise = new Promise(function (resolve, reject) {

      utilities.ctx.audioWorklet.addModule(url).then(function () {
        var workletNode = new AudioWorkletNode(utilities.ctx, name, { outputChannelCount: [isStereo ? 2 : 1] });

        workletNode.callbacks = {};
        workletNode.onmessage = function (event) {
          if (event.data.message === 'return') {
            workletNode.callbacks[event.data.idx](event.data.value);
            delete workletNode.callbacks[event.data.idx];
          }
        };

        workletNode.getMemoryValue = function (idx, cb) {
          this.workletCallbacks[idx] = cb;
          this.workletNode.port.postMessage({ key: 'get', idx: idx });
        };

        workletNode.port.postMessage({ key: 'init', memory: gen.memory.heap });
        utilities.workletNode = workletNode;

        utilities.registeredForNodeAssignment.forEach(function (ugen) {
          return ugen.node = workletNode;
        });
        utilities.registeredForNodeAssignment.length = 0;

        // assign all params as properties of node for easier reference 
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          var _loop = function _loop() {
            var dict = _step7.value;

            var name = Object.keys(dict)[0];
            var param = workletNode.parameters.get(name);

            Object.defineProperty(workletNode, name, {
              set: function set(v) {
                param.value = v;
              },
              get: function get() {
                return param.value;
              }
            });
          };

          for (var _iterator7 = inputs.values()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            _loop();
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          var _loop2 = function _loop2() {
            var ugen = _step8.value;

            var name = ugen.name;
            var param = workletNode.parameters.get(name);
            ugen.waapi = param;
            // initialize?
            param.value = ugen.defaultValue;

            Object.defineProperty(workletNode, name, {
              set: function set(v) {
                param.value = v;
              },
              get: function get() {
                return param.value;
              }
            });
          };

          for (var _iterator8 = params.values()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            _loop2();
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        if (utilities.console) utilities.console.setValue(codeString);

        workletNode.connect(utilities.ctx.destination);

        resolve(workletNode);
      });
    });

    return nodePromise;
  },
  playGraph: function playGraph(graph, debug) {
    var mem = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 44100 * 10;
    var memType = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Float32Array;

    utilities.clear();
    if (debug === undefined) debug = false;

    this.isStereo = Array.isArray(graph);

    utilities.callback = gen.createCallback(graph, mem, debug, false, memType);

    if (utilities.console) utilities.console.setValue(utilities.callback.toString());

    return utilities.callback;
  },
  loadSample: function loadSample(soundFilePath, data) {
    var isLoaded = utilities.buffers[soundFilePath] !== undefined;

    var req = new XMLHttpRequest();
    req.open('GET', soundFilePath, true);
    req.responseType = 'arraybuffer';

    var promise = new Promise(function (resolve, reject) {
      if (!isLoaded) {
        req.onload = function () {
          var audioData = req.response;

          utilities.ctx.decodeAudioData(audioData, function (buffer) {
            data.buffer = buffer.getChannelData(0);
            utilities.buffers[soundFilePath] = data.buffer;
            resolve(data.buffer);
          });
        };
      } else {
        setTimeout(function () {
          return resolve(utilities.buffers[soundFilePath]);
        }, 0);
      }
    });

    if (!isLoaded) req.send();

    return promise;
  }
};

utilities.clear.callbacks = [];

module.exports = utilities;

},{"./data.js":18,"./external/audioworklet-polyfill.js":27,"./gen.js":32}],76:[function(require,module,exports){
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
    var shift = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    var index = shift === 0 ? _index : (_index + Math.floor(shift * length)) % length;
    var n_1_over2 = (length - 1) / 2;

    return 1 - Math.pow((index - n_1_over2) / n_1_over2, 2);
  },
  inversewelch: function inversewelch(length, _index, ignore) {
    var shift = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

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

},{}],77:[function(require,module,exports){
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
  var min = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var max = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

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

},{"./floor.js":29,"./gen.js":32,"./memo.js":44,"./sub.js":69}],78:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],79:[function(require,module,exports){
'use strict';

var MemoryHelper = {
  create: function create() {
    var size = arguments.length <= 0 || arguments[0] === undefined ? 4096 : arguments[0];
    var memtype = arguments.length <= 1 || arguments[1] === undefined ? Float32Array : arguments[1];

    var helper = Object.create(this);

    Object.assign(helper, {
      heap: new memtype(size),
      list: {},
      freeList: {}
    });

    return helper;
  },
  alloc: function alloc(amount) {
    var idx = -1;

    if (amount > this.heap.length) {
      throw Error('Allocation request is larger than heap size of ' + this.heap.length);
    }

    for (var key in this.freeList) {
      var candidateSize = this.freeList[key];

      if (candidateSize >= amount) {
        idx = key;

        this.list[idx] = amount;

        if (candidateSize !== amount) {
          var newIndex = idx + amount,
              newFreeSize = void 0;

          for (var _key in this.list) {
            if (_key > newIndex) {
              newFreeSize = _key - newIndex;
              this.freeList[newIndex] = newFreeSize;
            }
          }
        }
        
        break;
      }
    }
    
    if( idx !== -1 ) delete this.freeList[ idx ]

    if (idx === -1) {
      var keys = Object.keys(this.list),
          lastIndex = void 0;

      if (keys.length) {
        // if not first allocation...
        lastIndex = parseInt(keys[keys.length - 1]);

        idx = lastIndex + this.list[lastIndex];
      } else {
        idx = 0;
      }

      this.list[idx] = amount;
    }

    if (idx + amount >= this.heap.length) {
      throw Error('No available blocks remain sufficient for allocation request.');
    }
    return idx;
  },
  free: function free(index) {
    if (typeof this.list[index] !== 'number') {
      throw Error('Calling free() on non-existing block.');
    }

    this.list[index] = 0;

    var size = 0;
    for (var key in this.list) {
      if (key > index) {
        size = key - index;
        break;
      }
    }

    this.freeList[index] = size;
  }
};

module.exports = MemoryHelper;

},{}]},{},[39])(39)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZC5qcyIsImpzL2FkZC5qcyIsImpzL2Fkc3IuanMiLCJqcy9hbmQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2F0dGFjay5qcyIsImpzL2JhbmcuanMiLCJqcy9ib29sLmpzIiwianMvY2VpbC5qcyIsImpzL2NsYW1wLmpzIiwianMvY29zLmpzIiwianMvY291bnRlci5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RjYmxvY2suanMiLCJqcy9kZWNheS5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9lbnYuanMiLCJqcy9lcS5qcyIsImpzL2V4cC5qcyIsImpzL2V4dGVybmFsL2F1ZGlvd29ya2xldC1wb2x5ZmlsbC5qcyIsImpzL2V4dGVybmFsL3JlYWxtLmpzIiwianMvZmxvb3IuanMiLCJqcy9mb2xkLmpzIiwianMvZ2F0ZS5qcyIsImpzL2dlbi5qcyIsImpzL2d0LmpzIiwianMvZ3RlLmpzIiwianMvZ3RwLmpzIiwianMvaGlzdG9yeS5qcyIsImpzL2lmZWxzZWlmLmpzIiwianMvaW4uanMiLCJqcy9pbmRleC5qcyIsImpzL2x0LmpzIiwianMvbHRlLmpzIiwianMvbHRwLmpzIiwianMvbWF4LmpzIiwianMvbWVtby5qcyIsImpzL21pbi5qcyIsImpzL21peC5qcyIsImpzL21vZC5qcyIsImpzL21zdG9zYW1wcy5qcyIsImpzL210b2YuanMiLCJqcy9tdWwuanMiLCJqcy9uZXEuanMiLCJqcy9ub2lzZS5qcyIsImpzL25vdC5qcyIsImpzL3Bhbi5qcyIsImpzL3BhcmFtLmpzIiwianMvcGVlay5qcyIsImpzL3BoYXNvci5qcyIsImpzL3Bva2UuanMiLCJqcy9wb3cuanMiLCJqcy9wcm9jZXNzLmpzIiwianMvcmF0ZS5qcyIsImpzL3JvdW5kLmpzIiwianMvc2FoLmpzIiwianMvc2VsZWN0b3IuanMiLCJqcy9zZXEuanMiLCJqcy9zaWduLmpzIiwianMvc2luLmpzIiwianMvc2xpZGUuanMiLCJqcy9zdWIuanMiLCJqcy9zd2l0Y2guanMiLCJqcy90NjAuanMiLCJqcy90YW4uanMiLCJqcy90YW5oLmpzIiwianMvdHJhaW4uanMiLCJqcy91dGlsaXRpZXMuanMiLCJqcy93aW5kb3dzLmpzIiwianMvd3JhcC5qcyIsIm5vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL21lbW9yeS1oZWxwZXIvaW5kZXgudHJhbnNwaWxlZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFFBQUssS0FESzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7QUFDQSxRQUFNLE1BQU0sWUFBWSxFQUFaLEdBQWlCLE1BQTdCOztBQUVBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBMUIsRUFBa0MsWUFBWSxVQUFaLEdBQXlCLEtBQUssR0FBaEU7O0FBRUEsWUFBUyxHQUFULGFBQW9CLE9BQU8sQ0FBUCxDQUFwQjtBQUVELEtBTEQsTUFLTztBQUNMLFlBQU0sS0FBSyxHQUFMLENBQVUsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFWLENBQU47QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQXBCUyxDQUFaOztBQXVCQSxPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFWOztBQUVBLE1BQUksTUFBSixHQUFhLENBQUUs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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2FicycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLmFicycgOiBNYXRoLmFicyB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9YWJzKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFicyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFicyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhYnMuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gYWJzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FjY3VtJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5XG5cbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCApXG5cbiAgICAvL2dlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgICBcbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfcmVzZXQsIHZhbHVlUmVmICkge1xuICAgIGxldCBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJ1xuICAgIFxuICAgIC8qIHRocmVlIGRpZmZlcmVudCBtZXRob2RzIG9mIHdyYXBwaW5nLCB0aGlyZCBpcyBtb3N0IGV4cGVuc2l2ZTpcbiAgICAgKlxuICAgICAqIDE6IHJhbmdlIHswLDF9OiB5ID0geCAtICh4IHwgMClcbiAgICAgKiAyOiBsb2cyKHRoaXMubWF4KSA9PSBpbnRlZ2VyOiB5ID0geCAmICh0aGlzLm1heCAtIDEpXG4gICAgICogMzogYWxsIG90aGVyczogaWYoIHggPj0gdGhpcy5tYXggKSB5ID0gdGhpcy5tYXggLXhcbiAgICAgKlxuICAgICAqL1xuXG4gICAgLy8gbXVzdCBjaGVjayBmb3IgcmVzZXQgYmVmb3JlIHN0b3JpbmcgdmFsdWUgZm9yIG91dHB1dFxuICAgIGlmKCAhKHR5cGVvZiB0aGlzLmlucHV0c1sxXSA9PT0gJ251bWJlcicgJiYgdGhpcy5pbnB1dHNbMV0gPCAxKSApIHsgXG4gICAgICBpZiggdGhpcy5yZXNldFZhbHVlICE9PSB0aGlzLm1pbiApIHtcblxuICAgICAgICBvdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5yZXNldFZhbHVlfVxcblxcbmBcbiAgICAgICAgLy9vdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5taW59XFxuXFxuYFxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLm1pbn1cXG5cXG5gXG4gICAgICAgIC8vb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMuaW5pdGlhbFZhbHVlfVxcblxcbmBcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvdXQgKz0gYCAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dmFsdWVSZWZ9XFxuYFxuICAgIFxuICAgIGlmKCB0aGlzLnNob3VsZFdyYXAgPT09IGZhbHNlICYmIHRoaXMuc2hvdWxkQ2xhbXAgPT09IHRydWUgKSB7XG4gICAgICBvdXQgKz0gYCAgaWYoICR7dmFsdWVSZWZ9IDwgJHt0aGlzLm1heCB9ICkgJHt2YWx1ZVJlZn0gKz0gJHtfaW5jcn1cXG5gXG4gICAgfWVsc2V7XG4gICAgICBvdXQgKz0gYCAgJHt2YWx1ZVJlZn0gKz0gJHtfaW5jcn1cXG5gIC8vIHN0b3JlIG91dHB1dCB2YWx1ZSBiZWZvcmUgYWNjdW11bGF0aW5nICBcbiAgICB9XG5cbiAgICBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICAmJiB0aGlzLnNob3VsZFdyYXBNYXggKSB3cmFwICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5gXG4gICAgaWYoIHRoaXMubWluICE9PSAtSW5maW5pdHkgJiYgdGhpcy5zaG91bGRXcmFwTWluICkgd3JhcCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPCAke3RoaXMubWlufSApICR7dmFsdWVSZWZ9ICs9ICR7ZGlmZn1cXG5gXG5cbiAgICAvL2lmKCB0aGlzLm1pbiA9PT0gMCAmJiB0aGlzLm1heCA9PT0gMSApIHsgXG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAtICgke3ZhbHVlUmVmfSB8IDApXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1pbiA9PT0gMCAmJiAoIE1hdGgubG9nMiggdGhpcy5tYXggKSB8IDAgKSA9PT0gTWF0aC5sb2cyKCB0aGlzLm1heCApICkge1xuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gJiAoJHt0aGlzLm1heH0gLSAxKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICl7XG4gICAgLy8gIHdyYXAgPSBgICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gKSAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XFxuXFxuYFxuICAgIC8vfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcCArICdcXG4nXG5cbiAgICByZXR1cm4gb3V0XG4gIH0sXG5cbiAgZGVmYXVsdHMgOiB7IG1pbjowLCBtYXg6MSwgcmVzZXRWYWx1ZTowLCBpbml0aWFsVmFsdWU6MCwgc2hvdWxkV3JhcDp0cnVlLCBzaG91bGRXcmFwTWF4OiB0cnVlLCBzaG91bGRXcmFwTWluOnRydWUsIHNob3VsZENsYW1wOmZhbHNlIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluY3IsIHJlc2V0PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGNvbnN0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gICAgICBcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgXG4gICAgeyBcbiAgICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgICAgaW5wdXRzOiBbIGluY3IsIHJlc2V0IF0sXG4gICAgICBtZW1vcnk6IHtcbiAgICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHByb3RvLmRlZmF1bHRzLFxuICAgIHByb3BlcnRpZXMgXG4gIClcblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuc2hvdWxkV3JhcE1heCA9PT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuc2hvdWxkV3JhcE1pbiA9PT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBwcm9wZXJ0aWVzLnNob3VsZFdyYXAgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHVnZW4uc2hvdWxkV3JhcE1pbiA9IHVnZW4uc2hvdWxkV3JhcE1heCA9IHByb3BlcnRpZXMuc2hvdWxkV3JhcFxuICAgIH1cbiAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5yZXNldFZhbHVlID09PSB1bmRlZmluZWQgKSB7XG4gICAgdWdlbi5yZXNldFZhbHVlID0gdWdlbi5taW5cbiAgfVxuXG4gIGlmKCB1Z2VuLmluaXRpYWxWYWx1ZSA9PT0gdW5kZWZpbmVkICkgdWdlbi5pbml0aWFsVmFsdWUgPSB1Z2VuLm1pblxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpICB7IFxuICAgICAgLy9jb25zb2xlLmxvZyggJ2dlbjonLCBnZW4sIGdlbi5tZW1vcnkgKVxuICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gXG4gICAgfSxcbiAgICBzZXQodikgeyBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiB9XG4gIH0pXG5cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY29zJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG5cbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0ID8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Fjb3MnOiBpc1dvcmtsZXQgPyAnTWF0aC5hY29zJyA6TWF0aC5hY29zIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1hY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hY29zKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYWNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhY29zLmlucHV0cyA9IFsgeCBdXG4gIGFjb3MuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWNvcy5uYW1lID0gYCR7YWNvcy5iYXNlbmFtZX17YWNvcy5pZH1gXG5cbiAgcmV0dXJuIGFjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbXVsICAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgZGl2ICAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgZGF0YSAgICAgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgICAgID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBhY2N1bSAgICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGlmZWxzZSAgID0gcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gICAgbHQgICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBiYW5nICAgICA9IHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gICAgZW52ICAgICAgPSByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gICAgYWRkICAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgcG9rZSAgICAgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICAgIG5lcSAgICAgID0gcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICAgIGFuZCAgICAgID0gcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICAgIGd0ZSAgICAgID0gcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICAgIG1lbW8gICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgICB1dGlsaXRpZXM9IHJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZSA9IDQ0MTAwLCBkZWNheVRpbWUgPSA0NDEwMCwgX3Byb3BzICkgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgc2hhcGU6J2V4cG9uZW50aWFsJywgYWxwaGE6NSwgdHJpZ2dlcjpudWxsIH0sIF9wcm9wcyApXG4gIGNvbnN0IF9iYW5nID0gcHJvcHMudHJpZ2dlciAhPT0gbnVsbCA/IHByb3BzLnRyaWdnZXIgOiBiYW5nKCksXG4gICAgICAgIHBoYXNlID0gYWNjdW0oIDEsIF9iYW5nLCB7IG1pbjowLCBtYXg6IEluZmluaXR5LCBpbml0aWFsVmFsdWU6LUluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlIH0pXG4gICAgICBcbiAgbGV0IGJ1ZmZlckRhdGEsIGJ1ZmZlckRhdGFSZXZlcnNlLCBkZWNheURhdGEsIG91dCwgYnVmZmVyXG5cbiAgLy9jb25zb2xlLmxvZyggJ3NoYXBlOicsIHByb3BzLnNoYXBlLCAnYXR0YWNrIHRpbWU6JywgYXR0YWNrVGltZSwgJ2RlY2F5IHRpbWU6JywgZGVjYXlUaW1lIClcbiAgbGV0IGNvbXBsZXRlRmxhZyA9IGRhdGEoIFswXSApXG4gIFxuICAvLyBzbGlnaHRseSBtb3JlIGVmZmljaWVudCB0byB1c2UgZXhpc3RpbmcgcGhhc2UgYWNjdW11bGF0b3IgZm9yIGxpbmVhciBlbnZlbG9wZXNcbiAgaWYoIHByb3BzLnNoYXBlID09PSAnbGluZWFyJyApIHtcbiAgICBvdXQgPSBpZmVsc2UoIFxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgbHQoIHBoYXNlLCBhdHRhY2tUaW1lICkpLFxuICAgICAgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLFxuXG4gICAgICBhbmQoIGd0ZSggcGhhc2UsIDApLCAgbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSApICkgKSxcbiAgICAgIHN1YiggMSwgZGl2KCBzdWIoIHBoYXNlLCBhdHRhY2tUaW1lICksIGRlY2F5VGltZSApICksXG4gICAgICBcbiAgICAgIG5lcSggcGhhc2UsIC1JbmZpbml0eSksXG4gICAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAgIDAgXG4gICAgKVxuICB9IGVsc2Uge1xuICAgIGJ1ZmZlckRhdGEgPSBlbnYoeyBsZW5ndGg6MTAyNCwgdHlwZTpwcm9wcy5zaGFwZSwgYWxwaGE6cHJvcHMuYWxwaGEgfSlcbiAgICBidWZmZXJEYXRhUmV2ZXJzZSA9IGVudih7IGxlbmd0aDoxMDI0LCB0eXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSwgcmV2ZXJzZTp0cnVlIH0pXG5cbiAgICBvdXQgPSBpZmVsc2UoIFxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgbHQoIHBoYXNlLCBhdHRhY2tUaW1lICkgKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgICAgYW5kKCBndGUocGhhc2UsMCksIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YVJldmVyc2UsIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSApLCBkZWNheVRpbWUgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgICAgbmVxKCBwaGFzZSwgLUluZmluaXR5ICksXG4gICAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAgIDBcbiAgICApXG4gIH1cblxuICBjb25zdCB1c2luZ1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgKSB7XG4gICAgb3V0Lm5vZGUgPSBudWxsXG4gICAgdXRpbGl0aWVzLnJlZ2lzdGVyKCBvdXQgKVxuICB9XG5cbiAgLy8gbmVlZGVkIGZvciBnaWJiZXJpc2guLi4gZ2V0dGluZyB0aGlzIHRvIHdvcmsgcmlnaHQgd2l0aCB3b3JrbGV0c1xuICAvLyB2aWEgcHJvbWlzZXMgd2lsbCBwcm9iYWJseSBiZSB0cmlja3lcbiAgb3V0LmlzQ29tcGxldGUgPSAoKT0+IHtcbiAgICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICYmIG91dC5ub2RlICE9PSBudWxsICkge1xuICAgICAgY29uc3QgcCA9IG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgb3V0Lm5vZGUuZ2V0TWVtb3J5VmFsdWUoIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCwgcmVzb2x2ZSApXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gcFxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF1cbiAgICB9XG4gIH1cblxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgJiYgb3V0Lm5vZGUgIT09IG51bGwgKSB7XG4gICAgICBvdXQubm9kZS5wb3J0LnBvc3RNZXNzYWdlKHsga2V5OidzZXQnLCBpZHg6Y29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4LCB2YWx1ZTowIH0pXG4gICAgfWVsc2V7XG4gICAgICBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdID0gMFxuICAgIH1cbiAgICBfYmFuZy50cmlnZ2VyKClcbiAgfVxuXG4gIHJldHVybiBvdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHsgXG4gIGJhc2VuYW1lOidhZGQnLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PScnLFxuICAgICAgICBzdW0gPSAwLCBudW1Db3VudCA9IDAsIGFkZGVyQXRFbmQgPSBmYWxzZSwgYWxyZWFkeUZ1bGxTdW1tZWQgPSB0cnVlXG5cbiAgICBpZiggaW5wdXRzLmxlbmd0aCA9PT0gMCApIHJldHVybiAwXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYFxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICBvdXQgKz0gdlxuICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgYWRkZXJBdEVuZCA9IHRydWVcbiAgICAgICAgICBvdXQgKz0gJyArICdcbiAgICAgICAgfVxuICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3VtICs9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICBudW1Db3VudCsrXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICBvdXQgKz0gYWRkZXJBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKyAnICsgc3VtXG4gICAgfVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgY29uc3QgYWRkID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBhZGQuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWRkLm5hbWUgPSBhZGQuYmFzZW5hbWUgKyBhZGQuaWRcbiAgYWRkLmlucHV0cyA9IGFyZ3NcblxuICByZXR1cm4gYWRkXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIG11bCAgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGRpdiAgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIGRhdGEgICAgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrICAgICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgYWNjdW0gICAgPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBpZmVsc2UgICA9IHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICAgIGx0ICAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYmFuZyAgICAgPSByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICAgIGVudiAgICAgID0gcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICAgIHBhcmFtICAgID0gcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gICAgYWRkICAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgZ3RwICAgICAgPSByZXF1aXJlKCAnLi9ndHAuanMnICksXG4gICAgbm90ICAgICAgPSByZXF1aXJlKCAnLi9ub3QuanMnICksXG4gICAgYW5kICAgICAgPSByZXF1aXJlKCAnLi9hbmQuanMnICksXG4gICAgbmVxICAgICAgPSByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gICAgcG9rZSAgICAgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBhdHRhY2tUaW1lPTQ0LCBkZWNheVRpbWU9MjIwNTAsIHN1c3RhaW5UaW1lPTQ0MTAwLCBzdXN0YWluTGV2ZWw9LjYsIHJlbGVhc2VUaW1lPTQ0MTAwLCBfcHJvcHMgKSA9PiB7XG4gIGxldCBlbnZUcmlnZ2VyID0gYmFuZygpLFxuICAgICAgcGhhc2UgPSBhY2N1bSggMSwgZW52VHJpZ2dlciwgeyBtYXg6IEluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlLCBpbml0aWFsVmFsdWU6SW5maW5pdHkgfSksXG4gICAgICBzaG91bGRTdXN0YWluID0gcGFyYW0oIDEgKSxcbiAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgc2hhcGU6ICdleHBvbmVudGlhbCcsXG4gICAgICAgICBhbHBoYTogNSxcbiAgICAgICAgIHRyaWdnZXJSZWxlYXNlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBfcHJvcHMgKSxcbiAgICAgIGJ1ZmZlckRhdGEsIGRlY2F5RGF0YSwgb3V0LCBidWZmZXIsIHN1c3RhaW5Db25kaXRpb24sIHJlbGVhc2VBY2N1bSwgcmVsZWFzZUNvbmRpdGlvblxuXG5cbiAgY29uc3QgY29tcGxldGVGbGFnID0gZGF0YSggWzBdIClcblxuICBidWZmZXJEYXRhID0gZW52KHsgbGVuZ3RoOjEwMjQsIGFscGhhOnByb3BzLmFscGhhLCBzaGlmdDowLCB0eXBlOnByb3BzLnNoYXBlIH0pXG5cbiAgc3VzdGFpbkNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlIFxuICAgID8gc2hvdWxkU3VzdGFpblxuICAgIDogbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUgKSApXG5cbiAgcmVsZWFzZUFjY3VtID0gcHJvcHMudHJpZ2dlclJlbGVhc2VcbiAgICA/IGd0cCggc3ViKCBzdXN0YWluTGV2ZWwsIGFjY3VtKCBkaXYoIHN1c3RhaW5MZXZlbCwgcmVsZWFzZVRpbWUgKSAsIDAsIHsgc2hvdWxkV3JhcDpmYWxzZSB9KSApLCAwIClcbiAgICA6IHN1Yiggc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lICkgKSwgcmVsZWFzZVRpbWUgKSwgc3VzdGFpbkxldmVsICkgKSwgXG5cbiAgcmVsZWFzZUNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgPyBub3QoIHNob3VsZFN1c3RhaW4gKVxuICAgIDogbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUsIHJlbGVhc2VUaW1lICkgKVxuXG4gIG91dCA9IGlmZWxzZShcbiAgICAvLyBhdHRhY2sgXG4gICAgbHQoIHBoYXNlLCAgYXR0YWNrVGltZSApLCBcbiAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgIC8vIGRlY2F5XG4gICAgbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSApICksIFxuICAgIHBlZWsoIGJ1ZmZlckRhdGEsIHN1YiggMSwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICksICBkZWNheVRpbWUgKSwgc3ViKCAxLCAgc3VzdGFpbkxldmVsICkgKSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pLFxuXG4gICAgLy8gc3VzdGFpblxuICAgIGFuZCggc3VzdGFpbkNvbmRpdGlvbiwgbmVxKCBwaGFzZSwgSW5maW5pdHkgKSApLFxuICAgIHBlZWsoIGJ1ZmZlckRhdGEsICBzdXN0YWluTGV2ZWwgKSxcblxuICAgIC8vIHJlbGVhc2VcbiAgICByZWxlYXNlQ29uZGl0aW9uLCAvL2x0KCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lICsgIHJlbGVhc2VUaW1lICksXG4gICAgcGVlayggXG4gICAgICBidWZmZXJEYXRhLFxuICAgICAgcmVsZWFzZUFjY3VtLCBcbiAgICAgIC8vc3ViKCAgc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lKSwgIHJlbGVhc2VUaW1lICksICBzdXN0YWluTGV2ZWwgKSApLCBcbiAgICAgIHsgYm91bmRtb2RlOidjbGFtcCcgfVxuICAgICksXG5cbiAgICBuZXEoIHBoYXNlLCBJbmZpbml0eSApLFxuICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgIDBcbiAgKVxuICAgXG4gIGNvbnN0IHVzaW5nV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSApIHtcbiAgICBvdXQubm9kZSA9IG51bGxcbiAgICB1dGlsaXRpZXMucmVnaXN0ZXIoIG91dCApXG4gIH1cblxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAxXG4gICAgZW52VHJpZ2dlci50cmlnZ2VyKClcbiAgfVxuIFxuICAvLyBuZWVkZWQgZm9yIGdpYmJlcmlzaC4uLiBnZXR0aW5nIHRoaXMgdG8gd29yayByaWdodCB3aXRoIHdvcmtsZXRzXG4gIC8vIHZpYSBwcm9taXNlcyB3aWxsIHByb2JhYmx5IGJlIHRyaWNreVxuICBvdXQuaXNDb21wbGV0ZSA9ICgpPT4ge1xuICAgIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgJiYgb3V0Lm5vZGUgIT09IG51bGwgKSB7XG4gICAgICBjb25zdCBwID0gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICBvdXQubm9kZS5nZXRNZW1vcnlWYWx1ZSggY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4LCByZXNvbHZlIClcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBwXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHggXVxuICAgIH1cbiAgfVxuXG5cbiAgb3V0LnJlbGVhc2UgPSAoKT0+IHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMFxuICAgIC8vIFhYWCBwcmV0dHkgbmFzdHkuLi4gZ3JhYnMgYWNjdW0gaW5zaWRlIG9mIGd0cCBhbmQgcmVzZXRzIHZhbHVlIG1hbnVhbGx5XG4gICAgLy8gdW5mb3J0dW5hdGVseSBlbnZUcmlnZ2VyIHdvbid0IHdvcmsgYXMgaXQncyBiYWNrIHRvIDAgYnkgdGhlIHRpbWUgdGhlIHJlbGVhc2UgYmxvY2sgaXMgdHJpZ2dlcmVkLi4uXG4gICAgaWYoIHVzaW5nV29ya2xldCAmJiBvdXQubm9kZSAhPT0gbnVsbCApIHtcbiAgICAgIG91dC5ub2RlLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3NldCcsIGlkeDpyZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4LCB2YWx1ZTowIH0pXG4gICAgfWVsc2V7XG4gICAgICBnZW4ubWVtb3J5LmhlYXBbIHJlbGVhc2VBY2N1bS5pbnB1dHNbMF0uaW5wdXRzWzFdLm1lbW9yeS52YWx1ZS5pZHggXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gMCAmJiAke2lucHV0c1sxXX0gIT09IDApIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXNpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQgPyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYXNpbic6IGlzV29ya2xldCA/ICdNYXRoLnNpbicgOiBNYXRoLmFzaW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWFzaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFzaW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFzaW4uaW5wdXRzID0gWyB4IF1cbiAgYXNpbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhc2luLm5hbWUgPSBgJHthc2luLmJhc2VuYW1lfXthc2luLmlkfWBcblxuICByZXR1cm4gYXNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhdGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhdGFuJzogaXNXb3JrbGV0ID8gJ01hdGguYXRhbicgOiBNYXRoLmF0YW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWF0YW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmF0YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGF0YW4uaW5wdXRzID0gWyB4IF1cbiAgYXRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhdGFuLm5hbWUgPSBgJHthdGFuLmJhc2VuYW1lfXthdGFuLmlkfWBcblxuICByZXR1cm4gYXRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGVjYXlUaW1lID0gNDQxMDAgKSA9PiB7XG4gIGxldCBzc2QgPSBoaXN0b3J5ICggMSApLFxuICAgICAgdDYwID0gTWF0aC5leHAoIC02LjkwNzc1NTI3ODkyMSAvIGRlY2F5VGltZSApXG5cbiAgc3NkLmluKCBtdWwoIHNzZC5vdXQsIHQ2MCApIClcblxuICBzc2Qub3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBzc2QudmFsdWUgPSAxXG4gIH1cblxuICByZXR1cm4gc3ViKCAxLCBzc2Qub3V0IClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGxldCBvdXQgPSBcbmAgIHZhciAke3RoaXMubmFtZX0gPSBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XVxuICBpZiggJHt0aGlzLm5hbWV9ID09PSAxICkgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV0gPSAwICAgICAgXG4gICAgICBcbmBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIF9wcm9wcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowLCBtYXg6MSB9LCBfcHJvcHMgKVxuXG4gIHVnZW4ubmFtZSA9ICdiYW5nJyArIGdlbi5nZXRVSUQoKVxuXG4gIHVnZW4ubWluID0gcHJvcHMubWluXG4gIHVnZW4ubWF4ID0gcHJvcHMubWF4XG5cbiAgY29uc3QgdXNpbmdXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICkge1xuICAgIHVnZW4ubm9kZSA9IG51bGxcbiAgICB1dGlsaXRpZXMucmVnaXN0ZXIoIHVnZW4gKVxuICB9XG5cbiAgdWdlbi50cmlnZ2VyID0gKCkgPT4ge1xuICAgIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgJiYgdWdlbi5ub2RlICE9PSBudWxsICkge1xuICAgICAgdWdlbi5ub2RlLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3NldCcsIGlkeDp1Z2VuLm1lbW9yeS52YWx1ZS5pZHgsIHZhbHVlOnVnZW4ubWF4IH0pXG4gICAgfWVsc2V7XG4gICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gdWdlbi5tYXggXG4gICAgfVxuICB9XG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidib29sJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgJHtpbnB1dHNbMF19ID09PSAwID8gMCA6IDFgXG4gICAgXG4gICAgLy9nZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgLy9yZXR1cm4gWyBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YCwgJyAnICtvdXQgXVxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonY2VpbCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLmNlaWwnIDogTWF0aC5jZWlsIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1jZWlsKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNlaWwoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjZWlsID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGNlaWwuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gY2VpbFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vcj0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiAgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjbGlwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0XG5cbiAgICBvdXQgPVxuXG5gIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cbiAgaWYoICR7dGhpcy5uYW1lfSA+ICR7aW5wdXRzWzJdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzJdfVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPCAke2lucHV0c1sxXX0gKSAke3RoaXMubmFtZX0gPSAke2lucHV0c1sxXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPS0xLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xLCBtaW4sIG1heCBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQgPyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnY29zJzogaXNXb3JrbGV0ID8gJ01hdGguY29zJyA6IE1hdGguY29zIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1jb3MoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBjb3MuaW5wdXRzID0gWyB4IF1cbiAgY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGNvcy5uYW1lID0gYCR7Y29zLmJhc2VuYW1lfXtjb3MuaWR9YFxuXG4gIHJldHVybiBjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY291bnRlcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keVxuICAgICAgIFxuICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB0aGlzLmluaXRpYWxWYWx1ZVxuICAgIFxuICAgIGZ1bmN0aW9uQm9keSAgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgaW5wdXRzWzJdLCBpbnB1dHNbM10sIGlucHV0c1s0XSwgIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAsIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS53cmFwLmlkeH1dYCAgKVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgIFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy53cmFwLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkgdGhpcy53cmFwLmdlbigpXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfbWluLCBfbWF4LCBfcmVzZXQsIGxvb3BzLCB2YWx1ZVJlZiwgd3JhcFJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzNdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1szXSA8IDEpICkgeyBcbiAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49IDEgKSAke3ZhbHVlUmVmfSA9ICR7X21pbn1cXG5gXG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfTtcXG4gICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgXG4gICAgaWYoIHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHR5cGVvZiB0aGlzLm1pbiAhPT0gJ251bWJlcicgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdGhpcy5taW4gIT09IEluZmluaXR5ICkge1xuICAgICAgd3JhcCA9IFxuYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7X21heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7X21heH0gLSAke19taW59XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2UgaWYoICR7dmFsdWVSZWZ9IDwgJHtfbWlufSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gKz0gJHtfbWF4fSAtICR7X21pbn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNle1xuICAgICAgb3V0ICs9ICdcXG4nXG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyPTEsIG1pbj0wLCBtYXg9SW5maW5pdHksIHJlc2V0PTAsIGxvb3BzPTEsICBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IE9iamVjdC5hc3NpZ24oIHsgaW5pdGlhbFZhbHVlOiAwLCBzaG91bGRXcmFwOnRydWUgfSwgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW46ICAgIG1pbiwgXG4gICAgbWF4OiAgICBtYXgsXG4gICAgaW5pdGlhbFZhbHVlOiBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdmFsdWU6ICBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIG1pbiwgbWF4LCByZXNldCwgbG9vcHMgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSxcbiAgICAgIHdyYXA6ICB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSBcbiAgICB9LFxuICAgIHdyYXAgOiB7XG4gICAgICBnZW4oKSB7IFxuICAgICAgICBpZiggdWdlbi5tZW1vcnkud3JhcC5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgfVxuICAgICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWBcbiAgICAgICAgcmV0dXJuIGBtZW1vcnlbICR7dWdlbi5tZW1vcnkud3JhcC5pZHh9IF1gIFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuICBcbiAgdWdlbi53cmFwLmlucHV0cyA9IFsgdWdlbiBdXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG4gIHVnZW4ud3JhcC5uYW1lID0gdWdlbi5uYW1lICsgJ193cmFwJ1xuICByZXR1cm4gdWdlblxufSBcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bT0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgcGhhc29yPXJlcXVpcmUoICcuL3BoYXNvci5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2N5Y2xlJyxcblxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICAgIGZvciggbGV0IGkgPSAwLCBsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gTWF0aC5zaW4oICggaSAvIGwgKSAqICggTWF0aC5QSSAqIDIgKSApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMuY3ljbGUgPSBkYXRhKCBidWZmZXIsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSApXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAsIF9wcm9wcyApID0+IHtcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy5jeWNsZSA9PT0gJ3VuZGVmaW5lZCcgKSBwcm90by5pbml0VGFibGUoKSBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowIH0sIF9wcm9wcyApXG5cbiAgY29uc3QgdWdlbiA9IHBlZWsoIGdlbi5nbG9iYWxzLmN5Y2xlLCBwaGFzb3IoIGZyZXF1ZW5jeSwgcmVzZXQsIHByb3BzICkpXG4gIHVnZW4ubmFtZSA9ICdjeWNsZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgICAgdXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApLFxuICAgICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICAgICAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGF0YScsXG4gIGdsb2JhbHM6IHt9LFxuICBtZW1vOnt9LFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaWR4XG4gICAgLy9jb25zb2xlLmxvZyggJ2RhdGEgbmFtZTonLCB0aGlzLm5hbWUsIHByb3RvLm1lbW8gKVxuICAgIC8vZGVidWdnZXJcbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBsZXQgdWdlbiA9IHRoaXNcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUgKSBcbiAgICAgIGlkeCA9IHRoaXMubWVtb3J5LnZhbHVlcy5pZHhcbiAgICAgIGlmKCB0aGlzLmJ1ZmZlciAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcC5zZXQoIHRoaXMuYnVmZmVyLCBpZHggKVxuICAgICAgICB9Y2F0Y2goIGUgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coIGUgKVxuICAgICAgICAgIHRocm93IEVycm9yKCAnZXJyb3Igd2l0aCByZXF1ZXN0LiBhc2tpbmcgZm9yICcgKyB0aGlzLmJ1ZmZlci5sZW5ndGggKycuIGN1cnJlbnQgaW5kZXg6ICcgKyBnZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBnZW4ubWVtb3J5LmhlYXAubGVuZ3RoIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSB0aGlzXG4gICAgICAvL3JldHVybiAnZ2VuLm1lbW9yeScgKyB0aGlzLm5hbWUgKyAnLmJ1ZmZlcidcbiAgICAgIGlmKCB0aGlzLm5hbWUuaW5kZXhPZignZGF0YScpID09PSAtMSApIHtcbiAgICAgICAgcHJvdG8ubWVtb1sgdGhpcy5uYW1lIF0gPSBpZHhcbiAgICAgIH1lbHNle1xuICAgICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpZHhcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIC8vY29uc29sZS5sb2coICd1c2luZyBnZW4gZGF0YSBtZW1vJywgcHJvdG8ubWVtb1sgdGhpcy5uYW1lIF0gKVxuICAgICAgaWR4ID0gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gICAgfVxuICAgIHJldHVybiBpZHhcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHk9MSwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4sIGJ1ZmZlciwgc2hvdWxkTG9hZCA9IGZhbHNlXG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdICkge1xuICAgICAgcmV0dXJuIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdXG4gICAgfVxuICB9XG5cbiAgaWYoIHR5cGVvZiB4ID09PSAnbnVtYmVyJyApIHtcbiAgICBpZiggeSAhPT0gMSApIHtcbiAgICAgIGJ1ZmZlciA9IFtdXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHk7IGkrKyApIHtcbiAgICAgICAgYnVmZmVyWyBpIF0gPSBuZXcgRmxvYXQzMkFycmF5KCB4IClcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHggKVxuICAgIH1cbiAgfWVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIHggKSApIHsgLy8hICh4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkgKSB7XG4gICAgbGV0IHNpemUgPSB4Lmxlbmd0aFxuICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHNpemUgKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0geFsgaSBdXG4gICAgfVxuICB9ZWxzZSBpZiggdHlwZW9mIHggPT09ICdzdHJpbmcnICkge1xuICAgIC8vYnVmZmVyID0geyBsZW5ndGg6IHkgPiAxID8geSA6IGdlbi5zYW1wbGVyYXRlICogNjAgfSAvLyBYWFggd2hhdD8/P1xuICAgIC8vaWYoIHByb3RvLm1lbW9bIHggXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgYnVmZmVyID0geyBsZW5ndGg6IHkgPiAxID8geSA6IDEgfSAvLyBYWFggd2hhdD8/P1xuICAgICAgc2hvdWxkTG9hZCA9IHRydWVcbiAgICAvL31lbHNle1xuICAgICAgLy9idWZmZXIgPSBwcm90by5tZW1vWyB4IF1cbiAgICAvL31cbiAgfWVsc2UgaWYoIHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSB7XG4gICAgYnVmZmVyID0geFxuICB9XG4gIFxuICB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSBcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBcbiAgeyBcbiAgICBidWZmZXIsXG4gICAgbmFtZTogcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKCksXG4gICAgZGltOiAgYnVmZmVyICE9PSB1bmRlZmluZWQgPyBidWZmZXIubGVuZ3RoIDogMSwgLy8gWFhYIGhvdyBkbyB3ZSBkeW5hbWljYWxseSBhbGxvY2F0ZSB0aGlzP1xuICAgIGNoYW5uZWxzIDogMSxcbiAgICBvbmxvYWQ6IG51bGwsXG4gICAgLy90aGVuKCBmbmMgKSB7XG4gICAgLy8gIHVnZW4ub25sb2FkID0gZm5jXG4gICAgLy8gIHJldHVybiB1Z2VuXG4gICAgLy99LFxuICAgIGltbXV0YWJsZTogcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuaW1tdXRhYmxlID09PSB0cnVlID8gdHJ1ZSA6IGZhbHNlLFxuICAgIGxvYWQoIGZpbGVuYW1lLCBfX3Jlc29sdmUgKSB7XG4gICAgICBsZXQgcHJvbWlzZSA9IHV0aWxpdGllcy5sb2FkU2FtcGxlKCBmaWxlbmFtZSwgdWdlbiApXG4gICAgICBwcm9taXNlLnRoZW4oIF9idWZmZXIgPT4geyBcbiAgICAgICAgcHJvdG8ubWVtb1sgeCBdID0gX2J1ZmZlclxuICAgICAgICB1Z2VuLm5hbWUgPSBmaWxlbmFtZVxuICAgICAgICB1Z2VuLm1lbW9yeS52YWx1ZXMubGVuZ3RoID0gdWdlbi5kaW0gPSBfYnVmZmVyLmxlbmd0aFxuXG4gICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSwgdWdlbi5pbW11dGFibGUgKSBcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwLnNldCggX2J1ZmZlciwgdWdlbi5tZW1vcnkudmFsdWVzLmlkeCApXG4gICAgICAgIGlmKCB0eXBlb2YgdWdlbi5vbmxvYWQgPT09ICdmdW5jdGlvbicgKSB1Z2VuLm9ubG9hZCggX2J1ZmZlciApIFxuICAgICAgICBfX3Jlc29sdmUoIHVnZW4gKVxuICAgICAgfSlcbiAgICB9LFxuICAgIG1lbW9yeSA6IHtcbiAgICAgIHZhbHVlczogeyBsZW5ndGg6YnVmZmVyICE9PSB1bmRlZmluZWQgPyBidWZmZXIubGVuZ3RoIDogMSwgaWR4Om51bGwgfVxuICAgIH1cbiAgfSxcbiAgcHJvcGVydGllc1xuICApXG5cbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXSA9IHVnZW5cbiAgICB9XG4gICAgaWYoIHByb3BlcnRpZXMubWV0YSA9PT0gdHJ1ZSApIHtcbiAgICAgIGZvciggbGV0IGkgPSAwLCBsZW5ndGggPSB1Z2VuLmJ1ZmZlci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBpLCB7XG4gICAgICAgICAgZ2V0ICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwZWVrKCB1Z2VuLCBpLCB7IG1vZGU6J3NpbXBsZScsIGludGVycDonbm9uZScgfSApXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgICByZXR1cm4gcG9rZSggdWdlbiwgdiwgaSApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxldCByZXR1cm5WYWx1ZVxuICBpZiggc2hvdWxkTG9hZCA9PT0gdHJ1ZSApIHtcbiAgICByZXR1cm5WYWx1ZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSxyZWplY3QpID0+IHtcbiAgICAgIC8vdWdlbi5sb2FkKCB4LCByZXNvbHZlIClcbiAgICAgIGxldCBwcm9taXNlID0gdXRpbGl0aWVzLmxvYWRTYW1wbGUoIHgsIHVnZW4gKVxuICAgICAgcHJvbWlzZS50aGVuKCBfYnVmZmVyID0+IHsgXG4gICAgICAgIHByb3RvLm1lbW9bIHggXSA9IF9idWZmZXJcbiAgICAgICAgdWdlbi5tZW1vcnkudmFsdWVzLmxlbmd0aCA9IHVnZW4uZGltID0gX2J1ZmZlci5sZW5ndGhcblxuICAgICAgICB1Z2VuLmJ1ZmZlciA9IF9idWZmZXJcbiAgICAgICAgZ2VuLm9uKCAnbWVtb3J5IGluaXQnLCAoKT0+IHtcbiAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnksIHVnZW4uaW1tdXRhYmxlICkgXG4gICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwLnNldCggX2J1ZmZlciwgdWdlbi5tZW1vcnkudmFsdWVzLmlkeCApXG4gICAgICAgICAgaWYoIHR5cGVvZiB1Z2VuLm9ubG9hZCA9PT0gJ2Z1bmN0aW9uJyApIHVnZW4ub25sb2FkKCBfYnVmZmVyICkgXG4gICAgICAgIH0pXG4gICAgICAgIHJlc29sdmUoIHVnZW4gKVxuICAgICAgfSkgICAgIFxuICAgIH0pXG4gIH1lbHNlIGlmKCBwcm90by5tZW1vWyB4IF0gIT09IHVuZGVmaW5lZCApIHtcbiAgICBnZW4ub24oICdtZW1vcnkgaW5pdCcsICgpPT4ge1xuICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5LCB1Z2VuLmltbXV0YWJsZSApIFxuICAgICAgZ2VuLm1lbW9yeS5oZWFwLnNldCggdWdlbi5idWZmZXIsIHVnZW4ubWVtb3J5LnZhbHVlcy5pZHggKVxuICAgICAgaWYoIHR5cGVvZiB1Z2VuLm9ubG9hZCA9PT0gJ2Z1bmN0aW9uJyApIHVnZW4ub25sb2FkKCB1Z2VuLmJ1ZmZlciApIFxuXG4gICAgfSlcbiAgICByZXR1cm5WYWx1ZSA9IHVnZW5cbiAgfWVsc2V7XG4gICAgcmV0dXJuVmFsdWUgPSB1Z2VuXG4gIH1cblxuICByZXR1cm4gcmV0dXJuVmFsdWUgXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgeDEgPSBoaXN0b3J5KCksXG4gICAgICB5MSA9IGhpc3RvcnkoKSxcbiAgICAgIGZpbHRlclxuXG4gIC8vSGlzdG9yeSB4MSwgeTE7IHkgPSBpbjEgLSB4MSArIHkxKjAuOTk5NzsgeDEgPSBpbjE7IHkxID0geTsgb3V0MSA9IHk7XG4gIGZpbHRlciA9IG1lbW8oIGFkZCggc3ViKCBpbjEsIHgxLm91dCApLCBtdWwoIHkxLm91dCwgLjk5OTcgKSApIClcbiAgeDEuaW4oIGluMSApXG4gIHkxLmluKCBmaWx0ZXIgKVxuXG4gIHJldHVybiBmaWx0ZXJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHQ2MCAgICAgPSByZXF1aXJlKCAnLi90NjAuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwLCBwcm9wcyApID0+IHtcbiAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCB7IGluaXRWYWx1ZToxIH0sIHByb3BzICksXG4gICAgICBzc2QgPSBoaXN0b3J5ICggcHJvcGVydGllcy5pbml0VmFsdWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAoIGRlY2F5VGltZSApICkgKVxuXG4gIHNzZC5vdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNzZC52YWx1ZSA9IDFcbiAgfVxuXG4gIHJldHVybiBzc2Qub3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICApLFxuICAgICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgICBwb2tlID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgICAgc3ViICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgICksXG4gICAgICB3cmFwID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgICAgIGFjY3VtPSByZXF1aXJlKCAnLi9hY2N1bS5qcycpLFxuICAgICAgbWVtbyA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkZWxheScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpbnB1dHNbMF1cbiAgICBcbiAgICByZXR1cm4gaW5wdXRzWzBdXG4gIH0sXG59XG5cbmNvbnN0IGRlZmF1bHRzID0geyBzaXplOiA1MTIsIGludGVycDonbm9uZScgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCB0YXBzLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBsZXQgd3JpdGVJZHgsIHJlYWRJZHgsIGRlbGF5ZGF0YVxuXG4gIGlmKCBBcnJheS5pc0FycmF5KCB0YXBzICkgPT09IGZhbHNlICkgdGFwcyA9IFsgdGFwcyBdXG4gIFxuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgY29uc3QgbWF4VGFwU2l6ZSA9IE1hdGgubWF4KCAuLi50YXBzIClcbiAgaWYoIHByb3BzLnNpemUgPCBtYXhUYXBTaXplICkgcHJvcHMuc2l6ZSA9IG1heFRhcFNpemVcblxuICBkZWxheWRhdGEgPSBkYXRhKCBwcm9wcy5zaXplIClcbiAgXG4gIHVnZW4uaW5wdXRzID0gW11cblxuICB3cml0ZUlkeCA9IGFjY3VtKCAxLCAwLCB7IG1heDpwcm9wcy5zaXplLCBtaW46MCB9KVxuICBcbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0YXBzLmxlbmd0aDsgaSsrICkge1xuICAgIHVnZW4uaW5wdXRzWyBpIF0gPSBwZWVrKCBkZWxheWRhdGEsIHdyYXAoIHN1Yiggd3JpdGVJZHgsIHRhcHNbaV0gKSwgMCwgcHJvcHMuc2l6ZSApLHsgbW9kZTonc2FtcGxlcycsIGludGVycDpwcm9wcy5pbnRlcnAgfSlcbiAgfVxuICBcbiAgdWdlbi5vdXRwdXRzID0gdWdlbi5pbnB1dHMgLy8gWFhYIHVnaCwgVWdoLCBVR0ghIGJ1dCBpIGd1ZXNzIGl0IHdvcmtzLlxuXG4gIHBva2UoIGRlbGF5ZGF0YSwgaW4xLCB3cml0ZUlkeCApXG5cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke2dlbi5nZXRVSUQoKX1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCBuMSA9IGhpc3RvcnkoKVxuICAgIFxuICBuMS5pbiggaW4xIClcblxuICBsZXQgdWdlbiA9IHN1YiggaW4xLCBuMS5vdXQgKVxuICB1Z2VuLm5hbWUgPSAnZGVsdGEnK2dlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkaXYnLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PWAgIHZhciAke3RoaXMubmFtZX0gPSBgLFxuICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1sgMCBdLFxuICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgIGRpdkF0RW5kID0gZmFsc2VcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC8gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCArPSBgJHtsYXN0TnVtYmVyfSAvICR7dn1gXG4gICAgICB9XG5cbiAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnIC8gJyBcbiAgICB9KVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICguLi5hcmdzKSA9PiB7XG4gIGNvbnN0IGRpdiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIGRpdiwge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcbiAgfSlcblxuICBkaXYubmFtZSA9IGRpdi5iYXNlbmFtZSArIGRpdi5pZFxuICBcbiAgcmV0dXJuIGRpdlxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuJyApLFxuICAgIHdpbmRvd3MgPSByZXF1aXJlKCAnLi93aW5kb3dzJyApLFxuICAgIGRhdGEgICAgPSByZXF1aXJlKCAnLi9kYXRhJyApLFxuICAgIHBlZWsgICAgPSByZXF1aXJlKCAnLi9wZWVrJyApLFxuICAgIHBoYXNvciAgPSByZXF1aXJlKCAnLi9waGFzb3InICksXG4gICAgZGVmYXVsdHMgPSB7XG4gICAgICB0eXBlOid0cmlhbmd1bGFyJywgbGVuZ3RoOjEwMjQsIGFscGhhOi4xNSwgc2hpZnQ6MCwgcmV2ZXJzZTpmYWxzZSBcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvcHMgPT4ge1xuICBcbiAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgZGVmYXVsdHMsIHByb3BzIClcbiAgbGV0IGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHByb3BlcnRpZXMubGVuZ3RoIClcblxuICBsZXQgbmFtZSA9IHByb3BlcnRpZXMudHlwZSArICdfJyArIHByb3BlcnRpZXMubGVuZ3RoICsgJ18nICsgcHJvcGVydGllcy5zaGlmdCArICdfJyArIHByb3BlcnRpZXMucmV2ZXJzZSArICdfJyArIHByb3BlcnRpZXMuYWxwaGFcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gPT09ICd1bmRlZmluZWQnICkgeyBcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gd2luZG93c1sgcHJvcGVydGllcy50eXBlIF0oIHByb3BlcnRpZXMubGVuZ3RoLCBpLCBwcm9wZXJ0aWVzLmFscGhhLCBwcm9wZXJ0aWVzLnNoaWZ0IClcbiAgICB9XG5cbiAgICBpZiggcHJvcGVydGllcy5yZXZlcnNlID09PSB0cnVlICkgeyBcbiAgICAgIGJ1ZmZlci5yZXZlcnNlKClcbiAgICB9XG4gICAgZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdID0gZGF0YSggYnVmZmVyIClcbiAgfVxuXG4gIGxldCB1Z2VuID0gZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdIFxuICB1Z2VuLm5hbWUgPSAnZW52JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidlcScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gdGhpcy5pbnB1dHNbMF0gPT09IHRoaXMuaW5wdXRzWzFdID8gMSA6IGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ID09PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidleHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLmV4cCcgOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9ZXhwKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGV4cCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBleHAuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gZXhwXG59XG4iLCJcbi8qKlxuICogQ29weXJpZ2h0IDIwMTggR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90XG4gKiB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZlxuICogdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUXG4gKiBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGVcbiAqIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyXG4gKiB0aGUgTGljZW5zZS5cbiAqL1xuXG4vLyBvcmlnaW5hbGx5IGZyb206XG4vLyBodHRwczovL2dpdGh1Yi5jb20vR29vZ2xlQ2hyb21lTGFicy9hdWRpb3dvcmtsZXQtcG9seWZpbGxcbi8vIEkgYW0gbW9kaWZ5aW5nIGl0IHRvIGFjY2VwdCB2YXJpYWJsZSBidWZmZXIgc2l6ZXNcbi8vIGFuZCB0byBnZXQgcmlkIG9mIHNvbWUgc3RyYW5nZSBnbG9iYWwgaW5pdGlhbGl6YXRpb24gdGhhdCBzZWVtcyByZXF1aXJlZCB0byB1c2UgaXRcbi8vIHdpdGggYnJvd3NlcmlmeS4gQWxzbywgSSBhZGRlZCBjaGFuZ2VzIHRvIGZpeCBhIGJ1ZyBpbiBTYWZhcmkgZm9yIHRoZSBBdWRpb1dvcmtsZXRQcm9jZXNzb3Jcbi8vIHByb3BlcnR5IG5vdCBoYXZpbmcgYSBwcm90b3R5cGUgKHNlZTpodHRwczovL2dpdGh1Yi5jb20vR29vZ2xlQ2hyb21lTGFicy9hdWRpb3dvcmtsZXQtcG9seWZpbGwvcHVsbC8yNSlcbi8vIFRPRE86IFdoeSBpcyB0aGVyZSBhbiBpZnJhbWUgaW52b2x2ZWQ/IChyZWFsbS5qcylcblxuY29uc3QgUmVhbG0gPSByZXF1aXJlKCAnLi9yZWFsbS5qcycgKVxuXG5jb25zdCBBV1BGID0gZnVuY3Rpb24oIHNlbGYgPSB3aW5kb3csIGJ1ZmZlclNpemUgPSA0MDk2ICkge1xuICBjb25zdCBQQVJBTVMgPSBbXVxuICBsZXQgbmV4dFBvcnRcblxuICBpZiAodHlwZW9mIEF1ZGlvV29ya2xldE5vZGUgIT09ICdmdW5jdGlvbicgfHwgIShcImF1ZGlvV29ya2xldFwiIGluIEF1ZGlvQ29udGV4dC5wcm90b3R5cGUpKSB7XG4gICAgc2VsZi5BdWRpb1dvcmtsZXROb2RlID0gZnVuY3Rpb24gQXVkaW9Xb3JrbGV0Tm9kZSAoY29udGV4dCwgbmFtZSwgb3B0aW9ucykge1xuICAgICAgY29uc3QgcHJvY2Vzc29yID0gZ2V0UHJvY2Vzc29yc0ZvckNvbnRleHQoY29udGV4dClbbmFtZV07XG4gICAgICBjb25zdCBvdXRwdXRDaGFubmVscyA9IG9wdGlvbnMgJiYgb3B0aW9ucy5vdXRwdXRDaGFubmVsQ291bnQgPyBvcHRpb25zLm91dHB1dENoYW5uZWxDb3VudFswXSA6IDI7XG4gICAgICBjb25zdCBzY3JpcHRQcm9jZXNzb3IgPSBjb250ZXh0LmNyZWF0ZVNjcmlwdFByb2Nlc3NvciggYnVmZmVyU2l6ZSwgMiwgb3V0cHV0Q2hhbm5lbHMpO1xuXG4gICAgICBzY3JpcHRQcm9jZXNzb3IucGFyYW1ldGVycyA9IG5ldyBNYXAoKTtcbiAgICAgIGlmIChwcm9jZXNzb3IucHJvcGVydGllcykge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByb2Nlc3Nvci5wcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgY29uc3QgcHJvcCA9IHByb2Nlc3Nvci5wcm9wZXJ0aWVzW2ldO1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKS5nYWluO1xuICAgICAgICAgIG5vZGUudmFsdWUgPSBwcm9wLmRlZmF1bHRWYWx1ZTtcbiAgICAgICAgICAvLyBAVE9ETyB0aGVyZSdzIG5vIGdvb2Qgd2F5IHRvIGNvbnN0cnVjdCB0aGUgcHJveHkgQXVkaW9QYXJhbSBoZXJlXG4gICAgICAgICAgc2NyaXB0UHJvY2Vzc29yLnBhcmFtZXRlcnMuc2V0KHByb3AubmFtZSwgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY29uc3QgbWMgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtcbiAgICAgIG5leHRQb3J0ID0gbWMucG9ydDI7XG4gICAgICBjb25zdCBpbnN0ID0gbmV3IHByb2Nlc3Nvci5Qcm9jZXNzb3Iob3B0aW9ucyB8fCB7fSk7XG4gICAgICBuZXh0UG9ydCA9IG51bGw7XG5cbiAgICAgIHNjcmlwdFByb2Nlc3Nvci5wb3J0ID0gbWMucG9ydDE7XG4gICAgICBzY3JpcHRQcm9jZXNzb3IucHJvY2Vzc29yID0gcHJvY2Vzc29yO1xuICAgICAgc2NyaXB0UHJvY2Vzc29yLmluc3RhbmNlID0gaW5zdDtcbiAgICAgIHNjcmlwdFByb2Nlc3Nvci5vbmF1ZGlvcHJvY2VzcyA9IG9uQXVkaW9Qcm9jZXNzO1xuICAgICAgcmV0dXJuIHNjcmlwdFByb2Nlc3NvcjtcbiAgICB9O1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KChzZWxmLkF1ZGlvQ29udGV4dCB8fCBzZWxmLndlYmtpdEF1ZGlvQ29udGV4dCkucHJvdG90eXBlLCAnYXVkaW9Xb3JrbGV0Jywge1xuICAgICAgZ2V0ICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJCRhdWRpb1dvcmtsZXQgfHwgKHRoaXMuJCRhdWRpb1dvcmtsZXQgPSBuZXcgc2VsZi5BdWRpb1dvcmtsZXQodGhpcykpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLyogWFhYIC0gQURERUQgVE8gT1ZFUkNPTUUgUFJPQkxFTSBJTiBTQUZBUkkgV0hFUkUgQVVESU9XT1JLTEVUUFJPQ0VTU09SIFBST1RPVFlQRSBJUyBOT1QgQU4gT0JKRUNUICovXG4gICAgY29uc3QgQXVkaW9Xb3JrbGV0UHJvY2Vzc29yID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnBvcnQgPSBuZXh0UG9ydFxuICAgIH1cbiAgICBBdWRpb1dvcmtsZXRQcm9jZXNzb3IucHJvdG90eXBlID0ge31cblxuICAgIHNlbGYuQXVkaW9Xb3JrbGV0ID0gY2xhc3MgQXVkaW9Xb3JrbGV0IHtcbiAgICAgIGNvbnN0cnVjdG9yIChhdWRpb0NvbnRleHQpIHtcbiAgICAgICAgdGhpcy4kJGNvbnRleHQgPSBhdWRpb0NvbnRleHQ7XG4gICAgICB9XG5cbiAgICAgIGFkZE1vZHVsZSAodXJsLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBmZXRjaCh1cmwpLnRoZW4ociA9PiB7XG4gICAgICAgICAgaWYgKCFyLm9rKSB0aHJvdyBFcnJvcihyLnN0YXR1cyk7XG4gICAgICAgICAgcmV0dXJuIHIudGV4dCgpO1xuICAgICAgICB9KS50aGVuKCBjb2RlID0+IHtcbiAgICAgICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICAgICAgc2FtcGxlUmF0ZTogdGhpcy4kJGNvbnRleHQuc2FtcGxlUmF0ZSxcbiAgICAgICAgICAgIGN1cnJlbnRUaW1lOiB0aGlzLiQkY29udGV4dC5jdXJyZW50VGltZSxcbiAgICAgICAgICAgIEF1ZGlvV29ya2xldFByb2Nlc3NvcixcbiAgICAgICAgICAgIHJlZ2lzdGVyUHJvY2Vzc29yOiAobmFtZSwgUHJvY2Vzc29yKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHByb2Nlc3NvcnMgPSBnZXRQcm9jZXNzb3JzRm9yQ29udGV4dCh0aGlzLiQkY29udGV4dCk7XG4gICAgICAgICAgICAgIHByb2Nlc3NvcnNbbmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgcmVhbG0sXG4gICAgICAgICAgICAgICAgY29udGV4dCxcbiAgICAgICAgICAgICAgICBQcm9jZXNzb3IsXG4gICAgICAgICAgICAgICAgcHJvcGVydGllczogUHJvY2Vzc29yLnBhcmFtZXRlckRlc2NyaXB0b3JzIHx8IFtdXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGNvbnRleHQuc2VsZiA9IGNvbnRleHQ7XG4gICAgICAgICAgY29uc3QgcmVhbG0gPSBuZXcgUmVhbG0oY29udGV4dCwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcbiAgICAgICAgICByZWFsbS5leGVjKCgob3B0aW9ucyAmJiBvcHRpb25zLnRyYW5zcGlsZSkgfHwgU3RyaW5nKShjb2RlKSk7XG4gICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBvbkF1ZGlvUHJvY2VzcyAoZSkge1xuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB7fTtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICB0aGlzLnBhcmFtZXRlcnMuZm9yRWFjaCgodmFsdWUsIGtleSkgPT4ge1xuICAgICAgY29uc3QgYXJyID0gUEFSQU1TWysraW5kZXhdIHx8IChQQVJBTVNbaW5kZXhdID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLmJ1ZmZlclNpemUpKTtcbiAgICAgIC8vIEBUT0RPIHByb3BlciB2YWx1ZXMgaGVyZSBpZiBwb3NzaWJsZVxuICAgICAgYXJyLmZpbGwodmFsdWUudmFsdWUpO1xuICAgICAgcGFyYW1ldGVyc1trZXldID0gYXJyO1xuICAgIH0pO1xuICAgIHRoaXMucHJvY2Vzc29yLnJlYWxtLmV4ZWMoXG4gICAgICAnc2VsZi5zYW1wbGVSYXRlPXNhbXBsZVJhdGU9JyArIHRoaXMuY29udGV4dC5zYW1wbGVSYXRlICsgJzsnICtcbiAgICAgICdzZWxmLmN1cnJlbnRUaW1lPWN1cnJlbnRUaW1lPScgKyB0aGlzLmNvbnRleHQuY3VycmVudFRpbWVcbiAgICApO1xuICAgIGNvbnN0IGlucHV0cyA9IGNoYW5uZWxUb0FycmF5KGUuaW5wdXRCdWZmZXIpO1xuICAgIGNvbnN0IG91dHB1dHMgPSBjaGFubmVsVG9BcnJheShlLm91dHB1dEJ1ZmZlcik7XG4gICAgdGhpcy5pbnN0YW5jZS5wcm9jZXNzKFtpbnB1dHNdLCBbb3V0cHV0c10sIHBhcmFtZXRlcnMpO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hhbm5lbFRvQXJyYXkgKGNoKSB7XG4gICAgY29uc3Qgb3V0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaC5udW1iZXJPZkNoYW5uZWxzOyBpKyspIHtcbiAgICAgIG91dFtpXSA9IGNoLmdldENoYW5uZWxEYXRhKGkpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UHJvY2Vzc29yc0ZvckNvbnRleHQgKGF1ZGlvQ29udGV4dCkge1xuICAgIHJldHVybiBhdWRpb0NvbnRleHQuJCRwcm9jZXNzb3JzIHx8IChhdWRpb0NvbnRleHQuJCRwcm9jZXNzb3JzID0ge30pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQVdQRlxuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBHb29nbGUgTExDXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3RcbiAqIHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mXG4gKiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVRcbiAqIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZVxuICogTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXJcbiAqIHRoZSBMaWNlbnNlLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gUmVhbG0gKHNjb3BlLCBwYXJlbnRFbGVtZW50KSB7XG4gIGNvbnN0IGZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIGZyYW1lLnN0eWxlLmNzc1RleHQgPSAncG9zaXRpb246YWJzb2x1dGU7bGVmdDowO3RvcDotOTk5cHg7d2lkdGg6MXB4O2hlaWdodDoxcHg7JztcbiAgcGFyZW50RWxlbWVudC5hcHBlbmRDaGlsZChmcmFtZSk7XG4gIGNvbnN0IHdpbiA9IGZyYW1lLmNvbnRlbnRXaW5kb3c7XG4gIGNvbnN0IGRvYyA9IHdpbi5kb2N1bWVudDtcbiAgbGV0IHZhcnMgPSAndmFyIHdpbmRvdywkaG9vayc7XG4gIGZvciAoY29uc3QgaSBpbiB3aW4pIHtcbiAgICBpZiAoIShpIGluIHNjb3BlKSAmJiBpICE9PSAnZXZhbCcpIHtcbiAgICAgIHZhcnMgKz0gJywnO1xuICAgICAgdmFycyArPSBpO1xuICAgIH1cbiAgfVxuICBmb3IgKGNvbnN0IGkgaW4gc2NvcGUpIHtcbiAgICB2YXJzICs9ICcsJztcbiAgICB2YXJzICs9IGk7XG4gICAgdmFycyArPSAnPXNlbGYuJztcbiAgICB2YXJzICs9IGk7XG4gIH1cbiAgY29uc3Qgc2NyaXB0ID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICBzY3JpcHQuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZVRleHROb2RlKFxuICAgIGBmdW5jdGlvbiAkaG9vayhzZWxmLGNvbnNvbGUpIHtcInVzZSBzdHJpY3RcIjtcbiAgICAgICAgJHt2YXJzfTtyZXR1cm4gZnVuY3Rpb24oKSB7cmV0dXJuIGV2YWwoYXJndW1lbnRzWzBdKX19YFxuICApKTtcbiAgZG9jLmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgdGhpcy5leGVjID0gd2luLiRob29rLmNhbGwoc2NvcGUsIHNjb3BlLCBjb25zb2xlKTtcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidmbG9vcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZmxvb3IgfSlcblxuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19IHwgMCApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSB8IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBmbG9vciA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBmbG9vci5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBmbG9vclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidmb2xkJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0XG5cbiAgICBvdXQgPSB0aGlzLmNyZWF0ZUNhbGxiYWNrKCBpbnB1dHNbMF0sIHRoaXMubWluLCB0aGlzLm1heCApIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBvdXQgXVxuICB9LFxuXG4gIGNyZWF0ZUNhbGxiYWNrKCB2LCBsbywgaGkgKSB7XG4gICAgbGV0IG91dCA9XG5gIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3Z9LFxuICAgICAgJHt0aGlzLm5hbWV9X3JhbmdlID0gJHtoaX0gLSAke2xvfSxcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9IDBcblxuICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gKCgke3RoaXMubmFtZX1fdmFsdWUgLSAke2xvfSkgLyAke3RoaXMubmFtZX1fcmFuZ2UpIHwgMFxuICAgICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZSAqICR7dGhpcy5uYW1lfV9udW1XcmFwc1xuICAgIH1cbiAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMrK1xuICB9IGVsc2UgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlIDwgJHtsb30pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSArPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZS0gMSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcy0tXG4gIH1cbiAgaWYoJHt0aGlzLm5hbWV9X251bVdyYXBzICYgMSkgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHtoaX0gKyAke2xvfSAtICR7dGhpcy5uYW1lfV92YWx1ZVxuYFxuICAgIHJldHVybiAnICcgKyBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZ2F0ZScsXG4gIGNvbnRyb2xTdHJpbmc6bnVsbCwgLy8gaW5zZXJ0IGludG8gb3V0cHV0IGNvZGVnZW4gZm9yIGRldGVybWluaW5nIGluZGV4aW5nXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcbiAgICBcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGxldCBsYXN0SW5wdXRNZW1vcnlJZHggPSAnbWVtb3J5WyAnICsgdGhpcy5tZW1vcnkubGFzdElucHV0LmlkeCArICcgXScsXG4gICAgICAgIG91dHB1dE1lbW9yeVN0YXJ0SWR4ID0gdGhpcy5tZW1vcnkubGFzdElucHV0LmlkeCArIDEsXG4gICAgICAgIGlucHV0U2lnbmFsID0gaW5wdXRzWzBdLFxuICAgICAgICBjb250cm9sU2lnbmFsID0gaW5wdXRzWzFdXG4gICAgXG4gICAgLyogXG4gICAgICogd2UgY2hlY2sgdG8gc2VlIGlmIHRoZSBjdXJyZW50IGNvbnRyb2wgaW5wdXRzIGVxdWFscyBvdXIgbGFzdCBpbnB1dFxuICAgICAqIGlmIHNvLCB3ZSBzdG9yZSB0aGUgc2lnbmFsIGlucHV0IGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50bHlcbiAgICAgKiBzZWxlY3RlZCBpbmRleC4gSWYgbm90LCB3ZSBwdXQgMCBpbiB0aGUgbWVtb3J5IGFzc29jaWF0ZWQgd2l0aCB0aGUgbGFzdCBzZWxlY3RlZCBpbmRleCxcbiAgICAgKiBjaGFuZ2UgdGhlIHNlbGVjdGVkIGluZGV4LCBhbmQgdGhlbiBzdG9yZSB0aGUgc2lnbmFsIGluIHB1dCBpbiB0aGUgbWVtZXJ5IGFzc29pY2F0ZWRcbiAgICAgKiB3aXRoIHRoZSBuZXdseSBzZWxlY3RlZCBpbmRleFxuICAgICAqL1xuICAgIFxuICAgIG91dCA9XG5cbmAgaWYoICR7Y29udHJvbFNpZ25hbH0gIT09ICR7bGFzdElucHV0TWVtb3J5SWR4fSApIHtcbiAgICBtZW1vcnlbICR7bGFzdElucHV0TWVtb3J5SWR4fSArICR7b3V0cHV0TWVtb3J5U3RhcnRJZHh9ICBdID0gMCBcbiAgICAke2xhc3RJbnB1dE1lbW9yeUlkeH0gPSAke2NvbnRyb2xTaWduYWx9XG4gIH1cbiAgbWVtb3J5WyAke291dHB1dE1lbW9yeVN0YXJ0SWR4fSArICR7Y29udHJvbFNpZ25hbH0gXSA9ICR7aW5wdXRTaWduYWx9XG5cbmBcbiAgICB0aGlzLmNvbnRyb2xTdHJpbmcgPSBpbnB1dHNbMV1cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICB0aGlzLm91dHB1dHMuZm9yRWFjaCggdiA9PiB2LmdlbigpIClcblxuICAgIHJldHVybiBbIG51bGwsICcgJyArIG91dCBdXG4gIH0sXG5cbiAgY2hpbGRnZW4oKSB7XG4gICAgaWYoIHRoaXMucGFyZW50LmluaXRpYWxpemVkID09PSBmYWxzZSApIHtcbiAgICAgIGdlbi5nZXRJbnB1dHMoIHRoaXMgKSAvLyBwYXJlbnQgZ2F0ZSBpcyBvbmx5IGlucHV0IG9mIGEgZ2F0ZSBvdXRwdXQsIHNob3VsZCBvbmx5IGJlIGdlbidkIG9uY2UuXG4gICAgfVxuXG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9IF1gXG4gICAgfVxuICAgIFxuICAgIHJldHVybiAgYG1lbW9yeVsgJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9IF1gXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGNvbnRyb2wsIGluMSwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGNvdW50OiAyIH1cblxuICBpZiggdHlwZW9mIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgb3V0cHV0czogW10sXG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBjb250cm9sIF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICBsYXN0SW5wdXQ6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICB9LFxuICAgIGluaXRpYWxpemVkOmZhbHNlXG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHtnZW4uZ2V0VUlEKCl9YFxuXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgdWdlbi5jb3VudDsgaSsrICkge1xuICAgIHVnZW4ub3V0cHV0cy5wdXNoKHtcbiAgICAgIGluZGV4OmksXG4gICAgICBnZW46IHByb3RvLmNoaWxkZ2VuLFxuICAgICAgcGFyZW50OnVnZW4sXG4gICAgICBpbnB1dHM6IFsgdWdlbiBdLFxuICAgICAgbWVtb3J5OiB7XG4gICAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZWQ6ZmFsc2UsXG4gICAgICBuYW1lOiBgJHt1Z2VuLm5hbWV9X291dCR7Z2VuLmdldFVJRCgpfWBcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKiBnZW4uanNcbiAqXG4gKiBsb3ctbGV2ZWwgY29kZSBnZW5lcmF0aW9uIGZvciB1bml0IGdlbmVyYXRvcnNcbiAqXG4gKi9cbmNvbnN0IE1lbW9yeUhlbHBlciA9IHJlcXVpcmUoICdtZW1vcnktaGVscGVyJyApXG5jb25zdCBFRSA9IHJlcXVpcmUoICdldmVudHMnICkuRXZlbnRFbWl0dGVyXG5cbmNvbnN0IGdlbiA9IHtcblxuICBhY2N1bTowLFxuICBnZXRVSUQoKSB7IHJldHVybiB0aGlzLmFjY3VtKysgfSxcbiAgZGVidWc6ZmFsc2UsXG4gIHNhbXBsZXJhdGU6IDQ0MTAwLCAvLyBjaGFuZ2Ugb24gYXVkaW9jb250ZXh0IGNyZWF0aW9uXG4gIHNob3VsZExvY2FsaXplOiBmYWxzZSxcbiAgZ3JhcGg6bnVsbCxcbiAgZ2xvYmFsczp7XG4gICAgd2luZG93czoge30sXG4gIH0sXG4gIG1vZGU6J3dvcmtsZXQnLFxuICBcbiAgLyogY2xvc3VyZXNcbiAgICpcbiAgICogRnVuY3Rpb25zIHRoYXQgYXJlIGluY2x1ZGVkIGFzIGFyZ3VtZW50cyB0byBtYXN0ZXIgY2FsbGJhY2suIEV4YW1wbGVzOiBNYXRoLmFicywgTWF0aC5yYW5kb20gZXRjLlxuICAgKiBYWFggU2hvdWxkIHByb2JhYmx5IGJlIHJlbmFtZWQgY2FsbGJhY2tQcm9wZXJ0aWVzIG9yIHNvbWV0aGluZyBzaW1pbGFyLi4uIGNsb3N1cmVzIGFyZSBubyBsb25nZXIgdXNlZC5cbiAgICovXG5cbiAgY2xvc3VyZXM6IG5ldyBTZXQoKSxcbiAgcGFyYW1zOiAgIG5ldyBTZXQoKSxcbiAgaW5wdXRzOiAgIG5ldyBTZXQoKSxcblxuICBwYXJhbWV0ZXJzOiBuZXcgU2V0KCksXG4gIGVuZEJsb2NrOiBuZXcgU2V0KCksXG4gIGhpc3RvcmllczogbmV3IE1hcCgpLFxuXG4gIG1lbW86IHt9LFxuXG4gIC8vZGF0YToge30sXG4gIFxuICAvKiBleHBvcnRcbiAgICpcbiAgICogcGxhY2UgZ2VuIGZ1bmN0aW9ucyBpbnRvIGFub3RoZXIgb2JqZWN0IGZvciBlYXNpZXIgcmVmZXJlbmNlXG4gICAqL1xuXG4gIGV4cG9ydCggb2JqICkge30sXG5cbiAgYWRkVG9FbmRCbG9jayggdiApIHtcbiAgICB0aGlzLmVuZEJsb2NrLmFkZCggJyAgJyArIHYgKVxuICB9LFxuICBcbiAgcmVxdWVzdE1lbW9yeSggbWVtb3J5U3BlYywgaW1tdXRhYmxlPWZhbHNlICkge1xuICAgIGZvciggbGV0IGtleSBpbiBtZW1vcnlTcGVjICkge1xuICAgICAgbGV0IHJlcXVlc3QgPSBtZW1vcnlTcGVjWyBrZXkgXVxuXG4gICAgICAvL2NvbnNvbGUubG9nKCAncmVxdWVzdGluZyAnICsga2V5ICsgJzonICwgSlNPTi5zdHJpbmdpZnkoIHJlcXVlc3QgKSApXG5cbiAgICAgIGlmKCByZXF1ZXN0Lmxlbmd0aCA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICBjb25zb2xlLmxvZyggJ3VuZGVmaW5lZCBsZW5ndGggZm9yOicsIGtleSApXG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5pZHggPSBnZW4ubWVtb3J5LmFsbG9jKCByZXF1ZXN0Lmxlbmd0aCwgaW1tdXRhYmxlIClcbiAgICB9XG4gIH0sXG5cbiAgY3JlYXRlTWVtb3J5KCBhbW91bnQsIHR5cGUgKSB7XG4gICAgY29uc3QgbWVtID0gTWVtb3J5SGVscGVyLmNyZWF0ZSggYW1vdW50LCB0eXBlIClcbiAgICByZXR1cm4gbWVtXG4gIH0sXG5cbiAgY3JlYXRlQ2FsbGJhY2soIHVnZW4sIG1lbSwgZGVidWcgPSBmYWxzZSwgc2hvdWxkSW5saW5lTWVtb3J5PWZhbHNlLCBtZW1UeXBlID0gRmxvYXQ2NEFycmF5ICkge1xuICAgIGxldCBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIHVnZW4gKSAmJiB1Z2VuLmxlbmd0aCA+IDEsXG4gICAgICAgIGNhbGxiYWNrLCBcbiAgICAgICAgY2hhbm5lbDEsIGNoYW5uZWwyXG5cbiAgICBpZiggdHlwZW9mIG1lbSA9PT0gJ251bWJlcicgfHwgbWVtID09PSB1bmRlZmluZWQgKSB7XG4gICAgICB0aGlzLm1lbW9yeSA9IHRoaXMuY3JlYXRlTWVtb3J5KCBtZW0sIG1lbVR5cGUgKVxuICAgICAgdGhpcy5vdXRwdXRJZHggPSB0aGlzLm1lbW9yeS5hbGxvYyggMiwgdHJ1ZSApXG4gICAgICB0aGlzLmVtaXQoICdtZW1vcnkgaW5pdCcgKVxuICAgIH1cbiAgICBcbiAgICAvL2NvbnNvbGUubG9nKCAnY2IgbWVtb3J5OicsIG1lbSApXG4gICAgdGhpcy5ncmFwaCA9IHVnZW5cbiAgICB0aGlzLm1lbW8gPSB7fSBcbiAgICB0aGlzLmVuZEJsb2NrLmNsZWFyKClcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKClcbiAgICB0aGlzLmlucHV0cy5jbGVhcigpXG4gICAgdGhpcy5wYXJhbXMuY2xlYXIoKVxuICAgIHRoaXMuZ2xvYmFscyA9IHsgd2luZG93czp7fSB9XG4gICAgXG4gICAgdGhpcy5wYXJhbWV0ZXJzLmNsZWFyKClcbiAgICBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiICAndXNlIHN0cmljdCdcXG5cIlxuICAgIGlmKCBzaG91bGRJbmxpbmVNZW1vcnk9PT1mYWxzZSApIHtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnID8gXG4gICAgICAgIFwiICB2YXIgbWVtb3J5ID0gdGhpcy5tZW1vcnlcXG5cXG5cIiA6XG4gICAgICAgIFwiICB2YXIgbWVtb3J5ID0gZ2VuLm1lbW9yeVxcblxcblwiXG4gICAgfVxuXG4gICAgLy8gY2FsbCAuZ2VuKCkgb24gdGhlIGhlYWQgb2YgdGhlIGdyYXBoIHdlIGFyZSBnZW5lcmF0aW5nIHRoZSBjYWxsYmFjayBmb3JcbiAgICAvL2NvbnNvbGUubG9nKCAnSEVBRCcsIHVnZW4gKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMSArIGlzU3RlcmVvOyBpKysgKSB7XG4gICAgICBpZiggdHlwZW9mIHVnZW5baV0gPT09ICdudW1iZXInICkgY29udGludWVcblxuICAgICAgLy9sZXQgY2hhbm5lbCA9IGlzU3RlcmVvID8gdWdlbltpXS5nZW4oKSA6IHVnZW4uZ2VuKCksXG4gICAgICBsZXQgY2hhbm5lbCA9IGlzU3RlcmVvID8gdGhpcy5nZXRJbnB1dCggdWdlbltpXSApIDogdGhpcy5nZXRJbnB1dCggdWdlbiApLCBcbiAgICAgICAgICBib2R5ID0gJydcblxuICAgICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgICAgYm9keSArPSBBcnJheS5pc0FycmF5KCBjaGFubmVsICkgPyBjaGFubmVsWzFdICsgJ1xcbicgKyBjaGFubmVsWzBdIDogY2hhbm5lbFxuXG4gICAgICAvLyBzcGxpdCBib2R5IHRvIGluamVjdCByZXR1cm4ga2V5d29yZCBvbiBsYXN0IGxpbmVcbiAgICAgIGJvZHkgPSBib2R5LnNwbGl0KCdcXG4nKVxuICAgICBcbiAgICAgIC8vaWYoIGRlYnVnICkgY29uc29sZS5sb2coICdmdW5jdGlvbkJvZHkgbGVuZ3RoJywgYm9keSApXG4gICAgICBcbiAgICAgIC8vIG5leHQgbGluZSBpcyB0byBhY2NvbW1vZGF0ZSBtZW1vIGFzIGdyYXBoIGhlYWRcbiAgICAgIGlmKCBib2R5WyBib2R5Lmxlbmd0aCAtMSBdLnRyaW0oKS5pbmRleE9mKCdsZXQnKSA+IC0xICkgeyBib2R5LnB1c2goICdcXG4nICkgfSBcblxuICAgICAgLy8gZ2V0IGluZGV4IG9mIGxhc3QgbGluZVxuICAgICAgbGV0IGxhc3RpZHggPSBib2R5Lmxlbmd0aCAtIDFcblxuICAgICAgLy8gaW5zZXJ0IHJldHVybiBrZXl3b3JkXG4gICAgICBib2R5WyBsYXN0aWR4IF0gPSAnICBtZW1vcnlbJyArICh0aGlzLm91dHB1dElkeCArIGkpICsgJ10gID0gJyArIGJvZHlbIGxhc3RpZHggXSArICdcXG4nXG5cbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGJvZHkuam9pbignXFxuJylcbiAgICB9XG4gICAgXG4gICAgdGhpcy5oaXN0b3JpZXMuZm9yRWFjaCggdmFsdWUgPT4ge1xuICAgICAgaWYoIHZhbHVlICE9PSBudWxsIClcbiAgICAgICAgdmFsdWUuZ2VuKCkgICAgICBcbiAgICB9KVxuXG4gICAgY29uc3QgcmV0dXJuU3RhdGVtZW50ID0gaXNTdGVyZW8gPyBgICByZXR1cm4gWyBtZW1vcnlbJHt0aGlzLm91dHB1dElkeH1dLCBtZW1vcnlbJHt0aGlzLm91dHB1dElkeCArIDF9XSBdYCA6IGAgIHJldHVybiBtZW1vcnlbJHt0aGlzLm91dHB1dElkeH1dYFxuICAgIFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpXG5cbiAgICBpZiggdGhpcy5lbmRCbG9jay5zaXplICkgeyBcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuY29uY2F0KCBBcnJheS5mcm9tKCB0aGlzLmVuZEJsb2NrICkgKVxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2goIHJldHVyblN0YXRlbWVudCApXG4gICAgfVxuICAgIC8vIHJlYXNzZW1ibGUgZnVuY3Rpb24gYm9keVxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuam9pbignXFxuJylcblxuICAgIC8vIHdlIGNhbiBvbmx5IGR5bmFtaWNhbGx5IGNyZWF0ZSBhIG5hbWVkIGZ1bmN0aW9uIGJ5IGR5bmFtaWNhbGx5IGNyZWF0aW5nIGFub3RoZXIgZnVuY3Rpb25cbiAgICAvLyB0byBjb25zdHJ1Y3QgdGhlIG5hbWVkIGZ1bmN0aW9uISBzaGVlc2guLi5cbiAgICAvL1xuICAgIGlmKCBzaG91bGRJbmxpbmVNZW1vcnkgPT09IHRydWUgKSB7XG4gICAgICB0aGlzLnBhcmFtZXRlcnMuYWRkKCAnbWVtb3J5JyApXG4gICAgfVxuXG4gICAgbGV0IHBhcmFtU3RyaW5nID0gJydcbiAgICBpZiggdGhpcy5tb2RlID09PSAnd29ya2xldCcgKSB7XG4gICAgICBmb3IoIGxldCBuYW1lIG9mIHRoaXMucGFyYW1ldGVycy52YWx1ZXMoKSApIHtcbiAgICAgICAgcGFyYW1TdHJpbmcgKz0gbmFtZSArICcsJ1xuICAgICAgfVxuICAgICAgcGFyYW1TdHJpbmcgPSBwYXJhbVN0cmluZy5zbGljZSgwLC0xKVxuICAgIH1cblxuICAgIGNvbnN0IHNlcGFyYXRvciA9IHRoaXMucGFyYW1ldGVycy5zaXplICE9PSAwICYmIHRoaXMuaW5wdXRzLnNpemUgPiAwID8gJywgJyA6ICcnXG5cbiAgICBsZXQgaW5wdXRTdHJpbmcgPSAnJ1xuICAgIGlmKCB0aGlzLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgIGZvciggbGV0IHVnZW4gb2YgdGhpcy5pbnB1dHMudmFsdWVzKCkgKSB7XG4gICAgICAgIGlucHV0U3RyaW5nICs9IHVnZW4ubmFtZSArICcsJ1xuICAgICAgfVxuICAgICAgaW5wdXRTdHJpbmcgPSBpbnB1dFN0cmluZy5zbGljZSgwLC0xKVxuICAgIH1cblxuICAgIGxldCBidWlsZFN0cmluZyA9IHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgICA/IGByZXR1cm4gZnVuY3Rpb24oICR7aW5wdXRTdHJpbmd9ICR7c2VwYXJhdG9yfSAke3BhcmFtU3RyaW5nfSApeyBcXG4keyB0aGlzLmZ1bmN0aW9uQm9keSB9XFxufWBcbiAgICAgIDogYHJldHVybiBmdW5jdGlvbiBnZW4oICR7IFsuLi50aGlzLnBhcmFtZXRlcnNdLmpvaW4oJywnKSB9ICl7IFxcbiR7IHRoaXMuZnVuY3Rpb25Cb2R5IH1cXG59YFxuICAgIFxuICAgIGlmKCB0aGlzLmRlYnVnIHx8IGRlYnVnICkgY29uc29sZS5sb2coIGJ1aWxkU3RyaW5nICkgXG5cbiAgICBjYWxsYmFjayA9IG5ldyBGdW5jdGlvbiggYnVpbGRTdHJpbmcgKSgpXG5cbiAgICAvLyBhc3NpZ24gcHJvcGVydGllcyB0byBuYW1lZCBmdW5jdGlvblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5jbG9zdXJlcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB2YWx1ZSA9IGRpY3RbIG5hbWUgXVxuXG4gICAgICBjYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHVnZW4gPSBkaWN0WyBuYW1lIF1cbiAgICAgIFxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBjYWxsYmFjaywgbmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHVnZW4udmFsdWUgfSxcbiAgICAgICAgc2V0KHYpeyB1Z2VuLnZhbHVlID0gdiB9XG4gICAgICB9KVxuICAgICAgLy9jYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICBjYWxsYmFjay5tZW1iZXJzID0gdGhpcy5jbG9zdXJlc1xuICAgIGNhbGxiYWNrLmRhdGEgPSB0aGlzLmRhdGFcbiAgICBjYWxsYmFjay5wYXJhbXMgPSB0aGlzLnBhcmFtc1xuICAgIGNhbGxiYWNrLmlucHV0cyA9IHRoaXMuaW5wdXRzXG4gICAgY2FsbGJhY2sucGFyYW1ldGVycyA9IHRoaXMucGFyYW1ldGVycy8vLnNsaWNlKCAwIClcbiAgICBjYWxsYmFjay5pc1N0ZXJlbyA9IGlzU3RlcmVvXG5cbiAgICAvL2lmKCBNZW1vcnlIZWxwZXIuaXNQcm90b3R5cGVPZiggdGhpcy5tZW1vcnkgKSApIFxuICAgIGNhbGxiYWNrLm1lbW9yeSA9IHRoaXMubWVtb3J5LmhlYXBcblxuICAgIHRoaXMuaGlzdG9yaWVzLmNsZWFyKClcblxuICAgIHJldHVybiBjYWxsYmFja1xuICB9LFxuICBcbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIENhbGxlZCBieSBlYWNoIGluZGl2aWR1YWwgdWdlbiB3aGVuIHRoZWlyIC5nZW4oKSBtZXRob2QgaXMgY2FsbGVkIHRvIHJlc29sdmUgdGhlaXIgdmFyaW91cyBpbnB1dHMuXG4gICAqIElmIGFuIGlucHV0IGlzIGEgbnVtYmVyLCByZXR1cm4gdGhlIG51bWJlci4gSWZcbiAgICogaXQgaXMgYW4gdWdlbiwgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0cyggdWdlbiApIHtcbiAgICByZXR1cm4gdWdlbi5pbnB1dHMubWFwKCBnZW4uZ2V0SW5wdXQgKSBcbiAgfSxcblxuICBnZXRJbnB1dCggaW5wdXQgKSB7XG4gICAgbGV0IGlzT2JqZWN0ID0gdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyxcbiAgICAgICAgcHJvY2Vzc2VkSW5wdXRcblxuICAgIGlmKCBpc09iamVjdCApIHsgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uIFxuICAgICAgLy9jb25zb2xlLmxvZyggaW5wdXQubmFtZSwgZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApXG4gICAgICBpZiggZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApIHsgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBnZW4ubWVtb1sgaW5wdXQubmFtZSBdXG4gICAgICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaW5wdXQgKSApIHtcbiAgICAgICAgZ2VuLmdldElucHV0KCBpbnB1dFswXSApXG4gICAgICAgIGdlbi5nZXRJbnB1dCggaW5wdXRbMV0gKVxuICAgICAgfWVsc2V7IC8vIGlmIG5vdCBtZW1vaXplZCBnZW5lcmF0ZSBjb2RlICBcbiAgICAgICAgaWYoIHR5cGVvZiBpbnB1dC5nZW4gIT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coICdubyBnZW4gZm91bmQ6JywgaW5wdXQsIGlucHV0LmdlbiApXG4gICAgICAgICAgaW5wdXQgPSBpbnB1dC5ncmFwaFxuICAgICAgICB9XG4gICAgICAgIGxldCBjb2RlID0gaW5wdXQuZ2VuKClcbiAgICAgICAgLy9pZiggY29kZS5pbmRleE9mKCAnT2JqZWN0JyApID4gLTEgKSBjb25zb2xlLmxvZyggJ2JhZCBpbnB1dDonLCBpbnB1dCwgY29kZSApXG4gICAgICAgIFxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggY29kZSApICkge1xuICAgICAgICAgIGlmKCAhZ2VuLnNob3VsZExvY2FsaXplICkge1xuICAgICAgICAgICAgZ2VuLmZ1bmN0aW9uQm9keSArPSBjb2RlWzFdXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBnZW4uY29kZU5hbWUgPSBjb2RlWzBdXG4gICAgICAgICAgICBnZW4ubG9jYWxpemVkQ29kZS5wdXNoKCBjb2RlWzFdIClcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyggJ2FmdGVyIEdFTicgLCB0aGlzLmZ1bmN0aW9uQm9keSApXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlWzBdXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfWVsc2V7IC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2Nlc3NlZElucHV0XG4gIH0sXG5cbiAgc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXVxuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSB0cnVlXG4gIH0sXG4gIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApIF1cbiAgfSxcblxuICBmcmVlKCBncmFwaCApIHtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggZ3JhcGggKSApIHsgLy8gc3RlcmVvIHVnZW5cbiAgICAgIGZvciggbGV0IGNoYW5uZWwgb2YgZ3JhcGggKSB7XG4gICAgICAgIHRoaXMuZnJlZSggY2hhbm5lbCApXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKCB0eXBlb2YgZ3JhcGggPT09ICdvYmplY3QnICkge1xuICAgICAgICBpZiggZ3JhcGgubWVtb3J5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgZm9yKCBsZXQgbWVtb3J5S2V5IGluIGdyYXBoLm1lbW9yeSApIHtcbiAgICAgICAgICAgIHRoaXMubWVtb3J5LmZyZWUoIGdyYXBoLm1lbW9yeVsgbWVtb3J5S2V5IF0uaWR4IClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGdyYXBoLmlucHV0cyApICkge1xuICAgICAgICAgIGZvciggbGV0IHVnZW4gb2YgZ3JhcGguaW5wdXRzICkge1xuICAgICAgICAgICAgdGhpcy5mcmVlKCB1Z2VuIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZ2VuLl9fcHJvdG9fXyA9IG5ldyBFRSgpXG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2d0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0pIHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID4gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3QuaW5wdXRzID0gWyB4LHkgXVxuICBndC5uYW1lID0gZ3QuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPj0gJHtpbnB1dHNbMV19IHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID49IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cbiAgZ3QubmFtZSA9ICdndGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCAoICR7aW5wdXRzWzBdfSA+ICR7aW5wdXRzWzFdfSApIHwgMCApIClgIFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoICggaW5wdXRzWzBdID4gaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3RwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGd0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xPTAgKSA9PiB7XG4gIGxldCB1Z2VuID0ge1xuICAgIGlucHV0czogWyBpbjEgXSxcbiAgICBtZW1vcnk6IHsgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IH0sXG4gICAgcmVjb3JkZXI6IG51bGwsXG5cbiAgICBpbiggdiApIHtcbiAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmhhcyggdiApICl7XG4gICAgICAgIGxldCBtZW1vSGlzdG9yeSA9IGdlbi5oaXN0b3JpZXMuZ2V0KCB2IClcbiAgICAgICAgdWdlbi5uYW1lID0gbWVtb0hpc3RvcnkubmFtZVxuICAgICAgICByZXR1cm4gbWVtb0hpc3RvcnlcbiAgICAgIH1cblxuICAgICAgbGV0IG9iaiA9IHtcbiAgICAgICAgZ2VuKCkge1xuICAgICAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB1Z2VuIClcblxuICAgICAgICAgIGlmKCB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IGluMVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHhcbiAgICAgICAgICBcbiAgICAgICAgICBnZW4uYWRkVG9FbmRCbG9jayggJ21lbW9yeVsgJyArIGlkeCArICcgXSA9ICcgKyBpbnB1dHNbIDAgXSApXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICBnZW4uaGlzdG9yaWVzLnNldCggdiwgb2JqIClcblxuICAgICAgICAgIHJldHVybiBpbnB1dHNbIDAgXVxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX2luJytnZW4uZ2V0VUlEKCksXG4gICAgICAgIG1lbW9yeTogdWdlbi5tZW1vcnlcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnB1dHNbIDAgXSA9IHZcbiAgICAgIFxuICAgICAgdWdlbi5yZWNvcmRlciA9IG9ialxuXG4gICAgICByZXR1cm4gb2JqXG4gICAgfSxcbiAgICBcbiAgICBvdXQ6IHtcbiAgICAgICAgICAgIFxuICAgICAgZ2VuKCkge1xuICAgICAgICBpZiggdWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmdldCggdWdlbi5pbnB1dHNbMF0gKSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4uaW5wdXRzWzBdLCB1Z2VuLnJlY29yZGVyIClcbiAgICAgICAgICB9XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gcGFyc2VGbG9hdCggaW4xIClcbiAgICAgICAgfVxuICAgICAgICBsZXQgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4XG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuICdtZW1vcnlbICcgKyBpZHggKyAnIF0gJ1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgdWlkOiBnZW4uZ2V0VUlEKCksXG4gIH1cbiAgXG4gIHVnZW4ub3V0Lm1lbW9yeSA9IHVnZW4ubWVtb3J5IFxuXG4gIHVnZW4ubmFtZSA9ICdoaXN0b3J5JyArIHVnZW4udWlkXG4gIHVnZW4ub3V0Lm5hbWUgPSB1Z2VuLm5hbWUgKyAnX291dCdcbiAgdWdlbi5pbi5fbmFtZSAgPSB1Z2VuLm5hbWUgPSAnX2luJ1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2lmZWxzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb25kaXRpb25hbHMgPSB0aGlzLmlucHV0c1swXSxcbiAgICAgICAgZGVmYXVsdFZhbHVlID0gZ2VuLmdldElucHV0KCBjb25kaXRpb25hbHNbIGNvbmRpdGlvbmFscy5sZW5ndGggLSAxXSApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7ZGVmYXVsdFZhbHVlfVxcbmAgXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnY29uZGl0aW9uYWxzOicsIHRoaXMubmFtZSwgY29uZGl0aW9uYWxzIClcblxuICAgIC8vY29uc29sZS5sb2coICdkZWZhdWx0VmFsdWU6JywgZGVmYXVsdFZhbHVlIClcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgY29uZGl0aW9uYWxzLmxlbmd0aCAtIDI7IGkrPSAyICkge1xuICAgICAgbGV0IGlzRW5kQmxvY2sgPSBpID09PSBjb25kaXRpb25hbHMubGVuZ3RoIC0gMyxcbiAgICAgICAgICBjb25kICA9IGdlbi5nZXRJbnB1dCggY29uZGl0aW9uYWxzWyBpIF0gKSxcbiAgICAgICAgICBwcmVibG9jayA9IGNvbmRpdGlvbmFsc1sgaSsxIF0sXG4gICAgICAgICAgYmxvY2ssIGJsb2NrTmFtZSwgb3V0cHV0XG5cbiAgICAgIC8vY29uc29sZS5sb2coICdwYicsIHByZWJsb2NrIClcblxuICAgICAgaWYoIHR5cGVvZiBwcmVibG9jayA9PT0gJ251bWJlcicgKXtcbiAgICAgICAgYmxvY2sgPSBwcmVibG9ja1xuICAgICAgICBibG9ja05hbWUgPSBudWxsXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoIGdlbi5tZW1vWyBwcmVibG9jay5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAvLyB1c2VkIHRvIHBsYWNlIGFsbCBjb2RlIGRlcGVuZGVuY2llcyBpbiBhcHByb3ByaWF0ZSBibG9ja3NcbiAgICAgICAgICBnZW4uc3RhcnRMb2NhbGl6ZSgpXG5cbiAgICAgICAgICBnZW4uZ2V0SW5wdXQoIHByZWJsb2NrIClcblxuICAgICAgICAgIGJsb2NrID0gZ2VuLmVuZExvY2FsaXplKClcbiAgICAgICAgICBibG9ja05hbWUgPSBibG9ja1swXVxuICAgICAgICAgIGJsb2NrID0gYmxvY2tbIDEgXS5qb2luKCcnKVxuICAgICAgICAgIGJsb2NrID0gJyAgJyArIGJsb2NrLnJlcGxhY2UoIC9cXG4vZ2ksICdcXG4gICcgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBibG9jayA9ICcnXG4gICAgICAgICAgYmxvY2tOYW1lID0gZ2VuLm1lbW9bIHByZWJsb2NrLm5hbWUgXVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG91dHB1dCA9IGJsb2NrTmFtZSA9PT0gbnVsbCA/IFxuICAgICAgICBgICAke3RoaXMubmFtZX1fb3V0ID0gJHtibG9ja31gIDpcbiAgICAgICAgYCR7YmxvY2t9ICAke3RoaXMubmFtZX1fb3V0ID0gJHtibG9ja05hbWV9YFxuICAgICAgXG4gICAgICBpZiggaT09PTAgKSBvdXQgKz0gJyAnXG4gICAgICBvdXQgKz0gXG5gIGlmKCAke2NvbmR9ID09PSAxICkge1xuJHtvdXRwdXR9XG4gIH1gXG5cbiAgICAgIGlmKCAhaXNFbmRCbG9jayApIHtcbiAgICAgICAgb3V0ICs9IGAgZWxzZWBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYFxcbmBcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9X291dGBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1fb3V0YCwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KCBhcmdzWzBdICkgPyBhcmdzWzBdIDogYXJnc1xuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBjb25kaXRpb25zIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonaW4nLFxuXG4gIGdlbigpIHtcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgICBpZiggaXNXb3JrbGV0ICkge1xuICAgICAgZ2VuLmlucHV0cy5hZGQoIHRoaXMgKVxuICAgIH1lbHNle1xuICAgICAgZ2VuLnBhcmFtZXRlcnMuYWRkKCB0aGlzLm5hbWUgKVxuICAgIH1cblxuICAgIC8vZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaXNXb3JrbGV0ID8gdGhpcy5uYW1lICsgJ1tpXScgOiB0aGlzLm5hbWVcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnW2ldJ1xuXG4gICAgcmV0dXJuIHRoaXMubmFtZSArICdbaV0nXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBuYW1lLCBpbnB1dE51bWJlcj0wLCBjaGFubmVsTnVtYmVyPTAsIGRlZmF1bHRWYWx1ZT0wLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCBpbnB1dCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBpbnB1dC5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIGlucHV0Lm5hbWUgPSBuYW1lICE9PSB1bmRlZmluZWQgPyBuYW1lIDogYCR7aW5wdXQuYmFzZW5hbWV9JHtpbnB1dC5pZH1gXG4gIE9iamVjdC5hc3NpZ24oIGlucHV0LCB7IGRlZmF1bHRWYWx1ZSwgbWluLCBtYXgsIGlucHV0TnVtYmVyLCBjaGFubmVsTnVtYmVyIH0pXG5cbiAgaW5wdXRbMF0gPSB7XG4gICAgZ2VuKCkge1xuICAgICAgaWYoICEgZ2VuLnBhcmFtZXRlcnMuaGFzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5hZGQoIGlucHV0Lm5hbWUgKVxuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzBdJ1xuICAgIH1cbiAgfVxuICBpbnB1dFsxXSA9IHtcbiAgICBnZW4oKSB7XG4gICAgICBpZiggISBnZW4ucGFyYW1ldGVycy5oYXMoIGlucHV0Lm5hbWUgKSApIGdlbi5wYXJhbWV0ZXJzLmFkZCggaW5wdXQubmFtZSApXG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMV0nXG4gICAgfVxuICB9XG5cblxuICByZXR1cm4gaW5wdXRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBsaWJyYXJ5ID0ge1xuICBleHBvcnQoIGRlc3RpbmF0aW9uICkge1xuICAgIGlmKCBkZXN0aW5hdGlvbiA9PT0gd2luZG93ICkge1xuICAgICAgZGVzdGluYXRpb24uc3NkID0gbGlicmFyeS5oaXN0b3J5ICAgIC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICAgICAgZGVzdGluYXRpb24uaW5wdXQgPSBsaWJyYXJ5LmluICAgICAgIC8vIGluIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG4gICAgICBkZXN0aW5hdGlvbi50ZXJuYXJ5ID0gbGlicmFyeS5zd2l0Y2ggLy8gc3dpdGNoIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5Lmhpc3RvcnlcbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LmluXG4gICAgICBkZWxldGUgbGlicmFyeS5zd2l0Y2hcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKCBkZXN0aW5hdGlvbiwgbGlicmFyeSApXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGxpYnJhcnksICdzYW1wbGVyYXRlJywge1xuICAgICAgZ2V0KCkgeyByZXR1cm4gbGlicmFyeS5nZW4uc2FtcGxlcmF0ZSB9LFxuICAgICAgc2V0KHYpIHt9XG4gICAgfSlcblxuICAgIGxpYnJhcnkuaW4gPSBkZXN0aW5hdGlvbi5pbnB1dFxuICAgIGxpYnJhcnkuaGlzdG9yeSA9IGRlc3RpbmF0aW9uLnNzZFxuICAgIGxpYnJhcnkuc3dpdGNoID0gZGVzdGluYXRpb24udGVybmFyeVxuXG4gICAgZGVzdGluYXRpb24uY2xpcCA9IGxpYnJhcnkuY2xhbXBcbiAgfSxcblxuICBnZW46ICAgICAgcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICBcbiAgYWJzOiAgICAgIHJlcXVpcmUoICcuL2Ficy5qcycgKSxcbiAgcm91bmQ6ICAgIHJlcXVpcmUoICcuL3JvdW5kLmpzJyApLFxuICBwYXJhbTogICAgcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gIGFkZDogICAgICByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gIHN1YjogICAgICByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gIG11bDogICAgICByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gIGRpdjogICAgICByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gIGFjY3VtOiAgICByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgY291bnRlcjogIHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gIHNpbjogICAgICByZXF1aXJlKCAnLi9zaW4uanMnICksXG4gIGNvczogICAgICByZXF1aXJlKCAnLi9jb3MuanMnICksXG4gIHRhbjogICAgICByZXF1aXJlKCAnLi90YW4uanMnICksXG4gIHRhbmg6ICAgICByZXF1aXJlKCAnLi90YW5oLmpzJyApLFxuICBhc2luOiAgICAgcmVxdWlyZSggJy4vYXNpbi5qcycgKSxcbiAgYWNvczogICAgIHJlcXVpcmUoICcuL2Fjb3MuanMnICksXG4gIGF0YW46ICAgICByZXF1aXJlKCAnLi9hdGFuLmpzJyApLCAgXG4gIHBoYXNvcjogICByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gIGRhdGE6ICAgICByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICBwZWVrOiAgICAgcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgY3ljbGU6ICAgIHJlcXVpcmUoICcuL2N5Y2xlLmpzJyApLFxuICBoaXN0b3J5OiAgcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgZGVsdGE6ICAgIHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICBmbG9vcjogICAgcmVxdWlyZSggJy4vZmxvb3IuanMnICksXG4gIGNlaWw6ICAgICByZXF1aXJlKCAnLi9jZWlsLmpzJyApLFxuICBtaW46ICAgICAgcmVxdWlyZSggJy4vbWluLmpzJyApLFxuICBtYXg6ICAgICAgcmVxdWlyZSggJy4vbWF4LmpzJyApLFxuICBzaWduOiAgICAgcmVxdWlyZSggJy4vc2lnbi5qcycgKSxcbiAgZGNibG9jazogIHJlcXVpcmUoICcuL2RjYmxvY2suanMnICksXG4gIG1lbW86ICAgICByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICByYXRlOiAgICAgcmVxdWlyZSggJy4vcmF0ZS5qcycgKSxcbiAgd3JhcDogICAgIHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gIG1peDogICAgICByZXF1aXJlKCAnLi9taXguanMnICksXG4gIGNsYW1wOiAgICByZXF1aXJlKCAnLi9jbGFtcC5qcycgKSxcbiAgcG9rZTogICAgIHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gIGRlbGF5OiAgICByZXF1aXJlKCAnLi9kZWxheS5qcycgKSxcbiAgZm9sZDogICAgIHJlcXVpcmUoICcuL2ZvbGQuanMnICksXG4gIG1vZCA6ICAgICByZXF1aXJlKCAnLi9tb2QuanMnICksXG4gIHNhaCA6ICAgICByZXF1aXJlKCAnLi9zYWguanMnICksXG4gIG5vaXNlOiAgICByZXF1aXJlKCAnLi9ub2lzZS5qcycgKSxcbiAgbm90OiAgICAgIHJlcXVpcmUoICcuL25vdC5qcycgKSxcbiAgZ3Q6ICAgICAgIHJlcXVpcmUoICcuL2d0LmpzJyApLFxuICBndGU6ICAgICAgcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICBsdDogICAgICAgcmVxdWlyZSggJy4vbHQuanMnICksIFxuICBsdGU6ICAgICAgcmVxdWlyZSggJy4vbHRlLmpzJyApLCBcbiAgYm9vbDogICAgIHJlcXVpcmUoICcuL2Jvb2wuanMnICksXG4gIGdhdGU6ICAgICByZXF1aXJlKCAnLi9nYXRlLmpzJyApLFxuICB0cmFpbjogICAgcmVxdWlyZSggJy4vdHJhaW4uanMnICksXG4gIHNsaWRlOiAgICByZXF1aXJlKCAnLi9zbGlkZS5qcycgKSxcbiAgaW46ICAgICAgIHJlcXVpcmUoICcuL2luLmpzJyApLFxuICB0NjA6ICAgICAgcmVxdWlyZSggJy4vdDYwLmpzJyksXG4gIG10b2Y6ICAgICByZXF1aXJlKCAnLi9tdG9mLmpzJyksXG4gIGx0cDogICAgICByZXF1aXJlKCAnLi9sdHAuanMnKSwgICAgICAgIC8vIFRPRE86IHRlc3RcbiAgZ3RwOiAgICAgIHJlcXVpcmUoICcuL2d0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBzd2l0Y2g6ICAgcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApLFxuICBtc3Rvc2FtcHM6cmVxdWlyZSggJy4vbXN0b3NhbXBzLmpzJyApLCAvLyBUT0RPOiBuZWVkcyB0ZXN0LFxuICBzZWxlY3RvcjogcmVxdWlyZSggJy4vc2VsZWN0b3IuanMnICksXG4gIHV0aWxpdGllczpyZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gIHBvdzogICAgICByZXF1aXJlKCAnLi9wb3cuanMnICksXG4gIGF0dGFjazogICByZXF1aXJlKCAnLi9hdHRhY2suanMnICksXG4gIGRlY2F5OiAgICByZXF1aXJlKCAnLi9kZWNheS5qcycgKSxcbiAgd2luZG93czogIHJlcXVpcmUoICcuL3dpbmRvd3MuanMnICksXG4gIGVudjogICAgICByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gIGFkOiAgICAgICByZXF1aXJlKCAnLi9hZC5qcycgICksXG4gIGFkc3I6ICAgICByZXF1aXJlKCAnLi9hZHNyLmpzJyApLFxuICBpZmVsc2U6ICAgcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gIGJhbmc6ICAgICByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICBhbmQ6ICAgICAgcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICBwYW46ICAgICAgcmVxdWlyZSggJy4vcGFuLmpzJyApLFxuICBlcTogICAgICAgcmVxdWlyZSggJy4vZXEuanMnICksXG4gIG5lcTogICAgICByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gIGV4cDogICAgICByZXF1aXJlKCAnLi9leHAuanMnICksXG4gIHByb2Nlc3M6ICByZXF1aXJlKCAnLi9wcm9jZXNzLmpzJyApLFxuICBzZXE6ICAgICAgcmVxdWlyZSggJy4vc2VxLmpzJyApXG59XG5cbmxpYnJhcnkuZ2VuLmxpYiA9IGxpYnJhcnlcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJyYXJ5XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2x0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCgoICR7aW5wdXRzWzBdfSA8ICR7aW5wdXRzWzFdfSkgfCAwICApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdIDwgaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0LmlucHV0cyA9IFsgeCx5IF1cbiAgbHQubmFtZSA9IGx0LmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGx0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbHRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCggJHtpbnB1dHNbMF19IDw9ICR7aW5wdXRzWzFdfSB8IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPD0gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0LmlucHV0cyA9IFsgeCx5IF1cbiAgbHQubmFtZSA9ICdsdGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGx0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbHRwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19ICkgfCAwICkgKWAgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqICgoIGlucHV0c1swXSA8IGlucHV0c1sxXSApIHwgMCApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGx0cCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBsdHAuaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBsdHBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtYXgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBpc1dvcmtsZXQgPyAnTWF0aC5tYXgnIDogTWF0aC5tYXggfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfW1heCggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1heCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICksIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbWF4ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1heC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIG1heFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J21lbW8nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKGluMSxtZW1vTmFtZSkgPT4ge1xuICBsZXQgbWVtbyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIG1lbW8uaW5wdXRzID0gWyBpbjEgXVxuICBtZW1vLmlkICAgPSBnZW4uZ2V0VUlEKClcbiAgbWVtby5uYW1lID0gbWVtb05hbWUgIT09IHVuZGVmaW5lZCA/IG1lbW9OYW1lICsgJ18nICsgZ2VuLmdldFVJRCgpIDogYCR7bWVtby5iYXNlbmFtZX0ke21lbW8uaWR9YFxuXG4gIHJldHVybiBtZW1vXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbWluJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGgubWluJyA6IE1hdGgubWluIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1taW4oICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5taW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1pbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtaW4uaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIsIHQ9LjUgKSA9PiB7XG4gIGxldCB1Z2VuID0gbWVtbyggYWRkKCBtdWwoaW4xLCBzdWIoMSx0ICkgKSwgbXVsKCBpbjIsIHQgKSApIClcbiAgdWdlbi5uYW1lID0gJ21peCcgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IG1vZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICAgIG1vZEF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgJSB2XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9ICUgJHt2fWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnICUgJyBcbiAgICAgIH0pXG5cbiAgICAgIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIG1vZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtc3Rvc2FtcHMnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHJldHVyblZhbHVlXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lIH0gPSAke2dlbi5zYW1wbGVyYXRlfSAvIDEwMDAgKiAke2lucHV0c1swXX0gXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBnZW4uc2FtcGxlcmF0ZSAvIDEwMDAgKiB0aGlzLmlucHV0c1swXVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH0gICAgXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbXN0b3NhbXBzID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1zdG9zYW1wcy5pbnB1dHMgPSBbIHggXVxuICBtc3Rvc2FtcHMubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG1zdG9zYW1wc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J210b2YnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCggJHt0aGlzLnR1bmluZ30gKiBnZW4uZXhwKCAuMDU3NzYyMjY1ICogKCR7aW5wdXRzWzBdfSAtIDY5KSApIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gdGhpcy50dW5pbmcgKiBNYXRoLmV4cCggLjA1Nzc2MjI2NSAqICggaW5wdXRzWzBdIC0gNjkpIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCBwcm9wcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IHR1bmluZzo0NDAgfVxuICBcbiAgaWYoIHByb3BzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBwcm9wcy5kZWZhdWx0cyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgZGVmYXVsdHMgKVxuICB1Z2VuLmlucHV0cyA9IFsgeCBdXG4gIFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdtdWwnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCxcbiAgICAgICAgc3VtID0gMSwgbnVtQ291bnQgPSAwLCBtdWxBdEVuZCA9IGZhbHNlLCBhbHJlYWR5RnVsbFN1bW1lZCA9IHRydWVcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgIG11bEF0RW5kID0gdHJ1ZVxuICAgICAgICAgIG91dCArPSAnICogJ1xuICAgICAgICB9XG4gICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gZmFsc2VcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggaSA9PT0gMCApIHtcbiAgICAgICAgICBzdW0gPSB2XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN1bSAqPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgfVxuICAgICAgICBudW1Db3VudCsrXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICBvdXQgKz0gbXVsQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICogJyArIHN1bVxuICAgIH1cblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGNvbnN0IG11bCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIG11bCwge1xuICAgICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6IGFyZ3MsXG4gIH0pXG4gIFxuICBtdWwubmFtZSA9IG11bC5iYXNlbmFtZSArIG11bC5pZFxuXG4gIHJldHVybiBtdWxcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J25lcScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gLyp0aGlzLmlucHV0c1swXSAhPT0gdGhpcy5pbnB1dHNbMV0gPyAxIDoqLyBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gJHtpbnB1dHNbMV19KSB8IDBcXG5cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidub2lzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXRcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ25vaXNlJyA6IGlzV29ya2xldCA/ICdNYXRoLnJhbmRvbScgOiBNYXRoLnJhbmRvbSB9KVxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9ICR7cmVmfW5vaXNlKClcXG5gXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IG5vaXNlID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBub2lzZS5uYW1lID0gcHJvdG8ubmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBub2lzZVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vdCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19ID09PSAwID8gMSA6IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gIWlucHV0c1swXSA9PT0gMCA/IDEgOiAwXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm90ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG5vdC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBub3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGFuJywgXG4gIGluaXRUYWJsZSgpIHsgICAgXG4gICAgbGV0IGJ1ZmZlckwgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0ICksXG4gICAgICAgIGJ1ZmZlclIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICAgIGNvbnN0IGFuZ1RvUmFkID0gTWF0aC5QSSAvIDE4MFxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMTAyNDsgaSsrICkgeyBcbiAgICAgIGxldCBwYW4gPSBpICogKCA5MCAvIDEwMjQgKVxuICAgICAgYnVmZmVyTFtpXSA9IE1hdGguY29zKCBwYW4gKiBhbmdUb1JhZCApIFxuICAgICAgYnVmZmVyUltpXSA9IE1hdGguc2luKCBwYW4gKiBhbmdUb1JhZCApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMucGFuTCA9IGRhdGEoIGJ1ZmZlckwsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSlcbiAgICBnZW4uZ2xvYmFscy5wYW5SID0gZGF0YSggYnVmZmVyUiwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9KVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGxlZnRJbnB1dCwgcmlnaHRJbnB1dCwgcGFuID0uNSwgcHJvcGVydGllcyApID0+IHtcbiAgaWYoIGdlbi5nbG9iYWxzLnBhbkwgPT09IHVuZGVmaW5lZCApIHByb3RvLmluaXRUYWJsZSgpXG5cbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGxlZnRJbnB1dCwgcmlnaHRJbnB1dCBdLFxuICAgIGxlZnQ6ICAgIG11bCggbGVmdElucHV0LCBwZWVrKCBnZW4uZ2xvYmFscy5wYW5MLCBwYW4sIHsgYm91bmRtb2RlOidjbGFtcCcgfSkgKSxcbiAgICByaWdodDogICBtdWwoIHJpZ2h0SW5wdXQsIHBlZWsoIGdlbi5nbG9iYWxzLnBhblIsIHBhbiwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSApXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTogJ3BhcmFtJyxcblxuICBnZW4oKSB7XG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBnZW4ucGFyYW1zLmFkZCggdGhpcyApXG5cbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgICBpZiggaXNXb3JrbGV0ICkgZ2VuLnBhcmFtZXRlcnMuYWRkKCB0aGlzLm5hbWUgKVxuXG4gICAgdGhpcy52YWx1ZSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpc1dvcmtsZXQgPyB0aGlzLm5hbWUgOiBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gXG5cbiAgICByZXR1cm4gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBwcm9wTmFtZT0wLCB2YWx1ZT0wLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgaWYoIHR5cGVvZiBwcm9wTmFtZSAhPT0gJ3N0cmluZycgKSB7XG4gICAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gcHJvcE5hbWVcbiAgfWVsc2V7XG4gICAgdWdlbi5uYW1lID0gcHJvcE5hbWVcbiAgICB1Z2VuLmluaXRpYWxWYWx1ZSA9IHZhbHVlXG4gIH1cblxuICB1Z2VuLm1pbiA9IG1pblxuICB1Z2VuLm1heCA9IG1heFxuICB1Z2VuLmRlZmF1bHRWYWx1ZSA9IHVnZW4uaW5pdGlhbFZhbHVlXG5cbiAgLy8gZm9yIHN0b3Jpbmcgd29ya2xldCBub2RlcyBvbmNlIHRoZXkncmUgaW5zdGFudGlhdGVkXG4gIHVnZW4ud2FhcGkgPSBudWxsXG5cbiAgdWdlbi5pc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gdGhpcy5pbml0aWFsVmFsdWVcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGlmKCB0aGlzLmlzV29ya2xldCAmJiB0aGlzLndhYXBpICE9PSBudWxsICkge1xuICAgICAgICAgIHRoaXMud2FhcGkudmFsdWUgPSB2XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2XG4gICAgICAgIH0gXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiXG5jb25zdCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICAgIGRhdGFVZ2VuID0gcmVxdWlyZSgnLi9kYXRhLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGVlaycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCwgZnVuY3Rpb25Cb2R5LCBuZXh0LCBsZW5ndGhJc0xvZzIsIGlkeFxuICAgIFxuICAgIGlkeCA9IGlucHV0c1sxXVxuICAgIGxlbmd0aElzTG9nMiA9IChNYXRoLmxvZzIoIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoICkgfCAwKSAgPT09IE1hdGgubG9nMiggdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKVxuXG4gICAgaWYoIHRoaXMubW9kZSAhPT0gJ3NpbXBsZScgKSB7XG5cbiAgICBmdW5jdGlvbkJvZHkgPSBgICB2YXIgJHt0aGlzLm5hbWV9X2RhdGFJZHggID0gJHtpZHh9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9waGFzZSA9ICR7dGhpcy5tb2RlID09PSAnc2FtcGxlcycgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCkgfSwgXG4gICAgICAke3RoaXMubmFtZX1faW5kZXggPSAke3RoaXMubmFtZX1fcGhhc2UgfCAwLFxcbmBcblxuICAgIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ3dyYXAnICkge1xuICAgICAgbmV4dCA9IGxlbmd0aElzTG9nMiA/XG4gICAgICBgKCAke3RoaXMubmFtZX1faW5kZXggKyAxICkgJiAoJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gLSAxKWAgOlxuICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gPyAke3RoaXMubmFtZX1faW5kZXggKyAxIC0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH1lbHNlIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2NsYW1wJyApIHtcbiAgICAgIG5leHQgPSBcbiAgICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9ID8gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9IGVsc2UgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnZm9sZCcgfHwgdGhpcy5ib3VuZG1vZGUgPT09ICdtaXJyb3InICkge1xuICAgICAgbmV4dCA9IFxuICAgICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gPyAke3RoaXMubmFtZX1faW5kZXggLSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH1lbHNle1xuICAgICAgIG5leHQgPSBcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxYCAgICAgXG4gICAgfVxuXG4gICAgaWYoIHRoaXMuaW50ZXJwID09PSAnbGluZWFyJyApIHsgICAgICBcbiAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9mcmFjICA9ICR7dGhpcy5uYW1lfV9waGFzZSAtICR7dGhpcy5uYW1lfV9pbmRleCxcbiAgICAgICR7dGhpcy5uYW1lfV9iYXNlICA9IG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAgJHt0aGlzLm5hbWV9X2luZGV4IF0sXG4gICAgICAke3RoaXMubmFtZX1fbmV4dCAgPSAke25leHR9LGBcbiAgICAgIFxuICAgICAgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnaWdub3JlJyApIHtcbiAgICAgICAgZnVuY3Rpb25Cb2R5ICs9IGBcbiAgICAgICR7dGhpcy5uYW1lfV9vdXQgICA9ICR7dGhpcy5uYW1lfV9pbmRleCA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gfHwgJHt0aGlzLm5hbWV9X2luZGV4IDwgMCA/IDAgOiAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X25leHQgXSAtICR7dGhpcy5uYW1lfV9iYXNlIClcXG5cXG5gXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZnVuY3Rpb25Cb2R5ICs9IGBcbiAgICAgICR7dGhpcy5uYW1lfV9vdXQgICA9ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoIG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1fbmV4dCBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKVxcblxcbmBcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGZ1bmN0aW9uQm9keSArPSBgICAgICAgJHt0aGlzLm5hbWV9X291dCA9IG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1faW5kZXggXVxcblxcbmBcbiAgICB9XG5cbiAgICB9IGVsc2UgeyAvLyBtb2RlIGlzIHNpbXBsZVxuICAgICAgZnVuY3Rpb25Cb2R5ID0gYG1lbW9yeVsgJHtpZHh9ICsgJHsgaW5wdXRzWzBdIH0gXWBcbiAgICAgIFxuICAgICAgcmV0dXJuIGZ1bmN0aW9uQm9keVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfb3V0J1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lKydfb3V0JywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBkZWZhdWx0cyA6IHsgY2hhbm5lbHM6MSwgbW9kZToncGhhc2UnLCBpbnRlcnA6J2xpbmVhcicsIGJvdW5kbW9kZTond3JhcCcgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5wdXRfZGF0YSwgaW5kZXg9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgLy9jb25zb2xlLmxvZyggZGF0YVVnZW4sIGdlbi5kYXRhIClcblxuICAvLyBYWFggd2h5IGlzIGRhdGFVZ2VuIG5vdCB0aGUgYWN0dWFsIGZ1bmN0aW9uPyBzb21lIHR5cGUgb2YgYnJvd3NlcmlmeSBub25zZW5zZS4uLlxuICBjb25zdCBmaW5hbERhdGEgPSB0eXBlb2YgaW5wdXRfZGF0YS5iYXNlbmFtZSA9PT0gJ3VuZGVmaW5lZCcgPyBnZW4ubGliLmRhdGEoIGlucHV0X2RhdGEgKSA6IGlucHV0X2RhdGFcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBcbiAgICB7IFxuICAgICAgJ2RhdGEnOiAgICAgZmluYWxEYXRhLFxuICAgICAgZGF0YU5hbWU6ICAgZmluYWxEYXRhLm5hbWUsXG4gICAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6ICAgICBbIGluZGV4LCBmaW5hbERhdGEgXSxcbiAgICB9LFxuICAgIHByb3RvLmRlZmF1bHRzLFxuICAgIHByb3BlcnRpZXMgXG4gIClcbiAgXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuXG4gIHJldHVybiB1Z2VuXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW0gPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBtdWwgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwcm90byA9IHsgYmFzZW5hbWU6J3BoYXNvcicgfSxcbiAgICBkaXYgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKVxuXG5jb25zdCBkZWZhdWx0cyA9IHsgbWluOiAtMSwgbWF4OiAxIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeSA9IDEsIHJlc2V0ID0gMCwgX3Byb3BzICkgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgX3Byb3BzIClcblxuICBjb25zdCByYW5nZSA9IHByb3BzLm1heCAtIHByb3BzLm1pblxuXG4gIGNvbnN0IHVnZW4gPSB0eXBlb2YgZnJlcXVlbmN5ID09PSAnbnVtYmVyJyBcbiAgICA/IGFjY3VtKCAoZnJlcXVlbmN5ICogcmFuZ2UpIC8gZ2VuLnNhbXBsZXJhdGUsIHJlc2V0LCBwcm9wcyApIFxuICAgIDogYWNjdW0oIFxuICAgICAgICBkaXYoIFxuICAgICAgICAgIG11bCggZnJlcXVlbmN5LCByYW5nZSApLFxuICAgICAgICAgIGdlbi5zYW1wbGVyYXRlXG4gICAgICAgICksIFxuICAgICAgICByZXNldCwgcHJvcHMgXG4gICAgKVxuXG4gIHVnZW4ubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsICA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcC5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Bva2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZGF0YU5hbWUgPSAnbWVtb3J5JyxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBpZHgsIG91dCwgd3JhcHBlZFxuICAgIFxuICAgIGlkeCA9IHRoaXMuZGF0YS5nZW4oKVxuXG4gICAgLy9nZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIC8vd3JhcHBlZCA9IHdyYXAoIHRoaXMuaW5wdXRzWzFdLCAwLCB0aGlzLmRhdGFMZW5ndGggKS5nZW4oKVxuICAgIC8vaWR4ID0gd3JhcHBlZFswXVxuICAgIC8vZ2VuLmZ1bmN0aW9uQm9keSArPSB3cmFwcGVkWzFdXG4gICAgbGV0IG91dHB1dFN0ciA9IHRoaXMuaW5wdXRzWzFdID09PSAwID9cbiAgICAgIGAgICR7ZGF0YU5hbWV9WyAke2lkeH0gXSA9ICR7aW5wdXRzWzBdfVxcbmAgOlxuICAgICAgYCAgJHtkYXRhTmFtZX1bICR7aWR4fSArICR7aW5wdXRzWzFdfSBdID0gJHtpbnB1dHNbMF19XFxuYFxuXG4gICAgaWYoIHRoaXMuaW5saW5lID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IG91dHB1dFN0clxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIFsgdGhpcy5pbmxpbmUsIG91dHB1dFN0ciBdXG4gICAgfVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9ICggZGF0YSwgdmFsdWUsIGluZGV4LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6MSB9IFxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBkYXRhLFxuICAgIGRhdGFOYW1lOiAgIGRhdGEubmFtZSxcbiAgICBkYXRhTGVuZ3RoOiBkYXRhLmJ1ZmZlci5sZW5ndGgsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgdmFsdWUsIGluZGV4IF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcblxuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuICBcbiAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4ubmFtZSwgdWdlbiApXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG93JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdwb3cnOiBpc1dvcmtsZXQgPyAnTWF0aC5wb3cnIDogTWF0aC5wb3cgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXBvdyggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMF0gPT09ICdzdHJpbmcnICYmIGlucHV0c1swXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMF0gPSBpbnB1dHNbMF0uc2xpY2UoMSwtMSlcbiAgICAgIH1cbiAgICAgIGlmKCB0eXBlb2YgaW5wdXRzWzFdID09PSAnc3RyaW5nJyAmJiBpbnB1dHNbMV1bMF0gPT09ICcoJyApIHtcbiAgICAgICAgaW5wdXRzWzFdID0gaW5wdXRzWzFdLnNsaWNlKDEsLTEpXG4gICAgICB9XG5cbiAgICAgIG91dCA9IE1hdGgucG93KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IHBvdyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBwb3cuaW5wdXRzID0gWyB4LHkgXVxuICBwb3cuaWQgPSBnZW4uZ2V0VUlEKClcbiAgcG93Lm5hbWUgPSBgJHtwb3cuYmFzZW5hbWV9e3Bvdy5pZH1gXG5cbiAgcmV0dXJuIHBvd1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwcm9jZXNzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWycnK3RoaXMuZnVuY25hbWVdIDogdGhpcy5mdW5jIH0pXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gZ2VuWycke3RoaXMuZnVuY25hbWV9J10oYFxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGksYXJyICkgPT4ge1xuICAgICAgb3V0ICs9IGFyclsgaSBdXG4gICAgICBpZiggaSA8IGFyci5sZW5ndGggLSAxICkgb3V0ICs9ICcsJ1xuICAgIH0pXG5cbiAgICBvdXQgKz0gJylcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgY29uc3QgcHJvY2VzcyA9IHt9Ly8gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBjb25zdCBpZCA9IGdlbi5nZXRVSUQoKVxuICBwcm9jZXNzLm5hbWUgPSAncHJvY2VzcycgKyBpZCBcblxuICBwcm9jZXNzLmZ1bmMgPSBuZXcgRnVuY3Rpb24oIC4uLmFyZ3MgKVxuXG4gIC8vZ2VuLmdsb2JhbHNbIHByb2Nlc3MubmFtZSBdID0gcHJvY2Vzcy5mdW5jXG5cbiAgcHJvY2Vzcy5jYWxsID0gZnVuY3Rpb24oIC4uLmFyZ3MgICkge1xuICAgIGNvbnN0IG91dHB1dCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgICBvdXRwdXQuZnVuY25hbWUgPSBwcm9jZXNzLm5hbWVcbiAgICBvdXRwdXQuZnVuYyA9IHByb2Nlc3MuZnVuY1xuICAgIG91dHB1dC5uYW1lID0gJ3Byb2Nlc3Nfb3V0XycgKyBpZFxuICAgIG91dHB1dC5wcm9jZXNzID0gcHJvY2Vzc1xuXG4gICAgb3V0cHV0LmlucHV0cyA9IGFyZ3NcblxuICAgIHJldHVybiBvdXRwdXRcbiAgfVxuXG4gIHJldHVybiBwcm9jZXNzIFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGRlbHRhICAgPSByZXF1aXJlKCAnLi9kZWx0YS5qcycgKSxcbiAgICB3cmFwICAgID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidyYXRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcGhhc2UgID0gaGlzdG9yeSgpLFxuICAgICAgICBpbk1pbnVzMSA9IGhpc3RvcnkoKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZmlsdGVyLCBzdW0sIG91dFxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9kaWZmID0gJHtpbnB1dHNbMF19IC0gJHtnZW5OYW1lfS5sYXN0U2FtcGxlXG4gIGlmKCAke3RoaXMubmFtZX1fZGlmZiA8IC0uNSApICR7dGhpcy5uYW1lfV9kaWZmICs9IDFcbiAgJHtnZW5OYW1lfS5waGFzZSArPSAke3RoaXMubmFtZX1fZGlmZiAqICR7aW5wdXRzWzFdfVxuICBpZiggJHtnZW5OYW1lfS5waGFzZSA+IDEgKSAke2dlbk5hbWV9LnBoYXNlIC09IDFcbiAgJHtnZW5OYW1lfS5sYXN0U2FtcGxlID0gJHtpbnB1dHNbMF19XG5gXG4gICAgb3V0ID0gJyAnICsgb3V0XG5cbiAgICByZXR1cm4gWyBnZW5OYW1lICsgJy5waGFzZScsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgcmF0ZSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBwaGFzZTogICAgICAwLFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCByYXRlIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZToncm91bmQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLnJvdW5kJyA6IE1hdGgucm91bmQgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXJvdW5kKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnJvdW5kKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgcm91bmQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcm91bmQuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gcm91bmRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzYWgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gMFxuICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSArICdfY29udHJvbCcgXSA9IDBcblxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG5cblxuICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X2NvbnRyb2wgPSBtZW1vcnlbJHt0aGlzLm1lbW9yeS5jb250cm9sLmlkeH1dLFxuICAgICAgJHt0aGlzLm5hbWV9X3RyaWdnZXIgPSAke2lucHV0c1sxXX0gPiAke2lucHV0c1syXX0gPyAxIDogMFxuXG4gIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciAhPT0gJHt0aGlzLm5hbWV9X2NvbnRyb2wgICkge1xuICAgIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciA9PT0gMSApIFxuICAgICAgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV0gPSAke2lucHV0c1swXX1cbiAgICBcbiAgICBtZW1vcnlbJHt0aGlzLm1lbW9yeS5jb250cm9sLmlkeH1dID0gJHt0aGlzLm5hbWV9X3RyaWdnZXJcbiAgfVxuYFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAvL2BnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gLCAnICcgK291dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgY29udHJvbCwgdGhyZXNob2xkPTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0OjAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSwgY29udHJvbCx0aHJlc2hvbGQgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGNvbnRyb2w6IHsgaWR4Om51bGwsIGxlbmd0aDoxIH0sXG4gICAgICB2YWx1ZTogICB7IGlkeDpudWxsLCBsZW5ndGg6MSB9LFxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2VsZWN0b3InLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXQsIHJldHVyblZhbHVlID0gMFxuICAgIFxuICAgIHN3aXRjaCggaW5wdXRzLmxlbmd0aCApIHtcbiAgICAgIGNhc2UgMiA6XG4gICAgICAgIHJldHVyblZhbHVlID0gaW5wdXRzWzFdXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzIDpcbiAgICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1swXX0gPT09IDEgPyAke2lucHV0c1sxXX0gOiAke2lucHV0c1syXX1cXG5cXG5gO1xuICAgICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lICsgJ19vdXQnLCBvdXQgXVxuICAgICAgICBicmVhazsgIFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX1fb3V0ID0gMFxuICBzd2l0Y2goICR7aW5wdXRzWzBdfSArIDEgKSB7XFxuYFxuXG4gICAgICAgIGZvciggbGV0IGkgPSAxOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrICl7XG4gICAgICAgICAgb3V0ICs9YCAgICBjYXNlICR7aX06ICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1tpXX07IGJyZWFrO1xcbmAgXG4gICAgICAgIH1cblxuICAgICAgICBvdXQgKz0gJyAgfVxcblxcbidcbiAgICAgICAgXG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsICcgJyArIG91dCBdXG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ19vdXQnXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmlucHV0cyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0c1xuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGNvdW50ZXI9IHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gICAgcGVlayAgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIHNzZCAgID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBkYXRhICA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcHJvdG8gPSB7IGJhc2VuYW1lOidzZXEnIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGR1cmF0aW9ucyA9IDExMDI1LCB2YWx1ZXMgPSBbMCwxXSwgcGhhc2VJbmNyZW1lbnQgPSAxKSA9PiB7XG4gIGxldCBjbG9ja1xuICBcbiAgaWYoIEFycmF5LmlzQXJyYXkoIGR1cmF0aW9ucyApICkge1xuICAgIC8vIHdlIHdhbnQgYSBjb3VudGVyIHRoYXQgaXMgdXNpbmcgb3VyIGN1cnJlbnRcbiAgICAvLyByYXRlIHZhbHVlLCBidXQgd2Ugd2FudCB0aGUgcmF0ZSB2YWx1ZSB0byBiZSBkZXJpdmVkIGZyb21cbiAgICAvLyB0aGUgY291bnRlci4gbXVzdCBpbnNlcnQgYSBzaW5nbGUtc2FtcGxlIGRlYWx5IHRvIGF2b2lkXG4gICAgLy8gaW5maW5pdGUgbG9vcC5cbiAgICBjb25zdCBjbG9jazIgPSBjb3VudGVyKCAwLCAwLCBkdXJhdGlvbnMubGVuZ3RoIClcbiAgICBjb25zdCBfX2R1cmF0aW9ucyA9IHBlZWsoIGRhdGEoIGR1cmF0aW9ucyApLCBjbG9jazIsIHsgbW9kZTonc2ltcGxlJyB9KSBcbiAgICBjbG9jayA9IGNvdW50ZXIoIHBoYXNlSW5jcmVtZW50LCAwLCBfX2R1cmF0aW9ucyApXG4gICAgXG4gICAgLy8gYWRkIG9uZSBzYW1wbGUgZGVsYXkgdG8gYXZvaWQgY29kZWdlbiBsb29wXG4gICAgY29uc3QgcyA9IHNzZCgpXG4gICAgcy5pbiggY2xvY2sud3JhcCApXG4gICAgY2xvY2syLmlucHV0c1swXSA9IHMub3V0XG4gIH1lbHNle1xuICAgIC8vIGlmIHRoZSByYXRlIGFyZ3VtZW50IGlzIGEgc2luZ2xlIHZhbHVlIHdlIGRvbid0IG5lZWQgdG9cbiAgICAvLyBkbyBhbnl0aGluZyB0cmlja3kuXG4gICAgY2xvY2sgPSBjb3VudGVyKCBwaGFzZUluY3JlbWVudCwgMCwgZHVyYXRpb25zIClcbiAgfVxuICBcbiAgY29uc3Qgc3RlcHBlciA9IGFjY3VtKCBjbG9jay53cmFwLCAwLCB7IG1pbjowLCBtYXg6dmFsdWVzLmxlbmd0aCB9KVxuICAgXG4gIGNvbnN0IHVnZW4gPSBwZWVrKCBkYXRhKCB2YWx1ZXMgKSwgc3RlcHBlciwgeyBtb2RlOidzaW1wbGUnIH0pXG5cbiAgdWdlbi5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcbiAgdWdlbi50cmlnZ2VyID0gY2xvY2sud3JhcFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonc2lnbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGguc2lnbicgOiBNYXRoLnNpZ24gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXNpZ24oICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2lnbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpZ24gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2lnbi5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBzaWduXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBpc1dvcmtsZXQgPyAnTWF0aC5zaW4nIDogTWF0aC5zaW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpbi5pbnB1dHMgPSBbIHggXVxuICBzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgc2luLm5hbWUgPSBgJHtzaW4uYmFzZW5hbWV9e3Npbi5pZH1gXG5cbiAgcmV0dXJuIHNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGd0ICAgICAgPSByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgICBkaXYgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIF9zd2l0Y2ggPSByZXF1aXJlKCAnLi9zd2l0Y2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgc2xpZGVVcCA9IDEsIHNsaWRlRG93biA9IDEgKSA9PiB7XG4gIGxldCB5MSA9IGhpc3RvcnkoMCksXG4gICAgICBmaWx0ZXIsIHNsaWRlQW1vdW50XG5cbiAgLy95IChuKSA9IHkgKG4tMSkgKyAoKHggKG4pIC0geSAobi0xKSkvc2xpZGUpIFxuICBzbGlkZUFtb3VudCA9IF9zd2l0Y2goIGd0KGluMSx5MS5vdXQpLCBzbGlkZVVwLCBzbGlkZURvd24gKVxuXG4gIGZpbHRlciA9IG1lbW8oIGFkZCggeTEub3V0LCBkaXYoIHN1YiggaW4xLCB5MS5vdXQgKSwgc2xpZGVBbW91bnQgKSApIClcblxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N1YicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9MCxcbiAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBzdWJBdEVuZCA9IGZhbHNlLFxuICAgICAgICBoYXNVZ2VucyA9IGZhbHNlLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IDBcblxuICAgIHRoaXMuaW5wdXRzLmZvckVhY2goIHZhbHVlID0+IHsgaWYoIGlzTmFOKCB2YWx1ZSApICkgaGFzVWdlbnMgPSB0cnVlIH0pXG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC0gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICByZXR1cm5cbiAgICAgIH1lbHNle1xuICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC0gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGxldCBzdWIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggc3ViLCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzXG4gIH0pXG4gICAgICAgXG4gIHN1Yi5uYW1lID0gJ3N1YicgKyBzdWIuaWRcblxuICByZXR1cm4gc3ViXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzd2l0Y2gnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIGlmKCBpbnB1dHNbMV0gPT09IGlucHV0c1syXSApIHJldHVybiBpbnB1dHNbMV0gLy8gaWYgYm90aCBwb3RlbnRpYWwgb3V0cHV0cyBhcmUgdGhlIHNhbWUganVzdCByZXR1cm4gb25lIG9mIHRoZW1cbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEgPSAxLCBpbjIgPSAwICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbnRyb2wsIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Q2MCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgJ2V4cCcgXTogaXNXb3JrbGV0ID8gJ01hdGguZXhwJyA6IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAke3JlZn1leHAoIC02LjkwNzc1NTI3ODkyMSAvICR7aW5wdXRzWzBdfSApXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gaW5wdXRzWzBdIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9ICAgIFxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHQ2MCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0NjAuaW5wdXRzID0gWyB4IF1cbiAgdDYwLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB0NjBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IGlzV29ya2xldCA/ICdNYXRoLnRhbicgOiBNYXRoLnRhbiB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9dGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdGFuLmlucHV0cyA9IFsgeCBdXG4gIHRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW4ubmFtZSA9IGAke3Rhbi5iYXNlbmFtZX17dGFuLmlkfWBcblxuICByZXR1cm4gdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbmgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAndGFuaCc6IGlzV29ya2xldCA/ICdNYXRoLnRhbicgOiBNYXRoLnRhbmggfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXRhbmgoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbmgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW5oID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbmguaW5wdXRzID0gWyB4IF1cbiAgdGFuaC5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW5oLm5hbWUgPSBgJHt0YW5oLmJhc2VuYW1lfXt0YW5oLmlkfWBcblxuICByZXR1cm4gdGFuaFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGx0ICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBhY2N1bSAgID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgZGl2ICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTQ0MCwgcHVsc2V3aWR0aD0uNSApID0+IHtcbiAgbGV0IGdyYXBoID0gbHQoIGFjY3VtKCBkaXYoIGZyZXF1ZW5jeSwgNDQxMDAgKSApLCBwdWxzZXdpZHRoIClcblxuICBncmFwaC5uYW1lID0gYHRyYWluJHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiBncmFwaFxufVxuXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgQVdQRiA9IHJlcXVpcmUoICcuL2V4dGVybmFsL2F1ZGlvd29ya2xldC1wb2x5ZmlsbC5qcycgKSxcbiAgICAgIGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKVxuXG5sZXQgaXNTdGVyZW8gPSBmYWxzZVxuXG5jb25zdCB1dGlsaXRpZXMgPSB7XG4gIGN0eDogbnVsbCxcbiAgYnVmZmVyczoge30sXG4gIGlzU3RlcmVvOmZhbHNlLFxuXG4gIGNsZWFyKCkge1xuICAgIGlmKCB0aGlzLndvcmtsZXROb2RlICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICB0aGlzLndvcmtsZXROb2RlLmRpc2Nvbm5lY3QoKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5jYWxsYmFjayA9ICgpID0+IDBcbiAgICB9XG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MuZm9yRWFjaCggdiA9PiB2KCkgKVxuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmxlbmd0aCA9IDBcblxuICAgIHRoaXMuaXNTdGVyZW8gPSBmYWxzZVxuXG4gICAgaWYoIGdlbi5ncmFwaCAhPT0gbnVsbCApIGdlbi5mcmVlKCBnZW4uZ3JhcGggKVxuICB9LFxuXG4gIGNyZWF0ZUNvbnRleHQoIGJ1ZmZlclNpemUgPSAyMDQ4ICkge1xuICAgIGNvbnN0IEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHRcbiAgICBcbiAgICAvLyB0ZWxsIHBvbHlmaWxsIGdsb2JhbCBvYmplY3QgYW5kIGJ1ZmZlcnNpemVcbiAgICBBV1BGKCB3aW5kb3csIGJ1ZmZlclNpemUgKVxuXG4gICAgY29uc3Qgc3RhcnQgPSAoKSA9PiB7XG4gICAgICBpZiggdHlwZW9mIEFDICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgdGhpcy5jdHggPSBuZXcgQUMoeyBsYXRlbmN5SGludDouMDEyNSB9KVxuXG4gICAgICAgIGdlbi5zYW1wbGVyYXRlID0gdGhpcy5jdHguc2FtcGxlUmF0ZVxuXG4gICAgICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHN0YXJ0IClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBzdGFydCApXG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgc3RhcnQgKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgIG15U291cmNlLmNvbm5lY3QoIHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24gKVxuICAgICAgICBteVNvdXJjZS5zdGFydCgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG4gICAgfWVsc2V7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIHN0YXJ0IClcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIHN0YXJ0IClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvcigpIHtcbiAgICB0aGlzLm5vZGUgPSB0aGlzLmN0eC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoIDEwMjQsIDAsIDIgKVxuICAgIHRoaXMuY2xlYXJGdW5jdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMCB9XG4gICAgaWYoIHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAndW5kZWZpbmVkJyApIHRoaXMuY2FsbGJhY2sgPSB0aGlzLmNsZWFyRnVuY3Rpb25cblxuICAgIHRoaXMubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKCBhdWRpb1Byb2Nlc3NpbmdFdmVudCApIHtcbiAgICAgIHZhciBvdXRwdXRCdWZmZXIgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXI7XG5cbiAgICAgIHZhciBsZWZ0ID0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAwICksXG4gICAgICAgICAgcmlnaHQ9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMSApLFxuICAgICAgICAgIGlzU3RlcmVvID0gdXRpbGl0aWVzLmlzU3RlcmVvXG5cbiAgICAgZm9yKCB2YXIgc2FtcGxlID0gMDsgc2FtcGxlIDwgbGVmdC5sZW5ndGg7IHNhbXBsZSsrICkge1xuICAgICAgICB2YXIgb3V0ID0gdXRpbGl0aWVzLmNhbGxiYWNrKClcblxuICAgICAgICBpZiggaXNTdGVyZW8gPT09IGZhbHNlICkge1xuICAgICAgICAgIGxlZnRbIHNhbXBsZSBdID0gcmlnaHRbIHNhbXBsZSBdID0gb3V0IFxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgIF0gPSBvdXRbMF1cbiAgICAgICAgICByaWdodFsgc2FtcGxlIF0gPSBvdXRbMV1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubm9kZS5jb25uZWN0KCB0aGlzLmN0eC5kZXN0aW5hdGlvbiApXG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIC8vIHJlbW92ZSBzdGFydGluZyBzdHVmZiBhbmQgYWRkIHRhYnNcbiAgcHJldHR5UHJpbnRDYWxsYmFjayggY2IgKSB7XG4gICAgLy8gZ2V0IHJpZCBvZiBcImZ1bmN0aW9uIGdlblwiIGFuZCBzdGFydCB3aXRoIHBhcmVudGhlc2lzXG4gICAgLy8gY29uc3Qgc2hvcnRlbmRDQiA9IGNiLnRvU3RyaW5nKCkuc2xpY2UoOSlcbiAgICBjb25zdCBjYlNwbGl0ID0gY2IudG9TdHJpbmcoKS5zcGxpdCgnXFxuJylcbiAgICBjb25zdCBjYlRyaW0gPSBjYlNwbGl0LnNsaWNlKCAzLCAtMiApXG4gICAgY29uc3QgY2JUYWJiZWQgPSBjYlRyaW0ubWFwKCB2ID0+ICcgICAgICAnICsgdiApIFxuICAgIFxuICAgIHJldHVybiBjYlRhYmJlZC5qb2luKCdcXG4nKVxuICB9LFxuXG4gIGNyZWF0ZVBhcmFtZXRlckRlc2NyaXB0b3JzKCBjYiApIHtcbiAgICAvLyBbe25hbWU6ICdhbXBsaXR1ZGUnLCBkZWZhdWx0VmFsdWU6IDAuMjUsIG1pblZhbHVlOiAwLCBtYXhWYWx1ZTogMX1dO1xuICAgIGxldCBwYXJhbVN0ciA9ICcnXG5cbiAgICAvL2ZvciggbGV0IHVnZW4gb2YgY2IucGFyYW1zLnZhbHVlcygpICkge1xuICAgIC8vICBwYXJhbVN0ciArPSBgeyBuYW1lOicke3VnZW4ubmFtZX0nLCBkZWZhdWx0VmFsdWU6JHt1Z2VuLnZhbHVlfSwgbWluVmFsdWU6JHt1Z2VuLm1pbn0sIG1heFZhbHVlOiR7dWdlbi5tYXh9IH0sXFxuICAgICAgYFxuICAgIC8vfVxuICAgIGZvciggbGV0IHVnZW4gb2YgY2IucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgcGFyYW1TdHIgKz0gYHsgbmFtZTonJHt1Z2VuLm5hbWV9JywgYXV0b21hdGlvblJhdGU6J2stcmF0ZScsIGRlZmF1bHRWYWx1ZToke3VnZW4uZGVmYXVsdFZhbHVlfSwgbWluVmFsdWU6JHt1Z2VuLm1pbn0sIG1heFZhbHVlOiR7dWdlbi5tYXh9IH0sXFxuICAgICAgYFxuICAgIH1cbiAgICByZXR1cm4gcGFyYW1TdHJcbiAgfSxcblxuICBjcmVhdGVQYXJhbWV0ZXJEZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBzdHIgPSBjYi5wYXJhbXMuc2l6ZSA+IDAgPyAnXFxuICAgICAgJyA6ICcnXG4gICAgZm9yKCBsZXQgdWdlbiBvZiBjYi5wYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICBzdHIgKz0gYGNvbnN0ICR7dWdlbi5uYW1lfSA9IHBhcmFtZXRlcnMuJHt1Z2VuLm5hbWV9WzBdXFxuICAgICAgYFxuICAgIH1cblxuICAgIHJldHVybiBzdHJcbiAgfSxcblxuICBjcmVhdGVQYXJhbWV0ZXJBcmd1bWVudHMoIGNiICkge1xuICAgIGxldCAgcGFyYW1MaXN0ID0gJydcbiAgICBmb3IoIGxldCB1Z2VuIG9mIGNiLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgIHBhcmFtTGlzdCArPSB1Z2VuLm5hbWUgKyAnW2ldLCdcbiAgICB9XG4gICAgcGFyYW1MaXN0ID0gcGFyYW1MaXN0LnNsaWNlKCAwLCAtMSApXG5cbiAgICByZXR1cm4gcGFyYW1MaXN0XG4gIH0sXG5cbiAgY3JlYXRlSW5wdXREZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBzdHIgPSBjYi5pbnB1dHMuc2l6ZSA+IDAgPyAnXFxuJyA6ICcnXG4gICAgZm9yKCBsZXQgaW5wdXQgb2YgIGNiLmlucHV0cy52YWx1ZXMoKSApIHtcbiAgICAgIHN0ciArPSBgY29uc3QgJHtpbnB1dC5uYW1lfSA9IGlucHV0c1sgJHtpbnB1dC5pbnB1dE51bWJlcn0gXVsgJHtpbnB1dC5jaGFubmVsTnVtYmVyfSBdXFxuICAgICAgYFxuICAgIH1cblxuICAgIHJldHVybiBzdHJcbiAgfSxcblxuXG4gIGNyZWF0ZUlucHV0QXJndW1lbnRzKCBjYiApIHtcbiAgICBsZXQgIHBhcmFtTGlzdCA9ICcnXG4gICAgZm9yKCBsZXQgaW5wdXQgb2YgY2IuaW5wdXRzLnZhbHVlcygpICkge1xuICAgICAgcGFyYW1MaXN0ICs9IGlucHV0Lm5hbWUgKyAnW2ldLCdcbiAgICB9XG4gICAgcGFyYW1MaXN0ID0gcGFyYW1MaXN0LnNsaWNlKCAwLCAtMSApXG5cbiAgICByZXR1cm4gcGFyYW1MaXN0XG4gIH0sXG4gICAgICBcbiAgY3JlYXRlRnVuY3Rpb25EZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBtZW1iZXJTdHJpbmcgPSBjYi5tZW1iZXJzLnNpemUgPiAwID8gJ1xcbicgOiAnJ1xuICAgIGxldCBtZW1vID0ge31cbiAgICBmb3IoIGxldCBkaWN0IG9mIGNiLm1lbWJlcnMudmFsdWVzKCkgKSB7XG4gICAgICBjb25zdCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICAgIHZhbHVlID0gZGljdFsgbmFtZSBdXG5cbiAgICAgIGlmKCBtZW1vWyBuYW1lIF0gIT09IHVuZGVmaW5lZCApIGNvbnRpbnVlXG4gICAgICBtZW1vWyBuYW1lIF0gPSB0cnVlXG5cbiAgICAgIG1lbWJlclN0cmluZyArPSBgICAgICAgY29uc3QgJHtuYW1lfSA9ICR7dmFsdWV9XFxuYFxuICAgIH1cblxuICAgIHJldHVybiBtZW1iZXJTdHJpbmdcbiAgfSxcblxuICBjcmVhdGVXb3JrbGV0UHJvY2Vzc29yKCBncmFwaCwgbmFtZSwgZGVidWcsIG1lbT00NDEwMCoxMCApIHtcbiAgICAvL2NvbnN0IG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIDQwOTYsIEZsb2F0NjRBcnJheSApXG4gICAgY29uc3QgY2IgPSBnZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBtZW0sIGRlYnVnIClcbiAgICBjb25zdCBpbnB1dHMgPSBjYi5pbnB1dHNcblxuICAgIC8vIGdldCBhbGwgaW5wdXRzIGFuZCBjcmVhdGUgYXBwcm9wcmlhdGUgYXVkaW9wYXJhbSBpbml0aWFsaXplcnNcbiAgICBjb25zdCBwYXJhbWV0ZXJEZXNjcmlwdG9ycyA9IHRoaXMuY3JlYXRlUGFyYW1ldGVyRGVzY3JpcHRvcnMoIGNiIClcbiAgICBjb25zdCBwYXJhbWV0ZXJEZXJlZmVyZW5jZXMgPSB0aGlzLmNyZWF0ZVBhcmFtZXRlckRlcmVmZXJlbmNlcyggY2IgKVxuICAgIGNvbnN0IHBhcmFtTGlzdCA9IHRoaXMuY3JlYXRlUGFyYW1ldGVyQXJndW1lbnRzKCBjYiApXG4gICAgY29uc3QgaW5wdXREZXJlZmVyZW5jZXMgPSB0aGlzLmNyZWF0ZUlucHV0RGVyZWZlcmVuY2VzKCBjYiApXG4gICAgY29uc3QgaW5wdXRMaXN0ID0gdGhpcy5jcmVhdGVJbnB1dEFyZ3VtZW50cyggY2IgKSAgIFxuICAgIGNvbnN0IG1lbWJlclN0cmluZyA9IHRoaXMuY3JlYXRlRnVuY3Rpb25EZXJlZmVyZW5jZXMoIGNiIClcblxuICAgIC8vIGNoYW5nZSBvdXRwdXQgYmFzZWQgb24gbnVtYmVyIG9mIGNoYW5uZWxzLlxuICAgIGNvbnN0IGdlbmlzaE91dHB1dExpbmUgPSBjYi5pc1N0ZXJlbyA9PT0gZmFsc2VcbiAgICAgID8gYGxlZnRbIGkgXSA9IG1lbW9yeVswXWBcbiAgICAgIDogYGxlZnRbIGkgXSA9IG1lbW9yeVswXTtcXG5cXHRcXHRyaWdodFsgaSBdID0gbWVtb3J5WzFdXFxuYFxuXG4gICAgY29uc3QgcHJldHR5Q2FsbGJhY2sgPSB0aGlzLnByZXR0eVByaW50Q2FsbGJhY2soIGNiIClcblxuICAgIC8qKioqKiBiZWdpbiBjYWxsYmFjayBjb2RlICoqKiovXG4gICAgLy8gbm90ZSB0aGF0IHdlIGhhdmUgdG8gY2hlY2sgdG8gc2VlIHRoYXQgbWVtb3J5IGhhcyBiZWVuIHBhc3NlZFxuICAgIC8vIHRvIHRoZSB3b3JrZXIgYmVmb3JlIHJ1bm5pbmcgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLCBvdGhlcndpc2VcbiAgICAvLyBpdCBjYW4gYmUgcGFzc2VkIHRvbyBzbG93bHkgYW5kIGZhaWwgb24gb2NjYXNzaW9uXG5cbiAgICBjb25zdCB3b3JrbGV0Q29kZSA9IGBcbmNsYXNzICR7bmFtZX1Qcm9jZXNzb3IgZXh0ZW5kcyBBdWRpb1dvcmtsZXRQcm9jZXNzb3Ige1xuXG4gIHN0YXRpYyBnZXQgcGFyYW1ldGVyRGVzY3JpcHRvcnMoKSB7XG4gICAgY29uc3QgcGFyYW1zID0gW1xuICAgICAgJHsgcGFyYW1ldGVyRGVzY3JpcHRvcnMgfSAgICAgIFxuICAgIF1cbiAgICByZXR1cm4gcGFyYW1zXG4gIH1cbiBcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XG4gICAgc3VwZXIoIG9wdGlvbnMgKVxuICAgIHRoaXMucG9ydC5vbm1lc3NhZ2UgPSB0aGlzLmhhbmRsZU1lc3NhZ2UuYmluZCggdGhpcyApXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlXG4gIH1cblxuICBoYW5kbGVNZXNzYWdlKCBldmVudCApIHtcbiAgICBpZiggZXZlbnQuZGF0YS5rZXkgPT09ICdpbml0JyApIHtcbiAgICAgIHRoaXMubWVtb3J5ID0gZXZlbnQuZGF0YS5tZW1vcnlcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgfWVsc2UgaWYoIGV2ZW50LmRhdGEua2V5ID09PSAnc2V0JyApIHtcbiAgICAgIHRoaXMubWVtb3J5WyBldmVudC5kYXRhLmlkeCBdID0gZXZlbnQuZGF0YS52YWx1ZVxuICAgIH1lbHNlIGlmKCBldmVudC5kYXRhLmtleSA9PT0gJ2dldCcgKSB7XG4gICAgICB0aGlzLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3JldHVybicsIGlkeDpldmVudC5kYXRhLmlkeCwgdmFsdWU6dGhpcy5tZW1vcnlbZXZlbnQuZGF0YS5pZHhdIH0pICAgICBcbiAgICB9XG4gIH1cblxuICBwcm9jZXNzKCBpbnB1dHMsIG91dHB1dHMsIHBhcmFtZXRlcnMgKSB7XG4gICAgaWYoIHRoaXMuaW5pdGlhbGl6ZWQgPT09IHRydWUgKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBvdXRwdXRzWzBdXG4gICAgICBjb25zdCBsZWZ0ICAgPSBvdXRwdXRbIDAgXVxuICAgICAgY29uc3QgcmlnaHQgID0gb3V0cHV0WyAxIF1cbiAgICAgIGNvbnN0IGxlbiAgICA9IGxlZnQubGVuZ3RoXG4gICAgICBjb25zdCBtZW1vcnkgPSB0aGlzLm1lbW9yeSAke3BhcmFtZXRlckRlcmVmZXJlbmNlc30ke2lucHV0RGVyZWZlcmVuY2VzfSR7bWVtYmVyU3RyaW5nfVxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IGxlbjsgKytpICkge1xuICAgICAgICAke3ByZXR0eUNhbGxiYWNrfVxuICAgICAgICAke2dlbmlzaE91dHB1dExpbmV9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cbiAgICBcbnJlZ2lzdGVyUHJvY2Vzc29yKCAnJHtuYW1lfScsICR7bmFtZX1Qcm9jZXNzb3IpYFxuXG4gICAgXG4gICAgLyoqKioqIGVuZCBjYWxsYmFjayBjb2RlICoqKioqL1xuXG5cbiAgICBpZiggZGVidWcgPT09IHRydWUgKSBjb25zb2xlLmxvZyggd29ya2xldENvZGUgKVxuXG4gICAgY29uc3QgdXJsID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoXG4gICAgICBuZXcgQmxvYihcbiAgICAgICAgWyB3b3JrbGV0Q29kZSBdLCBcbiAgICAgICAgeyB0eXBlOiAndGV4dC9qYXZhc2NyaXB0JyB9XG4gICAgICApXG4gICAgKVxuXG4gICAgcmV0dXJuIFsgdXJsLCB3b3JrbGV0Q29kZSwgaW5wdXRzLCBjYi5wYXJhbXMsIGNiLmlzU3RlcmVvIF0gXG4gIH0sXG5cbiAgcmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50OiBbXSxcbiAgcmVnaXN0ZXIoIHVnZW4gKSB7XG4gICAgaWYoIHRoaXMucmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50LmluZGV4T2YoIHVnZW4gKSA9PT0gLTEgKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyZWRGb3JOb2RlQXNzaWdubWVudC5wdXNoKCB1Z2VuIClcbiAgICB9XG4gIH0sXG5cbiAgcGxheVdvcmtsZXQoIGdyYXBoLCBuYW1lLCBkZWJ1Zz1mYWxzZSwgbWVtPTQ0MTAwICogNjAgKSB7XG4gICAgdXRpbGl0aWVzLmNsZWFyKClcblxuICAgIGNvbnN0IFsgdXJsLCBjb2RlU3RyaW5nLCBpbnB1dHMsIHBhcmFtcywgaXNTdGVyZW8gXSA9IHV0aWxpdGllcy5jcmVhdGVXb3JrbGV0UHJvY2Vzc29yKCBncmFwaCwgbmFtZSwgZGVidWcsIG1lbSApXG5cbiAgICBjb25zdCBub2RlUHJvbWlzZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSxyZWplY3QpID0+IHtcbiAgIFxuICAgICAgdXRpbGl0aWVzLmN0eC5hdWRpb1dvcmtsZXQuYWRkTW9kdWxlKCB1cmwgKS50aGVuKCAoKT0+IHtcbiAgICAgICAgY29uc3Qgd29ya2xldE5vZGUgPSBuZXcgQXVkaW9Xb3JrbGV0Tm9kZSggdXRpbGl0aWVzLmN0eCwgbmFtZSwgeyBvdXRwdXRDaGFubmVsQ291bnQ6WyBpc1N0ZXJlbyA/IDIgOiAxIF0gfSlcblxuICAgICAgICB3b3JrbGV0Tm9kZS5jYWxsYmFja3MgPSB7fVxuICAgICAgICB3b3JrbGV0Tm9kZS5vbm1lc3NhZ2UgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgICAgaWYoIGV2ZW50LmRhdGEubWVzc2FnZSA9PT0gJ3JldHVybicgKSB7XG4gICAgICAgICAgICB3b3JrbGV0Tm9kZS5jYWxsYmFja3NbIGV2ZW50LmRhdGEuaWR4IF0oIGV2ZW50LmRhdGEudmFsdWUgKVxuICAgICAgICAgICAgZGVsZXRlIHdvcmtsZXROb2RlLmNhbGxiYWNrc1sgZXZlbnQuZGF0YS5pZHggXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHdvcmtsZXROb2RlLmdldE1lbW9yeVZhbHVlID0gZnVuY3Rpb24oIGlkeCwgY2IgKSB7XG4gICAgICAgICAgdGhpcy53b3JrbGV0Q2FsbGJhY2tzWyBpZHggXSA9IGNiXG4gICAgICAgICAgdGhpcy53b3JrbGV0Tm9kZS5wb3J0LnBvc3RNZXNzYWdlKHsga2V5OidnZXQnLCBpZHg6IGlkeCB9KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB3b3JrbGV0Tm9kZS5wb3J0LnBvc3RNZXNzYWdlKHsga2V5Oidpbml0JywgbWVtb3J5Omdlbi5tZW1vcnkuaGVhcCB9KVxuICAgICAgICB1dGlsaXRpZXMud29ya2xldE5vZGUgPSB3b3JrbGV0Tm9kZVxuXG4gICAgICAgIHV0aWxpdGllcy5yZWdpc3RlcmVkRm9yTm9kZUFzc2lnbm1lbnQuZm9yRWFjaCggdWdlbiA9PiB1Z2VuLm5vZGUgPSB3b3JrbGV0Tm9kZSApXG4gICAgICAgIHV0aWxpdGllcy5yZWdpc3RlcmVkRm9yTm9kZUFzc2lnbm1lbnQubGVuZ3RoID0gMFxuXG4gICAgICAgIC8vIGFzc2lnbiBhbGwgcGFyYW1zIGFzIHByb3BlcnRpZXMgb2Ygbm9kZSBmb3IgZWFzaWVyIHJlZmVyZW5jZSBcbiAgICAgICAgZm9yKCBsZXQgZGljdCBvZiBpbnB1dHMudmFsdWVzKCkgKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF1cbiAgICAgICAgICBjb25zdCBwYXJhbSA9IHdvcmtsZXROb2RlLnBhcmFtZXRlcnMuZ2V0KCBuYW1lIClcbiAgICAgIFxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggd29ya2xldE5vZGUsIG5hbWUsIHtcbiAgICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgICAgcGFyYW0udmFsdWUgPSB2XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGFyYW0udmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yKCBsZXQgdWdlbiBvZiBwYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHVnZW4ubmFtZVxuICAgICAgICAgIGNvbnN0IHBhcmFtID0gd29ya2xldE5vZGUucGFyYW1ldGVycy5nZXQoIG5hbWUgKVxuICAgICAgICAgIHVnZW4ud2FhcGkgPSBwYXJhbSBcbiAgICAgICAgICAvLyBpbml0aWFsaXplP1xuICAgICAgICAgIHBhcmFtLnZhbHVlID0gdWdlbi5kZWZhdWx0VmFsdWVcblxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggd29ya2xldE5vZGUsIG5hbWUsIHtcbiAgICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgICAgcGFyYW0udmFsdWUgPSB2XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGFyYW0udmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoIHV0aWxpdGllcy5jb25zb2xlICkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUoIGNvZGVTdHJpbmcgKVxuXG4gICAgICAgIHdvcmtsZXROb2RlLmNvbm5lY3QoIHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24gKVxuXG4gICAgICAgIHJlc29sdmUoIHdvcmtsZXROb2RlIClcbiAgICAgIH0pXG5cbiAgICB9KVxuXG4gICAgcmV0dXJuIG5vZGVQcm9taXNlXG4gIH0sXG4gIFxuICBwbGF5R3JhcGgoIGdyYXBoLCBkZWJ1ZywgbWVtPTQ0MTAwKjEwLCBtZW1UeXBlPUZsb2F0MzJBcnJheSApIHtcbiAgICB1dGlsaXRpZXMuY2xlYXIoKVxuICAgIGlmKCBkZWJ1ZyA9PT0gdW5kZWZpbmVkICkgZGVidWcgPSBmYWxzZVxuICAgICAgICAgIFxuICAgIHRoaXMuaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCBncmFwaCApXG5cbiAgICB1dGlsaXRpZXMuY2FsbGJhY2sgPSBnZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBtZW0sIGRlYnVnLCBmYWxzZSwgbWVtVHlwZSApXG4gICAgXG4gICAgaWYoIHV0aWxpdGllcy5jb25zb2xlICkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUoIHV0aWxpdGllcy5jYWxsYmFjay50b1N0cmluZygpIClcblxuICAgIHJldHVybiB1dGlsaXRpZXMuY2FsbGJhY2tcbiAgfSxcblxuICBsb2FkU2FtcGxlKCBzb3VuZEZpbGVQYXRoLCBkYXRhICkge1xuICAgIGNvbnN0IGlzTG9hZGVkID0gdXRpbGl0aWVzLmJ1ZmZlcnNbIHNvdW5kRmlsZVBhdGggXSAhPT0gdW5kZWZpbmVkXG5cbiAgICBsZXQgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcbiAgICByZXEub3BlbiggJ0dFVCcsIHNvdW5kRmlsZVBhdGgsIHRydWUgKVxuICAgIHJlcS5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInIFxuICAgIFxuICAgIGxldCBwcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLHJlamVjdCkgPT4ge1xuICAgICAgaWYoICFpc0xvYWRlZCApIHtcbiAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBhdWRpb0RhdGEgPSByZXEucmVzcG9uc2VcblxuICAgICAgICAgIHV0aWxpdGllcy5jdHguZGVjb2RlQXVkaW9EYXRhKCBhdWRpb0RhdGEsIChidWZmZXIpID0+IHtcbiAgICAgICAgICAgIGRhdGEuYnVmZmVyID0gYnVmZmVyLmdldENoYW5uZWxEYXRhKDApXG4gICAgICAgICAgICB1dGlsaXRpZXMuYnVmZmVyc1sgc291bmRGaWxlUGF0aCBdID0gZGF0YS5idWZmZXJcbiAgICAgICAgICAgIHJlc29sdmUoIGRhdGEuYnVmZmVyIClcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9ZWxzZXtcbiAgICAgICAgc2V0VGltZW91dCggKCk9PiByZXNvbHZlKCB1dGlsaXRpZXMuYnVmZmVyc1sgc291bmRGaWxlUGF0aCBdICksIDAgKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiggIWlzTG9hZGVkICkgcmVxLnNlbmQoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG59XG5cbnV0aWxpdGllcy5jbGVhci5jYWxsYmFja3MgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxpdGllc1xuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qXG4gKiBtYW55IHdpbmRvd3MgaGVyZSBhZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2NvcmJhbmJyb29rL2RzcC5qcy9ibG9iL21hc3Rlci9kc3AuanNcbiAqIHN0YXJ0aW5nIGF0IGxpbmUgMTQyN1xuICogdGFrZW4gOC8xNS8xNlxuKi8gXG5cbmNvbnN0IHdpbmRvd3MgPSBtb2R1bGUuZXhwb3J0cyA9IHsgXG4gIGJhcnRsZXR0KCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAyIC8gKGxlbmd0aCAtIDEpICogKChsZW5ndGggLSAxKSAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKSBcbiAgfSxcblxuICBiYXJ0bGV0dEhhbm4oIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNjIgLSAwLjQ4ICogTWF0aC5hYnMoaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAwLjUpIC0gMC4zOCAqIE1hdGguY29zKCAyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGJsYWNrbWFuKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICBsZXQgYTAgPSAoMSAtIGFscGhhKSAvIDIsXG4gICAgICAgIGExID0gMC41LFxuICAgICAgICBhMiA9IGFscGhhIC8gMlxuXG4gICAgcmV0dXJuIGEwIC0gYTEgKiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSArIGEyICogTWF0aC5jb3MoNCAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBjb3NpbmUoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIE1hdGguY29zKE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIE1hdGguUEkgLyAyKVxuICB9LFxuXG4gIGdhdXNzKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICByZXR1cm4gTWF0aC5wb3coTWF0aC5FLCAtMC41ICogTWF0aC5wb3coKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikgLyAoYWxwaGEgKiAobGVuZ3RoIC0gMSkgLyAyKSwgMikpXG4gIH0sXG5cbiAgaGFtbWluZyggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC41NCAtIDAuNDYgKiBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBoYW5uKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjUgKiAoMSAtIE1hdGguY29zKCBNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSApXG4gIH0sXG5cbiAgbGFuY3pvcyggbGVuZ3RoLCBpbmRleCApIHtcbiAgICBsZXQgeCA9IDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIDE7XG4gICAgcmV0dXJuIE1hdGguc2luKE1hdGguUEkgKiB4KSAvIChNYXRoLlBJICogeClcbiAgfSxcblxuICByZWN0YW5ndWxhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMVxuICB9LFxuXG4gIHRyaWFuZ3VsYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDIgLyBsZW5ndGggKiAobGVuZ3RoIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpXG4gIH0sXG5cbiAgLy8gcGFyYWJvbGFcbiAgd2VsY2goIGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0PTAgKSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgY29uc3QgaW5kZXggPSBzaGlmdCA9PT0gMCA/IF9pbmRleCA6IChfaW5kZXggKyBNYXRoLmZsb29yKCBzaGlmdCAqIGxlbmd0aCApKSAlIGxlbmd0aFxuICAgIGNvbnN0IG5fMV9vdmVyMiA9IChsZW5ndGggLSAxKSAvIDIgXG5cbiAgICByZXR1cm4gMSAtIE1hdGgucG93KCAoIGluZGV4IC0gbl8xX292ZXIyICkgLyBuXzFfb3ZlcjIsIDIgKVxuICB9LFxuICBpbnZlcnNld2VsY2goIGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0PTAgKSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgbGV0IGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vciggc2hpZnQgKiBsZW5ndGggKSkgJSBsZW5ndGhcbiAgICBjb25zdCBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyXG5cbiAgICByZXR1cm4gTWF0aC5wb3coICggaW5kZXggLSBuXzFfb3ZlcjIgKSAvIG5fMV9vdmVyMiwgMiApXG4gIH0sXG5cbiAgcGFyYWJvbGEoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgaWYoIGluZGV4IDw9IGxlbmd0aCAvIDIgKSB7XG4gICAgICByZXR1cm4gd2luZG93cy5pbnZlcnNld2VsY2goIGxlbmd0aCAvIDIsIGluZGV4ICkgLSAxXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gMSAtIHdpbmRvd3MuaW52ZXJzZXdlbGNoKCBsZW5ndGggLyAyLCBpbmRleCAtIGxlbmd0aCAvIDIgKVxuICAgIH1cbiAgfSxcblxuICBleHBvbmVudGlhbCggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KCBpbmRleCAvIGxlbmd0aCwgYWxwaGEgKVxuICB9LFxuXG4gIGxpbmVhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gaW5kZXggLyBsZW5ndGhcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vcj0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiAgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid3cmFwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgc2lnbmFsID0gaW5wdXRzWzBdLCBtaW4gPSBpbnB1dHNbMV0sIG1heCA9IGlucHV0c1syXSxcbiAgICAgICAgb3V0LCBkaWZmXG5cbiAgICAvL291dCA9IGAoKCgke2lucHV0c1swXX0gLSAke3RoaXMubWlufSkgJSAke2RpZmZ9ICArICR7ZGlmZn0pICUgJHtkaWZmfSArICR7dGhpcy5taW59KWBcbiAgICAvL2NvbnN0IGxvbmcgbnVtV3JhcHMgPSBsb25nKCh2LWxvKS9yYW5nZSkgLSAodiA8IGxvKTtcbiAgICAvL3JldHVybiB2IC0gcmFuZ2UgKiBkb3VibGUobnVtV3JhcHMpOyAgIFxuICAgIFxuICAgIGlmKCB0aGlzLm1pbiA9PT0gMCApIHtcbiAgICAgIGRpZmYgPSBtYXhcbiAgICB9ZWxzZSBpZiAoIGlzTmFOKCBtYXggKSB8fCBpc05hTiggbWluICkgKSB7XG4gICAgICBkaWZmID0gYCR7bWF4fSAtICR7bWlufWBcbiAgICB9ZWxzZXtcbiAgICAgIGRpZmYgPSBtYXggLSBtaW5cbiAgICB9XG5cbiAgICBvdXQgPVxuYCB2YXIgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XG4gIGlmKCAke3RoaXMubmFtZX0gPCAke3RoaXMubWlufSApICR7dGhpcy5uYW1lfSArPSAke2RpZmZ9XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA+ICR7dGhpcy5tYXh9ICkgJHt0aGlzLm5hbWV9IC09ICR7ZGlmZn1cblxuYFxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCAnICcgKyBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgbWluLCBtYXggXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuICgnICsgZXIgKyAnKScpO1xuICAgICAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgICAgICB0aHJvdyBlcnI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24odHlwZSkge1xuICBpZiAodGhpcy5fZXZlbnRzKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgICBpZiAoaXNGdW5jdGlvbihldmxpc3RlbmVyKSlcbiAgICAgIHJldHVybiAxO1xuICAgIGVsc2UgaWYgKGV2bGlzdGVuZXIpXG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIE1lbW9yeUhlbHBlciA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIHNpemUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyA0MDk2IDogYXJndW1lbnRzWzBdO1xuICAgIHZhciBtZW10eXBlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gRmxvYXQzMkFycmF5IDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIGhlbHBlciA9IE9iamVjdC5jcmVhdGUodGhpcyk7XG5cbiAgICBPYmplY3QuYXNzaWduKGhlbHBlciwge1xuICAgICAgaGVhcDogbmV3IG1lbXR5cGUoc2l6ZSksXG4gICAgICBsaXN0OiB7fSxcbiAgICAgIGZyZWVMaXN0OiB7fVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGhlbHBlcjtcbiAgfSxcbiAgYWxsb2M6IGZ1bmN0aW9uIGFsbG9jKGFtb3VudCkge1xuICAgIHZhciBpZHggPSAtMTtcblxuICAgIGlmIChhbW91bnQgPiB0aGlzLmhlYXAubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBFcnJvcignQWxsb2NhdGlvbiByZXF1ZXN0IGlzIGxhcmdlciB0aGFuIGhlYXAgc2l6ZSBvZiAnICsgdGhpcy5oZWFwLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuZnJlZUxpc3QpIHtcbiAgICAgIHZhciBjYW5kaWRhdGVTaXplID0gdGhpcy5mcmVlTGlzdFtrZXldO1xuXG4gICAgICBpZiAoY2FuZGlkYXRlU2l6ZSA+PSBhbW91bnQpIHtcbiAgICAgICAgaWR4ID0ga2V5O1xuXG4gICAgICAgIHRoaXMubGlzdFtpZHhdID0gYW1vdW50O1xuXG4gICAgICAgIGlmIChjYW5kaWRhdGVTaXplICE9PSBhbW91bnQpIHtcbiAgICAgICAgICB2YXIgbmV3SW5kZXggPSBpZHggKyBhbW91bnQsXG4gICAgICAgICAgICAgIG5ld0ZyZWVTaXplID0gdm9pZCAwO1xuXG4gICAgICAgICAgZm9yICh2YXIgX2tleSBpbiB0aGlzLmxpc3QpIHtcbiAgICAgICAgICAgIGlmIChfa2V5ID4gbmV3SW5kZXgpIHtcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSBfa2V5IC0gbmV3SW5kZXg7XG4gICAgICAgICAgICAgIHRoaXMuZnJlZUxpc3RbbmV3SW5kZXhdID0gbmV3RnJlZVNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGlkeCAhPT0gLTEgKSBkZWxldGUgdGhpcy5mcmVlTGlzdFsgaWR4IF1cblxuICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMubGlzdCksXG4gICAgICAgICAgbGFzdEluZGV4ID0gdm9pZCAwO1xuXG4gICAgICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gaWYgbm90IGZpcnN0IGFsbG9jYXRpb24uLi5cbiAgICAgICAgbGFzdEluZGV4ID0gcGFyc2VJbnQoa2V5c1trZXlzLmxlbmd0aCAtIDFdKTtcblxuICAgICAgICBpZHggPSBsYXN0SW5kZXggKyB0aGlzLmxpc3RbbGFzdEluZGV4XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlkeCA9IDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGlzdFtpZHhdID0gYW1vdW50O1xuICAgIH1cblxuICAgIGlmIChpZHggKyBhbW91bnQgPj0gdGhpcy5oZWFwLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ05vIGF2YWlsYWJsZSBibG9ja3MgcmVtYWluIHN1ZmZpY2llbnQgZm9yIGFsbG9jYXRpb24gcmVxdWVzdC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGlkeDtcbiAgfSxcbiAgZnJlZTogZnVuY3Rpb24gZnJlZShpbmRleCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5saXN0W2luZGV4XSAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IEVycm9yKCdDYWxsaW5nIGZyZWUoKSBvbiBub24tZXhpc3RpbmcgYmxvY2suJyk7XG4gICAgfVxuXG4gICAgdGhpcy5saXN0W2luZGV4XSA9IDA7XG5cbiAgICB2YXIgc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMubGlzdCkge1xuICAgICAgaWYgKGtleSA+IGluZGV4KSB7XG4gICAgICAgIHNpemUgPSBrZXkgLSBpbmRleDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5mcmVlTGlzdFtpbmRleF0gPSBzaXplO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUhlbHBlcjtcbiJdfQ==
