'use strict'

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
        out

    //out = `(((${inputs[0]} - ${this.min}) % ${diff}  + ${diff}) % ${diff} + ${this.min})`
    //const long numWraps = long((v-lo)/range) - (v < lo);
    //return v - range * double(numWraps);   
    
    out =`  let ${this.name} = ${inputs[0]}
  if( ${this.name} < ${this.min} ) ${this.name} += ${this.max} - ${this.min}
  else if( ${this.name} > ${this.max} ) ${this.name} -= ${this.max} - ${this.min}\n\n`

//` let ${this.name} = ${signal}
//  if( ${this.name} < ${min} || ${this.name} > ${max} ) {
//    let diff = ${max} - ${min}
//    ${this.name} -= diff
//    //let numWraps = (( ${signal} - ${min} ) / diff ) | 0
//    //${this.name} = ${this.name} - diff * numWraps
//  }
//`
//  else if( ${this.name} > ${max} ) ${this.name} -= ${max} - ${in}

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
