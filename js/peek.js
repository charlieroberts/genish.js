let gen  = require('./gen.js'),
    mul  = require('./mul.js')

let proto = {
  basename:'peek',

  gen() {
    let genName = 'gen.' + this.name,
        inputs = gen.getInputs( this ),
        out, functionBody

functionBody = `  let ${this.name}_data  = gen.data.${this.dataName},
      ${this.name}_phase = ${this.mode === 0 ? inputs[0] : inputs[0] + ' * gen.data.' + this.dataName + '.length'}, 
      ${this.name}_index = ${this.name}_phase | 0,
      ${this.name}_frac  = ${this.name}_phase - ${this.name}_index,
      ${this.name}_base  = ${this.name}_data[ ${this.name}_index ],
      ${this.name}_out   = ${this.name}_base + ${this.name}_frac * ( ${this.name}_data[ (${this.name}_index+1) & (${this.name}_data.length - 1) ] - ${this.name}_base ) 

`
    return [ this.name+'_out', functionBody ]
  },
}

module.exports = ( dataName, index, channels=1, mode=0 ) => {
  let ugen = Object.create( proto ) 

  Object.assign( ugen, { 
    dataName,
    channels,
    mode,
    uid:        gen.getUID(),
    inputs:     [ index ],
    properties: null,
  })
  
  ugen.name = ugen.basename + ugen.uid

  return ugen
}
