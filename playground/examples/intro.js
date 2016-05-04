/*
---=== GETTING STARTED ===---

To execute code in the left-hand editor: 
  a. execute selected block: hit Ctrl+Enter
  b. execute one line: place cursor on line and hit Ctrl+Enter
  c. execute block: place cursor in block and hit Alt+Enter

Most examples are formatted so that they can be executed as a
single block; just place your cursor inside of them and hit
Alt+Enter.

To clear audio graph and stop sound: Ctrl+. (Ctrl+Period)

To run an arbitrary genish graph, wrap it in a call to
the play() function

Available ugens: add,sub, mul, div, abs, round, sin, accum, cycle, peek, 
phasor, rate, data, ssd (single-sample delay), delta,
param (although param doesn't work with play()),
ceil, max, min, floor, sign, cos, tan, asin, acos, atan, poke,
wrap, clamp, delay, fold, dcblock

Only one graph can be played at a time in this playground.

---=== ABOUT ===---

genish.js is a library designed to create optimized dsp graphs, using
per-sample processing. Per-sample processing means the entire graph
is processed one sample at a time, enabling fun techniques like
single-sample feedback. In this demo, the callbacks are used to
generate audio, but the library could also be used for modeling
physical systems.

The code display on the right side of the screen shows the 
callback generated; calling this function once will output a single
sample (potentially stereo) of data. The idea of genish.js is to 
provide a higher level kit for building these types of functions.

genish.js is inspired by gen~ for Max/MSP: https://cycling74.com/max7/

*/

/****** non-band-limited saw *******/
saw = mul( phasor(330), .05 )
play( saw )

/****** sine oscillator (no wavetable) *******/

graph = sin( 
  mul( 
    accum( mul( 440, 1/44100 ) ), 
    Math.PI * 2 
  )
)
play( graph )

/****** amplitude modulation *******/

graph = mul( 
  cycle(440), 
  add( 
    .1, 
    mul( cycle(4), .1 ) 
  ) 
)
play( graph )

/****** frequency modulation *******/

lfo = mul( cycle(4), .5 )
ramp = mul( phasor(.1), 200 )
rampedLFO = mul( lfo, ramp )
 
graph = cycle( add( 440, rampedLFO ) )
 
play( graph )

/******** stereo sound + GUI ***********/

// the prop command creates properties on the callback function
// that can be externally referenced; here, we'll use a GUI to control them.
// define by passing a name and a starting value. Existing GUIs are destroyed whenever
// you clear (using ctrl+.) or run the the play() function
mod = mul( phasor( prop( 'modFreq', .1 ) ), 800 )
 
amp = prop( 'amp', .15 ) 
 
// we use amp in the graphs below, and also create props for the frequency of phasors
p  = mul( cycle( add( 400, mod  ) ), sub(amp, mul( phasor( prop( 'phasor1Freq', 8 ) ), amp ) ) )
p2 = mul( cycle( sub( 1200, mod ) ), sub(amp, mul( phasor( prop( 'phasor2Freq', 5 ) ), amp ) ) )
 
// by passing an array to play we provide a left and a right channel,
// in this instance both of them are using the phasor named 'mod', which
// is memoized to avoid extra computation. 
cb = play( [ p, p2 ] )
 
// play returns our callback (cb), which contains the properties we defined earlier. 
// create our gui to manipulate them using the dat.gui library
gui = new dat.GUI()
gui.add( cb, 'modFreq', .1, 8 )
gui.add( cb, 'phasor1Freq', 2, 16 )
gui.add( cb, 'phasor2Freq', 2, 16 )
gui.add( cb, 'amp', .025, 1 )

/****** (LOUD + noisy) frequency modulation using feedback ******/

// ssd is equivalent to history in gen~, a single-sample delay
// (the history name is used by the window object in js...)
// an argument to ssd sets its initial value
sampler = ssd(.001) 
 
//here we record the output of a sawtooth wave into our ssd each sampel,
//and then use this value on the next sample to modulate its frequency
graph = sampler.record( phasor( mul( 3000, sampler ) ) )
 
play( graph )

/****** using data with peek (defaults to linear interpolation) *******/

d = data( [440,880,220,330] )
 
graph = cycle( peek( d, phasor(.1) ) )
 
play( graph )

/******* using data w/ peek (no interpolation) ******/

d = data( [220,330,440,880] )
 
// create a ramp from 1-4 over 10 seconds
acceleration = mul( phasor(.1), 4 )
 
graph = cycle( 
  peek( d, phasor( acceleration ), { interp:'none' } ) 
)
 
play( graph )

/******** notes w/ ping-pong echo ***********/

frequencies = data( [220,330,440,880] )
 
freqSignal = peek( frequencies, phasor( .5 ), { interp:'none' } ) 
 
envelope = sub( 1, phasor(2) )
 
notes = mul( cycle( freqSignal ), envelope )
 
gain = mul( notes, .1 )
 
echo = delay( gain, 11025, { size: 22050 })
 
play( [gain, echo] )

/****** 150 sine oscillators *******/
 
oscillators = []
numOscillators = 150
 
for( var i = 0; i < numOscillators; i++ ) {
  oscillators.push( 
    mul( cycle( 100 + i *20 ), 1/numOscillators ) 
  )
}
 
play( add.apply(null, oscillators) )
