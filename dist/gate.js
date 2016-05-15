'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _gen = require('./gen.js');

var proto = {
  basename: 'gate',

  gen: function gen() {
    var inputs = _gen.getInputs(this),
        out = void 0;

    _gen.requestMemory(this.memory);
    var data = 'memory[ ' + this.memory.lastInput.idx + ' ]';

    /* 
     * we check to see if the current control inputs equals our last input
     * if so, we store the signal input in the memory associated with the currently
     * selected index. If not, we put 0 in the memory associated with the last selected index,
     * change the selected index, and then store the signal in put in the memery assoicated
     * with the newly selected index
     */

    out = ' let ' + this.name + '_index = ' + inputs[1] + '\n  if( ' + this.name + '_index != ' + data + ' ) {\n    memory[ ' + data + ' + ' + (this.memory.lastInput.idx + 1) + '  ] = 0 \n    ' + data + ' = ' + inputs[1] + '\n  }\n  memory[ ' + (this.memory.lastInput.idx + 1) + ' + ' + inputs[1] + ' ] = ' + inputs[0] + ' \n\n';

    _gen.memo[this.name] = '' + this.name;

    return ['', ' ' + out];
  },
  childgen: function childgen() {
    if (_gen.memo[this.parent.name] === undefined) {
      _gen.getInputs(this);
    }

    if (_gen.memo[this.name] === undefined) {
      console.log('GATE OUT: ', this.name, ' REQUESTING MEMORY');
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
    }
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
      name: ugen.name + '_out' + _gen.getUID()
    });
  }

  return ugen;
};