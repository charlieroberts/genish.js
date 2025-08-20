let gen

const ifelse = function( obj, offset=0 ) {
  const idx = obj.uid
  const memory_loc = '$loc_'+idx
  const name = obj.__memoName 
  let memlength = 0//obj.__memoryLength * 4

  let condition_prop, t_prop, f_prop

  gen.addLocal(`(local $ifelsecondition_${idx} f32)`)
  gen.addLocal(`(local $ifelset_${idx} f32)`)
  gen.addLocal(`(local $ifelsef_${idx} f32)`)
  gen.addLocal(`(local ${memory_loc} i32)`)
  gen.addLocal(`(local ${name} f32)` )

  obj.__flags = [ isNaN( obj.condition ), isNaN( obj.t ), isNaN( obj.f )]

  if( obj.__flags[0] ) {
    const condition_compiled = gen.compile( obj.condition, offset )
    memlength     += condition_compiled.memlength
    offset        += condition_compiled.memlength
    condition_prop = `${condition_compiled.string}`
  }else{
    condition_prop = `f32.const ${obj.condition}`
  }

  // TODO min is currently unused and assumed to be 0
  if( obj.__flags[1] ) {
    const t_compiled = gen.compile( obj.t ) //, memlength + offset )
    memlength      += t_compiled.memlength
    offset         += t_compiled.memlength
    t_prop = `${t_compiled.string}`
  }else{
    t_prop = `f32.const ${obj.t}`
  }

  if( obj.__flags[2] ) {
    const f_compiled = gen.compile( obj.f ) //, memlength + offset )
    memlength      += f_compiled.memlength
    offset         += f_compiled.memlength
    f_prop = `${f_compiled.string}`
  }else{
    f_prop = `f32.const ${obj.f}`
  }

  // TODO for max we could just inline static values instead
  // of assigning to a local...
const template = `;;;;;;;;; begin ifelse ;;;;;;;;;
${condition_prop}
local.set $ifelsecondition_${idx}

${t_prop}
local.set $ifelset_${idx}

${f_prop}
local.set $ifelsef_${idx}

(select
  (local.get $ifelset_${idx})
  (local.get $ifelsef_${idx})
  (i32.eq (i32.const 1) (i32.trunc_f32_s (local.get $ifelsecondition_${idx})))
)

local.tee ${name}
;;;;;;;; end ifelse ;;;;;;;;
`
  const ugen = {
    string:template,
    memlength,
    name:'ifelse'
  }

  return ugen
}

const module = __gen => {
  gen = __gen
  return ifelse
}

export default module
