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

},{"./gen.js":30}],2:[function(require,module,exports){
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

},{"./gen.js":30}],3:[function(require,module,exports){
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

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":30,"./gte.js":32,"./ifelseif.js":35,"./lt.js":38,"./memo.js":42,"./mul.js":48,"./neq.js":49,"./peek.js":54,"./poke.js":56,"./sub.js":66,"./utilities.js":72}],5:[function(require,module,exports){
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

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":30,"./gtp.js":33,"./ifelseif.js":35,"./lt.js":38,"./mul.js":48,"./neq.js":49,"./not.js":51,"./param.js":53,"./peek.js":54,"./poke.js":56,"./sub.js":66}],7:[function(require,module,exports){
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

},{"./gen.js":30}],9:[function(require,module,exports){
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

},{"./gen.js":30}],10:[function(require,module,exports){
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

},{"./gen.js":30,"./history.js":34,"./mul.js":48,"./sub.js":66}],11:[function(require,module,exports){
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

},{"./floor.js":27,"./gen.js":30,"./memo.js":42,"./sub.js":66}],15:[function(require,module,exports){
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

},{"./gen.js":30}],16:[function(require,module,exports){
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
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var reset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
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

},{"./gen.js":30,"./peek.js":54,"./poke.js":56,"./utilities.js":72}],19:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":30,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":66}],20:[function(require,module,exports){
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

},{"./gen.js":30,"./history.js":34,"./mul.js":48,"./t60.js":68}],21:[function(require,module,exports){
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

},{"./accum.js":2,"./data.js":18,"./gen.js":30,"./memo.js":42,"./peek.js":54,"./poke.js":56,"./sub.js":66,"./wrap.js":74}],22:[function(require,module,exports){
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

},{"./gen.js":30,"./history.js":34,"./sub.js":66}],23:[function(require,module,exports){
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

},{"./data":18,"./gen":30,"./peek":54,"./phasor":55,"./windows":73}],25:[function(require,module,exports){
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

},{"./gen.js":30}],29:[function(require,module,exports){
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

},{"./gen.js":30}],30:[function(require,module,exports){
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

},{"memory-helper":75}],31:[function(require,module,exports){
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
  exp: require('./exp.js'),
  seq: require('./seq.js')
};

library.gen.lib = library;

module.exports = library;

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./data.js":18,"./dcblock.js":19,"./decay.js":20,"./delay.js":21,"./delta.js":22,"./div.js":23,"./env.js":24,"./eq.js":25,"./exp.js":26,"./floor.js":27,"./fold.js":28,"./gate.js":29,"./gen.js":30,"./gt.js":31,"./gte.js":32,"./gtp.js":33,"./history.js":34,"./ifelseif.js":35,"./in.js":36,"./lt.js":38,"./lte.js":39,"./ltp.js":40,"./max.js":41,"./memo.js":42,"./min.js":43,"./mix.js":44,"./mod.js":45,"./mstosamps.js":46,"./mtof.js":47,"./mul.js":48,"./neq.js":49,"./noise.js":50,"./not.js":51,"./pan.js":52,"./param.js":53,"./peek.js":54,"./phasor.js":55,"./poke.js":56,"./pow.js":57,"./rate.js":58,"./round.js":59,"./sah.js":60,"./selector.js":61,"./seq.js":62,"./sign.js":63,"./sin.js":64,"./slide.js":65,"./sub.js":66,"./switch.js":67,"./t60.js":68,"./tan.js":69,"./tanh.js":70,"./train.js":71,"./utilities.js":72,"./windows.js":73,"./wrap.js":74}],38:[function(require,module,exports){
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

},{"./gen.js":30}],44:[function(require,module,exports){
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

},{"./add.js":5,"./gen.js":30,"./memo.js":42,"./mul.js":48,"./sub.js":66}],45:[function(require,module,exports){
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

},{"./data.js":18,"./gen.js":30,"./mul.js":48,"./peek.js":54}],53:[function(require,module,exports){
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

},{"./data.js":18,"./gen.js":30}],55:[function(require,module,exports){
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

},{"./gen.js":30,"./mul.js":48,"./wrap.js":74}],57:[function(require,module,exports){
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

},{"./add.js":5,"./delta.js":22,"./gen.js":30,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":66,"./wrap.js":74}],59:[function(require,module,exports){
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

},{"./accum.js":2,"./counter.js":16,"./data.js":18,"./gen.js":30,"./history.js":34,"./peek.js":54}],63:[function(require,module,exports){
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

},{"./gen.js":30}],64:[function(require,module,exports){
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

},{"./gen.js":30}],65:[function(require,module,exports){
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

},{"./add.js":5,"./div.js":23,"./gen.js":30,"./gt.js":31,"./history.js":34,"./memo.js":42,"./mul.js":48,"./sub.js":66,"./switch.js":67}],66:[function(require,module,exports){
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

},{"./gen.js":30}],67:[function(require,module,exports){
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

},{"./gen.js":30}],68:[function(require,module,exports){
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

},{"./gen.js":30}],69:[function(require,module,exports){
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

},{"./gen.js":30}],70:[function(require,module,exports){
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

},{"./gen.js":30}],71:[function(require,module,exports){
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

},{"./gen.js":30,"./lt.js":38,"./phasor.js":55}],72:[function(require,module,exports){
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var gen = require('./gen.js'),
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

            console.log(ugen);
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

},{"./data.js":18,"./gen.js":30}],73:[function(require,module,exports){
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

},{}],74:[function(require,module,exports){
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

},{"./floor.js":27,"./gen.js":30,"./memo.js":42,"./sub.js":66}],75:[function(require,module,exports){
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

},{}]},{},[37])(37)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZC5qcyIsImpzL2FkZC5qcyIsImpzL2Fkc3IuanMiLCJqcy9hbmQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2F0dGFjay5qcyIsImpzL2JhbmcuanMiLCJqcy9ib29sLmpzIiwianMvY2VpbC5qcyIsImpzL2NsYW1wLmpzIiwianMvY29zLmpzIiwianMvY291bnRlci5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RjYmxvY2suanMiLCJqcy9kZWNheS5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9lbnYuanMiLCJqcy9lcS5qcyIsImpzL2V4cC5qcyIsImpzL2Zsb29yLmpzIiwianMvZm9sZC5qcyIsImpzL2dhdGUuanMiLCJqcy9nZW4uanMiLCJqcy9ndC5qcyIsImpzL2d0ZS5qcyIsImpzL2d0cC5qcyIsImpzL2hpc3RvcnkuanMiLCJqcy9pZmVsc2VpZi5qcyIsImpzL2luLmpzIiwianMvaW5kZXguanMiLCJqcy9sdC5qcyIsImpzL2x0ZS5qcyIsImpzL2x0cC5qcyIsImpzL21heC5qcyIsImpzL21lbW8uanMiLCJqcy9taW4uanMiLCJqcy9taXguanMiLCJqcy9tb2QuanMiLCJqcy9tc3Rvc2FtcHMuanMiLCJqcy9tdG9mLmpzIiwianMvbXVsLmpzIiwianMvbmVxLmpzIiwianMvbm9pc2UuanMiLCJqcy9ub3QuanMiLCJqcy9wYW4uanMiLCJqcy9wYXJhbS5qcyIsImpzL3BlZWsuanMiLCJqcy9waGFzb3IuanMiLCJqcy9wb2tlLmpzIiwianMvcG93LmpzIiwianMvcmF0ZS5qcyIsImpzL3JvdW5kLmpzIiwianMvc2FoLmpzIiwianMvc2VsZWN0b3IuanMiLCJqcy9zZXEuanMiLCJqcy9zaWduLmpzIiwianMvc2luLmpzIiwianMvc2xpZGUuanMiLCJqcy9zdWIuanMiLCJqcy9zd2l0Y2guanMiLCJqcy90NjAuanMiLCJqcy90YW4uanMiLCJqcy90YW5oLmpzIiwianMvdHJhaW4uanMiLCJqcy91dGlsaXRpZXMuanMiLCJqcy93aW5kb3dzLmpzIiwianMvd3JhcC5qcyIsIm5vZGVfbW9kdWxlcy9tZW1vcnktaGVscGVyL2luZGV4LnRyYW5zcGlsZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLEtBREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EsUUFBTSxZQUFZLEtBQUksSUFBSixLQUFhLFNBQS9CO0FBQ0EsUUFBTSxNQUFNLFlBQVksRUFBWixHQUFpQixNQUE3Qjs7QUFFQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2QixXQUFJLFFBQUosQ0FBYSxHQUFiLHFCQUFxQixLQUFLLElBQTFCLEVBQWtDLFlBQVksVUFBWixHQUF5QixLQUFLLEdBQWhFOztBQUVBLFlBQVMsR0FBVCxhQUFvQixPQUFPLENBQVAsQ0FBcEI7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssR0FBTCxDQUFVLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBVixDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFwQlMsQ0FBWjs7QUF1QkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYjs7QUFFQSxTQUFPLEdBQVA7QUFDRCxDQU5EOzs7QUMzQkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsT0FEQzs7QUFH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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2FicycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldCA/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLmFicycgOiBNYXRoLmFicyB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9YWJzKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFicyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFicyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhYnMuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gYWJzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FjY3VtJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5XG5cbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCApXG5cbiAgICAvL2dlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiB0aGlzIH0pIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgICBcbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfcmVzZXQsIHZhbHVlUmVmICkge1xuICAgIGxldCBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJ1xuICAgIFxuICAgIC8qIHRocmVlIGRpZmZlcmVudCBtZXRob2RzIG9mIHdyYXBwaW5nLCB0aGlyZCBpcyBtb3N0IGV4cGVuc2l2ZTpcbiAgICAgKlxuICAgICAqIDE6IHJhbmdlIHswLDF9OiB5ID0geCAtICh4IHwgMClcbiAgICAgKiAyOiBsb2cyKHRoaXMubWF4KSA9PSBpbnRlZ2VyOiB5ID0geCAmICh0aGlzLm1heCAtIDEpXG4gICAgICogMzogYWxsIG90aGVyczogaWYoIHggPj0gdGhpcy5tYXggKSB5ID0gdGhpcy5tYXggLXhcbiAgICAgKlxuICAgICAqL1xuXG4gICAgLy8gbXVzdCBjaGVjayBmb3IgcmVzZXQgYmVmb3JlIHN0b3JpbmcgdmFsdWUgZm9yIG91dHB1dFxuICAgIGlmKCAhKHR5cGVvZiB0aGlzLmlucHV0c1sxXSA9PT0gJ251bWJlcicgJiYgdGhpcy5pbnB1dHNbMV0gPCAxKSApIHsgXG4gICAgICBpZiggdGhpcy5yZXNldFZhbHVlICE9PSB0aGlzLm1pbiApIHtcblxuICAgICAgICBvdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5yZXNldFZhbHVlfVxcblxcbmBcbiAgICAgICAgLy9vdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5taW59XFxuXFxuYFxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLm1pbn1cXG5cXG5gXG4gICAgICAgIC8vb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMuaW5pdGlhbFZhbHVlfVxcblxcbmBcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvdXQgKz0gYCAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dmFsdWVSZWZ9XFxuYFxuICAgIFxuICAgIGlmKCB0aGlzLnNob3VsZFdyYXAgPT09IGZhbHNlICYmIHRoaXMuc2hvdWxkQ2xhbXAgPT09IHRydWUgKSB7XG4gICAgICBvdXQgKz0gYCAgaWYoICR7dmFsdWVSZWZ9IDwgJHt0aGlzLm1heCB9ICkgJHt2YWx1ZVJlZn0gKz0gJHtfaW5jcn1cXG5gXG4gICAgfWVsc2V7XG4gICAgICBvdXQgKz0gYCAgJHt2YWx1ZVJlZn0gKz0gJHtfaW5jcn1cXG5gIC8vIHN0b3JlIG91dHB1dCB2YWx1ZSBiZWZvcmUgYWNjdW11bGF0aW5nICBcbiAgICB9XG5cbiAgICBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICAmJiB0aGlzLnNob3VsZFdyYXBNYXggKSB3cmFwICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSApICR7dmFsdWVSZWZ9IC09ICR7ZGlmZn1cXG5gXG4gICAgaWYoIHRoaXMubWluICE9PSAtSW5maW5pdHkgJiYgdGhpcy5zaG91bGRXcmFwTWluICkgd3JhcCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPCAke3RoaXMubWlufSApICR7dmFsdWVSZWZ9ICs9ICR7ZGlmZn1cXG5gXG5cbiAgICAvL2lmKCB0aGlzLm1pbiA9PT0gMCAmJiB0aGlzLm1heCA9PT0gMSApIHsgXG4gICAgLy8gIHdyYXAgPSAgYCAgJHt2YWx1ZVJlZn0gPSAke3ZhbHVlUmVmfSAtICgke3ZhbHVlUmVmfSB8IDApXFxuXFxuYFxuICAgIC8vfSBlbHNlIGlmKCB0aGlzLm1pbiA9PT0gMCAmJiAoIE1hdGgubG9nMiggdGhpcy5tYXggKSB8IDAgKSA9PT0gTWF0aC5sb2cyKCB0aGlzLm1heCApICkge1xuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gJiAoJHt0aGlzLm1heH0gLSAxKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICl7XG4gICAgLy8gIHdyYXAgPSBgICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gKSAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XFxuXFxuYFxuICAgIC8vfVxuXG4gICAgb3V0ID0gb3V0ICsgd3JhcCArICdcXG4nXG5cbiAgICByZXR1cm4gb3V0XG4gIH0sXG5cbiAgZGVmYXVsdHMgOiB7IG1pbjowLCBtYXg6MSwgcmVzZXRWYWx1ZTowLCBpbml0aWFsVmFsdWU6MCwgc2hvdWxkV3JhcDp0cnVlLCBzaG91bGRXcmFwTWF4OiB0cnVlLCBzaG91bGRXcmFwTWluOnRydWUsIHNob3VsZENsYW1wOmZhbHNlIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluY3IsIHJlc2V0PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGNvbnN0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gICAgICBcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgXG4gICAgeyBcbiAgICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgICAgaW5wdXRzOiBbIGluY3IsIHJlc2V0IF0sXG4gICAgICBtZW1vcnk6IHtcbiAgICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIHByb3RvLmRlZmF1bHRzLFxuICAgIHByb3BlcnRpZXMgXG4gIClcblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuc2hvdWxkV3JhcE1heCA9PT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuc2hvdWxkV3JhcE1pbiA9PT0gdW5kZWZpbmVkICkge1xuICAgIGlmKCBwcm9wZXJ0aWVzLnNob3VsZFdyYXAgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHVnZW4uc2hvdWxkV3JhcE1pbiA9IHVnZW4uc2hvdWxkV3JhcE1heCA9IHByb3BlcnRpZXMuc2hvdWxkV3JhcFxuICAgIH1cbiAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5yZXNldFZhbHVlID09PSB1bmRlZmluZWQgKSB7XG4gICAgdWdlbi5yZXNldFZhbHVlID0gdWdlbi5taW5cbiAgfVxuXG4gIGlmKCB1Z2VuLmluaXRpYWxWYWx1ZSA9PT0gdW5kZWZpbmVkICkgdWdlbi5pbml0aWFsVmFsdWUgPSB1Z2VuLm1pblxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpICB7IFxuICAgICAgLy9jb25zb2xlLmxvZyggJ2dlbjonLCBnZW4sIGdlbi5tZW1vcnkgKVxuICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gXG4gICAgfSxcbiAgICBzZXQodikgeyBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiB9XG4gIH0pXG5cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY29zJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG5cbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0ID8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Fjb3MnOiBpc1dvcmtsZXQgPyAnTWF0aC5hY29zJyA6TWF0aC5hY29zIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1hY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hY29zKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYWNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhY29zLmlucHV0cyA9IFsgeCBdXG4gIGFjb3MuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWNvcy5uYW1lID0gYCR7YWNvcy5iYXNlbmFtZX17YWNvcy5pZH1gXG5cbiAgcmV0dXJuIGFjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbXVsICAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgZGl2ICAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgZGF0YSAgICAgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgICAgID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBhY2N1bSAgICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGlmZWxzZSAgID0gcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gICAgbHQgICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBiYW5nICAgICA9IHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gICAgZW52ICAgICAgPSByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gICAgYWRkICAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgcG9rZSAgICAgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICAgIG5lcSAgICAgID0gcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICAgIGFuZCAgICAgID0gcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICAgIGd0ZSAgICAgID0gcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICAgIG1lbW8gICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgICB1dGlsaXRpZXM9IHJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZSA9IDQ0MTAwLCBkZWNheVRpbWUgPSA0NDEwMCwgX3Byb3BzICkgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgc2hhcGU6J2V4cG9uZW50aWFsJywgYWxwaGE6NSwgdHJpZ2dlcjpudWxsIH0sIF9wcm9wcyApXG4gIGNvbnN0IF9iYW5nID0gcHJvcHMudHJpZ2dlciAhPT0gbnVsbCA/IHByb3BzLnRyaWdnZXIgOiBiYW5nKCksXG4gICAgICAgIHBoYXNlID0gYWNjdW0oIDEsIF9iYW5nLCB7IG1pbjowLCBtYXg6IEluZmluaXR5LCBpbml0aWFsVmFsdWU6LUluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlIH0pXG4gICAgICBcbiAgbGV0IGJ1ZmZlckRhdGEsIGJ1ZmZlckRhdGFSZXZlcnNlLCBkZWNheURhdGEsIG91dCwgYnVmZmVyXG5cbiAgLy9jb25zb2xlLmxvZyggJ3NoYXBlOicsIHByb3BzLnNoYXBlLCAnYXR0YWNrIHRpbWU6JywgYXR0YWNrVGltZSwgJ2RlY2F5IHRpbWU6JywgZGVjYXlUaW1lIClcbiAgbGV0IGNvbXBsZXRlRmxhZyA9IGRhdGEoIFswXSApXG4gIFxuICAvLyBzbGlnaHRseSBtb3JlIGVmZmljaWVudCB0byB1c2UgZXhpc3RpbmcgcGhhc2UgYWNjdW11bGF0b3IgZm9yIGxpbmVhciBlbnZlbG9wZXNcbiAgaWYoIHByb3BzLnNoYXBlID09PSAnbGluZWFyJyApIHtcbiAgICBvdXQgPSBpZmVsc2UoIFxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgbHQoIHBoYXNlLCBhdHRhY2tUaW1lICkpLFxuICAgICAgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLFxuXG4gICAgICBhbmQoIGd0ZSggcGhhc2UsIDApLCAgbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSApICkgKSxcbiAgICAgIHN1YiggMSwgZGl2KCBzdWIoIHBoYXNlLCBhdHRhY2tUaW1lICksIGRlY2F5VGltZSApICksXG4gICAgICBcbiAgICAgIG5lcSggcGhhc2UsIC1JbmZpbml0eSksXG4gICAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAgIDAgXG4gICAgKVxuICB9IGVsc2Uge1xuICAgIGJ1ZmZlckRhdGEgPSBlbnYoeyBsZW5ndGg6MTAyNCwgdHlwZTpwcm9wcy5zaGFwZSwgYWxwaGE6cHJvcHMuYWxwaGEgfSlcbiAgICBidWZmZXJEYXRhUmV2ZXJzZSA9IGVudih7IGxlbmd0aDoxMDI0LCB0eXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSwgcmV2ZXJzZTp0cnVlIH0pXG5cbiAgICBvdXQgPSBpZmVsc2UoIFxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgbHQoIHBoYXNlLCBhdHRhY2tUaW1lICkgKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgICAgYW5kKCBndGUocGhhc2UsMCksIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YVJldmVyc2UsIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSApLCBkZWNheVRpbWUgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgICAgbmVxKCBwaGFzZSwgLUluZmluaXR5ICksXG4gICAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAgIDBcbiAgICApXG4gIH1cblxuICBjb25zdCB1c2luZ1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgKSB7XG4gICAgb3V0Lm5vZGUgPSBudWxsXG4gICAgdXRpbGl0aWVzLnJlZ2lzdGVyKCBvdXQgKVxuICB9XG5cbiAgLy8gbmVlZGVkIGZvciBnaWJiZXJpc2guLi4gZ2V0dGluZyB0aGlzIHRvIHdvcmsgcmlnaHQgd2l0aCB3b3JrbGV0c1xuICAvLyB2aWEgcHJvbWlzZXMgd2lsbCBwcm9iYWJseSBiZSB0cmlja3lcbiAgb3V0LmlzQ29tcGxldGUgPSAoKT0+IHtcbiAgICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICYmIG91dC5ub2RlICE9PSBudWxsICkge1xuICAgICAgY29uc3QgcCA9IG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgb3V0Lm5vZGUuZ2V0TWVtb3J5VmFsdWUoIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCwgcmVzb2x2ZSApXG4gICAgICB9KVxuXG4gICAgICByZXR1cm4gcFxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF1cbiAgICB9XG4gIH1cblxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgJiYgb3V0Lm5vZGUgIT09IG51bGwgKSB7XG4gICAgICBvdXQubm9kZS5wb3J0LnBvc3RNZXNzYWdlKHsga2V5OidzZXQnLCBpZHg6Y29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4LCB2YWx1ZTowIH0pXG4gICAgfWVsc2V7XG4gICAgICBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdID0gMFxuICAgIH1cbiAgICBfYmFuZy50cmlnZ2VyKClcbiAgfVxuXG4gIHJldHVybiBvdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHsgXG4gIGJhc2VuYW1lOidhZGQnLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PScnLFxuICAgICAgICBzdW0gPSAwLCBudW1Db3VudCA9IDAsIGFkZGVyQXRFbmQgPSBmYWxzZSwgYWxyZWFkeUZ1bGxTdW1tZWQgPSB0cnVlXG5cbiAgICBpZiggaW5wdXRzLmxlbmd0aCA9PT0gMCApIHJldHVybiAwXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYFxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICBvdXQgKz0gdlxuICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgYWRkZXJBdEVuZCA9IHRydWVcbiAgICAgICAgICBvdXQgKz0gJyArICdcbiAgICAgICAgfVxuICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3VtICs9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICBudW1Db3VudCsrXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICBvdXQgKz0gYWRkZXJBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKyAnICsgc3VtXG4gICAgfVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgY29uc3QgYWRkID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBhZGQuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWRkLm5hbWUgPSBhZGQuYmFzZW5hbWUgKyBhZGQuaWRcbiAgYWRkLmlucHV0cyA9IGFyZ3NcblxuICByZXR1cm4gYWRkXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIG11bCAgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGRpdiAgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIGRhdGEgICAgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrICAgICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgYWNjdW0gICAgPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBpZmVsc2UgICA9IHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICAgIGx0ICAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYmFuZyAgICAgPSByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICAgIGVudiAgICAgID0gcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICAgIHBhcmFtICAgID0gcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gICAgYWRkICAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgZ3RwICAgICAgPSByZXF1aXJlKCAnLi9ndHAuanMnICksXG4gICAgbm90ICAgICAgPSByZXF1aXJlKCAnLi9ub3QuanMnICksXG4gICAgYW5kICAgICAgPSByZXF1aXJlKCAnLi9hbmQuanMnICksXG4gICAgbmVxICAgICAgPSByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gICAgcG9rZSAgICAgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBhdHRhY2tUaW1lPTQ0LCBkZWNheVRpbWU9MjIwNTAsIHN1c3RhaW5UaW1lPTQ0MTAwLCBzdXN0YWluTGV2ZWw9LjYsIHJlbGVhc2VUaW1lPTQ0MTAwLCBfcHJvcHMgKSA9PiB7XG4gIGxldCBlbnZUcmlnZ2VyID0gYmFuZygpLFxuICAgICAgcGhhc2UgPSBhY2N1bSggMSwgZW52VHJpZ2dlciwgeyBtYXg6IEluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlLCBpbml0aWFsVmFsdWU6SW5maW5pdHkgfSksXG4gICAgICBzaG91bGRTdXN0YWluID0gcGFyYW0oIDEgKSxcbiAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgc2hhcGU6ICdleHBvbmVudGlhbCcsXG4gICAgICAgICBhbHBoYTogNSxcbiAgICAgICAgIHRyaWdnZXJSZWxlYXNlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBfcHJvcHMgKSxcbiAgICAgIGJ1ZmZlckRhdGEsIGRlY2F5RGF0YSwgb3V0LCBidWZmZXIsIHN1c3RhaW5Db25kaXRpb24sIHJlbGVhc2VBY2N1bSwgcmVsZWFzZUNvbmRpdGlvblxuXG5cbiAgY29uc3QgY29tcGxldGVGbGFnID0gZGF0YSggWzBdIClcblxuICBidWZmZXJEYXRhID0gZW52KHsgbGVuZ3RoOjEwMjQsIGFscGhhOnByb3BzLmFscGhhLCBzaGlmdDowLCB0eXBlOnByb3BzLnNoYXBlIH0pXG5cbiAgc3VzdGFpbkNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlIFxuICAgID8gc2hvdWxkU3VzdGFpblxuICAgIDogbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUgKSApXG5cbiAgcmVsZWFzZUFjY3VtID0gcHJvcHMudHJpZ2dlclJlbGVhc2VcbiAgICA/IGd0cCggc3ViKCBzdXN0YWluTGV2ZWwsIGFjY3VtKCBkaXYoIHN1c3RhaW5MZXZlbCwgcmVsZWFzZVRpbWUgKSAsIDAsIHsgc2hvdWxkV3JhcDpmYWxzZSB9KSApLCAwIClcbiAgICA6IHN1Yiggc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lICkgKSwgcmVsZWFzZVRpbWUgKSwgc3VzdGFpbkxldmVsICkgKSwgXG5cbiAgcmVsZWFzZUNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgPyBub3QoIHNob3VsZFN1c3RhaW4gKVxuICAgIDogbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUsIHJlbGVhc2VUaW1lICkgKVxuXG4gIG91dCA9IGlmZWxzZShcbiAgICAvLyBhdHRhY2sgXG4gICAgbHQoIHBoYXNlLCAgYXR0YWNrVGltZSApLCBcbiAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgIC8vIGRlY2F5XG4gICAgbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSApICksIFxuICAgIHBlZWsoIGJ1ZmZlckRhdGEsIHN1YiggMSwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICksICBkZWNheVRpbWUgKSwgc3ViKCAxLCAgc3VzdGFpbkxldmVsICkgKSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pLFxuXG4gICAgLy8gc3VzdGFpblxuICAgIGFuZCggc3VzdGFpbkNvbmRpdGlvbiwgbmVxKCBwaGFzZSwgSW5maW5pdHkgKSApLFxuICAgIHBlZWsoIGJ1ZmZlckRhdGEsICBzdXN0YWluTGV2ZWwgKSxcblxuICAgIC8vIHJlbGVhc2VcbiAgICByZWxlYXNlQ29uZGl0aW9uLCAvL2x0KCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lICsgIHJlbGVhc2VUaW1lICksXG4gICAgcGVlayggXG4gICAgICBidWZmZXJEYXRhLFxuICAgICAgcmVsZWFzZUFjY3VtLCBcbiAgICAgIC8vc3ViKCAgc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lKSwgIHJlbGVhc2VUaW1lICksICBzdXN0YWluTGV2ZWwgKSApLCBcbiAgICAgIHsgYm91bmRtb2RlOidjbGFtcCcgfVxuICAgICksXG5cbiAgICBuZXEoIHBoYXNlLCBJbmZpbml0eSApLFxuICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgIDBcbiAgKVxuICAgXG4gIGNvbnN0IHVzaW5nV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSApIHtcbiAgICBvdXQubm9kZSA9IG51bGxcbiAgICB1dGlsaXRpZXMucmVnaXN0ZXIoIG91dCApXG4gIH1cblxuICBvdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAxXG4gICAgZW52VHJpZ2dlci50cmlnZ2VyKClcbiAgfVxuIFxuICAvLyBuZWVkZWQgZm9yIGdpYmJlcmlzaC4uLiBnZXR0aW5nIHRoaXMgdG8gd29yayByaWdodCB3aXRoIHdvcmtsZXRzXG4gIC8vIHZpYSBwcm9taXNlcyB3aWxsIHByb2JhYmx5IGJlIHRyaWNreVxuICBvdXQuaXNDb21wbGV0ZSA9ICgpPT4ge1xuICAgIGlmKCB1c2luZ1dvcmtsZXQgPT09IHRydWUgJiYgb3V0Lm5vZGUgIT09IG51bGwgKSB7XG4gICAgICBjb25zdCBwID0gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICBvdXQubm9kZS5nZXRNZW1vcnlWYWx1ZSggY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4LCByZXNvbHZlIClcbiAgICAgIH0pXG5cbiAgICAgIHJldHVybiBwXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHggXVxuICAgIH1cbiAgfVxuXG5cbiAgb3V0LnJlbGVhc2UgPSAoKT0+IHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMFxuICAgIC8vIFhYWCBwcmV0dHkgbmFzdHkuLi4gZ3JhYnMgYWNjdW0gaW5zaWRlIG9mIGd0cCBhbmQgcmVzZXRzIHZhbHVlIG1hbnVhbGx5XG4gICAgLy8gdW5mb3J0dW5hdGVseSBlbnZUcmlnZ2VyIHdvbid0IHdvcmsgYXMgaXQncyBiYWNrIHRvIDAgYnkgdGhlIHRpbWUgdGhlIHJlbGVhc2UgYmxvY2sgaXMgdHJpZ2dlcmVkLi4uXG4gICAgaWYoIHVzaW5nV29ya2xldCAmJiBvdXQubm9kZSAhPT0gbnVsbCApIHtcbiAgICAgIGNvbnNvbGUubG9nKCAnd29ya2xldD8/JyApXG4gICAgICBvdXQubm9kZS5wb3J0LnBvc3RNZXNzYWdlKHsga2V5OidzZXQnLCBpZHg6cmVsZWFzZUFjY3VtLmlucHV0c1swXS5pbnB1dHNbMV0ubWVtb3J5LnZhbHVlLmlkeCwgdmFsdWU6MCB9KVxuICAgIH1lbHNle1xuICAgICAgY29uc29sZS5sb2coICdub24td29ya2xldC4uLicgKVxuICAgICAgZ2VuLm1lbW9yeS5oZWFwWyByZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4IF0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FuZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9ICgke2lucHV0c1swXX0gIT09IDAgJiYgJHtpbnB1dHNbMV19ICE9PSAwKSB8IDBcXG5cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfWAsIG91dCBdXG4gIH0sXG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgaW4yICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FzaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0ID8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2FzaW4nOiBpc1dvcmtsZXQgPyAnTWF0aC5zaW4nIDogTWF0aC5hc2luIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1hc2luKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXNpbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhc2luLmlucHV0cyA9IFsgeCBdXG4gIGFzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXNpbi5uYW1lID0gYCR7YXNpbi5iYXNlbmFtZX17YXNpbi5pZH1gXG5cbiAgcmV0dXJuIGFzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYXRhbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQgPyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYXRhbic6IGlzV29ya2xldCA/ICdNYXRoLmF0YW4nIDogTWF0aC5hdGFuIH0pXG5cbiAgICAgIG91dCA9IGAke3JlZn1hdGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hdGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYXRhbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhdGFuLmlucHV0cyA9IFsgeCBdXG4gIGF0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgYXRhbi5uYW1lID0gYCR7YXRhbi5iYXNlbmFtZX17YXRhbi5pZH1gXG5cbiAgcmV0dXJuIGF0YW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwICkgPT4ge1xuICBsZXQgc3NkID0gaGlzdG9yeSAoIDEgKSxcbiAgICAgIHQ2MCA9IE1hdGguZXhwKCAtNi45MDc3NTUyNzg5MjEgLyBkZWNheVRpbWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAgKSApXG5cbiAgc3NkLm91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc3NkLnZhbHVlID0gMVxuICB9XG5cbiAgcmV0dXJuIHN1YiggMSwgc3NkLm91dCApXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBnZW4oKSB7XG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBsZXQgb3V0ID0gXG5gICB2YXIgJHt0aGlzLm5hbWV9ID0gbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1cbiAgaWYoICR7dGhpcy5uYW1lfSA9PT0gMSApIG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dID0gMCAgICAgIFxuICAgICAgXG5gXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBfcHJvcHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46MCwgbWF4OjEgfSwgX3Byb3BzIClcblxuICB1Z2VuLm5hbWUgPSAnYmFuZycgKyBnZW4uZ2V0VUlEKClcblxuICB1Z2VuLm1pbiA9IHByb3BzLm1pblxuICB1Z2VuLm1heCA9IHByb3BzLm1heFxuXG4gIGNvbnN0IHVzaW5nV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgaWYoIHVzaW5nV29ya2xldCA9PT0gdHJ1ZSApIHtcbiAgICB1Z2VuLm5vZGUgPSBudWxsXG4gICAgdXRpbGl0aWVzLnJlZ2lzdGVyKCB1Z2VuIClcbiAgfVxuXG4gIHVnZW4udHJpZ2dlciA9ICgpID0+IHtcbiAgICBpZiggdXNpbmdXb3JrbGV0ID09PSB0cnVlICYmIHVnZW4ubm9kZSAhPT0gbnVsbCApIHtcbiAgICAgIHVnZW4ubm9kZS5wb3J0LnBvc3RNZXNzYWdlKHsga2V5OidzZXQnLCBpZHg6dWdlbi5tZW1vcnkudmFsdWUuaWR4LCB2YWx1ZTp1Z2VuLm1heCB9KVxuICAgIH1lbHNle1xuICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IHVnZW4ubWF4IFxuICAgIH1cbiAgfVxuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYm9vbCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gYCR7aW5wdXRzWzBdfSA9PT0gMCA/IDAgOiAxYFxuICAgIFxuICAgIC8vZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIC8vcmV0dXJuIFsgYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWAsICcgJyArb3V0IF1cbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2NlaWwnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQgPyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBpc1dvcmtsZXQgPyAnTWF0aC5jZWlsJyA6IE1hdGguY2VpbCB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9Y2VpbCggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jZWlsKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgY2VpbCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBjZWlsLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGNlaWxcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZmxvb3I9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY2xpcCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dFxuXG4gICAgb3V0ID1cblxuYCB2YXIgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XG4gIGlmKCAke3RoaXMubmFtZX0gPiAke2lucHV0c1syXX0gKSAke3RoaXMubmFtZX0gPSAke2lucHV0c1syXX1cbiAgZWxzZSBpZiggJHt0aGlzLm5hbWV9IDwgJHtpbnB1dHNbMV19ICkgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMV19XG5gXG4gICAgb3V0ID0gJyAnICsgb3V0XG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0tMSwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgbWluLCBtYXggXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY29zJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0ID8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Nvcyc6IGlzV29ya2xldCA/ICdNYXRoLmNvcycgOiBNYXRoLmNvcyB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9Y29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jb3MoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBjb3MgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY29zLmlucHV0cyA9IFsgeCBdXG4gIGNvcy5pZCA9IGdlbi5nZXRVSUQoKVxuICBjb3MubmFtZSA9IGAke2Nvcy5iYXNlbmFtZX17Y29zLmlkfWBcblxuICByZXR1cm4gY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvdW50ZXInLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmdW5jdGlvbkJvZHlcbiAgICAgICBcbiAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBmdW5jdGlvbkJvZHkgID0gdGhpcy5jYWxsYmFjayggZ2VuTmFtZSwgaW5wdXRzWzBdLCBpbnB1dHNbMV0sIGlucHV0c1syXSwgaW5wdXRzWzNdLCBpbnB1dHNbNF0sICBgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV1gLCBgbWVtb3J5WyR7dGhpcy5tZW1vcnkud3JhcC5pZHh9XWAgIClcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG4gICBcbiAgICBpZiggZ2VuLm1lbW9bIHRoaXMud3JhcC5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHRoaXMud3JhcC5nZW4oKVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgY2FsbGJhY2soIF9uYW1lLCBfaW5jciwgX21pbiwgX21heCwgX3Jlc2V0LCBsb29wcywgdmFsdWVSZWYsIHdyYXBSZWYgKSB7XG4gICAgbGV0IGRpZmYgPSB0aGlzLm1heCAtIHRoaXMubWluLFxuICAgICAgICBvdXQgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnXG4gICAgLy8gbXVzdCBjaGVjayBmb3IgcmVzZXQgYmVmb3JlIHN0b3JpbmcgdmFsdWUgZm9yIG91dHB1dFxuICAgIGlmKCAhKHR5cGVvZiB0aGlzLmlucHV0c1szXSA9PT0gJ251bWJlcicgJiYgdGhpcy5pbnB1dHNbM10gPCAxKSApIHsgXG4gICAgICBvdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PSAxICkgJHt2YWx1ZVJlZn0gPSAke19taW59XFxuYFxuICAgIH1cblxuICAgIG91dCArPSBgICB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2YWx1ZVJlZn07XFxuICAke3ZhbHVlUmVmfSArPSAke19pbmNyfVxcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIFxuICAgIGlmKCB0eXBlb2YgdGhpcy5tYXggPT09ICdudW1iZXInICYmIHRoaXMubWF4ICE9PSBJbmZpbml0eSAmJiB0eXBlb2YgdGhpcy5taW4gIT09ICdudW1iZXInICkge1xuICAgICAgd3JhcCA9IFxuYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICYmICAke2xvb3BzfSA+IDApIHtcbiAgICAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2V7XG4gICAgJHt3cmFwUmVmfSA9IDBcbiAgfVxcbmBcbiAgICB9ZWxzZSBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHRoaXMubWluICE9PSBJbmZpbml0eSApIHtcbiAgICAgIHdyYXAgPSBcbmAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke19tYXh9ICYmICAke2xvb3BzfSA+IDApIHtcbiAgICAke3ZhbHVlUmVmfSAtPSAke19tYXh9IC0gJHtfbWlufVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNlIGlmKCAke3ZhbHVlUmVmfSA8ICR7X21pbn0gJiYgICR7bG9vcHN9ID4gMCkge1xuICAgICR7dmFsdWVSZWZ9ICs9ICR7X21heH0gLSAke19taW59XG4gICAgJHt3cmFwUmVmfSA9IDFcbiAgfWVsc2V7XG4gICAgJHt3cmFwUmVmfSA9IDBcbiAgfVxcbmBcbiAgICB9ZWxzZXtcbiAgICAgIG91dCArPSAnXFxuJ1xuICAgIH1cblxuICAgIG91dCA9IG91dCArIHdyYXBcblxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jcj0xLCBtaW49MCwgbWF4PUluZmluaXR5LCByZXNldD0wLCBsb29wcz0xLCAgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXRpYWxWYWx1ZTogMCwgc2hvdWxkV3JhcDp0cnVlIH1cblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluOiAgICBtaW4sIFxuICAgIG1heDogICAgbWF4LFxuICAgIHZhbHVlOiAgZGVmYXVsdHMuaW5pdGlhbFZhbHVlLFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbmNyLCBtaW4sIG1heCwgcmVzZXQsIGxvb3BzIF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4OiBudWxsIH0sXG4gICAgICB3cmFwOiAgeyBsZW5ndGg6MSwgaWR4OiBudWxsIH0gXG4gICAgfSxcbiAgICB3cmFwIDoge1xuICAgICAgZ2VuKCkgeyBcbiAgICAgICAgaWYoIHVnZW4ubWVtb3J5LndyYXAuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSApXG4gICAgICAgIH1cbiAgICAgICAgZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbICR7dWdlbi5tZW1vcnkud3JhcC5pZHh9IF1gXG4gICAgICAgIHJldHVybiBgbWVtb3J5WyAke3VnZW4ubWVtb3J5LndyYXAuaWR4fSBdYCBcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIGRlZmF1bHRzIClcbiBcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IFxuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgXG4gIHVnZW4ud3JhcC5pbnB1dHMgPSBbIHVnZW4gXVxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuICB1Z2VuLndyYXAubmFtZSA9IHVnZW4ubmFtZSArICdfd3JhcCdcbiAgcmV0dXJuIHVnZW5cbn0gXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW09IHJlcXVpcmUoICcuL3BoYXNvci5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHBoYXNvcj1yZXF1aXJlKCAnLi9waGFzb3IuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidjeWNsZScsXG5cbiAgaW5pdFRhYmxlKCkgeyAgICBcbiAgICBsZXQgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApXG5cbiAgICBmb3IoIGxldCBpID0gMCwgbCA9IGJ1ZmZlci5sZW5ndGg7IGkgPCBsOyBpKysgKSB7XG4gICAgICBidWZmZXJbIGkgXSA9IE1hdGguc2luKCAoIGkgLyBsICkgKiAoIE1hdGguUEkgKiAyICkgKVxuICAgIH1cblxuICAgIGdlbi5nbG9iYWxzLmN5Y2xlID0gZGF0YSggYnVmZmVyLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0gKVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeT0xLCByZXNldD0wLCBfcHJvcHMgKSA9PiB7XG4gIGlmKCB0eXBlb2YgZ2VuLmdsb2JhbHMuY3ljbGUgPT09ICd1bmRlZmluZWQnICkgcHJvdG8uaW5pdFRhYmxlKCkgXG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46MCB9LCBfcHJvcHMgKVxuXG4gIGNvbnN0IHVnZW4gPSBwZWVrKCBnZW4uZ2xvYmFscy5jeWNsZSwgcGhhc29yKCBmcmVxdWVuY3ksIHJlc2V0LCBwcm9wcyApKVxuICB1Z2VuLm5hbWUgPSAnY3ljbGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gIHV0aWxpdGllcyA9IHJlcXVpcmUoICcuL3V0aWxpdGllcy5qcycgKSxcbiAgcGVlayA9IHJlcXVpcmUoJy4vcGVlay5qcycpLFxuICBwb2tlID0gcmVxdWlyZSgnLi9wb2tlLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZGF0YScsXG4gIGdsb2JhbHM6IHt9LFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaWR4XG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgbGV0IHVnZW4gPSB0aGlzXG4gICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnksIHRoaXMuaW1tdXRhYmxlICkgXG4gICAgICBpZHggPSB0aGlzLm1lbW9yeS52YWx1ZXMuaWR4XG4gICAgICB0cnkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXAuc2V0KCB0aGlzLmJ1ZmZlciwgaWR4IClcbiAgICAgIH1jYXRjaCggZSApIHtcbiAgICAgICAgY29uc29sZS5sb2coIGUgKVxuICAgICAgICB0aHJvdyBFcnJvciggJ2Vycm9yIHdpdGggcmVxdWVzdC4gYXNraW5nIGZvciAnICsgdGhpcy5idWZmZXIubGVuZ3RoICsnLiBjdXJyZW50IGluZGV4OiAnICsgZ2VuLm1lbW9yeUluZGV4ICsgJyBvZiAnICsgZ2VuLm1lbW9yeS5oZWFwLmxlbmd0aCApXG4gICAgICB9XG4gICAgICAvL2dlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IHRoaXNcbiAgICAgIC8vcmV0dXJuICdnZW4ubWVtb3J5JyArIHRoaXMubmFtZSArICcuYnVmZmVyJ1xuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gaWR4XG4gICAgfWVsc2V7XG4gICAgICBpZHggPSBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgICB9XG4gICAgcmV0dXJuIGlkeFxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggeCwgeT0xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiwgYnVmZmVyLCBzaG91bGRMb2FkID0gZmFsc2VcbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5nbG9iYWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF0gKSB7XG4gICAgICByZXR1cm4gZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF1cbiAgICB9XG4gIH1cblxuICBpZiggdHlwZW9mIHggPT09ICdudW1iZXInICkge1xuICAgIGlmKCB5ICE9PSAxICkge1xuICAgICAgYnVmZmVyID0gW11cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgeTsgaSsrICkge1xuICAgICAgICBidWZmZXJbIGkgXSA9IG5ldyBGbG9hdDMyQXJyYXkoIHggKVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgfVxuICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggeCApICkgeyAvLyEgKHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSApIHtcbiAgICBsZXQgc2l6ZSA9IHgubGVuZ3RoXG4gICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggc2l6ZSApXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSB4WyBpIF1cbiAgICB9XG4gIH1lbHNlIGlmKCB0eXBlb2YgeCA9PT0gJ3N0cmluZycgKSB7XG4gICAgYnVmZmVyID0geyBsZW5ndGg6IHkgPiAxID8geSA6IGdlbi5zYW1wbGVyYXRlICogNjAgfSAvLyBYWFggd2hhdD8/P1xuICAgIHNob3VsZExvYWQgPSB0cnVlXG4gIH1lbHNlIGlmKCB4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkge1xuICAgIGJ1ZmZlciA9IHhcbiAgfVxuICBcbiAgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGJ1ZmZlcixcbiAgICBuYW1lOiBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKSxcbiAgICBkaW06ICBidWZmZXIubGVuZ3RoLCAvLyBYWFggaG93IGRvIHdlIGR5bmFtaWNhbGx5IGFsbG9jYXRlIHRoaXM/XG4gICAgY2hhbm5lbHMgOiAxLFxuICAgIG9ubG9hZDogbnVsbCxcbiAgICB0aGVuKCBmbmMgKSB7XG4gICAgICB1Z2VuLm9ubG9hZCA9IGZuY1xuICAgICAgcmV0dXJuIHVnZW5cbiAgICB9LFxuICAgIGltbXV0YWJsZTogcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuaW1tdXRhYmxlID09PSB0cnVlID8gdHJ1ZSA6IGZhbHNlLFxuICAgIGxvYWQoIGZpbGVuYW1lICkge1xuICAgICAgbGV0IHByb21pc2UgPSB1dGlsaXRpZXMubG9hZFNhbXBsZSggZmlsZW5hbWUsIHVnZW4gKVxuICAgICAgcHJvbWlzZS50aGVuKCAoIF9idWZmZXIgKT0+IHsgXG4gICAgICAgIHVnZW4ubWVtb3J5LnZhbHVlcy5sZW5ndGggPSB1Z2VuLmRpbSA9IF9idWZmZXIubGVuZ3RoICAgICBcbiAgICAgICAgdWdlbi5vbmxvYWQoKSBcbiAgICAgIH0pXG4gICAgfSxcbiAgICBtZW1vcnkgOiB7XG4gICAgICB2YWx1ZXM6IHsgbGVuZ3RoOmJ1ZmZlci5sZW5ndGgsIGlkeDpudWxsIH1cbiAgICB9XG4gIH0pXG5cbiAgaWYoIHNob3VsZExvYWQgKSB1Z2VuLmxvYWQoIHggKVxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggcHJvcGVydGllcy5nbG9iYWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdID0gdWdlblxuICAgIH1cbiAgICBpZiggcHJvcGVydGllcy5tZXRhID09PSB0cnVlICkge1xuICAgICAgZm9yKCBsZXQgaSA9IDAsIGxlbmd0aCA9IHVnZW4uYnVmZmVyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sIGksIHtcbiAgICAgICAgICBnZXQgKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBlZWsoIHVnZW4sIGksIHsgbW9kZTonc2ltcGxlJywgaW50ZXJwOidub25lJyB9IClcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgIHJldHVybiBwb2tlKCB1Z2VuLCB2LCBpIClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgeDEgPSBoaXN0b3J5KCksXG4gICAgICB5MSA9IGhpc3RvcnkoKSxcbiAgICAgIGZpbHRlclxuXG4gIC8vSGlzdG9yeSB4MSwgeTE7IHkgPSBpbjEgLSB4MSArIHkxKjAuOTk5NzsgeDEgPSBpbjE7IHkxID0geTsgb3V0MSA9IHk7XG4gIGZpbHRlciA9IG1lbW8oIGFkZCggc3ViKCBpbjEsIHgxLm91dCApLCBtdWwoIHkxLm91dCwgLjk5OTcgKSApIClcbiAgeDEuaW4oIGluMSApXG4gIHkxLmluKCBmaWx0ZXIgKVxuXG4gIHJldHVybiBmaWx0ZXJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHQ2MCAgICAgPSByZXF1aXJlKCAnLi90NjAuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwLCBwcm9wcyApID0+IHtcbiAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCB7IGluaXRWYWx1ZToxIH0sIHByb3BzICksXG4gICAgICBzc2QgPSBoaXN0b3J5ICggcHJvcGVydGllcy5pbml0VmFsdWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAoIGRlY2F5VGltZSApICkgKVxuXG4gIHNzZC5vdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNzZC52YWx1ZSA9IDFcbiAgfVxuXG4gIHJldHVybiBzc2Qub3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICApLFxuICAgICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgICBwb2tlID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgICAgc3ViICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgICksXG4gICAgICB3cmFwID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgICAgIGFjY3VtPSByZXF1aXJlKCAnLi9hY2N1bS5qcycpLFxuICAgICAgbWVtbyA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkZWxheScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpbnB1dHNbMF1cbiAgICBcbiAgICByZXR1cm4gaW5wdXRzWzBdXG4gIH0sXG59XG5cbmNvbnN0IGRlZmF1bHRzID0geyBzaXplOiA1MTIsIGludGVycDonbm9uZScgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCB0YXBzLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBsZXQgd3JpdGVJZHgsIHJlYWRJZHgsIGRlbGF5ZGF0YVxuXG4gIGlmKCBBcnJheS5pc0FycmF5KCB0YXBzICkgPT09IGZhbHNlICkgdGFwcyA9IFsgdGFwcyBdXG4gIFxuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgY29uc3QgbWF4VGFwU2l6ZSA9IE1hdGgubWF4KCAuLi50YXBzIClcbiAgaWYoIHByb3BzLnNpemUgPCBtYXhUYXBTaXplICkgcHJvcHMuc2l6ZSA9IG1heFRhcFNpemVcblxuICBkZWxheWRhdGEgPSBkYXRhKCBwcm9wcy5zaXplIClcbiAgXG4gIHVnZW4uaW5wdXRzID0gW11cblxuICB3cml0ZUlkeCA9IGFjY3VtKCAxLCAwLCB7IG1heDpwcm9wcy5zaXplLCBtaW46MCB9KVxuICBcbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0YXBzLmxlbmd0aDsgaSsrICkge1xuICAgIHVnZW4uaW5wdXRzWyBpIF0gPSBwZWVrKCBkZWxheWRhdGEsIHdyYXAoIHN1Yiggd3JpdGVJZHgsIHRhcHNbaV0gKSwgMCwgcHJvcHMuc2l6ZSApLHsgbW9kZTonc2FtcGxlcycsIGludGVycDpwcm9wcy5pbnRlcnAgfSlcbiAgfVxuICBcbiAgdWdlbi5vdXRwdXRzID0gdWdlbi5pbnB1dHMgLy8gWFhYIHVnaCwgVWdoLCBVR0ghIGJ1dCBpIGd1ZXNzIGl0IHdvcmtzLlxuXG4gIHBva2UoIGRlbGF5ZGF0YSwgaW4xLCB3cml0ZUlkeCApXG5cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke2dlbi5nZXRVSUQoKX1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCBuMSA9IGhpc3RvcnkoKVxuICAgIFxuICBuMS5pbiggaW4xIClcblxuICBsZXQgdWdlbiA9IHN1YiggaW4xLCBuMS5vdXQgKVxuICB1Z2VuLm5hbWUgPSAnZGVsdGEnK2dlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkaXYnLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PWAgIHZhciAke3RoaXMubmFtZX0gPSBgLFxuICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1sgMCBdLFxuICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgIGRpdkF0RW5kID0gZmFsc2VcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC8gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCArPSBgJHtsYXN0TnVtYmVyfSAvICR7dn1gXG4gICAgICB9XG5cbiAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnIC8gJyBcbiAgICB9KVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICguLi5hcmdzKSA9PiB7XG4gIGNvbnN0IGRpdiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIGRpdiwge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcbiAgfSlcblxuICBkaXYubmFtZSA9IGRpdi5iYXNlbmFtZSArIGRpdi5pZFxuICBcbiAgcmV0dXJuIGRpdlxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuJyApLFxuICAgIHdpbmRvd3MgPSByZXF1aXJlKCAnLi93aW5kb3dzJyApLFxuICAgIGRhdGEgICAgPSByZXF1aXJlKCAnLi9kYXRhJyApLFxuICAgIHBlZWsgICAgPSByZXF1aXJlKCAnLi9wZWVrJyApLFxuICAgIHBoYXNvciAgPSByZXF1aXJlKCAnLi9waGFzb3InICksXG4gICAgZGVmYXVsdHMgPSB7XG4gICAgICB0eXBlOid0cmlhbmd1bGFyJywgbGVuZ3RoOjEwMjQsIGFscGhhOi4xNSwgc2hpZnQ6MCwgcmV2ZXJzZTpmYWxzZSBcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvcHMgPT4ge1xuICBcbiAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgZGVmYXVsdHMsIHByb3BzIClcbiAgbGV0IGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHByb3BlcnRpZXMubGVuZ3RoIClcblxuICBsZXQgbmFtZSA9IHByb3BlcnRpZXMudHlwZSArICdfJyArIHByb3BlcnRpZXMubGVuZ3RoICsgJ18nICsgcHJvcGVydGllcy5zaGlmdCArICdfJyArIHByb3BlcnRpZXMucmV2ZXJzZSArICdfJyArIHByb3BlcnRpZXMuYWxwaGFcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gPT09ICd1bmRlZmluZWQnICkgeyBcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gd2luZG93c1sgcHJvcGVydGllcy50eXBlIF0oIHByb3BlcnRpZXMubGVuZ3RoLCBpLCBwcm9wZXJ0aWVzLmFscGhhLCBwcm9wZXJ0aWVzLnNoaWZ0IClcbiAgICB9XG5cbiAgICBpZiggcHJvcGVydGllcy5yZXZlcnNlID09PSB0cnVlICkgeyBcbiAgICAgIGJ1ZmZlci5yZXZlcnNlKClcbiAgICB9XG4gICAgZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdID0gZGF0YSggYnVmZmVyIClcbiAgfVxuXG4gIGxldCB1Z2VuID0gZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdIFxuICB1Z2VuLm5hbWUgPSAnZW52JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidlcScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gdGhpcy5pbnB1dHNbMF0gPT09IHRoaXMuaW5wdXRzWzFdID8gMSA6IGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ID09PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidleHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLmV4cCcgOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9ZXhwKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGV4cCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBleHAuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gZXhwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZmxvb3InLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICAvL2dlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmZsb29yIH0pXG5cbiAgICAgIG91dCA9IGAoICR7aW5wdXRzWzBdfSB8IDAgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gfCAwXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgZmxvb3IgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZmxvb3IuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gZmxvb3Jcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZm9sZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dFxuXG4gICAgb3V0ID0gdGhpcy5jcmVhdGVDYWxsYmFjayggaW5wdXRzWzBdLCB0aGlzLm1pbiwgdGhpcy5tYXggKSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgb3V0IF1cbiAgfSxcblxuICBjcmVhdGVDYWxsYmFjayggdiwgbG8sIGhpICkge1xuICAgIGxldCBvdXQgPVxuYCB2YXIgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHt2fSxcbiAgICAgICR7dGhpcy5uYW1lfV9yYW5nZSA9ICR7aGl9IC0gJHtsb30sXG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAwXG5cbiAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlID49ICR7aGl9KXtcbiAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlXG4gICAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlID49ICR7aGl9KXtcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9ICgoJHt0aGlzLm5hbWV9X3ZhbHVlIC0gJHtsb30pIC8gJHt0aGlzLm5hbWV9X3JhbmdlKSB8IDBcbiAgICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2UgKiAke3RoaXMubmFtZX1fbnVtV3JhcHNcbiAgICB9XG4gICAgJHt0aGlzLm5hbWV9X251bVdyYXBzKytcbiAgfSBlbHNlIGlmKCR7dGhpcy5uYW1lfV92YWx1ZSA8ICR7bG99KXtcbiAgICAke3RoaXMubmFtZX1fdmFsdWUgKz0gJHt0aGlzLm5hbWV9X3JhbmdlXG4gICAgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlIDwgJHtsb30pe1xuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gKCgke3RoaXMubmFtZX1fdmFsdWUgLSAke2xvfSkgLyAke3RoaXMubmFtZX1fcmFuZ2UtIDEpIHwgMFxuICAgICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZSAqICR7dGhpcy5uYW1lfV9udW1XcmFwc1xuICAgIH1cbiAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMtLVxuICB9XG4gIGlmKCR7dGhpcy5uYW1lfV9udW1XcmFwcyAmIDEpICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7aGl9ICsgJHtsb30gLSAke3RoaXMubmFtZX1fdmFsdWVcbmBcbiAgICByZXR1cm4gJyAnICsgb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgbWluPTAsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2dhdGUnLFxuICBjb250cm9sU3RyaW5nOm51bGwsIC8vIGluc2VydCBpbnRvIG91dHB1dCBjb2RlZ2VuIGZvciBkZXRlcm1pbmluZyBpbmRleGluZ1xuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG4gICAgXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICBcbiAgICBsZXQgbGFzdElucHV0TWVtb3J5SWR4ID0gJ21lbW9yeVsgJyArIHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAnIF0nLFxuICAgICAgICBvdXRwdXRNZW1vcnlTdGFydElkeCA9IHRoaXMubWVtb3J5Lmxhc3RJbnB1dC5pZHggKyAxLFxuICAgICAgICBpbnB1dFNpZ25hbCA9IGlucHV0c1swXSxcbiAgICAgICAgY29udHJvbFNpZ25hbCA9IGlucHV0c1sxXVxuICAgIFxuICAgIC8qIFxuICAgICAqIHdlIGNoZWNrIHRvIHNlZSBpZiB0aGUgY3VycmVudCBjb250cm9sIGlucHV0cyBlcXVhbHMgb3VyIGxhc3QgaW5wdXRcbiAgICAgKiBpZiBzbywgd2Ugc3RvcmUgdGhlIHNpZ25hbCBpbnB1dCBpbiB0aGUgbWVtb3J5IGFzc29jaWF0ZWQgd2l0aCB0aGUgY3VycmVudGx5XG4gICAgICogc2VsZWN0ZWQgaW5kZXguIElmIG5vdCwgd2UgcHV0IDAgaW4gdGhlIG1lbW9yeSBhc3NvY2lhdGVkIHdpdGggdGhlIGxhc3Qgc2VsZWN0ZWQgaW5kZXgsXG4gICAgICogY2hhbmdlIHRoZSBzZWxlY3RlZCBpbmRleCwgYW5kIHRoZW4gc3RvcmUgdGhlIHNpZ25hbCBpbiBwdXQgaW4gdGhlIG1lbWVyeSBhc3NvaWNhdGVkXG4gICAgICogd2l0aCB0aGUgbmV3bHkgc2VsZWN0ZWQgaW5kZXhcbiAgICAgKi9cbiAgICBcbiAgICBvdXQgPVxuXG5gIGlmKCAke2NvbnRyb2xTaWduYWx9ICE9PSAke2xhc3RJbnB1dE1lbW9yeUlkeH0gKSB7XG4gICAgbWVtb3J5WyAke2xhc3RJbnB1dE1lbW9yeUlkeH0gKyAke291dHB1dE1lbW9yeVN0YXJ0SWR4fSAgXSA9IDAgXG4gICAgJHtsYXN0SW5wdXRNZW1vcnlJZHh9ID0gJHtjb250cm9sU2lnbmFsfVxuICB9XG4gIG1lbW9yeVsgJHtvdXRwdXRNZW1vcnlTdGFydElkeH0gKyAke2NvbnRyb2xTaWduYWx9IF0gPSAke2lucHV0U2lnbmFsfVxuXG5gXG4gICAgdGhpcy5jb250cm9sU3RyaW5nID0gaW5wdXRzWzFdXG4gICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgdGhpcy5vdXRwdXRzLmZvckVhY2goIHYgPT4gdi5nZW4oKSApXG5cbiAgICByZXR1cm4gWyBudWxsLCAnICcgKyBvdXQgXVxuICB9LFxuXG4gIGNoaWxkZ2VuKCkge1xuICAgIGlmKCB0aGlzLnBhcmVudC5pbml0aWFsaXplZCA9PT0gZmFsc2UgKSB7XG4gICAgICBnZW4uZ2V0SW5wdXRzKCB0aGlzICkgLy8gcGFyZW50IGdhdGUgaXMgb25seSBpbnB1dCBvZiBhIGdhdGUgb3V0cHV0LCBzaG91bGQgb25seSBiZSBnZW4nZCBvbmNlLlxuICAgIH1cblxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG5cbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGBtZW1vcnlbICR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fSBdYFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gIGBtZW1vcnlbICR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fSBdYFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjb3VudDogMiB9XG5cbiAgaWYoIHR5cGVvZiBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIG91dHB1dHM6IFtdLFxuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGluMSwgY29udHJvbCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgbGFzdElucHV0OiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgfSxcbiAgICBpbml0aWFsaXplZDpmYWxzZVxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7Z2VuLmdldFVJRCgpfWBcblxuICBmb3IoIGxldCBpID0gMDsgaSA8IHVnZW4uY291bnQ7IGkrKyApIHtcbiAgICB1Z2VuLm91dHB1dHMucHVzaCh7XG4gICAgICBpbmRleDppLFxuICAgICAgZ2VuOiBwcm90by5jaGlsZGdlbixcbiAgICAgIHBhcmVudDp1Z2VuLFxuICAgICAgaW5wdXRzOiBbIHVnZW4gXSxcbiAgICAgIG1lbW9yeToge1xuICAgICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgICAgfSxcbiAgICAgIGluaXRpYWxpemVkOmZhbHNlLFxuICAgICAgbmFtZTogYCR7dWdlbi5uYW1lfV9vdXQke2dlbi5nZXRVSUQoKX1gXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuLyogZ2VuLmpzXG4gKlxuICogbG93LWxldmVsIGNvZGUgZ2VuZXJhdGlvbiBmb3IgdW5pdCBnZW5lcmF0b3JzXG4gKlxuICovXG5cbmxldCBNZW1vcnlIZWxwZXIgPSByZXF1aXJlKCAnbWVtb3J5LWhlbHBlcicgKVxuXG5sZXQgZ2VuID0ge1xuXG4gIGFjY3VtOjAsXG4gIGdldFVJRCgpIHsgcmV0dXJuIHRoaXMuYWNjdW0rKyB9LFxuICBkZWJ1ZzpmYWxzZSxcbiAgc2FtcGxlcmF0ZTogNDQxMDAsIC8vIGNoYW5nZSBvbiBhdWRpb2NvbnRleHQgY3JlYXRpb25cbiAgc2hvdWxkTG9jYWxpemU6IGZhbHNlLFxuICBnbG9iYWxzOntcbiAgICB3aW5kb3dzOiB7fSxcbiAgfSxcbiAgbW9kZTond29ya2xldCcsXG4gIFxuICAvKiBjbG9zdXJlc1xuICAgKlxuICAgKiBGdW5jdGlvbnMgdGhhdCBhcmUgaW5jbHVkZWQgYXMgYXJndW1lbnRzIHRvIG1hc3RlciBjYWxsYmFjay4gRXhhbXBsZXM6IE1hdGguYWJzLCBNYXRoLnJhbmRvbSBldGMuXG4gICAqIFhYWCBTaG91bGQgcHJvYmFibHkgYmUgcmVuYW1lZCBjYWxsYmFja1Byb3BlcnRpZXMgb3Igc29tZXRoaW5nIHNpbWlsYXIuLi4gY2xvc3VyZXMgYXJlIG5vIGxvbmdlciB1c2VkLlxuICAgKi9cblxuICBjbG9zdXJlczogbmV3IFNldCgpLFxuICBwYXJhbXM6ICAgbmV3IFNldCgpLFxuICBpbnB1dHM6ICAgbmV3IFNldCgpLFxuXG4gIHBhcmFtZXRlcnM6IG5ldyBTZXQoKSxcbiAgZW5kQmxvY2s6IG5ldyBTZXQoKSxcbiAgaGlzdG9yaWVzOiBuZXcgTWFwKCksXG5cbiAgbWVtbzoge30sXG5cbiAgLy9kYXRhOiB7fSxcbiAgXG4gIC8qIGV4cG9ydFxuICAgKlxuICAgKiBwbGFjZSBnZW4gZnVuY3Rpb25zIGludG8gYW5vdGhlciBvYmplY3QgZm9yIGVhc2llciByZWZlcmVuY2VcbiAgICovXG5cbiAgZXhwb3J0KCBvYmogKSB7fSxcblxuICBhZGRUb0VuZEJsb2NrKCB2ICkge1xuICAgIHRoaXMuZW5kQmxvY2suYWRkKCAnICAnICsgdiApXG4gIH0sXG4gIFxuICByZXF1ZXN0TWVtb3J5KCBtZW1vcnlTcGVjLCBpbW11dGFibGU9ZmFsc2UgKSB7XG4gICAgZm9yKCBsZXQga2V5IGluIG1lbW9yeVNwZWMgKSB7XG4gICAgICBsZXQgcmVxdWVzdCA9IG1lbW9yeVNwZWNbIGtleSBdXG5cbiAgICAgIC8vY29uc29sZS5sb2coICdyZXF1ZXN0aW5nICcgKyBrZXkgKyAnOicgLCBKU09OLnN0cmluZ2lmeSggcmVxdWVzdCApIClcblxuICAgICAgaWYoIHJlcXVlc3QubGVuZ3RoID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCAndW5kZWZpbmVkIGxlbmd0aCBmb3I6Jywga2V5IClcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmlkeCA9IGdlbi5tZW1vcnkuYWxsb2MoIHJlcXVlc3QubGVuZ3RoLCBpbW11dGFibGUgKVxuICAgIH1cbiAgfSxcblxuICBjcmVhdGVNZW1vcnkoIGFtb3VudCwgdHlwZSApIHtcbiAgICBjb25zdCBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCBtZW0sIHR5cGUgKVxuICB9LFxuXG4gIC8qIGNyZWF0ZUNhbGxiYWNrXG4gICAqXG4gICAqIHBhcmFtIHVnZW4gLSBIZWFkIG9mIGdyYXBoIHRvIGJlIGNvZGVnZW4nZFxuICAgKlxuICAgKiBHZW5lcmF0ZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVnZW4gZ3JhcGguXG4gICAqIFRoZSBnZW4uY2xvc3VyZXMgcHJvcGVydHkgc3RvcmVzIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmVcbiAgICogcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZmluYWwgZnVuY3Rpb247IHRoZXNlIGFyZSBwcmVmaXhlZFxuICAgKiBiZWZvcmUgYW55IGRlZmluZWQgcGFyYW1zIHRoZSBncmFwaCBleHBvc2VzLiBGb3IgZXhhbXBsZSwgZ2l2ZW46XG4gICAqXG4gICAqIGdlbi5jcmVhdGVDYWxsYmFjayggYWJzKCBwYXJhbSgpICkgKVxuICAgKlxuICAgKiAuLi4gdGhlIGdlbmVyYXRlZCBmdW5jdGlvbiB3aWxsIGhhdmUgYSBzaWduYXR1cmUgb2YgKCBhYnMsIHAwICkuXG4gICAqL1xuICBcbiAgY3JlYXRlQ2FsbGJhY2soIHVnZW4sIG1lbSwgZGVidWcgPSBmYWxzZSwgc2hvdWxkSW5saW5lTWVtb3J5PWZhbHNlLCBtZW1UeXBlID0gRmxvYXQ2NEFycmF5ICkge1xuICAgIGxldCBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIHVnZW4gKSAmJiB1Z2VuLmxlbmd0aCA+IDEsXG4gICAgICAgIGNhbGxiYWNrLCBcbiAgICAgICAgY2hhbm5lbDEsIGNoYW5uZWwyXG5cbiAgICBpZiggdHlwZW9mIG1lbSA9PT0gJ251bWJlcicgfHwgbWVtID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCBtZW0sIG1lbVR5cGUgKVxuICAgIH1cbiAgICBcbiAgICAvL2NvbnNvbGUubG9nKCAnY2IgbWVtb3J5OicsIG1lbSApXG4gICAgdGhpcy5tZW1vcnkgPSBtZW1cbiAgICB0aGlzLm91dHB1dElkeCA9IHRoaXMubWVtb3J5LmFsbG9jKCAyLCB0cnVlIClcbiAgICB0aGlzLm1lbW8gPSB7fSBcbiAgICB0aGlzLmVuZEJsb2NrLmNsZWFyKClcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKClcbiAgICB0aGlzLmlucHV0cy5jbGVhcigpXG4gICAgdGhpcy5wYXJhbXMuY2xlYXIoKVxuICAgIC8vdGhpcy5nbG9iYWxzID0geyB3aW5kb3dzOnt9IH1cbiAgICBcbiAgICB0aGlzLnBhcmFtZXRlcnMuY2xlYXIoKVxuICAgIFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gXCIgICd1c2Ugc3RyaWN0J1xcblwiXG4gICAgaWYoIHNob3VsZElubGluZU1lbW9yeT09PWZhbHNlICkge1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gdGhpcy5tb2RlID09PSAnd29ya2xldCcgPyBcbiAgICAgICAgXCIgIHZhciBtZW1vcnkgPSB0aGlzLm1lbW9yeVxcblxcblwiIDpcbiAgICAgICAgXCIgIHZhciBtZW1vcnkgPSBnZW4ubWVtb3J5XFxuXFxuXCJcbiAgICB9XG5cbiAgICAvLyBjYWxsIC5nZW4oKSBvbiB0aGUgaGVhZCBvZiB0aGUgZ3JhcGggd2UgYXJlIGdlbmVyYXRpbmcgdGhlIGNhbGxiYWNrIGZvclxuICAgIC8vY29uc29sZS5sb2coICdIRUFEJywgdWdlbiApXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxICsgaXNTdGVyZW87IGkrKyApIHtcbiAgICAgIGlmKCB0eXBlb2YgdWdlbltpXSA9PT0gJ251bWJlcicgKSBjb250aW51ZVxuXG4gICAgICAvL2xldCBjaGFubmVsID0gaXNTdGVyZW8gPyB1Z2VuW2ldLmdlbigpIDogdWdlbi5nZW4oKSxcbiAgICAgIGxldCBjaGFubmVsID0gaXNTdGVyZW8gPyB0aGlzLmdldElucHV0KCB1Z2VuW2ldICkgOiB0aGlzLmdldElucHV0KCB1Z2VuICksIFxuICAgICAgICAgIGJvZHkgPSAnJ1xuXG4gICAgICAvLyBpZiAuZ2VuKCkgcmV0dXJucyBhcnJheSwgYWRkIHVnZW4gY2FsbGJhY2sgKGdyYXBoT3V0cHV0WzFdKSB0byBvdXIgb3V0cHV0IGZ1bmN0aW9ucyBib2R5XG4gICAgICAvLyBhbmQgdGhlbiByZXR1cm4gbmFtZSBvZiB1Z2VuLiBJZiAuZ2VuKCkgb25seSBnZW5lcmF0ZXMgYSBudW1iZXIgKGZvciByZWFsbHkgc2ltcGxlIGdyYXBocylcbiAgICAgIC8vIGp1c3QgcmV0dXJuIHRoYXQgbnVtYmVyIChncmFwaE91dHB1dFswXSkuXG4gICAgICBib2R5ICs9IEFycmF5LmlzQXJyYXkoIGNoYW5uZWwgKSA/IGNoYW5uZWxbMV0gKyAnXFxuJyArIGNoYW5uZWxbMF0gOiBjaGFubmVsXG5cbiAgICAgIC8vIHNwbGl0IGJvZHkgdG8gaW5qZWN0IHJldHVybiBrZXl3b3JkIG9uIGxhc3QgbGluZVxuICAgICAgYm9keSA9IGJvZHkuc3BsaXQoJ1xcbicpXG4gICAgIFxuICAgICAgLy9pZiggZGVidWcgKSBjb25zb2xlLmxvZyggJ2Z1bmN0aW9uQm9keSBsZW5ndGgnLCBib2R5IClcbiAgICAgIFxuICAgICAgLy8gbmV4dCBsaW5lIGlzIHRvIGFjY29tbW9kYXRlIG1lbW8gYXMgZ3JhcGggaGVhZFxuICAgICAgaWYoIGJvZHlbIGJvZHkubGVuZ3RoIC0xIF0udHJpbSgpLmluZGV4T2YoJ2xldCcpID4gLTEgKSB7IGJvZHkucHVzaCggJ1xcbicgKSB9IFxuXG4gICAgICAvLyBnZXQgaW5kZXggb2YgbGFzdCBsaW5lXG4gICAgICBsZXQgbGFzdGlkeCA9IGJvZHkubGVuZ3RoIC0gMVxuXG4gICAgICAvLyBpbnNlcnQgcmV0dXJuIGtleXdvcmRcbiAgICAgIGJvZHlbIGxhc3RpZHggXSA9ICcgIG1lbW9yeVsnICsgKHRoaXMub3V0cHV0SWR4ICsgaSkgKyAnXSAgPSAnICsgYm9keVsgbGFzdGlkeCBdICsgJ1xcbidcblxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgKz0gYm9keS5qb2luKCdcXG4nKVxuICAgIH1cbiAgICBcbiAgICB0aGlzLmhpc3Rvcmllcy5mb3JFYWNoKCB2YWx1ZSA9PiB7XG4gICAgICBpZiggdmFsdWUgIT09IG51bGwgKVxuICAgICAgICB2YWx1ZS5nZW4oKSAgICAgIFxuICAgIH0pXG5cbiAgICBjb25zdCByZXR1cm5TdGF0ZW1lbnQgPSBpc1N0ZXJlbyA/IGAgIHJldHVybiBbIG1lbW9yeVske3RoaXMub3V0cHV0SWR4fV0sIG1lbW9yeVske3RoaXMub3V0cHV0SWR4ICsgMX1dIF1gIDogYCAgcmV0dXJuIG1lbW9yeVske3RoaXMub3V0cHV0SWR4fV1gXG4gICAgXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5zcGxpdCgnXFxuJylcblxuICAgIGlmKCB0aGlzLmVuZEJsb2NrLnNpemUgKSB7IFxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5jb25jYXQoIEFycmF5LmZyb20oIHRoaXMuZW5kQmxvY2sgKSApXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keS5wdXNoKCByZXR1cm5TdGF0ZW1lbnQgKVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAgICB9XG4gICAgLy8gcmVhc3NlbWJsZSBmdW5jdGlvbiBib2R5XG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKVxuXG4gICAgLy8gd2UgY2FuIG9ubHkgZHluYW1pY2FsbHkgY3JlYXRlIGEgbmFtZWQgZnVuY3Rpb24gYnkgZHluYW1pY2FsbHkgY3JlYXRpbmcgYW5vdGhlciBmdW5jdGlvblxuICAgIC8vIHRvIGNvbnN0cnVjdCB0aGUgbmFtZWQgZnVuY3Rpb24hIHNoZWVzaC4uLlxuICAgIC8vXG4gICAgaWYoIHNob3VsZElubGluZU1lbW9yeSA9PT0gdHJ1ZSApIHtcbiAgICAgIHRoaXMucGFyYW1ldGVycy5hZGQoICdtZW1vcnknIClcbiAgICB9XG5cbiAgICBsZXQgcGFyYW1TdHJpbmcgPSAnJ1xuICAgIGlmKCB0aGlzLm1vZGUgPT09ICd3b3JrbGV0JyApIHtcbiAgICAgIGZvciggbGV0IG5hbWUgb2YgdGhpcy5wYXJhbWV0ZXJzLnZhbHVlcygpICkge1xuICAgICAgICBwYXJhbVN0cmluZyArPSBuYW1lICsgJywnXG4gICAgICB9XG4gICAgICBwYXJhbVN0cmluZyA9IHBhcmFtU3RyaW5nLnNsaWNlKDAsLTEpXG4gICAgfVxuXG4gICAgY29uc3Qgc2VwYXJhdG9yID0gdGhpcy5wYXJhbWV0ZXJzLnNpemUgIT09IDAgJiYgdGhpcy5pbnB1dHMuc2l6ZSA+IDAgPyAnLCAnIDogJydcblxuICAgIGxldCBpbnB1dFN0cmluZyA9ICcnXG4gICAgaWYoIHRoaXMubW9kZSA9PT0gJ3dvcmtsZXQnICkge1xuICAgICAgZm9yKCBsZXQgdWdlbiBvZiB0aGlzLmlucHV0cy52YWx1ZXMoKSApIHtcbiAgICAgICAgaW5wdXRTdHJpbmcgKz0gdWdlbi5uYW1lICsgJywnXG4gICAgICB9XG4gICAgICBpbnB1dFN0cmluZyA9IGlucHV0U3RyaW5nLnNsaWNlKDAsLTEpXG4gICAgfVxuXG4gICAgbGV0IGJ1aWxkU3RyaW5nID0gdGhpcy5tb2RlID09PSAnd29ya2xldCdcbiAgICAgID8gYHJldHVybiBmdW5jdGlvbiggJHtpbnB1dFN0cmluZ30gJHtzZXBhcmF0b3J9ICR7cGFyYW1TdHJpbmd9ICl7IFxcbiR7IHRoaXMuZnVuY3Rpb25Cb2R5IH1cXG59YFxuICAgICAgOiBgcmV0dXJuIGZ1bmN0aW9uIGdlbiggJHsgWy4uLnRoaXMucGFyYW1ldGVyc10uam9pbignLCcpIH0gKXsgXFxuJHsgdGhpcy5mdW5jdGlvbkJvZHkgfVxcbn1gXG4gICAgXG4gICAgaWYoIHRoaXMuZGVidWcgfHwgZGVidWcgKSBjb25zb2xlLmxvZyggYnVpbGRTdHJpbmcgKSBcblxuICAgIGNhbGxiYWNrID0gbmV3IEZ1bmN0aW9uKCBidWlsZFN0cmluZyApKClcblxuICAgIC8vIGFzc2lnbiBwcm9wZXJ0aWVzIHRvIG5hbWVkIGZ1bmN0aW9uXG4gICAgZm9yKCBsZXQgZGljdCBvZiB0aGlzLmNsb3N1cmVzLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHZhbHVlID0gZGljdFsgbmFtZSBdXG5cbiAgICAgIGNhbGxiYWNrWyBuYW1lIF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5wYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICBsZXQgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgdWdlbiA9IGRpY3RbIG5hbWUgXVxuICAgICAgXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGNhbGxiYWNrLCBuYW1lLCB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0KCkgeyByZXR1cm4gdWdlbi52YWx1ZSB9LFxuICAgICAgICBzZXQodil7IHVnZW4udmFsdWUgPSB2IH1cbiAgICAgIH0pXG4gICAgICAvL2NhbGxiYWNrWyBuYW1lIF0gPSB2YWx1ZVxuICAgIH1cblxuICAgIGNhbGxiYWNrLm1lbWJlcnMgPSB0aGlzLmNsb3N1cmVzXG4gICAgY2FsbGJhY2suZGF0YSA9IHRoaXMuZGF0YVxuICAgIGNhbGxiYWNrLnBhcmFtcyA9IHRoaXMucGFyYW1zXG4gICAgY2FsbGJhY2suaW5wdXRzID0gdGhpcy5pbnB1dHNcbiAgICBjYWxsYmFjay5wYXJhbWV0ZXJzID0gdGhpcy5wYXJhbWV0ZXJzLy8uc2xpY2UoIDAgKVxuICAgIGNhbGxiYWNrLmlzU3RlcmVvID0gaXNTdGVyZW9cblxuICAgIC8vaWYoIE1lbW9yeUhlbHBlci5pc1Byb3RvdHlwZU9mKCB0aGlzLm1lbW9yeSApICkgXG4gICAgY2FsbGJhY2subWVtb3J5ID0gdGhpcy5tZW1vcnkuaGVhcFxuXG4gICAgdGhpcy5oaXN0b3JpZXMuY2xlYXIoKVxuXG4gICAgcmV0dXJuIGNhbGxiYWNrXG4gIH0sXG4gIFxuICAvKiBnZXRJbnB1dHNcbiAgICpcbiAgICogQ2FsbGVkIGJ5IGVhY2ggaW5kaXZpZHVhbCB1Z2VuIHdoZW4gdGhlaXIgLmdlbigpIG1ldGhvZCBpcyBjYWxsZWQgdG8gcmVzb2x2ZSB0aGVpciB2YXJpb3VzIGlucHV0cy5cbiAgICogSWYgYW4gaW5wdXQgaXMgYSBudW1iZXIsIHJldHVybiB0aGUgbnVtYmVyLiBJZlxuICAgKiBpdCBpcyBhbiB1Z2VuLCBjYWxsIC5nZW4oKSBvbiB0aGUgdWdlbiwgbWVtb2l6ZSB0aGUgcmVzdWx0IGFuZCByZXR1cm4gdGhlIHJlc3VsdC4gSWYgdGhlXG4gICAqIHVnZW4gaGFzIHByZXZpb3VzbHkgYmVlbiBtZW1vaXplZCByZXR1cm4gdGhlIG1lbW9pemVkIHZhbHVlLlxuICAgKlxuICAgKi9cbiAgZ2V0SW5wdXRzKCB1Z2VuICkge1xuICAgIHJldHVybiB1Z2VuLmlucHV0cy5tYXAoIGdlbi5nZXRJbnB1dCApIFxuICB9LFxuXG4gIGdldElucHV0KCBpbnB1dCApIHtcbiAgICBsZXQgaXNPYmplY3QgPSB0eXBlb2YgaW5wdXQgPT09ICdvYmplY3QnLFxuICAgICAgICBwcm9jZXNzZWRJbnB1dFxuXG4gICAgaWYoIGlzT2JqZWN0ICkgeyAvLyBpZiBpbnB1dCBpcyBhIHVnZW4uLi4gXG4gICAgICAvL2NvbnNvbGUubG9nKCBpbnB1dC5uYW1lLCBnZW4ubWVtb1sgaW5wdXQubmFtZSBdIClcbiAgICAgIGlmKCBnZW4ubWVtb1sgaW5wdXQubmFtZSBdICkgeyAvLyBpZiBpdCBoYXMgYmVlbiBtZW1vaXplZC4uLlxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGdlbi5tZW1vWyBpbnB1dC5uYW1lIF1cbiAgICAgIH1lbHNlIGlmKCBBcnJheS5pc0FycmF5KCBpbnB1dCApICkge1xuICAgICAgICBnZW4uZ2V0SW5wdXQoIGlucHV0WzBdIClcbiAgICAgICAgZ2VuLmdldElucHV0KCBpbnB1dFsxXSApXG4gICAgICB9ZWxzZXsgLy8gaWYgbm90IG1lbW9pemVkIGdlbmVyYXRlIGNvZGUgIFxuICAgICAgICBpZiggdHlwZW9mIGlucHV0LmdlbiAhPT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ25vIGdlbiBmb3VuZDonLCBpbnB1dCwgaW5wdXQuZ2VuIClcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29kZSA9IGlucHV0LmdlbigpXG4gICAgICAgIC8vaWYoIGNvZGUuaW5kZXhPZiggJ09iamVjdCcgKSA+IC0xICkgY29uc29sZS5sb2coICdiYWQgaW5wdXQ6JywgaW5wdXQsIGNvZGUgKVxuICAgICAgICBcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGNvZGUgKSApIHtcbiAgICAgICAgICBpZiggIWdlbi5zaG91bGRMb2NhbGl6ZSApIHtcbiAgICAgICAgICAgIGdlbi5mdW5jdGlvbkJvZHkgKz0gY29kZVsxXVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZ2VuLmNvZGVOYW1lID0gY29kZVswXVxuICAgICAgICAgICAgZ2VuLmxvY2FsaXplZENvZGUucHVzaCggY29kZVsxXSApXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vY29uc29sZS5sb2coICdhZnRlciBHRU4nICwgdGhpcy5mdW5jdGlvbkJvZHkgKVxuICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVswXVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGNvZGVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1lbHNleyAvLyBpdCBpbnB1dCBpcyBhIG51bWJlclxuICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBpbnB1dFxuICAgIH1cblxuICAgIHJldHVybiBwcm9jZXNzZWRJbnB1dFxuICB9LFxuXG4gIHN0YXJ0TG9jYWxpemUoKSB7XG4gICAgdGhpcy5sb2NhbGl6ZWRDb2RlID0gW11cbiAgICB0aGlzLnNob3VsZExvY2FsaXplID0gdHJ1ZVxuICB9LFxuICBlbmRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLnNob3VsZExvY2FsaXplID0gZmFsc2VcblxuICAgIHJldHVybiBbIHRoaXMuY29kZU5hbWUsIHRoaXMubG9jYWxpemVkQ29kZS5zbGljZSgwKSBdXG4gIH0sXG5cbiAgZnJlZSggZ3JhcGggKSB7XG4gICAgaWYoIEFycmF5LmlzQXJyYXkoIGdyYXBoICkgKSB7IC8vIHN0ZXJlbyB1Z2VuXG4gICAgICBmb3IoIGxldCBjaGFubmVsIG9mIGdyYXBoICkge1xuICAgICAgICB0aGlzLmZyZWUoIGNoYW5uZWwgKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdHlwZW9mIGdyYXBoID09PSAnb2JqZWN0JyApIHtcbiAgICAgICAgaWYoIGdyYXBoLm1lbW9yeSAhPT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIGZvciggbGV0IG1lbW9yeUtleSBpbiBncmFwaC5tZW1vcnkgKSB7XG4gICAgICAgICAgICB0aGlzLm1lbW9yeS5mcmVlKCBncmFwaC5tZW1vcnlbIG1lbW9yeUtleSBdLmlkeCApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmKCBBcnJheS5pc0FycmF5KCBncmFwaC5pbnB1dHMgKSApIHtcbiAgICAgICAgICBmb3IoIGxldCB1Z2VuIG9mIGdyYXBoLmlucHV0cyApIHtcbiAgICAgICAgICAgIHRoaXMuZnJlZSggdWdlbiApXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2VuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2d0JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0pIHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID4gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3QuaW5wdXRzID0gWyB4LHkgXVxuICBndC5uYW1lID0gZ3QuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0ZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPj0gJHtpbnB1dHNbMV19IHwgMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgKz0gaW5wdXRzWzBdID49IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cbiAgZ3QubmFtZSA9ICdndGUnICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgPSBgKCR7aW5wdXRzWyAwIF19ICogKCAoICR7aW5wdXRzWzBdfSA+ICR7aW5wdXRzWzFdfSApIHwgMCApIClgIFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBpbnB1dHNbMF0gKiAoICggaW5wdXRzWzBdID4gaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3RwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGd0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xPTAgKSA9PiB7XG4gIGxldCB1Z2VuID0ge1xuICAgIGlucHV0czogWyBpbjEgXSxcbiAgICBtZW1vcnk6IHsgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IH0sXG4gICAgcmVjb3JkZXI6IG51bGwsXG5cbiAgICBpbiggdiApIHtcbiAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmhhcyggdiApICl7XG4gICAgICAgIGxldCBtZW1vSGlzdG9yeSA9IGdlbi5oaXN0b3JpZXMuZ2V0KCB2IClcbiAgICAgICAgdWdlbi5uYW1lID0gbWVtb0hpc3RvcnkubmFtZVxuICAgICAgICByZXR1cm4gbWVtb0hpc3RvcnlcbiAgICAgIH1cblxuICAgICAgbGV0IG9iaiA9IHtcbiAgICAgICAgZ2VuKCkge1xuICAgICAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB1Z2VuIClcblxuICAgICAgICAgIGlmKCB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IGluMVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGxldCBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHhcbiAgICAgICAgICBcbiAgICAgICAgICBnZW4uYWRkVG9FbmRCbG9jayggJ21lbW9yeVsgJyArIGlkeCArICcgXSA9ICcgKyBpbnB1dHNbIDAgXSApXG4gICAgICAgICAgXG4gICAgICAgICAgLy8gcmV0dXJuIHVnZW4gdGhhdCBpcyBiZWluZyByZWNvcmRlZCBpbnN0ZWFkIG9mIHNzZC5cbiAgICAgICAgICAvLyB0aGlzIGVmZmVjdGl2ZWx5IG1ha2VzIGEgY2FsbCB0byBzc2QucmVjb3JkKCkgdHJhbnNwYXJlbnQgdG8gdGhlIGdyYXBoLlxuICAgICAgICAgIC8vIHJlY29yZGluZyBpcyB0cmlnZ2VyZWQgYnkgcHJpb3IgY2FsbCB0byBnZW4uYWRkVG9FbmRCbG9jay5cbiAgICAgICAgICBnZW4uaGlzdG9yaWVzLnNldCggdiwgb2JqIClcblxuICAgICAgICAgIHJldHVybiBpbnB1dHNbIDAgXVxuICAgICAgICB9LFxuICAgICAgICBuYW1lOiB1Z2VuLm5hbWUgKyAnX2luJytnZW4uZ2V0VUlEKCksXG4gICAgICAgIG1lbW9yeTogdWdlbi5tZW1vcnlcbiAgICAgIH1cblxuICAgICAgdGhpcy5pbnB1dHNbIDAgXSA9IHZcbiAgICAgIFxuICAgICAgdWdlbi5yZWNvcmRlciA9IG9ialxuXG4gICAgICByZXR1cm4gb2JqXG4gICAgfSxcbiAgICBcbiAgICBvdXQ6IHtcbiAgICAgICAgICAgIFxuICAgICAgZ2VuKCkge1xuICAgICAgICBpZiggdWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgIGlmKCBnZW4uaGlzdG9yaWVzLmdldCggdWdlbi5pbnB1dHNbMF0gKSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4uaW5wdXRzWzBdLCB1Z2VuLnJlY29yZGVyIClcbiAgICAgICAgICB9XG4gICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gcGFyc2VGbG9hdCggaW4xIClcbiAgICAgICAgfVxuICAgICAgICBsZXQgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4XG4gICAgICAgICBcbiAgICAgICAgcmV0dXJuICdtZW1vcnlbICcgKyBpZHggKyAnIF0gJ1xuICAgICAgfSxcbiAgICB9LFxuXG4gICAgdWlkOiBnZW4uZ2V0VUlEKCksXG4gIH1cbiAgXG4gIHVnZW4ub3V0Lm1lbW9yeSA9IHVnZW4ubWVtb3J5IFxuXG4gIHVnZW4ubmFtZSA9ICdoaXN0b3J5JyArIHVnZW4udWlkXG4gIHVnZW4ub3V0Lm5hbWUgPSB1Z2VuLm5hbWUgKyAnX291dCdcbiAgdWdlbi5pbi5fbmFtZSAgPSB1Z2VuLm5hbWUgPSAnX2luJ1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2lmZWxzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb25kaXRpb25hbHMgPSB0aGlzLmlucHV0c1swXSxcbiAgICAgICAgZGVmYXVsdFZhbHVlID0gZ2VuLmdldElucHV0KCBjb25kaXRpb25hbHNbIGNvbmRpdGlvbmFscy5sZW5ndGggLSAxXSApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7ZGVmYXVsdFZhbHVlfVxcbmAgXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnY29uZGl0aW9uYWxzOicsIHRoaXMubmFtZSwgY29uZGl0aW9uYWxzIClcblxuICAgIC8vY29uc29sZS5sb2coICdkZWZhdWx0VmFsdWU6JywgZGVmYXVsdFZhbHVlIClcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgY29uZGl0aW9uYWxzLmxlbmd0aCAtIDI7IGkrPSAyICkge1xuICAgICAgbGV0IGlzRW5kQmxvY2sgPSBpID09PSBjb25kaXRpb25hbHMubGVuZ3RoIC0gMyxcbiAgICAgICAgICBjb25kICA9IGdlbi5nZXRJbnB1dCggY29uZGl0aW9uYWxzWyBpIF0gKSxcbiAgICAgICAgICBwcmVibG9jayA9IGNvbmRpdGlvbmFsc1sgaSsxIF0sXG4gICAgICAgICAgYmxvY2ssIGJsb2NrTmFtZSwgb3V0cHV0XG5cbiAgICAgIC8vY29uc29sZS5sb2coICdwYicsIHByZWJsb2NrIClcblxuICAgICAgaWYoIHR5cGVvZiBwcmVibG9jayA9PT0gJ251bWJlcicgKXtcbiAgICAgICAgYmxvY2sgPSBwcmVibG9ja1xuICAgICAgICBibG9ja05hbWUgPSBudWxsXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWYoIGdlbi5tZW1vWyBwcmVibG9jay5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAvLyB1c2VkIHRvIHBsYWNlIGFsbCBjb2RlIGRlcGVuZGVuY2llcyBpbiBhcHByb3ByaWF0ZSBibG9ja3NcbiAgICAgICAgICBnZW4uc3RhcnRMb2NhbGl6ZSgpXG5cbiAgICAgICAgICBnZW4uZ2V0SW5wdXQoIHByZWJsb2NrIClcblxuICAgICAgICAgIGJsb2NrID0gZ2VuLmVuZExvY2FsaXplKClcbiAgICAgICAgICBibG9ja05hbWUgPSBibG9ja1swXVxuICAgICAgICAgIGJsb2NrID0gYmxvY2tbIDEgXS5qb2luKCcnKVxuICAgICAgICAgIGJsb2NrID0gJyAgJyArIGJsb2NrLnJlcGxhY2UoIC9cXG4vZ2ksICdcXG4gICcgKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBibG9jayA9ICcnXG4gICAgICAgICAgYmxvY2tOYW1lID0gZ2VuLm1lbW9bIHByZWJsb2NrLm5hbWUgXVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG91dHB1dCA9IGJsb2NrTmFtZSA9PT0gbnVsbCA/IFxuICAgICAgICBgICAke3RoaXMubmFtZX1fb3V0ID0gJHtibG9ja31gIDpcbiAgICAgICAgYCR7YmxvY2t9ICAke3RoaXMubmFtZX1fb3V0ID0gJHtibG9ja05hbWV9YFxuICAgICAgXG4gICAgICBpZiggaT09PTAgKSBvdXQgKz0gJyAnXG4gICAgICBvdXQgKz0gXG5gIGlmKCAke2NvbmR9ID09PSAxICkge1xuJHtvdXRwdXR9XG4gIH1gXG5cbiAgICAgIGlmKCAhaXNFbmRCbG9jayApIHtcbiAgICAgICAgb3V0ICs9IGAgZWxzZWBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYFxcbmBcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9X291dGBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1fb3V0YCwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyAgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGNvbmRpdGlvbnMgPSBBcnJheS5pc0FycmF5KCBhcmdzWzBdICkgPyBhcmdzWzBdIDogYXJnc1xuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBjb25kaXRpb25zIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonaW4nLFxuXG4gIGdlbigpIHtcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG5cbiAgICBpZiggaXNXb3JrbGV0ICkge1xuICAgICAgZ2VuLmlucHV0cy5hZGQoIHRoaXMgKVxuICAgIH1lbHNle1xuICAgICAgZ2VuLnBhcmFtZXRlcnMuYWRkKCB0aGlzLm5hbWUgKVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlzV29ya2xldCA/IHRoaXMubmFtZSArICdbaV0nIDogdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBuYW1lLCBpbnB1dE51bWJlcj0wLCBjaGFubmVsTnVtYmVyPTAsIGRlZmF1bHRWYWx1ZT0wLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCBpbnB1dCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBpbnB1dC5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIGlucHV0Lm5hbWUgPSBuYW1lICE9PSB1bmRlZmluZWQgPyBuYW1lIDogYCR7aW5wdXQuYmFzZW5hbWV9JHtpbnB1dC5pZH1gXG4gIE9iamVjdC5hc3NpZ24oIGlucHV0LCB7IGRlZmF1bHRWYWx1ZSwgbWluLCBtYXgsIGlucHV0TnVtYmVyLCBjaGFubmVsTnVtYmVyIH0pXG5cbiAgaW5wdXRbMF0gPSB7XG4gICAgZ2VuKCkge1xuICAgICAgaWYoICEgZ2VuLnBhcmFtZXRlcnMuaGFzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5hZGQoIGlucHV0Lm5hbWUgKVxuICAgICAgcmV0dXJuIGlucHV0Lm5hbWUgKyAnWzBdJ1xuICAgIH1cbiAgfVxuICBpbnB1dFsxXSA9IHtcbiAgICBnZW4oKSB7XG4gICAgICBpZiggISBnZW4ucGFyYW1ldGVycy5oYXMoIGlucHV0Lm5hbWUgKSApIGdlbi5wYXJhbWV0ZXJzLmFkZCggaW5wdXQubmFtZSApXG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMV0nXG4gICAgfVxuICB9XG5cblxuICByZXR1cm4gaW5wdXRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBsaWJyYXJ5ID0ge1xuICBleHBvcnQoIGRlc3RpbmF0aW9uICkge1xuICAgIGlmKCBkZXN0aW5hdGlvbiA9PT0gd2luZG93ICkge1xuICAgICAgZGVzdGluYXRpb24uc3NkID0gbGlicmFyeS5oaXN0b3J5ICAgIC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICAgICAgZGVzdGluYXRpb24uaW5wdXQgPSBsaWJyYXJ5LmluICAgICAgIC8vIGluIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG4gICAgICBkZXN0aW5hdGlvbi50ZXJuYXJ5ID0gbGlicmFyeS5zd2l0Y2ggLy8gc3dpdGNoIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5Lmhpc3RvcnlcbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LmluXG4gICAgICBkZWxldGUgbGlicmFyeS5zd2l0Y2hcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKCBkZXN0aW5hdGlvbiwgbGlicmFyeSApXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGxpYnJhcnksICdzYW1wbGVyYXRlJywge1xuICAgICAgZ2V0KCkgeyByZXR1cm4gbGlicmFyeS5nZW4uc2FtcGxlcmF0ZSB9LFxuICAgICAgc2V0KHYpIHt9XG4gICAgfSlcblxuICAgIGxpYnJhcnkuaW4gPSBkZXN0aW5hdGlvbi5pbnB1dFxuICAgIGxpYnJhcnkuaGlzdG9yeSA9IGRlc3RpbmF0aW9uLnNzZFxuICAgIGxpYnJhcnkuc3dpdGNoID0gZGVzdGluYXRpb24udGVybmFyeVxuXG4gICAgZGVzdGluYXRpb24uY2xpcCA9IGxpYnJhcnkuY2xhbXBcbiAgfSxcblxuICBnZW46ICAgICAgcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICBcbiAgYWJzOiAgICAgIHJlcXVpcmUoICcuL2Ficy5qcycgKSxcbiAgcm91bmQ6ICAgIHJlcXVpcmUoICcuL3JvdW5kLmpzJyApLFxuICBwYXJhbTogICAgcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gIGFkZDogICAgICByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gIHN1YjogICAgICByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gIG11bDogICAgICByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gIGRpdjogICAgICByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gIGFjY3VtOiAgICByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgY291bnRlcjogIHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gIHNpbjogICAgICByZXF1aXJlKCAnLi9zaW4uanMnICksXG4gIGNvczogICAgICByZXF1aXJlKCAnLi9jb3MuanMnICksXG4gIHRhbjogICAgICByZXF1aXJlKCAnLi90YW4uanMnICksXG4gIHRhbmg6ICAgICByZXF1aXJlKCAnLi90YW5oLmpzJyApLFxuICBhc2luOiAgICAgcmVxdWlyZSggJy4vYXNpbi5qcycgKSxcbiAgYWNvczogICAgIHJlcXVpcmUoICcuL2Fjb3MuanMnICksXG4gIGF0YW46ICAgICByZXF1aXJlKCAnLi9hdGFuLmpzJyApLCAgXG4gIHBoYXNvcjogICByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gIGRhdGE6ICAgICByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICBwZWVrOiAgICAgcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgY3ljbGU6ICAgIHJlcXVpcmUoICcuL2N5Y2xlLmpzJyApLFxuICBoaXN0b3J5OiAgcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgZGVsdGE6ICAgIHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICBmbG9vcjogICAgcmVxdWlyZSggJy4vZmxvb3IuanMnICksXG4gIGNlaWw6ICAgICByZXF1aXJlKCAnLi9jZWlsLmpzJyApLFxuICBtaW46ICAgICAgcmVxdWlyZSggJy4vbWluLmpzJyApLFxuICBtYXg6ICAgICAgcmVxdWlyZSggJy4vbWF4LmpzJyApLFxuICBzaWduOiAgICAgcmVxdWlyZSggJy4vc2lnbi5qcycgKSxcbiAgZGNibG9jazogIHJlcXVpcmUoICcuL2RjYmxvY2suanMnICksXG4gIG1lbW86ICAgICByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICByYXRlOiAgICAgcmVxdWlyZSggJy4vcmF0ZS5qcycgKSxcbiAgd3JhcDogICAgIHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gIG1peDogICAgICByZXF1aXJlKCAnLi9taXguanMnICksXG4gIGNsYW1wOiAgICByZXF1aXJlKCAnLi9jbGFtcC5qcycgKSxcbiAgcG9rZTogICAgIHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gIGRlbGF5OiAgICByZXF1aXJlKCAnLi9kZWxheS5qcycgKSxcbiAgZm9sZDogICAgIHJlcXVpcmUoICcuL2ZvbGQuanMnICksXG4gIG1vZCA6ICAgICByZXF1aXJlKCAnLi9tb2QuanMnICksXG4gIHNhaCA6ICAgICByZXF1aXJlKCAnLi9zYWguanMnICksXG4gIG5vaXNlOiAgICByZXF1aXJlKCAnLi9ub2lzZS5qcycgKSxcbiAgbm90OiAgICAgIHJlcXVpcmUoICcuL25vdC5qcycgKSxcbiAgZ3Q6ICAgICAgIHJlcXVpcmUoICcuL2d0LmpzJyApLFxuICBndGU6ICAgICAgcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICBsdDogICAgICAgcmVxdWlyZSggJy4vbHQuanMnICksIFxuICBsdGU6ICAgICAgcmVxdWlyZSggJy4vbHRlLmpzJyApLCBcbiAgYm9vbDogICAgIHJlcXVpcmUoICcuL2Jvb2wuanMnICksXG4gIGdhdGU6ICAgICByZXF1aXJlKCAnLi9nYXRlLmpzJyApLFxuICB0cmFpbjogICAgcmVxdWlyZSggJy4vdHJhaW4uanMnICksXG4gIHNsaWRlOiAgICByZXF1aXJlKCAnLi9zbGlkZS5qcycgKSxcbiAgaW46ICAgICAgIHJlcXVpcmUoICcuL2luLmpzJyApLFxuICB0NjA6ICAgICAgcmVxdWlyZSggJy4vdDYwLmpzJyksXG4gIG10b2Y6ICAgICByZXF1aXJlKCAnLi9tdG9mLmpzJyksXG4gIGx0cDogICAgICByZXF1aXJlKCAnLi9sdHAuanMnKSwgICAgICAgIC8vIFRPRE86IHRlc3RcbiAgZ3RwOiAgICAgIHJlcXVpcmUoICcuL2d0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBzd2l0Y2g6ICAgcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApLFxuICBtc3Rvc2FtcHM6cmVxdWlyZSggJy4vbXN0b3NhbXBzLmpzJyApLCAvLyBUT0RPOiBuZWVkcyB0ZXN0LFxuICBzZWxlY3RvcjogcmVxdWlyZSggJy4vc2VsZWN0b3IuanMnICksXG4gIHV0aWxpdGllczpyZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gIHBvdzogICAgICByZXF1aXJlKCAnLi9wb3cuanMnICksXG4gIGF0dGFjazogICByZXF1aXJlKCAnLi9hdHRhY2suanMnICksXG4gIGRlY2F5OiAgICByZXF1aXJlKCAnLi9kZWNheS5qcycgKSxcbiAgd2luZG93czogIHJlcXVpcmUoICcuL3dpbmRvd3MuanMnICksXG4gIGVudjogICAgICByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gIGFkOiAgICAgICByZXF1aXJlKCAnLi9hZC5qcycgICksXG4gIGFkc3I6ICAgICByZXF1aXJlKCAnLi9hZHNyLmpzJyApLFxuICBpZmVsc2U6ICAgcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gIGJhbmc6ICAgICByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICBhbmQ6ICAgICAgcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICBwYW46ICAgICAgcmVxdWlyZSggJy4vcGFuLmpzJyApLFxuICBlcTogICAgICAgcmVxdWlyZSggJy4vZXEuanMnICksXG4gIG5lcTogICAgICByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gIGV4cDogICAgICByZXF1aXJlKCAnLi9leHAuanMnICksXG4gIHNlcTogICAgICByZXF1aXJlKCAnLi9zZXEuanMnIClcbn1cblxubGlicmFyeS5nZW4ubGliID0gbGlicmFyeVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYnJhcnlcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbHQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19KSB8IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gbHQuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPD0gJHtpbnB1dHNbMV19IHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gJ2x0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoKCAke2lucHV0c1swXX0gPCAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCggaW5wdXRzWzBdIDwgaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHRwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGx0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21heCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IGlzV29ya2xldCA/ICdNYXRoLm1heCcgOiBNYXRoLm1heCB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9bWF4KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgubWF4KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBtYXggPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbWF4LmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gbWF4XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbWVtbycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoaW4xLG1lbW9OYW1lKSA9PiB7XG4gIGxldCBtZW1vID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgbWVtby5pbnB1dHMgPSBbIGluMSBdXG4gIG1lbW8uaWQgICA9IGdlbi5nZXRVSUQoKVxuICBtZW1vLm5hbWUgPSBtZW1vTmFtZSAhPT0gdW5kZWZpbmVkID8gbWVtb05hbWUgKyAnXycgKyBnZW4uZ2V0VUlEKCkgOiBgJHttZW1vLmJhc2VuYW1lfSR7bWVtby5pZH1gXG5cbiAgcmV0dXJuIG1lbW9cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidtaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApIHx8IGlzTmFOKCBpbnB1dHNbMV0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBpc1dvcmtsZXQgPyAnTWF0aC5taW4nIDogTWF0aC5taW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfW1pbiggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLm1pbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICksIHBhcnNlRmxvYXQoIGlucHV0c1sxXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbWluID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1pbi5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIG1pblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGFkZCA9IHJlcXVpcmUoJy4vYWRkLmpzJyksXG4gICAgbXVsID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICBzdWIgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW89IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiwgdD0uNSApID0+IHtcbiAgbGV0IHVnZW4gPSBtZW1vKCBhZGQoIG11bChpbjEsIHN1YigxLHQgKSApLCBtdWwoIGluMiwgdCApICkgKVxuICB1Z2VuLm5hbWUgPSAnbWl4JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoLi4uYXJncykgPT4ge1xuICBsZXQgbW9kID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PScoJyxcbiAgICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgbW9kQXRFbmQgPSBmYWxzZVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAlIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gJSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgJSAnIFxuICAgICAgfSlcblxuICAgICAgb3V0ICs9ICcpJ1xuXG4gICAgICByZXR1cm4gb3V0XG4gICAgfVxuICB9XG4gIFxuICByZXR1cm4gbW9kXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J21zdG9zYW1wcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWUgfSA9ICR7Z2VuLnNhbXBsZXJhdGV9IC8gMTAwMCAqICR7aW5wdXRzWzBdfSBcXG5cXG5gXG4gICAgIFxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gb3V0XG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGdlbi5zYW1wbGVyYXRlIC8gMTAwMCAqIHRoaXMuaW5wdXRzWzBdXG5cbiAgICAgIHJldHVyblZhbHVlID0gb3V0XG4gICAgfSAgICBcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBtc3Rvc2FtcHMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbXN0b3NhbXBzLmlucHV0cyA9IFsgeCBdXG4gIG1zdG9zYW1wcy5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbXN0b3NhbXBzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbXRvZicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgKCAke3RoaXMudHVuaW5nfSAqIGdlbi5leHAoIC4wNTc3NjIyNjUgKiAoJHtpbnB1dHNbMF19IC0gNjkpICkgKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSB0aGlzLnR1bmluZyAqIE1hdGguZXhwKCAuMDU3NzYyMjY1ICogKCBpbnB1dHNbMF0gLSA2OSkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHByb3BzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgdHVuaW5nOjQ0MCB9XG4gIFxuICBpZiggcHJvcHMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIHByb3BzLmRlZmF1bHRzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCBkZWZhdWx0cyApXG4gIHVnZW4uaW5wdXRzID0gWyB4IF1cbiAgXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmNvbnN0IHByb3RvID0ge1xuICBiYXNlbmFtZTogJ211bCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgLFxuICAgICAgICBzdW0gPSAxLCBudW1Db3VudCA9IDAsIG11bEF0RW5kID0gZmFsc2UsIGFscmVhZHlGdWxsU3VtbWVkID0gdHJ1ZVxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICBvdXQgKz0gdlxuICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgbXVsQXRFbmQgPSB0cnVlXG4gICAgICAgICAgb3V0ICs9ICcgKiAnXG4gICAgICAgIH1cbiAgICAgICAgYWxyZWFkeUZ1bGxTdW1tZWQgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICAgIGlmKCBpID09PSAwICkge1xuICAgICAgICAgIHN1bSA9IHZcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3VtICo9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICB9XG4gICAgICAgIG51bUNvdW50KytcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYoIG51bUNvdW50ID4gMCApIHtcbiAgICAgIG91dCArPSBtdWxBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKiAnICsgc3VtXG4gICAgfVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgY29uc3QgbXVsID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBcbiAgT2JqZWN0LmFzc2lnbiggbXVsLCB7XG4gICAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogYXJncyxcbiAgfSlcbiAgXG4gIG11bC5uYW1lID0gbXVsLmJhc2VuYW1lICsgbXVsLmlkXG5cbiAgcmV0dXJuIG11bFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbmVxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSAvKnRoaXMuaW5wdXRzWzBdICE9PSB0aGlzLmlucHV0c1sxXSA/IDEgOiovIGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ICE9PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vaXNlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dFxuXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnbm9pc2UnIDogaXNXb3JrbGV0ID8gJ01hdGgucmFuZG9tJyA6IE1hdGgucmFuZG9tIH0pXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gJHtyZWZ9bm9pc2UoKVxcbmBcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm9pc2UgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIG5vaXNlLm5hbWUgPSBwcm90by5uYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG5vaXNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbm90JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gPT09IDAgPyAxIDogMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSAhaW5wdXRzWzBdID09PSAwID8gMSA6IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbm90LmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIG5vdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwYW4nLCBcbiAgaW5pdFRhYmxlKCkgeyAgICBcbiAgICBsZXQgYnVmZmVyTCA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKSxcbiAgICAgICAgYnVmZmVyUiA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgY29uc3QgYW5nVG9SYWQgPSBNYXRoLlBJIC8gMTgwXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxMDI0OyBpKysgKSB7IFxuICAgICAgbGV0IHBhbiA9IGkgKiAoIDkwIC8gMTAyNCApXG4gICAgICBidWZmZXJMW2ldID0gTWF0aC5jb3MoIHBhbiAqIGFuZ1RvUmFkICkgXG4gICAgICBidWZmZXJSW2ldID0gTWF0aC5zaW4oIHBhbiAqIGFuZ1RvUmFkIClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5wYW5MID0gZGF0YSggYnVmZmVyTCwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9KVxuICAgIGdlbi5nbG9iYWxzLnBhblIgPSBkYXRhKCBidWZmZXJSLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0pXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggbGVmdElucHV0LCByaWdodElucHV0LCBwYW4gPS41LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBpZiggZ2VuLmdsb2JhbHMucGFuTCA9PT0gdW5kZWZpbmVkICkgcHJvdG8uaW5pdFRhYmxlKClcblxuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgbGVmdElucHV0LCByaWdodElucHV0IF0sXG4gICAgbGVmdDogICAgbXVsKCBsZWZ0SW5wdXQsIHBlZWsoIGdlbi5nbG9iYWxzLnBhbkwsIHBhbiwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSApLFxuICAgIHJpZ2h0OiAgIG11bCggcmlnaHRJbnB1dCwgcGVlayggZ2VuLmdsb2JhbHMucGFuUiwgcGFuLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pIClcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncGFyYW0nLFxuXG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGdlbi5wYXJhbXMuYWRkKCB0aGlzIClcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcblxuICAgIGlmKCBpc1dvcmtsZXQgKSBnZW4ucGFyYW1ldGVycy5hZGQoIHRoaXMubmFtZSApXG5cbiAgICB0aGlzLnZhbHVlID0gdGhpcy5pbml0aWFsVmFsdWVcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlzV29ya2xldCA/IHRoaXMubmFtZSA6IGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWBcblxuICAgIHJldHVybiBnZW4ubWVtb1sgdGhpcy5uYW1lIF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHByb3BOYW1lPTAsIHZhbHVlPTAsIG1pbj0wLCBtYXg9MSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBpZiggdHlwZW9mIHByb3BOYW1lICE9PSAnc3RyaW5nJyApIHtcbiAgICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSBwcm9wTmFtZVxuICB9ZWxzZXtcbiAgICB1Z2VuLm5hbWUgPSBwcm9wTmFtZVxuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gdmFsdWVcbiAgfVxuXG4gIHVnZW4ubWluID0gbWluXG4gIHVnZW4ubWF4ID0gbWF4XG4gIHVnZW4uZGVmYXVsdFZhbHVlID0gdWdlbi5pbml0aWFsVmFsdWVcblxuICAvLyBmb3Igc3RvcmluZyB3b3JrbGV0IG5vZGVzIG9uY2UgdGhleSdyZSBpbnN0YW50aWF0ZWRcbiAgdWdlbi53YWFwaSA9IG51bGxcblxuICB1Z2VuLmlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgaWYoIHRoaXMuaXNXb3JrbGV0ICYmIHRoaXMud2FhcGkgIT09IG51bGwgKSB7XG4gICAgICAgICAgdGhpcy53YWFwaS52YWx1ZSA9IHZcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHZcbiAgICAgICAgfSBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgICBkYXRhVWdlbiA9IHJlcXVpcmUoJy4vZGF0YS5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BlZWsnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQsIGZ1bmN0aW9uQm9keSwgbmV4dCwgbGVuZ3RoSXNMb2cyLCBpZHhcbiAgICBcbiAgICBpZHggPSBpbnB1dHNbMV1cbiAgICBsZW5ndGhJc0xvZzIgPSAoTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApIHwgMCkgID09PSBNYXRoLmxvZzIoIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIClcblxuICAgIGlmKCB0aGlzLm1vZGUgIT09ICdzaW1wbGUnICkge1xuXG4gICAgZnVuY3Rpb25Cb2R5ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9kYXRhSWR4ICA9ICR7aWR4fSwgXG4gICAgICAke3RoaXMubmFtZX1fcGhhc2UgPSAke3RoaXMubW9kZSA9PT0gJ3NhbXBsZXMnID8gaW5wdXRzWzBdIDogaW5wdXRzWzBdICsgJyAqICcgKyAodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGgpIH0sIFxuICAgICAgJHt0aGlzLm5hbWV9X2luZGV4ID0gJHt0aGlzLm5hbWV9X3BoYXNlIHwgMCxcXG5gXG5cbiAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICd3cmFwJyApIHtcbiAgICAgIG5leHQgPSBsZW5ndGhJc0xvZzIgP1xuICAgICAgYCggJHt0aGlzLm5hbWV9X2luZGV4ICsgMSApICYgKCR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IC0gMSlgIDpcbiAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9ID8gJHt0aGlzLm5hbWV9X2luZGV4ICsgMSAtICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZSBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdjbGFtcCcgKSB7XG4gICAgICBuZXh0ID0gXG4gICAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA/ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfSBlbHNlIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2ZvbGQnIHx8IHRoaXMuYm91bmRtb2RlID09PSAnbWlycm9yJyApIHtcbiAgICAgIG5leHQgPSBcbiAgICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDEgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9ID8gJHt0aGlzLm5hbWV9X2luZGV4IC0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IDogJHt0aGlzLm5hbWV9X2luZGV4ICsgMWBcbiAgICB9ZWxzZXtcbiAgICAgICBuZXh0ID0gXG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMWAgICAgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLmludGVycCA9PT0gJ2xpbmVhcicgKSB7ICAgICAgXG4gICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fZnJhYyAgPSAke3RoaXMubmFtZX1fcGhhc2UgLSAke3RoaXMubmFtZX1faW5kZXgsXG4gICAgICAke3RoaXMubmFtZX1fYmFzZSAgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgICR7dGhpcy5uYW1lfV9pbmRleCBdLFxuICAgICAgJHt0aGlzLm5hbWV9X25leHQgID0gJHtuZXh0fSxgXG4gICAgICBcbiAgICAgIGlmKCB0aGlzLmJvdW5kbW9kZSA9PT0gJ2lnbm9yZScgKSB7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1faW5kZXggPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCAtIDF9IHx8ICR7dGhpcy5uYW1lfV9pbmRleCA8IDAgPyAwIDogJHt0aGlzLm5hbWV9X2Jhc2UgKyAke3RoaXMubmFtZX1fZnJhYyAqICggbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9uZXh0IF0gLSAke3RoaXMubmFtZX1fYmFzZSApXFxuXFxuYFxuICAgICAgfWVsc2V7XG4gICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAke3RoaXMubmFtZX1fb3V0ICAgPSAke3RoaXMubmFtZX1fYmFzZSArICR7dGhpcy5uYW1lfV9mcmFjICogKCBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X25leHQgXSAtICR7dGhpcy5uYW1lfV9iYXNlIClcXG5cXG5gXG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICBmdW5jdGlvbkJvZHkgKz0gYCAgICAgICR7dGhpcy5uYW1lfV9vdXQgPSBtZW1vcnlbICR7dGhpcy5uYW1lfV9kYXRhSWR4ICsgJHt0aGlzLm5hbWV9X2luZGV4IF1cXG5cXG5gXG4gICAgfVxuXG4gICAgfSBlbHNlIHsgLy8gbW9kZSBpcyBzaW1wbGVcbiAgICAgIGZ1bmN0aW9uQm9keSA9IGBtZW1vcnlbICR7aWR4fSArICR7IGlucHV0c1swXSB9IF1gXG4gICAgICBcbiAgICAgIHJldHVybiBmdW5jdGlvbkJvZHlcbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSsnX291dCcsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgZGVmYXVsdHMgOiB7IGNoYW5uZWxzOjEsIG1vZGU6J3BoYXNlJywgaW50ZXJwOidsaW5lYXInLCBib3VuZG1vZGU6J3dyYXAnIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGlucHV0X2RhdGEsIGluZGV4PTAsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIC8vY29uc29sZS5sb2coIGRhdGFVZ2VuLCBnZW4uZGF0YSApXG5cbiAgLy8gWFhYIHdoeSBpcyBkYXRhVWdlbiBub3QgdGhlIGFjdHVhbCBmdW5jdGlvbj8gc29tZSB0eXBlIG9mIGJyb3dzZXJpZnkgbm9uc2Vuc2UuLi5cbiAgY29uc3QgZmluYWxEYXRhID0gdHlwZW9mIGlucHV0X2RhdGEuYmFzZW5hbWUgPT09ICd1bmRlZmluZWQnID8gZ2VuLmxpYi5kYXRhKCBpbnB1dF9kYXRhICkgOiBpbnB1dF9kYXRhXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgXG4gICAgeyBcbiAgICAgICdkYXRhJzogICAgIGZpbmFsRGF0YSxcbiAgICAgIGRhdGFOYW1lOiAgIGZpbmFsRGF0YS5uYW1lLFxuICAgICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgICAgaW5wdXRzOiAgICAgWyBpbmRleCwgZmluYWxEYXRhIF0sXG4gICAgfSxcbiAgICBwcm90by5kZWZhdWx0cyxcbiAgICBwcm9wZXJ0aWVzIFxuICApXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBhY2N1bSA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIG11bCAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHByb3RvID0geyBiYXNlbmFtZToncGhhc29yJyB9LFxuICAgIGRpdiAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApXG5cbmNvbnN0IGRlZmF1bHRzID0geyBtaW46IC0xLCBtYXg6IDEgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5ID0gMSwgcmVzZXQgPSAwLCBfcHJvcHMgKSA9PiB7XG4gIGNvbnN0IHByb3BzID0gT2JqZWN0LmFzc2lnbigge30sIGRlZmF1bHRzLCBfcHJvcHMgKVxuXG4gIGNvbnN0IHJhbmdlID0gcHJvcHMubWF4IC0gcHJvcHMubWluXG5cbiAgY29uc3QgdWdlbiA9IHR5cGVvZiBmcmVxdWVuY3kgPT09ICdudW1iZXInIFxuICAgID8gYWNjdW0oIChmcmVxdWVuY3kgKiByYW5nZSkgLyBnZW4uc2FtcGxlcmF0ZSwgcmVzZXQsIHByb3BzICkgXG4gICAgOiBhY2N1bSggXG4gICAgICAgIGRpdiggXG4gICAgICAgICAgbXVsKCBmcmVxdWVuY3ksIHJhbmdlICksXG4gICAgICAgICAgZ2VuLnNhbXBsZXJhdGVcbiAgICAgICAgKSwgXG4gICAgICAgIHJlc2V0LCBwcm9wcyBcbiAgICApXG5cbiAgdWdlbi5uYW1lID0gcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBtdWwgID0gcmVxdWlyZSgnLi9tdWwuanMnKSxcbiAgICB3cmFwID0gcmVxdWlyZSgnLi93cmFwLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG9rZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBkYXRhTmFtZSA9ICdtZW1vcnknLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGlkeCwgb3V0LCB3cmFwcGVkXG4gICAgXG4gICAgaWR4ID0gdGhpcy5kYXRhLmdlbigpXG5cbiAgICAvL2dlbi5yZXF1ZXN0TWVtb3J5KCB0aGlzLm1lbW9yeSApXG4gICAgLy93cmFwcGVkID0gd3JhcCggdGhpcy5pbnB1dHNbMV0sIDAsIHRoaXMuZGF0YUxlbmd0aCApLmdlbigpXG4gICAgLy9pZHggPSB3cmFwcGVkWzBdXG4gICAgLy9nZW4uZnVuY3Rpb25Cb2R5ICs9IHdyYXBwZWRbMV1cbiAgICBsZXQgb3V0cHV0U3RyID0gdGhpcy5pbnB1dHNbMV0gPT09IDAgP1xuICAgICAgYCAgJHtkYXRhTmFtZX1bICR7aWR4fSBdID0gJHtpbnB1dHNbMF19XFxuYCA6XG4gICAgICBgICAke2RhdGFOYW1lfVsgJHtpZHh9ICsgJHtpbnB1dHNbMV19IF0gPSAke2lucHV0c1swXX1cXG5gXG5cbiAgICBpZiggdGhpcy5pbmxpbmUgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5mdW5jdGlvbkJvZHkgKz0gb3V0cHV0U3RyXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gWyB0aGlzLmlubGluZSwgb3V0cHV0U3RyIF1cbiAgICB9XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0gKCBkYXRhLCB2YWx1ZSwgaW5kZXgsIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0geyBjaGFubmVsczoxIH0gXG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGRhdGEsXG4gICAgZGF0YU5hbWU6ICAgZGF0YS5uYW1lLFxuICAgIGRhdGFMZW5ndGg6IGRhdGEuYnVmZmVyLmxlbmd0aCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyB2YWx1ZSwgaW5kZXggXSxcbiAgfSxcbiAgZGVmYXVsdHMgKVxuXG5cbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkXG4gIFxuICBnZW4uaGlzdG9yaWVzLnNldCggdWdlbi5uYW1lLCB1Z2VuIClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwb3cnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Bvdyc6IGlzV29ya2xldCA/ICdNYXRoLnBvdycgOiBNYXRoLnBvdyB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9cG93KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdHlwZW9mIGlucHV0c1swXSA9PT0gJ3N0cmluZycgJiYgaW5wdXRzWzBdWzBdID09PSAnKCcgKSB7XG4gICAgICAgIGlucHV0c1swXSA9IGlucHV0c1swXS5zbGljZSgxLC0xKVxuICAgICAgfVxuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMV0gPT09ICdzdHJpbmcnICYmIGlucHV0c1sxXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMV0gPSBpbnB1dHNbMV0uc2xpY2UoMSwtMSlcbiAgICAgIH1cblxuICAgICAgb3V0ID0gTWF0aC5wb3coIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0pIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgcG93ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHBvdy5pbnB1dHMgPSBbIHgseSBdXG4gIHBvdy5pZCA9IGdlbi5nZXRVSUQoKVxuICBwb3cubmFtZSA9IGAke3Bvdy5iYXNlbmFtZX17cG93LmlkfWBcblxuICByZXR1cm4gcG93XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gICAgZGVsdGEgICA9IHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICAgIHdyYXAgICAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3JhdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBwaGFzZSAgPSBoaXN0b3J5KCksXG4gICAgICAgIGluTWludXMxID0gaGlzdG9yeSgpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmaWx0ZXIsIHN1bSwgb3V0XG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X2RpZmYgPSAke2lucHV0c1swXX0gLSAke2dlbk5hbWV9Lmxhc3RTYW1wbGVcbiAgaWYoICR7dGhpcy5uYW1lfV9kaWZmIDwgLS41ICkgJHt0aGlzLm5hbWV9X2RpZmYgKz0gMVxuICAke2dlbk5hbWV9LnBoYXNlICs9ICR7dGhpcy5uYW1lfV9kaWZmICogJHtpbnB1dHNbMV19XG4gIGlmKCAke2dlbk5hbWV9LnBoYXNlID4gMSApICR7Z2VuTmFtZX0ucGhhc2UgLT0gMVxuICAke2dlbk5hbWV9Lmxhc3RTYW1wbGUgPSAke2lucHV0c1swXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcblxuICAgIHJldHVybiBbIGdlbk5hbWUgKyAnLnBoYXNlJywgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCByYXRlICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHBoYXNlOiAgICAgIDAsXG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIHJhdGUgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidyb3VuZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGgucm91bmQnIDogTWF0aC5yb3VuZCB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9cm91bmQoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgucm91bmQoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCByb3VuZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICByb3VuZC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiByb3VuZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NhaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSAwXG4gICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lICsgJ19jb250cm9sJyBdID0gMFxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuXG4gICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX1fY29udHJvbCA9IG1lbW9yeVske3RoaXMubWVtb3J5LmNvbnRyb2wuaWR4fV0sXG4gICAgICAke3RoaXMubmFtZX1fdHJpZ2dlciA9ICR7aW5wdXRzWzFdfSA+ICR7aW5wdXRzWzJdfSA/IDEgOiAwXG5cbiAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyICE9PSAke3RoaXMubmFtZX1fY29udHJvbCAgKSB7XG4gICAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyID09PSAxICkgXG4gICAgICBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XSA9ICR7aW5wdXRzWzBdfVxuICAgIFxuICAgIG1lbW9yeVske3RoaXMubWVtb3J5LmNvbnRyb2wuaWR4fV0gPSAke3RoaXMubmFtZX1fdHJpZ2dlclxuICB9XG5gXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYC8vYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAsICcgJyArb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBjb250cm9sLCB0aHJlc2hvbGQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXQ6MCB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCBjb250cm9sLHRocmVzaG9sZCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgY29udHJvbDogeyBpZHg6bnVsbCwgbGVuZ3RoOjEgfSxcbiAgICAgIHZhbHVlOiAgIHsgaWR4Om51bGwsIGxlbmd0aDoxIH0sXG4gICAgfVxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzZWxlY3RvcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dCwgcmV0dXJuVmFsdWUgPSAwXG4gICAgXG4gICAgc3dpdGNoKCBpbnB1dHMubGVuZ3RoICkge1xuICAgICAgY2FzZSAyIDpcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBpbnB1dHNbMV1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDMgOlxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcblxcbmA7XG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsIG91dCBdXG4gICAgICAgIGJyZWFrOyAgXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAwXG4gIHN3aXRjaCggJHtpbnB1dHNbMF19ICsgMSApIHtcXG5gXG5cbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICBvdXQgKz1gICAgIGNhc2UgJHtpfTogJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzW2ldfTsgYnJlYWs7XFxuYCBcbiAgICAgICAgfVxuXG4gICAgICAgIG91dCArPSAnICB9XFxuXFxuJ1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSArICdfb3V0JywgJyAnICsgb3V0IF1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uaW5wdXRzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgY291bnRlcj0gcmVxdWlyZSggJy4vY291bnRlci5qcycgKSxcbiAgICBwZWVrICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgc3NkICAgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIGRhdGEgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwcm90byA9IHsgYmFzZW5hbWU6J3NlcScgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZHVyYXRpb25zID0gMTEwMjUsIHZhbHVlcyA9IFswLDFdLCBwaGFzZUluY3JlbWVudCA9IDEpID0+IHtcbiAgbGV0IGNsb2NrXG4gIFxuICBpZiggQXJyYXkuaXNBcnJheSggZHVyYXRpb25zICkgKSB7XG4gICAgLy8gd2Ugd2FudCBhIGNvdW50ZXIgdGhhdCBpcyB1c2luZyBvdXIgY3VycmVudFxuICAgIC8vIHJhdGUgdmFsdWUsIGJ1dCB3ZSB3YW50IHRoZSByYXRlIHZhbHVlIHRvIGJlIGRlcml2ZWQgZnJvbVxuICAgIC8vIHRoZSBjb3VudGVyLiBtdXN0IGluc2VydCBhIHNpbmdsZS1zYW1wbGUgZGVhbHkgdG8gYXZvaWRcbiAgICAvLyBpbmZpbml0ZSBsb29wLlxuICAgIGNvbnN0IGNsb2NrMiA9IGNvdW50ZXIoIDAsIDAsIGR1cmF0aW9ucy5sZW5ndGggKVxuICAgIGNvbnN0IF9fZHVyYXRpb25zID0gcGVlayggZGF0YSggZHVyYXRpb25zICksIGNsb2NrMiwgeyBtb2RlOidzaW1wbGUnIH0pIFxuICAgIGNsb2NrID0gY291bnRlciggcGhhc2VJbmNyZW1lbnQsIDAsIF9fZHVyYXRpb25zIClcbiAgICBcbiAgICAvLyBhZGQgb25lIHNhbXBsZSBkZWxheSB0byBhdm9pZCBjb2RlZ2VuIGxvb3BcbiAgICBjb25zdCBzID0gc3NkKClcbiAgICBzLmluKCBjbG9jay53cmFwIClcbiAgICBjbG9jazIuaW5wdXRzWzBdID0gcy5vdXRcbiAgfWVsc2V7XG4gICAgLy8gaWYgdGhlIHJhdGUgYXJndW1lbnQgaXMgYSBzaW5nbGUgdmFsdWUgd2UgZG9uJ3QgbmVlZCB0b1xuICAgIC8vIGRvIGFueXRoaW5nIHRyaWNreS5cbiAgICBjbG9jayA9IGNvdW50ZXIoIHBoYXNlSW5jcmVtZW50LCAwLCBkdXJhdGlvbnMgKVxuICB9XG4gIFxuICBjb25zdCBzdGVwcGVyID0gYWNjdW0oIGNsb2NrLndyYXAsIDAsIHsgbWluOjAsIG1heDp2YWx1ZXMubGVuZ3RoIH0pXG4gICBcbiAgY29uc3QgdWdlbiA9IHBlZWsoIGRhdGEoIHZhbHVlcyApLCBzdGVwcGVyLCB7IG1vZGU6J3NpbXBsZScgfSlcblxuICB1Z2VuLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonc2lnbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogaXNXb3JrbGV0ID8gJ01hdGguc2lnbicgOiBNYXRoLnNpZ24gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXNpZ24oICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2lnbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHNpZ24gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgc2lnbi5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBzaWduXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NpbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIFxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBpc1dvcmtsZXQgPyAnTWF0aC5zaW4nIDogTWF0aC5zaW4gfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpbi5pbnB1dHMgPSBbIHggXVxuICBzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgc2luLm5hbWUgPSBgJHtzaW4uYmFzZW5hbWV9e3Npbi5pZH1gXG5cbiAgcmV0dXJuIHNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGd0ICAgICAgPSByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgICBkaXYgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIF9zd2l0Y2ggPSByZXF1aXJlKCAnLi9zd2l0Y2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgc2xpZGVVcCA9IDEsIHNsaWRlRG93biA9IDEgKSA9PiB7XG4gIGxldCB5MSA9IGhpc3RvcnkoMCksXG4gICAgICBmaWx0ZXIsIHNsaWRlQW1vdW50XG5cbiAgLy95IChuKSA9IHkgKG4tMSkgKyAoKHggKG4pIC0geSAobi0xKSkvc2xpZGUpIFxuICBzbGlkZUFtb3VudCA9IF9zd2l0Y2goIGd0KGluMSx5MS5vdXQpLCBzbGlkZVVwLCBzbGlkZURvd24gKVxuXG4gIGZpbHRlciA9IG1lbW8oIGFkZCggeTEub3V0LCBkaXYoIHN1YiggaW4xLCB5MS5vdXQgKSwgc2xpZGVBbW91bnQgKSApIClcblxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N1YicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9MCxcbiAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBzdWJBdEVuZCA9IGZhbHNlLFxuICAgICAgICBoYXNVZ2VucyA9IGZhbHNlLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IDBcblxuICAgIHRoaXMuaW5wdXRzLmZvckVhY2goIHZhbHVlID0+IHsgaWYoIGlzTmFOKCB2YWx1ZSApICkgaGFzVWdlbnMgPSB0cnVlIH0pXG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC0gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICByZXR1cm5cbiAgICAgIH1lbHNle1xuICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC0gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGxldCBzdWIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggc3ViLCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzXG4gIH0pXG4gICAgICAgXG4gIHN1Yi5uYW1lID0gJ3N1YicgKyBzdWIuaWRcblxuICByZXR1cm4gc3ViXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzd2l0Y2gnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIGlmKCBpbnB1dHNbMV0gPT09IGlucHV0c1syXSApIHJldHVybiBpbnB1dHNbMV0gLy8gaWYgYm90aCBwb3RlbnRpYWwgb3V0cHV0cyBhcmUgdGhlIHNhbWUganVzdCByZXR1cm4gb25lIG9mIHRoZW1cbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEgPSAxLCBpbjIgPSAwICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbnRyb2wsIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Q2MCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGNvbnN0IGlzV29ya2xldCA9IGdlbi5tb2RlID09PSAnd29ya2xldCdcbiAgICBjb25zdCByZWYgPSBpc1dvcmtsZXQ/ICcnIDogJ2dlbi4nXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgJ2V4cCcgXTogaXNXb3JrbGV0ID8gJ01hdGguZXhwJyA6IE1hdGguZXhwIH0pXG5cbiAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAke3JlZn1leHAoIC02LjkwNzc1NTI3ODkyMSAvICR7aW5wdXRzWzBdfSApXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gaW5wdXRzWzBdIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9ICAgIFxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHQ2MCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0NjAuaW5wdXRzID0gWyB4IF1cbiAgdDYwLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB0NjBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgXG4gICAgY29uc3QgaXNXb3JrbGV0ID0gZ2VuLm1vZGUgPT09ICd3b3JrbGV0J1xuICAgIGNvbnN0IHJlZiA9IGlzV29ya2xldD8gJycgOiAnZ2VuLidcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Rhbic6IGlzV29ya2xldCA/ICdNYXRoLnRhbicgOiBNYXRoLnRhbiB9KVxuXG4gICAgICBvdXQgPSBgJHtyZWZ9dGFuKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgdGFuLmlucHV0cyA9IFsgeCBdXG4gIHRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW4ubmFtZSA9IGAke3Rhbi5iYXNlbmFtZX17dGFuLmlkfWBcblxuICByZXR1cm4gdGFuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3RhbmgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBcbiAgICBjb25zdCBpc1dvcmtsZXQgPSBnZW4ubW9kZSA9PT0gJ3dvcmtsZXQnXG4gICAgY29uc3QgcmVmID0gaXNXb3JrbGV0PyAnJyA6ICdnZW4uJ1xuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAndGFuaCc6IGlzV29ya2xldCA/ICdNYXRoLnRhbicgOiBNYXRoLnRhbmggfSlcblxuICAgICAgb3V0ID0gYCR7cmVmfXRhbmgoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbmgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW5oID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbmguaW5wdXRzID0gWyB4IF1cbiAgdGFuaC5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW5oLm5hbWUgPSBgJHt0YW5oLmJhc2VuYW1lfXt0YW5oLmlkfWBcblxuICByZXR1cm4gdGFuaFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGx0ICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBwaGFzb3IgID0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9NDQwLCBwdWxzZXdpZHRoPS41ICkgPT4ge1xuICBsZXQgZ3JhcGggPSBsdCggYWNjdW0oIGRpdiggZnJlcXVlbmN5LCA0NDEwMCApICksIC41IClcblxuICBncmFwaC5uYW1lID0gYHRyYWluJHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiBncmFwaFxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKVxuXG5sZXQgaXNTdGVyZW8gPSBmYWxzZVxuXG5sZXQgdXRpbGl0aWVzID0ge1xuICBjdHg6IG51bGwsXG5cbiAgY2xlYXIoKSB7XG4gICAgaWYoIHRoaXMud29ya2xldE5vZGUgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIHRoaXMud29ya2xldE5vZGUuZGlzY29ubmVjdCgpXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLmNhbGxiYWNrID0gKCkgPT4gMFxuICAgIH1cbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5mb3JFYWNoKCB2ID0+IHYoKSApXG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MubGVuZ3RoID0gMFxuICB9LFxuXG4gIGNyZWF0ZUNvbnRleHQoKSB7XG4gICAgbGV0IEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHRcbiAgICB0aGlzLmN0eCA9IG5ldyBBQygpXG5cbiAgICBnZW4uc2FtcGxlcmF0ZSA9IHRoaXMuY3R4LnNhbXBsZVJhdGVcblxuICAgIGxldCBzdGFydCA9ICgpID0+IHtcbiAgICAgIGlmKCB0eXBlb2YgQUMgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG5cbiAgICAgICAgICBpZiggJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkgeyAvLyByZXF1aXJlZCB0byBzdGFydCBhdWRpbyB1bmRlciBpT1MgNlxuICAgICAgICAgICAgIGxldCBteVNvdXJjZSA9IHV0aWxpdGllcy5jdHguY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KCB1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uIClcbiAgICAgICAgICAgICBteVNvdXJjZS5ub3RlT24oIDAgKVxuICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICBjcmVhdGVTY3JpcHRQcm9jZXNzb3IoKSB7XG4gICAgdGhpcy5ub2RlID0gdGhpcy5jdHguY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCAxMDI0LCAwLCAyIClcbiAgICB0aGlzLmNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfVxuICAgIGlmKCB0eXBlb2YgdGhpcy5jYWxsYmFjayA9PT0gJ3VuZGVmaW5lZCcgKSB0aGlzLmNhbGxiYWNrID0gdGhpcy5jbGVhckZ1bmN0aW9uXG5cbiAgICB0aGlzLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiggYXVkaW9Qcm9jZXNzaW5nRXZlbnQgKSB7XG4gICAgICB2YXIgb3V0cHV0QnVmZmVyID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQub3V0cHV0QnVmZmVyO1xuXG4gICAgICB2YXIgbGVmdCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMCApLFxuICAgICAgICAgIHJpZ2h0PSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDEgKSxcbiAgICAgICAgICBpc1N0ZXJlbyA9IHV0aWxpdGllcy5pc1N0ZXJlb1xuXG4gICAgIGZvciggdmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGxlZnQubGVuZ3RoOyBzYW1wbGUrKyApIHtcbiAgICAgICAgdmFyIG91dCA9IHV0aWxpdGllcy5jYWxsYmFjaygpXG5cbiAgICAgICAgaWYoIGlzU3RlcmVvID09PSBmYWxzZSApIHtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgXSA9IHJpZ2h0WyBzYW1wbGUgXSA9IG91dCBcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgbGVmdFsgc2FtcGxlICBdID0gb3V0WzBdXG4gICAgICAgICAgcmlnaHRbIHNhbXBsZSBdID0gb3V0WzFdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm5vZGUuY29ubmVjdCggdGhpcy5jdHguZGVzdGluYXRpb24gKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICAvLyByZW1vdmUgc3RhcnRpbmcgc3R1ZmYgYW5kIGFkZCB0YWJzXG4gIHByZXR0eVByaW50Q2FsbGJhY2soIGNiICkge1xuICAgIC8vIGdldCByaWQgb2YgXCJmdW5jdGlvbiBnZW5cIiBhbmQgc3RhcnQgd2l0aCBwYXJlbnRoZXNpc1xuICAgIC8vIGNvbnN0IHNob3J0ZW5kQ0IgPSBjYi50b1N0cmluZygpLnNsaWNlKDkpXG4gICAgY29uc3QgY2JTcGxpdCA9IGNiLnRvU3RyaW5nKCkuc3BsaXQoJ1xcbicpXG4gICAgY29uc3QgY2JUcmltID0gY2JTcGxpdC5zbGljZSggMywgLTIgKVxuICAgIGNvbnN0IGNiVGFiYmVkID0gY2JUcmltLm1hcCggdiA9PiAnICAgICAgJyArIHYgKSBcbiAgICBcbiAgICByZXR1cm4gY2JUYWJiZWQuam9pbignXFxuJylcbiAgfSxcblxuICBjcmVhdGVQYXJhbWV0ZXJEZXNjcmlwdG9ycyggY2IgKSB7XG4gICAgLy8gW3tuYW1lOiAnYW1wbGl0dWRlJywgZGVmYXVsdFZhbHVlOiAwLjI1LCBtaW5WYWx1ZTogMCwgbWF4VmFsdWU6IDF9XTtcbiAgICBsZXQgcGFyYW1TdHIgPSAnJ1xuXG4gICAgLy9mb3IoIGxldCB1Z2VuIG9mIGNiLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAvLyAgcGFyYW1TdHIgKz0gYHsgbmFtZTonJHt1Z2VuLm5hbWV9JywgZGVmYXVsdFZhbHVlOiR7dWdlbi52YWx1ZX0sIG1pblZhbHVlOiR7dWdlbi5taW59LCBtYXhWYWx1ZToke3VnZW4ubWF4fSB9LFxcbiAgICAgIGBcbiAgICAvL31cbiAgICBmb3IoIGxldCB1Z2VuIG9mIGNiLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgIHBhcmFtU3RyICs9IGB7IG5hbWU6JyR7dWdlbi5uYW1lfScsIGF1dG9tYXRpb25SYXRlOidrLXJhdGUnLCBkZWZhdWx0VmFsdWU6JHt1Z2VuLmRlZmF1bHRWYWx1ZX0sIG1pblZhbHVlOiR7dWdlbi5taW59LCBtYXhWYWx1ZToke3VnZW4ubWF4fSB9LFxcbiAgICAgIGBcbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtU3RyXG4gIH0sXG5cbiAgY3JlYXRlUGFyYW1ldGVyRGVyZWZlcmVuY2VzKCBjYiApIHtcbiAgICBsZXQgc3RyID0gY2IucGFyYW1zLnNpemUgPiAwID8gJ1xcbiAgICAgICcgOiAnJ1xuICAgIGZvciggbGV0IHVnZW4gb2YgY2IucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgc3RyICs9IGBjb25zdCAke3VnZW4ubmFtZX0gPSBwYXJhbWV0ZXJzLiR7dWdlbi5uYW1lfVswXVxcbiAgICAgIGBcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyXG4gIH0sXG5cbiAgY3JlYXRlUGFyYW1ldGVyQXJndW1lbnRzKCBjYiApIHtcbiAgICBsZXQgIHBhcmFtTGlzdCA9ICcnXG4gICAgZm9yKCBsZXQgdWdlbiBvZiBjYi5wYXJhbXMudmFsdWVzKCkgKSB7XG4gICAgICBwYXJhbUxpc3QgKz0gdWdlbi5uYW1lICsgJ1tpXSwnXG4gICAgfVxuICAgIHBhcmFtTGlzdCA9IHBhcmFtTGlzdC5zbGljZSggMCwgLTEgKVxuXG4gICAgcmV0dXJuIHBhcmFtTGlzdFxuICB9LFxuXG4gIGNyZWF0ZUlucHV0RGVyZWZlcmVuY2VzKCBjYiApIHtcbiAgICBsZXQgc3RyID0gY2IuaW5wdXRzLnNpemUgPiAwID8gJ1xcbicgOiAnJ1xuICAgIGZvciggbGV0IGlucHV0IG9mICBjYi5pbnB1dHMudmFsdWVzKCkgKSB7XG4gICAgICBzdHIgKz0gYGNvbnN0ICR7aW5wdXQubmFtZX0gPSBpbnB1dHNbICR7aW5wdXQuaW5wdXROdW1iZXJ9IF1bICR7aW5wdXQuY2hhbm5lbE51bWJlcn0gXVxcbiAgICAgIGBcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyXG4gIH0sXG5cblxuICBjcmVhdGVJbnB1dEFyZ3VtZW50cyggY2IgKSB7XG4gICAgbGV0ICBwYXJhbUxpc3QgPSAnJ1xuICAgIGZvciggbGV0IGlucHV0IG9mIGNiLmlucHV0cy52YWx1ZXMoKSApIHtcbiAgICAgIHBhcmFtTGlzdCArPSBpbnB1dC5uYW1lICsgJ1tpXSwnXG4gICAgfVxuICAgIHBhcmFtTGlzdCA9IHBhcmFtTGlzdC5zbGljZSggMCwgLTEgKVxuXG4gICAgcmV0dXJuIHBhcmFtTGlzdFxuICB9LFxuICAgICAgXG4gIGNyZWF0ZUZ1bmN0aW9uRGVyZWZlcmVuY2VzKCBjYiApIHtcbiAgICBsZXQgbWVtYmVyU3RyaW5nID0gY2IubWVtYmVycy5zaXplID4gMCA/ICdcXG4nIDogJydcbiAgICBsZXQgbWVtbyA9IHt9XG4gICAgZm9yKCBsZXQgZGljdCBvZiBjYi5tZW1iZXJzLnZhbHVlcygpICkge1xuICAgICAgY29uc3QgbmFtZSA9IE9iamVjdC5rZXlzKCBkaWN0IClbMF0sXG4gICAgICAgICAgICB2YWx1ZSA9IGRpY3RbIG5hbWUgXVxuXG4gICAgICBpZiggbWVtb1sgbmFtZSBdICE9PSB1bmRlZmluZWQgKSBjb250aW51ZVxuICAgICAgbWVtb1sgbmFtZSBdID0gdHJ1ZVxuXG4gICAgICBtZW1iZXJTdHJpbmcgKz0gYCAgICAgIGNvbnN0ICR7bmFtZX0gPSAke3ZhbHVlfVxcbmBcbiAgICB9XG5cbiAgICByZXR1cm4gbWVtYmVyU3RyaW5nXG4gIH0sXG5cbiAgY3JlYXRlV29ya2xldFByb2Nlc3NvciggZ3JhcGgsIG5hbWUsIGRlYnVnLCBtZW09NDQxMDAqMTAgKSB7XG4gICAgLy9jb25zdCBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCA0MDk2LCBGbG9hdDY0QXJyYXkgKVxuICAgIGNvbnN0IGNiID0gZ2VuLmNyZWF0ZUNhbGxiYWNrKCBncmFwaCwgbWVtLCBkZWJ1ZyApXG4gICAgY29uc3QgaW5wdXRzID0gY2IuaW5wdXRzXG5cbiAgICAvLyBnZXQgYWxsIGlucHV0cyBhbmQgY3JlYXRlIGFwcHJvcHJpYXRlIGF1ZGlvcGFyYW0gaW5pdGlhbGl6ZXJzXG4gICAgY29uc3QgcGFyYW1ldGVyRGVzY3JpcHRvcnMgPSB0aGlzLmNyZWF0ZVBhcmFtZXRlckRlc2NyaXB0b3JzKCBjYiApXG4gICAgY29uc3QgcGFyYW1ldGVyRGVyZWZlcmVuY2VzID0gdGhpcy5jcmVhdGVQYXJhbWV0ZXJEZXJlZmVyZW5jZXMoIGNiIClcbiAgICBjb25zdCBwYXJhbUxpc3QgPSB0aGlzLmNyZWF0ZVBhcmFtZXRlckFyZ3VtZW50cyggY2IgKVxuICAgIGNvbnN0IGlucHV0RGVyZWZlcmVuY2VzID0gdGhpcy5jcmVhdGVJbnB1dERlcmVmZXJlbmNlcyggY2IgKVxuICAgIGNvbnN0IGlucHV0TGlzdCA9IHRoaXMuY3JlYXRlSW5wdXRBcmd1bWVudHMoIGNiICkgICBcbiAgICBjb25zdCBtZW1iZXJTdHJpbmcgPSB0aGlzLmNyZWF0ZUZ1bmN0aW9uRGVyZWZlcmVuY2VzKCBjYiApXG5cbiAgICAvLyBjaGFuZ2Ugb3V0cHV0IGJhc2VkIG9uIG51bWJlciBvZiBjaGFubmVscy5cbiAgICBjb25zdCBnZW5pc2hPdXRwdXRMaW5lID0gY2IuaXNTdGVyZW8gPT09IGZhbHNlXG4gICAgICA/IGBsZWZ0WyBpIF0gPSBtZW1vcnlbMF1gXG4gICAgICA6IGBsZWZ0WyBpIF0gPSBtZW1vcnlbMF07XFxuXFx0XFx0cmlnaHRbIGkgXSA9IG1lbW9yeVsxXVxcbmBcblxuICAgIGNvbnN0IHByZXR0eUNhbGxiYWNrID0gdGhpcy5wcmV0dHlQcmludENhbGxiYWNrKCBjYiApXG5cbiAgICAvKioqKiogYmVnaW4gY2FsbGJhY2sgY29kZSAqKioqL1xuICAgIC8vIG5vdGUgdGhhdCB3ZSBoYXZlIHRvIGNoZWNrIHRvIHNlZSB0aGF0IG1lbW9yeSBoYXMgYmVlbiBwYXNzZWRcbiAgICAvLyB0byB0aGUgd29ya2VyIGJlZm9yZSBydW5uaW5nIHRoZSBjYWxsYmFjayBmdW5jdGlvbiwgb3RoZXJ3aXNlXG4gICAgLy8gaXQgY2FuIGJlIHBhc3NlZCB0b28gc2xvd2x5IGFuZCBmYWlsIG9uIG9jY2Fzc2lvblxuXG4gICAgY29uc3Qgd29ya2xldENvZGUgPSBgXG5jbGFzcyAke25hbWV9UHJvY2Vzc29yIGV4dGVuZHMgQXVkaW9Xb3JrbGV0UHJvY2Vzc29yIHtcblxuICBzdGF0aWMgZ2V0IHBhcmFtZXRlckRlc2NyaXB0b3JzKCkge1xuICAgIGNvbnN0IHBhcmFtcyA9IFtcbiAgICAgICR7IHBhcmFtZXRlckRlc2NyaXB0b3JzIH0gICAgICBcbiAgICBdXG4gICAgcmV0dXJuIHBhcmFtc1xuICB9XG4gXG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICkge1xuICAgIHN1cGVyKCBvcHRpb25zIClcbiAgICB0aGlzLnBvcnQub25tZXNzYWdlID0gdGhpcy5oYW5kbGVNZXNzYWdlLmJpbmQoIHRoaXMgKVxuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZVxuICB9XG5cbiAgaGFuZGxlTWVzc2FnZSggZXZlbnQgKSB7XG4gICAgaWYoIGV2ZW50LmRhdGEua2V5ID09PSAnaW5pdCcgKSB7XG4gICAgICB0aGlzLm1lbW9yeSA9IGV2ZW50LmRhdGEubWVtb3J5XG4gICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuICAgIH1lbHNlIGlmKCBldmVudC5kYXRhLmtleSA9PT0gJ3NldCcgKSB7XG4gICAgICB0aGlzLm1lbW9yeVsgZXZlbnQuZGF0YS5pZHggXSA9IGV2ZW50LmRhdGEudmFsdWVcbiAgICB9ZWxzZSBpZiggZXZlbnQuZGF0YS5rZXkgPT09ICdnZXQnICkge1xuICAgICAgdGhpcy5wb3J0LnBvc3RNZXNzYWdlKHsga2V5OidyZXR1cm4nLCBpZHg6ZXZlbnQuZGF0YS5pZHgsIHZhbHVlOnRoaXMubWVtb3J5W2V2ZW50LmRhdGEuaWR4XSB9KSAgICAgXG4gICAgfVxuICB9XG5cbiAgcHJvY2VzcyggaW5wdXRzLCBvdXRwdXRzLCBwYXJhbWV0ZXJzICkge1xuICAgIGlmKCB0aGlzLmluaXRpYWxpemVkID09PSB0cnVlICkge1xuICAgICAgY29uc3Qgb3V0cHV0ID0gb3V0cHV0c1swXVxuICAgICAgY29uc3QgbGVmdCAgID0gb3V0cHV0WyAwIF1cbiAgICAgIGNvbnN0IHJpZ2h0ICA9IG91dHB1dFsgMSBdXG4gICAgICBjb25zdCBsZW4gICAgPSBsZWZ0Lmxlbmd0aFxuICAgICAgY29uc3QgbWVtb3J5ID0gdGhpcy5tZW1vcnkgJHtwYXJhbWV0ZXJEZXJlZmVyZW5jZXN9JHtpbnB1dERlcmVmZXJlbmNlc30ke21lbWJlclN0cmluZ31cblxuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBsZW47ICsraSApIHtcbiAgICAgICAgJHtwcmV0dHlDYWxsYmFja31cbiAgICAgICAgJHtnZW5pc2hPdXRwdXRMaW5lfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59XG4gICAgXG5yZWdpc3RlclByb2Nlc3NvciggJyR7bmFtZX0nLCAke25hbWV9UHJvY2Vzc29yKWBcblxuICAgIFxuICAgIC8qKioqKiBlbmQgY2FsbGJhY2sgY29kZSAqKioqKi9cblxuXG4gICAgaWYoIGRlYnVnID09PSB0cnVlICkgY29uc29sZS5sb2coIHdvcmtsZXRDb2RlIClcblxuICAgIGNvbnN0IHVybCA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKFxuICAgICAgbmV3IEJsb2IoXG4gICAgICAgIFsgd29ya2xldENvZGUgXSwgXG4gICAgICAgIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfVxuICAgICAgKVxuICAgIClcblxuICAgIHJldHVybiBbIHVybCwgd29ya2xldENvZGUsIGlucHV0cywgY2IucGFyYW1zLCBjYi5pc1N0ZXJlbyBdIFxuICB9LFxuXG4gIHJlZ2lzdGVyZWRGb3JOb2RlQXNzaWdubWVudDogW10sXG4gIHJlZ2lzdGVyKCB1Z2VuICkge1xuICAgIGlmKCB0aGlzLnJlZ2lzdGVyZWRGb3JOb2RlQXNzaWdubWVudC5pbmRleE9mKCB1Z2VuICkgPT09IC0xICkge1xuICAgICAgdGhpcy5yZWdpc3RlcmVkRm9yTm9kZUFzc2lnbm1lbnQucHVzaCggdWdlbiApXG4gICAgfVxuICB9LFxuXG4gIHBsYXlXb3JrbGV0KCBncmFwaCwgbmFtZSwgZGVidWc9ZmFsc2UsIG1lbT00NDEwMCAqIDEwICkge1xuICAgIHV0aWxpdGllcy5jbGVhcigpXG5cbiAgICBjb25zdCBbIHVybCwgY29kZVN0cmluZywgaW5wdXRzLCBwYXJhbXMsIGlzU3RlcmVvIF0gPSB1dGlsaXRpZXMuY3JlYXRlV29ya2xldFByb2Nlc3NvciggZ3JhcGgsIG5hbWUsIGRlYnVnLCBtZW0gKVxuXG4gICAgY29uc3Qgbm9kZVByb21pc2UgPSBuZXcgUHJvbWlzZSggKHJlc29sdmUscmVqZWN0KSA9PiB7XG4gICBcbiAgICAgIHV0aWxpdGllcy5jdHguYXVkaW9Xb3JrbGV0LmFkZE1vZHVsZSggdXJsICkudGhlbiggKCk9PiB7XG4gICAgICAgIGNvbnN0IHdvcmtsZXROb2RlID0gbmV3IEF1ZGlvV29ya2xldE5vZGUoIHV0aWxpdGllcy5jdHgsIG5hbWUsIHsgb3V0cHV0Q2hhbm5lbENvdW50OlsgaXNTdGVyZW8gPyAyIDogMSBdIH0pXG5cbiAgICAgICAgd29ya2xldE5vZGUuY2FsbGJhY2tzID0ge31cbiAgICAgICAgd29ya2xldE5vZGUub25tZXNzYWdlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAgICAgICAgIGlmKCBldmVudC5kYXRhLm1lc3NhZ2UgPT09ICdyZXR1cm4nICkge1xuICAgICAgICAgICAgd29ya2xldE5vZGUuY2FsbGJhY2tzWyBldmVudC5kYXRhLmlkeCBdKCBldmVudC5kYXRhLnZhbHVlIClcbiAgICAgICAgICAgIGRlbGV0ZSB3b3JrbGV0Tm9kZS5jYWxsYmFja3NbIGV2ZW50LmRhdGEuaWR4IF1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB3b3JrbGV0Tm9kZS5nZXRNZW1vcnlWYWx1ZSA9IGZ1bmN0aW9uKCBpZHgsIGNiICkge1xuICAgICAgICAgIHRoaXMud29ya2xldENhbGxiYWNrc1sgaWR4IF0gPSBjYlxuICAgICAgICAgIHRoaXMud29ya2xldE5vZGUucG9ydC5wb3N0TWVzc2FnZSh7IGtleTonZ2V0JywgaWR4OiBpZHggfSlcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgd29ya2xldE5vZGUucG9ydC5wb3N0TWVzc2FnZSh7IGtleTonaW5pdCcsIG1lbW9yeTpnZW4ubWVtb3J5LmhlYXAgfSlcbiAgICAgICAgdXRpbGl0aWVzLndvcmtsZXROb2RlID0gd29ya2xldE5vZGVcblxuICAgICAgICB1dGlsaXRpZXMucmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50LmZvckVhY2goIHVnZW4gPT4gdWdlbi5ub2RlID0gd29ya2xldE5vZGUgKVxuICAgICAgICB1dGlsaXRpZXMucmVnaXN0ZXJlZEZvck5vZGVBc3NpZ25tZW50Lmxlbmd0aCA9IDBcblxuICAgICAgICAvLyBhc3NpZ24gYWxsIHBhcmFtcyBhcyBwcm9wZXJ0aWVzIG9mIG5vZGUgZm9yIGVhc2llciByZWZlcmVuY2UgXG4gICAgICAgIGZvciggbGV0IGRpY3Qgb2YgaW5wdXRzLnZhbHVlcygpICkge1xuICAgICAgICAgIGNvbnN0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdXG4gICAgICAgICAgY29uc3QgcGFyYW0gPSB3b3JrbGV0Tm9kZS5wYXJhbWV0ZXJzLmdldCggbmFtZSApXG4gICAgICBcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHdvcmtsZXROb2RlLCBuYW1lLCB7XG4gICAgICAgICAgICBzZXQoIHYgKSB7XG4gICAgICAgICAgICAgIHBhcmFtLnZhbHVlID0gdlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldCgpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHBhcmFtLnZhbHVlXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciggbGV0IHVnZW4gb2YgcGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCB1Z2VuIClcbiAgICAgICAgICBjb25zdCBuYW1lID0gdWdlbi5uYW1lXG4gICAgICAgICAgY29uc3QgcGFyYW0gPSB3b3JrbGV0Tm9kZS5wYXJhbWV0ZXJzLmdldCggbmFtZSApXG4gICAgICAgICAgdWdlbi53YWFwaSA9IHBhcmFtIFxuICAgICAgICAgIC8vIGluaXRpYWxpemU/XG4gICAgICAgICAgcGFyYW0udmFsdWUgPSB1Z2VuLmRlZmF1bHRWYWx1ZVxuXG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB3b3JrbGV0Tm9kZSwgbmFtZSwge1xuICAgICAgICAgICAgc2V0KCB2ICkge1xuICAgICAgICAgICAgICBwYXJhbS52YWx1ZSA9IHZcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgIHJldHVybiBwYXJhbS52YWx1ZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICBpZiggdXRpbGl0aWVzLmNvbnNvbGUgKSB1dGlsaXRpZXMuY29uc29sZS5zZXRWYWx1ZSggY29kZVN0cmluZyApXG5cbiAgICAgICAgd29ya2xldE5vZGUuY29ubmVjdCggdXRpbGl0aWVzLmN0eC5kZXN0aW5hdGlvbiApXG5cbiAgICAgICAgcmVzb2x2ZSggd29ya2xldE5vZGUgKVxuICAgICAgfSlcblxuICAgIH0pXG5cbiAgICByZXR1cm4gbm9kZVByb21pc2VcbiAgfSxcbiAgXG4gIHBsYXlHcmFwaCggZ3JhcGgsIGRlYnVnLCBtZW09NDQxMDAqMTAsIG1lbVR5cGU9RmxvYXQzMkFycmF5ICkge1xuICAgIHV0aWxpdGllcy5jbGVhcigpXG4gICAgaWYoIGRlYnVnID09PSB1bmRlZmluZWQgKSBkZWJ1ZyA9IGZhbHNlXG4gICAgICAgICAgXG4gICAgdGhpcy5pc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIGdyYXBoIClcblxuICAgIHV0aWxpdGllcy5jYWxsYmFjayA9IGdlbi5jcmVhdGVDYWxsYmFjayggZ3JhcGgsIG1lbSwgZGVidWcsIGZhbHNlLCBtZW1UeXBlIClcbiAgICBcbiAgICBpZiggdXRpbGl0aWVzLmNvbnNvbGUgKSB1dGlsaXRpZXMuY29uc29sZS5zZXRWYWx1ZSggdXRpbGl0aWVzLmNhbGxiYWNrLnRvU3RyaW5nKCkgKVxuXG4gICAgcmV0dXJuIHV0aWxpdGllcy5jYWxsYmFja1xuICB9LFxuXG4gIGxvYWRTYW1wbGUoIHNvdW5kRmlsZVBhdGgsIGRhdGEgKSB7XG4gICAgbGV0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgcmVxLm9wZW4oICdHRVQnLCBzb3VuZEZpbGVQYXRoLCB0cnVlIClcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJyBcbiAgICBcbiAgICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSxyZWplY3QpID0+IHtcbiAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGF1ZGlvRGF0YSA9IHJlcS5yZXNwb25zZVxuXG4gICAgICAgIHV0aWxpdGllcy5jdHguZGVjb2RlQXVkaW9EYXRhKCBhdWRpb0RhdGEsIChidWZmZXIpID0+IHtcbiAgICAgICAgICBkYXRhLmJ1ZmZlciA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKVxuICAgICAgICAgIHJlc29sdmUoIGRhdGEuYnVmZmVyIClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmVxLnNlbmQoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG59XG5cbnV0aWxpdGllcy5jbGVhci5jYWxsYmFja3MgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxpdGllc1xuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qXG4gKiBtYW55IHdpbmRvd3MgaGVyZSBhZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2NvcmJhbmJyb29rL2RzcC5qcy9ibG9iL21hc3Rlci9kc3AuanNcbiAqIHN0YXJ0aW5nIGF0IGxpbmUgMTQyN1xuICogdGFrZW4gOC8xNS8xNlxuKi8gXG5cbmNvbnN0IHdpbmRvd3MgPSBtb2R1bGUuZXhwb3J0cyA9IHsgXG4gIGJhcnRsZXR0KCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAyIC8gKGxlbmd0aCAtIDEpICogKChsZW5ndGggLSAxKSAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKSBcbiAgfSxcblxuICBiYXJ0bGV0dEhhbm4oIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNjIgLSAwLjQ4ICogTWF0aC5hYnMoaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAwLjUpIC0gMC4zOCAqIE1hdGguY29zKCAyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGJsYWNrbWFuKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICBsZXQgYTAgPSAoMSAtIGFscGhhKSAvIDIsXG4gICAgICAgIGExID0gMC41LFxuICAgICAgICBhMiA9IGFscGhhIC8gMlxuXG4gICAgcmV0dXJuIGEwIC0gYTEgKiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSArIGEyICogTWF0aC5jb3MoNCAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBjb3NpbmUoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIE1hdGguY29zKE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIE1hdGguUEkgLyAyKVxuICB9LFxuXG4gIGdhdXNzKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICByZXR1cm4gTWF0aC5wb3coTWF0aC5FLCAtMC41ICogTWF0aC5wb3coKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikgLyAoYWxwaGEgKiAobGVuZ3RoIC0gMSkgLyAyKSwgMikpXG4gIH0sXG5cbiAgaGFtbWluZyggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC41NCAtIDAuNDYgKiBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBoYW5uKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjUgKiAoMSAtIE1hdGguY29zKCBNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSApXG4gIH0sXG5cbiAgbGFuY3pvcyggbGVuZ3RoLCBpbmRleCApIHtcbiAgICBsZXQgeCA9IDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIDE7XG4gICAgcmV0dXJuIE1hdGguc2luKE1hdGguUEkgKiB4KSAvIChNYXRoLlBJICogeClcbiAgfSxcblxuICByZWN0YW5ndWxhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMVxuICB9LFxuXG4gIHRyaWFuZ3VsYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDIgLyBsZW5ndGggKiAobGVuZ3RoIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpXG4gIH0sXG5cbiAgLy8gcGFyYWJvbGFcbiAgd2VsY2goIGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0PTAgKSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgY29uc3QgaW5kZXggPSBzaGlmdCA9PT0gMCA/IF9pbmRleCA6IChfaW5kZXggKyBNYXRoLmZsb29yKCBzaGlmdCAqIGxlbmd0aCApKSAlIGxlbmd0aFxuICAgIGNvbnN0IG5fMV9vdmVyMiA9IChsZW5ndGggLSAxKSAvIDIgXG5cbiAgICByZXR1cm4gMSAtIE1hdGgucG93KCAoIGluZGV4IC0gbl8xX292ZXIyICkgLyBuXzFfb3ZlcjIsIDIgKVxuICB9LFxuICBpbnZlcnNld2VsY2goIGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0PTAgKSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgbGV0IGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vciggc2hpZnQgKiBsZW5ndGggKSkgJSBsZW5ndGhcbiAgICBjb25zdCBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyXG5cbiAgICByZXR1cm4gTWF0aC5wb3coICggaW5kZXggLSBuXzFfb3ZlcjIgKSAvIG5fMV9vdmVyMiwgMiApXG4gIH0sXG5cbiAgcGFyYWJvbGEoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgaWYoIGluZGV4IDw9IGxlbmd0aCAvIDIgKSB7XG4gICAgICByZXR1cm4gd2luZG93cy5pbnZlcnNld2VsY2goIGxlbmd0aCAvIDIsIGluZGV4ICkgLSAxXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gMSAtIHdpbmRvd3MuaW52ZXJzZXdlbGNoKCBsZW5ndGggLyAyLCBpbmRleCAtIGxlbmd0aCAvIDIgKVxuICAgIH1cbiAgfSxcblxuICBleHBvbmVudGlhbCggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KCBpbmRleCAvIGxlbmd0aCwgYWxwaGEgKVxuICB9LFxuXG4gIGxpbmVhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gaW5kZXggLyBsZW5ndGhcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vcj0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiAgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid3cmFwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgc2lnbmFsID0gaW5wdXRzWzBdLCBtaW4gPSBpbnB1dHNbMV0sIG1heCA9IGlucHV0c1syXSxcbiAgICAgICAgb3V0LCBkaWZmXG5cbiAgICAvL291dCA9IGAoKCgke2lucHV0c1swXX0gLSAke3RoaXMubWlufSkgJSAke2RpZmZ9ICArICR7ZGlmZn0pICUgJHtkaWZmfSArICR7dGhpcy5taW59KWBcbiAgICAvL2NvbnN0IGxvbmcgbnVtV3JhcHMgPSBsb25nKCh2LWxvKS9yYW5nZSkgLSAodiA8IGxvKTtcbiAgICAvL3JldHVybiB2IC0gcmFuZ2UgKiBkb3VibGUobnVtV3JhcHMpOyAgIFxuICAgIFxuICAgIGlmKCB0aGlzLm1pbiA9PT0gMCApIHtcbiAgICAgIGRpZmYgPSBtYXhcbiAgICB9ZWxzZSBpZiAoIGlzTmFOKCBtYXggKSB8fCBpc05hTiggbWluICkgKSB7XG4gICAgICBkaWZmID0gYCR7bWF4fSAtICR7bWlufWBcbiAgICB9ZWxzZXtcbiAgICAgIGRpZmYgPSBtYXggLSBtaW5cbiAgICB9XG5cbiAgICBvdXQgPVxuYCB2YXIgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XG4gIGlmKCAke3RoaXMubmFtZX0gPCAke3RoaXMubWlufSApICR7dGhpcy5uYW1lfSArPSAke2RpZmZ9XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA+ICR7dGhpcy5tYXh9ICkgJHt0aGlzLm5hbWV9IC09ICR7ZGlmZn1cblxuYFxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCAnICcgKyBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgbWluLCBtYXggXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIE1lbW9yeUhlbHBlciA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIHNpemUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyA0MDk2IDogYXJndW1lbnRzWzBdO1xuICAgIHZhciBtZW10eXBlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gRmxvYXQzMkFycmF5IDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIGhlbHBlciA9IE9iamVjdC5jcmVhdGUodGhpcyk7XG5cbiAgICBPYmplY3QuYXNzaWduKGhlbHBlciwge1xuICAgICAgaGVhcDogbmV3IG1lbXR5cGUoc2l6ZSksXG4gICAgICBsaXN0OiB7fSxcbiAgICAgIGZyZWVMaXN0OiB7fVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGhlbHBlcjtcbiAgfSxcbiAgYWxsb2M6IGZ1bmN0aW9uIGFsbG9jKGFtb3VudCkge1xuICAgIHZhciBpZHggPSAtMTtcblxuICAgIGlmIChhbW91bnQgPiB0aGlzLmhlYXAubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBFcnJvcignQWxsb2NhdGlvbiByZXF1ZXN0IGlzIGxhcmdlciB0aGFuIGhlYXAgc2l6ZSBvZiAnICsgdGhpcy5oZWFwLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuZnJlZUxpc3QpIHtcbiAgICAgIHZhciBjYW5kaWRhdGVTaXplID0gdGhpcy5mcmVlTGlzdFtrZXldO1xuXG4gICAgICBpZiAoY2FuZGlkYXRlU2l6ZSA+PSBhbW91bnQpIHtcbiAgICAgICAgaWR4ID0ga2V5O1xuXG4gICAgICAgIHRoaXMubGlzdFtpZHhdID0gYW1vdW50O1xuXG4gICAgICAgIGlmIChjYW5kaWRhdGVTaXplICE9PSBhbW91bnQpIHtcbiAgICAgICAgICB2YXIgbmV3SW5kZXggPSBpZHggKyBhbW91bnQsXG4gICAgICAgICAgICAgIG5ld0ZyZWVTaXplID0gdm9pZCAwO1xuXG4gICAgICAgICAgZm9yICh2YXIgX2tleSBpbiB0aGlzLmxpc3QpIHtcbiAgICAgICAgICAgIGlmIChfa2V5ID4gbmV3SW5kZXgpIHtcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSBfa2V5IC0gbmV3SW5kZXg7XG4gICAgICAgICAgICAgIHRoaXMuZnJlZUxpc3RbbmV3SW5kZXhdID0gbmV3RnJlZVNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGlkeCAhPT0gLTEgKSBkZWxldGUgdGhpcy5mcmVlTGlzdFsgaWR4IF1cblxuICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMubGlzdCksXG4gICAgICAgICAgbGFzdEluZGV4ID0gdm9pZCAwO1xuXG4gICAgICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gaWYgbm90IGZpcnN0IGFsbG9jYXRpb24uLi5cbiAgICAgICAgbGFzdEluZGV4ID0gcGFyc2VJbnQoa2V5c1trZXlzLmxlbmd0aCAtIDFdKTtcblxuICAgICAgICBpZHggPSBsYXN0SW5kZXggKyB0aGlzLmxpc3RbbGFzdEluZGV4XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlkeCA9IDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGlzdFtpZHhdID0gYW1vdW50O1xuICAgIH1cblxuICAgIGlmIChpZHggKyBhbW91bnQgPj0gdGhpcy5oZWFwLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ05vIGF2YWlsYWJsZSBibG9ja3MgcmVtYWluIHN1ZmZpY2llbnQgZm9yIGFsbG9jYXRpb24gcmVxdWVzdC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGlkeDtcbiAgfSxcbiAgZnJlZTogZnVuY3Rpb24gZnJlZShpbmRleCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5saXN0W2luZGV4XSAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IEVycm9yKCdDYWxsaW5nIGZyZWUoKSBvbiBub24tZXhpc3RpbmcgYmxvY2suJyk7XG4gICAgfVxuXG4gICAgdGhpcy5saXN0W2luZGV4XSA9IDA7XG5cbiAgICB2YXIgc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMubGlzdCkge1xuICAgICAgaWYgKGtleSA+IGluZGV4KSB7XG4gICAgICAgIHNpemUgPSBrZXkgLSBpbmRleDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5mcmVlTGlzdFtpbmRleF0gPSBzaXplO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUhlbHBlcjtcbiJdfQ==
