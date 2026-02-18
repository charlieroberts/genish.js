import utilities from '../utilities.js'
import { AudioContext, AudioWorkletNode } from '../../../node-web-audio-api/index.mjs'
import { open } from  'node:fs/promises'
import gen from '../gen.js'
import { ugens, run } from '../main.js'

// test with node src/debug/dynamic.js
// build wat file with node src/debug/compile.js
// and then convert to test.wasm
await gen.init()

let audioContext, samplerate, node, out

const wasmbytesfile = await open('./test.wasm')
const wasmbytes = await wasmbytesfile.readFile()

try {
  audioContext = new AudioContext({ latencyHint:'playback' })
  await audioContext.resume()
  await audioContext.audioWorklet.addModule( '../module.js' )

  utilities.sampleRate = audioContext.sampleRate
  utilities.ctx = audioContext
  samplerate = utilities.sampleRate

  // TODO: how to know ahead of time if stereo? some type 
  // of init function?
  const numChannels = 2
  node = new AudioWorkletNode( 
    audioContext, 
    'wasm-test',
    { 
      channelInterpretation:'discrete', 
      channelCount: numChannels, 
      outputChannelCount:[ numChannels ] 
    }
  )

  utilities.node = node

  // send wasm over messageport to worklet
  node.port.postMessage({
    address:'memory',
    wasm:wasmbytes,
    sr: audioContext.sampleRate,
    // TODO this is um messy
    // two 128 audio output channels, 50 poke slots
    sinebuffer: (256+50)*4,
    // + 1024 slots for sine buffer
    panlbuffer: (256+50+1024)*4,
    // + 1024 slots for panl buffer
    panrbuffer: (256+50+2048)*4
    // see setupMemory function for details
  })

  let arr, buffer, initialized = false
  node.port.onmessage = async msg => {
    if( initialized === false ) {
      arr = msg.data.memory
      buffer = arr

      utilities.setupMemory( buffer )
      const u = ugens.accum( .01 )
      const pu = run( u )

      console.log( pu )
      play( pu )
      node.connect( audioContext.destination )
      initialized = true
    }
  }

} catch(e) {
  console.error( e )
}


const play = function( ugen, __node ) {
  out = ugen
  const node = __node || utilities.node
  if( Array.isArray( ugen ) ) {
    node.port.postMessage({
      address:'renderStereo',
      left: {
        loc:ugen[0].idx*4,
      },
      right: {
        loc:ugen[1].idx*4,
      }
    })
  }else{
    node.port.postMessage({
      address:'render',
      loc:ugen.idx*4
    })
  }
}


