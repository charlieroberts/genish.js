import gen from '../src/gen.js'
import utilities from '../src/utilities.js'
import { exports } from '../src/main.js'
import startWorkletNode from '../src/startWorklet.js'
import { download } from './download.js'

const memAmount = 50
window.onload = async function() {
  await gen.init()

  window.node = null
  window.mem = new WebAssembly.Memory({ 
    initial:memAmount, maximum:memAmount, shared:true
  })
  window.memf = new Float32Array( mem.buffer )
  window.memi = new Int32Array( mem.buffer )
  window.gen = gen
  window.utilities = utilities
  window.gen.utilities = window.utilities

  utilities.setupMemory( mem.buffer )
  utilities.createWavetables()

  /*let sampleratefunc = exports.samplerate
  delete window.samplerate

  Object.defineProperty( window, 'samplerate', {
    get() {
      if( utilities.ctx !== null ) {
        return utilities.ctx.sampleRate
      }else{
        return sampleratefunc()
      }
    },
    set(v) {

    }
  })
  */

  const beginContext = function() {
    utilities.ctx = new AudioContext()
    startWorkletNode.setAudioContext( utilities.ctx )
    window.removeEventListener( 'click', beginContext )
  }
  window.addEventListener( 'click', beginContext )


  Object.assign( window, exports )

  window.poke = gen.ugens.poke
  
  const b = teeny.create({ 
    flashColor:'white',
    flashTime: 100,
    value: `play( accum(.005) )`
  })
  window.editor = b

  window.play = async function( graph, shouldPrintWat=false, shouldDebug=false ) {
    if( window.node !== null ) {
      window.clear()
    }//else{
    //  utilities.resetMemory( 1025 )
    //}

    utilities.__debugMemory = shouldDebug

    window.graph = graph

    const func     = gen.function( graph ),
          wat      = gen.module( func, false, memAmount )

    if( shouldPrintWat ) console.log( wat )

    const blob = gen.blob( wat, window.mem, false )
    window.node = await startWorkletNode( blob.buffer, window.mem, false, shouldDebug, '../src/compiledWorklet.js', Array.isArray(graph) )

    return window.node
  }

  window.playenv = async function( shouldPrintWat=false, shouldDebug=false ) {
    if( window.node !== null ) {
      window.clear()
    }

    utilities.__debugMemory = shouldDebug

    const wat = gen.wasmenvironment( shouldPrintWat )

    if( shouldPrintWat ) console.log( wat )

    const blob = gen.blob( wat, window.mem, false )

    window.node = await startWorkletNode( 
      blob.buffer, 
      window.mem, 
      false, 
      shouldDebug,
      '../src/workletTest.js', 
      false
    )

    return window.node
  }


  window.clear = function() {
    window.node.port.postMessage({ address:'stop' })
    window.node.disconnect()
    window.node = null

    // 0-1024 is samplerate (1) + cycle wavetable (1024)
    // TODO will need to increase to include pan wavetables
    utilities.resetMemory( 1 )
    memf.fill(0,1)
    utilities.createWavetables()
  }

  // problems accessing window scope when using eval...
  b.subscribe( 'run', txt => ( new Function( txt ))() ); 

  b.subscribe( 'keydown', e => {
    if( e.ctrlKey && e.key === '.' ) {
      clear( true )
    }
  })

  window.download = function( name ) {
    download( name, memAmount )
  }

  const file = fetch( './examples/'+demos[ 0 ] )
      .then( response => response.text() ) 
      .then( text => editor.value = text )

  initMenu()
}

const demos = [
  'intro.js',
  'thereminish.js',
  'oneDelayLine.js',
  'slicingAndDicing.js',
  'crush.js',
  'sequencing.js',
  'sync.js',
  'bandlimited.js',
  'enveloping.js',
  'freeverb.js',
  'karplus.js',
  'twopole_va.js',
  'fourpole_ladder_va.js'
]

const initMenu = function() {
  const menu = document.getElementsByTagName('select')[0]
  menu.onchange = e => {
    const idx = e.target.selectedIndex
    const file = fetch( './examples/'+demos[ idx ] )
      .then( response => response.text() ) 
      .then( text => editor.value = text )
  }
}

window.teeny.rules = {
  keywords: /\b(new|if|else|do|while|switch|for|of|continue|break|return|typeof|function|var|const|let)(?=[^\w])/g,

  numbers: /\b(\d+)/g,

  strings: /(".*?"|'.*?'|\`(.|\n)*?\`)/g,
  comments: /(\/\/.*|\/\*(.|\n)*?\*\/)/g
}
