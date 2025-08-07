import {cycle} from '../main.js'
import utilities from '../utilities.js'
let gen

const accum = function( obj, offset=0 ) {

  // TODO we should only ask for the memory we need?
  // we don't need any numbers that get compiled into place.
  // so, really we just need a number for phase I think
  obj.idx = utilities.getMemory( 1, 'accum' )
  obj.__memoryLength = 1
  obj.__flags = [ isNaN(obj.incr), isNaN(obj.reset) ]

  let memlength     = obj.__memoryLength * 4,
      incr_prop     = null,
      incr_compiled = null,
      resetblock    = null,
      reset_compiled= null

  const phase_offset = 0,
        phase_id     = '$accumphase'+obj.idx,
        memory_loc   = '$accummemoryloc'+obj.idx,
        phase_loc    = '$accumphaseloc'+obj.idx

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

  gen.addLocal(`(local ${phase_loc} i32)`)
  gen.addLocal(`(local ${phase_id} f32)`) 
  
  const name = obj.__memoName 
  gen.addLocal(`(local ${name} f32)` )

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
    local.set ${name}
  end
  `
    return resetBlock 
  }

  offset = 0

  const incrblock = 
`
${obj.__flags[1] === 0 ? `;;;;;;;; begin accum ;;;;;;;;` : '' }
i32.const ${offset+obj.idx*4}
local.get $loc
i32.add
local.tee ${phase_loc}

;; accum: load phase
f32.load
local.tee ${name}
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
local.get ${name}

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
