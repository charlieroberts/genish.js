const front = function( memAmount = 5, functioncount=2 ) {

const code = `(module
  (import "env" "memory" (memory $mem ${memAmount} ${memAmount} shared))
  (import "env" "_logi" (func $_logi (param i32)  (result i32) ) ) 
  (import "env" "__logi" (func $__logi (param i32) ) ) 
  (import "env" "_logf" (func $_logf (param f32)  (result f32) ) ) 
  (import "env" "__logf" (func $__logf (param f32) ) ) 

  (import "math" "random"  (func $_random (result f32) ) )
  (import "math" "sin"     (func $_sin   (param f32) (result f32) ) )
  (import "math" "cos"     (func $_cos   (param f32) (result f32) ) )
  (import "math" "tan"     (func $_tan   (param f32) (result f32) ) )
  (import "math" "asin"    (func $_asin  (param f32) (result f32) ) )
  (import "math" "acos"    (func $_acos  (param f32) (result f32) ) )
  (import "math" "atan"    (func $_atan  (param f32) (result f32) ) )
  (import "math" "tanh"    (func $_tanh  (param f32) (result f32) ) )
  ;;(import "math" "atan2"   (func $_atan2 (param f32) (param f32) (result f32) ) )

  (export "memory" (memory $mem) )

  (global $sr (import "env" "sr") f32)
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
