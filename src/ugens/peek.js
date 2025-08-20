let gen

let __uid = 0

const getUID = function() {
  return __uid++
}

const dynamicData = function( data_offset, data_loc, memory_loc ) {
  return `local.get ${memory_loc}
  i32.const ${data_offset}
i32.add
i32.load
local.set ${data_loc}\n`
}

const staticData = function( data, data_loc ) {
  return `i32.const ${data.idx * 4}
local.set ${data_loc}
`
}

const compile = function( obj, offset=0 ) {
  let memlength = 0, 
      index_prop

  obj.data = gen.compile( obj.data )
  obj.idx = obj.data.idx + '_' + getUID()
  //obj.__memoName = '$peek_'+obj.idx+'_memo'

  const phase_id = '$peekphase_'+obj.idx,
        floor_id = '$peekfloor_'+obj.idx,
        ceil_id = '$peekceil_'+obj.idx,
        base_id = '$peekbase_'+obj.idx,
        next_id = '$peeknext_'+obj.idx,
        incr_id = '$peekincr_'+obj.idx,
        fract_id = '$peekfract_'+obj.idx,
        memory_loc = '$peekmemory_'+obj.idx,
        data_loc =  '$peekdata_loc_'+obj.idx,
        data_length_val = '$peekdata_length_val_'+obj.idx,
        data_length_offset = 12,

        phase_prop = obj.mode === 1
          ? `local.get ${data_length_val} 
  f32.mul`
          : ``

  obj.__flags = [ isNaN( obj.index ) ]
  // only run full peek if index isn't a constant
  // TODO this assumes index is an integer... is there
  // a use case when that would not be true and interpolation
  // or truncation would be required?
  if( obj.__flags[0] ) {
    const index_compiled = gen.compile( obj.index, offset )
    memlength += index_compiled.memlength
    // XXX why isn't the line below needed?
    // offset += index_compiled.memlength 
    index_prop = `${index_compiled.string}`
  }else{

    if( obj.data.shouldAddToMemoryTotal === true ) {
      memlength += obj.data.length
      obj.data.shouldAddToMemoryTotal = false
    }
    const string = `;;;;;;;; peek const ;;;;;;;;
local.get $loc
i32.const ${(obj.data.idx + obj.index) * 4}
i32.add
f32.load
${obj.__shouldMemo ? `local.tee ${obj.__memoName}` : '' }
;;;;;;;; end peek const ;;;;;;;;
`
    if( obj.__shouldMemo ) gen.addLocal( `(local ${obj.__memoName} f32)` )
    return { string, memlength }
  }


  const linearInterpolationBlock = `
  ;; peek: interpolate
  local.set ${floor_id} 

  local.get ${base_id}
  i32.const 1
  i32.add
  local.tee ${next_id}

  local.get ${data_length_val}
  i32.trunc_f32_u

  i32.le_u
  if (result f32)
    local.get ${next_id}
    i32.const 4
    i32.mul
    local.get ${data_loc}
    i32.add
    f32.load
  else
    ;; $idx is 0 index for table
    local.get ${data_loc}
    f32.load
  end
  
  local.set ${ceil_id}

  ;; peek: get fractional part via phase - floor( phase )
  local.get ${phase_id}
  local.get ${phase_id}
  f32.floor
  f32.sub
  local.set ${fract_id}
  
  ;; peek: multiply diff between ceil/floor by fractional part and add to floor
  local.get ${ceil_id}
  local.get ${floor_id}
  f32.sub
  local.get ${fract_id}
  f32.mul
  local.get ${floor_id}
  f32.add
  `

  const interpolation = obj.interpolation === 1 ? linearInterpolationBlock : '' 

  //gen.addLocal( `(local ${memory_loc} i32)` )
  gen.addLocal( `(local ${data_loc} i32)` )
  gen.addLocal( `(local ${phase_id} f32)` )
  gen.addLocal( `(local ${base_id} i32)` )
  gen.addLocal( `(local ${data_length_val} f32)` )
  gen.addLocal( `(local ${obj.__memoName} f32)` )

  if( obj.interpolation === 1 ) {
    gen.addLocal( `(local ${floor_id} f32)` )
    gen.addLocal( `(local ${ceil_id} f32)` )
    gen.addLocal( `(local ${next_id} i32)` )
    gen.addLocal( `(local ${incr_id} f32)` )
    gen.addLocal( `(local ${fract_id} f32)` )
  }

const dataBlock = obj.data.__static 
  ? staticData( obj.data, data_loc, memory_loc )
  : dynamicData( 0, data_loc, memory_loc )

// if interpolating, truncate to get base index, interpolation
// will be performed between baseIndex and baseIndex + 1. Otherwise
// for no interpolation round to nearest index number
const baseIndexBlock = obj.interpolation === 1
  ? `i32.trunc_f32_u`
  : `f32.floor
i32.trunc_f32_u`

// TODO wtf is going on here when can data length be dynamic?
// if that needs to work we need to figure out how to correctly calculate
// data_length_offset... right now it's set to 12 for i-don't-know-what-reason
// but it doesn't matter atm because the data length is never dynamic...
 
// if the length of data can dynamically change, look it up at runtime,
// otherwise just compile in the length of the array.
// ALSO, set the datalength to 0 if there's only one index in the data,
// otherwise it should be length - 1
let dataLengthBlock = obj.data.__static === false
  ? `(i32.add (local.get ${memory_loc}) (i32.const ${data_length_offset}))
f32.load\n`
  : obj.data.length <= 1 
    ? 'f32.const 0.0\n'
    : obj.interpolation === 1 
      ? `f32.const ${obj.data.length}
f32.const 1
f32.sub\n`
      : `f32.const ${obj.data.length}\n`

dataLengthBlock += `local.set ${data_length_val}\n`

  const block = 
`;;;;;;;; peek ;;;;;;;;
;;i32.const ${offset}
;;local.get $loc
;;i32.add
;;local.set ${memory_loc}
${dataBlock}
${dataLengthBlock}
;; peek: get normalized index
${index_prop}
;; peek: set $phase in range of 0-len based on mode
${phase_prop}
local.tee ${phase_id}

;; peek: codegen get base index by rounding $phase if not interpolating
;; otherwise truncate to get floor 
${baseIndexBlock}
local.tee ${base_id}

;; peek: multiply base index by 4 and load
i32.const 4
i32.mul
local.get ${data_loc}
i32.add
f32.load
${interpolation}
local.tee ${obj.__memoName}
;;;;;;;; end peek ;;;;;;;;
`
  // only uses memory if using a dyanmic data index
  // ... which currently doesn't work anyways right?
  memlength += obj.data.__static ? 0 : 4 
  if( obj.data.shouldAddToMemoryTotal === true ) {
    console.log( 'MEMORY ADD', obj.data.length )
    memlength += obj.data.length
    obj.data.shouldAddToMemoryTotal = false
  }
  return { string:block, memlength }
}

const module = __gen => {
  gen = __gen
  return compile
}

export default module
