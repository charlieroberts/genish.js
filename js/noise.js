'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'noise',

  gen() {
    let out

    const isWorklet = gen.mode === 'worklet'
    const ref = isWorklet? '' : 'gen.'

    gen.closures.add({ 'noise' : isWorklet ? 'Math.random' : Math.random })

    out = `  var ${this.name} = ${ref}noise()\n`
    
    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = x => {
  let noise = Object.create( proto )
  noise.name = proto.name + gen.getUID()

  return noise
}
