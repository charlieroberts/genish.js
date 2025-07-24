let gen
const wrap = function( obj, offset=0 ) {
  const idx = obj.idx
  const memory_loc = '$loc_'+idx
  let memlength = obj.__memoryLength * 4

  let input_prop, min_prop, max_prop

  gen.addLocal(`(local $wrapinput_${idx} f32)`)
  gen.addLocal(`(local $wrapmax_${idx} f32)`)
  gen.addLocal(`(local ${memory_loc} i32)`)

  if( obj.__flags[0] ) {
    const input_compiled = gen.compile( obj.input, offset )
    memlength     += input_compiled.memlength
    offset        += input_compiled.memlength
    input_prop     = `${input_compiled.string}`
  }else{
    input_prop = `f32.const ${obj.input}`
  }

  // TODO min is currently unused and assumed to be 0
  if( obj.__flags[1] ) {
    min_compiled = gen.compile( obj.min, memlength + offset )
    memlength      += reset_compiled.memlength
    offset         += reset_compiled.memlength
    min_prop = `${min_compiled.string}`
  }else{
    min_prop = `f32.const ${obj.min}`
  }

  if( obj.__flags[2] ) {
    max_compiled = gen.compile( obj.max, memlength + offset )
    memlength      += max_compiled.memlength
    offset         += max_compiled.memlength
    max_prop = `${max_compiled.string}`
  }else{
    max_prop = `f32.const ${obj.max}`
  }


  const template = `
${input_prop}
local.set $wrapinput_${idx}

${max_prop}
local.set $wrapmax_${idx}

(select
  (f32.sub (local.get $wrapinput_${idx}) (local.get $wrapmax_${idx}) )
  (local.get $wrapinput_${idx})
  (f32.ge (local.get $wrapinput_${idx}) (local.get $wrapmax_${idx}) )
)
`

  const ugen = {
    string:template,
    memlength,
    name:'wrap'
  }

  return ugen
}

const module = __gen => {
  gen = __gen
  return wrap
}

export default module
