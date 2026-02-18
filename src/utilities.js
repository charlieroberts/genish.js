//import { data } from './main.js'

let memf, memi,
    m = 0,
    memclear = 0

const utilities = {
  buffers: {},
  sampleRate: null,
  __debugMemory: false,
  ctx: null,

  getMemoryIndex() { return m },

  getMemory( amt, name='unknown' ) {
    console.log( m, amt, m+amt )
    if( m + amt > utilities.memf.length ) {
      throw( `Your memory request of ${amt} blocks would exceed the max memory size of ${utilities.memf.length} available blocks. Please allocate more memory in your call to ${name}` )
    }
    if( utilities.__debugMemory === true ) {
      console.log( 'getting ' + amt + ' block(s) of memory for ' + name + '.', m )
    }
    let idx = m
    m += amt
    return idx
  },

  resetMemory( start = 0 ) { 
    if( utilities.memf !== undefined ) {
      if( utilities.__debugMemory ) console.log( 'reset memory ', start )
      m = start
      utilities.memf.fill( 0, start )
    }
  },

  shouldMemo: true,

  setupMemory( buffer, __pokelength=50 ) {
    utilities.memf = memf   = new Float32Array( buffer )
    utilities.memi = memi   = new Int32Array( buffer )

    console.log( 'memf:', utilities.memf )

    //utilities.sridx = utilities.getMemory( 1, 'sample rate' )
    //memi[ utilities.sridx ] = 44100
    
    utilities.getMemory(128, 'output in setupMemory')
    /*() for output buffer
    getMemory( 128 )
    /* for right buffer if stereo 
    // TODO: fix so that there is no memory
    // allocated for the right channel if the instrument
    // is mono
    getMemory( 128 )
  
    pokelength = __pokelength
    pokememoryindex = getMemory( pokelength )
  
    utilities.createWavetables()
    
    // store index for clearing memory
    memclear = m
    */
  
    return { memf, memi }
  },

  clear() {
    memf.fill( 0, pokememoryindex, pokememoryindex + pokelength)
    memf.fill( 0, memclear )
    m = memclear
    pokeindex = getMemory( 50 )
    play([ add(0,0), add(0,0) ])
  },

  loadSample( soundFilePath ) {
    const isLoaded = utilities.buffers[ soundFilePath ] !== undefined

    const req = new XMLHttpRequest()
    req.open( 'GET', soundFilePath, true )
    req.responseType = 'arraybuffer' 
    
    const promise = new Promise( (resolve,reject) => {
      if( !isLoaded ) {
        req.onload = function() {
          const audioData = req.response

          utilities.ctx.decodeAudioData( audioData, buffer => {
            utilities.buffers[ soundFilePath ] = buffer.getChannelData(0)
            
            resolve( data( utilities.buffers[ soundFilePath ] ) )
          })
        }
      }else{
        setTimeout( ()=> {
          resolve( data( utilities.buffers[ soundFilePath ] ) )
        }, 0 )
      }
    })

    if( !isLoaded ) req.send()

    return promise
  },
  
  createWavetables( location=1 ) {  
    /* sine */
    let sinebuffer = new Float32Array( 1024 )

    for( let i = 0, l = sinebuffer.length; i < l; i++ ) {
      sinebuffer[ i ] = Math.sin( ( i / l ) * ( Math.PI * 2 ) )
    }

    utilities.sinedata = data( sinebuffer ) 
    utilities.sinedata.__static = true


    /* pan */ 
    // let bufferL = new Float32Array( 1024 ),
    //     bufferR = new Float32Array( 1024 )

    // const angToRad = Math.PI / 180
    // for( let i = 0; i < 1024; i++ ) { 
    //   let pan = i * ( 90 / 1024 )
    //   bufferL[i] = Math.cos( pan * angToRad ) 
    //   bufferR[i] = Math.sin( pan * angToRad )
    // }

    // utilities.panL = data( bufferL )
    // utilities.panR = data( bufferR )
  }

}

export default utilities
