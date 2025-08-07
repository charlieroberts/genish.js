import utilities from '../utilities.js'
let gen
const param_module = __gen => {
  gen = __gen

  const fnc = function( obj, offset = 0 ) {
    obj.offset = offset

    obj.idx = utilities.getMemory( 1, 'param' )

    utilities.memf[ obj.idx ] = obj.value

    Object.defineProperty( obj, 'value', {
      set(v) { utilities.memf[ obj.idx ] = v },
      get()  { return utilities.memf[ obj.idx ] }
    })

    const ugen = {
      memlength:1,
      string:`(f32.load (i32.add (local.get $loc) (i32.const ${(obj.idx * 4)})))`,
      __memoName:obj.__memoName,
      name:'param'
    }

    if( obj.__shouldMemo ) {
      console.log( 'PARAM MEMO:', obj.__memoName )
      gen.addLocal(`(local ${obj.__memoName} f32)`)
      ugen.string += `\nlocal.tee ${obj.__memoName}\n`
    }

    return ugen
  }
  
  return fnc
}

export default param_module
