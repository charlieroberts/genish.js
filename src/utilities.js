import { data } from './main.js'

let audioContext = null, 
    node = null, 
    memf, memi,
    m = 0,
    memclear = 0

const utilities = {
  buffers: {},
  sampleRate: null,

  getMemory( amt ) {
    let idx = m
    m += amt
    return idx
  },

  setupMemory( buffer, __pokelength=50 ) {
    this.memf = memf   = new Float32Array( buffer )
    this.memi = memi   = new Int32Array( buffer )

    utilities.sridx = utilities.getMemory( 1 )
    memi[ utilities.sridx ] = 44100
    
    /*() for output buffer
    getMemory( 128 )
    // for right buffer if stereo 
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
          var audioData = req.response

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
  
  createWavetables() {  
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
  },

  play( ugen ) {
    window.out = ugen
  
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
  },

  factory( props, statics, baseidx, name ) {
    const obj = { name },
          keys = Object.keys( props ),
          statickeys = Object.keys( statics )
  
    // function id, properties, statics
    obj.idx = utilities.getMemory( 1 + keys.length + statickeys.length )
  
    // initial binary signature
    const initSig = Object.values( props ).reduce(
      (accum,val) => accum + ( isNaN(val) ? 1 : 0 ), 
      '0b'
    )
    
    // array of bits to twiddle
    const flags = Object.values( props ).map( v => isNaN  ( v ) ? 1 : 0 )
  
    let __fid = Object.values( props ).length >= 1 
      ? baseidx + Number( initSig )
      : baseidx
  
    Object.defineProperty( obj, 'fid', { 
      get() { return __fid },
      set(v) {
        __fid = v
        memi[ obj.idx ] = __fid
      }
    })
    
    obj.fid = __fid
  
    for( let i = 0; i < keys.length; i++ ) {
      const key = keys[ i ]
      const idx = obj.idx + 1 + i
  
      let value = props[ key ]
      Object.defineProperty( obj, key, {
        get() { return value },
        // get() { return memf[ idx * 4 ] },
        set( v ) {
          // is this a number or a ugen?
          const isUgen = isNaN( v ) ? 1 : 0
          // set flag for determining function signature
          flags[ i ] = isUgen
          // get number for signature
          const sig = Number( flags.reduce( (accum,val)=>accum+val, '0b') )
  
          obj.fid = baseidx + sig
          
          if( isUgen ) {
            memi[ idx ] = v.idx * 4
          }else{
            memf[ idx ] = v
          }
          value = v
        }
      })
  
      obj[ key ] = props[ key ]
    }
  
    let staticidx = obj.idx + 1 + keys.length
    for( let key of statickeys ) {
      const idx = staticidx
      Object.defineProperty( obj, key, {
        get() {
          const out = statics[ key ].type === 'f'
            ? memf[ idx ]
            : memi[ idx ]
          
          return out
        },
        set(v) {
          if( statics[ key ].type === 'f' )
            memf[ staticidx++ ] = v
          else
            memi[ staticidx++ ] = v
        }
      })
      obj[ key ] = statics[ key ].value
    }
  
    obj.__flags = flags
    obj.__props = props
    obj.__statics = statics
    obj.__memoryLength = keys.length + Object.keys( statickeys ).length 
  
    return obj
  },

  async startWorkletNode( graphfnc ) {
    // get wasm as bytes, start downloading as soon as
    // page loads

    const response = await fetch( '../test2.wasm')
    const wasmbytes =  await response.arrayBuffer()

    if( !audioContext ) {
      try {
        audioContext = new AudioContext()
        await audioContext.resume()
        await audioContext.audioWorklet.addModule( '../src/compiledWorklet.js' )
        
        utilities.sampleRate = audioContext.sampleRate
        utilities.ctx = audioContext
        const samplerate = utilities.sampleRate
  
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
          sr: audioContext.sampleRate
        })
              
        let arr
        node.port.onmessage = msg => {
          arr = msg.data.memory
          utilities.setupMemory( arr )
          utilities.createWavetables()

          const graph = graphfnc()
          node.port.postMessage({
            address:'render',
            loc:graph.idx * 4,
          })

          node.connect( audioContext.destination )
        }
        
        window.onclick = null  
      } catch(e) {
        console.error( e )
      }
    }
  }
}

export default utilities