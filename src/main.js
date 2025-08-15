import utilities from './utilities.js'

// convenience
const getMemory = utilities.getMemory,
      factory   = utilities.factory

const isCompiled = true

let fidx = 0

let uid = 0

function getUID() {
  return uid++
}

const monop = function( name ) {
  const baseidx = fidx
  fidx += 2
  const fnc = function( x ) {
    const props = { '0':x },
          statics = {}

    return makeugen({ name, '0':x })//factory( props, statics, baseidx, name )
  }

  return fnc
}

const binop = function( name ) {
  const baseidx = fidx
  fidx += 4
  const fnc = function( x,y ) {
    const props = { '0':x, '1':y },
          statics = {}

    return makeugen({ name, '0':x, '1':y })//factory( props, statics, baseidx, name )
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
      gt  = binop( 'gt' ),
      gte = binop( 'gte' ),
      lt  = binop( 'lt' ),
      lte = binop( 'lte' ),
      eq  = binop( 'eq' ),
      neq = binop( 'neq' ),
      min = binop( 'min' ),
      max = binop( 'max' ),
      pow = binop( 'pow' ),
      mod = binop( 'mod' )

const ugen = {
  memo() { 
    this.__shouldMemo = true 
    return this
  }
}

const makeugen = function( props ) {
  const out = Object.assign( Object.create( ugen ), props, { uid:getUID() })
  out.__memoName = '$' + out.name + '_' + out.uid + '_memo'

  return out
}

let samplerate = function() {
  const out = { name:'samplerate', string:'global.get $sr\n', memlength:0 }
  return out
}
  
let accum
{
  accum = function( incr=0, reset=0, min=0, max=1, phase=0 ) {
    const obj = makeugen({ incr, reset, min, max, phase, name:'accum' })

    return obj
  }
}

let phasor
{
  const baseidx = fidx
  fidx += 4
  phasor = function( frequency=1, reset=0, phase=0 ) {
    return makeugen({ frequency, reset, phase, name:'phasor' })
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
            // TODO this was length-1 but why???
            length: { value:length, type:'f' },
            interpolation: { value: Number( interp==='linear' ), type:'i' },
            mode: { value: Number( mode==='phase' ), type:'i' }
          }

    const obj = makeugen({ 
      name:'peek', 
      index, 
      interpolation:Number( interp==='linear' ), 
      mode: Number( mode === 'phase' ),
      data: __data
    })
    //factory( props, statics, baseidx, 'peek' )

    //obj.data = __data

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

    return makeugen({ name:'cycle', frequency, phase })
    //factory( props, statics, baseidx, 'cycle' )
  }
}

let param
{
  const baseidx = fidx++
  param = (value=1) => {
    const props = {},
          statics = {
            value:{ value, type:'f' }
          }
  
    return makeugen({ name:'param', value })
  }
}


let noise
{
  noise = function( seed=0 ) {
    return makeugen({ name:'noise', seed }) 
    //factory( props, statics, baseidx, 'noise' )
  }
}


let sah
{
  sah = function( input=0, control=0, threshold=.9 ) { 
    return makeugen({ name:'sah', input, control, threshold })
  }
}


let memo
{
  const fid = fidx
  fidx += 2
  memo = function( input=0 ) {
    const props = { input }
    const statics = {
      lastClock:  { value:999999, type:'i' },
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
    let obj = makeugen({ name:'counter', incr, reset, max, phase })
    obj.memo()
    obj.hasWrap = false
    
    Object.defineProperty( obj, 'wrap', {
      get() {
        let memlength = 1

        // TODO what if wrap isn't compiled first? we fail a unit test
        // because of this condition. for some reason loading the wrap value
        // straight from memory doesn't seem to work correctly...
        obj.hasWrap = true

        const wrapobj = {
          memlength,
          __shouldMemo: true,
          resolve: function() { 
            //console.log( 'COMPILING WRAP', obj.idx )
            const myobj = {
              string:`local.get ${obj.wrapFlag}\n`,
              memlength
              //`(f32.load ${obj.__locationString})\n`,
              ////`(f32.load (i32.add (local.get $loc) (i32.const ${(obj.idx * 4)+4})))`,
            }
            return myobj
          },
          name:'counter.wrap',
          // make sure the counter is memo'd otherwise .wrap will
          // also trigger compilation and start a doom loop
          requires:obj,
          memo(){ wrapobj.__shouldMemo = true },
          __memoName : '$' + 'counter.wrap' + '_' + obj.uid + '_memo'
        }

        return wrapobj
      }
    })
    
    return obj
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
  ssd = function( value = 0 ) {
    const obj = makeugen({ 
      name:'history', 
      in(input) { obj.__input = input; if( isNaN( input ) ) input.memo(); },
      __input: null,
      value
    })

    obj.out = obj 

    return obj
  }
}
/*let ssd 
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
}*/

let delay
{
  const baseidx = fidx
  fidx += 4

  delay = function( input=0, time=22050, maxSize=null ) {

    if( maxSize === null ) maxSize = time
    //const obj = factory( props, statics, baseidx, 'delay' )
    //getMemory( maxSize )
    return makeugen({ input, time, maxSize, name:'delay' })
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
    
    return makeugen({ name:'slide', input, slideUp, slideDown }) 
    //factory( props, statics, fid, 'slide' )
  }
}

/*let param
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
}*/

let mix
{
  const fid = fidx
  fidx += 8
  mix = function( in1=0, in2=0, t=1 ) {
    const props = { in1, in2, t }, statics = {}
    
    return makeugen({ name:'mix', in1, in2, t })
    //factory( props, statics, fid, 'mix' )
  }
}

let bang
{
  let fid = fidx++
  bang = function() {
    /*const obj = {
      trigger() {
        memf[ obj.idx + 1 ] = 1
      },
      fid,
      name:'bang'
    }
    
    memi[ obj.idx ] = fid
    */
    const obj = makeugen({ name:'bang' })
    obj.trigger = function() {
      memf[ obj.idx ] = 1
    }
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
    
    return makeugen({ name:'ifelse', condition, t, f }) 
    //factory( props, statics, baseidx, 'ifelse' )
  }
}
let ifelse2
{
  const baseidx = fidx
  fidx += 8

  ifelse2 = function( condition=1, t=1, f=0 ) {
    const props = { condition, "true":t, "false":f }
    const statics = {}
    
    return makeugen({ name:'ifelse2', condition, t, f }) 
    //factory( props, statics, baseidx, 'ifelse' )
  }
}
/*
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
*/

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
    // will be copied on compilation
    obj = makeugen({ 
      __static:true,
      length: __data.length,
      name:'data',
      value:__data
    })
  }else{
    obj = makeugen({ value:__data, name:'data' })
    obj.__static = true
    obj.length = __data
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
    
    const obj = makeugen({ name:'poke', data, value, index }) 
    //factory( props, statics, baseidx, 'poke' )
    //memi[ pokememoryindex + pokecounter ] = obj.idx * 4

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


let wrap 
{
  const baseidx = fidx
  fidx += 8
  wrap = function( input=0, min=0, max=1 ) {
    const props = { input, min, max },
          statics = {} 

    const obj = makeugen({ name:'wrap', input, min, max }) 
      //factory( props, statics, baseidx, 'wrap' )

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

const seq = function( values, durations, rate=1 ) {
  const del       = ssd( 0 ),
        clockd    = counter( del.out, 0, durations.length ),
        __durs    = peek( data(durations).memo(), clockd, 'none', 'samples' ),
        clock     = counter( rate, 0, __durs ),
        stepper   = counter( clock.wrap, 0, values.length ),
        ugen      = peek( data(values), stepper, 'none', 'samples' )
 
  del.in( clock.wrap )
 
  return ugen
}

const ltp = function( value, limit ) {
  return ifelse( lt( value.memo(), limit ), value, 0 )
}

const gtp = function( value, limit ) {
  return ifelse( gt( value.memo(), limit ), value, 0 )
}

const and = function( x,y ) {
  return eq( x, eq( y, 1 ) )
}

const or = function( x,y ) {
  return ne( add(x,y), 0 )
}

const ad = function( attackTime=44100, decayTime=44100 ) {
  const trigger = bang(), 
        phase = accum( 1, trigger, 0, 9999999, attackTime + decayTime).memo()

  //const completeFlag = data( [0] )

  const out = ifelse2( 
    and( gte( phase, 0), lt( phase, attackTime ) ),
    div( phase, attackTime ),

    ifelse2( 
      and( gte( phase, 0), lt( phase, add( attackTime, decayTime ) ) ),
      sub( 1, div( sub( phase, attackTime ), decayTime ) ),
      0
    )
      /*ifelse2( neq( phase, -Infinity),
        poke( completeFlag, 1, 0, { inline:0 }),
        0
      )
    )*/
  )

  out.trigger = ()=> trigger.trigger()
  return out
}



let pokememoryindex = 1000
let pokelength = 50
let pokecounter = 0

const exports = {
  floor, ceil, round, abs, sqrt, sin, cos,
  tan, asin, acos, atan,

  add, sub, mul, div, and, or, gt, gte, lt, lte,
  eq, neq, gtp, ltp, min, max, pow, mod,

  accum, phasor, peek, cycle, noise, sah, memo,
  caller, counter, bus, ssd, delay, slide, param,
  mix, bang, ad, ifelse, ifelse2, poke, samplerate, 
  
  data,wrap,seq 
}

export {
  floor, ceil, round, abs, sqrt, sin, cos,
  tan, asin, acos, atan,

  add, sub, mul, div, and, or, gt, gte, lt, lte,
  eq, neq, gtp, ltp, min, max, pow, mod,

  accum, phasor, peek, cycle, noise, sah, memo,
  caller, counter, bus, ssd, delay, slide, param,
  mix, bang, ad, ifelse, ifelse2, poke, 
  
  data,wrap,seq,samplerate, 

  exports
}
