'use strict'

/* converting booleans to numbers
 *
 * benchmark to test various methods for converting bools to numbers. Needed for not(),
 * or() etc.
 *
 * using Number constructor is much faster than conversion. However, for many purposes
 * using a ternary operator to convert to 1 or 0 is even faster.
 * 
 */ 


let Benchmark = require( 'benchmark' )

let suite = new Benchmark.Suite;

module.exports = function() {

function foo( p0 ) {
  return Number( p0 )
}

let bar = function( p0 ) {
  return p0+0
}

let baz = function( p0 ) {
  return p0 === 0 ? 1 : 0 
}
// add tests
suite.add( 'converting bool via Number constructor:', function() {
  foo( Math.random() > .5 )
})
.add( 'converting bool via type coercion:', function() {
  bar( Math.random() > .5 )
})
.add( 'using ternary to invert', function() {
  baz( Math.random()  )
})

.on( 'cycle', function(event) {
  console.log(String(event.target));
})
.on( 'complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
  console.log('/*******************************/')
})
.run({ 'async': true });

}

module.exports.description = '\n\n/*********** CONVERTING BOOLS TO NUMS ***************/\nThis is looks at ways to convert booleans to floats'
