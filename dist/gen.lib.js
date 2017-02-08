(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.genish = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'abs',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    gen.variableNames.add( [this.id,'f'] )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.abs })

      out = [ this.id, `  ${this.id} = abs( ${inputs[0]} );\n` ]

    } else {
      out = Math.abs( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let abs = Object.create( proto )

  abs.inputs = [ x ]
  abs.id = abs.name + gen.getUID()

  return abs
}

},{"./gen.js":29}],2:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'accum',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        genName = 'gen.' + this.name,
        functionBody

    gen.requestMemory( this.memory )
    this.memory.value.idx *= 4

    gen.memory.heap[ this.memory.value.idx ] = this.initialValue

    functionBody = this.callback( genName, inputs[0], inputs[1], `memory[ ${this.memory.value.idx} >> 2 ]` )

    gen.variableNames.add( [this.name + '_value','f'] )

    gen.closures.add({ [ this.name ]: this }) 

    //gen.memo[ this.name ] = this.name + '_value'
    
    return [ this.name + '_value', functionBody ]
  },

  callback( _name, _incr, _reset, valueRef ) {
    let diff = this.max - this.min,
        out = '',
        wrap = ''
    
    /* three different methods of wrapping, third is most expensive:
     *
     * 1: range {0,1}: y = x - (x | 0)
     * 2: log2(this.max) == integer: y = x & (this.max - 1)
     * 3: all others: if( x >= this.max ) y = this.max -x
     *
     */

    // must check for reset before storing value for output
    if( !(typeof this.inputs[1] === 'number' && this.inputs[1] < 1) ) { 
      out += `  if( fround(${_reset}) >= fround(1) ) { ${valueRef} = fround(${this.min}); }\n\n` 
    }

    out += `  ${this.name}_value = fround(${valueRef});\n`
    
    if( this.shouldWrap === false && this.shouldClamp === true ) {
      out += `  if( fround(${valueRef}) < fround(${this.max}) ) { fround(${valueRef}) = fround(${valueRef}) + fround(${_incr}); }\n`
    }else{
      out += `  ${valueRef} = fround(${valueRef}) + fround(${_incr});\n` // store output value before accumulating  
    }

    if( this.max !== Infinity  && this.shouldWrap ) wrap += `  if( fround(${valueRef}) >= fround(${this.max}) ) { ${valueRef} = fround(${valueRef}) - fround(${diff}); }\n`
    if( this.min !== -Infinity && this.shouldWrap ) wrap += `  if( fround(${valueRef}) < fround(${this.min}) ) { ${valueRef} = fround(${valueRef}) +  fround(${diff}); }\n\n`

    //if( this.min === 0 && this.max === 1 ) { 
    //  wrap =  `  ${valueRef} = ${valueRef} - (${valueRef} | 0)\n\n`
    //} else if( this.min === 0 && ( Math.log2( this.max ) | 0 ) === Math.log2( this.max ) ) {
    //  wrap =  `  ${valueRef} = ${valueRef} & (${this.max} - 1)\n\n`
    //} else if( this.max !== Infinity ){
    //  wrap = `  if( ${valueRef} >= ${this.max} ) ${valueRef} -= ${diff}\n\n`
    //}

    out = out + wrap

    return out
  }
}

module.exports = ( incr, reset=0, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { min:0, max:1, shouldWrap: true, shouldClamp:false }
  
  if( properties !== undefined ) Object.assign( defaults, properties )

  if( defaults.initialValue === undefined ) defaults.initialValue = defaults.min

  Object.assign( ugen, { 
    min: defaults.min, 
    max: defaults.max,
    initial: defaults.initialValue,
    uid:    gen.getUID(),
    inputs: [ incr, reset ],
    memory: {
      value: { length:1, idx:null }
    }
  },
  defaults )

  Object.defineProperty( ugen, 'value', {
    get() { return gen.memory.heap[ this.memory.value.idx ] },
    set(v) { gen.memory.heap[ this.memory.value.idx ] = v }
  })

  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":29}],3:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'acos',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    gen.variableNames.add( [this.name,'f'] )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'acos': Math.acos })

      out = [ this.name, `  ${this.name} = acos( ${inputs[0]} );\n` ] 

    } else {
      out = Math.acos( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let acos = Object.create( proto )

  acos.inputs = [ x ]
  acos.id = gen.getUID()
  acos.name = `${acos.basename}{acos.id}`

  return acos
}

},{"./gen.js":29}],4:[function(require,module,exports){
'use strict'

let gen      = require( './gen.js' ),
    mul      = require( './mul.js' ),
    sub      = require( './sub.js' ),
    div      = require( './div.js' ),
    data     = require( './data.js' ),
    peek     = require( './peek.js' ),
    accum    = require( './accum.js' ),
    ifelse   = require( './ifelseif.js' ),
    lt       = require( './lt.js' ),
    bang     = require( './bang.js' ),
    env      = require( './env.js' ),
    add      = require( './add.js' ),
    poke     = require( './poke.js' ),
    neq      = require( './neq.js' ),
    and      = require( './and.js' ),
    gte      = require( './gte.js' ),
    memo     = require( './memo.js' )

module.exports = ( attackTime = 44100, decayTime = 44100, _props ) => {
  let _bang = bang(),
      phase = accum( 1, _bang, { max: Infinity, shouldWrap:false, initialValue:-Infinity }),
      props = Object.assign({}, { shape:'exponential', alpha:5 }, _props ),
      bufferData, decayData, out, buffer

    //console.log( 'attack time:', attackTime, 'decay time:', decayTime )
  let completeFlag = data( [0] )
  
  // slightly more efficient to use existing phase accumulator for linear envelopes
  if( props.shape === 'linear' ) {
    out = ifelse( 
      and( gte( phase, 0), lt( phase, attackTime )),
      memo( div( phase, attackTime ) ),

      and( gte( phase, 0),  lt( phase, add( attackTime, decayTime ) ) ),
      sub( 1, div( sub( phase, attackTime ), decayTime ) ),
      
      neq( phase, -Infinity),
      poke( completeFlag, 1, 0, { inline:0 }),

      0 
    )
  } else {     
    bufferData = env( 1024, { type:props.shape, alpha:props.alpha })
    out = ifelse( 
      and( gte( phase, 0), lt( phase, attackTime )), 
      peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ), 

      and( gte(phase,0), lt( phase, add( attackTime, decayTime ) ) ), 
      peek( bufferData, sub( 1, div( sub( phase, attackTime ), decayTime ) ), { boundmode:'clamp' }),

      neq( phase, -Infinity),
      poke( completeFlag, 1, 0, { inline:0 }),

      0
    )
  }

  out.isComplete = ()=> gen.memory.heap[ completeFlag.memory.values.idx ]

  out.trigger = ()=> {
    gen.memory.heap[ completeFlag.memory.values.idx ] = 0
    _bang.trigger()
  }

  return out 
}

},{"./accum.js":2,"./add.js":5,"./and.js":7,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":29,"./gte.js":31,"./ifelseif.js":34,"./lt.js":37,"./memo.js":41,"./mul.js":47,"./neq.js":48,"./peek.js":53,"./poke.js":55,"./sub.js":64}],5:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

module.exports = ( ...args ) => {
  let add = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out=`  ${this.name} = fround(`,
          sum = 0, numCount = 0, adderAtEnd = false, alreadyFullSummed = true

      gen.variableNames.add( [this.name,'f'] )

      inputs.forEach( (v,i) => {
        if( isNaN( v ) ) {
          out += v
          if( i < inputs.length -1 ) {
            adderAtEnd = true
            out += ' + '
          }
          alreadyFullSummed = false
        }else{
          sum += parseFloat( v )
          numCount++
        }
      })
      
      //if( alreadyFullSummed ) out = ''

      if( numCount > 0 ) {
        out += adderAtEnd || alreadyFullSummed ? `fround(${sum})` : ` + fround(${sum})`
      }
      
      //if( !alreadyFullSummed ) out += ')'

      out += ');\n'

      return [ this.name, out ]
    }
  }
  
  add.name = 'add'+add.id
  return add
}

},{"./gen.js":29}],6:[function(require,module,exports){
'use strict'

let gen      = require( './gen.js' ),
    mul      = require( './mul.js' ),
    sub      = require( './sub.js' ),
    div      = require( './div.js' ),
    data     = require( './data.js' ),
    peek     = require( './peek.js' ),
    accum    = require( './accum.js' ),
    ifelse   = require( './ifelseif.js' ),
    lt       = require( './lt.js' ),
    bang     = require( './bang.js' ),
    env      = require( './env.js' ),
    param    = require( './param.js' ),
    add      = require( './add.js' ),
    gtp      = require( './gtp.js' ),
    not      = require( './not.js' )

module.exports = ( attackTime=44, decayTime=22050, sustainTime=44100, sustainLevel=.6, releaseTime=44100, _props ) => {
  let envTrigger = bang(),
      phase = accum( 1, envTrigger, { max: Infinity, shouldWrap:false }),
      shouldSustain = param( 1 ),
      defaults = {
         shape: 'exponential',
         alpha: 5,
         triggerRelease: false,
      },
      props = Object.assign({}, defaults, _props ),
      bufferData, decayData, out, buffer, sustainCondition, releaseAccum, releaseCondition

  // slightly more efficient to use existing phase accumulator for linear envelopes
  //if( props.shape === 'linear' ) {
  //  out = ifelse( 
  //    lt( phase, props.attackTime ), memo( div( phase, props.attackTime ) ),
  //    lt( phase, props.attackTime + props.decayTime ), sub( 1, mul( div( sub( phase, props.attackTime ), props.decayTime ), 1-props.sustainLevel ) ),
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime ), 
  //      props.sustainLevel,
  //    lt( phase, props.attackTime + props.decayTime + props.sustainTime + props.releaseTime ), 
  //      sub( props.sustainLevel, mul( div( sub( phase, props.attackTime + props.decayTime + props.sustainTime ), props.releaseTime ), props.sustainLevel) ),
  //    0
  //  )
  //} else {     
    bufferData = env( 1024, { type:props.shape, alpha:props.alpha } )
    
    sustainCondition = props.triggerRelease 
      ? shouldSustain
      : lt( phase, add( attackTime, decayTime, sustainTime ) )

    releaseAccum = props.triggerRelease
      ? gtp( sub( sustainLevel, accum( div( sustainLevel, releaseTime ) , 0, { shouldWrap:false }) ), 0 )
      : sub( sustainLevel, mul( div( sub( phase, add( attackTime, decayTime, sustainTime ) ), releaseTime ), sustainLevel ) ), 

    releaseCondition = props.triggerRelease
      ? not( shouldSustain )
      : lt( phase, add( attackTime, decayTime, sustainTime, releaseTime ) )

    out = ifelse(
      // attack 
      lt( phase,  attackTime ), 
      peek( bufferData, div( phase, attackTime ), { boundmode:'clamp' } ), 

      // decay
      lt( phase, add( attackTime, decayTime ) ), 
      peek( bufferData, sub( 1, mul( div( sub( phase,  attackTime ),  decayTime ), sub( 1,  sustainLevel ) ) ), { boundmode:'clamp' }),

      // sustain
      sustainCondition,
      peek( bufferData,  sustainLevel ),

      // release
      releaseCondition, //lt( phase,  attackTime +  decayTime +  sustainTime +  releaseTime ),
      peek( 
        bufferData,
        releaseAccum, 
        //sub(  sustainLevel, mul( div( sub( phase,  attackTime +  decayTime +  sustainTime),  releaseTime ),  sustainLevel ) ), 
        { boundmode:'clamp' }
      ),

      0
    )
  //}
   
  out.trigger = ()=> {
    shouldSustain.value = 1
    envTrigger.trigger()
  }

  out.release = ()=> {
    shouldSustain.value = 0
    // XXX pretty nasty... grabs accum inside of gtp and resets value manually
    // unfortunately envTrigger won't work as it's back to 0 by the time the release block is triggered...
    gen.memory.heap[ releaseAccum.inputs[0].inputs[1].memory.value.idx ] = 0
  }

  return out 
}

},{"./accum.js":2,"./add.js":5,"./bang.js":11,"./data.js":18,"./div.js":23,"./env.js":24,"./gen.js":29,"./gtp.js":32,"./ifelseif.js":34,"./lt.js":37,"./mul.js":47,"./not.js":50,"./param.js":52,"./peek.js":53,"./sub.js":64}],7:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'and',

  gen() {
    let inputs = gen.getInputs( this ), out

    gen.variableNames.add( [this.name, 'f'] )

    out = `  ${this.name} = ((${inputs[0]} != fround(0)) + (${inputs[1]} != fround(0) ) == fround(2) );\n\n`

    return [ this.name, out ]
  },

}

module.exports = ( in1, in2 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":29}],8:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'asin',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    gen.variableNames.add( [this.name, 'f'] )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'asin': Math.asin })

      out = [ this.name, `  ${this.name} = fround( asin( ${inputs[0]} ) );\n` ]

    } else {
      out = Math.asin( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let asin = Object.create( proto )

  asin.inputs = [ x ]
  asin.id = gen.getUID()
  asin.name = `${asin.basename}${asin.id}`

  return asin
}

},{"./gen.js":29}],9:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'atan',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    gen.variableNames.add( [this.name, 'f'] )
    
    if( isNaN( inputs[0] ) ) {

      out = [ this.name, `  ${this.name} = fround( atan( ${inputs[0]} ) );\n` ] 

    } else {
      out = Math.atan( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let atan = Object.create( proto )

  atan.inputs = [ x ]
  atan.id = gen.getUID()
  atan.name = `${atan.basename}${atan.id}`

  return atan
}

},{"./gen.js":29}],10:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    mul     = require( './mul.js' ),
    sub     = require( './sub.js' )

module.exports = ( decayTime = 44100 ) => {
  let ssd = history ( 1 ),
      t60 = Math.exp( -6.907755278921 / decayTime )

  ssd.in( mul( ssd.out, t60 ) )

  ssd.out.trigger = ()=> {
    ssd.value = 1
  }

  return sub( 1, ssd.out )
}

},{"./gen.js":29,"./history.js":33,"./mul.js":47,"./sub.js":64}],11:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  gen() {
    gen.requestMemory( this.memory )
    
    gen.variableNames.add( [ this.name, 'i'] )

    let out = 
`  ${this.name} = memory[${this.memory.value.idx}];
  if( ${this.name} == fround(1) ) memory[${this.memory.value.idx}] = fround(0);

`
    return [ this.name, out ]
  } 
}

module.exports = ( _props ) => {
  let ugen = Object.create( proto ),
      props = Object.assign({}, { min:0, max:1 }, _props )

  ugen.name = 'bang' + gen.getUID()

  ugen.min = props.min
  ugen.max = props.max

  ugen.trigger = () => {
    gen.memory.heap[ ugen.memory.value.idx ] = ugen.max 
  }

  ugen.memory = {
    value: { length:1, idx:null }
  }

  return ugen
}

},{"./gen.js":29}],12:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'bool',

  gen() {
    let inputs = gen.getInputs( this ), out

    gen.variableNames.add( [this.name, 'i'] )

    out = 
`  if( ${inputs[0]} == fround(0) ) {
    ${this.name} =  0;
  }else{
    ${this.name} = 1;
  }
`
    
    //gen.memo[ this.name ] = `gen.data.${this.name}`

    //return [ `gen.data.${this.name}`, ' ' +out ]
    return [ this.name, out ]
  }
}

module.exports = ( in1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    uid:        gen.getUID(),
    inputs:     [ in1 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}


},{"./gen.js":29}],13:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'ceil',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    gen.variableNames.add( [ this.name, 'f' ] )

    if( isNaN( inputs[0] ) ) {

      out = [ this.name, `  ${this.name} = ceil( ${inputs[0]} );\n`]

    } else {
      out = Math.ceil( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let ceil = Object.create( proto )

  ceil.inputs = [ x ]
  ceil.id = gen.getUID()
  ceil.name = ceil.basename + ceil.id 

  return ceil
}

},{"./gen.js":29}],14:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js'),
    floor= require('./floor.js'),
    sub  = require('./sub.js'),
    memo = require('./memo.js')

let proto = {
  basename:'clip',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        out
    
    gen.variableNames.add( [ this.name, 'f' ] )

    out = `  ${this.name} = fround( max( min(+${inputs[0]},+${inputs[2]} ), +${inputs[1]} ) );\n` 

    return [ this.name, out ]
  },
}

module.exports = ( in1, min=-1, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    min, 
    max,
    uid:    gen.getUID(),
    inputs: [ in1, min, max ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./floor.js":26,"./gen.js":29,"./memo.js":41,"./sub.js":64}],15:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'cos',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    gen.variableNames.add( [this.name, 'f'] )
    
    if( isNaN( inputs[0] ) ) {

      out = [ this.name, `  ${this.name} = cos( ${inputs[0]} );\n` ]

    } else {
      out = Math.cos( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let cos = Object.create( proto )

  cos.inputs = [ x ]
  cos.id = gen.getUID()
  cos.name = `${cos.basename}${cos.id}`

  return cos
}

},{"./gen.js":29}],16:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'counter',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        functionBody
       
    gen.variableNames.add( [ this.name + '_value', 'f' ] )

    if( this.memory.value.idx === null ) gen.requestMemory( this.memory )

    functionBody  = this.callback( 
      inputs[0], 
      inputs[1], 
      inputs[2], 
      inputs[3], 
      inputs[4],  
      `memory[${this.memory.value.idx}]`,
      `memory[${this.memory.wrap.idx}]`
    )

    gen.memo[ this.name ] = functionBody

    if( gen.memo[ this.wrap.name ] === undefined ) this.wrap.gen()

    return [ this.name +'_value', functionBody ]
  },

  callback( _incr, _min, _max, _reset, loops, valueRef, wrapRef ) {
    let diff = this.max - this.min,
        out  = '',
        wrap = ''
    
    // must check for reset before storing value for output
    if( !(typeof this.inputs[3] === 'number' && this.inputs[3] < 1) ) { 
      out += `  if( fround(${_reset}) >= fround(1) ) fround(${valueRef}) = fround(${_min})\n`
    }

    // store output value before accumulating  
    out += `  ${this.name}_value = fround(${valueRef});\n  ${valueRef} = fround(${valueRef}) + fround(${_incr});\n`
    
    if( typeof this.max === 'number' && this.max !== Infinity && typeof this.min !== 'number' ) {

      wrap = 
`  if( (fround(${valueRef}) >= fround(${this.max}) + ${loops}|0  ) == 2|0 ) {
    ${valueRef} -= fround(${diff})
    ${wrapRef} = fround(1)
  }else{
    ${wrapRef} = fround(0)
  }\n`

    }else if( this.max !== Infinity && this.min !== Infinity ) {

      wrap = 
`  if( (( fround(${valueRef}) >= fround(${_max})) + ${loops}|0  ) == 2|0 ) {
    ${valueRef} = fround( ${valueRef} ) - fround( fround(${_max}) - fround(${_min}) );
    ${wrapRef} = fround(1)
   } else if( (( fround(${valueRef} ) < fround(${_min})) + ${loops}|0  ) == 2|0  )  {
    ${valueRef} = fround( ${valueRef} ) + fround( fround(${_max}) - fround(${_min}) )
    ${wrapRef} = fround(1)
  }else{
    ${wrapRef} = fround(0)
  }\n`

    }else{
      out += '\n'
    }

    out = out + wrap

    return out
  }
}

module.exports = ( incr=1, min=0, max=Infinity, reset=0, loops=1,  properties ) => {
  let ugen = Object.create( proto ),
      defaults = { initialValue: 0 }

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    min:    min, 
    max:    max,
    value:  defaults.initialValue,
    uid:    gen.getUID(),
    inputs: [ incr, min, max, reset, loops ],
    memory: {
      value: { length:1, idx: null },
      wrap:  { length:1, idx: null } 
    },
    wrap : {
      gen() { 
        if( ugen.memory.wrap.idx === null ) {
          gen.requestMemory( ugen.memory )
        }
        gen.getInputs( this )
        gen.memo[ this.name ] = `memory[ ${ugen.memory.wrap.idx} ]`
        return `memory[ ${ugen.memory.wrap.idx} ]` 
      }
    }
  },
  defaults )
 
  Object.defineProperty( ugen, 'value', {
    get() {
      if( this.memory.value.idx !== null ) {
        return gen.memory.heap[ this.memory.value.idx ]
      }
    },
    set( v ) {
      if( this.memory.value.idx !== null ) {
        gen.memory.heap[ this.memory.value.idx ] = v 
      }
    }
  })
  
  ugen.wrap.inputs = [ ugen ]
  ugen.name = `${ugen.basename}${ugen.uid}`
  ugen.wrap.name = ugen.name + '_wrap'
  return ugen
} 

},{"./gen.js":29}],17:[function(require,module,exports){
'use strict'

let gen  = require( './gen.js' ),
    accum= require( './phasor.js' ),
    data = require( './data.js' ),
    peek = require( './peek.js' ),
    mul  = require( './mul.js' ),
    phasor=require( './phasor.js')

let proto = {
  basename:'cycle',

  initTable() {    
    let buffer = new Float32Array( 1024 )

    for( let i = 0, l = buffer.length; i < l; i++ ) {
      buffer[ i ] = Math.sin( ( i / l ) * ( Math.PI * 2 ) )
    }

    gen.globals.cycle = data( buffer, 1, { immutable:true } )
  }

}

module.exports = ( frequency=1, reset=0, _props ) => {
  if( typeof gen.globals.cycle === 'undefined' ) proto.initTable() 
  const props = Object.assign({}, { min:0 }, _props )

  const ugen = peek( gen.globals.cycle, phasor( frequency, reset, props ))
  ugen.name = 'cycle' + gen.getUID()

  return ugen
}

},{"./data.js":18,"./gen.js":29,"./mul.js":47,"./peek.js":53,"./phasor.js":54}],18:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js'),
  utilities = require( './utilities.js' ),
  peek = require('./peek.js'),
  poke = require('./poke.js')

let proto = {
  basename:'data',
  globals: {},

  gen() {
    let idx
    if( gen.memo[ this.name ] === undefined ) {
      let ugen = this
      gen.requestMemory( this.memory, this.immutable ) 
      idx = this.memory.values.idx
      try {
        gen.memory.heap.set( this.buffer, idx )
      }catch( e ) {
        console.log( e )
        throw Error( 'error with request. asking for ' + this.buffer.length +'. current index: ' + gen.memoryIndex + ' of ' + gen.memory.heap.length )
      }
      //gen.data[ this.name ] = this
      //return 'gen.memory' + this.name + '.buffer'
      gen.memo[ this.name ] = idx
    }else{
      idx = gen.memo[ this.name ]
    }
    idx *= 4
    return idx
  },
}

module.exports = ( x, y=1, properties ) => {
  let ugen, buffer, shouldLoad = false
  
  if( properties !== undefined && properties.global !== undefined ) {
    if( gen.globals[ properties.global ] ) {
      return gen.globals[ properties.global ]
    }
  }

  if( typeof x === 'number' ) {
    if( y !== 1 ) {
      buffer = []
      for( let i = 0; i < y; i++ ) {
        buffer[ i ] = new Float32Array( x )
      }
    }else{
      buffer = new Float32Array( x )
    }
  }else if( Array.isArray( x ) ) { //! (x instanceof Float32Array ) ) {
    let size = x.length
    buffer = new Float32Array( size )
    for( let i = 0; i < x.length; i++ ) {
      buffer[ i ] = x[ i ]
    }
  }else if( typeof x === 'string' ) {
    buffer = { length: y > 1 ? y : gen.samplerate * 60 } // XXX what???
    shouldLoad = true
  }else if( x instanceof Float32Array ) {
    buffer = x
  }
  
  ugen = { 
    buffer,
    name: proto.basename + gen.getUID(),
    dim:  buffer.length, // XXX how do we dynamically allocate this?
    channels : 1,
    gen:  proto.gen,
    onload: null,
    then( fnc ) {
      ugen.onload = fnc
      return ugen
    },
    immutable: properties !== undefined && properties.immutable === true ? true : false,
    load( filename ) {
      let promise = utilities.loadSample( filename, ugen )
      promise.then( ( _buffer )=> { 
        ugen.memory.values.length = ugen.dim = _buffer.length     
        ugen.onload() 
      })
    },
  }

  ugen.memory = {
    values: { length:ugen.dim, idx:null }
  }

  gen.name = 'data' + gen.getUID()

  if( shouldLoad ) ugen.load( x )
  
  if( properties !== undefined ) {
    if( properties.global !== undefined ) {
      gen.globals[ properties.global ] = ugen
    }
    if( properties.meta === true ) {
      for( let i = 0, length = ugen.buffer.length; i < length; i++ ) {
        Object.defineProperty( ugen, i, {
          get () {
            return peek( ugen, i, { mode:'simple', interp:'none' } )
          },
          set( v ) {
            return poke( ugen, v, i )
          }
        })
      }
    }
  }

  return ugen
}

},{"./gen.js":29,"./peek.js":53,"./poke.js":55,"./utilities.js":70}],19:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' )

module.exports = ( in1 ) => {
  let x1 = history(),
      y1 = history(),
      filter

  //History x1, y1; y = in1 - x1 + y1*0.9997; x1 = in1; y1 = y; out1 = y;
  filter = memo( add( sub( in1, x1.out ), mul( y1.out, .9997 ) ) )
  x1.in( in1 )
  y1.in( filter )

  return filter
}

},{"./add.js":5,"./gen.js":29,"./history.js":33,"./memo.js":41,"./mul.js":47,"./sub.js":64}],20:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    mul     = require( './mul.js' ),
    t60     = require( './t60.js' )

module.exports = ( decayTime = 44100, props ) => {
  let properties = Object.assign({}, { initValue:1 }, props ),
      ssd = history ( properties.initValue )

  ssd.in( mul( ssd.out, t60( decayTime ) ) )

  ssd.out.trigger = ()=> {
    ssd.value = 1
  }

  return ssd.out 
}

},{"./gen.js":29,"./history.js":33,"./mul.js":47,"./t60.js":66}],21:[function(require,module,exports){
'use strict'

let gen  = require( './gen.js'  ),
    data = require( './data.js' ),
    poke = require( './poke.js' ),
    peek = require( './peek.js' ),
    sub  = require( './sub.js'  ),
    wrap = require( './wrap.js' ),
    accum= require( './accum.js')

let proto = {
  basename:'delay',

  gen() {
    let inputs = gen.getInputs( this )
    
    gen.memo[ this.name ] = inputs[0]
    
    return inputs[0]
  },
}

module.exports = ( in1, time=256, ...tapsAndProperties ) => {
  let ugen = Object.create( proto ),
      defaults = { size: 512, feedback:0, interp:'linear' },
      writeIdx, readIdx, delaydata, properties, tapTimes = [ time ], taps
  
  if( Array.isArray( tapsAndProperties ) ) {
    properties = tapsAndProperties[ tapsAndProperties.length - 1 ]
    if( tapsAndProperties.length > 1 ) {
      for( let i = 0; i < tapsAndProperties.length - 1; i++ ){
        tapTimes.push( tapsAndProperties[ i ] )
      }
    }
  }else{
    properties = tapsAndProperties
  }

  if( properties !== undefined ) Object.assign( defaults, properties )

  if( defaults.size < time ) defaults.size = time

  delaydata = data( defaults.size )
  
  ugen.inputs = []

  writeIdx = accum( 1, 0, { max:defaults.size }) 
  
  for( let i = 0; i < tapTimes.length; i++ ) {
    ugen.inputs[ i ] = peek( delaydata, wrap( sub( writeIdx, tapTimes[i] ), 0, defaults.size ),{ mode:'samples', interp:defaults.interp })
  }
  
  ugen.outputs = ugen.inputs // ugn, Ugh, UGH! but i guess it works.

  poke( delaydata, in1, writeIdx )

  ugen.name = `${ugen.basename}${gen.getUID()}`

  return ugen
}

},{"./accum.js":2,"./data.js":18,"./gen.js":29,"./peek.js":53,"./poke.js":55,"./sub.js":64,"./wrap.js":72}],22:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' )

module.exports = ( in1 ) => {
  let n1 = history()
    
  n1.in( in1 )

  let ugen = sub( in1, n1.out )
  ugen.name = 'delta'+gen.getUID()

  return ugen
}

},{"./gen.js":29,"./history.js":33,"./sub.js":64}],23:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

module.exports = (...args) => {
  let div = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out='(',
          diff = 0, 
          numCount = 0,
          lastNumber = inputs[ 0 ],
          lastNumberIsUgen = isNaN( lastNumber ), 
          divAtEnd = false

      inputs.forEach( (v,i) => {
        if( i === 0 ) return

        let isNumberUgen = isNaN( v ),
            isFinalIdx   = i === inputs.length - 1

        if( !lastNumberIsUgen && !isNumberUgen ) {
          lastNumber = lastNumber / v
          out += lastNumber
        }else{
          out += `${lastNumber} / ${v}`
        }

        if( !isFinalIdx ) out += ' / ' 
      })

      out += ')'

      return out
    }
  }
  
  return div
}

},{"./gen.js":29}],24:[function(require,module,exports){
'use strict'

let gen     = require( './gen' ),
    windows = require( './windows' ),
    data    = require( './data' ),
    peek    = require( './peek' ),
    phasor  = require( './phasor' )

module.exports = ( type='triangular', length=1024, alpha=.15, shift=0 ) => {
  let buffer = new Float32Array( length )

  let name = type + '_' + length + '_' + shift
  if( typeof gen.globals.windows[ name ] === 'undefined' ) { 

    for( let i = 0; i < length; i++ ) {
      buffer[ i ] = windows[ type ]( length, i, alpha, shift )
    }

    gen.globals.windows[ name ] = data( buffer )
  }

  let ugen = gen.globals.windows[ name ] 
  ugen.name = 'env' + gen.getUID()

  return ugen
}

},{"./data":18,"./gen":29,"./peek":53,"./phasor":54,"./windows":71}],25:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'eq',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = this.inputs[0] === this.inputs[1] ? 1 : `  var ${this.name} = (${inputs[0]} === ${inputs[1]}) | 0\n\n`

    gen.memo[ this.name ] = `${this.name}`

    return [ `${this.name}`, out ]
  },

}

module.exports = ( in1, in2 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":29}],26:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'floor',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      //gen.closures.add({ [ this.name ]: Math.floor })

      out = `( ${inputs[0]} | 0 )`

    } else {
      out = inputs[0] | 0
    }
    
    return out
  }
}

module.exports = x => {
  let floor = Object.create( proto )

  floor.inputs = [ x ]

  return floor
}

},{"./gen.js":29}],27:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'fold',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        out

    out = this.createCallback( inputs[0], this.min, this.max ) 

    gen.memo[ this.name ] = this.name + '_value'

    return [ this.name + '_value', out ]
  },

  createCallback( v, lo, hi ) {
    let out =
` var ${this.name}_value = ${v},
      ${this.name}_range = ${hi} - ${lo},
      ${this.name}_numWraps = 0

  if(${this.name}_value >= ${hi}){
    ${this.name}_value -= ${this.name}_range
    if(${this.name}_value >= ${hi}){
      ${this.name}_numWraps = ((${this.name}_value - ${lo}) / ${this.name}_range) | 0
      ${this.name}_value -= ${this.name}_range * ${this.name}_numWraps
    }
    ${this.name}_numWraps++
  } else if(${this.name}_value < ${lo}){
    ${this.name}_value += ${this.name}_range
    if(${this.name}_value < ${lo}){
      ${this.name}_numWraps = ((${this.name}_value - ${lo}) / ${this.name}_range- 1) | 0
      ${this.name}_value -= ${this.name}_range * ${this.name}_numWraps
    }
    ${this.name}_numWraps--
  }
  if(${this.name}_numWraps & 1) ${this.name}_value = ${hi} + ${lo} - ${this.name}_value
`
    return ' ' + out
  }
}

