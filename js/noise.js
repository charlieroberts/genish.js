'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'noise',

  gen() {
    let out

    gen.closures.add({ 'noise' : Math.random })

    out = `gen.noise()`

    return out
  }
}

module.exports = x => {
  let noise = Object.create( proto )

  return noise
}
