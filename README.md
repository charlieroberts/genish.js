# genish.js
an experimental repo that might, someday, mimic gen~ in Max/MSP

## what?
A little more detail: genish.js will codegen per-sample callbacks with an API that mirrors gen~ closely. Given the following code:

```javascript
abs( add( mul(5,2), param() ) )
```

...genish will generate the following (approximate) function.

```javascript
function gen( p0 ) {
  return gen.abs( 10 + p0 )
}
```

`abs`, a reference to `Math.abs`, is assigned as a property to the named `gen` function as part of the codegen process. A sine oscillator accepting frequency as a parameter could be expressed as follows:

```javascript
frequency = param()
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

Both the accumulator and the sin function are assigned as properties of the named `gen` function in this eaxmple.

## use
Doesn't do much at the moment, but you can import `dist/gen.lib.js` for use in the browser, or `require('./dist/index.js')` if you're using Node.

## develop
The build script is a gulpfile. With gulp installed, run `gulp` or `gulp watch` in the top level of the repo.

## test
Tests are done with Mocha. With Mocha installed, run `mocha test.js` in a terminal.
