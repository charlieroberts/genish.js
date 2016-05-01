'use strict'

/* clamping / ternary vs. if
 *
 * The difference appears to be fairly neglible, but if/else has a slight advantage 
 */ 

let Benchmark = require( 'benchmark' )

let suite = new Benchmark.Suite;

module.exports = function() {

let foo = function( x, min, max ) {
  return x < max && x > min ? x : x < max ? min : max
}

let bar = function( x, min, max ) {
  if( x < min ) x = min
  else if( x > max ) x = max

  return x
}

// add tests
suite.add( 'using ternary operators to clamp', function() {
  foo( Math.random(), 0, .5 )
})
.add( 'using if/else to clamp', function() {
  bar( Math.random(), 0, .5 )
})
.on( 'cycle', function(event) {
  console.log(String(event.target));
})
.on( 'complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run({ 'async': true });

}

module.exports.description = `\n\n/*********** CLAMPING ***************/\nThis test measures the best way to clamp a value to a particular range, using ternary operators or an if statement.\n/*******************************/`
