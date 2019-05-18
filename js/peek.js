'use strict'

const gen      = require( './gen.js' ),
      dataUgen = require( './data.js' ),
      param    = require( './param.js' )

let proto = {
  basename:'peek',

  gen() {
    let genName = 'gen.' + this.name,
        inputs = [],
        out, functionBody, next, lengthIsLog2, idx

    // we must manually get each input so that we
    // can assign correct memory location value
    // after the data input has requested memory.
    inputs[ 0 ] = gen.getInput( this.inputs[ 0 ] )
    inputs[ 1 ] = gen.getInput( this.inputs[ 1 ] )

    this.memLocation.value = this.data.memory.values.idx
    this.memLength.value = this.data.memory.values.length

    inputs[ 2 ] = gen.getInput( this.inputs[ 2 ] )
    inputs[ 3 ] = gen.getInput( this.inputs[ 3 ] )


    idx = inputs[2]

    // this no longer works with dynamic memory locations / buffer lengths. We would have
    // to rerun codegen upon learning the length of the underlying data buffer in order for
    // this optimization to function again... 
    lengthIsLog2 = false //(Math.log2( inputs[3] ) | 0)  === Math.log2( inputs[3] )

    if( this.mode !== 'simple' ) {

    functionBody = `  var ${this.name}_dataIdx  = ${idx}, 
      ${this.name}_phase = ${this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + `(${inputs[3]} - 1)` }, 
      ${this.name}_index = ${this.name}_phase | 0,\n`

    if( this.boundmode === 'wrap' ) {
      next = lengthIsLog2 ?
      `( ${this.name}_index + 1 ) & (${inputs[3]} - 1)` :
      `${this.name}_index + 1 >= ${inputs[3]} ? ${this.name}_index + 1 - ${inputs[3]} : ${this.name}_index + 1`
    }else if( this.boundmode === 'clamp' ) {
      next = 
        `${this.name}_index + 1 >= ${inputs[3] - 1} ? ${inputs[3] - 1} : ${this.name}_index + 1`
    } else if( this.boundmode === 'fold' || this.boundmode === 'mirror' ) {
      next = 
        `${this.name}_index + 1 >= ${inputs[3] - 1} ? ${this.name}_index - ${inputs[3] - 1} : ${this.name}_index + 1`
    }else{
       next = 
      `${this.name}_index + 1`     
    }

    if( this.interp === 'linear' ) {      
    functionBody += `      ${this.name}_frac  = ${this.name}_phase - ${this.name}_index,
      ${this.name}_base  = memory[ ${this.name}_dataIdx +  ${this.name}_index ],
      ${this.name}_next  = ${next},`
      
      if( this.boundmode === 'ignore' ) {
        functionBody += `
      ${this.name}_out   = ${this.name}_index >= ${inputs[3] - 1} || ${this.name}_index < 0 ? 0 : ${this.name}_base + ${this.name}_frac * ( memory[ ${this.name}_dataIdx + ${this.name}_next ] - ${this.name}_base )\n\n`
      }else{
        functionBody += `
      ${this.name}_out   = ${this.name}_base + ${this.name}_frac * ( memory[ ${this.name}_dataIdx + ${this.name}_next ] - ${this.name}_base )\n\n`
      }
    }else{
      functionBody += `      ${this.name}_out = memory[ ${this.name}_dataIdx + ${this.name}_index ]\n\n`
    }

    } else { // mode is simple
      functionBody = `memory[ ${idx} + ${ inputs[0] } ]`
      
      return functionBody
    }

    gen.memo[ this.name ] = this.name + '_out'

    return [ this.name+'_out', functionBody ]
  },

  defaults : { channels:1, mode:'phase', interp:'linear', boundmode:'wrap' }
}

module.exports = ( input_data, index=0, properties ) => {
  let ugen = Object.create( proto )

  //console.log( dataUgen, gen.data )

  // XXX why is dataUgen not the actual function? some type of browserify nonsense...
  const finalData = typeof input_data.basename === 'undefined' ? gen.lib.data( input_data ) : input_data

  const uid = gen.getUID()

  // we need to make these dynamic so that they can be changed
  // when a data object has finished loading, at which point
  // we'll need to allocate a new memory block and update the
  // memory block's length in the generated code.
  const memLocation = param( 'dataLocation'+uid )
  const memLength   = param( 'dataLength'+uid )

  
  // for data that is loading when this peek object is created, a promise
  // will be returned by the call to data.
  if( input_data instanceof Promise ) {
    //memLocation.value = 0 
    memLength.value = 1

    input_data.then( d => {
      memLocation.value = gen.memory.heap[ memLocation.memory.value.idx ] = d.memory.values.idx
      memLength.value = gen.memory.heap[ memLength.memory.value.idx ] = d.memory.values.length

      //memLocation.value = d.memory.values.idx
      //memLength.value = d.buffer.length
    })
  }else{
    //console.log( 'memory:', input_data.memory.values.idx )
    //memLocation.value = input_data.memory.values.idx
    //memLength.value   = input_data.memory.values.length
  }

  Object.assign( ugen, 
    { 
      'data':     finalData,
      dataName:   finalData.name,
      inputs:     [ index, finalData, memLocation, memLength ],
      uid,
      memLocation,
      memLength
    },
    proto.defaults,
    properties 
  )
  
  ugen.name = ugen.basename + ugen.uid

  return ugen
}
