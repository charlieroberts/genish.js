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

const logm = function() {
  console.log( m, memclear )
}

const utilities = {
  buffers: {},
  sampleRate: null,
  
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
  }
}

// get wasm as bytes, start downloading as soon as
// page loads
// fetch( '../dist/main.wasm')
//   .then( response => response.arrayBuffer() )
//   .then( bytes => wasmbytes = bytes )

// wait for user interaction event in page...
async function go() {
  if( !audioContext ) {
    try {
      audioContext = new AudioContext({ latencyHint:.1 })
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

const factory = function( props, statics, baseidx, name ) {
  const obj = { name },
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
  obj.__memoryLength = keys.length + Object.keys( statickeys ).length 

  return obj
}

const monop = function( name ) {
  const baseidx = fidx
  fidx += 2
  const fnc = function( x ) {
    const props = { '0':x },
          statics = {}

    return factory( props, statics, baseidx, name )
  }

  return fnc
}

const binop = function( name ) {
  const baseidx = fidx
  fidx += 4
  const fnc = function( x,y ) {
    const props = { '0':x, '1':y },
          statics = {}

    return factory( props, statics, baseidx, name )
  }

  return fnc
}

const floor = monop( 'floor' ),
      ceil  = monop( 'ceil' ),
      round = monop( 'round' ),
      abs   = monop( 'abs' ),
      sqrt  = monop( 'sqrt' ),
      sin   = monop( 'sin' ),
      cos   = monop( 'cos' ),
      tan   = monop( 'tan' ),
      asin  = monop( 'asin' ),
      acos  = monop( 'acos' ),
      atan  = monop( 'atan' )

const add = binop( 'add' ),
      sub = binop( 'sub' ),
      mul = binop( 'mul' ),
      div = binop( 'div' ),
      and = binop( 'and' ),
      or  = binop( 'or' ),
      gt  = binop( 'gt' ),
      gte = binop( 'gte' ),
      lt  = binop( 'lt' ),
      lte = binop( 'lte' ),
      eq  = binop( 'eq' ),
      neq = binop( 'neq' ),
      gtp = binop( 'gtp' ),
      ltp = binop( 'ltp' ),
      min = binop( 'min' ),
      max = binop( 'max' ),
      pow = binop( 'pow' ),
      mod = binop( 'mod' )
  
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

    return factory( props, statics, baseidx, 'accum' )
  }
}

let phasor
{
  const baseidx = fidx
  fidx += 4
  phasor = function( frequency=1, reset=0, phase=0 ) {
    const props = { frequency, reset },
          statics = { 
            'phase':{ value:phase, type:'f' } 
          }

    return factory( props, statics, baseidx, 'phasor' )
  }
}

let peek
{
  const baseidx = fidx 
  fidx+=2
  peek = function( __data=0, index=0, interp='linear', mode='phase' ) {
    const length = __data.length
    const props = { index },
          statics = {
            dataIndex: { value:__data.idx * 4, type:'i' },
            length: { value:length-1, type:'f' },
            interpolation: { value: Number( interp==='linear' ), type:'i' },
            mode: { value: Number( mode==='phase'), type:'i' }
          }

    const obj = factory( props, statics, baseidx, 'peek' )
    obj.data = __data

    return obj
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

    return factory( props, statics, baseidx, 'cycle' )
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
    
    return factory( props, statics, baseidx, 'noise' )
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
  
    return factory( props, statics, baseidx, 'sah' )
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
    
    return factory( props, statics, fid, 'memo' )
  }
}

let caller 
{
  const fid = fidx
  fidx += 2
  caller = function( input, dataOffset ) {
    const props =   { input }
    const statics = { dataOffset: { value:dataOffset, type:'i' } }
    
    return factory( props, statics, fid, 'caller' )
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
    
    const obj = factory( props, statics, fid, 'counter' )

    // return memoized object because output and .wrap
    // might often both be used
    const __memo = memo( obj )

    Object.defineProperty( __memo, 'wrap', {
      get() {
        // address of wrap static
        const out =  caller( __memo, (obj.idx * 4) + 20 )
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
      name:'bus',

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
      name:'ssd',
      in( input ) {
        // must memoize to avoid infinite recursion
        memi[ obj.idx + 2 ] = memo( input ).idx * 4
      }
    }
    
    Object.defineProperty( obj, 'out', {
      get() {
        let out = {
          fid: obj.fid,
          idx: obj.idx,
          name:'ssd_out'
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
      maxSize: { value:maxSize, type:'i'},
      readPos:{ value:0, type:'f'}
    }

    const obj = factory( props, statics, baseidx, 'delay' )
    getMemory( maxSize )

    return obj
  }
}

let slide
{
  const fid = fidx
  fidx += 8
  slide = function( input=0, slideUp=1000, slideDown=1000 ) {
    const props = { input, slideUp, slideDown },
          statics = {
            output: { value:0, type:'f' }
          }
    
    return factory( props, statics, fid, 'slide' )
  }
}

let param
{
  const baseidx = fidx++
  param = init => {
    const obj = {
      idx: getMemory(2),
      fid: baseidx,
      name:'param'
    }
    
    let value = init
    Object.defineProperty( obj, 'value', {
      get() { return value },
      set(v) {
        if( isNaN(v) ) {
          throw Error('Params can only have numberic values; you assigned:', v )
        }else{
          value = v
          memf[ obj.idx + 1 ] = value
        }
      }
    })
    
    memf[ obj.idx + 1 ] = init
    memi[ obj.idx ] = obj.fid
    
    return obj
  }
}

let mix
{
  const fid = fidx
  fidx += 8
  mix = function( in1=0, in2=0, t=1 ) {
    const props = { in1, in2, t }, statics = {}
    
    return factory( props, statics, fid, 'mix' )
  }
}

let bang
{
  let fid = fidx++
  bang = function() {
    const obj = {
      idx : getMemory( 2 ),
      trigger() {
        memf[ obj.idx + 1 ] = 1
      },
      fid,
      name:'bang'
    }
    
    memi[ obj.idx ] = fid
    return obj
  }
}

let ad
{
  let fid = fidx
  fidx += 4
  ad = function( attack=44100, decay=44100, __bang=null ) {
    const obj = factory({ attack, decay }, {}, fid, 'ad' )
    obj.bang = __bang === null ? bang() : __bang
    obj.accum = accum( 1, obj.bang, 0, MAX, 0 )
    obj.trigger = obj.bang.trigger

    memi[ obj.idx ] = fid

    return obj
  }
}

let ifelse
{
  const baseidx = fidx
  fidx += 8

  ifelse = function( condition=1, t=1, f=0 ) {
    const props = { condition, "true":t, "false":f }
    const statics = {}
    
    return factory( props, statics, baseidx, 'ifelse' )
  }
}

let ifelse2
{
  const baseidx = fidx
  fidx += 8

  ifelse2 = function( condition=1, t=1, f=0 ) {
    const props = { condition, "true":t, "false":f }
    const statics = {}
    
    return factory( props, statics, baseidx, 'ifelse2' )
  }
}

const data = function( __data, type='float' ) {
  let obj

  if( typeof __data === 'string' ) { 
    if( utilities[ __data ] === undefined ) {
      // load file, return promise
      obj = utilities.loadSample( __data )
      obj.name = 'data'
    }
  }else if( typeof __data === 'object' ){ 
    // array of data should be passed, 
    // copy into memory and return obj
    obj = { 
      idx : getMemory( __data.length ),
      length: __data.length,
      name:'data'
    }
  
    if( type === 'float' ) {
      memf.set( __data, obj.idx )
    }else{
      memi.set( __data, obj.idx )
    }
  }else{
    obj = { 
      idx: getMemory( __data ),
      length: __data,
      name:'data'
    }
  }

  return obj
}

let poke
{ 
  const baseidx = fidx
  fidx += 4
  poke = function( data, value=0, index=0 ) {
    const props = { value,index },
          statics = {
            data: { value:data.idx * 4, type:'i' }
          }
    
    const obj = factory( props, statics, baseidx, 'poke' )
    memi[ pokememoryindex + pokecounter ] = obj.idx * 4

    pokecounter++

    return obj
  }
}

let clamp
{
  let fid = fidx++
  clamp = function( input=0, min=0,max=1 ) {
    const obj = {
      idx : getMemory( 12 ),
      fid,
      name:'clamp'
    }
  
    createProperty( obj, 'input', obj.idx, input )
    createProperty( obj, 'min', obj.idx + 4, min )
    createProperty( obj, 'max', obj.idx + 8, max )
    
    return obj
  }
}

// TODO be sure to include information on how mono pan
// input is automatically memoized. 
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
      name: 'pan'
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

let pokememoryindex = 1000
let pokelength = 50
let pokecounter = 0


function setupMemory( buffer, __pokelength=50 ) {
  memf   = new Float32Array( buffer )
  memf64 = new Float64Array( buffer )
  memi   = new Int32Array( buffer )  
  
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

}

//setupMemory( new ArrayBuffer( 32 * 4096) )

//window.onclick = go

export {
  floor, ceil, round, abs, sqrt, sin, cos,
  tan, asin, acos, atan,

  add, sub, mul, div, and, or, gt, gte, lt, lte,
  eq, neq, gtp, ltp, min, max, pow, mod,

  accum, phasor, peek, cycle, noise, sah, memo,
  caller, counter, bus, ssd, delay, slide, param,
  mix, bang, ad, ifelse, ifelse2, poke, 
  
  data,

  utilities, memf, memi, getMemory, setupMemory
}