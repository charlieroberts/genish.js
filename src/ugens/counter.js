import utilities from '../utilities.js'

// TODO memoization with wrap doesn't seem to be working
// correctly?
let gen

const counter = function( obj, offset=0 ) {
  let memlength     = 0, //obj.__memoryLength * 4,
      incr_prop     = null,
      incr_compiled = null,
      resetblock    = null,
      reset_compiled= null,
      max_compiled  = null,
      maxblock      = null

  console.log( 'COMPILING COUNTER, MEMO NAME:', obj.__memoName )
  obj.__flags = [ isNaN( obj.incr ), isNaN( obj.reset ), isNaN( obj.max ) ]
  obj.idx = utilities.getMemory( 2, 'counter' )

  const phase_offset = 0,
        phase_id     = '$counterphase_'+obj.idx,
        memory_loc   = '$countermemoryloc_'+obj.idx,
        phase_loc    = '$counterphaseloc_'+obj.idx,
        out_id       = '$counterout_'+obj.idx,
        max_id       = '$countermax_'+obj.idx,
        reset_flag_id= '$counterresetflag_'+obj.idx,
        max_flag_id  = '$countermaxflag_'+obj.idx,
        wrap_flag    = '$counterwrapflag_'+obj.idx

  obj.__locationString = `(i32.add (local.get ${memory_loc}) (i32.const 4) )`
  obj.wrapFlag = wrap_flag

  if( obj.__flags[0] ) {
    incr_compiled = gen.compile( obj.incr, offset )
    memlength     += incr_compiled.memlength
    incr_prop     = `${incr_compiled.string}`
  }else{
    incr_prop = `f32.const ${obj.incr}`
  }

  if( obj.__flags[1] ) {
    reset_compiled = gen.compile( obj.reset, memlength + offset )
    memlength      += reset_compiled.memlength
  }

  if( obj.__flags[2] ) {
    max_compiled = gen.compile( obj.max, memlength + offset )
    memlength += max_compiled.memlength
  }

  // TODO needs dynamic maximum e.g. for sequencing

  const name = obj.__memoName 

  gen.addLocal(`(local ${name} f32)` )
  gen.addLocal(`(local ${memory_loc} i32)`)
  gen.addLocal(`(local ${phase_loc} i32)`)
  gen.addLocal(`(local ${phase_id} f32)`) 
  gen.addLocal(`(local ${out_id} f32)`)
  gen.addLocal(`(local ${max_id} f32)`)
  gen.addLocal(`(local ${reset_flag_id} i32)`)
  gen.addLocal(`(local ${max_flag_id} i32)`)
  gen.addLocal(`(local ${wrap_flag} f32)`)
  

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

  const getMax = function() {
    let str = ''
    if( max_compiled !== null ) {
      str += max_compiled.string
    }else{
      str += `f32.const ${obj.max}`
    }

    return str
  }

// TODO just get to work without dynamic min/max values and then add those in
const string = `;;;;;;;; begin counter ;;;;;;;; 
i32.const ${(obj.idx)*4}
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
;; get max 

${getMax()}
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
  (local.set ${wrap_flag} (f32.const 0))
else
  (f32.store (i32.add (local.get ${memory_loc}) (i32.const 4) ) (f32.const 1) ) 
  (f32.sub 
    (local.get ${phase_id}) 
    (local.get ${max_id})
  )
  (local.set ${wrap_flag} (f32.const 1))
  ;;(i32.add (local.get ${memory_loc}) (i32.const 4) )
  ;;call $__logi
  local.tee ${phase_id}
end

f32.store
local.get ${out_id} 
${obj.__flags[1] ? 'end': '' }
${obj.hasWrap ? `local.set ${name}` : `local.tee ${name}` }
;;;;;;;; end counter ;;;;;;;;;
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
