/* one delay line
 * 
 * by thecharlie - 5/7/2016
 *
 * A small example showing an echo effect with feedback. This example helps lead into
 * the more complicated 'garden of delays' example found in the demo menu.
 */
{
  'use jsdsp'
  // use noise with sample-and-hold to output random frequencies with random timing
  frequencyControl = sah( noise(), noise(), .99995 )
 
  // frequencies from 220 - 660 Hz
  frequency =  220 + frequencyControl * 440
 
  // create an oscillator and scale its output
  osc = cycle( slide( frequency,1000 ) ) * .025 
 
  // create a single-sample delay
  feedback = ssd()
 
  // feed our oscillator and our ssd into a delay with a delay time of 11025 samples
  echo = delay( osc + feedback.out, 11025, { size: 22050 } )
 
  // control the mix between feedback and echo; this also damps the feedback.
  mixer = mix( echo, feedback.out, .925 )
 
  // record output of mixer to process next sample
  feedback.in( mixer )
  
  play( mixer )
}
