'use strict'

let gen = require('./gen.js')

let proto = {
  basename:'in',

  gen() {
    gen.parameters.push( this.name )
    
    gen.memo[ this.name ] = this.name

    return this.name
  } 
}

module.exports = () => {
  let input = Object.create( proto )

  input.id   = gen.getUID()
  input.name = `${input.basename}${input.id}`

  return input
}
