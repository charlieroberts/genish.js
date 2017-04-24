'use strict'

let library = {
  export( destination ) {
    if( destination === window ) {
      destination.ssd = library.history    // history is window object property, so use ssd as alias
      destination.input = library.in       // in is a keyword in javascript
      destination.ternary = library.switch // switch is a keyword in javascript

      delete library.history
      delete library.in
      delete library.switch
    }

    Object.assign( destination, library )

    Object.defineProperty( library, 'samplerate', {
      get() { return library.gen.samplerate },
      set(v) {}
    })

    library.in = destination.input
    library.history = destination.ssd
    library.switch = destination.ternary

    destination.clip = library.clamp
  },

  gen:      require( './gen.js' ),
  abs:      require( './ugens/target/abs.js' ),
  round:    require( './ugens/target/round.js' ),
  param:    require( './ugens/target/param.js' ),
  add:      require( './ugens/target/add.js' ),
  sub:      require( './ugens/target/sub.js' ),
  mul:      require( './ugens/target/mul.js' ),
  div:      require( './ugens/target/div.js' ),
  accum:    require( './ugens/target/accum.js' ),
  counter:  require( './ugens/target/counter.js' ),
  sin:      require( './ugens/target/sin.js' ),
  cos:      require( './ugens/target/cos.js' ),
  tan:      require( './ugens/target/tan.js' ),
  tanh:     require( './ugens/target/tanh.js' ),
  asin:     require( './ugens/target/asin.js' ),
  acos:     require( './ugens/target/acos.js' ),
  atan:     require( './ugens/target/atan.js' ),  
  phasor:   require( './ugens/common/phasor.js' ),
  data:     require( './ugens/common/data.js' ),
  peek:     require( './ugens/target/peek.js' ),
  cycle:    require( './ugens/common/cycle.js' ),
  history:  require( './ugens/target/history.js' ),
  delta:    require( './ugens/common/delta.js' ),
  floor:    require( './ugens/target/floor.js' ),
  ceil:     require( './ugens/target/ceil.js' ),
  min:      require( './ugens/target/min.js' ),
  max:      require( './ugens/target/max.js' ),
  sign:     require( './ugens/target/sign.js' ),
  dcblock:  require( './ugens/common/dcblock.js' ),
  memo:     require( './ugens/target/memo.js' ),
  rate:     require( './ugens/target/rate.js' ),
  wrap:     require( './ugens/target/wrap.js' ),
  mix:      require( './ugens/common/mix.js' ),
  clamp:    require( './ugens/target/clamp.js' ),
  poke:     require( './ugens/target/poke.js' ),
  delay:    require( './ugens/common/delay.js' ),
  fold:     require( './ugens/target/fold.js' ),
  mod :     require( './ugens/target/mod.js' ),
  sah :     require( './ugens/target/sah.js' ),
  noise:    require( './ugens/target/noise.js' ),
  not:      require( './ugens/target/not.js' ),
  gt:       require( './ugens/target/gt.js' ),
  gte:      require( './ugens/target/gte.js' ),
  lt:       require( './ugens/target/lt.js' ), 
  lte:      require( './ugens/target/lte.js' ), 
  bool:     require( './ugens/target/bool.js' ),
  gate:     require( './ugens/target/gate.js' ),
  train:    require( './ugens/common/train.js' ),
  slide:    require( './ugens/common/slide.js' ),
  in:       require( './ugens/target/in.js' ),
  t60:      require( './ugens/target/t60.js'),
  mtof:     require( './ugens/target/mtof.js'),
  ltp:      require( './ugens/target/ltp.js'),        // TODO: test
  gtp:      require( './ugens/target/gtp.js'),        // TODO: test
  switch:   require( './ugens/target/switch.js' ),
  mstosamps:require( './ugens/target/mstosamps.js' ), // TODO: needs test,
  selector: require( './ugens/target/selector.js' ),
  utilities:require( './utilities.js' ),
  pow:      require( './ugens/target/pow.js' ),
  attack:   require( './ugens/common/attack.js' ),
  decay:    require( './ugens/common/decay.js' ),
  windows:  require( './windows.js' ),
  env:      require( './ugens/common/env.js' ),
  ad:       require( './ugens/common/ad.js'  ),
  adsr:     require( './ugens/common/adsr.js' ),
  ifelse:   require( './ugens/target/ifelseif.js' ),
  bang:     require( './ugens/target/bang.js' ),
  and:      require( './ugens/target/and.js' ),
  pan:      require( './ugens/common/pan.js' ),
  eq:       require( './ugens/target/eq.js' ),
  neq:      require( './ugens/target/neq.js' )
}

library.gen.lib = library

module.exports = library
