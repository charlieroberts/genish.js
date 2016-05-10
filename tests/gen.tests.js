/* gen.tests.js
 *
 * This file is for testing the functionality of the gen.js library.
 *
 * To run: mocha gen.tests.js
 *
 * ... after installing all necessary dependencies by running npm install in the
 * top level of the genish.js repo.
 *
 */

'use strict'

let assert = require('assert'),
    genlib = require( '../dist/index.js' ), 
    abs = genlib.abs,
    gen = genlib.gen,
    mul = genlib.mul,
    add = genlib.add,
    sub = genlib.sub,
    div = genlib.div,
    param = genlib.param,
    accum = genlib.accum,
    sin   = genlib.sin,
    cos   = genlib.cos,
    tan   = genlib.tan,
    asin  = genlib.asin,
    acos  = genlib.acos,
    atan  = genlib.atan,
    phasor= genlib.phasor,
    data  = genlib.data,
    peek  = genlib.peek,
    cycle = genlib.cycle,
    history = genlib.history,
    delta   = genlib.delta,
    round   = genlib.round,
    floor   = genlib.floor,
    ceil    = genlib.ceil,
    max     = genlib.max,
    min     = genlib.min,
    sign    = genlib.sign,
    dcblock = genlib.dcblock,
    memo    = genlib.memo,
    wrap    = genlib.wrap,
    mix     = genlib.mix,
    rate    = genlib.rate,
    clamp   = genlib.clamp,
    fold    = genlib.fold,
    noise   = genlib.noise,
    sah     = genlib.sah,
    gt      = genlib.gt,
    input   = genlib.in,
    lt      = genlib.lt,
    t60     = genlib.t60,
    mtof    = genlib.mtof,
    ternary = genlib.switch

//gen.debug = true

describe( 'gen', ()=> {
  it( 'should get back two numbers when fetching the arguments from an add ugen', ()=> {
    let answer = [5,3],
        graph  = add(5,3),
        result = gen.getInputs( graph )

    assert.deepEqual( result, answer )
  })
  it( 'should generate unique ids', ()=> {
    let answer = gen.getUID(),
        result = gen.getUID()

    assert.notEqual( result, answer )
  })
})

