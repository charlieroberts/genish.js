'use strict'

let gen      = require( './gen.js' ),
    mul      = require( './mul.js' ),
    sub      = require( './sub.js' ),
    div      = require( './div.js' ),
    data     = require( './data.js' ),
    peek     = require( './peek.js' ),
    accum    = require( './accum.js' ),
    ifelsef = require( './ifelseif.js' ),
    lt       = require( './lt.js' ),
    bang     = require( './bang.js' ),
    env      = require( './env.js' )

module.exports = ( attackTime = 44100, decayTime = 44100, _props ) => {
  let _bang = bang(),
      phase = accum( 1, _bang, { max: Infinity, shouldWrap:false }),
      props = Object.assign({}, { shape:'exponential', alpha:5 }, _props ),
      bufferData, decayData, out, buffer

  // slightly more efficient to use existing phase accumulator for linear envelopes
  if( props.shape === 'linear' ) {
    out = ifelse( 
      lt( phase, attackTime ), memo( div( phase, attackTime ) ),
      lt( phase, attackTime + decayTime ), sub( 1, div( sub( phase, attackTime ), decayTime ) ), 
      0
    )
  } else {     
    bufferData = env( 1024, { type:props.shape, alpha:props.alpha } )
    out = ifelse( 
      lt( phase, attackTime ), 
        peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ), 
      lt( phase, attackTime + decayTime ), 
        peek( bufferData, sub( 1, div( sub( phase, attackTime ), decayTime ) ), { boundmode:'clamp' }), 
      0
    )
  }
   
  out.trigger = _bang.trigger

  return out 
}
