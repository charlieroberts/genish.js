/* one delay line
 * 
 * by thecharlie - 5/7/2016
 *
 * A small example showing an echo effect with feedback. This example helps lead into
 * the more complicated 'garden of delays' example found in the demo menu.
 *
 */

// use noise with sample-and-hold to output random frequencies with random timing
frequencyControl = sah( add( 220, mul( noise(),880 ) ), noise(), .99995 )
 
// create an oscillator and scale its output
osc = mul( cycle( slide( frequencyControl,1000 ) ), .025 )
 
// create a single-sample delay
feedback = ssd()
 
// feed our oscillator and our ssd into a delay with a delay time of 11025 samples
echo = delay( add( osc, feedback.out ), 11025, { size: 22050 } )
 
// control the mix between feedback and echo; this also damps the feedback.
mixer = feedback.in( mix( echo, feedback.out, .925 ) )
 
play( mixer )
