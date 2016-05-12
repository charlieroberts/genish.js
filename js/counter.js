'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'counter',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        genName = 'gen.' + this.name,
        functionBody
       
    gen.requestMemory( this.memory )
    functionBody  = this.callback( genName, inputs[0], inputs[1], inputs[2], inputs[3], `memory[${this.memory.value.idx}]`  )

    gen.closures.add({ [ this.name ]: this }) 

    gen.memo[ this.name ] = this.name + '_value'
    
    return [ this.name + '_value', functionBody ]
  },

  callback( _name, _incr, _min, _max, _reset, valueRef ) {
    let diff = this.max - this.min,
        out = '',
        wrap = ''
    
    /* three different methods of wrapping, third is most expensive:
     *
     * 1: range {0,1}: y = x - (x | 0)
     * 2: log2(this.max) == integer: y = x & (this.max - 1)
     * 3: all others: if( x >= this.max ) y = this.max -x
     *
     */
    
    // must check for reset before storing value for output
    if( !(typeof this.inputs[3] === 'number' && this.inputs[3] < 1) ) { 
      out += `  if( ${_reset} >= 1 ) ${valueRef} = ${_min}\n`
    }

    out += `  let ${this.name}_value = ${valueRef};\n  ${valueRef} += ${_incr}\n` // store output value before accumulating  
    
    if( this.min === 0 && this.max === 1 ) { 
      wrap =  `  ${valueRef} = ${valueRef} - (${valueRef} | 0)\n\n`
    } else if( this.min === 0 && ( Math.log2( this.max ) | 0 ) === Math.log2( this.max ) ) {
      wrap =  `  ${valueRef} = ${valueRef} & (${this.max} - 1)\n\n`
    } else if( typeof this.max === 'number' && this.max !== Infinity &&  typeof this.min === 'number' ) {
      wrap = `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n\n`
    }else if( this.max !== Infinity ) {
      wrap = 
`  if( ${valueRef} >= ${_max} ) ${valueRef} -= ${_max} - ${_min}
  else if( ${valueRef} < ${_min} ) ${valueRef} += ${_max} - ${_min}\n\n`
    }else{
      out += '\n'
    }

    out = out + wrap

    return out
  }
}

module.exports = ( incr=1, min=0, max=Infinity, reset=0, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { initialValue: 0 }

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    min:    min, 
    max:    max,
    value:  defaults.initialValue,
    uid:    gen.getUID(),
    inputs: [ incr, min, max, reset ],
    memory: {
      value: { length:1, idx: null },
    }
  },
  defaults )
  
  ugen.name = `${ugen.basename}${ugen.uid}`
  return ugen
} 