module.exports = ( in1, min=0, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    min, 
    max,
    uid:    gen.getUID(),
    inputs: [ in1 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":29}],28:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'gate',
  controlString:null, // insert into output codegen for determining indexing
  gen() {
    let inputs = gen.getInputs( this ), out
    
    gen.requestMemory( this.memory )
    
    let lastInputMemoryIdx = 'memory[ ' + this.memory.lastInput.idx + ' ]',
        outputMemoryStartIdx = this.memory.lastInput.idx + 1,
        inputSignal = inputs[0],
        controlSignal = inputs[1]
    
    /* 
     * we check to see if the current control inputs equals our last input
     * if so, we store the signal input in the memory associated with the currently
     * selected index. If not, we put 0 in the memory associated with the last selected index,
     * change the selected index, and then store the signal in put in the memery assoicated
     * with the newly selected index
     */
    
    out =

` if( ${controlSignal} !== ${lastInputMemoryIdx} ) {
    memory[ ${lastInputMemoryIdx} + ${outputMemoryStartIdx}  ] = 0 
    ${lastInputMemoryIdx} = ${controlSignal}
  }
  memory[ ${outputMemoryStartIdx} + ${controlSignal} ] = ${inputSignal}

`
    this.controlString = inputs[1]
    this.initialized = true

    gen.memo[ this.name ] = this.name

    this.outputs.forEach( v => v.gen() )

    return [ null, ' ' + out ]
  },

  childgen() {
    if( this.parent.initialized === false ) {
      gen.getInputs( this ) // parent gate is only input of a gate output, should only be gen'd once.
    }

    if( gen.memo[ this.name ] === undefined ) {
      gen.requestMemory( this.memory )

      gen.memo[ this.name ] = `memory[ ${this.memory.value.idx} ]`
    }
    
    return  `memory[ ${this.memory.value.idx} ]`
  }
}

module.exports = ( control, in1, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { count: 2 }

  if( typeof properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, {
    outputs: [],
    uid:     gen.getUID(),
    inputs:  [ in1, control ],
    memory: {
      lastInput: { length:1, idx:null }
    },
    initialized:false
  },
  defaults )
  
  ugen.name = `${ugen.basename}${gen.getUID()}`

  for( let i = 0; i < ugen.count; i++ ) {
    ugen.outputs.push({
      index:i,
      gen: proto.childgen,
      parent:ugen,
      inputs: [ ugen ],
      memory: {
        value: { length:1, idx:null }
      },
      initialized:false,
      name: `${ugen.name}_out${gen.getUID()}`
    })
  }

  return ugen
}

},{"./gen.js":29}],29:[function(require,module,exports){
(function (global){
'use strict'

/* gen.js
 *
 * low-level code generation for unit generators
 *
 */

let MemoryHelper = require( 'memory-helper' )

let buf = new ArrayBuffer( 0x10000 )

let gen = {

  accum:0,
  getUID() { return this.accum++ },
  debug:false,
  samplerate: 44100, // change on audiocontext creation
  shouldLocalize: false,
  globals:{
    windows: {},
  },
  arrayBuffer:null,
  
  /* closures
   *
   * Functions that are included as arguments to master callback. Examples: Math.abs, Math.random etc.
   * XXX Should probably be renamed callbackProperties or something similar... closures are no longer used.
   */

  closures: new Set(),
  params:   new Set(),
  variableNames: new Set(),

  parameters:[],
  endBlock: new Set(),
  histories: new Map(),

  memo: {},

  data: {},

  arrayBuffer: buf,
  memory: MemoryHelper.create( buf ),
  
  /* export
   *
   * place gen functions into another object for easier reference
   */

  export( obj ) {},

  addToEndBlock( v ) {
    this.endBlock.add( '  ' + v )
  },
  
  requestMemory( memorySpec, immutable=false ) {
    for( let key in memorySpec ) {
      let request = memorySpec[ key ]

      request.idx = gen.memory.alloc( request.length, immutable )
    }
  },

  /* createCallback
   *
   * param ugen - Head of graph to be codegen'd
   *
   * Generate callback function for a particular ugen graph.
   * The gen.closures property stores functions that need to be
   * passed as arguments to the final function; these are prefixed
   * before any defined params the graph exposes. For example, given:
   *
   * gen.createCallback( abs( param() ) )
   *
   * ... the generated function will have a signature of ( abs, p0 ).
   */
  
  createCallback( ugen, mem, debug = false, shouldInlineMemory=false ) {
    let isStereo = Array.isArray( ugen ) && ugen.length > 1,
        callback, 
        channel1, channel2

    if( typeof mem === 'number' || mem === undefined ) {
      //this.arrayBuffer = new ArrayBuffer( 0x10000 )  
      //mem = MemoryHelper.create( mem )
      // create stereo output that cannot be overwritten
      //mem.alloc( 2, true )
    }
    
    //console.log( 'cb memory:', mem )
    //this.memory = mem
    this.memory.alloc( 2, true )
    this.memo = {} 
    this.endBlock.clear()
    this.closures.clear()
    this.variableNames.clear()
    this.params.clear()
    //this.globals = { windows:{} }
    
    this.parameters.length = 0
    
    this.functionBody = '\n';
    //this.functionBody = "  'use asm'\n"
    //if( shouldInlineMemory===false ) this.functionBody += "  var memory = gen.memory\n\n" 

    // call .gen() on the head of the graph we are generating the callback for
    //console.log( 'HEAD', ugen )
    for( let i = 0; i < 1 + isStereo; i++ ) {
      if( typeof ugen[i] === 'number' ) continue

      let channel = isStereo ? ugen[i].gen() : ugen.gen(),
          body = ''


      // if .gen() returns array, add ugen callback (graphOutput[1]) to our output functions body
      // and then return name of ugen. If .gen() only generates a number (for really simple graphs)
      // just return that number (graphOutput[0]).
      body += Array.isArray( channel ) ? channel[1] + '\n' + channel[0] : channel

      // split body to inject return keyword on last line
      body = body.split('\n')

      //if( debug ) console.log( 'functionBody length', body )
      
      // next line is to accommodate memo as graph head
      if( body[ body.length -1 ].trim().indexOf('let') > -1 ) { body.push( '\n' ) } 

      // get index of last line
      let lastidx = body.length - 1

      // insert return keyword
      //body[ lastidx ] = '  gen.out[' + i + ']  = ' + body[ lastidx ] + '\n'
      body[ lastidx ] = '  memory[ ' + i + ' >> 2 ]  = fround(' + body[ lastidx ] + ');\n\n'

      this.functionBody += body.join('\n')

    }

    for( let variable of this.variableNames.values() ) {
      const variableType = variable[1], name = variable[0]

      switch( variableType ) {
        case 'f':
          this.functionBody = `  var ${name} = fround(0);\n` + this.functionBody
          break;
        case 'i':
          this.functionBody = `  var ${name} = 0;\n` + this.functionBody
          break;
        case 'd':
          this.functionBody = `  var ${name} = 0.0;\n` + this.functionBody
          break;
      }
    } 

    this.histories.forEach( value => {
      if( value !== null )
        value.gen()      
    })

/*
 *    let returnStatement = isStereo ? '  return gen.out' : '  return gen.out[0]'
 *    
 *    this.functionBody = this.functionBody.split('\n')
 *
 *    if( this.endBlock.size ) { 
 *      this.functionBody = this.functionBody.concat( Array.from( this.endBlock ) )
 *      this.functionBody.push( returnStatement )
 *    }else{
 *      this.functionBody.push( returnStatement )
 *    }
 *    // reassemble function body
 *    this.functionBody = this.functionBody.join('\n')
 */

    // we can only dynamically create a named function by dynamically creating another function
    // to construct the named function! sheesh...
    //
    if( shouldInlineMemory === true ) {
      this.parameters.push( 'memory' )
    }
    //let buildString = `return function gen( ${ this.parameters.join(',') } ){ \n${ this.functionBody }\n}`
    //let buildString = `return function gen( stdlib, foreign, buffer ){ \n${ this.functionBody }\n}`

    let buildString = 
`return function ugen( stdlib, foreign, buffer ) {
  'use asm'
  var sin = stdlib.Math.sin
  var cos = stdlib.Math.cos
  var tan = stdlib.Math.tan
  var min = stdlib.Math.min
  var max = stdlib.Math.max
  var pow = stdlib.Math.pow
  var log = stdlib.Math.log
  var atan = stdlib.Math.atan
  var asin = stdlib.Math.asin
  var acos = stdlib.Math.acos
  var abs = stdlib.Math.abs
  var ceil = stdlib.Math.ceil
  var floor = stdlib.Math.floor
  var fround = stdlib.Math.fround
  var memory = new stdlib.Float32Array( buffer )

  function render( in1 ) {
    in1 = fround(in1);
${ this.functionBody }
}
  
  return { callback:render }
}`

    if( this.debug || debug ) console.log( buildString ) 

    this.callback = new Function( buildString )

    // make sure to accomodate running under node.js
    const stdlib = typeof window === 'undefined' ? global : window

    this.renderCallback = this.callback()( stdlib, null, this.arrayBuffer )
    
    // assign properties to named function
    for( let dict of this.closures.values() ) {
      let name = Object.keys( dict )[0],
          value = dict[ name ]

      this.callback[ name ] = value
    }

    for( let dict of this.params.values() ) {
      let name = Object.keys( dict )[0],
          ugen = dict[ name ]
      
      Object.defineProperty( this.callback, name, {
        configurable: true,
        get() { return ugen.value },
        set(v){ ugen.value = v }
      })
      //callback[ name ] = value
    }

    this.callback.data = this.data
    this.out  = {}//new Float32Array( 2 )
  
    Object.defineProperty( this.out, '0', {
      get() {
        return gen.memory.heap[0]
      },
      set(v) {}
    })

    Object.defineProperty( this.out, '1', {
      get() {
        return gen.memory.heap[0]
      },
      set(v) {}
    })

    this.callback.parameters = this.parameters.slice( 0 )

    //if( MemoryHelper.isPrototypeOf( this.memory ) ) 
    this.callback.memory = this.memory.heap

    this.histories.clear()

    return this.renderCallback.callback
  },
  
  /* getInputs
   *
   * Given an argument ugen, extract its inputs. If they are numbers, return the numebrs. If
   * they are ugens, call .gen() on the ugen, memoize the result and return the result. If the
   * ugen has previously been memoized return the memoized value.
   *
   */
  getInputs( ugen ) {
    return ugen.inputs.map( gen.getInput ) 
  },

  getInput( input ) {
    let isObject = typeof input === 'object',
        processedInput

    if( isObject ) { // if input is a ugen... 
      if( gen.memo[ input.name ] ) { // if it has been memoized...
        processedInput = gen.memo[ input.name ]
      }else if( Array.isArray( input ) ) {
        gen.getInput( input[0] )
        gen.getInput( input[1] )
      }else{ // if not memoized generate code  
        if( typeof input.gen !== 'function' ) {
          console.log( 'no gen found:', input, input.gen )
        }
        let code = input.gen()
        //if( code.indexOf( 'Object' ) > -1 ) console.log( 'bad input:', input, code )
        
        if( Array.isArray( code ) ) {
          if( !gen.shouldLocalize ) {
            gen.functionBody += code[1]
          }else{
            gen.codeName = code[0]
            gen.localizedCode.push( code[1] )
          }
          //console.log( 'after GEN' , this.functionBody )
          gen.memo[ code[0] ] = code[1]
          processedInput = code[0]
        }else{
          processedInput = code
        }
      }
    }else{ // it input is a number
      processedInput = input
    }

    return processedInput
  },

  startLocalize() {
    this.localizedCode = []
    this.shouldLocalize = true
  },
  endLocalize() {
    this.shouldLocalize = false

    return [ this.codeName, this.localizedCode.slice(0) ]
  },

  free( graph ) {
    if( Array.isArray( graph ) ) { // stereo ugen
      for( let channel of graph ) {
        this.free( channel )
      }
    } else {
      if( typeof graph === 'object' ) {
        if( graph.memory !== undefined ) {
          for( let memoryKey in graph.memory ) {
            this.memory.free( graph.memory[ memoryKey ].idx )
          }
        }
        if( Array.isArray( graph.inputs ) ) {
          for( let ugen of graph.inputs ) {
            this.free( ugen )
          }
        }
      }
    }
  }
}

module.exports = gen

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"memory-helper":73}],30:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'gt',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    out = `  var ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `(( ${inputs[0]} > ${inputs[1]}) | 0 )`
    } else {
      out += inputs[0] > inputs[1] ? 1 : 0 
    }
    out += '\n\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
  }
}

module.exports = (x,y) => {
  let gt = Object.create( proto )

  gt.inputs = [ x,y ]
  gt.name = 'gt'+gen.getUID()

  return gt
}

},{"./gen.js":29}],31:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  name:'gte',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    out = `  var ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `( ${inputs[0]} >= ${inputs[1]} | 0 )`
    } else {
      out += inputs[0] >= inputs[1] ? 1 : 0 
    }
    out += '\n\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
  }
}

module.exports = (x,y) => {
  let gt = Object.create( proto )

  gt.inputs = [ x,y ]
  gt.name = 'gte' + gen.getUID()

  return gt
}

},{"./gen.js":29}],32:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'gtp',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out = `(${inputs[ 0 ]} * ( ( ${inputs[0]} > ${inputs[1]} ) | 0 ) )` 
    } else {
      out = inputs[0] * ( ( inputs[0] > inputs[1] ) | 0 )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let gtp = Object.create( proto )

  gtp.inputs = [ x,y ]

  return gtp
}

},{"./gen.js":29}],33:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

