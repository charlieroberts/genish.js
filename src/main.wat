(module
  (import "env" "memory" (memory $mem 50 50 shared))
  (import "env" "_logf" (func $_logf (param f32) ) )
  (import "env" "_logi" (func $_logi (param i32) ) ) 

  (import "math" "sin"   (func $_sin   (param f32) (result f32) ) )
  (import "math" "cos"   (func $_cos   (param f32) (result f32) ) )
  (import "math" "tan"   (func $_tan   (param f32) (result f32) ) )
  (import "math" "asin"  (func $_asin  (param f32) (result f32) ) )
  (import "math" "acos"  (func $_acos  (param f32) (result f32) ) )
  (import "math" "atan"  (func $_atan  (param f32) (result f32) ) )
  (import "math" "tanh"  (func $_tanh  (param f32) (result f32) ) )
  (import "math" "atan2" (func $_atan2 (param f32) (param f32) (result f32) ) )

  (global $sr (import "env" "sr") f32)
  (global $fmax (import "env" "fmax") f32)  
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

  
  ;; this table will store an indirect reference to every
  ;; function, so that they can all be called by index via
  ;; call_indirect
  (table 175 funcref)
  (elem (i32.const 0)
    ;; monops (11*2 = 22)
    $floor_s
    $floor_d
    $ceil_s
    $ceil_d
    $round_s
    $round_d
    $abs_s
    $abs_d
    $sqrt_s
    $sqrt_d
    $sin_s ;; 10
    $sin_d
    $cos_s
    $cos_d
    $tan_s
    $tan_d
    $asin_s
    $asin_d
    $acos_s
    $acos_d
    $atan_s ;; 20
    $atan_d

    ;; binops (16*4 = 64)
    $add_s_s
    $add_s_d
    $add_d_s
    $add_d_d
    $sub_s_s
    $sub_s_d
    $sub_d_s
    $sub_d_d
    $mul_s_s ;; 30
    $mul_s_d
    $mul_d_s
    $mul_d_d
    $div_s_s
    $div_s_d
    $div_d_s
    $div_d_d
    $and_s_s
    $and_s_d
    $and_d_s ;; 40
    $and_d_d
    $or_s_s
    $or_s_d
    $or_d_s
    $or_d_d
    $gt_s_s
    $gt_s_d
    $gt_d_s
    $gt_d_d
    $gte_s_s ;; 50
    $gte_s_d
    $gte_d_s
    $gte_d_d
    $lt_s_s
    $lt_s_d
    $lt_d_s
    $lt_d_d
    $lte_s_s
    $lte_s_d
    $lte_d_s ;; 60
    $lte_d_d
    $eq_s_s
    $eq_s_d
    $eq_d_s
    $eq_d_d
    $neq_s_s
    $neq_s_d
    $neq_d_s
    $neq_d_d
    $gtp_s_s ;; 70
    $gtp_s_d
    $gtp_d_s
    $gtp_d_d
    $ltp_s_s
    $ltp_s_d
    $ltp_d_s
    $ltp_d_d
    $min_s_s
    $min_s_d
    $min_d_s ;; 80
    $min_d_d
    $max_s_s
    $max_s_d
    $max_d_s
    $max_d_d
    $pow_s_s
    $pow_s_d
    $pow_d_s
    $pow_d_d
    $mod_s_s ;; 90
    $mod_s_d
    $mod_d_s
    $mod_d_d

    ;; other (starts at 86, 21)
    $accum_s_s 
    $accum_s_d
    $accum_d_s
    $accum_d_d
    $phasor_s_s
    $phasor_s_d
    $phasor_d_s ;; 100
    $phasor_d_d
    $peek_s
    $peek_d
    $cycle_s  
    $cycle_d
    $noise     
    $sah_s_s_s
    $sah_s_s_d
    $sah_s_d_s
    $sah_s_d_d ;; 110
    $sah_d_s_s
    $sah_d_s_d
    $sah_d_d_s
    $sah_d_d_d 
    ;; TODO list memo twice for bug when static version
    ;; isn't provided; fix
    $memo
    $memo      
    $caller
    $caller
    $counter_s_s_s
    $counter_s_s_d ;; 120
    $counter_s_d_s
    $counter_s_d_d
    $counter_d_s_s
    $counter_d_s_d 
    $counter_d_d_s
    $counter_d_d_d 
    $bus
    $ssd
    $delay_s_s
    $delay_s_d ;; 130
    $delay_d_s 
    $delay_d_d
    $slide_s_s_s
    $slide_s_s_d 
    $slide_s_d_s
    $slide_s_d_d 
    $slide_d_s_s
    $slide_d_s_d
    $slide_d_d_s
    $slide_d_d_d ;; 140
    $param_d 
    $mix_s_s_s
    $mix_s_s_d
    $mix_s_d_s 
    $mix_s_d_d
    $mix_d_s_s 
    $mix_d_s_d
    $mix_d_d_s
    $mix_d_d_d
    $bang       ;; 150
    $ad_s_s 
    $ad_s_d
    $ad_d_s
    $ad_d_d 
    $ifelse_s_s_s
    $ifelse_s_s_d 
    $ifelse_s_d_s
    $ifelse_s_d_d
    $ifelse_d_s_s
    $ifelse_d_s_d ;; 160
    $ifelse_d_d_s 
    $ifelse_d_d_d
    $ifelse2_s_s_s
    $ifelse2_s_s_d 
    $ifelse2_s_d_s
    $ifelse2_s_d_d 
    $ifelse2_d_s_s
    $ifelse2_d_s_d
    $ifelse2_d_d_s
    $ifelse2_d_d_d ;; 170
    $poke_s_s 
    $poke_s_d
    $poke_d_s
    $poke_d_d
    
    ;; $clamp
    ;; $tanh
    ;; $pow
    ;; $atan2
  )
  
  (func $get-property (param $idx i32) (result f32) f32.const 0 )
  
  ;; store value, no return
  (func $set-property (param $idx i32) (param $val f32)
    (f32.store (i32.add (local.get $idx) (i32.const 4) ) (local.get $val) )
  )
  
  ;; return value after storing it
  (func $set-propertee (param $idx i32) (param $val f32) (result f32)
    (f32.store (i32.add (local.get $idx) (i32.const 4) ) (local.get $val) )
    (local.get $val)
  )

 (func $round_s (export "round_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    
    f32.nearest    
  )

  (func $round_d (export "round_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    
    f32.nearest    
  )
  
 (func $abs_s (export "abs_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    
    f32.abs    
  )

  (func $abs_d (export "abs_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    
    f32.abs  
  )
  
 (func $floor_s (export "floor_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    
    f32.floor    
  )

  (func $floor_d (export "floor_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    
    f32.floor  
  )
  
 (func $ceil_s (export "ceil_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    
    f32.ceil    
  )

  (func $ceil_d (export "ceil_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    
    f32.ceil  
  )
  
 (func $sqrt_s (export "sqrt_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    
    f32.sqrt
  )

  (func $sqrt_d (export "sqrt_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    
    f32.sqrt  
  )

 (func $sin_s (export "sin_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    
    call $_sin    
  )

  (func $sin_d (export "sin_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    
    call $_sin
  )

 (func $cos_s (export "cos_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    
    call $_cos    
  )

  (func $cos_d (export "cos_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    
    call $_cos
  )

 (func $tan_s (export "tan_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    
    call $_tan    
  )

  (func $tan_d (export "tan_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    
    call $_tan
  )

 (func $asin_s (export "asin_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    
    call $_asin    
  )

  (func $asin_d (export "asin_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    
    call $_asin
  )

 (func $acos_s (export "acos_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    
    call $_acos    
  )

  (func $acos_d (export "acos_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    
    call $_acos
  )

 (func $atan_s (export "atan_s") (param $loc i32) (result f32) 

    local.get $loc
    i32.const 4
    i32.add
    f32.load
    
    call $_atan    
  )

  (func $atan_d (export "atan_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    
    call $_atan
  )

  (func $add_s_s (export "add_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.add
  )
  (func $add_s_d (export "add_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.add
  )
  (func $add_d_s (export "add_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.add
  )
  (func $add_d_d (export "add_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.add
  )

  (func $sub_s_s (export "sub_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.sub
  )
  (func $sub_s_d (export "sub_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.sub
  )
  (func $sub_d_s (export "sub_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.sub
  )
  (func $sub_d_d (export "sub_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.sub
  )

  (func $mul_s_s (export "mul_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.mul
  )
  (func $mul_s_d (export "mul_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.mul
  )
  (func $mul_d_s (export "mul_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.mul
  )
  (func $mul_d_d (export "mul_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.mul
  )

  (func $div_s_s (export "div_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.div
  )
  (func $div_s_d (export "div_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.div
  )
  (func $div_d_s (export "div_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.div
  )
  (func $div_d_d (export "div_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.div
  )

  (func $and_s_s (export "and_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    i32.reinterpret_f32

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    i32.reinterpret_f32
    
    i32.and
    f32.reinterpret_i32
  )
  (func $and_s_d (export "and_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    i32.reinterpret_f32

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    i32.reinterpret_f32

    i32.and
    f32.reinterpret_i32
  )
  (func $and_d_s (export "and_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    i32.reinterpret_f32

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    i32.reinterpret_f32

    i32.and
    f32.reinterpret_i32
  )
  (func $and_d_d (export "and_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    i32.reinterpret_f32

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    i32.reinterpret_f32

    i32.and
    f32.reinterpret_i32
  )

  (func $or_s_s (export "or_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    i32.reinterpret_f32

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    i32.reinterpret_f32
    
    i32.or
    f32.reinterpret_i32
  )
  (func $or_s_d (export "or_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    i32.reinterpret_f32

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    i32.reinterpret_f32

    i32.or
    f32.reinterpret_i32
  )
  (func $or_d_s (export "or_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    i32.reinterpret_f32

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    i32.reinterpret_f32

    i32.or
    f32.reinterpret_i32
  )
  (func $or_d_d (export "or_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    i32.reinterpret_f32

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    i32.reinterpret_f32

    i32.or
    f32.reinterpret_i32
  )

  (func $gt_s_s (export "gt_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.gt
    f32.reinterpret_i32

  )
  (func $gt_s_d (export "gt_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.gt
    f32.reinterpret_i32
  )
  (func $gt_d_s (export "gt_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.gt

    f32.reinterpret_i32
  )
  (func $gt_d_d (export "gt_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.gt
    f32.reinterpret_i32
  )

  (func $gte_s_s (export "gte_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.ge
    f32.reinterpret_i32
  )
  (func $gte_s_d (export "gte_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.ge
    f32.reinterpret_i32
  )
  (func $gte_d_s (export "gte_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.ge
    f32.reinterpret_i32
  )
  (func $gte_d_d (export "gte_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.ge
    f32.reinterpret_i32
  )

  (func $lt_s_s (export "lt_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.lt
    f32.reinterpret_i32

  )
  (func $lt_s_d (export "lt_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.lt
    f32.reinterpret_i32
  )
  (func $lt_d_s (export "lt_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.lt

    f32.reinterpret_i32
  )
  (func $lt_d_d (export "lt_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.lt
    f32.reinterpret_i32
  )

  (func $lte_s_s (export "lte_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.ge
    f32.reinterpret_i32
  )
  (func $lte_s_d (export "lte_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.ge
    f32.reinterpret_i32
  )
  (func $lte_d_s (export "lte_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.ge
    f32.reinterpret_i32
  )
  (func $lte_d_d (export "lte_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.ge
    f32.reinterpret_i32
  )

   (func $eq_s_s (export "eq_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    i32.reinterpret_f32

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    i32.reinterpret_f32
    
    i32.eq
    f32.reinterpret_i32
  )
  (func $eq_s_d (export "eq_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    i32.reinterpret_f32

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    i32.reinterpret_f32

    i32.eq
    f32.reinterpret_i32
  )
  (func $eq_d_s (export "eq_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    i32.reinterpret_f32

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    i32.reinterpret_f32

    i32.eq
    f32.reinterpret_i32
  )
  (func $eq_d_d (export "eq_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    i32.reinterpret_f32

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    i32.reinterpret_f32

    i32.eq
    f32.reinterpret_i32
  )

   (func $neq_s_s (export "neq_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    i32.reinterpret_f32

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    i32.reinterpret_f32
    
    i32.ne
    f32.reinterpret_i32
  )
  (func $neq_s_d (export "neq_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    i32.reinterpret_f32

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    i32.reinterpret_f32

    i32.ne
    f32.reinterpret_i32
  )
  (func $neq_d_s (export "neq_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    i32.reinterpret_f32

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    i32.reinterpret_f32

    i32.ne
    f32.reinterpret_i32
  )
  (func $neq_d_d (export "neq_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    i32.reinterpret_f32

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    i32.reinterpret_f32

    i32.ne
    f32.reinterpret_i32
  )

 
 (func $gtp_s_s (export "gtp_s_s") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)
    
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.set $x

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    local.set $y
    
    (select
      (local.get $x)
      (f32.const 0)
      (f32.gt 
        (local.get $x) 
        (local.get $y)
      )
    )
  )


  (func $gtp_s_d (export "gtp_s_d") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)

    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.set $x

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    local.set $y
    
    (select
      (local.get $x)
      (f32.const 0)
      (f32.gt 
        (local.get $x) 
        (local.get $y)
      )
    )
  )

  (func $gtp_d_s (export "gtp_d_s") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $x

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    local.set $y

    (select
      (local.get $x)
      (f32.const 0)
      (f32.gt 
        (local.get $x) 
        (local.get $y)
      )
    )
  )

  (func $gtp_d_d (export "gtp_d_d") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $x

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    local.set $y
    
    (select
      (local.get $x)
      (f32.const 0)
      (f32.gt 
        (local.get $x) 
        (local.get $y)
      )
    )
  )

  (func $ltp_s_s (export "ltp_s_s") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)

    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.set $x

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    local.set $y
    
    (select
      (local.get $x)
      (f32.const 0)
      (f32.lt 
        (local.get $x) 
        (local.get $y)
      )
    )
  )

  (func $ltp_s_d (export "ltp_s_d") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)

    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.set $x

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    local.set $y
    
    (select
      (local.get $x)
      (f32.const 0)
      (f32.lt 
        (local.get $x) 
        (local.get $y)
      )
    )
  )
  
  (func $ltp_d_s (export "ltp_d_s") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $x

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    local.set $y

    (select
      (local.get $x)
      (f32.const 0)
      (f32.lt 
        (local.get $x) 
        (local.get $y)
      )
    )
  )

  (func $ltp_d_d (export "ltp_d_d") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $x

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    local.set $y
    
    (select
      (local.get $x)
      (f32.const 0)
      (f32.lt 
        (local.get $x) 
        (local.get $y)
      )
    )
  )

  (func $min_s_s (export "min_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.min
  )
  (func $min_s_d (export "min_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.min
  )
  (func $min_d_s (export "min_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.min
  )
  (func $min_d_d (export "min_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.min
  )

  (func $max_s_s (export "max_s_s") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.max
  )
  (func $max_s_d (export "max_s_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.max
  )
  (func $max_d_s (export "max_d_s") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    f32.max
  )
  (func $max_d_d (export "max_d_d") (param $loc i32) (result f32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    ) 
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    f32.max
  )
  
  ;; 0-4 incr value or function id
  ;; 4-8 incr data idx (optional)
  ;; 8-12 reset value or function id
  ;; 12-16 reset data idx (optional)
  ;; 16-20 min
  ;; 20-24 max
  ;; 24-28 phase
  (func $accum_s_s (export "accum_s_s") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $min f32)
    (local $max f32)
    
    ;; get min, delay retrieving max.
    (i32.add (local.get $idx) (i32.const 12))
    f32.load
    local.set $min
    
    ;; check phase reset flag [64]
    (i32.add (local.get $idx) (i32.const 8))
    f32.load
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [32]
      (i32.add (local.get $idx) (i32.const 16))
      f32.load
      local.set $max
      
      ;; load phase [64]
      local.get $idx
      i32.const 20
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      (i32.add (local.get $idx) (i32.const 4) )
      f32.load
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 20
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap)
      (f32.lt (local.get $newphs) (local.get $max))
      ;;(i32.eqz (i32.load (i32.add (local.get $idx) (i32.const 41) ) ) )
      ;;i32.and
      if (result f32)
        (local.get $newphs)
      else
        (f32.sub 
          (local.get $newphs) 
          (f32.sub (local.get $max) (local.get $min) ) 
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (f32.store 
      ;;   (i32.add (local.get $idx) (i32.const 12) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 20)) 
        (local.get $min)    
      ) 
      local.get $min
    end
  )
  
  (func $accum_s_d (export "accum_s_d") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $min f32)
    (local $max f32)
    
    ;; get min, delay retrieving max.
    (i32.add (local.get $idx) (i32.const 12))
    f32.load
    local.set $min
    
    ;; check phase reset flag [64]
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ) ;; function id
    )
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [32]
      (i32.add (local.get $idx) (i32.const 16))
      f32.load
      local.set $max
      
      ;; load phase [64]
      local.get $idx
      i32.const 20
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      (i32.add (local.get $idx) (i32.const 4) )
      f32.load
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 20
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap)
      (f32.lt (local.get $newphs) (local.get $max))
      ;;(i32.eqz (i32.load (i32.add (local.get $idx) (i32.const 41) ) ) )
      ;;i32.and
      if (result f32)
        (local.get $newphs)
      else
        (f32.sub 
          (local.get $newphs) 
          (f32.sub (local.get $max) (local.get $min) ) 
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (f32.store 
      ;;   (i32.add (local.get $idx) (i32.const 12) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 20)) 
        (local.get $min)    
      ) 
      local.get $min
    end
  )

  (func $accum_d_s (export "accum_d_s") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $min f32)
    (local $max f32)
    (local $freqidx i32)
    
    ;; get min, delay retrieving max.
    (i32.add (local.get $idx) (i32.const 12))
    f32.load
    local.set $min
    
    ;; check phase reset flag [64]
    (i32.add (local.get $idx) (i32.const 8))
    f32.load
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [32]
      (i32.add (local.get $idx) (i32.const 16))
      f32.load
      local.set $max
      
      ;; load phase [64]
      local.get $idx
      i32.const 20
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      (i32.load (i32.add (local.get $idx) (i32.const 4) ) )
      local.set $freqidx
      (call_indirect (type $sig-i32--f32) 
        (local.get $freqidx) ;; data
        (i32.load (local.get $freqidx) ) ;; function id
      )
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 20
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap)
      (f32.lt (local.get $newphs) (local.get $max))
      ;;(i32.eqz (i32.load (i32.add (local.get $idx) (i32.const 41) ) ) )
      ;;i32.and
      if (result f32)
        (local.get $newphs)
      else
        (f32.sub 
          (local.get $newphs) 
          (f32.sub (local.get $max) (local.get $min) ) 
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (f32.store 
      ;;   (i32.add (local.get $idx) (i32.const 12) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 20)) 
        (local.get $min)    
      ) 
      local.get $min
    end
  )

  (func $accum_d_d (export "accum_d_d") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $min f32)
    (local $max f32)
    
    ;; get min, delay retrieving max.
    (i32.add (local.get $idx) (i32.const 12))
    f32.load
    local.set $min
    
    ;; check phase reset flag [64]
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ) ;; function id
    )
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [32]
      (i32.add (local.get $idx) (i32.const 16))
      f32.load
      local.set $max
      
      ;; load phase [64]
      local.get $idx
      i32.const 20
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ;; data
        (i32.load (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ) ;; function id
      )
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 20
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap)
      (f32.lt (local.get $newphs) (local.get $max))
      ;;(i32.eqz (i32.load (i32.add (local.get $idx) (i32.const 41) ) ) )
      ;;i32.and
      if (result f32)
        (local.get $newphs)
      else
        (f32.sub 
          (local.get $newphs) 
          (f32.sub (local.get $max) (local.get $min) ) 
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (f32.store 
      ;;   (i32.add (local.get $idx) (i32.const 12) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 20)) 
        (local.get $min)    
      ) 
      local.get $min
    end
  )


  (func $tanh (export "tanh") (param $loc i32) (result f32)
    local.get $loc
    call $get-property
    call $_tanh    
  )

  (func $atan2 (export "atan2") (param $loc i32) (result f32)
    local.get $loc
    call $get-property
    
    i32.const 16
    local.get $loc
    i32.add
    call $get-property
    
    call $_atan2
  )

  (func $pow (export "pow") (param $loc i32) (result f32)
    local.get $loc
    call $get-property
    
    i32.const 16
    local.get $loc
    i32.add
    call $get-property
    
    call $_atan2
  )
  
  ;; TODO: is there a way to do this without
  ;; requiring a divide for every sample even
  ;; for static frequencies?
  ;; note: there's no need to actually check the
  ;; reset inlet for s_s or d_s, as a static value of 1 would
  ;; be pretty useless.
  (func $phasor_s_s (export "phasor_s_s") 
    (param $loc i32)
    (result f32)
    (local $idx f32)
    (local $newphs f32)
    
    ;; load phase [64]
    local.get $loc
    i32.const 12
    i32.add
    f32.load
    
    ;; get frequency [4] and add to current phase
    ;; to obtain new phase
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    global.get $sr
    f32.div
    f32.add ;; add to retrieved phase
    local.set $newphs

    ;; push phase idx for set-property to the stack
    local.get $loc
    i32.const 12
    i32.add
    
    ;; wrap phase if needed
    ;; no branch if condition is true so use that for
    ;; the most common result (phase increments with no wrap)
    (f32.lt (local.get $newphs) (f32.const 1.0))
    if (result f32)
      (f32.gt (local.get $newphs) (f32.const 0.0))
      if (result f32)
        (local.get $newphs)
      else
        (f32.add 
          (local.get $newphs) 
          (f32.const 1.0) 
        )
        local.tee $newphs 
      end
    else
      (f32.sub 
        (local.get $newphs) 
        (f32.const 1.0) 
      )
      local.tee $newphs 
    end
    
    f32.store
    local.get $newphs
  )
  
  (func $phasor_d_s (export "phasor_d_s") 
    (param $loc i32)
    (result f32)
    (local $idx f32)
    (local $newphs f32)
    
    ;; load phase [64]
    local.get $loc
    i32.const 12
    i32.add
    f32.load
    
    ;; get frequency [4] and add to current phase
    ;; to obtain new phase
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    global.get $sr
    f32.div
    f32.add ;; add to retrieved phase
    local.set $newphs

    ;; push phase idx for set-property to the stack
    local.get $loc
    i32.const 12
    i32.add
    
    ;; wrap phase if needed
    ;; no branch if condition is true so use that for
    ;; the most common result (phase increments with no wrap)
    (f32.lt (local.get $newphs) (f32.const 1.0))
    if (result f32)
      (f32.gt (local.get $newphs) (f32.const 0.0))
      if (result f32)
        (local.get $newphs)
      else
        (f32.add 
          (local.get $newphs) 
          (f32.const 1.0) 
        )
        local.tee $newphs 
      end
    else
      (f32.sub 
        (local.get $newphs) 
        (f32.const 1.0) 
      )
      local.tee $newphs 
    end
    
    f32.store
    local.get $newphs
  )

  (func $phasor_s_d (export "phasor_s_d") 
    (param $loc i32)
    (result f32)
    (local $idx f32)
    (local $newphs f32)
    
        ;; check phase reset flag [64]
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; load phase [64]
      local.get $loc
      i32.const 12
      i32.add
      f32.load
      
      ;; get frequency [4] and add to current phase
      ;; to obtain new phase
      local.get $loc
      i32.const 4
      i32.add
      f32.load
      global.get $sr
      f32.div
      f32.add ;; add to retrieved phase
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $loc
      i32.const 12
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap)
    (f32.lt (local.get $newphs) (f32.const 1.0))
    if (result f32)
      (f32.gt (local.get $newphs) (f32.const 0.0))
      if (result f32)
        (local.get $newphs)
      else
        (f32.add 
          (local.get $newphs) 
          (f32.const 1.0) 
        )
        local.tee $newphs 
      end
      else
        (f32.sub 
          (local.get $newphs) 
          (f32.const 1.0) 
        )
        local.tee $newphs 
      end
    
      f32.store
      local.get $newphs
    else
      (f32.store
        (i32.add (local.get $loc) (i32.const 12)) 
        (f32.const 0)    
      ) 
      f32.const 0
    end
  )

  (func $phasor_d_d (export "phasor_d_d") 
    (param $loc i32)
    (result f32)
    (local $idx f32)
    (local $newphs f32)
    
        ;; check phase reset flag [64]
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
    )
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; load phase [64]
      local.get $loc
      i32.const 12
      i32.add
      f32.load
      
      ;; get frequency [4] and add to current phase
      ;; to obtain new phase
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
      )
      global.get $sr
      f32.div
      f32.add ;; add to retrieved phase
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $loc
      i32.const 12
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap)
      (f32.lt (local.get $newphs) (f32.const 1.0))
      if (result f32)
        (f32.gt (local.get $newphs) (f32.const 0.0))
        if (result f32)
          (local.get $newphs)
        else
          (f32.add 
            (local.get $newphs) 
            (f32.const 1.0) 
          )
          local.tee $newphs 
        end
      else
        (f32.sub 
          (local.get $newphs) 
          (f32.const 1.0) 
        )
        local.tee $newphs 
      end
    
      f32.store
      local.get $newphs
    else
      (f32.store
        (i32.add (local.get $loc) (i32.const 12)) 
        (f32.const 0)    
      ) 
      f32.const 0
    end
  )

  (func $peek_s (export "peek_s")
    (param $loc i32)
    (result f32)
    (local $idx i32)
    ;; len is f32 to make it easy for math
    ;; but it should be i32...
    (local $len f32)
    (local $phaseN f32)
    (local $phase f32)
    (local $floor f32)
    (local $ceil f32)
    (local $base i32)
    (local $next i32)
    (local $incr f32)
    (local $fract f32)
    (local $interp i32)
    (local $mode   i32)
    
    ;; get offset in memory for wavetable
    local.get $loc
    i32.const 8
    i32.add
    i32.load
    local.set $idx
    
    ;; get length
    local.get $loc
    i32.const 12
    i32.add
    f32.load
    local.set $len

    local.get $loc
    i32.const 20
    i32.add
    i32.load
    local.set $mode
    
    ;; get normalized phase
    (i32.add (local.get $loc) (i32.const 4) )
    f32.load
    local.set $phaseN
    
    ;; set $phase in range of 0-len based on mode
    (select
      (f32.mul (local.get $len) (local.get $phaseN))
      (local.get $phaseN)
      (i32.eq (i32.const 1) (local.get $mode))
    )
    local.tee $phase
    
    ;; get base index by rounding $phase down
    i32.trunc_f32_u
    local.set $base
    
    ;; multiply base index by 4 and load
    local.get $base
    i32.const 4
    i32.mul
    local.get $idx
    i32.add
    f32.load
    local.set $floor 

    ;; get interpolation mode
    local.get $loc
    i32.const 16
    i32.add
    i32.load
    local.tee $interp

    i32.const 1
    i32.eq
    if (result f32) ;; if linear interpolation   
      local.get $base
      i32.const 1
      i32.add
      local.tee $next

      (i32.trunc_f32_u (local.get $len) )
      i32.lt_u
      if (result f32)
        local.get $next
        i32.const 4
        i32.mul
        local.get $idx
        i32.add
        f32.load
      else
        ;; $idx is 0 index for table
        local.get $idx
        f32.load
      end
      
      local.set $ceil

      ;; get fractional part via phase - floor( phase )
      local.get $phase
      local.get $phase
      f32.floor
      f32.sub
      local.set $fract
      
      ;; multiply difference between ceil and floor by fractional part and 
      ;; add to floor
      local.get $ceil
      local.get $floor
      f32.sub
      local.get $fract
      f32.mul
      local.get $floor
      f32.add
    else
      local.get $floor ;; no interpolation
    end
  )
  ;; needs to alternatively accept a non-normalized phase,
  ;; and interpolation needs to be optional. 
  ;; to optimize, consider placing different versions of
  ;; peek in separate functions... which wasm function gets
  ;; called would be determined by JS.
  (func $peek_d (export "peek_d")
    (param $loc i32)
    (result f32)
    (local $idx i32)
    ;; len is f32 to make it easy for math
    ;; but it should be i32...
    (local $len f32)
    (local $phaseN f32)
    (local $phase f32)
    (local $floor f32)
    (local $ceil f32)
    (local $base i32)
    (local $next i32)
    (local $incr f32)
    (local $fract f32)
    (local $interp i32)
    (local $mode   i32)
    
    ;; get offset in memory for wavetable
    local.get $loc
    i32.const 8
    i32.add
    i32.load
    local.set $idx
    
    ;; get length
    local.get $loc
    i32.const 12
    i32.add
    f32.load
    local.set $len

    local.get $loc
    i32.const 20
    i32.add
    i32.load
    local.set $mode
    
    ;; get normalized phase
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $phaseN
    
    ;; set $phase in range of 0-len based on mode
    (select
      (f32.mul (local.get $len) (local.get $phaseN))
      (local.get $phaseN)
      (i32.eq (i32.const 1) (local.get $mode))
    )
    local.tee $phase
    
    ;; get base index by rounding $phase down
    i32.trunc_f32_u
    local.set $base
    
    ;; multiply base index by 4 and load
    local.get $base
    i32.const 4
    i32.mul
    local.get $idx
    i32.add
    f32.load
    local.set $floor 

    ;; get interpolation mode
    local.get $loc
    i32.const 16
    i32.add
    i32.load
    local.tee $interp

    i32.const 1
    i32.eq
    if (result f32) ;; if linear interpolation   
      local.get $base
      i32.const 1
      i32.add
      local.tee $next

      (i32.trunc_f32_u (local.get $len) )
      i32.lt_u
      if (result f32)
        local.get $next
        i32.const 4
        i32.mul
        local.get $idx
        i32.add
        f32.load
      else
        ;; $idx is 0 index for table
        local.get $idx
        f32.load
      end
      
      local.set $ceil

      ;; get fractional part via phase - floor( phase )
      local.get $phase
      local.get $phase
      f32.floor
      f32.sub
      local.set $fract
      
      ;; multiply difference between ceil and floor by fractional part and 
      ;; add to floor
      local.get $ceil
      local.get $floor
      f32.sub
      local.get $fract
      f32.mul
      local.get $floor
      f32.add
    else
      local.get $floor ;; no interpolation
    end

  )
  
  (func $poke_s_s (export "poke_s_s") (param $loc i32))
  (func $poke_s_d (export "poke_s_d") (param $loc i32))
  (func $poke_d_s (export "poke_d_s") (param $loc i32)
    (f32.store
      ;; index to store at
      (i32.add 
        (i32.load (i32.add (local.get $loc) (i32.const 12) ) );; data idx
        (i32.mul
          (i32.load (i32.add (local.get $loc) (i32.const 8) ) )
          (i32.const 4)
        )
      ) ;; data

      ;; value to store
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; function id
      )
    )
  )
  (func $poke_d_d (export "poke_d_d") (param $loc i32)
    (f32.store
      (i32.add
        (i32.mul
          (i32.trunc_f32_u
            (f32.floor
              (call_indirect (type $sig-i32--f32) 
                (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data
                (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; function id
              )
            )
          )
          (i32.const 4)
        )
        (i32.load (i32.add (local.get $loc) (i32.const 12) ) ) ;; data idx
      )
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; function id
      )
    )
  )
  
  (func $bang (export "bang") 
    (param $loc i32)
    (result f32)

    local.get $loc
    i32.const 4
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
      i32.const 4
      i32.add
      f32.const 0
      f32.store
      
      f32.const 1
    end
  )
  
  (func $clamp (export "clamp") 
    (param $loc i32)
    (result f32)
    (local $input f32)
    (local $min f32)
    (local $max f32)
    (local $abovefloor i32)
    (local $belowceil i32)
    
    local.get $loc
    call $get-property
    local.set $input

    local.get $loc
    i32.const 16
    i32.add
    call $get-property
    local.set $min
    
    local.get $loc
    i32.const 32
    i32.add
    call $get-property
    local.set $max
    
    (f32.gt (local.get $input) (local.get $min) )
    (local.set $abovefloor)

    (f32.lt (local.get $input) (local.get $max) )
    (local.set $belowceil)
    
    (select
      (local.get $input)
      (select
        (local.get $max) 
        (local.get $min)
        (local.get $abovefloor)  
      )
      (i32.and (local.get $abovefloor) (local.get $belowceil) )
    )    
  )

  (func $cycle_d (export "cycle_d") (param $idx i32) (result f32)
      (local $newphs f32)
      (local $phase f32)
      (local $floor f32)
      (local $ceil f32)
      (local $base i32)
      (local $incr f32)
      (local $fract f32)
      
      ;; load phase [64]
      local.get $idx
      i32.const 8
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      ;;(call $get-property (local.get $idx) )
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ) ;; fid
      )
      global.get $sr
      f32.div
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 8
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap)
      (f32.lt (local.get $newphs) (f32.const 1.0))
      ;;(i32.eqz (i32.load (i32.add (local.get $idx) (i32.const 41) ) ) )
      ;;i32.and
      if (result f32)
        (local.get $newphs)
      else
        (f32.sub 
          (local.get $newphs) 
          (f32.const 1.0) 
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs
      
      ;; set $phase in range of 0-len
      f32.const 1024
      f32.mul
      local.tee $phase
      
      ;; get base index by rounding $phase down
      i32.trunc_f32_u
      local.set $base
      
      ;; multiply base index by 4 and load
      local.get $base
      i32.const 4
      i32.mul
      i32.const 1024
      i32.add
      f32.load
      local.set $floor 
      
      ;; add one to base index, constrain to 0-1023, multiply by 4, and load
      local.get $base
      i32.const 1
      i32.add
      i32.const 1023
      i32.and
      i32.const 4
      i32.mul
      i32.const 1024
      i32.add
      f32.load
      local.set $ceil
      
      ;; get fractional part via phase - floor( phase )
      local.get $phase
      local.get $phase
      f32.floor
      f32.sub
      local.set $fract
      
      ;; multiply difference between ceil and floor by fractional part and 
      ;; add to floor
      local.get $ceil
      local.get $floor
      f32.sub
      local.get $fract
      f32.mul
      local.get $floor
      f32.add
    )

    (func $cycle_s (export "cycle_s") (param $idx i32) (result f32)
      (local $newphs f32)
      (local $phase f32)
      (local $floor f32)
      (local $ceil f32)
      (local $base i32)
      (local $incr f32)
      (local $fract f32)
      
      ;; load phase [64]
      local.get $idx
      i32.const 8
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      ;;(call $get-property (local.get $idx) )
      local.get $idx
      i32.const 4
      i32.add
      f32.load
      global.get $sr
      f32.div
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 8
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap)
      (f32.lt (local.get $newphs) (f32.const 1.0))
      ;;(i32.eqz (i32.load (i32.add (local.get $idx) (i32.const 41) ) ) )
      ;;i32.and
      if (result f32)
        (local.get $newphs)
      else
        (f32.sub 
          (local.get $newphs) 
          (f32.const 1.0) 
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs
      
      ;; set $phase in range of 0-len
      f32.const 1024
      f32.mul
      local.tee $phase
      
      ;; get base index by rounding $phase down
      i32.trunc_f32_u
      local.set $base
      
      ;; multiply base index by 4 and load
      local.get $base
      i32.const 4
      i32.mul
      i32.const 1024
      i32.add
      f32.load
      local.set $floor 
      
      ;; add one to base index, constrain to 0-1023, multiply by 4, and load
      local.get $base
      i32.const 1
      i32.add
      i32.const 1023
      i32.and
      i32.const 4
      i32.mul
      i32.const 1024
      i32.add
      f32.load
      local.set $ceil
      
      ;; get fractional part via phase - floor( phase )
      local.get $phase
      local.get $phase
      f32.floor
      f32.sub
      local.set $fract
      
      ;; multiply difference between ceil and floor by fractional part and 
      ;; add to floor
      local.get $ceil
      local.get $floor
      f32.sub
      local.get $fract
      f32.mul
      local.get $floor
      f32.add
    )

    ;; how many of these do we actually need to fill in?
    (func $sah_s_s_s (param $loc i32) (result f32) (f32.const 0) )
    (func $sah_s_s_d (param $loc i32) (result f32) (f32.const 0) )
    (func $sah_s_d_s (param $loc i32) (result f32) (f32.const 0) )
    (func $sah_s_d_d (param $loc i32) (result f32) (f32.const 0) )
    (func $sah_d_s_s (param $loc i32) (result f32) (f32.const 0) )
    (func $sah_d_s_d (param $loc i32) (result f32) (f32.const 0) )
    (func $sah_d_d_s (export "sah_d_d_s") (param $loc i32) (result f32)
      (local $valueinput f32)
      (local $controlinput f32)
      (local $threshold f32)
      (local $lastvalue f32)
      (local $lastcontrol f32)
      (local $trigger f32)
      
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
      )
      local.set $valueinput
      
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
      )
      local.set $controlinput
          
      local.get $loc
      i32.const 12
      i32.add
      f32.load
      local.set $threshold
      
      local.get $loc
      i32.const 20
      i32.add
      f32.load
      local.set $lastcontrol
      
      (f32.gt
        (local.get $controlinput)
        (local.get $threshold)
      )
      f32.convert_i32_u
      
      local.tee $trigger
      local.get $lastcontrol
      f32.ne
      
      if
        local.get $trigger
        i32.trunc_f32_u
        if
          local.get $loc
          i32.const 16
          i32.add
          local.get $valueinput
          f32.store
        end
        
        local.get $loc
        i32.const 20
        i32.add
        local.get $trigger
        f32.store
      end
      
      local.get $loc
      i32.const 16
      i32.add
      f32.load
    )

    (func $sah_d_d_d (export "sah_d_d_d") (param $loc i32) (result f32)
      (local $valueinput f32)
      (local $controlinput f32)
      (local $threshold f32)
      (local $lastvalue f32)
      (local $lastcontrol f32)
      (local $trigger f32)
      
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
      )
      local.set $valueinput
      
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
      )
      local.set $controlinput
          
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 12) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 12) ) ) ) ;; fid
      )
      local.set $threshold
      
      local.get $loc
      i32.const 20
      i32.add
      f32.load
      local.set $lastcontrol
      
      (f32.gt
        (local.get $controlinput)
        (local.get $threshold)
      )
      f32.convert_i32_u
      
      local.tee $trigger
      local.get $lastcontrol
      f32.ne
      
      if
        local.get $trigger
        i32.trunc_f32_u
        if
          local.get $loc
          i32.const 16
          i32.add
          local.get $valueinput
          f32.store
        end
        
        local.get $loc
        i32.const 20
        i32.add
        local.get $trigger
        f32.store
      end
      
      local.get $loc
      i32.const 16
      i32.add
      f32.load
    )
    

  (func $counter_s_s_s (export "counter_s_s_s") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $max f32)
    
    ;; check phase reset flag [64]
    ;;(call $get-property (i32.add (local.get $idx) (i32.const 16) ) )
    local.get $idx
    i32.const 8
    i32.add
    f32.load
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [32]
      local.get $idx
      i32.const 12
      i32.add
      f32.load
      local.set $max
      
      ;; load phase [48]
      local.get $idx
      i32.const 16
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      local.get $idx
      i32.const 4
      i32.add
      f32.load
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 16
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap).
      ;; also, set wrap flag to either 1 or 0
      (f32.lt (local.get $newphs) (local.get $max))
      if (result f32)
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 0) )
        (local.get $newphs)
      else
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 1) ) 
        (f32.sub 
          (local.get $newphs) 
          (local.get $max)
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (call $set-property 
      ;;   (i32.add (local.get $idx) (i32.const 16) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 16)) 
        (f32.const 0.0)
      ) 
      (f32.const 0)
    end
  )

  (func $counter_s_s_d (export "counter_s_s_d") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $max f32)
    
    ;; check phase reset flag [64]
    ;;(call $get-property (i32.add (local.get $idx) (i32.const 16) ) )
    local.get $idx
    i32.const 8
    i32.add
    f32.load
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [32]
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $idx) (i32.const 12) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $idx) (i32.const 12) ) ) ) ;; fid
      )
      local.set $max
      
      ;; load phase [48]
      local.get $idx
      i32.const 16
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      local.get $idx
      i32.const 4
      i32.add
      f32.load
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 16
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap).
      ;; also, set wrap flag to either 1 or 0
      (f32.lt (local.get $newphs) (local.get $max))
      if (result f32)
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 0) )
        (local.get $newphs)
      else
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 1) ) 
        (f32.sub 
          (local.get $newphs) 
          (local.get $max)
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (call $set-property 
      ;;   (i32.add (local.get $idx) (i32.const 16) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 16)) 
        (f32.const 0.0)
      ) 
      (f32.const 0)
    end
  )

  (func $counter_s_d_s (export "counter_s_d_s") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $max f32)
    
    ;; check phase reset flag [8]
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ) ;; fid
    )
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [12]
      local.get $idx
      i32.const 12
      i32.add
      f32.load
      local.set $max
      
      ;; load phase [16]
      local.get $idx
      i32.const 16
      i32.add
      f32.load
      
      ;; get phase increment [4] and add to current phase
      ;; to obtain new phase
      local.get $idx
      i32.const 4
      i32.add
      f32.load
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 16
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap).
      ;; also, set wrap flag to either 1 or 0
      (f32.lt (local.get $newphs) (local.get $max))
      if (result f32)
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 0) )
        (local.get $newphs)
      else
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 1) ) 
        (f32.sub 
          (local.get $newphs) 
          (local.get $max)
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (call $set-property 
      ;;   (i32.add (local.get $idx) (i32.const 16) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 16)) 
        (f32.const 0.0)
      ) 
      (f32.const 0)
    end
  )

  (func $counter_s_d_d (export "counter_s_d_d") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $max f32)
    
    ;; check phase reset flag [8]
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ) ;; fid
    )
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [12]
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $idx) (i32.const 12) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $idx) (i32.const 12) ) ) ) ;; fid
      )
      local.set $max
      
      ;; load phase [16]
      local.get $idx
      i32.const 16
      i32.add
      f32.load
      
      ;; get phase increment [4] and add to current phase
      ;; to obtain new phase
      local.get $idx
      i32.const 4
      i32.add
      f32.load
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 16
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap).
      ;; also, set wrap flag to either 1 or 0
      (f32.lt (local.get $newphs) (local.get $max))
      if (result f32)
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 0) )
        (local.get $newphs)
      else
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 1) ) 
        (f32.sub 
          (local.get $newphs) 
          (local.get $max)
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (call $set-property 
      ;;   (i32.add (local.get $idx) (i32.const 16) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 16)) 
        (f32.const 0.0)
      ) 
      (f32.const 0)
    end
  )

  (func $counter_d_s_s (export "counter_d_s_s") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $max f32)
    
    ;; check phase reset flag [64]
    ;;(call $get-property (i32.add (local.get $idx) (i32.const 16) ) )
    local.get $idx
    i32.const 8
    i32.add
    f32.load
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [32]
      local.get $idx
      i32.const 12
      i32.add
      f32.load
      local.set $max
      
      ;; load phase [48]
      local.get $idx
      i32.const 16
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ) ;; fid
      )
      f32.add
      local.set $newphs

      ;; push phase idx to the stack for storage after wrap/nowrap
      local.get $idx
      i32.const 16
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap).
      ;; also, set wrap flag to either 1 or 0
      (f32.lt (local.get $newphs) (local.get $max))
      if (result f32)
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 0) )
        (local.get $newphs)
      else
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 1) ) 
        (f32.sub 
          (local.get $newphs) 
          (local.get $max)
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (call $set-property 
      ;;   (i32.add (local.get $idx) (i32.const 16) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 16)) 
        (f32.const 0.0)
      ) 
      (f32.const 0)
    end
  )

  (func $counter_d_s_d (export "counter_d_s_d") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $max f32)
    
    ;; check phase reset flag [64]
    ;;(call $get-property (i32.add (local.get $idx) (i32.const 16) ) )
    local.get $idx
    i32.const 8
    i32.add
    f32.load
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [32]
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $idx) (i32.const 12) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $idx) (i32.const 12) ) ) ) ;; fid
      )
      local.set $max
      
      ;; load phase [48]
      local.get $idx
      i32.const 16
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ) ;; fid
      )
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 16
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap).
      ;; also, set wrap flag to either 1 or 0
      (f32.lt (local.get $newphs) (local.get $max))
      if (result f32)
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 0) )
        (local.get $newphs)
      else
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 1) ) 
        (f32.sub 
          (local.get $newphs) 
          (local.get $max)
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (call $set-property 
      ;;   (i32.add (local.get $idx) (i32.const 16) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 16)) 
        (f32.const 0.0)
      ) 
      (f32.const 0)
    end
  )

  (func $counter_d_d_s (export "counter_d_d_s") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $max f32)
    
    ;; check phase reset flag [8]
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ) ;; fid
    )
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [32]
      local.get $idx
      i32.const 12
      i32.add
      f32.load
      local.set $max
      
      ;; load phase [48]
      local.get $idx
      i32.const 16
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ) ;; fid
      )
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 16
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap).
      ;; also, set wrap flag to either 1 or 0
      (f32.lt (local.get $newphs) (local.get $max))
      if (result f32)
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 0) )
        (local.get $newphs)
      else
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 1) ) 
        (f32.sub 
          (local.get $newphs) 
          (local.get $max)
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (call $set-property 
      ;;   (i32.add (local.get $idx) (i32.const 16) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 16)) 
        (f32.const 0.0)
      ) 
      (f32.const 0)
    end
  )

  (func $counter_d_d_d (export "counter_d_d_d") 
    (param $idx i32)
    (result f32)
    (local $newphs f32)
    (local $max f32)
    
    ;; check phase reset flag [8]
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $idx) (i32.const 8) ) ) ) ;; fid
    )
    i32.trunc_f32_u
    i32.eqz
    if (result f32)
      ;; get max [32]
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $idx) (i32.const 12) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $idx) (i32.const 12) ) ) ) ;; fid
      )
      local.set $max
      
      ;; load phase [48]
      local.get $idx
      i32.const 16
      i32.add
      f32.load
      
      ;; get phase increment [0] and add to current phase
      ;; to obtain new phase
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $idx) (i32.const 4) ) ) ) ;; fid
      )
      f32.add
      local.set $newphs

      ;; push phase idx for set-property to the stack
      local.get $idx
      i32.const 16
      i32.add
      
      ;; wrap phase if needed
      ;; no branch if condition is true so use that for
      ;; the most common result (phase increments with no wrap).
      ;; also, set wrap flag to either 1 or 0
      (f32.lt (local.get $newphs) (local.get $max))
      if (result f32)
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 0) )
        (local.get $newphs)
      else
        (f32.store (i32.add (local.get $idx) (i32.const 20) ) (f32.const 1) ) 
        (f32.sub 
          (local.get $newphs) 
          (local.get $max)
        )
        local.tee $newphs 
      end
      
      f32.store
      local.get $newphs 
    else
      ;; reset.value [68] to 0
      ;; (call $set-property 
      ;;   (i32.add (local.get $idx) (i32.const 16) ) 
      ;;   (f32.const 0) 
      ;; )
      ;; set phase.value to $min [65]
      (f32.store
        (i32.add (local.get $idx) (i32.const 16)) 
        (f32.const 0.0)
      ) 
      (f32.const 0)
    end
  )
  ;; Bus- a bus adds a bunch of signals together, and then
  ;; scales them and pans (gain/pan is TODO)
  ;; 
  ;; properties:
  ;; [0] gain
  ;; [16] pan
  ;; 
  ;; data:
  ;; [32] numberOfInputs
  ;;
  ;; for each input in [32], there are three associated data fields:
  ;; [33] input function id
  ;; [34] input function data location
  ;; [35] number of channels for input function (not currently in use)
  (func $bus (export "bus") (param $loc i32) (result f32) 
    (local $numInputs i32)
    (local $out1 f32)
    (local $i    i32)
    (local $idx  i32)
    
    local.get $loc
    i32.const 12
    i32.add
    local.set $idx
    
    local.get $loc
    i32.const 8 ;; skip gain / pan for now
    i32.add
    
    i32.load 
    local.tee $numInputs
    
    i32.const 0
    i32.gt_u
    if
      (loop $l      
        (call_indirect (type $sig-i32--f32) 
          (i32.load (local.get $idx))
          (i32.load (i32.load (local.get $idx) ) )
        )
      
        ;; add indirect output to $out
        local.get $out1
        f32.add
        local.set $out1
      
        ;; increment i
        local.get $i
        i32.const 1
        i32.add
        local.set $i
      
        ;; update memory idx for next indirect call
        local.get $idx
        i32.const 4
        i32.add
        local.set $idx
      
        ;; check if len > i and break $l if true
        local.get $numInputs
        local.get $i
        i32.gt_u
        br_if $l
      )
    end
    
    local.get $out1
    local.get $loc      ;; scalar value (gain)
    i32.const 4
    i32.add 
    f32.load
    ;; call $get-property
    f32.mul
  )

  (func $memo (export "memo") (param $loc i32) (result f32)
    (local $lastsampletime i32)
    (local $lastsample f32)
    (local $inputsample f32)
    
    local.get $loc
    i32.const 8
    i32.add
    i32.load
    
    global.get $clock
    
    i32.eq
    if (result f32)
      local.get $loc
      i32.const 12
      i32.add
      f32.load
    else
      ;; store clock
      local.get $loc
      i32.const 8
      i32.add
      global.get $clock
      i32.store
      
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
      )
      local.set $inputsample
      
      ;; store sample
      (f32.store 
        (i32.add (local.get $loc) (i32.const 12))
        (local.get $inputsample)
      )
      
      local.get $inputsample
    end
  )
  
  (func $ssd (export "ssd") (param $loc i32) (result f32) 
    (local $prev f32)
    
    local.get $loc
    i32.const 4
    i32.add 
    f32.load
    local.set $prev 
    
    local.get $loc
    i32.const 4
    i32.add
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
    )
    f32.store
    
    local.get $prev
  )
  
  (func $delay_s_s (export "delay_s_s") )
  (func $delay_s_d (export "delay_s_d") ) 
  (func $delay_d_d (export "delay_d_d") )

  (func $delay_d_s (export "delay_d_s") (param $loc i32) (result f32) 
    (local $input f32)
    (local $time  f32)
    (local $len   i32)
    (local $read  f32)
    (local $out   f32)
    (local $write i32)
    (local $idx   i32)
    (local $table i32)
    (local $phase f32)
    (local $floor f32)
    (local $ceil  f32)
    (local $base  i32)
    (local $incr  f32)
    (local $fract f32)
    (local $next  i32)
    
    ;; get input to delay
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $input
    
    ;; get delay time
    local.get $loc
    i32.const 8
    i32.add
    f32.load
    local.set $time
    
    ;; get delay line length
    local.get $loc
    i32.const 12
    i32.add
    i32.load
    local.set $len
    
    ;; get current read index
    local.get $loc
    i32.const 16
    i32.add
    f32.load
    local.tee $read
    
    ;; write index = read index + delay time
    ;; wrapped to delay line length
    ;;f32.convert_i32_u
    local.get $time
    f32.add
    i32.trunc_f32_u
    local.set $write
    
    ;; wrap write TODO only wraps upper bound not lower
    (select
      (i32.sub (local.get $write) (local.get $len) )
      (local.get $write)
      (i32.ge_u (local.get $write) (local.get $len))
    )
    local.set $write
    
    ;; get offset in memory for wavetable
    local.get $loc
    i32.const 20
    i32.add
    local.set $idx
    
    ;; write input to wavetable located at $idx
    ;; remember to multiply write index by 4!!!
    (f32.store
      (i32.add (i32.mul (local.get $write) (i32.const 4)) (local.get $idx))
      (local.get $input)
    )
    
    ;; TODO laziness --- fix
    ;; most of the code below this point was 
    ;; copied from $peek
    local.get $read
    local.tee $phase
    
    ;; get base index by rounding $phase down
    i32.trunc_f32_u
    local.set $base
    
    ;; multiply base index by 4 and load
    local.get $base
    i32.const 4
    i32.mul
    local.get $idx
    i32.add
    f32.load
    local.set $floor 
    
    ;; add one to base index, constrain to 0-1023, multiply by 4, and load
    ;; local.get $base
    ;; i32.const 1
    ;; i32.add
    ;; i32.const 1023
    ;; i32.and
    ;; i32.const 4
    ;; i32.mul
    ;; local.get $idx
    ;; i32.add
    ;; f32.load
    ;; local.set $ceil

 
    local.get $base
    i32.const 1
    i32.add
    local.tee $next

    local.get $len
    i32.lt_u
    if (result f32)
      local.get $next
      i32.const 4
      i32.mul
      local.get $idx
      i32.add
      f32.load
    else
      ;; $idx is 0 index for table
      local.get $idx
      f32.load
    end
    
    local.set $ceil
    
    ;; get fractional part via phase - floor( phase )
    local.get $phase
    local.get $phase
    f32.floor
    f32.sub
    local.set $fract
    
    ;; multiply difference between ceil and floor by fractional part and 
    ;; add to floor
    local.get $ceil
    local.get $floor
    f32.sub
    local.get $fract
    f32.mul
    local.get $floor
    f32.add
    local.set $out

    ;; now that we have read index, go ahead and
    ;; increment write index
    local.get $read 
    f32.const 1
    f32.add
    local.set $read 
    
    ;; store the new write index
    (f32.store
      ;; location for storing write index
      (i32.add 
        (i32.const 16)
        (local.get $loc)
      )
      ;; if our index equals the length of our buffer, store 0
      ;; otherwise store current write value
      (select
        (f32.const 0)
        (local.get $read) 
        (i32.ge_u (i32.trunc_f32_u(local.get $read)) (local.get $len))
      )
    )
     
    local.get $out
  )

  ;; TODO
  (func $slide_s_s_s (export "slide_s_s_s") )
  (func $slide_s_s_d (export "slide_s_s_d") )
  (func $slide_s_d_s (export "slide_s_d_s") )
  (func $slide_s_d_d (export "slide_s_d_d") )
  (func $slide_d_s_d (export "slide_d_s_d") )
  (func $slide_d_d_s (export "slide_d_d_s") )
  (func $slide_d_d_d (export "slide_d_d_d") )

  (func $slide_d_s_s (export "slide_d_s_s") (param $loc i32) (result f32)
    (local $y f32)
    (local $input f32)
    (local $slideup f32)
    (local $slidedown f32)
    (local $filter f32)
    (local $slideamount f32)

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $input

    local.get $loc
    i32.const 8
    i32.add
    f32.load
    local.set $slideup

    local.get $loc
    i32.const 12
    i32.add
    f32.load
    local.set $slidedown

    local.get $loc
    i32.const 16
    i32.add
    f32.load
    local.set $filter

    (select
      (local.get $slideup )
      (local.get $slideup )
      (f32.gt (local.get $input) (local.get $filter))
    )
    local.set $slideamount

    ;;filter = memo( add( y1.out, div( sub( in1, y1.out ), slideAmount ) ) )
    (f32.add
      (local.get $filter)
      (f32.div
        (f32.sub (local.get $input) (local.get $filter) )
        (local.get $slideamount)
      )
    )
    (local.set $filter)

    (f32.store
      (i32.add
        (local.get $loc)
        (i32.const 16)
      )
      (local.get $filter)
    )

    local.get $filter
  )

  (func $param_d (export "param_d") (param $loc i32) (result f32)
    local.get $loc
    i32.const 4
    i32.add
    f32.load
  )


  ;; I guess you could have 0 to fade as a justification to fill out
  ;; these stubs? would be same as a param in a mul going towards 0...
  (func $mix_s_s_s (export "mix_s_s_s") )
  (func $mix_s_s_d (export "mix_s_s_d") )
  (func $mix_s_d_s (export "mix_s_d_s") )
  (func $mix_s_d_d (export "mix_s_d_d") )
  (func $mix_d_s_s (export "mix_d_s_s") )
  (func $mix_d_s_d (export "mix_d_s_d") )

  (func $mix_d_d_d (export "mix_d_d_d") (param $loc i32) (result f32)
    (local $in1 f32)
    (local $in2 f32)
    (local $t f32)
    
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $in1
    
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
    )
    local.set $in2
    
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 12) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 12) ) ) ) ;; fid
    )
    local.set $t
    
    (f32.add
      (f32.mul
        (local.get $in1)
        (f32.sub
          (f32.const 1)
          (local.get $t)
        ) 
      )
      (f32.mul
        (local.get $in2)
        (local.get $t)
      )
    )
  )

  (func $mix_d_d_s (export "mix_d_d_s") (param $loc i32) (result f32)
    (local $in1 f32)
    (local $in2 f32)
    (local $t f32)
    
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $in1
    
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
    )
    local.set $in2
    
    (f32.load (i32.add (local.get $loc) (i32.const 12) ) )
    local.set $t
    
    (f32.add
      (f32.mul
        (local.get $in1)
        (f32.sub
          (f32.const 1)
          (local.get $t)
        ) 
      )
      (f32.mul
        (local.get $in2)
        (local.get $t)
      )
    )
  )
  
  ;; TODO don't call out to accum_s_d? 
  (func $ad_s_s (export "ad_s_s") (param $loc i32) (result f32)
    (local $attack f32)
    (local $decay f32)
    (local $phase f32)
    
    local.get $loc
    i32.const 20 ;; + 12 for ad, + 8 for bang 
    i32.add
    call $accum_s_d
    local.set $phase
    
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.set $attack
    
    (i32.add (local.get $loc) (i32.const 8))
    f32.load
    local.set $decay
    
    ;; if env is over (phase is > than attack + decay )
    (f32.gt (local.get $phase) (f32.add (local.get $attack) (local.get $decay)))
    if (result f32)
      f32.const 0
    else
      (f32.lt (local.get $phase) (local.get $attack) )
      if (result f32)
        local.get $phase
        local.get $attack
        f32.div
      else
        (f32.sub
          (f32.const 1)
          (f32.div
            (f32.sub (local.get $phase) (local.get $attack) )
            (local.get $decay)
          )
        )
      end 
    end
  )

  (func $ad_s_d (export "ad_s_d") (param $loc i32) (result f32)
    (local $attack f32)
    (local $decay f32)
    (local $phase f32)
    
    local.get $loc
    i32.const 20 ;; + 12 for ad, + 8 for bang 
    i32.add
    call $accum_s_d
    local.set $phase
    
    local.get $loc
    i32.const 4
    i32.add
    f32.load
    local.set $attack
    
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
    )
    local.set $decay
    
    ;; if env is over (phase is > than attack + decay )
    (f32.gt (local.get $phase) (f32.add (local.get $attack) (local.get $decay)))
    if (result f32)
      f32.const 0
    else
      (f32.lt (local.get $phase) (local.get $attack) )
      if (result f32)
        local.get $phase
        local.get $attack
        f32.div
      else
        (f32.sub
          (f32.const 1)
          (f32.div
            (f32.sub (local.get $phase) (local.get $attack) )
            (local.get $decay)
          )
        )
      end 
    end
  )

  (func $ad_d_s (export "ad_d_s") (param $loc i32) (result f32)
    (local $attack f32)
    (local $decay f32)
    (local $phase f32)
    
    local.get $loc
    i32.const 20 ;; + 12 for ad, + 8 for bang 
    i32.add
    call $accum_s_d
    local.set $phase
    
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $attack
    
    (i32.add (local.get $loc) (i32.const 8))
    f32.load
    local.set $decay
    
    ;; if env is over (phase is > than attack + decay )
    (f32.gt (local.get $phase) (f32.add (local.get $attack) (local.get $decay)))
    if (result f32)
      f32.const 0
    else
      (f32.lt (local.get $phase) (local.get $attack) )
      if (result f32)
        local.get $phase
        local.get $attack
        f32.div
      else
        (f32.sub
          (f32.const 1)
          (f32.div
            (f32.sub (local.get $phase) (local.get $attack) )
            (local.get $decay)
          )
        )
      end 
    end
  )

  (func $ad_d_d (export "ad_d_d") (param $loc i32) (result f32)
    (local $attack f32)
    (local $decay f32)
    (local $phase f32)
    
    local.get $loc
    i32.const 20 ;; + 12 for ad, + 8 for bang 
    i32.add
    call $accum_s_d
    local.set $phase
    
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $attack
    
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
    )
    local.set $decay
    
    ;; if env is over (phase is > than attack + decay )
    (f32.gt (local.get $phase) (f32.add (local.get $attack) (local.get $decay)))
    if (result f32)
      f32.const 0
    else
      (f32.lt (local.get $phase) (local.get $attack) )
      if (result f32)
        local.get $phase
        local.get $attack
        f32.div
      else
        (f32.sub
          (f32.const 1)
          (f32.div
            (f32.sub (local.get $phase) (local.get $attack) )
            (local.get $decay)
          )
        )
      end 
    end
  )

  (func $ifelse_s_s_s (export "ifelse_s_s_s") (result f32) f32.const 0)
  (func $ifelse_s_s_d (export "ifelse_s_s_d") (result f32) f32.const 0)
  (func $ifelse_s_d_s (export "ifelse_s_d_s") (result f32) f32.const 0)
  (func $ifelse_s_d_d (export "ifelse_s_d_  d") (result f32) f32.const 0)
  (func $ifelse_d_s_d (export "ifelse_d_s_d") (result f32) f32.const 0)
  (func $ifelse_d_d_s (export "ifelse_d_d_s") (param $loc i32) (result f32)
    (i32.trunc_f32_u     
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
      )
    )
    if (result f32)
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 8 ) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
      )
    else
      local.get $loc
      i32.const 12
      i32.add
      f32.load
    end
  )

  (func $ifelse_d_s_s (export "ifelse_d_s_s") (param $loc i32) (result f32)
    (select
      (i32.const 8)
      (i32.const 12)
      (i32.trunc_f32_u     
        (call_indirect (type $sig-i32--f32) 
          (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
          (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
        )
      )
    )

    local.get $loc
    i32.add
    f32.load
  )

  ;; only runs the "true" expression, the false expression
  ;; does not calculate samples.
  ;; TODO is this possible to code using our current d vs s scheme?
  ;; with non-dynamic arguments there's no way to know whether the final
  ;; line should be a call or a value lookup... it's all based on the
  ;; results of evaluting the conditional.
  ;; d_s_s would also be simple to implement. everything else...
  ;; tricky! could probably do with another if statement that calls
  ;; or looks up based on which value is chosen (set a flag), would need a regular
  ;; branching if statement though.
  (func $ifelse_d_d_d (export "ifelse_d_d_d") (param $loc i32) (result f32)
    (select
      (i32.const 8)
      (i32.const 12)
      (i32.trunc_f32_u     
        (call_indirect (type $sig-i32--f32) 
          (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
          (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
        )
      )
    )

    local.get $loc
    i32.add
    local.set $loc

    (call_indirect (type $sig-i32--f32) 
      (i32.load (local.get $loc) ) ;; data location
      (i32.load (i32.load (local.get $loc) ) ) ;; fid
    )
  )
  (func $ifelse2_s_s_s (export "ifelse2_s_s_s") (result f32) f32.const 0)
  (func $ifelse2_s_s_d (export "ifelse2_s_s_d") (result f32) f32.const 0)
  (func $ifelse2_s_d_s (export "ifelse2_s_d_s") (result f32) f32.const 0)
  (func $ifelse2_s_d_d (export "ifelse2_s_d_d") (result f32) f32.const 0)
  (func $ifelse2_d_s_d (export "ifelse2_d_s_d") (result f32) f32.const 0)
  (func $ifelse2_d_d_s (export "ifelse2_d_d_s") (result f32) f32.const 0)
  (func $ifelse2_d_s_s (export "ifelse2_d_s_s") (result f32) f32.const 0)

  ;; both expressions calculate samples
  (func $ifelse2_d_d_d (export "ifelse2_d_d_d") (param $loc i32) (result f32)
    (select
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
      )
      (call_indirect (type $sig-i32--f32) 
        (i32.load (i32.add (local.get $loc) (i32.const 12) ) ) ;; data location
        (i32.load (i32.load (i32.add (local.get $loc) (i32.const 12) ) ) ) ;; fid
      )
      (i32.trunc_f32_u 
        (call_indirect (type $sig-i32--f32) 
          (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
          (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
        )
      )
    )
  )

  (func $pow_s_s (export "pow_s_s") (param $loc i32) (result f32) f32.const 0 )
  (func $pow_s_d (export "pow_s_d") (param $loc i32) (result f32) f32.const 0 )

  (func $pow_d_s (export "pow_d_s") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)
    (local $out f32)
    (local $index i32)

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $x

    (f32.load (i32.add (local.get $loc) (i32.const 8)) )
    local.set $y
    
    f32.const 1
    local.set $out
    i32.const 1
    local.set $index

    local.get $y
    f32.const 0
    f32.eq
    if $i0
      f32.const 1
      return
    end
    
    (block $b0
      (loop $l0
        (f32.mul 
          (local.get $out)
          (local.get $x)
        )
        local.set $out

        (i32.add 
          (local.get $index)
          (i32.const 1)
        )
        local.tee $index
        local.get $y
        i32.trunc_f32_s
        i32.gt_u
        br_if 1

        br 0
      )
    )

    local.get $out
  )

  (func $pow_d_d (export "pow_d_d") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)
    (local $out f32)
    (local $index i32)

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $x

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
    )
    local.set $y
    
    f32.const 1
    local.set $out
    i32.const 1
    local.set $index

    local.get $y
    f32.const 0
    f32.eq
    if $i0
      f32.const 1
      return
    end
    
    (block $b0
      (loop $l0
        (f32.mul 
          (local.get $out)
          (local.get $x)
        )
        local.set $out

        (i32.add 
          (local.get $index)
          (i32.const 1)
        )
        local.tee $index
        local.get $y
        i32.trunc_f32_s
        i32.gt_u
        br_if 1

        br 0
      )
    )

    local.get $out
  )

  ;; (func $fract (export "fract") (param $x f32) (result f32)
  ;;   (f32.sub
  ;;     (get_local $x)
  ;;     (f32.floor (get_local $x))
  ;;   )
  ;; )
  (func $mod_s_s (export "mod_s_s") (param $loc i32) (result f32) f32.const 0)

  (func $mod_s_d (export "mod_s_d") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)
    (local $z f32)

    (i32.add (local.get $loc) (i32.const 4) ) ;; data location
    f32.load
    local.set $x

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
    )
    local.set $y

    (f32.div
      (local.get $x)
      (local.get $y)
    )
    local.tee $z
    f32.floor
    local.get $x
    f32.sub

    local.get $y
    f32.mul
  )

  (func $mod_d_s (export "mod_d_s") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)
    (local $z f32)

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $x

    (i32.add (local.get $loc) (i32.const 8) ) ;; data location
    f32.load
    local.set $y

    (f32.div
      (local.get $x)
      (local.get $y)
    )
    local.tee $z
    local.get $z
    f32.floor
    f32.sub

    local.get $y
    f32.mul
  )

  (func $mod_d_d (export "mod_d_d") (param $loc i32) (result f32)
    (local $x f32)
    (local $y f32)
    (local $z f32)

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    local.set $x

    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 8) ) ) ) ;; fid
    )
    local.set $y

    (f32.div
      (local.get $x)
      (local.get $y)
    )
    local.tee $z
    f32.floor
    local.get $x
    f32.sub

    local.get $y
    f32.mul
  )
  ;; adapted from:
  ;; https://www.musicdsp.org/en/latest/Synthesis/216-fast-whitenoise-generator.html
  (func $noise (export "noise") (param $loc i32) (result f32)
    (local $0 i32)
    (local $1 i32)
    (i32.store
      (i32.add (local.get $loc) (i32.const 12) )
      (local.tee $1
        (i32.xor
          (i32.load
            (i32.add (local.get $loc) (i32.const 12) )
          )
          (local.tee $0
            (i32.load
              (i32.add (local.get $loc) (i32.const 8) )
            )
          )
        )
      )
    )
    (i32.store
      (i32.add (local.get $loc) (i32.const 8) )
      (i32.add
        (local.get $1)
        (local.get $0)
      )
    )
    (f32.mul
      (f32.add
        (f32.mul
          (f32.load
            (i32.add (local.get $loc) (i32.const 4))
          )
          (f32.convert_i32_s
            (local.get $0)
          )
        )
        (f32.const 1)
      )
      (f32.const 0.5)
    )
  )

  (func $caller (export "caller") (param $loc i32) (result f32)
    (local $offset i32)
    (call_indirect (type $sig-i32--f32) 
      (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ;; data location
      (i32.load (i32.load (i32.add (local.get $loc) (i32.const 4) ) ) ) ;; fid
    )
    drop

    ;; get address where data is stored
    local.get $loc
    i32.const 8
    i32.add
    i32.load

    ;; load output data
    f32.load
  )


  (func $processPokes (export "processPokes") 
    (local $idx i32)
    (local $i i32)
    i32.const 1024    
    local.set $idx 

    i32.const 0
    local.set $i

    (loop $l
      (i32.load (local.get $idx))
      i32.const 0
      i32.ne
      if
        (call_indirect (type $sig-i32) 
          (i32.load (local.get $idx) ) ;; data
          (i32.load (i32.load (local.get $idx) ) ) ;; function id
        )
      end

      ;; increment i
      local.get $i
      i32.const 1
      i32.add
      local.set $i
      
      ;; update idx to next storage position
      local.get $idx
      i32.const 4
      i32.add
      local.set $idx
      
      ;; check if i > len and break $l if true
      i32.const 50
      local.get $i
      i32.ge_u 
      br_if $l
    )    
  )
  
  ;; render a function for a given number
  ;; of samples to shared memory. can
  ;; replace using a for-loop in the main thread
  ;; to read samples one at a time.
  (func $render (export "render") 
    (param $loc i32) ;; memory location for function to call
    (param $len i32) ;; number of samples to render
    (param $idx i32) ;; position in memory to write to
    (result     i32) ;; return number of samples rendered
    (local $i   i32) ;; iterator for loop
    (local $fid i32)
    
    (loop $l
      ;; store call fnc and store output at $idx
      (f32.store 
        (local.get $idx)
        (call_indirect (type $sig-i32--f32) 
          (local.get $loc)
          (i32.load (local.get $loc) )
        )
      )
            
      ;; increment i
      local.get $i
      i32.const 1
      i32.add
      local.set $i
      
      ;; update idx to next storage position
      local.get $idx
      i32.const 4
      i32.add
      local.set $idx

      global.get $clock
      i32.const 1
      i32.add 
      global.set $clock

      call $processPokes
      
      ;; check if i > len and break $l if true
      local.get $len
      local.get $i
      i32.gt_u 
      br_if $l
    )
    
    local.get $len
  )

  ;; render a function for a given number
  ;; of samples to shared memory. can
  ;; replace using a for-loop in the main thread
  ;; to read samples one at a time.
  (func $renderStereo (export "renderStereo") 
    (param $leftloc i32) ;; memory location for function to call
    (param $rightloc i32) ;; memory location for function to call
    (param $len i32) ;; number of samples to render
    (param $idx i32) ;; position in memory to write to
    (result     i32) ;; return number of samples rendered
    (local $i   i32) ;; iterator for loop
    
    
    (loop $l
      ;; render left fnc output and store at $idx
      (f32.store 
        (local.get $idx)
        (call_indirect (type $sig-i32--f32) 
          (local.get $leftloc)
          (i32.load (local.get $leftloc) )
        )
      )

      ;; render right fnc output and store at $idx + 512
      (f32.store 
        (i32.add (local.get $idx) (i32.const 512) )
        (call_indirect (type $sig-i32--f32) 
          (local.get $rightloc)
          (i32.load (local.get $rightloc) )
        )
      )
            
      ;; increment i
      local.get $i
      i32.const 1
      i32.add
      local.set $i
      
      ;; update idx to next storage position
      local.get $idx
      i32.const 4
      i32.add
      local.set $idx

      ;; clock update
      global.get $clock
      i32.const 1
      i32.add 
      global.set $clock
      
      call $processPokes

      ;; check if i > len and break $l if true
      local.get $len
      local.get $i
      i32.gt_u 
      br_if $l
    )
    
    local.get $len
  )

) ;; end of file