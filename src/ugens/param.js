const param_module = __gen => {
  const fnc = function( obj, offset = 0 ) {
    // add one to function idx to get first static
    // value, then multiply by 4 as index is measured
    // in bytes, not float32s
    obj.offset = offset
    //console.log( 'offset:', offset, obj.idx + 1 + offset )
    return {
      memlength:1,
      string:`(f32.load (i32.add (local.get $loc) (i32.const ${(obj.idx * 4)})))`
    }
  }
  
  return fnc
}

export default param_module
