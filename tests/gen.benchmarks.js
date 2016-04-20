/* gen.benchmarks.js
 *
 * This file is for testing minutiae related to codegen optimizaitons. For example, is it faster
 * to use an if statement vs. a ternary operator etc.
 *
 * run using node: node benchmark.js
 *
 * ... after installing dependencies by running npm install in the top level of the repo
 * 
 */

'use strict';

let Benchmark = require('benchmark')

let suite = new Benchmark.Suite;

function foo( p0 ) {
    return foo.sin( foo.abs( p0 ) )
}
foo.sin = Math.sin
foo.abs = Math.abs


let curryFoo = function( sin, abs, p0 ) {
  return sin( abs( p0 ) )
}

let curried = function( p0 ) {
  return curryFoo.call( null, Math.sin,Math.abs,p0 )
}


// add tests
suite.add( 'named function w/ parameters', function() {
  foo( Math.random() * 30 )
})
.add( 'curry', function() {
  curried( Math.random() * 30 )
})
// add listeners
.on( 'cycle', function(event) {
  console.log(String(event.target));
})
.on( 'complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// run async
.run({ 'async': true });
