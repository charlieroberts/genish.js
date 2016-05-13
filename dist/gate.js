'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _gen = require('./gen.js');

var proto = {
  basename: 'gate',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    _gen.requestMemory(this.memory);
    // ${data}.outputs[ ${data}.lastInput ] = 0   
    var data = 'memory[ ' + this.memory.lastInput.idx + ' ]';
    out = ' let ' + this.name + '_index = ' + inputs[1] + '\n  if( ' + this.name + '_index != ' + data + ' ) {\n    memory[ ' + data + ' ] = 0 \n    ' + data + ' = ' + inputs[1] + '\n  }\n  memory[ ' + (this.memory.lastInput.idx + 1) + ' + ' + inputs[1] + ' ] = ' + inputs[0] + ' \n';
    //${data}.outputs[ ${inputs[1]} ] = ${inputs[0]}

    _gen.memo[this.name] = 'gen.data.' + this.name;

    return ['', ' ' + out];
  },
  childgen: function childgen() {
    //if( gen.memo[ this.parent.name ] === undefined ) {
    _gen.getInputs(this);
    _gen.requestMemory(this.memory);
    //}
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
    }
  }, defaults);

  ugen.name = '' + ugen.basename + ugen.uid;

  _gen.data[ugen.name] = { outputs: [], lastInput: 0 };

  for (var i = 0; i < ugen.count; i++) {
    ugen.outputs.push({
      index: i,
      gen: proto.childgen,
      parent: ugen,
      inputs: [ugen],
      memory: {
        value: { length: 1, idx: null }
      }
    });
    _gen.data[ugen.name].outputs[i] = 0;
  }

  return ugen;
};