describe( 'monops', ()=> {
  it( 'should generate the absolute value of -.5 as .5', ()=> {
    let answer = .5,
        graph = abs( -.5 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })
  
  it( 'should round .75 to 1', ()=> {
    let answer = 1,
        graph = round( .75 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should floor .75 to 0', ()=> {
    let answer = 0,
        graph = floor( .75 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should ceil .25 to 1', ()=> {
    let answer = 1,
        graph = ceil( .25 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should return -1 for sign(-1000)', ()=> {
    let answer = -1,
        graph = sign( -1000 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })
  it( 'should return 1 for sign(1000)', ()=> {
    let answer = 1,
        graph = sign( 1000 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })
  it( 'should generate a value of 0 for sin(0)', ()=> {
    let answer = 0,
        graph = sin( 0 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of 1 for sin( PI/2 )', ()=> {
    let answer = 1,
        graph = sin( Math.PI * .5 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })
  it( 'should generate a value of 1 for cos(0)', ()=> {
    let answer = 1,
        graph = cos( 0 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of 0 for cos( PI/2 )', ()=> {
    let answer = 0,
        graph = cos( Math.PI * .5 ),
        out = gen.createCallback( graph ),
        result = out().toFixed( 6 )

    assert.equal( result, answer )
  })

  it( 'should generate a value of 0 for tan(0)', ()=> {
    let answer = 0,
        graph = tan( 0 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of 1 for tan( PI/4 )', ()=> {
    let answer = 1,
        graph = tan( Math.PI / 4 ),
        out = gen.createCallback( graph ),
        result = parseFloat( out().toFixed( 6 ) )

    assert.equal( result, answer )
  })
  it( 'should generate a value of 0 for asin(0)', ()=> {
    let answer = 0,
        graph = asin( 0 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of PI/2 for asin( 1 )', ()=> {
    let answer = Math.PI * .5,
        graph = asin( 1 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of PI/2 for acos(0)', ()=> {
    let answer = Math.PI * .5,
        graph = acos( 0 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of 0 for acos( 1 )', ()=> {
    let answer = 0,
        graph = acos( 1 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of 0 for atan(0)', ()=> {
    let answer = 0,
        graph = atan( 0 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should generate a value of PI/4 for atan( 1 )', ()=> {
    let answer = Math.PI / 4,
        graph = atan( 1 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should fade 1 to .001 over 10 samples using t60(10)', ()=> {
    let answer = .001,
        x = history( 1 ),
        graph = x.in( mul( x.out, t60(10) ) ),
        out   = gen.createCallback( graph ),
        result = 1
    
    for( let i = 0 ; i < 10; i++ ) result = out()

    result = parseFloat( result.toFixed( 4 ) )

    assert.equal( result, answer )

  })

  it( 'should convert midi value 69 to 440 (hz, default tuning)', ()=> {
    let answer = 440,
        graph  = mtof( 69 ),
        out    = gen.createCallback( graph ),
        result = out()

    assert.equal( answer, result )
  })
})

describe( 'binops', ()=> {
  it( 'should add 4 and 7 to get 11', ()=> {
    let answer = 11,
        graph = add( 4,7 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should sub 4 and 7 to get -3', ()=> {
    let answer = -3,
        graph = sub( 4,7 ),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should multiply 4 and 7 to get 28', ()=> {
    let answer = 28,
      graph = mul( 4,7 ),
      out = gen.createCallback( graph ),
      result = out()

    assert.equal( result, answer )
  })

  it( 'should divide 49 and 7 to get 7', ()=> {
    let answer = 7,
      graph = div( 49,7 ),
      out = gen.createCallback( graph ),
      result = out()

    assert.equal( result, answer )
  })
  
})

describe( 'logic', ()=> {

  it( 'should return 1 for gt(1,0)', ()=> {
    let answer = 1,
        graph = gt(1,0),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should return 0 for lt(1,0)', ()=> {
    let answer = 0,
        graph = lt(1,0),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should return 4 for max(2,4)', ()=> {
    let answer = 4,
        graph = max(2,4),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should return 2 for min(2,4)', ()=> {
    let answer = 2,
        graph = min(2,4),
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

})

describe( 'switch', ()=> {
  it( 'should generate ouput of 0,1 given switch( in(), 0, 1 ) -> (1), (0)', ()=> {
    let answer = [ 0,1 ],
        graph  = ternary( input(), 0, 1 ), 
        out    = gen.createCallback( graph ),
        result = []

    result.push( out( 1 ) ); result.push( out( 0 ) )

    assert.deepEqual( result, answer )
  })
})

describe( 'sah', ()=> {
  it( 'should return the same value until told to sample', ()=> {
    let graph = sah( noise(), peek( data([1,0,1,0]), accum(1,0,{ max:4 }), {interp:'none', mode:'samples'} ) ),
        out   = gen.createCallback( graph ),

        result = []

    for( let i = 0; i < 4; i++ ) result[i] = out()

    assert( result[0] === result[1] && result[2] !== result[1]  )
  })


})

describe( 'in', ()=> {
  it( 'should return the first argument of 42', ()=> {
    let answer = 42,
        graph = input(),
        out   = gen.createCallback( graph ),
        result = out( 42 )
    
    assert.equal( result, answer )
  })
})

describe( 'memo', ()=> {
  it( 'should store a value after calculating, and subsequently return calculated value', ()=> {
    let answer = 26,
        m = memo( add( 5, 8 ) ),
        graph = add( m, m ),
        out   = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })
})

describe( 'noise', ()=> {
  it( 'should not return the same number', ()=> {
    let answer = -1,
        storage = [],
        graph = noise(),
        out   = gen.createCallback( graph ),
        result

    for( var i = 0; i < 256; i++ ) {
      var sample = out()
      result = storage.indexOf( sample )
      if( result !== -1 ) break
      storage.push( sample )
    }

    assert.equal( result, answer )
  })
})

describe( 'accum', ()=>{
  it( 'should ramp to .5 with an increment of .1 after five executions', ()=> {
    let answer = .5,
        graph  = accum(.1),
        out    = gen.createCallback( graph ),
        result = 0
    
    for( let i = 0; i < 5; i++ ) out()
    
    result = out()
    
    assert.equal( result, answer )
  })

  //it( 'should return to its min value of 0 on the 10th execution with an increment of .1', ()=> {
  //  let answer = 0,
  //      graph  = accum(.1),
  //      out    = gen.createCallback( graph ),
  //      result = 0
    
  //  for( let i = 0; i < 9; i++ ) out()

  //  result = out()
  //  assert.equal( result, answer )
  //})

  it( 'should return to its min value of 0 when the inputs[1] = true', ()=> {
    let answer = .0,
        graph  = accum( .1, input() ),
        out    = gen.createCallback( graph ),
        result = 0

    out(); out(); out();

    result = out( 1 )
    
    assert.equal( result, answer )

  })
})

describe( 'wrap', () => {
  it( 'should not let an accum with a max of 1000 travel past 1', ()=> {
    let max = 1,
        storage = [],
        acc = accum( .5, 0, 0, 100 ),
        graph = wrap( acc, 0, max ),
        out = gen.createCallback( graph ),
        result

    for( let i = 0; i < 20; i++ ) storage[ i ] = out()

    result = Math.max.apply( null, storage )

    assert( result < max )

  })
})

describe( 'fold', ()=> {
  it( 'should generate a value of .75 given an input of 1.25, a min of 0 and a max of 1', ()=> {
    let answer = .75,
        graph = fold( 1.25 ),
        out = gen.createCallback( graph ),
        result = out()
    
    assert.equal( answer, result )
  })
})

describe( 'clamp', () => {
  it( 'should not let samples outside the range of -1..1', ()=> {
    let graph = clamp( mul( cycle(440), 10 ), -1, 1 ),
        storage = [],
        out = gen.createCallback( graph )

    for( let i = 0; i < 200; i++ ) storage[i] = out()

    let min = Math.min.apply( null, storage),
        max = Math.max.apply( null, storage)

    assert( min >= -1 && max <= 1 )
  })
})

describe( 'mix', () => {
  it( 'should output .5 given mix(0,2,.25)', ()=> {
    let answer = .5,
        graph = mix( 0,2,.25 ), 
        out = gen.createCallback( graph ),
        result = out()

    assert.equal( answer, result )
  })
})

describe( 'phasor', ()=>{
  it( 'should ramp to .5 with an frequency of 4410 after five executions', ()=> {
    let answer = .5,
        graph  = phasor( 4410 ),
        out    = gen.createCallback( graph ),
        result = 0
    
    for( let i = 0; i < 5; i++ ) out()
    
    result = out()
    
    assert.equal( result, answer )
  })
})

describe( 'rate', ()=>{
  it( 'should cause a phasor with an frequency of 4410 to ramp to .25 after five executions instead of .5', ()=> {
    let answer = .25,
        graph  = rate( phasor( 4410 ), .5 ),
        out    = gen.createCallback( graph ),
        result = 0
    
    for( let i = 0; i < 5; i++ ) out()
    
    result = out()
    
    assert.equal( result, answer )
  })
})

describe( 'data + peek', ()=>{
  it( 'should return the value of index data[2] (49) when requesting it via peek', ()=> {
    let answer = 49,
        d = data( [0,0,49] ),
        p = peek( d, 2, { mode:'samples' }),
        out = gen.createCallback( p  ),
        result
    
    result = out()
    
    assert.equal( result, answer )
  })

  it( 'should return the value of 49 when indexing uisng phase w/ peek', ()=> {
    let answer = 49,
        d = data( 512 ),
        p = peek( d, .00390625, { mode:'phase', interp:'none' } ), //.00390625 is phase for index[2] if 512 data length
        out = gen.createCallback( p ),
        result
    
    d.buffer[2] = 49

    result = out()
    
    assert.equal( result, answer )
  })
})

describe( 'cycle', ()=> {
  it( 'should be at 0 after five outputs at 11025 hz', ()=> {
    let answer = 0,
        c = cycle( 11025 ),
        out = gen.createCallback( c ),
        result = []

    for( let i = 0; i < 5; i++ ) result[i] = out()
    assert.equal( result[4], answer )
  })

  it( 'should generate values in the range {-1,1} over 2000 samples', ()=> {
    let storage = [],
        c = cycle( 440 ),
        out = gen.createCallback( c ),
        outputMin, outputMax

    for( let i = 0; i < 2000; i++ ) storage[i] = out()
    
    outputMin = Math.min.apply( null, storage )
    outputMax = Math.max.apply( null, storage )
    
    //console.log( '  ', outputMin, outputMax )
    assert( (outputMin <= -.99 && outputMin >= -1.0001) && (outputMax >= .99 && outputMax <= 1.0001) )
  }) 
})
// 0 (+1) 1 (+2) 3 (+3) 6 
describe( 'history', ()=> {
  it( 'should return 7 after recording an accum with an increment of 1 + history for three samples', ()=> {
    let answer = 7,
        h1 = history(),
        h1input = h1.in( accum( add(1, h1.out ), 0, {min:0, max:10} ) ),
        out = gen.createCallback( h1input ),
        result = []
    
    for( let i = 0; i < 5; i++ ) result[i] = out()
    assert.equal( result[4], answer )
  })
})

describe( 'delta', ()=> {
  it( 'should return 0 or .1 when tracking accum(.1) for first 11 samples, -.9 for 12th (after accum wraps)' , ()=> {
    let answer = [0,.1,.1,.1,.1,.1,.1,.1,.1,.1,.1,-.9],
        d1 = delta( accum(.1) ),
        out = gen.createCallback( d1 ), 
        result = []

    for( let i = 0; i < 12; i++ ) result.push( parseFloat( out().toFixed( 6 ) ) )

    assert.deepEqual( result, answer )
  })
})

//describe( 'rate', ()=> {
//  it( 'should cycle 4 times over  given a phasor with a frequency of 1 and a scaling value of .25' , ()=> {
//    let answer = [.1,.1,.1,.1,.1,.1,.1,.1,.1,.1,-.9],
//    d1 = delta( accum(.1) ),
//    out = gen.createCallback( d1 ), 
//    result = []

//    for( let i = 0; i < 11; i++ ) result.push( parseFloat( out().toFixed( 6 ) ) )

//    assert.deepEqual( result, answer )
//  })
//})

describe( 'dcblock', ()=>{
  it( 'should filter offset of .5 to make signal range {-1,1} after >20000 samples', ()=> {
    let storage = [],
        graph  = dcblock( add( .5, cycle( 440 ) ) ),
        out    = gen.createCallback( graph ),
        outputMax, outputMin

    // let filter run for a bit
    for( let i = 0; i < 20000; i++ ) out()

    for( let i = 0; i < 1000; i++ ) storage[ i ] = out()
    
    outputMax = Math.max.apply( null, storage )
    outputMin = Math.min.apply( null, storage )

    assert( outputMax <=1.1 && outputMin >= -1.1 )
  })
})

describe( 'complex', ()=> {
  it( 'should add 5 and 2, multiply that by -7, and calculate the absolute value (49)', ()=> {
    let answer = 49,
        graph  = abs( mul( add(5,2), -7 ) ),
        out    = gen.createCallback( graph ),
        result = out()

    assert.equal( result, answer )
  })

  it( 'should create a sine wave', ()=> {
    let frequency = input(),
        phasor    = accum( mul( frequency, 1/44100 ) ),
        oscgraph  = sin( mul( phasor, Math.PI * 2 ) ), 
        osc       = gen.createCallback( oscgraph ),
        answer = [
          0,
          0.3353173459027643,
          0.6318084552474613,
          0.8551427630053461,
          0.9794604955306667,
          0.9903669614948382,
          0.8865993063730001,
          0.6801727377709197,
          0.3949892902309387,
          0.06407021998071323,
       ],
       result = []
    
    for( let i = 0; i < 10; i++ ) result[i] = osc(2400) 
    
    assert.deepEqual( result, answer )
  })
})
