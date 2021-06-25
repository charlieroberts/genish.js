/* 
ugen memory layout
[0] = function id
[1] = data
*/

let audioContext = null, 
    node = null, 
    wasmbytes = null,
    memf, memi, memf64, memi64

const MAX = 0x7FFFFFFF

logm = function() {
  console.log( m, memclear )
}

window.utilities = {
  buffers: {},
  sampleRate: null,
  
  clear() {
    memf.fill( 0, memclear )
    m = memclear
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

    /* pan */ 
    let bufferL = new Float32Array( 1024 ),
        bufferR = new Float32Array( 1024 )

    const angToRad = Math.PI / 180
    for( let i = 0; i < 1024; i++ ) { 
      let pan = i * ( 90 / 1024 )
      bufferL[i] = Math.cos( pan * angToRad ) 
      bufferR[i] = Math.sin( pan * angToRad )
    }

    utilities.panL = data( bufferL )
    utilities.panR = data( bufferR )
  }
}

const play = function( ugen ) {
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
}

// get wasm as bytes, start downloading as soon as
// page loads
fetch( '../dist/main.wasm')
  .then( response => response.arrayBuffer() )
  .then( bytes => wasmbytes = bytes )

// wait for user interaction event in page...
async function go() {
  if( !audioContext ) {
    try {
      audioContext = new AudioContext({ latencyHint:0 })
      await audioContext.resume()
      await audioContext.audioWorklet.addModule( '../src/module.js' )
      
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
        sr: audioContext.sampleRate
      })
            
      let arr
      node.port.onmessage = msg => {
        arr = msg.data.memory
        setupMemory( arr )
        node.connect( audioContext.destination )
      }
      
      window.onclick = null  
    } catch(e) {
      console.error( e )
    }
  }
}

let m = 0
let memclear = 0
const getMemory = function( amt ) {
  let idx = m
  m += amt
  return idx
}

let fidx = 0

const createProperty_old = function( obj, name, idx, start ) {
  let value
  Object.defineProperty( obj, name, {
    get() { return value },
    set(v){ 
      if( isNaN( v ) ) {
        if( v.type !== undefined && v.type === 'param' ) {
          memi[ idx ] = 2
          memi[ idx + 1 ] = v.idx * 4
        }else{
          memi[ idx ] = 1
          memi[ idx + 2 ] = v.fid
          memi[ idx + 3 ] = v.idx * 4
        }
      }else{
        memf[ idx ] = 0          
        memf[ idx + 1 ] = v
      }
      value = v
    }
  })
  
  obj[ name ] = start
}

const createProperty = function( obj, name, idx, start ) {
  let value
  Object.defineProperty( obj, name, {
    get() { return value },
    set(v){ 
      if( isNaN( v ) ) {
        if( v.type !== undefined && v.type === 'param' ) {
          memi[ idx ] = 2
          memi[ idx + 1 ] = v.idx * 4
        }else{
          memi[ idx ] = 1
          memi[ idx + 2 ] = v.fid
          memi[ idx + 3 ] = v.idx * 4
        }
      }else{
        memf[ idx ] = 0          
        memf[ idx + 1 ] = v
      }
      value = v
    }
  })
  
  obj[ name ] = start
}

const factory = function( props, statics, baseidx ) {
  const obj = {},
        keys = Object.keys( props ),
        statickeys = Object.keys( statics )

  // function id, properties, statics
  obj.idx = getMemory( 1 + keys.length + statickeys.length )

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
      }
    })

    obj[ key ] = props[ key ]
  }

  let staticidx = obj.idx + 1 + keys.length
  for( let key of statickeys ) {
    if( statics[ key ].type === 'f' )
      memf[ staticidx++ ] = statics[ key ].value
    else
      memi[ staticidx++ ] = statics[ key ].value
  }

  return obj
}

const monop = function() {
  const baseidx = fidx
  fidx += 2
  const fnc = function( x ) {
    const props = { '0':x },
          statics = {}

    return factory( props, statics, baseidx )
  }

  return fnc
}

const binop = function() {
  const baseidx = fidx
  fidx += 4
  const fnc = function( x,y ) {
    const props = { '0':x, '1':y },
          statics = {}

    return factory( props, statics, baseidx )
  }

  return fnc
}

const floor = monop(),
      ceil  = monop(),
      round = monop(),
      abs   = monop(),
      sqrt  = monop(),
      sin   = monop(),
      cos   = monop(),
      tan   = monop(),
      asin  = monop(),
      acos  = monop(),
      atan  = monop()

