/****************************
****** Karplus-Strong *******
*****************************
ported and extended from the gen~ example by thecharlie, 5/10/2106
Karplus-Strong is a simple physical model of a plucked
string. A burst of noise (or other sound) feeds very short delay line 
(with feedback) to acheieve the decaying sound. The damping parameter provides
a control to attenuate feedback, while decay affects the overall envelope */

frequency     = param( 'frequency', 400, 50, 2000 )
damp   	      = param( 'damping', .6, 0, 1 )
decay         = param( 'decay', .97, .05, 4 )
rate 	      = round( mstosamps( param('rate', 128, 32, 2000 ) ) )
impulseLength = mstosamps( param( 'impulseLength', 5, 1, 40 ) )

// loop counting from 0 to rate
clock = counter( 1, 0, rate )

// phase for envelope, reset with each new clock cycle
count = counter(1, 0, Infinity, clock.wrap )

// pick new frequenc
frequency = sah( add( 100, mul( noise(), 800 ) ), clock.wrap )
  
// only pass envelope signal through if its greater than 0
envelope = gtp( 
  sub( 1, div( count, impulseLength ) ),
  0
)
 
// generate impulse by multiplying selectable input by envelope
impulseInputs = [
  noise(),
  phasor( frequency ),
  train( frequency ),
  cycle( frequency )
]
impulseInputs.push( mul( add( impulseInputs[0], impulseInputs[1] ), .5 ) )
impulseInputs.push( mul( add( impulseInputs[0], impulseInputs[2] ), .5 ) )
impulseInputs.push( mul( add( impulseInputs[0], impulseInputs[3] ), .5 ) )
 
selectedInput = selector( param('input', 0, 0, 6 ), ...impulseInputs )
 
impulse = mul( selectedInput, envelope )
 
feedback = ssd()
 
// feed impulse and feedback into delay; base delay time off frequency
_delay = delay( add( impulse, feedback.out ), div( 44100, frequency ) )
 
// create decay for feedback using t60 time based on frequency
decayed = mul( _delay, t60( mul( decay, frequency ) ) )
 
// damp feedback
damped = mix( decayed, feedback.out, damp )
feedback.in( damped )
 
play( mul( damped, .25 ) ).then( node => {
  // create a GUI using dat.GUI
  gui = new dat.GUI({ width:400 })
  gui.add( node, 'rate', 32, 500 )
  gui.add( node, 'damping', 0,1 )
  gui.add( node, 'decay', .05, 4 )
  gui.add( node, 'input', { 'noise':0, 'saw':1, 'square':2, 'sine':3, 'noise + saw':4, 'noise + square':5, 'noise + sine':6 } )
  gui.add( node, 'impulseLength', 1,40 )

})
