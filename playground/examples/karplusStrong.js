/****************************
****** Karplus-Strong *******
*****************************

ported from the gen~ example by thecharlie, 5/10/2106

Karplus-Strong is a simple physical model of a plucked
string. A burst of noise feeds very short delay line (with feedback) 
to acheieve the decaying sound. The damping parameter provides
a control to attenuate feedback, while decay affects the overall envelope */

frequency = param( 'frequency', 400 )
damp   	  = param( 'damping', .6 )
decay  	  = param( 'decay', .97 )
impulseLengthIn = param( 'impulseLength' )
  
// create a counter and store a reference so that we can reset its value
// external to the callback (from a setInterval() callback)
count = counter()
 
// only pass envelope signal through if its greater than 0
envelope = gtp( 
  sub( 1, div( count, mstosamps(5) ) ),
  0
)
 
// generate impulse by multiplying noise by envelop
impulse = mul( noise(), envelope )
 
feedback = ssd()
 
// feed impulse and feedback into delay; base delay time off frequency
d = delay( add( impulse, feedback.out ), div( 44100, frequency ) )
 
// create decay for feedback using t60 time based on frequency
decayed = mul( d, t60( mul( decay, frequency ) ) )
 
// damp feedback
damped = feedback.in(
  mix( decayed, feedback.out, damp )
)
 
cb = play( damped )
 
// create a scheduler that picks a random frequency and 
// resets counter value to 0 to trigger envelope.
let interval = setInterval( ()=> {
  cb.frequency = Math.floor( 220 + Math.random() * 440 )
  count.value = 0
}, 125 )
 
// create a GUI using dat.GUI
gui = new dat.GUI()
gui.add( cb, 'damping', 0,1 )
gui.add( cb, 'decay', 0, 4 )
 
// add a callback to clear (the function that happens when you press Ctrl+.)
// so that our scheduler is also deleted.
utilities.clear.callbacks.push( ()=> clearInterval( interval ) )
