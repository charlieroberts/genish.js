'use strict'

/**
 * Set a property of a ugen
 *
 * __Category:__ utilities
 * @name prop
 * @function
 * @param {String} propName
 * @param {Object} value
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
