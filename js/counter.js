'use strict'

/**
 * `counter()` is used to increment a stored value between a provided range that
 * defaults to {0,1}. If the counter's interval value passes either range
 * boundary, it is wrapped. `counter()` is very similar to the `accum` ugen, but
 * is slightly less efficient. Additionally, the `min` and `max` properties of
 * `accum` are fixed values, while they can be specified with signals in
 * `counter`, enabling mix/max to change over time.
 *

 * @name counter
 * @function
 * @param {(ugen|number)} [increment = 1] - The amount to increase the counter's internal value by on each sample
 * @param {(ugen|number)} [min = 0] - The minimum value of the accumulator
 * @param {(ugen|number)} [max = 0] - The maximum value of the accumulator
 * @param {(ugen|number)} [reset = 0] - When `reset` has a value of 1, the counter will reset its internal value to 0.
 * @param {Object} [props = {}] - An optional dictionary containing a `max` value that the `accum` increments to before wrapping, and a `min` value that the `accum` wraps to after reaching/passing its max. An `initialValue` for the `accum` can also be provided; if it is not given the initial value is assumed to be the same as its `min`.
 * @memberof module:integrator
 */

let gen  = require('./gen.js')

let proto = {
  basename:'counter',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        genName = 'gen.' + this.name,
        functionBody

    if( this.memory.value.idx === null ) gen.requestMemory( this.memory )
    functionBody  = this.callback( genName, inputs[0], inputs[1], inputs[2], inputs[3], inputs[4],  `memory[${this.memory.value.idx}]`, `memory[${this.memory.wrap.idx}]`  )

    gen.closures.add({ [ this.name ]: this })

    gen.memo[ this.name ] = this.name + '_value'

    if( gen.memo[ this.wrap.name ] === undefined ) this.wrap.gen()

    return [ this.name + '_value', functionBody ]
  },

  callback( _name, _incr, _min, _max, _reset, loops, valueRef, wrapRef ) {
    let diff = this.max - this.min,
        out = '',
        wrap = ''

    // must check for reset before storing value for output
    if( !(typeof this.inputs[3] === 'number' && this.inputs[3] < 1) ) {
      out += `  if( ${_reset} >= 1 ) ${valueRef} = ${_min}\n`
    }

    out += `  var ${this.name}_value = ${valueRef};\n  ${valueRef} += ${_incr}\n` // store output value before accumulating

    if( typeof this.max === 'number' && this.max !== Infinity && typeof this.min !== 'number' ) {
      wrap =
`  if( ${valueRef} >= ${this.max} && ${loops} ) {
    ${valueRef} -= ${diff}
    ${wrapRef} = 1
  }else{
    ${wrapRef} = 0
  }\n`
    }else if( this.max !== Infinity && this.min !== Infinity ) {
      wrap =
`  if( ${valueRef} >= ${_max} && ${loops} ) {
    ${valueRef} -= ${_max} - ${_min}
    ${wrapRef} = 1
  }else if( ${valueRef} < ${_min} && ${loops} ) {
    ${valueRef} += ${_max} - ${_min}
    ${wrapRef} = 1
  }else{
    ${wrapRef} = 0
  }\n`
    }else{
      out += '\n'
    }

    out = out + wrap

    return out
  }
}

module.exports = ( incr=1, min=0, max=Infinity, reset=0, loops=1,  properties ) => {
  let ugen = Object.create( proto ),
      defaults = { initialValue: 0, shouldWrap:true }

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, {
    min:    min,
    max:    max,
    value:  defaults.initialValue,
    uid:    gen.getUID(),
    inputs: [ incr, min, max, reset, loops ],
    memory: {
      value: { length:1, idx: null },
      wrap:  { length:1, idx: null }
    },
    wrap : {
      gen() {
        if( ugen.memory.wrap.idx === null ) {
          gen.requestMemory( ugen.memory )
        }
        gen.getInputs( this )
        gen.memo[ this.name ] = `memory[ ${ugen.memory.wrap.idx} ]`
        return `memory[ ${ugen.memory.wrap.idx} ]`
      }
    }
  },
  defaults )

  Object.defineProperty( ugen, 'value', {
    get() {
      if( this.memory.value.idx !== null ) {
        return gen.memory.heap[ this.memory.value.idx ]
      }
    },
    set( v ) {
      if( this.memory.value.idx !== null ) {
        gen.memory.heap[ this.memory.value.idx ] = v
      }
    }
  })

  ugen.wrap.inputs = [ ugen ]
  ugen.name = `${ugen.basename}${ugen.uid}`
  ugen.wrap.name = ugen.name + '_wrap'
  return ugen
}
