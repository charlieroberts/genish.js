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

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":32,"./gte.js":34,"./ifelseif.js":37,"./lt.js":40,"./memo.js":44,"./mul.js":50,"./neq.js":51,"./peek.js":56,"./poke.js":58,"./sub.js":68,"./utilities.js":74}],5:[function(require,module,exports){
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
      console.log('worklet??');
      out.node.port.postMessage({ key: 'set', idx: releaseAccum.inputs[0].inputs[1].memory.value.idx, value: 0 });
    } else {
      console.log('non-worklet...');
      gen.memory.heap[releaseAccum.inputs[0].inputs[1].memory.value.idx] = 0;
    }
  };

  return out;
};

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":32,"./gtp.js":35,"./ifelseif.js":37,"./lt.js":40,"./mul.js":50,"./neq.js":51,"./not.js":53,"./param.js":55,"./peek.js":56,"./poke.js":58,"./sub.js":68}],7:[function(require,module,exports){
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

},{"./gen.js":32,"./history.js":36,"./mul.js":50,"./sub.js":68}],11:[function(require,module,exports){
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

},{"./floor.js":29,"./gen.js":32,"./memo.js":44,"./sub.js":68}],15:[function(require,module,exports){
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
    buffer = { length: y > 1 ? y : _gen.samplerate * 60 // XXX what???
    };shouldLoad = true;
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

},{"./gen.js":32,"./peek.js":56,"./poke.js":58,"./utilities.js":74}],19:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":32,"./history.js":36,"./memo.js":44,"./mul.js":50,"./sub.js":68}],20:[function(require,module,exports){
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

},{"./gen.js":32,"./history.js":36,"./mul.js":50,"./t60.js":70}],21:[function(require,module,exports){
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

},{"./accum.js":2,"./data.js":18,"./gen.js":32,"./memo.js":44,"./peek.js":56,"./poke.js":58,"./sub.js":68,"./wrap.js":76}],22:[function(require,module,exports){
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

},{"./gen.js":32,"./history.js":36,"./sub.js":68}],23:[function(require,module,exports){
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

},{"./data":18,"./gen":32,"./peek":56,"./phasor":57,"./windows":75}],25:[function(require,module,exports){
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
// and to get rid of some strange global initialization that is required to use it.

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
              AudioWorkletProcessor: function AudioWorkletProcessor() {
                this.port = nextPort;
              },

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
    var mem = MemoryHelper.create(mem, type);
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
    var debug = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var shouldInlineMemory = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var memType = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : Float64Array;

    var isStereo = Array.isArray(ugen) && ugen.length > 1,
        callback = void 0,
        channel1 = void 0,
        channel2 = void 0;

    if (typeof mem === 'number' || mem === undefined) {
      mem = MemoryHelper.create(mem, memType);
    }

    //console.log( 'cb memory:', mem )
    this.memory = mem;
    this.outputIdx = this.memory.alloc(2, true);
    this.memo = {};
    this.endBlock.clear();
    this.closures.clear();
    this.inputs.clear();
    this.params.clear();
    //this.globals = { windows:{} }

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

module.exports = gen;

},{"memory-helper":77}],33:[function(require,module,exports){
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

    _gen.memo[this.name] = isWorklet ? this.name + '[i]' : this.name;

    return this.name;
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
  seq: require('./seq.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./data.js":18,"./dcblock.js":19,"./decay.js":20,"./delay.js":21,"./delta.js":22,"./div.js":23,"./env.js":24,"./eq.js":25,"./exp.js":26,"./floor.js":29,"./fold.js":30,"./gate.js":31,"./gen.js":32,"./gt.js":33,"./gte.js":34,"./gtp.js":35,"./history.js":36,"./ifelseif.js":37,"./in.js":38,"./lt.js":40,"./lte.js":41,"./ltp.js":42,"./max.js":43,"./memo.js":44,"./min.js":45,"./mix.js":46,"./mod.js":47,"./mstosamps.js":48,"./mtof.js":49,"./mul.js":50,"./neq.js":51,"./noise.js":52,"./not.js":53,"./pan.js":54,"./param.js":55,"./peek.js":56,"./phasor.js":57,"./poke.js":58,"./pow.js":59,"./rate.js":60,"./round.js":61,"./sah.js":62,"./selector.js":63,"./seq.js":64,"./sign.js":65,"./sin.js":66,"./slide.js":67,"./sub.js":68,"./switch.js":69,"./t60.js":70,"./tan.js":71,"./tanh.js":72,"./train.js":73,"./utilities.js":74,"./windows.js":75,"./wrap.js":76}],40:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":32,"./memo.js":44,"./mul.js":50,"./sub.js":68}],47:[function(require,module,exports){
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

},{"./gen.js":32,"./mul.js":50,"./wrap.js":76}],59:[function(require,module,exports){
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

},{"./add.js":5,"./delta.js":22,"./gen.js":32,"./history.js":36,"./memo.js":44,"./mul.js":50,"./sub.js":68,"./wrap.js":76}],61:[function(require,module,exports){
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

},{"./gen.js":32}],62:[function(require,module,exports){
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

},{"./gen.js":32}],63:[function(require,module,exports){
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

},{"./gen.js":32}],64:[function(require,module,exports){
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

  return ugen;
};

},{"./accum.js":2,"./counter.js":16,"./data.js":18,"./gen.js":32,"./history.js":36,"./peek.js":56}],65:[function(require,module,exports){
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

},{"./gen.js":32}],66:[function(require,module,exports){
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

},{"./gen.js":32}],67:[function(require,module,exports){
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

},{"./add.js":5,"./div.js":23,"./gen.js":32,"./gt.js":33,"./history.js":36,"./memo.js":44,"./mul.js":50,"./sub.js":68,"./switch.js":69}],68:[function(require,module,exports){
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

},{"./gen.js":32}],69:[function(require,module,exports){
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

},{"./gen.js":32}],70:[function(require,module,exports){
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

},{"./gen.js":32}],71:[function(require,module,exports){
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

},{"./gen.js":32}],72:[function(require,module,exports){
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

},{"./gen.js":32}],73:[function(require,module,exports){
'use strict';

var gen = require('./gen.js'),
    lt = require('./lt.js'),
    phasor = require('./phasor.js');

module.exports = function () {
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 440;
  var pulsewidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : .5;

  var graph = lt(accum(div(frequency, 44100)), .5);

  graph.name = 'train' + gen.getUID();

  return graph;
};

},{"./gen.js":32,"./lt.js":40,"./phasor.js":57}],74:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var AWPF = require('./external/audioworklet-polyfill.js'),
    gen = require('./gen.js'),
    data = require('./data.js');

var isStereo = false;

