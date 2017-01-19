'use strict'

/**
 * Noise outputs a pseudo-random signal between {0,1}. The signal is generated
 * via Javascript's `Math.random()` function.
 *
 * @name noise
 * @function
 * @return {ugen}
 * @memberof module:waveform
 */

let gen  = require('./gen.js')

let proto = {
  name:'noise',

  gen() {
    let out

    gen.closures.add({ 'noise' : Math.random })

    out = `  var ${this.name} = gen.noise()\n`

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = x => {
  let noise = Object.create( proto )
  noise.name = proto.name + gen.getUID()

  return noise
}