const add = binop(),
      sub = binop(),
      mul = binop(),
      div = binop(),
      and = binop(),
      or  = binop(),
      gt  = binop(),
      gte = binop(),
      lt  = binop(),
      lte = binop(),
      eq  = binop(),
      neq = binop(),
      gtp = binop(),
      ltp = binop(),
      min = binop(),
      max = binop()
  
let accum
{
  const baseidx = fidx
  fidx += 4
  accum = function( incr=0, reset=0, min=0, max=1, phase=0 ) {
    const props = { incr, reset },
          statics = { 
            'min':{ value:min, type:'f' }, 
            'max':{ value:max, type:'f' }, 
            'phase':{ value:phase, type:'f' }, 
          }

    return factory( props, statics, baseidx )
  }
}

let phasor
{
  const baseidx = fidx
  fidx += 2
  phasor = function( frequency=1, phase=0 ) {
    const props = { frequency },
          statics = { 
            'phase':{ value:phase, type:'f' } 
          }

    return factory( props, statics, baseidx )
  }
}

let peek
{
  const baseidx = fidx 
  fidx+=2
  peek = function( __data=0, phase=0, interp='linear', mode='phase' ) {
    const length = __data.length
    const props = { phase },
          statics = {
            dataIndex: { value:__data.idx * 4, type:'i' },
            length: { value:length, type:'f' },
            interpolation: { value: Number( interp==='linear' ), type:'i' },
            mode: { value: Number( mode==='phase'), type:'i' }
          }

    return factory( props, statics, baseidx )
  }
}

let cycle
{
  const baseidx = fidx
  fidx += 2
  cycle = function( frequency=1, phase=0 ) {
    const props = { frequency },
          statics = { 
            'phase':{ value:phase, type:'f' } 
          }

    return factory( props, statics, baseidx )
  }
}

let noise
{
  const baseidx = fidx
  fidx++
  noise = function( seed=0 ) {
    const props = {},
          statics = {
            a: { value:2 / 0xffffffff, type:'f'},
            seed: { value:0x67452301 + seed, type:'i' },
            b: { value:0xefcdab89, type:'i'}
          }
    
    return factory( props, statics, baseidx )
  }
}

let sah
{
  const baseidx = fidx
  fidx += 8
  sah = function( input=0, control=0, threshold=.9 ) {
    const props = { input, control, threshold },
          statics = {
            output: { value:0, type:'f'},
            control:{ value:0, type:'f'}
          }
  
    return factory( props, statics, baseidx )
  }
}


let memo
{
  const fid = fidx
  fidx += 2
  memo = function( input=0 ) {
    const props = { input }
    const statics = {
      lastClock:  { value:MAX, type:'i' },
      lastSample: { value:0,   type:'f' }
    }
    
    return factory( props, statics, fid )
  }
}

let caller 
{
  const fid = fidx
  fidx += 2
  caller = function( input, dataOffset ) {
    const props =   { input }
    const statics = { dataOffset: { value:dataOffset, type:'i' } }
    
    return factory( props, statics, fid )
  }
}

let counter
{
  const fid = fidx
  fidx += 8

  counter = function( incr=0, reset=0, max=1, phase=0 ) {
    
    const props = { incr,reset,max }
    const statics = { 
      phase: { value:phase, type:'f' },
      wrap:  { value:0, type:'f' },
    }
    
    const obj = factory( props, statics, fid )

    // return memoized object because output and .wrap
    // might often both be used
    const __memo = memo( obj )

    Object.defineProperty( __memo, 'wrap', {
      get() {
        // 52 is wrap offset
        const out =  caller( __memo, 5 )
        return out
      }
    })
  
    return __memo
  }
}

let bus
{
  let fid = fidx++
  bus = function( size=10, gain = 1 ) {
    const obj = {
      idx : getMemory( size + 3 ),
      fid,
      connected:[],

      connect( ...ugens ) {
        ugens.forEach( ugen => {          
          const idx     = obj.idx + 3 + obj.connected.length
          //memi[ idx   ] = ugen.fid
          memi[ idx ] = ugen.idx * 4
        
          obj.connected.push( ugen )
        })
        
        memi[ obj.idx + 2 ] = obj.connected.length
      }
    }
  
    //createProperty( obj, 'gain', obj.idx, gain )

    memi[ obj.idx + 2 ] = 0
    memf[ obj.idx + 1 ] = gain
    memi[ obj.idx ] = fid
  
    return obj
  }
}

