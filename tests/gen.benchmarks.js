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

let bar = function( p0 ) {
    return bar.sin( bar.abs( p0 ) )
}
bar.sin = Math.sin
bar.abs = Math.abs

let curryFoo = function( sin, abs, p0 ) {
  return sin( abs( p0 ) )
}

let curried = function( p0 ) {
  return curryFoo.call( null, Math.sin,Math.abs,p0 )
}

let _abs_ = Math.abs, _sin_ = Math.sin
let closure = function( p0 ){
  return _sin_( _abs_( p0 ) )
}

let gen = {
  out: function( p0 ) { return this.sin( this.abs( p0 ) ) },
  sin: Math.sin,
  abs: Math.abs
}

// add tests
suite.add( 'named function w/ parameters', function() {
  foo( Math.random() * 30 )
})
.add( 'curry', function() {
  curried( Math.random() * 30 )
})
.add( 'closure', function() {
  closure( Math.random() * 30 )
})
.add( 'upvalue reference to function', function() {
  bar( Math.random() * 30 )
})
.add( 'call as method of object, with functions as properties', function() {
  gen.out( Math.random() * 30 )
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
