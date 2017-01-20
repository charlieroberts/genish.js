'use strict'

/* Objects vs. values as callback properties
 *
 * Values that are preserved in between sample callbacks (such as the currnet count of a counter)
 * can be stored in two ways. In the first case, we can store an object where value A is a property
 * of that object, and then access value A through that object in the callback. The advantage of this is
 * that we can reference the values and change them external to the audio callback. The second method is to
 * store the value directly as a property of the audio callback. With this technique we lose the ability to
 * reference the easily reference the value externally (although it's still possible, just very verbose) but
 * we avoid having to resolve the extra object reference.
 * 
 * The question is: is resolving that extra object reference a significant expense? If the answer is yes, then
 * it makes sense to store value A directly as a property of the callback. If the answer is no, then it makes
 * sense to store its owner object, and access the value through that object in the callback so that value can
 * easily be referenced externally.
 * 
 * RESULT: It's about 5% faster to store the values directly on the callback. I guess that's fast enough to
 * make it worthwhile to take advantage of, even though it will muddy flexiblity a bit :( 
 *
 * UPDATE - ARGGGHH. I can't make myself do it. It's just to much cleaner using objects as properties. This could be
 * an area for future optimization as needed
 * 
 */ 


let Benchmark = require( 'benchmark' )

let suite = new Benchmark.Suite;

module.exports = function() {

function foo() {
  return foo.value++
}
foo.value = 0

let bar = function() {
    return bar.object.value++
}
bar.object = { value:0 }

// add tests
suite.add( 'storing values as properties of the callback', function() {
  foo()
})
.add( 'storing objects as callback properties, and then referencing values in those objects', function() {
  bar( )
})
.on( 'cycle', function(event) {
  console.log(String(event.target));
})
.on( 'complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run({ 'async': true });

}

module.exports.description = `\n\n/*********** STORING VALUES IN OBJECT VS DIRECT STORAGE ***************/\n\nThis test measures the perfromance penalty of de-referencing an extra object to lookup a stored value\n\n/*******************************/`
