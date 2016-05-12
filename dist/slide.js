'use strict';

var _gen = require('./gen.js'),
    history = require('./history.js'),
    sub = require('./sub.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    memo = require('./memo.js');

var proto = {
    basename: 'slide',

    gen: function gen() {
        var inputs = _gen.getInputs(this),
            y1 = history(),
            filter = void 0;

        filter = memo(add(y1.out, div(sub(inputs[0], y1.out), inputs[1])));
        y1.in(filter).gen();

        return filter.name;
    }
};

module.exports = function (in1) {
    var slideUp = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
    var slideDown = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];


    var y1 = history(),
        filter = void 0;

    filter = memo(add(y1.out, div(sub(in1, y1.out), slideUp)));
    y1.in(filter);

    //filter.name = 'slide'+gen.getUID()

    return filter;
};