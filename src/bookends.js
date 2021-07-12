const front = `(module
  (import "env" "memory" (memory $mem 5 5 shared))
  (import "env" "_logi" (func $_logi (param i32) ) ) 
  (import "env" "_logf" (func $_logf (param f32) ) ) 


  (global $sr (import "env" "sr") f32)
  (export "memory" (memory $mem) )
  (global $clock (mut i32) (i32.const 0))
`

const back = `
)`

export { front, back }