'use strict'

/**
 * History is used to create single-sample delays and feedback. It records one
 * sample at a time of a ugen passed to its `in()` method, and then outputs the
 * last recorded sample via its `.out` property.
 *
 * Single-sample delays are one of the justifications for the existence
 * of genish.js; this is an important ugen.
 *
 * Since `history` is a browser global variable, this function is aliased
 * to `ssd`
 *
 * #### Properties
 * - `out`: *ugen* The `out` property is a simple ugen that outputs the last recorded sample of the history object.
 *
 * #### Methods
 * - `in` **ugen** &nbsp;  *ugen* &nbsp; A genish.js unit generator (or graph) to be recorded.
 *
 * @name history
 * @alias ssd
 * @function
 * @example
 * // a randomly pitched oscillator and a delay line
 * frequencyControl = sah( add( 220, mul( noise(),880 ) ), noise(), .99995 )
 * osc = mul( cycle( frequencyControl ), .025 )
 * feedback = ssd()
 * // feed feedback into our delay by inputting the feedback.out property
 * echo = delay( add( osc, feedback.out ), 11025, { size: 22050 } )
 * // record the output of the echo and our feedback using a call to feedback.in()
 * mixer = feedback.in( mix( echo, feedback.out, .925 ) )
 * gen.createCallback( mixer )
 * @memberof module:feedback
 */

let gen  = require('./gen.js')

module.exports = ( in1=0 ) => {
  let ugen = {
    inputs: [ in1 ],
    memory: { value: { length:1, idx: null } },
    recorder: null,

    in( v ) {
      if( gen.histories.has( v ) ){
        let memoHistory = gen.histories.get( v )
        ugen.name = memoHistory.name
        return memoHistory
      }

      let obj = {
        gen() {
          let inputs = gen.getInputs( ugen )

          if( ugen.memory.value.idx === null ) {
            gen.requestMemory( ugen.memory )
            gen.memory.heap[ ugen.memory.value.idx ] = in1
          }

          let idx = ugen.memory.value.idx

          gen.addToEndBlock( 'memory[ ' + idx + ' ] = ' + inputs[ 0 ] )

          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
          gen.histories.set( v, obj )

          return inputs[ 0 ]
        },
        name: ugen.name + '_in'+gen.getUID(),
        memory: ugen.memory
      }

      this.inputs[ 0 ] = v

      ugen.recorder = obj

      return obj
    },

    out: {

      gen() {
        if( ugen.memory.value.idx === null ) {
          if( gen.histories.get( ugen.inputs[0] ) === undefined ) {
            gen.histories.set( ugen.inputs[0], ugen.recorder )
          }
          gen.requestMemory( ugen.memory )
          gen.memory.heap[ ugen.memory.value.idx ] = parseFloat( in1 )
        }
        let idx = ugen.memory.value.idx

        return 'memory[ ' + idx + ' ] '
      },
    },

    uid: gen.getUID(),
  }

  ugen.out.memory = ugen.memory

  ugen.name = 'history' + ugen.uid
  ugen.out.name = ugen.name + '_out'
  ugen.in._name  = ugen.name = '_in'

  Object.defineProperty( ugen, 'value', {
    get() {
      if( this.memory.value.idx !== null ) {
        return gen.memory.heap[ this.memory.value.idx ]
      }
    },
    set( v ) {
      if( this.memory.value.idx !== null ) {
        gen.memory.heap[ this.memory.value.idx ] = v
      }
    }
  })

  return ugen
}
