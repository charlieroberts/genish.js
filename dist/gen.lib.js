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

},{"./gen.js":33}],2:[function(require,module,exports){
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

},{"./gen.js":33}],3:[function(require,module,exports){
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

},{"./gen.js":33}],4:[function(require,module,exports){
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
    }
    //else{
    //  gen.memory.heap[ completeFlag.memory.values.idx ] = 0
    //}
    _bang.trigger();
  };

  return out;
};

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":19,"./div.js":24,"./env.js":25,"./gen.js":33,"./gte.js":35,"./ifelseif.js":38,"./lt.js":41,"./memo.js":45,"./mul.js":51,"./neq.js":52,"./peek.js":57,"./poke.js":61,"./sub.js":72,"./utilities.js":78}],5:[function(require,module,exports){
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

},{"./gen.js":33}],6:[function(require,module,exports){
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

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":19,"./div.js":24,"./env.js":25,"./gen.js":33,"./gtp.js":36,"./ifelseif.js":38,"./lt.js":41,"./mul.js":51,"./neq.js":52,"./not.js":54,"./param.js":56,"./peek.js":57,"./poke.js":61,"./sub.js":72}],7:[function(require,module,exports){
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

},{"./gen.js":33}],8:[function(require,module,exports){
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

},{"./gen.js":33}],9:[function(require,module,exports){
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

},{"./gen.js":33}],10:[function(require,module,exports){
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

},{"./gen.js":33,"./history.js":37,"./mul.js":51,"./sub.js":72}],11:[function(require,module,exports){
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

},{"./gen.js":33}],12:[function(require,module,exports){
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

},{"./gen.js":33}],13:[function(require,module,exports){
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

},{"./gen.js":33}],14:[function(require,module,exports){
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

},{"./floor.js":30,"./gen.js":33,"./memo.js":45,"./sub.js":72}],15:[function(require,module,exports){
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

},{"./gen.js":33}],16:[function(require,module,exports){
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

},{"./gen.js":33}],17:[function(require,module,exports){
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

},{"./data.js":19,"./gen.js":33,"./mul.js":51,"./peek.js":57,"./phasor.js":59}],18:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./phasor.js'),
    data = require('./data.js'),
    peek = require('./peek.js'),
    mul = require('./mul.js'),
    add = require('./add.js'),
    phasor = require('./phasor.js');

var proto = {
  basename: 'cycleN',

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

  var ugen = mul(add(1, peek(gen.globals.cycle, phasor(frequency, reset, props))), .5);
  ugen.name = 'cycle' + gen.getUID();

  return ugen;
};

},{"./add.js":5,"./data.js":19,"./gen.js":33,"./mul.js":51,"./peek.js":57,"./phasor.js":59}],19:[function(require,module,exports){
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
    onload: properties !== undefined ? properties.onload || null : null,
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
        //gen.once( 'memory init', ()=> {
        //  console.log( "CALLED", ugen.memory )
        //  gen.requestMemory( ugen.memory, ugen.immutable ) 
        //  gen.memory.heap.set( _buffer, ugen.memory.values.idx )
        //  if( typeof ugen.onload === 'function' ) ugen.onload( _buffer ) 
        //})

        resolve(ugen);
      });
    });
  } else if (proto.memo[x] !== undefined) {

    _gen.once('memory init', function () {
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

},{"./gen.js":33,"./peek.js":57,"./poke.js":61,"./utilities.js":78}],20:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":33,"./history.js":37,"./memo.js":45,"./mul.js":51,"./sub.js":72}],21:[function(require,module,exports){
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

},{"./gen.js":33,"./history.js":37,"./mul.js":51,"./t60.js":74}],22:[function(require,module,exports){
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

},{"./accum.js":2,"./data.js":19,"./gen.js":33,"./memo.js":45,"./peek.js":57,"./poke.js":61,"./sub.js":72,"./wrap.js":80}],23:[function(require,module,exports){
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

},{"./gen.js":33,"./history.js":37,"./sub.js":72}],24:[function(require,module,exports){
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

},{"./gen.js":33}],25:[function(require,module,exports){
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

},{"./data":19,"./gen":33,"./peek":57,"./phasor":59,"./windows":79}],26:[function(require,module,exports){
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

},{"./gen.js":33}],27:[function(require,module,exports){
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

},{"./gen.js":33}],28:[function(require,module,exports){
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

},{"./realm.js":29}],29:[function(require,module,exports){
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

},{}],30:[function(require,module,exports){
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

},{"./gen.js":33}],31:[function(require,module,exports){
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

},{"./gen.js":33}],32:[function(require,module,exports){
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

},{"./gen.js":33}],33:[function(require,module,exports){
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
  createMemory: function createMemory() {
    var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4096;
    var type = arguments[1];

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
    } else {
      this.memory = mem;
    }

    this.outputIdx = this.memory.alloc(2, true);
    this.emit('memory init');

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
    callback.out = this.memory.heap.subarray(this.outputIdx, this.outputIdx + 2);
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

},{"events":81,"memory-helper":82}],34:[function(require,module,exports){
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

},{"./gen.js":33}],35:[function(require,module,exports){
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

},{"./gen.js":33}],36:[function(require,module,exports){
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

},{"./gen.js":33}],37:[function(require,module,exports){
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

},{"./gen.js":33}],38:[function(require,module,exports){
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

},{"./gen.js":33}],39:[function(require,module,exports){
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

    _gen.memo[this.name] = isWorklet === true ? this.name + '[i]' : this.name;

    return _gen.memo[this.name];
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

},{"./gen.js":33}],40:[function(require,module,exports){
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
  phasorN: require('./phasorN.js'),
  data: require('./data.js'),
  peek: require('./peek.js'),
  peekDyn: require('./peekDyn.js'),
  cycle: require('./cycle.js'),
  cycleN: require('./cycleN.js'),
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

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./cycleN.js":18,"./data.js":19,"./dcblock.js":20,"./decay.js":21,"./delay.js":22,"./delta.js":23,"./div.js":24,"./env.js":25,"./eq.js":26,"./exp.js":27,"./floor.js":30,"./fold.js":31,"./gate.js":32,"./gen.js":33,"./gt.js":34,"./gte.js":35,"./gtp.js":36,"./history.js":37,"./ifelseif.js":38,"./in.js":39,"./lt.js":41,"./lte.js":42,"./ltp.js":43,"./max.js":44,"./memo.js":45,"./min.js":46,"./mix.js":47,"./mod.js":48,"./mstosamps.js":49,"./mtof.js":50,"./mul.js":51,"./neq.js":52,"./noise.js":53,"./not.js":54,"./pan.js":55,"./param.js":56,"./peek.js":57,"./peekDyn.js":58,"./phasor.js":59,"./phasorN.js":60,"./poke.js":61,"./pow.js":62,"./process.js":63,"./rate.js":64,"./round.js":65,"./sah.js":66,"./selector.js":67,"./seq.js":68,"./sign.js":69,"./sin.js":70,"./slide.js":71,"./sub.js":72,"./switch.js":73,"./t60.js":74,"./tan.js":75,"./tanh.js":76,"./train.js":77,"./utilities.js":78,"./windows.js":79,"./wrap.js":80}],41:[function(require,module,exports){
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

},{"./gen.js":33}],42:[function(require,module,exports){
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

},{"./gen.js":33}],43:[function(require,module,exports){
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

},{"./gen.js":33}],44:[function(require,module,exports){
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

},{"./gen.js":33}],45:[function(require,module,exports){
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

},{"./gen.js":33}],46:[function(require,module,exports){
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

},{"./gen.js":33}],47:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":33,"./memo.js":45,"./mul.js":51,"./sub.js":72}],48:[function(require,module,exports){
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

},{"./gen.js":33}],49:[function(require,module,exports){
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

},{"./gen.js":33}],50:[function(require,module,exports){
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

},{"./gen.js":33}],51:[function(require,module,exports){
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

},{"./gen.js":33}],52:[function(require,module,exports){
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

},{"./gen.js":33}],53:[function(require,module,exports){
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

},{"./gen.js":33}],54:[function(require,module,exports){
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

},{"./gen.js":33}],55:[function(require,module,exports){
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

},{"./data.js":19,"./gen.js":33,"./mul.js":51,"./peek.js":57}],56:[function(require,module,exports){
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
    ugen.min = value;
    ugen.max = min;
  } else {
    ugen.name = propName;
    ugen.min = min;
    ugen.max = max;
    ugen.initialValue = value;
  }

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
          this.waapi[propName].value = v;
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

},{"./gen.js":33}],57:[function(require,module,exports){
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

},{"./data.js":19,"./gen.js":33}],58:[function(require,module,exports){
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
        indexer = void 0,
        dataStart = void 0,
        length = void 0;

    // data object codegens to its starting index
    dataStart = inputs[0];
    length = inputs[1];
    indexer = inputs[2];

    //lengthIsLog2 = (Math.log2( length ) | 0)  === Math.log2( length )

    if (this.mode !== 'simple') {

      functionBody = '  var ' + this.name + '_dataIdx  = ' + dataStart + ', \n        ' + this.name + '_phase = ' + (this.mode === 'samples' ? indexer : indexer + ' * ' + length) + ', \n        ' + this.name + '_index = ' + this.name + '_phase | 0,\n';

      if (this.boundmode === 'wrap') {
        next = this.name + '_index + 1 >= ' + length + ' ? ' + this.name + '_index + 1 - ' + length + ' : ' + this.name + '_index + 1';
      } else if (this.boundmode === 'clamp') {
        next = this.name + '_index + 1 >= ' + length + ' -1 ? ' + length + ' - 1 : ' + this.name + '_index + 1';
      } else if (this.boundmode === 'fold' || this.boundmode === 'mirror') {
        next = this.name + '_index + 1 >= ' + length + ' - 1 ? ' + this.name + '_index - ' + length + ' - 1 : ' + this.name + '_index + 1';
      } else {
        next = this.name + '_index + 1';
      }

      if (this.interp === 'linear') {
        functionBody += '      ' + this.name + '_frac  = ' + this.name + '_phase - ' + this.name + '_index,\n        ' + this.name + '_base  = memory[ ' + this.name + '_dataIdx +  ' + this.name + '_index ],\n        ' + this.name + '_next  = ' + next + ',';

        if (this.boundmode === 'ignore') {
          functionBody += '\n        ' + this.name + '_out   = ' + this.name + '_index >= ' + length + ' - 1 || ' + this.name + '_index < 0 ? 0 : ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
        } else {
          functionBody += '\n        ' + this.name + '_out   = ' + this.name + '_base + ' + this.name + '_frac * ( memory[ ' + this.name + '_dataIdx + ' + this.name + '_next ] - ' + this.name + '_base )\n\n';
        }
      } else {
        functionBody += '      ' + this.name + '_out = memory[ ' + this.name + '_dataIdx + ' + this.name + '_index ]\n\n';
      }
    } else {
      // mode is simple
      functionBody = 'memory[ ' + dataStart + ' + ' + indexer + ' ]';

      return functionBody;
    }

    _gen.memo[this.name] = this.name + '_out';

    return [this.name + '_out', functionBody];
  },


  defaults: { channels: 1, mode: 'phase', interp: 'linear', boundmode: 'wrap' }
};

module.exports = function (input_data, length) {
  var index = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
  var properties = arguments[3];

  var ugen = Object.create(proto);

  // XXX why is dataUgen not the actual function? some type of browserify nonsense...
  var finalData = typeof input_data.basename === 'undefined' ? _gen.lib.data(input_data) : input_data;

  Object.assign(ugen, {
    'data': finalData,
    dataName: finalData.name,
    uid: _gen.getUID(),
    inputs: [input_data, length, index, finalData]
  }, proto.defaults, properties);

  ugen.name = ugen.basename + ugen.uid;

  return ugen;
};

},{"./data.js":19,"./gen.js":33}],59:[function(require,module,exports){
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

},{"./accum.js":2,"./div.js":24,"./gen.js":33,"./mul.js":51}],60:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    accum = require('./accum.js'),
    mul = require('./mul.js'),
    proto = { basename: 'phasorN' },
    div = require('./div.js');

var defaults = { min: 0, max: 1 };

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

},{"./accum.js":2,"./div.js":24,"./gen.js":33,"./mul.js":51}],61:[function(require,module,exports){
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

},{"./gen.js":33,"./mul.js":51,"./wrap.js":80}],62:[function(require,module,exports){
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

},{"./gen.js":33}],63:[function(require,module,exports){
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

},{"./gen.js":33}],64:[function(require,module,exports){
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

},{"./add.js":5,"./delta.js":23,"./gen.js":33,"./history.js":37,"./memo.js":45,"./mul.js":51,"./sub.js":72,"./wrap.js":80}],65:[function(require,module,exports){
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

},{"./gen.js":33}],66:[function(require,module,exports){
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

},{"./gen.js":33}],67:[function(require,module,exports){
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

},{"./gen.js":33}],68:[function(require,module,exports){
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

},{"./accum.js":2,"./counter.js":16,"./data.js":19,"./gen.js":33,"./history.js":37,"./peek.js":57}],69:[function(require,module,exports){
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

},{"./gen.js":33}],70:[function(require,module,exports){
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

},{"./gen.js":33}],71:[function(require,module,exports){
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

},{"./add.js":5,"./div.js":24,"./gen.js":33,"./gt.js":34,"./history.js":37,"./memo.js":45,"./mul.js":51,"./sub.js":72,"./switch.js":73}],72:[function(require,module,exports){
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

},{"./gen.js":33}],73:[function(require,module,exports){
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

},{"./gen.js":33}],74:[function(require,module,exports){
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

},{"./gen.js":33}],75:[function(require,module,exports){
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

},{"./gen.js":33}],76:[function(require,module,exports){
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

},{"./gen.js":33}],77:[function(require,module,exports){
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

},{"./accum.js":2,"./div.js":24,"./gen.js":33,"./lt.js":41}],78:[function(require,module,exports){
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

    var __eval = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    var kernel = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

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

    // if __eval, provide the ability of eval code in worklet
    var evalString = __eval ? ' else if( event.data.key === \'eval\' ) {\n        eval( event.data.code )\n      }\n' : '';

    var kernelFncString = 'this.kernel = function( memory ) {\n      ' + prettyCallback + '\n    }';
    /***** begin callback code ****/
    // note that we have to check to see that memory has been passed
    // to the worker before running the callback function, otherwise
    // it can be passed too slowly and fail on occassion

    console.log("KERNEL", kernel);
    var workletCode = '\nclass ' + name + 'Processor extends AudioWorkletProcessor {\n\n  static get parameterDescriptors() {\n    const params = [\n      ' + parameterDescriptors + '      \n    ]\n    return params\n  }\n \n  constructor( options ) {\n    super( options )\n    this.port.onmessage = this.handleMessage.bind( this )\n    this.initialized = false\n    ' + (kernel ? kernelFncString : '') + '\n  }\n\n  handleMessage( event ) {\n    if( event.data.key === \'init\' ) {\n      this.memory = event.data.memory\n      this.initialized = true\n    }else if( event.data.key === \'set\' ) {\n      this.memory[ event.data.idx ] = event.data.value\n    }else if( event.data.key === \'get\' ) {\n      this.port.postMessage({ key:\'return\', idx:event.data.idx, value:this.memory[event.data.idx] })     \n    }' + evalString + '\n  }\n\n  process( inputs, outputs, parameters ) {\n    if( this.initialized === true ) {\n      const output = outputs[0]\n      const left   = output[ 0 ]\n      const right  = output[ 1 ]\n      const len    = left.length\n      const memory = this.memory ' + parameterDereferences + inputDereferences + memberString + '\n      ' + (kernel === true ? 'const kernel = this.kernel' : '') + '\n\n      for( let i = 0; i < len; ++i ) {\n        ' + (kernel === true ? 'kernel( memory )\n' : prettyCallback) + '\n        ' + genishOutputLine + '\n      }\n    }\n    return true\n  }\n}\n    \nregisterProcessor( \'' + name + '\', ' + name + 'Processor)';

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

    var __eval = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

    var kernel = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

    utilities.clear();

    var _utilities$createWork = utilities.createWorkletProcessor(graph, name, debug, mem, __eval, kernel),
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

},{"./data.js":19,"./external/audioworklet-polyfill.js":28,"./gen.js":33}],79:[function(require,module,exports){
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

},{}],80:[function(require,module,exports){
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

},{"./floor.js":30,"./gen.js":33,"./memo.js":45,"./sub.js":72}],81:[function(require,module,exports){
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

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],82:[function(require,module,exports){
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
      //throw Error('Calling free() on non-existing block.');
      console.warn('calling free() on non-existing block:', index, this.list )
      return
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

},{}]},{},[40])(40)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZC5qcyIsImpzL2FkZC5qcyIsImpzL2Fkc3IuanMiLCJqcy9hbmQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2F0dGFjay5qcyIsImpzL2JhbmcuanMiLCJqcy9ib29sLmpzIiwianMvY2VpbC5qcyIsImpzL2NsYW1wLmpzIiwianMvY29zLmpzIiwianMvY291bnRlci5qcyIsImpzL2N5Y2xlLmpzIiwianMvY3ljbGVOLmpzIiwianMvZGF0YS5qcyIsImpzL2RjYmxvY2suanMiLCJqcy9kZWNheS5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9lbnYuanMiLCJqcy9lcS5qcyIsImpzL2V4cC5qcyIsImpzL2V4dGVybmFsL2F1ZGlvd29ya2xldC1wb2x5ZmlsbC5qcyIsImpzL2V4dGVybmFsL3JlYWxtLmpzIiwianMvZmxvb3IuanMiLCJqcy9mb2xkLmpzIiwianMvZ2F0ZS5qcyIsImpzL2dlbi5qcyIsImpzL2d0LmpzIiwianMvZ3RlLmpzIiwianMvZ3RwLmpzIiwianMvaGlzdG9yeS5qcyIsImpzL2lmZWxzZWlmLmpzIiwianMvaW4uanMiLCJqcy9pbmRleC5qcyIsImpzL2x0LmpzIiwianMvbHRlLmpzIiwianMvbHRwLmpzIiwianMvbWF4LmpzIiwianMvbWVtby5qcyIsImpzL21pbi5qcyIsImpzL21peC5qcyIsImpzL21vZC5qcyIsImpzL21zdG9zYW1wcy5qcyIsImpzL210b2YuanMiLCJqcy9tdWwuanMiLCJqcy9uZXEuanMiLCJqcy9ub2lzZS5qcyIsImpzL25vdC5qcyIsImpzL3Bhbi5qcyIsImpzL3BhcmFtLmpzIiwianMvcGVlay5qcyIsImpzL3BlZWtEeW4uanMiLCJqcy9waGFzb3IuanMiLCJqcy9waGFzb3JOLmpzIiwianMvcG9rZS5qcyIsImpzL3Bvdy5qcyIsImpzL3Byb2Nlc3MuanMiLCJqcy9yYXRlLmpzIiwianMvcm91bmQuanMiLCJqcy9zYWguanMiLCJqcy9zZWxlY3Rvci5qcyIsImpzL3NlcS5qcyIsImpzL3NpZ24uanMiLCJqcy9zaW4uanMiLCJqcy9zbGlkZS5qcyIsImpzL3N1Yi5qcyIsImpzL3N3aXRjaC5qcyIsImpzL3Q2MC5qcyIsImpzL3Rhbi5qcyIsImpzL3RhbmguanMiLCJqcy90cmFpbi5qcyIsImpzL3V0aWxpdGllcy5qcyIsImpzL3dpbmRvd3MuanMiLCJqcy93cmFwLmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvbWVtb3J5LWhlbHBlci9pbmRleC50cmFuc3BpbGVkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsUUFBSyxLQURLOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLFFBQU0sWUFBWSxLQUFJLElBQUosS0FBYSxTQUEvQjtBQUNBLFFBQU0sTUFBTSxZQUFZLEVBQVosR0FBaUIsTUFBN0I7O0FBRUEsUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQUosRUFBeUI7QUFDdkIsV0FBSSxRQUFKLENBQWEsR0FBYixxQkFBcUIsS0FBSyxJQUExQixFQUFrQyxZQUFZLFVBQVosR0FBeUIsS0FBSyxHQUFoRTs7QUFFQSxZQUFTLEdBQVQsYUFBb0IsT0FBTyxDQUFQLENBQXBCO0FBRUQsS0FMRCxNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBcEJTLENBQVo7O0FBdUJBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVY7O0FBRUEsTUFBSSxNQUFKLEdBQWEsQ0FBRSxDQUFGLENBQWI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FORDs7O0FDM0JBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLE9BREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksYUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7QUFBQSxRQUVJLFVBQVUsU0FBUyxLQUFLLElBRjVCO0FBQUEsUUFHSSxxQkFISjs7QUFLQSxTQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4Qjs7QUFFQSxTQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbkMsSUFBMkMsS0FBSyxZQUFoRDs7QUFFQSxtQkFBZSxLQUFLLFFBQUwsQ0FBZSxPQUFmLEVBQXdCLE9BQU8sQ0FBUCxDQUF4QixFQUFtQyxPQUFPLENBQVAsQ0FBbkMsY0FBd0QsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUExRSxPQUFmOztBQUVBOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQUwsR0FBWSxRQUFwQzs7QUFFQSxXQUFPLENBQUUsS0FBSyxJQUFMLEdBQVksUUFBZCxFQUF3QixZQUF4QixDQUFQO0FBQ0QsR0FwQlM7QUFzQlYsVUF0QlUsb0JBc0JBLEtBdEJBLEVBc0JPLEtBdEJQLEVBc0JjLE1BdEJkLEVBc0JzQixRQXRCdEIsRUFzQmlDO0FBQ3pDLFFBQUksT0FBTyxLQUFLLEdBQUwsR0FBVyxLQUFLLEdBQTNCO0FBQUEsUUFDSSxNQUFNLEVBRFY7QUFBQSxRQUVJLE9BQU8sRUFGWDs7QUFJQTs7Ozs7Ozs7QUFRQTtBQUNBLFFBQUksRUFBRSxPQUFPLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBUCxLQUEwQixRQUExQixJQUFzQyxLQUFLLE1BQUwsQ0FBWSxDQUFaLElBQWlCLENBQXpELENBQUosRUFBa0U7QUFDaEUsVUFBSSxLQUFLLFVBQUwsS0FBb0IsS0FBSyxHQUE3QixFQUFtQzs7QUFFakMsMEJBQWdCLE1BQWhCLGVBQWdDLFFBQWhDLFdBQThDLEtBQUssVUFBbkQ7QUFDQTtBQUNELE9BSkQsTUFJSztBQUNILDBCQUFnQixNQUFoQixlQUFnQyxRQUFoQyxXQUE4QyxLQUFLLEdBQW5EO0FBQ0E7QUFDRDtBQUNGOztBQUVELHNCQUFnQixLQUFLLElBQXJCLGlCQUFxQyxRQUFyQzs7QUFFQSxRQUFJLEtBQUssVUFBTCxLQUFvQixLQUFwQixJQUE2QixLQUFLLFdBQUwsS0FBcUIsSUFBdEQsRUFBNkQ7QUFDM0Qsd0JBQWdCLFFBQWhCLFdBQThCLEtBQUssR0FBbkMsV0FBNkMsUUFBN0MsWUFBNEQsS0FBNUQ7QUFDRCxLQUZELE1BRUs7QUFDSCxvQkFBWSxRQUFaLFlBQTJCLEtBQTNCLFFBREcsQ0FDa0M7QUFDdEM7O0FBRUQsUUFBSSxLQUFLLEdBQUwsS0FBYSxRQUFiLElBQTBCLEtBQUssYUFBbkMsRUFBbUQsbUJBQWlCLFFBQWpCLFlBQWdDLEtBQUssR0FBckMsV0FBOEMsUUFBOUMsWUFBNkQsSUFBN0Q7QUFDbkQsUUFBSSxLQUFLLEdBQUwsS0FBYSxDQUFDLFFBQWQsSUFBMEIsS0FBSyxhQUFuQyxFQUFtRCxtQkFBaUIsUUFBakIsV0FBK0IsS0FBSyxHQUFwQyxXQUE2QyxRQUE3QyxZQUE0RCxJQUE1RDs7QUFFbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsVUFBTSxNQUFNLElBQU4sR0FBYSxJQUFuQjs7QUFFQSxXQUFPLEdBQVA7QUFDRCxHQXJFUzs7O0FBdUVWLFlBQVcsRUFBRSxLQUFJLENBQU4sRUFBUyxLQUFJLENBQWIsRUFBZ0IsWUFBVyxDQUEzQixFQUE4QixjQUFhLENBQTNDLEVBQThDLFlBQVcsSUFBekQsRUFBK0QsZUFBZSxJQUE5RSxFQUFvRixlQUFjLElBQWxHLEVBQXdHLGFBQVksS0FBcEg7QUF2RUQsQ0FBWjs7QUEwRUEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsSUFBRixFQUFpQztBQUFBLE1BQXpCLEtBQXlCLHVFQUFuQixDQUFtQjtBQUFBLE1BQWhCLFVBQWdCOztBQUNoRCxNQUFNLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFiOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFDRTtBQUNFLFNBQVEsS0FBSSxNQUFKLEVBRFY7QUFFRSxZQUFRLENBQUUsSUFBRixFQUFRLEtBQVIsQ0FGVjtBQUdFLFlBQVE7QUFDTixhQUFPLEVBQUUsUUFBTyxDQUFULEVBQVksS0FBSSxJQUFoQjtBQUREO0FBSFYsR0FERixFQVFFLE1BQU0sUUFSUixFQVNFLFVBVEY7O0FBWUEsTUFBSSxlQUFlLFNBQWYsSUFBNEIsV0FBVyxhQUFYLEtBQTZCLFNBQXpELElBQXNFLFdBQVcsYUFBWCxLQUE2QixTQUF2RyxFQUFtSDtBQUNqSCxRQUFJLFdBQVcsVUFBWCxLQUEwQixTQUE5QixFQUEwQztBQUN4QyxXQUFLLGFBQUwsR0FBcUIsS0FBSyxhQUFMLEdBQXFCLFdBQVcsVUFBckQ7QUFDRDtBQUNGOztBQUVELE1BQUksZUFBZSxTQUFmLElBQTRCLFdBQVcsVUFBWCxLQUEwQixTQUExRCxFQUFzRTtBQUNwRSxTQUFLLFVBQUwsR0FBa0IsS0FBSyxHQUF2QjtBQUNEOztBQUVELE1BQUksS0FBSyxZQUFMLEtBQXNCLFNBQTFCLEVBQXNDLEtBQUssWUFBTCxHQUFvQixLQUFLLEdBQXpCOztBQUV0QyxTQUFPLGNBQVAsQ0FBdUIsSUFBdkIsRUFBNkIsT0FBN0IsRUFBc0M7QUFDcEMsT0FEb0MsaUJBQzdCO0FBQ0w7QUFDQSxhQUFPLEtBQUksTUFBSixDQUFXLElBQVgsQ0FBaUIsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFuQyxDQUFQO0FBQ0QsS0FKbUM7QUFLcEMsT0FMb0MsZUFLaEMsQ0FMZ0MsRUFLN0I7QUFBRSxXQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbkMsSUFBMkMsQ0FBM0M7QUFBOEM7QUFMbkIsR0FBdEM7O0FBUUEsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFwQixHQUErQixLQUFLLEdBQXBDOztBQUVBLFNBQU8sSUFBUDtBQUNELENBdENEOzs7QUM5RUE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsTUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFJQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7QUFDQSxRQUFNLE1BQU0sWUFBWSxFQUFaLEdBQWlCLE1BQTdCOztBQUVBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsRUFBRSxRQUFRLFlBQVksV0FBWixHQUF5QixLQUFLLElBQXhDLEVBQWpCOztBQUVBLFlBQVMsR0FBVCxjQUFxQixPQUFPLENBQVAsQ0FBckI7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssSUFBTCxDQUFXLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBWCxDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFyQlMsQ0FBWjs7QUF3QkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxPQUFLLE1BQUwsR0FBYyxDQUFFLENBQUYsQ0FBZDtBQUNBLE9BQUssRUFBTCxHQUFVLEtBQUksTUFBSixFQUFWO0FBQ0EsT0FBSyxJQUFMLEdBQWUsS0FBSyxRQUFwQjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQVJEOzs7QUM1QkE7O0FBRUEsSUFBSSxNQUFXLFFBQVMsVUFBVCxDQUFmO0FBQUEsSUFDSSxNQUFXLFFBQVMsVUFBVCxDQURmO0FBQUEsSUFFSSxNQUFXLFFBQVMsVUFBVCxDQUZmO0FBQUEsSUFHSSxNQUFXLFFBQVMsVUFBVCxDQUhmO0FBQUEsSUFJSSxPQUFXLFFBQVMsV0FBVCxDQUpmO0FBQUEsSUFLSSxPQUFXLFFBQVMsV0FBVCxDQUxmO0FBQUEsSUFNSSxRQUFXLFFBQVMsWUFBVCxDQU5mO0FBQUEsSUFPSSxTQUFXLFFBQVMsZUFBVCxDQVBmO0FBQUEsSUFRSSxLQUFXLFFBQVMsU0FBVCxDQVJmO0FBQUEsSUFTSSxPQUFXLFFBQVMsV0FBVCxDQVRmO0FBQUEsSUFVSSxNQUFXLFFBQVMsVUFBVCxDQVZmO0FBQUEsSUFXSSxNQUFXLFFBQVMsVUFBVCxDQVhmO0FBQUEsSUFZSSxPQUFXLFFBQVMsV0FBVCxDQVpmO0FBQUEsSUFhSSxNQUFXLFFBQVMsVUFBVCxDQWJmO0FBQUEsSUFjSSxNQUFXLFFBQVMsVUFBVCxDQWRmO0FBQUEsSUFlSSxNQUFXLFFBQVMsVUFBVCxDQWZmO0FBQUEsSUFnQkksT0FBVyxRQUFTLFdBQVQsQ0FoQmY7QUFBQSxJQWlCSSxZQUFXLFFBQVMsZ0JBQVQsQ0FqQmY7O0FBbUJBLE9BQU8sT0FBUCxHQUFpQixZQUFxRDtBQUFBLE1BQW5ELFVBQW1ELHVFQUF0QyxLQUFzQztBQUFBLE1BQS9CLFNBQStCLHVFQUFuQixLQUFtQjtBQUFBLE1BQVosTUFBWTs7QUFDcEUsTUFBTSxRQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsRUFBRSxPQUFNLGFBQVIsRUFBdUIsT0FBTSxDQUE3QixFQUFnQyxTQUFRLElBQXhDLEVBQWxCLEVBQWtFLE1BQWxFLENBQWQ7QUFDQSxNQUFNLFFBQVEsTUFBTSxPQUFOLEtBQWtCLElBQWxCLEdBQXlCLE1BQU0sT0FBL0IsR0FBeUMsTUFBdkQ7QUFBQSxNQUNNLFFBQVEsTUFBTyxDQUFQLEVBQVUsS0FBVixFQUFpQixFQUFFLEtBQUksQ0FBTixFQUFTLEtBQUssUUFBZCxFQUF3QixjQUFhLENBQUMsUUFBdEMsRUFBZ0QsWUFBVyxLQUEzRCxFQUFqQixDQURkOztBQUdBLE1BQUksbUJBQUo7QUFBQSxNQUFnQiwwQkFBaEI7QUFBQSxNQUFtQyxrQkFBbkM7QUFBQSxNQUE4QyxZQUE5QztBQUFBLE1BQW1ELGVBQW5EOztBQUVBO0FBQ0EsTUFBSSxlQUFlLEtBQU0sQ0FBQyxDQUFELENBQU4sQ0FBbkI7O0FBRUE7QUFDQSxNQUFJLE1BQU0sS0FBTixLQUFnQixRQUFwQixFQUErQjtBQUM3QixVQUFNLE9BQ0osSUFBSyxJQUFLLEtBQUwsRUFBWSxDQUFaLENBQUwsRUFBcUIsR0FBSSxLQUFKLEVBQVcsVUFBWCxDQUFyQixDQURJLEVBRUosSUFBSyxLQUFMLEVBQVksVUFBWixDQUZJLEVBSUosSUFBSyxJQUFLLEtBQUwsRUFBWSxDQUFaLENBQUwsRUFBc0IsR0FBSSxLQUFKLEVBQVcsSUFBSyxVQUFMLEVBQWlCLFNBQWpCLENBQVgsQ0FBdEIsQ0FKSSxFQUtKLElBQUssQ0FBTCxFQUFRLElBQUssSUFBSyxLQUFMLEVBQVksVUFBWixDQUFMLEVBQStCLFNBQS9CLENBQVIsQ0FMSSxFQU9KLElBQUssS0FBTCxFQUFZLENBQUMsUUFBYixDQVBJLEVBUUosS0FBTSxZQUFOLEVBQW9CLENBQXBCLEVBQXVCLENBQXZCLEVBQTBCLEVBQUUsUUFBTyxDQUFULEVBQTFCLENBUkksRUFVSixDQVZJLENBQU47QUFZRCxHQWJELE1BYU87QUFDTCxpQkFBYSxJQUFJLEVBQUUsUUFBTyxJQUFULEVBQWUsTUFBSyxNQUFNLEtBQTFCLEVBQWlDLE9BQU0sTUFBTSxLQUE3QyxFQUFKLENBQWI7QUFDQSx3QkFBb0IsSUFBSSxFQUFFLFFBQU8sSUFBVCxFQUFlLE1BQUssTUFBTSxLQUExQixFQUFpQyxPQUFNLE1BQU0sS0FBN0MsRUFBb0QsU0FBUSxJQUE1RCxFQUFKLENBQXBCOztBQUVBLFVBQU0sT0FDSixJQUFLLElBQUssS0FBTCxFQUFZLENBQVosQ0FBTCxFQUFxQixHQUFJLEtBQUosRUFBVyxVQUFYLENBQXJCLENBREksRUFFSixLQUFNLFVBQU4sRUFBa0IsSUFBSyxLQUFMLEVBQVksVUFBWixDQUFsQixFQUE0QyxFQUFFLFdBQVUsT0FBWixFQUE1QyxDQUZJLEVBSUosSUFBSyxJQUFJLEtBQUosRUFBVSxDQUFWLENBQUwsRUFBbUIsR0FBSSxLQUFKLEVBQVcsSUFBSyxVQUFMLEVBQWlCLFNBQWpCLENBQVgsQ0FBbkIsQ0FKSSxFQUtKLEtBQU0saUJBQU4sRUFBeUIsSUFBSyxJQUFLLEtBQUwsRUFBWSxVQUFaLENBQUwsRUFBK0IsU0FBL0IsQ0FBekIsRUFBcUUsRUFBRSxXQUFVLE9BQVosRUFBckUsQ0FMSSxFQU9KLElBQUssS0FBTCxFQUFZLENBQUMsUUFBYixDQVBJLEVBUUosS0FBTSxZQUFOLEVBQW9CLENBQXBCLEVBQXVCLENBQXZCLEVBQTBCLEVBQUUsUUFBTyxDQUFULEVBQTFCLENBUkksRUFVSixDQVZJLENBQU47QUFZRDs7QUFFRCxNQUFNLGVBQWUsSUFBSSxJQUFKLEtBQWEsU0FBbEM7QUFDQSxNQUFJLGlCQUFpQixJQUFyQixFQUE0QjtBQUMxQixRQUFJLElBQUosR0FBVyxJQUFYO0FBQ0EsY0FBVSxRQUFWLENBQW9CLEdBQXBCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLE1BQUksVUFBSixHQUFpQixZQUFLO0FBQ3BCLFFBQUksaUJBQWlCLElBQWpCLElBQXlCLElBQUksSUFBSixLQUFhLElBQTFDLEVBQWlEO0FBQy9DLFVBQU0sSUFBSSxJQUFJLE9BQUosQ0FBYSxtQkFBVztBQUNoQyxZQUFJLElBQUosQ0FBUyxjQUFULENBQXlCLGFBQWEsTUFBYixDQUFvQixNQUFwQixDQUEyQixHQUFwRCxFQUF5RCxPQUF6RDtBQUNELE9BRlMsQ0FBVjs7QUFJQSxhQUFPLENBQVA7QUFDRCxLQU5ELE1BTUs7QUFDSCxhQUFPLElBQUksTUFBSixDQUFXLElBQVgsQ0FBaUIsYUFBYSxNQUFiLENBQW9CLE1BQXBCLENBQTJCLEdBQTVDLENBQVA7QUFDRDtBQUNGLEdBVkQ7O0FBWUEsTUFBSSxPQUFKLEdBQWMsWUFBSztBQUNqQixRQUFJLGlCQUFpQixJQUFqQixJQUF5QixJQUFJLElBQUosS0FBYSxJQUExQyxFQUFpRDtBQUMvQyxVQUFJLElBQUosQ0FBUyxJQUFULENBQWMsV0FBZCxDQUEwQixFQUFFLEtBQUksS0FBTixFQUFhLEtBQUksYUFBYSxNQUFiLENBQW9CLE1BQXBCLENBQTJCLEdBQTVDLEVBQWlELE9BQU0sQ0FBdkQsRUFBMUI7QUFDRDtBQUNEO0FBQ0E7QUFDQTtBQUNBLFVBQU0sT0FBTjtBQUNELEdBUkQ7O0FBVUEsU0FBTyxHQUFQO0FBQ0QsQ0F6RUQ7OztBQ3JCQTs7QUFFQSxJQUFNLE9BQU0sUUFBUSxVQUFSLENBQVo7O0FBRUEsSUFBTSxRQUFRO0FBQ1osWUFBUyxLQURHO0FBRVosS0FGWSxpQkFFTjtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7QUFBQSxRQUNJLE1BQUksRUFEUjtBQUFBLFFBRUksTUFBTSxDQUZWO0FBQUEsUUFFYSxXQUFXLENBRnhCO0FBQUEsUUFFMkIsYUFBYSxLQUZ4QztBQUFBLFFBRStDLG9CQUFvQixJQUZuRTs7QUFJQSxRQUFJLE9BQU8sTUFBUCxLQUFrQixDQUF0QixFQUEwQixPQUFPLENBQVA7O0FBRTFCLHFCQUFlLEtBQUssSUFBcEI7O0FBRUEsV0FBTyxPQUFQLENBQWdCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBUztBQUN2QixVQUFJLE1BQU8sQ0FBUCxDQUFKLEVBQWlCO0FBQ2YsZUFBTyxDQUFQO0FBQ0EsWUFBSSxJQUFJLE9BQU8sTUFBUCxHQUFlLENBQXZCLEVBQTJCO0FBQ3pCLHVCQUFhLElBQWI7QUFDQSxpQkFBTyxLQUFQO0FBQ0Q7QUFDRCw0QkFBb0IsS0FBcEI7QUFDRCxPQVBELE1BT0s7QUFDSCxlQUFPLFdBQVksQ0FBWixDQUFQO0FBQ0E7QUFDRDtBQUNGLEtBWkQ7O0FBY0EsUUFBSSxXQUFXLENBQWYsRUFBbUI7QUFDakIsYUFBTyxjQUFjLGlCQUFkLEdBQWtDLEdBQWxDLEdBQXdDLFFBQVEsR0FBdkQ7QUFDRDs7QUFFRCxXQUFPLElBQVA7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBN0I7O0FBRUEsV0FBTyxDQUFFLEtBQUssSUFBUCxFQUFhLEdBQWIsQ0FBUDtBQUNEO0FBbENXLENBQWQ7O0FBcUNBLE9BQU8sT0FBUCxHQUFpQixZQUFlO0FBQUEsb0NBQVYsSUFBVTtBQUFWLFFBQVU7QUFBQTs7QUFDOUIsTUFBTSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWjtBQUNBLE1BQUksRUFBSixHQUFTLEtBQUksTUFBSixFQUFUO0FBQ0EsTUFBSSxJQUFKLEdBQVcsSUFBSSxRQUFKLEdBQWUsSUFBSSxFQUE5QjtBQUNBLE1BQUksTUFBSixHQUFhLElBQWI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FQRDs7O0FDekNBOztBQUVBLElBQUksTUFBVyxRQUFTLFVBQVQsQ0FBZjtBQUFBLElBQ0ksTUFBVyxRQUFTLFVBQVQsQ0FEZjtBQUFBLElBRUksTUFBVyxRQUFTLFVBQVQsQ0FGZjtBQUFBLElBR0ksTUFBVyxRQUFTLFVBQVQsQ0FIZjtBQUFBLElBSUksT0FBVyxRQUFTLFdBQVQsQ0FKZjtBQUFBLElBS0ksT0FBVyxRQUFTLFdBQVQsQ0FMZjtBQUFBLElBTUksUUFBVyxRQUFTLFlBQVQsQ0FOZjtBQUFBLElBT0ksU0FBVyxRQUFTLGVBQVQsQ0FQZjtBQUFBLElBUUksS0FBVyxRQUFTLFNBQVQsQ0FSZjtBQUFBLElBU0ksT0FBVyxRQUFTLFdBQVQsQ0FUZjtBQUFBLElBVUksTUFBVyxRQUFTLFVBQVQsQ0FWZjtBQUFBLElBV0ksUUFBVyxRQUFTLFlBQVQsQ0FYZjtBQUFBLElBWUksTUFBVyxRQUFTLFVBQVQsQ0FaZjtBQUFBLElBYUksTUFBVyxRQUFTLFVBQVQsQ0FiZjtBQUFBLElBY0ksTUFBVyxRQUFTLFVBQVQsQ0FkZjtBQUFBLElBZUksTUFBVyxRQUFTLFVBQVQsQ0FmZjtBQUFBLElBZ0JJLE1BQVcsUUFBUyxVQUFULENBaEJmO0FBQUEsSUFpQkksT0FBVyxRQUFTLFdBQVQsQ0FqQmY7O0FBbUJBLE9BQU8sT0FBUCxHQUFpQixZQUFxRztBQUFBLE1BQW5HLFVBQW1HLHVFQUF4RixFQUF3RjtBQUFBLE1BQXBGLFNBQW9GLHVFQUExRSxLQUEwRTtBQUFBLE1BQW5FLFdBQW1FLHVFQUF2RCxLQUF1RDtBQUFBLE1BQWhELFlBQWdELHVFQUFuQyxFQUFtQztBQUFBLE1BQS9CLFdBQStCLHVFQUFuQixLQUFtQjtBQUFBLE1BQVosTUFBWTs7QUFDcEgsTUFBSSxhQUFhLE1BQWpCO0FBQUEsTUFDSSxRQUFRLE1BQU8sQ0FBUCxFQUFVLFVBQVYsRUFBc0IsRUFBRSxLQUFLLFFBQVAsRUFBaUIsWUFBVyxLQUE1QixFQUFtQyxjQUFhLFFBQWhELEVBQXRCLENBRFo7QUFBQSxNQUVJLGdCQUFnQixNQUFPLENBQVAsQ0FGcEI7QUFBQSxNQUdJLFdBQVc7QUFDUixXQUFPLGFBREM7QUFFUixXQUFPLENBRkM7QUFHUixvQkFBZ0I7QUFIUixHQUhmO0FBQUEsTUFRSSxRQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsUUFBbEIsRUFBNEIsTUFBNUIsQ0FSWjtBQUFBLE1BU0ksbUJBVEo7QUFBQSxNQVNnQixrQkFUaEI7QUFBQSxNQVMyQixZQVQzQjtBQUFBLE1BU2dDLGVBVGhDO0FBQUEsTUFTd0MseUJBVHhDO0FBQUEsTUFTMEQscUJBVDFEO0FBQUEsTUFTd0UseUJBVHhFOztBQVlBLE1BQU0sZUFBZSxLQUFNLENBQUMsQ0FBRCxDQUFOLENBQXJCOztBQUVBLGVBQWEsSUFBSSxFQUFFLFFBQU8sSUFBVCxFQUFlLE9BQU0sTUFBTSxLQUEzQixFQUFrQyxPQUFNLENBQXhDLEVBQTJDLE1BQUssTUFBTSxLQUF0RCxFQUFKLENBQWI7O0FBRUEscUJBQW1CLE1BQU0sY0FBTixHQUNmLGFBRGUsR0FFZixHQUFJLEtBQUosRUFBVyxJQUFLLFVBQUwsRUFBaUIsU0FBakIsRUFBNEIsV0FBNUIsQ0FBWCxDQUZKOztBQUlBLGlCQUFlLE1BQU0sY0FBTixHQUNYLElBQUssSUFBSyxZQUFMLEVBQW1CLE1BQU8sSUFBSyxZQUFMLEVBQW1CLFdBQW5CLENBQVAsRUFBMEMsQ0FBMUMsRUFBNkMsRUFBRSxZQUFXLEtBQWIsRUFBN0MsQ0FBbkIsQ0FBTCxFQUE4RixDQUE5RixDQURXLEdBRVgsSUFBSyxZQUFMLEVBQW1CLElBQUssSUFBSyxJQUFLLEtBQUwsRUFBWSxJQUFLLFVBQUwsRUFBaUIsU0FBakIsRUFBNEIsV0FBNUIsQ0FBWixDQUFMLEVBQThELFdBQTlELENBQUwsRUFBa0YsWUFBbEYsQ0FBbkIsQ0FGSixFQUlBLG1CQUFtQixNQUFNLGNBQU4sR0FDZixJQUFLLGFBQUwsQ0FEZSxHQUVmLEdBQUksS0FBSixFQUFXLElBQUssVUFBTCxFQUFpQixTQUFqQixFQUE0QixXQUE1QixFQUF5QyxXQUF6QyxDQUFYLENBTko7O0FBUUEsUUFBTTtBQUNKO0FBQ0EsS0FBSSxLQUFKLEVBQVksVUFBWixDQUZJLEVBR0osS0FBTSxVQUFOLEVBQWtCLElBQUssS0FBTCxFQUFZLFVBQVosQ0FBbEIsRUFBNEMsRUFBRSxXQUFVLE9BQVosRUFBNUMsQ0FISTs7QUFLSjtBQUNBLEtBQUksS0FBSixFQUFXLElBQUssVUFBTCxFQUFpQixTQUFqQixDQUFYLENBTkksRUFPSixLQUFNLFVBQU4sRUFBa0IsSUFBSyxDQUFMLEVBQVEsSUFBSyxJQUFLLElBQUssS0FBTCxFQUFhLFVBQWIsQ0FBTCxFQUFpQyxTQUFqQyxDQUFMLEVBQW1ELElBQUssQ0FBTCxFQUFTLFlBQVQsQ0FBbkQsQ0FBUixDQUFsQixFQUEwRyxFQUFFLFdBQVUsT0FBWixFQUExRyxDQVBJOztBQVNKO0FBQ0EsTUFBSyxnQkFBTCxFQUF1QixJQUFLLEtBQUwsRUFBWSxRQUFaLENBQXZCLENBVkksRUFXSixLQUFNLFVBQU4sRUFBbUIsWUFBbkIsQ0FYSTs7QUFhSjtBQUNBLGtCQWRJLEVBY2M7QUFDbEIsT0FDRSxVQURGLEVBRUUsWUFGRjtBQUdFO0FBQ0EsSUFBRSxXQUFVLE9BQVosRUFKRixDQWZJLEVBc0JKLElBQUssS0FBTCxFQUFZLFFBQVosQ0F0QkksRUF1QkosS0FBTSxZQUFOLEVBQW9CLENBQXBCLEVBQXVCLENBQXZCLEVBQTBCLEVBQUUsUUFBTyxDQUFULEVBQTFCLENBdkJJLEVBeUJKLENBekJJLENBQU47O0FBNEJBLE1BQU0sZUFBZSxJQUFJLElBQUosS0FBYSxTQUFsQztBQUNBLE1BQUksaUJBQWlCLElBQXJCLEVBQTRCO0FBQzFCLFFBQUksSUFBSixHQUFXLElBQVg7QUFDQSxjQUFVLFFBQVYsQ0FBb0IsR0FBcEI7QUFDRDs7QUFFRCxNQUFJLE9BQUosR0FBYyxZQUFLO0FBQ2pCLGtCQUFjLEtBQWQsR0FBc0IsQ0FBdEI7QUFDQSxlQUFXLE9BQVg7QUFDRCxHQUhEOztBQUtBO0FBQ0E7QUFDQSxNQUFJLFVBQUosR0FBaUIsWUFBSztBQUNwQixRQUFJLGlCQUFpQixJQUFqQixJQUF5QixJQUFJLElBQUosS0FBYSxJQUExQyxFQUFpRDtBQUMvQyxVQUFNLElBQUksSUFBSSxPQUFKLENBQWEsbUJBQVc7QUFDaEMsWUFBSSxJQUFKLENBQVMsY0FBVCxDQUF5QixhQUFhLE1BQWIsQ0FBb0IsTUFBcEIsQ0FBMkIsR0FBcEQsRUFBeUQsT0FBekQ7QUFDRCxPQUZTLENBQVY7O0FBSUEsYUFBTyxDQUFQO0FBQ0QsS0FORCxNQU1LO0FBQ0gsYUFBTyxJQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLGFBQWEsTUFBYixDQUFvQixNQUFwQixDQUEyQixHQUE1QyxDQUFQO0FBQ0Q7QUFDRixHQVZEOztBQWFBLE1BQUksT0FBSixHQUFjLFlBQUs7QUFDakIsa0JBQWMsS0FBZCxHQUFzQixDQUF0QjtBQUNBO0FBQ0E7QUFDQSxRQUFJLGdCQUFnQixJQUFJLElBQUosS0FBYSxJQUFqQyxFQUF3QztBQUN0QyxVQUFJLElBQUosQ0FBUyxJQUFULENBQWMsV0FBZCxDQUEwQixFQUFFLEtBQUksS0FBTixFQUFhLEtBQUksYUFBYSxNQUFiLENBQW9CLENBQXBCLEVBQXVCLE1BQXZCLENBQThCLENBQTlCLEVBQWlDLE1BQWpDLENBQXdDLEtBQXhDLENBQThDLEdBQS9ELEVBQW9FLE9BQU0sQ0FBMUUsRUFBMUI7QUFDRCxLQUZELE1BRUs7QUFDSCxVQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLGFBQWEsTUFBYixDQUFvQixDQUFwQixFQUF1QixNQUF2QixDQUE4QixDQUE5QixFQUFpQyxNQUFqQyxDQUF3QyxLQUF4QyxDQUE4QyxHQUEvRCxJQUF1RSxDQUF2RTtBQUNEO0FBQ0YsR0FURDs7QUFXQSxTQUFPLEdBQVA7QUFDRCxDQS9GRDs7O0FDckJBOztBQUVBLElBQUksT0FBTSxRQUFTLFVBQVQsQ0FBVjs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLEtBREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7QUFBQSxRQUFvQyxZQUFwQzs7QUFFQSxxQkFBZSxLQUFLLElBQXBCLFlBQStCLE9BQU8sQ0FBUCxDQUEvQixrQkFBcUQsT0FBTyxDQUFQLENBQXJEOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixTQUEyQixLQUFLLElBQWhDOztBQUVBLFdBQU8sTUFBSyxLQUFLLElBQVYsRUFBa0IsR0FBbEIsQ0FBUDtBQUNEO0FBWFMsQ0FBWjs7QUFlQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxHQUFGLEVBQU8sR0FBUCxFQUFnQjtBQUMvQixNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYO0FBQ0EsU0FBTyxNQUFQLENBQWUsSUFBZixFQUFxQjtBQUNuQixTQUFTLEtBQUksTUFBSixFQURVO0FBRW5CLFlBQVMsQ0FBRSxHQUFGLEVBQU8sR0FBUDtBQUZVLEdBQXJCOztBQUtBLE9BQUssSUFBTCxRQUFlLEtBQUssUUFBcEIsR0FBK0IsS0FBSyxHQUFwQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQVZEOzs7QUNuQkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsTUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7QUFDQSxRQUFNLE1BQU0sWUFBWSxFQUFaLEdBQWlCLE1BQTdCOztBQUVBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsRUFBRSxRQUFRLFlBQVksVUFBWixHQUF5QixLQUFLLElBQXhDLEVBQWpCOztBQUVBLFlBQVMsR0FBVCxjQUFxQixPQUFPLENBQVAsQ0FBckI7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssSUFBTCxDQUFXLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBWCxDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFwQlMsQ0FBWjs7QUF1QkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxPQUFLLE1BQUwsR0FBYyxDQUFFLENBQUYsQ0FBZDtBQUNBLE9BQUssRUFBTCxHQUFVLEtBQUksTUFBSixFQUFWO0FBQ0EsT0FBSyxJQUFMLEdBQWUsS0FBSyxRQUFwQjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQVJEOzs7QUMzQkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsTUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7QUFDQSxRQUFNLE1BQU0sWUFBWSxFQUFaLEdBQWlCLE1BQTdCOztBQUVBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsRUFBRSxRQUFRLFlBQVksV0FBWixHQUEwQixLQUFLLElBQXpDLEVBQWpCOztBQUVBLFlBQVMsR0FBVCxjQUFxQixPQUFPLENBQVAsQ0FBckI7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssSUFBTCxDQUFXLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBWCxDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFwQlMsQ0FBWjs7QUF1QkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxPQUFLLE1BQUwsR0FBYyxDQUFFLENBQUYsQ0FBZDtBQUNBLE9BQUssRUFBTCxHQUFVLEtBQUksTUFBSixFQUFWO0FBQ0EsT0FBSyxJQUFMLEdBQWUsS0FBSyxRQUFwQjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQVJEOzs7QUMzQkE7O0FBRUEsSUFBSSxNQUFVLFFBQVMsVUFBVCxDQUFkO0FBQUEsSUFDSSxVQUFVLFFBQVMsY0FBVCxDQURkO0FBQUEsSUFFSSxNQUFVLFFBQVMsVUFBVCxDQUZkO0FBQUEsSUFHSSxNQUFVLFFBQVMsVUFBVCxDQUhkOztBQUtBLE9BQU8sT0FBUCxHQUFpQixZQUF5QjtBQUFBLFFBQXZCLFNBQXVCLHVFQUFYLEtBQVc7O0FBQ3hDLFFBQUksTUFBTSxRQUFVLENBQVYsQ0FBVjtBQUFBLFFBQ0ksTUFBTSxLQUFLLEdBQUwsQ0FBVSxDQUFDLGNBQUQsR0FBa0IsU0FBNUIsQ0FEVjs7QUFHQSxRQUFJLEVBQUosQ0FBUSxJQUFLLElBQUksR0FBVCxFQUFjLEdBQWQsQ0FBUjs7QUFFQSxRQUFJLEdBQUosQ0FBUSxPQUFSLEdBQWtCLFlBQUs7QUFDckIsWUFBSSxLQUFKLEdBQVksQ0FBWjtBQUNELEtBRkQ7O0FBSUEsV0FBTyxJQUFLLENBQUwsRUFBUSxJQUFJLEdBQVosQ0FBUDtBQUNELENBWEQ7OztBQ1BBOztBQUVBLElBQUksT0FBTSxRQUFRLFVBQVIsQ0FBVjs7QUFFQSxJQUFJLFFBQVE7QUFDVixLQURVLGlCQUNKO0FBQ0osU0FBSSxhQUFKLENBQW1CLEtBQUssTUFBeEI7O0FBRUEsUUFBSSxpQkFDQyxLQUFLLElBRE4sa0JBQ3VCLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FEekMsaUJBRUEsS0FBSyxJQUZMLHdCQUU0QixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBRjlDLDBCQUFKO0FBS0EsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBN0I7O0FBRUEsV0FBTyxDQUFFLEtBQUssSUFBUCxFQUFhLEdBQWIsQ0FBUDtBQUNEO0FBWlMsQ0FBWjs7QUFlQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxNQUFGLEVBQWM7QUFDN0IsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDtBQUFBLE1BQ0ksUUFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEVBQUUsS0FBSSxDQUFOLEVBQVMsS0FBSSxDQUFiLEVBQWxCLEVBQW9DLE1BQXBDLENBRFo7O0FBR0EsT0FBSyxJQUFMLEdBQVksU0FBUyxLQUFJLE1BQUosRUFBckI7O0FBRUEsT0FBSyxHQUFMLEdBQVcsTUFBTSxHQUFqQjtBQUNBLE9BQUssR0FBTCxHQUFXLE1BQU0sR0FBakI7O0FBRUEsTUFBTSxlQUFlLEtBQUksSUFBSixLQUFhLFNBQWxDO0FBQ0EsTUFBSSxpQkFBaUIsSUFBckIsRUFBNEI7QUFDMUIsU0FBSyxJQUFMLEdBQVksSUFBWjtBQUNBLGNBQVUsUUFBVixDQUFvQixJQUFwQjtBQUNEOztBQUVELE9BQUssT0FBTCxHQUFlLFlBQU07QUFDbkIsUUFBSSxpQkFBaUIsSUFBakIsSUFBeUIsS0FBSyxJQUFMLEtBQWMsSUFBM0MsRUFBa0Q7QUFDaEQsV0FBSyxJQUFMLENBQVUsSUFBVixDQUFlLFdBQWYsQ0FBMkIsRUFBRSxLQUFJLEtBQU4sRUFBYSxLQUFJLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbkMsRUFBd0MsT0FBTSxLQUFLLEdBQW5ELEVBQTNCO0FBQ0QsS0FGRCxNQUVLO0FBQ0gsV0FBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQW5DLElBQTJDLEtBQUssR0FBaEQ7QUFDRDtBQUNGLEdBTkQ7O0FBUUEsT0FBSyxNQUFMLEdBQWM7QUFDWixXQUFPLEVBQUUsUUFBTyxDQUFULEVBQVksS0FBSSxJQUFoQjtBQURLLEdBQWQ7O0FBSUEsU0FBTyxJQUFQO0FBQ0QsQ0E1QkQ7OztBQ25CQTs7QUFFQSxJQUFJLE9BQU0sUUFBUyxVQUFULENBQVY7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxNQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiO0FBQUEsUUFBb0MsWUFBcEM7O0FBRUEsVUFBUyxPQUFPLENBQVAsQ0FBVDs7QUFFQTs7QUFFQTtBQUNBLFdBQU8sR0FBUDtBQUNEO0FBWlMsQ0FBWjs7QUFlQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxHQUFGLEVBQVc7QUFDMUIsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFNBQVksS0FBSSxNQUFKLEVBRE87QUFFbkIsWUFBWSxDQUFFLEdBQUY7QUFGTyxHQUFyQjs7QUFLQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUssR0FBcEM7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FYRDs7O0FDbkJBOzs7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFFBQUssTUFESzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFJQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7QUFDQSxRQUFNLE1BQU0sWUFBWSxFQUFaLEdBQWlCLE1BQTdCOztBQUVBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBMUIsRUFBa0MsWUFBWSxXQUFaLEdBQTBCLEtBQUssSUFBakU7O0FBRUEsWUFBUyxHQUFULGNBQXFCLE9BQU8sQ0FBUCxDQUFyQjtBQUVELEtBTEQsTUFLTztBQUNMLFlBQU0sS0FBSyxJQUFMLENBQVcsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFYLENBQU47QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQXJCUyxDQUFaOztBQXdCQSxPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBLE9BQUssTUFBTCxHQUFjLENBQUUsQ0FBRixDQUFkOztBQUVBLFNBQU8sSUFBUDtBQUNELENBTkQ7OztBQzVCQTs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7QUFBQSxJQUNJLFFBQU8sUUFBUSxZQUFSLENBRFg7QUFBQSxJQUVJLE1BQU8sUUFBUSxVQUFSLENBRlg7QUFBQSxJQUdJLE9BQU8sUUFBUSxXQUFSLENBSFg7O0FBS0EsSUFBSSxRQUFRO0FBQ1YsWUFBUyxNQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLGFBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiO0FBQUEsUUFFSSxZQUZKOztBQUlBLG9CQUVJLEtBQUssSUFGVCxXQUVtQixPQUFPLENBQVAsQ0FGbkIsZ0JBR0ksS0FBSyxJQUhULFdBR21CLE9BQU8sQ0FBUCxDQUhuQixXQUdrQyxLQUFLLElBSHZDLFdBR2lELE9BQU8sQ0FBUCxDQUhqRCxxQkFJUyxLQUFLLElBSmQsV0FJd0IsT0FBTyxDQUFQLENBSnhCLFdBSXVDLEtBQUssSUFKNUMsV0FJc0QsT0FBTyxDQUFQLENBSnREO0FBTUEsVUFBTSxNQUFNLEdBQVo7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBN0I7O0FBRUEsV0FBTyxDQUFFLEtBQUssSUFBUCxFQUFhLEdBQWIsQ0FBUDtBQUNEO0FBbkJTLENBQVo7O0FBc0JBLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBMEI7QUFBQSxNQUFuQixHQUFtQix1RUFBZixDQUFDLENBQWM7QUFBQSxNQUFYLEdBQVcsdUVBQVAsQ0FBTzs7QUFDekMsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFlBRG1CO0FBRW5CLFlBRm1CO0FBR25CLFNBQVEsS0FBSSxNQUFKLEVBSFc7QUFJbkIsWUFBUSxDQUFFLEdBQUYsRUFBTyxHQUFQLEVBQVksR0FBWjtBQUpXLEdBQXJCOztBQU9BLE9BQUssSUFBTCxRQUFlLEtBQUssUUFBcEIsR0FBK0IsS0FBSyxHQUFwQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQWJEOzs7QUM3QkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsS0FEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFJQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7O0FBRUEsUUFBTSxNQUFNLFlBQVksRUFBWixHQUFpQixNQUE3Qjs7QUFFQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2QixXQUFJLFFBQUosQ0FBYSxHQUFiLENBQWlCLEVBQUUsT0FBTyxZQUFZLFVBQVosR0FBeUIsS0FBSyxHQUF2QyxFQUFqQjs7QUFFQSxZQUFTLEdBQVQsYUFBb0IsT0FBTyxDQUFQLENBQXBCO0FBRUQsS0FMRCxNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBdEJTLENBQVo7O0FBeUJBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVY7O0FBRUEsTUFBSSxNQUFKLEdBQWEsQ0FBRSxDQUFGLENBQWI7QUFDQSxNQUFJLEVBQUosR0FBUyxLQUFJLE1BQUosRUFBVDtBQUNBLE1BQUksSUFBSixHQUFjLElBQUksUUFBbEI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FSRDs7O0FDN0JBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLFNBREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksYUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7QUFBQSxRQUVJLFVBQVUsU0FBUyxLQUFLLElBRjVCO0FBQUEsUUFHSSxxQkFISjs7QUFLQSxRQUFJLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsS0FBMEIsSUFBOUIsRUFBcUMsS0FBSSxhQUFKLENBQW1CLEtBQUssTUFBeEI7QUFDckMsU0FBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQW5DLElBQTJDLEtBQUssWUFBaEQ7O0FBRUEsbUJBQWdCLEtBQUssUUFBTCxDQUFlLE9BQWYsRUFBd0IsT0FBTyxDQUFQLENBQXhCLEVBQW1DLE9BQU8sQ0FBUCxDQUFuQyxFQUE4QyxPQUFPLENBQVAsQ0FBOUMsRUFBeUQsT0FBTyxDQUFQLENBQXpELEVBQW9FLE9BQU8sQ0FBUCxDQUFwRSxjQUEwRixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQTVHLG9CQUE4SCxLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEdBQS9JLE9BQWhCOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQUwsR0FBWSxRQUFwQzs7QUFFQSxRQUFJLEtBQUksSUFBSixDQUFVLEtBQUssSUFBTCxDQUFVLElBQXBCLE1BQStCLFNBQW5DLEVBQStDLEtBQUssSUFBTCxDQUFVLEdBQVY7O0FBRS9DLFdBQU8sQ0FBRSxLQUFLLElBQUwsR0FBWSxRQUFkLEVBQXdCLFlBQXhCLENBQVA7QUFDRCxHQW5CUztBQXFCVixVQXJCVSxvQkFxQkEsS0FyQkEsRUFxQk8sS0FyQlAsRUFxQmMsSUFyQmQsRUFxQm9CLElBckJwQixFQXFCMEIsTUFyQjFCLEVBcUJrQyxLQXJCbEMsRUFxQnlDLFFBckJ6QyxFQXFCbUQsT0FyQm5ELEVBcUI2RDtBQUNyRSxRQUFJLE9BQU8sS0FBSyxHQUFMLEdBQVcsS0FBSyxHQUEzQjtBQUFBLFFBQ0ksTUFBTSxFQURWO0FBQUEsUUFFSSxPQUFPLEVBRlg7QUFHQTtBQUNBLFFBQUksRUFBRSxPQUFPLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBUCxLQUEwQixRQUExQixJQUFzQyxLQUFLLE1BQUwsQ0FBWSxDQUFaLElBQWlCLENBQXpELENBQUosRUFBa0U7QUFDaEUsd0JBQWdCLE1BQWhCLGdCQUFpQyxRQUFqQyxXQUErQyxJQUEvQztBQUNEOztBQUVELHNCQUFnQixLQUFLLElBQXJCLGlCQUFxQyxRQUFyQyxhQUFxRCxRQUFyRCxZQUFvRSxLQUFwRSxRQVRxRSxDQVNTOztBQUU5RSxRQUFJLE9BQU8sS0FBSyxHQUFaLEtBQW9CLFFBQXBCLElBQWdDLEtBQUssR0FBTCxLQUFhLFFBQTdDLElBQXlELE9BQU8sS0FBSyxHQUFaLEtBQW9CLFFBQWpGLEVBQTRGO0FBQzFGLHdCQUNHLFFBREgsWUFDa0IsS0FBSyxHQUR2QixhQUNrQyxLQURsQyxxQkFFQSxRQUZBLFlBRWUsSUFGZixjQUdBLE9BSEEsNEJBS0EsT0FMQTtBQU9ELEtBUkQsTUFRTSxJQUFJLEtBQUssR0FBTCxLQUFhLFFBQWIsSUFBeUIsS0FBSyxHQUFMLEtBQWEsUUFBMUMsRUFBcUQ7QUFDekQsd0JBQ0csUUFESCxZQUNrQixJQURsQixhQUM4QixLQUQ5QixxQkFFQSxRQUZBLFlBRWUsSUFGZixXQUV5QixJQUZ6QixjQUdBLE9BSEEsMEJBSVEsUUFKUixXQUlzQixJQUp0QixhQUlrQyxLQUpsQyxxQkFLQSxRQUxBLFlBS2UsSUFMZixXQUt5QixJQUx6QixjQU1BLE9BTkEsNEJBUUEsT0FSQTtBQVVELEtBWEssTUFXRDtBQUNILGFBQU8sSUFBUDtBQUNEOztBQUVELFVBQU0sTUFBTSxJQUFaOztBQUVBLFdBQU8sR0FBUDtBQUNEO0FBMURTLENBQVo7O0FBNkRBLE9BQU8sT0FBUCxHQUFpQixZQUFrRTtBQUFBLE1BQWhFLElBQWdFLHVFQUEzRCxDQUEyRDtBQUFBLE1BQXhELEdBQXdELHVFQUFwRCxDQUFvRDtBQUFBLE1BQWpELEdBQWlELHVFQUE3QyxRQUE2QztBQUFBLE1BQW5DLEtBQW1DLHVFQUE3QixDQUE2QjtBQUFBLE1BQTFCLEtBQTBCLHVFQUFwQixDQUFvQjtBQUFBLE1BQWhCLFVBQWdCOztBQUNqRixNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYO0FBQUEsTUFDSSxXQUFXLE9BQU8sTUFBUCxDQUFlLEVBQUUsY0FBYyxDQUFoQixFQUFtQixZQUFXLElBQTlCLEVBQWYsRUFBcUQsVUFBckQsQ0FEZjs7QUFHQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFNBQVEsR0FEVztBQUVuQixTQUFRLEdBRlc7QUFHbkIsa0JBQWMsU0FBUyxZQUhKO0FBSW5CLFdBQVEsU0FBUyxZQUpFO0FBS25CLFNBQVEsS0FBSSxNQUFKLEVBTFc7QUFNbkIsWUFBUSxDQUFFLElBQUYsRUFBUSxHQUFSLEVBQWEsR0FBYixFQUFrQixLQUFsQixFQUF5QixLQUF6QixDQU5XO0FBT25CLFlBQVE7QUFDTixhQUFPLEVBQUUsUUFBTyxDQUFULEVBQVksS0FBSyxJQUFqQixFQUREO0FBRU4sWUFBTyxFQUFFLFFBQU8sQ0FBVCxFQUFZLEtBQUssSUFBakI7QUFGRCxLQVBXO0FBV25CLFVBQU87QUFDTCxTQURLLGlCQUNDO0FBQ0osWUFBSSxLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEdBQWpCLEtBQXlCLElBQTdCLEVBQW9DO0FBQ2xDLGVBQUksYUFBSixDQUFtQixLQUFLLE1BQXhCO0FBQ0Q7QUFDRCxhQUFJLFNBQUosQ0FBZSxJQUFmO0FBQ0EsYUFBSSxJQUFKLENBQVUsS0FBSyxJQUFmLGlCQUFtQyxLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEdBQXBEO0FBQ0EsNEJBQWtCLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsR0FBbkM7QUFDRDtBQVJJO0FBWFksR0FBckIsRUFzQkEsUUF0QkE7O0FBd0JBLFNBQU8sY0FBUCxDQUF1QixJQUF2QixFQUE2QixPQUE3QixFQUFzQztBQUNwQyxPQURvQyxpQkFDOUI7QUFDSixVQUFJLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsS0FBMEIsSUFBOUIsRUFBcUM7QUFDbkMsZUFBTyxLQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbkMsQ0FBUDtBQUNEO0FBQ0YsS0FMbUM7QUFNcEMsT0FOb0MsZUFNL0IsQ0FOK0IsRUFNM0I7QUFDUCxVQUFJLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsS0FBMEIsSUFBOUIsRUFBcUM7QUFDbkMsYUFBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQW5DLElBQTJDLENBQTNDO0FBQ0Q7QUFDRjtBQVZtQyxHQUF0Qzs7QUFhQSxPQUFLLElBQUwsQ0FBVSxNQUFWLEdBQW1CLENBQUUsSUFBRixDQUFuQjtBQUNBLE9BQUssSUFBTCxRQUFlLEtBQUssUUFBcEIsR0FBK0IsS0FBSyxHQUFwQztBQUNBLE9BQUssSUFBTCxDQUFVLElBQVYsR0FBaUIsS0FBSyxJQUFMLEdBQVksT0FBN0I7QUFDQSxTQUFPLElBQVA7QUFDRCxDQTdDRDs7O0FDakVBOztBQUVBLElBQUksTUFBTyxRQUFTLFVBQVQsQ0FBWDtBQUFBLElBQ0ksUUFBTyxRQUFTLGFBQVQsQ0FEWDtBQUFBLElBRUksT0FBTyxRQUFTLFdBQVQsQ0FGWDtBQUFBLElBR0ksT0FBTyxRQUFTLFdBQVQsQ0FIWDtBQUFBLElBSUksTUFBTyxRQUFTLFVBQVQsQ0FKWDtBQUFBLElBS0ksU0FBTyxRQUFTLGFBQVQsQ0FMWDs7QUFPQSxJQUFJLFFBQVE7QUFDVixZQUFTLE9BREM7O0FBR1YsV0FIVSx1QkFHRTtBQUNWLFFBQUksU0FBUyxJQUFJLFlBQUosQ0FBa0IsSUFBbEIsQ0FBYjs7QUFFQSxTQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsSUFBSSxPQUFPLE1BQTNCLEVBQW1DLElBQUksQ0FBdkMsRUFBMEMsR0FBMUMsRUFBZ0Q7QUFDOUMsYUFBUSxDQUFSLElBQWMsS0FBSyxHQUFMLENBQVksSUFBSSxDQUFOLElBQWMsS0FBSyxFQUFMLEdBQVUsQ0FBeEIsQ0FBVixDQUFkO0FBQ0Q7O0FBRUQsUUFBSSxPQUFKLENBQVksS0FBWixHQUFvQixLQUFNLE1BQU4sRUFBYyxDQUFkLEVBQWlCLEVBQUUsV0FBVSxJQUFaLEVBQWpCLENBQXBCO0FBQ0Q7QUFYUyxDQUFaOztBQWVBLE9BQU8sT0FBUCxHQUFpQixZQUFvQztBQUFBLE1BQWxDLFNBQWtDLHVFQUF4QixDQUF3QjtBQUFBLE1BQXJCLEtBQXFCLHVFQUFmLENBQWU7QUFBQSxNQUFaLE1BQVk7O0FBQ25ELE1BQUksT0FBTyxJQUFJLE9BQUosQ0FBWSxLQUFuQixLQUE2QixXQUFqQyxFQUErQyxNQUFNLFNBQU47QUFDL0MsTUFBTSxRQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsRUFBRSxLQUFJLENBQU4sRUFBbEIsRUFBNkIsTUFBN0IsQ0FBZDs7QUFFQSxNQUFNLE9BQU8sS0FBTSxJQUFJLE9BQUosQ0FBWSxLQUFsQixFQUF5QixPQUFRLFNBQVIsRUFBbUIsS0FBbkIsRUFBMEIsS0FBMUIsQ0FBekIsQ0FBYjtBQUNBLE9BQUssSUFBTCxHQUFZLFVBQVUsSUFBSSxNQUFKLEVBQXRCOztBQUVBLFNBQU8sSUFBUDtBQUNELENBUkQ7OztBQ3hCQTs7QUFFQSxJQUFNLE1BQU8sUUFBUyxVQUFULENBQWI7QUFBQSxJQUNNLFFBQU8sUUFBUyxhQUFULENBRGI7QUFBQSxJQUVNLE9BQU8sUUFBUyxXQUFULENBRmI7QUFBQSxJQUdNLE9BQU8sUUFBUyxXQUFULENBSGI7QUFBQSxJQUlNLE1BQU8sUUFBUyxVQUFULENBSmI7QUFBQSxJQUtNLE1BQU8sUUFBUyxVQUFULENBTGI7QUFBQSxJQU1NLFNBQU8sUUFBUyxhQUFULENBTmI7O0FBUUEsSUFBTSxRQUFRO0FBQ1osWUFBUyxRQURHOztBQUdaLFdBSFksdUJBR0E7QUFDVixRQUFJLFNBQVMsSUFBSSxZQUFKLENBQWtCLElBQWxCLENBQWI7O0FBRUEsU0FBSyxJQUFJLElBQUksQ0FBUixFQUFXLElBQUksT0FBTyxNQUEzQixFQUFtQyxJQUFJLENBQXZDLEVBQTBDLEdBQTFDLEVBQWdEO0FBQzlDLGFBQVEsQ0FBUixJQUFjLEtBQUssR0FBTCxDQUFZLElBQUksQ0FBTixJQUFjLEtBQUssRUFBTCxHQUFVLENBQXhCLENBQVYsQ0FBZDtBQUNEOztBQUVELFFBQUksT0FBSixDQUFZLEtBQVosR0FBb0IsS0FBTSxNQUFOLEVBQWMsQ0FBZCxFQUFpQixFQUFFLFdBQVUsSUFBWixFQUFqQixDQUFwQjtBQUNEO0FBWFcsQ0FBZDs7QUFlQSxPQUFPLE9BQVAsR0FBaUIsWUFBb0M7QUFBQSxNQUFsQyxTQUFrQyx1RUFBeEIsQ0FBd0I7QUFBQSxNQUFyQixLQUFxQix1RUFBZixDQUFlO0FBQUEsTUFBWixNQUFZOztBQUNuRCxNQUFJLE9BQU8sSUFBSSxPQUFKLENBQVksS0FBbkIsS0FBNkIsV0FBakMsRUFBK0MsTUFBTSxTQUFOO0FBQy9DLE1BQU0sUUFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEVBQUUsS0FBSSxDQUFOLEVBQWxCLEVBQTZCLE1BQTdCLENBQWQ7O0FBRUEsTUFBTSxPQUFPLElBQUssSUFBSyxDQUFMLEVBQVEsS0FBTSxJQUFJLE9BQUosQ0FBWSxLQUFsQixFQUF5QixPQUFRLFNBQVIsRUFBbUIsS0FBbkIsRUFBMEIsS0FBMUIsQ0FBekIsQ0FBUixDQUFMLEVBQTRFLEVBQTVFLENBQWI7QUFDQSxPQUFLLElBQUwsR0FBWSxVQUFVLElBQUksTUFBSixFQUF0Qjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQVJEOzs7QUN6QkE7O0FBRUEsSUFBTSxPQUFPLFFBQVEsVUFBUixDQUFiO0FBQUEsSUFDTSxZQUFZLFFBQVMsZ0JBQVQsQ0FEbEI7QUFBQSxJQUVNLE9BQU8sUUFBUSxXQUFSLENBRmI7QUFBQSxJQUdNLE9BQU8sUUFBUSxXQUFSLENBSGI7O0FBS0EsSUFBTSxRQUFRO0FBQ1osWUFBUyxNQURHO0FBRVosV0FBUyxFQUZHO0FBR1osUUFBSyxFQUhPOztBQUtaLEtBTFksaUJBS047QUFDSixRQUFJLFlBQUo7QUFDQTtBQUNBO0FBQ0EsUUFBSSxLQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsTUFBMEIsU0FBOUIsRUFBMEM7QUFDeEMsVUFBSSxPQUFPLElBQVg7QUFDQSxXQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4QixFQUFnQyxLQUFLLFNBQXJDO0FBQ0EsWUFBTSxLQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLEdBQXpCO0FBQ0EsVUFBSSxLQUFLLE1BQUwsS0FBZ0IsU0FBcEIsRUFBZ0M7QUFDOUIsWUFBSTtBQUNGLGVBQUksTUFBSixDQUFXLElBQVgsQ0FBZ0IsR0FBaEIsQ0FBcUIsS0FBSyxNQUExQixFQUFrQyxHQUFsQztBQUNELFNBRkQsQ0FFQyxPQUFPLENBQVAsRUFBVztBQUNWLGtCQUFRLEdBQVIsQ0FBYSxDQUFiO0FBQ0EsZ0JBQU0sTUFBTyxvQ0FBb0MsS0FBSyxNQUFMLENBQVksTUFBaEQsR0FBd0QsbUJBQXhELEdBQThFLEtBQUksV0FBbEYsR0FBZ0csTUFBaEcsR0FBeUcsS0FBSSxNQUFKLENBQVcsSUFBWCxDQUFnQixNQUFoSSxDQUFOO0FBQ0Q7QUFDRjtBQUNEO0FBQ0E7QUFDQSxVQUFJLEtBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsTUFBbEIsTUFBOEIsQ0FBQyxDQUFuQyxFQUF1QztBQUNyQyxjQUFNLElBQU4sQ0FBWSxLQUFLLElBQWpCLElBQTBCLEdBQTFCO0FBQ0QsT0FGRCxNQUVLO0FBQ0gsYUFBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEdBQXhCO0FBQ0Q7QUFDRixLQW5CRCxNQW1CSztBQUNIO0FBQ0EsWUFBTSxLQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsQ0FBTjtBQUNEO0FBQ0QsV0FBTyxHQUFQO0FBQ0Q7QUFqQ1csQ0FBZDs7QUFvQ0EsT0FBTyxPQUFQLEdBQWlCLFVBQUUsQ0FBRixFQUEwQjtBQUFBLE1BQXJCLENBQXFCLHVFQUFuQixDQUFtQjtBQUFBLE1BQWhCLFVBQWdCOztBQUN6QyxNQUFJLGFBQUo7QUFBQSxNQUFVLGVBQVY7QUFBQSxNQUFrQixhQUFhLEtBQS9COztBQUVBLE1BQUksZUFBZSxTQUFmLElBQTRCLFdBQVcsTUFBWCxLQUFzQixTQUF0RCxFQUFrRTtBQUNoRSxRQUFJLEtBQUksT0FBSixDQUFhLFdBQVcsTUFBeEIsQ0FBSixFQUF1QztBQUNyQyxhQUFPLEtBQUksT0FBSixDQUFhLFdBQVcsTUFBeEIsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQsTUFBSSxPQUFPLENBQVAsS0FBYSxRQUFqQixFQUE0QjtBQUMxQixRQUFJLE1BQU0sQ0FBVixFQUFjO0FBQ1osZUFBUyxFQUFUO0FBQ0EsV0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLENBQXBCLEVBQXVCLEdBQXZCLEVBQTZCO0FBQzNCLGVBQVEsQ0FBUixJQUFjLElBQUksWUFBSixDQUFrQixDQUFsQixDQUFkO0FBQ0Q7QUFDRixLQUxELE1BS0s7QUFDSCxlQUFTLElBQUksWUFBSixDQUFrQixDQUFsQixDQUFUO0FBQ0Q7QUFDRixHQVRELE1BU00sSUFBSSxNQUFNLE9BQU4sQ0FBZSxDQUFmLENBQUosRUFBeUI7QUFBRTtBQUMvQixRQUFJLE9BQU8sRUFBRSxNQUFiO0FBQ0EsYUFBUyxJQUFJLFlBQUosQ0FBa0IsSUFBbEIsQ0FBVDtBQUNBLFNBQUssSUFBSSxLQUFJLENBQWIsRUFBZ0IsS0FBSSxFQUFFLE1BQXRCLEVBQThCLElBQTlCLEVBQW9DO0FBQ2xDLGFBQVEsRUFBUixJQUFjLEVBQUcsRUFBSCxDQUFkO0FBQ0Q7QUFDRixHQU5LLE1BTUEsSUFBSSxPQUFPLENBQVAsS0FBYSxRQUFqQixFQUE0QjtBQUNoQztBQUNBO0FBQ0UsYUFBUyxFQUFFLFFBQVEsSUFBSSxDQUFKLEdBQVEsQ0FBUixHQUFZLENBQXRCLENBQTBCO0FBQTFCLEtBQVQsQ0FDQSxhQUFhLElBQWI7QUFDRjtBQUNFO0FBQ0Y7QUFDRCxHQVJLLE1BUUEsSUFBSSxhQUFhLFlBQWpCLEVBQWdDO0FBQ3BDLGFBQVMsQ0FBVDtBQUNEOztBQUVELFNBQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFQOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFDQTtBQUNFLGtCQURGO0FBRUUsVUFBTSxNQUFNLFFBQU4sR0FBaUIsS0FBSSxNQUFKLEVBRnpCO0FBR0UsU0FBTSxXQUFXLFNBQVgsR0FBdUIsT0FBTyxNQUE5QixHQUF1QyxDQUgvQyxFQUdrRDtBQUNoRCxjQUFXLENBSmI7QUFLRSxZQUFRLGVBQWUsU0FBZixHQUEyQixXQUFXLE1BQVgsSUFBcUIsSUFBaEQsR0FBdUQsSUFMakU7QUFNRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGVBQVcsZUFBZSxTQUFmLElBQTRCLFdBQVcsU0FBWCxLQUF5QixJQUFyRCxHQUE0RCxJQUE1RCxHQUFtRSxLQVZoRjtBQVdFLFFBWEYsZ0JBV1EsUUFYUixFQVdrQixTQVhsQixFQVc4QjtBQUMxQixVQUFJLFVBQVUsVUFBVSxVQUFWLENBQXNCLFFBQXRCLEVBQWdDLElBQWhDLENBQWQ7QUFDQSxjQUFRLElBQVIsQ0FBYyxtQkFBVztBQUN2QixjQUFNLElBQU4sQ0FBWSxDQUFaLElBQWtCLE9BQWxCO0FBQ0EsYUFBSyxJQUFMLEdBQVksUUFBWjtBQUNBLGFBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsTUFBbkIsR0FBNEIsS0FBSyxHQUFMLEdBQVcsUUFBUSxNQUEvQzs7QUFFQSxhQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4QixFQUFnQyxLQUFLLFNBQXJDO0FBQ0EsYUFBSSxNQUFKLENBQVcsSUFBWCxDQUFnQixHQUFoQixDQUFxQixPQUFyQixFQUE4QixLQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLEdBQWpEO0FBQ0EsWUFBSSxPQUFPLEtBQUssTUFBWixLQUF1QixVQUEzQixFQUF3QyxLQUFLLE1BQUwsQ0FBYSxPQUFiO0FBQ3hDLGtCQUFXLElBQVg7QUFDRCxPQVREO0FBVUQsS0F2Qkg7O0FBd0JFLFlBQVM7QUFDUCxjQUFRLEVBQUUsUUFBTyxXQUFXLFNBQVgsR0FBdUIsT0FBTyxNQUE5QixHQUF1QyxDQUFoRCxFQUFtRCxLQUFJLElBQXZEO0FBREQ7QUF4QlgsR0FEQSxFQTZCQSxVQTdCQTs7QUFpQ0EsTUFBSSxlQUFlLFNBQW5CLEVBQStCO0FBQzdCLFFBQUksV0FBVyxNQUFYLEtBQXNCLFNBQTFCLEVBQXNDO0FBQ3BDLFdBQUksT0FBSixDQUFhLFdBQVcsTUFBeEIsSUFBbUMsSUFBbkM7QUFDRDtBQUNELFFBQUksV0FBVyxJQUFYLEtBQW9CLElBQXhCLEVBQStCO0FBQUEsaUNBQ2IsTUFEYSxFQUNwQixHQURvQjtBQUUzQixlQUFPLGNBQVAsQ0FBdUIsSUFBdkIsRUFBNkIsR0FBN0IsRUFBZ0M7QUFDOUIsYUFEOEIsaUJBQ3ZCO0FBQ0wsbUJBQU8sS0FBTSxJQUFOLEVBQVksR0FBWixFQUFlLEVBQUUsTUFBSyxRQUFQLEVBQWlCLFFBQU8sTUFBeEIsRUFBZixDQUFQO0FBQ0QsV0FINkI7QUFJOUIsYUFKOEIsZUFJekIsQ0FKeUIsRUFJckI7QUFDUCxtQkFBTyxLQUFNLElBQU4sRUFBWSxDQUFaLEVBQWUsR0FBZixDQUFQO0FBQ0Q7QUFONkIsU0FBaEM7QUFGMkI7O0FBQzdCLFdBQUssSUFBSSxNQUFJLENBQVIsRUFBVyxTQUFTLEtBQUssTUFBTCxDQUFZLE1BQXJDLEVBQTZDLE1BQUksTUFBakQsRUFBeUQsS0FBekQsRUFBK0Q7QUFBQSxjQUEvQyxNQUErQyxFQUF0RCxHQUFzRDtBQVM5RDtBQUNGO0FBQ0Y7O0FBRUQsTUFBSSxvQkFBSjtBQUNBLE1BQUksZUFBZSxJQUFuQixFQUEwQjtBQUN4QixrQkFBYyxJQUFJLE9BQUosQ0FBYSxVQUFDLE9BQUQsRUFBUyxNQUFULEVBQW9CO0FBQzdDO0FBQ0EsVUFBSSxVQUFVLFVBQVUsVUFBVixDQUFzQixDQUF0QixFQUF5QixJQUF6QixDQUFkO0FBQ0EsY0FBUSxJQUFSLENBQWMsbUJBQVc7QUFDdkIsY0FBTSxJQUFOLENBQVksQ0FBWixJQUFrQixPQUFsQjtBQUNBLGFBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsTUFBbkIsR0FBNEIsS0FBSyxHQUFMLEdBQVcsUUFBUSxNQUEvQzs7QUFFQSxhQUFLLE1BQUwsR0FBYyxPQUFkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLGdCQUFTLElBQVQ7QUFDRCxPQWJEO0FBY0QsS0FqQmEsQ0FBZDtBQWtCRCxHQW5CRCxNQW1CTSxJQUFJLE1BQU0sSUFBTixDQUFZLENBQVosTUFBb0IsU0FBeEIsRUFBb0M7O0FBRXhDLFNBQUksSUFBSixDQUFVLGFBQVYsRUFBeUIsWUFBSztBQUM1QixXQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4QixFQUFnQyxLQUFLLFNBQXJDO0FBQ0EsV0FBSSxNQUFKLENBQVcsSUFBWCxDQUFnQixHQUFoQixDQUFxQixLQUFLLE1BQTFCLEVBQWtDLEtBQUssTUFBTCxDQUFZLE1BQVosQ0FBbUIsR0FBckQ7QUFDQSxVQUFJLE9BQU8sS0FBSyxNQUFaLEtBQXVCLFVBQTNCLEVBQXdDLEtBQUssTUFBTCxDQUFhLEtBQUssTUFBbEI7QUFDekMsS0FKRDs7QUFNQSxrQkFBYyxJQUFkO0FBQ0QsR0FUSyxNQVNEO0FBQ0gsa0JBQWMsSUFBZDtBQUNEOztBQUVELFNBQU8sV0FBUDtBQUNELENBM0hEOzs7QUMzQ0E7O0FBRUEsSUFBSSxNQUFVLFFBQVMsVUFBVCxDQUFkO0FBQUEsSUFDSSxVQUFVLFFBQVMsY0FBVCxDQURkO0FBQUEsSUFFSSxNQUFVLFFBQVMsVUFBVCxDQUZkO0FBQUEsSUFHSSxNQUFVLFFBQVMsVUFBVCxDQUhkO0FBQUEsSUFJSSxNQUFVLFFBQVMsVUFBVCxDQUpkO0FBQUEsSUFLSSxPQUFVLFFBQVMsV0FBVCxDQUxkOztBQU9BLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBVztBQUMxQixRQUFJLEtBQUssU0FBVDtBQUFBLFFBQ0ksS0FBSyxTQURUO0FBQUEsUUFFSSxlQUZKOztBQUlBO0FBQ0EsYUFBUyxLQUFNLElBQUssSUFBSyxHQUFMLEVBQVUsR0FBRyxHQUFiLENBQUwsRUFBeUIsSUFBSyxHQUFHLEdBQVIsRUFBYSxLQUFiLENBQXpCLENBQU4sQ0FBVDtBQUNBLE9BQUcsRUFBSCxDQUFPLEdBQVA7QUFDQSxPQUFHLEVBQUgsQ0FBTyxNQUFQOztBQUVBLFdBQU8sTUFBUDtBQUNELENBWEQ7OztBQ1RBOztBQUVBLElBQUksTUFBVSxRQUFTLFVBQVQsQ0FBZDtBQUFBLElBQ0ksVUFBVSxRQUFTLGNBQVQsQ0FEZDtBQUFBLElBRUksTUFBVSxRQUFTLFVBQVQsQ0FGZDtBQUFBLElBR0ksTUFBVSxRQUFTLFVBQVQsQ0FIZDs7QUFLQSxPQUFPLE9BQVAsR0FBaUIsWUFBZ0M7QUFBQSxRQUE5QixTQUE4Qix1RUFBbEIsS0FBa0I7QUFBQSxRQUFYLEtBQVc7O0FBQy9DLFFBQUksYUFBYSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEVBQUUsV0FBVSxDQUFaLEVBQWxCLEVBQW1DLEtBQW5DLENBQWpCO0FBQUEsUUFDSSxNQUFNLFFBQVUsV0FBVyxTQUFyQixDQURWOztBQUdBLFFBQUksRUFBSixDQUFRLElBQUssSUFBSSxHQUFULEVBQWMsSUFBSyxTQUFMLENBQWQsQ0FBUjs7QUFFQSxRQUFJLEdBQUosQ0FBUSxPQUFSLEdBQWtCLFlBQUs7QUFDckIsWUFBSSxLQUFKLEdBQVksQ0FBWjtBQUNELEtBRkQ7O0FBSUEsV0FBTyxJQUFJLEdBQVg7QUFDRCxDQVhEOzs7QUNQQTs7OztBQUVBLElBQU0sT0FBTyxRQUFTLFVBQVQsQ0FBYjtBQUFBLElBQ00sT0FBTyxRQUFTLFdBQVQsQ0FEYjtBQUFBLElBRU0sT0FBTyxRQUFTLFdBQVQsQ0FGYjtBQUFBLElBR00sT0FBTyxRQUFTLFdBQVQsQ0FIYjtBQUFBLElBSU0sTUFBTyxRQUFTLFVBQVQsQ0FKYjtBQUFBLElBS00sT0FBTyxRQUFTLFdBQVQsQ0FMYjtBQUFBLElBTU0sUUFBTyxRQUFTLFlBQVQsQ0FOYjtBQUFBLElBT00sT0FBTyxRQUFTLFdBQVQsQ0FQYjs7QUFTQSxJQUFNLFFBQVE7QUFDWixZQUFTLE9BREc7O0FBR1osS0FIWSxpQkFHTjtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLE9BQU8sQ0FBUCxDQUF4Qjs7QUFFQSxXQUFPLE9BQU8sQ0FBUCxDQUFQO0FBQ0Q7QUFUVyxDQUFkOztBQVlBLElBQU0sV0FBVyxFQUFFLE1BQU0sR0FBUixFQUFhLFFBQU8sTUFBcEIsRUFBakI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsR0FBRixFQUFPLElBQVAsRUFBYSxVQUFiLEVBQTZCO0FBQzVDLE1BQU0sT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQWI7QUFDQSxNQUFJLGlCQUFKO0FBQUEsTUFBYyxnQkFBZDtBQUFBLE1BQXVCLGtCQUF2Qjs7QUFFQSxNQUFJLE1BQU0sT0FBTixDQUFlLElBQWYsTUFBMEIsS0FBOUIsRUFBc0MsT0FBTyxDQUFFLElBQUYsQ0FBUDs7QUFFdEMsTUFBTSxRQUFRLE9BQU8sTUFBUCxDQUFlLEVBQWYsRUFBbUIsUUFBbkIsRUFBNkIsVUFBN0IsQ0FBZDs7QUFFQSxNQUFNLGFBQWEsS0FBSyxHQUFMLGdDQUFhLElBQWIsRUFBbkI7QUFDQSxNQUFJLE1BQU0sSUFBTixHQUFhLFVBQWpCLEVBQThCLE1BQU0sSUFBTixHQUFhLFVBQWI7O0FBRTlCLGNBQVksS0FBTSxNQUFNLElBQVosQ0FBWjs7QUFFQSxPQUFLLE1BQUwsR0FBYyxFQUFkOztBQUVBLGFBQVcsTUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLEVBQUUsS0FBSSxNQUFNLElBQVosRUFBa0IsS0FBSSxDQUF0QixFQUFiLENBQVg7O0FBRUEsT0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEtBQUssTUFBekIsRUFBaUMsR0FBakMsRUFBdUM7QUFDckMsU0FBSyxNQUFMLENBQWEsQ0FBYixJQUFtQixLQUFNLFNBQU4sRUFBaUIsS0FBTSxJQUFLLFFBQUwsRUFBZSxLQUFLLENBQUwsQ0FBZixDQUFOLEVBQWdDLENBQWhDLEVBQW1DLE1BQU0sSUFBekMsQ0FBakIsRUFBaUUsRUFBRSxNQUFLLFNBQVAsRUFBa0IsUUFBTyxNQUFNLE1BQS9CLEVBQWpFLENBQW5CO0FBQ0Q7O0FBRUQsT0FBSyxPQUFMLEdBQWUsS0FBSyxNQUFwQixDQXJCNEMsQ0FxQmpCOztBQUUzQixPQUFNLFNBQU4sRUFBaUIsR0FBakIsRUFBc0IsUUFBdEI7O0FBRUEsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFwQixHQUErQixLQUFJLE1BQUosRUFBL0I7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0E1QkQ7OztBQ3pCQTs7QUFFQSxJQUFJLE1BQVUsUUFBUyxVQUFULENBQWQ7QUFBQSxJQUNJLFVBQVUsUUFBUyxjQUFULENBRGQ7QUFBQSxJQUVJLE1BQVUsUUFBUyxVQUFULENBRmQ7O0FBSUEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsR0FBRixFQUFXO0FBQzFCLE1BQUksS0FBSyxTQUFUOztBQUVBLEtBQUcsRUFBSCxDQUFPLEdBQVA7O0FBRUEsTUFBSSxPQUFPLElBQUssR0FBTCxFQUFVLEdBQUcsR0FBYixDQUFYO0FBQ0EsT0FBSyxJQUFMLEdBQVksVUFBUSxJQUFJLE1BQUosRUFBcEI7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FURDs7O0FDTkE7O0FBRUEsSUFBSSxPQUFNLFFBQVEsVUFBUixDQUFWOztBQUVBLElBQU0sUUFBUTtBQUNaLFlBQVMsS0FERztBQUVaLEtBRlksaUJBRU47QUFDSixRQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiO0FBQUEsUUFDSSxpQkFBYSxLQUFLLElBQWxCLFFBREo7QUFBQSxRQUVJLE9BQU8sQ0FGWDtBQUFBLFFBR0ksV0FBVyxDQUhmO0FBQUEsUUFJSSxhQUFhLE9BQVEsQ0FBUixDQUpqQjtBQUFBLFFBS0ksbUJBQW1CLE1BQU8sVUFBUCxDQUx2QjtBQUFBLFFBTUksV0FBVyxLQU5mOztBQVFBLFdBQU8sT0FBUCxDQUFnQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDdkIsVUFBSSxNQUFNLENBQVYsRUFBYzs7QUFFZCxVQUFJLGVBQWUsTUFBTyxDQUFQLENBQW5CO0FBQUEsVUFDRSxhQUFlLE1BQU0sT0FBTyxNQUFQLEdBQWdCLENBRHZDOztBQUdBLFVBQUksQ0FBQyxnQkFBRCxJQUFxQixDQUFDLFlBQTFCLEVBQXlDO0FBQ3ZDLHFCQUFhLGFBQWEsQ0FBMUI7QUFDQSxlQUFPLFVBQVA7QUFDRCxPQUhELE1BR0s7QUFDSCxlQUFVLFVBQVYsV0FBMEIsQ0FBMUI7QUFDRDs7QUFFRCxVQUFJLENBQUMsVUFBTCxFQUFrQixPQUFPLEtBQVA7QUFDbkIsS0FkRDs7QUFnQkEsV0FBTyxJQUFQOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQTdCOztBQUVBLFdBQU8sQ0FBRSxLQUFLLElBQVAsRUFBYSxHQUFiLENBQVA7QUFDRDtBQWhDVyxDQUFkOztBQW1DQSxPQUFPLE9BQVAsR0FBaUIsWUFBYTtBQUFBLG9DQUFULElBQVM7QUFBVCxRQUFTO0FBQUE7O0FBQzVCLE1BQU0sTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVo7O0FBRUEsU0FBTyxNQUFQLENBQWUsR0FBZixFQUFvQjtBQUNsQixRQUFRLEtBQUksTUFBSixFQURVO0FBRWxCLFlBQVE7QUFGVSxHQUFwQjs7QUFLQSxNQUFJLElBQUosR0FBVyxJQUFJLFFBQUosR0FBZSxJQUFJLEVBQTlCOztBQUVBLFNBQU8sR0FBUDtBQUNELENBWEQ7OztBQ3ZDQTs7QUFFQSxJQUFJLE1BQVUsUUFBUyxPQUFULENBQWQ7QUFBQSxJQUNJLFVBQVUsUUFBUyxXQUFULENBRGQ7QUFBQSxJQUVJLE9BQVUsUUFBUyxRQUFULENBRmQ7QUFBQSxJQUdJLE9BQVUsUUFBUyxRQUFULENBSGQ7QUFBQSxJQUlJLFNBQVUsUUFBUyxVQUFULENBSmQ7QUFBQSxJQUtJLFdBQVc7QUFDVCxRQUFLLFlBREksRUFDVSxRQUFPLElBRGpCLEVBQ3VCLE9BQU0sR0FEN0IsRUFDa0MsT0FBTSxDQUR4QyxFQUMyQyxTQUFRO0FBRG5ELENBTGY7O0FBU0EsT0FBTyxPQUFQLEdBQWlCLGlCQUFTOztBQUV4QixNQUFJLGFBQWEsT0FBTyxNQUFQLENBQWUsRUFBZixFQUFtQixRQUFuQixFQUE2QixLQUE3QixDQUFqQjtBQUNBLE1BQUksU0FBUyxJQUFJLFlBQUosQ0FBa0IsV0FBVyxNQUE3QixDQUFiOztBQUVBLE1BQUksT0FBTyxXQUFXLElBQVgsR0FBa0IsR0FBbEIsR0FBd0IsV0FBVyxNQUFuQyxHQUE0QyxHQUE1QyxHQUFrRCxXQUFXLEtBQTdELEdBQXFFLEdBQXJFLEdBQTJFLFdBQVcsT0FBdEYsR0FBZ0csR0FBaEcsR0FBc0csV0FBVyxLQUE1SDtBQUNBLE1BQUksT0FBTyxJQUFJLE9BQUosQ0FBWSxPQUFaLENBQXFCLElBQXJCLENBQVAsS0FBdUMsV0FBM0MsRUFBeUQ7O0FBRXZELFNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxXQUFXLE1BQS9CLEVBQXVDLEdBQXZDLEVBQTZDO0FBQzNDLGFBQVEsQ0FBUixJQUFjLFFBQVMsV0FBVyxJQUFwQixFQUE0QixXQUFXLE1BQXZDLEVBQStDLENBQS9DLEVBQWtELFdBQVcsS0FBN0QsRUFBb0UsV0FBVyxLQUEvRSxDQUFkO0FBQ0Q7O0FBRUQsUUFBSSxXQUFXLE9BQVgsS0FBdUIsSUFBM0IsRUFBa0M7QUFDaEMsYUFBTyxPQUFQO0FBQ0Q7QUFDRCxRQUFJLE9BQUosQ0FBWSxPQUFaLENBQXFCLElBQXJCLElBQThCLEtBQU0sTUFBTixDQUE5QjtBQUNEOztBQUVELE1BQUksT0FBTyxJQUFJLE9BQUosQ0FBWSxPQUFaLENBQXFCLElBQXJCLENBQVg7QUFDQSxPQUFLLElBQUwsR0FBWSxRQUFRLElBQUksTUFBSixFQUFwQjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQXRCRDs7O0FDWEE7O0FBRUEsSUFBSSxPQUFNLFFBQVMsVUFBVCxDQUFWOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsSUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBYjtBQUFBLFFBQW9DLFlBQXBDOztBQUVBLFVBQU0sS0FBSyxNQUFMLENBQVksQ0FBWixNQUFtQixLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQW5CLEdBQW9DLENBQXBDLGNBQWlELEtBQUssSUFBdEQsWUFBaUUsT0FBTyxDQUFQLENBQWpFLGFBQWtGLE9BQU8sQ0FBUCxDQUFsRixjQUFOOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixTQUEyQixLQUFLLElBQWhDOztBQUVBLFdBQU8sTUFBSyxLQUFLLElBQVYsRUFBa0IsR0FBbEIsQ0FBUDtBQUNEO0FBWFMsQ0FBWjs7QUFlQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxHQUFGLEVBQU8sR0FBUCxFQUFnQjtBQUMvQixNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYO0FBQ0EsU0FBTyxNQUFQLENBQWUsSUFBZixFQUFxQjtBQUNuQixTQUFTLEtBQUksTUFBSixFQURVO0FBRW5CLFlBQVMsQ0FBRSxHQUFGLEVBQU8sR0FBUDtBQUZVLEdBQXJCOztBQUtBLE9BQUssSUFBTCxRQUFlLEtBQUssUUFBcEIsR0FBK0IsS0FBSyxHQUFwQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQVZEOzs7QUNuQkE7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsUUFBSyxLQURLOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUlBLFFBQU0sWUFBWSxLQUFJLElBQUosS0FBYSxTQUEvQjtBQUNBLFFBQU0sTUFBTSxZQUFXLEVBQVgsR0FBZ0IsTUFBNUI7O0FBRUEsUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQUosRUFBeUI7QUFDdkIsV0FBSSxRQUFKLENBQWEsR0FBYixxQkFBcUIsS0FBSyxJQUExQixFQUFrQyxZQUFZLFVBQVosR0FBeUIsS0FBSyxHQUFoRTs7QUFFQSxZQUFTLEdBQVQsYUFBb0IsT0FBTyxDQUFQLENBQXBCO0FBRUQsS0FMRCxNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBckJTLENBQVo7O0FBd0JBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVY7O0FBRUEsTUFBSSxNQUFKLEdBQWEsQ0FBRSxDQUFGLENBQWI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FORDs7Ozs7Ozs7O0FDNUJBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLElBQU0sUUFBUSxRQUFTLFlBQVQsQ0FBZDs7QUFFQSxJQUFNLE9BQU8sU0FBUCxJQUFPLEdBQTZDO0FBQUEsTUFBbkMsSUFBbUMsdUVBQTVCLE1BQTRCO0FBQUEsTUFBcEIsVUFBb0IsdUVBQVAsSUFBTzs7QUFDeEQsTUFBTSxTQUFTLEVBQWY7QUFDQSxNQUFJLGlCQUFKOztBQUVBLE1BQUksT0FBTyxnQkFBUCxLQUE0QixVQUE1QixJQUEwQyxFQUFFLGtCQUFrQixhQUFhLFNBQWpDLENBQTlDLEVBQTJGO0FBQ3pGLFNBQUssZ0JBQUwsR0FBd0IsU0FBUyxnQkFBVCxDQUEyQixPQUEzQixFQUFvQyxJQUFwQyxFQUEwQyxPQUExQyxFQUFtRDtBQUN6RSxVQUFNLFlBQVksd0JBQXdCLE9BQXhCLEVBQWlDLElBQWpDLENBQWxCO0FBQ0EsVUFBTSxpQkFBaUIsV0FBVyxRQUFRLGtCQUFuQixHQUF3QyxRQUFRLGtCQUFSLENBQTJCLENBQTNCLENBQXhDLEdBQXdFLENBQS9GO0FBQ0EsVUFBTSxrQkFBa0IsUUFBUSxxQkFBUixDQUErQixVQUEvQixFQUEyQyxDQUEzQyxFQUE4QyxjQUE5QyxDQUF4Qjs7QUFFQSxzQkFBZ0IsVUFBaEIsR0FBNkIsSUFBSSxHQUFKLEVBQTdCO0FBQ0EsVUFBSSxVQUFVLFVBQWQsRUFBMEI7QUFDeEIsYUFBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLFVBQVUsVUFBVixDQUFxQixNQUF6QyxFQUFpRCxHQUFqRCxFQUFzRDtBQUNwRCxjQUFNLE9BQU8sVUFBVSxVQUFWLENBQXFCLENBQXJCLENBQWI7QUFDQSxjQUFNLE9BQU8sUUFBUSxVQUFSLEdBQXFCLElBQWxDO0FBQ0EsZUFBSyxLQUFMLEdBQWEsS0FBSyxZQUFsQjtBQUNBO0FBQ0EsMEJBQWdCLFVBQWhCLENBQTJCLEdBQTNCLENBQStCLEtBQUssSUFBcEMsRUFBMEMsSUFBMUM7QUFDRDtBQUNGOztBQUVELFVBQU0sS0FBSyxJQUFJLGNBQUosRUFBWDtBQUNBLGlCQUFXLEdBQUcsS0FBZDtBQUNBLFVBQU0sT0FBTyxJQUFJLFVBQVUsU0FBZCxDQUF3QixXQUFXLEVBQW5DLENBQWI7QUFDQSxpQkFBVyxJQUFYOztBQUVBLHNCQUFnQixJQUFoQixHQUF1QixHQUFHLEtBQTFCO0FBQ0Esc0JBQWdCLFNBQWhCLEdBQTRCLFNBQTVCO0FBQ0Esc0JBQWdCLFFBQWhCLEdBQTJCLElBQTNCO0FBQ0Esc0JBQWdCLGNBQWhCLEdBQWlDLGNBQWpDO0FBQ0EsYUFBTyxlQUFQO0FBQ0QsS0ExQkQ7O0FBNEJBLFdBQU8sY0FBUCxDQUFzQixDQUFDLEtBQUssWUFBTCxJQUFxQixLQUFLLGtCQUEzQixFQUErQyxTQUFyRSxFQUFnRixjQUFoRixFQUFnRztBQUM5RixTQUQ4RixpQkFDdkY7QUFDTCxlQUFPLEtBQUssY0FBTCxLQUF3QixLQUFLLGNBQUwsR0FBc0IsSUFBSSxLQUFLLFlBQVQsQ0FBc0IsSUFBdEIsQ0FBOUMsQ0FBUDtBQUNEO0FBSDZGLEtBQWhHOztBQU1BO0FBQ0EsUUFBTSx3QkFBd0IsU0FBeEIscUJBQXdCLEdBQVc7QUFDdkMsV0FBSyxJQUFMLEdBQVksUUFBWjtBQUNELEtBRkQ7QUFHQSwwQkFBc0IsU0FBdEIsR0FBa0MsRUFBbEM7O0FBRUEsU0FBSyxZQUFMO0FBQ0UsNEJBQWEsWUFBYixFQUEyQjtBQUFBOztBQUN6QixhQUFLLFNBQUwsR0FBaUIsWUFBakI7QUFDRDs7QUFISDtBQUFBO0FBQUEsa0NBS2EsR0FMYixFQUtrQixPQUxsQixFQUsyQjtBQUFBOztBQUN2QixpQkFBTyxNQUFNLEdBQU4sRUFBVyxJQUFYLENBQWdCLGFBQUs7QUFDMUIsZ0JBQUksQ0FBQyxFQUFFLEVBQVAsRUFBVyxNQUFNLE1BQU0sRUFBRSxNQUFSLENBQU47QUFDWCxtQkFBTyxFQUFFLElBQUYsRUFBUDtBQUNELFdBSE0sRUFHSixJQUhJLENBR0UsZ0JBQVE7QUFDZixnQkFBTSxVQUFVO0FBQ2QsMEJBQVksTUFBSyxTQUFMLENBQWUsVUFEYjtBQUVkLDJCQUFhLE1BQUssU0FBTCxDQUFlLFdBRmQ7QUFHZCwwREFIYztBQUlkLGlDQUFtQiwyQkFBQyxJQUFELEVBQU8sU0FBUCxFQUFxQjtBQUN0QyxvQkFBTSxhQUFhLHdCQUF3QixNQUFLLFNBQTdCLENBQW5CO0FBQ0EsMkJBQVcsSUFBWCxJQUFtQjtBQUNqQiw4QkFEaUI7QUFFakIsa0NBRmlCO0FBR2pCLHNDQUhpQjtBQUlqQiw4QkFBWSxVQUFVLG9CQUFWLElBQWtDO0FBSjdCLGlCQUFuQjtBQU1EO0FBWmEsYUFBaEI7O0FBZUEsb0JBQVEsSUFBUixHQUFlLE9BQWY7QUFDQSxnQkFBTSxRQUFRLElBQUksS0FBSixDQUFVLE9BQVYsRUFBbUIsU0FBUyxlQUE1QixDQUFkO0FBQ0Esa0JBQU0sSUFBTixDQUFXLENBQUUsV0FBVyxRQUFRLFNBQXBCLElBQWtDLE1BQW5DLEVBQTJDLElBQTNDLENBQVg7QUFDQSxtQkFBTyxJQUFQO0FBQ0QsV0F2Qk0sQ0FBUDtBQXdCRDtBQTlCSDs7QUFBQTtBQUFBO0FBZ0NEOztBQUVELFdBQVMsY0FBVCxDQUF5QixDQUF6QixFQUE0QjtBQUFBOztBQUMxQixRQUFNLGFBQWEsRUFBbkI7QUFDQSxRQUFJLFFBQVEsQ0FBQyxDQUFiO0FBQ0EsU0FBSyxVQUFMLENBQWdCLE9BQWhCLENBQXdCLFVBQUMsS0FBRCxFQUFRLEdBQVIsRUFBZ0I7QUFDdEMsVUFBTSxNQUFNLE9BQU8sRUFBRSxLQUFULE1BQW9CLE9BQU8sS0FBUCxJQUFnQixJQUFJLFlBQUosQ0FBaUIsT0FBSyxVQUF0QixDQUFwQyxDQUFaO0FBQ0E7QUFDQSxVQUFJLElBQUosQ0FBUyxNQUFNLEtBQWY7QUFDQSxpQkFBVyxHQUFYLElBQWtCLEdBQWxCO0FBQ0QsS0FMRDtBQU1BLFNBQUssU0FBTCxDQUFlLEtBQWYsQ0FBcUIsSUFBckIsQ0FDRSxnQ0FBZ0MsS0FBSyxPQUFMLENBQWEsVUFBN0MsR0FBMEQsR0FBMUQsR0FDQSwrQkFEQSxHQUNrQyxLQUFLLE9BQUwsQ0FBYSxXQUZqRDtBQUlBLFFBQU0sU0FBUyxlQUFlLEVBQUUsV0FBakIsQ0FBZjtBQUNBLFFBQU0sVUFBVSxlQUFlLEVBQUUsWUFBakIsQ0FBaEI7QUFDQSxTQUFLLFFBQUwsQ0FBYyxPQUFkLENBQXNCLENBQUMsTUFBRCxDQUF0QixFQUFnQyxDQUFDLE9BQUQsQ0FBaEMsRUFBMkMsVUFBM0M7QUFDRDs7QUFFRCxXQUFTLGNBQVQsQ0FBeUIsRUFBekIsRUFBNkI7QUFDM0IsUUFBTSxNQUFNLEVBQVo7QUFDQSxTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksR0FBRyxnQkFBdkIsRUFBeUMsR0FBekMsRUFBOEM7QUFDNUMsVUFBSSxDQUFKLElBQVMsR0FBRyxjQUFILENBQWtCLENBQWxCLENBQVQ7QUFDRDtBQUNELFdBQU8sR0FBUDtBQUNEOztBQUVELFdBQVMsdUJBQVQsQ0FBa0MsWUFBbEMsRUFBZ0Q7QUFDOUMsV0FBTyxhQUFhLFlBQWIsS0FBOEIsYUFBYSxZQUFiLEdBQTRCLEVBQTFELENBQVA7QUFDRDtBQUNGLENBNUdEOztBQThHQSxPQUFPLE9BQVAsR0FBaUIsSUFBakI7Ozs7O0FDeElBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLE9BQU8sT0FBUCxHQUFpQixTQUFTLEtBQVQsQ0FBZ0IsS0FBaEIsRUFBdUIsYUFBdkIsRUFBc0M7QUFDckQsTUFBTSxRQUFRLFNBQVMsYUFBVCxDQUF1QixRQUF2QixDQUFkO0FBQ0EsUUFBTSxLQUFOLENBQVksT0FBWixHQUFzQiwyREFBdEI7QUFDQSxnQkFBYyxXQUFkLENBQTBCLEtBQTFCO0FBQ0EsTUFBTSxNQUFNLE1BQU0sYUFBbEI7QUFDQSxNQUFNLE1BQU0sSUFBSSxRQUFoQjtBQUNBLE1BQUksT0FBTyxrQkFBWDtBQUNBLE9BQUssSUFBTSxDQUFYLElBQWdCLEdBQWhCLEVBQXFCO0FBQ25CLFFBQUksRUFBRSxLQUFLLEtBQVAsS0FBaUIsTUFBTSxNQUEzQixFQUFtQztBQUNqQyxjQUFRLEdBQVI7QUFDQSxjQUFRLENBQVI7QUFDRDtBQUNGO0FBQ0QsT0FBSyxJQUFNLEVBQVgsSUFBZ0IsS0FBaEIsRUFBdUI7QUFDckIsWUFBUSxHQUFSO0FBQ0EsWUFBUSxFQUFSO0FBQ0EsWUFBUSxRQUFSO0FBQ0EsWUFBUSxFQUFSO0FBQ0Q7QUFDRCxNQUFNLFNBQVMsSUFBSSxhQUFKLENBQWtCLFFBQWxCLENBQWY7QUFDQSxTQUFPLFdBQVAsQ0FBbUIsSUFBSSxjQUFKLDJEQUVYLElBRlcscURBQW5CO0FBSUEsTUFBSSxJQUFKLENBQVMsV0FBVCxDQUFxQixNQUFyQjtBQUNBLE9BQUssSUFBTCxHQUFZLElBQUksS0FBSixDQUFVLElBQVYsQ0FBZSxLQUFmLEVBQXNCLEtBQXRCLEVBQTZCLE9BQTdCLENBQVo7QUFDRCxDQTFCRDs7O0FDaEJBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLE9BREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EsUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQUosRUFBeUI7QUFDdkI7O0FBRUEsbUJBQVcsT0FBTyxDQUFQLENBQVg7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLE9BQU8sQ0FBUCxJQUFZLENBQWxCO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFqQlMsQ0FBWjs7QUFvQkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxRQUFRLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWjs7QUFFQSxRQUFNLE1BQU4sR0FBZSxDQUFFLENBQUYsQ0FBZjs7QUFFQSxTQUFPLEtBQVA7QUFDRCxDQU5EOzs7QUN4QkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsTUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxhQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjtBQUFBLFFBRUksWUFGSjs7QUFJQSxVQUFNLEtBQUssY0FBTCxDQUFxQixPQUFPLENBQVAsQ0FBckIsRUFBZ0MsS0FBSyxHQUFyQyxFQUEwQyxLQUFLLEdBQS9DLENBQU47O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBTCxHQUFZLFFBQXBDOztBQUVBLFdBQU8sQ0FBRSxLQUFLLElBQUwsR0FBWSxRQUFkLEVBQXdCLEdBQXhCLENBQVA7QUFDRCxHQWJTO0FBZVYsZ0JBZlUsMEJBZU0sQ0FmTixFQWVTLEVBZlQsRUFlYSxFQWZiLEVBZWtCO0FBQzFCLFFBQUksZ0JBQ0EsS0FBSyxJQURMLGlCQUNxQixDQURyQixpQkFFQSxLQUFLLElBRkwsaUJBRXFCLEVBRnJCLFdBRTZCLEVBRjdCLGlCQUdBLEtBQUssSUFITCw4QkFLRCxLQUFLLElBTEosa0JBS3FCLEVBTHJCLGdCQU1GLEtBQUssSUFOSCxrQkFNb0IsS0FBSyxJQU56Qix1QkFPQyxLQUFLLElBUE4sa0JBT3VCLEVBUHZCLGtCQVFBLEtBQUssSUFSTCxzQkFRMEIsS0FBSyxJQVIvQixpQkFRK0MsRUFSL0MsWUFRd0QsS0FBSyxJQVI3RCwyQkFTQSxLQUFLLElBVEwsa0JBU3NCLEtBQUssSUFUM0IsaUJBUzJDLEtBQUssSUFUaEQsOEJBV0YsS0FBSyxJQVhILGlDQVlNLEtBQUssSUFaWCxpQkFZMkIsRUFaM0IsZ0JBYUYsS0FBSyxJQWJILGtCQWFvQixLQUFLLElBYnpCLHVCQWNDLEtBQUssSUFkTixpQkFjc0IsRUFkdEIsa0JBZUEsS0FBSyxJQWZMLHNCQWUwQixLQUFLLElBZi9CLGlCQWUrQyxFQWYvQyxZQWV3RCxLQUFLLElBZjdELDhCQWdCQSxLQUFLLElBaEJMLGtCQWdCc0IsS0FBSyxJQWhCM0IsaUJBZ0IyQyxLQUFLLElBaEJoRCw4QkFrQkYsS0FBSyxJQWxCSCwrQkFvQkQsS0FBSyxJQXBCSix1QkFvQjBCLEtBQUssSUFwQi9CLGlCQW9CK0MsRUFwQi9DLFdBb0J1RCxFQXBCdkQsV0FvQitELEtBQUssSUFwQnBFLGFBQUo7QUFzQkEsV0FBTyxNQUFNLEdBQWI7QUFDRDtBQXZDUyxDQUFaOztBQTBDQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxHQUFGLEVBQXlCO0FBQUEsTUFBbEIsR0FBa0IsdUVBQWQsQ0FBYztBQUFBLE1BQVgsR0FBVyx1RUFBUCxDQUFPOztBQUN4QyxNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsWUFEbUI7QUFFbkIsWUFGbUI7QUFHbkIsU0FBUSxLQUFJLE1BQUosRUFIVztBQUluQixZQUFRLENBQUUsR0FBRjtBQUpXLEdBQXJCOztBQU9BLE9BQUssSUFBTCxRQUFlLEtBQUssUUFBcEIsR0FBK0IsS0FBSyxHQUFwQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQWJEOzs7QUM5Q0E7Ozs7QUFFQSxJQUFJLE9BQU0sUUFBUyxVQUFULENBQVY7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxNQURDO0FBRVYsaUJBQWMsSUFGSixFQUVVO0FBQ3BCLEtBSFUsaUJBR0o7QUFDSixRQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiO0FBQUEsUUFBb0MsWUFBcEM7O0FBRUEsU0FBSSxhQUFKLENBQW1CLEtBQUssTUFBeEI7O0FBRUEsUUFBSSxxQkFBcUIsYUFBYSxLQUFLLE1BQUwsQ0FBWSxTQUFaLENBQXNCLEdBQW5DLEdBQXlDLElBQWxFO0FBQUEsUUFDSSx1QkFBdUIsS0FBSyxNQUFMLENBQVksU0FBWixDQUFzQixHQUF0QixHQUE0QixDQUR2RDtBQUFBLFFBRUksY0FBYyxPQUFPLENBQVAsQ0FGbEI7QUFBQSxRQUdJLGdCQUFnQixPQUFPLENBQVAsQ0FIcEI7O0FBS0E7Ozs7Ozs7O0FBUUEsb0JBRUksYUFGSixhQUV5QixrQkFGekIsMEJBR1Usa0JBSFYsV0FHa0Msb0JBSGxDLHNCQUlFLGtCQUpGLFdBSTBCLGFBSjFCLHlCQU1RLG9CQU5SLFdBTWtDLGFBTmxDLGFBTXVELFdBTnZEO0FBU0EsU0FBSyxhQUFMLEdBQXFCLE9BQU8sQ0FBUCxDQUFyQjtBQUNBLFNBQUssV0FBTCxHQUFtQixJQUFuQjs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUE3Qjs7QUFFQSxTQUFLLE9BQUwsQ0FBYSxPQUFiLENBQXNCO0FBQUEsYUFBSyxFQUFFLEdBQUYsRUFBTDtBQUFBLEtBQXRCOztBQUVBLFdBQU8sQ0FBRSxJQUFGLEVBQVEsTUFBTSxHQUFkLENBQVA7QUFDRCxHQXRDUztBQXdDVixVQXhDVSxzQkF3Q0M7QUFDVCxRQUFJLEtBQUssTUFBTCxDQUFZLFdBQVosS0FBNEIsS0FBaEMsRUFBd0M7QUFDdEMsV0FBSSxTQUFKLENBQWUsSUFBZixFQURzQyxDQUNoQjtBQUN2Qjs7QUFFRCxRQUFJLEtBQUksSUFBSixDQUFVLEtBQUssSUFBZixNQUEwQixTQUE5QixFQUEwQztBQUN4QyxXQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4Qjs7QUFFQSxXQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsaUJBQW1DLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBckQ7QUFDRDs7QUFFRCx3QkFBbUIsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFyQztBQUNEO0FBcERTLENBQVo7O0FBdURBLE9BQU8sT0FBUCxHQUFpQixVQUFFLE9BQUYsRUFBVyxHQUFYLEVBQWdCLFVBQWhCLEVBQWdDO0FBQy9DLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7QUFBQSxNQUNJLFdBQVcsRUFBRSxPQUFPLENBQVQsRUFEZjs7QUFHQSxNQUFJLFFBQU8sVUFBUCx5Q0FBTyxVQUFQLE9BQXNCLFNBQTFCLEVBQXNDLE9BQU8sTUFBUCxDQUFlLFFBQWYsRUFBeUIsVUFBekI7O0FBRXRDLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsYUFBUyxFQURVO0FBRW5CLFNBQVMsS0FBSSxNQUFKLEVBRlU7QUFHbkIsWUFBUyxDQUFFLEdBQUYsRUFBTyxPQUFQLENBSFU7QUFJbkIsWUFBUTtBQUNOLGlCQUFXLEVBQUUsUUFBTyxDQUFULEVBQVksS0FBSSxJQUFoQjtBQURMLEtBSlc7QUFPbkIsaUJBQVk7QUFQTyxHQUFyQixFQVNBLFFBVEE7O0FBV0EsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFwQixHQUErQixLQUFJLE1BQUosRUFBL0I7O0FBRUEsT0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLEtBQUssS0FBekIsRUFBZ0MsR0FBaEMsRUFBc0M7QUFDcEMsU0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQjtBQUNoQixhQUFNLENBRFU7QUFFaEIsV0FBSyxNQUFNLFFBRks7QUFHaEIsY0FBTyxJQUhTO0FBSWhCLGNBQVEsQ0FBRSxJQUFGLENBSlE7QUFLaEIsY0FBUTtBQUNOLGVBQU8sRUFBRSxRQUFPLENBQVQsRUFBWSxLQUFJLElBQWhCO0FBREQsT0FMUTtBQVFoQixtQkFBWSxLQVJJO0FBU2hCLFlBQVMsS0FBSyxJQUFkLFlBQXlCLEtBQUksTUFBSjtBQVRULEtBQWxCO0FBV0Q7O0FBRUQsU0FBTyxJQUFQO0FBQ0QsQ0FsQ0Q7OztBQzNEQTs7QUFFQTs7Ozs7Ozs7OztBQUtBLElBQU0sZUFBZSxRQUFTLGVBQVQsQ0FBckI7QUFDQSxJQUFNLEtBQUssUUFBUyxRQUFULEVBQW9CLFlBQS9COztBQUVBLElBQU0sTUFBTTs7QUFFVixTQUFNLENBRkk7QUFHVixRQUhVLG9CQUdEO0FBQUUsV0FBTyxLQUFLLEtBQUwsRUFBUDtBQUFxQixHQUh0Qjs7QUFJVixTQUFNLEtBSkk7QUFLVixjQUFZLEtBTEYsRUFLUztBQUNuQixrQkFBZ0IsS0FOTjtBQU9WLFNBQU0sSUFQSTtBQVFWLFdBQVE7QUFDTixhQUFTO0FBREgsR0FSRTtBQVdWLFFBQUssU0FYSzs7QUFhVjs7Ozs7O0FBTUEsWUFBVSxJQUFJLEdBQUosRUFuQkE7QUFvQlYsVUFBVSxJQUFJLEdBQUosRUFwQkE7QUFxQlYsVUFBVSxJQUFJLEdBQUosRUFyQkE7O0FBdUJWLGNBQVksSUFBSSxHQUFKLEVBdkJGO0FBd0JWLFlBQVUsSUFBSSxHQUFKLEVBeEJBO0FBeUJWLGFBQVcsSUFBSSxHQUFKLEVBekJEOztBQTJCVixRQUFNLEVBM0JJOztBQTZCVjs7QUFFQTs7Ozs7QUFLQSxRQXBDVSxtQkFvQ0YsR0FwQ0UsRUFvQ0ksQ0FBRSxDQXBDTjtBQXNDVixlQXRDVSx5QkFzQ0ssQ0F0Q0wsRUFzQ1M7QUFDakIsU0FBSyxRQUFMLENBQWMsR0FBZCxDQUFtQixPQUFPLENBQTFCO0FBQ0QsR0F4Q1M7QUEwQ1YsZUExQ1UseUJBMENLLFVBMUNMLEVBMENtQztBQUFBLFFBQWxCLFNBQWtCLHVFQUFSLEtBQVE7O0FBQzNDLFNBQUssSUFBSSxHQUFULElBQWdCLFVBQWhCLEVBQTZCO0FBQzNCLFVBQUksVUFBVSxXQUFZLEdBQVosQ0FBZDs7QUFFQTs7QUFFQSxVQUFJLFFBQVEsTUFBUixLQUFtQixTQUF2QixFQUFtQztBQUNqQyxnQkFBUSxHQUFSLENBQWEsdUJBQWIsRUFBc0MsR0FBdEM7O0FBRUE7QUFDRDs7QUFFRCxjQUFRLEdBQVIsR0FBYyxJQUFJLE1BQUosQ0FBVyxLQUFYLENBQWtCLFFBQVEsTUFBMUIsRUFBa0MsU0FBbEMsQ0FBZDtBQUNEO0FBQ0YsR0F4RFM7QUEwRFYsY0ExRFUsMEJBMER3QjtBQUFBLFFBQXBCLE1BQW9CLHVFQUFiLElBQWE7QUFBQSxRQUFQLElBQU87O0FBQ2hDLFFBQU0sTUFBTSxhQUFhLE1BQWIsQ0FBcUIsTUFBckIsRUFBNkIsSUFBN0IsQ0FBWjtBQUNBLFdBQU8sR0FBUDtBQUNELEdBN0RTO0FBK0RWLGdCQS9EVSwwQkErRE0sSUEvRE4sRUErRFksR0EvRFosRUErRG1GO0FBQUEsUUFBbEUsS0FBa0UsdUVBQTFELEtBQTBEO0FBQUEsUUFBbkQsa0JBQW1ELHVFQUFoQyxLQUFnQztBQUFBLFFBQXpCLE9BQXlCLHVFQUFmLFlBQWU7O0FBQzNGLFFBQUksV0FBVyxNQUFNLE9BQU4sQ0FBZSxJQUFmLEtBQXlCLEtBQUssTUFBTCxHQUFjLENBQXREO0FBQUEsUUFDSSxpQkFESjtBQUFBLFFBRUksaUJBRko7QUFBQSxRQUVjLGlCQUZkOztBQUlBLFFBQUksT0FBTyxHQUFQLEtBQWUsUUFBZixJQUEyQixRQUFRLFNBQXZDLEVBQW1EO0FBQ2pELFdBQUssTUFBTCxHQUFjLEtBQUssWUFBTCxDQUFtQixHQUFuQixFQUF3QixPQUF4QixDQUFkO0FBQ0QsS0FGRCxNQUVLO0FBQ0gsV0FBSyxNQUFMLEdBQWMsR0FBZDtBQUNEOztBQUVELFNBQUssU0FBTCxHQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQW1CLENBQW5CLEVBQXNCLElBQXRCLENBQWpCO0FBQ0EsU0FBSyxJQUFMLENBQVcsYUFBWDs7QUFFQTtBQUNBLFNBQUssS0FBTCxHQUFhLElBQWI7QUFDQSxTQUFLLElBQUwsR0FBWSxFQUFaO0FBQ0EsU0FBSyxRQUFMLENBQWMsS0FBZDtBQUNBLFNBQUssUUFBTCxDQUFjLEtBQWQ7QUFDQSxTQUFLLE1BQUwsQ0FBWSxLQUFaO0FBQ0EsU0FBSyxNQUFMLENBQVksS0FBWjtBQUNBLFNBQUssT0FBTCxHQUFlLEVBQUUsU0FBUSxFQUFWLEVBQWY7O0FBRUEsU0FBSyxVQUFMLENBQWdCLEtBQWhCOztBQUVBLFNBQUssWUFBTCxHQUFvQixrQkFBcEI7QUFDQSxRQUFJLHVCQUFxQixLQUF6QixFQUFpQztBQUMvQixXQUFLLFlBQUwsSUFBcUIsS0FBSyxJQUFMLEtBQWMsU0FBZCxHQUNuQixnQ0FEbUIsR0FFbkIsK0JBRkY7QUFHRDs7QUFFRDtBQUNBO0FBQ0EsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLElBQUksUUFBeEIsRUFBa0MsR0FBbEMsRUFBd0M7QUFDdEMsVUFBSSxPQUFPLEtBQUssQ0FBTCxDQUFQLEtBQW1CLFFBQXZCLEVBQWtDOztBQUVsQztBQUNBLFVBQUksVUFBVSxXQUFXLEtBQUssUUFBTCxDQUFlLEtBQUssQ0FBTCxDQUFmLENBQVgsR0FBc0MsS0FBSyxRQUFMLENBQWUsSUFBZixDQUFwRDtBQUFBLFVBQ0ksT0FBTyxFQURYOztBQUdBO0FBQ0E7QUFDQTtBQUNBLGNBQVEsTUFBTSxPQUFOLENBQWUsT0FBZixJQUEyQixRQUFRLENBQVIsSUFBYSxJQUFiLEdBQW9CLFFBQVEsQ0FBUixDQUEvQyxHQUE0RCxPQUFwRTs7QUFFQTtBQUNBLGFBQU8sS0FBSyxLQUFMLENBQVcsSUFBWCxDQUFQOztBQUVBOztBQUVBO0FBQ0EsVUFBSSxLQUFNLEtBQUssTUFBTCxHQUFhLENBQW5CLEVBQXVCLElBQXZCLEdBQThCLE9BQTlCLENBQXNDLEtBQXRDLElBQStDLENBQUMsQ0FBcEQsRUFBd0Q7QUFBRSxhQUFLLElBQUwsQ0FBVyxJQUFYO0FBQW1COztBQUU3RTtBQUNBLFVBQUksVUFBVSxLQUFLLE1BQUwsR0FBYyxDQUE1Qjs7QUFFQTtBQUNBLFdBQU0sT0FBTixJQUFrQixlQUFlLEtBQUssU0FBTCxHQUFpQixDQUFoQyxJQUFxQyxPQUFyQyxHQUErQyxLQUFNLE9BQU4sQ0FBL0MsR0FBaUUsSUFBbkY7O0FBRUEsV0FBSyxZQUFMLElBQXFCLEtBQUssSUFBTCxDQUFVLElBQVYsQ0FBckI7QUFDRDs7QUFFRCxTQUFLLFNBQUwsQ0FBZSxPQUFmLENBQXdCLGlCQUFTO0FBQy9CLFVBQUksVUFBVSxJQUFkLEVBQ0UsTUFBTSxHQUFOO0FBQ0gsS0FIRDs7QUFLQSxRQUFNLGtCQUFrQixrQ0FBZ0MsS0FBSyxTQUFyQyxtQkFBMkQsS0FBSyxTQUFMLEdBQWlCLENBQTVFLGlDQUF3RyxLQUFLLFNBQTdHLE1BQXhCOztBQUVBLFNBQUssWUFBTCxHQUFvQixLQUFLLFlBQUwsQ0FBa0IsS0FBbEIsQ0FBd0IsSUFBeEIsQ0FBcEI7O0FBRUEsUUFBSSxLQUFLLFFBQUwsQ0FBYyxJQUFsQixFQUF5QjtBQUN2QixXQUFLLFlBQUwsR0FBb0IsS0FBSyxZQUFMLENBQWtCLE1BQWxCLENBQTBCLE1BQU0sSUFBTixDQUFZLEtBQUssUUFBakIsQ0FBMUIsQ0FBcEI7QUFDQSxXQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBd0IsZUFBeEI7QUFDRCxLQUhELE1BR0s7QUFDSCxXQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBd0IsZUFBeEI7QUFDRDtBQUNEO0FBQ0EsU0FBSyxZQUFMLEdBQW9CLEtBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixJQUF2QixDQUFwQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFJLHVCQUF1QixJQUEzQixFQUFrQztBQUNoQyxXQUFLLFVBQUwsQ0FBZ0IsR0FBaEIsQ0FBcUIsUUFBckI7QUFDRDs7QUFFRCxRQUFJLGNBQWMsRUFBbEI7QUFDQSxRQUFJLEtBQUssSUFBTCxLQUFjLFNBQWxCLEVBQThCO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQzVCLDZCQUFpQixLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsRUFBakIsOEhBQTRDO0FBQUEsY0FBbkMsSUFBbUM7O0FBQzFDLHlCQUFlLE9BQU8sR0FBdEI7QUFDRDtBQUgyQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUk1QixvQkFBYyxZQUFZLEtBQVosQ0FBa0IsQ0FBbEIsRUFBb0IsQ0FBQyxDQUFyQixDQUFkO0FBQ0Q7O0FBRUQsUUFBTSxZQUFZLEtBQUssVUFBTCxDQUFnQixJQUFoQixLQUF5QixDQUF6QixJQUE4QixLQUFLLE1BQUwsQ0FBWSxJQUFaLEdBQW1CLENBQWpELEdBQXFELElBQXJELEdBQTRELEVBQTlFOztBQUVBLFFBQUksY0FBYyxFQUFsQjtBQUNBLFFBQUksS0FBSyxJQUFMLEtBQWMsU0FBbEIsRUFBOEI7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDNUIsOEJBQWlCLEtBQUssTUFBTCxDQUFZLE1BQVosRUFBakIsbUlBQXdDO0FBQUEsY0FBL0IsS0FBK0I7O0FBQ3RDLHlCQUFlLE1BQUssSUFBTCxHQUFZLEdBQTNCO0FBQ0Q7QUFIMkI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7QUFJNUIsb0JBQWMsWUFBWSxLQUFaLENBQWtCLENBQWxCLEVBQW9CLENBQUMsQ0FBckIsQ0FBZDtBQUNEOztBQUVELFFBQUksY0FBYyxLQUFLLElBQUwsS0FBYyxTQUFkLHlCQUNNLFdBRE4sU0FDcUIsU0FEckIsU0FDa0MsV0FEbEMsY0FDdUQsS0FBSyxZQUQ1RCxxQ0FFVyw2QkFBSSxLQUFLLFVBQVQsR0FBcUIsSUFBckIsQ0FBMEIsR0FBMUIsQ0FGWCxjQUVvRCxLQUFLLFlBRnpELFFBQWxCOztBQUlBLFFBQUksS0FBSyxLQUFMLElBQWMsS0FBbEIsRUFBMEIsUUFBUSxHQUFSLENBQWEsV0FBYjs7QUFFMUIsZUFBVyxJQUFJLFFBQUosQ0FBYyxXQUFkLEdBQVg7O0FBRUE7QUFsSDJGO0FBQUE7QUFBQTs7QUFBQTtBQW1IM0YsNEJBQWlCLEtBQUssUUFBTCxDQUFjLE1BQWQsRUFBakIsbUlBQTBDO0FBQUEsWUFBakMsSUFBaUM7O0FBQ3hDLFlBQUksUUFBTyxPQUFPLElBQVAsQ0FBYSxJQUFiLEVBQW9CLENBQXBCLENBQVg7QUFBQSxZQUNJLFFBQVEsS0FBTSxLQUFOLENBRFo7O0FBR0EsaUJBQVUsS0FBVixJQUFtQixLQUFuQjtBQUNEO0FBeEgwRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUEsWUEwSGxGLElBMUhrRjs7QUEySHpGLFlBQUksT0FBTyxPQUFPLElBQVAsQ0FBYSxJQUFiLEVBQW9CLENBQXBCLENBQVg7QUFBQSxZQUNJLE9BQU8sS0FBTSxJQUFOLENBRFg7O0FBR0EsZUFBTyxjQUFQLENBQXVCLFFBQXZCLEVBQWlDLElBQWpDLEVBQXVDO0FBQ3JDLHdCQUFjLElBRHVCO0FBRXJDLGFBRnFDLGlCQUUvQjtBQUFFLG1CQUFPLEtBQUssS0FBWjtBQUFtQixXQUZVO0FBR3JDLGFBSHFDLGVBR2pDLENBSGlDLEVBRy9CO0FBQUUsaUJBQUssS0FBTCxHQUFhLENBQWI7QUFBZ0I7QUFIYSxTQUF2QztBQUtBO0FBbkl5Rjs7QUEwSDNGLDRCQUFpQixLQUFLLE1BQUwsQ0FBWSxNQUFaLEVBQWpCLG1JQUF3QztBQUFBO0FBVXZDO0FBcEkwRjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQXNJM0YsYUFBUyxPQUFULEdBQW1CLEtBQUssUUFBeEI7QUFDQSxhQUFTLElBQVQsR0FBZ0IsS0FBSyxJQUFyQjtBQUNBLGFBQVMsTUFBVCxHQUFrQixLQUFLLE1BQXZCO0FBQ0EsYUFBUyxNQUFULEdBQWtCLEtBQUssTUFBdkI7QUFDQSxhQUFTLFVBQVQsR0FBc0IsS0FBSyxVQUEzQixDQTFJMkYsQ0EwSXREO0FBQ3JDLGFBQVMsR0FBVCxHQUFlLEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsUUFBakIsQ0FBMkIsS0FBSyxTQUFoQyxFQUEyQyxLQUFLLFNBQUwsR0FBaUIsQ0FBNUQsQ0FBZjtBQUNBLGFBQVMsUUFBVCxHQUFvQixRQUFwQjs7QUFFQTtBQUNBLGFBQVMsTUFBVCxHQUFrQixLQUFLLE1BQUwsQ0FBWSxJQUE5Qjs7QUFFQSxTQUFLLFNBQUwsQ0FBZSxLQUFmOztBQUVBLFdBQU8sUUFBUDtBQUNELEdBbk5TOzs7QUFxTlY7Ozs7Ozs7O0FBUUEsV0E3TlUscUJBNk5DLElBN05ELEVBNk5RO0FBQ2hCLFdBQU8sS0FBSyxNQUFMLENBQVksR0FBWixDQUFpQixJQUFJLFFBQXJCLENBQVA7QUFDRCxHQS9OUztBQWlPVixVQWpPVSxvQkFpT0EsS0FqT0EsRUFpT1E7QUFDaEIsUUFBSSxXQUFXLFFBQU8sS0FBUCx5Q0FBTyxLQUFQLE9BQWlCLFFBQWhDO0FBQUEsUUFDSSx1QkFESjs7QUFHQSxRQUFJLFFBQUosRUFBZTtBQUFFO0FBQ2Y7QUFDQSxVQUFJLElBQUksSUFBSixDQUFVLE1BQU0sSUFBaEIsQ0FBSixFQUE2QjtBQUFFO0FBQzdCLHlCQUFpQixJQUFJLElBQUosQ0FBVSxNQUFNLElBQWhCLENBQWpCO0FBQ0QsT0FGRCxNQUVNLElBQUksTUFBTSxPQUFOLENBQWUsS0FBZixDQUFKLEVBQTZCO0FBQ2pDLFlBQUksUUFBSixDQUFjLE1BQU0sQ0FBTixDQUFkO0FBQ0EsWUFBSSxRQUFKLENBQWMsTUFBTSxDQUFOLENBQWQ7QUFDRCxPQUhLLE1BR0Q7QUFBRTtBQUNMLFlBQUksT0FBTyxNQUFNLEdBQWIsS0FBcUIsVUFBekIsRUFBc0M7QUFDcEMsa0JBQVEsR0FBUixDQUFhLGVBQWIsRUFBOEIsS0FBOUIsRUFBcUMsTUFBTSxHQUEzQztBQUNBLGtCQUFRLE1BQU0sS0FBZDtBQUNEO0FBQ0QsWUFBSSxPQUFPLE1BQU0sR0FBTixFQUFYO0FBQ0E7O0FBRUEsWUFBSSxNQUFNLE9BQU4sQ0FBZSxJQUFmLENBQUosRUFBNEI7QUFDMUIsY0FBSSxDQUFDLElBQUksY0FBVCxFQUEwQjtBQUN4QixnQkFBSSxZQUFKLElBQW9CLEtBQUssQ0FBTCxDQUFwQjtBQUNELFdBRkQsTUFFSztBQUNILGdCQUFJLFFBQUosR0FBZSxLQUFLLENBQUwsQ0FBZjtBQUNBLGdCQUFJLGFBQUosQ0FBa0IsSUFBbEIsQ0FBd0IsS0FBSyxDQUFMLENBQXhCO0FBQ0Q7QUFDRDtBQUNBLDJCQUFpQixLQUFLLENBQUwsQ0FBakI7QUFDRCxTQVRELE1BU0s7QUFDSCwyQkFBaUIsSUFBakI7QUFDRDtBQUNGO0FBQ0YsS0E1QkQsTUE0Qks7QUFBRTtBQUNMLHVCQUFpQixLQUFqQjtBQUNEOztBQUVELFdBQU8sY0FBUDtBQUNELEdBdFFTO0FBd1FWLGVBeFFVLDJCQXdRTTtBQUNkLFNBQUssYUFBTCxHQUFxQixFQUFyQjtBQUNBLFNBQUssY0FBTCxHQUFzQixJQUF0QjtBQUNELEdBM1FTO0FBNFFWLGFBNVFVLHlCQTRRSTtBQUNaLFNBQUssY0FBTCxHQUFzQixLQUF0Qjs7QUFFQSxXQUFPLENBQUUsS0FBSyxRQUFQLEVBQWlCLEtBQUssYUFBTCxDQUFtQixLQUFuQixDQUF5QixDQUF6QixDQUFqQixDQUFQO0FBQ0QsR0FoUlM7QUFrUlYsTUFsUlUsZ0JBa1JKLEtBbFJJLEVBa1JJO0FBQ1osUUFBSSxNQUFNLE9BQU4sQ0FBZSxLQUFmLENBQUosRUFBNkI7QUFBRTtBQUFGO0FBQUE7QUFBQTs7QUFBQTtBQUMzQiw4QkFBb0IsS0FBcEIsbUlBQTRCO0FBQUEsY0FBbkIsT0FBbUI7O0FBQzFCLGVBQUssSUFBTCxDQUFXLE9BQVg7QUFDRDtBQUgwQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSTVCLEtBSkQsTUFJTztBQUNMLFVBQUksUUFBTyxLQUFQLHlDQUFPLEtBQVAsT0FBaUIsUUFBckIsRUFBZ0M7QUFDOUIsWUFBSSxNQUFNLE1BQU4sS0FBaUIsU0FBckIsRUFBaUM7QUFDL0IsZUFBSyxJQUFJLFNBQVQsSUFBc0IsTUFBTSxNQUE1QixFQUFxQztBQUNuQyxpQkFBSyxNQUFMLENBQVksSUFBWixDQUFrQixNQUFNLE1BQU4sQ0FBYyxTQUFkLEVBQTBCLEdBQTVDO0FBQ0Q7QUFDRjtBQUNELFlBQUksTUFBTSxPQUFOLENBQWUsTUFBTSxNQUFyQixDQUFKLEVBQW9DO0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQ2xDLGtDQUFpQixNQUFNLE1BQXZCLG1JQUFnQztBQUFBLGtCQUF2QixJQUF1Qjs7QUFDOUIsbUJBQUssSUFBTCxDQUFXLElBQVg7QUFDRDtBQUhpQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBSW5DO0FBQ0Y7QUFDRjtBQUNGO0FBclNTLENBQVo7O0FBd1NBLElBQUksU0FBSixHQUFnQixJQUFJLEVBQUosRUFBaEI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLEdBQWpCOzs7QUNwVEE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsSUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxxQkFBZSxLQUFLLElBQXBCOztBQUVBLFFBQUksTUFBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVAsS0FBMkIsTUFBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVAsQ0FBL0IsRUFBeUQ7QUFDdkQscUJBQWEsT0FBTyxDQUFQLENBQWIsV0FBNEIsT0FBTyxDQUFQLENBQTVCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsYUFBTyxPQUFPLENBQVAsSUFBWSxPQUFPLENBQVAsQ0FBWixHQUF3QixDQUF4QixHQUE0QixDQUFuQztBQUNEO0FBQ0QsV0FBTyxNQUFQOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQTdCOztBQUVBLFdBQU8sQ0FBQyxLQUFLLElBQU4sRUFBWSxHQUFaLENBQVA7QUFDRDtBQW5CUyxDQUFaOztBQXNCQSxPQUFPLE9BQVAsR0FBaUIsVUFBQyxDQUFELEVBQUcsQ0FBSCxFQUFTO0FBQ3hCLE1BQUksS0FBSyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVQ7O0FBRUEsS0FBRyxNQUFILEdBQVksQ0FBRSxDQUFGLEVBQUksQ0FBSixDQUFaO0FBQ0EsS0FBRyxJQUFILEdBQVUsR0FBRyxRQUFILEdBQWMsS0FBSSxNQUFKLEVBQXhCOztBQUVBLFNBQU8sRUFBUDtBQUNELENBUEQ7OztBQzFCQTs7QUFFQSxJQUFJLE9BQU0sUUFBUSxVQUFSLENBQVY7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsUUFBSyxLQURLOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLHFCQUFlLEtBQUssSUFBcEI7O0FBRUEsUUFBSSxNQUFPLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBUCxLQUEyQixNQUFPLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBUCxDQUEvQixFQUF5RDtBQUN2RCxvQkFBWSxPQUFPLENBQVAsQ0FBWixZQUE0QixPQUFPLENBQVAsQ0FBNUI7QUFDRCxLQUZELE1BRU87QUFDTCxhQUFPLE9BQU8sQ0FBUCxLQUFhLE9BQU8sQ0FBUCxDQUFiLEdBQXlCLENBQXpCLEdBQTZCLENBQXBDO0FBQ0Q7QUFDRCxXQUFPLE1BQVA7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBN0I7O0FBRUEsV0FBTyxDQUFDLEtBQUssSUFBTixFQUFZLEdBQVosQ0FBUDtBQUNEO0FBbkJTLENBQVo7O0FBc0JBLE9BQU8sT0FBUCxHQUFpQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDeEIsTUFBSSxLQUFLLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVDs7QUFFQSxLQUFHLE1BQUgsR0FBWSxDQUFFLENBQUYsRUFBSSxDQUFKLENBQVo7QUFDQSxLQUFHLElBQUgsR0FBVSxRQUFRLEtBQUksTUFBSixFQUFsQjs7QUFFQSxTQUFPLEVBQVA7QUFDRCxDQVBEOzs7QUMxQkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFFBQUssS0FESzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFJLE1BQU8sS0FBSyxNQUFMLENBQVksQ0FBWixDQUFQLEtBQTJCLE1BQU8sS0FBSyxNQUFMLENBQVksQ0FBWixDQUFQLENBQS9CLEVBQXlEO0FBQ3ZELGtCQUFVLE9BQVEsQ0FBUixDQUFWLGVBQStCLE9BQU8sQ0FBUCxDQUEvQixXQUE4QyxPQUFPLENBQVAsQ0FBOUM7QUFDRCxLQUZELE1BRU87QUFDTCxZQUFNLE9BQU8sQ0FBUCxLQUFnQixPQUFPLENBQVAsSUFBWSxPQUFPLENBQVAsQ0FBZCxHQUE0QixDQUExQyxDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFkUyxDQUFaOztBQWlCQSxPQUFPLE9BQVAsR0FBaUIsVUFBQyxDQUFELEVBQUcsQ0FBSCxFQUFTO0FBQ3hCLE1BQUksTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVY7O0FBRUEsTUFBSSxNQUFKLEdBQWEsQ0FBRSxDQUFGLEVBQUksQ0FBSixDQUFiOztBQUVBLFNBQU8sR0FBUDtBQUNELENBTkQ7OztBQ3JCQTs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFlBQWE7QUFBQSxNQUFYLEdBQVcsdUVBQVAsQ0FBTzs7QUFDNUIsTUFBSSxPQUFPO0FBQ1QsWUFBUSxDQUFFLEdBQUYsQ0FEQztBQUVULFlBQVEsRUFBRSxPQUFPLEVBQUUsUUFBTyxDQUFULEVBQVksS0FBSyxJQUFqQixFQUFULEVBRkM7QUFHVCxjQUFVLElBSEQ7O0FBS1QsTUFMUyxlQUtMLENBTEssRUFLRDtBQUNOLFVBQUksS0FBSSxTQUFKLENBQWMsR0FBZCxDQUFtQixDQUFuQixDQUFKLEVBQTRCO0FBQzFCLFlBQUksY0FBYyxLQUFJLFNBQUosQ0FBYyxHQUFkLENBQW1CLENBQW5CLENBQWxCO0FBQ0EsYUFBSyxJQUFMLEdBQVksWUFBWSxJQUF4QjtBQUNBLGVBQU8sV0FBUDtBQUNEOztBQUVELFVBQUksTUFBTTtBQUNSLFdBRFEsaUJBQ0Y7QUFDSixjQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiOztBQUVBLGNBQUksS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFsQixLQUEwQixJQUE5QixFQUFxQztBQUNuQyxpQkFBSSxhQUFKLENBQW1CLEtBQUssTUFBeEI7QUFDQSxpQkFBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQW5DLElBQTJDLEdBQTNDO0FBQ0Q7O0FBRUQsY0FBSSxNQUFNLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBNUI7O0FBRUEsZUFBSSxhQUFKLENBQW1CLGFBQWEsR0FBYixHQUFtQixPQUFuQixHQUE2QixPQUFRLENBQVIsQ0FBaEQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZUFBSSxTQUFKLENBQWMsR0FBZCxDQUFtQixDQUFuQixFQUFzQixHQUF0Qjs7QUFFQSxpQkFBTyxPQUFRLENBQVIsQ0FBUDtBQUNELFNBbkJPOztBQW9CUixjQUFNLEtBQUssSUFBTCxHQUFZLEtBQVosR0FBa0IsS0FBSSxNQUFKLEVBcEJoQjtBQXFCUixnQkFBUSxLQUFLO0FBckJMLE9BQVY7O0FBd0JBLFdBQUssTUFBTCxDQUFhLENBQWIsSUFBbUIsQ0FBbkI7O0FBRUEsV0FBSyxRQUFMLEdBQWdCLEdBQWhCOztBQUVBLGFBQU8sR0FBUDtBQUNELEtBekNROzs7QUEyQ1QsU0FBSztBQUVILFNBRkcsaUJBRUc7QUFDSixZQUFJLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsS0FBMEIsSUFBOUIsRUFBcUM7QUFDbkMsY0FBSSxLQUFJLFNBQUosQ0FBYyxHQUFkLENBQW1CLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBbkIsTUFBd0MsU0FBNUMsRUFBd0Q7QUFDdEQsaUJBQUksU0FBSixDQUFjLEdBQWQsQ0FBbUIsS0FBSyxNQUFMLENBQVksQ0FBWixDQUFuQixFQUFtQyxLQUFLLFFBQXhDO0FBQ0Q7QUFDRCxlQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4QjtBQUNBLGVBQUksTUFBSixDQUFXLElBQVgsQ0FBaUIsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFuQyxJQUEyQyxXQUFZLEdBQVosQ0FBM0M7QUFDRDtBQUNELFlBQUksTUFBTSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQTVCOztBQUVBLGVBQU8sYUFBYSxHQUFiLEdBQW1CLEtBQTFCO0FBQ0Q7QUFiRSxLQTNDSTs7QUEyRFQsU0FBSyxLQUFJLE1BQUo7QUEzREksR0FBWDs7QUE4REEsT0FBSyxHQUFMLENBQVMsTUFBVCxHQUFrQixLQUFLLE1BQXZCOztBQUVBLE9BQUssSUFBTCxHQUFZLFlBQVksS0FBSyxHQUE3QjtBQUNBLE9BQUssR0FBTCxDQUFTLElBQVQsR0FBZ0IsS0FBSyxJQUFMLEdBQVksTUFBNUI7QUFDQSxPQUFLLEVBQUwsQ0FBUSxLQUFSLEdBQWlCLEtBQUssSUFBTCxHQUFZLEtBQTdCOztBQUVBLFNBQU8sY0FBUCxDQUF1QixJQUF2QixFQUE2QixPQUE3QixFQUFzQztBQUNwQyxPQURvQyxpQkFDOUI7QUFDSixVQUFJLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsS0FBMEIsSUFBOUIsRUFBcUM7QUFDbkMsZUFBTyxLQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbkMsQ0FBUDtBQUNEO0FBQ0YsS0FMbUM7QUFNcEMsT0FOb0MsZUFNL0IsQ0FOK0IsRUFNM0I7QUFDUCxVQUFJLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsS0FBMEIsSUFBOUIsRUFBcUM7QUFDbkMsYUFBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQW5DLElBQTJDLENBQTNDO0FBQ0Q7QUFDRjtBQVZtQyxHQUF0Qzs7QUFhQSxTQUFPLElBQVA7QUFDRCxDQW5GRDs7O0FDSkE7O0FBRUEsSUFBSSxPQUFNLFFBQVMsVUFBVCxDQUFWOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsUUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxlQUFlLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBbkI7QUFBQSxRQUNJLGVBQWUsS0FBSSxRQUFKLENBQWMsYUFBYyxhQUFhLE1BQWIsR0FBc0IsQ0FBcEMsQ0FBZCxDQURuQjtBQUFBLFFBRUksaUJBQWUsS0FBSyxJQUFwQixlQUFrQyxZQUFsQyxPQUZKOztBQUlBOztBQUVBOztBQUVBLFNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxhQUFhLE1BQWIsR0FBc0IsQ0FBMUMsRUFBNkMsS0FBSSxDQUFqRCxFQUFxRDtBQUNuRCxVQUFJLGFBQWEsTUFBTSxhQUFhLE1BQWIsR0FBc0IsQ0FBN0M7QUFBQSxVQUNJLE9BQVEsS0FBSSxRQUFKLENBQWMsYUFBYyxDQUFkLENBQWQsQ0FEWjtBQUFBLFVBRUksV0FBVyxhQUFjLElBQUUsQ0FBaEIsQ0FGZjtBQUFBLFVBR0ksY0FISjtBQUFBLFVBR1csa0JBSFg7QUFBQSxVQUdzQixlQUh0Qjs7QUFLQTs7QUFFQSxVQUFJLE9BQU8sUUFBUCxLQUFvQixRQUF4QixFQUFrQztBQUNoQyxnQkFBUSxRQUFSO0FBQ0Esb0JBQVksSUFBWjtBQUNELE9BSEQsTUFHSztBQUNILFlBQUksS0FBSSxJQUFKLENBQVUsU0FBUyxJQUFuQixNQUE4QixTQUFsQyxFQUE4QztBQUM1QztBQUNBLGVBQUksYUFBSjs7QUFFQSxlQUFJLFFBQUosQ0FBYyxRQUFkOztBQUVBLGtCQUFRLEtBQUksV0FBSixFQUFSO0FBQ0Esc0JBQVksTUFBTSxDQUFOLENBQVo7QUFDQSxrQkFBUSxNQUFPLENBQVAsRUFBVyxJQUFYLENBQWdCLEVBQWhCLENBQVI7QUFDQSxrQkFBUSxPQUFPLE1BQU0sT0FBTixDQUFlLE1BQWYsRUFBdUIsTUFBdkIsQ0FBZjtBQUNELFNBVkQsTUFVSztBQUNILGtCQUFRLEVBQVI7QUFDQSxzQkFBWSxLQUFJLElBQUosQ0FBVSxTQUFTLElBQW5CLENBQVo7QUFDRDtBQUNGOztBQUVELGVBQVMsY0FBYyxJQUFkLFVBQ0YsS0FBSyxJQURILGVBQ2lCLEtBRGpCLEdBRUosS0FGSSxVQUVNLEtBQUssSUFGWCxlQUV5QixTQUZsQzs7QUFJQSxVQUFJLE1BQUksQ0FBUixFQUFZLE9BQU8sR0FBUDtBQUNaLHVCQUNFLElBREYsb0JBRUosTUFGSTs7QUFLQSxVQUFJLENBQUMsVUFBTCxFQUFrQjtBQUNoQjtBQUNELE9BRkQsTUFFSztBQUNIO0FBQ0Q7QUFDRjs7QUFFRCxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBMkIsS0FBSyxJQUFoQzs7QUFFQSxXQUFPLENBQUssS0FBSyxJQUFWLFdBQXNCLEdBQXRCLENBQVA7QUFDRDtBQTVEUyxDQUFaOztBQStEQSxPQUFPLE9BQVAsR0FBaUIsWUFBZ0I7QUFBQSxvQ0FBWCxJQUFXO0FBQVgsUUFBVztBQUFBOztBQUMvQixNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYO0FBQUEsTUFDSSxhQUFhLE1BQU0sT0FBTixDQUFlLEtBQUssQ0FBTCxDQUFmLElBQTJCLEtBQUssQ0FBTCxDQUEzQixHQUFxQyxJQUR0RDs7QUFHQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFNBQVMsS0FBSSxNQUFKLEVBRFU7QUFFbkIsWUFBUyxDQUFFLFVBQUY7QUFGVSxHQUFyQjs7QUFLQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUssR0FBcEM7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FaRDs7O0FDbkVBOztBQUVBLElBQUksT0FBTSxRQUFRLFVBQVIsQ0FBVjs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLElBREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQU0sWUFBWSxLQUFJLElBQUosS0FBYSxTQUEvQjs7QUFFQSxRQUFJLFNBQUosRUFBZ0I7QUFDZCxXQUFJLE1BQUosQ0FBVyxHQUFYLENBQWdCLElBQWhCO0FBQ0QsS0FGRCxNQUVLO0FBQ0gsV0FBSSxVQUFKLENBQWUsR0FBZixDQUFvQixLQUFLLElBQXpCO0FBQ0Q7O0FBRUQsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLGNBQWMsSUFBZCxHQUFxQixLQUFLLElBQUwsR0FBWSxLQUFqQyxHQUF5QyxLQUFLLElBQXRFOztBQUVBLFdBQU8sS0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLENBQVA7QUFDRDtBQWZTLENBQVo7O0FBa0JBLE9BQU8sT0FBUCxHQUFpQixVQUFFLElBQUYsRUFBMEU7QUFBQSxNQUFsRSxXQUFrRSx1RUFBdEQsQ0FBc0Q7QUFBQSxNQUFuRCxhQUFtRCx1RUFBckMsQ0FBcUM7QUFBQSxNQUFsQyxZQUFrQyx1RUFBckIsQ0FBcUI7QUFBQSxNQUFsQixHQUFrQix1RUFBZCxDQUFjO0FBQUEsTUFBWCxHQUFXLHVFQUFQLENBQU87O0FBQ3pGLE1BQUksUUFBUSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVo7O0FBRUEsUUFBTSxFQUFOLEdBQWEsS0FBSSxNQUFKLEVBQWI7QUFDQSxRQUFNLElBQU4sR0FBYSxTQUFTLFNBQVQsR0FBcUIsSUFBckIsUUFBK0IsTUFBTSxRQUFyQyxHQUFnRCxNQUFNLEVBQW5FO0FBQ0EsU0FBTyxNQUFQLENBQWUsS0FBZixFQUFzQixFQUFFLDBCQUFGLEVBQWdCLFFBQWhCLEVBQXFCLFFBQXJCLEVBQTBCLHdCQUExQixFQUF1Qyw0QkFBdkMsRUFBdEI7O0FBRUEsUUFBTSxDQUFOLElBQVc7QUFDVCxPQURTLGlCQUNIO0FBQ0osVUFBSSxDQUFFLEtBQUksVUFBSixDQUFlLEdBQWYsQ0FBb0IsTUFBTSxJQUExQixDQUFOLEVBQXlDLEtBQUksVUFBSixDQUFlLEdBQWYsQ0FBb0IsTUFBTSxJQUExQjtBQUN6QyxhQUFPLE1BQU0sSUFBTixHQUFhLEtBQXBCO0FBQ0Q7QUFKUSxHQUFYO0FBTUEsUUFBTSxDQUFOLElBQVc7QUFDVCxPQURTLGlCQUNIO0FBQ0osVUFBSSxDQUFFLEtBQUksVUFBSixDQUFlLEdBQWYsQ0FBb0IsTUFBTSxJQUExQixDQUFOLEVBQXlDLEtBQUksVUFBSixDQUFlLEdBQWYsQ0FBb0IsTUFBTSxJQUExQjtBQUN6QyxhQUFPLE1BQU0sSUFBTixHQUFhLEtBQXBCO0FBQ0Q7QUFKUSxHQUFYOztBQVFBLFNBQU8sS0FBUDtBQUNELENBdEJEOzs7QUN0QkE7O0FBRUEsSUFBTSxVQUFVO0FBQ2QsUUFEYyxtQkFDTixXQURNLEVBQ1E7QUFDcEIsUUFBSSxnQkFBZ0IsTUFBcEIsRUFBNkI7QUFDM0Isa0JBQVksR0FBWixHQUFrQixRQUFRLE9BQTFCLENBRDJCLENBQ1U7QUFDckMsa0JBQVksS0FBWixHQUFvQixRQUFRLEVBQTVCLENBRjJCLENBRVU7QUFDckMsa0JBQVksT0FBWixHQUFzQixRQUFRLE1BQTlCLENBSDJCLENBR1U7O0FBRXJDLGFBQU8sUUFBUSxPQUFmO0FBQ0EsYUFBTyxRQUFRLEVBQWY7QUFDQSxhQUFPLFFBQVEsTUFBZjtBQUNEOztBQUVELFdBQU8sTUFBUCxDQUFlLFdBQWYsRUFBNEIsT0FBNUI7O0FBRUEsV0FBTyxjQUFQLENBQXVCLE9BQXZCLEVBQWdDLFlBQWhDLEVBQThDO0FBQzVDLFNBRDRDLGlCQUN0QztBQUFFLGVBQU8sUUFBUSxHQUFSLENBQVksVUFBbkI7QUFBK0IsT0FESztBQUU1QyxTQUY0QyxlQUV4QyxDQUZ3QyxFQUVyQyxDQUFFO0FBRm1DLEtBQTlDOztBQUtBLFlBQVEsRUFBUixHQUFhLFlBQVksS0FBekI7QUFDQSxZQUFRLE9BQVIsR0FBa0IsWUFBWSxHQUE5QjtBQUNBLFlBQVEsTUFBUixHQUFpQixZQUFZLE9BQTdCOztBQUVBLGdCQUFZLElBQVosR0FBbUIsUUFBUSxLQUEzQjtBQUNELEdBeEJhOzs7QUEwQmQsT0FBVSxRQUFTLFVBQVQsQ0ExQkk7O0FBNEJkLE9BQVUsUUFBUyxVQUFULENBNUJJO0FBNkJkLFNBQVUsUUFBUyxZQUFULENBN0JJO0FBOEJkLFNBQVUsUUFBUyxZQUFULENBOUJJO0FBK0JkLE9BQVUsUUFBUyxVQUFULENBL0JJO0FBZ0NkLE9BQVUsUUFBUyxVQUFULENBaENJO0FBaUNkLE9BQVUsUUFBUyxVQUFULENBakNJO0FBa0NkLE9BQVUsUUFBUyxVQUFULENBbENJO0FBbUNkLFNBQVUsUUFBUyxZQUFULENBbkNJO0FBb0NkLFdBQVUsUUFBUyxjQUFULENBcENJO0FBcUNkLE9BQVUsUUFBUyxVQUFULENBckNJO0FBc0NkLE9BQVUsUUFBUyxVQUFULENBdENJO0FBdUNkLE9BQVUsUUFBUyxVQUFULENBdkNJO0FBd0NkLFFBQVUsUUFBUyxXQUFULENBeENJO0FBeUNkLFFBQVUsUUFBUyxXQUFULENBekNJO0FBMENkLFFBQVUsUUFBUyxXQUFULENBMUNJO0FBMkNkLFFBQVUsUUFBUyxXQUFULENBM0NJO0FBNENkLFVBQVUsUUFBUyxhQUFULENBNUNJO0FBNkNkLFdBQVUsUUFBUyxjQUFULENBN0NJO0FBOENkLFFBQVUsUUFBUyxXQUFULENBOUNJO0FBK0NkLFFBQVUsUUFBUyxXQUFULENBL0NJO0FBZ0RkLFdBQVUsUUFBUyxjQUFULENBaERJO0FBaURkLFNBQVUsUUFBUyxZQUFULENBakRJO0FBa0RkLFVBQVUsUUFBUyxhQUFULENBbERJO0FBbURkLFdBQVUsUUFBUyxjQUFULENBbkRJO0FBb0RkLFNBQVUsUUFBUyxZQUFULENBcERJO0FBcURkLFNBQVUsUUFBUyxZQUFULENBckRJO0FBc0RkLFFBQVUsUUFBUyxXQUFULENBdERJO0FBdURkLE9BQVUsUUFBUyxVQUFULENBdkRJO0FBd0RkLE9BQVUsUUFBUyxVQUFULENBeERJO0FBeURkLFFBQVUsUUFBUyxXQUFULENBekRJO0FBMERkLFdBQVUsUUFBUyxjQUFULENBMURJO0FBMkRkLFFBQVUsUUFBUyxXQUFULENBM0RJO0FBNERkLFFBQVUsUUFBUyxXQUFULENBNURJO0FBNkRkLFFBQVUsUUFBUyxXQUFULENBN0RJO0FBOERkLE9BQVUsUUFBUyxVQUFULENBOURJO0FBK0RkLFNBQVUsUUFBUyxZQUFULENBL0RJO0FBZ0VkLFFBQVUsUUFBUyxXQUFULENBaEVJO0FBaUVkLFNBQVUsUUFBUyxZQUFULENBakVJO0FBa0VkLFFBQVUsUUFBUyxXQUFULENBbEVJO0FBbUVkLE9BQVUsUUFBUyxVQUFULENBbkVJO0FBb0VkLE9BQVUsUUFBUyxVQUFULENBcEVJO0FBcUVkLFNBQVUsUUFBUyxZQUFULENBckVJO0FBc0VkLE9BQVUsUUFBUyxVQUFULENBdEVJO0FBdUVkLE1BQVUsUUFBUyxTQUFULENBdkVJO0FBd0VkLE9BQVUsUUFBUyxVQUFULENBeEVJO0FBeUVkLE1BQVUsUUFBUyxTQUFULENBekVJO0FBMEVkLE9BQVUsUUFBUyxVQUFULENBMUVJO0FBMkVkLFFBQVUsUUFBUyxXQUFULENBM0VJO0FBNEVkLFFBQVUsUUFBUyxXQUFULENBNUVJO0FBNkVkLFNBQVUsUUFBUyxZQUFULENBN0VJO0FBOEVkLFNBQVUsUUFBUyxZQUFULENBOUVJO0FBK0VkLE1BQVUsUUFBUyxTQUFULENBL0VJO0FBZ0ZkLE9BQVUsUUFBUyxVQUFULENBaEZJO0FBaUZkLFFBQVUsUUFBUyxXQUFULENBakZJO0FBa0ZkLE9BQVUsUUFBUyxVQUFULENBbEZJLEVBa0Z5QjtBQUN2QyxPQUFVLFFBQVMsVUFBVCxDQW5GSSxFQW1GeUI7QUFDdkMsVUFBVSxRQUFTLGFBQVQsQ0FwRkk7QUFxRmQsYUFBVSxRQUFTLGdCQUFULENBckZJLEVBcUZ5QjtBQUN2QyxZQUFVLFFBQVMsZUFBVCxDQXRGSTtBQXVGZCxhQUFVLFFBQVMsZ0JBQVQsQ0F2Rkk7QUF3RmQsT0FBVSxRQUFTLFVBQVQsQ0F4Rkk7QUF5RmQsVUFBVSxRQUFTLGFBQVQsQ0F6Rkk7QUEwRmQsU0FBVSxRQUFTLFlBQVQsQ0ExRkk7QUEyRmQsV0FBVSxRQUFTLGNBQVQsQ0EzRkk7QUE0RmQsT0FBVSxRQUFTLFVBQVQsQ0E1Rkk7QUE2RmQsTUFBVSxRQUFTLFNBQVQsQ0E3Rkk7QUE4RmQsUUFBVSxRQUFTLFdBQVQsQ0E5Rkk7QUErRmQsVUFBVSxRQUFTLGVBQVQsQ0EvRkk7QUFnR2QsUUFBVSxRQUFTLFdBQVQsQ0FoR0k7QUFpR2QsT0FBVSxRQUFTLFVBQVQsQ0FqR0k7QUFrR2QsT0FBVSxRQUFTLFVBQVQsQ0FsR0k7QUFtR2QsTUFBVSxRQUFTLFNBQVQsQ0FuR0k7QUFvR2QsT0FBVSxRQUFTLFVBQVQsQ0FwR0k7QUFxR2QsT0FBVSxRQUFTLFVBQVQsQ0FyR0k7QUFzR2QsV0FBVSxRQUFTLGNBQVQsQ0F0R0k7QUF1R2QsT0FBVSxRQUFTLFVBQVQ7QUF2R0ksQ0FBaEI7O0FBMEdBLFFBQVEsR0FBUixDQUFZLEdBQVosR0FBa0IsT0FBbEI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLE9BQWpCOzs7QUM5R0E7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsSUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxxQkFBZSxLQUFLLElBQXBCOztBQUVBLFFBQUksTUFBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVAsS0FBMkIsTUFBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVAsQ0FBL0IsRUFBeUQ7QUFDdkQscUJBQWEsT0FBTyxDQUFQLENBQWIsV0FBNEIsT0FBTyxDQUFQLENBQTVCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsYUFBTyxPQUFPLENBQVAsSUFBWSxPQUFPLENBQVAsQ0FBWixHQUF3QixDQUF4QixHQUE0QixDQUFuQztBQUNEO0FBQ0QsV0FBTyxJQUFQOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQTdCOztBQUVBLFdBQU8sQ0FBQyxLQUFLLElBQU4sRUFBWSxHQUFaLENBQVA7O0FBRUEsV0FBTyxHQUFQO0FBQ0Q7QUFyQlMsQ0FBWjs7QUF3QkEsT0FBTyxPQUFQLEdBQWlCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBUztBQUN4QixNQUFJLEtBQUssT0FBTyxNQUFQLENBQWUsS0FBZixDQUFUOztBQUVBLEtBQUcsTUFBSCxHQUFZLENBQUUsQ0FBRixFQUFJLENBQUosQ0FBWjtBQUNBLEtBQUcsSUFBSCxHQUFVLEdBQUcsUUFBSCxHQUFjLEtBQUksTUFBSixFQUF4Qjs7QUFFQSxTQUFPLEVBQVA7QUFDRCxDQVBEOzs7QUM1QkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFFBQUssS0FESzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxxQkFBZSxLQUFLLElBQXBCOztBQUVBLFFBQUksTUFBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVAsS0FBMkIsTUFBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVAsQ0FBL0IsRUFBeUQ7QUFDdkQsb0JBQVksT0FBTyxDQUFQLENBQVosWUFBNEIsT0FBTyxDQUFQLENBQTVCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsYUFBTyxPQUFPLENBQVAsS0FBYSxPQUFPLENBQVAsQ0FBYixHQUF5QixDQUF6QixHQUE2QixDQUFwQztBQUNEO0FBQ0QsV0FBTyxJQUFQOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQTdCOztBQUVBLFdBQU8sQ0FBQyxLQUFLLElBQU4sRUFBWSxHQUFaLENBQVA7O0FBRUEsV0FBTyxHQUFQO0FBQ0Q7QUFyQlMsQ0FBWjs7QUF3QkEsT0FBTyxPQUFQLEdBQWlCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBUztBQUN4QixNQUFJLEtBQUssT0FBTyxNQUFQLENBQWUsS0FBZixDQUFUOztBQUVBLEtBQUcsTUFBSCxHQUFZLENBQUUsQ0FBRixFQUFJLENBQUosQ0FBWjtBQUNBLEtBQUcsSUFBSCxHQUFVLFFBQVEsS0FBSSxNQUFKLEVBQWxCOztBQUVBLFNBQU8sRUFBUDtBQUNELENBUEQ7OztBQzVCQTs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsUUFBSyxLQURLOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLFFBQUksTUFBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVAsS0FBMkIsTUFBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVAsQ0FBL0IsRUFBeUQ7QUFDdkQsa0JBQVUsT0FBUSxDQUFSLENBQVYsY0FBOEIsT0FBTyxDQUFQLENBQTlCLFdBQTZDLE9BQU8sQ0FBUCxDQUE3QztBQUNELEtBRkQsTUFFTztBQUNMLFlBQU0sT0FBTyxDQUFQLEtBQWUsT0FBTyxDQUFQLElBQVksT0FBTyxDQUFQLENBQWQsR0FBNEIsQ0FBekMsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBZFMsQ0FBWjs7QUFpQkEsT0FBTyxPQUFQLEdBQWlCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBUztBQUN4QixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFWOztBQUVBLE1BQUksTUFBSixHQUFhLENBQUUsQ0FBRixFQUFJLENBQUosQ0FBYjs7QUFFQSxTQUFPLEdBQVA7QUFDRCxDQU5EOzs7QUNyQkE7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsUUFBSyxLQURLOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUlBLFFBQU0sWUFBWSxLQUFJLElBQUosS0FBYSxTQUEvQjtBQUNBLFFBQU0sTUFBTSxZQUFXLEVBQVgsR0FBZ0IsTUFBNUI7O0FBRUEsUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLEtBQXNCLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBMUIsRUFBK0M7QUFDN0MsV0FBSSxRQUFKLENBQWEsR0FBYixxQkFBcUIsS0FBSyxJQUExQixFQUFrQyxZQUFZLFVBQVosR0FBeUIsS0FBSyxHQUFoRTs7QUFFQSxZQUFTLEdBQVQsYUFBb0IsT0FBTyxDQUFQLENBQXBCLFVBQWtDLE9BQU8sQ0FBUCxDQUFsQztBQUVELEtBTEQsTUFLTztBQUNMLFlBQU0sS0FBSyxHQUFMLENBQVUsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFWLEVBQW1DLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBbkMsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBckJTLENBQVo7O0FBd0JBLE9BQU8sT0FBUCxHQUFpQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDeEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsRUFBSSxDQUFKLENBQWI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FORDs7O0FDNUJBOztBQUVBLElBQUksT0FBTSxRQUFRLFVBQVIsQ0FBVjs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLE1BREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EscUJBQWUsS0FBSyxJQUFwQixXQUE4QixPQUFPLENBQVAsQ0FBOUI7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBN0I7O0FBRUEsV0FBTyxDQUFFLEtBQUssSUFBUCxFQUFhLEdBQWIsQ0FBUDtBQUNEO0FBWlMsQ0FBWjs7QUFlQSxPQUFPLE9BQVAsR0FBaUIsVUFBQyxHQUFELEVBQUssUUFBTCxFQUFrQjtBQUNqQyxNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBLE9BQUssTUFBTCxHQUFjLENBQUUsR0FBRixDQUFkO0FBQ0EsT0FBSyxFQUFMLEdBQVksS0FBSSxNQUFKLEVBQVo7QUFDQSxPQUFLLElBQUwsR0FBWSxhQUFhLFNBQWIsR0FBeUIsV0FBVyxHQUFYLEdBQWlCLEtBQUksTUFBSixFQUExQyxRQUE0RCxLQUFLLFFBQWpFLEdBQTRFLEtBQUssRUFBN0Y7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FSRDs7O0FDbkJBOzs7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFFBQUssS0FESzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFJQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7QUFDQSxRQUFNLE1BQU0sWUFBVyxFQUFYLEdBQWdCLE1BQTVCOztBQUVBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxLQUFzQixNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQTFCLEVBQStDO0FBQzdDLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBMUIsRUFBa0MsWUFBWSxVQUFaLEdBQXlCLEtBQUssR0FBaEU7O0FBRUEsWUFBUyxHQUFULGFBQW9CLE9BQU8sQ0FBUCxDQUFwQixVQUFrQyxPQUFPLENBQVAsQ0FBbEM7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssR0FBTCxDQUFVLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBVixFQUFtQyxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQW5DLENBQU47QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQXJCUyxDQUFaOztBQXdCQSxPQUFPLE9BQVAsR0FBaUIsVUFBQyxDQUFELEVBQUcsQ0FBSCxFQUFTO0FBQ3hCLE1BQUksTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVY7O0FBRUEsTUFBSSxNQUFKLEdBQWEsQ0FBRSxDQUFGLEVBQUksQ0FBSixDQUFiOztBQUVBLFNBQU8sR0FBUDtBQUNELENBTkQ7OztBQzVCQTs7QUFFQSxJQUFJLE1BQU0sUUFBUSxVQUFSLENBQVY7QUFBQSxJQUNJLE1BQU0sUUFBUSxVQUFSLENBRFY7QUFBQSxJQUVJLE1BQU0sUUFBUSxVQUFSLENBRlY7QUFBQSxJQUdJLE1BQU0sUUFBUSxVQUFSLENBSFY7QUFBQSxJQUlJLE9BQU0sUUFBUSxXQUFSLENBSlY7O0FBTUEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsR0FBRixFQUFPLEdBQVAsRUFBc0I7QUFBQSxRQUFWLENBQVUsdUVBQVIsRUFBUTs7QUFDckMsUUFBSSxPQUFPLEtBQU0sSUFBSyxJQUFJLEdBQUosRUFBUyxJQUFJLENBQUosRUFBTSxDQUFOLENBQVQsQ0FBTCxFQUEyQixJQUFLLEdBQUwsRUFBVSxDQUFWLENBQTNCLENBQU4sQ0FBWDtBQUNBLFNBQUssSUFBTCxHQUFZLFFBQVEsSUFBSSxNQUFKLEVBQXBCOztBQUVBLFdBQU8sSUFBUDtBQUNELENBTEQ7OztBQ1JBOztBQUVBLElBQUksT0FBTSxRQUFRLFVBQVIsQ0FBVjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsWUFBYTtBQUFBLG9DQUFULElBQVM7QUFBVCxRQUFTO0FBQUE7O0FBQzVCLE1BQUksTUFBTTtBQUNSLFFBQVEsS0FBSSxNQUFKLEVBREE7QUFFUixZQUFRLElBRkE7O0FBSVIsT0FKUSxpQkFJRjtBQUNKLFVBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7QUFBQSxVQUNJLE1BQUksR0FEUjtBQUFBLFVBRUksT0FBTyxDQUZYO0FBQUEsVUFHSSxXQUFXLENBSGY7QUFBQSxVQUlJLGFBQWEsT0FBUSxDQUFSLENBSmpCO0FBQUEsVUFLSSxtQkFBbUIsTUFBTyxVQUFQLENBTHZCO0FBQUEsVUFNSSxXQUFXLEtBTmY7O0FBUUEsYUFBTyxPQUFQLENBQWdCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBUztBQUN2QixZQUFJLE1BQU0sQ0FBVixFQUFjOztBQUVkLFlBQUksZUFBZSxNQUFPLENBQVAsQ0FBbkI7QUFBQSxZQUNJLGFBQWUsTUFBTSxPQUFPLE1BQVAsR0FBZ0IsQ0FEekM7O0FBR0EsWUFBSSxDQUFDLGdCQUFELElBQXFCLENBQUMsWUFBMUIsRUFBeUM7QUFDdkMsdUJBQWEsYUFBYSxDQUExQjtBQUNBLGlCQUFPLFVBQVA7QUFDRCxTQUhELE1BR0s7QUFDSCxpQkFBVSxVQUFWLFdBQTBCLENBQTFCO0FBQ0Q7O0FBRUQsWUFBSSxDQUFDLFVBQUwsRUFBa0IsT0FBTyxLQUFQO0FBQ25CLE9BZEQ7O0FBZ0JBLGFBQU8sR0FBUDs7QUFFQSxhQUFPLEdBQVA7QUFDRDtBQWhDTyxHQUFWOztBQW1DQSxTQUFPLEdBQVA7QUFDRCxDQXJDRDs7O0FDSkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsV0FEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjtBQUFBLFFBRUksb0JBRko7O0FBSUEsUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQUosRUFBeUI7QUFDdkIsdUJBQWUsS0FBSyxJQUFwQixXQUErQixLQUFJLFVBQW5DLGtCQUEwRCxPQUFPLENBQVAsQ0FBMUQ7O0FBRUEsV0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEdBQXhCOztBQUVBLG9CQUFjLENBQUUsS0FBSyxJQUFQLEVBQWEsR0FBYixDQUFkO0FBQ0QsS0FORCxNQU1PO0FBQ0wsWUFBTSxLQUFJLFVBQUosR0FBaUIsSUFBakIsR0FBd0IsS0FBSyxNQUFMLENBQVksQ0FBWixDQUE5Qjs7QUFFQSxvQkFBYyxHQUFkO0FBQ0Q7O0FBRUQsV0FBTyxXQUFQO0FBQ0Q7QUFyQlMsQ0FBWjs7QUF3QkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxZQUFZLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBaEI7O0FBRUEsWUFBVSxNQUFWLEdBQW1CLENBQUUsQ0FBRixDQUFuQjtBQUNBLFlBQVUsSUFBVixHQUFpQixNQUFNLFFBQU4sR0FBaUIsS0FBSSxNQUFKLEVBQWxDOztBQUVBLFNBQU8sU0FBUDtBQUNELENBUEQ7OztBQzVCQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLE1BREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EsUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQUosRUFBeUI7QUFDdkIsV0FBSSxRQUFKLENBQWEsR0FBYixxQkFBcUIsS0FBSyxJQUExQixFQUFrQyxLQUFLLEdBQXZDOztBQUVBLG1CQUFXLEtBQUssTUFBaEIsa0NBQW1ELE9BQU8sQ0FBUCxDQUFuRDtBQUVELEtBTEQsTUFLTztBQUNMLFlBQU0sS0FBSyxNQUFMLEdBQWMsS0FBSyxHQUFMLENBQVUsY0FBZSxPQUFPLENBQVAsSUFBWSxFQUEzQixDQUFWLENBQXBCO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFqQlMsQ0FBWjs7QUFvQkEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsQ0FBRixFQUFLLEtBQUwsRUFBZ0I7QUFDL0IsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDtBQUFBLE1BQ0ksV0FBVyxFQUFFLFFBQU8sR0FBVCxFQURmOztBQUdBLE1BQUksVUFBVSxTQUFkLEVBQTBCLE9BQU8sTUFBUCxDQUFlLE1BQU0sUUFBckI7O0FBRTFCLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUIsUUFBckI7QUFDQSxPQUFLLE1BQUwsR0FBYyxDQUFFLENBQUYsQ0FBZDs7QUFHQSxTQUFPLElBQVA7QUFDRCxDQVhEOzs7QUN4QkE7O0FBRUEsSUFBTSxPQUFNLFFBQVEsVUFBUixDQUFaOztBQUVBLElBQU0sUUFBUTtBQUNaLFlBQVUsS0FERTs7QUFHWixLQUhZLGlCQUdOO0FBQ0osUUFBSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBYjtBQUFBLFFBQ0ksaUJBQWUsS0FBSyxJQUFwQixRQURKO0FBQUEsUUFFSSxNQUFNLENBRlY7QUFBQSxRQUVhLFdBQVcsQ0FGeEI7QUFBQSxRQUUyQixXQUFXLEtBRnRDO0FBQUEsUUFFNkMsb0JBQW9CLElBRmpFOztBQUlBLFdBQU8sT0FBUCxDQUFnQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDdkIsVUFBSSxNQUFPLENBQVAsQ0FBSixFQUFpQjtBQUNmLGVBQU8sQ0FBUDtBQUNBLFlBQUksSUFBSSxPQUFPLE1BQVAsR0FBZSxDQUF2QixFQUEyQjtBQUN6QixxQkFBVyxJQUFYO0FBQ0EsaUJBQU8sS0FBUDtBQUNEO0FBQ0QsNEJBQW9CLEtBQXBCO0FBQ0QsT0FQRCxNQU9LO0FBQ0gsWUFBSSxNQUFNLENBQVYsRUFBYztBQUNaLGdCQUFNLENBQU47QUFDRCxTQUZELE1BRUs7QUFDSCxpQkFBTyxXQUFZLENBQVosQ0FBUDtBQUNEO0FBQ0Q7QUFDRDtBQUNGLEtBaEJEOztBQWtCQSxRQUFJLFdBQVcsQ0FBZixFQUFtQjtBQUNqQixhQUFPLFlBQVksaUJBQVosR0FBZ0MsR0FBaEMsR0FBc0MsUUFBUSxHQUFyRDtBQUNEOztBQUVELFdBQU8sSUFBUDs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUE3Qjs7QUFFQSxXQUFPLENBQUUsS0FBSyxJQUFQLEVBQWEsR0FBYixDQUFQO0FBQ0Q7QUFuQ1csQ0FBZDs7QUFzQ0EsT0FBTyxPQUFQLEdBQWlCLFlBQWU7QUFBQSxvQ0FBVixJQUFVO0FBQVYsUUFBVTtBQUFBOztBQUM5QixNQUFNLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFaOztBQUVBLFNBQU8sTUFBUCxDQUFlLEdBQWYsRUFBb0I7QUFDaEIsUUFBUSxLQUFJLE1BQUosRUFEUTtBQUVoQixZQUFRO0FBRlEsR0FBcEI7O0FBS0EsTUFBSSxJQUFKLEdBQVcsSUFBSSxRQUFKLEdBQWUsSUFBSSxFQUE5Qjs7QUFFQSxTQUFPLEdBQVA7QUFDRCxDQVhEOzs7QUMxQ0E7O0FBRUEsSUFBSSxPQUFNLFFBQVMsVUFBVCxDQUFWOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsS0FEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBYjtBQUFBLFFBQW9DLFlBQXBDOztBQUVBLFVBQU0sMkNBQU4sV0FBMkQsS0FBSyxJQUFoRSxZQUEyRSxPQUFPLENBQVAsQ0FBM0UsYUFBNEYsT0FBTyxDQUFQLENBQTVGOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQTdCOztBQUVBLFdBQU8sQ0FBRSxLQUFLLElBQVAsRUFBYSxHQUFiLENBQVA7QUFDRDtBQVhTLENBQVo7O0FBZUEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsR0FBRixFQUFPLEdBQVAsRUFBZ0I7QUFDL0IsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDtBQUNBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsU0FBUyxLQUFJLE1BQUosRUFEVTtBQUVuQixZQUFTLENBQUUsR0FBRixFQUFPLEdBQVA7QUFGVSxHQUFyQjs7QUFLQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUssR0FBcEM7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FWRDs7O0FDbkJBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLE9BREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjs7QUFFQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7QUFDQSxRQUFNLE1BQU0sWUFBVyxFQUFYLEdBQWdCLE1BQTVCOztBQUVBLFNBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsRUFBRSxTQUFVLFlBQVksYUFBWixHQUE0QixLQUFLLE1BQTdDLEVBQWpCOztBQUVBLHFCQUFlLEtBQUssSUFBcEIsV0FBOEIsR0FBOUI7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBN0I7O0FBRUEsV0FBTyxDQUFFLEtBQUssSUFBUCxFQUFhLEdBQWIsQ0FBUDtBQUNEO0FBaEJTLENBQVo7O0FBbUJBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksUUFBUSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVo7QUFDQSxRQUFNLElBQU4sR0FBYSxNQUFNLElBQU4sR0FBYSxLQUFJLE1BQUosRUFBMUI7O0FBRUEsU0FBTyxLQUFQO0FBQ0QsQ0FMRDs7O0FDdkJBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLEtBREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EsUUFBSSxNQUFPLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBUCxDQUFKLEVBQThCO0FBQzVCLG1CQUFXLE9BQU8sQ0FBUCxDQUFYO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsWUFBTSxDQUFDLE9BQU8sQ0FBUCxDQUFELEtBQWUsQ0FBZixHQUFtQixDQUFuQixHQUF1QixDQUE3QjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBZFMsQ0FBWjs7QUFpQkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYjs7QUFFQSxTQUFPLEdBQVA7QUFDRCxDQU5EOzs7QUNyQkE7O0FBRUEsSUFBSSxNQUFNLFFBQVMsVUFBVCxDQUFWO0FBQUEsSUFDSSxPQUFPLFFBQVMsV0FBVCxDQURYO0FBQUEsSUFFSSxPQUFPLFFBQVMsV0FBVCxDQUZYO0FBQUEsSUFHSSxNQUFPLFFBQVMsVUFBVCxDQUhYOztBQUtBLElBQUksUUFBUTtBQUNWLFlBQVMsS0FEQztBQUVWLFdBRlUsdUJBRUU7QUFDVixRQUFJLFVBQVUsSUFBSSxZQUFKLENBQWtCLElBQWxCLENBQWQ7QUFBQSxRQUNJLFVBQVUsSUFBSSxZQUFKLENBQWtCLElBQWxCLENBRGQ7O0FBR0EsUUFBTSxXQUFXLEtBQUssRUFBTCxHQUFVLEdBQTNCO0FBQ0EsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLElBQXBCLEVBQTBCLEdBQTFCLEVBQWdDO0FBQzlCLFVBQUksTUFBTSxLQUFNLEtBQUssSUFBWCxDQUFWO0FBQ0EsY0FBUSxDQUFSLElBQWEsS0FBSyxHQUFMLENBQVUsTUFBTSxRQUFoQixDQUFiO0FBQ0EsY0FBUSxDQUFSLElBQWEsS0FBSyxHQUFMLENBQVUsTUFBTSxRQUFoQixDQUFiO0FBQ0Q7O0FBRUQsUUFBSSxPQUFKLENBQVksSUFBWixHQUFtQixLQUFNLE9BQU4sRUFBZSxDQUFmLEVBQWtCLEVBQUUsV0FBVSxJQUFaLEVBQWxCLENBQW5CO0FBQ0EsUUFBSSxPQUFKLENBQVksSUFBWixHQUFtQixLQUFNLE9BQU4sRUFBZSxDQUFmLEVBQWtCLEVBQUUsV0FBVSxJQUFaLEVBQWxCLENBQW5CO0FBQ0Q7QUFmUyxDQUFaOztBQW1CQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxTQUFGLEVBQWEsVUFBYixFQUFrRDtBQUFBLE1BQXpCLEdBQXlCLHVFQUFwQixFQUFvQjtBQUFBLE1BQWhCLFVBQWdCOztBQUNqRSxNQUFJLElBQUksT0FBSixDQUFZLElBQVosS0FBcUIsU0FBekIsRUFBcUMsTUFBTSxTQUFOOztBQUVyQyxNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsU0FBUyxJQUFJLE1BQUosRUFEVTtBQUVuQixZQUFTLENBQUUsU0FBRixFQUFhLFVBQWIsQ0FGVTtBQUduQixVQUFTLElBQUssU0FBTCxFQUFnQixLQUFNLElBQUksT0FBSixDQUFZLElBQWxCLEVBQXdCLEdBQXhCLEVBQTZCLEVBQUUsV0FBVSxPQUFaLEVBQTdCLENBQWhCLENBSFU7QUFJbkIsV0FBUyxJQUFLLFVBQUwsRUFBaUIsS0FBTSxJQUFJLE9BQUosQ0FBWSxJQUFsQixFQUF3QixHQUF4QixFQUE2QixFQUFFLFdBQVUsT0FBWixFQUE3QixDQUFqQjtBQUpVLEdBQXJCOztBQU9BLE9BQUssSUFBTCxRQUFlLEtBQUssUUFBcEIsR0FBK0IsS0FBSyxHQUFwQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQWZEOzs7QUMxQkE7O0FBRUEsSUFBSSxPQUFNLFFBQVEsVUFBUixDQUFWOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVUsT0FEQTs7QUFHVixLQUhVLGlCQUdKO0FBQ0osU0FBSSxhQUFKLENBQW1CLEtBQUssTUFBeEI7O0FBRUEsU0FBSSxNQUFKLENBQVcsR0FBWCxDQUFnQixJQUFoQjs7QUFFQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7O0FBRUEsUUFBSSxTQUFKLEVBQWdCLEtBQUksVUFBSixDQUFlLEdBQWYsQ0FBb0IsS0FBSyxJQUF6Qjs7QUFFaEIsU0FBSyxLQUFMLEdBQWEsS0FBSyxZQUFsQjs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsWUFBWSxLQUFLLElBQWpCLGVBQWtDLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBcEQsTUFBeEI7O0FBRUEsV0FBTyxLQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsQ0FBUDtBQUNEO0FBakJTLENBQVo7O0FBb0JBLE9BQU8sT0FBUCxHQUFpQixZQUF5QztBQUFBLE1BQXZDLFFBQXVDLHVFQUE5QixDQUE4QjtBQUFBLE1BQTNCLEtBQTJCLHVFQUFyQixDQUFxQjtBQUFBLE1BQWxCLEdBQWtCLHVFQUFkLENBQWM7QUFBQSxNQUFYLEdBQVcsdUVBQVAsQ0FBTzs7QUFDeEQsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxNQUFJLE9BQU8sUUFBUCxLQUFvQixRQUF4QixFQUFtQztBQUNqQyxTQUFLLElBQUwsR0FBWSxLQUFLLFFBQUwsR0FBZ0IsS0FBSSxNQUFKLEVBQTVCO0FBQ0EsU0FBSyxZQUFMLEdBQW9CLFFBQXBCO0FBQ0EsU0FBSyxHQUFMLEdBQVcsS0FBWDtBQUNBLFNBQUssR0FBTCxHQUFXLEdBQVg7QUFDRCxHQUxELE1BS0s7QUFDSCxTQUFLLElBQUwsR0FBWSxRQUFaO0FBQ0EsU0FBSyxHQUFMLEdBQVcsR0FBWDtBQUNBLFNBQUssR0FBTCxHQUFXLEdBQVg7QUFDQSxTQUFLLFlBQUwsR0FBb0IsS0FBcEI7QUFDRDs7QUFFRCxPQUFLLFlBQUwsR0FBb0IsS0FBSyxZQUF6Qjs7QUFFQTtBQUNBLE9BQUssS0FBTCxHQUFhLElBQWI7O0FBRUEsT0FBSyxTQUFMLEdBQWlCLEtBQUksSUFBSixLQUFhLFNBQTlCOztBQUVBLFNBQU8sY0FBUCxDQUF1QixJQUF2QixFQUE2QixPQUE3QixFQUFzQztBQUNwQyxPQURvQyxpQkFDOUI7QUFDSixVQUFJLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsS0FBMEIsSUFBOUIsRUFBcUM7QUFDbkMsZUFBTyxLQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbkMsQ0FBUDtBQUNELE9BRkQsTUFFSztBQUNILGVBQU8sS0FBSyxZQUFaO0FBQ0Q7QUFDRixLQVBtQztBQVFwQyxPQVJvQyxlQVEvQixDQVIrQixFQVEzQjtBQUNQLFVBQUksS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFsQixLQUEwQixJQUE5QixFQUFxQztBQUNuQyxZQUFJLEtBQUssU0FBTCxJQUFrQixLQUFLLEtBQUwsS0FBZSxJQUFyQyxFQUE0QztBQUMxQyxlQUFLLEtBQUwsQ0FBWSxRQUFaLEVBQXVCLEtBQXZCLEdBQStCLENBQS9CO0FBQ0QsU0FGRCxNQUVLO0FBQ0gsZUFBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQW5DLElBQTJDLENBQTNDO0FBQ0Q7QUFDRjtBQUNGO0FBaEJtQyxHQUF0Qzs7QUFtQkEsT0FBSyxNQUFMLEdBQWM7QUFDWixXQUFPLEVBQUUsUUFBTyxDQUFULEVBQVksS0FBSSxJQUFoQjtBQURLLEdBQWQ7O0FBSUEsU0FBTyxJQUFQO0FBQ0QsQ0E5Q0Q7Ozs7O0FDdkJBLElBQU0sT0FBTyxRQUFRLFVBQVIsQ0FBYjtBQUFBLElBQ00sV0FBVyxRQUFRLFdBQVIsQ0FEakI7O0FBR0EsSUFBSSxRQUFRO0FBQ1YsWUFBUyxNQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFVBQVUsU0FBUyxLQUFLLElBQTVCO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjtBQUFBLFFBRUksWUFGSjtBQUFBLFFBRVMscUJBRlQ7QUFBQSxRQUV1QixhQUZ2QjtBQUFBLFFBRTZCLHFCQUY3QjtBQUFBLFFBRTJDLFlBRjNDOztBQUlBLFVBQU0sT0FBTyxDQUFQLENBQU47QUFDQSxtQkFBZSxDQUFDLEtBQUssSUFBTCxDQUFXLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsTUFBNUIsSUFBdUMsQ0FBeEMsTUFBZ0QsS0FBSyxJQUFMLENBQVcsS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQixNQUE1QixDQUEvRDs7QUFFQSxRQUFJLEtBQUssSUFBTCxLQUFjLFFBQWxCLEVBQTZCOztBQUU3QixnQ0FBd0IsS0FBSyxJQUE3QixvQkFBZ0QsR0FBaEQsa0JBQ0ksS0FBSyxJQURULGtCQUN5QixLQUFLLElBQUwsS0FBYyxTQUFkLEdBQTBCLE9BQU8sQ0FBUCxDQUExQixHQUFzQyxPQUFPLENBQVAsSUFBWSxLQUFaLEdBQXFCLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsTUFEckcsbUJBRUksS0FBSyxJQUZULGlCQUV5QixLQUFLLElBRjlCOztBQUlBLFVBQUksS0FBSyxTQUFMLEtBQW1CLE1BQXZCLEVBQWdDO0FBQzlCLGVBQU8sc0JBQ0YsS0FBSyxJQURILHdCQUMwQixLQUFLLElBQUwsQ0FBVSxNQUFWLENBQWlCLE1BRDNDLGFBRUosS0FBSyxJQUZELHNCQUVzQixLQUFLLElBQUwsQ0FBVSxNQUFWLENBQWlCLE1BRnZDLFdBRW1ELEtBQUssSUFGeEQscUJBRTRFLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsTUFGN0YsV0FFeUcsS0FBSyxJQUY5RyxlQUFQO0FBR0QsT0FKRCxNQUlNLElBQUksS0FBSyxTQUFMLEtBQW1CLE9BQXZCLEVBQWlDO0FBQ3JDLGVBQ0ssS0FBSyxJQURWLHVCQUMrQixLQUFLLElBQUwsQ0FBVSxNQUFWLENBQWlCLE1BQWpCLEdBQTBCLENBRHpELGFBQ2dFLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsTUFBakIsR0FBMEIsQ0FEMUYsWUFDaUcsS0FBSyxJQUR0RztBQUVELE9BSEssTUFHQyxJQUFJLEtBQUssU0FBTCxLQUFtQixNQUFuQixJQUE2QixLQUFLLFNBQUwsS0FBbUIsUUFBcEQsRUFBK0Q7QUFDcEUsZUFDSyxLQUFLLElBRFYsdUJBQytCLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsTUFBakIsR0FBMEIsQ0FEekQsWUFDZ0UsS0FBSyxJQURyRSxrQkFDcUYsS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQixNQUFqQixHQUEwQixDQUQvRyxZQUNzSCxLQUFLLElBRDNIO0FBRUQsT0FITSxNQUdGO0FBQ0YsZUFDRSxLQUFLLElBRFA7QUFFRjs7QUFFRCxVQUFJLEtBQUssTUFBTCxLQUFnQixRQUFwQixFQUErQjtBQUMvQixtQ0FBeUIsS0FBSyxJQUE5QixpQkFBOEMsS0FBSyxJQUFuRCxpQkFBbUUsS0FBSyxJQUF4RSx1QkFDSSxLQUFLLElBRFQseUJBQ2lDLEtBQUssSUFEdEMsb0JBQ3lELEtBQUssSUFEOUQseUJBRUksS0FBSyxJQUZULGlCQUV5QixJQUZ6Qjs7QUFJRSxZQUFJLEtBQUssU0FBTCxLQUFtQixRQUF2QixFQUFrQztBQUNoQyx1Q0FDQSxLQUFLLElBREwsaUJBQ3FCLEtBQUssSUFEMUIsbUJBQzJDLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsTUFBakIsR0FBMEIsQ0FEckUsYUFDNkUsS0FBSyxJQURsRix5QkFDMEcsS0FBSyxJQUQvRyxnQkFDOEgsS0FBSyxJQURuSSwwQkFDNEosS0FBSyxJQURqSyxtQkFDbUwsS0FBSyxJQUR4TCxrQkFDeU0sS0FBSyxJQUQ5TTtBQUVELFNBSEQsTUFHSztBQUNILHVDQUNBLEtBQUssSUFETCxpQkFDcUIsS0FBSyxJQUQxQixnQkFDeUMsS0FBSyxJQUQ5QywwQkFDdUUsS0FBSyxJQUQ1RSxtQkFDOEYsS0FBSyxJQURuRyxrQkFDb0gsS0FBSyxJQUR6SDtBQUVEO0FBQ0YsT0FaRCxNQVlLO0FBQ0gsbUNBQXlCLEtBQUssSUFBOUIsdUJBQW9ELEtBQUssSUFBekQsbUJBQTJFLEtBQUssSUFBaEY7QUFDRDtBQUVBLEtBckNELE1BcUNPO0FBQUU7QUFDUCxrQ0FBMEIsR0FBMUIsV0FBb0MsT0FBTyxDQUFQLENBQXBDOztBQUVBLGFBQU8sWUFBUDtBQUNEOztBQUVELFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQUwsR0FBWSxNQUFwQzs7QUFFQSxXQUFPLENBQUUsS0FBSyxJQUFMLEdBQVUsTUFBWixFQUFvQixZQUFwQixDQUFQO0FBQ0QsR0F6RFM7OztBQTJEVixZQUFXLEVBQUUsVUFBUyxDQUFYLEVBQWMsTUFBSyxPQUFuQixFQUE0QixRQUFPLFFBQW5DLEVBQTZDLFdBQVUsTUFBdkQ7QUEzREQsQ0FBWjs7QUE4REEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsVUFBRixFQUF1QztBQUFBLE1BQXpCLEtBQXlCLHVFQUFuQixDQUFtQjtBQUFBLE1BQWhCLFVBQWdCOztBQUN0RCxNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBOztBQUVBO0FBQ0EsTUFBTSxZQUFZLE9BQU8sV0FBVyxRQUFsQixLQUErQixXQUEvQixHQUE2QyxLQUFJLEdBQUosQ0FBUSxJQUFSLENBQWMsVUFBZCxDQUE3QyxHQUEwRSxVQUE1Rjs7QUFFQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQ0U7QUFDRSxZQUFZLFNBRGQ7QUFFRSxjQUFZLFVBQVUsSUFGeEI7QUFHRSxTQUFZLEtBQUksTUFBSixFQUhkO0FBSUUsWUFBWSxDQUFFLEtBQUYsRUFBUyxTQUFUO0FBSmQsR0FERixFQU9FLE1BQU0sUUFQUixFQVFFLFVBUkY7O0FBV0EsT0FBSyxJQUFMLEdBQVksS0FBSyxRQUFMLEdBQWdCLEtBQUssR0FBakM7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0F0QkQ7Ozs7O0FDbEVBLElBQU0sT0FBTyxRQUFRLFVBQVIsQ0FBYjtBQUFBLElBQ00sV0FBVyxRQUFRLFdBQVIsQ0FEakI7O0FBR0EsSUFBTSxRQUFRO0FBQ1osWUFBUyxNQURHOztBQUdaLEtBSFksaUJBR047QUFDSixRQUFJLFVBQVUsU0FBUyxLQUFLLElBQTVCO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjtBQUFBLFFBRUksWUFGSjtBQUFBLFFBRVMscUJBRlQ7QUFBQSxRQUV1QixhQUZ2QjtBQUFBLFFBRTZCLHFCQUY3QjtBQUFBLFFBRTJDLGdCQUYzQztBQUFBLFFBRW9ELGtCQUZwRDtBQUFBLFFBRStELGVBRi9EOztBQUlBO0FBQ0EsZ0JBQVksT0FBTyxDQUFQLENBQVo7QUFDQSxhQUFZLE9BQU8sQ0FBUCxDQUFaO0FBQ0EsY0FBWSxPQUFPLENBQVAsQ0FBWjs7QUFFQTs7QUFFQSxRQUFJLEtBQUssSUFBTCxLQUFjLFFBQWxCLEVBQTZCOztBQUUzQixnQ0FBd0IsS0FBSyxJQUE3QixvQkFBZ0QsU0FBaEQsb0JBQ0ksS0FBSyxJQURULGtCQUN5QixLQUFLLElBQUwsS0FBYyxTQUFkLEdBQTBCLE9BQTFCLEdBQW9DLFVBQVUsS0FBVixHQUFtQixNQURoRixxQkFFSSxLQUFLLElBRlQsaUJBRXlCLEtBQUssSUFGOUI7O0FBSUEsVUFBSSxLQUFLLFNBQUwsS0FBbUIsTUFBdkIsRUFBZ0M7QUFDOUIsZUFBUyxLQUFLLElBQWQsc0JBQW1DLE1BQW5DLFdBQStDLEtBQUssSUFBcEQscUJBQXdFLE1BQXhFLFdBQW9GLEtBQUssSUFBekY7QUFDRCxPQUZELE1BRU0sSUFBSSxLQUFLLFNBQUwsS0FBbUIsT0FBdkIsRUFBaUM7QUFDckMsZUFDSyxLQUFLLElBRFYsc0JBQytCLE1BRC9CLGNBQzhDLE1BRDlDLGVBQzhELEtBQUssSUFEbkU7QUFFRCxPQUhLLE1BR0MsSUFBSSxLQUFLLFNBQUwsS0FBbUIsTUFBbkIsSUFBNkIsS0FBSyxTQUFMLEtBQW1CLFFBQXBELEVBQStEO0FBQ3BFLGVBQ0ssS0FBSyxJQURWLHNCQUMrQixNQUQvQixlQUMrQyxLQUFLLElBRHBELGlCQUNvRSxNQURwRSxlQUNvRixLQUFLLElBRHpGO0FBRUQsT0FITSxNQUdGO0FBQ0YsZUFDRSxLQUFLLElBRFA7QUFFRjs7QUFFRCxVQUFJLEtBQUssTUFBTCxLQUFnQixRQUFwQixFQUErQjtBQUM3QixtQ0FBeUIsS0FBSyxJQUE5QixpQkFBOEMsS0FBSyxJQUFuRCxpQkFBbUUsS0FBSyxJQUF4RSx5QkFDRSxLQUFLLElBRFAseUJBQytCLEtBQUssSUFEcEMsb0JBQ3VELEtBQUssSUFENUQsMkJBRUUsS0FBSyxJQUZQLGlCQUV1QixJQUZ2Qjs7QUFJQSxZQUFJLEtBQUssU0FBTCxLQUFtQixRQUF2QixFQUFrQztBQUNoQyx5Q0FDQSxLQUFLLElBREwsaUJBQ3FCLEtBQUssSUFEMUIsa0JBQzJDLE1BRDNDLGdCQUM0RCxLQUFLLElBRGpFLHlCQUN5RixLQUFLLElBRDlGLGdCQUM2RyxLQUFLLElBRGxILDBCQUMySSxLQUFLLElBRGhKLG1CQUNrSyxLQUFLLElBRHZLLGtCQUN3TCxLQUFLLElBRDdMO0FBRUQsU0FIRCxNQUdLO0FBQ0gseUNBQ0EsS0FBSyxJQURMLGlCQUNxQixLQUFLLElBRDFCLGdCQUN5QyxLQUFLLElBRDlDLDBCQUN1RSxLQUFLLElBRDVFLG1CQUM4RixLQUFLLElBRG5HLGtCQUNvSCxLQUFLLElBRHpIO0FBRUQ7QUFDRixPQVpELE1BWUs7QUFDSCxtQ0FBeUIsS0FBSyxJQUE5Qix1QkFBb0QsS0FBSyxJQUF6RCxtQkFBMkUsS0FBSyxJQUFoRjtBQUNEO0FBRUYsS0FuQ0QsTUFtQ087QUFBRTtBQUNQLGtDQUEwQixTQUExQixXQUEwQyxPQUExQzs7QUFFQSxhQUFPLFlBQVA7QUFDRDs7QUFFRCxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUFMLEdBQVksTUFBcEM7O0FBRUEsV0FBTyxDQUFFLEtBQUssSUFBTCxHQUFVLE1BQVosRUFBb0IsWUFBcEIsQ0FBUDtBQUNELEdBM0RXOzs7QUE2RFosWUFBVyxFQUFFLFVBQVMsQ0FBWCxFQUFjLE1BQUssT0FBbkIsRUFBNEIsUUFBTyxRQUFuQyxFQUE2QyxXQUFVLE1BQXZEO0FBN0RDLENBQWQ7O0FBZ0VBLE9BQU8sT0FBUCxHQUFpQixVQUFFLFVBQUYsRUFBYyxNQUFkLEVBQStDO0FBQUEsTUFBekIsS0FBeUIsdUVBQW5CLENBQW1CO0FBQUEsTUFBaEIsVUFBZ0I7O0FBQzlELE1BQU0sT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQWI7O0FBRUE7QUFDQSxNQUFNLFlBQVksT0FBTyxXQUFXLFFBQWxCLEtBQStCLFdBQS9CLEdBQTZDLEtBQUksR0FBSixDQUFRLElBQVIsQ0FBYyxVQUFkLENBQTdDLEdBQTBFLFVBQTVGOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFDRTtBQUNFLFlBQVksU0FEZDtBQUVFLGNBQVksVUFBVSxJQUZ4QjtBQUdFLFNBQVksS0FBSSxNQUFKLEVBSGQ7QUFJRSxZQUFZLENBQUUsVUFBRixFQUFjLE1BQWQsRUFBc0IsS0FBdEIsRUFBNkIsU0FBN0I7QUFKZCxHQURGLEVBT0UsTUFBTSxRQVBSLEVBUUUsVUFSRjs7QUFXQSxPQUFLLElBQUwsR0FBWSxLQUFLLFFBQUwsR0FBZ0IsS0FBSyxHQUFqQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQXBCRDs7O0FDbkVBOztBQUVBLElBQU0sTUFBUSxRQUFTLFVBQVQsQ0FBZDtBQUFBLElBQ00sUUFBUSxRQUFTLFlBQVQsQ0FEZDtBQUFBLElBRU0sTUFBUSxRQUFTLFVBQVQsQ0FGZDtBQUFBLElBR00sUUFBUSxFQUFFLFVBQVMsUUFBWCxFQUhkO0FBQUEsSUFJTSxNQUFRLFFBQVMsVUFBVCxDQUpkOztBQU1BLElBQU0sV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFSLEVBQVcsS0FBSyxDQUFoQixFQUFqQjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsWUFBd0M7QUFBQSxNQUF0QyxTQUFzQyx1RUFBMUIsQ0FBMEI7QUFBQSxNQUF2QixLQUF1Qix1RUFBZixDQUFlO0FBQUEsTUFBWixNQUFZOztBQUN2RCxNQUFNLFFBQVEsT0FBTyxNQUFQLENBQWUsRUFBZixFQUFtQixRQUFuQixFQUE2QixNQUE3QixDQUFkOztBQUVBLE1BQU0sUUFBUSxNQUFNLEdBQU4sR0FBWSxNQUFNLEdBQWhDOztBQUVBLE1BQU0sT0FBTyxPQUFPLFNBQVAsS0FBcUIsUUFBckIsR0FDVCxNQUFRLFlBQVksS0FBYixHQUFzQixJQUFJLFVBQWpDLEVBQTZDLEtBQTdDLEVBQW9ELEtBQXBELENBRFMsR0FFVCxNQUNFLElBQ0UsSUFBSyxTQUFMLEVBQWdCLEtBQWhCLENBREYsRUFFRSxJQUFJLFVBRk4sQ0FERixFQUtFLEtBTEYsRUFLUyxLQUxULENBRko7O0FBVUEsT0FBSyxJQUFMLEdBQVksTUFBTSxRQUFOLEdBQWlCLElBQUksTUFBSixFQUE3Qjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQWxCRDs7O0FDVkE7O0FBRUEsSUFBTSxNQUFRLFFBQVMsVUFBVCxDQUFkO0FBQUEsSUFDTSxRQUFRLFFBQVMsWUFBVCxDQURkO0FBQUEsSUFFTSxNQUFRLFFBQVMsVUFBVCxDQUZkO0FBQUEsSUFHTSxRQUFRLEVBQUUsVUFBUyxTQUFYLEVBSGQ7QUFBQSxJQUlNLE1BQVEsUUFBUyxVQUFULENBSmQ7O0FBTUEsSUFBTSxXQUFXLEVBQUUsS0FBSyxDQUFQLEVBQVUsS0FBSyxDQUFmLEVBQWpCOztBQUVBLE9BQU8sT0FBUCxHQUFpQixZQUF3QztBQUFBLE1BQXRDLFNBQXNDLHVFQUExQixDQUEwQjtBQUFBLE1BQXZCLEtBQXVCLHVFQUFmLENBQWU7QUFBQSxNQUFaLE1BQVk7O0FBQ3ZELE1BQU0sUUFBUSxPQUFPLE1BQVAsQ0FBZSxFQUFmLEVBQW1CLFFBQW5CLEVBQTZCLE1BQTdCLENBQWQ7O0FBRUEsTUFBTSxRQUFRLE1BQU0sR0FBTixHQUFZLE1BQU0sR0FBaEM7O0FBRUEsTUFBTSxPQUFPLE9BQU8sU0FBUCxLQUFxQixRQUFyQixHQUNULE1BQVEsWUFBWSxLQUFiLEdBQXNCLElBQUksVUFBakMsRUFBNkMsS0FBN0MsRUFBb0QsS0FBcEQsQ0FEUyxHQUVULE1BQ0UsSUFDRSxJQUFLLFNBQUwsRUFBZ0IsS0FBaEIsQ0FERixFQUVFLElBQUksVUFGTixDQURGLEVBS0UsS0FMRixFQUtTLEtBTFQsQ0FGSjs7QUFVQSxPQUFLLElBQUwsR0FBWSxNQUFNLFFBQU4sR0FBaUIsSUFBSSxNQUFKLEVBQTdCOztBQUVBLFNBQU8sSUFBUDtBQUNELENBbEJEOzs7QUNWQTs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7QUFBQSxJQUNJLE1BQU8sUUFBUSxVQUFSLENBRFg7QUFBQSxJQUVJLE9BQU8sUUFBUSxXQUFSLENBRlg7O0FBSUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxNQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFdBQVcsUUFBZjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7QUFBQSxRQUVJLFlBRko7QUFBQSxRQUVTLFlBRlQ7QUFBQSxRQUVjLGdCQUZkOztBQUlBLFVBQU0sS0FBSyxJQUFMLENBQVUsR0FBVixFQUFOOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBSSxZQUFZLEtBQUssTUFBTCxDQUFZLENBQVosTUFBbUIsQ0FBbkIsVUFDVCxRQURTLFVBQ0ksR0FESixhQUNlLE9BQU8sQ0FBUCxDQURmLGlCQUVULFFBRlMsVUFFSSxHQUZKLFdBRWEsT0FBTyxDQUFQLENBRmIsYUFFOEIsT0FBTyxDQUFQLENBRjlCLE9BQWhCOztBQUlBLFFBQUksS0FBSyxNQUFMLEtBQWdCLFNBQXBCLEVBQWdDO0FBQzlCLFdBQUksWUFBSixJQUFvQixTQUFwQjtBQUNELEtBRkQsTUFFSztBQUNILGFBQU8sQ0FBRSxLQUFLLE1BQVAsRUFBZSxTQUFmLENBQVA7QUFDRDtBQUNGO0FBdkJTLENBQVo7QUF5QkEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsSUFBRixFQUFRLEtBQVIsRUFBZSxLQUFmLEVBQXNCLFVBQXRCLEVBQXNDO0FBQ3JELE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7QUFBQSxNQUNJLFdBQVcsRUFBRSxVQUFTLENBQVgsRUFEZjs7QUFHQSxNQUFJLGVBQWUsU0FBbkIsRUFBK0IsT0FBTyxNQUFQLENBQWUsUUFBZixFQUF5QixVQUF6Qjs7QUFFL0IsU0FBTyxNQUFQLENBQWUsSUFBZixFQUFxQjtBQUNuQixjQURtQjtBQUVuQixjQUFZLEtBQUssSUFGRTtBQUduQixnQkFBWSxLQUFLLE1BQUwsQ0FBWSxNQUhMO0FBSW5CLFNBQVksS0FBSSxNQUFKLEVBSk87QUFLbkIsWUFBWSxDQUFFLEtBQUYsRUFBUyxLQUFUO0FBTE8sR0FBckIsRUFPQSxRQVBBOztBQVVBLE9BQUssSUFBTCxHQUFZLEtBQUssUUFBTCxHQUFnQixLQUFLLEdBQWpDOztBQUVBLE9BQUksU0FBSixDQUFjLEdBQWQsQ0FBbUIsS0FBSyxJQUF4QixFQUE4QixJQUE5Qjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQXJCRDs7O0FDL0JBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLEtBREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBSUEsUUFBTSxZQUFZLEtBQUksSUFBSixLQUFhLFNBQS9CO0FBQ0EsUUFBTSxNQUFNLFlBQVcsRUFBWCxHQUFnQixNQUE1Qjs7QUFFQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsS0FBc0IsTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUExQixFQUErQztBQUM3QyxXQUFJLFFBQUosQ0FBYSxHQUFiLENBQWlCLEVBQUUsT0FBTyxZQUFZLFVBQVosR0FBeUIsS0FBSyxHQUF2QyxFQUFqQjs7QUFFQSxZQUFTLEdBQVQsYUFBb0IsT0FBTyxDQUFQLENBQXBCLFVBQWtDLE9BQU8sQ0FBUCxDQUFsQztBQUVELEtBTEQsTUFLTztBQUNMLFVBQUksT0FBTyxPQUFPLENBQVAsQ0FBUCxLQUFxQixRQUFyQixJQUFpQyxPQUFPLENBQVAsRUFBVSxDQUFWLE1BQWlCLEdBQXRELEVBQTREO0FBQzFELGVBQU8sQ0FBUCxJQUFZLE9BQU8sQ0FBUCxFQUFVLEtBQVYsQ0FBZ0IsQ0FBaEIsRUFBa0IsQ0FBQyxDQUFuQixDQUFaO0FBQ0Q7QUFDRCxVQUFJLE9BQU8sT0FBTyxDQUFQLENBQVAsS0FBcUIsUUFBckIsSUFBaUMsT0FBTyxDQUFQLEVBQVUsQ0FBVixNQUFpQixHQUF0RCxFQUE0RDtBQUMxRCxlQUFPLENBQVAsSUFBWSxPQUFPLENBQVAsRUFBVSxLQUFWLENBQWdCLENBQWhCLEVBQWtCLENBQUMsQ0FBbkIsQ0FBWjtBQUNEOztBQUVELFlBQU0sS0FBSyxHQUFMLENBQVUsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFWLEVBQW1DLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBbkMsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBNUJTLENBQVo7O0FBK0JBLE9BQU8sT0FBUCxHQUFpQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDeEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsRUFBSSxDQUFKLENBQWI7QUFDQSxNQUFJLEVBQUosR0FBUyxLQUFJLE1BQUosRUFBVDtBQUNBLE1BQUksSUFBSixHQUFjLElBQUksUUFBbEI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FSRDs7O0FDbkNBOzs7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYO0FBQ0EsSUFBTSxRQUFRO0FBQ1osWUFBUyxTQURHOztBQUdaLEtBSFksaUJBR047QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLFNBQUksUUFBSixDQUFhLEdBQWIscUJBQW9CLEtBQUcsS0FBSyxRQUE1QixFQUF3QyxLQUFLLElBQTdDOztBQUVBLHFCQUFlLEtBQUssSUFBcEIsaUJBQW1DLEtBQUssUUFBeEM7O0FBRUEsV0FBTyxPQUFQLENBQWdCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxHQUFMLEVBQWM7QUFDNUIsYUFBTyxJQUFLLENBQUwsQ0FBUDtBQUNBLFVBQUksSUFBSSxJQUFJLE1BQUosR0FBYSxDQUFyQixFQUF5QixPQUFPLEdBQVA7QUFDMUIsS0FIRDs7QUFLQSxXQUFPLEtBQVA7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBN0I7O0FBRUEsV0FBTyxDQUFDLEtBQUssSUFBTixFQUFZLEdBQVosQ0FBUDs7QUFFQSxXQUFPLEdBQVA7QUFDRDtBQXZCVyxDQUFkOztBQTBCQSxPQUFPLE9BQVAsR0FBaUIsWUFBYTtBQUFBLG9DQUFULElBQVM7QUFBVCxRQUFTO0FBQUE7O0FBQzVCLE1BQU0sVUFBVSxFQUFoQixDQUQ0QixDQUNWO0FBQ2xCLE1BQU0sS0FBSyxLQUFJLE1BQUosRUFBWDtBQUNBLFVBQVEsSUFBUixHQUFlLFlBQVksRUFBM0I7O0FBRUEsVUFBUSxJQUFSLHNDQUFtQixRQUFuQixnQkFBZ0MsSUFBaEM7O0FBRUE7O0FBRUEsVUFBUSxJQUFSLEdBQWUsWUFBcUI7QUFDbEMsUUFBTSxTQUFTLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBZjtBQUNBLFdBQU8sUUFBUCxHQUFrQixRQUFRLElBQTFCO0FBQ0EsV0FBTyxJQUFQLEdBQWMsUUFBUSxJQUF0QjtBQUNBLFdBQU8sSUFBUCxHQUFjLGlCQUFpQixFQUEvQjtBQUNBLFdBQU8sT0FBUCxHQUFpQixPQUFqQjs7QUFMa0MsdUNBQVIsSUFBUTtBQUFSLFVBQVE7QUFBQTs7QUFPbEMsV0FBTyxNQUFQLEdBQWdCLElBQWhCOztBQUVBLFdBQU8sTUFBUDtBQUNELEdBVkQ7O0FBWUEsU0FBTyxPQUFQO0FBQ0QsQ0F0QkQ7OztBQzdCQTs7OztBQUVBLElBQUksT0FBVSxRQUFTLFVBQVQsQ0FBZDtBQUFBLElBQ0ksVUFBVSxRQUFTLGNBQVQsQ0FEZDtBQUFBLElBRUksTUFBVSxRQUFTLFVBQVQsQ0FGZDtBQUFBLElBR0ksTUFBVSxRQUFTLFVBQVQsQ0FIZDtBQUFBLElBSUksTUFBVSxRQUFTLFVBQVQsQ0FKZDtBQUFBLElBS0ksT0FBVSxRQUFTLFdBQVQsQ0FMZDtBQUFBLElBTUksUUFBVSxRQUFTLFlBQVQsQ0FOZDtBQUFBLElBT0ksT0FBVSxRQUFTLFdBQVQsQ0FQZDs7QUFTQSxJQUFJLFFBQVE7QUFDVixZQUFTLE1BREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7QUFBQSxRQUNJLFFBQVMsU0FEYjtBQUFBLFFBRUksV0FBVyxTQUZmO0FBQUEsUUFHSSxVQUFVLFNBQVMsS0FBSyxJQUg1QjtBQUFBLFFBSUksZUFKSjtBQUFBLFFBSVksWUFKWjtBQUFBLFFBSWlCLFlBSmpCOztBQU1BLFNBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBMUIsRUFBa0MsSUFBbEM7O0FBRUEsb0JBQ0ksS0FBSyxJQURULGdCQUN3QixPQUFPLENBQVAsQ0FEeEIsV0FDdUMsT0FEdkMsMkJBRUksS0FBSyxJQUZULHNCQUU4QixLQUFLLElBRm5DLHNCQUdBLE9BSEEsa0JBR29CLEtBQUssSUFIekIsZ0JBR3dDLE9BQU8sQ0FBUCxDQUh4QyxnQkFJSSxPQUpKLHFCQUkyQixPQUozQix1QkFLQSxPQUxBLHNCQUt3QixPQUFPLENBQVAsQ0FMeEI7QUFPQSxVQUFNLE1BQU0sR0FBWjs7QUFFQSxXQUFPLENBQUUsVUFBVSxRQUFaLEVBQXNCLEdBQXRCLENBQVA7QUFDRDtBQXRCUyxDQUFaOztBQXlCQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxHQUFGLEVBQU8sSUFBUCxFQUFpQjtBQUNoQyxNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsV0FBWSxDQURPO0FBRW5CLGdCQUFZLENBRk87QUFHbkIsU0FBWSxLQUFJLE1BQUosRUFITztBQUluQixZQUFZLENBQUUsR0FBRixFQUFPLElBQVA7QUFKTyxHQUFyQjs7QUFPQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUssR0FBcEM7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FiRDs7O0FDcENBOzs7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFFBQUssT0FESzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFJQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7QUFDQSxRQUFNLE1BQU0sWUFBVyxFQUFYLEdBQWdCLE1BQTVCOztBQUVBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBMUIsRUFBa0MsWUFBWSxZQUFaLEdBQTJCLEtBQUssS0FBbEU7O0FBRUEsWUFBUyxHQUFULGVBQXNCLE9BQU8sQ0FBUCxDQUF0QjtBQUVELEtBTEQsTUFLTztBQUNMLFlBQU0sS0FBSyxLQUFMLENBQVksV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFaLENBQU47QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQXJCUyxDQUFaOztBQXdCQSxPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLFFBQVEsT0FBTyxNQUFQLENBQWUsS0FBZixDQUFaOztBQUVBLFFBQU0sTUFBTixHQUFlLENBQUUsQ0FBRixDQUFmOztBQUVBLFNBQU8sS0FBUDtBQUNELENBTkQ7OztBQzVCQTs7QUFFQSxJQUFJLE9BQVUsUUFBUyxVQUFULENBQWQ7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxLQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiO0FBQUEsUUFBb0MsWUFBcEM7O0FBRUE7QUFDQTs7QUFFQSxTQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4Qjs7QUFHQSxvQkFDSSxLQUFLLElBRFQsMEJBQ2tDLEtBQUssTUFBTCxDQUFZLE9BQVosQ0FBb0IsR0FEdEQsa0JBRUksS0FBSyxJQUZULG1CQUUyQixPQUFPLENBQVAsQ0FGM0IsV0FFMEMsT0FBTyxDQUFQLENBRjFDLDBCQUlJLEtBQUssSUFKVCxxQkFJNkIsS0FBSyxJQUpsQywrQkFLTSxLQUFLLElBTFgsd0NBTVcsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQU43QixZQU11QyxPQUFPLENBQVAsQ0FOdkMsMkJBUVMsS0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixHQVI3QixZQVF1QyxLQUFLLElBUjVDOztBQVlBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixnQkFBa0MsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFwRCxPQXJCSSxDQXFCc0Q7O0FBRTFELFdBQU8sYUFBWSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQTlCLFFBQXNDLE1BQUssR0FBM0MsQ0FBUDtBQUNEO0FBM0JTLENBQVo7O0FBOEJBLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBTyxPQUFQLEVBQTZDO0FBQUEsTUFBN0IsU0FBNkIsdUVBQW5CLENBQW1CO0FBQUEsTUFBaEIsVUFBZ0I7O0FBQzVELE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7QUFBQSxNQUNJLFdBQVcsRUFBRSxNQUFLLENBQVAsRUFEZjs7QUFHQSxNQUFJLGVBQWUsU0FBbkIsRUFBK0IsT0FBTyxNQUFQLENBQWUsUUFBZixFQUF5QixVQUF6Qjs7QUFFL0IsU0FBTyxNQUFQLENBQWUsSUFBZixFQUFxQjtBQUNuQixnQkFBWSxDQURPO0FBRW5CLFNBQVksS0FBSSxNQUFKLEVBRk87QUFHbkIsWUFBWSxDQUFFLEdBQUYsRUFBTyxPQUFQLEVBQWUsU0FBZixDQUhPO0FBSW5CLFlBQVE7QUFDTixlQUFTLEVBQUUsS0FBSSxJQUFOLEVBQVksUUFBTyxDQUFuQixFQURIO0FBRU4sYUFBUyxFQUFFLEtBQUksSUFBTixFQUFZLFFBQU8sQ0FBbkI7QUFGSDtBQUpXLEdBQXJCLEVBU0EsUUFUQTs7QUFXQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUssR0FBcEM7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FwQkQ7OztBQ2xDQTs7QUFFQSxJQUFJLE9BQU0sUUFBUyxVQUFULENBQVY7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxVQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiO0FBQUEsUUFBb0MsWUFBcEM7QUFBQSxRQUF5QyxjQUFjLENBQXZEOztBQUVBLFlBQVEsT0FBTyxNQUFmO0FBQ0UsV0FBSyxDQUFMO0FBQ0Usc0JBQWMsT0FBTyxDQUFQLENBQWQ7QUFDQTtBQUNGLFdBQUssQ0FBTDtBQUNFLHlCQUFlLEtBQUssSUFBcEIsZUFBa0MsT0FBTyxDQUFQLENBQWxDLGlCQUF1RCxPQUFPLENBQVAsQ0FBdkQsV0FBc0UsT0FBTyxDQUFQLENBQXRFO0FBQ0Esc0JBQWMsQ0FBRSxLQUFLLElBQUwsR0FBWSxNQUFkLEVBQXNCLEdBQXRCLENBQWQ7QUFDQTtBQUNGO0FBQ0Usd0JBQ0EsS0FBSyxJQURMLDRCQUVJLE9BQU8sQ0FBUCxDQUZKOztBQUlBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxPQUFPLE1BQTNCLEVBQW1DLEdBQW5DLEVBQXdDO0FBQ3RDLCtCQUFrQixDQUFsQixVQUF3QixLQUFLLElBQTdCLGVBQTJDLE9BQU8sQ0FBUCxDQUEzQztBQUNEOztBQUVELGVBQU8sU0FBUDs7QUFFQSxzQkFBYyxDQUFFLEtBQUssSUFBTCxHQUFZLE1BQWQsRUFBc0IsTUFBTSxHQUE1QixDQUFkO0FBbkJKOztBQXNCQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUFMLEdBQVksTUFBcEM7O0FBRUEsV0FBTyxXQUFQO0FBQ0Q7QUEvQlMsQ0FBWjs7QUFrQ0EsT0FBTyxPQUFQLEdBQWlCLFlBQWlCO0FBQUEsb0NBQVosTUFBWTtBQUFaLFVBQVk7QUFBQTs7QUFDaEMsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFNBQVMsS0FBSSxNQUFKLEVBRFU7QUFFbkI7QUFGbUIsR0FBckI7O0FBS0EsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFwQixHQUErQixLQUFLLEdBQXBDOztBQUVBLFNBQU8sSUFBUDtBQUNELENBWEQ7OztBQ3RDQTs7QUFFQSxJQUFJLE1BQVEsUUFBUyxVQUFULENBQVo7QUFBQSxJQUNJLFFBQVEsUUFBUyxZQUFULENBRFo7QUFBQSxJQUVJLFVBQVMsUUFBUyxjQUFULENBRmI7QUFBQSxJQUdJLE9BQVEsUUFBUyxXQUFULENBSFo7QUFBQSxJQUlJLE1BQVEsUUFBUyxjQUFULENBSlo7QUFBQSxJQUtJLE9BQVEsUUFBUyxXQUFULENBTFo7QUFBQSxJQU1JLFFBQVEsRUFBRSxVQUFTLEtBQVgsRUFOWjs7QUFRQSxPQUFPLE9BQVAsR0FBaUIsWUFBNEQ7QUFBQSxNQUExRCxTQUEwRCx1RUFBOUMsS0FBOEM7QUFBQSxNQUF2QyxNQUF1Qyx1RUFBOUIsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUE4QjtBQUFBLE1BQXZCLGNBQXVCLHVFQUFOLENBQU07O0FBQzNFLE1BQUksY0FBSjs7QUFFQSxNQUFJLE1BQU0sT0FBTixDQUFlLFNBQWYsQ0FBSixFQUFpQztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU0sU0FBUyxRQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsVUFBVSxNQUF6QixDQUFmO0FBQ0EsUUFBTSxjQUFjLEtBQU0sS0FBTSxTQUFOLENBQU4sRUFBeUIsTUFBekIsRUFBaUMsRUFBRSxNQUFLLFFBQVAsRUFBakMsQ0FBcEI7QUFDQSxZQUFRLFFBQVMsY0FBVCxFQUF5QixDQUF6QixFQUE0QixXQUE1QixDQUFSOztBQUVBO0FBQ0EsUUFBTSxJQUFJLEtBQVY7QUFDQSxNQUFFLEVBQUYsQ0FBTSxNQUFNLElBQVo7QUFDQSxXQUFPLE1BQVAsQ0FBYyxDQUFkLElBQW1CLEVBQUUsR0FBckI7QUFDRCxHQWJELE1BYUs7QUFDSDtBQUNBO0FBQ0EsWUFBUSxRQUFTLGNBQVQsRUFBeUIsQ0FBekIsRUFBNEIsU0FBNUIsQ0FBUjtBQUNEOztBQUVELE1BQU0sVUFBVSxNQUFPLE1BQU0sSUFBYixFQUFtQixDQUFuQixFQUFzQixFQUFFLEtBQUksQ0FBTixFQUFTLEtBQUksT0FBTyxNQUFwQixFQUF0QixDQUFoQjs7QUFFQSxNQUFNLE9BQU8sS0FBTSxLQUFNLE1BQU4sQ0FBTixFQUFzQixPQUF0QixFQUErQixFQUFFLE1BQUssUUFBUCxFQUEvQixDQUFiOztBQUVBLE9BQUssSUFBTCxHQUFZLE1BQU0sUUFBTixHQUFpQixJQUFJLE1BQUosRUFBN0I7QUFDQSxPQUFLLE9BQUwsR0FBZSxNQUFNLElBQXJCOztBQUVBLFNBQU8sSUFBUDtBQUNELENBOUJEOzs7QUNWQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLE1BREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBSUEsUUFBTSxZQUFZLEtBQUksSUFBSixLQUFhLFNBQS9CO0FBQ0EsUUFBTSxNQUFNLFlBQVcsRUFBWCxHQUFnQixNQUE1Qjs7QUFFQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2QixXQUFJLFFBQUosQ0FBYSxHQUFiLHFCQUFxQixLQUFLLElBQTFCLEVBQWtDLFlBQVksV0FBWixHQUEwQixLQUFLLElBQWpFOztBQUVBLFlBQVMsR0FBVCxjQUFxQixPQUFPLENBQVAsQ0FBckI7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssSUFBTCxDQUFXLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBWCxDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFyQlMsQ0FBWjs7QUF3QkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxPQUFLLE1BQUwsR0FBYyxDQUFFLENBQUYsQ0FBZDs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQU5EOzs7QUM1QkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsS0FEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFJQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7QUFDQSxRQUFNLE1BQU0sWUFBVyxFQUFYLEdBQWdCLE1BQTVCOztBQUVBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsRUFBRSxPQUFPLFlBQVksVUFBWixHQUF5QixLQUFLLEdBQXZDLEVBQWpCOztBQUVBLFlBQVMsR0FBVCxhQUFvQixPQUFPLENBQVAsQ0FBcEI7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssR0FBTCxDQUFVLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBVixDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFyQlMsQ0FBWjs7QUF3QkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYjtBQUNBLE1BQUksRUFBSixHQUFTLEtBQUksTUFBSixFQUFUO0FBQ0EsTUFBSSxJQUFKLEdBQWMsSUFBSSxRQUFsQjs7QUFFQSxTQUFPLEdBQVA7QUFDRCxDQVJEOzs7QUM1QkE7O0FBRUEsSUFBSSxNQUFVLFFBQVMsVUFBVCxDQUFkO0FBQUEsSUFDSSxVQUFVLFFBQVMsY0FBVCxDQURkO0FBQUEsSUFFSSxNQUFVLFFBQVMsVUFBVCxDQUZkO0FBQUEsSUFHSSxNQUFVLFFBQVMsVUFBVCxDQUhkO0FBQUEsSUFJSSxNQUFVLFFBQVMsVUFBVCxDQUpkO0FBQUEsSUFLSSxPQUFVLFFBQVMsV0FBVCxDQUxkO0FBQUEsSUFNSSxLQUFVLFFBQVMsU0FBVCxDQU5kO0FBQUEsSUFPSSxNQUFVLFFBQVMsVUFBVCxDQVBkO0FBQUEsSUFRSSxVQUFVLFFBQVMsYUFBVCxDQVJkOztBQVVBLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBdUM7QUFBQSxRQUFoQyxPQUFnQyx1RUFBdEIsQ0FBc0I7QUFBQSxRQUFuQixTQUFtQix1RUFBUCxDQUFPOztBQUN0RCxRQUFJLEtBQUssUUFBUSxDQUFSLENBQVQ7QUFBQSxRQUNJLGVBREo7QUFBQSxRQUNZLG9CQURaOztBQUdBO0FBQ0Esa0JBQWMsUUFBUyxHQUFHLEdBQUgsRUFBTyxHQUFHLEdBQVYsQ0FBVCxFQUF5QixPQUF6QixFQUFrQyxTQUFsQyxDQUFkOztBQUVBLGFBQVMsS0FBTSxJQUFLLEdBQUcsR0FBUixFQUFhLElBQUssSUFBSyxHQUFMLEVBQVUsR0FBRyxHQUFiLENBQUwsRUFBeUIsV0FBekIsQ0FBYixDQUFOLENBQVQ7O0FBRUEsT0FBRyxFQUFILENBQU8sTUFBUDs7QUFFQSxXQUFPLE1BQVA7QUFDRCxDQVpEOzs7QUNaQTs7QUFFQSxJQUFNLE9BQU0sUUFBUSxVQUFSLENBQVo7O0FBRUEsSUFBTSxRQUFRO0FBQ1osWUFBUyxLQURHO0FBRVosS0FGWSxpQkFFTjtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7QUFBQSxRQUNJLE1BQUksQ0FEUjtBQUFBLFFBRUksT0FBTyxDQUZYO0FBQUEsUUFHSSxjQUFjLEtBSGxCO0FBQUEsUUFJSSxXQUFXLENBSmY7QUFBQSxRQUtJLGFBQWEsT0FBUSxDQUFSLENBTGpCO0FBQUEsUUFNSSxtQkFBbUIsTUFBTyxVQUFQLENBTnZCO0FBQUEsUUFPSSxXQUFXLEtBUGY7QUFBQSxRQVFJLFdBQVcsS0FSZjtBQUFBLFFBU0ksY0FBYyxDQVRsQjs7QUFXQSxTQUFLLE1BQUwsQ0FBWSxPQUFaLENBQXFCLGlCQUFTO0FBQUUsVUFBSSxNQUFPLEtBQVAsQ0FBSixFQUFxQixXQUFXLElBQVg7QUFBaUIsS0FBdEU7O0FBRUEsVUFBTSxXQUFXLEtBQUssSUFBaEIsR0FBdUIsS0FBN0I7O0FBRUEsV0FBTyxPQUFQLENBQWdCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBUztBQUN2QixVQUFJLE1BQU0sQ0FBVixFQUFjOztBQUVkLFVBQUksZUFBZSxNQUFPLENBQVAsQ0FBbkI7QUFBQSxVQUNJLGFBQWUsTUFBTSxPQUFPLE1BQVAsR0FBZ0IsQ0FEekM7O0FBR0EsVUFBSSxDQUFDLGdCQUFELElBQXFCLENBQUMsWUFBMUIsRUFBeUM7QUFDdkMscUJBQWEsYUFBYSxDQUExQjtBQUNBLGVBQU8sVUFBUDtBQUNBO0FBQ0QsT0FKRCxNQUlLO0FBQ0gsc0JBQWMsSUFBZDtBQUNBLGVBQVUsVUFBVixXQUEwQixDQUExQjtBQUNEOztBQUVELFVBQUksQ0FBQyxVQUFMLEVBQWtCLE9BQU8sS0FBUDtBQUNuQixLQWhCRDs7QUFrQkEsV0FBTyxJQUFQOztBQUVBLGtCQUFjLENBQUUsS0FBSyxJQUFQLEVBQWEsR0FBYixDQUFkOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQTdCOztBQUVBLFdBQU8sV0FBUDtBQUNEO0FBM0NXLENBQWQ7O0FBK0NBLE9BQU8sT0FBUCxHQUFpQixZQUFlO0FBQUEsb0NBQVYsSUFBVTtBQUFWLFFBQVU7QUFBQTs7QUFDOUIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxTQUFPLE1BQVAsQ0FBZSxHQUFmLEVBQW9CO0FBQ2xCLFFBQVEsS0FBSSxNQUFKLEVBRFU7QUFFbEIsWUFBUTtBQUZVLEdBQXBCOztBQUtBLE1BQUksSUFBSixHQUFXLFFBQVEsSUFBSSxFQUF2Qjs7QUFFQSxTQUFPLEdBQVA7QUFDRCxDQVhEOzs7QUNuREE7O0FBRUEsSUFBSSxPQUFNLFFBQVMsVUFBVCxDQUFWOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsUUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBYjtBQUFBLFFBQW9DLFlBQXBDOztBQUVBLFFBQUksT0FBTyxDQUFQLE1BQWMsT0FBTyxDQUFQLENBQWxCLEVBQThCLE9BQU8sT0FBTyxDQUFQLENBQVAsQ0FIMUIsQ0FHMkM7O0FBRS9DLHFCQUFlLEtBQUssSUFBcEIsZUFBa0MsT0FBTyxDQUFQLENBQWxDLGlCQUF1RCxPQUFPLENBQVAsQ0FBdkQsV0FBc0UsT0FBTyxDQUFQLENBQXRFOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUEyQixLQUFLLElBQWhDOztBQUVBLFdBQU8sQ0FBSyxLQUFLLElBQVYsV0FBc0IsR0FBdEIsQ0FBUDtBQUNEO0FBYlMsQ0FBWjs7QUFpQkEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsT0FBRixFQUFpQztBQUFBLE1BQXRCLEdBQXNCLHVFQUFoQixDQUFnQjtBQUFBLE1BQWIsR0FBYSx1RUFBUCxDQUFPOztBQUNoRCxNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYO0FBQ0EsU0FBTyxNQUFQLENBQWUsSUFBZixFQUFxQjtBQUNuQixTQUFTLEtBQUksTUFBSixFQURVO0FBRW5CLFlBQVMsQ0FBRSxPQUFGLEVBQVcsR0FBWCxFQUFnQixHQUFoQjtBQUZVLEdBQXJCOztBQUtBLE9BQUssSUFBTCxRQUFlLEtBQUssUUFBcEIsR0FBK0IsS0FBSyxHQUFwQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQVZEOzs7QUNyQkE7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxLQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiO0FBQUEsUUFFSSxvQkFGSjs7QUFJQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7QUFDQSxRQUFNLE1BQU0sWUFBVyxFQUFYLEdBQWdCLE1BQTVCOztBQUVBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQXJCLEVBQThCLFlBQVksVUFBWixHQUF5QixLQUFLLEdBQTVEOztBQUVBLHVCQUFlLEtBQUssSUFBcEIsV0FBOEIsR0FBOUIsK0JBQTJELE9BQU8sQ0FBUCxDQUEzRDs7QUFFQSxXQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsR0FBeEI7O0FBRUEsb0JBQWMsQ0FBRSxLQUFLLElBQVAsRUFBYSxHQUFiLENBQWQ7QUFDRCxLQVJELE1BUU87QUFDTCxZQUFNLEtBQUssR0FBTCxDQUFVLENBQUMsY0FBRCxHQUFrQixPQUFPLENBQVAsQ0FBNUIsQ0FBTjs7QUFFQSxvQkFBYyxHQUFkO0FBQ0Q7O0FBRUQsV0FBTyxXQUFQO0FBQ0Q7QUExQlMsQ0FBWjs7QUE2QkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYjtBQUNBLE1BQUksSUFBSixHQUFXLE1BQU0sUUFBTixHQUFpQixLQUFJLE1BQUosRUFBNUI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FQRDs7O0FDakNBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLEtBREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBSUEsUUFBTSxZQUFZLEtBQUksSUFBSixLQUFhLFNBQS9CO0FBQ0EsUUFBTSxNQUFNLFlBQVcsRUFBWCxHQUFnQixNQUE1Qjs7QUFFQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2QixXQUFJLFFBQUosQ0FBYSxHQUFiLENBQWlCLEVBQUUsT0FBTyxZQUFZLFVBQVosR0FBeUIsS0FBSyxHQUF2QyxFQUFqQjs7QUFFQSxZQUFTLEdBQVQsYUFBb0IsT0FBTyxDQUFQLENBQXBCO0FBRUQsS0FMRCxNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBckJTLENBQVo7O0FBd0JBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVY7O0FBRUEsTUFBSSxNQUFKLEdBQWEsQ0FBRSxDQUFGLENBQWI7QUFDQSxNQUFJLEVBQUosR0FBUyxLQUFJLE1BQUosRUFBVDtBQUNBLE1BQUksSUFBSixHQUFjLElBQUksUUFBbEI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FSRDs7O0FDNUJBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLE1BREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBSUEsUUFBTSxZQUFZLEtBQUksSUFBSixLQUFhLFNBQS9CO0FBQ0EsUUFBTSxNQUFNLFlBQVcsRUFBWCxHQUFnQixNQUE1Qjs7QUFFQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2QixXQUFJLFFBQUosQ0FBYSxHQUFiLENBQWlCLEVBQUUsUUFBUSxZQUFZLFVBQVosR0FBeUIsS0FBSyxJQUF4QyxFQUFqQjs7QUFFQSxZQUFTLEdBQVQsY0FBcUIsT0FBTyxDQUFQLENBQXJCO0FBRUQsS0FMRCxNQUtPO0FBQ0wsWUFBTSxLQUFLLElBQUwsQ0FBVyxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVgsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBckJTLENBQVo7O0FBd0JBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7O0FBRUEsT0FBSyxNQUFMLEdBQWMsQ0FBRSxDQUFGLENBQWQ7QUFDQSxPQUFLLEVBQUwsR0FBVSxLQUFJLE1BQUosRUFBVjtBQUNBLE9BQUssSUFBTCxHQUFlLEtBQUssUUFBcEI7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FSRDs7O0FDNUJBOztBQUVBLElBQUksTUFBVSxRQUFTLFVBQVQsQ0FBZDtBQUFBLElBQ0ksS0FBVSxRQUFTLFNBQVQsQ0FEZDtBQUFBLElBRUksUUFBVSxRQUFTLFlBQVQsQ0FGZDtBQUFBLElBR0ksTUFBVSxRQUFTLFVBQVQsQ0FIZDs7QUFLQSxPQUFPLE9BQVAsR0FBaUIsWUFBb0M7QUFBQSxNQUFsQyxTQUFrQyx1RUFBeEIsR0FBd0I7QUFBQSxNQUFuQixVQUFtQix1RUFBUixFQUFROztBQUNuRCxNQUFJLFFBQVEsR0FBSSxNQUFPLElBQUssU0FBTCxFQUFnQixLQUFoQixDQUFQLENBQUosRUFBc0MsVUFBdEMsQ0FBWjs7QUFFQSxRQUFNLElBQU4sYUFBcUIsSUFBSSxNQUFKLEVBQXJCOztBQUVBLFNBQU8sS0FBUDtBQUNELENBTkQ7OztBQ1BBOzs7O0FBRUEsSUFBTSxPQUFPLFFBQVMscUNBQVQsQ0FBYjtBQUFBLElBQ00sTUFBTyxRQUFTLFVBQVQsQ0FEYjtBQUFBLElBRU0sT0FBTyxRQUFTLFdBQVQsQ0FGYjs7QUFJQSxJQUFJLFdBQVcsS0FBZjs7QUFFQSxJQUFNLFlBQVk7QUFDaEIsT0FBSyxJQURXO0FBRWhCLFdBQVMsRUFGTztBQUdoQixZQUFTLEtBSE87O0FBS2hCLE9BTGdCLG1CQUtSO0FBQ04sUUFBSSxLQUFLLFdBQUwsS0FBcUIsU0FBekIsRUFBcUM7QUFDbkMsV0FBSyxXQUFMLENBQWlCLFVBQWpCO0FBQ0QsS0FGRCxNQUVLO0FBQ0gsV0FBSyxRQUFMLEdBQWdCO0FBQUEsZUFBTSxDQUFOO0FBQUEsT0FBaEI7QUFDRDtBQUNELFNBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsT0FBckIsQ0FBOEI7QUFBQSxhQUFLLEdBQUw7QUFBQSxLQUE5QjtBQUNBLFNBQUssS0FBTCxDQUFXLFNBQVgsQ0FBcUIsTUFBckIsR0FBOEIsQ0FBOUI7O0FBRUEsU0FBSyxRQUFMLEdBQWdCLEtBQWhCOztBQUVBLFFBQUksSUFBSSxLQUFKLEtBQWMsSUFBbEIsRUFBeUIsSUFBSSxJQUFKLENBQVUsSUFBSSxLQUFkO0FBQzFCLEdBakJlO0FBbUJoQixlQW5CZ0IsMkJBbUJtQjtBQUFBOztBQUFBLFFBQXBCLFVBQW9CLHVFQUFQLElBQU87O0FBQ2pDLFFBQU0sS0FBSyxPQUFPLFlBQVAsS0FBd0IsV0FBeEIsR0FBc0Msa0JBQXRDLEdBQTJELFlBQXRFOztBQUVBO0FBQ0EsU0FBTSxNQUFOLEVBQWMsVUFBZDs7QUFFQSxRQUFNLFFBQVEsU0FBUixLQUFRLEdBQU07QUFDbEIsVUFBSSxPQUFPLEVBQVAsS0FBYyxXQUFsQixFQUFnQztBQUM5QixjQUFLLEdBQUwsR0FBVyxJQUFJLEVBQUosQ0FBTyxFQUFFLGFBQVksS0FBZCxFQUFQLENBQVg7O0FBRUEsWUFBSSxVQUFKLEdBQWlCLE1BQUssR0FBTCxDQUFTLFVBQTFCOztBQUVBLFlBQUksWUFBWSxTQUFTLGVBQXJCLElBQXdDLGtCQUFrQixTQUFTLGVBQXZFLEVBQXlGO0FBQ3ZGLGlCQUFPLG1CQUFQLENBQTRCLFlBQTVCLEVBQTBDLEtBQTFDO0FBQ0QsU0FGRCxNQUVLO0FBQ0gsaUJBQU8sbUJBQVAsQ0FBNEIsV0FBNUIsRUFBeUMsS0FBekM7QUFDQSxpQkFBTyxtQkFBUCxDQUE0QixTQUE1QixFQUF1QyxLQUF2QztBQUNEOztBQUVELFlBQU0sV0FBVyxVQUFVLEdBQVYsQ0FBYyxrQkFBZCxFQUFqQjtBQUNBLGlCQUFTLE9BQVQsQ0FBa0IsVUFBVSxHQUFWLENBQWMsV0FBaEM7QUFDQSxpQkFBUyxLQUFUO0FBQ0Q7QUFDRixLQWpCRDs7QUFtQkEsUUFBSSxZQUFZLFNBQVMsZUFBckIsSUFBd0Msa0JBQWtCLFNBQVMsZUFBdkUsRUFBeUY7QUFDdkYsYUFBTyxnQkFBUCxDQUF5QixZQUF6QixFQUF1QyxLQUF2QztBQUNELEtBRkQsTUFFSztBQUNILGFBQU8sZ0JBQVAsQ0FBeUIsV0FBekIsRUFBc0MsS0FBdEM7QUFDQSxhQUFPLGdCQUFQLENBQXlCLFNBQXpCLEVBQW9DLEtBQXBDO0FBQ0Q7O0FBRUQsV0FBTyxJQUFQO0FBQ0QsR0FwRGU7QUFzRGhCLHVCQXREZ0IsbUNBc0RRO0FBQ3RCLFNBQUssSUFBTCxHQUFZLEtBQUssR0FBTCxDQUFTLHFCQUFULENBQWdDLElBQWhDLEVBQXNDLENBQXRDLEVBQXlDLENBQXpDLENBQVo7QUFDQSxTQUFLLGFBQUwsR0FBcUIsWUFBVztBQUFFLGFBQU8sQ0FBUDtBQUFVLEtBQTVDO0FBQ0EsUUFBSSxPQUFPLEtBQUssUUFBWixLQUF5QixXQUE3QixFQUEyQyxLQUFLLFFBQUwsR0FBZ0IsS0FBSyxhQUFyQjs7QUFFM0MsU0FBSyxJQUFMLENBQVUsY0FBVixHQUEyQixVQUFVLG9CQUFWLEVBQWlDO0FBQzFELFVBQUksZUFBZSxxQkFBcUIsWUFBeEM7O0FBRUEsVUFBSSxPQUFPLGFBQWEsY0FBYixDQUE2QixDQUE3QixDQUFYO0FBQUEsVUFDSSxRQUFPLGFBQWEsY0FBYixDQUE2QixDQUE3QixDQURYO0FBQUEsVUFFSSxXQUFXLFVBQVUsUUFGekI7O0FBSUQsV0FBSyxJQUFJLFNBQVMsQ0FBbEIsRUFBcUIsU0FBUyxLQUFLLE1BQW5DLEVBQTJDLFFBQTNDLEVBQXNEO0FBQ25ELFlBQUksTUFBTSxVQUFVLFFBQVYsRUFBVjs7QUFFQSxZQUFJLGFBQWEsS0FBakIsRUFBeUI7QUFDdkIsZUFBTSxNQUFOLElBQWlCLE1BQU8sTUFBUCxJQUFrQixHQUFuQztBQUNELFNBRkQsTUFFSztBQUNILGVBQU0sTUFBTixJQUFrQixJQUFJLENBQUosQ0FBbEI7QUFDQSxnQkFBTyxNQUFQLElBQWtCLElBQUksQ0FBSixDQUFsQjtBQUNEO0FBQ0Y7QUFDRixLQWpCRDs7QUFtQkEsU0FBSyxJQUFMLENBQVUsT0FBVixDQUFtQixLQUFLLEdBQUwsQ0FBUyxXQUE1Qjs7QUFFQSxXQUFPLElBQVA7QUFDRCxHQWpGZTs7O0FBbUZoQjtBQUNBLHFCQXBGZ0IsK0JBb0ZLLEVBcEZMLEVBb0ZVO0FBQ3hCO0FBQ0E7QUFDQSxRQUFNLFVBQVUsR0FBRyxRQUFILEdBQWMsS0FBZCxDQUFvQixJQUFwQixDQUFoQjtBQUNBLFFBQU0sU0FBUyxRQUFRLEtBQVIsQ0FBZSxDQUFmLEVBQWtCLENBQUMsQ0FBbkIsQ0FBZjtBQUNBLFFBQU0sV0FBVyxPQUFPLEdBQVAsQ0FBWTtBQUFBLGFBQUssV0FBVyxDQUFoQjtBQUFBLEtBQVosQ0FBakI7O0FBRUEsV0FBTyxTQUFTLElBQVQsQ0FBYyxJQUFkLENBQVA7QUFDRCxHQTVGZTtBQThGaEIsNEJBOUZnQixzQ0E4RlksRUE5RlosRUE4RmlCO0FBQy9CO0FBQ0EsUUFBSSxXQUFXLEVBQWY7O0FBRUE7QUFDQTtBQUNBO0FBTitCO0FBQUE7QUFBQTs7QUFBQTtBQU8vQiwyQkFBaUIsR0FBRyxNQUFILENBQVUsTUFBVixFQUFqQiw4SEFBc0M7QUFBQSxZQUE3QixJQUE2Qjs7QUFDcEMsa0NBQXVCLEtBQUssSUFBNUIsb0RBQTRFLEtBQUssWUFBakYsbUJBQTJHLEtBQUssR0FBaEgsbUJBQWlJLEtBQUssR0FBdEk7QUFDRDtBQVQ4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVUvQixXQUFPLFFBQVA7QUFDRCxHQXpHZTtBQTJHaEIsNkJBM0dnQix1Q0EyR2EsRUEzR2IsRUEyR2tCO0FBQ2hDLFFBQUksTUFBTSxHQUFHLE1BQUgsQ0FBVSxJQUFWLEdBQWlCLENBQWpCLEdBQXFCLFVBQXJCLEdBQWtDLEVBQTVDO0FBRGdDO0FBQUE7QUFBQTs7QUFBQTtBQUVoQyw0QkFBaUIsR0FBRyxNQUFILENBQVUsTUFBVixFQUFqQixtSUFBc0M7QUFBQSxZQUE3QixJQUE2Qjs7QUFDcEMsMEJBQWdCLEtBQUssSUFBckIsc0JBQTBDLEtBQUssSUFBL0M7QUFDRDtBQUorQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU1oQyxXQUFPLEdBQVA7QUFDRCxHQWxIZTtBQW9IaEIsMEJBcEhnQixvQ0FvSFUsRUFwSFYsRUFvSGU7QUFDN0IsUUFBSyxZQUFZLEVBQWpCO0FBRDZCO0FBQUE7QUFBQTs7QUFBQTtBQUU3Qiw0QkFBaUIsR0FBRyxNQUFILENBQVUsTUFBVixFQUFqQixtSUFBc0M7QUFBQSxZQUE3QixJQUE2Qjs7QUFDcEMscUJBQWEsS0FBSyxJQUFMLEdBQVksTUFBekI7QUFDRDtBQUo0QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUs3QixnQkFBWSxVQUFVLEtBQVYsQ0FBaUIsQ0FBakIsRUFBb0IsQ0FBQyxDQUFyQixDQUFaOztBQUVBLFdBQU8sU0FBUDtBQUNELEdBNUhlO0FBOEhoQix5QkE5SGdCLG1DQThIUyxFQTlIVCxFQThIYztBQUM1QixRQUFJLE1BQU0sR0FBRyxNQUFILENBQVUsSUFBVixHQUFpQixDQUFqQixHQUFxQixJQUFyQixHQUE0QixFQUF0QztBQUQ0QjtBQUFBO0FBQUE7O0FBQUE7QUFFNUIsNEJBQW1CLEdBQUcsTUFBSCxDQUFVLE1BQVYsRUFBbkIsbUlBQXdDO0FBQUEsWUFBL0IsS0FBK0I7O0FBQ3RDLDBCQUFnQixNQUFNLElBQXRCLG1CQUF3QyxNQUFNLFdBQTlDLFlBQWdFLE1BQU0sYUFBdEU7QUFDRDtBQUoyQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQU01QixXQUFPLEdBQVA7QUFDRCxHQXJJZTtBQXdJaEIsc0JBeElnQixnQ0F3SU0sRUF4SU4sRUF3SVc7QUFDekIsUUFBSyxZQUFZLEVBQWpCO0FBRHlCO0FBQUE7QUFBQTs7QUFBQTtBQUV6Qiw0QkFBa0IsR0FBRyxNQUFILENBQVUsTUFBVixFQUFsQixtSUFBdUM7QUFBQSxZQUE5QixLQUE4Qjs7QUFDckMscUJBQWEsTUFBTSxJQUFOLEdBQWEsTUFBMUI7QUFDRDtBQUp3QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQUt6QixnQkFBWSxVQUFVLEtBQVYsQ0FBaUIsQ0FBakIsRUFBb0IsQ0FBQyxDQUFyQixDQUFaOztBQUVBLFdBQU8sU0FBUDtBQUNELEdBaEplO0FBa0poQiw0QkFsSmdCLHNDQWtKWSxFQWxKWixFQWtKaUI7QUFDL0IsUUFBSSxlQUFlLEdBQUcsT0FBSCxDQUFXLElBQVgsR0FBa0IsQ0FBbEIsR0FBc0IsSUFBdEIsR0FBNkIsRUFBaEQ7QUFDQSxRQUFJLE9BQU8sRUFBWDtBQUYrQjtBQUFBO0FBQUE7O0FBQUE7QUFHL0IsNEJBQWlCLEdBQUcsT0FBSCxDQUFXLE1BQVgsRUFBakIsbUlBQXVDO0FBQUEsWUFBOUIsSUFBOEI7O0FBQ3JDLFlBQU0sT0FBTyxPQUFPLElBQVAsQ0FBYSxJQUFiLEVBQW9CLENBQXBCLENBQWI7QUFBQSxZQUNNLFFBQVEsS0FBTSxJQUFOLENBRGQ7O0FBR0EsWUFBSSxLQUFNLElBQU4sTUFBaUIsU0FBckIsRUFBaUM7QUFDakMsYUFBTSxJQUFOLElBQWUsSUFBZjs7QUFFQSx5Q0FBK0IsSUFBL0IsV0FBeUMsS0FBekM7QUFDRDtBQVg4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWEvQixXQUFPLFlBQVA7QUFDRCxHQWhLZTtBQWtLaEIsd0JBbEtnQixrQ0FrS1EsS0FsS1IsRUFrS2UsSUFsS2YsRUFrS3FCLEtBbEtyQixFQWtLdUU7QUFBQSxRQUEzQyxHQUEyQyx1RUFBdkMsUUFBTSxFQUFpQzs7QUFBQSxRQUE3QixNQUE2Qix1RUFBdEIsS0FBc0I7O0FBQUEsUUFBZixNQUFlLHVFQUFSLEtBQVE7O0FBQ3JGO0FBQ0EsUUFBTSxLQUFLLElBQUksY0FBSixDQUFvQixLQUFwQixFQUEyQixHQUEzQixFQUFnQyxLQUFoQyxDQUFYO0FBQ0EsUUFBTSxTQUFTLEdBQUcsTUFBbEI7O0FBRUE7QUFDQSxRQUFNLHVCQUF1QixLQUFLLDBCQUFMLENBQWlDLEVBQWpDLENBQTdCO0FBQ0EsUUFBTSx3QkFBd0IsS0FBSywyQkFBTCxDQUFrQyxFQUFsQyxDQUE5QjtBQUNBLFFBQU0sWUFBWSxLQUFLLHdCQUFMLENBQStCLEVBQS9CLENBQWxCO0FBQ0EsUUFBTSxvQkFBb0IsS0FBSyx1QkFBTCxDQUE4QixFQUE5QixDQUExQjtBQUNBLFFBQU0sWUFBWSxLQUFLLG9CQUFMLENBQTJCLEVBQTNCLENBQWxCO0FBQ0EsUUFBTSxlQUFlLEtBQUssMEJBQUwsQ0FBaUMsRUFBakMsQ0FBckI7O0FBRUE7QUFDQSxRQUFNLG1CQUFtQixHQUFHLFFBQUgsS0FBZ0IsS0FBaEIsbUZBQXpCOztBQUlBLFFBQU0saUJBQWlCLEtBQUssbUJBQUwsQ0FBMEIsRUFBMUIsQ0FBdkI7O0FBRUE7QUFDQSxRQUFNLGFBQWEsbUdBS2YsRUFMSjs7QUFPQSxRQUFNLGlFQUNGLGNBREUsWUFBTjtBQUdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFlBQVEsR0FBUixDQUFhLFFBQWIsRUFBdUIsTUFBdkI7QUFDQSxRQUFNLDJCQUNGLElBREUsd0hBS0Qsb0JBTEMsa01BY0gsU0FBUyxlQUFULEdBQTJCLEVBZHhCLG1hQXlCRixVQXpCRSw0UUFrQ3lCLHFCQWxDekIsR0FrQ2lELGlCQWxDakQsR0FrQ3FFLFlBbENyRSxpQkFtQ0YsV0FBVyxJQUFYLEdBQWtCLDRCQUFsQixHQUFpRCxFQW5DL0MsOERBc0NBLFdBQVcsSUFBWCxHQUFrQixvQkFBbEIsR0FBeUMsY0F0Q3pDLG1CQXVDQSxnQkF2Q0EsOEVBOENZLElBOUNaLFlBOENzQixJQTlDdEIsZUFBTjs7QUFpREE7O0FBR0EsUUFBSSxVQUFVLElBQWQsRUFBcUIsUUFBUSxHQUFSLENBQWEsV0FBYjs7QUFFckIsUUFBTSxNQUFNLE9BQU8sR0FBUCxDQUFXLGVBQVgsQ0FDVixJQUFJLElBQUosQ0FDRSxDQUFFLFdBQUYsQ0FERixFQUVFLEVBQUUsTUFBTSxpQkFBUixFQUZGLENBRFUsQ0FBWjs7QUFPQSxXQUFPLENBQUUsR0FBRixFQUFPLFdBQVAsRUFBb0IsTUFBcEIsRUFBNEIsR0FBRyxNQUEvQixFQUF1QyxHQUFHLFFBQTFDLENBQVA7QUFDRCxHQXJRZTs7O0FBdVFoQiwrQkFBNkIsRUF2UWI7QUF3UWhCLFVBeFFnQixvQkF3UU4sSUF4UU0sRUF3UUM7QUFDZixRQUFJLEtBQUssMkJBQUwsQ0FBaUMsT0FBakMsQ0FBMEMsSUFBMUMsTUFBcUQsQ0FBQyxDQUExRCxFQUE4RDtBQUM1RCxXQUFLLDJCQUFMLENBQWlDLElBQWpDLENBQXVDLElBQXZDO0FBQ0Q7QUFDRixHQTVRZTtBQThRaEIsYUE5UWdCLHVCQThRSCxLQTlRRyxFQThRSSxJQTlRSixFQThRb0U7QUFBQSxRQUExRCxLQUEwRCx1RUFBcEQsS0FBb0Q7QUFBQSxRQUE3QyxHQUE2Qyx1RUFBekMsUUFBUSxFQUFpQzs7QUFBQSxRQUE3QixNQUE2Qix1RUFBdEIsS0FBc0I7O0FBQUEsUUFBZixNQUFlLHVFQUFSLEtBQVE7O0FBQ2xGLGNBQVUsS0FBVjs7QUFEa0YsZ0NBRzVCLFVBQVUsc0JBQVYsQ0FBa0MsS0FBbEMsRUFBeUMsSUFBekMsRUFBK0MsS0FBL0MsRUFBc0QsR0FBdEQsRUFBMkQsTUFBM0QsRUFBbUUsTUFBbkUsQ0FINEI7QUFBQTtBQUFBLFFBRzFFLEdBSDBFO0FBQUEsUUFHckUsVUFIcUU7QUFBQSxRQUd6RCxNQUh5RDtBQUFBLFFBR2pELE1BSGlEO0FBQUEsUUFHekMsUUFIeUM7O0FBS2xGLFFBQU0sY0FBYyxJQUFJLE9BQUosQ0FBYSxVQUFDLE9BQUQsRUFBUyxNQUFULEVBQW9COztBQUVuRCxnQkFBVSxHQUFWLENBQWMsWUFBZCxDQUEyQixTQUEzQixDQUFzQyxHQUF0QyxFQUE0QyxJQUE1QyxDQUFrRCxZQUFLO0FBQ3JELFlBQU0sY0FBYyxJQUFJLGdCQUFKLENBQXNCLFVBQVUsR0FBaEMsRUFBcUMsSUFBckMsRUFBMkMsRUFBRSxvQkFBbUIsQ0FBRSxXQUFXLENBQVgsR0FBZSxDQUFqQixDQUFyQixFQUEzQyxDQUFwQjs7QUFFQSxvQkFBWSxTQUFaLEdBQXdCLEVBQXhCO0FBQ0Esb0JBQVksU0FBWixHQUF3QixVQUFVLEtBQVYsRUFBa0I7QUFDeEMsY0FBSSxNQUFNLElBQU4sQ0FBVyxPQUFYLEtBQXVCLFFBQTNCLEVBQXNDO0FBQ3BDLHdCQUFZLFNBQVosQ0FBdUIsTUFBTSxJQUFOLENBQVcsR0FBbEMsRUFBeUMsTUFBTSxJQUFOLENBQVcsS0FBcEQ7QUFDQSxtQkFBTyxZQUFZLFNBQVosQ0FBdUIsTUFBTSxJQUFOLENBQVcsR0FBbEMsQ0FBUDtBQUNEO0FBQ0YsU0FMRDs7QUFPQSxvQkFBWSxjQUFaLEdBQTZCLFVBQVUsR0FBVixFQUFlLEVBQWYsRUFBb0I7QUFDL0MsZUFBSyxnQkFBTCxDQUF1QixHQUF2QixJQUErQixFQUEvQjtBQUNBLGVBQUssV0FBTCxDQUFpQixJQUFqQixDQUFzQixXQUF0QixDQUFrQyxFQUFFLEtBQUksS0FBTixFQUFhLEtBQUssR0FBbEIsRUFBbEM7QUFDRCxTQUhEOztBQUtBLG9CQUFZLElBQVosQ0FBaUIsV0FBakIsQ0FBNkIsRUFBRSxLQUFJLE1BQU4sRUFBYyxRQUFPLElBQUksTUFBSixDQUFXLElBQWhDLEVBQTdCO0FBQ0Esa0JBQVUsV0FBVixHQUF3QixXQUF4Qjs7QUFFQSxrQkFBVSwyQkFBVixDQUFzQyxPQUF0QyxDQUErQztBQUFBLGlCQUFRLEtBQUssSUFBTCxHQUFZLFdBQXBCO0FBQUEsU0FBL0M7QUFDQSxrQkFBVSwyQkFBVixDQUFzQyxNQUF0QyxHQUErQyxDQUEvQzs7QUFFQTtBQXRCcUQ7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxnQkF1QjVDLElBdkI0Qzs7QUF3Qm5ELGdCQUFNLE9BQU8sT0FBTyxJQUFQLENBQWEsSUFBYixFQUFvQixDQUFwQixDQUFiO0FBQ0EsZ0JBQU0sUUFBUSxZQUFZLFVBQVosQ0FBdUIsR0FBdkIsQ0FBNEIsSUFBNUIsQ0FBZDs7QUFFQSxtQkFBTyxjQUFQLENBQXVCLFdBQXZCLEVBQW9DLElBQXBDLEVBQTBDO0FBQ3hDLGlCQUR3QyxlQUNuQyxDQURtQyxFQUMvQjtBQUNQLHNCQUFNLEtBQU4sR0FBYyxDQUFkO0FBQ0QsZUFIdUM7QUFJeEMsaUJBSndDLGlCQUlsQztBQUNKLHVCQUFPLE1BQU0sS0FBYjtBQUNEO0FBTnVDLGFBQTFDO0FBM0JtRDs7QUF1QnJELGdDQUFpQixPQUFPLE1BQVAsRUFBakIsbUlBQW1DO0FBQUE7QUFZbEM7QUFuQ29EO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxnQkFxQzVDLElBckM0Qzs7QUFzQ25ELGdCQUFNLE9BQU8sS0FBSyxJQUFsQjtBQUNBLGdCQUFNLFFBQVEsWUFBWSxVQUFaLENBQXVCLEdBQXZCLENBQTRCLElBQTVCLENBQWQ7QUFDQSxpQkFBSyxLQUFMLEdBQWEsS0FBYjtBQUNBO0FBQ0Esa0JBQU0sS0FBTixHQUFjLEtBQUssWUFBbkI7O0FBRUEsbUJBQU8sY0FBUCxDQUF1QixXQUF2QixFQUFvQyxJQUFwQyxFQUEwQztBQUN4QyxpQkFEd0MsZUFDbkMsQ0FEbUMsRUFDL0I7QUFDUCxzQkFBTSxLQUFOLEdBQWMsQ0FBZDtBQUNELGVBSHVDO0FBSXhDLGlCQUp3QyxpQkFJbEM7QUFDSix1QkFBTyxNQUFNLEtBQWI7QUFDRDtBQU51QyxhQUExQztBQTVDbUQ7O0FBcUNyRCxnQ0FBaUIsT0FBTyxNQUFQLEVBQWpCLG1JQUFtQztBQUFBO0FBZWxDO0FBcERvRDtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQXNEckQsWUFBSSxVQUFVLE9BQWQsRUFBd0IsVUFBVSxPQUFWLENBQWtCLFFBQWxCLENBQTRCLFVBQTVCOztBQUV4QixvQkFBWSxPQUFaLENBQXFCLFVBQVUsR0FBVixDQUFjLFdBQW5DOztBQUVBLGdCQUFTLFdBQVQ7QUFDRCxPQTNERDtBQTZERCxLQS9EbUIsQ0FBcEI7O0FBaUVBLFdBQU8sV0FBUDtBQUNELEdBclZlO0FBdVZoQixXQXZWZ0IscUJBdVZMLEtBdlZLLEVBdVZFLEtBdlZGLEVBdVY4QztBQUFBLFFBQXJDLEdBQXFDLHVFQUFqQyxRQUFNLEVBQTJCO0FBQUEsUUFBdkIsT0FBdUIsdUVBQWYsWUFBZTs7QUFDNUQsY0FBVSxLQUFWO0FBQ0EsUUFBSSxVQUFVLFNBQWQsRUFBMEIsUUFBUSxLQUFSOztBQUUxQixTQUFLLFFBQUwsR0FBZ0IsTUFBTSxPQUFOLENBQWUsS0FBZixDQUFoQjs7QUFFQSxjQUFVLFFBQVYsR0FBcUIsSUFBSSxjQUFKLENBQW9CLEtBQXBCLEVBQTJCLEdBQTNCLEVBQWdDLEtBQWhDLEVBQXVDLEtBQXZDLEVBQThDLE9BQTlDLENBQXJCOztBQUVBLFFBQUksVUFBVSxPQUFkLEVBQXdCLFVBQVUsT0FBVixDQUFrQixRQUFsQixDQUE0QixVQUFVLFFBQVYsQ0FBbUIsUUFBbkIsRUFBNUI7O0FBRXhCLFdBQU8sVUFBVSxRQUFqQjtBQUNELEdBbFdlO0FBb1doQixZQXBXZ0Isc0JBb1dKLGFBcFdJLEVBb1dXLElBcFdYLEVBb1drQjtBQUNoQyxRQUFNLFdBQVcsVUFBVSxPQUFWLENBQW1CLGFBQW5CLE1BQXVDLFNBQXhEOztBQUVBLFFBQUksTUFBTSxJQUFJLGNBQUosRUFBVjtBQUNBLFFBQUksSUFBSixDQUFVLEtBQVYsRUFBaUIsYUFBakIsRUFBZ0MsSUFBaEM7QUFDQSxRQUFJLFlBQUosR0FBbUIsYUFBbkI7O0FBRUEsUUFBSSxVQUFVLElBQUksT0FBSixDQUFhLFVBQUMsT0FBRCxFQUFTLE1BQVQsRUFBb0I7QUFDN0MsVUFBSSxDQUFDLFFBQUwsRUFBZ0I7QUFDZCxZQUFJLE1BQUosR0FBYSxZQUFXO0FBQ3RCLGNBQUksWUFBWSxJQUFJLFFBQXBCOztBQUVBLG9CQUFVLEdBQVYsQ0FBYyxlQUFkLENBQStCLFNBQS9CLEVBQTBDLFVBQUMsTUFBRCxFQUFZO0FBQ3BELGlCQUFLLE1BQUwsR0FBYyxPQUFPLGNBQVAsQ0FBc0IsQ0FBdEIsQ0FBZDtBQUNBLHNCQUFVLE9BQVYsQ0FBbUIsYUFBbkIsSUFBcUMsS0FBSyxNQUExQztBQUNBLG9CQUFTLEtBQUssTUFBZDtBQUNELFdBSkQ7QUFLRCxTQVJEO0FBU0QsT0FWRCxNQVVLO0FBQ0gsbUJBQVk7QUFBQSxpQkFBSyxRQUFTLFVBQVUsT0FBVixDQUFtQixhQUFuQixDQUFULENBQUw7QUFBQSxTQUFaLEVBQWdFLENBQWhFO0FBQ0Q7QUFDRixLQWRhLENBQWQ7O0FBZ0JBLFFBQUksQ0FBQyxRQUFMLEVBQWdCLElBQUksSUFBSjs7QUFFaEIsV0FBTyxPQUFQO0FBQ0Q7QUE5WGUsQ0FBbEI7O0FBa1lBLFVBQVUsS0FBVixDQUFnQixTQUFoQixHQUE0QixFQUE1Qjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsU0FBakI7OztBQzVZQTs7QUFFQTs7Ozs7O0FBTUEsSUFBTSxVQUFVLE9BQU8sT0FBUCxHQUFpQjtBQUMvQixVQUQrQixvQkFDckIsTUFEcUIsRUFDYixLQURhLEVBQ0w7QUFDeEIsV0FBTyxLQUFLLFNBQVMsQ0FBZCxLQUFvQixDQUFDLFNBQVMsQ0FBVixJQUFlLENBQWYsR0FBbUIsS0FBSyxHQUFMLENBQVMsUUFBUSxDQUFDLFNBQVMsQ0FBVixJQUFlLENBQWhDLENBQXZDLENBQVA7QUFDRCxHQUg4QjtBQUsvQixjQUwrQix3QkFLakIsTUFMaUIsRUFLVCxLQUxTLEVBS0Q7QUFDNUIsV0FBTyxPQUFPLE9BQU8sS0FBSyxHQUFMLENBQVMsU0FBUyxTQUFTLENBQWxCLElBQXVCLEdBQWhDLENBQWQsR0FBcUQsT0FBTyxLQUFLLEdBQUwsQ0FBVSxJQUFJLEtBQUssRUFBVCxHQUFjLEtBQWQsSUFBdUIsU0FBUyxDQUFoQyxDQUFWLENBQW5FO0FBQ0QsR0FQOEI7QUFTL0IsVUFUK0Isb0JBU3JCLE1BVHFCLEVBU2IsS0FUYSxFQVNOLEtBVE0sRUFTRTtBQUMvQixRQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUwsSUFBYyxDQUF2QjtBQUFBLFFBQ0ksS0FBSyxHQURUO0FBQUEsUUFFSSxLQUFLLFFBQVEsQ0FGakI7O0FBSUEsV0FBTyxLQUFLLEtBQUssS0FBSyxHQUFMLENBQVMsSUFBSSxLQUFLLEVBQVQsR0FBYyxLQUFkLElBQXVCLFNBQVMsQ0FBaEMsQ0FBVCxDQUFWLEdBQXlELEtBQUssS0FBSyxHQUFMLENBQVMsSUFBSSxLQUFLLEVBQVQsR0FBYyxLQUFkLElBQXVCLFNBQVMsQ0FBaEMsQ0FBVCxDQUFyRTtBQUNELEdBZjhCO0FBaUIvQixRQWpCK0Isa0JBaUJ2QixNQWpCdUIsRUFpQmYsS0FqQmUsRUFpQlA7QUFDdEIsV0FBTyxLQUFLLEdBQUwsQ0FBUyxLQUFLLEVBQUwsR0FBVSxLQUFWLElBQW1CLFNBQVMsQ0FBNUIsSUFBaUMsS0FBSyxFQUFMLEdBQVUsQ0FBcEQsQ0FBUDtBQUNELEdBbkI4QjtBQXFCL0IsT0FyQitCLGlCQXFCeEIsTUFyQndCLEVBcUJoQixLQXJCZ0IsRUFxQlQsS0FyQlMsRUFxQkQ7QUFDNUIsV0FBTyxLQUFLLEdBQUwsQ0FBUyxLQUFLLENBQWQsRUFBaUIsQ0FBQyxHQUFELEdBQU8sS0FBSyxHQUFMLENBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFWLElBQWUsQ0FBeEIsS0FBOEIsU0FBUyxTQUFTLENBQWxCLElBQXVCLENBQXJELENBQVQsRUFBa0UsQ0FBbEUsQ0FBeEIsQ0FBUDtBQUNELEdBdkI4QjtBQXlCL0IsU0F6QitCLG1CQXlCdEIsTUF6QnNCLEVBeUJkLEtBekJjLEVBeUJOO0FBQ3ZCLFdBQU8sT0FBTyxPQUFPLEtBQUssR0FBTCxDQUFVLEtBQUssRUFBTCxHQUFVLENBQVYsR0FBYyxLQUFkLElBQXVCLFNBQVMsQ0FBaEMsQ0FBVixDQUFyQjtBQUNELEdBM0I4QjtBQTZCL0IsTUE3QitCLGdCQTZCekIsTUE3QnlCLEVBNkJqQixLQTdCaUIsRUE2QlQ7QUFDcEIsV0FBTyxPQUFPLElBQUksS0FBSyxHQUFMLENBQVUsS0FBSyxFQUFMLEdBQVUsQ0FBVixHQUFjLEtBQWQsSUFBdUIsU0FBUyxDQUFoQyxDQUFWLENBQVgsQ0FBUDtBQUNELEdBL0I4QjtBQWlDL0IsU0FqQytCLG1CQWlDdEIsTUFqQ3NCLEVBaUNkLEtBakNjLEVBaUNOO0FBQ3ZCLFFBQUksSUFBSSxJQUFJLEtBQUosSUFBYSxTQUFTLENBQXRCLElBQTJCLENBQW5DO0FBQ0EsV0FBTyxLQUFLLEdBQUwsQ0FBUyxLQUFLLEVBQUwsR0FBVSxDQUFuQixLQUF5QixLQUFLLEVBQUwsR0FBVSxDQUFuQyxDQUFQO0FBQ0QsR0FwQzhCO0FBc0MvQixhQXRDK0IsdUJBc0NsQixNQXRDa0IsRUFzQ1YsS0F0Q1UsRUFzQ0Y7QUFDM0IsV0FBTyxDQUFQO0FBQ0QsR0F4QzhCO0FBMEMvQixZQTFDK0Isc0JBMENuQixNQTFDbUIsRUEwQ1gsS0ExQ1csRUEwQ0g7QUFDMUIsV0FBTyxJQUFJLE1BQUosSUFBYyxTQUFTLENBQVQsR0FBYSxLQUFLLEdBQUwsQ0FBUyxRQUFRLENBQUMsU0FBUyxDQUFWLElBQWUsQ0FBaEMsQ0FBM0IsQ0FBUDtBQUNELEdBNUM4Qjs7O0FBOEMvQjtBQUNBLE9BL0MrQixpQkErQ3hCLE1BL0N3QixFQStDaEIsTUEvQ2dCLEVBK0NSLE1BL0NRLEVBK0NVO0FBQUEsUUFBVixLQUFVLHVFQUFKLENBQUk7O0FBQ3ZDO0FBQ0EsUUFBTSxRQUFRLFVBQVUsQ0FBVixHQUFjLE1BQWQsR0FBdUIsQ0FBQyxTQUFTLEtBQUssS0FBTCxDQUFZLFFBQVEsTUFBcEIsQ0FBVixJQUEwQyxNQUEvRTtBQUNBLFFBQU0sWUFBWSxDQUFDLFNBQVMsQ0FBVixJQUFlLENBQWpDOztBQUVBLFdBQU8sSUFBSSxLQUFLLEdBQUwsQ0FBVSxDQUFFLFFBQVEsU0FBVixJQUF3QixTQUFsQyxFQUE2QyxDQUE3QyxDQUFYO0FBQ0QsR0FyRDhCO0FBc0QvQixjQXREK0Isd0JBc0RqQixNQXREaUIsRUFzRFQsTUF0RFMsRUFzREQsTUF0REMsRUFzRGlCO0FBQUEsUUFBVixLQUFVLHVFQUFKLENBQUk7O0FBQzlDO0FBQ0EsUUFBSSxRQUFRLFVBQVUsQ0FBVixHQUFjLE1BQWQsR0FBdUIsQ0FBQyxTQUFTLEtBQUssS0FBTCxDQUFZLFFBQVEsTUFBcEIsQ0FBVixJQUEwQyxNQUE3RTtBQUNBLFFBQU0sWUFBWSxDQUFDLFNBQVMsQ0FBVixJQUFlLENBQWpDOztBQUVBLFdBQU8sS0FBSyxHQUFMLENBQVUsQ0FBRSxRQUFRLFNBQVYsSUFBd0IsU0FBbEMsRUFBNkMsQ0FBN0MsQ0FBUDtBQUNELEdBNUQ4QjtBQThEL0IsVUE5RCtCLG9CQThEckIsTUE5RHFCLEVBOERiLEtBOURhLEVBOERMO0FBQ3hCLFFBQUksU0FBUyxTQUFTLENBQXRCLEVBQTBCO0FBQ3hCLGFBQU8sUUFBUSxZQUFSLENBQXNCLFNBQVMsQ0FBL0IsRUFBa0MsS0FBbEMsSUFBNEMsQ0FBbkQ7QUFDRCxLQUZELE1BRUs7QUFDSCxhQUFPLElBQUksUUFBUSxZQUFSLENBQXNCLFNBQVMsQ0FBL0IsRUFBa0MsUUFBUSxTQUFTLENBQW5ELENBQVg7QUFDRDtBQUNGLEdBcEU4QjtBQXNFL0IsYUF0RStCLHVCQXNFbEIsTUF0RWtCLEVBc0VWLEtBdEVVLEVBc0VILEtBdEVHLEVBc0VLO0FBQ2xDLFdBQU8sS0FBSyxHQUFMLENBQVUsUUFBUSxNQUFsQixFQUEwQixLQUExQixDQUFQO0FBQ0QsR0F4RThCO0FBMEUvQixRQTFFK0Isa0JBMEV2QixNQTFFdUIsRUEwRWYsS0ExRWUsRUEwRVA7QUFDdEIsV0FBTyxRQUFRLE1BQWY7QUFDRDtBQTVFOEIsQ0FBakM7OztBQ1JBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDtBQUFBLElBQ0ksUUFBTyxRQUFRLFlBQVIsQ0FEWDtBQUFBLElBRUksTUFBTyxRQUFRLFVBQVIsQ0FGWDtBQUFBLElBR0ksT0FBTyxRQUFRLFdBQVIsQ0FIWDs7QUFLQSxJQUFJLFFBQVE7QUFDVixZQUFTLE1BREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksYUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7QUFBQSxRQUVJLFNBQVMsT0FBTyxDQUFQLENBRmI7QUFBQSxRQUV3QixNQUFNLE9BQU8sQ0FBUCxDQUY5QjtBQUFBLFFBRXlDLE1BQU0sT0FBTyxDQUFQLENBRi9DO0FBQUEsUUFHSSxZQUhKO0FBQUEsUUFHUyxhQUhUOztBQUtBO0FBQ0E7QUFDQTs7QUFFQSxRQUFJLEtBQUssR0FBTCxLQUFhLENBQWpCLEVBQXFCO0FBQ25CLGFBQU8sR0FBUDtBQUNELEtBRkQsTUFFTSxJQUFLLE1BQU8sR0FBUCxLQUFnQixNQUFPLEdBQVAsQ0FBckIsRUFBb0M7QUFDeEMsYUFBVSxHQUFWLFdBQW1CLEdBQW5CO0FBQ0QsS0FGSyxNQUVEO0FBQ0gsYUFBTyxNQUFNLEdBQWI7QUFDRDs7QUFFRCxvQkFDSSxLQUFLLElBRFQsV0FDbUIsT0FBTyxDQUFQLENBRG5CLGdCQUVJLEtBQUssSUFGVCxXQUVtQixLQUFLLEdBRnhCLFdBRWlDLEtBQUssSUFGdEMsWUFFaUQsSUFGakQscUJBR1MsS0FBSyxJQUhkLFdBR3dCLEtBQUssR0FIN0IsV0FHc0MsS0FBSyxJQUgzQyxZQUdzRCxJQUh0RDs7QUFPQSxXQUFPLENBQUUsS0FBSyxJQUFQLEVBQWEsTUFBTSxHQUFuQixDQUFQO0FBQ0Q7QUE3QlMsQ0FBWjs7QUFnQ0EsT0FBTyxPQUFQLEdBQWlCLFVBQUUsR0FBRixFQUF5QjtBQUFBLE1BQWxCLEdBQWtCLHVFQUFkLENBQWM7QUFBQSxNQUFYLEdBQVcsdUVBQVAsQ0FBTzs7QUFDeEMsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFlBRG1CO0FBRW5CLFlBRm1CO0FBR25CLFNBQVEsS0FBSSxNQUFKLEVBSFc7QUFJbkIsWUFBUSxDQUFFLEdBQUYsRUFBTyxHQUFQLEVBQVksR0FBWjtBQUpXLEdBQXJCOztBQU9BLE9BQUssSUFBTCxRQUFlLEtBQUssUUFBcEIsR0FBK0IsS0FBSyxHQUFwQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQWJEOzs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2FicycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLmFicycgOiBNYXRoLmFicyB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9YWJzKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFicyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFicyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhYnMuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gYWJzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FjY3VtJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5XG5cbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCApXG5cbiAgICAvL2dlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgICBcbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfcmVzZXQsIHZhbHVlUmVmICkge1xuICAgIGxldCBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJ1xuICAgIFxuICAgIC8qIHRocmVlIGRpZmZlcmVudCBtZXRob2RzIG9mIHdyYXBwaW5nLCB0aGlyZCBpcyBtb3N0IGV4cGVuc2l2ZTpcbiAgICAgKlxuICAgICAqIDE6IHJhbmdlIHswLDF9OiB5ID0geCAtICh4IHwgMClcbiAgICAgKiAyOiBsb2cyKHRoaXMubWF4KSA9PSBpbnRlZ2VyOiB5ID0geCAmICh0aGlzLm1heCAtIDEpXG4gICAgICogMzogYWxsIG90aGVyczogaWYoIHggPj0gdGhpcy5tYXggKSB5ID0gdGhpcy5tYXggLXhcbiAgICAgKlxuICAgICAqL1xuXG4gICAgLy8gbXVzdCBjaGVjayBmb3IgcmVzZXQgYmVmb3JlIHN0b3JpbmcgdmFsdWUgZm9yIG91dHB1dFxuICAgIGlmKCAhKHR5cGVvZiB0aGlzLmlucHV0c1sxXSA9PT0gJ251bWJlcicgJiYgdGhpcy5pbnB1dHNbMV0gPCAxKSApIHsgXG4gICAgICBpZiggdGhpcy5yZXNldFZhbHVlICE9PSB0aGlzLm1pbiApIHtcblxuICAgICAgICBvdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5yZXNldFZhbHVlfVxcblxcbmBcbiAgICAgICAgLy9vdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5taW59XFxuXFxuYFxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLm1pbn1cXG5cXG5gXG4gICAgICAgIC8vb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMuaW5pdGlhbFZhbHVlfVxcblxcbmBcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvdXQgKz0gYCAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dmFsdWVSZWZ9XFxuYFxuICAgIFxuICAgIGlmKCB0aGlzLnNob3VsZFdyYXAgPT09IGZhbHNlICYmIHRoaXMuc2hvdWxkQ2xhbXAgPT09IHRydWUgKSB7XG4gICAgICBvdXQgKz0gYCAgaWYoICR7dmFsdWVSZWZ9IDwgJHt0aGlzLm1heCB9ICkgJHt2YWx1ZVJlZn0gKz0gJHtfaW5jcn1cXG5gXG4gICAgfWVsc2V7XG4gICAgICBvdXQgKz0gYCAgJHt2YWx1ZVJlZn0gKz0gJHtfaW5jcn1cXG5gIC8vIHN0b3JlIG91dHB1dCB2YWx1ZSBiZWZvcmUgYWNjdW11bGF0aW5nICBcbiAgICB9XG5cbiAgICBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICAmJiB0aGlzLnNob3VsZFdyYXBNYXggKSB3cmFwICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5gXG4gICAgaWYoIHRoaXMubWluICE9PSAtSW5maW5pdHkgJiYgdGhpcy5zaG91bGRXcmFwTWluICkgd3JhcCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPCAke3RoaXMubWlufSApICR7dmFsdWVSZWZ9ICs9ICR7ZGlmZn1cXG5gXG5cbiAgICAvL2lmKCB0aGlzLm1pbiA9PT0gMCAmJiB0aGlzLm1heCA9PT0gMSApIHsgXG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAtICgke3ZhbHVlUmVmfSB8IDApXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1pbiA9PT0gMCAmJiAoIE1hdGgubG9nMiggdGhpcy5tYXggKSB8IDAgKSA9PT0gTWF0aC5sb2cyKCB0aGlzLm1heCApICkge1xuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gJiAoJHt0aGlzLm1heH0gLSAxKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICl7XG4gICAgLy8gIHdyYXAgPSBgICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gKSAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XFxuXFxuYFxuICAgIC8vfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcCArICdcXG4nXG5cbiAgICByZXR1cm4gb3V0XG4gIH0sXG5cbiAgZGVmYXVsdHMgOiB7IG1pbjowLCBtYXg6MSwgcmVzZXRWYWx1ZTowLCBpbml0aWFsVmFsdWU6MCwgc2hvdWxkV3JhcDp0cnVlLCBzaG91bGRXcmFwTWF4OiB0cnVlLCBzaG91bGRXcmFwTWluOnRydWUsIHNob3VsZENsYW1wOmZhbHNlIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluY3IsIHJlc2V0PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGNvbnN0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gICAgICBcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgXG4gICAgeyBcbiAgICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgICAgaW5wdXRzOiBbIGluY3IsIHJlc2V0IF0sXG4gICAgICBtZW1vcnk6IHtcbiAgICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHByb3RvLmRlZmF1bHRzLFxuICAgIHByb3BlcnRpZXMgXG4gIClcblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuc2hvdWxkV3JhcE1heCA9PT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuc2hvdWxkV3JhcE1pbiA9PT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBwcm9wZXJ0aWVzLnNob3VsZFdyYXAgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHVnZW4uc2hvdWxkV3JhcE1pbiA9IHVnZW4uc2hvdWxkV3JhcE1heCA9IHByb3BlcnRpZXMuc2hvdWxkV3JhcFxuICAgIH1cbiAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5yZXNldFZhbHVlID09PSB1bmRlZmluZWQgKSB7XG4gICAgdWdlbi5yZXNldFZhbHVlID0gdWdlbi5taW5cbiAgfVxuXG4gIGlmKCB1Z2VuLmluaXRpYWxWYWx1ZSA9PT0gdW5kZWZpbmVkICkgdWdlbi5pbml0aWFsVmFsdWUgPSB1Z2VuLm1pblxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpICB7IFxuICAgICAgLy9jb25zb2xlLmxvZyggJ2dlbjonLCBnZW4sIGdlbi5tZW1vcnkgKVxuICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gXG4gICAgfSxcbiAgICBzZXQodikgeyBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiB9XG4gIH0pXG5cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY29zJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG5cbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0ID8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Fjb3MnOiBpc1dvcmtsZXQgPyAnTWF0aC5hY29zJyA6TWF0aC5hY29zIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1hY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hY29zKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYWNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhY29zLmlucHV0cyA9IFsgeCBdXG4gIGFjb3MuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWNvcy5uYW1lID0gYCR7YWNvcy5iYXNlbmFtZX17YWNvcy5pZH1gXG5cbiAgcmV0dXJuIGFjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbXVsICAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgZGl2ICAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgZGF0YSAgICAgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgICAgID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBhY2N1bSAgICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGlmZWxzZSAgID0gcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gICAgbHQgICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBiYW5nICAgICA9IHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gICAgZW52ICAgICAgPSByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gICAgYWRkICAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgcG9rZSAgICAgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICAgIG5lcSAgICAgID0gcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICAgIGFuZCAgICAgID0gcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICAgIGd0ZSAgICAgID0gcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICAgIG1lbW8gICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgICB1dGlsaXRpZXM9IHJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZSA9IDQ0MTAwLCBkZWNheVRpbWUgPSA0NDEwMCwgX3Byb3BzICkgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgc2hhcGU6J2V4cG9uZW50aWFsJywgYWxwaGE6NSwgdHJpZ2dlcjpudWxsIH0sIF9wcm9wcyApXG4gIGNvbnN0IF9iYW5nID0gcHJvcHMudHJpZ2dlciAhPT0gbnVsbCA/IHByb3BzLnRyaWdnZXIgOiBiYW5nKCksXG4gICAgICAgIHBoYXNlID0gYWNjdW0oIDEsIF9iYW5nLCB7IG1pbjowLCBtYXg6IEluZmluaXR5LCBpbml0aWFsVmFsdWU6LUluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlIH0pXG4gICAgICBcbiAgbGV0IGJ1ZmZlckRhdGEsIGJ1ZmZlckRhdGFSZXZlcnNlLCBkZWNheURhdGEsIG91dCwgYnVmZmVyXG5cbiAgLy9jb25zb2xlLmxvZyggJ3NoYXBlOicsIHByb3BzLnNoYXBlLCAnYXR0YWNrIHRpbWU6JywgYXR0YWNrVGltZSwgJ2RlY2F5IHRpbWU6JywgZGVjYXlUaW1lIClcbiAgbGV0IGNvbXBsZXRlRmxhZyA9IGRhdGEoIFswXSApXG4gIFxuICAvLyBzbGlnaHRseSBtb3JlIGVmZmljaWVudCB0byB1c2UgZXhpc3RpbmcgcGhhc2UgYWNjdW11bGF0b3IgZm9yIGxpbmVhciBlbnZlbG9wZXNcbiAgaWYoIHByb3BzLnNoYXBlID09PSAnbGluZWFyJyApIHtcbiAgICBvdXQgPSBpZmVsc2UoIFxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgbHQoIHBoYXNlLCBhdHRhY2tUaW1lICkpLFxuICAgICAgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLFxuXG4gICAgICBhbmQoIGd0ZSggcGhhc2UsIDApLCAgbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSApICkgKSxcbiAgICAgIHN1YiggMSwgZGl2KCBzdWIoIHBoYXNlLCBhdHRhY2tUaW1lICksIGRlY2F5VGltZSApICksXG4gICAgICBcbiAgICAgIG5lcSggcGhhc2UsIC1JbmZpbml0eSksXG4gICAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAgIDAgXG4gICAgKVxuICB9IGVsc2Uge1xuICAgIGJ1ZmZlckRhdGEgPSBlbnYoeyBsZW5ndGg6MTAyNCwgdHlwZTpwcm9wcy5zaGFwZSwgYWxwaGE6cHJvcHMuYWxwaGEgfSlcbiAgICBidWZmZXJEYXRhUmV2ZXJzZSA9IGVudih7IGxlbmd0aDoxMDI0LCB0eXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSwgcmV2ZXJzZTp0cnVlIH0pXG5cbiAgICBvdXQgPSBpZmVsc2UoIFxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgbHQoIHBoYXNlLCBhdHRhY2tUaW1lICkgKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgICAgYW5kKCBndGUocGhhc2UsMCksIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YVJldmVyc2UsIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSApLCBkZWNheVRpbWUgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgICAgbmVxKCBwaGFzZSwgLUluZmluaXR5ICksXG4gICAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAgIDBcbiAgICApXG4gIH1cblxuICBjb25zdCB1c2luZ1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgKSB7XG4gICAgb3V0Lm5vZGUgPSBudWxsXG4gICAgdXRpbGl0aWVzLnJlZ2lzdGVyKCBvdXQgKVxuICB9XG5cbiAgLy8gbmVlZGVkIGZvciBnaWJiZXJpc2guLi4gZ2V0dGluZyB0aGlzIHRvIHdvcmsgcmlnaHQgd2l0aCB3b3JrbGV0c1xuICAvLyB2aWEgcHJvbWlzZXMgd2lsbCBwcm9iYWJseSBiZSB0cmlja3lcbiAgb3V0LmlzQ29tcGxldGUgPSAoKT0+IHtcbiAgICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICYmIG91dC5ub2RlICE9PSBudWxsICkge1xuICAgICAgY29uc3QgcCA9IG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgb3V0Lm5vZGUuZ2V0TWVtb3J5VmFsdWUoIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCwgcmVzb2x2ZSApXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gcFxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF1cbiAgICB9XG4gIH1cblxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgJiYgb3V0Lm5vZGUgIT09IG51bGwgKSB7XG4gICAgICBvdXQubm9kZS5wb3J0LnBvc3RNZXNzYWdlKHsga2V5OidzZXQnLCBpZHg6Y29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4LCB2YWx1ZTowIH0pXG4gICAgfVxuICAgIC8vZWxzZXtcbiAgICAvLyAgZ2VuLm1lbW9yeS5oZWFwWyBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHggXSA9IDBcbiAgICAvL31cbiAgICBfYmFuZy50cmlnZ2VyKClcbiAgfVxuXG4gIHJldHVybiBvdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHsgXG4gIGJhc2VuYW1lOidhZGQnLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PScnLFxuICAgICAgICBzdW0gPSAwLCBudW1Db3VudCA9IDAsIGFkZGVyQXRFbmQgPSBmYWxzZSwgYWxyZWFkeUZ1bGxTdW1tZWQgPSB0cnVlXG5cbiAgICBpZiggaW5wdXRzLmxlbmd0aCA9PT0gMCApIHJldHVybiAwXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYFxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICBvdXQgKz0gdlxuICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgYWRkZXJBdEVuZCA9IHRydWVcbiAgICAgICAgICBvdXQgKz0gJyArICdcbiAgICAgICAgfVxuICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3VtICs9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICBudW1Db3VudCsrXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICBvdXQgKz0gYWRkZXJBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKyAnICsgc3VtXG4gICAgfVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgY29uc3QgYWRkID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBhZGQuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWRkLm5hbWUgPSBhZGQuYmFzZW5hbWUgKyBhZGQuaWRcbiAgYWRkLmlucHV0cyA9IGFyZ3NcblxuICByZXR1cm4gYWRkXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIG11bCAgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGRpdiAgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIGRhdGEgICAgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrICAgICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgYWNjdW0gICAgPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBpZmVsc2UgICA9IHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICAgIGx0ICAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYmFuZyAgICAgPSByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICAgIGVudiAgICAgID0gcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICAgIHBhcmFtICAgID0gcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gICAgYWRkICAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgZ3RwICAgICAgPSByZXF1aXJlKCAnLi9ndHAuanMnICksXG4gICAgbm90ICAgICAgPSByZXF1aXJlKCAnLi9ub3QuanMnICksXG4gICAgYW5kICAgICAgPSByZXF1aXJlKCAnLi9hbmQuanMnICksXG4gICAgbmVxICAgICAgPSByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gICAgcG9rZSAgICAgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBhdHRhY2tUaW1lPTQ0LCBkZWNheVRpbWU9MjIwNTAsIHN1c3RhaW5UaW1lPTQ0MTAwLCBzdXN0YWluTGV2ZWw9LjYsIHJlbGVhc2VUaW1lPTQ0MTAwLCBfcHJvcHMgKSA9PiB7XG4gIGxldCBlbnZUcmlnZ2VyID0gYmFuZygpLFxuICAgICAgcGhhc2UgPSBhY2N1bSggMSwgZW52VHJpZ2dlciwgeyBtYXg6IEluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlLCBpbml0aWFsVmFsdWU6SW5maW5pdHkgfSksXG4gICAgICBzaG91bGRTdXN0YWluID0gcGFyYW0oIDEgKSxcbiAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgc2hhcGU6ICdleHBvbmVudGlhbCcsXG4gICAgICAgICBhbHBoYTogNSxcbiAgICAgICAgIHRyaWdnZXJSZWxlYXNlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBfcHJvcHMgKSxcbiAgICAgIGJ1ZmZlckRhdGEsIGRlY2F5RGF0YSwgb3V0LCBidWZmZXIsIHN1c3RhaW5Db25kaXRpb24sIHJlbGVhc2VBY2N1bSwgcmVsZWFzZUNvbmRpdGlvblxuXG5cbiAgY29uc3QgY29tcGxldGVGbGFnID0gZGF0YSggWzBdIClcblxuICBidWZmZXJEYXRhID0gZW52KHsgbGVuZ3RoOjEwMjQsIGFscGhhOnByb3BzLmFscGhhLCBzaGlmdDowLCB0eXBlOnByb3BzLnNoYXBlIH0pXG5cbiAgc3VzdGFpbkNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlIFxuICAgID8gc2hvdWxkU3VzdGFpblxuICAgIDogbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUgKSApXG5cbiAgcmVsZWFzZUFjY3VtID0gcHJvcHMudHJpZ2dlclJlbGVhc2VcbiAgICA/IGd0cCggc3ViKCBzdXN0YWluTGV2ZWwsIGFjY3VtKCBkaXYoIHN1c3RhaW5MZXZlbCwgcmVsZWFzZVRpbWUgKSAsIDAsIHsgc2hvdWxkV3JhcDpmYWxzZSB9KSApLCAwIClcbiAgICA6IHN1Yiggc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lICkgKSwgcmVsZWFzZVRpbWUgKSwgc3VzdGFpbkxldmVsICkgKSwgXG5cbiAgcmVsZWFzZUNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgPyBub3QoIHNob3VsZFN1c3RhaW4gKVxuICAgIDogbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUsIHJlbGVhc2VUaW1lICkgKVxuXG4gIG91dCA9IGlmZWxzZShcbiAgICAvLyBhdHRhY2sgXG4gICAgbHQoIHBoYXNlLCAgYXR0YWNrVGltZSApLCBcbiAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgIC8vIGRlY2F5XG4gICAgbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSApICksIFxuICAgIHBlZWsoIGJ1ZmZlckRhdGEsIHN1YiggMSwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICksICBkZWNheVRpbWUgKSwgc3ViKCAxLCAgc3VzdGFpbkxldmVsICkgKSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pLFxuXG4gICAgLy8gc3VzdGFpblxuICAgIGFuZCggc3VzdGFpbkNvbmRpdGlvbiwgbmVxKCBwaGFzZSwgSW5maW5pdHkgKSApLFxuICAgIHBlZWsoIGJ1ZmZlckRhdGEsICBzdXN0YWluTGV2ZWwgKSxcblxuICAgIC8vIHJlbGVhc2VcbiAgICByZWxlYXNlQ29uZGl0aW9uLCAvL2x0KCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lICsgIHJlbGVhc2VUaW1lICksXG4gICAgcGVlayggXG4gICAgICBidWZmZXJEYXRhLFxuICAgICAgcmVsZWFzZUFjY3VtLCBcbiAgICAgIC8vc3ViKCAgc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lKSwgIHJlbGVhc2VUaW1lICksICBzdXN0YWluTGV2ZWwgKSApLCBcbiAgICAgIHsgYm91bmRtb2RlOidjbGFtcCcgfVxuICAgICksXG5cbiAgICBuZXEoIHBoYXNlLCBJbmZpbml0eSApLFxuICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgIDBcbiAgKVxuICAgXG4gIGNvbnN0IHVzaW5nV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSApIHtcbiAgICBvdXQubm9kZSA9IG51bGxcbiAgICB1dGlsaXRpZXMucmVnaXN0ZXIoIG91dCApXG4gIH1cblxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAxXG4gICAgZW52VHJpZ2dlci50cmlnZ2VyKClcbiAgfVxuIFxuICAvLyBuZWVkZWQgZm9yIGdpYmJlcmlzaC4uLiBnZXR0aW5nIHRoaXMgdG8gd29yayByaWdodCB3aXRoIHdvcmtsZXRzXG4gIC8vIHZpYSBwcm9taXNlcyB3aWxsIHByb2JhYmx5IGJlIHRyaWNreVxuICBvdXQuaXNDb21wbGV0ZSA9ICgpPT4ge1xuICAgIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgJiYgb3V0Lm5vZGUgIT09IG51bGwgKSB7XG4gICAgICBjb25zdCBwID0gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICBvdXQubm9kZS5nZXRNZW1vcnlWYWx1ZSggY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4LCByZXNvbHZlIClcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBwXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHggXVxuICAgIH1cbiAgfVxuXG5cbiAgb3V0LnJlbGVhc2UgPSAoKT0+IHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMFxuICAgIC8vIFhYWCBwcmV0dHkgbmFzdHkuLi4gZ3JhYnMgYWNjdW0gaW5zaWRlIG9mIGd0cCBhbmQgcmVzZXRzIHZhbHVlIG1hbnVhbGx5XG4gICAgLy8gdW5mb3J0dW5hdGVseSBlbnZUcmlnZ2VyIHdvbid0IHdvcmsgYXMgaXQncyBiYWNrIHRvIDAgYnkgdGhlIHRpbWUgdGhlIHJlbGVhc2UgYmxvY2sgaXMgdHJpZ2dlcmVkLi4uXG4gICAgaWYoIHVzaW5nV29ya2xldCAmJiBvdXQubm9kZSAhPT0gbnVsbCApIHtcbiAgICAgIG91dC5ub2RlLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3NldCcsIGlkeDpyZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4LCB2YWx1ZTowIH0pXG4gICAgfWVsc2V7XG4gICAgICBnZW4ubWVtb3J5LmhlYXBbIHJlbGVhc2VBY2N1bS5pbnB1dHNbMF0uaW5wdXRzWzFdLm1lbW9yeS52YWx1ZS5pZHggXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gMCAmJiAke2lucHV0c1sxXX0gIT09IDApIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXNpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQgPyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYXNpbic6IGlzV29ya2xldCA/ICdNYXRoLnNpbicgOiBNYXRoLmFzaW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWFzaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFzaW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFzaW4uaW5wdXRzID0gWyB4IF1cbiAgYXNpbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhc2luLm5hbWUgPSBgJHthc2luLmJhc2VuYW1lfXthc2luLmlkfWBcblxuICByZXR1cm4gYXNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhdGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhdGFuJzogaXNXb3JrbGV0ID8gJ01hdGguYXRhbicgOiBNYXRoLmF0YW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWF0YW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmF0YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGF0YW4uaW5wdXRzID0gWyB4IF1cbiAgYXRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhdGFuLm5hbWUgPSBgJHthdGFuLmJhc2VuYW1lfXthdGFuLmlkfWBcblxuICByZXR1cm4gYXRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGVjYXlUaW1lID0gNDQxMDAgKSA9PiB7XG4gIGxldCBzc2QgPSBoaXN0b3J5ICggMSApLFxuICAgICAgdDYwID0gTWF0aC5leHAoIC02LjkwNzc1NTI3ODkyMSAvIGRlY2F5VGltZSApXG5cbiAgc3NkLmluKCBtdWwoIHNzZC5vdXQsIHQ2MCApIClcblxuICBzc2Qub3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBzc2QudmFsdWUgPSAxXG4gIH1cblxuICByZXR1cm4gc3ViKCAxLCBzc2Qub3V0IClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGxldCBvdXQgPSBcbmAgIHZhciAke3RoaXMubmFtZX0gPSBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XVxuICBpZiggJHt0aGlzLm5hbWV9ID09PSAxICkgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV0gPSAwICAgICAgXG4gICAgICBcbmBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIF9wcm9wcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowLCBtYXg6MSB9LCBfcHJvcHMgKVxuXG4gIHVnZW4ubmFtZSA9ICdiYW5nJyArIGdlbi5nZXRVSUQoKVxuXG4gIHVnZW4ubWluID0gcHJvcHMubWluXG4gIHVnZW4ubWF4ID0gcHJvcHMubWF4XG5cbiAgY29uc3QgdXNpbmdXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICkge1xuICAgIHVnZW4ubm9kZSA9IG51bGxcbiAgICB1dGlsaXRpZXMucmVnaXN0ZXIoIHVnZW4gKVxuICB9XG5cbiAgdWdlbi50cmlnZ2VyID0gKCkgPT4ge1xuICAgIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgJiYgdWdlbi5ub2RlICE9PSBudWxsICkge1xuICAgICAgdWdlbi5ub2RlLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3NldCcsIGlkeDp1Z2VuLm1lbW9yeS52YWx1ZS5pZHgsIHZhbHVlOnVnZW4ubWF4IH0pXG4gICAgfWVsc2V7XG4gICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gdWdlbi5tYXggXG4gICAgfVxuICB9XG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidib29sJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSBgJHtpbnB1dHNbMF19ID09PSAwID8gMCA6IDFgXG4gICAgXG4gICAgLy9nZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgLy9yZXR1cm4gWyBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YCwgJyAnICtvdXQgXVxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonY2VpbCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLmNlaWwnIDogTWF0aC5jZWlsIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1jZWlsKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNlaWwoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjZWlsID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGNlaWwuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gY2VpbFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vcj0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiAgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjbGlwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0XG5cbiAgICBvdXQgPVxuXG5gIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cbiAgaWYoICR7dGhpcy5uYW1lfSA+ICR7aW5wdXRzWzJdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzJdfVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPCAke2lucHV0c1sxXX0gKSAke3RoaXMubmFtZX0gPSAke2lucHV0c1sxXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPS0xLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xLCBtaW4sIG1heCBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjb3MnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQgPyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnY29zJzogaXNXb3JrbGV0ID8gJ01hdGguY29zJyA6IE1hdGguY29zIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1jb3MoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBjb3MuaW5wdXRzID0gWyB4IF1cbiAgY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGNvcy5uYW1lID0gYCR7Y29zLmJhc2VuYW1lfXtjb3MuaWR9YFxuXG4gIHJldHVybiBjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY291bnRlcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keVxuICAgICAgIFxuICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB0aGlzLmluaXRpYWxWYWx1ZVxuICAgIFxuICAgIGZ1bmN0aW9uQm9keSAgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgaW5wdXRzWzJdLCBpbnB1dHNbM10sIGlucHV0c1s0XSwgIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAsIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS53cmFwLmlkeH1dYCAgKVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgIFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy53cmFwLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkgdGhpcy53cmFwLmdlbigpXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfbWluLCBfbWF4LCBfcmVzZXQsIGxvb3BzLCB2YWx1ZVJlZiwgd3JhcFJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICAvLyBtdXN0IGNoZWNrIGZvciByZXNldCBiZWZvcmUgc3RvcmluZyB2YWx1ZSBmb3Igb3V0cHV0XG4gICAgaWYoICEodHlwZW9mIHRoaXMuaW5wdXRzWzNdID09PSAnbnVtYmVyJyAmJiB0aGlzLmlucHV0c1szXSA8IDEpICkgeyBcbiAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49IDEgKSAke3ZhbHVlUmVmfSA9ICR7X21pbn1cXG5gXG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfTtcXG4gICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgXG4gICAgaWYoIHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHR5cGVvZiB0aGlzLm1pbiAhPT0gJ251bWJlcicgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNlIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdGhpcy5taW4gIT09IEluZmluaXR5ICkge1xuICAgICAgd3JhcCA9IFxuYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7X21heH0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9IC09ICR7X21heH0gLSAke19taW59XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2UgaWYoICR7dmFsdWVSZWZ9IDwgJHtfbWlufSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gKz0gJHtfbWF4fSAtICR7X21pbn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gMFxuICB9XFxuYFxuICAgIH1lbHNle1xuICAgICAgb3V0ICs9ICdcXG4nXG4gICAgfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcFxuXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyPTEsIG1pbj0wLCBtYXg9SW5maW5pdHksIHJlc2V0PTAsIGxvb3BzPTEsICBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IE9iamVjdC5hc3NpZ24oIHsgaW5pdGlhbFZhbHVlOiAwLCBzaG91bGRXcmFwOnRydWUgfSwgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW46ICAgIG1pbiwgXG4gICAgbWF4OiAgICBtYXgsXG4gICAgaW5pdGlhbFZhbHVlOiBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdmFsdWU6ICBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIG1pbiwgbWF4LCByZXNldCwgbG9vcHMgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSxcbiAgICAgIHdyYXA6ICB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSBcbiAgICB9LFxuICAgIHdyYXAgOiB7XG4gICAgICBnZW4oKSB7IFxuICAgICAgICBpZiggdWdlbi5tZW1vcnkud3JhcC5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgfVxuICAgICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWBcbiAgICAgICAgcmV0dXJuIGBtZW1vcnlbICR7dWdlbi5tZW1vcnkud3JhcC5pZHh9IF1gIFxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuICBcbiAgdWdlbi53cmFwLmlucHV0cyA9IFsgdWdlbiBdXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG4gIHVnZW4ud3JhcC5uYW1lID0gdWdlbi5uYW1lICsgJ193cmFwJ1xuICByZXR1cm4gdWdlblxufSBcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bT0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgcGhhc29yPXJlcXVpcmUoICcuL3BoYXNvci5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2N5Y2xlJyxcblxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICAgIGZvciggbGV0IGkgPSAwLCBsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gTWF0aC5zaW4oICggaSAvIGwgKSAqICggTWF0aC5QSSAqIDIgKSApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMuY3ljbGUgPSBkYXRhKCBidWZmZXIsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSApXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAsIF9wcm9wcyApID0+IHtcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy5jeWNsZSA9PT0gJ3VuZGVmaW5lZCcgKSBwcm90by5pbml0VGFibGUoKSBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowIH0sIF9wcm9wcyApXG5cbiAgY29uc3QgdWdlbiA9IHBlZWsoIGdlbi5nbG9iYWxzLmN5Y2xlLCBwaGFzb3IoIGZyZXF1ZW5jeSwgcmVzZXQsIHByb3BzICkpXG4gIHVnZW4ubmFtZSA9ICdjeWNsZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgICBhY2N1bT0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApLFxuICAgICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICAgIG11bCAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgICBhZGQgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgICAgcGhhc29yPXJlcXVpcmUoICcuL3BoYXNvci5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY3ljbGVOJyxcblxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCAxMDI0IClcblxuICAgIGZvciggbGV0IGkgPSAwLCBsID0gYnVmZmVyLmxlbmd0aDsgaSA8IGw7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gTWF0aC5zaW4oICggaSAvIGwgKSAqICggTWF0aC5QSSAqIDIgKSApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMuY3ljbGUgPSBkYXRhKCBidWZmZXIsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSApXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTEsIHJlc2V0PTAsIF9wcm9wcyApID0+IHtcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy5jeWNsZSA9PT0gJ3VuZGVmaW5lZCcgKSBwcm90by5pbml0VGFibGUoKSBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowIH0sIF9wcm9wcyApXG5cbiAgY29uc3QgdWdlbiA9IG11bCggYWRkKCAxLCBwZWVrKCBnZW4uZ2xvYmFscy5jeWNsZSwgcGhhc29yKCBmcmVxdWVuY3ksIHJlc2V0LCBwcm9wcyApKSApLCAuNSApXG4gIHVnZW4ubmFtZSA9ICdjeWNsZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgICAgdXRpbGl0aWVzID0gcmVxdWlyZSggJy4vdXRpbGl0aWVzLmpzJyApLFxuICAgICAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICAgICAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGF0YScsXG4gIGdsb2JhbHM6IHt9LFxuICBtZW1vOnt9LFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaWR4XG4gICAgLy9jb25zb2xlLmxvZyggJ2RhdGEgbmFtZTonLCB0aGlzLm5hbWUsIHByb3RvLm1lbW8gKVxuICAgIC8vZGVidWdnZXJcbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBsZXQgdWdlbiA9IHRoaXNcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSwgdGhpcy5pbW11dGFibGUgKSBcbiAgICAgIGlkeCA9IHRoaXMubWVtb3J5LnZhbHVlcy5pZHhcbiAgICAgIGlmKCB0aGlzLmJ1ZmZlciAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcC5zZXQoIHRoaXMuYnVmZmVyLCBpZHggKVxuICAgICAgICB9Y2F0Y2goIGUgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coIGUgKVxuICAgICAgICAgIHRocm93IEVycm9yKCAnZXJyb3Igd2l0aCByZXF1ZXN0LiBhc2tpbmcgZm9yICcgKyB0aGlzLmJ1ZmZlci5sZW5ndGggKycuIGN1cnJlbnQgaW5kZXg6ICcgKyBnZW4ubWVtb3J5SW5kZXggKyAnIG9mICcgKyBnZW4ubWVtb3J5LmhlYXAubGVuZ3RoIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSB0aGlzXG4gICAgICAvL3JldHVybiAnZ2VuLm1lbW9yeScgKyB0aGlzLm5hbWUgKyAnLmJ1ZmZlcidcbiAgICAgIGlmKCB0aGlzLm5hbWUuaW5kZXhPZignZGF0YScpID09PSAtMSApIHtcbiAgICAgICAgcHJvdG8ubWVtb1sgdGhpcy5uYW1lIF0gPSBpZHhcbiAgICAgIH1lbHNle1xuICAgICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpZHhcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIC8vY29uc29sZS5sb2coICd1c2luZyBnZW4gZGF0YSBtZW1vJywgcHJvdG8ubWVtb1sgdGhpcy5uYW1lIF0gKVxuICAgICAgaWR4ID0gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gICAgfVxuICAgIHJldHVybiBpZHhcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHk9MSwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4sIGJ1ZmZlciwgc2hvdWxkTG9hZCA9IGZhbHNlXG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdICkge1xuICAgICAgcmV0dXJuIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdXG4gICAgfVxuICB9XG5cbiAgaWYoIHR5cGVvZiB4ID09PSAnbnVtYmVyJyApIHtcbiAgICBpZiggeSAhPT0gMSApIHtcbiAgICAgIGJ1ZmZlciA9IFtdXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHk7IGkrKyApIHtcbiAgICAgICAgYnVmZmVyWyBpIF0gPSBuZXcgRmxvYXQzMkFycmF5KCB4IClcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHggKVxuICAgIH1cbiAgfWVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIHggKSApIHsgLy8hICh4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkgKSB7XG4gICAgbGV0IHNpemUgPSB4Lmxlbmd0aFxuICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHNpemUgKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0geFsgaSBdXG4gICAgfVxuICB9ZWxzZSBpZiggdHlwZW9mIHggPT09ICdzdHJpbmcnICkge1xuICAgIC8vYnVmZmVyID0geyBsZW5ndGg6IHkgPiAxID8geSA6IGdlbi5zYW1wbGVyYXRlICogNjAgfSAvLyBYWFggd2hhdD8/P1xuICAgIC8vaWYoIHByb3RvLm1lbW9bIHggXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgYnVmZmVyID0geyBsZW5ndGg6IHkgPiAxID8geSA6IDEgfSAvLyBYWFggd2hhdD8/P1xuICAgICAgc2hvdWxkTG9hZCA9IHRydWVcbiAgICAvL31lbHNle1xuICAgICAgLy9idWZmZXIgPSBwcm90by5tZW1vWyB4IF1cbiAgICAvL31cbiAgfWVsc2UgaWYoIHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSB7XG4gICAgYnVmZmVyID0geFxuICB9XG4gIFxuICB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSBcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBcbiAgeyBcbiAgICBidWZmZXIsXG4gICAgbmFtZTogcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKCksXG4gICAgZGltOiAgYnVmZmVyICE9PSB1bmRlZmluZWQgPyBidWZmZXIubGVuZ3RoIDogMSwgLy8gWFhYIGhvdyBkbyB3ZSBkeW5hbWljYWxseSBhbGxvY2F0ZSB0aGlzP1xuICAgIGNoYW5uZWxzIDogMSxcbiAgICBvbmxvYWQ6IHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCA/IHByb3BlcnRpZXMub25sb2FkIHx8IG51bGwgOiBudWxsLFxuICAgIC8vdGhlbiggZm5jICkge1xuICAgIC8vICB1Z2VuLm9ubG9hZCA9IGZuY1xuICAgIC8vICByZXR1cm4gdWdlblxuICAgIC8vfSxcbiAgICBpbW11dGFibGU6IHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmltbXV0YWJsZSA9PT0gdHJ1ZSA/IHRydWUgOiBmYWxzZSxcbiAgICBsb2FkKCBmaWxlbmFtZSwgX19yZXNvbHZlICkge1xuICAgICAgbGV0IHByb21pc2UgPSB1dGlsaXRpZXMubG9hZFNhbXBsZSggZmlsZW5hbWUsIHVnZW4gKVxuICAgICAgcHJvbWlzZS50aGVuKCBfYnVmZmVyID0+IHsgXG4gICAgICAgIHByb3RvLm1lbW9bIHggXSA9IF9idWZmZXJcbiAgICAgICAgdWdlbi5uYW1lID0gZmlsZW5hbWVcbiAgICAgICAgdWdlbi5tZW1vcnkudmFsdWVzLmxlbmd0aCA9IHVnZW4uZGltID0gX2J1ZmZlci5sZW5ndGhcblxuICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnksIHVnZW4uaW1tdXRhYmxlICkgXG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcC5zZXQoIF9idWZmZXIsIHVnZW4ubWVtb3J5LnZhbHVlcy5pZHggKVxuICAgICAgICBpZiggdHlwZW9mIHVnZW4ub25sb2FkID09PSAnZnVuY3Rpb24nICkgdWdlbi5vbmxvYWQoIF9idWZmZXIgKSBcbiAgICAgICAgX19yZXNvbHZlKCB1Z2VuIClcbiAgICAgIH0pXG4gICAgfSxcbiAgICBtZW1vcnkgOiB7XG4gICAgICB2YWx1ZXM6IHsgbGVuZ3RoOmJ1ZmZlciAhPT0gdW5kZWZpbmVkID8gYnVmZmVyLmxlbmd0aCA6IDEsIGlkeDpudWxsIH1cbiAgICB9XG4gIH0sXG4gIHByb3BlcnRpZXNcbiAgKVxuXG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBwcm9wZXJ0aWVzLmdsb2JhbCAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF0gPSB1Z2VuXG4gICAgfVxuICAgIGlmKCBwcm9wZXJ0aWVzLm1ldGEgPT09IHRydWUgKSB7XG4gICAgICBmb3IoIGxldCBpID0gMCwgbGVuZ3RoID0gdWdlbi5idWZmZXIubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKysgKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgaSwge1xuICAgICAgICAgIGdldCAoKSB7XG4gICAgICAgICAgICByZXR1cm4gcGVlayggdWdlbiwgaSwgeyBtb2RlOidzaW1wbGUnLCBpbnRlcnA6J25vbmUnIH0gKVxuICAgICAgICAgIH0sXG4gICAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgICAgcmV0dXJuIHBva2UoIHVnZW4sIHYsIGkgKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsZXQgcmV0dXJuVmFsdWVcbiAgaWYoIHNob3VsZExvYWQgPT09IHRydWUgKSB7XG4gICAgcmV0dXJuVmFsdWUgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUscmVqZWN0KSA9PiB7XG4gICAgICAvL3VnZW4ubG9hZCggeCwgcmVzb2x2ZSApXG4gICAgICBsZXQgcHJvbWlzZSA9IHV0aWxpdGllcy5sb2FkU2FtcGxlKCB4LCB1Z2VuIClcbiAgICAgIHByb21pc2UudGhlbiggX2J1ZmZlciA9PiB7IFxuICAgICAgICBwcm90by5tZW1vWyB4IF0gPSBfYnVmZmVyXG4gICAgICAgIHVnZW4ubWVtb3J5LnZhbHVlcy5sZW5ndGggPSB1Z2VuLmRpbSA9IF9idWZmZXIubGVuZ3RoXG5cbiAgICAgICAgdWdlbi5idWZmZXIgPSBfYnVmZmVyXG4gICAgICAgIC8vZ2VuLm9uY2UoICdtZW1vcnkgaW5pdCcsICgpPT4ge1xuICAgICAgICAvLyAgY29uc29sZS5sb2coIFwiQ0FMTEVEXCIsIHVnZW4ubWVtb3J5IClcbiAgICAgICAgLy8gIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSwgdWdlbi5pbW11dGFibGUgKSBcbiAgICAgICAgLy8gIGdlbi5tZW1vcnkuaGVhcC5zZXQoIF9idWZmZXIsIHVnZW4ubWVtb3J5LnZhbHVlcy5pZHggKVxuICAgICAgICAvLyAgaWYoIHR5cGVvZiB1Z2VuLm9ubG9hZCA9PT0gJ2Z1bmN0aW9uJyApIHVnZW4ub25sb2FkKCBfYnVmZmVyICkgXG4gICAgICAgIC8vfSlcbiAgICAgICAgXG4gICAgICAgIHJlc29sdmUoIHVnZW4gKVxuICAgICAgfSkgICAgIFxuICAgIH0pXG4gIH1lbHNlIGlmKCBwcm90by5tZW1vWyB4IF0gIT09IHVuZGVmaW5lZCApIHtcblxuICAgIGdlbi5vbmNlKCAnbWVtb3J5IGluaXQnLCAoKT0+IHtcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSwgdWdlbi5pbW11dGFibGUgKSBcbiAgICAgIGdlbi5tZW1vcnkuaGVhcC5zZXQoIHVnZW4uYnVmZmVyLCB1Z2VuLm1lbW9yeS52YWx1ZXMuaWR4IClcbiAgICAgIGlmKCB0eXBlb2YgdWdlbi5vbmxvYWQgPT09ICdmdW5jdGlvbicgKSB1Z2VuLm9ubG9hZCggdWdlbi5idWZmZXIgKSBcbiAgICB9KVxuXG4gICAgcmV0dXJuVmFsdWUgPSB1Z2VuXG4gIH1lbHNle1xuICAgIHJldHVyblZhbHVlID0gdWdlblxuICB9XG5cbiAgcmV0dXJuIHJldHVyblZhbHVlIFxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IHgxID0gaGlzdG9yeSgpLFxuICAgICAgeTEgPSBoaXN0b3J5KCksXG4gICAgICBmaWx0ZXJcblxuICAvL0hpc3RvcnkgeDEsIHkxOyB5ID0gaW4xIC0geDEgKyB5MSowLjk5OTc7IHgxID0gaW4xOyB5MSA9IHk7IG91dDEgPSB5O1xuICBmaWx0ZXIgPSBtZW1vKCBhZGQoIHN1YiggaW4xLCB4MS5vdXQgKSwgbXVsKCB5MS5vdXQsIC45OTk3ICkgKSApXG4gIHgxLmluKCBpbjEgKVxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICB0NjAgICAgID0gcmVxdWlyZSggJy4vdDYwLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkZWNheVRpbWUgPSA0NDEwMCwgcHJvcHMgKSA9PiB7XG4gIGxldCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBpbml0VmFsdWU6MSB9LCBwcm9wcyApLFxuICAgICAgc3NkID0gaGlzdG9yeSAoIHByb3BlcnRpZXMuaW5pdFZhbHVlIClcblxuICBzc2QuaW4oIG11bCggc3NkLm91dCwgdDYwKCBkZWNheVRpbWUgKSApIClcblxuICBzc2Qub3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBzc2QudmFsdWUgPSAxXG4gIH1cblxuICByZXR1cm4gc3NkLm91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyAgKSxcbiAgICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgICAgcG9rZSA9IHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gICAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICAgIHN1YiAgPSByZXF1aXJlKCAnLi9zdWIuanMnICApLFxuICAgICAgd3JhcCA9IHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gICAgICBhY2N1bT0gcmVxdWlyZSggJy4vYWNjdW0uanMnKSxcbiAgICAgIG1lbW8gPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGVsYXknLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaW5wdXRzWzBdXG4gICAgXG4gICAgcmV0dXJuIGlucHV0c1swXVxuICB9LFxufVxuXG5jb25zdCBkZWZhdWx0cyA9IHsgc2l6ZTogNTEyLCBpbnRlcnA6J25vbmUnIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgdGFwcywgcHJvcGVydGllcyApID0+IHtcbiAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgbGV0IHdyaXRlSWR4LCByZWFkSWR4LCBkZWxheWRhdGFcblxuICBpZiggQXJyYXkuaXNBcnJheSggdGFwcyApID09PSBmYWxzZSApIHRhcHMgPSBbIHRhcHMgXVxuICBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIGNvbnN0IG1heFRhcFNpemUgPSBNYXRoLm1heCggLi4udGFwcyApXG4gIGlmKCBwcm9wcy5zaXplIDwgbWF4VGFwU2l6ZSApIHByb3BzLnNpemUgPSBtYXhUYXBTaXplXG5cbiAgZGVsYXlkYXRhID0gZGF0YSggcHJvcHMuc2l6ZSApXG4gIFxuICB1Z2VuLmlucHV0cyA9IFtdXG5cbiAgd3JpdGVJZHggPSBhY2N1bSggMSwgMCwgeyBtYXg6cHJvcHMuc2l6ZSwgbWluOjAgfSlcbiAgXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgdGFwcy5sZW5ndGg7IGkrKyApIHtcbiAgICB1Z2VuLmlucHV0c1sgaSBdID0gcGVlayggZGVsYXlkYXRhLCB3cmFwKCBzdWIoIHdyaXRlSWR4LCB0YXBzW2ldICksIDAsIHByb3BzLnNpemUgKSx7IG1vZGU6J3NhbXBsZXMnLCBpbnRlcnA6cHJvcHMuaW50ZXJwIH0pXG4gIH1cbiAgXG4gIHVnZW4ub3V0cHV0cyA9IHVnZW4uaW5wdXRzIC8vIFhYWCB1Z2gsIFVnaCwgVUdIISBidXQgaSBndWVzcyBpdCB3b3Jrcy5cblxuICBwb2tlKCBkZWxheWRhdGEsIGluMSwgd3JpdGVJZHggKVxuXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgbjEgPSBoaXN0b3J5KClcbiAgICBcbiAgbjEuaW4oIGluMSApXG5cbiAgbGV0IHVnZW4gPSBzdWIoIGluMSwgbjEub3V0IClcbiAgdWdlbi5uYW1lID0gJ2RlbHRhJytnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGl2JyxcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dD1gICB2YXIgJHt0aGlzLm5hbWV9ID0gYCxcbiAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBkaXZBdEVuZCA9IGZhbHNlXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgIGlmKCAhbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuICkge1xuICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAvIHZcbiAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLyAke3Z9YFxuICAgICAgfVxuXG4gICAgICBpZiggIWlzRmluYWxJZHggKSBvdXQgKz0gJyAvICcgXG4gICAgfSlcblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBjb25zdCBkaXYgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBPYmplY3QuYXNzaWduKCBkaXYsIHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG4gIH0pXG5cbiAgZGl2Lm5hbWUgPSBkaXYuYmFzZW5hbWUgKyBkaXYuaWRcbiAgXG4gIHJldHVybiBkaXZcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbicgKSxcbiAgICB3aW5kb3dzID0gcmVxdWlyZSggJy4vd2luZG93cycgKSxcbiAgICBkYXRhICAgID0gcmVxdWlyZSggJy4vZGF0YScgKSxcbiAgICBwZWVrICAgID0gcmVxdWlyZSggJy4vcGVlaycgKSxcbiAgICBwaGFzb3IgID0gcmVxdWlyZSggJy4vcGhhc29yJyApLFxuICAgIGRlZmF1bHRzID0ge1xuICAgICAgdHlwZTondHJpYW5ndWxhcicsIGxlbmd0aDoxMDI0LCBhbHBoYTouMTUsIHNoaWZ0OjAsIHJldmVyc2U6ZmFsc2UgXG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb3BzID0+IHtcbiAgXG4gIGxldCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBwcm9wcyApXG4gIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBwcm9wZXJ0aWVzLmxlbmd0aCApXG5cbiAgbGV0IG5hbWUgPSBwcm9wZXJ0aWVzLnR5cGUgKyAnXycgKyBwcm9wZXJ0aWVzLmxlbmd0aCArICdfJyArIHByb3BlcnRpZXMuc2hpZnQgKyAnXycgKyBwcm9wZXJ0aWVzLnJldmVyc2UgKyAnXycgKyBwcm9wZXJ0aWVzLmFscGhhXG4gIGlmKCB0eXBlb2YgZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdID09PSAndW5kZWZpbmVkJyApIHsgXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IHdpbmRvd3NbIHByb3BlcnRpZXMudHlwZSBdKCBwcm9wZXJ0aWVzLmxlbmd0aCwgaSwgcHJvcGVydGllcy5hbHBoYSwgcHJvcGVydGllcy5zaGlmdCApXG4gICAgfVxuXG4gICAgaWYoIHByb3BlcnRpZXMucmV2ZXJzZSA9PT0gdHJ1ZSApIHsgXG4gICAgICBidWZmZXIucmV2ZXJzZSgpXG4gICAgfVxuICAgIGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSA9IGRhdGEoIGJ1ZmZlciApXG4gIH1cblxuICBsZXQgdWdlbiA9IGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSBcbiAgdWdlbi5uYW1lID0gJ2VudicgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZXEnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IHRoaXMuaW5wdXRzWzBdID09PSB0aGlzLmlucHV0c1sxXSA/IDEgOiBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSA9PT0gJHtpbnB1dHNbMV19KSB8IDBcXG5cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfWAsIG91dCBdXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgaW4yICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZXhwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBpc1dvcmtsZXQgPyAnTWF0aC5leHAnIDogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWV4cCggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5leHAoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBleHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZXhwLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGV4cFxufVxuIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxOCBHb29nbGUgTExDXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTsgeW91IG1heSBub3RcbiAqIHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS4gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mXG4gKiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsIFdJVEhPVVRcbiAqIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC4gU2VlIHRoZVxuICogTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXJcbiAqIHRoZSBMaWNlbnNlLlxuICovXG5cbi8vIG9yaWdpbmFsbHkgZnJvbTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9Hb29nbGVDaHJvbWVMYWJzL2F1ZGlvd29ya2xldC1wb2x5ZmlsbFxuLy8gSSBhbSBtb2RpZnlpbmcgaXQgdG8gYWNjZXB0IHZhcmlhYmxlIGJ1ZmZlciBzaXplc1xuLy8gYW5kIHRvIGdldCByaWQgb2Ygc29tZSBzdHJhbmdlIGdsb2JhbCBpbml0aWFsaXphdGlvbiB0aGF0IHNlZW1zIHJlcXVpcmVkIHRvIHVzZSBpdFxuLy8gd2l0aCBicm93c2VyaWZ5LiBBbHNvLCBJIGFkZGVkIGNoYW5nZXMgdG8gZml4IGEgYnVnIGluIFNhZmFyaSBmb3IgdGhlIEF1ZGlvV29ya2xldFByb2Nlc3NvclxuLy8gcHJvcGVydHkgbm90IGhhdmluZyBhIHByb3RvdHlwZSAoc2VlOmh0dHBzOi8vZ2l0aHViLmNvbS9Hb29nbGVDaHJvbWVMYWJzL2F1ZGlvd29ya2xldC1wb2x5ZmlsbC9wdWxsLzI1KVxuLy8gVE9ETzogV2h5IGlzIHRoZXJlIGFuIGlmcmFtZSBpbnZvbHZlZD8gKHJlYWxtLmpzKVxuXG5jb25zdCBSZWFsbSA9IHJlcXVpcmUoICcuL3JlYWxtLmpzJyApXG5cbmNvbnN0IEFXUEYgPSBmdW5jdGlvbiggc2VsZiA9IHdpbmRvdywgYnVmZmVyU2l6ZSA9IDQwOTYgKSB7XG4gIGNvbnN0IFBBUkFNUyA9IFtdXG4gIGxldCBuZXh0UG9ydFxuXG4gIGlmICh0eXBlb2YgQXVkaW9Xb3JrbGV0Tm9kZSAhPT0gJ2Z1bmN0aW9uJyB8fCAhKFwiYXVkaW9Xb3JrbGV0XCIgaW4gQXVkaW9Db250ZXh0LnByb3RvdHlwZSkpIHtcbiAgICBzZWxmLkF1ZGlvV29ya2xldE5vZGUgPSBmdW5jdGlvbiBBdWRpb1dvcmtsZXROb2RlIChjb250ZXh0LCBuYW1lLCBvcHRpb25zKSB7XG4gICAgICBjb25zdCBwcm9jZXNzb3IgPSBnZXRQcm9jZXNzb3JzRm9yQ29udGV4dChjb250ZXh0KVtuYW1lXTtcbiAgICAgIGNvbnN0IG91dHB1dENoYW5uZWxzID0gb3B0aW9ucyAmJiBvcHRpb25zLm91dHB1dENoYW5uZWxDb3VudCA/IG9wdGlvbnMub3V0cHV0Q2hhbm5lbENvdW50WzBdIDogMjtcbiAgICAgIGNvbnN0IHNjcmlwdFByb2Nlc3NvciA9IGNvbnRleHQuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCBidWZmZXJTaXplLCAyLCBvdXRwdXRDaGFubmVscyk7XG5cbiAgICAgIHNjcmlwdFByb2Nlc3Nvci5wYXJhbWV0ZXJzID0gbmV3IE1hcCgpO1xuICAgICAgaWYgKHByb2Nlc3Nvci5wcm9wZXJ0aWVzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvY2Vzc29yLnByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBwcm9wID0gcHJvY2Vzc29yLnByb3BlcnRpZXNbaV07XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpLmdhaW47XG4gICAgICAgICAgbm9kZS52YWx1ZSA9IHByb3AuZGVmYXVsdFZhbHVlO1xuICAgICAgICAgIC8vIEBUT0RPIHRoZXJlJ3Mgbm8gZ29vZCB3YXkgdG8gY29uc3RydWN0IHRoZSBwcm94eSBBdWRpb1BhcmFtIGhlcmVcbiAgICAgICAgICBzY3JpcHRQcm9jZXNzb3IucGFyYW1ldGVycy5zZXQocHJvcC5uYW1lLCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBtYyA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgbmV4dFBvcnQgPSBtYy5wb3J0MjtcbiAgICAgIGNvbnN0IGluc3QgPSBuZXcgcHJvY2Vzc29yLlByb2Nlc3NvcihvcHRpb25zIHx8IHt9KTtcbiAgICAgIG5leHRQb3J0ID0gbnVsbDtcblxuICAgICAgc2NyaXB0UHJvY2Vzc29yLnBvcnQgPSBtYy5wb3J0MTtcbiAgICAgIHNjcmlwdFByb2Nlc3Nvci5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgICBzY3JpcHRQcm9jZXNzb3IuaW5zdGFuY2UgPSBpbnN0O1xuICAgICAgc2NyaXB0UHJvY2Vzc29yLm9uYXVkaW9wcm9jZXNzID0gb25BdWRpb1Byb2Nlc3M7XG4gICAgICByZXR1cm4gc2NyaXB0UHJvY2Vzc29yO1xuICAgIH07XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoKHNlbGYuQXVkaW9Db250ZXh0IHx8IHNlbGYud2Via2l0QXVkaW9Db250ZXh0KS5wcm90b3R5cGUsICdhdWRpb1dvcmtsZXQnLCB7XG4gICAgICBnZXQgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kJGF1ZGlvV29ya2xldCB8fCAodGhpcy4kJGF1ZGlvV29ya2xldCA9IG5ldyBzZWxmLkF1ZGlvV29ya2xldCh0aGlzKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvKiBYWFggLSBBRERFRCBUTyBPVkVSQ09NRSBQUk9CTEVNIElOIFNBRkFSSSBXSEVSRSBBVURJT1dPUktMRVRQUk9DRVNTT1IgUFJPVE9UWVBFIElTIE5PVCBBTiBPQkpFQ1QgKi9cbiAgICBjb25zdCBBdWRpb1dvcmtsZXRQcm9jZXNzb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucG9ydCA9IG5leHRQb3J0XG4gICAgfVxuICAgIEF1ZGlvV29ya2xldFByb2Nlc3Nvci5wcm90b3R5cGUgPSB7fVxuXG4gICAgc2VsZi5BdWRpb1dvcmtsZXQgPSBjbGFzcyBBdWRpb1dvcmtsZXQge1xuICAgICAgY29uc3RydWN0b3IgKGF1ZGlvQ29udGV4dCkge1xuICAgICAgICB0aGlzLiQkY29udGV4dCA9IGF1ZGlvQ29udGV4dDtcbiAgICAgIH1cblxuICAgICAgYWRkTW9kdWxlICh1cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGZldGNoKHVybCkudGhlbihyID0+IHtcbiAgICAgICAgICBpZiAoIXIub2spIHRocm93IEVycm9yKHIuc3RhdHVzKTtcbiAgICAgICAgICByZXR1cm4gci50ZXh0KCk7XG4gICAgICAgIH0pLnRoZW4oIGNvZGUgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgICAgICBzYW1wbGVSYXRlOiB0aGlzLiQkY29udGV4dC5zYW1wbGVSYXRlLFxuICAgICAgICAgICAgY3VycmVudFRpbWU6IHRoaXMuJCRjb250ZXh0LmN1cnJlbnRUaW1lLFxuICAgICAgICAgICAgQXVkaW9Xb3JrbGV0UHJvY2Vzc29yLFxuICAgICAgICAgICAgcmVnaXN0ZXJQcm9jZXNzb3I6IChuYW1lLCBQcm9jZXNzb3IpID0+IHtcbiAgICAgICAgICAgICAgY29uc3QgcHJvY2Vzc29ycyA9IGdldFByb2Nlc3NvcnNGb3JDb250ZXh0KHRoaXMuJCRjb250ZXh0KTtcbiAgICAgICAgICAgICAgcHJvY2Vzc29yc1tuYW1lXSA9IHtcbiAgICAgICAgICAgICAgICByZWFsbSxcbiAgICAgICAgICAgICAgICBjb250ZXh0LFxuICAgICAgICAgICAgICAgIFByb2Nlc3NvcixcbiAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiBQcm9jZXNzb3IucGFyYW1ldGVyRGVzY3JpcHRvcnMgfHwgW11cbiAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuXG4gICAgICAgICAgY29udGV4dC5zZWxmID0gY29udGV4dDtcbiAgICAgICAgICBjb25zdCByZWFsbSA9IG5ldyBSZWFsbShjb250ZXh0LCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpO1xuICAgICAgICAgIHJlYWxtLmV4ZWMoKChvcHRpb25zICYmIG9wdGlvbnMudHJhbnNwaWxlKSB8fCBTdHJpbmcpKGNvZGUpKTtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uQXVkaW9Qcm9jZXNzIChlKSB7XG4gICAgY29uc3QgcGFyYW1ldGVycyA9IHt9O1xuICAgIGxldCBpbmRleCA9IC0xO1xuICAgIHRoaXMucGFyYW1ldGVycy5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICBjb25zdCBhcnIgPSBQQVJBTVNbKytpbmRleF0gfHwgKFBBUkFNU1tpbmRleF0gPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuYnVmZmVyU2l6ZSkpO1xuICAgICAgLy8gQFRPRE8gcHJvcGVyIHZhbHVlcyBoZXJlIGlmIHBvc3NpYmxlXG4gICAgICBhcnIuZmlsbCh2YWx1ZS52YWx1ZSk7XG4gICAgICBwYXJhbWV0ZXJzW2tleV0gPSBhcnI7XG4gICAgfSk7XG4gICAgdGhpcy5wcm9jZXNzb3IucmVhbG0uZXhlYyhcbiAgICAgICdzZWxmLnNhbXBsZVJhdGU9c2FtcGxlUmF0ZT0nICsgdGhpcy5jb250ZXh0LnNhbXBsZVJhdGUgKyAnOycgK1xuICAgICAgJ3NlbGYuY3VycmVudFRpbWU9Y3VycmVudFRpbWU9JyArIHRoaXMuY29udGV4dC5jdXJyZW50VGltZVxuICAgICk7XG4gICAgY29uc3QgaW5wdXRzID0gY2hhbm5lbFRvQXJyYXkoZS5pbnB1dEJ1ZmZlcik7XG4gICAgY29uc3Qgb3V0cHV0cyA9IGNoYW5uZWxUb0FycmF5KGUub3V0cHV0QnVmZmVyKTtcbiAgICB0aGlzLmluc3RhbmNlLnByb2Nlc3MoW2lucHV0c10sIFtvdXRwdXRzXSwgcGFyYW1ldGVycyk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGFubmVsVG9BcnJheSAoY2gpIHtcbiAgICBjb25zdCBvdXQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNoLm51bWJlck9mQ2hhbm5lbHM7IGkrKykge1xuICAgICAgb3V0W2ldID0gY2guZ2V0Q2hhbm5lbERhdGEoaSk7XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRQcm9jZXNzb3JzRm9yQ29udGV4dCAoYXVkaW9Db250ZXh0KSB7XG4gICAgcmV0dXJuIGF1ZGlvQ29udGV4dC4kJHByb2Nlc3NvcnMgfHwgKGF1ZGlvQ29udGV4dC4kJHByb2Nlc3NvcnMgPSB7fSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBBV1BGXG4iLCIvKipcbiAqIENvcHlyaWdodCAyMDE4IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdFxuICogdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2ZcbiAqIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVFxuICogV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlXG4gKiBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlclxuICogdGhlIExpY2Vuc2UuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBSZWFsbSAoc2NvcGUsIHBhcmVudEVsZW1lbnQpIHtcbiAgY29uc3QgZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgZnJhbWUuc3R5bGUuY3NzVGV4dCA9ICdwb3NpdGlvbjphYnNvbHV0ZTtsZWZ0OjA7dG9wOi05OTlweDt3aWR0aDoxcHg7aGVpZ2h0OjFweDsnO1xuICBwYXJlbnRFbGVtZW50LmFwcGVuZENoaWxkKGZyYW1lKTtcbiAgY29uc3Qgd2luID0gZnJhbWUuY29udGVudFdpbmRvdztcbiAgY29uc3QgZG9jID0gd2luLmRvY3VtZW50O1xuICBsZXQgdmFycyA9ICd2YXIgd2luZG93LCRob29rJztcbiAgZm9yIChjb25zdCBpIGluIHdpbikge1xuICAgIGlmICghKGkgaW4gc2NvcGUpICYmIGkgIT09ICdldmFsJykge1xuICAgICAgdmFycyArPSAnLCc7XG4gICAgICB2YXJzICs9IGk7XG4gICAgfVxuICB9XG4gIGZvciAoY29uc3QgaSBpbiBzY29wZSkge1xuICAgIHZhcnMgKz0gJywnO1xuICAgIHZhcnMgKz0gaTtcbiAgICB2YXJzICs9ICc9c2VsZi4nO1xuICAgIHZhcnMgKz0gaTtcbiAgfVxuICBjb25zdCBzY3JpcHQgPSBkb2MuY3JlYXRlRWxlbWVudCgnc2NyaXB0Jyk7XG4gIHNjcmlwdC5hcHBlbmRDaGlsZChkb2MuY3JlYXRlVGV4dE5vZGUoXG4gICAgYGZ1bmN0aW9uICRob29rKHNlbGYsY29uc29sZSkge1widXNlIHN0cmljdFwiO1xuICAgICAgICAke3ZhcnN9O3JldHVybiBmdW5jdGlvbigpIHtyZXR1cm4gZXZhbChhcmd1bWVudHNbMF0pfX1gXG4gICkpO1xuICBkb2MuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xuICB0aGlzLmV4ZWMgPSB3aW4uJGhvb2suY2FsbChzY29wZSwgc2NvcGUsIGNvbnNvbGUpO1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2Zsb29yJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgLy9nZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5mbG9vciB9KVxuXG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gfCAwIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdIHwgMFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGZsb29yID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGZsb29yLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGZsb29yXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2ZvbGQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9IHRoaXMuY3JlYXRlQ2FsbGJhY2soIGlucHV0c1swXSwgdGhpcy5taW4sIHRoaXMubWF4ICkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIG91dCBdXG4gIH0sXG5cbiAgY3JlYXRlQ2FsbGJhY2soIHYsIGxvLCBoaSApIHtcbiAgICBsZXQgb3V0ID1cbmAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dn0sXG4gICAgICAke3RoaXMubmFtZX1fcmFuZ2UgPSAke2hpfSAtICR7bG99LFxuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gMFxuXG4gIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA+PSAke2hpfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcysrXG4gIH0gZWxzZSBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgJHt0aGlzLm5hbWV9X3ZhbHVlICs9ICR7dGhpcy5uYW1lfV9yYW5nZVxuICAgIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA8ICR7bG99KXtcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9ICgoJHt0aGlzLm5hbWV9X3ZhbHVlIC0gJHtsb30pIC8gJHt0aGlzLm5hbWV9X3JhbmdlLSAxKSB8IDBcbiAgICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2UgKiAke3RoaXMubmFtZX1fbnVtV3JhcHNcbiAgICB9XG4gICAgJHt0aGlzLm5hbWV9X251bVdyYXBzLS1cbiAgfVxuICBpZigke3RoaXMubmFtZX1fbnVtV3JhcHMgJiAxKSAke3RoaXMubmFtZX1fdmFsdWUgPSAke2hpfSArICR7bG99IC0gJHt0aGlzLm5hbWV9X3ZhbHVlXG5gXG4gICAgcmV0dXJuICcgJyArIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidnYXRlJyxcbiAgY29udHJvbFN0cmluZzpudWxsLCAvLyBpbnNlcnQgaW50byBvdXRwdXQgY29kZWdlbiBmb3IgZGV0ZXJtaW5pbmcgaW5kZXhpbmdcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuICAgIFxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgbGV0IGxhc3RJbnB1dE1lbW9yeUlkeCA9ICdtZW1vcnlbICcgKyB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgJyBdJyxcbiAgICAgICAgb3V0cHV0TWVtb3J5U3RhcnRJZHggPSB0aGlzLm1lbW9yeS5sYXN0SW5wdXQuaWR4ICsgMSxcbiAgICAgICAgaW5wdXRTaWduYWwgPSBpbnB1dHNbMF0sXG4gICAgICAgIGNvbnRyb2xTaWduYWwgPSBpbnB1dHNbMV1cbiAgICBcbiAgICAvKiBcbiAgICAgKiB3ZSBjaGVjayB0byBzZWUgaWYgdGhlIGN1cnJlbnQgY29udHJvbCBpbnB1dHMgZXF1YWxzIG91ciBsYXN0IGlucHV0XG4gICAgICogaWYgc28sIHdlIHN0b3JlIHRoZSBzaWduYWwgaW5wdXQgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGN1cnJlbnRseVxuICAgICAqIHNlbGVjdGVkIGluZGV4LiBJZiBub3QsIHdlIHB1dCAwIGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBsYXN0IHNlbGVjdGVkIGluZGV4LFxuICAgICAqIGNoYW5nZSB0aGUgc2VsZWN0ZWQgaW5kZXgsIGFuZCB0aGVuIHN0b3JlIHRoZSBzaWduYWwgaW4gcHV0IGluIHRoZSBtZW1lcnkgYXNzb2ljYXRlZFxuICAgICAqIHdpdGggdGhlIG5ld2x5IHNlbGVjdGVkIGluZGV4XG4gICAgICovXG4gICAgXG4gICAgb3V0ID1cblxuYCBpZiggJHtjb250cm9sU2lnbmFsfSAhPT0gJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICkge1xuICAgIG1lbW9yeVsgJHtsYXN0SW5wdXRNZW1vcnlJZHh9ICsgJHtvdXRwdXRNZW1vcnlTdGFydElkeH0gIF0gPSAwIFxuICAgICR7bGFzdElucHV0TWVtb3J5SWR4fSA9ICR7Y29udHJvbFNpZ25hbH1cbiAgfVxuICBtZW1vcnlbICR7b3V0cHV0TWVtb3J5U3RhcnRJZHh9ICsgJHtjb250cm9sU2lnbmFsfSBdID0gJHtpbnB1dFNpZ25hbH1cblxuYFxuICAgIHRoaXMuY29udHJvbFN0cmluZyA9IGlucHV0c1sxXVxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHRoaXMub3V0cHV0cy5mb3JFYWNoKCB2ID0+IHYuZ2VuKCkgKVxuXG4gICAgcmV0dXJuIFsgbnVsbCwgJyAnICsgb3V0IF1cbiAgfSxcblxuICBjaGlsZGdlbigpIHtcbiAgICBpZiggdGhpcy5wYXJlbnQuaW5pdGlhbGl6ZWQgPT09IGZhbHNlICkge1xuICAgICAgZ2VuLmdldElucHV0cyggdGhpcyApIC8vIHBhcmVudCBnYXRlIGlzIG9ubHkgaW5wdXQgb2YgYSBnYXRlIG91dHB1dCwgc2hvdWxkIG9ubHkgYmUgZ2VuJ2Qgb25jZS5cbiAgICB9XG5cbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMubmFtZSBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuICBgbWVtb3J5WyAke3RoaXMubWVtb3J5LnZhbHVlLmlkeH0gXWBcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggY29udHJvbCwgaW4xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY291bnQ6IDIgfVxuXG4gIGlmKCB0eXBlb2YgcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICBvdXRwdXRzOiBbXSxcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGNvbnRyb2wgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGxhc3RJbnB1dDogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgIH0sXG4gICAgaW5pdGlhbGl6ZWQ6ZmFsc2VcbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke2dlbi5nZXRVSUQoKX1gXG5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB1Z2VuLmNvdW50OyBpKysgKSB7XG4gICAgdWdlbi5vdXRwdXRzLnB1c2goe1xuICAgICAgaW5kZXg6aSxcbiAgICAgIGdlbjogcHJvdG8uY2hpbGRnZW4sXG4gICAgICBwYXJlbnQ6dWdlbixcbiAgICAgIGlucHV0czogWyB1Z2VuIF0sXG4gICAgICBtZW1vcnk6IHtcbiAgICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICAgIH0sXG4gICAgICBpbml0aWFsaXplZDpmYWxzZSxcbiAgICAgIG5hbWU6IGAke3VnZW4ubmFtZX1fb3V0JHtnZW4uZ2V0VUlEKCl9YFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qIGdlbi5qc1xuICpcbiAqIGxvdy1sZXZlbCBjb2RlIGdlbmVyYXRpb24gZm9yIHVuaXQgZ2VuZXJhdG9yc1xuICpcbiAqL1xuY29uc3QgTWVtb3J5SGVscGVyID0gcmVxdWlyZSggJ21lbW9yeS1oZWxwZXInIClcbmNvbnN0IEVFID0gcmVxdWlyZSggJ2V2ZW50cycgKS5FdmVudEVtaXR0ZXJcblxuY29uc3QgZ2VuID0ge1xuXG4gIGFjY3VtOjAsXG4gIGdldFVJRCgpIHsgcmV0dXJuIHRoaXMuYWNjdW0rKyB9LFxuICBkZWJ1ZzpmYWxzZSxcbiAgc2FtcGxlcmF0ZTogNDQxMDAsIC8vIGNoYW5nZSBvbiBhdWRpb2NvbnRleHQgY3JlYXRpb25cbiAgc2hvdWxkTG9jYWxpemU6IGZhbHNlLFxuICBncmFwaDpudWxsLFxuICBnbG9iYWxzOntcbiAgICB3aW5kb3dzOiB7fSxcbiAgfSxcbiAgbW9kZTond29ya2xldCcsXG4gIFxuICAvKiBjbG9zdXJlc1xuICAgKlxuICAgKiBGdW5jdGlvbnMgdGhhdCBhcmUgaW5jbHVkZWQgYXMgYXJndW1lbnRzIHRvIG1hc3RlciBjYWxsYmFjay4gRXhhbXBsZXM6IE1hdGguYWJzLCBNYXRoLnJhbmRvbSBldGMuXG4gICAqIFhYWCBTaG91bGQgcHJvYmFibHkgYmUgcmVuYW1lZCBjYWxsYmFja1Byb3BlcnRpZXMgb3Igc29tZXRoaW5nIHNpbWlsYXIuLi4gY2xvc3VyZXMgYXJlIG5vIGxvbmdlciB1c2VkLlxuICAgKi9cblxuICBjbG9zdXJlczogbmV3IFNldCgpLFxuICBwYXJhbXM6ICAgbmV3IFNldCgpLFxuICBpbnB1dHM6ICAgbmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6IG5ldyBTZXQoKSxcbiAgZW5kQmxvY2s6IG5ldyBTZXQoKSxcbiAgaGlzdG9yaWVzOiBuZXcgTWFwKCksXG5cbiAgbWVtbzoge30sXG5cbiAgLy9kYXRhOiB7fSxcbiAgXG4gIC8qIGV4cG9ydFxuICAgKlxuICAgKiBwbGFjZSBnZW4gZnVuY3Rpb25zIGludG8gYW5vdGhlciBvYmplY3QgZm9yIGVhc2llciByZWZlcmVuY2VcbiAgICovXG5cbiAgZXhwb3J0KCBvYmogKSB7fSxcblxuICBhZGRUb0VuZEJsb2NrKCB2ICkge1xuICAgIHRoaXMuZW5kQmxvY2suYWRkKCAnICAnICsgdiApXG4gIH0sXG4gIFxuICByZXF1ZXN0TWVtb3J5KCBtZW1vcnlTcGVjLCBpbW11dGFibGU9ZmFsc2UgKSB7XG4gICAgZm9yKCBsZXQga2V5IGluIG1lbW9yeVNwZWMgKSB7XG4gICAgICBsZXQgcmVxdWVzdCA9IG1lbW9yeVNwZWNbIGtleSBdXG5cbiAgICAgIC8vY29uc29sZS5sb2coICdyZXF1ZXN0aW5nICcgKyBrZXkgKyAnOicgLCBKU09OLnN0cmluZ2lmeSggcmVxdWVzdCApIClcblxuICAgICAgaWYoIHJlcXVlc3QubGVuZ3RoID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAndW5kZWZpbmVkIGxlbmd0aCBmb3I6Jywga2V5IClcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmlkeCA9IGdlbi5tZW1vcnkuYWxsb2MoIHJlcXVlc3QubGVuZ3RoLCBpbW11dGFibGUgKVxuICAgIH1cbiAgfSxcblxuICBjcmVhdGVNZW1vcnkoIGFtb3VudD00MDk2LCB0eXBlICkge1xuICAgIGNvbnN0IG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIGFtb3VudCwgdHlwZSApXG4gICAgcmV0dXJuIG1lbVxuICB9LFxuXG4gIGNyZWF0ZUNhbGxiYWNrKCB1Z2VuLCBtZW0sIGRlYnVnID0gZmFsc2UsIHNob3VsZElubGluZU1lbW9yeT1mYWxzZSwgbWVtVHlwZSA9IEZsb2F0NjRBcnJheSApIHtcbiAgICBsZXQgaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCB1Z2VuICkgJiYgdWdlbi5sZW5ndGggPiAxLFxuICAgICAgICBjYWxsYmFjaywgXG4gICAgICAgIGNoYW5uZWwxLCBjaGFubmVsMlxuXG4gICAgaWYoIHR5cGVvZiBtZW0gPT09ICdudW1iZXInIHx8IG1lbSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgdGhpcy5tZW1vcnkgPSB0aGlzLmNyZWF0ZU1lbW9yeSggbWVtLCBtZW1UeXBlIClcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMubWVtb3J5ID0gbWVtXG4gICAgfVxuICAgIFxuICAgIHRoaXMub3V0cHV0SWR4ID0gdGhpcy5tZW1vcnkuYWxsb2MoIDIsIHRydWUgKVxuICAgIHRoaXMuZW1pdCggJ21lbW9yeSBpbml0JyApXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnY2IgbWVtb3J5OicsIG1lbSApXG4gICAgdGhpcy5ncmFwaCA9IHVnZW5cbiAgICB0aGlzLm1lbW8gPSB7fSBcbiAgICB0aGlzLmVuZEJsb2NrLmNsZWFyKClcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKClcbiAgICB0aGlzLmlucHV0cy5jbGVhcigpXG4gICAgdGhpcy5wYXJhbXMuY2xlYXIoKVxuICAgIHRoaXMuZ2xvYmFscyA9IHsgd2luZG93czp7fSB9XG4gICAgXG4gICAgdGhpcy5wYXJhbWV0ZXJzLmNsZWFyKClcbiAgICBcbiAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IFwiICAndXNlIHN0cmljdCdcXG5cIlxuICAgIGlmKCBzaG91bGRJbmxpbmVNZW1vcnk9PT1mYWxzZSApIHtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnID8gXG4gICAgICAgIFwiICB2YXIgbWVtb3J5ID0gdGhpcy5tZW1vcnlcXG5cXG5cIiA6XG4gICAgICAgIFwiICB2YXIgbWVtb3J5ID0gZ2VuLm1lbW9yeVxcblxcblwiXG4gICAgfVxuXG4gICAgLy8gY2FsbCAuZ2VuKCkgb24gdGhlIGhlYWQgb2YgdGhlIGdyYXBoIHdlIGFyZSBnZW5lcmF0aW5nIHRoZSBjYWxsYmFjayBmb3JcbiAgICAvL2NvbnNvbGUubG9nKCAnSEVBRCcsIHVnZW4gKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgMSArIGlzU3RlcmVvOyBpKysgKSB7XG4gICAgICBpZiggdHlwZW9mIHVnZW5baV0gPT09ICdudW1iZXInICkgY29udGludWVcblxuICAgICAgLy9sZXQgY2hhbm5lbCA9IGlzU3RlcmVvID8gdWdlbltpXS5nZW4oKSA6IHVnZW4uZ2VuKCksXG4gICAgICBsZXQgY2hhbm5lbCA9IGlzU3RlcmVvID8gdGhpcy5nZXRJbnB1dCggdWdlbltpXSApIDogdGhpcy5nZXRJbnB1dCggdWdlbiApLCBcbiAgICAgICAgICBib2R5ID0gJydcblxuICAgICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgICAgYm9keSArPSBBcnJheS5pc0FycmF5KCBjaGFubmVsICkgPyBjaGFubmVsWzFdICsgJ1xcbicgKyBjaGFubmVsWzBdIDogY2hhbm5lbFxuXG4gICAgICAvLyBzcGxpdCBib2R5IHRvIGluamVjdCByZXR1cm4ga2V5d29yZCBvbiBsYXN0IGxpbmVcbiAgICAgIGJvZHkgPSBib2R5LnNwbGl0KCdcXG4nKVxuICAgICBcbiAgICAgIC8vaWYoIGRlYnVnICkgY29uc29sZS5sb2coICdmdW5jdGlvbkJvZHkgbGVuZ3RoJywgYm9keSApXG4gICAgICBcbiAgICAgIC8vIG5leHQgbGluZSBpcyB0byBhY2NvbW1vZGF0ZSBtZW1vIGFzIGdyYXBoIGhlYWRcbiAgICAgIGlmKCBib2R5WyBib2R5Lmxlbmd0aCAtMSBdLnRyaW0oKS5pbmRleE9mKCdsZXQnKSA+IC0xICkgeyBib2R5LnB1c2goICdcXG4nICkgfSBcblxuICAgICAgLy8gZ2V0IGluZGV4IG9mIGxhc3QgbGluZVxuICAgICAgbGV0IGxhc3RpZHggPSBib2R5Lmxlbmd0aCAtIDFcblxuICAgICAgLy8gaW5zZXJ0IHJldHVybiBrZXl3b3JkXG4gICAgICBib2R5WyBsYXN0aWR4IF0gPSAnICBtZW1vcnlbJyArICh0aGlzLm91dHB1dElkeCArIGkpICsgJ10gID0gJyArIGJvZHlbIGxhc3RpZHggXSArICdcXG4nXG5cbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGJvZHkuam9pbignXFxuJylcbiAgICB9XG4gICAgXG4gICAgdGhpcy5oaXN0b3JpZXMuZm9yRWFjaCggdmFsdWUgPT4ge1xuICAgICAgaWYoIHZhbHVlICE9PSBudWxsIClcbiAgICAgICAgdmFsdWUuZ2VuKCkgICAgICBcbiAgICB9KVxuXG4gICAgY29uc3QgcmV0dXJuU3RhdGVtZW50ID0gaXNTdGVyZW8gPyBgICByZXR1cm4gWyBtZW1vcnlbJHt0aGlzLm91dHB1dElkeH1dLCBtZW1vcnlbJHt0aGlzLm91dHB1dElkeCArIDF9XSBdYCA6IGAgIHJldHVybiBtZW1vcnlbJHt0aGlzLm91dHB1dElkeH1dYFxuICAgIFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpXG5cbiAgICBpZiggdGhpcy5lbmRCbG9jay5zaXplICkgeyBcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuY29uY2F0KCBBcnJheS5mcm9tKCB0aGlzLmVuZEJsb2NrICkgKVxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2goIHJldHVyblN0YXRlbWVudCApXG4gICAgfVxuICAgIC8vIHJlYXNzZW1ibGUgZnVuY3Rpb24gYm9keVxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuam9pbignXFxuJylcblxuICAgIC8vIHdlIGNhbiBvbmx5IGR5bmFtaWNhbGx5IGNyZWF0ZSBhIG5hbWVkIGZ1bmN0aW9uIGJ5IGR5bmFtaWNhbGx5IGNyZWF0aW5nIGFub3RoZXIgZnVuY3Rpb25cbiAgICAvLyB0byBjb25zdHJ1Y3QgdGhlIG5hbWVkIGZ1bmN0aW9uISBzaGVlc2guLi5cbiAgICAvL1xuICAgIGlmKCBzaG91bGRJbmxpbmVNZW1vcnkgPT09IHRydWUgKSB7XG4gICAgICB0aGlzLnBhcmFtZXRlcnMuYWRkKCAnbWVtb3J5JyApXG4gICAgfVxuXG4gICAgbGV0IHBhcmFtU3RyaW5nID0gJydcbiAgICBpZiggdGhpcy5tb2RlID09PSAnd29ya2xldCcgKSB7XG4gICAgICBmb3IoIGxldCBuYW1lIG9mIHRoaXMucGFyYW1ldGVycy52YWx1ZXMoKSApIHtcbiAgICAgICAgcGFyYW1TdHJpbmcgKz0gbmFtZSArICcsJ1xuICAgICAgfVxuICAgICAgcGFyYW1TdHJpbmcgPSBwYXJhbVN0cmluZy5zbGljZSgwLC0xKVxuICAgIH1cblxuICAgIGNvbnN0IHNlcGFyYXRvciA9IHRoaXMucGFyYW1ldGVycy5zaXplICE9PSAwICYmIHRoaXMuaW5wdXRzLnNpemUgPiAwID8gJywgJyA6ICcnXG5cbiAgICBsZXQgaW5wdXRTdHJpbmcgPSAnJ1xuICAgIGlmKCB0aGlzLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgIGZvciggbGV0IHVnZW4gb2YgdGhpcy5pbnB1dHMudmFsdWVzKCkgKSB7XG4gICAgICAgIGlucHV0U3RyaW5nICs9IHVnZW4ubmFtZSArICcsJ1xuICAgICAgfVxuICAgICAgaW5wdXRTdHJpbmcgPSBpbnB1dFN0cmluZy5zbGljZSgwLC0xKVxuICAgIH1cblxuICAgIGxldCBidWlsZFN0cmluZyA9IHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgICA/IGByZXR1cm4gZnVuY3Rpb24oICR7aW5wdXRTdHJpbmd9ICR7c2VwYXJhdG9yfSAke3BhcmFtU3RyaW5nfSApeyBcXG4keyB0aGlzLmZ1bmN0aW9uQm9keSB9XFxufWBcbiAgICAgIDogYHJldHVybiBmdW5jdGlvbiBnZW4oICR7IFsuLi50aGlzLnBhcmFtZXRlcnNdLmpvaW4oJywnKSB9ICl7IFxcbiR7IHRoaXMuZnVuY3Rpb25Cb2R5IH1cXG59YFxuICAgIFxuICAgIGlmKCB0aGlzLmRlYnVnIHx8IGRlYnVnICkgY29uc29sZS5sb2coIGJ1aWxkU3RyaW5nICkgXG5cbiAgICBjYWxsYmFjayA9IG5ldyBGdW5jdGlvbiggYnVpbGRTdHJpbmcgKSgpXG5cbiAgICAvLyBhc3NpZ24gcHJvcGVydGllcyB0byBuYW1lZCBmdW5jdGlvblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5jbG9zdXJlcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB2YWx1ZSA9IGRpY3RbIG5hbWUgXVxuXG4gICAgICBjYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHVnZW4gPSBkaWN0WyBuYW1lIF1cbiAgICAgIFxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBjYWxsYmFjaywgbmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHVnZW4udmFsdWUgfSxcbiAgICAgICAgc2V0KHYpeyB1Z2VuLnZhbHVlID0gdiB9XG4gICAgICB9KVxuICAgICAgLy9jYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICBjYWxsYmFjay5tZW1iZXJzID0gdGhpcy5jbG9zdXJlc1xuICAgIGNhbGxiYWNrLmRhdGEgPSB0aGlzLmRhdGFcbiAgICBjYWxsYmFjay5wYXJhbXMgPSB0aGlzLnBhcmFtc1xuICAgIGNhbGxiYWNrLmlucHV0cyA9IHRoaXMuaW5wdXRzXG4gICAgY2FsbGJhY2sucGFyYW1ldGVycyA9IHRoaXMucGFyYW1ldGVycy8vLnNsaWNlKCAwIClcbiAgICBjYWxsYmFjay5vdXQgPSB0aGlzLm1lbW9yeS5oZWFwLnN1YmFycmF5KCB0aGlzLm91dHB1dElkeCwgdGhpcy5vdXRwdXRJZHggKyAyIClcbiAgICBjYWxsYmFjay5pc1N0ZXJlbyA9IGlzU3RlcmVvXG5cbiAgICAvL2lmKCBNZW1vcnlIZWxwZXIuaXNQcm90b3R5cGVPZiggdGhpcy5tZW1vcnkgKSApIFxuICAgIGNhbGxiYWNrLm1lbW9yeSA9IHRoaXMubWVtb3J5LmhlYXBcblxuICAgIHRoaXMuaGlzdG9yaWVzLmNsZWFyKClcblxuICAgIHJldHVybiBjYWxsYmFja1xuICB9LFxuICBcbiAgLyogZ2V0SW5wdXRzXG4gICAqXG4gICAqIENhbGxlZCBieSBlYWNoIGluZGl2aWR1YWwgdWdlbiB3aGVuIHRoZWlyIC5nZW4oKSBtZXRob2QgaXMgY2FsbGVkIHRvIHJlc29sdmUgdGhlaXIgdmFyaW91cyBpbnB1dHMuXG4gICAqIElmIGFuIGlucHV0IGlzIGEgbnVtYmVyLCByZXR1cm4gdGhlIG51bWJlci4gSWZcbiAgICogaXQgaXMgYW4gdWdlbiwgY2FsbCAuZ2VuKCkgb24gdGhlIHVnZW4sIG1lbW9pemUgdGhlIHJlc3VsdCBhbmQgcmV0dXJuIHRoZSByZXN1bHQuIElmIHRoZVxuICAgKiB1Z2VuIGhhcyBwcmV2aW91c2x5IGJlZW4gbWVtb2l6ZWQgcmV0dXJuIHRoZSBtZW1vaXplZCB2YWx1ZS5cbiAgICpcbiAgICovXG4gIGdldElucHV0cyggdWdlbiApIHtcbiAgICByZXR1cm4gdWdlbi5pbnB1dHMubWFwKCBnZW4uZ2V0SW5wdXQgKSBcbiAgfSxcblxuICBnZXRJbnB1dCggaW5wdXQgKSB7XG4gICAgbGV0IGlzT2JqZWN0ID0gdHlwZW9mIGlucHV0ID09PSAnb2JqZWN0JyxcbiAgICAgICAgcHJvY2Vzc2VkSW5wdXRcblxuICAgIGlmKCBpc09iamVjdCApIHsgLy8gaWYgaW5wdXQgaXMgYSB1Z2VuLi4uIFxuICAgICAgLy9jb25zb2xlLmxvZyggaW5wdXQubmFtZSwgZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApXG4gICAgICBpZiggZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXSApIHsgLy8gaWYgaXQgaGFzIGJlZW4gbWVtb2l6ZWQuLi5cbiAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBnZW4ubWVtb1sgaW5wdXQubmFtZSBdXG4gICAgICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggaW5wdXQgKSApIHtcbiAgICAgICAgZ2VuLmdldElucHV0KCBpbnB1dFswXSApXG4gICAgICAgIGdlbi5nZXRJbnB1dCggaW5wdXRbMV0gKVxuICAgICAgfWVsc2V7IC8vIGlmIG5vdCBtZW1vaXplZCBnZW5lcmF0ZSBjb2RlICBcbiAgICAgICAgaWYoIHR5cGVvZiBpbnB1dC5nZW4gIT09ICdmdW5jdGlvbicgKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coICdubyBnZW4gZm91bmQ6JywgaW5wdXQsIGlucHV0LmdlbiApXG4gICAgICAgICAgaW5wdXQgPSBpbnB1dC5ncmFwaFxuICAgICAgICB9XG4gICAgICAgIGxldCBjb2RlID0gaW5wdXQuZ2VuKClcbiAgICAgICAgLy9pZiggY29kZS5pbmRleE9mKCAnT2JqZWN0JyApID4gLTEgKSBjb25zb2xlLmxvZyggJ2JhZCBpbnB1dDonLCBpbnB1dCwgY29kZSApXG4gICAgICAgIFxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggY29kZSApICkge1xuICAgICAgICAgIGlmKCAhZ2VuLnNob3VsZExvY2FsaXplICkge1xuICAgICAgICAgICAgZ2VuLmZ1bmN0aW9uQm9keSArPSBjb2RlWzFdXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBnZW4uY29kZU5hbWUgPSBjb2RlWzBdXG4gICAgICAgICAgICBnZW4ubG9jYWxpemVkQ29kZS5wdXNoKCBjb2RlWzFdIClcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyggJ2FmdGVyIEdFTicgLCB0aGlzLmZ1bmN0aW9uQm9keSApXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlWzBdXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfWVsc2V7IC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2Nlc3NlZElucHV0XG4gIH0sXG5cbiAgc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXVxuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSB0cnVlXG4gIH0sXG4gIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApIF1cbiAgfSxcblxuICBmcmVlKCBncmFwaCApIHtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggZ3JhcGggKSApIHsgLy8gc3RlcmVvIHVnZW5cbiAgICAgIGZvciggbGV0IGNoYW5uZWwgb2YgZ3JhcGggKSB7XG4gICAgICAgIHRoaXMuZnJlZSggY2hhbm5lbCApXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKCB0eXBlb2YgZ3JhcGggPT09ICdvYmplY3QnICkge1xuICAgICAgICBpZiggZ3JhcGgubWVtb3J5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgZm9yKCBsZXQgbWVtb3J5S2V5IGluIGdyYXBoLm1lbW9yeSApIHtcbiAgICAgICAgICAgIHRoaXMubWVtb3J5LmZyZWUoIGdyYXBoLm1lbW9yeVsgbWVtb3J5S2V5IF0uaWR4IClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGdyYXBoLmlucHV0cyApICkge1xuICAgICAgICAgIGZvciggbGV0IHVnZW4gb2YgZ3JhcGguaW5wdXRzICkge1xuICAgICAgICAgICAgdGhpcy5mcmVlKCB1Z2VuIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuZ2VuLl9fcHJvdG9fXyA9IG5ldyBFRSgpXG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2d0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0pIHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID4gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3QuaW5wdXRzID0gWyB4LHkgXVxuICBndC5uYW1lID0gZ3QuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPj0gJHtpbnB1dHNbMV19IHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID49IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cbiAgZ3QubmFtZSA9ICdndGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCAoICR7aW5wdXRzWzBdfSA+ICR7aW5wdXRzWzFdfSApIHwgMCApIClgIFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoICggaW5wdXRzWzBdID4gaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3RwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGd0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xPTAgKSA9PiB7XG4gIGxldCB1Z2VuID0ge1xuICAgIGlucHV0czogWyBpbjEgXSxcbiAgICBtZW1vcnk6IHsgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IH0sXG4gICAgcmVjb3JkZXI6IG51bGwsXG5cbiAgICBpbiggdiApIHtcbiAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmhhcyggdiApICl7XG4gICAgICAgIGxldCBtZW1vSGlzdG9yeSA9IGdlbi5oaXN0b3JpZXMuZ2V0KCB2IClcbiAgICAgICAgdWdlbi5uYW1lID0gbWVtb0hpc3RvcnkubmFtZVxuICAgICAgICByZXR1cm4gbWVtb0hpc3RvcnlcbiAgICAgIH1cblxuICAgICAgbGV0IG9iaiA9IHtcbiAgICAgICAgZ2VuKCkge1xuICAgICAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB1Z2VuIClcblxuICAgICAgICAgIGlmKCB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IGluMVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHhcbiAgICAgICAgICBcbiAgICAgICAgICBnZW4uYWRkVG9FbmRCbG9jayggJ21lbW9yeVsgJyArIGlkeCArICcgXSA9ICcgKyBpbnB1dHNbIDAgXSApXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICBnZW4uaGlzdG9yaWVzLnNldCggdiwgb2JqIClcblxuICAgICAgICAgIHJldHVybiBpbnB1dHNbIDAgXVxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX2luJytnZW4uZ2V0VUlEKCksXG4gICAgICAgIG1lbW9yeTogdWdlbi5tZW1vcnlcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnB1dHNbIDAgXSA9IHZcbiAgICAgIFxuICAgICAgdWdlbi5yZWNvcmRlciA9IG9ialxuXG4gICAgICByZXR1cm4gb2JqXG4gICAgfSxcbiAgICBcbiAgICBvdXQ6IHtcbiAgICAgICAgICAgIFxuICAgICAgZ2VuKCkge1xuICAgICAgICBpZiggdWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmdldCggdWdlbi5pbnB1dHNbMF0gKSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4uaW5wdXRzWzBdLCB1Z2VuLnJlY29yZGVyIClcbiAgICAgICAgICB9XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gcGFyc2VGbG9hdCggaW4xIClcbiAgICAgICAgfVxuICAgICAgICBsZXQgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4XG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuICdtZW1vcnlbICcgKyBpZHggKyAnIF0gJ1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgdWlkOiBnZW4uZ2V0VUlEKCksXG4gIH1cbiAgXG4gIHVnZW4ub3V0Lm1lbW9yeSA9IHVnZW4ubWVtb3J5IFxuXG4gIHVnZW4ubmFtZSA9ICdoaXN0b3J5JyArIHVnZW4udWlkXG4gIHVnZW4ub3V0Lm5hbWUgPSB1Z2VuLm5hbWUgKyAnX291dCdcbiAgdWdlbi5pbi5fbmFtZSAgPSB1Z2VuLm5hbWUgPSAnX2luJ1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2lmZWxzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb25kaXRpb25hbHMgPSB0aGlzLmlucHV0c1swXSxcbiAgICAgICAgZGVmYXVsdFZhbHVlID0gZ2VuLmdldElucHV0KCBjb25kaXRpb25hbHNbIGNvbmRpdGlvbmFscy5sZW5ndGggLSAxXSApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7ZGVmYXVsdFZhbHVlfVxcbmAgXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnY29uZGl0aW9uYWxzOicsIHRoaXMubmFtZSwgY29uZGl0aW9uYWxzIClcblxuICAgIC8vY29uc29sZS5sb2coICdkZWZhdWx0VmFsdWU6JywgZGVmYXVsdFZhbHVlIClcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgY29uZGl0aW9uYWxzLmxlbmd0aCAtIDI7IGkrPSAyICkge1xuICAgICAgbGV0IGlzRW5kQmxvY2sgPSBpID09PSBjb25kaXRpb25hbHMubGVuZ3RoIC0gMyxcbiAgICAgICAgICBjb25kICA9IGdlbi5nZXRJbnB1dCggY29uZGl0aW9uYWxzWyBpIF0gKSxcbiAgICAgICAgICBwcmVibG9jayA9IGNvbmRpdGlvbmFsc1sgaSsxIF0sXG4gICAgICAgICAgYmxvY2ssIGJsb2NrTmFtZSwgb3V0cHV0XG5cbiAgICAgIC8vY29uc29sZS5sb2coICdwYicsIHByZWJsb2NrIClcblxuICAgICAgaWYoIHR5cGVvZiBwcmVibG9jayA9PT0gJ251bWJlcicgKXtcbiAgICAgICAgYmxvY2sgPSBwcmVibG9ja1xuICAgICAgICBibG9ja05hbWUgPSBudWxsXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoIGdlbi5tZW1vWyBwcmVibG9jay5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAvLyB1c2VkIHRvIHBsYWNlIGFsbCBjb2RlIGRlcGVuZGVuY2llcyBpbiBhcHByb3ByaWF0ZSBibG9ja3NcbiAgICAgICAgICBnZW4uc3RhcnRMb2NhbGl6ZSgpXG5cbiAgICAgICAgICBnZW4uZ2V0SW5wdXQoIHByZWJsb2NrIClcblxuICAgICAgICAgIGJsb2NrID0gZ2VuLmVuZExvY2FsaXplKClcbiAgICAgICAgICBibG9ja05hbWUgPSBibG9ja1swXVxuICAgICAgICAgIGJsb2NrID0gYmxvY2tbIDEgXS5qb2luKCcnKVxuICAgICAgICAgIGJsb2NrID0gJyAgJyArIGJsb2NrLnJlcGxhY2UoIC9cXG4vZ2ksICdcXG4gICcgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBibG9jayA9ICcnXG4gICAgICAgICAgYmxvY2tOYW1lID0gZ2VuLm1lbW9bIHByZWJsb2NrLm5hbWUgXVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG91dHB1dCA9IGJsb2NrTmFtZSA9PT0gbnVsbCA/IFxuICAgICAgICBgICAke3RoaXMubmFtZX1fb3V0ID0gJHtibG9ja31gIDpcbiAgICAgICAgYCR7YmxvY2t9ICAke3RoaXMubmFtZX1fb3V0ID0gJHtibG9ja05hbWV9YFxuICAgICAgXG4gICAgICBpZiggaT09PTAgKSBvdXQgKz0gJyAnXG4gICAgICBvdXQgKz0gXG5gIGlmKCAke2NvbmR9ID09PSAxICkge1xuJHtvdXRwdXR9XG4gIH1gXG5cbiAgICAgIGlmKCAhaXNFbmRCbG9jayApIHtcbiAgICAgICAgb3V0ICs9IGAgZWxzZWBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYFxcbmBcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9X291dGBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1fb3V0YCwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KCBhcmdzWzBdICkgPyBhcmdzWzBdIDogYXJnc1xuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBjb25kaXRpb25zIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonaW4nLFxuXG4gIGdlbigpIHtcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgICBpZiggaXNXb3JrbGV0ICkge1xuICAgICAgZ2VuLmlucHV0cy5hZGQoIHRoaXMgKVxuICAgIH1lbHNle1xuICAgICAgZ2VuLnBhcmFtZXRlcnMuYWRkKCB0aGlzLm5hbWUgKVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlzV29ya2xldCA9PT0gdHJ1ZSA/IHRoaXMubmFtZSArICdbaV0nIDogdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBuYW1lLCBpbnB1dE51bWJlcj0wLCBjaGFubmVsTnVtYmVyPTAsIGRlZmF1bHRWYWx1ZT0wLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCBpbnB1dCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBpbnB1dC5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIGlucHV0Lm5hbWUgPSBuYW1lICE9PSB1bmRlZmluZWQgPyBuYW1lIDogYCR7aW5wdXQuYmFzZW5hbWV9JHtpbnB1dC5pZH1gXG4gIE9iamVjdC5hc3NpZ24oIGlucHV0LCB7IGRlZmF1bHRWYWx1ZSwgbWluLCBtYXgsIGlucHV0TnVtYmVyLCBjaGFubmVsTnVtYmVyIH0pXG5cbiAgaW5wdXRbMF0gPSB7XG4gICAgZ2VuKCkge1xuICAgICAgaWYoICEgZ2VuLnBhcmFtZXRlcnMuaGFzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5hZGQoIGlucHV0Lm5hbWUgKVxuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzBdJ1xuICAgIH1cbiAgfVxuICBpbnB1dFsxXSA9IHtcbiAgICBnZW4oKSB7XG4gICAgICBpZiggISBnZW4ucGFyYW1ldGVycy5oYXMoIGlucHV0Lm5hbWUgKSApIGdlbi5wYXJhbWV0ZXJzLmFkZCggaW5wdXQubmFtZSApXG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMV0nXG4gICAgfVxuICB9XG5cblxuICByZXR1cm4gaW5wdXRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBsaWJyYXJ5ID0ge1xuICBleHBvcnQoIGRlc3RpbmF0aW9uICkge1xuICAgIGlmKCBkZXN0aW5hdGlvbiA9PT0gd2luZG93ICkge1xuICAgICAgZGVzdGluYXRpb24uc3NkID0gbGlicmFyeS5oaXN0b3J5ICAgIC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICAgICAgZGVzdGluYXRpb24uaW5wdXQgPSBsaWJyYXJ5LmluICAgICAgIC8vIGluIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG4gICAgICBkZXN0aW5hdGlvbi50ZXJuYXJ5ID0gbGlicmFyeS5zd2l0Y2ggLy8gc3dpdGNoIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5Lmhpc3RvcnlcbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LmluXG4gICAgICBkZWxldGUgbGlicmFyeS5zd2l0Y2hcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKCBkZXN0aW5hdGlvbiwgbGlicmFyeSApXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGxpYnJhcnksICdzYW1wbGVyYXRlJywge1xuICAgICAgZ2V0KCkgeyByZXR1cm4gbGlicmFyeS5nZW4uc2FtcGxlcmF0ZSB9LFxuICAgICAgc2V0KHYpIHt9XG4gICAgfSlcblxuICAgIGxpYnJhcnkuaW4gPSBkZXN0aW5hdGlvbi5pbnB1dFxuICAgIGxpYnJhcnkuaGlzdG9yeSA9IGRlc3RpbmF0aW9uLnNzZFxuICAgIGxpYnJhcnkuc3dpdGNoID0gZGVzdGluYXRpb24udGVybmFyeVxuXG4gICAgZGVzdGluYXRpb24uY2xpcCA9IGxpYnJhcnkuY2xhbXBcbiAgfSxcblxuICBnZW46ICAgICAgcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICBcbiAgYWJzOiAgICAgIHJlcXVpcmUoICcuL2Ficy5qcycgKSxcbiAgcm91bmQ6ICAgIHJlcXVpcmUoICcuL3JvdW5kLmpzJyApLFxuICBwYXJhbTogICAgcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gIGFkZDogICAgICByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gIHN1YjogICAgICByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gIG11bDogICAgICByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gIGRpdjogICAgICByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gIGFjY3VtOiAgICByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgY291bnRlcjogIHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gIHNpbjogICAgICByZXF1aXJlKCAnLi9zaW4uanMnICksXG4gIGNvczogICAgICByZXF1aXJlKCAnLi9jb3MuanMnICksXG4gIHRhbjogICAgICByZXF1aXJlKCAnLi90YW4uanMnICksXG4gIHRhbmg6ICAgICByZXF1aXJlKCAnLi90YW5oLmpzJyApLFxuICBhc2luOiAgICAgcmVxdWlyZSggJy4vYXNpbi5qcycgKSxcbiAgYWNvczogICAgIHJlcXVpcmUoICcuL2Fjb3MuanMnICksXG4gIGF0YW46ICAgICByZXF1aXJlKCAnLi9hdGFuLmpzJyApLCAgXG4gIHBoYXNvcjogICByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gIHBoYXNvck46ICByZXF1aXJlKCAnLi9waGFzb3JOLmpzJyApLFxuICBkYXRhOiAgICAgcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgcGVlazogICAgIHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gIHBlZWtEeW46ICByZXF1aXJlKCAnLi9wZWVrRHluLmpzJyApLFxuICBjeWNsZTogICAgcmVxdWlyZSggJy4vY3ljbGUuanMnICksXG4gIGN5Y2xlTjogICByZXF1aXJlKCAnLi9jeWNsZU4uanMnICksXG4gIGhpc3Rvcnk6ICByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICBkZWx0YTogICAgcmVxdWlyZSggJy4vZGVsdGEuanMnICksXG4gIGZsb29yOiAgICByZXF1aXJlKCAnLi9mbG9vci5qcycgKSxcbiAgY2VpbDogICAgIHJlcXVpcmUoICcuL2NlaWwuanMnICksXG4gIG1pbjogICAgICByZXF1aXJlKCAnLi9taW4uanMnICksXG4gIG1heDogICAgICByZXF1aXJlKCAnLi9tYXguanMnICksXG4gIHNpZ246ICAgICByZXF1aXJlKCAnLi9zaWduLmpzJyApLFxuICBkY2Jsb2NrOiAgcmVxdWlyZSggJy4vZGNibG9jay5qcycgKSxcbiAgbWVtbzogICAgIHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gIHJhdGU6ICAgICByZXF1aXJlKCAnLi9yYXRlLmpzJyApLFxuICB3cmFwOiAgICAgcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgbWl4OiAgICAgIHJlcXVpcmUoICcuL21peC5qcycgKSxcbiAgY2xhbXA6ICAgIHJlcXVpcmUoICcuL2NsYW1wLmpzJyApLFxuICBwb2tlOiAgICAgcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgZGVsYXk6ICAgIHJlcXVpcmUoICcuL2RlbGF5LmpzJyApLFxuICBmb2xkOiAgICAgcmVxdWlyZSggJy4vZm9sZC5qcycgKSxcbiAgbW9kIDogICAgIHJlcXVpcmUoICcuL21vZC5qcycgKSxcbiAgc2FoIDogICAgIHJlcXVpcmUoICcuL3NhaC5qcycgKSxcbiAgbm9pc2U6ICAgIHJlcXVpcmUoICcuL25vaXNlLmpzJyApLFxuICBub3Q6ICAgICAgcmVxdWlyZSggJy4vbm90LmpzJyApLFxuICBndDogICAgICAgcmVxdWlyZSggJy4vZ3QuanMnICksXG4gIGd0ZTogICAgICByZXF1aXJlKCAnLi9ndGUuanMnICksXG4gIGx0OiAgICAgICByZXF1aXJlKCAnLi9sdC5qcycgKSwgXG4gIGx0ZTogICAgICByZXF1aXJlKCAnLi9sdGUuanMnICksIFxuICBib29sOiAgICAgcmVxdWlyZSggJy4vYm9vbC5qcycgKSxcbiAgZ2F0ZTogICAgIHJlcXVpcmUoICcuL2dhdGUuanMnICksXG4gIHRyYWluOiAgICByZXF1aXJlKCAnLi90cmFpbi5qcycgKSxcbiAgc2xpZGU6ICAgIHJlcXVpcmUoICcuL3NsaWRlLmpzJyApLFxuICBpbjogICAgICAgcmVxdWlyZSggJy4vaW4uanMnICksXG4gIHQ2MDogICAgICByZXF1aXJlKCAnLi90NjAuanMnKSxcbiAgbXRvZjogICAgIHJlcXVpcmUoICcuL210b2YuanMnKSxcbiAgbHRwOiAgICAgIHJlcXVpcmUoICcuL2x0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBndHA6ICAgICAgcmVxdWlyZSggJy4vZ3RwLmpzJyksICAgICAgICAvLyBUT0RPOiB0ZXN0XG4gIHN3aXRjaDogICByZXF1aXJlKCAnLi9zd2l0Y2guanMnICksXG4gIG1zdG9zYW1wczpyZXF1aXJlKCAnLi9tc3Rvc2FtcHMuanMnICksIC8vIFRPRE86IG5lZWRzIHRlc3QsXG4gIHNlbGVjdG9yOiByZXF1aXJlKCAnLi9zZWxlY3Rvci5qcycgKSxcbiAgdXRpbGl0aWVzOnJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKSxcbiAgcG93OiAgICAgIHJlcXVpcmUoICcuL3Bvdy5qcycgKSxcbiAgYXR0YWNrOiAgIHJlcXVpcmUoICcuL2F0dGFjay5qcycgKSxcbiAgZGVjYXk6ICAgIHJlcXVpcmUoICcuL2RlY2F5LmpzJyApLFxuICB3aW5kb3dzOiAgcmVxdWlyZSggJy4vd2luZG93cy5qcycgKSxcbiAgZW52OiAgICAgIHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgYWQ6ICAgICAgIHJlcXVpcmUoICcuL2FkLmpzJyAgKSxcbiAgYWRzcjogICAgIHJlcXVpcmUoICcuL2Fkc3IuanMnICksXG4gIGlmZWxzZTogICByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgYmFuZzogICAgIHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gIGFuZDogICAgICByZXF1aXJlKCAnLi9hbmQuanMnICksXG4gIHBhbjogICAgICByZXF1aXJlKCAnLi9wYW4uanMnICksXG4gIGVxOiAgICAgICByZXF1aXJlKCAnLi9lcS5qcycgKSxcbiAgbmVxOiAgICAgIHJlcXVpcmUoICcuL25lcS5qcycgKSxcbiAgZXhwOiAgICAgIHJlcXVpcmUoICcuL2V4cC5qcycgKSxcbiAgcHJvY2VzczogIHJlcXVpcmUoICcuL3Byb2Nlc3MuanMnICksXG4gIHNlcTogICAgICByZXF1aXJlKCAnLi9zZXEuanMnIClcbn1cblxubGlicmFyeS5nZW4ubGliID0gbGlicmFyeVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYnJhcnlcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbHQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19KSB8IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gbHQuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPD0gJHtpbnB1dHNbMV19IHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gJ2x0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoKCAke2lucHV0c1swXX0gPCAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCggaW5wdXRzWzBdIDwgaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHRwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGx0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21heCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLm1heCcgOiBNYXRoLm1heCB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9bWF4KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWF4KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBtYXggPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbWF4LmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbWF4XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbWVtbycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoaW4xLG1lbW9OYW1lKSA9PiB7XG4gIGxldCBtZW1vID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgbWVtby5pbnB1dHMgPSBbIGluMSBdXG4gIG1lbW8uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBtZW1vLm5hbWUgPSBtZW1vTmFtZSAhPT0gdW5kZWZpbmVkID8gbWVtb05hbWUgKyAnXycgKyBnZW4uZ2V0VUlEKCkgOiBgJHttZW1vLmJhc2VuYW1lfSR7bWVtby5pZH1gXG5cbiAgcmV0dXJuIG1lbW9cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBpc1dvcmtsZXQgPyAnTWF0aC5taW4nIDogTWF0aC5taW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfW1pbiggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1pbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICksIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbWluID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1pbi5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIG1pblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW89IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiwgdD0uNSApID0+IHtcbiAgbGV0IHVnZW4gPSBtZW1vKCBhZGQoIG11bChpbjEsIHN1YigxLHQgKSApLCBtdWwoIGluMiwgdCApICkgKVxuICB1Z2VuLm5hbWUgPSAnbWl4JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgbW9kID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgbW9kQXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAlIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gJSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgJSAnIFxuICAgICAgfSlcblxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbW9kXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J21zdG9zYW1wcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWUgfSA9ICR7Z2VuLnNhbXBsZXJhdGV9IC8gMTAwMCAqICR7aW5wdXRzWzBdfSBcXG5cXG5gXG4gICAgIFxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gb3V0XG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGdlbi5zYW1wbGVyYXRlIC8gMTAwMCAqIHRoaXMuaW5wdXRzWzBdXG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0XG4gICAgfSAgICBcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBtc3Rvc2FtcHMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbXN0b3NhbXBzLmlucHV0cyA9IFsgeCBdXG4gIG1zdG9zYW1wcy5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbXN0b3NhbXBzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbXRvZicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgKCAke3RoaXMudHVuaW5nfSAqIGdlbi5leHAoIC4wNTc3NjIyNjUgKiAoJHtpbnB1dHNbMF19IC0gNjkpICkgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSB0aGlzLnR1bmluZyAqIE1hdGguZXhwKCAuMDU3NzYyMjY1ICogKCBpbnB1dHNbMF0gLSA2OSkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHByb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgdHVuaW5nOjQ0MCB9XG4gIFxuICBpZiggcHJvcHMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIHByb3BzLmRlZmF1bHRzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBkZWZhdWx0cyApXG4gIHVnZW4uaW5wdXRzID0gWyB4IF1cbiAgXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTogJ211bCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgLFxuICAgICAgICBzdW0gPSAxLCBudW1Db3VudCA9IDAsIG11bEF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICBvdXQgKz0gdlxuICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgbXVsQXRFbmQgPSB0cnVlXG4gICAgICAgICAgb3V0ICs9ICcgKiAnXG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBpID09PSAwICkge1xuICAgICAgICAgIHN1bSA9IHZcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3VtICo9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICB9XG4gICAgICAgIG51bUNvdW50KytcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYoIG51bUNvdW50ID4gMCApIHtcbiAgICAgIG91dCArPSBtdWxBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKiAnICsgc3VtXG4gICAgfVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgY29uc3QgbXVsID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggbXVsLCB7XG4gICAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogYXJncyxcbiAgfSlcbiAgXG4gIG11bC5uYW1lID0gbXVsLmJhc2VuYW1lICsgbXVsLmlkXG5cbiAgcmV0dXJuIG11bFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbmVxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSAvKnRoaXMuaW5wdXRzWzBdICE9PSB0aGlzLmlucHV0c1sxXSA/IDEgOiovIGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ICE9PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vaXNlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dFxuXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnbm9pc2UnIDogaXNXb3JrbGV0ID8gJ01hdGgucmFuZG9tJyA6IE1hdGgucmFuZG9tIH0pXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gJHtyZWZ9bm9pc2UoKVxcbmBcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm9pc2UgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIG5vaXNlLm5hbWUgPSBwcm90by5uYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG5vaXNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbm90JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gPT09IDAgPyAxIDogMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSAhaW5wdXRzWzBdID09PSAwID8gMSA6IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbm90LmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIG5vdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwYW4nLCBcbiAgaW5pdFRhYmxlKCkgeyAgICBcbiAgICBsZXQgYnVmZmVyTCA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKSxcbiAgICAgICAgYnVmZmVyUiA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgY29uc3QgYW5nVG9SYWQgPSBNYXRoLlBJIC8gMTgwXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxMDI0OyBpKysgKSB7IFxuICAgICAgbGV0IHBhbiA9IGkgKiAoIDkwIC8gMTAyNCApXG4gICAgICBidWZmZXJMW2ldID0gTWF0aC5jb3MoIHBhbiAqIGFuZ1RvUmFkICkgXG4gICAgICBidWZmZXJSW2ldID0gTWF0aC5zaW4oIHBhbiAqIGFuZ1RvUmFkIClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5wYW5MID0gZGF0YSggYnVmZmVyTCwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9KVxuICAgIGdlbi5nbG9iYWxzLnBhblIgPSBkYXRhKCBidWZmZXJSLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0pXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggbGVmdElucHV0LCByaWdodElucHV0LCBwYW4gPS41LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBpZiggZ2VuLmdsb2JhbHMucGFuTCA9PT0gdW5kZWZpbmVkICkgcHJvdG8uaW5pdFRhYmxlKClcblxuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgbGVmdElucHV0LCByaWdodElucHV0IF0sXG4gICAgbGVmdDogICAgbXVsKCBsZWZ0SW5wdXQsIHBlZWsoIGdlbi5nbG9iYWxzLnBhbkwsIHBhbiwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSApLFxuICAgIHJpZ2h0OiAgIG11bCggcmlnaHRJbnB1dCwgcGVlayggZ2VuLmdsb2JhbHMucGFuUiwgcGFuLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pIClcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncGFyYW0nLFxuXG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGdlbi5wYXJhbXMuYWRkKCB0aGlzIClcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcblxuICAgIGlmKCBpc1dvcmtsZXQgKSBnZW4ucGFyYW1ldGVycy5hZGQoIHRoaXMubmFtZSApXG5cbiAgICB0aGlzLnZhbHVlID0gdGhpcy5pbml0aWFsVmFsdWVcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlzV29ya2xldCA/IHRoaXMubmFtZSA6IGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWBcblxuICAgIHJldHVybiBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHByb3BOYW1lPTAsIHZhbHVlPTAsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBpZiggdHlwZW9mIHByb3BOYW1lICE9PSAnc3RyaW5nJyApIHtcbiAgICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSBwcm9wTmFtZVxuICAgIHVnZW4ubWluID0gdmFsdWVcbiAgICB1Z2VuLm1heCA9IG1pblxuICB9ZWxzZXtcbiAgICB1Z2VuLm5hbWUgPSBwcm9wTmFtZVxuICAgIHVnZW4ubWluID0gbWluXG4gICAgdWdlbi5tYXggPSBtYXhcbiAgICB1Z2VuLmluaXRpYWxWYWx1ZSA9IHZhbHVlXG4gIH1cblxuICB1Z2VuLmRlZmF1bHRWYWx1ZSA9IHVnZW4uaW5pdGlhbFZhbHVlXG5cbiAgLy8gZm9yIHN0b3Jpbmcgd29ya2xldCBub2RlcyBvbmNlIHRoZXkncmUgaW5zdGFudGlhdGVkXG4gIHVnZW4ud2FhcGkgPSBudWxsXG5cbiAgdWdlbi5pc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1lbHNle1xuICAgICAgICByZXR1cm4gdGhpcy5pbml0aWFsVmFsdWVcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGlmKCB0aGlzLmlzV29ya2xldCAmJiB0aGlzLndhYXBpICE9PSBudWxsICkge1xuICAgICAgICAgIHRoaXMud2FhcGlbIHByb3BOYW1lIF0udmFsdWUgPSB2XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2XG4gICAgICAgIH0gXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiXG5jb25zdCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICAgIGRhdGFVZ2VuID0gcmVxdWlyZSgnLi9kYXRhLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncGVlaycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCwgZnVuY3Rpb25Cb2R5LCBuZXh0LCBsZW5ndGhJc0xvZzIsIGlkeFxuICAgIFxuICAgIGlkeCA9IGlucHV0c1sxXVxuICAgIGxlbmd0aElzTG9nMiA9IChNYXRoLmxvZzIoIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoICkgfCAwKSAgPT09IE1hdGgubG9nMiggdGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggKVxuXG4gICAgaWYoIHRoaXMubW9kZSAhPT0gJ3NpbXBsZScgKSB7XG5cbiAgICBmdW5jdGlvbkJvZHkgPSBgICB2YXIgJHt0aGlzLm5hbWV9X2RhdGFJZHggID0gJHtpZHh9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9waGFzZSA9ICR7dGhpcy5tb2RlID09PSAnc2FtcGxlcycgPyBpbnB1dHNbMF0gOiBpbnB1dHNbMF0gKyAnICogJyArICh0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCkgfSwgXG4gICAgICAke3RoaXMubmFtZX1faW5kZXggPSAke3RoaXMubmFtZX1fcGhhc2UgfCAwLFxcbmBcblxuICAgIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ3dyYXAnICkge1xuICAgICAgbmV4dCA9IGxlbmd0aElzTG9nMiA/XG4gICAgICBgKCAke3RoaXMubmFtZX1faW5kZXggKyAxICkgJiAoJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gLSAxKWAgOlxuICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gPyAke3RoaXMubmFtZX1faW5kZXggKyAxIC0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH1lbHNlIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2NsYW1wJyApIHtcbiAgICAgIG5leHQgPSBcbiAgICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9ID8gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9IGVsc2UgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnZm9sZCcgfHwgdGhpcy5ib3VuZG1vZGUgPT09ICdtaXJyb3InICkge1xuICAgICAgbmV4dCA9IFxuICAgICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gPyAke3RoaXMubmFtZX1faW5kZXggLSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH1lbHNle1xuICAgICAgIG5leHQgPSBcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxYCAgICAgXG4gICAgfVxuXG4gICAgaWYoIHRoaXMuaW50ZXJwID09PSAnbGluZWFyJyApIHsgICAgICBcbiAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9mcmFjICA9ICR7dGhpcy5uYW1lfV9waGFzZSAtICR7dGhpcy5uYW1lfV9pbmRleCxcbiAgICAgICR7dGhpcy5uYW1lfV9iYXNlICA9IG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAgJHt0aGlzLm5hbWV9X2luZGV4IF0sXG4gICAgICAke3RoaXMubmFtZX1fbmV4dCAgPSAke25leHR9LGBcbiAgICAgIFxuICAgICAgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnaWdub3JlJyApIHtcbiAgICAgICAgZnVuY3Rpb25Cb2R5ICs9IGBcbiAgICAgICR7dGhpcy5uYW1lfV9vdXQgICA9ICR7dGhpcy5uYW1lfV9pbmRleCA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gfHwgJHt0aGlzLm5hbWV9X2luZGV4IDwgMCA/IDAgOiAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X25leHQgXSAtICR7dGhpcy5uYW1lfV9iYXNlIClcXG5cXG5gXG4gICAgICB9ZWxzZXtcbiAgICAgICAgZnVuY3Rpb25Cb2R5ICs9IGBcbiAgICAgICR7dGhpcy5uYW1lfV9vdXQgICA9ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoIG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1fbmV4dCBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKVxcblxcbmBcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGZ1bmN0aW9uQm9keSArPSBgICAgICAgJHt0aGlzLm5hbWV9X291dCA9IG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1faW5kZXggXVxcblxcbmBcbiAgICB9XG5cbiAgICB9IGVsc2UgeyAvLyBtb2RlIGlzIHNpbXBsZVxuICAgICAgZnVuY3Rpb25Cb2R5ID0gYG1lbW9yeVsgJHtpZHh9ICsgJHsgaW5wdXRzWzBdIH0gXWBcbiAgICAgIFxuICAgICAgcmV0dXJuIGZ1bmN0aW9uQm9keVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfb3V0J1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lKydfb3V0JywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBkZWZhdWx0cyA6IHsgY2hhbm5lbHM6MSwgbW9kZToncGhhc2UnLCBpbnRlcnA6J2xpbmVhcicsIGJvdW5kbW9kZTond3JhcCcgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5wdXRfZGF0YSwgaW5kZXg9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgLy9jb25zb2xlLmxvZyggZGF0YVVnZW4sIGdlbi5kYXRhIClcblxuICAvLyBYWFggd2h5IGlzIGRhdGFVZ2VuIG5vdCB0aGUgYWN0dWFsIGZ1bmN0aW9uPyBzb21lIHR5cGUgb2YgYnJvd3NlcmlmeSBub25zZW5zZS4uLlxuICBjb25zdCBmaW5hbERhdGEgPSB0eXBlb2YgaW5wdXRfZGF0YS5iYXNlbmFtZSA9PT0gJ3VuZGVmaW5lZCcgPyBnZW4ubGliLmRhdGEoIGlucHV0X2RhdGEgKSA6IGlucHV0X2RhdGFcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBcbiAgICB7IFxuICAgICAgJ2RhdGEnOiAgICAgZmluYWxEYXRhLFxuICAgICAgZGF0YU5hbWU6ICAgZmluYWxEYXRhLm5hbWUsXG4gICAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6ICAgICBbIGluZGV4LCBmaW5hbERhdGEgXSxcbiAgICB9LFxuICAgIHByb3RvLmRlZmF1bHRzLFxuICAgIHByb3BlcnRpZXMgXG4gIClcbiAgXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuXG4gIHJldHVybiB1Z2VuXG59XG5cbiIsImNvbnN0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgICAgZGF0YVVnZW4gPSByZXF1aXJlKCcuL2RhdGEuanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BlZWsnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQsIGZ1bmN0aW9uQm9keSwgbmV4dCwgbGVuZ3RoSXNMb2cyLCBpbmRleGVyLCBkYXRhU3RhcnQsIGxlbmd0aFxuICAgIFxuICAgIC8vIGRhdGEgb2JqZWN0IGNvZGVnZW5zIHRvIGl0cyBzdGFydGluZyBpbmRleFxuICAgIGRhdGFTdGFydCA9IGlucHV0c1swXVxuICAgIGxlbmd0aCAgICA9IGlucHV0c1sxXVxuICAgIGluZGV4ZXIgICA9IGlucHV0c1syXVxuXG4gICAgLy9sZW5ndGhJc0xvZzIgPSAoTWF0aC5sb2cyKCBsZW5ndGggKSB8IDApICA9PT0gTWF0aC5sb2cyKCBsZW5ndGggKVxuXG4gICAgaWYoIHRoaXMubW9kZSAhPT0gJ3NpbXBsZScgKSB7XG5cbiAgICAgIGZ1bmN0aW9uQm9keSA9IGAgIHZhciAke3RoaXMubmFtZX1fZGF0YUlkeCAgPSAke2RhdGFTdGFydH0sIFxuICAgICAgICAke3RoaXMubmFtZX1fcGhhc2UgPSAke3RoaXMubW9kZSA9PT0gJ3NhbXBsZXMnID8gaW5kZXhlciA6IGluZGV4ZXIgKyAnICogJyArIChsZW5ndGgpIH0sIFxuICAgICAgICAke3RoaXMubmFtZX1faW5kZXggPSAke3RoaXMubmFtZX1fcGhhc2UgfCAwLFxcbmBcblxuICAgICAgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnd3JhcCcgKSB7XG4gICAgICAgIG5leHQgPWAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7bGVuZ3RofSA/ICR7dGhpcy5uYW1lfV9pbmRleCArIDEgLSAke2xlbmd0aH0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgICAgfWVsc2UgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnY2xhbXAnICkge1xuICAgICAgICBuZXh0ID0gXG4gICAgICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHtsZW5ndGh9IC0xID8gJHtsZW5ndGh9IC0gMSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgICB9IGVsc2UgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnZm9sZCcgfHwgdGhpcy5ib3VuZG1vZGUgPT09ICdtaXJyb3InICkge1xuICAgICAgICBuZXh0ID0gXG4gICAgICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHtsZW5ndGh9IC0gMSA/ICR7dGhpcy5uYW1lfV9pbmRleCAtICR7bGVuZ3RofSAtIDEgOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgICAgfWVsc2V7XG4gICAgICAgICBuZXh0ID0gXG4gICAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxYCAgICAgXG4gICAgICB9XG5cbiAgICAgIGlmKCB0aGlzLmludGVycCA9PT0gJ2xpbmVhcicgKSB7ICAgICAgXG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgICAgICAgJHt0aGlzLm5hbWV9X2ZyYWMgID0gJHt0aGlzLm5hbWV9X3BoYXNlIC0gJHt0aGlzLm5hbWV9X2luZGV4LFxuICAgICAgICAke3RoaXMubmFtZX1fYmFzZSAgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgICR7dGhpcy5uYW1lfV9pbmRleCBdLFxuICAgICAgICAke3RoaXMubmFtZX1fbmV4dCAgPSAke25leHR9LGBcbiAgICAgICAgXG4gICAgICAgIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2lnbm9yZScgKSB7XG4gICAgICAgICAgZnVuY3Rpb25Cb2R5ICs9IGBcbiAgICAgICAgJHt0aGlzLm5hbWV9X291dCAgID0gJHt0aGlzLm5hbWV9X2luZGV4ID49ICR7bGVuZ3RofSAtIDEgfHwgJHt0aGlzLm5hbWV9X2luZGV4IDwgMCA/IDAgOiAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X25leHQgXSAtICR7dGhpcy5uYW1lfV9iYXNlIClcXG5cXG5gXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAgICR7dGhpcy5uYW1lfV9vdXQgICA9ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoIG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1fbmV4dCBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKVxcblxcbmBcbiAgICAgICAgfVxuICAgICAgfWVsc2V7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgICAgICAgJHt0aGlzLm5hbWV9X291dCA9IG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1faW5kZXggXVxcblxcbmBcbiAgICAgIH1cblxuICAgIH0gZWxzZSB7IC8vIG1vZGUgaXMgc2ltcGxlXG4gICAgICBmdW5jdGlvbkJvZHkgPSBgbWVtb3J5WyAke2RhdGFTdGFydH0gKyAkeyBpbmRleGVyIH0gXWBcbiAgICAgIFxuICAgICAgcmV0dXJuIGZ1bmN0aW9uQm9keVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfb3V0J1xuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lKydfb3V0JywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBkZWZhdWx0cyA6IHsgY2hhbm5lbHM6MSwgbW9kZToncGhhc2UnLCBpbnRlcnA6J2xpbmVhcicsIGJvdW5kbW9kZTond3JhcCcgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5wdXRfZGF0YSwgbGVuZ3RoLCBpbmRleD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIC8vIFhYWCB3aHkgaXMgZGF0YVVnZW4gbm90IHRoZSBhY3R1YWwgZnVuY3Rpb24/IHNvbWUgdHlwZSBvZiBicm93c2VyaWZ5IG5vbnNlbnNlLi4uXG4gIGNvbnN0IGZpbmFsRGF0YSA9IHR5cGVvZiBpbnB1dF9kYXRhLmJhc2VuYW1lID09PSAndW5kZWZpbmVkJyA/IGdlbi5saWIuZGF0YSggaW5wdXRfZGF0YSApIDogaW5wdXRfZGF0YVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIFxuICAgIHsgXG4gICAgICAnZGF0YSc6ICAgICBmaW5hbERhdGEsXG4gICAgICBkYXRhTmFtZTogICBmaW5hbERhdGEubmFtZSxcbiAgICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogICAgIFsgaW5wdXRfZGF0YSwgbGVuZ3RoLCBpbmRleCwgZmluYWxEYXRhIF0sXG4gICAgfSxcbiAgICBwcm90by5kZWZhdWx0cyxcbiAgICBwcm9wZXJ0aWVzIFxuICApXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgICBhY2N1bSA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgICAgbXVsICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgICBwcm90byA9IHsgYmFzZW5hbWU6J3BoYXNvcicgfSxcbiAgICAgIGRpdiAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApXG5cbmNvbnN0IGRlZmF1bHRzID0geyBtaW46IC0xLCBtYXg6IDEgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5ID0gMSwgcmVzZXQgPSAwLCBfcHJvcHMgKSA9PiB7XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBfcHJvcHMgKVxuXG4gIGNvbnN0IHJhbmdlID0gcHJvcHMubWF4IC0gcHJvcHMubWluXG5cbiAgY29uc3QgdWdlbiA9IHR5cGVvZiBmcmVxdWVuY3kgPT09ICdudW1iZXInIFxuICAgID8gYWNjdW0oIChmcmVxdWVuY3kgKiByYW5nZSkgLyBnZW4uc2FtcGxlcmF0ZSwgcmVzZXQsIHByb3BzICkgXG4gICAgOiBhY2N1bSggXG4gICAgICAgIGRpdiggXG4gICAgICAgICAgbXVsKCBmcmVxdWVuY3ksIHJhbmdlICksXG4gICAgICAgICAgZ2VuLnNhbXBsZXJhdGVcbiAgICAgICAgKSwgXG4gICAgICAgIHJlc2V0LCBwcm9wcyBcbiAgICApXG5cbiAgdWdlbi5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgICAgYWNjdW0gPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICAgIG11bCAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgICAgcHJvdG8gPSB7IGJhc2VuYW1lOidwaGFzb3JOJyB9LFxuICAgICAgZGl2ICAgPSByZXF1aXJlKCAnLi9kaXYuanMnIClcblxuY29uc3QgZGVmYXVsdHMgPSB7IG1pbjogMCwgbWF4OiAxIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeSA9IDEsIHJlc2V0ID0gMCwgX3Byb3BzICkgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgX3Byb3BzIClcblxuICBjb25zdCByYW5nZSA9IHByb3BzLm1heCAtIHByb3BzLm1pblxuXG4gIGNvbnN0IHVnZW4gPSB0eXBlb2YgZnJlcXVlbmN5ID09PSAnbnVtYmVyJyBcbiAgICA/IGFjY3VtKCAoZnJlcXVlbmN5ICogcmFuZ2UpIC8gZ2VuLnNhbXBsZXJhdGUsIHJlc2V0LCBwcm9wcyApIFxuICAgIDogYWNjdW0oIFxuICAgICAgICBkaXYoIFxuICAgICAgICAgIG11bCggZnJlcXVlbmN5LCByYW5nZSApLFxuICAgICAgICAgIGdlbi5zYW1wbGVyYXRlXG4gICAgICAgICksIFxuICAgICAgICByZXNldCwgcHJvcHMgXG4gICAgKVxuXG4gIHVnZW4ubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsICA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcC5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Bva2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZGF0YU5hbWUgPSAnbWVtb3J5JyxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBpZHgsIG91dCwgd3JhcHBlZFxuICAgIFxuICAgIGlkeCA9IHRoaXMuZGF0YS5nZW4oKVxuXG4gICAgLy9nZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIC8vd3JhcHBlZCA9IHdyYXAoIHRoaXMuaW5wdXRzWzFdLCAwLCB0aGlzLmRhdGFMZW5ndGggKS5nZW4oKVxuICAgIC8vaWR4ID0gd3JhcHBlZFswXVxuICAgIC8vZ2VuLmZ1bmN0aW9uQm9keSArPSB3cmFwcGVkWzFdXG4gICAgbGV0IG91dHB1dFN0ciA9IHRoaXMuaW5wdXRzWzFdID09PSAwID9cbiAgICAgIGAgICR7ZGF0YU5hbWV9WyAke2lkeH0gXSA9ICR7aW5wdXRzWzBdfVxcbmAgOlxuICAgICAgYCAgJHtkYXRhTmFtZX1bICR7aWR4fSArICR7aW5wdXRzWzFdfSBdID0gJHtpbnB1dHNbMF19XFxuYFxuXG4gICAgaWYoIHRoaXMuaW5saW5lID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IG91dHB1dFN0clxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIFsgdGhpcy5pbmxpbmUsIG91dHB1dFN0ciBdXG4gICAgfVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9ICggZGF0YSwgdmFsdWUsIGluZGV4LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6MSB9IFxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBkYXRhLFxuICAgIGRhdGFOYW1lOiAgIGRhdGEubmFtZSxcbiAgICBkYXRhTGVuZ3RoOiBkYXRhLmJ1ZmZlci5sZW5ndGgsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgdmFsdWUsIGluZGV4IF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcblxuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuICBcbiAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4ubmFtZSwgdWdlbiApXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG93JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdwb3cnOiBpc1dvcmtsZXQgPyAnTWF0aC5wb3cnIDogTWF0aC5wb3cgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXBvdyggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMF0gPT09ICdzdHJpbmcnICYmIGlucHV0c1swXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMF0gPSBpbnB1dHNbMF0uc2xpY2UoMSwtMSlcbiAgICAgIH1cbiAgICAgIGlmKCB0eXBlb2YgaW5wdXRzWzFdID09PSAnc3RyaW5nJyAmJiBpbnB1dHNbMV1bMF0gPT09ICcoJyApIHtcbiAgICAgICAgaW5wdXRzWzFdID0gaW5wdXRzWzFdLnNsaWNlKDEsLTEpXG4gICAgICB9XG5cbiAgICAgIG91dCA9IE1hdGgucG93KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IHBvdyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBwb3cuaW5wdXRzID0gWyB4LHkgXVxuICBwb3cuaWQgPSBnZW4uZ2V0VUlEKClcbiAgcG93Lm5hbWUgPSBgJHtwb3cuYmFzZW5hbWV9e3Bvdy5pZH1gXG5cbiAgcmV0dXJuIHBvd1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwcm9jZXNzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWycnK3RoaXMuZnVuY25hbWVdIDogdGhpcy5mdW5jIH0pXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gZ2VuWycke3RoaXMuZnVuY25hbWV9J10oYFxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGksYXJyICkgPT4ge1xuICAgICAgb3V0ICs9IGFyclsgaSBdXG4gICAgICBpZiggaSA8IGFyci5sZW5ndGggLSAxICkgb3V0ICs9ICcsJ1xuICAgIH0pXG5cbiAgICBvdXQgKz0gJylcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgY29uc3QgcHJvY2VzcyA9IHt9Ly8gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBjb25zdCBpZCA9IGdlbi5nZXRVSUQoKVxuICBwcm9jZXNzLm5hbWUgPSAncHJvY2VzcycgKyBpZCBcblxuICBwcm9jZXNzLmZ1bmMgPSBuZXcgRnVuY3Rpb24oIC4uLmFyZ3MgKVxuXG4gIC8vZ2VuLmdsb2JhbHNbIHByb2Nlc3MubmFtZSBdID0gcHJvY2Vzcy5mdW5jXG5cbiAgcHJvY2Vzcy5jYWxsID0gZnVuY3Rpb24oIC4uLmFyZ3MgICkge1xuICAgIGNvbnN0IG91dHB1dCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgICBvdXRwdXQuZnVuY25hbWUgPSBwcm9jZXNzLm5hbWVcbiAgICBvdXRwdXQuZnVuYyA9IHByb2Nlc3MuZnVuY1xuICAgIG91dHB1dC5uYW1lID0gJ3Byb2Nlc3Nfb3V0XycgKyBpZFxuICAgIG91dHB1dC5wcm9jZXNzID0gcHJvY2Vzc1xuXG4gICAgb3V0cHV0LmlucHV0cyA9IGFyZ3NcblxuICAgIHJldHVybiBvdXRwdXRcbiAgfVxuXG4gIHJldHVybiBwcm9jZXNzIFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGRlbHRhICAgPSByZXF1aXJlKCAnLi9kZWx0YS5qcycgKSxcbiAgICB3cmFwICAgID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidyYXRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcGhhc2UgID0gaGlzdG9yeSgpLFxuICAgICAgICBpbk1pbnVzMSA9IGhpc3RvcnkoKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZmlsdGVyLCBzdW0sIG91dFxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9kaWZmID0gJHtpbnB1dHNbMF19IC0gJHtnZW5OYW1lfS5sYXN0U2FtcGxlXG4gIGlmKCAke3RoaXMubmFtZX1fZGlmZiA8IC0uNSApICR7dGhpcy5uYW1lfV9kaWZmICs9IDFcbiAgJHtnZW5OYW1lfS5waGFzZSArPSAke3RoaXMubmFtZX1fZGlmZiAqICR7aW5wdXRzWzFdfVxuICBpZiggJHtnZW5OYW1lfS5waGFzZSA+IDEgKSAke2dlbk5hbWV9LnBoYXNlIC09IDFcbiAgJHtnZW5OYW1lfS5sYXN0U2FtcGxlID0gJHtpbnB1dHNbMF19XG5gXG4gICAgb3V0ID0gJyAnICsgb3V0XG5cbiAgICByZXR1cm4gWyBnZW5OYW1lICsgJy5waGFzZScsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgcmF0ZSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBwaGFzZTogICAgICAwLFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCByYXRlIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZToncm91bmQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLnJvdW5kJyA6IE1hdGgucm91bmQgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXJvdW5kKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnJvdW5kKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgcm91bmQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcm91bmQuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gcm91bmRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzYWgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSBdID0gMFxuICAgIC8vZ2VuLmRhdGFbIHRoaXMubmFtZSArICdfY29udHJvbCcgXSA9IDBcblxuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG5cblxuICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X2NvbnRyb2wgPSBtZW1vcnlbJHt0aGlzLm1lbW9yeS5jb250cm9sLmlkeH1dLFxuICAgICAgJHt0aGlzLm5hbWV9X3RyaWdnZXIgPSAke2lucHV0c1sxXX0gPiAke2lucHV0c1syXX0gPyAxIDogMFxuXG4gIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciAhPT0gJHt0aGlzLm5hbWV9X2NvbnRyb2wgICkge1xuICAgIGlmKCAke3RoaXMubmFtZX1fdHJpZ2dlciA9PT0gMSApIFxuICAgICAgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV0gPSAke2lucHV0c1swXX1cbiAgICBcbiAgICBtZW1vcnlbJHt0aGlzLm1lbW9yeS5jb250cm9sLmlkeH1dID0gJHt0aGlzLm5hbWV9X3RyaWdnZXJcbiAgfVxuYFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAvL2BnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gLCAnICcgK291dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgY29udHJvbCwgdGhyZXNob2xkPTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0OjAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBsYXN0U2FtcGxlOiAwLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSwgY29udHJvbCx0aHJlc2hvbGQgXSxcbiAgICBtZW1vcnk6IHtcbiAgICAgIGNvbnRyb2w6IHsgaWR4Om51bGwsIGxlbmd0aDoxIH0sXG4gICAgICB2YWx1ZTogICB7IGlkeDpudWxsLCBsZW5ndGg6MSB9LFxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc2VsZWN0b3InLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXQsIHJldHVyblZhbHVlID0gMFxuICAgIFxuICAgIHN3aXRjaCggaW5wdXRzLmxlbmd0aCApIHtcbiAgICAgIGNhc2UgMiA6XG4gICAgICAgIHJldHVyblZhbHVlID0gaW5wdXRzWzFdXG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzIDpcbiAgICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1swXX0gPT09IDEgPyAke2lucHV0c1sxXX0gOiAke2lucHV0c1syXX1cXG5cXG5gO1xuICAgICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lICsgJ19vdXQnLCBvdXQgXVxuICAgICAgICBicmVhazsgIFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX1fb3V0ID0gMFxuICBzd2l0Y2goICR7aW5wdXRzWzBdfSArIDEgKSB7XFxuYFxuXG4gICAgICAgIGZvciggbGV0IGkgPSAxOyBpIDwgaW5wdXRzLmxlbmd0aDsgaSsrICl7XG4gICAgICAgICAgb3V0ICs9YCAgICBjYXNlICR7aX06ICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1tpXX07IGJyZWFrO1xcbmAgXG4gICAgICAgIH1cblxuICAgICAgICBvdXQgKz0gJyAgfVxcblxcbidcbiAgICAgICAgXG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsICcgJyArIG91dCBdXG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ19vdXQnXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmlucHV0cyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0c1xuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGNvdW50ZXI9IHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gICAgcGVlayAgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIHNzZCAgID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBkYXRhICA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcHJvdG8gPSB7IGJhc2VuYW1lOidzZXEnIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGR1cmF0aW9ucyA9IDExMDI1LCB2YWx1ZXMgPSBbMCwxXSwgcGhhc2VJbmNyZW1lbnQgPSAxKSA9PiB7XG4gIGxldCBjbG9ja1xuICBcbiAgaWYoIEFycmF5LmlzQXJyYXkoIGR1cmF0aW9ucyApICkge1xuICAgIC8vIHdlIHdhbnQgYSBjb3VudGVyIHRoYXQgaXMgdXNpbmcgb3VyIGN1cnJlbnRcbiAgICAvLyByYXRlIHZhbHVlLCBidXQgd2Ugd2FudCB0aGUgcmF0ZSB2YWx1ZSB0byBiZSBkZXJpdmVkIGZyb21cbiAgICAvLyB0aGUgY291bnRlci4gbXVzdCBpbnNlcnQgYSBzaW5nbGUtc2FtcGxlIGRlYWx5IHRvIGF2b2lkXG4gICAgLy8gaW5maW5pdGUgbG9vcC5cbiAgICBjb25zdCBjbG9jazIgPSBjb3VudGVyKCAwLCAwLCBkdXJhdGlvbnMubGVuZ3RoIClcbiAgICBjb25zdCBfX2R1cmF0aW9ucyA9IHBlZWsoIGRhdGEoIGR1cmF0aW9ucyApLCBjbG9jazIsIHsgbW9kZTonc2ltcGxlJyB9KSBcbiAgICBjbG9jayA9IGNvdW50ZXIoIHBoYXNlSW5jcmVtZW50LCAwLCBfX2R1cmF0aW9ucyApXG4gICAgXG4gICAgLy8gYWRkIG9uZSBzYW1wbGUgZGVsYXkgdG8gYXZvaWQgY29kZWdlbiBsb29wXG4gICAgY29uc3QgcyA9IHNzZCgpXG4gICAgcy5pbiggY2xvY2sud3JhcCApXG4gICAgY2xvY2syLmlucHV0c1swXSA9IHMub3V0XG4gIH1lbHNle1xuICAgIC8vIGlmIHRoZSByYXRlIGFyZ3VtZW50IGlzIGEgc2luZ2xlIHZhbHVlIHdlIGRvbid0IG5lZWQgdG9cbiAgICAvLyBkbyBhbnl0aGluZyB0cmlja3kuXG4gICAgY2xvY2sgPSBjb3VudGVyKCBwaGFzZUluY3JlbWVudCwgMCwgZHVyYXRpb25zIClcbiAgfVxuICBcbiAgY29uc3Qgc3RlcHBlciA9IGFjY3VtKCBjbG9jay53cmFwLCAwLCB7IG1pbjowLCBtYXg6dmFsdWVzLmxlbmd0aCB9KVxuICAgXG4gIGNvbnN0IHVnZW4gPSBwZWVrKCBkYXRhKCB2YWx1ZXMgKSwgc3RlcHBlciwgeyBtb2RlOidzaW1wbGUnIH0pXG5cbiAgdWdlbi5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcbiAgdWdlbi50cmlnZ2VyID0gY2xvY2sud3JhcFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonc2lnbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGguc2lnbicgOiBNYXRoLnNpZ24gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXNpZ24oICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2lnbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpZ24gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2lnbi5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBzaWduXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBpc1dvcmtsZXQgPyAnTWF0aC5zaW4nIDogTWF0aC5zaW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpbi5pbnB1dHMgPSBbIHggXVxuICBzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgc2luLm5hbWUgPSBgJHtzaW4uYmFzZW5hbWV9e3Npbi5pZH1gXG5cbiAgcmV0dXJuIHNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGd0ICAgICAgPSByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgICBkaXYgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIF9zd2l0Y2ggPSByZXF1aXJlKCAnLi9zd2l0Y2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgc2xpZGVVcCA9IDEsIHNsaWRlRG93biA9IDEgKSA9PiB7XG4gIGxldCB5MSA9IGhpc3RvcnkoMCksXG4gICAgICBmaWx0ZXIsIHNsaWRlQW1vdW50XG5cbiAgLy95IChuKSA9IHkgKG4tMSkgKyAoKHggKG4pIC0geSAobi0xKSkvc2xpZGUpIFxuICBzbGlkZUFtb3VudCA9IF9zd2l0Y2goIGd0KGluMSx5MS5vdXQpLCBzbGlkZVVwLCBzbGlkZURvd24gKVxuXG4gIGZpbHRlciA9IG1lbW8oIGFkZCggeTEub3V0LCBkaXYoIHN1YiggaW4xLCB5MS5vdXQgKSwgc2xpZGVBbW91bnQgKSApIClcblxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N1YicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9MCxcbiAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBzdWJBdEVuZCA9IGZhbHNlLFxuICAgICAgICBoYXNVZ2VucyA9IGZhbHNlLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IDBcblxuICAgIHRoaXMuaW5wdXRzLmZvckVhY2goIHZhbHVlID0+IHsgaWYoIGlzTmFOKCB2YWx1ZSApICkgaGFzVWdlbnMgPSB0cnVlIH0pXG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC0gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICByZXR1cm5cbiAgICAgIH1lbHNle1xuICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC0gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGxldCBzdWIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggc3ViLCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzXG4gIH0pXG4gICAgICAgXG4gIHN1Yi5uYW1lID0gJ3N1YicgKyBzdWIuaWRcblxuICByZXR1cm4gc3ViXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzd2l0Y2gnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIGlmKCBpbnB1dHNbMV0gPT09IGlucHV0c1syXSApIHJldHVybiBpbnB1dHNbMV0gLy8gaWYgYm90aCBwb3RlbnRpYWwgb3V0cHV0cyBhcmUgdGhlIHNhbWUganVzdCByZXR1cm4gb25lIG9mIHRoZW1cbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEgPSAxLCBpbjIgPSAwICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbnRyb2wsIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Q2MCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgJ2V4cCcgXTogaXNXb3JrbGV0ID8gJ01hdGguZXhwJyA6IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAke3JlZn1leHAoIC02LjkwNzc1NTI3ODkyMSAvICR7aW5wdXRzWzBdfSApXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gaW5wdXRzWzBdIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9ICAgIFxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHQ2MCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0NjAuaW5wdXRzID0gWyB4IF1cbiAgdDYwLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB0NjBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IGlzV29ya2xldCA/ICdNYXRoLnRhbicgOiBNYXRoLnRhbiB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9dGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdGFuLmlucHV0cyA9IFsgeCBdXG4gIHRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW4ubmFtZSA9IGAke3Rhbi5iYXNlbmFtZX17dGFuLmlkfWBcblxuICByZXR1cm4gdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbmgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAndGFuaCc6IGlzV29ya2xldCA/ICdNYXRoLnRhbicgOiBNYXRoLnRhbmggfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXRhbmgoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbmgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW5oID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbmguaW5wdXRzID0gWyB4IF1cbiAgdGFuaC5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW5oLm5hbWUgPSBgJHt0YW5oLmJhc2VuYW1lfXt0YW5oLmlkfWBcblxuICByZXR1cm4gdGFuaFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGx0ICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBhY2N1bSAgID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgZGl2ICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTQ0MCwgcHVsc2V3aWR0aD0uNSApID0+IHtcbiAgbGV0IGdyYXBoID0gbHQoIGFjY3VtKCBkaXYoIGZyZXF1ZW5jeSwgNDQxMDAgKSApLCBwdWxzZXdpZHRoIClcblxuICBncmFwaC5uYW1lID0gYHRyYWluJHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiBncmFwaFxufVxuXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgQVdQRiA9IHJlcXVpcmUoICcuL2V4dGVybmFsL2F1ZGlvd29ya2xldC1wb2x5ZmlsbC5qcycgKSxcbiAgICAgIGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKVxuXG5sZXQgaXNTdGVyZW8gPSBmYWxzZVxuXG5jb25zdCB1dGlsaXRpZXMgPSB7XG4gIGN0eDogbnVsbCxcbiAgYnVmZmVyczoge30sXG4gIGlzU3RlcmVvOmZhbHNlLFxuXG4gIGNsZWFyKCkge1xuICAgIGlmKCB0aGlzLndvcmtsZXROb2RlICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICB0aGlzLndvcmtsZXROb2RlLmRpc2Nvbm5lY3QoKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5jYWxsYmFjayA9ICgpID0+IDBcbiAgICB9XG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MuZm9yRWFjaCggdiA9PiB2KCkgKVxuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmxlbmd0aCA9IDBcblxuICAgIHRoaXMuaXNTdGVyZW8gPSBmYWxzZVxuXG4gICAgaWYoIGdlbi5ncmFwaCAhPT0gbnVsbCApIGdlbi5mcmVlKCBnZW4uZ3JhcGggKVxuICB9LFxuXG4gIGNyZWF0ZUNvbnRleHQoIGJ1ZmZlclNpemUgPSAyMDQ4ICkge1xuICAgIGNvbnN0IEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHRcbiAgICBcbiAgICAvLyB0ZWxsIHBvbHlmaWxsIGdsb2JhbCBvYmplY3QgYW5kIGJ1ZmZlcnNpemVcbiAgICBBV1BGKCB3aW5kb3csIGJ1ZmZlclNpemUgKVxuXG4gICAgY29uc3Qgc3RhcnQgPSAoKSA9PiB7XG4gICAgICBpZiggdHlwZW9mIEFDICE9PSAndW5kZWZpbmVkJyApIHtcbiAgICAgICAgdGhpcy5jdHggPSBuZXcgQUMoeyBsYXRlbmN5SGludDouMDEyNSB9KVxuXG4gICAgICAgIGdlbi5zYW1wbGVyYXRlID0gdGhpcy5jdHguc2FtcGxlUmF0ZVxuXG4gICAgICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHN0YXJ0IClcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZWRvd24nLCBzdGFydCApXG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgc3RhcnQgKVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgIG15U291cmNlLmNvbm5lY3QoIHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24gKVxuICAgICAgICBteVNvdXJjZS5zdGFydCgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG4gICAgfWVsc2V7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIHN0YXJ0IClcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIHN0YXJ0IClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvcigpIHtcbiAgICB0aGlzLm5vZGUgPSB0aGlzLmN0eC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoIDEwMjQsIDAsIDIgKVxuICAgIHRoaXMuY2xlYXJGdW5jdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMCB9XG4gICAgaWYoIHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAndW5kZWZpbmVkJyApIHRoaXMuY2FsbGJhY2sgPSB0aGlzLmNsZWFyRnVuY3Rpb25cblxuICAgIHRoaXMubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKCBhdWRpb1Byb2Nlc3NpbmdFdmVudCApIHtcbiAgICAgIHZhciBvdXRwdXRCdWZmZXIgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXI7XG5cbiAgICAgIHZhciBsZWZ0ID0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAwICksXG4gICAgICAgICAgcmlnaHQ9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMSApLFxuICAgICAgICAgIGlzU3RlcmVvID0gdXRpbGl0aWVzLmlzU3RlcmVvXG5cbiAgICAgZm9yKCB2YXIgc2FtcGxlID0gMDsgc2FtcGxlIDwgbGVmdC5sZW5ndGg7IHNhbXBsZSsrICkge1xuICAgICAgICB2YXIgb3V0ID0gdXRpbGl0aWVzLmNhbGxiYWNrKClcblxuICAgICAgICBpZiggaXNTdGVyZW8gPT09IGZhbHNlICkge1xuICAgICAgICAgIGxlZnRbIHNhbXBsZSBdID0gcmlnaHRbIHNhbXBsZSBdID0gb3V0IFxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgIF0gPSBvdXRbMF1cbiAgICAgICAgICByaWdodFsgc2FtcGxlIF0gPSBvdXRbMV1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubm9kZS5jb25uZWN0KCB0aGlzLmN0eC5kZXN0aW5hdGlvbiApXG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIC8vIHJlbW92ZSBzdGFydGluZyBzdHVmZiBhbmQgYWRkIHRhYnNcbiAgcHJldHR5UHJpbnRDYWxsYmFjayggY2IgKSB7XG4gICAgLy8gZ2V0IHJpZCBvZiBcImZ1bmN0aW9uIGdlblwiIGFuZCBzdGFydCB3aXRoIHBhcmVudGhlc2lzXG4gICAgLy8gY29uc3Qgc2hvcnRlbmRDQiA9IGNiLnRvU3RyaW5nKCkuc2xpY2UoOSlcbiAgICBjb25zdCBjYlNwbGl0ID0gY2IudG9TdHJpbmcoKS5zcGxpdCgnXFxuJylcbiAgICBjb25zdCBjYlRyaW0gPSBjYlNwbGl0LnNsaWNlKCAzLCAtMiApXG4gICAgY29uc3QgY2JUYWJiZWQgPSBjYlRyaW0ubWFwKCB2ID0+ICcgICAgICAnICsgdiApIFxuICAgIFxuICAgIHJldHVybiBjYlRhYmJlZC5qb2luKCdcXG4nKVxuICB9LFxuXG4gIGNyZWF0ZVBhcmFtZXRlckRlc2NyaXB0b3JzKCBjYiApIHtcbiAgICAvLyBbe25hbWU6ICdhbXBsaXR1ZGUnLCBkZWZhdWx0VmFsdWU6IDAuMjUsIG1pblZhbHVlOiAwLCBtYXhWYWx1ZTogMX1dO1xuICAgIGxldCBwYXJhbVN0ciA9ICcnXG5cbiAgICAvL2ZvciggbGV0IHVnZW4gb2YgY2IucGFyYW1zLnZhbHVlcygpICkge1xuICAgIC8vICBwYXJhbVN0ciArPSBgeyBuYW1lOicke3VnZW4ubmFtZX0nLCBkZWZhdWx0VmFsdWU6JHt1Z2VuLnZhbHVlfSwgbWluVmFsdWU6JHt1Z2VuLm1pbn0sIG1heFZhbHVlOiR7dWdlbi5tYXh9IH0sXFxuICAgICAgYFxuICAgIC8vfVxuICAgIGZvciggbGV0IHVnZW4gb2YgY2IucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgcGFyYW1TdHIgKz0gYHsgbmFtZTonJHt1Z2VuLm5hbWV9JywgYXV0b21hdGlvblJhdGU6J2stcmF0ZScsIGRlZmF1bHRWYWx1ZToke3VnZW4uZGVmYXVsdFZhbHVlfSwgbWluVmFsdWU6JHt1Z2VuLm1pbn0sIG1heFZhbHVlOiR7dWdlbi5tYXh9IH0sXFxuICAgICAgYFxuICAgIH1cbiAgICByZXR1cm4gcGFyYW1TdHJcbiAgfSxcblxuICBjcmVhdGVQYXJhbWV0ZXJEZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBzdHIgPSBjYi5wYXJhbXMuc2l6ZSA+IDAgPyAnXFxuICAgICAgJyA6ICcnXG4gICAgZm9yKCBsZXQgdWdlbiBvZiBjYi5wYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICBzdHIgKz0gYGNvbnN0ICR7dWdlbi5uYW1lfSA9IHBhcmFtZXRlcnMuJHt1Z2VuLm5hbWV9WzBdXFxuICAgICAgYFxuICAgIH1cblxuICAgIHJldHVybiBzdHJcbiAgfSxcblxuICBjcmVhdGVQYXJhbWV0ZXJBcmd1bWVudHMoIGNiICkge1xuICAgIGxldCAgcGFyYW1MaXN0ID0gJydcbiAgICBmb3IoIGxldCB1Z2VuIG9mIGNiLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgIHBhcmFtTGlzdCArPSB1Z2VuLm5hbWUgKyAnW2ldLCdcbiAgICB9XG4gICAgcGFyYW1MaXN0ID0gcGFyYW1MaXN0LnNsaWNlKCAwLCAtMSApXG5cbiAgICByZXR1cm4gcGFyYW1MaXN0XG4gIH0sXG5cbiAgY3JlYXRlSW5wdXREZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBzdHIgPSBjYi5pbnB1dHMuc2l6ZSA+IDAgPyAnXFxuJyA6ICcnXG4gICAgZm9yKCBsZXQgaW5wdXQgb2YgIGNiLmlucHV0cy52YWx1ZXMoKSApIHtcbiAgICAgIHN0ciArPSBgY29uc3QgJHtpbnB1dC5uYW1lfSA9IGlucHV0c1sgJHtpbnB1dC5pbnB1dE51bWJlcn0gXVsgJHtpbnB1dC5jaGFubmVsTnVtYmVyfSBdXFxuICAgICAgYFxuICAgIH1cblxuICAgIHJldHVybiBzdHJcbiAgfSxcblxuXG4gIGNyZWF0ZUlucHV0QXJndW1lbnRzKCBjYiApIHtcbiAgICBsZXQgIHBhcmFtTGlzdCA9ICcnXG4gICAgZm9yKCBsZXQgaW5wdXQgb2YgY2IuaW5wdXRzLnZhbHVlcygpICkge1xuICAgICAgcGFyYW1MaXN0ICs9IGlucHV0Lm5hbWUgKyAnW2ldLCdcbiAgICB9XG4gICAgcGFyYW1MaXN0ID0gcGFyYW1MaXN0LnNsaWNlKCAwLCAtMSApXG5cbiAgICByZXR1cm4gcGFyYW1MaXN0XG4gIH0sXG4gICAgICBcbiAgY3JlYXRlRnVuY3Rpb25EZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBtZW1iZXJTdHJpbmcgPSBjYi5tZW1iZXJzLnNpemUgPiAwID8gJ1xcbicgOiAnJ1xuICAgIGxldCBtZW1vID0ge31cbiAgICBmb3IoIGxldCBkaWN0IG9mIGNiLm1lbWJlcnMudmFsdWVzKCkgKSB7XG4gICAgICBjb25zdCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICAgIHZhbHVlID0gZGljdFsgbmFtZSBdXG5cbiAgICAgIGlmKCBtZW1vWyBuYW1lIF0gIT09IHVuZGVmaW5lZCApIGNvbnRpbnVlXG4gICAgICBtZW1vWyBuYW1lIF0gPSB0cnVlXG5cbiAgICAgIG1lbWJlclN0cmluZyArPSBgICAgICAgY29uc3QgJHtuYW1lfSA9ICR7dmFsdWV9XFxuYFxuICAgIH1cblxuICAgIHJldHVybiBtZW1iZXJTdHJpbmdcbiAgfSxcblxuICBjcmVhdGVXb3JrbGV0UHJvY2Vzc29yKCBncmFwaCwgbmFtZSwgZGVidWcsIG1lbT00NDEwMCoxMCwgX19ldmFsPWZhbHNlLCBrZXJuZWw9ZmFsc2UgKSB7XG4gICAgLy9jb25zdCBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCA0MDk2LCBGbG9hdDY0QXJyYXkgKVxuICAgIGNvbnN0IGNiID0gZ2VuLmNyZWF0ZUNhbGxiYWNrKCBncmFwaCwgbWVtLCBkZWJ1ZyApXG4gICAgY29uc3QgaW5wdXRzID0gY2IuaW5wdXRzXG5cbiAgICAvLyBnZXQgYWxsIGlucHV0cyBhbmQgY3JlYXRlIGFwcHJvcHJpYXRlIGF1ZGlvcGFyYW0gaW5pdGlhbGl6ZXJzXG4gICAgY29uc3QgcGFyYW1ldGVyRGVzY3JpcHRvcnMgPSB0aGlzLmNyZWF0ZVBhcmFtZXRlckRlc2NyaXB0b3JzKCBjYiApXG4gICAgY29uc3QgcGFyYW1ldGVyRGVyZWZlcmVuY2VzID0gdGhpcy5jcmVhdGVQYXJhbWV0ZXJEZXJlZmVyZW5jZXMoIGNiIClcbiAgICBjb25zdCBwYXJhbUxpc3QgPSB0aGlzLmNyZWF0ZVBhcmFtZXRlckFyZ3VtZW50cyggY2IgKVxuICAgIGNvbnN0IGlucHV0RGVyZWZlcmVuY2VzID0gdGhpcy5jcmVhdGVJbnB1dERlcmVmZXJlbmNlcyggY2IgKVxuICAgIGNvbnN0IGlucHV0TGlzdCA9IHRoaXMuY3JlYXRlSW5wdXRBcmd1bWVudHMoIGNiICkgICBcbiAgICBjb25zdCBtZW1iZXJTdHJpbmcgPSB0aGlzLmNyZWF0ZUZ1bmN0aW9uRGVyZWZlcmVuY2VzKCBjYiApXG5cbiAgICAvLyBjaGFuZ2Ugb3V0cHV0IGJhc2VkIG9uIG51bWJlciBvZiBjaGFubmVscy5cbiAgICBjb25zdCBnZW5pc2hPdXRwdXRMaW5lID0gY2IuaXNTdGVyZW8gPT09IGZhbHNlXG4gICAgICA/IGBsZWZ0WyBpIF0gPSBtZW1vcnlbMF1gXG4gICAgICA6IGBsZWZ0WyBpIF0gPSBtZW1vcnlbMF07XFxuXFx0XFx0cmlnaHRbIGkgXSA9IG1lbW9yeVsxXVxcbmBcblxuICAgIGNvbnN0IHByZXR0eUNhbGxiYWNrID0gdGhpcy5wcmV0dHlQcmludENhbGxiYWNrKCBjYiApXG5cbiAgICAvLyBpZiBfX2V2YWwsIHByb3ZpZGUgdGhlIGFiaWxpdHkgb2YgZXZhbCBjb2RlIGluIHdvcmtsZXRcbiAgICBjb25zdCBldmFsU3RyaW5nID0gX19ldmFsXG4gICAgICA/IGAgZWxzZSBpZiggZXZlbnQuZGF0YS5rZXkgPT09ICdldmFsJyApIHtcbiAgICAgICAgZXZhbCggZXZlbnQuZGF0YS5jb2RlIClcbiAgICAgIH1cbmBcbiAgICAgIDogJydcblxuICAgIGNvbnN0IGtlcm5lbEZuY1N0cmluZyA9IGB0aGlzLmtlcm5lbCA9IGZ1bmN0aW9uKCBtZW1vcnkgKSB7XG4gICAgICAke3ByZXR0eUNhbGxiYWNrfVxuICAgIH1gXG4gICAgLyoqKioqIGJlZ2luIGNhbGxiYWNrIGNvZGUgKioqKi9cbiAgICAvLyBub3RlIHRoYXQgd2UgaGF2ZSB0byBjaGVjayB0byBzZWUgdGhhdCBtZW1vcnkgaGFzIGJlZW4gcGFzc2VkXG4gICAgLy8gdG8gdGhlIHdvcmtlciBiZWZvcmUgcnVubmluZyB0aGUgY2FsbGJhY2sgZnVuY3Rpb24sIG90aGVyd2lzZVxuICAgIC8vIGl0IGNhbiBiZSBwYXNzZWQgdG9vIHNsb3dseSBhbmQgZmFpbCBvbiBvY2Nhc3Npb25cblxuICAgIGNvbnNvbGUubG9nKCBcIktFUk5FTFwiLCBrZXJuZWwgKVxuICAgIGNvbnN0IHdvcmtsZXRDb2RlID0gYFxuY2xhc3MgJHtuYW1lfVByb2Nlc3NvciBleHRlbmRzIEF1ZGlvV29ya2xldFByb2Nlc3NvciB7XG5cbiAgc3RhdGljIGdldCBwYXJhbWV0ZXJEZXNjcmlwdG9ycygpIHtcbiAgICBjb25zdCBwYXJhbXMgPSBbXG4gICAgICAkeyBwYXJhbWV0ZXJEZXNjcmlwdG9ycyB9ICAgICAgXG4gICAgXVxuICAgIHJldHVybiBwYXJhbXNcbiAgfVxuIFxuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApIHtcbiAgICBzdXBlciggb3B0aW9ucyApXG4gICAgdGhpcy5wb3J0Lm9ubWVzc2FnZSA9IHRoaXMuaGFuZGxlTWVzc2FnZS5iaW5kKCB0aGlzIClcbiAgICB0aGlzLmluaXRpYWxpemVkID0gZmFsc2VcbiAgICAkeyBrZXJuZWwgPyBrZXJuZWxGbmNTdHJpbmcgOiAnJyB9XG4gIH1cblxuICBoYW5kbGVNZXNzYWdlKCBldmVudCApIHtcbiAgICBpZiggZXZlbnQuZGF0YS5rZXkgPT09ICdpbml0JyApIHtcbiAgICAgIHRoaXMubWVtb3J5ID0gZXZlbnQuZGF0YS5tZW1vcnlcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgfWVsc2UgaWYoIGV2ZW50LmRhdGEua2V5ID09PSAnc2V0JyApIHtcbiAgICAgIHRoaXMubWVtb3J5WyBldmVudC5kYXRhLmlkeCBdID0gZXZlbnQuZGF0YS52YWx1ZVxuICAgIH1lbHNlIGlmKCBldmVudC5kYXRhLmtleSA9PT0gJ2dldCcgKSB7XG4gICAgICB0aGlzLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3JldHVybicsIGlkeDpldmVudC5kYXRhLmlkeCwgdmFsdWU6dGhpcy5tZW1vcnlbZXZlbnQuZGF0YS5pZHhdIH0pICAgICBcbiAgICB9JHsgZXZhbFN0cmluZyB9XG4gIH1cblxuICBwcm9jZXNzKCBpbnB1dHMsIG91dHB1dHMsIHBhcmFtZXRlcnMgKSB7XG4gICAgaWYoIHRoaXMuaW5pdGlhbGl6ZWQgPT09IHRydWUgKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBvdXRwdXRzWzBdXG4gICAgICBjb25zdCBsZWZ0ICAgPSBvdXRwdXRbIDAgXVxuICAgICAgY29uc3QgcmlnaHQgID0gb3V0cHV0WyAxIF1cbiAgICAgIGNvbnN0IGxlbiAgICA9IGxlZnQubGVuZ3RoXG4gICAgICBjb25zdCBtZW1vcnkgPSB0aGlzLm1lbW9yeSAke3BhcmFtZXRlckRlcmVmZXJlbmNlc30ke2lucHV0RGVyZWZlcmVuY2VzfSR7bWVtYmVyU3RyaW5nfVxuICAgICAgJHtrZXJuZWwgPT09IHRydWUgPyAnY29uc3Qga2VybmVsID0gdGhpcy5rZXJuZWwnIDogJycgfVxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IGxlbjsgKytpICkge1xuICAgICAgICAke2tlcm5lbCA9PT0gdHJ1ZSA/ICdrZXJuZWwoIG1lbW9yeSApXFxuJyA6IHByZXR0eUNhbGxiYWNrfVxuICAgICAgICAke2dlbmlzaE91dHB1dExpbmV9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cbiAgICBcbnJlZ2lzdGVyUHJvY2Vzc29yKCAnJHtuYW1lfScsICR7bmFtZX1Qcm9jZXNzb3IpYFxuXG4gICAgXG4gICAgLyoqKioqIGVuZCBjYWxsYmFjayBjb2RlICoqKioqL1xuXG5cbiAgICBpZiggZGVidWcgPT09IHRydWUgKSBjb25zb2xlLmxvZyggd29ya2xldENvZGUgKVxuXG4gICAgY29uc3QgdXJsID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoXG4gICAgICBuZXcgQmxvYihcbiAgICAgICAgWyB3b3JrbGV0Q29kZSBdLCBcbiAgICAgICAgeyB0eXBlOiAndGV4dC9qYXZhc2NyaXB0JyB9XG4gICAgICApXG4gICAgKVxuXG4gICAgcmV0dXJuIFsgdXJsLCB3b3JrbGV0Q29kZSwgaW5wdXRzLCBjYi5wYXJhbXMsIGNiLmlzU3RlcmVvIF0gXG4gIH0sXG5cbiAgcmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50OiBbXSxcbiAgcmVnaXN0ZXIoIHVnZW4gKSB7XG4gICAgaWYoIHRoaXMucmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50LmluZGV4T2YoIHVnZW4gKSA9PT0gLTEgKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyZWRGb3JOb2RlQXNzaWdubWVudC5wdXNoKCB1Z2VuIClcbiAgICB9XG4gIH0sXG5cbiAgcGxheVdvcmtsZXQoIGdyYXBoLCBuYW1lLCBkZWJ1Zz1mYWxzZSwgbWVtPTQ0MTAwICogNjAsIF9fZXZhbD1mYWxzZSwga2VybmVsPWZhbHNlICkge1xuICAgIHV0aWxpdGllcy5jbGVhcigpXG5cbiAgICBjb25zdCBbIHVybCwgY29kZVN0cmluZywgaW5wdXRzLCBwYXJhbXMsIGlzU3RlcmVvIF0gPSB1dGlsaXRpZXMuY3JlYXRlV29ya2xldFByb2Nlc3NvciggZ3JhcGgsIG5hbWUsIGRlYnVnLCBtZW0sIF9fZXZhbCwga2VybmVsIClcblxuICAgIGNvbnN0IG5vZGVQcm9taXNlID0gbmV3IFByb21pc2UoIChyZXNvbHZlLHJlamVjdCkgPT4ge1xuICAgXG4gICAgICB1dGlsaXRpZXMuY3R4LmF1ZGlvV29ya2xldC5hZGRNb2R1bGUoIHVybCApLnRoZW4oICgpPT4ge1xuICAgICAgICBjb25zdCB3b3JrbGV0Tm9kZSA9IG5ldyBBdWRpb1dvcmtsZXROb2RlKCB1dGlsaXRpZXMuY3R4LCBuYW1lLCB7IG91dHB1dENoYW5uZWxDb3VudDpbIGlzU3RlcmVvID8gMiA6IDEgXSB9KVxuXG4gICAgICAgIHdvcmtsZXROb2RlLmNhbGxiYWNrcyA9IHt9XG4gICAgICAgIHdvcmtsZXROb2RlLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgICAgICAgICBpZiggZXZlbnQuZGF0YS5tZXNzYWdlID09PSAncmV0dXJuJyApIHtcbiAgICAgICAgICAgIHdvcmtsZXROb2RlLmNhbGxiYWNrc1sgZXZlbnQuZGF0YS5pZHggXSggZXZlbnQuZGF0YS52YWx1ZSApXG4gICAgICAgICAgICBkZWxldGUgd29ya2xldE5vZGUuY2FsbGJhY2tzWyBldmVudC5kYXRhLmlkeCBdXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgd29ya2xldE5vZGUuZ2V0TWVtb3J5VmFsdWUgPSBmdW5jdGlvbiggaWR4LCBjYiApIHtcbiAgICAgICAgICB0aGlzLndvcmtsZXRDYWxsYmFja3NbIGlkeCBdID0gY2JcbiAgICAgICAgICB0aGlzLndvcmtsZXROb2RlLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J2dldCcsIGlkeDogaWR4IH0pXG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHdvcmtsZXROb2RlLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J2luaXQnLCBtZW1vcnk6Z2VuLm1lbW9yeS5oZWFwIH0pXG4gICAgICAgIHV0aWxpdGllcy53b3JrbGV0Tm9kZSA9IHdvcmtsZXROb2RlXG5cbiAgICAgICAgdXRpbGl0aWVzLnJlZ2lzdGVyZWRGb3JOb2RlQXNzaWdubWVudC5mb3JFYWNoKCB1Z2VuID0+IHVnZW4ubm9kZSA9IHdvcmtsZXROb2RlIClcbiAgICAgICAgdXRpbGl0aWVzLnJlZ2lzdGVyZWRGb3JOb2RlQXNzaWdubWVudC5sZW5ndGggPSAwXG5cbiAgICAgICAgLy8gYXNzaWduIGFsbCBwYXJhbXMgYXMgcHJvcGVydGllcyBvZiBub2RlIGZvciBlYXNpZXIgcmVmZXJlbmNlIFxuICAgICAgICBmb3IoIGxldCBkaWN0IG9mIGlucHV0cy52YWx1ZXMoKSApIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXVxuICAgICAgICAgIGNvbnN0IHBhcmFtID0gd29ya2xldE5vZGUucGFyYW1ldGVycy5nZXQoIG5hbWUgKVxuICAgICAgXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB3b3JrbGV0Tm9kZSwgbmFtZSwge1xuICAgICAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgICAgICBwYXJhbS52YWx1ZSA9IHZcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwYXJhbS52YWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBmb3IoIGxldCB1Z2VuIG9mIHBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgICAgICBjb25zdCBuYW1lID0gdWdlbi5uYW1lXG4gICAgICAgICAgY29uc3QgcGFyYW0gPSB3b3JrbGV0Tm9kZS5wYXJhbWV0ZXJzLmdldCggbmFtZSApXG4gICAgICAgICAgdWdlbi53YWFwaSA9IHBhcmFtIFxuICAgICAgICAgIC8vIGluaXRpYWxpemU/XG4gICAgICAgICAgcGFyYW0udmFsdWUgPSB1Z2VuLmRlZmF1bHRWYWx1ZVxuXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB3b3JrbGV0Tm9kZSwgbmFtZSwge1xuICAgICAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgICAgICBwYXJhbS52YWx1ZSA9IHZcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwYXJhbS52YWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBpZiggdXRpbGl0aWVzLmNvbnNvbGUgKSB1dGlsaXRpZXMuY29uc29sZS5zZXRWYWx1ZSggY29kZVN0cmluZyApXG5cbiAgICAgICAgd29ya2xldE5vZGUuY29ubmVjdCggdXRpbGl0aWVzLmN0eC5kZXN0aW5hdGlvbiApXG5cbiAgICAgICAgcmVzb2x2ZSggd29ya2xldE5vZGUgKVxuICAgICAgfSlcblxuICAgIH0pXG5cbiAgICByZXR1cm4gbm9kZVByb21pc2VcbiAgfSxcbiAgXG4gIHBsYXlHcmFwaCggZ3JhcGgsIGRlYnVnLCBtZW09NDQxMDAqMTAsIG1lbVR5cGU9RmxvYXQzMkFycmF5ICkge1xuICAgIHV0aWxpdGllcy5jbGVhcigpXG4gICAgaWYoIGRlYnVnID09PSB1bmRlZmluZWQgKSBkZWJ1ZyA9IGZhbHNlXG4gICAgICAgICAgXG4gICAgdGhpcy5pc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIGdyYXBoIClcblxuICAgIHV0aWxpdGllcy5jYWxsYmFjayA9IGdlbi5jcmVhdGVDYWxsYmFjayggZ3JhcGgsIG1lbSwgZGVidWcsIGZhbHNlLCBtZW1UeXBlIClcbiAgICBcbiAgICBpZiggdXRpbGl0aWVzLmNvbnNvbGUgKSB1dGlsaXRpZXMuY29uc29sZS5zZXRWYWx1ZSggdXRpbGl0aWVzLmNhbGxiYWNrLnRvU3RyaW5nKCkgKVxuXG4gICAgcmV0dXJuIHV0aWxpdGllcy5jYWxsYmFja1xuICB9LFxuXG4gIGxvYWRTYW1wbGUoIHNvdW5kRmlsZVBhdGgsIGRhdGEgKSB7XG4gICAgY29uc3QgaXNMb2FkZWQgPSB1dGlsaXRpZXMuYnVmZmVyc1sgc291bmRGaWxlUGF0aCBdICE9PSB1bmRlZmluZWRcblxuICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHJlcS5vcGVuKCAnR0VUJywgc291bmRGaWxlUGF0aCwgdHJ1ZSApXG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcicgXG4gICAgXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUscmVqZWN0KSA9PiB7XG4gICAgICBpZiggIWlzTG9hZGVkICkge1xuICAgICAgICByZXEub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGF1ZGlvRGF0YSA9IHJlcS5yZXNwb25zZVxuXG4gICAgICAgICAgdXRpbGl0aWVzLmN0eC5kZWNvZGVBdWRpb0RhdGEoIGF1ZGlvRGF0YSwgKGJ1ZmZlcikgPT4ge1xuICAgICAgICAgICAgZGF0YS5idWZmZXIgPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMClcbiAgICAgICAgICAgIHV0aWxpdGllcy5idWZmZXJzWyBzb3VuZEZpbGVQYXRoIF0gPSBkYXRhLmJ1ZmZlclxuICAgICAgICAgICAgcmVzb2x2ZSggZGF0YS5idWZmZXIgKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICBzZXRUaW1lb3V0KCAoKT0+IHJlc29sdmUoIHV0aWxpdGllcy5idWZmZXJzWyBzb3VuZEZpbGVQYXRoIF0gKSwgMCApXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmKCAhaXNMb2FkZWQgKSByZXEuc2VuZCgpXG5cbiAgICByZXR1cm4gcHJvbWlzZVxuICB9XG5cbn1cblxudXRpbGl0aWVzLmNsZWFyLmNhbGxiYWNrcyA9IFtdXG5cbm1vZHVsZS5leHBvcnRzID0gdXRpbGl0aWVzXG4iLCIndXNlIHN0cmljdCdcblxuLypcbiAqIG1hbnkgd2luZG93cyBoZXJlIGFkYXB0ZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vY29yYmFuYnJvb2svZHNwLmpzL2Jsb2IvbWFzdGVyL2RzcC5qc1xuICogc3RhcnRpbmcgYXQgbGluZSAxNDI3XG4gKiB0YWtlbiA4LzE1LzE2XG4qLyBcblxuY29uc3Qgd2luZG93cyA9IG1vZHVsZS5leHBvcnRzID0geyBcbiAgYmFydGxldHQoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDIgLyAobGVuZ3RoIC0gMSkgKiAoKGxlbmd0aCAtIDEpIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpIFxuICB9LFxuXG4gIGJhcnRsZXR0SGFubiggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC42MiAtIDAuNDggKiBNYXRoLmFicyhpbmRleCAvIChsZW5ndGggLSAxKSAtIDAuNSkgLSAwLjM4ICogTWF0aC5jb3MoIDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgYmxhY2ttYW4oIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIGxldCBhMCA9ICgxIC0gYWxwaGEpIC8gMixcbiAgICAgICAgYTEgPSAwLjUsXG4gICAgICAgIGEyID0gYWxwaGEgLyAyXG5cbiAgICByZXR1cm4gYTAgLSBhMSAqIE1hdGguY29zKDIgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpICsgYTIgKiBNYXRoLmNvcyg0ICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGNvc2luZSggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gTWF0aC5jb3MoTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gTWF0aC5QSSAvIDIpXG4gIH0sXG5cbiAgZ2F1c3MoIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIHJldHVybiBNYXRoLnBvdyhNYXRoLkUsIC0wLjUgKiBNYXRoLnBvdygoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSAvIChhbHBoYSAqIChsZW5ndGggLSAxKSAvIDIpLCAyKSlcbiAgfSxcblxuICBoYW1taW5nKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjU0IC0gMC40NiAqIE1hdGguY29zKCBNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGhhbm4oIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNSAqICgxIC0gTWF0aC5jb3MoIE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpIClcbiAgfSxcblxuICBsYW5jem9zKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIGxldCB4ID0gMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMTtcbiAgICByZXR1cm4gTWF0aC5zaW4oTWF0aC5QSSAqIHgpIC8gKE1hdGguUEkgKiB4KVxuICB9LFxuXG4gIHJlY3Rhbmd1bGFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAxXG4gIH0sXG5cbiAgdHJpYW5ndWxhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMiAvIGxlbmd0aCAqIChsZW5ndGggLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSlcbiAgfSxcblxuICAvLyBwYXJhYm9sYVxuICB3ZWxjaCggbGVuZ3RoLCBfaW5kZXgsIGlnbm9yZSwgc2hpZnQ9MCApIHtcbiAgICAvL3dbbl0gPSAxIC0gTWF0aC5wb3coICggbiAtICggKE4tMSkgLyAyICkgKSAvICgoIE4tMSApIC8gMiApLCAyIClcbiAgICBjb25zdCBpbmRleCA9IHNoaWZ0ID09PSAwID8gX2luZGV4IDogKF9pbmRleCArIE1hdGguZmxvb3IoIHNoaWZ0ICogbGVuZ3RoICkpICUgbGVuZ3RoXG4gICAgY29uc3Qgbl8xX292ZXIyID0gKGxlbmd0aCAtIDEpIC8gMiBcblxuICAgIHJldHVybiAxIC0gTWF0aC5wb3coICggaW5kZXggLSBuXzFfb3ZlcjIgKSAvIG5fMV9vdmVyMiwgMiApXG4gIH0sXG4gIGludmVyc2V3ZWxjaCggbGVuZ3RoLCBfaW5kZXgsIGlnbm9yZSwgc2hpZnQ9MCApIHtcbiAgICAvL3dbbl0gPSAxIC0gTWF0aC5wb3coICggbiAtICggKE4tMSkgLyAyICkgKSAvICgoIE4tMSApIC8gMiApLCAyIClcbiAgICBsZXQgaW5kZXggPSBzaGlmdCA9PT0gMCA/IF9pbmRleCA6IChfaW5kZXggKyBNYXRoLmZsb29yKCBzaGlmdCAqIGxlbmd0aCApKSAlIGxlbmd0aFxuICAgIGNvbnN0IG5fMV9vdmVyMiA9IChsZW5ndGggLSAxKSAvIDJcblxuICAgIHJldHVybiBNYXRoLnBvdyggKCBpbmRleCAtIG5fMV9vdmVyMiApIC8gbl8xX292ZXIyLCAyIClcbiAgfSxcblxuICBwYXJhYm9sYSggbGVuZ3RoLCBpbmRleCApIHtcbiAgICBpZiggaW5kZXggPD0gbGVuZ3RoIC8gMiApIHtcbiAgICAgIHJldHVybiB3aW5kb3dzLmludmVyc2V3ZWxjaCggbGVuZ3RoIC8gMiwgaW5kZXggKSAtIDFcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiAxIC0gd2luZG93cy5pbnZlcnNld2VsY2goIGxlbmd0aCAvIDIsIGluZGV4IC0gbGVuZ3RoIC8gMiApXG4gICAgfVxuICB9LFxuXG4gIGV4cG9uZW50aWFsKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICByZXR1cm4gTWF0aC5wb3coIGluZGV4IC8gbGVuZ3RoLCBhbHBoYSApXG4gIH0sXG5cbiAgbGluZWFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiBpbmRleCAvIGxlbmd0aFxuICB9XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3dyYXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBzaWduYWwgPSBpbnB1dHNbMF0sIG1pbiA9IGlucHV0c1sxXSwgbWF4ID0gaW5wdXRzWzJdLFxuICAgICAgICBvdXQsIGRpZmZcblxuICAgIC8vb3V0ID0gYCgoKCR7aW5wdXRzWzBdfSAtICR7dGhpcy5taW59KSAlICR7ZGlmZn0gICsgJHtkaWZmfSkgJSAke2RpZmZ9ICsgJHt0aGlzLm1pbn0pYFxuICAgIC8vY29uc3QgbG9uZyBudW1XcmFwcyA9IGxvbmcoKHYtbG8pL3JhbmdlKSAtICh2IDwgbG8pO1xuICAgIC8vcmV0dXJuIHYgLSByYW5nZSAqIGRvdWJsZShudW1XcmFwcyk7ICAgXG4gICAgXG4gICAgaWYoIHRoaXMubWluID09PSAwICkge1xuICAgICAgZGlmZiA9IG1heFxuICAgIH1lbHNlIGlmICggaXNOYU4oIG1heCApIHx8IGlzTmFOKCBtaW4gKSApIHtcbiAgICAgIGRpZmYgPSBgJHttYXh9IC0gJHttaW59YFxuICAgIH1lbHNle1xuICAgICAgZGlmZiA9IG1heCAtIG1pblxuICAgIH1cblxuICAgIG91dCA9XG5gIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cbiAgaWYoICR7dGhpcy5uYW1lfSA8ICR7dGhpcy5taW59ICkgJHt0aGlzLm5hbWV9ICs9ICR7ZGlmZn1cbiAgZWxzZSBpZiggJHt0aGlzLm5hbWV9ID4gJHt0aGlzLm1heH0gKSAke3RoaXMubmFtZX0gLT0gJHtkaWZmfVxuXG5gXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsICcgJyArIG91dCBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBtaW4sIFxuICAgIG1heCxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW4xLCBtaW4sIG1heCBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbnZhciBvYmplY3RDcmVhdGUgPSBPYmplY3QuY3JlYXRlIHx8IG9iamVjdENyZWF0ZVBvbHlmaWxsXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IG9iamVjdEtleXNQb2x5ZmlsbFxudmFyIGJpbmQgPSBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCB8fCBmdW5jdGlvbkJpbmRQb2x5ZmlsbFxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcywgJ19ldmVudHMnKSkge1xuICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gIH1cblxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG52YXIgZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG52YXIgaGFzRGVmaW5lUHJvcGVydHk7XG50cnkge1xuICB2YXIgbyA9IHt9O1xuICBpZiAoT2JqZWN0LmRlZmluZVByb3BlcnR5KSBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgJ3gnLCB7IHZhbHVlOiAwIH0pO1xuICBoYXNEZWZpbmVQcm9wZXJ0eSA9IG8ueCA9PT0gMDtcbn0gY2F0Y2ggKGVycikgeyBoYXNEZWZpbmVQcm9wZXJ0eSA9IGZhbHNlIH1cbmlmIChoYXNEZWZpbmVQcm9wZXJ0eSkge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnRFbWl0dGVyLCAnZGVmYXVsdE1heExpc3RlbmVycycsIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24oYXJnKSB7XG4gICAgICAvLyBjaGVjayB3aGV0aGVyIHRoZSBpbnB1dCBpcyBhIHBvc2l0aXZlIG51bWJlciAod2hvc2UgdmFsdWUgaXMgemVybyBvclxuICAgICAgLy8gZ3JlYXRlciBhbmQgbm90IGEgTmFOKS5cbiAgICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyB8fCBhcmcgPCAwIHx8IGFyZyAhPT0gYXJnKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImRlZmF1bHRNYXhMaXN0ZW5lcnNcIiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gICAgICBkZWZhdWx0TWF4TGlzdGVuZXJzID0gYXJnO1xuICAgIH1cbiAgfSk7XG59IGVsc2Uge1xuICBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IGRlZmF1bHRNYXhMaXN0ZW5lcnM7XG59XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycyhuKSB7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJuXCIgYXJndW1lbnQgbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uICRnZXRNYXhMaXN0ZW5lcnModGhhdCkge1xuICBpZiAodGhhdC5fbWF4TGlzdGVuZXJzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICByZXR1cm4gdGhhdC5fbWF4TGlzdGVuZXJzO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuICRnZXRNYXhMaXN0ZW5lcnModGhpcyk7XG59O1xuXG4vLyBUaGVzZSBzdGFuZGFsb25lIGVtaXQqIGZ1bmN0aW9ucyBhcmUgdXNlZCB0byBvcHRpbWl6ZSBjYWxsaW5nIG9mIGV2ZW50XG4vLyBoYW5kbGVycyBmb3IgZmFzdCBjYXNlcyBiZWNhdXNlIGVtaXQoKSBpdHNlbGYgb2Z0ZW4gaGFzIGEgdmFyaWFibGUgbnVtYmVyIG9mXG4vLyBhcmd1bWVudHMgYW5kIGNhbiBiZSBkZW9wdGltaXplZCBiZWNhdXNlIG9mIHRoYXQuIFRoZXNlIGZ1bmN0aW9ucyBhbHdheXMgaGF2ZVxuLy8gdGhlIHNhbWUgbnVtYmVyIG9mIGFyZ3VtZW50cyBhbmQgdGh1cyBkbyBub3QgZ2V0IGRlb3B0aW1pemVkLCBzbyB0aGUgY29kZVxuLy8gaW5zaWRlIHRoZW0gY2FuIGV4ZWN1dGUgZmFzdGVyLlxuZnVuY3Rpb24gZW1pdE5vbmUoaGFuZGxlciwgaXNGbiwgc2VsZikge1xuICBpZiAoaXNGbilcbiAgICBoYW5kbGVyLmNhbGwoc2VsZik7XG4gIGVsc2Uge1xuICAgIHZhciBsZW4gPSBoYW5kbGVyLmxlbmd0aDtcbiAgICB2YXIgbGlzdGVuZXJzID0gYXJyYXlDbG9uZShoYW5kbGVyLCBsZW4pO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpXG4gICAgICBsaXN0ZW5lcnNbaV0uY2FsbChzZWxmKTtcbiAgfVxufVxuZnVuY3Rpb24gZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEpO1xuICB9XG59XG5mdW5jdGlvbiBlbWl0VHdvKGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZzEsIGFyZzIpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5jYWxsKHNlbGYsIGFyZzEsIGFyZzIpO1xuICBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgbGlzdGVuZXJzW2ldLmNhbGwoc2VsZiwgYXJnMSwgYXJnMik7XG4gIH1cbn1cbmZ1bmN0aW9uIGVtaXRUaHJlZShoYW5kbGVyLCBpc0ZuLCBzZWxmLCBhcmcxLCBhcmcyLCBhcmczKSB7XG4gIGlmIChpc0ZuKVxuICAgIGhhbmRsZXIuY2FsbChzZWxmLCBhcmcxLCBhcmcyLCBhcmczKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5jYWxsKHNlbGYsIGFyZzEsIGFyZzIsIGFyZzMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHNlbGYsIGFyZ3MpIHtcbiAgaWYgKGlzRm4pXG4gICAgaGFuZGxlci5hcHBseShzZWxmLCBhcmdzKTtcbiAgZWxzZSB7XG4gICAgdmFyIGxlbiA9IGhhbmRsZXIubGVuZ3RoO1xuICAgIHZhciBsaXN0ZW5lcnMgPSBhcnJheUNsb25lKGhhbmRsZXIsIGxlbik7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSlcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseShzZWxmLCBhcmdzKTtcbiAgfVxufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGV2ZW50cztcbiAgdmFyIGRvRXJyb3IgPSAodHlwZSA9PT0gJ2Vycm9yJyk7XG5cbiAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICBpZiAoZXZlbnRzKVxuICAgIGRvRXJyb3IgPSAoZG9FcnJvciAmJiBldmVudHMuZXJyb3IgPT0gbnVsbCk7XG4gIGVsc2UgaWYgKCFkb0Vycm9yKVxuICAgIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmIChkb0Vycm9yKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKVxuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBBdCBsZWFzdCBnaXZlIHNvbWUga2luZCBvZiBjb250ZXh0IHRvIHRoZSB1c2VyXG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmhhbmRsZWQgXCJlcnJvclwiIGV2ZW50LiAoJyArIGVyICsgJyknKTtcbiAgICAgIGVyci5jb250ZXh0ID0gZXI7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGhhbmRsZXIgPSBldmVudHNbdHlwZV07XG5cbiAgaWYgKCFoYW5kbGVyKVxuICAgIHJldHVybiBmYWxzZTtcblxuICB2YXIgaXNGbiA9IHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nO1xuICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICBzd2l0Y2ggKGxlbikge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgIGNhc2UgMTpcbiAgICAgIGVtaXROb25lKGhhbmRsZXIsIGlzRm4sIHRoaXMpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAyOlxuICAgICAgZW1pdE9uZShoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAzOlxuICAgICAgZW1pdFR3byhoYW5kbGVyLCBpc0ZuLCB0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIDQ6XG4gICAgICBlbWl0VGhyZWUoaGFuZGxlciwgaXNGbiwgdGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0sIGFyZ3VtZW50c1szXSk7XG4gICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgIGRlZmF1bHQ6XG4gICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIGVtaXRNYW55KGhhbmRsZXIsIGlzRm4sIHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5mdW5jdGlvbiBfYWRkTGlzdGVuZXIodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lciwgcHJlcGVuZCkge1xuICB2YXIgbTtcbiAgdmFyIGV2ZW50cztcbiAgdmFyIGV4aXN0aW5nO1xuXG4gIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuICBpZiAoIWV2ZW50cykge1xuICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgIHRhcmdldC5fZXZlbnRzQ291bnQgPSAwO1xuICB9IGVsc2Uge1xuICAgIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gICAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICAgIGlmIChldmVudHMubmV3TGlzdGVuZXIpIHtcbiAgICAgIHRhcmdldC5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgPyBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICAgICAgLy8gUmUtYXNzaWduIGBldmVudHNgIGJlY2F1c2UgYSBuZXdMaXN0ZW5lciBoYW5kbGVyIGNvdWxkIGhhdmUgY2F1c2VkIHRoZVxuICAgICAgLy8gdGhpcy5fZXZlbnRzIHRvIGJlIGFzc2lnbmVkIHRvIGEgbmV3IG9iamVjdFxuICAgICAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gICAgfVxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdO1xuICB9XG5cbiAgaWYgKCFleGlzdGluZykge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgKyt0YXJnZXQuX2V2ZW50c0NvdW50O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZXhpc3RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPVxuICAgICAgICAgIHByZXBlbmQgPyBbbGlzdGVuZXIsIGV4aXN0aW5nXSA6IFtleGlzdGluZywgbGlzdGVuZXJdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgICBpZiAocHJlcGVuZCkge1xuICAgICAgICBleGlzdGluZy51bnNoaWZ0KGxpc3RlbmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV4aXN0aW5nLnB1c2gobGlzdGVuZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gICAgaWYgKCFleGlzdGluZy53YXJuZWQpIHtcbiAgICAgIG0gPSAkZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgICBpZiAobSAmJiBtID4gMCAmJiBleGlzdGluZy5sZW5ndGggPiBtKSB7XG4gICAgICAgIGV4aXN0aW5nLndhcm5lZCA9IHRydWU7XG4gICAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgZXhpc3RpbmcubGVuZ3RoICsgJyBcIicgKyBTdHJpbmcodHlwZSkgKyAnXCIgbGlzdGVuZXJzICcgK1xuICAgICAgICAgICAgJ2FkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAnICtcbiAgICAgICAgICAgICdpbmNyZWFzZSBsaW1pdC4nKTtcbiAgICAgICAgdy5uYW1lID0gJ01heExpc3RlbmVyc0V4Y2VlZGVkV2FybmluZyc7XG4gICAgICAgIHcuZW1pdHRlciA9IHRhcmdldDtcbiAgICAgICAgdy50eXBlID0gdHlwZTtcbiAgICAgICAgdy5jb3VudCA9IGV4aXN0aW5nLmxlbmd0aDtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0JyAmJiBjb25zb2xlLndhcm4pIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJyVzOiAlcycsIHcubmFtZSwgdy5tZXNzYWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gIGlmICghdGhpcy5maXJlZCkge1xuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy53cmFwRm4pO1xuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0KTtcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdKTtcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCwgYXJndW1lbnRzWzBdLCBhcmd1bWVudHNbMV0pO1xuICAgICAgY2FzZSAzOlxuICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lci5jYWxsKHRoaXMudGFyZ2V0LCBhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSxcbiAgICAgICAgICAgIGFyZ3VtZW50c1syXSk7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKVxuICAgICAgICAgIGFyZ3NbaV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIHRoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsIGFyZ3MpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBfb25jZVdyYXAodGFyZ2V0LCB0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgc3RhdGUgPSB7IGZpcmVkOiBmYWxzZSwgd3JhcEZuOiB1bmRlZmluZWQsIHRhcmdldDogdGFyZ2V0LCB0eXBlOiB0eXBlLCBsaXN0ZW5lcjogbGlzdGVuZXIgfTtcbiAgdmFyIHdyYXBwZWQgPSBiaW5kLmNhbGwob25jZVdyYXBwZXIsIHN0YXRlKTtcbiAgd3JhcHBlZC5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICBzdGF0ZS53cmFwRm4gPSB3cmFwcGVkO1xuICByZXR1cm4gd3JhcHBlZDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24gb25jZSh0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgdGhpcy5vbih0eXBlLCBfb25jZVdyYXAodGhpcywgdHlwZSwgbGlzdGVuZXIpKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnByZXBlbmRPbmNlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRPbmNlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXIpIHtcbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdGVuZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gRW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmIGFuZCBvbmx5IGlmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0ZW5lclwiIGFyZ3VtZW50IG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAoIWxpc3QpXG4gICAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHwgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKC0tdGhpcy5fZXZlbnRzQ291bnQgPT09IDApXG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICAgIGlmIChldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdC5saXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGxpc3QgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcG9zaXRpb24gPSAtMTtcblxuICAgICAgICBmb3IgKGkgPSBsaXN0Lmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8IGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgICAgICBvcmlnaW5hbExpc3RlbmVyID0gbGlzdFtpXS5saXN0ZW5lcjtcbiAgICAgICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uID09PSAwKVxuICAgICAgICAgIGxpc3Quc2hpZnQoKTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHNwbGljZU9uZShsaXN0LCBwb3NpdGlvbik7XG5cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxuICAgICAgICAgIGV2ZW50c1t0eXBlXSA9IGxpc3RbMF07XG5cbiAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgb3JpZ2luYWxMaXN0ZW5lciB8fCBsaXN0ZW5lcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbiAgICBmdW5jdGlvbiByZW1vdmVBbGxMaXN0ZW5lcnModHlwZSkge1xuICAgICAgdmFyIGxpc3RlbmVycywgZXZlbnRzLCBpO1xuXG4gICAgICBldmVudHMgPSB0aGlzLl9ldmVudHM7XG4gICAgICBpZiAoIWV2ZW50cylcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgICAgIGlmICghZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICAgIHRoaXMuX2V2ZW50c0NvdW50ID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudHNbdHlwZV0pIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IG9iamVjdENyZWF0ZShudWxsKTtcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBkZWxldGUgZXZlbnRzW3R5cGVdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHZhciBrZXlzID0gb2JqZWN0S2V5cyhldmVudHMpO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gb2JqZWN0Q3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzKSB7XG4gICAgICAgIC8vIExJRk8gb3JkZXJcbiAgICAgICAgZm9yIChpID0gbGlzdGVuZXJzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbmZ1bmN0aW9uIF9saXN0ZW5lcnModGFyZ2V0LCB0eXBlLCB1bndyYXApIHtcbiAgdmFyIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzO1xuXG4gIGlmICghZXZlbnRzKVxuICAgIHJldHVybiBbXTtcblxuICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcbiAgaWYgKCFldmxpc3RlbmVyKVxuICAgIHJldHVybiBbXTtcblxuICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpXG4gICAgcmV0dXJuIHVud3JhcCA/IFtldmxpc3RlbmVyLmxpc3RlbmVyIHx8IGV2bGlzdGVuZXJdIDogW2V2bGlzdGVuZXJdO1xuXG4gIHJldHVybiB1bndyYXAgPyB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcikgOiBhcnJheUNsb25lKGV2bGlzdGVuZXIsIGV2bGlzdGVuZXIubGVuZ3RoKTtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCB0cnVlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmF3TGlzdGVuZXJzID0gZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cykge1xuICAgIHZhciBldmxpc3RlbmVyID0gZXZlbnRzW3R5cGVdO1xuXG4gICAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9IGVsc2UgaWYgKGV2bGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBldmxpc3RlbmVyLmxlbmd0aDtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gMDtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5ldmVudE5hbWVzID0gZnVuY3Rpb24gZXZlbnROYW1lcygpIHtcbiAgcmV0dXJuIHRoaXMuX2V2ZW50c0NvdW50ID4gMCA/IFJlZmxlY3Qub3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG4vLyBBYm91dCAxLjV4IGZhc3RlciB0aGFuIHRoZSB0d28tYXJnIHZlcnNpb24gb2YgQXJyYXkjc3BsaWNlKCkuXG5mdW5jdGlvbiBzcGxpY2VPbmUobGlzdCwgaW5kZXgpIHtcbiAgZm9yICh2YXIgaSA9IGluZGV4LCBrID0gaSArIDEsIG4gPSBsaXN0Lmxlbmd0aDsgayA8IG47IGkgKz0gMSwgayArPSAxKVxuICAgIGxpc3RbaV0gPSBsaXN0W2tdO1xuICBsaXN0LnBvcCgpO1xufVxuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgbikge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXG4gICAgY29weVtpXSA9IGFycltpXTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpIHtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXQubGVuZ3RoOyArK2kpIHtcbiAgICByZXRbaV0gPSBhcnJbaV0ubGlzdGVuZXIgfHwgYXJyW2ldO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG9iamVjdENyZWF0ZVBvbHlmaWxsKHByb3RvKSB7XG4gIHZhciBGID0gZnVuY3Rpb24oKSB7fTtcbiAgRi5wcm90b3R5cGUgPSBwcm90bztcbiAgcmV0dXJuIG5ldyBGO1xufVxuZnVuY3Rpb24gb2JqZWN0S2V5c1BvbHlmaWxsKG9iaikge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrIGluIG9iaikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGspKSB7XG4gICAga2V5cy5wdXNoKGspO1xuICB9XG4gIHJldHVybiBrO1xufVxuZnVuY3Rpb24gZnVuY3Rpb25CaW5kUG9seWZpbGwoY29udGV4dCkge1xuICB2YXIgZm4gPSB0aGlzO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgTWVtb3J5SGVscGVyID0ge1xuICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICB2YXIgc2l6ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IDQwOTYgOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIG1lbXR5cGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBGbG9hdDMyQXJyYXkgOiBhcmd1bWVudHNbMV07XG5cbiAgICB2YXIgaGVscGVyID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcblxuICAgIE9iamVjdC5hc3NpZ24oaGVscGVyLCB7XG4gICAgICBoZWFwOiBuZXcgbWVtdHlwZShzaXplKSxcbiAgICAgIGxpc3Q6IHt9LFxuICAgICAgZnJlZUxpc3Q6IHt9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaGVscGVyO1xuICB9LFxuICBhbGxvYzogZnVuY3Rpb24gYWxsb2MoYW1vdW50KSB7XG4gICAgdmFyIGlkeCA9IC0xO1xuXG4gICAgaWYgKGFtb3VudCA+IHRoaXMuaGVhcC5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKCdBbGxvY2F0aW9uIHJlcXVlc3QgaXMgbGFyZ2VyIHRoYW4gaGVhcCBzaXplIG9mICcgKyB0aGlzLmhlYXAubGVuZ3RoKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5mcmVlTGlzdCkge1xuICAgICAgdmFyIGNhbmRpZGF0ZVNpemUgPSB0aGlzLmZyZWVMaXN0W2tleV07XG5cbiAgICAgIGlmIChjYW5kaWRhdGVTaXplID49IGFtb3VudCkge1xuICAgICAgICBpZHggPSBrZXk7XG5cbiAgICAgICAgdGhpcy5saXN0W2lkeF0gPSBhbW91bnQ7XG5cbiAgICAgICAgaWYgKGNhbmRpZGF0ZVNpemUgIT09IGFtb3VudCkge1xuICAgICAgICAgIHZhciBuZXdJbmRleCA9IGlkeCArIGFtb3VudCxcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSB2b2lkIDA7XG5cbiAgICAgICAgICBmb3IgKHZhciBfa2V5IGluIHRoaXMubGlzdCkge1xuICAgICAgICAgICAgaWYgKF9rZXkgPiBuZXdJbmRleCkge1xuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZSA9IF9rZXkgLSBuZXdJbmRleDtcbiAgICAgICAgICAgICAgdGhpcy5mcmVlTGlzdFtuZXdJbmRleF0gPSBuZXdGcmVlU2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiggaWR4ICE9PSAtMSApIGRlbGV0ZSB0aGlzLmZyZWVMaXN0WyBpZHggXVxuXG4gICAgaWYgKGlkeCA9PT0gLTEpIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGhpcy5saXN0KSxcbiAgICAgICAgICBsYXN0SW5kZXggPSB2b2lkIDA7XG5cbiAgICAgIGlmIChrZXlzLmxlbmd0aCkge1xuICAgICAgICAvLyBpZiBub3QgZmlyc3QgYWxsb2NhdGlvbi4uLlxuICAgICAgICBsYXN0SW5kZXggPSBwYXJzZUludChrZXlzW2tleXMubGVuZ3RoIC0gMV0pO1xuXG4gICAgICAgIGlkeCA9IGxhc3RJbmRleCArIHRoaXMubGlzdFtsYXN0SW5kZXhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWR4ID0gMDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5saXN0W2lkeF0gPSBhbW91bnQ7XG4gICAgfVxuXG4gICAgaWYgKGlkeCArIGFtb3VudCA+PSB0aGlzLmhlYXAubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBFcnJvcignTm8gYXZhaWxhYmxlIGJsb2NrcyByZW1haW4gc3VmZmljaWVudCBmb3IgYWxsb2NhdGlvbiByZXF1ZXN0LicpO1xuICAgIH1cbiAgICByZXR1cm4gaWR4O1xuICB9LFxuICBmcmVlOiBmdW5jdGlvbiBmcmVlKGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLmxpc3RbaW5kZXhdICE9PSAnbnVtYmVyJykge1xuICAgICAgLy90aHJvdyBFcnJvcignQ2FsbGluZyBmcmVlKCkgb24gbm9uLWV4aXN0aW5nIGJsb2NrLicpO1xuICAgICAgY29uc29sZS53YXJuKCdjYWxsaW5nIGZyZWUoKSBvbiBub24tZXhpc3RpbmcgYmxvY2s6JywgaW5kZXgsIHRoaXMubGlzdCApXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLmxpc3RbaW5kZXhdID0gMDtcblxuICAgIHZhciBzaXplID0gMDtcbiAgICBmb3IgKHZhciBrZXkgaW4gdGhpcy5saXN0KSB7XG4gICAgICBpZiAoa2V5ID4gaW5kZXgpIHtcbiAgICAgICAgc2l6ZSA9IGtleSAtIGluZGV4O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmZyZWVMaXN0W2luZGV4XSA9IHNpemU7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWVtb3J5SGVscGVyO1xuIl19
