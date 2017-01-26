'use strict'

/**
 * The bang ugen continuously outputs a minimum value (default 0) until its
 * `trigger()` method is called. After triggering, the ugen will output its
 * maximum value (default 1) for a single sample before resetting and returning
 * to outputting its minimum. The bang ugen can be used, for example, to easily
 * re-trigger an envelope interactively, or to reset a counter/accum ugen.
 *
 * ### Properties:
 * - `min` *number* (default 0) The 'resting state' of the bang ugen.
 * - `max` *number* (default 1) The instantaneous state after triggering the bang ugen. This state will only last for one sample after triggering.
 *
 * ### Methods:
 * - `trigger`: Change the state from the min property of the bang ugen to the
 * max property for one sample.
 *
 * __Category:__ control
 * @name bang
 * @function
 * @param {Object} [properties = { min: 0, max: 1 }] - optional properties object
 * @return {ugen}
 */

let gen = require('./gen.js')

let proto = {
  gen() {
    gen.requestMemory( this.memory )

    let out =
`  var ${this.name} = memory[${this.memory.value.idx}]
  if( ${this.name} === 1 ) memory[${this.memory.value.idx}] = 0

`
    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = ( _props ) => {
  let ugen = Object.create( proto ),
      props = Object.assign({}, { min:0, max:1 }, _props )

  ugen.name = 'bang' + gen.getUID()

  ugen.min = props.min
  ugen.max = props.max

  ugen.trigger = () => {
    gen.memory.heap[ ugen.memory.value.idx ] = ugen.max
  }

  ugen.memory = {
    value: { length:1, idx:null }
  }

  return ugen
}
