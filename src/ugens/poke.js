let gen
let pokeid = 0

const getuid = ()=> pokeid++

const poke = function( data, value, index ) {
  const memory_loc   = '$pokememoryloc_'+gen.__pokes.length
  
  if( typeof value === 'object' && typeof value.memo === 'function' ) value.memo()
  if( typeof index === 'object' && typeof index.memo === 'function' ) index.memo()

  const post = function() {
    let inputcompiled, indexcompiled
    // because compiled index is first in the generated code,
    // it must be compiled first, for the rare case when the
    // index and value are the same ugen... in this case we
    // want the value to be memoed
    if( data.idx === undefined ) data = gen.compile( data )
    
    let isIndexDynamic = false
    if( typeof index === 'object' ) {
      indexcompiled = gen.compile( index ).string
      isIndexDynamic = true
    }else{
      indexcompiled = `f32.const ${index}`
    }
    if( typeof value === 'object' ) {
      inputcompiled = gen.compile( value ).string
    }else{
      inputcompiled = `f32.const ${value}`
    }

    let string = isIndexDynamic ? `
;;;;;;;; begin poke ;;;;;;;;
i32.const ${data.idx*4}
local.get $loc
i32.add

${indexcompiled}

;; base poke index
i32.trunc_f32_u
i32.const 4
i32.mul
i32.add
`
:`;;;;;;;; begin poke ;;;;;;;;
i32.const ${(data.idx+index) * 4}
local.get $loc
i32.add`

   string+=`
;; final poke index
${inputcompiled}
f32.store
;;;;;;;; end poke ;;;;;;;;
`

    const ugen = {
      string,
      name:'poke'
    }

    return ugen
  }
  // use id that will identify this poke and prevent it from being pushed
  // multiple times
  const pokeidx = ''+data.uid + (typeof index === 'object' ? index.idx : index )
  post.idx = pokeidx

  // only push once!
  const pokeFound = gen.__pokes.findIndex( v => v.idx === post.idx ) !== -1

  if( !pokeFound ) {
    gen.__pokes.push( post )
  }

  return post
}

const module = __gen => {
  gen = __gen
  return poke
}

export default module
