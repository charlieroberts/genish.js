import utilities from '../utilities.js'

// TODO: use actual samplerate
const compile = function( obj, offset = 0 ) {
  let out = null
  if( obj.out === undefined ) {
    out = { 
      value: obj.value, 
      length: typeof obj.value === 'object' ? obj.value.length : obj.value,
      name: obj.name
    }

    //console.log( 'data length:', out.length  )

    // if value is number, it is the number of memory slots
    // to reserve, NOT THE ACTUAL DATA VALUE
    if( typeof obj.value === 'number' ) {
      out.idx = utilities.getMemory( obj.value, 'data' )
    }else{
      // if an array is passed, copy it to memory
      out.idx = utilities.getMemory( out.value.length, 'data' )
      utilities.memf.set( out.value, out.idx )
    }

    // needed so that data is not recompiled when using
    // across multiple peeks / pokes... this places the .idx
    // property on the user-facing instance
    obj.idx = out.idx

    out.__static = obj.__static !== undefined ? obj.__static : true
    obj.__memoName = '$data'+obj.idx
    obj.out = out
  }else{
    out = obj.out
  }
  
  return out
}

const module = _ => {
  return compile
}

export default module
