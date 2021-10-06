import utilities from './utilities.js'

// convenience
const getMemory = utilities.getMemory,
      factory   = utilities.factory

let fidx = 0

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

    const obj = factory( props, statics, baseidx, 'accum' )

    return obj
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
            mode: { value: Number( mode==='phase' ), type:'i' }
          }

    const obj = factory( props, statics, baseidx, 'peek' )

    obj.data = __data

    return obj
  }
}

let cycle_compiled
{
  const baseidx = fidx
  fidx+=2
  cycle_compiled = function( frequency ) {
    const props = { frequency },
          statics = {
            dataIndex: { value:utilities.sinedata.idx * 4, type:'i' },
            length: { value:1023, type:'f' },
            interpolation: { value: 1, type:'i' },
            mode: { value: 1, type:'i' }
          }

    const obj = factory( props, statics, baseidx-2, 'cycle' )

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
      idx : utilities.getMemory( size + 3 ),
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
      idx : getMemory( __data.length + 1 ),
      length: __data.length,
      name:'data'
    }
  
    if( type === 'float' ) {
      utilities.memf.set( __data, obj.idx )
    }else{
      utilities.memi.set( __data, obj.idx )
    }

    utilities.memf[ obj.idx + __data.length ] = __data.length 
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

const wobble = function( baseFreq, modFreq, modGain ) {
  const mod   = mul( cycle( modFreq ), modGain )
  const graph = cycle( add( baseFreq, mod ) )

  return graph
}


let pokememoryindex = 1000
let pokelength = 50
let pokecounter = 0

export {
  floor, ceil, round, abs, sqrt, sin, cos,
  tan, asin, acos, atan,

  add, sub, mul, div, and, or, gt, gte, lt, lte,
  eq, neq, gtp, ltp, min, max, pow, mod,

  accum, phasor, peek, cycle, noise, sah, memo,
  caller, counter, bus, ssd, delay, slide, param,
  mix, bang, ad, ifelse, ifelse2, poke, 
  
  data,

  cycle_compiled, wobble
}