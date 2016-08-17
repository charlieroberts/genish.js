'use strict';

var _gen = require('./gen.js');

var proto = {
  basename: 'conditional',

  gen: function gen() {
    var cond = _gen.getInput(this.inputs[0]),
        block1 = void 0,
        block2 = void 0,
        block1Name = void 0,
        block2Name = void 0,
        cond1 = void 0,
        cond2 = void 0,
        out = void 0;

    if (typeof this.inputs[1] === 'number') {
      block1 = this.inputs[1];
      block1Name = null;
    } else {
      if (_gen.memo[this.inputs[1].name] === undefined) {
        // used to place all code dependencies in appropriate blocks
        _gen.startLocalize();

        _gen.getInput(this.inputs[1]);

        var block = _gen.endLocalize();
        block1 = block[1].join('');
        block1 = '  ' + block1.replace(/\n/gi, '\n  ');
        block1Name = block[0];
      } else {
        block1 = '';
        block1Name = _gen.memo[this.inputs[1].name];
      }
    }

    if (typeof this.inputs[2] === 'number') {
      block2 = this.inputs[2];
      block2Name = null;
    } else {
      if (_gen.memo[this.inputs[2].name] === undefined) {

        _gen.startLocalize();
        _gen.getInput(this.inputs[2]);
        var _block = _gen.endLocalize();

        block2 = _block[1].join('');
        block2 = '  ' + block2.replace(/\n/gi, '\n  ');
        block2Name = _block[0];
      } else {
        block2 = ''; //gen.memo[ this.inputs[1].name ]
        block2Name = _gen.memo[this.inputs[2].name];
      }
    }

    cond1 = block1Name === null ? '  ' + this.name + '_out = ' + block1 : block1 + '    ' + this.name + '_out = ' + block1Name;

    cond2 = block2Name === null ? '  ' + this.name + '_out = ' + block2 : block2 + '    ' + this.name + '_out = ' + block2Name;

    out = '  let ' + this.name + '_out \n  if( ' + cond + ' ) {\n' + cond1 + '\n  }else{\n' + cond2 + ' \n  }\n';

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