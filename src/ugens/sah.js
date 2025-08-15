let gen
import utilities from '../utilities.js'

const sah = function( obj, offset=0 ) {

obj.idx = utilities.getMemory( 4 )
const idx = obj.idx
const memory_loc = '$loc_'+idx
let memlength = obj.__memoryLength * 4

gen.addLocal(`(local $valueinput_${idx} f32)`)
gen.addLocal(`(local $controlinput_${idx} f32)`)
gen.addLocal(`(local $threshold_${idx} f32)`)
gen.addLocal(`(local $lastcontrol_${idx} f32)`)
gen.addLocal(`(local $trigger_${idx} f32)`)
gen.addLocal(`(local ${memory_loc} i32)`)
gen.addLocal(`(local $${obj.__memoName} f32)` )

obj.__flags = [ isNaN( obj.input ), isNaN( obj.control ), isNaN( obj.threshold ) ]

let value_prop, value_compiled
if( obj.__flags[0] ) {
  value_compiled = gen.compile( obj.input )
  memlength += value_compiled.memlength
  value_prop = `${value_compiled.string}`
  utilities.memf[ obj.idx + 3 ] = 0
}else{
  utilities.memf[ obj.idx + 3 ] = obj.input
  value_prop = `f32.const ${obj.input}`
}

let trigger_prop, trigger_compiled
if( obj.__flags[1] ) {
  trigger_compiled = gen.compile( obj.control )
  memlength += trigger_compiled.memlength
  trigger_prop = `${trigger_compiled.string}`
}else{
  trigger_prop = `f32.const ${obj.control}`
}

let th_prop, th_compiled
if( obj.__flags[2] ) {
  th_compiled = gen.compile( obj.threshold )
  memlength += th_compiled.memlength
  th_prop = `${th_compiled.string}`
}else{
  th_prop = `f32.const ${obj.threshold}`
}

const template = `
  ;;;;;;;; sample and hold ;;;;;;;;
  i32.const ${(obj.idx*4)+offset}
  local.get $loc
  i32.add
  local.set ${memory_loc}

  ${value_prop} 
  local.set $valueinput_${idx}
  
  ${trigger_prop} 
  local.set $controlinput_${idx}
  
  ${th_prop}
  local.set $threshold_${idx}
  
  ;; sah: load last control signal value
  local.get ${memory_loc}
  i32.const 16
  i32.add
  f32.load
  local.set $lastcontrol_${idx}
  
  ;; sah: set trigger variable if control
  ;; is greater than threshold
  (f32.gt
    (local.get $controlinput_${idx})
    (local.get $threshold_${idx})
  )
  f32.convert_i32_u
  
  ;; sah: if trigger variable is not equal
  ;; to last control variable, sample
  local.tee $trigger_${idx}
  local.get $lastcontrol_${idx}
  f32.ne
  
  if
    local.get $trigger_${idx}
    i32.trunc_f32_u
    ;; if trigger store value
    if
      local.get ${memory_loc}
      i32.const 12
      i32.add
      local.get $valueinput_${idx}
      f32.store
    end
    
    ;; sah: store current trigger value
    local.get ${memory_loc}
    i32.const 16
    i32.add
    local.get $trigger_${idx}
    f32.store
  end
  
  ;; sah: get stored value, this will already be
  ;; set to new sample if threshold was exceeded
  local.get ${memory_loc}
  i32.const 12
  i32.add
  f32.load

  local.tee $${obj.__memoName}
  ;;;;;;;; end sample and hold ;;;;;;;;
`

  const ugen = {
    string:template,
    memlength:16,
    name:'sah'
  }

  return ugen
}

const module = __gen => {
  gen = __gen
  return sah 
}

export default module
