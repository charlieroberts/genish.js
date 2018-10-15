(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.genish = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
    var decayTime = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 44100;

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
        if (typeof ugen.onload === 'function') ugen.onload();
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
    var t = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : .5;

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
  var propName = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
  var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

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
    accum = require('./accum.js'),
    div = require('./div.js');

module.exports = function () {
  var frequency = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 440;
  var pulsewidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : .5;

  var graph = lt(accum(div(frequency, 44100)), pulsewidth);

  graph.name = 'train' + gen.getUID();

  return graph;
};

},{"./accum.js":2,"./div.js":23,"./gen.js":30,"./lt.js":38}],71:[function(require,module,exports){
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

},{"./floor.js":27,"./gen.js":30,"./memo.js":42,"./sub.js":65}],74:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZC5qcyIsImpzL2FkZC5qcyIsImpzL2Fkc3IuanMiLCJqcy9hbmQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2F0dGFjay5qcyIsImpzL2JhbmcuanMiLCJqcy9ib29sLmpzIiwianMvY2VpbC5qcyIsImpzL2NsYW1wLmpzIiwianMvY29zLmpzIiwianMvY291bnRlci5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RjYmxvY2suanMiLCJqcy9kZWNheS5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9lbnYuanMiLCJqcy9lcS5qcyIsImpzL2V4cC5qcyIsImpzL2Zsb29yLmpzIiwianMvZm9sZC5qcyIsImpzL2dhdGUuanMiLCJqcy9nZW4uanMiLCJqcy9ndC5qcyIsImpzL2d0ZS5qcyIsImpzL2d0cC5qcyIsImpzL2hpc3RvcnkuanMiLCJqcy9pZmVsc2VpZi5qcyIsImpzL2luLmpzIiwianMvaW5kZXguanMiLCJqcy9sdC5qcyIsImpzL2x0ZS5qcyIsImpzL2x0cC5qcyIsImpzL21heC5qcyIsImpzL21lbW8uanMiLCJqcy9taW4uanMiLCJqcy9taXguanMiLCJqcy9tb2QuanMiLCJqcy9tc3Rvc2FtcHMuanMiLCJqcy9tdG9mLmpzIiwianMvbXVsLmpzIiwianMvbmVxLmpzIiwianMvbm9pc2UuanMiLCJqcy9ub3QuanMiLCJqcy9wYW4uanMiLCJqcy9wYXJhbS5qcyIsImpzL3BlZWsuanMiLCJqcy9waGFzb3IuanMiLCJqcy9wb2tlLmpzIiwianMvcG93LmpzIiwianMvcmF0ZS5qcyIsImpzL3JvdW5kLmpzIiwianMvc2FoLmpzIiwianMvc2VsZWN0b3IuanMiLCJqcy9zaWduLmpzIiwianMvc2luLmpzIiwianMvc2xpZGUuanMiLCJqcy9zdWIuanMiLCJqcy9zd2l0Y2guanMiLCJqcy90NjAuanMiLCJqcy90YW4uanMiLCJqcy90YW5oLmpzIiwianMvdHJhaW4uanMiLCJqcy91dGlsaXRpZXMuanMiLCJqcy93aW5kb3dzLmpzIiwianMvd3JhcC5qcyIsIm5vZGVfbW9kdWxlcy9tZW1vcnktaGVscGVyL2luZGV4LnRyYW5zcGlsZWQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLEtBREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EsUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQUosRUFBeUI7QUFDdkIsV0FBSSxRQUFKLENBQWEsR0FBYixxQkFBcUIsS0FBSyxJQUExQixFQUFrQyxLQUFLLEdBQXZDOztBQUVBLDBCQUFrQixPQUFPLENBQVAsQ0FBbEI7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssR0FBTCxDQUFVLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBVixDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFqQlMsQ0FBWjs7QUFvQkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYjs7QUFFQSxTQUFPLEdBQVA7QUFDRCxDQU5EOzs7QUN4QkE7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxPQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLGFBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiO0FBQUEsUUFFSSxVQUFVLFNBQVMsS0FBSyxJQUY1QjtBQUFBLFFBR0kscUJBSEo7O0FBS0EsU0FBSSxhQUFKLENBQW1CLEtBQUssTUFBeEI7O0FBRUEsU0FBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQW5DLElBQTJDLEtBQUssWUFBaEQ7O0FBRUEsbUJBQWUsS0FBSyxRQUFMLENBQWUsT0FBZixFQUF3QixPQUFPLENBQVAsQ0FBeEIsRUFBbUMsT0FBTyxDQUFQLENBQW5DLGNBQXdELEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBMUUsT0FBZjs7QUFFQSxTQUFJLFFBQUosQ0FBYSxHQUFiLHFCQUFxQixLQUFLLElBQTFCLEVBQWtDLElBQWxDOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQUwsR0FBWSxRQUFwQzs7QUFFQSxXQUFPLENBQUUsS0FBSyxJQUFMLEdBQVksUUFBZCxFQUF3QixZQUF4QixDQUFQO0FBQ0QsR0FwQlM7QUFzQlYsVUF0QlUsb0JBc0JBLEtBdEJBLEVBc0JPLEtBdEJQLEVBc0JjLE1BdEJkLEVBc0JzQixRQXRCdEIsRUFzQmlDO0FBQ3pDLFFBQUksT0FBTyxLQUFLLEdBQUwsR0FBVyxLQUFLLEdBQTNCO0FBQUEsUUFDSSxNQUFNLEVBRFY7QUFBQSxRQUVJLE9BQU8sRUFGWDs7QUFJQTs7Ozs7Ozs7QUFRQTtBQUNBLFFBQUksRUFBRSxPQUFPLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBUCxLQUEwQixRQUExQixJQUFzQyxLQUFLLE1BQUwsQ0FBWSxDQUFaLElBQWlCLENBQXpELENBQUosRUFBa0U7QUFDaEUsVUFBSSxLQUFLLFVBQUwsS0FBb0IsS0FBSyxHQUE3QixFQUFtQzs7QUFFakMsMEJBQWdCLE1BQWhCLGVBQWdDLFFBQWhDLFdBQThDLEtBQUssVUFBbkQ7QUFDQTtBQUNELE9BSkQsTUFJSztBQUNILDBCQUFnQixNQUFoQixlQUFnQyxRQUFoQyxXQUE4QyxLQUFLLEdBQW5EO0FBQ0E7QUFDRDtBQUNGOztBQUVELHNCQUFnQixLQUFLLElBQXJCLGlCQUFxQyxRQUFyQzs7QUFFQSxRQUFJLEtBQUssVUFBTCxLQUFvQixLQUFwQixJQUE2QixLQUFLLFdBQUwsS0FBcUIsSUFBdEQsRUFBNkQ7QUFDM0Qsd0JBQWdCLFFBQWhCLFdBQThCLEtBQUssR0FBbkMsV0FBNkMsUUFBN0MsWUFBNEQsS0FBNUQ7QUFDRCxLQUZELE1BRUs7QUFDSCxvQkFBWSxRQUFaLFlBQTJCLEtBQTNCLFFBREcsQ0FDa0M7QUFDdEM7O0FBRUQsUUFBSSxLQUFLLEdBQUwsS0FBYSxRQUFiLElBQTBCLEtBQUssYUFBbkMsRUFBbUQsbUJBQWlCLFFBQWpCLFlBQWdDLEtBQUssR0FBckMsV0FBOEMsUUFBOUMsWUFBNkQsSUFBN0Q7QUFDbkQsUUFBSSxLQUFLLEdBQUwsS0FBYSxDQUFDLFFBQWQsSUFBMEIsS0FBSyxhQUFuQyxFQUFtRCxtQkFBaUIsUUFBakIsV0FBK0IsS0FBSyxHQUFwQyxXQUE2QyxRQUE3QyxZQUE0RCxJQUE1RDs7QUFFbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsVUFBTSxNQUFNLElBQU4sR0FBYSxJQUFuQjs7QUFFQSxXQUFPLEdBQVA7QUFDRCxHQXJFUzs7O0FBdUVWLFlBQVcsRUFBRSxLQUFJLENBQU4sRUFBUyxLQUFJLENBQWIsRUFBZ0IsWUFBVyxDQUEzQixFQUE4QixjQUFhLENBQTNDLEVBQThDLFlBQVcsSUFBekQsRUFBK0QsZUFBZSxJQUE5RSxFQUFvRixlQUFjLElBQWxHLEVBQXdHLGFBQVksS0FBcEg7QUF2RUQsQ0FBWjs7QUEwRUEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsSUFBRixFQUFpQztBQUFBLE1BQXpCLEtBQXlCLHVFQUFuQixDQUFtQjtBQUFBLE1BQWhCLFVBQWdCOztBQUNoRCxNQUFNLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFiOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFDRTtBQUNFLFNBQVEsS0FBSSxNQUFKLEVBRFY7QUFFRSxZQUFRLENBQUUsSUFBRixFQUFRLEtBQVIsQ0FGVjtBQUdFLFlBQVE7QUFDTixhQUFPLEVBQUUsUUFBTyxDQUFULEVBQVksS0FBSSxJQUFoQjtBQUREO0FBSFYsR0FERixFQVFFLE1BQU0sUUFSUixFQVNFLFVBVEY7O0FBWUEsTUFBSSxlQUFlLFNBQWYsSUFBNEIsV0FBVyxhQUFYLEtBQTZCLFNBQXpELElBQXNFLFdBQVcsYUFBWCxLQUE2QixTQUF2RyxFQUFtSDtBQUNqSCxRQUFJLFdBQVcsVUFBWCxLQUEwQixTQUE5QixFQUEwQztBQUN4QyxXQUFLLGFBQUwsR0FBcUIsS0FBSyxhQUFMLEdBQXFCLFdBQVcsVUFBckQ7QUFDRDtBQUNGOztBQUVELE1BQUksZUFBZSxTQUFmLElBQTRCLFdBQVcsVUFBWCxLQUEwQixTQUExRCxFQUFzRTtBQUNwRSxTQUFLLFVBQUwsR0FBa0IsS0FBSyxHQUF2QjtBQUNEOztBQUVELE1BQUksS0FBSyxZQUFMLEtBQXNCLFNBQTFCLEVBQXNDLEtBQUssWUFBTCxHQUFvQixLQUFLLEdBQXpCOztBQUV0QyxTQUFPLGNBQVAsQ0FBdUIsSUFBdkIsRUFBNkIsT0FBN0IsRUFBc0M7QUFDcEMsT0FEb0MsaUJBQzdCO0FBQ0w7QUFDQSxhQUFPLEtBQUksTUFBSixDQUFXLElBQVgsQ0FBaUIsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFuQyxDQUFQO0FBQ0QsS0FKbUM7QUFLcEMsT0FMb0MsZUFLaEMsQ0FMZ0MsRUFLN0I7QUFBRSxXQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbkMsSUFBMkMsQ0FBM0M7QUFBOEM7QUFMbkIsR0FBdEM7O0FBUUEsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFwQixHQUErQixLQUFLLEdBQXBDOztBQUVBLFNBQU8sSUFBUDtBQUNELENBdENEOzs7QUM5RUE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsTUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2QixXQUFJLFFBQUosQ0FBYSxHQUFiLENBQWlCLEVBQUUsUUFBUSxLQUFLLElBQWYsRUFBakI7O0FBRUEsMkJBQW1CLE9BQU8sQ0FBUCxDQUFuQjtBQUVELEtBTEQsTUFLTztBQUNMLFlBQU0sS0FBSyxJQUFMLENBQVcsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFYLENBQU47QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQWpCUyxDQUFaOztBQW9CQSxPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBLE9BQUssTUFBTCxHQUFjLENBQUUsQ0FBRixDQUFkO0FBQ0EsT0FBSyxFQUFMLEdBQVUsS0FBSSxNQUFKLEVBQVY7QUFDQSxPQUFLLElBQUwsR0FBZSxLQUFLLFFBQXBCOztBQUVBLFNBQU8sSUFBUDtBQUNELENBUkQ7OztBQ3hCQTs7QUFFQSxJQUFJLE1BQVcsUUFBUyxVQUFULENBQWY7QUFBQSxJQUNJLE1BQVcsUUFBUyxVQUFULENBRGY7QUFBQSxJQUVJLE1BQVcsUUFBUyxVQUFULENBRmY7QUFBQSxJQUdJLE1BQVcsUUFBUyxVQUFULENBSGY7QUFBQSxJQUlJLE9BQVcsUUFBUyxXQUFULENBSmY7QUFBQSxJQUtJLE9BQVcsUUFBUyxXQUFULENBTGY7QUFBQSxJQU1JLFFBQVcsUUFBUyxZQUFULENBTmY7QUFBQSxJQU9JLFNBQVcsUUFBUyxlQUFULENBUGY7QUFBQSxJQVFJLEtBQVcsUUFBUyxTQUFULENBUmY7QUFBQSxJQVNJLE9BQVcsUUFBUyxXQUFULENBVGY7QUFBQSxJQVVJLE1BQVcsUUFBUyxVQUFULENBVmY7QUFBQSxJQVdJLE1BQVcsUUFBUyxVQUFULENBWGY7QUFBQSxJQVlJLE9BQVcsUUFBUyxXQUFULENBWmY7QUFBQSxJQWFJLE1BQVcsUUFBUyxVQUFULENBYmY7QUFBQSxJQWNJLE1BQVcsUUFBUyxVQUFULENBZGY7QUFBQSxJQWVJLE1BQVcsUUFBUyxVQUFULENBZmY7QUFBQSxJQWdCSSxPQUFXLFFBQVMsV0FBVCxDQWhCZjs7QUFrQkEsT0FBTyxPQUFQLEdBQWlCLFlBQXFEO0FBQUEsTUFBbkQsVUFBbUQsdUVBQXRDLEtBQXNDO0FBQUEsTUFBL0IsU0FBK0IsdUVBQW5CLEtBQW1CO0FBQUEsTUFBWixNQUFZOztBQUNwRSxNQUFNLFFBQVEsT0FBTyxNQUFQLENBQWMsRUFBZCxFQUFrQixFQUFFLE9BQU0sYUFBUixFQUF1QixPQUFNLENBQTdCLEVBQWdDLFNBQVEsSUFBeEMsRUFBbEIsRUFBa0UsTUFBbEUsQ0FBZDtBQUNBLE1BQU0sUUFBUSxNQUFNLE9BQU4sS0FBa0IsSUFBbEIsR0FBeUIsTUFBTSxPQUEvQixHQUF5QyxNQUF2RDtBQUFBLE1BQ00sUUFBUSxNQUFPLENBQVAsRUFBVSxLQUFWLEVBQWlCLEVBQUUsS0FBSSxDQUFOLEVBQVMsS0FBSyxRQUFkLEVBQXdCLGNBQWEsQ0FBQyxRQUF0QyxFQUFnRCxZQUFXLEtBQTNELEVBQWpCLENBRGQ7O0FBR0EsTUFBSSxtQkFBSjtBQUFBLE1BQWdCLDBCQUFoQjtBQUFBLE1BQW1DLGtCQUFuQztBQUFBLE1BQThDLFlBQTlDO0FBQUEsTUFBbUQsZUFBbkQ7O0FBRUE7QUFDQSxNQUFJLGVBQWUsS0FBTSxDQUFDLENBQUQsQ0FBTixDQUFuQjs7QUFFQTtBQUNBLE1BQUksTUFBTSxLQUFOLEtBQWdCLFFBQXBCLEVBQStCO0FBQzdCLFVBQU0sT0FDSixJQUFLLElBQUssS0FBTCxFQUFZLENBQVosQ0FBTCxFQUFxQixHQUFJLEtBQUosRUFBVyxVQUFYLENBQXJCLENBREksRUFFSixJQUFLLEtBQUwsRUFBWSxVQUFaLENBRkksRUFJSixJQUFLLElBQUssS0FBTCxFQUFZLENBQVosQ0FBTCxFQUFzQixHQUFJLEtBQUosRUFBVyxJQUFLLFVBQUwsRUFBaUIsU0FBakIsQ0FBWCxDQUF0QixDQUpJLEVBS0osSUFBSyxDQUFMLEVBQVEsSUFBSyxJQUFLLEtBQUwsRUFBWSxVQUFaLENBQUwsRUFBK0IsU0FBL0IsQ0FBUixDQUxJLEVBT0osSUFBSyxLQUFMLEVBQVksQ0FBQyxRQUFiLENBUEksRUFRSixLQUFNLFlBQU4sRUFBb0IsQ0FBcEIsRUFBdUIsQ0FBdkIsRUFBMEIsRUFBRSxRQUFPLENBQVQsRUFBMUIsQ0FSSSxFQVVKLENBVkksQ0FBTjtBQVlELEdBYkQsTUFhTztBQUNMLGlCQUFhLElBQUksRUFBRSxRQUFPLElBQVQsRUFBZSxNQUFLLE1BQU0sS0FBMUIsRUFBaUMsT0FBTSxNQUFNLEtBQTdDLEVBQUosQ0FBYjtBQUNBLHdCQUFvQixJQUFJLEVBQUUsUUFBTyxJQUFULEVBQWUsTUFBSyxNQUFNLEtBQTFCLEVBQWlDLE9BQU0sTUFBTSxLQUE3QyxFQUFvRCxTQUFRLElBQTVELEVBQUosQ0FBcEI7O0FBRUEsVUFBTSxPQUNKLElBQUssSUFBSyxLQUFMLEVBQVksQ0FBWixDQUFMLEVBQXFCLEdBQUksS0FBSixFQUFXLFVBQVgsQ0FBckIsQ0FESSxFQUVKLEtBQU0sVUFBTixFQUFrQixJQUFLLEtBQUwsRUFBWSxVQUFaLENBQWxCLEVBQTRDLEVBQUUsV0FBVSxPQUFaLEVBQTVDLENBRkksRUFJSixJQUFLLElBQUksS0FBSixFQUFVLENBQVYsQ0FBTCxFQUFtQixHQUFJLEtBQUosRUFBVyxJQUFLLFVBQUwsRUFBaUIsU0FBakIsQ0FBWCxDQUFuQixDQUpJLEVBS0osS0FBTSxpQkFBTixFQUF5QixJQUFLLElBQUssS0FBTCxFQUFZLFVBQVosQ0FBTCxFQUErQixTQUEvQixDQUF6QixFQUFxRSxFQUFFLFdBQVUsT0FBWixFQUFyRSxDQUxJLEVBT0osSUFBSyxLQUFMLEVBQVksQ0FBQyxRQUFiLENBUEksRUFRSixLQUFNLFlBQU4sRUFBb0IsQ0FBcEIsRUFBdUIsQ0FBdkIsRUFBMEIsRUFBRSxRQUFPLENBQVQsRUFBMUIsQ0FSSSxFQVVKLENBVkksQ0FBTjtBQVlEOztBQUVELE1BQUksVUFBSixHQUFpQjtBQUFBLFdBQUssSUFBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixhQUFhLE1BQWIsQ0FBb0IsTUFBcEIsQ0FBMkIsR0FBNUMsQ0FBTDtBQUFBLEdBQWpCOztBQUVBLE1BQUksT0FBSixHQUFjLFlBQUs7QUFDakIsUUFBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixhQUFhLE1BQWIsQ0FBb0IsTUFBcEIsQ0FBMkIsR0FBNUMsSUFBb0QsQ0FBcEQ7QUFDQSxVQUFNLE9BQU47QUFDRCxHQUhEOztBQUtBLFNBQU8sR0FBUDtBQUNELENBbEREOzs7QUNwQkE7O0FBRUEsSUFBTSxPQUFNLFFBQVEsVUFBUixDQUFaOztBQUVBLElBQU0sUUFBUTtBQUNaLFlBQVMsS0FERztBQUVaLEtBRlksaUJBRU47QUFDSixRQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiO0FBQUEsUUFDSSxNQUFJLEVBRFI7QUFBQSxRQUVJLE1BQU0sQ0FGVjtBQUFBLFFBRWEsV0FBVyxDQUZ4QjtBQUFBLFFBRTJCLGFBQWEsS0FGeEM7QUFBQSxRQUUrQyxvQkFBb0IsSUFGbkU7O0FBSUEsUUFBSSxPQUFPLE1BQVAsS0FBa0IsQ0FBdEIsRUFBMEIsT0FBTyxDQUFQOztBQUUxQixxQkFBZSxLQUFLLElBQXBCOztBQUVBLFdBQU8sT0FBUCxDQUFnQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDdkIsVUFBSSxNQUFPLENBQVAsQ0FBSixFQUFpQjtBQUNmLGVBQU8sQ0FBUDtBQUNBLFlBQUksSUFBSSxPQUFPLE1BQVAsR0FBZSxDQUF2QixFQUEyQjtBQUN6Qix1QkFBYSxJQUFiO0FBQ0EsaUJBQU8sS0FBUDtBQUNEO0FBQ0QsNEJBQW9CLEtBQXBCO0FBQ0QsT0FQRCxNQU9LO0FBQ0gsZUFBTyxXQUFZLENBQVosQ0FBUDtBQUNBO0FBQ0Q7QUFDRixLQVpEOztBQWNBLFFBQUksV0FBVyxDQUFmLEVBQW1CO0FBQ2pCLGFBQU8sY0FBYyxpQkFBZCxHQUFrQyxHQUFsQyxHQUF3QyxRQUFRLEdBQXZEO0FBQ0Q7O0FBRUQsV0FBTyxJQUFQOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQTdCOztBQUVBLFdBQU8sQ0FBRSxLQUFLLElBQVAsRUFBYSxHQUFiLENBQVA7QUFDRDtBQWxDVyxDQUFkOztBQXFDQSxPQUFPLE9BQVAsR0FBaUIsWUFBZTtBQUFBLG9DQUFWLElBQVU7QUFBVixRQUFVO0FBQUE7O0FBQzlCLE1BQU0sTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVo7QUFDQSxNQUFJLEVBQUosR0FBUyxLQUFJLE1BQUosRUFBVDtBQUNBLE1BQUksSUFBSixHQUFXLElBQUksUUFBSixHQUFlLElBQUksRUFBOUI7QUFDQSxNQUFJLE1BQUosR0FBYSxJQUFiOztBQUVBLFNBQU8sR0FBUDtBQUNELENBUEQ7OztBQ3pDQTs7QUFFQSxJQUFJLE1BQVcsUUFBUyxVQUFULENBQWY7QUFBQSxJQUNJLE1BQVcsUUFBUyxVQUFULENBRGY7QUFBQSxJQUVJLE1BQVcsUUFBUyxVQUFULENBRmY7QUFBQSxJQUdJLE1BQVcsUUFBUyxVQUFULENBSGY7QUFBQSxJQUlJLE9BQVcsUUFBUyxXQUFULENBSmY7QUFBQSxJQUtJLE9BQVcsUUFBUyxXQUFULENBTGY7QUFBQSxJQU1JLFFBQVcsUUFBUyxZQUFULENBTmY7QUFBQSxJQU9JLFNBQVcsUUFBUyxlQUFULENBUGY7QUFBQSxJQVFJLEtBQVcsUUFBUyxTQUFULENBUmY7QUFBQSxJQVNJLE9BQVcsUUFBUyxXQUFULENBVGY7QUFBQSxJQVVJLE1BQVcsUUFBUyxVQUFULENBVmY7QUFBQSxJQVdJLFFBQVcsUUFBUyxZQUFULENBWGY7QUFBQSxJQVlJLE1BQVcsUUFBUyxVQUFULENBWmY7QUFBQSxJQWFJLE1BQVcsUUFBUyxVQUFULENBYmY7QUFBQSxJQWNJLE1BQVcsUUFBUyxVQUFULENBZGY7QUFBQSxJQWVJLE1BQVcsUUFBUyxVQUFULENBZmY7QUFBQSxJQWdCSSxNQUFXLFFBQVMsVUFBVCxDQWhCZjtBQUFBLElBaUJJLE9BQVcsUUFBUyxXQUFULENBakJmOztBQW1CQSxPQUFPLE9BQVAsR0FBaUIsWUFBcUc7QUFBQSxNQUFuRyxVQUFtRyx1RUFBeEYsRUFBd0Y7QUFBQSxNQUFwRixTQUFvRix1RUFBMUUsS0FBMEU7QUFBQSxNQUFuRSxXQUFtRSx1RUFBdkQsS0FBdUQ7QUFBQSxNQUFoRCxZQUFnRCx1RUFBbkMsRUFBbUM7QUFBQSxNQUEvQixXQUErQix1RUFBbkIsS0FBbUI7QUFBQSxNQUFaLE1BQVk7O0FBQ3BILE1BQUksYUFBYSxNQUFqQjtBQUFBLE1BQ0ksUUFBUSxNQUFPLENBQVAsRUFBVSxVQUFWLEVBQXNCLEVBQUUsS0FBSyxRQUFQLEVBQWlCLFlBQVcsS0FBNUIsRUFBbUMsY0FBYSxRQUFoRCxFQUF0QixDQURaO0FBQUEsTUFFSSxnQkFBZ0IsTUFBTyxDQUFQLENBRnBCO0FBQUEsTUFHSSxXQUFXO0FBQ1IsV0FBTyxhQURDO0FBRVIsV0FBTyxDQUZDO0FBR1Isb0JBQWdCO0FBSFIsR0FIZjtBQUFBLE1BUUksUUFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLFFBQWxCLEVBQTRCLE1BQTVCLENBUlo7QUFBQSxNQVNJLG1CQVRKO0FBQUEsTUFTZ0Isa0JBVGhCO0FBQUEsTUFTMkIsWUFUM0I7QUFBQSxNQVNnQyxlQVRoQztBQUFBLE1BU3dDLHlCQVR4QztBQUFBLE1BUzBELHFCQVQxRDtBQUFBLE1BU3dFLHlCQVR4RTs7QUFZQSxNQUFNLGVBQWUsS0FBTSxDQUFDLENBQUQsQ0FBTixDQUFyQjs7QUFFQSxlQUFhLElBQUksRUFBRSxRQUFPLElBQVQsRUFBZSxPQUFNLE1BQU0sS0FBM0IsRUFBa0MsT0FBTSxDQUF4QyxFQUEyQyxNQUFLLE1BQU0sS0FBdEQsRUFBSixDQUFiOztBQUVBLHFCQUFtQixNQUFNLGNBQU4sR0FDZixhQURlLEdBRWYsR0FBSSxLQUFKLEVBQVcsSUFBSyxVQUFMLEVBQWlCLFNBQWpCLEVBQTRCLFdBQTVCLENBQVgsQ0FGSjs7QUFJQSxpQkFBZSxNQUFNLGNBQU4sR0FDWCxJQUFLLElBQUssWUFBTCxFQUFtQixNQUFPLElBQUssWUFBTCxFQUFtQixXQUFuQixDQUFQLEVBQTBDLENBQTFDLEVBQTZDLEVBQUUsWUFBVyxLQUFiLEVBQTdDLENBQW5CLENBQUwsRUFBOEYsQ0FBOUYsQ0FEVyxHQUVYLElBQUssWUFBTCxFQUFtQixJQUFLLElBQUssSUFBSyxLQUFMLEVBQVksSUFBSyxVQUFMLEVBQWlCLFNBQWpCLEVBQTRCLFdBQTVCLENBQVosQ0FBTCxFQUE4RCxXQUE5RCxDQUFMLEVBQWtGLFlBQWxGLENBQW5CLENBRkosRUFJQSxtQkFBbUIsTUFBTSxjQUFOLEdBQ2YsSUFBSyxhQUFMLENBRGUsR0FFZixHQUFJLEtBQUosRUFBVyxJQUFLLFVBQUwsRUFBaUIsU0FBakIsRUFBNEIsV0FBNUIsRUFBeUMsV0FBekMsQ0FBWCxDQU5KOztBQVFBLFFBQU07QUFDSjtBQUNBLEtBQUksS0FBSixFQUFZLFVBQVosQ0FGSSxFQUdKLEtBQU0sVUFBTixFQUFrQixJQUFLLEtBQUwsRUFBWSxVQUFaLENBQWxCLEVBQTRDLEVBQUUsV0FBVSxPQUFaLEVBQTVDLENBSEk7O0FBS0o7QUFDQSxLQUFJLEtBQUosRUFBVyxJQUFLLFVBQUwsRUFBaUIsU0FBakIsQ0FBWCxDQU5JLEVBT0osS0FBTSxVQUFOLEVBQWtCLElBQUssQ0FBTCxFQUFRLElBQUssSUFBSyxJQUFLLEtBQUwsRUFBYSxVQUFiLENBQUwsRUFBaUMsU0FBakMsQ0FBTCxFQUFtRCxJQUFLLENBQUwsRUFBUyxZQUFULENBQW5ELENBQVIsQ0FBbEIsRUFBMEcsRUFBRSxXQUFVLE9BQVosRUFBMUcsQ0FQSTs7QUFTSjtBQUNBLE1BQUssZ0JBQUwsRUFBdUIsSUFBSyxLQUFMLEVBQVksUUFBWixDQUF2QixDQVZJLEVBV0osS0FBTSxVQUFOLEVBQW1CLFlBQW5CLENBWEk7O0FBYUo7QUFDQSxrQkFkSSxFQWNjO0FBQ2xCLE9BQ0UsVUFERixFQUVFLFlBRkY7QUFHRTtBQUNBLElBQUUsV0FBVSxPQUFaLEVBSkYsQ0FmSSxFQXNCSixJQUFLLEtBQUwsRUFBWSxRQUFaLENBdEJJLEVBdUJKLEtBQU0sWUFBTixFQUFvQixDQUFwQixFQUF1QixDQUF2QixFQUEwQixFQUFFLFFBQU8sQ0FBVCxFQUExQixDQXZCSSxFQXlCSixDQXpCSSxDQUFOOztBQTRCQSxNQUFJLE9BQUosR0FBYyxZQUFLO0FBQ2pCLGtCQUFjLEtBQWQsR0FBc0IsQ0FBdEI7QUFDQSxlQUFXLE9BQVg7QUFDRCxHQUhEOztBQUtBLE1BQUksVUFBSixHQUFpQjtBQUFBLFdBQUssSUFBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixhQUFhLE1BQWIsQ0FBb0IsTUFBcEIsQ0FBMkIsR0FBNUMsQ0FBTDtBQUFBLEdBQWpCOztBQUVBLE1BQUksT0FBSixHQUFjLFlBQUs7QUFDakIsa0JBQWMsS0FBZCxHQUFzQixDQUF0QjtBQUNBO0FBQ0E7QUFDQSxRQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLGFBQWEsTUFBYixDQUFvQixDQUFwQixFQUF1QixNQUF2QixDQUE4QixDQUE5QixFQUFpQyxNQUFqQyxDQUF3QyxLQUF4QyxDQUE4QyxHQUEvRCxJQUF1RSxDQUF2RTtBQUNELEdBTEQ7O0FBT0EsU0FBTyxHQUFQO0FBQ0QsQ0F4RUQ7OztBQ3JCQTs7QUFFQSxJQUFJLE9BQU0sUUFBUyxVQUFULENBQVY7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxLQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiO0FBQUEsUUFBb0MsWUFBcEM7O0FBRUEscUJBQWUsS0FBSyxJQUFwQixZQUErQixPQUFPLENBQVAsQ0FBL0Isa0JBQXFELE9BQU8sQ0FBUCxDQUFyRDs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsU0FBMkIsS0FBSyxJQUFoQzs7QUFFQSxXQUFPLE1BQUssS0FBSyxJQUFWLEVBQWtCLEdBQWxCLENBQVA7QUFDRDtBQVhTLENBQVo7O0FBZUEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsR0FBRixFQUFPLEdBQVAsRUFBZ0I7QUFDL0IsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDtBQUNBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsU0FBUyxLQUFJLE1BQUosRUFEVTtBQUVuQixZQUFTLENBQUUsR0FBRixFQUFPLEdBQVA7QUFGVSxHQUFyQjs7QUFLQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUssR0FBcEM7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FWRDs7O0FDbkJBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLE1BREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EsUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQUosRUFBeUI7QUFDdkIsV0FBSSxRQUFKLENBQWEsR0FBYixDQUFpQixFQUFFLFFBQVEsS0FBSyxJQUFmLEVBQWpCOztBQUVBLDJCQUFtQixPQUFPLENBQVAsQ0FBbkI7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssSUFBTCxDQUFXLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBWCxDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFqQlMsQ0FBWjs7QUFvQkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxPQUFLLE1BQUwsR0FBYyxDQUFFLENBQUYsQ0FBZDtBQUNBLE9BQUssRUFBTCxHQUFVLEtBQUksTUFBSixFQUFWO0FBQ0EsT0FBSyxJQUFMLEdBQWUsS0FBSyxRQUFwQjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQVJEOzs7QUN4QkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsTUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2QixXQUFJLFFBQUosQ0FBYSxHQUFiLENBQWlCLEVBQUUsUUFBUSxLQUFLLElBQWYsRUFBakI7O0FBRUEsMkJBQW1CLE9BQU8sQ0FBUCxDQUFuQjtBQUVELEtBTEQsTUFLTztBQUNMLFlBQU0sS0FBSyxJQUFMLENBQVcsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFYLENBQU47QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQWpCUyxDQUFaOztBQW9CQSxPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBLE9BQUssTUFBTCxHQUFjLENBQUUsQ0FBRixDQUFkO0FBQ0EsT0FBSyxFQUFMLEdBQVUsS0FBSSxNQUFKLEVBQVY7QUFDQSxPQUFLLElBQUwsR0FBZSxLQUFLLFFBQXBCOztBQUVBLFNBQU8sSUFBUDtBQUNELENBUkQ7OztBQ3hCQTs7QUFFQSxJQUFJLE1BQVUsUUFBUyxVQUFULENBQWQ7QUFBQSxJQUNJLFVBQVUsUUFBUyxjQUFULENBRGQ7QUFBQSxJQUVJLE1BQVUsUUFBUyxVQUFULENBRmQ7QUFBQSxJQUdJLE1BQVUsUUFBUyxVQUFULENBSGQ7O0FBS0EsT0FBTyxPQUFQLEdBQWlCLFlBQXlCO0FBQUEsUUFBdkIsU0FBdUIsdUVBQVgsS0FBVzs7QUFDeEMsUUFBSSxNQUFNLFFBQVUsQ0FBVixDQUFWO0FBQUEsUUFDSSxNQUFNLEtBQUssR0FBTCxDQUFVLENBQUMsY0FBRCxHQUFrQixTQUE1QixDQURWOztBQUdBLFFBQUksRUFBSixDQUFRLElBQUssSUFBSSxHQUFULEVBQWMsR0FBZCxDQUFSOztBQUVBLFFBQUksR0FBSixDQUFRLE9BQVIsR0FBa0IsWUFBSztBQUNyQixZQUFJLEtBQUosR0FBWSxDQUFaO0FBQ0QsS0FGRDs7QUFJQSxXQUFPLElBQUssQ0FBTCxFQUFRLElBQUksR0FBWixDQUFQO0FBQ0QsQ0FYRDs7O0FDUEE7O0FBRUEsSUFBSSxPQUFNLFFBQVEsVUFBUixDQUFWOztBQUVBLElBQUksUUFBUTtBQUNWLEtBRFUsaUJBQ0o7QUFDSixTQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4Qjs7QUFFQSxRQUFJLGlCQUNDLEtBQUssSUFETixrQkFDdUIsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUR6QyxpQkFFQSxLQUFLLElBRkwsd0JBRTRCLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FGOUMsMEJBQUo7QUFLQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUE3Qjs7QUFFQSxXQUFPLENBQUUsS0FBSyxJQUFQLEVBQWEsR0FBYixDQUFQO0FBQ0Q7QUFaUyxDQUFaOztBQWVBLE9BQU8sT0FBUCxHQUFpQixVQUFFLE1BQUYsRUFBYztBQUM3QixNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYO0FBQUEsTUFDSSxRQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsRUFBRSxLQUFJLENBQU4sRUFBUyxLQUFJLENBQWIsRUFBbEIsRUFBb0MsTUFBcEMsQ0FEWjs7QUFHQSxPQUFLLElBQUwsR0FBWSxTQUFTLEtBQUksTUFBSixFQUFyQjs7QUFFQSxPQUFLLEdBQUwsR0FBVyxNQUFNLEdBQWpCO0FBQ0EsT0FBSyxHQUFMLEdBQVcsTUFBTSxHQUFqQjs7QUFFQSxPQUFLLE9BQUwsR0FBZSxZQUFNO0FBQ25CLFNBQUksTUFBSixDQUFXLElBQVgsQ0FBaUIsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFuQyxJQUEyQyxLQUFLLEdBQWhEO0FBQ0QsR0FGRDs7QUFJQSxPQUFLLE1BQUwsR0FBYztBQUNaLFdBQU8sRUFBRSxRQUFPLENBQVQsRUFBWSxLQUFJLElBQWhCO0FBREssR0FBZDs7QUFJQSxTQUFPLElBQVA7QUFDRCxDQWxCRDs7O0FDbkJBOztBQUVBLElBQUksT0FBTSxRQUFTLFVBQVQsQ0FBVjs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLE1BREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7QUFBQSxRQUFvQyxZQUFwQzs7QUFFQSxVQUFTLE9BQU8sQ0FBUCxDQUFUOztBQUVBOztBQUVBO0FBQ0EsV0FBTyxHQUFQO0FBQ0Q7QUFaUyxDQUFaOztBQWVBLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBVztBQUMxQixNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsU0FBWSxLQUFJLE1BQUosRUFETztBQUVuQixZQUFZLENBQUUsR0FBRjtBQUZPLEdBQXJCOztBQUtBLE9BQUssSUFBTCxRQUFlLEtBQUssUUFBcEIsR0FBK0IsS0FBSyxHQUFwQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQVhEOzs7QUNuQkE7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsUUFBSyxNQURLOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBMUIsRUFBa0MsS0FBSyxJQUF2Qzs7QUFFQSwyQkFBbUIsT0FBTyxDQUFQLENBQW5CO0FBRUQsS0FMRCxNQUtPO0FBQ0wsWUFBTSxLQUFLLElBQUwsQ0FBVyxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVgsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBakJTLENBQVo7O0FBb0JBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7O0FBRUEsT0FBSyxNQUFMLEdBQWMsQ0FBRSxDQUFGLENBQWQ7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FORDs7O0FDeEJBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDtBQUFBLElBQ0ksUUFBTyxRQUFRLFlBQVIsQ0FEWDtBQUFBLElBRUksTUFBTyxRQUFRLFVBQVIsQ0FGWDtBQUFBLElBR0ksT0FBTyxRQUFRLFdBQVIsQ0FIWDs7QUFLQSxJQUFJLFFBQVE7QUFDVixZQUFTLE1BREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksYUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7QUFBQSxRQUVJLFlBRko7O0FBSUEsb0JBRUksS0FBSyxJQUZULFdBRW1CLE9BQU8sQ0FBUCxDQUZuQixnQkFHSSxLQUFLLElBSFQsV0FHbUIsT0FBTyxDQUFQLENBSG5CLFdBR2tDLEtBQUssSUFIdkMsV0FHaUQsT0FBTyxDQUFQLENBSGpELHFCQUlTLEtBQUssSUFKZCxXQUl3QixPQUFPLENBQVAsQ0FKeEIsV0FJdUMsS0FBSyxJQUo1QyxXQUlzRCxPQUFPLENBQVAsQ0FKdEQ7QUFNQSxVQUFNLE1BQU0sR0FBWjs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUE3Qjs7QUFFQSxXQUFPLENBQUUsS0FBSyxJQUFQLEVBQWEsR0FBYixDQUFQO0FBQ0Q7QUFuQlMsQ0FBWjs7QUFzQkEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsR0FBRixFQUEwQjtBQUFBLE1BQW5CLEdBQW1CLHVFQUFmLENBQUMsQ0FBYztBQUFBLE1BQVgsR0FBVyx1RUFBUCxDQUFPOztBQUN6QyxNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsWUFEbUI7QUFFbkIsWUFGbUI7QUFHbkIsU0FBUSxLQUFJLE1BQUosRUFIVztBQUluQixZQUFRLENBQUUsR0FBRixFQUFPLEdBQVAsRUFBWSxHQUFaO0FBSlcsR0FBckI7O0FBT0EsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFwQixHQUErQixLQUFLLEdBQXBDOztBQUVBLFNBQU8sSUFBUDtBQUNELENBYkQ7OztBQzdCQTs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxLQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsRUFBRSxPQUFPLEtBQUssR0FBZCxFQUFqQjs7QUFFQSwwQkFBa0IsT0FBTyxDQUFQLENBQWxCO0FBRUQsS0FMRCxNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBakJTLENBQVo7O0FBb0JBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVY7O0FBRUEsTUFBSSxNQUFKLEdBQWEsQ0FBRSxDQUFGLENBQWI7QUFDQSxNQUFJLEVBQUosR0FBUyxLQUFJLE1BQUosRUFBVDtBQUNBLE1BQUksSUFBSixHQUFjLElBQUksUUFBbEI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FSRDs7O0FDeEJBOzs7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsU0FEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxhQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjtBQUFBLFFBRUksVUFBVSxTQUFTLEtBQUssSUFGNUI7QUFBQSxRQUdJLHFCQUhKOztBQUtBLFFBQUksS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFsQixLQUEwQixJQUE5QixFQUFxQyxLQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4QjtBQUNyQyxTQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbkMsSUFBMkMsS0FBSyxZQUFoRDs7QUFFQSxtQkFBZ0IsS0FBSyxRQUFMLENBQWUsT0FBZixFQUF3QixPQUFPLENBQVAsQ0FBeEIsRUFBbUMsT0FBTyxDQUFQLENBQW5DLEVBQThDLE9BQU8sQ0FBUCxDQUE5QyxFQUF5RCxPQUFPLENBQVAsQ0FBekQsRUFBb0UsT0FBTyxDQUFQLENBQXBFLGNBQTBGLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBNUcsb0JBQThILEtBQUssTUFBTCxDQUFZLElBQVosQ0FBaUIsR0FBL0ksT0FBaEI7O0FBRUEsU0FBSSxRQUFKLENBQWEsR0FBYixxQkFBcUIsS0FBSyxJQUExQixFQUFrQyxJQUFsQzs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUFMLEdBQVksUUFBcEM7O0FBRUEsUUFBSSxLQUFJLElBQUosQ0FBVSxLQUFLLElBQUwsQ0FBVSxJQUFwQixNQUErQixTQUFuQyxFQUErQyxLQUFLLElBQUwsQ0FBVSxHQUFWOztBQUUvQyxXQUFPLENBQUUsS0FBSyxJQUFMLEdBQVksUUFBZCxFQUF3QixZQUF4QixDQUFQO0FBQ0QsR0FyQlM7QUF1QlYsVUF2QlUsb0JBdUJBLEtBdkJBLEVBdUJPLEtBdkJQLEVBdUJjLElBdkJkLEVBdUJvQixJQXZCcEIsRUF1QjBCLE1BdkIxQixFQXVCa0MsS0F2QmxDLEVBdUJ5QyxRQXZCekMsRUF1Qm1ELE9BdkJuRCxFQXVCNkQ7QUFDckUsUUFBSSxPQUFPLEtBQUssR0FBTCxHQUFXLEtBQUssR0FBM0I7QUFBQSxRQUNJLE1BQU0sRUFEVjtBQUFBLFFBRUksT0FBTyxFQUZYO0FBR0E7QUFDQSxRQUFJLEVBQUUsT0FBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVAsS0FBMEIsUUFBMUIsSUFBc0MsS0FBSyxNQUFMLENBQVksQ0FBWixJQUFpQixDQUF6RCxDQUFKLEVBQWtFO0FBQ2hFLHdCQUFnQixNQUFoQixnQkFBaUMsUUFBakMsV0FBK0MsSUFBL0M7QUFDRDs7QUFFRCxzQkFBZ0IsS0FBSyxJQUFyQixpQkFBcUMsUUFBckMsYUFBcUQsUUFBckQsWUFBb0UsS0FBcEUsUUFUcUUsQ0FTUzs7QUFFOUUsUUFBSSxPQUFPLEtBQUssR0FBWixLQUFvQixRQUFwQixJQUFnQyxLQUFLLEdBQUwsS0FBYSxRQUE3QyxJQUF5RCxPQUFPLEtBQUssR0FBWixLQUFvQixRQUFqRixFQUE0RjtBQUMxRix3QkFDRyxRQURILFlBQ2tCLEtBQUssR0FEdkIsYUFDa0MsS0FEbEMscUJBRUEsUUFGQSxZQUVlLElBRmYsY0FHQSxPQUhBLDRCQUtBLE9BTEE7QUFPRCxLQVJELE1BUU0sSUFBSSxLQUFLLEdBQUwsS0FBYSxRQUFiLElBQXlCLEtBQUssR0FBTCxLQUFhLFFBQTFDLEVBQXFEO0FBQ3pELHdCQUNHLFFBREgsWUFDa0IsSUFEbEIsYUFDOEIsS0FEOUIscUJBRUEsUUFGQSxZQUVlLElBRmYsV0FFeUIsSUFGekIsY0FHQSxPQUhBLDBCQUlRLFFBSlIsV0FJc0IsSUFKdEIsYUFJa0MsS0FKbEMscUJBS0EsUUFMQSxZQUtlLElBTGYsV0FLeUIsSUFMekIsY0FNQSxPQU5BLDRCQVFBLE9BUkE7QUFVRCxLQVhLLE1BV0Q7QUFDSCxhQUFPLElBQVA7QUFDRDs7QUFFRCxVQUFNLE1BQU0sSUFBWjs7QUFFQSxXQUFPLEdBQVA7QUFDRDtBQTVEUyxDQUFaOztBQStEQSxPQUFPLE9BQVAsR0FBaUIsWUFBa0U7QUFBQSxNQUFoRSxJQUFnRSx1RUFBM0QsQ0FBMkQ7QUFBQSxNQUF4RCxHQUF3RCx1RUFBcEQsQ0FBb0Q7QUFBQSxNQUFqRCxHQUFpRCx1RUFBN0MsUUFBNkM7QUFBQSxNQUFuQyxLQUFtQyx1RUFBN0IsQ0FBNkI7QUFBQSxNQUExQixLQUEwQix1RUFBcEIsQ0FBb0I7QUFBQSxNQUFoQixVQUFnQjs7QUFDakYsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDtBQUFBLE1BQ0ksV0FBVyxPQUFPLE1BQVAsQ0FBZSxFQUFFLGNBQWMsQ0FBaEIsRUFBbUIsWUFBVyxJQUE5QixFQUFmLEVBQXFELFVBQXJELENBRGY7O0FBR0EsU0FBTyxNQUFQLENBQWUsSUFBZixFQUFxQjtBQUNuQixTQUFRLEdBRFc7QUFFbkIsU0FBUSxHQUZXO0FBR25CLGtCQUFjLFNBQVMsWUFISjtBQUluQixXQUFRLFNBQVMsWUFKRTtBQUtuQixTQUFRLEtBQUksTUFBSixFQUxXO0FBTW5CLFlBQVEsQ0FBRSxJQUFGLEVBQVEsR0FBUixFQUFhLEdBQWIsRUFBa0IsS0FBbEIsRUFBeUIsS0FBekIsQ0FOVztBQU9uQixZQUFRO0FBQ04sYUFBTyxFQUFFLFFBQU8sQ0FBVCxFQUFZLEtBQUssSUFBakIsRUFERDtBQUVOLFlBQU8sRUFBRSxRQUFPLENBQVQsRUFBWSxLQUFLLElBQWpCO0FBRkQsS0FQVztBQVduQixVQUFPO0FBQ0wsU0FESyxpQkFDQztBQUNKLFlBQUksS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixHQUFqQixLQUF5QixJQUE3QixFQUFvQztBQUNsQyxlQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4QjtBQUNEO0FBQ0QsYUFBSSxTQUFKLENBQWUsSUFBZjtBQUNBLGFBQUksSUFBSixDQUFVLEtBQUssSUFBZixpQkFBbUMsS0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixHQUFwRDtBQUNBLDRCQUFrQixLQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLEdBQW5DO0FBQ0Q7QUFSSTtBQVhZLEdBQXJCLEVBc0JBLFFBdEJBOztBQXdCQSxTQUFPLGNBQVAsQ0FBdUIsSUFBdkIsRUFBNkIsT0FBN0IsRUFBc0M7QUFDcEMsT0FEb0MsaUJBQzlCO0FBQ0osVUFBSSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQWxCLEtBQTBCLElBQTlCLEVBQXFDO0FBQ25DLGVBQU8sS0FBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQW5DLENBQVA7QUFDRDtBQUNGLEtBTG1DO0FBTXBDLE9BTm9DLGVBTS9CLENBTitCLEVBTTNCO0FBQ1AsVUFBSSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQWxCLEtBQTBCLElBQTlCLEVBQXFDO0FBQ25DLGFBQUksTUFBSixDQUFXLElBQVgsQ0FBaUIsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFuQyxJQUEyQyxDQUEzQztBQUNEO0FBQ0Y7QUFWbUMsR0FBdEM7O0FBYUEsT0FBSyxJQUFMLENBQVUsTUFBVixHQUFtQixDQUFFLElBQUYsQ0FBbkI7QUFDQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUssR0FBcEM7QUFDQSxPQUFLLElBQUwsQ0FBVSxJQUFWLEdBQWlCLEtBQUssSUFBTCxHQUFZLE9BQTdCO0FBQ0EsU0FBTyxJQUFQO0FBQ0QsQ0E3Q0Q7OztBQ25FQTs7QUFFQSxJQUFJLE1BQU8sUUFBUyxVQUFULENBQVg7QUFBQSxJQUNJLFFBQU8sUUFBUyxhQUFULENBRFg7QUFBQSxJQUVJLE9BQU8sUUFBUyxXQUFULENBRlg7QUFBQSxJQUdJLE9BQU8sUUFBUyxXQUFULENBSFg7QUFBQSxJQUlJLE1BQU8sUUFBUyxVQUFULENBSlg7QUFBQSxJQUtJLFNBQU8sUUFBUyxhQUFULENBTFg7O0FBT0EsSUFBSSxRQUFRO0FBQ1YsWUFBUyxPQURDOztBQUdWLFdBSFUsdUJBR0U7QUFDVixRQUFJLFNBQVMsSUFBSSxZQUFKLENBQWtCLElBQWxCLENBQWI7O0FBRUEsU0FBSyxJQUFJLElBQUksQ0FBUixFQUFXLElBQUksT0FBTyxNQUEzQixFQUFtQyxJQUFJLENBQXZDLEVBQTBDLEdBQTFDLEVBQWdEO0FBQzlDLGFBQVEsQ0FBUixJQUFjLEtBQUssR0FBTCxDQUFZLElBQUksQ0FBTixJQUFjLEtBQUssRUFBTCxHQUFVLENBQXhCLENBQVYsQ0FBZDtBQUNEOztBQUVELFFBQUksT0FBSixDQUFZLEtBQVosR0FBb0IsS0FBTSxNQUFOLEVBQWMsQ0FBZCxFQUFpQixFQUFFLFdBQVUsSUFBWixFQUFqQixDQUFwQjtBQUNEO0FBWFMsQ0FBWjs7QUFlQSxPQUFPLE9BQVAsR0FBaUIsWUFBb0M7QUFBQSxNQUFsQyxTQUFrQyx1RUFBeEIsQ0FBd0I7QUFBQSxNQUFyQixLQUFxQix1RUFBZixDQUFlO0FBQUEsTUFBWixNQUFZOztBQUNuRCxNQUFJLE9BQU8sSUFBSSxPQUFKLENBQVksS0FBbkIsS0FBNkIsV0FBakMsRUFBK0MsTUFBTSxTQUFOO0FBQy9DLE1BQU0sUUFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkLEVBQWtCLEVBQUUsS0FBSSxDQUFOLEVBQWxCLEVBQTZCLE1BQTdCLENBQWQ7O0FBRUEsTUFBTSxPQUFPLEtBQU0sSUFBSSxPQUFKLENBQVksS0FBbEIsRUFBeUIsT0FBUSxTQUFSLEVBQW1CLEtBQW5CLEVBQTBCLEtBQTFCLENBQXpCLENBQWI7QUFDQSxPQUFLLElBQUwsR0FBWSxVQUFVLElBQUksTUFBSixFQUF0Qjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQVJEOzs7QUN4QkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYO0FBQUEsSUFDRSxZQUFZLFFBQVMsZ0JBQVQsQ0FEZDtBQUFBLElBRUUsT0FBTyxRQUFRLFdBQVIsQ0FGVDtBQUFBLElBR0UsT0FBTyxRQUFRLFdBQVIsQ0FIVDs7QUFLQSxJQUFJLFFBQVE7QUFDVixZQUFTLE1BREM7QUFFVixXQUFTLEVBRkM7O0FBSVYsS0FKVSxpQkFJSjtBQUNKLFFBQUksWUFBSjtBQUNBLFFBQUksS0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLE1BQTBCLFNBQTlCLEVBQTBDO0FBQ3hDLFVBQUksT0FBTyxJQUFYO0FBQ0EsV0FBSSxhQUFKLENBQW1CLEtBQUssTUFBeEIsRUFBZ0MsS0FBSyxTQUFyQztBQUNBLFlBQU0sS0FBSyxNQUFMLENBQVksTUFBWixDQUFtQixHQUF6QjtBQUNBLFVBQUk7QUFDRixhQUFJLE1BQUosQ0FBVyxJQUFYLENBQWdCLEdBQWhCLENBQXFCLEtBQUssTUFBMUIsRUFBa0MsR0FBbEM7QUFDRCxPQUZELENBRUMsT0FBTyxDQUFQLEVBQVc7QUFDVixnQkFBUSxHQUFSLENBQWEsQ0FBYjtBQUNBLGNBQU0sTUFBTyxvQ0FBb0MsS0FBSyxNQUFMLENBQVksTUFBaEQsR0FBd0QsbUJBQXhELEdBQThFLEtBQUksV0FBbEYsR0FBZ0csTUFBaEcsR0FBeUcsS0FBSSxNQUFKLENBQVcsSUFBWCxDQUFnQixNQUFoSSxDQUFOO0FBQ0Q7QUFDRDtBQUNBO0FBQ0EsV0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEdBQXhCO0FBQ0QsS0FiRCxNQWFLO0FBQ0gsWUFBTSxLQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsQ0FBTjtBQUNEO0FBQ0QsV0FBTyxHQUFQO0FBQ0Q7QUF2QlMsQ0FBWjs7QUEwQkEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsQ0FBRixFQUEwQjtBQUFBLE1BQXJCLENBQXFCLHVFQUFuQixDQUFtQjtBQUFBLE1BQWhCLFVBQWdCOztBQUN6QyxNQUFJLGFBQUo7QUFBQSxNQUFVLGVBQVY7QUFBQSxNQUFrQixhQUFhLEtBQS9COztBQUVBLE1BQUksZUFBZSxTQUFmLElBQTRCLFdBQVcsTUFBWCxLQUFzQixTQUF0RCxFQUFrRTtBQUNoRSxRQUFJLEtBQUksT0FBSixDQUFhLFdBQVcsTUFBeEIsQ0FBSixFQUF1QztBQUNyQyxhQUFPLEtBQUksT0FBSixDQUFhLFdBQVcsTUFBeEIsQ0FBUDtBQUNEO0FBQ0Y7O0FBRUQsTUFBSSxPQUFPLENBQVAsS0FBYSxRQUFqQixFQUE0QjtBQUMxQixRQUFJLE1BQU0sQ0FBVixFQUFjO0FBQ1osZUFBUyxFQUFUO0FBQ0EsV0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLENBQXBCLEVBQXVCLEdBQXZCLEVBQTZCO0FBQzNCLGVBQVEsQ0FBUixJQUFjLElBQUksWUFBSixDQUFrQixDQUFsQixDQUFkO0FBQ0Q7QUFDRixLQUxELE1BS0s7QUFDSCxlQUFTLElBQUksWUFBSixDQUFrQixDQUFsQixDQUFUO0FBQ0Q7QUFDRixHQVRELE1BU00sSUFBSSxNQUFNLE9BQU4sQ0FBZSxDQUFmLENBQUosRUFBeUI7QUFBRTtBQUMvQixRQUFJLE9BQU8sRUFBRSxNQUFiO0FBQ0EsYUFBUyxJQUFJLFlBQUosQ0FBa0IsSUFBbEIsQ0FBVDtBQUNBLFNBQUssSUFBSSxLQUFJLENBQWIsRUFBZ0IsS0FBSSxFQUFFLE1BQXRCLEVBQThCLElBQTlCLEVBQW9DO0FBQ2xDLGFBQVEsRUFBUixJQUFjLEVBQUcsRUFBSCxDQUFkO0FBQ0Q7QUFDRixHQU5LLE1BTUEsSUFBSSxPQUFPLENBQVAsS0FBYSxRQUFqQixFQUE0QjtBQUNoQyxhQUFTLEVBQUUsUUFBUSxJQUFJLENBQUosR0FBUSxDQUFSLEdBQVksS0FBSSxVQUFKLEdBQWlCLEVBQXZDLENBQTRDO0FBQTVDLEtBQVQsQ0FDQSxhQUFhLElBQWI7QUFDRCxHQUhLLE1BR0EsSUFBSSxhQUFhLFlBQWpCLEVBQWdDO0FBQ3BDLGFBQVMsQ0FBVDtBQUNEOztBQUVELFNBQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFQOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsa0JBRG1CO0FBRW5CLFVBQU0sTUFBTSxRQUFOLEdBQWlCLEtBQUksTUFBSixFQUZKO0FBR25CLFNBQU0sT0FBTyxNQUhNLEVBR0U7QUFDckIsY0FBVyxDQUpRO0FBS25CLFlBQVEsSUFMVztBQU1uQixRQU5tQixnQkFNYixHQU5hLEVBTVA7QUFDVixXQUFLLE1BQUwsR0FBYyxHQUFkO0FBQ0EsYUFBTyxJQUFQO0FBQ0QsS0FUa0I7O0FBVW5CLGVBQVcsZUFBZSxTQUFmLElBQTRCLFdBQVcsU0FBWCxLQUF5QixJQUFyRCxHQUE0RCxJQUE1RCxHQUFtRSxLQVYzRDtBQVduQixRQVhtQixnQkFXYixRQVhhLEVBV0Y7QUFDZixVQUFJLFVBQVUsVUFBVSxVQUFWLENBQXNCLFFBQXRCLEVBQWdDLElBQWhDLENBQWQ7QUFDQSxjQUFRLElBQVIsQ0FBYyxVQUFFLE9BQUYsRUFBYztBQUMxQixhQUFLLE1BQUwsQ0FBWSxNQUFaLENBQW1CLE1BQW5CLEdBQTRCLEtBQUssR0FBTCxHQUFXLFFBQVEsTUFBL0M7QUFDQSxZQUFJLE9BQU8sS0FBSyxNQUFaLEtBQXVCLFVBQTNCLEVBQXdDLEtBQUssTUFBTDtBQUN6QyxPQUhEO0FBSUQsS0FqQmtCOztBQWtCbkIsWUFBUztBQUNQLGNBQVEsRUFBRSxRQUFPLE9BQU8sTUFBaEIsRUFBd0IsS0FBSSxJQUE1QjtBQUREO0FBbEJVLEdBQXJCOztBQXVCQSxNQUFJLFVBQUosRUFBaUIsS0FBSyxJQUFMLENBQVcsQ0FBWDs7QUFFakIsTUFBSSxlQUFlLFNBQW5CLEVBQStCO0FBQzdCLFFBQUksV0FBVyxNQUFYLEtBQXNCLFNBQTFCLEVBQXNDO0FBQ3BDLFdBQUksT0FBSixDQUFhLFdBQVcsTUFBeEIsSUFBbUMsSUFBbkM7QUFDRDtBQUNELFFBQUksV0FBVyxJQUFYLEtBQW9CLElBQXhCLEVBQStCO0FBQUEsaUNBQ2IsTUFEYSxFQUNwQixHQURvQjtBQUUzQixlQUFPLGNBQVAsQ0FBdUIsSUFBdkIsRUFBNkIsR0FBN0IsRUFBZ0M7QUFDOUIsYUFEOEIsaUJBQ3ZCO0FBQ0wsbUJBQU8sS0FBTSxJQUFOLEVBQVksR0FBWixFQUFlLEVBQUUsTUFBSyxRQUFQLEVBQWlCLFFBQU8sTUFBeEIsRUFBZixDQUFQO0FBQ0QsV0FINkI7QUFJOUIsYUFKOEIsZUFJekIsQ0FKeUIsRUFJckI7QUFDUCxtQkFBTyxLQUFNLElBQU4sRUFBWSxDQUFaLEVBQWUsR0FBZixDQUFQO0FBQ0Q7QUFONkIsU0FBaEM7QUFGMkI7O0FBQzdCLFdBQUssSUFBSSxNQUFJLENBQVIsRUFBVyxTQUFTLEtBQUssTUFBTCxDQUFZLE1BQXJDLEVBQTZDLE1BQUksTUFBakQsRUFBeUQsS0FBekQsRUFBK0Q7QUFBQSxjQUEvQyxNQUErQyxFQUF0RCxHQUFzRDtBQVM5RDtBQUNGO0FBQ0Y7O0FBRUQsU0FBTyxJQUFQO0FBQ0QsQ0E3RUQ7OztBQ2pDQTs7QUFFQSxJQUFJLE1BQVUsUUFBUyxVQUFULENBQWQ7QUFBQSxJQUNJLFVBQVUsUUFBUyxjQUFULENBRGQ7QUFBQSxJQUVJLE1BQVUsUUFBUyxVQUFULENBRmQ7QUFBQSxJQUdJLE1BQVUsUUFBUyxVQUFULENBSGQ7QUFBQSxJQUlJLE1BQVUsUUFBUyxVQUFULENBSmQ7QUFBQSxJQUtJLE9BQVUsUUFBUyxXQUFULENBTGQ7O0FBT0EsT0FBTyxPQUFQLEdBQWlCLFVBQUUsR0FBRixFQUFXO0FBQzFCLFFBQUksS0FBSyxTQUFUO0FBQUEsUUFDSSxLQUFLLFNBRFQ7QUFBQSxRQUVJLGVBRko7O0FBSUE7QUFDQSxhQUFTLEtBQU0sSUFBSyxJQUFLLEdBQUwsRUFBVSxHQUFHLEdBQWIsQ0FBTCxFQUF5QixJQUFLLEdBQUcsR0FBUixFQUFhLEtBQWIsQ0FBekIsQ0FBTixDQUFUO0FBQ0EsT0FBRyxFQUFILENBQU8sR0FBUDtBQUNBLE9BQUcsRUFBSCxDQUFPLE1BQVA7O0FBRUEsV0FBTyxNQUFQO0FBQ0QsQ0FYRDs7O0FDVEE7O0FBRUEsSUFBSSxNQUFVLFFBQVMsVUFBVCxDQUFkO0FBQUEsSUFDSSxVQUFVLFFBQVMsY0FBVCxDQURkO0FBQUEsSUFFSSxNQUFVLFFBQVMsVUFBVCxDQUZkO0FBQUEsSUFHSSxNQUFVLFFBQVMsVUFBVCxDQUhkOztBQUtBLE9BQU8sT0FBUCxHQUFpQixZQUFnQztBQUFBLFFBQTlCLFNBQThCLHVFQUFsQixLQUFrQjtBQUFBLFFBQVgsS0FBVzs7QUFDL0MsUUFBSSxhQUFhLE9BQU8sTUFBUCxDQUFjLEVBQWQsRUFBa0IsRUFBRSxXQUFVLENBQVosRUFBbEIsRUFBbUMsS0FBbkMsQ0FBakI7QUFBQSxRQUNJLE1BQU0sUUFBVSxXQUFXLFNBQXJCLENBRFY7O0FBR0EsUUFBSSxFQUFKLENBQVEsSUFBSyxJQUFJLEdBQVQsRUFBYyxJQUFLLFNBQUwsQ0FBZCxDQUFSOztBQUVBLFFBQUksR0FBSixDQUFRLE9BQVIsR0FBa0IsWUFBSztBQUNyQixZQUFJLEtBQUosR0FBWSxDQUFaO0FBQ0QsS0FGRDs7QUFJQSxXQUFPLElBQUksR0FBWDtBQUNELENBWEQ7OztBQ1BBOzs7O0FBRUEsSUFBTSxPQUFPLFFBQVMsVUFBVCxDQUFiO0FBQUEsSUFDTSxPQUFPLFFBQVMsV0FBVCxDQURiO0FBQUEsSUFFTSxPQUFPLFFBQVMsV0FBVCxDQUZiO0FBQUEsSUFHTSxPQUFPLFFBQVMsV0FBVCxDQUhiO0FBQUEsSUFJTSxNQUFPLFFBQVMsVUFBVCxDQUpiO0FBQUEsSUFLTSxPQUFPLFFBQVMsV0FBVCxDQUxiO0FBQUEsSUFNTSxRQUFPLFFBQVMsWUFBVCxDQU5iO0FBQUEsSUFPTSxPQUFPLFFBQVMsV0FBVCxDQVBiOztBQVNBLElBQU0sUUFBUTtBQUNaLFlBQVMsT0FERzs7QUFHWixLQUhZLGlCQUdOO0FBQ0osUUFBSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBYjs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsT0FBTyxDQUFQLENBQXhCOztBQUVBLFdBQU8sT0FBTyxDQUFQLENBQVA7QUFDRDtBQVRXLENBQWQ7O0FBWUEsSUFBTSxXQUFXLEVBQUUsTUFBTSxHQUFSLEVBQWEsUUFBTyxNQUFwQixFQUFqQjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxHQUFGLEVBQU8sSUFBUCxFQUFhLFVBQWIsRUFBNkI7QUFDNUMsTUFBTSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBYjtBQUNBLE1BQUksaUJBQUo7QUFBQSxNQUFjLGdCQUFkO0FBQUEsTUFBdUIsa0JBQXZCOztBQUVBLE1BQUksTUFBTSxPQUFOLENBQWUsSUFBZixNQUEwQixLQUE5QixFQUFzQyxPQUFPLENBQUUsSUFBRixDQUFQOztBQUV0QyxNQUFNLFFBQVEsT0FBTyxNQUFQLENBQWUsRUFBZixFQUFtQixRQUFuQixFQUE2QixVQUE3QixDQUFkOztBQUVBLE1BQU0sYUFBYSxLQUFLLEdBQUwsZ0NBQWEsSUFBYixFQUFuQjtBQUNBLE1BQUksTUFBTSxJQUFOLEdBQWEsVUFBakIsRUFBOEIsTUFBTSxJQUFOLEdBQWEsVUFBYjs7QUFFOUIsY0FBWSxLQUFNLE1BQU0sSUFBWixDQUFaOztBQUVBLE9BQUssTUFBTCxHQUFjLEVBQWQ7O0FBRUEsYUFBVyxNQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsRUFBRSxLQUFJLE1BQU0sSUFBWixFQUFrQixLQUFJLENBQXRCLEVBQWIsQ0FBWDs7QUFFQSxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksS0FBSyxNQUF6QixFQUFpQyxHQUFqQyxFQUF1QztBQUNyQyxTQUFLLE1BQUwsQ0FBYSxDQUFiLElBQW1CLEtBQU0sU0FBTixFQUFpQixLQUFNLElBQUssUUFBTCxFQUFlLEtBQUssQ0FBTCxDQUFmLENBQU4sRUFBZ0MsQ0FBaEMsRUFBbUMsTUFBTSxJQUF6QyxDQUFqQixFQUFpRSxFQUFFLE1BQUssU0FBUCxFQUFrQixRQUFPLE1BQU0sTUFBL0IsRUFBakUsQ0FBbkI7QUFDRDs7QUFFRCxPQUFLLE9BQUwsR0FBZSxLQUFLLE1BQXBCLENBckI0QyxDQXFCakI7O0FBRTNCLE9BQU0sU0FBTixFQUFpQixHQUFqQixFQUFzQixRQUF0Qjs7QUFFQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUksTUFBSixFQUEvQjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQTVCRDs7O0FDekJBOztBQUVBLElBQUksTUFBVSxRQUFTLFVBQVQsQ0FBZDtBQUFBLElBQ0ksVUFBVSxRQUFTLGNBQVQsQ0FEZDtBQUFBLElBRUksTUFBVSxRQUFTLFVBQVQsQ0FGZDs7QUFJQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxHQUFGLEVBQVc7QUFDMUIsTUFBSSxLQUFLLFNBQVQ7O0FBRUEsS0FBRyxFQUFILENBQU8sR0FBUDs7QUFFQSxNQUFJLE9BQU8sSUFBSyxHQUFMLEVBQVUsR0FBRyxHQUFiLENBQVg7QUFDQSxPQUFLLElBQUwsR0FBWSxVQUFRLElBQUksTUFBSixFQUFwQjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQVREOzs7QUNOQTs7QUFFQSxJQUFJLE9BQU0sUUFBUSxVQUFSLENBQVY7O0FBRUEsSUFBTSxRQUFRO0FBQ1osWUFBUyxLQURHO0FBRVosS0FGWSxpQkFFTjtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7QUFBQSxRQUNJLGlCQUFhLEtBQUssSUFBbEIsUUFESjtBQUFBLFFBRUksT0FBTyxDQUZYO0FBQUEsUUFHSSxXQUFXLENBSGY7QUFBQSxRQUlJLGFBQWEsT0FBUSxDQUFSLENBSmpCO0FBQUEsUUFLSSxtQkFBbUIsTUFBTyxVQUFQLENBTHZCO0FBQUEsUUFNSSxXQUFXLEtBTmY7O0FBUUEsV0FBTyxPQUFQLENBQWdCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBUztBQUN2QixVQUFJLE1BQU0sQ0FBVixFQUFjOztBQUVkLFVBQUksZUFBZSxNQUFPLENBQVAsQ0FBbkI7QUFBQSxVQUNFLGFBQWUsTUFBTSxPQUFPLE1BQVAsR0FBZ0IsQ0FEdkM7O0FBR0EsVUFBSSxDQUFDLGdCQUFELElBQXFCLENBQUMsWUFBMUIsRUFBeUM7QUFDdkMscUJBQWEsYUFBYSxDQUExQjtBQUNBLGVBQU8sVUFBUDtBQUNELE9BSEQsTUFHSztBQUNILGVBQVUsVUFBVixXQUEwQixDQUExQjtBQUNEOztBQUVELFVBQUksQ0FBQyxVQUFMLEVBQWtCLE9BQU8sS0FBUDtBQUNuQixLQWREOztBQWdCQSxXQUFPLElBQVA7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBN0I7O0FBRUEsV0FBTyxDQUFFLEtBQUssSUFBUCxFQUFhLEdBQWIsQ0FBUDtBQUNEO0FBaENXLENBQWQ7O0FBbUNBLE9BQU8sT0FBUCxHQUFpQixZQUFhO0FBQUEsb0NBQVQsSUFBUztBQUFULFFBQVM7QUFBQTs7QUFDNUIsTUFBTSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWjs7QUFFQSxTQUFPLE1BQVAsQ0FBZSxHQUFmLEVBQW9CO0FBQ2xCLFFBQVEsS0FBSSxNQUFKLEVBRFU7QUFFbEIsWUFBUTtBQUZVLEdBQXBCOztBQUtBLE1BQUksSUFBSixHQUFXLElBQUksUUFBSixHQUFlLElBQUksRUFBOUI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FYRDs7O0FDdkNBOztBQUVBLElBQUksTUFBVSxRQUFTLE9BQVQsQ0FBZDtBQUFBLElBQ0ksVUFBVSxRQUFTLFdBQVQsQ0FEZDtBQUFBLElBRUksT0FBVSxRQUFTLFFBQVQsQ0FGZDtBQUFBLElBR0ksT0FBVSxRQUFTLFFBQVQsQ0FIZDtBQUFBLElBSUksU0FBVSxRQUFTLFVBQVQsQ0FKZDtBQUFBLElBS0ksV0FBVztBQUNULFFBQUssWUFESSxFQUNVLFFBQU8sSUFEakIsRUFDdUIsT0FBTSxHQUQ3QixFQUNrQyxPQUFNLENBRHhDLEVBQzJDLFNBQVE7QUFEbkQsQ0FMZjs7QUFTQSxPQUFPLE9BQVAsR0FBaUIsaUJBQVM7O0FBRXhCLE1BQUksYUFBYSxPQUFPLE1BQVAsQ0FBZSxFQUFmLEVBQW1CLFFBQW5CLEVBQTZCLEtBQTdCLENBQWpCO0FBQ0EsTUFBSSxTQUFTLElBQUksWUFBSixDQUFrQixXQUFXLE1BQTdCLENBQWI7O0FBRUEsTUFBSSxPQUFPLFdBQVcsSUFBWCxHQUFrQixHQUFsQixHQUF3QixXQUFXLE1BQW5DLEdBQTRDLEdBQTVDLEdBQWtELFdBQVcsS0FBN0QsR0FBcUUsR0FBckUsR0FBMkUsV0FBVyxPQUF0RixHQUFnRyxHQUFoRyxHQUFzRyxXQUFXLEtBQTVIO0FBQ0EsTUFBSSxPQUFPLElBQUksT0FBSixDQUFZLE9BQVosQ0FBcUIsSUFBckIsQ0FBUCxLQUF1QyxXQUEzQyxFQUF5RDs7QUFFdkQsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLFdBQVcsTUFBL0IsRUFBdUMsR0FBdkMsRUFBNkM7QUFDM0MsYUFBUSxDQUFSLElBQWMsUUFBUyxXQUFXLElBQXBCLEVBQTRCLFdBQVcsTUFBdkMsRUFBK0MsQ0FBL0MsRUFBa0QsV0FBVyxLQUE3RCxFQUFvRSxXQUFXLEtBQS9FLENBQWQ7QUFDRDs7QUFFRCxRQUFJLFdBQVcsT0FBWCxLQUF1QixJQUEzQixFQUFrQztBQUNoQyxhQUFPLE9BQVA7QUFDRDtBQUNELFFBQUksT0FBSixDQUFZLE9BQVosQ0FBcUIsSUFBckIsSUFBOEIsS0FBTSxNQUFOLENBQTlCO0FBQ0Q7O0FBRUQsTUFBSSxPQUFPLElBQUksT0FBSixDQUFZLE9BQVosQ0FBcUIsSUFBckIsQ0FBWDtBQUNBLE9BQUssSUFBTCxHQUFZLFFBQVEsSUFBSSxNQUFKLEVBQXBCOztBQUVBLFNBQU8sSUFBUDtBQUNELENBdEJEOzs7QUNYQTs7QUFFQSxJQUFJLE9BQU0sUUFBUyxVQUFULENBQVY7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxJQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiO0FBQUEsUUFBb0MsWUFBcEM7O0FBRUEsVUFBTSxLQUFLLE1BQUwsQ0FBWSxDQUFaLE1BQW1CLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBbkIsR0FBb0MsQ0FBcEMsY0FBaUQsS0FBSyxJQUF0RCxZQUFpRSxPQUFPLENBQVAsQ0FBakUsYUFBa0YsT0FBTyxDQUFQLENBQWxGLGNBQU47O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLFNBQTJCLEtBQUssSUFBaEM7O0FBRUEsV0FBTyxNQUFLLEtBQUssSUFBVixFQUFrQixHQUFsQixDQUFQO0FBQ0Q7QUFYUyxDQUFaOztBQWVBLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBTyxHQUFQLEVBQWdCO0FBQy9CLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7QUFDQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFNBQVMsS0FBSSxNQUFKLEVBRFU7QUFFbkIsWUFBUyxDQUFFLEdBQUYsRUFBTyxHQUFQO0FBRlUsR0FBckI7O0FBS0EsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFwQixHQUErQixLQUFLLEdBQXBDOztBQUVBLFNBQU8sSUFBUDtBQUNELENBVkQ7OztBQ25CQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLEtBREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EsUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQUosRUFBeUI7QUFDdkIsV0FBSSxRQUFKLENBQWEsR0FBYixxQkFBcUIsS0FBSyxJQUExQixFQUFrQyxLQUFLLEdBQXZDOztBQUVBLDBCQUFrQixPQUFPLENBQVAsQ0FBbEI7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssR0FBTCxDQUFVLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBVixDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFqQlMsQ0FBWjs7QUFvQkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYjs7QUFFQSxTQUFPLEdBQVA7QUFDRCxDQU5EOzs7QUN4QkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFFBQUssT0FESzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2Qjs7QUFFQSxtQkFBVyxPQUFPLENBQVAsQ0FBWDtBQUVELEtBTEQsTUFLTztBQUNMLFlBQU0sT0FBTyxDQUFQLElBQVksQ0FBbEI7QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQWpCUyxDQUFaOztBQW9CQSxPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLFFBQVEsT0FBTyxNQUFQLENBQWUsS0FBZixDQUFaOztBQUVBLFFBQU0sTUFBTixHQUFlLENBQUUsQ0FBRixDQUFmOztBQUVBLFNBQU8sS0FBUDtBQUNELENBTkQ7OztBQ3hCQTs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxNQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLGFBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiO0FBQUEsUUFFSSxZQUZKOztBQUlBLFVBQU0sS0FBSyxjQUFMLENBQXFCLE9BQU8sQ0FBUCxDQUFyQixFQUFnQyxLQUFLLEdBQXJDLEVBQTBDLEtBQUssR0FBL0MsQ0FBTjs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUFMLEdBQVksUUFBcEM7O0FBRUEsV0FBTyxDQUFFLEtBQUssSUFBTCxHQUFZLFFBQWQsRUFBd0IsR0FBeEIsQ0FBUDtBQUNELEdBYlM7QUFlVixnQkFmVSwwQkFlTSxDQWZOLEVBZVMsRUFmVCxFQWVhLEVBZmIsRUFla0I7QUFDMUIsUUFBSSxnQkFDQSxLQUFLLElBREwsaUJBQ3FCLENBRHJCLGlCQUVBLEtBQUssSUFGTCxpQkFFcUIsRUFGckIsV0FFNkIsRUFGN0IsaUJBR0EsS0FBSyxJQUhMLDhCQUtELEtBQUssSUFMSixrQkFLcUIsRUFMckIsZ0JBTUYsS0FBSyxJQU5ILGtCQU1vQixLQUFLLElBTnpCLHVCQU9DLEtBQUssSUFQTixrQkFPdUIsRUFQdkIsa0JBUUEsS0FBSyxJQVJMLHNCQVEwQixLQUFLLElBUi9CLGlCQVErQyxFQVIvQyxZQVF3RCxLQUFLLElBUjdELDJCQVNBLEtBQUssSUFUTCxrQkFTc0IsS0FBSyxJQVQzQixpQkFTMkMsS0FBSyxJQVRoRCw4QkFXRixLQUFLLElBWEgsaUNBWU0sS0FBSyxJQVpYLGlCQVkyQixFQVozQixnQkFhRixLQUFLLElBYkgsa0JBYW9CLEtBQUssSUFiekIsdUJBY0MsS0FBSyxJQWROLGlCQWNzQixFQWR0QixrQkFlQSxLQUFLLElBZkwsc0JBZTBCLEtBQUssSUFmL0IsaUJBZStDLEVBZi9DLFlBZXdELEtBQUssSUFmN0QsOEJBZ0JBLEtBQUssSUFoQkwsa0JBZ0JzQixLQUFLLElBaEIzQixpQkFnQjJDLEtBQUssSUFoQmhELDhCQWtCRixLQUFLLElBbEJILCtCQW9CRCxLQUFLLElBcEJKLHVCQW9CMEIsS0FBSyxJQXBCL0IsaUJBb0IrQyxFQXBCL0MsV0FvQnVELEVBcEJ2RCxXQW9CK0QsS0FBSyxJQXBCcEUsYUFBSjtBQXNCQSxXQUFPLE1BQU0sR0FBYjtBQUNEO0FBdkNTLENBQVo7O0FBMENBLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBeUI7QUFBQSxNQUFsQixHQUFrQix1RUFBZCxDQUFjO0FBQUEsTUFBWCxHQUFXLHVFQUFQLENBQU87O0FBQ3hDLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7O0FBRUEsU0FBTyxNQUFQLENBQWUsSUFBZixFQUFxQjtBQUNuQixZQURtQjtBQUVuQixZQUZtQjtBQUduQixTQUFRLEtBQUksTUFBSixFQUhXO0FBSW5CLFlBQVEsQ0FBRSxHQUFGO0FBSlcsR0FBckI7O0FBT0EsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFwQixHQUErQixLQUFLLEdBQXBDOztBQUVBLFNBQU8sSUFBUDtBQUNELENBYkQ7OztBQzlDQTs7OztBQUVBLElBQUksT0FBTSxRQUFTLFVBQVQsQ0FBVjs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLE1BREM7QUFFVixpQkFBYyxJQUZKLEVBRVU7QUFDcEIsS0FIVSxpQkFHSjtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7QUFBQSxRQUFvQyxZQUFwQzs7QUFFQSxTQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4Qjs7QUFFQSxRQUFJLHFCQUFxQixhQUFhLEtBQUssTUFBTCxDQUFZLFNBQVosQ0FBc0IsR0FBbkMsR0FBeUMsSUFBbEU7QUFBQSxRQUNJLHVCQUF1QixLQUFLLE1BQUwsQ0FBWSxTQUFaLENBQXNCLEdBQXRCLEdBQTRCLENBRHZEO0FBQUEsUUFFSSxjQUFjLE9BQU8sQ0FBUCxDQUZsQjtBQUFBLFFBR0ksZ0JBQWdCLE9BQU8sQ0FBUCxDQUhwQjs7QUFLQTs7Ozs7Ozs7QUFRQSxvQkFFSSxhQUZKLGFBRXlCLGtCQUZ6QiwwQkFHVSxrQkFIVixXQUdrQyxvQkFIbEMsc0JBSUUsa0JBSkYsV0FJMEIsYUFKMUIseUJBTVEsb0JBTlIsV0FNa0MsYUFObEMsYUFNdUQsV0FOdkQ7QUFTQSxTQUFLLGFBQUwsR0FBcUIsT0FBTyxDQUFQLENBQXJCO0FBQ0EsU0FBSyxXQUFMLEdBQW1CLElBQW5COztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQTdCOztBQUVBLFNBQUssT0FBTCxDQUFhLE9BQWIsQ0FBc0I7QUFBQSxhQUFLLEVBQUUsR0FBRixFQUFMO0FBQUEsS0FBdEI7O0FBRUEsV0FBTyxDQUFFLElBQUYsRUFBUSxNQUFNLEdBQWQsQ0FBUDtBQUNELEdBdENTO0FBd0NWLFVBeENVLHNCQXdDQztBQUNULFFBQUksS0FBSyxNQUFMLENBQVksV0FBWixLQUE0QixLQUFoQyxFQUF3QztBQUN0QyxXQUFJLFNBQUosQ0FBZSxJQUFmLEVBRHNDLENBQ2hCO0FBQ3ZCOztBQUVELFFBQUksS0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLE1BQTBCLFNBQTlCLEVBQTBDO0FBQ3hDLFdBQUksYUFBSixDQUFtQixLQUFLLE1BQXhCOztBQUVBLFdBQUksSUFBSixDQUFVLEtBQUssSUFBZixpQkFBbUMsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFyRDtBQUNEOztBQUVELHdCQUFtQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQXJDO0FBQ0Q7QUFwRFMsQ0FBWjs7QUF1REEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsT0FBRixFQUFXLEdBQVgsRUFBZ0IsVUFBaEIsRUFBZ0M7QUFDL0MsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDtBQUFBLE1BQ0ksV0FBVyxFQUFFLE9BQU8sQ0FBVCxFQURmOztBQUdBLE1BQUksUUFBTyxVQUFQLHlDQUFPLFVBQVAsT0FBc0IsU0FBMUIsRUFBc0MsT0FBTyxNQUFQLENBQWUsUUFBZixFQUF5QixVQUF6Qjs7QUFFdEMsU0FBTyxNQUFQLENBQWUsSUFBZixFQUFxQjtBQUNuQixhQUFTLEVBRFU7QUFFbkIsU0FBUyxLQUFJLE1BQUosRUFGVTtBQUduQixZQUFTLENBQUUsR0FBRixFQUFPLE9BQVAsQ0FIVTtBQUluQixZQUFRO0FBQ04saUJBQVcsRUFBRSxRQUFPLENBQVQsRUFBWSxLQUFJLElBQWhCO0FBREwsS0FKVztBQU9uQixpQkFBWTtBQVBPLEdBQXJCLEVBU0EsUUFUQTs7QUFXQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUksTUFBSixFQUEvQjs7QUFFQSxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksS0FBSyxLQUF6QixFQUFnQyxHQUFoQyxFQUFzQztBQUNwQyxTQUFLLE9BQUwsQ0FBYSxJQUFiLENBQWtCO0FBQ2hCLGFBQU0sQ0FEVTtBQUVoQixXQUFLLE1BQU0sUUFGSztBQUdoQixjQUFPLElBSFM7QUFJaEIsY0FBUSxDQUFFLElBQUYsQ0FKUTtBQUtoQixjQUFRO0FBQ04sZUFBTyxFQUFFLFFBQU8sQ0FBVCxFQUFZLEtBQUksSUFBaEI7QUFERCxPQUxRO0FBUWhCLG1CQUFZLEtBUkk7QUFTaEIsWUFBUyxLQUFLLElBQWQsWUFBeUIsS0FBSSxNQUFKO0FBVFQsS0FBbEI7QUFXRDs7QUFFRCxTQUFPLElBQVA7QUFDRCxDQWxDRDs7O0FDM0RBOztBQUVBOzs7Ozs7OztBQU1BLElBQUksZUFBZSxRQUFTLGVBQVQsQ0FBbkI7O0FBRUEsSUFBSSxNQUFNOztBQUVSLFNBQU0sQ0FGRTtBQUdSLFFBSFEsb0JBR0M7QUFBRSxXQUFPLEtBQUssS0FBTCxFQUFQO0FBQXFCLEdBSHhCOztBQUlSLFNBQU0sS0FKRTtBQUtSLGNBQVksS0FMSixFQUtXO0FBQ25CLGtCQUFnQixLQU5SO0FBT1IsV0FBUTtBQUNOLGFBQVM7QUFESCxHQVBBOztBQVdSOzs7Ozs7QUFNQSxZQUFVLElBQUksR0FBSixFQWpCRjtBQWtCUixVQUFVLElBQUksR0FBSixFQWxCRjs7QUFvQlIsY0FBVyxFQXBCSDtBQXFCUixZQUFVLElBQUksR0FBSixFQXJCRjtBQXNCUixhQUFXLElBQUksR0FBSixFQXRCSDs7QUF3QlIsUUFBTSxFQXhCRTs7QUEwQlI7O0FBRUE7Ozs7O0FBS0EsUUFqQ1EsbUJBaUNBLEdBakNBLEVBaUNNLENBQUUsQ0FqQ1I7QUFtQ1IsZUFuQ1EseUJBbUNPLENBbkNQLEVBbUNXO0FBQ2pCLFNBQUssUUFBTCxDQUFjLEdBQWQsQ0FBbUIsT0FBTyxDQUExQjtBQUNELEdBckNPO0FBdUNSLGVBdkNRLHlCQXVDTyxVQXZDUCxFQXVDcUM7QUFBQSxRQUFsQixTQUFrQix1RUFBUixLQUFROztBQUMzQyxTQUFLLElBQUksR0FBVCxJQUFnQixVQUFoQixFQUE2QjtBQUMzQixVQUFJLFVBQVUsV0FBWSxHQUFaLENBQWQ7O0FBRUE7O0FBRUEsVUFBSSxRQUFRLE1BQVIsS0FBbUIsU0FBdkIsRUFBbUM7QUFDakMsZ0JBQVEsR0FBUixDQUFhLHVCQUFiLEVBQXNDLEdBQXRDOztBQUVBO0FBQ0Q7O0FBRUQsY0FBUSxHQUFSLEdBQWMsSUFBSSxNQUFKLENBQVcsS0FBWCxDQUFrQixRQUFRLE1BQTFCLEVBQWtDLFNBQWxDLENBQWQ7QUFDRDtBQUNGLEdBckRPO0FBdURSLGNBdkRRLHdCQXVETSxNQXZETixFQXVEYyxJQXZEZCxFQXVEcUI7QUFDM0IsUUFBTSxNQUFNLGFBQWEsTUFBYixDQUFxQixNQUFyQixFQUE2QixJQUE3QixDQUFaO0FBQ0EsV0FBTyxHQUFQO0FBQ0QsR0ExRE87OztBQTREUjs7Ozs7Ozs7Ozs7Ozs7QUFjQSxnQkExRVEsMEJBMEVRLElBMUVSLEVBMEVjLEdBMUVkLEVBMEVxRjtBQUFBLFFBQWxFLEtBQWtFLHVFQUExRCxLQUEwRDtBQUFBLFFBQW5ELGtCQUFtRCx1RUFBaEMsS0FBZ0M7QUFBQSxRQUF6QixPQUF5Qix1RUFBZixZQUFlOztBQUMzRixRQUFJLFdBQVcsTUFBTSxPQUFOLENBQWUsSUFBZixLQUF5QixLQUFLLE1BQUwsR0FBYyxDQUF0RDtBQUFBLFFBQ0ksaUJBREo7QUFBQSxRQUVJLGlCQUZKO0FBQUEsUUFFYyxpQkFGZDs7QUFJQSxRQUFJLE9BQU8sR0FBUCxLQUFlLFFBQWYsSUFBMkIsUUFBUSxTQUF2QyxFQUFtRDtBQUNqRCxZQUFNLGFBQWEsTUFBYixDQUFxQixHQUFyQixFQUEwQixPQUExQixDQUFOO0FBQ0Q7O0FBRUQ7QUFDQSxTQUFLLE1BQUwsR0FBYyxHQUFkO0FBQ0EsU0FBSyxJQUFMLEdBQVksRUFBWjtBQUNBLFNBQUssUUFBTCxDQUFjLEtBQWQ7QUFDQSxTQUFLLFFBQUwsQ0FBYyxLQUFkO0FBQ0EsU0FBSyxNQUFMLENBQVksS0FBWjtBQUNBOztBQUVBLFNBQUssVUFBTCxDQUFnQixNQUFoQixHQUF5QixDQUF6Qjs7QUFFQSxTQUFLLFlBQUwsR0FBb0Isa0JBQXBCO0FBQ0EsUUFBSSx1QkFBcUIsS0FBekIsRUFBaUMsS0FBSyxZQUFMLElBQXFCLCtCQUFyQjs7QUFFakM7QUFDQTtBQUNBLFNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxJQUFJLFFBQXhCLEVBQWtDLEdBQWxDLEVBQXdDO0FBQ3RDLFVBQUksT0FBTyxLQUFLLENBQUwsQ0FBUCxLQUFtQixRQUF2QixFQUFrQzs7QUFFbEM7QUFDQSxVQUFJLFVBQVUsV0FBVyxLQUFLLFFBQUwsQ0FBZSxLQUFLLENBQUwsQ0FBZixDQUFYLEdBQXNDLEtBQUssUUFBTCxDQUFlLElBQWYsQ0FBcEQ7QUFBQSxVQUNJLE9BQU8sRUFEWDs7QUFHQTtBQUNBO0FBQ0E7QUFDQSxjQUFRLE1BQU0sT0FBTixDQUFlLE9BQWYsSUFBMkIsUUFBUSxDQUFSLElBQWEsSUFBYixHQUFvQixRQUFRLENBQVIsQ0FBL0MsR0FBNEQsT0FBcEU7O0FBRUE7QUFDQSxhQUFPLEtBQUssS0FBTCxDQUFXLElBQVgsQ0FBUDs7QUFFQTs7QUFFQTtBQUNBLFVBQUksS0FBTSxLQUFLLE1BQUwsR0FBYSxDQUFuQixFQUF1QixJQUF2QixHQUE4QixPQUE5QixDQUFzQyxLQUF0QyxJQUErQyxDQUFDLENBQXBELEVBQXdEO0FBQUUsYUFBSyxJQUFMLENBQVcsSUFBWDtBQUFtQjs7QUFFN0U7QUFDQSxVQUFJLFVBQVUsS0FBSyxNQUFMLEdBQWMsQ0FBNUI7O0FBRUE7QUFDQSxXQUFNLE9BQU4sSUFBa0IsZUFBZSxDQUFmLEdBQW1CLE9BQW5CLEdBQTZCLEtBQU0sT0FBTixDQUE3QixHQUErQyxJQUFqRTs7QUFFQSxXQUFLLFlBQUwsSUFBcUIsS0FBSyxJQUFMLENBQVUsSUFBVixDQUFyQjtBQUNEOztBQUVELFNBQUssU0FBTCxDQUFlLE9BQWYsQ0FBd0IsaUJBQVM7QUFDL0IsVUFBSSxVQUFVLElBQWQsRUFDRSxNQUFNLEdBQU47QUFDSCxLQUhEOztBQUtBLFFBQUksa0JBQWtCLFdBQVcsa0JBQVgsR0FBZ0MscUJBQXREOztBQUVBLFNBQUssWUFBTCxHQUFvQixLQUFLLFlBQUwsQ0FBa0IsS0FBbEIsQ0FBd0IsSUFBeEIsQ0FBcEI7O0FBRUEsUUFBSSxLQUFLLFFBQUwsQ0FBYyxJQUFsQixFQUF5QjtBQUN2QixXQUFLLFlBQUwsR0FBb0IsS0FBSyxZQUFMLENBQWtCLE1BQWxCLENBQTBCLE1BQU0sSUFBTixDQUFZLEtBQUssUUFBakIsQ0FBMUIsQ0FBcEI7QUFDQSxXQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBd0IsZUFBeEI7QUFDRCxLQUhELE1BR0s7QUFDSCxXQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBd0IsZUFBeEI7QUFDRDtBQUNEO0FBQ0EsU0FBSyxZQUFMLEdBQW9CLEtBQUssWUFBTCxDQUFrQixJQUFsQixDQUF1QixJQUF2QixDQUFwQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFJLHVCQUF1QixJQUEzQixFQUFrQztBQUNoQyxXQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBc0IsUUFBdEI7QUFDRDtBQUNELFFBQUksd0NBQXVDLEtBQUssVUFBTCxDQUFnQixJQUFoQixDQUFxQixHQUFyQixDQUF2QyxjQUEyRSxLQUFLLFlBQWhGLFFBQUo7O0FBRUEsUUFBSSxLQUFLLEtBQUwsSUFBYyxLQUFsQixFQUEwQixRQUFRLEdBQVIsQ0FBYSxXQUFiOztBQUUxQixlQUFXLElBQUksUUFBSixDQUFjLFdBQWQsR0FBWDs7QUFHQTtBQXBGMkY7QUFBQTtBQUFBOztBQUFBO0FBcUYzRiwyQkFBaUIsS0FBSyxRQUFMLENBQWMsTUFBZCxFQUFqQiw4SEFBMEM7QUFBQSxZQUFqQyxJQUFpQzs7QUFDeEMsWUFBSSxPQUFPLE9BQU8sSUFBUCxDQUFhLElBQWIsRUFBb0IsQ0FBcEIsQ0FBWDtBQUFBLFlBQ0ksUUFBUSxLQUFNLElBQU4sQ0FEWjs7QUFHQSxpQkFBVSxJQUFWLElBQW1CLEtBQW5CO0FBQ0Q7QUExRjBGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUE7QUFBQSxZQTRGbEYsSUE1RmtGOztBQTZGekYsWUFBSSxPQUFPLE9BQU8sSUFBUCxDQUFhLElBQWIsRUFBb0IsQ0FBcEIsQ0FBWDtBQUFBLFlBQ0ksT0FBTyxLQUFNLElBQU4sQ0FEWDs7QUFHQSxlQUFPLGNBQVAsQ0FBdUIsUUFBdkIsRUFBaUMsSUFBakMsRUFBdUM7QUFDckMsd0JBQWMsSUFEdUI7QUFFckMsYUFGcUMsaUJBRS9CO0FBQUUsbUJBQU8sS0FBSyxLQUFaO0FBQW1CLFdBRlU7QUFHckMsYUFIcUMsZUFHakMsQ0FIaUMsRUFHL0I7QUFBRSxpQkFBSyxLQUFMLEdBQWEsQ0FBYjtBQUFnQjtBQUhhLFNBQXZDO0FBS0E7QUFyR3lGOztBQTRGM0YsNEJBQWlCLEtBQUssTUFBTCxDQUFZLE1BQVosRUFBakIsbUlBQXdDO0FBQUE7QUFVdkM7QUF0RzBGO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBd0czRixhQUFTLElBQVQsR0FBZ0IsS0FBSyxJQUFyQjtBQUNBLGFBQVMsR0FBVCxHQUFnQixJQUFJLFlBQUosQ0FBa0IsQ0FBbEIsQ0FBaEI7QUFDQSxhQUFTLFVBQVQsR0FBc0IsS0FBSyxVQUFMLENBQWdCLEtBQWhCLENBQXVCLENBQXZCLENBQXRCOztBQUVBO0FBQ0EsYUFBUyxNQUFULEdBQWtCLEtBQUssTUFBTCxDQUFZLElBQTlCOztBQUVBLFNBQUssU0FBTCxDQUFlLEtBQWY7O0FBRUEsV0FBTyxRQUFQO0FBQ0QsR0E1TE87OztBQThMUjs7Ozs7Ozs7QUFRQSxXQXRNUSxxQkFzTUcsSUF0TUgsRUFzTVU7QUFDaEIsV0FBTyxLQUFLLE1BQUwsQ0FBWSxHQUFaLENBQWlCLElBQUksUUFBckIsQ0FBUDtBQUNELEdBeE1PO0FBME1SLFVBMU1RLG9CQTBNRSxLQTFNRixFQTBNVTtBQUNoQixRQUFJLFdBQVcsUUFBTyxLQUFQLHlDQUFPLEtBQVAsT0FBaUIsUUFBaEM7QUFBQSxRQUNJLHVCQURKOztBQUdBLFFBQUksUUFBSixFQUFlO0FBQUU7QUFDZjtBQUNBLFVBQUksSUFBSSxJQUFKLENBQVUsTUFBTSxJQUFoQixDQUFKLEVBQTZCO0FBQUU7QUFDN0IseUJBQWlCLElBQUksSUFBSixDQUFVLE1BQU0sSUFBaEIsQ0FBakI7QUFDRCxPQUZELE1BRU0sSUFBSSxNQUFNLE9BQU4sQ0FBZSxLQUFmLENBQUosRUFBNkI7QUFDakMsWUFBSSxRQUFKLENBQWMsTUFBTSxDQUFOLENBQWQ7QUFDQSxZQUFJLFFBQUosQ0FBYyxNQUFNLENBQU4sQ0FBZDtBQUNELE9BSEssTUFHRDtBQUFFO0FBQ0wsWUFBSSxPQUFPLE1BQU0sR0FBYixLQUFxQixVQUF6QixFQUFzQztBQUNwQyxrQkFBUSxHQUFSLENBQWEsZUFBYixFQUE4QixLQUE5QixFQUFxQyxNQUFNLEdBQTNDO0FBQ0Q7QUFDRCxZQUFJLE9BQU8sTUFBTSxHQUFOLEVBQVg7QUFDQTs7QUFFQSxZQUFJLE1BQU0sT0FBTixDQUFlLElBQWYsQ0FBSixFQUE0QjtBQUMxQixjQUFJLENBQUMsSUFBSSxjQUFULEVBQTBCO0FBQ3hCLGdCQUFJLFlBQUosSUFBb0IsS0FBSyxDQUFMLENBQXBCO0FBQ0QsV0FGRCxNQUVLO0FBQ0gsZ0JBQUksUUFBSixHQUFlLEtBQUssQ0FBTCxDQUFmO0FBQ0EsZ0JBQUksYUFBSixDQUFrQixJQUFsQixDQUF3QixLQUFLLENBQUwsQ0FBeEI7QUFDRDtBQUNEO0FBQ0EsMkJBQWlCLEtBQUssQ0FBTCxDQUFqQjtBQUNELFNBVEQsTUFTSztBQUNILDJCQUFpQixJQUFqQjtBQUNEO0FBQ0Y7QUFDRixLQTNCRCxNQTJCSztBQUFFO0FBQ0wsdUJBQWlCLEtBQWpCO0FBQ0Q7O0FBRUQsV0FBTyxjQUFQO0FBQ0QsR0E5T087QUFnUFIsZUFoUFEsMkJBZ1BRO0FBQ2QsU0FBSyxhQUFMLEdBQXFCLEVBQXJCO0FBQ0EsU0FBSyxjQUFMLEdBQXNCLElBQXRCO0FBQ0QsR0FuUE87QUFvUFIsYUFwUFEseUJBb1BNO0FBQ1osU0FBSyxjQUFMLEdBQXNCLEtBQXRCOztBQUVBLFdBQU8sQ0FBRSxLQUFLLFFBQVAsRUFBaUIsS0FBSyxhQUFMLENBQW1CLEtBQW5CLENBQXlCLENBQXpCLENBQWpCLENBQVA7QUFDRCxHQXhQTztBQTBQUixNQTFQUSxnQkEwUEYsS0ExUEUsRUEwUE07QUFDWixRQUFJLE1BQU0sT0FBTixDQUFlLEtBQWYsQ0FBSixFQUE2QjtBQUFFO0FBQUY7QUFBQTtBQUFBOztBQUFBO0FBQzNCLDhCQUFvQixLQUFwQixtSUFBNEI7QUFBQSxjQUFuQixPQUFtQjs7QUFDMUIsZUFBSyxJQUFMLENBQVcsT0FBWDtBQUNEO0FBSDBCO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJNUIsS0FKRCxNQUlPO0FBQ0wsVUFBSSxRQUFPLEtBQVAseUNBQU8sS0FBUCxPQUFpQixRQUFyQixFQUFnQztBQUM5QixZQUFJLE1BQU0sTUFBTixLQUFpQixTQUFyQixFQUFpQztBQUMvQixlQUFLLElBQUksU0FBVCxJQUFzQixNQUFNLE1BQTVCLEVBQXFDO0FBQ25DLGlCQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWtCLE1BQU0sTUFBTixDQUFjLFNBQWQsRUFBMEIsR0FBNUM7QUFDRDtBQUNGO0FBQ0QsWUFBSSxNQUFNLE9BQU4sQ0FBZSxNQUFNLE1BQXJCLENBQUosRUFBb0M7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFDbEMsa0NBQWlCLE1BQU0sTUFBdkIsbUlBQWdDO0FBQUEsa0JBQXZCLElBQXVCOztBQUM5QixtQkFBSyxJQUFMLENBQVcsSUFBWDtBQUNEO0FBSGlDO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFJbkM7QUFDRjtBQUNGO0FBQ0Y7QUE3UU8sQ0FBVjs7QUFnUkEsT0FBTyxPQUFQLEdBQWlCLEdBQWpCOzs7QUMxUkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsSUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxxQkFBZSxLQUFLLElBQXBCOztBQUVBLFFBQUksTUFBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVAsS0FBMkIsTUFBTyxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVAsQ0FBL0IsRUFBeUQ7QUFDdkQscUJBQWEsT0FBTyxDQUFQLENBQWIsV0FBNEIsT0FBTyxDQUFQLENBQTVCO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsYUFBTyxPQUFPLENBQVAsSUFBWSxPQUFPLENBQVAsQ0FBWixHQUF3QixDQUF4QixHQUE0QixDQUFuQztBQUNEO0FBQ0QsV0FBTyxNQUFQOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQTdCOztBQUVBLFdBQU8sQ0FBQyxLQUFLLElBQU4sRUFBWSxHQUFaLENBQVA7QUFDRDtBQW5CUyxDQUFaOztBQXNCQSxPQUFPLE9BQVAsR0FBaUIsVUFBQyxDQUFELEVBQUcsQ0FBSCxFQUFTO0FBQ3hCLE1BQUksS0FBSyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVQ7O0FBRUEsS0FBRyxNQUFILEdBQVksQ0FBRSxDQUFGLEVBQUksQ0FBSixDQUFaO0FBQ0EsS0FBRyxJQUFILEdBQVUsR0FBRyxRQUFILEdBQWMsS0FBSSxNQUFKLEVBQXhCOztBQUVBLFNBQU8sRUFBUDtBQUNELENBUEQ7OztBQzFCQTs7QUFFQSxJQUFJLE9BQU0sUUFBUSxVQUFSLENBQVY7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsUUFBSyxLQURLOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLHFCQUFlLEtBQUssSUFBcEI7O0FBRUEsUUFBSSxNQUFPLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBUCxLQUEyQixNQUFPLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBUCxDQUEvQixFQUF5RDtBQUN2RCxvQkFBWSxPQUFPLENBQVAsQ0FBWixZQUE0QixPQUFPLENBQVAsQ0FBNUI7QUFDRCxLQUZELE1BRU87QUFDTCxhQUFPLE9BQU8sQ0FBUCxLQUFhLE9BQU8sQ0FBUCxDQUFiLEdBQXlCLENBQXpCLEdBQTZCLENBQXBDO0FBQ0Q7QUFDRCxXQUFPLE1BQVA7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBN0I7O0FBRUEsV0FBTyxDQUFDLEtBQUssSUFBTixFQUFZLEdBQVosQ0FBUDtBQUNEO0FBbkJTLENBQVo7O0FBc0JBLE9BQU8sT0FBUCxHQUFpQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDeEIsTUFBSSxLQUFLLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVDs7QUFFQSxLQUFHLE1BQUgsR0FBWSxDQUFFLENBQUYsRUFBSSxDQUFKLENBQVo7QUFDQSxLQUFHLElBQUgsR0FBVSxRQUFRLEtBQUksTUFBSixFQUFsQjs7QUFFQSxTQUFPLEVBQVA7QUFDRCxDQVBEOzs7QUMxQkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFFBQUssS0FESzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFJLE1BQU8sS0FBSyxNQUFMLENBQVksQ0FBWixDQUFQLEtBQTJCLE1BQU8sS0FBSyxNQUFMLENBQVksQ0FBWixDQUFQLENBQS9CLEVBQXlEO0FBQ3ZELGtCQUFVLE9BQVEsQ0FBUixDQUFWLGVBQStCLE9BQU8sQ0FBUCxDQUEvQixXQUE4QyxPQUFPLENBQVAsQ0FBOUM7QUFDRCxLQUZELE1BRU87QUFDTCxZQUFNLE9BQU8sQ0FBUCxLQUFnQixPQUFPLENBQVAsSUFBWSxPQUFPLENBQVAsQ0FBZCxHQUE0QixDQUExQyxDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFkUyxDQUFaOztBQWlCQSxPQUFPLE9BQVAsR0FBaUIsVUFBQyxDQUFELEVBQUcsQ0FBSCxFQUFTO0FBQ3hCLE1BQUksTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVY7O0FBRUEsTUFBSSxNQUFKLEdBQWEsQ0FBRSxDQUFGLEVBQUksQ0FBSixDQUFiOztBQUVBLFNBQU8sR0FBUDtBQUNELENBTkQ7OztBQ3JCQTs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFlBQWE7QUFBQSxNQUFYLEdBQVcsdUVBQVAsQ0FBTzs7QUFDNUIsTUFBSSxPQUFPO0FBQ1QsWUFBUSxDQUFFLEdBQUYsQ0FEQztBQUVULFlBQVEsRUFBRSxPQUFPLEVBQUUsUUFBTyxDQUFULEVBQVksS0FBSyxJQUFqQixFQUFULEVBRkM7QUFHVCxjQUFVLElBSEQ7O0FBS1QsTUFMUyxlQUtMLENBTEssRUFLRDtBQUNOLFVBQUksS0FBSSxTQUFKLENBQWMsR0FBZCxDQUFtQixDQUFuQixDQUFKLEVBQTRCO0FBQzFCLFlBQUksY0FBYyxLQUFJLFNBQUosQ0FBYyxHQUFkLENBQW1CLENBQW5CLENBQWxCO0FBQ0EsYUFBSyxJQUFMLEdBQVksWUFBWSxJQUF4QjtBQUNBLGVBQU8sV0FBUDtBQUNEOztBQUVELFVBQUksTUFBTTtBQUNSLFdBRFEsaUJBQ0Y7QUFDSixjQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiOztBQUVBLGNBQUksS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFsQixLQUEwQixJQUE5QixFQUFxQztBQUNuQyxpQkFBSSxhQUFKLENBQW1CLEtBQUssTUFBeEI7QUFDQSxpQkFBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQW5DLElBQTJDLEdBQTNDO0FBQ0Q7O0FBRUQsY0FBSSxNQUFNLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBNUI7O0FBRUEsZUFBSSxhQUFKLENBQW1CLGFBQWEsR0FBYixHQUFtQixPQUFuQixHQUE2QixPQUFRLENBQVIsQ0FBaEQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsZUFBSSxTQUFKLENBQWMsR0FBZCxDQUFtQixDQUFuQixFQUFzQixHQUF0Qjs7QUFFQSxpQkFBTyxPQUFRLENBQVIsQ0FBUDtBQUNELFNBbkJPOztBQW9CUixjQUFNLEtBQUssSUFBTCxHQUFZLEtBQVosR0FBa0IsS0FBSSxNQUFKLEVBcEJoQjtBQXFCUixnQkFBUSxLQUFLO0FBckJMLE9BQVY7O0FBd0JBLFdBQUssTUFBTCxDQUFhLENBQWIsSUFBbUIsQ0FBbkI7O0FBRUEsV0FBSyxRQUFMLEdBQWdCLEdBQWhCOztBQUVBLGFBQU8sR0FBUDtBQUNELEtBekNROzs7QUEyQ1QsU0FBSztBQUVILFNBRkcsaUJBRUc7QUFDSixZQUFJLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsS0FBMEIsSUFBOUIsRUFBcUM7QUFDbkMsY0FBSSxLQUFJLFNBQUosQ0FBYyxHQUFkLENBQW1CLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBbkIsTUFBd0MsU0FBNUMsRUFBd0Q7QUFDdEQsaUJBQUksU0FBSixDQUFjLEdBQWQsQ0FBbUIsS0FBSyxNQUFMLENBQVksQ0FBWixDQUFuQixFQUFtQyxLQUFLLFFBQXhDO0FBQ0Q7QUFDRCxlQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4QjtBQUNBLGVBQUksTUFBSixDQUFXLElBQVgsQ0FBaUIsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFuQyxJQUEyQyxXQUFZLEdBQVosQ0FBM0M7QUFDRDtBQUNELFlBQUksTUFBTSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQTVCOztBQUVBLGVBQU8sYUFBYSxHQUFiLEdBQW1CLEtBQTFCO0FBQ0Q7QUFiRSxLQTNDSTs7QUEyRFQsU0FBSyxLQUFJLE1BQUo7QUEzREksR0FBWDs7QUE4REEsT0FBSyxHQUFMLENBQVMsTUFBVCxHQUFrQixLQUFLLE1BQXZCOztBQUVBLE9BQUssSUFBTCxHQUFZLFlBQVksS0FBSyxHQUE3QjtBQUNBLE9BQUssR0FBTCxDQUFTLElBQVQsR0FBZ0IsS0FBSyxJQUFMLEdBQVksTUFBNUI7QUFDQSxPQUFLLEVBQUwsQ0FBUSxLQUFSLEdBQWlCLEtBQUssSUFBTCxHQUFZLEtBQTdCOztBQUVBLFNBQU8sY0FBUCxDQUF1QixJQUF2QixFQUE2QixPQUE3QixFQUFzQztBQUNwQyxPQURvQyxpQkFDOUI7QUFDSixVQUFJLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsS0FBMEIsSUFBOUIsRUFBcUM7QUFDbkMsZUFBTyxLQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbkMsQ0FBUDtBQUNEO0FBQ0YsS0FMbUM7QUFNcEMsT0FOb0MsZUFNL0IsQ0FOK0IsRUFNM0I7QUFDUCxVQUFJLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbEIsS0FBMEIsSUFBOUIsRUFBcUM7QUFDbkMsYUFBSSxNQUFKLENBQVcsSUFBWCxDQUFpQixLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQW5DLElBQTJDLENBQTNDO0FBQ0Q7QUFDRjtBQVZtQyxHQUF0Qzs7QUFhQSxTQUFPLElBQVA7QUFDRCxDQW5GRDs7O0FDSkE7O0FBRUEsSUFBSSxPQUFNLFFBQVMsVUFBVCxDQUFWOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsUUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxlQUFlLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBbkI7QUFBQSxRQUNJLGVBQWUsS0FBSSxRQUFKLENBQWMsYUFBYyxhQUFhLE1BQWIsR0FBc0IsQ0FBcEMsQ0FBZCxDQURuQjtBQUFBLFFBRUksaUJBQWUsS0FBSyxJQUFwQixlQUFrQyxZQUFsQyxPQUZKOztBQUlBOztBQUVBOztBQUVBLFNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxhQUFhLE1BQWIsR0FBc0IsQ0FBMUMsRUFBNkMsS0FBSSxDQUFqRCxFQUFxRDtBQUNuRCxVQUFJLGFBQWEsTUFBTSxhQUFhLE1BQWIsR0FBc0IsQ0FBN0M7QUFBQSxVQUNJLE9BQVEsS0FBSSxRQUFKLENBQWMsYUFBYyxDQUFkLENBQWQsQ0FEWjtBQUFBLFVBRUksV0FBVyxhQUFjLElBQUUsQ0FBaEIsQ0FGZjtBQUFBLFVBR0ksY0FISjtBQUFBLFVBR1csa0JBSFg7QUFBQSxVQUdzQixlQUh0Qjs7QUFLQTs7QUFFQSxVQUFJLE9BQU8sUUFBUCxLQUFvQixRQUF4QixFQUFrQztBQUNoQyxnQkFBUSxRQUFSO0FBQ0Esb0JBQVksSUFBWjtBQUNELE9BSEQsTUFHSztBQUNILFlBQUksS0FBSSxJQUFKLENBQVUsU0FBUyxJQUFuQixNQUE4QixTQUFsQyxFQUE4QztBQUM1QztBQUNBLGVBQUksYUFBSjs7QUFFQSxlQUFJLFFBQUosQ0FBYyxRQUFkOztBQUVBLGtCQUFRLEtBQUksV0FBSixFQUFSO0FBQ0Esc0JBQVksTUFBTSxDQUFOLENBQVo7QUFDQSxrQkFBUSxNQUFPLENBQVAsRUFBVyxJQUFYLENBQWdCLEVBQWhCLENBQVI7QUFDQSxrQkFBUSxPQUFPLE1BQU0sT0FBTixDQUFlLE1BQWYsRUFBdUIsTUFBdkIsQ0FBZjtBQUNELFNBVkQsTUFVSztBQUNILGtCQUFRLEVBQVI7QUFDQSxzQkFBWSxLQUFJLElBQUosQ0FBVSxTQUFTLElBQW5CLENBQVo7QUFDRDtBQUNGOztBQUVELGVBQVMsY0FBYyxJQUFkLFVBQ0YsS0FBSyxJQURILGVBQ2lCLEtBRGpCLEdBRUosS0FGSSxVQUVNLEtBQUssSUFGWCxlQUV5QixTQUZsQzs7QUFJQSxVQUFJLE1BQUksQ0FBUixFQUFZLE9BQU8sR0FBUDtBQUNaLHVCQUNFLElBREYsb0JBRUosTUFGSTs7QUFLQSxVQUFJLENBQUMsVUFBTCxFQUFrQjtBQUNoQjtBQUNELE9BRkQsTUFFSztBQUNIO0FBQ0Q7QUFDRjs7QUFFRCxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBMkIsS0FBSyxJQUFoQzs7QUFFQSxXQUFPLENBQUssS0FBSyxJQUFWLFdBQXNCLEdBQXRCLENBQVA7QUFDRDtBQTVEUyxDQUFaOztBQStEQSxPQUFPLE9BQVAsR0FBaUIsWUFBZ0I7QUFBQSxvQ0FBWCxJQUFXO0FBQVgsUUFBVztBQUFBOztBQUMvQixNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYO0FBQUEsTUFDSSxhQUFhLE1BQU0sT0FBTixDQUFlLEtBQUssQ0FBTCxDQUFmLElBQTJCLEtBQUssQ0FBTCxDQUEzQixHQUFxQyxJQUR0RDs7QUFHQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFNBQVMsS0FBSSxNQUFKLEVBRFU7QUFFbkIsWUFBUyxDQUFFLFVBQUY7QUFGVSxHQUFyQjs7QUFLQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUssR0FBcEM7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FaRDs7O0FDbkVBOztBQUVBLElBQUksT0FBTSxRQUFRLFVBQVIsQ0FBVjs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLElBREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFNBQUksVUFBSixDQUFlLElBQWYsQ0FBcUIsS0FBSyxJQUExQjs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUE3Qjs7QUFFQSxXQUFPLEtBQUssSUFBWjtBQUNEO0FBVFMsQ0FBWjs7QUFZQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxJQUFGLEVBQVk7QUFDM0IsTUFBSSxRQUFRLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWjs7QUFFQSxRQUFNLEVBQU4sR0FBYSxLQUFJLE1BQUosRUFBYjtBQUNBLFFBQU0sSUFBTixHQUFhLFNBQVMsU0FBVCxHQUFxQixJQUFyQixRQUErQixNQUFNLFFBQXJDLEdBQWdELE1BQU0sRUFBbkU7QUFDQSxRQUFNLENBQU4sSUFBVztBQUNULE9BRFMsaUJBQ0g7QUFDSixVQUFJLENBQUUsS0FBSSxVQUFKLENBQWUsUUFBZixDQUF5QixNQUFNLElBQS9CLENBQU4sRUFBOEMsS0FBSSxVQUFKLENBQWUsSUFBZixDQUFxQixNQUFNLElBQTNCO0FBQzlDLGFBQU8sTUFBTSxJQUFOLEdBQWEsS0FBcEI7QUFDRDtBQUpRLEdBQVg7QUFNQSxRQUFNLENBQU4sSUFBVztBQUNULE9BRFMsaUJBQ0g7QUFDSixVQUFJLENBQUUsS0FBSSxVQUFKLENBQWUsUUFBZixDQUF5QixNQUFNLElBQS9CLENBQU4sRUFBOEMsS0FBSSxVQUFKLENBQWUsSUFBZixDQUFxQixNQUFNLElBQTNCO0FBQzlDLGFBQU8sTUFBTSxJQUFOLEdBQWEsS0FBcEI7QUFDRDtBQUpRLEdBQVg7O0FBUUEsU0FBTyxLQUFQO0FBQ0QsQ0FwQkQ7OztBQ2hCQTs7QUFFQSxJQUFJLFVBQVU7QUFDWixRQURZLG1CQUNKLFdBREksRUFDVTtBQUNwQixRQUFJLGdCQUFnQixNQUFwQixFQUE2QjtBQUMzQixrQkFBWSxHQUFaLEdBQWtCLFFBQVEsT0FBMUIsQ0FEMkIsQ0FDVTtBQUNyQyxrQkFBWSxLQUFaLEdBQW9CLFFBQVEsRUFBNUIsQ0FGMkIsQ0FFVTtBQUNyQyxrQkFBWSxPQUFaLEdBQXNCLFFBQVEsTUFBOUIsQ0FIMkIsQ0FHVTs7QUFFckMsYUFBTyxRQUFRLE9BQWY7QUFDQSxhQUFPLFFBQVEsRUFBZjtBQUNBLGFBQU8sUUFBUSxNQUFmO0FBQ0Q7O0FBRUQsV0FBTyxNQUFQLENBQWUsV0FBZixFQUE0QixPQUE1Qjs7QUFFQSxXQUFPLGNBQVAsQ0FBdUIsT0FBdkIsRUFBZ0MsWUFBaEMsRUFBOEM7QUFDNUMsU0FENEMsaUJBQ3RDO0FBQUUsZUFBTyxRQUFRLEdBQVIsQ0FBWSxVQUFuQjtBQUErQixPQURLO0FBRTVDLFNBRjRDLGVBRXhDLENBRndDLEVBRXJDLENBQUU7QUFGbUMsS0FBOUM7O0FBS0EsWUFBUSxFQUFSLEdBQWEsWUFBWSxLQUF6QjtBQUNBLFlBQVEsT0FBUixHQUFrQixZQUFZLEdBQTlCO0FBQ0EsWUFBUSxNQUFSLEdBQWlCLFlBQVksT0FBN0I7O0FBRUEsZ0JBQVksSUFBWixHQUFtQixRQUFRLEtBQTNCO0FBQ0QsR0F4Qlc7OztBQTBCWixPQUFVLFFBQVMsVUFBVCxDQTFCRTs7QUE0QlosT0FBVSxRQUFTLFVBQVQsQ0E1QkU7QUE2QlosU0FBVSxRQUFTLFlBQVQsQ0E3QkU7QUE4QlosU0FBVSxRQUFTLFlBQVQsQ0E5QkU7QUErQlosT0FBVSxRQUFTLFVBQVQsQ0EvQkU7QUFnQ1osT0FBVSxRQUFTLFVBQVQsQ0FoQ0U7QUFpQ1osT0FBVSxRQUFTLFVBQVQsQ0FqQ0U7QUFrQ1osT0FBVSxRQUFTLFVBQVQsQ0FsQ0U7QUFtQ1osU0FBVSxRQUFTLFlBQVQsQ0FuQ0U7QUFvQ1osV0FBVSxRQUFTLGNBQVQsQ0FwQ0U7QUFxQ1osT0FBVSxRQUFTLFVBQVQsQ0FyQ0U7QUFzQ1osT0FBVSxRQUFTLFVBQVQsQ0F0Q0U7QUF1Q1osT0FBVSxRQUFTLFVBQVQsQ0F2Q0U7QUF3Q1osUUFBVSxRQUFTLFdBQVQsQ0F4Q0U7QUF5Q1osUUFBVSxRQUFTLFdBQVQsQ0F6Q0U7QUEwQ1osUUFBVSxRQUFTLFdBQVQsQ0ExQ0U7QUEyQ1osUUFBVSxRQUFTLFdBQVQsQ0EzQ0U7QUE0Q1osVUFBVSxRQUFTLGFBQVQsQ0E1Q0U7QUE2Q1osUUFBVSxRQUFTLFdBQVQsQ0E3Q0U7QUE4Q1osUUFBVSxRQUFTLFdBQVQsQ0E5Q0U7QUErQ1osU0FBVSxRQUFTLFlBQVQsQ0EvQ0U7QUFnRFosV0FBVSxRQUFTLGNBQVQsQ0FoREU7QUFpRFosU0FBVSxRQUFTLFlBQVQsQ0FqREU7QUFrRFosU0FBVSxRQUFTLFlBQVQsQ0FsREU7QUFtRFosUUFBVSxRQUFTLFdBQVQsQ0FuREU7QUFvRFosT0FBVSxRQUFTLFVBQVQsQ0FwREU7QUFxRFosT0FBVSxRQUFTLFVBQVQsQ0FyREU7QUFzRFosUUFBVSxRQUFTLFdBQVQsQ0F0REU7QUF1RFosV0FBVSxRQUFTLGNBQVQsQ0F2REU7QUF3RFosUUFBVSxRQUFTLFdBQVQsQ0F4REU7QUF5RFosUUFBVSxRQUFTLFdBQVQsQ0F6REU7QUEwRFosUUFBVSxRQUFTLFdBQVQsQ0ExREU7QUEyRFosT0FBVSxRQUFTLFVBQVQsQ0EzREU7QUE0RFosU0FBVSxRQUFTLFlBQVQsQ0E1REU7QUE2RFosUUFBVSxRQUFTLFdBQVQsQ0E3REU7QUE4RFosU0FBVSxRQUFTLFlBQVQsQ0E5REU7QUErRFosUUFBVSxRQUFTLFdBQVQsQ0EvREU7QUFnRVosT0FBVSxRQUFTLFVBQVQsQ0FoRUU7QUFpRVosT0FBVSxRQUFTLFVBQVQsQ0FqRUU7QUFrRVosU0FBVSxRQUFTLFlBQVQsQ0FsRUU7QUFtRVosT0FBVSxRQUFTLFVBQVQsQ0FuRUU7QUFvRVosTUFBVSxRQUFTLFNBQVQsQ0FwRUU7QUFxRVosT0FBVSxRQUFTLFVBQVQsQ0FyRUU7QUFzRVosTUFBVSxRQUFTLFNBQVQsQ0F0RUU7QUF1RVosT0FBVSxRQUFTLFVBQVQsQ0F2RUU7QUF3RVosUUFBVSxRQUFTLFdBQVQsQ0F4RUU7QUF5RVosUUFBVSxRQUFTLFdBQVQsQ0F6RUU7QUEwRVosU0FBVSxRQUFTLFlBQVQsQ0ExRUU7QUEyRVosU0FBVSxRQUFTLFlBQVQsQ0EzRUU7QUE0RVosTUFBVSxRQUFTLFNBQVQsQ0E1RUU7QUE2RVosT0FBVSxRQUFTLFVBQVQsQ0E3RUU7QUE4RVosUUFBVSxRQUFTLFdBQVQsQ0E5RUU7QUErRVosT0FBVSxRQUFTLFVBQVQsQ0EvRUUsRUErRTJCO0FBQ3ZDLE9BQVUsUUFBUyxVQUFULENBaEZFLEVBZ0YyQjtBQUN2QyxVQUFVLFFBQVMsYUFBVCxDQWpGRTtBQWtGWixhQUFVLFFBQVMsZ0JBQVQsQ0FsRkUsRUFrRjJCO0FBQ3ZDLFlBQVUsUUFBUyxlQUFULENBbkZFO0FBb0ZaLGFBQVUsUUFBUyxnQkFBVCxDQXBGRTtBQXFGWixPQUFVLFFBQVMsVUFBVCxDQXJGRTtBQXNGWixVQUFVLFFBQVMsYUFBVCxDQXRGRTtBQXVGWixTQUFVLFFBQVMsWUFBVCxDQXZGRTtBQXdGWixXQUFVLFFBQVMsY0FBVCxDQXhGRTtBQXlGWixPQUFVLFFBQVMsVUFBVCxDQXpGRTtBQTBGWixNQUFVLFFBQVMsU0FBVCxDQTFGRTtBQTJGWixRQUFVLFFBQVMsV0FBVCxDQTNGRTtBQTRGWixVQUFVLFFBQVMsZUFBVCxDQTVGRTtBQTZGWixRQUFVLFFBQVMsV0FBVCxDQTdGRTtBQThGWixPQUFVLFFBQVMsVUFBVCxDQTlGRTtBQStGWixPQUFVLFFBQVMsVUFBVCxDQS9GRTtBQWdHWixNQUFVLFFBQVMsU0FBVCxDQWhHRTtBQWlHWixPQUFVLFFBQVMsVUFBVCxDQWpHRTtBQWtHWixPQUFVLFFBQVMsVUFBVDtBQWxHRSxDQUFkOztBQXFHQSxRQUFRLEdBQVIsQ0FBWSxHQUFaLEdBQWtCLE9BQWxCOztBQUVBLE9BQU8sT0FBUCxHQUFpQixPQUFqQjs7O0FDekdBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLElBREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EscUJBQWUsS0FBSyxJQUFwQjs7QUFFQSxRQUFJLE1BQU8sS0FBSyxNQUFMLENBQVksQ0FBWixDQUFQLEtBQTJCLE1BQU8sS0FBSyxNQUFMLENBQVksQ0FBWixDQUFQLENBQS9CLEVBQXlEO0FBQ3ZELHFCQUFhLE9BQU8sQ0FBUCxDQUFiLFdBQTRCLE9BQU8sQ0FBUCxDQUE1QjtBQUNELEtBRkQsTUFFTztBQUNMLGFBQU8sT0FBTyxDQUFQLElBQVksT0FBTyxDQUFQLENBQVosR0FBd0IsQ0FBeEIsR0FBNEIsQ0FBbkM7QUFDRDtBQUNELFdBQU8sSUFBUDs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUE3Qjs7QUFFQSxXQUFPLENBQUMsS0FBSyxJQUFOLEVBQVksR0FBWixDQUFQOztBQUVBLFdBQU8sR0FBUDtBQUNEO0FBckJTLENBQVo7O0FBd0JBLE9BQU8sT0FBUCxHQUFpQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDeEIsTUFBSSxLQUFLLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVDs7QUFFQSxLQUFHLE1BQUgsR0FBWSxDQUFFLENBQUYsRUFBSSxDQUFKLENBQVo7QUFDQSxLQUFHLElBQUgsR0FBVSxHQUFHLFFBQUgsR0FBYyxLQUFJLE1BQUosRUFBeEI7O0FBRUEsU0FBTyxFQUFQO0FBQ0QsQ0FQRDs7O0FDNUJBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLEtBREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EscUJBQWUsS0FBSyxJQUFwQjs7QUFFQSxRQUFJLE1BQU8sS0FBSyxNQUFMLENBQVksQ0FBWixDQUFQLEtBQTJCLE1BQU8sS0FBSyxNQUFMLENBQVksQ0FBWixDQUFQLENBQS9CLEVBQXlEO0FBQ3ZELG9CQUFZLE9BQU8sQ0FBUCxDQUFaLFlBQTRCLE9BQU8sQ0FBUCxDQUE1QjtBQUNELEtBRkQsTUFFTztBQUNMLGFBQU8sT0FBTyxDQUFQLEtBQWEsT0FBTyxDQUFQLENBQWIsR0FBeUIsQ0FBekIsR0FBNkIsQ0FBcEM7QUFDRDtBQUNELFdBQU8sSUFBUDs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUE3Qjs7QUFFQSxXQUFPLENBQUMsS0FBSyxJQUFOLEVBQVksR0FBWixDQUFQOztBQUVBLFdBQU8sR0FBUDtBQUNEO0FBckJTLENBQVo7O0FBd0JBLE9BQU8sT0FBUCxHQUFpQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDeEIsTUFBSSxLQUFLLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVDs7QUFFQSxLQUFHLE1BQUgsR0FBWSxDQUFFLENBQUYsRUFBSSxDQUFKLENBQVo7QUFDQSxLQUFHLElBQUgsR0FBVSxRQUFRLEtBQUksTUFBSixFQUFsQjs7QUFFQSxTQUFPLEVBQVA7QUFDRCxDQVBEOzs7QUM1QkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFFBQUssS0FESzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFJLE1BQU8sS0FBSyxNQUFMLENBQVksQ0FBWixDQUFQLEtBQTJCLE1BQU8sS0FBSyxNQUFMLENBQVksQ0FBWixDQUFQLENBQS9CLEVBQXlEO0FBQ3ZELGtCQUFVLE9BQVEsQ0FBUixDQUFWLGNBQThCLE9BQU8sQ0FBUCxDQUE5QixXQUE2QyxPQUFPLENBQVAsQ0FBN0M7QUFDRCxLQUZELE1BRU87QUFDTCxZQUFNLE9BQU8sQ0FBUCxLQUFlLE9BQU8sQ0FBUCxJQUFZLE9BQU8sQ0FBUCxDQUFkLEdBQTRCLENBQXpDLENBQU47QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQWRTLENBQVo7O0FBaUJBLE9BQU8sT0FBUCxHQUFpQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDeEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsRUFBSSxDQUFKLENBQWI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FORDs7O0FDckJBOzs7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFFBQUssS0FESzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsS0FBc0IsTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUExQixFQUErQztBQUM3QyxXQUFJLFFBQUosQ0FBYSxHQUFiLHFCQUFxQixLQUFLLElBQTFCLEVBQWtDLEtBQUssR0FBdkM7O0FBRUEsMEJBQWtCLE9BQU8sQ0FBUCxDQUFsQixVQUFnQyxPQUFPLENBQVAsQ0FBaEM7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssR0FBTCxDQUFVLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBVixFQUFtQyxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQW5DLENBQU47QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQWpCUyxDQUFaOztBQW9CQSxPQUFPLE9BQVAsR0FBaUIsVUFBQyxDQUFELEVBQUcsQ0FBSCxFQUFTO0FBQ3hCLE1BQUksTUFBTSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVY7O0FBRUEsTUFBSSxNQUFKLEdBQWEsQ0FBRSxDQUFGLEVBQUksQ0FBSixDQUFiOztBQUVBLFNBQU8sR0FBUDtBQUNELENBTkQ7OztBQ3hCQTs7QUFFQSxJQUFJLE9BQU0sUUFBUSxVQUFSLENBQVY7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxNQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLHFCQUFlLEtBQUssSUFBcEIsV0FBOEIsT0FBTyxDQUFQLENBQTlCOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQTdCOztBQUVBLFdBQU8sQ0FBRSxLQUFLLElBQVAsRUFBYSxHQUFiLENBQVA7QUFDRDtBQVpTLENBQVo7O0FBZUEsT0FBTyxPQUFQLEdBQWlCLFVBQUMsR0FBRCxFQUFLLFFBQUwsRUFBa0I7QUFDakMsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxPQUFLLE1BQUwsR0FBYyxDQUFFLEdBQUYsQ0FBZDtBQUNBLE9BQUssRUFBTCxHQUFZLEtBQUksTUFBSixFQUFaO0FBQ0EsT0FBSyxJQUFMLEdBQVksYUFBYSxTQUFiLEdBQXlCLFdBQVcsR0FBWCxHQUFpQixLQUFJLE1BQUosRUFBMUMsUUFBNEQsS0FBSyxRQUFqRSxHQUE0RSxLQUFLLEVBQTdGOztBQUVBLFNBQU8sSUFBUDtBQUNELENBUkQ7OztBQ25CQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLEtBREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EsUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLEtBQXNCLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBMUIsRUFBK0M7QUFDN0MsV0FBSSxRQUFKLENBQWEsR0FBYixxQkFBcUIsS0FBSyxJQUExQixFQUFrQyxLQUFLLEdBQXZDOztBQUVBLDBCQUFrQixPQUFPLENBQVAsQ0FBbEIsVUFBZ0MsT0FBTyxDQUFQLENBQWhDO0FBRUQsS0FMRCxNQUtPO0FBQ0wsWUFBTSxLQUFLLEdBQUwsQ0FBVSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVYsRUFBbUMsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFuQyxDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFqQlMsQ0FBWjs7QUFvQkEsT0FBTyxPQUFQLEdBQWlCLFVBQUMsQ0FBRCxFQUFHLENBQUgsRUFBUztBQUN4QixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFWOztBQUVBLE1BQUksTUFBSixHQUFhLENBQUUsQ0FBRixFQUFJLENBQUosQ0FBYjs7QUFFQSxTQUFPLEdBQVA7QUFDRCxDQU5EOzs7QUN4QkE7O0FBRUEsSUFBSSxNQUFNLFFBQVEsVUFBUixDQUFWO0FBQUEsSUFDSSxNQUFNLFFBQVEsVUFBUixDQURWO0FBQUEsSUFFSSxNQUFNLFFBQVEsVUFBUixDQUZWO0FBQUEsSUFHSSxNQUFNLFFBQVEsVUFBUixDQUhWO0FBQUEsSUFJSSxPQUFNLFFBQVEsV0FBUixDQUpWOztBQU1BLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBTyxHQUFQLEVBQXNCO0FBQUEsUUFBVixDQUFVLHVFQUFSLEVBQVE7O0FBQ3JDLFFBQUksT0FBTyxLQUFNLElBQUssSUFBSSxHQUFKLEVBQVMsSUFBSSxDQUFKLEVBQU0sQ0FBTixDQUFULENBQUwsRUFBMkIsSUFBSyxHQUFMLEVBQVUsQ0FBVixDQUEzQixDQUFOLENBQVg7QUFDQSxTQUFLLElBQUwsR0FBWSxRQUFRLElBQUksTUFBSixFQUFwQjs7QUFFQSxXQUFPLElBQVA7QUFDRCxDQUxEOzs7QUNSQTs7QUFFQSxJQUFJLE9BQU0sUUFBUSxVQUFSLENBQVY7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFlBQWE7QUFBQSxvQ0FBVCxJQUFTO0FBQVQsUUFBUztBQUFBOztBQUM1QixNQUFJLE1BQU07QUFDUixRQUFRLEtBQUksTUFBSixFQURBO0FBRVIsWUFBUSxJQUZBOztBQUlSLE9BSlEsaUJBSUY7QUFDSixVQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiO0FBQUEsVUFDSSxNQUFJLEdBRFI7QUFBQSxVQUVJLE9BQU8sQ0FGWDtBQUFBLFVBR0ksV0FBVyxDQUhmO0FBQUEsVUFJSSxhQUFhLE9BQVEsQ0FBUixDQUpqQjtBQUFBLFVBS0ksbUJBQW1CLE1BQU8sVUFBUCxDQUx2QjtBQUFBLFVBTUksV0FBVyxLQU5mOztBQVFBLGFBQU8sT0FBUCxDQUFnQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDdkIsWUFBSSxNQUFNLENBQVYsRUFBYzs7QUFFZCxZQUFJLGVBQWUsTUFBTyxDQUFQLENBQW5CO0FBQUEsWUFDSSxhQUFlLE1BQU0sT0FBTyxNQUFQLEdBQWdCLENBRHpDOztBQUdBLFlBQUksQ0FBQyxnQkFBRCxJQUFxQixDQUFDLFlBQTFCLEVBQXlDO0FBQ3ZDLHVCQUFhLGFBQWEsQ0FBMUI7QUFDQSxpQkFBTyxVQUFQO0FBQ0QsU0FIRCxNQUdLO0FBQ0gsaUJBQVUsVUFBVixXQUEwQixDQUExQjtBQUNEOztBQUVELFlBQUksQ0FBQyxVQUFMLEVBQWtCLE9BQU8sS0FBUDtBQUNuQixPQWREOztBQWdCQSxhQUFPLEdBQVA7O0FBRUEsYUFBTyxHQUFQO0FBQ0Q7QUFoQ08sR0FBVjs7QUFtQ0EsU0FBTyxHQUFQO0FBQ0QsQ0FyQ0Q7OztBQ0pBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLFdBREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7QUFBQSxRQUVJLG9CQUZKOztBQUlBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLHVCQUFlLEtBQUssSUFBcEIsV0FBK0IsS0FBSSxVQUFuQyxrQkFBMEQsT0FBTyxDQUFQLENBQTFEOztBQUVBLFdBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixHQUF4Qjs7QUFFQSxvQkFBYyxDQUFFLEtBQUssSUFBUCxFQUFhLEdBQWIsQ0FBZDtBQUNELEtBTkQsTUFNTztBQUNMLFlBQU0sS0FBSSxVQUFKLEdBQWlCLElBQWpCLEdBQXdCLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBOUI7O0FBRUEsb0JBQWMsR0FBZDtBQUNEOztBQUVELFdBQU8sV0FBUDtBQUNEO0FBckJTLENBQVo7O0FBd0JBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksWUFBWSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQWhCOztBQUVBLFlBQVUsTUFBVixHQUFtQixDQUFFLENBQUYsQ0FBbkI7QUFDQSxZQUFVLElBQVYsR0FBaUIsTUFBTSxRQUFOLEdBQWlCLEtBQUksTUFBSixFQUFsQzs7QUFFQSxTQUFPLFNBQVA7QUFDRCxDQVBEOzs7QUM1QkE7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsUUFBSyxNQURLOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBMUIsRUFBa0MsS0FBSyxHQUF2Qzs7QUFFQSxtQkFBVyxLQUFLLE1BQWhCLGtDQUFtRCxPQUFPLENBQVAsQ0FBbkQ7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssTUFBTCxHQUFjLEtBQUssR0FBTCxDQUFVLGNBQWUsT0FBTyxDQUFQLElBQVksRUFBM0IsQ0FBVixDQUFwQjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBakJTLENBQVo7O0FBb0JBLE9BQU8sT0FBUCxHQUFpQixVQUFFLENBQUYsRUFBSyxLQUFMLEVBQWdCO0FBQy9CLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7QUFBQSxNQUNJLFdBQVcsRUFBRSxRQUFPLEdBQVQsRUFEZjs7QUFHQSxNQUFJLFVBQVUsU0FBZCxFQUEwQixPQUFPLE1BQVAsQ0FBZSxNQUFNLFFBQXJCOztBQUUxQixTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCLFFBQXJCO0FBQ0EsT0FBSyxNQUFMLEdBQWMsQ0FBRSxDQUFGLENBQWQ7O0FBR0EsU0FBTyxJQUFQO0FBQ0QsQ0FYRDs7O0FDeEJBOztBQUVBLElBQU0sT0FBTSxRQUFRLFVBQVIsQ0FBWjs7QUFFQSxJQUFNLFFBQVE7QUFDWixZQUFVLEtBREU7O0FBR1osS0FIWSxpQkFHTjtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7QUFBQSxRQUNJLGlCQUFlLEtBQUssSUFBcEIsUUFESjtBQUFBLFFBRUksTUFBTSxDQUZWO0FBQUEsUUFFYSxXQUFXLENBRnhCO0FBQUEsUUFFMkIsV0FBVyxLQUZ0QztBQUFBLFFBRTZDLG9CQUFvQixJQUZqRTs7QUFJQSxXQUFPLE9BQVAsQ0FBZ0IsVUFBQyxDQUFELEVBQUcsQ0FBSCxFQUFTO0FBQ3ZCLFVBQUksTUFBTyxDQUFQLENBQUosRUFBaUI7QUFDZixlQUFPLENBQVA7QUFDQSxZQUFJLElBQUksT0FBTyxNQUFQLEdBQWUsQ0FBdkIsRUFBMkI7QUFDekIscUJBQVcsSUFBWDtBQUNBLGlCQUFPLEtBQVA7QUFDRDtBQUNELDRCQUFvQixLQUFwQjtBQUNELE9BUEQsTUFPSztBQUNILFlBQUksTUFBTSxDQUFWLEVBQWM7QUFDWixnQkFBTSxDQUFOO0FBQ0QsU0FGRCxNQUVLO0FBQ0gsaUJBQU8sV0FBWSxDQUFaLENBQVA7QUFDRDtBQUNEO0FBQ0Q7QUFDRixLQWhCRDs7QUFrQkEsUUFBSSxXQUFXLENBQWYsRUFBbUI7QUFDakIsYUFBTyxZQUFZLGlCQUFaLEdBQWdDLEdBQWhDLEdBQXNDLFFBQVEsR0FBckQ7QUFDRDs7QUFFRCxXQUFPLElBQVA7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBN0I7O0FBRUEsV0FBTyxDQUFFLEtBQUssSUFBUCxFQUFhLEdBQWIsQ0FBUDtBQUNEO0FBbkNXLENBQWQ7O0FBc0NBLE9BQU8sT0FBUCxHQUFpQixZQUFlO0FBQUEsb0NBQVYsSUFBVTtBQUFWLFFBQVU7QUFBQTs7QUFDOUIsTUFBTSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWjs7QUFFQSxTQUFPLE1BQVAsQ0FBZSxHQUFmLEVBQW9CO0FBQ2hCLFFBQVEsS0FBSSxNQUFKLEVBRFE7QUFFaEIsWUFBUTtBQUZRLEdBQXBCOztBQUtBLE1BQUksSUFBSixHQUFXLElBQUksUUFBSixHQUFlLElBQUksRUFBOUI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FYRDs7O0FDMUNBOztBQUVBLElBQUksT0FBTSxRQUFTLFVBQVQsQ0FBVjs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLEtBREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7QUFBQSxRQUFvQyxZQUFwQzs7QUFFQSxVQUFNLDJDQUFOLFdBQTJELEtBQUssSUFBaEUsWUFBMkUsT0FBTyxDQUFQLENBQTNFLGFBQTRGLE9BQU8sQ0FBUCxDQUE1Rjs7QUFFQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUE3Qjs7QUFFQSxXQUFPLENBQUUsS0FBSyxJQUFQLEVBQWEsR0FBYixDQUFQO0FBQ0Q7QUFYUyxDQUFaOztBQWVBLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBTyxHQUFQLEVBQWdCO0FBQy9CLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7QUFDQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFNBQVMsS0FBSSxNQUFKLEVBRFU7QUFFbkIsWUFBUyxDQUFFLEdBQUYsRUFBTyxHQUFQO0FBRlUsR0FBckI7O0FBS0EsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFwQixHQUErQixLQUFLLEdBQXBDOztBQUVBLFNBQU8sSUFBUDtBQUNELENBVkQ7OztBQ25CQTs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsUUFBSyxPQURLOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7O0FBRUEsU0FBSSxRQUFKLENBQWEsR0FBYixDQUFpQixFQUFFLFNBQVUsS0FBSyxNQUFqQixFQUFqQjs7QUFFQSxxQkFBZSxLQUFLLElBQXBCOztBQUVBLFNBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixLQUFLLElBQTdCOztBQUVBLFdBQU8sQ0FBRSxLQUFLLElBQVAsRUFBYSxHQUFiLENBQVA7QUFDRDtBQWJTLENBQVo7O0FBZ0JBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksUUFBUSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVo7QUFDQSxRQUFNLElBQU4sR0FBYSxNQUFNLElBQU4sR0FBYSxLQUFJLE1BQUosRUFBMUI7O0FBRUEsU0FBTyxLQUFQO0FBQ0QsQ0FMRDs7O0FDcEJBOztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLEtBREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EsUUFBSSxNQUFPLEtBQUssTUFBTCxDQUFZLENBQVosQ0FBUCxDQUFKLEVBQThCO0FBQzVCLG1CQUFXLE9BQU8sQ0FBUCxDQUFYO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsWUFBTSxDQUFDLE9BQU8sQ0FBUCxDQUFELEtBQWUsQ0FBZixHQUFtQixDQUFuQixHQUF1QixDQUE3QjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBZFMsQ0FBWjs7QUFpQkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsQ0FBYjs7QUFFQSxTQUFPLEdBQVA7QUFDRCxDQU5EOzs7QUNyQkE7O0FBRUEsSUFBSSxNQUFNLFFBQVMsVUFBVCxDQUFWO0FBQUEsSUFDSSxPQUFPLFFBQVMsV0FBVCxDQURYO0FBQUEsSUFFSSxPQUFPLFFBQVMsV0FBVCxDQUZYO0FBQUEsSUFHSSxNQUFPLFFBQVMsVUFBVCxDQUhYOztBQUtBLElBQUksUUFBUTtBQUNWLFlBQVMsS0FEQztBQUVWLFdBRlUsdUJBRUU7QUFDVixRQUFJLFVBQVUsSUFBSSxZQUFKLENBQWtCLElBQWxCLENBQWQ7QUFBQSxRQUNJLFVBQVUsSUFBSSxZQUFKLENBQWtCLElBQWxCLENBRGQ7O0FBR0EsUUFBTSxXQUFXLEtBQUssRUFBTCxHQUFVLEdBQTNCO0FBQ0EsU0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLElBQXBCLEVBQTBCLEdBQTFCLEVBQWdDO0FBQzlCLFVBQUksTUFBTSxLQUFNLEtBQUssSUFBWCxDQUFWO0FBQ0EsY0FBUSxDQUFSLElBQWEsS0FBSyxHQUFMLENBQVUsTUFBTSxRQUFoQixDQUFiO0FBQ0EsY0FBUSxDQUFSLElBQWEsS0FBSyxHQUFMLENBQVUsTUFBTSxRQUFoQixDQUFiO0FBQ0Q7O0FBRUQsUUFBSSxPQUFKLENBQVksSUFBWixHQUFtQixLQUFNLE9BQU4sRUFBZSxDQUFmLEVBQWtCLEVBQUUsV0FBVSxJQUFaLEVBQWxCLENBQW5CO0FBQ0EsUUFBSSxPQUFKLENBQVksSUFBWixHQUFtQixLQUFNLE9BQU4sRUFBZSxDQUFmLEVBQWtCLEVBQUUsV0FBVSxJQUFaLEVBQWxCLENBQW5CO0FBQ0Q7QUFmUyxDQUFaOztBQW1CQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxTQUFGLEVBQWEsVUFBYixFQUFrRDtBQUFBLE1BQXpCLEdBQXlCLHVFQUFwQixFQUFvQjtBQUFBLE1BQWhCLFVBQWdCOztBQUNqRSxNQUFJLElBQUksT0FBSixDQUFZLElBQVosS0FBcUIsU0FBekIsRUFBcUMsTUFBTSxTQUFOOztBQUVyQyxNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsU0FBUyxJQUFJLE1BQUosRUFEVTtBQUVuQixZQUFTLENBQUUsU0FBRixFQUFhLFVBQWIsQ0FGVTtBQUduQixVQUFTLElBQUssU0FBTCxFQUFnQixLQUFNLElBQUksT0FBSixDQUFZLElBQWxCLEVBQXdCLEdBQXhCLEVBQTZCLEVBQUUsV0FBVSxPQUFaLEVBQTdCLENBQWhCLENBSFU7QUFJbkIsV0FBUyxJQUFLLFVBQUwsRUFBaUIsS0FBTSxJQUFJLE9BQUosQ0FBWSxJQUFsQixFQUF3QixHQUF4QixFQUE2QixFQUFFLFdBQVUsT0FBWixFQUE3QixDQUFqQjtBQUpVLEdBQXJCOztBQU9BLE9BQUssSUFBTCxRQUFlLEtBQUssUUFBcEIsR0FBK0IsS0FBSyxHQUFwQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQWZEOzs7QUMxQkE7Ozs7QUFFQSxJQUFJLE9BQU0sUUFBUSxVQUFSLENBQVY7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBVSxPQURBOztBQUdWLEtBSFUsaUJBR0o7QUFDSixTQUFJLGFBQUosQ0FBbUIsS0FBSyxNQUF4Qjs7QUFFQSxTQUFJLE1BQUosQ0FBVyxHQUFYLHFCQUFrQixLQUFLLElBQXZCLEVBQThCLElBQTlCOztBQUVBLFNBQUssS0FBTCxHQUFhLEtBQUssWUFBbEI7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLGdCQUFrQyxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQXBEOztBQUVBLFdBQU8sS0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLENBQVA7QUFDRDtBQWJTLENBQVo7O0FBZ0JBLE9BQU8sT0FBUCxHQUFpQixZQUEyQjtBQUFBLE1BQXpCLFFBQXlCLHVFQUFoQixDQUFnQjtBQUFBLE1BQWIsS0FBYSx1RUFBUCxDQUFPOztBQUMxQyxNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYOztBQUVBLE1BQUksT0FBTyxRQUFQLEtBQW9CLFFBQXhCLEVBQW1DO0FBQ2pDLFNBQUssSUFBTCxHQUFZLEtBQUssUUFBTCxHQUFnQixLQUFJLE1BQUosRUFBNUI7QUFDQSxTQUFLLFlBQUwsR0FBb0IsUUFBcEI7QUFDRCxHQUhELE1BR0s7QUFDSCxTQUFLLElBQUwsR0FBWSxRQUFaO0FBQ0EsU0FBSyxZQUFMLEdBQW9CLEtBQXBCO0FBQ0Q7O0FBRUQsU0FBTyxjQUFQLENBQXVCLElBQXZCLEVBQTZCLE9BQTdCLEVBQXNDO0FBQ3BDLE9BRG9DLGlCQUM5QjtBQUNKLFVBQUksS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFsQixLQUEwQixJQUE5QixFQUFxQztBQUNuQyxlQUFPLEtBQUksTUFBSixDQUFXLElBQVgsQ0FBaUIsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFuQyxDQUFQO0FBQ0Q7QUFDRixLQUxtQztBQU1wQyxPQU5vQyxlQU0vQixDQU4rQixFQU0zQjtBQUNQLFVBQUksS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixHQUFsQixLQUEwQixJQUE5QixFQUFxQztBQUNuQyxhQUFJLE1BQUosQ0FBVyxJQUFYLENBQWlCLEtBQUssTUFBTCxDQUFZLEtBQVosQ0FBa0IsR0FBbkMsSUFBMkMsQ0FBM0M7QUFDRDtBQUNGO0FBVm1DLEdBQXRDOztBQWFBLE9BQUssTUFBTCxHQUFjO0FBQ1osV0FBTyxFQUFFLFFBQU8sQ0FBVCxFQUFZLEtBQUksSUFBaEI7QUFESyxHQUFkOztBQUlBLFNBQU8sSUFBUDtBQUNELENBN0JEOzs7QUNwQkE7O0FBRUEsSUFBTSxPQUFPLFFBQVEsVUFBUixDQUFiO0FBQUEsSUFDTSxXQUFXLFFBQVEsV0FBUixDQURqQjs7QUFHQSxJQUFJLFFBQVE7QUFDVixZQUFTLE1BREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksVUFBVSxTQUFTLEtBQUssSUFBNUI7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiO0FBQUEsUUFFSSxZQUZKO0FBQUEsUUFFUyxxQkFGVDtBQUFBLFFBRXVCLGFBRnZCO0FBQUEsUUFFNkIscUJBRjdCO0FBQUEsUUFFMkMsWUFGM0M7O0FBSUEsVUFBTSxPQUFPLENBQVAsQ0FBTjtBQUNBLG1CQUFlLENBQUMsS0FBSyxJQUFMLENBQVcsS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQixNQUE1QixJQUF1QyxDQUF4QyxNQUFnRCxLQUFLLElBQUwsQ0FBVyxLQUFLLElBQUwsQ0FBVSxNQUFWLENBQWlCLE1BQTVCLENBQS9EOztBQUVBLFFBQUksS0FBSyxJQUFMLEtBQWMsUUFBbEIsRUFBNkI7O0FBRTdCLGdDQUF3QixLQUFLLElBQTdCLG9CQUFnRCxHQUFoRCxrQkFDSSxLQUFLLElBRFQsa0JBQ3lCLEtBQUssSUFBTCxLQUFjLFNBQWQsR0FBMEIsT0FBTyxDQUFQLENBQTFCLEdBQXNDLE9BQU8sQ0FBUCxJQUFZLEtBQVosSUFBcUIsS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQixNQUFqQixHQUEwQixDQUEvQyxDQUQvRCxtQkFFSSxLQUFLLElBRlQsaUJBRXlCLEtBQUssSUFGOUI7O0FBSUEsVUFBSSxLQUFLLFNBQUwsS0FBbUIsTUFBdkIsRUFBZ0M7QUFDOUIsZUFBTyxzQkFDRixLQUFLLElBREgsd0JBQzBCLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsTUFEM0MsYUFFSixLQUFLLElBRkQsc0JBRXNCLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsTUFGdkMsV0FFbUQsS0FBSyxJQUZ4RCxxQkFFNEUsS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQixNQUY3RixXQUV5RyxLQUFLLElBRjlHLGVBQVA7QUFHRCxPQUpELE1BSU0sSUFBSSxLQUFLLFNBQUwsS0FBbUIsT0FBdkIsRUFBaUM7QUFDckMsZUFDSyxLQUFLLElBRFYsdUJBQytCLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUIsTUFBakIsR0FBMEIsQ0FEekQsYUFDZ0UsS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQixNQUFqQixHQUEwQixDQUQxRixZQUNpRyxLQUFLLElBRHRHO0FBRUQsT0FISyxNQUdDLElBQUksS0FBSyxTQUFMLEtBQW1CLE1BQW5CLElBQTZCLEtBQUssU0FBTCxLQUFtQixRQUFwRCxFQUErRDtBQUNwRSxlQUNLLEtBQUssSUFEVix1QkFDK0IsS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQixNQUFqQixHQUEwQixDQUR6RCxZQUNnRSxLQUFLLElBRHJFLGtCQUNxRixLQUFLLElBQUwsQ0FBVSxNQUFWLENBQWlCLE1BQWpCLEdBQTBCLENBRC9HLFlBQ3NILEtBQUssSUFEM0g7QUFFRCxPQUhNLE1BR0Y7QUFDRixlQUNFLEtBQUssSUFEUDtBQUVGOztBQUVELFVBQUksS0FBSyxNQUFMLEtBQWdCLFFBQXBCLEVBQStCO0FBQy9CLG1DQUF5QixLQUFLLElBQTlCLGlCQUE4QyxLQUFLLElBQW5ELGlCQUFtRSxLQUFLLElBQXhFLHVCQUNJLEtBQUssSUFEVCx5QkFDaUMsS0FBSyxJQUR0QyxvQkFDeUQsS0FBSyxJQUQ5RCx5QkFFSSxLQUFLLElBRlQsaUJBRXlCLElBRnpCOztBQUlFLFlBQUksS0FBSyxTQUFMLEtBQW1CLFFBQXZCLEVBQWtDO0FBQ2hDLHVDQUNBLEtBQUssSUFETCxpQkFDcUIsS0FBSyxJQUQxQixtQkFDMkMsS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQixNQUFqQixHQUEwQixDQURyRSxhQUM2RSxLQUFLLElBRGxGLHlCQUMwRyxLQUFLLElBRC9HLGdCQUM4SCxLQUFLLElBRG5JLDBCQUM0SixLQUFLLElBRGpLLG1CQUNtTCxLQUFLLElBRHhMLGtCQUN5TSxLQUFLLElBRDlNO0FBRUQsU0FIRCxNQUdLO0FBQ0gsdUNBQ0EsS0FBSyxJQURMLGlCQUNxQixLQUFLLElBRDFCLGdCQUN5QyxLQUFLLElBRDlDLDBCQUN1RSxLQUFLLElBRDVFLG1CQUM4RixLQUFLLElBRG5HLGtCQUNvSCxLQUFLLElBRHpIO0FBRUQ7QUFDRixPQVpELE1BWUs7QUFDSCxtQ0FBeUIsS0FBSyxJQUE5Qix1QkFBb0QsS0FBSyxJQUF6RCxtQkFBMkUsS0FBSyxJQUFoRjtBQUNEO0FBRUEsS0FyQ0QsTUFxQ087QUFBRTtBQUNQLGtDQUEwQixHQUExQixXQUFvQyxPQUFPLENBQVAsQ0FBcEM7O0FBRUEsYUFBTyxZQUFQO0FBQ0Q7O0FBRUQsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBTCxHQUFZLE1BQXBDOztBQUVBLFdBQU8sQ0FBRSxLQUFLLElBQUwsR0FBVSxNQUFaLEVBQW9CLFlBQXBCLENBQVA7QUFDRCxHQXpEUzs7O0FBMkRWLFlBQVcsRUFBRSxVQUFTLENBQVgsRUFBYyxNQUFLLE9BQW5CLEVBQTRCLFFBQU8sUUFBbkMsRUFBNkMsV0FBVSxNQUF2RDtBQTNERCxDQUFaOztBQThEQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxVQUFGLEVBQXVDO0FBQUEsTUFBekIsS0FBeUIsdUVBQW5CLENBQW1CO0FBQUEsTUFBaEIsVUFBZ0I7O0FBQ3RELE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7O0FBRUE7O0FBRUE7QUFDQSxNQUFNLFlBQVksT0FBTyxXQUFXLFFBQWxCLEtBQStCLFdBQS9CLEdBQTZDLEtBQUksR0FBSixDQUFRLElBQVIsQ0FBYyxVQUFkLENBQTdDLEdBQTBFLFVBQTVGOztBQUVBLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFDRTtBQUNFLFlBQVksU0FEZDtBQUVFLGNBQVksVUFBVSxJQUZ4QjtBQUdFLFNBQVksS0FBSSxNQUFKLEVBSGQ7QUFJRSxZQUFZLENBQUUsS0FBRixFQUFTLFNBQVQ7QUFKZCxHQURGLEVBT0UsTUFBTSxRQVBSLEVBUUUsVUFSRjs7QUFXQSxPQUFLLElBQUwsR0FBWSxLQUFLLFFBQUwsR0FBZ0IsS0FBSyxHQUFqQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQXRCRDs7O0FDbkVBOztBQUVBLElBQUksTUFBUSxRQUFTLFVBQVQsQ0FBWjtBQUFBLElBQ0ksUUFBUSxRQUFTLFlBQVQsQ0FEWjtBQUFBLElBRUksTUFBUSxRQUFTLFVBQVQsQ0FGWjtBQUFBLElBR0ksUUFBUSxFQUFFLFVBQVMsUUFBWCxFQUhaO0FBQUEsSUFJSSxNQUFRLFFBQVMsVUFBVCxDQUpaOztBQU1BLElBQU0sV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFSLEVBQVcsS0FBSyxDQUFoQixFQUFqQjs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsWUFBd0M7QUFBQSxNQUF0QyxTQUFzQyx1RUFBMUIsQ0FBMEI7QUFBQSxNQUF2QixLQUF1Qix1RUFBZixDQUFlO0FBQUEsTUFBWixNQUFZOztBQUN2RCxNQUFNLFFBQVEsT0FBTyxNQUFQLENBQWUsRUFBZixFQUFtQixRQUFuQixFQUE2QixNQUE3QixDQUFkOztBQUVBLE1BQU0sUUFBUSxNQUFNLEdBQU4sR0FBWSxNQUFNLEdBQWhDOztBQUVBLE1BQU0sT0FBTyxPQUFPLFNBQVAsS0FBcUIsUUFBckIsR0FDVCxNQUFRLFlBQVksS0FBYixHQUFzQixJQUFJLFVBQWpDLEVBQTZDLEtBQTdDLEVBQW9ELEtBQXBELENBRFMsR0FFVCxNQUNFLElBQ0UsSUFBSyxTQUFMLEVBQWdCLEtBQWhCLENBREYsRUFFRSxJQUFJLFVBRk4sQ0FERixFQUtFLEtBTEYsRUFLUyxLQUxULENBRko7O0FBVUEsT0FBSyxJQUFMLEdBQVksTUFBTSxRQUFOLEdBQWlCLElBQUksTUFBSixFQUE3Qjs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQWxCRDs7O0FDVkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYO0FBQUEsSUFDSSxNQUFPLFFBQVEsVUFBUixDQURYO0FBQUEsSUFFSSxPQUFPLFFBQVEsV0FBUixDQUZYOztBQUlBLElBQUksUUFBUTtBQUNWLFlBQVMsTUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxXQUFXLFFBQWY7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiO0FBQUEsUUFFSSxZQUZKO0FBQUEsUUFFUyxZQUZUO0FBQUEsUUFFYyxnQkFGZDs7QUFJQSxVQUFNLEtBQUssSUFBTCxDQUFVLEdBQVYsRUFBTjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQUksWUFBWSxLQUFLLE1BQUwsQ0FBWSxDQUFaLE1BQW1CLENBQW5CLFVBQ1QsUUFEUyxVQUNJLEdBREosYUFDZSxPQUFPLENBQVAsQ0FEZixpQkFFVCxRQUZTLFVBRUksR0FGSixXQUVhLE9BQU8sQ0FBUCxDQUZiLGFBRThCLE9BQU8sQ0FBUCxDQUY5QixPQUFoQjs7QUFJQSxRQUFJLEtBQUssTUFBTCxLQUFnQixTQUFwQixFQUFnQztBQUM5QixXQUFJLFlBQUosSUFBb0IsU0FBcEI7QUFDRCxLQUZELE1BRUs7QUFDSCxhQUFPLENBQUUsS0FBSyxNQUFQLEVBQWUsU0FBZixDQUFQO0FBQ0Q7QUFDRjtBQXZCUyxDQUFaO0FBeUJBLE9BQU8sT0FBUCxHQUFpQixVQUFFLElBQUYsRUFBUSxLQUFSLEVBQWUsS0FBZixFQUFzQixVQUF0QixFQUFzQztBQUNyRCxNQUFJLE9BQU8sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFYO0FBQUEsTUFDSSxXQUFXLEVBQUUsVUFBUyxDQUFYLEVBRGY7O0FBR0EsTUFBSSxlQUFlLFNBQW5CLEVBQStCLE9BQU8sTUFBUCxDQUFlLFFBQWYsRUFBeUIsVUFBekI7O0FBRS9CLFNBQU8sTUFBUCxDQUFlLElBQWYsRUFBcUI7QUFDbkIsY0FEbUI7QUFFbkIsY0FBWSxLQUFLLElBRkU7QUFHbkIsZ0JBQVksS0FBSyxNQUFMLENBQVksTUFITDtBQUluQixTQUFZLEtBQUksTUFBSixFQUpPO0FBS25CLFlBQVksQ0FBRSxLQUFGLEVBQVMsS0FBVDtBQUxPLEdBQXJCLEVBT0EsUUFQQTs7QUFVQSxPQUFLLElBQUwsR0FBWSxLQUFLLFFBQUwsR0FBZ0IsS0FBSyxHQUFqQzs7QUFFQSxPQUFJLFNBQUosQ0FBYyxHQUFkLENBQW1CLEtBQUssSUFBeEIsRUFBOEIsSUFBOUI7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FyQkQ7OztBQy9CQTs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxLQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxLQUFzQixNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQTFCLEVBQStDO0FBQzdDLFdBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsRUFBRSxPQUFPLEtBQUssR0FBZCxFQUFqQjs7QUFFQSwwQkFBa0IsT0FBTyxDQUFQLENBQWxCLFVBQWdDLE9BQU8sQ0FBUCxDQUFoQztBQUVELEtBTEQsTUFLTztBQUNMLFVBQUksT0FBTyxPQUFPLENBQVAsQ0FBUCxLQUFxQixRQUFyQixJQUFpQyxPQUFPLENBQVAsRUFBVSxDQUFWLE1BQWlCLEdBQXRELEVBQTREO0FBQzFELGVBQU8sQ0FBUCxJQUFZLE9BQU8sQ0FBUCxFQUFVLEtBQVYsQ0FBZ0IsQ0FBaEIsRUFBa0IsQ0FBQyxDQUFuQixDQUFaO0FBQ0Q7QUFDRCxVQUFJLE9BQU8sT0FBTyxDQUFQLENBQVAsS0FBcUIsUUFBckIsSUFBaUMsT0FBTyxDQUFQLEVBQVUsQ0FBVixNQUFpQixHQUF0RCxFQUE0RDtBQUMxRCxlQUFPLENBQVAsSUFBWSxPQUFPLENBQVAsRUFBVSxLQUFWLENBQWdCLENBQWhCLEVBQWtCLENBQUMsQ0FBbkIsQ0FBWjtBQUNEOztBQUVELFlBQU0sS0FBSyxHQUFMLENBQVUsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFWLEVBQW1DLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBbkMsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBeEJTLENBQVo7O0FBMkJBLE9BQU8sT0FBUCxHQUFpQixVQUFDLENBQUQsRUFBRyxDQUFILEVBQVM7QUFDeEIsTUFBSSxNQUFNLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBVjs7QUFFQSxNQUFJLE1BQUosR0FBYSxDQUFFLENBQUYsRUFBSSxDQUFKLENBQWI7QUFDQSxNQUFJLEVBQUosR0FBUyxLQUFJLE1BQUosRUFBVDtBQUNBLE1BQUksSUFBSixHQUFjLElBQUksUUFBbEI7O0FBRUEsU0FBTyxHQUFQO0FBQ0QsQ0FSRDs7O0FDL0JBOzs7O0FBRUEsSUFBSSxPQUFVLFFBQVMsVUFBVCxDQUFkO0FBQUEsSUFDSSxVQUFVLFFBQVMsY0FBVCxDQURkO0FBQUEsSUFFSSxNQUFVLFFBQVMsVUFBVCxDQUZkO0FBQUEsSUFHSSxNQUFVLFFBQVMsVUFBVCxDQUhkO0FBQUEsSUFJSSxNQUFVLFFBQVMsVUFBVCxDQUpkO0FBQUEsSUFLSSxPQUFVLFFBQVMsV0FBVCxDQUxkO0FBQUEsSUFNSSxRQUFVLFFBQVMsWUFBVCxDQU5kO0FBQUEsSUFPSSxPQUFVLFFBQVMsV0FBVCxDQVBkOztBQVNBLElBQUksUUFBUTtBQUNWLFlBQVMsTUFEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBYjtBQUFBLFFBQ0ksUUFBUyxTQURiO0FBQUEsUUFFSSxXQUFXLFNBRmY7QUFBQSxRQUdJLFVBQVUsU0FBUyxLQUFLLElBSDVCO0FBQUEsUUFJSSxlQUpKO0FBQUEsUUFJWSxZQUpaO0FBQUEsUUFJaUIsWUFKakI7O0FBTUEsU0FBSSxRQUFKLENBQWEsR0FBYixxQkFBcUIsS0FBSyxJQUExQixFQUFrQyxJQUFsQzs7QUFFQSxvQkFDSSxLQUFLLElBRFQsZ0JBQ3dCLE9BQU8sQ0FBUCxDQUR4QixXQUN1QyxPQUR2QywyQkFFSSxLQUFLLElBRlQsc0JBRThCLEtBQUssSUFGbkMsc0JBR0EsT0FIQSxrQkFHb0IsS0FBSyxJQUh6QixnQkFHd0MsT0FBTyxDQUFQLENBSHhDLGdCQUlJLE9BSkoscUJBSTJCLE9BSjNCLHVCQUtBLE9BTEEsc0JBS3dCLE9BQU8sQ0FBUCxDQUx4QjtBQU9BLFVBQU0sTUFBTSxHQUFaOztBQUVBLFdBQU8sQ0FBRSxVQUFVLFFBQVosRUFBc0IsR0FBdEIsQ0FBUDtBQUNEO0FBdEJTLENBQVo7O0FBeUJBLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBTyxJQUFQLEVBQWlCO0FBQ2hDLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7O0FBRUEsU0FBTyxNQUFQLENBQWUsSUFBZixFQUFxQjtBQUNuQixXQUFZLENBRE87QUFFbkIsZ0JBQVksQ0FGTztBQUduQixTQUFZLEtBQUksTUFBSixFQUhPO0FBSW5CLFlBQVksQ0FBRSxHQUFGLEVBQU8sSUFBUDtBQUpPLEdBQXJCOztBQU9BLE9BQUssSUFBTCxRQUFlLEtBQUssUUFBcEIsR0FBK0IsS0FBSyxHQUFwQzs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQWJEOzs7QUNwQ0E7Ozs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsUUFBSyxPQURLOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQUssSUFBMUIsRUFBa0MsS0FBSyxLQUF2Qzs7QUFFQSw0QkFBb0IsT0FBTyxDQUFQLENBQXBCO0FBRUQsS0FMRCxNQUtPO0FBQ0wsWUFBTSxLQUFLLEtBQUwsQ0FBWSxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVosQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBakJTLENBQVo7O0FBb0JBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksUUFBUSxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVo7O0FBRUEsUUFBTSxNQUFOLEdBQWUsQ0FBRSxDQUFGLENBQWY7O0FBRUEsU0FBTyxLQUFQO0FBQ0QsQ0FORDs7O0FDeEJBOztBQUVBLElBQUksT0FBVSxRQUFTLFVBQVQsQ0FBZDs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLEtBREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBQWI7QUFBQSxRQUFvQyxZQUFwQzs7QUFFQTtBQUNBOztBQUVBLFNBQUksYUFBSixDQUFtQixLQUFLLE1BQXhCOztBQUdBLG9CQUNJLEtBQUssSUFEVCwwQkFDa0MsS0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixHQUR0RCxrQkFFSSxLQUFLLElBRlQsbUJBRTJCLE9BQU8sQ0FBUCxDQUYzQixXQUUwQyxPQUFPLENBQVAsQ0FGMUMsMEJBSUksS0FBSyxJQUpULHFCQUk2QixLQUFLLElBSmxDLCtCQUtNLEtBQUssSUFMWCx3Q0FNVyxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBTjdCLFlBTXVDLE9BQU8sQ0FBUCxDQU52QywyQkFRUyxLQUFLLE1BQUwsQ0FBWSxPQUFaLENBQW9CLEdBUjdCLFlBUXVDLEtBQUssSUFSNUM7O0FBWUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLGtCQUFvQyxLQUFLLElBQXpDOztBQUVBLFdBQU8sYUFBWSxLQUFLLE1BQUwsQ0FBWSxLQUFaLENBQWtCLEdBQTlCLFFBQXNDLE1BQUssR0FBM0MsQ0FBUDtBQUNEO0FBM0JTLENBQVo7O0FBOEJBLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBTyxPQUFQLEVBQTZDO0FBQUEsTUFBN0IsU0FBNkIsdUVBQW5CLENBQW1CO0FBQUEsTUFBaEIsVUFBZ0I7O0FBQzVELE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7QUFBQSxNQUNJLFdBQVcsRUFBRSxNQUFLLENBQVAsRUFEZjs7QUFHQSxNQUFJLGVBQWUsU0FBbkIsRUFBK0IsT0FBTyxNQUFQLENBQWUsUUFBZixFQUF5QixVQUF6Qjs7QUFFL0IsU0FBTyxNQUFQLENBQWUsSUFBZixFQUFxQjtBQUNuQixnQkFBWSxDQURPO0FBRW5CLFNBQVksS0FBSSxNQUFKLEVBRk87QUFHbkIsWUFBWSxDQUFFLEdBQUYsRUFBTyxPQUFQLEVBQWUsU0FBZixDQUhPO0FBSW5CLFlBQVE7QUFDTixlQUFTLEVBQUUsS0FBSSxJQUFOLEVBQVksUUFBTyxDQUFuQixFQURIO0FBRU4sYUFBUyxFQUFFLEtBQUksSUFBTixFQUFZLFFBQU8sQ0FBbkI7QUFGSDtBQUpXLEdBQXJCLEVBU0EsUUFUQTs7QUFXQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUssR0FBcEM7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FwQkQ7OztBQ2xDQTs7QUFFQSxJQUFJLE9BQU0sUUFBUyxVQUFULENBQVY7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxVQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiO0FBQUEsUUFBb0MsWUFBcEM7QUFBQSxRQUF5QyxjQUFjLENBQXZEOztBQUVBLFlBQVEsT0FBTyxNQUFmO0FBQ0UsV0FBSyxDQUFMO0FBQ0Usc0JBQWMsT0FBTyxDQUFQLENBQWQ7QUFDQTtBQUNGLFdBQUssQ0FBTDtBQUNFLHlCQUFlLEtBQUssSUFBcEIsZUFBa0MsT0FBTyxDQUFQLENBQWxDLGlCQUF1RCxPQUFPLENBQVAsQ0FBdkQsV0FBc0UsT0FBTyxDQUFQLENBQXRFO0FBQ0Esc0JBQWMsQ0FBRSxLQUFLLElBQUwsR0FBWSxNQUFkLEVBQXNCLEdBQXRCLENBQWQ7QUFDQTtBQUNGO0FBQ0Usd0JBQ0EsS0FBSyxJQURMLDRCQUVJLE9BQU8sQ0FBUCxDQUZKOztBQUlBLGFBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxPQUFPLE1BQTNCLEVBQW1DLEdBQW5DLEVBQXdDO0FBQ3RDLCtCQUFrQixDQUFsQixVQUF3QixLQUFLLElBQTdCLGVBQTJDLE9BQU8sQ0FBUCxDQUEzQztBQUNEOztBQUVELGVBQU8sU0FBUDs7QUFFQSxzQkFBYyxDQUFFLEtBQUssSUFBTCxHQUFZLE1BQWQsRUFBc0IsTUFBTSxHQUE1QixDQUFkO0FBbkJKOztBQXNCQSxTQUFJLElBQUosQ0FBVSxLQUFLLElBQWYsSUFBd0IsS0FBSyxJQUFMLEdBQVksTUFBcEM7O0FBRUEsV0FBTyxXQUFQO0FBQ0Q7QUEvQlMsQ0FBWjs7QUFrQ0EsT0FBTyxPQUFQLEdBQWlCLFlBQWlCO0FBQUEsb0NBQVosTUFBWTtBQUFaLFVBQVk7QUFBQTs7QUFDaEMsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFNBQVMsS0FBSSxNQUFKLEVBRFU7QUFFbkI7QUFGbUIsR0FBckI7O0FBS0EsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFwQixHQUErQixLQUFLLEdBQXBDOztBQUVBLFNBQU8sSUFBUDtBQUNELENBWEQ7OztBQ3RDQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixRQUFLLE1BREs7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7O0FBR0EsUUFBSSxNQUFPLE9BQU8sQ0FBUCxDQUFQLENBQUosRUFBeUI7QUFDdkIsV0FBSSxRQUFKLENBQWEsR0FBYixxQkFBcUIsS0FBSyxJQUExQixFQUFrQyxLQUFLLElBQXZDOztBQUVBLDJCQUFtQixPQUFPLENBQVAsQ0FBbkI7QUFFRCxLQUxELE1BS087QUFDTCxZQUFNLEtBQUssSUFBTCxDQUFXLFdBQVksT0FBTyxDQUFQLENBQVosQ0FBWCxDQUFOO0FBQ0Q7O0FBRUQsV0FBTyxHQUFQO0FBQ0Q7QUFqQlMsQ0FBWjs7QUFvQkEsT0FBTyxPQUFQLEdBQWlCLGFBQUs7QUFDcEIsTUFBSSxPQUFPLE9BQU8sTUFBUCxDQUFlLEtBQWYsQ0FBWDs7QUFFQSxPQUFLLE1BQUwsR0FBYyxDQUFFLENBQUYsQ0FBZDs7QUFFQSxTQUFPLElBQVA7QUFDRCxDQU5EOzs7QUN4QkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsS0FEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2QixXQUFJLFFBQUosQ0FBYSxHQUFiLENBQWlCLEVBQUUsT0FBTyxLQUFLLEdBQWQsRUFBakI7O0FBRUEsMEJBQWtCLE9BQU8sQ0FBUCxDQUFsQjtBQUVELEtBTEQsTUFLTztBQUNMLFlBQU0sS0FBSyxHQUFMLENBQVUsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFWLENBQU47QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQWpCUyxDQUFaOztBQW9CQSxPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFWOztBQUVBLE1BQUksTUFBSixHQUFhLENBQUUsQ0FBRixDQUFiO0FBQ0EsTUFBSSxFQUFKLEdBQVMsS0FBSSxNQUFKLEVBQVQ7QUFDQSxNQUFJLElBQUosR0FBYyxJQUFJLFFBQWxCOztBQUVBLFNBQU8sR0FBUDtBQUNELENBUkQ7OztBQ3hCQTs7QUFFQSxJQUFJLE1BQVUsUUFBUyxVQUFULENBQWQ7QUFBQSxJQUNJLFVBQVUsUUFBUyxjQUFULENBRGQ7QUFBQSxJQUVJLE1BQVUsUUFBUyxVQUFULENBRmQ7QUFBQSxJQUdJLE1BQVUsUUFBUyxVQUFULENBSGQ7QUFBQSxJQUlJLE1BQVUsUUFBUyxVQUFULENBSmQ7QUFBQSxJQUtJLE9BQVUsUUFBUyxXQUFULENBTGQ7QUFBQSxJQU1JLEtBQVUsUUFBUyxTQUFULENBTmQ7QUFBQSxJQU9JLE1BQVUsUUFBUyxVQUFULENBUGQ7QUFBQSxJQVFJLFVBQVUsUUFBUyxhQUFULENBUmQ7O0FBVUEsT0FBTyxPQUFQLEdBQWlCLFVBQUUsR0FBRixFQUF1QztBQUFBLFFBQWhDLE9BQWdDLHVFQUF0QixDQUFzQjtBQUFBLFFBQW5CLFNBQW1CLHVFQUFQLENBQU87O0FBQ3RELFFBQUksS0FBSyxRQUFRLENBQVIsQ0FBVDtBQUFBLFFBQ0ksZUFESjtBQUFBLFFBQ1ksb0JBRFo7O0FBR0E7QUFDQSxrQkFBYyxRQUFTLEdBQUcsR0FBSCxFQUFPLEdBQUcsR0FBVixDQUFULEVBQXlCLE9BQXpCLEVBQWtDLFNBQWxDLENBQWQ7O0FBRUEsYUFBUyxLQUFNLElBQUssR0FBRyxHQUFSLEVBQWEsSUFBSyxJQUFLLEdBQUwsRUFBVSxHQUFHLEdBQWIsQ0FBTCxFQUF5QixXQUF6QixDQUFiLENBQU4sQ0FBVDs7QUFFQSxPQUFHLEVBQUgsQ0FBTyxNQUFQOztBQUVBLFdBQU8sTUFBUDtBQUNELENBWkQ7OztBQ1pBOztBQUVBLElBQU0sT0FBTSxRQUFRLFVBQVIsQ0FBWjs7QUFFQSxJQUFNLFFBQVE7QUFDWixZQUFTLEtBREc7QUFFWixLQUZZLGlCQUVOO0FBQ0osUUFBSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FBYjtBQUFBLFFBQ0ksTUFBSSxDQURSO0FBQUEsUUFFSSxPQUFPLENBRlg7QUFBQSxRQUdJLGNBQWMsS0FIbEI7QUFBQSxRQUlJLFdBQVcsQ0FKZjtBQUFBLFFBS0ksYUFBYSxPQUFRLENBQVIsQ0FMakI7QUFBQSxRQU1JLG1CQUFtQixNQUFPLFVBQVAsQ0FOdkI7QUFBQSxRQU9JLFdBQVcsS0FQZjtBQUFBLFFBUUksV0FBVyxLQVJmO0FBQUEsUUFTSSxjQUFjLENBVGxCOztBQVdBLFNBQUssTUFBTCxDQUFZLE9BQVosQ0FBcUIsaUJBQVM7QUFBRSxVQUFJLE1BQU8sS0FBUCxDQUFKLEVBQXFCLFdBQVcsSUFBWDtBQUFpQixLQUF0RTs7QUFFQSxVQUFNLFdBQVcsS0FBSyxJQUFoQixHQUF1QixLQUE3Qjs7QUFFQSxXQUFPLE9BQVAsQ0FBZ0IsVUFBQyxDQUFELEVBQUcsQ0FBSCxFQUFTO0FBQ3ZCLFVBQUksTUFBTSxDQUFWLEVBQWM7O0FBRWQsVUFBSSxlQUFlLE1BQU8sQ0FBUCxDQUFuQjtBQUFBLFVBQ0ksYUFBZSxNQUFNLE9BQU8sTUFBUCxHQUFnQixDQUR6Qzs7QUFHQSxVQUFJLENBQUMsZ0JBQUQsSUFBcUIsQ0FBQyxZQUExQixFQUF5QztBQUN2QyxxQkFBYSxhQUFhLENBQTFCO0FBQ0EsZUFBTyxVQUFQO0FBQ0E7QUFDRCxPQUpELE1BSUs7QUFDSCxzQkFBYyxJQUFkO0FBQ0EsZUFBVSxVQUFWLFdBQTBCLENBQTFCO0FBQ0Q7O0FBRUQsVUFBSSxDQUFDLFVBQUwsRUFBa0IsT0FBTyxLQUFQO0FBQ25CLEtBaEJEOztBQWtCQSxXQUFPLElBQVA7O0FBRUEsa0JBQWMsQ0FBRSxLQUFLLElBQVAsRUFBYSxHQUFiLENBQWQ7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQXdCLEtBQUssSUFBN0I7O0FBRUEsV0FBTyxXQUFQO0FBQ0Q7QUEzQ1csQ0FBZDs7QUErQ0EsT0FBTyxPQUFQLEdBQWlCLFlBQWU7QUFBQSxvQ0FBVixJQUFVO0FBQVYsUUFBVTtBQUFBOztBQUM5QixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFWOztBQUVBLFNBQU8sTUFBUCxDQUFlLEdBQWYsRUFBb0I7QUFDbEIsUUFBUSxLQUFJLE1BQUosRUFEVTtBQUVsQixZQUFRO0FBRlUsR0FBcEI7O0FBS0EsTUFBSSxJQUFKLEdBQVcsUUFBUSxJQUFJLEVBQXZCOztBQUVBLFNBQU8sR0FBUDtBQUNELENBWEQ7OztBQ25EQTs7QUFFQSxJQUFJLE9BQU0sUUFBUyxVQUFULENBQVY7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxRQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQUFiO0FBQUEsUUFBb0MsWUFBcEM7O0FBRUEsUUFBSSxPQUFPLENBQVAsTUFBYyxPQUFPLENBQVAsQ0FBbEIsRUFBOEIsT0FBTyxPQUFPLENBQVAsQ0FBUCxDQUgxQixDQUcyQzs7QUFFL0MscUJBQWUsS0FBSyxJQUFwQixlQUFrQyxPQUFPLENBQVAsQ0FBbEMsaUJBQXVELE9BQU8sQ0FBUCxDQUF2RCxXQUFzRSxPQUFPLENBQVAsQ0FBdEU7O0FBRUEsU0FBSSxJQUFKLENBQVUsS0FBSyxJQUFmLElBQTJCLEtBQUssSUFBaEM7O0FBRUEsV0FBTyxDQUFLLEtBQUssSUFBVixXQUFzQixHQUF0QixDQUFQO0FBQ0Q7QUFiUyxDQUFaOztBQWlCQSxPQUFPLE9BQVAsR0FBaUIsVUFBRSxPQUFGLEVBQWlDO0FBQUEsTUFBdEIsR0FBc0IsdUVBQWhCLENBQWdCO0FBQUEsTUFBYixHQUFhLHVFQUFQLENBQU87O0FBQ2hELE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7QUFDQSxTQUFPLE1BQVAsQ0FBZSxJQUFmLEVBQXFCO0FBQ25CLFNBQVMsS0FBSSxNQUFKLEVBRFU7QUFFbkIsWUFBUyxDQUFFLE9BQUYsRUFBVyxHQUFYLEVBQWdCLEdBQWhCO0FBRlUsR0FBckI7O0FBS0EsT0FBSyxJQUFMLFFBQWUsS0FBSyxRQUFwQixHQUErQixLQUFLLEdBQXBDOztBQUVBLFNBQU8sSUFBUDtBQUNELENBVkQ7OztBQ3JCQTs7OztBQUVBLElBQUksT0FBTyxRQUFRLFVBQVIsQ0FBWDs7QUFFQSxJQUFJLFFBQVE7QUFDVixZQUFTLEtBREM7O0FBR1YsS0FIVSxpQkFHSjtBQUNKLFFBQUksWUFBSjtBQUFBLFFBQ0ksU0FBUyxLQUFJLFNBQUosQ0FBZSxJQUFmLENBRGI7QUFBQSxRQUVJLG9CQUZKOztBQUlBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIscUJBQXFCLEtBQXJCLEVBQThCLEtBQUssR0FBbkM7O0FBRUEsdUJBQWUsS0FBSyxJQUFwQixzQ0FBeUQsT0FBTyxDQUFQLENBQXpEOztBQUVBLFdBQUksSUFBSixDQUFVLEtBQUssSUFBZixJQUF3QixHQUF4Qjs7QUFFQSxvQkFBYyxDQUFFLEtBQUssSUFBUCxFQUFhLEdBQWIsQ0FBZDtBQUNELEtBUkQsTUFRTztBQUNMLFlBQU0sS0FBSyxHQUFMLENBQVUsQ0FBQyxjQUFELEdBQWtCLE9BQU8sQ0FBUCxDQUE1QixDQUFOOztBQUVBLG9CQUFjLEdBQWQ7QUFDRDs7QUFFRCxXQUFPLFdBQVA7QUFDRDtBQXZCUyxDQUFaOztBQTBCQSxPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFWOztBQUVBLE1BQUksTUFBSixHQUFhLENBQUUsQ0FBRixDQUFiO0FBQ0EsTUFBSSxJQUFKLEdBQVcsTUFBTSxRQUFOLEdBQWlCLEtBQUksTUFBSixFQUE1Qjs7QUFFQSxTQUFPLEdBQVA7QUFDRCxDQVBEOzs7QUM5QkE7O0FBRUEsSUFBSSxPQUFPLFFBQVEsVUFBUixDQUFYOztBQUVBLElBQUksUUFBUTtBQUNWLFlBQVMsS0FEQzs7QUFHVixLQUhVLGlCQUdKO0FBQ0osUUFBSSxZQUFKO0FBQUEsUUFDSSxTQUFTLEtBQUksU0FBSixDQUFlLElBQWYsQ0FEYjs7QUFHQSxRQUFJLE1BQU8sT0FBTyxDQUFQLENBQVAsQ0FBSixFQUF5QjtBQUN2QixXQUFJLFFBQUosQ0FBYSxHQUFiLENBQWlCLEVBQUUsT0FBTyxLQUFLLEdBQWQsRUFBakI7O0FBRUEsMEJBQWtCLE9BQU8sQ0FBUCxDQUFsQjtBQUVELEtBTEQsTUFLTztBQUNMLFlBQU0sS0FBSyxHQUFMLENBQVUsV0FBWSxPQUFPLENBQVAsQ0FBWixDQUFWLENBQU47QUFDRDs7QUFFRCxXQUFPLEdBQVA7QUFDRDtBQWpCUyxDQUFaOztBQW9CQSxPQUFPLE9BQVAsR0FBaUIsYUFBSztBQUNwQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWUsS0FBZixDQUFWOztBQUVBLE1BQUksTUFBSixHQUFhLENBQUUsQ0FBRixDQUFiO0FBQ0EsTUFBSSxFQUFKLEdBQVMsS0FBSSxNQUFKLEVBQVQ7QUFDQSxNQUFJLElBQUosR0FBYyxJQUFJLFFBQWxCOztBQUVBLFNBQU8sR0FBUDtBQUNELENBUkQ7OztBQ3hCQTs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7O0FBRUEsSUFBSSxRQUFRO0FBQ1YsWUFBUyxNQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLFlBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiOztBQUdBLFFBQUksTUFBTyxPQUFPLENBQVAsQ0FBUCxDQUFKLEVBQXlCO0FBQ3ZCLFdBQUksUUFBSixDQUFhLEdBQWIsQ0FBaUIsRUFBRSxRQUFRLEtBQUssSUFBZixFQUFqQjs7QUFFQSwyQkFBbUIsT0FBTyxDQUFQLENBQW5CO0FBRUQsS0FMRCxNQUtPO0FBQ0wsWUFBTSxLQUFLLElBQUwsQ0FBVyxXQUFZLE9BQU8sQ0FBUCxDQUFaLENBQVgsQ0FBTjtBQUNEOztBQUVELFdBQU8sR0FBUDtBQUNEO0FBakJTLENBQVo7O0FBb0JBLE9BQU8sT0FBUCxHQUFpQixhQUFLO0FBQ3BCLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7O0FBRUEsT0FBSyxNQUFMLEdBQWMsQ0FBRSxDQUFGLENBQWQ7QUFDQSxPQUFLLEVBQUwsR0FBVSxLQUFJLE1BQUosRUFBVjtBQUNBLE9BQUssSUFBTCxHQUFlLEtBQUssUUFBcEI7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FSRDs7O0FDeEJBOztBQUVBLElBQUksTUFBVSxRQUFTLFVBQVQsQ0FBZDtBQUFBLElBQ0ksS0FBVSxRQUFTLFNBQVQsQ0FEZDtBQUFBLElBRUksUUFBVSxRQUFTLFlBQVQsQ0FGZDtBQUFBLElBR0ksTUFBVSxRQUFTLFVBQVQsQ0FIZDs7QUFLQSxPQUFPLE9BQVAsR0FBaUIsWUFBb0M7QUFBQSxNQUFsQyxTQUFrQyx1RUFBeEIsR0FBd0I7QUFBQSxNQUFuQixVQUFtQix1RUFBUixFQUFROztBQUNuRCxNQUFJLFFBQVEsR0FBSSxNQUFPLElBQUssU0FBTCxFQUFnQixLQUFoQixDQUFQLENBQUosRUFBc0MsVUFBdEMsQ0FBWjs7QUFFQSxRQUFNLElBQU4sYUFBcUIsSUFBSSxNQUFKLEVBQXJCOztBQUVBLFNBQU8sS0FBUDtBQUNELENBTkQ7OztBQ1BBOztBQUVBLElBQUksTUFBTSxRQUFTLFVBQVQsQ0FBVjtBQUFBLElBQ0ksT0FBTyxRQUFTLFdBQVQsQ0FEWDs7QUFHQSxJQUFJLFdBQVcsS0FBZjs7QUFFQSxJQUFJLFlBQVk7QUFDZCxPQUFLLElBRFM7O0FBR2QsT0FIYyxtQkFHTjtBQUNOLFNBQUssUUFBTCxHQUFnQjtBQUFBLGFBQU0sQ0FBTjtBQUFBLEtBQWhCO0FBQ0EsU0FBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixPQUFyQixDQUE4QjtBQUFBLGFBQUssR0FBTDtBQUFBLEtBQTlCO0FBQ0EsU0FBSyxLQUFMLENBQVcsU0FBWCxDQUFxQixNQUFyQixHQUE4QixDQUE5QjtBQUNELEdBUGE7QUFTZCxlQVRjLDJCQVNFO0FBQ2QsUUFBSSxLQUFLLE9BQU8sWUFBUCxLQUF3QixXQUF4QixHQUFzQyxrQkFBdEMsR0FBMkQsWUFBcEU7QUFDQSxTQUFLLEdBQUwsR0FBVyxJQUFJLEVBQUosRUFBWDs7QUFFQSxRQUFJLFVBQUosR0FBaUIsS0FBSyxHQUFMLENBQVMsVUFBMUI7O0FBRUEsUUFBSSxRQUFRLFNBQVIsS0FBUSxHQUFNO0FBQ2hCLFVBQUksT0FBTyxFQUFQLEtBQWMsV0FBbEIsRUFBZ0M7QUFDOUIsWUFBSSxZQUFZLFNBQVMsZUFBckIsSUFBd0Msa0JBQWtCLFNBQVMsZUFBdkUsRUFBeUY7QUFDdkYsaUJBQU8sbUJBQVAsQ0FBNEIsWUFBNUIsRUFBMEMsS0FBMUM7O0FBRUEsY0FBSSxrQkFBa0IsU0FBUyxlQUEvQixFQUFpRDtBQUFFO0FBQ2hELGdCQUFJLFdBQVcsVUFBVSxHQUFWLENBQWMsa0JBQWQsRUFBZjtBQUNBLHFCQUFTLE9BQVQsQ0FBa0IsVUFBVSxHQUFWLENBQWMsV0FBaEM7QUFDQSxxQkFBUyxNQUFULENBQWlCLENBQWpCO0FBQ0Q7QUFDRjtBQUNIO0FBQ0YsS0FaRDs7QUFjQSxRQUFJLFlBQVksU0FBUyxlQUFyQixJQUF3QyxrQkFBa0IsU0FBUyxlQUF2RSxFQUF5RjtBQUN2RixhQUFPLGdCQUFQLENBQXlCLFlBQXpCLEVBQXVDLEtBQXZDO0FBQ0Q7O0FBRUQsV0FBTyxJQUFQO0FBQ0QsR0FsQ2E7QUFvQ2QsdUJBcENjLG1DQW9DVTtBQUN0QixTQUFLLElBQUwsR0FBWSxLQUFLLEdBQUwsQ0FBUyxxQkFBVCxDQUFnQyxJQUFoQyxFQUFzQyxDQUF0QyxFQUF5QyxDQUF6QyxDQUFaO0FBQ0EsU0FBSyxhQUFMLEdBQXFCLFlBQVc7QUFBRSxhQUFPLENBQVA7QUFBVSxLQUE1QztBQUNBLFFBQUksT0FBTyxLQUFLLFFBQVosS0FBeUIsV0FBN0IsRUFBMkMsS0FBSyxRQUFMLEdBQWdCLEtBQUssYUFBckI7O0FBRTNDLFNBQUssSUFBTCxDQUFVLGNBQVYsR0FBMkIsVUFBVSxvQkFBVixFQUFpQztBQUMxRCxVQUFJLGVBQWUscUJBQXFCLFlBQXhDOztBQUVBLFVBQUksT0FBTyxhQUFhLGNBQWIsQ0FBNkIsQ0FBN0IsQ0FBWDtBQUFBLFVBQ0ksUUFBTyxhQUFhLGNBQWIsQ0FBNkIsQ0FBN0IsQ0FEWDtBQUFBLFVBRUksV0FBVyxVQUFVLFFBRnpCOztBQUlELFdBQUssSUFBSSxTQUFTLENBQWxCLEVBQXFCLFNBQVMsS0FBSyxNQUFuQyxFQUEyQyxRQUEzQyxFQUFzRDtBQUNuRCxZQUFJLE1BQU0sVUFBVSxRQUFWLEVBQVY7O0FBRUEsWUFBSSxhQUFhLEtBQWpCLEVBQXlCO0FBQ3ZCLGVBQU0sTUFBTixJQUFpQixNQUFPLE1BQVAsSUFBa0IsR0FBbkM7QUFDRCxTQUZELE1BRUs7QUFDSCxlQUFNLE1BQU4sSUFBa0IsSUFBSSxDQUFKLENBQWxCO0FBQ0EsZ0JBQU8sTUFBUCxJQUFrQixJQUFJLENBQUosQ0FBbEI7QUFDRDtBQUNGO0FBQ0YsS0FqQkQ7O0FBbUJBLFNBQUssSUFBTCxDQUFVLE9BQVYsQ0FBbUIsS0FBSyxHQUFMLENBQVMsV0FBNUI7O0FBRUEsV0FBTyxJQUFQO0FBQ0QsR0EvRGE7QUFpRWQsV0FqRWMscUJBaUVILEtBakVHLEVBaUVJLEtBakVKLEVBaUVnRDtBQUFBLFFBQXJDLEdBQXFDLHVFQUFqQyxRQUFNLEVBQTJCO0FBQUEsUUFBdkIsT0FBdUIsdUVBQWYsWUFBZTs7QUFDNUQsY0FBVSxLQUFWO0FBQ0EsUUFBSSxVQUFVLFNBQWQsRUFBMEIsUUFBUSxLQUFSOztBQUUxQixTQUFLLFFBQUwsR0FBZ0IsTUFBTSxPQUFOLENBQWUsS0FBZixDQUFoQjs7QUFFQSxjQUFVLFFBQVYsR0FBcUIsSUFBSSxjQUFKLENBQW9CLEtBQXBCLEVBQTJCLEdBQTNCLEVBQWdDLEtBQWhDLEVBQXVDLEtBQXZDLEVBQThDLE9BQTlDLENBQXJCOztBQUVBLFFBQUksVUFBVSxPQUFkLEVBQXdCLFVBQVUsT0FBVixDQUFrQixRQUFsQixDQUE0QixVQUFVLFFBQVYsQ0FBbUIsUUFBbkIsRUFBNUI7O0FBRXhCLFdBQU8sVUFBVSxRQUFqQjtBQUNELEdBNUVhO0FBOEVkLFlBOUVjLHNCQThFRixhQTlFRSxFQThFYSxJQTlFYixFQThFb0I7QUFDaEMsUUFBSSxNQUFNLElBQUksY0FBSixFQUFWO0FBQ0EsUUFBSSxJQUFKLENBQVUsS0FBVixFQUFpQixhQUFqQixFQUFnQyxJQUFoQztBQUNBLFFBQUksWUFBSixHQUFtQixhQUFuQjs7QUFFQSxRQUFJLFVBQVUsSUFBSSxPQUFKLENBQWEsVUFBQyxPQUFELEVBQVMsTUFBVCxFQUFvQjtBQUM3QyxVQUFJLE1BQUosR0FBYSxZQUFXO0FBQ3RCLFlBQUksWUFBWSxJQUFJLFFBQXBCOztBQUVBLGtCQUFVLEdBQVYsQ0FBYyxlQUFkLENBQStCLFNBQS9CLEVBQTBDLFVBQUMsTUFBRCxFQUFZO0FBQ3BELGVBQUssTUFBTCxHQUFjLE9BQU8sY0FBUCxDQUFzQixDQUF0QixDQUFkO0FBQ0Esa0JBQVMsS0FBSyxNQUFkO0FBQ0QsU0FIRDtBQUlELE9BUEQ7QUFRRCxLQVRhLENBQWQ7O0FBV0EsUUFBSSxJQUFKOztBQUVBLFdBQU8sT0FBUDtBQUNEO0FBakdhLENBQWhCOztBQXFHQSxVQUFVLEtBQVYsQ0FBZ0IsU0FBaEIsR0FBNEIsRUFBNUI7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQWpCOzs7QUM5R0E7O0FBRUE7Ozs7OztBQU1BLElBQU0sVUFBVSxPQUFPLE9BQVAsR0FBaUI7QUFDL0IsVUFEK0Isb0JBQ3JCLE1BRHFCLEVBQ2IsS0FEYSxFQUNMO0FBQ3hCLFdBQU8sS0FBSyxTQUFTLENBQWQsS0FBb0IsQ0FBQyxTQUFTLENBQVYsSUFBZSxDQUFmLEdBQW1CLEtBQUssR0FBTCxDQUFTLFFBQVEsQ0FBQyxTQUFTLENBQVYsSUFBZSxDQUFoQyxDQUF2QyxDQUFQO0FBQ0QsR0FIOEI7QUFLL0IsY0FMK0Isd0JBS2pCLE1BTGlCLEVBS1QsS0FMUyxFQUtEO0FBQzVCLFdBQU8sT0FBTyxPQUFPLEtBQUssR0FBTCxDQUFTLFNBQVMsU0FBUyxDQUFsQixJQUF1QixHQUFoQyxDQUFkLEdBQXFELE9BQU8sS0FBSyxHQUFMLENBQVUsSUFBSSxLQUFLLEVBQVQsR0FBYyxLQUFkLElBQXVCLFNBQVMsQ0FBaEMsQ0FBVixDQUFuRTtBQUNELEdBUDhCO0FBUy9CLFVBVCtCLG9CQVNyQixNQVRxQixFQVNiLEtBVGEsRUFTTixLQVRNLEVBU0U7QUFDL0IsUUFBSSxLQUFLLENBQUMsSUFBSSxLQUFMLElBQWMsQ0FBdkI7QUFBQSxRQUNJLEtBQUssR0FEVDtBQUFBLFFBRUksS0FBSyxRQUFRLENBRmpCOztBQUlBLFdBQU8sS0FBSyxLQUFLLEtBQUssR0FBTCxDQUFTLElBQUksS0FBSyxFQUFULEdBQWMsS0FBZCxJQUF1QixTQUFTLENBQWhDLENBQVQsQ0FBVixHQUF5RCxLQUFLLEtBQUssR0FBTCxDQUFTLElBQUksS0FBSyxFQUFULEdBQWMsS0FBZCxJQUF1QixTQUFTLENBQWhDLENBQVQsQ0FBckU7QUFDRCxHQWY4QjtBQWlCL0IsUUFqQitCLGtCQWlCdkIsTUFqQnVCLEVBaUJmLEtBakJlLEVBaUJQO0FBQ3RCLFdBQU8sS0FBSyxHQUFMLENBQVMsS0FBSyxFQUFMLEdBQVUsS0FBVixJQUFtQixTQUFTLENBQTVCLElBQWlDLEtBQUssRUFBTCxHQUFVLENBQXBELENBQVA7QUFDRCxHQW5COEI7QUFxQi9CLE9BckIrQixpQkFxQnhCLE1BckJ3QixFQXFCaEIsS0FyQmdCLEVBcUJULEtBckJTLEVBcUJEO0FBQzVCLFdBQU8sS0FBSyxHQUFMLENBQVMsS0FBSyxDQUFkLEVBQWlCLENBQUMsR0FBRCxHQUFPLEtBQUssR0FBTCxDQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBVixJQUFlLENBQXhCLEtBQThCLFNBQVMsU0FBUyxDQUFsQixJQUF1QixDQUFyRCxDQUFULEVBQWtFLENBQWxFLENBQXhCLENBQVA7QUFDRCxHQXZCOEI7QUF5Qi9CLFNBekIrQixtQkF5QnRCLE1BekJzQixFQXlCZCxLQXpCYyxFQXlCTjtBQUN2QixXQUFPLE9BQU8sT0FBTyxLQUFLLEdBQUwsQ0FBVSxLQUFLLEVBQUwsR0FBVSxDQUFWLEdBQWMsS0FBZCxJQUF1QixTQUFTLENBQWhDLENBQVYsQ0FBckI7QUFDRCxHQTNCOEI7QUE2Qi9CLE1BN0IrQixnQkE2QnpCLE1BN0J5QixFQTZCakIsS0E3QmlCLEVBNkJUO0FBQ3BCLFdBQU8sT0FBTyxJQUFJLEtBQUssR0FBTCxDQUFVLEtBQUssRUFBTCxHQUFVLENBQVYsR0FBYyxLQUFkLElBQXVCLFNBQVMsQ0FBaEMsQ0FBVixDQUFYLENBQVA7QUFDRCxHQS9COEI7QUFpQy9CLFNBakMrQixtQkFpQ3RCLE1BakNzQixFQWlDZCxLQWpDYyxFQWlDTjtBQUN2QixRQUFJLElBQUksSUFBSSxLQUFKLElBQWEsU0FBUyxDQUF0QixJQUEyQixDQUFuQztBQUNBLFdBQU8sS0FBSyxHQUFMLENBQVMsS0FBSyxFQUFMLEdBQVUsQ0FBbkIsS0FBeUIsS0FBSyxFQUFMLEdBQVUsQ0FBbkMsQ0FBUDtBQUNELEdBcEM4QjtBQXNDL0IsYUF0QytCLHVCQXNDbEIsTUF0Q2tCLEVBc0NWLEtBdENVLEVBc0NGO0FBQzNCLFdBQU8sQ0FBUDtBQUNELEdBeEM4QjtBQTBDL0IsWUExQytCLHNCQTBDbkIsTUExQ21CLEVBMENYLEtBMUNXLEVBMENIO0FBQzFCLFdBQU8sSUFBSSxNQUFKLElBQWMsU0FBUyxDQUFULEdBQWEsS0FBSyxHQUFMLENBQVMsUUFBUSxDQUFDLFNBQVMsQ0FBVixJQUFlLENBQWhDLENBQTNCLENBQVA7QUFDRCxHQTVDOEI7OztBQThDL0I7QUFDQSxPQS9DK0IsaUJBK0N4QixNQS9Dd0IsRUErQ2hCLE1BL0NnQixFQStDUixNQS9DUSxFQStDVTtBQUFBLFFBQVYsS0FBVSx1RUFBSixDQUFJOztBQUN2QztBQUNBLFFBQU0sUUFBUSxVQUFVLENBQVYsR0FBYyxNQUFkLEdBQXVCLENBQUMsU0FBUyxLQUFLLEtBQUwsQ0FBWSxRQUFRLE1BQXBCLENBQVYsSUFBMEMsTUFBL0U7QUFDQSxRQUFNLFlBQVksQ0FBQyxTQUFTLENBQVYsSUFBZSxDQUFqQzs7QUFFQSxXQUFPLElBQUksS0FBSyxHQUFMLENBQVUsQ0FBRSxRQUFRLFNBQVYsSUFBd0IsU0FBbEMsRUFBNkMsQ0FBN0MsQ0FBWDtBQUNELEdBckQ4QjtBQXNEL0IsY0F0RCtCLHdCQXNEakIsTUF0RGlCLEVBc0RULE1BdERTLEVBc0RELE1BdERDLEVBc0RpQjtBQUFBLFFBQVYsS0FBVSx1RUFBSixDQUFJOztBQUM5QztBQUNBLFFBQUksUUFBUSxVQUFVLENBQVYsR0FBYyxNQUFkLEdBQXVCLENBQUMsU0FBUyxLQUFLLEtBQUwsQ0FBWSxRQUFRLE1BQXBCLENBQVYsSUFBMEMsTUFBN0U7QUFDQSxRQUFNLFlBQVksQ0FBQyxTQUFTLENBQVYsSUFBZSxDQUFqQzs7QUFFQSxXQUFPLEtBQUssR0FBTCxDQUFVLENBQUUsUUFBUSxTQUFWLElBQXdCLFNBQWxDLEVBQTZDLENBQTdDLENBQVA7QUFDRCxHQTVEOEI7QUE4RC9CLFVBOUQrQixvQkE4RHJCLE1BOURxQixFQThEYixLQTlEYSxFQThETDtBQUN4QixRQUFJLFNBQVMsU0FBUyxDQUF0QixFQUEwQjtBQUN4QixhQUFPLFFBQVEsWUFBUixDQUFzQixTQUFTLENBQS9CLEVBQWtDLEtBQWxDLElBQTRDLENBQW5EO0FBQ0QsS0FGRCxNQUVLO0FBQ0gsYUFBTyxJQUFJLFFBQVEsWUFBUixDQUFzQixTQUFTLENBQS9CLEVBQWtDLFFBQVEsU0FBUyxDQUFuRCxDQUFYO0FBQ0Q7QUFDRixHQXBFOEI7QUFzRS9CLGFBdEUrQix1QkFzRWxCLE1BdEVrQixFQXNFVixLQXRFVSxFQXNFSCxLQXRFRyxFQXNFSztBQUNsQyxXQUFPLEtBQUssR0FBTCxDQUFVLFFBQVEsTUFBbEIsRUFBMEIsS0FBMUIsQ0FBUDtBQUNELEdBeEU4QjtBQTBFL0IsUUExRStCLGtCQTBFdkIsTUExRXVCLEVBMEVmLEtBMUVlLEVBMEVQO0FBQ3RCLFdBQU8sUUFBUSxNQUFmO0FBQ0Q7QUE1RThCLENBQWpDOzs7QUNSQTs7QUFFQSxJQUFJLE9BQU8sUUFBUSxVQUFSLENBQVg7QUFBQSxJQUNJLFFBQU8sUUFBUSxZQUFSLENBRFg7QUFBQSxJQUVJLE1BQU8sUUFBUSxVQUFSLENBRlg7QUFBQSxJQUdJLE9BQU8sUUFBUSxXQUFSLENBSFg7O0FBS0EsSUFBSSxRQUFRO0FBQ1YsWUFBUyxNQURDOztBQUdWLEtBSFUsaUJBR0o7QUFDSixRQUFJLGFBQUo7QUFBQSxRQUNJLFNBQVMsS0FBSSxTQUFKLENBQWUsSUFBZixDQURiO0FBQUEsUUFFSSxTQUFTLE9BQU8sQ0FBUCxDQUZiO0FBQUEsUUFFd0IsTUFBTSxPQUFPLENBQVAsQ0FGOUI7QUFBQSxRQUV5QyxNQUFNLE9BQU8sQ0FBUCxDQUYvQztBQUFBLFFBR0ksWUFISjtBQUFBLFFBR1MsYUFIVDs7QUFLQTtBQUNBO0FBQ0E7O0FBRUEsUUFBSSxLQUFLLEdBQUwsS0FBYSxDQUFqQixFQUFxQjtBQUNuQixhQUFPLEdBQVA7QUFDRCxLQUZELE1BRU0sSUFBSyxNQUFPLEdBQVAsS0FBZ0IsTUFBTyxHQUFQLENBQXJCLEVBQW9DO0FBQ3hDLGFBQVUsR0FBVixXQUFtQixHQUFuQjtBQUNELEtBRkssTUFFRDtBQUNILGFBQU8sTUFBTSxHQUFiO0FBQ0Q7O0FBRUQsb0JBQ0ksS0FBSyxJQURULFdBQ21CLE9BQU8sQ0FBUCxDQURuQixnQkFFSSxLQUFLLElBRlQsV0FFbUIsS0FBSyxHQUZ4QixXQUVpQyxLQUFLLElBRnRDLFlBRWlELElBRmpELHFCQUdTLEtBQUssSUFIZCxXQUd3QixLQUFLLEdBSDdCLFdBR3NDLEtBQUssSUFIM0MsWUFHc0QsSUFIdEQ7O0FBT0EsV0FBTyxDQUFFLEtBQUssSUFBUCxFQUFhLE1BQU0sR0FBbkIsQ0FBUDtBQUNEO0FBN0JTLENBQVo7O0FBZ0NBLE9BQU8sT0FBUCxHQUFpQixVQUFFLEdBQUYsRUFBeUI7QUFBQSxNQUFsQixHQUFrQix1RUFBZCxDQUFjO0FBQUEsTUFBWCxHQUFXLHVFQUFQLENBQU87O0FBQ3hDLE1BQUksT0FBTyxPQUFPLE1BQVAsQ0FBZSxLQUFmLENBQVg7O0FBRUEsU0FBTyxNQUFQLENBQWUsSUFBZixFQUFxQjtBQUNuQixZQURtQjtBQUVuQixZQUZtQjtBQUduQixTQUFRLEtBQUksTUFBSixFQUhXO0FBSW5CLFlBQVEsQ0FBRSxHQUFGLEVBQU8sR0FBUCxFQUFZLEdBQVo7QUFKVyxHQUFyQjs7QUFPQSxPQUFLLElBQUwsUUFBZSxLQUFLLFFBQXBCLEdBQStCLEtBQUssR0FBcEM7O0FBRUEsU0FBTyxJQUFQO0FBQ0QsQ0FiRDs7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonYWJzJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguYWJzIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uYWJzKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFicyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFicyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhYnMuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gYWJzXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2FjY3VtJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZnVuY3Rpb25Cb2R5XG5cbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZSArICdfdmFsdWUnXG4gICAgXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgY2FsbGJhY2soIF9uYW1lLCBfaW5jciwgX3Jlc2V0LCB2YWx1ZVJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCA9ICcnLFxuICAgICAgICB3cmFwID0gJydcbiAgICBcbiAgICAvKiB0aHJlZSBkaWZmZXJlbnQgbWV0aG9kcyBvZiB3cmFwcGluZywgdGhpcmQgaXMgbW9zdCBleHBlbnNpdmU6XG4gICAgICpcbiAgICAgKiAxOiByYW5nZSB7MCwxfTogeSA9IHggLSAoeCB8IDApXG4gICAgICogMjogbG9nMih0aGlzLm1heCkgPT0gaW50ZWdlcjogeSA9IHggJiAodGhpcy5tYXggLSAxKVxuICAgICAqIDM6IGFsbCBvdGhlcnM6IGlmKCB4ID49IHRoaXMubWF4ICkgeSA9IHRoaXMubWF4IC14XG4gICAgICpcbiAgICAgKi9cblxuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiggISh0eXBlb2YgdGhpcy5pbnB1dHNbMV0gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzFdIDwgMSkgKSB7IFxuICAgICAgaWYoIHRoaXMucmVzZXRWYWx1ZSAhPT0gdGhpcy5taW4gKSB7XG5cbiAgICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMucmVzZXRWYWx1ZX1cXG5cXG5gXG4gICAgICAgIC8vb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0xICkgJHt2YWx1ZVJlZn0gPSAke3RoaXMubWlufVxcblxcbmBcbiAgICAgIH1lbHNle1xuICAgICAgICBvdXQgKz0gYCAgaWYoICR7X3Jlc2V0fSA+PTEgKSAke3ZhbHVlUmVmfSA9ICR7dGhpcy5taW59XFxuXFxuYFxuICAgICAgICAvL291dCArPSBgICBpZiggJHtfcmVzZXR9ID49MSApICR7dmFsdWVSZWZ9ID0gJHt0aGlzLmluaXRpYWxWYWx1ZX1cXG5cXG5gXG4gICAgICB9XG4gICAgfVxuXG4gICAgb3V0ICs9IGAgIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3ZhbHVlUmVmfVxcbmBcbiAgICBcbiAgICBpZiggdGhpcy5zaG91bGRXcmFwID09PSBmYWxzZSAmJiB0aGlzLnNob3VsZENsYW1wID09PSB0cnVlICkge1xuICAgICAgb3V0ICs9IGAgIGlmKCAke3ZhbHVlUmVmfSA8ICR7dGhpcy5tYXggfSApICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYFxuICAgIH1lbHNle1xuICAgICAgb3V0ICs9IGAgICR7dmFsdWVSZWZ9ICs9ICR7X2luY3J9XFxuYCAvLyBzdG9yZSBvdXRwdXQgdmFsdWUgYmVmb3JlIGFjY3VtdWxhdGluZyAgXG4gICAgfVxuXG4gICAgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSAgJiYgdGhpcy5zaG91bGRXcmFwTWF4ICkgd3JhcCArPSBgICBpZiggJHt2YWx1ZVJlZn0gPj0gJHt0aGlzLm1heH0gKSAke3ZhbHVlUmVmfSAtPSAke2RpZmZ9XFxuYFxuICAgIGlmKCB0aGlzLm1pbiAhPT0gLUluZmluaXR5ICYmIHRoaXMuc2hvdWxkV3JhcE1pbiApIHdyYXAgKz0gYCAgaWYoICR7dmFsdWVSZWZ9IDwgJHt0aGlzLm1pbn0gKSAke3ZhbHVlUmVmfSArPSAke2RpZmZ9XFxuYFxuXG4gICAgLy9pZiggdGhpcy5taW4gPT09IDAgJiYgdGhpcy5tYXggPT09IDEgKSB7IFxuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gLSAoJHt2YWx1ZVJlZn0gfCAwKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5taW4gPT09IDAgJiYgKCBNYXRoLmxvZzIoIHRoaXMubWF4ICkgfCAwICkgPT09IE1hdGgubG9nMiggdGhpcy5tYXggKSApIHtcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9ICYgKCR7dGhpcy5tYXh9IC0gMSlcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSApe1xuICAgIC8vICB3cmFwID0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcblxcbmBcbiAgICAvL31cblxuICAgIG91dCA9IG91dCArIHdyYXAgKyAnXFxuJ1xuXG4gICAgcmV0dXJuIG91dFxuICB9LFxuXG4gIGRlZmF1bHRzIDogeyBtaW46MCwgbWF4OjEsIHJlc2V0VmFsdWU6MCwgaW5pdGlhbFZhbHVlOjAsIHNob3VsZFdyYXA6dHJ1ZSwgc2hvdWxkV3JhcE1heDogdHJ1ZSwgc2hvdWxkV3JhcE1pbjp0cnVlLCBzaG91bGRDbGFtcDpmYWxzZSB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbmNyLCByZXNldD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICAgICAgXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIFxuICAgIHsgXG4gICAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogWyBpbmNyLCByZXNldCBdLFxuICAgICAgbWVtb3J5OiB7XG4gICAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgICB9XG4gICAgfSxcbiAgICBwcm90by5kZWZhdWx0cyxcbiAgICBwcm9wZXJ0aWVzIFxuICApXG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnNob3VsZFdyYXBNYXggPT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLnNob3VsZFdyYXBNaW4gPT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggcHJvcGVydGllcy5zaG91bGRXcmFwICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICB1Z2VuLnNob3VsZFdyYXBNaW4gPSB1Z2VuLnNob3VsZFdyYXBNYXggPSBwcm9wZXJ0aWVzLnNob3VsZFdyYXBcbiAgICB9XG4gIH1cblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMucmVzZXRWYWx1ZSA9PT0gdW5kZWZpbmVkICkge1xuICAgIHVnZW4ucmVzZXRWYWx1ZSA9IHVnZW4ubWluXG4gIH1cblxuICBpZiggdWdlbi5pbml0aWFsVmFsdWUgPT09IHVuZGVmaW5lZCApIHVnZW4uaW5pdGlhbFZhbHVlID0gdWdlbi5taW5cblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSAgeyBcbiAgICAgIC8vY29uc29sZS5sb2coICdnZW46JywgZ2VuLCBnZW4ubWVtb3J5IClcbiAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdIFxuICAgIH0sXG4gICAgc2V0KHYpIHsgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgfVxuICB9KVxuXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYWNvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ2Fjb3MnOiBNYXRoLmFjb3MgfSlcblxuICAgICAgb3V0ID0gYGdlbi5hY29zKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hY29zKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYWNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhY29zLmlucHV0cyA9IFsgeCBdXG4gIGFjb3MuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWNvcy5uYW1lID0gYCR7YWNvcy5iYXNlbmFtZX17YWNvcy5pZH1gXG5cbiAgcmV0dXJuIGFjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbXVsICAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgZGl2ICAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgZGF0YSAgICAgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgICAgID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBhY2N1bSAgICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGlmZWxzZSAgID0gcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gICAgbHQgICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBiYW5nICAgICA9IHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gICAgZW52ICAgICAgPSByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gICAgYWRkICAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgcG9rZSAgICAgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICAgIG5lcSAgICAgID0gcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICAgIGFuZCAgICAgID0gcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICAgIGd0ZSAgICAgID0gcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICAgIG1lbW8gICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZSA9IDQ0MTAwLCBkZWNheVRpbWUgPSA0NDEwMCwgX3Byb3BzICkgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgc2hhcGU6J2V4cG9uZW50aWFsJywgYWxwaGE6NSwgdHJpZ2dlcjpudWxsIH0sIF9wcm9wcyApXG4gIGNvbnN0IF9iYW5nID0gcHJvcHMudHJpZ2dlciAhPT0gbnVsbCA/IHByb3BzLnRyaWdnZXIgOiBiYW5nKCksXG4gICAgICAgIHBoYXNlID0gYWNjdW0oIDEsIF9iYW5nLCB7IG1pbjowLCBtYXg6IEluZmluaXR5LCBpbml0aWFsVmFsdWU6LUluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlIH0pXG4gICAgICBcbiAgbGV0IGJ1ZmZlckRhdGEsIGJ1ZmZlckRhdGFSZXZlcnNlLCBkZWNheURhdGEsIG91dCwgYnVmZmVyXG5cbiAgLy9jb25zb2xlLmxvZyggJ3NoYXBlOicsIHByb3BzLnNoYXBlLCAnYXR0YWNrIHRpbWU6JywgYXR0YWNrVGltZSwgJ2RlY2F5IHRpbWU6JywgZGVjYXlUaW1lIClcbiAgbGV0IGNvbXBsZXRlRmxhZyA9IGRhdGEoIFswXSApXG4gIFxuICAvLyBzbGlnaHRseSBtb3JlIGVmZmljaWVudCB0byB1c2UgZXhpc3RpbmcgcGhhc2UgYWNjdW11bGF0b3IgZm9yIGxpbmVhciBlbnZlbG9wZXNcbiAgaWYoIHByb3BzLnNoYXBlID09PSAnbGluZWFyJyApIHtcbiAgICBvdXQgPSBpZmVsc2UoIFxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgbHQoIHBoYXNlLCBhdHRhY2tUaW1lICkpLFxuICAgICAgZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApLFxuXG4gICAgICBhbmQoIGd0ZSggcGhhc2UsIDApLCAgbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSApICkgKSxcbiAgICAgIHN1YiggMSwgZGl2KCBzdWIoIHBoYXNlLCBhdHRhY2tUaW1lICksIGRlY2F5VGltZSApICksXG4gICAgICBcbiAgICAgIG5lcSggcGhhc2UsIC1JbmZpbml0eSksXG4gICAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAgIDAgXG4gICAgKVxuICB9IGVsc2Uge1xuICAgIGJ1ZmZlckRhdGEgPSBlbnYoeyBsZW5ndGg6MTAyNCwgdHlwZTpwcm9wcy5zaGFwZSwgYWxwaGE6cHJvcHMuYWxwaGEgfSlcbiAgICBidWZmZXJEYXRhUmV2ZXJzZSA9IGVudih7IGxlbmd0aDoxMDI0LCB0eXBlOnByb3BzLnNoYXBlLCBhbHBoYTpwcm9wcy5hbHBoYSwgcmV2ZXJzZTp0cnVlIH0pXG5cbiAgICBvdXQgPSBpZmVsc2UoIFxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgbHQoIHBoYXNlLCBhdHRhY2tUaW1lICkgKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgICAgYW5kKCBndGUocGhhc2UsMCksIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YVJldmVyc2UsIGRpdiggc3ViKCBwaGFzZSwgYXR0YWNrVGltZSApLCBkZWNheVRpbWUgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgICAgbmVxKCBwaGFzZSwgLUluZmluaXR5ICksXG4gICAgICBwb2tlKCBjb21wbGV0ZUZsYWcsIDEsIDAsIHsgaW5saW5lOjAgfSksXG5cbiAgICAgIDBcbiAgICApXG4gIH1cblxuICBvdXQuaXNDb21wbGV0ZSA9ICgpPT4gZ2VuLm1lbW9yeS5oZWFwWyBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHggXVxuXG4gIG91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgZ2VuLm1lbW9yeS5oZWFwWyBjb21wbGV0ZUZsYWcubWVtb3J5LnZhbHVlcy5pZHggXSA9IDBcbiAgICBfYmFuZy50cmlnZ2VyKClcbiAgfVxuXG4gIHJldHVybiBvdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHsgXG4gIGJhc2VuYW1lOidhZGQnLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PScnLFxuICAgICAgICBzdW0gPSAwLCBudW1Db3VudCA9IDAsIGFkZGVyQXRFbmQgPSBmYWxzZSwgYWxyZWFkeUZ1bGxTdW1tZWQgPSB0cnVlXG5cbiAgICBpZiggaW5wdXRzLmxlbmd0aCA9PT0gMCApIHJldHVybiAwXG5cbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYFxuXG4gICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgIGlmKCBpc05hTiggdiApICkge1xuICAgICAgICBvdXQgKz0gdlxuICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgYWRkZXJBdEVuZCA9IHRydWVcbiAgICAgICAgICBvdXQgKz0gJyArICdcbiAgICAgICAgfVxuICAgICAgICBhbHJlYWR5RnVsbFN1bW1lZCA9IGZhbHNlXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc3VtICs9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICBudW1Db3VudCsrXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICBvdXQgKz0gYWRkZXJBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IHN1bSA6ICcgKyAnICsgc3VtXG4gICAgfVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgY29uc3QgYWRkID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBhZGQuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWRkLm5hbWUgPSBhZGQuYmFzZW5hbWUgKyBhZGQuaWRcbiAgYWRkLmlucHV0cyA9IGFyZ3NcblxuICByZXR1cm4gYWRkXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIG11bCAgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHN1YiAgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGRpdiAgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIGRhdGEgICAgID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrICAgICA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgYWNjdW0gICAgPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBpZmVsc2UgICA9IHJlcXVpcmUoICcuL2lmZWxzZWlmLmpzJyApLFxuICAgIGx0ICAgICAgID0gcmVxdWlyZSggJy4vbHQuanMnICksXG4gICAgYmFuZyAgICAgPSByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICAgIGVudiAgICAgID0gcmVxdWlyZSggJy4vZW52LmpzJyApLFxuICAgIHBhcmFtICAgID0gcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gICAgYWRkICAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgZ3RwICAgICAgPSByZXF1aXJlKCAnLi9ndHAuanMnICksXG4gICAgbm90ICAgICAgPSByZXF1aXJlKCAnLi9ub3QuanMnICksXG4gICAgYW5kICAgICAgPSByZXF1aXJlKCAnLi9hbmQuanMnICksXG4gICAgbmVxICAgICAgPSByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gICAgcG9rZSAgICAgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBhdHRhY2tUaW1lPTQ0LCBkZWNheVRpbWU9MjIwNTAsIHN1c3RhaW5UaW1lPTQ0MTAwLCBzdXN0YWluTGV2ZWw9LjYsIHJlbGVhc2VUaW1lPTQ0MTAwLCBfcHJvcHMgKSA9PiB7XG4gIGxldCBlbnZUcmlnZ2VyID0gYmFuZygpLFxuICAgICAgcGhhc2UgPSBhY2N1bSggMSwgZW52VHJpZ2dlciwgeyBtYXg6IEluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlLCBpbml0aWFsVmFsdWU6SW5maW5pdHkgfSksXG4gICAgICBzaG91bGRTdXN0YWluID0gcGFyYW0oIDEgKSxcbiAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgc2hhcGU6ICdleHBvbmVudGlhbCcsXG4gICAgICAgICBhbHBoYTogNSxcbiAgICAgICAgIHRyaWdnZXJSZWxlYXNlOiBmYWxzZSxcbiAgICAgIH0sXG4gICAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRzLCBfcHJvcHMgKSxcbiAgICAgIGJ1ZmZlckRhdGEsIGRlY2F5RGF0YSwgb3V0LCBidWZmZXIsIHN1c3RhaW5Db25kaXRpb24sIHJlbGVhc2VBY2N1bSwgcmVsZWFzZUNvbmRpdGlvblxuXG5cbiAgY29uc3QgY29tcGxldGVGbGFnID0gZGF0YSggWzBdIClcblxuICBidWZmZXJEYXRhID0gZW52KHsgbGVuZ3RoOjEwMjQsIGFscGhhOnByb3BzLmFscGhhLCBzaGlmdDowLCB0eXBlOnByb3BzLnNoYXBlIH0pXG5cbiAgc3VzdGFpbkNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlIFxuICAgID8gc2hvdWxkU3VzdGFpblxuICAgIDogbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUgKSApXG5cbiAgcmVsZWFzZUFjY3VtID0gcHJvcHMudHJpZ2dlclJlbGVhc2VcbiAgICA/IGd0cCggc3ViKCBzdXN0YWluTGV2ZWwsIGFjY3VtKCBkaXYoIHN1c3RhaW5MZXZlbCwgcmVsZWFzZVRpbWUgKSAsIDAsIHsgc2hvdWxkV3JhcDpmYWxzZSB9KSApLCAwIClcbiAgICA6IHN1Yiggc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lICkgKSwgcmVsZWFzZVRpbWUgKSwgc3VzdGFpbkxldmVsICkgKSwgXG5cbiAgcmVsZWFzZUNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgPyBub3QoIHNob3VsZFN1c3RhaW4gKVxuICAgIDogbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSwgc3VzdGFpblRpbWUsIHJlbGVhc2VUaW1lICkgKVxuXG4gIG91dCA9IGlmZWxzZShcbiAgICAvLyBhdHRhY2sgXG4gICAgbHQoIHBoYXNlLCAgYXR0YWNrVGltZSApLCBcbiAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgIC8vIGRlY2F5XG4gICAgbHQoIHBoYXNlLCBhZGQoIGF0dGFja1RpbWUsIGRlY2F5VGltZSApICksIFxuICAgIHBlZWsoIGJ1ZmZlckRhdGEsIHN1YiggMSwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICksICBkZWNheVRpbWUgKSwgc3ViKCAxLCAgc3VzdGFpbkxldmVsICkgKSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pLFxuXG4gICAgLy8gc3VzdGFpblxuICAgIGFuZCggc3VzdGFpbkNvbmRpdGlvbiwgbmVxKCBwaGFzZSwgSW5maW5pdHkgKSApLFxuICAgIHBlZWsoIGJ1ZmZlckRhdGEsICBzdXN0YWluTGV2ZWwgKSxcblxuICAgIC8vIHJlbGVhc2VcbiAgICByZWxlYXNlQ29uZGl0aW9uLCAvL2x0KCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lICsgIHJlbGVhc2VUaW1lICksXG4gICAgcGVlayggXG4gICAgICBidWZmZXJEYXRhLFxuICAgICAgcmVsZWFzZUFjY3VtLCBcbiAgICAgIC8vc3ViKCAgc3VzdGFpbkxldmVsLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lKSwgIHJlbGVhc2VUaW1lICksICBzdXN0YWluTGV2ZWwgKSApLCBcbiAgICAgIHsgYm91bmRtb2RlOidjbGFtcCcgfVxuICAgICksXG5cbiAgICBuZXEoIHBoYXNlLCBJbmZpbml0eSApLFxuICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgIDBcbiAgKVxuICAgXG4gIG91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDFcbiAgICBlbnZUcmlnZ2VyLnRyaWdnZXIoKVxuICB9XG5cbiAgb3V0LmlzQ29tcGxldGUgPSAoKT0+IGdlbi5tZW1vcnkuaGVhcFsgY29tcGxldGVGbGFnLm1lbW9yeS52YWx1ZXMuaWR4IF1cblxuICBvdXQucmVsZWFzZSA9ICgpPT4ge1xuICAgIHNob3VsZFN1c3RhaW4udmFsdWUgPSAwXG4gICAgLy8gWFhYIHByZXR0eSBuYXN0eS4uLiBncmFicyBhY2N1bSBpbnNpZGUgb2YgZ3RwIGFuZCByZXNldHMgdmFsdWUgbWFudWFsbHlcbiAgICAvLyB1bmZvcnR1bmF0ZWx5IGVudlRyaWdnZXIgd29uJ3Qgd29yayBhcyBpdCdzIGJhY2sgdG8gMCBieSB0aGUgdGltZSB0aGUgcmVsZWFzZSBibG9jayBpcyB0cmlnZ2VyZWQuLi5cbiAgICBnZW4ubWVtb3J5LmhlYXBbIHJlbGVhc2VBY2N1bS5pbnB1dHNbMF0uaW5wdXRzWzFdLm1lbW9yeS52YWx1ZS5pZHggXSA9IDBcbiAgfVxuXG4gIHJldHVybiBvdXQgXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhbmQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ICE9PSAwICYmICR7aW5wdXRzWzFdfSAhPT0gMCkgfCAwXFxuXFxuYFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYCR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1gLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhc2luJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYXNpbic6IE1hdGguYXNpbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmFzaW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmFzaW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGFzaW4uaW5wdXRzID0gWyB4IF1cbiAgYXNpbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhc2luLm5hbWUgPSBgJHthc2luLmJhc2VuYW1lfXthc2luLmlkfWBcblxuICByZXR1cm4gYXNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhdGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYXRhbic6IE1hdGguYXRhbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLmF0YW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmF0YW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGF0YW4uaW5wdXRzID0gWyB4IF1cbiAgYXRhbi5pZCA9IGdlbi5nZXRVSUQoKVxuICBhdGFuLm5hbWUgPSBgJHthdGFuLmJhc2VuYW1lfXthdGFuLmlkfWBcblxuICByZXR1cm4gYXRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGVjYXlUaW1lID0gNDQxMDAgKSA9PiB7XG4gIGxldCBzc2QgPSBoaXN0b3J5ICggMSApLFxuICAgICAgdDYwID0gTWF0aC5leHAoIC02LjkwNzc1NTI3ODkyMSAvIGRlY2F5VGltZSApXG5cbiAgc3NkLmluKCBtdWwoIHNzZC5vdXQsIHQ2MCApIClcblxuICBzc2Qub3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBzc2QudmFsdWUgPSAxXG4gIH1cblxuICByZXR1cm4gc3ViKCAxLCBzc2Qub3V0IClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGxldCBvdXQgPSBcbmAgIHZhciAke3RoaXMubmFtZX0gPSBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XVxuICBpZiggJHt0aGlzLm5hbWV9ID09PSAxICkgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV0gPSAwICAgICAgXG4gICAgICBcbmBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSBcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIF9wcm9wcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IG1pbjowLCBtYXg6MSB9LCBfcHJvcHMgKVxuXG4gIHVnZW4ubmFtZSA9ICdiYW5nJyArIGdlbi5nZXRVSUQoKVxuXG4gIHVnZW4ubWluID0gcHJvcHMubWluXG4gIHVnZW4ubWF4ID0gcHJvcHMubWF4XG5cbiAgdWdlbi50cmlnZ2VyID0gKCkgPT4ge1xuICAgIGdlbi5tZW1vcnkuaGVhcFsgdWdlbi5tZW1vcnkudmFsdWUuaWR4IF0gPSB1Z2VuLm1heCBcbiAgfVxuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gIH1cblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYm9vbCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gYCR7aW5wdXRzWzBdfSA9PT0gMCA/IDAgOiAxYFxuICAgIFxuICAgIC8vZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIC8vcmV0dXJuIFsgYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWAsICcgJyArb3V0IF1cbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cblxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2NlaWwnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5jZWlsIH0pXG5cbiAgICAgIG91dCA9IGBnZW4uY2VpbCggJHtpbnB1dHNbMF19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5jZWlsKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgY2VpbCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBjZWlsLmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIGNlaWxcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgZmxvb3I9IHJlcXVpcmUoJy4vZmxvb3IuanMnKSxcbiAgICBzdWIgID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vID0gcmVxdWlyZSgnLi9tZW1vLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY2xpcCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIG91dFxuXG4gICAgb3V0ID1cblxuYCB2YXIgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XG4gIGlmKCAke3RoaXMubmFtZX0gPiAke2lucHV0c1syXX0gKSAke3RoaXMubmFtZX0gPSAke2lucHV0c1syXX1cbiAgZWxzZSBpZiggJHt0aGlzLm5hbWV9IDwgJHtpbnB1dHNbMV19ICkgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMV19XG5gXG4gICAgb3V0ID0gJyAnICsgb3V0XG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIG1pbj0tMSwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgbWluLCBtYXggXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY29zJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnY29zJzogTWF0aC5jb3MgfSlcblxuICAgICAgb3V0ID0gYGdlbi5jb3MoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBjb3MuaW5wdXRzID0gWyB4IF1cbiAgY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGNvcy5uYW1lID0gYCR7Y29zLmJhc2VuYW1lfXtjb3MuaWR9YFxuXG4gIHJldHVybiBjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY291bnRlcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keVxuICAgICAgIFxuICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB0aGlzLmluaXRpYWxWYWx1ZVxuICAgIFxuICAgIGZ1bmN0aW9uQm9keSAgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgaW5wdXRzWzJdLCBpbnB1dHNbM10sIGlucHV0c1s0XSwgIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAsIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS53cmFwLmlkeH1dYCAgKVxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX3ZhbHVlJ1xuICAgXG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLndyYXAubmFtZSBdID09PSB1bmRlZmluZWQgKSB0aGlzLndyYXAuZ2VuKClcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGNhbGxiYWNrKCBfbmFtZSwgX2luY3IsIF9taW4sIF9tYXgsIF9yZXNldCwgbG9vcHMsIHZhbHVlUmVmLCB3cmFwUmVmICkge1xuICAgIGxldCBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJ1xuICAgIC8vIG11c3QgY2hlY2sgZm9yIHJlc2V0IGJlZm9yZSBzdG9yaW5nIHZhbHVlIGZvciBvdXRwdXRcbiAgICBpZiggISh0eXBlb2YgdGhpcy5pbnB1dHNbM10gPT09ICdudW1iZXInICYmIHRoaXMuaW5wdXRzWzNdIDwgMSkgKSB7IFxuICAgICAgb3V0ICs9IGAgIGlmKCAke19yZXNldH0gPj0gMSApICR7dmFsdWVSZWZ9ID0gJHtfbWlufVxcbmBcbiAgICB9XG5cbiAgICBvdXQgKz0gYCAgdmFyICR7dGhpcy5uYW1lfV92YWx1ZSA9ICR7dmFsdWVSZWZ9O1xcbiAgJHt2YWx1ZVJlZn0gKz0gJHtfaW5jcn1cXG5gIC8vIHN0b3JlIG91dHB1dCB2YWx1ZSBiZWZvcmUgYWNjdW11bGF0aW5nICBcbiAgICBcbiAgICBpZiggdHlwZW9mIHRoaXMubWF4ID09PSAnbnVtYmVyJyAmJiB0aGlzLm1heCAhPT0gSW5maW5pdHkgJiYgdHlwZW9mIHRoaXMubWluICE9PSAnbnVtYmVyJyApIHtcbiAgICAgIHdyYXAgPSBcbmAgIGlmKCAke3ZhbHVlUmVmfSA+PSAke3RoaXMubWF4fSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNle1xuICAgICR7d3JhcFJlZn0gPSAwXG4gIH1cXG5gXG4gICAgfWVsc2UgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSAmJiB0aGlzLm1pbiAhPT0gSW5maW5pdHkgKSB7XG4gICAgICB3cmFwID0gXG5gICBpZiggJHt2YWx1ZVJlZn0gPj0gJHtfbWF4fSAmJiAgJHtsb29wc30gPiAwKSB7XG4gICAgJHt2YWx1ZVJlZn0gLT0gJHtfbWF4fSAtICR7X21pbn1cbiAgICAke3dyYXBSZWZ9ID0gMVxuICB9ZWxzZSBpZiggJHt2YWx1ZVJlZn0gPCAke19taW59ICYmICAke2xvb3BzfSA+IDApIHtcbiAgICAke3ZhbHVlUmVmfSArPSAke19tYXh9IC0gJHtfbWlufVxuICAgICR7d3JhcFJlZn0gPSAxXG4gIH1lbHNle1xuICAgICR7d3JhcFJlZn0gPSAwXG4gIH1cXG5gXG4gICAgfWVsc2V7XG4gICAgICBvdXQgKz0gJ1xcbidcbiAgICB9XG5cbiAgICBvdXQgPSBvdXQgKyB3cmFwXG5cbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluY3I9MSwgbWluPTAsIG1heD1JbmZpbml0eSwgcmVzZXQ9MCwgbG9vcHM9MSwgIHByb3BlcnRpZXMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIGRlZmF1bHRzID0gT2JqZWN0LmFzc2lnbiggeyBpbml0aWFsVmFsdWU6IDAsIHNob3VsZFdyYXA6dHJ1ZSB9LCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbjogICAgbWluLCBcbiAgICBtYXg6ICAgIG1heCxcbiAgICBpbml0aWFsVmFsdWU6IGRlZmF1bHRzLmluaXRpYWxWYWx1ZSxcbiAgICB2YWx1ZTogIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW5jciwgbWluLCBtYXgsIHJlc2V0LCBsb29wcyBdLFxuICAgIG1lbW9yeToge1xuICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9LFxuICAgICAgd3JhcDogIHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IFxuICAgIH0sXG4gICAgd3JhcCA6IHtcbiAgICAgIGdlbigpIHsgXG4gICAgICAgIGlmKCB1Z2VuLm1lbW9yeS53cmFwLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICB9XG4gICAgICAgIGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyAke3VnZW4ubWVtb3J5LndyYXAuaWR4fSBdYFxuICAgICAgICByZXR1cm4gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWAgXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBkZWZhdWx0cyApXG4gXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIFxuICB1Z2VuLndyYXAuaW5wdXRzID0gWyB1Z2VuIF1cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcbiAgdWdlbi53cmFwLm5hbWUgPSB1Z2VuLm5hbWUgKyAnX3dyYXAnXG4gIHJldHVybiB1Z2VuXG59IFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwaGFzb3I9cmVxdWlyZSggJy4vcGhhc29yLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY3ljbGUnLFxuXG4gIGluaXRUYWJsZSgpIHsgICAgXG4gICAgbGV0IGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDAsIGwgPSBidWZmZXIubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSBNYXRoLnNpbiggKCBpIC8gbCApICogKCBNYXRoLlBJICogMiApIClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5jeWNsZSA9IGRhdGEoIGJ1ZmZlciwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9IClcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCwgX3Byb3BzICkgPT4ge1xuICBpZiggdHlwZW9mIGdlbi5nbG9iYWxzLmN5Y2xlID09PSAndW5kZWZpbmVkJyApIHByb3RvLmluaXRUYWJsZSgpIFxuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOjAgfSwgX3Byb3BzIClcblxuICBjb25zdCB1Z2VuID0gcGVlayggZ2VuLmdsb2JhbHMuY3ljbGUsIHBoYXNvciggZnJlcXVlbmN5LCByZXNldCwgcHJvcHMgKSlcbiAgdWdlbi5uYW1lID0gJ2N5Y2xlJyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICB1dGlsaXRpZXMgPSByZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gIHBlZWsgPSByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RhdGEnLFxuICBnbG9iYWxzOiB7fSxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlkeFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGxldCB1Z2VuID0gdGhpc1xuICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5LCB0aGlzLmltbXV0YWJsZSApIFxuICAgICAgaWR4ID0gdGhpcy5tZW1vcnkudmFsdWVzLmlkeFxuICAgICAgdHJ5IHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwLnNldCggdGhpcy5idWZmZXIsIGlkeCApXG4gICAgICB9Y2F0Y2goIGUgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCBlIClcbiAgICAgICAgdGhyb3cgRXJyb3IoICdlcnJvciB3aXRoIHJlcXVlc3QuIGFza2luZyBmb3IgJyArIHRoaXMuYnVmZmVyLmxlbmd0aCArJy4gY3VycmVudCBpbmRleDogJyArIGdlbi5tZW1vcnlJbmRleCArICcgb2YgJyArIGdlbi5tZW1vcnkuaGVhcC5sZW5ndGggKVxuICAgICAgfVxuICAgICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSB0aGlzXG4gICAgICAvL3JldHVybiAnZ2VuLm1lbW9yeScgKyB0aGlzLm5hbWUgKyAnLmJ1ZmZlcidcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlkeFxuICAgIH1lbHNle1xuICAgICAgaWR4ID0gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gICAgfVxuICAgIHJldHVybiBpZHhcbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIHgsIHk9MSwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4sIGJ1ZmZlciwgc2hvdWxkTG9hZCA9IGZhbHNlXG4gIFxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuZ2xvYmFsICE9PSB1bmRlZmluZWQgKSB7XG4gICAgaWYoIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdICkge1xuICAgICAgcmV0dXJuIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdXG4gICAgfVxuICB9XG5cbiAgaWYoIHR5cGVvZiB4ID09PSAnbnVtYmVyJyApIHtcbiAgICBpZiggeSAhPT0gMSApIHtcbiAgICAgIGJ1ZmZlciA9IFtdXG4gICAgICBmb3IoIGxldCBpID0gMDsgaSA8IHk7IGkrKyApIHtcbiAgICAgICAgYnVmZmVyWyBpIF0gPSBuZXcgRmxvYXQzMkFycmF5KCB4IClcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHggKVxuICAgIH1cbiAgfWVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIHggKSApIHsgLy8hICh4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkgKSB7XG4gICAgbGV0IHNpemUgPSB4Lmxlbmd0aFxuICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHNpemUgKVxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0geFsgaSBdXG4gICAgfVxuICB9ZWxzZSBpZiggdHlwZW9mIHggPT09ICdzdHJpbmcnICkge1xuICAgIGJ1ZmZlciA9IHsgbGVuZ3RoOiB5ID4gMSA/IHkgOiBnZW4uc2FtcGxlcmF0ZSAqIDYwIH0gLy8gWFhYIHdoYXQ/Pz9cbiAgICBzaG91bGRMb2FkID0gdHJ1ZVxuICB9ZWxzZSBpZiggeCBpbnN0YW5jZW9mIEZsb2F0MzJBcnJheSApIHtcbiAgICBidWZmZXIgPSB4XG4gIH1cbiAgXG4gIHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBidWZmZXIsXG4gICAgbmFtZTogcHJvdG8uYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKCksXG4gICAgZGltOiAgYnVmZmVyLmxlbmd0aCwgLy8gWFhYIGhvdyBkbyB3ZSBkeW5hbWljYWxseSBhbGxvY2F0ZSB0aGlzP1xuICAgIGNoYW5uZWxzIDogMSxcbiAgICBvbmxvYWQ6IG51bGwsXG4gICAgdGhlbiggZm5jICkge1xuICAgICAgdWdlbi5vbmxvYWQgPSBmbmNcbiAgICAgIHJldHVybiB1Z2VuXG4gICAgfSxcbiAgICBpbW11dGFibGU6IHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCAmJiBwcm9wZXJ0aWVzLmltbXV0YWJsZSA9PT0gdHJ1ZSA/IHRydWUgOiBmYWxzZSxcbiAgICBsb2FkKCBmaWxlbmFtZSApIHtcbiAgICAgIGxldCBwcm9taXNlID0gdXRpbGl0aWVzLmxvYWRTYW1wbGUoIGZpbGVuYW1lLCB1Z2VuIClcbiAgICAgIHByb21pc2UudGhlbiggKCBfYnVmZmVyICk9PiB7IFxuICAgICAgICB1Z2VuLm1lbW9yeS52YWx1ZXMubGVuZ3RoID0gdWdlbi5kaW0gPSBfYnVmZmVyLmxlbmd0aFxuICAgICAgICBpZiggdHlwZW9mIHVnZW4ub25sb2FkID09PSAnZnVuY3Rpb24nICkgdWdlbi5vbmxvYWQoKSBcbiAgICAgIH0pXG4gICAgfSxcbiAgICBtZW1vcnkgOiB7XG4gICAgICB2YWx1ZXM6IHsgbGVuZ3RoOmJ1ZmZlci5sZW5ndGgsIGlkeDpudWxsIH1cbiAgICB9XG4gIH0pXG5cbiAgaWYoIHNob3VsZExvYWQgKSB1Z2VuLmxvYWQoIHggKVxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggcHJvcGVydGllcy5nbG9iYWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdID0gdWdlblxuICAgIH1cbiAgICBpZiggcHJvcGVydGllcy5tZXRhID09PSB0cnVlICkge1xuICAgICAgZm9yKCBsZXQgaSA9IDAsIGxlbmd0aCA9IHVnZW4uYnVmZmVyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sIGksIHtcbiAgICAgICAgICBnZXQgKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBlZWsoIHVnZW4sIGksIHsgbW9kZTonc2ltcGxlJywgaW50ZXJwOidub25lJyB9IClcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgIHJldHVybiBwb2tlKCB1Z2VuLCB2LCBpIClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgeDEgPSBoaXN0b3J5KCksXG4gICAgICB5MSA9IGhpc3RvcnkoKSxcbiAgICAgIGZpbHRlclxuXG4gIC8vSGlzdG9yeSB4MSwgeTE7IHkgPSBpbjEgLSB4MSArIHkxKjAuOTk5NzsgeDEgPSBpbjE7IHkxID0geTsgb3V0MSA9IHk7XG4gIGZpbHRlciA9IG1lbW8oIGFkZCggc3ViKCBpbjEsIHgxLm91dCApLCBtdWwoIHkxLm91dCwgLjk5OTcgKSApIClcbiAgeDEuaW4oIGluMSApXG4gIHkxLmluKCBmaWx0ZXIgKVxuXG4gIHJldHVybiBmaWx0ZXJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHQ2MCAgICAgPSByZXF1aXJlKCAnLi90NjAuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwLCBwcm9wcyApID0+IHtcbiAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCB7IGluaXRWYWx1ZToxIH0sIHByb3BzICksXG4gICAgICBzc2QgPSBoaXN0b3J5ICggcHJvcGVydGllcy5pbml0VmFsdWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAoIGRlY2F5VGltZSApICkgKVxuXG4gIHNzZC5vdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNzZC52YWx1ZSA9IDFcbiAgfVxuXG4gIHJldHVybiBzc2Qub3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmNvbnN0IGdlbiAgPSByZXF1aXJlKCAnLi9nZW4uanMnICApLFxuICAgICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgICBwb2tlID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICAgIHBlZWsgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgICAgc3ViICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgICksXG4gICAgICB3cmFwID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgICAgIGFjY3VtPSByZXF1aXJlKCAnLi9hY2N1bS5qcycpLFxuICAgICAgbWVtbyA9IHJlcXVpcmUoICcuL21lbW8uanMnIClcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkZWxheScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpbnB1dHNbMF1cbiAgICBcbiAgICByZXR1cm4gaW5wdXRzWzBdXG4gIH0sXG59XG5cbmNvbnN0IGRlZmF1bHRzID0geyBzaXplOiA1MTIsIGludGVycDonbm9uZScgfVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCB0YXBzLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBjb25zdCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBsZXQgd3JpdGVJZHgsIHJlYWRJZHgsIGRlbGF5ZGF0YVxuXG4gIGlmKCBBcnJheS5pc0FycmF5KCB0YXBzICkgPT09IGZhbHNlICkgdGFwcyA9IFsgdGFwcyBdXG4gIFxuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgY29uc3QgbWF4VGFwU2l6ZSA9IE1hdGgubWF4KCAuLi50YXBzIClcbiAgaWYoIHByb3BzLnNpemUgPCBtYXhUYXBTaXplICkgcHJvcHMuc2l6ZSA9IG1heFRhcFNpemVcblxuICBkZWxheWRhdGEgPSBkYXRhKCBwcm9wcy5zaXplIClcbiAgXG4gIHVnZW4uaW5wdXRzID0gW11cblxuICB3cml0ZUlkeCA9IGFjY3VtKCAxLCAwLCB7IG1heDpwcm9wcy5zaXplLCBtaW46MCB9KVxuICBcbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0YXBzLmxlbmd0aDsgaSsrICkge1xuICAgIHVnZW4uaW5wdXRzWyBpIF0gPSBwZWVrKCBkZWxheWRhdGEsIHdyYXAoIHN1Yiggd3JpdGVJZHgsIHRhcHNbaV0gKSwgMCwgcHJvcHMuc2l6ZSApLHsgbW9kZTonc2FtcGxlcycsIGludGVycDpwcm9wcy5pbnRlcnAgfSlcbiAgfVxuICBcbiAgdWdlbi5vdXRwdXRzID0gdWdlbi5pbnB1dHMgLy8gWFhYIHVnaCwgVWdoLCBVR0ghIGJ1dCBpIGd1ZXNzIGl0IHdvcmtzLlxuXG4gIHBva2UoIGRlbGF5ZGF0YSwgaW4xLCB3cml0ZUlkeCApXG5cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke2dlbi5nZXRVSUQoKX1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEgKSA9PiB7XG4gIGxldCBuMSA9IGhpc3RvcnkoKVxuICAgIFxuICBuMS5pbiggaW4xIClcblxuICBsZXQgdWdlbiA9IHN1YiggaW4xLCBuMS5vdXQgKVxuICB1Z2VuLm5hbWUgPSAnZGVsdGEnK2dlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxuY29uc3QgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkaXYnLFxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0PWAgIHZhciAke3RoaXMubmFtZX0gPSBgLFxuICAgICAgICBkaWZmID0gMCwgXG4gICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgbGFzdE51bWJlciA9IGlucHV0c1sgMCBdLFxuICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgIGRpdkF0RW5kID0gZmFsc2VcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC8gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCArPSBgJHtsYXN0TnVtYmVyfSAvICR7dn1gXG4gICAgICB9XG5cbiAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnIC8gJyBcbiAgICB9KVxuXG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICguLi5hcmdzKSA9PiB7XG4gIGNvbnN0IGRpdiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIGRpdiwge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcbiAgfSlcblxuICBkaXYubmFtZSA9IGRpdi5iYXNlbmFtZSArIGRpdi5pZFxuICBcbiAgcmV0dXJuIGRpdlxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuJyApLFxuICAgIHdpbmRvd3MgPSByZXF1aXJlKCAnLi93aW5kb3dzJyApLFxuICAgIGRhdGEgICAgPSByZXF1aXJlKCAnLi9kYXRhJyApLFxuICAgIHBlZWsgICAgPSByZXF1aXJlKCAnLi9wZWVrJyApLFxuICAgIHBoYXNvciAgPSByZXF1aXJlKCAnLi9waGFzb3InICksXG4gICAgZGVmYXVsdHMgPSB7XG4gICAgICB0eXBlOid0cmlhbmd1bGFyJywgbGVuZ3RoOjEwMjQsIGFscGhhOi4xNSwgc2hpZnQ6MCwgcmV2ZXJzZTpmYWxzZSBcbiAgICB9XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvcHMgPT4ge1xuICBcbiAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKCB7fSwgZGVmYXVsdHMsIHByb3BzIClcbiAgbGV0IGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIHByb3BlcnRpZXMubGVuZ3RoIClcblxuICBsZXQgbmFtZSA9IHByb3BlcnRpZXMudHlwZSArICdfJyArIHByb3BlcnRpZXMubGVuZ3RoICsgJ18nICsgcHJvcGVydGllcy5zaGlmdCArICdfJyArIHByb3BlcnRpZXMucmV2ZXJzZSArICdfJyArIHByb3BlcnRpZXMuYWxwaGFcbiAgaWYoIHR5cGVvZiBnZW4uZ2xvYmFscy53aW5kb3dzWyBuYW1lIF0gPT09ICd1bmRlZmluZWQnICkgeyBcblxuICAgIGZvciggbGV0IGkgPSAwOyBpIDwgcHJvcGVydGllcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gd2luZG93c1sgcHJvcGVydGllcy50eXBlIF0oIHByb3BlcnRpZXMubGVuZ3RoLCBpLCBwcm9wZXJ0aWVzLmFscGhhLCBwcm9wZXJ0aWVzLnNoaWZ0IClcbiAgICB9XG5cbiAgICBpZiggcHJvcGVydGllcy5yZXZlcnNlID09PSB0cnVlICkgeyBcbiAgICAgIGJ1ZmZlci5yZXZlcnNlKClcbiAgICB9XG4gICAgZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdID0gZGF0YSggYnVmZmVyIClcbiAgfVxuXG4gIGxldCB1Z2VuID0gZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdIFxuICB1Z2VuLm5hbWUgPSAnZW52JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidlcScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gdGhpcy5pbnB1dHNbMF0gPT09IHRoaXMuaW5wdXRzWzFdID8gMSA6IGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ID09PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidleHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYGdlbi5leHAoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguZXhwKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgZXhwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGV4cC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBleHBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidmbG9vcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZmxvb3IgfSlcblxuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19IHwgMCApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSB8IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBmbG9vciA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBmbG9vci5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBmbG9vclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidmb2xkJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0XG5cbiAgICBvdXQgPSB0aGlzLmNyZWF0ZUNhbGxiYWNrKCBpbnB1dHNbMF0sIHRoaXMubWluLCB0aGlzLm1heCApIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBvdXQgXVxuICB9LFxuXG4gIGNyZWF0ZUNhbGxiYWNrKCB2LCBsbywgaGkgKSB7XG4gICAgbGV0IG91dCA9XG5gIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3Z9LFxuICAgICAgJHt0aGlzLm5hbWV9X3JhbmdlID0gJHtoaX0gLSAke2xvfSxcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9IDBcblxuICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gKCgke3RoaXMubmFtZX1fdmFsdWUgLSAke2xvfSkgLyAke3RoaXMubmFtZX1fcmFuZ2UpIHwgMFxuICAgICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZSAqICR7dGhpcy5uYW1lfV9udW1XcmFwc1xuICAgIH1cbiAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMrK1xuICB9IGVsc2UgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlIDwgJHtsb30pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSArPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZS0gMSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcy0tXG4gIH1cbiAgaWYoJHt0aGlzLm5hbWV9X251bVdyYXBzICYgMSkgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHtoaX0gKyAke2xvfSAtICR7dGhpcy5uYW1lfV92YWx1ZVxuYFxuICAgIHJldHVybiAnICcgKyBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZ2F0ZScsXG4gIGNvbnRyb2xTdHJpbmc6bnVsbCwgLy8gaW5zZXJ0IGludG8gb3V0cHV0IGNvZGVnZW4gZm9yIGRldGVybWluaW5nIGluZGV4aW5nXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcbiAgICBcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGxldCBsYXN0SW5wdXRNZW1vcnlJZHggPSAnbWVtb3J5WyAnICsgdGhpcy5tZW1vcnkubGFzdElucHV0LmlkeCArICcgXScsXG4gICAgICAgIG91dHB1dE1lbW9yeVN0YXJ0SWR4ID0gdGhpcy5tZW1vcnkubGFzdElucHV0LmlkeCArIDEsXG4gICAgICAgIGlucHV0U2lnbmFsID0gaW5wdXRzWzBdLFxuICAgICAgICBjb250cm9sU2lnbmFsID0gaW5wdXRzWzFdXG4gICAgXG4gICAgLyogXG4gICAgICogd2UgY2hlY2sgdG8gc2VlIGlmIHRoZSBjdXJyZW50IGNvbnRyb2wgaW5wdXRzIGVxdWFscyBvdXIgbGFzdCBpbnB1dFxuICAgICAqIGlmIHNvLCB3ZSBzdG9yZSB0aGUgc2lnbmFsIGlucHV0IGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50bHlcbiAgICAgKiBzZWxlY3RlZCBpbmRleC4gSWYgbm90LCB3ZSBwdXQgMCBpbiB0aGUgbWVtb3J5IGFzc29jaWF0ZWQgd2l0aCB0aGUgbGFzdCBzZWxlY3RlZCBpbmRleCxcbiAgICAgKiBjaGFuZ2UgdGhlIHNlbGVjdGVkIGluZGV4LCBhbmQgdGhlbiBzdG9yZSB0aGUgc2lnbmFsIGluIHB1dCBpbiB0aGUgbWVtZXJ5IGFzc29pY2F0ZWRcbiAgICAgKiB3aXRoIHRoZSBuZXdseSBzZWxlY3RlZCBpbmRleFxuICAgICAqL1xuICAgIFxuICAgIG91dCA9XG5cbmAgaWYoICR7Y29udHJvbFNpZ25hbH0gIT09ICR7bGFzdElucHV0TWVtb3J5SWR4fSApIHtcbiAgICBtZW1vcnlbICR7bGFzdElucHV0TWVtb3J5SWR4fSArICR7b3V0cHV0TWVtb3J5U3RhcnRJZHh9ICBdID0gMCBcbiAgICAke2xhc3RJbnB1dE1lbW9yeUlkeH0gPSAke2NvbnRyb2xTaWduYWx9XG4gIH1cbiAgbWVtb3J5WyAke291dHB1dE1lbW9yeVN0YXJ0SWR4fSArICR7Y29udHJvbFNpZ25hbH0gXSA9ICR7aW5wdXRTaWduYWx9XG5cbmBcbiAgICB0aGlzLmNvbnRyb2xTdHJpbmcgPSBpbnB1dHNbMV1cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICB0aGlzLm91dHB1dHMuZm9yRWFjaCggdiA9PiB2LmdlbigpIClcblxuICAgIHJldHVybiBbIG51bGwsICcgJyArIG91dCBdXG4gIH0sXG5cbiAgY2hpbGRnZW4oKSB7XG4gICAgaWYoIHRoaXMucGFyZW50LmluaXRpYWxpemVkID09PSBmYWxzZSApIHtcbiAgICAgIGdlbi5nZXRJbnB1dHMoIHRoaXMgKSAvLyBwYXJlbnQgZ2F0ZSBpcyBvbmx5IGlucHV0IG9mIGEgZ2F0ZSBvdXRwdXQsIHNob3VsZCBvbmx5IGJlIGdlbidkIG9uY2UuXG4gICAgfVxuXG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9IF1gXG4gICAgfVxuICAgIFxuICAgIHJldHVybiAgYG1lbW9yeVsgJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9IF1gXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGNvbnRyb2wsIGluMSwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGNvdW50OiAyIH1cblxuICBpZiggdHlwZW9mIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgb3V0cHV0czogW10sXG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBjb250cm9sIF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICBsYXN0SW5wdXQ6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICB9LFxuICAgIGluaXRpYWxpemVkOmZhbHNlXG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHtnZW4uZ2V0VUlEKCl9YFxuXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgdWdlbi5jb3VudDsgaSsrICkge1xuICAgIHVnZW4ub3V0cHV0cy5wdXNoKHtcbiAgICAgIGluZGV4OmksXG4gICAgICBnZW46IHByb3RvLmNoaWxkZ2VuLFxuICAgICAgcGFyZW50OnVnZW4sXG4gICAgICBpbnB1dHM6IFsgdWdlbiBdLFxuICAgICAgbWVtb3J5OiB7XG4gICAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZWQ6ZmFsc2UsXG4gICAgICBuYW1lOiBgJHt1Z2VuLm5hbWV9X291dCR7Z2VuLmdldFVJRCgpfWBcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKiBnZW4uanNcbiAqXG4gKiBsb3ctbGV2ZWwgY29kZSBnZW5lcmF0aW9uIGZvciB1bml0IGdlbmVyYXRvcnNcbiAqXG4gKi9cblxubGV0IE1lbW9yeUhlbHBlciA9IHJlcXVpcmUoICdtZW1vcnktaGVscGVyJyApXG5cbmxldCBnZW4gPSB7XG5cbiAgYWNjdW06MCxcbiAgZ2V0VUlEKCkgeyByZXR1cm4gdGhpcy5hY2N1bSsrIH0sXG4gIGRlYnVnOmZhbHNlLFxuICBzYW1wbGVyYXRlOiA0NDEwMCwgLy8gY2hhbmdlIG9uIGF1ZGlvY29udGV4dCBjcmVhdGlvblxuICBzaG91bGRMb2NhbGl6ZTogZmFsc2UsXG4gIGdsb2JhbHM6e1xuICAgIHdpbmRvd3M6IHt9LFxuICB9LFxuICBcbiAgLyogY2xvc3VyZXNcbiAgICpcbiAgICogRnVuY3Rpb25zIHRoYXQgYXJlIGluY2x1ZGVkIGFzIGFyZ3VtZW50cyB0byBtYXN0ZXIgY2FsbGJhY2suIEV4YW1wbGVzOiBNYXRoLmFicywgTWF0aC5yYW5kb20gZXRjLlxuICAgKiBYWFggU2hvdWxkIHByb2JhYmx5IGJlIHJlbmFtZWQgY2FsbGJhY2tQcm9wZXJ0aWVzIG9yIHNvbWV0aGluZyBzaW1pbGFyLi4uIGNsb3N1cmVzIGFyZSBubyBsb25nZXIgdXNlZC5cbiAgICovXG5cbiAgY2xvc3VyZXM6IG5ldyBTZXQoKSxcbiAgcGFyYW1zOiAgIG5ldyBTZXQoKSxcblxuICBwYXJhbWV0ZXJzOltdLFxuICBlbmRCbG9jazogbmV3IFNldCgpLFxuICBoaXN0b3JpZXM6IG5ldyBNYXAoKSxcblxuICBtZW1vOiB7fSxcblxuICAvL2RhdGE6IHt9LFxuICBcbiAgLyogZXhwb3J0XG4gICAqXG4gICAqIHBsYWNlIGdlbiBmdW5jdGlvbnMgaW50byBhbm90aGVyIG9iamVjdCBmb3IgZWFzaWVyIHJlZmVyZW5jZVxuICAgKi9cblxuICBleHBvcnQoIG9iaiApIHt9LFxuXG4gIGFkZFRvRW5kQmxvY2soIHYgKSB7XG4gICAgdGhpcy5lbmRCbG9jay5hZGQoICcgICcgKyB2IClcbiAgfSxcbiAgXG4gIHJlcXVlc3RNZW1vcnkoIG1lbW9yeVNwZWMsIGltbXV0YWJsZT1mYWxzZSApIHtcbiAgICBmb3IoIGxldCBrZXkgaW4gbWVtb3J5U3BlYyApIHtcbiAgICAgIGxldCByZXF1ZXN0ID0gbWVtb3J5U3BlY1sga2V5IF1cblxuICAgICAgLy9jb25zb2xlLmxvZyggJ3JlcXVlc3RpbmcgJyArIGtleSArICc6JyAsIEpTT04uc3RyaW5naWZ5KCByZXF1ZXN0ICkgKVxuXG4gICAgICBpZiggcmVxdWVzdC5sZW5ndGggPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgY29uc29sZS5sb2coICd1bmRlZmluZWQgbGVuZ3RoIGZvcjonLCBrZXkgKVxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaWR4ID0gZ2VuLm1lbW9yeS5hbGxvYyggcmVxdWVzdC5sZW5ndGgsIGltbXV0YWJsZSApXG4gICAgfVxuICB9LFxuXG4gIGNyZWF0ZU1lbW9yeSggYW1vdW50LCB0eXBlICkge1xuICAgIGNvbnN0IG1lbSA9IE1lbW9yeUhlbHBlci5jcmVhdGUoIGFtb3VudCwgdHlwZSApXG4gICAgcmV0dXJuIG1lbVxuICB9LFxuXG4gIC8qIGNyZWF0ZUNhbGxiYWNrXG4gICAqXG4gICAqIHBhcmFtIHVnZW4gLSBIZWFkIG9mIGdyYXBoIHRvIGJlIGNvZGVnZW4nZFxuICAgKlxuICAgKiBHZW5lcmF0ZSBjYWxsYmFjayBmdW5jdGlvbiBmb3IgYSBwYXJ0aWN1bGFyIHVnZW4gZ3JhcGguXG4gICAqIFRoZSBnZW4uY2xvc3VyZXMgcHJvcGVydHkgc3RvcmVzIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmVcbiAgICogcGFzc2VkIGFzIGFyZ3VtZW50cyB0byB0aGUgZmluYWwgZnVuY3Rpb247IHRoZXNlIGFyZSBwcmVmaXhlZFxuICAgKiBiZWZvcmUgYW55IGRlZmluZWQgcGFyYW1zIHRoZSBncmFwaCBleHBvc2VzLiBGb3IgZXhhbXBsZSwgZ2l2ZW46XG4gICAqXG4gICAqIGdlbi5jcmVhdGVDYWxsYmFjayggYWJzKCBwYXJhbSgpICkgKVxuICAgKlxuICAgKiAuLi4gdGhlIGdlbmVyYXRlZCBmdW5jdGlvbiB3aWxsIGhhdmUgYSBzaWduYXR1cmUgb2YgKCBhYnMsIHAwICkuXG4gICAqL1xuICBcbiAgY3JlYXRlQ2FsbGJhY2soIHVnZW4sIG1lbSwgZGVidWcgPSBmYWxzZSwgc2hvdWxkSW5saW5lTWVtb3J5PWZhbHNlLCBtZW1UeXBlID0gRmxvYXQ2NEFycmF5ICkge1xuICAgIGxldCBpc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIHVnZW4gKSAmJiB1Z2VuLmxlbmd0aCA+IDEsXG4gICAgICAgIGNhbGxiYWNrLCBcbiAgICAgICAgY2hhbm5lbDEsIGNoYW5uZWwyXG5cbiAgICBpZiggdHlwZW9mIG1lbSA9PT0gJ251bWJlcicgfHwgbWVtID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBtZW0gPSBNZW1vcnlIZWxwZXIuY3JlYXRlKCBtZW0sIG1lbVR5cGUgKVxuICAgIH1cbiAgICBcbiAgICAvL2NvbnNvbGUubG9nKCAnY2IgbWVtb3J5OicsIG1lbSApXG4gICAgdGhpcy5tZW1vcnkgPSBtZW1cbiAgICB0aGlzLm1lbW8gPSB7fSBcbiAgICB0aGlzLmVuZEJsb2NrLmNsZWFyKClcbiAgICB0aGlzLmNsb3N1cmVzLmNsZWFyKClcbiAgICB0aGlzLnBhcmFtcy5jbGVhcigpXG4gICAgLy90aGlzLmdsb2JhbHMgPSB7IHdpbmRvd3M6e30gfVxuICAgIFxuICAgIHRoaXMucGFyYW1ldGVycy5sZW5ndGggPSAwXG4gICAgXG4gICAgdGhpcy5mdW5jdGlvbkJvZHkgPSBcIiAgJ3VzZSBzdHJpY3QnXFxuXCJcbiAgICBpZiggc2hvdWxkSW5saW5lTWVtb3J5PT09ZmFsc2UgKSB0aGlzLmZ1bmN0aW9uQm9keSArPSBcIiAgdmFyIG1lbW9yeSA9IGdlbi5tZW1vcnlcXG5cXG5cIiBcblxuICAgIC8vIGNhbGwgLmdlbigpIG9uIHRoZSBoZWFkIG9mIHRoZSBncmFwaCB3ZSBhcmUgZ2VuZXJhdGluZyB0aGUgY2FsbGJhY2sgZm9yXG4gICAgLy9jb25zb2xlLmxvZyggJ0hFQUQnLCB1Z2VuIClcbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDEgKyBpc1N0ZXJlbzsgaSsrICkge1xuICAgICAgaWYoIHR5cGVvZiB1Z2VuW2ldID09PSAnbnVtYmVyJyApIGNvbnRpbnVlXG5cbiAgICAgIC8vbGV0IGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHVnZW5baV0uZ2VuKCkgOiB1Z2VuLmdlbigpLFxuICAgICAgbGV0IGNoYW5uZWwgPSBpc1N0ZXJlbyA/IHRoaXMuZ2V0SW5wdXQoIHVnZW5baV0gKSA6IHRoaXMuZ2V0SW5wdXQoIHVnZW4gKSwgXG4gICAgICAgICAgYm9keSA9ICcnXG5cbiAgICAgIC8vIGlmIC5nZW4oKSByZXR1cm5zIGFycmF5LCBhZGQgdWdlbiBjYWxsYmFjayAoZ3JhcGhPdXRwdXRbMV0pIHRvIG91ciBvdXRwdXQgZnVuY3Rpb25zIGJvZHlcbiAgICAgIC8vIGFuZCB0aGVuIHJldHVybiBuYW1lIG9mIHVnZW4uIElmIC5nZW4oKSBvbmx5IGdlbmVyYXRlcyBhIG51bWJlciAoZm9yIHJlYWxseSBzaW1wbGUgZ3JhcGhzKVxuICAgICAgLy8ganVzdCByZXR1cm4gdGhhdCBudW1iZXIgKGdyYXBoT3V0cHV0WzBdKS5cbiAgICAgIGJvZHkgKz0gQXJyYXkuaXNBcnJheSggY2hhbm5lbCApID8gY2hhbm5lbFsxXSArICdcXG4nICsgY2hhbm5lbFswXSA6IGNoYW5uZWxcblxuICAgICAgLy8gc3BsaXQgYm9keSB0byBpbmplY3QgcmV0dXJuIGtleXdvcmQgb24gbGFzdCBsaW5lXG4gICAgICBib2R5ID0gYm9keS5zcGxpdCgnXFxuJylcbiAgICAgXG4gICAgICAvL2lmKCBkZWJ1ZyApIGNvbnNvbGUubG9nKCAnZnVuY3Rpb25Cb2R5IGxlbmd0aCcsIGJvZHkgKVxuICAgICAgXG4gICAgICAvLyBuZXh0IGxpbmUgaXMgdG8gYWNjb21tb2RhdGUgbWVtbyBhcyBncmFwaCBoZWFkXG4gICAgICBpZiggYm9keVsgYm9keS5sZW5ndGggLTEgXS50cmltKCkuaW5kZXhPZignbGV0JykgPiAtMSApIHsgYm9keS5wdXNoKCAnXFxuJyApIH0gXG5cbiAgICAgIC8vIGdldCBpbmRleCBvZiBsYXN0IGxpbmVcbiAgICAgIGxldCBsYXN0aWR4ID0gYm9keS5sZW5ndGggLSAxXG5cbiAgICAgIC8vIGluc2VydCByZXR1cm4ga2V5d29yZFxuICAgICAgYm9keVsgbGFzdGlkeCBdID0gJyAgZ2VuLm91dFsnICsgaSArICddICA9ICcgKyBib2R5WyBsYXN0aWR4IF0gKyAnXFxuJ1xuXG4gICAgICB0aGlzLmZ1bmN0aW9uQm9keSArPSBib2R5LmpvaW4oJ1xcbicpXG4gICAgfVxuICAgIFxuICAgIHRoaXMuaGlzdG9yaWVzLmZvckVhY2goIHZhbHVlID0+IHtcbiAgICAgIGlmKCB2YWx1ZSAhPT0gbnVsbCApXG4gICAgICAgIHZhbHVlLmdlbigpICAgICAgXG4gICAgfSlcblxuICAgIGxldCByZXR1cm5TdGF0ZW1lbnQgPSBpc1N0ZXJlbyA/ICcgIHJldHVybiBnZW4ub3V0JyA6ICcgIHJldHVybiBnZW4ub3V0WzBdJ1xuICAgIFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuc3BsaXQoJ1xcbicpXG5cbiAgICBpZiggdGhpcy5lbmRCbG9jay5zaXplICkgeyBcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuY29uY2F0KCBBcnJheS5mcm9tKCB0aGlzLmVuZEJsb2NrICkgKVxuICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2goIHJldHVyblN0YXRlbWVudCApXG4gICAgfVxuICAgIC8vIHJlYXNzZW1ibGUgZnVuY3Rpb24gYm9keVxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gdGhpcy5mdW5jdGlvbkJvZHkuam9pbignXFxuJylcblxuICAgIC8vIHdlIGNhbiBvbmx5IGR5bmFtaWNhbGx5IGNyZWF0ZSBhIG5hbWVkIGZ1bmN0aW9uIGJ5IGR5bmFtaWNhbGx5IGNyZWF0aW5nIGFub3RoZXIgZnVuY3Rpb25cbiAgICAvLyB0byBjb25zdHJ1Y3QgdGhlIG5hbWVkIGZ1bmN0aW9uISBzaGVlc2guLi5cbiAgICAvL1xuICAgIGlmKCBzaG91bGRJbmxpbmVNZW1vcnkgPT09IHRydWUgKSB7XG4gICAgICB0aGlzLnBhcmFtZXRlcnMucHVzaCggJ21lbW9yeScgKVxuICAgIH1cbiAgICBsZXQgYnVpbGRTdHJpbmcgPSBgcmV0dXJuIGZ1bmN0aW9uIGdlbiggJHsgdGhpcy5wYXJhbWV0ZXJzLmpvaW4oJywnKSB9ICl7IFxcbiR7IHRoaXMuZnVuY3Rpb25Cb2R5IH1cXG59YFxuICAgIFxuICAgIGlmKCB0aGlzLmRlYnVnIHx8IGRlYnVnICkgY29uc29sZS5sb2coIGJ1aWxkU3RyaW5nICkgXG5cbiAgICBjYWxsYmFjayA9IG5ldyBGdW5jdGlvbiggYnVpbGRTdHJpbmcgKSgpXG5cbiAgICBcbiAgICAvLyBhc3NpZ24gcHJvcGVydGllcyB0byBuYW1lZCBmdW5jdGlvblxuICAgIGZvciggbGV0IGRpY3Qgb2YgdGhpcy5jbG9zdXJlcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB2YWx1ZSA9IGRpY3RbIG5hbWUgXVxuXG4gICAgICBjYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICBmb3IoIGxldCBkaWN0IG9mIHRoaXMucGFyYW1zLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHVnZW4gPSBkaWN0WyBuYW1lIF1cbiAgICAgIFxuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBjYWxsYmFjaywgbmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHVnZW4udmFsdWUgfSxcbiAgICAgICAgc2V0KHYpeyB1Z2VuLnZhbHVlID0gdiB9XG4gICAgICB9KVxuICAgICAgLy9jYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICBjYWxsYmFjay5kYXRhID0gdGhpcy5kYXRhXG4gICAgY2FsbGJhY2sub3V0ICA9IG5ldyBGbG9hdDY0QXJyYXkoIDIgKVxuICAgIGNhbGxiYWNrLnBhcmFtZXRlcnMgPSB0aGlzLnBhcmFtZXRlcnMuc2xpY2UoIDAgKVxuXG4gICAgLy9pZiggTWVtb3J5SGVscGVyLmlzUHJvdG90eXBlT2YoIHRoaXMubWVtb3J5ICkgKSBcbiAgICBjYWxsYmFjay5tZW1vcnkgPSB0aGlzLm1lbW9yeS5oZWFwXG5cbiAgICB0aGlzLmhpc3Rvcmllcy5jbGVhcigpXG5cbiAgICByZXR1cm4gY2FsbGJhY2tcbiAgfSxcbiAgXG4gIC8qIGdldElucHV0c1xuICAgKlxuICAgKiBDYWxsZWQgYnkgZWFjaCBpbmRpdmlkdWFsIHVnZW4gd2hlbiB0aGVpciAuZ2VuKCkgbWV0aG9kIGlzIGNhbGxlZCB0byByZXNvbHZlIHRoZWlyIHZhcmlvdXMgaW5wdXRzLlxuICAgKiBJZiBhbiBpbnB1dCBpcyBhIG51bWJlciwgcmV0dXJuIHRoZSBudW1iZXIuIElmXG4gICAqIGl0IGlzIGFuIHVnZW4sIGNhbGwgLmdlbigpIG9uIHRoZSB1Z2VuLCBtZW1vaXplIHRoZSByZXN1bHQgYW5kIHJldHVybiB0aGUgcmVzdWx0LiBJZiB0aGVcbiAgICogdWdlbiBoYXMgcHJldmlvdXNseSBiZWVuIG1lbW9pemVkIHJldHVybiB0aGUgbWVtb2l6ZWQgdmFsdWUuXG4gICAqXG4gICAqL1xuICBnZXRJbnB1dHMoIHVnZW4gKSB7XG4gICAgcmV0dXJuIHVnZW4uaW5wdXRzLm1hcCggZ2VuLmdldElucHV0ICkgXG4gIH0sXG5cbiAgZ2V0SW5wdXQoIGlucHV0ICkge1xuICAgIGxldCBpc09iamVjdCA9IHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcsXG4gICAgICAgIHByb2Nlc3NlZElucHV0XG5cbiAgICBpZiggaXNPYmplY3QgKSB7IC8vIGlmIGlucHV0IGlzIGEgdWdlbi4uLiBcbiAgICAgIC8vY29uc29sZS5sb2coIGlucHV0Lm5hbWUsIGdlbi5tZW1vWyBpbnB1dC5uYW1lIF0gKVxuICAgICAgaWYoIGdlbi5tZW1vWyBpbnB1dC5uYW1lIF0gKSB7IC8vIGlmIGl0IGhhcyBiZWVuIG1lbW9pemVkLi4uXG4gICAgICAgIHByb2Nlc3NlZElucHV0ID0gZ2VuLm1lbW9bIGlucHV0Lm5hbWUgXVxuICAgICAgfWVsc2UgaWYoIEFycmF5LmlzQXJyYXkoIGlucHV0ICkgKSB7XG4gICAgICAgIGdlbi5nZXRJbnB1dCggaW5wdXRbMF0gKVxuICAgICAgICBnZW4uZ2V0SW5wdXQoIGlucHV0WzFdIClcbiAgICAgIH1lbHNleyAvLyBpZiBub3QgbWVtb2l6ZWQgZ2VuZXJhdGUgY29kZSAgXG4gICAgICAgIGlmKCB0eXBlb2YgaW5wdXQuZ2VuICE9PSAnZnVuY3Rpb24nICkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCAnbm8gZ2VuIGZvdW5kOicsIGlucHV0LCBpbnB1dC5nZW4gKVxuICAgICAgICB9XG4gICAgICAgIGxldCBjb2RlID0gaW5wdXQuZ2VuKClcbiAgICAgICAgLy9pZiggY29kZS5pbmRleE9mKCAnT2JqZWN0JyApID4gLTEgKSBjb25zb2xlLmxvZyggJ2JhZCBpbnB1dDonLCBpbnB1dCwgY29kZSApXG4gICAgICAgIFxuICAgICAgICBpZiggQXJyYXkuaXNBcnJheSggY29kZSApICkge1xuICAgICAgICAgIGlmKCAhZ2VuLnNob3VsZExvY2FsaXplICkge1xuICAgICAgICAgICAgZ2VuLmZ1bmN0aW9uQm9keSArPSBjb2RlWzFdXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBnZW4uY29kZU5hbWUgPSBjb2RlWzBdXG4gICAgICAgICAgICBnZW4ubG9jYWxpemVkQ29kZS5wdXNoKCBjb2RlWzFdIClcbiAgICAgICAgICB9XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyggJ2FmdGVyIEdFTicgLCB0aGlzLmZ1bmN0aW9uQm9keSApXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlWzBdXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfWVsc2V7IC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2Nlc3NlZElucHV0XG4gIH0sXG5cbiAgc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXVxuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSB0cnVlXG4gIH0sXG4gIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApIF1cbiAgfSxcblxuICBmcmVlKCBncmFwaCApIHtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggZ3JhcGggKSApIHsgLy8gc3RlcmVvIHVnZW5cbiAgICAgIGZvciggbGV0IGNoYW5uZWwgb2YgZ3JhcGggKSB7XG4gICAgICAgIHRoaXMuZnJlZSggY2hhbm5lbCApXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKCB0eXBlb2YgZ3JhcGggPT09ICdvYmplY3QnICkge1xuICAgICAgICBpZiggZ3JhcGgubWVtb3J5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgZm9yKCBsZXQgbWVtb3J5S2V5IGluIGdyYXBoLm1lbW9yeSApIHtcbiAgICAgICAgICAgIHRoaXMubWVtb3J5LmZyZWUoIGdyYXBoLm1lbW9yeVsgbWVtb3J5S2V5IF0uaWR4IClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGdyYXBoLmlucHV0cyApICkge1xuICAgICAgICAgIGZvciggbGV0IHVnZW4gb2YgZ3JhcGguaW5wdXRzICkge1xuICAgICAgICAgICAgdGhpcy5mcmVlKCB1Z2VuIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZW5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZ3QnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCgoICR7aW5wdXRzWzBdfSA+ICR7aW5wdXRzWzFdfSkgfCAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPiBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG5cXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndC5pbnB1dHMgPSBbIHgseSBdXG4gIGd0Lm5hbWUgPSBndC5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBndFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonZ3RlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGAgIFxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ICs9IGAoICR7aW5wdXRzWzBdfSA+PSAke2lucHV0c1sxXX0gfCAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPj0gaW5wdXRzWzFdID8gMSA6IDAgXG4gICAgfVxuICAgIG91dCArPSAnXFxuXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gW3RoaXMubmFtZSwgb3V0XVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgZ3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3QuaW5wdXRzID0gWyB4LHkgXVxuICBndC5uYW1lID0gJ2d0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gZ3Rcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidndHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoICggJHtpbnB1dHNbMF19ID4gJHtpbnB1dHNbMV19ICkgfCAwICkgKWAgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSAqICggKCBpbnB1dHNbMF0gPiBpbnB1dHNbMV0gKSB8IDAgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndHAgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgZ3RwLmlucHV0cyA9IFsgeCx5IF1cblxuICByZXR1cm4gZ3RwXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjE9MCApID0+IHtcbiAgbGV0IHVnZW4gPSB7XG4gICAgaW5wdXRzOiBbIGluMSBdLFxuICAgIG1lbW9yeTogeyB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4OiBudWxsIH0gfSxcbiAgICByZWNvcmRlcjogbnVsbCxcblxuICAgIGluKCB2ICkge1xuICAgICAgaWYoIGdlbi5oaXN0b3JpZXMuaGFzKCB2ICkgKXtcbiAgICAgICAgbGV0IG1lbW9IaXN0b3J5ID0gZ2VuLmhpc3Rvcmllcy5nZXQoIHYgKVxuICAgICAgICB1Z2VuLm5hbWUgPSBtZW1vSGlzdG9yeS5uYW1lXG4gICAgICAgIHJldHVybiBtZW1vSGlzdG9yeVxuICAgICAgfVxuXG4gICAgICBsZXQgb2JqID0ge1xuICAgICAgICBnZW4oKSB7XG4gICAgICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHVnZW4gKVxuXG4gICAgICAgICAgaWYoIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSApXG4gICAgICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gaW4xXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeFxuICAgICAgICAgIFxuICAgICAgICAgIGdlbi5hZGRUb0VuZEJsb2NrKCAnbWVtb3J5WyAnICsgaWR4ICsgJyBdID0gJyArIGlucHV0c1sgMCBdIClcbiAgICAgICAgICBcbiAgICAgICAgICAvLyByZXR1cm4gdWdlbiB0aGF0IGlzIGJlaW5nIHJlY29yZGVkIGluc3RlYWQgb2Ygc3NkLlxuICAgICAgICAgIC8vIHRoaXMgZWZmZWN0aXZlbHkgbWFrZXMgYSBjYWxsIHRvIHNzZC5yZWNvcmQoKSB0cmFuc3BhcmVudCB0byB0aGUgZ3JhcGguXG4gICAgICAgICAgLy8gcmVjb3JkaW5nIGlzIHRyaWdnZXJlZCBieSBwcmlvciBjYWxsIHRvIGdlbi5hZGRUb0VuZEJsb2NrLlxuICAgICAgICAgIGdlbi5oaXN0b3JpZXMuc2V0KCB2LCBvYmogKVxuXG4gICAgICAgICAgcmV0dXJuIGlucHV0c1sgMCBdXG4gICAgICAgIH0sXG4gICAgICAgIG5hbWU6IHVnZW4ubmFtZSArICdfaW4nK2dlbi5nZXRVSUQoKSxcbiAgICAgICAgbWVtb3J5OiB1Z2VuLm1lbW9yeVxuICAgICAgfVxuXG4gICAgICB0aGlzLmlucHV0c1sgMCBdID0gdlxuICAgICAgXG4gICAgICB1Z2VuLnJlY29yZGVyID0gb2JqXG5cbiAgICAgIHJldHVybiBvYmpcbiAgICB9LFxuICAgIFxuICAgIG91dDoge1xuICAgICAgICAgICAgXG4gICAgICBnZW4oKSB7XG4gICAgICAgIGlmKCB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSB7XG4gICAgICAgICAgaWYoIGdlbi5oaXN0b3JpZXMuZ2V0KCB1Z2VuLmlucHV0c1swXSApID09PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgICBnZW4uaGlzdG9yaWVzLnNldCggdWdlbi5pbnB1dHNbMF0sIHVnZW4ucmVjb3JkZXIgKVxuICAgICAgICAgIH1cbiAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdWdlbi5tZW1vcnkudmFsdWUuaWR4IF0gPSBwYXJzZUZsb2F0KCBpbjEgKVxuICAgICAgICB9XG4gICAgICAgIGxldCBpZHggPSB1Z2VuLm1lbW9yeS52YWx1ZS5pZHhcbiAgICAgICAgIFxuICAgICAgICByZXR1cm4gJ21lbW9yeVsgJyArIGlkeCArICcgXSAnXG4gICAgICB9LFxuICAgIH0sXG5cbiAgICB1aWQ6IGdlbi5nZXRVSUQoKSxcbiAgfVxuICBcbiAgdWdlbi5vdXQubWVtb3J5ID0gdWdlbi5tZW1vcnkgXG5cbiAgdWdlbi5uYW1lID0gJ2hpc3RvcnknICsgdWdlbi51aWRcbiAgdWdlbi5vdXQubmFtZSA9IHVnZW4ubmFtZSArICdfb3V0J1xuICB1Z2VuLmluLl9uYW1lICA9IHVnZW4ubmFtZSA9ICdfaW4nXG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCB1Z2VuLCAndmFsdWUnLCB7XG4gICAgZ2V0KCkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHNldCggdiApIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gPSB2IFxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonaWZlbHNlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvbmRpdGlvbmFscyA9IHRoaXMuaW5wdXRzWzBdLFxuICAgICAgICBkZWZhdWx0VmFsdWUgPSBnZW4uZ2V0SW5wdXQoIGNvbmRpdGlvbmFsc1sgY29uZGl0aW9uYWxzLmxlbmd0aCAtIDFdICksXG4gICAgICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX1fb3V0ID0gJHtkZWZhdWx0VmFsdWV9XFxuYCBcblxuICAgIC8vY29uc29sZS5sb2coICdjb25kaXRpb25hbHM6JywgdGhpcy5uYW1lLCBjb25kaXRpb25hbHMgKVxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2RlZmF1bHRWYWx1ZTonLCBkZWZhdWx0VmFsdWUgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBjb25kaXRpb25hbHMubGVuZ3RoIC0gMjsgaSs9IDIgKSB7XG4gICAgICBsZXQgaXNFbmRCbG9jayA9IGkgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggLSAzLFxuICAgICAgICAgIGNvbmQgID0gZ2VuLmdldElucHV0KCBjb25kaXRpb25hbHNbIGkgXSApLFxuICAgICAgICAgIHByZWJsb2NrID0gY29uZGl0aW9uYWxzWyBpKzEgXSxcbiAgICAgICAgICBibG9jaywgYmxvY2tOYW1lLCBvdXRwdXRcblxuICAgICAgLy9jb25zb2xlLmxvZyggJ3BiJywgcHJlYmxvY2sgKVxuXG4gICAgICBpZiggdHlwZW9mIHByZWJsb2NrID09PSAnbnVtYmVyJyApe1xuICAgICAgICBibG9jayA9IHByZWJsb2NrXG4gICAgICAgIGJsb2NrTmFtZSA9IG51bGxcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggZ2VuLm1lbW9bIHByZWJsb2NrLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIC8vIHVzZWQgdG8gcGxhY2UgYWxsIGNvZGUgZGVwZW5kZW5jaWVzIGluIGFwcHJvcHJpYXRlIGJsb2Nrc1xuICAgICAgICAgIGdlbi5zdGFydExvY2FsaXplKClcblxuICAgICAgICAgIGdlbi5nZXRJbnB1dCggcHJlYmxvY2sgKVxuXG4gICAgICAgICAgYmxvY2sgPSBnZW4uZW5kTG9jYWxpemUoKVxuICAgICAgICAgIGJsb2NrTmFtZSA9IGJsb2NrWzBdXG4gICAgICAgICAgYmxvY2sgPSBibG9ja1sgMSBdLmpvaW4oJycpXG4gICAgICAgICAgYmxvY2sgPSAnICAnICsgYmxvY2sucmVwbGFjZSggL1xcbi9naSwgJ1xcbiAgJyApXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJsb2NrID0gJydcbiAgICAgICAgICBibG9ja05hbWUgPSBnZW4ubWVtb1sgcHJlYmxvY2submFtZSBdXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb3V0cHV0ID0gYmxvY2tOYW1lID09PSBudWxsID8gXG4gICAgICAgIGAgICR7dGhpcy5uYW1lfV9vdXQgPSAke2Jsb2NrfWAgOlxuICAgICAgICBgJHtibG9ja30gICR7dGhpcy5uYW1lfV9vdXQgPSAke2Jsb2NrTmFtZX1gXG4gICAgICBcbiAgICAgIGlmKCBpPT09MCApIG91dCArPSAnICdcbiAgICAgIG91dCArPSBcbmAgaWYoICR7Y29uZH0gPT09IDEgKSB7XG4ke291dHB1dH1cbiAgfWBcblxuICAgICAgaWYoICFpc0VuZEJsb2NrICkge1xuICAgICAgICBvdXQgKz0gYCBlbHNlYFxuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCArPSBgXFxuYFxuICAgICAgfVxuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgY29uZGl0aW9ucyA9IEFycmF5LmlzQXJyYXkoIGFyZ3NbMF0gKSA/IGFyZ3NbMF0gOiBhcmdzXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbmRpdGlvbnMgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidpbicsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5wYXJhbWV0ZXJzLnB1c2goIHRoaXMubmFtZSApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBuYW1lICkgPT4ge1xuICBsZXQgaW5wdXQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgaW5wdXQuaWQgICA9IGdlbi5nZXRVSUQoKVxuICBpbnB1dC5uYW1lID0gbmFtZSAhPT0gdW5kZWZpbmVkID8gbmFtZSA6IGAke2lucHV0LmJhc2VuYW1lfSR7aW5wdXQuaWR9YFxuICBpbnB1dFswXSA9IHtcbiAgICBnZW4oKSB7XG4gICAgICBpZiggISBnZW4ucGFyYW1ldGVycy5pbmNsdWRlcyggaW5wdXQubmFtZSApICkgZ2VuLnBhcmFtZXRlcnMucHVzaCggaW5wdXQubmFtZSApXG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMF0nXG4gICAgfVxuICB9XG4gIGlucHV0WzFdID0ge1xuICAgIGdlbigpIHtcbiAgICAgIGlmKCAhIGdlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5wdXNoKCBpbnB1dC5uYW1lIClcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1sxXSdcbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiBpbnB1dFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBsaWJyYXJ5ID0ge1xuICBleHBvcnQoIGRlc3RpbmF0aW9uICkge1xuICAgIGlmKCBkZXN0aW5hdGlvbiA9PT0gd2luZG93ICkge1xuICAgICAgZGVzdGluYXRpb24uc3NkID0gbGlicmFyeS5oaXN0b3J5ICAgIC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICAgICAgZGVzdGluYXRpb24uaW5wdXQgPSBsaWJyYXJ5LmluICAgICAgIC8vIGluIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG4gICAgICBkZXN0aW5hdGlvbi50ZXJuYXJ5ID0gbGlicmFyeS5zd2l0Y2ggLy8gc3dpdGNoIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5Lmhpc3RvcnlcbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LmluXG4gICAgICBkZWxldGUgbGlicmFyeS5zd2l0Y2hcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKCBkZXN0aW5hdGlvbiwgbGlicmFyeSApXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGxpYnJhcnksICdzYW1wbGVyYXRlJywge1xuICAgICAgZ2V0KCkgeyByZXR1cm4gbGlicmFyeS5nZW4uc2FtcGxlcmF0ZSB9LFxuICAgICAgc2V0KHYpIHt9XG4gICAgfSlcblxuICAgIGxpYnJhcnkuaW4gPSBkZXN0aW5hdGlvbi5pbnB1dFxuICAgIGxpYnJhcnkuaGlzdG9yeSA9IGRlc3RpbmF0aW9uLnNzZFxuICAgIGxpYnJhcnkuc3dpdGNoID0gZGVzdGluYXRpb24udGVybmFyeVxuXG4gICAgZGVzdGluYXRpb24uY2xpcCA9IGxpYnJhcnkuY2xhbXBcbiAgfSxcblxuICBnZW46ICAgICAgcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICBcbiAgYWJzOiAgICAgIHJlcXVpcmUoICcuL2Ficy5qcycgKSxcbiAgcm91bmQ6ICAgIHJlcXVpcmUoICcuL3JvdW5kLmpzJyApLFxuICBwYXJhbTogICAgcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gIGFkZDogICAgICByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gIHN1YjogICAgICByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gIG11bDogICAgICByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gIGRpdjogICAgICByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gIGFjY3VtOiAgICByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgY291bnRlcjogIHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gIHNpbjogICAgICByZXF1aXJlKCAnLi9zaW4uanMnICksXG4gIGNvczogICAgICByZXF1aXJlKCAnLi9jb3MuanMnICksXG4gIHRhbjogICAgICByZXF1aXJlKCAnLi90YW4uanMnICksXG4gIHRhbmg6ICAgICByZXF1aXJlKCAnLi90YW5oLmpzJyApLFxuICBhc2luOiAgICAgcmVxdWlyZSggJy4vYXNpbi5qcycgKSxcbiAgYWNvczogICAgIHJlcXVpcmUoICcuL2Fjb3MuanMnICksXG4gIGF0YW46ICAgICByZXF1aXJlKCAnLi9hdGFuLmpzJyApLCAgXG4gIHBoYXNvcjogICByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gIGRhdGE6ICAgICByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICBwZWVrOiAgICAgcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgY3ljbGU6ICAgIHJlcXVpcmUoICcuL2N5Y2xlLmpzJyApLFxuICBoaXN0b3J5OiAgcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgZGVsdGE6ICAgIHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICBmbG9vcjogICAgcmVxdWlyZSggJy4vZmxvb3IuanMnICksXG4gIGNlaWw6ICAgICByZXF1aXJlKCAnLi9jZWlsLmpzJyApLFxuICBtaW46ICAgICAgcmVxdWlyZSggJy4vbWluLmpzJyApLFxuICBtYXg6ICAgICAgcmVxdWlyZSggJy4vbWF4LmpzJyApLFxuICBzaWduOiAgICAgcmVxdWlyZSggJy4vc2lnbi5qcycgKSxcbiAgZGNibG9jazogIHJlcXVpcmUoICcuL2RjYmxvY2suanMnICksXG4gIG1lbW86ICAgICByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICByYXRlOiAgICAgcmVxdWlyZSggJy4vcmF0ZS5qcycgKSxcbiAgd3JhcDogICAgIHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gIG1peDogICAgICByZXF1aXJlKCAnLi9taXguanMnICksXG4gIGNsYW1wOiAgICByZXF1aXJlKCAnLi9jbGFtcC5qcycgKSxcbiAgcG9rZTogICAgIHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gIGRlbGF5OiAgICByZXF1aXJlKCAnLi9kZWxheS5qcycgKSxcbiAgZm9sZDogICAgIHJlcXVpcmUoICcuL2ZvbGQuanMnICksXG4gIG1vZCA6ICAgICByZXF1aXJlKCAnLi9tb2QuanMnICksXG4gIHNhaCA6ICAgICByZXF1aXJlKCAnLi9zYWguanMnICksXG4gIG5vaXNlOiAgICByZXF1aXJlKCAnLi9ub2lzZS5qcycgKSxcbiAgbm90OiAgICAgIHJlcXVpcmUoICcuL25vdC5qcycgKSxcbiAgZ3Q6ICAgICAgIHJlcXVpcmUoICcuL2d0LmpzJyApLFxuICBndGU6ICAgICAgcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICBsdDogICAgICAgcmVxdWlyZSggJy4vbHQuanMnICksIFxuICBsdGU6ICAgICAgcmVxdWlyZSggJy4vbHRlLmpzJyApLCBcbiAgYm9vbDogICAgIHJlcXVpcmUoICcuL2Jvb2wuanMnICksXG4gIGdhdGU6ICAgICByZXF1aXJlKCAnLi9nYXRlLmpzJyApLFxuICB0cmFpbjogICAgcmVxdWlyZSggJy4vdHJhaW4uanMnICksXG4gIHNsaWRlOiAgICByZXF1aXJlKCAnLi9zbGlkZS5qcycgKSxcbiAgaW46ICAgICAgIHJlcXVpcmUoICcuL2luLmpzJyApLFxuICB0NjA6ICAgICAgcmVxdWlyZSggJy4vdDYwLmpzJyksXG4gIG10b2Y6ICAgICByZXF1aXJlKCAnLi9tdG9mLmpzJyksXG4gIGx0cDogICAgICByZXF1aXJlKCAnLi9sdHAuanMnKSwgICAgICAgIC8vIFRPRE86IHRlc3RcbiAgZ3RwOiAgICAgIHJlcXVpcmUoICcuL2d0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBzd2l0Y2g6ICAgcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApLFxuICBtc3Rvc2FtcHM6cmVxdWlyZSggJy4vbXN0b3NhbXBzLmpzJyApLCAvLyBUT0RPOiBuZWVkcyB0ZXN0LFxuICBzZWxlY3RvcjogcmVxdWlyZSggJy4vc2VsZWN0b3IuanMnICksXG4gIHV0aWxpdGllczpyZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gIHBvdzogICAgICByZXF1aXJlKCAnLi9wb3cuanMnICksXG4gIGF0dGFjazogICByZXF1aXJlKCAnLi9hdHRhY2suanMnICksXG4gIGRlY2F5OiAgICByZXF1aXJlKCAnLi9kZWNheS5qcycgKSxcbiAgd2luZG93czogIHJlcXVpcmUoICcuL3dpbmRvd3MuanMnICksXG4gIGVudjogICAgICByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gIGFkOiAgICAgICByZXF1aXJlKCAnLi9hZC5qcycgICksXG4gIGFkc3I6ICAgICByZXF1aXJlKCAnLi9hZHNyLmpzJyApLFxuICBpZmVsc2U6ICAgcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gIGJhbmc6ICAgICByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICBhbmQ6ICAgICAgcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICBwYW46ICAgICAgcmVxdWlyZSggJy4vcGFuLmpzJyApLFxuICBlcTogICAgICAgcmVxdWlyZSggJy4vZXEuanMnICksXG4gIG5lcTogICAgICByZXF1aXJlKCAnLi9uZXEuanMnICksXG4gIGV4cDogICAgICByZXF1aXJlKCAnLi9leHAuanMnIClcbn1cblxubGlicmFyeS5nZW4ubGliID0gbGlicmFyeVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYnJhcnlcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbHQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19KSB8IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gbHQuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPD0gJHtpbnB1dHNbMV19IHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gJ2x0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoKCAke2lucHV0c1swXX0gPCAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCggaW5wdXRzWzBdIDwgaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHRwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGx0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21heCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5tYXggfSlcblxuICAgICAgb3V0ID0gYGdlbi5tYXgoICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5tYXgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1heCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtYXguaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtYXhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtZW1vJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IChpbjEsbWVtb05hbWUpID0+IHtcbiAgbGV0IG1lbW8gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBtZW1vLmlucHV0cyA9IFsgaW4xIF1cbiAgbWVtby5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIG1lbW8ubmFtZSA9IG1lbW9OYW1lICE9PSB1bmRlZmluZWQgPyBtZW1vTmFtZSArICdfJyArIGdlbi5nZXRVSUQoKSA6IGAke21lbW8uYmFzZW5hbWV9JHttZW1vLmlkfWBcblxuICByZXR1cm4gbWVtb1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21pbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5taW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5taW4oICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5taW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1pbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtaW4uaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIsIHQ9LjUgKSA9PiB7XG4gIGxldCB1Z2VuID0gbWVtbyggYWRkKCBtdWwoaW4xLCBzdWIoMSx0ICkgKSwgbXVsKCBpbjIsIHQgKSApIClcbiAgdWdlbi5uYW1lID0gJ21peCcgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IG1vZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICAgIG1vZEF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgJSB2XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9ICUgJHt2fWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnICUgJyBcbiAgICAgIH0pXG5cbiAgICAgIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIG1vZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtc3Rvc2FtcHMnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHJldHVyblZhbHVlXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lIH0gPSAke2dlbi5zYW1wbGVyYXRlfSAvIDEwMDAgKiAke2lucHV0c1swXX0gXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBnZW4uc2FtcGxlcmF0ZSAvIDEwMDAgKiB0aGlzLmlucHV0c1swXVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH0gICAgXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbXN0b3NhbXBzID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1zdG9zYW1wcy5pbnB1dHMgPSBbIHggXVxuICBtc3Rvc2FtcHMubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG1zdG9zYW1wc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J210b2YnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCggJHt0aGlzLnR1bmluZ30gKiBnZW4uZXhwKCAuMDU3NzYyMjY1ICogKCR7aW5wdXRzWzBdfSAtIDY5KSApIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gdGhpcy50dW5pbmcgKiBNYXRoLmV4cCggLjA1Nzc2MjI2NSAqICggaW5wdXRzWzBdIC0gNjkpIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCBwcm9wcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IHR1bmluZzo0NDAgfVxuICBcbiAgaWYoIHByb3BzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBwcm9wcy5kZWZhdWx0cyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgZGVmYXVsdHMgKVxuICB1Z2VuLmlucHV0cyA9IFsgeCBdXG4gIFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6ICdtdWwnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCxcbiAgICAgICAgc3VtID0gMSwgbnVtQ291bnQgPSAwLCBtdWxBdEVuZCA9IGZhbHNlLCBhbHJlYWR5RnVsbFN1bW1lZCA9IHRydWVcblxuICAgIGlucHV0cy5mb3JFYWNoKCAodixpKSA9PiB7XG4gICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgaWYoIGkgPCBpbnB1dHMubGVuZ3RoIC0xICkge1xuICAgICAgICAgIG11bEF0RW5kID0gdHJ1ZVxuICAgICAgICAgIG91dCArPSAnICogJ1xuICAgICAgICB9XG4gICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gZmFsc2VcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggaSA9PT0gMCApIHtcbiAgICAgICAgICBzdW0gPSB2XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHN1bSAqPSBwYXJzZUZsb2F0KCB2IClcbiAgICAgICAgfVxuICAgICAgICBudW1Db3VudCsrXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmKCBudW1Db3VudCA+IDAgKSB7XG4gICAgICBvdXQgKz0gbXVsQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBzdW0gOiAnICogJyArIHN1bVxuICAgIH1cblxuICAgIG91dCArPSAnXFxuJ1xuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGNvbnN0IG11bCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIG11bCwge1xuICAgICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgICBpbnB1dHM6IGFyZ3MsXG4gIH0pXG4gIFxuICBtdWwubmFtZSA9IG11bC5iYXNlbmFtZSArIG11bC5pZFxuXG4gIHJldHVybiBtdWxcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J25lcScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gLyp0aGlzLmlucHV0c1swXSAhPT0gdGhpcy5pbnB1dHNbMV0gPyAxIDoqLyBgICB2YXIgJHt0aGlzLm5hbWV9ID0gKCR7aW5wdXRzWzBdfSAhPT0gJHtpbnB1dHNbMV19KSB8IDBcXG5cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidub2lzZScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXRcblxuICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnbm9pc2UnIDogTWF0aC5yYW5kb20gfSlcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBnZW4ubm9pc2UoKVxcbmBcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbm9pc2UgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIG5vaXNlLm5hbWUgPSBwcm90by5uYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG5vaXNlXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonbm90JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgKSB7XG4gICAgICBvdXQgPSBgKCAke2lucHV0c1swXX0gPT09IDAgPyAxIDogMCApYFxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSAhaW5wdXRzWzBdID09PSAwID8gMSA6IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub3QgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbm90LmlucHV0cyA9IFsgeCBdXG5cbiAgcmV0dXJuIG5vdFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwYW4nLCBcbiAgaW5pdFRhYmxlKCkgeyAgICBcbiAgICBsZXQgYnVmZmVyTCA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKSxcbiAgICAgICAgYnVmZmVyUiA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgY29uc3QgYW5nVG9SYWQgPSBNYXRoLlBJIC8gMTgwXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxMDI0OyBpKysgKSB7IFxuICAgICAgbGV0IHBhbiA9IGkgKiAoIDkwIC8gMTAyNCApXG4gICAgICBidWZmZXJMW2ldID0gTWF0aC5jb3MoIHBhbiAqIGFuZ1RvUmFkICkgXG4gICAgICBidWZmZXJSW2ldID0gTWF0aC5zaW4oIHBhbiAqIGFuZ1RvUmFkIClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5wYW5MID0gZGF0YSggYnVmZmVyTCwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9KVxuICAgIGdlbi5nbG9iYWxzLnBhblIgPSBkYXRhKCBidWZmZXJSLCAxLCB7IGltbXV0YWJsZTp0cnVlIH0pXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggbGVmdElucHV0LCByaWdodElucHV0LCBwYW4gPS41LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBpZiggZ2VuLmdsb2JhbHMucGFuTCA9PT0gdW5kZWZpbmVkICkgcHJvdG8uaW5pdFRhYmxlKClcblxuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgbGVmdElucHV0LCByaWdodElucHV0IF0sXG4gICAgbGVmdDogICAgbXVsKCBsZWZ0SW5wdXQsIHBlZWsoIGdlbi5nbG9iYWxzLnBhbkwsIHBhbiwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSApLFxuICAgIHJpZ2h0OiAgIG11bCggcmlnaHRJbnB1dCwgcGVlayggZ2VuLmdsb2JhbHMucGFuUiwgcGFuLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pIClcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOiAncGFyYW0nLFxuXG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGdlbi5wYXJhbXMuYWRkKHsgW3RoaXMubmFtZV06IHRoaXMgfSlcblxuICAgIHRoaXMudmFsdWUgPSB0aGlzLmluaXRpYWxWYWx1ZVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYFxuXG4gICAgcmV0dXJuIGdlbi5tZW1vWyB0aGlzLm5hbWUgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggcHJvcE5hbWU9MCwgdmFsdWU9MCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBpZiggdHlwZW9mIHByb3BOYW1lICE9PSAnc3RyaW5nJyApIHtcbiAgICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSBwcm9wTmFtZVxuICB9ZWxzZXtcbiAgICB1Z2VuLm5hbWUgPSBwcm9wTmFtZVxuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gdmFsdWVcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgICBkYXRhVWdlbiA9IHJlcXVpcmUoJy4vZGF0YS5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BlZWsnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQsIGZ1bmN0aW9uQm9keSwgbmV4dCwgbGVuZ3RoSXNMb2cyLCBpZHhcbiAgICBcbiAgICBpZHggPSBpbnB1dHNbMV1cbiAgICBsZW5ndGhJc0xvZzIgPSAoTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApIHwgMCkgID09PSBNYXRoLmxvZzIoIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIClcblxuICAgIGlmKCB0aGlzLm1vZGUgIT09ICdzaW1wbGUnICkge1xuXG4gICAgZnVuY3Rpb25Cb2R5ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9kYXRhSWR4ICA9ICR7aWR4fSwgXG4gICAgICAke3RoaXMubmFtZX1fcGhhc2UgPSAke3RoaXMubW9kZSA9PT0gJ3NhbXBsZXMnID8gaW5wdXRzWzBdIDogaW5wdXRzWzBdICsgJyAqICcgKyAodGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxKSB9LCBcbiAgICAgICR7dGhpcy5uYW1lfV9pbmRleCA9ICR7dGhpcy5uYW1lfV9waGFzZSB8IDAsXFxuYFxuXG4gICAgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnd3JhcCcgKSB7XG4gICAgICBuZXh0ID0gbGVuZ3RoSXNMb2cyID9cbiAgICAgIGAoICR7dGhpcy5uYW1lfV9pbmRleCArIDEgKSAmICgke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSAtIDEpYCA6XG4gICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSA/ICR7dGhpcy5uYW1lfV9pbmRleCArIDEgLSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RofSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfWVsc2UgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnY2xhbXAnICkge1xuICAgICAgbmV4dCA9IFxuICAgICAgICBgJHt0aGlzLm5hbWV9X2luZGV4ICsgMSA+PSAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gPyAke3RoaXMuZGF0YS5idWZmZXIubGVuZ3RoIC0gMX0gOiAke3RoaXMubmFtZX1faW5kZXggKyAxYFxuICAgIH0gZWxzZSBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdmb2xkJyB8fCB0aGlzLmJvdW5kbW9kZSA9PT0gJ21pcnJvcicgKSB7XG4gICAgICBuZXh0ID0gXG4gICAgICAgIGAke3RoaXMubmFtZX1faW5kZXggKyAxID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA/ICR7dGhpcy5uYW1lfV9pbmRleCAtICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSA6ICR7dGhpcy5uYW1lfV9pbmRleCArIDFgXG4gICAgfWVsc2V7XG4gICAgICAgbmV4dCA9IFxuICAgICAgYCR7dGhpcy5uYW1lfV9pbmRleCArIDFgICAgICBcbiAgICB9XG5cbiAgICBpZiggdGhpcy5pbnRlcnAgPT09ICdsaW5lYXInICkgeyAgICAgIFxuICAgIGZ1bmN0aW9uQm9keSArPSBgICAgICAgJHt0aGlzLm5hbWV9X2ZyYWMgID0gJHt0aGlzLm5hbWV9X3BoYXNlIC0gJHt0aGlzLm5hbWV9X2luZGV4LFxuICAgICAgJHt0aGlzLm5hbWV9X2Jhc2UgID0gbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICAke3RoaXMubmFtZX1faW5kZXggXSxcbiAgICAgICR7dGhpcy5uYW1lfV9uZXh0ICA9ICR7bmV4dH0sYFxuICAgICAgXG4gICAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdpZ25vcmUnICkge1xuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gYFxuICAgICAgJHt0aGlzLm5hbWV9X291dCAgID0gJHt0aGlzLm5hbWV9X2luZGV4ID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSB8fCAke3RoaXMubmFtZX1faW5kZXggPCAwID8gMCA6ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoIG1lbW9yeVsgJHt0aGlzLm5hbWV9X2RhdGFJZHggKyAke3RoaXMubmFtZX1fbmV4dCBdIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKVxcblxcbmBcbiAgICAgIH1lbHNle1xuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gYFxuICAgICAgJHt0aGlzLm5hbWV9X291dCAgID0gJHt0aGlzLm5hbWV9X2Jhc2UgKyAke3RoaXMubmFtZX1fZnJhYyAqICggbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9uZXh0IF0gLSAke3RoaXMubmFtZX1fYmFzZSApXFxuXFxuYFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgZnVuY3Rpb25Cb2R5ICs9IGAgICAgICAke3RoaXMubmFtZX1fb3V0ID0gbWVtb3J5WyAke3RoaXMubmFtZX1fZGF0YUlkeCArICR7dGhpcy5uYW1lfV9pbmRleCBdXFxuXFxuYFxuICAgIH1cblxuICAgIH0gZWxzZSB7IC8vIG1vZGUgaXMgc2ltcGxlXG4gICAgICBmdW5jdGlvbkJvZHkgPSBgbWVtb3J5WyAke2lkeH0gKyAkeyBpbnB1dHNbMF0gfSBdYFxuICAgICAgXG4gICAgICByZXR1cm4gZnVuY3Rpb25Cb2R5XG4gICAgfVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ19vdXQnXG5cbiAgICByZXR1cm4gWyB0aGlzLm5hbWUrJ19vdXQnLCBmdW5jdGlvbkJvZHkgXVxuICB9LFxuXG4gIGRlZmF1bHRzIDogeyBjaGFubmVsczoxLCBtb2RlOidwaGFzZScsIGludGVycDonbGluZWFyJywgYm91bmRtb2RlOid3cmFwJyB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbnB1dF9kYXRhLCBpbmRleD0wLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICAvL2NvbnNvbGUubG9nKCBkYXRhVWdlbiwgZ2VuLmRhdGEgKVxuXG4gIC8vIFhYWCB3aHkgaXMgZGF0YVVnZW4gbm90IHRoZSBhY3R1YWwgZnVuY3Rpb24/IHNvbWUgdHlwZSBvZiBicm93c2VyaWZ5IG5vbnNlbnNlLi4uXG4gIGNvbnN0IGZpbmFsRGF0YSA9IHR5cGVvZiBpbnB1dF9kYXRhLmJhc2VuYW1lID09PSAndW5kZWZpbmVkJyA/IGdlbi5saWIuZGF0YSggaW5wdXRfZGF0YSApIDogaW5wdXRfZGF0YVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIFxuICAgIHsgXG4gICAgICAnZGF0YSc6ICAgICBmaW5hbERhdGEsXG4gICAgICBkYXRhTmFtZTogICBmaW5hbERhdGEubmFtZSxcbiAgICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICAgIGlucHV0czogICAgIFsgaW5kZXgsIGZpbmFsRGF0YSBdLFxuICAgIH0sXG4gICAgcHJvdG8uZGVmYXVsdHMsXG4gICAgcHJvcGVydGllcyBcbiAgKVxuICBcbiAgdWdlbi5uYW1lID0gdWdlbi5iYXNlbmFtZSArIHVnZW4udWlkXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgYWNjdW0gPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBtdWwgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwcm90byA9IHsgYmFzZW5hbWU6J3BoYXNvcicgfSxcbiAgICBkaXYgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKVxuXG5jb25zdCBkZWZhdWx0cyA9IHsgbWluOiAtMSwgbWF4OiAxIH1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGZyZXF1ZW5jeSA9IDEsIHJlc2V0ID0gMCwgX3Byb3BzICkgPT4ge1xuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oIHt9LCBkZWZhdWx0cywgX3Byb3BzIClcblxuICBjb25zdCByYW5nZSA9IHByb3BzLm1heCAtIHByb3BzLm1pblxuXG4gIGNvbnN0IHVnZW4gPSB0eXBlb2YgZnJlcXVlbmN5ID09PSAnbnVtYmVyJyBcbiAgICA/IGFjY3VtKCAoZnJlcXVlbmN5ICogcmFuZ2UpIC8gZ2VuLnNhbXBsZXJhdGUsIHJlc2V0LCBwcm9wcyApIFxuICAgIDogYWNjdW0oIFxuICAgICAgICBkaXYoIFxuICAgICAgICAgIG11bCggZnJlcXVlbmN5LCByYW5nZSApLFxuICAgICAgICAgIGdlbi5zYW1wbGVyYXRlXG4gICAgICAgICksIFxuICAgICAgICByZXNldCwgcHJvcHMgXG4gICAgKVxuXG4gIHVnZW4ubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJyksXG4gICAgbXVsICA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgd3JhcCA9IHJlcXVpcmUoJy4vd3JhcC5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Bva2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZGF0YU5hbWUgPSAnbWVtb3J5JyxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBpZHgsIG91dCwgd3JhcHBlZFxuICAgIFxuICAgIGlkeCA9IHRoaXMuZGF0YS5nZW4oKVxuXG4gICAgLy9nZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIC8vd3JhcHBlZCA9IHdyYXAoIHRoaXMuaW5wdXRzWzFdLCAwLCB0aGlzLmRhdGFMZW5ndGggKS5nZW4oKVxuICAgIC8vaWR4ID0gd3JhcHBlZFswXVxuICAgIC8vZ2VuLmZ1bmN0aW9uQm9keSArPSB3cmFwcGVkWzFdXG4gICAgbGV0IG91dHB1dFN0ciA9IHRoaXMuaW5wdXRzWzFdID09PSAwID9cbiAgICAgIGAgICR7ZGF0YU5hbWV9WyAke2lkeH0gXSA9ICR7aW5wdXRzWzBdfVxcbmAgOlxuICAgICAgYCAgJHtkYXRhTmFtZX1bICR7aWR4fSArICR7aW5wdXRzWzFdfSBdID0gJHtpbnB1dHNbMF19XFxuYFxuXG4gICAgaWYoIHRoaXMuaW5saW5lID09PSB1bmRlZmluZWQgKSB7XG4gICAgICBnZW4uZnVuY3Rpb25Cb2R5ICs9IG91dHB1dFN0clxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIFsgdGhpcy5pbmxpbmUsIG91dHB1dFN0ciBdXG4gICAgfVxuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9ICggZGF0YSwgdmFsdWUsIGluZGV4LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6MSB9IFxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBkYXRhLFxuICAgIGRhdGFOYW1lOiAgIGRhdGEubmFtZSxcbiAgICBkYXRhTGVuZ3RoOiBkYXRhLmJ1ZmZlci5sZW5ndGgsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgdmFsdWUsIGluZGV4IF0sXG4gIH0sXG4gIGRlZmF1bHRzIClcblxuXG4gIHVnZW4ubmFtZSA9IHVnZW4uYmFzZW5hbWUgKyB1Z2VuLnVpZFxuICBcbiAgZ2VuLmhpc3Rvcmllcy5zZXQoIHVnZW4ubmFtZSwgdWdlbiApXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZToncG93JyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3Bvdyc6IE1hdGgucG93IH0pXG5cbiAgICAgIG91dCA9IGBnZW4ucG93KCAke2lucHV0c1swXX0sICR7aW5wdXRzWzFdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiggdHlwZW9mIGlucHV0c1swXSA9PT0gJ3N0cmluZycgJiYgaW5wdXRzWzBdWzBdID09PSAnKCcgKSB7XG4gICAgICAgIGlucHV0c1swXSA9IGlucHV0c1swXS5zbGljZSgxLC0xKVxuICAgICAgfVxuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMV0gPT09ICdzdHJpbmcnICYmIGlucHV0c1sxXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMV0gPSBpbnB1dHNbMV0uc2xpY2UoMSwtMSlcbiAgICAgIH1cblxuICAgICAgb3V0ID0gTWF0aC5wb3coIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0pIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgcG93ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHBvdy5pbnB1dHMgPSBbIHgseSBdXG4gIHBvdy5pZCA9IGdlbi5nZXRVSUQoKVxuICBwb3cubmFtZSA9IGAke3Bvdy5iYXNlbmFtZX17cG93LmlkfWBcblxuICByZXR1cm4gcG93XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBhZGQgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgbWVtbyAgICA9IHJlcXVpcmUoICcuL21lbW8uanMnICksXG4gICAgZGVsdGEgICA9IHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICAgIHdyYXAgICAgPSByZXF1aXJlKCAnLi93cmFwLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3JhdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBwaGFzZSAgPSBoaXN0b3J5KCksXG4gICAgICAgIGluTWludXMxID0gaGlzdG9yeSgpLFxuICAgICAgICBnZW5OYW1lID0gJ2dlbi4nICsgdGhpcy5uYW1lLFxuICAgICAgICBmaWx0ZXIsIHN1bSwgb3V0XG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIG91dCA9IFxuYCB2YXIgJHt0aGlzLm5hbWV9X2RpZmYgPSAke2lucHV0c1swXX0gLSAke2dlbk5hbWV9Lmxhc3RTYW1wbGVcbiAgaWYoICR7dGhpcy5uYW1lfV9kaWZmIDwgLS41ICkgJHt0aGlzLm5hbWV9X2RpZmYgKz0gMVxuICAke2dlbk5hbWV9LnBoYXNlICs9ICR7dGhpcy5uYW1lfV9kaWZmICogJHtpbnB1dHNbMV19XG4gIGlmKCAke2dlbk5hbWV9LnBoYXNlID4gMSApICR7Z2VuTmFtZX0ucGhhc2UgLT0gMVxuICAke2dlbk5hbWV9Lmxhc3RTYW1wbGUgPSAke2lucHV0c1swXX1cbmBcbiAgICBvdXQgPSAnICcgKyBvdXRcblxuICAgIHJldHVybiBbIGdlbk5hbWUgKyAnLnBoYXNlJywgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCByYXRlICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHBoYXNlOiAgICAgIDAsXG4gICAgbGFzdFNhbXBsZTogMCxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbjEsIHJhdGUgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidyb3VuZCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLnJvdW5kIH0pXG5cbiAgICAgIG91dCA9IGBnZW4ucm91bmQoICR7aW5wdXRzWzBdfSApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgucm91bmQoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCByb3VuZCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICByb3VuZC5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiByb3VuZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3NhaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSAwXG4gICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lICsgJ19jb250cm9sJyBdID0gMFxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuXG4gICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX1fY29udHJvbCA9IG1lbW9yeVske3RoaXMubWVtb3J5LmNvbnRyb2wuaWR4fV0sXG4gICAgICAke3RoaXMubmFtZX1fdHJpZ2dlciA9ICR7aW5wdXRzWzFdfSA+ICR7aW5wdXRzWzJdfSA/IDEgOiAwXG5cbiAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyICE9PSAke3RoaXMubmFtZX1fY29udHJvbCAgKSB7XG4gICAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyID09PSAxICkgXG4gICAgICBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XSA9ICR7aW5wdXRzWzBdfVxuICAgIFxuICAgIG1lbW9yeVske3RoaXMubWVtb3J5LmNvbnRyb2wuaWR4fV0gPSAke3RoaXMubmFtZX1fdHJpZ2dlclxuICB9XG5gXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWBcblxuICAgIHJldHVybiBbIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9XWAsICcgJyArb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBjb250cm9sLCB0aHJlc2hvbGQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXQ6MCB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCBjb250cm9sLHRocmVzaG9sZCBdLFxuICAgIG1lbW9yeToge1xuICAgICAgY29udHJvbDogeyBpZHg6bnVsbCwgbGVuZ3RoOjEgfSxcbiAgICAgIHZhbHVlOiAgIHsgaWR4Om51bGwsIGxlbmd0aDoxIH0sXG4gICAgfVxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzZWxlY3RvcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dCwgcmV0dXJuVmFsdWUgPSAwXG4gICAgXG4gICAgc3dpdGNoKCBpbnB1dHMubGVuZ3RoICkge1xuICAgICAgY2FzZSAyIDpcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBpbnB1dHNbMV1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDMgOlxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcblxcbmA7XG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsIG91dCBdXG4gICAgICAgIGJyZWFrOyAgXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAwXG4gIHN3aXRjaCggJHtpbnB1dHNbMF19ICsgMSApIHtcXG5gXG5cbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICBvdXQgKz1gICAgIGNhc2UgJHtpfTogJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzW2ldfTsgYnJlYWs7XFxuYCBcbiAgICAgICAgfVxuXG4gICAgICAgIG91dCArPSAnICB9XFxuXFxuJ1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSArICdfb3V0JywgJyAnICsgb3V0IF1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uaW5wdXRzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonc2lnbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLnNpZ24gfSlcblxuICAgICAgb3V0ID0gYGdlbi5zaWduKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpZ24oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBzaWduID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpZ24uaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gc2lnblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdzaW4nOiBNYXRoLnNpbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnNpbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpbi5pbnB1dHMgPSBbIHggXVxuICBzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgc2luLm5hbWUgPSBgJHtzaW4uYmFzZW5hbWV9e3Npbi5pZH1gXG5cbiAgcmV0dXJuIHNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGd0ICAgICAgPSByZXF1aXJlKCAnLi9ndC5qcycgKSxcbiAgICBkaXYgICAgID0gcmVxdWlyZSggJy4vZGl2LmpzJyApLFxuICAgIF9zd2l0Y2ggPSByZXF1aXJlKCAnLi9zd2l0Y2guanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgc2xpZGVVcCA9IDEsIHNsaWRlRG93biA9IDEgKSA9PiB7XG4gIGxldCB5MSA9IGhpc3RvcnkoMCksXG4gICAgICBmaWx0ZXIsIHNsaWRlQW1vdW50XG5cbiAgLy95IChuKSA9IHkgKG4tMSkgKyAoKHggKG4pIC0geSAobi0xKSkvc2xpZGUpIFxuICBzbGlkZUFtb3VudCA9IF9zd2l0Y2goIGd0KGluMSx5MS5vdXQpLCBzbGlkZVVwLCBzbGlkZURvd24gKVxuXG4gIGZpbHRlciA9IG1lbW8oIGFkZCggeTEub3V0LCBkaXYoIHN1YiggaW4xLCB5MS5vdXQgKSwgc2xpZGVBbW91bnQgKSApIClcblxuICB5MS5pbiggZmlsdGVyIClcblxuICByZXR1cm4gZmlsdGVyXG59XG4iLCIndXNlIHN0cmljdCdcblxuY29uc3QgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5jb25zdCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3N1YicsXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQ9MCxcbiAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgIG5lZWRzUGFyZW5zID0gZmFsc2UsIFxuICAgICAgICBudW1Db3VudCA9IDAsXG4gICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICBzdWJBdEVuZCA9IGZhbHNlLFxuICAgICAgICBoYXNVZ2VucyA9IGZhbHNlLFxuICAgICAgICByZXR1cm5WYWx1ZSA9IDBcblxuICAgIHRoaXMuaW5wdXRzLmZvckVhY2goIHZhbHVlID0+IHsgaWYoIGlzTmFOKCB2YWx1ZSApICkgaGFzVWdlbnMgPSB0cnVlIH0pXG5cbiAgICBvdXQgPSAnICB2YXIgJyArIHRoaXMubmFtZSArICcgPSAnXG5cbiAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgbGV0IGlzTnVtYmVyVWdlbiA9IGlzTmFOKCB2ICksXG4gICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgIGxhc3ROdW1iZXIgPSBsYXN0TnVtYmVyIC0gdlxuICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICByZXR1cm5cbiAgICAgIH1lbHNle1xuICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC0gJHt2fWBcbiAgICAgIH1cblxuICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgIH0pXG5cbiAgICBvdXQgKz0gJ1xcbidcblxuICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGxldCBzdWIgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggc3ViLCB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzXG4gIH0pXG4gICAgICAgXG4gIHN1Yi5uYW1lID0gJ3N1YicgKyBzdWIuaWRcblxuICByZXR1cm4gc3ViXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzd2l0Y2gnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIGlmKCBpbnB1dHNbMV0gPT09IGlucHV0c1syXSApIHJldHVybiBpbnB1dHNbMV0gLy8gaWYgYm90aCBwb3RlbnRpYWwgb3V0cHV0cyBhcmUgdGhlIHNhbWUganVzdCByZXR1cm4gb25lIG9mIHRoZW1cbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBjb250cm9sLCBpbjEgPSAxLCBpbjIgPSAwICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbnRyb2wsIGluMSwgaW4yIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3Q2MCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcmV0dXJuVmFsdWVcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyAnZXhwJyBdOiBNYXRoLmV4cCB9KVxuXG4gICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gZ2VuLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gJHtpbnB1dHNbMF19IClcXG5cXG5gXG4gICAgIFxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gb3V0XG4gICAgICBcbiAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUsIG91dCBdXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguZXhwKCAtNi45MDc3NTUyNzg5MjEgLyBpbnB1dHNbMF0gKVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH0gICAgXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdDYwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHQ2MC5pbnB1dHMgPSBbIHggXVxuICB0NjAubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIHQ2MFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0YW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICd0YW4nOiBNYXRoLnRhbiB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnRhbiggJHtpbnB1dHNbMF19IClgIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGgudGFuKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbi5pbnB1dHMgPSBbIHggXVxuICB0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgdGFuLm5hbWUgPSBgJHt0YW4uYmFzZW5hbWV9e3Rhbi5pZH1gXG5cbiAgcmV0dXJuIHRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0YW5oJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAndGFuaCc6IE1hdGgudGFuaCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnRhbmgoICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbmgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCB0YW5oID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbmguaW5wdXRzID0gWyB4IF1cbiAgdGFuaC5pZCA9IGdlbi5nZXRVSUQoKVxuICB0YW5oLm5hbWUgPSBgJHt0YW5oLmJhc2VuYW1lfXt0YW5oLmlkfWBcblxuICByZXR1cm4gdGFuaFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGx0ICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBhY2N1bSAgID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgZGl2ICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZnJlcXVlbmN5PTQ0MCwgcHVsc2V3aWR0aD0uNSApID0+IHtcbiAgbGV0IGdyYXBoID0gbHQoIGFjY3VtKCBkaXYoIGZyZXF1ZW5jeSwgNDQxMDAgKSApLCBwdWxzZXdpZHRoIClcblxuICBncmFwaC5uYW1lID0gYHRyYWluJHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiBncmFwaFxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKVxuXG5sZXQgaXNTdGVyZW8gPSBmYWxzZVxuXG5sZXQgdXRpbGl0aWVzID0ge1xuICBjdHg6IG51bGwsXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9ICgpID0+IDBcbiAgICB0aGlzLmNsZWFyLmNhbGxiYWNrcy5mb3JFYWNoKCB2ID0+IHYoKSApXG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MubGVuZ3RoID0gMFxuICB9LFxuXG4gIGNyZWF0ZUNvbnRleHQoKSB7XG4gICAgbGV0IEFDID0gdHlwZW9mIEF1ZGlvQ29udGV4dCA9PT0gJ3VuZGVmaW5lZCcgPyB3ZWJraXRBdWRpb0NvbnRleHQgOiBBdWRpb0NvbnRleHRcbiAgICB0aGlzLmN0eCA9IG5ldyBBQygpXG5cbiAgICBnZW4uc2FtcGxlcmF0ZSA9IHRoaXMuY3R4LnNhbXBsZVJhdGVcblxuICAgIGxldCBzdGFydCA9ICgpID0+IHtcbiAgICAgIGlmKCB0eXBlb2YgQUMgIT09ICd1bmRlZmluZWQnICkge1xuICAgICAgICBpZiggZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICYmICdvbnRvdWNoc3RhcnQnIGluIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG5cbiAgICAgICAgICBpZiggJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkgeyAvLyByZXF1aXJlZCB0byBzdGFydCBhdWRpbyB1bmRlciBpT1MgNlxuICAgICAgICAgICAgIGxldCBteVNvdXJjZSA9IHV0aWxpdGllcy5jdHguY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgICAgICAgICBteVNvdXJjZS5jb25uZWN0KCB1dGlsaXRpZXMuY3R4LmRlc3RpbmF0aW9uIClcbiAgICAgICAgICAgICBteVNvdXJjZS5ub3RlT24oIDAgKVxuICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICBjcmVhdGVTY3JpcHRQcm9jZXNzb3IoKSB7XG4gICAgdGhpcy5ub2RlID0gdGhpcy5jdHguY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCAxMDI0LCAwLCAyIClcbiAgICB0aGlzLmNsZWFyRnVuY3Rpb24gPSBmdW5jdGlvbigpIHsgcmV0dXJuIDAgfVxuICAgIGlmKCB0eXBlb2YgdGhpcy5jYWxsYmFjayA9PT0gJ3VuZGVmaW5lZCcgKSB0aGlzLmNhbGxiYWNrID0gdGhpcy5jbGVhckZ1bmN0aW9uXG5cbiAgICB0aGlzLm5vZGUub25hdWRpb3Byb2Nlc3MgPSBmdW5jdGlvbiggYXVkaW9Qcm9jZXNzaW5nRXZlbnQgKSB7XG4gICAgICB2YXIgb3V0cHV0QnVmZmVyID0gYXVkaW9Qcm9jZXNzaW5nRXZlbnQub3V0cHV0QnVmZmVyO1xuXG4gICAgICB2YXIgbGVmdCA9IG91dHB1dEJ1ZmZlci5nZXRDaGFubmVsRGF0YSggMCApLFxuICAgICAgICAgIHJpZ2h0PSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDEgKSxcbiAgICAgICAgICBpc1N0ZXJlbyA9IHV0aWxpdGllcy5pc1N0ZXJlb1xuXG4gICAgIGZvciggdmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGxlZnQubGVuZ3RoOyBzYW1wbGUrKyApIHtcbiAgICAgICAgdmFyIG91dCA9IHV0aWxpdGllcy5jYWxsYmFjaygpXG5cbiAgICAgICAgaWYoIGlzU3RlcmVvID09PSBmYWxzZSApIHtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgXSA9IHJpZ2h0WyBzYW1wbGUgXSA9IG91dCBcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgbGVmdFsgc2FtcGxlICBdID0gb3V0WzBdXG4gICAgICAgICAgcmlnaHRbIHNhbXBsZSBdID0gb3V0WzFdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm5vZGUuY29ubmVjdCggdGhpcy5jdHguZGVzdGluYXRpb24gKVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcbiAgXG4gIHBsYXlHcmFwaCggZ3JhcGgsIGRlYnVnLCBtZW09NDQxMDAqMTAsIG1lbVR5cGU9RmxvYXQzMkFycmF5ICkge1xuICAgIHV0aWxpdGllcy5jbGVhcigpXG4gICAgaWYoIGRlYnVnID09PSB1bmRlZmluZWQgKSBkZWJ1ZyA9IGZhbHNlXG4gICAgICAgICAgXG4gICAgdGhpcy5pc1N0ZXJlbyA9IEFycmF5LmlzQXJyYXkoIGdyYXBoIClcblxuICAgIHV0aWxpdGllcy5jYWxsYmFjayA9IGdlbi5jcmVhdGVDYWxsYmFjayggZ3JhcGgsIG1lbSwgZGVidWcsIGZhbHNlLCBtZW1UeXBlIClcbiAgICBcbiAgICBpZiggdXRpbGl0aWVzLmNvbnNvbGUgKSB1dGlsaXRpZXMuY29uc29sZS5zZXRWYWx1ZSggdXRpbGl0aWVzLmNhbGxiYWNrLnRvU3RyaW5nKCkgKVxuXG4gICAgcmV0dXJuIHV0aWxpdGllcy5jYWxsYmFja1xuICB9LFxuXG4gIGxvYWRTYW1wbGUoIHNvdW5kRmlsZVBhdGgsIGRhdGEgKSB7XG4gICAgbGV0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgcmVxLm9wZW4oICdHRVQnLCBzb3VuZEZpbGVQYXRoLCB0cnVlIClcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJyBcbiAgICBcbiAgICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSxyZWplY3QpID0+IHtcbiAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGF1ZGlvRGF0YSA9IHJlcS5yZXNwb25zZVxuXG4gICAgICAgIHV0aWxpdGllcy5jdHguZGVjb2RlQXVkaW9EYXRhKCBhdWRpb0RhdGEsIChidWZmZXIpID0+IHtcbiAgICAgICAgICBkYXRhLmJ1ZmZlciA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKVxuICAgICAgICAgIHJlc29sdmUoIGRhdGEuYnVmZmVyIClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmVxLnNlbmQoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG59XG5cbnV0aWxpdGllcy5jbGVhci5jYWxsYmFja3MgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxpdGllc1xuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qXG4gKiBtYW55IHdpbmRvd3MgaGVyZSBhZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2NvcmJhbmJyb29rL2RzcC5qcy9ibG9iL21hc3Rlci9kc3AuanNcbiAqIHN0YXJ0aW5nIGF0IGxpbmUgMTQyN1xuICogdGFrZW4gOC8xNS8xNlxuKi8gXG5cbmNvbnN0IHdpbmRvd3MgPSBtb2R1bGUuZXhwb3J0cyA9IHsgXG4gIGJhcnRsZXR0KCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAyIC8gKGxlbmd0aCAtIDEpICogKChsZW5ndGggLSAxKSAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKSBcbiAgfSxcblxuICBiYXJ0bGV0dEhhbm4oIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNjIgLSAwLjQ4ICogTWF0aC5hYnMoaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAwLjUpIC0gMC4zOCAqIE1hdGguY29zKCAyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGJsYWNrbWFuKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICBsZXQgYTAgPSAoMSAtIGFscGhhKSAvIDIsXG4gICAgICAgIGExID0gMC41LFxuICAgICAgICBhMiA9IGFscGhhIC8gMlxuXG4gICAgcmV0dXJuIGEwIC0gYTEgKiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSArIGEyICogTWF0aC5jb3MoNCAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBjb3NpbmUoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIE1hdGguY29zKE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIE1hdGguUEkgLyAyKVxuICB9LFxuXG4gIGdhdXNzKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICByZXR1cm4gTWF0aC5wb3coTWF0aC5FLCAtMC41ICogTWF0aC5wb3coKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikgLyAoYWxwaGEgKiAobGVuZ3RoIC0gMSkgLyAyKSwgMikpXG4gIH0sXG5cbiAgaGFtbWluZyggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC41NCAtIDAuNDYgKiBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBoYW5uKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjUgKiAoMSAtIE1hdGguY29zKCBNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSApXG4gIH0sXG5cbiAgbGFuY3pvcyggbGVuZ3RoLCBpbmRleCApIHtcbiAgICBsZXQgeCA9IDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIDE7XG4gICAgcmV0dXJuIE1hdGguc2luKE1hdGguUEkgKiB4KSAvIChNYXRoLlBJICogeClcbiAgfSxcblxuICByZWN0YW5ndWxhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMVxuICB9LFxuXG4gIHRyaWFuZ3VsYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDIgLyBsZW5ndGggKiAobGVuZ3RoIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpXG4gIH0sXG5cbiAgLy8gcGFyYWJvbGFcbiAgd2VsY2goIGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0PTAgKSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgY29uc3QgaW5kZXggPSBzaGlmdCA9PT0gMCA/IF9pbmRleCA6IChfaW5kZXggKyBNYXRoLmZsb29yKCBzaGlmdCAqIGxlbmd0aCApKSAlIGxlbmd0aFxuICAgIGNvbnN0IG5fMV9vdmVyMiA9IChsZW5ndGggLSAxKSAvIDIgXG5cbiAgICByZXR1cm4gMSAtIE1hdGgucG93KCAoIGluZGV4IC0gbl8xX292ZXIyICkgLyBuXzFfb3ZlcjIsIDIgKVxuICB9LFxuICBpbnZlcnNld2VsY2goIGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0PTAgKSB7XG4gICAgLy93W25dID0gMSAtIE1hdGgucG93KCAoIG4gLSAoIChOLTEpIC8gMiApICkgLyAoKCBOLTEgKSAvIDIgKSwgMiApXG4gICAgbGV0IGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vciggc2hpZnQgKiBsZW5ndGggKSkgJSBsZW5ndGhcbiAgICBjb25zdCBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyXG5cbiAgICByZXR1cm4gTWF0aC5wb3coICggaW5kZXggLSBuXzFfb3ZlcjIgKSAvIG5fMV9vdmVyMiwgMiApXG4gIH0sXG5cbiAgcGFyYWJvbGEoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgaWYoIGluZGV4IDw9IGxlbmd0aCAvIDIgKSB7XG4gICAgICByZXR1cm4gd2luZG93cy5pbnZlcnNld2VsY2goIGxlbmd0aCAvIDIsIGluZGV4ICkgLSAxXG4gICAgfWVsc2V7XG4gICAgICByZXR1cm4gMSAtIHdpbmRvd3MuaW52ZXJzZXdlbGNoKCBsZW5ndGggLyAyLCBpbmRleCAtIGxlbmd0aCAvIDIgKVxuICAgIH1cbiAgfSxcblxuICBleHBvbmVudGlhbCggbGVuZ3RoLCBpbmRleCwgYWxwaGEgKSB7XG4gICAgcmV0dXJuIE1hdGgucG93KCBpbmRleCAvIGxlbmd0aCwgYWxwaGEgKVxuICB9LFxuXG4gIGxpbmVhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gaW5kZXggLyBsZW5ndGhcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vcj0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiAgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid3cmFwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgc2lnbmFsID0gaW5wdXRzWzBdLCBtaW4gPSBpbnB1dHNbMV0sIG1heCA9IGlucHV0c1syXSxcbiAgICAgICAgb3V0LCBkaWZmXG5cbiAgICAvL291dCA9IGAoKCgke2lucHV0c1swXX0gLSAke3RoaXMubWlufSkgJSAke2RpZmZ9ICArICR7ZGlmZn0pICUgJHtkaWZmfSArICR7dGhpcy5taW59KWBcbiAgICAvL2NvbnN0IGxvbmcgbnVtV3JhcHMgPSBsb25nKCh2LWxvKS9yYW5nZSkgLSAodiA8IGxvKTtcbiAgICAvL3JldHVybiB2IC0gcmFuZ2UgKiBkb3VibGUobnVtV3JhcHMpOyAgIFxuICAgIFxuICAgIGlmKCB0aGlzLm1pbiA9PT0gMCApIHtcbiAgICAgIGRpZmYgPSBtYXhcbiAgICB9ZWxzZSBpZiAoIGlzTmFOKCBtYXggKSB8fCBpc05hTiggbWluICkgKSB7XG4gICAgICBkaWZmID0gYCR7bWF4fSAtICR7bWlufWBcbiAgICB9ZWxzZXtcbiAgICAgIGRpZmYgPSBtYXggLSBtaW5cbiAgICB9XG5cbiAgICBvdXQgPVxuYCB2YXIgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XG4gIGlmKCAke3RoaXMubmFtZX0gPCAke3RoaXMubWlufSApICR7dGhpcy5uYW1lfSArPSAke2RpZmZ9XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA+ICR7dGhpcy5tYXh9ICkgJHt0aGlzLm5hbWV9IC09ICR7ZGlmZn1cblxuYFxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCAnICcgKyBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgbWluLCBtYXggXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIE1lbW9yeUhlbHBlciA9IHtcbiAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgdmFyIHNpemUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyA0MDk2IDogYXJndW1lbnRzWzBdO1xuICAgIHZhciBtZW10eXBlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAxIHx8IGFyZ3VtZW50c1sxXSA9PT0gdW5kZWZpbmVkID8gRmxvYXQzMkFycmF5IDogYXJndW1lbnRzWzFdO1xuXG4gICAgdmFyIGhlbHBlciA9IE9iamVjdC5jcmVhdGUodGhpcyk7XG5cbiAgICBPYmplY3QuYXNzaWduKGhlbHBlciwge1xuICAgICAgaGVhcDogbmV3IG1lbXR5cGUoc2l6ZSksXG4gICAgICBsaXN0OiB7fSxcbiAgICAgIGZyZWVMaXN0OiB7fVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGhlbHBlcjtcbiAgfSxcbiAgYWxsb2M6IGZ1bmN0aW9uIGFsbG9jKGFtb3VudCkge1xuICAgIHZhciBpZHggPSAtMTtcblxuICAgIGlmIChhbW91bnQgPiB0aGlzLmhlYXAubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBFcnJvcignQWxsb2NhdGlvbiByZXF1ZXN0IGlzIGxhcmdlciB0aGFuIGhlYXAgc2l6ZSBvZiAnICsgdGhpcy5oZWFwLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMuZnJlZUxpc3QpIHtcbiAgICAgIHZhciBjYW5kaWRhdGVTaXplID0gdGhpcy5mcmVlTGlzdFtrZXldO1xuXG4gICAgICBpZiAoY2FuZGlkYXRlU2l6ZSA+PSBhbW91bnQpIHtcbiAgICAgICAgaWR4ID0ga2V5O1xuXG4gICAgICAgIHRoaXMubGlzdFtpZHhdID0gYW1vdW50O1xuXG4gICAgICAgIGlmIChjYW5kaWRhdGVTaXplICE9PSBhbW91bnQpIHtcbiAgICAgICAgICB2YXIgbmV3SW5kZXggPSBpZHggKyBhbW91bnQsXG4gICAgICAgICAgICAgIG5ld0ZyZWVTaXplID0gdm9pZCAwO1xuXG4gICAgICAgICAgZm9yICh2YXIgX2tleSBpbiB0aGlzLmxpc3QpIHtcbiAgICAgICAgICAgIGlmIChfa2V5ID4gbmV3SW5kZXgpIHtcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSBfa2V5IC0gbmV3SW5kZXg7XG4gICAgICAgICAgICAgIHRoaXMuZnJlZUxpc3RbbmV3SW5kZXhdID0gbmV3RnJlZVNpemU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYoIGlkeCAhPT0gLTEgKSBkZWxldGUgdGhpcy5mcmVlTGlzdFsgaWR4IF1cblxuICAgIGlmIChpZHggPT09IC0xKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMubGlzdCksXG4gICAgICAgICAgbGFzdEluZGV4ID0gdm9pZCAwO1xuXG4gICAgICBpZiAoa2V5cy5sZW5ndGgpIHtcbiAgICAgICAgLy8gaWYgbm90IGZpcnN0IGFsbG9jYXRpb24uLi5cbiAgICAgICAgbGFzdEluZGV4ID0gcGFyc2VJbnQoa2V5c1trZXlzLmxlbmd0aCAtIDFdKTtcblxuICAgICAgICBpZHggPSBsYXN0SW5kZXggKyB0aGlzLmxpc3RbbGFzdEluZGV4XTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlkeCA9IDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGlzdFtpZHhdID0gYW1vdW50O1xuICAgIH1cblxuICAgIGlmIChpZHggKyBhbW91bnQgPj0gdGhpcy5oZWFwLmxlbmd0aCkge1xuICAgICAgdGhyb3cgRXJyb3IoJ05vIGF2YWlsYWJsZSBibG9ja3MgcmVtYWluIHN1ZmZpY2llbnQgZm9yIGFsbG9jYXRpb24gcmVxdWVzdC4nKTtcbiAgICB9XG4gICAgcmV0dXJuIGlkeDtcbiAgfSxcbiAgZnJlZTogZnVuY3Rpb24gZnJlZShpbmRleCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5saXN0W2luZGV4XSAhPT0gJ251bWJlcicpIHtcbiAgICAgIHRocm93IEVycm9yKCdDYWxsaW5nIGZyZWUoKSBvbiBub24tZXhpc3RpbmcgYmxvY2suJyk7XG4gICAgfVxuXG4gICAgdGhpcy5saXN0W2luZGV4XSA9IDA7XG5cbiAgICB2YXIgc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMubGlzdCkge1xuICAgICAgaWYgKGtleSA+IGluZGV4KSB7XG4gICAgICAgIHNpemUgPSBrZXkgLSBpbmRleDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5mcmVlTGlzdFtpbmRleF0gPSBzaXplO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUhlbHBlcjtcbiJdfQ==
