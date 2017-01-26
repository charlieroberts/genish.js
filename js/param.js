'use strict'

/**
 * The `param` ugen exposes a single number for interactive control via
 * assignment to its `value` property. In the example below, the frequency of a
 * sine oscillator is controlled via a `param` ugen:
 *
 * __Category:__ control
 * @name param
 * @function
 * @param {Number} value - The initial value for the param ugen.
 * @return {ugen}
 * @example
 * pattern = [ 440, 660, 880, 1100 ]
 * idx = 0
 * frequency = param( pattern[ idx ] )
 * play( cycle( frequency ) )
 * // change frequency every 100ms (approximately, setInterval is not sample accurate)
 * intrvl = setInterval( ()=> {
 *   frequency.value = pattern[ idx++ % pattern.length ]
 * }, 100 )
 */

let gen = require('./gen.js')

let proto = {
  gen() {
    gen.requestMemory( this.memory )

    gen.params.add({ [this.name]: this })

    this.value = this.initialValue

    gen.memo[ this.name ] = `memory[${this.memory.value.idx}]`

    return gen.memo[ this.name ]
  }
}

module.exports = ( propName=0, value=0 ) => {
  let ugen = Object.create( proto )

  if( typeof propName !== 'string' ) {
    ugen.name = 'param' + gen.getUID()
    ugen.initialValue = propName
  }else{
    ugen.name = propName
    ugen.initialValue = value
  }

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

  ugen.memory = {
    value: { length:1, idx:null }
  }

  return ugen
}
