'use strict'

let gen   = require( './gen.js' ),
    accum = require( './accum.js' ),
    counter= require( './counter.js' ),
    peek  = require( './peek.js' ),
    ssd   = require( './history.js' ),
    data  = require( './data.js' ),
    proto = { basename:'seq' }

module.exports = ( durations = 11025, values = [0,1], phaseIncrement = 1) => {
  let clock
  
  if( Array.isArray( durations ) ) {
    // we want a counter that is using our current
    // rate value, but we want the rate value to be derived from
    // the counter. must insert a single-sample dealy to avoid
    // infinite loop.
    const clock2 = counter( 0, 0, durations.length )
    const __durations = peek( data( durations ), clock2, { mode:'simple' }) 
    clock = counter( phaseIncrement, 0, __durations )
    
    // add one sample delay to avoid codegen loop
    const s = ssd()
    s.in( clock.wrap )
    clock2.inputs[0] = s.out
  }else{
    // if the rate argument is a single value we don't need to
    // do anything tricky.
    clock = counter( phaseIncrement, 0, durations )
  }
  
  const stepper = accum( clock.wrap, 0, { min:0, max:values.length })
   
  const ugen = peek( data( values ), stepper, { mode:'simple' })

  ugen.name = proto.basename + gen.getUID()
  ugen.trigger = clock.wrap

  return ugen
}