var utilities = {
  ctx: null,

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
  },
  createContext: function createContext() {
    var _this = this;

    var bufferSize = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1024;

    var AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext;

    AWPF(window, bufferSize);

    var start = function start() {
      if (typeof AC !== 'undefined') {
        _this.ctx = new AC();

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
    var mem = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 44100 * 10;

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

},{"./data.js":18,"./external/audioworklet-polyfill.js":27,"./gen.js":32}],75:[function(require,module,exports){
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

},{}],76:[function(require,module,exports){
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

},{"./floor.js":29,"./gen.js":32,"./memo.js":44,"./sub.js":68}],77:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZC5qcyIsImpzL2FkZC5qcyIsImpzL2Fkc3IuanMiLCJqcy9hbmQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2F0dGFjay5qcyIsImpzL2JhbmcuanMiLCJqcy9ib29sLmpzIiwianMvY2VpbC5qcyIsImpzL2NsYW1wLmpzIiwianMvY29zLmpzIiwianMvY291bnRlci5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RjYmxvY2suanMiLCJqcy9kZWNheS5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9lbnYuanMiLCJqcy9lcS5qcyIsImpzL2V4cC5qcyIsImpzL2V4dGVybmFsL2F1ZGlvd29ya2xldC1wb2x5ZmlsbC5qcyIsImpzL2V4dGVybmFsL3JlYWxtLmpzIiwianMvZmxvb3IuanMiLCJqcy9mb2xkLmpzIiwianMvZ2F0ZS5qcyIsImpzL2dlbi5qcyIsImpzL2d0LmpzIiwianMvZ3RlLmpzIiwianMvZ3RwLmpzIiwianMvaGlzdG9yeS5qcyIsImpzL2lmZWxzZWlmLmpzIiwianMvaW4uanMiLCJqcy9pbmRleC5qcyIsImpzL2x0LmpzIiwianMvbHRlLmpzIiwianMvbHRwLmpzIiwianMvbWF4LmpzIiwianMvbWVtby5qcyIsImpzL21pbi5qcyIsImpzL21peC5qcyIsImpzL21vZC5qcyIsImpzL21zdG9zYW1wcy5qcyIsImpzL210b2YuanMiLCJqcy9tdWwuanMiLCJqcy9uZXEuanMiLCJqcy9ub2lzZS5qcyIsImpzL25vdC5qcyIsImpzL3Bhbi5qcyIsImpzL3BhcmFtLmpzIiwianMvcGVlay5qcyIsImpzL3BoYXNvci5qcyIsImpzL3Bva2UuanMiLCJqcy9wb3cuanMiLCJqcy9yYXRlLmpzIiwianMvcm91bmQuanMiLCJqcy9zYWguanMiLCJqcy9zZWxlY3Rvci5qcyIsImpzL3NlcS5qcyIsImpzL3NpZ24uanMiLCJqcy9zaW4uanMiLCJqcy9zbGlkZS5qcyIsImpzL3N1Yi5qcyIsImpzL3N3aXRjaC5qcyIsImpzL3Q2MC5qcyIsImpzL3Rhbi5qcyIsImpzL3RhbmguanMiLCJqcy90cmFpbi5qcyIsImpzL3V0aWxpdGllcy5qcyIsImpzL3dpbmRvd3MuanMiLCJqcy93cmFwLmpzIiwibm9kZV9tb2R1bGVzL21lbW9yeS1oZWxwZXIvaW5kZXgudHJhbnNwaWxlZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBOzs7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFFBQUssS0FESzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFNLFlBQVksS0FBSSxJQUFKLEtBQWEsU0FBL0I7QUFDQSxRQUFNLE1BQU0sWUFBWSxFQUFaLEdBQWlCLE1BQTdCOztBQUVBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBMUIsRUFBa0MsWUFBWSxVQUFaLEdBQXlCLEtBQUssR0FBaEU7O0FBRUEsWUFBUyxHQUFULGFBQW9CLE9BQU8sQ0FBUCxDQUFwQjtBQUVELEtBTEQsTUFLTztBQUNMLFlBQU0sS0FBSyxHQUFMLENBQVUsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFWLENBQU47QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQXBCUyxDQUFaOztBQXVCQSxPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFWOztBQUVBLE1BQUksTUFBSixHQUFhLENBQUUsQ0FBRixDQUFiOztBQUVBLFNBQU8sR0FBUDtBQUNELENBTkQ7OztBQzNCQTs7QUFF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QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidhYnMnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQgPyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBpc1dvcmtsZXQgPyAnTWF0aC5hYnMnIDogTWF0aC5hYnMgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWFicyggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hYnMoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhYnMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWJzLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGFic1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY2N1bScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keVxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB0aGlzLmluaXRpYWxWYWx1ZVxuXG4gICAgZnVuY3Rpb25Cb2R5ID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAgKVxuXG4gICAgLy9nZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG4gICAgXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgY2FsbGJhY2soIF9uYW1lLCBfaW5jciwgX3Jlc2V0LCB2YWx1ZVJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICBcbiAgICAvKiB0aHJlZSBkaWZmZXJlbnQgbWV0aG9kcyBvZiB3cmFwcGluZywgdGhpcmQgaXMgbW9zdCBleHBlbnNpdmU6XG4gICAgICpcbiAgICAgKiAxOiByYW5nZSB7MCwxfTogeSA9IHggLSAoeCB8IDApXG4gICAgICogMjogbG9nMih0aGlzLm1heCkgPT0gaW50ZWdlcjogeSA9IHggJiAodGhpcy5tYXggLSAxKVxuICAgICAqIDM6IGFsbCBvdGhlcnM6IGlmKCB4ID49IHRoaXMubWF4ICkgeSA9IHRoaXMubWF4IC14XG4gICAgICpcbiAgICAgKi9cblxuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiggISh0eXBlb2YgdGhpcy5pbnB1dHNbMV0gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzFdIDwgMSkgKSB7IFxuICAgICAgaWYoIHRoaXMucmVzZXRWYWx1ZSAhPT0gdGhpcy5taW4gKSB7XG5cbiAgICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMucmVzZXRWYWx1ZX1cXG5cXG5gXG4gICAgICAgIC8vb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMubWlufVxcblxcbmBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5taW59XFxuXFxuYFxuICAgICAgICAvL291dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLmluaXRpYWxWYWx1ZX1cXG5cXG5gXG4gICAgICB9XG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfVxcbmBcbiAgICBcbiAgICBpZiggdGhpcy5zaG91bGRXcmFwID09PSBmYWxzZSAmJiB0aGlzLnNob3VsZENsYW1wID09PSB0cnVlICkge1xuICAgICAgb3V0ICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA8ICR7dGhpcy5tYXggfSApICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYFxuICAgIH1lbHNle1xuICAgICAgb3V0ICs9IGAgICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgfVxuXG4gICAgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSAgJiYgdGhpcy5zaG91bGRXcmFwTWF4ICkgd3JhcCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gKSAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XFxuYFxuICAgIGlmKCB0aGlzLm1pbiAhPT0gLUluZmluaXR5ICYmIHRoaXMuc2hvdWxkV3JhcE1pbiApIHdyYXAgKz0gYCAgaWYoICR7dmFsdWVSZWZ9IDwgJHt0aGlzLm1pbn0gKSAke3ZhbHVlUmVmfSArPSAke2RpZmZ9XFxuYFxuXG4gICAgLy9pZiggdGhpcy5taW4gPT09IDAgJiYgdGhpcy5tYXggPT09IDEgKSB7IFxuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gLSAoJHt2YWx1ZVJlZn0gfCAwKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5taW4gPT09IDAgJiYgKCBNYXRoLmxvZzIoIHRoaXMubWF4ICkgfCAwICkgPT09IE1hdGgubG9nMiggdGhpcy5tYXggKSApIHtcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9ICYgKCR7dGhpcy5tYXh9IC0gMSlcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSApe1xuICAgIC8vICB3cmFwID0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcblxcbmBcbiAgICAvL31cblxuICAgIG91dCA9IG91dCArIHdyYXAgKyAnXFxuJ1xuXG4gICAgcmV0dXJuIG91dFxuICB9LFxuXG4gIGRlZmF1bHRzIDogeyBtaW46MCwgbWF4OjEsIHJlc2V0VmFsdWU6MCwgaW5pdGlhbFZhbHVlOjAsIHNob3VsZFdyYXA6dHJ1ZSwgc2hvdWxkV3JhcE1heDogdHJ1ZSwgc2hvdWxkV3JhcE1pbjp0cnVlLCBzaG91bGRDbGFtcDpmYWxzZSB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyLCByZXNldD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICAgICAgXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIFxuICAgIHsgXG4gICAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogWyBpbmNyLCByZXNldCBdLFxuICAgICAgbWVtb3J5OiB7XG4gICAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwcm90by5kZWZhdWx0cyxcbiAgICBwcm9wZXJ0aWVzIFxuICApXG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnNob3VsZFdyYXBNYXggPT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnNob3VsZFdyYXBNaW4gPT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggcHJvcGVydGllcy5zaG91bGRXcmFwICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICB1Z2VuLnNob3VsZFdyYXBNaW4gPSB1Z2VuLnNob3VsZFdyYXBNYXggPSBwcm9wZXJ0aWVzLnNob3VsZFdyYXBcbiAgICB9XG4gIH1cblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMucmVzZXRWYWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuICAgIHVnZW4ucmVzZXRWYWx1ZSA9IHVnZW4ubWluXG4gIH1cblxuICBpZiggdWdlbi5pbml0aWFsVmFsdWUgPT09IHVuZGVmaW5lZCApIHVnZW4uaW5pdGlhbFZhbHVlID0gdWdlbi5taW5cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSAgeyBcbiAgICAgIC8vY29uc29sZS5sb2coICdnZW46JywgZ2VuLCBnZW4ubWVtb3J5IClcbiAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdIFxuICAgIH0sXG4gICAgc2V0KHYpIHsgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgfVxuICB9KVxuXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYWNvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhY29zJzogaXNXb3JrbGV0ID8gJ01hdGguYWNvcycgOk1hdGguYWNvcyB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9YWNvcyggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYWNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWNvcy5pbnB1dHMgPSBbIHggXVxuICBhY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFjb3MubmFtZSA9IGAke2Fjb3MuYmFzZW5hbWV9e2Fjb3MuaWR9YFxuXG4gIHJldHVybiBhY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIG11bCAgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGRpdiAgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIGRhdGEgICAgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrICAgICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgYWNjdW0gICAgPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBpZmVsc2UgICA9IHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICAgIGx0ICAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYmFuZyAgICAgPSByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICAgIGVudiAgICAgID0gcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIHBva2UgICAgID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICBuZXEgICAgICA9IHJlcXVpcmUoICcuL25lcS5qcycgKSxcbiAgICBhbmQgICAgICA9IHJlcXVpcmUoICcuL2FuZC5qcycgKSxcbiAgICBndGUgICAgICA9IHJlcXVpcmUoICcuL2d0ZS5qcycgKSxcbiAgICBtZW1vICAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gICAgdXRpbGl0aWVzPSByZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGF0dGFja1RpbWUgPSA0NDEwMCwgZGVjYXlUaW1lID0gNDQxMDAsIF9wcm9wcyApID0+IHtcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNoYXBlOidleHBvbmVudGlhbCcsIGFscGhhOjUsIHRyaWdnZXI6bnVsbCB9LCBfcHJvcHMgKVxuICBjb25zdCBfYmFuZyA9IHByb3BzLnRyaWdnZXIgIT09IG51bGwgPyBwcm9wcy50cmlnZ2VyIDogYmFuZygpLFxuICAgICAgICBwaGFzZSA9IGFjY3VtKCAxLCBfYmFuZywgeyBtaW46MCwgbWF4OiBJbmZpbml0eSwgaW5pdGlhbFZhbHVlOi1JbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSB9KVxuICAgICAgXG4gIGxldCBidWZmZXJEYXRhLCBidWZmZXJEYXRhUmV2ZXJzZSwgZGVjYXlEYXRhLCBvdXQsIGJ1ZmZlclxuXG4gIC8vY29uc29sZS5sb2coICdzaGFwZTonLCBwcm9wcy5zaGFwZSwgJ2F0dGFjayB0aW1lOicsIGF0dGFja1RpbWUsICdkZWNheSB0aW1lOicsIGRlY2F5VGltZSApXG4gIGxldCBjb21wbGV0ZUZsYWcgPSBkYXRhKCBbMF0gKVxuICBcbiAgLy8gc2xpZ2h0bHkgbW9yZSBlZmZpY2llbnQgdG8gdXNlIGV4aXN0aW5nIHBoYXNlIGFjY3VtdWxhdG9yIGZvciBsaW5lYXIgZW52ZWxvcGVzXG4gIGlmKCBwcm9wcy5zaGFwZSA9PT0gJ2xpbmVhcicgKSB7XG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApKSxcbiAgICAgIGRpdiggcGhhc2UsIGF0dGFja1RpbWUgKSxcblxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApICksXG4gICAgICBzdWIoIDEsIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSApLCBkZWNheVRpbWUgKSApLFxuICAgICAgXG4gICAgICBuZXEoIHBoYXNlLCAtSW5maW5pdHkpLFxuICAgICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgICAwIFxuICAgIClcbiAgfSBlbHNlIHtcbiAgICBidWZmZXJEYXRhID0gZW52KHsgbGVuZ3RoOjEwMjQsIHR5cGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhIH0pXG4gICAgYnVmZmVyRGF0YVJldmVyc2UgPSBlbnYoeyBsZW5ndGg6MTAyNCwgdHlwZTpwcm9wcy5zaGFwZSwgYWxwaGE6cHJvcHMuYWxwaGEsIHJldmVyc2U6dHJ1ZSB9KVxuXG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAgIGFuZCggZ3RlKHBoYXNlLDApLCBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSApLCBcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGFSZXZlcnNlLCBkaXYoIHN1YiggcGhhc2UsIGF0dGFja1RpbWUgKSwgZGVjYXlUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSksXG5cbiAgICAgIG5lcSggcGhhc2UsIC1JbmZpbml0eSApLFxuICAgICAgcG9rZSggY29tcGxldGVGbGFnLCAxLCAwLCB7IGlubGluZTowIH0pLFxuXG4gICAgICAwXG4gICAgKVxuICB9XG5cbiAgY29uc3QgdXNpbmdXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICkge1xuICAgIG91dC5ub2RlID0gbnVsbFxuICAgIHV0aWxpdGllcy5yZWdpc3Rlciggb3V0IClcbiAgfVxuXG4gIC8vIG5lZWRlZCBmb3IgZ2liYmVyaXNoLi4uIGdldHRpbmcgdGhpcyB0byB3b3JrIHJpZ2h0IHdpdGggd29ya2xldHNcbiAgLy8gdmlhIHByb21pc2VzIHdpbGwgcHJvYmFibHkgYmUgdHJpY2t5XG4gIG91dC5pc0NvbXBsZXRlID0gKCk9PiB7XG4gICAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSAmJiBvdXQubm9kZSAhPT0gbnVsbCApIHtcbiAgICAgIGNvbnN0IHAgPSBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgIG91dC5ub2RlLmdldE1lbW9yeVZhbHVlKCBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHgsIHJlc29sdmUgKVxuICAgICAgfSlcblxuICAgICAgcmV0dXJuIHBcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdXG4gICAgfVxuICB9XG5cbiAgb3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICYmIG91dC5ub2RlICE9PSBudWxsICkge1xuICAgICAgb3V0Lm5vZGUucG9ydC5wb3N0TWVzc2FnZSh7IGtleTonc2V0JywgaWR4OmNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCwgdmFsdWU6MCB9KVxuICAgIH1lbHNle1xuICAgICAgZ2VuLm1lbW9yeS5oZWFwWyBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHggXSA9IDBcbiAgICB9XG4gICAgX2JhbmcudHJpZ2dlcigpXG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7IFxuICBiYXNlbmFtZTonYWRkJyxcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dD0nJyxcbiAgICAgICAgc3VtID0gMCwgbnVtQ291bnQgPSAwLCBhZGRlckF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgaWYoIGlucHV0cy5sZW5ndGggPT09IDAgKSByZXR1cm4gMFxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGBcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgIGFkZGVyQXRFbmQgPSB0cnVlXG4gICAgICAgICAgb3V0ICs9ICcgKyAnXG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIHN1bSArPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgbnVtQ291bnQrK1xuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgb3V0ICs9IGFkZGVyQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICsgJyArIHN1bVxuICAgIH1cblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGNvbnN0IGFkZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgYWRkLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFkZC5uYW1lID0gYWRkLmJhc2VuYW1lICsgYWRkLmlkXG4gIGFkZC5pbnB1dHMgPSBhcmdzXG5cbiAgcmV0dXJuIGFkZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBtdWwgICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBzdWIgICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBkaXYgICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBkYXRhICAgICA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayAgICAgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIGFjY3VtICAgID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgaWZlbHNlICAgPSByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgICBsdCAgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIGJhbmcgICAgID0gcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgICBlbnYgICAgICA9IHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgICBwYXJhbSAgICA9IHJlcXVpcmUoICcuL3BhcmFtLmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIGd0cCAgICAgID0gcmVxdWlyZSggJy4vZ3RwLmpzJyApLFxuICAgIG5vdCAgICAgID0gcmVxdWlyZSggJy4vbm90LmpzJyApLFxuICAgIGFuZCAgICAgID0gcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICAgIG5lcSAgICAgID0gcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICAgIHBva2UgICAgID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZT00NCwgZGVjYXlUaW1lPTIyMDUwLCBzdXN0YWluVGltZT00NDEwMCwgc3VzdGFpbkxldmVsPS42LCByZWxlYXNlVGltZT00NDEwMCwgX3Byb3BzICkgPT4ge1xuICBsZXQgZW52VHJpZ2dlciA9IGJhbmcoKSxcbiAgICAgIHBoYXNlID0gYWNjdW0oIDEsIGVudlRyaWdnZXIsIHsgbWF4OiBJbmZpbml0eSwgc2hvdWxkV3JhcDpmYWxzZSwgaW5pdGlhbFZhbHVlOkluZmluaXR5IH0pLFxuICAgICAgc2hvdWxkU3VzdGFpbiA9IHBhcmFtKCAxICksXG4gICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgIHNoYXBlOiAnZXhwb25lbnRpYWwnLFxuICAgICAgICAgYWxwaGE6IDUsXG4gICAgICAgICB0cmlnZ2VyUmVsZWFzZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgX3Byb3BzICksXG4gICAgICBidWZmZXJEYXRhLCBkZWNheURhdGEsIG91dCwgYnVmZmVyLCBzdXN0YWluQ29uZGl0aW9uLCByZWxlYXNlQWNjdW0sIHJlbGVhc2VDb25kaXRpb25cblxuXG4gIGNvbnN0IGNvbXBsZXRlRmxhZyA9IGRhdGEoIFswXSApXG5cbiAgYnVmZmVyRGF0YSA9IGVudih7IGxlbmd0aDoxMDI0LCBhbHBoYTpwcm9wcy5hbHBoYSwgc2hpZnQ6MCwgdHlwZTpwcm9wcy5zaGFwZSB9KVxuXG4gIHN1c3RhaW5Db25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZSBcbiAgICA/IHNob3VsZFN1c3RhaW5cbiAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lICkgKVxuXG4gIHJlbGVhc2VBY2N1bSA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgPyBndHAoIHN1Yiggc3VzdGFpbkxldmVsLCBhY2N1bSggZGl2KCBzdXN0YWluTGV2ZWwsIHJlbGVhc2VUaW1lICkgLCAwLCB7IHNob3VsZFdyYXA6ZmFsc2UgfSkgKSwgMCApXG4gICAgOiBzdWIoIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSApICksIHJlbGVhc2VUaW1lICksIHN1c3RhaW5MZXZlbCApICksIFxuXG4gIHJlbGVhc2VDb25kaXRpb24gPSBwcm9wcy50cmlnZ2VyUmVsZWFzZVxuICAgID8gbm90KCBzaG91bGRTdXN0YWluIClcbiAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lLCByZWxlYXNlVGltZSApIClcblxuICBvdXQgPSBpZmVsc2UoXG4gICAgLy8gYXR0YWNrIFxuICAgIGx0KCBwaGFzZSwgIGF0dGFja1RpbWUgKSwgXG4gICAgcGVlayggYnVmZmVyRGF0YSwgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0gKSwgXG5cbiAgICAvLyBkZWNheVxuICAgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApLCBcbiAgICBwZWVrKCBidWZmZXJEYXRhLCBzdWIoIDEsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSApLCAgZGVjYXlUaW1lICksIHN1YiggMSwgIHN1c3RhaW5MZXZlbCApICkgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgIC8vIHN1c3RhaW5cbiAgICBhbmQoIHN1c3RhaW5Db25kaXRpb24sIG5lcSggcGhhc2UsIEluZmluaXR5ICkgKSxcbiAgICBwZWVrKCBidWZmZXJEYXRhLCAgc3VzdGFpbkxldmVsICksXG5cbiAgICAvLyByZWxlYXNlXG4gICAgcmVsZWFzZUNvbmRpdGlvbiwgLy9sdCggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSArICByZWxlYXNlVGltZSApLFxuICAgIHBlZWsoIFxuICAgICAgYnVmZmVyRGF0YSxcbiAgICAgIHJlbGVhc2VBY2N1bSwgXG4gICAgICAvL3N1YiggIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICsgIGRlY2F5VGltZSArICBzdXN0YWluVGltZSksICByZWxlYXNlVGltZSApLCAgc3VzdGFpbkxldmVsICkgKSwgXG4gICAgICB7IGJvdW5kbW9kZTonY2xhbXAnIH1cbiAgICApLFxuXG4gICAgbmVxKCBwaGFzZSwgSW5maW5pdHkgKSxcbiAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAwXG4gIClcbiAgIFxuICBjb25zdCB1c2luZ1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgKSB7XG4gICAgb3V0Lm5vZGUgPSBudWxsXG4gICAgdXRpbGl0aWVzLnJlZ2lzdGVyKCBvdXQgKVxuICB9XG5cbiAgb3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMVxuICAgIGVudlRyaWdnZXIudHJpZ2dlcigpXG4gIH1cbiBcbiAgLy8gbmVlZGVkIGZvciBnaWJiZXJpc2guLi4gZ2V0dGluZyB0aGlzIHRvIHdvcmsgcmlnaHQgd2l0aCB3b3JrbGV0c1xuICAvLyB2aWEgcHJvbWlzZXMgd2lsbCBwcm9iYWJseSBiZSB0cmlja3lcbiAgb3V0LmlzQ29tcGxldGUgPSAoKT0+IHtcbiAgICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICYmIG91dC5ub2RlICE9PSBudWxsICkge1xuICAgICAgY29uc3QgcCA9IG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgb3V0Lm5vZGUuZ2V0TWVtb3J5VmFsdWUoIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCwgcmVzb2x2ZSApXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gcFxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF1cbiAgICB9XG4gIH1cblxuXG4gIG91dC5yZWxlYXNlID0gKCk9PiB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDBcbiAgICAvLyBYWFggcHJldHR5IG5hc3R5Li4uIGdyYWJzIGFjY3VtIGluc2lkZSBvZiBndHAgYW5kIHJlc2V0cyB2YWx1ZSBtYW51YWxseVxuICAgIC8vIHVuZm9ydHVuYXRlbHkgZW52VHJpZ2dlciB3b24ndCB3b3JrIGFzIGl0J3MgYmFjayB0byAwIGJ5IHRoZSB0aW1lIHRoZSByZWxlYXNlIGJsb2NrIGlzIHRyaWdnZXJlZC4uLlxuICAgIGlmKCB1c2luZ1dvcmtsZXQgJiYgb3V0Lm5vZGUgIT09IG51bGwgKSB7XG4gICAgICBjb25zb2xlLmxvZyggJ3dvcmtsZXQ/PycgKVxuICAgICAgb3V0Lm5vZGUucG9ydC5wb3N0TWVzc2FnZSh7IGtleTonc2V0JywgaWR4OnJlbGVhc2VBY2N1bS5pbnB1dHNbMF0uaW5wdXRzWzFdLm1lbW9yeS52YWx1ZS5pZHgsIHZhbHVlOjAgfSlcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUubG9nKCAnbm9uLXdvcmtsZXQuLi4nIClcbiAgICAgIGdlbi5tZW1vcnkuaGVhcFsgcmVsZWFzZUFjY3VtLmlucHV0c1swXS5pbnB1dHNbMV0ubWVtb3J5LnZhbHVlLmlkeCBdID0gMFxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhbmQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ICE9PSAwICYmICR7aW5wdXRzWzFdfSAhPT0gMCkgfCAwXFxuXFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1gLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhc2luJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhc2luJzogaXNXb3JrbGV0ID8gJ01hdGguc2luJyA6IE1hdGguYXNpbiB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9YXNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYXNpbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFzaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYXNpbi5pbnB1dHMgPSBbIHggXVxuICBhc2luLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFzaW4ubmFtZSA9IGAke2FzaW4uYmFzZW5hbWV9e2FzaW4uaWR9YFxuXG4gIHJldHVybiBhc2luXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2F0YW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0ID8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2F0YW4nOiBpc1dvcmtsZXQgPyAnTWF0aC5hdGFuJyA6IE1hdGguYXRhbiB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9YXRhbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYXRhbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGF0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYXRhbi5pbnB1dHMgPSBbIHggXVxuICBhdGFuLmlkID0gZ2VuLmdldFVJRCgpXG4gIGF0YW4ubmFtZSA9IGAke2F0YW4uYmFzZW5hbWV9e2F0YW4uaWR9YFxuXG4gIHJldHVybiBhdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkZWNheVRpbWUgPSA0NDEwMCApID0+IHtcbiAgbGV0IHNzZCA9IGhpc3RvcnkgKCAxICksXG4gICAgICB0NjAgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gZGVjYXlUaW1lIClcblxuICBzc2QuaW4oIG11bCggc3NkLm91dCwgdDYwICkgKVxuXG4gIHNzZC5vdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNzZC52YWx1ZSA9IDFcbiAgfVxuXG4gIHJldHVybiBzdWIoIDEsIHNzZC5vdXQgKVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgZ2VuKCkge1xuICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgXG4gICAgbGV0IG91dCA9IFxuYCAgdmFyICR7dGhpcy5uYW1lfSA9IG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dXG4gIGlmKCAke3RoaXMubmFtZX0gPT09IDEgKSBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XSA9IDAgICAgICBcbiAgICAgIFxuYFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggX3Byb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOjAsIG1heDoxIH0sIF9wcm9wcyApXG5cbiAgdWdlbi5uYW1lID0gJ2JhbmcnICsgZ2VuLmdldFVJRCgpXG5cbiAgdWdlbi5taW4gPSBwcm9wcy5taW5cbiAgdWdlbi5tYXggPSBwcm9wcy5tYXhcblxuICBjb25zdCB1c2luZ1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgKSB7XG4gICAgdWdlbi5ub2RlID0gbnVsbFxuICAgIHV0aWxpdGllcy5yZWdpc3RlciggdWdlbiApXG4gIH1cblxuICB1Z2VuLnRyaWdnZXIgPSAoKSA9PiB7XG4gICAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSAmJiB1Z2VuLm5vZGUgIT09IG51bGwgKSB7XG4gICAgICB1Z2VuLm5vZGUucG9ydC5wb3N0TWVzc2FnZSh7IGtleTonc2V0JywgaWR4OnVnZW4ubWVtb3J5LnZhbHVlLmlkeCwgdmFsdWU6dWdlbi5tYXggfSlcbiAgICB9ZWxzZXtcbiAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdWdlbi5tZW1vcnkudmFsdWUuaWR4IF0gPSB1Z2VuLm1heCBcbiAgICB9XG4gIH1cblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Jvb2wnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IGAke2lucHV0c1swXX0gPT09IDAgPyAwIDogMWBcbiAgICBcbiAgICAvL2dlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gXG5cbiAgICAvL3JldHVybiBbIGBnZW4uZGF0YS4ke3RoaXMubmFtZX1gLCAnICcgK291dCBdXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidjZWlsJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0ID8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGguY2VpbCcgOiBNYXRoLmNlaWwgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWNlaWwoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY2VpbCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNlaWwgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY2VpbC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBjZWlsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NsaXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcblxuICAgIG91dCA9XG5cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9ID4gJHtpbnB1dHNbMl19ICkgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMl19XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA8ICR7aW5wdXRzWzFdfSApICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzFdfVxuYFxuICAgIG91dCA9ICcgJyArIG91dFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49LTEsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcblxuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdjb3MnOiBpc1dvcmtsZXQgPyAnTWF0aC5jb3MnIDogTWF0aC5jb3MgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWNvcyggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY29zKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgY29zID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGNvcy5pbnB1dHMgPSBbIHggXVxuICBjb3MuaWQgPSBnZW4uZ2V0VUlEKClcbiAgY29zLm5hbWUgPSBgJHtjb3MuYmFzZW5hbWV9e2Nvcy5pZH1gXG5cbiAgcmV0dXJuIGNvc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjb3VudGVyJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5XG4gICAgICAgXG4gICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgZnVuY3Rpb25Cb2R5ICA9IHRoaXMuY2FsbGJhY2soIGdlbk5hbWUsIGlucHV0c1swXSwgaW5wdXRzWzFdLCBpbnB1dHNbMl0sIGlucHV0c1szXSwgaW5wdXRzWzRdLCAgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCwgYG1lbW9yeVske3RoaXMubWVtb3J5LndyYXAuaWR4fV1gICApXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgXG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLndyYXAubmFtZSBdID09PSB1bmRlZmluZWQgKSB0aGlzLndyYXAuZ2VuKClcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9taW4sIF9tYXgsIF9yZXNldCwgbG9vcHMsIHZhbHVlUmVmLCB3cmFwUmVmICkge1xuICAgIGxldCBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJ1xuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiggISh0eXBlb2YgdGhpcy5pbnB1dHNbM10gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzNdIDwgMSkgKSB7IFxuICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0gMSApICR7dmFsdWVSZWZ9ID0gJHtfbWlufVxcbmBcbiAgICB9XG5cbiAgICBvdXQgKz0gYCAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dmFsdWVSZWZ9O1xcbiAgJHt2YWx1ZVJlZn0gKz0gJHtfaW5jcn1cXG5gIC8vIHN0b3JlIG91dHB1dCB2YWx1ZSBiZWZvcmUgYWNjdW11bGF0aW5nICBcbiAgICBcbiAgICBpZiggdHlwZW9mIHRoaXMubWF4ID09PSAnbnVtYmVyJyAmJiB0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdHlwZW9mIHRoaXMubWluICE9PSAnbnVtYmVyJyApIHtcbiAgICAgIHdyYXAgPSBcbmAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNle1xuICAgICR7d3JhcFJlZn0gPSAwXG4gIH1cXG5gXG4gICAgfWVsc2UgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSAmJiB0aGlzLm1pbiAhPT0gSW5maW5pdHkgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHtfbWF4fSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gLT0gJHtfbWF4fSAtICR7X21pbn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZSBpZiggJHt2YWx1ZVJlZn0gPCAke19taW59ICYmICAke2xvb3BzfSA+IDApIHtcbiAgICAke3ZhbHVlUmVmfSArPSAke19tYXh9IC0gJHtfbWlufVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNle1xuICAgICR7d3JhcFJlZn0gPSAwXG4gIH1cXG5gXG4gICAgfWVsc2V7XG4gICAgICBvdXQgKz0gJ1xcbidcbiAgICB9XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwXG5cbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluY3I9MSwgbWluPTAsIG1heD1JbmZpbml0eSwgcmVzZXQ9MCwgbG9vcHM9MSwgIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBpbml0aWFsVmFsdWU6IDAsIHNob3VsZFdyYXA6dHJ1ZSB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbjogICAgbWluLCBcbiAgICBtYXg6ICAgIG1heCxcbiAgICB2YWx1ZTogIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW5jciwgbWluLCBtYXgsIHJlc2V0LCBsb29wcyBdLFxuICAgIG1lbW9yeToge1xuICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9LFxuICAgICAgd3JhcDogIHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IFxuICAgIH0sXG4gICAgd3JhcCA6IHtcbiAgICAgIGdlbigpIHsgXG4gICAgICAgIGlmKCB1Z2VuLm1lbW9yeS53cmFwLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICB9XG4gICAgICAgIGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyAke3VnZW4ubWVtb3J5LndyYXAuaWR4fSBdYFxuICAgICAgICByZXR1cm4gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWAgXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBkZWZhdWx0cyApXG4gXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIFxuICB1Z2VuLndyYXAuaW5wdXRzID0gWyB1Z2VuIF1cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcbiAgdWdlbi53cmFwLm5hbWUgPSB1Z2VuLm5hbWUgKyAnX3dyYXAnXG4gIHJldHVybiB1Z2VuXG59IFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwaGFzb3I9cmVxdWlyZSggJy4vcGhhc29yLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY3ljbGUnLFxuXG4gIGluaXRUYWJsZSgpIHsgICAgXG4gICAgbGV0IGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDAsIGwgPSBidWZmZXIubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSBNYXRoLnNpbiggKCBpIC8gbCApICogKCBNYXRoLlBJICogMiApIClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5jeWNsZSA9IGRhdGEoIGJ1ZmZlciwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9IClcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCwgX3Byb3BzICkgPT4ge1xuICBpZiggdHlwZW9mIGdlbi5nbG9iYWxzLmN5Y2xlID09PSAndW5kZWZpbmVkJyApIHByb3RvLmluaXRUYWJsZSgpIFxuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOjAgfSwgX3Byb3BzIClcblxuICBjb25zdCB1Z2VuID0gcGVlayggZ2VuLmdsb2JhbHMuY3ljbGUsIHBoYXNvciggZnJlcXVlbmN5LCByZXNldCwgcHJvcHMgKSlcbiAgdWdlbi5uYW1lID0gJ2N5Y2xlJyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICB1dGlsaXRpZXMgPSByZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gIHBlZWsgPSByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RhdGEnLFxuICBnbG9iYWxzOiB7fSxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlkeFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGxldCB1Z2VuID0gdGhpc1xuICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5LCB0aGlzLmltbXV0YWJsZSApIFxuICAgICAgaWR4ID0gdGhpcy5tZW1vcnkudmFsdWVzLmlkeFxuICAgICAgdHJ5IHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwLnNldCggdGhpcy5idWZmZXIsIGlkeCApXG4gICAgICB9Y2F0Y2goIGUgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCBlIClcbiAgICAgICAgdGhyb3cgRXJyb3IoICdlcnJvciB3aXRoIHJlcXVlc3QuIGFza2luZyBmb3IgJyArIHRoaXMuYnVmZmVyLmxlbmd0aCArJy4gY3VycmVudCBpbmRleDogJyArIGdlbi5tZW1vcnlJbmRleCArICcgb2YgJyArIGdlbi5tZW1vcnkuaGVhcC5sZW5ndGggKVxuICAgICAgfVxuICAgICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSB0aGlzXG4gICAgICAvL3JldHVybiAnZ2VuLm1lbW9yeScgKyB0aGlzLm5hbWUgKyAnLmJ1ZmZlcidcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlkeFxuICAgIH1lbHNle1xuICAgICAgaWR4ID0gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gICAgfVxuICAgIHJldHVybiBpZHhcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHk9MSwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4sIGJ1ZmZlciwgc2hvdWxkTG9hZCA9IGZhbHNlXG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdICkge1xuICAgICAgcmV0dXJuIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdXG4gICAgfVxuICB9XG5cbiAgaWYoIHR5cGVvZiB4ID09PSAnbnVtYmVyJyApIHtcbiAgICBpZiggeSAhPT0gMSApIHtcbiAgICAgIGJ1ZmZlciA9IFtdXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHk7IGkrKyApIHtcbiAgICAgICAgYnVmZmVyWyBpIF0gPSBuZXcgRmxvYXQzMkFycmF5KCB4IClcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHggKVxuICAgIH1cbiAgfWVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIHggKSApIHsgLy8hICh4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkgKSB7XG4gICAgbGV0IHNpemUgPSB4Lmxlbmd0aFxuICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHNpemUgKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0geFsgaSBdXG4gICAgfVxuICB9ZWxzZSBpZiggdHlwZW9mIHggPT09ICdzdHJpbmcnICkge1xuICAgIGJ1ZmZlciA9IHsgbGVuZ3RoOiB5ID4gMSA/IHkgOiBnZW4uc2FtcGxlcmF0ZSAqIDYwIH0gLy8gWFhYIHdoYXQ/Pz9cbiAgICBzaG91bGRMb2FkID0gdHJ1ZVxuICB9ZWxzZSBpZiggeCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSApIHtcbiAgICBidWZmZXIgPSB4XG4gIH1cbiAgXG4gIHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBidWZmZXIsXG4gICAgbmFtZTogcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKCksXG4gICAgZGltOiAgYnVmZmVyLmxlbmd0aCwgLy8gWFhYIGhvdyBkbyB3ZSBkeW5hbWljYWxseSBhbGxvY2F0ZSB0aGlzP1xuICAgIGNoYW5uZWxzIDogMSxcbiAgICBvbmxvYWQ6IG51bGwsXG4gICAgdGhlbiggZm5jICkge1xuICAgICAgdWdlbi5vbmxvYWQgPSBmbmNcbiAgICAgIHJldHVybiB1Z2VuXG4gICAgfSxcbiAgICBpbW11dGFibGU6IHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmltbXV0YWJsZSA9PT0gdHJ1ZSA/IHRydWUgOiBmYWxzZSxcbiAgICBsb2FkKCBmaWxlbmFtZSApIHtcbiAgICAgIGxldCBwcm9taXNlID0gdXRpbGl0aWVzLmxvYWRTYW1wbGUoIGZpbGVuYW1lLCB1Z2VuIClcbiAgICAgIHByb21pc2UudGhlbiggKCBfYnVmZmVyICk9PiB7IFxuICAgICAgICB1Z2VuLm1lbW9yeS52YWx1ZXMubGVuZ3RoID0gdWdlbi5kaW0gPSBfYnVmZmVyLmxlbmd0aCAgICAgXG4gICAgICAgIHVnZW4ub25sb2FkKCkgXG4gICAgICB9KVxuICAgIH0sXG4gICAgbWVtb3J5IDoge1xuICAgICAgdmFsdWVzOiB7IGxlbmd0aDpidWZmZXIubGVuZ3RoLCBpZHg6bnVsbCB9XG4gICAgfVxuICB9KVxuXG4gIGlmKCBzaG91bGRMb2FkICkgdWdlbi5sb2FkKCB4IClcbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4uZ2xvYmFsc1sgcHJvcGVydGllcy5nbG9iYWwgXSA9IHVnZW5cbiAgICB9XG4gICAgaWYoIHByb3BlcnRpZXMubWV0YSA9PT0gdHJ1ZSApIHtcbiAgICAgIGZvciggbGV0IGkgPSAwLCBsZW5ndGggPSB1Z2VuLmJ1ZmZlci5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCBpLCB7XG4gICAgICAgICAgZ2V0ICgpIHtcbiAgICAgICAgICAgIHJldHVybiBwZWVrKCB1Z2VuLCBpLCB7IG1vZGU6J3NpbXBsZScsIGludGVycDonbm9uZScgfSApXG4gICAgICAgICAgfSxcbiAgICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgICByZXR1cm4gcG9rZSggdWdlbiwgdiwgaSApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IHgxID0gaGlzdG9yeSgpLFxuICAgICAgeTEgPSBoaXN0b3J5KCksXG4gICAgICBmaWx0ZXJcblxuICAvL0hpc3RvcnkgeDEsIHkxOyB5ID0gaW4xIC0geDEgKyB5MSowLjk5OTc7IHgxID0gaW4xOyB5MSA9IHk7IG91dDEgPSB5O1xuICBmaWx0ZXIgPSBtZW1vKCBhZGQoIHN1YiggaW4xLCB4MS5vdXQgKSwgbXVsKCB5MS5vdXQsIC45OTk3ICkgKSApXG4gIHgxLmluKCBpbjEgKVxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICB0NjAgICAgID0gcmVxdWlyZSggJy4vdDYwLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBkZWNheVRpbWUgPSA0NDEwMCwgcHJvcHMgKSA9PiB7XG4gIGxldCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBpbml0VmFsdWU6MSB9LCBwcm9wcyApLFxuICAgICAgc3NkID0gaGlzdG9yeSAoIHByb3BlcnRpZXMuaW5pdFZhbHVlIClcblxuICBzc2QuaW4oIG11bCggc3NkLm91dCwgdDYwKCBkZWNheVRpbWUgKSApIClcblxuICBzc2Qub3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBzc2QudmFsdWUgPSAxXG4gIH1cblxuICByZXR1cm4gc3NkLm91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyAgKSxcbiAgICAgIGRhdGEgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgICAgcG9rZSA9IHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gICAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICAgIHN1YiAgPSByZXF1aXJlKCAnLi9zdWIuanMnICApLFxuICAgICAgd3JhcCA9IHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gICAgICBhY2N1bT0gcmVxdWlyZSggJy4vYWNjdW0uanMnKSxcbiAgICAgIG1lbW8gPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGVsYXknLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaW5wdXRzWzBdXG4gICAgXG4gICAgcmV0dXJuIGlucHV0c1swXVxuICB9LFxufVxuXG5jb25zdCBkZWZhdWx0cyA9IHsgc2l6ZTogNTEyLCBpbnRlcnA6J25vbmUnIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgdGFwcywgcHJvcGVydGllcyApID0+IHtcbiAgY29uc3QgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgbGV0IHdyaXRlSWR4LCByZWFkSWR4LCBkZWxheWRhdGFcblxuICBpZiggQXJyYXkuaXNBcnJheSggdGFwcyApID09PSBmYWxzZSApIHRhcHMgPSBbIHRhcHMgXVxuICBcbiAgY29uc3QgcHJvcHMgPSBPYmplY3QuYXNzaWduKCB7fSwgZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIGNvbnN0IG1heFRhcFNpemUgPSBNYXRoLm1heCggLi4udGFwcyApXG4gIGlmKCBwcm9wcy5zaXplIDwgbWF4VGFwU2l6ZSApIHByb3BzLnNpemUgPSBtYXhUYXBTaXplXG5cbiAgZGVsYXlkYXRhID0gZGF0YSggcHJvcHMuc2l6ZSApXG4gIFxuICB1Z2VuLmlucHV0cyA9IFtdXG5cbiAgd3JpdGVJZHggPSBhY2N1bSggMSwgMCwgeyBtYXg6cHJvcHMuc2l6ZSwgbWluOjAgfSlcbiAgXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgdGFwcy5sZW5ndGg7IGkrKyApIHtcbiAgICB1Z2VuLmlucHV0c1sgaSBdID0gcGVlayggZGVsYXlkYXRhLCB3cmFwKCBzdWIoIHdyaXRlSWR4LCB0YXBzW2ldICksIDAsIHByb3BzLnNpemUgKSx7IG1vZGU6J3NhbXBsZXMnLCBpbnRlcnA6cHJvcHMuaW50ZXJwIH0pXG4gIH1cbiAgXG4gIHVnZW4ub3V0cHV0cyA9IHVnZW4uaW5wdXRzIC8vIFhYWCB1Z2gsIFVnaCwgVUdIISBidXQgaSBndWVzcyBpdCB3b3Jrcy5cblxuICBwb2tlKCBkZWxheWRhdGEsIGluMSwgd3JpdGVJZHggKVxuXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgbjEgPSBoaXN0b3J5KClcbiAgICBcbiAgbjEuaW4oIGluMSApXG5cbiAgbGV0IHVnZW4gPSBzdWIoIGluMSwgbjEub3V0IClcbiAgdWdlbi5uYW1lID0gJ2RlbHRhJytnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGl2JyxcbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dD1gICB2YXIgJHt0aGlzLm5hbWV9ID0gYCxcbiAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBkaXZBdEVuZCA9IGZhbHNlXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgIGlmKCAhbGFzdE51bWJlcklzVWdlbiAmJiAhaXNOdW1iZXJVZ2VuICkge1xuICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAvIHZcbiAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLyAke3Z9YFxuICAgICAgfVxuXG4gICAgICBpZiggIWlzRmluYWxJZHggKSBvdXQgKz0gJyAvICcgXG4gICAgfSlcblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBjb25zdCBkaXYgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBPYmplY3QuYXNzaWduKCBkaXYsIHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG4gIH0pXG5cbiAgZGl2Lm5hbWUgPSBkaXYuYmFzZW5hbWUgKyBkaXYuaWRcbiAgXG4gIHJldHVybiBkaXZcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbicgKSxcbiAgICB3aW5kb3dzID0gcmVxdWlyZSggJy4vd2luZG93cycgKSxcbiAgICBkYXRhICAgID0gcmVxdWlyZSggJy4vZGF0YScgKSxcbiAgICBwZWVrICAgID0gcmVxdWlyZSggJy4vcGVlaycgKSxcbiAgICBwaGFzb3IgID0gcmVxdWlyZSggJy4vcGhhc29yJyApLFxuICAgIGRlZmF1bHRzID0ge1xuICAgICAgdHlwZTondHJpYW5ndWxhcicsIGxlbmd0aDoxMDI0LCBhbHBoYTouMTUsIHNoaWZ0OjAsIHJldmVyc2U6ZmFsc2UgXG4gICAgfVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb3BzID0+IHtcbiAgXG4gIGxldCBwcm9wZXJ0aWVzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBwcm9wcyApXG4gIGxldCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KCBwcm9wZXJ0aWVzLmxlbmd0aCApXG5cbiAgbGV0IG5hbWUgPSBwcm9wZXJ0aWVzLnR5cGUgKyAnXycgKyBwcm9wZXJ0aWVzLmxlbmd0aCArICdfJyArIHByb3BlcnRpZXMuc2hpZnQgKyAnXycgKyBwcm9wZXJ0aWVzLnJldmVyc2UgKyAnXycgKyBwcm9wZXJ0aWVzLmFscGhhXG4gIGlmKCB0eXBlb2YgZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdID09PSAndW5kZWZpbmVkJyApIHsgXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IHByb3BlcnRpZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IHdpbmRvd3NbIHByb3BlcnRpZXMudHlwZSBdKCBwcm9wZXJ0aWVzLmxlbmd0aCwgaSwgcHJvcGVydGllcy5hbHBoYSwgcHJvcGVydGllcy5zaGlmdCApXG4gICAgfVxuXG4gICAgaWYoIHByb3BlcnRpZXMucmV2ZXJzZSA9PT0gdHJ1ZSApIHsgXG4gICAgICBidWZmZXIucmV2ZXJzZSgpXG4gICAgfVxuICAgIGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSA9IGRhdGEoIGJ1ZmZlciApXG4gIH1cblxuICBsZXQgdWdlbiA9IGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSBcbiAgdWdlbi5uYW1lID0gJ2VudicgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZXEnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IHRoaXMuaW5wdXRzWzBdID09PSB0aGlzLmlucHV0c1sxXSA/IDEgOiBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSA9PT0gJHtpbnB1dHNbMV19KSB8IDBcXG5cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfWAsIG91dCBdXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgaW4yICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZXhwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBpc1dvcmtsZXQgPyAnTWF0aC5leHAnIDogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfWV4cCggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5leHAoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBleHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZXhwLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGV4cFxufVxuIiwiXG4vKipcbiAqIENvcHlyaWdodCAyMDE4IEdvb2dsZSBMTENcbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyB5b3UgbWF5IG5vdFxuICogdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLiBZb3UgbWF5IG9idGFpbiBhIGNvcHkgb2ZcbiAqIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICpcbiAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAqIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUywgV0lUSE9VVFxuICogV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLiBTZWUgdGhlXG4gKiBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZCBsaW1pdGF0aW9ucyB1bmRlclxuICogdGhlIExpY2Vuc2UuXG4gKi9cblxuLy8gb3JpZ2luYWxseSBmcm9tOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL0dvb2dsZUNocm9tZUxhYnMvYXVkaW93b3JrbGV0LXBvbHlmaWxsXG4vLyBJIGFtIG1vZGlmeWluZyBpdCB0byBhY2NlcHQgdmFyaWFibGUgYnVmZmVyIHNpemVzXG4vLyBhbmQgdG8gZ2V0IHJpZCBvZiBzb21lIHN0cmFuZ2UgZ2xvYmFsIGluaXRpYWxpemF0aW9uIHRoYXQgaXMgcmVxdWlyZWQgdG8gdXNlIGl0LlxuXG5jb25zdCBSZWFsbSA9IHJlcXVpcmUoICcuL3JlYWxtLmpzJyApXG5cbmNvbnN0IEFXUEYgPSBmdW5jdGlvbiggc2VsZiA9IHdpbmRvdywgYnVmZmVyU2l6ZSA9IDQwOTYgKSB7XG4gIGNvbnN0IFBBUkFNUyA9IFtdXG4gIGxldCBuZXh0UG9ydFxuXG4gIGlmICh0eXBlb2YgQXVkaW9Xb3JrbGV0Tm9kZSAhPT0gJ2Z1bmN0aW9uJyB8fCAhKFwiYXVkaW9Xb3JrbGV0XCIgaW4gQXVkaW9Db250ZXh0LnByb3RvdHlwZSkpIHtcbiAgICBzZWxmLkF1ZGlvV29ya2xldE5vZGUgPSBmdW5jdGlvbiBBdWRpb1dvcmtsZXROb2RlIChjb250ZXh0LCBuYW1lLCBvcHRpb25zKSB7XG4gICAgICBjb25zdCBwcm9jZXNzb3IgPSBnZXRQcm9jZXNzb3JzRm9yQ29udGV4dChjb250ZXh0KVtuYW1lXTtcbiAgICAgIGNvbnN0IG91dHB1dENoYW5uZWxzID0gb3B0aW9ucyAmJiBvcHRpb25zLm91dHB1dENoYW5uZWxDb3VudCA/IG9wdGlvbnMub3V0cHV0Q2hhbm5lbENvdW50WzBdIDogMjtcbiAgICAgIGNvbnN0IHNjcmlwdFByb2Nlc3NvciA9IGNvbnRleHQuY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCBidWZmZXJTaXplLCAyLCBvdXRwdXRDaGFubmVscyk7XG5cbiAgICAgIHNjcmlwdFByb2Nlc3Nvci5wYXJhbWV0ZXJzID0gbmV3IE1hcCgpO1xuICAgICAgaWYgKHByb2Nlc3Nvci5wcm9wZXJ0aWVzKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcHJvY2Vzc29yLnByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBjb25zdCBwcm9wID0gcHJvY2Vzc29yLnByb3BlcnRpZXNbaV07XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbigpLmdhaW47XG4gICAgICAgICAgbm9kZS52YWx1ZSA9IHByb3AuZGVmYXVsdFZhbHVlO1xuICAgICAgICAgIC8vIEBUT0RPIHRoZXJlJ3Mgbm8gZ29vZCB3YXkgdG8gY29uc3RydWN0IHRoZSBwcm94eSBBdWRpb1BhcmFtIGhlcmVcbiAgICAgICAgICBzY3JpcHRQcm9jZXNzb3IucGFyYW1ldGVycy5zZXQocHJvcC5uYW1lLCBub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb25zdCBtYyA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO1xuICAgICAgbmV4dFBvcnQgPSBtYy5wb3J0MjtcbiAgICAgIGNvbnN0IGluc3QgPSBuZXcgcHJvY2Vzc29yLlByb2Nlc3NvcihvcHRpb25zIHx8IHt9KTtcbiAgICAgIG5leHRQb3J0ID0gbnVsbDtcblxuICAgICAgc2NyaXB0UHJvY2Vzc29yLnBvcnQgPSBtYy5wb3J0MTtcbiAgICAgIHNjcmlwdFByb2Nlc3Nvci5wcm9jZXNzb3IgPSBwcm9jZXNzb3I7XG4gICAgICBzY3JpcHRQcm9jZXNzb3IuaW5zdGFuY2UgPSBpbnN0O1xuICAgICAgc2NyaXB0UHJvY2Vzc29yLm9uYXVkaW9wcm9jZXNzID0gb25BdWRpb1Byb2Nlc3M7XG4gICAgICByZXR1cm4gc2NyaXB0UHJvY2Vzc29yO1xuICAgIH07XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoKHNlbGYuQXVkaW9Db250ZXh0IHx8IHNlbGYud2Via2l0QXVkaW9Db250ZXh0KS5wcm90b3R5cGUsICdhdWRpb1dvcmtsZXQnLCB7XG4gICAgICBnZXQgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy4kJGF1ZGlvV29ya2xldCB8fCAodGhpcy4kJGF1ZGlvV29ya2xldCA9IG5ldyBzZWxmLkF1ZGlvV29ya2xldCh0aGlzKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzZWxmLkF1ZGlvV29ya2xldCA9IGNsYXNzIEF1ZGlvV29ya2xldCB7XG4gICAgICBjb25zdHJ1Y3RvciAoYXVkaW9Db250ZXh0KSB7XG4gICAgICAgIHRoaXMuJCRjb250ZXh0ID0gYXVkaW9Db250ZXh0O1xuICAgICAgfVxuXG4gICAgICBhZGRNb2R1bGUgKHVybCwgb3B0aW9ucykge1xuICAgICAgICByZXR1cm4gZmV0Y2godXJsKS50aGVuKHIgPT4ge1xuICAgICAgICAgIGlmICghci5vaykgdGhyb3cgRXJyb3Ioci5zdGF0dXMpO1xuICAgICAgICAgIHJldHVybiByLnRleHQoKTtcbiAgICAgICAgfSkudGhlbiggY29kZSA9PiB7XG4gICAgICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgICAgIHNhbXBsZVJhdGU6IHRoaXMuJCRjb250ZXh0LnNhbXBsZVJhdGUsXG4gICAgICAgICAgICBjdXJyZW50VGltZTogdGhpcy4kJGNvbnRleHQuY3VycmVudFRpbWUsXG4gICAgICAgICAgICBBdWRpb1dvcmtsZXRQcm9jZXNzb3IgKCkge1xuICAgICAgICAgICAgICB0aGlzLnBvcnQgPSBuZXh0UG9ydDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWdpc3RlclByb2Nlc3NvcjogKG5hbWUsIFByb2Nlc3NvcikgPT4ge1xuICAgICAgICAgICAgICBjb25zdCBwcm9jZXNzb3JzID0gZ2V0UHJvY2Vzc29yc0ZvckNvbnRleHQodGhpcy4kJGNvbnRleHQpO1xuICAgICAgICAgICAgICBwcm9jZXNzb3JzW25hbWVdID0ge1xuICAgICAgICAgICAgICAgIHJlYWxtLFxuICAgICAgICAgICAgICAgIGNvbnRleHQsXG4gICAgICAgICAgICAgICAgUHJvY2Vzc29yLFxuICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IFByb2Nlc3Nvci5wYXJhbWV0ZXJEZXNjcmlwdG9ycyB8fCBbXVxuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBjb250ZXh0LnNlbGYgPSBjb250ZXh0O1xuICAgICAgICAgIGNvbnN0IHJlYWxtID0gbmV3IFJlYWxtKGNvbnRleHQsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG4gICAgICAgICAgcmVhbG0uZXhlYygoKG9wdGlvbnMgJiYgb3B0aW9ucy50cmFuc3BpbGUpIHx8IFN0cmluZykoY29kZSkpO1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gb25BdWRpb1Byb2Nlc3MgKGUpIHtcbiAgICBjb25zdCBwYXJhbWV0ZXJzID0ge307XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgdGhpcy5wYXJhbWV0ZXJzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGNvbnN0IGFyciA9IFBBUkFNU1srK2luZGV4XSB8fCAoUEFSQU1TW2luZGV4XSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5idWZmZXJTaXplKSk7XG4gICAgICAvLyBAVE9ETyBwcm9wZXIgdmFsdWVzIGhlcmUgaWYgcG9zc2libGVcbiAgICAgIGFyci5maWxsKHZhbHVlLnZhbHVlKTtcbiAgICAgIHBhcmFtZXRlcnNba2V5XSA9IGFycjtcbiAgICB9KTtcbiAgICB0aGlzLnByb2Nlc3Nvci5yZWFsbS5leGVjKFxuICAgICAgJ3NlbGYuc2FtcGxlUmF0ZT1zYW1wbGVSYXRlPScgKyB0aGlzLmNvbnRleHQuc2FtcGxlUmF0ZSArICc7JyArXG4gICAgICAnc2VsZi5jdXJyZW50VGltZT1jdXJyZW50VGltZT0nICsgdGhpcy5jb250ZXh0LmN1cnJlbnRUaW1lXG4gICAgKTtcbiAgICBjb25zdCBpbnB1dHMgPSBjaGFubmVsVG9BcnJheShlLmlucHV0QnVmZmVyKTtcbiAgICBjb25zdCBvdXRwdXRzID0gY2hhbm5lbFRvQXJyYXkoZS5vdXRwdXRCdWZmZXIpO1xuICAgIHRoaXMuaW5zdGFuY2UucHJvY2VzcyhbaW5wdXRzXSwgW291dHB1dHNdLCBwYXJhbWV0ZXJzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoYW5uZWxUb0FycmF5IChjaCkge1xuICAgIGNvbnN0IG91dCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2gubnVtYmVyT2ZDaGFubmVsczsgaSsrKSB7XG4gICAgICBvdXRbaV0gPSBjaC5nZXRDaGFubmVsRGF0YShpKTtcbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFByb2Nlc3NvcnNGb3JDb250ZXh0IChhdWRpb0NvbnRleHQpIHtcbiAgICByZXR1cm4gYXVkaW9Db250ZXh0LiQkcHJvY2Vzc29ycyB8fCAoYXVkaW9Db250ZXh0LiQkcHJvY2Vzc29ycyA9IHt9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEFXUEZcbiIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTggR29vZ2xlIExMQ1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBBcGFjaGUgTGljZW5zZSwgVmVyc2lvbiAyLjAgKHRoZSBcIkxpY2Vuc2VcIik7IHlvdSBtYXkgbm90XG4gKiB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZlxuICogdGhlIExpY2Vuc2UgYXRcbiAqXG4gKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLCBXSVRIT1VUXG4gKiBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuIFNlZSB0aGVcbiAqIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kIGxpbWl0YXRpb25zIHVuZGVyXG4gKiB0aGUgTGljZW5zZS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIFJlYWxtIChzY29wZSwgcGFyZW50RWxlbWVudCkge1xuICBjb25zdCBmcmFtZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2lmcmFtZScpO1xuICBmcmFtZS5zdHlsZS5jc3NUZXh0ID0gJ3Bvc2l0aW9uOmFic29sdXRlO2xlZnQ6MDt0b3A6LTk5OXB4O3dpZHRoOjFweDtoZWlnaHQ6MXB4Oyc7XG4gIHBhcmVudEVsZW1lbnQuYXBwZW5kQ2hpbGQoZnJhbWUpO1xuICBjb25zdCB3aW4gPSBmcmFtZS5jb250ZW50V2luZG93O1xuICBjb25zdCBkb2MgPSB3aW4uZG9jdW1lbnQ7XG4gIGxldCB2YXJzID0gJ3ZhciB3aW5kb3csJGhvb2snO1xuICBmb3IgKGNvbnN0IGkgaW4gd2luKSB7XG4gICAgaWYgKCEoaSBpbiBzY29wZSkgJiYgaSAhPT0gJ2V2YWwnKSB7XG4gICAgICB2YXJzICs9ICcsJztcbiAgICAgIHZhcnMgKz0gaTtcbiAgICB9XG4gIH1cbiAgZm9yIChjb25zdCBpIGluIHNjb3BlKSB7XG4gICAgdmFycyArPSAnLCc7XG4gICAgdmFycyArPSBpO1xuICAgIHZhcnMgKz0gJz1zZWxmLic7XG4gICAgdmFycyArPSBpO1xuICB9XG4gIGNvbnN0IHNjcmlwdCA9IGRvYy5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgc2NyaXB0LmFwcGVuZENoaWxkKGRvYy5jcmVhdGVUZXh0Tm9kZShcbiAgICBgZnVuY3Rpb24gJGhvb2soc2VsZixjb25zb2xlKSB7XCJ1c2Ugc3RyaWN0XCI7XG4gICAgICAgICR7dmFyc307cmV0dXJuIGZ1bmN0aW9uKCkge3JldHVybiBldmFsKGFyZ3VtZW50c1swXSl9fWBcbiAgKSk7XG4gIGRvYy5ib2R5LmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gIHRoaXMuZXhlYyA9IHdpbi4kaG9vay5jYWxsKHNjb3BlLCBzY29wZSwgY29uc29sZSk7XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZmxvb3InLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICAvL2dlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmZsb29yIH0pXG5cbiAgICAgIG91dCA9IGAoICR7aW5wdXRzWzBdfSB8IDAgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gfCAwXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgZmxvb3IgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZmxvb3IuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gZmxvb3Jcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZm9sZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dFxuXG4gICAgb3V0ID0gdGhpcy5jcmVhdGVDYWxsYmFjayggaW5wdXRzWzBdLCB0aGlzLm1pbiwgdGhpcy5tYXggKSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgb3V0IF1cbiAgfSxcblxuICBjcmVhdGVDYWxsYmFjayggdiwgbG8sIGhpICkge1xuICAgIGxldCBvdXQgPVxuYCB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2fSxcbiAgICAgICR7dGhpcy5uYW1lfV9yYW5nZSA9ICR7aGl9IC0gJHtsb30sXG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAwXG5cbiAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlID49ICR7aGl9KXtcbiAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlXG4gICAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlID49ICR7aGl9KXtcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9ICgoJHt0aGlzLm5hbWV9X3ZhbHVlIC0gJHtsb30pIC8gJHt0aGlzLm5hbWV9X3JhbmdlKSB8IDBcbiAgICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2UgKiAke3RoaXMubmFtZX1fbnVtV3JhcHNcbiAgICB9XG4gICAgJHt0aGlzLm5hbWV9X251bVdyYXBzKytcbiAgfSBlbHNlIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA8ICR7bG99KXtcbiAgICAke3RoaXMubmFtZX1fdmFsdWUgKz0gJHt0aGlzLm5hbWV9X3JhbmdlXG4gICAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlIDwgJHtsb30pe1xuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gKCgke3RoaXMubmFtZX1fdmFsdWUgLSAke2xvfSkgLyAke3RoaXMubmFtZX1fcmFuZ2UtIDEpIHwgMFxuICAgICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZSAqICR7dGhpcy5uYW1lfV9udW1XcmFwc1xuICAgIH1cbiAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMtLVxuICB9XG4gIGlmKCR7dGhpcy5uYW1lfV9udW1XcmFwcyAmIDEpICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7aGl9ICsgJHtsb30gLSAke3RoaXMubmFtZX1fdmFsdWVcbmBcbiAgICByZXR1cm4gJyAnICsgb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2dhdGUnLFxuICBjb250cm9sU3RyaW5nOm51bGwsIC8vIGluc2VydCBpbnRvIG91dHB1dCBjb2RlZ2VuIGZvciBkZXRlcm1pbmluZyBpbmRleGluZ1xuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG4gICAgXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBsZXQgbGFzdElucHV0TWVtb3J5SWR4ID0gJ21lbW9yeVsgJyArIHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAnIF0nLFxuICAgICAgICBvdXRwdXRNZW1vcnlTdGFydElkeCA9IHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAxLFxuICAgICAgICBpbnB1dFNpZ25hbCA9IGlucHV0c1swXSxcbiAgICAgICAgY29udHJvbFNpZ25hbCA9IGlucHV0c1sxXVxuICAgIFxuICAgIC8qIFxuICAgICAqIHdlIGNoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCBjb250cm9sIGlucHV0cyBlcXVhbHMgb3VyIGxhc3QgaW5wdXRcbiAgICAgKiBpZiBzbywgd2Ugc3RvcmUgdGhlIHNpZ25hbCBpbnB1dCBpbiB0aGUgbWVtb3J5IGFzc29jaWF0ZWQgd2l0aCB0aGUgY3VycmVudGx5XG4gICAgICogc2VsZWN0ZWQgaW5kZXguIElmIG5vdCwgd2UgcHV0IDAgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGxhc3Qgc2VsZWN0ZWQgaW5kZXgsXG4gICAgICogY2hhbmdlIHRoZSBzZWxlY3RlZCBpbmRleCwgYW5kIHRoZW4gc3RvcmUgdGhlIHNpZ25hbCBpbiBwdXQgaW4gdGhlIG1lbWVyeSBhc3NvaWNhdGVkXG4gICAgICogd2l0aCB0aGUgbmV3bHkgc2VsZWN0ZWQgaW5kZXhcbiAgICAgKi9cbiAgICBcbiAgICBvdXQgPVxuXG5gIGlmKCAke2NvbnRyb2xTaWduYWx9ICE9PSAke2xhc3RJbnB1dE1lbW9yeUlkeH0gKSB7XG4gICAgbWVtb3J5WyAke2xhc3RJbnB1dE1lbW9yeUlkeH0gKyAke291dHB1dE1lbW9yeVN0YXJ0SWR4fSAgXSA9IDAgXG4gICAgJHtsYXN0SW5wdXRNZW1vcnlJZHh9ID0gJHtjb250cm9sU2lnbmFsfVxuICB9XG4gIG1lbW9yeVsgJHtvdXRwdXRNZW1vcnlTdGFydElkeH0gKyAke2NvbnRyb2xTaWduYWx9IF0gPSAke2lucHV0U2lnbmFsfVxuXG5gXG4gICAgdGhpcy5jb250cm9sU3RyaW5nID0gaW5wdXRzWzFdXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgdGhpcy5vdXRwdXRzLmZvckVhY2goIHYgPT4gdi5nZW4oKSApXG5cbiAgICByZXR1cm4gWyBudWxsLCAnICcgKyBvdXQgXVxuICB9LFxuXG4gIGNoaWxkZ2VuKCkge1xuICAgIGlmKCB0aGlzLnBhcmVudC5pbml0aWFsaXplZCA9PT0gZmFsc2UgKSB7XG4gICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzICkgLy8gcGFyZW50IGdhdGUgaXMgb25seSBpbnB1dCBvZiBhIGdhdGUgb3V0cHV0LCBzaG91bGQgb25seSBiZSBnZW4nZCBvbmNlLlxuICAgIH1cblxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG5cbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbICR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fSBdYFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gIGBtZW1vcnlbICR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fSBdYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjb3VudDogMiB9XG5cbiAgaWYoIHR5cGVvZiBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIG91dHB1dHM6IFtdLFxuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgY29udHJvbCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgbGFzdElucHV0OiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgfSxcbiAgICBpbml0aWFsaXplZDpmYWxzZVxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7Z2VuLmdldFVJRCgpfWBcblxuICBmb3IoIGxldCBpID0gMDsgaSA8IHVnZW4uY291bnQ7IGkrKyApIHtcbiAgICB1Z2VuLm91dHB1dHMucHVzaCh7XG4gICAgICBpbmRleDppLFxuICAgICAgZ2VuOiBwcm90by5jaGlsZGdlbixcbiAgICAgIHBhcmVudDp1Z2VuLFxuICAgICAgaW5wdXRzOiBbIHVnZW4gXSxcbiAgICAgIG1lbW9yeToge1xuICAgICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgICAgfSxcbiAgICAgIGluaXRpYWxpemVkOmZhbHNlLFxuICAgICAgbmFtZTogYCR7dWdlbi5uYW1lfV9vdXQke2dlbi5nZXRVSUQoKX1gXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuLyogZ2VuLmpzXG4gKlxuICogbG93LWxldmVsIGNvZGUgZ2VuZXJhdGlvbiBmb3IgdW5pdCBnZW5lcmF0b3JzXG4gKlxuICovXG5cbmxldCBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCAnbWVtb3J5LWhlbHBlcicgKVxuXG5sZXQgZ2VuID0ge1xuXG4gIGFjY3VtOjAsXG4gIGdldFVJRCgpIHsgcmV0dXJuIHRoaXMuYWNjdW0rKyB9LFxuICBkZWJ1ZzpmYWxzZSxcbiAgc2FtcGxlcmF0ZTogNDQxMDAsIC8vIGNoYW5nZSBvbiBhdWRpb2NvbnRleHQgY3JlYXRpb25cbiAgc2hvdWxkTG9jYWxpemU6IGZhbHNlLFxuICBnbG9iYWxzOntcbiAgICB3aW5kb3dzOiB7fSxcbiAgfSxcbiAgbW9kZTond29ya2xldCcsXG4gIFxuICAvKiBjbG9zdXJlc1xuICAgKlxuICAgKiBGdW5jdGlvbnMgdGhhdCBhcmUgaW5jbHVkZWQgYXMgYXJndW1lbnRzIHRvIG1hc3RlciBjYWxsYmFjay4gRXhhbXBsZXM6IE1hdGguYWJzLCBNYXRoLnJhbmRvbSBldGMuXG4gICAqIFhYWCBTaG91bGQgcHJvYmFibHkgYmUgcmVuYW1lZCBjYWxsYmFja1Byb3BlcnRpZXMgb3Igc29tZXRoaW5nIHNpbWlsYXIuLi4gY2xvc3VyZXMgYXJlIG5vIGxvbmdlciB1c2VkLlxuICAgKi9cblxuICBjbG9zdXJlczogbmV3IFNldCgpLFxuICBwYXJhbXM6ICAgbmV3IFNldCgpLFxuICBpbnB1dHM6ICAgbmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6IG5ldyBTZXQoKSxcbiAgZW5kQmxvY2s6IG5ldyBTZXQoKSxcbiAgaGlzdG9yaWVzOiBuZXcgTWFwKCksXG5cbiAgbWVtbzoge30sXG5cbiAgLy9kYXRhOiB7fSxcbiAgXG4gIC8qIGV4cG9ydFxuICAgKlxuICAgKiBwbGFjZSBnZW4gZnVuY3Rpb25zIGludG8gYW5vdGhlciBvYmplY3QgZm9yIGVhc2llciByZWZlcmVuY2VcbiAgICovXG5cbiAgZXhwb3J0KCBvYmogKSB7fSxcblxuICBhZGRUb0VuZEJsb2NrKCB2ICkge1xuICAgIHRoaXMuZW5kQmxvY2suYWRkKCAnICAnICsgdiApXG4gIH0sXG4gIFxuICByZXF1ZXN0TWVtb3J5KCBtZW1vcnlTcGVjLCBpbW11dGFibGU9ZmFsc2UgKSB7XG4gICAgZm9yKCBsZXQga2V5IGluIG1lbW9yeVNwZWMgKSB7XG4gICAgICBsZXQgcmVxdWVzdCA9IG1lbW9yeVNwZWNbIGtleSBdXG5cbiAgICAgIC8vY29uc29sZS5sb2coICdyZXF1ZXN0aW5nICcgKyBrZXkgKyAnOicgLCBKU09OLnN0cmluZ2lmeSggcmVxdWVzdCApIClcblxuICAgICAgaWYoIHJlcXVlc3QubGVuZ3RoID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAndW5kZWZpbmVkIGxlbmd0aCBmb3I6Jywga2V5IClcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmlkeCA9IGdlbi5tZW1vcnkuYWxsb2MoIHJlcXVlc3QubGVuZ3RoLCBpbW11dGFibGUgKVxuICAgIH1cbiAgfSxcblxuICBjcmVhdGVNZW1vcnkoIGFtb3VudCwgdHlwZSApIHtcbiAgICBjb25zdCBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCBtZW0sIHR5cGUgKVxuICB9LFxuXG4gIC8qIGNyZWF0ZUNhbGxiYWNrXG4gICAqXG4gICAqIHBhcmFtIHVnZW4gLSBIZWFkIG9mIGdyYXBoIHRvIGJlIGNvZGVnZW4nZFxuICAgKlxuICAgKiBHZW5lcmF0ZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVnZW4gZ3JhcGguXG4gICAqIFRoZSBnZW4uY2xvc3VyZXMgcHJvcGVydHkgc3RvcmVzIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmVcbiAgICogcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZmluYWwgZnVuY3Rpb247IHRoZXNlIGFyZSBwcmVmaXhlZFxuICAgKiBiZWZvcmUgYW55IGRlZmluZWQgcGFyYW1zIHRoZSBncmFwaCBleHBvc2VzLiBGb3IgZXhhbXBsZSwgZ2l2ZW46XG4gICAqXG4gICAqIGdlbi5jcmVhdGVDYWxsYmFjayggYWJzKCBwYXJhbSgpICkgKVxuICAgKlxuICAgKiAuLi4gdGhlIGdlbmVyYXRlZCBmdW5jdGlvbiB3aWxsIGhhdmUgYSBzaWduYXR1cmUgb2YgKCBhYnMsIHAwICkuXG4gICAqL1xuICBcbiAgY3JlYXRlQ2FsbGJhY2soIHVnZW4sIG1lbSwgZGVidWcgPSBmYWxzZSwgc2hvdWxkSW5saW5lTWVtb3J5PWZhbHNlLCBtZW1UeXBlID0gRmxvYXQ2NEFycmF5ICkge1xuICAgIGxldCBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIHVnZW4gKSAmJiB1Z2VuLmxlbmd0aCA+IDEsXG4gICAgICAgIGNhbGxiYWNrLCBcbiAgICAgICAgY2hhbm5lbDEsIGNoYW5uZWwyXG5cbiAgICBpZiggdHlwZW9mIG1lbSA9PT0gJ251bWJlcicgfHwgbWVtID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCBtZW0sIG1lbVR5cGUgKVxuICAgIH1cbiAgICBcbiAgICAvL2NvbnNvbGUubG9nKCAnY2IgbWVtb3J5OicsIG1lbSApXG4gICAgdGhpcy5tZW1vcnkgPSBtZW1cbiAgICB0aGlzLm91dHB1dElkeCA9IHRoaXMubWVtb3J5LmFsbG9jKCAyLCB0cnVlIClcbiAgICB0aGlzLm1lbW8gPSB7fSBcbiAgICB0aGlzLmVuZEJsb2NrLmNsZWFyKClcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKClcbiAgICB0aGlzLmlucHV0cy5jbGVhcigpXG4gICAgdGhpcy5wYXJhbXMuY2xlYXIoKVxuICAgIC8vdGhpcy5nbG9iYWxzID0geyB3aW5kb3dzOnt9IH1cbiAgICBcbiAgICB0aGlzLnBhcmFtZXRlcnMuY2xlYXIoKVxuICAgIFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gXCIgICd1c2Ugc3RyaWN0J1xcblwiXG4gICAgaWYoIHNob3VsZElubGluZU1lbW9yeT09PWZhbHNlICkge1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gdGhpcy5tb2RlID09PSAnd29ya2xldCcgPyBcbiAgICAgICAgXCIgIHZhciBtZW1vcnkgPSB0aGlzLm1lbW9yeVxcblxcblwiIDpcbiAgICAgICAgXCIgIHZhciBtZW1vcnkgPSBnZW4ubWVtb3J5XFxuXFxuXCJcbiAgICB9XG5cbiAgICAvLyBjYWxsIC5nZW4oKSBvbiB0aGUgaGVhZCBvZiB0aGUgZ3JhcGggd2UgYXJlIGdlbmVyYXRpbmcgdGhlIGNhbGxiYWNrIGZvclxuICAgIC8vY29uc29sZS5sb2coICdIRUFEJywgdWdlbiApXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxICsgaXNTdGVyZW87IGkrKyApIHtcbiAgICAgIGlmKCB0eXBlb2YgdWdlbltpXSA9PT0gJ251bWJlcicgKSBjb250aW51ZVxuXG4gICAgICAvL2xldCBjaGFubmVsID0gaXNTdGVyZW8gPyB1Z2VuW2ldLmdlbigpIDogdWdlbi5nZW4oKSxcbiAgICAgIGxldCBjaGFubmVsID0gaXNTdGVyZW8gPyB0aGlzLmdldElucHV0KCB1Z2VuW2ldICkgOiB0aGlzLmdldElucHV0KCB1Z2VuICksIFxuICAgICAgICAgIGJvZHkgPSAnJ1xuXG4gICAgICAvLyBpZiAuZ2VuKCkgcmV0dXJucyBhcnJheSwgYWRkIHVnZW4gY2FsbGJhY2sgKGdyYXBoT3V0cHV0WzFdKSB0byBvdXIgb3V0cHV0IGZ1bmN0aW9ucyBib2R5XG4gICAgICAvLyBhbmQgdGhlbiByZXR1cm4gbmFtZSBvZiB1Z2VuLiBJZiAuZ2VuKCkgb25seSBnZW5lcmF0ZXMgYSBudW1iZXIgKGZvciByZWFsbHkgc2ltcGxlIGdyYXBocylcbiAgICAgIC8vIGp1c3QgcmV0dXJuIHRoYXQgbnVtYmVyIChncmFwaE91dHB1dFswXSkuXG4gICAgICBib2R5ICs9IEFycmF5LmlzQXJyYXkoIGNoYW5uZWwgKSA/IGNoYW5uZWxbMV0gKyAnXFxuJyArIGNoYW5uZWxbMF0gOiBjaGFubmVsXG5cbiAgICAgIC8vIHNwbGl0IGJvZHkgdG8gaW5qZWN0IHJldHVybiBrZXl3b3JkIG9uIGxhc3QgbGluZVxuICAgICAgYm9keSA9IGJvZHkuc3BsaXQoJ1xcbicpXG4gICAgIFxuICAgICAgLy9pZiggZGVidWcgKSBjb25zb2xlLmxvZyggJ2Z1bmN0aW9uQm9keSBsZW5ndGgnLCBib2R5IClcbiAgICAgIFxuICAgICAgLy8gbmV4dCBsaW5lIGlzIHRvIGFjY29tbW9kYXRlIG1lbW8gYXMgZ3JhcGggaGVhZFxuICAgICAgaWYoIGJvZHlbIGJvZHkubGVuZ3RoIC0xIF0udHJpbSgpLmluZGV4T2YoJ2xldCcpID4gLTEgKSB7IGJvZHkucHVzaCggJ1xcbicgKSB9IFxuXG4gICAgICAvLyBnZXQgaW5kZXggb2YgbGFzdCBsaW5lXG4gICAgICBsZXQgbGFzdGlkeCA9IGJvZHkubGVuZ3RoIC0gMVxuXG4gICAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICAgIGJvZHlbIGxhc3RpZHggXSA9ICcgIG1lbW9yeVsnICsgKHRoaXMub3V0cHV0SWR4ICsgaSkgKyAnXSAgPSAnICsgYm9keVsgbGFzdGlkeCBdICsgJ1xcbidcblxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gYm9keS5qb2luKCdcXG4nKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLmhpc3Rvcmllcy5mb3JFYWNoKCB2YWx1ZSA9PiB7XG4gICAgICBpZiggdmFsdWUgIT09IG51bGwgKVxuICAgICAgICB2YWx1ZS5nZW4oKSAgICAgIFxuICAgIH0pXG5cbiAgICBjb25zdCByZXR1cm5TdGF0ZW1lbnQgPSBpc1N0ZXJlbyA/IGAgIHJldHVybiBbIG1lbW9yeVske3RoaXMub3V0cHV0SWR4fV0sIG1lbW9yeVske3RoaXMub3V0cHV0SWR4ICsgMX1dIF1gIDogYCAgcmV0dXJuIG1lbW9yeVske3RoaXMub3V0cHV0SWR4fV1gXG4gICAgXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5zcGxpdCgnXFxuJylcblxuICAgIGlmKCB0aGlzLmVuZEJsb2NrLnNpemUgKSB7IFxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5jb25jYXQoIEFycmF5LmZyb20oIHRoaXMuZW5kQmxvY2sgKSApXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCByZXR1cm5TdGF0ZW1lbnQgKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAgICB9XG4gICAgLy8gcmVhc3NlbWJsZSBmdW5jdGlvbiBib2R5XG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKVxuXG4gICAgLy8gd2UgY2FuIG9ubHkgZHluYW1pY2FsbHkgY3JlYXRlIGEgbmFtZWQgZnVuY3Rpb24gYnkgZHluYW1pY2FsbHkgY3JlYXRpbmcgYW5vdGhlciBmdW5jdGlvblxuICAgIC8vIHRvIGNvbnN0cnVjdCB0aGUgbmFtZWQgZnVuY3Rpb24hIHNoZWVzaC4uLlxuICAgIC8vXG4gICAgaWYoIHNob3VsZElubGluZU1lbW9yeSA9PT0gdHJ1ZSApIHtcbiAgICAgIHRoaXMucGFyYW1ldGVycy5hZGQoICdtZW1vcnknIClcbiAgICB9XG5cbiAgICBsZXQgcGFyYW1TdHJpbmcgPSAnJ1xuICAgIGlmKCB0aGlzLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgIGZvciggbGV0IG5hbWUgb2YgdGhpcy5wYXJhbWV0ZXJzLnZhbHVlcygpICkge1xuICAgICAgICBwYXJhbVN0cmluZyArPSBuYW1lICsgJywnXG4gICAgICB9XG4gICAgICBwYXJhbVN0cmluZyA9IHBhcmFtU3RyaW5nLnNsaWNlKDAsLTEpXG4gICAgfVxuXG4gICAgY29uc3Qgc2VwYXJhdG9yID0gdGhpcy5wYXJhbWV0ZXJzLnNpemUgIT09IDAgJiYgdGhpcy5pbnB1dHMuc2l6ZSA+IDAgPyAnLCAnIDogJydcblxuICAgIGxldCBpbnB1dFN0cmluZyA9ICcnXG4gICAgaWYoIHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuICAgICAgZm9yKCBsZXQgdWdlbiBvZiB0aGlzLmlucHV0cy52YWx1ZXMoKSApIHtcbiAgICAgICAgaW5wdXRTdHJpbmcgKz0gdWdlbi5uYW1lICsgJywnXG4gICAgICB9XG4gICAgICBpbnB1dFN0cmluZyA9IGlucHV0U3RyaW5nLnNsaWNlKDAsLTEpXG4gICAgfVxuXG4gICAgbGV0IGJ1aWxkU3RyaW5nID0gdGhpcy5tb2RlID09PSAnd29ya2xldCdcbiAgICAgID8gYHJldHVybiBmdW5jdGlvbiggJHtpbnB1dFN0cmluZ30gJHtzZXBhcmF0b3J9ICR7cGFyYW1TdHJpbmd9ICl7IFxcbiR7IHRoaXMuZnVuY3Rpb25Cb2R5IH1cXG59YFxuICAgICAgOiBgcmV0dXJuIGZ1bmN0aW9uIGdlbiggJHsgWy4uLnRoaXMucGFyYW1ldGVyc10uam9pbignLCcpIH0gKXsgXFxuJHsgdGhpcy5mdW5jdGlvbkJvZHkgfVxcbn1gXG4gICAgXG4gICAgaWYoIHRoaXMuZGVidWcgfHwgZGVidWcgKSBjb25zb2xlLmxvZyggYnVpbGRTdHJpbmcgKSBcblxuICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKCBidWlsZFN0cmluZyApKClcblxuICAgIC8vIGFzc2lnbiBwcm9wZXJ0aWVzIHRvIG5hbWVkIGZ1bmN0aW9uXG4gICAgZm9yKCBsZXQgZGljdCBvZiB0aGlzLmNsb3N1cmVzLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHZhbHVlID0gZGljdFsgbmFtZSBdXG5cbiAgICAgIGNhbGxiYWNrWyBuYW1lIF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5wYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdWdlbiA9IGRpY3RbIG5hbWUgXVxuICAgICAgXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGNhbGxiYWNrLCBuYW1lLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gdWdlbi52YWx1ZSB9LFxuICAgICAgICBzZXQodil7IHVnZW4udmFsdWUgPSB2IH1cbiAgICAgIH0pXG4gICAgICAvL2NhbGxiYWNrWyBuYW1lIF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIGNhbGxiYWNrLm1lbWJlcnMgPSB0aGlzLmNsb3N1cmVzXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YVxuICAgIGNhbGxiYWNrLnBhcmFtcyA9IHRoaXMucGFyYW1zXG4gICAgY2FsbGJhY2suaW5wdXRzID0gdGhpcy5pbnB1dHNcbiAgICBjYWxsYmFjay5wYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJzLy8uc2xpY2UoIDAgKVxuICAgIGNhbGxiYWNrLmlzU3RlcmVvID0gaXNTdGVyZW9cblxuICAgIC8vaWYoIE1lbW9yeUhlbHBlci5pc1Byb3RvdHlwZU9mKCB0aGlzLm1lbW9yeSApICkgXG4gICAgY2FsbGJhY2subWVtb3J5ID0gdGhpcy5tZW1vcnkuaGVhcFxuXG4gICAgdGhpcy5oaXN0b3JpZXMuY2xlYXIoKVxuXG4gICAgcmV0dXJuIGNhbGxiYWNrXG4gIH0sXG4gIFxuICAvKiBnZXRJbnB1dHNcbiAgICpcbiAgICogQ2FsbGVkIGJ5IGVhY2ggaW5kaXZpZHVhbCB1Z2VuIHdoZW4gdGhlaXIgLmdlbigpIG1ldGhvZCBpcyBjYWxsZWQgdG8gcmVzb2x2ZSB0aGVpciB2YXJpb3VzIGlucHV0cy5cbiAgICogSWYgYW4gaW5wdXQgaXMgYSBudW1iZXIsIHJldHVybiB0aGUgbnVtYmVyLiBJZlxuICAgKiBpdCBpcyBhbiB1Z2VuLCBjYWxsIC5nZW4oKSBvbiB0aGUgdWdlbiwgbWVtb2l6ZSB0aGUgcmVzdWx0IGFuZCByZXR1cm4gdGhlIHJlc3VsdC4gSWYgdGhlXG4gICAqIHVnZW4gaGFzIHByZXZpb3VzbHkgYmVlbiBtZW1vaXplZCByZXR1cm4gdGhlIG1lbW9pemVkIHZhbHVlLlxuICAgKlxuICAgKi9cbiAgZ2V0SW5wdXRzKCB1Z2VuICkge1xuICAgIHJldHVybiB1Z2VuLmlucHV0cy5tYXAoIGdlbi5nZXRJbnB1dCApIFxuICB9LFxuXG4gIGdldElucHV0KCBpbnB1dCApIHtcbiAgICBsZXQgaXNPYmplY3QgPSB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnLFxuICAgICAgICBwcm9jZXNzZWRJbnB1dFxuXG4gICAgaWYoIGlzT2JqZWN0ICkgeyAvLyBpZiBpbnB1dCBpcyBhIHVnZW4uLi4gXG4gICAgICAvL2NvbnNvbGUubG9nKCBpbnB1dC5uYW1lLCBnZW4ubWVtb1sgaW5wdXQubmFtZSBdIClcbiAgICAgIGlmKCBnZW4ubWVtb1sgaW5wdXQubmFtZSBdICkgeyAvLyBpZiBpdCBoYXMgYmVlbiBtZW1vaXplZC4uLlxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGdlbi5tZW1vWyBpbnB1dC5uYW1lIF1cbiAgICAgIH1lbHNlIGlmKCBBcnJheS5pc0FycmF5KCBpbnB1dCApICkge1xuICAgICAgICBnZW4uZ2V0SW5wdXQoIGlucHV0WzBdIClcbiAgICAgICAgZ2VuLmdldElucHV0KCBpbnB1dFsxXSApXG4gICAgICB9ZWxzZXsgLy8gaWYgbm90IG1lbW9pemVkIGdlbmVyYXRlIGNvZGUgIFxuICAgICAgICBpZiggdHlwZW9mIGlucHV0LmdlbiAhPT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ25vIGdlbiBmb3VuZDonLCBpbnB1dCwgaW5wdXQuZ2VuIClcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29kZSA9IGlucHV0LmdlbigpXG4gICAgICAgIC8vaWYoIGNvZGUuaW5kZXhPZiggJ09iamVjdCcgKSA+IC0xICkgY29uc29sZS5sb2coICdiYWQgaW5wdXQ6JywgaW5wdXQsIGNvZGUgKVxuICAgICAgICBcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGNvZGUgKSApIHtcbiAgICAgICAgICBpZiggIWdlbi5zaG91bGRMb2NhbGl6ZSApIHtcbiAgICAgICAgICAgIGdlbi5mdW5jdGlvbkJvZHkgKz0gY29kZVsxXVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZ2VuLmNvZGVOYW1lID0gY29kZVswXVxuICAgICAgICAgICAgZ2VuLmxvY2FsaXplZENvZGUucHVzaCggY29kZVsxXSApXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vY29uc29sZS5sb2coICdhZnRlciBHRU4nICwgdGhpcy5mdW5jdGlvbkJvZHkgKVxuICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVswXVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1lbHNleyAvLyBpdCBpbnB1dCBpcyBhIG51bWJlclxuICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBpbnB1dFxuICAgIH1cblxuICAgIHJldHVybiBwcm9jZXNzZWRJbnB1dFxuICB9LFxuXG4gIHN0YXJ0TG9jYWxpemUoKSB7XG4gICAgdGhpcy5sb2NhbGl6ZWRDb2RlID0gW11cbiAgICB0aGlzLnNob3VsZExvY2FsaXplID0gdHJ1ZVxuICB9LFxuICBlbmRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLnNob3VsZExvY2FsaXplID0gZmFsc2VcblxuICAgIHJldHVybiBbIHRoaXMuY29kZU5hbWUsIHRoaXMubG9jYWxpemVkQ29kZS5zbGljZSgwKSBdXG4gIH0sXG5cbiAgZnJlZSggZ3JhcGggKSB7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGdyYXBoICkgKSB7IC8vIHN0ZXJlbyB1Z2VuXG4gICAgICBmb3IoIGxldCBjaGFubmVsIG9mIGdyYXBoICkge1xuICAgICAgICB0aGlzLmZyZWUoIGNoYW5uZWwgKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdHlwZW9mIGdyYXBoID09PSAnb2JqZWN0JyApIHtcbiAgICAgICAgaWYoIGdyYXBoLm1lbW9yeSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIGZvciggbGV0IG1lbW9yeUtleSBpbiBncmFwaC5tZW1vcnkgKSB7XG4gICAgICAgICAgICB0aGlzLm1lbW9yeS5mcmVlKCBncmFwaC5tZW1vcnlbIG1lbW9yeUtleSBdLmlkeCApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBncmFwaC5pbnB1dHMgKSApIHtcbiAgICAgICAgICBmb3IoIGxldCB1Z2VuIG9mIGdyYXBoLmlucHV0cyApIHtcbiAgICAgICAgICAgIHRoaXMuZnJlZSggdWdlbiApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2d0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0pIHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID4gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3QuaW5wdXRzID0gWyB4LHkgXVxuICBndC5uYW1lID0gZ3QuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPj0gJHtpbnB1dHNbMV19IHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID49IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cbiAgZ3QubmFtZSA9ICdndGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCAoICR7aW5wdXRzWzBdfSA+ICR7aW5wdXRzWzFdfSApIHwgMCApIClgIFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoICggaW5wdXRzWzBdID4gaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3RwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGd0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xPTAgKSA9PiB7XG4gIGxldCB1Z2VuID0ge1xuICAgIGlucHV0czogWyBpbjEgXSxcbiAgICBtZW1vcnk6IHsgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IH0sXG4gICAgcmVjb3JkZXI6IG51bGwsXG5cbiAgICBpbiggdiApIHtcbiAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmhhcyggdiApICl7XG4gICAgICAgIGxldCBtZW1vSGlzdG9yeSA9IGdlbi5oaXN0b3JpZXMuZ2V0KCB2IClcbiAgICAgICAgdWdlbi5uYW1lID0gbWVtb0hpc3RvcnkubmFtZVxuICAgICAgICByZXR1cm4gbWVtb0hpc3RvcnlcbiAgICAgIH1cblxuICAgICAgbGV0IG9iaiA9IHtcbiAgICAgICAgZ2VuKCkge1xuICAgICAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB1Z2VuIClcblxuICAgICAgICAgIGlmKCB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IGluMVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHhcbiAgICAgICAgICBcbiAgICAgICAgICBnZW4uYWRkVG9FbmRCbG9jayggJ21lbW9yeVsgJyArIGlkeCArICcgXSA9ICcgKyBpbnB1dHNbIDAgXSApXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICBnZW4uaGlzdG9yaWVzLnNldCggdiwgb2JqIClcblxuICAgICAgICAgIHJldHVybiBpbnB1dHNbIDAgXVxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX2luJytnZW4uZ2V0VUlEKCksXG4gICAgICAgIG1lbW9yeTogdWdlbi5tZW1vcnlcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnB1dHNbIDAgXSA9IHZcbiAgICAgIFxuICAgICAgdWdlbi5yZWNvcmRlciA9IG9ialxuXG4gICAgICByZXR1cm4gb2JqXG4gICAgfSxcbiAgICBcbiAgICBvdXQ6IHtcbiAgICAgICAgICAgIFxuICAgICAgZ2VuKCkge1xuICAgICAgICBpZiggdWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmdldCggdWdlbi5pbnB1dHNbMF0gKSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4uaW5wdXRzWzBdLCB1Z2VuLnJlY29yZGVyIClcbiAgICAgICAgICB9XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gcGFyc2VGbG9hdCggaW4xIClcbiAgICAgICAgfVxuICAgICAgICBsZXQgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4XG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuICdtZW1vcnlbICcgKyBpZHggKyAnIF0gJ1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgdWlkOiBnZW4uZ2V0VUlEKCksXG4gIH1cbiAgXG4gIHVnZW4ub3V0Lm1lbW9yeSA9IHVnZW4ubWVtb3J5IFxuXG4gIHVnZW4ubmFtZSA9ICdoaXN0b3J5JyArIHVnZW4udWlkXG4gIHVnZW4ub3V0Lm5hbWUgPSB1Z2VuLm5hbWUgKyAnX291dCdcbiAgdWdlbi5pbi5fbmFtZSAgPSB1Z2VuLm5hbWUgPSAnX2luJ1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2lmZWxzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb25kaXRpb25hbHMgPSB0aGlzLmlucHV0c1swXSxcbiAgICAgICAgZGVmYXVsdFZhbHVlID0gZ2VuLmdldElucHV0KCBjb25kaXRpb25hbHNbIGNvbmRpdGlvbmFscy5sZW5ndGggLSAxXSApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7ZGVmYXVsdFZhbHVlfVxcbmAgXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnY29uZGl0aW9uYWxzOicsIHRoaXMubmFtZSwgY29uZGl0aW9uYWxzIClcblxuICAgIC8vY29uc29sZS5sb2coICdkZWZhdWx0VmFsdWU6JywgZGVmYXVsdFZhbHVlIClcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgY29uZGl0aW9uYWxzLmxlbmd0aCAtIDI7IGkrPSAyICkge1xuICAgICAgbGV0IGlzRW5kQmxvY2sgPSBpID09PSBjb25kaXRpb25hbHMubGVuZ3RoIC0gMyxcbiAgICAgICAgICBjb25kICA9IGdlbi5nZXRJbnB1dCggY29uZGl0aW9uYWxzWyBpIF0gKSxcbiAgICAgICAgICBwcmVibG9jayA9IGNvbmRpdGlvbmFsc1sgaSsxIF0sXG4gICAgICAgICAgYmxvY2ssIGJsb2NrTmFtZSwgb3V0cHV0XG5cbiAgICAgIC8vY29uc29sZS5sb2coICdwYicsIHByZWJsb2NrIClcblxuICAgICAgaWYoIHR5cGVvZiBwcmVibG9jayA9PT0gJ251bWJlcicgKXtcbiAgICAgICAgYmxvY2sgPSBwcmVibG9ja1xuICAgICAgICBibG9ja05hbWUgPSBudWxsXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoIGdlbi5tZW1vWyBwcmVibG9jay5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAvLyB1c2VkIHRvIHBsYWNlIGFsbCBjb2RlIGRlcGVuZGVuY2llcyBpbiBhcHByb3ByaWF0ZSBibG9ja3NcbiAgICAgICAgICBnZW4uc3RhcnRMb2NhbGl6ZSgpXG5cbiAgICAgICAgICBnZW4uZ2V0SW5wdXQoIHByZWJsb2NrIClcblxuICAgICAgICAgIGJsb2NrID0gZ2VuLmVuZExvY2FsaXplKClcbiAgICAgICAgICBibG9ja05hbWUgPSBibG9ja1swXVxuICAgICAgICAgIGJsb2NrID0gYmxvY2tbIDEgXS5qb2luKCcnKVxuICAgICAgICAgIGJsb2NrID0gJyAgJyArIGJsb2NrLnJlcGxhY2UoIC9cXG4vZ2ksICdcXG4gICcgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBibG9jayA9ICcnXG4gICAgICAgICAgYmxvY2tOYW1lID0gZ2VuLm1lbW9bIHByZWJsb2NrLm5hbWUgXVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG91dHB1dCA9IGJsb2NrTmFtZSA9PT0gbnVsbCA/IFxuICAgICAgICBgICAke3RoaXMubmFtZX1fb3V0ID0gJHtibG9ja31gIDpcbiAgICAgICAgYCR7YmxvY2t9ICAke3RoaXMubmFtZX1fb3V0ID0gJHtibG9ja05hbWV9YFxuICAgICAgXG4gICAgICBpZiggaT09PTAgKSBvdXQgKz0gJyAnXG4gICAgICBvdXQgKz0gXG5gIGlmKCAke2NvbmR9ID09PSAxICkge1xuJHtvdXRwdXR9XG4gIH1gXG5cbiAgICAgIGlmKCAhaXNFbmRCbG9jayApIHtcbiAgICAgICAgb3V0ICs9IGAgZWxzZWBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYFxcbmBcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9X291dGBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1fb3V0YCwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KCBhcmdzWzBdICkgPyBhcmdzWzBdIDogYXJnc1xuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBjb25kaXRpb25zIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonaW4nLFxuXG4gIGdlbigpIHtcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgICBpZiggaXNXb3JrbGV0ICkge1xuICAgICAgZ2VuLmlucHV0cy5hZGQoIHRoaXMgKVxuICAgIH1lbHNle1xuICAgICAgZ2VuLnBhcmFtZXRlcnMuYWRkKCB0aGlzLm5hbWUgKVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlzV29ya2xldCA/IHRoaXMubmFtZSArICdbaV0nIDogdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBuYW1lLCBpbnB1dE51bWJlcj0wLCBjaGFubmVsTnVtYmVyPTAsIGRlZmF1bHRWYWx1ZT0wLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCBpbnB1dCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBpbnB1dC5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIGlucHV0Lm5hbWUgPSBuYW1lICE9PSB1bmRlZmluZWQgPyBuYW1lIDogYCR7aW5wdXQuYmFzZW5hbWV9JHtpbnB1dC5pZH1gXG4gIE9iamVjdC5hc3NpZ24oIGlucHV0LCB7IGRlZmF1bHRWYWx1ZSwgbWluLCBtYXgsIGlucHV0TnVtYmVyLCBjaGFubmVsTnVtYmVyIH0pXG5cbiAgaW5wdXRbMF0gPSB7XG4gICAgZ2VuKCkge1xuICAgICAgaWYoICEgZ2VuLnBhcmFtZXRlcnMuaGFzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5hZGQoIGlucHV0Lm5hbWUgKVxuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzBdJ1xuICAgIH1cbiAgfVxuICBpbnB1dFsxXSA9IHtcbiAgICBnZW4oKSB7XG4gICAgICBpZiggISBnZW4ucGFyYW1ldGVycy5oYXMoIGlucHV0Lm5hbWUgKSApIGdlbi5wYXJhbWV0ZXJzLmFkZCggaW5wdXQubmFtZSApXG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMV0nXG4gICAgfVxuICB9XG5cblxuICByZXR1cm4gaW5wdXRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBsaWJyYXJ5ID0ge1xuICBleHBvcnQoIGRlc3RpbmF0aW9uICkge1xuICAgIGlmKCBkZXN0aW5hdGlvbiA9PT0gd2luZG93ICkge1xuICAgICAgZGVzdGluYXRpb24uc3NkID0gbGlicmFyeS5oaXN0b3J5ICAgIC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICAgICAgZGVzdGluYXRpb24uaW5wdXQgPSBsaWJyYXJ5LmluICAgICAgIC8vIGluIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG4gICAgICBkZXN0aW5hdGlvbi50ZXJuYXJ5ID0gbGlicmFyeS5zd2l0Y2ggLy8gc3dpdGNoIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5Lmhpc3RvcnlcbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LmluXG4gICAgICBkZWxldGUgbGlicmFyeS5zd2l0Y2hcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKCBkZXN0aW5hdGlvbiwgbGlicmFyeSApXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGxpYnJhcnksICdzYW1wbGVyYXRlJywge1xuICAgICAgZ2V0KCkgeyByZXR1cm4gbGlicmFyeS5nZW4uc2FtcGxlcmF0ZSB9LFxuICAgICAgc2V0KHYpIHt9XG4gICAgfSlcblxuICAgIGxpYnJhcnkuaW4gPSBkZXN0aW5hdGlvbi5pbnB1dFxuICAgIGxpYnJhcnkuaGlzdG9yeSA9IGRlc3RpbmF0aW9uLnNzZFxuICAgIGxpYnJhcnkuc3dpdGNoID0gZGVzdGluYXRpb24udGVybmFyeVxuXG4gICAgZGVzdGluYXRpb24uY2xpcCA9IGxpYnJhcnkuY2xhbXBcbiAgfSxcblxuICBnZW46ICAgICAgcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICBcbiAgYWJzOiAgICAgIHJlcXVpcmUoICcuL2Ficy5qcycgKSxcbiAgcm91bmQ6ICAgIHJlcXVpcmUoICcuL3JvdW5kLmpzJyApLFxuICBwYXJhbTogICAgcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gIGFkZDogICAgICByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gIHN1YjogICAgICByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gIG11bDogICAgICByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gIGRpdjogICAgICByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gIGFjY3VtOiAgICByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgY291bnRlcjogIHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gIHNpbjogICAgICByZXF1aXJlKCAnLi9zaW4uanMnICksXG4gIGNvczogICAgICByZXF1aXJlKCAnLi9jb3MuanMnICksXG4gIHRhbjogICAgICByZXF1aXJlKCAnLi90YW4uanMnICksXG4gIHRhbmg6ICAgICByZXF1aXJlKCAnLi90YW5oLmpzJyApLFxuICBhc2luOiAgICAgcmVxdWlyZSggJy4vYXNpbi5qcycgKSxcbiAgYWNvczogICAgIHJlcXVpcmUoICcuL2Fjb3MuanMnICksXG4gIGF0YW46ICAgICByZXF1aXJlKCAnLi9hdGFuLmpzJyApLCAgXG4gIHBoYXNvcjogICByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gIGRhdGE6ICAgICByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICBwZWVrOiAgICAgcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgY3ljbGU6ICAgIHJlcXVpcmUoICcuL2N5Y2xlLmpzJyApLFxuICBoaXN0b3J5OiAgcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgZGVsdGE6ICAgIHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICBmbG9vcjogICAgcmVxdWlyZSggJy4vZmxvb3IuanMnICksXG4gIGNlaWw6ICAgICByZXF1aXJlKCAnLi9jZWlsLmpzJyApLFxuICBtaW46ICAgICAgcmVxdWlyZSggJy4vbWluLmpzJyApLFxuICBtYXg6ICAgICAgcmVxdWlyZSggJy4vbWF4LmpzJyApLFxuICBzaWduOiAgICAgcmVxdWlyZSggJy4vc2lnbi5qcycgKSxcbiAgZGNibG9jazogIHJlcXVpcmUoICcuL2RjYmxvY2suanMnICksXG4gIG1lbW86ICAgICByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICByYXRlOiAgICAgcmVxdWlyZSggJy4vcmF0ZS5qcycgKSxcbiAgd3JhcDogICAgIHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gIG1peDogICAgICByZXF1aXJlKCAnLi9taXguanMnICksXG4gIGNsYW1wOiAgICByZXF1aXJlKCAnLi9jbGFtcC5qcycgKSxcbiAgcG9rZTogICAgIHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gIGRlbGF5OiAgICByZXF1aXJlKCAnLi9kZWxheS5qcycgKSxcbiAgZm9sZDogICAgIHJlcXVpcmUoICcuL2ZvbGQuanMnICksXG4gIG1vZCA6ICAgICByZXF1aXJlKCAnLi9tb2QuanMnICksXG4gIHNhaCA6ICAgICByZXF1aXJlKCAnLi9zYWguanMnICksXG4gIG5vaXNlOiAgICByZXF1aXJlKCAnLi9ub2lzZS5qcycgKSxcbiAgbm90OiAgICAgIHJlcXVpcmUoICcuL25vdC5qcycgKSxcbiAgZ3Q6ICAgICAgIHJlcXVpcmUoICcuL2d0LmpzJyApLFxuICBndGU6ICAgICAgcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICBsdDogICAgICAgcmVxdWlyZSggJy4vbHQuanMnICksIFxuICBsdGU6ICAgICAgcmVxdWlyZSggJy4vbHRlLmpzJyApLCBcbiAgYm9vbDogICAgIHJlcXVpcmUoICcuL2Jvb2wuanMnICksXG4gIGdhdGU6ICAgICByZXF1aXJlKCAnLi9nYXRlLmpzJyApLFxuICB0cmFpbjogICAgcmVxdWlyZSggJy4vdHJhaW4uanMnICksXG4gIHNsaWRlOiAgICByZXF1aXJlKCAnLi9zbGlkZS5qcycgKSxcbiAgaW46ICAgICAgIHJlcXVpcmUoICcuL2luLmpzJyApLFxuICB0NjA6ICAgICAgcmVxdWlyZSggJy4vdDYwLmpzJyksXG4gIG10b2Y6ICAgICByZXF1aXJlKCAnLi9tdG9mLmpzJyksXG4gIGx0cDogICAgICByZXF1aXJlKCAnLi9sdHAuanMnKSwgICAgICAgIC8vIFRPRE86IHRlc3RcbiAgZ3RwOiAgICAgIHJlcXVpcmUoICcuL2d0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBzd2l0Y2g6ICAgcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApLFxuICBtc3Rvc2FtcHM6cmVxdWlyZSggJy4vbXN0b3NhbXBzLmpzJyApLCAvLyBUT0RPOiBuZWVkcyB0ZXN0LFxuICBzZWxlY3RvcjogcmVxdWlyZSggJy4vc2VsZWN0b3IuanMnICksXG4gIHV0aWxpdGllczpyZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gIHBvdzogICAgICByZXF1aXJlKCAnLi9wb3cuanMnICksXG4gIGF0dGFjazogICByZXF1aXJlKCAnLi9hdHRhY2suanMnICksXG4gIGRlY2F5OiAgICByZXF1aXJlKCAnLi9kZWNheS5qcycgKSxcbiAgd2luZG93czogIHJlcXVpcmUoICcuL3dpbmRvd3MuanMnICksXG4gIGVudjogICAgICByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gIGFkOiAgICAgICByZXF1aXJlKCAnLi9hZC5qcycgICksXG4gIGFkc3I6ICAgICByZXF1aXJlKCAnLi9hZHNyLmpzJyApLFxuICBpZmVsc2U6ICAgcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gIGJhbmc6ICAgICByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICBhbmQ6ICAgICAgcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICBwYW46ICAgICAgcmVxdWlyZSggJy4vcGFuLmpzJyApLFxuICBlcTogICAgICAgcmVxdWlyZSggJy4vZXEuanMnICksXG4gIG5lcTogICAgICByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gIGV4cDogICAgICByZXF1aXJlKCAnLi9leHAuanMnICksXG4gIHNlcTogICAgICByZXF1aXJlKCAnLi9zZXEuanMnIClcbn1cblxubGlicmFyeS5nZW4ubGliID0gbGlicmFyeVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYnJhcnlcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbHQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19KSB8IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gbHQuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPD0gJHtpbnB1dHNbMV19IHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gJ2x0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoKCAke2lucHV0c1swXX0gPCAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCggaW5wdXRzWzBdIDwgaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHRwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGx0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21heCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLm1heCcgOiBNYXRoLm1heCB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9bWF4KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWF4KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBtYXggPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbWF4LmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbWF4XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbWVtbycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoaW4xLG1lbW9OYW1lKSA9PiB7XG4gIGxldCBtZW1vID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgbWVtby5pbnB1dHMgPSBbIGluMSBdXG4gIG1lbW8uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBtZW1vLm5hbWUgPSBtZW1vTmFtZSAhPT0gdW5kZWZpbmVkID8gbWVtb05hbWUgKyAnXycgKyBnZW4uZ2V0VUlEKCkgOiBgJHttZW1vLmJhc2VuYW1lfSR7bWVtby5pZH1gXG5cbiAgcmV0dXJuIG1lbW9cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBpc1dvcmtsZXQgPyAnTWF0aC5taW4nIDogTWF0aC5taW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfW1pbiggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1pbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICksIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbWluID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1pbi5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIG1pblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW89IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiwgdD0uNSApID0+IHtcbiAgbGV0IHVnZW4gPSBtZW1vKCBhZGQoIG11bChpbjEsIHN1YigxLHQgKSApLCBtdWwoIGluMiwgdCApICkgKVxuICB1Z2VuLm5hbWUgPSAnbWl4JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgbW9kID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgbW9kQXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAlIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gJSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgJSAnIFxuICAgICAgfSlcblxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbW9kXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J21zdG9zYW1wcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWUgfSA9ICR7Z2VuLnNhbXBsZXJhdGV9IC8gMTAwMCAqICR7aW5wdXRzWzBdfSBcXG5cXG5gXG4gICAgIFxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gb3V0XG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGdlbi5zYW1wbGVyYXRlIC8gMTAwMCAqIHRoaXMuaW5wdXRzWzBdXG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0XG4gICAgfSAgICBcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBtc3Rvc2FtcHMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbXN0b3NhbXBzLmlucHV0cyA9IFsgeCBdXG4gIG1zdG9zYW1wcy5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbXN0b3NhbXBzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbXRvZicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgKCAke3RoaXMudHVuaW5nfSAqIGdlbi5leHAoIC4wNTc3NjIyNjUgKiAoJHtpbnB1dHNbMF19IC0gNjkpICkgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSB0aGlzLnR1bmluZyAqIE1hdGguZXhwKCAuMDU3NzYyMjY1ICogKCBpbnB1dHNbMF0gLSA2OSkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHByb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgdHVuaW5nOjQ0MCB9XG4gIFxuICBpZiggcHJvcHMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIHByb3BzLmRlZmF1bHRzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBkZWZhdWx0cyApXG4gIHVnZW4uaW5wdXRzID0gWyB4IF1cbiAgXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTogJ211bCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgLFxuICAgICAgICBzdW0gPSAxLCBudW1Db3VudCA9IDAsIG11bEF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICBvdXQgKz0gdlxuICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgbXVsQXRFbmQgPSB0cnVlXG4gICAgICAgICAgb3V0ICs9ICcgKiAnXG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBpID09PSAwICkge1xuICAgICAgICAgIHN1bSA9IHZcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3VtICo9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICB9XG4gICAgICAgIG51bUNvdW50KytcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYoIG51bUNvdW50ID4gMCApIHtcbiAgICAgIG91dCArPSBtdWxBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKiAnICsgc3VtXG4gICAgfVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgY29uc3QgbXVsID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggbXVsLCB7XG4gICAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogYXJncyxcbiAgfSlcbiAgXG4gIG11bC5uYW1lID0gbXVsLmJhc2VuYW1lICsgbXVsLmlkXG5cbiAgcmV0dXJuIG11bFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbmVxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSAvKnRoaXMuaW5wdXRzWzBdICE9PSB0aGlzLmlucHV0c1sxXSA/IDEgOiovIGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ICE9PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vaXNlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dFxuXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnbm9pc2UnIDogaXNXb3JrbGV0ID8gJ01hdGgucmFuZG9tJyA6IE1hdGgucmFuZG9tIH0pXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gJHtyZWZ9bm9pc2UoKVxcbmBcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm9pc2UgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIG5vaXNlLm5hbWUgPSBwcm90by5uYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG5vaXNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbm90JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gPT09IDAgPyAxIDogMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSAhaW5wdXRzWzBdID09PSAwID8gMSA6IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbm90LmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIG5vdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwYW4nLCBcbiAgaW5pdFRhYmxlKCkgeyAgICBcbiAgICBsZXQgYnVmZmVyTCA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKSxcbiAgICAgICAgYnVmZmVyUiA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgY29uc3QgYW5nVG9SYWQgPSBNYXRoLlBJIC8gMTgwXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxMDI0OyBpKysgKSB7IFxuICAgICAgbGV0IHBhbiA9IGkgKiAoIDkwIC8gMTAyNCApXG4gICAgICBidWZmZXJMW2ldID0gTWF0aC5jb3MoIHBhbiAqIGFuZ1RvUmFkICkgXG4gICAgICBidWZmZXJSW2ldID0gTWF0aC5zaW4oIHBhbiAqIGFuZ1RvUmFkIClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5wYW5MID0gZGF0YSggYnVmZmVyTCwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9KVxuICAgIGdlbi5nbG9iYWxzLnBhblIgPSBkYXRhKCBidWZmZXJSLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0pXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggbGVmdElucHV0LCByaWdodElucHV0LCBwYW4gPS41LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBpZiggZ2VuLmdsb2JhbHMucGFuTCA9PT0gdW5kZWZpbmVkICkgcHJvdG8uaW5pdFRhYmxlKClcblxuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgbGVmdElucHV0LCByaWdodElucHV0IF0sXG4gICAgbGVmdDogICAgbXVsKCBsZWZ0SW5wdXQsIHBlZWsoIGdlbi5nbG9iYWxzLnBhbkwsIHBhbiwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSApLFxuICAgIHJpZ2h0OiAgIG11bCggcmlnaHRJbnB1dCwgcGVlayggZ2VuLmdsb2JhbHMucGFuUiwgcGFuLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pIClcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncGFyYW0nLFxuXG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGdlbi5wYXJhbXMuYWRkKCB0aGlzIClcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcblxuICAgIGlmKCBpc1dvcmtsZXQgKSBnZW4ucGFyYW1ldGVycy5hZGQoIHRoaXMubmFtZSApXG5cbiAgICB0aGlzLnZhbHVlID0gdGhpcy5pbml0aWFsVmFsdWVcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlzV29ya2xldCA/IHRoaXMubmFtZSA6IGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWBcblxuICAgIHJldHVybiBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHByb3BOYW1lPTAsIHZhbHVlPTAsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBpZiggdHlwZW9mIHByb3BOYW1lICE9PSAnc3RyaW5nJyApIHtcbiAgICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSBwcm9wTmFtZVxuICB9ZWxzZXtcbiAgICB1Z2VuLm5hbWUgPSBwcm9wTmFtZVxuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gdmFsdWVcbiAgfVxuXG4gIHVnZW4ubWluID0gbWluXG4gIHVnZW4ubWF4ID0gbWF4XG4gIHVnZW4uZGVmYXVsdFZhbHVlID0gdWdlbi5pbml0aWFsVmFsdWVcblxuICAvLyBmb3Igc3RvcmluZyB3b3JrbGV0IG5vZGVzIG9uY2UgdGhleSdyZSBpbnN0YW50aWF0ZWRcbiAgdWdlbi53YWFwaSA9IG51bGxcblxuICB1Z2VuLmlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgaWYoIHRoaXMuaXNXb3JrbGV0ICYmIHRoaXMud2FhcGkgIT09IG51bGwgKSB7XG4gICAgICAgICAgdGhpcy53YWFwaS52YWx1ZSA9IHZcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHZcbiAgICAgICAgfSBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgICBkYXRhVWdlbiA9IHJlcXVpcmUoJy4vZGF0YS5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BlZWsnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQsIGZ1bmN0aW9uQm9keSwgbmV4dCwgbGVuZ3RoSXNMb2cyLCBpZHhcbiAgICBcbiAgICBpZHggPSBpbnB1dHNbMV1cbiAgICBsZW5ndGhJc0xvZzIgPSAoTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApIHwgMCkgID09PSBNYXRoLmxvZzIoIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIClcblxuICAgIGlmKCB0aGlzLm1vZGUgIT09ICdzaW1wbGUnICkge1xuXG4gICAgZnVuY3Rpb25Cb2R5ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9kYXRhSWR4ICA9ICR7aWR4fSwgXG4gICAgICAke3RoaXMubmFtZX1fcGhhc2UgPSAke3RoaXMubW9kZSA9PT0gJ3NhbXBsZXMnID8gaW5wdXRzWzBdIDogaW5wdXRzWzBdICsgJyAqICcgKyAodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGgpIH0sIFxuICAgICAgJHt0aGlzLm5hbWV9X2luZGV4ID0gJHt0aGlzLm5hbWV9X3BoYXNlIHwgMCxcXG5gXG5cbiAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICd3cmFwJyApIHtcbiAgICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgP1xuICAgICAgYCggJHt0aGlzLm5hbWV9X2luZGV4ICsgMSApICYgKCR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IC0gMSlgIDpcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9ID8gJHt0aGlzLm5hbWV9X2luZGV4ICsgMSAtICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZSBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdjbGFtcCcgKSB7XG4gICAgICBuZXh0ID0gXG4gICAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA/ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfSBlbHNlIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2ZvbGQnIHx8IHRoaXMuYm91bmRtb2RlID09PSAnbWlycm9yJyApIHtcbiAgICAgIG5leHQgPSBcbiAgICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9ID8gJHt0aGlzLm5hbWV9X2luZGV4IC0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZXtcbiAgICAgICBuZXh0ID0gXG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMWAgICAgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLmludGVycCA9PT0gJ2xpbmVhcicgKSB7ICAgICAgXG4gICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fZnJhYyAgPSAke3RoaXMubmFtZX1fcGhhc2UgLSAke3RoaXMubmFtZX1faW5kZXgsXG4gICAgICAke3RoaXMubmFtZX1fYmFzZSAgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgICR7dGhpcy5uYW1lfV9pbmRleCBdLFxuICAgICAgJHt0aGlzLm5hbWV9X25leHQgID0gJHtuZXh0fSxgXG4gICAgICBcbiAgICAgIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2lnbm9yZScgKSB7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1faW5kZXggPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IHx8ICR7dGhpcy5uYW1lfV9pbmRleCA8IDAgPyAwIDogJHt0aGlzLm5hbWV9X2Jhc2UgKyAke3RoaXMubmFtZX1fZnJhYyAqICggbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9uZXh0IF0gLSAke3RoaXMubmFtZX1fYmFzZSApXFxuXFxuYFxuICAgICAgfWVsc2V7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X25leHQgXSAtICR7dGhpcy5uYW1lfV9iYXNlIClcXG5cXG5gXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9vdXQgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X2luZGV4IF1cXG5cXG5gXG4gICAgfVxuXG4gICAgfSBlbHNlIHsgLy8gbW9kZSBpcyBzaW1wbGVcbiAgICAgIGZ1bmN0aW9uQm9keSA9IGBtZW1vcnlbICR7aWR4fSArICR7IGlucHV0c1swXSB9IF1gXG4gICAgICBcbiAgICAgIHJldHVybiBmdW5jdGlvbkJvZHlcbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSsnX291dCcsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgZGVmYXVsdHMgOiB7IGNoYW5uZWxzOjEsIG1vZGU6J3BoYXNlJywgaW50ZXJwOidsaW5lYXInLCBib3VuZG1vZGU6J3dyYXAnIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGlucHV0X2RhdGEsIGluZGV4PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIC8vY29uc29sZS5sb2coIGRhdGFVZ2VuLCBnZW4uZGF0YSApXG5cbiAgLy8gWFhYIHdoeSBpcyBkYXRhVWdlbiBub3QgdGhlIGFjdHVhbCBmdW5jdGlvbj8gc29tZSB0eXBlIG9mIGJyb3dzZXJpZnkgbm9uc2Vuc2UuLi5cbiAgY29uc3QgZmluYWxEYXRhID0gdHlwZW9mIGlucHV0X2RhdGEuYmFzZW5hbWUgPT09ICd1bmRlZmluZWQnID8gZ2VuLmxpYi5kYXRhKCBpbnB1dF9kYXRhICkgOiBpbnB1dF9kYXRhXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgXG4gICAgeyBcbiAgICAgICdkYXRhJzogICAgIGZpbmFsRGF0YSxcbiAgICAgIGRhdGFOYW1lOiAgIGZpbmFsRGF0YS5uYW1lLFxuICAgICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgICAgaW5wdXRzOiAgICAgWyBpbmRleCwgZmluYWxEYXRhIF0sXG4gICAgfSxcbiAgICBwcm90by5kZWZhdWx0cyxcbiAgICBwcm9wZXJ0aWVzIFxuICApXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIG11bCAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHByb3RvID0geyBiYXNlbmFtZToncGhhc29yJyB9LFxuICAgIGRpdiAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApXG5cbmNvbnN0IGRlZmF1bHRzID0geyBtaW46IC0xLCBtYXg6IDEgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5ID0gMSwgcmVzZXQgPSAwLCBfcHJvcHMgKSA9PiB7XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBfcHJvcHMgKVxuXG4gIGNvbnN0IHJhbmdlID0gcHJvcHMubWF4IC0gcHJvcHMubWluXG5cbiAgY29uc3QgdWdlbiA9IHR5cGVvZiBmcmVxdWVuY3kgPT09ICdudW1iZXInIFxuICAgID8gYWNjdW0oIChmcmVxdWVuY3kgKiByYW5nZSkgLyBnZW4uc2FtcGxlcmF0ZSwgcmVzZXQsIHByb3BzICkgXG4gICAgOiBhY2N1bSggXG4gICAgICAgIGRpdiggXG4gICAgICAgICAgbXVsKCBmcmVxdWVuY3ksIHJhbmdlICksXG4gICAgICAgICAgZ2VuLnNhbXBsZXJhdGVcbiAgICAgICAgKSwgXG4gICAgICAgIHJlc2V0LCBwcm9wcyBcbiAgICApXG5cbiAgdWdlbi5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBtdWwgID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG9rZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBkYXRhTmFtZSA9ICdtZW1vcnknLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGlkeCwgb3V0LCB3cmFwcGVkXG4gICAgXG4gICAgaWR4ID0gdGhpcy5kYXRhLmdlbigpXG5cbiAgICAvL2dlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgLy93cmFwcGVkID0gd3JhcCggdGhpcy5pbnB1dHNbMV0sIDAsIHRoaXMuZGF0YUxlbmd0aCApLmdlbigpXG4gICAgLy9pZHggPSB3cmFwcGVkWzBdXG4gICAgLy9nZW4uZnVuY3Rpb25Cb2R5ICs9IHdyYXBwZWRbMV1cbiAgICBsZXQgb3V0cHV0U3RyID0gdGhpcy5pbnB1dHNbMV0gPT09IDAgP1xuICAgICAgYCAgJHtkYXRhTmFtZX1bICR7aWR4fSBdID0gJHtpbnB1dHNbMF19XFxuYCA6XG4gICAgICBgICAke2RhdGFOYW1lfVsgJHtpZHh9ICsgJHtpbnB1dHNbMV19IF0gPSAke2lucHV0c1swXX1cXG5gXG5cbiAgICBpZiggdGhpcy5pbmxpbmUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5mdW5jdGlvbkJvZHkgKz0gb3V0cHV0U3RyXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gWyB0aGlzLmlubGluZSwgb3V0cHV0U3RyIF1cbiAgICB9XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gKCBkYXRhLCB2YWx1ZSwgaW5kZXgsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjaGFubmVsczoxIH0gXG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGRhdGEsXG4gICAgZGF0YU5hbWU6ICAgZGF0YS5uYW1lLFxuICAgIGRhdGFMZW5ndGg6IGRhdGEuYnVmZmVyLmxlbmd0aCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyB2YWx1ZSwgaW5kZXggXSxcbiAgfSxcbiAgZGVmYXVsdHMgKVxuXG5cbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkXG4gIFxuICBnZW4uaGlzdG9yaWVzLnNldCggdWdlbi5uYW1lLCB1Z2VuIClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwb3cnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Bvdyc6IGlzV29ya2xldCA/ICdNYXRoLnBvdycgOiBNYXRoLnBvdyB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9cG93KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdHlwZW9mIGlucHV0c1swXSA9PT0gJ3N0cmluZycgJiYgaW5wdXRzWzBdWzBdID09PSAnKCcgKSB7XG4gICAgICAgIGlucHV0c1swXSA9IGlucHV0c1swXS5zbGljZSgxLC0xKVxuICAgICAgfVxuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMV0gPT09ICdzdHJpbmcnICYmIGlucHV0c1sxXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMV0gPSBpbnB1dHNbMV0uc2xpY2UoMSwtMSlcbiAgICAgIH1cblxuICAgICAgb3V0ID0gTWF0aC5wb3coIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0pIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgcG93ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHBvdy5pbnB1dHMgPSBbIHgseSBdXG4gIHBvdy5pZCA9IGdlbi5nZXRVSUQoKVxuICBwb3cubmFtZSA9IGAke3Bvdy5iYXNlbmFtZX17cG93LmlkfWBcblxuICByZXR1cm4gcG93XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gICAgZGVsdGEgICA9IHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICAgIHdyYXAgICAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3JhdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBwaGFzZSAgPSBoaXN0b3J5KCksXG4gICAgICAgIGluTWludXMxID0gaGlzdG9yeSgpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmaWx0ZXIsIHN1bSwgb3V0XG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X2RpZmYgPSAke2lucHV0c1swXX0gLSAke2dlbk5hbWV9Lmxhc3RTYW1wbGVcbiAgaWYoICR7dGhpcy5uYW1lfV9kaWZmIDwgLS41ICkgJHt0aGlzLm5hbWV9X2RpZmYgKz0gMVxuICAke2dlbk5hbWV9LnBoYXNlICs9ICR7dGhpcy5uYW1lfV9kaWZmICogJHtpbnB1dHNbMV19XG4gIGlmKCAke2dlbk5hbWV9LnBoYXNlID4gMSApICR7Z2VuTmFtZX0ucGhhc2UgLT0gMVxuICAke2dlbk5hbWV9Lmxhc3RTYW1wbGUgPSAke2lucHV0c1swXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcblxuICAgIHJldHVybiBbIGdlbk5hbWUgKyAnLnBoYXNlJywgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCByYXRlICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHBoYXNlOiAgICAgIDAsXG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIHJhdGUgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidyb3VuZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGgucm91bmQnIDogTWF0aC5yb3VuZCB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9cm91bmQoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgucm91bmQoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCByb3VuZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICByb3VuZC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiByb3VuZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NhaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSAwXG4gICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lICsgJ19jb250cm9sJyBdID0gMFxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuXG4gICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX1fY29udHJvbCA9IG1lbW9yeVske3RoaXMubWVtb3J5LmNvbnRyb2wuaWR4fV0sXG4gICAgICAke3RoaXMubmFtZX1fdHJpZ2dlciA9ICR7aW5wdXRzWzFdfSA+ICR7aW5wdXRzWzJdfSA/IDEgOiAwXG5cbiAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyICE9PSAke3RoaXMubmFtZX1fY29udHJvbCAgKSB7XG4gICAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyID09PSAxICkgXG4gICAgICBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XSA9ICR7aW5wdXRzWzBdfVxuICAgIFxuICAgIG1lbW9yeVske3RoaXMubWVtb3J5LmNvbnRyb2wuaWR4fV0gPSAke3RoaXMubmFtZX1fdHJpZ2dlclxuICB9XG5gXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYC8vYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAsICcgJyArb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBjb250cm9sLCB0aHJlc2hvbGQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXQ6MCB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCBjb250cm9sLHRocmVzaG9sZCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgY29udHJvbDogeyBpZHg6bnVsbCwgbGVuZ3RoOjEgfSxcbiAgICAgIHZhbHVlOiAgIHsgaWR4Om51bGwsIGxlbmd0aDoxIH0sXG4gICAgfVxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzZWxlY3RvcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dCwgcmV0dXJuVmFsdWUgPSAwXG4gICAgXG4gICAgc3dpdGNoKCBpbnB1dHMubGVuZ3RoICkge1xuICAgICAgY2FzZSAyIDpcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBpbnB1dHNbMV1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDMgOlxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcblxcbmA7XG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsIG91dCBdXG4gICAgICAgIGJyZWFrOyAgXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAwXG4gIHN3aXRjaCggJHtpbnB1dHNbMF19ICsgMSApIHtcXG5gXG5cbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICBvdXQgKz1gICAgIGNhc2UgJHtpfTogJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzW2ldfTsgYnJlYWs7XFxuYCBcbiAgICAgICAgfVxuXG4gICAgICAgIG91dCArPSAnICB9XFxuXFxuJ1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSArICdfb3V0JywgJyAnICsgb3V0IF1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uaW5wdXRzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgY291bnRlcj0gcmVxdWlyZSggJy4vY291bnRlci5qcycgKSxcbiAgICBwZWVrICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgc3NkICAgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIGRhdGEgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwcm90byA9IHsgYmFzZW5hbWU6J3NlcScgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZHVyYXRpb25zID0gMTEwMjUsIHZhbHVlcyA9IFswLDFdLCBwaGFzZUluY3JlbWVudCA9IDEpID0+IHtcbiAgbGV0IGNsb2NrXG4gIFxuICBpZiggQXJyYXkuaXNBcnJheSggZHVyYXRpb25zICkgKSB7XG4gICAgLy8gd2Ugd2FudCBhIGNvdW50ZXIgdGhhdCBpcyB1c2luZyBvdXIgY3VycmVudFxuICAgIC8vIHJhdGUgdmFsdWUsIGJ1dCB3ZSB3YW50IHRoZSByYXRlIHZhbHVlIHRvIGJlIGRlcml2ZWQgZnJvbVxuICAgIC8vIHRoZSBjb3VudGVyLiBtdXN0IGluc2VydCBhIHNpbmdsZS1zYW1wbGUgZGVhbHkgdG8gYXZvaWRcbiAgICAvLyBpbmZpbml0ZSBsb29wLlxuICAgIGNvbnN0IGNsb2NrMiA9IGNvdW50ZXIoIDAsIDAsIGR1cmF0aW9ucy5sZW5ndGggKVxuICAgIGNvbnN0IF9fZHVyYXRpb25zID0gcGVlayggZGF0YSggZHVyYXRpb25zICksIGNsb2NrMiwgeyBtb2RlOidzaW1wbGUnIH0pIFxuICAgIGNsb2NrID0gY291bnRlciggcGhhc2VJbmNyZW1lbnQsIDAsIF9fZHVyYXRpb25zIClcbiAgICBcbiAgICAvLyBhZGQgb25lIHNhbXBsZSBkZWxheSB0byBhdm9pZCBjb2RlZ2VuIGxvb3BcbiAgICBjb25zdCBzID0gc3NkKClcbiAgICBzLmluKCBjbG9jay53cmFwIClcbiAgICBjbG9jazIuaW5wdXRzWzBdID0gcy5vdXRcbiAgfWVsc2V7XG4gICAgLy8gaWYgdGhlIHJhdGUgYXJndW1lbnQgaXMgYSBzaW5nbGUgdmFsdWUgd2UgZG9uJ3QgbmVlZCB0b1xuICAgIC8vIGRvIGFueXRoaW5nIHRyaWNreS5cbiAgICBjbG9jayA9IGNvdW50ZXIoIHBoYXNlSW5jcmVtZW50LCAwLCBkdXJhdGlvbnMgKVxuICB9XG4gIFxuICBjb25zdCBzdGVwcGVyID0gYWNjdW0oIGNsb2NrLndyYXAsIDAsIHsgbWluOjAsIG1heDp2YWx1ZXMubGVuZ3RoIH0pXG4gICBcbiAgY29uc3QgdWdlbiA9IHBlZWsoIGRhdGEoIHZhbHVlcyApLCBzdGVwcGVyLCB7IG1vZGU6J3NpbXBsZScgfSlcblxuICB1Z2VuLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonc2lnbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGguc2lnbicgOiBNYXRoLnNpZ24gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXNpZ24oICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2lnbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpZ24gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2lnbi5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBzaWduXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBpc1dvcmtsZXQgPyAnTWF0aC5zaW4nIDogTWF0aC5zaW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpbi5pbnB1dHMgPSBbIHggXVxuICBzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgc2luLm5hbWUgPSBgJHtzaW4uYmFzZW5hbWV9e3Npbi5pZH1gXG5cbiAgcmV0dXJuIHNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGd0ICAgICAgPSByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgICBkaXYgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIF9zd2l0Y2ggPSByZXF1aXJlKCAnLi9zd2l0Y2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgc2xpZGVVcCA9IDEsIHNsaWRlRG93biA9IDEgKSA9PiB7XG4gIGxldCB5MSA9IGhpc3RvcnkoMCksXG4gICAgICBmaWx0ZXIsIHNsaWRlQW1vdW50XG5cbiAgLy95IChuKSA9IHkgKG4tMSkgKyAoKHggKG4pIC0geSAobi0xKSkvc2xpZGUpIFxuICBzbGlkZUFtb3VudCA9IF9zd2l0Y2goIGd0KGluMSx5MS5vdXQpLCBzbGlkZVVwLCBzbGlkZURvd24gKVxuXG4gIGZpbHRlciA9IG1lbW8oIGFkZCggeTEub3V0LCBkaXYoIHN1YiggaW4xLCB5MS5vdXQgKSwgc2xpZGVBbW91bnQgKSApIClcblxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N1YicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9MCxcbiAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBzdWJBdEVuZCA9IGZhbHNlLFxuICAgICAgICBoYXNVZ2VucyA9IGZhbHNlLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IDBcblxuICAgIHRoaXMuaW5wdXRzLmZvckVhY2goIHZhbHVlID0+IHsgaWYoIGlzTmFOKCB2YWx1ZSApICkgaGFzVWdlbnMgPSB0cnVlIH0pXG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC0gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICByZXR1cm5cbiAgICAgIH1lbHNle1xuICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC0gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGxldCBzdWIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggc3ViLCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzXG4gIH0pXG4gICAgICAgXG4gIHN1Yi5uYW1lID0gJ3N1YicgKyBzdWIuaWRcblxuICByZXR1cm4gc3ViXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzd2l0Y2gnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIGlmKCBpbnB1dHNbMV0gPT09IGlucHV0c1syXSApIHJldHVybiBpbnB1dHNbMV0gLy8gaWYgYm90aCBwb3RlbnRpYWwgb3V0cHV0cyBhcmUgdGhlIHNhbWUganVzdCByZXR1cm4gb25lIG9mIHRoZW1cbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEgPSAxLCBpbjIgPSAwICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbnRyb2wsIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Q2MCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgJ2V4cCcgXTogaXNXb3JrbGV0ID8gJ01hdGguZXhwJyA6IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAke3JlZn1leHAoIC02LjkwNzc1NTI3ODkyMSAvICR7aW5wdXRzWzBdfSApXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gaW5wdXRzWzBdIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9ICAgIFxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHQ2MCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0NjAuaW5wdXRzID0gWyB4IF1cbiAgdDYwLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB0NjBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IGlzV29ya2xldCA/ICdNYXRoLnRhbicgOiBNYXRoLnRhbiB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9dGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdGFuLmlucHV0cyA9IFsgeCBdXG4gIHRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW4ubmFtZSA9IGAke3Rhbi5iYXNlbmFtZX17dGFuLmlkfWBcblxuICByZXR1cm4gdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbmgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAndGFuaCc6IGlzV29ya2xldCA/ICdNYXRoLnRhbicgOiBNYXRoLnRhbmggfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXRhbmgoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbmgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW5oID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbmguaW5wdXRzID0gWyB4IF1cbiAgdGFuaC5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW5oLm5hbWUgPSBgJHt0YW5oLmJhc2VuYW1lfXt0YW5oLmlkfWBcblxuICByZXR1cm4gdGFuaFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGx0ICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBwaGFzb3IgID0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9NDQwLCBwdWxzZXdpZHRoPS41ICkgPT4ge1xuICBsZXQgZ3JhcGggPSBsdCggYWNjdW0oIGRpdiggZnJlcXVlbmN5LCA0NDEwMCApICksIC41IClcblxuICBncmFwaC5uYW1lID0gYHRyYWluJHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiBncmFwaFxufVxuXG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgQVdQRiA9IHJlcXVpcmUoICcuL2V4dGVybmFsL2F1ZGlvd29ya2xldC1wb2x5ZmlsbC5qcycgKSxcbiAgICAgIGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKVxuXG5sZXQgaXNTdGVyZW8gPSBmYWxzZVxuXG5jb25zdCB1dGlsaXRpZXMgPSB7XG4gIGN0eDogbnVsbCxcblxuICBjbGVhcigpIHtcbiAgICBpZiggdGhpcy53b3JrbGV0Tm9kZSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgdGhpcy53b3JrbGV0Tm9kZS5kaXNjb25uZWN0KClcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuY2FsbGJhY2sgPSAoKSA9PiAwXG4gICAgfVxuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmZvckVhY2goIHYgPT4gdigpIClcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5sZW5ndGggPSAwXG4gIH0sXG5cbiAgY3JlYXRlQ29udGV4dCggYnVmZmVyU2l6ZSA9IDEwMjQgKSB7XG4gICAgY29uc3QgQUMgPSB0eXBlb2YgQXVkaW9Db250ZXh0ID09PSAndW5kZWZpbmVkJyA/IHdlYmtpdEF1ZGlvQ29udGV4dCA6IEF1ZGlvQ29udGV4dFxuICAgIFxuICAgIEFXUEYoIHdpbmRvdywgYnVmZmVyU2l6ZSApXG5cbiAgICBjb25zdCBzdGFydCA9ICgpID0+IHtcbiAgICAgIGlmKCB0eXBlb2YgQUMgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICB0aGlzLmN0eCA9IG5ldyBBQygpXG5cbiAgICAgICAgZ2VuLnNhbXBsZXJhdGUgPSB0aGlzLmN0eC5zYW1wbGVSYXRlXG5cbiAgICAgICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd0b3VjaHN0YXJ0Jywgc3RhcnQgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIHN0YXJ0IClcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCBzdGFydCApXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbXlTb3VyY2UgPSB1dGlsaXRpZXMuY3R4LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICAgIG15U291cmNlLmNvbm5lY3QoIHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24gKVxuICAgICAgICBteVNvdXJjZS5zdGFydCgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG4gICAgfWVsc2V7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZG93bicsIHN0YXJ0IClcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIHN0YXJ0IClcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIGNyZWF0ZVNjcmlwdFByb2Nlc3NvcigpIHtcbiAgICB0aGlzLm5vZGUgPSB0aGlzLmN0eC5jcmVhdGVTY3JpcHRQcm9jZXNzb3IoIDEwMjQsIDAsIDIgKVxuICAgIHRoaXMuY2xlYXJGdW5jdGlvbiA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMCB9XG4gICAgaWYoIHR5cGVvZiB0aGlzLmNhbGxiYWNrID09PSAndW5kZWZpbmVkJyApIHRoaXMuY2FsbGJhY2sgPSB0aGlzLmNsZWFyRnVuY3Rpb25cblxuICAgIHRoaXMubm9kZS5vbmF1ZGlvcHJvY2VzcyA9IGZ1bmN0aW9uKCBhdWRpb1Byb2Nlc3NpbmdFdmVudCApIHtcbiAgICAgIHZhciBvdXRwdXRCdWZmZXIgPSBhdWRpb1Byb2Nlc3NpbmdFdmVudC5vdXRwdXRCdWZmZXI7XG5cbiAgICAgIHZhciBsZWZ0ID0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAwICksXG4gICAgICAgICAgcmlnaHQ9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMSApLFxuICAgICAgICAgIGlzU3RlcmVvID0gdXRpbGl0aWVzLmlzU3RlcmVvXG5cbiAgICAgZm9yKCB2YXIgc2FtcGxlID0gMDsgc2FtcGxlIDwgbGVmdC5sZW5ndGg7IHNhbXBsZSsrICkge1xuICAgICAgICB2YXIgb3V0ID0gdXRpbGl0aWVzLmNhbGxiYWNrKClcblxuICAgICAgICBpZiggaXNTdGVyZW8gPT09IGZhbHNlICkge1xuICAgICAgICAgIGxlZnRbIHNhbXBsZSBdID0gcmlnaHRbIHNhbXBsZSBdID0gb3V0IFxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgIF0gPSBvdXRbMF1cbiAgICAgICAgICByaWdodFsgc2FtcGxlIF0gPSBvdXRbMV1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubm9kZS5jb25uZWN0KCB0aGlzLmN0eC5kZXN0aW5hdGlvbiApXG5cbiAgICByZXR1cm4gdGhpc1xuICB9LFxuXG4gIC8vIHJlbW92ZSBzdGFydGluZyBzdHVmZiBhbmQgYWRkIHRhYnNcbiAgcHJldHR5UHJpbnRDYWxsYmFjayggY2IgKSB7XG4gICAgLy8gZ2V0IHJpZCBvZiBcImZ1bmN0aW9uIGdlblwiIGFuZCBzdGFydCB3aXRoIHBhcmVudGhlc2lzXG4gICAgLy8gY29uc3Qgc2hvcnRlbmRDQiA9IGNiLnRvU3RyaW5nKCkuc2xpY2UoOSlcbiAgICBjb25zdCBjYlNwbGl0ID0gY2IudG9TdHJpbmcoKS5zcGxpdCgnXFxuJylcbiAgICBjb25zdCBjYlRyaW0gPSBjYlNwbGl0LnNsaWNlKCAzLCAtMiApXG4gICAgY29uc3QgY2JUYWJiZWQgPSBjYlRyaW0ubWFwKCB2ID0+ICcgICAgICAnICsgdiApIFxuICAgIFxuICAgIHJldHVybiBjYlRhYmJlZC5qb2luKCdcXG4nKVxuICB9LFxuXG4gIGNyZWF0ZVBhcmFtZXRlckRlc2NyaXB0b3JzKCBjYiApIHtcbiAgICAvLyBbe25hbWU6ICdhbXBsaXR1ZGUnLCBkZWZhdWx0VmFsdWU6IDAuMjUsIG1pblZhbHVlOiAwLCBtYXhWYWx1ZTogMX1dO1xuICAgIGxldCBwYXJhbVN0ciA9ICcnXG5cbiAgICAvL2ZvciggbGV0IHVnZW4gb2YgY2IucGFyYW1zLnZhbHVlcygpICkge1xuICAgIC8vICBwYXJhbVN0ciArPSBgeyBuYW1lOicke3VnZW4ubmFtZX0nLCBkZWZhdWx0VmFsdWU6JHt1Z2VuLnZhbHVlfSwgbWluVmFsdWU6JHt1Z2VuLm1pbn0sIG1heFZhbHVlOiR7dWdlbi5tYXh9IH0sXFxuICAgICAgYFxuICAgIC8vfVxuICAgIGZvciggbGV0IHVnZW4gb2YgY2IucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgcGFyYW1TdHIgKz0gYHsgbmFtZTonJHt1Z2VuLm5hbWV9JywgYXV0b21hdGlvblJhdGU6J2stcmF0ZScsIGRlZmF1bHRWYWx1ZToke3VnZW4uZGVmYXVsdFZhbHVlfSwgbWluVmFsdWU6JHt1Z2VuLm1pbn0sIG1heFZhbHVlOiR7dWdlbi5tYXh9IH0sXFxuICAgICAgYFxuICAgIH1cbiAgICByZXR1cm4gcGFyYW1TdHJcbiAgfSxcblxuICBjcmVhdGVQYXJhbWV0ZXJEZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBzdHIgPSBjYi5wYXJhbXMuc2l6ZSA+IDAgPyAnXFxuICAgICAgJyA6ICcnXG4gICAgZm9yKCBsZXQgdWdlbiBvZiBjYi5wYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICBzdHIgKz0gYGNvbnN0ICR7dWdlbi5uYW1lfSA9IHBhcmFtZXRlcnMuJHt1Z2VuLm5hbWV9WzBdXFxuICAgICAgYFxuICAgIH1cblxuICAgIHJldHVybiBzdHJcbiAgfSxcblxuICBjcmVhdGVQYXJhbWV0ZXJBcmd1bWVudHMoIGNiICkge1xuICAgIGxldCAgcGFyYW1MaXN0ID0gJydcbiAgICBmb3IoIGxldCB1Z2VuIG9mIGNiLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgIHBhcmFtTGlzdCArPSB1Z2VuLm5hbWUgKyAnW2ldLCdcbiAgICB9XG4gICAgcGFyYW1MaXN0ID0gcGFyYW1MaXN0LnNsaWNlKCAwLCAtMSApXG5cbiAgICByZXR1cm4gcGFyYW1MaXN0XG4gIH0sXG5cbiAgY3JlYXRlSW5wdXREZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBzdHIgPSBjYi5pbnB1dHMuc2l6ZSA+IDAgPyAnXFxuJyA6ICcnXG4gICAgZm9yKCBsZXQgaW5wdXQgb2YgIGNiLmlucHV0cy52YWx1ZXMoKSApIHtcbiAgICAgIHN0ciArPSBgY29uc3QgJHtpbnB1dC5uYW1lfSA9IGlucHV0c1sgJHtpbnB1dC5pbnB1dE51bWJlcn0gXVsgJHtpbnB1dC5jaGFubmVsTnVtYmVyfSBdXFxuICAgICAgYFxuICAgIH1cblxuICAgIHJldHVybiBzdHJcbiAgfSxcblxuXG4gIGNyZWF0ZUlucHV0QXJndW1lbnRzKCBjYiApIHtcbiAgICBsZXQgIHBhcmFtTGlzdCA9ICcnXG4gICAgZm9yKCBsZXQgaW5wdXQgb2YgY2IuaW5wdXRzLnZhbHVlcygpICkge1xuICAgICAgcGFyYW1MaXN0ICs9IGlucHV0Lm5hbWUgKyAnW2ldLCdcbiAgICB9XG4gICAgcGFyYW1MaXN0ID0gcGFyYW1MaXN0LnNsaWNlKCAwLCAtMSApXG5cbiAgICByZXR1cm4gcGFyYW1MaXN0XG4gIH0sXG4gICAgICBcbiAgY3JlYXRlRnVuY3Rpb25EZXJlZmVyZW5jZXMoIGNiICkge1xuICAgIGxldCBtZW1iZXJTdHJpbmcgPSBjYi5tZW1iZXJzLnNpemUgPiAwID8gJ1xcbicgOiAnJ1xuICAgIGxldCBtZW1vID0ge31cbiAgICBmb3IoIGxldCBkaWN0IG9mIGNiLm1lbWJlcnMudmFsdWVzKCkgKSB7XG4gICAgICBjb25zdCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICAgIHZhbHVlID0gZGljdFsgbmFtZSBdXG5cbiAgICAgIGlmKCBtZW1vWyBuYW1lIF0gIT09IHVuZGVmaW5lZCApIGNvbnRpbnVlXG4gICAgICBtZW1vWyBuYW1lIF0gPSB0cnVlXG5cbiAgICAgIG1lbWJlclN0cmluZyArPSBgICAgICAgY29uc3QgJHtuYW1lfSA9ICR7dmFsdWV9XFxuYFxuICAgIH1cblxuICAgIHJldHVybiBtZW1iZXJTdHJpbmdcbiAgfSxcblxuICBjcmVhdGVXb3JrbGV0UHJvY2Vzc29yKCBncmFwaCwgbmFtZSwgZGVidWcsIG1lbT00NDEwMCoxMCApIHtcbiAgICAvL2NvbnN0IG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIDQwOTYsIEZsb2F0NjRBcnJheSApXG4gICAgY29uc3QgY2IgPSBnZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBtZW0sIGRlYnVnIClcbiAgICBjb25zdCBpbnB1dHMgPSBjYi5pbnB1dHNcblxuICAgIC8vIGdldCBhbGwgaW5wdXRzIGFuZCBjcmVhdGUgYXBwcm9wcmlhdGUgYXVkaW9wYXJhbSBpbml0aWFsaXplcnNcbiAgICBjb25zdCBwYXJhbWV0ZXJEZXNjcmlwdG9ycyA9IHRoaXMuY3JlYXRlUGFyYW1ldGVyRGVzY3JpcHRvcnMoIGNiIClcbiAgICBjb25zdCBwYXJhbWV0ZXJEZXJlZmVyZW5jZXMgPSB0aGlzLmNyZWF0ZVBhcmFtZXRlckRlcmVmZXJlbmNlcyggY2IgKVxuICAgIGNvbnN0IHBhcmFtTGlzdCA9IHRoaXMuY3JlYXRlUGFyYW1ldGVyQXJndW1lbnRzKCBjYiApXG4gICAgY29uc3QgaW5wdXREZXJlZmVyZW5jZXMgPSB0aGlzLmNyZWF0ZUlucHV0RGVyZWZlcmVuY2VzKCBjYiApXG4gICAgY29uc3QgaW5wdXRMaXN0ID0gdGhpcy5jcmVhdGVJbnB1dEFyZ3VtZW50cyggY2IgKSAgIFxuICAgIGNvbnN0IG1lbWJlclN0cmluZyA9IHRoaXMuY3JlYXRlRnVuY3Rpb25EZXJlZmVyZW5jZXMoIGNiIClcblxuICAgIC8vIGNoYW5nZSBvdXRwdXQgYmFzZWQgb24gbnVtYmVyIG9mIGNoYW5uZWxzLlxuICAgIGNvbnN0IGdlbmlzaE91dHB1dExpbmUgPSBjYi5pc1N0ZXJlbyA9PT0gZmFsc2VcbiAgICAgID8gYGxlZnRbIGkgXSA9IG1lbW9yeVswXWBcbiAgICAgIDogYGxlZnRbIGkgXSA9IG1lbW9yeVswXTtcXG5cXHRcXHRyaWdodFsgaSBdID0gbWVtb3J5WzFdXFxuYFxuXG4gICAgY29uc3QgcHJldHR5Q2FsbGJhY2sgPSB0aGlzLnByZXR0eVByaW50Q2FsbGJhY2soIGNiIClcblxuICAgIC8qKioqKiBiZWdpbiBjYWxsYmFjayBjb2RlICoqKiovXG4gICAgLy8gbm90ZSB0aGF0IHdlIGhhdmUgdG8gY2hlY2sgdG8gc2VlIHRoYXQgbWVtb3J5IGhhcyBiZWVuIHBhc3NlZFxuICAgIC8vIHRvIHRoZSB3b3JrZXIgYmVmb3JlIHJ1bm5pbmcgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLCBvdGhlcndpc2VcbiAgICAvLyBpdCBjYW4gYmUgcGFzc2VkIHRvbyBzbG93bHkgYW5kIGZhaWwgb24gb2NjYXNzaW9uXG5cbiAgICBjb25zdCB3b3JrbGV0Q29kZSA9IGBcbmNsYXNzICR7bmFtZX1Qcm9jZXNzb3IgZXh0ZW5kcyBBdWRpb1dvcmtsZXRQcm9jZXNzb3Ige1xuXG4gIHN0YXRpYyBnZXQgcGFyYW1ldGVyRGVzY3JpcHRvcnMoKSB7XG4gICAgY29uc3QgcGFyYW1zID0gW1xuICAgICAgJHsgcGFyYW1ldGVyRGVzY3JpcHRvcnMgfSAgICAgIFxuICAgIF1cbiAgICByZXR1cm4gcGFyYW1zXG4gIH1cbiBcbiAgY29uc3RydWN0b3IoIG9wdGlvbnMgKSB7XG4gICAgc3VwZXIoIG9wdGlvbnMgKVxuICAgIHRoaXMucG9ydC5vbm1lc3NhZ2UgPSB0aGlzLmhhbmRsZU1lc3NhZ2UuYmluZCggdGhpcyApXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IGZhbHNlXG4gIH1cblxuICBoYW5kbGVNZXNzYWdlKCBldmVudCApIHtcbiAgICBpZiggZXZlbnQuZGF0YS5rZXkgPT09ICdpbml0JyApIHtcbiAgICAgIHRoaXMubWVtb3J5ID0gZXZlbnQuZGF0YS5tZW1vcnlcbiAgICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgfWVsc2UgaWYoIGV2ZW50LmRhdGEua2V5ID09PSAnc2V0JyApIHtcbiAgICAgIHRoaXMubWVtb3J5WyBldmVudC5kYXRhLmlkeCBdID0gZXZlbnQuZGF0YS52YWx1ZVxuICAgIH1lbHNlIGlmKCBldmVudC5kYXRhLmtleSA9PT0gJ2dldCcgKSB7XG4gICAgICB0aGlzLnBvcnQucG9zdE1lc3NhZ2UoeyBrZXk6J3JldHVybicsIGlkeDpldmVudC5kYXRhLmlkeCwgdmFsdWU6dGhpcy5tZW1vcnlbZXZlbnQuZGF0YS5pZHhdIH0pICAgICBcbiAgICB9XG4gIH1cblxuICBwcm9jZXNzKCBpbnB1dHMsIG91dHB1dHMsIHBhcmFtZXRlcnMgKSB7XG4gICAgaWYoIHRoaXMuaW5pdGlhbGl6ZWQgPT09IHRydWUgKSB7XG4gICAgICBjb25zdCBvdXRwdXQgPSBvdXRwdXRzWzBdXG4gICAgICBjb25zdCBsZWZ0ICAgPSBvdXRwdXRbIDAgXVxuICAgICAgY29uc3QgcmlnaHQgID0gb3V0cHV0WyAxIF1cbiAgICAgIGNvbnN0IGxlbiAgICA9IGxlZnQubGVuZ3RoXG4gICAgICBjb25zdCBtZW1vcnkgPSB0aGlzLm1lbW9yeSAke3BhcmFtZXRlckRlcmVmZXJlbmNlc30ke2lucHV0RGVyZWZlcmVuY2VzfSR7bWVtYmVyU3RyaW5nfVxuXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IGxlbjsgKytpICkge1xuICAgICAgICAke3ByZXR0eUNhbGxiYWNrfVxuICAgICAgICAke2dlbmlzaE91dHB1dExpbmV9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cbiAgICBcbnJlZ2lzdGVyUHJvY2Vzc29yKCAnJHtuYW1lfScsICR7bmFtZX1Qcm9jZXNzb3IpYFxuXG4gICAgXG4gICAgLyoqKioqIGVuZCBjYWxsYmFjayBjb2RlICoqKioqL1xuXG5cbiAgICBpZiggZGVidWcgPT09IHRydWUgKSBjb25zb2xlLmxvZyggd29ya2xldENvZGUgKVxuXG4gICAgY29uc3QgdXJsID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoXG4gICAgICBuZXcgQmxvYihcbiAgICAgICAgWyB3b3JrbGV0Q29kZSBdLCBcbiAgICAgICAgeyB0eXBlOiAndGV4dC9qYXZhc2NyaXB0JyB9XG4gICAgICApXG4gICAgKVxuXG4gICAgcmV0dXJuIFsgdXJsLCB3b3JrbGV0Q29kZSwgaW5wdXRzLCBjYi5wYXJhbXMsIGNiLmlzU3RlcmVvIF0gXG4gIH0sXG5cbiAgcmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50OiBbXSxcbiAgcmVnaXN0ZXIoIHVnZW4gKSB7XG4gICAgaWYoIHRoaXMucmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50LmluZGV4T2YoIHVnZW4gKSA9PT0gLTEgKSB7XG4gICAgICB0aGlzLnJlZ2lzdGVyZWRGb3JOb2RlQXNzaWdubWVudC5wdXNoKCB1Z2VuIClcbiAgICB9XG4gIH0sXG5cbiAgcGxheVdvcmtsZXQoIGdyYXBoLCBuYW1lLCBkZWJ1Zz1mYWxzZSwgbWVtPTQ0MTAwICogMTAgKSB7XG4gICAgdXRpbGl0aWVzLmNsZWFyKClcblxuICAgIGNvbnN0IFsgdXJsLCBjb2RlU3RyaW5nLCBpbnB1dHMsIHBhcmFtcywgaXNTdGVyZW8gXSA9IHV0aWxpdGllcy5jcmVhdGVXb3JrbGV0UHJvY2Vzc29yKCBncmFwaCwgbmFtZSwgZGVidWcsIG1lbSApXG5cbiAgICBjb25zdCBub2RlUHJvbWlzZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSxyZWplY3QpID0+IHtcbiAgIFxuICAgICAgdXRpbGl0aWVzLmN0eC5hdWRpb1dvcmtsZXQuYWRkTW9kdWxlKCB1cmwgKS50aGVuKCAoKT0+IHtcbiAgICAgICAgY29uc3Qgd29ya2xldE5vZGUgPSBuZXcgQXVkaW9Xb3JrbGV0Tm9kZSggdXRpbGl0aWVzLmN0eCwgbmFtZSwgeyBvdXRwdXRDaGFubmVsQ291bnQ6WyBpc1N0ZXJlbyA/IDIgOiAxIF0gfSlcblxuICAgICAgICB3b3JrbGV0Tm9kZS5jYWxsYmFja3MgPSB7fVxuICAgICAgICB3b3JrbGV0Tm9kZS5vbm1lc3NhZ2UgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gICAgICAgICAgaWYoIGV2ZW50LmRhdGEubWVzc2FnZSA9PT0gJ3JldHVybicgKSB7XG4gICAgICAgICAgICB3b3JrbGV0Tm9kZS5jYWxsYmFja3NbIGV2ZW50LmRhdGEuaWR4IF0oIGV2ZW50LmRhdGEudmFsdWUgKVxuICAgICAgICAgICAgZGVsZXRlIHdvcmtsZXROb2RlLmNhbGxiYWNrc1sgZXZlbnQuZGF0YS5pZHggXVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHdvcmtsZXROb2RlLmdldE1lbW9yeVZhbHVlID0gZnVuY3Rpb24oIGlkeCwgY2IgKSB7XG4gICAgICAgICAgdGhpcy53b3JrbGV0Q2FsbGJhY2tzWyBpZHggXSA9IGNiXG4gICAgICAgICAgdGhpcy53b3JrbGV0Tm9kZS5wb3J0LnBvc3RNZXNzYWdlKHsga2V5OidnZXQnLCBpZHg6IGlkeCB9KVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB3b3JrbGV0Tm9kZS5wb3J0LnBvc3RNZXNzYWdlKHsga2V5Oidpbml0JywgbWVtb3J5Omdlbi5tZW1vcnkuaGVhcCB9KVxuICAgICAgICB1dGlsaXRpZXMud29ya2xldE5vZGUgPSB3b3JrbGV0Tm9kZVxuXG4gICAgICAgIHV0aWxpdGllcy5yZWdpc3RlcmVkRm9yTm9kZUFzc2lnbm1lbnQuZm9yRWFjaCggdWdlbiA9PiB1Z2VuLm5vZGUgPSB3b3JrbGV0Tm9kZSApXG4gICAgICAgIHV0aWxpdGllcy5yZWdpc3RlcmVkRm9yTm9kZUFzc2lnbm1lbnQubGVuZ3RoID0gMFxuXG4gICAgICAgIC8vIGFzc2lnbiBhbGwgcGFyYW1zIGFzIHByb3BlcnRpZXMgb2Ygbm9kZSBmb3IgZWFzaWVyIHJlZmVyZW5jZSBcbiAgICAgICAgZm9yKCBsZXQgZGljdCBvZiBpbnB1dHMudmFsdWVzKCkgKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF1cbiAgICAgICAgICBjb25zdCBwYXJhbSA9IHdvcmtsZXROb2RlLnBhcmFtZXRlcnMuZ2V0KCBuYW1lIClcbiAgICAgIFxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggd29ya2xldE5vZGUsIG5hbWUsIHtcbiAgICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgICAgcGFyYW0udmFsdWUgPSB2XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGFyYW0udmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yKCBsZXQgdWdlbiBvZiBwYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IHVnZW4ubmFtZVxuICAgICAgICAgIGNvbnN0IHBhcmFtID0gd29ya2xldE5vZGUucGFyYW1ldGVycy5nZXQoIG5hbWUgKVxuICAgICAgICAgIHVnZW4ud2FhcGkgPSBwYXJhbSBcbiAgICAgICAgICAvLyBpbml0aWFsaXplP1xuICAgICAgICAgIHBhcmFtLnZhbHVlID0gdWdlbi5kZWZhdWx0VmFsdWVcblxuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggd29ya2xldE5vZGUsIG5hbWUsIHtcbiAgICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgICAgcGFyYW0udmFsdWUgPSB2XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gcGFyYW0udmFsdWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgaWYoIHV0aWxpdGllcy5jb25zb2xlICkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUoIGNvZGVTdHJpbmcgKVxuXG4gICAgICAgIHdvcmtsZXROb2RlLmNvbm5lY3QoIHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24gKVxuXG4gICAgICAgIHJlc29sdmUoIHdvcmtsZXROb2RlIClcbiAgICAgIH0pXG5cbiAgICB9KVxuXG4gICAgcmV0dXJuIG5vZGVQcm9taXNlXG4gIH0sXG4gIFxuICBwbGF5R3JhcGgoIGdyYXBoLCBkZWJ1ZywgbWVtPTQ0MTAwKjEwLCBtZW1UeXBlPUZsb2F0MzJBcnJheSApIHtcbiAgICB1dGlsaXRpZXMuY2xlYXIoKVxuICAgIGlmKCBkZWJ1ZyA9PT0gdW5kZWZpbmVkICkgZGVidWcgPSBmYWxzZVxuICAgICAgICAgIFxuICAgIHRoaXMuaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCBncmFwaCApXG5cbiAgICB1dGlsaXRpZXMuY2FsbGJhY2sgPSBnZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBtZW0sIGRlYnVnLCBmYWxzZSwgbWVtVHlwZSApXG4gICAgXG4gICAgaWYoIHV0aWxpdGllcy5jb25zb2xlICkgdXRpbGl0aWVzLmNvbnNvbGUuc2V0VmFsdWUoIHV0aWxpdGllcy5jYWxsYmFjay50b1N0cmluZygpIClcblxuICAgIHJldHVybiB1dGlsaXRpZXMuY2FsbGJhY2tcbiAgfSxcblxuICBsb2FkU2FtcGxlKCBzb3VuZEZpbGVQYXRoLCBkYXRhICkge1xuICAgIGxldCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuICAgIHJlcS5vcGVuKCAnR0VUJywgc291bmRGaWxlUGF0aCwgdHJ1ZSApXG4gICAgcmVxLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcicgXG4gICAgXG4gICAgbGV0IHByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUscmVqZWN0KSA9PiB7XG4gICAgICByZXEub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhdWRpb0RhdGEgPSByZXEucmVzcG9uc2VcblxuICAgICAgICB1dGlsaXRpZXMuY3R4LmRlY29kZUF1ZGlvRGF0YSggYXVkaW9EYXRhLCAoYnVmZmVyKSA9PiB7XG4gICAgICAgICAgZGF0YS5idWZmZXIgPSBidWZmZXIuZ2V0Q2hhbm5lbERhdGEoMClcbiAgICAgICAgICByZXNvbHZlKCBkYXRhLmJ1ZmZlciApXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJlcS5zZW5kKClcblxuICAgIHJldHVybiBwcm9taXNlXG4gIH1cblxufVxuXG51dGlsaXRpZXMuY2xlYXIuY2FsbGJhY2tzID0gW11cblxubW9kdWxlLmV4cG9ydHMgPSB1dGlsaXRpZXNcbiIsIid1c2Ugc3RyaWN0J1xuXG4vKlxuICogbWFueSB3aW5kb3dzIGhlcmUgYWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9jb3JiYW5icm9vay9kc3AuanMvYmxvYi9tYXN0ZXIvZHNwLmpzXG4gKiBzdGFydGluZyBhdCBsaW5lIDE0MjdcbiAqIHRha2VuIDgvMTUvMTZcbiovIFxuXG5jb25zdCB3aW5kb3dzID0gbW9kdWxlLmV4cG9ydHMgPSB7IFxuICBiYXJ0bGV0dCggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMiAvIChsZW5ndGggLSAxKSAqICgobGVuZ3RoIC0gMSkgLyAyIC0gTWF0aC5hYnMoaW5kZXggLSAobGVuZ3RoIC0gMSkgLyAyKSkgXG4gIH0sXG5cbiAgYmFydGxldHRIYW5uKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjYyIC0gMC40OCAqIE1hdGguYWJzKGluZGV4IC8gKGxlbmd0aCAtIDEpIC0gMC41KSAtIDAuMzggKiBNYXRoLmNvcyggMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBibGFja21hbiggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgbGV0IGEwID0gKDEgLSBhbHBoYSkgLyAyLFxuICAgICAgICBhMSA9IDAuNSxcbiAgICAgICAgYTIgPSBhbHBoYSAvIDJcblxuICAgIHJldHVybiBhMCAtIGExICogTWF0aC5jb3MoMiAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKyBhMiAqIE1hdGguY29zKDQgKiBNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgY29zaW5lKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiBNYXRoLmNvcyhNYXRoLlBJICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSBNYXRoLlBJIC8gMilcbiAgfSxcblxuICBnYXVzcyggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KE1hdGguRSwgLTAuNSAqIE1hdGgucG93KChpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpIC8gKGFscGhhICogKGxlbmd0aCAtIDEpIC8gMiksIDIpKVxuICB9LFxuXG4gIGhhbW1pbmcoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNTQgLSAwLjQ2ICogTWF0aC5jb3MoIE1hdGguUEkgKiAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkpXG4gIH0sXG5cbiAgaGFubiggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC41ICogKDEgLSBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSkgKVxuICB9LFxuXG4gIGxhbmN6b3MoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgbGV0IHggPSAyICogaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAxO1xuICAgIHJldHVybiBNYXRoLnNpbihNYXRoLlBJICogeCkgLyAoTWF0aC5QSSAqIHgpXG4gIH0sXG5cbiAgcmVjdGFuZ3VsYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDFcbiAgfSxcblxuICB0cmlhbmd1bGFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAyIC8gbGVuZ3RoICogKGxlbmd0aCAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKVxuICB9LFxuXG4gIC8vIHBhcmFib2xhXG4gIHdlbGNoKCBsZW5ndGgsIF9pbmRleCwgaWdub3JlLCBzaGlmdD0wICkge1xuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIGNvbnN0IGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vciggc2hpZnQgKiBsZW5ndGggKSkgJSBsZW5ndGhcbiAgICBjb25zdCBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyIFxuXG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdyggKCBpbmRleCAtIG5fMV9vdmVyMiApIC8gbl8xX292ZXIyLCAyIClcbiAgfSxcbiAgaW52ZXJzZXdlbGNoKCBsZW5ndGgsIF9pbmRleCwgaWdub3JlLCBzaGlmdD0wICkge1xuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIGxldCBpbmRleCA9IHNoaWZ0ID09PSAwID8gX2luZGV4IDogKF9pbmRleCArIE1hdGguZmxvb3IoIHNoaWZ0ICogbGVuZ3RoICkpICUgbGVuZ3RoXG4gICAgY29uc3Qgbl8xX292ZXIyID0gKGxlbmd0aCAtIDEpIC8gMlxuXG4gICAgcmV0dXJuIE1hdGgucG93KCAoIGluZGV4IC0gbl8xX292ZXIyICkgLyBuXzFfb3ZlcjIsIDIgKVxuICB9LFxuXG4gIHBhcmFib2xhKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIGlmKCBpbmRleCA8PSBsZW5ndGggLyAyICkge1xuICAgICAgcmV0dXJuIHdpbmRvd3MuaW52ZXJzZXdlbGNoKCBsZW5ndGggLyAyLCBpbmRleCApIC0gMVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIDEgLSB3aW5kb3dzLmludmVyc2V3ZWxjaCggbGVuZ3RoIC8gMiwgaW5kZXggLSBsZW5ndGggLyAyIClcbiAgICB9XG4gIH0sXG5cbiAgZXhwb25lbnRpYWwoIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIHJldHVybiBNYXRoLnBvdyggaW5kZXggLyBsZW5ndGgsIGFscGhhIClcbiAgfSxcblxuICBsaW5lYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIGluZGV4IC8gbGVuZ3RoXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZmxvb3I9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTond3JhcCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHNpZ25hbCA9IGlucHV0c1swXSwgbWluID0gaW5wdXRzWzFdLCBtYXggPSBpbnB1dHNbMl0sXG4gICAgICAgIG91dCwgZGlmZlxuXG4gICAgLy9vdXQgPSBgKCgoJHtpbnB1dHNbMF19IC0gJHt0aGlzLm1pbn0pICUgJHtkaWZmfSAgKyAke2RpZmZ9KSAlICR7ZGlmZn0gKyAke3RoaXMubWlufSlgXG4gICAgLy9jb25zdCBsb25nIG51bVdyYXBzID0gbG9uZygodi1sbykvcmFuZ2UpIC0gKHYgPCBsbyk7XG4gICAgLy9yZXR1cm4gdiAtIHJhbmdlICogZG91YmxlKG51bVdyYXBzKTsgICBcbiAgICBcbiAgICBpZiggdGhpcy5taW4gPT09IDAgKSB7XG4gICAgICBkaWZmID0gbWF4XG4gICAgfWVsc2UgaWYgKCBpc05hTiggbWF4ICkgfHwgaXNOYU4oIG1pbiApICkge1xuICAgICAgZGlmZiA9IGAke21heH0gLSAke21pbn1gXG4gICAgfWVsc2V7XG4gICAgICBkaWZmID0gbWF4IC0gbWluXG4gICAgfVxuXG4gICAgb3V0ID1cbmAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxuICBpZiggJHt0aGlzLm5hbWV9IDwgJHt0aGlzLm1pbn0gKSAke3RoaXMubmFtZX0gKz0gJHtkaWZmfVxuICBlbHNlIGlmKCAke3RoaXMubmFtZX0gPiAke3RoaXMubWF4fSApICR7dGhpcy5uYW1lfSAtPSAke2RpZmZ9XG5cbmBcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgJyAnICsgb3V0IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBNZW1vcnlIZWxwZXIgPSB7XG4gIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlKCkge1xuICAgIHZhciBzaXplID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8gNDA5NiA6IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgbWVtdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IEZsb2F0MzJBcnJheSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIHZhciBoZWxwZXIgPSBPYmplY3QuY3JlYXRlKHRoaXMpO1xuXG4gICAgT2JqZWN0LmFzc2lnbihoZWxwZXIsIHtcbiAgICAgIGhlYXA6IG5ldyBtZW10eXBlKHNpemUpLFxuICAgICAgbGlzdDoge30sXG4gICAgICBmcmVlTGlzdDoge31cbiAgICB9KTtcblxuICAgIHJldHVybiBoZWxwZXI7XG4gIH0sXG4gIGFsbG9jOiBmdW5jdGlvbiBhbGxvYyhhbW91bnQpIHtcbiAgICB2YXIgaWR4ID0gLTE7XG5cbiAgICBpZiAoYW1vdW50ID4gdGhpcy5oZWFwLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ0FsbG9jYXRpb24gcmVxdWVzdCBpcyBsYXJnZXIgdGhhbiBoZWFwIHNpemUgb2YgJyArIHRoaXMuaGVhcC5sZW5ndGgpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmZyZWVMaXN0KSB7XG4gICAgICB2YXIgY2FuZGlkYXRlU2l6ZSA9IHRoaXMuZnJlZUxpc3Rba2V5XTtcblxuICAgICAgaWYgKGNhbmRpZGF0ZVNpemUgPj0gYW1vdW50KSB7XG4gICAgICAgIGlkeCA9IGtleTtcblxuICAgICAgICB0aGlzLmxpc3RbaWR4XSA9IGFtb3VudDtcblxuICAgICAgICBpZiAoY2FuZGlkYXRlU2l6ZSAhPT0gYW1vdW50KSB7XG4gICAgICAgICAgdmFyIG5ld0luZGV4ID0gaWR4ICsgYW1vdW50LFxuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZSA9IHZvaWQgMDtcblxuICAgICAgICAgIGZvciAodmFyIF9rZXkgaW4gdGhpcy5saXN0KSB7XG4gICAgICAgICAgICBpZiAoX2tleSA+IG5ld0luZGV4KSB7XG4gICAgICAgICAgICAgIG5ld0ZyZWVTaXplID0gX2tleSAtIG5ld0luZGV4O1xuICAgICAgICAgICAgICB0aGlzLmZyZWVMaXN0W25ld0luZGV4XSA9IG5ld0ZyZWVTaXplO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIGlmKCBpZHggIT09IC0xICkgZGVsZXRlIHRoaXMuZnJlZUxpc3RbIGlkeCBdXG5cbiAgICBpZiAoaWR4ID09PSAtMSkge1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0aGlzLmxpc3QpLFxuICAgICAgICAgIGxhc3RJbmRleCA9IHZvaWQgMDtcblxuICAgICAgaWYgKGtleXMubGVuZ3RoKSB7XG4gICAgICAgIC8vIGlmIG5vdCBmaXJzdCBhbGxvY2F0aW9uLi4uXG4gICAgICAgIGxhc3RJbmRleCA9IHBhcnNlSW50KGtleXNba2V5cy5sZW5ndGggLSAxXSk7XG5cbiAgICAgICAgaWR4ID0gbGFzdEluZGV4ICsgdGhpcy5saXN0W2xhc3RJbmRleF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZHggPSAwO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmxpc3RbaWR4XSA9IGFtb3VudDtcbiAgICB9XG5cbiAgICBpZiAoaWR4ICsgYW1vdW50ID49IHRoaXMuaGVhcC5sZW5ndGgpIHtcbiAgICAgIHRocm93IEVycm9yKCdObyBhdmFpbGFibGUgYmxvY2tzIHJlbWFpbiBzdWZmaWNpZW50IGZvciBhbGxvY2F0aW9uIHJlcXVlc3QuJyk7XG4gICAgfVxuICAgIHJldHVybiBpZHg7XG4gIH0sXG4gIGZyZWU6IGZ1bmN0aW9uIGZyZWUoaW5kZXgpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMubGlzdFtpbmRleF0gIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBFcnJvcignQ2FsbGluZyBmcmVlKCkgb24gbm9uLWV4aXN0aW5nIGJsb2NrLicpO1xuICAgIH1cblxuICAgIHRoaXMubGlzdFtpbmRleF0gPSAwO1xuXG4gICAgdmFyIHNpemUgPSAwO1xuICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmxpc3QpIHtcbiAgICAgIGlmIChrZXkgPiBpbmRleCkge1xuICAgICAgICBzaXplID0ga2V5IC0gaW5kZXg7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuZnJlZUxpc3RbaW5kZXhdID0gc2l6ZTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZW1vcnlIZWxwZXI7XG4iXX0=