let ssd 
{
  const fid = fidx++
  ssd = function( init=0 ) {
    const obj = {
      idx : getMemory( 3 ),
      fid,
      in( input ) {
        // must memoize to avoid infinite recursion
        memi[ obj.idx + 2 ] = memo( input ).idx * 4
      }
    }
    
    Object.defineProperty( obj, 'out', {
      get() {
        let out = {
          fid: obj.fid,
          idx: obj.idx
        }
        
        return out
      }
    })
        
    memf[ obj.idx + 1 ] = init
    memi[ obj.idx ] = fid
      
    return obj
  }
}

let delay
{
  const baseidx = fidx
  fidx += 4

  delay = function( input=0, time=22050, maxSize=44100 ) {
    const props = { input, time },
    statics = {
      maxSize: { value:maxSize, type:'f'},
      writePos:{ value:0, type:'i'}
    }

    const obj = factory( props, statics, baseidx )
    getMemory( maxSize )

    return obj
  }
}

let ifelse
{
  let fid = fidx++,
      fid2 = fidx++

  ifelse = function( condition=1, t=1, f=0, shouldProcess=false ) {
    const obj = {
      idx : getMemory( 12 ),
      fid,
    }

    if( shouldProcess ) obj.fid = fid2
  
    createProperty( obj, 'condition', obj.idx, condition )
    createProperty( obj, 'true', obj.idx + 4, t )
    createProperty( obj, 'false', obj.idx + 8, f ) 
    
    return obj
  }
}

const data = function( __data, type='float' ) {
  let obj

  if( typeof __data === 'string' ) { 
    if( utilities[ __data ] === undefined ) {
      // load file, return promise
      obj = utilities.loadSample( __data )
    }
  }else{ 
    // array of data should be passed, 
    // copy into memory and return obj
    obj = { 
      idx : getMemory( __data.length ),
      length: __data.length
    }
  
    if( type === 'float' ) {
      memf.set( __data, obj.idx )
    }else{
      memf.set( __data, obj.idx )
    }
  }

  return obj
}

const param = init => {
  const obj = {
    type: 'param',
    idx: getMemory(1)
  }
  
  let value = init
  Object.defineProperty( obj, 'value', {
    get() { return value },
    set(v) {
      if( isNaN(v) ) {
        throw Error('Params can only have numberic values; you assigned:', v )
      }else{
        value = v
        memf[ obj.idx ] = value
      }
    }
  })
  
  memf[ obj.idx ] = init
  
  return obj
}

let poke
{ 
  let fid = fidx++
  poke = function( data, value, index ) {
    const obj = {
      idx: getMemory( 9 ),
      fid
    }
    
    createProperty( obj, 'value', obj.idx, x )
    createProperty( obj, 'index', obj.idx + 4, y )
    
    memi[ obj.idx + 8 ] = data.idx
  
    return obj
  }
}

let bang
{
  let fid = fidx++
  bang = function() {
    const obj = {
      idx : getMemory( 1 ),
      trigger() {
        memf[ obj.idx ] = 1
      },
      fid,
    }
    
    return obj
  }
}

let clamp
{
  let fid = fidx++
  clamp = function( input=0, min=0,max=1 ) {
    const obj = {
      idx : getMemory( 12 ),
      fid
    }
  
    createProperty( obj, 'input', obj.idx, input )
    createProperty( obj, 'min', obj.idx + 4, min )
    createProperty( obj, 'max', obj.idx + 8, max )
    
    return obj
  }
}

let ad
{
  let fid = fidx++
  ad = function( attack=44100, decay=44100 ) {
    const obj = {
      idx : getMemory( 8 ),
      fid,
      bang: bang()
    }
    
    // accum memory location is +36 bytes (32 for ad, 4 for bang)
    obj.accum = accum(1, obj.bang, 0, MAX, attack+decay )
  
    createProperty( obj, 'attack', obj.idx,     attack )
    createProperty( obj, 'decay',  obj.idx + 4, decay )
  
    let trigger = obj.bang.trigger
    Object.defineProperty( obj, 'trigger', {
      get() { return trigger },
      set(v) {
        env.accum.reset = trigger = v
      }
    })

    return obj
  }
}



