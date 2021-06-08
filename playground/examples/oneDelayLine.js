/* one delay line
 * 
 * by thecharlie - 5/7/2016
 *
 * A small example showing an echo effect with feedback. This example helps lead into
 * the more complicated 'garden of delays' example found in the demo menu.
 *
 */

// use noise with sample-and-hold to output random frequencies with random timing
frequencyControl = sah( noise(), noise(42), .99999 )

// frequencies from 220 - 660 Hz
frequency = add( 220, mul( frequencyControl, 440 ) )
 
// create an oscillator and scale its output
osc = mul( cycle( slide( frequency, 2500, 2500 ) ), .025 )
 
// create a single-sample delay
feedback = ssd()
 
// feed our oscillator and our ssd into a delay with a delay time of 
// 22050 samples (assuming a 44.k sample rate)
echo = delay( add( osc, feedback.out ), samplerate / 2, samplerate )
 
// control the mix between feedback and echo; this also damps the feedback.
mixer = mix( echo, feedback.out, .9 )
 
// record output of mixer to process next sample
feedback.in( mixer )
 
play( mixer )
