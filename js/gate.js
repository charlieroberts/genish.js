'use strict'

/**
 * `gate()` routes signal from one of its outputs according to an input
 * *control* signal, which defines an index for output. The various outputs are
 * all stored in the `mygate.outputs` array. The code example to the right shows
 * a signal alternating between left and right channels using the `gate` ugen.
 *
 * #### Properties
 * - `outputs` *string* : An array of outputs that can be used as inputs to other ugens.
 *
 * __Category:__ routing
 * @name gate
 * @function
 * @param {(ugen|number)} control - Selects the output index that the input signal travels through.
 * @param {Integer} input - Signal that is passed through one of various outlets.
 * @param {Object} properties - A dictionary of optional parameters to assign to the gate object. The main property is `count` (default value 2) which determines the number of outputs a `gate` ugen possesses.
 *
 * @example
 * inputSignal = mul( phasor(330), .1 )
 * controlSignal = gt( phasor(2), .5 )
 * g = gate( controlSignal, inputSignal, { count:4 })
 * gen.createCallback([ g.outputs[0], g.outputs[1] ])
 */

let gen = require( './gen.js' )

let proto = {
  basename:'gate',
  controlString:null, // insert into output codegen for determining indexing
  gen() {
    let inputs = gen.getInputs( this ), out

    gen.requestMemory( this.memory )

    let lastInputMemoryIdx = 'memory[ ' + this.memory.lastInput.idx + ' ]',
        outputMemoryStartIdx = this.memory.lastInput.idx + 1,
        inputSignal = inputs[0],
        controlSignal = inputs[1]

    /*
     * we check to see if the current control inputs equals our last input
     * if so, we store the signal input in the memory associated with the currently
     * selected index. If not, we put 0 in the memory associated with the last selected index,
     * change the selected index, and then store the signal in put in the memery assoicated
     * with the newly selected index
     */

    out =

` if( ${controlSignal} !== ${lastInputMemoryIdx} ) {
    memory[ ${lastInputMemoryIdx} + ${outputMemoryStartIdx}  ] = 0
    ${lastInputMemoryIdx} = ${controlSignal}
  }
  memory[ ${outputMemoryStartIdx} + ${controlSignal} ] = ${inputSignal}

`
    this.controlString = inputs[1]
    this.initialized = true

    gen.memo[ this.name ] = this.name

    this.outputs.forEach( v => v.gen() )

    return [ null, ' ' + out ]
  },

  childgen() {
    if( this.parent.initialized === false ) {
      gen.getInputs( this ) // parent gate is only input of a gate output, should only be gen'd once.
    }

    if( gen.memo[ this.name ] === undefined ) {
      gen.requestMemory( this.memory )

      gen.memo[ this.name ] = `memory[ ${this.memory.value.idx} ]`
    }

    return  `memory[ ${this.memory.value.idx} ]`
  }
}

module.exports = ( control, in1, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { count: 2 }

  if( typeof properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, {
    outputs: [],
    uid:     gen.getUID(),
    inputs:  [ in1, control ],
    memory: {
      lastInput: { length:1, idx:null }
    },
    initialized:false
  },
  defaults )

  ugen.name = `${ugen.basename}${gen.getUID()}`

  for( let i = 0; i < ugen.count; i++ ) {
    ugen.outputs.push({
      index:i,
      gen: proto.childgen,
      parent:ugen,
      inputs: [ ugen ],
      memory: {
        value: { length:1, idx:null }
      },
      initialized:false,
      name: `${ugen.name}_out${gen.getUID()}`
    })
  }

  return ugen
}
