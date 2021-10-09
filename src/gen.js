import __wabt from 'wabt'
import fs from 'fs'

const gen = {
  // top / bottom of module
  __bookends: ( await import('./bookends.js') ),
  //__assemble: (await import('https://cdn.jsdelivr.net/npm/wassemble@0.0.2/wassemble.mjs')).default,

  // pokes get added to this array and
  // then processed after the rest of compilation
  // has taken place
  __pokes : [],
  __locals: [],
  __functions: [],

  // paths to all ugen templates
  __ugens : {
    accum:  ( await import( './ugens/accum.js' )  ).default,
    phasor: ( await import( './ugens/phasor.js' ) ).default,
    peek:   ( await import( './ugens/peek.js' )   ).default,
    cycle:  ( await import( './ugens/cycle.js' )  ).default,
  },

  __binops: ( await import( './ugens/binops.js' ) ).default,

  ugens: {},

  addLocal( local ) {
    this.__locals.push( local )
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
      __wabt().then( wabt => {
        this.__wabt = wabt
        resolve()
      })
    })

    for( let key in gen.__ugens ) {
      gen.ugens[ key ] = gen.__ugens[ key ]( gen )
    }

    const binops = gen.__binops( gen )
    Object.assign( gen.ugens, binops )

    return p
  },

  // main compile function
  compile( ugen, offset ) {
    if( ugen.name === undefined ) console.log( 'ugen:', ugen )
    return gen.ugens[ ugen.name ]( ugen, offset )
  },

  function( ugen, name='render' ) {
    this.__locals.length = 0
    
    let str = `\n(func $${name} (export "${name}") (param $loc i32) (result f32)\n `
    
    let body = gen.compile( ugen, 0 )

    this.__locals.forEach( v => {
      str += v + '\n'
    })

    str += body.string
    str +=`)\n`

    this.__functions.push( name )
    
    const out = {
      string:str,
      memlength: body.memlength 
    }

    return out
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

  assemble( wat, memory=null ) {
    const modobj = this.__wabt.parseWat( 
      'gen', 
      wat, 
      { mutable_globals:true, threads:true, bulk_memory:true } 
    )
    
    try {
      modobj.validate()
    }catch(err) {
      console.error( err )
      return
    }
    const wasmblob = modobj.toBinary({ log:false })
      
    if( memory === null ) {
      memory = new WebAssembly.Memory({ 
        initial:memoryAmount, maximum:memoryAmount, shared:true 
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
            memory, sr, _logi:console.log, _logf:console.log
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
            twopi:Math.PI * 2 
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