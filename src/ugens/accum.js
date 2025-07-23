let gen

const accum = function( obj, offset=0 ) {
  let memlength     = obj.__memoryLength * 4,
      incr_prop     = null,
      incr_compiled = null,
      resetblock    = null,
      reset_compiled= null

  const phase_offset = 16,
        phase_id     = '$accumphase'+obj.idx,
        memory_loc   = '$accummemoryloc'+obj.idx,
        phase_loc    = '$accumphaseloc'+obj.idx,
        out_id       = '$accumout'+obj.idx

  if( obj.__flags[0] ) {
    incr_compiled = gen.compile( obj.incr, offset )
    memlength     += incr_compiled.memlength
    offset        += incr_compiled.memlength
    incr_prop     = `${incr_compiled.string}`
  }else{
    incr_prop = `f32.const ${obj.incr}`
  }

  if( obj.__flags[1] ) {
    reset_compiled = gen.compile( obj.reset, memlength + offset )
    memlength      += reset_compiled.memlength
    offset         += reset_compiled.memlength
  }

  gen.addLocal(`(local ${memory_loc} i32)`)
  gen.addLocal(`(local ${phase_loc} i32)`)
  gen.addLocal(`(local ${phase_id} f32)`) 
  gen.addLocal(`(local ${out_id} f32)`)
  
  const name = obj.__memoName 
  gen.addLocal(`(local $${name} f32)` )

  const getReset = function() {
    const resetBlock = 
  `  ;; accum: reset
  ${ reset_compiled.string }\n
  if (result f32)
    ;; set phase.value to $min
    (f32.store
      (local.get ${phase_loc}) 
      (f32.const ${obj.min})   
    ) 
    (f32.const ${obj.min})
    local.set ${out_id}
  end
  `
    return resetBlock 
  }
  const incrblock = 
`
${obj.__flags[1] === 0 ? `;;;;;;;; begin accum ;;;;;;;;` : '' }
i32.const ${offset+obj.idx*4}
local.get $loc
i32.add
local.tee ${memory_loc}

;; accum: load phase
i32.const ${ phase_offset }
i32.add
local.tee ${phase_loc}
f32.load
local.tee ${out_id}
${obj.__flags[1] ? getReset() : '' }
;; accum: phase increment
${incr_prop}
f32.add
local.set ${phase_id}

;; accum: push phase idx for set-property to the stack
local.get ${ phase_loc }

;; accum: wrap phase 
(f32.lt (local.get ${phase_id}) (f32.const ${ obj.max }))
if (result f32)
  (local.get ${phase_id})
else
  (f32.sub 
    (local.get ${phase_id})
    (f32.const ${ obj.max - obj.min })
  )
local.tee ${phase_id} 
end

f32.store
local.get ${out_id}
local.tee $${name}

;;;;;;;; end accum ;;;;;;;;
`

  memlength += 4
  const out = {
    string: obj.__flags[1] ? resetblock : incrblock,
    memlength
  }

  return out
}

const accum_module = __gen => {
  gen = __gen
  return accum
}

export default accum_module
