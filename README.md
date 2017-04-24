# genish.js
A library for generating optimized, single-sample audio callbacks in JavaScript. Inspired by gen~ in Max/MSP.

## try it out
http://www.charlie-roberts.com/genish/playground

Genish.js is alpha status and currently runs in Chrome and Firefox.

## what?
A little more detail: genish.js will compile per-sample callback functions from a graph. Given the following code:

```javascript
abs( add( mul(5,2), input() ) )
```

...genish will generate the following function.

```javascript
function gen( in6 ){ 
  'use strict'
  let memory = gen.memory

  gen.out[0]  = gen.abs( (in6 + 10) )

  return gen.out[0]
}
```

`abs`, a reference to `Math.abs`, is assigned as a property to the named `gen` function as part of the codegen process; this removes the need to look it up in the global scope. genish is also reduces multiplcation of two numbers to a constant. A sine oscillator accepting frequency as an input could be expressed as follows:

```javascript
frequency = input()
sin( mul( accum( mul( frequency, 1/gen.samplerate ) ), Math.PI * 2 ) )
```

... which would then be translated into the following function:

```javascript
function gen( in0 ){ 
  'use strict'
  let memory = gen.memory

  let accum2_value = memory[0];
  memory[0] += (in0 * 0.000022675736961451248)
  if( memory[0] >= 1 ) memory[0] -= 1
  if( memory[0] < 0 ) memory[0] += 1

  gen.out[0]  = gen.sin( (accum2_value * 6.283185307179586) )

  return gen.out[0]
}
```

The sin function is assigned as a property of the named `gen` function in this example; this limits most objects and functions to an object in the current scope. All memory used in any generated callback (in this case only a single float) is centrally stored in a single Float32Array, which decreases the need for de-referencing throughout the callback and yields improved efficiency.

## use
To use genish.js, you need to create an AudioContext and a ScriptProcessor node that will run the functions genish.js creates. Genish includes a `utilities` object that provides convenience methods for these tasks, as well as inserting generated functions into the callback of the ScriptProcessor. The following example performs the necessary setup and starts a sine oscillator running:

```javascript
 // optionally put all genish object in global namespace
genish.export( window )

utilities.createContext().createScriptProcessor()

// second argument prints generated function body to console
utilities.playGraph( cycle( 330 ), true ) 
```
## develop & test
The build script is a gulpfile. With gulp installed, run `gulp` or `gulp watch` in the top level of the repo. `gulp test` will run the testing suite (mocha).

By default genish compiles to ES5. However, you can also target asm.js as with `gulp --target asm`. In `js/ugens` there are different folders for each compilation target, as well as a folder named `common` that contains ugens that are shared between targets. These shared ugens do not actually contain compilation instructions; instead they are higher-level ugens that combine other ugens that do possess compilation instructions specific to each target.

You can access the current target being used with the keyword GENISH_TARGET. This is automatically inserted by browserify into every module that references it.
