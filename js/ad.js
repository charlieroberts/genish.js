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
    bang     = require( './bang.js' )

module.exports = ( attackTime = 44100, decayTime = 44100, _props ) => {
  let _bang = bang(),
      phase = accum( 1, _bang, { max: Infinity, shouldWrap:false }),
      props = Object.assign({}, { shape:'exp' }, _props ),
      bufferData, decayData, out, buffer

  if( props.shape === 'exp' ) {
    if( gen.globals.expCurve === undefined ) {
      buffer = new Float32Array( 1024 )

      for( let i = 0; i < 1024; i++ ) {
        buffer[ i ] = Math.pow( i/1024, 4 )
      }

      gen.globals.expCurve = bufferData = data( buffer )
    }else{
      bufferData = gen.globals.expCurve
    }
    out = ifelse([ 
      lt( phase, attackTime ), peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ), 
      lt( phase, attackTime + decayTime ), peek( bufferData, sub( 1, div( sub( phase, attackTime ), decayTime ) ), { boundmode:'clamp' }), 
      0
    ])
  }else if( props.shape === 'linear' ) {
    out = ifelse([ 
      lt( phase, attackTime ), memo( div( phase, attackTime ) ), //peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ), 
      lt( phase, attackTime + decayTime ), sub( 1, div( sub( phase, attackTime ), decayTime ) ), 
      0
    ])
  }

  out.trigger = _bang.trigger

  return out 
}
