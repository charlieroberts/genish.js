/**********************************************
****** Bamd-limited Saw via FM feedback *******
***********************************************

ported from gibberish by thecharlie 5/15/2016
based on research from : http://scp.web.elte.hu/papers/synthesis1.pdf

In the paper linked above, the author describes how a sine oscillator whose
output is used to modulate itself produces harmonics similar to a saw wave.
With additional filtering, this waveform can create a reasonable version
of a band-limited sawtooth wave.

A scaling factor is applied to the amount of feedback used for modulation.
The scaling factor can in turn be scaled in a range of {0,1} to create a 
low-pass filter effect.
*/

// create some notes to play w/ a little portamento
speed = param( .5 )
frequencies = peek( 
  data([220,330,440,660,880]), 
  phasor( speed  ), 
  'none'
)
slideFreqs = slide( frequencies, 1000 )
 
// expose our feedback scaling factor for control
pseudoFilter = param( 1 )
 
// store output to use as modulation for next sample
lastSample = ssd(0)
 
// determine phase increment and memoize result
w = div( slideFreqs, samplerate() ).memo()
 
// create scaling factor
n = sub( -.5, w )
scaling = mul( mul( 13, pseudoFilter ), pow( n, 5 ) )
 
// calculate dc offset and normalization factors
DC = sub( .376, mul( w, .752 ) )
norm = sub( 1, mul( 2, w ) )
 
// determine phase
phase = accum( w, 0, -1 )
 
// create current sample... from the paper:
// osc = (osc + sin(2*pi*(phase + osc*scaling)))*0.5f;
// MAKE SURE TO MEMO AS THIS VALUE IS USED IN BOTH OUTPUT
// AND FEEDBACK
thisSample = mul( 
  add( 
    lastSample.out, 
    sin( 
      mul( 
        Math.PI * 2, 
        add( phase, mul( lastSample.out, scaling ) )
      )
    )
  ), .5 
).memo()
 
// store sample to use as modulation
lastSample.in( thisSample )
 
// offset and normalize
out = add( mul( 2.5, thisSample), mul( -1.5, lastSample.out ) )
out = add( out, DC )
out = mul( out, norm )
cb  = play( mul( out,.15 ) )
