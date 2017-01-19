'use strict'

/**
 * Prop
 * FIXME: Write documentation
 * FIXME: @moduleof module:???
 * FIXME: @example
 *
 * @name prop
 * @function
 * @param {String} propName
 * @param {FIXME} value
 * @return {ugen}
 */

let gen = require('./gen.js')

let proto = {
  gen() {
    gen.closures.add({ [ this.name ]: this.value })
    return 'gen.' + this.name
  }
}

module.exports = ( propName, value ) => {
  let ugen = Object.create( proto )

  ugen.name = propName
  ugen.value = value

  return ugen
}
