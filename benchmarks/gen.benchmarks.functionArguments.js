'use strict'

/* passing arguments to calback functions
 *
 * This test is inconclusive as to the most efficient method, although it does
 * seem to definitively show the currying is the least efficient. Fastest techniques
 * seem to be either using a named function callback, or storing a callback function
 * in a variable and accessing that variable as an upvalue.
 *
 */

let Benchmark = require( 'benchmark' )

let suite = new Benchmark.Suite;

module.exports = function() {

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

}

module.exports.description = `/*********** FUNCTION ARGUMENTS ***************/\nThis test measures the best way to pass arguments to a callback function: via closure, binding, function properties, or calling a function as a method and accessing properties of the owner object.\n/*******************************/`
