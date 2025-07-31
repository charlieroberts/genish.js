let __wabt = null
let fs = null

const isBrowser = typeof window !== 'undefined'

if( !isBrowser ) {
  import('wabt').then( m =>{ __wabt = m.default;  })
  import('fs').then( m => fs = m.default )
}

//const __wabt = null
//const fs = null

const gen = {
  // top / bottom of module
  __bookends: ( await import('./bookends.js') ),

  // pokes get added to this array and
  // then processed after the rest of compilation
  // has taken place
  __memo  : {},
  __pokes : [],
  __locals: [],
  __functions: [],

  // paths to all ugen templates
 __ugens : {
    accum:  ( await import( './ugens/accum.js'   )  ).default,
    phasor: ( await import( './ugens/phasor.js'  )  ).default,
    peek:   ( await import( './ugens/peek.js'    )  ).default,
    cycle:  ( await import( './ugens/cycle.js'   )  ).default,
    param:  ( await import( './ugens/param.js'   )  ).default,
    sah:    ( await import( './ugens/sah.js'     )  ).default,
    memo:   ( await import( './ugens/memo.js'    )  ).default,
    poke:   ( await import( './ugens/poke.js'    )  ).default,
    history:( await import( './ugens/history.js' )  ).default,
    counter:( await import( './ugens/counter.js' )  ).default,
    mix:    ( await import( './ugens/mix.js'     )  ).default,
    wrap:   ( await import( './ugens/wrap.js'    )  ).default,
    delay:  ( await import( './ugens/delay.js'   )  ).default,
    ifelse: ( await import( './ugens/ifelse.js'  )  ).default,
    slide:  ( await import( './ugens/slide.js'   )  ).default,
  },

  __binops: ( await import( './ugens/binops.js' ) ).default,
  __monops: ( await import( './ugens/monops.js' ) ).default,

  ugens: {},

  addLocal( local ) {
    if( this.__locals.indexOf( local ) === -1 ) {
      this.__locals.push( local )
    }
  },

  // clear memory used for compilation
  // this would primarily be used for playgrounds;
  // maybe it doesn't need be included here?
  clear() {
    this.__memoryClear()
    this.__locals.length = 0
    this.__pokes.length = 0
  },

  init() {
    const p = new Promise(( resolve, reject ) => {
      // switch out commented line below when using node
      // wabt library. TODO I guess we should just compile wabt
      // into the system?
 
      (!isBrowser ? __wabt : WabtModule )().then( wabt => {
      //WabtModule().then( wabt => {
        gen.__wabt = wabt
        resolve()
      })
    })

    for( let key in gen.__ugens ) {
      let ugen = gen.__ugens[ key ]( gen )
      gen.ugens[ key ] = ugen
    }

    const binops = gen.__binops( gen )
    Object.assign( gen.ugens, binops )
    const monops = gen.__monops( gen )
    Object.assign( gen.ugens, monops )

    return p
  },

  // TODO add memoization step here?
  // main compile function
  compile( ugen, offset ) {
    if( ugen.name === undefined ) throw Error('ugen is not defined.', ugen )

    let out = null, prereq = null
    const name = ugen.__memoName

    // check if this is a property of a ugen, like counter.wrap
    // in which case it requires its parent to be compiled
    // parent must use 'set' for final value / memoization,
    // not tee, as the property string will also return a float
    if( ugen.requires !== undefined && gen.__memo[ ugen.requires.__memoName ] === undefined ) {
      prereq = gen.compile( ugen.requires, offset )
      const prereqarray = prereq.string.split('\n')
      if( prereqarray.length > 2 ) {
        const idx = prereqarray.length > 1 ? prereqarray.length - 2 : 0
        if( idx >= 0 )
          prereqarray[ idx ] = prereqarray[ idx ].replace( '.tee', '.set' )
      }
      prereq.string = prereqarray.join('\n')
    }

    if( typeof ugen.string === 'string' ) {
      // if pre-compiled, like counter.wrap
      out = ugen
    } else if( gen.__memo[ name ] === undefined && ugen.__shouldMemo === true ) {
      // if not already memo'd but should be...
      const compiled = gen.ugens[ ugen.name ]( ugen, offset )
      out = this.__memo[ name ] = compiled
    }else if( ugen.__shouldMemo === true ){
      // memo found
      out = {
        string:`local.get $${name}`,
        memlength: 0
      }
    }else{
      // default compilation, no memoing
      out = gen.ugens[ ugen.name ]( ugen, offset )
    }

    if( prereq !== null ) out.string = prereq.string + '\n' + out.string

    return out
  },

  function( ugen, name='render' ) {
    gen.__locals.length = 0

    const isStereo = Array.isArray( ugen )

    // TODO I think memo init is OK to do here, but maybe
    // it needs to be explicity done by the end-user? will there be
    // other ways to compile a function?
    gen.__memo = {}
    
    let str = `\n(func $${name} (export "${name}") (param $loc i32) (result ${isStereo ?'f32 f32' : 'f32'})\n `
   
    let body = null
    if( isStereo ){ 
      const ugen1 = gen.compile( ugen[0], 0 )
      body = ugen1.string + '\n' + gen.compile( ugen[1], ugen1.memlength ).string
    }else{
      body = gen.compile( ugen, 0 ).string
    }

    let bodystr = body

    const hasPokes = gen.__pokes.length > 0

    if( hasPokes ) {
      bodystr += this.processPokes()
    }

    let locals = ''
    gen.__locals.forEach( v => {
      locals += v + '\n'
    })

    str += locals
    str += bodystr
    
    str += `)\n`

    gen.__functions.push( name )
    
    const out = {
      string:str,
      memlength: body.memlength 
    }

    gen.__pokes = []
    return out
  },

  processPokes() {
    let str = ''

    for( let poke of this.__pokes ) {
      str += poke().string
    }
    
    return str
  },

  __functionTable() {
    let str = `  (table ${this.__functions.length} funcref)
    (elem (i32.const 0)
  `
    this.__functions.forEach( v => str += '  $' + v + '\n' )

    str += '  )\n'
    return str
  },

  module( functions, print=false, memoryAmount = 50 ) {
    let str = gen.__bookends.front( memoryAmount )

    str += this.__functionTable()

    if( Array.isArray( functions )) {    
      functions.forEach( fnc => {
        str += fnc.string
      })
    }else{
      str += functions.string
    }

    
    str += gen.__bookends.back()

    if( print ) console.log( str )

    this.__functions.length = 0

    return str
  },

  factory( constructor ) {
    constructor.compile = function() {
      const proto = constructor()
      const fnc   = gen.function( proto )

      return fnc
    }

    return constructor
  },

  write( wat='nothing to see here', name='gen.wat' ) {
    fs.writeFileSync( name, wat )
  },

  blob( wat, memory, shouldPrint ) {
    
    if( shouldPrint ) console.log( wat )

    const modobj = gen.__wabt.parseWat( 
      'gen', 
      wat, 
      { threads:true  } 
    )
    
    try {
      modobj.validate({ threads:true })
    }catch(err) {
      console.error( err )
      return
    }
    const wasmblob = modobj.toBinary({ log:false, write_debug_names:true })

    return wasmblob
  },

  // TODO refactor to use .blob() ? 
  assemble( wat, memory=null ) {
    const modobj = this.__wabt.parseWat( 
      'gen', 
      wat, 
      { threads:true  } 
    )
    
    try {
      modobj.validate({ threads:true })
    }catch(err) {
      console.error( err )
      return
    }
    const wasmblob = modobj.toBinary({ log:false, write_debug_names:true })
      
    if( memory === null ) {
      memory = new WebAssembly.Memory({ 
        initial:5, maximum:5, shared:true 

      })
    }
    
    // XXX replace with actual sampling rate at some point...
    const sr = new WebAssembly.Global({value:'f32', mutable:false}, 44100 )
    const clock = new WebAssembly.Global({ value:'i32', mutable:true}, 1 )
    
    const promise = new Promise( (res, rej) => {
      WebAssembly.instantiate( 
        wasmblob.buffer, 
        {
          env: { 
            memory, sr, clock, 
            _logi: n => { console.log(n); return n }, 
            _logf: n => { console.log(n); return n }
          },
          math: { 
            sin:  Math.sin,
            cos:  Math.cos,
            tan : Math.tan,
            asin: Math.asin, 
            acos: Math.acos,
            atan: Math.atan,
            tanh: Math.tanh,
            pow:  Math.pow,
            atan2: Math.atan2,
            pi:   Math.PI, 
            twopi:Math.PI * 2,
            random: Math.random
          }
        }  
      )
      .then( __wasm => {
        const wasm = __wasm.instance.exports
        res( wasm )  
      })
    })

    return promise
  }
}

export default gen
