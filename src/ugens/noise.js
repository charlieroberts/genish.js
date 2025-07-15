let gen

/*
const noise = function( obj, offset=0 ) {
  const ugen = {
    string:`call $_random`,
    memlength:0,
    name:'noise'
  }

  return ugen
}
*/

const noise = function( obj, offset=0 ) {
  let string = 'call $_random'
  
  if( obj.__shouldMemo === true ) {
    const name = obj.__memoName
    gen.addLocal(`(local $${name} f32)` )
    string += `\nlocal.tee $${name}`
  }

  const ugen = {
    string,
    memlength:0,
    name:'noise'
  }

  return ugen
}

// TODO wasm function isn't getting memory addresses correct
// they always turn up 0? I'm not sure why. Is Math.random
// "good enough"?

/*const noise = function( obj, offset=0 ) {

const idx = obj.idx
const memory_loc = '$noiseloc_'+idx

gen.addLocal(`(local $0_${idx} i32)`)
gen.addLocal(`(local $1_${idx} i32)`)
gen.addLocal(`(local $noiseloc_${idx} i32)`)

const template = ` 
  ;;;;;;;; begin noise ;;;;;;;;
  i32.const ${offset}
  local.get $loc
  i32.add
  local.set ${memory_loc}

  (i32.store
    (i32.add (local.get ${memory_loc}) (i32.const 12) )
    (local.tee $1_${idx}
      (i32.xor
        (i32.load
          (i32.add (local.get ${memory_loc}) (i32.const 12) )
        )
        (local.tee $0_${idx}
          (i32.load
            (i32.add (local.get ${memory_loc}) (i32.const 8) )
          )
        )
      )
    )
  )
  (i32.store
    (i32.add (local.get ${memory_loc}) (i32.const 8) )
    (i32.add
      (local.get $1_${idx})
      (local.get $0_${idx})
    )
  )
  (f32.mul
    (f32.add
      (f32.mul
        (f32.load
          (i32.add (local.get ${memory_loc}) (i32.const 4))
        )
        (f32.convert_i32_s
          (local.get $0_${idx})
        )
      )
      (f32.const 1)
    )
    (f32.const 0.5)
  )

  ;;;;;;;; end noise ;;;;;;;;
`

  const ugen = {
    string:template,
    memlength:obj.__memoryLength * 4,
    name:'noise'
  }

  return ugen
}*/

const module = __gen => {
  gen = __gen
  return noise
}

export default module
