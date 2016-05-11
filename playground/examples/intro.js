/*
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
the play() function. For a list of available ugens, see the reference
link in the header of the playground.

Only one graph can be played at a time in this playground. There are a
few different demos to try, accessible via the menu at the top of the
page.


/************************************
******* non-bandlimited saw *********
************************************/

saw = mul( phasor(330), .05 )
play( saw )

/**********************************************
******* sine oscillator (no wavetable) ********
**********************************************/

graph = sin( 
  mul( 
    accum( mul( 440, 1/44100 ) ), 
    Math.PI * 2 
  )
)
 
play( mul( graph,.1 ) )

/************************************
******* amplitude modulation ********
************************************/

// cycle() creates an interpolated signal from 
// an array holding a 1024 samples of a sine wave
// (a wavetable)
sineOsc = cycle( 440 )
 
// create a LFO that modulates between 0-1
// at 4 Hz
amplitudeLFO = add( .1, mul( cycle(4), .1 ) ) 
 
play( 
  mul( sineOsc, amplitudeLFO ) 
)

/************************************
******* frequency modulation ********
************************************/

lfo = mul( cycle(4), .5 )
ramp = mul( phasor(.1), 200 )
rampedLFO = mul( lfo, ramp )
 
osc = cycle( add( 440, rampedLFO ) )
 
out = mul( osc, .1 )
 
play( out )

/************************************************************
****** random oscillator frequency w/ sample & hold *********
************************************************************/

// create random signal between 220 and 440
random220_440 = add( 220, mul( noise(), 220 ) )
 
// create a sample-and-hold that will sample our random frequency
// whenever another random signal (in the range of 0-1) crosses a
// high threshold. This will create a periodically changing frequency.
frequency = sah( random220_440, noise(), .99995 )
 
// sine oscillator
play( cycle( frequency ) )

/*****************************************************************
******* (LOUD + noisy) frequency modulation using feedback *******
*****************************************************************/

// ssd is equivalent to history in gen~, a single-sample delay
// (the history name is used by the window object in js...)
// an argument to ssd sets its initial value
sampler = ssd(.001) 
 
// generate a sawtooth wave using our last sample output to
// scale its frequency
out = phasor( mul( 1000, sampler.out ) )

// record the output to process the next sample
sampler.in( out )
 
play( mul( out, .05 ) )

/******************************************************************
******* using data with peek (default linear interpolation) *******
*******************************************************************/

// create a data set of four values to loop through
d = data( [440,880,220,330] )
 
// interpolate through data set over ten seocnds 
freq = peek( d, phasor(.1) )
 
out = mul( cycle( freq ), .1 )
 
play( out )

/*****************************************************
******* using data w/ peek (no interpolation)) *******
*****************************************************/

d = data( [220,330,440,880] )
 
// create a ramp from 0-4 over 10 seconds
acceleration = mul( phasor(.1), 4 )
 
// accelerate looking through our graph; don't use interpolation
freq = peek( d, phasor( acceleration ), { interp:'none' } ) 
 
out = mul( cycle( freq ), .1 )
 
play( out )

/*******************************************************
****** random sample playback w/ sample & hold *********
*******************************************************/

// data lets us read in a file. The then() method of the data object
// lets us define a function to be executed when loading is finished.
d = data( './resources/audiofiles/amen.wav' ).then( ()=> {
 
  // get a randomized playback rate via sah. Tne value will be used
  // to drive a phasor index into peek; this means the value will be
  // in Hz. That is, a value of .25 means the entire sample,
  // irrespective of length, will be played in four seconds.
  noisesig = sah( 
    mul( noise(), .25 ),
    noise(),
    .99995
  )
  
  play( peek( d, phasor( noisesig ) ) )
})

/***********************************************
******* notes w/ ping-pong echo ****************
***********************************************/

// frequencing to loop through
frequencies = data( [220,330,440,880] )
 
// get non-interpolating signal for frequency
freqSignal = peek( frequencies, phasor( .5 ), { interp:'none' } ) 
 
// create a decay envelope
envelope = sub( 1, phasor(2) )
 
// multiply sine osc by envelope
notes = mul( cycle( freqSignal ), envelope )
 
// ... turn notes down
gain = mul( notes, .1 )
 
// create 1/4 second echo
echo = delay( gain, 11025, { size: 22050 })
 
// passing an array to play creates a stereo signal
// notes on the left, echos on the right
play( [gain, echo] )

/****** 50 sine oscillators (will break in Firefox) *******/
 
oscillators = []
numOscillators = 50
 
for( var i = 0; i < numOscillators; i++ ) {
  oscillators.push( 
    mul( cycle( 110 + i * 55), .1/numOscillators ) 
  )
}
 
play( add( ...oscillators ) )
