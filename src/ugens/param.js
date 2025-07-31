import utilities from '../utilities.js'
const param_module = __gen => {
  const fnc = function( obj, offset = 0 ) {
    obj.offset = offset

    obj.idx = utilities.getMemory(1)
    utilities.memf[ obj.idx ] = obj.value

    Object.defineProperty( obj, 'value', {
      set(v) { utilities.memf[ obj.idx ] = v },
      get()  { return utilities.memf[ obj.idx ] }
    })

    return {
      memlength:1,
      string:`(f32.load (i32.add (local.get $loc) (i32.const ${(obj.idx * 4)})))`
    }
  }
  
  return fnc
}

export default param_module