// let delay
// {
//   const fid = fidx++
//   delay = function( input=0, time=22050, maxSize=44100 ) {
//     const obj = {
//       idx: getMemory( 1000 + maxSize ),
//       fid,
//       peek:  peek() // + 60
//     }
    
//     createProperty( obj, 'input', obj.idx,     input )
//     createProperty( obj, 'time',  obj.idx + 4, time )
    
//     memf[ obj.idx + 8 ] = maxSize
//     memi[ obj.idx + 9 ] = 0 // write position
    
    
//     return obj
//   }
// }

let mix
{
  const fid = fidx++
  mix = function( in1=0, in2=0, t=1 ) {
    const obj = {
      idx : getMemory( 12 ),
      fid
    }
  
    createProperty( obj, 'in1', obj.idx, in1 )
    createProperty( obj, 'in2', obj.idx + 4, in2 )
    createProperty( obj, 't', obj.idx + 8, t )
    
    return obj
  }
}

let slide
{
  const fid = fidx++
  slide = function( input=0, slideUp=1000, slideDown=1000 ) {
    const obj = {
      idx : getMemory( 13 ),
      fid
    }
    
    createProperty( obj, 'input', obj.idx, input )
    createProperty( obj, 'slideUp', obj.idx + 4, slideUp )
    createProperty( obj, 'slideDown', obj.idx + 8, slideDown )
    
    memf[ obj.idx + 12 ] = 0 // held output value
    
    return obj
  }
}


// let counter
// {
//   const fid = fidx++
//   counter = function( incr=0, reset=0, max=1, phase=0 ) {
    
//     const obj = {
//       idx : getMemory( 14 ),
//       fid,
//     }

//     memf[ obj.idx + 12 ] = phase
//     memf[ obj.idx + 13 ] = 0

//     // return memoized object because output and .wrap
//     // might often both be used
//     const __memo = memo( obj )

//     Object.defineProperty( __memo, 'wrap', {
//       get() {
//         // 52 is wrap offset
//         const out =  caller( __memo, 52 )
//         return out
//       }
//     })

//     createProperty( __memo, 'incr',  obj.idx,     incr )
//     createProperty( __memo, 'reset', obj.idx + 4, reset )
//     createProperty( __memo, 'max',   obj.idx + 8, max )
  
//     return __memo
//   }
// }



// helps with functions have extra outputs that depend on the
// function being called to generate (like counter.wrap).
// let caller 
// {
//   const fid = fidx++
//   caller = function( input, dataOffset ) {
//     const obj = {
//       idx : getMemory( 5 ),
//       fid
//     }

//     createProperty( obj, 'input',  obj.idx, input )
    
//     memi[ obj.idx + 4 ] = (input.input.idx * 4) + dataOffset

//     return obj
//   }
// }

let float 
{
  const fid = fidx++
  float = function( idx ) {
    const obj = {
      idx,
      fid
    }

    return obj
  }
}

// TODO be sure to include information on how pan value
// is automatically memoized. 
// There is only one extra indirect call here (the mul).
// I think that's fine.
let pan
{
  //const fid = fidx++
  pan = function( left, right, pan ) {
    // enable one input (mono) or two (stereo)
    // by doing some argument swizzling.
    let p1, p2
    if( pan === undefined) {
      pan = right
      // memoize mono input, since it will be 
      // processed twice.
      left = memo( left )
      right = left
    }

    const obj = {
      left:  mul( left,  p1 = peek( utilities.panL, pan )),
      right: mul( right, p2 = peek( utilities.panR, pan )),
    }

    let value = pan
    Object.defineProperty( obj, 'value', {
      get() { return value },
      set(v) {
        if( typeof v === 'object' ) v = memo(v)
        p1.phase = v
        p2.phase = v
      }
    })
    
    obj.value = pan

    return obj
  }
}

// let sin = monop()
// let cos = monop()
// let tan = monop()
// let asin = monop()
// let acos = monop()
// let atan = monop()
// let tanh = monop()
// let pow  = binop()
// let atan2 = binop()

function setupMemory( buffer ) {
  memf = new Float32Array( buffer )
  memf64 = new Float64Array( buffer )
  memi = new Int32Array( buffer )  
  
  // for output buffer
  getMemory( 128 )
  // for right buffer if stereo
  // TODO: fix so that there is no memory
  // allocated for the right channel if the instrument
  // is mono
  getMemory( 128 )

  utilities.createWavetables()

  // store index for clearing memory
  memclear = m
}

window.node = node
window.context = audioContext
window.onclick = go