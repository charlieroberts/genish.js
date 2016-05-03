window.exampleCode = 
`/*
To execute code: 
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
phasor, data, ssd (single-sample delay), delta,
param (although param doesn't work with play()),
ceil, max, min, floor, sign, sin, cos, tan, asin, acos, atan, poke,
wrap, clamp, delay

Only one graph can be played at a time in this playground.
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

/******** stereo sound ***********/

mod = mul( phasor(.1), 800 )
p  = mul( cycle( add( 400, mod  ) ), sub(1,phasor(8) ) )
p2 = mul( cycle( sub( 1200, mod ) ), sub(1,phasor(5) ) )
 
// by passing an array to play we provide a left and a right channel,
// in this instance both of them are using the phasor named 'mod', which
// is memoized to avoid extra computation
play( [ p, p2 ] )

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

/******** notes w/ delay ***********/

frequencies = data( [220,330,440,880] )
 
freqSignal = peek( frequencies, phasor( .5 ), { interp:'none' } ) 
 
envelope = sub( 1, phasor(2) )
 
notes = mul( cycle( freqSignal ), envelope )
 
gain = mul( notes, .1 )
 
echo = delay( gain, 11025, { size: 22050 })
 
play( add( gain, echo ) )

/****** 150 sine oscillators *******/
 
oscillators = []
numOscillators = 150
 
for( var i = 0; i < numOscillators; i++ ) {
  oscillators.push( 
    mul( cycle( 100 + i *20 ), 1/numOscillators ) 
  )
}
 
play( add.apply(null, oscillators) )

`
