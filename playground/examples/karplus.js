/****************************
****** Karplus-Strong *******
*****************************
ported and extended from the gen~ example by thecharlie, 5/10/2106
Karplus-Strong is a simple physical model of a plucked
string. A burst of noise (or other sound) feeds very short delay line 
(with feedback) to acheieve the decaying sound. The damping parameter provides
a control to attenuate feedback, while decay affects the overall envelope */

damp   	      = param( .25 ) // lowpass
decay         = .85  // feedback coefficient
speed         = 6000 // in samples
impulseLength = param( 250 )

// loop counting from 0 to rate
clock = counter( 1, 0, speed )

// phase for envelope, reset with each new clock cycle
count = counter(1, clock.wrap, 88200 )

// pick new frequency
frequency = seq( [220,330,440,550,660], [speed] )

// only pass envelope signal through if its greater than 0
envelope = gtp( 
  sub( 1, div( count, impulseLength ) ),
  0
)
 

impulse = mul( noise(7), envelope )
 
feedback = ssd()
 
// feed impulse and feedback into delay; base delay time off frequency
// subtract one sample to account for delay
_delay = delay( add( impulse, feedback.out ), sub(div( samplerate, frequency ),1), 2048 )
 
// create decay for feedback using t60 time based on frequency
decayed = mul( _delay, decay )
 
// damp feedback
damped = memo(mix( decayed, feedback.out, damp ))
feedback.in( damped )
 
play( mul( damped, .25 ) )
