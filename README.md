# genish.js
A library for generating optimized, single-sample audio callbacks in JavaScript. Inspired by gen~ in Max/MSP.

## try it out
http://www.charlie-roberts.com/genish/playground

Genish.js is alpha status and currently runs in Chrome and Firefox.

## what?
A little more detail: genish.js will codegen per-sample callback functions from a graph. Given the following code:

```javascript
abs( add( mul(5,2), in() ) )
```

...genish will generate the following (approximate) function.

```javascript
function gen( p0 ) {
  return gen.abs( 10 + p0 )
}
```

`abs`, a reference to `Math.abs`, is assigned as a property to the named `gen` function as part of the codegen process; this removes the need to look it up in the global scope. genish is also reduces multiplcation of two numbers to a constant. A sine oscillator accepting frequency as an input could be expressed as follows:

```javascript
frequency = in()
sin( mul( accum( mul( frequency, 1/44100 ) ), Math.PI * 2 ) )
```

... which would then be translated into the following function:

```javascript
function gen( p0 ) {
  'use strict';
  gen.accum1.value += (p0 * 0.000022675736961451248)

  if( gen.accum1.value > gen.accum1.max ) gen.accum1.value = gen.accum1.min

  return gen.sin( gen.accum1.value * 6.283185307179586 )
}
```

Both the accumulator and the sin function are assigned as properties of the named `gen` function in this eaxmple; this minimizes how far the engine

## use
To use genish.js, you need to create an AudioContext and a ScriptProcessor node that will run the functions genish.js creates. Genish includes a `utilities` object that provides convenience methods for these tasks, as well as inserting generated functions into the callback of the ScriptProcessor. The following example performs the necessary setup and starts a sine oscillator running:

```javascript
 // optionally put all genish object in global namespace
genish.export( window )

utilities.createContext().createScriptProcessor()

// second argument prints generated function body to console
utilities.playGraph( cycle( 330 ), true ) 

## develop
The build script is a gulpfile. With gulp installed, run `gulp` or `gulp watch` in the top level of the repo.

## test
Tests are done with Mocha. With Mocha installed, run `mocha tests/gen.tests.js` from the root directory.
