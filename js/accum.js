'use strict'

/**
 * `accum` is used to increment a stored value between a provided range that
 * defaults to {0,1}. If the accumulator values passes its maximum, it wraps.
 * `accum()` is very similar to the `counter` ugen, but is slightly more
 * efficient. Additionally, the `min` and `max` properties of `accum` are fixed
 * values, while they can be specified with signals in `counter`.
 *
 * __Category:__ integrator
 * @name accum
 * @function
 * @param {(ugen|number)} [increment = 1] - The amount to increase the accumulator's
 * internal value by on each sample
 * @param {(ugen|number)} [reset = 0] - When `reset` has a value of 1, the
 * accumulator will reset its internal value to 0.
 * @param {Object} [props = {} ] - An optional dictionary containing a `max`
 * value that the `accum` increments to before wrapping,
 * and a `min` value that the `accum` wraps to after reaching/passing its max.
 * An `initialValue` for the `accum` can also be provided; if it is not given
 * the initial value is assumed to be the same as its `min`.
 */

let gen  = require('./gen.js')

let proto = {
  basename:'accum',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        genName = 'gen.' + this.name,
        functionBody

    gen.requestMemory( this.memory )

    gen.memory.heap[ this.memory.value.idx ] = this.initialValue

    functionBody = this.callback( genName, inputs[0], inputs[1], `memory[${this.memory.value.idx}]` )

    gen.closures.add({ [ this.name ]: this })

    gen.memo[ this.name ] = this.name + '_value'

    return [ this.name + '_value', functionBody ]
  },

  callback( _name, _incr, _reset, valueRef ) {
    let diff = this.max - this.min,
        out = '',
        wrap = ''

    /* three different methods of wrapping, third is most expensive:
     *
     * 1: range {0,1}: y = x - (x | 0)
     * 2: log2(this.max) == integer: y = x & (this.max - 1)
     * 3: all others: if( x >= this.max ) y = this.max -x
     *
     */

    // must check for reset before storing value for output
    if( !(typeof this.inputs[1] === 'number' && this.inputs[1] < 1) ) {
      out += `  if( ${_reset} >=1 ) ${valueRef} = ${this.min}\n\n`
    }

    out += `  var ${this.name}_value = ${valueRef};\n`

    if( this.shouldWrap === false && this.shouldClamp === true ) {
      out += `  if( ${valueRef} < ${this.max } ) ${valueRef} += ${_incr}\n`
    }else{
      out += `  ${valueRef} += ${_incr}\n` // store output value before accumulating
    }

    if( this.max !== Infinity  && this.shouldWrap ) wrap += `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n`
    if( this.min !== -Infinity && this.shouldWrap ) wrap += `  if( ${valueRef} < ${this.min} ) ${valueRef} += ${diff}\n\n`

    //if( this.min === 0 && this.max === 1 ) {
    //  wrap =  `  ${valueRef} = ${valueRef} - (${valueRef} | 0)\n\n`
    //} else if( this.min === 0 && ( Math.log2( this.max ) | 0 ) === Math.log2( this.max ) ) {
    //  wrap =  `  ${valueRef} = ${valueRef} & (${this.max} - 1)\n\n`
    //} else if( this.max !== Infinity ){
    //  wrap = `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n\n`
    //}

    out = out + wrap

    return out
  }
}

module.exports = ( incr, reset=0, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { min:0, max:1, shouldWrap: true, shouldClamp:false }

  if( properties !== undefined ) Object.assign( defaults, properties )

  if( defaults.initialValue === undefined ) defaults.initialValue = defaults.min

  Object.assign( ugen, {
    min: defaults.min,
    max: defaults.max,
    initial: defaults.initialValue,
    uid:    gen.getUID(),
    inputs: [ incr, reset ],
    memory: {
      value: { length:1, idx:null }
    }
  },
  defaults )

  Object.defineProperty( ugen, 'value', {
    get() { return gen.memory.heap[ this.memory.value.idx ] },
    set(v) { gen.memory.heap[ this.memory.value.idx ] = v }
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
