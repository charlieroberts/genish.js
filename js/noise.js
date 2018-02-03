'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'noise',

  gen() {
    let out

    const ref = gen.mode === 'worklet' ? 'this' : 'gen'

    gen.closures.add({ 'noise' : Math.random })

    out = `  var ${this.name} = ${ref}.noise()\n`
    
    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = x => {
  let noise = Object.create( proto )
  noise.name = proto.name + gen.getUID()

  return noise
}
