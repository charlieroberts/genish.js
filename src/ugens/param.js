import utilities from '../utilities.js'
let gen
const param_module = __gen => {
  gen = __gen

  const fnc = function( obj, offset = 0 ) {
    obj.offset = offset

    let ugen = null
    // kinda a memoization system. loading the value
    // isn't expensive, and we want to ensure that we don't
    // create multiple memory indexes for a single param. just
    // return the existing ugen if it has already been compiled.
    // .memo() can still be used to tee the value to a local variable;
    // for params that need to be called over and over again this might
    // be more efficient.
    if( obj.ugen === undefined ) {
      obj.idx = utilities.getMemory( 1, 'param' )

      utilities.memf[ obj.idx ] = obj.value

      Object.defineProperty( obj, 'value', {
        set(v) { utilities.memf[ obj.idx ] = v },
        get()  { return utilities.memf[ obj.idx ] }
      })

      ugen = {
        memlength:4,
        string:`(f32.load (i32.add (local.get $loc) (i32.const ${(obj.idx * 4)})))`,
        __memoName:obj.__memoName,
        name:'param'
      }

      if( obj.__shouldMemo ) {
        gen.addLocal(`(local ${obj.__memoName} f32)`)
        ugen.string += `\nlocal.tee ${obj.__memoName}\n`
      }

      obj.ugen = ugen
    }else{
      ugen = obj.ugen
    }
    return ugen
  }
  
  return fnc
}

export default param_module
