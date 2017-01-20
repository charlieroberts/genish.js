'use strict'

/* truncation
 *
 * as expected, using the | operator (bitwise or) is faster than using Math.floor
 * as a property of a callback. However, it is a small efficiency gain...
 *
 */ 


let Benchmark = require( 'benchmark' )

let suite = new Benchmark.Suite;

module.exports = function() {

function foo( p0 ) {
  return foo.floor( p0 )
}
foo.floor = Math.floor

let bar = function( p0 ) {
    return p0 | 0
}

// add tests
suite.add( 'using built-in Math.floor function as property of named function', function() {
  foo( Math.random() * 30 )
})
.add( 'flooring using bitwise or (truncation)', function() {
  bar( Math.random() * 30 )
})
.on( 'cycle', function(event) {
  console.log(String(event.target));
})
.on( 'complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run({ 'async': true });

}

module.exports.description = `\n\n/*********** FLOORING ***************/\nThis test measures the best way to truncate a floating point number: Math.floor vs. bitwise or (|)\n/*******************************/`
