let gen

const dynamicData = function( data_offset, data_loc, memory_loc ) {
  return `i32.get ${memory_loc}
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
  let memlength = obj.__memoryLength * 4,
      index_prop

  const data_offset = 8,
        phase_id = '$phase'+obj.idx,
        floor_id = '$floor'+obj.idx,
        ceil_id = '$ceil'+obj.idx,
        base_id = '$base'+obj.idx,
        next_id = '$next'+obj.idx,
        incr_id = '$incr'+obj.idx,
        fract_id = '$fract'+obj.idx,
        memory_loc = '$memory'+obj.idx,
        data_loc =  '$data_loc'+obj.idx,
        data_length_val = '$data_length_val'+obj.idx,
        data_length_offset = 12,

        phase_prop = obj.mode === 1
          ? `local.get ${data_length_val} 
  f32.mul`
          : ``

  if( obj.__flags[0] ) {
    const index_compiled = gen.compile( obj.index, offset )
    memlength += index_compiled.memlength
    // XXX why isn't the line below needed?
    // offset += index_compiled.memlength 
    index_prop = `  ${index_compiled.string}`
  }else{
    index_prop = `  f32.const ${obj.index}`
  }

  const linearInterpolationBlock = `
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

  ;; get fractional part via phase - floor( phase )
  local.get ${phase_id}
  local.get ${phase_id}
  f32.floor
  f32.sub
  local.set ${fract_id}
  
  ;; multiply diff between ceil/floor by fractional part and add to floor
  local.get ${ceil_id}
  local.get ${floor_id}
  f32.sub
  local.get ${fract_id}
  f32.mul
  local.get ${floor_id}
  f32.add
  `

  const interpolation = obj.interpolation === 1 ? linearInterpolationBlock : '' 

  gen.addLocal( `(local ${memory_loc} i32)` )
  gen.addLocal( `(local ${data_loc} i32)` )
  gen.addLocal( `(local ${phase_id} f32)` )
  gen.addLocal( `(local ${base_id} i32)` )
  gen.addLocal( `(local ${data_length_val} f32)` )

  if( obj.interpolation === 1 ) {
    gen.addLocal( `(local ${floor_id} f32)` )
    gen.addLocal( `(local ${ceil_id} f32)` )
    gen.addLocal( `(local ${next_id} i32)` )
    gen.addLocal( `(local ${incr_id} f32)` )
    gen.addLocal( `(local ${fract_id} f32)` )
  }

const dataBlock = obj.data.__static 
  ? staticData( obj.data, data_loc, memory_loc )
  : dynamicData( 8, data_loc )

const dataLengthBlock = obj.data.__static === false
  ? `(i32.add (local.get ${memory_loc}) (i32.const ${data_length_offset}))
  f32.load
  local.set ${data_length_val}`
  : `f32.const ${obj.data.length}
  local.set ${data_length_val}  
  `

  const block = 
`i32.const ${offset}
local.get $loc
i32.add
local.set ${memory_loc}

${dataBlock}

${dataLengthBlock}

;; get normalized index
${index_prop}

;; set $phase in range of 0-len based on mode
${phase_prop}
local.tee ${phase_id}

;; get base index by rounding $phase down
i32.trunc_f32_u
local.tee ${base_id}

;; multiply base index by 4 and load
i32.const 4
i32.mul
local.get ${data_loc}
i32.add
f32.load
${interpolation}
`
  memlength += 4
  return { string:block, memlength }
}

const module = __gen => {
  gen = __gen
  return compile
}

export default module