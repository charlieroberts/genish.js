'use strict'

let gen = require( './gen.js' ),
    data = require( './data.js' )

let isStereo = false

let utilities = {
  ctx: null,

  clear() {
    if( this.workletNode !== undefined ) {
      this.workletNode.disconnect()
    }else{
      this.callback = () => 0
      this.clear.callbacks.forEach( v => v() )
      this.clear.callbacks.length = 0
    }
  },

  createContext() {
    let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext
    this.ctx = new AC()

    gen.samplerate = this.ctx.sampleRate

    let start = () => {
      if( typeof AC !== 'undefined' ) {
        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener( 'touchstart', start )

          if( 'ontouchstart' in document.documentElement ) { // required to start audio under iOS 6
             let mySource = utilities.ctx.createBufferSource()
             mySource.connect( utilities.ctx.destination )
             mySource.noteOn( 0 )
           }
         }
      }
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }

    return this
  },

  createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor( 1024, 0, 2 )
    this.clearFunction = function() { return 0 }
    if( typeof this.callback === 'undefined' ) this.callback = this.clearFunction

    this.node.onaudioprocess = function( audioProcessingEvent ) {
      var outputBuffer = audioProcessingEvent.outputBuffer;

      var left = outputBuffer.getChannelData( 0 ),
          right= outputBuffer.getChannelData( 1 ),
          isStereo = utilities.isStereo

     for( var sample = 0; sample < left.length; sample++ ) {
        var out = utilities.callback()

        if( isStereo === false ) {
          left[ sample ] = right[ sample ] = out 
        }else{
          left[ sample  ] = out[0]
          right[ sample ] = out[1]
        }
      }
    }

    this.node.connect( this.ctx.destination )

    return this
  },

  createWorkletProcessor( graph, name, debug ) {
    //const mem = MemoryHelper.create( 4096, Float64Array )
    const cb = gen.createCallback( graph, 4096, debug )

    const workletCode = `
class ${name}Processor extends AudioWorkletProcessor {
  constructor( options ) {
    super( options )
    this.memory = new Float64Array(4096)
    this.noise  = Math.random
  }

  callback${cb.toString().slice(9)}

  process( inputs, outputs, parameters ) {
    const output = outputs[0]
    const memory = this.memory
    const left   = output[ 0 ]
    const len    = left.length

    for( let idx = 0; idx < len; ++idx ) {
      let out = this.callback() 

      left[ idx ] = out
    }

    return true
  }
}
    
registerProcessor( '${name}', ${name}Processor)`

    const url = window.URL.createObjectURL(
      new Blob(
        [ workletCode ], 
        { type: 'text/javascript' }
      )
    )
    
    

    return [ url, workletCode ] 
  },

  playWorklet( graph, name, debug=false ) {
    const [ url, codeString ] = utilities.createWorkletProcessor( graph, name, debug )

    utilities.ctx.audioWorklet.addModule( url ).then( ()=> {
      const workletNode = new AudioWorkletNode( utilities.ctx, name )
      workletNode.connect( utilities.ctx.destination )

      utilities.workletNode = workletNode

      if( utilities.console ) utilities.console.setValue( codeString )

      return codeString
    })
  },
  
  playGraph( graph, debug, mem=44100*10, memType=Float32Array ) {
    utilities.clear()
    if( debug === undefined ) debug = false
          
    this.isStereo = Array.isArray( graph )

    utilities.callback = gen.createCallback( graph, mem, debug, false, memType )
    
    if( utilities.console ) utilities.console.setValue( utilities.callback.toString() )

    return utilities.callback
  },

  loadSample( soundFilePath, data ) {
    let req = new XMLHttpRequest()
    req.open( 'GET', soundFilePath, true )
    req.responseType = 'arraybuffer' 
    
    let promise = new Promise( (resolve,reject) => {
      req.onload = function() {
        var audioData = req.response

        utilities.ctx.decodeAudioData( audioData, (buffer) => {
          data.buffer = buffer.getChannelData(0)
          resolve( data.buffer )
        })
      }
    })

    req.send()

    return promise
  }

}

utilities.clear.callbacks = []

module.exports = utilities
