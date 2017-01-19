'use strict'

/**
 * Wrap constricts an input `a` to a particular range. Given a range of {0,1}
 * and an input signal of {.8,.9,1,1.1,1.2}, fold will return {.8,.9,0,.1,.2}.
 *
 * @name wrap
 * @function
 * @param {(ugen|number)} a - Input signal to wrap.
 * @param {(ugen|number)} min - Signal or number that sets minimum of range to wrap input to.
 * @param {(ugen|number)} max - Signal or number that sets maximum of range to wrap input to.
 * @memberof module:range
 */

let gen  = require('./gen.js'),
    floor= require('./floor.js'),
    sub  = require('./sub.js'),
    memo = require('./memo.js')

let proto = {
  basename:'wrap',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        signal = inputs[0], min = inputs[1], max = inputs[2],
        out, diff

    //out = `(((${inputs[0]} - ${this.min}) % ${diff}  + ${diff}) % ${diff} + ${this.min})`
    //const long numWraps = long((v-lo)/range) - (v < lo);
    //return v - range * double(numWraps);

    if( this.min === 0 ) {
      diff = max
    }else if ( isNaN( max ) || isNaN( min ) ) {
      diff = `${max} - ${min}`
    }else{
      diff = max - min
    }

    out =
` var ${this.name} = ${inputs[0]}
  if( ${this.name} < ${this.min} ) ${this.name} += ${diff}
  else if( ${this.name} > ${this.max} ) ${this.name} -= ${diff}

`

    return [ this.name, ' ' + out ]
  },
}

module.exports = ( in1, min=0, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, {
    min,
    max,
    uid:    gen.getUID(),
    inputs: [ in1, min, max ],
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
