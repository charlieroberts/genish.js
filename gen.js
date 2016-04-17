'use strict'

let gen = {
  memo: new Map(),
  graph:null,
  accum:0,
  
  isNotNumber( v ) {
    return (typeof v)[0] !== 'n'  
  },
  
  getUID() {
    return this.accum++
  },
  
  out() {
    this.memo.clear()
    return this.graph()
  },
}

let abs = x => {
  let ugen = function() {
    if( this.uid in this.memo ) return this.memo[ this.uid ]
    
    let out = this.inputs[ 0 ]
    
    if( this.isNotNumber( out ) ) out = out()
    
    out = this.abs( out )
      
    this.memo.set( this.uid, out )
      
    return out
  }
  
  return ugen.bind({
    uid:          gen.getUID(),
    inputs:       [ x ],
    abs:          Math.abs,
    memo:         gen.memo,
    isNotNumber:  gen.isNotNumber
  })
}

let sin = x => {
  let ugen = function() {
    if( this.uid in this.memo ) return this.memo[ this.uid ]
    
    let out = this.inputs[ 0 ]
    
    if( this.isNotNumber( out ) ) out = out()
    
    out = this.sin( out )
      
    this.memo.set( this.uid, out )
      
    return out
  }
  
  return ugen.bind({
    uid:          gen.getUID(),
    inputs:       [ x ],
    sin:          Math.sin,
    memo:         gen.memo,
    isNotNumber:  gen.isNotNumber
  })
}

let mul = ( x,y ) => {
  let ugen = function() {
    if( this.uid in this.memo ) return this.memo[ this.uid ]
    
    let x = this.inputs[ 0 ], y = this.inputs[ 1 ]
    
    if( this.isNotNumber( x ) ) x = x()
    if( this.isNotNumber( y ) ) y = y()      
    
    let out = x * y
      
    this.memo.set( this.uid, out )
      
    return out
  }
  
  return ugen.bind({
    uid:          gen.getUID(),
    inputs:       [ x,y ],
    memo:         gen.memo,
    isNotNumber:  gen.isNotNumber
  })
}

let add = ( x,y ) => {
  let ugen = function() {
    if( this.uid in this.memo ) return this.memo[ this.uid ]
    
    let x = this.inputs[ 0 ], y = this.inputs[ 1 ]
    
    if( this.isNotNumber( x ) ) x = x()
    if( this.isNotNumber( y ) ) y = y()      
    
    let out = x + y
      
    this.memo.set( this.uid, out )
      
    return out
  }
  
  return ugen.bind({
    uid:          gen.getUID(),
    inputs:       [ x,y ],
    memo:         gen.memo,
    isNotNumber:  gen.isNotNumber
  })
}

let accum = ( incr, reset=0, min=0, max=1 ) => {
  let ugen = function() {
    if( this.uid in this.memo ) return this.memo[ this.uid ]
    
    let incr = this.inputs[ 0 ], reset = this.inputs[ 1 ]
    
    if( this.isNotNumber( incr ) ) incr = incr()
    if( this.isNotNumber( reset ) ) reset = reset()      
    
    this.out += incr
      
    if( reset ) {
      this.out = this.min
    }else{
      if( this.out > this.max ) this.out = this.min
    }
    
    this.memo.set( this.uid, this.out )
      
    return this.out
  }
  
  return ugen.bind({
    min, 
    max,
    out:          0,
    uid:          gen.getUID(),
    inputs:       [ incr, reset ],
    memo:         gen.memo,
    isNotNumber:  gen.isNotNumber
  })
}

let bus = ( ...args ) => {
  let ugen = function() {
    if( this.uid in this.memo ) return this.memo[ this.uid ]
    
    let out = 0
    
    for( let i = 0, l = this.inputs.length; i < l; i++ ) {
      let input = this.inputs[ i ]
      if( this.isNotNumber( input ) ) input = input()
      out += input
    }
    
    this.memo.set( this.uid, out )
    
    return out
  }
  
  return ugen.bind({
    uid:          gen.getUID(),
    inputs:       args,
    memo:         gen.memo,
    isNotNumber:  gen.isNotNumber
  })
}

let param = value => {
  let p = function( v ) {
    if( v !== undefined ) this.value = v
    return this.value
  }
  
  return p.bind({ value })
}

let PI = Math.PI,
    SR = 44100

module.exports = { gen, add, mul, accum, abs, sin, bus, param, PI, SR }