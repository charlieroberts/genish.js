const front = function( memAmount = 50) {

const code = `(module
  (import "env" "memory" (memory $mem ${memAmount} ${memAmount} shared))
  ;;(import "env" "memory" (memory $mem ${memAmount} ${memAmount} ))
  (import "env" "_logi" (func $_logi (param i32)  (result i32) ) ) 
  (import "env" "_logf" (func $_logf (param f32)  (result f32) ) ) 

  (import "math" "random"   (func $_random (result f32) ) )

  (global $sr (import "env" "sr") f32)
  (export "memory" (memory $mem) )
  (global $clock (mut i32) (i32.const 0))

  ;; for noise function
  (type $t2 (func (param f64 i32) (result f64)))
  ;; primary function signature used
  (type $sig-i32--f32 (func (param $loc i32) (result f32) ) )
  ;; logic functions
  (type $sig-i32--i32 (func (param $loc i32) (result i32) ) )
  ;; no return
  (type $sig-i32 (func (param $loc i32) ) )
`

return code

}

const back = function() {
  const code = `
)`

  return code
}

export { front, back }
