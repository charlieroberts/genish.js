'use strict'

let gen = require('./gen.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js')

let proto = {
  basename:'mix',

  gen() {
    gen.memo[ this.name ] = add( mul(this.inputs[0],sub(1,this.inputs[2])), mul( this.inputs[1], this.inputs[2] ) ).gen()

    return gen.memo[ this.name ]
  }
}

module.exports = ( in1, in2, t=.5 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    uid:    gen.getUID(),
    inputs: [ in1, in2, t ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
