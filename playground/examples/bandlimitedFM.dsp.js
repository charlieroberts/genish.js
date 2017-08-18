/**********************************************
****** Bamd-limited Saw via FM feedback *******
***********************************************

ported from gibberish by thecharlie 5/15/2016
converted to jdsp on 4/3/2017
based on research from : http://scp.web.elte.hu/papers/synthesis1.pdf

In the paper linked above, the author describes how a sine oscillator whose
output is used to modulate itself produces harmonics similar to a saw wave.
With additional filtering, this waveform can create a reasonable version
of a band-limited sawtooth wave.

A scaling factor is applied to the amount of feedback used for modulation.
The scaling factor can in turn be scaled in a range of {0,1} to create a 
low-pass filter effect; here that effect is controlled via GUI.
*/
{
  'use jsdsp'

  // create some notes to play w/ a little portamento
  frequencies = peek( 
    data([220,330,440,660,880]), 
    phasor( param('speed',.5), 0, { min:0 } ), 
    { interp:'none', min:0 } 
  )
  slideFreqs = slide( frequencies, 1000 )
   
  // expose our feedback scaling factor for control
  pseudoFilter = param( 'filter', 1 )
   
  // store output to use as modulation for next sample
  lastSample = ssd()
   
  // determine phase increment and memoize result
  w = slideFreqs / gen.samplerate 
   
  // create scaling factor
  n = -.5 - w
  scaling = (13 * pseudoFilter) * (n ^ 5)
   
  // calculate dc offset and normalization factors
  DC = .376 - w * .752 
  norm = 1 - ( 2 * w )
   
  // determine phase
  phase = accum( w, 0, { min:-1 })
   
  // create current sample... from the paper:
  // osc = (osc + sin(2*pi*(phase + osc*scaling)))*0.5f;
  thisSample = memo(
    ( lastSample.out + 
    sin( (Math.PI * 2 ) * ( phase + (lastSample.out * scaling) ) ) ) * .5 
  )
   
  // store sample to use as modulation
  lastSample.in( thisSample )
   
  // offset and normalize
  out = ( 2.5 * thisSample) + ( -1.5 * lastSample.out )
  out = out + DC
  out = out * norm
  cb  = play( out * .15 )

}
 
// gui
gui = new dat.GUI({ width: 400 })
gui.add( cb, 'filter', 0, 1 )
gui.add( cb, 'speed', .1,2 )
