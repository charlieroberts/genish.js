import utilities from '../utilities.js'

let gen

const counter = function( obj, offset=0 ) {
  let memlength     = 0, //obj.__memoryLength * 4,
      incr_prop     = null,
      incr_compiled = null,
      resetblock    = null,
      reset_compiled= null

  const phase_offset = 0,
        phase_id     = '$counterphase_'+obj.idx,
        memory_loc   = '$countermemoryloc_'+obj.idx,
        phase_loc    = '$counterphaseloc_'+obj.idx,
        out_id       = '$counterout_'+obj.idx,
        max_id       = '$countermax_'+obj.idx,
        reset_flag_id= '$resetflag_'+obj.idx

  obj.__flags = [ isNaN( obj.incr ), isNaN( obj.reset ) ]
  obj.idx = utilities.getMemory( 2 )

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

  // TODO needs dynamic maximum e.g. for sequencing

  const name = '$'+obj.__memoName 

  gen.addLocal(`(local ${name} f32)` )
  gen.addLocal(`(local ${memory_loc} i32)`)
  gen.addLocal(`(local ${phase_loc} i32)`)
  gen.addLocal(`(local ${phase_id} f32)`) 
  gen.addLocal(`(local ${out_id} f32)`)
  gen.addLocal(`(local ${max_id} f32)`)
  gen.addLocal(`(local ${reset_flag_id} i32)`)
  

  const getReset = function() {
    const resetBlock = 

`  ;; counter: reset
${ reset_compiled.string }\n
i32.trunc_f32_s
;; TODO needs dynamic min
if (result f32) 
  ;; set phase.value to $min
  (f32.store
    (local.get ${phase_loc}) 
    (f32.const 0.0)   
  ) 
  (f32.const 0.0)
  local.tee ${out_id}
else
`

    return resetBlock 
  }

// TODO just get to work without dynamic min/max values and then add those in
const string = `${obj.__flags[1] === 0 ? `;;;;;;;; begin counter ;;;;;;;;` : '' }
i32.const ${(offset+obj.idx)*4}
local.get $loc
i32.add
local.set ${memory_loc}

;; load phase [48]
local.get ${memory_loc}
local.tee ${phase_loc}
f32.load
local.set ${out_id}

;; TODO: there's no reason someone would ever use a static number besides 0 right?
${obj.__flags[1] ? getReset() : '' }
;; get max [32]
f32.const ${obj.max}
local.set ${max_id}

;; get phase increment [0] and add to current phase
;; to obtain new phase
local.get ${out_id}
${incr_prop}
f32.add
local.set ${phase_id}

;; push phase idx for set-property to the stack
local.get ${phase_loc}

;; wrap phase if needed
;; no branch if condition is true so use that for
;; the most common result (phase increments with no wrap).
;; also, set wrap flag to either 1 or 0
(f32.lt (local.get ${phase_id}) (local.get ${max_id}))
if (result f32)
  (f32.store (i32.add (local.get ${memory_loc}) (i32.const 4) ) (f32.const 0) )
  (local.get ${phase_id})
else
  (f32.store (i32.add (local.get ${memory_loc}) (i32.const 4) ) (f32.const 1) ) 
  (f32.sub 
    (local.get ${phase_id}) 
    (local.get ${max_id})
  )
  local.tee ${phase_id}
end

f32.store
local.get ${out_id} 
${obj.__flags[1] ? 'end': '' }
local.tee ${name}
`

  memlength += 4
  const out = {
    string, 
    memlength
  }

  return out
}

const counter_module = __gen => {
  gen = __gen
  return counter
}

export default counter_module
