'use strict'

let library = {
  export( destination ) {
    destination.ssd = library.history // history is window object property, so use ssd as alias
    delete library.history
    Object.assign( destination, library )
    destination.clip = library.clamp
  },

  gen:    require( './gen.js' ),
  
  abs:    require('./abs.js'),
  round:  require('./round.js'),
  param:  require('./param.js'),
  add:    require('./add.js'),
  sub:    require('./sub.js'),
  mul:    require('./mul.js'),
  div:    require('./div.js'),
  accum:  require('./accum.js'),
  sin:    require('./sin.js'),
  cos:    require('./cos.js'),
  tan:    require('./tan.js'),
  asin:   require('./asin.js'),
  acos:   require('./acos.js'),
  atan:   require('./atan.js'),  
  phasor: require('./phasor.js'),
  data:   require('./data.js'),
  peek:   require('./peek.js'),
  cycle:  require('./cycle.js'),
  history:require('./history.js'),
  delta:  require('./delta.js'),
  floor:  require('./floor.js'),
  ceil:   require('./ceil.js'),
  min:    require('./min.js'),
  max:    require('./max.js'),
  sign:   require('./sign.js'),
  dcblock:require('./dcblock.js'),
  memo:   require('./memo.js'),
  rate:   require('./rate.js'),
  wrap:   require('./wrap.js'),
  mix:    require('./mix.js'),
  clamp:  require('./clamp.js'),
  poke:   require('./poke.js'),
  delay:  require('./delay.js'),
  fold:   require('./fold.js'),
  mod :   require('./mod.js'),
  sah :   require('./sah.js'),
  noise:  require('./noise.js'),
  not:    require('./not.js'),
  gt:     require('./gt.js'),
  lt:     require('./lt.js'), 
  bool:   require('./bool.js'),
  prop:   require('./prop.js'),
  gate:   require('./gate.js'),
  train:  require('./train.js'),
  utilities: require( './utilities.js' )
}

library.gen.lib = library

module.exports = library
