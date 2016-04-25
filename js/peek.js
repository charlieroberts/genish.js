let gen  = require('./gen.js')

let proto = {
  basename:'peek',

  gen() {
    let genName = 'gen.' + this.name,
        inputs = gen.getInputs( this ),
        out, functionBody

functionBody = `   
  let ${this.name}_data = gen.data.${this.dataName},
      ${this.name}_index = ${inputs[0]} | 0,
      ${this.name}_frac = ${inputs[0]} - ${this.name}_index,
      ${this.name}_base =  ${this.name}_data[ ${this.name}_index ],
      ${this.name}_out  = ${this.name}_base + ${this.name}_frac * ( ${this.name}_data[ (${this.name}_index+1) & (${this.name}_data.length - 1) ] - ${this.name}_base ) 
`
     //return base + ( frac * ( this.table[ (index+1) & 1023 ] - base ) ) * 1
    return [ this.name+'_out', functionBody ]
  },
}

module.exports = ( dataName, index, channels=1 ) => {
  let ugen = Object.create( proto ) 

  Object.assign( ugen, { 
    dataName,
    channels,
    uid:        gen.getUID(),
    inputs:     [ index ],
    properties: null,
  })
  
  ugen.name = ugen.basename + ugen.uid

  return ugen
}
