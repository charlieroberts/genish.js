'use strict'

/**
 * Peek reads from an input data object.

 * It can index the data object using on of two *modes*. If the *mode* property
 * is set to *samples* than index provides an integer index to lookup in the
 * data object. If the *mode* property is set to *phase* then the index should
 * be a signal in the range of {0,1}.
 *
 * The `peek` ugen has the following properties:
 * - `mode` {String}: determines how indexing is performed. Options are 'phase' and 'samples'.
 * - `interp` {string}: determines what interpolation is used when performing
 * the lookup. Options are 'linear' and 'none'
 *
 * @name peek
 * @function
 * @param {data} data - the `data` ugen to read values from
 * @param {Integer} index - the index to be read
 * @param {Object} [properties = { mode: 'phase', interp: 'linear'}] - initial
 * properties object
 * @memberof module:buffer
 * @example
 * // create a sliding, interpolated frequency signal running between four values
 * d = data( [440,880,220,1320] )
 * p = peek( d, phasor(.1) )
 * c = cycle( p ) // feed sine osc frequency with signal
 */

let gen  = require('./gen.js')

let proto = {
  basename:'peek',

  gen() {
    let genName = 'gen.' + this.name,
        inputs = gen.getInputs( this ),
        out, functionBody, next, lengthIsLog2, idx

    //idx = this.data.gen()
    idx = inputs[1]
    lengthIsLog2 = (Math.log2( this.data.buffer.length ) | 0)  === Math.log2( this.data.buffer.length )

    //console.log( "LENGTH IS LOG2", lengthIsLog2, this.data.buffer.length )
//${this.name}_index = ${this.name}_phase | 0,\n`
    if( this.mode !== 'simple' ) {

    functionBody = `  var ${this.name}_dataIdx  = ${idx},
      ${this.name}_phase = ${this.mode === 'samples' ? inputs[0] : inputs[0] + ' * ' + (this.data.buffer.length - 1) },
      ${this.name}_index = ${this.name}_phase | 0,\n`

    //next = lengthIsLog2 ?
    if( this.boundmode === 'wrap' ) {
      next = lengthIsLog2 ?
      `( ${this.name}_index + 1 ) & (${this.data.buffer.length} - 1)` :
      `${this.name}_index + 1 >= ${this.data.buffer.length} ? ${this.name}_index + 1 - ${this.data.buffer.length} : ${this.name}_index + 1`
    }else if( this.boundmode === 'clamp' ) {
      next =
      `${this.name}_index + 1 >= ${this.data.buffer.length - 1} ? ${this.data.buffer.length - 1} : ${this.name}_index + 1`
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
      ${this.name}_out   = ${this.name}_index >= ${this.data.buffer.length - 1} || ${this.name}_index < 0 ? 0 : ${this.name}_base + ${this.name}_frac * ( memory[ ${this.name}_dataIdx + ${this.name}_next ] - ${this.name}_base )\n\n`
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
}

module.exports = ( data, index, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { channels:1, mode:'phase', interp:'linear', boundmode:'wrap' }

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, {
    data,
    dataName:   data.name,
    uid:        gen.getUID(),
    inputs:     [ index, data ],
  },
  defaults )

  ugen.name = ugen.basename + ugen.uid

  return ugen
}
