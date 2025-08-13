import utilities from './utilities.js'

let audioContext = null
let node = null
let init = false

const startWorkletNode = async function( wasmbuffer,  mem, shouldPrint=false, shouldDebug=false, path='../src/compiledWorklet.js', isStereo=false ) {
  if( init === false ) {
    try {
      audioContext = new AudioContext()
      await audioContext.resume()
      await audioContext.audioWorklet.addModule( path )
      init = true
    }catch(e) {
      console.log( 'could not make context:', e )
    }
  }
      
  utilities.sampleRate = audioContext.sampleRate
  utilities.ctx = audioContext
  const samplerate = utilities.sampleRate

  // TODO: how to know ahead of time if stereo? some type 
  // of init function?
  const numChannels = 2
  node = await new AudioWorkletNode( 
    audioContext, 
    'wasm-test',
    { 
      channelInterpretation:'discrete', 
      channelCount: numChannels, 
      outputChannelCount:[ numChannels ] 
    }
  )

  //node.wat = wat
  node.buffer = wasmbuffer
  utilities.node = node

  // send wasm over messageport to worklet
  node.port.postMessage({
    address:'memory',
    wasm:wasmbuffer,
    sr: audioContext.sampleRate,
    memory:mem,
    debug:shouldDebug
  })
        
  let arr
  node.port.onmessage = msg => {
    if( msg.data.address === 'initialized' ) { 

      if( !isStereo ) {
        node.port.postMessage({
          address:'render',
          loc:0//graph.idx * 4,
        })
      }else{
        node.port.postMessage({
          address:'renderStereo',
          loc:0//graph.idx * 4,
        })
      }

      if( typeof node.oninit === 'function' ) {
        node.oninit( node )
      }
    }

    node.connect( audioContext.destination )
  }

  return node
}

startWorkletNode.setAudioContext = function( ctx ) { audioContext = ctx }

export default startWorkletNode