module.exports = ( in1=0 ) => {
  let ugen = {
    inputs: [ in1 ],
    memory: { value: { length:1, idx: null } },
    recorder: null,

    in( v ) {
      if( gen.histories.has( v ) ){
        let memoHistory = gen.histories.get( v )
        ugen.name = memoHistory.name
        return memoHistory
      }

      let obj = {
        gen() {
          let inputs = gen.getInputs( ugen )

          if( ugen.memory.value.idx === null ) {
            gen.requestMemory( ugen.memory )
            gen.memory.heap[ ugen.memory.value.idx ] = in1
          }

          let idx = ugen.memory.value.idx
          
          gen.addToEndBlock( 'memory[ ' + idx + ' ] = ' + inputs[ 0 ] )
          
          // return ugen that is being recorded instead of ssd.
          // this effectively makes a call to ssd.record() transparent to the graph.
          // recording is triggered by prior call to gen.addToEndBlock.
          gen.histories.set( v, obj )

          return inputs[ 0 ]
        },
        name: ugen.name + '_in'+gen.getUID(),
        memory: ugen.memory
      }

      this.inputs[ 0 ] = v
      
      ugen.recorder = obj

      return obj
    },
    
    out: {
            
      gen() {
        if( ugen.memory.value.idx === null ) {
          if( gen.histories.get( ugen.inputs[0] ) === undefined ) {
            gen.histories.set( ugen.inputs[0], ugen.recorder )
          }
          gen.requestMemory( ugen.memory )
          gen.memory.heap[ ugen.memory.value.idx ] = parseFloat( in1 )
        }
        let idx = ugen.memory.value.idx
         
        return 'memory[ ' + idx + ' ] '
      },
    },

    uid: gen.getUID(),
  }
  
  ugen.out.memory = ugen.memory 

  ugen.name = 'history' + ugen.uid
  ugen.out.name = ugen.name + '_out'
  ugen.in._name  = ugen.name = '_in'

  Object.defineProperty( ugen, 'value', {
    get() {
      if( this.memory.value.idx !== null ) {
        return gen.memory.heap[ this.memory.value.idx ]
      }
    },
    set( v ) {
      if( this.memory.value.idx !== null ) {
        gen.memory.heap[ this.memory.value.idx ] = v 
      }
    }
  })

  return ugen
}

},{"./gen.js":29}],34:[function(require,module,exports){
/*

 a = conditional( condition, trueBlock, falseBlock )
 b = conditional([
   condition1, block1,
   condition2, block2,
   condition3, block3,
   defaultBlock
 ])

*/
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'ifelse',

  gen() {
    let conditionals = this.inputs[0],
        defaultValue = gen.getInput( conditionals[ conditionals.length - 1] ),
        out = `  var ${this.name}_out = ${defaultValue}\n` 

    //console.log( 'defaultValue:', defaultValue )

    for( let i = 0; i < conditionals.length - 2; i+= 2 ) {
      let isEndBlock = i === conditionals.length - 3,
          cond  = gen.getInput( conditionals[ i ] ),
          preblock = conditionals[ i+1 ],
          block, blockName, output

      //console.log( 'pb', preblock )

      if( typeof preblock === 'number' ){
        block = preblock
        blockName = null
      }else{
        if( gen.memo[ preblock.name ] === undefined ) {
          // used to place all code dependencies in appropriate blocks
          gen.startLocalize()

          gen.getInput( preblock )

          block = gen.endLocalize()
          blockName = block[0]
          block = block[ 1 ].join('')
          block = '  ' + block.replace( /\n/gi, '\n  ' )
        }else{
          block = ''
          blockName = gen.memo[ preblock.name ]
        }
      }

      output = blockName === null ? 
        `  ${this.name}_out = ${block}` :
        `${block}  ${this.name}_out = ${blockName}`
      
      if( i===0 ) out += ' '
      out += 
` if( ${cond} === 1 ) {
${output}
  }`

if( !isEndBlock ) {
  out += ` else`
}else{
  out += `\n`
}
/*         
 else`
      }else if( isEndBlock ) {
        out += `{\n  ${output}\n  }\n`
      }else {

        //if( i + 2 === conditionals.length || i === conditionals.length - 1 ) {
        //  out += `{\n  ${output}\n  }\n`
        //}else{
          out += 
` if( ${cond} === 1 ) {
${output}
  } else `
        //}
      }*/
    }

    gen.memo[ this.name ] = `${this.name}_out`

    return [ `${this.name}_out`, out ]
  }
}

module.exports = ( ...args  ) => {
  let ugen = Object.create( proto ),
      conditions = Array.isArray( args[0] ) ? args[0] : args

  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ conditions ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":29}],35:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  basename:'in',

  gen() {
    gen.parameters.push( this.name )
    
    gen.memo[ this.name ] = this.name

    return this.name
  } 
}

module.exports = ( name ) => {
  let input = Object.create( proto )

  input.id   = gen.getUID()
  input.name = name !== undefined ? name : `${input.basename}${input.id}`
  input[0] = {
    gen() {
      if( ! gen.parameters.includes( input.name ) ) gen.parameters.push( input.name )
      return input.name + '[0]'
    }
  }
  input[1] = {
    gen() {
      if( ! gen.parameters.includes( input.name ) ) gen.parameters.push( input.name )
      return input.name + '[1]'
    }
  }


  return input
}

},{"./gen.js":29}],36:[function(require,module,exports){
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
  
  abs:      require( './abs.js' ),
  round:    require( './round.js' ),
  param:    require( './param.js' ),
  add:      require( './add.js' ),
  sub:      require( './sub.js' ),
  mul:      require( './mul.js' ),
  div:      require( './div.js' ),
  accum:    require( './accum.js' ),
  counter:  require( './counter.js' ),
  sin:      require( './sin.js' ),
  cos:      require( './cos.js' ),
  tan:      require( './tan.js' ),
  tanh:     require( './tanh.js' ),
  asin:     require( './asin.js' ),
  acos:     require( './acos.js' ),
  atan:     require( './atan.js' ),  
  phasor:   require( './phasor.js' ),
  data:     require( './data.js' ),
  peek:     require( './peek.js' ),
  cycle:    require( './cycle.js' ),
  history:  require( './history.js' ),
  delta:    require( './delta.js' ),
  floor:    require( './floor.js' ),
  ceil:     require( './ceil.js' ),
  min:      require( './min.js' ),
  max:      require( './max.js' ),
  sign:     require( './sign.js' ),
  dcblock:  require( './dcblock.js' ),
  memo:     require( './memo.js' ),
  rate:     require( './rate.js' ),
  wrap:     require( './wrap.js' ),
  mix:      require( './mix.js' ),
  clamp:    require( './clamp.js' ),
  poke:     require( './poke.js' ),
  delay:    require( './delay.js' ),
  fold:     require( './fold.js' ),
  mod :     require( './mod.js' ),
  sah :     require( './sah.js' ),
  noise:    require( './noise.js' ),
  not:      require( './not.js' ),
  gt:       require( './gt.js' ),
  gte:      require( './gte.js' ),
  lt:       require( './lt.js' ), 
  lte:      require( './lte.js' ), 
  bool:     require( './bool.js' ),
  gate:     require( './gate.js' ),
  train:    require( './train.js' ),
  slide:    require( './slide.js' ),
  in:       require( './in.js' ),
  t60:      require( './t60.js'),
  mtof:     require( './mtof.js'),
  ltp:      require( './ltp.js'),        // TODO: test
  gtp:      require( './gtp.js'),        // TODO: test
  switch:   require( './switch.js' ),
  mstosamps:require( './mstosamps.js' ), // TODO: needs test,
  selector: require( './selector.js' ),
  utilities:require( './utilities.js' ),
  pow:      require( './pow.js' ),
  attack:   require( './attack.js' ),
  decay:    require( './decay.js' ),
  windows:  require( './windows.js' ),
  env:      require( './env.js' ),
  ad:       require( './ad.js'  ),
  adsr:     require( './adsr.js' ),
  ifelse:   require( './ifelseif.js' ),
  bang:     require( './bang.js' ),
  and:      require( './and.js' ),
  pan:      require( './pan.js' ),
  eq:       require( './eq.js' ),
  neq:      require( './neq.js' )
}

library.gen.lib = library

module.exports = library

},{"./abs.js":1,"./accum.js":2,"./acos.js":3,"./ad.js":4,"./add.js":5,"./adsr.js":6,"./and.js":7,"./asin.js":8,"./atan.js":9,"./attack.js":10,"./bang.js":11,"./bool.js":12,"./ceil.js":13,"./clamp.js":14,"./cos.js":15,"./counter.js":16,"./cycle.js":17,"./data.js":18,"./dcblock.js":19,"./decay.js":20,"./delay.js":21,"./delta.js":22,"./div.js":23,"./env.js":24,"./eq.js":25,"./floor.js":26,"./fold.js":27,"./gate.js":28,"./gen.js":29,"./gt.js":30,"./gte.js":31,"./gtp.js":32,"./history.js":33,"./ifelseif.js":34,"./in.js":35,"./lt.js":37,"./lte.js":38,"./ltp.js":39,"./max.js":40,"./memo.js":41,"./min.js":42,"./mix.js":43,"./mod.js":44,"./mstosamps.js":45,"./mtof.js":46,"./mul.js":47,"./neq.js":48,"./noise.js":49,"./not.js":50,"./pan.js":51,"./param.js":52,"./peek.js":53,"./phasor.js":54,"./poke.js":55,"./pow.js":56,"./rate.js":57,"./round.js":58,"./sah.js":59,"./selector.js":60,"./sign.js":61,"./sin.js":62,"./slide.js":63,"./sub.js":64,"./switch.js":65,"./t60.js":66,"./tan.js":67,"./tanh.js":68,"./train.js":69,"./utilities.js":70,"./windows.js":71,"./wrap.js":72}],37:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'lt',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    gen.variableNames.add( [this.name,'i'] )
    out = `  ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[i] ) ) {
      out += `(( ${inputs[0]} < ${inputs[1]}) | 0  )`
    } else {
      out += inputs[0] < inputs[1] ? 1 : 0 
    }
    out += '\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
    
    return out
  }
}

module.exports = (x,y) => {
  let lt = Object.create( proto )

  lt.inputs = [ x,y ]
  lt.name = lt.basename + gen.getUID()

  return lt
}

},{"./gen.js":29}],38:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'lte',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    out = `  var ${this.name} = `  

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out += `( ${inputs[0]} <= ${inputs[1]} | 0  )`
    } else {
      out += inputs[0] <= inputs[1] ? 1 : 0 
    }
    out += '\n'

    gen.memo[ this.name ] = this.name

    return [this.name, out]
    
    return out
  }
}

module.exports = (x,y) => {
  let lt = Object.create( proto )

  lt.inputs = [ x,y ]
  lt.name = 'lte' + gen.getUID()

  return lt
}

},{"./gen.js":29}],39:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'ltp',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( this.inputs[0] ) || isNaN( this.inputs[1] ) ) {
      out = `(${inputs[ 0 ]} * (( ${inputs[0]} < ${inputs[1]} ) | 0 ) )` 
    } else {
      out = inputs[0] * (( inputs[0] < inputs[1] ) | 0 )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let ltp = Object.create( proto )

  ltp.inputs = [ x,y ]

  return ltp
}

},{"./gen.js":29}],40:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'max',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ [ this.name ]: Math.max })

      out = `gen.max( ${inputs[0]}, ${inputs[1]} )`

    } else {
      out = Math.max( parseFloat( inputs[0] ), parseFloat( inputs[1] ) )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let max = Object.create( proto )

  max.inputs = [ x,y ]

  return max
}

},{"./gen.js":29}],41:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  basename:'memo',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    out = `  var ${this.name} = ${inputs[0]}\n`

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  } 
}

module.exports = (in1,memoName) => {
  let memo = Object.create( proto )
  
  memo.inputs = [ in1 ]
  memo.id   = gen.getUID()
  memo.name = memoName !== undefined ? memoName + '_' + gen.getUID() : `${memo.basename}${memo.id}`

  return memo
}

},{"./gen.js":29}],42:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'min',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ [ this.name ]: Math.min })

      out = `gen.min( ${inputs[0]}, ${inputs[1]} )`

    } else {
      out = Math.min( parseFloat( inputs[0] ), parseFloat( inputs[1] ) )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let min = Object.create( proto )

  min.inputs = [ x,y ]

  return min
}

},{"./gen.js":29}],43:[function(require,module,exports){
'use strict'

let gen = require('./gen.js'),
    add = require('./add.js'),
    mul = require('./mul.js'),
    sub = require('./sub.js'),
    memo= require('./memo.js')

module.exports = ( in1, in2, t=.5 ) => {
  let ugen = memo( add( mul(in1, sub(1,t ) ), mul( in2, t ) ) )
  ugen.name = 'mix' + gen.getUID()

  return ugen
}

},{"./add.js":5,"./gen.js":29,"./memo.js":41,"./mul.js":47,"./sub.js":64}],44:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

module.exports = (...args) => {
  let mod = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out='(',
          diff = 0, 
          numCount = 0,
          lastNumber = inputs[ 0 ],
          lastNumberIsUgen = isNaN( lastNumber ), 
          modAtEnd = false

      inputs.forEach( (v,i) => {
        if( i === 0 ) return

        let isNumberUgen = isNaN( v ),
            isFinalIdx   = i === inputs.length - 1

        if( !lastNumberIsUgen && !isNumberUgen ) {
          lastNumber = lastNumber % v
          out += lastNumber
        }else{
          out += `${lastNumber} % ${v}`
        }

        if( !isFinalIdx ) out += ' % ' 
      })

      out += ')'

      return out
    }
  }
  
  return mod
}

},{"./gen.js":29}],45:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'mstosamps',

  gen() {
    let out,
        inputs = gen.getInputs( this ),
        returnValue

    if( isNaN( inputs[0] ) ) {
      out = `  var ${this.name } = ${gen.samplerate} / 1000 * ${inputs[0]} \n\n`
     
      gen.memo[ this.name ] = out
      
      returnValue = [ this.name, out ]
    } else {
      out = gen.samplerate / 1000 * this.inputs[0]

      returnValue = out
    }    

    return returnValue
  }
}

module.exports = x => {
  let mstosamps = Object.create( proto )

  mstosamps.inputs = [ x ]
  mstosamps.name = proto.basename + gen.getUID()

  return mstosamps
}

},{"./gen.js":29}],46:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'mtof',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.exp })

      out = `( ${this.tuning} * gen.exp( .057762265 * (${inputs[0]} - 69) ) )`

    } else {
      out = this.tuning * Math.exp( .057762265 * ( inputs[0] - 69) )
    }
    
    return out
  }
}

module.exports = ( x, props ) => {
  let ugen = Object.create( proto ),
      defaults = { tuning:440 }
  
  if( props !== undefined ) Object.assign( props.defaults )

  Object.assign( ugen, defaults )
  ugen.inputs = [ x ]
  

  return ugen
}

},{"./gen.js":29}],47:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

module.exports = ( ...args ) => {
  let mul = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out=`  ${this.name} = fround(`,
          sum = 1, numCount = 0, mulAtEnd = false, alreadyFullSummed = true

      gen.variableNames.add( [this.name,'f'] )

      inputs.forEach( (v,i) => {
        if( isNaN( v ) ) {
          out += v
          if( i < inputs.length -1 ) {
            mulAtEnd = true
            out += ' * '
          }
          alreadyFullSummed = false
        }else{
          if( i === 0 ) {
            sum = v
          }else{
            sum *= parseFloat( v )
          }
          numCount++
        }
      })
      
      //if( alreadyFullSummed ) out = ''

      if( numCount > 0 ) {
        out += mulAtEnd || alreadyFullSummed ? `fround(${sum})` : ` * fround(${sum})`
      }
      
      //if( !alreadyFullSummed ) 
      out += ');\n'

      return [this.name, out]
    }
  }
  mul.name = 'mul'+mul.id

  return mul
}

},{"./gen.js":29}],48:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'neq',

  gen() {
    let inputs = gen.getInputs( this ), out

    out = /*this.inputs[0] !== this.inputs[1] ? 1 :*/ `  var ${this.name} = (${inputs[0]} !== ${inputs[1]}) | 0\n\n`

    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  },

}

module.exports = ( in1, in2 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":29}],49:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'noise',

  gen() {
    let out

    gen.closures.add({ 'noise' : Math.random })

    out = `  var ${this.name} = gen.noise()\n`
    
    gen.memo[ this.name ] = this.name

    return [ this.name, out ]
  }
}

module.exports = x => {
  let noise = Object.create( proto )
  noise.name = proto.name + gen.getUID()

  return noise
}

},{"./gen.js":29}],50:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'not',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( this.inputs[0] ) ) {
      out = `( ${inputs[0]} === 0 ? 1 : 0 )`
    } else {
      out = !inputs[0] === 0 ? 1 : 0
    }
    
    return out
  }
}

module.exports = x => {
  let not = Object.create( proto )

  not.inputs = [ x ]

  return not
}

},{"./gen.js":29}],51:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' ),
    data = require( './data.js' ),
    peek = require( './peek.js' ),
    mul  = require( './mul.js' )

let proto = {
  basename:'pan', 
  initTable() {    
    let bufferL = new Float32Array( 1024 ),
        bufferR = new Float32Array( 1024 )

    let sqrtTwoOverTwo = Math.sqrt(2) / 2

    for( let i = 0; i < 1024; i++ ) { 
      let pan = -1 + ( i / 1024 ) * 2
      bufferL[i] = ( sqrtTwoOverTwo * ( Math.cos(pan) - Math.sin(pan) ) )
      bufferR[i] = ( sqrtTwoOverTwo * ( Math.cos(pan) + Math.sin(pan) ) )
    }

    gen.globals.panL = data( bufferL, 1, { immutable:true })
    gen.globals.panR = data( bufferR, 1, { immutable:true })
  }

}

module.exports = ( leftInput, rightInput, pan, properties ) => {
  if( gen.globals.panL === undefined ) proto.initTable()

  let ugen = Object.create( proto )

  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ leftInput, rightInput ],
    left:    mul( leftInput, peek( gen.globals.panL, pan, { boundmode:'clamp' }) ),
    right:   mul( rightInput, peek( gen.globals.panR, pan, { boundmode:'clamp' }) )
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./data.js":18,"./gen.js":29,"./mul.js":47,"./peek.js":53}],52:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

let proto = {
  gen() {
    gen.requestMemory( this.memory )
    
    gen.params.add({ [this.name]: this })

    this.value = this.initialValue

    gen.memo[ this.name ] = `memory[${this.memory.value.idx}]`

    return gen.memo[ this.name ]
  } 
}

module.exports = ( propName=0, value=0 ) => {
  let ugen = Object.create( proto )
  
  if( typeof propName !== 'string' ) {
    ugen.name = 'param' + gen.getUID()
    ugen.initialValue = propName
  }else{
    ugen.name = propName
    ugen.initialValue = value
  }

  Object.defineProperty( ugen, 'value', {
    get() {
      if( this.memory.value.idx !== null ) {
        return gen.memory.heap[ this.memory.value.idx ]
      }
    },
    set( v ) {
      if( this.memory.value.idx !== null ) {
        gen.memory.heap[ this.memory.value.idx ] = v 
      }
    }
  })

  ugen.memory = {
    value: { length:1, idx:null }
  }

  return ugen
}

},{"./gen.js":29}],53:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'peek',

  gen() {
    let genName = 'gen.' + this.name,
        inputs = gen.getInputs( this ),
        out, functionBody, next, lengthIsLog2, idx
    
    idx = inputs[1]
    lengthIsLog2 = (Math.log2( this.data.buffer.length ) | 0)  === Math.log2( this.data.buffer.length )

    gen.variableNames.add([ this.name+'_phase', 'f']  )
    gen.variableNames.add([ this.name+'_index', 'i']  )
    gen.variableNames.add([ this.name+'_next',  'i']  )
    gen.variableNames.add([ this.name+'_frac',  'f']  )
    gen.variableNames.add([ this.name+'_base',  'f']  )
    gen.variableNames.add([ this.name+'_out', 'f']  )

    if( this.mode !== 'simple' ) {

      const phase = this.mode === 'samples' ? `fround(${inputs[0]})` : `fround( fround(${inputs[0]}) * fround(${this.data.buffer.length - 1}|0) )`

      const nonLog2Next =  
        `if( ( ${this.name}_index + 1|0 )|0 >= ${this.data.buffer.length}|0 ) {
          ${this.name}_next = ( ${this.name}_index + 1|0 - ${this.data.buffer.length}|0 )|0
        }else{
          ${this.name}_next = ( ${this.name}_index + 1|0 )|0 
        }\n\n`

      const clampNext =
        `if( (${this.name}_index + 1|0 )|0 >= (${this.data.buffer.length - 1})|0 ) {
          ${this.name}_next = ${this.data.buffer.length - 1}|0
        }else{
          ${this.name}_next = ( ${this.name}_index + 1|0 )|0
        }\n\n`


      functionBody = 
      `  ${this.name}_phase = ${phase} 
  ${this.name}_index = ~~floor(+${this.name}_phase)\n`


      if( this.boundmode === 'wrap' ) {
        next = lengthIsLog2 ? `( ${this.name}_index + 1 )|0 & (${this.data.buffer.length} - 1)|0` : nonLog2Next
      }else if( this.boundmode === 'clamp' ) {
        console.log('clamp')
        next = clampNext 
      }else{
        next = `( ${this.name}_index + 1|0 )|0`     
      }


      if( this.interp === 'linear' ) {

        functionBody += 
          `  ${this.name}_frac  = fround( ${this.name}_phase - fround(${this.name}_index|0) )
  ${this.name}_base  = fround( memory[ ((${idx}|0) + ((${this.name}_index * 4)|0)) >>2  ]  )
  ${this.name}_next  = ${next}\n\n`


      const interpolated= `  ${this.name}_out = fround( ${this.name}_base + fround(${this.name}_frac * fround( fround( memory[ ((${idx}|0) + (${this.name}_next * 4|0)) >>2 ]) - ${this.name}_base ) ) )\n\n`

        if( this.boundmode === 'ignore' ) {

          functionBody += `
          ${this.name}_out   = ${this.name}_index >= ${this.data.buffer.length - 1} || ${this.name}_index < 0 ? 0 : ${this.name}_base + ${this.name}_frac * ( memory[ ${idx} + ${this.name}_next ] - ${this.name}_base )\n\n`
        }else{
          functionBody += interpolated//`  ${this.name}_out = fround(0);\n\n`//interpolated 
        }
/* END LINEAR INTERPOLATION */
      }else{
        if( this.boundmode === 'clamp' ) {
          functionBody += `  ${this.name}_out = fround( memory[ ${idx} + ${this.name}_index ] )\n\n`
        }else{
          functionBody += `  ${this.name}_out = fround( memory[ ((${idx}|0) + ((${this.name}_index * 4)|0)) >>2  ] )\n\n`
        }  
      }

/* END MODE !== SIMPLE */
    } else { // mode is simple
      functionBody = `  ${this.name}_out = fround( memory[ (${idx} + ~~floor(+${inputs[0]} * 4.0 )|0 * 4) >> 2 ])\n\n`
    }

    console.log( functionBody )
    return [ this.name+'_out', functionBody ]
  },
}

module.exports = ( data, index, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { channels:1, mode:'phase', interp:'linear', boundmode:'wrap' } 
  
  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    data,
    dataName:   data.name,
    uid:        gen.getUID(),
    inputs:     [ index, data ],
  },
  defaults )
  
  ugen.name = ugen.basename + ugen.uid

  return ugen
}

},{"./gen.js":29}],54:[function(require,module,exports){
'use strict'

let gen  = require( './gen.js' ),
    accum= require( './accum.js' ),
    mul  = require( './mul.js' ),
    proto = { basename:'phasor' }

module.exports = ( frequency=1, reset=0, props ) => {
  if( props === undefined ) props = { min: -1 }

  let range = (props.max || 1 ) - props.min

  let ugen = typeof frequency === 'number' ? accum( (frequency * range) / gen.samplerate, reset, props ) :  accum( mul( frequency, 1/gen.samplerate/(1/range) ), reset, props )

  ugen.name = proto.basename + gen.getUID()

  return ugen
}

},{"./accum.js":2,"./gen.js":29,"./mul.js":47}],55:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js'),
    mul  = require('./mul.js'),
    wrap = require('./wrap.js')

let proto = {
  basename:'poke',

  gen() {
    let dataName = 'memory',
        inputs = gen.getInputs( this ),
        idx, out, wrapped
    
    idx = this.data.gen()

    //gen.requestMemory( this.memory )
    //wrapped = wrap( this.inputs[1], 0, this.dataLength ).gen()
    //idx = wrapped[0]
    //gen.functionBody += wrapped[1]
    let outputStr = this.inputs[1] === 0 ?
      `  ${dataName}[ ${idx} ] = ${inputs[0]}\n` :
      `  ${dataName}[ ${idx} + ${inputs[1]} ] = ${inputs[0]}\n`

    if( this.inline === undefined ) {
      gen.functionBody += outputStr
    }else{
      return [ this.inline, outputStr ]
    }
  }
}
module.exports = ( data, value, index, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { channels:1 } 

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    data,
    dataName:   data.name,
    dataLength: data.buffer.length,
    uid:        gen.getUID(),
    inputs:     [ value, index ],
  },
  defaults )


  ugen.name = ugen.basename + ugen.uid
  
  gen.histories.set( ugen.name, ugen )

  return ugen
}

},{"./gen.js":29,"./mul.js":47,"./wrap.js":72}],56:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'pow',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    if( isNaN( inputs[0] ) || isNaN( inputs[1] ) ) {
      gen.closures.add({ 'pow': Math.pow })

      out = `gen.pow( ${inputs[0]}, ${inputs[1]} )` 

    } else {
      if( typeof inputs[0] === 'string' && inputs[0][0] === '(' ) {
        inputs[0] = inputs[0].slice(1,-1)
      }
      if( typeof inputs[1] === 'string' && inputs[1][0] === '(' ) {
        inputs[1] = inputs[1].slice(1,-1)
      }

      out = Math.pow( parseFloat( inputs[0] ), parseFloat( inputs[1]) )
    }
    
    return out
  }
}

module.exports = (x,y) => {
  let pow = Object.create( proto )

  pow.inputs = [ x,y ]
  pow.id = gen.getUID()
  pow.name = `${pow.basename}{pow.id}`

  return pow
}

},{"./gen.js":29}],57:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' ),
    delta   = require( './delta.js' ),
    wrap    = require( './wrap.js' )

let proto = {
  basename:'rate',

  gen() {
    let inputs = gen.getInputs( this ),
        phase  = history(),
        inMinus1 = history(),
        genName = 'gen.' + this.name,
        filter, sum, out

    gen.closures.add({ [ this.name ]: this }) 

    out = 
` var ${this.name}_diff = ${inputs[0]} - ${genName}.lastSample
  if( ${this.name}_diff < -.5 ) ${this.name}_diff += 1
  ${genName}.phase += ${this.name}_diff * ${inputs[1]}
  if( ${genName}.phase > 1 ) ${genName}.phase -= 1
  ${genName}.lastSample = ${inputs[0]}
`
    out = ' ' + out

    return [ genName + '.phase', out ]
  }
}

module.exports = ( in1, rate ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    phase:      0,
    lastSample: 0,
    uid:        gen.getUID(),
    inputs:     [ in1, rate ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./add.js":5,"./delta.js":22,"./gen.js":29,"./history.js":33,"./memo.js":41,"./mul.js":47,"./sub.js":64,"./wrap.js":72}],58:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'round',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.round })

      out = `gen.round( ${inputs[0]} )`

    } else {
      out = Math.round( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let round = Object.create( proto )

  round.inputs = [ x ]

  return round
}

},{"./gen.js":29}],59:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' )

let proto = {
  basename:'sah',

  gen() {
    let inputs = gen.getInputs( this ), out

    gen.data[ this.name ] = 0
    gen.data[ this.name + '_control' ] = 0

    out = 
` var ${this.name} = gen.data.${this.name}_control,
      ${this.name}_trigger = ${inputs[1]} > ${inputs[2]} ? 1 : 0

  if( ${this.name}_trigger !== ${this.name}  ) {
    if( ${this.name}_trigger === 1 ) 
      gen.data.${this.name} = ${inputs[0]}
    gen.data.${this.name}_control = ${this.name}_trigger
  }
`
    
    gen.memo[ this.name ] = `gen.data.${this.name}`

    return [ `gen.data.${this.name}`, ' ' +out ]
  }
}

module.exports = ( in1, control, threshold=0, properties ) => {
  let ugen = Object.create( proto ),
      defaults = { init:0 }

  if( properties !== undefined ) Object.assign( defaults, properties )

  Object.assign( ugen, { 
    lastSample: 0,
    uid:        gen.getUID(),
    inputs:     [ in1, control,threshold ],
  },
  defaults )
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":29}],60:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'selector',

  gen() {
    let inputs = gen.getInputs( this ), out, returnValue = 0
    
    switch( inputs.length ) {
      case 2 :
        returnValue = inputs[1]
        break;
      case 3 :
        out = `  var ${this.name}_out = ${inputs[0]} === 1 ? ${inputs[1]} : ${inputs[2]}\n\n`;
        returnValue = [ this.name + '_out', out ]
        break;  
      default:
        out = 
` var ${this.name}_out = 0
  switch( ${inputs[0]} + 1 ) {\n`

        for( let i = 1; i < inputs.length; i++ ){
          out +=`    case ${i}: ${this.name}_out = ${inputs[i]}; break;\n` 
        }

        out += '  }\n\n'
        
        returnValue = [ this.name + '_out', ' ' + out ]
    }

    gen.memo[ this.name ] = this.name + '_out'

    return returnValue
  },
}

module.exports = ( ...inputs ) => {
  let ugen = Object.create( proto )
  
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":29}],61:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  name:'sign',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ this.name ]: Math.sign })

      out = `gen.sign( ${inputs[0]} )`

    } else {
      out = Math.sign( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let sign = Object.create( proto )

  sign.inputs = [ x ]

  return sign
}

},{"./gen.js":29}],62:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'sin',

  gen() {
    let out,
        inputs = gen.getInputs( this )

    gen.variableNames.add( [this.name, 'f'] )
    
    if( isNaN( inputs[0] ) ) {

      out = [ this.name, `  ${this.name} = fround( sin( ${inputs[0]} ) );\n` ]

    } else {
      out = Math.sin( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let sin = Object.create( proto )

  sin.inputs = [ x ]
  sin.id = gen.getUID()
  sin.name = `${sin.basename}${sin.id}`

  return sin
}

},{"./gen.js":29}],63:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    history = require( './history.js' ),
    sub     = require( './sub.js' ),
    add     = require( './add.js' ),
    mul     = require( './mul.js' ),
    memo    = require( './memo.js' ),
    gt      = require( './gt.js' ),
    div     = require( './div.js' ),
    _switch = require( './switch.js' )

module.exports = ( in1, slideUp = 1, slideDown = 1 ) => {
  let y1 = history(0),
      filter, slideAmount

  //y (n) = y (n-1) + ((x (n) - y (n-1))/slide) 
  slideAmount = _switch( gt(in1,y1.out), slideUp, slideDown )

  filter = memo( add( y1.out, div( sub( in1, y1.out ), slideAmount ) ) )

  y1.in( filter )

  return filter
}

},{"./add.js":5,"./div.js":23,"./gen.js":29,"./gt.js":30,"./history.js":33,"./memo.js":41,"./mul.js":47,"./sub.js":64,"./switch.js":65}],64:[function(require,module,exports){
'use strict'

let gen = require('./gen.js')

module.exports = ( ...args ) => {
  let sub = {
    id:     gen.getUID(),
    inputs: args,

    gen() {
      let inputs = gen.getInputs( this ),
          out=0,
          diff = 0,
          needsParens = false, 
          numCount = 0,
          lastNumber = inputs[ 0 ],
          lastNumberIsUgen = isNaN( lastNumber ), 
          subAtEnd = false,
          hasUgens = false,
          returnValue = 0

      gen.variableNames.add( [this.name,'f'] )

      this.inputs.forEach( value => { if( isNaN( value ) ) hasUgens = true })
      
      if( hasUgens ) { // store in variable for future reference
        out = '  ' + this.name + ' = fround('
      }else{
        out = '('
      }

      inputs.forEach( (v,i) => {
        if( i === 0 ) return

        let isNumberUgen = isNaN( v ),
            isFinalIdx   = i === inputs.length - 1

        if( !lastNumberIsUgen && !isNumberUgen ) {
          lastNumber = lastNumber - v
          out += lastNumber
          return
        }else{
          needsParens = true
          out += `${lastNumber} - ${v}`
        }

        if( !isFinalIdx ) out += ' - ' 
      })
    
      if( needsParens ) {
        out += ')'
      }else{
        out = out.slice( 1 ) // remove opening paren
      }
      
      if( hasUgens ) out += '\n'

      returnValue = hasUgens ? [ this.name, out ] : out
      
      //if( hasUgens ) gen.memo[ this.name ] = this.name

      return returnValue
    }
  }
   
  sub.name = 'sub'+sub.id

  return sub
}

},{"./gen.js":29}],65:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' )

let proto = {
  basename:'switch',

  gen() {
    let inputs = gen.getInputs( this ), out

    if( inputs[1] === inputs[2] ) return inputs[1] // if both potential outputs are the same just return one of them
    
    out = `  var ${this.name}_out = ${inputs[0]} === 1 ? ${inputs[1]} : ${inputs[2]}\n`

    gen.memo[ this.name ] = `${this.name}_out`

    return [ `${this.name}_out`, out ]
  },

}

module.exports = ( control, in1 = 1, in2 = 0 ) => {
  let ugen = Object.create( proto )
  Object.assign( ugen, {
    uid:     gen.getUID(),
    inputs:  [ control, in1, in2 ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./gen.js":29}],66:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'t60',

  gen() {
    let out,
        inputs = gen.getInputs( this ),
        returnValue

    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ [ 'exp' ]: Math.exp })

      out = `  var ${this.name} = gen.exp( -6.907755278921 / ${inputs[0]} )\n\n`
     
      gen.memo[ this.name ] = out
      
      returnValue = [ this.name, out ]
    } else {
      out = Math.exp( -6.907755278921 / inputs[0] )

      returnValue = out
    }    

    return returnValue
  }
}

module.exports = x => {
  let t60 = Object.create( proto )

  t60.inputs = [ x ]
  t60.name = proto.basename + gen.getUID()

  return t60
}

},{"./gen.js":29}],67:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'tan',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'tan': Math.tan })

      out = `gen.tan( ${inputs[0]} )` 

    } else {
      out = Math.tan( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let tan = Object.create( proto )

  tan.inputs = [ x ]
  tan.id = gen.getUID()
  tan.name = `${tan.basename}{tan.id}`

  return tan
}

},{"./gen.js":29}],68:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js')

let proto = {
  basename:'tanh',

  gen() {
    let out,
        inputs = gen.getInputs( this )
    
    if( isNaN( inputs[0] ) ) {
      gen.closures.add({ 'tanh': Math.tanh })

      out = `gen.tanh( ${inputs[0]} )` 

    } else {
      out = Math.tanh( parseFloat( inputs[0] ) )
    }
    
    return out
  }
}

module.exports = x => {
  let tan = Object.create( proto )

  tan.inputs = [ x ]
  tan.id = gen.getUID()
  tan.name = `${tan.basename}{tan.id}`

  return tan
}

},{"./gen.js":29}],69:[function(require,module,exports){
'use strict'

let gen     = require( './gen.js' ),
    lt      = require( './lt.js' ),
    phasor  = require( './phasor.js' )

module.exports = ( frequency=440, pulsewidth=.5 ) => {
  let graph = lt( accum( div( frequency, 44100 ) ), .5 )

  graph.name = `train${gen.getUID()}`

  return graph
}


},{"./gen.js":29,"./lt.js":37,"./phasor.js":54}],70:[function(require,module,exports){
'use strict'

let gen = require( './gen.js' ),
    data = require( './data.js' )

let isStereo = false

let utilities = {
  ctx: null,

  clear() {
    this.callback = () => 0 
    this.clear.callbacks.forEach( v => v() )
    this.clear.callbacks.length = 0
  },

  createContext() {
    let AC = typeof AudioContext === 'undefined' ? webkitAudioContext : AudioContext
    this.ctx = new AC()
    gen.samplerate = this.ctx.sampleRate

    let start = () => {
      if( typeof AC !== 'undefined' ) {
        if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
          window.removeEventListener( 'touchstart', start )

          if( 'ontouchstart' in document.documentElement ){ // required to start audio under iOS 6
            let mySource = utilities.ctx.createBufferSource()
            mySource.connect( utilities.ctx.destination )
            mySource.noteOn( 0 )
          }
         }
      }
    }

    if( document && document.documentElement && 'ontouchstart' in document.documentElement ) {
      window.addEventListener( 'touchstart', start )
    }

    return this
  },

  createScriptProcessor() {
    this.node = this.ctx.createScriptProcessor( 1024, 0, 2 ),
    this.clearFunction = function() { return 0 },
    this.callback = this.clearFunction

    this.node.onaudioprocess = function( audioProcessingEvent ) {
      var outputBuffer = audioProcessingEvent.outputBuffer;

      var left = outputBuffer.getChannelData( 0 ),
          right= outputBuffer.getChannelData( 1 ),
          memory = gen.memory.heap

      for (var sample = 0; sample < left.length; sample++) {
        
        utilities.callback()

        if( !isStereo ) {
          left[ sample ] = right[ sample ] = memory[0]//utilities.callback()
        }else{
          left[ sample  ] = memory[0]
          right[ sample ] = memory[1]
        }
      }
    }

    this.node.connect( this.ctx.destination )

    //this.node.connect( this.analyzer )

    return this
  },
  
  playGraph( graph, debug, mem=44100*10 ) {
    utilities.clear()
    if( debug === undefined ) debug = false
          
    isStereo = Array.isArray( graph )

    utilities.callback = gen.createCallback( graph, mem, debug )
    
    if( utilities.console ) utilities.console.setValue( utilities.callback.toString() )

    return utilities.callback
  },

  loadSample( soundFilePath, data ) {
    let req = new XMLHttpRequest()
    req.open( 'GET', soundFilePath, true )
    req.responseType = 'arraybuffer' 
    
    let promise = new Promise( (resolve,reject) => {
      req.onload = function() {
        var audioData = req.response

        utilities.ctx.decodeAudioData( audioData, (buffer) => {
          data.buffer = buffer.getChannelData(0)
          resolve( data.buffer )
        })
      }
    })

    req.send()

    return promise
  }

}

utilities.clear.callbacks = []

module.exports = utilities

},{"./data.js":18,"./gen.js":29}],71:[function(require,module,exports){
'use strict'

/*
 * many windows here adapted from https://github.com/corbanbrook/dsp.js/blob/master/dsp.js
 * starting at line 1427
 * taken 8/15/16
*/ 

const windows = module.exports = { 
  bartlett( length, index ) {
    return 2 / (length - 1) * ((length - 1) / 2 - Math.abs(index - (length - 1) / 2)) 
  },

  bartlettHann( length, index ) {
    return 0.62 - 0.48 * Math.abs(index / (length - 1) - 0.5) - 0.38 * Math.cos( 2 * Math.PI * index / (length - 1))
  },

  blackman( length, index, alpha ) {
    let a0 = (1 - alpha) / 2,
        a1 = 0.5,
        a2 = alpha / 2

    return a0 - a1 * Math.cos(2 * Math.PI * index / (length - 1)) + a2 * Math.cos(4 * Math.PI * index / (length - 1))
  },

  cosine( length, index ) {
    return Math.cos(Math.PI * index / (length - 1) - Math.PI / 2)
  },

  gauss( length, index, alpha ) {
    return Math.pow(Math.E, -0.5 * Math.pow((index - (length - 1) / 2) / (alpha * (length - 1) / 2), 2))
  },

  hamming( length, index ) {
    return 0.54 - 0.46 * Math.cos( Math.PI * 2 * index / (length - 1))
  },

  hann( length, index ) {
    return 0.5 * (1 - Math.cos( Math.PI * 2 * index / (length - 1)) )
  },

  lanczos( length, index ) {
    let x = 2 * index / (length - 1) - 1;
    return Math.sin(Math.PI * x) / (Math.PI * x)
  },

  rectangular( length, index ) {
    return 1
  },

  triangular( length, index ) {
    return 2 / length * (length / 2 - Math.abs(index - (length - 1) / 2))
  },

  // parabola
  welch( length, _index, ignore, shift ) {
    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    const index = shift === 0 ? _index : (_index + Math.floor( shift * length )) % length
    const n_1_over2 = (length - 1) / 2 

    return 1 - Math.pow( ( index - n_1_over2 ) / n_1_over2, 2 )
  },
  inversewelch( length, _index, ignore, shift=0 ) {
    //w[n] = 1 - Math.pow( ( n - ( (N-1) / 2 ) ) / (( N-1 ) / 2 ), 2 )
    let index = shift === 0 ? _index : (_index + Math.floor( shift * length )) % length
    const n_1_over2 = (length - 1) / 2

    return Math.pow( ( index - n_1_over2 ) / n_1_over2, 2 )
  },

  parabola( length, index ) {
    if( index <= length / 2 ) {
      return windows.inversewelch( length / 2, index ) - 1
    }else{
      return 1 - windows.inversewelch( length / 2, index - length / 2 )
    }
  },

  exponential( length, index, alpha ) {
    return Math.pow( index/length, alpha )
  },

  linear( length, index ) {
    return index/length
  }
}

},{}],72:[function(require,module,exports){
'use strict'

let gen  = require('./gen.js'),
    floor= require('./floor.js'),
    sub  = require('./sub.js'),
    memo = require('./memo.js')

let proto = {
  basename:'wrap',

  gen() {
    let code,
        inputs = gen.getInputs( this ),
        signal = inputs[0], min = inputs[1], max = inputs[2],
        out, diff

    //out = `(((${inputs[0]} - ${this.min}) % ${diff}  + ${diff}) % ${diff} + ${this.min})`
    //const long numWraps = long((v-lo)/range) - (v < lo);
    //return v - range * double(numWraps);   
    
    if( this.min === 0 ) {
      diff = max
    }else if ( isNaN( max ) || isNaN( min ) ) {
      diff = `${max} - ${min}`
    }else{
      diff = max - min
    }

    out =
` var ${this.name} = ${inputs[0]}
  if( ${this.name} < ${this.min} ) ${this.name} += ${diff}
  else if( ${this.name} > ${this.max} ) ${this.name} -= ${diff}

`

    return [ this.name, ' ' + out ]
  },
}

module.exports = ( in1, min=0, max=1 ) => {
  let ugen = Object.create( proto )

  Object.assign( ugen, { 
    min, 
    max,
    uid:    gen.getUID(),
    inputs: [ in1, min, max ],
  })
  
  ugen.name = `${ugen.basename}${ugen.uid}`

  return ugen
}

},{"./floor.js":26,"./gen.js":29,"./memo.js":41,"./sub.js":64}],73:[function(require,module,exports){
'use strict'

let MemoryHelper = {
  create( sizeOrBuffer=4096, memtype=Float32Array ) {
    let helper = Object.create( this )

    // conveniently, buffer constructors accept either a size or an array buffer to use...
    // so, no matter which is passed to sizeOrBuffer it should work.
    Object.assign( helper, {
      heap: new memtype( sizeOrBuffer ),
      list: {},
      freeList: {}
    })

    return helper
  },

  alloc( size, immutable ) {
    let idx = -1

    if( size > this.heap.length ) {
      throw Error( 'Allocation request is larger than heap size of ' + this.heap.length )
    }

    for( let key in this.freeList ) {
      let candidate = this.freeList[ key ]

      if( candidate.size >= size ) {
        idx = key

        this.list[ idx ] = { size, immutable, references:1 }

        if( candidate.size !== size ) {
          let newIndex = idx + size,
              newFreeSize

          for( let key in this.list ) {
            if( key > newIndex ) {
              newFreeSize = key - newIndex
              this.freeList[ newIndex ] = newFreeSize
            }
          }
        }

        break
      }
    }

    if( idx !== -1 ) delete this.freeList[ idx ]

    if( idx === -1 ) {
      let keys = Object.keys( this.list ),
          lastIndex

      if( keys.length ) { // if not first allocation...
        lastIndex = parseInt( keys[ keys.length - 1 ] )

        idx = lastIndex + this.list[ lastIndex ].size
      }else{
        idx = 0
      }

      this.list[ idx ] = { size, immutable, references:1 }
    }

    if( idx + size >= this.heap.length ) {
      throw Error( 'No available blocks remain sufficient for allocation request.' )
    }
    return idx
  },

  addReference( index ) {
    if( this.list[ index ] !== undefined ) { 
      this.list[ index ].references++
    }
  },

  free( index ) {
    if( this.list[ index ] === undefined ) {
      throw Error( 'Calling free() on non-existing block.' )
    }

    let slot = this.list[ index ]
    if( slot === 0 ) return
    slot.references--

    if( slot.references === 0 && slot.immutable !== true ) {    
      this.list[ index ] = 0

      let freeBlockSize = 0
      for( let key in this.list ) {
        if( key > index ) {
          freeBlockSize = key - index
          break
        }
      }

      this.freeList[ index ] = freeBlockSize
    }
  },
}

module.exports = MemoryHelper

},{}]},{},[36])(36)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9hYnMuanMiLCJqcy9hY2N1bS5qcyIsImpzL2Fjb3MuanMiLCJqcy9hZC5qcyIsImpzL2FkZC5qcyIsImpzL2Fkc3IuanMiLCJqcy9hbmQuanMiLCJqcy9hc2luLmpzIiwianMvYXRhbi5qcyIsImpzL2F0dGFjay5qcyIsImpzL2JhbmcuanMiLCJqcy9ib29sLmpzIiwianMvY2VpbC5qcyIsImpzL2NsYW1wLmpzIiwianMvY29zLmpzIiwianMvY291bnRlci5qcyIsImpzL2N5Y2xlLmpzIiwianMvZGF0YS5qcyIsImpzL2RjYmxvY2suanMiLCJqcy9kZWNheS5qcyIsImpzL2RlbGF5LmpzIiwianMvZGVsdGEuanMiLCJqcy9kaXYuanMiLCJqcy9lbnYuanMiLCJqcy9lcS5qcyIsImpzL2Zsb29yLmpzIiwianMvZm9sZC5qcyIsImpzL2dhdGUuanMiLCJqcy9nZW4uanMiLCJqcy9ndC5qcyIsImpzL2d0ZS5qcyIsImpzL2d0cC5qcyIsImpzL2hpc3RvcnkuanMiLCJqcy9pZmVsc2VpZi5qcyIsImpzL2luLmpzIiwianMvaW5kZXguanMiLCJqcy9sdC5qcyIsImpzL2x0ZS5qcyIsImpzL2x0cC5qcyIsImpzL21heC5qcyIsImpzL21lbW8uanMiLCJqcy9taW4uanMiLCJqcy9taXguanMiLCJqcy9tb2QuanMiLCJqcy9tc3Rvc2FtcHMuanMiLCJqcy9tdG9mLmpzIiwianMvbXVsLmpzIiwianMvbmVxLmpzIiwianMvbm9pc2UuanMiLCJqcy9ub3QuanMiLCJqcy9wYW4uanMiLCJqcy9wYXJhbS5qcyIsImpzL3BlZWsuanMiLCJqcy9waGFzb3IuanMiLCJqcy9wb2tlLmpzIiwianMvcG93LmpzIiwianMvcmF0ZS5qcyIsImpzL3JvdW5kLmpzIiwianMvc2FoLmpzIiwianMvc2VsZWN0b3IuanMiLCJqcy9zaWduLmpzIiwianMvc2luLmpzIiwianMvc2xpZGUuanMiLCJqcy9zdWIuanMiLCJqcy9zd2l0Y2guanMiLCJqcy90NjAuanMiLCJqcy90YW4uanMiLCJqcy90YW5oLmpzIiwianMvdHJhaW4uanMiLCJqcy91dGlsaXRpZXMuanMiLCJqcy93aW5kb3dzLmpzIiwianMvd3JhcC5qcyIsIi4uL21lbW9yeS1oZWxwZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidhYnMnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZCggW3RoaXMuaWQsJ2YnXSApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguYWJzIH0pXG5cbiAgICAgIG91dCA9IFsgdGhpcy5pZCwgYCAgJHt0aGlzLmlkfSA9IGFicyggJHtpbnB1dHNbMF19ICk7XFxuYCBdXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hYnMoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBhYnMgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYWJzLmlucHV0cyA9IFsgeCBdXG4gIGFicy5pZCA9IGFicy5uYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGFic1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY2N1bScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBjb2RlLFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIGdlbk5hbWUgPSAnZ2VuLicgKyB0aGlzLm5hbWUsXG4gICAgICAgIGZ1bmN0aW9uQm9keVxuXG4gICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICB0aGlzLm1lbW9yeS52YWx1ZS5pZHggKj0gNFxuXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHRoaXMuaW5pdGlhbFZhbHVlXG5cbiAgICBmdW5jdGlvbkJvZHkgPSB0aGlzLmNhbGxiYWNrKCBnZW5OYW1lLCBpbnB1dHNbMF0sIGlucHV0c1sxXSwgYG1lbW9yeVsgJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9ID4+IDIgXWAgKVxuXG4gICAgZ2VuLnZhcmlhYmxlTmFtZXMuYWRkKCBbdGhpcy5uYW1lICsgJ192YWx1ZScsJ2YnXSApXG5cbiAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogdGhpcyB9KSBcblxuICAgIC8vZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcbiAgICBcbiAgICByZXR1cm4gWyB0aGlzLm5hbWUgKyAnX3ZhbHVlJywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcblxuICBjYWxsYmFjayggX25hbWUsIF9pbmNyLCBfcmVzZXQsIHZhbHVlUmVmICkge1xuICAgIGxldCBkaWZmID0gdGhpcy5tYXggLSB0aGlzLm1pbixcbiAgICAgICAgb3V0ID0gJycsXG4gICAgICAgIHdyYXAgPSAnJ1xuICAgIFxuICAgIC8qIHRocmVlIGRpZmZlcmVudCBtZXRob2RzIG9mIHdyYXBwaW5nLCB0aGlyZCBpcyBtb3N0IGV4cGVuc2l2ZTpcbiAgICAgKlxuICAgICAqIDE6IHJhbmdlIHswLDF9OiB5ID0geCAtICh4IHwgMClcbiAgICAgKiAyOiBsb2cyKHRoaXMubWF4KSA9PSBpbnRlZ2VyOiB5ID0geCAmICh0aGlzLm1heCAtIDEpXG4gICAgICogMzogYWxsIG90aGVyczogaWYoIHggPj0gdGhpcy5tYXggKSB5ID0gdGhpcy5tYXggLXhcbiAgICAgKlxuICAgICAqL1xuXG4gICAgLy8gbXVzdCBjaGVjayBmb3IgcmVzZXQgYmVmb3JlIHN0b3JpbmcgdmFsdWUgZm9yIG91dHB1dFxuICAgIGlmKCAhKHR5cGVvZiB0aGlzLmlucHV0c1sxXSA9PT0gJ251bWJlcicgJiYgdGhpcy5pbnB1dHNbMV0gPCAxKSApIHsgXG4gICAgICBvdXQgKz0gYCAgaWYoIGZyb3VuZCgke19yZXNldH0pID49IGZyb3VuZCgxKSApIHsgJHt2YWx1ZVJlZn0gPSBmcm91bmQoJHt0aGlzLm1pbn0pOyB9XFxuXFxuYCBcbiAgICB9XG5cbiAgICBvdXQgKz0gYCAgJHt0aGlzLm5hbWV9X3ZhbHVlID0gZnJvdW5kKCR7dmFsdWVSZWZ9KTtcXG5gXG4gICAgXG4gICAgaWYoIHRoaXMuc2hvdWxkV3JhcCA9PT0gZmFsc2UgJiYgdGhpcy5zaG91bGRDbGFtcCA9PT0gdHJ1ZSApIHtcbiAgICAgIG91dCArPSBgICBpZiggZnJvdW5kKCR7dmFsdWVSZWZ9KSA8IGZyb3VuZCgke3RoaXMubWF4fSkgKSB7IGZyb3VuZCgke3ZhbHVlUmVmfSkgPSBmcm91bmQoJHt2YWx1ZVJlZn0pICsgZnJvdW5kKCR7X2luY3J9KTsgfVxcbmBcbiAgICB9ZWxzZXtcbiAgICAgIG91dCArPSBgICAke3ZhbHVlUmVmfSA9IGZyb3VuZCgke3ZhbHVlUmVmfSkgKyBmcm91bmQoJHtfaW5jcn0pO1xcbmAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIH1cblxuICAgIGlmKCB0aGlzLm1heCAhPT0gSW5maW5pdHkgICYmIHRoaXMuc2hvdWxkV3JhcCApIHdyYXAgKz0gYCAgaWYoIGZyb3VuZCgke3ZhbHVlUmVmfSkgPj0gZnJvdW5kKCR7dGhpcy5tYXh9KSApIHsgJHt2YWx1ZVJlZn0gPSBmcm91bmQoJHt2YWx1ZVJlZn0pIC0gZnJvdW5kKCR7ZGlmZn0pOyB9XFxuYFxuICAgIGlmKCB0aGlzLm1pbiAhPT0gLUluZmluaXR5ICYmIHRoaXMuc2hvdWxkV3JhcCApIHdyYXAgKz0gYCAgaWYoIGZyb3VuZCgke3ZhbHVlUmVmfSkgPCBmcm91bmQoJHt0aGlzLm1pbn0pICkgeyAke3ZhbHVlUmVmfSA9IGZyb3VuZCgke3ZhbHVlUmVmfSkgKyAgZnJvdW5kKCR7ZGlmZn0pOyB9XFxuXFxuYFxuXG4gICAgLy9pZiggdGhpcy5taW4gPT09IDAgJiYgdGhpcy5tYXggPT09IDEgKSB7IFxuICAgIC8vICB3cmFwID0gIGAgICR7dmFsdWVSZWZ9ID0gJHt2YWx1ZVJlZn0gLSAoJHt2YWx1ZVJlZn0gfCAwKVxcblxcbmBcbiAgICAvL30gZWxzZSBpZiggdGhpcy5taW4gPT09IDAgJiYgKCBNYXRoLmxvZzIoIHRoaXMubWF4ICkgfCAwICkgPT09IE1hdGgubG9nMiggdGhpcy5tYXggKSApIHtcbiAgICAvLyAgd3JhcCA9ICBgICAke3ZhbHVlUmVmfSA9ICR7dmFsdWVSZWZ9ICYgKCR7dGhpcy5tYXh9IC0gMSlcXG5cXG5gXG4gICAgLy99IGVsc2UgaWYoIHRoaXMubWF4ICE9PSBJbmZpbml0eSApe1xuICAgIC8vICB3cmFwID0gYCAgaWYoICR7dmFsdWVSZWZ9ID49ICR7dGhpcy5tYXh9ICkgJHt2YWx1ZVJlZn0gLT0gJHtkaWZmfVxcblxcbmBcbiAgICAvL31cblxuICAgIG91dCA9IG91dCArIHdyYXBcblxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jciwgcmVzZXQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IG1pbjowLCBtYXg6MSwgc2hvdWxkV3JhcDogdHJ1ZSwgc2hvdWxkQ2xhbXA6ZmFsc2UgfVxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBpZiggZGVmYXVsdHMuaW5pdGlhbFZhbHVlID09PSB1bmRlZmluZWQgKSBkZWZhdWx0cy5pbml0aWFsVmFsdWUgPSBkZWZhdWx0cy5taW5cblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbjogZGVmYXVsdHMubWluLCBcbiAgICBtYXg6IGRlZmF1bHRzLm1heCxcbiAgICBpbml0aWFsOiBkZWZhdWx0cy5pbml0aWFsVmFsdWUsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluY3IsIHJlc2V0IF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICAgIH1cbiAgfSxcbiAgZGVmYXVsdHMgKVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHsgcmV0dXJuIGdlbi5tZW1vcnkuaGVhcFsgdGhpcy5tZW1vcnkudmFsdWUuaWR4IF0gfSxcbiAgICBzZXQodikgeyBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiB9XG4gIH0pXG5cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhY29zJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBnZW4udmFyaWFibGVOYW1lcy5hZGQoIFt0aGlzLm5hbWUsJ2YnXSApXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdhY29zJzogTWF0aC5hY29zIH0pXG5cbiAgICAgIG91dCA9IFsgdGhpcy5uYW1lLCBgICAke3RoaXMubmFtZX0gPSBhY29zKCAke2lucHV0c1swXX0gKTtcXG5gIF0gXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5hY29zKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgYWNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBhY29zLmlucHV0cyA9IFsgeCBdXG4gIGFjb3MuaWQgPSBnZW4uZ2V0VUlEKClcbiAgYWNvcy5uYW1lID0gYCR7YWNvcy5iYXNlbmFtZX17YWNvcy5pZH1gXG5cbiAgcmV0dXJuIGFjb3Ncbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgbXVsICAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgZGl2ICAgICAgPSByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gICAgZGF0YSAgICAgPSByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICAgIHBlZWsgICAgID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBhY2N1bSAgICA9IHJlcXVpcmUoICcuL2FjY3VtLmpzJyApLFxuICAgIGlmZWxzZSAgID0gcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gICAgbHQgICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBiYW5nICAgICA9IHJlcXVpcmUoICcuL2JhbmcuanMnICksXG4gICAgZW52ICAgICAgPSByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gICAgYWRkICAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgcG9rZSAgICAgPSByZXF1aXJlKCAnLi9wb2tlLmpzJyApLFxuICAgIG5lcSAgICAgID0gcmVxdWlyZSggJy4vbmVxLmpzJyApLFxuICAgIGFuZCAgICAgID0gcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICAgIGd0ZSAgICAgID0gcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICAgIG1lbW8gICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggYXR0YWNrVGltZSA9IDQ0MTAwLCBkZWNheVRpbWUgPSA0NDEwMCwgX3Byb3BzICkgPT4ge1xuICBsZXQgX2JhbmcgPSBiYW5nKCksXG4gICAgICBwaGFzZSA9IGFjY3VtKCAxLCBfYmFuZywgeyBtYXg6IEluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlLCBpbml0aWFsVmFsdWU6LUluZmluaXR5IH0pLFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB7IHNoYXBlOidleHBvbmVudGlhbCcsIGFscGhhOjUgfSwgX3Byb3BzICksXG4gICAgICBidWZmZXJEYXRhLCBkZWNheURhdGEsIG91dCwgYnVmZmVyXG5cbiAgICAvL2NvbnNvbGUubG9nKCAnYXR0YWNrIHRpbWU6JywgYXR0YWNrVGltZSwgJ2RlY2F5IHRpbWU6JywgZGVjYXlUaW1lIClcbiAgbGV0IGNvbXBsZXRlRmxhZyA9IGRhdGEoIFswXSApXG4gIFxuICAvLyBzbGlnaHRseSBtb3JlIGVmZmljaWVudCB0byB1c2UgZXhpc3RpbmcgcGhhc2UgYWNjdW11bGF0b3IgZm9yIGxpbmVhciBlbnZlbG9wZXNcbiAgaWYoIHByb3BzLnNoYXBlID09PSAnbGluZWFyJyApIHtcbiAgICBvdXQgPSBpZmVsc2UoIFxuICAgICAgYW5kKCBndGUoIHBoYXNlLCAwKSwgbHQoIHBoYXNlLCBhdHRhY2tUaW1lICkpLFxuICAgICAgbWVtbyggZGl2KCBwaGFzZSwgYXR0YWNrVGltZSApICksXG5cbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksICBsdCggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lICkgKSApLFxuICAgICAgc3ViKCAxLCBkaXYoIHN1YiggcGhhc2UsIGF0dGFja1RpbWUgKSwgZGVjYXlUaW1lICkgKSxcbiAgICAgIFxuICAgICAgbmVxKCBwaGFzZSwgLUluZmluaXR5KSxcbiAgICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgICAgMCBcbiAgICApXG4gIH0gZWxzZSB7ICAgICBcbiAgICBidWZmZXJEYXRhID0gZW52KCAxMDI0LCB7IHR5cGU6cHJvcHMuc2hhcGUsIGFscGhhOnByb3BzLmFscGhhIH0pXG4gICAgb3V0ID0gaWZlbHNlKCBcbiAgICAgIGFuZCggZ3RlKCBwaGFzZSwgMCksIGx0KCBwaGFzZSwgYXR0YWNrVGltZSApKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgICAgYW5kKCBndGUocGhhc2UsMCksIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApICksIFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgc3ViKCAxLCBkaXYoIHN1YiggcGhhc2UsIGF0dGFja1RpbWUgKSwgZGVjYXlUaW1lICkgKSwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSxcblxuICAgICAgbmVxKCBwaGFzZSwgLUluZmluaXR5KSxcbiAgICAgIHBva2UoIGNvbXBsZXRlRmxhZywgMSwgMCwgeyBpbmxpbmU6MCB9KSxcblxuICAgICAgMFxuICAgIClcbiAgfVxuXG4gIG91dC5pc0NvbXBsZXRlID0gKCk9PiBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdXG5cbiAgb3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBnZW4ubWVtb3J5LmhlYXBbIGNvbXBsZXRlRmxhZy5tZW1vcnkudmFsdWVzLmlkeCBdID0gMFxuICAgIF9iYW5nLnRyaWdnZXIoKVxuICB9XG5cbiAgcmV0dXJuIG91dCBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uYXJncyApID0+IHtcbiAgbGV0IGFkZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD1gICAke3RoaXMubmFtZX0gPSBmcm91bmQoYCxcbiAgICAgICAgICBzdW0gPSAwLCBudW1Db3VudCA9IDAsIGFkZGVyQXRFbmQgPSBmYWxzZSwgYWxyZWFkeUZ1bGxTdW1tZWQgPSB0cnVlXG5cbiAgICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZCggW3RoaXMubmFtZSwnZiddIClcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGlzTmFOKCB2ICkgKSB7XG4gICAgICAgICAgb3V0ICs9IHZcbiAgICAgICAgICBpZiggaSA8IGlucHV0cy5sZW5ndGggLTEgKSB7XG4gICAgICAgICAgICBhZGRlckF0RW5kID0gdHJ1ZVxuICAgICAgICAgICAgb3V0ICs9ICcgKyAnXG4gICAgICAgICAgfVxuICAgICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gZmFsc2VcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgc3VtICs9IHBhcnNlRmxvYXQoIHYgKVxuICAgICAgICAgIG51bUNvdW50KytcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIFxuICAgICAgLy9pZiggYWxyZWFkeUZ1bGxTdW1tZWQgKSBvdXQgPSAnJ1xuXG4gICAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgICBvdXQgKz0gYWRkZXJBdEVuZCB8fCBhbHJlYWR5RnVsbFN1bW1lZCA/IGBmcm91bmQoJHtzdW19KWAgOiBgICsgZnJvdW5kKCR7c3VtfSlgXG4gICAgICB9XG4gICAgICBcbiAgICAgIC8vaWYoICFhbHJlYWR5RnVsbFN1bW1lZCApIG91dCArPSAnKSdcblxuICAgICAgb3V0ICs9ICcpO1xcbidcblxuICAgICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH1cbiAgfVxuICBcbiAgYWRkLm5hbWUgPSAnYWRkJythZGQuaWRcbiAgcmV0dXJuIGFkZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBtdWwgICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBzdWIgICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKSxcbiAgICBkaXYgICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBkYXRhICAgICA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayAgICAgPSByZXF1aXJlKCAnLi9wZWVrLmpzJyApLFxuICAgIGFjY3VtICAgID0gcmVxdWlyZSggJy4vYWNjdW0uanMnICksXG4gICAgaWZlbHNlICAgPSByZXF1aXJlKCAnLi9pZmVsc2VpZi5qcycgKSxcbiAgICBsdCAgICAgICA9IHJlcXVpcmUoICcuL2x0LmpzJyApLFxuICAgIGJhbmcgICAgID0gcmVxdWlyZSggJy4vYmFuZy5qcycgKSxcbiAgICBlbnYgICAgICA9IHJlcXVpcmUoICcuL2Vudi5qcycgKSxcbiAgICBwYXJhbSAgICA9IHJlcXVpcmUoICcuL3BhcmFtLmpzJyApLFxuICAgIGFkZCAgICAgID0gcmVxdWlyZSggJy4vYWRkLmpzJyApLFxuICAgIGd0cCAgICAgID0gcmVxdWlyZSggJy4vZ3RwLmpzJyApLFxuICAgIG5vdCAgICAgID0gcmVxdWlyZSggJy4vbm90LmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBhdHRhY2tUaW1lPTQ0LCBkZWNheVRpbWU9MjIwNTAsIHN1c3RhaW5UaW1lPTQ0MTAwLCBzdXN0YWluTGV2ZWw9LjYsIHJlbGVhc2VUaW1lPTQ0MTAwLCBfcHJvcHMgKSA9PiB7XG4gIGxldCBlbnZUcmlnZ2VyID0gYmFuZygpLFxuICAgICAgcGhhc2UgPSBhY2N1bSggMSwgZW52VHJpZ2dlciwgeyBtYXg6IEluZmluaXR5LCBzaG91bGRXcmFwOmZhbHNlIH0pLFxuICAgICAgc2hvdWxkU3VzdGFpbiA9IHBhcmFtKCAxICksXG4gICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgIHNoYXBlOiAnZXhwb25lbnRpYWwnLFxuICAgICAgICAgYWxwaGE6IDUsXG4gICAgICAgICB0cmlnZ2VyUmVsZWFzZTogZmFsc2UsXG4gICAgICB9LFxuICAgICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgX3Byb3BzICksXG4gICAgICBidWZmZXJEYXRhLCBkZWNheURhdGEsIG91dCwgYnVmZmVyLCBzdXN0YWluQ29uZGl0aW9uLCByZWxlYXNlQWNjdW0sIHJlbGVhc2VDb25kaXRpb25cblxuICAvLyBzbGlnaHRseSBtb3JlIGVmZmljaWVudCB0byB1c2UgZXhpc3RpbmcgcGhhc2UgYWNjdW11bGF0b3IgZm9yIGxpbmVhciBlbnZlbG9wZXNcbiAgLy9pZiggcHJvcHMuc2hhcGUgPT09ICdsaW5lYXInICkge1xuICAvLyAgb3V0ID0gaWZlbHNlKCBcbiAgLy8gICAgbHQoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICksIG1lbW8oIGRpdiggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKSApLFxuICAvLyAgICBsdCggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKSwgc3ViKCAxLCBtdWwoIGRpdiggc3ViKCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSApLCBwcm9wcy5kZWNheVRpbWUgKSwgMS1wcm9wcy5zdXN0YWluTGV2ZWwgKSApLFxuICAvLyAgICBsdCggcGhhc2UsIHByb3BzLmF0dGFja1RpbWUgKyBwcm9wcy5kZWNheVRpbWUgKyBwcm9wcy5zdXN0YWluVGltZSApLCBcbiAgLy8gICAgICBwcm9wcy5zdXN0YWluTGV2ZWwsXG4gIC8vICAgIGx0KCBwaGFzZSwgcHJvcHMuYXR0YWNrVGltZSArIHByb3BzLmRlY2F5VGltZSArIHByb3BzLnN1c3RhaW5UaW1lICsgcHJvcHMucmVsZWFzZVRpbWUgKSwgXG4gIC8vICAgICAgc3ViKCBwcm9wcy5zdXN0YWluTGV2ZWwsIG11bCggZGl2KCBzdWIoIHBoYXNlLCBwcm9wcy5hdHRhY2tUaW1lICsgcHJvcHMuZGVjYXlUaW1lICsgcHJvcHMuc3VzdGFpblRpbWUgKSwgcHJvcHMucmVsZWFzZVRpbWUgKSwgcHJvcHMuc3VzdGFpbkxldmVsKSApLFxuICAvLyAgICAwXG4gIC8vICApXG4gIC8vfSBlbHNlIHsgICAgIFxuICAgIGJ1ZmZlckRhdGEgPSBlbnYoIDEwMjQsIHsgdHlwZTpwcm9wcy5zaGFwZSwgYWxwaGE6cHJvcHMuYWxwaGEgfSApXG4gICAgXG4gICAgc3VzdGFpbkNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlIFxuICAgICAgPyBzaG91bGRTdXN0YWluXG4gICAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lICkgKVxuXG4gICAgcmVsZWFzZUFjY3VtID0gcHJvcHMudHJpZ2dlclJlbGVhc2VcbiAgICAgID8gZ3RwKCBzdWIoIHN1c3RhaW5MZXZlbCwgYWNjdW0oIGRpdiggc3VzdGFpbkxldmVsLCByZWxlYXNlVGltZSApICwgMCwgeyBzaG91bGRXcmFwOmZhbHNlIH0pICksIDAgKVxuICAgICAgOiBzdWIoIHN1c3RhaW5MZXZlbCwgbXVsKCBkaXYoIHN1YiggcGhhc2UsIGFkZCggYXR0YWNrVGltZSwgZGVjYXlUaW1lLCBzdXN0YWluVGltZSApICksIHJlbGVhc2VUaW1lICksIHN1c3RhaW5MZXZlbCApICksIFxuXG4gICAgcmVsZWFzZUNvbmRpdGlvbiA9IHByb3BzLnRyaWdnZXJSZWxlYXNlXG4gICAgICA/IG5vdCggc2hvdWxkU3VzdGFpbiApXG4gICAgICA6IGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUsIHN1c3RhaW5UaW1lLCByZWxlYXNlVGltZSApIClcblxuICAgIG91dCA9IGlmZWxzZShcbiAgICAgIC8vIGF0dGFjayBcbiAgICAgIGx0KCBwaGFzZSwgIGF0dGFja1RpbWUgKSwgXG4gICAgICBwZWVrKCBidWZmZXJEYXRhLCBkaXYoIHBoYXNlLCBhdHRhY2tUaW1lICksIHsgYm91bmRtb2RlOidjbGFtcCcgfSApLCBcblxuICAgICAgLy8gZGVjYXlcbiAgICAgIGx0KCBwaGFzZSwgYWRkKCBhdHRhY2tUaW1lLCBkZWNheVRpbWUgKSApLCBcbiAgICAgIHBlZWsoIGJ1ZmZlckRhdGEsIHN1YiggMSwgbXVsKCBkaXYoIHN1YiggcGhhc2UsICBhdHRhY2tUaW1lICksICBkZWNheVRpbWUgKSwgc3ViKCAxLCAgc3VzdGFpbkxldmVsICkgKSApLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pLFxuXG4gICAgICAvLyBzdXN0YWluXG4gICAgICBzdXN0YWluQ29uZGl0aW9uLFxuICAgICAgcGVlayggYnVmZmVyRGF0YSwgIHN1c3RhaW5MZXZlbCApLFxuXG4gICAgICAvLyByZWxlYXNlXG4gICAgICByZWxlYXNlQ29uZGl0aW9uLCAvL2x0KCBwaGFzZSwgIGF0dGFja1RpbWUgKyAgZGVjYXlUaW1lICsgIHN1c3RhaW5UaW1lICsgIHJlbGVhc2VUaW1lICksXG4gICAgICBwZWVrKCBcbiAgICAgICAgYnVmZmVyRGF0YSxcbiAgICAgICAgcmVsZWFzZUFjY3VtLCBcbiAgICAgICAgLy9zdWIoICBzdXN0YWluTGV2ZWwsIG11bCggZGl2KCBzdWIoIHBoYXNlLCAgYXR0YWNrVGltZSArICBkZWNheVRpbWUgKyAgc3VzdGFpblRpbWUpLCAgcmVsZWFzZVRpbWUgKSwgIHN1c3RhaW5MZXZlbCApICksIFxuICAgICAgICB7IGJvdW5kbW9kZTonY2xhbXAnIH1cbiAgICAgICksXG5cbiAgICAgIDBcbiAgICApXG4gIC8vfVxuICAgXG4gIG91dC50cmlnZ2VyID0gKCk9PiB7XG4gICAgc2hvdWxkU3VzdGFpbi52YWx1ZSA9IDFcbiAgICBlbnZUcmlnZ2VyLnRyaWdnZXIoKVxuICB9XG5cbiAgb3V0LnJlbGVhc2UgPSAoKT0+IHtcbiAgICBzaG91bGRTdXN0YWluLnZhbHVlID0gMFxuICAgIC8vIFhYWCBwcmV0dHkgbmFzdHkuLi4gZ3JhYnMgYWNjdW0gaW5zaWRlIG9mIGd0cCBhbmQgcmVzZXRzIHZhbHVlIG1hbnVhbGx5XG4gICAgLy8gdW5mb3J0dW5hdGVseSBlbnZUcmlnZ2VyIHdvbid0IHdvcmsgYXMgaXQncyBiYWNrIHRvIDAgYnkgdGhlIHRpbWUgdGhlIHJlbGVhc2UgYmxvY2sgaXMgdHJpZ2dlcmVkLi4uXG4gICAgZ2VuLm1lbW9yeS5oZWFwWyByZWxlYXNlQWNjdW0uaW5wdXRzWzBdLmlucHV0c1sxXS5tZW1vcnkudmFsdWUuaWR4IF0gPSAwXG4gIH1cblxuICByZXR1cm4gb3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonYW5kJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBnZW4udmFyaWFibGVOYW1lcy5hZGQoIFt0aGlzLm5hbWUsICdmJ10gKVxuXG4gICAgb3V0ID0gYCAgJHt0aGlzLm5hbWV9ID0gKCgke2lucHV0c1swXX0gIT0gZnJvdW5kKDApKSArICgke2lucHV0c1sxXX0gIT0gZnJvdW5kKDApICkgPT0gZnJvdW5kKDIpICk7XFxuXFxuYFxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhc2luJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBnZW4udmFyaWFibGVOYW1lcy5hZGQoIFt0aGlzLm5hbWUsICdmJ10gKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAnYXNpbic6IE1hdGguYXNpbiB9KVxuXG4gICAgICBvdXQgPSBbIHRoaXMubmFtZSwgYCAgJHt0aGlzLm5hbWV9ID0gZnJvdW5kKCBhc2luKCAke2lucHV0c1swXX0gKSApO1xcbmAgXVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYXNpbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGFzaW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYXNpbi5pbnB1dHMgPSBbIHggXVxuICBhc2luLmlkID0gZ2VuLmdldFVJRCgpXG4gIGFzaW4ubmFtZSA9IGAke2FzaW4uYmFzZW5hbWV9JHthc2luLmlkfWBcblxuICByZXR1cm4gYXNpblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidhdGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG5cbiAgICBnZW4udmFyaWFibGVOYW1lcy5hZGQoIFt0aGlzLm5hbWUsICdmJ10gKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG5cbiAgICAgIG91dCA9IFsgdGhpcy5uYW1lLCBgICAke3RoaXMubmFtZX0gPSBmcm91bmQoIGF0YW4oICR7aW5wdXRzWzBdfSApICk7XFxuYCBdIFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguYXRhbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGF0YW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgYXRhbi5pbnB1dHMgPSBbIHggXVxuICBhdGFuLmlkID0gZ2VuLmdldFVJRCgpXG4gIGF0YW4ubmFtZSA9IGAke2F0YW4uYmFzZW5hbWV9JHthdGFuLmlkfWBcblxuICByZXR1cm4gYXRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIG11bCAgICAgPSByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggZGVjYXlUaW1lID0gNDQxMDAgKSA9PiB7XG4gIGxldCBzc2QgPSBoaXN0b3J5ICggMSApLFxuICAgICAgdDYwID0gTWF0aC5leHAoIC02LjkwNzc1NTI3ODkyMSAvIGRlY2F5VGltZSApXG5cbiAgc3NkLmluKCBtdWwoIHNzZC5vdXQsIHQ2MCApIClcblxuICBzc2Qub3V0LnRyaWdnZXIgPSAoKT0+IHtcbiAgICBzc2QudmFsdWUgPSAxXG4gIH1cblxuICByZXR1cm4gc3ViKCAxLCBzc2Qub3V0IClcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZCggWyB0aGlzLm5hbWUsICdpJ10gKVxuXG4gICAgbGV0IG91dCA9IFxuYCAgJHt0aGlzLm5hbWV9ID0gbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV07XG4gIGlmKCAke3RoaXMubmFtZX0gPT0gZnJvdW5kKDEpICkgbWVtb3J5WyR7dGhpcy5tZW1vcnkudmFsdWUuaWR4fV0gPSBmcm91bmQoMCk7XG5cbmBcbiAgICByZXR1cm4gWyB0aGlzLm5hbWUsIG91dCBdXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBfcHJvcHMgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKSxcbiAgICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgeyBtaW46MCwgbWF4OjEgfSwgX3Byb3BzIClcblxuICB1Z2VuLm5hbWUgPSAnYmFuZycgKyBnZW4uZ2V0VUlEKClcblxuICB1Z2VuLm1pbiA9IHByb3BzLm1pblxuICB1Z2VuLm1heCA9IHByb3BzLm1heFxuXG4gIHVnZW4udHJpZ2dlciA9ICgpID0+IHtcbiAgICBnZW4ubWVtb3J5LmhlYXBbIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCBdID0gdWdlbi5tYXggXG4gIH1cblxuICB1Z2VuLm1lbW9yeSA9IHtcbiAgICB2YWx1ZTogeyBsZW5ndGg6MSwgaWR4Om51bGwgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2Jvb2wnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZCggW3RoaXMubmFtZSwgJ2knXSApXG5cbiAgICBvdXQgPSBcbmAgIGlmKCAke2lucHV0c1swXX0gPT0gZnJvdW5kKDApICkge1xuICAgICR7dGhpcy5uYW1lfSA9ICAwO1xuICB9ZWxzZXtcbiAgICAke3RoaXMubmFtZX0gPSAxO1xuICB9XG5gXG4gICAgXG4gICAgLy9nZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgLy9yZXR1cm4gWyBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YCwgJyAnICtvdXQgXVxuICAgIHJldHVybiBbIHRoaXMubmFtZSwgb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NlaWwnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZCggWyB0aGlzLm5hbWUsICdmJyBdIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG5cbiAgICAgIG91dCA9IFsgdGhpcy5uYW1lLCBgICAke3RoaXMubmFtZX0gPSBjZWlsKCAke2lucHV0c1swXX0gKTtcXG5gXVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguY2VpbCggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNlaWwgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgY2VpbC5pbnB1dHMgPSBbIHggXVxuICBjZWlsLmlkID0gZ2VuLmdldFVJRCgpXG4gIGNlaWwubmFtZSA9IGNlaWwuYmFzZW5hbWUgKyBjZWlsLmlkIFxuXG4gIHJldHVybiBjZWlsXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIGZsb29yPSByZXF1aXJlKCcuL2Zsb29yLmpzJyksXG4gICAgc3ViICA9IHJlcXVpcmUoJy4vc3ViLmpzJyksXG4gICAgbWVtbyA9IHJlcXVpcmUoJy4vbWVtby5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NsaXAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXRcbiAgICBcbiAgICBnZW4udmFyaWFibGVOYW1lcy5hZGQoIFsgdGhpcy5uYW1lLCAnZicgXSApXG5cbiAgICBvdXQgPSBgICAke3RoaXMubmFtZX0gPSBmcm91bmQoIG1heCggbWluKCske2lucHV0c1swXX0sKyR7aW5wdXRzWzJdfSApLCArJHtpbnB1dHNbMV19ICkgKTtcXG5gIFxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49LTEsIG1heD0xICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbiwgXG4gICAgbWF4LFxuICAgIHVpZDogICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogWyBpbjEsIG1pbiwgbWF4IF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvcycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgZ2VuLnZhcmlhYmxlTmFtZXMuYWRkKCBbdGhpcy5uYW1lLCAnZiddIClcbiAgICBcbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuXG4gICAgICBvdXQgPSBbIHRoaXMubmFtZSwgYCAgJHt0aGlzLm5hbWV9ID0gY29zKCAke2lucHV0c1swXX0gKTtcXG5gIF1cblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmNvcyggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IGNvcyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBjb3MuaW5wdXRzID0gWyB4IF1cbiAgY29zLmlkID0gZ2VuLmdldFVJRCgpXG4gIGNvcy5uYW1lID0gYCR7Y29zLmJhc2VuYW1lfSR7Y29zLmlkfWBcblxuICByZXR1cm4gY29zXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2NvdW50ZXInLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29kZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBmdW5jdGlvbkJvZHlcbiAgICAgICBcbiAgICBnZW4udmFyaWFibGVOYW1lcy5hZGQoIFsgdGhpcy5uYW1lICsgJ192YWx1ZScsICdmJyBdIClcblxuICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggPT09IG51bGwgKSBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuXG4gICAgZnVuY3Rpb25Cb2R5ICA9IHRoaXMuY2FsbGJhY2soIFxuICAgICAgaW5wdXRzWzBdLCBcbiAgICAgIGlucHV0c1sxXSwgXG4gICAgICBpbnB1dHNbMl0sIFxuICAgICAgaW5wdXRzWzNdLCBcbiAgICAgIGlucHV0c1s0XSwgIFxuICAgICAgYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYCxcbiAgICAgIGBtZW1vcnlbJHt0aGlzLm1lbW9yeS53cmFwLmlkeH1dYFxuICAgIClcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGZ1bmN0aW9uQm9keVxuXG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLndyYXAubmFtZSBdID09PSB1bmRlZmluZWQgKSB0aGlzLndyYXAuZ2VuKClcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSArJ192YWx1ZScsIGZ1bmN0aW9uQm9keSBdXG4gIH0sXG5cbiAgY2FsbGJhY2soIF9pbmNyLCBfbWluLCBfbWF4LCBfcmVzZXQsIGxvb3BzLCB2YWx1ZVJlZiwgd3JhcFJlZiApIHtcbiAgICBsZXQgZGlmZiA9IHRoaXMubWF4IC0gdGhpcy5taW4sXG4gICAgICAgIG91dCAgPSAnJyxcbiAgICAgICAgd3JhcCA9ICcnXG4gICAgXG4gICAgLy8gbXVzdCBjaGVjayBmb3IgcmVzZXQgYmVmb3JlIHN0b3JpbmcgdmFsdWUgZm9yIG91dHB1dFxuICAgIGlmKCAhKHR5cGVvZiB0aGlzLmlucHV0c1szXSA9PT0gJ251bWJlcicgJiYgdGhpcy5pbnB1dHNbM10gPCAxKSApIHsgXG4gICAgICBvdXQgKz0gYCAgaWYoIGZyb3VuZCgke19yZXNldH0pID49IGZyb3VuZCgxKSApIGZyb3VuZCgke3ZhbHVlUmVmfSkgPSBmcm91bmQoJHtfbWlufSlcXG5gXG4gICAgfVxuXG4gICAgLy8gc3RvcmUgb3V0cHV0IHZhbHVlIGJlZm9yZSBhY2N1bXVsYXRpbmcgIFxuICAgIG91dCArPSBgICAke3RoaXMubmFtZX1fdmFsdWUgPSBmcm91bmQoJHt2YWx1ZVJlZn0pO1xcbiAgJHt2YWx1ZVJlZn0gPSBmcm91bmQoJHt2YWx1ZVJlZn0pICsgZnJvdW5kKCR7X2luY3J9KTtcXG5gXG4gICAgXG4gICAgaWYoIHR5cGVvZiB0aGlzLm1heCA9PT0gJ251bWJlcicgJiYgdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHR5cGVvZiB0aGlzLm1pbiAhPT0gJ251bWJlcicgKSB7XG5cbiAgICAgIHdyYXAgPSBcbmAgIGlmKCAoZnJvdW5kKCR7dmFsdWVSZWZ9KSA+PSBmcm91bmQoJHt0aGlzLm1heH0pICsgJHtsb29wc318MCAgKSA9PSAyfDAgKSB7XG4gICAgJHt2YWx1ZVJlZn0gLT0gZnJvdW5kKCR7ZGlmZn0pXG4gICAgJHt3cmFwUmVmfSA9IGZyb3VuZCgxKVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gZnJvdW5kKDApXG4gIH1cXG5gXG5cbiAgICB9ZWxzZSBpZiggdGhpcy5tYXggIT09IEluZmluaXR5ICYmIHRoaXMubWluICE9PSBJbmZpbml0eSApIHtcblxuICAgICAgd3JhcCA9IFxuYCAgaWYoICgoIGZyb3VuZCgke3ZhbHVlUmVmfSkgPj0gZnJvdW5kKCR7X21heH0pKSArICR7bG9vcHN9fDAgICkgPT0gMnwwICkge1xuICAgICR7dmFsdWVSZWZ9ID0gZnJvdW5kKCAke3ZhbHVlUmVmfSApIC0gZnJvdW5kKCBmcm91bmQoJHtfbWF4fSkgLSBmcm91bmQoJHtfbWlufSkgKTtcbiAgICAke3dyYXBSZWZ9ID0gZnJvdW5kKDEpXG4gICB9IGVsc2UgaWYoICgoIGZyb3VuZCgke3ZhbHVlUmVmfSApIDwgZnJvdW5kKCR7X21pbn0pKSArICR7bG9vcHN9fDAgICkgPT0gMnwwICApICB7XG4gICAgJHt2YWx1ZVJlZn0gPSBmcm91bmQoICR7dmFsdWVSZWZ9ICkgKyBmcm91bmQoIGZyb3VuZCgke19tYXh9KSAtIGZyb3VuZCgke19taW59KSApXG4gICAgJHt3cmFwUmVmfSA9IGZyb3VuZCgxKVxuICB9ZWxzZXtcbiAgICAke3dyYXBSZWZ9ID0gZnJvdW5kKDApXG4gIH1cXG5gXG5cbiAgICB9ZWxzZXtcbiAgICAgIG91dCArPSAnXFxuJ1xuICAgIH1cblxuICAgIG91dCA9IG91dCArIHdyYXBcblxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW5jcj0xLCBtaW49MCwgbWF4PUluZmluaXR5LCByZXNldD0wLCBsb29wcz0xLCAgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXRpYWxWYWx1ZTogMCB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIG1pbjogICAgbWluLCBcbiAgICBtYXg6ICAgIG1heCxcbiAgICB2YWx1ZTogIGRlZmF1bHRzLmluaXRpYWxWYWx1ZSxcbiAgICB1aWQ6ICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IFsgaW5jciwgbWluLCBtYXgsIHJlc2V0LCBsb29wcyBdLFxuICAgIG1lbW9yeToge1xuICAgICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9LFxuICAgICAgd3JhcDogIHsgbGVuZ3RoOjEsIGlkeDogbnVsbCB9IFxuICAgIH0sXG4gICAgd3JhcCA6IHtcbiAgICAgIGdlbigpIHsgXG4gICAgICAgIGlmKCB1Z2VuLm1lbW9yeS53cmFwLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICBnZW4ucmVxdWVzdE1lbW9yeSggdWdlbi5tZW1vcnkgKVxuICAgICAgICB9XG4gICAgICAgIGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgICAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgbWVtb3J5WyAke3VnZW4ubWVtb3J5LndyYXAuaWR4fSBdYFxuICAgICAgICByZXR1cm4gYG1lbW9yeVsgJHt1Z2VuLm1lbW9yeS53cmFwLmlkeH0gXWAgXG4gICAgICB9XG4gICAgfVxuICB9LFxuICBkZWZhdWx0cyApXG4gXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIFxuICB1Z2VuLndyYXAuaW5wdXRzID0gWyB1Z2VuIF1cbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcbiAgdWdlbi53cmFwLm5hbWUgPSB1Z2VuLm5hbWUgKyAnX3dyYXAnXG4gIHJldHVybiB1Z2VuXG59IFxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gICAgZGF0YSA9IHJlcXVpcmUoICcuL2RhdGEuanMnICksXG4gICAgcGVlayA9IHJlcXVpcmUoICcuL3BlZWsuanMnICksXG4gICAgbXVsICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBwaGFzb3I9cmVxdWlyZSggJy4vcGhhc29yLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonY3ljbGUnLFxuXG4gIGluaXRUYWJsZSgpIHsgICAgXG4gICAgbGV0IGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoIDEwMjQgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDAsIGwgPSBidWZmZXIubGVuZ3RoOyBpIDwgbDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSBNYXRoLnNpbiggKCBpIC8gbCApICogKCBNYXRoLlBJICogMiApIClcbiAgICB9XG5cbiAgICBnZW4uZ2xvYmFscy5jeWNsZSA9IGRhdGEoIGJ1ZmZlciwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9IClcbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCwgX3Byb3BzICkgPT4ge1xuICBpZiggdHlwZW9mIGdlbi5nbG9iYWxzLmN5Y2xlID09PSAndW5kZWZpbmVkJyApIHByb3RvLmluaXRUYWJsZSgpIFxuICBjb25zdCBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIHsgbWluOjAgfSwgX3Byb3BzIClcblxuICBjb25zdCB1Z2VuID0gcGVlayggZ2VuLmdsb2JhbHMuY3ljbGUsIHBoYXNvciggZnJlcXVlbmN5LCByZXNldCwgcHJvcHMgKSlcbiAgdWdlbi5uYW1lID0gJ2N5Y2xlJyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICB1dGlsaXRpZXMgPSByZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gIHBlZWsgPSByZXF1aXJlKCcuL3BlZWsuanMnKSxcbiAgcG9rZSA9IHJlcXVpcmUoJy4vcG9rZS5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J2RhdGEnLFxuICBnbG9iYWxzOiB7fSxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlkeFxuICAgIGlmKCBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGxldCB1Z2VuID0gdGhpc1xuICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5LCB0aGlzLmltbXV0YWJsZSApIFxuICAgICAgaWR4ID0gdGhpcy5tZW1vcnkudmFsdWVzLmlkeFxuICAgICAgdHJ5IHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwLnNldCggdGhpcy5idWZmZXIsIGlkeCApXG4gICAgICB9Y2F0Y2goIGUgKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCBlIClcbiAgICAgICAgdGhyb3cgRXJyb3IoICdlcnJvciB3aXRoIHJlcXVlc3QuIGFza2luZyBmb3IgJyArIHRoaXMuYnVmZmVyLmxlbmd0aCArJy4gY3VycmVudCBpbmRleDogJyArIGdlbi5tZW1vcnlJbmRleCArICcgb2YgJyArIGdlbi5tZW1vcnkuaGVhcC5sZW5ndGggKVxuICAgICAgfVxuICAgICAgLy9nZW4uZGF0YVsgdGhpcy5uYW1lIF0gPSB0aGlzXG4gICAgICAvL3JldHVybiAnZ2VuLm1lbW9yeScgKyB0aGlzLm5hbWUgKyAnLmJ1ZmZlcidcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGlkeFxuICAgIH1lbHNle1xuICAgICAgaWR4ID0gZ2VuLm1lbW9bIHRoaXMubmFtZSBdXG4gICAgfVxuICAgIGlkeCAqPSA0XG4gICAgcmV0dXJuIGlkeFxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggeCwgeT0xLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiwgYnVmZmVyLCBzaG91bGRMb2FkID0gZmFsc2VcbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydGllcy5nbG9iYWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF0gKSB7XG4gICAgICByZXR1cm4gZ2VuLmdsb2JhbHNbIHByb3BlcnRpZXMuZ2xvYmFsIF1cbiAgICB9XG4gIH1cblxuICBpZiggdHlwZW9mIHggPT09ICdudW1iZXInICkge1xuICAgIGlmKCB5ICE9PSAxICkge1xuICAgICAgYnVmZmVyID0gW11cbiAgICAgIGZvciggbGV0IGkgPSAwOyBpIDwgeTsgaSsrICkge1xuICAgICAgICBidWZmZXJbIGkgXSA9IG5ldyBGbG9hdDMyQXJyYXkoIHggKVxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggeCApXG4gICAgfVxuICB9ZWxzZSBpZiggQXJyYXkuaXNBcnJheSggeCApICkgeyAvLyEgKHggaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgKSApIHtcbiAgICBsZXQgc2l6ZSA9IHgubGVuZ3RoXG4gICAgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggc2l6ZSApXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSsrICkge1xuICAgICAgYnVmZmVyWyBpIF0gPSB4WyBpIF1cbiAgICB9XG4gIH1lbHNlIGlmKCB0eXBlb2YgeCA9PT0gJ3N0cmluZycgKSB7XG4gICAgYnVmZmVyID0geyBsZW5ndGg6IHkgPiAxID8geSA6IGdlbi5zYW1wbGVyYXRlICogNjAgfSAvLyBYWFggd2hhdD8/P1xuICAgIHNob3VsZExvYWQgPSB0cnVlXG4gIH1lbHNlIGlmKCB4IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ICkge1xuICAgIGJ1ZmZlciA9IHhcbiAgfVxuICBcbiAgdWdlbiA9IHsgXG4gICAgYnVmZmVyLFxuICAgIG5hbWU6IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpLFxuICAgIGRpbTogIGJ1ZmZlci5sZW5ndGgsIC8vIFhYWCBob3cgZG8gd2UgZHluYW1pY2FsbHkgYWxsb2NhdGUgdGhpcz9cbiAgICBjaGFubmVscyA6IDEsXG4gICAgZ2VuOiAgcHJvdG8uZ2VuLFxuICAgIG9ubG9hZDogbnVsbCxcbiAgICB0aGVuKCBmbmMgKSB7XG4gICAgICB1Z2VuLm9ubG9hZCA9IGZuY1xuICAgICAgcmV0dXJuIHVnZW5cbiAgICB9LFxuICAgIGltbXV0YWJsZTogcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnRpZXMuaW1tdXRhYmxlID09PSB0cnVlID8gdHJ1ZSA6IGZhbHNlLFxuICAgIGxvYWQoIGZpbGVuYW1lICkge1xuICAgICAgbGV0IHByb21pc2UgPSB1dGlsaXRpZXMubG9hZFNhbXBsZSggZmlsZW5hbWUsIHVnZW4gKVxuICAgICAgcHJvbWlzZS50aGVuKCAoIF9idWZmZXIgKT0+IHsgXG4gICAgICAgIHVnZW4ubWVtb3J5LnZhbHVlcy5sZW5ndGggPSB1Z2VuLmRpbSA9IF9idWZmZXIubGVuZ3RoICAgICBcbiAgICAgICAgdWdlbi5vbmxvYWQoKSBcbiAgICAgIH0pXG4gICAgfSxcbiAgfVxuXG4gIHVnZW4ubWVtb3J5ID0ge1xuICAgIHZhbHVlczogeyBsZW5ndGg6dWdlbi5kaW0sIGlkeDpudWxsIH1cbiAgfVxuXG4gIGdlbi5uYW1lID0gJ2RhdGEnICsgZ2VuLmdldFVJRCgpXG5cbiAgaWYoIHNob3VsZExvYWQgKSB1Z2VuLmxvYWQoIHggKVxuICBcbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIHtcbiAgICBpZiggcHJvcGVydGllcy5nbG9iYWwgIT09IHVuZGVmaW5lZCApIHtcbiAgICAgIGdlbi5nbG9iYWxzWyBwcm9wZXJ0aWVzLmdsb2JhbCBdID0gdWdlblxuICAgIH1cbiAgICBpZiggcHJvcGVydGllcy5tZXRhID09PSB0cnVlICkge1xuICAgICAgZm9yKCBsZXQgaSA9IDAsIGxlbmd0aCA9IHVnZW4uYnVmZmVyLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrICkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sIGksIHtcbiAgICAgICAgICBnZXQgKCkge1xuICAgICAgICAgICAgcmV0dXJuIHBlZWsoIHVnZW4sIGksIHsgbW9kZTonc2ltcGxlJywgaW50ZXJwOidub25lJyB9IClcbiAgICAgICAgICB9LFxuICAgICAgICAgIHNldCggdiApIHtcbiAgICAgICAgICAgIHJldHVybiBwb2tlKCB1Z2VuLCB2LCBpIClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgeDEgPSBoaXN0b3J5KCksXG4gICAgICB5MSA9IGhpc3RvcnkoKSxcbiAgICAgIGZpbHRlclxuXG4gIC8vSGlzdG9yeSB4MSwgeTE7IHkgPSBpbjEgLSB4MSArIHkxKjAuOTk5NzsgeDEgPSBpbjE7IHkxID0geTsgb3V0MSA9IHk7XG4gIGZpbHRlciA9IG1lbW8oIGFkZCggc3ViKCBpbjEsIHgxLm91dCApLCBtdWwoIHkxLm91dCwgLjk5OTcgKSApIClcbiAgeDEuaW4oIGluMSApXG4gIHkxLmluKCBmaWx0ZXIgKVxuXG4gIHJldHVybiBmaWx0ZXJcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHQ2MCAgICAgPSByZXF1aXJlKCAnLi90NjAuanMnIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIGRlY2F5VGltZSA9IDQ0MTAwLCBwcm9wcyApID0+IHtcbiAgbGV0IHByb3BlcnRpZXMgPSBPYmplY3QuYXNzaWduKHt9LCB7IGluaXRWYWx1ZToxIH0sIHByb3BzICksXG4gICAgICBzc2QgPSBoaXN0b3J5ICggcHJvcGVydGllcy5pbml0VmFsdWUgKVxuXG4gIHNzZC5pbiggbXVsKCBzc2Qub3V0LCB0NjAoIGRlY2F5VGltZSApICkgKVxuXG4gIHNzZC5vdXQudHJpZ2dlciA9ICgpPT4ge1xuICAgIHNzZC52YWx1ZSA9IDFcbiAgfVxuXG4gIHJldHVybiBzc2Qub3V0IFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyAgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwb2tlID0gcmVxdWlyZSggJy4vcG9rZS5qcycgKSxcbiAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBzdWIgID0gcmVxdWlyZSggJy4vc3ViLmpzJyAgKSxcbiAgICB3cmFwID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKSxcbiAgICBhY2N1bT0gcmVxdWlyZSggJy4vYWNjdW0uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidkZWxheScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBpbnB1dHNbMF1cbiAgICBcbiAgICByZXR1cm4gaW5wdXRzWzBdXG4gIH0sXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHRpbWU9MjU2LCAuLi50YXBzQW5kUHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IHNpemU6IDUxMiwgZmVlZGJhY2s6MCwgaW50ZXJwOidsaW5lYXInIH0sXG4gICAgICB3cml0ZUlkeCwgcmVhZElkeCwgZGVsYXlkYXRhLCBwcm9wZXJ0aWVzLCB0YXBUaW1lcyA9IFsgdGltZSBdLCB0YXBzXG4gIFxuICBpZiggQXJyYXkuaXNBcnJheSggdGFwc0FuZFByb3BlcnRpZXMgKSApIHtcbiAgICBwcm9wZXJ0aWVzID0gdGFwc0FuZFByb3BlcnRpZXNbIHRhcHNBbmRQcm9wZXJ0aWVzLmxlbmd0aCAtIDEgXVxuICAgIGlmKCB0YXBzQW5kUHJvcGVydGllcy5sZW5ndGggPiAxICkge1xuICAgICAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0YXBzQW5kUHJvcGVydGllcy5sZW5ndGggLSAxOyBpKysgKXtcbiAgICAgICAgdGFwVGltZXMucHVzaCggdGFwc0FuZFByb3BlcnRpZXNbIGkgXSApXG4gICAgICB9XG4gICAgfVxuICB9ZWxzZXtcbiAgICBwcm9wZXJ0aWVzID0gdGFwc0FuZFByb3BlcnRpZXNcbiAgfVxuXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgaWYoIGRlZmF1bHRzLnNpemUgPCB0aW1lICkgZGVmYXVsdHMuc2l6ZSA9IHRpbWVcblxuICBkZWxheWRhdGEgPSBkYXRhKCBkZWZhdWx0cy5zaXplIClcbiAgXG4gIHVnZW4uaW5wdXRzID0gW11cblxuICB3cml0ZUlkeCA9IGFjY3VtKCAxLCAwLCB7IG1heDpkZWZhdWx0cy5zaXplIH0pIFxuICBcbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCB0YXBUaW1lcy5sZW5ndGg7IGkrKyApIHtcbiAgICB1Z2VuLmlucHV0c1sgaSBdID0gcGVlayggZGVsYXlkYXRhLCB3cmFwKCBzdWIoIHdyaXRlSWR4LCB0YXBUaW1lc1tpXSApLCAwLCBkZWZhdWx0cy5zaXplICkseyBtb2RlOidzYW1wbGVzJywgaW50ZXJwOmRlZmF1bHRzLmludGVycCB9KVxuICB9XG4gIFxuICB1Z2VuLm91dHB1dHMgPSB1Z2VuLmlucHV0cyAvLyB1Z24sIFVnaCwgVUdIISBidXQgaSBndWVzcyBpdCB3b3Jrcy5cblxuICBwb2tlKCBkZWxheWRhdGEsIGluMSwgd3JpdGVJZHggKVxuXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgICAgPSByZXF1aXJlKCAnLi9nZW4uanMnICksXG4gICAgaGlzdG9yeSA9IHJlcXVpcmUoICcuL2hpc3RvcnkuanMnICksXG4gICAgc3ViICAgICA9IHJlcXVpcmUoICcuL3N1Yi5qcycgKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xICkgPT4ge1xuICBsZXQgbjEgPSBoaXN0b3J5KClcbiAgICBcbiAgbjEuaW4oIGluMSApXG5cbiAgbGV0IHVnZW4gPSBzdWIoIGluMSwgbjEub3V0IClcbiAgdWdlbi5uYW1lID0gJ2RlbHRhJytnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IGRpdiA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICAgIGRpdkF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgLyB2XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9IC8gJHt2fWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnIC8gJyBcbiAgICAgIH0pXG5cbiAgICAgIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIGRpdlxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuJyApLFxuICAgIHdpbmRvd3MgPSByZXF1aXJlKCAnLi93aW5kb3dzJyApLFxuICAgIGRhdGEgICAgPSByZXF1aXJlKCAnLi9kYXRhJyApLFxuICAgIHBlZWsgICAgPSByZXF1aXJlKCAnLi9wZWVrJyApLFxuICAgIHBoYXNvciAgPSByZXF1aXJlKCAnLi9waGFzb3InIClcblxubW9kdWxlLmV4cG9ydHMgPSAoIHR5cGU9J3RyaWFuZ3VsYXInLCBsZW5ndGg9MTAyNCwgYWxwaGE9LjE1LCBzaGlmdD0wICkgPT4ge1xuICBsZXQgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSggbGVuZ3RoIClcblxuICBsZXQgbmFtZSA9IHR5cGUgKyAnXycgKyBsZW5ndGggKyAnXycgKyBzaGlmdFxuICBpZiggdHlwZW9mIGdlbi5nbG9iYWxzLndpbmRvd3NbIG5hbWUgXSA9PT0gJ3VuZGVmaW5lZCcgKSB7IFxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKyApIHtcbiAgICAgIGJ1ZmZlclsgaSBdID0gd2luZG93c1sgdHlwZSBdKCBsZW5ndGgsIGksIGFscGhhLCBzaGlmdCApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdID0gZGF0YSggYnVmZmVyIClcbiAgfVxuXG4gIGxldCB1Z2VuID0gZ2VuLmdsb2JhbHMud2luZG93c1sgbmFtZSBdIFxuICB1Z2VuLm5hbWUgPSAnZW52JyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidlcScsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dFxuXG4gICAgb3V0ID0gdGhpcy5pbnB1dHNbMF0gPT09IHRoaXMuaW5wdXRzWzFdID8gMSA6IGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ID09PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1gXG5cbiAgICByZXR1cm4gWyBgJHt0aGlzLm5hbWV9YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBpbjIgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidmbG9vcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIC8vZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IE1hdGguZmxvb3IgfSlcblxuICAgICAgb3V0ID0gYCggJHtpbnB1dHNbMF19IHwgMCApYFxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IGlucHV0c1swXSB8IDBcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBmbG9vciA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBmbG9vci5pbnB1dHMgPSBbIHggXVxuXG4gIHJldHVybiBmbG9vclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidmb2xkJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgb3V0XG5cbiAgICBvdXQgPSB0aGlzLmNyZWF0ZUNhbGxiYWNrKCBpbnB1dHNbMF0sIHRoaXMubWluLCB0aGlzLm1heCApIFxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lICsgJ192YWx1ZSdcblxuICAgIHJldHVybiBbIHRoaXMubmFtZSArICdfdmFsdWUnLCBvdXQgXVxuICB9LFxuXG4gIGNyZWF0ZUNhbGxiYWNrKCB2LCBsbywgaGkgKSB7XG4gICAgbGV0IG91dCA9XG5gIHZhciAke3RoaXMubmFtZX1fdmFsdWUgPSAke3Z9LFxuICAgICAgJHt0aGlzLm5hbWV9X3JhbmdlID0gJHtoaX0gLSAke2xvfSxcbiAgICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcyA9IDBcblxuICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSAtPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPj0gJHtoaX0pe1xuICAgICAgJHt0aGlzLm5hbWV9X251bVdyYXBzID0gKCgke3RoaXMubmFtZX1fdmFsdWUgLSAke2xvfSkgLyAke3RoaXMubmFtZX1fcmFuZ2UpIHwgMFxuICAgICAgJHt0aGlzLm5hbWV9X3ZhbHVlIC09ICR7dGhpcy5uYW1lfV9yYW5nZSAqICR7dGhpcy5uYW1lfV9udW1XcmFwc1xuICAgIH1cbiAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMrK1xuICB9IGVsc2UgaWYoJHt0aGlzLm5hbWV9X3ZhbHVlIDwgJHtsb30pe1xuICAgICR7dGhpcy5uYW1lfV92YWx1ZSArPSAke3RoaXMubmFtZX1fcmFuZ2VcbiAgICBpZigke3RoaXMubmFtZX1fdmFsdWUgPCAke2xvfSl7XG4gICAgICAke3RoaXMubmFtZX1fbnVtV3JhcHMgPSAoKCR7dGhpcy5uYW1lfV92YWx1ZSAtICR7bG99KSAvICR7dGhpcy5uYW1lfV9yYW5nZS0gMSkgfCAwXG4gICAgICAke3RoaXMubmFtZX1fdmFsdWUgLT0gJHt0aGlzLm5hbWV9X3JhbmdlICogJHt0aGlzLm5hbWV9X251bVdyYXBzXG4gICAgfVxuICAgICR7dGhpcy5uYW1lfV9udW1XcmFwcy0tXG4gIH1cbiAgaWYoJHt0aGlzLm5hbWV9X251bVdyYXBzICYgMSkgJHt0aGlzLm5hbWV9X3ZhbHVlID0gJHtoaX0gKyAke2xvfSAtICR7dGhpcy5uYW1lfV92YWx1ZVxuYFxuICAgIHJldHVybiAnICcgKyBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonZ2F0ZScsXG4gIGNvbnRyb2xTdHJpbmc6bnVsbCwgLy8gaW5zZXJ0IGludG8gb3V0cHV0IGNvZGVnZW4gZm9yIGRldGVybWluaW5nIGluZGV4aW5nXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcbiAgICBcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGxldCBsYXN0SW5wdXRNZW1vcnlJZHggPSAnbWVtb3J5WyAnICsgdGhpcy5tZW1vcnkubGFzdElucHV0LmlkeCArICcgXScsXG4gICAgICAgIG91dHB1dE1lbW9yeVN0YXJ0SWR4ID0gdGhpcy5tZW1vcnkubGFzdElucHV0LmlkeCArIDEsXG4gICAgICAgIGlucHV0U2lnbmFsID0gaW5wdXRzWzBdLFxuICAgICAgICBjb250cm9sU2lnbmFsID0gaW5wdXRzWzFdXG4gICAgXG4gICAgLyogXG4gICAgICogd2UgY2hlY2sgdG8gc2VlIGlmIHRoZSBjdXJyZW50IGNvbnRyb2wgaW5wdXRzIGVxdWFscyBvdXIgbGFzdCBpbnB1dFxuICAgICAqIGlmIHNvLCB3ZSBzdG9yZSB0aGUgc2lnbmFsIGlucHV0IGluIHRoZSBtZW1vcnkgYXNzb2NpYXRlZCB3aXRoIHRoZSBjdXJyZW50bHlcbiAgICAgKiBzZWxlY3RlZCBpbmRleC4gSWYgbm90LCB3ZSBwdXQgMCBpbiB0aGUgbWVtb3J5IGFzc29jaWF0ZWQgd2l0aCB0aGUgbGFzdCBzZWxlY3RlZCBpbmRleCxcbiAgICAgKiBjaGFuZ2UgdGhlIHNlbGVjdGVkIGluZGV4LCBhbmQgdGhlbiBzdG9yZSB0aGUgc2lnbmFsIGluIHB1dCBpbiB0aGUgbWVtZXJ5IGFzc29pY2F0ZWRcbiAgICAgKiB3aXRoIHRoZSBuZXdseSBzZWxlY3RlZCBpbmRleFxuICAgICAqL1xuICAgIFxuICAgIG91dCA9XG5cbmAgaWYoICR7Y29udHJvbFNpZ25hbH0gIT09ICR7bGFzdElucHV0TWVtb3J5SWR4fSApIHtcbiAgICBtZW1vcnlbICR7bGFzdElucHV0TWVtb3J5SWR4fSArICR7b3V0cHV0TWVtb3J5U3RhcnRJZHh9ICBdID0gMCBcbiAgICAke2xhc3RJbnB1dE1lbW9yeUlkeH0gPSAke2NvbnRyb2xTaWduYWx9XG4gIH1cbiAgbWVtb3J5WyAke291dHB1dE1lbW9yeVN0YXJ0SWR4fSArICR7Y29udHJvbFNpZ25hbH0gXSA9ICR7aW5wdXRTaWduYWx9XG5cbmBcbiAgICB0aGlzLmNvbnRyb2xTdHJpbmcgPSBpbnB1dHNbMV1cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICB0aGlzLm91dHB1dHMuZm9yRWFjaCggdiA9PiB2LmdlbigpIClcblxuICAgIHJldHVybiBbIG51bGwsICcgJyArIG91dCBdXG4gIH0sXG5cbiAgY2hpbGRnZW4oKSB7XG4gICAgaWYoIHRoaXMucGFyZW50LmluaXRpYWxpemVkID09PSBmYWxzZSApIHtcbiAgICAgIGdlbi5nZXRJbnB1dHMoIHRoaXMgKSAvLyBwYXJlbnQgZ2F0ZSBpcyBvbmx5IGlucHV0IG9mIGEgZ2F0ZSBvdXRwdXQsIHNob3VsZCBvbmx5IGJlIGdlbidkIG9uY2UuXG4gICAgfVxuXG4gICAgaWYoIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcblxuICAgICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVsgJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9IF1gXG4gICAgfVxuICAgIFxuICAgIHJldHVybiAgYG1lbW9yeVsgJHt0aGlzLm1lbW9yeS52YWx1ZS5pZHh9IF1gXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGNvbnRyb2wsIGluMSwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGNvdW50OiAyIH1cblxuICBpZiggdHlwZW9mIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgb3V0cHV0czogW10sXG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgaW4xLCBjb250cm9sIF0sXG4gICAgbWVtb3J5OiB7XG4gICAgICBsYXN0SW5wdXQ6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgICB9LFxuICAgIGluaXRpYWxpemVkOmZhbHNlXG4gIH0sXG4gIGRlZmF1bHRzIClcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHtnZW4uZ2V0VUlEKCl9YFxuXG4gIGZvciggbGV0IGkgPSAwOyBpIDwgdWdlbi5jb3VudDsgaSsrICkge1xuICAgIHVnZW4ub3V0cHV0cy5wdXNoKHtcbiAgICAgIGluZGV4OmksXG4gICAgICBnZW46IHByb3RvLmNoaWxkZ2VuLFxuICAgICAgcGFyZW50OnVnZW4sXG4gICAgICBpbnB1dHM6IFsgdWdlbiBdLFxuICAgICAgbWVtb3J5OiB7XG4gICAgICAgIHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6bnVsbCB9XG4gICAgICB9LFxuICAgICAgaW5pdGlhbGl6ZWQ6ZmFsc2UsXG4gICAgICBuYW1lOiBgJHt1Z2VuLm5hbWV9X291dCR7Z2VuLmdldFVJRCgpfWBcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG4vKiBnZW4uanNcbiAqXG4gKiBsb3ctbGV2ZWwgY29kZSBnZW5lcmF0aW9uIGZvciB1bml0IGdlbmVyYXRvcnNcbiAqXG4gKi9cblxubGV0IE1lbW9yeUhlbHBlciA9IHJlcXVpcmUoICdtZW1vcnktaGVscGVyJyApXG5cbmxldCBidWYgPSBuZXcgQXJyYXlCdWZmZXIoIDB4MTAwMDAgKVxuXG5sZXQgZ2VuID0ge1xuXG4gIGFjY3VtOjAsXG4gIGdldFVJRCgpIHsgcmV0dXJuIHRoaXMuYWNjdW0rKyB9LFxuICBkZWJ1ZzpmYWxzZSxcbiAgc2FtcGxlcmF0ZTogNDQxMDAsIC8vIGNoYW5nZSBvbiBhdWRpb2NvbnRleHQgY3JlYXRpb25cbiAgc2hvdWxkTG9jYWxpemU6IGZhbHNlLFxuICBnbG9iYWxzOntcbiAgICB3aW5kb3dzOiB7fSxcbiAgfSxcbiAgYXJyYXlCdWZmZXI6bnVsbCxcbiAgXG4gIC8qIGNsb3N1cmVzXG4gICAqXG4gICAqIEZ1bmN0aW9ucyB0aGF0IGFyZSBpbmNsdWRlZCBhcyBhcmd1bWVudHMgdG8gbWFzdGVyIGNhbGxiYWNrLiBFeGFtcGxlczogTWF0aC5hYnMsIE1hdGgucmFuZG9tIGV0Yy5cbiAgICogWFhYIFNob3VsZCBwcm9iYWJseSBiZSByZW5hbWVkIGNhbGxiYWNrUHJvcGVydGllcyBvciBzb21ldGhpbmcgc2ltaWxhci4uLiBjbG9zdXJlcyBhcmUgbm8gbG9uZ2VyIHVzZWQuXG4gICAqL1xuXG4gIGNsb3N1cmVzOiBuZXcgU2V0KCksXG4gIHBhcmFtczogICBuZXcgU2V0KCksXG4gIHZhcmlhYmxlTmFtZXM6IG5ldyBTZXQoKSxcblxuICBwYXJhbWV0ZXJzOltdLFxuICBlbmRCbG9jazogbmV3IFNldCgpLFxuICBoaXN0b3JpZXM6IG5ldyBNYXAoKSxcblxuICBtZW1vOiB7fSxcblxuICBkYXRhOiB7fSxcblxuICBhcnJheUJ1ZmZlcjogYnVmLFxuICBtZW1vcnk6IE1lbW9yeUhlbHBlci5jcmVhdGUoIGJ1ZiApLFxuICBcbiAgLyogZXhwb3J0XG4gICAqXG4gICAqIHBsYWNlIGdlbiBmdW5jdGlvbnMgaW50byBhbm90aGVyIG9iamVjdCBmb3IgZWFzaWVyIHJlZmVyZW5jZVxuICAgKi9cblxuICBleHBvcnQoIG9iaiApIHt9LFxuXG4gIGFkZFRvRW5kQmxvY2soIHYgKSB7XG4gICAgdGhpcy5lbmRCbG9jay5hZGQoICcgICcgKyB2IClcbiAgfSxcbiAgXG4gIHJlcXVlc3RNZW1vcnkoIG1lbW9yeVNwZWMsIGltbXV0YWJsZT1mYWxzZSApIHtcbiAgICBmb3IoIGxldCBrZXkgaW4gbWVtb3J5U3BlYyApIHtcbiAgICAgIGxldCByZXF1ZXN0ID0gbWVtb3J5U3BlY1sga2V5IF1cblxuICAgICAgcmVxdWVzdC5pZHggPSBnZW4ubWVtb3J5LmFsbG9jKCByZXF1ZXN0Lmxlbmd0aCwgaW1tdXRhYmxlIClcbiAgICB9XG4gIH0sXG5cbiAgLyogY3JlYXRlQ2FsbGJhY2tcbiAgICpcbiAgICogcGFyYW0gdWdlbiAtIEhlYWQgb2YgZ3JhcGggdG8gYmUgY29kZWdlbidkXG4gICAqXG4gICAqIEdlbmVyYXRlIGNhbGxiYWNrIGZ1bmN0aW9uIGZvciBhIHBhcnRpY3VsYXIgdWdlbiBncmFwaC5cbiAgICogVGhlIGdlbi5jbG9zdXJlcyBwcm9wZXJ0eSBzdG9yZXMgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZVxuICAgKiBwYXNzZWQgYXMgYXJndW1lbnRzIHRvIHRoZSBmaW5hbCBmdW5jdGlvbjsgdGhlc2UgYXJlIHByZWZpeGVkXG4gICAqIGJlZm9yZSBhbnkgZGVmaW5lZCBwYXJhbXMgdGhlIGdyYXBoIGV4cG9zZXMuIEZvciBleGFtcGxlLCBnaXZlbjpcbiAgICpcbiAgICogZ2VuLmNyZWF0ZUNhbGxiYWNrKCBhYnMoIHBhcmFtKCkgKSApXG4gICAqXG4gICAqIC4uLiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHdpbGwgaGF2ZSBhIHNpZ25hdHVyZSBvZiAoIGFicywgcDAgKS5cbiAgICovXG4gIFxuICBjcmVhdGVDYWxsYmFjayggdWdlbiwgbWVtLCBkZWJ1ZyA9IGZhbHNlLCBzaG91bGRJbmxpbmVNZW1vcnk9ZmFsc2UgKSB7XG4gICAgbGV0IGlzU3RlcmVvID0gQXJyYXkuaXNBcnJheSggdWdlbiApICYmIHVnZW4ubGVuZ3RoID4gMSxcbiAgICAgICAgY2FsbGJhY2ssIFxuICAgICAgICBjaGFubmVsMSwgY2hhbm5lbDJcblxuICAgIGlmKCB0eXBlb2YgbWVtID09PSAnbnVtYmVyJyB8fCBtZW0gPT09IHVuZGVmaW5lZCApIHtcbiAgICAgIC8vdGhpcy5hcnJheUJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlciggMHgxMDAwMCApICBcbiAgICAgIC8vbWVtID0gTWVtb3J5SGVscGVyLmNyZWF0ZSggbWVtIClcbiAgICAgIC8vIGNyZWF0ZSBzdGVyZW8gb3V0cHV0IHRoYXQgY2Fubm90IGJlIG92ZXJ3cml0dGVuXG4gICAgICAvL21lbS5hbGxvYyggMiwgdHJ1ZSApXG4gICAgfVxuICAgIFxuICAgIC8vY29uc29sZS5sb2coICdjYiBtZW1vcnk6JywgbWVtIClcbiAgICAvL3RoaXMubWVtb3J5ID0gbWVtXG4gICAgdGhpcy5tZW1vcnkuYWxsb2MoIDIsIHRydWUgKVxuICAgIHRoaXMubWVtbyA9IHt9IFxuICAgIHRoaXMuZW5kQmxvY2suY2xlYXIoKVxuICAgIHRoaXMuY2xvc3VyZXMuY2xlYXIoKVxuICAgIHRoaXMudmFyaWFibGVOYW1lcy5jbGVhcigpXG4gICAgdGhpcy5wYXJhbXMuY2xlYXIoKVxuICAgIC8vdGhpcy5nbG9iYWxzID0geyB3aW5kb3dzOnt9IH1cbiAgICBcbiAgICB0aGlzLnBhcmFtZXRlcnMubGVuZ3RoID0gMFxuICAgIFxuICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gJ1xcbic7XG4gICAgLy90aGlzLmZ1bmN0aW9uQm9keSA9IFwiICAndXNlIGFzbSdcXG5cIlxuICAgIC8vaWYoIHNob3VsZElubGluZU1lbW9yeT09PWZhbHNlICkgdGhpcy5mdW5jdGlvbkJvZHkgKz0gXCIgIHZhciBtZW1vcnkgPSBnZW4ubWVtb3J5XFxuXFxuXCIgXG5cbiAgICAvLyBjYWxsIC5nZW4oKSBvbiB0aGUgaGVhZCBvZiB0aGUgZ3JhcGggd2UgYXJlIGdlbmVyYXRpbmcgdGhlIGNhbGxiYWNrIGZvclxuICAgIC8vY29uc29sZS5sb2coICdIRUFEJywgdWdlbiApXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCAxICsgaXNTdGVyZW87IGkrKyApIHtcbiAgICAgIGlmKCB0eXBlb2YgdWdlbltpXSA9PT0gJ251bWJlcicgKSBjb250aW51ZVxuXG4gICAgICBsZXQgY2hhbm5lbCA9IGlzU3RlcmVvID8gdWdlbltpXS5nZW4oKSA6IHVnZW4uZ2VuKCksXG4gICAgICAgICAgYm9keSA9ICcnXG5cblxuICAgICAgLy8gaWYgLmdlbigpIHJldHVybnMgYXJyYXksIGFkZCB1Z2VuIGNhbGxiYWNrIChncmFwaE91dHB1dFsxXSkgdG8gb3VyIG91dHB1dCBmdW5jdGlvbnMgYm9keVxuICAgICAgLy8gYW5kIHRoZW4gcmV0dXJuIG5hbWUgb2YgdWdlbi4gSWYgLmdlbigpIG9ubHkgZ2VuZXJhdGVzIGEgbnVtYmVyIChmb3IgcmVhbGx5IHNpbXBsZSBncmFwaHMpXG4gICAgICAvLyBqdXN0IHJldHVybiB0aGF0IG51bWJlciAoZ3JhcGhPdXRwdXRbMF0pLlxuICAgICAgYm9keSArPSBBcnJheS5pc0FycmF5KCBjaGFubmVsICkgPyBjaGFubmVsWzFdICsgJ1xcbicgKyBjaGFubmVsWzBdIDogY2hhbm5lbFxuXG4gICAgICAvLyBzcGxpdCBib2R5IHRvIGluamVjdCByZXR1cm4ga2V5d29yZCBvbiBsYXN0IGxpbmVcbiAgICAgIGJvZHkgPSBib2R5LnNwbGl0KCdcXG4nKVxuXG4gICAgICAvL2lmKCBkZWJ1ZyApIGNvbnNvbGUubG9nKCAnZnVuY3Rpb25Cb2R5IGxlbmd0aCcsIGJvZHkgKVxuICAgICAgXG4gICAgICAvLyBuZXh0IGxpbmUgaXMgdG8gYWNjb21tb2RhdGUgbWVtbyBhcyBncmFwaCBoZWFkXG4gICAgICBpZiggYm9keVsgYm9keS5sZW5ndGggLTEgXS50cmltKCkuaW5kZXhPZignbGV0JykgPiAtMSApIHsgYm9keS5wdXNoKCAnXFxuJyApIH0gXG5cbiAgICAgIC8vIGdldCBpbmRleCBvZiBsYXN0IGxpbmVcbiAgICAgIGxldCBsYXN0aWR4ID0gYm9keS5sZW5ndGggLSAxXG5cbiAgICAgIC8vIGluc2VydCByZXR1cm4ga2V5d29yZFxuICAgICAgLy9ib2R5WyBsYXN0aWR4IF0gPSAnICBnZW4ub3V0WycgKyBpICsgJ10gID0gJyArIGJvZHlbIGxhc3RpZHggXSArICdcXG4nXG4gICAgICBib2R5WyBsYXN0aWR4IF0gPSAnICBtZW1vcnlbICcgKyBpICsgJyA+PiAyIF0gID0gZnJvdW5kKCcgKyBib2R5WyBsYXN0aWR4IF0gKyAnKTtcXG5cXG4nXG5cbiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ICs9IGJvZHkuam9pbignXFxuJylcblxuICAgIH1cblxuICAgIGZvciggbGV0IHZhcmlhYmxlIG9mIHRoaXMudmFyaWFibGVOYW1lcy52YWx1ZXMoKSApIHtcbiAgICAgIGNvbnN0IHZhcmlhYmxlVHlwZSA9IHZhcmlhYmxlWzFdLCBuYW1lID0gdmFyaWFibGVbMF1cblxuICAgICAgc3dpdGNoKCB2YXJpYWJsZVR5cGUgKSB7XG4gICAgICAgIGNhc2UgJ2YnOlxuICAgICAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gYCAgdmFyICR7bmFtZX0gPSBmcm91bmQoMCk7XFxuYCArIHRoaXMuZnVuY3Rpb25Cb2R5XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2knOlxuICAgICAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5ID0gYCAgdmFyICR7bmFtZX0gPSAwO1xcbmAgKyB0aGlzLmZ1bmN0aW9uQm9keVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICB0aGlzLmZ1bmN0aW9uQm9keSA9IGAgIHZhciAke25hbWV9ID0gMC4wO1xcbmAgKyB0aGlzLmZ1bmN0aW9uQm9keVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gXG5cbiAgICB0aGlzLmhpc3Rvcmllcy5mb3JFYWNoKCB2YWx1ZSA9PiB7XG4gICAgICBpZiggdmFsdWUgIT09IG51bGwgKVxuICAgICAgICB2YWx1ZS5nZW4oKSAgICAgIFxuICAgIH0pXG5cbi8qXG4gKiAgICBsZXQgcmV0dXJuU3RhdGVtZW50ID0gaXNTdGVyZW8gPyAnICByZXR1cm4gZ2VuLm91dCcgOiAnICByZXR1cm4gZ2VuLm91dFswXSdcbiAqICAgIFxuICogICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5zcGxpdCgnXFxuJylcbiAqXG4gKiAgICBpZiggdGhpcy5lbmRCbG9jay5zaXplICkgeyBcbiAqICAgICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5jb25jYXQoIEFycmF5LmZyb20oIHRoaXMuZW5kQmxvY2sgKSApXG4gKiAgICAgIHRoaXMuZnVuY3Rpb25Cb2R5LnB1c2goIHJldHVyblN0YXRlbWVudCApXG4gKiAgICB9ZWxzZXtcbiAqICAgICAgdGhpcy5mdW5jdGlvbkJvZHkucHVzaCggcmV0dXJuU3RhdGVtZW50IClcbiAqICAgIH1cbiAqICAgIC8vIHJlYXNzZW1ibGUgZnVuY3Rpb24gYm9keVxuICogICAgdGhpcy5mdW5jdGlvbkJvZHkgPSB0aGlzLmZ1bmN0aW9uQm9keS5qb2luKCdcXG4nKVxuICovXG5cbiAgICAvLyB3ZSBjYW4gb25seSBkeW5hbWljYWxseSBjcmVhdGUgYSBuYW1lZCBmdW5jdGlvbiBieSBkeW5hbWljYWxseSBjcmVhdGluZyBhbm90aGVyIGZ1bmN0aW9uXG4gICAgLy8gdG8gY29uc3RydWN0IHRoZSBuYW1lZCBmdW5jdGlvbiEgc2hlZXNoLi4uXG4gICAgLy9cbiAgICBpZiggc2hvdWxkSW5saW5lTWVtb3J5ID09PSB0cnVlICkge1xuICAgICAgdGhpcy5wYXJhbWV0ZXJzLnB1c2goICdtZW1vcnknIClcbiAgICB9XG4gICAgLy9sZXQgYnVpbGRTdHJpbmcgPSBgcmV0dXJuIGZ1bmN0aW9uIGdlbiggJHsgdGhpcy5wYXJhbWV0ZXJzLmpvaW4oJywnKSB9ICl7IFxcbiR7IHRoaXMuZnVuY3Rpb25Cb2R5IH1cXG59YFxuICAgIC8vbGV0IGJ1aWxkU3RyaW5nID0gYHJldHVybiBmdW5jdGlvbiBnZW4oIHN0ZGxpYiwgZm9yZWlnbiwgYnVmZmVyICl7IFxcbiR7IHRoaXMuZnVuY3Rpb25Cb2R5IH1cXG59YFxuXG4gICAgbGV0IGJ1aWxkU3RyaW5nID0gXG5gcmV0dXJuIGZ1bmN0aW9uIHVnZW4oIHN0ZGxpYiwgZm9yZWlnbiwgYnVmZmVyICkge1xuICAndXNlIGFzbSdcbiAgdmFyIHNpbiA9IHN0ZGxpYi5NYXRoLnNpblxuICB2YXIgY29zID0gc3RkbGliLk1hdGguY29zXG4gIHZhciB0YW4gPSBzdGRsaWIuTWF0aC50YW5cbiAgdmFyIG1pbiA9IHN0ZGxpYi5NYXRoLm1pblxuICB2YXIgbWF4ID0gc3RkbGliLk1hdGgubWF4XG4gIHZhciBwb3cgPSBzdGRsaWIuTWF0aC5wb3dcbiAgdmFyIGxvZyA9IHN0ZGxpYi5NYXRoLmxvZ1xuICB2YXIgYXRhbiA9IHN0ZGxpYi5NYXRoLmF0YW5cbiAgdmFyIGFzaW4gPSBzdGRsaWIuTWF0aC5hc2luXG4gIHZhciBhY29zID0gc3RkbGliLk1hdGguYWNvc1xuICB2YXIgYWJzID0gc3RkbGliLk1hdGguYWJzXG4gIHZhciBjZWlsID0gc3RkbGliLk1hdGguY2VpbFxuICB2YXIgZmxvb3IgPSBzdGRsaWIuTWF0aC5mbG9vclxuICB2YXIgZnJvdW5kID0gc3RkbGliLk1hdGguZnJvdW5kXG4gIHZhciBtZW1vcnkgPSBuZXcgc3RkbGliLkZsb2F0MzJBcnJheSggYnVmZmVyIClcblxuICBmdW5jdGlvbiByZW5kZXIoIGluMSApIHtcbiAgICBpbjEgPSBmcm91bmQoaW4xKTtcbiR7IHRoaXMuZnVuY3Rpb25Cb2R5IH1cbn1cbiAgXG4gIHJldHVybiB7IGNhbGxiYWNrOnJlbmRlciB9XG59YFxuXG4gICAgaWYoIHRoaXMuZGVidWcgfHwgZGVidWcgKSBjb25zb2xlLmxvZyggYnVpbGRTdHJpbmcgKSBcblxuICAgIHRoaXMuY2FsbGJhY2sgPSBuZXcgRnVuY3Rpb24oIGJ1aWxkU3RyaW5nIClcblxuICAgIC8vIG1ha2Ugc3VyZSB0byBhY2NvbW9kYXRlIHJ1bm5pbmcgdW5kZXIgbm9kZS5qc1xuICAgIGNvbnN0IHN0ZGxpYiA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93XG5cbiAgICB0aGlzLnJlbmRlckNhbGxiYWNrID0gdGhpcy5jYWxsYmFjaygpKCBzdGRsaWIsIG51bGwsIHRoaXMuYXJyYXlCdWZmZXIgKVxuICAgIFxuICAgIC8vIGFzc2lnbiBwcm9wZXJ0aWVzIHRvIG5hbWVkIGZ1bmN0aW9uXG4gICAgZm9yKCBsZXQgZGljdCBvZiB0aGlzLmNsb3N1cmVzLnZhbHVlcygpICkge1xuICAgICAgbGV0IG5hbWUgPSBPYmplY3Qua2V5cyggZGljdCApWzBdLFxuICAgICAgICAgIHZhbHVlID0gZGljdFsgbmFtZSBdXG5cbiAgICAgIHRoaXMuY2FsbGJhY2tbIG5hbWUgXSA9IHZhbHVlXG4gICAgfVxuXG4gICAgZm9yKCBsZXQgZGljdCBvZiB0aGlzLnBhcmFtcy52YWx1ZXMoKSApIHtcbiAgICAgIGxldCBuYW1lID0gT2JqZWN0LmtleXMoIGRpY3QgKVswXSxcbiAgICAgICAgICB1Z2VuID0gZGljdFsgbmFtZSBdXG4gICAgICBcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcy5jYWxsYmFjaywgbmFtZSwge1xuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgIGdldCgpIHsgcmV0dXJuIHVnZW4udmFsdWUgfSxcbiAgICAgICAgc2V0KHYpeyB1Z2VuLnZhbHVlID0gdiB9XG4gICAgICB9KVxuICAgICAgLy9jYWxsYmFja1sgbmFtZSBdID0gdmFsdWVcbiAgICB9XG5cbiAgICB0aGlzLmNhbGxiYWNrLmRhdGEgPSB0aGlzLmRhdGFcbiAgICB0aGlzLm91dCAgPSB7fS8vbmV3IEZsb2F0MzJBcnJheSggMiApXG4gIFxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcy5vdXQsICcwJywge1xuICAgICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWzBdXG4gICAgICB9LFxuICAgICAgc2V0KHYpIHt9XG4gICAgfSlcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdGhpcy5vdXQsICcxJywge1xuICAgICAgZ2V0KCkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWzBdXG4gICAgICB9LFxuICAgICAgc2V0KHYpIHt9XG4gICAgfSlcblxuICAgIHRoaXMuY2FsbGJhY2sucGFyYW1ldGVycyA9IHRoaXMucGFyYW1ldGVycy5zbGljZSggMCApXG5cbiAgICAvL2lmKCBNZW1vcnlIZWxwZXIuaXNQcm90b3R5cGVPZiggdGhpcy5tZW1vcnkgKSApIFxuICAgIHRoaXMuY2FsbGJhY2subWVtb3J5ID0gdGhpcy5tZW1vcnkuaGVhcFxuXG4gICAgdGhpcy5oaXN0b3JpZXMuY2xlYXIoKVxuXG4gICAgcmV0dXJuIHRoaXMucmVuZGVyQ2FsbGJhY2suY2FsbGJhY2tcbiAgfSxcbiAgXG4gIC8qIGdldElucHV0c1xuICAgKlxuICAgKiBHaXZlbiBhbiBhcmd1bWVudCB1Z2VuLCBleHRyYWN0IGl0cyBpbnB1dHMuIElmIHRoZXkgYXJlIG51bWJlcnMsIHJldHVybiB0aGUgbnVtZWJycy4gSWZcbiAgICogdGhleSBhcmUgdWdlbnMsIGNhbGwgLmdlbigpIG9uIHRoZSB1Z2VuLCBtZW1vaXplIHRoZSByZXN1bHQgYW5kIHJldHVybiB0aGUgcmVzdWx0LiBJZiB0aGVcbiAgICogdWdlbiBoYXMgcHJldmlvdXNseSBiZWVuIG1lbW9pemVkIHJldHVybiB0aGUgbWVtb2l6ZWQgdmFsdWUuXG4gICAqXG4gICAqL1xuICBnZXRJbnB1dHMoIHVnZW4gKSB7XG4gICAgcmV0dXJuIHVnZW4uaW5wdXRzLm1hcCggZ2VuLmdldElucHV0ICkgXG4gIH0sXG5cbiAgZ2V0SW5wdXQoIGlucHV0ICkge1xuICAgIGxldCBpc09iamVjdCA9IHR5cGVvZiBpbnB1dCA9PT0gJ29iamVjdCcsXG4gICAgICAgIHByb2Nlc3NlZElucHV0XG5cbiAgICBpZiggaXNPYmplY3QgKSB7IC8vIGlmIGlucHV0IGlzIGEgdWdlbi4uLiBcbiAgICAgIGlmKCBnZW4ubWVtb1sgaW5wdXQubmFtZSBdICkgeyAvLyBpZiBpdCBoYXMgYmVlbiBtZW1vaXplZC4uLlxuICAgICAgICBwcm9jZXNzZWRJbnB1dCA9IGdlbi5tZW1vWyBpbnB1dC5uYW1lIF1cbiAgICAgIH1lbHNlIGlmKCBBcnJheS5pc0FycmF5KCBpbnB1dCApICkge1xuICAgICAgICBnZW4uZ2V0SW5wdXQoIGlucHV0WzBdIClcbiAgICAgICAgZ2VuLmdldElucHV0KCBpbnB1dFsxXSApXG4gICAgICB9ZWxzZXsgLy8gaWYgbm90IG1lbW9pemVkIGdlbmVyYXRlIGNvZGUgIFxuICAgICAgICBpZiggdHlwZW9mIGlucHV0LmdlbiAhPT0gJ2Z1bmN0aW9uJyApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyggJ25vIGdlbiBmb3VuZDonLCBpbnB1dCwgaW5wdXQuZ2VuIClcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29kZSA9IGlucHV0LmdlbigpXG4gICAgICAgIC8vaWYoIGNvZGUuaW5kZXhPZiggJ09iamVjdCcgKSA+IC0xICkgY29uc29sZS5sb2coICdiYWQgaW5wdXQ6JywgaW5wdXQsIGNvZGUgKVxuICAgICAgICBcbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGNvZGUgKSApIHtcbiAgICAgICAgICBpZiggIWdlbi5zaG91bGRMb2NhbGl6ZSApIHtcbiAgICAgICAgICAgIGdlbi5mdW5jdGlvbkJvZHkgKz0gY29kZVsxXVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgZ2VuLmNvZGVOYW1lID0gY29kZVswXVxuICAgICAgICAgICAgZ2VuLmxvY2FsaXplZENvZGUucHVzaCggY29kZVsxXSApXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vY29uc29sZS5sb2coICdhZnRlciBHRU4nICwgdGhpcy5mdW5jdGlvbkJvZHkgKVxuICAgICAgICAgIGdlbi5tZW1vWyBjb2RlWzBdIF0gPSBjb2RlWzFdXG4gICAgICAgICAgcHJvY2Vzc2VkSW5wdXQgPSBjb2RlWzBdXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHByb2Nlc3NlZElucHV0ID0gY29kZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfWVsc2V7IC8vIGl0IGlucHV0IGlzIGEgbnVtYmVyXG4gICAgICBwcm9jZXNzZWRJbnB1dCA9IGlucHV0XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2Nlc3NlZElucHV0XG4gIH0sXG5cbiAgc3RhcnRMb2NhbGl6ZSgpIHtcbiAgICB0aGlzLmxvY2FsaXplZENvZGUgPSBbXVxuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSB0cnVlXG4gIH0sXG4gIGVuZExvY2FsaXplKCkge1xuICAgIHRoaXMuc2hvdWxkTG9jYWxpemUgPSBmYWxzZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5jb2RlTmFtZSwgdGhpcy5sb2NhbGl6ZWRDb2RlLnNsaWNlKDApIF1cbiAgfSxcblxuICBmcmVlKCBncmFwaCApIHtcbiAgICBpZiggQXJyYXkuaXNBcnJheSggZ3JhcGggKSApIHsgLy8gc3RlcmVvIHVnZW5cbiAgICAgIGZvciggbGV0IGNoYW5uZWwgb2YgZ3JhcGggKSB7XG4gICAgICAgIHRoaXMuZnJlZSggY2hhbm5lbCApXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmKCB0eXBlb2YgZ3JhcGggPT09ICdvYmplY3QnICkge1xuICAgICAgICBpZiggZ3JhcGgubWVtb3J5ICE9PSB1bmRlZmluZWQgKSB7XG4gICAgICAgICAgZm9yKCBsZXQgbWVtb3J5S2V5IGluIGdyYXBoLm1lbW9yeSApIHtcbiAgICAgICAgICAgIHRoaXMubWVtb3J5LmZyZWUoIGdyYXBoLm1lbW9yeVsgbWVtb3J5S2V5IF0uaWR4IClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYoIEFycmF5LmlzQXJyYXkoIGdyYXBoLmlucHV0cyApICkge1xuICAgICAgICAgIGZvciggbGV0IHVnZW4gb2YgZ3JhcGguaW5wdXRzICkge1xuICAgICAgICAgICAgdGhpcy5mcmVlKCB1Z2VuIClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZW5cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidndCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCggJHtpbnB1dHNbMF19ID4gJHtpbnB1dHNbMV19KSB8IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA+IGlucHV0c1sxXSA/IDEgOiAwIFxuICAgIH1cbiAgICBvdXQgKz0gJ1xcblxcbidcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFt0aGlzLm5hbWUsIG91dF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0ID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGd0LmlucHV0cyA9IFsgeCx5IF1cbiAgZ3QubmFtZSA9ICdndCcrZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIGd0XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidndGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcbiAgICBcbiAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9ID0gYCAgXG5cbiAgICBpZiggaXNOYU4oIHRoaXMuaW5wdXRzWzBdICkgfHwgaXNOYU4oIHRoaXMuaW5wdXRzWzFdICkgKSB7XG4gICAgICBvdXQgKz0gYCggJHtpbnB1dHNbMF19ID49ICR7aW5wdXRzWzFdfSB8IDAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA+PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG5cXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoeCx5KSA9PiB7XG4gIGxldCBndCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndC5pbnB1dHMgPSBbIHgseSBdXG4gIGd0Lm5hbWUgPSAnZ3RlJyArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiBndFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J2d0cCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCB0aGlzLmlucHV0c1swXSApIHx8IGlzTmFOKCB0aGlzLmlucHV0c1sxXSApICkge1xuICAgICAgb3V0ID0gYCgke2lucHV0c1sgMCBdfSAqICggKCAke2lucHV0c1swXX0gPiAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCAoIGlucHV0c1swXSA+IGlucHV0c1sxXSApIHwgMCApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IGd0cCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBndHAuaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBndHBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMT0wICkgPT4ge1xuICBsZXQgdWdlbiA9IHtcbiAgICBpbnB1dHM6IFsgaW4xIF0sXG4gICAgbWVtb3J5OiB7IHZhbHVlOiB7IGxlbmd0aDoxLCBpZHg6IG51bGwgfSB9LFxuICAgIHJlY29yZGVyOiBudWxsLFxuXG4gICAgaW4oIHYgKSB7XG4gICAgICBpZiggZ2VuLmhpc3Rvcmllcy5oYXMoIHYgKSApe1xuICAgICAgICBsZXQgbWVtb0hpc3RvcnkgPSBnZW4uaGlzdG9yaWVzLmdldCggdiApXG4gICAgICAgIHVnZW4ubmFtZSA9IG1lbW9IaXN0b3J5Lm5hbWVcbiAgICAgICAgcmV0dXJuIG1lbW9IaXN0b3J5XG4gICAgICB9XG5cbiAgICAgIGxldCBvYmogPSB7XG4gICAgICAgIGdlbigpIHtcbiAgICAgICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdWdlbiApXG5cbiAgICAgICAgICBpZiggdWdlbi5tZW1vcnkudmFsdWUuaWR4ID09PSBudWxsICkge1xuICAgICAgICAgICAgZ2VuLnJlcXVlc3RNZW1vcnkoIHVnZW4ubWVtb3J5IClcbiAgICAgICAgICAgIGdlbi5tZW1vcnkuaGVhcFsgdWdlbi5tZW1vcnkudmFsdWUuaWR4IF0gPSBpbjFcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgaWR4ID0gdWdlbi5tZW1vcnkudmFsdWUuaWR4XG4gICAgICAgICAgXG4gICAgICAgICAgZ2VuLmFkZFRvRW5kQmxvY2soICdtZW1vcnlbICcgKyBpZHggKyAnIF0gPSAnICsgaW5wdXRzWyAwIF0gKVxuICAgICAgICAgIFxuICAgICAgICAgIC8vIHJldHVybiB1Z2VuIHRoYXQgaXMgYmVpbmcgcmVjb3JkZWQgaW5zdGVhZCBvZiBzc2QuXG4gICAgICAgICAgLy8gdGhpcyBlZmZlY3RpdmVseSBtYWtlcyBhIGNhbGwgdG8gc3NkLnJlY29yZCgpIHRyYW5zcGFyZW50IHRvIHRoZSBncmFwaC5cbiAgICAgICAgICAvLyByZWNvcmRpbmcgaXMgdHJpZ2dlcmVkIGJ5IHByaW9yIGNhbGwgdG8gZ2VuLmFkZFRvRW5kQmxvY2suXG4gICAgICAgICAgZ2VuLmhpc3Rvcmllcy5zZXQoIHYsIG9iaiApXG5cbiAgICAgICAgICByZXR1cm4gaW5wdXRzWyAwIF1cbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogdWdlbi5uYW1lICsgJ19pbicrZ2VuLmdldFVJRCgpLFxuICAgICAgICBtZW1vcnk6IHVnZW4ubWVtb3J5XG4gICAgICB9XG5cbiAgICAgIHRoaXMuaW5wdXRzWyAwIF0gPSB2XG4gICAgICBcbiAgICAgIHVnZW4ucmVjb3JkZXIgPSBvYmpcblxuICAgICAgcmV0dXJuIG9ialxuICAgIH0sXG4gICAgXG4gICAgb3V0OiB7XG4gICAgICAgICAgICBcbiAgICAgIGdlbigpIHtcbiAgICAgICAgaWYoIHVnZW4ubWVtb3J5LnZhbHVlLmlkeCA9PT0gbnVsbCApIHtcbiAgICAgICAgICBpZiggZ2VuLmhpc3Rvcmllcy5nZXQoIHVnZW4uaW5wdXRzWzBdICkgPT09IHVuZGVmaW5lZCApIHtcbiAgICAgICAgICAgIGdlbi5oaXN0b3JpZXMuc2V0KCB1Z2VuLmlucHV0c1swXSwgdWdlbi5yZWNvcmRlciApXG4gICAgICAgICAgfVxuICAgICAgICAgIGdlbi5yZXF1ZXN0TWVtb3J5KCB1Z2VuLm1lbW9yeSApXG4gICAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB1Z2VuLm1lbW9yeS52YWx1ZS5pZHggXSA9IHBhcnNlRmxvYXQoIGluMSApXG4gICAgICAgIH1cbiAgICAgICAgbGV0IGlkeCA9IHVnZW4ubWVtb3J5LnZhbHVlLmlkeFxuICAgICAgICAgXG4gICAgICAgIHJldHVybiAnbWVtb3J5WyAnICsgaWR4ICsgJyBdICdcbiAgICAgIH0sXG4gICAgfSxcblxuICAgIHVpZDogZ2VuLmdldFVJRCgpLFxuICB9XG4gIFxuICB1Z2VuLm91dC5tZW1vcnkgPSB1Z2VuLm1lbW9yeSBcblxuICB1Z2VuLm5hbWUgPSAnaGlzdG9yeScgKyB1Z2VuLnVpZFxuICB1Z2VuLm91dC5uYW1lID0gdWdlbi5uYW1lICsgJ19vdXQnXG4gIHVnZW4uaW4uX25hbWUgID0gdWdlbi5uYW1lID0gJ19pbidcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIHVnZW4sICd2YWx1ZScsIHtcbiAgICBnZXQoKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICByZXR1cm4gZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXVxuICAgICAgfVxuICAgIH0sXG4gICAgc2V0KCB2ICkge1xuICAgICAgaWYoIHRoaXMubWVtb3J5LnZhbHVlLmlkeCAhPT0gbnVsbCApIHtcbiAgICAgICAgZ2VuLm1lbW9yeS5oZWFwWyB0aGlzLm1lbW9yeS52YWx1ZS5pZHggXSA9IHYgXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIvKlxuXG4gYSA9IGNvbmRpdGlvbmFsKCBjb25kaXRpb24sIHRydWVCbG9jaywgZmFsc2VCbG9jayApXG4gYiA9IGNvbmRpdGlvbmFsKFtcbiAgIGNvbmRpdGlvbjEsIGJsb2NrMSxcbiAgIGNvbmRpdGlvbjIsIGJsb2NrMixcbiAgIGNvbmRpdGlvbjMsIGJsb2NrMyxcbiAgIGRlZmF1bHRCbG9ja1xuIF0pXG5cbiovXG4ndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidpZmVsc2UnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgY29uZGl0aW9uYWxzID0gdGhpcy5pbnB1dHNbMF0sXG4gICAgICAgIGRlZmF1bHRWYWx1ZSA9IGdlbi5nZXRJbnB1dCggY29uZGl0aW9uYWxzWyBjb25kaXRpb25hbHMubGVuZ3RoIC0gMV0gKSxcbiAgICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2RlZmF1bHRWYWx1ZX1cXG5gIFxuXG4gICAgLy9jb25zb2xlLmxvZyggJ2RlZmF1bHRWYWx1ZTonLCBkZWZhdWx0VmFsdWUgKVxuXG4gICAgZm9yKCBsZXQgaSA9IDA7IGkgPCBjb25kaXRpb25hbHMubGVuZ3RoIC0gMjsgaSs9IDIgKSB7XG4gICAgICBsZXQgaXNFbmRCbG9jayA9IGkgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggLSAzLFxuICAgICAgICAgIGNvbmQgID0gZ2VuLmdldElucHV0KCBjb25kaXRpb25hbHNbIGkgXSApLFxuICAgICAgICAgIHByZWJsb2NrID0gY29uZGl0aW9uYWxzWyBpKzEgXSxcbiAgICAgICAgICBibG9jaywgYmxvY2tOYW1lLCBvdXRwdXRcblxuICAgICAgLy9jb25zb2xlLmxvZyggJ3BiJywgcHJlYmxvY2sgKVxuXG4gICAgICBpZiggdHlwZW9mIHByZWJsb2NrID09PSAnbnVtYmVyJyApe1xuICAgICAgICBibG9jayA9IHByZWJsb2NrXG4gICAgICAgIGJsb2NrTmFtZSA9IG51bGxcbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggZ2VuLm1lbW9bIHByZWJsb2NrLm5hbWUgXSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgICAgIC8vIHVzZWQgdG8gcGxhY2UgYWxsIGNvZGUgZGVwZW5kZW5jaWVzIGluIGFwcHJvcHJpYXRlIGJsb2Nrc1xuICAgICAgICAgIGdlbi5zdGFydExvY2FsaXplKClcblxuICAgICAgICAgIGdlbi5nZXRJbnB1dCggcHJlYmxvY2sgKVxuXG4gICAgICAgICAgYmxvY2sgPSBnZW4uZW5kTG9jYWxpemUoKVxuICAgICAgICAgIGJsb2NrTmFtZSA9IGJsb2NrWzBdXG4gICAgICAgICAgYmxvY2sgPSBibG9ja1sgMSBdLmpvaW4oJycpXG4gICAgICAgICAgYmxvY2sgPSAnICAnICsgYmxvY2sucmVwbGFjZSggL1xcbi9naSwgJ1xcbiAgJyApXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGJsb2NrID0gJydcbiAgICAgICAgICBibG9ja05hbWUgPSBnZW4ubWVtb1sgcHJlYmxvY2submFtZSBdXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb3V0cHV0ID0gYmxvY2tOYW1lID09PSBudWxsID8gXG4gICAgICAgIGAgICR7dGhpcy5uYW1lfV9vdXQgPSAke2Jsb2NrfWAgOlxuICAgICAgICBgJHtibG9ja30gICR7dGhpcy5uYW1lfV9vdXQgPSAke2Jsb2NrTmFtZX1gXG4gICAgICBcbiAgICAgIGlmKCBpPT09MCApIG91dCArPSAnICdcbiAgICAgIG91dCArPSBcbmAgaWYoICR7Y29uZH0gPT09IDEgKSB7XG4ke291dHB1dH1cbiAgfWBcblxuaWYoICFpc0VuZEJsb2NrICkge1xuICBvdXQgKz0gYCBlbHNlYFxufWVsc2V7XG4gIG91dCArPSBgXFxuYFxufVxuLyogICAgICAgICBcbiBlbHNlYFxuICAgICAgfWVsc2UgaWYoIGlzRW5kQmxvY2sgKSB7XG4gICAgICAgIG91dCArPSBge1xcbiAgJHtvdXRwdXR9XFxuICB9XFxuYFxuICAgICAgfWVsc2Uge1xuXG4gICAgICAgIC8vaWYoIGkgKyAyID09PSBjb25kaXRpb25hbHMubGVuZ3RoIHx8IGkgPT09IGNvbmRpdGlvbmFscy5sZW5ndGggLSAxICkge1xuICAgICAgICAvLyAgb3V0ICs9IGB7XFxuICAke291dHB1dH1cXG4gIH1cXG5gXG4gICAgICAgIC8vfWVsc2V7XG4gICAgICAgICAgb3V0ICs9IFxuYCBpZiggJHtjb25kfSA9PT0gMSApIHtcbiR7b3V0cHV0fVxuICB9IGVsc2UgYFxuICAgICAgICAvL31cbiAgICAgIH0qL1xuICAgIH1cblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IGAke3RoaXMubmFtZX1fb3V0YFxuXG4gICAgcmV0dXJuIFsgYCR7dGhpcy5uYW1lfV9vdXRgLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgY29uZGl0aW9ucyA9IEFycmF5LmlzQXJyYXkoIGFyZ3NbMF0gKSA/IGFyZ3NbMF0gOiBhcmdzXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwge1xuICAgIHVpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICBbIGNvbmRpdGlvbnMgXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidpbicsXG5cbiAgZ2VuKCkge1xuICAgIGdlbi5wYXJhbWV0ZXJzLnB1c2goIHRoaXMubmFtZSApXG4gICAgXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICByZXR1cm4gdGhpcy5uYW1lXG4gIH0gXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBuYW1lICkgPT4ge1xuICBsZXQgaW5wdXQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgaW5wdXQuaWQgICA9IGdlbi5nZXRVSUQoKVxuICBpbnB1dC5uYW1lID0gbmFtZSAhPT0gdW5kZWZpbmVkID8gbmFtZSA6IGAke2lucHV0LmJhc2VuYW1lfSR7aW5wdXQuaWR9YFxuICBpbnB1dFswXSA9IHtcbiAgICBnZW4oKSB7XG4gICAgICBpZiggISBnZW4ucGFyYW1ldGVycy5pbmNsdWRlcyggaW5wdXQubmFtZSApICkgZ2VuLnBhcmFtZXRlcnMucHVzaCggaW5wdXQubmFtZSApXG4gICAgICByZXR1cm4gaW5wdXQubmFtZSArICdbMF0nXG4gICAgfVxuICB9XG4gIGlucHV0WzFdID0ge1xuICAgIGdlbigpIHtcbiAgICAgIGlmKCAhIGdlbi5wYXJhbWV0ZXJzLmluY2x1ZGVzKCBpbnB1dC5uYW1lICkgKSBnZW4ucGFyYW1ldGVycy5wdXNoKCBpbnB1dC5uYW1lIClcbiAgICAgIHJldHVybiBpbnB1dC5uYW1lICsgJ1sxXSdcbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiBpbnB1dFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBsaWJyYXJ5ID0ge1xuICBleHBvcnQoIGRlc3RpbmF0aW9uICkge1xuICAgIGlmKCBkZXN0aW5hdGlvbiA9PT0gd2luZG93ICkge1xuICAgICAgZGVzdGluYXRpb24uc3NkID0gbGlicmFyeS5oaXN0b3J5ICAgIC8vIGhpc3RvcnkgaXMgd2luZG93IG9iamVjdCBwcm9wZXJ0eSwgc28gdXNlIHNzZCBhcyBhbGlhc1xuICAgICAgZGVzdGluYXRpb24uaW5wdXQgPSBsaWJyYXJ5LmluICAgICAgIC8vIGluIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG4gICAgICBkZXN0aW5hdGlvbi50ZXJuYXJ5ID0gbGlicmFyeS5zd2l0Y2ggLy8gc3dpdGNoIGlzIGEga2V5d29yZCBpbiBqYXZhc2NyaXB0XG5cbiAgICAgIGRlbGV0ZSBsaWJyYXJ5Lmhpc3RvcnlcbiAgICAgIGRlbGV0ZSBsaWJyYXJ5LmluXG4gICAgICBkZWxldGUgbGlicmFyeS5zd2l0Y2hcbiAgICB9XG5cbiAgICBPYmplY3QuYXNzaWduKCBkZXN0aW5hdGlvbiwgbGlicmFyeSApXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIGxpYnJhcnksICdzYW1wbGVyYXRlJywge1xuICAgICAgZ2V0KCkgeyByZXR1cm4gbGlicmFyeS5nZW4uc2FtcGxlcmF0ZSB9LFxuICAgICAgc2V0KHYpIHt9XG4gICAgfSlcblxuICAgIGxpYnJhcnkuaW4gPSBkZXN0aW5hdGlvbi5pbnB1dFxuICAgIGxpYnJhcnkuaGlzdG9yeSA9IGRlc3RpbmF0aW9uLnNzZFxuICAgIGxpYnJhcnkuc3dpdGNoID0gZGVzdGluYXRpb24udGVybmFyeVxuXG4gICAgZGVzdGluYXRpb24uY2xpcCA9IGxpYnJhcnkuY2xhbXBcbiAgfSxcblxuICBnZW46ICAgICAgcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICBcbiAgYWJzOiAgICAgIHJlcXVpcmUoICcuL2Ficy5qcycgKSxcbiAgcm91bmQ6ICAgIHJlcXVpcmUoICcuL3JvdW5kLmpzJyApLFxuICBwYXJhbTogICAgcmVxdWlyZSggJy4vcGFyYW0uanMnICksXG4gIGFkZDogICAgICByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gIHN1YjogICAgICByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gIG11bDogICAgICByZXF1aXJlKCAnLi9tdWwuanMnICksXG4gIGRpdjogICAgICByZXF1aXJlKCAnLi9kaXYuanMnICksXG4gIGFjY3VtOiAgICByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgY291bnRlcjogIHJlcXVpcmUoICcuL2NvdW50ZXIuanMnICksXG4gIHNpbjogICAgICByZXF1aXJlKCAnLi9zaW4uanMnICksXG4gIGNvczogICAgICByZXF1aXJlKCAnLi9jb3MuanMnICksXG4gIHRhbjogICAgICByZXF1aXJlKCAnLi90YW4uanMnICksXG4gIHRhbmg6ICAgICByZXF1aXJlKCAnLi90YW5oLmpzJyApLFxuICBhc2luOiAgICAgcmVxdWlyZSggJy4vYXNpbi5qcycgKSxcbiAgYWNvczogICAgIHJlcXVpcmUoICcuL2Fjb3MuanMnICksXG4gIGF0YW46ICAgICByZXF1aXJlKCAnLi9hdGFuLmpzJyApLCAgXG4gIHBoYXNvcjogICByZXF1aXJlKCAnLi9waGFzb3IuanMnICksXG4gIGRhdGE6ICAgICByZXF1aXJlKCAnLi9kYXRhLmpzJyApLFxuICBwZWVrOiAgICAgcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgY3ljbGU6ICAgIHJlcXVpcmUoICcuL2N5Y2xlLmpzJyApLFxuICBoaXN0b3J5OiAgcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgZGVsdGE6ICAgIHJlcXVpcmUoICcuL2RlbHRhLmpzJyApLFxuICBmbG9vcjogICAgcmVxdWlyZSggJy4vZmxvb3IuanMnICksXG4gIGNlaWw6ICAgICByZXF1aXJlKCAnLi9jZWlsLmpzJyApLFxuICBtaW46ICAgICAgcmVxdWlyZSggJy4vbWluLmpzJyApLFxuICBtYXg6ICAgICAgcmVxdWlyZSggJy4vbWF4LmpzJyApLFxuICBzaWduOiAgICAgcmVxdWlyZSggJy4vc2lnbi5qcycgKSxcbiAgZGNibG9jazogIHJlcXVpcmUoICcuL2RjYmxvY2suanMnICksXG4gIG1lbW86ICAgICByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICByYXRlOiAgICAgcmVxdWlyZSggJy4vcmF0ZS5qcycgKSxcbiAgd3JhcDogICAgIHJlcXVpcmUoICcuL3dyYXAuanMnICksXG4gIG1peDogICAgICByZXF1aXJlKCAnLi9taXguanMnICksXG4gIGNsYW1wOiAgICByZXF1aXJlKCAnLi9jbGFtcC5qcycgKSxcbiAgcG9rZTogICAgIHJlcXVpcmUoICcuL3Bva2UuanMnICksXG4gIGRlbGF5OiAgICByZXF1aXJlKCAnLi9kZWxheS5qcycgKSxcbiAgZm9sZDogICAgIHJlcXVpcmUoICcuL2ZvbGQuanMnICksXG4gIG1vZCA6ICAgICByZXF1aXJlKCAnLi9tb2QuanMnICksXG4gIHNhaCA6ICAgICByZXF1aXJlKCAnLi9zYWguanMnICksXG4gIG5vaXNlOiAgICByZXF1aXJlKCAnLi9ub2lzZS5qcycgKSxcbiAgbm90OiAgICAgIHJlcXVpcmUoICcuL25vdC5qcycgKSxcbiAgZ3Q6ICAgICAgIHJlcXVpcmUoICcuL2d0LmpzJyApLFxuICBndGU6ICAgICAgcmVxdWlyZSggJy4vZ3RlLmpzJyApLFxuICBsdDogICAgICAgcmVxdWlyZSggJy4vbHQuanMnICksIFxuICBsdGU6ICAgICAgcmVxdWlyZSggJy4vbHRlLmpzJyApLCBcbiAgYm9vbDogICAgIHJlcXVpcmUoICcuL2Jvb2wuanMnICksXG4gIGdhdGU6ICAgICByZXF1aXJlKCAnLi9nYXRlLmpzJyApLFxuICB0cmFpbjogICAgcmVxdWlyZSggJy4vdHJhaW4uanMnICksXG4gIHNsaWRlOiAgICByZXF1aXJlKCAnLi9zbGlkZS5qcycgKSxcbiAgaW46ICAgICAgIHJlcXVpcmUoICcuL2luLmpzJyApLFxuICB0NjA6ICAgICAgcmVxdWlyZSggJy4vdDYwLmpzJyksXG4gIG10b2Y6ICAgICByZXF1aXJlKCAnLi9tdG9mLmpzJyksXG4gIGx0cDogICAgICByZXF1aXJlKCAnLi9sdHAuanMnKSwgICAgICAgIC8vIFRPRE86IHRlc3RcbiAgZ3RwOiAgICAgIHJlcXVpcmUoICcuL2d0cC5qcycpLCAgICAgICAgLy8gVE9ETzogdGVzdFxuICBzd2l0Y2g6ICAgcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApLFxuICBtc3Rvc2FtcHM6cmVxdWlyZSggJy4vbXN0b3NhbXBzLmpzJyApLCAvLyBUT0RPOiBuZWVkcyB0ZXN0LFxuICBzZWxlY3RvcjogcmVxdWlyZSggJy4vc2VsZWN0b3IuanMnICksXG4gIHV0aWxpdGllczpyZXF1aXJlKCAnLi91dGlsaXRpZXMuanMnICksXG4gIHBvdzogICAgICByZXF1aXJlKCAnLi9wb3cuanMnICksXG4gIGF0dGFjazogICByZXF1aXJlKCAnLi9hdHRhY2suanMnICksXG4gIGRlY2F5OiAgICByZXF1aXJlKCAnLi9kZWNheS5qcycgKSxcbiAgd2luZG93czogIHJlcXVpcmUoICcuL3dpbmRvd3MuanMnICksXG4gIGVudjogICAgICByZXF1aXJlKCAnLi9lbnYuanMnICksXG4gIGFkOiAgICAgICByZXF1aXJlKCAnLi9hZC5qcycgICksXG4gIGFkc3I6ICAgICByZXF1aXJlKCAnLi9hZHNyLmpzJyApLFxuICBpZmVsc2U6ICAgcmVxdWlyZSggJy4vaWZlbHNlaWYuanMnICksXG4gIGJhbmc6ICAgICByZXF1aXJlKCAnLi9iYW5nLmpzJyApLFxuICBhbmQ6ICAgICAgcmVxdWlyZSggJy4vYW5kLmpzJyApLFxuICBwYW46ICAgICAgcmVxdWlyZSggJy4vcGFuLmpzJyApLFxuICBlcTogICAgICAgcmVxdWlyZSggJy4vZXEuanMnICksXG4gIG5lcTogICAgICByZXF1aXJlKCAnLi9uZXEuanMnIClcbn1cblxubGlicmFyeS5nZW4ubGliID0gbGlicmFyeVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxpYnJhcnlcbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbHQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZCggW3RoaXMubmFtZSwnaSddIClcbiAgICBvdXQgPSBgICAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbaV0gKSApIHtcbiAgICAgIG91dCArPSBgKCggJHtpbnB1dHNbMF19IDwgJHtpbnB1dHNbMV19KSB8IDAgIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCArPSBpbnB1dHNbMF0gPCBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gbHQuYmFzZW5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdGUnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIG91dCA9IGAgIHZhciAke3RoaXMubmFtZX0gPSBgICBcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCArPSBgKCAke2lucHV0c1swXX0gPD0gJHtpbnB1dHNbMV19IHwgMCAgKWBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ICs9IGlucHV0c1swXSA8PSBpbnB1dHNbMV0gPyAxIDogMCBcbiAgICB9XG4gICAgb3V0ICs9ICdcXG4nXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWVcblxuICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgbHQuaW5wdXRzID0gWyB4LHkgXVxuICBsdC5uYW1lID0gJ2x0ZScgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbHRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidsdHAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSB8fCBpc05hTiggdGhpcy5pbnB1dHNbMV0gKSApIHtcbiAgICAgIG91dCA9IGAoJHtpbnB1dHNbIDAgXX0gKiAoKCAke2lucHV0c1swXX0gPCAke2lucHV0c1sxXX0gKSB8IDAgKSApYCBcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gaW5wdXRzWzBdICogKCggaW5wdXRzWzBdIDwgaW5wdXRzWzFdICkgfCAwIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKHgseSkgPT4ge1xuICBsZXQgbHRwID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIGx0cC5pbnB1dHMgPSBbIHgseSBdXG5cbiAgcmV0dXJuIGx0cFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21heCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5tYXggfSlcblxuICAgICAgb3V0ID0gYGdlbi5tYXgoICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5tYXgoIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1heCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtYXguaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtYXhcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtZW1vJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9ICR7aW5wdXRzWzBdfVxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IChpbjEsbWVtb05hbWUpID0+IHtcbiAgbGV0IG1lbW8gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBtZW1vLmlucHV0cyA9IFsgaW4xIF1cbiAgbWVtby5pZCAgID0gZ2VuLmdldFVJRCgpXG4gIG1lbW8ubmFtZSA9IG1lbW9OYW1lICE9PSB1bmRlZmluZWQgPyBtZW1vTmFtZSArICdfJyArIGdlbi5nZXRVSUQoKSA6IGAke21lbW8uYmFzZW5hbWV9JHttZW1vLmlkfWBcblxuICByZXR1cm4gbWVtb1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J21pbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSB8fCBpc05hTiggaW5wdXRzWzFdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5taW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi5taW4oICR7aW5wdXRzWzBdfSwgJHtpbnB1dHNbMV19IClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC5taW4oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApLCBwYXJzZUZsb2F0KCBpbnB1dHNbMV0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IG1pbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBtaW4uaW5wdXRzID0gWyB4LHkgXVxuXG4gIHJldHVybiBtaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBhZGQgPSByZXF1aXJlKCcuL2FkZC5qcycpLFxuICAgIG11bCA9IHJlcXVpcmUoJy4vbXVsLmpzJyksXG4gICAgc3ViID0gcmVxdWlyZSgnLi9zdWIuanMnKSxcbiAgICBtZW1vPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBpbjIsIHQ9LjUgKSA9PiB7XG4gIGxldCB1Z2VuID0gbWVtbyggYWRkKCBtdWwoaW4xLCBzdWIoMSx0ICkgKSwgbXVsKCBpbjIsIHQgKSApIClcbiAgdWdlbi5uYW1lID0gJ21peCcgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKC4uLmFyZ3MpID0+IHtcbiAgbGV0IG1vZCA9IHtcbiAgICBpZDogICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6IGFyZ3MsXG5cbiAgICBnZW4oKSB7XG4gICAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICAgIG91dD0nKCcsXG4gICAgICAgICAgZGlmZiA9IDAsIFxuICAgICAgICAgIG51bUNvdW50ID0gMCxcbiAgICAgICAgICBsYXN0TnVtYmVyID0gaW5wdXRzWyAwIF0sXG4gICAgICAgICAgbGFzdE51bWJlcklzVWdlbiA9IGlzTmFOKCBsYXN0TnVtYmVyICksIFxuICAgICAgICAgIG1vZEF0RW5kID0gZmFsc2VcblxuICAgICAgaW5wdXRzLmZvckVhY2goICh2LGkpID0+IHtcbiAgICAgICAgaWYoIGkgPT09IDAgKSByZXR1cm5cblxuICAgICAgICBsZXQgaXNOdW1iZXJVZ2VuID0gaXNOYU4oIHYgKSxcbiAgICAgICAgICAgIGlzRmluYWxJZHggICA9IGkgPT09IGlucHV0cy5sZW5ndGggLSAxXG5cbiAgICAgICAgaWYoICFsYXN0TnVtYmVySXNVZ2VuICYmICFpc051bWJlclVnZW4gKSB7XG4gICAgICAgICAgbGFzdE51bWJlciA9IGxhc3ROdW1iZXIgJSB2XG4gICAgICAgICAgb3V0ICs9IGxhc3ROdW1iZXJcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgb3V0ICs9IGAke2xhc3ROdW1iZXJ9ICUgJHt2fWBcbiAgICAgICAgfVxuXG4gICAgICAgIGlmKCAhaXNGaW5hbElkeCApIG91dCArPSAnICUgJyBcbiAgICAgIH0pXG5cbiAgICAgIG91dCArPSAnKSdcblxuICAgICAgcmV0dXJuIG91dFxuICAgIH1cbiAgfVxuICBcbiAgcmV0dXJuIG1vZFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidtc3Rvc2FtcHMnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHJldHVyblZhbHVlXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lIH0gPSAke2dlbi5zYW1wbGVyYXRlfSAvIDEwMDAgKiAke2lucHV0c1swXX0gXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBnZW4uc2FtcGxlcmF0ZSAvIDEwMDAgKiB0aGlzLmlucHV0c1swXVxuXG4gICAgICByZXR1cm5WYWx1ZSA9IG91dFxuICAgIH0gICAgXG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWVcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgbXN0b3NhbXBzID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIG1zdG9zYW1wcy5pbnB1dHMgPSBbIHggXVxuICBtc3Rvc2FtcHMubmFtZSA9IHByb3RvLmJhc2VuYW1lICsgZ2VuLmdldFVJRCgpXG5cbiAgcmV0dXJuIG1zdG9zYW1wc1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J210b2YnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCggJHt0aGlzLnR1bmluZ30gKiBnZW4uZXhwKCAuMDU3NzYyMjY1ICogKCR7aW5wdXRzWzBdfSAtIDY5KSApIClgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gdGhpcy50dW5pbmcgKiBNYXRoLmV4cCggLjA1Nzc2MjI2NSAqICggaW5wdXRzWzBdIC0gNjkpIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCB4LCBwcm9wcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IHR1bmluZzo0NDAgfVxuICBcbiAgaWYoIHByb3BzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBwcm9wcy5kZWZhdWx0cyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgZGVmYXVsdHMgKVxuICB1Z2VuLmlucHV0cyA9IFsgeCBdXG4gIFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubW9kdWxlLmV4cG9ydHMgPSAoIC4uLmFyZ3MgKSA9PiB7XG4gIGxldCBtdWwgPSB7XG4gICAgaWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBhcmdzLFxuXG4gICAgZ2VuKCkge1xuICAgICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgICBvdXQ9YCAgJHt0aGlzLm5hbWV9ID0gZnJvdW5kKGAsXG4gICAgICAgICAgc3VtID0gMSwgbnVtQ291bnQgPSAwLCBtdWxBdEVuZCA9IGZhbHNlLCBhbHJlYWR5RnVsbFN1bW1lZCA9IHRydWVcblxuICAgICAgZ2VuLnZhcmlhYmxlTmFtZXMuYWRkKCBbdGhpcy5uYW1lLCdmJ10gKVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaXNOYU4oIHYgKSApIHtcbiAgICAgICAgICBvdXQgKz0gdlxuICAgICAgICAgIGlmKCBpIDwgaW5wdXRzLmxlbmd0aCAtMSApIHtcbiAgICAgICAgICAgIG11bEF0RW5kID0gdHJ1ZVxuICAgICAgICAgICAgb3V0ICs9ICcgKiAnXG4gICAgICAgICAgfVxuICAgICAgICAgIGFscmVhZHlGdWxsU3VtbWVkID0gZmFsc2VcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgaWYoIGkgPT09IDAgKSB7XG4gICAgICAgICAgICBzdW0gPSB2XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBzdW0gKj0gcGFyc2VGbG9hdCggdiApXG4gICAgICAgICAgfVxuICAgICAgICAgIG51bUNvdW50KytcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIFxuICAgICAgLy9pZiggYWxyZWFkeUZ1bGxTdW1tZWQgKSBvdXQgPSAnJ1xuXG4gICAgICBpZiggbnVtQ291bnQgPiAwICkge1xuICAgICAgICBvdXQgKz0gbXVsQXRFbmQgfHwgYWxyZWFkeUZ1bGxTdW1tZWQgPyBgZnJvdW5kKCR7c3VtfSlgIDogYCAqIGZyb3VuZCgke3N1bX0pYFxuICAgICAgfVxuICAgICAgXG4gICAgICAvL2lmKCAhYWxyZWFkeUZ1bGxTdW1tZWQgKSBcbiAgICAgIG91dCArPSAnKTtcXG4nXG5cbiAgICAgIHJldHVybiBbdGhpcy5uYW1lLCBvdXRdXG4gICAgfVxuICB9XG4gIG11bC5uYW1lID0gJ211bCcrbXVsLmlkXG5cbiAgcmV0dXJuIG11bFxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonbmVxJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBvdXQgPSAvKnRoaXMuaW5wdXRzWzBdICE9PSB0aGlzLmlucHV0c1sxXSA/IDEgOiovIGAgIHZhciAke3RoaXMubmFtZX0gPSAoJHtpbnB1dHNbMF19ICE9PSAke2lucHV0c1sxXX0pIHwgMFxcblxcbmBcblxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9LFxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIGluMiApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIG5hbWU6J25vaXNlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dFxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdub2lzZScgOiBNYXRoLnJhbmRvbSB9KVxuXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGdlbi5ub2lzZSgpXFxuYFxuICAgIFxuICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IHRoaXMubmFtZVxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCBvdXQgXVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBub2lzZSA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgbm9pc2UubmFtZSA9IHByb3RvLm5hbWUgKyBnZW4uZ2V0VUlEKClcblxuICByZXR1cm4gbm9pc2Vcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBuYW1lOidub3QnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggdGhpcy5pbnB1dHNbMF0gKSApIHtcbiAgICAgIG91dCA9IGAoICR7aW5wdXRzWzBdfSA9PT0gMCA/IDEgOiAwIClgXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9ICFpbnB1dHNbMF0gPT09IDAgPyAxIDogMFxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IG5vdCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBub3QuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gbm90XG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKSxcbiAgICBwZWVrID0gcmVxdWlyZSggJy4vcGVlay5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BhbicsIFxuICBpbml0VGFibGUoKSB7ICAgIFxuICAgIGxldCBidWZmZXJMID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApLFxuICAgICAgICBidWZmZXJSID0gbmV3IEZsb2F0MzJBcnJheSggMTAyNCApXG5cbiAgICBsZXQgc3FydFR3b092ZXJUd28gPSBNYXRoLnNxcnQoMikgLyAyXG5cbiAgICBmb3IoIGxldCBpID0gMDsgaSA8IDEwMjQ7IGkrKyApIHsgXG4gICAgICBsZXQgcGFuID0gLTEgKyAoIGkgLyAxMDI0ICkgKiAyXG4gICAgICBidWZmZXJMW2ldID0gKCBzcXJ0VHdvT3ZlclR3byAqICggTWF0aC5jb3MocGFuKSAtIE1hdGguc2luKHBhbikgKSApXG4gICAgICBidWZmZXJSW2ldID0gKCBzcXJ0VHdvT3ZlclR3byAqICggTWF0aC5jb3MocGFuKSArIE1hdGguc2luKHBhbikgKSApXG4gICAgfVxuXG4gICAgZ2VuLmdsb2JhbHMucGFuTCA9IGRhdGEoIGJ1ZmZlckwsIDEsIHsgaW1tdXRhYmxlOnRydWUgfSlcbiAgICBnZW4uZ2xvYmFscy5wYW5SID0gZGF0YSggYnVmZmVyUiwgMSwgeyBpbW11dGFibGU6dHJ1ZSB9KVxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGxlZnRJbnB1dCwgcmlnaHRJbnB1dCwgcGFuLCBwcm9wZXJ0aWVzICkgPT4ge1xuICBpZiggZ2VuLmdsb2JhbHMucGFuTCA9PT0gdW5kZWZpbmVkICkgcHJvdG8uaW5pdFRhYmxlKClcblxuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7XG4gICAgdWlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogIFsgbGVmdElucHV0LCByaWdodElucHV0IF0sXG4gICAgbGVmdDogICAgbXVsKCBsZWZ0SW5wdXQsIHBlZWsoIGdlbi5nbG9iYWxzLnBhbkwsIHBhbiwgeyBib3VuZG1vZGU6J2NsYW1wJyB9KSApLFxuICAgIHJpZ2h0OiAgIG11bCggcmlnaHRJbnB1dCwgcGVlayggZ2VuLmdsb2JhbHMucGFuUiwgcGFuLCB7IGJvdW5kbW9kZTonY2xhbXAnIH0pIClcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGdlbigpIHtcbiAgICBnZW4ucmVxdWVzdE1lbW9yeSggdGhpcy5tZW1vcnkgKVxuICAgIFxuICAgIGdlbi5wYXJhbXMuYWRkKHsgW3RoaXMubmFtZV06IHRoaXMgfSlcblxuICAgIHRoaXMudmFsdWUgPSB0aGlzLmluaXRpYWxWYWx1ZVxuXG4gICAgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gYG1lbW9yeVske3RoaXMubWVtb3J5LnZhbHVlLmlkeH1dYFxuXG4gICAgcmV0dXJuIGdlbi5tZW1vWyB0aGlzLm5hbWUgXVxuICB9IFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggcHJvcE5hbWU9MCwgdmFsdWU9MCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIFxuICBpZiggdHlwZW9mIHByb3BOYW1lICE9PSAnc3RyaW5nJyApIHtcbiAgICB1Z2VuLm5hbWUgPSAncGFyYW0nICsgZ2VuLmdldFVJRCgpXG4gICAgdWdlbi5pbml0aWFsVmFsdWUgPSBwcm9wTmFtZVxuICB9ZWxzZXtcbiAgICB1Z2VuLm5hbWUgPSBwcm9wTmFtZVxuICAgIHVnZW4uaW5pdGlhbFZhbHVlID0gdmFsdWVcbiAgfVxuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggdWdlbiwgJ3ZhbHVlJywge1xuICAgIGdldCgpIHtcbiAgICAgIGlmKCB0aGlzLm1lbW9yeS52YWx1ZS5pZHggIT09IG51bGwgKSB7XG4gICAgICAgIHJldHVybiBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXQoIHYgKSB7XG4gICAgICBpZiggdGhpcy5tZW1vcnkudmFsdWUuaWR4ICE9PSBudWxsICkge1xuICAgICAgICBnZW4ubWVtb3J5LmhlYXBbIHRoaXMubWVtb3J5LnZhbHVlLmlkeCBdID0gdiBcbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgdWdlbi5tZW1vcnkgPSB7XG4gICAgdmFsdWU6IHsgbGVuZ3RoOjEsIGlkeDpudWxsIH1cbiAgfVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BlZWsnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLFxuICAgICAgICBvdXQsIGZ1bmN0aW9uQm9keSwgbmV4dCwgbGVuZ3RoSXNMb2cyLCBpZHhcbiAgICBcbiAgICBpZHggPSBpbnB1dHNbMV1cbiAgICBsZW5ndGhJc0xvZzIgPSAoTWF0aC5sb2cyKCB0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aCApIHwgMCkgID09PSBNYXRoLmxvZzIoIHRoaXMuZGF0YS5idWZmZXIubGVuZ3RoIClcblxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZChbIHRoaXMubmFtZSsnX3BoYXNlJywgJ2YnXSAgKVxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZChbIHRoaXMubmFtZSsnX2luZGV4JywgJ2knXSAgKVxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZChbIHRoaXMubmFtZSsnX25leHQnLCAgJ2knXSAgKVxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZChbIHRoaXMubmFtZSsnX2ZyYWMnLCAgJ2YnXSAgKVxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZChbIHRoaXMubmFtZSsnX2Jhc2UnLCAgJ2YnXSAgKVxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZChbIHRoaXMubmFtZSsnX291dCcsICdmJ10gIClcblxuICAgIGlmKCB0aGlzLm1vZGUgIT09ICdzaW1wbGUnICkge1xuXG4gICAgICBjb25zdCBwaGFzZSA9IHRoaXMubW9kZSA9PT0gJ3NhbXBsZXMnID8gYGZyb3VuZCgke2lucHV0c1swXX0pYCA6IGBmcm91bmQoIGZyb3VuZCgke2lucHV0c1swXX0pICogZnJvdW5kKCR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfXwwKSApYFxuXG4gICAgICBjb25zdCBub25Mb2cyTmV4dCA9ICBcbiAgICAgICAgYGlmKCAoICR7dGhpcy5uYW1lfV9pbmRleCArIDF8MCApfDAgPj0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH18MCApIHtcbiAgICAgICAgICAke3RoaXMubmFtZX1fbmV4dCA9ICggJHt0aGlzLm5hbWV9X2luZGV4ICsgMXwwIC0gJHt0aGlzLmRhdGEuYnVmZmVyLmxlbmd0aH18MCApfDBcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgJHt0aGlzLm5hbWV9X25leHQgPSAoICR7dGhpcy5uYW1lfV9pbmRleCArIDF8MCApfDAgXG4gICAgICAgIH1cXG5cXG5gXG5cbiAgICAgIGNvbnN0IGNsYW1wTmV4dCA9XG4gICAgICAgIGBpZiggKCR7dGhpcy5uYW1lfV9pbmRleCArIDF8MCApfDAgPj0gKCR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSl8MCApIHtcbiAgICAgICAgICAke3RoaXMubmFtZX1fbmV4dCA9ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfXwwXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICR7dGhpcy5uYW1lfV9uZXh0ID0gKCAke3RoaXMubmFtZX1faW5kZXggKyAxfDAgKXwwXG4gICAgICAgIH1cXG5cXG5gXG5cblxuICAgICAgZnVuY3Rpb25Cb2R5ID0gXG4gICAgICBgICAke3RoaXMubmFtZX1fcGhhc2UgPSAke3BoYXNlfSBcbiAgJHt0aGlzLm5hbWV9X2luZGV4ID0gfn5mbG9vcigrJHt0aGlzLm5hbWV9X3BoYXNlKVxcbmBcblxuXG4gICAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICd3cmFwJyApIHtcbiAgICAgICAgbmV4dCA9IGxlbmd0aElzTG9nMiA/IGAoICR7dGhpcy5uYW1lfV9pbmRleCArIDEgKXwwICYgKCR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGh9IC0gMSl8MGAgOiBub25Mb2cyTmV4dFxuICAgICAgfWVsc2UgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnY2xhbXAnICkge1xuICAgICAgICBjb25zb2xlLmxvZygnY2xhbXAnKVxuICAgICAgICBuZXh0ID0gY2xhbXBOZXh0IFxuICAgICAgfWVsc2V7XG4gICAgICAgIG5leHQgPSBgKCAke3RoaXMubmFtZX1faW5kZXggKyAxfDAgKXwwYCAgICAgXG4gICAgICB9XG5cblxuICAgICAgaWYoIHRoaXMuaW50ZXJwID09PSAnbGluZWFyJyApIHtcblxuICAgICAgICBmdW5jdGlvbkJvZHkgKz0gXG4gICAgICAgICAgYCAgJHt0aGlzLm5hbWV9X2ZyYWMgID0gZnJvdW5kKCAke3RoaXMubmFtZX1fcGhhc2UgLSBmcm91bmQoJHt0aGlzLm5hbWV9X2luZGV4fDApIClcbiAgJHt0aGlzLm5hbWV9X2Jhc2UgID0gZnJvdW5kKCBtZW1vcnlbICgoJHtpZHh9fDApICsgKCgke3RoaXMubmFtZX1faW5kZXggKiA0KXwwKSkgPj4yICBdICApXG4gICR7dGhpcy5uYW1lfV9uZXh0ICA9ICR7bmV4dH1cXG5cXG5gXG5cblxuICAgICAgY29uc3QgaW50ZXJwb2xhdGVkPSBgICAke3RoaXMubmFtZX1fb3V0ID0gZnJvdW5kKCAke3RoaXMubmFtZX1fYmFzZSArIGZyb3VuZCgke3RoaXMubmFtZX1fZnJhYyAqIGZyb3VuZCggZnJvdW5kKCBtZW1vcnlbICgoJHtpZHh9fDApICsgKCR7dGhpcy5uYW1lfV9uZXh0ICogNHwwKSkgPj4yIF0pIC0gJHt0aGlzLm5hbWV9X2Jhc2UgKSApIClcXG5cXG5gXG5cbiAgICAgICAgaWYoIHRoaXMuYm91bmRtb2RlID09PSAnaWdub3JlJyApIHtcblxuICAgICAgICAgIGZ1bmN0aW9uQm9keSArPSBgXG4gICAgICAgICAgJHt0aGlzLm5hbWV9X291dCAgID0gJHt0aGlzLm5hbWV9X2luZGV4ID49ICR7dGhpcy5kYXRhLmJ1ZmZlci5sZW5ndGggLSAxfSB8fCAke3RoaXMubmFtZX1faW5kZXggPCAwID8gMCA6ICR7dGhpcy5uYW1lfV9iYXNlICsgJHt0aGlzLm5hbWV9X2ZyYWMgKiAoIG1lbW9yeVsgJHtpZHh9ICsgJHt0aGlzLm5hbWV9X25leHQgXSAtICR7dGhpcy5uYW1lfV9iYXNlIClcXG5cXG5gXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGZ1bmN0aW9uQm9keSArPSBpbnRlcnBvbGF0ZWQvL2AgICR7dGhpcy5uYW1lfV9vdXQgPSBmcm91bmQoMCk7XFxuXFxuYC8vaW50ZXJwb2xhdGVkIFxuICAgICAgICB9XG4vKiBFTkQgTElORUFSIElOVEVSUE9MQVRJT04gKi9cbiAgICAgIH1lbHNle1xuICAgICAgICBpZiggdGhpcy5ib3VuZG1vZGUgPT09ICdjbGFtcCcgKSB7XG4gICAgICAgICAgZnVuY3Rpb25Cb2R5ICs9IGAgICR7dGhpcy5uYW1lfV9vdXQgPSBmcm91bmQoIG1lbW9yeVsgJHtpZHh9ICsgJHt0aGlzLm5hbWV9X2luZGV4IF0gKVxcblxcbmBcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZnVuY3Rpb25Cb2R5ICs9IGAgICR7dGhpcy5uYW1lfV9vdXQgPSBmcm91bmQoIG1lbW9yeVsgKCgke2lkeH18MCkgKyAoKCR7dGhpcy5uYW1lfV9pbmRleCAqIDQpfDApKSA+PjIgIF0gKVxcblxcbmBcbiAgICAgICAgfSAgXG4gICAgICB9XG5cbi8qIEVORCBNT0RFICE9PSBTSU1QTEUgKi9cbiAgICB9IGVsc2UgeyAvLyBtb2RlIGlzIHNpbXBsZVxuICAgICAgZnVuY3Rpb25Cb2R5ID0gYCAgJHt0aGlzLm5hbWV9X291dCA9IGZyb3VuZCggbWVtb3J5WyAoJHtpZHh9ICsgfn5mbG9vcigrJHtpbnB1dHNbMF19ICogNC4wICl8MCAqIDQpID4+IDIgXSlcXG5cXG5gXG4gICAgfVxuXG4gICAgY29uc29sZS5sb2coIGZ1bmN0aW9uQm9keSApXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lKydfb3V0JywgZnVuY3Rpb25Cb2R5IF1cbiAgfSxcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGRhdGEsIGluZGV4LCBwcm9wZXJ0aWVzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvICksXG4gICAgICBkZWZhdWx0cyA9IHsgY2hhbm5lbHM6MSwgbW9kZToncGhhc2UnLCBpbnRlcnA6J2xpbmVhcicsIGJvdW5kbW9kZTond3JhcCcgfSBcbiAgXG4gIGlmKCBwcm9wZXJ0aWVzICE9PSB1bmRlZmluZWQgKSBPYmplY3QuYXNzaWduKCBkZWZhdWx0cywgcHJvcGVydGllcyApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBkYXRhLFxuICAgIGRhdGFOYW1lOiAgIGRhdGEubmFtZSxcbiAgICB1aWQ6ICAgICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgICAgWyBpbmRleCwgZGF0YSBdLFxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGFjY3VtPSByZXF1aXJlKCAnLi9hY2N1bS5qcycgKSxcbiAgICBtdWwgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIHByb3RvID0geyBiYXNlbmFtZToncGhhc29yJyB9XG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9MSwgcmVzZXQ9MCwgcHJvcHMgKSA9PiB7XG4gIGlmKCBwcm9wcyA9PT0gdW5kZWZpbmVkICkgcHJvcHMgPSB7IG1pbjogLTEgfVxuXG4gIGxldCByYW5nZSA9IChwcm9wcy5tYXggfHwgMSApIC0gcHJvcHMubWluXG5cbiAgbGV0IHVnZW4gPSB0eXBlb2YgZnJlcXVlbmN5ID09PSAnbnVtYmVyJyA/IGFjY3VtKCAoZnJlcXVlbmN5ICogcmFuZ2UpIC8gZ2VuLnNhbXBsZXJhdGUsIHJlc2V0LCBwcm9wcyApIDogIGFjY3VtKCBtdWwoIGZyZXF1ZW5jeSwgMS9nZW4uc2FtcGxlcmF0ZS8oMS9yYW5nZSkgKSwgcmVzZXQsIHByb3BzIClcblxuICB1Z2VuLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpLFxuICAgIG11bCAgPSByZXF1aXJlKCcuL211bC5qcycpLFxuICAgIHdyYXAgPSByZXF1aXJlKCcuL3dyYXAuanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidwb2tlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGRhdGFOYW1lID0gJ21lbW9yeScsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgaWR4LCBvdXQsIHdyYXBwZWRcbiAgICBcbiAgICBpZHggPSB0aGlzLmRhdGEuZ2VuKClcblxuICAgIC8vZ2VuLnJlcXVlc3RNZW1vcnkoIHRoaXMubWVtb3J5IClcbiAgICAvL3dyYXBwZWQgPSB3cmFwKCB0aGlzLmlucHV0c1sxXSwgMCwgdGhpcy5kYXRhTGVuZ3RoICkuZ2VuKClcbiAgICAvL2lkeCA9IHdyYXBwZWRbMF1cbiAgICAvL2dlbi5mdW5jdGlvbkJvZHkgKz0gd3JhcHBlZFsxXVxuICAgIGxldCBvdXRwdXRTdHIgPSB0aGlzLmlucHV0c1sxXSA9PT0gMCA/XG4gICAgICBgICAke2RhdGFOYW1lfVsgJHtpZHh9IF0gPSAke2lucHV0c1swXX1cXG5gIDpcbiAgICAgIGAgICR7ZGF0YU5hbWV9WyAke2lkeH0gKyAke2lucHV0c1sxXX0gXSA9ICR7aW5wdXRzWzBdfVxcbmBcblxuICAgIGlmKCB0aGlzLmlubGluZSA9PT0gdW5kZWZpbmVkICkge1xuICAgICAgZ2VuLmZ1bmN0aW9uQm9keSArPSBvdXRwdXRTdHJcbiAgICB9ZWxzZXtcbiAgICAgIHJldHVybiBbIHRoaXMuaW5saW5lLCBvdXRwdXRTdHIgXVxuICAgIH1cbiAgfVxufVxubW9kdWxlLmV4cG9ydHMgPSAoIGRhdGEsIHZhbHVlLCBpbmRleCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGNoYW5uZWxzOjEgfSBcblxuICBpZiggcHJvcGVydGllcyAhPT0gdW5kZWZpbmVkICkgT2JqZWN0LmFzc2lnbiggZGVmYXVsdHMsIHByb3BlcnRpZXMgKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgZGF0YSxcbiAgICBkYXRhTmFtZTogICBkYXRhLm5hbWUsXG4gICAgZGF0YUxlbmd0aDogZGF0YS5idWZmZXIubGVuZ3RoLFxuICAgIHVpZDogICAgICAgIGdlbi5nZXRVSUQoKSxcbiAgICBpbnB1dHM6ICAgICBbIHZhbHVlLCBpbmRleCBdLFxuICB9LFxuICBkZWZhdWx0cyApXG5cblxuICB1Z2VuLm5hbWUgPSB1Z2VuLmJhc2VuYW1lICsgdWdlbi51aWRcbiAgXG4gIGdlbi5oaXN0b3JpZXMuc2V0KCB1Z2VuLm5hbWUsIHVnZW4gKVxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgYmFzZW5hbWU6J3BvdycsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgfHwgaXNOYU4oIGlucHV0c1sxXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7ICdwb3cnOiBNYXRoLnBvdyB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnBvdyggJHtpbnB1dHNbMF19LCAke2lucHV0c1sxXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgaWYoIHR5cGVvZiBpbnB1dHNbMF0gPT09ICdzdHJpbmcnICYmIGlucHV0c1swXVswXSA9PT0gJygnICkge1xuICAgICAgICBpbnB1dHNbMF0gPSBpbnB1dHNbMF0uc2xpY2UoMSwtMSlcbiAgICAgIH1cbiAgICAgIGlmKCB0eXBlb2YgaW5wdXRzWzFdID09PSAnc3RyaW5nJyAmJiBpbnB1dHNbMV1bMF0gPT09ICcoJyApIHtcbiAgICAgICAgaW5wdXRzWzFdID0gaW5wdXRzWzFdLnNsaWNlKDEsLTEpXG4gICAgICB9XG5cbiAgICAgIG91dCA9IE1hdGgucG93KCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSwgcGFyc2VGbG9hdCggaW5wdXRzWzFdKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICh4LHkpID0+IHtcbiAgbGV0IHBvdyA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICBwb3cuaW5wdXRzID0gWyB4LHkgXVxuICBwb3cuaWQgPSBnZW4uZ2V0VUlEKClcbiAgcG93Lm5hbWUgPSBgJHtwb3cuYmFzZW5hbWV9e3Bvdy5pZH1gXG5cbiAgcmV0dXJuIHBvd1xufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGhpc3RvcnkgPSByZXF1aXJlKCAnLi9oaXN0b3J5LmpzJyApLFxuICAgIHN1YiAgICAgPSByZXF1aXJlKCAnLi9zdWIuanMnICksXG4gICAgYWRkICAgICA9IHJlcXVpcmUoICcuL2FkZC5qcycgKSxcbiAgICBtdWwgICAgID0gcmVxdWlyZSggJy4vbXVsLmpzJyApLFxuICAgIG1lbW8gICAgPSByZXF1aXJlKCAnLi9tZW1vLmpzJyApLFxuICAgIGRlbHRhICAgPSByZXF1aXJlKCAnLi9kZWx0YS5qcycgKSxcbiAgICB3cmFwICAgID0gcmVxdWlyZSggJy4vd3JhcC5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidyYXRlJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgcGhhc2UgID0gaGlzdG9yeSgpLFxuICAgICAgICBpbk1pbnVzMSA9IGhpc3RvcnkoKSxcbiAgICAgICAgZ2VuTmFtZSA9ICdnZW4uJyArIHRoaXMubmFtZSxcbiAgICAgICAgZmlsdGVyLCBzdW0sIG91dFxuXG4gICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgdGhpcy5uYW1lIF06IHRoaXMgfSkgXG5cbiAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9kaWZmID0gJHtpbnB1dHNbMF19IC0gJHtnZW5OYW1lfS5sYXN0U2FtcGxlXG4gIGlmKCAke3RoaXMubmFtZX1fZGlmZiA8IC0uNSApICR7dGhpcy5uYW1lfV9kaWZmICs9IDFcbiAgJHtnZW5OYW1lfS5waGFzZSArPSAke3RoaXMubmFtZX1fZGlmZiAqICR7aW5wdXRzWzFdfVxuICBpZiggJHtnZW5OYW1lfS5waGFzZSA+IDEgKSAke2dlbk5hbWV9LnBoYXNlIC09IDFcbiAgJHtnZW5OYW1lfS5sYXN0U2FtcGxlID0gJHtpbnB1dHNbMF19XG5gXG4gICAgb3V0ID0gJyAnICsgb3V0XG5cbiAgICByZXR1cm4gWyBnZW5OYW1lICsgJy5waGFzZScsIG91dCBdXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSAoIGluMSwgcmF0ZSApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgT2JqZWN0LmFzc2lnbiggdWdlbiwgeyBcbiAgICBwaGFzZTogICAgICAwLFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCByYXRlIF0sXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZToncm91bmQnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgWyB0aGlzLm5hbWUgXTogTWF0aC5yb3VuZCB9KVxuXG4gICAgICBvdXQgPSBgZ2VuLnJvdW5kKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnJvdW5kKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgcm91bmQgPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG5cbiAgcm91bmQuaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gcm91bmRcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzYWgnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApLCBvdXRcblxuICAgIGdlbi5kYXRhWyB0aGlzLm5hbWUgXSA9IDBcbiAgICBnZW4uZGF0YVsgdGhpcy5uYW1lICsgJ19jb250cm9sJyBdID0gMFxuXG4gICAgb3V0ID0gXG5gIHZhciAke3RoaXMubmFtZX0gPSBnZW4uZGF0YS4ke3RoaXMubmFtZX1fY29udHJvbCxcbiAgICAgICR7dGhpcy5uYW1lfV90cmlnZ2VyID0gJHtpbnB1dHNbMV19ID4gJHtpbnB1dHNbMl19ID8gMSA6IDBcblxuICBpZiggJHt0aGlzLm5hbWV9X3RyaWdnZXIgIT09ICR7dGhpcy5uYW1lfSAgKSB7XG4gICAgaWYoICR7dGhpcy5uYW1lfV90cmlnZ2VyID09PSAxICkgXG4gICAgICBnZW4uZGF0YS4ke3RoaXMubmFtZX0gPSAke2lucHV0c1swXX1cbiAgICBnZW4uZGF0YS4ke3RoaXMubmFtZX1fY29udHJvbCA9ICR7dGhpcy5uYW1lfV90cmlnZ2VyXG4gIH1cbmBcbiAgICBcbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgZ2VuLmRhdGEuJHt0aGlzLm5hbWV9YFxuXG4gICAgcmV0dXJuIFsgYGdlbi5kYXRhLiR7dGhpcy5uYW1lfWAsICcgJyArb3V0IF1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBjb250cm9sLCB0aHJlc2hvbGQ9MCwgcHJvcGVydGllcyApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApLFxuICAgICAgZGVmYXVsdHMgPSB7IGluaXQ6MCB9XG5cbiAgaWYoIHByb3BlcnRpZXMgIT09IHVuZGVmaW5lZCApIE9iamVjdC5hc3NpZ24oIGRlZmF1bHRzLCBwcm9wZXJ0aWVzIClcblxuICBPYmplY3QuYXNzaWduKCB1Z2VuLCB7IFxuICAgIGxhc3RTYW1wbGU6IDAsXG4gICAgdWlkOiAgICAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogICAgIFsgaW4xLCBjb250cm9sLHRocmVzaG9sZCBdLFxuICB9LFxuICBkZWZhdWx0cyApXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzZWxlY3RvcicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksIG91dCwgcmV0dXJuVmFsdWUgPSAwXG4gICAgXG4gICAgc3dpdGNoKCBpbnB1dHMubGVuZ3RoICkge1xuICAgICAgY2FzZSAyIDpcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBpbnB1dHNbMV1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDMgOlxuICAgICAgICBvdXQgPSBgICB2YXIgJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzWzBdfSA9PT0gMSA/ICR7aW5wdXRzWzFdfSA6ICR7aW5wdXRzWzJdfVxcblxcbmA7XG4gICAgICAgIHJldHVyblZhbHVlID0gWyB0aGlzLm5hbWUgKyAnX291dCcsIG91dCBdXG4gICAgICAgIGJyZWFrOyAgXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBvdXQgPSBcbmAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAwXG4gIHN3aXRjaCggJHtpbnB1dHNbMF19ICsgMSApIHtcXG5gXG5cbiAgICAgICAgZm9yKCBsZXQgaSA9IDE7IGkgPCBpbnB1dHMubGVuZ3RoOyBpKysgKXtcbiAgICAgICAgICBvdXQgKz1gICAgIGNhc2UgJHtpfTogJHt0aGlzLm5hbWV9X291dCA9ICR7aW5wdXRzW2ldfTsgYnJlYWs7XFxuYCBcbiAgICAgICAgfVxuXG4gICAgICAgIG91dCArPSAnICB9XFxuXFxuJ1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuVmFsdWUgPSBbIHRoaXMubmFtZSArICdfb3V0JywgJyAnICsgb3V0IF1cbiAgICB9XG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSB0aGlzLm5hbWUgKyAnX291dCdcblxuICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggLi4uaW5wdXRzICkgPT4ge1xuICBsZXQgdWdlbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcbiAgXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzXG4gIH0pXG4gIFxuICB1Z2VuLm5hbWUgPSBgJHt1Z2VuLmJhc2VuYW1lfSR7dWdlbi51aWR9YFxuXG4gIHJldHVybiB1Z2VuXG59XG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiAgPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbmxldCBwcm90byA9IHtcbiAgbmFtZTonc2lnbicsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyBbIHRoaXMubmFtZSBdOiBNYXRoLnNpZ24gfSlcblxuICAgICAgb3V0ID0gYGdlbi5zaWduKCAke2lucHV0c1swXX0gKWBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnNpZ24oIHBhcnNlRmxvYXQoIGlucHV0c1swXSApIClcbiAgICB9XG4gICAgXG4gICAgcmV0dXJuIG91dFxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0geCA9PiB7XG4gIGxldCBzaWduID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpZ24uaW5wdXRzID0gWyB4IF1cblxuICByZXR1cm4gc2lnblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOidzaW4nLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzIClcblxuICAgIGdlbi52YXJpYWJsZU5hbWVzLmFkZCggW3RoaXMubmFtZSwgJ2YnXSApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcblxuICAgICAgb3V0ID0gWyB0aGlzLm5hbWUsIGAgICR7dGhpcy5uYW1lfSA9IGZyb3VuZCggc2luKCAke2lucHV0c1swXX0gKSApO1xcbmAgXVxuXG4gICAgfSBlbHNlIHtcbiAgICAgIG91dCA9IE1hdGguc2luKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgc2luID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHNpbi5pbnB1dHMgPSBbIHggXVxuICBzaW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgc2luLm5hbWUgPSBgJHtzaW4uYmFzZW5hbWV9JHtzaW4uaWR9YFxuXG4gIHJldHVybiBzaW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICAgICA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBoaXN0b3J5ID0gcmVxdWlyZSggJy4vaGlzdG9yeS5qcycgKSxcbiAgICBzdWIgICAgID0gcmVxdWlyZSggJy4vc3ViLmpzJyApLFxuICAgIGFkZCAgICAgPSByZXF1aXJlKCAnLi9hZGQuanMnICksXG4gICAgbXVsICAgICA9IHJlcXVpcmUoICcuL211bC5qcycgKSxcbiAgICBtZW1vICAgID0gcmVxdWlyZSggJy4vbWVtby5qcycgKSxcbiAgICBndCAgICAgID0gcmVxdWlyZSggJy4vZ3QuanMnICksXG4gICAgZGl2ICAgICA9IHJlcXVpcmUoICcuL2Rpdi5qcycgKSxcbiAgICBfc3dpdGNoID0gcmVxdWlyZSggJy4vc3dpdGNoLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBpbjEsIHNsaWRlVXAgPSAxLCBzbGlkZURvd24gPSAxICkgPT4ge1xuICBsZXQgeTEgPSBoaXN0b3J5KDApLFxuICAgICAgZmlsdGVyLCBzbGlkZUFtb3VudFxuXG4gIC8veSAobikgPSB5IChuLTEpICsgKCh4IChuKSAtIHkgKG4tMSkpL3NsaWRlKSBcbiAgc2xpZGVBbW91bnQgPSBfc3dpdGNoKCBndChpbjEseTEub3V0KSwgc2xpZGVVcCwgc2xpZGVEb3duIClcblxuICBmaWx0ZXIgPSBtZW1vKCBhZGQoIHkxLm91dCwgZGl2KCBzdWIoIGluMSwgeTEub3V0ICksIHNsaWRlQW1vdW50ICkgKSApXG5cbiAgeTEuaW4oIGZpbHRlciApXG5cbiAgcmV0dXJuIGZpbHRlclxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCcuL2dlbi5qcycpXG5cbm1vZHVsZS5leHBvcnRzID0gKCAuLi5hcmdzICkgPT4ge1xuICBsZXQgc3ViID0ge1xuICAgIGlkOiAgICAgZ2VuLmdldFVJRCgpLFxuICAgIGlucHV0czogYXJncyxcblxuICAgIGdlbigpIHtcbiAgICAgIGxldCBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgICAgb3V0PTAsXG4gICAgICAgICAgZGlmZiA9IDAsXG4gICAgICAgICAgbmVlZHNQYXJlbnMgPSBmYWxzZSwgXG4gICAgICAgICAgbnVtQ291bnQgPSAwLFxuICAgICAgICAgIGxhc3ROdW1iZXIgPSBpbnB1dHNbIDAgXSxcbiAgICAgICAgICBsYXN0TnVtYmVySXNVZ2VuID0gaXNOYU4oIGxhc3ROdW1iZXIgKSwgXG4gICAgICAgICAgc3ViQXRFbmQgPSBmYWxzZSxcbiAgICAgICAgICBoYXNVZ2VucyA9IGZhbHNlLFxuICAgICAgICAgIHJldHVyblZhbHVlID0gMFxuXG4gICAgICBnZW4udmFyaWFibGVOYW1lcy5hZGQoIFt0aGlzLm5hbWUsJ2YnXSApXG5cbiAgICAgIHRoaXMuaW5wdXRzLmZvckVhY2goIHZhbHVlID0+IHsgaWYoIGlzTmFOKCB2YWx1ZSApICkgaGFzVWdlbnMgPSB0cnVlIH0pXG4gICAgICBcbiAgICAgIGlmKCBoYXNVZ2VucyApIHsgLy8gc3RvcmUgaW4gdmFyaWFibGUgZm9yIGZ1dHVyZSByZWZlcmVuY2VcbiAgICAgICAgb3V0ID0gJyAgJyArIHRoaXMubmFtZSArICcgPSBmcm91bmQoJ1xuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9ICcoJ1xuICAgICAgfVxuXG4gICAgICBpbnB1dHMuZm9yRWFjaCggKHYsaSkgPT4ge1xuICAgICAgICBpZiggaSA9PT0gMCApIHJldHVyblxuXG4gICAgICAgIGxldCBpc051bWJlclVnZW4gPSBpc05hTiggdiApLFxuICAgICAgICAgICAgaXNGaW5hbElkeCAgID0gaSA9PT0gaW5wdXRzLmxlbmd0aCAtIDFcblxuICAgICAgICBpZiggIWxhc3ROdW1iZXJJc1VnZW4gJiYgIWlzTnVtYmVyVWdlbiApIHtcbiAgICAgICAgICBsYXN0TnVtYmVyID0gbGFzdE51bWJlciAtIHZcbiAgICAgICAgICBvdXQgKz0gbGFzdE51bWJlclxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBuZWVkc1BhcmVucyA9IHRydWVcbiAgICAgICAgICBvdXQgKz0gYCR7bGFzdE51bWJlcn0gLSAke3Z9YFxuICAgICAgICB9XG5cbiAgICAgICAgaWYoICFpc0ZpbmFsSWR4ICkgb3V0ICs9ICcgLSAnIFxuICAgICAgfSlcbiAgICBcbiAgICAgIGlmKCBuZWVkc1BhcmVucyApIHtcbiAgICAgICAgb3V0ICs9ICcpJ1xuICAgICAgfWVsc2V7XG4gICAgICAgIG91dCA9IG91dC5zbGljZSggMSApIC8vIHJlbW92ZSBvcGVuaW5nIHBhcmVuXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKCBoYXNVZ2VucyApIG91dCArPSAnXFxuJ1xuXG4gICAgICByZXR1cm5WYWx1ZSA9IGhhc1VnZW5zID8gWyB0aGlzLm5hbWUsIG91dCBdIDogb3V0XG4gICAgICBcbiAgICAgIC8vaWYoIGhhc1VnZW5zICkgZ2VuLm1lbW9bIHRoaXMubmFtZSBdID0gdGhpcy5uYW1lXG5cbiAgICAgIHJldHVybiByZXR1cm5WYWx1ZVxuICAgIH1cbiAgfVxuICAgXG4gIHN1Yi5uYW1lID0gJ3N1Yicrc3ViLmlkXG5cbiAgcmV0dXJuIHN1YlxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gPSByZXF1aXJlKCAnLi9nZW4uanMnIClcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTonc3dpdGNoJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSwgb3V0XG5cbiAgICBpZiggaW5wdXRzWzFdID09PSBpbnB1dHNbMl0gKSByZXR1cm4gaW5wdXRzWzFdIC8vIGlmIGJvdGggcG90ZW50aWFsIG91dHB1dHMgYXJlIHRoZSBzYW1lIGp1c3QgcmV0dXJuIG9uZSBvZiB0aGVtXG4gICAgXG4gICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfV9vdXQgPSAke2lucHV0c1swXX0gPT09IDEgPyAke2lucHV0c1sxXX0gOiAke2lucHV0c1syXX1cXG5gXG5cbiAgICBnZW4ubWVtb1sgdGhpcy5uYW1lIF0gPSBgJHt0aGlzLm5hbWV9X291dGBcblxuICAgIHJldHVybiBbIGAke3RoaXMubmFtZX1fb3V0YCwgb3V0IF1cbiAgfSxcblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggY29udHJvbCwgaW4xID0gMSwgaW4yID0gMCApID0+IHtcbiAgbGV0IHVnZW4gPSBPYmplY3QuY3JlYXRlKCBwcm90byApXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHtcbiAgICB1aWQ6ICAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiAgWyBjb250cm9sLCBpbjEsIGluMiBdLFxuICB9KVxuICBcbiAgdWdlbi5uYW1lID0gYCR7dWdlbi5iYXNlbmFtZX0ke3VnZW4udWlkfWBcblxuICByZXR1cm4gdWdlblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid0NjAnLFxuXG4gIGdlbigpIHtcbiAgICBsZXQgb3V0LFxuICAgICAgICBpbnB1dHMgPSBnZW4uZ2V0SW5wdXRzKCB0aGlzICksXG4gICAgICAgIHJldHVyblZhbHVlXG5cbiAgICBpZiggaXNOYU4oIGlucHV0c1swXSApICkge1xuICAgICAgZ2VuLmNsb3N1cmVzLmFkZCh7IFsgJ2V4cCcgXTogTWF0aC5leHAgfSlcblxuICAgICAgb3V0ID0gYCAgdmFyICR7dGhpcy5uYW1lfSA9IGdlbi5leHAoIC02LjkwNzc1NTI3ODkyMSAvICR7aW5wdXRzWzBdfSApXFxuXFxuYFxuICAgICBcbiAgICAgIGdlbi5tZW1vWyB0aGlzLm5hbWUgXSA9IG91dFxuICAgICAgXG4gICAgICByZXR1cm5WYWx1ZSA9IFsgdGhpcy5uYW1lLCBvdXQgXVxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLmV4cCggLTYuOTA3NzU1Mjc4OTIxIC8gaW5wdXRzWzBdIClcblxuICAgICAgcmV0dXJuVmFsdWUgPSBvdXRcbiAgICB9ICAgIFxuXG4gICAgcmV0dXJuIHJldHVyblZhbHVlXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHQ2MCA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0NjAuaW5wdXRzID0gWyB4IF1cbiAgdDYwLm5hbWUgPSBwcm90by5iYXNlbmFtZSArIGdlbi5nZXRVSUQoKVxuXG4gIHJldHVybiB0NjBcbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondGFuJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IG91dCxcbiAgICAgICAgaW5wdXRzID0gZ2VuLmdldElucHV0cyggdGhpcyApXG4gICAgXG4gICAgaWYoIGlzTmFOKCBpbnB1dHNbMF0gKSApIHtcbiAgICAgIGdlbi5jbG9zdXJlcy5hZGQoeyAndGFuJzogTWF0aC50YW4gfSlcblxuICAgICAgb3V0ID0gYGdlbi50YW4oICR7aW5wdXRzWzBdfSApYCBcblxuICAgIH0gZWxzZSB7XG4gICAgICBvdXQgPSBNYXRoLnRhbiggcGFyc2VGbG9hdCggaW5wdXRzWzBdICkgKVxuICAgIH1cbiAgICBcbiAgICByZXR1cm4gb3V0XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB4ID0+IHtcbiAgbGV0IHRhbiA9IE9iamVjdC5jcmVhdGUoIHByb3RvIClcblxuICB0YW4uaW5wdXRzID0gWyB4IF1cbiAgdGFuLmlkID0gZ2VuLmdldFVJRCgpXG4gIHRhbi5uYW1lID0gYCR7dGFuLmJhc2VuYW1lfXt0YW4uaWR9YFxuXG4gIHJldHVybiB0YW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgZ2VuICA9IHJlcXVpcmUoJy4vZ2VuLmpzJylcblxubGV0IHByb3RvID0ge1xuICBiYXNlbmFtZTondGFuaCcsXG5cbiAgZ2VuKCkge1xuICAgIGxldCBvdXQsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKVxuICAgIFxuICAgIGlmKCBpc05hTiggaW5wdXRzWzBdICkgKSB7XG4gICAgICBnZW4uY2xvc3VyZXMuYWRkKHsgJ3RhbmgnOiBNYXRoLnRhbmggfSlcblxuICAgICAgb3V0ID0gYGdlbi50YW5oKCAke2lucHV0c1swXX0gKWAgXG5cbiAgICB9IGVsc2Uge1xuICAgICAgb3V0ID0gTWF0aC50YW5oKCBwYXJzZUZsb2F0KCBpbnB1dHNbMF0gKSApXG4gICAgfVxuICAgIFxuICAgIHJldHVybiBvdXRcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHggPT4ge1xuICBsZXQgdGFuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIHRhbi5pbnB1dHMgPSBbIHggXVxuICB0YW4uaWQgPSBnZW4uZ2V0VUlEKClcbiAgdGFuLm5hbWUgPSBgJHt0YW4uYmFzZW5hbWV9e3Rhbi5pZH1gXG5cbiAgcmV0dXJuIHRhblxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gICAgID0gcmVxdWlyZSggJy4vZ2VuLmpzJyApLFxuICAgIGx0ICAgICAgPSByZXF1aXJlKCAnLi9sdC5qcycgKSxcbiAgICBwaGFzb3IgID0gcmVxdWlyZSggJy4vcGhhc29yLmpzJyApXG5cbm1vZHVsZS5leHBvcnRzID0gKCBmcmVxdWVuY3k9NDQwLCBwdWxzZXdpZHRoPS41ICkgPT4ge1xuICBsZXQgZ3JhcGggPSBsdCggYWNjdW0oIGRpdiggZnJlcXVlbmN5LCA0NDEwMCApICksIC41IClcblxuICBncmFwaC5uYW1lID0gYHRyYWluJHtnZW4uZ2V0VUlEKCl9YFxuXG4gIHJldHVybiBncmFwaFxufVxuXG4iLCIndXNlIHN0cmljdCdcblxubGV0IGdlbiA9IHJlcXVpcmUoICcuL2dlbi5qcycgKSxcbiAgICBkYXRhID0gcmVxdWlyZSggJy4vZGF0YS5qcycgKVxuXG5sZXQgaXNTdGVyZW8gPSBmYWxzZVxuXG5sZXQgdXRpbGl0aWVzID0ge1xuICBjdHg6IG51bGwsXG5cbiAgY2xlYXIoKSB7XG4gICAgdGhpcy5jYWxsYmFjayA9ICgpID0+IDAgXG4gICAgdGhpcy5jbGVhci5jYWxsYmFja3MuZm9yRWFjaCggdiA9PiB2KCkgKVxuICAgIHRoaXMuY2xlYXIuY2FsbGJhY2tzLmxlbmd0aCA9IDBcbiAgfSxcblxuICBjcmVhdGVDb250ZXh0KCkge1xuICAgIGxldCBBQyA9IHR5cGVvZiBBdWRpb0NvbnRleHQgPT09ICd1bmRlZmluZWQnID8gd2Via2l0QXVkaW9Db250ZXh0IDogQXVkaW9Db250ZXh0XG4gICAgdGhpcy5jdHggPSBuZXcgQUMoKVxuICAgIGdlbi5zYW1wbGVyYXRlID0gdGhpcy5jdHguc2FtcGxlUmF0ZVxuXG4gICAgbGV0IHN0YXJ0ID0gKCkgPT4ge1xuICAgICAgaWYoIHR5cGVvZiBBQyAhPT0gJ3VuZGVmaW5lZCcgKSB7XG4gICAgICAgIGlmKCBkb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgJiYgJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50ICkge1xuICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAndG91Y2hzdGFydCcsIHN0YXJ0IClcblxuICAgICAgICAgIGlmKCAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKXsgLy8gcmVxdWlyZWQgdG8gc3RhcnQgYXVkaW8gdW5kZXIgaU9TIDZcbiAgICAgICAgICAgIGxldCBteVNvdXJjZSA9IHV0aWxpdGllcy5jdHguY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgICAgICAgIG15U291cmNlLmNvbm5lY3QoIHV0aWxpdGllcy5jdHguZGVzdGluYXRpb24gKVxuICAgICAgICAgICAgbXlTb3VyY2Uubm90ZU9uKCAwIClcbiAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYoIGRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCAmJiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQgKSB7XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3RvdWNoc3RhcnQnLCBzdGFydCApXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfSxcblxuICBjcmVhdGVTY3JpcHRQcm9jZXNzb3IoKSB7XG4gICAgdGhpcy5ub2RlID0gdGhpcy5jdHguY3JlYXRlU2NyaXB0UHJvY2Vzc29yKCAxMDI0LCAwLCAyICksXG4gICAgdGhpcy5jbGVhckZ1bmN0aW9uID0gZnVuY3Rpb24oKSB7IHJldHVybiAwIH0sXG4gICAgdGhpcy5jYWxsYmFjayA9IHRoaXMuY2xlYXJGdW5jdGlvblxuXG4gICAgdGhpcy5ub2RlLm9uYXVkaW9wcm9jZXNzID0gZnVuY3Rpb24oIGF1ZGlvUHJvY2Vzc2luZ0V2ZW50ICkge1xuICAgICAgdmFyIG91dHB1dEJ1ZmZlciA9IGF1ZGlvUHJvY2Vzc2luZ0V2ZW50Lm91dHB1dEJ1ZmZlcjtcblxuICAgICAgdmFyIGxlZnQgPSBvdXRwdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEoIDAgKSxcbiAgICAgICAgICByaWdodD0gb3V0cHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKCAxICksXG4gICAgICAgICAgbWVtb3J5ID0gZ2VuLm1lbW9yeS5oZWFwXG5cbiAgICAgIGZvciAodmFyIHNhbXBsZSA9IDA7IHNhbXBsZSA8IGxlZnQubGVuZ3RoOyBzYW1wbGUrKykge1xuICAgICAgICBcbiAgICAgICAgdXRpbGl0aWVzLmNhbGxiYWNrKClcblxuICAgICAgICBpZiggIWlzU3RlcmVvICkge1xuICAgICAgICAgIGxlZnRbIHNhbXBsZSBdID0gcmlnaHRbIHNhbXBsZSBdID0gbWVtb3J5WzBdLy91dGlsaXRpZXMuY2FsbGJhY2soKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBsZWZ0WyBzYW1wbGUgIF0gPSBtZW1vcnlbMF1cbiAgICAgICAgICByaWdodFsgc2FtcGxlIF0gPSBtZW1vcnlbMV1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMubm9kZS5jb25uZWN0KCB0aGlzLmN0eC5kZXN0aW5hdGlvbiApXG5cbiAgICAvL3RoaXMubm9kZS5jb25uZWN0KCB0aGlzLmFuYWx5emVyIClcblxuICAgIHJldHVybiB0aGlzXG4gIH0sXG4gIFxuICBwbGF5R3JhcGgoIGdyYXBoLCBkZWJ1ZywgbWVtPTQ0MTAwKjEwICkge1xuICAgIHV0aWxpdGllcy5jbGVhcigpXG4gICAgaWYoIGRlYnVnID09PSB1bmRlZmluZWQgKSBkZWJ1ZyA9IGZhbHNlXG4gICAgICAgICAgXG4gICAgaXNTdGVyZW8gPSBBcnJheS5pc0FycmF5KCBncmFwaCApXG5cbiAgICB1dGlsaXRpZXMuY2FsbGJhY2sgPSBnZW4uY3JlYXRlQ2FsbGJhY2soIGdyYXBoLCBtZW0sIGRlYnVnIClcbiAgICBcbiAgICBpZiggdXRpbGl0aWVzLmNvbnNvbGUgKSB1dGlsaXRpZXMuY29uc29sZS5zZXRWYWx1ZSggdXRpbGl0aWVzLmNhbGxiYWNrLnRvU3RyaW5nKCkgKVxuXG4gICAgcmV0dXJuIHV0aWxpdGllcy5jYWxsYmFja1xuICB9LFxuXG4gIGxvYWRTYW1wbGUoIHNvdW5kRmlsZVBhdGgsIGRhdGEgKSB7XG4gICAgbGV0IHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG4gICAgcmVxLm9wZW4oICdHRVQnLCBzb3VuZEZpbGVQYXRoLCB0cnVlIClcbiAgICByZXEucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJyBcbiAgICBcbiAgICBsZXQgcHJvbWlzZSA9IG5ldyBQcm9taXNlKCAocmVzb2x2ZSxyZWplY3QpID0+IHtcbiAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGF1ZGlvRGF0YSA9IHJlcS5yZXNwb25zZVxuXG4gICAgICAgIHV0aWxpdGllcy5jdHguZGVjb2RlQXVkaW9EYXRhKCBhdWRpb0RhdGEsIChidWZmZXIpID0+IHtcbiAgICAgICAgICBkYXRhLmJ1ZmZlciA9IGJ1ZmZlci5nZXRDaGFubmVsRGF0YSgwKVxuICAgICAgICAgIHJlc29sdmUoIGRhdGEuYnVmZmVyIClcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmVxLnNlbmQoKVxuXG4gICAgcmV0dXJuIHByb21pc2VcbiAgfVxuXG59XG5cbnV0aWxpdGllcy5jbGVhci5jYWxsYmFja3MgPSBbXVxuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWxpdGllc1xuIiwiJ3VzZSBzdHJpY3QnXG5cbi8qXG4gKiBtYW55IHdpbmRvd3MgaGVyZSBhZGFwdGVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL2NvcmJhbmJyb29rL2RzcC5qcy9ibG9iL21hc3Rlci9kc3AuanNcbiAqIHN0YXJ0aW5nIGF0IGxpbmUgMTQyN1xuICogdGFrZW4gOC8xNS8xNlxuKi8gXG5cbmNvbnN0IHdpbmRvd3MgPSBtb2R1bGUuZXhwb3J0cyA9IHsgXG4gIGJhcnRsZXR0KCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAyIC8gKGxlbmd0aCAtIDEpICogKChsZW5ndGggLSAxKSAvIDIgLSBNYXRoLmFicyhpbmRleCAtIChsZW5ndGggLSAxKSAvIDIpKSBcbiAgfSxcblxuICBiYXJ0bGV0dEhhbm4oIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDAuNjIgLSAwLjQ4ICogTWF0aC5hYnMoaW5kZXggLyAobGVuZ3RoIC0gMSkgLSAwLjUpIC0gMC4zOCAqIE1hdGguY29zKCAyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKVxuICB9LFxuXG4gIGJsYWNrbWFuKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICBsZXQgYTAgPSAoMSAtIGFscGhhKSAvIDIsXG4gICAgICAgIGExID0gMC41LFxuICAgICAgICBhMiA9IGFscGhhIC8gMlxuXG4gICAgcmV0dXJuIGEwIC0gYTEgKiBNYXRoLmNvcygyICogTWF0aC5QSSAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSArIGEyICogTWF0aC5jb3MoNCAqIE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBjb3NpbmUoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIE1hdGguY29zKE1hdGguUEkgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIE1hdGguUEkgLyAyKVxuICB9LFxuXG4gIGdhdXNzKCBsZW5ndGgsIGluZGV4LCBhbHBoYSApIHtcbiAgICByZXR1cm4gTWF0aC5wb3coTWF0aC5FLCAtMC41ICogTWF0aC5wb3coKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikgLyAoYWxwaGEgKiAobGVuZ3RoIC0gMSkgLyAyKSwgMikpXG4gIH0sXG5cbiAgaGFtbWluZyggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMC41NCAtIDAuNDYgKiBNYXRoLmNvcyggTWF0aC5QSSAqIDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSlcbiAgfSxcblxuICBoYW5uKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiAwLjUgKiAoMSAtIE1hdGguY29zKCBNYXRoLlBJICogMiAqIGluZGV4IC8gKGxlbmd0aCAtIDEpKSApXG4gIH0sXG5cbiAgbGFuY3pvcyggbGVuZ3RoLCBpbmRleCApIHtcbiAgICBsZXQgeCA9IDIgKiBpbmRleCAvIChsZW5ndGggLSAxKSAtIDE7XG4gICAgcmV0dXJuIE1hdGguc2luKE1hdGguUEkgKiB4KSAvIChNYXRoLlBJICogeClcbiAgfSxcblxuICByZWN0YW5ndWxhciggbGVuZ3RoLCBpbmRleCApIHtcbiAgICByZXR1cm4gMVxuICB9LFxuXG4gIHRyaWFuZ3VsYXIoIGxlbmd0aCwgaW5kZXggKSB7XG4gICAgcmV0dXJuIDIgLyBsZW5ndGggKiAobGVuZ3RoIC8gMiAtIE1hdGguYWJzKGluZGV4IC0gKGxlbmd0aCAtIDEpIC8gMikpXG4gIH0sXG5cbiAgLy8gcGFyYWJvbGFcbiAgd2VsY2goIGxlbmd0aCwgX2luZGV4LCBpZ25vcmUsIHNoaWZ0ICkge1xuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIGNvbnN0IGluZGV4ID0gc2hpZnQgPT09IDAgPyBfaW5kZXggOiAoX2luZGV4ICsgTWF0aC5mbG9vciggc2hpZnQgKiBsZW5ndGggKSkgJSBsZW5ndGhcbiAgICBjb25zdCBuXzFfb3ZlcjIgPSAobGVuZ3RoIC0gMSkgLyAyIFxuXG4gICAgcmV0dXJuIDEgLSBNYXRoLnBvdyggKCBpbmRleCAtIG5fMV9vdmVyMiApIC8gbl8xX292ZXIyLCAyIClcbiAgfSxcbiAgaW52ZXJzZXdlbGNoKCBsZW5ndGgsIF9pbmRleCwgaWdub3JlLCBzaGlmdD0wICkge1xuICAgIC8vd1tuXSA9IDEgLSBNYXRoLnBvdyggKCBuIC0gKCAoTi0xKSAvIDIgKSApIC8gKCggTi0xICkgLyAyICksIDIgKVxuICAgIGxldCBpbmRleCA9IHNoaWZ0ID09PSAwID8gX2luZGV4IDogKF9pbmRleCArIE1hdGguZmxvb3IoIHNoaWZ0ICogbGVuZ3RoICkpICUgbGVuZ3RoXG4gICAgY29uc3Qgbl8xX292ZXIyID0gKGxlbmd0aCAtIDEpIC8gMlxuXG4gICAgcmV0dXJuIE1hdGgucG93KCAoIGluZGV4IC0gbl8xX292ZXIyICkgLyBuXzFfb3ZlcjIsIDIgKVxuICB9LFxuXG4gIHBhcmFib2xhKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIGlmKCBpbmRleCA8PSBsZW5ndGggLyAyICkge1xuICAgICAgcmV0dXJuIHdpbmRvd3MuaW52ZXJzZXdlbGNoKCBsZW5ndGggLyAyLCBpbmRleCApIC0gMVxuICAgIH1lbHNle1xuICAgICAgcmV0dXJuIDEgLSB3aW5kb3dzLmludmVyc2V3ZWxjaCggbGVuZ3RoIC8gMiwgaW5kZXggLSBsZW5ndGggLyAyIClcbiAgICB9XG4gIH0sXG5cbiAgZXhwb25lbnRpYWwoIGxlbmd0aCwgaW5kZXgsIGFscGhhICkge1xuICAgIHJldHVybiBNYXRoLnBvdyggaW5kZXgvbGVuZ3RoLCBhbHBoYSApXG4gIH0sXG5cbiAgbGluZWFyKCBsZW5ndGgsIGluZGV4ICkge1xuICAgIHJldHVybiBpbmRleC9sZW5ndGhcbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnXG5cbmxldCBnZW4gID0gcmVxdWlyZSgnLi9nZW4uanMnKSxcbiAgICBmbG9vcj0gcmVxdWlyZSgnLi9mbG9vci5qcycpLFxuICAgIHN1YiAgPSByZXF1aXJlKCcuL3N1Yi5qcycpLFxuICAgIG1lbW8gPSByZXF1aXJlKCcuL21lbW8uanMnKVxuXG5sZXQgcHJvdG8gPSB7XG4gIGJhc2VuYW1lOid3cmFwJyxcblxuICBnZW4oKSB7XG4gICAgbGV0IGNvZGUsXG4gICAgICAgIGlucHV0cyA9IGdlbi5nZXRJbnB1dHMoIHRoaXMgKSxcbiAgICAgICAgc2lnbmFsID0gaW5wdXRzWzBdLCBtaW4gPSBpbnB1dHNbMV0sIG1heCA9IGlucHV0c1syXSxcbiAgICAgICAgb3V0LCBkaWZmXG5cbiAgICAvL291dCA9IGAoKCgke2lucHV0c1swXX0gLSAke3RoaXMubWlufSkgJSAke2RpZmZ9ICArICR7ZGlmZn0pICUgJHtkaWZmfSArICR7dGhpcy5taW59KWBcbiAgICAvL2NvbnN0IGxvbmcgbnVtV3JhcHMgPSBsb25nKCh2LWxvKS9yYW5nZSkgLSAodiA8IGxvKTtcbiAgICAvL3JldHVybiB2IC0gcmFuZ2UgKiBkb3VibGUobnVtV3JhcHMpOyAgIFxuICAgIFxuICAgIGlmKCB0aGlzLm1pbiA9PT0gMCApIHtcbiAgICAgIGRpZmYgPSBtYXhcbiAgICB9ZWxzZSBpZiAoIGlzTmFOKCBtYXggKSB8fCBpc05hTiggbWluICkgKSB7XG4gICAgICBkaWZmID0gYCR7bWF4fSAtICR7bWlufWBcbiAgICB9ZWxzZXtcbiAgICAgIGRpZmYgPSBtYXggLSBtaW5cbiAgICB9XG5cbiAgICBvdXQgPVxuYCB2YXIgJHt0aGlzLm5hbWV9ID0gJHtpbnB1dHNbMF19XG4gIGlmKCAke3RoaXMubmFtZX0gPCAke3RoaXMubWlufSApICR7dGhpcy5uYW1lfSArPSAke2RpZmZ9XG4gIGVsc2UgaWYoICR7dGhpcy5uYW1lfSA+ICR7dGhpcy5tYXh9ICkgJHt0aGlzLm5hbWV9IC09ICR7ZGlmZn1cblxuYFxuXG4gICAgcmV0dXJuIFsgdGhpcy5uYW1lLCAnICcgKyBvdXQgXVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9ICggaW4xLCBtaW49MCwgbWF4PTEgKSA9PiB7XG4gIGxldCB1Z2VuID0gT2JqZWN0LmNyZWF0ZSggcHJvdG8gKVxuXG4gIE9iamVjdC5hc3NpZ24oIHVnZW4sIHsgXG4gICAgbWluLCBcbiAgICBtYXgsXG4gICAgdWlkOiAgICBnZW4uZ2V0VUlEKCksXG4gICAgaW5wdXRzOiBbIGluMSwgbWluLCBtYXggXSxcbiAgfSlcbiAgXG4gIHVnZW4ubmFtZSA9IGAke3VnZW4uYmFzZW5hbWV9JHt1Z2VuLnVpZH1gXG5cbiAgcmV0dXJuIHVnZW5cbn1cbiIsIid1c2Ugc3RyaWN0J1xuXG5sZXQgTWVtb3J5SGVscGVyID0ge1xuICBjcmVhdGUoIHNpemVPckJ1ZmZlcj00MDk2LCBtZW10eXBlPUZsb2F0MzJBcnJheSApIHtcbiAgICBsZXQgaGVscGVyID0gT2JqZWN0LmNyZWF0ZSggdGhpcyApXG5cbiAgICAvLyBjb252ZW5pZW50bHksIGJ1ZmZlciBjb25zdHJ1Y3RvcnMgYWNjZXB0IGVpdGhlciBhIHNpemUgb3IgYW4gYXJyYXkgYnVmZmVyIHRvIHVzZS4uLlxuICAgIC8vIHNvLCBubyBtYXR0ZXIgd2hpY2ggaXMgcGFzc2VkIHRvIHNpemVPckJ1ZmZlciBpdCBzaG91bGQgd29yay5cbiAgICBPYmplY3QuYXNzaWduKCBoZWxwZXIsIHtcbiAgICAgIGhlYXA6IG5ldyBtZW10eXBlKCBzaXplT3JCdWZmZXIgKSxcbiAgICAgIGxpc3Q6IHt9LFxuICAgICAgZnJlZUxpc3Q6IHt9XG4gICAgfSlcblxuICAgIHJldHVybiBoZWxwZXJcbiAgfSxcblxuICBhbGxvYyggc2l6ZSwgaW1tdXRhYmxlICkge1xuICAgIGxldCBpZHggPSAtMVxuXG4gICAgaWYoIHNpemUgPiB0aGlzLmhlYXAubGVuZ3RoICkge1xuICAgICAgdGhyb3cgRXJyb3IoICdBbGxvY2F0aW9uIHJlcXVlc3QgaXMgbGFyZ2VyIHRoYW4gaGVhcCBzaXplIG9mICcgKyB0aGlzLmhlYXAubGVuZ3RoIClcbiAgICB9XG5cbiAgICBmb3IoIGxldCBrZXkgaW4gdGhpcy5mcmVlTGlzdCApIHtcbiAgICAgIGxldCBjYW5kaWRhdGUgPSB0aGlzLmZyZWVMaXN0WyBrZXkgXVxuXG4gICAgICBpZiggY2FuZGlkYXRlLnNpemUgPj0gc2l6ZSApIHtcbiAgICAgICAgaWR4ID0ga2V5XG5cbiAgICAgICAgdGhpcy5saXN0WyBpZHggXSA9IHsgc2l6ZSwgaW1tdXRhYmxlLCByZWZlcmVuY2VzOjEgfVxuXG4gICAgICAgIGlmKCBjYW5kaWRhdGUuc2l6ZSAhPT0gc2l6ZSApIHtcbiAgICAgICAgICBsZXQgbmV3SW5kZXggPSBpZHggKyBzaXplLFxuICAgICAgICAgICAgICBuZXdGcmVlU2l6ZVxuXG4gICAgICAgICAgZm9yKCBsZXQga2V5IGluIHRoaXMubGlzdCApIHtcbiAgICAgICAgICAgIGlmKCBrZXkgPiBuZXdJbmRleCApIHtcbiAgICAgICAgICAgICAgbmV3RnJlZVNpemUgPSBrZXkgLSBuZXdJbmRleFxuICAgICAgICAgICAgICB0aGlzLmZyZWVMaXN0WyBuZXdJbmRleCBdID0gbmV3RnJlZVNpemVcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKCBpZHggIT09IC0xICkgZGVsZXRlIHRoaXMuZnJlZUxpc3RbIGlkeCBdXG5cbiAgICBpZiggaWR4ID09PSAtMSApIHtcbiAgICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMoIHRoaXMubGlzdCApLFxuICAgICAgICAgIGxhc3RJbmRleFxuXG4gICAgICBpZigga2V5cy5sZW5ndGggKSB7IC8vIGlmIG5vdCBmaXJzdCBhbGxvY2F0aW9uLi4uXG4gICAgICAgIGxhc3RJbmRleCA9IHBhcnNlSW50KCBrZXlzWyBrZXlzLmxlbmd0aCAtIDEgXSApXG5cbiAgICAgICAgaWR4ID0gbGFzdEluZGV4ICsgdGhpcy5saXN0WyBsYXN0SW5kZXggXS5zaXplXG4gICAgICB9ZWxzZXtcbiAgICAgICAgaWR4ID0gMFxuICAgICAgfVxuXG4gICAgICB0aGlzLmxpc3RbIGlkeCBdID0geyBzaXplLCBpbW11dGFibGUsIHJlZmVyZW5jZXM6MSB9XG4gICAgfVxuXG4gICAgaWYoIGlkeCArIHNpemUgPj0gdGhpcy5oZWFwLmxlbmd0aCApIHtcbiAgICAgIHRocm93IEVycm9yKCAnTm8gYXZhaWxhYmxlIGJsb2NrcyByZW1haW4gc3VmZmljaWVudCBmb3IgYWxsb2NhdGlvbiByZXF1ZXN0LicgKVxuICAgIH1cbiAgICByZXR1cm4gaWR4XG4gIH0sXG5cbiAgYWRkUmVmZXJlbmNlKCBpbmRleCApIHtcbiAgICBpZiggdGhpcy5saXN0WyBpbmRleCBdICE9PSB1bmRlZmluZWQgKSB7IFxuICAgICAgdGhpcy5saXN0WyBpbmRleCBdLnJlZmVyZW5jZXMrK1xuICAgIH1cbiAgfSxcblxuICBmcmVlKCBpbmRleCApIHtcbiAgICBpZiggdGhpcy5saXN0WyBpbmRleCBdID09PSB1bmRlZmluZWQgKSB7XG4gICAgICB0aHJvdyBFcnJvciggJ0NhbGxpbmcgZnJlZSgpIG9uIG5vbi1leGlzdGluZyBibG9jay4nIClcbiAgICB9XG5cbiAgICBsZXQgc2xvdCA9IHRoaXMubGlzdFsgaW5kZXggXVxuICAgIGlmKCBzbG90ID09PSAwICkgcmV0dXJuXG4gICAgc2xvdC5yZWZlcmVuY2VzLS1cblxuICAgIGlmKCBzbG90LnJlZmVyZW5jZXMgPT09IDAgJiYgc2xvdC5pbW11dGFibGUgIT09IHRydWUgKSB7ICAgIFxuICAgICAgdGhpcy5saXN0WyBpbmRleCBdID0gMFxuXG4gICAgICBsZXQgZnJlZUJsb2NrU2l6ZSA9IDBcbiAgICAgIGZvciggbGV0IGtleSBpbiB0aGlzLmxpc3QgKSB7XG4gICAgICAgIGlmKCBrZXkgPiBpbmRleCApIHtcbiAgICAgICAgICBmcmVlQmxvY2tTaXplID0ga2V5IC0gaW5kZXhcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuZnJlZUxpc3RbIGluZGV4IF0gPSBmcmVlQmxvY2tTaXplXG4gICAgfVxuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1lbW9yeUhlbHBlclxuIl19
