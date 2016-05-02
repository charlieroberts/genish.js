'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'accum',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        genName = 'gen.' + this.name,
        functionBody = this.callback( genName, inputs[0], inputs[1] )

    gen.closures.add({ [ this.name ]: this }) 

    gen.memo[ this.name ] = genName + '.value'
    
    return [ genName + '.value', functionBody ]
  },

  callback( _name, _incr, _reset ) {
    let diff = this.max - this.min,
        out

    out = 

`  ${_name}.value += ${_incr}
  ${typeof _reset === 'number' && _reset < 1 ? '' : 'if('+_reset+'>=1 ) '+_name+'.value = ' + this.min + '\n'}
  if( ${_name}.value >= ${this.max} ) ${_name}.value -= ${diff}\n\n`
  
    out = ' ' + out

    return out
  }
}

module.exports = ( incr, reset=0, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { min:0, max:1 }

  if( properties !== undefined ) Object.assign( defaults, properties )

  if( defaults.initialValue === undefined ) defaults.initialValue = defaults.min - 1

  Object.assign( ugen, { 
    min: defaults.min, 
    max: defaults.max,
    value:  defaults.initialValue,
    uid:    gen.getUID(),
    inputs: [ incr, reset ],
  },
  defaults )

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}
