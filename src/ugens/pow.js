let gen
import utilities from '../utilities.js'

const pow = function( obj, offset=0 ) {

  const idx = obj.idx = utilities.getMemory( 4 )
  const memory_loc = '$loc_'+idx
  let memlength = obj.__memoryLength * 4

  const xname = `$xinput_${idx}`
  const yname = `$yinput_${idx}`
  const outname = `$powout_${idx}`
  const indexname = `$powindex_${idx}`

  gen.addLocal(`(local ${xname} f32)`)
  gen.addLocal(`(local ${yname} f32)`)
  gen.addLocal(`(local ${outname} f32)`)
  gen.addLocal(`(local ${indexname} i32)`)
  gen.addLocal(`(local $${obj.__memoName} f32)` )

  obj.__flags = [ isNaN( obj[0] ), isNaN( obj[1] ) ]

  let x_prop, x_compiled
  if( obj.__flags[0] ) {
    x_compiled = gen.compile( obj[0] )
    memlength += x_compiled.memlength
    x_prop = `${x_compiled.string}`
  }else{
    x_prop = `f32.const ${obj[0]}`
  }

  let y_prop, y_compiled
  if( obj.__flags[1] ) {
    y_compiled = gen.compile( obj[1] )
    memlength += y_compiled.memlength
    y_prop = `${y_compiled.string}`
  }else{
    y_prop = `f32.const ${obj[1]}`
  }

const template = `
;;;;;;;; pow ;;;;;;;;
${x_prop}
local.set ${xname}

${y_prop}
local.set ${yname}

f32.const 1
local.set ${outname}
i32.const 1
local.set ${indexname}

;; check if second arg is 0
local.get ${yname}
f32.const 0
f32.ne
if
;; default will not trigger branch
  (block
    (loop
      (f32.mul 
        (local.get ${outname})
        (local.get ${xname})
      )
      local.set ${outname}

      (i32.add 
        (local.get ${indexname})
        (i32.const 1)
      )
      local.tee ${indexname}
      local.get ${yname}
      i32.trunc_f32_s
      i32.gt_u
      br_if 1

      br 0
    )
  )
else
  f32.const 1
  local.set ${outname}
end

local.get ${outname}
`

  const ugen = {
    string:template,
    memlength:8,
    name:'pow'
  }

  return ugen
}

const module = __gen => {
  gen = __gen
  return pow 
}

export default module
