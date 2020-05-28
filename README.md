# genish.js
A library for generating optimized, single-sample audio callbacks in JavaScript. Inspired by gen~ in Max/MSP.

## try it out
http://www.charlie-roberts.com/genish/playground

genish.js should run in all reasonably modern browsers; however, it runs best in Firefox and Chrome due to their support for AudioWorklets.

## what?
A little more detail: genish.js will compile per-sample callback functions from a graph. Given the following code:

```javascript
mul( cycle( 220 ), .1 )
```

...genish will generate the following sample processing loop (reading from a wavetable) inside of an AudioWorklet node:

```javascript
for( let i = 0; i < len; ++i ) {
  var phasor2_value = memory[2]
  memory[2] += 0.004988662131519274
  if( memory[2] >= 1 ) memory[2] -= 1
  if( memory[2] < 0 ) memory[2] += 1

  var cycle4_dataIdx  = 3, 
      cycle4_phase = phasor2_value * 1024, 
      cycle4_index = cycle4_phase | 0,
      cycle4_frac  = cycle4_phase - cycle4_index,
      cycle4_base  = memory[ cycle4_dataIdx +  cycle4_index ],
      cycle4_next  = ( cycle4_index + 1 ) & (1024 - 1),
      cycle4_out   = cycle4_base + cycle4_frac * ( memory[ cycle4_dataIdx + cycle4_next ] - cycle4_base )

  var mul5 = cycle4_out * 0.1
  memory[0]  = mul5

  left[ i ] = memory[0]
}
```

## use
To use genish.js, you need to create an AudioContext and a AudioWorklet node that will run the functions genish.js creates. Genish includes a `utilities` object that provides convenience methods for these tasks. The following example performs the necessary setup and starts a sine oscillator running:

```javascript
 // optionally put all genish object in global namespace
genish.export( window )

utilities.createContext()

// audio context won't be created until users
// have interacted with the page
window.onclick = ()=> {
  utilities.playWorklet( cycle( 330 ) ) 
}
```

A [more complex example](https://gist.github.com/charlieroberts/7bcc6e19c66b9ed2b4bf26db309738e4) is also available.

## develop & test
The build script is a gulpfile. With gulp installed, run `gulp js` or `gulp watch` in the top level of the repo. `gulp test` will run the testing suite (mocha).
