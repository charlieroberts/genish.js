import gen from '../src/gen.js'
import utilities from '../src/utilities.js'
import { exports } from '../src/main.js'
import startWorkletNode from '../src/startWorklet.js'
import { download } from './download.js'

window.onload = async function() {
  await gen.init()

  window.node = null
  window.mem = new WebAssembly.Memory({ 
    initial:5, maximum:5, shared:true
  })
  window.memf = new Float32Array( mem.buffer )
  window.memi = new Int32Array( mem.buffer )

  utilities.setupMemory( mem.buffer )
  utilities.createWavetables()

  Object.assign( window, exports )
  
  const b = bitty.create({ 
    flashColor:'white',
    flashTime: 100,
    value: `play( accum(.005) )`
  })
  window.editor = b

  window.play = async function( graph, shouldPrintWat=false ) {
    if( window.node !== null ) window.clear()

    window.graph = graph
    const func     = gen.function( graph ),
          wat      = gen.module( func, false, 5 )

    const blob = gen.blob( wat, window.mem, false )
    window.node = await startWorkletNode( blob.buffer, window.mem, false, false )

    if( shouldPrintWat ) console.log( wat )
    return window.node
  }

  window.clear = function() {
    window.node.port.postMessage({ address:'stop' })
    window.node.disconnect()
    window.node = null

    // 0-1024 is samplerate (1) + cycle wavetable (1024)
    // will need to increase to include pan wavetables
    utilities.resetMemory( 1025 )
  }

  // problems accessing window scope when using eval...
  b.subscribe( 'run', txt => ( new Function( txt ))() ); 

  b.subscribe( 'keydown', e => {
    if( e.ctrlKey && e.key === '.' ) {
      clear( true )
    }
  })

  window.download = download
}

window.bitty.rules = {
  keywords: /\b(new|if|else|do|while|switch|for|of|continue|break|return|typeof|function|var|const|let|\.length)(?=[^\w])/g,

  numbers: /\b(\d+)/g,

  strings: /(".*?"|'.*?'|\`(.|\n)*?\`)/g,
  comments: /(\/\/.*|\/\*(.|\n)*?\*\/)/g
}
