'use strict'

/* accum methods
 *
 * the existing phasor uses an if statement to wrap an accum. Is this more efficient than
 * using a history + add + wrap() ugen together?
 *
 * If range is {0,1} (obviously very common), using:
 *   y = x - ( x | 0 )
 * ... is fastest way to wrap, and no branch!.
 * 
 */ 


let Benchmark = require( 'benchmark' )

let suite = new Benchmark.Suite;

let genlib = require('../dist/index.js'),
    gen   = genlib.gen,
    accum = genlib.accum,
    ssd   = genlib.history,
    add   = genlib.add,
    wrap  = genlib.wrap,
    memo  = genlib.memo,
    phasor= genlib.phasor,
    mod   = genlib.mod

module.exports = function() {

let foo = gen.createCallback( phasor( 440 ), true )

let a = ssd(),
    incr = 1/44100,
    _accum = wrap( a.record( memo(add( a,incr*440 )) ), 0,1 ),
    bar = gen.createCallback( _accum, true )

let b = ssd(),
    _accum2 = b.record( memo( mod( add( b,incr*440), 1 ) ) ),
    baz = gen.createCallback( _accum2, true )

let c = function gen() {
  'use strict'
  
  let memo = gen.data.history + .009977324263038548
  gen.out[0] = memo - ( memo | 0 )

  gen.data.history = gen.out[0]
}
c.data = { history:0 }
c.out = [0]

// add tests
suite.add( 'testing phasor using accum with an if statement:', function() {
  foo()
})
.add( 'no branches using modulos to wrap:', function() {
  bar()
})
.add( 'using a single mod to wrap; no branches:', function() {
  baz()
})
.add( 'using bitwise or to wrap to 0:', function() {
  c()
})

.on( 'cycle', function(event) {
  console.log(String(event.target));
})
.on( 'complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
  console.log('\n/*******************************/')
})
.run({ 'async': true });

}

module.exports.description = 
`\n/*********** IF VS. WRAP ***************/

This test measures the best way to wrap: with an if statement or with some crazy modulo math.

`
