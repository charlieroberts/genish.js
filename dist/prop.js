'use strict'

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
