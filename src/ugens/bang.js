import utilities from '../utilities.js'
let gen

const bang = function( obj, offset=0 ) {
  const idx = obj.idx = utilities.getMemory( 1 )
  obj.__memoName = `$bang_${obj.idx}`

  let string = `;;;;;;;; begin bang ;;;;;;;;;
local.get $loc
i32.const ${(obj.idx)*4}
i32.add
f32.load

f32.const 1
f32.ne

;; first part of if statement does not
;; create a branch, so use the most commonly
;; executed block (no bang, output 0)
if (result f32)
  f32.const 0
else
  local.get $loc
  i32.const ${(obj.idx)*4}
  i32.add
  f32.const 0
  f32.store
  
  f32.const 1
end
;;;;;;;;; end bang ;;;;;;;;;;`
 
  
  if( obj.__shouldMemo === true ) {
    const name = obj.__memoName
    gen.addLocal(`(local ${name} f32)` )
    string += `\nlocal.tee ${name}`
  }

  const ugen = {
    string,
    memlength:1,
    name:'bang'
  }

  return ugen
}

const module = __gen => {
  gen = __gen
  return bang
}

export default module

